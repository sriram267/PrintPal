import { GoogleButton } from "../GoogleButton";
import { useReveal } from "./useReveal";
import "./sections.css";
import "./finalCta.css";

export function FinalCta() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="sx fc" id="get-started" ref={ref}>
      <div className="sx-inner">
        <div className="fc-panel">
          <span className="fc-tag reveal">Pilot · free for now</span>
          <h2 className="fc-title reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
            Be one of the first shops on PrintPal.
          </h2>
          <p className="fc-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            Sign up with your Google account. It takes a few seconds.
          </p>
          <div className="fc-form reveal" style={{ "--d": "190ms" } as React.CSSProperties}>
            <GoogleButton className="btn-attio fc-google" />
          </div>
        </div>
      </div>
    </section>
  );
}
