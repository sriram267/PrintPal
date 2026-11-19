/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerFinishesRoutes(server, { repo }) {
  // ── FINISHES ENDPOINTS ──

  server.get("/api/finishes", async (req) => {
    return await repo.finishes.getAll(req.tenantId);
  });

  server.post("/api/finishes", async (req, reply) => {
    const result = await repo.finishes.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Finish saved successfully" };
  });

  server.delete("/api/finishes/:id", async (req) => {
    return await repo.finishes.delete(req.tenantId, req.params.id);
  });
}
