import { sql } from "../db.js";
import { HttpError } from "./http.js";

/* Discount codes: percent off the subtotal (never shipping), whole baht.
   "One per account" is checked here for a friendly message, and enforced by the
   PRIMARY KEY on dbo.DiscountRedemptions (DiscountCodeId, UserId) inside the order transaction. */

export interface UsableCode {
  id: number;
  code: string;
  percentOff: number;
  onePerAccount: boolean;
}

export const normalizeCode = (s: string) => s.trim().toUpperCase();

export const discountAmount = (subtotal: number, percentOff: number) => Math.round((subtotal * percentOff) / 100);

export const alreadyUsed = (code: string) => new HttpError(409, `You've already used the code ${code}. Each account can use it once.`);

/** Throws a friendly HttpError if the code can't be used by this user. Pass a Request bound to the order transaction when placing an order. */
export async function findUsableCode(request: sql.Request, rawCode: string, userId: number): Promise<UsableCode> {
  const code = normalizeCode(rawCode);
  const row = (await request
    .input("dCode", sql.VarChar(30), code.slice(0, 30)).input("dUser", sql.Int, userId)
    .query(`SELECT Id, Code, PercentOff, OnePerAccount, IsActive,
                   CASE WHEN ExpiresAt IS NOT NULL AND ExpiresAt <= SYSUTCDATETIME() THEN 1 ELSE 0 END AS Expired,
                   CASE WHEN EXISTS (SELECT 1 FROM dbo.DiscountRedemptions r WHERE r.DiscountCodeId = c.Id AND r.UserId = @dUser)
                        THEN 1 ELSE 0 END AS Used
            FROM dbo.DiscountCodes c WHERE Code = @dCode`)).recordset[0];
  if (!row || !row.IsActive) throw new HttpError(400, `"${code}" isn't a valid discount code.`);
  if (row.Expired) throw new HttpError(400, `The code ${code} has expired.`);
  if (row.OnePerAccount && row.Used) throw alreadyUsed(row.Code);
  return { id: row.Id, code: row.Code, percentOff: row.PercentOff, onePerAccount: !!row.OnePerAccount };
}
