/*
 * Runs database work for ONE shop (tenant), safely.
 *
 * Every call gets its own transaction on its own connection. Inside it:
 *   1. it switches to the restricted `app_user` role (when the database allows it), so the database's row rules
 *      apply: a shop can only see and change rows that carry its own tenant_id;
 *   2. it sets the shop for THIS transaction only (set_config(..., true)), so the setting can never leak into
 *      another request that later reuses the same connection.
 *
 * prepareRowRules(db) runs once at start-up and decides whether step 1 is possible. Even without step 1, shops stay
 * apart: every query filters by tenant_id and every save refuses to overwrite a row that belongs to another shop.
 */
import { assertTenantId } from "./tenantContext.mjs";

export const RESTRICTED_ROLE = "app_user";

/** The shop tables the row rules protect. app_user must be able to use every one of them. */
const SHOP_TABLES = [
  "customers", "sites", "enquiries", "suppliers", "products",
  "materials", "finishes", "quotations", "quote_lines", "business_details",
];

/** Databases where switching to app_user works (set by prepareRowRules). */
const rowRulesOn = new WeakSet();

/** Runs fn(tx) inside one transaction. Works with the Neon pool (pg) and with PGlite. */
async function inTransaction(db, fn) {
  if (db.pool) {
    const client = await db.pool.connect();
    let result;
    try {
      await client.query("BEGIN");
      result = await fn(client);
      await client.query("COMMIT");
    } catch (err) {
      let broken = false;
      try {
        await client.query("ROLLBACK");
      } catch {
        broken = true;
      }
      client.release(broken); // a broken connection is closed instead of going back to the pool
      throw err;
    }
    client.release();
    return result;
  }
  if (typeof db.transaction === "function") return db.transaction(fn); // PGlite
  throw new Error("This database connection can't run transactions.");
}

/**
 * Turns the database's row rules on for this database, if it allows it. Call once after the tables exist.
 * @returns {Promise<boolean>} true when every shop's queries will run as app_user
 */
export async function prepareRowRules(db) {
  // The full check: app_user holds every permission it needs on every shop table, this login may switch to it,
  // and as app_user each table can really be read (no shop is set, so no rows come back).
  const tablesSql = SHOP_TABLES.map((t) => `('${t}')`).join(", ");
  const canUse = () =>
    inTransaction(db, async (tx) => {
      const { rows } = await tx.query(
        `SELECT bool_and(
           has_table_privilege('${RESTRICTED_ROLE}', t, 'SELECT') AND has_table_privilege('${RESTRICTED_ROLE}', t, 'INSERT')
           AND has_table_privilege('${RESTRICTED_ROLE}', t, 'UPDATE') AND has_table_privilege('${RESTRICTED_ROLE}', t, 'DELETE')
         ) AS ok FROM (VALUES ${tablesSql}) AS v(t)`
      );
      if (!rows[0]?.ok) throw new Error(`${RESTRICTED_ROLE} is missing table permissions`);
      await tx.query(`SET LOCAL ROLE ${RESTRICTED_ROLE}`);
      for (const t of SHOP_TABLES) await tx.query(`SELECT 1 FROM ${t} LIMIT 1`);
    }).then(
      () => true,
      () => false
    );

  if (!(await canUse())) {
    // app_user is created at start-up by this same database login, which may still need permission to switch to it.
    // schema.mjs also grants app_user its table permissions, unless an earlier start-up step failed: repair both.
    for (const sql of [
      `GRANT ${RESTRICTED_ROLE} TO CURRENT_USER`,
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ${SHOP_TABLES.join(", ")} TO ${RESTRICTED_ROLE}`,
    ]) {
      try {
        await db.query(sql);
      } catch {}
    }
  }
  if (await canUse()) {
    rowRulesOn.add(db);
    return true;
  }
  rowRulesOn.delete(db); // safe fallback: the app's own checks still keep shops apart
  return false;
}

/** True when this database runs each shop's queries as app_user. */
export function rowRulesActive(db) {
  return rowRulesOn.has(db);
}

/**
 * Runs fn(tx) for one shop: in its own transaction, as app_user when possible, with the shop set for this
 * transaction only. Use tx.query(...) for every query inside fn.
 */
export async function withTenant(db, tenantId, fn) {
  const shop = assertTenantId(tenantId);
  return inTransaction(db, async (tx) => {
    if (rowRulesOn.has(db)) await tx.query(`SET LOCAL ROLE ${RESTRICTED_ROLE}`);
    await tx.query("SELECT set_config('app.current_tenant_id', $1, true)", [shop]);
    return fn(tx);
  });
}

/** The error a save throws when its id belongs to another shop. The API answers 409. */
export function recordNotYours() {
  const err = new Error("This record couldn't be saved. Refresh the page and try again.");
  err.statusCode = 409;
  err.code = "RECORD_NOT_YOURS";
  return err;
}

/** True when the database refused a write because the row belongs to another shop. */
export function isRowRuleRefusal(err) {
  return /row-level security/i.test(err?.message || "");
}

/**
 * Every save is "insert, or update the row with this id ... WHERE it belongs to this shop ... RETURNING id".
 * No row back means the id belongs to another shop: refuse instead of touching it.
 */
export function assertSaved(result) {
  if (!result?.rows?.length) throw recordNotYours();
  return result;
}
