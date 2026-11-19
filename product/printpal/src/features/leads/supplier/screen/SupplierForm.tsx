import type * as React from "react"
import { AlertCircle, ChevronDown, Search, X, Plus } from "lucide-react"
import { Label, Input, Textarea, Checkbox, Popover, PopoverTrigger, PopoverContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@printpal/ui"

export function renderSupplierForm({ supplierErrors, supplierForm, setSupplierForm, setSupplierErrors, servicesDropdownOpen, setServicesDropdownOpen, selectedServices, servicesSearchQuery, setServicesSearchQuery, filteredServices, toggleService, locationsDropdownOpen, setLocationsDropdownOpen, selectedLocations, locationsSearchQuery, setLocationsSearchQuery, filteredLocations, toggleLocation }: { supplierErrors: Record<string, string>; supplierForm: { supplierName: string; contactPerson: string; phone: string; email: string; isWhatsAppSame: boolean; whatsappNumber: string; category: string; gstin: string; address: string; addressLine1: string; addressLine2: string; city: string; state: string; pincode: string; servingRegions: string; isBillingSameAsWarehouse: boolean; billingAddress: string; billingAddressLine1: string; billingAddressLine2: string; billingCity: string; billingState: string; billingPincode: string; isShippingSameAsBilling: boolean; shippingAddress: string; shippingAddressLine1: string; shippingAddressLine2: string; shippingCity: string; shippingState: string; shippingPincode: string; deliveryLeadTime: string; minOrderQty: string; paymentTerms: string; notes: string} ; setSupplierForm: React.Dispatch<React.SetStateAction<{ supplierName: string; contactPerson: string; phone: string; email: string; isWhatsAppSame: boolean; whatsappNumber: string; category: string; gstin: string; address: string; addressLine1: string; addressLine2: string; city: string; state: string; pincode: string; servingRegions: string; isBillingSameAsWarehouse: boolean; billingAddress: string; billingAddressLine1: string; billingAddressLine2: string; billingCity: string; billingState: string; billingPincode: string; isShippingSameAsBilling: boolean; shippingAddress: string; shippingAddressLine1: string; shippingAddressLine2: string; shippingCity: string; shippingState: string; shippingPincode: string; deliveryLeadTime: string; minOrderQty: string; paymentTerms: string; notes: string} >>; setSupplierErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; servicesDropdownOpen: boolean; setServicesDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>; selectedServices: string[]; servicesSearchQuery: string; setServicesSearchQuery: React.Dispatch<React.SetStateAction<string>>; filteredServices: string[]; toggleService: (service: string) => void; locationsDropdownOpen: boolean; setLocationsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>; selectedLocations: string[]; locationsSearchQuery: string; setLocationsSearchQuery: React.Dispatch<React.SetStateAction<string>>; filteredLocations: string[]; toggleLocation: (location: string) => void }): React.ReactNode {
  return <div className="printpal-new-cust-grid-wrapper">
    {Object.keys(supplierErrors).length > 0 && (
      <div className="flex items-center gap-2 p-3 mb-4 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-[12px]/4 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
        <span>
          Please resolve the {Object.keys(supplierErrors).length} error{Object.keys(supplierErrors).length > 1 ? "s" : ""} marked below to save the supplier.
        </span>
      </div>
    )}

    <div className="printpal-new-cust-grid">
      {/* ── Left Column Card: Basic Supplier Details (300px Fixated) ── */}
      <div className="printpal-card-basic-details">
        <div className="printpal-card-title">Supplier Details</div>

        {/* 1. Company Name */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="supp-name">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="supp-name"
            placeholder="e.g. Mehta Acrylics & Plastics"
            className={`printpal-form-input ${supplierErrors.supplierName ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={supplierForm.supplierName}
            onChange={(e) => {
              setSupplierForm((prev) => ({ ...prev, supplierName: e.target.value }))
              if (supplierErrors.supplierName) {
                setSupplierErrors((prev) => {
                  const n = { ...prev }
                  delete n.supplierName
                  return n
                })
              }
            } } />
          {supplierErrors.supplierName && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {supplierErrors.supplierName}
            </span>
          )}
        </div>

        {/* 2. Supplier Name (Contact Person) */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="supp-contact">
            Supplier Name (Contact Person)
          </Label>
          <Input
            id="supp-contact"
            placeholder="e.g. Rajesh Mehta"
            className="printpal-form-input"
            value={supplierForm.contactPerson}
            onChange={(e) => setSupplierForm((prev) => ({ ...prev, contactPerson: e.target.value }))} />
        </div>

        {/* 3. Supplier Number (Phone) */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="supp-phone">
            Supplier Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="supp-phone"
            type="tel"
            placeholder="e.g. 98400 12345"
            className={`printpal-form-input ${supplierErrors.phone ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={supplierForm.phone}
            onChange={(e) => {
              const val = e.target.value
              setSupplierForm((prev) => ({
                ...prev,
                phone: val,
                whatsappNumber: prev.isWhatsAppSame ? val : prev.whatsappNumber,
              }))
              if (supplierErrors.phone) {
                setSupplierErrors((prev) => {
                  const n = { ...prev }
                  delete n.phone
                  return n
                })
              }
            } } />
          {supplierErrors.phone && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {supplierErrors.phone}
            </span>
          )}

          {/* WhatsApp Checkbox */}
          <div className="printpal-checkbox-label">
            <Checkbox
              id="supp-whatsapp-same"
              checked={supplierForm.isWhatsAppSame}
              onCheckedChange={(checked) => setSupplierForm((prev) => ({
                ...prev,
                isWhatsAppSame: checked === true,
                whatsappNumber: checked === true ? prev.phone : prev.whatsappNumber,
              }))} />
            <Label
              htmlFor="supp-whatsapp-same"
              className="cursor-pointer font-normal text-[12px]/4 text-[#202428] leading-tight select-none"
            >
              WhatsApp number is same as supplier number
            </Label>
          </div>
        </div>

        {/* 4. Conditional WhatsApp Number Field */}
        {!supplierForm.isWhatsAppSame && (
          <div className="printpal-form-group printpal-whatsapp-field-enter">
            <Label className="printpal-form-label" htmlFor="supp-whatsapp">
              WhatsApp Number
            </Label>
            <Input
              id="supp-whatsapp"
              type="tel"
              placeholder="e.g. 98400 12345"
              className="printpal-form-input"
              value={supplierForm.whatsappNumber}
              onChange={(e) => setSupplierForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))} />
          </div>
        )}

        {/* 5. Email Address */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="supp-email">
            Email Address
          </Label>
          <Input
            id="supp-email"
            type="email"
            placeholder="e.g. rajesh@mehtaacrylics.com"
            className="printpal-form-input"
            value={supplierForm.email}
            onChange={(e) => setSupplierForm((prev) => ({ ...prev, email: e.target.value }))} />
        </div>

        {/* 6. Description / Notes Box */}
        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
          <Label className="printpal-form-label" htmlFor="supp-notes">
            Supplier Description / Notes
          </Label>
          <Textarea
            id="supp-notes"
            placeholder="Add internal vendor notes, specializations, business hours..."
            className="min-h-[72px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
            value={supplierForm.notes}
            onChange={(e) => setSupplierForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </div>
      </div>

      {/* ── Right Column: Cards (780px Flexible) ── */}
      <div className="printpal-right-column">
        <div className="printpal-sites-scroll-area">
          <div className="printpal-sites-wrapper">
            {/* ── Card 1: Supplier Address ── */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Supplier Address
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                  {/* Address Line 1 & Address Line 2 */}
                  <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-addr1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="supp-addr1"
                        placeholder="e.g. No. 12 Industrial Estate"
                        className={`printpal-form-input ${supplierErrors.addressLine1 ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={supplierForm.addressLine1}
                        onChange={(e) => {
                          const line1 = e.target.value
                          setSupplierForm((prev) => ({
                            ...prev,
                            addressLine1: line1,
                            address: [line1, prev.addressLine2].filter(Boolean).join(", "),
                          }))
                          if (supplierErrors.addressLine1) {
                            setSupplierErrors((prev) => {
                              const n = { ...prev }
                              delete n.addressLine1
                              return n
                            })
                          }
                        } } />
                      {supplierErrors.addressLine1 && (
                        <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {supplierErrors.addressLine1}
                        </span>
                      )}
                    </div>

                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-addr2">
                        Address Line 2
                      </Label>
                      <Input
                        id="supp-addr2"
                        placeholder="e.g. 3rd Cross Street, Guindy"
                        className="printpal-form-input"
                        value={supplierForm.addressLine2}
                        onChange={(e) => {
                          const line2 = e.target.value
                          setSupplierForm((prev) => ({
                            ...prev,
                            addressLine2: line2,
                            address: [prev.addressLine1, line2].filter(Boolean).join(", "),
                          }))
                        } } />
                    </div>
                  </div>

                  <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-city">City</Label>
                      <Input
                        id="supp-city"
                        placeholder="Chennai"
                        className="printpal-form-input"
                        value={supplierForm.city}
                        onChange={(e) => setSupplierForm((prev) => ({ ...prev, city: e.target.value }))} />
                    </div>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-state">State</Label>
                      <Input
                        id="supp-state"
                        placeholder="Tamil Nadu"
                        className="printpal-form-input"
                        value={supplierForm.state}
                        onChange={(e) => setSupplierForm((prev) => ({ ...prev, state: e.target.value }))} />
                    </div>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-pincode">Pincode</Label>
                      <Input
                        id="supp-pincode"
                        placeholder="600032"
                        className="printpal-form-input"
                        value={supplierForm.pincode}
                        onChange={(e) => setSupplierForm((prev) => ({ ...prev, pincode: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: Services & Locations Served (Merged) ── */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Services & Locations Served
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                  {/* 1. What Services / Materials They Provide */}
                  <div className="printpal-form-group" style={{ marginBottom: "16px" }}>
                    <Label className="printpal-form-label">
                      What Services / Materials They Provide <span className="text-red-500">*</span>
                    </Label>

                    <Popover open={servicesDropdownOpen} onOpenChange={setServicesDropdownOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`printpal-form-input flex items-center justify-between cursor-pointer w-full text-left ${supplierErrors.category ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
                        >
                          <span className={selectedServices.length > 0 ? "text-[#202428] font-medium text-[13px]" : "text-[#737B84] text-[13px]"}>
                            {selectedServices.length === 0
                              ? "Select services & supplies provided..."
                              : `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={4}
                        className="w-[520px] max-w-[calc(100vw-40px)] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-[8px] overflow-hidden z-[9999]"
                      >
                        <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-[8px] w-full box-border overflow-hidden">
                          <Search className="h-4 w-4 text-[#737B84] shrink-0" />
                          <input
                            type="text"
                            placeholder="Search services or type custom..."
                            value={servicesSearchQuery}
                            onChange={(e) => setServicesSearchQuery(e.target.value)}
                            className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent" />
                          {servicesSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setServicesSearchQuery("")}
                              className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
                              title="Clear search"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                          {filteredServices.map((service) => {
                            const isChecked = selectedServices.includes(service)
                            return (
                              <div
                                key={service}
                                onClick={() => toggleService(service)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] cursor-pointer text-[12px]/4 select-none transition-colors ${isChecked ? "bg-[#D7440E]/5 text-[#202428] font-medium" : "text-[#202428] hover:bg-[#F3F5F7]"}`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => toggleService(service)} />
                                <span className="flex-1">{service}</span>
                              </div>
                            )
                          })}
                          {servicesSearchQuery.trim() && !filteredServices.some(s => s.toLowerCase() === servicesSearchQuery.trim().toLowerCase()) && (
                            <div
                              onClick={() => {
                                toggleService(servicesSearchQuery.trim())
                                setServicesSearchQuery("")
                              } }
                              className="flex items-center gap-2 px-3 py-2 rounded-[6px] cursor-pointer text-[12px]/4 text-[#D7440E] hover:bg-[#D7440E]/10 font-medium"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add "{servicesSearchQuery.trim()}" as custom service</span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {supplierErrors.category && (
                      <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {supplierErrors.category}
                      </span>
                    )}

                    {/* Small Selected Chips with 'x' */}
                    {selectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {selectedServices.map((service) => (
                          <span
                            key={service}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F3F5F7] border border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
                          >
                            <span>{service}</span>
                            <button
                              type="button"
                              onClick={() => toggleService(service)}
                              className="text-[#737B84] hover:text-red-500 rounded-full transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Serving Regions & Delivery Coverage */}
                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                    <Label className="printpal-form-label">
                      Serving Regions & Delivery Coverage
                    </Label>

                    <Popover open={locationsDropdownOpen} onOpenChange={setLocationsDropdownOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="printpal-form-input flex items-center justify-between cursor-pointer w-full text-left"
                        >
                          <span className={selectedLocations.length > 0 ? "text-[#202428] font-medium text-[13px]" : "text-[#737B84] text-[13px]"}>
                            {selectedLocations.length === 0
                              ? "Select delivery regions & coverage..."
                              : `${selectedLocations.length} region${selectedLocations.length > 1 ? "s" : ""} selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={4}
                        className="w-[520px] max-w-[calc(100vw-40px)] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-[8px] overflow-hidden z-[9999]"
                      >
                        <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-[8px] w-full box-border overflow-hidden">
                          <Search className="h-4 w-4 text-[#737B84] shrink-0" />
                          <input
                            type="text"
                            placeholder="Search cities, districts, regions..."
                            value={locationsSearchQuery}
                            onChange={(e) => setLocationsSearchQuery(e.target.value)}
                            className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent" />
                          {locationsSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setLocationsSearchQuery("")}
                              className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
                              title="Clear search"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                          {filteredLocations.map((loc) => {
                            const isChecked = selectedLocations.includes(loc)
                            return (
                              <div
                                key={loc}
                                onClick={() => toggleLocation(loc)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] cursor-pointer text-[12px]/4 select-none transition-colors ${isChecked ? "bg-[#D7440E]/5 text-[#202428] font-medium" : "text-[#202428] hover:bg-[#F3F5F7]"}`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => toggleLocation(loc)} />
                                <span className="flex-1">{loc}</span>
                              </div>
                            )
                          })}
                          {locationsSearchQuery.trim() && !filteredLocations.some(l => l.toLowerCase() === locationsSearchQuery.trim().toLowerCase()) && (
                            <div
                              onClick={() => {
                                toggleLocation(locationsSearchQuery.trim())
                                setLocationsSearchQuery("")
                              } }
                              className="flex items-center gap-2 px-3 py-2 rounded-[6px] cursor-pointer text-[12px]/4 text-[#D7440E] hover:bg-[#D7440E]/10 font-medium"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Add "{locationsSearchQuery.trim()}" as custom region</span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Small Selected Location Chips with 'x' */}
                    {selectedLocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {selectedLocations.map((loc) => (
                          <span
                            key={loc}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#F3F5F7] border border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
                          >
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => toggleLocation(loc)}
                              className="text-[#737B84] hover:text-red-500 rounded-full transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 4: Billing Address & Shipping Address ── */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Billing Address & Shipping Address
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px 16px 16px 16px" }}>
                  <div className="font-semibold text-[12px]/4 text-[#202428] uppercase tracking-wider mb-3">
                    Registered Billing Details
                  </div>

                  <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-gstin">
                        GSTIN (Tax ID)
                      </Label>
                      <Input
                        id="supp-gstin"
                        placeholder="33AAACA1234A1Z5"
                        className="printpal-form-input uppercase"
                        value={supplierForm.gstin}
                        onChange={(e) => setSupplierForm((prev) => ({
                          ...prev,
                          gstin: e.target.value.toUpperCase(),
                        }))} />
                    </div>

                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="supp-payment-terms">
                        Payment Terms
                      </Label>
                      <Select
                        value={supplierForm.paymentTerms || "ADVANCE"}
                        onValueChange={(val) => setSupplierForm((prev) => ({ ...prev, paymentTerms: val }))}
                      >
                        <SelectTrigger id="supp-payment-terms" className="w-full h-9 bg-white border-[#DCE1E5] text-[13px] text-[#202428] hover:border-[#b5bfc7] focus:border-[#2878D0] focus:ring-0 focus-visible:ring-1 focus-visible:ring-[#2878D0] data-[state=open]:border-[#2878D0]">
                          <SelectValue placeholder="Select terms..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#DCE1E5] shadow-lg rounded-[6px] z-[9999]">
                          <SelectItem value="ADVANCE">100% Advance Payment</SelectItem>
                          <SelectItem value="ADVANCE_50">50% Advance / 50% on Delivery</SelectItem>
                          <SelectItem value="NET_15">Net 15 Days Credit</SelectItem>
                          <SelectItem value="NET_30">Net 30 Days Credit</SelectItem>
                          <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="printpal-form-group" style={{ marginBottom: "16px" }}>
                    <div className="printpal-checkbox-label" style={{ marginTop: 0 }}>
                      <Checkbox
                        id="supp-billing-same"
                        checked={supplierForm.isBillingSameAsWarehouse !== false}
                        onCheckedChange={(checked) => setSupplierForm((prev) => ({
                          ...prev,
                          isBillingSameAsWarehouse: checked === true,
                          billingAddressLine1: checked === true ? prev.addressLine1 : prev.billingAddressLine1,
                          billingAddressLine2: checked === true ? prev.addressLine2 : prev.billingAddressLine2,
                          billingCity: checked === true ? prev.city : prev.billingCity,
                          billingState: checked === true ? prev.state : prev.billingState,
                          billingPincode: checked === true ? prev.pincode : prev.billingPincode,
                          billingAddress: checked === true ? prev.address : prev.billingAddress,
                        }))} />
                      <Label
                        htmlFor="supp-billing-same"
                        className="cursor-pointer font-normal text-[12px]/4 text-[#202428] leading-tight select-none"
                      >
                        Billing address is same as supplier dispatch address
                      </Label>
                    </div>

                    {!supplierForm.isBillingSameAsWarehouse && (
                      <div className="mt-3 printpal-whatsapp-field-enter">
                        <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                            <Label className="printpal-form-label" htmlFor="supp-billing-addr1">
                              Address Line 1 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="supp-billing-addr1"
                              placeholder="e.g. Registered Corporate Office, Plot No. 45"
                              className="printpal-form-input"
                              value={supplierForm.billingAddressLine1}
                              onChange={(e) => {
                                const l1 = e.target.value
                                setSupplierForm((prev) => ({
                                  ...prev,
                                  billingAddressLine1: l1,
                                  billingAddress: [l1, prev.billingAddressLine2, prev.billingCity, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                }))
                              } } />
                          </div>
                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                            <Label className="printpal-form-label" htmlFor="supp-billing-addr2">
                              Address Line 2
                            </Label>
                            <Input
                              id="supp-billing-addr2"
                              placeholder="e.g. Business Tower, Mount Road"
                              className="printpal-form-input"
                              value={supplierForm.billingAddressLine2}
                              onChange={(e) => {
                                const l2 = e.target.value
                                setSupplierForm((prev) => ({
                                  ...prev,
                                  billingAddressLine2: l2,
                                  billingAddress: [prev.billingAddressLine1, l2, prev.billingCity, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                }))
                              } } />
                          </div>
                        </div>

                        <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                            <Label className="printpal-form-label" htmlFor="supp-billing-city">City</Label>
                            <Input
                              id="supp-billing-city"
                              placeholder="Chennai"
                              className="printpal-form-input"
                              value={supplierForm.billingCity}
                              onChange={(e) => {
                                const c = e.target.value
                                setSupplierForm((prev) => ({
                                  ...prev,
                                  billingCity: c,
                                  billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, c, prev.billingState, prev.billingPincode].filter(Boolean).join(", "),
                                }))
                              } } />
                          </div>
                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                            <Label className="printpal-form-label" htmlFor="supp-billing-state">State</Label>
                            <Input
                              id="supp-billing-state"
                              placeholder="Tamil Nadu"
                              className="printpal-form-input"
                              value={supplierForm.billingState}
                              onChange={(e) => {
                                const s = e.target.value
                                setSupplierForm((prev) => ({
                                  ...prev,
                                  billingState: s,
                                  billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.billingCity, s, prev.billingPincode].filter(Boolean).join(", "),
                                }))
                              } } />
                          </div>
                          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                            <Label className="printpal-form-label" htmlFor="supp-billing-pincode">Pincode</Label>
                            <Input
                              id="supp-billing-pincode"
                              placeholder="600002"
                              className="printpal-form-input"
                              value={supplierForm.billingPincode}
                              onChange={(e) => {
                                const p = e.target.value
                                setSupplierForm((prev) => ({
                                  ...prev,
                                  billingPincode: p,
                                  billingAddress: [prev.billingAddressLine1, prev.billingAddressLine2, prev.billingCity, prev.billingState, p].filter(Boolean).join(", "),
                                }))
                              } } />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address (PrintPal Workshop User Address) */}
                  <div className="border-t border-[#DCE1E5] pt-4 mt-2">
                    <div className="font-semibold text-[12px]/4 text-[#202428] uppercase tracking-wider mb-2">
                      Shipping / Delivery Address
                    </div>
                    <p className="text-[12px]/4 text-[#737B84] mb-3">
                      Destination where materials and supplies ordered from this vendor will be received.
                    </p>

                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <div className="printpal-checkbox-label" style={{ marginTop: 0 }}>
                        <Checkbox
                          id="supp-shipping-same"
                          checked={supplierForm.isShippingSameAsBilling !== false}
                          onCheckedChange={(checked) => setSupplierForm((prev) => ({
                            ...prev,
                            isShippingSameAsBilling: checked === true,
                            shippingAddressLine1: checked === true ? (prev.isBillingSameAsWarehouse ? prev.addressLine1 : prev.billingAddressLine1) : prev.shippingAddressLine1,
                            shippingAddressLine2: checked === true ? (prev.isBillingSameAsWarehouse ? prev.addressLine2 : prev.billingAddressLine2) : prev.shippingAddressLine2,
                            shippingCity: checked === true ? (prev.isBillingSameAsWarehouse ? prev.city : prev.billingCity) : prev.shippingCity,
                            shippingState: checked === true ? (prev.isBillingSameAsWarehouse ? prev.state : prev.billingState) : prev.shippingState,
                            shippingPincode: checked === true ? (prev.isBillingSameAsWarehouse ? prev.pincode : prev.billingPincode) : prev.shippingPincode,
                            shippingAddress: checked === true
                              ? (prev.isBillingSameAsWarehouse ? prev.address : prev.billingAddress)
                              : prev.shippingAddress,
                          }))} />
                        <Label
                          htmlFor="supp-shipping-same"
                          className="cursor-pointer font-normal text-[12px]/4 text-[#202428] leading-tight select-none"
                        >
                          Shipping address is same as billing address (PrintPal Workshop Hub)
                        </Label>
                      </div>

                      {!supplierForm.isShippingSameAsBilling && (
                        <div className="mt-3 printpal-whatsapp-field-enter">
                          <div className="printpal-form-row-2" style={{ marginBottom: "16px" }}>
                            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                              <Label className="printpal-form-label" htmlFor="supp-shipping-addr1">
                                Address Line 1 <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="supp-shipping-addr1"
                                placeholder="e.g. PrintPal Workshop & Factory, No. 8"
                                className="printpal-form-input"
                                value={supplierForm.shippingAddressLine1}
                                onChange={(e) => {
                                  const l1 = e.target.value
                                  setSupplierForm((prev) => ({
                                    ...prev,
                                    shippingAddressLine1: l1,
                                    shippingAddress: [l1, prev.shippingAddressLine2, prev.shippingCity, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                  }))
                                } } />
                            </div>
                            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                              <Label className="printpal-form-label" htmlFor="supp-shipping-addr2">
                                Address Line 2
                              </Label>
                              <Input
                                id="supp-shipping-addr2"
                                placeholder="e.g. SIDCO Industrial Estate, Guindy"
                                className="printpal-form-input"
                                value={supplierForm.shippingAddressLine2}
                                onChange={(e) => {
                                  const l2 = e.target.value
                                  setSupplierForm((prev) => ({
                                    ...prev,
                                    shippingAddressLine2: l2,
                                    shippingAddress: [prev.shippingAddressLine1, l2, prev.shippingCity, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                  }))
                                } } />
                            </div>
                          </div>

                          <div className="printpal-form-row-3" style={{ marginBottom: 0 }}>
                            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                              <Label className="printpal-form-label" htmlFor="supp-shipping-city">City</Label>
                              <Input
                                id="supp-shipping-city"
                                placeholder="Chennai"
                                className="printpal-form-input"
                                value={supplierForm.shippingCity}
                                onChange={(e) => {
                                  const c = e.target.value
                                  setSupplierForm((prev) => ({
                                    ...prev,
                                    shippingCity: c,
                                    shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, c, prev.shippingState, prev.shippingPincode].filter(Boolean).join(", "),
                                  }))
                                } } />
                            </div>
                            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                              <Label className="printpal-form-label" htmlFor="supp-shipping-state">State</Label>
                              <Input
                                id="supp-shipping-state"
                                placeholder="Tamil Nadu"
                                className="printpal-form-input"
                                value={supplierForm.shippingState}
                                onChange={(e) => {
                                  const s = e.target.value
                                  setSupplierForm((prev) => ({
                                    ...prev,
                                    shippingState: s,
                                    shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, prev.shippingCity, s, prev.shippingPincode].filter(Boolean).join(", "),
                                  }))
                                } } />
                            </div>
                            <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                              <Label className="printpal-form-label" htmlFor="supp-shipping-pincode">Pincode</Label>
                              <Input
                                id="supp-shipping-pincode"
                                placeholder="600032"
                                className="printpal-form-input"
                                value={supplierForm.shippingPincode}
                                onChange={(e) => {
                                  const p = e.target.value
                                  setSupplierForm((prev) => ({
                                    ...prev,
                                    shippingPincode: p,
                                    shippingAddress: [prev.shippingAddressLine1, prev.shippingAddressLine2, prev.shippingCity, prev.shippingState, p].filter(Boolean).join(", "),
                                  }))
                                } } />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}
