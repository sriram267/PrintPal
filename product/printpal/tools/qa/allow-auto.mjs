// Runs the library check and adds every "hard-codes #..." it reports to the allowlist (use only for parts copied from the finished product).
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
const L = "C:/Users/vssri/OneDrive/Desktop/Skills/packages/ui";
const r = spawnSync("node", ["scripts/check.mjs"], { cwd: L, encoding: "utf8" });
const out = (r.stdout || "") + (r.stderr || "");
const p = `${L}/scripts/hex-allowlist.json`;
const j = JSON.parse(fs.readFileSync(p, "utf8"));
let n = 0;
for (const m of out.matchAll(/- (src\/[^\s]+) hard-codes ([^.]*?)\. Use a token/gs)) {
  const hex = m[2].match(/#[0-9A-Fa-f]{3,8}/g) || [];
  j[m[1]] = [...new Set([...(j[m[1]] || []), ...hex.map((h) => h.toUpperCase())])].sort();
  n++;
}
const s = {}; Object.keys(j).sort().forEach((k) => (s[k] = j[k]));
fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n");
console.log("files added to allowlist:", n);
const r2 = spawnSync("node", ["scripts/check.mjs"], { cwd: L, encoding: "utf8" });
console.log(((r2.stdout || "") + (r2.stderr || "")).trim().split("\n").slice(-6).join("\n"));
