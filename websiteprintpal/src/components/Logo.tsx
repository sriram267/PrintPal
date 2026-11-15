interface LogoProps {
  /** Hide the "PrintPal" wordmark and show only the mark (used on small phones). */
  markOnly?: boolean;
}

/** Placeholder mark until a final logo exists; the wordmark matches the product's "PrintPal" title. */
export function Logo({ markOnly = false }: LogoProps) {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 22 22" width="24" height="24" aria-hidden="true">
        <rect width="22" height="22" rx="6" fill="var(--pp-ink)" />
        <path
          d="M8 16.5V5.75h4.25a3.6 3.6 0 0 1 0 7.2H8"
          fill="none"
          stroke="#fff"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15.6" cy="16.2" r="1.55" fill="var(--pp-orange)" />
      </svg>
      <span className={`logo-word ${markOnly ? "sr-only" : ""}`}>PrintPal</span>
    </span>
  );
}
