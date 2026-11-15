/**
 * QuotePDFPreview — Architectural Print & Signage Shop Quotation Document
 *
 * Designed as an authentic A4 printed document on warm cotton paper (#FAF8F4),
 * typeset with Newsreader (editorial display) and Inter (tabular grotesk).
 * Rendered via a body portal (#printpal-pdf-print-root) for clean multi-page A4 print fidelity.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';
import { palNotch } from '@ui/pal-notch';
import type { CustomerRecord } from './types';
import type { QuoteSite } from './QuotationView';
import type { BusinessDetailsRecord } from '../settings';
import { formatQuoteLineText } from '../quotation/quoteFormatters';

export interface QuotePDFPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord;
  sites: QuoteSite[];
  quoteNumber: string;
  quoteDate: string;
  sitesSubtotal: number;
  designCharges: number;
  installationCharges: number;
  transportCost: number;
  discountPercent: number;
  discountAmount: number;
  taxableTotal: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  fabNotes?: string;
  commercialTerms?: string;
  businessDetails?: BusinessDetailsRecord;
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const SERIF_FONT = "'Newsreader', Georgia, 'Times New Roman', serif";
const SANS_FONT = "'Inter', system-ui, -apple-system, sans-serif";

export function QuotePDFPreview({
  isOpen,
  onClose,
  customer,
  sites,
  quoteNumber,
  quoteDate,
  sitesSubtotal,
  designCharges,
  installationCharges,
  transportCost,
  discountPercent,
  discountAmount,
  taxableTotal,
  gstRate,
  gstAmount,
  grandTotal,
  fabNotes,
  commercialTerms,
  businessDetails,
}: QuotePDFPreviewProps) {
  // Dismiss cleanly on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const companyName = businessDetails?.legalName?.trim() || 'PrintPal';
  const addrLineA = [businessDetails?.addressLine1, businessDetails?.addressLine2]
    .filter(Boolean)
    .join(', ');
  const cityStatePin = [
    businessDetails?.city,
    businessDetails?.state,
    businessDetails?.pincode,
    businessDetails?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const statutoryLine = [
    businessDetails?.gstin ? `GSTIN ${businessDetails.gstin}` : '',
    businessDetails?.pan ? `PAN ${businessDetails.pan}` : '',
  ]
    .filter(Boolean)
    .join('  /  ');

  const companyContactLine = [
    businessDetails?.phone,
    businessDetails?.email,
    businessDetails?.website,
  ]
    .filter(Boolean)
    .join('  /  ');

  const customerContactLine = [customer.phone, customer.email]
    .filter(Boolean)
    .join('  /  ');

  const resolvedTerms = commercialTerms || businessDetails?.defaultTerms || '';

  const handleDownload = () => {
    palNotch.info(
      `Preparing A4 PDF for ${quoteNumber}`,
      `Save as PDF in the print dialog for ${customer.name}.`,
      undefined,
      'PDF'
    );
    window.print();
  };

  return createPortal(
    <>
      <div
        id="printpal-pdf-print-root"
        role="dialog"
        aria-modal="true"
        aria-label={`Quotation ${quoteNumber}`}
        className="pdf-preview-shell fixed inset-0 z-[200] flex flex-col bg-[#16181D]/80 backdrop-blur-md"
        style={{ fontFamily: SANS_FONT }}
      >
        {/* ── Translucent floating screen chrome (hidden when printing) ── */}
        <header className="pdf-preview-topbar flex-shrink-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#16181D]/75 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10">
          <div className="flex items-baseline gap-3">
            <span className="text-[13px] font-medium text-white">
              Quotation {quoteNumber}
            </span>
            <span className="hidden sm:inline text-[12px] text-white/50">
              A4 print preview for {customer.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quotation preview"
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/65 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* ── Scrollable paper presentation stage ── */}
        <div
          className="pdf-stage flex-1 min-h-0 overflow-y-auto py-6 sm:py-10 px-3 sm:px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="mx-auto w-full max-w-[794px] flex flex-col items-center gap-6">
          {/* ═══ WARM PAPER A4 DOCUMENT SHEET (Flat, Zero Shadows Inside, Zero Cards) ═══ */}
          <article
            id="printpal-pdf-document"
            className="pdf-sheet shrink-0 relative w-full bg-[#FAF8F4] text-[#151C24] px-6 py-8 sm:px-14 sm:py-14 flex flex-col justify-between"
            style={{
              minHeight: '1040px',
              fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            }}
          >

            <div>
              {/* ── 1. Document Masthead: Left Company Block / Right Document Meta ── */}
              <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#151C24]/25">
                {/* Left: Logo + Company Name + Address + Statutory & Contact */}
                <div className="max-w-[430px]">
                  <div className="flex items-center gap-3.5 mb-2.5">
                    {businessDetails?.logoUrl && (
                      <img
                        src={businessDetails.logoUrl}
                        alt={companyName}
                        className="h-10 max-w-[140px] object-contain"
                      />
                    )}
                    <h1
                      className="text-[26px] sm:text-[30px] font-medium text-[#151C24]"
                      style={{
                        fontFamily: SERIF_FONT,
                        letterSpacing: '-0.025em',
                        lineHeight: 1.08,
                      }}
                    >
                      {companyName}
                    </h1>
                  </div>

                  <div className="text-[12px] text-[#5C6570] leading-[1.55] space-y-0.5">
                    {addrLineA ? (
                      <p>
                        {addrLineA}
                        {cityStatePin ? `, ${cityStatePin}` : ''}
                      </p>
                    ) : (
                      <p>
                        Signage fabrication and installation
                        {cityStatePin ? `, ${cityStatePin}` : ', Chennai, Tamil Nadu, India'}
                      </p>
                    )}
                    {statutoryLine && (
                      <p className="text-[#151C24]/80 tabular-nums">{statutoryLine}</p>
                    )}
                    {companyContactLine && <p>{companyContactLine}</p>}
                  </div>
                </div>

                {/* Right: Document Title / Number (sole orange accent) / Date */}
                <div className="sm:text-right flex-shrink-0">
                  <p
                    className="text-[28px] sm:text-[32px] font-normal text-[#151C24]"
                    style={{
                      fontFamily: SERIF_FONT,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.0,
                    }}
                  >
                    Quotation
                  </p>
                  <p
                    className="text-[15px] font-semibold text-[#D7440E] mt-2"
                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em' }}
                  >
                    {quoteNumber}
                  </p>
                  <p
                    className="text-[12px] text-[#5C6570] mt-1"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    Issued {quoteDate}
                  </p>
                </div>
              </header>

              {/* ── 2. Recipient Block ("Quotation issued to") ── */}
              <section className="py-6 border-b border-[#DDD7CB]">
                <p className="text-[12px] font-medium text-[#5C6570] mb-1.5">
                  Quotation issued to
                </p>
                <h2
                  className="text-[17px] font-semibold text-[#151C24] tracking-[-0.01em]"
                  style={{ lineHeight: 1.3 }}
                >
                  {customer.name}
                </h2>
                <div className="mt-1 text-[12.5px] text-[#5C6570] leading-[1.55] space-y-0.5">
                  {customer.contactPerson &&
                    customer.contactPerson.trim() !== customer.name.trim() && (
                      <p>Attn: {customer.contactPerson}</p>
                    )}
                  {customerContactLine && (
                    <p style={{ fontVariantNumeric: 'tabular-nums' }}>{customerContactLine}</p>
                  )}
                  {(customer as { address?: string }).address && (
                    <p>{(customer as { address?: string }).address}</p>
                  )}
                </div>
              </section>

              {/* ── 3. Scope of Work Ledger Table ── */}
              <section className="pt-6 pb-4">
                <p className="text-[12px] font-medium text-[#5C6570] mb-3">
                  Scope of work
                </p>

                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F1EDE4] border-y border-[#151C24]/20">
                      <th className="py-2.5 pl-3 pr-4 text-[12px] font-medium text-[#151C24]">
                        Item and specification
                      </th>
                      <th className="py-2.5 px-3 text-[12px] font-medium text-[#151C24] text-right w-16">
                        Qty
                      </th>
                      <th className="py-2.5 pl-3 pr-3 text-[12px] font-medium text-[#151C24] text-right w-32 sm:w-36">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  {sites.length === 0 ? (
                    <tbody>
                      <tr className="border-b border-[#DDD7CB]">
                        <td
                          colSpan={3}
                          className="py-5 px-3 text-[12.5px] text-[#5C6570]"
                        >
                          Summary quotation prepared for {customer.name}.
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    sites.map((site, sIdx) => (
                      <tbody key={site.id}>
                        {/* Clean typographic site divider row (no boxes, no numbered badges) */}
                        <tr className="border-b border-[#DDD7CB]">
                          <td
                            colSpan={3}
                            className={`px-3 pb-2 ${sIdx === 0 ? 'pt-4' : 'pt-6'}`}
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                              <span className="text-[12.5px] font-semibold text-[#151C24]">
                                {site.siteName}
                              </span>
                              {site.address && (
                                <span className="text-[11.5px] text-[#5C6570]">
                                  {site.address}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Per-item specification rows with hairline rules */}
                        {site.items.map((line) => {
                          const materialFinish = [line.materialName, line.finishName]
                            .filter(Boolean)
                            .join(', ');
                          return (
                            <tr
                              key={line.id}
                              className="pdf-line-row border-b border-[#DDD7CB]"
                            >
                              <td className="py-3.5 pl-3 pr-4 align-top">
                                <p className="text-[13.5px] font-semibold text-[#151C24] leading-[1.35]">
                                  {line.productTitle}
                                </p>
                                <p
                                  className="text-[12px] text-[#5C6570] mt-1 leading-[1.45]"
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatQuoteLineText(line)}
                                </p>
                                {materialFinish && (
                                  <p className="text-[11.5px] text-[#5C6570] mt-0.5 leading-[1.4]">
                                    {materialFinish}
                                  </p>
                                )}
                                {line.discount > 0 && (
                                  <p className="text-[11.5px] font-medium text-[#1B6E3A] mt-0.5">
                                    Line discount {line.discount}% applied
                                  </p>
                                )}
                              </td>
                              <td
                                className="py-3.5 px-3 align-top text-right text-[13px] text-[#151C24]"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {line.qty ?? line.quantity ?? 1}
                              </td>
                              <td
                                className="py-3.5 pl-3 pr-3 align-top text-right text-[13.5px] font-medium text-[#151C24] whitespace-nowrap"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {line.total !== null && line.total !== undefined
                                  ? fmt(line.total)
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    ))
                  )}
                </table>
              </section>

              {/* ── 4. Totals Stacked Bottom-Right (Strong Grand Total Scale Contrast) ── */}
              <section className="pdf-totals-block pt-4 pb-8 flex justify-end">
                <div className="w-full sm:w-[340px]">
                  <dl className="space-y-2 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-[#5C6570]">
                        Subtotal ({sites.length} {sites.length === 1 ? 'site' : 'sites'})
                      </dt>
                      <dd
                        className="text-[#151C24] text-right font-medium"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {fmt(sitesSubtotal)}
                      </dd>
                    </div>

                    {designCharges > 0 && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-[#5C6570]">Design and 3D visualizer</dt>
                        <dd
                          className="text-[#151C24] text-right"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {fmt(designCharges)}
                        </dd>
                      </div>
                    )}

                    {installationCharges > 0 && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-[#5C6570]">Installation charges</dt>
                        <dd
                          className="text-[#151C24] text-right"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {fmt(installationCharges)}
                        </dd>
                      </div>
                    )}

                    {transportCost > 0 && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-[#5C6570]">Transport and freight</dt>
                        <dd
                          className="text-[#151C24] text-right"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {fmt(transportCost)}
                        </dd>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-[#1B6E3A] font-medium">
                          Discount ({discountPercent}%)
                        </dt>
                        <dd
                          className="text-[#1B6E3A] text-right font-medium"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          − {fmt(discountAmount)}
                        </dd>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#DDD7CB] flex items-baseline justify-between gap-4">
                      <dt className="text-[#5C6570]">Taxable amount</dt>
                      <dd
                        className="text-[#151C24] text-right"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {fmt(taxableTotal)}
                      </dd>
                    </div>

                    <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-[#151C24]">
                      <dt className="text-[#5C6570]">GST ({gstRate}%)</dt>
                      <dd
                        className="text-[#151C24] text-right"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {fmt(gstAmount)}
                      </dd>
                    </div>
                  </dl>

                  {/* Grand total — visually heavier and distinctly scaled */}
                  <div className="pt-3.5 flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#151C24]">
                        Grand total
                      </p>
                      <p className="text-[11px] text-[#5C6570] mt-0.5">
                        INR, all taxes inclusive
                      </p>
                    </div>
                    <p
                      className="text-[30px] sm:text-[34px] font-semibold text-[#151C24] text-right whitespace-nowrap"
                      style={{
                        fontFamily: SERIF_FONT,
                        fontVariantNumeric: 'lining-nums tabular-nums',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.05,
                      }}
                    >
                      {fmt(grandTotal)}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── 5. Bottom Editorial Region: Fabrication Notes, Commercial Terms, Signatory & Footer ── */}
            <div>
              {(fabNotes || resolvedTerms) && (
                <section className="pdf-notes-block pt-6 pb-8 border-t border-[#DDD7CB] grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                  {fabNotes && (
                    <div>
                      <h3 className="text-[12px] font-semibold text-[#151C24] mb-1.5">
                        Fabrication notes
                      </h3>
                      <p className="text-[11.5px] text-[#46505B] leading-[1.6]">
                        {fabNotes}
                      </p>
                    </div>
                  )}
                  {resolvedTerms && (
                    <div>
                      <h3 className="text-[12px] font-semibold text-[#151C24] mb-1.5">
                        Commercial terms
                      </h3>
                      <p className="text-[11.5px] text-[#46505B] leading-[1.6]">
                        {resolvedTerms}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {(businessDetails?.signatureUrl || businessDetails?.signatoryName) && (
                <section className="pdf-signature-block pt-4 flex justify-end">
                  <div className="flex flex-col items-end text-right">
                    {businessDetails?.signatureUrl && (
                      <img
                        src={businessDetails.signatureUrl}
                        alt="Authorized signature"
                        className="h-12 max-w-[160px] object-contain mb-2"
                      />
                    )}
                    <div className="w-48 border-t border-[#151C24]/30 pt-1.5">
                      {businessDetails?.signatoryName && (
                        <p className="text-[12px] font-semibold text-[#151C24]">
                          {businessDetails.signatoryName}
                        </p>
                      )}
                      <p className="text-[11px] text-[#5C6570]">
                        Authorized signatory, {companyName}
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </article>

          {/* ── Single Screen Action Below Paper (hidden on print) ── */}
          <div className="pdf-preview-actions shrink-0 flex flex-col items-center gap-2 pb-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#D7440E] hover:bg-[#c03d0c] active:scale-[0.97] text-white font-medium text-[14px] px-7 py-3 rounded-lg transition-all duration-100 shadow-lg shadow-black/25 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <p className="text-[11.5px] text-white/55">
              Choose Save as PDF in the print dialog
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* ── Print Fidelity + Accessibility Media Rules ── */}
      <style>{`
        @media (prefers-reduced-transparency: reduce) {
          .pdf-preview-shell {
            background: rgba(22, 24, 29, 0.96) !important;
            backdrop-filter: none !important;
          }
          .pdf-preview-topbar {
            background: #16181D !important;
            backdrop-filter: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pdf-preview-shell button {
            transition: none !important;
            transform: none !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            background: #FAF8F4 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          body > *:not(#printpal-pdf-print-root) {
            display: none !important;
          }

          #printpal-pdf-print-root {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            backdrop-filter: none !important;
            display: block !important;
            overflow: visible !important;
          }

          .pdf-preview-topbar,
          .pdf-preview-actions {
            display: none !important;
          }

          .pdf-stage {
            display: block !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          #printpal-pdf-document {
            max-width: 100% !important;
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            background: #FAF8F4 !important;
          }

          .pdf-line-row,
          .pdf-totals-block,
          .pdf-notes-block,
          .pdf-signature-block {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
