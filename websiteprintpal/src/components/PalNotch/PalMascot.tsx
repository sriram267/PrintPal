import { useId } from "react";

interface PalMascotProps {
  size: number;
  /** "greet" plays the drop-in and a wave first. "idle" just lives (breathes, blinks, looks around). */
  mode?: "idle" | "greet";
  className?: string;
}

/**
 * Pal, the PrintPal mascot: a soft orange squircle with two capsule eyes and two floating hands.
 * Original artwork. The motion lives in palMascot.css and is all CSS (no JS timers).
 */
export function PalMascot({ size, mode = "idle", className = "" }: PalMascotProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      className={`pm pm-${mode} ${className}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF8650" />
          <stop offset="0.55" stopColor="#E4531A" />
          <stop offset="1" stopColor="#C2400C" />
        </linearGradient>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF915D" />
          <stop offset="1" stopColor="#D24813" />
        </linearGradient>
        <radialGradient id={`${uid}g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="pm-all">
        <g className="pm-hand pm-hand-l">
          <g transform="rotate(-12 8.5 60)">
            <ellipse cx="8.5" cy="60" rx="5.8" ry="8.2" fill={`url(#${uid}h)`} />
          </g>
        </g>
        <g className="pm-hand pm-hand-r">
          <g transform="rotate(12 91.5 60)">
            <ellipse cx="91.5" cy="60" rx="5.8" ry="8.2" fill={`url(#${uid}h)`} />
          </g>
        </g>

        <g className="pm-body">
          <path
            d="M50 19 C70.8 19 81 29.2 81 50 C81 70.8 70.8 81 50 81 C29.2 81 19 70.8 19 50 C19 29.2 29.2 19 50 19 Z"
            fill={`url(#${uid}b)`}
          />
          <ellipse cx="46" cy="27" rx="19" ry="6.5" fill={`url(#${uid}g)`} />
          <g className="pm-eyes">
            <g className="pm-eye">
              <rect x="35.2" y="37" width="7" height="15" rx="3.5" fill="#1B1E22" />
              <circle cx="37.7" cy="41" r="1.3" fill="#fff" opacity="0.85" />
            </g>
            <g className="pm-eye">
              <rect x="57.8" y="37" width="7" height="15" rx="3.5" fill="#1B1E22" />
              <circle cx="60.3" cy="41" r="1.3" fill="#fff" opacity="0.85" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
