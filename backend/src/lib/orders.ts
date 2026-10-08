import { getPool, likePattern, sql } from "../db.js";
import { config } from "../config.js";
import { STATUS_LABELS } from "./schemas.js";

export interface OrderFilter {
  userId?: number;
  orderNo?: string;
  email?: string;
  all?: boolean; // admin
  status?: string; // admin filter
  q?: string; // admin search: order no, email or name
  staff?: boolean; // include who changed each status (never shown to customers)
  limit?: number;
}

/** Loads orders with their items and tracking events, shaped for the frontend. */
export async function loadOrders(f: OrderFilter) {
  const pool = await getPool();
  const where: string[] = [];
  if (f.userId != null) where.push("o.UserId = @userId");
  if (f.orderNo) where.push("o.OrderNo = @orderNo");
  if (f.email) where.push("o.Email = @email");
  if (f.status) where.push("o.Status = @status");
  if (f.q) where.push("(o.OrderNo LIKE @q OR o.Email LIKE @q OR o.ShipName LIKE @q)");
  if (!where.length && !f.all) return [];
  const cond = where.length ? "WHERE " + where.join(" AND ") : "";
  const top = Math.min(f.limit ?? 100, 500);
  const req = () =>
    pool
      .request()
      .input("userId", sql.Int, f.userId ?? null)
      .input("orderNo", sql.VarChar(20), f.orderNo ?? null)
      .input("email", sql.NVarChar(255), f.email ?? null)
      .input("status", sql.VarChar(20), f.status ?? null)
      .input("q", sql.NVarChar(260), f.q ? likePattern(f.q) : null);

  const orders = (await req().query(`SELECT TOP (${top}) o.* FROM dbo.Orders o ${cond} ORDER BY o.CreatedAt DESC, o.Id DESC`)).recordset;
  if (!orders.length) return [];

  const ids = orders.map(o => o.Id as number);
  const idList = ids.join(","); // integers from our own query, safe to inline
  const items = (
    await pool.request().query(`
      SELECT i.OrderId, i.ProductName, i.Color, i.Size, i.UnitPrice, i.CompareAtPrice, i.Qty, p.Slug, p.Type
      FROM dbo.OrderItems i JOIN dbo.Products p ON p.Id = i.ProductId
      WHERE i.OrderId IN (${idList}) ORDER BY i.Id`)
  ).recordset;
  const events = (
    await pool.request().query(`
      SELECT e.OrderId, e.Status, e.TrackingNo, e.Note, e.CreatedAt, u.Name AS ChangedByName
      FROM dbo.OrderEvents e LEFT JOIN dbo.Users u ON u.Id = e.ChangedBy
      WHERE e.OrderId IN (${idList}) ORDER BY e.CreatedAt, e.Id`)
  ).recordset;

  const emails = f.staff
    ? (await pool.request().query(`
        SELECT e.Id, e.OrderId, e.Kind, e.ToEmail, e.Status, e.Attempts, e.NextAttemptAt, e.LastError, e.CreatedAt, e.SentAt, u.Name AS CreatedByName
        FROM dbo.EmailOutbox e LEFT JOIN dbo.Users u ON u.Id = e.CreatedBy
        WHERE e.OrderId IN (${idList}) ORDER BY e.CreatedAt, e.Id`)).recordset
    : [];

  // Discount code names. Only queried when an order has one, so this works before 07_discount_codes.sql.
  const codeIds = [...new Set(orders.map(o => o.DiscountCodeId).filter(Boolean))] as number[];
  const codeNames = new Map<number, string>(
    codeIds.length
      ? (await pool.request().query(`SELECT Id, Code FROM dbo.DiscountCodes WHERE Id IN (${codeIds.map(Number).join(",")})`))
          .recordset.map(r => [r.Id as number, r.Code as string])
      : []
  );

  return orders.map(o => {
    const ship = config.shipping[o.ShippingMethod] ?? { name: o.ShippingMethod, eta: "" };
    return {
      no: o.OrderNo as string,
      date: new Date(o.CreatedAt).toISOString(),
      status: o.Status as string,
      statusLabel: STATUS_LABELS[o.Status] ?? o.Status,
      items: items
        .filter(i => i.OrderId === o.Id)
        .map(i => ({
          id: i.Slug,
          name: i.ProductName,
          type: i.Type,
          price: Number(i.UnitPrice),
          compareAt: i.CompareAtPrice == null ? null : Number(i.CompareAtPrice),
          color: i.Color,
          size: i.Size,
          qty: i.Qty,
        })),
      subtotal: Number(o.Subtotal),
      discount: o.DiscountCodeId
        ? { code: codeNames.get(o.DiscountCodeId) ?? "", amount: Number(o.DiscountAmount ?? 0) }
        : null,
      shippingFee: Number(o.ShippingFee),
      total: Number(o.Total),
      shipping: { id: o.ShippingMethod, name: ship.name, eta: ship.eta },
      address: {
        name: o.ShipName, phone: o.ShipPhone, email: o.Email, line1: o.ShipLine1, line2: o.ShipLine2,
        city: o.ShipCity, region: o.ShipRegion, postal: o.ShipPostal, country: o.ShipCountry,
      },
      payment:
        o.PaymentMethod === "card"
          ? { method: "card", brand: o.CardBrand, last4: o.CardLast4 }
          : { method: "qr", slipName: o.SlipOriginalName, ...(f.staff ? { hasSlip: !!o.SlipPath } : {}) },
      events: events
        .filter(e => e.OrderId === o.Id)
        .map(e => ({
          status: e.Status,
          label: STATUS_LABELS[e.Status] ?? e.Status,
          at: new Date(e.CreatedAt).toISOString(),
          trackingNo: e.TrackingNo,
          note: e.Note,
          ...(f.staff ? { changedBy: e.ChangedByName ?? null } : {}),
        })),
      ...(f.staff
        ? {
            emails: emails
              .filter(e => e.OrderId === o.Id)
              .map(e => ({
                id: e.Id as number, kind: e.Kind as string, to: e.ToEmail as string, status: e.Status as string,
                attempts: e.Attempts as number, lastError: e.LastError as string | null,
                nextAttemptAt: new Date(e.NextAttemptAt).toISOString(), createdAt: new Date(e.CreatedAt).toISOString(),
                sentAt: e.SentAt ? new Date(e.SentAt).toISOString() : null, createdBy: e.CreatedByName ?? null,
              })),
          }
        : {}),
    };
  });
}
