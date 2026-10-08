import { Router } from "express";
import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getPool, sql, isDuplicateKey } from "../db.js";
import { config } from "../config.js";
import { ah, HttpError } from "../lib/http.js";
import { emailSchema, orderSchema } from "../lib/schemas.js";
import { alreadyUsed, discountAmount, findUsableCode, type UsableCode } from "../lib/discounts.js";
import { loadOrders } from "../lib/orders.js";
import { deliverNow, queueOrderEmail } from "../lib/mail.js";
import { requireAuth } from "../middleware/auth.js";
import { upsertAddress } from "./me.js";

export const ordersRouter = Router();

/* ---------- Slip uploads: stored on disk, never served publicly ---------- */
export const SLIP_DIR = path.resolve("uploads", "slips");
fs.mkdirSync(SLIP_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: SLIP_DIR,
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname) || "").toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 6);
      cb(null, crypto.randomBytes(16).toString("hex") + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype) || file.mimetype === "application/pdf") cb(null, true);
    else cb(new HttpError(400, "Upload an image (JPG, PNG) or a PDF."));
  },
});

const newOrderNo = () => "VV-" + crypto.randomBytes(5).toString("hex").toUpperCase().slice(0, 8);

/* ---------- Place an order ---------- */
ordersRouter.post("/", upload.single("slip"), ah(async (req, res) => {
  const removeSlip = () => req.file && fs.promises.unlink(req.file.path).catch(() => {});
  let tx: sql.Transaction | null = null;
  try {
    let raw: unknown;
    try { raw = JSON.parse(String(req.body?.data ?? "")); } catch { throw new HttpError(400, "Invalid order data."); }
    const data = orderSchema.parse(raw);
    if (data.payment.method === "qr" && !req.file) throw new HttpError(400, "Upload your transfer slip to continue.");

    // Merge duplicate lines for the same variant
    const merged = new Map<string, { productId: string; color: string; size: string; qty: number }>();
    for (const it of data.items) {
      const k = `${it.productId}|${it.color}|${it.size}`;
      const prev = merged.get(k);
      merged.set(k, { ...it, qty: Math.min(10, (prev?.qty ?? 0) + it.qty) });
    }

    const ship = config.shipping[data.shipping];
    const pool = await getPool();
    tx = new sql.Transaction(pool);
    await tx.begin();

    // Discount code: checked first so a bad code fails before any stock is taken
    let discount: UsableCode | null = null;
    if (data.discountCode) {
      if (!req.user) throw new HttpError(401, "Log in to use a discount code.");
      discount = await findUsableCode(new sql.Request(tx), data.discountCode, req.user.id);
    }

    const lines: { variantId: number; productId: number; name: string; color: string; size: string; price: number; compareAt: number | null; qty: number }[] = [];
    let subtotal = 0;

    for (const it of merged.values()) {
      // Price always comes from the database, never from the browser
      const v = (await new sql.Request(tx)
        .input("slug", sql.VarChar(80), it.productId).input("color", sql.VarChar(30), it.color).input("size", sql.VarChar(20), it.size)
        .query(`SELECT v.Id AS VariantId, p.Id AS ProductId, p.Name, p.Price, p.CompareAtPrice
                FROM dbo.ProductVariants v JOIN dbo.Products p ON p.Id = v.ProductId
                WHERE p.Slug = @slug AND v.Color = @color AND v.Size = @size AND p.IsActive = 1`)).recordset[0];
      if (!v) throw new HttpError(400, `${it.productId} (${it.color} / ${it.size}) is no longer available.`);

      // Take stock only if enough is left. The row lock makes this safe when two people buy at once.
      const upd = await new sql.Request(tx).input("id", sql.Int, v.VariantId).input("qty", sql.Int, it.qty)
        .query(`UPDATE dbo.ProductVariants SET Stock = Stock - @qty WHERE Id = @id AND Stock >= @qty`);
      if (upd.rowsAffected[0] !== 1) {
        const left = (await new sql.Request(tx).input("id", sql.Int, v.VariantId)
          .query(`SELECT Stock FROM dbo.ProductVariants WHERE Id = @id`)).recordset[0]?.Stock ?? 0;
        throw new HttpError(409, left > 0
          ? `${v.Name} (${it.color} / ${it.size}) has only ${left} left. Update your cart to continue.`
          : `${v.Name} (${it.color} / ${it.size}) just sold out. Remove it from your cart to continue.`);
      }

      const price = Number(v.Price);
      subtotal += price * it.qty;
      lines.push({ variantId: v.VariantId, productId: v.ProductId, name: v.Name, color: it.color, size: it.size, price,
        compareAt: v.CompareAtPrice == null ? null : Number(v.CompareAtPrice), qty: it.qty });
    }

    const off = discount ? discountAmount(subtotal, discount.percentOff) : 0;
    const total = subtotal - off + ship.fee;
    const status = data.payment.method === "card" ? "paid" : "checking_slip";
    const a = data.address;
    const orderNo = newOrderNo();

    const ins = await new sql.Request(tx)
      .input("no", sql.VarChar(20), orderNo).input("uid", sql.Int, req.user?.id ?? null).input("email", sql.NVarChar(255), a.email)
      .input("name", sql.NVarChar(100), a.name).input("phone", sql.NVarChar(30), a.phone)
      .input("l1", sql.NVarChar(200), a.line1).input("l2", sql.NVarChar(200), a.line2)
      .input("city", sql.NVarChar(100), a.city).input("region", sql.NVarChar(100), a.region)
      .input("postal", sql.NVarChar(20), a.postal).input("country", sql.NVarChar(60), a.country)
      .input("method", sql.VarChar(20), data.shipping).input("fee", sql.Decimal(10, 2), ship.fee)
      .input("subtotal", sql.Decimal(10, 2), subtotal).input("total", sql.Decimal(10, 2), total)
      .input("pay", sql.VarChar(10), data.payment.method)
      .input("brand", sql.VarChar(20), data.payment.method === "card" ? data.payment.brand : null)
      .input("last4", sql.Char(4), data.payment.method === "card" ? data.payment.last4 : null)
      .input("slip", sql.NVarChar(400), req.file ? path.basename(req.file.path) : null)
      .input("slipName", sql.NVarChar(255), req.file ? req.file.originalname.slice(0, 255) : null)
      .input("status", sql.VarChar(20), status)
      .query(`INSERT INTO dbo.Orders (OrderNo, UserId, Email, ShipName, ShipPhone, ShipLine1, ShipLine2, ShipCity, ShipRegion,
                ShipPostal, ShipCountry, ShippingMethod, ShippingFee, Subtotal, Total, PaymentMethod, CardBrand, CardLast4,
                SlipPath, SlipOriginalName, Status)
              OUTPUT INSERTED.Id
              VALUES (@no, @uid, @email, @name, @phone, @l1, @l2, @city, @region, @postal, @country, @method, @fee,
                @subtotal, @total, @pay, @brand, @last4, @slip, @slipName, @status)`);
    const orderId: number = ins.recordset[0].Id;

    if (discount) {
      // Separate UPDATE (not in the INSERT above) so checkout without a code works even before 07_discount_codes.sql
      await new sql.Request(tx).input("oid", sql.Int, orderId).input("did", sql.Int, discount.id).input("off", sql.Decimal(10, 2), off)
        .query(`UPDATE dbo.Orders SET DiscountCodeId = @did, DiscountAmount = @off WHERE Id = @oid`);
      if (discount.onePerAccount) {
        try {
          await new sql.Request(tx).input("did", sql.Int, discount.id).input("uid", sql.Int, req.user!.id).input("oid", sql.Int, orderId)
            .query(`INSERT INTO dbo.DiscountRedemptions (DiscountCodeId, UserId, OrderId) VALUES (@did, @uid, @oid)`);
        } catch (err) {
          if (isDuplicateKey(err)) throw alreadyUsed(discount.code); // another order used it a moment ago
          throw err;
        }
      }
    }

    for (const l of lines) {
      await new sql.Request(tx)
        .input("oid", sql.Int, orderId).input("vid", sql.Int, l.variantId).input("pid", sql.Int, l.productId)
        .input("name", sql.NVarChar(120), l.name).input("color", sql.VarChar(30), l.color).input("size", sql.VarChar(20), l.size)
        .input("price", sql.Decimal(10, 2), l.price).input("cmp", sql.Decimal(10, 2), l.compareAt).input("qty", sql.Int, l.qty)
        .query(`INSERT INTO dbo.OrderItems (OrderId, VariantId, ProductId, ProductName, Color, Size, UnitPrice, CompareAtPrice, Qty)
                VALUES (@oid, @vid, @pid, @name, @color, @size, @price, @cmp, @qty)`);
    }

    await new sql.Request(tx).input("oid", sql.Int, orderId).input("paid", sql.Bit, status === "paid" ? 1 : 0).query(`
      INSERT INTO dbo.OrderEvents (OrderId, Status) VALUES (@oid, 'placed');
      IF @paid = 1 INSERT INTO dbo.OrderEvents (OrderId, Status) VALUES (@oid, 'paid');`);

    if (data.saveAddress && req.user) await upsertAddress(new sql.Request(tx), req.user.id, a);

    const mailId = await queueOrderEmail(new sql.Request(tx), orderId, "confirmation");

    await tx.commit();
    tx = null;

    void deliverNow(mailId); // after commit; the customer doesn't wait for it (the worker retries if it fails)
    const [order] = await loadOrders({ orderNo });
    res.status(201).json(order);
  } catch (err) {
    if (tx) await tx.rollback().catch(() => {});
    await removeSlip();
    if (isDuplicateKey(err)) throw new HttpError(409, "Please try placing the order again.");
    throw err;
  }
}));

/* ---------- The logged-in user's orders ---------- */
ordersRouter.get("/me", requireAuth, ah(async (req, res) => {
  res.json(await loadOrders({ userId: req.user!.id }));
}));

/* ---------- Track by order number + email (works for guests) ---------- */
ordersRouter.get("/track", ah(async (req, res) => {
  const no = String(req.query.no ?? "").trim().toUpperCase();
  const email = emailSchema.safeParse(String(req.query.email ?? ""));
  if (!no || !email.success) throw new HttpError(400, "Enter your order number and email.");
  const [order] = await loadOrders({ orderNo: no, email: email.data });
  if (!order) throw new HttpError(404, "We couldn't find an order with that number and email.");
  res.json(order);
}));
