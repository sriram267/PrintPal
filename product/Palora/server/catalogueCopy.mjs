import { assertTenantId, DEFAULT_TENANT_ID } from "./tenantContext.mjs";

/**
 * Catalogue Copy-on-Signup Foundation (Phase 2.E)
 *
 * Copies the seed/pilot catalogue (materials, finishes, products) from a source tenant
 * (defaulting to 'org_legacy_default') to a target tenant.
 *
 * Requirements:
 * 1. Preserves all field values (descriptions, specs, variants, pricing units, notes).
 * 2. Re-establishes foreign relationships: maps old material/finish IDs to new tenant-scoped IDs
 *    and updates JSON arrays (`material_ids`, `finish_ids`) on copied products.
 * 3. Completely generic: does not assume row counts, specific codes, or hardcoded titles.
 * 4. Idempotent guard: if target tenant already has catalogue records, it safely returns
 *    without duplicating or corrupting data unless `force: true` is provided.
 */
export async function copyCatalogueForTenant(pg, targetTenantId, sourceTenantId = DEFAULT_TENANT_ID, options = {}) {
  assertTenantId(targetTenantId);
  assertTenantId(sourceTenantId);

  const { force = false } = options;

  // 1. Idempotency Guard: Check if target tenant already has catalogue data
  const existingCheck = await pg.query(
    `SELECT 
      (SELECT COUNT(*) FROM materials WHERE tenant_id = $1 AND deleted_at IS NULL) as mat_count,
      (SELECT COUNT(*) FROM finishes WHERE tenant_id = $1 AND deleted_at IS NULL) as fin_count,
      (SELECT COUNT(*) FROM products WHERE tenant_id = $1 AND deleted_at IS NULL) as prod_count`,
    [targetTenantId]
  );

  const matCount = Number(existingCheck.rows[0]?.mat_count || 0);
  const finCount = Number(existingCheck.rows[0]?.fin_count || 0);
  const prodCount = Number(existingCheck.rows[0]?.prod_count || 0);

  if (!force && (matCount > 0 || finCount > 0 || prodCount > 0)) {
    return {
      success: true,
      copied: false,
      message: `Catalogue already initialized for tenant '${targetTenantId}' (${prodCount} products, ${matCount} materials, ${finCount} finishes).`,
      counts: { materials: matCount, finishes: finCount, products: prodCount },
    };
  }

  // 2. Fetch all source materials, finishes, products generically
  const sourceMats = await pg.query(
    "SELECT * FROM materials WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC",
    [sourceTenantId]
  );
  const sourceFins = await pg.query(
    "SELECT * FROM finishes WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC",
    [sourceTenantId]
  );
  const sourceProds = await pg.query(
    "SELECT * FROM products WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC",
    [sourceTenantId]
  );

  // ID translation maps: oldId -> newId
  const matIdMap = new Map();
  const finIdMap = new Map();
  const prodIdMap = new Map();

  // Helper to generate a clean, unique ID scoped to tenant
  // Handles alphanumeric base IDs like 'M01', 'F01', 'PR01'
  function generateNewId(prefix, oldId, tenantId) {
    const cleanTenant = tenantId.replace(/[^a-zA-Z0-9_]/g, "_");
    return `${cleanTenant}_${oldId}`;
  }

  // 3. Copy Materials
  let materialsCopied = 0;
  for (const m of sourceMats.rows) {
    const newId = generateNewId("mat", m.id, targetTenantId);
    matIdMap.set(m.id, newId);

    await pg.query(
      `INSERT INTO materials (
        id, tenant_id, name, also_called, family, category, unit, variants,
        thickness, standard_size, indoor, outdoor, coastal, coastal_basis,
        supplier_name, research_confidence, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
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
        newId,
        targetTenantId,
        m.name,
        m.also_called,
        m.family,
        m.category,
        m.unit,
        m.variants,
        m.thickness,
        m.standard_size,
        m.indoor,
        m.outdoor,
        m.coastal,
        m.coastal_basis,
        m.supplier_name,
        m.research_confidence,
        m.notes,
      ]
    );
    materialsCopied++;
  }

  // 4. Copy Finishes
  let finishesCopied = 0;
  for (const f of sourceFins.rows) {
    const newId = generateNewId("fin", f.id, targetTenantId);
    finIdMap.set(f.id, newId);

    await pg.query(
      `INSERT INTO finishes (
        id, tenant_id, name, also_called, type, works_on, variants,
        indoor, outdoor, coastal, cost_effect, lead_time_impact,
        color_code, research_confidence, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
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
        updated_at = NOW()`,
      [
        newId,
        targetTenantId,
        f.name,
        f.also_called,
        f.type,
        f.works_on,
        f.variants,
        f.indoor,
        f.outdoor,
        f.coastal,
        f.cost_effect,
        f.lead_time_impact,
        f.color_code,
        f.research_confidence,
        f.notes,
      ]
    );
    finishesCopied++;
  }

  // 5. Copy Products (with remapped material_ids and finish_ids)
  let productsCopied = 0;
  for (const p of sourceProds.rows) {
    const newId = generateNewId("prod", p.id, targetTenantId);
    prodIdMap.set(p.id, newId);

    // Map old material IDs in JSON array to new IDs
    let mappedMaterialIds = [];
    if (Array.isArray(p.material_ids)) {
      mappedMaterialIds = p.material_ids.map((id) => matIdMap.get(id) || id);
    } else if (typeof p.material_ids === "string") {
      try {
        const parsed = JSON.parse(p.material_ids);
        if (Array.isArray(parsed)) {
          mappedMaterialIds = parsed.map((id) => matIdMap.get(id) || id);
        }
      } catch {}
    }

    // Map old finish IDs in JSON array to new IDs
    let mappedFinishIds = [];
    if (Array.isArray(p.finish_ids)) {
      mappedFinishIds = p.finish_ids.map((id) => finIdMap.get(id) || id);
    } else if (typeof p.finish_ids === "string") {
      try {
        const parsed = JSON.parse(p.finish_ids);
        if (Array.isArray(parsed)) {
          mappedFinishIds = parsed.map((id) => finIdMap.get(id) || id);
        }
      } catch {}
    }

    await pg.query(
      `INSERT INTO products (
        id, tenant_id, title, also_called, category, description,
        priced_per, also_priced_by, size_range, lighting, needs_installation,
        lead_time, material_ids, finish_ids, is_active, width, height,
        unit, material, finishing, application, production_type,
        research_confidence, notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW()
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
        width = EXCLUDED.width,
        height = EXCLUDED.height,
        unit = EXCLUDED.unit,
        material = EXCLUDED.material,
        finishing = EXCLUDED.finishing,
        application = EXCLUDED.application,
        production_type = EXCLUDED.production_type,
        research_confidence = EXCLUDED.research_confidence,
        notes = EXCLUDED.notes,
        updated_at = NOW()`,
      [
        newId,
        targetTenantId,
        p.title,
        p.also_called,
        p.category,
        p.description,
        p.priced_per,
        p.also_priced_by,
        p.size_range,
        p.lighting,
        p.needs_installation,
        p.lead_time,
        JSON.stringify(mappedMaterialIds),
        JSON.stringify(mappedFinishIds),
        p.is_active ?? true,
        p.width,
        p.height,
        p.unit || "mm",
        p.material,
        p.finishing,
        p.application || "Outdoor",
        p.production_type || "INTERNAL",
        p.research_confidence,
        p.notes,
      ]
    );
    productsCopied++;
  }

  return {
    success: true,
    copied: true,
    targetTenantId,
    sourceTenantId,
    counts: {
      materials: materialsCopied,
      finishes: finishesCopied,
      products: productsCopied,
    },
    idMappings: {
      materials: Object.fromEntries(matIdMap),
      finishes: Object.fromEntries(finIdMap),
      products: Object.fromEntries(prodIdMap),
    },
  };
}
