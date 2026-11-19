import { useId } from "react";

interface PalMascotProps {
  size: number;
  /**
   * idle: lives on its own (breathes, floats its hands, blinks, glances). CSS only.
   * rig: no CSS motion; the greeting engine drives the parts frame by frame.
   */
  mode?: "idle" | "rig";
  /** false: face only (no hands), cropped to the body. Used in the small notch pill. */
  hands?: boolean;
  className?: string;
}

/** Soft squircle body, centre (50,50), half-size 31. */
const BODY = "M50 19 C70.8 19 81 29.2 81 50 C81 70.8 70.8 81 50 81 C29.2 81 19 70.8 19 50 C19 29.2 29.2 19 50 19 Z";

/**
 * Pal, the PrintPal mascot: a pearl-silver squircle lit from the top left, two slim ink capsule eyes,
 * and two floating hands (a soft ball and a rounded pill). Original artwork, pure vector.
 */
export function PalMascot({ size, mode = "idle", hands = true, className = "" }: PalMascotProps) {
  const uid = useId().replace(/:/g, "");
  const u = (n: string) => `url(#${uid}${n})`;
  return (
    <svg
      className={`pm pm-${mode} ${className}`}
      viewBox={hands ? "0 0 100 100" : "17 17 66 66"}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <defs>
        {/* pearl body, lit from the top left */}
        <radialGradient id={`${uid}b`} cx="0.36" cy="0.28" r="0.86">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.42" stopColor="#F2F4F7" />
          <stop offset="0.78" stopColor="#D8DDE4" />
          <stop offset="1" stopColor="#B8C0CB" />
        </radialGradient>
        {/* hands use the same light, so they read as the same material */}
        <radialGradient id={`${uid}h`} cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#E6E9EE" />
          <stop offset="1" stopColor="#B4BCC7" />
        </radialGradient>
        <radialGradient id={`${uid}g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="pm-all">
        {hands && (
          <>
        {/* left hand: a soft ball */}
        <g className="pm-hand pm-hand-l">
          <circle cx="8.5" cy="55" r="6.6" fill={u("h")} />
        </g>
        {/* right hand: a rounded pill, tilted */}
        <g className="pm-hand pm-hand-r">
          <rect x="81.5" y="62.8" width="17" height="8.4" rx="4.2" transform="rotate(-38 90 67)" fill={u("h")} />
        </g>
          </>
        )}

        <g className="pm-body">
          <path d={BODY} fill={u("b")} />
          <ellipse cx="41" cy="28.5" rx="13" ry="5" fill={u("g")} />
          <g className="pm-eyes">
            <g className="pm-eye">
              <rect x="37" y="37" width="5.2" height="14.5" rx="2.6" fill="#15171B" />
            </g>
            <g className="pm-eye">
              <rect x="57.8" y="37" width="5.2" height="14.5" rx="2.6" fill="#15171B" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
