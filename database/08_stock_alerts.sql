/* =====================================================================
   VVRN - 08_stock_alerts.sql
   "Notify me when it's back": customers leave an email on a sold-out
   color/size. When an admin adds stock, the backend emails everyone
   waiting (through the email outbox) and marks them notified.
   Also lets the outbox send emails that aren't about an order.
   Safe to run on an existing database.
   (01_schema.sql already includes these for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF OBJECT_ID('dbo.StockAlerts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.StockAlerts (
        Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_StockAlerts PRIMARY KEY,
        VariantId  INT NOT NULL CONSTRAINT FK_StockAlerts_Variants REFERENCES dbo.ProductVariants(Id),
        Email      NVARCHAR(255) NOT NULL,     -- stored lower-case
        UserId     INT NULL CONSTRAINT FK_StockAlerts_Users REFERENCES dbo.Users(Id),
        CreatedAt  DATETIME2(0) NOT NULL CONSTRAINT DF_StockAlerts_CreatedAt DEFAULT SYSUTCDATETIME(),
        NotifiedAt DATETIME2(0) NULL           -- set when the "back in stock" email is queued
    );
    -- One waiting alert per email per variant
    CREATE UNIQUE INDEX UX_StockAlerts_Waiting ON dbo.StockAlerts(VariantId, Email) WHERE NotifiedAt IS NULL;
END
GO

-- Outbox rows can now be about a stock alert instead of an order
IF COL_LENGTH('dbo.EmailOutbox', 'StockAlertId') IS NULL
BEGIN
    ALTER TABLE dbo.EmailOutbox ALTER COLUMN OrderId INT NULL;
    ALTER TABLE dbo.EmailOutbox ADD StockAlertId INT NULL
        CONSTRAINT FK_EmailOutbox_StockAlerts REFERENCES dbo.StockAlerts(Id);
END
GO
