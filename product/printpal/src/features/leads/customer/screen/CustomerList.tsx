import type { CustomerRecord } from "../../../../modules/leads/types"
import * as React from "react"
import { Edit3, Trash2 } from "lucide-react"

/* Minimal Icon-Style Vector Illustration: Commercial Client Elevation */
export function CustomerEmptyIllustration() {
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
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F1F5F9" opacity="0.7" />

      {/* Blueprint / Architectural Dossier Card */}
      <rect x="34" y="28" width="92" height="68" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />

      {/* Architectural Guidelines */}
      <line x1="46" y1="40" x2="74" y2="40" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="48" x2="68" y2="48" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />

      {/* Commercial Storefront / Facade Elevation */}
      <rect x="62" y="38" width="56" height="52" rx="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />

      {/* Signage Canopy / Fascia (PrintPal Signature Orange) */}
      <rect x="58" y="34" width="64" height="11" rx="3" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1.25" />
      <line x1="68" y1="39.5" x2="112" y2="39.5" stroke="#D7440E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />

      {/* Store Entrance / Glass Doors */}
      <rect x="82" y="62" width="16" height="28" rx="2" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.25" />
      <line x1="90" y1="62" x2="90" y2="90" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

      {/* Display Windows */}
      <rect x="67" y="54" width="10" height="16" rx="2" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1" />
      <rect x="103" y="54" width="10" height="16" rx="2" fill="#EFF6FF" stroke="#94A3B8" strokeWidth="1" />

      {/* Client Dossier Avatar Badge */}
      <g transform="translate(38, 54)">
        <rect x="0" y="0" width="24" height="24" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.25" />
        <circle cx="12" cy="9.5" r="3.5" fill="none" stroke="#2563EB" strokeWidth="1.25" />
        <path d="M6 19.5 C6 16 8.5 14.5 12 14.5 C15.5 14.5 18 16 18 19.5" fill="none" stroke="#2563EB" strokeWidth="1.25" strokeLinecap="round" />
      </g>

      {/* Engineering Precision Dimension Ticks */}
      <path d="M26 60 H30 M28 58 V62" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 32 H134 M132 30 V34" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="132" cy="84" r="2.5" fill="#D7440E" opacity="0.75" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ── APPLE/GOOGLE FLUID MEMOIZED TABLE ROWS (120 FPS Rendering) ──
   ═══════════════════════════════════════════════════════════════════ */

export interface CustomerRowProps {
  cust: CustomerRecord
  onEdit: (cust: CustomerRecord) => void
  onDelete: (id: string, name: string) => void
  onViewSites: (cust: CustomerRecord) => void
}

export const CustomerRow = React.memo(function CustomerRow({
  cust,
  onEdit,
  onDelete,
  onViewSites,
}: CustomerRowProps) {
  return (
    <div className="printpal-table-row">
      <div className="printpal-cell-name font-medium pr-3">{cust.name}</div>
      <div className="printpal-cell-number">{cust.phone}</div>
      <div className="printpal-cell-email">{cust.email || "—"}</div>
      <div className="printpal-cell-address">
        <span>{cust.address}</span>
        {cust.sites && cust.sites.length > 1 && (
          <div className="printpal-multi-sites-wrapper">
            <span>has </span>
            <a
              href="#"
              className="printpal-multi-sites-link"
              onClick={(e) => {
                e.preventDefault()
                onViewSites(cust)
              }}
            >
              Multiple Sites ({cust.sites.length})
            </a>
          </div>
        )}
      </div>
      <div className="printpal-cell-actions">
        <button
          type="button"
          className="printpal-btn-edit-icon"
          title="Edit Customer"
          onClick={() => onEdit(cust)}
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="printpal-btn-delete-icon"
          title="Delete Customer"
          onClick={() => onDelete(cust.id, cust.name)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

export function renderCustomerRows({ customers, handleEditCustomer, handleDeleteCustomer, handleViewSites }: { customers: CustomerRecord[]; handleEditCustomer: (cust: CustomerRecord) => void; handleDeleteCustomer: (id: string, name: string) => void; handleViewSites: (cust: CustomerRecord) => void }): React.ReactNode {
  return customers.length === 0 ? (
    /* Apple-Grade Empty State for Customers (Minimal Vector Illustration, No Button) */
    <div className="printpal-empty-state-canvas">
      <div className="printpal-empty-state-card">
        <div className="printpal-empty-illustration-wrap">
          <CustomerEmptyIllustration />
        </div>
        <h3 className="printpal-empty-title">No customers created yet</h3>
        <p className="printpal-empty-description">
          Register your first commercial client, link multiple fabrication & installation sites, and track dimensional signage specifications.
        </p>
      </div>
    </div>
  ) : (
    /* Desktop - 2: Populated Table Rows with 14px font size */
    customers.map((cust) => (
      <CustomerRow
        key={cust.id}
        cust={cust}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
        onViewSites={handleViewSites} />
    ))
  )
}
