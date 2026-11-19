/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The methods table. */
export const METHODS_TABLE = `
    CREATE TABLE IF NOT EXISTS methods (
      code VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      size_unit VARCHAR(20),
      rate_label VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 1,
      is_system BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
