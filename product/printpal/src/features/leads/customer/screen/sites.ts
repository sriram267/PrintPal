import type { SiteRecord } from "../../shared/types"
import { newId } from "../../../../shared/newId"

export function createDefaultSite(siteNumber: number): SiteRecord {
  return {
    id: newId(`site-${siteNumber}`),
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
