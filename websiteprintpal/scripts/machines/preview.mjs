// Writes a standalone preview page of the generated machines: node scripts/machines/preview.mjs <out.html>
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const root = join(HERE, "../..");
const ts = readFileSync(join(root, "src/components/Scene/machines.generated.ts"), "utf8");
const grab = (name) => JSON.parse(ts.match(new RegExp(`export const ${name}: [^=]+= (\\{.*\\});`))[1]);
const cnc = grab("CNC");
const printer = grab("PRINTER");
const css = readFileSync(join(root, "vendor/anatomy/kit/iso.css"), "utf8") + readFileSync(join(root, "src/components/Scene/machines.css"), "utf8");
const out = process.argv[2];
writeFileSync(
  out,
  `<!doctype html><meta charset="utf-8"><style>:root{--pp-orange:#d7440e;--pp-blue:#2878d0}body{margin:0;background:#fff3ec;display:flex;gap:40px;padding:30px;font-family:Inter,system-ui}
  .f{width:${cnc.width * 2}px} .f2{width:${printer.width * 2}px} ${css}</style>
  <div class="iso pp-iso" data-theme="light" style="display:flex;gap:40px"><div class="f">${cnc.svg}</div><div class="f2">${printer.svg}</div></div>`
);
console.log("wrote", out);
