/* After sign-in: make sure the shop exists, has business details, and has its starter catalogue.
   The shop's own rows are written as that shop (withTenant), so this works with the database's row rules on. */
import { copyCatalogueForTenant } from "../../features/settings/starter-catalogue/db/catalogueCopy.mjs";
import { SYSTEM_TEMPLATE_TENANT_ID } from "./tenantContext.mjs";
import { withTenant } from "./tenantSession.mjs";

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
      // 1. Ensure tenant exists (the shop list itself has no per-shop row rules)
      await pg.query(
        `INSERT INTO tenants (id, company_name, trade_name, state_code, currency)
         VALUES ($1, $2, $3, '33', 'INR')
         ON CONFLICT (id) DO UPDATE SET
           company_name = COALESCE(NULLIF(EXCLUDED.company_name, ''), tenants.company_name),
           updated_at = NOW();`,
        [tenantId, companyName, "PrintPal Workshop"]
      );

      // 2. Ensure business details exists, and see whether the shop has products yet (as this shop)
      const productCount = await withTenant(pg, tenantId, async (tx) => {
        const busId = `bus_${tenantId}`;
        await tx.query(
          `INSERT INTO business_details (id, tenant_id, legal_name, email)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             email = COALESCE(NULLIF(EXCLUDED.email, ''), business_details.email)
           WHERE business_details.tenant_id = EXCLUDED.tenant_id;`,
          [busId, tenantId, companyName, email]
        );
        const res = await tx.query(`SELECT COUNT(*) FROM products WHERE tenant_id = $1;`, [tenantId]);
        return parseInt(res.rows[0].count, 10);
      });

      // 3. Seed baseline catalogue for this new tenant if not yet seeded
      if (productCount === 0) {
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
