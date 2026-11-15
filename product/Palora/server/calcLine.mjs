/**
 * PrintPal Backend Pure Calculation Engine for Quotation Line Items
 * 
 * NOTE: Keep this identical to `src/modules/quotation/calcLine.ts`.
 * Any logic change here must be mirrored in the frontend copy.
 */

export const SYSTEM_METHODS = [
  { code: 'sq_ft', name: 'Square Feet', type: 'area', size_unit: 'ft', rate_label: 'per sq ft', sort_order: 1, is_system: true },
  { code: 'run_ft', name: 'Running Feet', type: 'length', size_unit: 'ft', rate_label: 'per ft', sort_order: 2, is_system: true },
  { code: 'sq_m', name: 'Square Metre', type: 'area', size_unit: 'm', rate_label: 'per sq m', sort_order: 3, is_system: true },
  { code: 'run_m', name: 'Running Metre', type: 'length', size_unit: 'm', rate_label: 'per m', sort_order: 4, is_system: true },
  { code: 'per_piece', name: 'Per Piece', type: 'quantity', size_unit: null, rate_label: 'per piece', sort_order: 5, is_system: true },
  { code: 'lump_sum', name: 'Lump Sum', type: 'fixed', size_unit: null, rate_label: 'lump sum', sort_order: 6, is_system: true },
];

export const METHOD_MAP = SYSTEM_METHODS.reduce((acc, m) => {
  acc[m.code] = m;
  return acc;
}, {});

export function roundHalfUp(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calcLine(input) {
  const { methodType, width, height, quantity, rate, discountPct } = input;

  // 1. Validate Size (Size takes priority over Rate when both fail)
  if (methodType === 'area') {
    if (width === null || width === undefined || width <= 0 || height === null || height === undefined || height <= 0) {
      return {
        status: 'incomplete',
        reason: 'size',
        billableQty: null,
        gross: null,
        discountAmount: null,
        total: null,
      };
    }
  } else if (methodType === 'length') {
    if (width === null || width === undefined || width <= 0) {
      return {
        status: 'incomplete',
        reason: 'size',
        billableQty: null,
        gross: null,
        discountAmount: null,
        total: null,
      };
    }
  }

  // 2. Validate Rate
  if (rate === null || rate === undefined || rate < 0 || isNaN(rate)) {
    return {
      status: 'incomplete',
      reason: 'rate',
      billableQty: null,
      gross: null,
      discountAmount: null,
      total: null,
    };
  }

  // 3. Validate Quantity
  let effectiveQty = quantity;
  if (methodType === 'fixed') {
    effectiveQty = 1;
  } else {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return {
        status: 'incomplete',
        reason: 'quantity',
        billableQty: null,
        gross: null,
        discountAmount: null,
        total: null,
      };
    }
  }

  // 4. Validate Discount Percentage
  const validDiscountPct = discountPct ?? 0;
  if (validDiscountPct < 0 || validDiscountPct > 100) {
    return {
      status: 'incomplete',
      reason: 'discount',
      billableQty: null,
      gross: null,
      discountAmount: null,
      total: null,
    };
  }

  // 5. Compute Billable Quantity
  let area = undefined;
  let billableQty = 1;

  if (methodType === 'area') {
    area = width * height;
    billableQty = area * effectiveQty;
  } else if (methodType === 'length') {
    billableQty = width * effectiveQty;
  } else if (methodType === 'quantity') {
    billableQty = effectiveQty;
  } else if (methodType === 'fixed') {
    billableQty = 1;
  }

  // 6. Compute Financials
  const gross = billableQty * rate;
  const rawDiscount = (gross * validDiscountPct) / 100;
  const rawTotal = gross - rawDiscount;

  const discountAmount = roundHalfUp(rawDiscount, 2);
  const total = roundHalfUp(rawTotal, 2);

  return {
    status: 'ok',
    area: area !== undefined ? area : undefined,
    billableQty,
    gross,
    discountAmount,
    total,
  };
}

export function convertDimension(value, fromUnit, toUnit) {
  if (value <= 0 || isNaN(value)) return 0;
  if (fromUnit === toUnit) return value;

  let meters = value;
  if (fromUnit === 'ft') meters = value * 0.3048;
  else if (fromUnit === 'in') meters = value * 0.0254;
  else if (fromUnit === 'mm') meters = value / 1000;
  else if (fromUnit === 'm') meters = value;

  let converted = meters;
  if (toUnit === 'ft') {
    converted = meters / 0.3048;
  } else if (toUnit === 'm') {
    converted = meters;
  }

  return roundHalfUp(converted, 3);
}

export function mapLegacyMethodCode(legacy) {
  const norm = (legacy || '').trim().toLowerCase();
  switch (norm) {
    case 'square feet':
    case 'sq_ft':
    case 'sqft':
      return 'sq_ft';
    case 'feet':
    case 'running feet':
    case 'run_ft':
      return 'run_ft';
    case 'metre square':
    case 'square metre':
    case 'square meter':
    case 'sq_m':
      return 'sq_m';
    case 'metre':
    case 'meter':
    case 'running metre':
    case 'running meter':
    case 'run_m':
      return 'run_m';
    case 'per piece':
    case 'per_piece':
      return 'per_piece';
    case 'lump sum':
    case 'lump_sum':
      return 'lump_sum';
    default:
      return 'sq_ft';
  }
}

