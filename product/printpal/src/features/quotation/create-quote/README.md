# Create quote

**Where in the app:** **Quotation** page

Making a quotation: pick a customer, price every site and service, add charges, discount and GST, then print it out of the Pal notch.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

This folder is new (restructure phase A1). Until the code is moved here, it still lives in:
`src/modules/leads/QuotationView.tsx`, `server/server.mjs` (`POST /api/quotations`, `/api/methods`)

See `docs/RESTRUCTURE_PLAN.md` for the plan.
