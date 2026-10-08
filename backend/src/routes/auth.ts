import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { getPool, sql, isDuplicateKey } from "../db.js";
import { config } from "../config.js";
import { ah, HttpError } from "../lib/http.js";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "../lib/schemas.js";
import { clearAuthCookie, requireAuth, setAuthCookie, type Role } from "../middleware/auth.js";

export const authRouter = Router();

// Slow down password guessing
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "Too many attempts. Wait a few minutes and try again." } });

async function loadMe(userId: number) {
  const pool = await getPool();
  const r = await pool.request().input("id", sql.Int, userId).query(`
    SELECT u.Id, u.Name, u.Email, u.Role, a.Name AS AName, a.Phone, a.Email AS AEmail, a.Line1, a.Line2, a.City, a.Region, a.Postal, a.Country
    FROM dbo.Users u LEFT JOIN dbo.Addresses a ON a.UserId = u.Id WHERE u.Id = @id`);
  const u = r.recordset[0];
  if (!u) return null;
  return {
    id: u.Id as number,
    name: u.Name as string,
    email: u.Email as string,
    role: u.Role as string,
    address: u.Line1
      ? { name: u.AName, phone: u.Phone, email: u.AEmail, line1: u.Line1, line2: u.Line2 ?? "", city: u.City,
          region: u.Region ?? "", postal: u.Postal, country: u.Country }
      : null,
  };
}

authRouter.get("/me", ah(async (req, res) => {
  if (!req.user) return res.json({ user: null });
  const me = await loadMe(req.user.id);
  if (!me) clearAuthCookie(res); // account was deleted
  // Role changed since login: re-issue the cookie so the token matches the database
  else if (me.role !== req.user.role) setAuthCookie(res, { id: me.id, email: me.email, name: me.name, role: me.role as Role });
  res.json({ user: me });
}));

authRouter.post("/register", limiter, ah(async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);
  const hash = await bcrypt.hash(password, 10);
  const pool = await getPool();
  let id: number;
  try {
    const r = await pool.request()
      .input("name", sql.NVarChar(100), name).input("email", sql.NVarChar(255), email).input("hash", sql.NVarChar(255), hash)
      .query(`INSERT INTO dbo.Users (Name, Email, PasswordHash) OUTPUT INSERTED.Id VALUES (@name, @email, @hash)`);
    id = r.recordset[0].Id;
  } catch (err) {
    if (isDuplicateKey(err)) throw new HttpError(409, "An account with this email already exists. Log in instead.");
    throw err;
  }
  setAuthCookie(res, { id, email, name, role: "customer" });
  res.status(201).json({ user: await loadMe(id) });
}));

authRouter.post("/login", limiter, ah(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const pool = await getPool();
  const r = await pool.request().input("email", sql.NVarChar(255), email)
    .query(`SELECT Id, Name, Email, Role, PasswordHash FROM dbo.Users WHERE Email = @email`);
  const u = r.recordset[0];
  // Same message either way, so nobody can probe which emails have accounts
  if (!u || !(await bcrypt.compare(password, u.PasswordHash))) throw new HttpError(401, "That email and password don't match an account.");
  setAuthCookie(res, { id: u.Id, email: u.Email, name: u.Name, role: u.Role });
  res.json({ user: await loadMe(u.Id) });
}));

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.post("/forgot", limiter, ah(async (req, res) => {
  const { email } = forgotSchema.parse(req.body);
  const pool = await getPool();
  const u = (await pool.request().input("email", sql.NVarChar(255), email).query(`SELECT Id FROM dbo.Users WHERE Email = @email`)).recordset[0];
  let devCode: string | undefined;
  if (u) {
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);
    await pool.request().input("uid", sql.Int, u.Id).input("hash", sql.NVarChar(255), codeHash).query(`
      UPDATE dbo.PasswordResets SET UsedAt = SYSUTCDATETIME() WHERE UserId = @uid AND UsedAt IS NULL;
      INSERT INTO dbo.PasswordResets (UserId, CodeHash, ExpiresAt) VALUES (@uid, @hash, DATEADD(MINUTE, 15, SYSUTCDATETIME()));`);
    // TODO: send the code by email (Resend, SendGrid, ...). Until then it's logged here.
    console.log(`[password reset] ${email}: ${code}`);
    if (!config.isProd) devCode = code;
  }
  // Same response whether or not the account exists
  res.json({ ok: true, ...(devCode ? { devCode } : {}) });
}));

authRouter.post("/reset", limiter, ah(async (req, res) => {
  const { email, code, password } = resetSchema.parse(req.body);
  const pool = await getPool();
  const bad = new HttpError(400, "That code isn't right or has expired. Request a new one.");
  const row = (await pool.request().input("email", sql.NVarChar(255), email).query(`
    SELECT TOP 1 r.Id, r.CodeHash, r.Attempts, u.Id AS UserId
    FROM dbo.PasswordResets r JOIN dbo.Users u ON u.Id = r.UserId
    WHERE u.Email = @email AND r.UsedAt IS NULL AND r.ExpiresAt > SYSUTCDATETIME()
    ORDER BY r.CreatedAt DESC`)).recordset[0];
  if (!row || row.Attempts >= 5) throw bad;
  if (!(await bcrypt.compare(code, row.CodeHash))) {
    await pool.request().input("id", sql.Int, row.Id).query(`UPDATE dbo.PasswordResets SET Attempts = Attempts + 1 WHERE Id = @id`);
    throw bad;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.request().input("id", sql.Int, row.Id).input("uid", sql.Int, row.UserId).input("hash", sql.NVarChar(255), hash).query(`
    UPDATE dbo.Users SET PasswordHash = @hash WHERE Id = @uid;
    UPDATE dbo.PasswordResets SET UsedAt = SYSUTCDATETIME() WHERE UserId = @uid AND UsedAt IS NULL;`);
  res.json({ ok: true });
}));

export { loadMe, requireAuth };
