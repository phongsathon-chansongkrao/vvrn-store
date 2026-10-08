import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { getPool, sql } from "../db.js";
import { HttpError } from "./http.js";

/* Product photos: files in backend/uploads/products, rows in dbo.ProductImages.
   Served publicly at /api/images/<file> (see index.ts). */

export const PRODUCT_IMG_DIR = path.resolve("uploads", "products");
fs.mkdirSync(PRODUCT_IMG_DIR, { recursive: true });

export const MAX_IMAGE_MB = 10; // matches the "over 10 MB" message in lib/http.ts
export const MAX_IMAGES_PER_PRODUCT = 30;

/** Kept in memory first so the bytes can be checked before anything touches the disk. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 1 },
});

/** Detect the real type from the first bytes. The file name and browser-sent type are not trusted. */
function sniff(buf: Buffer): ".jpg" | ".png" | ".webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return null;
}

/** Validates and writes an uploaded photo. Returns the stored file name. */
export function saveProductImage(file: Express.Multer.File | undefined): string {
  if (!file) throw new HttpError(400, "Choose a photo to upload.");
  const ext = sniff(file.buffer);
  if (!ext) throw new HttpError(400, "Upload a JPG, PNG or WebP photo.");
  const name = crypto.randomBytes(16).toString("hex") + ext;
  fs.writeFileSync(path.join(PRODUCT_IMG_DIR, name), file.buffer);
  return name;
}

export function deleteProductImageFile(fileName: string) {
  fs.promises.unlink(path.join(PRODUCT_IMG_DIR, path.basename(fileName))).catch(() => {});
}

export interface ProductImageDto {
  id: number;
  file: string; // frontend shows `${API}/images/${file}`
  color: string | null; // null = every color
}

/** productId -> photos in display order. Returns an empty map if 06_product_images.sql hasn't been run yet. */
export async function loadImages(productIds: number[]): Promise<Map<number, ProductImageDto[]>> {
  const map = new Map<number, ProductImageDto[]>();
  if (!productIds.length) return map;
  const pool = await getPool();
  let rows: { Id: number; ProductId: number; Color: string | null; FileName: string }[];
  try {
    rows = (await pool.request().query(`
      SELECT Id, ProductId, Color, FileName FROM dbo.ProductImages
      WHERE ProductId IN (${productIds.map(Number).join(",")}) ORDER BY SortOrder, Id`)).recordset;
  } catch (err) {
    if ((err as { number?: number }).number === 208) return map; // table not created yet: no photos, shop keeps working
    throw err;
  }
  for (const r of rows) {
    const list = map.get(r.ProductId) ?? [];
    list.push({ id: r.Id, file: r.FileName, color: r.Color });
    map.set(r.ProductId, list);
  }
  return map;
}
