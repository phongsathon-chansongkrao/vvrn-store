import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { getPool } from "./db.js";
import { errorHandler, notFound } from "./lib/http.js";
import { readUser } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { adminRouter } from "./routes/admin.js";
import { discountsRouter } from "./routes/discounts.js";
import { settingsRouter } from "./routes/settings.js";
import { startOutboxWorker } from "./lib/mail.js";
import { PRODUCT_IMG_DIR } from "./lib/images.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(readUser);

app.get("/api/health", async (_req, res) => {
  try {
    await (await getPool()).request().query("SELECT 1 AS ok");
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, db: "unreachable", error: (err as Error).message });
  }
});

// Product photos are public. Names are random and never reused, so they can be cached for a long time.
app.use("/api/images", express.static(PRODUCT_IMG_DIR, {
  maxAge: "365d", immutable: true, index: false, dotfiles: "deny",
  setHeaders: res => res.setHeader("X-Content-Type-Options", "nosniff"),
}));

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/discounts", discountsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, async () => {
  console.log(`VVRN API listening on http://localhost:${config.port}`);
  if (!config.mail.resendKey) console.log("Email: no RESEND_API_KEY, so emails are saved to backend/mail-outbox/ instead of sent.");
  else if (config.mail.testTo) console.log("Email: MAIL_TEST_TO is set, so every email goes to that address instead of the customer.");
  try {
    await getPool();
    console.log("Connected to SQL Server.");
    startOutboxWorker();
  } catch (err) {
    console.error("Could not connect to SQL Server:", (err as Error).message);
    console.error("Check DB_* values in .env, that TCP/IP is enabled, and that SQL logins are allowed. See README.");
  }
});
