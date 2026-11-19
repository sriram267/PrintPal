/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerMaterialsRoutes(server, { repo }) {
  // ── MATERIALS ENDPOINTS ──

  server.get("/api/materials", async (req) => {
    return await repo.materials.getAll(req.tenantId);
  });

  server.post("/api/materials", async (req, reply) => {
    const result = await repo.materials.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Material saved successfully" };
  });

  server.delete("/api/materials/:id", async (req) => {
    return await repo.materials.delete(req.tenantId, req.params.id);
  });
}
