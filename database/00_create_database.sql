/* =====================================================================
   VVRN - 00_create_database.sql
   Run once in SSMS while connected as an administrator (e.g. sa or your
   Windows account). Creates the database and a SQL login for the backend.

   BEFORE RUNNING
   1. The Node.js driver (mssql/tedious) signs in with a SQL Server login,
      not Windows Authentication. Turn on "SQL Server and Windows
      Authentication mode":
        SSMS > right-click the server > Properties > Security
        > choose "SQL Server and Windows Authentication mode" > OK,
        then restart the SQL Server service.
   2. Make sure TCP/IP is enabled:
        SQL Server Configuration Manager > SQL Server Network Configuration
        > Protocols for <instance> > TCP/IP > Enabled, then restart.
   3. Change the password below, and put the same one in backend/.env.
   ===================================================================== */

IF DB_ID(N'VVRN') IS NULL
    CREATE DATABASE VVRN;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'vvrn_app')
    CREATE LOGIN vvrn_app WITH PASSWORD = N'ChangeMe_Str0ng!Pass', CHECK_POLICY = ON;
GO

USE VVRN;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'vvrn_app')
    CREATE USER vvrn_app FOR LOGIN vvrn_app;
GO

-- The app only needs to read and write data, not change the schema.
ALTER ROLE db_datareader ADD MEMBER vvrn_app;
ALTER ROLE db_datawriter ADD MEMBER vvrn_app;
GO
