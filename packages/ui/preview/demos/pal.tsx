import * as React from "react";
import { RotateCcw } from "lucide-react";
import { PalMascot, type PalTone } from "../../src/pal/PalMascot";
import { PalGreeting } from "../../src/pal/PalGreeting";
import { NotchShell } from "../../src/product/notch";
import { Button } from "../../src/core/button";
import { Demo, Grid, type Entry } from "../kit";

const TONES: [PalTone, string][] = [
  ["brand", "Pal (default)"],
  ["info", "Info · working"],
  ["success", "Success"],
  ["warning", "Warning"],
  ["error", "Error"],
  ["neutral", "Loading"],
  ["warm", "Workshop"],
];

function Greeting() {
  const [key, setKey] = React.useState(0);
  return (
    <Demo dark className="flex-col items-center gap-5 py-8">
      <NotchShell size="panel" style={{ background: "transparent" }}>
        <div style={{ background: "radial-gradient(120% 90% at 50% 120%, rgba(215,68,14,0.16), transparent 70%), #000" }}>
          <PalGreeting playKey={key} />
        </div>
      </NotchShell>
      <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
        <RotateCcw /> Play again
      </Button>
    </Demo>
  );
}

export const pal: Entry[] = [
  {
    id: "pal-mascot",
    name: "Pal mascot",
    group: "Pal",
    usedIn: ["App", "Website"],
    description: "Our mascot: a white-and-silver dome with two eyes and floating hands. Tones tint its base for a state; it breathes, blinks and glances on its own.",
    Demo: () => (
      <Grid cols={1}>
        <Demo title="Tones (on black)" dark className="justify-around">
          {TONES.map(([t, label]) => (
            <div key={t} className="text-center">
              <PalMascot size={84} tone={t} />
              <div className="mt-1 text-2xs text-night-muted">{label}</div>
            </div>
          ))}
        </Demo>
        <Grid cols={2}>
          <Demo title="Sizes · face only">
            <PalMascot size={96} />
            <PalMascot size={48} />
            <PalMascot size={32} hands={false} />
            <PalMascot size={22} hands={false} />
          </Demo>
          <Demo title="Working (printing) — replays when shown" dark className="justify-center">
            <PalMascot size={96} hands={false} tone="info" mode="work" />
          </Demo>
        </Grid>
      </Grid>
    ),
    code: `<PalMascot size={32} hands={false} tone="success" />   // in a toast
<PalMascot size={42} hands={false} tone="info" mode="work" />  // printing`,
  },
  {
    id: "pal-greeting",
    name: "Pal greeting",
    group: "Pal",
    usedIn: ["App", "Website"],
    description: "The notch entrance: streaks, a particle ring, Pal drops in, bounces, waves and settles. Plays once per page load.",
    Demo: Greeting,
    code: `<PalGreeting onDone={() => setState("idle")} />`,
  },
];
