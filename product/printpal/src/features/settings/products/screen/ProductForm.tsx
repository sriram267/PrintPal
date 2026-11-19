import type * as React from "react"
import type { FinishRecord, MaterialRecord } from "../../shared/types"
import { AlertCircle, Search, X } from "lucide-react"
import { Label, Input, Checkbox } from "@printpal/ui"

export function renderProductForm({ productErrors, productForm, setProductForm, setProductErrors, finishes, finishesSearchInDrawer, setFinishesSearchInDrawer, openFinishPrompt, materials, materialsSearchInDrawer, setMaterialsSearchInDrawer, openMaterialPrompt }: { productErrors: Record<string, string>; productForm: { title: string; category: string; description: string; pricedPer: "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum"; materialIds: string[]; finishIds: string[]; isActive: boolean; width: string; height: string; unit: string; returnDepth: string; minStroke: string; material: string; finishing: string; colour: string; application: "Indoor" | "Outdoor" | "Coastal"; productionType: "INTERNAL" | "OUTSOURCE" | "HYBRID"; illumination: string; mounting: string; leadTime: string; notes: string} ; setProductForm: React.Dispatch<React.SetStateAction<{ title: string; category: string; description: string; pricedPer: "Per letter" | "Per sq ft" | "Per inch" | "Per running ft" | "Per piece" | "Lump sum"; materialIds: string[]; finishIds: string[]; isActive: boolean; width: string; height: string; unit: string; returnDepth: string; minStroke: string; material: string; finishing: string; colour: string; application: "Indoor" | "Outdoor" | "Coastal"; productionType: "INTERNAL" | "OUTSOURCE" | "HYBRID"; illumination: string; mounting: string; leadTime: string; notes: string} >>; setProductErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>; finishes: FinishRecord[]; finishesSearchInDrawer: string; setFinishesSearchInDrawer: React.Dispatch<React.SetStateAction<string>>; openFinishPrompt: (fin?: FinishRecord | null, targetService?: { siteIdx: number; srvIdx: number}  | null) => void; materials: MaterialRecord[]; materialsSearchInDrawer: string; setMaterialsSearchInDrawer: React.Dispatch<React.SetStateAction<string>>; openMaterialPrompt: (mat?: MaterialRecord | null, targetService?: { siteIdx: number; srvIdx: number}  | null) => void }): React.ReactNode {
  return <div className="w-full h-full min-h-0 flex flex-col items-center overflow-hidden">
    {Object.keys(productErrors).length > 0 && (
      <div className="flex-shrink-0 flex items-center gap-2 p-2.5 mb-3 rounded-[6px] bg-red-50 border border-red-200 text-red-700 text-[12px]/4 font-medium max-w-[1080px] w-full mx-auto">
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
        <span>Please resolve the errors marked below to save the product.</span>
      </div>
    )}

    <div className="flex-1 min-h-0 w-full max-w-[1080px] mx-auto flex flex-col gap-3.5 overflow-hidden">
      {/* ── Card 1: Product Details (Single Centered Card, Increased Width) ── */}
      <div className="flex-shrink-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none">
        <div className="flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
          <span className="text-[13px] font-semibold text-[#202428]">
            Product Details
          </span>
        </div>

        <div className="p-2 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* 1. Product Name */}
          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label text-[12px]/4 font-medium text-[#344054]" htmlFor="prod-title">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prod-title"
              placeholder="e.g. Front-Lit Channel Letters"
              className={`h-9 text-[12px]/4 border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#94A3B8] focus:border-[#2878D0] ${productErrors.title ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
              value={productForm.title}
              onChange={(e) => {
                setProductForm((prev) => ({ ...prev, title: e.target.value }))
                if (productErrors.title) {
                  setProductErrors((prev) => {
                    const n = { ...prev }
                    delete n.title
                    return n
                  })
                }
              } } />
            {productErrors.title && (
              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {productErrors.title}
              </span>
            )}
          </div>

          {/* 2. Description */}
          <div className="printpal-form-group" style={{ marginBottom: 0 }}>
            <Label className="printpal-form-label text-[12px]/4 font-medium text-[#344054]" htmlFor="prod-desc">
              Description
            </Label>
            <Input
              id="prod-desc"
              placeholder="e.g. Individual 3D letters with a glowing front face..."
              className="h-9 text-[12px]/4 border-[#DCE1E5] bg-white text-[#202428] placeholder:text-[#94A3B8] hover:border-[#b5bfc7] focus:border-[#2878D0] focus-visible:ring-1 focus-visible:ring-[#2878D0]"
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* ── Two-Panel Layout: Left = Finishes, Right = Materials ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-hidden">
        {/* ── Left Panel: Finishes can be done ── */}
        <div className="h-full min-h-0 flex flex-col bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
            <span className="text-[13px] font-semibold text-[#202428]">
              Finishes can be done
            </span>
            {productForm.finishIds.length > 0 && (
              <span className="text-[11px] font-medium text-[#737B84]">
                {productForm.finishIds.length} selected
              </span>
            )}
          </div>

          {/* Card Body: Flex column taking 100% remaining space */}
          <div className="flex-1 min-h-0 flex flex-col p-2 pt-0 overflow-hidden">
            {/* Selected Chips */}
            {productForm.finishIds.length > 0 && (
              <div className="flex-shrink-0 flex flex-wrap gap-1.5 mb-2.5 max-h-[56px] overflow-y-auto printpal-compact-scroll">
                {productForm.finishIds.map((finId) => {
                  const fin = finishes.find((f) => f.id === finId)
                  return (
                    <span key={finId} className="printpal-chip">
                      <span>{fin?.name || finId}</span>
                      <button
                        type="button"
                        className="printpal-chip-remove"
                        title={`Remove ${fin?.name || finId}`}
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            finishIds: prev.finishIds.filter((id) => id !== finId),
                          }))
                        } }
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Search bar & Add Button */}
            <div className="flex-shrink-0 flex items-center gap-2 mb-2.5">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${finishes.length} master finishes...`}
                  value={finishesSearchInDrawer}
                  onChange={(e) => setFinishesSearchInDrawer(e.target.value)}
                  className="w-full h-[44px] pl-9 pr-8 text-[12px]/4 bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#2878D0]" />
                {finishesSearchInDrawer && (
                  <button
                    type="button"
                    onClick={() => setFinishesSearchInDrawer("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="h-[44px] px-3.5 text-[12px]/4 font-medium border border-[#D7440E] text-[#D7440E] bg-transparent hover:bg-[#D7440E]/10 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer shadow-none"
                onClick={() => openFinishPrompt()}
              >
                Add
              </button>
            </div>

            {/* Options Checklist: Maximize height, internal scroll only */}
            <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll border border-[#E2E8F0] rounded-[8px] p-2 bg-[#F8FAFC] space-y-1">
              {finishes
                .filter((f) => !finishesSearchInDrawer.trim() ||
                  f.name.toLowerCase().includes(finishesSearchInDrawer.toLowerCase()) ||
                  (f.type || "").toLowerCase().includes(finishesSearchInDrawer.toLowerCase())
                )
                .map((fin) => {
                  const isSelected = productForm.finishIds.includes(fin.id)
                  return (
                    <div
                      key={fin.id}
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          finishIds: isSelected
                            ? prev.finishIds.filter((id) => id !== fin.id)
                            : [...prev.finishIds, fin.id],
                        }))
                      } }
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[12px]/4 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#EFF6FF] text-[#1E40AF] font-medium" : "hover:bg-white text-[#334155]"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id={`prod-fin-${fin.id}`}
                          checked={isSelected}
                          onCheckedChange={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              finishIds: isSelected
                                ? prev.finishIds.filter((id) => id !== fin.id)
                                : [...prev.finishIds, fin.id],
                            }))
                          } }
                          onClick={(e) => e.stopPropagation()} />
                        <label htmlFor={`prod-fin-${fin.id}`} className="cursor-pointer">
                          {fin.name}
                        </label>
                      </div>
                      <span className="text-[11px] text-[#94A3B8] font-normal">{fin.type}</span>
                    </div>
                  )
                })}
              {finishes.filter((f) => !finishesSearchInDrawer.trim() ||
                f.name.toLowerCase().includes(finishesSearchInDrawer.toLowerCase()) ||
                (f.type || "").toLowerCase().includes(finishesSearchInDrawer.toLowerCase())
              ).length === 0 && (
                  <p className="text-[12px]/4 text-[#94A3B8] text-center py-4">No finishes found.</p>
                )}
            </div>
          </div>
        </div>

        {/* ── Right Panel: Materials can be used ── */}
        <div className="h-full min-h-0 flex flex-col bg-white border border-[#DCE1E5] rounded-[12px] p-2 box-border shadow-none overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between h-9 px-3.5 bg-[#F3F5F7] rounded-[8px] mb-2.5">
            <span className="text-[13px] font-semibold text-[#202428]">
              Materials can be used
            </span>
            {productForm.materialIds.length > 0 && (
              <span className="text-[11px] font-medium text-[#737B84]">
                {productForm.materialIds.length} selected
              </span>
            )}
          </div>

          {/* Card Body: Flex column taking 100% remaining space */}
          <div className="flex-1 min-h-0 flex flex-col p-2 pt-0 overflow-hidden">
            {/* Selected Chips */}
            {productForm.materialIds.length > 0 && (
              <div className="flex-shrink-0 flex flex-wrap gap-1.5 mb-2.5 max-h-[56px] overflow-y-auto printpal-compact-scroll">
                {productForm.materialIds.map((matId) => {
                  const mat = materials.find((m) => m.id === matId)
                  return (
                    <span key={matId} className="printpal-chip">
                      <span>{mat?.name || matId}</span>
                      <button
                        type="button"
                        className="printpal-chip-remove"
                        title={`Remove ${mat?.name || matId}`}
                        onClick={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            materialIds: prev.materialIds.filter((id) => id !== matId),
                          }))
                        } }
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* Search bar & Add Button */}
            <div className="flex-shrink-0 flex items-center gap-2 mb-2.5">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${materials.length} master materials...`}
                  value={materialsSearchInDrawer}
                  onChange={(e) => setMaterialsSearchInDrawer(e.target.value)}
                  className="w-full h-[44px] pl-9 pr-8 text-[12px]/4 bg-white border border-[#CBD5E1] rounded-[6px] focus:outline-none focus:border-[#2878D0]" />
                {materialsSearchInDrawer && (
                  <button
                    type="button"
                    onClick={() => setMaterialsSearchInDrawer("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737B84] hover:text-[#202428] cursor-pointer p-1"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="h-[44px] px-3.5 text-[12px]/4 font-medium border border-[#D7440E] text-[#D7440E] bg-transparent hover:bg-[#D7440E]/10 rounded-[6px] transition-colors whitespace-nowrap cursor-pointer shadow-none"
                onClick={() => openMaterialPrompt()}
              >
                Add
              </button>
            </div>

            {/* Options Checklist: Maximize height, internal scroll only */}
            <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll border border-[#E2E8F0] rounded-[8px] p-2 bg-[#F8FAFC] space-y-1">
              {materials
                .filter((m) => !materialsSearchInDrawer.trim() ||
                  m.name.toLowerCase().includes(materialsSearchInDrawer.toLowerCase()) ||
                  (m.category || "").toLowerCase().includes(materialsSearchInDrawer.toLowerCase())
                )
                .map((mat) => {
                  const isSelected = productForm.materialIds.includes(mat.id)
                  return (
                    <div
                      key={mat.id}
                      onClick={() => {
                        setProductForm((prev) => ({
                          ...prev,
                          materialIds: isSelected
                            ? prev.materialIds.filter((id) => id !== mat.id)
                            : [...prev.materialIds, mat.id],
                        }))
                      } }
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-[12px]/4 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#EFF6FF] text-[#1E40AF] font-medium" : "hover:bg-white text-[#334155]"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          id={`prod-mat-${mat.id}`}
                          checked={isSelected}
                          onCheckedChange={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              materialIds: isSelected
                                ? prev.materialIds.filter((id) => id !== mat.id)
                                : [...prev.materialIds, mat.id],
                            }))
                          } }
                          onClick={(e) => e.stopPropagation()} />
                        <label htmlFor={`prod-mat-${mat.id}`} className="cursor-pointer">
                          {mat.name}
                        </label>
                      </div>
                      <span className="text-[11px] text-[#94A3B8] font-normal">{mat.category}</span>
                    </div>
                  )
                })}
              {materials.filter((m) => !materialsSearchInDrawer.trim() ||
                m.name.toLowerCase().includes(materialsSearchInDrawer.toLowerCase()) ||
                (m.category || "").toLowerCase().includes(materialsSearchInDrawer.toLowerCase())
              ).length === 0 && (
                  <p className="text-[12px]/4 text-[#94A3B8] text-center py-4">No materials found.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
}
