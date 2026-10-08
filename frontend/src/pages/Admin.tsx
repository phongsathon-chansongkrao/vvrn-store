import React, { useCallback, useEffect, useState } from "react";
import { api, BASE } from "../lib/api";
import { AuthCtx, ShopCtx } from "../lib/context";
import { COLORS, SIZE_GUIDES, fmtTime, money } from "../lib/data";
import { Field, btnGhost, btnPrimary } from "../components/forms";
import { Dialog } from "../components/Dialog";
import { OrderDetails, StatusPill } from "../components/Orders";
import { Garment, SHAPES } from "../components/Garment";
import { ProductVisual } from "../components/ProductVisual";
import { Marquee } from "../components/ui";
import { imgUrl } from "../lib/catalog";
import { AuthShell } from "./Auth";
import type { Order, OrderEmail } from "../lib/types";

/* All checks here are only for display. The backend enforces every role rule (backend/src/routes/admin.ts). */

const inputCls =
  "h-10 px-3 bg-transparent border border-line text-[13px] text-bone placeholder:text-white/25 outline-none focus:border-amber";
const btnSm = "h-9 px-4 font-mono text-[11px] tracking-[0.1em] uppercase disabled:opacity-40 disabled:cursor-not-allowed";
const btnSmPrimary = btnSm + " bg-amber text-noir hover:brightness-110";
const btnSmGhost = btnSm + " border border-line text-bone hover:border-white/50";

function ErrorLine({ text }: { text: string }) {
  if (!text) return null;
  return <p className="mt-3 border border-red-400/40 p-3 text-[13px] text-red-300">{text}</p>;
}

export function Admin({ tab }: { tab: string }) {
  const auth = React.useContext(AuthCtx);
  const user = auth.user;
  if (!user) {
    return (
      <AuthShell title="Back office" sub="Log in with a staff or admin account.">
        <a href="#/login?next=admin" className={btnPrimary + " mt-8 w-full inline-flex items-center justify-center"}>
          Log in
        </a>
      </AuthShell>
    );
  }
  if (user.role !== "staff" && user.role !== "admin") {
    return (
      <AuthShell title="No access" sub="This page is for VVRN staff. Ask an admin if you need access.">
        <a href="#/" className={btnGhost + " mt-8 w-full inline-flex items-center justify-center"}>
          Back to the shop
        </a>
      </AuthShell>
    );
  }
  const isAdmin = user.role === "admin";
  const tabs = [
    ["orders", "Orders"],
    ["products", "Products & stock"],
    ...(isAdmin ? [["discounts", "Discounts"], ["site", "Site"], ["users", "Users"]] : []),
  ];
  const current = ["users", "discounts", "site"].includes(tab) && !isAdmin ? "orders" : tab;
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.9] text-bone">Back office</h1>
          <p className="mt-2 text-[13px] text-ash">
            {`${user.name} · `}
            <span className="font-mono uppercase tracking-[0.1em] text-amber">{user.role}</span>
          </p>
        </div>
        <nav className="flex gap-2">
          {tabs.map(([key, label]) => (
            <a
              key={key}
              href={"#/admin/" + key}
              aria-current={current === key ? "page" : undefined}
              className={
                "h-10 px-4 inline-flex items-center border text-[12px] tracking-[0.08em] uppercase " +
                (current === key ? "border-amber text-amber" : "border-line text-bone/80 hover:border-white/40")
              }
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      {current === "products" ? (
        <ProductsTab isAdmin={isAdmin} />
      ) : current === "site" ? (
        <SiteTab />
      ) : current === "discounts" ? (
        <DiscountsTab />
      ) : current === "users" ? (
        <UsersTab me={user.id} />
      ) : (
        <OrdersTab isAdmin={isAdmin} />
      )}
    </main>
  );
}

/* =========================================================
   ORDERS
   ========================================================= */
const FILTERS: [string, string][] = [
  ["", "All"],
  ["checking_slip", "Checking slip"],
  ["paid", "Paid"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

function OrdersTab({ isAdmin }: { isAdmin: boolean }) {
  const [status, setStatus] = useState("checking_slip");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const qs = new URLSearchParams();
      if (status) qs.set("status", status);
      if (search) qs.set("q", search);
      setOrders(await api<Order[]>("/admin/orders?" + qs));
    } catch (e) {
      setError((e as Error).message);
      setOrders([]);
    }
  }, [status, search]);
  useEffect(() => {
    setOrders(null);
    load();
  }, [load]);

  const replace = (o: Order) => setOrders(prev => (prev || []).map(x => (x.no === o.no ? o : x)));

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={
              "h-9 px-3 border text-[12px] " +
              (status === key ? "border-amber text-amber" : "border-line text-bone/80 hover:border-white/40")
            }
          >
            {label}
          </button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            setSearch(q.trim());
          }}
        >
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Order no, email or name"
            aria-label="Search orders"
            className={inputCls + " w-[220px]"}
          />
          <button className={btnSmGhost + " h-10"}>Search</button>
        </form>
      </div>
      <ErrorLine text={error} />
      {orders === null ? (
        <p className="mt-10 text-ash">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-ash">No orders here.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map(o => (
            <AdminOrder key={o.no} o={o} isAdmin={isAdmin} onChange={replace} />
          ))}
        </ul>
      )}
    </section>
  );
}

const NEXT: Record<string, { to: string; label: string } | undefined> = {
  placed: { to: "paid", label: "Mark paid" },
  checking_slip: { to: "paid", label: "Approve slip" },
  paid: { to: "packed", label: "Mark packed" },
  packed: { to: "shipped", label: "Mark shipped" },
  shipped: { to: "delivered", label: "Mark delivered" },
};
const CANCELLABLE = ["placed", "checking_slip", "paid", "packed"];
const MAIL_NOTES: Record<string, string> = {
  sent: "Customer emailed.",
  preview: "Email saved to backend/mail-outbox (no RESEND_API_KEY, so nothing was sent).",
  retrying: "Status saved. The email couldn't be sent yet; it will retry automatically.",
  failed: "Status saved, but the email to the customer failed. See Emails below.",
};
const MAIL_KIND: Record<string, string> = {
  confirmation: "Order confirmation", paid: "Payment confirmed", packed: "Packed",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};
/** True when the newest email of some kind failed (so the admin should look). */
const emailTrouble = (emails: OrderEmail[] = []) => {
  const latest = new Map<string, OrderEmail>();
  for (const e of emails) latest.set(e.kind, e);
  return [...latest.values()].some(e => e.status === "failed");
};

function AdminOrder({ o, isAdmin, onChange }: { o: Order; isAdmin: boolean; onChange: (o: Order) => void }) {
  const shop = React.useContext(ShopCtx);
  const [open, setOpen] = useState(o.status === "checking_slip");
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mailNote, setMailNote] = useState("");
  const [askCancel, setAskCancel] = useState(false);
  const next = NEXT[o.status];
  const count = o.items.reduce((s, it) => s + it.qty, 0);

  const emailAction = async (path: string) => {
    setBusy(true);
    setError("");
    setMailNote("");
    try {
      const updated = await api<Order & { email: string }>(path, { method: "POST" });
      onChange(updated);
      setMailNote(MAIL_NOTES[updated.email]?.replace("Status saved, but the email", "The email").replace("Status saved. ", "") ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const move = async (to: string) => {
    setBusy(true);
    setError("");
    setMailNote("");
    try {
      const updated = await api<Order & { email: string }>(`/admin/orders/${o.no}/status`, {
        body: { status: to, trackingNo: to === "shipped" ? tracking.trim() : undefined, note: note.trim() || undefined },
      });
      onChange(updated);
      setMailNote(MAIL_NOTES[updated.email] ?? "");
      setNote("");
      setTracking("");
      if (to === "cancelled") shop.refresh().catch(() => {}); // units went back on the shelf
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setAskCancel(false);
    }
  };

  return (
    <li className="border border-line">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 hover:bg-white/[0.02]"
      >
        <span className="font-mono text-[13px] text-bone">{o.no}</span>
        <span className="text-[13px] text-ash">{fmtTime(o.date)}</span>
        <span className="text-[13px] text-bone/85 truncate max-w-[220px]">{o.address.name}</span>
        <span className="text-[13px] text-ash">{`${count} ${count === 1 ? "item" : "items"} · ${o.payment.method === "qr" ? "QR" : "Card"}`}</span>
        <StatusPill o={o} />
        {emailTrouble(o.emails) && <span className="text-[12px] px-2 py-0.5 border border-red-400/50 text-red-300">Email failed</span>}
        <span className="ml-auto font-mono text-[14px] text-bone">{money(o.total)}</span>
        <span className={"text-ash transition-transform " + (open ? "rotate-90" : "")} aria-hidden={true}>
          ›
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-5 py-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[13px] text-ash mb-3">Items</h3>
            <ul className="divide-y divide-line">
              {o.items.map((it, i) => (
                <li key={i} className="flex gap-3 py-2.5">
                  <span className="shot border border-line w-12 aspect-[4/5] p-1 shrink-0">
                    <Garment type={it.type} color={it.color} className="w-full h-full" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-bone">{it.name}</span>
                    <span className="block text-[12px] text-ash">{`${it.color} / ${it.size} · Qty ${it.qty}`}</span>
                  </span>
                  <span className="font-mono text-[13px] text-bone">{money(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <OrderDetails o={o} />
            </div>
            <p className="mt-3 text-[12px] text-ash">{`Email: ${o.address.email} · Phone: ${o.address.phone}`}</p>
          </div>

          <div>
            <h3 className="text-[13px] text-ash mb-3">Payment slip</h3>
            <Slip o={o} />
          </div>

          <div>
            <h3 className="text-[13px] text-ash mb-3">History</h3>
            <ol className="space-y-2.5">
              {o.events.map((e, i) => (
                <li key={i} className="text-[13px]">
                  <span className="text-bone">{e.label}</span>
                  <span className="text-ash">{` · ${fmtTime(e.at)} · ${e.changedBy || "System"}`}</span>
                  {e.trackingNo && <span className="block font-mono text-[12px] text-bone/85">{"Tracking " + e.trackingNo}</span>}
                  {e.note && <span className="block text-[12px] text-bone/70">{"“" + e.note + "”"}</span>}
                </li>
              ))}
            </ol>
            {mailNote && (
              <p className={"mt-3 text-[12px] " + (/failed|couldn't/.test(mailNote) ? "text-red-300" : "text-amber")}>{mailNote}</p>
            )}
            <EmailLog o={o} busy={busy} onResend={id => emailAction(`/admin/emails/${id}/resend`)} onSendCurrent={() => emailAction(`/admin/orders/${o.no}/email`)} />

            {(next || (isAdmin && CANCELLABLE.includes(o.status))) && (
              <div className="mt-6 pt-5 border-t border-line space-y-3">
                {next?.to === "shipped" && (
                  <input
                    value={tracking}
                    onChange={e => setTracking(e.target.value)}
                    placeholder="Tracking number (required)"
                    aria-label="Tracking number"
                    maxLength={40}
                    className={inputCls + " w-full font-mono"}
                  />
                )}
                <input
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Note (optional)"
                  aria-label="Note"
                  maxLength={200}
                  className={inputCls + " w-full"}
                />
                <div className="flex flex-wrap gap-2">
                  {next && (
                    <button
                      onClick={() => move(next.to)}
                      disabled={busy || (next.to === "shipped" && !tracking.trim())}
                      className={btnSmPrimary}
                    >
                      {busy ? "Saving…" : next.label}
                    </button>
                  )}
                  {isAdmin && CANCELLABLE.includes(o.status) && (
                    <button onClick={() => setAskCancel(true)} disabled={busy} className={btnSmGhost + " hover:!border-red-400/70 hover:text-red-300"}>
                      {o.status === "checking_slip" ? "Reject & cancel" : "Cancel order"}
                    </button>
                  )}
                </div>
                <ErrorLine text={error} />
              </div>
            )}
          </div>
        </div>
      )}
      <Dialog
        open={askCancel}
        icon="!"
        title={`Cancel ${o.no}?`}
        body={`The ${count} ${count === 1 ? "unit goes" : "units go"} back into stock and the customer sees the order as cancelled. ${note.trim() ? "" : "Tip: add a note with the reason first."}`}
        onClose={() => setAskCancel(false)}
        actions={
          <>
            <button onClick={() => setAskCancel(false)} className={btnGhost + " flex-1"}>
              Keep order
            </button>
            <button data-autofocus onClick={() => move("cancelled")} disabled={busy} className={btnPrimary + " flex-1"}>
              Cancel order
            </button>
          </>
        }
      />
    </li>
  );
}

function EmailLog({ o, busy, onResend, onSendCurrent }: { o: Order; busy: boolean; onResend: (id: number) => void; onSendCurrent: () => void }) {
  const emails = o.emails || [];
  const chip = (e: OrderEmail) =>
    e.status === "sent" ? ["Sent", "border-amber/60 text-amber"]
    : e.status === "preview" ? ["Saved to file", "border-amber/60 text-amber"]
    : e.status === "pending" ? [e.attempts ? `Retrying ${fmtTime(e.nextAttemptAt)}` : "Queued", "border-white/30 text-bone/80"]
    : ["Failed", "border-red-400/50 text-red-300"];
  return (
    <div className="mt-6 pt-5 border-t border-line">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[13px] text-ash">Emails to customer</h3>
        <button onClick={onSendCurrent} disabled={busy} className="text-[12px] text-ash underline underline-offset-4 hover:text-amber disabled:opacity-40">
          Email current status
        </button>
      </div>
      {emails.length === 0 ? (
        <p className="text-[12px] text-ash">No emails yet.</p>
      ) : (
        <ul className="space-y-3">
          {emails.map(e => {
            const [label, cls] = chip(e);
            return (
              <li key={e.id} className="text-[12px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-bone">{MAIL_KIND[e.kind] ?? e.kind}</span>
                  <span className={"px-1.5 py-px border " + cls}>{label}</span>
                  <button onClick={() => onResend(e.id)} disabled={busy} className="ml-auto text-ash underline underline-offset-4 hover:text-amber disabled:opacity-40">
                    {e.status === "failed" ? "Retry" : "Send again"}
                  </button>
                </div>
                <span className="block text-ash">
                  {`${e.to} · ${fmtTime(e.sentAt || e.createdAt)}${e.attempts > 1 ? ` · ${e.attempts} tries` : ""}${e.createdBy ? ` · by ${e.createdBy}` : ""}`}
                </span>
                {e.lastError && e.status !== "sent" && e.status !== "preview" && (
                  <span className="block mt-0.5 text-red-300/90 break-words" title={e.lastError}>
                    {e.lastError.length > 160 ? e.lastError.slice(0, 160) + "…" : e.lastError}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Slip({ o }: { o: Order }) {
  if (o.payment.method !== "qr") return <p className="text-[13px] text-ash">Paid by card. No slip.</p>;
  if (!o.payment.hasSlip) return <p className="text-[13px] text-ash">No slip was uploaded.</p>;
  const url = `${BASE}/admin/orders/${encodeURIComponent(o.no)}/slip`;
  const ext = (o.payment.slipName || "").toLowerCase().split(".").pop();
  const isImage = ["jpg", "jpeg", "png", "webp"].includes(ext || "");
  return (
    <div>
      {isImage ? (
        <a href={url + "?inline=1"} target="_blank" rel="noopener noreferrer" className="block border border-line bg-panel">
          <img src={url + "?inline=1"} alt={`Transfer slip for ${o.no}`} className="w-full max-h-[420px] object-contain" />
        </a>
      ) : ext === "pdf" ? (
        <a href={url + "?inline=1"} target="_blank" rel="noopener noreferrer" className="text-[13px] text-amber underline underline-offset-4">
          Open slip (PDF)
        </a>
      ) : (
        <p className="text-[13px] text-ash">This file type can't be previewed. Download it below.</p>
      )}
      <p className="mt-2 text-[12px] text-ash">
        {o.payment.slipName + " · "}
        <a href={url} className="underline underline-offset-4 hover:text-amber">
          Download
        </a>
      </p>
      <p className="mt-2 text-[12px] text-bone/70">{`Check the amount is ${money(o.total)}.`}</p>
    </div>
  );
}

/* =========================================================
   PRODUCTS & STOCK
   ========================================================= */
interface AdminVariant { id: number; color: string; size: string; stock: number; waiting: number } // waiting = "Notify me" emails
interface AdminProduct {
  slug: string; name: string; description: string; type: string; category: string; guide: string;
  price: number; compareAt: number | null; isActive: boolean; isLimited: boolean; isNew: boolean; createdAt: string;
  images: AdminImage[];
  variants: AdminVariant[];
}
interface AdminImage { id: number; file: string; color: string | null }

function ProductsTab({ isAdmin }: { isAdmin: boolean }) {
  const [list, setList] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState("");
  const load = useCallback(async () => {
    try {
      setList(await api<AdminProduct[]>("/admin/products"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setList([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ash">
          {isAdmin
            ? "Set stock to the number you counted. Prices, visibility and new products are admin-only."
            : "Set stock to the number you counted. Ask an admin to change prices."}
        </p>
        {isAdmin && !adding && (
          <button
            onClick={() => {
              setAdding(true);
              setCreated("");
            }}
            className={btnSmPrimary + " h-10"}
          >
            + Add product
          </button>
        )}
      </div>
      {created && <p className="mt-3 text-[13px] text-amber">{created}</p>}
      {adding && (
        <NewProductForm
          onCancel={() => setAdding(false)}
          onCreated={async p => {
            setAdding(false);
            setCreated(`Added "${p.name}". It's hidden for now: check it below, then press Show.`);
            await load();
          }}
        />
      )}
      <ErrorLine text={error} />
      {list === null ? (
        <p className="mt-10 text-ash">Loading products…</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map(p => (
            <ProductEditor key={p.slug} p={p} isAdmin={isAdmin} reload={load} />
          ))}
        </ul>
      )}
    </section>
  );
}

const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

const ALL_COLORS = Object.keys(COLORS);
const TYPES = Object.keys(SHAPES);
const CATS = ["Outerwear", "Tops", "Bottoms", "Footwear", "Accessories"];
const sizesFor = (guide: string) => Object.keys(SIZE_GUIDES[guide]?.rows ?? {});
// Picking a type fills in the usual category + size guide (still changeable)
const TYPE_DEFAULTS: Record<string, [string, string]> = {
  jacket: ["Outerwear", "outer"], vest: ["Outerwear", "outer"], hoodie: ["Tops", "tops"], tee: ["Tops", "tops"],
  longsleeve: ["Tops", "tops"], cargo: ["Bottoms", "pants"], shorts: ["Bottoms", "shorts"], cap: ["Accessories", "cap"],
  shirt: ["Tops", "tops"], "shirt-ss": ["Tops", "tops"], tank: ["Tops", "tops"],
  jeans: ["Bottoms", "pants"], slacks: ["Bottoms", "pants"], shoes: ["Footwear", "shoes"],
  belt: ["Accessories", "belt"], shades: ["Accessories", "eyewear"], round: ["Accessories", "eyewear"],
  aviator: ["Accessories", "eyewear"], tie: ["Accessories", "tie"], socks: ["Accessories", "socks"],
};
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const digits = (s: string, max = 4) => s.replace(/[^\d]/g, "").slice(0, max);
const decimal = (s: string) => s.replace(/[^\d.]/g, "");

function Select({ label, value, onChange, options, placeholder }: any) {
  return (
    <label className="block">
      <span className="block text-[12px] text-ash mb-1.5">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 px-4 bg-ink border border-line text-[14px] text-bone outline-none focus:border-amber"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o: string | [string, string]) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function NewProductForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (p: AdminProduct) => void }) {
  const [f, setF] = useState({
    name: "", slug: "", type: "tee", category: "Tops", guide: "tops",
    price: "", compareAt: "", description: "", isLimited: false,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>(sizesFor("tops"));
  const [stock, setStock] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }));

  const setName = (name: string) => setF(prev => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  const setType = (type: string) => {
    const [category, guide] = TYPE_DEFAULTS[type] ?? [f.category, f.guide];
    setF(prev => ({ ...prev, type, category, guide }));
    setSizes(sizesFor(guide));
  };
  const setGuide = (guide: string) => {
    set("guide", guide);
    setSizes(sizesFor(guide));
  };
  const guideSizes = sizesFor(f.guide);
  // Keep sizes in size-guide order
  const toggleSize = (sz: string) =>
    setSizes(prev => (prev.includes(sz) ? prev.filter(x => x !== sz) : guideSizes.filter(x => x === sz || prev.includes(x))));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!f.name.trim()) return setError("Enter a name.");
    if (f.price.trim() === "" || isNaN(Number(f.price))) return setError("Enter a price.");
    if (!colors.length) return setError("Add at least one color.");
    if (!sizes.length) return setError("Pick at least one size.");
    setBusy(true);
    try {
      const p = await api<AdminProduct>("/admin/products", {
        body: {
          ...f,
          name: f.name.trim(),
          slug: f.slug.trim(),
          price: Number(f.price),
          compareAt: numOrNull(f.compareAt),
          colors,
          sizes,
          stock: Object.fromEntries(Object.entries(stock).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)])),
        },
      });
      onCreated(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 border border-amber/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="font-display text-[36px] leading-none text-bone">New product</h2>
        <span className="text-[12px] text-ash">Saved as hidden. Press Show when it's ready.</span>
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Name"
            value={f.name}
            onChange={(e: any) => setName(e.target.value)}
            placeholder="Night Shift Hoodie"
            maxLength={120}
            className="sm:col-span-2"
          />
          <Field
            label="Slug (used in the product link)"
            value={f.slug}
            onChange={(e: any) => {
              setSlugTouched(true);
              set("slug", e.target.value.toLowerCase());
            }}
            placeholder="night-shift-hoodie"
            maxLength={80}
            className="sm:col-span-2"
          />
          <Select label="Type (drawing)" value={f.type} onChange={setType} options={TYPES} />
          <Select label="Category" value={f.category} onChange={(v: string) => set("category", v)} options={CATS} />
          <Select
            label="Size guide"
            value={f.guide}
            onChange={setGuide}
            options={Object.keys(SIZE_GUIDES).map(k => [k, SIZE_GUIDES[k].title])}
          />
          <label className="flex items-center gap-3 self-end h-12 cursor-pointer">
            <input
              type="checkbox"
              checked={f.isLimited}
              onChange={e => set("isLimited", e.target.checked)}
              className="w-4 h-4 accent-amber"
            />
            <span className="text-[13px] text-bone">Limited (shows "Drop 001")</span>
          </label>
          <Field label="Price ฿" value={f.price} onChange={(e: any) => set("price", decimal(e.target.value))} inputMode="decimal" placeholder="1490" />
          <Field
            label="Original price ฿ (only if on sale)"
            value={f.compareAt}
            onChange={(e: any) => set("compareAt", decimal(e.target.value))}
            inputMode="decimal"
            placeholder="Leave empty"
          />
          <label className="block sm:col-span-2">
            <span className="block text-[12px] text-ash mb-1.5">Description</span>
            <textarea
              value={f.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full p-3 bg-transparent border border-line text-[14px] text-bone outline-none focus:border-amber"
            />
          </label>
        </div>
        <div>
          <span className="block text-[12px] text-ash mb-1.5">Preview</span>
          <div className="shot border border-line aspect-[4/5] p-4">
            <Garment type={f.type} color={colors[0] || "Black"} className="w-full h-full" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Select
            label="Colors"
            value=""
            placeholder={colors.length === ALL_COLORS.length ? "All colors added" : "+ Add a color"}
            onChange={(c: string) => c && setColors(prev => (prev.includes(c) ? prev : [...prev, c]))}
            options={ALL_COLORS.filter(c => !colors.includes(c))}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map(c => (
              <span key={c} className="inline-flex items-center gap-2 h-8 pl-2 pr-1 border border-line text-[12px] text-bone">
                <span className="w-4 h-4 border border-white/20" style={{ background: COLORS[c] }} />
                {c}
                <button
                  type="button"
                  onClick={() => setColors(prev => prev.filter(x => x !== c))}
                  aria-label={`Remove ${c}`}
                  className="px-1.5 text-ash hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="block text-[12px] text-ash mb-1.5">Sizes</span>
          <div className="flex flex-wrap gap-2">
            {guideSizes.map(sz => (
              <button
                type="button"
                key={sz}
                onClick={() => toggleSize(sz)}
                aria-pressed={sizes.includes(sz)}
                className={
                  "h-12 min-w-[52px] px-3 border text-[13px] " +
                  (sizes.includes(sz) ? "border-amber text-amber" : "border-line text-ash hover:border-white/40")
                }
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {colors.length > 0 && sizes.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <span className="block text-[12px] text-ash mb-1.5">Starting stock (empty = 0)</span>
          <table className="text-[12px]">
            <thead>
              <tr>
                <th className="pr-3 py-1 text-left font-normal text-ash">Color</th>
                {sizes.map(sz => (
                  <th key={sz} className="px-1 py-1 font-normal text-ash">{sz}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.map(c => (
                <tr key={c}>
                  <td className="pr-3 py-1 text-bone/85 whitespace-nowrap">{c}</td>
                  {sizes.map(sz => (
                    <td key={sz} className="px-1 py-1">
                      <input
                        value={stock[`${c}|${sz}`] ?? ""}
                        onChange={e => setStock(m => ({ ...m, [`${c}|${sz}`]: digits(e.target.value) }))}
                        inputMode="numeric"
                        placeholder="0"
                        aria-label={`Starting stock ${c} ${sz}`}
                        className="w-14 h-9 px-2 bg-transparent border border-line text-center font-mono text-[13px] text-bone outline-none focus:border-amber placeholder:text-white/25"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ErrorLine text={error} />
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={busy} className={btnPrimary}>
          {busy ? "Saving…" : "Add product"}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={btnGhost}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Admin: add a color or a size to an existing product. New variants start at 0 stock. */
function AddVariant({ p, onDone }: { p: AdminProduct; onDone: (msg: string, isError?: boolean) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const colorsLeft = ALL_COLORS.filter(c => !p.variants.some(v => v.color === c));
  const sizesLeft = sizesFor(p.guide).filter(sz => !p.variants.some(v => v.size === sz));
  if (!colorsLeft.length && !sizesLeft.length) return null;
  const add = async (body: { colors?: string[]; sizes?: string[] }, what: string) => {
    setBusy(true);
    try {
      await api(`/admin/products/${p.slug}/variants`, { body });
      await onDone(`Added ${what} with 0 stock. Set the stock and save.`);
    } catch (e) {
      await onDone((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  const sel = "h-9 px-2 bg-ink border border-line text-[12px] text-bone outline-none focus:border-amber disabled:opacity-40";
  return (
    <>
      {colorsLeft.length > 0 && (
        <select value="" disabled={busy} onChange={e => e.target.value && add({ colors: [e.target.value] }, e.target.value)} aria-label="Add a color" className={sel}>
          <option value="">+ Add color</option>
          {colorsLeft.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
      {sizesLeft.length > 0 && (
        <select value="" disabled={busy} onChange={e => e.target.value && add({ sizes: [e.target.value] }, "size " + e.target.value)} aria-label="Add a size" className={sel}>
          <option value="">+ Add size</option>
          {sizesLeft.map(sz => (
            <option key={sz} value={sz}>{sz}</option>
          ))}
        </select>
      )}
    </>
  );
}

function ProductEditor({ p, isAdmin, reload }: { p: AdminProduct; isAdmin: boolean; reload: () => Promise<void> }) {
  const shop = React.useContext(ShopCtx);
  const [stock, setStock] = useState<Record<number, string>>({});
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(p.price));
  const [compareAt, setCompareAt] = useState(p.compareAt == null ? "" : String(p.compareAt));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setStock({});
    setPrice(String(p.price));
    setCompareAt(p.compareAt == null ? "" : String(p.compareAt));
  }, [p]);

  const colors = [...new Set(p.variants.map(v => v.color))];
  const sizes = [...new Set(p.variants.map(v => v.size))];
  const changed = p.variants.filter(v => stock[v.id] !== undefined && stock[v.id] !== String(v.stock));
  const priceChanged = String(p.price) !== price || (p.compareAt == null ? "" : String(p.compareAt)) !== compareAt;
  const total = p.variants.reduce((s, v) => s + v.stock, 0);

  const run = async (fn: () => Promise<string>) => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      setMsg(await fn());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      await reload();
      shop.refresh().catch(() => {});
      setBusy(false);
    }
  };

  const saveStock = () =>
    run(async () => {
      let notified = 0;
      for (const v of changed) {
        const n = Number(stock[v.id]);
        if (!Number.isInteger(n) || n < 0) throw new Error(`${v.color} / ${v.size}: enter a whole number, 0 or more.`);
        const r = await api<{ notified?: number }>(`/admin/variants/${v.id}`, { method: "PATCH", body: { stock: n, expected: v.stock } });
        notified += r.notified ?? 0;
      }
      return (
        `Saved stock for ${changed.length} ${changed.length === 1 ? "variant" : "variants"}.` +
        (notified ? ` Emailed ${notified} ${notified === 1 ? "person" : "people"} who asked to be notified.` : "")
      );
    });
  const savePrice = () =>
    run(async () => {
      await api(`/admin/products/${p.slug}`, { method: "PATCH", body: { price: Number(price), compareAt: numOrNull(compareAt) } });
      return "Price saved.";
    });
  const toggleActive = () =>
    run(async () => {
      await api(`/admin/products/${p.slug}`, { method: "PATCH", body: { isActive: !p.isActive } });
      return p.isActive ? "Hidden from the shop." : "Showing in the shop.";
    });

  return (
    <li className={"border border-line p-5 " + (p.isActive ? "" : "opacity-70")}>
      <div className="flex flex-wrap items-start gap-4">
        <span className="relative overflow-hidden shot border border-line w-16 aspect-[4/5] shrink-0">
          <ProductVisual p={p as any} color={colors[0]} pad="p-1" />
        </span>
        <div className="flex-1 min-w-[180px]">
          <h3 className="text-[15px] text-bone">{p.name}</h3>
          <p className="text-[12px] text-ash">{`${p.category} · ${total} in stock`}</p>
          {!p.isActive && <p className="mt-1 text-[12px] font-mono uppercase tracking-[0.1em] text-amber">Hidden from shop</p>}
          <p className="mt-1 text-[11px] text-ash">
            {`Added ${new Date(p.createdAt).toLocaleDateString()}`}
            {p.isNew && <span className="ml-2 px-1.5 border border-amber text-amber font-mono font-bold">NEW</span>}
            {p.isLimited && <span className="ml-2 font-mono uppercase tracking-[0.1em] text-amber">Limited</span>}
          </p>
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="mt-1 text-[12px] text-ash underline underline-offset-4 hover:text-amber">
              Edit details
            </button>
          )}
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="block text-[11px] text-ash mb-1">Price ฿</span>
              <input value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" className={inputCls + " w-[110px] font-mono"} />
            </label>
            <label className="block">
              <span className="block text-[11px] text-ash mb-1">Original ฿ (if on sale)</span>
              <input value={compareAt} onChange={e => setCompareAt(e.target.value)} inputMode="decimal" placeholder="—" className={inputCls + " w-[130px] font-mono"} />
            </label>
            <button onClick={savePrice} disabled={busy || !priceChanged} className={btnSmPrimary + " h-10"}>
              Save price
            </button>
            <button onClick={toggleActive} disabled={busy} className={btnSmGhost + " h-10"}>
              {p.isActive ? "Hide" : "Show"}
            </button>
          </div>
        ) : (
          <p className="font-mono text-[14px] text-bone">
            {money(p.price)}
            {p.compareAt != null && <span className="ml-2 text-ash line-through">{money(p.compareAt)}</span>}
          </p>
        )}
      </div>

      {editing && (
        <DetailsForm
          p={p}
          onCancel={() => setEditing(false)}
          onSave={async body => {
            await run(async () => {
              await api(`/admin/products/${p.slug}`, { method: "PATCH", body });
              setEditing(false);
              return "Details saved.";
            });
          }}
        />
      )}
      <div className="mt-4 overflow-x-auto">
        <table className="text-[12px]">
          <thead>
            <tr>
              <th className="pr-3 py-1 text-left font-normal text-ash">Color</th>
              {sizes.map(s => (
                <th key={s} className="px-1 py-1 font-normal text-ash">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map(c => (
              <tr key={c}>
                <td className="pr-3 py-1 text-bone/85 whitespace-nowrap">{c}</td>
                {sizes.map(s => {
                  const v = p.variants.find(x => x.color === c && x.size === s);
                  if (!v) return <td key={s} className="px-1 text-ash text-center">—</td>;
                  const val = stock[v.id] ?? String(v.stock);
                  const dirty = val !== String(v.stock);
                  return (
                    <td key={s} className="px-1 py-1 align-top">
                      <input
                        value={val}
                        onChange={e => setStock(m => ({ ...m, [v.id]: e.target.value.replace(/[^\d]/g, "") }))}
                        inputMode="numeric"
                        aria-label={`Stock ${c} ${s}`}
                        className={
                          "w-14 h-9 px-2 bg-transparent border text-center font-mono text-[13px] outline-none focus:border-amber " +
                          (dirty ? "border-amber text-amber" : v.stock === 0 ? "border-line text-red-300" : "border-line text-bone")
                        }
                      />
                      {v.waiting > 0 && (
                        <span className="block mt-0.5 text-center text-[10px] text-amber" title="People waiting for a back-in-stock email">
                          {`${v.waiting} waiting`}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={saveStock} disabled={busy || changed.length === 0} className={btnSmPrimary}>
          {changed.length ? `Save stock (${changed.length})` : "Save stock"}
        </button>
        {changed.length > 0 && (
          <button onClick={() => setStock({})} disabled={busy} className="text-[12px] text-ash underline underline-offset-4 hover:text-bone">
            Undo changes
          </button>
        )}
        {msg && <span className="text-[12px] text-amber">{msg}</span>}
        {isAdmin && (
          <span className="ml-auto flex flex-wrap gap-2">
            <AddVariant
              p={p}
              onDone={async (text, isError) => {
                setMsg(isError ? "" : text);
                setError(isError ? text : "");
                await reload();
              }}
            />
          </span>
        )}
      </div>
      <ErrorLine text={error} />
      {isAdmin && (
        <PhotoManager
          p={p}
          colors={colors}
          onDone={async (text, isError) => {
            setMsg(isError ? "" : text);
            setError(isError ? text : "");
            await reload();
            shop.refresh().catch(() => {});
          }}
        />
      )}
    </li>
  );
}

/** Admin: name, description and Limited. The slug can't change (it's in links and old orders). */
function DetailsForm({ p, onCancel, onSave }: {
  p: AdminProduct;
  onCancel: () => void;
  onSave: (body: { name: string; description: string; isLimited: boolean }) => Promise<void>;
}) {
  const [name, setName] = useState(p.name);
  const [description, setDescription] = useState(p.description);
  const [isLimited, setIsLimited] = useState(p.isLimited);
  const [busy, setBusy] = useState(false);
  const changed = name.trim() !== p.name || description.trim() !== p.description || isLimited !== p.isLimited;
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        setBusy(true);
        await onSave({ name: name.trim(), description: description.trim(), isLimited });
        setBusy(false);
      }}
      className="mt-4 border border-amber/60 p-4 grid gap-3"
    >
      <label className="block">
        <span className="block text-[12px] text-ash mb-1.5">Name</span>
        <input value={name} onChange={e => setName(e.target.value)} maxLength={120} className={inputCls + " w-full"} />
      </label>
      <label className="block">
        <span className="block text-[12px] text-ash mb-1.5">Description</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full p-3 bg-transparent border border-line text-[13px] text-bone outline-none focus:border-amber"
        />
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isLimited} onChange={e => setIsLimited(e.target.checked)} className="w-4 h-4 accent-amber" />
        <span className="text-[13px] text-bone">Limited (shows "Drop 001")</span>
      </label>
      <p className="text-[11px] text-ash">{`Link stays the same: #/product/${p.slug}`}</p>
      <div className="flex gap-2">
        <button disabled={busy || !changed || !name.trim() || !description.trim()} className={btnSmPrimary}>
          {busy ? "Saving…" : "Save details"}
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={btnSmGhost}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Admin: upload, reorder (make main) and delete product photos. */
function PhotoManager({ p, colors, onDone }: { p: AdminProduct; colors: string[]; onDone: (msg: string, isError?: boolean) => Promise<void> }) {
  const [color, setColor] = useState(""); // "" = every color
  const [busy, setBusy] = useState("");
  const [askDelete, setAskDelete] = useState<AdminImage | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    let done = 0;
    try {
      for (const f of Array.from(files)) {
        setBusy(`Uploading ${done + 1} of ${files.length}…`);
        const form = new FormData();
        form.append("image", f);
        form.append("color", color);
        await api(`/admin/products/${p.slug}/images`, { form });
        done++;
      }
      await onDone(`Uploaded ${done} ${done === 1 ? "photo" : "photos"}.`);
    } catch (e) {
      await onDone(`${done ? `Uploaded ${done}, then: ` : ""}${(e as Error).message}`, true);
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const act = async (fn: () => Promise<unknown>, text: string) => {
    setBusy("Saving…");
    try {
      await fn();
      await onDone(text);
    } catch (e) {
      await onDone((e as Error).message, true);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-line">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-ash mr-2">{`Photos (${p.images.length})`}</span>
        <select
          value={color}
          onChange={e => setColor(e.target.value)}
          aria-label="Photo is for color"
          className="h-9 px-2 bg-ink border border-line text-[12px] text-bone outline-none focus:border-amber"
        >
          <option value="">For every color</option>
          {colors.map(c => (
            <option key={c} value={c}>{`For ${c}`}</option>
          ))}
        </select>
        <label className={btnSmGhost + " inline-flex items-center cursor-pointer " + (busy ? "opacity-40 pointer-events-none" : "")}>
          + Upload photos
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={e => upload(e.target.files)}
          />
        </label>
        <span className="text-[11px] text-ash">{busy || "JPG, PNG or WebP, up to 10 MB. Portrait 4:5 looks best."}</span>
      </div>
      {p.images.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {p.images.map((im, i) => (
            <li key={im.id} className="w-[104px]">
              <div className={"relative aspect-[4/5] overflow-hidden border " + (i === 0 ? "border-amber" : "border-line")}>
                <img src={imgUrl(im.file)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                {i === 0 && <span className="absolute top-1 left-1 bg-amber text-noir font-mono text-[9px] font-bold px-1">MAIN</span>}
              </div>
              <p className="mt-1 text-[11px] text-ash truncate">{im.color ?? "Every color"}</p>
              <div className="flex gap-2 text-[11px]">
                {i > 0 && (
                  <button
                    onClick={() => act(() => api(`/admin/images/${im.id}/first`, { method: "POST" }), "Main photo changed.")}
                    disabled={!!busy}
                    className="text-ash underline underline-offset-2 hover:text-amber disabled:opacity-40"
                  >
                    Make main
                  </button>
                )}
                <button
                  onClick={() => setAskDelete(im)}
                  disabled={!!busy}
                  className="text-ash underline underline-offset-2 hover:text-red-300 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog
        open={!!askDelete}
        icon="!"
        title="Delete photo?"
        body="The photo is removed from the shop and the file is deleted. This can't be undone."
        onClose={() => setAskDelete(null)}
        actions={
          <>
            <button onClick={() => setAskDelete(null)} className={btnGhost + " flex-1"}>
              Keep
            </button>
            <button
              data-autofocus
              onClick={() => {
                const im = askDelete!;
                setAskDelete(null);
                act(() => api(`/admin/images/${im.id}`, { method: "DELETE" }), "Photo deleted.");
              }}
              className={btnPrimary + " flex-1"}
            >
              Delete
            </button>
          </>
        }
      />
    </div>
  );
}

/* =========================================================
   SITE SETTINGS (admin only): promo bar
   ========================================================= */
function SiteTab() {
  const shop = React.useContext(ShopCtx);
  const [bar, setBar] = useState<{ enabled: boolean; messages: string[] } | null>(null);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ promoBar: { enabled: boolean; messages: string[] } }>("/settings")
      .then(r => {
        setBar(r.promoBar);
        setSaved(JSON.stringify(r.promoBar));
      })
      .catch(e => setError((e as Error).message));
  }, []);
  if (!bar) return <section className="mt-8">{error ? <ErrorLine text={error} /> : <p className="text-ash">Loading…</p>}</section>;

  const setLine = (i: number, v: string) => setBar({ ...bar, messages: bar.messages.map((m, j) => (j === i ? v : m)) });
  const clean = { enabled: bar.enabled, messages: bar.messages.map(m => m.trim()).filter(Boolean) };
  const dirty = JSON.stringify(clean) !== saved;
  const save = async () => {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const r = await api<{ promoBar: typeof clean }>("/admin/settings/promo-bar", { method: "PUT", body: clean });
      setBar(r.promoBar);
      setSaved(JSON.stringify(r.promoBar));
      await shop.refreshSettings(); // the bar at the top of this page updates too
      setMsg("Saved. The bar is live on every page.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-8 max-w-[760px]">
      <h2 className="font-display text-[36px] leading-none text-bone">Promo bar</h2>
      <p className="mt-2 text-[13px] text-ash">The scrolling line at the very top of every page. Up to 6 short messages, shown in capitals.</p>

      <label className="mt-5 flex items-center gap-2 cursor-pointer w-fit">
        <input type="checkbox" checked={bar.enabled} onChange={e => setBar({ ...bar, enabled: e.target.checked })} className="w-4 h-4 accent-amber" />
        <span className="text-[13px] text-bone">Show the promo bar</span>
      </label>

      <ol className="mt-4 space-y-2">
        {bar.messages.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-6 pt-2.5 text-right font-mono text-[12px] text-ash">{i + 1}</span>
            <input
              value={m}
              onChange={e => setLine(i, e.target.value)}
              maxLength={80}
              placeholder="e.g. Use VVRN10 for 10% off"
              aria-label={`Message ${i + 1}`}
              className={inputCls + " flex-1"}
            />
            <button
              type="button"
              onClick={() => setBar({ ...bar, messages: bar.messages.filter((_, j) => j !== i) })}
              disabled={bar.messages.length === 1}
              aria-label={`Remove message ${i + 1}`}
              className="w-10 h-10 border border-line text-ash hover:text-red-300 hover:border-red-400/50 disabled:opacity-30"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      {bar.messages.length < 6 && (
        <button
          type="button"
          onClick={() => setBar({ ...bar, messages: [...bar.messages, ""] })}
          className="mt-2 ml-8 text-[12px] text-ash underline underline-offset-4 hover:text-amber"
        >
          + Add message
        </button>
      )}

      <p className="mt-6 text-[12px] text-ash">Preview</p>
      <div className="mt-1.5 border border-line">
        {clean.enabled && clean.messages.length ? (
          <Marquee bar={clean} />
        ) : (
          <p className="px-3 py-1.5 text-[12px] text-ash">{clean.enabled ? "Add a message to show the bar." : "The bar is hidden."}</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={busy || !dirty || (clean.enabled && !clean.messages.length)} className={btnSmPrimary + " h-10"}>
          {busy ? "Saving…" : "Save"}
        </button>
        {msg && <span className="text-[13px] text-amber">{msg}</span>}
      </div>
      <ErrorLine text={error} />
    </section>
  );
}

/* =========================================================
   DISCOUNT CODES (admin only)
   ========================================================= */
interface AdminCode {
  id: number; code: string; percentOff: number; onePerAccount: boolean; isActive: boolean;
  expiresAt: string | null; createdAt: string; uses: number; givenAway: number;
}

function DiscountsTab() {
  const [codes, setCodes] = useState<AdminCode[] | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [f, setF] = useState({ code: "", percentOff: "10", onePerAccount: true, expires: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCodes(await api<AdminCode[]>("/admin/discounts"));
    } catch (e) {
      setError((e as Error).message);
      setCodes([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      await api("/admin/discounts", {
        body: {
          code: f.code.trim(),
          percentOff: Number(f.percentOff),
          onePerAccount: f.onePerAccount,
          // End of the chosen day, Thai time
          expiresAt: f.expires ? new Date(`${f.expires}T23:59:59+07:00`).toISOString() : null,
        },
      });
      setMsg(`Created ${f.code.trim().toUpperCase()}.`);
      setF({ code: "", percentOff: "10", onePerAccount: true, expires: "" });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (c: AdminCode) => {
    setError("");
    try {
      await api(`/admin/discounts/${c.id}`, { method: "PATCH", body: { isActive: !c.isActive } });
      setMsg(`${c.code} is now ${c.isActive ? "off" : "on"}.`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const expired = (c: AdminCode) => !!c.expiresAt && new Date(c.expiresAt) <= new Date();
  return (
    <section className="mt-8">
      <form onSubmit={create} className="border border-line p-5 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="block text-[12px] text-ash mb-1.5">Code</span>
          <input
            value={f.code}
            onChange={e => setF({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
            placeholder="VVRN10"
            maxLength={30}
            className={inputCls + " w-[160px] font-mono"}
          />
        </label>
        <label className="block">
          <span className="block text-[12px] text-ash mb-1.5">% off</span>
          <input
            value={f.percentOff}
            onChange={e => setF({ ...f, percentOff: digits(e.target.value, 2) })}
            inputMode="numeric"
            className={inputCls + " w-[80px] font-mono"}
          />
        </label>
        <label className="block">
          <span className="block text-[12px] text-ash mb-1.5">Expires (optional)</span>
          <input type="date" value={f.expires} onChange={e => setF({ ...f, expires: e.target.value })} className={inputCls + " w-[160px]"} />
        </label>
        <label className="flex items-center gap-2 h-10 cursor-pointer">
          <input type="checkbox" checked={f.onePerAccount} onChange={e => setF({ ...f, onePerAccount: e.target.checked })} className="w-4 h-4 accent-amber" />
          <span className="text-[13px] text-bone">Once per account</span>
        </label>
        <button disabled={busy || f.code.length < 3 || !f.percentOff} className={btnSmPrimary + " h-10"}>
          {busy ? "Saving…" : "Create code"}
        </button>
      </form>
      <p className="mt-3 text-[12px] text-ash">
        Codes take a percent off the subtotal (not shipping) and need the customer to be logged in. If an order is cancelled, a
        once-per-account code can be used again.
      </p>
      {msg && <p className="mt-3 text-[13px] text-amber">{msg}</p>}
      <ErrorLine text={error} />
      {codes === null ? (
        <p className="mt-10 text-ash">Loading codes…</p>
      ) : codes.length === 0 ? (
        <p className="mt-10 text-ash">No codes yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full text-[13px]">
            <thead className="border-b border-line text-ash">
              <tr>
                <th className="text-left font-normal px-4 py-3">Code</th>
                <th className="text-right font-normal px-4 py-3">Off</th>
                <th className="text-left font-normal px-4 py-3">Limit</th>
                <th className="text-left font-normal px-4 py-3">Expires</th>
                <th className="text-right font-normal px-4 py-3">Used</th>
                <th className="text-right font-normal px-4 py-3">Given away</th>
                <th className="text-left font-normal px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {codes.map(c => (
                <tr key={c.id} className={c.isActive && !expired(c) ? "" : "opacity-60"}>
                  <td className="px-4 py-3 font-mono text-bone">{c.code}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber">{`${c.percentOff}%`}</td>
                  <td className="px-4 py-3 text-bone/85">{c.onePerAccount ? "Once per account" : "No limit"}</td>
                  <td className="px-4 py-3 text-ash whitespace-nowrap">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3 text-right font-mono text-bone/85">{c.uses}</td>
                  <td className="px-4 py-3 text-right font-mono text-bone/85">{money(c.givenAway)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(c)}
                      className={
                        "h-8 px-3 border text-[12px] " +
                        (c.isActive ? "border-amber/60 text-amber hover:border-amber" : "border-line text-ash hover:border-white/40")
                      }
                    >
                      {expired(c) ? "Expired" : c.isActive ? "On" : "Off"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   USERS (admin only)
   ========================================================= */
interface AdminUser { id: number; name: string; email: string; role: string; createdAt: string; orderCount: number }

function UsersTab({ me }: { me: number }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ u: AdminUser; role: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await api<AdminUser[]>("/admin/users" + (search ? "?q=" + encodeURIComponent(search) : "")));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setUsers([]);
    }
  }, [search]);
  useEffect(() => {
    load();
  }, [load]);

  const apply = async () => {
    if (!pending) return;
    try {
      await api(`/admin/users/${pending.u.id}/role`, { method: "PATCH", body: { role: pending.role } });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="mt-8">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={e => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or email" aria-label="Search users" className={inputCls + " w-[260px]"} />
        <button className={btnSmGhost + " h-10"}>Search</button>
      </form>
      <p className="mt-3 text-[12px] text-ash">
        Staff can manage orders and stock. Admins can also cancel orders, change prices and manage roles.
      </p>
      <ErrorLine text={error} />
      {users === null ? (
        <p className="mt-10 text-ash">Loading users…</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full text-[13px]">
            <thead className="border-b border-line text-ash">
              <tr>
                <th className="text-left font-normal px-4 py-3">Name</th>
                <th className="text-left font-normal px-4 py-3">Email</th>
                <th className="text-right font-normal px-4 py-3">Orders</th>
                <th className="text-left font-normal px-4 py-3">Joined</th>
                <th className="text-left font-normal px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-bone">{u.name}{u.id === me && <span className="text-ash"> (you)</span>}</td>
                  <td className="px-4 py-3 text-bone/85">{u.email}</td>
                  <td className="px-4 py-3 text-right font-mono text-bone/85">{u.orderCount}</td>
                  <td className="px-4 py-3 text-ash whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={u.id === me}
                      onChange={e => setPending({ u, role: e.target.value })}
                      aria-label={`Role for ${u.name}`}
                      className={
                        "h-9 px-2 bg-ink border border-line text-[12px] outline-none focus:border-amber disabled:opacity-50 " +
                        (u.role === "customer" ? "text-bone" : "text-amber")
                      }
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog
        open={!!pending}
        icon="⚑"
        title="Change role?"
        body={pending ? `${pending.u.name} (${pending.u.email}) becomes ${pending.role}. It takes effect right away.` : ""}
        onClose={() => setPending(null)}
        actions={
          <>
            <button onClick={() => setPending(null)} className={btnGhost + " flex-1"}>
              Keep
            </button>
            <button data-autofocus onClick={apply} className={btnPrimary + " flex-1"}>
              Change role
            </button>
          </>
        }
      />
    </section>
  );
}
