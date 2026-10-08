/** Shapes returned by the backend (see backend/src/lib/products.ts and orders.ts). */

export interface Product {
  id: string; // slug
  name: string;
  type: string;
  category: string;
  guide: string;
  price: number;
  compareAt: number | null;
  desc: string;
  limited: boolean;
  images: ProductImage[]; // photos in display order; empty = use the SVG drawing
  isNew: boolean; // added within the last 3 days (server decides)
  createdAt: string;
  colors: string[];
  sizes: string[];
  stock: Record<string, number>; // "Color|Size" -> units left
  rating: { avg: number; count: number };
  likeCount: number;
  liked: boolean;
}

/** color null = shown for every color */
export interface ProductImage { id: number; file: string; color: string | null }

export interface CartItem {
  key: string; // "slug|Color|Size"
  id: string;
  color: string;
  size: string;
  qty: number;
}

export interface Address {
  name: string; phone: string; email: string; line1: string; line2?: string | null;
  city: string; region?: string | null; postal: string; country: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  address: Address | null;
}

export interface OrderEvent { status: string; label: string; at: string; trackingNo: string | null; note: string | null; changedBy?: string | null }

/** Outbox row, staff only. status: pending (will retry), sent, preview (saved to file), failed. */
export interface OrderEmail {
  id: number; kind: string; to: string; status: "pending" | "sent" | "preview" | "failed";
  attempts: number; lastError: string | null; nextAttemptAt: string; createdAt: string; sentAt: string | null; createdBy: string | null;
}

export interface Order {
  no: string;
  date: string;
  status: string;
  statusLabel: string;
  items: { id: string; name: string; type: string; price: number; compareAt: number | null; color: string; size: string; qty: number }[];
  subtotal: number;
  discount: { code: string; amount: number } | null;
  shippingFee: number;
  total: number;
  shipping: { id: string; name: string; eta: string };
  address: Address;
  payment: { method: "card"; brand: string; last4: string } | { method: "qr"; slipName: string; hasSlip?: boolean };
  events: OrderEvent[];
  emails?: OrderEmail[]; // staff only

}
