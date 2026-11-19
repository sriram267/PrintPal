

export interface TaxRecord {
  id: string
  name: string
  percentage: number
}

export const DEFAULT_TAXES: TaxRecord[] = [
  { id: "tax-cgst", name: "CGST", percentage: 9 },
  { id: "tax-sgst", name: "SGST", percentage: 7 },
  { id: "tax-nt-tax", name: "NT TAX (Tax Group)", percentage: 16 },
]
