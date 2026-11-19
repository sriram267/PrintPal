import type * as React from "react"
import type { MaterialRecord, FinishRecord } from "../../shared/types"
import { Modal, ModalContent, ModalHeader, ModalIconBadge, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalButton } from "@ui/modal-system"
import { Package, AlertCircle } from "lucide-react"
import { Label, Input, Textarea, Checkbox } from "@printpal/ui"

export function renderQuickAddProductModal({ isQuickProductModalOpen, setIsQuickProductModalOpen, setQuickProductName, setQuickProductDesc, setQuickProductSelectedMats, setQuickProductSelectedFins, setQuickTargetService, setQuickProductError, quickProductError, quickProductName, quickProductDesc, quickProductSelectedMats, materials, quickProductSelectedFins, finishes, handleSaveQuickProduct }: { isQuickProductModalOpen: boolean; setIsQuickProductModalOpen: React.Dispatch<React.SetStateAction<boolean>>; setQuickProductName: React.Dispatch<React.SetStateAction<string>>; setQuickProductDesc: React.Dispatch<React.SetStateAction<string>>; setQuickProductSelectedMats: React.Dispatch<React.SetStateAction<string[]>>; setQuickProductSelectedFins: React.Dispatch<React.SetStateAction<string[]>>; setQuickTargetService: React.Dispatch<React.SetStateAction<{ siteIdx: number; srvIdx: number}  | null>>; setQuickProductError: React.Dispatch<React.SetStateAction<string | null>>; quickProductError: string | null; quickProductName: string; quickProductDesc: string; quickProductSelectedMats: string[]; materials: MaterialRecord[]; quickProductSelectedFins: string[]; finishes: FinishRecord[]; handleSaveQuickProduct: () => Promise<void> }): React.ReactNode {
  return <Modal
    open={isQuickProductModalOpen}
    onOpenChange={(open) => {
      if (!open) {
        setIsQuickProductModalOpen(false)
        setQuickProductName("")
        setQuickProductDesc("")
        setQuickProductSelectedMats([])
        setQuickProductSelectedFins([])
        setQuickTargetService(null)
        setQuickProductError(null)
      }
    } }
  >
    <ModalContent size="md">
      <ModalHeader>
        <ModalIconBadge variant="brand" shape="square" className="mb-3">
          <Package className="h-5 w-5 stroke-[2.5]" />
        </ModalIconBadge>
        <ModalTitle>Add New Product</ModalTitle>
        <ModalDescription>
          Create a new signage product with tagged materials and finishes for your catalogue.
        </ModalDescription>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]" htmlFor="quick-prod-title">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quick-prod-title"
              placeholder="e.g. 3D Acrylic Lettering"
              className={`printpal-form-input ${quickProductError ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
              value={quickProductName}
              autoFocus
              onChange={(e) => {
                setQuickProductName(e.target.value)
                if (quickProductError) setQuickProductError(null)
              } } />
            {quickProductError && (
              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {quickProductError}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]" htmlFor="quick-prod-desc">
              Product Description
            </Label>
            <Textarea
              id="quick-prod-desc"
              placeholder="Brief description of the product specification..."
              value={quickProductDesc}
              onChange={(e) => setQuickProductDesc(e.target.value)}
              rows={2}
              className="resize-none" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]">
              Materials that can be used ({quickProductSelectedMats.length} selected)
            </Label>
            <div className="max-h-36 overflow-y-auto border border-[#DCE1E5] rounded-[6px] p-2 space-y-1">
              {materials.length === 0 ? (
                <p className="text-[12px]/4 text-[#737B84] py-1">No materials created yet.</p>
              ) : (
                materials.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F4F7FA] cursor-pointer text-[12px]/4 text-[#202428] transition-colors select-none"
                  >
                    <Checkbox
                      checked={quickProductSelectedMats.includes(m.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuickProductSelectedMats((prev) => [...prev, m.id])
                        } else {
                          setQuickProductSelectedMats((prev) => prev.filter((id) => id !== m.id))
                        }
                      } } />
                    <span>{m.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]">
              Finishes that can be done ({quickProductSelectedFins.length} selected)
            </Label>
            <div className="max-h-36 overflow-y-auto border border-[#DCE1E5] rounded-[6px] p-2 space-y-1">
              {finishes.length === 0 ? (
                <p className="text-[12px]/4 text-[#737B84] py-1">No finishes created yet.</p>
              ) : (
                finishes.map((f) => (
                  <label
                    key={f.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F4F7FA] cursor-pointer text-[12px]/4 text-[#202428] transition-colors select-none"
                  >
                    <Checkbox
                      checked={quickProductSelectedFins.includes(f.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setQuickProductSelectedFins((prev) => [...prev, f.id])
                        } else {
                          setQuickProductSelectedFins((prev) => prev.filter((id) => id !== f.id))
                        }
                      } } />
                    <span>{f.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter layout="horizontal">
        <ModalButton
          variant="secondary"
          type="button"
          onClick={() => {
            setIsQuickProductModalOpen(false)
            setQuickProductName("")
            setQuickProductDesc("")
            setQuickProductSelectedMats([])
            setQuickProductSelectedFins([])
            setQuickTargetService(null)
            setQuickProductError(null)
          } }
        >
          Cancel
        </ModalButton>
        <ModalButton
          variant="primary"
          type="button"
          onClick={handleSaveQuickProduct}
        >
          Save
        </ModalButton>
      </ModalFooter>
    </ModalContent>
  </Modal>
}
