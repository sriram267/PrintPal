import type * as React from "react"
import type { SiteRecord } from "../../shared/types"
import type { ProductRecord, MaterialRecord, FinishRecord } from "../../../settings/shared/types"
import { Label, Input, Button, Textarea, Checkbox } from "@printpal/ui"
import { AlertCircle, Trash2, ChevronDown, Search, X, MapPin, Loader2, Compass, Plus } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { BadgeGroup } from "@/components/ui/badge-group"
import { SearchableActionSelect } from "../../../../shared/SearchableActionSelect"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
export interface GeoapifySuggestion {
  id: string
  name: string
  formattedAddress: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
}

export const GEOAPIFY_API_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string) || ""

export function renderCustomerForm({ highlightedAnchorKey, formErrors, formBasicDetails, setFormBasicDetails, setFormErrors, handleSaveAsEnquiry, activeRightTab, setActiveRightTab, formSites, collapsedSites, handleToggleCollapse, handleDeleteSite, setFormSites, setActiveSearchSiteId, setGeoapifyPredictions, activeSearchSiteId, isSearchingPlaces, geoapifyPredictions, handleSelectPlace, handleOpenLiveView, products, materials, finishes, handleDeleteService, setProductDrawerReturnTitle, drawerTitle, setQuickTargetService, openDrawerForProduct, openMaterialPrompt, openFinishPrompt, handleAddService, handleAddAnotherSite, billingDetails, setBillingDetails }: { highlightedAnchorKey: string | null; formErrors: Record<string, string>; formBasicDetails: { businessName: string; primaryContactName: string; primaryContactNumber: string; isWhatsAppSame: boolean; whatsappNumber: string; email: string; followUpDate: string} ; setFormBasicDetails: React.Dispatch<React.SetStateAction<{ businessName: string; primaryContactName: string; primaryContactNumber: string; isWhatsAppSame: boolean; whatsappNumber: string; email: string; followUpDate: string} >>; setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; handleSaveAsEnquiry: () => Promise<void>; activeRightTab: string; setActiveRightTab: React.Dispatch<React.SetStateAction<"services" | "billing">>; formSites: SiteRecord[]; collapsedSites: Set<string>; handleToggleCollapse: (siteId: string) => void; handleDeleteSite: (siteIndex: number) => void; setFormSites: React.Dispatch<React.SetStateAction<SiteRecord[]>>; setActiveSearchSiteId: React.Dispatch<React.SetStateAction<string | null>>; setGeoapifyPredictions: React.Dispatch<React.SetStateAction<GeoapifySuggestion[]>>; activeSearchSiteId: string | null; isSearchingPlaces: boolean; geoapifyPredictions: GeoapifySuggestion[]; handleSelectPlace: (siteIdx: number, place: GeoapifySuggestion) => void; handleOpenLiveView: (site: SiteRecord) => void; products: ProductRecord[]; materials: MaterialRecord[]; finishes: FinishRecord[]; handleDeleteService: (siteIndex: number, serviceIndex: number) => void; setProductDrawerReturnTitle: React.Dispatch<React.SetStateAction<string | null>>; drawerTitle: string; setQuickTargetService: React.Dispatch<React.SetStateAction<{ siteIdx: number; srvIdx: number}  | null>>; openDrawerForProduct: (product?: ProductRecord) => void; openMaterialPrompt: (mat?: MaterialRecord | null, targetService?: { siteIdx: number; srvIdx: number}  | null) => void; openFinishPrompt: (fin?: FinishRecord | null, targetService?: { siteIdx: number; srvIdx: number}  | null) => void; handleAddService: (siteIndex: number) => void; handleAddAnotherSite: () => void; billingDetails: { billingName: string; gstin: string; billingAddress: string; billingAddressLine1: string; billingAddressLine2: string; city: string; state: string; pincode: string; isShippingSameAsBilling: boolean; shippingAddress: string; shippingAddressLine1: string; shippingAddressLine2: string; shippingCity: string; shippingState: string; shippingPincode: string} ; setBillingDetails: React.Dispatch<React.SetStateAction<{ billingName: string; gstin: string; billingAddress: string; billingAddressLine1: string; billingAddressLine2: string; city: string; state: string; pincode: string; isShippingSameAsBilling: boolean; shippingAddress: string; shippingAddressLine1: string; shippingAddressLine2: string; shippingCity: string; shippingState: string; shippingPincode: string} >> }): React.ReactNode {
  return <div className="printpal-new-cust-grid-wrapper">
    <div className="printpal-new-cust-grid">
      {/* ── Left Column Card: Basic Details (20px padding) ── */}
      <div
        id="drawer-basic-details-card"
        className={`printpal-card-basic-details printpal-anchor-target ${highlightedAnchorKey === "drawer-basic-details-card"
          ? "printpal-anchor-highlight"
          : ""}`}
      >
        <div className="printpal-card-title">Basic Details</div>

        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="input-biz-name">
            Business Name
          </Label>
          <Input
            type="text"
            id="input-biz-name"
            className={`printpal-form-input ${formErrors.businessName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={formBasicDetails.businessName}
            onChange={(e) => {
              const val = e.target.value
              setFormBasicDetails((prev) => ({ ...prev, businessName: val }))
              if (formErrors.businessName || formErrors.primaryContactName) {
                setFormErrors((prev) => {
                  const next = { ...prev }
                  delete next.businessName
                  if (val.trim()) {
                    delete next.primaryContactName
                  }
                  return next
                })
              }
            } }
            placeholder="" />
          {formErrors.businessName && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {formErrors.businessName}
            </span>
          )}
        </div>

        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="input-contact-name">
            Primary Contact Name
          </Label>
          <Input
            type="text"
            id="input-contact-name"
            className={`printpal-form-input ${formErrors.primaryContactName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={formBasicDetails.primaryContactName}
            onChange={(e) => {
              const val = e.target.value
              setFormBasicDetails((prev) => ({ ...prev, primaryContactName: val }))
              if (formErrors.primaryContactName || formErrors.businessName) {
                setFormErrors((prev) => {
                  const next = { ...prev }
                  delete next.primaryContactName
                  if (val.trim()) {
                    delete next.businessName
                  }
                  return next
                })
              }
            } }
            placeholder="" />
          {formErrors.primaryContactName && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {formErrors.primaryContactName}
            </span>
          )}
        </div>

        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="input-contact-phone">
            Primary Contact Number <span className="text-red-500">*</span>
          </Label>
          <Input
            type="tel"
            id="input-contact-phone"
            className={`printpal-form-input ${formErrors.primaryContactNumber ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={formBasicDetails.primaryContactNumber}
            onChange={(e) => {
              const val = e.target.value
              setFormBasicDetails((prev) => ({
                ...prev,
                primaryContactNumber: val,
                whatsappNumber: prev.isWhatsAppSame ? val : prev.whatsappNumber,
              }))
              if (formErrors.primaryContactNumber) {
                setFormErrors((prev) => {
                  const next = { ...prev }
                  delete next.primaryContactNumber
                  return next
                })
              }
            } }
            placeholder="" />
          {formErrors.primaryContactNumber && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {formErrors.primaryContactNumber}
            </span>
          )}
          <div className="printpal-checkbox-label">
            <Checkbox
              id="input-whatsapp-same"
              checked={formBasicDetails.isWhatsAppSame}
              onCheckedChange={(checked) => setFormBasicDetails((prev) => ({
                ...prev,
                isWhatsAppSame: checked === true,
                whatsappNumber: checked === true
                  ? prev.primaryContactNumber
                  : prev.whatsappNumber,
              }))} />
            <Label
              htmlFor="input-whatsapp-same"
              className="cursor-pointer font-normal text-[12px]/4 text-[#202428] leading-tight select-none"
            >
              WhatsApp number is same as primary contact number
            </Label>
          </div>
        </div>

        {/* Conditional Primary WhatsApp Number field when unchecked */}
        {!formBasicDetails.isWhatsAppSame && (
          <div className="printpal-form-group printpal-whatsapp-field-enter">
            <Label className="printpal-form-label" htmlFor="input-whatsapp-number">
              Primary WhatsApp Number <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              id="input-whatsapp-number"
              className={`printpal-form-input ${formErrors.whatsappNumber ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
              value={formBasicDetails.whatsappNumber}
              onChange={(e) => {
                const val = e.target.value
                setFormBasicDetails((prev) => ({
                  ...prev,
                  whatsappNumber: val,
                }))
                if (formErrors.whatsappNumber) {
                  setFormErrors((prev) => {
                    const next = { ...prev }
                    delete next.whatsappNumber
                    return next
                  })
                }
              } }
              placeholder="e.g. 9876543210"
              autoFocus />
            {formErrors.whatsappNumber && (
              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {formErrors.whatsappNumber}
              </span>
            )}
          </div>
        )}

        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="input-email">
            Email
          </Label>
          <Input
            type="email"
            id="input-email"
            className={`printpal-form-input ${formErrors.email ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={formBasicDetails.email}
            onChange={(e) => {
              const val = e.target.value
              setFormBasicDetails((prev) => ({ ...prev, email: val }))
              if (formErrors.email) {
                setFormErrors((prev) => {
                  const next = { ...prev }
                  delete next.email
                  return next
                })
              }
            } }
            placeholder="" />
          {formErrors.email && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {formErrors.email}
            </span>
          )}
        </div>

        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="input-followup-date">
            Follow-up date
          </Label>
          <DatePicker
            id="input-followup-date"
            date={formBasicDetails.followUpDate}
            onDateChange={(_date, dateStr) => setFormBasicDetails((prev) => ({ ...prev, followUpDate: dateStr }))}
            placeholder="dd-mm-yyyy" />
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full h-9 border-[#D7440E] text-[#D7440E] hover:bg-[#D7440E]/10 hover:text-[#D7440E] hover:border-[#D7440E] font-medium text-[13px] rounded-[6px] transition-colors shadow-none cursor-pointer focus-visible:ring-1 focus-visible:ring-[#D7440E]"
            onClick={handleSaveAsEnquiry}
          >
            Save as enquiry
          </Button>
        </div>
      </div>

      {/* ── Right Column: Standalone Tabs Card + Sites / Billing (Desktop - 4) ── */}
      <div className="printpal-right-column">
        {/* Scrollable Container for Tabs + Site Cards / Billing */}
        <div className="printpal-sites-scroll-area">
          {/* Standalone Tabs Card Component (Matches site card width, scrolls alongside) */}
          <div className="printpal-tabs-card">
            <div className="printpal-site-tabs-nav">
              <button
                type="button"
                className={`printpal-site-tab-btn ${activeRightTab === "services" ? "active" : ""}`}
                onClick={() => setActiveRightTab("services")}
              >
                Signage
              </button>
              <button
                type="button"
                className={`printpal-site-tab-btn ${activeRightTab === "billing" ? "active" : ""}`}
                onClick={() => setActiveRightTab("billing")}
              >
                Billing Address
              </button>
            </div>
          </div>

          {activeRightTab === "services" ? (
            <>
              {/* Standalone Sites Cards Wrapper */}
              <div className="printpal-sites-wrapper">
                {formSites.map((site, siteIdx) => {
                  const siteNum = siteIdx + 1
                  const isCollapsed = collapsedSites.has(site.id)
                  const siteDisplayName = site.siteName?.trim()
                  const serviceCount = site.serviceDetails?.length || 1

                  return (
                    <div
                      key={site.id}
                      id={`drawer-site-${siteIdx}`}
                      className={`printpal-site-card printpal-anchor-target ${highlightedAnchorKey === `drawer-site-${siteIdx}`
                        ? "printpal-anchor-highlight"
                        : ""}`}
                    >
                      {/* Site Header Pill Bar (#F3F5F7, height 36px) */}
                      <div
                        className="printpal-site-card-header"
                        onClick={() => handleToggleCollapse(site.id)}
                      >
                        <div className="printpal-site-card-title">
                          <span
                            className={siteDisplayName
                              ? "text-[13px] font-semibold text-[#202428]"
                              : "text-[13px] font-normal text-[#737B84]"}
                          >
                            {siteDisplayName || "Site name"}
                          </span>
                          <BadgeGroup
                            variant="green"
                            label={`Site ${siteNum}`}
                            counter={`${serviceCount} ${serviceCount === 1 ? "service" : "services"}`} />
                        </div>
                        <div className="printpal-site-card-tools">
                          <button
                            type="button"
                            className="printpal-icon-btn delete"
                            title="Delete Site"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSite(siteIdx)
                            } }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="printpal-icon-btn printpal-btn-collapse"
                            title="Collapse / Expand"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleCollapse(site.id)
                            } }
                          >
                            <ChevronDown
                              className="h-3.5 w-3.5"
                              style={{
                                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }} />
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div className="printpal-site-card-body">
                          <div className="printpal-site-info-fields">
                            {/* Site Name Input (Moved above search field) */}
                            <div className="printpal-form-group">
                              <Label className="printpal-form-label" htmlFor={`drawer-site-${siteIdx}-name`}>Site Name</Label>
                              <Input
                                id={`drawer-site-${siteIdx}-name`}
                                type="text"
                                className="printpal-form-input"
                                value={site.siteName || ""}
                                onChange={(e) => {
                                  const updated = [...formSites]
                                  updated[siteIdx] = {
                                    ...updated[siteIdx],
                                    siteName: e.target.value,
                                  }
                                  setFormSites(updated)
                                } } />
                            </div>

                            {/* Google Maps Search Bar + 36px Rounded Live View Button */}
                            <div className="printpal-search-row">
                              <div className={`printpal-site-search-wrapper relative ${formErrors[`site_${siteIdx}_address`] ? "border border-red-500 rounded-[6px]" : ""}`}>
                                <Search className="printpal-search-icon" />
                                <Input
                                  type="text"
                                  className="printpal-site-search-input pr-8"
                                  placeholder="Search the site location (business name or address)"
                                  value={site.address || ""}
                                  autoComplete="off"
                                  onFocus={() => setActiveSearchSiteId(site.id)}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setFormSites((prev) => {
                                      const updated = [...prev]
                                      if (updated[siteIdx]) {
                                        updated[siteIdx] = {
                                          ...updated[siteIdx],
                                          address: val,
                                        }
                                      }
                                      return updated
                                    })
                                    setActiveSearchSiteId(site.id)
                                    if (formErrors[`site_${siteIdx}_address`]) {
                                      setFormErrors((prev) => {
                                        const next = { ...prev }
                                        delete next[`site_${siteIdx}_address`]
                                        return next
                                      })
                                    }
                                  } } />
                                {site.address && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormSites((prev) => {
                                        const updated = [...prev]
                                        if (updated[siteIdx]) {
                                          updated[siteIdx] = {
                                            ...updated[siteIdx],
                                            address: "",
                                          }
                                        }
                                        return updated
                                      })
                                      setGeoapifyPredictions([])
                                    } }
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                                    title="Clear location search"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Geoapify Places Autocomplete Dropdown */}
                                {activeSearchSiteId === site.id && (
                                  <div className="printpal-maps-autocomplete-dropdown">
                                    <div className="printpal-maps-dropdown-header">
                                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737B84] uppercase tracking-wider">
                                        <MapPin className="h-3 w-3 text-[#2878D0]" />
                                        Geoapify Places
                                      </span>
                                      {GEOAPIFY_API_KEY && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Live API
                                        </span>
                                      )}
                                    </div>
                                    <div className="printpal-maps-dropdown-list">
                                      {!GEOAPIFY_API_KEY ? (
                                        <div className="p-3.5 text-center text-[12px]/4 text-[#737B84]">
                                          <div className="flex items-center justify-center gap-1.5 font-medium text-[#202428] mb-1">
                                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                            <span>Geoapify API Key Required</span>
                                          </div>
                                          <div className="text-[11px] leading-relaxed text-[#737B84]">
                                            Add <code className="bg-gray-100 text-[#2878D0] px-1 py-0.5 rounded font-sans text-[10px]">VITE_GEOAPIFY_API_KEY</code> to <code className="bg-gray-100 text-[#202428] px-1 py-0.5 rounded font-sans text-[10px]">product/PrintPal/.env</code> to query live places.
                                          </div>
                                        </div>
                                      ) : isSearchingPlaces ? (
                                        <div className="p-4 text-center text-[12px]/4 text-[#737B84] flex items-center justify-center gap-2">
                                          <Loader2 className="h-4 w-4 animate-[spin_1s_linear_infinite] text-[#2878D0]" />
                                          <span>Searching places...</span>
                                        </div>
                                      ) : geoapifyPredictions.length > 0 ? (
                                        geoapifyPredictions.map((place) => (
                                          <div
                                            key={place.id}
                                            className="printpal-maps-dropdown-item"
                                            onMouseDown={(e) => {
                                              e.preventDefault()
                                              handleSelectPlace(siteIdx, place)
                                            } }
                                          >
                                            <div className="printpal-maps-item-icon">
                                              <MapPin className="h-3.5 w-3.5 text-red-500" />
                                            </div>
                                            <div className="printpal-maps-item-info">
                                              <div className="printpal-maps-item-name">{place.name}</div>
                                              <div className="printpal-maps-item-address">{place.formattedAddress}</div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (site.address || "").trim().length >= 2 ? (
                                        <div className="p-3 text-center text-[12px]/4 text-[#737B84]">
                                          No results found for "{site.address}".
                                        </div>
                                      ) : (
                                        <div className="p-3 text-center text-[12px]/4 text-[#737B84]">
                                          Type 2 or more characters to search locations...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* 36px 'Live View' Button Component (Outline Secondary variant) — Only appears when location with lat/lng is selected */}
                              {Boolean(site.lat && site.lng) && (
                                <Button
                                  type="button"
                                  variant="outlineSecondary"
                                  size="default"
                                  className="printpal-btn-live-view px-4 text-[13px] font-medium rounded-[6px] shadow-sm cursor-pointer"
                                  onClick={() => handleOpenLiveView(site)}
                                  title="Open Google Maps 360° Street View in a new tab"
                                >
                                  <Compass className="h-3.5 w-3.5 text-secondary" />
                                  <span>Live View</span>
                                </Button>
                              )}
                            </div>

                            {formErrors[`site_${siteIdx}_address`] && (
                              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1 mb-2">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                {formErrors[`site_${siteIdx}_address`]}
                              </span>
                            )}

                            <div
                              className="printpal-manual-address-link"
                              onClick={() => {
                                const el = document.getElementById(`site-addr1-${site.id}`)
                                el?.focus()
                              } }
                            >
                              Cant find it ? Enter address manually
                            </div>

                            {/* Address Line 1 & 2 (2 Columns) */}
                            <div className="printpal-form-row-2">
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">Address Line 1</Label>
                                <Input
                                  type="text"
                                  id={`site-addr1-${site.id}`}
                                  className="printpal-form-input"
                                  value={site.addressLine1 || ""}
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      addressLine1: e.target.value,
                                    }
                                    setFormSites(updated)
                                  } } />
                              </div>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">Address Line 2</Label>
                                <Input
                                  type="text"
                                  className="printpal-form-input"
                                  value={site.addressLine2 || ""}
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      addressLine2: e.target.value,
                                    }
                                    setFormSites(updated)
                                  } } />
                              </div>
                            </div>

                            {/* City, State, Pincode (3 Columns) */}
                            <div className="printpal-form-row-3">
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">City</Label>
                                <Input
                                  type="text"
                                  className="printpal-form-input"
                                  value={site.city || ""}
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      city: e.target.value,
                                    }
                                    setFormSites(updated)
                                  } } />
                              </div>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">State</Label>
                                <Input
                                  type="text"
                                  className="printpal-form-input"
                                  value={site.state || ""}
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      state: e.target.value,
                                    }
                                    setFormSites(updated)
                                  } } />
                              </div>
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label">Pincode</Label>
                                <Input
                                  type="text"
                                  className={`printpal-form-input ${formErrors[`site_${siteIdx}_pincode`] ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                  value={site.pincode || ""}
                                  placeholder="e.g. 560001"
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      pincode: e.target.value,
                                    }
                                    setFormSites(updated)
                                    if (formErrors[`site_${siteIdx}_pincode`]) {
                                      setFormErrors((prev) => {
                                        const next = { ...prev }
                                        delete next[`site_${siteIdx}_pincode`]
                                        return next
                                      })
                                    }
                                  } } />
                                {formErrors[`site_${siteIdx}_pincode`] && (
                                  <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    {formErrors[`site_${siteIdx}_pincode`]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Target Delivery Date & Site Contact Coordination (3-column layout) */}
                            <div className="printpal-form-row-3">
                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-delivery-date`}>Target Delivery Date</Label>
                                <DatePicker
                                  date={site.targetDeliveryDate}
                                  onDateChange={(_d, dateStr) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      targetDeliveryDate: dateStr,
                                    }
                                    setFormSites(updated)
                                  } }
                                  placeholder="dd-mm-yyyy" />
                              </div>

                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-contact-name`}>Site Contact Name</Label>
                                <Input
                                  id={`site-${siteIdx}-contact-name`}
                                  type="text"
                                  className="printpal-form-input"
                                  value={site.contactPerson || ""}
                                  placeholder="e.g. Ramesh (Store In-Charge)"
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      contactPerson: e.target.value,
                                    }
                                    setFormSites(updated)
                                  } } />
                              </div>

                              <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                                <Label className="printpal-form-label" htmlFor={`site-${siteIdx}-contact-phone`}>Site Contact Phone</Label>
                                <Input
                                  id={`site-${siteIdx}-contact-phone`}
                                  type="tel"
                                  className={`printpal-form-input ${formErrors[`site_${siteIdx}_contact_phone`] ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                                  value={site.contactPhone || ""}
                                  placeholder="e.g. 98400 12345"
                                  onChange={(e) => {
                                    const updated = [...formSites]
                                    updated[siteIdx] = {
                                      ...updated[siteIdx],
                                      contactPhone: e.target.value,
                                    }
                                    setFormSites(updated)
                                    if (formErrors[`site_${siteIdx}_contact_phone`]) {
                                      setFormErrors((prev) => {
                                        const next = { ...prev }
                                        delete next[`site_${siteIdx}_contact_phone`]
                                        return next
                                      })
                                    }
                                  } } />
                                {formErrors[`site_${siteIdx}_contact_phone`] && (
                                  <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                    {formErrors[`site_${siteIdx}_contact_phone`]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="printpal-form-divider" />
                          </div>

                          {/* Services on this site section */}
                          <div className="printpal-services-section">
                            <div className="printpal-services-section-title">
                              Services on this site
                            </div>
                            <div className="printpal-services-list-wrapper">
                              {(site.serviceDetails || []).map((srv, srvIdx) => {
                                const matchedProduct = products.find(
                                  (p) => p.title.toLowerCase() === (srv.signStyle || "").toLowerCase()
                                )
                                const availableMaterials = matchedProduct?.materialIds && matchedProduct.materialIds.length > 0
                                  ? [
                                    ...materials.filter((m) => matchedProduct.materialIds?.includes(m.id)),
                                    ...materials.filter((m) => !matchedProduct.materialIds?.includes(m.id)),
                                  ]
                                  : materials

                                const availableFinishes = matchedProduct?.finishIds && matchedProduct.finishIds.length > 0
                                  ? [
                                    ...finishes.filter((f) => matchedProduct.finishIds?.includes(f.id)),
                                    ...finishes.filter((f) => !matchedProduct.finishIds?.includes(f.id)),
                                  ]
                                  : finishes

                                return (
                                  <div
                                    key={srv.id}
                                    id={`drawer-site-${siteIdx}-service-${srvIdx}`}
                                    className={`printpal-service-block-card printpal-anchor-target ${highlightedAnchorKey ===
                                      `drawer-site-${siteIdx}-service-${srvIdx}`
                                      ? "printpal-anchor-highlight"
                                      : ""}`}
                                  >
                                    {/* Card Header: [#1] Service 1 + Trash button */}
                                    <div className="printpal-service-block-header">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-semibold text-[#202428] bg-white border border-[#DCE1E5] rounded">
                                          #{srvIdx + 1}
                                        </span>
                                        <span className="printpal-service-block-title">
                                          Service {srvIdx + 1}
                                        </span>
                                      </div>
                                      {(site.serviceDetails?.length || 0) > 1 && (
                                        <button
                                          type="button"
                                          className="printpal-service-del-btn p-1 rounded hover:bg-red-50 text-[#737B84] hover:text-red-500 transition-colors"
                                          title="Remove Service"
                                          onClick={() => handleDeleteService(siteIdx, srvIdx)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Row 1: Sign Style (Left) + Environment / Placement (Right) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Sign style <span className="text-red-500">*</span>
                                        </Label>
                                        <SearchableActionSelect
                                          value={srv.signStyle}
                                          options={products
                                            .filter((p) => p.isActive !== false)
                                            .map((p) => ({ value: p.title, label: p.title }))}
                                          placeholder="Select Sign Style..."
                                          searchPlaceholder="Search products..."
                                          emptyMessage="No products cataloged yet"
                                          addActionText="Add new Product"
                                          error={Boolean(formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`])}
                                          onAddAction={() => {
                                            setProductDrawerReturnTitle(drawerTitle)
                                            setQuickTargetService({ siteIdx, srvIdx })
                                            openDrawerForProduct()
                                          } }
                                          onChange={(val) => {
                                            const updated = [...formSites]
                                            const srvs = [...(site.serviceDetails || [])]
                                            const newMatched = products.find((p) => p.title === val)
                                            let nextMat = srv.material
                                            let nextFin = srv.finishing

                                            const validMats = newMatched?.materialIds
                                              ? materials.filter((m) => newMatched.materialIds!.includes(m.id))
                                              : []
                                            if (!validMats.some((m) => m.name === nextMat)) {
                                              nextMat = validMats[0]?.name || ""
                                            }

                                            const validFins = newMatched?.finishIds
                                              ? finishes.filter((f) => newMatched.finishIds!.includes(f.id))
                                              : []
                                            if (!validFins.some((f) => f.name === nextFin)) {
                                              nextFin = validFins[0]?.name || ""
                                            }

                                            srvs[srvIdx] = {
                                              ...srv,
                                              signStyle: val,
                                              material: nextMat,
                                              finishing: nextFin,
                                            }
                                            updated[siteIdx] = {
                                              ...site,
                                              serviceDetails: srvs,
                                            }
                                            setFormSites(updated)
                                            if (formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`]) {
                                              setFormErrors((prev) => {
                                                const next = { ...prev }
                                                delete next[`site_${siteIdx}_srv_${srvIdx}_signStyle`]
                                                return next
                                              })
                                            }
                                          } } />
                                        {formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`] && (
                                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                                            <AlertCircle className="h-3 w-3 shrink-0" />
                                            {formErrors[`site_${siteIdx}_srv_${srvIdx}_signStyle`]}
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Environment / Placement
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          {(["Outdoor", "Indoor", "Coastal"] as const).map(
                                            (app) => (
                                              <button
                                                key={app}
                                                type="button"
                                                className={`printpal-pill-btn flex-1 h-9 ${srv.application === app ? "active" : ""}`}
                                                onClick={() => {
                                                  const updated = [...formSites]
                                                  const srvs = [...(site.serviceDetails || [])]
                                                  srvs[srvIdx] = { ...srv, application: app }
                                                  updated[siteIdx] = {
                                                    ...site,
                                                    serviceDetails: srvs,
                                                  }
                                                  setFormSites(updated)
                                                } }
                                              >
                                                {app}
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Row 2: Dimensions & Quantity + Not sure of dimensions yet Checkbox */}
                                    <div className="mb-4">
                                      <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                        Dimensions & Quantity
                                      </Label>
                                      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                        <div className="flex-1 min-w-[90px]">
                                          <Input
                                            type="number"
                                            placeholder="W"
                                            disabled={srv.notSureOfDimensions}
                                            value={srv.width || ""}
                                            onChange={(e) => {
                                              const updated = [...formSites]
                                              const srvs = [...(site.serviceDetails || [])]
                                              srvs[srvIdx] = { ...srv, width: e.target.value }
                                              updated[siteIdx] = {
                                                ...site,
                                                serviceDetails: srvs,
                                              }
                                              setFormSites(updated)
                                              if (formErrors[`site_${siteIdx}_srv_${srvIdx}_width`]) {
                                                setFormErrors((prev) => {
                                                  const next = { ...prev }
                                                  delete next[`site_${siteIdx}_srv_${srvIdx}_width`]
                                                  return next
                                                })
                                              }
                                            } }
                                            className={`h-9 text-center placeholder:text-center text-[13px] border-[#DCE1E5] bg-white text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] ? "border-red-500" : ""} ${srv.notSureOfDimensions ? "opacity-50 cursor-not-allowed bg-[#F8FAFC]" : ""}`} />
                                        </div>

                                        <span className="text-[12px]/4 font-semibold text-[#737B84] select-none">✕</span>

                                        <div className="flex-1 min-w-[90px]">
                                          <Input
                                            type="number"
                                            placeholder="H"
                                            disabled={srv.notSureOfDimensions}
                                            value={srv.height || ""}
                                            onChange={(e) => {
                                              const updated = [...formSites]
                                              const srvs = [...(site.serviceDetails || [])]
                                              srvs[srvIdx] = { ...srv, height: e.target.value }
                                              updated[siteIdx] = {
                                                ...site,
                                                serviceDetails: srvs,
                                              }
                                              setFormSites(updated)
                                              if (formErrors[`site_${siteIdx}_srv_${srvIdx}_height`]) {
                                                setFormErrors((prev) => {
                                                  const next = { ...prev }
                                                  delete next[`site_${siteIdx}_srv_${srvIdx}_height`]
                                                  return next
                                                })
                                              }
                                            } }
                                            className={`h-9 text-center placeholder:text-center text-[13px] border-[#DCE1E5] bg-white text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows ${formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] ? "border-red-500" : ""} ${srv.notSureOfDimensions ? "opacity-50 cursor-not-allowed bg-[#F8FAFC]" : ""}`} />
                                        </div>

                                        <div className="w-[80px]">
                                          <Select
                                            value={srv.unit || "ft"}
                                            disabled={srv.notSureOfDimensions}
                                            onValueChange={(val) => {
                                              const updated = [...formSites]
                                              const srvs = [...(site.serviceDetails || [])]
                                              srvs[srvIdx] = { ...srv, unit: val }
                                              updated[siteIdx] = {
                                                ...site,
                                                serviceDetails: srvs,
                                              }
                                              setFormSites(updated)
                                            } }
                                          >
                                            <SelectTrigger className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="min-w-[80px] bg-white border-[#DCE1E5] shadow-lg rounded-[6px] z-[9999]">
                                              <SelectItem value="ft">ft</SelectItem>
                                              <SelectItem value="in">in</SelectItem>
                                              <SelectItem value="mm">mm</SelectItem>
                                              <SelectItem value="m">m</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className={`flex items-center h-9 bg-white border rounded-[6px] overflow-hidden transition-colors w-[100px] ${formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`] ? "border-red-500" : "border-[#DCE1E5] hover:border-[#b5bfc7] focus-within:border-[#2878D0]"}`}>
                                          <input
                                            type="number"
                                            min={1}
                                            value={srv.quantity || 1}
                                            placeholder="1"
                                            onChange={(e) => {
                                              const updated = [...formSites]
                                              const srvs = [...(site.serviceDetails || [])]
                                              srvs[srvIdx] = {
                                                ...srv,
                                                quantity: Math.max(1, Number(e.target.value)),
                                              }
                                              updated[siteIdx] = {
                                                ...site,
                                                serviceDetails: srvs,
                                              }
                                              setFormSites(updated)
                                              if (formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]) {
                                                setFormErrors((prev) => {
                                                  const next = { ...prev }
                                                  delete next[`site_${siteIdx}_srv_${srvIdx}_quantity`]
                                                  return next
                                                })
                                              }
                                            } }
                                            className="w-full h-full border-none bg-transparent text-center placeholder:text-center text-[13px] text-[#202428] font-medium outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none no-spin-arrows" />
                                        </div>
                                      </div>

                                      {/* Not sure of dimensions yet Checkbox */}
                                      <div className="flex items-center gap-2 mt-2">
                                        <Checkbox
                                          id={`not-sure-dim-${siteIdx}-${srvIdx}`}
                                          checked={Boolean(srv.notSureOfDimensions)}
                                          onCheckedChange={(checked) => {
                                            const updated = [...formSites]
                                            const srvs = [...(site.serviceDetails || [])]
                                            srvs[srvIdx] = {
                                              ...srv,
                                              notSureOfDimensions: Boolean(checked),
                                            }
                                            updated[siteIdx] = { ...site, serviceDetails: srvs }
                                            setFormSites(updated)
                                          } } />
                                        <label
                                          htmlFor={`not-sure-dim-${siteIdx}-${srvIdx}`}
                                          className="text-[12px]/4 text-[#737B84] cursor-pointer select-none"
                                        >
                                          Not sure of dimensions yet
                                        </label>
                                      </div>

                                      {(formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]) && (
                                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
                                          <AlertCircle className="h-3 w-3 shrink-0" />
                                          {formErrors[`site_${siteIdx}_srv_${srvIdx}_width`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_height`] || formErrors[`site_${siteIdx}_srv_${srvIdx}_quantity`]}
                                        </span>
                                      )}
                                    </div>

                                    {/* Row 3: Material / Substrate (Left) + Finishing / Mounting (Right) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Material / Substrate
                                        </Label>
                                        <SearchableActionSelect
                                          value={srv.material || ""}
                                          disabled={false}
                                          options={availableMaterials.map((mat) => ({ value: mat.name, label: mat.name }))}
                                          placeholder="Select Material / Substrate..."
                                          searchPlaceholder="Search materials..."
                                          emptyMessage="No materials created in Settings yet"
                                          addActionText="Add new Material"
                                          onAddAction={() => {
                                            openMaterialPrompt(null, { siteIdx, srvIdx })
                                          } }
                                          onChange={(val) => {
                                            const updated = [...formSites]
                                            const srvs = [...(site.serviceDetails || [])]
                                            srvs[srvIdx] = { ...srv, material: val }
                                            updated[siteIdx] = {
                                              ...site,
                                              serviceDetails: srvs,
                                            }
                                            setFormSites(updated)
                                          } } />
                                      </div>

                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Finishing / Mounting
                                        </Label>
                                        <SearchableActionSelect
                                          value={srv.finishing || ""}
                                          disabled={false}
                                          options={availableFinishes.map((fin) => ({ value: fin.name, label: fin.name }))}
                                          placeholder="Select Finishing / Mounting..."
                                          searchPlaceholder="Search finishes..."
                                          emptyMessage="No finishes created in Settings yet"
                                          addActionText="Add new Finish"
                                          onAddAction={() => {
                                            openFinishPrompt(null, { siteIdx, srvIdx })
                                          } }
                                          onChange={(val) => {
                                            const updated = [...formSites]
                                            const srvs = [...(site.serviceDetails || [])]
                                            srvs[srvIdx] = { ...srv, finishing: val }
                                            updated[siteIdx] = {
                                              ...site,
                                              serviceDetails: srvs,
                                            }
                                            setFormSites(updated)
                                          } } />
                                      </div>
                                    </div>

                                    {/* Row 4: Artwork Status (Front/Left) + Colour / Shade Code (Next/Right) with Approach 2 Logic */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Artwork Status
                                        </Label>
                                        <Select
                                          value={srv.artworkStatus || ""}
                                          onValueChange={(val: any) => {
                                            const targetSite = formSites[siteIdx]
                                            const currentServices = targetSite.serviceDetails || []
                                            const currentSrv = currentServices[srvIdx]

                                            let newColor = currentSrv.color || ""
                                            if (val === "VECTOR_READY" || val === "NEEDS_VECTORIZATION") {
                                              // Approach 2: Smart auto-default if empty
                                              if (!newColor.trim()) {
                                                newColor = "As per uploaded artwork"
                                              }
                                            } else if (val === "NEEDS_DESIGN" || val === "TO_BE_PROVIDED") {
                                              // If it was the auto-default string, reset to empty
                                              if (newColor === "As per uploaded artwork") {
                                                newColor = ""
                                              }
                                            }

                                            const updatedServices = [...currentServices]
                                            updatedServices[srvIdx] = {
                                              ...currentSrv,
                                              artworkStatus: val,
                                              color: newColor,
                                            }
                                            const updated = [...formSites]
                                            updated[siteIdx] = {
                                              ...targetSite,
                                              serviceDetails: updatedServices,
                                            }
                                            setFormSites(updated)
                                          } }
                                        >
                                          <SelectTrigger className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] data-[placeholder]:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                                            <SelectValue placeholder="Select Artwork Status..." />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white border-[#DCE1E5] shadow-lg rounded-[6px] z-[9999]">
                                            <SelectItem value="VECTOR_READY" className="text-[13px]">Ready Vector (.ai / .cdr / .eps)</SelectItem>
                                            <SelectItem value="NEEDS_VECTORIZATION" className="text-[13px]">Needs Vectorization (Photo / Scan)</SelectItem>
                                            <SelectItem value="NEEDS_DESIGN" className="text-[13px]">Needs Artwork (Design from Scratch)</SelectItem>
                                            <SelectItem value="TO_BE_PROVIDED" className="text-[13px]">To Be Provided Later</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <Label className="text-[12px]/4 font-medium text-[#737B84] block mb-1.5">
                                          Colour / Shade Code
                                        </Label>
                                        <Input
                                          type="text"
                                          value={srv.color || ""}
                                          placeholder="e.g. Signal Red #135 face, Matte Black returns"
                                          className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                                          onChange={(e) => {
                                            const targetSite = formSites[siteIdx]
                                            const currentServices = targetSite.serviceDetails || []
                                            const updatedServices = [...currentServices]
                                            updatedServices[srvIdx] = {
                                              ...currentServices[srvIdx],
                                              color: e.target.value,
                                            }
                                            const updated = [...formSites]
                                            updated[siteIdx] = {
                                              ...targetSite,
                                              serviceDetails: updatedServices,
                                            }
                                            setFormSites(updated)
                                          } } />
                                      </div>
                                    </div>

                                    {/* Row 5: Upload Artwork & Reference Files (Only when Vector Ready or Needs Vectorization) */}
                                    {(srv.artworkStatus === "VECTOR_READY" || srv.artworkStatus === "NEEDS_VECTORIZATION") && (
                                      <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <Label className="text-[12px]/4 font-medium text-[#737B84]">
                                            Upload Artwork & Reference Files
                                          </Label>
                                          <span className="text-[11px] text-[#737B84]">
                                            Max file size: 50MB
                                          </span>
                                        </div>
                                        <div className="printpal-dropzone-wrapper">
                                          <ImageUpload
                                            value={srv.referenceImages || []}
                                            onChange={(imgs) => {
                                              const targetSite = formSites[siteIdx]
                                              const currentServices = targetSite.serviceDetails || []
                                              const targetSrv = currentServices[srvIdx]
                                              const fileNames = imgs.map((img) => img.name || img.id)

                                              const updatedServices = [...currentServices]
                                              updatedServices[srvIdx] = {
                                                ...targetSrv,
                                                referenceImages: imgs,
                                                referenceFiles: fileNames,
                                              }
                                              const updated = [...formSites]
                                              updated[siteIdx] = {
                                                ...targetSite,
                                                serviceDetails: updatedServices,
                                              }
                                              setFormSites(updated)
                                            } }
                                            maxFiles={10}
                                            maxSizeMB={50}
                                            simulateUpload={true}
                                            title="Drop vector files or photos here, or browse"
                                            helperText="Supports .ai, .pdf, .cdr, .dxf, .eps, .png, .jpg (Up to 50MB each)" />
                                        </div>
                                      </div>
                                    )}

                                    {/* Row 6: Fabrication Notes */}
                                    <div className="space-y-1.5">
                                      <Label className="text-[12px]/4 font-medium text-[#737B84]">Fabrication Notes</Label>
                                      <Textarea
                                        value={srv.notes || ""}
                                        placeholder="Add fabrication notes, mounting details, LED specifications..."
                                        onChange={(e) => {
                                          const updated = [...formSites]
                                          const srvs = [...(site.serviceDetails || [])]
                                          srvs[srvIdx] = { ...srv, notes: e.target.value }
                                          updated[siteIdx] = {
                                            ...site,
                                            serviceDetails: srvs,
                                          }
                                          setFormSites(updated)
                                        } }
                                        className="min-h-[64px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]" />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* + Add another services link */}
                            <button
                              type="button"
                              id={`drawer-site-${siteIdx}-add-service`}
                              className={`printpal-btn-add-another-service printpal-anchor-target rounded px-1.5 py-0.5 ${highlightedAnchorKey ===
                                `drawer-site-${siteIdx}-add-service`
                                ? "printpal-anchor-highlight"
                                : ""}`}
                              onClick={() => handleAddService(siteIdx)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add another service</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add Another Site Button (36px Outline Secondary variant, no plus icon) */}
              <div className="pt-2 flex items-center">
                <Button
                  type="button"
                  id="drawer-add-site-btn"
                  variant="outlineSecondary"
                  size="default"
                  className={`h-9 px-4 text-[13px] font-medium rounded-[6px] shadow-sm cursor-pointer printpal-btn-add-site-outline printpal-anchor-target ${highlightedAnchorKey === "drawer-add-site-btn"
                    ? "printpal-anchor-highlight"
                    : ""}`}
                  onClick={handleAddAnotherSite}
                >
                  Add Another Site
                </Button>
              </div>
            </>
          ) : (
            /* ── Standalone Billing and Shipping Address Cards (Desktop - 4) ── */
            <div className="printpal-sites-wrapper">
              {/* ── Card 1: Billing Address ── */}
              <div className="printpal-site-card">
                <div className="printpal-site-card-header cursor-default">
                  <div className="printpal-site-card-title">
                    <span className="text-[13px] font-semibold text-[#202428]">
                      Billing Address
                    </span>
                  </div>
                </div>

                <div className="printpal-site-card-body">
                  <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                    {/* Billing Entity & GSTIN */}
                    <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">Billing Entity / Company Name</Label>
                        <Input
                          type="text"
                          className="printpal-form-input"
                          value={billingDetails.billingName ||
                            formBasicDetails.businessName ||
                            formBasicDetails.primaryContactName ||
                            ""}
                          placeholder="e.g. Acme Corp India Pvt Ltd"
                          onChange={(e) => setBillingDetails((prev) => ({
                            ...prev,
                            billingName: e.target.value,
                          }))} />
                      </div>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">
                          GSTIN (Optional / Tax Registered)
                        </Label>
                        <Input
                          type="text"
                          className={`printpal-form-input uppercase ${formErrors.gstin ? "printpal-input-error border-red-500" : ""}`}
                          value={billingDetails.gstin}
                          placeholder="33AAAAA0000A1Z5"
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase()
                            setBillingDetails((prev) => ({ ...prev, gstin: val }))
                            if (formErrors.gstin) {
                              setFormErrors((prev) => {
                                const next = { ...prev }
                                delete next.gstin
                                return next
                              })
                            }
                          } } />
                        {formErrors.gstin && (
                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {formErrors.gstin}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address Line 1 & Line 2 */}
                    <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">Address Line 1</Label>
                        <Input
                          type="text"
                          className="printpal-form-input"
                          value={billingDetails.billingAddressLine1}
                          placeholder="No.1/16 abc street, DEF nagar"
                          onChange={(e) => {
                            const l1 = e.target.value
                            setBillingDetails((prev) => ({
                              ...prev,
                              billingAddressLine1: l1,
                              billingAddress: [l1, prev.billingAddressLine2, prev.city, prev.state, prev.pincode].filter(Boolean).join(", "),
                            }))
                          } } />
                      </div>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">Address Line 2</Label>
                        <Input
                          type="text"
                          className="printpal-form-input"
                          value={billingDetails.billingAddressLine2}
                          placeholder="e.g. Near Industrial Estate, Guindy"
                          onChange={(e) => {
                            const l2 = e.target.value
                            setBillingDetails((prev) => ({
                              ...prev,
                              billingAddressLine2: l2,
                              billingAddress: [prev.billingAddressLine1, l2, prev.city, prev.state, prev.pincode].filter(Boolean).join(", "),
                            }))
                          } } />
                      </div>
                    </div>

                    {/* City, State, Pincode */}
                    <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">City</Label>
                        <Input
                          type="text"
                          className="printpal-form-input"
                          value={billingDetails.city}
                          onChange={(e) => {
                            const c = e.target.value
                            setBillingDetails((prev) => ({
                              ...prev,
                              city: c,
                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, c, prev.state, prev.pincode].filter(Boolean).join(", "),
                            }))
                          } } />
                      </div>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">State</Label>
                        <Input
                          type="text"
                          className="printpal-form-input"
                          value={billingDetails.state}
                          onChange={(e) => {
                            const s = e.target.value
                            setBillingDetails((prev) => ({
                              ...prev,
                              state: s,
                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.city, s, prev.pincode].filter(Boolean).join(", "),
                            }))
                          } } />
                      </div>
                      <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                        <Label className="printpal-form-label">Pincode</Label>
                        <Input
                          type="text"
                          className={`printpal-form-input ${formErrors.billingPincode ? "printpal-input-error border-red-500" : ""}`}
                          value={billingDetails.pincode}
                          placeholder="600051"
                          onChange={(e) => {
                            const p = e.target.value
                            setBillingDetails((prev) => ({
                              ...prev,
                              pincode: p,
                              billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.city, prev.state, p].filter(Boolean).join(", "),
                            }))
                            if (formErrors.billingPincode) {
                              setFormErrors((prev) => {
                                const next = { ...prev }
                                delete next.billingPincode
                                return next
                              })
                            }
                          } } />
                        {formErrors.billingPincode && (
                          <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {formErrors.billingPincode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
}
