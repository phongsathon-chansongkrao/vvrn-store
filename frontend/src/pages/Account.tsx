import React, { useState } from "react";
import { ProductVisual } from "../components/ProductVisual";
import { productHref } from "../lib/router";
import { LikeButton, Price } from "../components/ui";
import { btnGhost, btnPrimary } from "../components/forms";
import { Dialog } from "../components/Dialog";
import { AuthShell } from "./Auth";
import { OrderCard } from "../components/Orders";
import { getCatalog } from "../lib/catalog";
import { AuthCtx, ShopCtx } from "../lib/context";

export function Account() {
  const auth = React.useContext(AuthCtx);
  const shop = React.useContext(ShopCtx);
  const [ask, setAsk] = useState(false);
  if (!auth.user) {
    return (
      <AuthShell title="Your account" sub="Log in or create an account to see your order history.">
        <div className="mt-8 flex gap-3">
          <a href="#/login" className={btnPrimary + " flex-1 inline-flex items-center justify-center"}>
            Log in
          </a>
          <a href="#/register" className={btnGhost + " flex-1 inline-flex items-center justify-center"}>
            Create account
          </a>
        </div>
        <p className="mt-6 text-[13px] text-bone/75">
          {"Checked out as a guest? "}
          <a href="#/track" className="text-amber underline underline-offset-4">
            Track your order
          </a>
        </p>
      </AuthShell>
    );
  }
  const orders = auth.orders;
  const a = auth.user.address;
  const liked = getCatalog().filter((p) => shop.likes.includes(p.id));
  const signOut = () => {
    setAsk(false);
    auth.logout();
    location.hash = "#/";
  };
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.9] text-bone">{auth.user.name}</h1>
          <p className="mt-2 text-[13px] text-ash">{auth.user.email}</p>
        </div>
        <button onClick={() => setAsk(true)} className={btnGhost}>
          Log out
        </button>
      </div>
      <Dialog
        open={ask}
        icon="↪"
        title="Sign out?"
        body="Do you want to sign out? Your cart stays in this browser and your order history will be here when you log back in."
        onClose={() => setAsk(false)}
        actions={[
          <button key="no" data-autofocus={true} onClick={() => setAsk(false)} className={btnGhost + " flex-1"}>
            No, stay
          </button>,
          <button key="yes" onClick={signOut} className={btnPrimary + " flex-1"}>
            Yes, sign out
          </button>,
        ]}
      />
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
        <div className="space-y-14">
          <section>
            <h2 className="font-display text-[36px] leading-none text-bone">Order history</h2>
            {orders.length === 0 ? (
              <div className="mt-6 border border-line p-8 text-center">
                <p className="text-bone/75">No orders yet. Your first one will show up here.</p>
                <a href="#/stockists" className={btnPrimary + " mt-5 inline-flex items-center"}>
                  Browse Stockists
                </a>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {orders.map((o) => (
                  <OrderCard key={o.no} o={o} />
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="font-display text-[36px] leading-none text-bone">Liked</h2>
            {liked.length === 0 ? (
              <p className="mt-4 text-[14px] text-ash">Tap the heart on any product to save it here.</p>
            ) : (
              <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {liked.map((p) => (
                  <li key={p.id} className="relative">
                    <a href={productHref(p.id)} className="group block">
                      <span
                        className={
                          "relative overflow-hidden block shot border border-line aspect-[4/5] " +
                          (shop.totalStock(p) === 0 ? "opacity-50" : "")
                        }
                      >
                        <ProductVisual p={p} color={p.colors[0]} pad="p-[14%]" />
                      </span>
                      <span className="mt-2 block text-[13px] text-bone group-hover:text-amber">{p.name}</span>
                      <span className="block mt-0.5">
                        {shop.totalStock(p) === 0 ? (
                          <span className="text-[12px] text-ash">Sold out</span>
                        ) : (
                          <Price p={p} />
                        )}
                      </span>
                    </a>
                    <LikeButton p={p} className="absolute top-1 right-1 p-2 text-bone/80 hover:text-amber" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="border border-line p-6">
          <h2 className="font-display text-[28px] leading-none text-bone">Saved address</h2>
          {a ? (
            <p className="mt-4 text-[13px] text-bone/80 leading-[1.6]">
              {a.name}
              <br />
              {a.phone}
              <br />
              {[a.line1, a.line2, a.city, a.region, a.postal, a.country].filter(Boolean).join(", ")}
            </p>
          ) : (
            <p className="mt-4 text-[13px] text-ash">We'll save your address the first time you check out.</p>
          )}
          {a && (
            <button
              onClick={() => auth.saveAddress(null)}
              className="mt-4 text-[12px] text-ash underline underline-offset-4 hover:text-bone"
            >
              Remove address
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */
