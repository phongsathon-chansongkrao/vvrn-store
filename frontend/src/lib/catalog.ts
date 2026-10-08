import type { Product, ProductImage } from "./types";
import { BASE } from "./api";

/**
 * In-memory copy of the product list from the API.
 * App sets it after every fetch so components can look products up synchronously.
 */
let CATALOG: Product[] = [];

export const setCatalog = (list: Product[]) => { CATALOG = list; };
export const getCatalog = () => CATALOG;
export const findProduct = (id: string) => CATALOG.find(p => p.id === id) as Product;
export const sizesOf = (p: Product) => p.sizes;

export const imgUrl = (file: string) => `${BASE}/images/${file}`;
/** Photos for a color: that color's own photos first, then the ones shared by every color. */
export const photosFor = (p: Product | undefined, color: string): ProductImage[] =>
  p?.images ? [...p.images.filter(i => i.color === color), ...p.images.filter(i => !i.color)] : [];
