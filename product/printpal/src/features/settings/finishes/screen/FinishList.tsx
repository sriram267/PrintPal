import type { FinishRecord } from "../../shared/types"
import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"

export function FinishEmptyIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="printpal-empty-vector">
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FAF5FF" opacity="0.6" />
      <rect x="40" y="32" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />
      <path d="M48 40 H112 V76 H48 Z" fill="#FAF5FF" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M52 74 L84 42 H96 L64 74 Z" fill="#9333EA" opacity="0.15" />
      <path d="M96 74 L108 62 V50 L84 74 Z" fill="#9333EA" opacity="0.15" />
      <g transform="translate(68, 52)">
        <rect x="0" y="0" width="24" height="14" rx="3" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1.25" />
        <text x="12" y="10" textAnchor="middle" fontSize="7" fill="#D7440E" fontWeight="bold" fontFamily="sans-serif">RAL</text>
      </g>
    </svg>
  );
}

export interface FinishRowProps {
  fin: FinishRecord
  onEdit: (fin: FinishRecord) => void
  onDelete: (id: string, name: string) => void
}

export const FinishRow = React.memo(function FinishRow({
  fin,
  onEdit,
  onDelete,
}: FinishRowProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 min-h-[48px] hover:bg-[#FBFCFD] transition-colors border-b border-[#DCE1E5] last:border-b-0 gap-2">
      <div className="text-[14px] font-medium text-[#202428] break-words leading-snug flex-1 pr-1" title={fin.name}>
        {fin.name}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          className="p-1 text-[#60A5FA] hover:text-[#2563EB] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Edit Finish"
          onClick={() => onEdit(fin)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 text-[#F87171] hover:text-[#DC2626] transition-colors cursor-pointer bg-transparent border-0 outline-none"
          title="Delete Finish"
          onClick={() => onDelete(fin.id, fin.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})
