// @ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:3001";
const TENANT_ID = "org_legacy_default";
const headers = { "Content-Type": "application/json", "x-tenant-id": TENANT_ID };

const customers = [
  {
    id: "cust-real-01",
    name: "Adyar Ananda Bhavan Sweets & Snacks",
    businessName: "A2B Retail Foods Pvt Ltd",
    contactPerson: "V. Srinivasan (Operations Head)",
    phone: "+91 98402 11223",
    isWhatsAppSame: true,
    whatsappNumber: "+91 98402 11223",
    email: "projects@a2bsweets.com",
    followUpDate: "2026-11-20",
    address: "No. 53, Lattice Bridge Road, Adyar, Chennai, Tamil Nadu 600020",
    customerType: "RETAIL_BRAND",
    gstin: "33AABCA4521F1ZX",
    stateCode: "33",
    paymentTerms: "ADVANCE_50",
    billingName: "A2B Retail Foods Pvt Ltd",
    billingAddress: "No. 53, Lattice Bridge Road, Adyar, Chennai, Tamil Nadu 600020",
    isShippingSameAsBilling: true,
    createdAt: new Date().toISOString(),
    sites: [
      {
        id: "site-a2b-01",
        siteName: "Adyar Main Flagship Branch",
        address: "No. 53, Lattice Bridge Road, Adyar, Chennai 600020",
        services: ["Frontlit Acrylic 3D LED Letters", "Double Sided Flange Round Lollipop"],
        serviceDetails: [
          {
            id: "svc-a2b-01",
            serviceNumber: 1,
            signStyle: "Frontlit Acrylic 3D LED Letter",
            width: "14",
            height: "3",
            unit: "ft",
            quantity: 1,
            material: "Cast Acrylic 3mm",
            finishing: "Mirror Gold Edge Trim",
            notes: "Warm white 3000K LED modules"
          },
          {
            id: "svc-a2b-02",
            serviceNumber: 2,
            signStyle: "Double Sided Flange Round Lollipop",
            width: "2",
            height: "2",
            unit: "ft",
            quantity: 1,
            material: "Aluminium Frame with Acrylic Face",
            finishing: "Powder Coated Matt Black",
            notes: "Projecting wall sign"
          }
        ]
      },
      {
        id: "site-a2b-02",
        siteName: "Velachery Express Kiosk",
        address: "Phoenix MarketCity Food Court, Velachery, Chennai 600042",
        services: ["Menu Backlit Fabric Slim Lightbox"],
        serviceDetails: [
          {
            id: "svc-a2b-03",
            serviceNumber: 1,
            signStyle: "Menu Backlit Fabric Slim Lightbox",
            width: "8",
            height: "2.5",
            unit: "ft",
            quantity: 1,
            material: "Aluminium Extrusion Frame",
            finishing: "Anodized Silver",
            notes: "Quick-change fabric graphic"
          }
        ]
      }
    ]
  },
  {
    id: "cust-real-02",
    name: "Apollo Hospitals Enterprise Ltd",
    businessName: "Apollo Hospitals Group",
    contactPerson: "Dr. Radhakrishnan (Infrastructure Director)",
    phone: "+91 94440 98765",
    isWhatsAppSame: true,
    whatsappNumber: "+91 94440 98765",
    email: "admin.infra@apollohospitals.com",
    followUpDate: "2026-11-25",
    address: "21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006",
    customerType: "CORPORATE",
    gstin: "33AAACA1122D1Z9",
    stateCode: "33",
    paymentTerms: "NET_30",
    billingName: "Apollo Hospitals Enterprise Ltd",
    billingAddress: "21 Greams Lane, Thousand Lights, Chennai, Tamil Nadu 600006",
    isShippingSameAsBilling: true,
    createdAt: new Date().toISOString(),
    sites: [
      {
        id: "site-apollo-01",
        siteName: "Emergency Block & Main Facade",
        address: "21 Greams Lane, Thousand Lights, Chennai 600006",
        services: ["High-Rise ACP Facade & 3D Letters", "Directional Pylon Totem Sign"],
        serviceDetails: [
          {
            id: "svc-apollo-01",
            serviceNumber: 1,
            signStyle: "High-Rise ACP Facade & 3D Letters",
            width: "24",
            height: "6",
            unit: "ft",
            quantity: 1,
            material: "ACP 4mm Heavy Duty",
            finishing: "Medical Red & Pure White",
            notes: "3M 40C Grade Reflective Vinyl"
          },
          {
            id: "svc-apollo-02",
            serviceNumber: 2,
            signStyle: "Directional Pylon Totem Sign",
            width: "5",
            height: "12",
            unit: "ft",
            quantity: 1,
            material: "Steel Framework with ACP Cladding",
            finishing: "Matte Grey PVDF Coating",
            notes: "Internal LED lighting"
          }
        ]
      }
    ]
  },
  {
    id: "cust-real-03",
    name: "Titan Eyeplus Optics",
    businessName: "Titan Company Limited",
    contactPerson: "Meera Nambiar (Regional Retail Manager)",
    phone: "+91 98841 55667",
    isWhatsAppSame: true,
    whatsappNumber: "+91 98841 55667",
    email: "meera.nambiar@titan.co.in",
    followUpDate: "2026-11-22",
    address: "No. 12, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
    customerType: "RETAIL_BRAND",
    gstin: "33AAACT2803Q1Z2",
    stateCode: "33",
    paymentTerms: "ADVANCE_50",
    billingName: "Titan Company Limited",
    billingAddress: "No. 12, Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
    isShippingSameAsBilling: true,
    createdAt: new Date().toISOString(),
    sites: [
      {
        id: "site-titan-01",
        siteName: "T. Nagar High Street Showroom",
        address: "No. 12, Usman Road, T. Nagar, Chennai 600017",
        services: ["Frameless Edge-lit Fabric Lightbox", "Titanium Gold SS 304 Backlit Logo"],
        serviceDetails: [
          {
            id: "svc-titan-01",
            serviceNumber: 1,
            signStyle: "Frameless Edge-lit Fabric Lightbox",
            width: "10",
            height: "4",
            unit: "ft",
            quantity: 1,
            material: "Aluminium Extrusion Frame",
            finishing: "Satin Silver Anodized",
            notes: "High CRI 90+ Daylite LEDs"
          },
          {
            id: "svc-titan-02",
            serviceNumber: 2,
            signStyle: "Titanium Gold SS 304 Backlit Logo",
            width: "8",
            height: "2",
            unit: "ft",
            quantity: 1,
            material: "SS 304 Stainless Steel",
            finishing: "Titanium Gold PVD Mirror",
            notes: "Halo illumination on clear acrylic spacer"
          }
        ]
      }
    ]
  }
];

const enquiries = [
  {
    id: "enq-real-01",
    contactName: "Karthik Sundaram (Chai Galli Cafe)",
    phone: "+91 98418 33445",
    email: "karthik@chaigalli.in",
    address: "Shop 4, Besant Nagar 2nd Avenue, Chennai 600090",
    source: "WHATSAPP",
    stage: "NEEDS_FOLLOW_UP",
    followUpDate: "2026-11-16",
    inquiryNote: "Neon Flex Custom Script Signboard (\"Chai Galli\" in Warm Amber) with rustic wooden backing panel",
    hasVectorLogo: true,
    wallSubstrate: "WOODEN_PANEL",
    mountingHeightFt: 9,
    hasPowerPoint: true,
  },
  {
    id: "enq-real-02",
    contactName: "Anand Mahindra Auto Parts",
    phone: "+91 98844 77889",
    email: "sales@mahindraautoparts.co.in",
    address: "Plot 84, SIDCO Industrial Estate, Ambattur, Chennai 600058",
    source: "WALK_IN",
    stage: "NEW",
    inquiryNote: "Heavy Duty ACP Glow Signboard with 3M Reflective Vinyl & Iron Framework (20x4 ft)",
    hasVectorLogo: false,
    wallSubstrate: "STEEL_STRUCTURE",
    mountingHeightFt: 16,
    hasPowerPoint: true,
  },
  {
    id: "enq-real-03",
    contactName: "Zudio Fast Fashion (Tata Retail)",
    phone: "+91 97900 12389",
    email: "projects.south@zudio.in",
    address: "Grand Square Mall, Velachery Bypass Road, Chennai 600042",
    source: "PHONE",
    stage: "NEEDS_FOLLOW_UP",
    followUpDate: "2026-11-18",
    inquiryNote: "3D Acrylic Face Lit Letters with Black Trim & Daylight 6500K LEDs for storefront entrance (16x3.5 ft)",
    hasVectorLogo: true,
    wallSubstrate: "CONCRETE",
    mountingHeightFt: 14,
    hasPowerPoint: true,
  }
];

const quotations = [
  {
    customerId: "cust-real-01",
    quoteNumber: "Q-101-V1",
    quoteDate: "15 Nov, 2026",
    subtotal: 43200,
    transportCost: 1800,
    designCharges: 2500,
    installationCharges: 5500,
    discountPercent: 0,
    gstRate: 18,
    grandTotal: 62540,
    notesJson: {
      fabNotes: "Use IP67 Samsung 3-LED modules with Meanwell IP67 power supply for outdoor weather resistance.",
      commercialTerms: "50% advance along with confirmed purchase order. Balance upon completion before site handover."
    },
    sites: [
      {
        id: "site-a2b-01",
        siteName: "Adyar Main Flagship Branch",
        items: [
          {
            id: "it-101",
            product_title: "Frontlit Acrylic 3D LED Letter",
            material_name: "Cast PMMA 3mm",
            finish_name: "Mirror Gold Trim",
            method_code: "sq_ft",
            width: 14,
            height: 3,
            quantity: 1,
            rate: 850,
            discount_pct: 0
          },
          {
            id: "it-102",
            product_title: "Double Sided Flange Round Lollipop",
            material_name: "Aluminium Frame with Acrylic Face",
            finish_name: "Powder Coated Matt Black",
            method_code: "per_piece",
            width: 2,
            height: 2,
            quantity: 1,
            rate: 7500,
            discount_pct: 0
          }
        ]
      }
    ]
  },
  {
    customerId: "cust-real-02",
    quoteNumber: "Q-102-V1",
    quoteDate: "15 Nov, 2026",
    subtotal: 147600,
    transportCost: 4500,
    designCharges: 6000,
    installationCharges: 18000,
    discountPercent: 0,
    gstRate: 18,
    grandTotal: 207798,
    notesJson: {
      fabNotes: "3M 40C Grade Reflective Vinyl with UV protective overlaminate. Emergency lettering in Medical Red #DC2626.",
      commercialTerms: "Payment terms: 30 days credit with Apollo Enterprise purchase requisition approval."
    },
    sites: [
      {
        id: "site-apollo-01",
        siteName: "Emergency Block & Main Facade",
        items: [
          {
            id: "it-201",
            product_title: "High-Rise ACP Facade & 3D Letters",
            material_name: "ACP 4mm Heavy Duty",
            finish_name: "Medical Red & Pure White",
            method_code: "sq_ft",
            width: 24,
            height: 6,
            quantity: 1,
            rate: 650,
            discount_pct: 0
          },
          {
            id: "it-202",
            product_title: "Directional Pylon Totem Sign",
            material_name: "Steel Framework with ACP Cladding",
            finish_name: "Matte Grey PVDF Coating",
            method_code: "sq_ft",
            width: 5,
            height: 12,
            quantity: 1,
            rate: 900,
            discount_pct: 0
          }
        ]
      }
    ]
  },
  {
    customerId: "cust-real-03",
    quoteNumber: "Q-103-V1",
    quoteDate: "15 Nov, 2026",
    subtotal: 48500,
    transportCost: 1500,
    designCharges: 3000,
    installationCharges: 4500,
    discountPercent: 0,
    gstRate: 18,
    grandTotal: 67850,
    notesJson: {
      fabNotes: "Titanium gold PVD coating on Grade 304 Stainless Steel sheet with laser chamfered edges.",
      commercialTerms: "50% advance, balance on delivery and inspection."
    },
    sites: [
      {
        id: "site-titan-01",
        siteName: "T. Nagar High Street Showroom",
        items: [
          {
            id: "it-301",
            product_title: "Frameless Edge-lit Fabric Lightbox",
            material_name: "Aluminium Extrusion Frame",
            finish_name: "Satin Silver Anodized",
            method_code: "sq_ft",
            width: 10,
            height: 4,
            quantity: 1,
            rate: 750,
            discount_pct: 0
          },
          {
            id: "it-302",
            product_title: "Titanium Gold SS 304 Backlit Logo",
            material_name: "SS 304 Stainless Steel",
            finish_name: "Titanium Gold PVD Mirror",
            method_code: "per_piece",
            width: 8,
            height: 2,
            quantity: 1,
            rate: 18500,
            discount_pct: 0
          }
        ]
      }
    ]
  }
];

async function seedData() {
  console.log("=== Seeding 3 Customers ===");
  for (const c of customers) {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify(c),
    });
    console.log(`Created customer "${c.name}": status ${res.status}`);
  }

  console.log("\n=== Seeding 3 Enquiries ===");
  for (const e of enquiries) {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify(e),
    });
    console.log(`Created enquiry "${e.contactName}": status ${res.status}`);
  }

  console.log("\n=== Seeding 3 Quotations ===");
  for (const q of quotations) {
    const res = await fetch(`${BASE_URL}/api/quotations`, {
      method: "POST",
      headers,
      body: JSON.stringify(q),
    });
    console.log(`Created quote "${q.quoteNumber}": status ${res.status}`);
  }

  // Also update seedData.json so it reflects these canonical 3 items
  const seedPath = path.resolve(__dirname, "../server/seedData.json");
  if (fs.existsSync(seedPath)) {
    const existing = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    existing.customers = customers;
    existing.enquiries = enquiries;
    fs.writeFileSync(seedPath, JSON.stringify(existing, null, 2), "utf-8");
    console.log("\nUpdated server/seedData.json with the 3 realistic records.");
  }

  console.log("\n>>> ALL 3 CUSTOMERS, 3 ENQUIRIES, 3 QUOTATIONS CREATED! <<<");
}

seedData().catch(console.error);
