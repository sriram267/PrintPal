// List (and with --delete, remove) files in src/components + src/db that nothing live reaches.
import fs from "node:fs";
import path from "node:path";
const APP = "C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal";
const del = process.argv.includes("--delete");
const all = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name).replace(/\\/g, "/"); if (e.isDirectory()) walk(p); else all.push(p); } })(APP + "/src");
const set = new Set(all);
const aliases = [["@/", APP + "/src/"], ["@ui/", APP + "/src/components/ui/"]];
const exts = ["", ".ts", ".tsx", ".js", ".mjs", ".css", ".json", "/index.ts", "/index.tsx"];
function resolve(from, spec) {
  let base;
  const a = aliases.find(([k]) => spec.startsWith(k));
  if (a) base = a[1] + spec.slice(a[0].length);
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec).replace(/\\/g, "/");
  else return null;
  for (const e of exts) if (set.has(base + e)) return base + e;
  return null;
}
const importRe = /(?:from\s+|import\s*\(\s*|import\s+|@import\s+(?:url\()?)["']([^"']+)["']/g;
const seen = new Set();
const queue = [APP + "/src/app/main.ts"];
// anything the tests / scripts / server point at by path also counts as live
const extra = [];
for (const d of ["tests", "scripts", "server"]) for (const f of fs.readdirSync(`${APP}/${d}`)) {
  if (!/\.(mjs|js|ts)$/.test(f)) continue;
  const t = fs.readFileSync(`${APP}/${d}/${f}`, "utf8");
  for (const x of all) { const b = path.basename(x); if (t.includes(b)) extra.push(x); }
}
queue.push(...extra);
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f)) continue; seen.add(f);
  if (!/\.(tsx?|css|mjs|js)$/.test(f)) continue;
  const t = fs.readFileSync(f, "utf8");
  let m; importRe.lastIndex = 0;
  while ((m = importRe.exec(t))) { const r = resolve(f, m[1]); if (r && !seen.has(r)) queue.push(r); }
}
const cand = all.filter((f) => /\/src\/(components|db)\//.test(f) && !seen.has(f));
console.log(cand.length + " unreachable files:");
for (const f of cand) console.log("  " + path.relative(APP, f).replace(/\\/g, "/"));
if (del) { for (const f of cand) fs.unlinkSync(f); console.log("deleted"); }
