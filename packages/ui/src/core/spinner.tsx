import { cn } from "../lib/cn";

export interface SpinnerProps {
  size?: number;
  className?: string;
  /** Read out to screen readers. */
  label?: string;
}

/** A small circular loader. Inherits the text colour. */
export function Spinner({ size = 16, className, label = "Loading" }: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin shrink-0", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
