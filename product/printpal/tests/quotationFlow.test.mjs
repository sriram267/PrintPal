// @ts-check
// Create quotation → close PDF → Quotation Reports (customer group open, new line highlighted).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const qv = fs.readFileSync(path.resolve("src/features/quotation/create-quote/screen/QuotationView.tsx"), "utf-8");
const app = fs.readFileSync(path.resolve("src/modules/leads/LeadsApp.tsx"), "utf-8");
const rep = fs.readFileSync(path.resolve("src/features/quotation/reports/screen/QuotationReportsView.tsx"), "utf-8");

console.log("=== Quotation create → reports flow ===");

// Closing the PDF hands off to the parent with the new quote's identity
assert.ok(/onClose=\{\(\) => \{[\s\S]{0,200}setIsPreviewOpen\(false\)[\s\S]{0,300}onQuotationCreated\?\.\(/.test(qv),
  "closing the PDF calls onQuotationCreated");
// Local copy keeps customerId + createdAt so the reports page can group/open it instantly
assert.ok(qv.includes("customerId: safeCustomerId") && qv.includes("createdAt: new Date().toISOString()"),
  "local quote entry carries customerId and createdAt");

// Parent navigates to reports, clears stale quotation state
assert.ok(/onQuotationCreated=\{\(created\) => \{[\s\S]{0,300}setActiveModule\("quotationReports"\)/.test(app),
  "LeadsApp switches to Quotation Reports");
assert.ok(/onQuotationCreated[\s\S]{0,200}setRenegotiatingQuote\(null\)[\s\S]{0,100}setQuotationSelectedCustomer\(null\)/.test(app),
  "renegotiation + selected customer reset after creating");
assert.ok(/onCreateQuotation=\{\(\) => \{[\s\S]{0,200}setQuotationSelectedCustomer\(null\)/.test(app),
  "Create Quotation button starts from a clean screen");

// Reports page opens the group and highlights the line
assert.ok(rep.includes("highlightQuote") && rep.includes("printpal-quote-row-new"), "new line highlighted");
assert.ok(rep.includes("groupKeyOf(hit)"), "customer group auto-expanded");

// Version label is not repeated
assert.ok(!qv.includes("quoteVersionTitle"), "no repeated version label in QuotationView");

console.log("  ✓ flow assertions passed");
