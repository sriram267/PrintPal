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

## What is here, and what is still elsewhere

**Here:** `screen/CustomerList.tsx` (rows, empty state, list body), `screen/CustomerForm.tsx` (the New / Edit customer drawer — it also has the enquiry mode), `screen/MultiSiteModal.tsx`, `screen/sites.ts`; `api/`, `db/`.

**Still elsewhere (tidied up in A4):** The state it shows and the save / delete handlers are still shared in `src/app/LeadsApp.tsx`; types in `src/modules/leads/types.ts`, form checks in `src/modules/leads/validation.ts`, server calls in `src/modules/leads/leadsService.ts`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
