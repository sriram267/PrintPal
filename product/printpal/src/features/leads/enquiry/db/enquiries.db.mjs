/**
 * Database: Enquiries: list, save, delete.
 * Every query is scoped to the signed-in shop (tenant) and runs syncRls first, so row-level security applies.
 * Moved unchanged from server/repository.mjs (restructure A2).
 */
export function createEnquiriesDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM enquiries WHERE tenant_id = $1 ORDER BY created_at DESC",
        [tenantId]
      );
      return res.rows.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        contactName: row.contact_name,
        phone: row.phone,
        email: row.email || "",
        address: row.address || "",
        source: row.source || "WHATSAPP",
        stage: row.stage || "NEW",
        inquiryNote: row.inquiry_note,
        hasVectorLogo: Boolean(row.has_vector_logo),
        wallSubstrate: row.wall_substrate || "CONCRETE",
        mountingHeightFt: row.mounting_height_ft ? Number(row.mounting_height_ft) : 10,
        hasPowerPoint: Boolean(row.has_power_point),
        followUpDate: row.follow_up_date || "",
        createdAt: row.created_at,
      }));
    },

    async save(tenantId, body) {
      await syncRls(tenantId);
      const id = body.id || `enq-${Date.now()}`;
      const contactName = body.contactName?.trim() || "New Lead";
      const phone = body.phone?.trim() || "";
      const email = body.email?.trim() || "";
      const address = body.address?.trim() || "";
      const source = body.source || "WHATSAPP";
      const stage = body.stage || (body.followUpDate ? "NEEDS_FOLLOW_UP" : "NEW");
      const inquiryNote = body.inquiryNote?.trim() || "Inquiry intake";
      const hasVectorLogo = Boolean(body.hasVectorLogo);
      const wallSubstrate = body.wallSubstrate || "CONCRETE";
      const mountingHeightFt = body.mountingHeightFt || 10;
      const hasPowerPoint = Boolean(body.hasPowerPoint);
      const followUpDate = body.followUpDate?.trim() || null;
      const createdAt = body.createdAt || new Date().toISOString();

      await pg.query(
        `INSERT INTO enquiries (
          id, tenant_id, contact_name, phone, email, address, source, stage,
          inquiry_note, has_vector_logo, wall_substrate, mounting_height_ft,
          has_power_point, follow_up_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          contact_name = EXCLUDED.contact_name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          stage = EXCLUDED.stage,
          inquiry_note = EXCLUDED.inquiry_note,
          follow_up_date = EXCLUDED.follow_up_date,
          updated_at = NOW()`,
        [
          id, tenantId, contactName, phone, email, address, source, stage,
          inquiryNote, hasVectorLogo, wallSubstrate, mountingHeightFt,
          hasPowerPoint, followUpDate, createdAt
        ]
      );
      return { id, success: true };
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "DELETE FROM enquiries WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0 };
    },
  };
}
