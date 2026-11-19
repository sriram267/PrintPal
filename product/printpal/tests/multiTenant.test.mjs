import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { initDatabase } from "../src/shared/server/schema.mjs";
import { createTenantRepository } from "../src/shared/server/repository.mjs";
import { prepareRowRules, withTenant } from "../src/shared/server/tenantSession.mjs";
import { copyCatalogueForTenant } from "../src/features/settings/starter-catalogue/db/catalogueCopy.mjs";
import { DEFAULT_TENANT_ID } from "../src/shared/server/tenantContext.mjs";

describe("PrintPal Multi-Tenancy SaaS Architecture & Data Isolation Test Suite", () => {
  let pg;
  let repo;
  const tenant1 = "org_test_shop_alpha_" + Date.now();
  const tenant2 = "org_test_shop_beta_" + Date.now();

  before(async () => {
    // A throwaway in-memory database with the real schema (never the local data/pgdata folder or Neon).
    pg = new PGlite();
    await pg.waitReady;
    const [log, warn] = [console.log, console.warn];
    console.log = console.warn = () => {};
    try {
      await initDatabase(pg);
    } finally {
      console.log = log;
      console.warn = warn;
    }
    assert.equal(await prepareRowRules(pg), true, "each shop's queries must run as app_user");
    repo = createTenantRepository(pg);

    // Ensure tenant 1 and tenant 2 records exist in tenants registry
    await pg.query(
      `INSERT INTO tenants (id, company_name, trade_name, state_code)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [tenant1, "Alpha Sign Studio", "Alpha Signs", "33"]
    );
    await pg.query(
      `INSERT INTO tenants (id, company_name, trade_name, state_code)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [tenant2, "Beta Sign Studio", "Beta Signs", "27"]
    );
  });

  after(async () => {
    await pg.close(); // the in-memory database disappears with it
  });

  it("1. Baseline: Tenant 2 has zero rows in customers, quotes, materials, products before any action", async () => {
    const custs = await repo.customers.getAll(tenant2);
    assert.equal(custs.length, 0, "Tenant 2 must have 0 customers initially");

    const quotes = await repo.quotations.getAll(tenant2);
    assert.equal(quotes.length, 0, "Tenant 2 must have 0 quotations initially");

    const mats = await repo.materials.getAll(tenant2);
    assert.equal(mats.length, 0, "Tenant 2 must have 0 materials initially");

    const fins = await repo.finishes.getAll(tenant2);
    assert.equal(fins.length, 0, "Tenant 2 must have 0 finishes initially");

    const prods = await repo.products.getAll(tenant2);
    assert.equal(prods.length, 0, "Tenant 2 must have 0 products initially");
  });

  it("2. Catalogue copy-on-signup: Copies catalogue generically from source to target tenant", async () => {
    // Read source catalogue counts from DEFAULT_TENANT_ID
    const sourceMats = await repo.materials.getAll(DEFAULT_TENANT_ID);
    const sourceFins = await repo.finishes.getAll(DEFAULT_TENANT_ID);
    const sourceProds = await repo.products.getAll(DEFAULT_TENANT_ID);

    assert.ok(sourceMats.length > 0, "Source tenant must have materials");
    assert.ok(sourceFins.length > 0, "Source tenant must have finishes");
    assert.ok(sourceProds.length > 0, "Source tenant must have products");

    // Execute copy function
    const copyResult = await copyCatalogueForTenant(pg, tenant2, DEFAULT_TENANT_ID);
    assert.equal(copyResult.success, true);
    assert.equal(copyResult.copied, true);
    assert.equal(copyResult.counts.materials, sourceMats.length);
    assert.equal(copyResult.counts.finishes, sourceFins.length);
    assert.equal(copyResult.counts.products, sourceProds.length);

    // Verify target tenant now has matching count
    const targetMats = await repo.materials.getAll(tenant2);
    const targetFins = await repo.finishes.getAll(tenant2);
    const targetProds = await repo.products.getAll(tenant2);

    assert.equal(targetMats.length, sourceMats.length, "Target materials count must match source");
    assert.equal(targetFins.length, sourceFins.length, "Target finishes count must match source");
    assert.equal(targetProds.length, sourceProds.length, "Target products count must match source");
  });

  it("3. Catalogue copy: No copied records share an ID with source tenant and relations are remapped", async () => {
    const sourceMats = await repo.materials.getAll(DEFAULT_TENANT_ID);
    const targetMats = await repo.materials.getAll(tenant2);
    const sourceMatIds = new Set(sourceMats.map((m) => m.id));

    // Confirm no target material shares an ID with source
    for (const tm of targetMats) {
      assert.equal(sourceMatIds.has(tm.id), false, `Target material ID ${tm.id} must not clash with source`);
      assert.equal(tm.tenantId, tenant2, `Target material must be scoped to tenant2`);
    }

    const sourceFins = await repo.finishes.getAll(DEFAULT_TENANT_ID);
    const targetFins = await repo.finishes.getAll(tenant2);
    const sourceFinIds = new Set(sourceFins.map((f) => f.id));

    for (const tf of targetFins) {
      assert.equal(sourceFinIds.has(tf.id), false, `Target finish ID ${tf.id} must not clash with source`);
      assert.equal(tf.tenantId, tenant2, `Target finish must be scoped to tenant2`);
    }

    // Check products: confirm material_ids and finish_ids in products point to new target IDs
    const targetProds = await repo.products.getAll(tenant2);
    const targetMatIds = new Set(targetMats.map((m) => m.id));
    const targetFinIds = new Set(targetFins.map((f) => f.id));

    for (const tp of targetProds) {
      assert.equal(tp.tenantId, tenant2, `Target product must be scoped to tenant2`);

      // Verify remapped material_ids
      if (Array.isArray(tp.materialIds) && tp.materialIds.length > 0) {
        for (const mid of tp.materialIds) {
          assert.equal(sourceMatIds.has(mid), false, `Product material_id ${mid} must not be a source ID`);
          assert.equal(targetMatIds.has(mid), true, `Product material_id ${mid} must exist in target materials`);
        }
      }

      // Verify remapped finish_ids
      if (Array.isArray(tp.finishIds) && tp.finishIds.length > 0) {
        for (const fid of tp.finishIds) {
          assert.equal(sourceFinIds.has(fid), false, `Product finish_id ${fid} must not be a source ID`);
          assert.equal(targetFinIds.has(fid), true, `Product finish_id ${fid} must exist in target finishes`);
        }
      }
    }
  });

  it("4. Idempotency guard: Running copyCatalogueForTenant again skips duplicates safely", async () => {
    const secondRun = await copyCatalogueForTenant(pg, tenant2, DEFAULT_TENANT_ID);
    assert.equal(secondRun.success, true);
    assert.equal(secondRun.copied, false);
    assert.match(secondRun.message, /already initialized/i);
  });

  it("5. Tenant Data Isolation: Shop A customer and quote are completely invisible to Shop B", async () => {
    // Create customer for Shop A (tenant1)
    const custA = await repo.customers.save(tenant1, {
      businessName: "Acme Corporation Alpha",
      primaryContactName: "Alice Alpha",
      primaryContactNumber: "9876543210",
      billingAddress: "123 Alpha Industrial Area, Chennai",
      sites: [
        {
          siteName: "Alpha Flagship Store",
          address: "123 Alpha Rd",
        },
      ],
    });

    // Create quote for Shop A
    const quoteNumberA = `QA-${Date.now()}`;
    await repo.quotations.save(
      tenant1,
      `quote-alpha-${Date.now()}`,
      {
        customerId: custA.id,
        quoteNumber: quoteNumberA,
        quoteDate: new Date().toISOString(),
        finalStatus: "Draft",
        finalSubtotal: 15000,
        transportCost: 500,
        designCharges: 1000,
        installationCharges: 2000,
        discountPercent: 5,
        gstRate: 18,
        finalGrandTotal: 20650,
        notesJson: {},
      },
      [
        {
          id: `line-alpha-1`,
          quoteId: `quote-alpha-${Date.now()}`,
          productTitle: "Acrylic 3D Letter",
          methodCode: "sq_ft",
          methodName: "Square Feet",
          rateLabel: "per sq ft",
          width: 10,
          height: 3,
          quantity: 1,
          rate: 500,
          discountPct: 0,
          billableQty: 30,
          total: 15000,
          sortOrder: 1,
        },
      ]
    );

    // Verify Shop B (tenant2) CANNOT see Shop A's customer in getAll()
    const shopBCustomers = await repo.customers.getAll(tenant2);
    const leakedCust = shopBCustomers.find((c) => c.id === custA.id || c.businessName === "Acme Corporation Alpha");
    assert.equal(leakedCust, undefined, "Shop B must NOT see Shop A's customer in listings");

    // Verify Shop B (tenant2) CANNOT see Shop A's quote in getAll()
    const shopBQuotes = await repo.quotations.getAll(tenant2);
    const leakedQuote = shopBQuotes.find((q) => q.quoteNumber === quoteNumberA);
    assert.equal(leakedQuote, undefined, "Shop B must NOT see Shop A's quotation in listings");

    // Specifically test fetching by ID: Shop B querying Shop A's customer ID returns null
    const guessedCust = await repo.customers.getById(tenant2, custA.id);
    assert.equal(guessedCust, null, "Querying Shop A customer ID under Shop B context must return null");

    // Specifically test fetching quote by ID: Shop B querying Shop A's quote returns null
    const guessedQuote = await repo.quotations.getById(tenant2, `quote-alpha-${Date.now()}`);
    assert.equal(guessedQuote, null, "Querying Shop A quote ID under Shop B context must return null");

    // Specifically test delete by ID: Shop B attempting to delete Shop A's customer has 0 effect on Shop A
    await repo.customers.delete(tenant2, custA.id);
    const stillExistsInA = await repo.customers.getById(tenant1, custA.id);
    assert.ok(stillExistsInA, "Shop A's customer must still exist after Shop B's rogue delete attempt");
  });

  it("6. Composite Unique Constraint: Two different tenants can share the same quote_number", async () => {
    const sharedQuoteNumber = `Q-UNIVERSAL-${Date.now()}`;

    // Shop A creates quote with sharedQuoteNumber
    const quoteIdA = `quote-shared-a-${Date.now()}`;
    await repo.quotations.save(
      tenant1,
      quoteIdA,
      {
        customerId: "cust-dummy-a",
        quoteNumber: sharedQuoteNumber,
        quoteDate: new Date().toISOString(),
        finalStatus: "Draft",
        finalSubtotal: 1000,
        transportCost: 0,
        designCharges: 0,
        installationCharges: 0,
        discountPercent: 0,
        gstRate: 18,
        finalGrandTotal: 1180,
        notesJson: {},
      },
      []
    );

    // Shop B creates quote with the EXACT SAME Q-UNIVERSAL-1001
    const quoteIdB = `quote-shared-b-${Date.now()}`;
    await repo.quotations.save(
      tenant2,
      quoteIdB,
      {
        customerId: "cust-dummy-b",
        quoteNumber: sharedQuoteNumber,
        quoteDate: new Date().toISOString(),
        finalStatus: "Draft",
        finalSubtotal: 2000,
        transportCost: 0,
        designCharges: 0,
        installationCharges: 0,
        discountPercent: 0,
        gstRate: 18,
        finalGrandTotal: 2360,
        notesJson: {},
      },
      []
    );

    // Both quotes must exist independently in their respective tenants
    const quoteA = await repo.quotations.getByQuoteNumber(tenant1, sharedQuoteNumber);
    const quoteB = await repo.quotations.getByQuoteNumber(tenant2, sharedQuoteNumber);

    assert.ok(quoteA, "Shop A quote must exist");
    assert.ok(quoteB, "Shop B quote must exist");
    assert.equal(quoteA.id, quoteIdA);
    assert.equal(quoteB.id, quoteIdB);
    assert.equal(quoteA.tenantId, tenant1);
    assert.equal(quoteB.tenantId, tenant2);
    assert.equal(quoteA.grandTotal, 1180);
    assert.equal(quoteB.grandTotal, 2360);

    // Clean up test quotes
    await repo.quotations.delete(tenant1, quoteIdA);
    await repo.quotations.delete(tenant2, quoteIdB);
  });

  it("7. Strict Application-Layer Enforcement: Calling repo function without tenantId throws immediately", async () => {
    await assert.rejects(
      async () => {
        // @ts-ignore
        await repo.customers.getAll(null);
      },
      /Mandatory tenantId is missing or invalid/,
      "repo.customers.getAll(null) must throw"
    );

    await assert.rejects(
      async () => {
        // @ts-ignore
        await repo.quotations.getAll("");
      },
      /Mandatory tenantId is missing or invalid/,
      "repo.quotations.getAll('') must throw"
    );

    await assert.rejects(
      async () => {
        // @ts-ignore
        await repo.products.save(undefined, {});
      },
      /Mandatory tenantId is missing or invalid/,
      "repo.products.save(undefined) must throw"
    );
  });

  it("8. Database-Level RLS Defense-in-Depth: the repository's own path runs as app_user, isolated per shop", async () => {
    // withTenant is exactly what every repository call uses: no hand-made SET ROLE in this test.
    const look = (tenant) =>
      withTenant(pg, tenant, async (tx) => {
        const who = await tx.query("SELECT current_user AS u");
        const all = await tx.query("SELECT COUNT(*) AS c FROM customers;"); // no WHERE: only the row rules limit it
        return { user: who.rows[0].u, customers: Number(all.rows[0].c) };
      });
    const seen1 = await look(tenant1);
    const seen2 = await look(tenant2);

    assert.equal(seen1.user, "app_user", "Queries must run as the restricted app_user role");
    assert.ok(seen1.customers > 0, "Tenant 1 must see its own customers under RLS");
    assert.equal(seen2.customers, 0, "Tenant 2 must not see Tenant 1's customers under RLS");
  });
});
