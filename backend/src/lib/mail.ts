import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import { getPool, sql } from "../db.js";
import { loadOrders } from "./orders.js";

/* ---------------------------------------------------------------------
   Transactional email, through an outbox table (dbo.EmailOutbox).
   1. queueOrderEmail() inserts a row in the SAME transaction as the order / status change,
      so an email can't be lost if the server dies right after the commit.
   2. deliverOutbox() sends due rows: right after the commit, and every 30 s from the worker.
   3. A failed send is retried with backoff. Errors that won't fix themselves (e.g. Resend 403
      "verify a domain") stop right away and show up on the Admin page with a Retry button.
   Sending:
   - RESEND_API_KEY set  -> Resend (https://resend.com).
   - not set             -> written to backend/mail-outbox/*.html so you can open it in a browser.
   --------------------------------------------------------------------- */

/** What the admin sees after a status change. "retrying" = queued, the worker will try again. */
export type MailResult = "sent" | "preview" | "retrying" | "failed";

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class MailError extends Error {
  constructor(message: string, public permanent: boolean) {
    super(message);
  }
}

export const OUTBOX_DIR = path.resolve("mail-outbox");

async function sendMail(m: Mail, idempotencyKey: string): Promise<{ result: "sent" | "preview"; providerId?: string }> {
  // Dev: deliver to MAIL_TEST_TO instead of the customer. Subject stays exactly as the customer would see it.
  if (config.mail.testTo) m = { ...m, to: config.mail.testTo };
  if (!config.mail.resendKey) {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = path.join(OUTBOX_DIR, `${stamp}_${m.to.replace(/[^a-z0-9@._-]/gi, "_")}.html`);
    fs.writeFileSync(file, `<!-- To: ${esc(m.to)} | Subject: ${esc(m.subject)} -->\n${m.html}`);
    console.log(`[mail preview] ${m.subject} -> ${m.to} (${path.relative(process.cwd(), file)})`);
    return { result: "preview" };
  }
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.mail.resendKey}`,
        "Content-Type": "application/json",
        // Same key on a retry: if the first try actually went through, Resend won't send it twice.
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: config.mail.from,
        to: [m.to],
        subject: m.subject,
        html: m.html,
        text: m.text,
        ...(config.mail.replyTo ? { reply_to: config.mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw new MailError(`Couldn't reach Resend: ${(err as Error).message}`, false); // network: try again later
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 400);
    // 4xx (bad address, unverified domain, bad key) won't fix itself. 429 and 5xx might.
    const permanent = res.status >= 400 && res.status < 500 && res.status !== 429;
    throw new MailError(`Resend ${res.status}: ${body}`, permanent);
  }
  const data = (await res.json().catch(() => null)) as { id?: string } | null;
  return { result: "sent", providerId: data?.id };
}

/* ---------- Order emails ---------- */

type Order = Awaited<ReturnType<typeof loadOrders>>[number];

/** Which email to send. "confirmation" is the one right after checkout. */
export type OrderMailKind = "confirmation" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const money = (n: number) => "฿" + Math.round(n).toLocaleString("en-US");

function copy(kind: OrderMailKind, o: Order): { subject: string; heading: string; lines: string[] } {
  const tracking = [...o.events].reverse().find(e => e.trackingNo)?.trackingNo;
  switch (kind) {
    case "confirmation":
      return o.payment.method === "qr"
        ? { subject: "We got your order", heading: "Order received",
            lines: ["Thanks for your order. We're checking your transfer slip now.", "You'll get another email as soon as the payment is confirmed."] }
        : { subject: "Order confirmed", heading: "Order confirmed",
            lines: ["Thanks for your order. Your payment went through.", "We'll email you again when it ships."] };
    case "paid":
      return { subject: "Payment confirmed", heading: "Payment confirmed",
        lines: ["We've confirmed your payment and we're getting your order ready.", "You'll get another email when it ships."] };
    case "packed":
      return { subject: "Your order is packed", heading: "Packed",
        lines: ["Your order is packed and will be handed to the courier soon."] };
    case "shipped":
      return { subject: "Your order is on its way", heading: "On its way",
        lines: [`Your order has shipped (${o.shipping.name}, ${o.shipping.eta}).`,
          ...(tracking ? [`Tracking number: <b style="font-family:monospace">${esc(tracking)}</b>`] : [])] };
    case "delivered":
      return { subject: "Delivered", heading: "Delivered",
        lines: ["Your order has been delivered. Enjoy it.", "Got a minute? Leave a review on the product page. It helps other people pick the right size."] };
    case "cancelled":
      return { subject: "Your order was cancelled", heading: "Order cancelled",
        lines: ["Your order has been cancelled.", "If you already paid, reply to this email and we'll sort out your refund."] };
  }
}

function render(kind: OrderMailKind, o: Order): Mail {
  const c = copy(kind, o);
  const trackUrl = `${config.clientOrigin}/#/track?no=${encodeURIComponent(o.no)}`;
  const items = o.items
    .map(
      it => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e2db">${esc(it.name)}<br><span style="color:#8f8d88;font-size:13px">${esc(it.color)} / ${esc(it.size)} · Qty ${it.qty}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e2db;text-align:right;font-family:monospace">${money(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");
  const a = o.address;
  const shipTo = [a.line1, a.line2, a.city, a.region, a.postal, a.country].filter(Boolean).map(esc).join(", ");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(c.subject)}</title></head>
<body style="margin:0;background:#f4f2ed;font-family:Helvetica,Arial,sans-serif;color:#141414">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e2db">
        <tr><td style="background:#0a0a0a;padding:20px 28px;color:#e9e7e2;font-size:28px;font-weight:bold;letter-spacing:-0.5px">VVRN</td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0;font-family:monospace;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c48412">Order ${esc(o.no)}</p>
          <h1 style="margin:8px 0 16px;font-size:28px;line-height:1.1">${esc(c.heading)}</h1>
          <p style="margin:0 0 6px">Hi ${esc(a.name)},</p>
          ${c.lines.map(l => `<p style="margin:0 0 6px;line-height:1.5">${l}</p>`).join("")}
          <p style="margin:24px 0">
            <a href="${esc(trackUrl)}" style="display:inline-block;background:#e8a32b;color:#0a0a0a;text-decoration:none;font-family:monospace;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 22px">Track your order</a>
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
            ${items}
            ${o.discount ? `<tr><td style="padding:10px 0 0;color:#8f8d88">Discount (${esc(o.discount.code)})</td><td style="padding:10px 0 0;text-align:right;font-family:monospace;color:#c48412">−${money(o.discount.amount)}</td></tr>` : ""}
            <tr><td style="padding:10px 0 2px;color:#8f8d88">Shipping</td><td style="padding:10px 0 2px;text-align:right;font-family:monospace">${o.shippingFee ? money(o.shippingFee) : "Free"}</td></tr>
            <tr><td style="padding:2px 0;font-weight:bold">Total</td><td style="padding:2px 0;text-align:right;font-family:monospace;font-weight:bold">${money(o.total)}</td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;color:#8f8d88;line-height:1.5">Ship to: ${esc(a.name)}, ${shipTo}</p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #e5e2db;font-size:12px;color:#8f8d88">
          To track your order you'll need this order number and the email it was placed with. Questions? Just reply to this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const strip = (s: string) => s.replace(/<[^>]+>/g, "");
  const text = [
    `VVRN · Order ${o.no}`,
    c.heading,
    "",
    `Hi ${a.name},`,
    ...c.lines.map(strip),
    "",
    ...o.items.map(it => `- ${it.name} (${it.color} / ${it.size}) x${it.qty}  ${money(it.price * it.qty)}`),
    ...(o.discount ? [`Discount (${o.discount.code}): -${money(o.discount.amount)}`] : []),
    `Total: ${money(o.total)}`,
    "",
    `Track your order: ${trackUrl}`,
  ].join("\n");

  return { to: a.email, subject: `VVRN · ${c.subject} (${o.no})`, html, text };
}

/* ---------- Outbox ---------- */

/** Status -> email. Orders still waiting for payment get the confirmation email. */
export const kindForStatus = (status: string): OrderMailKind =>
  status === "placed" || status === "checking_slip" ? "confirmation" : (status as OrderMailKind);

/**
 * Queues an email. Pass a Request bound to the open transaction so the email is saved
 * together with the change it's about. Returns the outbox id.
 */
export async function queueOrderEmail(request: sql.Request, orderId: number, kind: OrderMailKind, createdBy: number | null = null) {
  const r = await request
    .input("mOrderId", sql.Int, orderId).input("mKind", sql.VarChar(20), kind).input("mBy", sql.Int, createdBy)
    .query(`INSERT INTO dbo.EmailOutbox (OrderId, Kind, ToEmail, CreatedBy)
            OUTPUT INSERTED.Id
            SELECT Id, @mKind, Email, @mBy FROM dbo.Orders WHERE Id = @mOrderId`);
  return r.recordset[0].Id as number;
}

/* ---------- Back in stock ---------- */

/**
 * Queues a "back in stock" email for everyone waiting on these variants that now have stock
 * (and whose product is shown in the shop), and marks those alerts notified.
 * Pass a Request bound to an open transaction. Returns the new outbox ids for deliverNow().
 * Returns [] if 08_stock_alerts.sql hasn't been run yet.
 */
export async function queueStockAlerts(request: sql.Request, variantIds: number[]): Promise<number[]> {
  const ids = variantIds.map(Number).filter(n => Number.isInteger(n) && n > 0);
  if (!ids.length) return [];
  const r = await request.query(`
    IF OBJECT_ID('dbo.StockAlerts', 'U') IS NOT NULL AND COL_LENGTH('dbo.EmailOutbox', 'StockAlertId') IS NOT NULL
    BEGIN
      DECLARE @due TABLE (Id INT PRIMARY KEY);
      UPDATE a SET NotifiedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.Id INTO @due
      FROM dbo.StockAlerts a WITH (UPDLOCK)
      JOIN dbo.ProductVariants v ON v.Id = a.VariantId
      JOIN dbo.Products p ON p.Id = v.ProductId
      WHERE a.NotifiedAt IS NULL AND v.Stock > 0 AND p.IsActive = 1 AND a.VariantId IN (${ids.join(",")});

      INSERT INTO dbo.EmailOutbox (StockAlertId, Kind, ToEmail)
      OUTPUT INSERTED.Id
      SELECT a.Id, 'back_in_stock', a.Email FROM dbo.StockAlerts a JOIN @due d ON d.Id = a.Id;
    END`); // the IF skips everything until 08_stock_alerts.sql has been run
  return (r.recordset ?? []).map(x => x.Id as number);
}

/** Sends queued emails without making the caller wait. */
export const deliverSoon = (outboxIds: number[]) => {
  for (const id of outboxIds) void deliverNow(id);
};

async function renderBackInStock(alertId: number): Promise<Mail> {
  const pool = await getPool();
  const a = (await pool.request().input("id", sql.Int, alertId).query(`
    SELECT a.Email, p.Slug, p.Name, p.Price, p.CompareAtPrice, v.Color, v.Size, v.Stock
    FROM dbo.StockAlerts a JOIN dbo.ProductVariants v ON v.Id = a.VariantId JOIN dbo.Products p ON p.Id = v.ProductId
    WHERE a.Id = @id`)).recordset[0];
  if (!a) throw new MailError("Stock alert not found.", true);
  const url = `${config.clientOrigin}/#/product/${encodeURIComponent(a.Slug)}?c=${encodeURIComponent(a.Color)}`;
  const what = `${a.Name} — ${a.Color} / ${a.Size}`;
  const price = Number(a.Price);
  const was = a.CompareAtPrice == null ? null : Number(a.CompareAtPrice);
  const priceHtml = was
    ? `<b style="color:#c48412">${money(price)}</b> <s style="color:#8f8d88">${money(was)}</s>`
    : `<b>${money(price)}</b>`;
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Back in stock</title></head>
<body style="margin:0;background:#f4f2ed;font-family:Helvetica,Arial,sans-serif;color:#141414">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e2db">
        <tr><td style="background:#0a0a0a;padding:20px 28px;color:#e9e7e2;font-size:28px;font-weight:bold;letter-spacing:-0.5px">VVRN</td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0;font-family:monospace;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c48412">Back in stock</p>
          <h1 style="margin:8px 0 16px;font-size:28px;line-height:1.1">${esc(a.Name)}</h1>
          <p style="margin:0 0 6px;line-height:1.5">Good news: <b>${esc(a.Color)} / ${esc(a.Size)}</b> is back. You asked us to let you know.</p>
          <p style="margin:0 0 6px;line-height:1.5;font-family:monospace">${priceHtml}</p>
          <p style="margin:0 0 6px;line-height:1.5;color:#8f8d88">Stock is limited and we can't hold it for you, so it's first come, first served.</p>
          <p style="margin:24px 0 8px">
            <a href="${esc(url)}" style="display:inline-block;background:#e8a32b;color:#0a0a0a;text-decoration:none;font-family:monospace;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:14px 22px">Shop now</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #e5e2db;font-size:12px;color:#8f8d88">
          You got this one email because you asked to be notified about this size. We won't email you about it again.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = [
    "VVRN · Back in stock",
    "",
    `${what} is back. You asked us to let you know.`,
    `Price: ${money(price)}${was ? ` (was ${money(was)})` : ""}`,
    "Stock is limited, so it's first come, first served.",
    "",
    `Shop now: ${url}`,
  ].join("\n");
  return { to: a.Email, subject: `VVRN · Back in stock: ${what}`, html, text };
}

// Minutes to wait before attempt 2, 3, 4, 5, 6. After that the email is marked failed.
const BACKOFF_MIN = [1, 5, 15, 60, 360];
const BATCH = 10;

/**
 * Sends due emails (or just one, by id). Rows are claimed with a 5-minute lease
 * (READPAST + UPDLOCK), so two servers or two ticks never send the same email.
 * Never throws. Returns the result for each row it handled.
 */
export async function deliverOutbox(onlyId?: number): Promise<Map<number, MailResult>> {
  const results = new Map<number, MailResult>();
  try {
    const pool = await getPool();
    const claimed = (await pool.request().input("id", sql.Int, onlyId ?? null).query(`
      WITH due AS (
        SELECT TOP (${BATCH}) * FROM dbo.EmailOutbox WITH (ROWLOCK, READPAST, UPDLOCK)
        -- +1 s: NextAttemptAt is DATETIME2(0), so a row created at :58.6 is stored as :59 and would look "not due yet"
        WHERE Status = 'pending' AND NextAttemptAt <= DATEADD(SECOND, 1, SYSUTCDATETIME()) AND (@id IS NULL OR Id = @id)
        ORDER BY NextAttemptAt, Id)
      UPDATE due SET Attempts = Attempts + 1, NextAttemptAt = DATEADD(MINUTE, 5, SYSUTCDATETIME())
      OUTPUT INSERTED.*`)).recordset; // * so this still works before 08_stock_alerts.sql adds StockAlertId

    for (const row of claimed) {
      const save = (status: string, extra: { error?: string; providerId?: string; retryMin?: number } = {}) =>
        pool.request()
          .input("id", sql.Int, row.Id).input("status", sql.VarChar(10), status)
          .input("err", sql.NVarChar(500), extra.error?.slice(0, 500) ?? null)
          .input("pid", sql.VarChar(100), extra.providerId ?? null)
          .input("retry", sql.Int, extra.retryMin ?? 0)
          .query(`UPDATE dbo.EmailOutbox SET Status = @status, LastError = @err, ProviderId = ISNULL(@pid, ProviderId),
                    SentAt = CASE WHEN @status IN ('sent', 'preview') THEN SYSUTCDATETIME() ELSE SentAt END,
                    NextAttemptAt = DATEADD(MINUTE, @retry, SYSUTCDATETIME())
                  WHERE Id = @id`);
      try {
        let mail: Mail;
        if (row.Kind === "back_in_stock") {
          mail = await renderBackInStock(row.StockAlertId);
        } else {
          const orderNo = (await pool.request().input("oid", sql.Int, row.OrderId)
            .query(`SELECT OrderNo FROM dbo.Orders WHERE Id = @oid`)).recordset[0]?.OrderNo;
          const [o] = orderNo ? await loadOrders({ orderNo }) : [];
          if (!o) throw new MailError("Order not found.", true);
          mail = render(row.Kind as OrderMailKind, o);
        }
        // Send to the address saved when the email was queued
        const sent = await sendMail({ ...mail, to: row.ToEmail }, `vvrn-outbox-${row.Id}`);
        await save(sent.result, { providerId: sent.providerId });
        results.set(row.Id, sent.result);
      } catch (err) {
        const message = (err as Error).message;
        const wait = BACKOFF_MIN[row.Attempts - 1];
        if ((err instanceof MailError && err.permanent) || wait === undefined) {
          await save("failed", { error: message });
          results.set(row.Id, "failed");
          console.error(`[mail] ${row.Kind} email #${row.Id} failed: ${message}`);
        } else {
          await save("pending", { error: message, retryMin: wait });
          results.set(row.Id, "retrying");
          console.warn(`[mail] ${row.Kind} email #${row.Id} failed (attempt ${row.Attempts}), retrying in ${wait} min: ${message}`);
        }
      }
    }
  } catch (err) {
    console.error("[mail] outbox error:", (err as Error).message);
  }
  return results;
}

/** Sends one queued email now and reports what happened (for the Admin page). */
export async function deliverNow(id: number): Promise<MailResult> {
  return (await deliverOutbox(id)).get(id) ?? "retrying"; // not claimed: the worker has it
}

/** Background worker: picks up retries and anything left behind by a crash. */
export function startOutboxWorker(everyMs = 30_000) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      while ((await deliverOutbox()).size === BATCH); // keep going while full batches come back
    } finally {
      running = false;
    }
  };
  setInterval(tick, everyMs).unref();
  void tick();
}
