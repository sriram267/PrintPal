/**
 * How a quote's money is worked out on screen, in the PDF and in Quotation Reports.
 * Mirrors server/quoteTotals.mjs exactly; tests/quoteTotals.test.mjs keeps the two identical.
 *
 * Order: items + design + installation + transport -> discount % off that total -> GST on what is left.
 * Rounded half-up to paise, so a GST invoice never carries a hidden rupee of rounding.
 */
export interface QuoteTotalsInput {
  sitesSubtotal?: number;
  designCharges?: number;
  installationCharges?: number;
  transportCost?: number;
  discountPercent?: number;
  gstRate?: number;
}

export interface QuoteTotals {
  gross: number;
  discountAmount: number;
  taxableTotal: number;
  gstAmount: number;
  grandTotal: number;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeQuoteTotals({
  sitesSubtotal = 0,
  designCharges = 0,
  installationCharges = 0,
  transportCost = 0,
  discountPercent = 0,
  gstRate = 18,
}: QuoteTotalsInput): QuoteTotals {
  const gross = round2(
    Number(sitesSubtotal) + Number(designCharges) + Number(installationCharges) + Number(transportCost)
  );
  const discountAmount = discountPercent > 0 ? round2((gross * Number(discountPercent)) / 100) : 0;
  const taxableTotal = Math.max(0, round2(gross - discountAmount));
  const gstAmount = round2((taxableTotal * Number(gstRate)) / 100);
  const grandTotal = round2(taxableTotal + gstAmount);
  return { gross, discountAmount, taxableTotal, gstAmount, grandTotal };
}

/** "16 Nov 2026" from an ISO timestamp or any date string; leaves already-friendly text alone. */
export function formatQuoteDate(value: string | undefined | null): string {
  if (!value) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
