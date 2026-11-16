import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { verifyToken } from "@clerk/backend";
import { PGlite } from "@electric-sql/pglite";
import pgPkg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { calcLine, SYSTEM_METHODS, METHOD_MAP, roundHalfUp } from "./calcLine.mjs";
import { resolveTenantId, SYSTEM_TEMPLATE_TENANT_ID, DEFAULT_TENANT_ID } from "./tenantContext.mjs";
import { createTenantRepository } from "./repository.mjs";
import { copyCatalogueForTenant } from "./catalogueCopy.mjs";

const { Pool } = pgPkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present (native in Node.js 20.6+)
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(path.resolve(__dirname, "../.env"));
  } catch {}
}

// 1. Initialize PostgreSQL Database (Neon in Cloud, PGlite for offline fallback)
export let pg;
if (process.env.DATABASE_URL) {
  console.log("[DB] Connecting to Neon PostgreSQL 16 via DATABASE_URL...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  pg = {
    async query(text, params) {
      return pool.query(text, params);
    },
    async exec(text) {
      return pool.query(text);
    },
    pool,
  };
} else {
  const DATA_DIR = path.resolve(__dirname, "../data/pgdata");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    pg = new PGlite(DATA_DIR);
    await pg.waitReady;
  } catch (err) {
    console.warn("[DB] Auto-recovering PGlite instance from ungraceful shutdown:", err.message);
    try {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
    pg = new PGlite(DATA_DIR);
    await pg.waitReady;
  }
}

// 2. Initialize PostgreSQL 16 Multi-Tenant Schema and Migrations
async function initDatabase() {
  console.log("[DB] Initializing PostgreSQL 16 multi-tenant schema...");

  // Core system registry table
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(255) PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      trade_name VARCHAR(255),
      gstin VARCHAR(15) UNIQUE,
      state_code VARCHAR(2) NOT NULL DEFAULT '33',
      currency VARCHAR(3) DEFAULT 'INR',
      settings JSONB NOT NULL DEFAULT '{"default_overhead_pct": 12.0, "default_margin_pct": 42.0}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE TABLE IF NOT EXISTS suppliers (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      supplier_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255),
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      category VARCHAR(255) NOT NULL DEFAULT 'General Fabrication',
      gstin VARCHAR(30),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      payment_terms VARCHAR(50) DEFAULT 'ADVANCE',
      notes TEXT,
      is_whatsapp_same BOOLEAN DEFAULT TRUE,
      whatsapp_number VARCHAR(20),
      serving_regions TEXT,
      is_billing_same_as_warehouse BOOLEAN DEFAULT TRUE,
      billing_address TEXT,
      delivery_lead_time VARCHAR(100),
      min_order_qty VARCHAR(100),
      is_shipping_same_as_billing BOOLEAN DEFAULT TRUE,
      shipping_address TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      billing_address_line1 TEXT,
      billing_address_line2 TEXT,
      billing_city VARCHAR(100),
      billing_state VARCHAR(100),
      billing_pincode VARCHAR(20),
      shipping_address_line1 TEXT,
      shipping_address_line2 TEXT,
      shipping_city VARCHAR(100),
      shipping_state VARCHAR(100),
      shipping_pincode VARCHAR(20),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS materials (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      family VARCHAR(100),
      category VARCHAR(100),
      unit VARCHAR(100),
      variants TEXT,
      thickness VARCHAR(100),
      standard_size VARCHAR(100),
      indoor BOOLEAN DEFAULT TRUE,
      outdoor BOOLEAN DEFAULT TRUE,
      coastal BOOLEAN DEFAULT TRUE,
      coastal_basis VARCHAR(100),
      supplier_name VARCHAR(255),
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS finishes (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      type VARCHAR(100),
      works_on TEXT,
      variants TEXT,
      indoor BOOLEAN DEFAULT TRUE,
      outdoor BOOLEAN DEFAULT TRUE,
      coastal VARCHAR(50),
      cost_effect TEXT,
      lead_time_impact TEXT,
      color_code VARCHAR(100),
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      tenant_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      also_called VARCHAR(255),
      category VARCHAR(255) DEFAULT 'Fabricated Signage',
      description TEXT,
      priced_per VARCHAR(100) DEFAULT 'Per letter',
      also_priced_by VARCHAR(255),
      size_range VARCHAR(255),
      lighting VARCHAR(100),
      needs_installation VARCHAR(100),
      lead_time VARCHAR(100),
      material_ids JSONB DEFAULT '[]',
      finish_ids JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT TRUE,
      width VARCHAR(50),
      height VARCHAR(50),
      unit VARCHAR(20) DEFAULT 'mm',
      material VARCHAR(255),
      finishing VARCHAR(255),
      application VARCHAR(50) DEFAULT 'Outdoor',
      production_type VARCHAR(50) DEFAULT 'INTERNAL',
      research_confidence VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS methods (
      code VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      size_unit VARCHAR(20),
      rate_label VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 1,
      is_system BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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
  `);

  // 2.1 Multi-Tenant Phase 2 Migration Execution
  try {
    // A. Migrate tenants.id to VARCHAR(255)
    await pg.query("ALTER TABLE tenants ALTER COLUMN id TYPE VARCHAR(255) USING id::text;");

    // Insert structural placeholder tenant for pre-migration data
    // PENDING FOLLOW-UP: 'org_legacy_default' is a structural placeholder representing data that existed
    // before multi-tenancy was introduced. Rows under 'org_legacy_default' will need to be re-pointed
    // to a real Clerk organization ID once one exists.
    await pg.query(`
      INSERT INTO tenants (id, company_name, trade_name, state_code)
      VALUES ('org_legacy_default', 'PrintPal Engineering', 'PrintPal', '33')
      ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name;
    `);

    // B. Migrate tenant_id on all 9 tenant-owned tables
    const tenantTables = [
      "customers",
      "sites",
      "enquiries",
      "suppliers",
      "products",
      "materials",
      "finishes",
      "quotations",
      "business_details",
    ];

    for (const t of tenantTables) {
      try {
        await pg.query(`ALTER TABLE "${t}" ALTER COLUMN tenant_id TYPE VARCHAR(255) USING tenant_id::text;`);
      } catch (err) {
        // already converted or policy attached
      }
      try {
        await pg.query(`
          UPDATE "${t}"
          SET tenant_id = 'org_legacy_default'
          WHERE tenant_id IS NULL OR tenant_id = '00000000-0000-0000-0000-000000000001';
        `);
      } catch (err) {}
      try {
        await pg.query(`ALTER TABLE "${t}" ALTER COLUMN tenant_id SET NOT NULL;`);
      } catch (err) {}
    }

    // C. Migrate quote_lines tenant_id & enquiries follow_up_date
    try {
      await pg.query("ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255);");
    } catch (err) {}
    try {
      await pg.query("ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS follow_up_date VARCHAR(50);");
    } catch (err) {}
    try {
      await pg.query(`
        UPDATE quote_lines ql
        SET tenant_id = q.tenant_id
        FROM quotations q
        WHERE ql.quote_id = q.id AND ql.tenant_id IS NULL;
      `);
      await pg.query(`
        UPDATE quote_lines
        SET tenant_id = 'org_legacy_default'
        WHERE tenant_id IS NULL;
      `);
      await pg.query("ALTER TABLE quote_lines ALTER COLUMN tenant_id SET NOT NULL;");
    } catch (err) {}

    // D. Drop global unique on quotations and create composite (tenant_id, quote_number)
    await pg.query("ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_quote_number_key;");
    await pg.query("DROP INDEX IF EXISTS quotations_quote_number_key;");
    await pg.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'quotations_tenant_quote_number_uniq'
        ) THEN
          ALTER TABLE quotations ADD CONSTRAINT quotations_tenant_quote_number_uniq UNIQUE (tenant_id, quote_number);
        END IF;
      END $$;
    `);

    // E. Composite leading indexes for fast tenant-scoped queries
    await pg.query("CREATE INDEX IF NOT EXISTS idx_customers_tenant_created ON customers(tenant_id, created_at DESC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_sites_tenant_customer ON sites(tenant_id, customer_id);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_enquiries_tenant_created ON enquiries(tenant_id, created_at DESC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_created ON suppliers(tenant_id, created_at DESC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_products_tenant_active_id ON products(tenant_id, is_active, id ASC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_materials_tenant_id ON materials(tenant_id, id ASC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_finishes_tenant_id ON finishes(tenant_id, id ASC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_quotations_tenant_created ON quotations(tenant_id, created_at DESC);");
    await pg.query("CREATE INDEX IF NOT EXISTS idx_quote_lines_tenant_quote ON quote_lines(tenant_id, quote_id, sort_order ASC);");
    await pg.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_business_details_tenant_id ON business_details(tenant_id);");

    // F. Enable & Force Row-Level Security on all 10 tenant-owned tables
    const allTenantTables = [...tenantTables, "quote_lines"];
    for (const t of allTenantTables) {
      await pg.query(`ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`);
      await pg.query(`ALTER TABLE "${t}" FORCE ROW LEVEL SECURITY;`);
      await pg.query(`DROP POLICY IF EXISTS tenant_isolation_policy ON "${t}";`);
      await pg.query(`
        CREATE POLICY tenant_isolation_policy ON "${t}"
          FOR ALL
          USING (tenant_id = current_setting('app.current_tenant_id', true))
          WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));
      `);
    }

    // G. Non-superuser role for RLS isolation
    await pg.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
          CREATE ROLE app_user WITH LOGIN NOSUPERUSER NOBYPASSRLS;
        END IF;
      END $$;
    `);
    await pg.query("GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;");
    await pg.query("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user;");

    // Seed 6 locked reference methods
    for (const m of SYSTEM_METHODS) {
      await pg.query(
        `INSERT INTO methods (code, name, type, size_unit, rate_label, sort_order, is_system)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           type = EXCLUDED.type,
           size_unit = EXCLUDED.size_unit,
           rate_label = EXCLUDED.rate_label,
           sort_order = EXCLUDED.sort_order,
           is_system = TRUE;`,
        [m.code, m.name, m.type, m.size_unit, m.rate_label, m.sort_order, true]
      );
    }
  } catch (migErr) {
    console.warn("[DB Migration Notice]:", migErr.message);
  }

  // Seed baseline pilot catalogue under DEFAULT_TENANT_ID
  await seedDatabaseFromCatalogue();

  console.log("[DB] PostgreSQL 16 multi-tenant schema ready.");
}

async function seedDatabaseFromCatalogue() {
  try {
    const seedPath = path.resolve(__dirname, "seedData.json");
    if (!fs.existsSync(seedPath)) {
      console.warn("[DB Seed] seedData.json not found at:", seedPath);
      return;
    }
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

    // Purge legacy mock IDs so only clean catalogue IDs remain
    await pg.query("DELETE FROM products WHERE id LIKE 'prod-%'");
    await pg.query("DELETE FROM materials WHERE id LIKE 'mat-%'");
    await pg.query("DELETE FROM finishes WHERE id LIKE 'fin-%'");

    const pr01Res = await pg.query(
      "SELECT COUNT(*) AS count FROM products WHERE id = 'PR01' AND tenant_id = $1 AND deleted_at IS NULL",
      [DEFAULT_TENANT_ID]
    );
    const hasPilotCatalogue = Number(pr01Res.rows[0]?.count || 0) > 0;

    const matCheck = await pg.query(
      "SELECT COUNT(*) AS count FROM materials WHERE tenant_id = $1 AND deleted_at IS NULL",
      [DEFAULT_TENANT_ID]
    );
    const matCount = Number(matCheck.rows[0]?.count || 0);

    const finCheck = await pg.query(
      "SELECT COUNT(*) AS count FROM finishes WHERE tenant_id = $1 AND deleted_at IS NULL",
      [DEFAULT_TENANT_ID]
    );
    const finCount = Number(finCheck.rows[0]?.count || 0);

    console.log(`[DB Seed] Ingesting pilot catalogue for ${DEFAULT_TENANT_ID} (PR01 exists: ${hasPilotCatalogue}, mats: ${matCount}, fins: ${finCount})...`);

    for (const mat of seedData.materials) {
      await pg.query(
        `INSERT INTO materials (
          id, tenant_id, name, also_called, family, category, unit, variants,
          thickness, standard_size, indoor, outdoor, coastal, coastal_basis,
          supplier_name, research_confidence, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          also_called = EXCLUDED.also_called,
          family = EXCLUDED.family,
          category = EXCLUDED.category,
          unit = EXCLUDED.unit,
          variants = EXCLUDED.variants,
          indoor = EXCLUDED.indoor,
          outdoor = EXCLUDED.outdoor,
          coastal = EXCLUDED.coastal,
          coastal_basis = EXCLUDED.coastal_basis,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes;`,
        [
          mat.id, DEFAULT_TENANT_ID, mat.name, mat.alsoCalled, mat.family, mat.category, mat.unit, mat.variants,
          (mat.variants || "").split(".")[0] || "", "8 x 4 ft standard",
          mat.indoor ?? true, mat.outdoor ?? true, mat.coastal ?? true, mat.coastalBasis || "Standard basis",
          mat.supplierName || "Direct / Local Distributor", mat.researchConfidence || "High", mat.notes || ""
        ]
      );
    }

    for (const fin of seedData.finishes) {
      await pg.query(
        `INSERT INTO finishes (
          id, tenant_id, name, also_called, type, works_on, variants,
          indoor, outdoor, coastal, cost_effect, lead_time_impact,
          color_code, research_confidence, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          also_called = EXCLUDED.also_called,
          type = EXCLUDED.type,
          works_on = EXCLUDED.works_on,
          variants = EXCLUDED.variants,
          indoor = EXCLUDED.indoor,
          outdoor = EXCLUDED.outdoor,
          coastal = EXCLUDED.coastal,
          cost_effect = EXCLUDED.cost_effect,
          lead_time_impact = EXCLUDED.lead_time_impact,
          color_code = EXCLUDED.color_code,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes;`,
        [
          fin.id, DEFAULT_TENANT_ID, fin.name, fin.alsoCalled, fin.type, fin.worksOn, fin.variants,
          fin.indoor ?? true, fin.outdoor ?? true, fin.coastal || "Moderate",
          fin.costEffect || "Standard", fin.leadTimeImpact || "Standard",
          fin.colorCode || "#000000", fin.researchConfidence || "High", fin.notes || ""
        ]
      );
    }

    for (const prod of seedData.products) {
      await pg.query(
        `INSERT INTO products (
          id, tenant_id, title, also_called, category, description,
          priced_per, also_priced_by, size_range, lighting,
          needs_installation, lead_time, material_ids, finish_ids,
          is_active, width, height, unit, material, finishing,
          application, production_type, research_confidence, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          also_called = EXCLUDED.also_called,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          priced_per = EXCLUDED.priced_per,
          also_priced_by = EXCLUDED.also_priced_by,
          size_range = EXCLUDED.size_range,
          lighting = EXCLUDED.lighting,
          needs_installation = EXCLUDED.needs_installation,
          lead_time = EXCLUDED.lead_time,
          material_ids = EXCLUDED.material_ids,
          finish_ids = EXCLUDED.finish_ids,
          is_active = EXCLUDED.is_active,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes;`,
        [
          prod.id, DEFAULT_TENANT_ID, prod.title, prod.alsoCalled, prod.category, prod.description,
          prod.pricedPer || "Per letter", prod.alsoPricedBy || "Per sq ft", prod.sizeRange || "12 - 48 in",
          prod.lighting || "Backlit LED", prod.needsInstallation || "Recommended", prod.leadTime || "5-7 days",
          JSON.stringify(prod.materialIds || []), JSON.stringify(prod.finishIds || []), true,
          "1200", "300", "mm", prod.category || "Fabricated Signage", "Standard Finish",
          "Outdoor", "INTERNAL", prod.researchConfidence || "High", prod.notes || ""
        ]
      );
    }
  } catch (err) {
    console.error("[DB Seed Error]:", err.message);
  }
}

// 3. Fastify HTTP Server Setup
export const server = Fastify({ logger: false });

// 3a. Restricted CORS (Defense in depth against arbitrary origin exploits)
const ALLOWED_ORIGINS = [
  "https://printpal-app.pages.dev",
  "https://printpal.com",
  "https://printpal.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
];

await server.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser requests (server health checks, curl without origin)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: Origin ${origin} not permitted`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// 3b. Global Rate Limiter
await server.register(rateLimit, {
  max: 300,
  timeWindow: "1 minute",
});

// Handle empty JSON bodies gracefully without crashing
server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (req, body, defaultDone) {
    if (!body || !body.trim()) {
      defaultDone(null, {});
      return;
    }
    try {
      defaultDone(null, JSON.parse(body));
    } catch (err) {
      err.statusCode = 400;
      defaultDone(err, undefined);
    }
  }
);

// 3c. Public Routes Allowlist
// (No waitlist route: the waitlist lives ONLY in Clerk. The website and the login page use Clerk's <Waitlist />.)
const PUBLIC_ROUTES = new Set([
  "GET:/api/health",
]);

// Must come from the environment (Render env var / local .env). Never hard-code a secret here.
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set. Add it to the environment (or to .env for local development).");
}

// 3d. Mandatory Clerk Authentication & Tenant Resolution Hook
server.addHook("onRequest", async (req, reply) => {
  // Allow CORS preflights through
  if (req.method === "OPTIONS") return;

  const routeKey = `${req.method}:${req.url.split("?")[0]}`;
  if (PUBLIC_ROUTES.has(routeKey)) {
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Authentication required: Missing Bearer token." });
  }

  const token = authHeader.slice(7).trim();
  try {
    const verified = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    req.auth = {
      userId: verified.sub,
      orgId: verified.org_id || null,
      orgRole: verified.org_role || null,
      claims: verified,
    };
    // Tenant is cryptographically derived from verified JWT
    req.tenantId = resolveTenantId(req);
  } catch (err) {
    return reply.status(401).send({ error: "Authentication failed: Invalid or expired session token." });
  }
});

// Tenant-Scoped Data Access Repository
const repo = createTenantRepository(pg);

// ── HEALTH CHECK ──
server.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// ── CLERK AUTH / TENANT SYNC (Authenticated & Server-Side Verified) ──
server.post("/api/auth/sync-user", async (req, reply) => {
  // Identity is extracted strictly from the cryptographically verified JWT
  const userId = req.auth?.userId;
  if (!userId) {
    reply.status(401);
    return { error: "Unauthorized: Missing verified user session." };
  }

  const tenantId = req.tenantId; // Derived securely from req.auth
  const { email = "", fullName = "" } = req.body || {};
  const companyName = fullName ? `${fullName}'s Workshop` : "PrintPal Workshop";

  try {
    // 1. Ensure tenant exists
    await pg.query(
      `INSERT INTO tenants (id, company_name, trade_name, state_code, currency)
       VALUES ($1, $2, $3, '33', 'INR')
       ON CONFLICT (id) DO UPDATE SET
         company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), tenants.company_name),
         updated_at = NOW();`,
      [tenantId, companyName, "PrintPal Workshop"]
    );

    // 2. Ensure business details exists
    const busId = `bus_${tenantId}`;
    await pg.query(
      `INSERT INTO business_details (id, tenant_id, legal_name, email)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         email = COALESCE(NULLIF(EXCLUDED.email, ''), business_details.email);`,
      [busId, tenantId, companyName, email]
    );

    // 3. Seed baseline catalogue for this new tenant if not yet seeded
    const prodCount = await pg.query(
      `SELECT COUNT(*) FROM products WHERE tenant_id = $1;`,
      [tenantId]
    );
    if (parseInt(prodCount.rows[0].count, 10) === 0) {
      console.log(`[Auth Sync] Seeding baseline catalogue for new tenant ${tenantId}...`);
      await copyCatalogueForTenant(pg, tenantId, SYSTEM_TEMPLATE_TENANT_ID, { force: false });
    }

    return { success: true, tenantId };
  } catch (err) {
    console.error("[Auth Sync Error]:", err);
    reply.status(500);
    return { error: err.message };
  }
});

// ── CUSTOMERS ENDPOINTS ──

server.get("/api/customers", async (req) => {
  return await repo.customers.getAll(req.tenantId);
});

server.post("/api/customers", async (req, reply) => {
  const result = await repo.customers.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Customer created successfully" };
});

server.delete("/api/customers/:id", async (req) => {
  return await repo.customers.delete(req.tenantId, req.params.id);
});

// ── ENQUIRIES ENDPOINTS ──

server.get("/api/enquiries", async (req) => {
  return await repo.enquiries.getAll(req.tenantId);
});

server.post("/api/enquiries", async (req, reply) => {
  const result = await repo.enquiries.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Enquiry saved successfully" };
});

server.delete("/api/enquiries/:id", async (req) => {
  return await repo.enquiries.delete(req.tenantId, req.params.id);
});

// ── SUPPLIERS ENDPOINTS ──

server.get("/api/suppliers", async (req) => {
  return await repo.suppliers.getAll(req.tenantId);
});

server.post("/api/suppliers", async (req, reply) => {
  const result = await repo.suppliers.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Supplier saved successfully" };
});

server.delete("/api/suppliers/:id", async (req) => {
  return await repo.suppliers.delete(req.tenantId, req.params.id);
});

// ── PRODUCTS / CATALOGUE ENDPOINTS ──

server.get("/api/products", async (req) => {
  return await repo.products.getAll(req.tenantId);
});

server.post("/api/products", async (req, reply) => {
  const result = await repo.products.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Product saved successfully" };
});

server.delete("/api/products/:id", async (req) => {
  return await repo.products.delete(req.tenantId, req.params.id);
});

// ── MATERIALS ENDPOINTS ──

server.get("/api/materials", async (req) => {
  return await repo.materials.getAll(req.tenantId);
});

server.post("/api/materials", async (req, reply) => {
  const result = await repo.materials.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Material saved successfully" };
});

server.delete("/api/materials/:id", async (req) => {
  return await repo.materials.delete(req.tenantId, req.params.id);
});

// ── FINISHES ENDPOINTS ──

server.get("/api/finishes", async (req) => {
  return await repo.finishes.getAll(req.tenantId);
});

server.post("/api/finishes", async (req, reply) => {
  const result = await repo.finishes.save(req.tenantId, req.body || {});
  reply.status(201);
  return { id: result.id, success: true, message: "Finish saved successfully" };
});

server.delete("/api/finishes/:id", async (req) => {
  return await repo.finishes.delete(req.tenantId, req.params.id);
});

// ── METHODS ENDPOINT (Global reference data) ──

server.get("/api/methods", async () => {
  return await repo.methods.getAll();
});

// ── QUOTATIONS ENDPOINTS ──

server.get("/api/quotations", async (req) => {
  return await repo.quotations.getAll(req.tenantId);
});

server.get("/api/quotations/:id", async (req, reply) => {
  const quote = await repo.quotations.getById(req.tenantId, req.params.id);
  if (!quote) {
    reply.status(404);
    return { error: "Quotation not found" };
  }
  return quote;
});

server.post("/api/quotations", async (req, reply) => {
  const body = req.body || {};
  const {
    customerId,
    quoteNumber = `Q-${Date.now()}`,
    quoteDate = new Date().toISOString(),
    quoteStatus = "Draft",
    action = "draft",
    transportCost = 0,
    designCharges = 0,
    installationCharges = 0,
    discountPercent = 0,
    gstRate = 18,
    notesJson = {},
    sites = [],
  } = body;

  const effectiveCustomerId = customerId || (body.customer?.id) || `cust-${Date.now()}`;

  // Determine or reuse quoteId consistently by quoteNumber or explicit id scoped to this tenant
  let quoteId = body.id || null;
  if (!quoteId && req.tenantId) {
    const existingByNum = await repo.quotations.getByQuoteNumber(req.tenantId, quoteNumber);
    if (existingByNum) {
      quoteId = existingByNum.id;
    }
  }
  if (!quoteId) {
    quoteId = `quote-${Date.now()}`;
  }

  // A finalized invoice is locked; and no new version while the customer's latest quote is finalized.
  if (req.tenantId) {
    const existingRow = await repo.quotations.getRow(req.tenantId, quoteId);
    if (existingRow && existingRow.quote_status === "Invoice") {
      reply.status(409);
      return { error: "This quotation is finalized as an invoice. Un-finalize it before editing." };
    }
    if (!existingRow) {
      const latest = await repo.quotations.getLatestForCustomer(req.tenantId, effectiveCustomerId);
      if (latest && latest.quote_status === "Invoice") {
        reply.status(409);
        return { error: `Quotation ${latest.quote_number} is finalized. Un-finalize it to create a new version.` };
      }
    }
  }

  // Validate and recompute all lines with calcLine
  const processedLines = [];
  let computedSubtotal = 0;
  const validMethodCodes = new Set(["sq_ft", "run_ft", "sq_m", "run_m", "per_piece", "lump_sum"]);

  for (const site of sites) {
    const items = site.items || [];
    for (let i = 0; i < items.length; i++) {
      const line = items[i];
      const code = line.method_code || line.methodCode || "sq_ft";
      if (!validMethodCodes.has(code)) {
        reply.status(400);
        return { error: `Invalid method_code: ${code}. Must be one of sq_ft, run_ft, sq_m, run_m, per_piece, lump_sum` };
      }

      const method = METHOD_MAP[code] || METHOD_MAP.sq_ft;
      const width = line.width !== undefined && line.width !== null && line.width !== "" ? parseFloat(line.width) : null;
      const height = line.height !== undefined && line.height !== null && line.height !== "" ? parseFloat(line.height) : null;
      const quantity = Math.max(1, parseInt(line.quantity || line.qty) || 1);
      const rate = line.rate !== undefined && line.rate !== null && line.rate !== "" ? parseFloat(line.rate) : (line.price !== undefined && line.price !== null && line.price !== "" ? parseFloat(line.price) : null);
      const discountPct = Math.max(0, parseFloat(line.discount_pct || line.discount) || 0);

      const calcResult = calcLine({
        methodType: method.type,
        width,
        height,
        quantity,
        rate,
        discountPct,
      });

      if (action === "create" && calcResult.status === "incomplete") {
        reply.status(400);
        const prodName = line.product_title || line.productTitle || "Signage item";
        const reasonDetail = calcResult.reason === "rate" ? "missing unit rate" : calcResult.reason === "size" ? "missing dimensions" : `incomplete ${calcResult.reason}`;
        return {
          error: `Cannot create customer quote: "${prodName}" has ${reasonDetail}`,
          reason: calcResult.reason,
          productTitle: prodName,
        };
      }

      if (calcResult.status === "ok" && calcResult.total !== null) {
        computedSubtotal += calcResult.total;
      }

      processedLines.push({
        id: line.id ? `${quoteId}-${line.id}` : `line-${quoteId}-${processedLines.length + 1}`,
        quoteId: quoteId,
        siteId: site.id || null,
        siteName: site.siteName || null,
        productTitle: line.product_title || line.productTitle || "Signage Product",
        materialName: line.material_name || line.materialName || null,
        finishName: line.finish_name || line.finishName || null,
        methodCode: code,
        methodName: method.name,
        rateLabel: method.rate_label,
        width: width,
        height: height,
        quantity: method.type === "fixed" ? 1 : quantity,
        rate: rate,
        discountPct: discountPct,
        billableQty: calcResult.billableQty,
        total: calcResult.total,
        sortOrder: i + 1,
      });
    }
  }

  const finalStatus = action === "create" ? "Sent" : quoteStatus;
  const finalSubtotal = roundHalfUp(computedSubtotal, 2);
  const totalBase = finalSubtotal + Number(transportCost) + Number(designCharges) + Number(installationCharges);
  const finalGrandTotal = roundHalfUp(totalBase + totalBase * (Number(gstRate) / 100), 2);

  // Save through tenant-scoped repository
  try {
    await repo.quotations.save(
      req.tenantId,
      quoteId,
      {
        customerId: effectiveCustomerId,
        quoteNumber,
        quoteDate,
        finalStatus,
        finalSubtotal,
        transportCost,
        designCharges,
        installationCharges,
        discountPercent,
        gstRate,
        finalGrandTotal,
        notesJson,
      },
      processedLines
    );
  } catch (err) {
    req.log?.error(err);
    reply.status(500);
    return {
      error: `Failed to save quotation to database: ${err.message}`,
    };
  }

  return {
    quoteId,
    quoteNumber,
    grandTotal: finalGrandTotal,
    status: finalStatus,
    lines: processedLines,
  };
});

// Finalize (quote -> invoice) or un-finalize. Only the newest quotation of a customer can be finalized.
server.patch("/api/quotations/:id/finalize", async (req, reply) => {
  const finalized = !!(req.body && req.body.finalized);
  const row = await repo.quotations.getRow(req.tenantId, req.params.id);
  if (!row) {
    reply.status(404);
    return { error: "Quotation not found" };
  }
  if (finalized) {
    const latest = await repo.quotations.getLatestForCustomer(req.tenantId, row.customer_id);
    if (latest && latest.id !== row.id) {
      reply.status(409);
      return { error: "Only the latest quotation of a customer can be finalized" };
    }
  }
  const updated = await repo.quotations.setFinalized(req.tenantId, row.id, finalized);
  return { id: updated.id, quoteStatus: updated.quote_status, finalized };
});

server.delete("/api/quotations/:id", async (req, reply) => {
  const row = await repo.quotations.getRow(req.tenantId, req.params.id);
  if (row && row.quote_status === "Invoice") {
    reply.status(409);
    return { error: "A finalized invoice cannot be deleted. Un-finalize it first." };
  }
  const result = await repo.quotations.delete(req.tenantId, req.params.id);
  return result;
});

// ── BUSINESS DETAILS ENDPOINTS ──

server.get("/api/business-details", async (req) => {
  return await repo.businessDetails.get(req.tenantId);
});

server.put("/api/business-details", async (req, reply) => {
  const body = req.body || {};
  if (!String(body.legalName || "").trim()) {
    reply.status(400);
    return { error: "Legal / Display Name is required" };
  }

  const saved = await repo.businessDetails.upsert(req.tenantId, body);
  return {
    success: true,
    businessDetails: saved,
  };
});

// 4. Boot Server
const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

export async function start() {
  try {
    await initDatabase();
    await server.listen({ port: PORT, host: HOST });
    console.log(`[PrintPal Fastify Engine] Live at http://localhost:${PORT}`);
  } catch (err) {
    console.error("[PrintPal Server Error]:", err);
    process.exit(1);
  }
}

// Only start listener if invoked directly as main module
const isMain =
  !process.argv[1] ||
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith("server.mjs");

if (isMain) {
  start();
}
