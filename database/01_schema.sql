/* =====================================================================
   VVRN - 01_schema.sql
   Creates every table. Safe to re-run: it drops the tables first,
   so it ALSO DELETES ALL DATA. Run 02_seed.sql afterwards.
   ===================================================================== */

USE VVRN;
GO

DROP TABLE IF EXISTS dbo.SiteSettings;
DROP TABLE IF EXISTS dbo.DiscountRedemptions;
DROP TABLE IF EXISTS dbo.EmailOutbox;
DROP TABLE IF EXISTS dbo.StockAlerts;
DROP TABLE IF EXISTS dbo.PasswordResets;
DROP TABLE IF EXISTS dbo.Likes;
DROP TABLE IF EXISTS dbo.Reviews;
DROP TABLE IF EXISTS dbo.OrderEvents;
DROP TABLE IF EXISTS dbo.OrderItems;
DROP TABLE IF EXISTS dbo.Orders;
DROP TABLE IF EXISTS dbo.DiscountCodes;
DROP TABLE IF EXISTS dbo.ProductImages;
DROP TABLE IF EXISTS dbo.ProductVariants;
DROP TABLE IF EXISTS dbo.Products;
DROP TABLE IF EXISTS dbo.Addresses;
DROP TABLE IF EXISTS dbo.Users;
GO

/* ---------- Accounts ---------- */
CREATE TABLE dbo.Users (
    Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    Name          NVARCHAR(100) NOT NULL,
    Email         NVARCHAR(255) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,  -- stored lower-case
    PasswordHash  NVARCHAR(255) NOT NULL,                                   -- bcrypt
    Role          VARCHAR(10)   NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'customer'
                  CONSTRAINT CK_Users_Role CHECK (Role IN ('customer', 'staff', 'admin')),
    CreatedAt     DATETIME2(0)  NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
);

-- One saved shipping address per user
CREATE TABLE dbo.Addresses (
    UserId    INT NOT NULL CONSTRAINT PK_Addresses PRIMARY KEY
              CONSTRAINT FK_Addresses_Users REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    Name      NVARCHAR(100) NOT NULL,
    Phone     NVARCHAR(30)  NOT NULL,
    Email     NVARCHAR(255) NOT NULL,
    Line1     NVARCHAR(200) NOT NULL,
    Line2     NVARCHAR(200) NULL,
    City      NVARCHAR(100) NOT NULL,
    Region    NVARCHAR(100) NULL,
    Postal    NVARCHAR(20)  NOT NULL,
    Country   NVARCHAR(60)  NOT NULL,
    UpdatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_Addresses_UpdatedAt DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.PasswordResets (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PasswordResets PRIMARY KEY,
    UserId    INT NOT NULL CONSTRAINT FK_PasswordResets_Users REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CodeHash  NVARCHAR(255) NOT NULL,                -- bcrypt of the 6-digit code
    ExpiresAt DATETIME2(0)  NOT NULL,
    UsedAt    DATETIME2(0)  NULL,
    Attempts  INT           NOT NULL CONSTRAINT DF_PasswordResets_Attempts DEFAULT 0,
    CreatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_PasswordResets_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_PasswordResets_User ON dbo.PasswordResets(UserId, CreatedAt DESC);

/* ---------- Catalog ---------- */
CREATE TABLE dbo.Products (
    Id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
    Slug           VARCHAR(80)    NOT NULL CONSTRAINT UQ_Products_Slug UNIQUE,  -- used in URLs
    Name           NVARCHAR(120)  NOT NULL,
    Type           VARCHAR(20)    NOT NULL,   -- drawing used by the frontend: jacket, hoodie, tee ...
    Category       VARCHAR(30)    NOT NULL,   -- Outerwear, Tops, Bottoms, Accessories
    Guide          VARCHAR(20)    NOT NULL,   -- size guide: outer, tops, pants, shorts, cap
    Price          DECIMAL(10,2)  NOT NULL CONSTRAINT CK_Products_Price CHECK (Price >= 0),
    CompareAtPrice DECIMAL(10,2)  NULL,       -- original price when on sale
    Description    NVARCHAR(1000) NOT NULL,
    IsLimited      BIT            NOT NULL CONSTRAINT DF_Products_IsLimited DEFAULT 0,
    SortOrder      INT            NOT NULL CONSTRAINT DF_Products_SortOrder DEFAULT 0,
    IsActive       BIT            NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT 1,
    CreatedAt      DATETIME2(0)   NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),  -- NEW badge for 3 days, shop sorts newest first
    CONSTRAINT CK_Products_CompareAt CHECK (CompareAtPrice IS NULL OR CompareAtPrice > Price)
);

-- One row per color + size. Stock lives here.
CREATE TABLE dbo.ProductVariants (
    Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductVariants PRIMARY KEY,
    ProductId  INT NOT NULL CONSTRAINT FK_Variants_Products REFERENCES dbo.Products(Id),
    Color      VARCHAR(30) NOT NULL,
    Size       VARCHAR(20) NOT NULL,
    ColorOrder INT NOT NULL,
    SizeOrder  INT NOT NULL,
    Stock      INT NOT NULL CONSTRAINT CK_Variants_Stock CHECK (Stock >= 0),
    CONSTRAINT UQ_Variants UNIQUE (ProductId, Color, Size)
);

-- Product photos (files in backend/uploads/products)
CREATE TABLE dbo.ProductImages (
    Id        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductImages PRIMARY KEY,
    ProductId INT NOT NULL CONSTRAINT FK_ProductImages_Products REFERENCES dbo.Products(Id),
    Color     VARCHAR(30)  NULL,          -- NULL = shown for every color
    FileName  VARCHAR(80)  NOT NULL,      -- random name inside backend/uploads/products
    SortOrder INT          NOT NULL CONSTRAINT DF_ProductImages_SortOrder DEFAULT 0,  -- lowest = main photo
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductImages_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_ProductImages_Product ON dbo.ProductImages(ProductId, SortOrder);

/* ---------- Orders ---------- */
-- Discount codes (percent off the subtotal)
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


CREATE TABLE dbo.Orders (
    Id               INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
    OrderNo          VARCHAR(20)   NOT NULL CONSTRAINT UQ_Orders_OrderNo UNIQUE,
    UserId           INT           NULL CONSTRAINT FK_Orders_Users REFERENCES dbo.Users(Id),  -- NULL = guest
    Email            NVARCHAR(255) NOT NULL,
    ShipName         NVARCHAR(100) NOT NULL,
    ShipPhone        NVARCHAR(30)  NOT NULL,
    ShipLine1        NVARCHAR(200) NOT NULL,
    ShipLine2        NVARCHAR(200) NULL,
    ShipCity         NVARCHAR(100) NOT NULL,
    ShipRegion       NVARCHAR(100) NULL,
    ShipPostal       NVARCHAR(20)  NOT NULL,
    ShipCountry      NVARCHAR(60)  NOT NULL,
    ShippingMethod   VARCHAR(20)   NOT NULL,
    ShippingFee      DECIMAL(10,2) NOT NULL,
    Subtotal         DECIMAL(10,2) NOT NULL,
    Total            DECIMAL(10,2) NOT NULL,
    PaymentMethod    VARCHAR(10)   NOT NULL CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentMethod IN ('card', 'qr')),
    CardBrand        VARCHAR(20)   NULL,      -- never store the full card number
    CardLast4        CHAR(4)       NULL,
    SlipPath         NVARCHAR(400) NULL,      -- file name inside backend/uploads/slips
    SlipOriginalName NVARCHAR(255) NULL,
    DiscountCodeId   INT           NULL CONSTRAINT FK_Orders_DiscountCodes REFERENCES dbo.DiscountCodes(Id),
    DiscountAmount   DECIMAL(10,2) NOT NULL CONSTRAINT DF_Orders_DiscountAmount DEFAULT 0,
    Status           VARCHAR(20)   NOT NULL,  -- placed, checking_slip, paid, packed, shipped, delivered, cancelled
    CreatedAt        DATETIME2(0)  NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Orders_User ON dbo.Orders(UserId, CreatedAt DESC);
CREATE INDEX IX_Orders_Email ON dbo.Orders(Email);

-- One row per use of a one-per-account code (deleted if the order is cancelled)
CREATE TABLE dbo.DiscountRedemptions (
    DiscountCodeId INT NOT NULL CONSTRAINT FK_Redemptions_Codes REFERENCES dbo.DiscountCodes(Id),
    UserId         INT NOT NULL CONSTRAINT FK_Redemptions_Users REFERENCES dbo.Users(Id),
    OrderId        INT NOT NULL CONSTRAINT FK_Redemptions_Orders REFERENCES dbo.Orders(Id),
    CreatedAt      DATETIME2(0) NOT NULL CONSTRAINT DF_Redemptions_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_DiscountRedemptions PRIMARY KEY (DiscountCodeId, UserId)
);


CREATE TABLE dbo.OrderItems (
    Id             INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderItems PRIMARY KEY,
    OrderId        INT NOT NULL CONSTRAINT FK_OrderItems_Orders REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    VariantId      INT NOT NULL CONSTRAINT FK_OrderItems_Variants REFERENCES dbo.ProductVariants(Id),
    ProductId      INT NOT NULL CONSTRAINT FK_OrderItems_Products REFERENCES dbo.Products(Id),
    ProductName    NVARCHAR(120) NOT NULL,   -- copied at purchase time
    Color          VARCHAR(30)   NOT NULL,
    Size           VARCHAR(20)   NOT NULL,
    UnitPrice      DECIMAL(10,2) NOT NULL,   -- price actually paid
    CompareAtPrice DECIMAL(10,2) NULL,
    Qty            INT NOT NULL CONSTRAINT CK_OrderItems_Qty CHECK (Qty BETWEEN 1 AND 10)
);
CREATE INDEX IX_OrderItems_Order ON dbo.OrderItems(OrderId);

-- Tracking timeline
CREATE TABLE dbo.OrderEvents (
    Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderEvents PRIMARY KEY,
    OrderId    INT NOT NULL CONSTRAINT FK_OrderEvents_Orders REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    Status     VARCHAR(20)   NOT NULL,
    TrackingNo VARCHAR(40)   NULL,
    Note       NVARCHAR(200) NULL,
    ChangedBy  INT           NULL CONSTRAINT FK_OrderEvents_Users REFERENCES dbo.Users(Id),  -- NULL = system (checkout)
    CreatedAt  DATETIME2(0)  NOT NULL CONSTRAINT DF_OrderEvents_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_OrderEvents_Order ON dbo.OrderEvents(OrderId, CreatedAt);

-- Email outbox: saved with the order/status change, sent and retried by the backend
-- "Notify me when it's back" requests
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

CREATE TABLE dbo.EmailOutbox (
    Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmailOutbox PRIMARY KEY,
    OrderId       INT NULL CONSTRAINT FK_EmailOutbox_Orders REFERENCES dbo.Orders(Id) ON DELETE CASCADE,  -- NULL for back_in_stock
    StockAlertId  INT NULL CONSTRAINT FK_EmailOutbox_StockAlerts REFERENCES dbo.StockAlerts(Id),
    Kind          VARCHAR(20)   NOT NULL,   -- confirmation, paid, packed, shipped, delivered, cancelled, back_in_stock
    ToEmail       NVARCHAR(255) NOT NULL,
    Status        VARCHAR(10)   NOT NULL CONSTRAINT DF_EmailOutbox_Status DEFAULT 'pending'
                  CONSTRAINT CK_EmailOutbox_Status CHECK (Status IN ('pending', 'sent', 'preview', 'failed')),
    Attempts      INT           NOT NULL CONSTRAINT DF_EmailOutbox_Attempts DEFAULT 0,
    NextAttemptAt DATETIME2(0)  NOT NULL CONSTRAINT DF_EmailOutbox_Next DEFAULT SYSUTCDATETIME(),
    LastError     NVARCHAR(500) NULL,
    ProviderId    VARCHAR(100)  NULL,       -- id returned by Resend
    CreatedBy     INT           NULL CONSTRAINT FK_EmailOutbox_Users REFERENCES dbo.Users(Id),  -- NULL = system
    CreatedAt     DATETIME2(0)  NOT NULL CONSTRAINT DF_EmailOutbox_CreatedAt DEFAULT SYSUTCDATETIME(),
    SentAt        DATETIME2(0)  NULL
);
CREATE INDEX IX_EmailOutbox_Due ON dbo.EmailOutbox(NextAttemptAt) WHERE Status = 'pending';
CREATE INDEX IX_EmailOutbox_Order ON dbo.EmailOutbox(OrderId, CreatedAt);

-- Admin-editable site settings (JSON values), e.g. promo_bar
CREATE TABLE dbo.SiteSettings (
    [Key]     VARCHAR(50)   NOT NULL CONSTRAINT PK_SiteSettings PRIMARY KEY,
    Value     NVARCHAR(MAX) NOT NULL,   -- JSON, checked by the backend
    UpdatedBy INT           NULL CONSTRAINT FK_SiteSettings_Users REFERENCES dbo.Users(Id),
    UpdatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_SiteSettings_UpdatedAt DEFAULT SYSUTCDATETIME()
);

/* ---------- Reviews & likes ---------- */
CREATE TABLE dbo.Reviews (
    Id         INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Reviews PRIMARY KEY,
    ProductId  INT NOT NULL CONSTRAINT FK_Reviews_Products REFERENCES dbo.Products(Id),
    UserId     INT NULL CONSTRAINT FK_Reviews_Users REFERENCES dbo.Users(Id),  -- NULL for seeded sample reviews
    AuthorName NVARCHAR(100)  NOT NULL,
    Rating     TINYINT        NOT NULL CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    Comment    NVARCHAR(1000) NOT NULL,
    Color      VARCHAR(30)    NULL,
    Size       VARCHAR(20)    NULL,
    CreatedAt  DATETIME2(0)   NOT NULL CONSTRAINT DF_Reviews_CreatedAt DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Reviews_Product ON dbo.Reviews(ProductId, CreatedAt DESC);
-- One review per user per product
CREATE UNIQUE INDEX UX_Reviews_ProductUser ON dbo.Reviews(ProductId, UserId) WHERE UserId IS NOT NULL;

CREATE TABLE dbo.Likes (
    UserId    INT NOT NULL CONSTRAINT FK_Likes_Users REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    ProductId INT NOT NULL CONSTRAINT FK_Likes_Products REFERENCES dbo.Products(Id),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Likes_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Likes PRIMARY KEY (UserId, ProductId)
);
CREATE INDEX IX_Likes_Product ON dbo.Likes(ProductId);
GO
