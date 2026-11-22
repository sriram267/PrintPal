/* Sign-in check for every request: verifies the Clerk session token and works out which shop (tenant) it is.
   Moved unchanged from server/server.mjs (A2). */
import { verifyToken } from "@clerk/backend";
import { resolveTenantId } from "./tenantContext.mjs";

/** @param {import("fastify").FastifyInstance} server */
export function registerAuth(server) {
  // 3c. Public Routes Allowlist
  // (No waitlist: anyone signs up with Google through Clerk; Clerk is the only place people are stored.)
  const PUBLIC_ROUTES = new Set([
    "GET:/api/health",
  ]);

  // Must come from the environment (Render env var / local .env). Never hard-code a secret here.
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  if (!CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not set. Add it to the environment (or to .env for local development).");
  }

  // 3d. Mandatory Clerk Authentication & Tenant Resolution Hook
  server.addHook("onRequest", async (req, reply) => {
    // Allow CORS preflights through
    if (req.method === "OPTIONS") return;

    const routeKey = `${req.method}:${req.url.split("?")[0]}`;
    if (PUBLIC_ROUTES.has(routeKey)) {
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authentication required: Missing Bearer token." });
    }

    const token = authHeader.slice(7).trim();
    try {
      const verified = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
      req.auth = {
        userId: verified.sub,
        orgId: verified.org_id || null,
        orgRole: verified.org_role || null,
        claims: verified,
      };
      // Tenant is cryptographically derived from verified JWT
      req.tenantId = resolveTenantId(req);
    } catch (err) {
      return reply.status(401).send({ error: "Authentication failed: Invalid or expired session token." });
    }
  });
}
