import { useState } from "react";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./faq.css";

/* Five honest answers. Nothing here promises a feature the product doesn't have. */
const FAQS = [
  {
    q: "Is PrintPal free?",
    a: "Yes, it's free during the pilot. We haven't set pricing yet.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist with your email. We invite shops in small batches, send your invite by email, and you create your account from it.",
  },
  {
    q: "Does it handle GST?",
    a: "Yes. Quotes show GST with the CGST and SGST split, and the PDF carries your GSTIN. You can set your tax slabs in Settings.",
  },
  {
    q: "How do I send a quote to my customer?",
    a: "Download the quotation as a PDF and send it however you already do, on WhatsApp or by email.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. PrintPal runs in your browser, on a laptop or desktop screen.",
  },
];

export function Faq() {
  const ref = useReveal<HTMLElement>();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="sx fq" id="faq" ref={ref}>
      <div className="sx-inner fq-grid">
        <div>
          <span className="sx-chip reveal">FAQ</span>
          <h2 className="sx-h2 reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
            A few quick answers.
          </h2>
        </div>

        <ul className="fq-list">
          {FAQS.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className={`fq-item reveal ${on ? "is-open" : ""}`} style={{ "--d": `${120 + i * 60}ms` } as React.CSSProperties}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={on}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                  >
                    <span>{f.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <div className="fq-answer" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
