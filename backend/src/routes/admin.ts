import { Router } from "express";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import { getPool, isDuplicateKey, likePattern, sql } from "../db.js";
import { ah, HttpError } from "../lib/http.js";
import { loadOrders } from "../lib/orders.js";
import { NEW_DAYS } from "../lib/products.js";
import { promoBarSchema, savePromoBar } from "../lib/settings.js";
import { deleteProductImageFile, imageUpload, loadImages, MAX_IMAGES_PER_PRODUCT, saveProductImage } from "../lib/images.js";
import { deliverNow, deliverSoon, kindForStatus, queueOrderEmail, queueStockAlerts } from "../lib/mail.js";
import {
  addVariantsSchema, adminStatusSchema, newProductSchema, ORDER_STATUSES, productPatchSchema, roleSchema, SIZES, stockSchema, STATUS_LABELS,
} from "../lib/schemas.js";
import { requireRole } from "../middleware/auth.js";
import { SLIP_DIR } from "./orders.js";

/**
 * Back-office API for the #/admin page.
 * staff: orders, slips, status updates (not cancel), stock counts.
 * admin: everything staff can do + cancel orders, prices, show/hide products, user roles.
 */
export const adminRouter = Router();
adminRouter.use(requireRole("staff", "admin"));
const adminOnly = requireRole("admin");

/* ---------- Orders ---------- */
adminRouter.get("/orders", ah(async (req, res) => {
  const status = String(req.query.status ?? "");
  const q = String(req.query.q ?? "").trim().slice(0, 100);
  res.json(await loadOrders({
    all: true, staff: true, limit: 200,
    status: (ORDER_STATUSES as readonly string[]).includes(status) ? status : undefined,
    q: q || undefined,
  }));
}));

// Orders only move forward along this path. Cancelling is separate.
const FLOW = ["placed", "checking_slip", "paid", "packed", "shipped", "delivered"];

adminRouter.post("/orders/:no/status", ah(async (req, res) => {
  const { status, trackingNo, note } = adminStatusSchema.parse(req.body);
  if (status === "shipped" && !trackingNo) throw new HttpError(400, "Add a tracking number when marking an order as shipped.");
  if (status === "cancelled" && req.user!.role !== "admin") throw new HttpError(403, "Only an admin can cancel orders.");

  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  let mailId: number;
  let alertMailIds: number[] = [];
  await tx.begin();
  try {
    const o = (await new sql.Request(tx).input("no", sql.VarChar(20), req.params.no)
      .query(`SELECT Id, Status FROM dbo.Orders WITH (UPDLOCK) WHERE OrderNo = @no`)).recordset[0];
    if (!o) throw new HttpError(404, "Order not found.");
    if (o.Status === "cancelled") throw new HttpError(409, "This order is already cancelled.");
    if (o.Status === "delivered") throw new HttpError(409, "This order was already delivered.");

    if (status === "cancelled") {
      if (FLOW.indexOf(o.Status) >= FLOW.indexOf("shipped")) throw new HttpError(409, "This order has already shipped, so it can't be cancelled.");
      // Put the units back on the shelf
      await new sql.Request(tx).input("oid", sql.Int, o.Id).query(`
        UPDATE v SET v.Stock = v.Stock + i.Qty
        FROM dbo.ProductVariants v JOIN dbo.OrderItems i ON i.VariantId = v.Id
        WHERE i.OrderId = @oid;
        -- Give a one-per-account discount code back so the customer can use it again
        IF OBJECT_ID('dbo.DiscountRedemptions', 'U') IS NOT NULL
          DELETE FROM dbo.DiscountRedemptions WHERE OrderId = @oid;`);
    } else if (FLOW.indexOf(status) <= FLOW.indexOf(o.Status)) {
      throw new HttpError(409, `This order is already "${STATUS_LABELS[o.Status] ?? o.Status}". Refresh to see the latest.`);
    }

    await new sql.Request(tx)
      .input("oid", sql.Int, o.Id).input("status", sql.VarChar(20), status)
      .input("tracking", sql.VarChar(40), trackingNo || null).input("note", sql.NVarChar(200), note || null)
      .input("by", sql.Int, req.user!.id)
      .query(`UPDATE dbo.Orders SET Status = @status WHERE Id = @oid;
              INSERT INTO dbo.OrderEvents (OrderId, Status, TrackingNo, Note, ChangedBy) VALUES (@oid, @status, @tracking, @note, @by);`);
    mailId = await queueOrderEmail(new sql.Request(tx), o.Id, status, req.user!.id);
    if (status === "cancelled") {
      // Units went back on the shelf: a sold-out size may be available again
      const vids = (await new sql.Request(tx).input("oid", sql.Int, o.Id)
        .query(`SELECT VariantId FROM dbo.OrderItems WHERE OrderId = @oid`)).recordset.map(v => v.VariantId as number);
      alertMailIds = await queueStockAlerts(new sql.Request(tx), vids);
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
  deliverSoon(alertMailIds);
  const email = await deliverNow(mailId);
  const [order] = await loadOrders({ orderNo: req.params.no, staff: true });
  res.json({ ...order, email });
}));

/** Email the customer about the order's current status again (e.g. older orders, or a changed address). */
adminRouter.post("/orders/:no/email", ah(async (req, res) => {
  const pool = await getPool();
  const o = (await pool.request().input("no", sql.VarChar(20), req.params.no)
    .query(`SELECT Id, Status FROM dbo.Orders WHERE OrderNo = @no`)).recordset[0];
  if (!o) throw new HttpError(404, "Order not found.");
  const email = await deliverNow(await queueOrderEmail(pool.request(), o.Id, kindForStatus(o.Status), req.user!.id));
  const [order] = await loadOrders({ orderNo: req.params.no, staff: true });
  res.json({ ...order, email });
}));

/** Send one email from the log again. Creates a new outbox row so the history stays honest. */
adminRouter.post("/emails/:id/resend", ah(async (req, res) => {
  const pool = await getPool();
  const m = (await pool.request().input("id", sql.Int, Number(req.params.id) || 0).query(`
    SELECT e.OrderId, e.Kind, o.OrderNo FROM dbo.EmailOutbox e JOIN dbo.Orders o ON o.Id = e.OrderId WHERE e.Id = @id`)).recordset[0];
  if (!m) throw new HttpError(404, "Email not found.");
  const email = await deliverNow(await queueOrderEmail(pool.request(), m.OrderId, m.Kind, req.user!.id));
  const [order] = await loadOrders({ orderNo: m.OrderNo, staff: true });
  res.json({ ...order, email });
}));

// Only these types are ever sent inline. Anything else is forced to download, so an uploaded
// file can never run as a web page on our domain.
const INLINE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf",
};

/** The transfer slip of an order. ?inline=1 shows it in the browser (images/PDF), otherwise downloads it. */
adminRouter.get("/orders/:no/slip", ah(async (req, res) => {
  const pool = await getPool();
  const o = (await pool.request().input("no", sql.VarChar(20), req.params.no)
    .query(`SELECT SlipPath, SlipOriginalName FROM dbo.Orders WHERE OrderNo = @no`)).recordset[0];
  if (!o?.SlipPath) throw new HttpError(404, "This order has no slip.");
  const file = path.join(SLIP_DIR, path.basename(o.SlipPath));
  if (!fs.existsSync(file)) throw new HttpError(404, "Slip file is missing on the server.");

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
  res.setHeader("Cache-Control", "private, no-store");
  const type = INLINE_TYPES[path.extname(file).toLowerCase()];
  if (req.query.inline && type) {
    res.type(type);
    res.setHeader("Content-Disposition", "inline");
    return res.sendFile(file);
  }
  res.download(file, o.SlipOriginalName || path.basename(file));
}));

/* ---------- Products & stock ---------- */
/** All products (hidden ones too) with every variant, or just one by slug. */
async function loadAdminProducts(slug?: string) {
  const pool = await getPool();
  const req = () => pool.request().input("slug", sql.VarChar(80), slug ?? null);
  const products = (await req().query(`
    SELECT Id, Slug, Name, Description, Type, Category, Guide, Price, CompareAtPrice, IsActive, IsLimited, CreatedAt,
           CASE WHEN CreatedAt > DATEADD(DAY, -${NEW_DAYS}, SYSUTCDATETIME()) THEN 1 ELSE 0 END AS IsNew
    FROM dbo.Products WHERE @slug IS NULL OR Slug = @slug ORDER BY CreatedAt DESC, Id DESC`)).recordset;
  const variants = (await req().query(`
    SELECT v.Id, v.ProductId, v.Color, v.Size, v.Stock FROM dbo.ProductVariants v JOIN dbo.Products p ON p.Id = v.ProductId
    WHERE @slug IS NULL OR p.Slug = @slug ORDER BY v.ProductId, v.ColorOrder, v.SizeOrder`)).recordset;
  // How many people are waiting for each size ("Notify me"). Empty until 08_stock_alerts.sql has been run.
  const waiting = new Map<number, number>(
    (await req().query(`
      IF OBJECT_ID('dbo.StockAlerts', 'U') IS NOT NULL
        SELECT a.VariantId, COUNT(*) AS N FROM dbo.StockAlerts a
        JOIN dbo.ProductVariants v ON v.Id = a.VariantId JOIN dbo.Products p ON p.Id = v.ProductId
        WHERE a.NotifiedAt IS NULL AND (@slug IS NULL OR p.Slug = @slug) GROUP BY a.VariantId`)).recordset
      ?.map(r => [r.VariantId as number, r.N as number]) ?? []
  );
  const images = await loadImages(products.map(p => p.Id as number));
  return products.map(p => ({
    slug: p.Slug, name: p.Name, description: p.Description, type: p.Type, category: p.Category, guide: p.Guide,
    price: Number(p.Price), compareAt: p.CompareAtPrice == null ? null : Number(p.CompareAtPrice), isActive: !!p.IsActive,
    isLimited: !!p.IsLimited, isNew: !!p.IsNew, createdAt: new Date(p.CreatedAt).toISOString(),
    images: images.get(p.Id) ?? [],
    variants: variants.filter(v => v.ProductId === p.Id).map(v => ({
      id: v.Id, color: v.Color, size: v.Size, stock: v.Stock, waiting: waiting.get(v.Id) ?? 0,
    })),
  }));
}

adminRouter.get("/products", ah(async (_req, res) => {
  res.json(await loadAdminProducts());
}));

/** New product, hidden until an admin presses Show. One variant per color × size. */
adminRouter.post("/products", adminOnly, ah(async (req, res) => {
  const d = newProductSchema.parse(req.body);
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const ins = await new sql.Request(tx)
      .input("slug", sql.VarChar(80), d.slug).input("name", sql.NVarChar(120), d.name)
      .input("type", sql.VarChar(20), d.type).input("cat", sql.VarChar(30), d.category).input("guide", sql.VarChar(20), d.guide)
      .input("price", sql.Decimal(10, 2), d.price).input("cmp", sql.Decimal(10, 2), d.compareAt)
      .input("desc", sql.NVarChar(1000), d.description).input("limited", sql.Bit, d.isLimited)
      .query(`INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, IsActive)
              OUTPUT INSERTED.Id
              SELECT @slug, @name, @type, @cat, @guide, @price, @cmp, @desc, @limited,
                     ISNULL((SELECT MIN(SortOrder) FROM dbo.Products), 10) - 10, 0`); // CreatedAt (default now) drives the shop order + NEW badge
    const productId: number = ins.recordset[0].Id;
    for (const [ci, color] of d.colors.entries()) {
      for (const size of d.sizes) {
        await new sql.Request(tx)
          .input("pid", sql.Int, productId).input("color", sql.VarChar(30), color).input("size", sql.VarChar(20), size)
          .input("co", sql.Int, ci).input("so", sql.Int, SIZES.indexOf(size)).input("stock", sql.Int, d.stock[`${color}|${size}`] ?? 0)
          .query(`INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock)
                  VALUES (@pid, @color, @size, @co, @so, @stock)`);
      }
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    if (isDuplicateKey(err)) throw new HttpError(409, `The slug "${d.slug}" is already used by another product. Pick a different one.`);
    throw err;
  }
  const [p] = await loadAdminProducts(d.slug);
  res.status(201).json(p);
}));

/** Add colors and/or sizes to a product. Fills in every missing color × size with 0 stock. */
adminRouter.post("/products/:slug/variants", adminOnly, ah(async (req, res) => {
  const add = addVariantsSchema.parse(req.body);
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const p = (await new sql.Request(tx).input("slug", sql.VarChar(80), req.params.slug)
      .query(`SELECT Id FROM dbo.Products WITH (UPDLOCK) WHERE Slug = @slug`)).recordset[0];
    if (!p) throw new HttpError(404, "Product not found.");
    const existing = (await new sql.Request(tx).input("pid", sql.Int, p.Id)
      .query(`SELECT Color, Size, ColorOrder FROM dbo.ProductVariants WHERE ProductId = @pid`)).recordset;

    const colorOrder = new Map<string, number>();
    for (const v of existing) colorOrder.set(v.Color, v.ColorOrder);
    let nextOrder = Math.max(-1, ...colorOrder.values()) + 1;
    for (const c of add.colors) if (!colorOrder.has(c)) colorOrder.set(c, nextOrder++);
    const sizes = [...new Set([...existing.map(v => v.Size as string), ...add.sizes])];
    const have = new Set(existing.map(v => `${v.Color}|${v.Size}`));

    let created = 0;
    for (const [color, co] of colorOrder) {
      for (const size of sizes) {
        if (have.has(`${color}|${size}`)) continue;
        await new sql.Request(tx)
          .input("pid", sql.Int, p.Id).input("color", sql.VarChar(30), color).input("size", sql.VarChar(20), size)
          .input("co", sql.Int, co).input("so", sql.Int, Math.max(0, SIZES.indexOf(size as (typeof SIZES)[number])))
          .query(`INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock)
                  VALUES (@pid, @color, @size, @co, @so, 0)`);
        created++;
      }
    }
    if (!created) throw new HttpError(400, "This product already has that color and size.");
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
  const [p] = await loadAdminProducts(req.params.slug);
  res.status(201).json(p);
}));

adminRouter.patch("/variants/:id", ah(async (req, res) => {
  const { stock, expected } = stockSchema.parse(req.body);
  const id = Number(req.params.id) || 0;
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  let mailIds: number[] = [];
  let now: { Stock: number } | undefined;
  await tx.begin();
  try {
    const r = await new sql.Request(tx).input("id", sql.Int, id)
      .input("stock", sql.Int, stock).input("expected", sql.Int, expected)
      .query(`UPDATE dbo.ProductVariants SET Stock = @stock OUTPUT INSERTED.Stock WHERE Id = @id AND Stock = @expected;
              SELECT Stock FROM dbo.ProductVariants WHERE Id = @id;`);
    now = (r.recordsets as sql.IRecordSet<{ Stock: number }>[])[1]?.[0];
    if (!now) throw new HttpError(404, "Variant not found.");
    if (r.rowsAffected[0] !== 1) throw new HttpError(409, `Stock changed to ${now.Stock} while you were editing (someone just bought one). Check and save again.`);
    // Back from 0? Email everyone who asked to be notified (saved with the stock change)
    if (stock > 0) mailIds = await queueStockAlerts(new sql.Request(tx), [id]);
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
  deliverSoon(mailIds);
  res.json({ id, stock: now!.Stock, notified: mailIds.length });
}));

adminRouter.patch("/products/:slug", adminOnly, ah(async (req, res) => {
  const patch = productPatchSchema.parse(req.body);
  const pool = await getPool();
  const cur = (await pool.request().input("slug", sql.VarChar(80), req.params.slug)
    .query(`SELECT Id, Name, Description, IsLimited, Price, CompareAtPrice, IsActive FROM dbo.Products WHERE Slug = @slug`)).recordset[0];
  if (!cur) throw new HttpError(404, "Product not found.");
  const price = patch.price ?? Number(cur.Price);
  const compareAt = patch.compareAt !== undefined ? patch.compareAt : cur.CompareAtPrice == null ? null : Number(cur.CompareAtPrice);
  const isActive = patch.isActive ?? !!cur.IsActive;
  const name = patch.name ?? cur.Name;
  const description = patch.description ?? cur.Description;
  const isLimited = patch.isLimited ?? !!cur.IsLimited;
  if (compareAt != null && compareAt <= price) throw new HttpError(400, "The original price must be higher than the sale price. Leave it empty if the item isn't on sale.");

  const tx = new sql.Transaction(pool);
  let mailIds: number[] = [];
  await tx.begin();
  try {
    await new sql.Request(tx).input("slug", sql.VarChar(80), req.params.slug)
      .input("price", sql.Decimal(10, 2), price).input("cmp", sql.Decimal(10, 2), compareAt).input("active", sql.Bit, isActive)
      .input("name", sql.NVarChar(120), name).input("desc", sql.NVarChar(1000), description).input("limited", sql.Bit, isLimited)
      .query(`UPDATE dbo.Products SET Price = @price, CompareAtPrice = @cmp, IsActive = @active,
                Name = @name, Description = @desc, IsLimited = @limited
              WHERE Slug = @slug`);
    // Shown again: people waiting on sizes that have stock get their email now
    if (isActive && !cur.IsActive) {
      const vids = (await new sql.Request(tx).input("pid", sql.Int, cur.Id)
        .query(`SELECT Id FROM dbo.ProductVariants WHERE ProductId = @pid`)).recordset.map(v => v.Id as number);
      mailIds = await queueStockAlerts(new sql.Request(tx), vids);
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
  deliverSoon(mailIds);
  res.json({ slug: req.params.slug, price, compareAt, isActive, name, description, isLimited });
}));

/* ---------- Product photos (admin only) ---------- */

/** Upload one photo. Form fields: image (file), color ("" = every color). New photos go last. */
adminRouter.post("/products/:slug/images", adminOnly, imageUpload.single("image"), ah(async (req, res) => {
  const pool = await getPool();
  const p = (await pool.request().input("slug", sql.VarChar(80), req.params.slug)
    .query(`SELECT Id, (SELECT COUNT(*) FROM dbo.ProductImages i WHERE i.ProductId = p.Id) AS N FROM dbo.Products p WHERE Slug = @slug`)).recordset[0];
  if (!p) throw new HttpError(404, "Product not found.");
  if (p.N >= MAX_IMAGES_PER_PRODUCT) throw new HttpError(400, `A product can have up to ${MAX_IMAGES_PER_PRODUCT} photos. Delete one first.`);

  const color = String(req.body?.color ?? "").trim() || null;
  if (color) {
    const ok = (await pool.request().input("pid", sql.Int, p.Id).input("color", sql.VarChar(30), color)
      .query(`SELECT 1 AS ok FROM dbo.ProductVariants WHERE ProductId = @pid AND Color = @color`)).recordset[0];
    if (!ok) throw new HttpError(400, `This product doesn't come in ${color}.`);
  }

  const file = saveProductImage(req.file);
  try {
    await pool.request().input("pid", sql.Int, p.Id).input("color", sql.VarChar(30), color).input("file", sql.VarChar(80), file)
      .query(`INSERT INTO dbo.ProductImages (ProductId, Color, FileName, SortOrder)
              SELECT @pid, @color, @file, ISNULL(MAX(SortOrder), 0) + 1 FROM dbo.ProductImages WHERE ProductId = @pid`);
  } catch (err) {
    deleteProductImageFile(file);
    throw err;
  }
  const [out] = await loadAdminProducts(req.params.slug);
  res.status(201).json(out);
}));

/** Make a photo the main one (first) for its product. */
adminRouter.post("/images/:id/first", adminOnly, ah(async (req, res) => {
  const pool = await getPool();
  const r = (await pool.request().input("id", sql.Int, Number(req.params.id) || 0).query(`
    UPDATE i SET SortOrder = (SELECT MIN(SortOrder) FROM dbo.ProductImages x WHERE x.ProductId = i.ProductId) - 1
    OUTPUT p.Slug
    FROM dbo.ProductImages i JOIN dbo.Products p ON p.Id = i.ProductId
    WHERE i.Id = @id`)).recordset[0];
  if (!r) throw new HttpError(404, "Photo not found.");
  const [out] = await loadAdminProducts(r.Slug);
  res.json(out);
}));

adminRouter.delete("/images/:id", adminOnly, ah(async (req, res) => {
  const pool = await getPool();
  const r = (await pool.request().input("id", sql.Int, Number(req.params.id) || 0).query(`
    DELETE i OUTPUT DELETED.FileName, p.Slug
    FROM dbo.ProductImages i JOIN dbo.Products p ON p.Id = i.ProductId
    WHERE i.Id = @id`)).recordset[0];
  if (!r) throw new HttpError(404, "Photo not found.");
  deleteProductImageFile(r.FileName);
  const [out] = await loadAdminProducts(r.Slug);
  res.json(out);
}));

/* ---------- Discount codes (admin only) ---------- */

const newCodeSchema = z.object({
  code: z.string().trim().toUpperCase().min(3, "Codes are at least 3 characters.").max(30)
    .regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, - or _ only, e.g. VVRN10."),
  percentOff: z.number({ invalid_type_error: "Enter a percent." }).int("Use a whole number.").min(1).max(90, "Max 90% off."),
  onePerAccount: z.boolean(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

adminRouter.get("/discounts", adminOnly, ah(async (_req, res) => {
  const pool = await getPool();
  const rows = (await pool.request().query(`
    SELECT c.Id, c.Code, c.PercentOff, c.OnePerAccount, c.IsActive, c.ExpiresAt, c.CreatedAt,
           (SELECT COUNT(*) FROM dbo.Orders o WHERE o.DiscountCodeId = c.Id AND o.Status <> 'cancelled') AS Uses,
           (SELECT ISNULL(SUM(o.DiscountAmount), 0) FROM dbo.Orders o WHERE o.DiscountCodeId = c.Id AND o.Status <> 'cancelled') AS GivenAway
    FROM dbo.DiscountCodes c ORDER BY c.IsActive DESC, c.CreatedAt DESC`)).recordset;
  res.json(rows.map(r => ({
    id: r.Id, code: r.Code, percentOff: r.PercentOff, onePerAccount: !!r.OnePerAccount, isActive: !!r.IsActive,
    expiresAt: r.ExpiresAt ? new Date(r.ExpiresAt).toISOString() : null, createdAt: new Date(r.CreatedAt).toISOString(),
    uses: r.Uses, givenAway: Number(r.GivenAway),
  })));
}));

adminRouter.post("/discounts", adminOnly, ah(async (req, res) => {
  const d = newCodeSchema.parse(req.body);
  const pool = await getPool();
  try {
    await pool.request()
      .input("code", sql.VarChar(30), d.code).input("pct", sql.TinyInt, d.percentOff).input("one", sql.Bit, d.onePerAccount)
      .input("exp", sql.DateTime2(0), d.expiresAt ? new Date(d.expiresAt) : null).input("by", sql.Int, req.user!.id)
      .query(`INSERT INTO dbo.DiscountCodes (Code, PercentOff, OnePerAccount, ExpiresAt, CreatedBy) VALUES (@code, @pct, @one, @exp, @by)`);
  } catch (err) {
    if (isDuplicateKey(err)) throw new HttpError(409, `The code ${d.code} already exists.`);
    throw err;
  }
  res.status(201).json({ ok: true });
}));

/** Turn a code on or off. Codes are never deleted, so old orders keep showing which code they used. */
adminRouter.patch("/discounts/:id", adminOnly, ah(async (req, res) => {
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
  const pool = await getPool();
  const r = await pool.request().input("id", sql.Int, Number(req.params.id) || 0).input("a", sql.Bit, isActive)
    .query(`UPDATE dbo.DiscountCodes SET IsActive = @a WHERE Id = @id`);
  if (r.rowsAffected[0] !== 1) throw new HttpError(404, "Code not found.");
  res.json({ ok: true });
}));

/* ---------- Site settings (admin only) ---------- */

adminRouter.put("/settings/promo-bar", adminOnly, ah(async (req, res) => {
  const value = promoBarSchema.parse(req.body);
  await savePromoBar(value, req.user!.id);
  res.json({ promoBar: value });
}));

/* ---------- Users & roles (admin only) ---------- */
adminRouter.get("/users", adminOnly, ah(async (req, res) => {
  const q = String(req.query.q ?? "").trim().slice(0, 100);
  const pool = await getPool();
  const r = await pool.request().input("q", sql.NVarChar(260), q ? likePattern(q) : null).query(`
    SELECT TOP (200) u.Id, u.Name, u.Email, u.Role, u.CreatedAt,
           (SELECT COUNT(*) FROM dbo.Orders o WHERE o.UserId = u.Id) AS OrderCount
    FROM dbo.Users u
    WHERE @q IS NULL OR u.Name LIKE @q OR u.Email LIKE @q
    ORDER BY CASE u.Role WHEN 'admin' THEN 0 WHEN 'staff' THEN 1 ELSE 2 END, u.CreatedAt DESC`);
  res.json(r.recordset.map(u => ({
    id: u.Id, name: u.Name, email: u.Email, role: u.Role, createdAt: new Date(u.CreatedAt).toISOString(), orderCount: u.OrderCount,
  })));
}));

adminRouter.patch("/users/:id/role", adminOnly, ah(async (req, res) => {
  const { role } = roleSchema.parse(req.body);
  const id = Number(req.params.id) || 0;
  if (id === req.user!.id) throw new HttpError(400, "You can't change your own role. Ask another admin.");
  const pool = await getPool();
  const r = await pool.request().input("id", sql.Int, id).input("role", sql.VarChar(10), role)
    .query(`UPDATE dbo.Users SET Role = @role WHERE Id = @id`);
  if (r.rowsAffected[0] !== 1) throw new HttpError(404, "User not found.");
  res.json({ id, role });
}));
