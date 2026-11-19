import { Demo, Grid, type Entry } from "../kit";

const COLOURS: { group: string; items: [token: string, hex: string, use: string][] }[] = [
  {
    group: "Text",
    items: [
      ["ink", "#202428", "Main text, headings"],
      ["ink-2", "#3C4148", "Strong secondary"],
      ["ink-3", "#5B6168", "Secondary text"],
      ["muted", "#737B84", "Labels, hints"],
      ["faint", "#98A0A8", "Placeholders"],
    ],
  },
  {
    group: "Surfaces & lines",
    items: [
      ["white", "#FFFFFF", "Cards, fields"],
      ["surface", "#F3F5F7", "App background"],
      ["surface-2", "#F8FAFC", "Subtle hover"],
      ["border", "#DCE1E5", "Borders, dividers"],
      ["border-strong", "#B5BFC7", "Hovered border"],
    ],
  },
  {
    group: "Brand",
    items: [
      ["brand", "#D7440E", "Main actions, fabrication"],
      ["brand-hover", "#BF3B0B", "Hover"],
      ["brand-tint", "#FFF7ED", "Soft orange fill"],
      ["accent", "#2878D0", "Focus, selection, print"],
      ["accent-hover", "#1E66B4", "Hover"],
      ["accent-tint", "#EFF6FF", "Soft blue fill"],
    ],
  },
  {
    group: "Status",
    items: [
      ["success", "#047857", "Saved, done"],
      ["warning", "#A15C07", "Needs attention"],
      ["danger", "#DC2626", "Delete, errors"],
      ["danger-text", "#EF4444", "Field error text"],
      ["night", "#1D1F22", "Dark buttons"],
      ["black", "#000000", "Pal notch"],
    ],
  },
];

function Colours() {
  return (
    <div className="space-y-6">
      {COLOURS.map((g) => (
        <div key={g.group}>
          <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">{g.group}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {g.items.map(([t, hex, use]) => (
              <div key={t} className="overflow-hidden rounded-lg border border-line bg-white">
                <div className="h-14 border-b border-line" style={{ background: `rgb(var(--pp-${t}))` }} />
                <div className="p-2.5">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="font-mono text-2xs text-muted">{hex}</div>
                  <div className="mt-1 text-2xs leading-snug text-ink-3">{use}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TYPE: [cls: string, name: string, spec: string, sample: string][] = [
  ["text-display font-semibold", "display", "30–46px · 600", "Quote and bill every sign job"],
  ["text-xl font-semibold", "xl", "20px · 600", "Leads"],
  ["text-lg font-bold", "lg", "18px · 700", "New customer"],
  ["text-md font-semibold", "md", "15px · 600", "Delete this quotation?"],
  ["text-base", "base", "14px · 400", "Table rows and body text"],
  ["text-sm", "sm", "13px · 400", "Fields, buttons, most app text"],
  ["text-xs font-medium text-muted", "xs", "12px · 500", "Field labels, table headings"],
  ["text-2xs font-medium", "2xs", "11px · 500", "Tags, error messages"],
];

function Typography() {
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-white">
      {TYPE.map(([cls, name, spec, sample]) => (
        <div key={name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-5 py-4">
          <div className="w-28 shrink-0">
            <div className="font-mono text-xs font-semibold">text-{name}</div>
            <div className="text-2xs text-muted">{spec}</div>
          </div>
          <div className={cls}>{sample}</div>
        </div>
      ))}
      <div className="px-5 py-4 text-sm text-ink-3">
        Typeface: <b className="text-ink">Inter</b>. Weights: 400 regular, 450 book (nav), 500 medium, 600 semibold, 700 bold.
      </div>
    </div>
  );
}

function Shapes() {
  const radii: [string, string, string][] = [
    ["rounded-xs", "4px", "Tags, checkboxes"],
    ["rounded-sm", "6px", "Fields, app buttons"],
    ["rounded-md", "8px", "Table header, dropzone"],
    ["rounded-lg", "10px", "Website buttons"],
    ["rounded-xl", "12px", "Cards"],
    ["rounded-2xl", "14px", "Dialogs, sheets"],
  ];
  const shadows: [string, string][] = [
    ["shadow-xs", "Small lift"],
    ["shadow-card", "Empty states"],
    ["shadow-pop", "Popovers, menus"],
    ["shadow-dialog", "Dialogs"],
    ["shadow-window", "Website windows"],
    ["shadow-brand", "Primary button hover"],
  ];
  return (
    <Grid cols={2}>
      <Demo title="Corners">
        <div className="grid w-full grid-cols-3 gap-4">
          {radii.map(([c, px, use]) => (
            <div key={c} className="text-center">
              <div className={`mx-auto h-14 w-full border-2 border-accent bg-accent-tint ${c}`} />
              <div className="mt-2 font-mono text-2xs font-semibold">{c}</div>
              <div className="text-2xs text-muted">
                {px} · {use}
              </div>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="Shadows" className="bg-surface">
        <div className="grid w-full grid-cols-3 gap-4">
          {shadows.map(([c, use]) => (
            <div key={c} className="text-center">
              <div className={`mx-auto h-14 w-full rounded-lg bg-white ${c}`} />
              <div className="mt-2 font-mono text-2xs font-semibold">{c}</div>
              <div className="text-2xs text-muted">{use}</div>
            </div>
          ))}
        </div>
      </Demo>
    </Grid>
  );
}

function Motion() {
  const items: [string, string, string][] = [
    ["ease-out", "cubic-bezier(.16,1,.3,1)", "Most movement: things settle in"],
    ["ease-spring", "cubic-bezier(.32,1.22,.42,1)", "Playful: switches, the notch"],
  ];
  return (
    <Grid cols={2}>
      {items.map(([cls, curve, use]) => (
        <Demo key={cls} title={`${cls} · ${curve}`}>
          <div className="group w-full">
            <div className="relative h-10 rounded-full bg-surface">
              <div className={`absolute left-1 top-1 size-8 rounded-full bg-brand transition-[left] duration-700 group-hover:left-[calc(100%-36px)] ${cls}`} />
            </div>
            <div className="mt-2 text-xs text-muted">{use}. Hover to play.</div>
          </div>
        </Demo>
      ))}
      <Demo title="Durations">
        <div className="text-sm text-ink-3">
          <b className="text-ink">100ms</b> hovers on rows · <b className="text-ink">150ms</b> buttons and fields ·{" "}
          <b className="text-ink">380ms</b> sheets and big panels. Everything stops for people who turn motion off.
        </div>
      </Demo>
      <Demo title="Control heights">
        <div className="flex items-end gap-3">
          {[
            ["h-control-xs", "30"],
            ["h-control-sm", "32"],
            ["h-control", "36"],
            ["h-control-lg", "42"],
          ].map(([c, px]) => (
            <div key={c} className="text-center">
              <div className={`w-14 rounded-sm bg-accent-tint ring-1 ring-accent-line ${c}`} />
              <div className="mt-1 text-2xs text-muted">{px}px</div>
            </div>
          ))}
        </div>
      </Demo>
    </Grid>
  );
}

export const foundations: Entry[] = [
  {
    id: "colours",
    name: "Colours",
    group: "Foundations",
    description: "Orange is for the main action (and fabrication), blue is for focus, selection and print. Everything else stays neutral.",
    Demo: Colours,
    code: `<div className="bg-surface text-ink border-line" />
<Button className="bg-brand hover:bg-brand-hover" />   // never a hex in a component
<span className="text-muted" />                       // labels and hints`,
  },
  { id: "typography", name: "Typography", group: "Foundations", description: "One typeface, a short scale. Most of the app is 13px; titles are 20px.", Demo: Typography },
  { id: "corners-shadows", name: "Corners & shadows", group: "Foundations", description: "Small corners on controls, bigger corners on bigger surfaces. Shadows only where something floats.", Demo: Shapes },
  { id: "motion", name: "Motion & sizes", group: "Foundations", description: "Quick and calm. Controls are 36px tall unless there is a reason not to be.", Demo: Motion },
];
