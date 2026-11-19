/**
 * Database: Materials: list, get, save, delete.
 * Every query is scoped to the signed-in shop (tenant) and runs syncRls first, so row-level security applies.
 * Moved unchanged from server/repository.mjs (restructure A2).
 */
export function createMaterialsDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM materials WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY id ASC",
        [tenantId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        name: row.name,
        alsoCalled: row.also_called || "",
        family: row.family || "",
        category: row.category || row.family || "Substrate",
        unit: row.unit || "Per sq ft",
        variants: row.variants || "",
        thickness: row.thickness || "",
        standardSize: row.standard_size || "",
        indoor: Boolean(row.indoor),
        outdoor: Boolean(row.outdoor),
        coastal: Boolean(row.coastal),
        coastalBasis: row.coastal_basis || "",
        supplierName: row.supplier_name || "National Mill Stock",
        researchConfidence: row.research_confidence || "High",
        notes: row.notes || "",
        createdAt: row.created_at,
      }));
    },

    async getById(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM materials WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL",
        [tenantId, id]
      );
      return res.rows[0] || null;
    },

    async save(tenantId, body) {
      await syncRls(tenantId);
      const id = body.id || `M${Date.now()}`;
      const name = body.name?.trim() || "Untitled Material";
      const alsoCalled = body.alsoCalled?.trim() || "";
      const family = body.family?.trim() || "";
      const category = body.category?.trim() || family || "Substrate";
      const unit = body.unit?.trim() || "Per sq ft";
      const variants = body.variants?.trim() || "";
      const thickness = body.thickness?.trim() || "";
      const standardSize = body.standardSize?.trim() || "";
      const indoor = body.indoor !== false;
      const outdoor = body.outdoor !== false;
      const coastal = body.coastal !== false;
      const coastalBasis = body.coastalBasis?.trim() || "";
      const supplierName = body.supplierName?.trim() || "";
      const researchConfidence = body.researchConfidence?.trim() || "High";
      const notes = body.notes?.trim() || "";
      const createdAt = body.createdAt || new Date().toISOString();

      await pg.query(
        `INSERT INTO materials (
          id, tenant_id, name, also_called, family, category, unit, variants,
          thickness, standard_size, indoor, outdoor, coastal, coastal_basis,
          supplier_name, research_confidence, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          name = EXCLUDED.name,
          also_called = EXCLUDED.also_called,
          family = EXCLUDED.family,
          category = EXCLUDED.category,
          unit = EXCLUDED.unit,
          variants = EXCLUDED.variants,
          thickness = EXCLUDED.thickness,
          standard_size = EXCLUDED.standard_size,
          indoor = EXCLUDED.indoor,
          outdoor = EXCLUDED.outdoor,
          coastal = EXCLUDED.coastal,
          coastal_basis = EXCLUDED.coastal_basis,
          supplier_name = EXCLUDED.supplier_name,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes,
          updated_at = NOW()`,
        [
          id, tenantId, name, alsoCalled, family, category, unit, variants,
          thickness, standardSize, indoor, outdoor, coastal, coastalBasis,
          supplierName, researchConfidence, notes, createdAt
        ]
      );
      return { id, success: true };
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "UPDATE materials SET deleted_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0 };
    },
  };
}
