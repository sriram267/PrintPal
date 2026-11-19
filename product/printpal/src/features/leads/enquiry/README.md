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

## What is here, and what is still elsewhere

**Here:** `screen/EnquiryList.tsx` (rows, empty state, list body); `api/`, `db/` — the enquiry form is the enquiry mode of `../customer/screen/CustomerForm.tsx`.

**Still elsewhere (tidied up in A4):** The state it shows and the save / delete handlers are still shared in `src/app/LeadsApp.tsx`; types, form checks and server calls in `src/modules/leads/`.

See `docs/RESTRUCTURE_PLAN.md` for the plan.
