// usage: node swap.mjs <part> [<part>...]
// Rewrites every product import of src/components/ui/<part> into one merged import from "@printpal/ui",
// checks the library really exports each name, and deletes the product's own <part> file.
import fs from "node:fs";
import path from "node:path";
const APP = "C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal";
const LIB = "C:/Users/vssri/OneDrive/Desktop/Skills/packages/ui/src/index.ts";
const parts = process.argv.slice(2);
const idx = fs.readFileSync(LIB, "utf8");
const exported = new Set();
for (const m of idx.matchAll(/export\s*\{([^}]*)\}\s*from/g)) for (const n of m[1].split(",")) { const x = n.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop(); if (x) exported.add(x); }
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name).replace(/\\/g, "/"); if (e.isDirectory()) walk(p); else if (/\.(tsx?)$/.test(e.name)) files.push(p); } })(APP + "/src");
const partRe = parts.map((p) => p.replace(/[-]/g, "\\-")).join("|");
const impRe = new RegExp(String.raw`import\s+(type\s+)?\{([^}]*)\}\s+from\s+(["'])(?:@ui/|@/components/ui/|(?:\.\./)+components/ui/|\./)(${partRe})\3;?[ \t]*\r?\n?`, "g");
let changed = 0, bad = [];
for (const f of files) {
  if (parts.some((p) => f.endsWith(`/components/ui/${p}.tsx`))) continue;
  let t = fs.readFileSync(f, "utf8");
  // a "./x" import only counts inside components/ui
  const names = [];
  let first = -1;
  const nl = t.includes("\r\n") ? "\r\n" : "\n";
  const out = t.replace(impRe, (m, typeKw, list, q, part, off) => {
    if (m.includes(`from ${q}./`) && !f.includes("/components/ui/")) return m;
    for (const n of list.split(",").map((s) => s.trim()).filter(Boolean)) {
      const base = n.replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      if (!exported.has(base)) bad.push(`${path.relative(APP, f)}: ${base} (from ${part})`);
      names.push(typeKw && !n.startsWith("type ") ? "type " + n : n);
    }
    if (first < 0) first = off;
    return "\u0000MARK\u0000" + (/\n$/.test(m) ? nl : "");
  });
  if (!names.length) continue;
  const uniq = [...new Set(names)];
  // merge with an existing @printpal/ui import if there is one
  const ex = /import\s+\{([^}]*)\}\s+from\s+"@printpal\/ui";?[ \t]*\r?\n?/.exec(out);
  let res;
  if (ex) {
    const all = [...new Set([...ex[1].split(",").map((s) => s.trim()).filter(Boolean), ...uniq])];
    res = out.replace(ex[0], "").replace(/\u0000MARK\u0000\r?\n?/g, "");
    res = res.replace(/^/, "") ;
    // put merged import where the first original import was (the MARK), else at the existing spot
    const merged = `import { ${all.join(", ")} } from "@printpal/ui"${nl}`;
    const at = out.indexOf("\u0000MARK\u0000");
    const exAt = out.indexOf(ex[0]);
    const pos = Math.min(at, exAt);
    let base = out.replace(ex[0], "").replace(/\u0000MARK\u0000\r?\n?/g, "");
    res = base.slice(0, pos) + merged + base.slice(pos);
  } else {
    res = out.replace("\u0000MARK\u0000", `import { ${uniq.join(", ")} } from "@printpal/ui"`).replace(/\u0000MARK\u0000\r?\n?/g, "");
    if (!/"@printpal\/ui"\r?\n/.test(res)) res = res.replace(/(from "@printpal\/ui")(?!\r?\n)/, "$1");
  }
  fs.writeFileSync(f, res);
  changed++;
}
for (const p of parts) { const f = `${APP}/src/components/ui/${p}.tsx`; if (fs.existsSync(f)) fs.unlinkSync(f); }
console.log("files rewritten:", changed);
if (bad.length) { console.log("NOT EXPORTED BY THE LIBRARY:"); bad.forEach((b) => console.log("  " + b)); process.exitCode = 1; }
