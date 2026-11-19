# PrintPal UI

The one place PrintPal screens get their building blocks from — for the app **and** the website.
Every colour, size and component lives here, so new features always look and behave the same.

## See everything

```bash
cd packages/ui
npm install      # first time only
npm run dev      # opens the preview page in your browser
```

The preview page is one scrolling page with every component. The left menu lists them by group
(Foundations, Core, Pal, Product, Website); click a name to jump to it, or type in the search box.
Each component shows its variants and states, where it is used today, and a short code example you can copy.
A link like `http://localhost:5190/#notch` opens straight at that component.

## What is inside

| Folder | What it holds |
|---|---|
| `src/tokens/tokens.css` | Every colour, corner, shadow, height and motion value. **The only place a colour is written.** |
| `tailwind.preset.js` | Turns the tokens into Tailwind classes (`bg-brand`, `text-muted`, `rounded-xl`, `h-control`, `shadow-dialog`…). |
| `src/core/` | Everyday building blocks: Button, Input, Field, Select, Checkbox, Switch, Badge, Card, Tabs, Dialog, DataTable… |
| `src/pal/` | Pal, our mascot, and its greeting. |
| `src/product/` | Pieces made for the app: the notch (pill, toasts, printer), top bar, page header, settings menu, date picker, sheet… |
| `src/website/` | Pieces made for the website: logo, nav, section, heading, tab rail, CTA band, footer… |
| `preview/` | The preview page. `preview/demos/` has one entry per component. |
| `scripts/check.mjs` | The rules check (below). |

## Using it in an app

```tsx
// once, at the app's entry point
import "../../packages/ui/src/styles/index.css";

// anywhere
import { Button, Field, Input, NotchToast } from "../../packages/ui/src";
```

```js
// the app's tailwind.config.js
import preset from "../../packages/ui/tailwind.preset.js";
export default { presets: [preset], content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"] };
```

The product and website are finished and still use their own copies today. **New screens and features use this library.**

## Rules

1. **Never write a colour in a component.** Use a token class (`bg-brand`, `text-ink`, `border-line`). Need a new colour? Add it to `tokens.css` first.
2. **One orange button per screen** — the main thing people came to do. Blue is for focus, selection and print.
3. **Every component is on the preview page.** If it isn't shown there, it doesn't exist.
4. **Plain words.** Labels and messages say what happens in shop-owner language ("Quote saved", not "Mutation succeeded").
5. **Keyboard and screen readers work.** Icon-only buttons need a `label`; fields get their label through `<Field>`.

`npm run check` enforces 1 and 3, and runs before every build:
- every exported component must appear on the preview page;
- every component file must be exported from `src/index.ts`;
- a hard-coded hex colour that is not in `scripts/hex-allowlist.json` fails. (That list holds the exact shades copied from
  today's product and website; it should only ever shrink.)

## Adding a component

1. Check the preview page first — maybe it exists, or an existing one needs a new variant instead.
2. Create the file in the right folder: `src/core/` if both apps could use it, `src/product/` or `src/website/` if not.
3. Build it from tokens and existing components. Write a one-line comment saying what it is for, in plain words.
4. Export it from `src/index.ts`.
5. Add an entry in `preview/demos/<group>.tsx`: name, one plain sentence, where it is used, a demo of every variant and
   state, and a short code example.
6. Run `npm run build`. It fails until steps 4 and 5 are done.
