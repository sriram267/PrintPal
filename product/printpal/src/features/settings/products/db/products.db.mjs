/**
 * Database: Catalogue products: list, get, save, delete.
 * Runs inside the shop's own transaction (src/shared/server/tenantSession.mjs). Every query is scoped to the shop,
 * and a save never overwrites a row that belongs to another shop.
 */
import { assertSaved } from "../../../../shared/server/tenantSession.mjs";
import { newId } from "../../../../shared/server/newId.mjs";

export function createProductsDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM products WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY id ASC",
        [tenantId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        title: row.title,
        alsoCalled: row.also_called || "",
        category: row.category || "Fabricated Signage",
        description: row.description || "",
        pricedPer: row.priced_per || "Per letter",
        alsoPricedBy: row.also_priced_by || "",
        sizeRange: row.size_range || "",
        lighting: row.lighting || "No",
        needsInstallation: row.needs_installation || "",
        leadTime: row.lead_time || "",
        materialIds: typeof row.material_ids === "string" ? JSON.parse(row.material_ids) : row.material_ids || [],
        finishIds: typeof row.finish_ids === "string" ? JSON.parse(row.finish_ids) : row.finish_ids || [],
        isActive: row.is_active !== false,
        width: row.width || "",
        height: row.height || "",
        unit: row.unit || "mm",
        material: row.material || "",
        finishing: row.finishing || "",
        application: row.application || "Outdoor",
        productionType: row.production_type || "INTERNAL",
        researchConfidence: row.research_confidence || "High",
        notes: row.notes || "",
        createdAt: row.created_at,
      }));
    },

    async getById(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM products WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL",
        [tenantId, id]
      );
      return res.rows[0] || null;
    },

    async save(tenantId, body) {
      await syncRls(tenantId);
      const id = body.id || newId("prod");
      const title = body.title?.trim() || "Untitled Product";
      const alsoCalled = body.alsoCalled?.trim() || "";
      const category = body.category?.trim() || "Fabricated Signage";
      const description = body.description?.trim() || "";
      const pricedPer = body.pricedPer || "Per letter";
      const alsoPricedBy = body.alsoPricedBy?.trim() || "";
      const sizeRange = body.sizeRange?.trim() || "";
      const lighting = body.lighting?.trim() || "No";
      const needsInstallation = body.needsInstallation?.trim() || "";
      const leadTime = body.leadTime?.trim() || "";
      const materialIds = JSON.stringify(body.materialIds || []);
      const finishIds = JSON.stringify(body.finishIds || []);
      const isActive = body.isActive !== false;
      const width = body.width ? String(body.width).trim() : "";
      const height = body.height ? String(body.height).trim() : "";
      const unit = body.unit?.trim() || "mm";
      const material = body.material?.trim() || "";
      const finishing = body.finishing?.trim() || "";
      const application = body.application || "Outdoor";
      const productionType = body.productionType || "INTERNAL";
      const researchConfidence = body.researchConfidence?.trim() || "High";
      const notes = body.notes?.trim() || "";
      const createdAt = body.createdAt || new Date().toISOString();

      assertSaved(await pg.query(
        `INSERT INTO products (
          id, tenant_id, title, also_called, category, description,
          priced_per, also_priced_by, size_range, lighting,
          needs_installation, lead_time, material_ids, finish_ids,
          is_active, width, height, unit, material, finishing,
          application, production_type, research_confidence, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          also_called = EXCLUDED.also_called,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          priced_per = EXCLUDED.priced_per,
          also_priced_by = EXCLUDED.also_priced_by,
          size_range = EXCLUDED.size_range,
          lighting = EXCLUDED.lighting,
          needs_installation = EXCLUDED.needs_installation,
          lead_time = EXCLUDED.lead_time,
          material_ids = EXCLUDED.material_ids,
          finish_ids = EXCLUDED.finish_ids,
          is_active = EXCLUDED.is_active,
          width = EXCLUDED.width,
          height = EXCLUDED.height,
          unit = EXCLUDED.unit,
          material = EXCLUDED.material,
          finishing = EXCLUDED.finishing,
          application = EXCLUDED.application,
          production_type = EXCLUDED.production_type,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        WHERE products.tenant_id = EXCLUDED.tenant_id
        RETURNING id`,
        [
          id, tenantId, title, alsoCalled, category, description,
          pricedPer, alsoPricedBy, sizeRange, lighting,
          needsInstallation, leadTime, materialIds, finishIds,
          isActive, width, height, unit, material, finishing,
          application, productionType, researchConfidence, notes, createdAt
        ]
      ));
      return { id, success: true };
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "UPDATE products SET deleted_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0 };
    },
  };
}
