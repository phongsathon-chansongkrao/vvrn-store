/* =====================================================================
   VVRN - 04_email_outbox.sql
   Email outbox: every customer email is first saved here, in the same
   transaction as the order / status change, then sent by the backend.
   Failed sends are retried automatically. Safe to run on an existing
   database: keeps all data and skips anything already there.
   (01_schema.sql already includes this table for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF OBJECT_ID('dbo.EmailOutbox', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmailOutbox (
        Id            INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmailOutbox PRIMARY KEY,
        OrderId       INT NOT NULL CONSTRAINT FK_EmailOutbox_Orders REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
        Kind          VARCHAR(20)   NOT NULL,   -- confirmation, paid, packed, shipped, delivered, cancelled
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
END
GO
