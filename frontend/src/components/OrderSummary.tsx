import React, { useState } from "react";
import { ProductVisual } from "./ProductVisual";
import { money } from "../lib/data";
import { findProduct } from "../lib/catalog";

/** Same rounding as the server (backend/src/lib/discounts.ts). The server decides the real amount. */
export const discountOff = (subtotal: number, percentOff: number) => Math.round((subtotal * percentOff) / 100);

export function OrderSummary({ items, shippingFee, discount, onApply, onRemove, loggedIn }: any) {
  const subtotal = items.reduce((s, it) => s + findProduct(it.id).price * it.qty, 0);
  const off = discount ? discountOff(subtotal, discount.percentOff) : 0;
  return (
    <aside className="border border-line p-6 lg:sticky lg:top-28">
      <h2 className="font-display text-[32px] leading-none text-bone">Your order</h2>
      <ul className="mt-5 divide-y divide-line border-y border-line">
        {items.map((it) => {
          const p = findProduct(it.id);
          return (
            <li key={it.key} className="flex gap-3 py-3">
              <span className="relative overflow-hidden shot border border-line w-14 aspect-[4/5] shrink-0">
                <ProductVisual p={p} color={it.color} pad="p-1" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] text-bone truncate">{p.name}</span>
                <span className="block text-[12px] text-ash">{`${it.color} / ${it.size} · Qty ${it.qty}`}</span>
              </span>
              <span className="font-mono text-[13px] text-bone">{money(p.price * it.qty)}</span>
            </li>
          );
        })}
      </ul>
      {onApply && <DiscountBox discount={discount} onApply={onApply} onRemove={onRemove} loggedIn={loggedIn} />}
      <dl className="mt-4 space-y-2 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-ash">Subtotal</dt>
          <dd className="font-mono text-bone">{money(subtotal)}</dd>
        </div>
        {discount && (
          <div className="flex justify-between">
            <dt className="text-ash">{`Discount (${discount.code}, ${discount.percentOff}%)`}</dt>
            <dd className="font-mono text-amber">{"−" + money(off)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ash">Shipping</dt>
          <dd className="font-mono text-bone">{shippingFee ? money(shippingFee) : "Free"}</dd>
        </div>
        <div className="flex justify-between pt-3 border-t border-line text-[15px]">
          <dt className="text-bone">Total</dt>
          <dd className="font-mono text-amber">{money(subtotal - off + shippingFee)}</dd>
        </div>
      </dl>
    </aside>
  );
}

/** Code field. onApply(code) returns an error message, or null when the code was accepted. */
function DiscountBox({ discount, onApply, onRemove, loggedIn }: any) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (discount) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 border border-amber/60 px-3 py-2.5">
        <span className="text-[13px] text-bone">
          <span className="font-mono text-amber">{discount.code}</span>
          {` applied · ${discount.percentOff}% off`}
        </span>
        <button type="button" onClick={onRemove} className="text-[12px] text-ash underline underline-offset-4 hover:text-bone">
          Remove
        </button>
      </div>
    );
  }
  if (!loggedIn) {
    return (
      <p className="mt-4 text-[12px] text-ash">
        {"Have a discount code? "}
        <a href="#/login?next=checkout" className="text-amber underline underline-offset-4">
          Log in
        </a>
        {" to use it."}
      </p>
    );
  }
  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Enter a code.");
    setBusy(true);
    const err = await onApply(code.trim());
    setBusy(false);
    setError(err || "");
    if (!err) setCode("");
  };
  return (
    <form onSubmit={apply} className="mt-4">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="Discount code"
          aria-label="Discount code"
          aria-invalid={!!error}
          maxLength={30}
          autoComplete="off"
          className={
            "flex-1 min-w-0 h-11 px-3 bg-transparent border font-mono text-[13px] text-bone uppercase placeholder:normal-case placeholder:font-body placeholder:text-white/25 outline-none " +
            (error ? "border-red-400/70" : "border-line focus:border-amber")
          }
        />
        <button disabled={busy} className="h-11 px-4 border border-line text-bone font-mono text-[11px] tracking-[0.1em] uppercase hover:border-amber hover:text-amber disabled:opacity-40">
          {busy ? "…" : "Apply"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[12px] text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
