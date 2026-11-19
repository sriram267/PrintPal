import type * as React from "react"
import type { TaxRecord } from "./taxes"
import { Button } from "@printpal/ui"
import { Edit3, Trash2 } from "lucide-react"

export function renderTaxPage({ applyTaxesToSaleableItems, handleOpenAddTaxModal, setApplyTaxesToSaleableItems, showToast, taxes, handleOpenEditTaxModal, handleDeleteTax }: { applyTaxesToSaleableItems: boolean; handleOpenAddTaxModal: () => void; setApplyTaxesToSaleableItems: React.Dispatch<React.SetStateAction<boolean>>; showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void; taxes: TaxRecord[]; handleOpenEditTaxModal: (tax: TaxRecord) => void; handleDeleteTax: (tax: TaxRecord) => void }): React.ReactNode {
  return <div className="w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden pb-4">
    {/* Header & Action Bar matching Reference Screen */}
    <section className="flex items-start justify-between mb-5 flex-shrink-0">
      <div className="printpal-leads-title-block">
        <h1 className="printpal-leads-title">Tax</h1>
        <div className="printpal-leads-subtitle">
          Configure GST and sales tax rates applicable to quotation line items and services
        </div>
      </div>

      <div className="printpal-leads-controls flex-shrink-0">
        <Button
          variant="orange"
          className="printpal-btn-primary font-medium w-[164px] min-w-[164px] disabled:opacity-50 disabled:cursor-not-allowed"
          id="btn-add-tax"
          disabled={!applyTaxesToSaleableItems}
          onClick={handleOpenAddTaxModal}
        >
          Add Tax
        </Button>
      </div>
    </section>

    {/* Card 1: Toggle Card Component */}
    <div className="w-full bg-white border border-[#DCE1E5] rounded-[12px] p-4 flex items-start gap-3 flex-shrink-0 mb-3 box-border shadow-none">
      <button
        type="button"
        role="switch"
        aria-checked={applyTaxesToSaleableItems}
        onClick={() => {
          const nextVal = !applyTaxesToSaleableItems
          setApplyTaxesToSaleableItems(nextVal)
          try {
            localStorage.setItem("printpal_apply_taxes", String(nextVal))
          } catch { }
          showToast(
            nextVal
              ? "Tax will now be added to items you sell"
              : "Tax will no longer be added to items you sell",
            "info"
          )
        } }
        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${applyTaxesToSaleableItems ? "bg-[#E05626]" : "bg-[#CBD5E1]"}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${applyTaxesToSaleableItems ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      <div className="flex flex-col">
        <span className="text-[14px] font-medium text-[#1E293B]">
          Apply taxes to saleable items
        </span>
        <span className="text-[12px] text-[#64748B] leading-relaxed mt-0.5 max-w-[560px]">
          Each item can have only one tax component. For multiple taxes, create a tax group and select the appropriate options.
        </span>
      </div>
    </div>

    {/* Card 2: Table Card Component (matches Materials & Finishes) */}
    <div
      className={`flex-1 w-full min-h-0 bg-white border border-[#DCE1E5] rounded-[12px] p-2 flex flex-col box-border shadow-none overflow-hidden max-h-[calc(100vh-270px)] transition-all duration-200 ${!applyTaxesToSaleableItems
        ? "opacity-40 pointer-events-none select-none bg-[#F8FAFC]"
        : ""}`}
    >
      <div className="grid grid-cols-12 items-center px-3 py-2 text-[12px] font-semibold text-[#737B84] bg-[#F8FAFC] rounded-[8px] flex-shrink-0 border-b border-[#E2E8F0]">
        <div className="col-span-6">Tax Name</div>
        <div className="col-span-4">Percentage</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll mt-1">
        {taxes.length === 0 ? (
          <div className="p-12 text-center text-[12px]/4 text-[#94A3B8]">
            No taxes configured yet. Click "Add Tax" to add one.
          </div>
        ) : (
          taxes.map((tax) => (
            <div
              key={tax.id}
              className="grid grid-cols-12 items-center px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0"
            >
              <div className="col-span-6 text-[14px] font-medium text-[#202428]">
                {tax.name}
              </div>
              <div className="col-span-4 text-[14px] text-[#475569]">
                {tax.percentage}%
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditTaxModal(tax)}
                  className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                  title="Edit Tax"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTax(tax)}
                  className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                  title="Delete Tax"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
}
