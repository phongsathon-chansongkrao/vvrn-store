import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { getPool } from "../db.js";
import { ah } from "../lib/http.js";
import { findUsableCode } from "../lib/discounts.js";
import { requireAuth } from "../middleware/auth.js";

export const discountsRouter = Router();

// Slow down anyone trying to guess codes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many tries. Wait a few minutes and try again." } });

/** Checkout "Apply" button. The order route checks the code again when the order is placed. */
discountsRouter.post("/check", requireAuth, limiter, ah(async (req, res) => {
  const { code } = z.object({ code: z.string().trim().min(1, "Enter a code.").max(30) }).parse(req.body);
  const pool = await getPool();
  const d = await findUsableCode(pool.request(), code, req.user!.id);
  res.json({ code: d.code, percentOff: d.percentOff });
}));
