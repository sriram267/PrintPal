import type { MaterialRecord } from "../../shared/types"
import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"

export function MaterialEmptyIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="printpal-empty-vector">
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F0FDF4" opacity="0.6" />
      <rect x="36" y="36" width="88" height="52" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />
      <path d="M42 44 H118 V76 H42 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="42" y1="54" x2="118" y2="54" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="42" y1="64" x2="118" y2="64" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <g transform="translate(50, 48)">
        <rect x="0" y="0" width="20" height="8" rx="2" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
        <line x1="4" y1="4" x2="16" y2="4" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />
      </g>
      <g transform="translate(76, 48)">
        <rect x="0" y="0" width="24" height="8" rx="2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
        <line x1="4" y1="4" x2="20" y2="4" stroke="#059669" strokeWidth="1.25" strokeLinecap="round" />
      </g>
      <g transform="translate(94, 66)">
        <circle cx="10" cy="10" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
        <path d="M6 10 L9 13 L14 7" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export interface MaterialRowProps {
  mat: MaterialRecord
  onEdit: (mat: MaterialRecord) => void
  onDelete: (id: string, name: string) => void
}

export const MaterialRow = React.memo(function MaterialRow({
  mat,
  onEdit,
  onDelete,
}: MaterialRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0 gap-2">
      <div className="text-[14px] font-medium text-[#202428] break-words leading-snug flex-1 pr-1" title={mat.name}>
        {mat.name}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Material"
          onClick={() => onEdit(mat)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Material"
          onClick={() => onDelete(mat.id, mat.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
