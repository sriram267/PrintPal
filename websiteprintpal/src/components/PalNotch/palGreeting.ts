/**
 * Pal greeting: the notch entrance animation (canvas).
 *
 * The scene engine (notch stretch, warp streaks, particle ring, halo, card, drop/bounce/wave/look/blink
 * kinematics) is adapted from Coucou's greeting engine:
 *   Copyright (c) 2026 Louis Raillé. MIT License (https://github.com/Louis-CFM/coucou/blob/main/LICENSE).
 * The character drawn in it is Pal, PrintPal's own mascot (original artwork). Coucou's "Mochi" character,
 * names and sounds are not used.
 *
 * The same file lives in the product: product/printpal/src/components/ui/pal-greeting.ts. Keep them identical.
 */

export const GREETING_W = 440;
export const GREETING_H = 104;
const C0 = { x: 220, y: 58 };
const HB = 46;
const CARD = { x: 8, y: 14, w: 424, h: 84, r: 16 };

const GT = {
  pop0: 1.3,
  pop1: 1.45,
  content0: 2.4,
  tuck0: 2.45,
  tuck1: 2.7,
  down0: 2.85,
  down1: 3.45,
  blink2: 3.7,
  tint0: 3.85,
  tint1: 4.15,
  end: 4.4,
};

/** Total length of the greeting in milliseconds. */
export const GREETING_MS = GT.end * 1000;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

interface WarpStreak {
  xNorm: number;
  speed: number;
  len: number;
  thick: number;
  alpha: number;
  t0: number;
}
interface RingDot {
  a: number;
  j: number;
  s: number;
  al: number;
}

const PARTICLES = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const warps: WarpStreak[] = Array.from({ length: 70 }, () => ({
    xNorm: rnd(),
    speed: 400 + rnd() * 300,
    len: 6 + rnd() * 16,
    thick: 1 + rnd() * 0.5,
    alpha: 0.25 + rnd() * 0.55,
    t0: rnd() * 0.35,
  }));
  const ring: RingDot[] = Array.from({ length: 90 }, () => ({
    a: rnd() * Math.PI * 2,
    j: (rnd() - 0.5) * 0.22,
    s: 0.7 + rnd() * 0.9,
    al: 0.45 + rnd() * 0.55,
  }));
  return { warps, ring };
})();

/** Pal's body: the same soft squircle as pal.svg (cubic corners, handle ratio 0.671). */
function palBodyPath(h: number): Path2D {
  const k = 0.671 * h;
  const p = new Path2D();
  p.moveTo(0, -h);
  p.bezierCurveTo(k, -h, h, -k, h, 0);
  p.bezierCurveTo(h, k, k, h, 0, h);
  p.bezierCurveTo(-k, h, -h, k, -h, 0);
  p.bezierCurveTo(-h, -k, -k, -h, 0, -h);
  p.closePath();
  return p;
}

interface GreetingPose {
  hb: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  eye: "open" | "happy" | "content";
  open: number;
  lookX: number;
  lookY: number;
  handL: number;
  handR: number;
  wave: number;
  halo: number;
  haloBlue: number;
  card: number;
  iw: number;
}

function getGreetingPose(t: number): GreetingPose {
  const gx = seg(t, 0, 0.5);
  const g = Math.sin((Math.PI * gx) / 2) + 0.04 * Math.sin(Math.PI * gx) * gx;
  const iw = lerp(216, GREETING_W, g);

  const cx = C0.x;
  const cy = C0.y;
  const hb = t < 0.2 ? 0 : lerp(HB * 0.15, HB, E.back(seg(t, 0.2, 0.6)));

  const landY = cy + 0.12 * HB;
  const peakY = cy - 0.15 * HB;
  const dipY = cy + 0.36 * HB;
  const springY = cy - 0.1 * HB;
  const sinkY = cy + 0.3 * HB;
  const drift1 = cx - 0.16 * HB;
  const drift2 = cx - 0.45 * HB;
  const drift3 = cx - 0.57 * HB;
  const drift4 = cx - 0.85 * HB;

  let x: number;
  if (t < 0.85) x = cx;
  else if (t < 1.2) x = lerp(cx, drift1, E.inOut(seg(t, 0.85, 1.2)));
  else if (t < 1.3) x = lerp(drift1, drift2, E.in(seg(t, 1.2, 1.3)));
  else if (t < 1.45) x = lerp(drift2, drift3, E.inOut(seg(t, 1.3, 1.45)));
  else if (t < 2.4) x = lerp(drift3, drift4, E.inOut(seg(t, 1.45, 2.4)));
  else if (t < 2.85) x = drift4;
  else x = lerp(drift4, cx, E.inOut(seg(t, 2.85, 3.45)));

  let y: number;
  if (t < 0.2) y = 12;
  else if (t < 0.6) y = lerp(12, landY, E.in(seg(t, 0.2, 0.6)));
  else if (t < 0.73) y = lerp(landY, peakY, E.out(seg(t, 0.6, 0.73)));
  else if (t < 0.9) y = lerp(peakY, cy, E.inOut(seg(t, 0.73, 0.9)));
  else if (t < 1.2) y = cy;
  else if (t < 1.3) y = lerp(cy, dipY, E.in(seg(t, 1.2, 1.3)));
  else if (t < 1.45) y = lerp(dipY, springY, E.out(seg(t, 1.3, 1.45)));
  else if (t < 1.6) y = lerp(springY, cy, E.inOut(seg(t, 1.45, 1.6)));
  else if (t < 2.4) y = cy;
  else if (t < 2.7) y = lerp(cy, sinkY, E.inOut(seg(t, 2.4, 2.7)));
  else if (t < 2.85) y = sinkY;
  else y = lerp(sinkY, cy, E.inOut(seg(t, 2.85, 3.45)));

  if (t >= GT.pop1 && t < GT.tuck0) {
    const w = t - GT.pop1;
    y += Math.sin(w * 2 * Math.PI * 5) * 0.02 * HB * clamp(w / 0.08, 0, 1);
  }

  const landSqK = t >= 0.52 && t < 0.68 ? Math.sin(Math.PI * seg(t, 0.52, 0.68)) : 0;
  const bounceK = t >= 0.62 && t < 0.84 ? Math.sin(Math.PI * seg(t, 0.62, 0.84)) : 0;
  let sx = 1 + 0.14 * landSqK - 0.1 * bounceK;
  let sy = 1 - 0.14 * landSqK + 0.18 * bounceK;

  const plungeK = t >= 1.18 && t < 1.42 ? Math.sin(Math.PI * seg(t, 1.18, 1.42)) : 0;
  const springK = t >= 1.3 && t < 1.46 ? Math.sin(Math.PI * seg(t, 1.3, 1.46)) : 0;
  sx += 0.12 * plungeK - 0.18 * springK;
  sy -= 0.12 * plungeK - 0.25 * springK;

  let sinkK = 0;
  if (t >= 2.38 && t < 2.7) sinkK = E.inOut(seg(t, 2.38, 2.7));
  else if (t >= 2.7 && t < 2.85) sinkK = 1 - E.inOut(seg(t, 2.7, 2.85));
  sx += 0.18 * sinkK;
  sy -= 0.14 * sinkK;

  let eye: GreetingPose["eye"] = "open";
  if (t >= 0.55 && t < 0.8) eye = "happy";
  if (t >= GT.content0 && t < GT.tuck1) eye = "content";
  if (t >= GT.down0 && t < GT.down1) eye = "content";

  const blink = (tb: number) => {
    const k = seg(t, tb, tb + 0.12);
    return k > 0 && k < 1 ? 1 - Math.sin(Math.PI * k) * 0.94 : 1;
  };
  const open = Math.min(blink(1.95), blink(3.05), blink(GT.blink2));

  let lookX = 0;
  let lookY = 0;
  if (t >= GT.pop1 && t < GT.content0) {
    lookX = 0.55;
    lookY = -0.45;
  } else if (t >= GT.content0 && t < GT.down0) {
    lookX = -0.3;
    lookY = 0.6;
  } else if (t >= GT.down0 && t < GT.down1) {
    lookX = 0.3;
    lookY = 0.6;
  } else if (t >= GT.down1) {
    const k = E.inOut(seg(t, GT.down1, GT.down1 + 0.35));
    lookX = lerp(0.3, 0, k);
    lookY = lerp(0.6, 0, k);
  }

  // Pal keeps its hands out after they pop (they are part of its look); the right one waves.
  const handL = E.back(seg(t, GT.pop0, GT.pop0 + 0.14));
  const handR = E.back(seg(t, GT.pop0 + 0.04, GT.pop0 + 0.18));
  const wave = t >= GT.pop1 && t < GT.tuck1 ? t - GT.pop1 : -1;

  return {
    hb,
    x,
    y,
    sx,
    sy,
    eye,
    open,
    lookX,
    lookY,
    handL,
    handR,
    wave,
    halo: E.out(seg(t, 0.3, 0.7)),
    haloBlue: seg(t, GT.tint0, GT.tint1),
    card: seg(t, 0.18, 0.45),
    iw,
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** One of Pal's floating bean hands, centred at (hx, hy). */
function drawPalHand(ctx: CanvasRenderingContext2D, h: number, hx: number, hy: number, k: number, rot: number) {
  if (k <= 0.01) return;
  const rx = h * 0.187 * k;
  const ry = h * 0.265 * k;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -ry, 0, ry);
  g.addColorStop(0, "#FF915D");
  g.addColorStop(1, "#D24813");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPalHands(ctx: CanvasRenderingContext2D, h: number, p: GreetingPose) {
  // Left: pops out from behind the body, then floats.
  const lx = lerp(-h * 0.35, -h * 1.34, p.handL);
  let ly = lerp(h * 0.85, h * 0.32, p.handL);
  if (p.wave >= 0) {
    const rampIn = clamp(p.wave / 0.08, 0, 1);
    ly += Math.sin(p.wave * 2 * Math.PI * 2.5) * h * 0.06 * rampIn;
  }
  drawPalHand(ctx, h, lx, ly, p.handL, -0.21);

  // Right: pops out, lifts and waves, then lowers back.
  let rx = lerp(h * 0.35, h * 1.34, p.handR);
  let ry = lerp(h * 0.85, h * 0.32, p.handR);
  let rot = 0.21;
  if (p.wave >= 0) {
    const lift = E.out(clamp(p.wave / 0.18, 0, 1)) * (1 - E.inOut(seg(p.wave, GT.tuck0 - GT.pop1, GT.tuck1 - GT.pop1)));
    ry -= h * 0.62 * lift;
    rx += h * 0.06 * lift;
    rot = 0.21 + lift * (0.25 + Math.sin(p.wave * 2 * Math.PI * 2.5) * 0.42);
  }
  drawPalHand(ctx, h, rx, ry, p.handR, rot);
}

function drawGreetingPal(ctx: CanvasRenderingContext2D, p: GreetingPose) {
  const h = p.hb / 2;
  if (h <= 0.4) return;

  // Halo: warm PrintPal orange, cooling to print blue at the end.
  if (p.halo > 0) {
    const bl = p.haloBlue;
    const cr = Math.round(lerp(255, 40, bl));
    const cg = Math.round(lerp(140, 120, bl));
    const cb = Math.round(lerp(80, 208, bl));
    for (const [R, alpha] of [
      [h * 3.4, 0.26],
      [h * 5.6, 0.09],
    ] as const) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * p.halo})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.sx, p.sy);

  drawPalHands(ctx, h, p);

  // Body
  const body = palBodyPath(h);
  const bg = ctx.createLinearGradient(0, -h, 0, h);
  bg.addColorStop(0, "#FF8650");
  bg.addColorStop(0.55, "#E4531A");
  bg.addColorStop(1, "#C2400C");
  ctx.fillStyle = bg;
  ctx.fill(body);

  ctx.save();
  ctx.clip(body);

  // Soft top light
  ctx.save();
  ctx.translate(-h * 0.13, -h * 0.74);
  ctx.scale(1, 0.34);
  const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.61);
  gl.addColorStop(0, "rgba(255,255,255,0.34)");
  gl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.arc(0, 0, h * 0.61, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eyes
  const ew = h * 0.226;
  const eh = h * 0.484;
  const lx = p.lookX * h * 0.2;
  const ly = p.lookY * h * 0.14 - h * 0.177;
  ctx.fillStyle = "#1B1E22";
  ctx.strokeStyle = "#1B1E22";
  for (const sd of [-1, 1]) {
    ctx.save();
    ctx.translate(sd * h * 0.365 + lx, ly);
    if (p.eye === "happy" || p.eye === "content") {
      ctx.lineWidth = ew * 0.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (p.eye === "happy") ctx.arc(0, ew * 0.55, ew * 0.95, Math.PI * 1.15, Math.PI * 1.85);
      else ctx.arc(0, -ew * 0.45, ew * 0.95, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.scale(1, Math.max(0.08, p.open));
      ctx.beginPath();
      ctx.roundRect(-ew / 2, -eh / 2, ew, eh, ew / 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.arc(-h * 0.032, -h * 0.113, h * 0.042, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1B1E22";
    }
    ctx.restore();
  }

  // Warm cheeks when it smiles
  if (p.eye === "happy" || p.eye === "content") {
    ctx.fillStyle = "rgba(255, 196, 168, 0.55)";
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sd * h * 0.56 + lx, ly + h * 0.3, h * 0.13, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.restore();
}

function drawGreetingParticles(ctx: CanvasRenderingContext2D, t: number, p: GreetingPose) {
  if (t < 0.55) {
    const fadeOut = 1 - seg(t, 0.4, 0.55);
    ctx.lineCap = "butt";
    for (const s of PARTICLES.warps) {
      if (t < s.t0) continue;
      const yBot = (t - s.t0) * s.speed;
      const yTop = yBot - s.len;
      if (yBot <= 0) continue;
      const sx = C0.x - p.iw / 2 + s.xNorm * p.iw;
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * fadeOut})`;
      ctx.lineWidth = s.thick;
      ctx.beginPath();
      ctx.moveTo(sx, Math.max(0, yTop));
      ctx.lineTo(sx, Math.min(GREETING_H, yBot));
      ctx.stroke();
    }
  }

  const kRing = seg(t, 0.45, 0.45 + 1.35);
  if (kRing > 0 && kRing < 1) {
    const rx = lerp(10, 260, E.out(kRing));
    const ry = rx * 0.32;
    const fade = (1 - kRing) * (kRing < 0.08 ? kRing / 0.08 : 1) * p.card;
    for (const dot of PARTICLES.ring) {
      const r = 1 + dot.j;
      ctx.fillStyle = `rgba(255, 255, 255, ${dot.al * fade})`;
      ctx.fillRect(C0.x + Math.cos(dot.a) * rx * r, C0.y + Math.sin(dot.a) * ry * r, dot.s, dot.s);
    }
  }
}

/**
 * Runs the greeting on a canvas. Calls onComplete once when it ends.
 * Returns a cleanup function that stops the animation.
 */
export function runPalGreeting(canvas: HTMLCanvasElement, onComplete: () => void): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    onComplete();
    return () => {};
  }

  const dpr = window.devicePixelRatio || 1;
  const width = GREETING_W;
  const height = GREETING_H;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  let animId = 0;
  let done = false;
  const startMs = performance.now();

  const render = (now: number) => {
    const t = (now - startMs) / 1000;

    if (t >= GT.end) {
      if (!done) {
        done = true;
        onComplete();
      }
      return;
    }

    const p = getGreetingPose(t);
    const clientWidth = canvas.parentElement?.clientWidth || width;
    const scale = Math.min(1, clientWidth / width);

    ctx.save();
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ((clientWidth - width * scale) / 2) * dpr, 0);
    ctx.clearRect(0, 0, width, height);

    if (p.card > 0) {
      ctx.save();
      ctx.globalAlpha = p.card;
      roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r);
      ctx.fillStyle = "#141518";
      ctx.fill();
      ctx.restore();

      ctx.save();
      roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r);
      ctx.clip();
      drawGreetingParticles(ctx, t, p);
      ctx.restore();
    }

    drawGreetingPal(ctx, p);
    ctx.restore();

    animId = requestAnimationFrame(render);
  };

  animId = requestAnimationFrame(render);

  return () => {
    done = true;
    cancelAnimationFrame(animId);
  };
}
