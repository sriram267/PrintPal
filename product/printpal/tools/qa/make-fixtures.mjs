// Generates the A3 baseline data by running the REAL server code (feature routes) on an in-memory PGlite.
// Run from product/printpal (copied there temporarily) so fastify / pglite resolve.
import Fastify from "fastify";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import { initDatabase } from "./src/shared/server/schema.mjs";
import { createTenantRepository } from "./src/shared/server/repository.mjs";
import { DEFAULT_TENANT_ID } from "./src/shared/server/tenantContext.mjs";
import { registerCustomersRoutes } from "./src/features/leads/customer/api/customers.routes.mjs";
import { registerEnquiriesRoutes } from "./src/features/leads/enquiry/api/enquiries.routes.mjs";
import { registerSuppliersRoutes } from "./src/features/leads/supplier/api/suppliers.routes.mjs";
import { registerProductsRoutes } from "./src/features/settings/products/api/products.routes.mjs";
import { registerMaterialsRoutes } from "./src/features/settings/materials/api/materials.routes.mjs";
import { registerFinishesRoutes } from "./src/features/settings/finishes/api/finishes.routes.mjs";
import { registerQuotationReportsRoutes } from "./src/features/quotation/reports/api/quotations.routes.mjs";
import { registerCreateQuoteRoutes } from "./src/features/quotation/create-quote/api/quotations.create.routes.mjs";
import { registerBusinessDetailsRoutes } from "./src/features/settings/business-details/api/businessDetails.routes.mjs";

const OUT = process.argv[2];
const pg = new PGlite();
await pg.waitReady;
await initDatabase(pg);
const server = Fastify();
server.addHook("onRequest", async (req) => {
  req.tenantId = DEFAULT_TENANT_ID; // the shop that has the starter catalogue
});
const repo = createTenantRepository(pg);
for (const r of [registerCustomersRoutes, registerEnquiriesRoutes, registerSuppliersRoutes, registerProductsRoutes, registerMaterialsRoutes, registerFinishesRoutes, registerQuotationReportsRoutes, registerCreateQuoteRoutes, registerBusinessDetailsRoutes]) r(server, { repo });
const call = async (method, url, payload) => {
  const r = await server.inject({ method, url, payload });
  if (r.statusCode >= 400) throw new Error(`${method} ${url} → ${r.statusCode} ${r.body}`);
  return JSON.parse(r.body || "null");
};
const ts = (d) => new Date(Date.UTC(2026, 10, d, 6, 30)).toISOString();

/* customers (with sites and services) */
const customers = [
  {
    id: "cust-meridian", createdAt: ts(12), businessName: "Meridian Interiors", primaryContactName: "Ravi Kumar", phone: "9876543210",
    email: "ravi@meridian.in", gstin: "29ABCDE1234F1Z5", customerType: "RETAIL_BRAND", paymentTerms: "ADVANCE_50", followUpDate: "2026-11-20",
    billingAddress: "100 Feet Rd, Indiranagar, Bengaluru 560038", stateCode: "29", isShippingSameAsBilling: true, isWhatsAppSame: true,
    sites: [
      { id: "site-ind", siteName: "Indiranagar Showroom", address: "100 Feet Rd, Indiranagar, Bengaluru", city: "Bengaluru", state: "Karnataka", pincode: "560038", services: ["Flex Banner", "Window Graphic"] },
      { id: "site-kor", siteName: "Koramangala Studio", address: "80 Feet Rd, Koramangala, Bengaluru", city: "Bengaluru", state: "Karnataka", pincode: "560034", services: ["ACP Board", "Front-Lit Channel Letters"] },
    ],
  },
  {
    id: "cust-kavya", createdAt: ts(13), businessName: "Kavya Retail", primaryContactName: "Kavya S", phone: "9840122345", email: "kavya@retail.in",
    gstin: "33AAACK1234A1Z5", customerType: "FRANCHISE", paymentTerms: "NET_30", billingAddress: "T Nagar, Chennai 600017", stateCode: "33",
    isShippingSameAsBilling: true, isWhatsAppSame: true,
    sites: [{ id: "site-tnagar", siteName: "T Nagar Store", address: "Usman Rd, T Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", pincode: "600017", services: ["Flex Banner"] }],
  },
  {
    id: "cust-lakshmi", createdAt: ts(14), businessName: "Lakshmi Textiles", primaryContactName: "Lakshmi R", phone: "9962011876", billingAddress: "Gandhipuram, Coimbatore 641012",
    stateCode: "33", customerType: "INDIVIDUAL", paymentTerms: "ADVANCE_100", isShippingSameAsBilling: true, isWhatsAppSame: true, sites: [],
  },
];
for (const c of customers) await call("POST", "/api/customers", c);

/* enquiries */
await call("POST", "/api/enquiries", { id: "enq-1", createdAt: ts(15), contactName: "Arjun Mehta", phone: "9845011223", inquiryNote: "Needs a 10 x 4 ft flex banner for a store opening", followUpDate: "2026-11-21", stage: "NEW", source: "WALK_IN" });
await call("POST", "/api/enquiries", { id: "enq-2", createdAt: ts(16), contactName: "Priya Nair", phone: "9895033445", inquiryNote: "Glow sign board quote", stage: "NEEDS_FOLLOW_UP", source: "WALK_IN", followUpDate: "2026-11-18" });

/* suppliers */
await call("POST", "/api/suppliers", { id: "sup-1", createdAt: ts(10), supplierName: "Mehta Acrylics & Plastics", contactPerson: "Rajesh Mehta", phone: "9840012345", email: "rajesh@mehtaacrylics.com", category: "Acrylic & Sheets", city: "Chennai", state: "Tamil Nadu", pincode: "600032", addressLine1: "No. 12 Industrial Estate", gstin: "33AAACM1234A1Z5", paymentTerms: "ADVANCE", servingRegions: "Chennai, Coimbatore" });
await call("POST", "/api/suppliers", { id: "sup-2", createdAt: ts(11), supplierName: "Jindal Stainless Traders", contactPerson: "Vikram Jindal", phone: "9811022334", category: "Metal Sheets", city: "Bengaluru", state: "Karnataka" });

/* business details */
await call("PUT", "/api/business-details", { legalName: "Sri Sai Signs", addressLine1: "No. 8, SIDCO Industrial Estate", city: "Chennai", state: "Tamil Nadu", pincode: "600032", gstin: "33ABCDE1234F1Z5", pan: "ABCDE1234F", phone: "9840098400", email: "hello@srisaisigns.in", signatoryName: "S. Kumar", defaultTerms: "50% advance, balance on installation." });

/* quotations: Meridian has 3 versions (newest is the invoice); Kavya has 1 open quote */
const quote = (id, num, date, rate, extra = {}) => ({
  id, customerId: "cust-meridian", quoteNumber: num, quoteDate: date, action: "create", transportCost: 1200, installationCharges: 3500, discountPercent: 5, gstRate: 18,
  sites: [
    { id: "site-ind", siteName: "Indiranagar Showroom", items: [
      { id: "l1", productTitle: "Flex Banner", materialName: "Backlit Flex, 510 GSM", finishName: "Hemmed + Eyelets", methodCode: "sq_ft", width: 20, height: 10, quantity: 1, rate },
      { id: "l2", productTitle: "Window Graphic", materialName: "Perforated Vinyl", finishName: "Matte Lamination", methodCode: "sq_ft", width: 6, height: 3, quantity: 2, rate: 65 },
    ] },
    { id: "site-kor", siteName: "Koramangala Studio", items: [
      { id: "l3", productTitle: "ACP Board", materialName: "Aluminium Composite Panel, 3 mm", finishName: "Digital Print + Lamination", methodCode: "sq_ft", width: 12, height: 4, quantity: 1, rate: 450 },
      { id: "l4", productTitle: "Front-Lit Channel Letters", materialName: "Acrylic 3 mm, Aluminium Returns", finishName: "Vinyl Face, LED Modules", methodCode: "per_piece", quantity: 14, rate: 1200 },
    ] },
  ],
  ...extra,
});
await call("POST", "/api/quotations", quote("quote-m1", "Q-001-V1", ts(12), 32));
await call("POST", "/api/quotations", quote("quote-m2", "Q-001-V2", ts(14), 30));
await call("POST", "/api/quotations", quote("quote-m3", "Q-001-V3", ts(15), 28));
await call("PATCH", "/api/quotations/quote-m3/finalize", { finalized: true });
await call("POST", "/api/quotations", { id: "quote-k1", customerId: "cust-kavya", quoteNumber: "Q-002-V1", quoteDate: ts(16), action: "create", transportCost: 0, discountPercent: 0, gstRate: 18,
  sites: [{ id: "site-tnagar", siteName: "T Nagar Store", items: [{ id: "k1", productTitle: "Flex Banner", materialName: "Backlit Flex, 510 GSM", methodCode: "sq_ft", width: 12, height: 6, quantity: 2, rate: 30 }] }] });

/* dump every GET the app makes */
const fx = {};
for (const p of ["/api/customers", "/api/enquiries", "/api/suppliers", "/api/products", "/api/materials", "/api/finishes", "/api/methods", "/api/quotations", "/api/business-details"]) fx[`GET ${p}`] = await call("GET", p);
for (const q of fx["GET /api/quotations"]) fx[`GET /api/quotations/${q.id}`] = await call("GET", `/api/quotations/${q.id}`);
fx["POST /api/auth/sync-user"] = { success: true, tenantId: DEFAULT_TENANT_ID };
fs.writeFileSync(OUT, JSON.stringify(fx, null, 1));
console.log("fixtures:", Object.keys(fx).length, "endpoints; customers", fx["GET /api/customers"].length, "quotes", fx["GET /api/quotations"].length, "products", fx["GET /api/products"].length);
process.exit(0);
