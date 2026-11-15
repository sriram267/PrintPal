/**
 * PostgreSQL 16 Supplier & Vendor DDL
 */
export const SUPPLIER_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  is_whatsapp_same BOOLEAN DEFAULT TRUE,
  whatsapp_number VARCHAR(20),
  category VARCHAR(100) NOT NULL,
  gstin VARCHAR(30),
  payment_terms VARCHAR(50) DEFAULT 'NET_30',
  address TEXT NOT NULL,
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  pincode VARCHAR(20) DEFAULT '600051',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

