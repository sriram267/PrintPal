export * from "../calcLine";
import { calcLine, METHOD_MAP, mapLegacyMethodCode } from "../calcLine";
import type { MethodCode } from "../calcLine";

export interface CalculateLineItemInput {
  method?: string;
  methodCode?: MethodCode;
  size?: string;
  width?: number | null;
  height?: number | null;
  qty: number;
  price?: number | null;
  rate?: number | null;
  discount: number;
}

/**
 * Standardized quotation calculation wrapper using the pure calcLine engine
 */
export function calculateLineItemTotal(item: CalculateLineItemInput): number {
  const methodCode = item.methodCode || mapLegacyMethodCode(item.method || 'Square Feet');
  const method = METHOD_MAP[methodCode] || METHOD_MAP.sq_ft;

  let width = item.width ?? null;
  let height = item.height ?? null;

  if (width === null && item.size) {
    const raw = item.size.trim();
    const match = raw.match(/^\s*([0-9.]+)\s*[x×*X\s]\s*([0-9.]+)\s*$/);
    if (match) {
      width = parseFloat(match[1]);
      height = parseFloat(match[2]);
    } else {
      const val = parseFloat(raw);
      if (!isNaN(val)) width = val;
    }
  }

  const rate = item.rate ?? item.price ?? null;
  const quantity = Math.max(1, Number(item.qty) || 1);
  const discountPct = Number(item.discount) || 0;

  const res = calcLine({
    methodType: method.type,
    width,
    height,
    quantity,
    rate,
    discountPct,
  });

  return res.total ?? 0;
}
