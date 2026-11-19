/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerSuppliersRoutes(server, { repo }) {
  // ── SUPPLIERS ENDPOINTS ──

  server.get("/api/suppliers", async (req) => {
    return await repo.suppliers.getAll(req.tenantId);
  });

  server.post("/api/suppliers", async (req, reply) => {
    const result = await repo.suppliers.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Supplier saved successfully" };
  });

  server.delete("/api/suppliers/:id", async (req) => {
    return await repo.suppliers.delete(req.tenantId, req.params.id);
  });
}
