import { getPool, sql } from "../db.js";
import { loadImages, type ProductImageDto } from "./images.js";

export interface ProductDto {
  id: string; // slug
  name: string;
  type: string;
  category: string;
  guide: string;
  price: number;
  compareAt: number | null;
  desc: string;
  limited: boolean;
  images: ProductImageDto[]; // photos in display order; empty = show the drawing
  isNew: boolean; // added within NEW_DAYS
  createdAt: string;
  colors: string[];
  sizes: string[];
  stock: Record<string, number>; // "Color|Size" -> units left
  rating: { avg: number; count: number };
  likeCount: number;
  liked: boolean;
}

/** How long a product shows the NEW badge. */
export const NEW_DAYS = 3;

/** All active products (or one, by slug) with variants, rating and likes. */
export async function loadProducts(userId?: number, slug?: string): Promise<ProductDto[]> {
  const pool = await getPool();
  const req = () =>
    pool.request().input("userId", sql.Int, userId ?? null).input("slug", sql.VarChar(80), slug ?? null);

  const products = await req().query(`
    SELECT p.Id, p.Slug, p.Name, p.Type, p.Category, p.Guide, p.Price, p.CompareAtPrice,
           p.Description, p.IsLimited, p.CreatedAt,
           CASE WHEN p.CreatedAt > DATEADD(DAY, -${NEW_DAYS}, SYSUTCDATETIME()) THEN 1 ELSE 0 END AS IsNew,
           ISNULL((SELECT AVG(CAST(r.Rating AS FLOAT)) FROM dbo.Reviews r WHERE r.ProductId = p.Id), 0) AS RatingAvg,
           (SELECT COUNT(*) FROM dbo.Reviews r WHERE r.ProductId = p.Id) AS RatingCount,
           (SELECT COUNT(*) FROM dbo.Likes l WHERE l.ProductId = p.Id) AS LikeCount,
           CASE WHEN @userId IS NOT NULL AND EXISTS
             (SELECT 1 FROM dbo.Likes l WHERE l.ProductId = p.Id AND l.UserId = @userId) THEN 1 ELSE 0 END AS Liked
    FROM dbo.Products p
    WHERE p.IsActive = 1 AND (@slug IS NULL OR p.Slug = @slug)
    ORDER BY p.CreatedAt DESC, p.Id DESC`);

  const variants = await req().query(`
    SELECT v.ProductId, v.Color, v.Size, v.Stock
    FROM dbo.ProductVariants v
    JOIN dbo.Products p ON p.Id = v.ProductId
    WHERE p.IsActive = 1 AND (@slug IS NULL OR p.Slug = @slug)
    ORDER BY v.ProductId, v.ColorOrder, v.SizeOrder`);

  const byProduct = new Map<number, { colors: string[]; sizes: string[]; stock: Record<string, number> }>();
  for (const v of variants.recordset) {
    let e = byProduct.get(v.ProductId);
    if (!e) byProduct.set(v.ProductId, (e = { colors: [], sizes: [], stock: {} }));
    if (!e.colors.includes(v.Color)) e.colors.push(v.Color);
    if (!e.sizes.includes(v.Size)) e.sizes.push(v.Size);
    e.stock[`${v.Color}|${v.Size}`] = v.Stock;
  }

  const images = await loadImages(products.recordset.map(p => p.Id as number));

  return products.recordset.map(p => {
    const v = byProduct.get(p.Id) ?? { colors: [], sizes: [], stock: {} };
    return {
      id: p.Slug,
      name: p.Name,
      type: p.Type,
      category: p.Category,
      guide: p.Guide,
      price: Number(p.Price),
      compareAt: p.CompareAtPrice == null ? null : Number(p.CompareAtPrice),
      desc: p.Description,
      limited: !!p.IsLimited,
      images: images.get(p.Id) ?? [],
      isNew: !!p.IsNew,
      createdAt: new Date(p.CreatedAt).toISOString(),
      colors: v.colors,
      sizes: v.sizes,
      stock: v.stock,
      rating: { avg: Math.round(Number(p.RatingAvg) * 10) / 10, count: p.RatingCount },
      likeCount: p.LikeCount,
      liked: !!p.Liked,
    };
  });
}
