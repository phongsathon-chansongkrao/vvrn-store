import React, { useState, useEffect } from "react";
import { ProductVisual } from "../components/ProductVisual";
import { LikeButton, Price, ShareButton, Stars, Stepper, Swatch } from "../components/ui";
import { SizeGuide } from "../components/SizeGuide";
import { Reviews } from "../components/Reviews";
import { discountPct, money } from "../lib/data";
import { findProduct, getCatalog, photosFor, sizesOf } from "../lib/catalog";
import { ProductCard } from "./Stockists";
import { AuthCtx, ShopCtx } from "../lib/context";
import { api } from "../lib/api";

export function ProductDetail({ id, initialColor, onAdd }: any) {
  const shop = React.useContext(ShopCtx);
  const auth = React.useContext(AuthCtx);
  const p = findProduct(id);
  const sizes = sizesOf(p);
  const single = sizes.length === 1;
  const pick = (c) => (p.colors.includes(c) ? c : p.colors.find((x) => shop.colorStock(p, x) > 0) || p.colors[0]);
  const [color, setColor] = useState<any>(pick(initialColor));
  const photos = photosFor(p, color);
  const [shot, setShot] = useState(0); // which photo of the current color
  const shotIdx = shot < photos.length ? shot : 0;
  useEffect(() => setShot(0), [color]);
  const [size, setSize] = useState<any>(single ? sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [guide, setGuide] = useState(false);
  useEffect(() => {
    setColor(pick(initialColor));
    setSize(single ? sizes[0] : null);
    setQty(1);
  }, [id]);
  const stockFor = (s) => shop.stockOf(p, color, s);
  const left = size ? stockFor(size) : null;
  const inCart = size ? shop.inCart(p.id, color, size) : 0;
  const avail = size ? Math.max(0, left - inCart) : 0;
  const maxQty = Math.max(1, Math.min(10, avail));
  useEffect(() => {
    if (!single && size && stockFor(size) === 0) setSize(null);
  }, [color]);
  useEffect(() => {
    setQty((q) => Math.min(q, maxQty));
  }, [maxQty]);
  const out = shop.totalStock(p) === 0;
  const ready = !out && size && avail >= qty && avail > 0;
  const { avg, count } = shop.rating(p.id);
  const label = out
    ? "Sold out"
    : !size
      ? "Select a size"
      : left === 0
        ? "Sold out in this size"
        : avail === 0
          ? "All remaining units are in your cart"
          : `Add to cart · ${money(p.price * qty)}`;
  let stockNote = null;
  if (size && !out) {
    if (left === 0) stockNote = <p className="mt-2 text-[12px] text-ash">{`${color} / ${size} is sold out.`}</p>;
    else
      stockNote = (
        <p className={"mt-2 text-[12px] " + (left <= 5 ? "text-amber" : "text-bone/75")}>
          {left <= 5 ? `Only ${left} left in ${color} / ${size}.` : `${left} left in stock.`}
          {inCart > 0 && <span className="text-ash">{` ${inCart} already in your cart.`}</span>}
        </p>
      );
  }
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 lg:py-12">
      <nav className="text-[12px] text-ash mb-6" aria-label="Breadcrumb">
        <a href="#/stockists" className="hover:text-bone">
          Stockists
        </a>
        <span className="mx-2">/</span>
        <span className="text-bone">{p.name}</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16 items-start">
        <div>
          <div className="relative shot border border-line aspect-[4/5] overflow-hidden">
            <ProductVisual p={p} color={color} index={shotIdx} className={out ? "opacity-35 grayscale" : ""} />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setShot((shotIdx - 1 + photos.length) % photos.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center bg-ink/70 border border-line text-bone hover:text-amber"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setShot((shotIdx + 1) % photos.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center bg-ink/70 border border-line text-bone hover:text-amber"
                >
                  ›
                </button>
                <span className="absolute bottom-3 right-3 bg-ink/70 px-2 py-0.5 font-mono text-[11px] text-bone">
                  {`${shotIdx + 1} / ${photos.length}`}
                </span>
              </>
            )}
            {out && (
              <div className="absolute inset-0 grid place-items-center bg-ink/40 pointer-events-none">
                <span className="-rotate-6 border-[3px] border-bone bg-ink/85 px-8 lg:px-10 py-3 font-display text-[52px] lg:text-[72px] leading-none tracking-[0.08em] text-bone shadow-[0_0_0_10px_rgb(var(--ink)/0.55)]">
                  Sold out
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
              {!out && p.isNew && (
                <span className="border border-amber bg-ink/70 text-amber font-mono text-[11px] font-bold tracking-[0.1em] px-2.5 py-0.5">NEW</span>
              )}
              {!out && p.compareAt && (
                <span className="bg-amber text-noir font-mono text-[11px] font-bold px-2.5 py-1">{`-${discountPct(p)}%`}</span>
              )}
              {!out && p.limited && (
                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-amber">Drop 001</span>
              )}
            </div>
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto" role="group" aria-label="Photos">
              {photos.map((ph, i) => (
                <button
                  key={ph.id}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={i === shotIdx}
                  className={
                    "relative shrink-0 w-16 aspect-[4/5] overflow-hidden border " +
                    (i === shotIdx ? "border-amber" : "border-line hover:border-white/40")
                  }
                >
                  <ProductVisual p={p} color={color} index={i} />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-3">
            {p.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`View in ${c}`}
                className={
                  "relative shot w-20 aspect-[4/5] overflow-hidden border " +
                  (c === color ? "border-amber" : "border-line hover:border-white/40")
                }
              >
                <ProductVisual p={p} color={c} pad="p-2" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[12px] text-ash">{p.category}</p>
            <div className="flex items-center gap-4">
              <LikeButton p={p} big className="text-bone hover:text-amber" />
              <ShareButton p={p} color={color} />
            </div>
          </div>
          <h1 className="mt-1 font-display text-[48px] lg:text-[64px] leading-[0.9] text-bone">{p.name}</h1>
          {count > 0 && (
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("reviews").scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="mt-3 inline-flex items-center gap-2 text-[12px] text-ash hover:text-bone"
            >
              <Stars value={avg} size={14} />
              {`${avg.toFixed(1)} · ${count} reviews`}
            </a>
          )}
          <div className="mt-4">
            <Price p={p} size="lg" />
          </div>
          {p.compareAt && !out && (
            <p className="mt-1 text-[12px] text-amber">{`You save ${money(p.compareAt - p.price)}`}</p>
          )}
          <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.65] text-bone/75">{p.desc}</p>
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-[13px] text-ash">
              {"Color: "}
              <span className="text-bone">{color}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {p.colors.map((c) => (
                <Swatch
                  key={c}
                  color={c}
                  size="lg"
                  selected={c === color}
                  onClick={() => setColor(c)}
                  dim={!out && shop.colorStock(p, c) === 0}
                />
              ))}
            </div>
          </div>
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-ash">
                {"Size: "}
                <span className="text-bone">{size || "Choose a size"}</span>
              </p>
              <button
                type="button"
                onClick={() => setGuide(true)}
                className="inline-flex items-center gap-1.5 text-[12px] text-bone underline underline-offset-4 hover:text-amber"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <rect x={2} y={8} width={20} height={8} />
                  <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
                </svg>
                Size guide
              </button>
            </div>
            <div className={`mt-3 grid gap-2 ${single ? "grid-cols-2" : "grid-cols-5"}`}>
              {sizes.map((s) => {
                const none = stockFor(s) === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    title={none ? `${s} is sold out. Select it to get an email when it's back.` : s}
                    className={
                      "h-11 border text-[13px] font-medium transition-colors " +
                      (none
                        ? // Sold out but still selectable, for "Notify me"
                          size === s
                          ? "border-amber text-white/40 line-through"
                          : "border-line text-white/25 line-through hover:border-white/40"
                        : size === s
                          ? "border-amber bg-amber text-noir"
                          : "border-line text-bone hover:border-white/50")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {stockNote}
          </div>
          {!out && (
            <div className="mt-7">
              <p className="text-[13px] text-ash mb-3">Quantity</p>
              <Stepper value={qty} onChange={setQty} max={maxQty} />
            </div>
          )}
          {!auth.user && !out ? (
            // Shopping needs an account: send guests to log in, then straight back to this product and color
            <a
              href={`#/login?next=${encodeURIComponent(`product/${p.id}?c=${color}`)}`}
              className="mt-8 w-full h-14 inline-flex items-center justify-center font-mono text-[12px] tracking-[0.12em] uppercase bg-amber text-noir hover:brightness-110"
            >
              Log in to add to cart
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                ready &&
                onAdd({
                  id: p.id,
                  color,
                  size,
                  qty,
                })
              }
              disabled={!ready}
              className={
                "mt-8 w-full h-14 font-mono text-[12px] tracking-[0.12em] uppercase transition-colors " +
                (ready ? "bg-amber text-noir hover:brightness-110" : "border border-line text-ash cursor-not-allowed")
              }
            >
              {label}
            </button>
          )}
          {!auth.user && !out && (
            <p className="mt-2 text-[12px] text-ash">
              {"New here? "}
              <a href={`#/register?next=${encodeURIComponent(`product/${p.id}?c=${color}`)}`} className="text-amber underline underline-offset-4">
                Create an account
              </a>
              {" to shop."}
            </p>
          )}
          {size && left === 0 && <NotifyMe key={`${color}|${size}`} p={p} color={color} size={size} />}
          <ul className="mt-6 space-y-2 text-[12px] text-ash">
            <li>Free standard shipping on every order.</li>
            {p.limited && <li>Limited to 200 units. No restocks.</li>}
          </ul>
        </div>
      </div>
      <Reviews p={p} />
      <AlsoLike p={p} />
      <SizeGuide open={guide} guide={p.guide} highlight={size} onClose={() => setGuide(false)} />
    </main>
  );
}

/* =========================================================
   CART DRAWER + TOAST
   ========================================================= */

/** What goes with what, best match first. Same-category items only fill leftover slots. */
const PAIRS_WITH: Record<string, string[]> = {
  Tops: ["Bottoms", "Outerwear", "Footwear", "Accessories"],
  Outerwear: ["Tops", "Bottoms", "Footwear", "Accessories"],
  Bottoms: ["Tops", "Footwear", "Outerwear", "Accessories"],
  Footwear: ["Bottoms", "Tops", "Accessories", "Outerwear"],
  Accessories: ["Tops", "Outerwear", "Bottoms", "Footwear"],
};

/**
 * "Complete the look": up to 4 in-stock products that go WITH this one.
 * 1. Best product from each matching category, in PAIRS_WITH order (so a tee shows a jacket, pants and a cap).
 * 2. Still room? Next best from those categories, round and round.
 * 3. Still room? Same category as this product.
 * "Best" = the shop's usual order: NEW, then limited, then newest.
 */
function AlsoLike({ p }: any) {
  const shop = React.useContext(ShopCtx);
  const best = (a: any, b: any) =>
    (a.isNew ? 0 : a.limited ? 1 : 2) - (b.isNew ? 0 : b.limited ? 1 : 2) || b.createdAt.localeCompare(a.createdAt);
  const pool = getCatalog()
    .filter((x) => x.id !== p.id && shop.totalStock(x) > 0)
    .sort(best);
  const queues = (PAIRS_WITH[p.category] ?? []).map((c) => pool.filter((x) => x.category === c));
  const picks: any[] = [];
  while (picks.length < 4 && queues.some((q) => q.length)) {
    for (const q of queues) if (q.length && picks.length < 4) picks.push(q.shift());
  }
  for (const x of pool) if (picks.length < 4 && x.category === p.category) picks.push(x);
  if (!picks.length) return null;
  return (
    <section className="mt-16 lg:mt-24 border-t border-line pt-10" aria-labelledby="also-like">
      <h2 id="also-like" className="font-display text-[40px] lg:text-[48px] leading-none text-bone">
        Complete the look
      </h2>
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-10">
        {picks.map((x) => (
          <ProductCard key={x.id} p={x} />
        ))}
      </div>
    </section>
  );
}

/** Sold-out color/size: leave an email, get one message when an admin adds stock. */
function NotifyMe({ p, color, size }: any) {
  const auth = React.useContext(AuthCtx);
  const [email, setEmail] = useState<string>(auth.user?.email ?? "");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter an email like name@example.com.");
    setState("busy");
    setError("");
    try {
      await api(`/products/${p.id}/notify`, { body: { color, size, email: email.trim() } });
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };
  if (state === "done") {
    return (
      <p role="status" className="mt-3 border border-amber/60 p-3 text-[13px] text-bone">
        {`Done. We'll email ${email.trim()} once when ${color} / ${size} is back.`}
      </p>
    );
  }
  return (
    <form onSubmit={submit} className="mt-3 border border-line p-4">
      <p className="text-[13px] text-bone">{`Want ${color} / ${size}? Get an email when it's back.`}</p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="Your email"
          aria-label="Email for back-in-stock alert"
          autoComplete="email"
          className={
            "flex-1 min-w-0 h-11 px-3 bg-transparent border text-[13px] text-bone placeholder:text-white/25 outline-none " +
            (error ? "border-red-400/70" : "border-line focus:border-amber")
          }
        />
        <button
          disabled={state === "busy"}
          className="h-11 px-4 bg-amber text-noir font-mono text-[11px] tracking-[0.1em] uppercase hover:brightness-110 disabled:opacity-40"
        >
          {state === "busy" ? "…" : "Notify me"}
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
