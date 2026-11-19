# Refactor safety tools

Used during the folder restructure (A3 and A4) to prove that nothing visible changed. They are kept here so anyone can repeat the check.
The paths inside them point at the machine they were written on (`APP`, `scratchpad`); edit the constants at the top of each file before use.

| File | What it does |
|---|---|
| `move.mjs` | Moves files with `git mv` and fixes every import that pointed at them. Input: a JSON list of `[from, to]` |
| `tsls.cjs` | Moves single functions between files using the TypeScript compiler (used to split `LeadsApp.tsx`) |
| `qa.vite.config.mjs`, `clerk-stub.jsx` | A copy of the app that runs without sign-in or a server |
| `make-fixtures.mjs`, `fixtures.json` | Sample data the screens show, produced by the real server code |
| `capture.mjs <folder> [screen]` | Takes 24 screenshots of the app's screens with a fixed clock |
| `compare.mjs <before> <after> [diff]` | Pixel-compares two screenshot folders |
| `a4-dead.mjs [--delete]` | Lists (or deletes) component files that nothing reaches from `main.ts` |

Method: take screenshots on the old code, make the change, take them again, compare. `settings-product-new` shows tiny text anti-aliasing jitter between runs; that is not a change.