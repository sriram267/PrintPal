/* The database connection: Neon (Postgres) when DATABASE_URL is set, otherwise a local PGlite folder.
   Moved from server/server.mjs (A2). */
import "./env.mjs";
import { PGlite } from "@electric-sql/pglite";
import pgPkg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const { Pool } = pgPkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Initialize PostgreSQL Database (Neon in Cloud, PGlite for offline fallback)
export let pg;
if (process.env.DATABASE_URL) {
  console.log("[DB] Connecting to Neon PostgreSQL 16 via DATABASE_URL...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  pg = {
    async query(text, params) {
      return pool.query(text, params);
    },
    async exec(text) {
      return pool.query(text);
    },
    pool,
  };
} else {
  // PGLITE_DIR (optional) points a local run at a throwaway folder; by default the same data/pgdata as before.
  const DATA_DIR = process.env.PGLITE_DIR ? path.resolve(process.env.PGLITE_DIR) : path.resolve(__dirname, "../../../data/pgdata");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    pg = new PGlite(DATA_DIR);
    await pg.waitReady;
  } catch (err) {
    console.warn("[DB] Auto-recovering PGlite instance from ungraceful shutdown:", err.message);
    try {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
    pg = new PGlite(DATA_DIR);
    await pg.waitReady;
  }
}
