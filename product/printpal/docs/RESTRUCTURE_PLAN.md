# PrintPal code structure + UI library — plan and file map

Status: **A0, A1 and Track B (B0–B5) done (2026-11-19).** Folders and READMEs exist in `src/features/`, `src/app/`,
`src/shared/`; `npm run check:structure` runs before every build. The UI library lives in `packages/ui`
(`npm run dev` there opens the preview page; see `packages/ui/README.md`).
**A2 done:** the server is split into each feature's `api/` and `db/`; `server/server.mjs` only starts up and plugs features in;
shared server pieces are in `src/shared/server/`. Old and new were booted side by side and are identical (routes, responses,
schema, indexes, constraints, security policies, seed).
**A3 done:** every screen's layout (lists, forms, pop-ups, page sections, top bar, settings menu) is in its feature's
`screen/` folder; `src/app/LeadsApp.tsx` (6,797 → about 2,750 lines) keeps page switching, the data and the save / delete
handlers. 24 screens were screenshotted before and after and match. Next: A4 (move the remaining shared types, form checks
and server calls next to their features; delete dead files).

## The goal in one paragraph

Every feature lives in **one folder**, named the way people talk about it (Customer, Enquiry, Supplier, Tax…).
Inside each feature folder there are always the same four folders, so anyone — developer or not — knows where to look:

| Folder   | What is inside, in plain words |
|----------|--------------------------------|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/`    | The server side: the web addresses the screen calls (save, list, delete) |
| `db/`     | The database side: how the data is stored and read |
| `tests/`  | Checks that the feature still works |
| `README.md` | Two or three plain sentences: what this feature is and what is in the folder |

The product and website **look and behave exactly the same** after this work. Only where the code lives changes.
Separately, a **UI component library** is built so every future screen uses the same building blocks.

## Target structure

```
product/printpal/
  src/
    app/                      the frame around everything: sign-in, top bar, menu, the Pal notch, global styles
    features/
      leads/
        customer/             screen/ api/ db/ tests/ README.md
        enquiry/              screen/ api/ db/ tests/ README.md
        supplier/             screen/ api/ db/ tests/ README.md
      quotation/
        create-quote/         making a quote (sites, lines, charges, GST)
        reports/              Quotation Reports: versions, renegotiation, ticking the invoice
        pdf/                  the printed quotation / invoice sheet
        shared/               money maths used by all three (line totals, GST, formatting)
      settings/
        business-details/
        products/
        materials/
        finishes/
        tax/
        supplier/             the "use suppliers" on/off switch
        starter-catalogue/    the products, materials and finishes every new shop starts with
    shared/                   only things two or more features use (server connection, small helpers)
  server/
    server.mjs                only starts the server and plugs in each feature's api/ — no feature code
packages/ui/                  the PrintPal UI component library (Track B), with its own preview page
```

## Phases

**Track A — code structure** (no change in behaviour; the tests below are the safety net)

| Phase | What | Done when |
|---|---|---|
| A0 ✅ | Map every file to its feature; record the test baseline | You approve this map |
| A1 ✅ | Create the folders, the plain READMEs, and a check that fails if a file is in the wrong place | You can find any feature by name |
| A2 ✅ | Move the server code: `server.mjs` + `repository.mjs` split into each feature's `api/` and `db/`. Same web addresses | All tests pass, same answers from the server |
| A3 ✅ | Split `LeadsApp.tsx` into each feature's `screen/`, one feature at a time | Each screen identical to before (screenshots compared) |
| A4 | Move types, checks and formatters next to their feature; delete the dead files listed below | No loose files left |

**Track B — UI component library** (new code only; product and website are not changed)

| Phase | What | Done when |
|---|---|---|
| B0 ✅ | Foundations: colours, type, spacing, corners, shadows, motion — written once, taken from today's product and website | One source for every value |
| B1 ✅ | Core components (~25): button, input, select, checkbox, switch, badge, card, tabs, tooltip, dialog, dropdown, table… | Each shown with all its states |
| B2 ✅ | Product components (~15): Pal, notch, toasts, modals, date picker, image upload, stepper, empty state… | Look identical to the live app |
| B3 ✅ | Website blocks (~10): nav, footer, section, FAQ, tab rail, quote window, CTA band | Look identical to the live site |
| B4 ✅ | Preview page: `npm run dev` inside `packages/ui` opens one scrolling page, left panel of names, click to jump | Everything reviewable in one place |
| B5 ✅ | Rules: "how to add a component", and a check that new code uses the library | Written and enforced |

Order: A1 → B0–B4 → A2–A4.

---

## A0 — the file map

### Test baseline (2026-11-19)

All 11 test files pass — **34 checks, 0 failures**:
calcLine 13 · followUpWorkflow 1 · fullProductAudit 1 · multiTenant 8 · quotationAccordion 1 · quotationCreation 2 ·
quotationFlow 1 · quoteMoneyLive 1 · quoteTotals 1 · renegotiationWorkflow 1 · toastMatrix 4.
(quoteMoneyLive, renegotiationWorkflow and part of multiTenant need a running server and skip cleanly without one.)

These tests **read source files by their path**, so their paths must be updated as files move:
quotationAccordion, quotationCreation, quotationFlow, quoteTotals, renegotiationWorkflow, toastMatrix, calcLine, multiTenant.

### Server (today: 2 big files)

| Today | Goes to |
|---|---|
| `server.mjs` routes `/api/customers` | `features/leads/customer/api/` |
| `server.mjs` routes `/api/enquiries` | `features/leads/enquiry/api/` |
| `server.mjs` routes `/api/suppliers` | `features/leads/supplier/api/` |
| `server.mjs` routes `/api/products`, `/api/materials`, `/api/finishes` | `features/settings/products|materials|finishes/api/` |
| `server.mjs` route `/api/methods` (pricing methods) | `features/quotation/create-quote/api/` |
| `server.mjs` routes `/api/quotations` (list, get, save, finalize, delete) | `features/quotation/reports/api/` (save → `create-quote/api/`) |
| `server.mjs` routes `/api/business-details` | `features/settings/business-details/api/` |
| `server.mjs` `/api/health`, `/api/auth/sync-user`, start-up, auth check | `server/server.mjs` + `src/shared/server/` |
| `repository.mjs` (1,097 lines, all database code) | split the same way into each feature's `db/` |
| `tenantContext.mjs` (which shop is signed in) | `src/shared/server/` |
| `calcLine.mjs`, `quoteTotals.mjs` (server copies of the quote maths) | `features/quotation/shared/` (kept identical to the screen copies — a test checks this) |
| `catalogueCopy.mjs` + `seedData.json` (catalogue given to a new shop) | `features/settings/starter-catalogue/` |

### Screens (today: mostly one 7,228-line file, `LeadsApp.tsx`)

| Part of `LeadsApp.tsx` (line numbers today) | Goes to |
|---|---|
| Top bar, menu, notch mount, page switching (≈ 936–3560) | `app/` |
| Customer list, row, empty picture, New/Edit customer drawer: basic details, sites, billing & shipping, multi-site pop-up (≈ 141, 559–616, 5848–7330) | `features/leads/customer/screen/` |
| Enquiry list, row, empty picture, enquiry form (≈ 193, 617–690, drawer parts) | `features/leads/enquiry/screen/` |
| Supplier list, row, empty picture, supplier drawer: details, address, services & locations (≈ 250, 691–742, 4353–4848) | `features/leads/supplier/screen/` |
| Products page, row, empty picture, product pop-up with finishes/materials, quick-add product (≈ 309, 743–827, 3759–3815, 5190–5400, 7329–7488) | `features/settings/products/screen/` |
| Materials page, row, empty picture (≈ 366, 828–865, 3816–3867) | `features/settings/materials/screen/` |
| Finishes page, row, empty picture (≈ 391, 866–903, 3868–3919) | `features/settings/finishes/screen/` |
| Tax page and Add/Edit tax pop-up, default taxes (≈ 94–105, 3920–4036, 7489–…) | `features/settings/tax/screen/` |
| Supplier on/off page (≈ 4037–4065) | `features/settings/supplier/screen/` |
| `getNextQuoteVersion` (≈ 904) | `features/quotation/reports/` |
| `createDefaultSite` (≈ 7599) | `features/leads/customer/` |
| `SearchableActionSelect` (≈ 412–558), address search (Geoapify) | candidates for the UI library (Track B); until then `shared/` |
| The exact split lines are confirmed feature by feature in A3. | |

| Other screen files today | Goes to |
|---|---|
| `QuotationView.tsx` | `features/quotation/create-quote/screen/` |
| `QuotationReportsView.tsx` | `features/quotation/reports/screen/` |
| `QuotePDFPreview.tsx` | `features/quotation/pdf/screen/` |
| `quotation/calcLine.ts`, `quoteTotals.ts`, `quoteFormatters.ts`, `types.ts` | `features/quotation/shared/` |
| `leads/types.ts` | split into each feature (customer, enquiry, supplier, products…) |
| `leads/validation.ts` | `customer/` and `enquiry/` (their form checks) |
| `leads/leadsService.ts` (how screens call the server) | split into each feature's `screen/` |
| `leads/seedCatalog.ts` | `features/settings/starter-catalogue/` |
| `leads/leads.css` (2,326 lines) | split into each feature; shared bits to `app/` |
| `settings/features/business-details/*` | `features/settings/business-details/` |
| `settings/features/tax/*` | `features/settings/tax/` |
| `settings/features/supplier-toggle/*` | `features/settings/supplier/` |
| `settings/config/settingsMenu.config.ts` | `features/settings/` (the settings menu) |
| `modules/auth/LoginPage.tsx`, `App.tsx`, `main.ts`, `style.css` | `app/` |
| `core/apiClient.ts`, `lib/utils.ts` | `shared/` |
| `components/ui/*` (17 live files) | stay until Track B moves them into `packages/ui` |

### Dead files — nothing in the app uses them (to delete in A4)

- 61 unused components in `components/ui/` (old shadcn copies: accordion, alert, avatar, banner, breadcrumb, carousel, chip, combobox, command, data-table, dialog, dropdown-menu, empty-state, form, menubar, modal-variants (1,776 lines), pagination, sheet, sonner, stat-card, tabs, tooltip, tree-view, …)
- `modules/leads/leads.ts` — an old 1,422-line controller from before React
- `modules/leads/BillingReportsView.tsx` — an old re-export
- The empty "schema" files nothing reads: `leads/features/*/db/*.schema.ts`, `product/features/catalog/db/product.schema.ts`, `quotation/db/quotation.schema.ts`, `quotation/backend/quotation.routes.ts`, `src/db/schema.ts`
- The re-export "barrel" files: `modules/index.ts`, `leads/index.ts`, `product/*`, `quotation/index.ts`, `settings/index.ts`

### Findings while mapping (not changed by this work)

- **Tax settings are not saved anywhere.** The tax list lives only in the screen's memory (only the "apply taxes" switch is kept in the browser). There is no tax API or database table, so added taxes disappear on reload. The `tax` folder will start with `screen/` only; saving taxes is a separate feature to build.
- The starter catalogue exists twice: `server/seedData.json` and `src/modules/leads/seedCatalog.ts`. They should become one in `starter-catalogue/` (A4, only if the content is identical).
- `leadsService.ts` still has old browser-storage code paths next to the server calls; A4 checks which are still used.
