import { useEffect, useRef, useState } from "react";
import { GREETING_MS, runMochiGreeting } from "./mochi";
import "./palNotch.css";

type NotchState = "hidden" | "idle" | "greeting";

interface PalNotchProps {
  /** Text shown next to "PAL" in the idle pill. */
  label?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The Pal notch, as in the product: a black pill docked to the top-centre of the
 * viewport (216 × 34 idle, 440 × 104 greeting).
 * On page load it drops in, plays the Mochi greeting once, then settles to idle.
 * Clicking it replays the greeting.
 */
export function PalNotch({ label = "Pilot open" }: PalNotchProps) {
  const [state, setState] = useState<NotchState>("hidden");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Entrance: drop in, then greet once.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setState("idle");
      return;
    }
    const t1 = window.setTimeout(() => setState("idle"), 250);
    const t2 = window.setTimeout(() => setState("greeting"), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Run the canvas while greeting. The timeout is a safety net: if animation frames are paused
  // (background tab, power saving), the notch still returns to idle instead of staying open and empty.
  useEffect(() => {
    if (state !== "greeting" || !canvasRef.current) return;
    const stop = runMochiGreeting(canvasRef.current, () => setState("idle"));
    const fallback = window.setTimeout(() => setState("idle"), GREETING_MS + 600);
    return () => {
      stop();
      window.clearTimeout(fallback);
    };
  }, [state]);

  // Escape closes the greeting, as in the product.
  useEffect(() => {
    if (state !== "greeting") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState("idle");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  const toggle = () => {
    if (state === "hidden" || prefersReducedMotion()) return;
    setState((s) => (s === "greeting" ? "idle" : "greeting"));
  };

  const shape = state === "greeting" ? "is-greeting" : "is-idle";

  return (
    <aside className={`pal-dock ${state === "hidden" ? "is-hidden" : ""}`} aria-label="Pal">
      <button
        type="button"
        className={`pal-island ${shape}`}
        onClick={toggle}
        aria-label={state === "greeting" ? "Close Pal greeting" : "Say hi to Pal"}
      >
        <span className="pal-ear pal-ear-l" aria-hidden="true" />
        <span className="pal-ear pal-ear-r" aria-hidden="true" />

        <span className={`pal-surface ${shape}`}>
          {state === "greeting" ? (
            <span className="pal-greeting">
              <canvas ref={canvasRef} className="pal-greeting-canvas" aria-hidden="true" />
            </span>
          ) : (
            <>
              <span className="pal-idle-left">
                <span className="pal-dot" aria-hidden="true">
                  <span className="pal-dot-ping" />
                  <span className="pal-dot-core" />
                </span>
                <span className="pal-name">PAL</span>
                <span className="pal-label">{label}</span>
              </span>
              <span className="pal-lens" aria-hidden="true" />
            </>
          )}
        </span>
      </button>
    </aside>
  );
}
