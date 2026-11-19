export interface SettingsMenuItem {
  id: string;
  label: string;
  iconName: string;
  group: 'business' | 'products' | 'quotation' | 'supplier' | 'general';
  description?: string;
}

export const SETTINGS_MENU_GROUPS = [
  { id: 'business', label: 'Business Setting' },
  { id: 'products', label: 'Products & Finishes' },
  { id: 'quotation', label: 'Quotation & Taxes' },
  { id: 'supplier', label: 'Supplier & Vendors' },
  { id: 'general', label: 'Workspace & Profile' },
] as const;

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    id: 'businessDetails',
    label: 'Business Details',
    iconName: 'Building2',
    group: 'business',
    description: 'Company logo, legal name, registered address, GSTIN/PAN, contact info, and signature',
  },
  {
    id: 'products',
    label: 'Products',
    iconName: 'Package',
    group: 'products',
    description: 'Signage catalog products, specifications, and media',
  },
  {
    id: 'materials',
    label: 'Materials',
    iconName: 'Layers',
    group: 'products',
    description: 'Sheet substrates, acrylics, and structural media',
  },
  {
    id: 'finishes',
    label: 'Finishes',
    iconName: 'Sparkles',
    group: 'products',
    description: 'Powder coating, anodizing, and vinyl treatments',
  },
  {
    id: 'tax',
    label: 'Tax Setting',
    iconName: 'Receipt',
    group: 'quotation',
    description: 'Customize statutory tax slabs (CGST, SGST, IGST) that align with business needs',
  },
  {
    id: 'supplier',
    label: 'Supplier',
    iconName: 'Building',
    group: 'supplier',
    description: 'Configure supplier vendor portal and procurement tabs',
  },
];

