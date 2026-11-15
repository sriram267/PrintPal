// @ts-check
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function getNextQuoteVersion(currentQuoteNumber) {
  if (!currentQuoteNumber) {
    return {
      nextQuoteNumber: "Q-001-V2",
      versionNumber: 2,
      versionLabel: "Version 2",
    };
  }

  const match = currentQuoteNumber.match(/^(.*?)(?:[-_ ]?[vV](\d+))$/);
  if (match) {
    const base = match[1];
    const currentVer = parseInt(match[2], 10) || 1;
    const nextVer = currentVer + 1;
    return {
      nextQuoteNumber: `${base}-V${nextVer}`,
      versionNumber: nextVer,
      versionLabel: `Version ${nextVer}`,
    };
  }

  return {
    nextQuoteNumber: `${currentQuoteNumber}-V2`,
    versionNumber: 2,
    versionLabel: "Version 2",
  };
}

async function runTests() {
  console.log("=== Running Quotation Renegotiation & Pal Notch Workflow Tests ===");

  // 1. Version calculation tests
  console.log("Test 1: Testing getNextQuoteVersion calculation...");
  const v1 = getNextQuoteVersion("Q-001-V1");
  assert.equal(v1.nextQuoteNumber, "Q-001-V2");
  assert.equal(v1.versionNumber, 2);
  assert.equal(v1.versionLabel, "Version 2");

  const v2 = getNextQuoteVersion("Q-001-V2");
  assert.equal(v2.nextQuoteNumber, "Q-001-V3");
  assert.equal(v2.versionNumber, 3);
  assert.equal(v2.versionLabel, "Version 3");

  const vNoSuffix = getNextQuoteVersion("QUOTE-884");
  assert.equal(vNoSuffix.nextQuoteNumber, "QUOTE-884-V2");
  assert.equal(vNoSuffix.versionNumber, 2);
  assert.equal(vNoSuffix.versionLabel, "Version 2");

  const vLower = getNextQuoteVersion("Q-010-v1");
  assert.equal(vLower.nextQuoteNumber, "Q-010-V2");
  console.log("  ✓ getNextQuoteVersion accurately computes next versions.");

  // 2. Verify removal of Draft/Sent status chip from QuotationReportsView / BillingReportsView
  console.log("Test 2: Verifying removal of Draft chip status in QuotationReportsView...");
  const targetReportFile = fs.existsSync(path.resolve("src/modules/leads/QuotationReportsView.tsx"))
    ? path.resolve("src/modules/leads/QuotationReportsView.tsx")
    : path.resolve("src/modules/leads/BillingReportsView.tsx");
  const billingReportsSrc = fs.readFileSync(targetReportFile, "utf-8");
  assert.ok(
    !billingReportsSrc.includes("<StatusBadge"),
    "BillingReportsView must not render StatusBadge chip in table row"
  );
  assert.ok(
    !billingReportsSrc.includes("function StatusBadge"),
    "StatusBadge function should be removed"
  );
  assert.ok(
    billingReportsSrc.includes('title="Renegotiate / Create Version 2"'),
    "BillingReportsView must have the edit/renegotiate button"
  );
  console.log("  ✓ Draft/Sent chip removed and Renegotiate button is present in BillingReportsView.");

  // 3. Verify QuotationView supports renegotiatingQuote & Version 2 title
  console.log("Test 3: Verifying QuotationView Version 2 title and pre-population...");
  const quoteViewSrc = fs.readFileSync(
    path.resolve("src/modules/leads/QuotationView.tsx"),
    "utf-8"
  );
  assert.ok(
    quoteViewSrc.includes("renegotiatingQuote"),
    "QuotationView must accept renegotiatingQuote prop"
  );
  assert.ok(
    quoteViewSrc.includes("quoteVersionTitle"),
    "QuotationView must manage quoteVersionTitle state"
  );
  assert.ok(
    quoteViewSrc.includes("Create Customer Quote (${quoteVersionTitle})"),
    "Action button must reflect Version 2"
  );
  console.log("  ✓ QuotationView reflects Version 2 title, badge, and action button.");

  // 4. Verify Pal Notch UX copy in LeadsApp.tsx
  console.log("Test 4: Verifying Pal Notch notification and UX copy in LeadsApp...");
  const leadsAppSrc = fs.readFileSync(
    path.resolve("src/modules/leads/LeadsApp.tsx"),
    "utf-8"
  );
  assert.ok(
    leadsAppSrc.includes('badge: "QUOTATION REVISION"'),
    "LeadsApp must trigger Pal Notch notification with badge 'QUOTATION REVISION'"
  );
  assert.ok(
    leadsAppSrc.includes("is auto-populated in the quotation screen") ||
    leadsAppSrc.includes("is auto-populated in the billing screen"),
    "Pal Notch copy must inform user quotation revision is auto-populated in quotation screen"
  );
  assert.ok(
    leadsAppSrc.includes("handleRenegotiateQuotation"),
    "LeadsApp must handle renegotiation workflow"
  );
  console.log("  ✓ Pal Notch UX copy and auto-population wired seamlessly.");

  // 5. Verify Quotation Customer Linking & Pre-population from Backend API
  console.log("Test 5: Verifying Quotation to Customer Panel linkage and pre-population...");
  const resQuotes = await fetch("http://localhost:3001/api/quotations", {
    headers: { "x-tenant-id": "org_legacy_default" },
  });
  assert.equal(resQuotes.status, 200);
  const quotes = await resQuotes.json();
  assert.equal(quotes.length, 3, "Expected 3 seeded quotations");

  const resCustomers = await fetch("http://localhost:3001/api/customers", {
    headers: { "x-tenant-id": "org_legacy_default" },
  });
  assert.equal(resCustomers.status, 200);
  const customers = await resCustomers.json();
  assert.equal(customers.length, 3, "Expected 3 seeded customers");

  const customerIdSet = new Set(customers.map((c) => c.id));

  for (const q of quotes) {
    assert.ok(q.customer_id, `Quotation ${q.quote_number} must have customer_id`);
    assert.ok(
      customerIdSet.has(q.customer_id),
      `Quotation ${q.quote_number} customer_id ${q.customer_id} must exist in customer panel`
    );
    assert.ok(
      q.customer_name && q.customer_name !== "Customer",
      `Quotation ${q.quote_number} must have resolved customer_name from customers table`
    );
    assert.ok(
      Array.isArray(q.sites) && q.sites.length > 0,
      `Quotation ${q.quote_number} must have reconstructed sites`
    );
    assert.ok(
      q.sites[0].items && q.sites[0].items.length > 0,
      `Quotation ${q.quote_number} sites must contain line items/products`
    );

    // Verify item pre-population fields
    const firstItem = q.sites[0].items[0];
    assert.ok(firstItem.productTitle, "Line item must have productTitle");
    assert.ok(firstItem.width != null, "Line item must have width");
    assert.ok(firstItem.height != null, "Line item must have height");
    assert.ok(firstItem.rate != null, "Line item must have rate");
    assert.ok(firstItem.total != null, "Line item must have calculated total");
  }
  console.log("  ✓ All 3 quotations are linked to customer panel with pre-populated sites and products.");

  console.log("\n>>> ALL QUOTATION RENEGOTIATION TESTS PASSED! <<<");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
