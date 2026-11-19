// @ts-check
// A quote's money must come out identical on the server, on the quote screen, in Quotation Reports and in the PDF.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { computeQuoteTotals as server, validateQuoteMoney } from "../src/features/quotation/shared/quoteTotals.server.mjs";
import { computeQuoteTotals as client, formatQuoteDate } from "../src/features/quotation/shared/quoteTotals.ts";

console.log("=== Quote totals, validation and PDF print rules ===");

const read = (p) => fs.readFileSync(path.resolve(p), "utf-8").replace(/\r\n/g, "\n");

// 1. Known answers (checked by hand)
const cases = [
  // [input, expected]
  [{ sitesSubtotal: 2400, gstRate: 18 }, { gross: 2400, discountAmount: 0, taxableTotal: 2400, gstAmount: 432, grandTotal: 2832 }],
  [{ sitesSubtotal: 2400, transportCost: 200, gstRate: 18 }, { gross: 2600, discountAmount: 0, taxableTotal: 2600, gstAmount: 468, grandTotal: 3068 }],
  // header discount comes off items + design + installation + transport, then GST on the rest
  [{ sitesSubtotal: 16200, transportCost: 200, discountPercent: 10, gstRate: 18 }, { gross: 16400, discountAmount: 1640, taxableTotal: 14760, gstAmount: 2656.8, grandTotal: 17416.8 }],
  [{ sitesSubtotal: 14000, gstRate: 18 }, { gross: 14000, discountAmount: 0, taxableTotal: 14000, gstAmount: 2520, grandTotal: 16520 }],
  [{ sitesSubtotal: 99.99, gstRate: 18 }, { gross: 99.99, discountAmount: 0, taxableTotal: 99.99, gstAmount: 18, grandTotal: 117.99 }], // 17.9982 -> 18.00
  [{ sitesSubtotal: 1000, discountPercent: 100, gstRate: 18 }, { gross: 1000, discountAmount: 1000, taxableTotal: 0, gstAmount: 0, grandTotal: 0 }],
  [{ sitesSubtotal: 1000, gstRate: 0 }, { gross: 1000, discountAmount: 0, taxableTotal: 1000, gstAmount: 0, grandTotal: 1000 }],
];
for (const [input, expected] of cases) {
  assert.deepEqual(server(input), expected, `server ${JSON.stringify(input)}`);
  assert.deepEqual(client(input), expected, `client ${JSON.stringify(input)}`);
}
console.log("  ✓ known answers match on server and client");

// 2. Server and client agree on awkward numbers
for (let i = 0; i < 500; i++) {
  const input = {
    sitesSubtotal: Math.round(Math.random() * 5_000_000) / 100,
    designCharges: Math.round(Math.random() * 100_000) / 100,
    installationCharges: Math.round(Math.random() * 100_000) / 100,
    transportCost: Math.round(Math.random() * 100_000) / 100,
    discountPercent: Math.round(Math.random() * 3000) / 100,
    gstRate: [0, 5, 12, 18, 28][i % 5],
  };
  assert.deepEqual(server(input), client(input), `parity ${JSON.stringify(input)}`);
  const t = server(input);
  assert.ok(Math.abs(t.taxableTotal + t.gstAmount - t.grandTotal) < 0.005, "taxable + GST = total");
  assert.ok(t.grandTotal >= 0, "never negative");
}
console.log("  ✓ 500 random quotes: server and client agree, and taxable + GST = total");

// 3. Bad numbers are refused with a plain message
assert.equal(validateQuoteMoney({}), null);
assert.match(validateQuoteMoney({ discountPercent: 150 }), /between 0% and 100%/);
assert.match(validateQuoteMoney({ discountPercent: -1 }), /between 0% and 100%/);
assert.match(validateQuoteMoney({ gstRate: -18 }), /GST rate/);
assert.match(validateQuoteMoney({ transportCost: -5 }), /zero or more/);
assert.match(validateQuoteMoney({ designCharges: 1e12 }), /too large/);
assert.match(validateQuoteMoney({ installationCharges: NaN }), /zero or more/);
console.log("  ✓ bad discount, GST and charges are refused in plain words");

// 4. Dates read like dates
assert.equal(formatQuoteDate("2026-11-16T18:38:19.349Z").includes("T"), false);
assert.match(formatQuoteDate("2026-11-16T12:00:00.000Z"), /16 Nov 2026/);
assert.equal(formatQuoteDate("16 Nov 2026"), "16 Nov 2026");
assert.equal(formatQuoteDate(undefined), "");
console.log("  ✓ ISO timestamps become '16 Nov 2026'");

// 5. The server uses the shared calculation, and Reports rebuilds the breakdown from it
const server_ = read("src/features/quotation/create-quote/api/quotations.create.routes.mjs");
assert.ok(server_.includes("computeQuoteTotals(") && server_.includes("validateQuoteMoney("), "server uses the shared totals + validation");
assert.ok(!/totalBase \+ totalBase \* \(Number\(gstRate\)/.test(server_), "old GST formula (that ignored the discount) is gone");
const reports = read("src/features/quotation/reports/screen/QuotationReportsView.tsx");
assert.ok(reports.includes("computeQuoteTotals({"), "Reports rebuilds discount / taxable / GST from the saved figures");
assert.ok(!/gstAmount: 0,/.test(reports), "Reports no longer hard-codes GST to 0");
assert.ok(reports.includes("formatQuoteDate("), "Reports shows friendly dates");
const view = read("src/features/quotation/create-quote/screen/QuotationView.tsx");
assert.ok(view.includes("computeQuoteTotals({"), "quote screen uses the shared totals");
assert.ok(!view.includes("Math.round((taxableTotal * gstRate) / 100)"), "quote screen no longer rounds GST to whole rupees");
console.log("  ✓ server, quote screen and Reports all use the shared calculation");

// 6. PDF print sheet
const pdf = read("src/features/quotation/pdf/screen/QuotePDFPreview.tsx");
assert.ok(/@page\s*\{[^}]*margin:\s*0;/.test(pdf), "zero page margin removes the browser's header and footer");
assert.ok(/padding:\s*14mm 16mm/.test(pdf), "sheet supplies its own print margins");
assert.ok(!/FAF8F4|F1EDE4/i.test(pdf), "no cream paper colour");
assert.ok(pdf.includes("document.title = printTitleRef.current") && pdf.includes("afterprint"), "print sets a real document title and restores it");
for (const slop of ["Signage fabrication and installation", "Scope of work", "all taxes inclusive", "3D visualizer", "Summary quotation prepared", "Fabrication notes", "Commercial terms", "warm cotton"]) {
  assert.ok(!pdf.includes(slop), `PDF no longer contains filler text: ${slop}`);
}
console.log("  ✓ PDF prints on plain white A4 with no browser header/footer and no filler text");

console.log("  ✓ all quote totals assertions passed");
