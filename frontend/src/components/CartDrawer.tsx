import React, { useEffect, useRef } from "react";
import { ProductVisual } from "./ProductVisual";
import { productHref } from "../lib/router";
import { Stepper } from "./ui";
import { money } from "../lib/data";
import { findProduct } from "../lib/catalog";
import { ShopCtx } from "../lib/context";

export function CartDrawer({ open, items, onClose, onQty, onRemove }: any) {
  const panelRef = useRef(null);
  const shop = React.useContext(ShopCtx);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current && panelRef.current.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const subtotal = items.reduce((s, it) => s + findProduct(it.id).price * it.qty, 0);
  return (
    <div className={"fixed inset-0 z-50 " + (open ? "" : "pointer-events-none")} aria-hidden={!open}>
      <div className={"scrim absolute inset-0 bg-black/60 " + (open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Cart"
        className={
          "drawer absolute top-0 right-0 h-full w-full max-w-[420px] bg-ink border-l border-line flex flex-col outline-none " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-line">
          <h2 className="font-display text-[32px] leading-none text-bone">Cart</h2>
          <button onClick={onClose} className="p-2 text-bone" aria-label="Close cart">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <p className="text-bone">Your cart is empty.</p>
              <a
                href="#/stockists"
                onClick={onClose}
                className="mt-4 inline-block border border-amber px-5 py-3 font-mono text-[11px] tracking-[0.12em] uppercase text-amber hover:bg-amber hover:text-noir"
              >
                Browse Stockists
              </a>
            </div>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-line">
            {items.map((it) => {
              const p = findProduct(it.id);
              return (
                <li key={it.key} className="flex gap-4 px-6 py-5">
                  <a
                    href={productHref(p.id, it.color)}
                    onClick={onClose}
                    className="relative overflow-hidden shot border border-line w-20 aspect-[4/5] shrink-0"
                  >
                    <ProductVisual p={p} color={it.color} pad="p-2" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <p className="text-[14px] font-medium text-bone truncate">{p.name}</p>
                      <p className="font-mono text-[13px] text-bone">{money(p.price * it.qty)}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-ash">{`${it.color} / ${it.size}`}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Stepper
                        value={it.qty}
                        compact
                        max={Math.max(1, Math.min(10, shop.stockOf(p, it.color, it.size)))}
                        onChange={(q) => onQty(it.key, q)}
                      />
                      <button
                        onClick={() => onRemove(it.key)}
                        className="text-[12px] text-ash underline underline-offset-4 hover:text-bone"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="flex justify-between text-[14px]">
              <span className="text-ash">Subtotal</span>
              <span className="font-mono text-bone">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-[12px] text-ash">Standard shipping is free. Choose delivery at checkout.</p>
            <a
              href="#/checkout"
              onClick={onClose}
              className="mt-4 w-full h-12 inline-flex items-center justify-center bg-amber text-noir font-mono text-[12px] tracking-[0.12em] uppercase hover:brightness-110"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
