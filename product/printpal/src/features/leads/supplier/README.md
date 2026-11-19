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

## Moving in progress

This folder is new (restructure phase A1). Until the code is moved here, it still lives in:
`src/modules/leads/LeadsApp.tsx` (supplier list, row, drawer), `server/server.mjs` (`/api/suppliers`), `server/repository.mjs`

See `docs/RESTRUCTURE_PLAN.md` for the plan.
