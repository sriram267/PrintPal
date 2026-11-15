export interface ProductRecord {
  id: string;
  title: string;
  category: string;
  description?: string;
  basePrice?: number;
  unit?: string;
  materialIds?: string[];
  finishIds?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface MaterialRecord {
  id: string;
  name: string;
  category: string;
  thicknessMm?: number;
  density?: number;
  costPerSqFt?: number;
  isActive?: boolean;
}

export interface FinishRecord {
  id: string;
  name: string;
  type: string;
  ralCode?: string;
  costPerSqFt?: number;
  isActive?: boolean;
}

