/**
 * The one place a quote's money is worked out on the server.
 * src/modules/quotation/quoteTotals.ts mirrors this exactly; tests/quoteTotals.test.mjs keeps them identical.
 *
 * Order: items + design + installation + transport -> discount % off that total -> GST on what is left.
 * Everything is rounded half-up to paise, so a GST invoice never carries a hidden rupee of rounding.
 */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeQuoteTotals({
  sitesSubtotal = 0,
  designCharges = 0,
  installationCharges = 0,
  transportCost = 0,
  discountPercent = 0,
  gstRate = 18,
}) {
  const gross = round2(
    Number(sitesSubtotal) + Number(designCharges) + Number(installationCharges) + Number(transportCost)
  );
  const discountAmount = discountPercent > 0 ? round2((gross * Number(discountPercent)) / 100) : 0;
  const taxableTotal = Math.max(0, round2(gross - discountAmount));
  const gstAmount = round2((taxableTotal * Number(gstRate)) / 100);
  const grandTotal = round2(taxableTotal + gstAmount);
  return { gross, discountAmount, taxableTotal, gstAmount, grandTotal };
}

const MAX_MONEY = 1e9; // ₹100 crore on a single figure is a typo, not a quote

/** Returns a plain-language error string when the numbers can't be a real quote, otherwise null. */
export function validateQuoteMoney({ transportCost = 0, designCharges = 0, installationCharges = 0, discountPercent = 0, gstRate = 18 }) {
  const charges = [
    ["Transport", transportCost],
    ["Design", designCharges],
    ["Installation", installationCharges],
  ];
  for (const [label, v] of charges) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return `${label} charges must be zero or more.`;
    if (n > MAX_MONEY) return `${label} charges look too large. Please check the amount.`;
  }
  const d = Number(discountPercent);
  if (!Number.isFinite(d) || d < 0 || d > 100) return "Discount must be between 0% and 100%.";
  const g = Number(gstRate);
  if (!Number.isFinite(g) || g < 0 || g > 100) return "GST rate must be between 0% and 100%.";
  return null;
}

export { MAX_MONEY };
