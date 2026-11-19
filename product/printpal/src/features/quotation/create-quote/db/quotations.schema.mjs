/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The quotations table. */
export const QUOTATIONS_TABLE = `
    CREATE TABLE IF NOT EXISTS quotations (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255) NOT NULL,
      quote_number VARCHAR(50) NOT NULL,
      quote_date VARCHAR(50) NOT NULL,
      quote_status VARCHAR(50) NOT NULL DEFAULT 'Draft',
      subtotal NUMERIC(15, 2) DEFAULT 0.00,
      transport_cost NUMERIC(15, 2) DEFAULT 0.00,
      design_charges NUMERIC(15, 2) DEFAULT 0.00,
      installation_charges NUMERIC(15, 2) DEFAULT 0.00,
      discount_percent NUMERIC(5, 2) DEFAULT 0.00,
      gst_rate NUMERIC(5, 2) DEFAULT 18.00,
      grand_total NUMERIC(15, 2) DEFAULT 0.00,
      notes_json JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

/** The quote_lines table. */
export const QUOTE_LINES_TABLE = `
    CREATE TABLE IF NOT EXISTS quote_lines (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      quote_id VARCHAR(255) NOT NULL,
      site_id VARCHAR(255),
      site_name VARCHAR(255),
      product_title VARCHAR(255) NOT NULL,
      material_name VARCHAR(255),
      finish_name VARCHAR(255),
      method_code VARCHAR(50) NOT NULL,
      method_name VARCHAR(255),
      rate_label VARCHAR(100),
      width NUMERIC(10, 3),
      height NUMERIC(10, 3),
      quantity INTEGER NOT NULL DEFAULT 1,
      rate NUMERIC(12, 2),
      discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
      billable_qty NUMERIC(14, 3),
      total NUMERIC(14, 2),
      sort_order INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
