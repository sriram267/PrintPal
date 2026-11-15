import { ClerkWaitlist } from "../ClerkWaitlist";
import { useInView } from "./useInView";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./finalCta.css";

export function FinalCta() {
  const ref = useReveal<HTMLElement>();
  // load Clerk's form when the section comes near, not with the first paint
  const [formRef, near] = useInView<HTMLDivElement>("400px 0px");
  return (
    <section className="sx fc" id="waitlist" ref={ref}>
      <div className="sx-inner">
        <div className="fc-panel">
          <span className="fc-tag reveal">Pilot · free for now</span>
          <h2 className="fc-title reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
            Be one of the first shops on PrintPal.
          </h2>
          <p className="fc-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            Leave your email and we'll send your invite.
          </p>
          <div className="fc-form reveal" ref={formRef} style={{ "--d": "190ms" } as React.CSSProperties}>
            {near && <ClerkWaitlist bare />}
          </div>
        </div>
      </div>
    </section>
  );
}
