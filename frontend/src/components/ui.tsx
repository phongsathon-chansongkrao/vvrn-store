import React, { useState, useEffect } from "react";
import { COLORS, discountPct, money } from "../lib/data";
import { ShopCtx } from "../lib/context";

type Theme = "dark" | "light";

/** Day/Night switch. index.html sets data-theme before first paint; this keeps it in sync + saves the choice. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark"
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try {
      localStorage.setItem("vvrn:theme", theme);
    } catch {
      /* storage blocked: ignore */
    }
  }, [theme]);
  const light = theme === "light";
  return (
    <button
      onClick={() => setTheme(light ? "dark" : "light")}
      className="p-2 text-bone hover:text-amber transition-colors"
      aria-label={light ? "Switch to night mode" : "Switch to day mode"}
      title={light ? "Night mode" : "Day mode"}
    >
      {light ? (
        // Moon: shown in Day mode, click for Night
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      ) : (
        // Sun: shown in Night mode, click for Day
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx={12} cy={12} r={4} />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}

/** What the bar shows before /api/settings answers (and if it fails). Same as the backend default. */
export const DEFAULT_PROMO_BAR = { enabled: true, messages: ["SS25 Drop 001", "Limited to 200 units", "Free worldwide shipping"] };

/** Scrolling promo bar. Text comes from Admin → Site (shown upper-case). */
export function Marquee({ bar = DEFAULT_PROMO_BAR }: { bar?: { enabled: boolean; messages: string[] } }) {
  if (!bar.enabled || !bar.messages.length) return null;
  const msg = bar.messages.join(" — ") + " — ";
  // Enough copies to fill wide screens; the second half repeats the first so the loop is seamless.
  const items = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="px-4 whitespace-nowrap" aria-hidden={i > 0 ? true : undefined}>
      {msg}
    </span>
  ));
  return (
    <div className="border-b border-line overflow-hidden bg-ink" aria-label="Announcement">
      <div className="marquee-track font-mono text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-bone/80 py-1.5">
        {items}
        {items.map((el, i) =>
          React.cloneElement(el, {
            key: "b" + i,
            "aria-hidden": true,
          })
        )}
      </div>
    </div>
  );
}

export function Nav({ route, count, onCart, user }: any) {
  const [open, setOpen] = useState(false);
  const links = [
    {
      label: "Drops",
      href: "#/",
      active: route.page === "home",
    },
    {
      label: "Lookbook",
      href: "#/lookbook",
      active: route.page === "lookbook",
    },
    {
      label: "About",
      href: "#/about",
      active: route.page === "about",
    },
    {
      label: "Stockists",
      href: "#/stockists",
      active: route.page === "stockists" || route.page === "product",
    },
  ];
  if (user && (user.role === "staff" || user.role === "admin"))
    links.push({ label: "Admin", href: "#/admin", active: route.page === "admin" });
  useEffect(() => setOpen(false), [route]);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 h-[72px] lg:h-[84px] flex items-center justify-between">
        <a href="#/" className="font-display text-[40px] lg:text-[48px] leading-none tracking-tight text-bone">
          VVRN
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={
                "relative text-[11px] font-medium tracking-[0.1em] uppercase py-2 transition-colors " +
                (l.active ? "text-amber" : "text-bone/85 hover:text-bone")
              }
            >
              {l.label}
              {l.active && <span className="absolute left-0 right-0 -bottom-0.5 h-px bg-amber" />}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={user ? "#/account" : "#/login"}
            className={
              "flex items-center gap-2 p-2 " +
              (route.page === "account" || route.page === "login" || route.page === "register"
                ? "text-amber"
                : "text-bone")
            }
            aria-label={user ? `Account: ${user.name}` : "Log in"}
          >
            <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <circle cx={12} cy={8} r={4} />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
            <span className="hidden lg:inline text-[11px] tracking-[0.1em] uppercase">
              {user ? user.name.split(" ")[0] : "Log in"}
            </span>
          </a>
          <button onClick={onCart} className="relative p-2 text-bone" aria-label={`Open cart, ${count} items`}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M3 4h2l2.4 11h10.2L20 7H6.4" />
              <circle cx={9} cy={19.5} r={1.3} />
              <circle cx={17} cy={19.5} r={1.3} />
            </svg>
            {count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber text-noir font-mono text-[10px] font-bold leading-[18px] text-center">
                {count}
              </span>
            ) : null}
          </button>
          <button
            className="md:hidden p-2 text-bone"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-line px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={"text-sm tracking-[0.1em] uppercase " + (l.active ? "text-amber" : "text-bone/85")}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Swatch({ color, selected, onClick, size = "sm", label, dim = false }: any) {
  const dimCls = size === "lg" ? "w-9 h-9" : "w-4 h-4";
  return (
    <button
      type="button"
      onClick={onClick}
      title={dim ? `${color} (sold out)` : color}
      aria-label={(label || color) + (dim ? ", sold out" : "")}
      aria-pressed={selected}
      className={`relative ${dimCls} shrink-0 border transition ${selected ? "border-amber ring-1 ring-amber ring-offset-2 ring-offset-ink" : "border-white/20 hover:border-white/60"} ${dim ? "opacity-40" : ""}`}
      style={{
        background: COLORS[color],
      }}
    >
      {dim && (
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, transparent 46%, rgba(255,255,255,.7) 48%, rgba(255,255,255,.7) 52%, transparent 54%)",
          }}
        />
      )}
    </button>
  );
}

export function Stars({ value, size = 14 }: any) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span
      className="relative inline-block leading-none whitespace-nowrap"
      style={{
        fontSize: size,
      }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="text-white/20">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden text-amber"
        style={{
          width: pct + "%",
        }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export function Price({ p, size = "sm" }: any) {
  const big = size === "lg";
  if (!p.compareAt)
    return <p className={`font-mono ${big ? "text-[22px]" : "text-[13px]"} text-bone`}>{money(p.price)}</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-mono font-bold ${big ? "text-[24px]" : "text-[14px]"} text-amber`}>{money(p.price)}</span>
      <s
        className={`font-mono ${big ? "text-[15px]" : "text-[12px]"} text-ash`}
        aria-label={`was ${money(p.compareAt)}`}
      >
        {money(p.compareAt)}
      </s>
      <span
        className={`font-mono font-bold ${big ? "text-[12px] px-2 py-0.5" : "text-[10px] px-1.5 py-px"} bg-amber/15 text-amber`}
      >{`-${discountPct(p)}%`}</span>
    </p>
  );
}

export const HEART =
  "M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z";

export function LikeButton({ p, className = "", big = false }: any) {
  const shop = React.useContext(ShopCtx);
  const liked = shop.likes.includes(p.id);
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${p.name}` : `Like ${p.name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        shop.toggleLike(p.id);
      }}
      className={`inline-flex items-center gap-1.5 transition-colors ${liked ? "text-amber" : ""} ${className}`}
    >
      <svg
        width={big ? 22 : 18}
        height={big ? 22 : 18}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      >
        <path d={HEART} />
      </svg>
      {big && <span className="font-mono text-[12px]">{shop.likeCount(p)}</span>}
    </button>
  );
}

export function ShareButton({ p, color }: any) {
  const shop = React.useContext(ShopCtx);
  return (
    <button
      type="button"
      onClick={() => shop.share(p, color)}
      className="inline-flex items-center gap-1.5 text-bone hover:text-amber"
      aria-label={`Share ${p.name}`}
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx={18} cy={5} r={2.5} />
        <circle cx={6} cy={12} r={2.5} />
        <circle cx={18} cy={19} r={2.5} />
        <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
      <span className="text-[12px]">Share</span>
    </button>
  );
}

export function Stepper({ value, onChange, min = 1, max = 10, compact = false }: any) {
  const btn = `${compact ? "w-8 h-8" : "w-11 h-11"} grid place-items-center text-bone hover:bg-white/5 disabled:text-white/20 disabled:hover:bg-transparent`;
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`${compact ? "w-8 text-sm" : "w-12"} text-center font-mono`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

/* =========================================================
   HOME
   ========================================================= */
