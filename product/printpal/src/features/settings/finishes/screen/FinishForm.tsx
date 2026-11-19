import type * as React from "react"
import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function renderFinishForm({ finishErrors, finishForm, setFinishForm, setFinishErrors }: { finishErrors: Record<string, string>; finishForm: { name: string; type: string; colorCode: string; application: "Indoor" | "Outdoor" | "Coastal"; notes: string} ; setFinishForm: React.Dispatch<React.SetStateAction<{ name: string; type: string; colorCode: string; application: "Indoor" | "Outdoor" | "Coastal"; notes: string} >>; setFinishErrors: React.Dispatch<React.SetStateAction<Record<string, string>>> }): React.ReactNode {
  return <div className="printpal-new-cust-grid-wrapper">
    {Object.keys(finishErrors).length > 0 && (
      <div className="flex items-center gap-2 p-3 mb-4 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-[12px]/4 font-medium">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
        <span>Please resolve the errors marked below to save the finish.</span>
      </div>
    )}

    <div className="printpal-new-cust-grid">
      {/* Left Column Card: Basic Finish Details (300px Fixated) */}
      <div className="printpal-card-basic-details">
        <div className="printpal-card-title">Finish Details</div>

        {/* 1. Finish Name */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="fin-name">
            Finish / Treatment Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fin-name"
            placeholder="e.g. Architectural Polyester Powder Coating (Pure White)"
            className={`printpal-form-input ${finishErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
            value={finishForm.name}
            onChange={(e) => {
              setFinishForm((prev) => ({ ...prev, name: e.target.value }))
              if (finishErrors.name) {
                setFinishErrors((prev) => {
                  const n = { ...prev }
                  delete n.name
                  return n
                })
              }
            } } />
          {finishErrors.name && (
            <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {finishErrors.name}
            </span>
          )}
        </div>

        {/* 2. Process Type */}
        <div className="printpal-form-group">
          <Label className="printpal-form-label" htmlFor="fin-type">
            Process Type
          </Label>
          <select
            id="fin-type"
            className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
            value={finishForm.type}
            onChange={(e) => setFinishForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="Powder Coating">Powder Coating (TGIC / Epoxy Polyester)</option>
            <option value="PVD Plating">PVD Titanium Vacuum Plating</option>
            <option value="Vinyl Overlay">Cast Vinyl Overlay (3M / Avery)</option>
            <option value="Brushed / Polish">Brushed Hairline / Mirror Polish</option>
            <option value="Anodizing">Anodizing (AA10 / AA15 / AA25)</option>
            <option value="PU Paint">Two-Pack Polyurethane (PU) Paint</option>
          </select>
        </div>

        {/* 3. Application Environment */}
        <div className="printpal-form-group" style={{ marginBottom: 0 }}>
          <Label className="printpal-form-label" htmlFor="fin-app">
            Application Environment
          </Label>
          <select
            id="fin-app"
            className="printpal-form-input h-9 text-[13px] bg-white cursor-pointer"
            value={finishForm.application}
            onChange={(e) => setFinishForm((prev) => ({
              ...prev,
              application: e.target.value as "Indoor" | "Outdoor" | "Coastal",
            }))}
          >
            <option value="Outdoor">Outdoor Rated (UV & Weather Resistant)</option>
            <option value="Indoor">Indoor (Architectural & Luxury)</option>
            <option value="Coastal">Coastal Grade (Marine Salt Spray Resistant)</option>
          </select>
        </div>
      </div>

      {/* Right Column: Color Reference & Technical Curing Specs */}
      <div className="printpal-right-column">
        <div className="printpal-sites-list-container">
          <div className="printpal-sites-stack">
            {/* Card 1: Color Standard & Optical Spec */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Color Reference & Architectural Standards
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                    <Label className="printpal-form-label" htmlFor="fin-color">
                      Color Code / RAL / Pantone / Grain Texture
                    </Label>
                    <Input
                      id="fin-color"
                      placeholder="e.g. RAL 9016 (Gloss 85%) or 3M 3630-33 / Pantone 485C"
                      className="printpal-form-input"
                      value={finishForm.colorCode}
                      onChange={(e) => setFinishForm((prev) => ({ ...prev, colorCode: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Curing & Application Specs */}
            <div className="printpal-site-card">
              <div className="printpal-site-card-header cursor-default">
                <div className="printpal-site-card-title">
                  <span className="text-[13px] font-semibold text-[#202428]">
                    Process & Curing Guidelines
                  </span>
                </div>
              </div>

              <div className="printpal-site-card-body">
                <div className="printpal-site-info-fields" style={{ padding: "16px" }}>
                  <div className="printpal-form-group" style={{ marginBottom: 0 }}>
                    <Label className="printpal-form-label" htmlFor="fin-notes">
                      Curing Temperature, Film Thickness & Warranty
                    </Label>
                    <Textarea
                      id="fin-notes"
                      placeholder="Oven curing temp (e.g. 200°C for 10 mins), 60-80 micron dry film thickness (DFT), anti-fingerprint coating..."
                      className="min-h-[80px] text-[13px] border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#737B84] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
                      value={finishForm.notes}
                      onChange={(e) => setFinishForm((prev) => ({ ...prev, notes: e.target.value }))} />
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
