import React, { useEffect, useRef } from "react";

export function Dialog({ open, icon, title, body, onClose, actions, children, wide = false }: any) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    const btn = ref.current && (ref.current.querySelector("[data-autofocus]") as HTMLElement);
    (btn || ref.current) && (btn || ref.current).focus();
    const k = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      prev && prev.focus && prev.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal={true}
        aria-labelledby="dlg-title"
        className={
          "toast relative w-full bg-ink border border-line p-6 sm:p-8 outline-none max-h-[90vh] overflow-y-auto " +
          (wide ? "max-w-[640px] text-left" : "max-w-[400px] text-center")
        }
      >
        {icon && (
          <div
            className={
              "mx-auto mb-5 w-14 h-14 grid place-items-center text-[26px] " +
              (icon === "✓" ? "bg-amber text-noir" : "border border-line text-bone")
            }
          >
            {icon}
          </div>
        )}
        <h2 id="dlg-title" className="font-display text-[36px] sm:text-[40px] leading-none text-bone">
          {title}
        </h2>
        {body && <p className="mt-3 text-[14px] leading-[1.6] text-bone/75">{body}</p>}
        {children}
        <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">{actions}</div>
      </div>
    </div>
  );
}

/* =========================================================
   AUTH PAGES
   ========================================================= */
