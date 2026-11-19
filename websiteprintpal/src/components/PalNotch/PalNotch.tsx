import { useEffect, useState } from "react";
import { PalMascot } from "./PalMascot";
import "./palMascot.css";
import "./palNotch.css";

type NotchState = "hidden" | "idle" | "greeting";

interface PalNotchProps {
  /** Text shown next to "PAL" in the idle pill. */
  label?: string;
}

/** How long the greeting stays open before the notch settles back to idle. */
const GREETING_MS = 4200;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Lives for one page load. A refresh resets it, a remount (hot reload, re-render of the app shell) does not,
   so the greeting plays at the start of a page load and after that only when the notch is clicked. */
let greetedThisLoad = false;

/**
 * The Pal notch: a black pill docked to the top-centre of the viewport
 * (216 × 34 idle, 440 × 104 greeting).
 * On page load it drops in, says hi once, then settles to idle. Clicking it says hi again.
 */
export function PalNotch({ label = "Pilot open" }: PalNotchProps) {
  const [state, setState] = useState<NotchState>(greetedThisLoad ? "idle" : "hidden");

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

  // The greeting closes itself.
  useEffect(() => {
    if (state !== "greeting") return;
    const t = window.setTimeout(() => setState("idle"), GREETING_MS);
    return () => window.clearTimeout(t);
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
              <PalMascot size={72} mode="greet" className="pal-greeting-mascot" />
              <span className="pal-greeting-text">
                <strong>Hi, I&rsquo;m Pal.</strong>
                <span>Your print and signage shop helper.</span>
              </span>
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
