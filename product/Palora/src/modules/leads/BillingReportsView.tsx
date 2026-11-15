/**
 * BillingReportsView — Billing Reports module
 *
 * Displays all created quotations with PDF preview and delete actions.
 */

import React from 'react';
import { Trash2, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { palNotch } from '@ui/pal-notch';
import { QuotePDFPreview } from './QuotePDFPreview';
import type { CustomerRecord } from './types';
import type { BusinessDetailsRecord } from '../settings';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuotationListItem {
  id: string;
  quoteNumber: string;
  quoteDate: string;
  quoteStatus: 'Draft' | 'Sent';
  customerId?: string;
  customerName: string;
  contactPerson?: string;
  phone?: string;
  sitesCount: number;
  grandTotal: number;
  discountPercent: number;
  gstRate: number;
  sitesSubtotal: number;
  designCharges: number;
  installationCharges: number;
  transportCost: number;
  discountAmount: number;
  taxableTotal: number;
  gstAmount: number;
  fabNotes?: string;
  commercialTerms?: string;
  // For PDF preview — full site data restored from storage
  sitesJson?: any[];
}

export interface BillingReportsViewProps {
  customers: CustomerRecord[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  businessDetails?: BusinessDetailsRecord;
  onCreateQuotation?: () => void;
  onRenegotiateQuotation?: (quote: QuotationListItem) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function BillingEmptyIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="printpal-empty-vector"
    >
      <circle cx="80" cy="60" r="50" fill="#F8FAFC" stroke="#EEF2F6" strokeWidth="1" strokeDasharray="3 3" />
      <ellipse cx="80" cy="65" rx="36" ry="32" fill="#F1F5F9" opacity="0.7" />
      <rect x="44" y="24" width="72" height="76" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.25" />
      <rect x="54" y="34" width="52" height="10" rx="3" fill="#FFF7ED" stroke="#D7440E" strokeWidth="1.25" />
      <line x1="54" y1="54" x2="106" y2="54" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="64" x2="96" y2="64" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="54" y1="74" x2="88" y2="74" stroke="#E2E8F0" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="54" y1="86" x2="78" y2="86" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Quotations Rows (Leads-matching .printpal-table-row & .printpal-cell-actions) ──

function QuotationRows({
  quotations,
  onViewPDF,
  onDelete,
  onRenegotiate,
}: {
  quotations: QuotationListItem[];
  onViewPDF: (q: QuotationListItem) => void;
  onDelete: (q: QuotationListItem) => void;
  onRenegotiate?: (q: QuotationListItem) => void;
}) {
  if (quotations.length === 0) {
    return (
      <div className="printpal-empty-state-canvas">
        <div className="printpal-empty-state-card">
          <div className="printpal-empty-illustration-wrap">
            <BillingEmptyIllustration />
          </div>
          <h3 className="printpal-empty-title">No quotations created yet</h3>
          <p className="printpal-empty-description">
            Quotations generated in the Billing module will appear here for quick PDF preview, tracking, and follow-up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {quotations.map((q) => (
        <div
          key={q.id}
          className="printpal-table-row printpal-billing-reports-grid cursor-pointer"
          onClick={() => onViewPDF(q)}
          title="Click to view Quotation PDF"
        >
          {/* Quote Number */}
          <div className="font-medium pr-3 truncate">
            <span className="font-mono font-semibold text-[#2878D0]">{q.quoteNumber}</span>
          </div>

          {/* Customer */}
          <div className="font-medium pr-3 truncate text-[#202428]">
            {q.customerName}
          </div>

          {/* Contact */}
          <div className="flex flex-col justify-center pr-3 min-w-0">
            <span className="text-[14px] text-[#202428] truncate">
              {q.contactPerson || '—'}
            </span>
            {q.phone && (
              <span className="text-[12px] text-[#737B84] tabular-nums truncate">{q.phone}</span>
            )}
          </div>

          {/* Sites count */}
          <div className="text-center text-[#202428] tabular-nums">
            {q.sitesCount} {q.sitesCount === 1 ? 'site' : 'sites'}
          </div>

          {/* Grand Total */}
          <div className="text-right font-semibold text-[#202428] tabular-nums pr-2">
            {fmt(q.grandTotal)}
          </div>

          {/* Date */}
          <div className="text-[13px] text-[#737B84] truncate">
            {q.quoteDate}
          </div>

          {/* Actions matching Leads module */}
          <div
            className="printpal-cell-actions flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {onRenegotiate && (
              <button
                type="button"
                className="printpal-btn-edit-icon"
                title="Renegotiate / Create Version 2"
                onClick={() => onRenegotiate(q)}
              >
                <Pencil className="h-4 w-4 text-[#D7440E]" />
              </button>
            )}
            <button
              type="button"
              className="printpal-btn-edit-icon"
              title="Preview Quotation PDF"
              onClick={() => onViewPDF(q)}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="printpal-btn-delete-icon"
              title="Delete Quotation"
              onClick={() => onDelete(q)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}


// ── Seed quotations from localStorage (pilot: reads from printpal_workshop_quotations key) ──

function loadQuotationsFromStorage(): QuotationListItem[] {
  try {
    const raw = localStorage.getItem('printpal_workshop_quotations');
    if (!raw) return [];
    return JSON.parse(raw) as QuotationListItem[];
  } catch {
    return [];
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BillingReportsView({
  customers = [],
  showToast,
  businessDetails,
  onCreateQuotation,
  onRenegotiateQuotation,
}: BillingReportsViewProps) {
  const [quotations, setQuotations] = React.useState<QuotationListItem[]>(loadQuotationsFromStorage);

  // Sync with backend API if available
  React.useEffect(() => {
    fetch('/api/quotations')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((apiQuotes) => {
        if (Array.isArray(apiQuotes)) {
          if (apiQuotes.length === 0) {
            try {
              localStorage.setItem('printpal_workshop_quotations', JSON.stringify([]));
            } catch {}
            setQuotations([]);
            return;
          }
          const mapped: QuotationListItem[] = apiQuotes.map((q: any) => {
            const customerId = q.customer_id || q.customerId;
            const matchingCustomer = customers.find((c) => c.id === customerId);
            const customerName =
              q.customer_name ||
              q.customerName ||
              matchingCustomer?.businessName ||
              matchingCustomer?.name ||
              'Customer';
            const contactPerson =
              q.contact_person ||
              q.contactPerson ||
              matchingCustomer?.contactPerson ||
              matchingCustomer?.name ||
              '';
            const phone = q.phone || matchingCustomer?.phone || '';
            const sites = Array.isArray(q.sites) ? q.sites : [];
            const notes =
              typeof q.notes_json === 'string'
                ? JSON.parse(q.notes_json)
                : q.notes_json || {};

            return {
              id: q.id,
              quoteNumber: q.quote_number || q.quoteNumber,
              quoteDate: q.quote_date || q.quoteDate,
              quoteStatus: (q.quote_status || q.status || 'Sent') as 'Draft' | 'Sent',
              customerId,
              customerName,
              contactPerson,
              phone,
              sitesCount: sites.length || q.sitesCount || 1,
              grandTotal: Number(q.grand_total || q.grandTotal || 0),
              discountPercent: Number(q.discount_percent || q.discountPercent || 0),
              gstRate: Number(q.gst_rate || q.gstRate || 18),
              sitesSubtotal: Number(q.subtotal || q.sitesSubtotal || 0),
              designCharges: Number(q.design_charges || q.designCharges || 0),
              installationCharges: Number(q.installation_charges || q.installationCharges || 0),
              transportCost: Number(q.transport_cost || q.transportCost || 0),
              discountAmount: 0,
              taxableTotal: Number(q.grand_total || 0),
              gstAmount: 0,
              fabNotes: notes.fabNotes || q.fabNotes || '',
              commercialTerms: notes.commercialTerms || q.commercialTerms || '',
              sitesJson: sites,
            };
          });
          setQuotations((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            const remaining = prev.filter((p) => !ids.has(p.id));
            return [...mapped, ...remaining];
          });
        }
      })
      .catch(() => {
        // offline fallback remains intact
      });
  }, [customers]);

  // PDF preview state
  const [previewQuote, setPreviewQuote] = React.useState<QuotationListItem | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewPDF = (q: QuotationListItem) => {
    setPreviewQuote(q);
  };

  const handleDeleteRequest = (q: QuotationListItem) => {
    palNotch.confirm({
      badge: "DELETE QUOTATION",
      title: `Delete Quotation "${q.quoteNumber}"?`,
      description: `Permanently delete quotation for ${q.customerName}? This action cannot be undone.`,
      confirmText: "Delete Quotation",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await fetch(`/api/quotations/${q.id}`, { method: 'DELETE' });
        } catch {
          // offline — still remove from local list
        }
        setQuotations((prev) => prev.filter((item) => item.id !== q.id));
        showToast(`Quotation "${q.quoteNumber}" deleted successfully`, 'success');
      },
    });
  };

  // ── Build CustomerRecord for the PDF preview from matched customer in panel ──
  const matchedCust = previewQuote?.customerId
    ? customers.find((c) => c.id === previewQuote.customerId)
    : customers.find(
        (c) =>
          c.name.trim().toLowerCase() === previewQuote?.customerName?.trim().toLowerCase() ||
          (c.businessName && c.businessName.trim().toLowerCase() === previewQuote?.customerName?.trim().toLowerCase())
      );

  const previewCustomer: CustomerRecord | null = previewQuote
    ? matchedCust || ({
      id: previewQuote.customerId || 'preview',
      name: previewQuote.customerName,
      businessName: previewQuote.customerName,
      contactPerson: previewQuote.contactPerson ?? '',
      phone: previewQuote.phone ?? '',
      email: '',
      billingAddress: '',
      address: '',
      customerType: 'RETAIL_BRAND',
      sites: [],
    } as unknown as CustomerRecord)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="printpal-content-body">
      {/* ── Page Header & Action Bar (Exact Leads Layout) ── */}
      <section className="printpal-leads-header">
        <div className="printpal-leads-title-block">
          <h1 className="printpal-leads-title">Billing Reports</h1>
          <div className="printpal-leads-subtitle">
            View and manage all your quotations in one place
          </div>
        </div>

        <div className="printpal-leads-controls">
          {onCreateQuotation && (
            <Button
              variant="orange"
              className="printpal-btn-primary font-medium w-[164px] min-w-[164px]"
              onClick={onCreateQuotation}
            >
              Create Quotation
            </Button>
          )}
        </div>
      </section>

      {/* ── Table Card (Exact Leads 8px Padding & 36px Floating Header Bar) ── */}
      <div className="printpal-table-card">
        <div className="printpal-table-header printpal-billing-reports-grid flex-shrink-0">
          <div>Quote Number</div>
          <div>Customer</div>
          <div>Contact</div>
          <div className="text-center">Sites</div>
          <div className="text-right pr-2">Grand Total</div>
          <div>Date</div>
          <div className="text-right pr-3">Actions</div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll">
          <QuotationRows
            quotations={quotations}
            onViewPDF={handleViewPDF}
            onDelete={handleDeleteRequest}
            onRenegotiate={onRenegotiateQuotation}
          />
        </div>
      </div>

      {/* ── PDF Preview overlay ── */}
      {previewQuote && previewCustomer && (
        <QuotePDFPreview
          isOpen={!!previewQuote}
          onClose={() => setPreviewQuote(null)}
          customer={previewCustomer}
          sites={previewQuote.sitesJson || []}
          quoteNumber={previewQuote.quoteNumber}
          quoteDate={previewQuote.quoteDate}
          sitesSubtotal={previewQuote.sitesSubtotal}
          designCharges={previewQuote.designCharges}
          installationCharges={previewQuote.installationCharges}
          transportCost={previewQuote.transportCost}
          discountPercent={previewQuote.discountPercent}
          discountAmount={previewQuote.discountAmount}
          taxableTotal={previewQuote.taxableTotal}
          gstRate={previewQuote.gstRate}
          gstAmount={previewQuote.gstAmount}
          grandTotal={previewQuote.grandTotal}
          fabNotes={previewQuote.fabNotes}
          commercialTerms={previewQuote.commercialTerms}
          businessDetails={businessDetails}
        />
      )}
    </main>
  );
}