import { Router } from "express";
import { ah } from "../lib/http.js";
import { getPromoBar } from "../lib/settings.js";

/** Public settings the shop needs on every page. */
export const settingsRouter = Router();

settingsRouter.get("/", ah(async (_req, res) => {
  res.json({ promoBar: await getPromoBar() });
}));
