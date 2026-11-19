// PrintPal Leads & Customer Module — Domain Contracts & Types
// Aligned with PrintPal Workshop OS & Figma Build Docs Specifications

export type CustomerType = 'RETAIL_BRAND' | 'FRANCHISE' | 'CONTRACTOR' | 'INDIVIDUAL';
export type PaymentTerms = 'ADVANCE_50' | 'ADVANCE_100' | 'NET_30';
export type WallSubstrate = 'CONCRETE' | 'HOLLOW_BRICK' | 'ACP' | 'GLASS' | 'OTHER';

export type ArtworkStatus = 'VECTOR_READY' | 'NEEDS_VECTORIZATION' | 'NEEDS_DESIGN' | 'TO_BE_PROVIDED' | '';

export interface ServiceItem {
  id: string;
  serviceNumber: number;
  signStyle: string;
  application: 'Indoor' | 'Outdoor' | 'Coastal';
  width: string;
  height: string;
  unit: string;
  quantity: number;
  notSureOfDimensions?: boolean;
  material?: string;
  finishing?: string;
  artworkStatus?: ArtworkStatus;
  color?: string;
  referenceFiles?: string[];
  referenceImages?: any[];
  notes?: string;
}

export interface SiteRecord {
  id: string;
  siteName: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  targetDeliveryDate?: string;
  contactPerson?: string;
  contactPhone?: string;
  landmark?: string;
  mountingHeightAglFt?: number;
  wallSubstrate?: WallSubstrate;
  hasPowerPoint?: boolean;
  powerDistanceM?: number;
  services: string[];
  serviceDetails?: ServiceItem[];
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface CustomerRecord {
  id: string;
  businessName?: string;
  name: string; // Contact or Company name
  contactPerson?: string;
  phone: string;
  isWhatsAppSame?: boolean;
  whatsappNumber?: string;
  email: string;
  followUpDate?: string;
  address: string;
  customerType?: CustomerType;
  gstin?: string;
  stateCode?: string;
  paymentTerms?: PaymentTerms;
  sites: SiteRecord[];
  createdAt: string;
  // Commercials & Addresses
  billingName?: string;
  billingAddress?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  isShippingSameAsBilling?: boolean;
  shippingAddress?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
}

export type EnquiryStage = 'NEW' | 'CONTACTED' | 'QUALIFYING' | 'NEEDS_FOLLOW_UP' | 'ESTIMATING' | 'QUOTED' | 'WON' | 'LOST';
export type EnquirySource = 'WHATSAPP' | 'CALL' | 'WALK_IN' | 'JUSTDIAL' | 'REFERRAL';

export interface EnquiryRecord {
  id: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  source: EnquirySource;
  stage: EnquiryStage;
  inquiryNote: string;
  hasVectorLogo: boolean;
  wallSubstrate: WallSubstrate;
  mountingHeightFt: number;
  hasPowerPoint: boolean;
  followUpDate?: string;
  createdAt: string;
}

export interface SupplierRecord {
  id: string;
  supplierName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  isWhatsAppSame?: boolean;
  whatsappNumber?: string;
  category: string;
  gstin?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  servingRegions?: string;
  isBillingSameAsWarehouse?: boolean;
  billingAddress?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPincode?: string;
  isShippingSameAsBilling?: boolean;
  shippingAddress?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  deliveryLeadTime?: string;
  minOrderQty?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerDrawerAnchor {
  section: 'basic' | 'site' | 'service' | 'add-service' | 'add-site';
  siteId?: string;
  siteIdx?: number;
  serviceId?: string;
  serviceIdx?: number;
}
