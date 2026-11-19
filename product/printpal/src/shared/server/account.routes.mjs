/* After sign-in: make sure the shop exists, has business details, and has its starter catalogue.
   Moved unchanged from server/server.mjs (A2). */
import { copyCatalogueForTenant } from "../../features/settings/starter-catalogue/db/catalogueCopy.mjs";
import { SYSTEM_TEMPLATE_TENANT_ID } from "./tenantContext.mjs";

/** @param {import("fastify").FastifyInstance} server */
export function registerAccountRoutes(server, { pg }) {
  // ── CLERK AUTH / TENANT SYNC (Authenticated & Server-Side Verified) ──
  server.post("/api/auth/sync-user", async (req, reply) => {
    // Identity is extracted strictly from the cryptographically verified JWT
    const userId = req.auth?.userId;
    if (!userId) {
      reply.status(401);
      return { error: "Unauthorized: Missing verified user session." };
    }

    const tenantId = req.tenantId; // Derived securely from req.auth
    const { email = "", fullName = "" } = req.body || {};
    const companyName = fullName ? `${fullName}'s Workshop` : "PrintPal Workshop";

    try {
      // 1. Ensure tenant exists
      await pg.query(
        `INSERT INTO tenants (id, company_name, trade_name, state_code, currency)
         VALUES ($1, $2, $3, '33', 'INR')
         ON CONFLICT (id) DO UPDATE SET
           company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), tenants.company_name),
           updated_at = NOW();`,
        [tenantId, companyName, "PrintPal Workshop"]
      );

      // 2. Ensure business details exists
      const busId = `bus_${tenantId}`;
      await pg.query(
        `INSERT INTO business_details (id, tenant_id, legal_name, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           email = COALESCE(NULLIF(EXCLUDED.email, ''), business_details.email);`,
        [busId, tenantId, companyName, email]
      );

      // 3. Seed baseline catalogue for this new tenant if not yet seeded
      const prodCount = await pg.query(
        `SELECT COUNT(*) FROM products WHERE tenant_id = $1;`,
        [tenantId]
      );
      if (parseInt(prodCount.rows[0].count, 10) === 0) {
        console.log(`[Auth Sync] Seeding baseline catalogue for new tenant ${tenantId}...`);
        await copyCatalogueForTenant(pg, tenantId, SYSTEM_TEMPLATE_TENANT_ID, { force: false });
      }

      return { success: true, tenantId };
    } catch (err) {
      console.error("[Auth Sync Error]:", err);
      reply.status(500);
      return { error: err.message };
    }
  });
}
