import type { SiteRecord } from "../../../../modules/leads/types"

export function createDefaultSite(siteNumber: number): SiteRecord {
  return {
    id: `site-${Date.now()}-${siteNumber}`,
    siteName: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    targetDeliveryDate: "",
    contactPerson: "",
    contactPhone: "",
    services: ["ACP Glow Sign"],
    mountingHeightAglFt: 10,
    wallSubstrate: "ACP",
    hasPowerPoint: true,
    powerDistanceM: 2.5,
    serviceDetails: [
      {
        id: `srv-${Date.now()}-1`,
        serviceNumber: 1,
        signStyle: "",
        application: "Outdoor",
        width: "",
        height: "",
        unit: "ft",
        quantity: 1,
        notSureOfDimensions: false,
        material: "",
        finishing: "",
        artworkStatus: "",
        color: "",
        referenceFiles: [],
        referenceImages: [],
        notes: "",
      },
    ],
  }
}
