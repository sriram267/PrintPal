import { Logo } from "../Logo";
import { APP_URL } from "../../lib/links";
import { openWaitlist } from "../WaitlistDialog";
import "./footer.css";

const PRODUCT_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Product", href: "#product" },
  { label: "Who it's for", href: "#who" },
  { label: "FAQ", href: "#faq" },
];

export function Footer() {
  return (
    <footer className="ft">
      <div className="sx-inner">
        <div className="ft-top">
          <div className="ft-brand">
            <a href="#top" aria-label="PrintPal, back to top">
              <Logo />
            </a>
            <p>Quoting software for sign shops and large-format printers in India.</p>
          </div>

          <nav className="ft-cols" aria-label="Footer">
            <div>
              <h4>PrintPal</h4>
              {PRODUCT_LINKS.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div>
              <h4>Get started</h4>
              <button type="button" onClick={openWaitlist}>
                Join the waitlist
              </button>
              <a href={APP_URL}>Sign in</a>
            </div>
          </nav>
        </div>

        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} PrintPal</span>
          <span>Made for the people who make signs.</span>
        </div>
      </div>
    </footer>
  );
}
