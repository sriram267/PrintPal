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

## What is here, and what is still elsewhere

**Here:** `screen/QuotationView.tsx`; `api/`, `db/`.

**Still elsewhere:** Record types it shares with Leads are in `leads/shared/types.ts`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
