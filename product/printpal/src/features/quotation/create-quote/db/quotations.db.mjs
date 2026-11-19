/**
 * Database: Quotations and their lines: list, get, save, finalize, delete. Used by Create quote and Quotation reports.
 * Runs inside the shop's own transaction (src/shared/server/tenantSession.mjs), so a quote and its lines save
 * together or not at all. Every query is scoped to the shop, and a save never overwrites another shop's quote.
 */
import { assertSaved } from "../../../../shared/server/tenantSession.mjs";

export function createQuotationsDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const qRes = await pg.query(
        `SELECT q.*,
                COALESCE(c.company_name, c.contact_person, 'Customer') AS customer_name,
                c.contact_person,
                c.phone,
                c.email,
                c.billing_address,
                c.gstin
         FROM quotations q
         LEFT JOIN customers c ON q.tenant_id = c.tenant_id AND q.customer_id = c.id
         WHERE q.tenant_id = $1
         ORDER BY q.created_at DESC`,
        [tenantId]
      );
      const quotes = qRes.rows;
      for (const q of quotes) {
        const linesRes = await pg.query(
          "SELECT * FROM quote_lines WHERE tenant_id = $1 AND quote_id = $2 ORDER BY sort_order ASC",
          [tenantId, q.id]
        );
        q.lines = linesRes.rows;
        q.sites = this._groupLinesIntoSites(linesRes.rows);
      }
      return quotes;
    },

    _groupLinesIntoSites(lines) {
      const siteMap = new Map();
      for (const line of lines) {
        const siteKey = line.site_id || line.site_name || "default-site";
        if (!siteMap.has(siteKey)) {
          siteMap.set(siteKey, {
            id: line.site_id || `site-${siteMap.size + 1}`,
            siteName: line.site_name || `Site ${siteMap.size + 1}`,
            address: "",
            isExpanded: true,
            items: [],
          });
        }
        const s = siteMap.get(siteKey);
        s.items.push({
          id: line.id,
          productTitle: line.product_title || "Signage Product",
          product_title: line.product_title || "Signage Product",
          materialName: line.material_name || "",
          material_name: line.material_name || "",
          finishName: line.finish_name || "",
          finish_name: line.finish_name || "",
          methodCode: line.method_code || "sq_ft",
          method_code: line.method_code || "sq_ft",
          methodName: line.method_name || "Square Feet",
          rateLabel: line.rate_label || "per sq ft",
          width: line.width != null ? Number(line.width) : null,
          height: line.height != null ? Number(line.height) : null,
          quantity: line.quantity ? Number(line.quantity) : 1,
          qty: line.quantity ? Number(line.quantity) : 1,
          rate: line.rate != null ? Number(line.rate) : null,
          price: line.rate != null ? Number(line.rate) : null,
          discount: line.discount_pct != null ? Number(line.discount_pct) : 0,
          discountPct: line.discount_pct != null ? Number(line.discount_pct) : 0,
          billableQty: line.billable_qty != null ? Number(line.billable_qty) : null,
          total: line.total != null ? Number(line.total) : null,
          status: "ok",
        });
      }
      return Array.from(siteMap.values());
    },

    async getById(tenantId, id) {
      await syncRls(tenantId);
      const qRes = await pg.query(
        `SELECT q.*,
                COALESCE(c.company_name, c.contact_person, 'Customer') AS customer_name,
                c.contact_person,
                c.phone,
                c.email,
                c.billing_address,
                c.gstin
         FROM quotations q
         LEFT JOIN customers c ON q.tenant_id = c.tenant_id AND q.customer_id = c.id
         WHERE q.tenant_id = $1 AND q.id = $2`,
        [tenantId, id]
      );
      if (qRes.rows.length === 0) return null;
      const quote = qRes.rows[0];
      const linesRes = await pg.query(
        "SELECT * FROM quote_lines WHERE tenant_id = $1 AND quote_id = $2 ORDER BY sort_order ASC",
        [tenantId, id]
      );
      quote.lines = linesRes.rows;
      quote.sites = this._groupLinesIntoSites(linesRes.rows);
      return quote;
    },

    async getByQuoteNumber(tenantId, quoteNumber) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM quotations WHERE tenant_id = $1 AND quote_number = $2",
        [tenantId, quoteNumber]
      );
      if (!res.rows || res.rows.length === 0) return null;
      const row = res.rows[0];
      row.tenantId = row.tenant_id;
      row.grandTotal = Number(row.grand_total);
      return row;
    },

    async save(tenantId, quoteId, fields, processedLines) {
      await syncRls(tenantId);
      const {
        customerId,
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
      } = fields;

      assertSaved(await pg.query(
        `INSERT INTO quotations (
          id, tenant_id, customer_id, quote_number, quote_date, quote_status,
          subtotal, transport_cost, design_charges, installation_charges,
          discount_percent, gst_rate, grand_total, notes_json, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (id) DO UPDATE SET
          quote_number = EXCLUDED.quote_number,
          quote_status = EXCLUDED.quote_status,
          subtotal = EXCLUDED.subtotal,
          transport_cost = EXCLUDED.transport_cost,
          design_charges = EXCLUDED.design_charges,
          installation_charges = EXCLUDED.installation_charges,
          discount_percent = EXCLUDED.discount_percent,
          gst_rate = EXCLUDED.gst_rate,
          grand_total = EXCLUDED.grand_total,
          notes_json = EXCLUDED.notes_json,
          updated_at = NOW()
        WHERE quotations.tenant_id = EXCLUDED.tenant_id
        RETURNING id`,
        [
          quoteId, tenantId, customerId, quoteNumber, quoteDate, finalStatus,
          finalSubtotal, transportCost, designCharges, installationCharges,
          discountPercent, gstRate, finalGrandTotal, JSON.stringify(notesJson)
        ]
      ));

      // Delete lines strictly for this tenant and quote
      await pg.query(
        "DELETE FROM quote_lines WHERE tenant_id = $1 AND quote_id = $2",
        [tenantId, quoteId]
      );

      for (const pl of processedLines) {
        assertSaved(await pg.query(
          `INSERT INTO quote_lines (
            id, tenant_id, quote_id, site_id, site_name, product_title, material_name, finish_name,
            method_code, method_name, rate_label, width, height, quantity, rate,
            discount_pct, billable_qty, total, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO UPDATE SET
            site_id = EXCLUDED.site_id,
            site_name = EXCLUDED.site_name,
            product_title = EXCLUDED.product_title,
            material_name = EXCLUDED.material_name,
            finish_name = EXCLUDED.finish_name,
            method_code = EXCLUDED.method_code,
            method_name = EXCLUDED.method_name,
            rate_label = EXCLUDED.rate_label,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            quantity = EXCLUDED.quantity,
            rate = EXCLUDED.rate,
            discount_pct = EXCLUDED.discount_pct,
            billable_qty = EXCLUDED.billable_qty,
            total = EXCLUDED.total,
            sort_order = EXCLUDED.sort_order
          WHERE quote_lines.tenant_id = EXCLUDED.tenant_id
          RETURNING id`,
          [
            pl.id, tenantId, quoteId, pl.siteId, pl.siteName, pl.productTitle, pl.materialName, pl.finishName,
            pl.methodCode, pl.methodName, pl.rateLabel, pl.width, pl.height, pl.quantity, pl.rate,
            pl.discountPct, pl.billableQty, pl.total, pl.sortOrder
          ]
        ));
      }

      return { success: true, quoteId };
    },

    /** Newest quotation row (by created_at) for a customer, or null. */
    async getLatestForCustomer(tenantId, customerId) {
      await syncRls(tenantId);
      const res = await pg.query(
        `SELECT id, quote_number, quote_status FROM quotations
         WHERE tenant_id = $1 AND customer_id = $2
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [tenantId, customerId]
      );
      return res.rows[0] || null;
    },

    async getRow(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT id, customer_id, quote_number, quote_status FROM quotations WHERE tenant_id = $1 AND id = $2",
        [tenantId, id]
      );
      return res.rows[0] || null;
    },

    /** Flip a quotation between 'Sent' (open) and 'Invoice' (finalized). */
    async setFinalized(tenantId, id, finalized) {
      await syncRls(tenantId);
      const res = await pg.query(
        `UPDATE quotations SET quote_status = $3, updated_at = NOW()
         WHERE tenant_id = $1 AND id = $2 RETURNING id, quote_status`,
        [tenantId, id, finalized ? "Invoice" : "Sent"]
      );
      return res.rows[0] || null;
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      await pg.query(
        "DELETE FROM quote_lines WHERE tenant_id = $1 AND quote_id = $2",
        [tenantId, id]
      );
      const res = await pg.query(
        "DELETE FROM quotations WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0, deletedId: id };
    },
  };
}
