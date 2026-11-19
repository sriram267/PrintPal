/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The products table. */
export const PRODUCTS_TABLE = `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      category VARCHAR(255) DEFAULT 'Fabricated Signage',
      description TEXT,
      priced_per VARCHAR(100) DEFAULT 'Per letter',
      also_priced_by VARCHAR(255),
      size_range VARCHAR(255),
      lighting VARCHAR(100),
      needs_installation VARCHAR(100),
      lead_time VARCHAR(100),
      material_ids JSONB DEFAULT '[]',
      finish_ids JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT TRUE,
      width VARCHAR(50),
      height VARCHAR(50),
      unit VARCHAR(20) DEFAULT 'mm',
      material VARCHAR(255),
      finishing VARCHAR(255),
      application VARCHAR(50) DEFAULT 'Outdoor',
      production_type VARCHAR(50) DEFAULT 'INTERNAL',
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
`;
