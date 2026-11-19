import type * as React from "react"
import type { CustomerRecord } from "../../shared/types"
import { X } from "lucide-react"

export function renderMultiSiteModal({ setSelectedCustomerForSites, selectedCustomerForSites }: { setSelectedCustomerForSites: React.Dispatch<React.SetStateAction<CustomerRecord | null>>; selectedCustomerForSites: CustomerRecord }): React.ReactNode {
  return <div
    className="printpal-modal-backdrop"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setSelectedCustomerForSites(null)
      }
    } }
  >
    <div className="printpal-modal-card" role="dialog" aria-modal="true">
      <div className="printpal-modal-head">
        <h3 className="printpal-modal-title">
          {selectedCustomerForSites.name} — All Installation Sites
        </h3>
        <button
          type="button"
          className="printpal-modal-close-btn"
          onClick={() => setSelectedCustomerForSites(null)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="printpal-modal-body">
        {selectedCustomerForSites.sites?.map((site, sIdx) => (
          <div key={site.id} className="printpal-site-list-item">
            <div className="printpal-site-list-item-title">
              {site.siteName || `Site ${sIdx + 1}`}
            </div>
            <div className="printpal-site-list-item-address">{site.address}</div>
            <div className="printpal-site-list-item-tags">
              {site.targetDeliveryDate && (
                <span className="printpal-tag">Delivery: {site.targetDeliveryDate}</span>
              )}
              {site.contactPerson && (
                <span className="printpal-tag">
                  Contact: {site.contactPerson} {site.contactPhone ? `(${site.contactPhone})` : ""}
                </span>
              )}
              <span className="printpal-tag">{site.wallSubstrate || "Concrete"}</span>
              {site.serviceDetails && site.serviceDetails.length > 0 ? (
                site.serviceDetails.map((srv, idx) => (
                  <span key={srv.id || idx} className="printpal-tag">
                    {srv.signStyle || `Service ${idx + 1}`}
                    {srv.width && srv.height ? ` (${srv.width}x${srv.height} ${srv.unit || "ft"})` : ""}
                    {srv.material ? ` · ${srv.material}` : ""}
                    {srv.finishing ? ` · ${srv.finishing}` : ""}
                    {srv.color ? ` · Colour: ${srv.color}` : ""}
                    {srv.artworkStatus === "VECTOR_READY" ? " · Vector Ready" : srv.artworkStatus === "NEEDS_DESIGN" ? " · Needs Artwork" : srv.artworkStatus === "NEEDS_VECTORIZATION" ? " · Needs Tracing" : ""}
                  </span>
                ))
              ) : (
                site.services?.map((srv) => (
                  <span key={srv} className="printpal-tag">
                    {srv}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
}
