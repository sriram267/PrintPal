import type * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
export interface SettingsMenuItem {
  id: string;
  label: string;
  iconName: string;
  group: 'business' | 'products' | 'quotation' | 'supplier' | 'general';
  description?: string;
}

export const SETTINGS_MENU_GROUPS = [
  { id: 'business', label: 'Business Setting' },
  { id: 'products', label: 'Products & Finishes' },
  { id: 'quotation', label: 'Quotation & Taxes' },
  { id: 'supplier', label: 'Supplier & Vendors' },
  { id: 'general', label: 'Workspace & Profile' },
] as const;

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    id: 'businessDetails',
    label: 'Business Details',
    iconName: 'Building2',
    group: 'business',
    description: 'Company logo, legal name, registered address, GSTIN/PAN, contact info, and signature',
  },
  {
    id: 'products',
    label: 'Products',
    iconName: 'Package',
    group: 'products',
    description: 'Signage catalog products, specifications, and media',
  },
  {
    id: 'materials',
    label: 'Materials',
    iconName: 'Layers',
    group: 'products',
    description: 'Sheet substrates, acrylics, and structural media',
  },
  {
    id: 'finishes',
    label: 'Finishes',
    iconName: 'Sparkles',
    group: 'products',
    description: 'Powder coating, anodizing, and vinyl treatments',
  },
  {
    id: 'tax',
    label: 'Tax Setting',
    iconName: 'Receipt',
    group: 'quotation',
    description: 'Customize statutory tax slabs (CGST, SGST, IGST) that align with business needs',
  },
  {
    id: 'supplier',
    label: 'Supplier',
    iconName: 'Building',
    group: 'supplier',
    description: 'Configure supplier vendor portal and procurement tabs',
  },
];

export function renderSettingsMenu({ toggleSettingsGroup, expandedSettingsGroups, setSettingsMenu, settingsMenu }: { toggleSettingsGroup: (group: "businessSetting" | "products" | "quotation" | "supplier") => void; expandedSettingsGroups: { businessSetting: boolean; products: boolean; quotation: boolean; supplier: boolean} ; setSettingsMenu: React.Dispatch<React.SetStateAction<"supplier" | "products" | "materials" | "finishes" | "businessDetails" | "tax">>; settingsMenu: string }) {
  return <aside className="w-60 flex-shrink-0 printpal-settings-sidebar bg-white border-r border-[#DCE1E5] py-4 px-4 flex flex-col gap-3 overflow-y-auto select-none">
    {/* Group 0: Business Setting */}
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => toggleSettingsGroup("businessSetting")}
        className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-[6px] transition-colors text-left cursor-pointer"
      >
        <span>Business Setting</span>
        {expandedSettingsGroups.businessSetting ? (
          <ChevronDown className="h-4 w-4 text-[#737B84]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#737B84]" />
        )}
      </button>
      {expandedSettingsGroups.businessSetting && (
        <div className="flex flex-col pl-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setSettingsMenu("businessDetails")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "businessDetails"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Business Details
          </button>
        </div>
      )}
    </div>

    {/* Group 1: Products */}
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => toggleSettingsGroup("products")}
        className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-[6px] transition-colors text-left cursor-pointer"
      >
        <span>Products</span>
        {expandedSettingsGroups.products ? (
          <ChevronDown className="h-4 w-4 text-[#737B84]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#737B84]" />
        )}
      </button>
      {expandedSettingsGroups.products && (
        <div className="flex flex-col pl-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setSettingsMenu("products")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "products"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setSettingsMenu("materials")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "materials"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Materials
          </button>
          <button
            type="button"
            onClick={() => setSettingsMenu("finishes")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "finishes"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Finishes
          </button>
        </div>
      )}
    </div>

    {/* Group 2: Quotation */}
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => toggleSettingsGroup("quotation")}
        className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-[6px] transition-colors text-left cursor-pointer"
      >
        <span>Quotation</span>
        {expandedSettingsGroups.quotation ? (
          <ChevronDown className="h-4 w-4 text-[#737B84]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#737B84]" />
        )}
      </button>
      {expandedSettingsGroups.quotation && (
        <div className="flex flex-col pl-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setSettingsMenu("tax")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "tax"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Tax
          </button>
        </div>
      )}
    </div>

    {/* Group 3: Supplier */}
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => toggleSettingsGroup("supplier")}
        className="w-full flex items-center justify-between py-2 px-2 text-[14px] font-semibold text-[#202428] hover:text-[#E05626] hover:bg-[#FFF5F2] rounded-[6px] transition-colors text-left cursor-pointer"
      >
        <span>Supplier</span>
        {expandedSettingsGroups.supplier ? (
          <ChevronDown className="h-4 w-4 text-[#737B84]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[#737B84]" />
        )}
      </button>
      {expandedSettingsGroups.supplier && (
        <div className="flex flex-col pl-3 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setSettingsMenu("supplier")}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors cursor-pointer ${settingsMenu === "supplier"
              ? "text-[#E05626] font-semibold bg-[#FFF5F2]"
              : "text-[#475569] hover:bg-[#FFF5F2] hover:text-[#E05626]"}`}
          >
            Supplier
          </button>
        </div>
      )}
    </div>
  </aside>
}
