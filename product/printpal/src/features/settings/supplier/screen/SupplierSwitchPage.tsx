import type * as React from "react"

export function renderSupplierSwitchPage({ isSupplierEnabled, setIsSupplierEnabled, activeTab, setActiveTab, showToast }: { isSupplierEnabled: boolean; setIsSupplierEnabled: React.Dispatch<React.SetStateAction<boolean>>; activeTab: string; setActiveTab: React.Dispatch<React.SetStateAction<"customer" | "enquiry" | "supplier">>; showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void }): React.ReactNode {
  return <div className="w-full max-w-3xl mx-auto min-h-0 bg-white border border-[#DCE1E5] rounded-[14px] p-6 flex flex-col box-border shadow-none">
    {/* Heading & Subtitle */}
    <div className="mb-5">
      <h2 className="text-[18px] font-semibold text-[#1E293B]">Supplier Setting</h2>
      <p className="text-[13px] text-[#64748B] mt-1">
        Configure supplier directory visibility and trade vendor management
      </p>
    </div>

    {/* Toggle Card Section */}
    <div className="flex items-start justify-between p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
      <div className="flex flex-col pr-4">
        <span className="text-[14px] font-medium text-[#1E293B]">
          Enable Supplier Management
        </span>
        <span className="text-[12px] text-[#64748B] leading-relaxed mt-1">
          When enabled, the Supplier tab is accessible in the Leads module and preferred vendor fields are available in Products & Materials. When disabled, these options will be hidden across the workspace.
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isSupplierEnabled}
        onClick={() => {
          const nextVal = !isSupplierEnabled
          setIsSupplierEnabled(nextVal)
          localStorage.setItem("printpal_supplier_enabled", String(nextVal))
          if (!nextVal && activeTab === "supplier") {
            setActiveTab("customer")
          }
          showToast(
            nextVal
              ? "Suppliers turned on"
              : "Suppliers turned off",
            "info"
          )
        } }
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${isSupplierEnabled ? "bg-[#1D4ED8]" : "bg-[#CBD5E1]"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSupplierEnabled ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  </div>
}
