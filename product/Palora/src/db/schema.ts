import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

// 1. Tenants Table (Multi-Tenancy Root)
export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  gstin: varchar("gstin", { length: 15 }).unique(),
  stateCode: varchar("state_code", { length: 2 }).notNull().default("33"),
  currency: varchar("currency", { length: 3 }).default("INR"),
  settings: jsonb("settings").notNull().default({ default_overhead_pct: 12.0, default_margin_pct: 42.0 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 2. Customers Table (Billing Companies & Clients)
export const customers = pgTable("customers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  customerType: varchar("customer_type", { length: 50 }).notNull().default("RETAIL_BRAND"),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  isWhatsAppSame: boolean("is_whatsapp_same").default(true),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  followUpDate: varchar("follow_up_date", { length: 50 }),
  gstin: varchar("gstin", { length: 30 }),
  billingAddress: text("billing_address").notNull(),
  stateCode: varchar("state_code", { length: 100 }).notNull().default("33"),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("ADVANCE_50"),
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 3. Multi-Site Registry Table
export const sites = pgTable("sites", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  customerId: uuid("customer_id").notNull(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  targetDeliveryDate: varchar("target_delivery_date", { length: 50 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  landmark: varchar("landmark", { length: 255 }),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  placeId: varchar("place_id", { length: 255 }),
  mountingHeightAglFt: numeric("mounting_height_agl_ft", { precision: 5, scale: 2 }),
  wallSubstrate: varchar("wall_substrate", { length: 50 }).notNull().default("CONCRETE"),
  powerPointDistanceM: numeric("power_point_distance_m", { precision: 5, scale: 2 }),
  hasPowerPoint: boolean("has_power_point").default(true),
  services: jsonb("services").default([]),
  serviceDetails: jsonb("service_details").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 4. Enquiries & Intake Screening Table
export const enquiries = pgTable("enquiries", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  source: varchar("source", { length: 50 }).notNull().default("WHATSAPP"),
  stage: varchar("stage", { length: 30 }).notNull().default("NEW"),
  inquiryNote: text("inquiry_note").notNull(),
  hasVectorLogo: boolean("has_vector_logo").default(false),
  wallSubstrate: varchar("wall_substrate", { length: 50 }).default("CONCRETE"),
  mountingHeightFt: numeric("mounting_height_ft", { precision: 5, scale: 2 }),
  hasPowerPoint: boolean("has_power_point").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 5. Suppliers Table (Trade Outwork & Fabrication Vendors)
export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  supplierName: varchar("supplier_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  category: varchar("category", { length: 255 }).notNull().default("General Fabrication"),
  gstin: varchar("gstin", { length: 30 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("ADVANCE"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 6. Products Catalog Table (Signage Items & Templates)
export const products = pgTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).default("Fabricated Signage"),
  description: text("description"),
  width: varchar("width", { length: 50 }),
  height: varchar("height", { length: 50 }),
  unit: varchar("unit", { length: 20 }).default("mm"),
  material: varchar("material", { length: 255 }),
  finishing: varchar("finishing", { length: 255 }),
  application: varchar("application", { length: 50 }).default("Outdoor"),
  productionType: varchar("production_type", { length: 50 }).default("INTERNAL"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 7. Methods Table (Locked System Pricing & Measurement Methods)
export const methods = pgTable("methods", {
  code: varchar("code", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // area, length, quantity, fixed
  sizeUnit: varchar("size_unit", { length: 20 }), // ft, m, null
  rateLabel: varchar("rate_label", { length: 100 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(1),
  isSystem: boolean("is_system").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// 8. Quotations Table (Parent Header)
export const quotations = pgTable("quotations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull(),
  quoteDate: varchar("quote_date", { length: 50 }).notNull(),
  quoteStatus: varchar("quote_status", { length: 50 }).notNull().default("Draft"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).default("0.00"),
  transportCost: numeric("transport_cost", { precision: 15, scale: 2 }).default("0.00"),
  designCharges: numeric("design_charges", { precision: 15, scale: 2 }).default("0.00"),
  installationCharges: numeric("installation_charges", { precision: 15, scale: 2 }).default("0.00"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0.00"),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("18.00"),
  grandTotal: numeric("grand_total", { precision: 15, scale: 2 }).default("0.00"),
  notesJson: jsonb("notes_json").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 9. Quote Lines Table (Line Items with Method Dimensions & Calculations)
export const quoteLines = pgTable("quote_lines", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull(),
  quoteId: varchar("quote_id", { length: 255 }).notNull(),
  siteId: varchar("site_id", { length: 255 }),
  siteName: varchar("site_name", { length: 255 }),
  productTitle: varchar("product_title", { length: 255 }).notNull(),
  materialName: varchar("material_name", { length: 255 }),
  finishName: varchar("finish_name", { length: 255 }),
  methodCode: varchar("method_code", { length: 50 }).notNull(),
  methodName: varchar("method_name", { length: 255 }),
  rateLabel: varchar("rate_label", { length: 100 }),
  width: numeric("width", { precision: 10, scale: 3 }),
  height: numeric("height", { precision: 10, scale: 3 }),
  quantity: integer("quantity").notNull().default(1),
  rate: numeric("rate", { precision: 12, scale: 2 }),
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }).notNull().default("0.00"),
  billableQty: numeric("billable_qty", { precision: 14, scale: 3 }),
  total: numeric("total", { precision: 14, scale: 2 }),
  sortOrder: integer("sort_order").default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
