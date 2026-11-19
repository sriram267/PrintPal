# Enquiry

**Where in the app:** Leads → **Enquiry** tab

Quick enquiries before someone becomes a customer: the enquiry list, the enquiry form, follow-up dates, and saving enquiries.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

**Already here (A2):** `api/enquiries.routes.mjs`, `db/enquiries.db.mjs`, `db/enquiries.schema.mjs`.

**Still to move (A3):** the screen — it still lives in `src/modules/leads/LeadsApp.tsx` (enquiry list, row, form).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
