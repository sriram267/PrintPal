import * as React from "react"
import { useUser, useClerk } from "@clerk/react"
import { Button } from "@/components/ui/button"
import { PalNotch, palNotch } from "@ui/pal-notch"
import { QuotationView, type RenegotiatingQuoteData, type QuoteSite } from "../features/quotation/create-quote/screen/QuotationView"
import { QuotationReportsView, type QuotationListItem } from "../features/quotation/reports/screen/QuotationReportsView"
import { QuotePDFPreview, type QuotePDFDocumentProps } from "../features/quotation/pdf/screen/QuotePDFPreview"
import { BusinessDetailsView } from "../features/settings/business-details/screen/BusinessDetailsView"
import {
  type BusinessDetailsRecord,
  loadBusinessDetailsFromStorage,
  saveBusinessDetailsToStorage,
} from "../features/settings/business-details/screen/businessDetails.types"
import type { CustomerRecord, EnquiryRecord, SupplierRecord, ServiceItem, SiteRecord, CustomerDrawerAnchor } from "../features/leads/shared/types"
import type { ProductRecord, MaterialRecord, FinishRecord } from "../features/settings/shared/types"
import { leadsService } from "../shared/leadsService"
import { validateCustomerForm, validateEnquiryForm } from "../features/leads/shared/validation"
import "./leads.css"
import { DEFAULT_MATERIALS, DEFAULT_FINISHES, DEFAULT_PRODUCTS } from "../features/settings/starter-catalogue/screen/seedCatalog"
import { type TaxRecord, DEFAULT_TAXES } from "../features/settings/tax/screen/taxes"
import { getNextQuoteVersion } from "../features/quotation/reports/screen/quoteVersion"
import { createDefaultSite } from "../features/leads/customer/screen/sites"
import { renderLeadsHeader } from "../features/leads/shared/LeadsHeader"
import { renderLeadsTable } from "../features/leads/shared/LeadsTable"
import { renderTopNav } from "./TopNav"
import { renderSettingsMenu } from "../features/settings/menu"
import { renderProductsPage } from "../features/settings/products/screen/ProductsPage"
import { renderMaterialsPage } from "../features/settings/materials/screen/MaterialsPage"
import { renderFinishesPage } from "../features/settings/finishes/screen/FinishesPage"
import { renderTaxPage } from "../features/settings/tax/screen/TaxPage"
import { renderSupplierSwitchPage } from "../features/settings/supplier/screen/SupplierSwitchPage"
import { renderSupplierForm } from "../features/leads/supplier/screen/SupplierForm"
import { renderProductForm } from "../features/settings/products/screen/ProductForm"
import { renderMaterialForm } from "../features/settings/materials/screen/MaterialForm"
import { renderFinishForm } from "../features/settings/finishes/screen/FinishForm"
import { renderCustomerForm, type GeoapifySuggestion, GEOAPIFY_API_KEY } from "../features/leads/customer/screen/CustomerForm"
import { renderMultiSiteModal } from "../features/leads/customer/screen/MultiSiteModal"
import { renderQuickAddProductModal } from "../features/settings/products/screen/QuickAddProductModal"
import { renderTaxModal } from "../features/settings/tax/screen/TaxModal"

const STORAGE_CUSTOMERS_KEY = "printpal_workshop_customers_v3"
const STORAGE_ENQUIRIES_KEY = "printpal_workshop_enquiries_v3"

const SIGNAGE_SERVICES_OPTIONS = [
  "Acrylic Sheets & Laser Cutting",
  "ACP Cladding & Router Cutting",
  "LED Modules & SMPS Drivers",
  "Neon Flex & 12V Power Supplies",
  "Vinyl Printing & Lamination",
  "Flex Banners & Backlit Substrates",
  "Aluminium Extrusions & Box Profiles",
  "MS / SS Metal Fabrication & Frames",
  "Polycarbonate & Sunpack Sheets",
  "Channel Letters & 3D Fabrication",
  "Powder Coating & Industrial Painting",
  "On-Site Installation & Mounting",
]

const DEFAULT_LOCATIONS_OPTIONS = [
  "Greater Chennai (All Industrial Zones)",
  "Kanchipuram & Sriperumbudur Hub",
  "Chengalpattu & Maraimalai Nagar",
  "Tiruvallur & Gummidipoondi",
  "Coimbatore & Tiruppur Industrial Belt",
  "Madurai & Dindigul",
  "Tiruchirappalli (Trichy)",
  "Salem & Erode",
  "Vellore & Ranipet",
  "Bangalore Urban & Electronic City",
  "Hyderabad & Secunderabad",
  "Pan-Tamil Nadu",
  "Pan-South India",
  "Pan-India Delivery",
]

export function LeadsApp() {
  const [activeModule, setActiveModule] = React.useState<"leads" | "quotation" | "quotationReports" | "settings">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes("setting") || hash.includes("product")) return "settings"
      if (hash.includes("quotation-reports") || hash.includes("quotationreports") || hash.includes("billing-reports") || hash.includes("billingreports")) return "quotationReports"
      if (hash.includes("quotation") || hash.includes("quote") || hash.includes("billing")) return "quotation"
    }
    return "leads"
  })
  const [activeTab, setActiveTab] = React.useState<"customer" | "enquiry" | "supplier">("customer")
  const [customers, setCustomers] = React.useState<CustomerRecord[]>([])
  const [enquiries, setEnquiries] = React.useState<EnquiryRecord[]>([])
  const [suppliers, setSuppliers] = React.useState<SupplierRecord[]>([])
  const [products, setProducts] = React.useState<ProductRecord[]>([])
  const [materials, setMaterials] = React.useState<MaterialRecord[]>([])
  const [finishes, setFinishes] = React.useState<FinishRecord[]>([])
  const [quotationSelectedCustomer, setQuotationSelectedCustomer] = React.useState<CustomerRecord | null>(null)
  const [renegotiatingQuote, setRenegotiatingQuote] = React.useState<RenegotiatingQuoteData | null>(null)
  // Quote just created → Quotation Reports opens its customer group and highlights the new line
  const [justCreatedQuote, setJustCreatedQuote] = React.useState<{ customerId: string; quoteNumber: string } | null>(null)
  /* The printed quotation sheet lives here, above every screen, so it can retract while the screen behind switches. */
  const [documentSheet, setDocumentSheet] = React.useState<{ doc: QuotePDFDocumentProps; fresh: boolean } | null>(null)

  // Settings Module State
  const [settingsMenu, setSettingsMenu] = React.useState<"businessDetails" | "products" | "materials" | "finishes" | "tax" | "supplier">("products")
  const [expandedSettingsGroups, setExpandedSettingsGroups] = React.useState<{
    businessSetting: boolean
    products: boolean
    quotation: boolean
    supplier: boolean
  }>({
    businessSetting: true,
    products: true,
    quotation: false,
    supplier: true,
  })

  const toggleSettingsGroup = (group: "businessSetting" | "products" | "quotation" | "supplier") => {
    setExpandedSettingsGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Business Details State
  const [businessDetails, setBusinessDetails] = React.useState<BusinessDetailsRecord>(() =>
    loadBusinessDetailsFromStorage()
  )

  // Supplier Module Enable/Disable State
  const [isSupplierEnabled, setIsSupplierEnabled] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("printpal_supplier_enabled")
    return saved !== null ? saved === "true" : true
  })

  React.useEffect(() => {
    if (!isSupplierEnabled && activeTab === "supplier") {
      setActiveTab("customer")
    }
  }, [isSupplierEnabled, activeTab])

  // Tax Settings State
  const [taxes, setTaxes] = React.useState<TaxRecord[]>(DEFAULT_TAXES)
  const [applyTaxesToSaleableItems, setApplyTaxesToSaleableItems] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("printpal_apply_taxes")
      return saved !== null ? saved === "true" : true
    } catch {
      return true
    }
  })
  const [isTaxModalOpen, setIsTaxModalOpen] = React.useState(false)
  const [editingTax, setEditingTax] = React.useState<TaxRecord | null>(null)
  const [taxForm, setTaxForm] = React.useState<{ name: string; percentage: string }>({
    name: "",
    percentage: "",
  })
  const [taxErrors, setTaxErrors] = React.useState<{ name?: string; percentage?: string }>({})



  // Material Form State
  const [materialForm, setMaterialForm] = React.useState<{
    name: string
    category: string
    thickness: string
    standardSize: string
    application: "Indoor" | "Outdoor" | "Coastal"
    supplierName: string
    notes: string
  }>({
    name: "",
    category: "Acrylic & Diffusers",
    thickness: "3mm",
    standardSize: "8 × 4 ft Sheet",
    application: "Outdoor",
    supplierName: "",
    notes: "",
  })
  const [materialErrors, setMaterialErrors] = React.useState<Record<string, string>>({})
  const [editingMaterialId, setEditingMaterialId] = React.useState<string | null>(null)

  // Finish Form State
  const [finishForm, setFinishForm] = React.useState<{
    name: string
    type: string
    colorCode: string
    application: "Indoor" | "Outdoor" | "Coastal"
    notes: string
  }>({
    name: "",
    type: "Powder Coating",
    colorCode: "RAL 9016 (Pure White)",
    application: "Outdoor",
    notes: "",
  })
  const [finishErrors, setFinishErrors] = React.useState<Record<string, string>>({})
  const [editingFinishId, setEditingFinishId] = React.useState<string | null>(null)

  // Product Form State
  const [productForm, setProductForm] = React.useState({
    title: "",
    category: "Channel Letters",
    description: "",
    pricedPer: "Per letter" as "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum",
    materialIds: [] as string[],
    finishIds: [] as string[],
    isActive: true,
    width: "1200",
    height: "600",
    unit: "mm",
    returnDepth: "75mm",
    minStroke: "15mm",
    material: "",
    finishing: "",
    colour: "",
    application: "Outdoor" as "Indoor" | "Outdoor" | "Coastal",
    productionType: "INTERNAL" as "INTERNAL" | "OUTSOURCE" | "HYBRID",
    illumination: "Samsung 12V 6500K IP67 LED Modules",
    mounting: "Flush Stud Mount with Acrylic Standoffs",
    leadTime: "3-5 Working Days",
    notes: "",
  })
  const [productErrors, setProductErrors] = React.useState<Record<string, string>>({})
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null)

  const [materialsSearchInDrawer, setMaterialsSearchInDrawer] = React.useState("")
  const [finishesSearchInDrawer, setFinishesSearchInDrawer] = React.useState("")

  // Quick Product Modal & Service target tracker
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = React.useState(false)
  const [quickProductName, setQuickProductName] = React.useState("")
  const [quickProductError, setQuickProductError] = React.useState<string | null>(null)
  const [quickProductDesc, setQuickProductDesc] = React.useState("")
  const [quickProductSelectedMats, setQuickProductSelectedMats] = React.useState<string[]>([])
  const [quickProductSelectedFins, setQuickProductSelectedFins] = React.useState<string[]>([])
  const [quickTargetService, setQuickTargetService] = React.useState<{ siteIdx: number; srvIdx: number } | null>(null)
  const [productDrawerReturnTitle, setProductDrawerReturnTitle] = React.useState<string | null>(null)

  // Supplier Form State
  const [supplierForm, setSupplierForm] = React.useState<{
    supplierName: string
    contactPerson: string
    phone: string
    email: string
    isWhatsAppSame: boolean
    whatsappNumber: string
    category: string
    gstin: string
    address: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    servingRegions: string
    isBillingSameAsWarehouse: boolean
    billingAddress: string
    billingAddressLine1: string
    billingAddressLine2: string
    billingCity: string
    billingState: string
    billingPincode: string
    isShippingSameAsBilling: boolean
    shippingAddress: string
    shippingAddressLine1: string
    shippingAddressLine2: string
    shippingCity: string
    shippingState: string
    shippingPincode: string
    deliveryLeadTime: string
    minOrderQty: string
    paymentTerms: string
    notes: string
  }>({
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    isWhatsAppSame: true,
    whatsappNumber: "",
    category: "",
    gstin: "",
    address: "",
    addressLine1: "",
    addressLine2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600032",
    servingRegions: "Greater Chennai (All Industrial Zones)",
    isBillingSameAsWarehouse: true,
    billingAddress: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "Chennai",
    billingState: "Tamil Nadu",
    billingPincode: "600032",
    isShippingSameAsBilling: true,
    shippingAddress: "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
    shippingAddressLine1: "No. 8 Industrial Estate",
    shippingAddressLine2: "Guindy",
    shippingCity: "Chennai",
    shippingState: "Tamil Nadu",
    shippingPincode: "600032",
    deliveryLeadTime: "Same Day (2-4 hrs)",
    minOrderQty: "1 sheet / 1 pc",
    paymentTerms: "ADVANCE",
    notes: "",
  })
  const [supplierErrors, setSupplierErrors] = React.useState<Record<string, string>>({})
  const [editingSupplierId, setEditingSupplierId] = React.useState<string | null>(null)

  // Supplier multi-select dropdown states
  const [servicesDropdownOpen, setServicesDropdownOpen] = React.useState(false)
  const [servicesSearchQuery, setServicesSearchQuery] = React.useState("")
  const [locationsDropdownOpen, setLocationsDropdownOpen] = React.useState(false)
  const [locationsSearchQuery, setLocationsSearchQuery] = React.useState("")

  // Modal & Drawer State (Desktop - 4)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingCustomerId, setEditingCustomerId] = React.useState<string | null>(null)
  const [editingEnquiryId, setEditingEnquiryId] = React.useState<string | null>(null)
  const [activeRightTab, setActiveRightTab] = React.useState<"services" | "billing">("services")
  const [collapsedSites, setCollapsedSites] = React.useState<Set<string>>(new Set())
  const [drawerAnchor, setDrawerAnchor] = React.useState<CustomerDrawerAnchor | null>(null)
  const [highlightedAnchorKey, setHighlightedAnchorKey] = React.useState<string | null>(null)

  // Multi-Site Modal State (Desktop - 2)
  const [selectedCustomerForSites, setSelectedCustomerForSites] = React.useState<CustomerRecord | null>(null)

  // Validation & Toast States
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [drawerTitle, setDrawerTitle] = React.useState<string>("New Customer")

  // Clerk Authentication & Session State
  const { user } = useUser()
  const clerk = useClerk()
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)
  const hasAnnouncedLogin = React.useRef(false)

  React.useEffect(() => {
    if (user && !hasAnnouncedLogin.current) {
      hasAnnouncedLogin.current = true
      const email = user.primaryEmailAddress?.emailAddress || ""
      const displayName = user.firstName || user.fullName || email.split("@")[0] || "Operator"

      // 1. Sync with Neon PostgreSQL backend
      fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email,
          fullName: user.fullName || displayName,
          imageUrl: user.imageUrl,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.tenantId) {
            localStorage.setItem("printpal_active_tenant_id", data.tenantId)
          }
        })
        .catch((err) => console.warn("[Auth Sync] Notice:", err))

      // 2. Announce Login Successful in Pal Notch Dynamic Island
      palNotch.notify({
        title: `Welcome back, ${displayName}`,
        variant: "success",
      })
    }
  }, [user])

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
      palNotch.notify({
        title: message,
        variant: type,
      })
    },
    []
  )

  const handleOpenAddTaxModal = React.useCallback(() => {
    setEditingTax(null)
    setTaxForm({ name: "", percentage: "" })
    setTaxErrors({})
    setIsTaxModalOpen(true)
  }, [])

  const handleOpenEditTaxModal = React.useCallback((tax: TaxRecord) => {
    setEditingTax(tax)
    setTaxForm({ name: tax.name, percentage: String(tax.percentage) })
    setTaxErrors({})
    setIsTaxModalOpen(true)
  }, [])

  const handleSaveTax = React.useCallback(() => {
    const trimmedName = taxForm.name.trim()
    const parsedPercentage = parseFloat(taxForm.percentage)
    const errors: { name?: string; percentage?: string } = {}

    if (!trimmedName) {
      errors.name = "Tax name is required"
    }
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      errors.percentage = "Enter a valid percentage between 0 and 100"
    }

    if (Object.keys(errors).length > 0) {
      setTaxErrors(errors)
      return
    }

    setTaxErrors({})

    if (editingTax) {
      setTaxes((prev) =>
        prev.map((t) => (t.id === editingTax.id ? { ...t, name: trimmedName, percentage: parsedPercentage } : t))
      )
      showToast(`${trimmedName} updated`, "success")
    } else {
      const newTax: TaxRecord = {
        id: `tax_${Date.now()}`,
        name: trimmedName,
        percentage: parsedPercentage,
      }
      setTaxes((prev) => [...prev, newTax])
      showToast(`${trimmedName} added to taxes`, "success")
    }

    setIsTaxModalOpen(false)
    setEditingTax(null)
    setTaxForm({ name: "", percentage: "" })
    setTaxErrors({})
  }, [taxForm, editingTax, showToast])

  const handleSaveBusinessDetails = React.useCallback(
    async (updated: BusinessDetailsRecord) => {
      saveBusinessDetailsToStorage(updated)
      setBusinessDetails(updated)
      try {
        const res = await fetch("/api/business-details", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        })
        if (res.ok) {
          showToast("Business details saved", "success")
          return
        }
      } catch {
        // Offline / localStorage persisted fallback
      }
      showToast("Business details saved on this device", "success")
    },
    [showToast]
  )

  // Geoapify Places Autocomplete State
  const [isSearchingPlaces, setIsSearchingPlaces] = React.useState(false)
  const [geoapifyPredictions, setGeoapifyPredictions] = React.useState<GeoapifySuggestion[]>([])

  // Form State: Sites & Services
  const [formSites, setFormSites] = React.useState<SiteRecord[]>([])

  React.useEffect(() => {
    if (!highlightedAnchorKey) return
    const timer = window.setTimeout(() => {
      setHighlightedAnchorKey(null)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [highlightedAnchorKey])

  React.useEffect(() => {
    if (!isModalOpen || !drawerAnchor) return

    let targetDomId: string | null = null
    let focusDomId: string | null = null
    let blockAlign: ScrollLogicalPosition = "start"

    if (drawerAnchor.section === "basic") {
      targetDomId = "drawer-basic-details-card"
      focusDomId = "input-biz-name"
    } else if (drawerAnchor.section === "add-site") {
      targetDomId = "drawer-add-site-btn"
      focusDomId = "drawer-add-site-btn"
      blockAlign = "center"
    } else {
      const matchedById = drawerAnchor.siteId
        ? formSites.findIndex((s) => s.id === drawerAnchor.siteId)
        : -1
      const resolvedSiteIdx =
        matchedById >= 0
          ? matchedById
          : Math.min(Math.max(drawerAnchor.siteIdx ?? 0, 0), Math.max(formSites.length - 1, 0))

      if (drawerAnchor.section === "site") {
        targetDomId = `drawer-site-${resolvedSiteIdx}`
        focusDomId = `drawer-site-${resolvedSiteIdx}-name`
      } else if (drawerAnchor.section === "add-service") {
        targetDomId = `drawer-site-${resolvedSiteIdx}-add-service`
        focusDomId = `drawer-site-${resolvedSiteIdx}-add-service`
        blockAlign = "center"
      } else if (drawerAnchor.section === "service") {
        const services = formSites[resolvedSiteIdx]?.serviceDetails || []
        if (services.length > 0) {
          const matchedSrvById = drawerAnchor.serviceId
            ? services.findIndex((srv) => srv.id === drawerAnchor.serviceId)
            : -1
          const resolvedSrvIdx =
            matchedSrvById >= 0
              ? matchedSrvById
              : Math.min(Math.max(drawerAnchor.serviceIdx ?? 0, 0), services.length - 1)
          targetDomId = `drawer-site-${resolvedSiteIdx}-service-${resolvedSrvIdx}`
        } else {
          targetDomId = `drawer-site-${resolvedSiteIdx}`
        }
      }
    }

    if (!targetDomId) return

    const resolvedId = targetDomId
    const scrollTimer = window.setTimeout(() => {
      const el = document.getElementById(resolvedId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: blockAlign })
        setHighlightedAnchorKey(resolvedId)
      }
      if (focusDomId) {
        const focusEl = document.getElementById(focusDomId)
        if (focusEl && typeof focusEl.focus === "function") {
          focusEl.focus({ preventScroll: true })
        }
      }
      setDrawerAnchor(null)
    }, 120)

    return () => window.clearTimeout(scrollTimer)
  }, [isModalOpen, drawerAnchor, formSites])

  // Active Search State
  const [activeSearchSiteId, setActiveSearchSiteId] = React.useState<string | null>(null)

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".printpal-site-search-wrapper")) {
        setActiveSearchSiteId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Live Geoapify Places Predictions
  React.useEffect(() => {
    if (!activeSearchSiteId) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }
    const currentSite = formSites.find((s) => s.id === activeSearchSiteId)
    const query = (currentSite?.address || "").trim()
    if (!query || query.length < 2) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }

    if (!GEOAPIFY_API_KEY) {
      setGeoapifyPredictions([])
      setIsSearchingPlaces(false)
      return
    }

    setIsSearchingPlaces(true)
    const timer = setTimeout(async () => {
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&bias=countrycode:in&limit=5&apiKey=${GEOAPIFY_API_KEY}`
        const res = await fetch(url)
        if (!res.ok) {
          setIsSearchingPlaces(false)
          setGeoapifyPredictions([])
          return
        }
        const data = await res.json()
        const features = data.features || []
        const mapped: GeoapifySuggestion[] = features.map((f: any, idx: number) => {
          const p = f.properties || {}
          const line1 = p.address_line1 || [p.housenumber, p.street].filter(Boolean).join(" ") || p.name || ""
          const line2 = p.suburb || p.district || p.neighbourhood || p.address_line2 || ""
          const cityName = p.city || p.town || p.village || p.county || ""
          return {
            id: p.place_id || `geo-${idx}-${Date.now()}`,
            name: p.name || line1 || cityName,
            formattedAddress: p.formatted || `${line1}, ${cityName}`,
            addressLine1: line1,
            addressLine2: line2,
            city: cityName,
            state: p.state || "",
            pincode: p.postcode || "",
            lat: p.lat ?? f.geometry?.coordinates?.[1] ?? 0,
            lng: p.lon ?? f.geometry?.coordinates?.[0] ?? 0,
          }
        })
        setGeoapifyPredictions(mapped)
      } catch {
        setGeoapifyPredictions([])
      } finally {
        setIsSearchingPlaces(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [activeSearchSiteId, formSites])

  const handleSelectPlace = (siteIdx: number, place: GeoapifySuggestion) => {
    const updated = [...formSites]
    updated[siteIdx] = {
      ...updated[siteIdx],
      // siteName is only populated from the text entered in the Site Name field
      address: place.formattedAddress,
      addressLine1: place.addressLine1,
      addressLine2: place.addressLine2,
      city: place.city || "Bengaluru",
      state: place.state || "Karnataka",
      pincode: place.pincode || "560001",
      lat: place.lat,
      lng: place.lng,
      placeId: place.id,
    }
    setFormSites(updated)
    setActiveSearchSiteId(null)
    setGeoapifyPredictions([])
    palNotch.info("Location added to the site", place.formattedAddress)
  }

  const handleOpenLiveView = (site: SiteRecord) => {
    if (!site.lat || !site.lng) return
    // Direct Google Maps 360-degree panorama Street View mode (free, no API key needed)
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${site.lat},${site.lng}&heading=0&pitch=0&fov=80`
    window.open(url, "_blank", "noopener,noreferrer")
    palNotch.info("Opened street view", site.siteName || site.address || undefined)
  }

  // Form State: Basic Details
  const [formBasicDetails, setFormBasicDetails] = React.useState({
    businessName: "",
    primaryContactName: "",
    primaryContactNumber: "",
    isWhatsAppSame: true,
    whatsappNumber: "",
    email: "",
    followUpDate: "",
  })

  // Form State: Billing Details
  const [billingDetails, setBillingDetails] = React.useState({
    billingName: "",
    gstin: "",
    billingAddress: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600051",
    isShippingSameAsBilling: true,
    shippingAddress: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "Chennai",
    shippingState: "Tamil Nadu",
    shippingPincode: "600051",
  })

  // Load Initial State from Live Fastify PostgreSQL 16 Backend
  React.useEffect(() => {
    async function loadData() {
      // 1. Purge stale mock data from previous sessions
      try {
        const savedCust = localStorage.getItem(STORAGE_CUSTOMERS_KEY)
        if (savedCust) {
          const parsed = JSON.parse(savedCust)
          const cleaned = parsed.filter(
            (c: any) => c.id !== "cust-1" && c.id !== "cust-2" && c.businessName !== "John Doe"
          )
          localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(cleaned))
        }

        const savedEnq = localStorage.getItem(STORAGE_ENQUIRIES_KEY)
        if (savedEnq) {
          const parsed = JSON.parse(savedEnq)
          const cleaned = parsed.filter((e: any) => e.id !== "enq-1")
          localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(cleaned))
        }
      } catch { }

      // 2. Fetch live data from PostgreSQL 16 via Fastify
      try {
        const [loadedCustomers, loadedEnquiries, loadedSuppliers, loadedProducts, loadedMaterials, loadedFinishes, loadedBusinessDetails] = await Promise.all([
          leadsService.getCustomers(),
          leadsService.getEnquiries(),
          leadsService.getSuppliers(),
          leadsService.getProducts(),
          leadsService.getMaterials(),
          leadsService.getFinishes(),
          fetch("/api/business-details").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ])

        if (loadedBusinessDetails && loadedBusinessDetails.legalName !== undefined) {
          setBusinessDetails((prev) => {
            const merged = { ...prev, ...loadedBusinessDetails }
            saveBusinessDetailsToStorage(merged)
            return merged
          })
        }

        const cleanCustomers = (loadedCustomers || []).filter(
          (c) => c.id !== "cust-1" && c.id !== "cust-2" && c.businessName !== "John Doe"
        )
        const cleanEnquiries = (loadedEnquiries || []).filter((e) => e.id !== "enq-1")

        setCustomers(cleanCustomers)
        setEnquiries(cleanEnquiries)
        setSuppliers(loadedSuppliers || [])

        if (loadedProducts) {
          setProducts(loadedProducts)
        } else {
          setProducts(DEFAULT_PRODUCTS)
          for (const p of DEFAULT_PRODUCTS) {
            void leadsService.saveProduct(p)
          }
        }

        if (loadedMaterials) {
          setMaterials(loadedMaterials)
        } else {
          setMaterials(DEFAULT_MATERIALS)
          for (const m of DEFAULT_MATERIALS) {
            void leadsService.saveMaterial(m)
          }
        }

        if (loadedFinishes) {
          setFinishes(loadedFinishes)
        } else {
          setFinishes(DEFAULT_FINISHES)
          for (const f of DEFAULT_FINISHES) {
            void leadsService.saveFinish(f)
          }
        }
      } catch (err) {
        console.warn("[PrintPal] Initial data load fallback:", err)
      }
    }

    loadData()
  }, [])

  // Keyboard shortcut: Escape to close modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) closeNewCustomerModal()
        if (selectedCustomerForSites) setSelectedCustomerForSites(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, selectedCustomerForSites])

  const executeDelete = React.useCallback(
    async (
      type: "customer" | "enquiry" | "supplier" | "product" | "material" | "finish" | "tax",
      id: string,
      name: string
    ) => {
      try {
        if (type === "customer") {
          await leadsService.deleteCustomer(id)
          setCustomers((prev) => prev.filter((c) => c.id !== id))
          showToast(`${name} deleted`, "success")
        } else if (type === "enquiry") {
          await leadsService.deleteEnquiry(id)
          setEnquiries((prev) => prev.filter((e) => e.id !== id))
          showToast(`Enquiry from ${name} deleted`, "success")
        } else if (type === "supplier") {
          await leadsService.deleteSupplier(id)
          setSuppliers((prev) => prev.filter((s) => s.id !== id))
          showToast(`${name} deleted`, "success")
        } else if (type === "product") {
          await leadsService.deleteProduct(id)
          setProducts((prev) => prev.filter((p) => p.id !== id))
          showToast(`${name} deleted`, "success")
        } else if (type === "material") {
          await leadsService.deleteMaterial(id)
          setMaterials((prev) => prev.filter((m) => m.id !== id))
          showToast(`${name} deleted`, "success")
        } else if (type === "finish") {
          await leadsService.deleteFinish(id)
          setFinishes((prev) => prev.filter((f) => f.id !== id))
          showToast(`${name} deleted`, "success")
        } else if (type === "tax") {
          setTaxes((prev) => prev.filter((t) => t.id !== id))
          showToast(`${name} deleted`, "success")
        }
      } catch (err) {
        showToast(`Couldn't delete this ${type}. Please try again.`, "error")
      }
    },
    [showToast]
  )

  const openDrawer = (
    isEdit = false,
    cust?: CustomerRecord,
    title?: string,
    anchor?: CustomerDrawerAnchor
  ) => {
    setFormErrors({})
    setDrawerAnchor(anchor || null)
    setHighlightedAnchorKey(null)
    setDrawerTitle(
      isEdit && cust
        ? "Edit Customer Details"
        : title || (activeTab === "enquiry" ? "New Enquiry" : "New Customer")
    )
    if (isEdit && cust) {
      setEditingCustomerId(cust.id)
      setFormBasicDetails({
        businessName: cust.businessName || cust.name,
        primaryContactName: cust.contactPerson || cust.name,
        primaryContactNumber: cust.phone,
        isWhatsAppSame: cust.isWhatsAppSame ?? true,
        whatsappNumber: cust.whatsappNumber || (cust.isWhatsAppSame !== false ? cust.phone : ""),
        email: cust.email,
        followUpDate: cust.followUpDate || "",
      })
      setBillingDetails({
        billingName: cust.billingName || cust.businessName || cust.name,
        gstin: cust.gstin || "",
        billingAddress: cust.billingAddress || cust.address || "",
        billingAddressLine1: cust.billingAddressLine1 || "",
        billingAddressLine2: cust.billingAddressLine2 || "",
        city: cust.billingCity || "Chennai",
        state: cust.billingState || "Tamil Nadu",
        pincode: cust.billingPincode || "600051",
        isShippingSameAsBilling: cust.isShippingSameAsBilling !== false,
        shippingAddress: cust.shippingAddress || "",
        shippingAddressLine1: cust.shippingAddressLine1 || "",
        shippingAddressLine2: cust.shippingAddressLine2 || "",
        shippingCity: cust.shippingCity || "Chennai",
        shippingState: cust.shippingState || "Tamil Nadu",
        shippingPincode: cust.shippingPincode || "600051",
      })
      setFormSites(
        cust.sites && cust.sites.length > 0
          ? JSON.parse(JSON.stringify(cust.sites))
          : [createDefaultSite(1)]
      )
    } else {
      setEditingCustomerId(null)
      setEditingEnquiryId(null)
      setFormBasicDetails({
        businessName: "",
        primaryContactName: "",
        primaryContactNumber: "",
        isWhatsAppSame: true,
        whatsappNumber: "",
        email: "",
        followUpDate: "",
      })
      setBillingDetails({
        billingName: "",
        gstin: "",
        billingAddress: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600051",
        isShippingSameAsBilling: true,
        shippingAddress: "",
        shippingAddressLine1: "",
        shippingAddressLine2: "",
        shippingCity: "Chennai",
        shippingState: "Tamil Nadu",
        shippingPincode: "600051",
      })
      setFormSites([createDefaultSite(1)])
    }
    setActiveRightTab("services")
    setCollapsedSites(new Set())
    setIsModalOpen(true)
  }

  const openDrawerForEnquiry = React.useCallback((enq: EnquiryRecord) => {
    setFormErrors({})
    setEditingCustomerId(null)
    setEditingEnquiryId(enq.id)
    setDrawerTitle("Enquiry Details")
    setFormBasicDetails({
      businessName: enq.contactName,
      primaryContactName: enq.contactName,
      primaryContactNumber: enq.phone,
      isWhatsAppSame: true,
      whatsappNumber: enq.phone,
      email: enq.email || "",
      followUpDate: enq.followUpDate || "",
    })
    setBillingDetails({
      billingName: enq.contactName,
      gstin: "",
      billingAddress: enq.address || "",
      billingAddressLine1: enq.address || "",
      billingAddressLine2: "",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600051",
      isShippingSameAsBilling: true,
      shippingAddress: enq.address || "",
      shippingAddressLine1: enq.address || "",
      shippingAddressLine2: "",
      shippingCity: "Chennai",
      shippingState: "Tamil Nadu",
      shippingPincode: "600051",
    })
    const defaultSite = createDefaultSite(1)
    if (enq.address) {
      defaultSite.address = enq.address
    }
    if (enq.inquiryNote && defaultSite.serviceDetails?.[0]) {
      defaultSite.serviceDetails[0].signStyle = enq.inquiryNote.split(" (")[0] || enq.inquiryNote
      defaultSite.serviceDetails[0].notes = enq.inquiryNote
    }
    setFormSites([defaultSite])
    setActiveRightTab("services")
    setCollapsedSites(new Set())
    setIsModalOpen(true)
  }, [])

  const closeNewCustomerModal = () => {
    if (productDrawerReturnTitle) {
      setDrawerTitle(productDrawerReturnTitle)
      setProductDrawerReturnTitle(null)
      setQuickTargetService(null)
      return
    }
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingEnquiryId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingMaterialId(null)
    setEditingFinishId(null)
    setDrawerAnchor(null)
    setHighlightedAnchorKey(null)
    setIsModalOpen(false)
  }

  // Follow-Up Reminder Engine (1 day before followUpDate until target date)
  const isDueForFollowUpReminder = React.useCallback((followUpDateStr?: string): boolean => {
    if (!followUpDateStr) return false

    let targetDate: Date | null = null
    const parts = followUpDateStr.trim().split("-")
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        targetDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
    if (!targetDate || isNaN(targetDate.getTime())) {
      targetDate = new Date(followUpDateStr)
    }
    if (isNaN(targetDate.getTime())) return false

    targetDate.setHours(23, 59, 59, 999)

    // 1 day before at 00:00:00
    const oneDayBefore = new Date(targetDate)
    oneDayBefore.setDate(oneDayBefore.getDate() - 1)
    oneDayBefore.setHours(0, 0, 0, 0)

    const now = new Date()
    return now >= oneDayBefore && now <= targetDate
  }, [])

  const triggerFollowUpReminder = React.useCallback(
    (enq: EnquiryRecord) => {
      palNotch.notify({
        id: `followup-${enq.id}`,
        variant: "warning",
        title: "Follow-up due",
        description: `Planned for ${enq.followUpDate || "today"}`,
        customerCard: {
          name: enq.contactName,
          phone: enq.phone,
          email: enq.email,
        },
        duration: 8000,
        action: {
          label: "Open enquiry",
          onClick: () => {
            openDrawerForEnquiry(enq)
          },
        },
      })
    },
    [openDrawerForEnquiry]
  )

  const remindedEnquiriesRef = React.useRef<Set<string>>(new Set())
  React.useEffect(() => {
    if (enquiries.length === 0) return

    for (const enq of enquiries) {
      if (enq.followUpDate && isDueForFollowUpReminder(enq.followUpDate)) {
        if (!remindedEnquiriesRef.current.has(enq.id)) {
          remindedEnquiriesRef.current.add(enq.id)
          triggerFollowUpReminder(enq)
          break
        }
      }
    }
  }, [enquiries, isDueForFollowUpReminder, triggerFollowUpReminder])

  // Stable memoized callbacks for 120 FPS table rows
  const handleEditCustomer = React.useCallback((cust: CustomerRecord) => {
    openDrawer(true, cust)
  }, [])

  const handleDeleteCustomer = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete ${name}?`,
        description: "Their details and sites will be removed. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("customer", id, name),
      })
    },
    [executeDelete]
  )

  const handleViewSites = React.useCallback((cust: CustomerRecord) => {
    setSelectedCustomerForSites(cust)
  }, [])

  const handleEditEnquiry = React.useCallback((enq: EnquiryRecord) => {
    openDrawerForEnquiry(enq)
  }, [])

  const handleDeleteEnquiry = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete the enquiry from ${name}?`,
        description: "It will be removed. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("enquiry", id, name),
      })
    },
    [executeDelete]
  )

  const handleRenegotiateQuotation = React.useCallback(
    (q: QuotationListItem) => {
      const versionInfo = getNextQuoteVersion(q.quoteNumber);

      // 1. Locate the exact customer from customer panel / state
      const customerToUse: CustomerRecord = customers.find(
        (c) =>
          (q.customerId && c.id === q.customerId) ||
          c.name.trim().toLowerCase() === q.customerName.trim().toLowerCase() ||
          (c.businessName && c.businessName.trim().toLowerCase() === q.customerName.trim().toLowerCase()) ||
          (q.phone && c.phone && c.phone.replace(/\D/g, "") === q.phone.replace(/\D/g, ""))
      ) || {
        id: q.customerId || `cust-reneg-${Date.now()}`,
        name: q.customerName,
        businessName: q.customerName,
        contactPerson: q.contactPerson || q.customerName,
        phone: q.phone || "",
        email: "",
        address: q.sitesJson?.[0]?.address || "Installation Site",
        customerType: "RETAIL_BRAND",
        createdAt: new Date().toISOString(),
        sites: [],
      };

      // 2. Prepare sites and product line items from quote or customer sites
      let quoteSites: QuoteSite[] = [];
      if (q.sitesJson && q.sitesJson.length > 0) {
        quoteSites = q.sitesJson.map((s: any, sIdx: number) => ({
          id: s.id || `site-${sIdx + 1}`,
          siteName: s.siteName || s.site_name || `Site ${sIdx + 1}`,
          address: s.address || "",
          isExpanded: true,
          items: (s.items || []).map((it: any, iIdx: number) => {
            const methodCode = it.methodCode || it.method_code || "sq_ft";
            const methodName = it.methodName || it.method_name || "Square Feet";
            const rateLabel = it.rateLabel || it.rate_label || "per sq ft";
            const qty = it.quantity || it.qty || 1;
            const rate = it.rate != null ? Number(it.rate) : (it.price != null ? Number(it.price) : null);
            const discount = it.discount != null ? Number(it.discount) : (it.discountPct != null ? Number(it.discountPct) : 0);
            const width = it.width != null ? it.width : "";
            const height = it.height != null ? it.height : "";
            const total = it.total != null ? Number(it.total) : null;

            return {
              id: it.id || `item-${sIdx + 1}-${iIdx + 1}`,
              productTitle: it.productTitle || it.product_title || "Signage Product",
              materialName: it.materialName || it.material_name || "",
              finishName: it.finishName || it.finish_name || "",
              methodCode,
              methodName,
              method: methodName,
              rateLabel,
              size: width && height ? `${width} × ${height}` : "",
              width,
              height,
              qty,
              quantity: qty,
              price: rate,
              rate,
              discount,
              discountPct: discount,
              billableQty: it.billableQty || it.billable_qty || null,
              total,
              status: "ok" as const,
            };
          }),
        }));
      } else if (customerToUse.sites && customerToUse.sites.length > 0) {
        quoteSites = customerToUse.sites.map((s, sIdx) => ({
          id: s.id || `site-${sIdx + 1}`,
          siteName: s.siteName || `Site ${sIdx + 1}`,
          address: s.address || "",
          isExpanded: true,
          items: (s.serviceDetails && s.serviceDetails.length > 0)
            ? s.serviceDetails.map((srv: any, iIdx: number) => ({
              id: srv.id || `item-${sIdx + 1}-${iIdx + 1}`,
              productTitle: srv.signStyle || srv.productTitle || "Signage Service",
              materialName: srv.material || "",
              finishName: srv.finishing || "",
              methodCode: (srv.unit === "m" ? "sq_m" : "sq_ft") as any,
              methodName: srv.unit === "m" ? "Metre square" : "Square Feet",
              method: srv.unit === "m" ? "Metre square" : "Square Feet",
              rateLabel: srv.unit === "m" ? "per sq m" : "per sq ft",
              size: `${srv.width || 8} × ${srv.height || 2}`,
              width: srv.width || 8,
              height: srv.height || 2,
              qty: srv.quantity || 1,
              quantity: srv.quantity || 1,
              price: null,
              rate: null,
              discount: 0,
              discountPct: 0,
              billableQty: null,
              total: null,
              status: "incomplete" as const,
            }))
            : [],
        }));
      }

      const renegData: RenegotiatingQuoteData = {
        originalQuoteNumber: q.quoteNumber,
        quoteNumber: versionInfo.nextQuoteNumber,
        versionNumber: versionInfo.versionNumber,
        versionLabel: versionInfo.versionLabel,
        customer: customerToUse,
        sites: quoteSites,
        subtotal: q.sitesSubtotal,
        transportCost: q.transportCost,
        designCharges: q.designCharges,
        installationCharges: q.installationCharges,
        discountPercent: q.discountPercent,
        gstRate: q.gstRate,
        fabNotes: q.fabNotes,
        commercialTerms: q.commercialTerms,
      };

      palNotch.notify({
        variant: "info",
        title: `${versionInfo.nextQuoteNumber} started from ${q.quoteNumber}`,
        description: "Prices and sites are copied over. Change what the customer asked for, then create the quote.",
      });

      setRenegotiatingQuote(renegData);
      setQuotationSelectedCustomer(customerToUse);
      setActiveModule("quotation");
    },
    [customers]
  )

  const handleEditSupplier = React.useCallback((supp: SupplierRecord) => {
    openDrawerForSupplier(supp)
  }, [])

  const handleDeleteSupplier = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete ${name}?`,
        description: "This supplier will be removed. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("supplier", id, name),
      })
    },
    [executeDelete]
  )

  const handleEditProduct = React.useCallback((prod: ProductRecord) => {
    openDrawerForProduct(prod)
  }, [])

  const handleDeleteProduct = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete ${name}?`,
        description: "It will be removed from your products. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("product", id, name),
      })
    },
    [executeDelete]
  )

  const handleSaveMaterialWithName = React.useCallback(
    async (
      name: string,
      targetMat?: MaterialRecord | null,
      targetService?: { siteIdx: number; srvIdx: number } | null
    ) => {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error("Empty name")
      }
      if (targetMat) {
        const updated: MaterialRecord = {
          ...targetMat,
          name: trimmed,
        }
        try {
          await leadsService.saveMaterial(updated)
          setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
          showToast(`${trimmed} updated`, "success")
        } catch (err) {
          showToast("Couldn't update the material. Please try again.", "error")
          throw err
        }
        return
      }
      const newMat: MaterialRecord = {
        id: `mat-${Date.now()}`,
        name: trimmed,
        category: "Custom Substrates",
        createdAt: new Date().toISOString(),
      }
      try {
        await leadsService.saveMaterial(newMat)
        setMaterials((prev) => [newMat, ...prev])
        if (isModalOpen && drawerTitle.includes("Product")) {
          setProductForm((prev) => ({
            ...prev,
            materialIds: [...prev.materialIds, newMat.id],
          }))
        }
        const activeTargetService = targetService || quickTargetService
        if (activeTargetService) {
          const { siteIdx, srvIdx } = activeTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              material: newMat.name,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)

            const curStyle = srvs[srvIdx].signStyle
            if (curStyle) {
              const matchedProd = products.find((p) => p.title.toLowerCase() === curStyle.toLowerCase())
              if (matchedProd && !matchedProd.materialIds?.includes(newMat.id)) {
                const updatedProd: ProductRecord = {
                  ...matchedProd,
                  materialIds: [...(matchedProd.materialIds || []), newMat.id],
                }
                leadsService.saveProduct(updatedProd).catch(() => { })
                setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)))
              }
            }
          }
          setQuickTargetService(null)
        }
        showToast(`${newMat.name} added to materials`, "success")
      } catch (err) {
        showToast("Couldn't save the material. Please try again.", "error")
        throw err
      }
    },
    [isModalOpen, drawerTitle, quickTargetService, formSites, products, showToast]
  )

  const handleSaveFinishWithName = React.useCallback(
    async (
      name: string,
      targetFin?: FinishRecord | null,
      targetService?: { siteIdx: number; srvIdx: number } | null
    ) => {
      const trimmed = name.trim()
      if (!trimmed) {
        throw new Error("Empty name")
      }
      if (targetFin) {
        const updated: FinishRecord = {
          ...targetFin,
          name: trimmed,
        }
        try {
          await leadsService.saveFinish(updated)
          setFinishes((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
          showToast(`${trimmed} updated`, "success")
        } catch (err) {
          showToast("Couldn't update the finish. Please try again.", "error")
          throw err
        }
        return
      }
      const newFin: FinishRecord = {
        id: `fin-${Date.now()}`,
        name: trimmed,
        type: "Custom Finish",
        createdAt: new Date().toISOString(),
      }
      try {
        await leadsService.saveFinish(newFin)
        setFinishes((prev) => [newFin, ...prev])
        if (isModalOpen && drawerTitle.includes("Product")) {
          setProductForm((prev) => ({
            ...prev,
            finishIds: [...prev.finishIds, newFin.id],
          }))
        }
        const activeTargetService = targetService || quickTargetService
        if (activeTargetService) {
          const { siteIdx, srvIdx } = activeTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              finishing: newFin.name,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)

            const curStyle = srvs[srvIdx].signStyle
            if (curStyle) {
              const matchedProd = products.find((p) => p.title.toLowerCase() === curStyle.toLowerCase())
              if (matchedProd && !matchedProd.finishIds?.includes(newFin.id)) {
                const updatedProd: ProductRecord = {
                  ...matchedProd,
                  finishIds: [...(matchedProd.finishIds || []), newFin.id],
                }
                leadsService.saveProduct(updatedProd).catch(() => { })
                setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)))
              }
            }
          }
          setQuickTargetService(null)
        }
        showToast(`${newFin.name} added to finishes`, "success")
      } catch (err) {
        showToast("Couldn't save the finish. Please try again.", "error")
        throw err
      }
    },
    [isModalOpen, drawerTitle, quickTargetService, formSites, products, showToast]
  )

  const openMaterialPrompt = React.useCallback(
    (mat?: MaterialRecord | null, targetService?: { siteIdx: number; srvIdx: number } | null) => {
      const isEdit = Boolean(mat)
      palNotch.prompt({
        title: isEdit ? "Edit material" : "Add a material",
        description: isEdit
          ? "Change the name of this material."
          : "Add a material you work with, like Acrylic or ACP.",
        inputLabel: "Material name",
        inputPlaceholder: "e.g. Acrylic Sheet",
        defaultValue: mat?.name || "",
        submitText: isEdit ? "Save" : "Add",
        cancelText: "Cancel",
        icon: isEdit ? "edit" : "material",
        variant: "brand",
        errorMessage: "Please enter a material name",
        onSubmit: async (name) => {
          await handleSaveMaterialWithName(name, mat || null, targetService || null)
        },
      })
    },
    [handleSaveMaterialWithName]
  )

  const openFinishPrompt = React.useCallback(
    (fin?: FinishRecord | null, targetService?: { siteIdx: number; srvIdx: number } | null) => {
      const isEdit = Boolean(fin)
      palNotch.prompt({
        title: isEdit ? "Edit finish" : "Add a finish",
        description: isEdit
          ? "Change the name of this finish."
          : "Add a finish you offer, like Powder Coating or Vinyl.",
        inputLabel: "Finish name",
        inputPlaceholder: "e.g. Powder Coating",
        defaultValue: fin?.name || "",
        submitText: isEdit ? "Save" : "Add",
        cancelText: "Cancel",
        icon: isEdit ? "edit" : "finish",
        variant: "brand",
        errorMessage: "Please enter a finish name",
        onSubmit: async (name) => {
          await handleSaveFinishWithName(name, fin || null, targetService || null)
        },
      })
    },
    [handleSaveFinishWithName]
  )

  const handleEditMaterial = React.useCallback(
    (mat: MaterialRecord) => {
      openMaterialPrompt(mat)
    },
    [openMaterialPrompt]
  )

  const handleDeleteMaterial = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete ${name}?`,
        description: "It will be removed from your materials. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("material", id, name),
      })
    },
    [executeDelete]
  )

  const handleEditFinish = React.useCallback(
    (fin: FinishRecord) => {
      openFinishPrompt(fin)
    },
    [openFinishPrompt]
  )

  const handleDeleteFinish = React.useCallback(
    (id: string, name: string) => {
      palNotch.confirm({
        title: `Delete ${name}?`,
        description: "It will be removed from your finishes. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("finish", id, name),
      })
    },
    [executeDelete]
  )

  const handleDeleteTax = React.useCallback(
    (tax: TaxRecord) => {
      palNotch.confirm({
        title: `Delete ${tax.name}?`,
        description: "This tax rate will be removed. This can't be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        onConfirm: () => executeDelete("tax", tax.id, tax.name),
      })
    },
    [executeDelete]
  )

  const openDrawerForSupplier = (supplier?: SupplierRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setEditingCustomerId(null)
    if (supplier) {
      setDrawerTitle("Edit Supplier Details")
      setEditingSupplierId(supplier.id)
      setSupplierForm({
        supplierName: supplier.supplierName,
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone,
        email: supplier.email || "",
        isWhatsAppSame: supplier.isWhatsAppSame !== false,
        whatsappNumber: supplier.whatsappNumber || supplier.phone,
        category: supplier.category,
        gstin: supplier.gstin || "",
        address: supplier.address || "",
        addressLine1: supplier.addressLine1 || (supplier.address ? supplier.address.split(", ")[0] || "" : ""),
        addressLine2: supplier.addressLine2 || (supplier.address && supplier.address.includes(", ") ? supplier.address.split(", ").slice(1).join(", ") : ""),
        city: supplier.city || "Chennai",
        state: supplier.state || "Tamil Nadu",
        pincode: supplier.pincode || "600032",
        servingRegions: supplier.servingRegions || "Greater Chennai, Kanchipuram, Chengalpattu",
        isBillingSameAsWarehouse: supplier.isBillingSameAsWarehouse !== false,
        billingAddress: supplier.billingAddress || supplier.address || "",
        billingAddressLine1: supplier.billingAddressLine1 || "",
        billingAddressLine2: supplier.billingAddressLine2 || "",
        billingCity: supplier.billingCity || supplier.city || "Chennai",
        billingState: supplier.billingState || supplier.state || "Tamil Nadu",
        billingPincode: supplier.billingPincode || supplier.pincode || "600032",
        isShippingSameAsBilling: supplier.isShippingSameAsBilling !== false,
        shippingAddress: supplier.shippingAddress || supplier.billingAddress || supplier.address || "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
        shippingAddressLine1: supplier.shippingAddressLine1 || "No. 8 Industrial Estate",
        shippingAddressLine2: supplier.shippingAddressLine2 || "Guindy",
        shippingCity: supplier.shippingCity || "Chennai",
        shippingState: supplier.shippingState || "Tamil Nadu",
        shippingPincode: supplier.shippingPincode || "600032",
        deliveryLeadTime: supplier.deliveryLeadTime || "Same Day (2-4 hrs)",
        minOrderQty: supplier.minOrderQty || "1 sheet / 1 pc",
        paymentTerms: supplier.paymentTerms || "ADVANCE",
        notes: supplier.notes || "",
      })
    } else {
      setDrawerTitle("New Supplier")
      setEditingSupplierId(null)
      setSupplierForm({
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        isWhatsAppSame: true,
        whatsappNumber: "",
        category: "",
        gstin: "",
        address: "",
        addressLine1: "",
        addressLine2: "",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600032",
        servingRegions: "Greater Chennai (All Industrial Zones)",
        isBillingSameAsWarehouse: true,
        billingAddress: "",
        billingAddressLine1: "",
        billingAddressLine2: "",
        billingCity: "Chennai",
        billingState: "Tamil Nadu",
        billingPincode: "600032",
        isShippingSameAsBilling: true,
        shippingAddress: "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032",
        shippingAddressLine1: "No. 8 Industrial Estate",
        shippingAddressLine2: "Guindy",
        shippingCity: "Chennai",
        shippingState: "Tamil Nadu",
        shippingPincode: "600032",
        deliveryLeadTime: "Same Day (2-4 hrs)",
        minOrderQty: "1 sheet / 1 pc",
        paymentTerms: "ADVANCE",
        notes: "",
      })
    }
    setServicesSearchQuery("")
    setLocationsSearchQuery("")
    setIsModalOpen(true)
  }

  const handleSaveSupplier = async () => {
    const errors: Record<string, string> = {}
    if (!supplierForm.supplierName.trim()) {
      errors.supplierName = "Company / Business name is required"
    }
    if (!supplierForm.phone.trim()) {
      errors.phone = "Supplier contact number is required"
    }
    if (!supplierForm.category.trim()) {
      errors.category = "Please enter or select what they supply"
    }
    if (!supplierForm.addressLine1.trim() && !supplierForm.address.trim()) {
      errors.addressLine1 = "Address Line 1 is required"
    }

    if (Object.keys(errors).length > 0) {
      setSupplierErrors(errors)
      return
    }

    const combinedAddress = [supplierForm.addressLine1.trim(), supplierForm.addressLine2.trim()].filter(Boolean).join(", ") || supplierForm.address.trim()
    const combinedBillingAddress = [supplierForm.billingAddressLine1.trim(), supplierForm.billingAddressLine2.trim(), supplierForm.billingCity.trim(), supplierForm.billingState.trim(), supplierForm.billingPincode.trim()].filter(Boolean).join(", ") || supplierForm.billingAddress.trim()
    const combinedShippingAddress = [supplierForm.shippingAddressLine1.trim(), supplierForm.shippingAddressLine2.trim(), supplierForm.shippingCity.trim(), supplierForm.shippingState.trim(), supplierForm.shippingPincode.trim()].filter(Boolean).join(", ") || supplierForm.shippingAddress.trim()

    const supplierPayload: SupplierRecord = {
      id: editingSupplierId || `supp-${Date.now()}`,
      supplierName: supplierForm.supplierName.trim(),
      contactPerson: supplierForm.contactPerson.trim() || undefined,
      phone: supplierForm.phone.trim(),
      email: supplierForm.email.trim() || undefined,
      isWhatsAppSame: supplierForm.isWhatsAppSame,
      whatsappNumber: supplierForm.isWhatsAppSame ? supplierForm.phone.trim() : (supplierForm.whatsappNumber.trim() || undefined),
      category: supplierForm.category.trim(),
      gstin: supplierForm.gstin.trim() || undefined,
      address: combinedAddress || undefined,
      addressLine1: supplierForm.addressLine1.trim() || undefined,
      addressLine2: supplierForm.addressLine2.trim() || undefined,
      city: supplierForm.city.trim() || undefined,
      state: supplierForm.state.trim() || undefined,
      pincode: supplierForm.pincode.trim() || undefined,
      servingRegions: supplierForm.servingRegions?.trim() || undefined,
      isBillingSameAsWarehouse: supplierForm.isBillingSameAsWarehouse,
      billingAddress: supplierForm.isBillingSameAsWarehouse ? (combinedAddress || undefined) : (combinedBillingAddress || undefined),
      billingAddressLine1: supplierForm.isBillingSameAsWarehouse ? supplierForm.addressLine1 : (supplierForm.billingAddressLine1.trim() || undefined),
      billingAddressLine2: supplierForm.isBillingSameAsWarehouse ? supplierForm.addressLine2 : (supplierForm.billingAddressLine2.trim() || undefined),
      billingCity: supplierForm.isBillingSameAsWarehouse ? supplierForm.city : (supplierForm.billingCity.trim() || undefined),
      billingState: supplierForm.isBillingSameAsWarehouse ? supplierForm.state : (supplierForm.billingState.trim() || undefined),
      billingPincode: supplierForm.isBillingSameAsWarehouse ? supplierForm.pincode : (supplierForm.billingPincode.trim() || undefined),
      isShippingSameAsBilling: supplierForm.isShippingSameAsBilling,
      shippingAddress: supplierForm.isShippingSameAsBilling
        ? (supplierForm.isBillingSameAsWarehouse ? combinedAddress : combinedBillingAddress || "PrintPal Workshop & Factory, No. 8 Industrial Estate, Guindy, Chennai 600032")
        : (combinedShippingAddress || undefined),
      shippingAddressLine1: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingAddressLine1.trim() || undefined),
      shippingAddressLine2: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingAddressLine2.trim() || undefined),
      shippingCity: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingCity.trim() || undefined),
      shippingState: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingState.trim() || undefined),
      shippingPincode: supplierForm.isShippingSameAsBilling ? undefined : (supplierForm.shippingPincode.trim() || undefined),
      deliveryLeadTime: supplierForm.deliveryLeadTime || undefined,
      minOrderQty: supplierForm.minOrderQty?.trim() || undefined,
      paymentTerms: supplierForm.paymentTerms || "ADVANCE",
      notes: supplierForm.notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveSupplier(supplierPayload)

    if (editingSupplierId) {
      setSuppliers((prev) => prev.map((s) => (s.id === editingSupplierId ? supplierPayload : s)))
      showToast(`${supplierPayload.supplierName} updated`, "success")
    } else {
      setSuppliers((prev) => [supplierPayload, ...prev])
      showToast(`${supplierPayload.supplierName} added to suppliers`, "success")
    }

    closeNewCustomerModal()
  }

  const openDrawerForProduct = (product?: ProductRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingMaterialId(null)
    setEditingFinishId(null)
    setMaterialsSearchInDrawer("")
    setFinishesSearchInDrawer("")

    if (product) {
      setDrawerTitle("Edit Product Details")
      setEditingProductId(product.id)
      setProductForm({
        title: product.title || "",
        category: product.category || "Channel Letters",
        description: product.description || "",
        pricedPer: (product.pricedPer || "Per letter") as "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum",
        materialIds: product.materialIds || [],
        finishIds: product.finishIds || [],
        isActive: product.isActive !== false,
        width: product.width || "1200",
        height: product.height || "600",
        unit: product.unit || "mm",
        returnDepth: "75mm",
        minStroke: "15mm",
        material: "",
        finishing: "",
        colour: "",
        application: (product.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        productionType: (product.productionType || "INTERNAL") as "INTERNAL" | "OUTSOURCE" | "HYBRID",
        illumination: "Samsung 12V 6500K IP67 LED Modules",
        mounting: "Flush Stud Mount with Acrylic Standoffs",
        leadTime: "3-5 Working Days",
        notes: product.notes || "",
      })
    } else {
      setDrawerTitle("New Product")
      setEditingProductId(null)
      setProductForm({
        title: "",
        category: "Channel Letters",
        description: "",
        pricedPer: "Per letter",
        materialIds: ["M01", "M03"],
        finishIds: ["F01", "F02"],
        isActive: true,
        width: "1200",
        height: "600",
        unit: "mm",
        returnDepth: "75mm",
        minStroke: "15mm",
        material: "",
        finishing: "",
        colour: "",
        application: "Outdoor",
        productionType: "INTERNAL",
        illumination: "Samsung 12V 6500K IP67 LED Modules",
        mounting: "Flush Stud Mount with Acrylic Standoffs",
        leadTime: "3-5 Working Days",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveProduct = async () => {
    const errors: Record<string, string> = {}
    if (!productForm.title.trim()) {
      errors.title = "Product name is required"
    }
    if (Object.keys(errors).length > 0) {
      setProductErrors(errors)
      return
    }

    const newProd: ProductRecord = {
      id: editingProductId || `prod-${Date.now()}`,
      title: productForm.title.trim(),
      category: productForm.category,
      description: productForm.description.trim(),
      pricedPer: productForm.pricedPer,
      materialIds: productForm.materialIds,
      finishIds: productForm.finishIds,
      isActive: productForm.isActive,
      width: productForm.width,
      height: productForm.height,
      unit: productForm.unit,
      notes: productForm.notes,
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveProduct(newProd)
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === newProd.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newProd
          return next
        }
        return [newProd, ...prev]
      })
      showToast(
        editingProductId ? `${newProd.title} updated` : `${newProd.title} added to products`,
        "success"
      )
      if (productDrawerReturnTitle) {
        if (quickTargetService) {
          const { siteIdx, srvIdx } = quickTargetService
          const updated = [...formSites]
          const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
          if (srvs[srvIdx]) {
            const firstMat = materials.find((m) => newProd.materialIds?.includes(m.id))?.name || srvs[srvIdx].material || ""
            const firstFin = finishes.find((f) => newProd.finishIds?.includes(f.id))?.name || srvs[srvIdx].finishing || ""
            srvs[srvIdx] = {
              ...srvs[srvIdx],
              signStyle: newProd.title,
              material: firstMat,
              finishing: firstFin,
            }
            updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
            setFormSites(updated)
          }
        }
        setDrawerTitle(productDrawerReturnTitle)
        setProductDrawerReturnTitle(null)
        setQuickTargetService(null)
        return
      }
      closeNewCustomerModal()
    } catch (err) {
      showToast("Couldn't save the product. Please try again.", "error")
    }
  }

  const handleSaveQuickProduct = async () => {
    const trimmed = quickProductName.trim()
    if (!trimmed) {
      setQuickProductError("Product name is required")
      return
    }
    setQuickProductError(null)
    const newProd: ProductRecord = {
      id: `prod-${Date.now()}`,
      title: trimmed,
      description: quickProductDesc.trim(),
      materialIds: quickProductSelectedMats,
      finishIds: quickProductSelectedFins,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    try {
      await leadsService.saveProduct(newProd)
      setProducts((prev) => [newProd, ...prev])
      showToast(`${newProd.title} added to products`, "success")

      if (quickTargetService) {
        const { siteIdx, srvIdx } = quickTargetService
        const updated = [...formSites]
        const srvs = [...(updated[siteIdx]?.serviceDetails || [])]
        if (srvs[srvIdx]) {
          const firstMat = materials.find((m) => newProd.materialIds?.includes(m.id))?.name || ""
          const firstFin = finishes.find((f) => newProd.finishIds?.includes(f.id))?.name || ""
          srvs[srvIdx] = {
            ...srvs[srvIdx],
            signStyle: newProd.title,
            material: firstMat,
            finishing: firstFin,
          }
          updated[siteIdx] = { ...updated[siteIdx], serviceDetails: srvs }
          setFormSites(updated)
        }
      }

      setIsQuickProductModalOpen(false)
      setQuickProductName("")
      setQuickProductDesc("")
      setQuickProductSelectedMats([])
      setQuickProductSelectedFins([])
      setQuickTargetService(null)
    } catch (err) {
      showToast("Couldn't save the product. Please try again.", "error")
    }
  }

  const openDrawerForMaterial = (material?: MaterialRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingFinishId(null)
    if (material) {
      setDrawerTitle("Edit Material Details")
      setEditingMaterialId(material.id)
      setMaterialForm({
        name: material.name,
        category: material.category || "Acrylic & Diffusers",
        thickness: material.thickness || "3mm",
        standardSize: material.standardSize || "8 × 4 ft Sheet",
        application: (material.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        supplierName: material.supplierName || "",
        notes: material.notes || "",
      })
    } else {
      setDrawerTitle("New Material")
      setEditingMaterialId(null)
      setMaterialForm({
        name: "",
        category: "Acrylic & Diffusers",
        thickness: "3mm",
        standardSize: "8 × 4 ft Sheet",
        application: "Outdoor",
        supplierName: "",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveMaterial = async () => {
    const errors: Record<string, string> = {}
    if (!materialForm.name.trim()) {
      errors.name = "Material name is required"
    }
    if (Object.keys(errors).length > 0) {
      setMaterialErrors(errors)
      return
    }

    const newMat: MaterialRecord = {
      id: editingMaterialId || `mat-${Date.now()}`,
      name: materialForm.name.trim(),
      category: materialForm.category,
      thickness: materialForm.thickness.trim(),
      standardSize: materialForm.standardSize.trim(),
      application: materialForm.application,
      supplierName: materialForm.supplierName.trim(),
      notes: materialForm.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveMaterial(newMat)
      setMaterials((prev) => {
        const idx = prev.findIndex((m) => m.id === newMat.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newMat
          return next
        }
        return [newMat, ...prev]
      })
      showToast(
        editingMaterialId ? `${newMat.name} updated` : `${newMat.name} added to materials`,
        "success"
      )
      closeNewCustomerModal()
    } catch (err) {
      showToast("Couldn't save the material. Please try again.", "error")
    }
  }

  const openDrawerForFinish = (finish?: FinishRecord) => {
    setFormErrors({})
    setSupplierErrors({})
    setProductErrors({})
    setMaterialErrors({})
    setFinishErrors({})
    setEditingCustomerId(null)
    setEditingSupplierId(null)
    setEditingProductId(null)
    setEditingMaterialId(null)
    if (finish) {
      setDrawerTitle("Edit Finish Details")
      setEditingFinishId(finish.id)
      setFinishForm({
        name: finish.name,
        type: finish.type || "Powder Coating",
        colorCode: finish.colorCode || "RAL 9016 (Pure White)",
        application: (finish.application || "Outdoor") as "Indoor" | "Outdoor" | "Coastal",
        notes: finish.notes || "",
      })
    } else {
      setDrawerTitle("New Finish")
      setEditingFinishId(null)
      setFinishForm({
        name: "",
        type: "Powder Coating",
        colorCode: "RAL 9016 (Pure White)",
        application: "Outdoor",
        notes: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleSaveFinish = async () => {
    const errors: Record<string, string> = {}
    if (!finishForm.name.trim()) {
      errors.name = "Finish name is required"
    }
    if (Object.keys(errors).length > 0) {
      setFinishErrors(errors)
      return
    }

    const newFin: FinishRecord = {
      id: editingFinishId || `fin-${Date.now()}`,
      name: finishForm.name.trim(),
      type: finishForm.type,
      colorCode: finishForm.colorCode.trim(),
      application: finishForm.application,
      notes: finishForm.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveFinish(newFin)
      setFinishes((prev) => {
        const idx = prev.findIndex((f) => f.id === newFin.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = newFin
          return next
        }
        return [newFin, ...prev]
      })
      showToast(
        editingFinishId ? `${newFin.name} updated` : `${newFin.name} added to finishes`,
        "success"
      )
      closeNewCustomerModal()
    } catch (err) {
      showToast("Couldn't save the finish. Please try again.", "error")
    }
  }

  // Preserve drawer functions for comprehensive spec editing if needed
  void openDrawerForMaterial
  void openDrawerForFinish

  // Multi-select helpers for Supplier Drawer
  const selectedServices = React.useMemo(() => {
    return supplierForm.category
      ? supplierForm.category.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  }, [supplierForm.category])

  const toggleService = (service: string) => {
    const current = selectedServices
    let updated: string[]
    if (current.includes(service)) {
      updated = current.filter((s) => s !== service)
    } else {
      updated = [...current, service]
    }
    setSupplierForm((prev) => ({ ...prev, category: updated.join(", ") }))
    if (supplierErrors.category) {
      setSupplierErrors((prev) => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }

  const selectedLocations = React.useMemo(() => {
    return supplierForm.servingRegions
      ? supplierForm.servingRegions.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  }, [supplierForm.servingRegions])

  const toggleLocation = (location: string) => {
    const current = selectedLocations
    let updated: string[]
    if (current.includes(location)) {
      updated = current.filter((s) => s !== location)
    } else {
      updated = [...current, location]
    }
    setSupplierForm((prev) => ({ ...prev, servingRegions: updated.join(", ") }))
  }

  const filteredServices = React.useMemo(() => {
    if (!servicesSearchQuery.trim()) return SIGNAGE_SERVICES_OPTIONS
    return SIGNAGE_SERVICES_OPTIONS.filter((s) =>
      s.toLowerCase().includes(servicesSearchQuery.toLowerCase())
    )
  }, [servicesSearchQuery])

  const filteredLocations = React.useMemo(() => {
    if (!locationsSearchQuery.trim()) return DEFAULT_LOCATIONS_OPTIONS
    return DEFAULT_LOCATIONS_OPTIONS.filter((l) =>
      l.toLowerCase().includes(locationsSearchQuery.toLowerCase())
    )
  }, [locationsSearchQuery])

  const handleSaveCustomer = async () => {
    const val = validateCustomerForm(formBasicDetails, formSites, billingDetails)
    if (!val.isValid) {
      setFormErrors(val.errors)
      if (val.firstErrorTab) {
        setActiveRightTab(val.firstErrorTab)
      }
      return
    }

    setFormErrors({})

    const businessName = formBasicDetails.businessName.trim()
    const contactName = formBasicDetails.primaryContactName.trim()
    const displayName = contactName || businessName
    const phone = formBasicDetails.primaryContactNumber.trim()
    const email = formBasicDetails.email.trim()
    const firstSite = formSites[0]
    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      billingDetails.billingAddress?.trim() ||
      "Local Installation Site"

    const customerRecord: CustomerRecord = {
      id: editingCustomerId || `cust-${Date.now()}`,
      name: displayName,
      businessName: businessName || displayName,
      contactPerson: contactName || undefined,
      phone,
      isWhatsAppSame: formBasicDetails.isWhatsAppSame,
      whatsappNumber: formBasicDetails.isWhatsAppSame
        ? phone
        : (formBasicDetails.whatsappNumber.trim() || phone),
      email,
      followUpDate: formBasicDetails.followUpDate,
      address: siteAddr,
      customerType: "RETAIL_BRAND",
      gstin: billingDetails.gstin?.trim() || undefined,
      stateCode: billingDetails.state || "33",
      paymentTerms: "ADVANCE_50",
      billingName: billingDetails.billingName?.trim() || businessName || displayName,
      billingAddress:
        billingDetails.billingAddress?.trim() ||
        [
          billingDetails.billingAddressLine1,
          billingDetails.billingAddressLine2,
          billingDetails.city,
          billingDetails.state,
          billingDetails.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
        undefined,
      billingAddressLine1: billingDetails.billingAddressLine1?.trim() || undefined,
      billingAddressLine2: billingDetails.billingAddressLine2?.trim() || undefined,
      billingCity: billingDetails.city?.trim() || undefined,
      billingState: billingDetails.state?.trim() || undefined,
      billingPincode: billingDetails.pincode?.trim() || undefined,
      isShippingSameAsBilling: billingDetails.isShippingSameAsBilling !== false,
      shippingAddress:
        (billingDetails.isShippingSameAsBilling !== false
          ? billingDetails.billingAddress ||
          [
            billingDetails.billingAddressLine1,
            billingDetails.billingAddressLine2,
            billingDetails.city,
            billingDetails.state,
            billingDetails.pincode,
          ]
            .filter(Boolean)
            .join(", ")
          : billingDetails.shippingAddress ||
          [
            billingDetails.shippingAddressLine1,
            billingDetails.shippingAddressLine2,
            billingDetails.shippingCity,
            billingDetails.shippingState,
            billingDetails.shippingPincode,
          ]
            .filter(Boolean)
            .join(", ")) || undefined,
      shippingAddressLine1:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine1?.trim() || undefined,
      shippingAddressLine2:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine2?.trim() || undefined,
      shippingCity:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingCity?.trim() || undefined,
      shippingState:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingState?.trim() || undefined,
      shippingPincode:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingPincode?.trim() || undefined,
      sites: formSites.map((s, idx) => ({
        ...s,
        siteName: s.siteName?.trim() || `Site ${idx + 1}`,
        address: s.address?.trim() || [s.addressLine1, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "Installation Site",
      })),
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveCustomer(customerRecord)

    if (editingEnquiryId) {
      try {
        await leadsService.deleteEnquiry(editingEnquiryId)
      } catch (e) {
        console.warn("Could not delete converted enquiry:", e)
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== editingEnquiryId))
      setEditingEnquiryId(null)
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`${customerRecord.name} is now a customer`, "success")
    } else if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? customerRecord : c))
      )
      showToast(`${customerRecord.name} updated`, "success")
    } else {
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`${customerRecord.name} added to customers`, "success")
    }

    if (activeModule === "quotation") {
      setQuotationSelectedCustomer(customerRecord)
    }

    setIsModalOpen(false)
    setActiveTab("customer")
  }

  const handleRaiseQuoteFromDrawer = async () => {
    const val = validateCustomerForm(formBasicDetails, formSites, billingDetails)
    if (!val.isValid) {
      setFormErrors(val.errors)
      if (val.firstErrorTab) {
        setActiveRightTab(val.firstErrorTab)
      }
      return
    }

    setFormErrors({})

    const businessName = formBasicDetails.businessName.trim()
    const contactName = formBasicDetails.primaryContactName.trim()
    const displayName = contactName || businessName || "Customer"
    const phone = formBasicDetails.primaryContactNumber.trim()
    const email = formBasicDetails.email.trim()
    const firstSite = formSites[0]
    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      billingDetails.billingAddress?.trim() ||
      "Local Installation Site"

    const customerRecord: CustomerRecord = {
      id: editingCustomerId || `cust-${Date.now()}`,
      name: displayName,
      businessName: businessName || displayName,
      contactPerson: contactName || undefined,
      phone,
      isWhatsAppSame: formBasicDetails.isWhatsAppSame,
      whatsappNumber: formBasicDetails.isWhatsAppSame
        ? phone
        : (formBasicDetails.whatsappNumber.trim() || phone),
      email,
      followUpDate: formBasicDetails.followUpDate,
      address: siteAddr,
      customerType: "RETAIL_BRAND",
      gstin: billingDetails.gstin?.trim() || undefined,
      stateCode: billingDetails.state || "33",
      paymentTerms: "ADVANCE_50",
      billingName: billingDetails.billingName?.trim() || businessName || displayName,
      billingAddress:
        billingDetails.billingAddress?.trim() ||
        [
          billingDetails.billingAddressLine1,
          billingDetails.billingAddressLine2,
          billingDetails.city,
          billingDetails.state,
          billingDetails.pincode,
        ]
          .filter(Boolean)
          .join(", ") ||
        undefined,
      billingAddressLine1: billingDetails.billingAddressLine1?.trim() || undefined,
      billingAddressLine2: billingDetails.billingAddressLine2?.trim() || undefined,
      billingCity: billingDetails.city?.trim() || undefined,
      billingState: billingDetails.state?.trim() || undefined,
      billingPincode: billingDetails.pincode?.trim() || undefined,
      isShippingSameAsBilling: billingDetails.isShippingSameAsBilling !== false,
      shippingAddress:
        (billingDetails.isShippingSameAsBilling !== false
          ? billingDetails.billingAddress ||
          [
            billingDetails.billingAddressLine1,
            billingDetails.billingAddressLine2,
            billingDetails.city,
            billingDetails.state,
            billingDetails.pincode,
          ]
            .filter(Boolean)
            .join(", ")
          : billingDetails.shippingAddress ||
          [
            billingDetails.shippingAddressLine1,
            billingDetails.shippingAddressLine2,
            billingDetails.shippingCity,
            billingDetails.shippingState,
            billingDetails.shippingPincode,
          ]
            .filter(Boolean)
            .join(", ")) || undefined,
      shippingAddressLine1:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine1?.trim() || undefined,
      shippingAddressLine2:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingAddressLine2?.trim() || undefined,
      shippingCity:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingCity?.trim() || undefined,
      shippingState:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingState?.trim() || undefined,
      shippingPincode:
        billingDetails.isShippingSameAsBilling !== false
          ? undefined
          : billingDetails.shippingPincode?.trim() || undefined,
      sites: formSites.map((s, idx) => ({
        ...s,
        siteName: s.siteName?.trim() || `Site ${idx + 1}`,
        address: s.address?.trim() || [s.addressLine1, s.city, s.state, s.pincode].filter(Boolean).join(", ") || "Installation Site",
      })),
      createdAt: new Date().toISOString(),
    }

    try {
      await leadsService.saveCustomer(customerRecord)
    } catch (e) {
      console.warn("Could not persist customer to backend:", e)
    }

    if (editingEnquiryId) {
      try {
        await leadsService.deleteEnquiry(editingEnquiryId)
      } catch (e) {
        console.warn("Could not delete converted enquiry on raise quote:", e)
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== editingEnquiryId))
      setEditingEnquiryId(null)
      setCustomers((prev) => [customerRecord, ...prev])
      showToast(`${customerRecord.name} is now a customer. You can quote them now.`, "success")
    } else if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? customerRecord : c))
      )
    } else {
      setCustomers((prev) => [customerRecord, ...prev])
    }

    setQuotationSelectedCustomer(customerRecord)
    setIsModalOpen(false)
    setActiveModule("quotation")

  }

  const handleSaveAsEnquiry = async () => {
    const contactName =
      formBasicDetails.primaryContactName.trim() || formBasicDetails.businessName.trim()
    const phone = formBasicDetails.primaryContactNumber.trim()
    const firstSite = formSites[0]
    const firstService = firstSite?.serviceDetails?.[0]
    const inquiryNote = firstService?.signStyle
      ? `${firstService.signStyle}${firstService.width && firstService.height ? ` (${firstService.width}x${firstService.height} ${firstService.unit || "ft"})` : ""}${firstService.notes ? ` - ${firstService.notes}` : ""}`
      : "General Signage Requirement"

    const val = validateEnquiryForm({
      contactName,
      phone,
      email: formBasicDetails.email,
      inquiryNote,
    })

    if (!val.isValid) {
      setFormErrors(val.errors)
      return
    }

    const siteAddr =
      firstSite?.address?.trim() ||
      [firstSite?.addressLine1, firstSite?.city, firstSite?.state, firstSite?.pincode]
        .filter(Boolean)
        .join(", ") ||
      ""

    const newEnquiry: EnquiryRecord = {
      id: editingEnquiryId || `enq-${Date.now()}`,
      contactName,
      phone,
      email: formBasicDetails.email.trim() || undefined,
      address: siteAddr || undefined,
      source: "WALK_IN",
      stage: formBasicDetails.followUpDate ? "NEEDS_FOLLOW_UP" : "NEW",
      followUpDate: formBasicDetails.followUpDate || undefined,
      inquiryNote,
      hasVectorLogo: (firstService?.referenceFiles?.length || 0) > 0,
      wallSubstrate: "CONCRETE",
      mountingHeightFt: 10,
      hasPowerPoint: true,
      createdAt: new Date().toISOString(),
    }

    await leadsService.saveEnquiry(newEnquiry)
    if (editingEnquiryId) {
      setEnquiries((prev) =>
        prev.map((e) => (e.id === editingEnquiryId ? newEnquiry : e))
      )
      showToast(`Enquiry from ${newEnquiry.contactName} updated`, "success")
    } else {
      setEnquiries((prev) => [newEnquiry, ...prev])
      showToast(`Enquiry from ${newEnquiry.contactName} added`, "success")
    }

    if (newEnquiry.followUpDate && isDueForFollowUpReminder(newEnquiry.followUpDate)) {
      triggerFollowUpReminder(newEnquiry)
    }

    setIsModalOpen(false)
    setEditingCustomerId(null)
    setEditingEnquiryId(null)
    setActiveTab("enquiry")
  }

  // Site manipulation handlers
  const handleToggleCollapse = (siteId: string) => {
    setCollapsedSites((prev) => {
      const next = new Set(prev)
      if (next.has(siteId)) {
        next.delete(siteId)
      } else {
        next.add(siteId)
      }
      return next
    })
  }

  const handleDeleteSite = (siteIndex: number) => {
    if (formSites.length <= 1) {
      return
    }
    const updated = formSites.filter((_, idx) => idx !== siteIndex)
    setFormSites(updated)
  }

  const handleAddAnotherSite = () => {
    const nextNum = formSites.length + 1
    const newSite = createDefaultSite(nextNum)
    setFormSites([...formSites, newSite])
  }

  // Service manipulation handlers
  const handleAddService = (siteIndex: number) => {
    const targetSite = formSites[siteIndex]
    const currentServices = targetSite.serviceDetails || []
    const nextServiceNum = currentServices.length + 1
    const newService: ServiceItem = {
      id: `srv-${Date.now()}-${nextServiceNum}`,
      serviceNumber: nextServiceNum,
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
    }
    const updated = [...formSites]
    updated[siteIndex] = {
      ...targetSite,
      serviceDetails: [...currentServices, newService],
    }
    setFormSites(updated)
  }

  const handleDeleteService = (siteIndex: number, serviceIndex: number) => {
    const targetSite = formSites[siteIndex]
    const currentServices = targetSite.serviceDetails || []
    if (currentServices.length <= 1) return
    const updatedServices = currentServices.filter((_, idx) => idx !== serviceIndex)
    const updated = [...formSites]
    updated[siteIndex] = {
      ...targetSite,
      serviceDetails: updatedServices,
    }
    setFormSites(updated)
  }





  const isLockedViewportModule = activeModule === "settings"

  return (
    <div className={`printpal-leads-container ${isLockedViewportModule ? "materials-finishes-locked" : ""}`}>
      {/* ── 1. Top Navbar (PrintPal, Nav links, JD profile) (Desktop - 1, 2) ── */}
      {renderTopNav({ setIsModalOpen, activeModule, closeNewCustomerModal, setActiveModule, setIsUserMenuOpen, user, isUserMenuOpen, clerk })}

      {/* ── 2. Top PAL Notch (Sileo Gooey Physics × SmoothUI Dynamic Island Toast) ── */}
      <PalNotch
        activeModuleLabel={
          activeModule === "leads"
            ? "Leads"
            : activeModule === "quotation"
              ? "Quotation"
              : activeModule === "quotationReports"
                ? "Quotation Reports"
                : "Settings"
        }
      />

      {documentSheet && (
        <QuotePDFPreview
          isOpen
          {...documentSheet.doc}
          onBeginClose={() => {
            // A freshly created quote: as the paper starts retracting, flip the screen behind to
            // Quotation Reports with the new line. Re-opening an old quote leaves you where you are.
            if (!documentSheet.fresh) return
            setRenegotiatingQuote(null)
            setQuotationSelectedCustomer(null)
            setJustCreatedQuote({
              customerId: documentSheet.doc.customer.id || "",
              quoteNumber: documentSheet.doc.quoteNumber,
            })
            setActiveModule("quotationReports")
          }}
          onClose={() => setDocumentSheet(null)}
        />
      )}

      {/* ── 3. Main Content Body (Desktop - 1 & 2) ── */}
      {activeModule === "quotation" ? (
        <QuotationView
          customers={customers}
          products={products}
          materials={materials}
          finishes={finishes}
          onOpenCustomerDrawer={openDrawer}
          showToast={showToast}
          initialCustomer={quotationSelectedCustomer}
          businessDetails={businessDetails}
          isSupplierEnabled={isSupplierEnabled}
          renegotiatingQuote={renegotiatingQuote}
          onClearRenegotiatingQuote={() => setRenegotiatingQuote(null)}
          onShowDocument={(doc, opts) => setDocumentSheet({ doc, fresh: opts.fresh })}
          onQuotationCreated={(created) => {
            setRenegotiatingQuote(null)
            setQuotationSelectedCustomer(null)
            setJustCreatedQuote(created)
            setActiveModule("quotationReports")
          }}
        />
      ) : activeModule === "quotationReports" ? (
        <QuotationReportsView
          customers={customers}
          showToast={showToast}
          businessDetails={businessDetails}
          highlightQuote={justCreatedQuote}
          onCreateQuotation={() => {
            setRenegotiatingQuote(null)
            setQuotationSelectedCustomer(null)
            setJustCreatedQuote(null)
            setActiveModule("quotation")
          }}
          onRenegotiateQuotation={handleRenegotiateQuotation}
        />
      ) : activeModule === "settings" ? (
        <main className={`printpal-content-body printpal-settings-page ${isLockedViewportModule ? "materials-finishes-locked" : ""} flex flex-col`}>
          {/* Settings Header matching Wireframe Screenshot (White background) */}
          <section className="printpal-leads-header flex-shrink-0 bg-white border-b border-[#DCE1E5]">
            <div className="printpal-leads-title-block">
              <h1 className="printpal-leads-title">Settings</h1>
            </div>
          </section>

          {/* Settings Two-Column Layout: Left Side Menu | Right Content Area */}
          <div className="flex-1 min-h-0 flex flex-row overflow-hidden">
            {/* Left Side Menu (White background) */}
            {renderSettingsMenu({ toggleSettingsGroup, expandedSettingsGroups, setSettingsMenu, settingsMenu })}

            {/* Right Space Table / Content Area */}
            <div className="flex-1 min-h-0 p-6 overflow-y-auto printpal-compact-scroll flex flex-col items-stretch printpal-settings-workspace bg-[#F3F5F7]">
              {settingsMenu === "businessDetails" && (
                <BusinessDetailsView
                  value={businessDetails}
                  taxes={taxes}
                  applyTaxesToSaleableItems={applyTaxesToSaleableItems}
                  onSave={handleSaveBusinessDetails}
                  showToast={showToast}
                />
              )}

              {settingsMenu === "products" && (
                renderProductsPage({ openDrawerForProduct, products, materials, finishes, handleEditProduct, handleDeleteProduct })
              )}

              {settingsMenu === "materials" && (
                renderMaterialsPage({ openMaterialPrompt, materials, handleEditMaterial, handleDeleteMaterial })
              )}

              {settingsMenu === "finishes" && (
                renderFinishesPage({ openFinishPrompt, finishes, handleEditFinish, handleDeleteFinish })
              )}

              {settingsMenu === "tax" && (
                renderTaxPage({ applyTaxesToSaleableItems, handleOpenAddTaxModal, setApplyTaxesToSaleableItems, showToast, taxes, handleOpenEditTaxModal, handleDeleteTax })
              )}

              {settingsMenu === "supplier" && (
                renderSupplierSwitchPage({ isSupplierEnabled, setIsSupplierEnabled, activeTab, setActiveTab, showToast })
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="printpal-content-body">
          {/* Leads Header & Action Bar */}
          {renderLeadsHeader({ activeTab, closeNewCustomerModal, setActiveTab, isSupplierEnabled, openDrawer, openDrawerForSupplier })}

          {/* ── 4. Table Card (8px padding, 14px font size, Desktop - 2 feel) ── */}
          {renderLeadsTable({ activeTab, customers, handleEditCustomer, handleDeleteCustomer, handleViewSites, enquiries, handleEditEnquiry, handleDeleteEnquiry, isSupplierEnabled, suppliers, handleEditSupplier, handleDeleteSupplier })}
        </main>
      )}

      {/* ── 5. New Customer / Enquiry Modal / Drawer (Desktop - 4 Exact Two-Column Apple Spec) ── */}
      <div
        className={`printpal-modal-overlay ${isModalOpen ? "open" : ""}`}
        id="new-customer-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeNewCustomerModal()
          }
        }}
      >
        <div
          className="printpal-modal-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sheet-title"
        >
          {/* Fixed Top Header Bar inside Modal (Desktop - 4) */}
          <div className="printpal-modal-header-bar">
            <h2 className="printpal-modal-title-text" id="modal-sheet-title">
              {drawerTitle}
            </h2>

            <div className="printpal-modal-header-actions">
              <Button
                variant="outline"
                type="button"
                className="printpal-btn-cancel"
                onClick={closeNewCustomerModal}
              >
                Cancel
              </Button>
              {!drawerTitle.includes("Supplier") && !drawerTitle.includes("Product") && !drawerTitle.includes("Material") && !drawerTitle.includes("Finish") && (
                <Button
                  variant="outline"
                  type="button"
                  className="border-[#D7440E] text-[#D7440E] hover:bg-[#D7440E]/10 hover:text-[#D7440E] hover:border-[#D7440E] text-[13px] font-medium transition-colors shadow-none cursor-pointer"
                  onClick={handleRaiseQuoteFromDrawer}
                >
                  Raise Quote
                </Button>
              )}
              <Button
                variant="orange"
                type="button"
                className="printpal-btn-save"
                onClick={() => {
                  if (drawerTitle.includes("Supplier")) {
                    handleSaveSupplier()
                  } else if (drawerTitle.includes("Product")) {
                    handleSaveProduct()
                  } else if (drawerTitle.includes("Material")) {
                    handleSaveMaterial()
                  } else if (drawerTitle.includes("Finish")) {
                    handleSaveFinish()
                  } else {
                    handleSaveCustomer()
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Scrollable Modal Content Body (20px padding on all sides) */}
          <div className="printpal-modal-scroll-content">
            {drawerTitle.includes("Supplier") ? (
              /* Supplier Form in 2-Column Desktop Spec (Identical to Customer Drawer) */
              renderSupplierForm({ supplierErrors, supplierForm, setSupplierForm, setSupplierErrors, servicesDropdownOpen, setServicesDropdownOpen, selectedServices, servicesSearchQuery, setServicesSearchQuery, filteredServices, toggleService, locationsDropdownOpen, setLocationsDropdownOpen, selectedLocations, locationsSearchQuery, setLocationsSearchQuery, filteredLocations, toggleLocation })
            ) : drawerTitle.includes("Product") ? (
              /* Product Form: First single centered top card, below 2-panel layout (Left: Finishes, Right: Materials) */
              renderProductForm({ productErrors, productForm, setProductForm, setProductErrors, finishes, finishesSearchInDrawer, setFinishesSearchInDrawer, openFinishPrompt, materials, materialsSearchInDrawer, setMaterialsSearchInDrawer, openMaterialPrompt })
            ) : drawerTitle.includes("Material") ? (
              /* Material Form in 2-Column Desktop Spec */
              renderMaterialForm({ materialErrors, materialForm, setMaterialForm, setMaterialErrors, isSupplierEnabled })
            ) : drawerTitle.includes("Finish") ? (
              /* Finish Form in 2-Column Desktop Spec */
              renderFinishForm({ finishErrors, finishForm, setFinishForm, setFinishErrors })
            ) : (
              /* Customer / Enquiry Form */
              renderCustomerForm({ highlightedAnchorKey, formErrors, formBasicDetails, setFormBasicDetails, setFormErrors, handleSaveAsEnquiry, activeRightTab, setActiveRightTab, formSites, collapsedSites, handleToggleCollapse, handleDeleteSite, setFormSites, setActiveSearchSiteId, setGeoapifyPredictions, activeSearchSiteId, isSearchingPlaces, geoapifyPredictions, handleSelectPlace, handleOpenLiveView, products, materials, finishes, handleDeleteService, setProductDrawerReturnTitle, drawerTitle, setQuickTargetService, openDrawerForProduct, openMaterialPrompt, openFinishPrompt, handleAddService, handleAddAnotherSite, billingDetails, setBillingDetails })
            )}
          </div>
        </div>
      </div>

      {/* ── 6. Interactive Multi-Site Modal (Desktop - 2) ── */}
      {selectedCustomerForSites && (
        renderMultiSiteModal({ setSelectedCustomerForSites, selectedCustomerForSites })
      )}





      {/* ── 7.5. Quick Add Product Pop-up Modal (Untitled UI / UI Library) ── */}
      {isQuickProductModalOpen && (
        renderQuickAddProductModal({ isQuickProductModalOpen, setIsQuickProductModalOpen, setQuickProductName, setQuickProductDesc, setQuickProductSelectedMats, setQuickProductSelectedFins, setQuickTargetService, setQuickProductError, quickProductError, quickProductName, quickProductDesc, quickProductSelectedMats, materials, quickProductSelectedFins, finishes, handleSaveQuickProduct })
      )}







      {/* ── 9b. Add / Edit Tax Pop-up Modal ── */}
      {isTaxModalOpen && (
        renderTaxModal({ isTaxModalOpen, setEditingTax, setTaxForm, setTaxErrors, setIsTaxModalOpen, editingTax, taxErrors, taxForm, handleSaveTax })
      )}
    </div>
  )
}
