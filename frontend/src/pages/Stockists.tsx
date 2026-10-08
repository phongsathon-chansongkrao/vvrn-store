import React, { useState } from "react";
import { ProductVisual } from "../components/ProductVisual";
import { productHref } from "../lib/router";
import { LikeButton, Price, Stars, Swatch } from "../components/ui";
import { CATEGORIES, discountPct } from "../lib/data";
import { getCatalog } from "../lib/catalog";
import { ShopCtx } from "../lib/context";

export function ProductCard({ p }: any) {
  const shop = React.useContext(ShopCtx);
  const [color, setColor] = useState(p.colors[0]);
  const href = productHref(p.id, color);
  const out = shop.totalStock(p) === 0;
  const { avg, count } = shop.rating(p.id);
  return (
    <article className="card group">
      <div className="relative">
        <a href={href} className="block relative shot border border-line aspect-[4/5] overflow-hidden">
          <ProductVisual p={p} color={color} pad="p-[12%]" className={"garment " + (out ? "opacity-35 grayscale" : "")} />
          {out && (
            <div className="absolute inset-0 grid place-items-center bg-ink/40 pointer-events-none">
              <span className="-rotate-6 border-2 border-bone bg-ink/85 px-4 sm:px-6 py-1.5 sm:py-2 font-display text-[26px] sm:text-[36px] leading-none tracking-[0.08em] text-bone shadow-[0_0_0_6px_rgb(var(--ink)/0.55)]">
                Sold out
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {!out && p.isNew && (
              <span className="border border-amber bg-ink/70 text-amber font-mono text-[10px] font-bold tracking-[0.1em] px-2 py-0.5">NEW</span>
            )}
            {!out && p.compareAt && (
              <span className="bg-amber text-noir font-mono text-[10px] font-bold px-2 py-1">{`-${discountPct(p)}%`}</span>
            )}
            {!out && p.limited && (
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-amber">Drop 001</span>
            )}
          </div>
        </a>
        <LikeButton p={p} className="absolute top-1.5 right-1.5 p-2 text-bone/80 hover:text-amber" />
      </div>
      <div className="mt-3 flex items-center gap-2" role="group" aria-label="Colors">
        {p.colors.map((c) => (
          <Swatch
            key={c}
            color={c}
            selected={c === color}
            onClick={() => setColor(c)}
            label={`${p.name} in ${c}`}
            dim={!out && shop.colorStock(p, c) === 0}
          />
        ))}
      </div>
      <a href={href} className="mt-3 block">
        <p className="text-[11px] text-ash">{p.category}</p>
        <h3 className="mt-1 text-[14px] font-medium text-bone group-hover:text-amber transition-colors">{p.name}</h3>
        {count > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ash">
            <Stars value={avg} size={11} />
            {`${avg.toFixed(1)} (${count})`}
          </p>
        )}
        <div className={"mt-1.5 " + (out ? "opacity-50" : "")}>
          <Price p={p} />
        </div>
      </a>
    </article>
  );
}

const SORTS: [string, string][] = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];

/** Every word typed must appear in the name, category, type (tee, hoodie…) or colors.
 *  Descriptions are left out on purpose: "hoodie" shouldn't find a vest that's "great over a hoodie". */
const matches = (p: any, q: string) => {
  const hay = [p.name, p.category, p.type, ...p.colors].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

export function Stockists() {
  const shop = React.useContext(ShopCtx);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const base = getCatalog().filter((p) => (cat === "All" || p.category === cat) && matches(p, q));
  const soldOut = (p: any) => (shop.totalStock(p) === 0 ? 1 : 0);
  // Featured: NEW, then limited, then the rest. Every sort keeps sold out last.
  const group = (p: any) => (p.isNew ? 0 : p.limited ? 1 : 2);
  const newest = (a: any, b: any) => b.createdAt.localeCompare(a.createdAt);
  const order: Record<string, (a: any, b: any) => number> = {
    featured: (a, b) => group(a) - group(b) || newest(a, b),
    newest,
    "price-asc": (a, b) => a.price - b.price || newest(a, b),
    "price-desc": (a, b) => b.price - a.price || newest(a, b),
  };
  const list = [...base].sort((a, b) => soldOut(a) - soldOut(b) || order[sort](a, b));
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.9] text-bone">Stockists</h1>
          <p className="mt-2 text-sm text-ash">
            {q.trim()
              ? `${list.length} ${list.length === 1 ? "result" : "results"} for “${q.trim()}”`
              : `${list.length} ${list.length === 1 ? "item" : "items"} in Drop 001`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={
                "px-4 py-2 text-[12px] border transition-colors " +
                (cat === c ? "border-amber text-amber" : "border-line text-bone/80 hover:border-white/40")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ash pointer-events-none"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden={true}
          >
            <circle cx={11} cy={11} r={7} />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: hoodie, black, cargo…"
            className="w-full h-11 pl-9 pr-3 bg-transparent border border-line text-[13px] text-bone placeholder:text-white/25 outline-none focus:border-amber"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-[12px] text-ash whitespace-nowrap">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 px-3 bg-ink border border-line text-[13px] text-bone outline-none focus:border-amber"
          >
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      {list.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-bone">{`Nothing matches “${q.trim()}”${cat === "All" ? "" : ` in ${cat}`}.`}</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("All");
            }}
            className="mt-3 text-[13px] text-amber underline underline-offset-4"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 gap-y-10 lg:gap-y-14">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SIZE GUIDE
   ========================================================= */
