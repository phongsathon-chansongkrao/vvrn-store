import React from "react";

export function Field({ label, error, className = "", ...props }: any) {
  return (
    <label className={"block " + className}>
      <span className="block text-[12px] text-ash mb-1.5">{label}</span>
      <input
        {...props}
        aria-invalid={!!error}
        className={
          "w-full h-12 px-4 bg-transparent border text-[14px] text-bone placeholder:text-white/25 outline-none transition-colors " +
          (error ? "border-red-400/70" : "border-line focus:border-amber")
        }
      />
      {error && <span className="block mt-1 text-[12px] text-red-300">{error}</span>}
    </label>
  );
}

export function SelectField({ label, value, onChange, options, className = "" }: any) {
  return (
    <label className={"block " + className}>
      <span className="block text-[12px] text-ash mb-1.5">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 bg-ink border border-line text-[14px] text-bone outline-none focus:border-amber"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export const btnPrimary =
  "h-12 px-6 bg-amber text-noir font-mono text-[12px] tracking-[0.12em] uppercase hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed";

export const btnGhost =
  "h-12 px-6 border border-line text-bone font-mono text-[12px] tracking-[0.12em] uppercase hover:border-white/50";

export function Radio({ checked, onChange, children, name }: any) {
  return (
    <label
      className={
        "flex items-start gap-4 border p-4 cursor-pointer transition-colors " +
        (checked ? "border-amber bg-amber/5" : "border-line hover:border-white/40")
      }
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={
          "mt-0.5 w-4 h-4 rounded-full border grid place-items-center shrink-0 " +
          (checked ? "border-amber" : "border-white/40")
        }
      >
        {checked && <span className="w-2 h-2 rounded-full bg-amber" />}
      </span>
      <span className="flex-1">{children}</span>
    </label>
  );
}

/* =========================================================
   FAKE QR (demo only)
   ========================================================= */
