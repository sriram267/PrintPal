// @ts-check
// Quotation Reports: customer accordion, derived status chips, finalize-as-invoice.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const view = fs.readFileSync(path.resolve("src/features/quotation/reports/screen/QuotationReportsView.tsx"), "utf-8");
const server =
  fs.readFileSync(path.resolve("src/features/quotation/create-quote/api/quotations.create.routes.mjs"), "utf-8") +
  fs.readFileSync(path.resolve("src/features/quotation/reports/api/quotations.routes.mjs"), "utf-8");
const repo = fs.readFileSync(path.resolve("src/features/quotation/create-quote/db/quotations.db.mjs"), "utf-8");
const pdf = fs.readFileSync(path.resolve("src/features/quotation/pdf/screen/QuotePDFPreview.tsx"), "utf-8");

console.log("=== Quotation accordion / finalize tests ===");

// UI: grouping + derived status (no stored Renegotiated/Open)
assert.ok(view.includes("groupQuotationsByCustomer"), "groups quotations per customer");
assert.ok(view.includes("'Renegotiated'") && view.includes("'Open'") && view.includes("'Invoice'"), "three chips");
assert.ok(/if \(index > 0\) return 'Renegotiated'/.test(view), "everything below the top is Renegotiated");
assert.ok(view.includes('aria-expanded={isOpen}'), "accordion exposes aria-expanded");

// Finalize checkbox is rendered for the top version only, behind a confirm
assert.ok(/isTop \?[\s\S]{0,400}<Checkbox/.test(view), "checkbox only on top version");
assert.ok(view.includes("palNotch.confirm") && view.includes("/finalize"), "finalize goes through confirm + PATCH");

// Finalized quotes cannot be renegotiated or deleted from the UI
assert.ok(view.includes("isTop && !isFinal"), "renegotiate hidden once finalized");
assert.ok(view.includes("{!isFinal && ("), "delete hidden once finalized");

// PDF flips to Invoice
assert.ok(view.includes("documentType={previewQuote.quoteStatus === 'Invoice'"), "PDF gets documentType");
assert.ok(pdf.includes("documentType = 'Quotation'") && pdf.includes("{documentType}"), "PDF renders documentType");

// Backend guards
assert.ok(server.includes('"/api/quotations/:id/finalize"'), "PATCH finalize endpoint");
assert.ok(server.includes("Only the latest quote can be made the invoice"), "finalize only latest");
assert.ok(server.includes("An invoice can\u0027t be deleted. Reopen it first."), "delete guard");
assert.ok(server.includes("so it can\u0027t be edited. Reopen it first."), "edit guard");
assert.ok(repo.includes("setFinalized") && repo.includes("getLatestForCustomer"), "repo helpers");

console.log("  ✓ all accordion / finalize assertions passed");
