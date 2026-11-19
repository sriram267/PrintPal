// usage: node allow.mjs <file relative to packages/ui> <hex> [<hex>...]   (adds hex values to the library's allowlist)
import fs from "node:fs";
const p = "C:/Users/vssri/OneDrive/Desktop/Skills/packages/ui/scripts/hex-allowlist.json";
const [file, ...hex] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync(p, "utf8"));
j[file] = [...new Set([...(j[file] || []), ...hex.map((h) => h.toUpperCase())])].sort();
const s = {};
Object.keys(j).sort().forEach((k) => (s[k] = j[k]));
fs.writeFileSync(p, JSON.stringify(s, null, 2) + "\n");
console.log(file, "->", j[file].join(" "));
