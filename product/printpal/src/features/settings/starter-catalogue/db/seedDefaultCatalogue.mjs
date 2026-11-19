/* At start-up: (re)load the pilot catalogue (seedData.json) into the template shop (org_legacy_default), which
   every new shop copies at sign-up. Everything here runs as the template shop only, in one transaction. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { DEFAULT_TENANT_ID } from "../../../../shared/server/tenantContext.mjs";
import { withTenant } from "../../../../shared/server/tenantSession.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function seedDatabaseFromCatalogue(pg) {
  try {
    const seedPath = path.resolve(__dirname, "seedData.json");
    if (!fs.existsSync(seedPath)) {
      console.warn("[DB Seed] seedData.json not found at:", seedPath);
      return;
    }
    const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

    await withTenant(pg, DEFAULT_TENANT_ID, async (tx) => {
      // Purge legacy mock IDs from the TEMPLATE shop only. (Until 20 Nov 2026 this ran across every shop and, on
      // every server start, deleted the products, materials and finishes that shops had added themselves, because
      // the screens give those ids that also start with prod- / mat- / fin-.)
      await tx.query("DELETE FROM products WHERE tenant_id = $1 AND id LIKE 'prod-%'", [DEFAULT_TENANT_ID]);
      await tx.query("DELETE FROM materials WHERE tenant_id = $1 AND id LIKE 'mat-%'", [DEFAULT_TENANT_ID]);
      await tx.query("DELETE FROM finishes WHERE tenant_id = $1 AND id LIKE 'fin-%'", [DEFAULT_TENANT_ID]);

      const pr01Res = await tx.query(
        "SELECT COUNT(*) AS count FROM products WHERE id = 'PR01' AND tenant_id = $1 AND deleted_at IS NULL",
        [DEFAULT_TENANT_ID]
      );
      const hasPilotCatalogue = Number(pr01Res.rows[0]?.count || 0) > 0;

      const matCheck = await tx.query(
        "SELECT COUNT(*) AS count FROM materials WHERE tenant_id = $1 AND deleted_at IS NULL",
        [DEFAULT_TENANT_ID]
      );
      const matCount = Number(matCheck.rows[0]?.count || 0);

      const finCheck = await tx.query(
        "SELECT COUNT(*) AS count FROM finishes WHERE tenant_id = $1 AND deleted_at IS NULL",
        [DEFAULT_TENANT_ID]
      );
      const finCount = Number(finCheck.rows[0]?.count || 0);

      console.log(`[DB Seed] Ingesting pilot catalogue for ${DEFAULT_TENANT_ID} (PR01 exists: ${hasPilotCatalogue}, mats: ${matCount}, fins: ${finCount})...`);

      // Each upsert only ever updates the template's own row (WHERE ... tenant_id), never another shop's.
      for (const mat of seedData.materials) {
        await tx.query(
          `INSERT INTO materials (
            id, tenant_id, name, also_called, family, category, unit, variants,
            thickness, standard_size, indoor, outdoor, coastal, coastal_basis,
            supplier_name, research_confidence, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            also_called = EXCLUDED.also_called,
            family = EXCLUDED.family,
            category = EXCLUDED.category,
            unit = EXCLUDED.unit,
            variants = EXCLUDED.variants,
            indoor = EXCLUDED.indoor,
            outdoor = EXCLUDED.outdoor,
            coastal = EXCLUDED.coastal,
            coastal_basis = EXCLUDED.coastal_basis,
            research_confidence = EXCLUDED.research_confidence,
            notes = EXCLUDED.notes
          WHERE materials.tenant_id = EXCLUDED.tenant_id;`,
          [
            mat.id, DEFAULT_TENANT_ID, mat.name, mat.alsoCalled, mat.family, mat.category, mat.unit, mat.variants,
            (mat.variants || "").split(".")[0] || "", "8 x 4 ft standard",
            mat.indoor ?? true, mat.outdoor ?? true, mat.coastal ?? true, mat.coastalBasis || "Standard basis",
            mat.supplierName || "Direct / Local Distributor", mat.researchConfidence || "High", mat.notes || ""
          ]
        );
      }

      for (const fin of seedData.finishes) {
        await tx.query(
          `INSERT INTO finishes (
            id, tenant_id, name, also_called, type, works_on, variants,
            indoor, outdoor, coastal, cost_effect, lead_time_impact,
            color_code, research_confidence, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
            notes = EXCLUDED.notes
          WHERE finishes.tenant_id = EXCLUDED.tenant_id;`,
          [
            fin.id, DEFAULT_TENANT_ID, fin.name, fin.alsoCalled, fin.type, fin.worksOn, fin.variants,
            fin.indoor ?? true, fin.outdoor ?? true, fin.coastal || "Moderate",
            fin.costEffect || "Standard", fin.leadTimeImpact || "Standard",
            fin.colorCode || "#000000", fin.researchConfidence || "High", fin.notes || ""
          ]
        );
      }

      for (const prod of seedData.products) {
        await tx.query(
          `INSERT INTO products (
            id, tenant_id, title, also_called, category, description,
            priced_per, also_priced_by, size_range, lighting,
            needs_installation, lead_time, material_ids, finish_ids,
            is_active, width, height, unit, material, finishing,
            application, production_type, research_confidence, notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24
          )
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
            research_confidence = EXCLUDED.research_confidence,
            notes = EXCLUDED.notes
          WHERE products.tenant_id = EXCLUDED.tenant_id;`,
          [
            prod.id, DEFAULT_TENANT_ID, prod.title, prod.alsoCalled, prod.category, prod.description,
            prod.pricedPer || "Per letter", prod.alsoPricedBy || "Per sq ft", prod.sizeRange || "12 - 48 in",
            prod.lighting || "Backlit LED", prod.needsInstallation || "Recommended", prod.leadTime || "5-7 days",
            JSON.stringify(prod.materialIds || []), JSON.stringify(prod.finishIds || []), true,
            "1200", "300", "mm", prod.category || "Fabricated Signage", "Standard Finish",
            "Outdoor", "INTERNAL", prod.researchConfidence || "High", prod.notes || ""
          ]
        );
      }
    });
  } catch (err) {
    console.error("[DB Seed Error]:", err.message);
  }
}
