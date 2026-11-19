import { withTenant, isRowRuleRefusal, recordNotYours } from "./tenantSession.mjs";
import { createCustomersDb } from "../../features/leads/customer/db/customers.db.mjs";
import { createEnquiriesDb } from "../../features/leads/enquiry/db/enquiries.db.mjs";
import { createSuppliersDb } from "../../features/leads/supplier/db/suppliers.db.mjs";
import { createProductsDb } from "../../features/settings/products/db/products.db.mjs";
import { createMaterialsDb } from "../../features/settings/materials/db/materials.db.mjs";
import { createFinishesDb } from "../../features/settings/finishes/db/finishes.db.mjs";
import { createQuotationsDb } from "../../features/quotation/create-quote/db/quotations.db.mjs";
import { createBusinessDetailsDb } from "../../features/settings/business-details/db/businessDetails.db.mjs";
import { createMethodsDb } from "../../features/quotation/create-quote/db/methods.db.mjs";

/** Each feature's database code for shop-owned data. Every method takes the shop (tenantId) first. */
const SHOP_DATA = {
  customers: createCustomersDb,
  enquiries: createEnquiriesDb,
  suppliers: createSuppliersDb,
  products: createProductsDb,
  materials: createMaterialsDb,
  finishes: createFinishesDb,
  quotations: createQuotationsDb,
  businessDetails: createBusinessDetailsDb,
};

/** The check each feature runs first ("syncRls"): the shop it was called for must be the transaction's shop. */
const sameShop = (tenantId) => async (t) => {
  if (t !== tenantId) throw new Error("Shop mismatch inside a database transaction.");
};

/**
 * Puts the features' database code together. Keeping shops apart:
 * 1. Every method runs through withTenant(): its own transaction, as the restricted app_user role when the
 *    database allows it (row rules on), with the shop set for that transaction only.
 * 2. Every query filters by `tenant_id = $1`.
 * 3. Every save refuses to overwrite a row that belongs to another shop (the API answers 409).
 */
export function createTenantRepository(db) {
  const repo = { methods: createMethodsDb(db) }; // the six pricing methods are shared by every shop

  for (const [name, createDb] of Object.entries(SHOP_DATA)) {
    repo[name] = {};
    for (const method of Object.keys(createDb(db, async () => {}))) {
      if (method.startsWith("_")) continue; // internal helpers, called by the methods themselves
      repo[name][method] = (tenantId, ...args) =>
        withTenant(db, tenantId, (tx) => createDb(tx, sameShop(tenantId))[method](tenantId, ...args)).catch(
          (err) => {
            throw isRowRuleRefusal(err) ? recordNotYours() : err;
          }
        );
    }
  }
  return repo;
}
