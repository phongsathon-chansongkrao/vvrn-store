import React, { useCallback, useEffect, useState } from "react";
import { api } from "./lib/api";
import { findProduct, setCatalog } from "./lib/catalog";
import { AuthCtx, ShopCtx, type AuthApi, type ShopApi } from "./lib/context";
import { money } from "./lib/data";
import { productHref, useRoute } from "./lib/router";
import { store } from "./lib/storage";
import type { CartItem, Order, Product, User } from "./lib/types";

import { DEFAULT_PROMO_BAR, Marquee, Nav } from "./components/ui";
import { CartDrawer } from "./components/CartDrawer";
import { Toast } from "./components/Toast";
import { SuccessModal } from "./components/SuccessModal";
import { Dialog } from "./components/Dialog";
import { btnPrimary } from "./components/forms";

import { Home } from "./pages/Home";
import { Stockists } from "./pages/Stockists";
import { ProductDetail } from "./pages/ProductDetail";
import { Lookbook } from "./pages/Lookbook";
import { About } from "./pages/About";
import { Checkout } from "./pages/Checkout";
import { Login, Register } from "./pages/Auth";
import { Forgot } from "./pages/Forgot";
import { Track } from "./pages/Track";
import { Account } from "./pages/Account";
import { Admin } from "./pages/Admin";

type ToastState = { n: number; text: string; action?: string; onAction?: () => void } | null;

export default function App() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const route = useRoute(products);
  const [loadError, setLoadError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => store.get<CartItem[]>("cart", []));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [promoBar, setPromoBar] = useState(DEFAULT_PROMO_BAR);
  const loadSettings = useCallback(async () => {
    const r = await api<{ promoBar: typeof DEFAULT_PROMO_BAR }>("/settings");
    setPromoBar(r.promoBar);
  }, []);

  /* ---------- loading ---------- */
  const loadProducts = useCallback(async () => {
    const list = await api<Product[]>("/products");
    setCatalog(list);
    setProducts(list);
    setLoadError("");
  }, []);

  const loadMe = useCallback(async () => {
    const r = await api<{ user: User | null }>("/auth/me");
    setUser(r.user);
    setOrders(r.user ? await api<Order[]>("/orders/me") : []);
  }, []);

  const boot = useCallback(() => {
    loadProducts().catch(e => setLoadError(e.message));
    loadSettings().catch(() => {}); // keep the default bar if this fails
    loadMe().catch(() => {});
  }, [loadProducts, loadMe, loadSettings]);

  useEffect(boot, [boot]);
  useEffect(() => store.set("cart", cart), [cart]);
  // Drop cart lines for products that are no longer sold
  useEffect(() => {
    if (products) setCart(c => c.filter(it => findProduct(it.id) && findProduct(it.id).colors.includes(it.color)));
  }, [products]);

  /* ---------- auth ---------- */
  const auth: AuthApi = {
    user,
    orders,
    async register(name, email, password) {
      try {
        const r = await api<{ user: User }>("/auth/register", { body: { name, email, password } });
        setUser(r.user);
        setOrders([]);
        await loadProducts();
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    },
    async login(email, password) {
      try {
        const r = await api<{ user: User }>("/auth/login", { body: { email, password } });
        setUser(r.user);
        setOrders(await api<Order[]>("/orders/me"));
        await loadProducts(); // refresh "liked" flags
        return null;
      } catch (e) {
        return (e as Error).message;
      }
    },
    async logout() {
      await api("/auth/logout", { method: "POST" }).catch(() => {});
      setUser(null);
      setOrders([]);
      loadProducts().catch(() => {});
    },
    async saveAddress(addr) {
      const r = addr
        ? await api<{ user: User }>("/me/address", { method: "PUT", body: addr })
        : await api<{ user: User }>("/me/address", { method: "DELETE" });
      setUser(r.user);
    },
    refresh: loadMe,
  };

  /* ---------- shop ---------- */
  const patchProduct = (id: string, patch: Partial<Product>) =>
    setProducts(prev => {
      const next = (prev || []).map(p => (p.id === id ? { ...p, ...patch } : p));
      setCatalog(next);
      return next;
    });

  const stockOf = (p: Product, c: string, s: string) => p.stock[`${c}|${s}`] ?? 0;
  const colorStock = (p: Product, c: string) => p.sizes.reduce((u, s) => u + stockOf(p, c, s), 0);

  const shop: ShopApi = {
    stockOf,
    colorStock,
    totalStock: p => p.colors.reduce((t, c) => t + colorStock(p, c), 0),
    inCart: (id, c, s) => cart.find(x => x.key === `${id}|${c}|${s}`)?.qty ?? 0,
    rating: id => findProduct(id)?.rating ?? { avg: 0, count: 0 },
    likes: (products || []).filter(p => p.liked).map(p => p.id),
    likeCount: p => p.likeCount,
    async toggleLike(id) {
      if (!user) {
        setToast({ n: Date.now(), text: "Log in to save items you like.", action: "Log in", onAction: () => (location.hash = "#/login") });
        return;
      }
      const p = findProduct(id);
      const liked = !p.liked;
      patchProduct(id, { liked, likeCount: p.likeCount + (liked ? 1 : -1) }); // optimistic
      try {
        const r = await api<{ liked: boolean; likeCount: number }>(`/products/${id}/like`, { method: liked ? "POST" : "DELETE" });
        patchProduct(id, r);
      } catch (e) {
        patchProduct(id, { liked: p.liked, likeCount: p.likeCount });
        setToast({ n: Date.now(), text: (e as Error).message });
      }
    },
    stockIssues: items =>
      items.flatMap(it => {
        const p = findProduct(it.id);
        if (!p) return ["An item in your cart is no longer available."];
        const left = stockOf(p, it.color, it.size);
        if (it.qty <= left) return [];
        return [left ? `${p.name} (${it.color} / ${it.size}) has only ${left} left.` : `${p.name} (${it.color} / ${it.size}) just sold out.`];
      }),
    async share(p, color) {
      const url = location.href.split("#")[0] + productHref(p.id, color);
      try {
        if (navigator.share) {
          await navigator.share({ title: `${p.name} | VVRN`, text: `${p.name} · ${money(p.price)}`, url });
          return;
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
      try {
        await navigator.clipboard.writeText(url);
        setToast({ n: Date.now(), text: "Product link copied to clipboard." });
      } catch {
        setShareUrl(url);
      }
    },
    refresh: loadProducts,
    refreshSettings: loadSettings,
  };

  /* ---------- cart ---------- */
  const count = cart.reduce((s, it) => s + it.qty, 0);

  const addToCart = ({ id, color, size, qty }: Omit<CartItem, "key">) => {
    const p = findProduct(id);
    const key = `${id}|${color}|${size}`;
    const cap = Math.min(10, stockOf(p, color, size));
    setCart(prev => {
      const hit = prev.find(it => it.key === key);
      if (hit) return prev.map(it => (it.key === key ? { ...it, qty: Math.min(cap, it.qty + qty) } : it));
      return [...prev, { key, id, color, size, qty: Math.min(cap, qty) }];
    });
    setToast({ n: Date.now(), text: `Added ${qty} × ${p.name} (${color} / ${size}) to cart.`, action: "View cart", onAction: () => setCartOpen(true) });
  };
  const setQty = (key: string, q: number) =>
    setCart(prev =>
      prev.map(it => {
        if (it.key !== key) return it;
        const cap = Math.min(10, stockOf(findProduct(it.id), it.color, it.size));
        return { ...it, qty: Math.max(1, Math.min(cap, q)) };
      })
    );
  const remove = (key: string) => setCart(prev => prev.filter(it => it.key !== key));

  const onPlaced = (order: Order) => {
    setCart([]);
    setPlaced(order);
    loadProducts().catch(() => {}); // stock went down
    if (user) loadMe().catch(() => {}); // new order + saved address
  };

  /* ---------- page ---------- */
  let page: React.ReactNode;
  if (!products) {
    page = (
      <main className="mx-auto max-w-[1440px] px-6 lg:px-12 py-24 text-center">
        {loadError ? (
          <>
            <h1 className="font-display text-[48px] leading-none text-bone">Can't load the shop</h1>
            <p className="mt-4 text-bone/70">{loadError}</p>
            <button onClick={boot} className={btnPrimary + " mt-8"}>Try again</button>
          </>
        ) : (
          <p className="text-ash">Loading…</p>
        )}
      </main>
    );
  } else if (route.page === "stockists") page = <Stockists />;
  else if (route.page === "lookbook") page = <Lookbook />;
  else if (route.page === "about") page = <About />;
  else if (route.page === "product") page = <ProductDetail key={route.id} id={route.id} initialColor={route.color} onAdd={addToCart} />; // key: fresh color/size when moving to another product
  else if (route.page === "checkout") page = <Checkout items={cart} onPlaced={onPlaced} />;
  else if (route.page === "login") page = <Login next={route.next} />;
  else if (route.page === "register") page = <Register next={route.next} />;
  else if (route.page === "forgot") page = <Forgot />;
  else if (route.page === "track") page = <Track initialNo={route.no} />;
  else if (route.page === "account") page = <Account />;
  else if (route.page === "admin") page = <Admin tab={route.tab} />;
  else page = <Home />;

  return (
    <AuthCtx.Provider value={auth}>
      <ShopCtx.Provider value={shop}>
        <div className="min-h-screen bg-ink">
          <Marquee bar={promoBar} />
          <Nav route={route} count={count} onCart={() => setCartOpen(true)} user={user} />
          {page}
          <footer className="mt-16 border-t border-line">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12px] text-ash">
              <span>© 2025 VVRN · Free standard shipping on Drop 001</span>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <a href="#/track" className="hover:text-bone">Track order</a>
                <a href={user ? "#/account" : "#/login"} className="hover:text-bone">Account</a>
              </div>
            </div>
          </footer>
          {products && (
            <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onQty={setQty} onRemove={remove} />
          )}
          <Toast toast={toast} onDone={() => setToast(null)} />
          <SuccessModal order={placed} loggedIn={!!user} onClose={() => setPlaced(null)} />
          <Dialog
            open={!!shareUrl}
            title="Share this product"
            body="Copy the link below."
            onClose={() => setShareUrl(null)}
            actions={<button data-autofocus onClick={() => setShareUrl(null)} className={btnPrimary + " flex-1"}>Done</button>}
          >
            <input
              readOnly
              value={shareUrl || ""}
              onFocus={e => e.target.select()}
              aria-label="Product link"
              className="mt-5 w-full h-11 px-3 bg-transparent border border-line text-[13px] text-bone font-mono outline-none focus:border-amber"
            />
          </Dialog>
        </div>
      </ShopCtx.Provider>
    </AuthCtx.Provider>
  );
}
