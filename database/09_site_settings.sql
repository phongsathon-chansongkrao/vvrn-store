/* =====================================================================
   VVRN - 09_site_settings.sql
   Small key/value settings the admin can change from the website.
   First one: the scrolling promo bar at the top of every page.
   Safe to run on an existing database.
   (01_schema.sql + 02_seed.sql already include this for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF OBJECT_ID('dbo.SiteSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SiteSettings (
        [Key]     VARCHAR(50)   NOT NULL CONSTRAINT PK_SiteSettings PRIMARY KEY,
        Value     NVARCHAR(MAX) NOT NULL,   -- JSON, checked by the backend
        UpdatedBy INT           NULL CONSTRAINT FK_SiteSettings_Users REFERENCES dbo.Users(Id),
        UpdatedAt DATETIME2(0)  NOT NULL CONSTRAINT DF_SiteSettings_UpdatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

-- Same text the bar showed before it became editable
IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = 'promo_bar')
    INSERT INTO dbo.SiteSettings ([Key], Value)
    VALUES ('promo_bar', N'{"enabled":true,"messages":["SS25 Drop 001","Limited to 200 units","Free worldwide shipping"]}');
GO
