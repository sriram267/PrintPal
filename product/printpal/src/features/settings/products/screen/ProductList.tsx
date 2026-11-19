import type { ProductRecord, MaterialRecord, FinishRecord } from "../../../../modules/leads/types"
import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"

/* Minimal Icon-Style Vector Illustration: Fabricated Signage Assembly & CAD Elevation */
export function ProductEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      {/* Background Soft Aura & CAD Drafting Grid */}
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FFF7ED" opacity="0.6" />

      {/* 3D Dimensional Lightbox Base Profile */}
      <rect x="36" y="32" width="88" height="58" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Front Cast Acrylic Face with Illumination Chamfer */}
      <path
        d="M44 40 H116 V78 H44 Z"
        fill="#FAFAFA"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 3D Depth Return Profile */}
      <path d="M44 78 L48 84 H120 V46 L116 40" stroke="#CBD5E1" strokeWidth="1.25" />
      <line x1="120" y1="84" x2="116" y2="78" stroke="#94A3B8" strokeWidth="1.25" />

      {/* Channel Letter "P" Profile with PrintPal Orange Accent */}
      <path
        d="M58 48 V70 M58 48 H72 C76 48 78 51 78 55 C78 59 76 62 72 62 H58"
        stroke="#D7440E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Internal LED Module Array */}
      <circle cx="64" cy="54" r="2" fill="#D7440E" />
      <circle cx="70" cy="55" r="2" fill="#D7440E" />
      <circle cx="64" cy="65" r="2" fill="#D7440E" />

      {/* CAD Dimension Markers (W x H) */}
      <line x1="44" y1="36" x2="116" y2="36" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M44 34 V38 M116 34 V38" stroke="#3B82F6" strokeWidth="1" />
      <rect x="74" y="32" width="14" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="0.75" />
      <text x="81" y="38" textAnchor="middle" fontSize="6" fill="#1D4ED8" fontFamily="sans-serif" fontWeight="bold">W</text>

      {/* Workshop Seal Badge */}
      <g transform="translate(94, 58)">
        <rect x="0" y="0" width="22" height="22" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
        <path d="M6 11 L10 15 L16 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export interface ProductRowProps {
  prod: ProductRecord
  materials?: MaterialRecord[]
  finishes?: FinishRecord[]
  onEdit: (prod: ProductRecord) => void
  onDelete: (id: string, name: string) => void
}

export const ProductRow = React.memo(function ProductRow({
  prod,
  materials,
  finishes,
  onEdit,
  onDelete,
}: ProductRowProps) {
  const matCount = prod.materialIds?.length || 0
  const finCount = prod.finishIds?.length || 0

  const allMatNames = React.useMemo(() => {
    if (!materials || !prod.materialIds) return ""
    return prod.materialIds
      .map((id) => materials.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }, [prod.materialIds, materials])

  const allFinNames = React.useMemo(() => {
    if (!finishes || !prod.finishIds) return ""
    return prod.finishIds
      .map((id) => finishes.find((f) => f.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }, [prod.finishIds, finishes])

  return (
    <div className="printpal-table-row printpal-product-grid printpal-product-row">
      {/* 1. Product Name */}
      <div className="font-medium text-[#202428] pr-3 truncate text-[14px]" title={prod.title}>
        {prod.title}
      </div>

      {/* 2. Description */}
      <div className="text-[13px] text-[#737B84] line-clamp-2 pr-3 leading-snug" title={prod.description || ""}>
        {prod.description || "—"}
      </div>

      {/* 3. Materials Tagged (Pure plain text numerical value) */}
      <div
        className="font-medium text-[14px] text-[#202428] text-center cursor-default"
        title={allMatNames ? `Materials (${matCount}):\n${allMatNames}` : undefined}
      >
        {matCount}
      </div>

      {/* 4. Finishes Tagged (Pure plain text numerical value) */}
      <div
        className="font-medium text-[14px] text-[#202428] text-center cursor-default"
        title={allFinNames ? `Finishes (${finCount}):\n${allFinNames}` : undefined}
      >
        {finCount}
      </div>

      {/* 5. Actions (Bare icons without container box) */}
      <div className="flex items-center gap-1.5 justify-end">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Product"
          onClick={() => onEdit(prod)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Product"
          onClick={() => onDelete(prod.id, prod.title)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
