import React, { useEffect, useRef } from "react";
import { btnGhost, btnPrimary } from "./forms";
import { money } from "../lib/data";

export function SuccessModal({ order, onClose, loggedIn }: any) {
  const ref = useRef(null);
  useEffect(() => {
    if (!order) return;
    ref.current && ref.current.focus();
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [order]);
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal={true}
        aria-labelledby="ok-title"
        className="toast relative w-full max-w-[440px] bg-ink border border-line p-8 text-center outline-none"
      >
        <div className="mx-auto w-14 h-14 grid place-items-center bg-amber text-noir text-[26px]">✓</div>
        <h2 id="ok-title" className="mt-5 font-display text-[44px] leading-none text-bone">
          Order placed
        </h2>
        <p className="mt-3 text-[14px] text-bone/75">
          {order.payment.method === "card"
            ? "Your payment went through. We'll email a confirmation and tracking details."
            : "We've received your slip and will confirm payment within 24 hours."}
        </p>
        <dl className="mt-6 border-y border-line divide-y divide-line text-[13px] text-left">
          <div className="flex justify-between py-2.5">
            <dt className="text-ash">Order number</dt>
            <dd className="font-mono text-bone">{order.no}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ash">Total</dt>
            <dd className="font-mono text-amber">{money(order.total)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ash">Delivery</dt>
            <dd className="text-bone">{order.shipping.name + ", " + order.shipping.eta}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {loggedIn ? (
            <a
              href="#/account"
              onClick={onClose}
              className={btnGhost + " flex-1 inline-flex items-center justify-center"}
            >
              Track in account
            </a>
          ) : (
            <a
              href="#/track"
              onClick={onClose}
              className={btnGhost + " flex-1 inline-flex items-center justify-center"}
            >
              Track order
            </a>
          )}
          <a
            href="#/stockists"
            onClick={onClose}
            className={btnPrimary + " flex-1 inline-flex items-center justify-center"}
          >
            Keep shopping
          </a>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GENERIC DIALOG
   ========================================================= */
