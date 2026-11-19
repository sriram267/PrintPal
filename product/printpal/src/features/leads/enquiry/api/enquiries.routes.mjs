/* Web addresses for this feature. Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerEnquiriesRoutes(server, { repo }) {
  // ── ENQUIRIES ENDPOINTS ──

  server.get("/api/enquiries", async (req) => {
    return await repo.enquiries.getAll(req.tenantId);
  });

  server.post("/api/enquiries", async (req, reply) => {
    const result = await repo.enquiries.save(req.tenantId, req.body || {});
    reply.status(201);
    return { id: result.id, success: true, message: "Enquiry saved successfully" };
  });

  server.delete("/api/enquiries/:id", async (req) => {
    return await repo.enquiries.delete(req.tenantId, req.params.id);
  });
}
