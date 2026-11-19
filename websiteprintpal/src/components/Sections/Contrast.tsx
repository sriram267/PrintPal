import { IconReceipt, IconSearch } from "../Hero/icons";
import {
  IconBell,
  IconBellOff,
  IconCalculator,
  IconClock,
  IconFileCheck,
  IconInbox,
  IconMessage,
  IconUserCheck,
  IconXCircle,
} from "./moreIcons2";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./contrast.css";

/* Pairs of "the way it is now" and "what PrintPal does today". Every right-hand side is a feature that exists. */
const ROWS = [
  {
    without: { icon: <IconMessage />, title: "Enquiries scattered across chats", text: "Names, numbers and what the customer wants sit in WhatsApp threads and phone contacts.", tag: "No single list" },
    withIt: { icon: <IconInbox />, title: "Every enquiry in one list", text: "Save a name and a number in seconds, and see them all together.", tag: "Name + number is enough" },
  },
  {
    without: { icon: <IconClock />, title: "The same details, typed again", text: "Customer and site details retyped into every new quote.", tag: "Typed again and again" },
    withIt: { icon: <IconUserCheck />, title: "Customer and sites saved once", text: "GST, billing details and every site live in one record, and flow into the quote.", tag: "Saved once" },
  },
  {
    without: { icon: <IconBellOff />, title: "Follow-ups live in your head", text: "A call back that slips is a job that goes to someone else.", tag: "Easy to forget" },
    withIt: { icon: <IconBell />, title: "Follow-ups you can see", text: "Add a date and the enquiry shows as Needs follow-up in your list.", tag: "Marked in your list" },
  },
  {
    without: { icon: <IconCalculator />, title: "Totals worked out on a calculator", text: "Areas, rates and GST done by hand, then pasted into a document.", tag: "Room for errors" },
    withIt: { icon: <IconReceipt size={20} />, title: "Quotes priced for you", text: "Six ways to price, with discount and charges, and GST split into CGST and SGST.", tag: "Totals done for you" },
  },
  {
    without: { icon: <IconSearch size={20} />, title: "Old quotes are hard to find", text: "Scrolling through old chats to see what you quoted last time.", tag: "Scroll to find" },
    withIt: { icon: <IconFileCheck />, title: "Every quote saved", text: "Find any quote in Quotation Reports, preview the PDF, revise it into a new version, and finalize the agreed one as the invoice.", tag: "Quote to invoice" },
  },
] as const;

function Mark() {
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true">
      <rect width="22" height="22" rx="6" fill="#fff" />
      <path d="M8 16.5V5.75h4.25a3.6 3.6 0 0 1 0 7.2H8" fill="none" stroke="#0b0c0e" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.6" cy="16.2" r="1.55" fill="#D7440E" />
    </svg>
  );
}

export function Contrast() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="sx cx" id="why" ref={ref}>
      <div className="sx-inner">
        <header className="cx-head">
          <span className="cx-pill reveal">Sound familiar?</span>
          <h2 className="cx-title reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
            Quoting shouldn't live in chats and spreadsheets.
          </h2>
          <p className="cx-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            Here's what changes when every enquiry, customer and quote lives in one place.
          </p>
        </header>

        <div className="cx-grid">
          <div className="cx-panel is-without reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
            <div className="cx-panel-head">
              <span className="cx-ico">
                <IconXCircle />
              </span>
              Without PrintPal
            </div>
            {ROWS.map((r) => (
              <div className="cx-row" key={r.without.title}>
                <span className="cx-ico">{r.without.icon}</span>
                <div>
                  <h3>{r.without.title}</h3>
                  <p>{r.without.text}</p>
                  <span className="cx-tag">{r.without.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cx-panel is-with reveal" style={{ "--d": "260ms" } as React.CSSProperties}>
            <div className="cx-panel-head">
              <span className="cx-ico">
                <Mark />
              </span>
              With PrintPal
            </div>
            {ROWS.map((r) => (
              <div className="cx-row" key={r.withIt.title}>
                <span className="cx-ico">{r.withIt.icon}</span>
                <div>
                  <h3>{r.withIt.title}</h3>
                  <p>{r.withIt.text}</p>
                  <span className="cx-tag">{r.withIt.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
