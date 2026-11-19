/**
 * Database: The shop's business details (one row per shop).
 * Every query is scoped to the signed-in shop (tenant) and runs syncRls first, so row-level security applies.
 * Moved unchanged from server/repository.mjs (restructure A2).
 */
export function createBusinessDetailsDb(pg, syncRls) {
  return {
    async get(tenantId) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM business_details WHERE tenant_id = $1 LIMIT 1",
        [tenantId]
      );
      if (!res.rows || res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        tenantId: r.tenant_id,
        logoUrl: r.logo_url || "",
        legalName: r.legal_name || "PrintPal",
        addressLine1: r.address_line1 || "",
        addressLine2: r.address_line2 || "",
        city: r.city || "",
        state: r.state || "",
        pincode: r.pincode || "",
        country: r.country || "India",
        gstin: r.gstin || "",
        defaultTaxId: r.default_tax_id || "",
        pan: r.pan || "",
        phone: r.phone || "",
        email: r.email || "",
        website: r.website || "",
        signatoryName: r.signatory_name || "",
        signatureUrl: r.signature_url || "",
        defaultTerms: r.default_terms || "",
        updatedAt: r.updated_at,
      };
    },

    async upsert(tenantId, body) {
      await syncRls(tenantId);
      const {
        logoUrl = "",
        legalName = "",
        addressLine1 = "",
        addressLine2 = "",
        city = "",
        state = "",
        pincode = "",
        country = "India",
        gstin = "",
        defaultTaxId = "",
        pan = "",
        phone = "",
        email = "",
        website = "",
        signatoryName = "",
        signatureUrl = "",
        defaultTerms = "",
      } = body;

      const id = `biz-${tenantId}`;

      await pg.query(
        `INSERT INTO business_details (
          id, tenant_id, logo_url, legal_name,
          address_line1, address_line2, city, state, pincode, country,
          gstin, default_tax_id, pan, phone, email, website,
          signatory_name, signature_url, default_terms, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, NOW()
        )
        ON CONFLICT (tenant_id) DO UPDATE SET
          logo_url = EXCLUDED.logo_url,
          legal_name = EXCLUDED.legal_name,
          address_line1 = EXCLUDED.address_line1,
          address_line2 = EXCLUDED.address_line2,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          country = EXCLUDED.country,
          gstin = EXCLUDED.gstin,
          default_tax_id = EXCLUDED.default_tax_id,
          pan = EXCLUDED.pan,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          website = EXCLUDED.website,
          signatory_name = EXCLUDED.signatory_name,
          signature_url = EXCLUDED.signature_url,
          default_terms = EXCLUDED.default_terms,
          updated_at = NOW()`,
        [
          id, tenantId, logoUrl, legalName,
          addressLine1, addressLine2, city, state, pincode, country,
          gstin, defaultTaxId, pan, phone, email, website,
          signatoryName, signatureUrl, defaultTerms
        ]
      );

      return {
        id,
        tenantId,
        logoUrl,
        legalName,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country,
        gstin,
        defaultTaxId,
        pan,
        phone,
        email,
        website,
        signatoryName,
        signatureUrl,
        defaultTerms,
      };
    },
  };
}
