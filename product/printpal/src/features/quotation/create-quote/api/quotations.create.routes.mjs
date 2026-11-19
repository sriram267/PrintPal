/* Web addresses for creating quotations: the pricing methods list, and saving a quotation (draft or sent).
   Plugged in by server/server.mjs. Moved unchanged from server/server.mjs (A2). */
import { calcLine, METHOD_MAP, roundHalfUp } from "../../shared/calcLine.server.mjs";
import { computeQuoteTotals, validateQuoteMoney, MAX_MONEY } from "../../shared/quoteTotals.server.mjs";
import { newId } from "../../../../shared/server/newId.mjs";

/** @param {import("fastify").FastifyInstance} server */
export function registerCreateQuoteRoutes(server, { repo }) {
  // ── METHODS ENDPOINT (Global reference data) ──

  server.get("/api/methods", async () => {
    return await repo.methods.getAll();
  });

  // ── QUOTATIONS ENDPOINTS ──

  server.post("/api/quotations", async (req, reply) => {
    const body = req.body || {};
    const {
      customerId,
      quoteNumber = `Q-${Date.now()}`,
      quoteDate = new Date().toISOString(),
      quoteStatus = "Draft",
      action = "draft",
      transportCost = 0,
      designCharges = 0,
      installationCharges = 0,
      discountPercent = 0,
      gstRate = 18,
      notesJson = {},
      sites = [],
    } = body;

    const moneyError = validateQuoteMoney({ transportCost, designCharges, installationCharges, discountPercent, gstRate });
    if (moneyError) {
      reply.status(400);
      return { error: moneyError };
    }

    const effectiveCustomerId = customerId || body.customer?.id;
    if (!effectiveCustomerId) {
      reply.status(400);
      return { error: "customerId is required" };
    }

    // Determine or reuse quoteId consistently by quoteNumber or explicit id scoped to this tenant
    let quoteId = body.id || null;
    if (!quoteId && req.tenantId) {
      const existingByNum = await repo.quotations.getByQuoteNumber(req.tenantId, quoteNumber);
      if (existingByNum) {
        quoteId = existingByNum.id;
      }
    }
    if (!quoteId) {
      quoteId = newId("quote");
    }

    // A finalized invoice is locked; and no new version while the customer's latest quote is finalized.
    if (req.tenantId) {
      const existingRow = await repo.quotations.getRow(req.tenantId, quoteId);
      if (existingRow && existingRow.quote_status === "Invoice") {
        reply.status(409);
        return { error: "This quote is now the invoice, so it can't be edited. Reopen it first." };
      }
      if (!existingRow) {
        const latest = await repo.quotations.getLatestForCustomer(req.tenantId, effectiveCustomerId);
        if (latest && latest.quote_status === "Invoice") {
          reply.status(409);
          return { error: `${latest.quote_number} is already the invoice. Reopen it to make a new version.` };
        }
      }
    }

    // Validate and recompute all lines with calcLine
    const processedLines = [];
    let computedSubtotal = 0;
    const validMethodCodes = new Set(["sq_ft", "run_ft", "sq_m", "run_m", "per_piece", "lump_sum"]);

    for (const site of sites) {
      const items = site.items || [];
      for (let i = 0; i < items.length; i++) {
        const line = items[i];
        const code = line.method_code || line.methodCode || "sq_ft";
        if (!validMethodCodes.has(code)) {
          reply.status(400);
          return { error: `Invalid method_code: ${code}. Must be one of sq_ft, run_ft, sq_m, run_m, per_piece, lump_sum` };
        }

        const method = METHOD_MAP[code] || METHOD_MAP.sq_ft;
        const width = line.width !== undefined && line.width !== null && line.width !== "" ? parseFloat(line.width) : null;
        const height = line.height !== undefined && line.height !== null && line.height !== "" ? parseFloat(line.height) : null;
        const quantity = Math.max(1, parseInt(line.quantity || line.qty) || 1);
        const rate = line.rate !== undefined && line.rate !== null && line.rate !== "" ? parseFloat(line.rate) : (line.price !== undefined && line.price !== null && line.price !== "" ? parseFloat(line.price) : null);
        const discountPct = Math.max(0, parseFloat(line.discount_pct || line.discount) || 0);

        const calcResult = calcLine({
          methodType: method.type,
          width,
          height,
          quantity,
          rate,
          discountPct,
        });

        if (action === "create" && calcResult.status === "incomplete") {
          reply.status(400);
          const prodName = line.product_title || line.productTitle || "Signage item";
          const reasonDetail = calcResult.reason === "rate" ? "missing unit rate" : calcResult.reason === "size" ? "missing dimensions" : `incomplete ${calcResult.reason}`;
          return {
            error: `Cannot create customer quote: "${prodName}" has ${reasonDetail}`,
            reason: calcResult.reason,
            productTitle: prodName,
          };
        }

        if (calcResult.status === "ok" && calcResult.total !== null) {
          if (!Number.isFinite(calcResult.total) || calcResult.total > MAX_MONEY) {
            reply.status(400);
            return { error: `"${line.product_title || line.productTitle || "Signage item"}" has a total that looks too large. Please check the size and rate.` };
          }
          computedSubtotal += calcResult.total;
        }

        processedLines.push({
          id: line.id ? `${quoteId}-${line.id}` : `line-${quoteId}-${processedLines.length + 1}`,
          quoteId: quoteId,
          siteId: site.id || null,
          siteName: site.siteName || null,
          productTitle: line.product_title || line.productTitle || "Signage Product",
          materialName: line.material_name || line.materialName || null,
          finishName: line.finish_name || line.finishName || null,
          methodCode: code,
          methodName: method.name,
          rateLabel: method.rate_label,
          width: width,
          height: height,
          quantity: method.type === "fixed" ? 1 : quantity,
          rate: rate,
          discountPct: discountPct,
          billableQty: calcResult.billableQty,
          total: calcResult.total,
          sortOrder: i + 1,
        });
      }
    }

    const finalStatus = action === "create" ? "Sent" : quoteStatus;
    const finalSubtotal = roundHalfUp(computedSubtotal, 2);
    const { grandTotal: finalGrandTotal } = computeQuoteTotals({
      sitesSubtotal: finalSubtotal,
      designCharges,
      installationCharges,
      transportCost,
      discountPercent,
      gstRate,
    });

    // Save through tenant-scoped repository
    try {
      await repo.quotations.save(
        req.tenantId,
        quoteId,
        {
          customerId: effectiveCustomerId,
          quoteNumber,
          quoteDate,
          finalStatus,
          finalSubtotal,
          transportCost,
          designCharges,
          installationCharges,
          discountPercent,
          gstRate,
          finalGrandTotal,
          notesJson,
        },
        processedLines
      );
    } catch (err) {
      req.log?.error(err);
      if (err.statusCode === 409) {
        // The quote id belongs to another shop: nothing was changed.
        reply.status(409);
        return { error: err.message };
      }
      reply.status(500);
      return {
        error: `Failed to save quotation to database: ${err.message}`,
      };
    }

    return {
      quoteId,
      quoteNumber,
      grandTotal: finalGrandTotal,
      status: finalStatus,
      lines: processedLines,
    };
  });
}
