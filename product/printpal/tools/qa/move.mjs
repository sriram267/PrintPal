// Move files with `git mv` and rewrite every import that points at (or from) them.
// usage: node move.mjs <moves.json>   (moves = [[from, to], ...] relative to product/printpal)
// Resolution uses the BEFORE-move file list; rewrites keep the original style (alias vs relative, extension or not).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const APP = "C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal";
const moves = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const abs = (r) => path.resolve(APP, r).replace(/\\/g, "/");
const rel = (a) => path.relative(APP, a).replace(/\\/g, "/");
const moved = new Map(moves.map(([a, b]) => [abs(a), abs(b)]));
for (const [a] of moves) if (!fs.existsSync(abs(a))) throw new Error("missing: " + a);

// all code files before the move
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) { if (!["node_modules", "dist", ".wrangler", "data"].includes(e.name)) walk(p); }
    else if (/\.(tsx?|mjs|js|css)$/.test(p)) files.push(p);
  }
})(APP + "/src");
for (const d of ["server", "tests", "scripts"]) for (const f of fs.readdirSync(`${APP}/${d}`)) if (/\.(mjs|js|ts)$/.test(f)) files.push(`${APP}/${d}/${f}`);
const exists = new Set(files.map((f) => f));
for (const f of fs.readdirSync(APP + "/src", { recursive: true })) { const p = (APP + "/src/" + f).replace(/\\/g, "/"); if (fs.statSync(p).isFile()) exists.add(p); }

const ALIASES = [["@/components/", "src/components/"], ["@ui-library/", "src/"], ["@ui/", "src/components/ui/"], ["@/", "src/"]];
const EXTS = ["", ".ts", ".tsx", ".mjs", ".js", ".json", ".css", "/index.ts", "/index.tsx"];
function resolve(importer, spec) {
  let base, alias = null;
  if (spec.startsWith(".")) base = path.resolve(path.dirname(importer), spec).replace(/\\/g, "/");
  else { const a = ALIASES.find(([p]) => spec.startsWith(p)); if (!a) return null; alias = a; base = abs(a[1] + spec.slice(a[0].length)); }
  for (const e of EXTS) if (exists.has(base + e)) return { target: base + e, ext: e, alias };
  return null;
}
const RE = /((?:from|import)\s*\(?\s*|require\(\s*)(["'])([^"'\n]+)\2/g;
const out = new Map(); // newPath -> content
let changed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const newF = moved.get(f) ?? f;
  let text = src.replace(RE, (m, pre, q, spec) => {
    const r = resolve(f, spec);
    if (!r) return m;
    const newT = moved.get(r.target) ?? r.target;
    if (newT === r.target && newF === f) return m; // nothing moved
    if (r.alias && newT === r.target) return m; // alias still valid
    let s;
    if (r.alias) s = "@/" + path.relative(abs("src"), newT).replace(/\\/g, "/");
    else { s = path.relative(path.dirname(newF), newT).replace(/\\/g, "/"); if (!s.startsWith(".")) s = "./" + s; }
    // keep the original style: no extension stays no extension; index imports stay folder imports
    if (r.ext === "" ) { /* spec had its extension: keep the new file's real extension */ }
    else if (r.ext.startsWith("/index")) s = s.replace(/\/index\.(tsx?)$/, "");
    else s = s.replace(/\.(tsx?|js)$/, "");
    changed++;
    return `${pre}${q}${s}${q}`;
  });
  if (text !== src || newF !== f) out.set(newF, { text, from: f });
}
// move, then write
for (const [a, b] of moves) {
  fs.mkdirSync(path.dirname(abs(b)), { recursive: true });
  execFileSync("git", ["mv", abs(a), abs(b)], { cwd: APP });
}
for (const [p, { text }] of out) fs.writeFileSync(p, text, "utf8");
console.log(`moved ${moves.length} files, rewrote ${changed} import(s) across ${out.size} file(s)`);
