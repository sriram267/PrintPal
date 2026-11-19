import { CHARGES, CUSTOMER, SITES, lineTotal, rupees, rupees2, summary, type SampleLine } from "../../lib/sampleQuote";
import "./phoneQuote.css";

/* The hero's Quotation screen, redrawn for phones. The full desktop screen is a 1270px canvas, which becomes
   unreadable when it is scaled to a 360px column, so on phones we show the same quote (same sample data and the
   same calculated totals) as one legible card. The blue / orange edge on each site matches its machine above. */

const detail = (l: SampleLine) =>
  l.size ? `${l.size[0]} × ${l.size[1]} ft · Qty ${l.qty}` : `${l.qty} pieces · ${rupees(l.rate)} each`;

export function PhoneQuote() {
  const s = summary();
  return (
    <div className="pq" role="img" aria-label={`Sample quote for ${CUSTOMER.name}, grand total ${rupees2(s.grandTotal)}`}>
      <div className="pq-head">
        <div>
          <small>Quote for</small>
          <b>{CUSTOMER.name}</b>
        </div>
        <span className="pq-no">{CUSTOMER.quoteNumber}</span>
      </div>

      {SITES.map((site) => (
        <div className={`pq-site is-${site.origin}`} key={site.id}>
          <div className="pq-site-head">
            <b>{site.name}</b>
            <span>{site.origin === "print" ? "Print" : "Fabrication"}</span>
          </div>
          {site.lines.map((l) => (
            <div className="pq-line" key={l.id}>
              <div>
                <b>{l.product}</b>
                <small>{detail(l)}</small>
              </div>
              <span>{rupees2(lineTotal(l))}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="pq-sum">
        <div>
          <span>Subtotal</span>
          <b>{rupees2(s.sitesSubtotal)}</b>
        </div>
        <div>
          <span>Installation + transport</span>
          <b>{rupees2(CHARGES.installation + CHARGES.transport)}</b>
        </div>
        <div>
          <span>Discount {CHARGES.discountPercent}%</span>
          <b>- {rupees2(s.discountAmount)}</b>
        </div>
        <div>
          <span>GST {CHARGES.gstRate}%</span>
          <b>{rupees2(s.gstAmount)}</b>
        </div>
      </div>
      <div className="pq-grand">
        <span>Grand total</span>
        <b>{rupees2(s.grandTotal)}</b>
      </div>
      <span className="pq-btn">Create Customer Quote</span>
    </div>
  );
}
