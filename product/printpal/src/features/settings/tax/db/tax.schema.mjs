/**
 * PostgreSQL 16 Statutory Tax Settings Schema
 */
export const TAX_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tax_slabs (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  slab_name VARCHAR(100) NOT NULL,
  cgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
  sgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 9.00,
  igst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

