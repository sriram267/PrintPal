# Supplier switch

**Where in the app:** Settings → **Supplier**

The on / off switch that shows or hides the Supplier tab in Leads.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## What is here, and what is still elsewhere

**Here:** `screen/SupplierSwitchPage.tsx`, `screen/SupplierToggleCard.tsx`.

**Still elsewhere (tidied up in A4):** The switch's on / off state is in `src/app/LeadsApp.tsx` (kept in the browser).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
