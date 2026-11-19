# Business details

**Where in the app:** Settings → **Business Details**

Your shop's details: logo, legal name, addresses, GSTIN / PAN, contact info and signature. They appear on every quotation.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## What is here, and what is still elsewhere

**Here:** `screen/BusinessDetailsView.tsx`, `screen/businessDetails.types.ts`, `screen/businessDetails.validation.ts`; `api/`, `db/`.

**Still elsewhere:** Nothing.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
