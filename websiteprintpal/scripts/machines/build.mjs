/**
 * Builds the two hero machines (CNC router, wide-format printer) as isometric SVG with the
 * Anatomy kit (vendor/anatomy, MIT). Writes src/components/Scene/machines.generated.ts.
 *
 *   node scripts/machines/build.mjs
 *
 * World units are ~1 px; x and y on the floor, z up. Camera azimuth 45°, so +x runs to the
 * lower right and +y to the lower left; the +x and +y faces are the ones we see.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../src/components/Scene/machines.generated.ts");

const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const r1 = (n) => Math.round(n * 10) / 10;

/** Mirrors a whole figure left to right, so the machine faces the other way (both are placed facing the
 *  quote screen: the printer on the left, the CNC on the right). Parts the page animates sit inside this
 *  group, so they keep their own (unmirrored) coordinates; only the exported ports are mirrored. */
const mirrored = (parts, width) => `<g class="pp-flip" transform="translate(${width} 0) scale(-1 1)">${parts.join("")}</g>`;

/** Affine screen basis of a projection, so the page can place world points without the kit. */
function basisOf(P) {
  const o = k.iso([0, 0, 0], P);
  const ax = (v) => {
    const p = k.iso(v, P);
    return [p[0] - o[0], p[1] - o[1]];
  };
  return { o, x: ax([1, 0, 0]), y: ax([0, 1, 0]), z: ax([0, 0, 1]) };
}

/* ═════════════════════════════════ CNC ROUTER ═════════════════════════════════ */

function buildCnc() {
  const W = 280;
  const H = 300;
  const TABLE = { x: -112, y: -72, w: 224, d: 144, r: 3 };
  const LEG_TOP = 58;
  const APRON = [LEG_TOP, 78];
  const BED = k.insetPlan(TABLE, 11);
  const BED_TOP = APRON[1] + 4;
  const RAIL_Z = [APRON[1], APRON[1] + 8];
  const SHEET = { x: -82, y: -46, w: 152, d: 92, r: 1 };
  const SHEET_TOP = BED_TOP + 2.5;
  const GX0 = -18; // gantry rest x
  const CY0 = 0; // carriage rest y
  const SPX = 30; // spindle x offset from gantry
  const BEAM_Z = [152, 174];

  const P = k.fitProjection(
    [...k.boxCorners(TABLE, 0, BEAM_Z[1] + 10), [TABLE.x + TABLE.w + 9, 44, APRON[0] - 24], [-30, -78, BEAM_Z[1] + 6]],
    W,
    H,
    { pad: 6 }
  );
  const at = (p) => k.iso(p, P);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

  const out = [];

  /* halo + feet + legs */
  out.push(`<path class="iso-halo" d="${k.haloOf(TABLE, 0, 6, P)}"/>`);
  const legs = byDepth(k.corners(TABLE, 9));
  const legAt = (x, y) => {
    const s = [];
    s.push(S(k.cylinder(x, y, 7, 0, 2, P, 24), { tone: "lo" }));
    s.push(S(k.cylinder(x, y, 2.6, 2, 5, P, 14), { tone: "mid", crease: "none" }));
    s.push(S(k.cylinder(x, y, 4.6, 6.6, 2.4, P, 6), { tone: "mid" })); // lock nut
    s.push(S(k.slabOf({ x: x - 6, y: y - 6, w: 12, d: 12, r: 1.4 }, 9, LEG_TOP - 9, P, 3, 0.5), { tone: "mid" }));
    s.push(D([at([x + 6, y + 6, 18]), at([x + 6, y + 6, LEG_TOP - 8])], { size: 0.5, tone: "lo" }));
    return s.join("");
  };
  // back legs, back stretcher, side stretchers, front legs, front stretcher (painter's order)
  out.push(legAt(...legs[0]));
  out.push(S(k.slabOf({ x: TABLE.x + 15, y: TABLE.y + 6, w: TABLE.w - 30, d: 6, r: 1 }, 18, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(legAt(...legs[1]));
  out.push(legAt(...legs[2]));
  out.push(S(k.slabOf({ x: TABLE.x + 6, y: TABLE.y + 15, w: 6, d: TABLE.d - 30, r: 1 }, 18, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TABLE.x + TABLE.w - 12, y: TABLE.y + 15, w: 6, d: TABLE.d - 30, r: 1 }, 18, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TABLE.x + 15, y: TABLE.y + TABLE.d - 12, w: TABLE.w - 30, d: 6, r: 1 }, 18, 7, P, 3, 0.4), { tone: "mid" }));
  out.push(legAt(...legs[3]));

  /* apron (frame) with seams, screws and a label plate on the front face */
  out.push(
    S(k.slabOf(TABLE, APRON[0], APRON[1] - APRON[0], P, 4, 1), {
      tone: "mid",
      inner: L(k.sideSeam(TABLE, APRON[0] + 6, P, 4), { tone: "faint" }),
    })
  );
  const frontY = TABLE.y + TABLE.d;
  out.push(D([-100, -60, -20, 20, 60, 100].map((x) => at([x, frontY, APRON[0] + 13])), { size: 0.55, tone: "mid" }));
  const sideX = TABLE.x + TABLE.w;
  out.push(D([-60, -20, 20, 60].map((y) => at([sideX, y, APRON[0] + 13])), { size: 0.55, tone: "mid" }));
  // label plate (front face)
  const plate = { x0: -96, x1: -52 };
  out.push(
    `<path class="iso-fill pp-plate" d="${k.pathOf(
      [
        at([plate.x0, frontY + 0.2, APRON[0] + 4]),
        at([plate.x1, frontY + 0.2, APRON[0] + 4]),
        at([plate.x1, frontY + 0.2, APRON[0] + 16]),
        at([plate.x0, frontY + 0.2, APRON[0] + 16]),
      ],
      true
    )}"/>`
  );
  out.push(L(k.pathOf([at([plate.x0, frontY + 0.2, APRON[0] + 4]), at([plate.x1, frontY + 0.2, APRON[0] + 4]), at([plate.x1, frontY + 0.2, APRON[0] + 16]), at([plate.x0, frontY + 0.2, APRON[0] + 16])], true), { tone: "mid" }));
  [APRON[0] + 12.5].forEach((z) => out.push(L(k.segment([plate.x0 + 4, frontY + 0.3, z], [plate.x1 - 4, frontY + 0.3, z], P), { tone: "faint", free: true })));

  /* bed (spoilboard) with T-slots */
  out.push(S(k.slabOf(BED, APRON[1], BED_TOP - APRON[1], P, 3, 0.5), { tone: "mid", crease: "lo" }));
  for (let y = BED.y + 9; y < BED.y + BED.d - 4; y += 12) {
    out.push(L(k.lineOnTop([BED.x + 2, y], [BED.x + BED.w - 2, y], BED_TOP, P), { tone: "faint" }));
  }

  /* back rail (far) */
  const rail = (y) => {
    const s = [];
    s.push(S(k.slabOf({ x: TABLE.x + 2, y, w: TABLE.w - 4, d: 7, r: 1 }, RAIL_Z[0], RAIL_Z[1] - RAIL_Z[0], P, 3, 0.4), { tone: "mid" }));
    const t = k.topTicks(TABLE.x + 12, TABLE.x + TABLE.w - 12, 4, 5, y + 0.8, RAIL_Z[1], [1.6, 3], P);
    s.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    for (const x of [TABLE.x + 2, TABLE.x + TABLE.w - 8]) {
      s.push(S(k.slabOf({ x, y: y - 1, w: 6, d: 9, r: 1 }, RAIL_Z[1], 6, P, 2, 0.3), { tone: "mid" })); // end stop
      s.push(D([at([x + 3, y + 3.5, RAIL_Z[1] + 6])], { size: 0.5, tone: "mid" }));
    }
    return s.join("");
  };
  out.push(rail(TABLE.y + 1));

  /* the sheet (subject) and the cut */
  out.push(S(k.slabOf(SHEET, BED_TOP, SHEET_TOP - BED_TOP, P, 2), { tone: "hi", lit: true, className: "pp-sheet" }));
  out.push(D(k.corners(SHEET, 5).map(([x, y]) => at([x, y, SHEET_TOP])), { size: 0.6, tone: "mid" }));
  // hold-down clamps
  for (const [x, y] of [[SHEET.x + 30, SHEET.y - 1], [SHEET.x + SHEET.w - 30, SHEET.y - 1]]) {
    out.push(S(k.slabOf({ x: x - 5, y: y - 4, w: 10, d: 9, r: 1 }, SHEET_TOP, 2.4, P, 2, 0.3), { tone: "mid" }));
    out.push(D([at([x, y, SHEET_TOP + 2.4])], { size: 0.55, tone: "hi" }));
  }

  // Letter "P": outer outline then counter, in sheet coordinates (u right, v down) × scale
  const LS = 1.48;
  const L0 = [-38, -41];
  const arc = (cx, cy, r, a0, a1, n = 14) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = a0 + ((a1 - a0) * i) / n;
      return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
    });
  const outerUV = [[0, 0], [0, 56], [14, 56], [14, 34], [22, 34], ...arc(22, 17, 17, Math.PI / 2, -Math.PI / 2).slice(1), [0, 0]];
  const innerUV = [[14, 8], [22, 8], ...arc(22, 17, 9, -Math.PI / 2, Math.PI / 2).slice(1), [14, 26], [14, 8]];
  const toWorld = ([u, v]) => [L0[0] + u * LS, L0[1] + v * LS];
  const outer = outerUV.map(toWorld);
  const inner = innerUV.map(toWorld);
  // faint layout guide of the whole letter (always visible) + the live cut (revealed by the page)
  out.push(L(k.onTop(outer, SHEET_TOP, P, true) + k.onTop(inner, SHEET_TOP, P, true), { tone: "faint", dashed: true, className: "pp-guide" }));
  out.push(`<path class="pp-cut" data-part="cut-outer" d="${k.onTop(outer, SHEET_TOP, P)}"/>`);
  out.push(`<path class="pp-cut" data-part="cut-inner" d="${k.onTop(inner, SHEET_TOP, P)}"/>`);

  /* front rail (near) */
  out.push(rail(TABLE.y + TABLE.d - 8));

  /* controller box on the +x end: where the connector leaves */
  // hung at the back-right corner, so it is the machine's outermost point: the quote link leaves from here
  const CB = { x: sideX, y: -66, w: 8, d: 40, r: 1.5 };
  out.push(S(k.slabOf({ x: sideX, y: CB.y + 10, w: 4, d: 20, r: 1 }, APRON[0] - 4, 8, P, 2), { tone: "mid" })); // bracket
  out.push(S(k.slabOf(CB, APRON[0] - 22, 34, P, 3, 0.5), { tone: "mid" }));
  const face = sideX + CB.w;
  const quad = (x, y0, y1, z0, z1) => k.pathOf([at([x, y0, z0]), at([x, y1, z0]), at([x, y1, z1]), at([x, y0, z1])], true);
  out.push(`<path class="pp-screen" d="${quad(face + 0.2, CB.y + 5, CB.y + 27, APRON[0] - 2, APRON[0] + 8)}"/>`);
  out.push(`<path class="pp-screen-glow" data-part="screen" d="${quad(face + 0.25, CB.y + 7, CB.y + 25, APRON[0] - 0.5, APRON[0] + 6.5)}"/>`);
  out.push(D([[CB.y + 8, APRON[0] - 10], [CB.y + 15, APRON[0] - 10], [CB.y + 22, APRON[0] - 10]].map(([y, z]) => at([face + 0.3, y, z])), { size: 1.1, tone: "hi" }));
  out.push(D([at([face + 0.3, CB.y + 33, APRON[0] - 10])], { size: 1.6, tone: "hi" })); // e-stop
  out.push(`<circle class="pp-estop" cx="${r1(at([face + 0.3, CB.y + 33, APRON[0] - 10])[0])}" cy="${r1(at([face + 0.3, CB.y + 33, APRON[0] - 10])[1])}" r="1.3"/>`);
  const port = at([face, CB.y + 1, APRON[0] - 16]);

  /* gantry (moves along x) */
  const g = [];
  const gx = GX0;
  const block = (y) => S(k.slabOf({ x: gx - 16, y, w: 32, d: 11, r: 1.5 }, RAIL_Z[1], 9, P, 3, 0.4), { tone: "mid" });
  const upright = (y) =>
    S(k.slabOf({ x: gx - 11, y, w: 22, d: 6, r: 1.2 }, RAIL_Z[1] + 9, BEAM_Z[0] - RAIL_Z[1] - 9, P, 3, 0.5), {
      tone: "mid",
      inner: L(k.sideSeam({ x: gx - 11, y, w: 22, d: 6, r: 1.2 }, RAIL_Z[1] + 30, P, 3), { tone: "faint" }),
    });
  g.push(block(TABLE.y - 1), upright(TABLE.y + 1));
  g.push(block(TABLE.y + TABLE.d - 10), upright(TABLE.y + TABLE.d - 8));
  // X motor on the front upright
  const mY = TABLE.y + TABLE.d - 2;
  g.push(S(k.slabOf({ x: gx - 8, y: mY, w: 16, d: 13, r: 2 }, RAIL_Z[1] + 22, 16, P, 3, 0.4), { tone: "mid" }));
  g.push(L([4, 8, 12].map((dz) => k.segment([gx - 8, mY + 13, RAIL_Z[1] + 22 + dz], [gx + 8, mY + 13, RAIL_Z[1] + 22 + dz], P)).join(""), { tone: "faint" }));
  // beam + its rail on the +x face + a cable track on top
  const BEAM = { x: gx - 13, y: TABLE.y - 4, w: 26, d: TABLE.d + 8, r: 2 };
  g.push(
    S(k.slabOf(BEAM, BEAM_Z[0], BEAM_Z[1] - BEAM_Z[0], P, 4, 1), {
      tone: "mid",
      inner: L(k.sideSeam(BEAM, BEAM_Z[0] + 11, P, 4), { tone: "faint" }),
    })
  );
  g.push(S(k.slabOf({ x: gx + 13, y: TABLE.y + 4, w: 3, d: TABLE.d - 8, r: 0.8 }, BEAM_Z[0] + 5, 10, P, 2), { tone: "mid", crease: "none" }));
  g.push(D([-56, -28, 0, 28, 56].map((y) => at([gx + 16, y, BEAM_Z[0] + 10])), { size: 0.5, tone: "lo" }));
  g.push(S(k.slabOf({ x: gx - 6, y: TABLE.y + 2, w: 12, d: TABLE.d - 4, r: 1 }, BEAM_Z[1], 4, P, 2), { tone: "lo", crease: "none" }));
  for (let y = TABLE.y + 8; y < TABLE.y + TABLE.d - 4; y += 7) g.push(L(k.lineOnTop([gx - 6, y], [gx + 6, y], BEAM_Z[1] + 4, P), { tone: "faint" }));
  g.push(D([at([gx - 9, TABLE.y, BEAM_Z[1]]), at([gx - 9, TABLE.y + TABLE.d, BEAM_Z[1]])], { size: 0.55, tone: "mid" }));

  /* carriage + spindle (moves along y; the spindle lifts along z) */
  const c = [];
  const cy = CY0;
  const sx = gx + SPX;
  c.push(S(k.slabOf({ x: gx + 16, y: cy - 17, w: 7, d: 34, r: 1.5 }, BEAM_Z[0] - 22, BEAM_Z[1] - BEAM_Z[0] + 30, P, 3, 0.5), { tone: "mid" }));
  c.push(D([[-12, BEAM_Z[1] + 4], [12, BEAM_Z[1] + 4], [-12, BEAM_Z[0] - 16], [12, BEAM_Z[0] - 16]].map(([dy, z]) => at([gx + 23, cy + dy, z])), { size: 0.5, tone: "mid" }));
  const z = [];
  z.push(S(k.slabOf({ x: gx + 21, y: cy - 11, w: 8, d: 22, r: 1 }, 132, 10, P, 3, 0.4), { tone: "mid" })); // clamp
  z.push(D([at([gx + 29, cy - 7, 137]), at([gx + 29, cy + 7, 137])], { size: 0.5, tone: "hi" }));
  z.push(S(k.cylinder(sx, cy, 11, 108, 46, P, 40, 0.6), { tone: "mid", inner: L(k.sideArc(sx, cy, 11, 120, P, 24), { tone: "faint" }) }));
  z.push(L(k.knurl(sx, cy, 11, 140, 154, 36, P, 0.6), { tone: "lo" }));
  z.push(S(k.cylinder(sx, cy, 7.5, 154, 4, P, 32, 0.4), { tone: "mid" }));
  z.push(S(k.cylinder(sx + 2, cy + 2, 2, 158, 4, P, 14), { tone: "mid" })); // cable gland
  z.push(L(k.ring(sx, cy, 4, 158, P, 24), { tone: "faint" }));
  z.push(S(k.cylinder(sx, cy, 5.2, 100, 8, P, 6), { tone: "mid" })); // collet nut (hex)
  z.push(S(k.cylinder(sx, cy, 11.5, 92, 8, P, 40), { tone: "lo", crease: "none" })); // dust shoe brush
  z.push(L(k.knurl(sx, cy, 11.5, 92, 100, 64, P, 0.2), { tone: "faint" }));
  z.push(S(k.cylinder(sx, cy, 1.6, SHEET_TOP, 92 - SHEET_TOP, P, 12), { tone: "hi", className: "pp-bit" }));
  z.push(`<g class="pp-chips" data-part="chips">${[[-5, 3], [4, -4], [6, 4], [-3, -6], [1, 7]].map(([dx, dy]) => {
    const p = at([sx + dx, cy + dy, SHEET_TOP + 1]);
    return `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="0.9"/>`;
  }).join("")}</g>`);

  c.push(`<g data-part="z">${z.join("")}</g>`);
  g.push(`<g data-part="carriage">${c.join("")}</g>`);
  out.push(`<g data-part="gantry">${g.join("")}</g>`);

  const svg = k.figureSvg({
    width: W,
    height: H,
    label: "A CNC router cutting the letter P from an ACP sheet: the gantry and spindle trace the letter, and the cut feeds the fabrication lines of the quote.",
    body: [mirrored(out, W)],
    className: "pp-machine pp-cnc",
  });

  return {
    svg,
    width: W,
    height: H,
    basis: basisOf(P),
    rest: { gx: GX0, cy: CY0, spx: SPX },
    toolpath: { outer, inner },
    port: [W - port[0], port[1]],
  };
}

/* ═════════════════════════════ WIDE-FORMAT PRINTER ═════════════════════════════ */

function buildPrinter() {
  const W = 300;
  const H = 290;
  const BODY = { x: -118, y: -34, w: 236, d: 62, r: 6 };
  const BODY_Z = [98, 124];
  const HEAD = { x: -114, y: -34, w: 228, d: 32, r: 9 };
  const HEAD_Z = [124, 152];
  const LIP_Y = BODY.y + BODY.d; // 28
  const MEDIA = { x0: -94, x1: 94, y: LIP_Y + 1, z0: 50, z1: 114 };
  const CARRIAGE_X0 = -60;

  const P = k.fitProjection(
    [...k.boxCorners({ x: -134, y: -38, w: 268, d: 70, r: 0 }, 0, 156)],
    W,
    H,
    { pad: 6 }
  );
  const at = (p) => k.iso(p, P);
  const out = [];

  out.push(`<path class="iso-halo" d="${k.haloOf({ x: -130, y: -36, w: 260, d: 72, r: 8 }, 0, 6, P)}"/>`);

  /* stand: feet bars, casters, legs, stretcher (back to front) */
  const standAt = (x) => {
    const s = [];
    s.push(S(k.cylinder(x + 6, -26, 4.5, 0, 6, P, 20), { tone: "lo" }));
    s.push(S(k.slabOf({ x, y: -32, w: 12, d: 64, r: 2 }, 6, 8, P, 3, 0.5), { tone: "mid" }));
    s.push(S(k.cylinder(x + 6, 26, 4.5, 0, 6, P, 20), { tone: "lo" }));
    s.push(S(k.slabOf({ x: x + 2, y: -5, w: 8, d: 10, r: 1.2 }, 14, BODY_Z[0] - 14, P, 3, 0.5), { tone: "mid" }));
    s.push(D([at([x + 10, 5, 30]), at([x + 10, 5, 80])], { size: 0.5, tone: "lo" }));
    return s.join("");
  };
  out.push(standAt(-110));
  out.push(S(k.slabOf({ x: -100, y: -3, w: 200, d: 6, r: 1 }, 36, 6, P, 3, 0.4), { tone: "mid" }));
  out.push(standAt(98));

  /* take-up roll brackets + roll (turned part along x) */
  for (const x of [-104, 96]) out.push(S(k.slabOf({ x, y: 4, w: 8, d: 32, r: 1.5 }, 44, 8, P, 3, 0.4), { tone: "mid" }));
  const ROLL_F = G.frameOf([-98, 32, 50], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(G.solidOf([[0, 3.5], [4, 3.5], [4, 9], [192, 9], [192, 3.5], [196, 3.5]], ROLL_F, P), {
    tone: "mid",
    inner: L(G.arcOf(ROLL_F, 6, 9, P) + G.arcOf(ROLL_F, 190, 9, P), { tone: "faint" }),
  }));

  /* end housings: the -x one is the far end, so it is painted before the chassis */
  const end = (x) =>
    S(k.slabOf({ x, y: -38, w: 18, d: 70, r: 5 }, BODY_Z[0] - 4, HEAD_Z[1] + 4 - BODY_Z[0] + 4, P, 5, 0.8), {
      tone: "mid",
      inner: L(k.sideSeam({ x, y: -38, w: 18, d: 70, r: 5 }, BODY_Z[0] + 14, P, 5), { tone: "faint" }),
    });
  out.push(end(-134));

  /* chassis */
  out.push(
    S(k.slabOf(BODY, BODY_Z[0], BODY_Z[1] - BODY_Z[0], P, 6, 1), {
      tone: "mid",
      inner: L(k.sideSeam(BODY, BODY_Z[0] + 8, P, 6), { tone: "faint" }),
    })
  );
  // vents on the front face
  for (let x = -100; x <= -60; x += 5) out.push(L(k.segment([x, LIP_Y, BODY_Z[0] + 2.5], [x, LIP_Y, BODY_Z[0] + 6.5], P), { tone: "lo" }));
  out.push(D([-108, 108].map((x) => at([x, LIP_Y, BODY_Z[0] + 17])), { size: 0.55, tone: "mid" }));

  /* platen + carriage rail */
  out.push(S(k.slabOf({ x: -108, y: 0, w: 216, d: LIP_Y - 2, r: 2 }, BODY_Z[1], 1.4, P, 2), { tone: "lo", crease: "none" }));
  for (let x = -100; x <= 100; x += 8) out.push(L(k.lineOnTop([x, 4, ], [x, LIP_Y - 5], BODY_Z[1] + 1.4, P), { tone: "faint" }));
  out.push(S(k.slabOf({ x: -110, y: -4, w: 220, d: 5, r: 1 }, BODY_Z[1], 9, P, 2, 0.3), { tone: "mid" }));

  /* head housing (behind the rail) */
  out.push(
    S(k.slabOf(HEAD, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0], P, 8, 1.2), {
      tone: "mid",
      inner: L(k.sideSeam(HEAD, HEAD_Z[1] - 7, P, 8), { tone: "faint" }),
    })
  );
  out.push(L(k.planOutline(k.insetPlan(HEAD, 6), HEAD_Z[1], P, 8), { tone: "faint" }));
  out.push(D(k.corners(HEAD, 9).map(([x, y]) => at([x, y, HEAD_Z[1]])), { size: 0.55, tone: "mid" }));

  /* print carriage (moves along x) */
  const cx = CARRIAGE_X0;
  const car = [];
  car.push(S(k.slabOf({ x: cx - 13, y: -6, w: 26, d: 18, r: 2.5 }, BODY_Z[1] + 2, 18, P, 3, 0.6), { tone: "hi", lit: true, className: "pp-head" }));
  car.push(L(k.sideSeam({ x: cx - 13, y: -6, w: 26, d: 18, r: 2.5 }, BODY_Z[1] + 9, P, 3), { tone: "faint" }));
  car.push(`<g class="pp-inks">${["c", "m", "y", "k"].map((ink, i) => {
    const p = at([cx - 7.5 + i * 5, 3, BODY_Z[1] + 20]);
    return `<circle data-ink="${ink}" cx="${r1(p[0])}" cy="${r1(p[1])}" r="1.5"/>`;
  }).join("")}</g>`);
  car.push(L(k.segment([cx, -6, BODY_Z[1] + 20], [cx, -14, HEAD_Z[1] + 2], P), { tone: "lo" })); // ink tube to housing
  out.push(`<g data-part="head">${car.join("")}</g>`);

  /* media: hangs from the lip to the roll; the print scrolls on its face */
  const mq = k.pathOf(
    [at([MEDIA.x0, MEDIA.y, MEDIA.z1]), at([MEDIA.x1, MEDIA.y, MEDIA.z1]), at([MEDIA.x1, MEDIA.y, MEDIA.z0]), at([MEDIA.x0, MEDIA.y, MEDIA.z0])],
    true
  );
  out.push(`<path class="pp-media" d="${mq}"/>`);
  out.push(`<clipPath id="pp-media-clip"><path d="${mq}"/></clipPath>`);
  // print drawn in face coordinates: x along +x, y downward from the lip
  const tile = (oy) =>
    [
      `<rect x="0" y="${oy + 4}" width="188" height="26" rx="2" class="pp-p-bg"/>`,
      `<circle cx="22" cy="${oy + 17}" r="9" class="pp-p-orange"/>`,
      `<rect x="38" y="${oy + 10}" width="96" height="6" rx="3" class="pp-p-blue"/>`,
      `<rect x="38" y="${oy + 20}" width="62" height="4" rx="2" class="pp-p-blue2"/>`,
      `<rect x="150" y="${oy + 9}" width="28" height="16" rx="3" class="pp-p-orange2"/>`,
      `<rect x="0" y="${oy + 36}" width="188" height="3" class="pp-p-rule"/>`,
    ].join("");
  const faceM = k.sideMatrix([MEDIA.x0, MEDIA.y + 0.1], MEDIA.z1, P, "left");
  out.push(
    `<g clip-path="url(#pp-media-clip)"><g transform="${faceM}"><g data-part="print">${tile(-44)}${tile(0)}${tile(44)}${tile(88)}</g></g></g>`
  );
  out.push(L(mq, { tone: "mid" }));
  // media wraps the roll
  out.push(L(G.arcOf(ROLL_F, 6, 9.6, P), { tone: "mid" }));

  /* lip + end housings + control panel (right end is nearest) */
  out.push(S(k.slabOf({ x: -112, y: LIP_Y - 3, w: 224, d: 4, r: 1 }, BODY_Z[0] + 10, 6, P, 2, 0.3), { tone: "mid" }));
  out.push(end(116));
  const top = HEAD_Z[1] + 4;
  // control panel on the right end's top: screen, buttons, ink slots
  const scr = [[119, -8], [131, -8], [131, 12], [119, 12]];
  out.push(`<path class="pp-screen" d="${k.onTop(scr, top + 0.1, P, true)}"/>`);
  out.push(`<path class="pp-screen-glow pp-screen-blue" data-part="pscreen" d="${k.onTop([[120.5, -6], [129.5, -6], [129.5, 10], [120.5, 10]], top + 0.15, P, true)}"/>`);
  out.push(D([[125, 18], [125, 24]].map(([x, y]) => at([x, y, top])), { size: 1.2, tone: "hi" }));
  out.push(`<g class="pp-inks">${["c", "m", "y", "k"].map((ink, i) => {
    const p = at([125, -30 + i * 5, top]);
    return `<circle data-ink="${ink}" cx="${r1(p[0])}" cy="${r1(p[1])}" r="1.6"/>`;
  }).join("")}</g>`);
  out.push(L(k.lineOnTop([118, -14], [132, -14], top, P), { tone: "faint" }));
  out.push(D([at([116 + 9, 32, BODY_Z[0] + 30])], { size: 0.55, tone: "mid" }));

  const port = at([MEDIA.x0 - 6, LIP_Y + 4, 54]);

  const svg = k.figureSvg({
    width: W,
    height: H,
    label: "A wide-format printer: the head shuttles across the platen and printed media scrolls out onto the take-up roll, feeding the print lines of the quote.",
    body: [mirrored(out, W)],
    className: "pp-machine pp-printer",
  });

  return {
    svg,
    width: W,
    height: H,
    basis: basisOf(P),
    rest: { headX: CARRIAGE_X0, headRange: [-92, 92], tile: 44 },
    port: [W - port[0], port[1]],
  };
}

const cnc = buildCnc();
const printer = buildPrinter();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `/* eslint-disable */\n// Generated by scripts/machines/build.mjs with the Anatomy kit (vendor/anatomy, MIT). Do not edit.\n\n` +
    `type V = [number, number];\ntype Basis = { o: V; x: V; y: V; z: V };\n\n` +
    `export const CNC: { svg: string; width: number; height: number; basis: Basis; rest: { gx: number; cy: number; spx: number }; toolpath: { outer: V[]; inner: V[] }; port: V } = ${JSON.stringify(cnc)};\n\n` +
    `export const PRINTER: { svg: string; width: number; height: number; basis: Basis; rest: { headX: number; headRange: V; tile: number }; port: V } = ${JSON.stringify(printer)};\n`
);
console.log(`wrote ${OUT} (cnc ${(cnc.svg.length / 1024).toFixed(0)} KB, printer ${(printer.svg.length / 1024).toFixed(0)} KB)`);
