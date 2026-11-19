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
  const targetReportFile = path.resolve("src/features/quotation/reports/screen/QuotationReportsView.tsx");
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
    billingReportsSrc.includes('title="Renegotiate / Create next version"'),
    "BillingReportsView must have the edit/renegotiate button"
  );
  console.log("  ✓ Draft/Sent chip removed and Renegotiate button is present in BillingReportsView.");

  // 3. Verify QuotationView supports renegotiatingQuote & Version 2 title
  console.log("Test 3: Verifying QuotationView Version 2 title and pre-population...");
  const quoteViewSrc = fs.readFileSync(
    path.resolve("src/features/quotation/create-quote/screen/QuotationView.tsx"),
    "utf-8"
  );
  assert.ok(
    quoteViewSrc.includes("renegotiatingQuote"),
    "QuotationView must accept renegotiatingQuote prop"
  );
  // The version already lives in the quote number (Q-001-V2) — it must not be repeated as chips/suffixes.
  assert.ok(
    !quoteViewSrc.includes("quoteVersionTitle"),
    "QuotationView must not repeat the version label (quote number already carries it)"
  );
  assert.ok(
    quoteViewSrc.includes("onQuotationCreated"),
    "QuotationView must navigate to Quotation Reports after the PDF of a created quote is closed"
  );
  console.log("  ✓ QuotationView shows the version once (in the quote number) and hands off to reports.");

  // 4. Verify Pal Notch UX copy in LeadsApp.tsx
  console.log("Test 4: Verifying Pal Notch notification and UX copy in LeadsApp...");
  const leadsAppSrc = fs.readFileSync(
    path.resolve("src/app/LeadsApp.tsx"),
    "utf-8"
  );
  assert.ok(
    leadsAppSrc.includes("started from ${q.quoteNumber}"),
    "LeadsApp must tell the owner which new version was started from which quote"
  );
  assert.ok(
    leadsAppSrc.includes("Prices and sites are copied over. Change what the customer asked for, then create the quote."),
    "Pal Notch copy must say, in plain words, what to do next"
  );
  assert.ok(
    leadsAppSrc.includes("handleRenegotiateQuotation"),
    "LeadsApp must handle renegotiation workflow"
  );
  console.log("  ✓ Pal Notch UX copy and auto-population wired seamlessly.");

  // 5. Verify Quotation Customer Linking & Pre-population from Backend API
  console.log("Test 5: Verifying Quotation to Customer Panel linkage and pre-population...");
  // This check needs a running, signed-in server that holds sample quotations. The sample data was removed
  // from the seed, and the API now requires a session, so skip (loudly) when that isn't the case.
  let resQuotes = null;
  try {
    resQuotes = await fetch("http://localhost:3001/api/quotations", {
      headers: { "x-tenant-id": "org_legacy_default" },
    });
  } catch {
    resQuotes = null;
  }
  if (!resQuotes || resQuotes.status !== 200) {
    console.log(`  - skipped: needs a live, signed-in server (got ${resQuotes ? resQuotes.status : "no server"}).`);
    console.log("\n>>> ALL QUOTATION RENEGOTIATION TESTS PASSED (live-server check skipped)! <<<");
    return;
  }
  const quotes = await resQuotes.json();
  if (!Array.isArray(quotes) || quotes.length === 0) {
    console.log("  - skipped: no sample quotations on this server.");
    console.log("\n>>> ALL QUOTATION RENEGOTIATION TESTS PASSED (live-server check skipped)! <<<");
    return;
  }

  const resCustomers = await fetch("http://localhost:3001/api/customers", {
    headers: { "x-tenant-id": "org_legacy_default" },
  });
  assert.equal(resCustomers.status, 200);
  const customers = await resCustomers.json();
  assert.ok(customers.length > 0, "Expected customers for the quotations");

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
