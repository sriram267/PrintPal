/**
 * PostgreSQL 16 Enquiry & Inbound Leads DDL
 */
export const ENQUIRY_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS enquiries (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  inquiry_note TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'NEW',
  source VARCHAR(100) DEFAULT 'DIRECT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

