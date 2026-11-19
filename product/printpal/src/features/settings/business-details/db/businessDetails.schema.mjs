/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The business_details table. */
export const BUSINESS_DETAILS_TABLE = `
    CREATE TABLE IF NOT EXISTS business_details (
      id VARCHAR(100) PRIMARY KEY DEFAULT 'default-business',
      tenant_id VARCHAR(255) NOT NULL,
      logo_url TEXT DEFAULT '',
      legal_name VARCHAR(255) NOT NULL DEFAULT 'PrintPal',
      address_line1 VARCHAR(255) DEFAULT '',
      address_line2 VARCHAR(255) DEFAULT '',
      city VARCHAR(120) DEFAULT '',
      state VARCHAR(120) DEFAULT '',
      pincode VARCHAR(20) DEFAULT '',
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      gstin VARCHAR(20) DEFAULT '',
      default_tax_id VARCHAR(100) DEFAULT '',
      pan VARCHAR(20) DEFAULT '',
      phone VARCHAR(30) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      website VARCHAR(255) DEFAULT '',
      signatory_name VARCHAR(255) DEFAULT '',
      signature_url TEXT DEFAULT '',
      default_terms TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
