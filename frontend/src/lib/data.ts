/** Static, design-only data. Products, stock, prices and reviews come from the API. */

export const HERO_SRC = "/images/hero.jpg";
/** Looping hero clip (muted). HERO_SRC is its poster and the fallback. Set to "" to use the photo only. */
export const HERO_VIDEO = "/videos/hero.mp4";

export const COLORS: Record<string, string> = {
  Black: "#151515",
  Graphite: "#3d3d40",
  Bone: "#d8d3c6",
  Olive: "#4b5040",
  Amber: "#c98a22",
  Indigo: "#2c3a5a",
  Khaki: "#a99a78",
  Tortoise: "#5b3b22",
  White: "#efede7",
};
export const SIZES = ["XS", "S", "M", "L", "XL"];
export const CATEGORIES = ["All", "Outerwear", "Tops", "Bottoms", "Footwear", "Accessories"];

export const money = (n: number) => "฿" + Math.round(n).toLocaleString("en-US");
export const discountPct = (p: { price: number; compareAt?: number | null }) =>
  p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
export const hashStr = (str: string) => {
  let x = 7;
  for (const c of str) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return x;
};
export const fmtTime = (t: string | number) =>
  new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** Tracking steps, in order: [status key from the API, label] */
export const TRACK_STEPS: [string, string][] = [
  ["placed", "Order placed"],
  ["paid", "Payment confirmed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
];

/** Display copy only. The server decides the real fee (backend/src/config.ts). */
export const SHIPPING = [
  { id: "standard", name: "Standard", eta: "5–10 business days", fee: 0 },
  { id: "express", name: "Express", eta: "2–4 business days", fee: 350 },
];
export const COUNTRIES = ["Thailand", "Japan", "Singapore", "Malaysia", "United States", "United Kingdom", "Australia", "Other"];
export const EMPTY_ADDR = { name: "", phone: "", email: "", line1: "", line2: "", city: "", region: "", postal: "", country: "Thailand" };

type Guide = {
  title: string;
  cols: string[];
  rows: Record<string, (number | string)[]>;
  /** Columns (by index) that are lengths in cm, so the inch toggle converts them. Default: all. [] hides the toggle. */
  cm?: number[];
  /** Line under the table. Default: "Garment measured flat, in centimeters/inches." */
  caption?: string;
  note?: string;
  how: string[];
};
/** Garment measured flat, in cm. */
export const SIZE_GUIDES: Record<string, Guide> = {
  outer: {
    title: "Outerwear", cols: ["Chest", "Length", "Shoulder", "Sleeve"],
    rows: { XS: [108, 66, 48, 60], S: [112, 68, 50, 61], M: [116, 70, 52, 62], L: [120, 72, 54, 63], XL: [124, 74, 56, 64] },
    note: "Cut with room for a hoodie underneath. Take your usual size.",
    how: ["Chest: across the garment from armpit to armpit, then doubled.", "Length: from the highest point of the shoulder to the hem.", "Sleeve: from the shoulder seam to the end of the cuff."],
  },
  tops: {
    title: "Tops", cols: ["Chest", "Length", "Shoulder", "Sleeve"],
    rows: { XS: [104, 66, 50, 21], S: [108, 68, 52, 22], M: [112, 70, 54, 23], L: [116, 72, 56, 24], XL: [120, 74, 58, 25] },
    note: "Boxy, dropped-shoulder fit. Sleeve shown for short sleeves; long sleeves and hoodies add 38 cm. Size down for a closer fit.",
    how: ["Chest: across the garment from armpit to armpit, then doubled.", "Length: from the highest point of the shoulder to the hem.", "Shoulder: straight across from seam to seam."],
  },
  pants: {
    title: "Pants", cols: ["Waist", "Hip", "Inseam", "Leg opening"],
    rows: { XS: [70, 98, 74, 34], S: [74, 102, 76, 35], M: [78, 106, 78, 36], L: [82, 110, 80, 37], XL: [86, 114, 82, 38] },
    note: "Waist measured unstretched. Drawcord cuffs let you adjust the leg opening.",
    how: ["Waist: across the top of the waistband, then doubled.", "Hip: across the widest point, about 20 cm below the waistband, then doubled.", "Inseam: from the crotch seam to the bottom of the leg."],
  },
  shorts: {
    title: "Shorts", cols: ["Waist", "Hip", "Inseam", "Leg opening"],
    rows: { XS: [68, 100, 18, 58], S: [72, 104, 18, 60], M: [76, 108, 18, 62], L: [80, 112, 18, 64], XL: [84, 116, 18, 66] },
    note: "Elastic waist stretches about 8 cm beyond the figure shown.",
    how: ["Waist: across the relaxed waistband, then doubled.", "Hip: across the widest point, then doubled.", "Inseam: from the crotch seam to the hem."],
  },
  cap: {
    title: "Caps", cols: ["Head circumference"],
    rows: { "One size": ["56–60"] },
    note: "Adjustable back strap fits head sizes from 56 to 60 cm.",
    how: ["Wrap a soft tape measure around your head, about 1 cm above your eyebrows and ears.", "Keep the tape level all the way around and read where it meets."],
  },
  shoes: {
    title: "Shoes", cols: ["US men", "UK", "Foot length"], cm: [2], caption: "Foot length, heel to longest toe.",
    rows: { "40": [7, 6.5, 25.0], "41": [8, 7.5, 25.8], "42": [8.5, 8, 26.5], "43": [9.5, 9, 27.3], "44": [10, 9.5, 28.0], "45": [11, 10.5, 28.8] },
    note: "True to size. Between sizes or wide feet? Go half a size up, which means the next EU size.",
    how: ["Stand on a sheet of paper with your heel against a wall.", "Mark the tip of your longest toe and measure from the wall to the mark.", "Measure both feet and use the longer one."],
  },
  socks: {
    title: "Socks", cols: ["Fits EU shoe size", "US men"], cm: [], caption: "Sized by shoe size.",
    rows: { "39-42": ["39–42", "6–8.5"], "43-46": ["43–46", "9.5–12"] },
    note: "Cotton blend with a ribbed cuff. Pick the range your shoe size falls in.",
    how: ["Use the EU size from your usual sneakers."],
  },
  belt: {
    title: "Belts", cols: ["Fits waist", "Total length"], caption: "Belt measured flat, buckle included.",
    rows: { S: ["70–80", 100], M: ["80–90", 110], L: ["90–100", 120], XL: ["100–110", 130] },
    note: "Take one size up from your pants waist. Five holes, 2.5 cm apart.",
    how: ["Measure an old belt from the buckle prong to the hole you use most.", "Or measure around your waist where you wear your pants, over clothing."],
  },
  eyewear: {
    title: "Eyewear", cols: ["Lens width", "Bridge", "Temple length"], cm: [], caption: "Frame measurements in millimeters.",
    rows: { "One size": ["52 mm", "20 mm", "145 mm"] },
    note: "Fits most adult faces. UV400 lenses on sunglasses. Optical frames come with clear demo lenses: any optician can fit your prescription.",
    how: ["Compare with a pair you already own: these numbers are printed inside the temple arm."],
  },
  tie: {
    title: "Ties", cols: ["Length", "Width at tip"], caption: "Tie measured flat.",
    rows: { "One size": [148, 7] },
    note: "Standard length for most heights. Slim 7 cm blade.",
    how: ["No measuring needed."],
  },
};
