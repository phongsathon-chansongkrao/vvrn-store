import React, { useEffect } from "react";

export function Toast({ toast, onDone }: any) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div
      key={toast.n}
      role="status"
      className="toast fixed z-40 left-1/2 -translate-x-1/2 bottom-6 w-[calc(100%-2rem)] max-w-[420px] bg-panel border border-line px-4 py-3 flex items-center gap-4"
      style={{
        marginBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <p className="flex-1 text-[13px] text-bone">{toast.text}</p>
      {toast.action && (
        <button
          onClick={() => {
            onDone();
            toast.onAction();
          }}
          className="shrink-0 text-[12px] text-amber underline underline-offset-4"
        >
          {toast.action}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   LOOKBOOK
   ========================================================= */
