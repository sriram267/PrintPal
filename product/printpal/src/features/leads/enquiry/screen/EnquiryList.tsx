import type { EnquiryRecord } from "../../shared/types"
import * as React from "react"
import { Calendar, Edit3, Trash2 } from "lucide-react"

/* Minimal Icon-Style Vector Illustration: Workshop Job Specification Docket */
export function EnquiryEmptyIllustration() {
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
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#FFF7ED" opacity="0.45" />

      {/* Specification Clipboard Docket */}
      <rect x="42" y="28" width="76" height="68" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Clipboard Clip */}
      <rect x="66" y="23" width="28" height="8" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.25" />
      <circle cx="80" cy="27" r="1.5" fill="#64748B" />

      {/* Technical Spec Lines */}
      <line x1="54" y1="44" x2="84" y2="44" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="52" x2="98" y2="52" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="54" y1="60" x2="76" y2="60" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />

      {/* Dynamic Enquiry Bubble (PrintPal Accent) */}
      <path
        d="M82 56 C82 48.5 89.5 43 99 43 C108.5 43 116 48.5 116 56 C116 60.5 113.5 64.5 109.5 66.5 L111 74 L103.5 69 C102 69.3 100.5 69.5 99 69.5 C89.5 69.5 82 64 82 56 Z"
        fill="#FFFFFF"
        stroke="#D7440E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 3 Message Wave Dots */}
      <circle cx="93" cy="56" r="1.5" fill="#D7440E" />
      <circle cx="99" cy="56" r="1.5" fill="#D7440E" />
      <circle cx="105" cy="56" r="1.5" fill="#D7440E" />

      {/* Minimal Architectural Ruler */}
      <g transform="translate(34, 68) rotate(-22)">
        <rect x="0" y="0" width="38" height="10" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
        <line x1="6" y1="0" x2="6" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="12" y1="0" x2="12" y2="3" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="18" y1="0" x2="18" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="24" y1="0" x2="24" y2="3" stroke="#94A3B8" strokeWidth="0.75" />
        <line x1="30" y1="0" x2="30" y2="4" stroke="#94A3B8" strokeWidth="0.75" />
      </g>

      {/* Precision Markers */}
      <path d="M30 38 H34 M32 36 V40" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="128" cy="34" r="2.5" fill="#2563EB" opacity="0.75" />
    </svg>
  );
}

export interface EnquiryRowProps {
  enq: EnquiryRecord
  onEdit: (enq: EnquiryRecord) => void
  onDelete: (id: string, name: string) => void
}

export const EnquiryRow = React.memo(function EnquiryRow({
  enq,
  onEdit,
  onDelete,
}: EnquiryRowProps) {
  const isFollowUp =
    enq.stage === "NEEDS_FOLLOW_UP" ||
    enq.stage === "QUALIFYING" ||
    Boolean(enq.followUpDate)

  const stageLabel = isFollowUp
    ? "Needs Follow Up"
    : enq.stage === "NEW"
      ? "New"
      : enq.stage

  return (
    <div className="printpal-table-row">
      <div className="printpal-cell-name font-medium pr-3">{enq.contactName}</div>
      <div className="printpal-cell-number">{enq.phone}</div>
      <div className="printpal-cell-email">{enq.email || "—"}</div>
      <div className="printpal-cell-address">
        <div>{enq.address || "—"}</div>
        {enq.followUpDate && (
          <div className="text-[11px] text-[#B45309] font-medium flex items-center gap-1 mt-0.5">
            <Calendar className="h-3 w-3 inline shrink-0" />
            <span>Follow-up: {enq.followUpDate}</span>
          </div>
        )}
      </div>
      <div className="printpal-cell-actions">
        <span
          className={`printpal-tag ${isFollowUp ? "printpal-tag-followup" : ""}`}
          style={{
            marginRight: "8px",
            ...(isFollowUp
              ? {
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                borderColor: "#FDE68A",
                fontWeight: 600,
              }
              : {}),
          }}
        >
          {stageLabel}
        </span>
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="View / Edit Enquiry"
          onClick={() => onEdit(enq)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Enquiry"
          onClick={() => onDelete(enq.id, enq.contactName)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

export function renderEnquiryRows({ enquiries, handleEditEnquiry, handleDeleteEnquiry }: { enquiries: EnquiryRecord[]; handleEditEnquiry: (enq: EnquiryRecord) => void; handleDeleteEnquiry: (id: string, name: string) => void }): React.ReactNode {
  return enquiries.length === 0 ? (
    /* Apple-Grade Empty State for Enquiries (Minimal Vector Illustration, No Button) */
    <div className="printpal-empty-state-canvas">
      <div className="printpal-empty-state-card">
        <div className="printpal-empty-illustration-wrap">
          <EnquiryEmptyIllustration />
        </div>
        <h3 className="printpal-empty-title">No enquiries created yet</h3>
        <p className="printpal-empty-description">
          Quick-capture incoming workshop leads from WhatsApp, phone inquiries, or walk-ins to qualify leads and estimate projects.
        </p>
      </div>
    </div>
  ) : (
    enquiries.map((enq) => (
      <EnquiryRow
        key={enq.id}
        enq={enq}
        onEdit={handleEditEnquiry}
        onDelete={handleDeleteEnquiry} />
    ))
  )
}
