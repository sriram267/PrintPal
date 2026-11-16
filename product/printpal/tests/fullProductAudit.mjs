// @ts-check
import assert from "node:assert/strict";

import { useLiveAuth } from "./_liveAuth.mjs";

const BASE_URL = process.env.QA_BASE || "http://localhost:3001";
if (!(await useLiveAuth(BASE_URL))) process.exit(0);
const TENANT_A = "audit_tenant_alpha";
const TENANT_B = "audit_tenant_beta";

const headersA = { "Content-Type": "application/json", "x-tenant-id": TENANT_A };
const headersB = { "Content-Type": "application/json", "x-tenant-id": TENANT_B };

console.log("=================================================");
console.log("  PRINTPAL FULL-PRODUCT API & FUNCTIONALITY AUDIT");
console.log("=================================================\n");

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  process.stdout.write(`Test ${total}: ${name}... `);
  try {
    await fn();
    console.log("✓ PASS");
    passed++;
  } catch (err) {
    console.log("✗ FAIL");
    console.error("  Error:", err.message);
    throw err;
  }
}

// 1. Health Endpoint
await test("GET /api/health returns status ok", async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ok");
  assert.ok(data.timestamp);
});

// 2. Methods Endpoint (Reference Data)
await test("GET /api/methods returns 6 supported pricing calculation methods", async () => {
  const res = await fetch(`${BASE_URL}/api/methods`, { headers: headersA });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 6);
  const codes = data.map((m) => m.code);
  assert.ok(codes.includes("sq_ft"));
  assert.ok(codes.includes("run_ft"));
  assert.ok(codes.includes("sq_m"));
  assert.ok(codes.includes("run_m"));
  assert.ok(codes.includes("per_piece"));
  assert.ok(codes.includes("lump_sum"));
});

// 3. Business Details Endpoints
await test("PUT & GET /api/business-details handles upsert and retrieval per tenant", async () => {
  const payload = {
    legalName: "Alpha Signage Innovations Pvt Ltd",
    addressLine1: "123 Tech Park Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600096",
    gstin: "33AAAAA0000A1Z5",
    phone: "+91 99999 11111",
    email: "alpha@printpal.io",
  };

  const putRes = await fetch(`${BASE_URL}/api/business-details`, {
    method: "PUT",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(putRes.status, 200);
  const putData = await putRes.json();
  assert.equal(putData.success, true);
  assert.equal(putData.businessDetails.legalName, payload.legalName);

  const getRes = await fetch(`${BASE_URL}/api/business-details`, {
    headers: headersA,
  });
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.legalName, payload.legalName);
  assert.equal(getData.gstin, payload.gstin);
  assert.equal(getData.city, "Chennai");
});

await test("PUT /api/business-details rejects empty legalName with 400", async () => {
  const res = await fetch(`${BASE_URL}/api/business-details`, {
    method: "PUT",
    headers: headersA,
    body: JSON.stringify({ legalName: "   " }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

// 4. Customer CRUD & Site Hierarchy
let customerId = `cust-audit-${Date.now()}`;
await test("POST /api/customers creates customer with multiple sites and services", async () => {
  const payload = {
    id: customerId,
    name: "Audit Test Customer",
    businessName: "Audit Test Enterprises",
    contactPerson: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh@audit.com",
    gstin: "33ABCDE1234F1Z5",
    billingAddress: "45 Anna Salai, Chennai 600002",
    sites: [
      {
        id: `${customerId}-site-1`,
        siteName: "Showroom Front",
        address: "45 Anna Salai, Chennai 600002",
        services: ["Acrylic 3D LED Letters"],
      },
      {
        id: `${customerId}-site-2`,
        siteName: "Rooftop Billboard",
        address: "45 Anna Salai Rooftop, Chennai 600002",
        services: ["Flex Face Lightbox"],
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/api/customers`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.id, customerId);
});

await test("GET /api/customers retrieves customer and formatted sites", async () => {
  const res = await fetch(`${BASE_URL}/api/customers`, { headers: headersA });
  assert.equal(res.status, 200);
  const list = await res.json();
  assert.ok(Array.isArray(list));
  const found = list.find((c) => c.id === customerId);
  assert.ok(found);
  assert.equal(found.businessName, "Audit Test Enterprises");
  assert.equal(found.phone, "+91 98765 43210");
  assert.equal(found.sites.length, 2);
  assert.equal(found.sites[0].siteName, "Showroom Front");
});

await test("POST /api/customers updates existing customer seamlessly (UPSERT)", async () => {
  const payload = {
    id: customerId,
    name: "Audit Test Customer (Updated)",
    businessName: "Audit Test Enterprises Updated",
    phone: "+91 98765 43210",
    billingAddress: "45 Anna Salai, Chennai 600002",
    followUpDate: "2026-11-20",
    sites: [
      {
        id: `${customerId}-site-1`,
        siteName: "Showroom Front (Expanded)",
        address: "45 Anna Salai, Chennai 600002",
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/api/customers`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);

  const getRes = await fetch(`${BASE_URL}/api/customers`, { headers: headersA });
  const list = await getRes.json();
  const found = list.find((c) => c.id === customerId);
  assert.ok(found);
  assert.equal(found.businessName, "Audit Test Enterprises Updated");
  assert.equal(found.followUpDate, "2026-11-20");
});

// 5. Enquiry CRUD & Follow-Up Date
let enquiryId = `enq-audit-${Date.now()}`;
await test("POST /api/enquiries creates enquiry with follow-up date", async () => {
  const payload = {
    id: enquiryId,
    contactName: "Suresh Prabhu",
    phone: "+91 91234 56789",
    email: "suresh@lead.com",
    address: "T. Nagar, Chennai",
    inquiryNote: "Needs neon sign for juice shop",
    followUpDate: "2026-11-17",
  };

  const res = await fetch(`${BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.id, enquiryId);
});

await test("GET /api/enquiries retrieves enquiry with stage and followUpDate", async () => {
  const res = await fetch(`${BASE_URL}/api/enquiries`, { headers: headersA });
  assert.equal(res.status, 200);
  const list = await res.json();
  const found = list.find((e) => e.id === enquiryId);
  assert.ok(found);
  assert.equal(found.contactName, "Suresh Prabhu");
  assert.equal(found.followUpDate, "2026-11-17");
  assert.equal(found.stage, "NEEDS_FOLLOW_UP");
});

// 6. Supplier CRUD
let supplierId = `supp-audit-${Date.now()}`;
await test("POST & GET /api/suppliers creates and retrieves supplier", async () => {
  const payload = {
    id: supplierId,
    supplierName: "Metro LED Imports",
    contactPerson: "Dinesh Kumar",
    phone: "+91 97777 88888",
    category: "Electricals & Modules",
    gstin: "33ABCDE9999F1Z1",
    city: "Chennai",
  };

  const res = await fetch(`${BASE_URL}/api/suppliers`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);

  const getRes = await fetch(`${BASE_URL}/api/suppliers`, { headers: headersA });
  const list = await getRes.json();
  const found = list.find((s) => s.id === supplierId);
  assert.ok(found);
  assert.equal(found.supplierName, "Metro LED Imports");
  assert.equal(found.category, "Electricals & Modules");
});

// 7. Products, Materials, Finishes
let prodId = `prod-audit-${Date.now()}`;
let matId = `mat-audit-${Date.now()}`;
let finId = `fin-audit-${Date.now()}`;

await test("POST & GET /api/products creates and retrieves catalog item", async () => {
  const payload = {
    id: prodId,
    title: "Edge-lit Acrylic Sign",
    category: "Indoor Signage",
    pricedPer: "Per sq ft",
  };
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);

  const getRes = await fetch(`${BASE_URL}/api/products`, { headers: headersA });
  const list = await getRes.json();
  const found = list.find((p) => p.id === prodId);
  assert.ok(found);
  assert.equal(found.title, "Edge-lit Acrylic Sign");
});

await test("POST & GET /api/materials creates and retrieves material item", async () => {
  const payload = {
    id: matId,
    name: "Clear Acrylic 5mm",
    family: "Acrylic",
    category: "Substrate",
    unit: "Per sq ft",
  };
  const res = await fetch(`${BASE_URL}/api/materials`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);

  const getRes = await fetch(`${BASE_URL}/api/materials`, { headers: headersA });
  const list = await getRes.json();
  const found = list.find((m) => m.id === matId);
  assert.ok(found);
  assert.equal(found.name, "Clear Acrylic 5mm");
});

await test("POST & GET /api/finishes creates and retrieves finish item", async () => {
  const payload = {
    id: finId,
    name: "Satin Powder Coating",
    type: "Coating",
  };
  const res = await fetch(`${BASE_URL}/api/finishes`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  assert.equal(res.status, 201);

  const getRes = await fetch(`${BASE_URL}/api/finishes`, { headers: headersA });
  const list = await getRes.json();
  const found = list.find((f) => f.id === finId);
  assert.ok(found);
  assert.equal(found.name, "Satin Powder Coating");
});

// 8. Quotations & Pricing Engine calcLine Integration
let quoteId = `quote-audit-${Date.now()}`;
let quoteNumber = `Q-AUDIT-001-V1`;

await test("POST /api/quotations validates required customerId", async () => {
  const res = await fetch(`${BASE_URL}/api/quotations`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, "customerId is required");
});

await test("POST /api/quotations rejects invalid method_code with 400", async () => {
  const res = await fetch(`${BASE_URL}/api/quotations`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify({
      customerId: customerId,
      sites: [
        {
          items: [{ method_code: "invalid_calc_method", width: 10, height: 2, rate: 500 }],
        },
      ],
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("Invalid method_code"));
});

await test("POST /api/quotations rejects action='create' when lines are incomplete", async () => {
  const res = await fetch(`${BASE_URL}/api/quotations`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify({
      customerId: customerId,
      action: "create",
      sites: [
        {
          items: [{ method_code: "sq_ft", width: "", height: 2, rate: 500 }],
        },
      ],
    }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes("Cannot create customer quote"));
});

await test("POST /api/quotations computes line totals using calcLine across multiple methods", async () => {
  // Method 1: sq_ft (8 x 2 = 16 sqft * rate 2500 = 40,000, 10% disc = 36,000)
  // Method 2: per_piece (qty 5 * rate 1200 = 6,000, 0% disc = 6,000)
  // Subtotal = 42,000. Add transport 1500, design 2000, install 4500. Total base = 50,000. GST 18% = 9000. Grand = 59,000.
  const payload = {
    id: quoteId,
    quoteNumber: quoteNumber,
    customerId: customerId,
    action: "create",
    transportCost: 1500,
    designCharges: 2000,
    installationCharges: 4500,
    gstRate: 18,
    sites: [
      {
        id: "site-1",
        siteName: "Main Entrance",
        items: [
          {
            id: "line-1",
            method_code: "sq_ft",
            width: 8,
            height: 2,
            quantity: 1,
            rate: 2500,
            discount_pct: 10,
            product_title: "Acrylic Glow Sign",
          },
          {
            id: "line-2",
            method_code: "per_piece",
            quantity: 5,
            rate: 1200,
            discount_pct: 0,
            product_title: "Door Placards",
          },
        ],
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/api/quotations`, {
    method: "POST",
    headers: headersA,
    body: JSON.stringify(payload),
  });
  if (res.status !== 200) {
    const text = await res.text();
    console.error("\nPOST QUOTATION ERROR BODY:", text);
  }
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "Sent");
  assert.equal(data.quoteNumber, quoteNumber);
  assert.equal(data.lines.length, 2);
  assert.equal(data.lines[0].total, 36000);
  assert.equal(data.lines[1].total, 6000);
  assert.equal(data.grandTotal, 59000);
});

await test("GET /api/quotations and /api/quotations/:id fetches quote and line items", async () => {
  const getRes = await fetch(`${BASE_URL}/api/quotations/${quoteId}`, { headers: headersA });
  assert.equal(getRes.status, 200);
  const quote = await getRes.json();
  assert.equal(quote.id, quoteId);
  assert.equal(quote.quote_number, quoteNumber);
  assert.equal(Number(quote.grand_total), 59000);
  assert.equal(quote.lines.length, 2);

  const listRes = await fetch(`${BASE_URL}/api/quotations`, { headers: headersA });
  assert.equal(listRes.status, 200);
  const list = await listRes.json();
  const found = list.find((q) => q.id === quoteId);
  assert.ok(found);
});

// 9. Multi-Tenant Data Isolation Test
await test("Data Isolation: Tenant B cannot see Tenant A records", async () => {
  const custB = await (await fetch(`${BASE_URL}/api/customers`, { headers: headersB })).json();
  assert.ok(!custB.some((c) => c.id === customerId), "Tenant B should not see Tenant A customer");

  const enqB = await (await fetch(`${BASE_URL}/api/enquiries`, { headers: headersB })).json();
  assert.ok(!enqB.some((e) => e.id === enquiryId), "Tenant B should not see Tenant A enquiry");

  const suppB = await (await fetch(`${BASE_URL}/api/suppliers`, { headers: headersB })).json();
  assert.ok(!suppB.some((s) => s.id === supplierId), "Tenant B should not see Tenant A supplier");

  const quoteB = await (await fetch(`${BASE_URL}/api/quotations`, { headers: headersB })).json();
  assert.ok(!quoteB.some((q) => q.id === quoteId), "Tenant B should not see Tenant A quotation");

  const quoteByIdB = await fetch(`${BASE_URL}/api/quotations/${quoteId}`, { headers: headersB });
  assert.equal(quoteByIdB.status, 404, "Tenant B should receive 404 for Tenant A quote by id");
});

// 10. Deletions (Cleanup of Audit Test Records)
await test("DELETE /api/quotations/:id deletes quote and lines", async () => {
  const res = await fetch(`${BASE_URL}/api/quotations/${quoteId}`, {
    method: "DELETE",
    headers: headersA,
  });
  if (res.status !== 200) {
    const text = await res.text();
    console.error("\nDELETE QUOTATION ERROR BODY:", text);
  }
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);

  const getRes = await fetch(`${BASE_URL}/api/quotations/${quoteId}`, { headers: headersA });
  assert.equal(getRes.status, 404);
});

await test("DELETE /api/customers/:id soft-deletes customer", async () => {
  const res = await fetch(`${BASE_URL}/api/customers/${customerId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/customers`, { headers: headersA })).json();
  assert.ok(!list.some((c) => c.id === customerId));
});

await test("DELETE /api/enquiries/:id removes enquiry", async () => {
  const res = await fetch(`${BASE_URL}/api/enquiries/${enquiryId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/enquiries`, { headers: headersA })).json();
  assert.ok(!list.some((e) => e.id === enquiryId));
});

await test("DELETE /api/suppliers/:id removes supplier", async () => {
  const res = await fetch(`${BASE_URL}/api/suppliers/${supplierId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/suppliers`, { headers: headersA })).json();
  assert.ok(!list.some((s) => s.id === supplierId));
});

await test("DELETE /api/products/:id removes product", async () => {
  const res = await fetch(`${BASE_URL}/api/products/${prodId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/products`, { headers: headersA })).json();
  assert.ok(!list.some((p) => p.id === prodId));
});

await test("DELETE /api/materials/:id removes material", async () => {
  const res = await fetch(`${BASE_URL}/api/materials/${matId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/materials`, { headers: headersA })).json();
  assert.ok(!list.some((m) => m.id === matId));
});

await test("DELETE /api/finishes/:id removes finish", async () => {
  const res = await fetch(`${BASE_URL}/api/finishes/${finId}`, {
    method: "DELETE",
    headers: headersA,
  });
  assert.equal(res.status, 200);
  const list = await (await fetch(`${BASE_URL}/api/finishes`, { headers: headersA })).json();
  assert.ok(!list.some((f) => f.id === finId));
});

console.log("\n=================================================");
console.log(`  AUDIT COMPLETE: ${passed} / ${total} TESTS PASSED (100%)`);
console.log("=================================================");
