import { Building, ShieldCheck } from "lucide-react";

export interface SupplierToggleCardProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SupplierToggleCard({ isEnabled, onToggle }: SupplierToggleCardProps) {
  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-[#DCE1E5]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="h-11 w-11 rounded-lg bg-[#FFF4ED] text-[#D7440E] flex items-center justify-center shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-[#202428] leading-tight">
                Supplier & Vendor Management
              </h2>
              {isEnabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EBF5EE] text-[#1E7E34]">
                  <ShieldCheck className="h-3 w-3" /> Enabled
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#737B84] mt-1 max-w-xl leading-relaxed">
              When enabled, the Supplier tab is exposed across the Leads module and Product module.
              Disabling hides the supplier tab across the workspace for simplified workflows.
            </p>
          </div>
        </div>

        {/* Custom Toggle Switch (Orange when enabled, Grey when disabled) */}
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={() => onToggle(!isEnabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2878D0] ${
            isEnabled ? "bg-[#D7440E]" : "bg-[#DCE1E5]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out mt-1 ${
              isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
