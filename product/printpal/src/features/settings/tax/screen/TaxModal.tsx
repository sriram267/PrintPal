import type * as React from "react"
import type { TaxRecord } from "./taxes"
import { Modal, ModalContent, ModalHeader, ModalIconBadge, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalButton } from "@ui/modal-system"
import { Edit3, Plus, AlertCircle } from "lucide-react"
import { Label, Input } from "@printpal/ui"
export function renderTaxModal({ isTaxModalOpen, setEditingTax, setTaxForm, setTaxErrors, setIsTaxModalOpen, editingTax, taxErrors, taxForm, handleSaveTax }: { isTaxModalOpen: boolean; setEditingTax: React.Dispatch<React.SetStateAction<TaxRecord | null>>; setTaxForm: React.Dispatch<React.SetStateAction<{ name: string; percentage: string} >>; setTaxErrors: React.Dispatch<React.SetStateAction<{ name?: string; percentage?: string} >>; setIsTaxModalOpen: React.Dispatch<React.SetStateAction<boolean>>; editingTax: TaxRecord | null; taxErrors: { name?: string; percentage?: string} ; taxForm: { name: string; percentage: string} ; handleSaveTax: () => void }): React.ReactNode {
  return <Modal
    open={isTaxModalOpen}
    onOpenChange={(open) => {
      if (!open) {
        setEditingTax(null)
        setTaxForm({ name: "", percentage: "" })
        setTaxErrors({})
        setIsTaxModalOpen(false)
      }
    } }
  >
    <ModalContent size="md">
      <ModalHeader>
        <ModalIconBadge variant="brand" shape="square" className="mb-3">
          {editingTax ? <Edit3 className="h-5 w-5 stroke-[2.5]" /> : <Plus className="h-5 w-5 stroke-[2.5]" />}
        </ModalIconBadge>
        <ModalTitle>{editingTax ? "Edit Tax" : "Add Tax"}</ModalTitle>
        <ModalDescription>
          {editingTax
            ? "Update the tax name and rate percentage."
            : "Enter the tax identification name and percentage rate."}
        </ModalDescription>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]" htmlFor="quick-tax-name">
              Tax Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quick-tax-name"
              placeholder="e.g. CGST, SGST, IGST"
              className={`printpal-form-input ${taxErrors.name ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
              value={taxForm.name}
              autoFocus
              onChange={(e) => {
                setTaxForm((prev) => ({ ...prev, name: e.target.value }))
                if (taxErrors.name) setTaxErrors((prev) => ({ ...prev, name: undefined }))
              } } />
            {taxErrors.name && (
              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {taxErrors.name}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]/4 font-medium text-[#344054]" htmlFor="quick-tax-percentage">
              Percentage (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quick-tax-percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g. 9 or 18"
              className={`printpal-form-input ${taxErrors.percentage ? "printpal-input-error border-red-500 focus-visible:ring-red-500" : ""}`}
              value={taxForm.percentage}
              onChange={(e) => {
                setTaxForm((prev) => ({ ...prev, percentage: e.target.value }))
                if (taxErrors.percentage) setTaxErrors((prev) => ({ ...prev, percentage: undefined }))
              } }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSaveTax()
                }
              } } />
            {taxErrors.percentage && (
              <span className="printpal-error-text flex items-center gap-1 text-[11px] text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {taxErrors.percentage}
              </span>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter layout="horizontal">
        <ModalButton
          variant="secondary"
          type="button"
          onClick={() => {
            setEditingTax(null)
            setTaxForm({ name: "", percentage: "" })
            setTaxErrors({})
            setIsTaxModalOpen(false)
          } }
        >
          Cancel
        </ModalButton>
        <ModalButton
          variant="primary"
          type="button"
          onClick={handleSaveTax}
        >
          {editingTax ? "Save Changes" : "Add Tax"}
        </ModalButton>
      </ModalFooter>
    </ModalContent>
  </Modal>
}
