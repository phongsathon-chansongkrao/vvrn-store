import React, { useState } from "react";
import { ProductVisual } from "./ProductVisual";
import { productHref } from "../lib/router";
import { findProduct } from "../lib/catalog";
import { TRACK_STEPS, fmtTime, money } from "../lib/data";

export function Timeline({ o }: any) {
  const at: any = {};
  let tracking = null;
  for (const e of o.events) {
    if (!at[e.status]) at[e.status] = e.at;
    if (e.trackingNo) tracking = e.trackingNo;
  }
  const cancelled = o.status === "cancelled";
  const lastIdx = TRACK_STEPS.reduce((m, [k], i) => (at[k] ? i : m), -1);
  return (
    <div>
      <ol>
        {TRACK_STEPS.map(([key, name], i) => {
          const reached = !!at[key],
            current = i === lastIdx && !cancelled;
          const label =
            key === "paid" && !reached && o.payment.method === "qr" ? "Payment confirmed (checking your slip)" : name;
          return (
            <li key={key} className="relative flex gap-4 pb-5 last:pb-0">
              {i < TRACK_STEPS.length - 1 && (
                <span className={"absolute left-[7px] top-5 bottom-0 w-px " + (i < lastIdx ? "bg-amber" : "bg-line")} />
              )}
              <span
                className={
                  "relative mt-1 w-[15px] h-[15px] shrink-0 border " +
                  (reached ? "bg-amber border-amber" : "bg-ink border-white/30")
                }
              />
              <span>
                <span className={"block text-[13px] " + (current ? "text-amber" : reached ? "text-bone" : "text-ash")}>
                  {label}
                </span>
                {reached && <span className="block text-[12px] text-ash">{fmtTime(at[key])}</span>}
                {key === "shipped" && reached && tracking && (
                  <span className="block mt-0.5 text-[12px] font-mono text-bone/85">{"Tracking no. " + tracking}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {cancelled && (
        <p className="mt-4 border border-red-400/40 p-3 text-[13px] text-red-300">
          {"This order was cancelled" + (at.cancelled ? " on " + fmtTime(at.cancelled) : "") + "."}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ o }: any) {
  const quiet = o.status === "delivered" || o.status === "cancelled";
  return (
    <span
      className={
        "text-[12px] px-2 py-0.5 border " + (quiet ? "border-white/30 text-bone/80" : "border-amber/60 text-amber")
      }
    >
      {o.statusLabel}
    </span>
  );
}

export function OrderCard({ o }: any) {
  const [open, setOpen] = useState(false);
  const d = new Date(o.date);
  const count = o.items.reduce((s, it) => s + it.qty, 0);
  return (
    <li className="border border-line">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 hover:bg-white/[0.02]"
      >
        <span className="font-mono text-[13px] text-bone">{o.no}</span>
        <span className="text-[13px] text-ash">
          {d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-[13px] text-ash">{`${count} ${count === 1 ? "item" : "items"}`}</span>
        <StatusPill o={o} />
        <span className="ml-auto font-mono text-[14px] text-bone">{money(o.total)}</span>
        <span className={"text-ash transition-transform " + (open ? "rotate-90" : "")} aria-hidden={true}>
          ›
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[13px] text-ash mb-4">Tracking</h3>
              <Timeline o={o} />
            </div>
            <OrderDetails o={o} />
          </div>
          <ul className="mt-6 pt-2 border-t border-line divide-y divide-line">
            {o.items.map((it, i) => (
              <li key={i} className="flex gap-3 py-3">
                <a
                  href={productHref(it.id, it.color)}
                  className="relative overflow-hidden shot border border-line w-14 aspect-[4/5] shrink-0"
                >
                  <ProductVisual p={findProduct(it.id)} type={it.type} color={it.color} pad="p-1" />
                </a>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] text-bone">{it.name}</span>
                  <span className="block text-[12px] text-ash">{`${it.color} / ${it.size} · Qty ${it.qty}`}</span>
                </span>
                <a
                  href={productHref(it.id, it.color) + ""}
                  className="hidden sm:inline self-center text-[12px] text-ash underline underline-offset-4 hover:text-amber"
                >
                  Review
                </a>
                <span className="font-mono text-[13px] text-bone">{money(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function OrderDetails({ o }: any) {
  return (
    <dl className="space-y-3 text-[13px]">
      <div>
        <dt className="text-ash">Ship to</dt>
        <dd className="text-bone/85 mt-0.5 leading-[1.5]">
          {o.address.name}
          <br />
          {[o.address.line1, o.address.line2, o.address.city, o.address.region, o.address.postal, o.address.country]
            .filter(Boolean)
            .join(", ")}
        </dd>
      </div>
      <div>
        <dt className="text-ash">Delivery</dt>
        <dd className="text-bone/85 mt-0.5">{`${o.shipping.name}, ${o.shipping.eta}`}</dd>
      </div>
      <div>
        <dt className="text-ash">Payment</dt>
        <dd className="text-bone/85 mt-0.5">
          {o.payment.method === "card"
            ? `${o.payment.brand} ending ${o.payment.last4}`
            : `QR transfer (${o.payment.slipName})`}
        </dd>
      </div>
      <div className="pt-3 border-t border-line space-y-1">
        <div className="flex justify-between">
          <dt className="text-ash">Subtotal</dt>
          <dd className="font-mono text-bone">{money(o.subtotal)}</dd>
        </div>
        {o.discount && (
          <div className="flex justify-between">
            <dt className="text-ash">{`Discount (${o.discount.code})`}</dt>
            <dd className="font-mono text-amber">{"−" + money(o.discount.amount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ash">Shipping</dt>
          <dd className="font-mono text-bone">{o.shippingFee ? money(o.shippingFee) : "Free"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ash">Total</dt>
          <dd className="font-mono text-amber">{money(o.total)}</dd>
        </div>
      </div>
    </dl>
  );
}
