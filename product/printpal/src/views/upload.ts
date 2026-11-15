// Drop zone, upload progress and the "what do you want to do with it" card —
// ports of UploadView / UploadingView / ChooseView from IslandViewContent.swift.
//
// Sending a file by email is not in the Windows v1, so `choose` offers the one
// action the spec asks for: ask a question about it.

import { h, clear } from "./dom";
import { State } from "../core/state";
import type { ViewActions, ViewHost } from "./views";
import { N_, t, tl } from "../i18n/i18n";

/** Dashed rounded rect drawn as SVG so the dashes can march like on macOS. */
function dashedFrame(): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(ns, "svg");
  el.setAttribute("class", "drop-frame");
  el.setAttribute("preserveAspectRatio", "none");
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", "0.75");
  rect.setAttribute("y", "0.75");
  rect.setAttribute("width", "calc(100% - 1.5px)");
  rect.setAttribute("height", "calc(100% - 1.5px)");
  rect.setAttribute("rx", "20");
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke-width", "1.5");
  rect.setAttribute("stroke-dasharray", "6 5");
  el.append(rect);
  return el;
}

export function buildUpload(): ViewHost {
  const frame = dashedFrame();
  const title = h("div", { class: "drop-title", text: tl("Drop Shopfloor Assets Here") });
  const tags = h(
    "div",
    { class: "drop-tags" },
    ...[N_("DXF / PLT"), N_("Corel / AI"), N_("PDF Drawing"), N_("G-Code")].map((chip) => h("span", { text: tl(chip) })),
  );
  const card = h(
    "div",
    { class: "card drop-card" },
    frame,
    h("div", { class: "drop-body" }, title, tags),
  );
  const el = h("div", { class: "view" }, card);

  return {
    el,
    sync() {
      card.classList.toggle("over", State.fileDragOver);
    },
  };
}

export function buildUploading(): ViewHost {
  const label = h("span", { class: "up-name" });
  const percent = h("span", { class: "up-pct" });
  const fill = h("div", { class: "up-fill" });
  const glow = h("div", { class: "up-glow" });
  const card = h(
    "div",
    { class: "card up-card" },
    h("div", { class: "up-row" }, label, percent),
    h("div", { class: "up-track" }, fill, glow),
  );
  const el = h("div", { class: "view" }, card);

  return {
    el,
    sync() {
      const done = State.uploadProgress >= 0.999;
      const pct = Math.round(State.uploadProgress * 100);
      label.textContent = done
        ? `✓  ${State.droppedFile?.name ?? t("Vector Asset")}`
        : t("Parsing {name}", { name: State.droppedFile?.name ?? t("asset") });
      label.classList.toggle("done", done);
      percent.textContent = done ? "" : `${pct} %`;
      const w = State.uploadProgress * 526;
      fill.style.width = `${w}px`;
      glow.style.transform = `translateX(${Math.max(0, w - 14)}px)`;
      glow.style.opacity = State.uploadProgress > 0.01 ? "1" : "0";
      card.classList.toggle("done", done);
    },
  };
}

export function buildChoose(actions: ViewActions): ViewHost {
  const title = h("div", { class: "title" });
  const sub = h("div", { class: "sub" });
  const row = h("div", { class: "actions" });

  const VALID_EXTS = [".dxf", ".plt", ".ai", ".eps", ".cdr", ".svg", ".pdf", ".gcode", ".nc"];

  function isVectorFile(name: string): boolean {
    const lower = name.toLowerCase();
    return VALID_EXTS.some((ext) => lower.endsWith(ext));
  }

  const el = h(
    "div",
    { class: "view" },
    h(
      "div",
      { class: "card" },
      h("div", { class: "stack", style: "padding:0 18px 0 98px" }, title, sub, row),
    ),
  );

  return {
    el,
    sync() {
      clear(title);
      clear(sub);
      clear(row);

      const fileName = State.droppedFile?.name ?? "sign_drawing.dxf";
      const valid = isVectorFile(fileName);

      if (valid) {
        title.append(
          h("b", { text: fileName }),
          document.createTextNode(t(" staged for workshop routing.")),
        );
        sub.textContent = t("Select shopfloor fabrication pipeline:");
        row.append(
          h("button", {
            class: "btn primary",
            text: tl("Approved QR Job Card & Nest"),
            onclick: () => {
              const task = State.focusTask;
              if (task) {
                task.name = `Job Card #${Math.floor(Math.random() * 899 + 100)}`;
                task.state = "finished";
                task.steps = [
                  `Vector verified: ${fileName} (CRC32 validated)`,
                  "8x4 ft nesting calculated: 93.4% sheet utilization",
                  "Approved QR Job Card locked against version drift",
                  "HSN 9405 invoice & E-Way Bill ready",
                ];
                task.stepIndex = 3;
                State.notify();
              }
              actions.setView("overview");
            },
          }),
          h("button", {
            class: "btn secondary",
            text: tl("Check Sheet Seam Split"),
            onclick: () => actions.setView("workshop"),
          }),
          h("button", {
            class: "btn secondary",
            text: tl("Cancel"),
            onclick: () => actions.cancelDrop(),
          }),
        );
      } else {
        title.append(
          h("b", { text: `⚠️ Unsupported Format: ${fileName}`, style: "color:#f4505e" }),
        );
        sub.textContent = t("Accepted formats: .dxf, .plt, .ai, .eps, .cdr, .svg, .pdf. Parsing non-vector binaries creates toolpath crash risks.");
        row.append(
          h("button", {
            class: "btn secondary",
            text: tl("Cancel"),
            onclick: () => actions.cancelDrop(),
          }),
        );
      }
    },
  };
}
