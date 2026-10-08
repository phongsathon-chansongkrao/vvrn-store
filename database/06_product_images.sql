/* =====================================================================
   VVRN - 06_product_images.sql
   Product photos. Files live in backend/uploads/products; this table
   says which product (and optionally which color) each one belongs to.
   Safe to run on an existing database.
   (01_schema.sql already includes this table for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF OBJECT_ID('dbo.ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductImages (
        Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductImages PRIMARY KEY,
        ProductId INT NOT NULL CONSTRAINT FK_ProductImages_Products REFERENCES dbo.Products(Id),
        Color     VARCHAR(30)  NULL,          -- NULL = shown for every color
        FileName  VARCHAR(80)  NOT NULL,      -- random name inside backend/uploads/products
        SortOrder INT          NOT NULL CONSTRAINT DF_ProductImages_SortOrder DEFAULT 0,  -- lowest = main photo
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductImages_CreatedAt DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_ProductImages_Product ON dbo.ProductImages(ProductId, SortOrder);
END
GO
