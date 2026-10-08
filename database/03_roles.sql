/* =====================================================================
   VVRN - 03_roles.sql
   Adds user roles (customer / staff / admin) and records who changed
   each order status. Safe to run on an existing database: it keeps all
   data and skips anything that is already there.
   (01_schema.sql already includes these columns for fresh installs.)
   ===================================================================== */

USE VVRN;
GO

IF COL_LENGTH('dbo.Users', 'Role') IS NULL
BEGIN
    ALTER TABLE dbo.Users ADD Role VARCHAR(10) NOT NULL
        CONSTRAINT DF_Users_Role DEFAULT 'customer'
        CONSTRAINT CK_Users_Role CHECK (Role IN ('customer', 'staff', 'admin'));
END
GO

IF COL_LENGTH('dbo.OrderEvents', 'ChangedBy') IS NULL
BEGIN
    -- NULL = changed by the system (checkout) rather than a staff member
    ALTER TABLE dbo.OrderEvents ADD ChangedBy INT NULL
        CONSTRAINT FK_OrderEvents_Users REFERENCES dbo.Users(Id);
END
GO

/* ---------- Make yourself the first admin ----------
   1. Register an account on the website.
   2. Put its email below and run this line.
   3. Log out and log in again.
   After that, manage other users' roles from the Admin page.

UPDATE dbo.Users SET Role = 'admin' WHERE Email = N'you@example.com';
*/
