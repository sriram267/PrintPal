const fs = require('fs');
const path = require('path');

const seedPath = path.resolve(__dirname, '../server/seedData.json');
const outPath = path.resolve(__dirname, '../src/modules/leads/seedCatalog.ts');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const materials = seed.materials.map(m => ({
  ...m,
  thickness: (m.variants || '').split('.')[0] || '',
  standardSize: '8 x 4 ft standard sheet',
  application: m.outdoor ? 'Outdoor' : 'Indoor',
  supplierName: 'National Mill Stock',
  createdAt: '2026-03-31T00:00:00.000Z'
}));

const finishes = seed.finishes.map(f => ({
  ...f,
  colorCode: f.variants || 'Standard Finishes',
  application: f.outdoor ? 'Outdoor' : 'Indoor',
  createdAt: '2026-03-31T00:00:00.000Z'
}));

const products = seed.products.map(p => ({
  ...p,
  width: '1200',
  height: '600',
  unit: 'mm',
  material: '',
  colour: '',
  finishing: '',
  productionType: 'INTERNAL',
  createdAt: '2026-03-31T00:00:00.000Z'
}));

const tsContent = `// PrintPal Seed Catalogue — Master Data for Pilot Signage Shops
// Auto-generated directly from build docs/printpal_sign_seed_catalogue.xlsx
import type { ProductRecord, MaterialRecord, FinishRecord } from './types';

export const DEFAULT_MATERIALS: MaterialRecord[] = ${JSON.stringify(materials, null, 2)};

export const DEFAULT_FINISHES: FinishRecord[] = ${JSON.stringify(finishes, null, 2)};

export const DEFAULT_PRODUCTS: ProductRecord[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(outPath, tsContent);
console.log('Successfully generated src/modules/leads/seedCatalog.ts! Size:', fs.statSync(outPath).size);

