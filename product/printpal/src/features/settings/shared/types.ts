// Product, material and finish records (the catalogue).

export interface ProductRecord {
  id: string;
  title: string;
  alsoCalled?: string;
  category?: string;
  description?: string;
  pricedPer?: 'Per letter' | 'Per sq ft' | 'Per inch' | 'Per running ft' | 'Per piece' | 'Lump sum' | string;
  alsoPricedBy?: string;
  sizeRange?: string;
  lighting?: string;
  needsInstallation?: string;
  leadTime?: string;
  materialIds?: string[];
  finishIds?: string[];
  isActive?: boolean;
  researchConfidence?: string;
  width?: string;
  height?: string;
  unit?: string;
  material?: string;
  colour?: string;
  finishing?: string;
  application?: 'Indoor' | 'Outdoor' | 'Coastal' | 'Both';
  productionType?: 'INTERNAL' | 'OUTSOURCE' | 'HYBRID';
  notes?: string;
  createdAt: string;
}

export interface MaterialRecord {
  id: string;
  name: string;
  alsoCalled?: string;
  family?: string;
  category?: string;
  unit?: string;
  variants?: string;
  thickness?: string;
  standardSize?: string;
  indoor?: boolean;
  outdoor?: boolean;
  coastal?: boolean;
  coastalBasis?: string;
  application?: 'Indoor' | 'Outdoor' | 'Coastal';
  supplierName?: string;
  researchConfidence?: string;
  notes?: string;
  createdAt: string;
}

export interface FinishRecord {
  id: string;
  name: string;
  alsoCalled?: string;
  type?: string;
  worksOn?: string;
  variants?: string;
  indoor?: boolean;
  outdoor?: boolean;
  coastal?: string;
  costEffect?: string;
  leadTimeImpact?: string;
  colorCode?: string;
  application?: 'Indoor' | 'Outdoor' | 'Coastal';
  researchConfidence?: string;
  notes?: string;
  createdAt: string;
}
