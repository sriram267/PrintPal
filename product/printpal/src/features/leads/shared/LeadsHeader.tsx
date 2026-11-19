import type * as React from "react"
import type { CustomerRecord, CustomerDrawerAnchor, SupplierRecord } from "../../../modules/leads/types"
import { Button } from "@/components/ui/button"

export function renderLeadsHeader({ activeTab, closeNewCustomerModal, setActiveTab, isSupplierEnabled, openDrawer, openDrawerForSupplier }: { activeTab: string; closeNewCustomerModal: () => void; setActiveTab: React.Dispatch<React.SetStateAction<"customer" | "enquiry" | "supplier">>; isSupplierEnabled: boolean; openDrawer: (isEdit?: boolean, cust?: CustomerRecord, title?: string, anchor?: CustomerDrawerAnchor) => void; openDrawerForSupplier: (supplier?: SupplierRecord) => void }) {
  return <section className="printpal-leads-header">
    <div className="printpal-leads-title-block">
      <h1 className="printpal-leads-title">Leads</h1>
      <div className="printpal-leads-subtitle">
        Manage and track your enquiries, customers and their requirements
      </div>
    </div>

    <div className="printpal-leads-controls">
      {/* Segmented Control [ Customer | Enquiry | Supplier ] */}
      <div className="printpal-segmented-toggle" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "customer"}
          className={`printpal-segment-btn ${activeTab === "customer" ? "active" : ""}`}
          onClick={() => {
            closeNewCustomerModal()
            setActiveTab("customer")
          } }
        >
          Customer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "enquiry"}
          className={`printpal-segment-btn ${activeTab === "enquiry" ? "active" : ""}`}
          onClick={() => {
            closeNewCustomerModal()
            setActiveTab("enquiry")
          } }
        >
          Enquiry
        </button>
        {isSupplierEnabled && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "supplier"}
            className={`printpal-segment-btn ${activeTab === "supplier" ? "active" : ""}`}
            onClick={() => {
              closeNewCustomerModal()
              setActiveTab("supplier")
            } }
          >
            Supplier
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <Button
        variant="orange"
        className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
        id="btn-add-customer"
        onClick={() => {
          if (activeTab === "customer") {
            openDrawer(false, undefined, "New Customer")
          } else if (activeTab === "enquiry") {
            openDrawer(false, undefined, "New Enquiry")
          } else if (isSupplierEnabled) {
            openDrawerForSupplier()
          }
        } }
      >
        {activeTab === "customer"
          ? "Add new Customer"
          : activeTab === "enquiry"
            ? "Add new Enquiry"
            : isSupplierEnabled
              ? "Add new Supplier"
              : "Add new Customer"}
      </Button>
    </div>
  </section>
}
