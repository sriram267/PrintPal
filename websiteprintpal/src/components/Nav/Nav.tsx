import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { APP_URL } from "../../lib/links";
import { openWaitlist } from "../WaitlistDialog";
import "./nav.css";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

/** Attio-style top bar: full width, logo + links on the left, Sign in + CTA on the right.
 *  The centre is left clear for the Pal notch. */
export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1001px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const join = () => {
    setOpen(false);
    openWaitlist();
  };

  return (
    <header className={`nav ${open ? "is-open" : ""}`}>
      {open && <div className="nav-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#top" className="nav-logo" aria-label="PrintPal home">
            <span className="nav-logo-full">
              <Logo />
            </span>
            <span className="nav-logo-mark">
              <Logo markOnly />
            </span>
          </a>
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="nav-right">
          <a href={APP_URL} className="btn-attio btn-attio-outline nav-signin">
            Sign in
          </a>
          <button type="button" className="btn-attio btn-attio-dark nav-cta" onClick={join}>
            Join the waitlist
          </button>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="nav-sheet" className="nav-sheet" hidden={!open}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="nav-sheet-link" onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <div className="nav-sheet-actions">
          <a href={APP_URL} className="btn-attio btn-attio-outline">
            Sign in
          </a>
          <button type="button" className="btn-attio btn-attio-dark" onClick={join}>
            Join the waitlist
          </button>
        </div>
      </div>
    </header>
  );
}
