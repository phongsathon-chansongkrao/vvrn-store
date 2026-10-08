import { Router } from "express";
import { getPool, sql, isDuplicateKey } from "../db.js";
import { ah, HttpError } from "../lib/http.js";
import { loadProducts } from "../lib/products.js";
import { emailSchema, reviewSchema } from "../lib/schemas.js";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

export const productsRouter = Router();

async function productIdBySlug(slug: string): Promise<number> {
  const pool = await getPool();
  const r = await pool.request().input("slug", sql.VarChar(80), slug)
    .query(`SELECT Id FROM dbo.Products WHERE Slug = @slug AND IsActive = 1`);
  if (!r.recordset[0]) throw new HttpError(404, "Product not found.");
  return r.recordset[0].Id;
}

productsRouter.get("/", ah(async (req, res) => {
  res.json(await loadProducts(req.user?.id));
}));

productsRouter.get("/:slug", ah(async (req, res) => {
  const [p] = await loadProducts(req.user?.id, req.params.slug);
  if (!p) throw new HttpError(404, "Product not found.");
  res.json(p);
}));

/* ---------- Reviews ---------- */
productsRouter.get("/:slug/reviews", ah(async (req, res) => {
  const productId = await productIdBySlug(req.params.slug);
  const pool = await getPool();
  const r = await pool.request().input("pid", sql.Int, productId).input("uid", sql.Int, req.user?.id ?? null).query(`
    SELECT Id, AuthorName, Rating, Comment, Color, Size, CreatedAt,
           CASE WHEN @uid IS NOT NULL AND UserId = @uid THEN 1 ELSE 0 END AS Mine,
           CASE WHEN UserId IS NOT NULL THEN 1 ELSE 0 END AS Verified
    FROM dbo.Reviews WHERE ProductId = @pid ORDER BY CreatedAt DESC, Id DESC`);
  res.json(r.recordset.map(x => ({
    id: x.Id, name: x.AuthorName, rating: x.Rating, text: x.Comment, color: x.Color, size: x.Size,
    date: new Date(x.CreatedAt).toISOString(), mine: !!x.Mine,
    // Only reviews written by a logged-in customer who bought the product. Sample reviews (UserId NULL) are not.
    verified: !!x.Verified,
  })));
}));

productsRouter.post("/:slug/reviews", requireAuth, ah(async (req, res) => {
  const { rating, text } = reviewSchema.parse(req.body);
  const productId = await productIdBySlug(req.params.slug);
  const pool = await getPool();
  // Only customers who bought the product may review it
  const bought = (await pool.request().input("pid", sql.Int, productId).input("uid", sql.Int, req.user!.id).query(`
    SELECT TOP 1 i.Color, i.Size FROM dbo.OrderItems i JOIN dbo.Orders o ON o.Id = i.OrderId
    WHERE o.UserId = @uid AND i.ProductId = @pid AND o.Status <> 'cancelled'
    ORDER BY o.CreatedAt DESC`)).recordset[0];
  if (!bought) throw new HttpError(403, "Only customers who bought this item can review it.");
  try {
    await pool.request()
      .input("pid", sql.Int, productId).input("uid", sql.Int, req.user!.id)
      .input("name", sql.NVarChar(100), req.user!.name).input("rating", sql.TinyInt, rating)
      .input("text", sql.NVarChar(1000), text).input("color", sql.VarChar(30), bought.Color).input("size", sql.VarChar(20), bought.Size)
      .query(`INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size)
              VALUES (@pid, @uid, @name, @rating, @text, @color, @size)`);
  } catch (err) {
    if (isDuplicateKey(err)) throw new HttpError(409, "You've already reviewed this item.");
    throw err;
  }
  res.status(201).json({ ok: true });
}));

/* ---------- Likes ---------- */
async function likeState(productId: number, userId: number) {
  const pool = await getPool();
  const r = await pool.request().input("pid", sql.Int, productId).input("uid", sql.Int, userId).query(`
    SELECT (SELECT COUNT(*) FROM dbo.Likes WHERE ProductId = @pid) AS LikeCount,
           CASE WHEN EXISTS (SELECT 1 FROM dbo.Likes WHERE ProductId = @pid AND UserId = @uid) THEN 1 ELSE 0 END AS Liked`);
  return { likeCount: r.recordset[0].LikeCount as number, liked: !!r.recordset[0].Liked };
}

productsRouter.post("/:slug/like", requireAuth, ah(async (req, res) => {
  const productId = await productIdBySlug(req.params.slug);
  const pool = await getPool();
  await pool.request().input("pid", sql.Int, productId).input("uid", sql.Int, req.user!.id).query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.Likes WHERE UserId = @uid AND ProductId = @pid)
      INSERT INTO dbo.Likes (UserId, ProductId) VALUES (@uid, @pid);`).catch(err => {
    if (!isDuplicateKey(err)) throw err; // double-click race: already liked
  });
  res.json(await likeState(productId, req.user!.id));
}));

productsRouter.delete("/:slug/like", requireAuth, ah(async (req, res) => {
  const productId = await productIdBySlug(req.params.slug);
  const pool = await getPool();
  await pool.request().input("pid", sql.Int, productId).input("uid", sql.Int, req.user!.id)
    .query(`DELETE FROM dbo.Likes WHERE UserId = @uid AND ProductId = @pid`);
  res.json(await likeState(productId, req.user!.id));
}));

/* ---------- "Notify me when it's back" ---------- */
const notifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many requests. Wait a few minutes and try again." } });
const notifySchema = z.object({ color: z.string().max(30), size: z.string().max(20), email: emailSchema });

/** Leave an email on a sold-out color/size. Works for guests too. Asking twice is fine (no duplicate). */
productsRouter.post("/:slug/notify", notifyLimiter, ah(async (req, res) => {
  const { color, size, email } = notifySchema.parse(req.body);
  const productId = await productIdBySlug(req.params.slug);
  const pool = await getPool();
  const v = (await pool.request().input("pid", sql.Int, productId).input("color", sql.VarChar(30), color).input("size", sql.VarChar(20), size)
    .query("SELECT Id, Stock FROM dbo.ProductVariants WHERE ProductId = @pid AND Color = @color AND Size = @size")).recordset[0];
  if (!v) throw new HttpError(404, "That color and size doesn't exist.");
  if (v.Stock > 0) throw new HttpError(409, "Good news: it's in stock right now. Add it to your cart.");
  try {
    await pool.request().input("vid", sql.Int, v.Id).input("email", sql.NVarChar(255), email).input("uid", sql.Int, req.user?.id ?? null)
      .query("INSERT INTO dbo.StockAlerts (VariantId, Email, UserId) VALUES (@vid, @email, @uid)");
  } catch (err) {
    if ((err as { number?: number }).number === 208) throw new HttpError(503, "Back-in-stock alerts aren't switched on yet. Try again later.");
    if (!isDuplicateKey(err)) throw err; // already waiting: same answer
  }
  res.status(201).json({ ok: true });
}));
