import { z } from "zod";

const text = (label: string, max: number) =>
  z.string({ required_error: `${label} is required.` }).trim().min(1, `Enter ${label.toLowerCase()}.`).max(max, `${label} is too long.`);
const optionalText = (max: number) => z.string().trim().max(max).optional().transform(v => v || null);

export const emailSchema = z.string().trim().toLowerCase().email("Enter an email like name@example.com.").max(255);
export const passwordSchema = z.string().min(6, "Use at least 6 characters.").max(100, "Password is too long.");

export const registerSchema = z.object({ name: text("Name", 100), email: emailSchema, password: passwordSchema });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });
export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/, "The code is 6 digits."),
  password: passwordSchema,
});

export const addressSchema = z.object({
  name: text("Full name", 100),
  phone: text("Phone", 30),
  email: emailSchema,
  line1: text("Address", 200),
  line2: optionalText(200),
  city: text("City", 100),
  region: optionalText(100),
  postal: text("Postal code", 20),
  country: text("Country", 60),
});
export type Address = z.infer<typeof addressSchema>;

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().max(80),
        color: z.string().max(30),
        size: z.string().max(20),
        qty: z.number().int().min(1).max(10),
      })
    )
    .min(1, "Your cart is empty.")
    .max(30),
  address: addressSchema,
  shipping: z.enum(["standard", "express"]),
  payment: z.discriminatedUnion("method", [
    // Only the brand and last 4 digits ever reach the server.
    z.object({ method: z.literal("card"), brand: z.string().max(20), last4: z.string().regex(/^\d{4}$/) }),
    z.object({ method: z.literal("qr") }),
  ]),
  saveAddress: z.boolean().optional(),
  discountCode: z.string().trim().max(30).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a star rating.").max(5),
  text: z.string().trim().min(10, "Write at least 10 characters.").max(500, "Keep it under 500 characters."),
});

export const ORDER_STATUSES = ["placed", "checking_slip", "paid", "packed", "shipped", "delivered", "cancelled"] as const;
export const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  checking_slip: "Checking slip",
  paid: "Payment confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const adminStatusSchema = z.object({
  status: z.enum(["paid", "packed", "shipped", "delivered", "cancelled"]),
  trackingNo: z.string().trim().max(40).optional(),
  note: z.string().trim().max(200).optional(),
});

/** Staff set a variant's stock to a counted value. `expected` is the stock they saw, so a sale in between isn't overwritten. */
export const stockSchema = z.object({
  stock: z.number({ invalid_type_error: "Enter a number." }).int("Use a whole number.").min(0, "Stock can't be negative.").max(9999),
  expected: z.number().int().min(0),
});

export const productPatchSchema = z
  .object({
    price: z.number({ invalid_type_error: "Enter a price." }).min(0, "Price can't be negative.").max(1_000_000),
    compareAt: z.number().min(0).max(1_000_000).nullable(),
    isActive: z.boolean(),
    name: text("Name", 120),
    description: text("Description", 1000),
    isLimited: z.boolean(),
  })
  .partial()
  .refine(v => Object.keys(v).length > 0, "Nothing to update.");

export const roleSchema = z.object({ role: z.enum(["customer", "staff", "admin"]) });

/* ---------- Catalog values the frontend knows how to draw (keep in sync with frontend lib/data.ts + Garment.tsx) ---------- */
export const PRODUCT_TYPES = [
  "jacket", "hoodie", "tee", "longsleeve", "vest", "cargo", "shorts", "cap",
  "shirt", "shirt-ss", "tank", "jeans", "slacks", "shoes", "belt", "shades", "round", "aviator", "tie", "socks",
] as const;
export const CATEGORIES = ["Outerwear", "Tops", "Bottoms", "Footwear", "Accessories"] as const;
export const GUIDES = ["outer", "tops", "pants", "shorts", "cap", "shoes", "socks", "belt", "eyewear", "tie"] as const;
export const COLORS = ["Black", "Graphite", "Bone", "Olive", "Amber", "Indigo", "Khaki", "Tortoise", "White"] as const;
/** Display order. Also the only sizes accepted. */
export const SIZES = ["XS", "S", "M", "L", "XL", "One size", "39-42", "43-46", "40", "41", "42", "43", "44", "45"] as const;

const uniq = <T>(a: T[]) => new Set(a).size === a.length;

export const newProductSchema = z
  .object({
    name: text("Name", 120),
    slug: z.string().trim().toLowerCase().min(2, "Slug is too short.").max(80)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers and single dashes only, e.g. night-shift-hoodie."),
    type: z.enum(PRODUCT_TYPES),
    category: z.enum(CATEGORIES),
    guide: z.enum(GUIDES),
    price: z.number({ invalid_type_error: "Enter a price." }).min(0, "Price can't be negative.").max(1_000_000),
    compareAt: z.number().min(0).max(1_000_000).nullable(),
    description: text("Description", 1000),
    isLimited: z.boolean(),
    colors: z.array(z.enum(COLORS)).min(1, "Add at least one color.").max(COLORS.length).refine(uniq, "A color is listed twice."),
    sizes: z.array(z.enum(SIZES)).min(1, "Pick at least one size.").max(SIZES.length).refine(uniq, "A size is listed twice."),
    /** "Color|Size" -> starting stock. Missing = 0. */
    stock: z.record(z.number().int().min(0).max(9999)).default({}),
  })
  .refine(v => v.compareAt == null || v.compareAt > v.price, {
    message: "The original price must be higher than the sale price. Leave it empty if the item isn't on sale.",
    path: ["compareAt"],
  });

export const addVariantsSchema = z
  .object({
    colors: z.array(z.enum(COLORS)).max(COLORS.length).default([]),
    sizes: z.array(z.enum(SIZES)).max(SIZES.length).default([]),
  })
  .refine(v => v.colors.length + v.sizes.length > 0, "Pick a color or a size to add.");
