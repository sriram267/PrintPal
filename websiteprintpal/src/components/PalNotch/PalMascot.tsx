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
  /**
   * brand: the glossy orange Pal.
   * The others are a white, pearl Pal with a subtle wash of the state's colour rising from its base
   * (used in toasts instead of an icon).
   */
  tone?: PalTone;
  className?: string;
}

export type PalTone = "brand" | "info" | "success" | "warning" | "error" | "neutral" | "warm";

/** The base wash for each state. Kept light so Pal still reads as white. */
const TONE_TINT: Record<Exclude<PalTone, "brand">, [light: string, base: string]> = {
  info: ["#D3E5F9", "#94BDEE"],
  success: ["#D2EEDD", "#93D4AC"],
  warning: ["#F8E9CB", "#EFCB84"],
  error: ["#F8D7D4", "#EE9F99"],
  neutral: ["#E6EAEF", "#C3CCD8"],
  warm: ["#FAE1D1", "#F3B48F"],
};

/** Glossy pillow-dome body, centre (50,51), 66 × 50. */
const BODY = "M17 50 C17 33 32 26 50 26 C68 26 83 33 83 50 C83 69 71 76 50 76 C29 76 17 69 17 50 Z";
/** Small mitten hand (tip up, thumb on the inner side), centred on (0,0). */
const HAND =
  "M-4.6 7.2 C-8 4.6 -7.6 -2.6 -3.8 -7.4 C-2.4 -9.1 0.2 -8.6 0.4 -6.2 C0.6 -4.2 -0.4 -2.6 0.8 -1.4 C2.2 -2.6 4.6 -2.6 5.6 -0.4 C6.8 3 4.4 7.6 0.4 8.4 C-1.6 8.8 -3.4 8.2 -4.6 7.2 Z";

/**
 * Pal, the PrintPal mascot: a glossy orange pillow-dome, two ink capsule eyes,
 * two small floating mitten hands. Original artwork, pure vector.
 */
export function PalMascot({ size, mode = "idle", hands = true, tone = "brand", className = "" }: PalMascotProps) {
  const uid = useId().replace(/:/g, "");
  const u = (n: string) => `url(#${uid}${n})`;
  const tint = tone === "brand" ? null : TONE_TINT[tone];
  const body = tint ? ["#FFFFFF", "#F7F8FA", tint[0], tint[1]] : ["#F7844A", "#E65A1D", "#D2480F", "#A9360A"];
  const hand = tint ? ["#FFFFFF", tint[1]] : ["#F57A3E", "#C9420E"];
  const rim = tint ? "#5B6573" : "#7A2504";
  const rimAlpha = tint ? 0.16 : 0.45;
  const bounce = tint ? "#FFFFFF" : "#FF8A52";
  return (
    <svg
      className={`pm pm-${mode} ${className}`}
      viewBox={hands ? "0 0 100 100" : "14 15 72 72"}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          {(tint ? [0, 0.3, 0.6, 1] : [0, 0.3, 0.75, 1]).map((o, i) => (
            <stop key={o} offset={o} stopColor={body[i]} />
          ))}
        </linearGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.66" stopColor={rim} stopOpacity="0" />
          <stop offset="1" stopColor={rim} stopOpacity={rimAlpha} />
        </linearGradient>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={tint ? 0.9 : 0.38} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hand[0]} />
          <stop offset="1" stopColor={hand[1]} />
        </linearGradient>
      </defs>

      <g className="pm-all">
        {hands && (
          <>
            <g className="pm-hand pm-hand-l">
              <path d={HAND} transform="translate(11.5 66) rotate(26) scale(0.86)" fill={u("h")} />
            </g>
            <g className="pm-hand pm-hand-r">
              <path d={HAND} transform="translate(88.5 66) scale(-1 1) rotate(26) scale(0.86)" fill={u("h")} />
            </g>
          </>
        )}

        <g className="pm-body">
          <path d={BODY} fill={u("b")} />
          <path d={BODY} fill={u("r")} />
          {/* glossy top band */}
          <path
            d="M23 44 C24.5 34 35.5 29.5 50 29.5 C64.5 29.5 75.5 34 77 44 C69 39 60 37.5 50 37.5 C40 37.5 31 39 23 44 Z"
            fill={u("g")}
          />
          {/* warm bounce light along the base */}
          <path
            d="M20 58 C26 65 37 68.5 50 68.5 C63 68.5 74 65 80 58 C79 67 68 73.5 50 73.5 C32 73.5 21 67 20 58 Z"
            fill={bounce}
            opacity={tint ? 0.22 : 0.18}
          />
          <g className="pm-eyes">
            <g className="pm-eye">
              <rect x="37.4" y="45.5" width="6" height="14.5" rx="3" fill="#23262B" />
            </g>
            <g className="pm-eye">
              <rect x="56.6" y="45.5" width="6" height="14.5" rx="3" fill="#23262B" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
