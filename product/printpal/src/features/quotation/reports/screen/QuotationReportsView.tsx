/**
 * QuotationReportsView — Quotation Reports module
 *
 * Displays all created quotations with PDF preview, renegotiation, and delete actions.
 */

import React from 'react';
import { Trash2, FileText, Pencil, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { palNotch } from '@ui/pal-notch';
import { QuotePDFPreview } from '../../pdf/screen/QuotePDFPreview';
import { computeQuoteTotals, formatQuoteDate } from '../../shared/quoteTotals';
import type { CustomerRecord } from '../../../leads/shared/types'
import type { BusinessDetailsRecord } from '../../../settings/business-details/screen/businessDetails.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuotationListItem {
  id: string;
  quoteNumber: string;
  quoteDate: string;
  /** 'Invoice' = finalized. Renegotiated / Open are derived from version order, not stored. */
  quoteStatus: 'Draft' | 'Sent' | 'Invoice';
  createdAt?: string;
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

export interface QuotationReportsViewProps {
  customers: CustomerRecord[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  businessDetails?: BusinessDetailsRecord;
  onCreateQuotation?: () => void;
  onRenegotiateQuotation?: (quote: QuotationListItem) => void;
  /** Quotation just created: its customer group opens and the new line is highlighted. */
  highlightQuote?: { customerId: string; quoteNumber: string } | null;
}

// Backward-compatible alias

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function QuotationEmptyIllustration() {
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

// ── Grouping & derived status ─────────────────────────────────────────────────
//
// One customer = one accordion. Inside it, quotations are listed newest first.
// Status is never picked by hand:
//   • every quotation below the top one  → "Renegotiated"  (a newer version exists)
//   • the top one                        → "Open"
//   • the top one, once finalized        → "Invoice"       (quoteStatus === 'Invoice')

export type QuotationDisplayStatus = 'Renegotiated' | 'Open' | 'Invoice';

export interface QuotationGroup {
  key: string;
  customerName: string;
  /** Newest first — index 0 is the live / final one. */
  quotes: QuotationListItem[];
}

function groupKeyOf(q: QuotationListItem): string {
  return q.customerId ? `id:${q.customerId}` : `name:${(q.customerName || '').trim().toLowerCase()}`;
}

export function groupQuotationsByCustomer(items: QuotationListItem[]): QuotationGroup[] {
  const map = new Map<string, QuotationGroup>();
  items.forEach((q) => {
    const key = groupKeyOf(q);
    const g = map.get(key);
    if (g) g.quotes.push(q);
    else map.set(key, { key, customerName: q.customerName, quotes: [q] });
  });
  const groups = Array.from(map.values());
  groups.forEach((g) => {
    // Stable sort: newest first by createdAt when both have it, else keep incoming (newest-first) order.
    g.quotes = g.quotes
      .map((q, i) => ({ q, i }))
      .sort((a, b) => {
        const ta = a.q.createdAt ? Date.parse(a.q.createdAt) : NaN;
        const tb = b.q.createdAt ? Date.parse(b.q.createdAt) : NaN;
        if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return tb - ta;
        return a.i - b.i;
      })
      .map((x) => x.q);
  });
  return groups;
}

export function displayStatusOf(group: QuotationGroup, index: number): QuotationDisplayStatus {
  if (index > 0) return 'Renegotiated';
  return group.quotes[0].quoteStatus === 'Invoice' ? 'Invoice' : 'Open';
}

function StatusChip({ status }: { status: QuotationDisplayStatus }) {
  const cls =
    status === 'Invoice'
      ? 'printpal-status-chip printpal-status-chip--invoice'
      : status === 'Open'
        ? 'printpal-status-chip printpal-status-chip--open'
        : 'printpal-status-chip printpal-status-chip--renegotiated';
  return <span className={cls}>{status}</span>;
}

// ── Accordion rows (Leads-matching .printpal-table-row & .printpal-cell-actions) ──

function QuotationGroups({
  groups,
  expanded,
  onToggle,
  onViewPDF,
  onDelete,
  onRenegotiate,
  onFinalizeChange,
  highlightedNumber,
}: {
  highlightedNumber?: string;
  groups: QuotationGroup[];
  expanded: Set<string>;
  onToggle: (key: string) => void;
  onViewPDF: (q: QuotationListItem) => void;
  onDelete: (q: QuotationListItem) => void;
  onRenegotiate?: (q: QuotationListItem) => void;
  onFinalizeChange: (q: QuotationListItem, finalized: boolean) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="printpal-empty-state-canvas">
        <div className="printpal-empty-state-card">
          <div className="printpal-empty-illustration-wrap">
            <QuotationEmptyIllustration />
          </div>
          <h3 className="printpal-empty-title">No quotations created yet</h3>
          <p className="printpal-empty-description">
            Quotations generated in the Quotation module will appear here for quick PDF preview, tracking, and follow-up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {groups.map((g) => {
        const top = g.quotes[0];
        const isOpen = expanded.has(g.key);
        const topStatus = displayStatusOf(g, 0);
        return (
          <React.Fragment key={g.key}>
            {/* ── Customer accordion row ── */}
            <div
              className="printpal-table-row printpal-quotation-reports-grid printpal-billing-reports-grid printpal-quote-group-row cursor-pointer"
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => onToggle(g.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle(g.key);
                }
              }}
              title={isOpen ? 'Collapse quotations' : 'Expand quotations'}
            >
              <div className="flex items-center gap-2 pr-3 min-w-0">
                <ChevronRight
                  className={`h-4 w-4 flex-shrink-0 text-[#737B84] printpal-quote-chevron${isOpen ? ' is-open' : ''}`}
                />
                <span className="font-medium text-[#202428] truncate">{g.customerName}</span>
                <span className="text-[12px] text-[#737B84] flex-shrink-0">
                  {g.quotes.length} {g.quotes.length === 1 ? 'version' : 'versions'}
                </span>
              </div>
              <div>
                <StatusChip status={topStatus} />
              </div>
              <div className="flex flex-col justify-center pr-3 min-w-0">
                <span className="text-[14px] text-[#202428] truncate">{top.contactPerson || '—'}</span>
                {top.phone && (
                  <span className="text-[12px] text-[#737B84] tabular-nums truncate">{top.phone}</span>
                )}
              </div>
              <div className="text-center text-[#202428] tabular-nums">
                {top.sitesCount} {top.sitesCount === 1 ? 'site' : 'sites'}
              </div>
              <div className="text-right font-semibold text-[#202428] tabular-nums pr-2">
                {fmt(top.grandTotal)}
              </div>
              <div className="text-[13px] text-[#737B84] whitespace-nowrap">{formatQuoteDate(top.quoteDate)}</div>
              <div />
            </div>

            {/* ── Versions, newest first ── */}
            {isOpen &&
              g.quotes.map((q, idx) => {
                const status = displayStatusOf(g, idx);
                const isTop = idx === 0;
                const isFinal = status === 'Invoice';
                return (
                  <div
                    key={q.id}
                    ref={q.quoteNumber === highlightedNumber ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                    className={`printpal-table-row printpal-quotation-reports-grid printpal-billing-reports-grid printpal-quote-version-row cursor-pointer${q.quoteNumber === highlightedNumber ? ' printpal-quote-row-new' : ''}`}
                    onClick={() => onViewPDF(q)}
                    title={`Click to view ${isFinal ? 'Invoice' : 'Quotation'} PDF`}
                  >
                    {/* Finalize checkbox (top version only) + Quote Number */}
                    <div className="flex items-center gap-3 pr-3 min-w-0 pl-6">
                      {isTop ? (
                        <span
                          onClick={(e) => e.stopPropagation()}
                          title={isFinal ? 'Finalized as invoice — untick to reopen' : 'Tick to finalize as invoice'}
                          className="flex items-center"
                        >
                          <Checkbox
                            aria-label={`Finalize ${q.quoteNumber} as invoice`}
                            checked={isFinal}
                            onCheckedChange={(v) => onFinalizeChange(q, v === true)}
                          />
                        </span>
                      ) : (
                        <span className="inline-block w-[18px] flex-shrink-0" />
                      )}
                      <span className="font-mono font-semibold text-[#2878D0] truncate">{q.quoteNumber}</span>
                    </div>

                    <div>
                      <StatusChip status={status} />
                    </div>

                    <div className="flex flex-col justify-center pr-3 min-w-0">
                      <span className="text-[14px] text-[#202428] truncate">{q.contactPerson || '—'}</span>
                      {q.phone && (
                        <span className="text-[12px] text-[#737B84] tabular-nums truncate">{q.phone}</span>
                      )}
                    </div>

                    <div className="text-center text-[#202428] tabular-nums">
                      {q.sitesCount} {q.sitesCount === 1 ? 'site' : 'sites'}
                    </div>

                    <div className="text-right font-semibold text-[#202428] tabular-nums pr-2">
                      {fmt(q.grandTotal)}
                    </div>

                    <div className="text-[13px] text-[#737B84] whitespace-nowrap">{formatQuoteDate(q.quoteDate)}</div>

                    <div
                      className="printpal-cell-actions flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onRenegotiate && isTop && !isFinal && (
                        <button
                          type="button"
                          className="printpal-btn-edit-icon"
                          title="Renegotiate / Create next version"
                          onClick={() => onRenegotiate(q)}
                        >
                          <Pencil className="h-4 w-4 text-[#D7440E]" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="printpal-btn-edit-icon"
                        title={`Preview ${isFinal ? 'Invoice' : 'Quotation'} PDF`}
                        onClick={() => onViewPDF(q)}
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {!isFinal && (
                        <button
                          type="button"
                          className="printpal-btn-delete-icon"
                          title="Delete Quotation"
                          onClick={() => onDelete(q)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </React.Fragment>
        );
      })}
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

export function QuotationReportsView({
  customers = [],
  showToast,
  businessDetails,
  onCreateQuotation,
  onRenegotiateQuotation,
  highlightQuote,
}: QuotationReportsViewProps) {
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
            // Keep existing local storage quotations rather than wiping them
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
              quoteStatus: (q.quote_status || q.status || 'Sent') as 'Draft' | 'Sent' | 'Invoice',
              createdAt: q.created_at || q.createdAt,
              customerId,
              customerName,
              contactPerson,
              phone,
              sitesCount: sites.length || q.sitesCount || 1,
              discountPercent: Number(q.discount_percent || q.discountPercent || 0),
              gstRate: Number(q.gst_rate || q.gstRate || 18),
              sitesSubtotal: Number(q.subtotal || q.sitesSubtotal || 0),
              designCharges: Number(q.design_charges || q.designCharges || 0),
              installationCharges: Number(q.installation_charges || q.installationCharges || 0),
              transportCost: Number(q.transport_cost || q.transportCost || 0),
              ...computeQuoteTotals({
                sitesSubtotal: Number(q.subtotal || q.sitesSubtotal || 0),
                designCharges: Number(q.design_charges || q.designCharges || 0),
                installationCharges: Number(q.installation_charges || q.installationCharges || 0),
                transportCost: Number(q.transport_cost || q.transportCost || 0),
                discountPercent: Number(q.discount_percent || q.discountPercent || 0),
                gstRate: Number(q.gst_rate ?? q.gstRate ?? 18),
              }),
              fabNotes: notes.fabNotes || q.fabNotes || '',
              commercialTerms: notes.commercialTerms || q.commercialTerms || '',
              sitesJson: sites,
            };
          });
          setQuotations((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            const nums = new Set(mapped.map((m) => m.quoteNumber));
            // Drop local copies the server already knows about (by id or quote number)
            const remaining = prev.filter((p) => !ids.has(p.id) && !nums.has(p.quoteNumber));
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

  // Accordion state: collapsed by default; open customers are tracked by group key
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (!highlightQuote) return new Set();
    const hit = quotations.find((q) => q.quoteNumber === highlightQuote.quoteNumber);
    return new Set([hit ? groupKeyOf(hit) : `id:${highlightQuote.customerId}`]);
  });
  const highlightedNumber = highlightQuote?.quoteNumber;
  const groups = React.useMemo(() => groupQuotationsByCustomer(quotations), [quotations]);

  const handleToggleGroup = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const persistLocal = (list: QuotationListItem[]) => {
    try {
      localStorage.setItem('printpal_workshop_quotations', JSON.stringify(list));
    } catch {
      // storage unavailable — in-memory state still updated
    }
  };

  const applyFinalized = (q: QuotationListItem, finalized: boolean) => {
    setQuotations((prev) => {
      const next = prev.map((item) =>
        item.id === q.id ? { ...item, quoteStatus: (finalized ? 'Invoice' : 'Sent') as QuotationListItem['quoteStatus'] } : item
      );
      persistLocal(next);
      return next;
    });
  };

  const handleFinalizeChange = (q: QuotationListItem, finalized: boolean) => {
    palNotch.confirm({
      title: finalized ? `Make ${q.quoteNumber} the invoice?` : `Reopen ${q.quoteNumber}?`,
      description: finalized
        ? `Use this as the final quote for ${q.customerName}. It becomes the invoice, and can't be edited or deleted.`
        : `${q.quoteNumber} goes back to Open, so you can change it again.`,
      confirmText: finalized ? 'Make invoice' : 'Reopen',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/quotations/${q.id}/finalize`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ finalized }),
          });
          if (res.status === 409) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || 'Only the latest quote can be made the invoice', 'error');
            return;
          }
        } catch {
          // offline — still applied locally
        }
        applyFinalized(q, finalized);
        showToast(
          finalized ? `${q.quoteNumber} is now the invoice` : `${q.quoteNumber} reopened`,
          'success'
        );
      },
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewPDF = (q: QuotationListItem) => {
    setPreviewQuote(q);
  };

  const handleDeleteRequest = (q: QuotationListItem) => {
    palNotch.confirm({
      title: `Delete ${q.quoteNumber}?`,
      description: `The quote for ${q.customerName} will be removed. This can't be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/quotations/${q.id}`, { method: 'DELETE' });
          if (res.status === 409) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || "An invoice can't be deleted. Reopen it first.", 'error');
            return;
          }
        } catch {
          // offline — still remove from local list
        }
        setQuotations((prev) => {
          const next = prev.filter((item) => item.id !== q.id);
          persistLocal(next);
          return next;
        });
        showToast(`${q.quoteNumber} deleted`, 'success');
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
          <h1 className="printpal-leads-title">Quotation Reports</h1>
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
        <div className="printpal-table-header printpal-quotation-reports-grid printpal-billing-reports-grid flex-shrink-0">
          <div>Customer / Quote</div>
          <div>Status</div>
          <div>Contact</div>
          <div className="text-center">Sites</div>
          <div className="text-right pr-2">Grand Total</div>
          <div>Date</div>
          <div className="text-right pr-3">Actions</div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto printpal-compact-scroll">
          <QuotationGroups
            groups={groups}
            expanded={expanded}
            onToggle={handleToggleGroup}
            onViewPDF={handleViewPDF}
            onDelete={handleDeleteRequest}
            onRenegotiate={onRenegotiateQuotation}
            onFinalizeChange={handleFinalizeChange}
            highlightedNumber={highlightedNumber}
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
          documentType={previewQuote.quoteStatus === 'Invoice' ? 'Invoice' : 'Quotation'}
        />
      )}
    </main>
  );
}

// Backward-compatibility export alias
