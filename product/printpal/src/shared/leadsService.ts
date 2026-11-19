import type { CustomerRecord, EnquiryRecord, SupplierRecord } from "../features/leads/shared/types"
import type { ProductRecord, MaterialRecord, FinishRecord } from "../features/settings/shared/types"
import seedCatalog from "../features/settings/starter-catalogue/db/seedData.json";

const STORAGE_CUSTOMERS_KEY = "printpal_customers_v1";
const STORAGE_ENQUIRIES_KEY = "printpal_enquiries_v1";
const STORAGE_SUPPLIERS_KEY = "printpal_suppliers_v1";
const STORAGE_PRODUCTS_KEY = "printpal_products_v1";
const STORAGE_MATERIALS_KEY = "printpal_materials_v1";
const STORAGE_FINISHES_KEY = "printpal_finishes_v1";

const DEFAULT_CUSTOMERS: CustomerRecord[] = ((seedCatalog as any).customers || []) as CustomerRecord[];
const DEFAULT_ENQUIRIES: EnquiryRecord[] = ((seedCatalog as any).enquiries || []) as EnquiryRecord[];
const DEFAULT_SUPPLIERS: SupplierRecord[] = ((seedCatalog as any).suppliers || []) as SupplierRecord[];

const API_BASE = "/api";

export const leadsService = {
  // Fetch all customers from PostgreSQL via Fastify API
  async getCustomers(): Promise<CustomerRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/customers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("[LeadsService] Backend unavailable, falling back to local cache:", err);
    }

    // Fallback to local storage or seed data
    try {
      const local = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      const parsed = local ? JSON.parse(local) : null;
      return parsed !== null ? parsed : DEFAULT_CUSTOMERS;
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  },

  // Save or update customer
  async saveCustomer(customer: CustomerRecord): Promise<{ success: boolean; id: string }> {
    // 1. Optimistically update local cache
    try {
      const current = await this.getCustomers();
      const existingIdx = current.findIndex((c) => c.id === customer.id);
      let updated: CustomerRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = customer;
      } else {
        updated = [customer, ...current];
      }
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    // 2. Persist to PostgreSQL backend
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, id: result.id || customer.id };
      }
    } catch (err) {
      console.warn("[LeadsService] Backend write failed, stored in local cache:", err);
    }

    return { success: true, id: customer.id };
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const current = await this.getCustomers();
      const filtered = current.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/customers/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete request error:", err);
      return false;
    }
  },

  // Fetch all enquiries
  async getEnquiries(): Promise<EnquiryRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/enquiries`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("[LeadsService] Backend enquiries unavailable, falling back to cache:", err);
    }

    try {
      const local = localStorage.getItem(STORAGE_ENQUIRIES_KEY);
      const parsed = local ? JSON.parse(local) : null;
      return parsed !== null ? parsed : DEFAULT_ENQUIRIES;
    } catch {
      return DEFAULT_ENQUIRIES;
    }
  },

  // Save enquiry
  async saveEnquiry(enquiry: EnquiryRecord): Promise<{ success: boolean; id: string }> {
    try {
      const current = await this.getEnquiries();
      const existingIdx = current.findIndex((e) => e.id === enquiry.id);
      let updated: EnquiryRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = enquiry;
      } else {
        updated = [enquiry, ...current];
      }
      localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, id: result.id || enquiry.id };
      }
    } catch (err) {
      console.warn("[LeadsService] Backend write failed, stored in local cache:", err);
    }

    return { success: true, id: enquiry.id };
  },

  // Delete enquiry
  async deleteEnquiry(id: string): Promise<boolean> {
    try {
      const current = await this.getEnquiries();
      const filtered = current.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/enquiries/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete enquiry error:", err);
      return false;
    }
  },

  // Fetch all suppliers
  async getSuppliers(): Promise<SupplierRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/suppliers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {
      console.warn("[LeadsService] Backend suppliers unavailable, falling back to cache:", err);
    }

    try {
      const local = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return parsed.length > 0 ? parsed : DEFAULT_SUPPLIERS;
    } catch {
      return DEFAULT_SUPPLIERS;
    }
  },

  // Save or update supplier
  async saveSupplier(supplier: SupplierRecord): Promise<{ success: boolean; id: string }> {
    try {
      const current = await this.getSuppliers();
      const existingIdx = current.findIndex((s) => s.id === supplier.id);
      let updated: SupplierRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = supplier;
      } else {
        updated = [supplier, ...current];
      }
      localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    try {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, id: result.id || supplier.id };
      }
    } catch (err) {
      console.warn("[LeadsService] Backend write failed, stored in local cache:", err);
    }

    return { success: true, id: supplier.id };
  },

  // Delete supplier
  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const current = await this.getSuppliers();
      const filtered = current.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/suppliers/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete supplier error:", err);
      return false;
    }
  },

  // Fetch all products
  async getProducts(): Promise<ProductRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn("[LeadsService] Backend products unavailable, falling back to cache:", err);
    }

    try {
      const local = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return (seedCatalog.products as ProductRecord[]) || [];
    } catch {
      return (seedCatalog.products as ProductRecord[]) || [];
    }
  },

  // Save or update product
  async saveProduct(product: ProductRecord): Promise<{ success: boolean; id: string }> {
    try {
      const current = await this.getProducts();
      const existingIdx = current.findIndex((p) => p.id === product.id);
      let updated: ProductRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = product;
      } else {
        updated = [product, ...current];
      }
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const result = await res.json();
        return { success: true, id: result.id || product.id };
      }
    } catch (err) {
      console.warn("[LeadsService] Backend write failed, stored in local cache:", err);
    }

    return { success: true, id: product.id };
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const current = await this.getProducts();
      const filtered = current.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete product error:", err);
      return false;
    }
  },

  // Fetch all materials
  async getMaterials(): Promise<MaterialRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/materials`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_MATERIALS_KEY, JSON.stringify(data));
        return data;
      }
    } catch { }

    try {
      const local = localStorage.getItem(STORAGE_MATERIALS_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return (seedCatalog.materials as MaterialRecord[]) || [];
    } catch {
      return (seedCatalog.materials as MaterialRecord[]) || [];
    }
  },

  // Save or update material
  async saveMaterial(material: MaterialRecord): Promise<{ success: boolean; id: string }> {
    try {
      const current = await this.getMaterials();
      const existingIdx = current.findIndex((m) => m.id === material.id);
      let updated: MaterialRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = material;
      } else {
        updated = [material, ...current];
      }
      localStorage.setItem(STORAGE_MATERIALS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    try {
      await fetch(`${API_BASE}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(material),
      });
    } catch {}

    return { success: true, id: material.id };
  },

  // Delete material
  async deleteMaterial(id: string): Promise<boolean> {
    try {
      const current = await this.getMaterials();
      const filtered = current.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_MATERIALS_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/materials/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete material error:", err);
      return false;
    }
  },

  // Fetch all finishes
  async getFinishes(): Promise<FinishRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/finishes`);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(STORAGE_FINISHES_KEY, JSON.stringify(data));
        return data;
      }
    } catch { }

    try {
      const local = localStorage.getItem(STORAGE_FINISHES_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return (seedCatalog.finishes as FinishRecord[]) || [];
    } catch {
      return (seedCatalog.finishes as FinishRecord[]) || [];
    }
  },

  // Save or update finish
  async saveFinish(finish: FinishRecord): Promise<{ success: boolean; id: string }> {
    try {
      const current = await this.getFinishes();
      const existingIdx = current.findIndex((f) => f.id === finish.id);
      let updated: FinishRecord[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = finish;
      } else {
        updated = [finish, ...current];
      }
      localStorage.setItem(STORAGE_FINISHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[LeadsService] Local cache save failed:", e);
    }

    try {
      await fetch(`${API_BASE}/finishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finish),
      });
    } catch {}

    return { success: true, id: finish.id };
  },

  // Delete finish
  async deleteFinish(id: string): Promise<boolean> {
    try {
      const current = await this.getFinishes();
      const filtered = current.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_FINISHES_KEY, JSON.stringify(filtered));

      await fetch(`${API_BASE}/finishes/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[LeadsService] Delete finish error:", err);
      return false;
    }
  },
};
