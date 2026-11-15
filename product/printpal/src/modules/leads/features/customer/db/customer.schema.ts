/**
 * PostgreSQL 16 Customer DDL
 */
export const CUSTOMER_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  customer_type VARCHAR(50) NOT NULL DEFAULT 'RETAIL_BRAND',
  contact_person VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  is_whatsapp_same BOOLEAN DEFAULT TRUE,
  whatsapp_number VARCHAR(20),
  follow_up_date VARCHAR(50),
  gstin VARCHAR(30),
  billing_address TEXT NOT NULL,
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_pincode VARCHAR(20),
  is_shipping_same_as_billing BOOLEAN DEFAULT TRUE,
  shipping_address TEXT,
  state_code VARCHAR(2) NOT NULL DEFAULT '33',
  payment_terms VARCHAR(50) NOT NULL DEFAULT 'ADVANCE_50',
  sites_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

