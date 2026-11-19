// Pixel-compare a run against the baseline. Known-unstable screens also match any stored variant (a3/variants/<name>-N.png).
// usage: node compare.mjs <baselineDir> <runDir> [diffDir]
import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
const [, , A, B, D] = process.argv;
const V = "C:/Users/vssri/AppData/Local/Temp/claude/37d623c9cbf993e5/df20edba-393c-40ce-8465-2db6fc71f303/scratchpad/a3/variants";
const NOISE = 10;
if (D) fs.mkdirSync(D, { recursive: true });
const load = (p) => PNG.sync.read(fs.readFileSync(p));
let same = 0, diff = 0;
for (const f of fs.readdirSync(A).filter((x) => x.endsWith(".png")).sort()) {
  if (!fs.existsSync(`${B}/${f}`)) { console.log(`MISSING  ${f}`); diff++; continue; }
  const b = load(`${B}/${f}`);
  const refs = [`${A}/${f}`, ...fs.readdirSync(V).filter((v) => v.startsWith(f.replace(".png", "-"))).map((v) => `${V}/${v}`)];
  let best = Infinity, bestOut = null;
  for (const r of refs) {
    const a = load(r);
    if (a.width !== b.width || a.height !== b.height) continue;
    const out = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.05 });
    if (n < best) { best = n; bestOut = out; }
  }
  if (best <= NOISE) same++;
  else { diff++; console.log(`DIFF     ${f}: ${best} px`); if (D && bestOut) fs.writeFileSync(`${D}/${f}`, PNG.sync.write(bestOut)); }
}
console.log(`identical: ${same}, different: ${diff}`);
