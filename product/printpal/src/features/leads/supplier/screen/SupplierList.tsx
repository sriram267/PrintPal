import type { SupplierRecord } from "../../../../modules/leads/types"
import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"

/* Minimal Icon-Style Vector Illustration: Raw Substrates & Supplier Docket */
export function SupplierEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F0FDF4" opacity="0.6" />

      {/* Raw Substrate Palette / Flat Sheet Stack */}
      <rect x="36" y="32" width="88" height="64" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Top Acrylic/ACP Sheet Layer with Precision Chamfer */}
      <path
        d="M44 42 H116 V76 H44 Z"
        fill="#F8FAFC"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Sheet Returns / Substrate Thickness Layers */}
      <path d="M44 76 L48 80 H120 V46 L116 42" stroke="#CBD5E1" strokeWidth="1.25" />
      <line x1="120" y1="80" x2="116" y2="76" stroke="#94A3B8" strokeWidth="1.25" />

      {/* Material Category Spec Badges */}
      <rect x="52" y="48" width="28" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
      <line x1="56" y1="52" x2="74" y2="52" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />

      <rect x="84" y="48" width="24" height="8" rx="2" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1" />
      <line x1="88" y1="52" x2="102" y2="52" stroke="#D7440E" strokeWidth="1.25" strokeLinecap="round" />

      {/* LED Module / Power Supply Coil Indicator */}
      <g transform="translate(48, 62)">
        <circle cx="10" cy="8" r="6" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.25" />
        <circle cx="10" cy="8" r="2" fill="#10B981" />
        <path d="M16 8 H28" stroke="#10B981" strokeWidth="1.25" strokeDasharray="2 2" />
        <circle cx="32" cy="8" r="3" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
      </g>

      {/* Supplier Tag / Vendor Seal */}
      <g transform="translate(92, 60)">
        <rect x="0" y="0" width="24" height="24" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.25" />
        <path d="M8 12 L11 15 L16 9" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Precision Drafting Markers */}
      <path d="M28 50 H32 M30 48 V52" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <path d="M128 34 H132 M130 32 V36" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="126" cy="86" r="2.5" fill="#10B981" opacity="0.75" />
    </svg>
  );
}

export interface SupplierRowProps {
  supp: SupplierRecord
  onEdit: (supp: SupplierRecord) => void
  onDelete: (id: string, name: string) => void
}

export const SupplierRow = React.memo(function SupplierRow({
  supp,
  onEdit,
  onDelete,
}: SupplierRowProps) {
  return (
    <div className="printpal-table-row printpal-supplier-grid">
      <div className="printpal-cell-name font-medium pr-3">
        {supp.supplierName}
        {supp.gstin && (
          <div className="text-[11px] text-[#737B84] font-normal">GST: {supp.gstin}</div>
        )}
      </div>
      <div className="printpal-cell-name">{supp.contactPerson || "—"}</div>
      <div className="printpal-cell-number">
        {supp.phone}
        {supp.email && (
          <div className="text-[11px] text-[#737B84] font-normal">{supp.email}</div>
        )}
      </div>
      <div className="printpal-cell-address">
        <div>{supp.category}</div>
        {supp.city && <div className="text-[11px] text-[#737B84] font-normal">({supp.city})</div>}
      </div>
      <div className="printpal-cell-actions">
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="Edit Supplier"
          onClick={() => onEdit(supp)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Supplier"
          onClick={() => onDelete(supp.id, supp.supplierName)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
