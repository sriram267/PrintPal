// Shops can never overwrite each other's records, and a server restart never deletes a shop's own catalogue items.
// Runs PrintPal's REAL schema, database code and API routes on a throwaway in-memory database.
// It never loads .env and never connects to Neon.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { PGlite } from "@electric-sql/pglite";
import { initDatabase } from "../src/shared/server/schema.mjs";
import { createTenantRepository } from "../src/shared/server/repository.mjs";
import { prepareRowRules, withTenant } from "../src/shared/server/tenantSession.mjs";
import { DEFAULT_TENANT_ID } from "../src/shared/server/tenantContext.mjs";
import { seedDatabaseFromCatalogue } from "../src/features/settings/starter-catalogue/db/seedDefaultCatalogue.mjs";
import { registerAccountRoutes } from "../src/shared/server/account.routes.mjs";
import { registerCustomersRoutes } from "../src/features/leads/customer/api/customers.routes.mjs";
import { registerCreateQuoteRoutes } from "../src/features/quotation/create-quote/api/quotations.create.routes.mjs";
import { registerQuotationReportsRoutes } from "../src/features/quotation/reports/api/quotations.routes.mjs";

const SHOP_A = "tenant_user_shop_alpha";
const SHOP_B = "tenant_user_shop_beta";

/** Hide the schema's start-up logging. */
async function quiet(fn) {
  const [log, warn] = [console.log, console.warn];
  console.log = console.warn = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
    console.warn = warn;
  }
}

async function freshDb({ rowRules }) {
  const db = new PGlite(); // in memory; gone when closed
  await db.waitReady;
  await quiet(() => initDatabase(db));
  if (rowRules) assert.equal(await prepareRowRules(db), true, "the test database must allow switching to app_user");
  for (const id of [SHOP_A, SHOP_B]) {
    await db.query("INSERT INTO tenants (id, company_name, trade_name, state_code) VALUES ($1, $1, $1, '33')", [id]);
  }
  return db;
}

const isRefused = (err) => err.statusCode === 409 && err.code === "RECORD_NOT_YOURS";

const quoteFields = (customerId, quoteNumber, finalStatus, total) => ({
  customerId, quoteNumber, quoteDate: "2026-11-20", finalStatus,
  finalSubtotal: total, transportCost: 0, designCharges: 0, installationCharges: 0,
  discountPercent: 0, gstRate: 18, finalGrandTotal: total, notesJson: {},
});
const quoteLine = (id, total) => ({
  id, siteId: null, siteName: "Main site", productTitle: "Flex Banner", materialName: null, finishName: null,
  methodCode: "sq_ft", methodName: "Square Feet", rateLabel: "per sq ft", width: 10, height: 5, quantity: 1,
  rate: total / 50, discountPct: 0, billableQty: 50, total, sortOrder: 1,
});

/** [repository, a record Shop A creates, the field that holds its name] */
const RECORDS = [
  ["customers", { id: "cust-1763600000000", businessName: "A's customer", sites: [] }, "businessName"],
  ["enquiries", { id: "enq-1763600000000", contactName: "A's enquiry" }, "contactName"],
  ["suppliers", { id: "supp-1763600000000", supplierName: "A's supplier" }, "supplierName"],
  ["products", { id: "prod-1763600000000", title: "A's product" }, "title"],
  ["materials", { id: "mat-1763600000000", name: "A's material" }, "name"],
  ["finishes", { id: "fin-1763600000000", name: "A's finish" }, "name"],
];

// Each layer must hold on its own: the database's row rules, and the app's own owner check.
for (const rowRules of [true, false]) {
  describe(`Shop B can't overwrite Shop A's records (database row rules ${rowRules ? "on" : "off"})`, () => {
    let db;
    let repo;
    before(async () => {
      db = await freshDb({ rowRules });
      repo = createTenantRepository(db);
    });
    after(async () => db.close());

    for (const [table, record, nameField] of RECORDS) {
      it(`${table}: the save is refused (409) and Shop A's record is untouched`, async () => {
        await repo[table].save(SHOP_A, record);
        await assert.rejects(repo[table].save(SHOP_B, { ...record, [nameField]: "Overwritten by Shop B" }), isRefused);

        const ownedByA = (await repo[table].getAll(SHOP_A)).filter((r) => r.id === record.id);
        assert.deepEqual(ownedByA.map((r) => r[nameField]), [record[nameField]], "Shop A keeps its record, unchanged");
        const seenByB = (await repo[table].getAll(SHOP_B)).filter((r) => r.id === record.id);
        assert.equal(seenByB.length, 0, "Shop B never gets Shop A's record");
      });
    }

    it("sites: a new customer that reuses Shop A's site id is refused, and nothing of it is saved", async () => {
      await repo.customers.save(SHOP_A, {
        id: "cust-1763600000100", businessName: "A with a site",
        sites: [{ id: "site-1763600000100-1", siteName: "A's shop front" }],
      });
      await assert.rejects(
        repo.customers.save(SHOP_B, {
          id: "cust-1763600000200", businessName: "B's new customer",
          sites: [{ id: "site-1763600000100-1", siteName: "Overwritten by Shop B" }],
        }),
        isRefused
      );
      const a = (await repo.customers.getAll(SHOP_A)).find((c) => c.id === "cust-1763600000100");
      assert.equal(a.sites[0].siteName, "A's shop front");
      const b = await repo.customers.getAll(SHOP_B);
      assert.equal(b.some((c) => c.id === "cust-1763600000200"), false, "the whole save is undone, not half-saved");
    });

    it("quotes: Shop A's locked invoice can't be overwritten, nor can one of its lines", async () => {
      await repo.quotations.save(SHOP_A, "quote-1763600000300", quoteFields("cust-a", "Q-001-V1", "Invoice", 118000), [
        quoteLine("quote-1763600000300-l1", 100000),
      ]);
      await assert.rejects(
        repo.quotations.save(SHOP_B, "quote-1763600000300", quoteFields("cust-b", "Q-900-V1", "Sent", 1), []),
        isRefused
      );
      await assert.rejects(
        repo.quotations.save(SHOP_B, "quote-1763600000400", quoteFields("cust-b", "Q-901-V1", "Sent", 1), [
          quoteLine("quote-1763600000300-l1", 1),
        ]),
        isRefused
      );
      const [q] = (await repo.quotations.getAll(SHOP_A)).filter((x) => x.id === "quote-1763600000300");
      assert.equal(q.quote_status, "Invoice");
      assert.equal(Number(q.grand_total), 118000);
      assert.equal(q.lines.length, 1);
      assert.equal(Number(q.lines[0].total), 100000);
      assert.equal((await repo.quotations.getAll(SHOP_B)).length, 0, "Shop B saved nothing");
    });

    it("a server restart keeps the products, materials and finishes a shop added itself", async () => {
      await repo.products.save(SHOP_A, { id: "prod-1763600000500", title: "A's own product" });
      await repo.materials.save(SHOP_A, { id: "mat-1763600000500", name: "A's own material" });
      await repo.finishes.save(SHOP_A, { id: "fin-1763600000500", name: "A's own finish" });
      const template = async () => (await repo.products.getAll(DEFAULT_TENANT_ID)).length;
      const templateBefore = await template();

      await quiet(() => seedDatabaseFromCatalogue(db)); // what every server start runs

      assert.ok((await repo.products.getAll(SHOP_A)).some((p) => p.id === "prod-1763600000500"));
      assert.ok((await repo.materials.getAll(SHOP_A)).some((m) => m.id === "mat-1763600000500"));
      assert.ok((await repo.finishes.getAll(SHOP_A)).some((f) => f.id === "fin-1763600000500"));
      assert.ok(templateBefore > 0, "the template shop has its starter catalogue");
      assert.equal(await template(), templateBefore, "the template catalogue is reloaded, not lost");
    });
  });
}

describe("Database row rules: how each shop's queries run", () => {
  let db;
  before(async () => {
    db = await freshDb({ rowRules: true });
  });
  after(async () => db.close());

  it("run as app_user, with the shop set for that transaction only", async () => {
    const inside = await withTenant(db, SHOP_A, (tx) =>
      tx.query("SELECT current_user AS who, current_setting('app.current_tenant_id', true) AS shop")
    );
    assert.equal(inside.rows[0].who, "app_user");
    assert.equal(inside.rows[0].shop, SHOP_A);

    const afterwards = await db.query("SELECT current_user AS who, current_setting('app.current_tenant_id', true) AS shop");
    assert.notEqual(afterwards.rows[0].who, "app_user", "the role switch ends with the transaction");
    assert.ok(!afterwards.rows[0].shop, "the shop setting ends with the transaction");
  });

  it("even a query with no shop filter only sees that shop's rows", async () => {
    const repo = createTenantRepository(db);
    await repo.customers.save(SHOP_A, { id: "cust-1763600000600", businessName: "Only A's" });
    const countFor = (shop) =>
      withTenant(db, shop, async (tx) => Number((await tx.query("SELECT COUNT(*) AS c FROM customers")).rows[0].c));
    assert.equal(await countFor(SHOP_A), 1);
    assert.equal(await countFor(SHOP_B), 0);
  });
});

describe("Start-up check of the database row rules", () => {
  it("repairs missing table permissions, then turns the rules on", async () => {
    const db = await freshDb({ rowRules: false });
    try {
      await db.query("REVOKE ALL ON customers, quote_lines FROM app_user");
      assert.equal(await prepareRowRules(db), true);
      const { rows } = await db.query("SELECT has_table_privilege('app_user', 'quote_lines', 'INSERT') AS ok");
      assert.equal(rows[0].ok, true);
    } finally {
      await db.close();
    }
  });

  it("falls back safely when app_user can't be used: the app still runs and still refuses cross-shop saves", async () => {
    const db = await freshDb({ rowRules: false });
    try {
      await db.exec("DROP OWNED BY app_user; DROP ROLE app_user;");
      assert.equal(await prepareRowRules(db), false);
      const repo = createTenantRepository(db);
      await repo.customers.save(SHOP_A, { id: "cust-1763600000800", businessName: "A's customer" });
      await assert.rejects(repo.customers.save(SHOP_B, { id: "cust-1763600000800", businessName: "Overwritten" }), isRefused);
      assert.deepEqual((await repo.customers.getAll(SHOP_A)).map((c) => c.businessName), ["A's customer"]);
    } finally {
      await db.close();
    }
  });
});

describe("Through the real API routes (row rules on)", () => {
  let db;
  let server;
  const call = (shop, method, url, payload) => server.inject({ method, url, payload, headers: { "x-test-shop": shop } });

  before(async () => {
    db = await freshDb({ rowRules: true });
    const repo = createTenantRepository(db);
    server = Fastify();
    // Test stand-in for the Clerk sign-in check: here the shop comes from a test header.
    server.addHook("onRequest", async (req) => {
      const shop = req.headers["x-test-shop"];
      req.auth = { userId: shop };
      req.tenantId = shop;
    });
    registerAccountRoutes(server, { pg: db });
    registerCustomersRoutes(server, { repo });
    registerQuotationReportsRoutes(server, { repo });
    registerCreateQuoteRoutes(server, { repo });
    await server.ready();
  });
  after(async () => {
    await server.close();
    await db.close();
  });

  it("POST /api/customers with another shop's id answers 409 and changes nothing", async () => {
    const created = await call(SHOP_A, "POST", "/api/customers", { id: "cust-1763600000700", businessName: "A's customer", sites: [] });
    assert.equal(created.statusCode, 201);

    const hijack = await call(SHOP_B, "POST", "/api/customers", { id: "cust-1763600000700", businessName: "Overwritten by Shop B", sites: [] });
    assert.equal(hijack.statusCode, 409);

    const a = JSON.parse((await call(SHOP_A, "GET", "/api/customers")).body);
    assert.deepEqual(a.map((c) => c.businessName), ["A's customer"]);
    const b = JSON.parse((await call(SHOP_B, "GET", "/api/customers")).body);
    assert.equal(b.length, 0);
  });

  it("POST /api/quotations with another shop's quote id answers 409, even when it is a locked invoice", async () => {
    const sites = [{ id: "site-a", siteName: "Main site", items: [{ id: "l1", product_title: "Flex Banner", method_code: "sq_ft", width: 10, height: 5, quantity: 1, rate: 20 }] }];
    const created = await call(SHOP_A, "POST", "/api/quotations", { customerId: "cust-1763600000700", quoteNumber: "Q-001-V1", action: "create", sites });
    assert.equal(created.statusCode, 200);
    const { quoteId, grandTotal } = JSON.parse(created.body);
    assert.match(quoteId, /^quote-\d{13}-[0-9a-f]{32}$/, "new quote ids carry a random part");

    const locked = await call(SHOP_A, "PATCH", `/api/quotations/${quoteId}/finalize`, { finalized: true });
    assert.equal(locked.statusCode, 200);

    const hijack = await call(SHOP_B, "POST", "/api/quotations", { id: quoteId, customerId: "cust-b", quoteNumber: "Q-900-V1", action: "create", sites });
    assert.equal(hijack.statusCode, 409);

    const a = JSON.parse((await call(SHOP_A, "GET", `/api/quotations/${quoteId}`)).body);
    assert.equal(a.quote_status, "Invoice");
    assert.equal(a.quote_number, "Q-001-V1");
    assert.equal(Number(a.grand_total), grandTotal);
    assert.equal(JSON.parse((await call(SHOP_B, "GET", "/api/quotations")).body).length, 0);
  });

  it("first sign-in still sets up a new shop with the full starter catalogue", async () => {
    const shop = "tenant_user_brand_new_shop";
    const res = await call(shop, "POST", "/api/auth/sync-user", { email: "owner@example.com", fullName: "Ravi" });
    assert.equal(res.statusCode, 200, res.body);

    const counts = (owner) =>
      withTenant(db, owner, async (tx) => {
        const n = async (table) =>
          Number((await tx.query(`SELECT COUNT(*) AS c FROM ${table} WHERE tenant_id = $1 AND deleted_at IS NULL`, [owner])).rows[0].c);
        return { products: await n("products"), materials: await n("materials"), finishes: await n("finishes") };
      });
    const template = await counts(DEFAULT_TENANT_ID);
    assert.ok(template.products > 0 && template.materials > 0 && template.finishes > 0);
    assert.deepEqual(await counts(shop), template, "the new shop gets the whole starter catalogue");

    const again = await call(shop, "POST", "/api/auth/sync-user", { email: "owner@example.com", fullName: "Ravi" });
    assert.equal(again.statusCode, 200);
    assert.deepEqual(await counts(shop), template, "signing in again doesn't copy it twice");
  });
});
