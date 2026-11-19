/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The tenants table. */
export const TENANTS_TABLE = `
    CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(255) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      trade_name VARCHAR(255),
      gstin VARCHAR(15) UNIQUE,
      state_code VARCHAR(2) NOT NULL DEFAULT '33',
      currency VARCHAR(3) DEFAULT 'INR',
      settings JSONB NOT NULL DEFAULT '{"default_overhead_pct": 12.0, "default_margin_pct": 42.0}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
