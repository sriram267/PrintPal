// usage: node hsl-fix.mjs <file> <startText> <endText>
// Inside the region, turns shadcn colour classes (bg-primary, hover:border-secondary/70 ...) into exact
// arbitrary classes that read the product's HSL variables, e.g. bg-[hsl(var(--primary))], hover:border-[hsl(var(--secondary)/0.7)].
import fs from "node:fs";
const [file, s, e] = process.argv.slice(2);
let t = fs.readFileSync(file, "utf8");
const a = t.indexOf(s), b = t.indexOf(e, a + 1);
if (a < 0 || b < 0) throw new Error("markers not found");
const names = "primary-foreground|secondary-foreground|destructive-foreground|muted-foreground|card-foreground|popover-foreground|accent-foreground|primary|secondary|destructive|muted|accent|card|popover|border|foreground|ring|background|input";
let region = t.slice(a, b), n = 0;
region = region.replace(new RegExp(`(?<![\\w\\[-])((?:[a-z0-9\\-\\[\\]=]+:)*)(bg|text|border|ring)-(${names})(?:/(\\d+))?(?![\\w\\-\\]])`, "g"), (m, variants, kind, name, op) => {
  n++;
  return `${variants}${kind}-[hsl(var(--${name})${op ? "/" + Number(op) / 100 : ""})]`;
});
fs.writeFileSync(file, t.slice(0, a) + region + t.slice(b));
console.log(file, "converted", n);
