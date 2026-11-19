import { useCallback, useEffect, useRef, useState } from "react";
import { CHARGES, SITES, lineTotal, rupees, rupees2, summary } from "../../lib/sampleQuote";
import { IconPlus } from "../Hero/icons";
import { IconCalendar, IconCheck, IconGlobe, IconPin } from "./moreIcons";
import "./sections.css";
import "./product.css";

/* Everything listed here exists in the product today. Names and numbers in the visuals are samples. */

type StepId = "leads" | "quotation" | "invoicing";

interface Feature {
  title: string;
  text: string;
}

const FEATURES: Record<StepId, Feature[]> = {
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
      title: "All their sites, one quote",
      text: "Every site and service a customer asks for goes into a single quotation, with the total for the whole job.",
    },
  ],
  invoicing: [
    {
      title: "Revise without starting over",
      text: "When the customer negotiates, create the next version. It copies the last one, so only what changed needs editing.",
    },
    {
      title: "One customer, one place",
      text: "Every quote for a customer sits under their name, newest on top. Older versions are marked Renegotiated for you.",
    },
    {
      title: "One tick to invoice",
      text: "When the customer agrees, tick the latest version. It becomes the invoice, with the numbers they already approved.",
    },
    {
      title: "Locked once it's final",
      text: "A finalized invoice can't be edited or deleted by accident. Untick it if you need to reopen it.",
    },
    {
      title: "The PDF changes with it",
      text: "The same PDF now says Invoice, with your logo and GSTIN, ready to send again for payment.",
    },
  ],
};

const STEPS: { id: StepId; label: string; lead: string; rest: string }[] = [
  {
    id: "leads",
    label: "Leads",
    lead: "Capture every enquiry.",
    rest: " Turn the real ones into customers, with sites and GST details saved once.",
  },
  {
    id: "quotation",
    label: "Quotation",
    lead: "Price every site in one quote.",
    rest: " Add charges and GST, then download a PDF with your name on it.",
  },
  {
    id: "invoicing",
    label: "Invoicing",
    lead: "Revise until it's agreed.",
    rest: " Then one tick turns the final quotation into the invoice.",
  },
];

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

/* A redraw of the product's Quotation Reports page: customers as accordions, versions newest first,
   a derived status chip on each, and a checkbox on the latest one that finalizes it as the invoice. */
function InvoicingVisual() {
  const final = summary().grandTotal;
  const versions = [
    { no: "Q-001-V3", status: "Invoice", total: final, date: "15 Nov" },
    { no: "Q-001-V2", status: "Renegotiated", total: Math.round(final * 1.06), date: "14 Nov" },
    { no: "Q-001-V1", status: "Renegotiated", total: Math.round(final * 1.13), date: "12 Nov" },
  ];
  const chip = (s: string) => `pv-st pv-st-${s.toLowerCase()}`;
  const chevron = (open: boolean) => (
    <svg className={`pv-chev ${open ? "is-open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
  return (
    <div className="pv pv-reports" aria-hidden="true">
      <div className="pv-win pv-rep">
        <div className="pv-rep-top">
          <div>
            <b>Quotation Reports</b>
            <small>View and manage all your quotations in one place</small>
          </div>
          <span className="pv-rep-btn">Create Quotation</span>
        </div>

        <div className="pv-rep-card">
          <div className="pv-rep-row pv-rep-head">
            <span>Customer / Quote</span>
            <span>Status</span>
            <span className="r">Grand total</span>
            <span>Date</span>
          </div>

          <div className="pv-rep-row pv-rep-group">
            <span className="pv-rep-name">
              {chevron(true)}
              <b>Meridian Interiors</b>
              <em>3 versions</em>
            </span>
            <span><i className={chip("Invoice")}>Invoice</i></span>
            <span className="r">{rupees2(final)}</span>
            <span>15 Nov</span>
          </div>

          {versions.map((v, i) => (
            <div className={`pv-rep-row pv-rep-ver ${i === 0 ? "is-final" : ""}`} key={v.no}>
              <span className="pv-rep-name">
                {i === 0 ? (
                  <span className="pv-box is-on"><IconCheck size={11} strokeWidth={2.6} /></span>
                ) : (
                  <span className="pv-box-gap" />
                )}
                <code>{v.no}</code>
              </span>
              <span><i className={chip(v.status)}>{v.status}</i></span>
              <span className="r">{rupees2(v.total)}</span>
              <span>{v.date}</span>
            </div>
          ))}

          <div className="pv-rep-row pv-rep-group">
            <span className="pv-rep-name">
              {chevron(false)}
              <b>Kavya Retail</b>
              <em>2 versions</em>
            </span>
            <span><i className={chip("Open")}>Open</i></span>
            <span className="r">{rupees2(Math.round(final * 0.42))}</span>
            <span>14 Nov</span>
          </div>
          <div className="pv-rep-row pv-rep-group">
            <span className="pv-rep-name">
              {chevron(false)}
              <b>Lakshmi Textiles</b>
              <em>1 version</em>
            </span>
            <span><i className={chip("Open")}>Open</i></span>
            <span className="r">{rupees2(Math.round(final * 0.27))}</span>
            <span>13 Nov</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<StepId, () => JSX.Element> = {
  leads: LeadsVisual,
  quotation: QuotationVisual,
  invoicing: InvoicingVisual,
};

const DESKTOP = "(min-width: 1001px)";

export function Product() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  /* Scrolling drives the switch: the stage stays pinned while you scroll through the three steps. */
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const mq = window.matchMedia(DESKTOP);
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      const distance = track.offsetHeight - stage.offsetHeight;
      if (distance <= 0) return;
      const scrolled = top - track.getBoundingClientRect().top;
      const p = Math.min(0.9999, Math.max(0, scrolled / distance));
      setActive(Math.floor(p * STEPS.length));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Clicking a step scrolls to the middle of its stretch of the track.
     On tablets and phones there is no pinned stage: the steps are tabs, and a click just switches the tab. */
  const go = useCallback((i: number) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    if (!window.matchMedia(DESKTOP).matches) {
      setActive(i);
      return;
    }
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const distance = track.offsetHeight - stage.offsetHeight;
    const y = window.scrollY + track.getBoundingClientRect().top - top + ((i + 0.5) / STEPS.length) * distance;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: y, behavior: calm ? "auto" : "smooth" });
  }, []);

  /* Tabs on small screens: swipe sideways to move between the three areas. */
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || window.matchMedia(DESKTOP).matches) return;
    const dx = e.changedTouches[0].clientX - s.x;
    const dy = e.changedTouches[0].clientY - s.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    setActive((a) => Math.min(STEPS.length - 1, Math.max(0, a + (dx < 0 ? 1 : -1))));
  };

  return (
    <section className="sx pr" id="product">
      <div className="sx-inner">
        <span className="sx-chip">Product</span>
        <h2 className="sx-h2">
          Everything a sign shop needs to quote and bill, <span>in one place, from first enquiry to final invoice.</span>
        </h2>
      </div>

      <div className="pr-track sx-inner" ref={trackRef}>
        <div className="pr-stage" ref={stageRef}>
          <nav className="pr-rail" aria-label="Product areas">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`pr-rail-item ${active === i ? "is-on" : ""}`}
                aria-current={active === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="pr-content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {STEPS.map((s, i) => {
              const Visual = VISUALS[s.id];
              return (
                <div
                  key={s.id}
                  id={`step-${s.id}`}
                  className={`pr-panel ${active === i ? "is-on" : ""}`}
                >
                  <h3 className="pr-statement">
                    {s.lead}
                    <span>{s.rest}</span>
                  </h3>
                  <div className="pr-body">
                    <ul className="pr-list">
                      {FEATURES[s.id].map((f) => (
                        <li key={f.title}>
                          <h4>{f.title}</h4>
                          <p>{f.text}</p>
                        </li>
                      ))}
                    </ul>
                    <div className={`pr-visual is-${s.id}`}>
                      <Visual />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
