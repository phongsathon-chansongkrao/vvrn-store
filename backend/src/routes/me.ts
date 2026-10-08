import { Router } from "express";
import { ah } from "../lib/http.js";
import { addressSchema, type Address } from "../lib/schemas.js";
import { requireAuth } from "../middleware/auth.js";
import { getPool, sql } from "../db.js";
import { loadMe } from "./auth.js";

export const meRouter = Router();
meRouter.use(requireAuth);

/** Insert or update the user's saved address. Works inside a transaction too. */
export async function upsertAddress(request: sql.Request, userId: number, a: Address) {
  await request
    .input("aUid", sql.Int, userId)
    .input("aName", sql.NVarChar(100), a.name).input("aPhone", sql.NVarChar(30), a.phone)
    .input("aEmail", sql.NVarChar(255), a.email).input("aLine1", sql.NVarChar(200), a.line1)
    .input("aLine2", sql.NVarChar(200), a.line2).input("aCity", sql.NVarChar(100), a.city)
    .input("aRegion", sql.NVarChar(100), a.region).input("aPostal", sql.NVarChar(20), a.postal)
    .input("aCountry", sql.NVarChar(60), a.country)
    .query(`
      UPDATE dbo.Addresses SET Name=@aName, Phone=@aPhone, Email=@aEmail, Line1=@aLine1, Line2=@aLine2, City=@aCity,
             Region=@aRegion, Postal=@aPostal, Country=@aCountry, UpdatedAt=SYSUTCDATETIME()
      WHERE UserId = @aUid;
      IF @@ROWCOUNT = 0
        INSERT INTO dbo.Addresses (UserId, Name, Phone, Email, Line1, Line2, City, Region, Postal, Country)
        VALUES (@aUid, @aName, @aPhone, @aEmail, @aLine1, @aLine2, @aCity, @aRegion, @aPostal, @aCountry);`);
}

meRouter.put("/address", ah(async (req, res) => {
  const a = addressSchema.parse(req.body);
  const pool = await getPool();
  await upsertAddress(pool.request(), req.user!.id, a);
  res.json({ user: await loadMe(req.user!.id) });
}));

meRouter.delete("/address", ah(async (req, res) => {
  const pool = await getPool();
  await pool.request().input("uid", sql.Int, req.user!.id).query(`DELETE FROM dbo.Addresses WHERE UserId = @uid`);
  res.json({ user: await loadMe(req.user!.id) });
}));
