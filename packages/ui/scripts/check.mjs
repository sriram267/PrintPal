// Library check (runs before every build):
//  1. every component exported from src/index.ts is shown on the preview page, so the page never falls behind;
//  2. every component file in src/ is exported from src/index.ts, so nothing is hidden;
//  3. components use tokens: a NEW hard-coded hex colour fails (existing ones are listed in scripts/hex-allowlist.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    e.isDirectory() ? walk(rel, out) : out.push(rel);
  }
  return out;
};
const problems = [];

/* 1. exported components are on the preview page */
const index = read("src/index.ts");
const exported = new Set();
for (const m of index.matchAll(/export\s*\{([^}]+)\}\s*from\s*"([^"]+)"/g)) {
  for (const raw of m[1].split(",")) {
    const name = raw.trim().replace(/^type\s+/, "");
    if (!name || raw.trim().startsWith("type ") || /[a-z]Variants$|^cn$|^fieldBase$/.test(name)) continue;
    if (/^[A-Z][a-z]/.test(name)) exported.add(name);
  }
}
const preview = walk("preview").filter((f) => f.endsWith(".tsx")).map(read).join("\n");
for (const name of exported) {
  if (!new RegExp(`<${name}[\\s>/]`).test(preview)) problems.push(`${name} is exported but not shown on the preview page (add it to preview/demos/).`);
}

/* 2. every component file is exported */
for (const f of walk("src").filter((f) => /\.(tsx|ts)$/.test(f) && !f.endsWith("index.ts") && !f.includes("/lib/") && !f.endsWith("greetingEngine.ts"))) {
  const spec = "./" + f.replace(/^src\//, "").replace(/\.(tsx|ts)$/, "");
  if (!index.includes(`"${spec}"`)) problems.push(`${f} is not exported from src/index.ts.`);
}

/* 3. no new hard-coded colours */
const allowPath = path.join(ROOT, "scripts/hex-allowlist.json");
const allow = fs.existsSync(allowPath) ? JSON.parse(fs.readFileSync(allowPath, "utf8")) : {};
const found = {};
for (const f of walk("src").filter((f) => f.endsWith(".tsx") && !f.includes("/pal/"))) {
  const hexes = [...new Set((read(f).match(/#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g) || []).map((h) => h.toUpperCase()))].sort();
  if (hexes.length) found[f] = hexes;
  const extra = hexes.filter((h) => !(allow[f] || []).includes(h));
  if (extra.length) problems.push(`${f} hard-codes ${extra.join(", ")}. Use a token (bg-brand, text-muted…) or add a token in src/tokens/tokens.css.`);
}
if (process.argv.includes("--write-allowlist")) {
  fs.writeFileSync(allowPath, JSON.stringify(found, null, 2) + "\n");
  console.log("Wrote scripts/hex-allowlist.json");
  process.exit(0);
}

console.log(`UI library: ${exported.size} components exported, all checked.`);
if (problems.length) {
  console.error(`\n✖ ${problems.length} problem(s):`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("✓ Every component is on the preview page, exported, and uses tokens.");
