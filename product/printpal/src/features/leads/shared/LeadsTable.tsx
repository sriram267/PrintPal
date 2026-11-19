import type { CustomerRecord, EnquiryRecord, SupplierRecord } from "./types"
import { renderCustomerRows } from "../customer/screen/CustomerList"
import { renderEnquiryRows } from "../enquiry/screen/EnquiryList"
import { renderSupplierRows } from "../supplier/screen/SupplierList"

export function renderLeadsTable({ activeTab, customers, handleEditCustomer, handleDeleteCustomer, handleViewSites, enquiries, handleEditEnquiry, handleDeleteEnquiry, isSupplierEnabled, suppliers, handleEditSupplier, handleDeleteSupplier }: { activeTab: string; customers: CustomerRecord[]; handleEditCustomer: (cust: CustomerRecord) => void; handleDeleteCustomer: (id: string, name: string) => void; handleViewSites: (cust: CustomerRecord) => void; enquiries: EnquiryRecord[]; handleEditEnquiry: (enq: EnquiryRecord) => void; handleDeleteEnquiry: (id: string, name: string) => void; isSupplierEnabled: boolean; suppliers: SupplierRecord[]; handleEditSupplier: (supp: SupplierRecord) => void; handleDeleteSupplier: (id: string, name: string) => void }) {
  return <div className="printpal-table-card">
    {/* Table Header Row */}
    <div className={`printpal-table-header flex-shrink-0 ${activeTab === "supplier" ? "printpal-supplier-grid" : ""}`}>
      {activeTab === "supplier" ? (
        <>
          <div>Supplier / Company</div>
          <div>Contact Person</div>
          <div>Phone & Email</div>
          <div>What They Supply</div>
          <div>Actions</div>
        </>
      ) : (
        <>
          <div>Name</div>
          <div>Number</div>
          <div>Email</div>
          <div>Site Address</div>
          <div>Actions</div>
        </>
      )}
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll">
      {activeTab === "customer" ? (
        renderCustomerRows({ customers, handleEditCustomer, handleDeleteCustomer, handleViewSites })
      ) : activeTab === "enquiry" ? (
        renderEnquiryRows({ enquiries, handleEditEnquiry, handleDeleteEnquiry })
      ) : isSupplierEnabled ? (
        /* 3rd Tab: Supplier Table */
        renderSupplierRows({ suppliers, handleEditSupplier, handleDeleteSupplier })
      ) : null}
    </div>
  </div>
}
