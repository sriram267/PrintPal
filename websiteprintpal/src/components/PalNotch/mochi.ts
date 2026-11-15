/**
 * Mochi greeting: the Pal notch entrance animation.
 *
 * Ported unchanged from the product (product/printpal/src/components/ui/pal-notch.tsx,
 * "Coucou Mochi Entrance Animation Kinematics & Pure 2D Canvas Engine").
 * If the product's animation changes, mirror it here.
 */

export const GREETING_W = 440;
export const GREETING_H = 104;
const C0 = { x: 220, y: 58 };
const HB = 42;
const ASPECT = 1.34;
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

function mochiSquirclePath(hw: number, hh: number): Path2D {
  const n = 3.2;
  const p = new Path2D();
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const px = hw * (ca < 0 ? -1 : 1) * Math.pow(Math.abs(ca), 2 / n);
    const py = hh * (sa < 0 ? -1 : 1) * Math.pow(Math.abs(sa), 2 / n);
    if (i === 0) p.moveTo(px, py);
    else p.lineTo(px, py);
  }
  p.closePath();
  return p;
}

interface GreetingPose {
  hb: number;
  x: number;
  y: number;
  sx: number;
  sy: number;
  tilt: number;
  eye: "dot" | "happy" | "content";
  open: number;
  eyeRoll: number;
  lookX: number;
  lookY: number;
  handL: number;
  handR: number;
  wave: number;
  tint: number;
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

  let eye: "dot" | "happy" | "content" = "dot";
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

  const handL =
    t < GT.tuck0
      ? E.back(seg(t, GT.pop0, GT.pop0 + 0.14))
      : 1 - E.in(seg(t, GT.tuck0, GT.tuck1 - 0.03));
  const handR =
    t < GT.tuck0
      ? E.back(seg(t, GT.pop0 + 0.04, GT.pop0 + 0.18))
      : 1 - E.in(seg(t, GT.tuck0 + 0.03, GT.tuck1));
  const wave = t >= GT.pop1 && t < GT.tuck0 ? t - GT.pop1 : -1;

  return {
    hb,
    x,
    y,
    sx,
    sy,
    tilt: 0,
    eye,
    open,
    eyeRoll: 0,
    lookX,
    lookY,
    handL,
    handR,
    wave,
    tint: 0.6 * E.inOut(seg(t, GT.tint0, GT.tint1)),
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

function whiteBodyFill(ctx: CanvasRenderingContext2D, path: Path2D, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "rgb(251, 251, 252)");
  g.addColorStop(1, "rgb(231, 233, 236)");
  ctx.fillStyle = g;
  ctx.fill(path);
}

function drawMochiHandL(ctx: CanvasRenderingContext2D, hw: number, hh: number, p: GreetingPose) {
  if (p.handL <= 0.01) return;
  const hb = hh * 2;
  const r = hb * 0.15 * p.handL;
  const hx = lerp(-hw * 0.35, -hw - hb * 0.22, p.handL);
  let hy = lerp(hh * 0.85, hh * 0.62, p.handL);
  if (p.wave >= 0) {
    const rampIn = clamp(p.wave / 0.08, 0, 1);
    const rampOut = 1 - clamp((p.wave - (GT.tuck0 - GT.pop1)) / (GT.tuck1 - GT.tuck0), 0, 1);
    hy += Math.sin(p.wave * 2 * Math.PI * 5) * hb * 0.14 * rampIn * rampOut;
  }
  ctx.save();
  ctx.translate(hx, hy);
  const circ = new Path2D();
  circ.ellipse(0, 0, r, r, 0, 0, Math.PI * 2);
  whiteBodyFill(ctx, circ, r, -r, -r, r);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 0.8;
  ctx.stroke(circ);
  ctx.restore();
}

function drawMochiHandR(ctx: CanvasRenderingContext2D, hw: number, hh: number, p: GreetingPose) {
  if (p.handR <= 0.01) return;
  const hb = hh * 2;
  const L = hb * 0.4 * p.handR;
  const T = hb * 0.22 * p.handR;
  const hx = lerp(hw * 0.35, hw + hb * 0.2, p.handR);
  const hy = lerp(hh * 0.85, hh * 0.2, p.handR);
  const ang = p.wave >= 0 ? -0.61 + Math.sin(p.wave * 2 * Math.PI * 2.5) * 0.04 : -0.61;

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(ang);
  roundRect(ctx, -L / 2, -T / 2, L, T, T / 2);
  const g = ctx.createLinearGradient(L / 2, -T / 2, -L / 2, T / 2);
  g.addColorStop(0, "rgb(251, 251, 252)");
  g.addColorStop(1, "rgb(231, 233, 236)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawGreetingMochi(ctx: CanvasRenderingContext2D, p: GreetingPose) {
  const hh = p.hb / 2;
  const hw = hh * ASPECT;
  if (hh <= 0.4) return;

  // Halo: golden to cyan-blue aura
  if (p.halo > 0) {
    const bl = p.haloBlue;
    const cr = Math.round(lerp(232, 59, bl));
    const cg = Math.round(lerp(195, 158, bl));
    const cb = Math.round(lerp(154, 255, bl));
    for (const [R, alpha] of [
      [hw * 2.6, 0.22],
      [hw * 4.2, 0.08],
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
  ctx.rotate(p.tilt);
  ctx.scale(p.sx, p.sy);

  drawMochiHandL(ctx, hw, hh, p);
  drawMochiHandR(ctx, hw, hh, p);

  const body = mochiSquirclePath(hw, hh);
  whiteBodyFill(ctx, body, hw * 0.6, -hh, -hw * 0.6, hh);

  if (p.tint > 0) {
    const g = ctx.createLinearGradient(0, hh, 0, -hh * 0.1);
    g.addColorStop(0, `rgba(127, 180, 234, ${p.tint})`);
    g.addColorStop(1, "rgba(127, 180, 234, 0)");
    ctx.fillStyle = g;
    ctx.fill(body);
  }

  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = "#16171A";
  ctx.strokeStyle = "#16171A";
  const er = p.hb * 0.06;
  const sp = p.hb * 0.19;
  const lx = p.lookX * hw * 0.42;
  const ly = p.lookY * hh * 0.28 + hh * 0.12 + p.eyeRoll * hh * 1.25;

  for (const sd of [-1, 1]) {
    ctx.save();
    ctx.translate(sd * sp + lx, ly);
    if (p.eye === "happy") {
      ctx.lineWidth = er * 0.95;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, er * 0.6, er * 1.25, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    } else if (p.eye === "content") {
      ctx.lineWidth = er * 0.95;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, -er * 0.5, er * 1.25, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.scale(1, Math.max(0.12, p.open));
      ctx.beginPath();
      ctx.arc(0, 0, er, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (p.eye === "happy" || p.eye === "content") {
    for (const sd of [-1, 1]) {
      ctx.save();
      ctx.translate(sd * (sp + er * 1.1) + lx, ly + er * 1.5);
      ctx.fillStyle = "rgba(255, 120, 150, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 0, er * 1.2, er * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
export function runMochiGreeting(canvas: HTMLCanvasElement, onComplete: () => void): () => void {
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

    drawGreetingMochi(ctx, p);
    ctx.restore();

    animId = requestAnimationFrame(render);
  };

  animId = requestAnimationFrame(render);

  return () => {
    done = true;
    cancelAnimationFrame(animId);
  };
}
