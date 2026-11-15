/**
 * Sample data for the hero's Quotation screen (a rebuild of the product's QuotationView).
 * Product names come from the product's seed catalogue, methods from its Method dropdown, and line
 * maths mirrors product/printpal/src/modules/quotation/calcLine.ts. Totals are calculated, never typed.
 */

export type Origin = "fabrication" | "print";
export type MethodCode = "sq_ft" | "per_piece";

export const METHODS: Record<MethodCode, { name: string; rateLabel: string; area: boolean }> = {
  sq_ft: { name: "Square Feet", rateLabel: "per sq ft", area: true },
  per_piece: { name: "Per Piece", rateLabel: "per piece", area: false },
};

export interface SampleLine {
  id: string;
  product: string;
  material: string;
  finish: string;
  method: MethodCode;
  /** Width × height in ft (area methods only). */
  size?: [number, number];
  qty: number;
  rate: number;
  discount: number;
}

export interface SampleSite {
  id: string;
  name: string;
  origin: Origin;
  lines: SampleLine[];
}

export const CUSTOMER = {
  name: "Meridian Interiors",
  contact: "Ravi Kumar",
  phone: "+91 98765 43210",
  quoteNumber: "Q-001-V1",
  quoteDate: "15 Nov, 2026",
};

/* Order matters for the hero: the print site is first (upper) so the printer on the LEFT reaches its rows
   across the open left edge, and the fabrication site is second (lower) so the CNC on the RIGHT reaches its
   rows across the empty space under the Quote Summary, not through it. */
export const SITES: SampleSite[] = [
  {
    id: "s1",
    name: "Indiranagar Showroom",
    origin: "print",
    lines: [
      { id: "l3", product: "Flex Banner", material: "Backlit Flex, 510 GSM", finish: "Hemmed + Eyelets", method: "sq_ft", size: [20, 10], qty: 1, rate: 28, discount: 0 },
      { id: "l4", product: "Window Graphic", material: "Perforated Vinyl", finish: "Matte Lamination", method: "sq_ft", size: [6, 3], qty: 2, rate: 65, discount: 0 },
    ],
  },
  {
    id: "s2",
    name: "Koramangala Studio",
    origin: "fabrication",
    lines: [
      { id: "l1", product: "ACP Board", material: "Aluminium Composite Panel, 3 mm", finish: "Digital Print + Lamination", method: "sq_ft", size: [12, 4], qty: 1, rate: 450, discount: 0 },
      { id: "l2", product: "Front-Lit Channel Letters", material: "Acrylic 3 mm, Aluminium Returns", finish: "Vinyl Face, LED Modules", method: "per_piece", qty: 14, rate: 1200, discount: 0 },
    ],
  },
];

export const CHARGES = { installation: 3500, transport: 1200, discountPercent: 5, gstRate: 18 };

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const areaOf = (l: SampleLine) => (l.size ? l.size[0] * l.size[1] : 0);

export function lineTotal(l: SampleLine): number {
  const billable = METHODS[l.method].area ? areaOf(l) * l.qty : l.qty;
  const gross = billable * l.rate;
  return round2(gross - (gross * l.discount) / 100);
}

export function summary() {
  const sitesSubtotal = SITES.reduce((s, site) => s + site.lines.reduce((t, l) => t + lineTotal(l), 0), 0);
  const discountAmount = round2((sitesSubtotal * CHARGES.discountPercent) / 100);
  const taxable = round2(sitesSubtotal + CHARGES.installation + CHARGES.transport - discountAmount);
  const gstAmount = round2((taxable * CHARGES.gstRate) / 100);
  return { sitesSubtotal, discountAmount, taxable, gstAmount, grandTotal: round2(taxable + gstAmount) };
}

const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inr = new Intl.NumberFormat("en-IN");

/** ₹21,600.00 */
export const rupees2 = (n: number) => `₹${inr2.format(n)}`;
/** ₹3,500 */
export const rupees = (n: number) => `₹${inr.format(n)}`;
