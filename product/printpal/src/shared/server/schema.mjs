/* Creates the tables (each defined next to its feature, run here in a fixed order) and applies the
   multi-shop migrations, row-level security and the six pricing methods. Moved from server/server.mjs (A2). */
import { TENANTS_TABLE } from "./tenants.schema.mjs";
import { CUSTOMERS_TABLE, SITES_TABLE } from "../../features/leads/customer/db/customers.schema.mjs";
import { ENQUIRIES_TABLE } from "../../features/leads/enquiry/db/enquiries.schema.mjs";
import { SUPPLIERS_TABLE } from "../../features/leads/supplier/db/suppliers.schema.mjs";
import { MATERIALS_TABLE } from "../../features/settings/materials/db/materials.schema.mjs";
import { FINISHES_TABLE } from "../../features/settings/finishes/db/finishes.schema.mjs";
import { PRODUCTS_TABLE } from "../../features/settings/products/db/products.schema.mjs";
import { METHODS_TABLE } from "../../features/quotation/create-quote/db/methods.schema.mjs";
import { QUOTATIONS_TABLE, QUOTE_LINES_TABLE } from "../../features/quotation/create-quote/db/quotations.schema.mjs";
import { BUSINESS_DETAILS_TABLE } from "../../features/settings/business-details/db/businessDetails.schema.mjs";
import { SYSTEM_METHODS } from "../../features/quotation/shared/calcLine.server.mjs";
import { seedDatabaseFromCatalogue } from "../../features/settings/starter-catalogue/db/seedDefaultCatalogue.mjs";

/** Tables in the exact order the original single CREATE script used. */
const TABLES_SQL = [TENANTS_TABLE, CUSTOMERS_TABLE, SITES_TABLE, ENQUIRIES_TABLE, SUPPLIERS_TABLE, MATERIALS_TABLE, FINISHES_TABLE, PRODUCTS_TABLE, METHODS_TABLE, QUOTATIONS_TABLE, QUOTE_LINES_TABLE, BUSINESS_DETAILS_TABLE].join("\n");

// 2. Initialize PostgreSQL 16 Multi-Tenant Schema and Migrations
export async function initDatabase(pg) {
  console.log("[DB] Initializing PostgreSQL 16 multi-tenant schema...");

  // Core system registry table
  await pg.exec(TABLES_SQL);

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
  await seedDatabaseFromCatalogue(pg);

  console.log("[DB] PostgreSQL 16 multi-tenant schema ready.");
}
