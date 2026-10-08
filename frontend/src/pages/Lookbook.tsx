import React from "react";
import { Garment } from "../components/Garment";
import { ProductVisual } from "../components/ProductVisual";
import { productHref } from "../lib/router";
import { HERO_SRC, money } from "../lib/data";
import { findProduct } from "../lib/catalog";

export const LOOKS = [
  {
    title: "Under the overpass",
    photo: true,
    note: "The shell zipped to the chin, cargo cuffs pulled tight. Built for the walk home when the trains have stopped.",
    pieces: [
      ["grid-shell-jacket", "Black", "top"],
      ["transit-cargo-pant", "Black", "bottom"],
    ],
  },
  {
    title: "Last train",
    note: "Bone fleece against olive ripstop. The cap keeps the drizzle off; the hood handles the rest.",
    pieces: [
      ["night-shift-hoodie", "Bone", "top"],
      ["transit-cargo-pant", "Olive", "bottom"],
      ["six-panel-cap", "Bone", "cap"],
    ],
  },
  {
    title: "Wet asphalt",
    note: "A thermal under the vest for nights that start warm and end cold. Shorts because the humidity never really leaves.",
    pieces: [
      ["thermal-long-sleeve", "Bone", "top"],
      ["utility-vest", "Black", "layer"],
      ["overpass-short", "Graphite", "bottom"],
    ],
  },
  {
    title: "Signal",
    note: "One loud piece and everything else goes quiet. The amber tee carries the outfit on its own.",
    pieces: [
      ["heavyweight-tee", "Amber", "top"],
      ["transit-cargo-pant", "Graphite", "bottom"],
      ["six-panel-cap", "Black", "cap"],
    ],
  },
  {
    title: "Night shift",
    note: "Graphite shell over a black tee. The reflective tape is the only thing that shows up in the dark, which is the point.",
    pieces: [
      ["heavyweight-tee", "Black", "top"],
      ["grid-shell-jacket", "Graphite", "layer"],
      ["overpass-short", "Black", "bottom"],
    ],
  },
];

export const SLOT = {
  top: {
    left: "5%",
    top: "10%",
    width: "52%",
  },
  layer: {
    left: "18%",
    top: "16%",
    width: "48%",
  },
  bottom: {
    right: "5%",
    top: "30%",
    width: "44%",
  },
  cap: {
    right: "9%",
    top: "4%",
    width: "26%",
  },
};

export function OutfitArt({ look }: any) {
  return (
    <div className="absolute inset-0">
      {look.pieces.map(([id, color, slot], i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...SLOT[slot],
            aspectRatio: "200 / 240",
            zIndex: slot === "layer" ? 2 : 1,
          }}
        >
          <Garment type={findProduct(id).type} color={color} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

export function LookImage({ look, i }: any) {
  return (
    <div className={"relative border border-line aspect-[4/5] overflow-hidden " + (look.photo ? "bg-black" : "shot")}>
      {look.photo ? (
        <>
          <img
            src={HERO_SRC}
            alt="Look 01: hooded figure in a black zip jacket at night"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "50% 35%",
              filter: "grayscale(1) contrast(1.08)",
            }}
          />
          <div className="grain" />
        </>
      ) : (
        <OutfitArt look={look} />
      )}
      <span
        className="absolute bottom-3 left-4 font-display text-[64px] lg:text-[88px] leading-none text-bone/10 select-none"
        aria-hidden={true}
      >
        {String(i + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

export function Lookbook() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-14">
      <div className="border-b border-line pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="font-display text-[56px] lg:text-[72px] leading-[0.9] text-bone">Lookbook</h1>
        <p className="max-w-[44ch] text-[14px] leading-[1.6] text-bone/70">
          Five ways to wear Drop 001. Every piece links straight to its page, already set to the color shown.
        </p>
      </div>
      <div className="mt-10 lg:mt-16 space-y-16 lg:space-y-28">
        {LOOKS.map((look, i) => {
          const flip = i % 2 === 1;
          const total = look.pieces.reduce((s, [id]) => s + findProduct(id).price, 0);
          return (
            <section
              key={look.title}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              aria-labelledby={"look-" + i}
            >
              <div className={"lg:col-span-7 " + (flip ? "lg:order-2" : "")}>
                <LookImage look={look} i={i} />
              </div>
              <div className={"lg:col-span-5 " + (flip ? "lg:order-1 lg:pl-0 lg:pr-8" : "lg:pl-4")}>
                <p className="font-mono text-[12px] text-amber">{`Look ${String(i + 1).padStart(2, "0")} of ${String(LOOKS.length).padStart(2, "0")}`}</p>
                <h2 id={"look-" + i} className="mt-2 font-display text-[44px] lg:text-[56px] leading-[0.9] text-bone">
                  {look.title}
                </h2>
                <p className="mt-4 max-w-[42ch] text-[14px] leading-[1.65] text-bone/75">{look.note}</p>
                <h3 className="mt-8 text-[13px] text-ash">Shop the look</h3>
                <ul className="mt-3 border-t border-line">
                  {look.pieces.map(([id, color]) => {
                    const p = findProduct(id);
                    return (
                      <li key={id + color} className="border-b border-line">
                        <a href={productHref(id, color)} className="group flex items-center gap-4 py-3">
                          <span className="relative overflow-hidden shot border border-line w-12 aspect-[4/5] shrink-0">
                            <ProductVisual p={p} color={color} pad="p-1" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[14px] text-bone group-hover:text-amber transition-colors">
                              {p.name}
                            </span>
                            <span className="block text-[12px] text-ash">{color}</span>
                          </span>
                          <span className="font-mono text-[13px] text-bone">{money(p.price)}</span>
                          <span className="text-ash group-hover:text-amber" aria-hidden={true}>
                            ›
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[12px] text-ash">{`Full look ${money(total)}`}</p>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

/* =========================================================
   ABOUT
   ========================================================= */
