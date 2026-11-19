# Tax

**Where in the app:** Settings → **Tax Setting**

The GST / tax slabs your shop uses (CGST, SGST, IGST).

**Known gap:** taxes are not saved today. The list lives only in the screen while it is open, so `api/` and `db/` are empty on purpose. Saving taxes is a separate feature to build.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

This folder is new (restructure phase A1). Until the code is moved here, it still lives in:
`src/modules/settings/features/tax/`, tax page and Add / Edit tax pop-up in `LeadsApp.tsx`

See `docs/RESTRUCTURE_PLAN.md` for the plan.
