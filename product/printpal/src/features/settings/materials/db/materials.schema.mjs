/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The materials table. */
export const MATERIALS_TABLE = `
    CREATE TABLE IF NOT EXISTS materials (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      family VARCHAR(100),
      category VARCHAR(100),
      unit VARCHAR(100),
      variants TEXT,
      thickness VARCHAR(100),
      standard_size VARCHAR(100),
      indoor BOOLEAN DEFAULT TRUE,
      outdoor BOOLEAN DEFAULT TRUE,
      coastal BOOLEAN DEFAULT TRUE,
      coastal_basis VARCHAR(100),
      supplier_name VARCHAR(255),
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
`;
