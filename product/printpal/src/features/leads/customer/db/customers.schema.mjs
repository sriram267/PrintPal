/* Table definitions. Created at start-up by src/shared/server/schema.mjs, in a fixed order. Moved unchanged from server/server.mjs (A2). */

/** The customers table. */
export const CUSTOMERS_TABLE = `
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
      shipping_address TEXT,
      is_shipping_same BOOLEAN DEFAULT TRUE,
      state_code VARCHAR(100) NOT NULL DEFAULT '33',
      payment_terms VARCHAR(50) DEFAULT 'ADVANCE_50',
      credit_limit NUMERIC(12, 2) DEFAULT 0.00,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );
`;

/** The sites table. */
export const SITES_TABLE = `
    CREATE TABLE IF NOT EXISTS sites (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255) NOT NULL,
      site_name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      target_delivery_date VARCHAR(50),
      contact_person VARCHAR(255),
      contact_phone VARCHAR(50),
      landmark VARCHAR(255),
      lat NUMERIC(10, 7),
      lng NUMERIC(10, 7),
      place_id VARCHAR(255),
      mounting_height_agl_ft NUMERIC(5, 2),
      wall_substrate VARCHAR(50) NOT NULL DEFAULT 'CONCRETE',
      power_point_distance_m NUMERIC(5, 2),
      has_power_point BOOLEAN DEFAULT TRUE,
      services JSONB DEFAULT '[]',
      service_details JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;
