// Machine Live Activity Card — CNC Router & Laser Cutting Telemetry HUD
// Real-time circular progress ring, feedrate HUD, and direct Mochi emote synchronization.

import { h, svg } from "./dom";
import { ICONS } from "./icons";
import { Sound } from "../core/sound";

export interface MachineCardHost {
  el: HTMLElement;
  sync(): void;
  tick(nowMs: number): void;
}

export function buildMachineCard(actions?: { onAlert?: () => void; onFinish?: () => void }): MachineCardHost {
  let progressPercent = 68;
  let isRunning = true;
  let elapsedSec = 860; // 14m 20s
  let totalSec = 1260; // 21m 00s
  let lastTick = performance.now();

  const titleRow = h("div", { class: "machine-title-row" },
    svg(ICONS.gauge, 14),
    h("span", { class: "machine-title", text: "Ruida DSP CNC Cut #108" }),
    h("span", { class: "machine-badge live", text: "CUTTING 68%" })
  );

  // SVG Circular Progress Ring
  const radius = 22;
  const circ = 2 * Math.PI * radius; // ~138.23

  const circleBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleBg.setAttribute("cx", "28");
  circleBg.setAttribute("cy", "28");
  circleBg.setAttribute("r", String(radius));
  circleBg.setAttribute("fill", "none");
  circleBg.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
  circleBg.setAttribute("stroke-width", "4");

  const circleFill = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleFill.setAttribute("cx", "28");
  circleFill.setAttribute("cy", "28");
  circleFill.setAttribute("r", String(radius));
  circleFill.setAttribute("fill", "none");
  circleFill.setAttribute("stroke", "#22d3ee");
  circleFill.setAttribute("stroke-width", "4");
  circleFill.setAttribute("stroke-dasharray", String(circ));
  circleFill.setAttribute("stroke-dashoffset", String(circ * (1 - progressPercent / 100)));
  circleFill.setAttribute("stroke-linecap", "round");
  circleFill.setAttribute("transform", "rotate(-90 28 28)");
  circleFill.style.transition = "stroke-dashoffset 0.3s ease-out";

  const ringSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ringSvg.setAttribute("viewBox", "0 0 56 56");
  ringSvg.setAttribute("width", "56");
  ringSvg.setAttribute("height", "56");
  ringSvg.setAttribute("class", "progress-ring-svg");
  ringSvg.append(circleBg, circleFill);

  const ringLabel = h("span", { class: "ring-label", text: `${progressPercent}%` });
  const ringContainer = h("div", { class: "ring-container" }, ringSvg, ringLabel);

  const countdownText = h("div", { class: "machine-time", text: "Elapsed: 14m 20s · Left: 06m 40s" });
  const telemetryRow = h("div", { class: "telemetry-chips" },
    h("span", { class: "t-chip", text: "18,000 RPM" }),
    h("span", { class: "t-chip", text: "4.2 m/min" }),
    h("span", { class: "t-chip green", text: "91.2% Mat. Efficiency" })
  );

  const btnPause = h("button", {
    class: "btn secondary small",
    text: "Pause",
    onclick: () => {
      isRunning = !isRunning;
      btnPause.textContent = isRunning ? "Pause" : "Resume";
      titleRow.querySelector(".machine-badge")!.textContent = isRunning ? `CUTTING ${progressPercent}%` : "PAUSED";
      Sound.play("pop");
    },
  });

  const btnAlert = h("button", {
    class: "btn secondary small red",
    text: "Pelmet Alert",
    onclick: () => {
      actions?.onAlert?.();
    },
  });

  const btnFinish = h("button", {
    class: "btn primary small",
    text: "Complete Job",
    onclick: () => {
      progressPercent = 100;
      circleFill.setAttribute("stroke-dashoffset", "0");
      ringLabel.textContent = "100%";
      titleRow.querySelector(".machine-badge")!.textContent = "COMPLETED ✓";
      actions?.onFinish?.();
    },
  });

  const actionsRow = h("div", { class: "machine-actions" }, btnPause, btnAlert, btnFinish);

  const leftCol = h("div", { class: "machine-left-col" }, ringContainer);
  const rightCol = h("div", { class: "machine-right-col" }, countdownText, telemetryRow, actionsRow);

  const body = h("div", { class: "machine-card-content" }, leftCol, rightCol);

  const el = h("div", { class: "machine-live-card" }, titleRow, body);

  return {
    el,
    sync() {
      const offset = circ * (1 - progressPercent / 100);
      circleFill.setAttribute("stroke-dashoffset", String(offset));
      ringLabel.textContent = `${progressPercent}%`;
    },
    tick(nowMs: number) {
      if (!isRunning || progressPercent >= 100) return;
      if (nowMs - lastTick >= 1000) {
        lastTick = nowMs;
        elapsedSec++;
        const remainingSec = Math.max(0, totalSec - elapsedSec);
        progressPercent = Math.min(99, Math.round((elapsedSec / totalSec) * 100));

        const elM = Math.floor(elapsedSec / 60);
        const elS = elapsedSec % 60;
        const remM = Math.floor(remainingSec / 60);
        const remS = remainingSec % 60;

        countdownText.textContent = `Elapsed: ${String(elM).padStart(2, "0")}m ${String(elS).padStart(2, "0")}s · Left: ${String(remM).padStart(2, "0")}m ${String(remS).padStart(2, "0")}s`;
        circleFill.setAttribute("stroke-dashoffset", String(circ * (1 - progressPercent / 100)));
        ringLabel.textContent = `${progressPercent}%`;
      }
    },
  };
}
