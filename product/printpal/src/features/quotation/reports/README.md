# Quotation reports

**Where in the app:** **Quotation Reports** page

All quotations per customer, newest version on top: revise (renegotiate), delete, and tick a version to make it the invoice.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

**Already here (A2):** `api/quotations.routes.mjs` (list, open, finalize, delete) — it reads quotations through `create-quote/db/`.

**Still to move (A3):** the screen — it still lives in `src/modules/leads/QuotationReportsView.tsx`, `getNextQuoteVersion` in `LeadsApp.tsx`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
