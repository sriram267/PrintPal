import { assertTenantId } from "./tenantContext.mjs";

/**
 * Creates the Multi-Tenant Repository layer over PGlite / PostgreSQL.
 *
 * Defense-in-depth:
 * 1. Every method strictly enforces a non-empty `tenantId` string.
 * 2. Every SQL query explicitly binds `tenant_id = $1`.
 * 3. Before each tenant-scoped query, `app.current_tenant_id` session setting
 *    is applied to activate database-level Row-Level Security (RLS).
 */
export function createTenantRepository(pg) {
  // Helper to sync tenant context for database-level RLS
  async function syncRls(tenantId) {
    assertTenantId(tenantId);
    try {
      await pg.query("SELECT set_config('app.current_tenant_id', $1, false);", [tenantId]);
    } catch (err) {
      // In case session config fails, application-level filter still protects
      console.warn("[Repository] set_config app.current_tenant_id warning:", err.message);
    }
  }

  return {
    customers: {
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
        const billingAddress = body.billingAddress?.trim() || body.address?.trim() || "Local Address";
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
    },

    enquiries: {
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
    },

    suppliers: {
      async getAll(tenantId) {
        await syncRls(tenantId);
        const res = await pg.query(
          "SELECT * FROM suppliers WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC",
          [tenantId]
        );
        return res.rows.map((row) => ({
          id: row.id,
          tenantId: row.tenant_id,
          supplierName: row.supplier_name,
          contactPerson: row.contact_person || "",
          phone: row.phone,
          email: row.email || "",
          isWhatsAppSame: row.is_whatsapp_same !== false,
          whatsappNumber: row.whatsapp_number || "",
          category: row.category || "General Fabrication",
          gstin: row.gstin || "",
          address: row.address || "",
          addressLine1: row.address_line1 || "",
          addressLine2: row.address_line2 || "",
          city: row.city || "",
          state: row.state || "",
          pincode: row.pincode || "",
          servingRegions: row.serving_regions || "",
          isBillingSameAsWarehouse: row.is_billing_same_as_warehouse !== false,
          billingAddress: row.billing_address || "",
          billingAddressLine1: row.billing_address_line1 || "",
          billingAddressLine2: row.billing_address_line2 || "",
          billingCity: row.billing_city || "",
          billingState: row.billing_state || "",
          billingPincode: row.billing_pincode || "",
          isShippingSameAsBilling: row.is_shipping_same_as_billing !== false,
          shippingAddress: row.shipping_address || "",
          shippingAddressLine1: row.shipping_address_line1 || "",
          shippingAddressLine2: row.shipping_address_line2 || "",
          shippingCity: row.shipping_city || "",
          shippingState: row.shipping_state || "",
          shippingPincode: row.shipping_pincode || "",
          deliveryLeadTime: row.delivery_lead_time || "",
          minOrderQty: row.min_order_qty || "",
          paymentTerms: row.payment_terms || "ADVANCE",
          notes: row.notes || "",
          createdAt: row.created_at,
        }));
      },

      async save(tenantId, body) {
        await syncRls(tenantId);
        const id = body.id || `supp-${Date.now()}`;
        const supplierName = body.supplierName?.trim() || "Untitled Supplier";
        const contactPerson = body.contactPerson?.trim() || "";
        const phone = body.phone?.trim() || "";
        const email = body.email?.trim() || "";
        const isWhatsAppSame = body.isWhatsAppSame !== false;
        const whatsappNumber = body.whatsappNumber?.trim() || "";
        const category = body.category?.trim() || "General Fabrication";
        const gstin = body.gstin?.trim() || "";
        const addressLine1 = body.addressLine1?.trim() || "";
        const addressLine2 = body.addressLine2?.trim() || "";
        const address = body.address?.trim() || [addressLine1, addressLine2].filter(Boolean).join(", ");
        const city = body.city?.trim() || "";
        const state = body.state?.trim() || "";
        const pincode = body.pincode?.trim() || "";
        const servingRegions = body.servingRegions?.trim() || "";
        const isBillingSameAsWarehouse = body.isBillingSameAsWarehouse !== false;
        const billingAddressLine1 = body.billingAddressLine1?.trim() || "";
        const billingAddressLine2 = body.billingAddressLine2?.trim() || "";
        const billingCity = body.billingCity?.trim() || "";
        const billingState = body.billingState?.trim() || "";
        const billingPincode = body.billingPincode?.trim() || "";
        const billingAddress = body.billingAddress?.trim() || [billingAddressLine1, billingAddressLine2, billingCity, billingState, billingPincode].filter(Boolean).join(", ");
        const isShippingSameAsBilling = body.isShippingSameAsBilling !== false;
        const shippingAddressLine1 = body.shippingAddressLine1?.trim() || "";
        const shippingAddressLine2 = body.shippingAddressLine2?.trim() || "";
        const shippingCity = body.shippingCity?.trim() || "";
        const shippingState = body.shippingState?.trim() || "";
        const shippingPincode = body.shippingPincode?.trim() || "";
        const shippingAddress = body.shippingAddress?.trim() || [shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingPincode].filter(Boolean).join(", ");
        const deliveryLeadTime = body.deliveryLeadTime?.trim() || "";
        const minOrderQty = body.minOrderQty?.trim() || "";
        const paymentTerms = body.paymentTerms || "ADVANCE";
        const notes = body.notes?.trim() || "";
        const createdAt = body.createdAt || new Date().toISOString();

        await pg.query(
          `INSERT INTO suppliers (
            id, tenant_id, supplier_name, contact_person, phone, email, category,
            gstin, address, city, state, pincode, payment_terms, notes, created_at,
            is_whatsapp_same, whatsapp_number, serving_regions, is_billing_same_as_warehouse,
            billing_address, delivery_lead_time, min_order_qty, is_shipping_same_as_billing, shipping_address,
            address_line1, address_line2,
            billing_address_line1, billing_address_line2, billing_city, billing_state, billing_pincode,
            shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_pincode
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
            supplier_name = EXCLUDED.supplier_name,
            contact_person = EXCLUDED.contact_person,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            category = EXCLUDED.category,
            gstin = EXCLUDED.gstin,
            address = EXCLUDED.address,
            address_line1 = EXCLUDED.address_line1,
            address_line2 = EXCLUDED.address_line2,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            pincode = EXCLUDED.pincode,
            payment_terms = EXCLUDED.payment_terms,
            notes = EXCLUDED.notes,
            is_whatsapp_same = EXCLUDED.is_whatsapp_same,
            whatsapp_number = EXCLUDED.whatsapp_number,
            serving_regions = EXCLUDED.serving_regions,
            is_billing_same_as_warehouse = EXCLUDED.is_billing_same_as_warehouse,
            billing_address = EXCLUDED.billing_address,
            billing_address_line1 = EXCLUDED.billing_address_line1,
            billing_address_line2 = EXCLUDED.billing_address_line2,
            billing_city = EXCLUDED.billing_city,
            billing_state = EXCLUDED.billing_state,
            billing_pincode = EXCLUDED.billing_pincode,
            delivery_lead_time = EXCLUDED.delivery_lead_time,
            min_order_qty = EXCLUDED.min_order_qty,
            is_shipping_same_as_billing = EXCLUDED.is_shipping_same_as_billing,
            shipping_address = EXCLUDED.shipping_address,
            shipping_address_line1 = EXCLUDED.shipping_address_line1,
            shipping_address_line2 = EXCLUDED.shipping_address_line2,
            shipping_city = EXCLUDED.shipping_city,
            shipping_state = EXCLUDED.shipping_state,
            shipping_pincode = EXCLUDED.shipping_pincode,
            updated_at = NOW()`,
          [
            id, tenantId, supplierName, contactPerson, phone, email, category,
            gstin, address, city, state, pincode, paymentTerms, notes, createdAt,
            isWhatsAppSame, whatsappNumber, servingRegions, isBillingSameAsWarehouse,
            billingAddress, deliveryLeadTime, minOrderQty, isShippingSameAsBilling, shippingAddress,
            addressLine1, addressLine2,
            billingAddressLine1, billingAddressLine2, billingCity, billingState, billingPincode,
            shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingPincode
          ]
        );
        return { id, success: true };
      },

      async delete(tenantId, id) {
        await syncRls(tenantId);
        const res = await pg.query(
          "UPDATE suppliers SET deleted_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING id",
          [tenantId, id]
        );
        return { success: res.rows.length > 0 };
      },
    },

    products: {
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
        const id = body.id || `prod-${Date.now()}`;
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

        await pg.query(
          `INSERT INTO products (
            id, tenant_id, title, also_called, category, description,
            priced_per, also_priced_by, size_range, lighting,
            needs_installation, lead_time, material_ids, finish_ids,
            is_active, width, height, unit, material, finishing,
            application, production_type, research_confidence, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
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
            id, tenantId, title, alsoCalled, category, description,
            pricedPer, alsoPricedBy, sizeRange, lighting,
            needsInstallation, leadTime, materialIds, finishIds,
            isActive, width, height, unit, material, finishing,
            application, productionType, researchConfidence, notes, createdAt
          ]
        );
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
    },

    materials: {
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
    },

    finishes: {
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
        const id = body.id || `F${Date.now()}`;
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

        await pg.query(
          `INSERT INTO finishes (
            id, tenant_id, name, also_called, type, works_on, variants, indoor,
            outdoor, coastal, cost_effect, lead_time_impact, color_code,
            research_confidence, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
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
            id, tenantId, name, alsoCalled, type, worksOn, variants, indoor,
            outdoor, coastal, costEffect, leadTimeImpact, colorCode,
            researchConfidence, notes, createdAt
          ]
        );
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
    },

    quotations: {
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

        await pg.query(
          `INSERT INTO quotations (
            id, tenant_id, customer_id, quote_number, quote_date, quote_status,
            subtotal, transport_cost, design_charges, installation_charges,
            discount_percent, gst_rate, grand_total, notes_json, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          ON CONFLICT (id) DO UPDATE SET
            tenant_id = EXCLUDED.tenant_id,
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
            updated_at = NOW()`,
          [
            quoteId, tenantId, customerId, quoteNumber, quoteDate, finalStatus,
            finalSubtotal, transportCost, designCharges, installationCharges,
            discountPercent, gstRate, finalGrandTotal, JSON.stringify(notesJson)
          ]
        );

        // Delete lines strictly for this tenant and quote
        await pg.query(
          "DELETE FROM quote_lines WHERE tenant_id = $1 AND quote_id = $2",
          [tenantId, quoteId]
        );

        for (const pl of processedLines) {
          await pg.query(
            `INSERT INTO quote_lines (
              id, tenant_id, quote_id, site_id, site_name, product_title, material_name, finish_name,
              method_code, method_name, rate_label, width, height, quantity, rate,
              discount_pct, billable_qty, total, sort_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT (id) DO UPDATE SET
              tenant_id = EXCLUDED.tenant_id,
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
              sort_order = EXCLUDED.sort_order`,
            [
              pl.id, tenantId, quoteId, pl.siteId, pl.siteName, pl.productTitle, pl.materialName, pl.finishName,
              pl.methodCode, pl.methodName, pl.rateLabel, pl.width, pl.height, pl.quantity, pl.rate,
              pl.discountPct, pl.billableQty, pl.total, pl.sortOrder
            ]
          );
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
    },

    businessDetails: {
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
    },

    methods: {
      async getAll() {
        const res = await pg.query("SELECT * FROM methods ORDER BY sort_order ASC");
        return res.rows;
      },
    },
  };
}
