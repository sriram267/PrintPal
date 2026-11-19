/**
 * Database: Finishes: list, get, save, delete.
 * Runs inside the shop's own transaction (src/shared/server/tenantSession.mjs). Every query is scoped to the shop,
 * and a save never overwrites a row that belongs to another shop.
 */
import { assertSaved } from "../../../../shared/server/tenantSession.mjs";
import { newId } from "../../../../shared/server/newId.mjs";

export function createFinishesDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM finishes WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY id ASC",
        [tenantId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        name: row.name,
        alsoCalled: row.also_called || "",
        type: row.type || "Surface finish",
        worksOn: row.works_on || "",
        variants: row.variants || "",
        indoor: Boolean(row.indoor),
        outdoor: Boolean(row.outdoor),
        coastal: row.coastal || "Limited",
        costEffect: row.cost_effect || "",
        leadTimeImpact: row.lead_time_impact || "",
        colorCode: row.color_code || "",
        researchConfidence: row.research_confidence || "High",
        notes: row.notes || "",
        createdAt: row.created_at,
      }));
    },

    async getById(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM finishes WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL",
        [tenantId, id]
      );
      return res.rows[0] || null;
    },

    async save(tenantId, body) {
      await syncRls(tenantId);
      const id = body.id || newId("fin");
      const name = body.name?.trim() || "Untitled Finish";
      const alsoCalled = body.alsoCalled?.trim() || "";
      const type = body.type?.trim() || "Surface finish";
      const worksOn = body.worksOn?.trim() || "";
      const variants = body.variants?.trim() || "";
      const indoor = body.indoor !== false;
      const outdoor = body.outdoor !== false;
      const coastal = body.coastal?.trim() || "Limited";
      const costEffect = body.costEffect?.trim() || "";
      const leadTimeImpact = body.leadTimeImpact?.trim() || "";
      const colorCode = body.colorCode?.trim() || "";
      const researchConfidence = body.researchConfidence?.trim() || "High";
      const notes = body.notes?.trim() || "";
      const createdAt = body.createdAt || new Date().toISOString();

      assertSaved(await pg.query(
        `INSERT INTO finishes (
          id, tenant_id, name, also_called, type, works_on, variants, indoor,
          outdoor, coastal, cost_effect, lead_time_impact, color_code,
          research_confidence, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          also_called = EXCLUDED.also_called,
          type = EXCLUDED.type,
          works_on = EXCLUDED.works_on,
          variants = EXCLUDED.variants,
          indoor = EXCLUDED.indoor,
          outdoor = EXCLUDED.outdoor,
          coastal = EXCLUDED.coastal,
          cost_effect = EXCLUDED.cost_effect,
          lead_time_impact = EXCLUDED.lead_time_impact,
          color_code = EXCLUDED.color_code,
          research_confidence = EXCLUDED.research_confidence,
          notes = EXCLUDED.notes,
          updated_at = NOW()
        WHERE finishes.tenant_id = EXCLUDED.tenant_id
        RETURNING id`,
        [
          id, tenantId, name, alsoCalled, type, worksOn, variants, indoor,
          outdoor, coastal, costEffect, leadTimeImpact, colorCode,
          researchConfidence, notes, createdAt
        ]
      ));
      return { id, success: true };
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "UPDATE finishes SET deleted_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0 };
    },
  };
}
