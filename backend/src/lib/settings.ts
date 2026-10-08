import { z } from "zod";
import { getPool, sql } from "../db.js";

/* Admin-editable site settings, stored as JSON in dbo.SiteSettings. Every value is checked with zod
   on the way in AND on the way out, so a bad row can never break the shop: it falls back to the default. */

export const promoBarSchema = z.object({
  enabled: z.boolean(),
  messages: z
    .array(z.string().trim().min(1, "A message can't be empty.").max(80, "Keep each message under 80 characters."))
    .min(1, "Add at least one message.")
    .max(6, "Up to 6 messages."),
});
export type PromoBar = z.infer<typeof promoBarSchema>;

/** What the bar showed before it was editable. Used until 09_site_settings.sql has been run. */
export const DEFAULT_PROMO_BAR: PromoBar = {
  enabled: true,
  messages: ["SS25 Drop 001", "Limited to 200 units", "Free worldwide shipping"],
};

export async function getPromoBar(): Promise<PromoBar> {
  try {
    const pool = await getPool();
    const row = (await pool.request().query(`SELECT Value FROM dbo.SiteSettings WHERE [Key] = 'promo_bar'`)).recordset[0];
    if (!row) return DEFAULT_PROMO_BAR;
    const parsed = promoBarSchema.safeParse(JSON.parse(row.Value));
    return parsed.success ? parsed.data : DEFAULT_PROMO_BAR;
  } catch (err) {
    if ((err as { number?: number }).number === 208) return DEFAULT_PROMO_BAR; // table not created yet
    if (err instanceof SyntaxError) return DEFAULT_PROMO_BAR; // bad JSON in the row
    throw err;
  }
}

export async function savePromoBar(value: PromoBar, userId: number) {
  const pool = await getPool();
  await pool.request()
    .input("v", sql.NVarChar(sql.MAX), JSON.stringify(value)).input("by", sql.Int, userId)
    .query(`UPDATE dbo.SiteSettings SET Value = @v, UpdatedBy = @by, UpdatedAt = SYSUTCDATETIME() WHERE [Key] = 'promo_bar';
            IF @@ROWCOUNT = 0 INSERT INTO dbo.SiteSettings ([Key], Value, UpdatedBy) VALUES ('promo_bar', @v, @by);`);
}
