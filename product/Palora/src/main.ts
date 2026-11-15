// Entry point: boot the bridge, wire the island, start the greeting.

import "./style.css";
import { Bridge, IS_TAURI, onEvent } from "./core/bridge";
import { Sound } from "./core/sound";
import { State, type Settings } from "./core/state";
import { Island } from "./island/island";
import { registerHookHandlers } from "./island/hooks";
import { registerIntegrationHandlers, refreshConfigured } from "./island/integrations";
import { registerShortcutHandlers } from "./island/shortcuts";
import { applySpotify, registerSpotifyHandlers } from "./island/spotify";
import { SPOTIFY_ID } from "./core/spotify";
import { Recap } from "./recap/recap";
import { onLanguageChange, resolveLanguage, setLanguage, systemLanguages } from "./i18n/i18n";
import { WorkshopEngine } from "./island/workshop";

import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

/** Shows the language Settings asks for ("" = the system's, when Coucou has it). */
function applyLanguage() {
  setLanguage(resolveLanguage(State.settings.language, systemLanguages()));
}

async function main() {
  const leadsRoot = document.getElementById("printpal-leads-root");
  if (leadsRoot) {
    const root = createRoot(leadsRoot);
    root.render(React.createElement(App));
    return;
  }

  const root = document.getElementById("root");
  if (!root) return;

  void Sound.preload();

  const island = new Island(root);

  const boot = await Bridge.boot();
  if (boot) {
    State.settings = { ...State.settings, ...boot.settings };
  }
  // A language change redraws the island in place: the texts given as tl(…)
  // relabel themselves (views/dom.ts) and the views redraw the rest on this
  // sync. Nothing is rebuilt, so tasks, steps and the chat stay as they are.
  onLanguageChange(() => State.notify());
  applyLanguage();
  // Rust shows the tray and its errors in the same language as the webview.
  void Bridge.setSystemLanguages(systemLanguages());
  island.applySettings();
  State.loadIntegrationTasks();
  if (boot && !boot.cursorPoll) island.followPageCursor();
  await island.desktop.init();

  await onEvent<{ x: number; y: number }>("cursor", ({ x, y }) => island.onCursor(x, y));
  await onEvent<boolean>("pointer-inside", (inside) => island.setPointerInside(inside));

  /** Pause has to reach Rust too, or the pollers keep calling out. */
  const setPaused = (on: boolean) => {
    if (State.paused === on) return;
    State.paused = on;
    void Bridge.setPaused(on);
  };

  await onEvent<string>("tray", (what) => {
    switch (what) {
      case "settings":
        setPaused(false);
        island.alert("settings");
        break;
      case "open":
        setPaused(false);
        island.alert(State.defaultView());
        break;
      case "recap":
        setPaused(false);
        void Recap.open(island);
        break;
      case "wardrobe":
        setPaused(false);
        island.alert("wardrobe");
        break;
      case "pause":
        setPaused(!State.paused);
        if (State.paused) island.fsm.forceHidden();
        else island.reveal();
        break;
    }
  });

  await onEvent<null>("screen-changed", () => void Bridge.reposition());

  // Settings → Reload sounds: read the sounds folder again, and let them hear it.
  await onEvent<null>("sounds-changed", () => {
    void Sound.reload().then(() => Sound.play("pop"));
  });

  // The settings window writes preferences; apply them here without a restart.
  await onEvent<Settings>("settings-changed", (s) => {
    const previousMain = State.mainPillId;
    State.settings = { ...State.settings, ...s };
    applyLanguage();
    island.applySettings();
    State.loadIntegrationTasks();
    // A new main tool comes to the front, as on macOS.
    if (State.mainPillId !== previousMain) State.setFocus(State.mainPillId);
    void refreshConfigured();
  });

  registerHookHandlers(island);
  registerIntegrationHandlers(island);
  registerShortcutHandlers(island, () => setPaused(false));
  registerSpotifyHandlers(island);
  // Rust may have read Spotify before this page listened: ask once.
  if (State.settings.activeIntegrations.includes(SPOTIFY_ID)) {
    void Bridge.spotifyRefresh().then((s) => s && applySpotify(island, s));
  }

  // Monday recap: app start (greeting over), an agent starting work, waking up.
  const checkRecap = () => void Recap.check(island);
  island.onGreetingDone = checkRecap;
  island.onWake = checkRecap;
  await onEvent<null>("recap-check", checkRecap);

  island.launch();

  // In a plain browser, enable sound on first interaction and expose simulator API
  if (!IS_TAURI) {
    document.addEventListener("click", () => Sound.resume(), { once: true });

    (window as unknown as { Coucou: unknown }).Coucou = {
      island,
      State,
      Sound,
      toggle: () => {
        if (State.mode === "expanded") {
          island.collapse();
        } else {
          island.expand("overview");
        }
      },
      expand: (view = "overview") => island.expand(view as any),
      collapse: () => island.collapse(),
      launchGreeting: () => island.launch(),
      simulateApproval: () => {
        Sound.play("approval");
        State.beginApproval({
          requestId: `req_${Date.now()}`,
          sessionId: "session_browser_1",
          pillId: State.mainPillId,
          tool: "run_command",
          command: "npx printpal-cli nest-sheets --auto-seam --hsn 9405 --material ACP_3mm",
        });
        island.expand("approval");
      },
      simulateAntigravityDiff: () => {
        Sound.play("approval");
        State.beginApproval({
          requestId: `req_${Date.now()}`,
          sessionId: "session_antigravity",
          pillId: State.mainPillId,
          tool: "replace_file_content",
          command: "src/estimator/power_chain.ts: Derate SMPS to MeanWell LPV-350-12 (270W load)",
        });
        island.expand("approval");
      },
      simulateWorkshopJob: () => {
        const task = State.focusTask;
        if (task) {
          task.name = "Ruida CNC Cut #108";
          task.state = "working";
          task.steps = [
            "Vector parsing: letter_signboard.dxf",
            "8x4 ft sheet nesting: 91.2% material efficiency",
            "Spindle: 18,000 RPM · Feed: 4.2 m/min",
            "Seam detection: 2 panels split at 8 ft seam line",
            "CNC cutting in progress...",
          ];
          task.stepIndex = 4;
          State.notify();
        }
        island.triggerEmote("happy");
        island.expand("overview");
        Sound.play("work");
      },
      simulateSafetyAlert: () => {
        const task = State.focusTask;
        if (task) {
          task.name = "Thermal & Pelmet Alert";
          task.state = "error";
          task.steps = [
            "Site survey alert: 6-inch rolling shutter pelmet drop",
            "SMPS continuous load >80% without parallel feed",
            "Action required: Derate power supply or adjust tray depth",
          ];
          task.stepIndex = 2;
          State.notify();
        }
        island.triggerEmote("annoyed");
        island.expand("overview");
        Sound.play("error");
      },
      simulateFinish: () => {
        const task = State.focusTask;
        if (task) {
          task.name = "Job #108 Complete";
          task.state = "finished";
          task.steps = [
            "Acrylic letters fabricated · Zero acrylic wastage",
            "Approved QR Job Card locked against drift",
            "E-Way bill generated for HSN 9405 consignment",
          ];
          task.stepIndex = 2;
          State.notify();
        }
        island.triggerEmote("proud");
        island.expand("overview");
        Sound.play("finish");
      },
      simulateQuestion: () => {
        Sound.play("question");
        State.beginApproval({
          requestId: `req_${Date.now()}`,
          sessionId: "session_browser_2",
          pillId: State.mainPillId,
          tool: "AskUserQuestion",
          command: "Select SMPS Power Supply derating tier (216W connected load)",
          questions: [
            {
              question: "Which MeanWell SMPS tier should be selected for this 180x 1.2W LED load?",
              options: [
                { label: "MeanWell LPV-350-12 (350W Recommended)", description: "Provides 1.25x continuous headroom (61.7% load factor, preventing thermal burnout)" },
                { label: "MeanWell LPV-250-12 (250W Risk)", description: "Runs at 86.4% continuous load; violates 80% electrical rule" },
              ],
              multiSelect: false,
            },
          ],
        });
        island.expand("question");
      },
      simulateTask: (stateName: "working" | "thinking" | "finished" | "error" = "working") => {
        const task = State.focusTask;
        if (task) {
          task.state = stateName;
          task.steps = [
            "Syncing PrintPal ERP tenant schema...",
            "Validating PostgreSQL migrations...",
            "Listening to Kafka event stream...",
            "Operational health: 100% OK",
          ];
          task.stepIndex = 3;
          State.notify();
        }
        island.expand("overview");
        Sound.play(stateName === "finished" ? "finish" : stateName === "error" ? "error" : "work");
      },
      Workshop: WorkshopEngine,
      simulateElectricalCheck: () => {
        Sound.play("question");
        const res = WorkshopEngine.checkElectricalLoad(180, 1.2);
        State.beginApproval({
          requestId: `req_elec_${Date.now()}`,
          sessionId: "session_workshop",
          pillId: State.mainPillId,
          tool: "ElectricalDeratingGate",
          command: `Connected: ${res.connectedWatts}W -> 1.25x Headroom Required: ${res.designWattsRequired}W. Selected: ${res.recommendedSmpsModel} (${res.loadFactorPercent}% load factor)`,
          questions: [
            {
              question: `Select SMPS Power Supply for 180x 1.2W LED load (${res.connectedWatts}W connected):`,
              options: [
                { label: `${res.recommendedSmpsModel} (${res.recommendedSmpsWatts}W)`, description: `Safe 61.7% load factor. Complies with 1.25x electrical headroom law. Zero burnout risk.` },
                { label: "MeanWell LPV-250-12 (250W Under-rated)", description: `Operates at 86.4% continuous load. Violates 80% rule. Silent thermal failure within 90 days.` },
              ],
              multiSelect: false,
            },
          ],
        });
        island.expand("question");
      },
      simulateSheetSeamCheck: () => {
        Sound.play("approval");
        const geo = WorkshopEngine.checkSheetGeometry(12, 4, 2.5, 0.75, 11);
        State.beginApproval({
          requestId: `req_sheet_${Date.now()}`,
          sessionId: "session_workshop",
          pillId: State.mainPillId,
          tool: "SheetSeamSplitGate",
          command: `12x4 ft tray flat cut (${geo.flatWidthFeet}x${geo.flatHeightFeet} ft) exceeds 8x4 ft sheet stock. Split at 8.0 ft line. Letter stroke 11mm < 15mm LED width.`,
        });
        island.expand("approval");
      },
      simulateDispatchGateCheck: () => {
        Sound.play("error");
        const gate = WorkshopEngine.validateDispatchGate(45000, 26550, 0);
        const task = State.focusTask;
        if (task) {
          task.name = "50/40/10 Dispatch Gate Locked";
          task.state = "error";
          task.steps = [
            `Total Order: ₹${gate.orderTotal} (incl. 18% GST HSN ${gate.hsnCode})`,
            `50% Token Advance: ₹${gate.tokenAdvanceRequired} (Received: ₹26,550 ✓)`,
            `40% Dispatch Gate: ₹${gate.dispatchTokenRequired} (UNVERIFIED - Zero token logged)`,
            "Dispatch Gate LOCKED: Factory floor exit barred. Delivery trucks do not depart for unverified cheques.",
          ];
          task.stepIndex = 3;
          State.notify();
        }
        island.expand("overview");
      },
      toggleWardrobe: () => island.toggleWardrobe(),
      openWorkshop: () => island.expand("workshop"),
      triggerEmote: (emote: any) => island.triggerEmote(emote),
      playSound: (name: string) => Sound.play(name as any),
      toggleTheme: () => (window as unknown as { toggleTheme?: () => void }).toggleTheme?.(),
    };

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
        return;
      }
      if (e.key === "Escape") {
        island.collapse();
      }
    });
  }
}

void main();
