import React, { useState, useEffect } from "react";
import { findProduct } from "./catalog";

export function parseHash() {
  const raw = (location.hash || "#/").slice(1);
  const [path, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "stockists")
    return {
      page: "stockists",
    };
  if (parts[0] === "lookbook")
    return {
      page: "lookbook",
    };
  if (parts[0] === "about")
    return {
      page: "about",
    };
  if (parts[0] === "checkout")
    return {
      page: "checkout",
    };
  if (parts[0] === "forgot")
    return {
      page: "forgot",
    };
  if (parts[0] === "track")
    return {
      page: "track",
      no: params.get("no"),
    };
  if (parts[0] === "admin")
    return {
      page: "admin",
      tab: ["orders", "products", "discounts", "site", "users"].includes(parts[1]) ? parts[1] : "orders",
    };
  if (parts[0] === "account")
    return {
      page: "account",
    };
  if (parts[0] === "login")
    return {
      page: "login",
      next: params.get("next"),
    };
  if (parts[0] === "register")
    return {
      page: "register",
      next: params.get("next"),
    };
  if (parts[0] === "product" && findProduct(parts[1]))
    return {
      page: "product",
      id: parts[1],
      color: params.get("c"),
    };
  return {
    page: "home",
  };
}

/** `catalog`: pass the product list so the route is read again once it loads.
 *  Without it, opening a #/product/... link directly showed the home page (the product wasn't known yet). */
export function useRoute(catalog?: unknown) {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    if (!catalog) return;
    // Keep the same object when nothing changed (the catalog also changes on every like)
    setRoute(prev => {
      const next = parseHash();
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [catalog]);
  useEffect(() => {
    const on = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const productHref = (id: string, color?: string) => `#/product/${id}${color ? "?c=" + encodeURIComponent(color) : ""}`;

/* =========================================================
   SHARED UI
   ========================================================= */
