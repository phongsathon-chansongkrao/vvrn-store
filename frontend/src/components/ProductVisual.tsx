import React from "react";
import { Garment } from "./Garment";
import { imgUrl, photosFor } from "../lib/catalog";
import type { Product } from "../lib/types";

/**
 * A product's photo for a color, or the SVG drawing when there's no photo yet.
 * Fills its parent, so the parent needs `relative` (and usually `overflow-hidden` + an aspect ratio).
 * `pad` is the padding around the drawing; photos always fill edge to edge.
 * `type` is the fallback drawing when the product isn't in the catalog any more (old orders).
 */
export function ProductVisual({ p, type, color, index = 0, pad = "p-[10%]", className = "", alt }: {
  p?: Product;
  type?: string;
  color: string;
  index?: number;
  pad?: string;
  className?: string;
  alt?: string;
}) {
  const photo = photosFor(p, color)[index];
  if (photo) {
    return (
      <img
        src={imgUrl(photo.file)}
        alt={alt ?? (p ? `${p.name} in ${color}` : "")}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={"absolute inset-0 w-full h-full object-cover " + className}
      />
    );
  }
  return (
    <div className={"absolute inset-0 grid place-items-center " + pad + " " + className}>
      <Garment type={p?.type ?? type} color={color} className="w-full h-full" />
    </div>
  );
}
