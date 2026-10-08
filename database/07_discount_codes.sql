/* =====================================================================
   VVRN - 07_discount_codes.sql
   Discount codes (percent off the subtotal) and who used them.
   "One per account" is enforced by a UNIQUE index, so two orders placed
   at the same moment can't both use it. Seeds VVRN10 (10%, one per account).
   Safe to run on an existing database.
   (01_schema.sql already includes these for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF OBJECT_ID('dbo.DiscountCodes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DiscountCodes (
        Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_DiscountCodes PRIMARY KEY,
        Code          VARCHAR(30)  NOT NULL CONSTRAINT UQ_DiscountCodes_Code UNIQUE,  -- stored upper-case
        PercentOff    TINYINT      NOT NULL CONSTRAINT CK_DiscountCodes_Percent CHECK (PercentOff BETWEEN 1 AND 90),
        OnePerAccount BIT          NOT NULL CONSTRAINT DF_DiscountCodes_OnePer DEFAULT 1,
        IsActive      BIT          NOT NULL CONSTRAINT DF_DiscountCodes_Active DEFAULT 1,
        ExpiresAt     DATETIME2(0) NULL,      -- NULL = never
        CreatedBy     INT          NULL CONSTRAINT FK_DiscountCodes_Users REFERENCES dbo.Users(Id),
        CreatedAt     DATETIME2(0) NOT NULL CONSTRAINT DF_DiscountCodes_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF COL_LENGTH('dbo.Orders', 'DiscountCodeId') IS NULL
BEGIN
    ALTER TABLE dbo.Orders ADD
        DiscountCodeId INT NULL CONSTRAINT FK_Orders_DiscountCodes REFERENCES dbo.DiscountCodes(Id),
        DiscountAmount DECIMAL(10,2) NOT NULL CONSTRAINT DF_Orders_DiscountAmount DEFAULT 0;
END
GO

-- One row per use of a one-per-account code. Deleted again if the order is cancelled.
IF OBJECT_ID('dbo.DiscountRedemptions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DiscountRedemptions (
        DiscountCodeId INT NOT NULL CONSTRAINT FK_Redemptions_Codes REFERENCES dbo.DiscountCodes(Id),
        UserId         INT NOT NULL CONSTRAINT FK_Redemptions_Users REFERENCES dbo.Users(Id),
        OrderId        INT NOT NULL CONSTRAINT FK_Redemptions_Orders REFERENCES dbo.Orders(Id),
        CreatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_Redemptions_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_DiscountRedemptions PRIMARY KEY (DiscountCodeId, UserId)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DiscountCodes WHERE Code = 'VVRN10')
    INSERT INTO dbo.DiscountCodes (Code, PercentOff, OnePerAccount) VALUES ('VVRN10', 10, 1);
GO
