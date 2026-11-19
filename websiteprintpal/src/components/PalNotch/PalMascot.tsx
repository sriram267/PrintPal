import { useId } from "react";

interface PalMascotProps {
  size: number;
  /**
   * idle: lives on its own (breathes, floats its hands, blinks, glances). CSS only.
   * rig: no CSS motion; the greeting engine drives the parts frame by frame.
   * work: Pal opens its mouth (a slot under the eyes) and prints: a sheet slides out twice while it looks
   *       down and pushes, then the mouth closes and it settles into idle. Used while a PDF comes out.
   */
  mode?: "idle" | "rig" | "work";
  /** false: face only (no hands), cropped to the body. Used in the small notch pill. */
  hands?: boolean;
  /**
   * Pal is always a white, pearl body. brand: cool silver towards its base.
   * The others add a subtle wash of a state's colour rising from the base (toasts, the printer screen).
   */
  tone?: PalTone;
  className?: string;
}

export type PalTone = "brand" | "info" | "success" | "warning" | "error" | "neutral" | "warm";

/** The base wash for each tone, [light, base]. Kept light so Pal always reads as white. */
const TONE_TINT: Record<PalTone, [light: string, base: string]> = {
  brand: ["#E3E7EC", "#B4BDC9"],
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
 * Pal, the PrintPal mascot: a glossy white-and-silver pillow-dome, two ink capsule eyes,
 * two small floating mitten hands. Original artwork, pure vector.
 */
export function PalMascot({ size, mode = "idle", hands = true, tone = "brand", className = "" }: PalMascotProps) {
  const uid = useId().replace(/:/g, "");
  const u = (n: string) => `url(#${uid}${n})`;
  const tint = TONE_TINT[tone];
  const body = ["#FFFFFF", "#F7F8FA", tint[0], tint[1]];
  const hand = ["#FFFFFF", tint[1]];
  const rim = "#4F5967";
  const rimAlpha = tone === "brand" ? 0.22 : 0.16;
  const bounce = "#FFFFFF";
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
          {[0, 0.3, 0.6, 1].map((o, i) => (
            <stop key={o} offset={o} stopColor={body[i]} />
          ))}
        </linearGradient>
        <linearGradient id={`${uid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.66" stopColor={rim} stopOpacity="0" />
          <stop offset="1" stopColor={rim} stopOpacity={rimAlpha} />
        </linearGradient>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
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
            opacity={0.22}
          />
          <g className="pm-eyes">
            <g className="pm-eye">
              <rect x="37.4" y="45.5" width="6" height="14.5" rx="3" fill="#23262B" />
            </g>
            <g className="pm-eye">
              <rect x="56.6" y="45.5" width="6" height="14.5" rx="3" fill="#23262B" />
            </g>
          </g>
          {mode === "work" && (
            <>
              {/* the mouth: a printer slot that opens under the eyes */}
              <rect className="pm-mouth" x="37.5" y="63.2" width="25" height="6.6" rx="3.3" fill="#23262B" />
              {/* the sheet coming out of it, clipped so it only shows from the slot down */}
              <clipPath id={`${uid}m`}>
                <rect x="0" y="65.6" width="100" height="40" />
              </clipPath>
              <g clipPath={u("m")}>
                <g className="pm-paper">
                  <rect x="41.5" y="52" width="17" height="13" rx="1" fill="#FFFFFF" stroke="#8F98A4" strokeWidth="0.5" />
                  <rect x="44" y="55.2" width="9" height="1.3" rx="0.65" fill="#D7440E" />
                  <rect x="44" y="58.4" width="12" height="1.1" rx="0.55" fill="#B7BEC8" />
                  <rect x="44" y="61" width="8.5" height="1.1" rx="0.55" fill="#B7BEC8" />
                </g>
              </g>
            </>
          )}
        </g>
      </g>
    </svg>
  );
}
