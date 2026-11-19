/**
 * Database: Suppliers: list, save, delete.
 * Runs inside the shop's own transaction (src/shared/server/tenantSession.mjs). Every query is scoped to the shop,
 * and a save never overwrites a row that belongs to another shop.
 */
import { assertSaved } from "../../../../shared/server/tenantSession.mjs";
import { newId } from "../../../../shared/server/newId.mjs";

export function createSuppliersDb(pg, syncRls) {
  return {
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
      const id = body.id || newId("supp");
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

      assertSaved(await pg.query(
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
          updated_at = NOW()
        WHERE suppliers.tenant_id = EXCLUDED.tenant_id
        RETURNING id`,
        [
          id, tenantId, supplierName, contactPerson, phone, email, category,
          gstin, address, city, state, pincode, paymentTerms, notes, createdAt,
          isWhatsAppSame, whatsappNumber, servingRegions, isBillingSameAsWarehouse,
          billingAddress, deliveryLeadTime, minOrderQty, isShippingSameAsBilling, shippingAddress,
          addressLine1, addressLine2,
          billingAddressLine1, billingAddressLine2, billingCity, billingState, billingPincode,
          shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingPincode
        ]
      ));
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
  };
}
