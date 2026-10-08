import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { getPool, sql } from "../db.js";
import { HttpError } from "../lib/http.js";

export const ROLES = ["customer", "staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const COOKIE = "vvrn_token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const asRole = (v: unknown): Role => (ROLES.includes(v as Role) ? (v as Role) : "customer");

export function setAuthCookie(res: Response, user: AuthUser) {
  const token = jwt.sign({ sub: String(user.id), email: user.email, name: user.name, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
  res.cookie(COOKIE, token, {
    httpOnly: true, // JavaScript in the page can't read it
    secure: config.isProd, // HTTPS only in production
    sameSite: "lax",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE, { path: "/" });
}

/** Reads the cookie if present and sets req.user. Never blocks the request. */
export function readUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const p = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
      req.user = { id: Number(p.sub), email: String(p.email), name: String(p.name), role: asRole(p.role) };
    } catch {
      /* expired or tampered: treat as logged out */
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, "Please log in first."));
  next();
}

/**
 * Allows the request only for the given roles. The role in the token is just a hint for the UI:
 * here it is re-read from the database, so promoting or demoting someone takes effect right away.
 */
export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Please log in first."));
    getPool()
      .then(pool => pool.request().input("id", sql.Int, req.user!.id).query(`SELECT Role FROM dbo.Users WHERE Id = @id`))
      .then(r => {
        const row = r.recordset[0];
        if (!row) return next(new HttpError(401, "Please log in first."));
        req.user!.role = asRole(row.Role);
        if (!allowed.includes(req.user!.role)) return next(new HttpError(403, "You don't have access to this."));
        next();
      })
      .catch(next);
  };
}
