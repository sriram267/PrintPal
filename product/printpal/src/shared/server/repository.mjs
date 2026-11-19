import { assertTenantId } from "./tenantContext.mjs";
import { createCustomersDb } from "../../features/leads/customer/db/customers.db.mjs";
import { createEnquiriesDb } from "../../features/leads/enquiry/db/enquiries.db.mjs";
import { createSuppliersDb } from "../../features/leads/supplier/db/suppliers.db.mjs";
import { createProductsDb } from "../../features/settings/products/db/products.db.mjs";
import { createMaterialsDb } from "../../features/settings/materials/db/materials.db.mjs";
import { createFinishesDb } from "../../features/settings/finishes/db/finishes.db.mjs";
import { createQuotationsDb } from "../../features/quotation/create-quote/db/quotations.db.mjs";
import { createBusinessDetailsDb } from "../../features/settings/business-details/db/businessDetails.db.mjs";
import { createMethodsDb } from "../../features/quotation/create-quote/db/methods.db.mjs";

/**
 * Creates the Multi-Tenant Repository layer over PGlite / PostgreSQL.
 *
 * Defense-in-depth:
 * 1. Every method strictly enforces a non-empty `tenantId` string.
 * 2. Every SQL query explicitly binds `tenant_id = $1`.
 * 3. Before each tenant-scoped query, `app.current_tenant_id` session setting
 *    is applied to activate database-level Row-Level Security (RLS).
 */
export function createTenantRepository(pg) {
  // Helper to sync tenant context for database-level RLS
  async function syncRls(tenantId) {
    assertTenantId(tenantId);
    try {
      await pg.query("SELECT set_config('app.current_tenant_id', $1, false);", [tenantId]);
    } catch (err) {
      // In case session config fails, application-level filter still protects
      console.warn("[Repository] set_config app.current_tenant_id warning:", err.message);
    }
  }

  // Each feature owns its own database code (src/features/<area>/<feature>/db/); this puts them back together.
  return {
    customers: createCustomersDb(pg, syncRls),
    enquiries: createEnquiriesDb(pg, syncRls),
    suppliers: createSuppliersDb(pg, syncRls),
    products: createProductsDb(pg, syncRls),
    materials: createMaterialsDb(pg, syncRls),
    finishes: createFinishesDb(pg, syncRls),
    quotations: createQuotationsDb(pg, syncRls),
    businessDetails: createBusinessDetailsDb(pg, syncRls),
    methods: createMethodsDb(pg, syncRls),
  };
}
