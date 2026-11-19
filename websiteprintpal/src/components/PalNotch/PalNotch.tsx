import { useEffect, useRef, useState } from "react";
import { PalMascot } from "./PalMascot";
import { GREETING_MS, runPalGreeting } from "./palGreeting";
import "./palMascot.css";
import "./palNotch.css";

type NotchState = "hidden" | "idle" | "greeting";

interface PalNotchProps {
  /** Text shown next to "PAL" in the idle pill. */
  label?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Lives for one page load. A refresh resets it, a remount (hot reload, re-render of the app shell) does not,
   so the greeting plays at the start of a page load and after that only when the notch is clicked. */
let greetedThisLoad = false;

/**
 * The Pal notch, as in the product: a black pill docked to the top-centre of the
 * viewport (216 × 34 idle, 440 × 104 greeting).
 * On page load it drops in, plays Pal's greeting once, then settles to idle.
 * Clicking it replays the greeting.
 */
export function PalNotch({ label = "Pilot open" }: PalNotchProps) {
  const [state, setState] = useState<NotchState>(greetedThisLoad ? "idle" : "hidden");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Entrance: drop in, then greet once per page load.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setState("idle");
      return;
    }
    if (greetedThisLoad) return;
    const t1 = window.setTimeout(() => setState("idle"), 250);
    const t2 = window.setTimeout(() => {
      greetedThisLoad = true;
      setState("greeting");
    }, 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Run the canvas while greeting. The timeout is a safety net: if animation frames are paused
  // (background tab, power saving), the notch still returns to idle instead of staying open and empty.
  useEffect(() => {
    if (state !== "greeting" || !canvasRef.current) return;
    const stop = runPalGreeting(canvasRef.current, () => setState("idle"));
    const fallback = window.setTimeout(() => setState("idle"), GREETING_MS + 600);
    return () => {
      stop();
      window.clearTimeout(fallback);
    };
  }, [state]);

  // Escape closes the greeting.
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
                <PalMascot size={28} className="pal-idle-mascot" />
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
