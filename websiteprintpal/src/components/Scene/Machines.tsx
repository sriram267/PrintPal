import { useEffect, useId, useMemo, useRef } from "react";
import { CNC, PRINTER } from "./machines.generated";
import "../../../vendor/anatomy/kit/iso.css";
import "./machines.css";

type Vec = readonly [number, number];
type Basis = { o: Vec; x: Vec; y: Vec; z: Vec };

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const move = (b: Basis, dx: number, dy: number, dz: number) =>
  `translate(${(b.x[0] * dx + b.y[0] * dy + b.z[0] * dz).toFixed(2)} ${(b.x[1] * dx + b.y[1] * dy + b.z[1] * dz).toFixed(2)})`;

/** Screen length of each leg of a floor polyline, under the figure's projection. */
function legsOf(points: readonly (readonly number[])[], b: Basis) {
  const world: number[] = [];
  const screen: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    world.push(Math.hypot(dx, dy));
    screen.push(Math.hypot(b.x[0] * dx + b.y[0] * dy, b.x[1] * dx + b.y[1] * dy));
  }
  return { world, screen, worldTotal: world.reduce((a, c) => a + c, 0), screenTotal: screen.reduce((a, c) => a + c, 0) };
}

/** Position and revealed screen length after travelling `dist` world units along a polyline. */
function along(points: readonly (readonly number[])[], legs: ReturnType<typeof legsOf>, dist: number) {
  let left = Math.max(0, dist);
  let shown = 0;
  for (let i = 0; i < legs.world.length; i++) {
    const w = legs.world[i];
    if (left <= w) {
      const t = w ? left / w : 0;
      const a = points[i];
      const c = points[i + 1];
      return { x: a[0] + (c[0] - a[0]) * t, y: a[1] + (c[1] - a[1]) * t, shown: shown + legs.screen[i] * t };
    }
    left -= w;
    shown += legs.screen[i];
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1], shown: legs.screenTotal };
}

function useFigure(svg: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  // The same figure can appear more than once on the page; give each copy its own clipPath id.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(() => ({ __html: svg.replace(/pp-media-clip/g, `pp-media-clip-${uid}`) }), [svg, uid]);
  return { ref, html };
}

/* ─────────────────────────────── CNC router ─────────────────────────────── */

export function CncRouter({ running, className = "" }: { running: boolean; className?: string }) {
  const { ref, html } = useFigure(CNC.svg);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = (part: string) => root.querySelector<SVGElement>(`[data-part="${part}"]`);
    const gantry = q("gantry");
    const carriage = q("carriage");
    const zed = q("z");
    const chips = q("chips");
    const outerEl = q("cut-outer") as SVGPathElement | null;
    const innerEl = q("cut-inner") as SVGPathElement | null;
    if (!gantry || !carriage || !zed || !outerEl || !innerEl) return;

    const b = CNC.basis as unknown as Basis;
    const { gx, cy, spx } = CNC.rest;
    const outer = CNC.toolpath.outer;
    const inner = CNC.toolpath.inner;
    const oL = legsOf(outer, b);
    const iL = legsOf(inner, b);
    outerEl.style.strokeDasharray = `${oL.screenTotal} ${oL.screenTotal}`;
    innerEl.style.strokeDasharray = `${iL.screenTotal} ${iL.screenTotal}`;

    const place = (x: number, y: number, lift: number) => {
      gantry.setAttribute("transform", move(b, x - (gx + spx), 0, 0));
      carriage.setAttribute("transform", move(b, 0, y - cy, 0));
      zed.setAttribute("transform", move(b, 0, 0, lift));
    };
    const reveal = (o: number, i: number) => {
      outerEl.style.strokeDashoffset = String(oL.screenTotal - o);
      innerEl.style.strokeDashoffset = String(iL.screenTotal - i);
    };

    // Resting pose: letter finished, bit parked over its start, lifted.
    const rest = () => {
      place(outer[0][0], outer[0][1], 12);
      reveal(oL.screenTotal, iL.screenTotal);
      outerEl.style.opacity = innerEl.style.opacity = "1";
      chips?.classList.remove("is-on");
    };
    if (!running || reducedMotion()) {
      rest();
      return;
    }

    const FEED = 38; // world units / s while cutting
    const LIFT = 12;
    const T = {
      plunge: 0.3,
      outer: oL.worldTotal / FEED,
      hop: 0.3 + 0.55 + 0.3, // lift, travel, plunge
      inner: iL.worldTotal / FEED,
      park: 0.3 + 0.8, // lift, travel home
      hold: 1.6,
      clear: 0.5,
    };
    const total = T.plunge + T.outer + T.hop + T.inner + T.park + T.hold + T.clear;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const lerp = (a: number, c: number, t: number) => a + (c - a) * t;

    let raf = 0;
    let start = 0;
    const frame = (now: number) => {
      if (!start) start = now;
      let t = ((now - start) / 1000) % total;
      let x = outer[0][0];
      let y = outer[0][1];
      let z = 0;
      let o = 0;
      let i = 0;
      let cutting = false;
      let fade = 1;

      if ((t -= T.plunge) < 0) {
        z = LIFT * (1 - ease(1 + t / T.plunge));
      } else if ((t -= T.outer) < 0) {
        const p = along(outer, oL, (T.outer + t) * FEED);
        x = p.x; y = p.y; o = p.shown; cutting = true;
      } else if ((t -= T.hop) < 0) {
        o = oL.screenTotal;
        const h = T.hop + t;
        const end = outer[outer.length - 1];
        if (h < 0.3) { x = end[0]; y = end[1]; z = LIFT * ease(h / 0.3); }
        else if (h < 0.85) { const k = ease((h - 0.3) / 0.55); x = lerp(end[0], inner[0][0], k); y = lerp(end[1], inner[0][1], k); z = LIFT; }
        else { x = inner[0][0]; y = inner[0][1]; z = LIFT * (1 - ease((h - 0.85) / 0.3)); }
      } else if ((t -= T.inner) < 0) {
        o = oL.screenTotal;
        const p = along(inner, iL, (T.inner + t) * FEED);
        x = p.x; y = p.y; i = p.shown; cutting = true;
      } else if ((t -= T.park) < 0) {
        o = oL.screenTotal; i = iL.screenTotal;
        const h = T.park + t;
        const end = inner[inner.length - 1];
        if (h < 0.3) { x = end[0]; y = end[1]; z = LIFT * ease(h / 0.3); }
        else { const k = ease((h - 0.3) / 0.8); x = lerp(end[0], outer[0][0], k); y = lerp(end[1], outer[0][1], k); z = LIFT; }
      } else {
        o = oL.screenTotal; i = iL.screenTotal; z = LIFT;
        if ((t -= T.hold) >= 0) fade = 1 - Math.min(1, t / T.clear);
      }

      place(x, y, z);
      reveal(o, i);
      outerEl.style.opacity = innerEl.style.opacity = fade.toFixed(3);
      chips?.classList.toggle("is-on", cutting);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      rest();
    };
  }, [running, ref]);

  return (
    <div ref={ref} className={`iso pp-iso machine machine-cnc ${className}`} data-theme="light" dangerouslySetInnerHTML={html} />
  );
}

/* ─────────────────────────── Wide-format printer ─────────────────────────── */

export function WideFormatPrinter({ running, className = "" }: { running: boolean; className?: string }) {
  const { ref, html } = useFigure(PRINTER.svg);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const head = root.querySelector<SVGElement>('[data-part="head"]');
    const print = root.querySelector<SVGElement>('[data-part="print"]');
    if (!head || !print) return;
    const b = PRINTER.basis as unknown as Basis;
    const { headX, headRange, tile } = PRINTER.rest;
    const mid = (headRange[0] + headRange[1]) / 2;
    const amp = (headRange[1] - headRange[0]) / 2;

    if (!running || reducedMotion()) {
      head.setAttribute("transform", move(b, 0, 0, 0));
      print.setAttribute("transform", "");
      return;
    }

    let raf = 0;
    let start = 0;
    const frame = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const x = mid + amp * Math.sin(t * 2.6);
      head.setAttribute("transform", move(b, x - headX, 0, 0));
      // media advances a little on each pass of the head
      const advance = ((t * 6 + Math.max(0, Math.sin(t * 2.6)) * 0.6) % tile).toFixed(2);
      print.setAttribute("transform", `translate(0 ${advance})`);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, ref]);

  return (
    <div ref={ref} className={`iso pp-iso machine machine-printer ${className}`} data-theme="light" dangerouslySetInnerHTML={html} />
  );
}

/** Where each machine's connector starts, in its own figure's px. */
export const PORTS = { cnc: CNC.port, printer: PRINTER.port } as const;
export const FIGURE_SIZE = {
  cnc: { w: CNC.width, h: CNC.height },
  printer: { w: PRINTER.width, h: PRINTER.height },
} as const;
