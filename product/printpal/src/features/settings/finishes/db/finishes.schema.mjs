/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The finishes table. */
export const FINISHES_TABLE = `
    CREATE TABLE IF NOT EXISTS finishes (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      type VARCHAR(100),
      works_on TEXT,
      variants TEXT,
      indoor BOOLEAN DEFAULT TRUE,
      outdoor BOOLEAN DEFAULT TRUE,
      coastal VARCHAR(50),
      cost_effect TEXT,
      lead_time_impact TEXT,
      color_code VARCHAR(100),
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
`;
