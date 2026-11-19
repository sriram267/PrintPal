import { METHOD_MAP, mapLegacyMethodCode } from './calcLine';
import type { QuoteLineItem } from './types';

/**
 * Format line item description for PDF and Print/Send views according to specification:
 * - area: "8 x 2 ft (16 sq ft) x 1 @ Rs 2,600 per sq ft"
 * - length: "12 ft x 4 @ Rs 150 per ft"
 * - per piece: "10 pieces @ Rs 250 per piece"
 * - lump sum: "Lump sum"
 */
export function formatQuoteLineText(line: QuoteLineItem): string {
  const methodCode = line.methodCode || mapLegacyMethodCode(String(line.method || 'Square Feet'));
  const method = METHOD_MAP[methodCode] || METHOD_MAP.sq_ft;
  const rateVal = line.rate ?? line.price ?? 0;
  const rateFormatted = `Rs ${Number(rateVal).toLocaleString('en-IN')}`;
  const qty = Math.max(1, line.quantity ?? line.qty ?? 1);
  const unit = method.size_unit || 'ft';

  if (method.type === 'area') {
    const w = line.width ? parseFloat(String(line.width)) : null;
    const h = line.height ? parseFloat(String(line.height)) : null;
    if (w !== null && h !== null && w > 0 && h > 0) {
      const area = w * h;
      const areaDisplay = Number.isInteger(area) ? area : parseFloat(area.toFixed(2));
      const areaUnitLabel = method.code === 'sq_m' ? 'sq m' : 'sq ft';
      return `${w} x ${h} ${unit} (${areaDisplay} ${areaUnitLabel}) x ${qty} @ ${rateFormatted} ${method.rate_label}`;
    }
    return `${qty} @ ${rateFormatted} ${method.rate_label}`;
  }

  if (method.type === 'length') {
    const l = line.width ? parseFloat(String(line.width)) : null;
    if (l !== null && l > 0) {
      return `${l} ${unit} x ${qty} @ ${rateFormatted} ${method.rate_label}`;
    }
    return `${qty} @ ${rateFormatted} ${method.rate_label}`;
  }

  if (method.type === 'quantity') {
    const pieceWord = qty === 1 ? 'piece' : 'pieces';
    return `${qty} ${pieceWord} @ ${rateFormatted} ${method.rate_label}`;
  }

  if (method.type === 'fixed') {
    return 'Lump sum';
  }

  return `${qty} @ ${rateFormatted}`;
}

