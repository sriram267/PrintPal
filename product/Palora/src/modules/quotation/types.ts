export * from "./calcLine";
import type { MethodCode } from "./calcLine";

export type PricingMethod =
  | 'Square Feet'
  | 'Feet'
  | 'Per piece'
  | 'Lump sum'
  | 'Metre'
  | 'Metre square';

export interface QuoteLineItem {
  id: string;
  productTitle: string;
  materialName?: string;
  finishName?: string;
  method?: PricingMethod | string;
  methodCode: MethodCode;
  methodName?: string;
  rateLabel?: string;
  size?: string; // e.g. "10 × 4", "W X H"
  width?: string | number | null;
  height?: string | number | null;
  qty: number;
  quantity?: number;
  price?: number | null;
  rate?: number | null;
  discount: number; // in %
  discountPct?: number;
  billableQty?: number | null;
  total: number | null;
  status?: 'ok' | 'incomplete';
  reason?: 'size' | 'rate' | 'quantity' | 'discount';
}

export interface QuoteSite {
  id: string;
  siteName: string;
  address?: string;
  isExpanded: boolean;
  items: QuoteLineItem[];
}
