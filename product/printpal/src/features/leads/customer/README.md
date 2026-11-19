# Customer

**Where in the app:** Leads → **Customer** tab

Everything about customers: the customer list, the New / Edit customer drawer (basic details, sites, billing and shipping addresses), and saving customers.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

**Already here (A2):** `api/customers.routes.mjs`, `db/customers.db.mjs`, `db/customers.schema.mjs` (customers + sites tables).

**Still to move (A3):** the screen — it still lives in `src/modules/leads/LeadsApp.tsx` (customer list, row, drawer, multi-site pop-up).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
