/*
 * PrintPal server: starts Fastify and plugs in each feature's web addresses.
 * No feature code lives here — every feature keeps its own api/ and db/ in src/features/<area>/<feature>/.
 * Shared pieces (database connection, sign-in check, tables, repository) are in src/shared/server/.
 */
import "../src/shared/server/env.mjs"; // load .env before anything reads process.env
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pg } from "../src/shared/server/database.mjs";
import { initDatabase as initSchema } from "../src/shared/server/schema.mjs";
import { registerAuth } from "../src/shared/server/auth.mjs";
import { registerAccountRoutes } from "../src/shared/server/account.routes.mjs";
import { createTenantRepository } from "../src/shared/server/repository.mjs";
import { prepareRowRules, rowRulesActive } from "../src/shared/server/tenantSession.mjs";
import { registerCustomersRoutes } from "../src/features/leads/customer/api/customers.routes.mjs";
import { registerEnquiriesRoutes } from "../src/features/leads/enquiry/api/enquiries.routes.mjs";
import { registerSuppliersRoutes } from "../src/features/leads/supplier/api/suppliers.routes.mjs";
import { registerProductsRoutes } from "../src/features/settings/products/api/products.routes.mjs";
import { registerMaterialsRoutes } from "../src/features/settings/materials/api/materials.routes.mjs";
import { registerFinishesRoutes } from "../src/features/settings/finishes/api/finishes.routes.mjs";
import { registerCreateQuoteRoutes } from "../src/features/quotation/create-quote/api/quotations.create.routes.mjs";
import { registerQuotationReportsRoutes } from "../src/features/quotation/reports/api/quotations.routes.mjs";
import { registerBusinessDetailsRoutes } from "../src/features/settings/business-details/api/businessDetails.routes.mjs";

export { pg };
const initDatabase = () => initSchema(pg);

// 3. Fastify HTTP Server Setup
export const server = Fastify({ logger: false });

// 3a. Restricted CORS (Defense in depth against arbitrary origin exploits)
const ALLOWED_ORIGINS = [
  "https://printpal-app.pages.dev",
  "https://printpal.com",
  "https://printpal.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
];

await server.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser requests (server health checks, curl without origin)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: Origin ${origin} not permitted`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// 3b. Global Rate Limiter
await server.register(rateLimit, {
  max: 300,
  timeWindow: "1 minute",
});

// Handle empty JSON bodies gracefully without crashing
server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (req, body, defaultDone) {
    if (!body || !body.trim()) {
      defaultDone(null, {});
      return;
    }
    try {
      defaultDone(null, JSON.parse(body));
    } catch (err) {
      err.statusCode = 400;
      defaultDone(err, undefined);
    }
  }
);

// 3c–3d. Sign-in check on every request (public: GET /api/health only)
registerAuth(server);

// Tenant-Scoped Data Access Repository
const repo = createTenantRepository(pg);

// ── HEALTH CHECK ──
server.get("/api/health", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    // Which code is running (Render sets RENDER_GIT_COMMIT) and whether the database row rules are on,
    // so a deploy can be confirmed from outside.
    version: (process.env.RENDER_GIT_COMMIT || "local").slice(0, 7),
    rowRules: rowRulesActive(pg),
  };
});

// After sign-in: make sure the shop, its business details and its starter catalogue exist
registerAccountRoutes(server, { pg });

// Each feature's web addresses
registerCustomersRoutes(server, { repo });
registerEnquiriesRoutes(server, { repo });
registerSuppliersRoutes(server, { repo });
registerProductsRoutes(server, { repo });
registerMaterialsRoutes(server, { repo });
registerFinishesRoutes(server, { repo });
registerQuotationReportsRoutes(server, { repo });
registerCreateQuoteRoutes(server, { repo });
registerBusinessDetailsRoutes(server, { repo });

// 4. Boot Server
const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

export async function start() {
  try {
    await initDatabase();
    // Each shop's queries run as the restricted app_user role, so the database itself keeps shops apart.
    const rowRules = await prepareRowRules(pg);
    console.log(
      rowRules
        ? "[DB] Row rules: ON. Each shop's queries run as app_user."
        : "[DB] Row rules: OFF. The database login can't switch to app_user; shops are still kept apart by the app's own checks."
    );
    await server.listen({ port: PORT, host: HOST });
    console.log(`[PrintPal Fastify Engine] Live at http://localhost:${PORT}`);
  } catch (err) {
    console.error("[PrintPal Server Error]:", err);
    process.exit(1);
  }
}

// Only start listener if invoked directly as main module
const isMain =
  !process.argv[1] ||
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith("server.mjs");

if (isMain) {
  start();
}
