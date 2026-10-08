import sql from "mssql";
import { config } from "./config.js";

export { sql };

let poolPromise: Promise<sql.ConnectionPool> | null = null;

/** Shared connection pool. Created on first use. */
export function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    const { db } = config;
    const pool = new sql.ConnectionPool({
      server: db.server,
      // A named instance (e.g. SQLEXPRESS) is found through SQL Server Browser, so no port.
      port: db.instance ? undefined : db.port ?? 1433,
      database: db.name,
      user: db.user,
      password: db.password,
      options: {
        encrypt: db.encrypt,
        trustServerCertificate: db.trustCert,
        instanceName: db.instance,
      },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
    });
    poolPromise = pool.connect().catch(err => {
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

/** SQL Server error numbers for duplicate keys (unique index / constraint). */
export const isDuplicateKey = (err: unknown) => {
  const n = (err as { number?: number })?.number;
  return n === 2601 || n === 2627;
};

/** "%text%" for a LIKE search, with LIKE wildcards in the user's text escaped. */
export const likePattern = (q: string) => "%" + q.replace(/[[%_]/g, "[$&]") + "%";
