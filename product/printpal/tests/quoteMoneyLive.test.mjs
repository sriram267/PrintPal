// @ts-check
// Live server: totals include the header discount, bad money is refused with 400 (never 500), and the
// quote -> invoice rules hold, including when two requests race. Skips cleanly without test users.
import assert from "node:assert/strict";
import { useLiveAuth } from "./_liveAuth.mjs";

const BASE = process.env.QA_BASE || "http://localhost:3001";
console.log("=== Quote money + invoice rules (live server) ===");
if (!(await useLiveAuth(BASE))) process.exit(0);

const H = { "Content-Type": "application/json", "x-tenant-id": "money_alpha" };
const call = async (method, p, body) => {
  const r = await fetch(`${BASE}${p}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await r.json(); } catch {}
  return { status: r.status, data };
};
const stamp = Date.now();
const makeCustomer = async (tag) => {
  const id = `money-${tag}-${stamp}`;
  assert.equal((await call("POST", "/api/customers", { id, name: `Money ${tag}` })).status, 201);
  return id;
};
const quote = (customerId, n, extra = {}) => ({
  customerId,
  quoteNumber: `MONEY-${stamp}-${n}`,
  action: "create",
  gstRate: 18,
  sites: [{ id: "s1", siteName: "Shop", items: [{ id: "l1", product_title: "Board", method_code: "sq_ft", width: 4, height: 3, quantity: 2, rate: 100 }] }],
  ...extra,
});

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; } catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
};

await test("4 x 3 ft (12 sq ft) x 2 x Rs100 = 2400, +18% GST = 2832", async () => {
  const c = await makeCustomer("a");
  const r = await call("POST", "/api/quotations", quote(c, "a"));
  assert.equal(r.status, 200);
  assert.equal(r.data.grandTotal, 2832);
});
await test("a 10% header discount comes off before GST: (2400 + 200) - 10% = 2340, +18% = 2761.2", async () => {
  const c = await makeCustomer("b");
  const r = await call("POST", "/api/quotations", quote(c, "b", { discountPercent: 10, transportCost: 200 }));
  assert.equal(r.data.grandTotal, 2761.2);
});
await test("the saved row keeps the same total the server returned", async () => {
  const c = await makeCustomer("c");
  const r = await call("POST", "/api/quotations", quote(c, "c", { discountPercent: 10 }));
  const row = await call("GET", `/api/quotations/${r.data.quoteId}`);
  assert.equal(Number(row.data.grand_total), r.data.grandTotal);
});
for (const [label, extra] of [
  ["discount over 100%", { discountPercent: 150 }],
  ["negative discount", { discountPercent: -5 }],
  ["negative GST rate", { gstRate: -18 }],
  ["negative transport", { transportCost: -1 }],
  ["absurdly large design charge", { designCharges: 1e12 }],
]) {
  await test(`${label} is refused with 400`, async () => {
    const c = await makeCustomer("v" + Math.abs(label.length));
    const r = await call("POST", "/api/quotations", quote(c, "v" + label.length, extra));
    assert.equal(r.status, 400, `got ${r.status} ${JSON.stringify(r.data)}`);
    assert.ok(typeof r.data.error === "string" && r.data.error.length > 5);
  });
}
await test("an absurd size and rate is a 400, not a 500", async () => {
  const c = await makeCustomer("big");
  const body = quote(c, "big");
  body.sites[0].items[0] = { ...body.sites[0].items[0], rate: 1e15, width: 1e6, height: 1e6 };
  const r = await call("POST", "/api/quotations", body);
  assert.equal(r.status, 400, `got ${r.status} ${JSON.stringify(r.data)}`);
});
await test("a quote with no customer is refused", async () => {
  const body = quote("x", "nocust");
  delete body.customerId;
  assert.equal((await call("POST", "/api/quotations", body)).status, 400);
});

// quote -> invoice
const fc = await makeCustomer("f");
let v1, v2;
await test("only the newest quote can become the invoice", async () => {
  v1 = (await call("POST", "/api/quotations", quote(fc, "f1"))).data;
  v2 = (await call("POST", "/api/quotations", quote(fc, "f2"))).data;
  assert.equal((await call("PATCH", `/api/quotations/${v1.quoteId}/finalize`, { finalized: true })).status, 409);
});
await test("an invoice cannot be edited, deleted, or have a new version made", async () => {
  const f = await call("PATCH", `/api/quotations/${v2.quoteId}/finalize`, { finalized: true });
  assert.equal(f.data.quoteStatus, "Invoice");
  assert.equal((await call("POST", "/api/quotations", quote(fc, "f2", { id: v2.quoteId }))).status, 409);
  assert.equal((await call("DELETE", `/api/quotations/${v2.quoteId}`)).status, 409);
  assert.equal((await call("POST", "/api/quotations", quote(fc, "f3"))).status, 409);
});
await test("making the invoice twice is harmless; reopening makes it deletable again", async () => {
  assert.equal((await call("PATCH", `/api/quotations/${v2.quoteId}/finalize`, { finalized: true })).data.quoteStatus, "Invoice");
  assert.notEqual((await call("PATCH", `/api/quotations/${v2.quoteId}/finalize`, { finalized: false })).data.quoteStatus, "Invoice");
  assert.equal((await call("DELETE", `/api/quotations/${v2.quoteId}`)).status, 200);
});
await test("finalizing while someone edits never leaves an edited invoice", async () => {
  const c = await makeCustomer("race");
  const a = (await call("POST", "/api/quotations", quote(c, "r1"))).data;
  const [f, e] = await Promise.all([
    call("PATCH", `/api/quotations/${a.quoteId}/finalize`, { finalized: true }),
    call("POST", "/api/quotations", quote(c, "r1", { id: a.quoteId, transportCost: 999 })),
  ]);
  const row = (await call("GET", `/api/quotations/${a.quoteId}`)).data;
  if (row.quote_status === "Invoice") {
    assert.ok(e.status === 409 || Number(row.transport_cost) === 999 === false, "invoice must not contain the racing edit");
  }
  assert.ok(f.status === 200 && (e.status === 200 || e.status === 409), `finalize ${f.status}, edit ${e.status}`);
});
await test("8 simultaneous creates with the same number make one quote, not eight", async () => {
  const c = await makeCustomer("dup");
  const rs = await Promise.all(Array.from({ length: 8 }, () => call("POST", "/api/quotations", quote(c, "dup"))));
  assert.ok(rs.every((r) => r.status === 200), rs.map((r) => r.status).join(","));
  assert.equal(new Set(rs.map((r) => r.data.quoteId)).size, 1);
});

console.log(`  ${passed} passed`);
