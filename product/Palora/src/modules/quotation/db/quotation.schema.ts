/**
 * PostgreSQL 16 Quotation Domain Schema & DDL
 */
export const QUOTATION_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS quotations (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  quote_number VARCHAR(50) NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quote_status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  sites_json JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  transport_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  design_charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  installation_charges NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  notes_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotations_tenant_quote_number_uniq UNIQUE (tenant_id, quote_number)
);

CREATE INDEX IF NOT EXISTS idx_quotations_tenant_created ON quotations(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(tenant_id, customer_id);
`;

