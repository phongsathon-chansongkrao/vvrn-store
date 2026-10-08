import React, { useState } from "react";
import { btnPrimary } from "./forms";
import { Dialog } from "./Dialog";
import { SIZE_GUIDES } from "../lib/data";

export function SizeGuide({ open, guide, highlight, onClose }: any) {
  const [unit, setUnit] = useState("cm");
  const g = SIZE_GUIDES[guide];
  if (!g) return null;
  // Only columns that are lengths in cm get converted (not shoe sizes, not millimeters)
  const cmCols = g.cm ?? g.cols.map((_, i) => i);
  const hasUnits = cmCols.length > 0;
  const conv = (v, col: number) =>
    unit === "cm" || !cmCols.includes(col)
      ? String(v)
      : String(v).replace(/\d+(\.\d+)?/g, (n) => (parseFloat(n) / 2.54).toFixed(1));
  const unitWord = unit === "cm" ? "centimeters" : "inches";
  return (
    <Dialog
      open={open}
      wide
      title={g.title + " size guide"}
      onClose={onClose}
      actions={
        <button data-autofocus={true} onClick={onClose} className={btnPrimary + " flex-1"}>
          Close
        </button>
      }
    >
      <div className={"mt-5 flex gap-2 " + (hasUnits ? "" : "hidden")} role="group" aria-label="Units">
        {[
          ["cm", "Centimeters"],
          ["in", "Inches"],
        ].map(([u, l]) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            aria-pressed={unit === u}
            className={
              "px-3 h-8 text-[12px] border " + (unit === u ? "border-amber text-amber" : "border-line text-bone/80")
            }
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-line text-ash">
              <th className="text-left font-normal py-2 pr-4">Size</th>
              {g.cols.map((c) => (
                <th key={c} className="text-right font-normal py-2 px-2 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(g.rows).map(([s, vals]) => (
              <tr key={s} className={"border-b border-line " + (s === highlight ? "bg-amber/10" : "")}>
                <td className={"py-2.5 pr-4 font-medium " + (s === highlight ? "text-amber" : "text-bone")}>{s}</td>
                {vals.map((v, i) => (
                  <td key={i} className="py-2.5 px-2 text-right font-mono text-bone/85">
                    {conv(v, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-ash">
        {g.caption
          ? g.caption + (hasUnits ? ` Lengths in ${unitWord}.` : "")
          : `Garment measured flat, in ${unitWord}.`}
      </p>
      {g.note && <p className="mt-1 text-[12px] text-ash">{g.note}</p>}
      <h3 className="mt-5 text-[13px] text-bone">How to measure</h3>
      <ul className="mt-2 space-y-1 text-[12px] text-bone/70 list-disc pl-5">
        {g.how.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </Dialog>
  );
}

/* =========================================================
   REVIEWS
   ========================================================= */
