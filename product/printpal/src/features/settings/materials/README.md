# Materials

**Where in the app:** Settings → **Materials**

Sheets and substrates: thickness, sheet size, supplier, notes, and whether each suits indoor, outdoor or coastal sites.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

**Already here (A2):** `api/materials.routes.mjs`, `db/materials.db.mjs`, `db/materials.schema.mjs`.

**Still to move (A3):** the screen — it still lives in `src/modules/leads/LeadsApp.tsx` (materials page, row, material pop-up).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
