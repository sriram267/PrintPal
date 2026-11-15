import { CHARGES, CUSTOMER, METHODS, SITES, areaOf, lineTotal, rupees, rupees2, summary } from "../../lib/sampleQuote";
import {
  IconChart,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconInfo,
  IconPhone,
  IconPlus,
  IconReceipt,
  IconSearch,
  IconSettings,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from "../Hero/icons";
import "./quoteScreen.css";

/**
 * The product's Quotation screen (product/printpal/src/modules/leads/QuotationView.tsx), rebuilt
 * for the website: same structure, labels, tokens and spacing, inside an app window frame.
 * Rows and cards carry data-anchor attributes so the hero can wire the machines to them.
 */
export function QuoteScreen() {
  const s = summary();
  return (
    <div className="qs-frame" aria-hidden="true">
      <div className="qs-titlebar">
        <span className="qs-dot" />
        <span className="qs-dot" />
        <span className="qs-dot" />
        <span className="qs-url">printpal-app.pages.dev</span>
      </div>

      <div className="qs-app">
        {/* App top nav */}
        <header className="qs-nav">
          <div className="qs-nav-left">
            <span className="qs-brand">PrintPal</span>
            <span className="qs-link">
              <IconUsers /> Leads
            </span>
            <span className="qs-link is-active">
              <IconReceipt /> Quotation
            </span>
            <span className="qs-link">
              <IconChart /> Quotation Reports
            </span>
          </div>
          <div className="qs-nav-right">
            <span className="qs-link">
              <IconSettings /> Settings
            </span>
            <span className="qs-user">
              <span className="qs-avatar">RS</span>
              Rahul S
              <IconChevronDown size={14} />
            </span>
          </div>
        </header>

        {/* Top bar: customer search + add customer */}
        <section className="qs-topbar">
          <span className="qs-topbar-label">Customer</span>
          <div className="qs-search">
            <IconSearch className="qs-search-icon" />
            <span>{CUSTOMER.name}</span>
            <IconX className="qs-search-x" />
          </div>
          <span className="qs-btn-outline">Add New Customer</span>
        </section>

        {/* Workspace */}
        <div className="qs-work">
          <div className="qs-left">
            {/* Customer details */}
            <div className="qs-card qs-customer">
              <div>
                <div className="qs-eyebrow">CUSTOMER DETAILS •</div>
                <h2 className="qs-cust-name">{CUSTOMER.name}</h2>
                <div className="qs-cust-meta">
                  <span>
                    <IconUser /> {CUSTOMER.contact}
                  </span>
                  <span>
                    <IconPhone /> {CUSTOMER.phone}
                  </span>
                </div>
              </div>
              <div className="qs-cust-right">
                <span className="qs-edit">
                  <IconEdit size={14} /> Edit
                </span>
                <div className="qs-quote-meta">
                  <div>
                    <span className="qs-meta-label">QUOTE NUMBER</span>
                    <span className="qs-meta-value mono">{CUSTOMER.quoteNumber}</span>
                  </div>
                  <span className="qs-meta-sep" />
                  <div>
                    <span className="qs-meta-label">QUOTE DATE</span>
                    <span className="qs-meta-value">{CUSTOMER.quoteDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sites */}
            {SITES.map((site, sIdx) => (
              <div className={`qs-card qs-site is-${site.origin}`} key={site.id} data-anchor={`site-${site.origin}`}>
                <div className="qs-site-head">
                  <div className="qs-site-title">
                    <span>{site.name}</span>
                    <span className="qs-badge">
                      Site {sIdx + 1}
                      <span className="qs-badge-count">{site.lines.length} services</span>
                    </span>
                  </div>
                  <div className="qs-site-actions">
                    <IconEdit className="is-blue" />
                    <IconTrash />
                    <IconChevronUp />
                  </div>
                </div>

                <div className="qs-grid qs-thead">
                  <div>Product</div>
                  <div>Method</div>
                  <div className="c">Size</div>
                  <div className="c">Qty</div>
                  <div className="c">Price</div>
                  <div className="c">Discount</div>
                  <div className="r">Total</div>
                  <div className="c">Action</div>
                </div>

                <div className="qs-rows">
                  {site.lines.map((l) => {
                    const m = METHODS[l.method];
                    return (
                      <div className="qs-grid qs-row" key={l.id} data-anchor={`row-${site.origin}`}>
                        <div className="qs-product">
                          <div className="qs-product-title">{l.product}</div>
                          <div className="qs-product-sub">{l.material}</div>
                          <div className="qs-product-sub">{l.finish}</div>
                        </div>
                        <div>
                          <div className="qs-input qs-select">
                            {m.name}
                            <IconChevronDown size={14} />
                          </div>
                          <div className="qs-under" />
                        </div>
                        <div>
                          {m.area && l.size ? (
                            <>
                              <div className="qs-input qs-size">
                                <b>{l.size[0]}</b>
                                <span className="x">×</span>
                                <b>{l.size[1]}</b>
                                <span className="u">ft</span>
                              </div>
                              <div className="qs-under mono">{areaOf(l)} sq ft</div>
                            </>
                          ) : (
                            <>
                              <div className="qs-dash">—</div>
                              <div className="qs-under" />
                            </>
                          )}
                        </div>
                        <div>
                          <div className="qs-input c b">{l.qty}</div>
                          <div className="qs-under" />
                        </div>
                        <div>
                          <div className="qs-input qs-price">
                            <span>₹</span>
                            <b>{l.rate}</b>
                          </div>
                          <div className="qs-under">{m.rateLabel}</div>
                        </div>
                        <div>
                          <div className="qs-input qs-disc">
                            <b>{l.discount}</b>
                            <span>%</span>
                          </div>
                          <div className="qs-under" />
                        </div>
                        <div>
                          <div className="qs-total mono">{rupees2(lineTotal(l))}</div>
                          <div className="qs-under" />
                        </div>
                        <div>
                          <div className="qs-row-actions">
                            <IconEdit className="is-blue" />
                            <IconTrash className="is-red" />
                          </div>
                          <div className="qs-under" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="qs-add">
                  <IconPlus strokeWidth={2.5} /> Add another service
                </div>
              </div>
            ))}
          </div>

          {/* Quote summary */}
          <aside className="qs-card qs-summary" data-anchor="summary">
            <h3>Quote Summary</h3>
            <div className="qs-sum">
              <div className="qs-sum-row">
                <span className="k">Subtotal ({SITES.length} Sites)</span>
                <span className="v b mono">{rupees2(s.sitesSubtotal)}</span>
              </div>
              <div className="qs-sum-row">
                <span className="k">
                  Installation Charges <IconInfo className="qs-info" />
                </span>
                <span className="v mono">{rupees(CHARGES.installation)}</span>
              </div>
              <div className="qs-sum-row">
                <span className="k">Transport &amp; Freight</span>
                <span className="v mono">{rupees(CHARGES.transport)}</span>
              </div>
              <div className="qs-sum-row is-green">
                <span className="k">
                  Discount <span className="qs-green-pill">-{CHARGES.discountPercent}%</span>
                </span>
                <span className="v b mono">- {rupees(s.discountAmount)}</span>
              </div>
              <div className="qs-gst">
                <div className="qs-sum-row">
                  <span className="k strong">
                    GST ({CHARGES.gstRate}%)
                    <span className="qs-gst-edit">
                      <IconEdit size={12} /> Edit
                    </span>
                  </span>
                  <span className="v b mono">{rupees(s.gstAmount)}</span>
                </div>
                <span className="qs-small">
                  CGST {(CHARGES.gstRate / 2).toFixed(1)}% + SGST {(CHARGES.gstRate / 2).toFixed(1)}%
                </span>
              </div>
              <div className="qs-rule" />
              <div className="qs-grand">
                <div className="qs-grand-row">
                  <span>GRAND TOTAL</span>
                  <span className="qs-grand-value">
                    {rupees2(s.grandTotal)} <small>INR</small>
                  </span>
                </div>
                <span className="qs-small">All taxes &amp; freight included</span>
              </div>
              <div className="qs-cta">Create Customer Quote</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
