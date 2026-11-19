import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { QuoteScreen } from "./QuoteScreen";
import { PhoneQuote } from "./PhoneQuote";
import { CncRouter, FIGURE_SIZE, PORTS, WideFormatPrinter } from "./Machines";
import { openWaitlist } from "../WaitlistDialog";
import { IconChevronRight } from "../Hero/icons";
import "./heroScene.css";

/* ── Stage geometry (design px). The CNC stands in a bay left of the window; the printer sits in the
      empty space under the Quote Summary, so only the left side needs room. ── */
/** The window's design width. It is the product screen at a desktop size (1270) and grows on wide
 *  screens (like the app on a bigger monitor) so it can fill the width without needing more height. */
const WIN_W_MIN = 1270;
const WIN_W_MAX = 1700;
const FIG_SCALE = { cnc: 1.4, printer: 1.25 };
/** The printer is on the LEFT, fully outside: its port (on the side facing the window) is this far from the edge. */
const PRINTER_PORT_INSET = 44;
/** The CNC is on the RIGHT and its table reaches this far INTO the window (over the empty space under the
 *  Quote Summary), so its wires stay short and level. */
const CNC_PORT_INSIDE = 90;
/** The stage is symmetric: the window is centred and both bays are as wide as the larger machine needs,
 *  so the window never drifts sideways while it grows. */
const BAY_L = PRINTER_PORT_INSET + PORTS.printer[0] * FIG_SCALE.printer;
const BAY_R = (FIGURE_SIZE.cnc.w - PORTS.cnc[0]) * FIG_SCALE.cnc - CNC_PORT_INSIDE + 12;
const WIN_X = Math.round(Math.max(BAY_L, BAY_R));

/* ── Scroll feel ── */
/** Pinned scroll distance: half a viewport, clamped. Everything plays within it, at the same time. */
const SCROLL_VH = 0.55;
const SCROLL_MIN = 360;
const SCROLL_MAX = 560;
/** Seconds for the motion to catch up with the scroll (bigger = slower, softer). */
const SMOOTH_TAU = 0.3;
/** At rest the window is at most this share of the viewport wide (Attio's is ~73%)… */
const START_FIT = 0.78;
/** …but never more than this share of its final size, so it still grows. */
const START_MAX = 0.92;
const PIN_MIN_W = 1100;
const PIN_MIN_H = 620;
/** Phones: the 1270px screen can't be read at this width, so a compact quote card takes its place. */
const PHONE_MAX_W = 640;

type Pt = { x: number; y: number };
type Layout = {
  winW: number;
  stageW: number;
  stageH: number;
  cnc: Pt;
  printer: Pt;
  links: { d: string; tone: "orange" | "blue"; end: Pt; start: Pt }[];
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HeroScene() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const bandRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const winRef = useRef<HTMLDivElement | null>(null);
  const cncRef = useRef<HTMLDivElement | null>(null);
  const printerRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<SVGSVGElement | null>(null);

  const [pinned, setPinned] = useState(true);
  const pinnedRef = useRef(true);
  pinnedRef.current = pinned;
  const [phone, setPhone] = useState(false);
  const [winW, setWinW] = useState(WIN_W_MIN);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const metrics = useRef({ s0: 0.7, sF: 0.8, ty0: 500, tyF: 20, dist: 500, start: 0 });

  /* Pinned (desktop) vs stacked (tablet / phone / reduced motion). */
  useLayoutEffect(() => {
    const check = () => {
      setPinned(window.innerWidth >= PIN_MIN_W && window.innerHeight >= PIN_MIN_H && !reducedMotion());
      setPhone(window.innerWidth <= PHONE_MAX_W);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Measure the real rows in the rebuilt screen and wire the machines to them. */
  const measure = useCallback(() => {
    const win = winRef.current;
    const frame = win?.firstElementChild as HTMLElement | null;
    if (!win || !frame) return;
    const winBox = win.getBoundingClientRect();
    const curW = win.offsetWidth || WIN_W_MIN;
    const k = winBox.width / curW || 1; // current scale of the stage
    const local = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: (r.left - winBox.left) / k + WIN_X, y: (r.top - winBox.top) / k, w: r.width / k, h: r.height / k };
    };
    const fabCard = win.querySelector('[data-anchor="site-fabrication"]');
    const printCard = win.querySelector('[data-anchor="site-print"]');
    const fabRows = [...win.querySelectorAll('[data-anchor="row-fabrication"]')].map(local);
    const printRows = [...win.querySelectorAll('[data-anchor="row-print"]')].map(local);
    if (!fabCard || !printCard || !fabRows.length || !printRows.length) return;
    const fc = local(fabCard);
    const pc = local(printCard);

    const last = (rows: typeof fabRows) => rows[rows.length - 1];
    const mid = (rows: typeof fabRows) => (rows[0].y + last(rows).y + last(rows).h) / 2;

    // Printer (left, fully outside): port level with the print rows (Site 1, upper).
    const ps = FIG_SCALE.printer;
    const printer = { x: WIN_X - PRINTER_PORT_INSET - PORTS.printer[0] * ps, y: mid(printRows) - PORTS.printer[1] * ps + 6 };
    const printerPort = { x: printer.x + PORTS.printer[0] * ps, y: printer.y + PORTS.printer[1] * ps };

    // CNC (right): its table reaches a little way into the window, over the empty space under the Quote Summary.
    const cs = FIG_SCALE.cnc;
    const cnc = { x: WIN_X + curW - CNC_PORT_INSIDE - PORTS.cnc[0] * cs, y: mid(fabRows) - PORTS.cnc[1] * cs + 8 };
    const cncPort = { x: cnc.x + PORTS.cnc[0] * cs, y: cnc.y + PORTS.cnc[1] * cs };

    const curve = (a: Pt, b: Pt) => {
      const mx = (a.x + b.x) / 2;
      return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
    };
    const links: Layout["links"] = [];
    fabRows.forEach((r) => {
      const end = { x: fc.x + fc.w + 2, y: r.y + r.h / 2 }; // card's right edge
      links.push({ d: curve(cncPort, end), tone: "orange", start: cncPort, end });
    });
    printRows.forEach((r) => {
      const end = { x: pc.x - 2, y: r.y + r.h / 2 }; // card's left edge
      links.push({ d: curve(printerPort, end), tone: "blue", start: printerPort, end });
    });

    const printerBottom = printer.y + FIGURE_SIZE.printer.h * ps + 40; // + label
    const cncBottom = cnc.y + FIGURE_SIZE.cnc.h * cs + 40;
    const stageW = WIN_X * 2 + curW;
    const stageH = Math.ceil(Math.max(frame.offsetHeight, printerBottom, cncBottom) + 16);
    setLayout({ winW: curW, stageW, stageH, cnc, printer, links });

    // Wide screens: widen the window until the stage fills the viewport at the scale the height allows.
    const sticky = stickyRef.current;
    if (pinnedRef.current && sticky) {
      const s = Math.min((sticky.clientHeight - 24) / stageH, 1);
      const want = clamp(Math.round((window.innerWidth - 32) / s - WIN_X * 2), WIN_W_MIN, WIN_W_MAX);
      if (Math.abs(want - curW) > 6) setWinW(want);
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, pinned, winW]);

  /* Scroll choreography (pinned mode): ONE short scroll drives everything at once.
     The scroll position is eased (exponential follow) so a small scroll plays out slowly and softly. */
  useLayoutEffect(() => {
    if (!pinned || !layout) return;
    const scene = sceneRef.current;
    const sticky = stickyRef.current;
    const copy = copyRef.current;
    const band = bandRef.current;
    const stage = stageRef.current;
    const cnc = cncRef.current;
    const printer = printerRef.current;
    const links = linksRef.current;
    if (!scene || !sticky || !copy || !band || !stage || !cnc || !printer || !links) return;

    const size = () => {
      const vw = window.innerWidth;
      const H = sticky.clientHeight;
      const navH = (document.querySelector(".nav") as HTMLElement | null)?.offsetHeight ?? 68;
      const dist = Math.round(clamp(window.innerHeight * SCROLL_VH, SCROLL_MIN, SCROLL_MAX));
      scene.style.setProperty("--hs-dist", `${dist}px`);
      const sF = Math.min((vw - 32) / layout.stageW, (H - 24) / layout.stageH, 1);
      const s0 = Math.min((vw * START_FIT) / layout.winW, sF * START_MAX, 1);
      const copyBottom = copy.offsetTop + copy.offsetHeight;
      metrics.current = {
        sF,
        s0,
        ty0: Math.min(copyBottom + 36, H * 0.8),
        tyF: Math.max(8, (H - layout.stageH * sF) / 2),
        dist,
        start: scene.getBoundingClientRect().top + window.scrollY - navH,
      };
    };

    const paths = [...links.querySelectorAll<SVGPathElement>(".link-line")];
    const ends = [...links.querySelectorAll<SVGGElement>(".link-end")];

    const apply = (p: number) => {
      const m = metrics.current;

      // 1. headline, pill, buttons lift away and blur out
      const kc = clamp(p / 0.5);
      copy.style.opacity = String(1 - kc);
      copy.style.transform = `translateY(${(-40 * kc).toFixed(1)}px)`;
      copy.style.filter = kc > 0.02 ? `blur(${(10 * kc).toFixed(1)}px)` : "";
      copy.style.pointerEvents = kc > 0.5 ? "none" : "";

      // 2. the window rises and grows in place: always centred, never drifting sideways
      const ke = easeInOut(p);
      stage.style.transform = `translate(-50%, ${lerp(m.ty0, m.tyF, ke).toFixed(2)}px) scale(${lerp(m.s0, m.sF, ke).toFixed(4)})`;

      // 3. the orange band is there from the start and swells upward
      band.style.top = `${lerp(50, 8, ke).toFixed(2)}%`;
      band.style.opacity = lerp(0.9, 1, ke).toFixed(3);

      // 4. both machines arrive together with the window (slight stagger, same window of scroll)
      const k1 = easeOut(clamp((p - 0.04) / 0.66));
      cnc.style.opacity = String(clamp(k1 * 1.6));
      cnc.style.transform = `translate(${(130 * (1 - k1)).toFixed(1)}px, ${(30 * (1 - k1)).toFixed(1)}px) scale(${(FIG_SCALE.cnc * (0.9 + 0.1 * k1)).toFixed(4)})`;
      const k2 = easeOut(clamp((p - 0.1) / 0.66));
      printer.style.opacity = String(clamp(k2 * 1.6));
      printer.style.transform = `translate(${(-130 * (1 - k2)).toFixed(1)}px, ${(30 * (1 - k2)).toFixed(1)}px) scale(${(FIG_SCALE.printer * (0.9 + 0.1 * k2)).toFixed(4)})`;

      // 5. the connectors draw into the rows as the machines land
      const k3 = clamp((p - 0.5) / 0.46);
      paths.forEach((el, i) => (el.style.strokeDashoffset = String((1 - clamp(k3 * 1.15 - i * 0.05)).toFixed(4))));
      ends.forEach((el) => (el.style.opacity = String(clamp(k3 * 3 - 2))));
      stage.classList.toggle("is-linked", p > 0.92);

      const run = p > 0.25;
      if (run !== runningRef.current) {
        runningRef.current = run;
        setRunning(run);
      }
    };

    const progress = () => clamp((window.scrollY - metrics.current.start) / metrics.current.dist);

    let target = 0;
    let shown = 0;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      shown += (target - shown) * (1 - Math.exp(-dt / SMOOTH_TAU));
      if (Math.abs(target - shown) < 0.0005) shown = target;
      apply(shown);
      if (shown === target) {
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const kick = () => {
      target = progress();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      size();
      target = progress();
      shown = target;
      apply(shown);
    };

    size();
    target = shown = progress(); // a refresh mid-scroll starts in place, with no replay
    apply(shown);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, [pinned, layout]);

  /* Stacked mode: run the machines while they are on screen. */
  useEffect(() => {
    if (pinned) return;
    const targets = [cncRef.current, printerRef.current].filter(Boolean) as Element[];
    if (!targets.length) return;
    const io = new IntersectionObserver((entries) => setRunning(entries.some((e) => e.isIntersecting)), { rootMargin: "0px 0px -10% 0px" });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pinned, phone]);

  const seeHow = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copy = (
    <div className="hs-copy" ref={copyRef}>
      <a className="hs-pill" href="#waitlist" onClick={(e) => { e.preventDefault(); openWaitlist(); }}>
        <span>
          Free during the pilot<span className="hs-pill-more"> · Now inviting sign shops</span>
        </span>
        <IconChevronRight size={14} />
      </a>
      <h1 className="hs-title">
        Quoting that speaks
        <br />
        print &amp; signage.
      </h1>
      <p className="hs-sub">
        PrintPal turns every enquiry into a GST-ready quote, with sites, sizes, materials and finishes
        already in place.
      </p>
      <div className="hs-actions">
        <button type="button" className="btn-attio btn-attio-outline" onClick={seeHow}>
          See how it works
        </button>
        <button type="button" className="btn-attio btn-attio-dark" onClick={openWaitlist}>
          Join the waitlist
        </button>
      </div>
    </div>
  );

  const machine = (kind: "cnc" | "printer", style?: React.CSSProperties) => {
    const isCnc = kind === "cnc";
    // phones show the short name: the full label doesn't fit under a half-width machine
    const label = isCnc
      ? phone ? "CNC router" : "CNC router · fabrication lines"
      : phone ? "Wide-format printer" : "Wide-format printer · print lines";
    return (
      <div ref={isCnc ? cncRef : printerRef} className={`hs-machine ${isCnc ? "is-cnc" : "is-printer"}`} style={style}>
        {isCnc ? <CncRouter running={running} /> : <WideFormatPrinter running={running} />}
        <span className="hs-machine-label">
          <i className={isCnc ? "is-orange" : "is-blue"} />
          {label}
        </span>
      </div>
    );
  };

  if (!pinned && phone) {
    return (
      <section className="hs is-stacked is-phone" id="top" ref={sceneRef}>
        <div className="hs-stacked-copy">{copy}</div>
        <div className="hs-stacked-stage">
          <div className="hs-band is-static" ref={bandRef} />
          <div className="hs-stacked-machines">
            {machine("printer")}
            {machine("cnc")}
          </div>
          <PhoneQuote />
        </div>
      </section>
    );
  }

  if (!pinned) {
    return (
      <section className="hs is-stacked" id="top" ref={sceneRef}>
        <div className="hs-stacked-copy">{copy}</div>
        <div className="hs-stacked-stage">
          <div className="hs-band is-static" ref={bandRef} />
          <StackedWindow winRef={winRef} stageRef={stageRef} />
          <div className="hs-stacked-machines">
            {machine("printer")}
            {machine("cnc")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hs is-pinned" id="top" ref={sceneRef}>
      <div className="hs-sticky" ref={stickyRef}>
        <div className="hs-band" ref={bandRef} />
        {copy}
        <div
          ref={stageRef}
          className="hs-stage"
          style={{
            width: layout?.stageW ?? 1700,
            height: layout?.stageH ?? 1000,
            transform: "translate(-50%, 62vh) scale(0.72)",
          }}
        >
          <div ref={winRef} className="hs-window" style={{ left: WIN_X, width: winW }}>
            <QuoteScreen />
          </div>

          {layout && (
            <svg ref={linksRef} className="hs-links" width={layout.stageW} height={layout.stageH} aria-hidden="true">
              <defs>
                <filter id="hsGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              {layout.links.map((l, i) => (
                <g key={i} className={`link is-${l.tone}`}>
                  <path className="link-halo" d={l.d} />
                  <path className="link-line" d={l.d} pathLength={1} />
                  <g className="link-end">
                    <circle cx={l.start.x} cy={l.start.y} r={6} className="link-port" />
                    <circle cx={l.start.x} cy={l.start.y} r={2.4} className="link-port-core" />
                    <circle cx={l.end.x} cy={l.end.y} r={4.5} className="link-port" />
                  </g>
                  <g className="link-dot">
                    <circle r={8} className="link-dot-glow" filter="url(#hsGlow)" />
                    <circle r={3.6} className="link-dot-core" />
                    <animateMotion dur="2.2s" begin={`${i * 0.55}s`} repeatCount="indefinite" path={l.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.25 1" />
                  </g>
                </g>
              ))}
            </svg>
          )}

          {layout && machine("cnc", { left: layout.cnc.x, top: layout.cnc.y, width: FIGURE_SIZE.cnc.w })}
          {layout && machine("printer", { left: layout.printer.x, top: layout.printer.y, width: FIGURE_SIZE.printer.w })}
        </div>
      </div>
    </section>
  );
}

/** Phones and tablets: the screen scaled to the column width, no pinning. */
function StackedWindow({
  winRef,
  stageRef,
}: {
  winRef: React.MutableRefObject<HTMLDivElement | null>;
  stageRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const win = winRef.current;
    if (!box || !win) return;
    const fit = () => {
      const s = box.clientWidth / WIN_W_MIN;
      setScale(s);
      setH((win.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [winRef]);
  return (
    <div
      className="hs-stacked-window"
      ref={(el) => {
        boxRef.current = el;
        stageRef.current = el;
      }}
      style={{ height: h * scale || undefined }}
    >
      <div ref={winRef} className="hs-window is-static" style={{ width: WIN_W_MIN, transform: `scale(${scale})` }}>
        <QuoteScreen />
      </div>
    </div>
  );
}
