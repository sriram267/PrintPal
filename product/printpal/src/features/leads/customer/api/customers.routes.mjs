/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerCustomersRoutes(server, { repo }) {
  // ── CUSTOMERS ENDPOINTS ──

  server.get("/api/customers", async (req) => {
    return await repo.customers.getAll(req.tenantId);
  });

  server.post("/api/customers", async (req, reply) => {
    const result = await repo.customers.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Customer created successfully" };
  });

  server.delete("/api/customers/:id", async (req) => {
    return await repo.customers.delete(req.tenantId, req.params.id);
  });
}
