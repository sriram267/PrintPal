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

## What is here, and what is still elsewhere

**Here:** `screen/TaxPage.tsx`, `screen/TaxModal.tsx`, `screen/TaxSettingsCard.tsx`, `screen/taxes.ts` (default slabs); `db/tax.schema.mjs` (a planned table, not created yet).

**Still elsewhere:** The state it shows and the save / delete handlers are still shared in `src/app/LeadsApp.tsx`. Taxes are still not saved anywhere (known gap).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
