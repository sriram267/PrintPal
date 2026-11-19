// A tiny wrapper around the TypeScript language service for the product (product/printpal/tsconfig.json):
// in-memory edits, VS Code's own refactors (Move to file, Extract to function, Rename), and writing results to disk.
const path = require("path");
const fs = require("fs");
const APP = "C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal";
const ts = require(APP + "/node_modules/typescript");

const norm = (p) => p.replace(/\\/g, "/");
const cfg = ts.getParsedCommandLineOfConfigFile(APP + "/tsconfig.json", {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(String(d.messageText)); } });
const mem = new Map(); // path -> { text, version }
const extraFiles = new Set();
const read = (f) => (mem.has(f) ? mem.get(f).text : fs.existsSync(f) ? fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n") : undefined);

const host = {
  getScriptFileNames: () => [...new Set([...cfg.fileNames.map(norm), ...extraFiles])],
  getScriptVersion: (f) => String(mem.get(norm(f))?.version ?? 0),
  getScriptSnapshot: (f) => { const t = read(norm(f)); return t === undefined ? undefined : ts.ScriptSnapshot.fromString(t); },
  getCurrentDirectory: () => APP,
  getCompilationSettings: () => cfg.options,
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: (f) => mem.has(norm(f)) || ts.sys.fileExists(f),
  readFile: (f) => read(norm(f)),
  readDirectory: ts.sys.readDirectory,
  directoryExists: (d) => ts.sys.directoryExists(d) || [...mem.keys()].some((f) => f.startsWith(norm(d).replace(/\/$/, "") + "/")),
  getDirectories: ts.sys.getDirectories,
};
const ls = ts.createLanguageService(host, ts.createDocumentRegistry());

const fmt = { ...ts.getDefaultFormatCodeSettings("\n"), indentSize: 2, tabSize: 2, convertTabsToSpaces: true, semicolons: ts.SemicolonPreference.Remove };
const prefs = { importModuleSpecifierPreference: "relative", quotePreference: "double", allowTextChangesInNewFiles: true, includePackageJsonAutoImports: "off" };

function setText(f, text) {
  f = norm(f);
  const v = (mem.get(f)?.version ?? 0) + 1;
  mem.set(f, { text, version: v });
  extraFiles.add(f);
}
function applyEdits(edits) {
  for (const fc of edits) {
    const f = norm(fc.fileName);
    let text = fc.isNewFile ? "" : read(f) ?? "";
    const changes = [...fc.textChanges].sort((a, b) => b.span.start - a.span.start);
    for (const c of changes) text = text.slice(0, c.span.start) + c.newText + text.slice(c.span.start + c.span.length);
    setText(f, text);
  }
}
const sf = (f) => ls.getProgram().getSourceFile(norm(f));
function topLevelDecl(file, name) {
  const s = sf(file);
  for (const st of s.statements) {
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name?.text === name) return st;
    if (ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => d.name.getText(s) === name)) return st;
  }
  throw new Error(`top-level ${name} not found in ${file}`);
}
/** VS Code's "Move to file": moves top-level declarations and fixes imports everywhere. */
function moveToFile(file, names, targetFile) {
  file = norm(file); targetFile = norm(targetFile);
  const s = sf(file);
  const nodes = names.map((n) => topLevelDecl(file, n)).sort((a, b) => a.pos - b.pos);
  const range = { pos: nodes[0].getStart(s), end: nodes[nodes.length - 1].end };
  if (!fs.existsSync(targetFile) && !mem.has(targetFile)) setText(targetFile, "");
  const edits = ls.getEditsForRefactor(file, fmt, range, "Move to file", "Move to file", prefs, { targetFile });
  if (!edits) throw new Error(`Move to file not available for ${names.join(",")}`);
  applyEdits(edits.edits);
}
/** Diagnostics for the whole program (semantic + syntactic) — must stay at zero. */
function errors() {
  const p = ls.getProgram();
  return ts.getPreEmitDiagnostics(p).map((d) => `${d.file ? path.relative(APP, d.file.fileName) + ":" + (d.file.getLineAndCharacterOfPosition(d.start).line + 1) : ""} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
}
function writeAll() {
  const out = [];
  for (const [f, { text }] of mem) {
    const old = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
    const crlf = old ? old.includes("\r\n") : false;
    const t = crlf ? text.replace(/\n/g, "\r\n") : text;
    if (old === t) continue;
    if (text.trim() === "" && old !== null) { fs.unlinkSync(f); out.push("deleted " + path.relative(APP, f)); continue; }
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, t, "utf8");
    out.push((old === null ? "created " : "updated ") + path.relative(APP, f));
  }
  return out;
}
/* ── moveDecls: our own "move to file", driven by the type checker ─────────────────────────── */
const relSpec = (fromFile, toFile) => {
  let r = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/").replace(/\.(tsx?|mts)$/, "");
  return r.startsWith(".") ? r : "./" + r;
};
function topStmtOf(node) {
  while (node.parent && !ts.isSourceFile(node.parent)) node = node.parent;
  return node;
}
/** Collect what `nodes` use from their file: imports (by module) and other top-level statements. */
function dependencies(file, nodes) {
  const s = sf(file), checker = ls.getProgram().getTypeChecker();
  const imports = new Map(); // moduleSpecifier -> Map(local -> { imported, kind, typeOnly })
  const locals = new Set();
  const inside = (n) => nodes.some((m) => n.pos >= m.pos && n.end <= m.end);
  const inTypePosition = (n) => {
    for (let p = n.parent; p; p = p.parent) {
      if (ts.isTypeNode(p) || ts.isTypeQueryNode?.(p) || ts.isHeritageClause(p) && p.token === ts.SyntaxKind.ImplementsKeyword) return true;
      if (ts.isExpression(p) && !ts.isExpressionWithTypeArguments(p) && p.kind !== ts.SyntaxKind.Identifier && !ts.isQualifiedName?.(p)) return false;
      if (ts.isStatement(p) || ts.isSourceFile(p)) return false;
    }
    return false;
  };
  const valueUse = new Set();
  function visit(n) {
    if (ts.isIdentifier(n)) {
      if (!inTypePosition(n)) valueUse.add(n.text);
      const sym = checker.getSymbolAtLocation(n);
      for (const d of sym?.declarations ?? []) {
        if (d.getSourceFile() !== s || inside(d)) continue;
        let imp = d;
        while (imp && !ts.isImportDeclaration(imp)) imp = imp.parent;
        if (imp) {
          const spec = imp.moduleSpecifier.text;
          if (!imports.has(spec)) imports.set(spec, new Map());
          const typeOnly = imp.importClause?.isTypeOnly || (ts.isImportSpecifier(d) && d.isTypeOnly);
          if (ts.isNamespaceImport(d)) imports.get(spec).set(d.name.text, { kind: "ns", typeOnly });
          else if (ts.isImportClause(d)) imports.get(spec).set(d.name.text, { kind: "default", typeOnly });
          else if (ts.isImportSpecifier(d)) imports.get(spec).set(d.name.text, { kind: "named", imported: (d.propertyName ?? d.name).text, typeOnly });
        } else if (ts.isSourceFile(topStmtOf(d).parent ?? {}) || topStmtOf(d).parent === s) {
          locals.add(topStmtOf(d));
        }
      }
    }
    ts.forEachChild(n, visit);
  }
  nodes.forEach(visit);
  // an import used only in type positions becomes a type-only import (required by verbatimModuleSyntax)
  for (const names of imports.values()) for (const [local, info] of names) if (!valueUse.has(local)) info.typeOnly = true;
  return { imports, locals: [...locals] };
}
function importLines(fromFile, toFile, imports) {
  const out = [];
  for (const [spec, names] of imports) {
    let target = spec;
    if (spec.startsWith(".")) {
      const absTarget = norm(path.resolve(path.dirname(fromFile), spec));
      // the destination file itself already declares these names
      if (absTarget === norm(toFile).replace(/\.(tsx?|mts)$/, "") || absTarget === norm(toFile)) continue;
      target = relSpec(toFile, absTarget);
    }
    const all = [...names.entries()];
    const ns = all.find(([, v]) => v.kind === "ns");
    if (ns) out.push(`import ${ns[1].typeOnly ? "type " : ""}* as ${ns[0]} from "${target}"`);
    const def = all.find(([, v]) => v.kind === "default");
    const named = all.filter(([, v]) => v.kind === "named").map(([local, v]) => `${v.typeOnly && !all.every(([, x]) => x.typeOnly) ? "type " : ""}${v.imported === local ? local : `${v.imported} as ${local}`}`);
    const allType = all.filter(([, v]) => v.kind !== "ns").every(([, v]) => v.typeOnly);
    if (def || named.length) out.push(`import ${allType ? "type " : ""}${def ? def[0] : ""}${def && named.length ? ", " : ""}${named.length ? `{ ${named.join(", ")} }` : ""} from "${target}"`);
  }
  return out;
}
/** Remove import specifiers the compiler reports as unused in `file` (TypeScript's own quick fix). */
function removeUnusedImports(file) {
  for (let round = 0; round < 30; round++) {
    const s = sf(file);
    const diags = ls.getSemanticDiagnostics(file).concat(ls.getSuggestionDiagnostics(file)).filter((d) => [6133, 6192, 6196, 6198].includes(d.code) && (() => { let n = s.statements.find((st) => d.start >= st.pos && d.start < st.end); return n && ts.isImportDeclaration(n); })());
    if (!diags.length) return;
    const d = diags[0];
    const fixes = ls.getCodeFixesAtPosition(file, d.start, d.start + d.length, [d.code], fmt, prefs);
    const del = fixes.find((f) => f.fixName === "unusedIdentifier" && /delete|remove/i.test(f.description)) ?? fixes[0];
    if (!del) return;
    applyEdits(del.changes);
  }
}
/**
 * Move top-level declarations `names` from `file` into `target` (created or appended).
 * Fails if they depend on other top-level declarations of `file` that are not moving with them.
 */
function moveDecls(file, names, target) {
  file = norm(file); target = norm(target);
  const s = sf(file);
  const nodes = names.map((n) => topLevelDecl(file, n));
  const { imports, locals } = dependencies(file, nodes);
  const stray = locals.filter((l) => !nodes.includes(l));
  if (stray.length) throw new Error(`${names.join(",")} depend on ${stray.map((l) => (l.name?.text ?? l.declarationList?.declarations[0].name.getText(s))).join(", ")} still in ${path.basename(file)} — move them together`);
  // text of the moved declarations (with their leading comments), exported
  const body = nodes
    .sort((a, b) => a.pos - b.pos)
    .map((n) => {
      let t = s.text.slice(n.getFullStart(), n.end).replace(/^\s*\n/, "").trimEnd();
      const hasExport = n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!hasExport) {
        const start = n.getStart(s) - n.getFullStart();
        const lead = s.text.slice(n.getFullStart(), n.getStart(s)).replace(/^\s*\n/, "");
        t = lead + "export " + s.text.slice(n.getStart(s), n.end);
      }
      return t.trimStart();
    })
    .join("\n\n");
  const existing = read(target) ?? "";
  // names the destination already binds (its own imports or declarations) are not imported again
  const bound = new Set();
  if (existing.trim()) {
    const es = ts.createSourceFile(target, existing, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const st of es.statements) {
      if (ts.isImportDeclaration(st) && st.importClause) {
        const c = st.importClause;
        if (c.name) bound.add(c.name.text);
        if (c.namedBindings && ts.isNamespaceImport(c.namedBindings)) bound.add(c.namedBindings.name.text);
        if (c.namedBindings && ts.isNamedImports(c.namedBindings)) c.namedBindings.elements.forEach((e) => bound.add(e.name.text));
      } else if (st.name) bound.add(st.name.text);
      else if (ts.isVariableStatement(st)) st.declarationList.declarations.forEach((d) => bound.add(d.name.getText(es)));
    }
  }
  for (const names of imports.values()) for (const local of [...names.keys()]) if (bound.has(local)) names.delete(local);
  for (const [spec, names] of [...imports]) if (!names.size) imports.delete(spec);
  const newImports = importLines(file, target, imports).filter((l) => !existing.includes(l));
  let targetText;
  if (!existing.trim()) targetText = `${newImports.join("\n")}\n\n${body}\n`;
  else {
    const lines = existing.split("\n");
    let lastImport = -1;
    lines.forEach((l, i) => { if (/^import /.test(l)) lastImport = i; });
    lines.splice(lastImport + 1, 0, ...newImports);
    targetText = lines.join("\n").trimEnd() + `\n\n${body}\n`;
  }
  setText(target, targetText);
  // remove from source (descending positions), then import back what the source still uses
  let src = s.text;
  for (const n of [...nodes].sort((a, b) => b.pos - a.pos)) src = src.slice(0, n.getFullStart()) + src.slice(n.end);
  setText(file, src);
  const stillUsed = names.filter((name) => new RegExp(`\\b${name}\\b`).test(src));
  if (stillUsed.length) {
    const s2 = sf(file);
    let lastImport = s2.statements.filter((st) => ts.isImportDeclaration(st)).pop();
    const at = lastImport ? lastImport.end : 0;
    const typeNames = new Set(nodes.filter((n) => ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)).map((n) => n.name.text));
    const spec = stillUsed.map((n) => (typeNames.has(n) ? `type ${n}` : n)).join(", ");
    setText(file, src.slice(0, at) + `\nimport { ${spec} } from "${relSpec(file, target)}"` + src.slice(at));
  }
  removeUnusedImports(file);
}

module.exports = { ts, ls, APP, sf, read, setText, applyEdits, moveToFile, moveDecls, dependencies, removeUnusedImports, topLevelDecl, errors, writeAll, fmt, prefs, norm };
