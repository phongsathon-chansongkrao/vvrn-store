import React from "react";
import type { Order, Product, User, Address } from "./types";

export interface AuthApi {
  user: User | null;
  orders: Order[];
  login(email: string, password: string): Promise<string | null>; // error message or null
  register(name: string, email: string, password: string): Promise<string | null>;
  logout(): Promise<void>;
  saveAddress(addr: Address | null): Promise<void>;
  refresh(): Promise<void>;
}

export interface ShopApi {
  stockOf(p: Product, color: string, size: string): number;
  colorStock(p: Product, color: string): number;
  totalStock(p: Product): number;
  inCart(id: string, color: string, size: string): number;
  rating(id: string): { avg: number; count: number };
  likes: string[];
  likeCount(p: Product): number;
  toggleLike(id: string): void;
  stockIssues(items: { id: string; color: string; size: string; qty: number }[]): string[];
  share(p: Product, color?: string): void;
  refresh(): Promise<void>;
  refreshSettings(): Promise<void>; // promo bar etc., after Admin → Site saves
}

// Components read these with React.useContext. `any` keeps the converted UI code simple.
export const AuthCtx = React.createContext<AuthApi>(null as any) as React.Context<any>;
export const ShopCtx = React.createContext<ShopApi>(null as any) as React.Context<any>;
