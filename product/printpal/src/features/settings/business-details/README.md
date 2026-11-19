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

## Moving in progress

**Already here (A2):** `api/businessDetails.routes.mjs`, `db/businessDetails.db.mjs`, `db/businessDetails.schema.mjs`.

**Still to move (A3):** the screen — it still lives in `src/modules/settings/features/business-details/`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
