# Features — find the right folder

Every part of PrintPal you can see in the app has **one folder**. Open that folder and you will find everything about it:
what you see (`screen/`), the server side (`api/`), the database (`db/`) and its checks (`tests/`).

| In the app | Folder |
|---|---|
| Leads → Customer | `leads/customer/` |
| Leads → Enquiry | `leads/enquiry/` |
| Leads → Supplier | `leads/supplier/` |
| Quotation | `quotation/create-quote/` |
| Quotation Reports | `quotation/reports/` |
| The printed quotation / invoice | `quotation/pdf/` |
| Settings → Business Details | `settings/business-details/` |
| Settings → Products | `settings/products/` |
| Settings → Materials | `settings/materials/` |
| Settings → Finishes | `settings/finishes/` |
| Settings → Tax Setting | `settings/tax/` |
| Settings → Supplier | `settings/supplier/` |
| The catalogue every new shop starts with | `settings/starter-catalogue/` |

Not a feature? Look in `src/app/` (the frame around everything: sign-in, top bar, menu, Pal notch) or `src/shared/`
(small helpers used by two or more features).

## Rules (checked automatically by `npm run check:structure`)

1. A feature folder contains only `README.md` and the folders `screen/`, `api/`, `db/`, `tests/`.
2. `api/` and `db/` run on the server, so they hold plain JavaScript (`.mjs`).
3. `screen/` must never import from `api/` or `db/` — that would ship server code to the browser.
4. Something used by two or more features goes to `src/shared/` (or `quotation/shared/` for quote maths), not copied.
5. A new feature = a new folder with a `README.md` that says, in plain words, what it is and where it is in the app.
