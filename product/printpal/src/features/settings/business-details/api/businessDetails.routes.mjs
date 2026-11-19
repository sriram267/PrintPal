/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerBusinessDetailsRoutes(server, { repo }) {
  // ── BUSINESS DETAILS ENDPOINTS ──

  server.get("/api/business-details", async (req) => {
    return await repo.businessDetails.get(req.tenantId);
  });

  server.put("/api/business-details", async (req, reply) => {
    const body = req.body || {};
    if (!String(body.legalName || "").trim()) {
      reply.status(400);
      return { error: "Legal / Display Name is required" };
    }

    const saved = await repo.businessDetails.upsert(req.tenantId, body);
    return {
      success: true,
      businessDetails: saved,
    };
  });
}
