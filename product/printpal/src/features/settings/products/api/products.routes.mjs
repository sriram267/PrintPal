/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerProductsRoutes(server, { repo }) {
  // ── PRODUCTS / CATALOGUE ENDPOINTS ──

  server.get("/api/products", async (req) => {
    return await repo.products.getAll(req.tenantId);
  });

  server.post("/api/products", async (req, reply) => {
    const result = await repo.products.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Product saved successfully" };
  });

  server.delete("/api/products/:id", async (req) => {
    return await repo.products.delete(req.tenantId, req.params.id);
  });
}
