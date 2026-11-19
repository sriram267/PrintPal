/* Web addresses for Quotation Reports: list, open one, finalize (make it the invoice), delete.
   Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */

/** @param {import("fastify").FastifyInstance} server */
export function registerQuotationReportsRoutes(server, { repo }) {
  // ── QUOTATIONS ENDPOINTS ──

  server.get("/api/quotations", async (req) => {
    return await repo.quotations.getAll(req.tenantId);
  });

  server.get("/api/quotations/:id", async (req, reply) => {
    const quote = await repo.quotations.getById(req.tenantId, req.params.id);
    if (!quote) {
      reply.status(404);
      return { error: "Quotation not found" };
    }
    return quote;
  });

  // Finalize (quote -> invoice) or un-finalize. Only the newest quotation of a customer can be finalized.
  server.patch("/api/quotations/:id/finalize", async (req, reply) => {
    const finalized = !!(req.body && req.body.finalized);
    const row = await repo.quotations.getRow(req.tenantId, req.params.id);
    if (!row) {
      reply.status(404);
      return { error: "Quotation not found" };
    }
    if (finalized) {
      const latest = await repo.quotations.getLatestForCustomer(req.tenantId, row.customer_id);
      if (latest && latest.id !== row.id) {
        reply.status(409);
        return { error: "Only the latest quote can be made the invoice" };
      }
    }
    const updated = await repo.quotations.setFinalized(req.tenantId, row.id, finalized);
    return { id: updated.id, quoteStatus: updated.quote_status, finalized };
  });

  server.delete("/api/quotations/:id", async (req, reply) => {
    const row = await repo.quotations.getRow(req.tenantId, req.params.id);
    if (row && row.quote_status === "Invoice") {
      reply.status(409);
      return { error: "An invoice can't be deleted. Reopen it first." };
    }
    const result = await repo.quotations.delete(req.tenantId, req.params.id);
    return result;
  });
}
