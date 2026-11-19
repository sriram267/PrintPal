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

## What is here, and what is still elsewhere

**Here:** `screen/MaterialsPage.tsx`, `screen/MaterialList.tsx`, `screen/MaterialForm.tsx`; `api/`, `db/`.

**Still elsewhere (tidied up in A4):** The state it shows and the save / delete handlers are still shared in `src/app/LeadsApp.tsx`; types and server calls in `src/modules/leads/`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
