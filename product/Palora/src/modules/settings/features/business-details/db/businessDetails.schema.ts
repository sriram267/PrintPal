/**
 * PostgreSQL 16 Business Details Schema & Client Persistence Helpers
 */

export const BUSINESS_DETAILS_STORAGE_KEY = "printpal_business_details_v1";

export interface BusinessDetailsRecord {
  id?: string;
  tenantId?: string;
  logoUrl: string;
  legalName: string;
  addressSearch?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin: string;
  defaultTaxId: string;
  pan: string;
  phone: string;
  email: string;
  website: string;
  signatoryName: string;
  signatureUrl: string;
  defaultTerms: string;
  updatedAt?: string;
}

export const DEFAULT_BUSINESS_DETAILS: BusinessDetailsRecord = {
  id: "default-business",
  logoUrl: "",
  legalName: "PrintPal",
  addressSearch: "",
  addressLine1: "",
  addressLine2: "",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "600001",
  country: "India",
  gstin: "",
  defaultTaxId: "",
  pan: "",
  phone: "",
  email: "",
  website: "",
  signatoryName: "",
  signatureUrl: "",
  defaultTerms:
    "50% Advance with Purchase Order, 40% on dispatch to site, 10% on handover completion. 2 Years warranty on Samsung LED modules & Meanwell Power Supply.",
};

export const BUSINESS_DETAILS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS business_details (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'default-business',
  tenant_id VARCHAR(255) NOT NULL,
  logo_url TEXT DEFAULT '',
  legal_name VARCHAR(255) NOT NULL DEFAULT 'PrintPal',
  address_line1 VARCHAR(255) DEFAULT '',
  address_line2 VARCHAR(255) DEFAULT '',
  city VARCHAR(120) DEFAULT '',
  state VARCHAR(120) DEFAULT '',
  pincode VARCHAR(20) DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  gstin VARCHAR(20) DEFAULT '',
  default_tax_id VARCHAR(100) DEFAULT '',
  pan VARCHAR(20) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  website VARCHAR(255) DEFAULT '',
  signatory_name VARCHAR(255) DEFAULT '',
  signature_url TEXT DEFAULT '',
  default_terms TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export function loadBusinessDetailsFromStorage(): BusinessDetailsRecord {
  try {
    const raw = localStorage.getItem(BUSINESS_DETAILS_STORAGE_KEY);
    if (!raw) return DEFAULT_BUSINESS_DETAILS;
    const parsed = JSON.parse(raw) as Partial<BusinessDetailsRecord>;
    return { ...DEFAULT_BUSINESS_DETAILS, ...parsed };
  } catch {
    return DEFAULT_BUSINESS_DETAILS;
  }
}

export function saveBusinessDetailsToStorage(details: BusinessDetailsRecord): void {
  try {
    localStorage.setItem(BUSINESS_DETAILS_STORAGE_KEY, JSON.stringify(details));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

