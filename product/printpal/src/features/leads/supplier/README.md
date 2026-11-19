# Supplier

**Where in the app:** Leads → **Supplier** tab (shown when suppliers are switched on in Settings)

Suppliers and vendors: the supplier list, the supplier drawer (details, address, services and locations they serve), and saving suppliers.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## What is here, and what is still elsewhere

**Here:** `screen/SupplierList.tsx`, `screen/SupplierForm.tsx`; `api/`, `db/`.

**Still elsewhere (tidied up in A4):** The state it shows and the save / delete handlers are still shared in `src/app/LeadsApp.tsx`; types and server calls in `src/modules/leads/`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
