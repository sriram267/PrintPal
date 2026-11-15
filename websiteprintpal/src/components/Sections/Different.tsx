import { useReveal } from "./useReveal";
import "./sections.css";
import "./different.css";

/* Fair comparison: what each alternative is genuinely good at, and what PrintPal does today. No competitor is named. */
const ROWS = [
  {
    name: "WhatsApp and Excel",
    good: "Free, and everyone already uses them.",
    withIt: "Every enquiry, customer and quote in one place, so nothing hides in a chat.",
  },
  {
    name: "Word or Excel quote templates",
    good: "Familiar, and easy to edit.",
    withIt: "Totals, GST and the PDF are done for you from the rates you enter.",
  },
  {
    name: "Generic billing software",
    good: "Good for invoices and accounts.",
    withIt: "Built around sites, sizes, materials and finishes, not just line items.",
  },
  {
    name: "Big print management suites",
    good: "Broad, with many modules.",
    withIt: "Focused on enquiries and quotes, with a signage catalogue already loaded.",
  },
];

export function Different() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="sx df" id="different" ref={ref}>
      <div className="sx-inner">
        <span className="sx-chip reveal">Compared</span>
        <h2 className="sx-h2 reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
          How is PrintPal different?
        </h2>
        <p className="df-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
          Most tools handle one part of the job. PrintPal is built for one job: turning an enquiry into a clear, GST-ready quote for sign and print work.
        </p>

        <div className="df-table" role="table" aria-label="PrintPal compared with the tools shops use today">
          <div className="df-row df-head reveal" role="row" style={{ "--d": "180ms" } as React.CSSProperties}>
            <span role="columnheader">Instead of</span>
            <span role="columnheader">What it's good at</span>
            <span role="columnheader">With PrintPal</span>
          </div>
          {ROWS.map((r, i) => (
            <div className="df-row reveal" role="row" key={r.name} style={{ "--d": `${220 + i * 70}ms` } as React.CSSProperties}>
              <h3 role="rowheader">{r.name}</h3>
              <p className="df-good" role="cell" data-label="What it's good at">
                {r.good}
              </p>
              <p className="df-with" role="cell" data-label="With PrintPal">
                {r.withIt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
