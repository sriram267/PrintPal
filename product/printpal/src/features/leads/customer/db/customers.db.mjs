/**
 * Database: Customers and their sites: list, save, delete.
 * Every query is scoped to the signed-in shop (tenant) and runs syncRls first, so row-level security applies.
 * Moved unchanged from server/repository.mjs (restructure A2).
 */
export function createCustomersDb(pg, syncRls) {
  return {
    async getAll(tenantId) {
      await syncRls(tenantId);
      const custRes = await pg.query(
        "SELECT * FROM customers WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC",
        [tenantId]
      );
      const customers = [];

      for (const row of custRes.rows) {
        const sitesRes = await pg.query(
          "SELECT * FROM sites WHERE tenant_id = $1 AND customer_id = $2 ORDER BY created_at ASC",
          [tenantId, row.id]
        );

        const formattedSites = sitesRes.rows.map((s) => ({
          id: s.id,
          siteName: s.site_name,
          address: s.address,
          addressLine1: s.address_line1 || "",
          addressLine2: s.address_line2 || "",
          city: s.city || "",
          state: s.state || "",
          pincode: s.pincode || "",
          targetDeliveryDate: s.target_delivery_date || "",
          contactPerson: s.contact_person || "",
          contactPhone: s.contact_phone || "",
          landmark: s.landmark || "",
          lat: s.lat ? Number(s.lat) : undefined,
          lng: s.lng ? Number(s.lng) : undefined,
          placeId: s.place_id || undefined,
          mountingHeightAglFt: s.mounting_height_agl_ft ? Number(s.mounting_height_agl_ft) : undefined,
          wallSubstrate: s.wall_substrate || "CONCRETE",
          powerDistanceM: s.power_point_distance_m ? Number(s.power_point_distance_m) : undefined,
          hasPowerPoint: Boolean(s.has_power_point),
          services: typeof s.services === "string" ? JSON.parse(s.services) : s.services || [],
          serviceDetails: typeof s.service_details === "string" ? JSON.parse(s.service_details) : s.service_details || [],
        }));

        customers.push({
          id: row.id,
          tenantId: row.tenant_id,
          businessName: row.company_name,
          name: row.contact_person || row.company_name,
          contactPerson: row.contact_person || undefined,
          phone: row.phone,
          email: row.email || "",
          isWhatsAppSame: Boolean(row.is_whatsapp_same),
          whatsappNumber: row.whatsapp_number || "",
          followUpDate: row.follow_up_date || "",
          address: row.billing_address,
          billingAddress: row.billing_address,
          shippingAddress: row.shipping_address || row.billing_address,
          isShippingSameAsBilling: row.is_shipping_same !== false,
          customerType: row.customer_type || "RETAIL_BRAND",
          gstin: row.gstin || "",
          stateCode: row.state_code || "33",
          paymentTerms: row.payment_terms || "ADVANCE_50",
          createdAt: row.created_at,
          sites: formattedSites,
        });
      }

      return customers;
    },

    async getById(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "SELECT * FROM customers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL",
        [tenantId, id]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];

      const sitesRes = await pg.query(
        "SELECT * FROM sites WHERE tenant_id = $1 AND customer_id = $2 ORDER BY created_at ASC",
        [tenantId, row.id]
      );

      return {
        id: row.id,
        tenantId: row.tenant_id,
        businessName: row.company_name,
        name: row.contact_person || row.company_name,
        contactPerson: row.contact_person || undefined,
        phone: row.phone,
        email: row.email || "",
        isWhatsAppSame: Boolean(row.is_whatsapp_same),
        whatsappNumber: row.whatsapp_number || "",
        followUpDate: row.follow_up_date || "",
        address: row.billing_address,
        billingAddress: row.billing_address,
        shippingAddress: row.shipping_address || row.billing_address,
        isShippingSameAsBilling: row.is_shipping_same !== false,
        customerType: row.customer_type || "RETAIL_BRAND",
        gstin: row.gstin || "",
        stateCode: row.state_code || "33",
        paymentTerms: row.payment_terms || "ADVANCE_50",
        createdAt: row.created_at,
        sites: sitesRes.rows,
      };
    },

    async save(tenantId, body) {
      await syncRls(tenantId);
      const id = body.id || `cust-${Date.now()}`;
      const companyName = body.businessName?.trim() || body.name?.trim() || "Untitled Business";
      const contactPerson = body.primaryContactName?.trim() || body.name?.trim() || companyName;
      const phone = body.primaryContactNumber?.trim() || body.phone?.trim() || "";
      const email = body.email?.trim() || "";
      const isWhatsAppSame = body.isWhatsAppSame !== false;
      const whatsappNumber = isWhatsAppSame ? phone : body.whatsappNumber?.trim() || "";
      const followUpDate = body.followUpDate || "";
      const billingAddress = body.billingAddress?.trim() || body.address?.trim() || "";
      const shippingAddress = body.shippingAddress?.trim() || billingAddress;
      const isShippingSame = body.isShippingSameAsBilling !== false;
      const gstin = body.gstin?.trim() || "";
      const stateCode = body.stateCode || "33";
      const paymentTerms = body.paymentTerms || "ADVANCE_50";
      const customerType = body.customerType || "RETAIL_BRAND";
      const createdAt = body.createdAt || new Date().toISOString();

      await pg.query(
        `INSERT INTO customers (
          id, tenant_id, company_name, contact_person, phone, email,
          is_whatsapp_same, whatsapp_number, follow_up_date, gstin,
          billing_address, shipping_address, is_shipping_same, state_code, payment_terms, customer_type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          company_name = EXCLUDED.company_name,
          contact_person = EXCLUDED.contact_person,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          is_whatsapp_same = EXCLUDED.is_whatsapp_same,
          whatsapp_number = EXCLUDED.whatsapp_number,
          follow_up_date = EXCLUDED.follow_up_date,
          gstin = EXCLUDED.gstin,
          billing_address = EXCLUDED.billing_address,
          shipping_address = EXCLUDED.shipping_address,
          is_shipping_same = EXCLUDED.is_shipping_same,
          state_code = EXCLUDED.state_code,
          updated_at = NOW()`,
        [
          id, tenantId, companyName, contactPerson, phone, email,
          isWhatsAppSame, whatsappNumber, followUpDate, gstin,
          billingAddress, shippingAddress, isShippingSame, stateCode, paymentTerms, customerType, createdAt
        ]
      );

      // Save Sites scoped to tenant
      const sitesList = Array.isArray(body.sites) ? body.sites : [];
      for (const s of sitesList) {
        const siteId = s.id || `site-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const siteName = s.siteName?.trim() || "Site 1";
        const address = s.address?.trim() || billingAddress;
        const servicesJson = JSON.stringify(s.services || []);
        const serviceDetailsJson = JSON.stringify(s.serviceDetails || []);

        await pg.query(
          `INSERT INTO sites (
            id, tenant_id, customer_id, site_name, address, address_line1, address_line2,
            city, state, pincode, target_delivery_date, contact_person, contact_phone, landmark, lat, lng, place_id,
            mounting_height_agl_ft, wall_substrate, power_point_distance_m, has_power_point,
            services, service_details
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
            customer_id = EXCLUDED.customer_id,
            site_name = EXCLUDED.site_name,
            address = EXCLUDED.address,
            address_line1 = EXCLUDED.address_line1,
            address_line2 = EXCLUDED.address_line2,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            pincode = EXCLUDED.pincode,
            target_delivery_date = EXCLUDED.target_delivery_date,
            contact_person = EXCLUDED.contact_person,
            contact_phone = EXCLUDED.contact_phone,
            services = EXCLUDED.services,
            service_details = EXCLUDED.service_details,
            updated_at = NOW()`,
          [
            siteId, tenantId, id, siteName, address, s.addressLine1 || "", s.addressLine2 || "",
            s.city || "", s.state || "", s.pincode || "", s.targetDeliveryDate || "",
            s.contactPerson || "", s.contactPhone || "", s.landmark || "",
            s.lat || null, s.lng || null, s.placeId || "",
            s.mountingHeightAglFt || 10, s.wallSubstrate || "CONCRETE", s.powerDistanceM || 2,
            s.hasPowerPoint ?? true, servicesJson, serviceDetailsJson
          ]
        );
      }

      return { id, success: true };
    },

    async delete(tenantId, id) {
      await syncRls(tenantId);
      const res = await pg.query(
        "UPDATE customers SET deleted_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING id",
        [tenantId, id]
      );
      return { success: res.rows.length > 0 };
    },
  };
}
