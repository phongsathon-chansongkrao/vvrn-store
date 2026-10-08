import React from "react";
import { HERO_SRC } from "../lib/data";

export const PRINCIPLES = [
  {
    title: "Made to be seen",
    body: "Reflective tape is placed where headlights actually hit: across the chest, the shoulders and the forearms. Dark clothes, visible wearer.",
  },
  {
    title: "Made to last",
    body: "Heavy fleece, ripstop and 300gsm jersey. We test every fabric through fifty washes before it goes into a drop.",
  },
  {
    title: "Made in small runs",
    body: "Each drop is capped at 200 units per piece. When it sells out, it is gone, and the next drop starts from a clean sheet.",
  },
];

export const FACTS = [
  ["Units per piece", "200"],
  ["Restocks", "None"],
  ["Shipping", "Free, worldwide"],
  ["Returns", "30 days, unworn with tags"],
  ["Sizes", "XS to XL, boxy fit"],
];

export function About() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 lg:py-16">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
        <div className="lg:col-span-7">
          <h1 className="font-display text-[72px] sm:text-[104px] lg:text-[144px] leading-[0.82] text-bone">
            Made
            <br />
            after dark.
          </h1>
          <p className="mt-8 max-w-[52ch] text-[16px] lg:text-[18px] leading-[1.6] text-bone/80">
            VVRN makes clothes for people who live most of their lives once the sun is down: night-shift workers, late
            riders, the ones walking home from the last train.
          </p>
        </div>
        <div className="lg:col-span-5 relative border border-line aspect-[3/4] overflow-hidden bg-black">
          <img
            src={HERO_SRC}
            alt="Close crop of the reflective mask under a black hood"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: "45% 20%",
              transform: "scale(1.35)",
              transformOrigin: "45% 25%",
              filter: "grayscale(1) contrast(1.1)",
            }}
          />
          <div className="grain" />
        </div>
      </section>
      <section className="mt-20 lg:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-line pt-10">
        <h2 className="lg:col-span-4 font-display text-[40px] lg:text-[48px] leading-[0.9] text-bone">
          Why we started
        </h2>
        <div className="lg:col-span-7 lg:col-start-6 space-y-5 text-[15px] leading-[1.7] text-bone/75 max-w-[62ch]">
          <p>
            Most streetwear is designed to be photographed in daylight. We kept noticing that the clothes we actually
            wore at night were either invisible to traffic or looked like safety gear.
          </p>
          <p>
            So we started with the problem: a black jacket a driver can see from fifty meters away, fleece heavy enough
            for a cold platform, pockets that hold a phone and a transit card without flapping. Everything else in Drop
            001 grew out of that jacket.
          </p>
          <p>
            We design every piece in-house and produce in small, numbered runs with one partner factory. Keeping the
            runs small lets us pay for better fabric instead of more stock.
          </p>
        </div>
      </section>
      <section className="mt-20 lg:mt-28 grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="bg-ink p-8 lg:p-10">
            <h3 className="font-display text-[32px] lg:text-[36px] leading-[0.95] text-amber">{p.title}</h3>
            <p className="mt-4 text-[14px] leading-[1.65] text-bone/75">{p.body}</p>
          </div>
        ))}
      </section>
      <section className="mt-20 lg:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <h2 className="lg:col-span-4 font-display text-[40px] lg:text-[48px] leading-[0.9] text-bone">Every drop</h2>
        <dl className="lg:col-span-7 lg:col-start-6 border-t border-line">
          {FACTS.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-4 border-b border-line">
              <dt className="text-[14px] text-ash">{k}</dt>
              <dd className="text-[14px] text-bone text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-20 lg:mt-28 border border-line px-8 py-12 lg:px-14 lg:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h2 className="font-display text-[44px] lg:text-[64px] leading-[0.9] text-bone">Drop 001 is live.</h2>
          <p className="mt-3 text-[14px] text-bone/70">Eight pieces, 200 of each.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="#/stockists"
            className="inline-flex items-center gap-2 bg-amber text-noir px-6 py-3.5 font-mono text-[11px] tracking-[0.12em] uppercase hover:brightness-110"
          >
            Shop Drop 001
          </a>
          <a
            href="#/lookbook"
            className="inline-flex items-center gap-2 border border-line text-bone px-6 py-3.5 font-mono text-[11px] tracking-[0.12em] uppercase hover:border-white/50"
          >
            See the lookbook
          </a>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   FORM PRIMITIVES
   ========================================================= */
