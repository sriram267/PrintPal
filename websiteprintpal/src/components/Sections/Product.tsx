import { useRef, useState } from "react";
import { CHARGES, SITES, lineTotal, rupees, rupees2, summary } from "../../lib/sampleQuote";
import { IconPlus } from "../Hero/icons";
import { IconCalendar, IconCheck, IconGlobe, IconPin } from "./moreIcons";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./product.css";

/* Everything listed here exists in the product today. Names and numbers in the visuals are samples. */

type Tab = "leads" | "quotation";

const FEATURES: Record<Tab, { title: string; text: string }[]> = {
  leads: [
    {
      title: "Enquiry first, customer when it's real",
      text: "Save a quick enquiry with just a name and a number. When the job is on, add the full details and the site.",
    },
    {
      title: "Many sites, many services",
      text: "One customer can have any number of sites, each with its own services, sizes, materials and finishes.",
    },
    {
      title: "Find the address, see the street",
      text: "Search the address as you type, then open 360° street view to check the wall before you quote.",
    },
    {
      title: "Never lose a follow-up",
      text: "Set a follow-up date on an enquiry and it shows as Needs follow-up in your list.",
    },
    {
      title: "GST-ready customer details",
      text: "GSTIN, billing and shipping addresses and payment terms, saved once and reused on every quote.",
    },
  ],
  quotation: [
    {
      title: "Nothing typed twice",
      text: "Pick a customer and their sites and services appear, ready to price.",
    },
    {
      title: "Six ways to price",
      text: "Square feet, running feet, square metre, running metre, per piece or lump sum, with the maths done for you.",
    },
    {
      title: "Charges, discount and GST",
      text: "Add installation, transport and design charges, apply a discount, and see GST split into CGST and SGST.",
    },
    {
      title: "A PDF with your name on it",
      text: "Your logo, GSTIN and signature from Business Details, on a clean quotation you can download.",
    },
    {
      title: "Every quote saved, every revision tracked",
      text: "Find past quotes in Billing Reports, preview the PDF, and revise a quote into a new version.",
    },
  ],
};


const METHODS = [
  ["Square Feet", "per sq ft"],
  ["Running Feet", "per ft"],
  ["Square Metre", "per sq m"],
  ["Running Metre", "per m"],
  ["Per Piece", "per piece"],
  ["Lump Sum", "lump sum"],
] as const;

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="pv-flabel">{label}</div>
      <div className="mini-field">
        {icon}
        <span className="grow">{value}</span>
      </div>
    </div>
  );
}

function LeadsVisual() {
  return (
    <div className="pv pv-leads" aria-hidden="true">
      <div className="pv-win">
        <div className="pv-seg">
          <span className="is-on">Customer</span>
          <span>Enquiry</span>
        </div>
        <div className="pv-two">
          <div className="pv-panel">
            <div className="mini-label">Basic details</div>
            <div className="mini-stack">
              <Field label="Business name" value="Meridian Interiors" />
              <Field label="Contact person" value="Ravi Kumar" />
              <Field label="Phone" value="+91 98765 43210" />
              <Field label="GSTIN" value="29ABCDE1234F1Z5" />
              <Field label="Follow-up date" value="20 Nov, 2026" icon={<IconCalendar size={13} />} />
            </div>
          </div>
          <div className="pv-panel">
            <div className="mini-label">Site details</div>
            <div className="mini-stack">
              <div className="pv-site">
                <div className="pv-site-head">
                  <b>Indiranagar Showroom</b>
                  <span className="pill pill-green">2 services</span>
                </div>
                <div className="pv-addr">
                  <IconPin size={12} /> 100 Feet Rd, Indiranagar, Bengaluru
                </div>
                <div className="pv-svcs">
                  <span>Flex Banner</span>
                  <span>Window Graphic</span>
                </div>
                <span className="chip chip-blue">
                  <IconGlobe size={12} /> 360° view
                </span>
              </div>
              <div className="pv-site">
                <div className="pv-site-head">
                  <b>Koramangala Studio</b>
                  <span className="pill pill-green">2 services</span>
                </div>
                <div className="pv-addr">
                  <IconPin size={12} /> 80 Feet Rd, Koramangala, Bengaluru
                </div>
                <div className="pv-svcs">
                  <span>ACP Board</span>
                  <span>Front-Lit Channel Letters</span>
                </div>
              </div>
              <span className="pv-add">
                <IconPlus size={12} strokeWidth={2.4} /> Add another site
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotationVisual() {
  const s = summary();
  const lines = SITES.flatMap((site) => site.lines);
  const half = s.gstAmount / 2;
  return (
    <div className="pv pv-quote" aria-hidden="true">
      <div className="pv-paper">
        <div className="pv-paper-head">
          <span className="pv-logo">Your logo</span>
          <div>
            <b>Your Shop Name</b>
            <small>GSTIN 29ABCDE1234F1Z5 · Bengaluru</small>
          </div>
          <div className="pv-qno">
            <b>QUOTATION</b>
            <small>Q-001-V1 · 15 Nov, 2026</small>
          </div>
        </div>
        <div className="pv-to">
          <small>Quote for</small>
          <b>Meridian Interiors</b>
        </div>
        <table className="pv-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{l.product}</td>
                <td>{l.size ? `${l.size[0]} × ${l.size[1]} ft` : "—"}</td>
                <td>{l.qty}</td>
                <td>{rupees(l.rate)}</td>
                <td>{rupees2(lineTotal(l))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pv-totals">
          <div>
            <span>Subtotal</span>
            <b>{rupees2(s.sitesSubtotal)}</b>
          </div>
          <div>
            <span>Installation + transport</span>
            <b>{rupees(CHARGES.installation + CHARGES.transport)}</b>
          </div>
          <div>
            <span>Discount {CHARGES.discountPercent}%</span>
            <b>- {rupees(s.discountAmount)}</b>
          </div>
          <div>
            <span>CGST {CHARGES.gstRate / 2}%</span>
            <b>{rupees2(half)}</b>
          </div>
          <div>
            <span>SGST {CHARGES.gstRate / 2}%</span>
            <b>{rupees2(half)}</b>
          </div>
          <div className="is-grand">
            <span>Grand total</span>
            <b>{rupees2(s.grandTotal)}</b>
          </div>
        </div>
        <div className="pv-sign">
          <svg viewBox="0 0 120 30" aria-hidden="true">
            <path d="M4 22c8-16 13-17 11-5-1 7 4 8 10-1 5-8 8-9 7-1-1 6 3 7 8 1 4-5 7-6 9-1 2 4 7 2 12-4 5-6 10-4 14 0 3 3 8 3 12 1" />
          </svg>
          Authorised signatory
        </div>
      </div>

      <div className="pv-methods mini">
        <div className="mini-label">Method</div>
        {METHODS.map(([name, unit], i) => (
          <div className={`pv-method ${i === 0 ? "is-on" : ""}`} key={name}>
            <span>
              {i === 0 ? <IconCheck size={12} strokeWidth={2.4} /> : <i />}
              {name}
            </span>
            <small>{unit}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Product() {
  const ref = useReveal<HTMLElement>();
  const [tab, setTab] = useState<Tab>("leads");
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: Tab = tab === "leads" ? "quotation" : "leads";
    setTab(next);
    tabsRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
  };

  return (
    <section className="sx pr" id="product" ref={ref}>
      <div className="sx-inner">
        <span className="sx-chip reveal">Product</span>
        <h2 className="sx-h2 reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
          Everything a sign shop needs to quote, <span>in two places that talk to each other.</span>
        </h2>

        <div className="pr-tabs reveal" style={{ "--d": "140ms" } as React.CSSProperties} role="tablist" aria-label="Product areas" ref={tabsRef} onKeyDown={onKey}>
          {(["leads", "quotation"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              data-tab={t}
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              tabIndex={tab === t ? 0 : -1}
              className={tab === t ? "is-on" : ""}
              onClick={() => setTab(t)}
            >
              {t === "leads" ? "Leads" : "Quotation"}
            </button>
          ))}
        </div>

        <div className="pr-stage reveal" style={{ "--d": "220ms" } as React.CSSProperties}>
          {(["leads", "quotation"] as const).map((t) => (
            <div
              key={t}
              role="tabpanel"
              id={`panel-${t}`}
              aria-labelledby={`tab-${t}`}
              className={`pr-panel ${tab === t ? "is-on" : ""}`}
              hidden={false}
              aria-hidden={tab !== t}
            >
              <ul className="pr-list">
                {FEATURES[t].map((f) => (
                  <li key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </li>
                ))}
              </ul>
              <div className={`pr-visual is-${t}`}>{t === "leads" ? <LeadsVisual /> : <QuotationVisual />}</div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
