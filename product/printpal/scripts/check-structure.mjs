// Folder-structure check: fails (exit 1) when a file is in the wrong place.
// Rules are explained in plain words in src/features/README.md.
//
//   npm run check:structure            check the rules, list what is still waiting to be moved
//   npm run check:structure -- --strict   also fail while old folders still hold code (used once the move is done)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const FEATURES = path.join(SRC, "features");
const STRICT = process.argv.includes("--strict");

const PARTS = ["screen", "api", "db", "tests"];
const PART_FILES = {
  screen: /\.(tsx?|css|svg|png|jpe?g|webp|json)$/,
  api: /\.(mjs|js|json)$/,
  db: /\.(mjs|js|json|sql)$/,
  tests: /\.(mjs|js|tsx?)$/,
};
/* While the move is in progress these old places may still hold code. */
const LEGACY_DIRS = ["modules", "components", "core", "lib", "db"];
const SRC_ROOT_FILES = /^(main\.tsx?|App\.tsx|style\.css|vite-env\.d\.ts|README\.md)$/;
const AREA_FILES = /^(README\.md|menu\.tsx?)$/;

const problems = [];
const rel = (p) => path.relative(ROOT, p).replaceAll("\\", "/");
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const list = (p) => (isDir(p) ? fs.readdirSync(p, { withFileTypes: true }) : []);
function walk(dir, out = []) {
  for (const e of list(dir)) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/* 1. src/ only holds app/, features/, shared/ (plus the old folders while moving) */
for (const e of list(SRC)) {
  if (e.isDirectory()) {
    if (["app", "features", "shared"].includes(e.name)) continue;
    if (LEGACY_DIRS.includes(e.name)) continue;
    problems.push(`src/${e.name}/ is not an allowed folder. Use src/app/, src/features/<area>/<feature>/ or src/shared/.`);
  } else if (!SRC_ROOT_FILES.test(e.name)) {
    problems.push(`src/${e.name} should not sit loose in src/. Put it in its feature folder, src/app/ or src/shared/.`);
  }
}
for (const must of ["app/README.md", "features/README.md", "shared/README.md"]) {
  if (!fs.existsSync(path.join(SRC, must))) problems.push(`src/${must} is missing.`);
}

/* 2. features/<area>/<feature>/ — README + screen/api/db/tests only */
const featureDirs = [];
for (const area of list(FEATURES)) {
  const areaPath = path.join(FEATURES, area.name);
  if (!area.isDirectory()) {
    if (area.name !== "README.md") problems.push(`${rel(areaPath)}: only area folders (leads, quotation, settings…) belong in src/features/.`);
    continue;
  }
  if (!fs.existsSync(path.join(areaPath, "README.md"))) problems.push(`${rel(areaPath)}/README.md is missing.`);
  for (const f of list(areaPath)) {
    const p = path.join(areaPath, f.name);
    if (!f.isDirectory()) {
      if (!AREA_FILES.test(f.name)) problems.push(`${rel(p)}: an area folder holds only README.md (and menu.ts). Move this into a feature folder.`);
      continue;
    }
    if (f.name === "shared") continue; // free-form helpers shared inside this area
    featureDirs.push(p);
  }
}

for (const feat of featureDirs) {
  if (!fs.existsSync(path.join(feat, "README.md"))) problems.push(`${rel(feat)}/README.md is missing — say in plain words what this feature is.`);
  for (const part of PARTS) if (!isDir(path.join(feat, part))) problems.push(`${rel(feat)}/${part}/ is missing.`);
  for (const e of list(feat)) {
    if (e.isDirectory() && PARTS.includes(e.name)) continue;
    if (!e.isDirectory() && e.name === "README.md") continue;
    problems.push(`${rel(path.join(feat, e.name))}: a feature folder holds only README.md, screen/, api/, db/ and tests/.`);
  }
  for (const part of PARTS) {
    for (const file of walk(path.join(feat, part))) {
      const name = path.basename(file);
      if (name === ".gitkeep") continue;
      if (!PART_FILES[part].test(name)) {
        const hint = part === "api" || part === "db" ? "server code must be plain JavaScript (.mjs)" : `allowed here: ${PART_FILES[part]}`;
        problems.push(`${rel(file)}: wrong kind of file for ${part}/ (${hint}).`);
      }
    }
  }
}

/* 3. imports: screens never import server code, server code never imports screens */
const IMPORT_RE = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)/g;
for (const file of walk(FEATURES)) {
  if (!/\.(tsx?|mjs|js)$/.test(file)) continue;
  const parts = rel(file).split("/");
  const part = parts.find((s) => PARTS.includes(s));
  if (!part || part === "tests") continue;
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(IMPORT_RE)) {
    const spec = m[1] || m[2] || m[3];
    if (!spec.startsWith(".")) continue;
    const target = rel(path.resolve(path.dirname(file), spec));
    const targetPart = target.split("/").find((s) => PARTS.includes(s));
    if (part === "screen" && (targetPart === "api" || targetPart === "db")) {
      problems.push(`${rel(file)} imports server code (${spec}). Screens must call the server through the API, not import it.`);
    }
    if ((part === "api" || part === "db") && targetPart === "screen") {
      problems.push(`${rel(file)} imports screen code (${spec}). The server cannot run screen files.`);
    }
    if (part === "screen" && target.includes("src/components/ui/")) {
      problems.push(`${rel(file)} imports the old component copies (${spec}). New screens use the PrintPal UI library (packages/ui).`);
    }
  }
}

/* 4. what is still waiting to be moved */
const waiting = [];
for (const d of LEGACY_DIRS) {
  if (d === "components") continue; // src/components/ui moves into packages/ui in Track B
  for (const f of walk(path.join(SRC, d))) if (!f.endsWith(".gitkeep")) waiting.push(rel(f));
}
for (const e of list(SRC)) if (!e.isDirectory() && /\.(tsx?|css)$/.test(e.name)) waiting.push(rel(path.join(SRC, e.name)));
for (const f of list(path.join(ROOT, "server"))) {
  if (!f.isDirectory() && f.name !== "server.mjs") waiting.push(`server/${f.name}`);
}
if (STRICT && waiting.length) problems.push(`${waiting.length} file(s) still in old places (strict mode).`);

/* report */
console.log(`Folder structure: ${featureDirs.length} features checked.`);
if (waiting.length) console.log(`Still waiting to be moved into feature folders: ${waiting.length} file(s) (see docs/RESTRUCTURE_PLAN.md).`);
if (problems.length) {
  console.error(`\n✖ ${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("✓ Every file is in the right place.");
