/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The enquiries table. */
export const ENQUIRIES_TABLE = `
    CREATE TABLE IF NOT EXISTS enquiries (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      address TEXT,
      source VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP',
      stage VARCHAR(30) NOT NULL DEFAULT 'NEW',
      inquiry_note TEXT NOT NULL,
      has_vector_logo BOOLEAN DEFAULT FALSE,
      wall_substrate VARCHAR(50) DEFAULT 'CONCRETE',
      mounting_height_ft NUMERIC(5, 2),
      has_power_point BOOLEAN DEFAULT FALSE,
      follow_up_date VARCHAR(50),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
