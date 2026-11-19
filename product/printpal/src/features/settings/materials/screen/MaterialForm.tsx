import type * as React from "react"
import { AlertCircle } from "lucide-react"
import { Label, Input, Textarea } from "@printpal/ui"
export function renderMaterialForm({ materialErrors, materialForm, setMaterialForm, setMaterialErrors, isSupplierEnabled }: { materialErrors: Record<string, string>; materialForm: { name: string; category: string; thickness: string; standardSize: string; application: "Indoor" | "Outdoor" | "Coastal"; supplierName: string; notes: string} ; setMaterialForm: React.Dispatch<React.SetStateAction<{ name: string; category: string; thickness: string; standardSize: string; application: "Indoor" | "Outdoor" | "Coastal"; supplierName: string; notes: string} >>; setMaterialErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; isSupplierEnabled: boolean }): React.ReactNode {
  return <div className="printpal-new-cust-grid-wrapper">
    {Object.keys(materialErrors).length > 0 && (
      <div className="flex items-center gap-2 p-3 mb-4 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-[12px]/4 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
        <span>Please resolve the errors marked below to save the material.</span>
      </div>
    )}

    <div className="printpal-new-cust-grid">
      {/* Left Column Card: Basic Material Details (300px Fixated) */}
      <div className="printpal-card-basic-details">
        <div className="printpal-card-title">Material Details</div>

        {/* 1. Material Name */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="mat-name">
            Material Name / Grade <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mat-name"
            placeholder="e.g. Cast Acrylic Sheet (Opal White 433)"
            className={`printpal-form-input ${materialErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={materialForm.name}
            onChange={(e) => {
              setMaterialForm((prev) => ({ ...prev, name: e.target.value }))
              if (materialErrors.name) {
                setMaterialErrors((prev) => {
                  const n = { ...prev }
                  delete n.name
                  return n
                })
              }
            } } />
          {materialErrors.name && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {materialErrors.name}
            </span>
          )}
        </div>

        {/* 2. Substrate Category */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="mat-category">
            Substrate Category
          </Label>
          <select
            id="mat-category"
            className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
            value={materialForm.category}
            onChange={(e) => setMaterialForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="Acrylic & Diffusers">Acrylic & Diffusers</option>
            <option value="ACP / Composite">ACP / Composite</option>
            <option value="Metal & Steel">Metal & Steel</option>
            <option value="Electrical & LED">Electrical & LED</option>
            <option value="Substrate Backing">Substrate Backing</option>
            <option value="Vinyl & Films">Vinyl & Films</option>
            <option value="Structural Hardware">Structural Hardware</option>
          </select>
        </div>

        {/* 3. Application Scope */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="mat-app">
            Application Scope
          </Label>
          <select
            id="mat-app"
            className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
            value={materialForm.application}
            onChange={(e) => setMaterialForm((prev) => ({
              ...prev,
              application: e.target.value as "Indoor" | "Outdoor" | "Coastal",
            }))}
          >
            <option value="Outdoor">Outdoor Rated (UV & Weatherproof)</option>
            <option value="Indoor">Indoor (Architectural / Retail)</option>
            <option value="Coastal">Coastal Grade (Marine Saline Resistant)</option>
          </select>
        </div>

        {/* 4. Preferred Supplier */}
        {isSupplierEnabled && (
          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label" htmlFor="mat-supplier">
              Preferred Supplier / Vendor
            </Label>
            <Input
              id="mat-supplier"
              placeholder="e.g. Mehta Plastics / Jindal Stainless"
              className="printpal-form-input"
              value={materialForm.supplierName}
              onChange={(e) => setMaterialForm((prev) => ({ ...prev, supplierName: e.target.value }))} />
          </div>
        )}
      </div>

      {/* Right Column: Physical Dimensions & Fabrication Notes */}
      <div className="printpal-right-column">
        <div className="printpal-sites-list-container">
          <div className="printpal-sites-stack">
            {/* Card 1: Gauge & Standard Sizes */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Thickness & Standard Dimensions
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                  <div className="printpal-form-row-2" style={{ marginBottom: 0 }}>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="mat-thickness">
                        Thickness / Gauge
                      </Label>
                      <Input
                        id="mat-thickness"
                        placeholder="e.g. 3mm / 5mm or 4mm (0.5mm skin)"
                        className="printpal-form-input"
                        value={materialForm.thickness}
                        onChange={(e) => setMaterialForm((prev) => ({ ...prev, thickness: e.target.value }))} />
                    </div>
                    <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                      <Label className="printpal-form-label" htmlFor="mat-size">
                        Standard Sheet / Pack Size
                      </Label>
                      <Input
                        id="mat-size"
                        placeholder="e.g. 8 × 4 ft Sheet / 50 pcs String"
                        className="printpal-form-input"
                        value={materialForm.standardSize}
                        onChange={(e) => setMaterialForm((prev) => ({ ...prev, standardSize: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Technical Specifications & Workshop Notes */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Technical & Fabrication Guidance
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                    <Label className="printpal-form-label" htmlFor="mat-notes">
                      Fabrication & Laser Cutting Notes
                    </Label>
                    <Textarea
                      id="mat-notes"
                      placeholder="Optical transmission %, laser cutting feed rate, CNC folding V-grooves, fire retardant ratings..."
                      className="min-h-[80px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                      value={materialForm.notes}
                      onChange={(e) => setMaterialForm((prev) => ({ ...prev, notes: e.target.value }))} />
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
