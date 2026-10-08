/* =====================================================================
   VVRN - 05_product_created_at.sql
   Adds Products.CreatedAt, used for the NEW badge (first 3 days) and to
   sort the shop newest first. Safe to run on an existing database.
   (01_schema.sql already includes this column for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF COL_LENGTH('dbo.Products', 'CreatedAt') IS NULL
BEGIN
    ALTER TABLE dbo.Products ADD CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME();
END
GO

-- Products that existed before this column: we don't know when they were added.
-- Date them 30 days ago (so they're not NEW) and keep the current order:
-- a lower SortOrder counts as newer.
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE CreatedAt < DATEADD(DAY, -4, SYSUTCDATETIME()))
BEGIN
    UPDATE dbo.Products
    SET CreatedAt = DATEADD(MINUTE, -SortOrder, DATEADD(DAY, -30, SYSUTCDATETIME()));

    -- Added from the Admin page today, so it gets the NEW badge for 3 days
    UPDATE dbo.Products SET CreatedAt = SYSUTCDATETIME() WHERE Slug = 'fw22-t-shirt';
END
GO
