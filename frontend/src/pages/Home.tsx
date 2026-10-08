import React, { useEffect, useRef, useState } from "react";
import { HERO_SRC, HERO_VIDEO } from "../lib/data";

/**
 * Mouse effects for the hero. Writes CSS variables; index.css does the moving:
 *   on <main>:  --mx / --my  = pointer anywhere on the page, -1..1 (parallax of the ghost text + headline)
 *   on .tilt:   --hx / --hy  = pointer over the photo, -1..1 (3D tilt), --hover = 0/1 (slight zoom)
 * Skipped on touch screens and for people who turned on "reduce motion".
 */
function useHeroMotion() {
  const mainRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const main = mainRef.current;
    const tilt = tiltRef.current;
    if (!main || !tilt) return;
    if (matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    const paint = () => {
      frame = 0;
      if (!last) return;
      const m = main.getBoundingClientRect();
      main.style.setProperty("--mx", clamp(((last.clientX - m.left) / m.width) * 2 - 1).toFixed(3));
      main.style.setProperty("--my", clamp(((last.clientY - m.top) / m.height) * 2 - 1).toFixed(3));
      const t = tilt.getBoundingClientRect();
      const x = (last.clientX - t.left) / t.width;
      const y = (last.clientY - t.top) / t.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      tilt.style.setProperty("--hover", inside ? "1" : "0");
      tilt.style.setProperty("--hx", inside ? (x * 2 - 1).toFixed(3) : "0");
      tilt.style.setProperty("--hy", inside ? (y * 2 - 1).toFixed(3) : "0");
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(paint); // at most once per frame
    };
    const onLeave = () => {
      last = null;
      for (const k of ["--mx", "--my"]) main.style.setProperty(k, "0");
      for (const k of ["--hx", "--hy", "--hover"]) tilt.style.setProperty(k, "0");
    };
    main.addEventListener("pointermove", onMove);
    main.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      main.removeEventListener("pointermove", onMove);
      main.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return { mainRef, tiltRef };
}

const HERO_ALT = "Hooded figure in a black VVRN zip jacket with a reflective mask, at night under an overpass";
const HERO_STYLE: React.CSSProperties = { objectPosition: "50% 30%", filter: "grayscale(1) contrast(1.08)" };

/** Plays the looping hero clip when it makes sense, otherwise the still photo (with the slow zoom). */
function useHeroVideo() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const saveData = (navigator as any).connection?.saveData === true; // phone "data saver" on
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOk(!!HERO_VIDEO && !saveData && !calm);
  }, []);
  return [ok, () => setOk(false)] as const;
}

function HeroMedia() {
  const [video, fail] = useHeroVideo();
  if (video) {
    return (
      <video
        // React sets `muted` as a property only; iOS Safari needs the attribute to allow autoplay
        ref={(el) => {
          if (el) {
            el.muted = true;
            el.setAttribute("muted", "");
          }
        }}
        src={HERO_VIDEO}
        poster={HERO_SRC} // shown until the first frame is ready
        autoPlay
        muted // browsers only autoplay muted video
        loop
        playsInline // iPhone: play in the page, not full screen
        preload="auto"
        aria-label={HERO_ALT}
        onError={fail} // file missing or can't play: fall back to the photo
        className="absolute inset-0 w-full h-full object-cover"
        style={HERO_STYLE}
      />
    );
  }
  return <img src={HERO_SRC} alt={HERO_ALT} className="kenburns absolute inset-0 w-full h-full object-cover" style={HERO_STYLE} />;
}

export function Home() {
  const { mainRef, tiltRef } = useHeroMotion();
  return (
    <main ref={mainRef} className="hero-scene relative mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-[88px] overflow-hidden">
      <div
        aria-hidden={true}
        className="ghost depth-back hidden lg:block absolute right-4 xl:right-6 top-1/2 font-display text-[110px] xl:text-[130px] leading-none select-none pointer-events-none"
      >
        DROP 001
      </div>
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-12 items-center">
        {/* .tilt wraps .reveal: the entrance animation and the tilt both use transform, so they need separate elements */}
        <div ref={tiltRef} className="tilt">
          <div className="hero-frame reveal border border-line aspect-[4/3] lg:aspect-[1.4/1] bg-black">
            <HeroMedia />
            <div className="grain" />
          </div>
        </div>
        <div className="lg:pr-28 xl:pr-36">
          <div className="depth-front">
            <h1 className="font-display leading-[0.88]">
              <span
                className="reveal block text-bone text-[30px] sm:text-[34px] lg:text-[38px]"
                style={{
                  animationDelay: ".15s",
                }}
              >
                Built for
              </span>
              <span
                className="reveal block text-bone text-[64px] sm:text-[80px] lg:text-[88px] xl:text-[96px]"
                style={{
                  animationDelay: ".25s",
                }}
              >
                The ones
              </span>
              <span
                className="reveal block text-amber text-[44px] sm:text-[52px] lg:text-[58px] mt-1"
                style={{
                  animationDelay: ".35s",
                }}
              >
                Who know.
              </span>
            </h1>
          </div>
          <p
            className="reveal mt-7 max-w-[34ch] text-[14px] lg:text-[15px] leading-[1.6] text-bone/80"
            style={{
              animationDelay: ".45s",
            }}
          >
            Uncompromising silhouettes engineered for the urban grid. The inaugural collection establishes the new
            standard.
          </p>
          <a
            href="#/stockists"
            className="cta reveal mt-9 inline-flex items-center gap-2 border border-amber px-6 py-3.5 font-mono text-[10px] lg:text-[11px] tracking-[0.12em] uppercase text-amber transition-colors hover:bg-amber hover:text-noir"
            style={{
              animationDelay: ".55s",
            }}
          >
            View Drop 001<span className="cta-arrow" aria-hidden={true}>→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
