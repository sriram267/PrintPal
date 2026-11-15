import { useEffect, useRef } from "react";
import { CHARGES, rupees, rupees2, summary } from "../../lib/sampleQuote";
import { IconPlus, IconSearch } from "../Hero/icons";
import { IconCheck, IconDownload, IconGlobe, IconPin } from "./moreIcons";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./howItWorks.css";

/* Every step below is something the product does today. Sample names and numbers are made up. */

function EnquiryVisual() {
  return (
    <div className="mini">
      <div className="mini-label">Enquiries</div>
      <div className="mini-row">
        <span className="mini-avatar">SK</span>
        <div>
          <b>Suresh Kumar</b>
          <small>Shop front board · walk-in</small>
        </div>
        <span className="pill pill-green">New</span>
      </div>
      <div className="mini-row">
        <span className="mini-avatar">AF</span>
        <div>
          <b>Anand Foods</b>
          <small>Pylon sign, 2 outlets · call</small>
        </div>
        <span className="pill pill-amber">Needs follow-up</span>
      </div>
      <div className="mini-row">
        <span className="mini-avatar">GR</span>
        <div>
          <b>Greenline Realty</b>
          <small>Hoarding, ring road</small>
        </div>
        <span className="pill pill-green">New</span>
      </div>
    </div>
  );
}

function SiteVisual() {
  return (
    <div className="mini">
      <div className="mini-label">Site 1 · Meridian Interiors</div>
      <div className="mini-field is-focus">
        <IconSearch size={13} />
        <span className="grow">Indiranagar, Bengal…</span>
      </div>
      <div className="hiw-suggest">
        <div>
          <IconPin size={12} />
          <span>
            <b>Indiranagar</b> Showroom, 100 Feet Rd
          </span>
        </div>
        <div>
          <IconPin size={12} />
          <span>Indiranagar Metro, Bengaluru</span>
        </div>
      </div>
      <div className="hiw-chips">
        <span className="chip chip-blue">
          <IconGlobe size={12} /> 360° view
        </span>
        <span className="chip">
          <IconPlus size={11} /> Add site
        </span>
      </div>
    </div>
  );
}

function ServiceVisual() {
  return (
    <div className="mini">
      <div className="mini-label">Service 1 · Site 1</div>
      <div className="mini-field">
        <span className="grow">Front-Lit Channel Letters</span>
      </div>
      <div className="mini-two">
        <div className="mini-field">
          <span className="grow">Acrylic 3 mm</span>
        </div>
        <div className="mini-field">
          <span className="grow">Vinyl Face</span>
        </div>
      </div>
      <div className="mini-two">
        <div className="mini-field">
          <b>12</b>
          <span style={{ color: "#737b84" }}>×</span>
          <b>4</b>
          <span style={{ color: "#737b84" }}>ft</span>
        </div>
        <div className="mini-field">
          <span style={{ color: "#737b84" }}>Qty</span>
          <b>14</b>
        </div>
      </div>
    </div>
  );
}

function QuoteVisual() {
  const s = summary();
  return (
    <div className="mini">
      <div className="hiw-sum">
        <span>Subtotal</span>
        <b>{rupees2(s.sitesSubtotal)}</b>
      </div>
      <div className="hiw-sum">
        <span>Installation + transport</span>
        <b>{rupees(CHARGES.installation + CHARGES.transport)}</b>
      </div>
      <div className="hiw-sum">
        <span>GST {CHARGES.gstRate}%</span>
        <b>{rupees(s.gstAmount)}</b>
      </div>
      <div className="hiw-grand">
        <span>Grand total</span>
        <b>{rupees2(s.grandTotal)}</b>
      </div>
      <div className="hiw-actions">
        <span className="mini-btn">
          <IconDownload size={13} /> Download PDF
        </span>
        <span className="hiw-done">
          <IconCheck size={13} /> Saved
        </span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Capture the enquiry",
    text: "Note down the call or walk-in in seconds: a name, a number and what they want. Add a follow-up date and it shows as Needs follow-up.",
    tags: ["Name + number is enough", "Follow-up dates"],
    visual: <EnquiryVisual />,
  },
  {
    title: "Add the customer and their sites",
    text: "Save GST and billing details once, then add every site. Search the address and check the building on 360° street view.",
    tags: ["GST + billing details", "Address search", "360° street view"],
    visual: <SiteVisual />,
  },
  {
    title: "List the services for each site",
    text: "Pick from your signage catalogue and set the size, material and finish. One customer can have many sites, each with many services.",
    tags: ["Signage catalogue", "Many sites", "Size, material, finish"],
    visual: <ServiceVisual />,
  },
  {
    title: "Price it and send the PDF",
    text: "Choose how each line is priced, add installation and transport, apply GST, and download a PDF with your logo and GSTIN.",
    tags: ["6 ways to price", "CGST + SGST", "PDF download"],
    visual: <QuoteVisual />,
  },
];

export function HowItWorks() {
  const ref = useReveal<HTMLElement>();
  const listRef = useRef<HTMLOListElement | null>(null);

  /* The centre line fills as you scroll past, and each step's dot turns dark when you reach it. */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const dots = [...list.querySelectorAll<HTMLElement>(".tl-step")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      list.style.setProperty("--p", Math.min(1, Math.max(0, (mid - r.top) / r.height)).toFixed(4));
      dots.forEach((el) => {
        const b = el.getBoundingClientRect();
        el.classList.toggle("is-on", b.top + b.height / 2 < mid);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="sx tl" id="how-it-works" ref={ref}>
      <div className="sx-inner">
        <span className="sx-chip reveal">How it works</span>
        <h2 className="sx-h2 reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
          One enquiry in, one quote out. <span>Everything you enter once carries into the next step.</span>
        </h2>

        <ol className="tl-list" ref={listRef}>
          <li className="tl-line" aria-hidden="true">
            <i />
          </li>
          {STEPS.map((s, i) => (
            <li className={`tl-step ${i % 2 ? "is-flip" : ""}`} key={s.title}>
              <div className="tl-text reveal">
                <h3>
                  <span>{i + 1}.</span> {s.title}
                </h3>
                <p>{s.text}</p>
                <div className="tl-tags">
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-card reveal" style={{ "--d": "100ms" } as React.CSSProperties}>
                {s.visual}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
