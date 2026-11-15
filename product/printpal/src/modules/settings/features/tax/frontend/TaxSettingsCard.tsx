import { Edit3, Check } from "lucide-react";
import { Button } from "@ui/button";

export interface TaxSettingsCardProps {
  onEditTax?: () => void;
  gstRate?: number;
}

export function TaxSettingsCard({ onEditTax, gstRate = 18 }: TaxSettingsCardProps) {
  const halfRate = (gstRate / 2).toFixed(1);

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-[#DCE1E5]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-5">
        <div>
          <h2 className="text-[17px] font-bold text-[#202428] leading-tight">
            GST & Statutory Tax Settings
          </h2>
          <p className="text-[13px] text-[#737B84] mt-1">
            Configure statutory tax slabs and inter-state tax profiles for sales & jobwork
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF5EE] text-[#1E7E34] border border-[#D1E7DD]">
            <Check className="h-3.5 w-3.5" />
            <span>GST Active ({gstRate}%)</span>
          </span>
          {onEditTax && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEditTax}
              className="h-8 px-3 text-xs font-semibold text-[#2878D0] border-[#DCE1E5] hover:bg-[#F3F5F7]"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Edit Slabs
            </Button>
          )}
        </div>
      </div>

      {/* Grid of Active Slabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Intra-State */}
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#737B84] uppercase tracking-wider block mb-1">
              INTRA-STATE GST (WITHIN STATE)
            </span>
            <div className="text-[16px] font-bold text-[#202428]">
              CGST {halfRate}% + SGST {halfRate}%
            </div>
            <p className="text-[12px] text-[#737B84] mt-1">
              Applies to local supply, in-state fabrication, and regional installation
            </p>
          </div>
        </div>

        {/* Inter-State */}
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#737B84] uppercase tracking-wider block mb-1">
              INTER-STATE GST (OUT OF STATE)
            </span>
            <div className="text-[16px] font-bold text-[#202428]">
              IGST {gstRate.toFixed(1)}%
            </div>
            <p className="text-[12px] text-[#737B84] mt-1">
              Integrated GST for out-of-state dispatches and turnkey transport
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
