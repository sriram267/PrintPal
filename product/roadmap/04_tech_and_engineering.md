# 04 · Tech and engineering

> **What this file is:** how PrintPal is built and run. It covers the stack, where the code lives, the database, the API, sign-in and keeping shops apart, money maths, settings, running, testing, deploying, coding rules, weak spots and tech debt.
> **One of five files:** 01 Why · 02 Market and roadmap · 03 What is built · 04 Tech and engineering · 05 Decisions and open questions.
> **Last checked:** 20 Nov 2026, against the code (package files, server, database code, deploy files). This file replaces the older `tech_stack.md` plan from 15 Nov, which named tools PrintPal doesn't use (section 15).
> **Note for the Claude project:** you can't see the code. Paths are given so the founder can find a file and paste it to you.

---

## 1. At a glance

| Thing | Where / what |
|---|---|
| **App** | https://printpal-app.pages.dev. Cloudflare Pages project `printpal-app`. |
| **API server** | Fastify (Node.js) on Render at `printpal-api.onrender.com`. Auto-deploys from GitHub `main`. |
| **Database** | Neon Postgres in production. PGlite (Postgres running inside Node) is the local fallback. |
| **Sign-in** | Clerk, still on its *development* instance. |
| **Website** | https://printpal-web.pages.dev. Cloudflare Pages project `printpal-web`. |
| **Code** | GitHub `sriram267/PrintPal` holds the product, the UI library and a copy of the website. The website also has its own private repo, `sriram267/printpal-website`. |
| **Cost** | $0 a month. All free tiers. |
| **CI** | None. No GitHub Actions. Checks run when someone runs `npm run build` or the tests. |

---

## 2. How a request flows

```
Shop owner's browser
  │  loads the app from Cloudflare Pages (printpal-app.pages.dev)
  │  calls /api/... with the Clerk sign-in token
  ▼
Cloudflare Pages Function: product/printpal/functions/api/[[catchall]].js
  │  forwards every /api request unchanged (method, headers, body)
  ▼
Fastify API on Render (printpal-api.onrender.com)
  │  checks the Clerk token, works out the shop (tenant), runs the feature's code
  ▼
Neon Postgres (every shop-owned row carries a tenant_id)
```

- The app always calls the relative path `/api` (`src/shared/leadsService.ts`), so the browser only ever talks to `printpal-app.pages.dev`.
- **Render's free tier sleeps when idle.** The first request after a quiet spell can take a while. Meanwhile the app shows the copy of data it keeps in the browser. A save made while the server is unreachable stays only on that device ("saved on this device").
- **Locally:** `npm run dev` starts Vite on port 5173. If nothing answers on port 3001, it also starts the API there, and Vite forwards `/api` to it. Which database that local API uses depends on `.env` (section 9). Read the warning there.

---

## 3. Stack and versions

| Layer | What | Version (package.json) |
|---|---|---|
| Frontend | React, TypeScript (strict), Vite | React 18.3, TS 5.6, Vite 6 |
| Styling and UI | Tailwind CSS, Radix UI primitives, class-variance-authority, lucide icons | Tailwind 3.4 |
| UI components | The shared library `@printpal/ui` in `packages/ui` | 0.1.0 (internal) |
| Forms and checks | zod (customer and business-details validation) | zod 4 |
| Dates | date-fns | 4 |
| Server | Node.js, Fastify, `@fastify/cors`, `@fastify/rate-limit` | Fastify 5, Node 24 on the founder's laptop (Render's version not recorded) |
| Database access | Plain SQL through `pg` (Neon) or PGlite (local). No ORM. | pg 8, PGlite 0.5 |
| Sign-in | `@clerk/react` (browser), `@clerk/backend` (server) | 6.x, 3.x |
| Address and maps | Geoapify (address search as you type). Google Maps link for 360° street view (no key needed). | n/a |
| PDF | An HTML page and the browser's print to PDF | n/a |
| Website | Vite, React 18, TypeScript, plain CSS tokens, `@clerk/react` 6 | Separate package in `websiteprintpal/` |

---

## 4. Where the code lives

Repo root is `OneDrive/Desktop/Skills/`:

| Folder | What |
|---|---|
| `product/printpal/` | The app: frontend (`src/`), server boot (`server/server.mjs`), Cloudflare forwarder (`functions/`), tests (`tests/`), QA tools (`tools/qa/`), scripts (`scripts/`), plan docs (`docs/RESTRUCTURE_PLAN.md`) |
| `packages/ui/` | The shared UI component library and its preview page |
| `websiteprintpal/` | The marketing website (its own git repo, also tracked by the main repo) |
| `product/roadmap/` | These five docs |
| `product/req/` | Research: Indian signage industry, competitor analyses (file 02, section 7) |

### Feature folders (since 19 Nov 2026)
Every feature lives in `src/features/<area>/<feature>/` with up to four parts, `screen/`, `api/`, `db/` and `tests/`, plus a plain-English `README.md`.

| In the app | Folder |
|---|---|
| Leads → Customer / Enquiry / Supplier | `leads/customer`, `leads/enquiry`, `leads/supplier` (plus `leads/shared` for types and form checks) |
| Quotation / Quotation Reports / the PDF | `quotation/create-quote`, `quotation/reports`, `quotation/pdf` (plus `quotation/shared` for money maths) |
| Settings pages | `settings/business-details`, `products`, `materials`, `finishes`, `tax`, `supplier`, `starter-catalogue` |
| Sign-in, top bar, page switching | `src/app/` (App, LoginPage, TopNav, LeadsApp) |
| Used by two or more features | `src/shared/`, with server pieces in `src/shared/server/` (env, database, schema, auth, tenant context, repository, sign-up route) |

- `server/server.mjs` only boots Fastify and plugs in each feature's `api/*.routes.mjs`.
- `src/features/README.md` maps app menus to folders.
- **Known leftover:** `src/app/LeadsApp.tsx` (about 2,750 lines) still holds every page's data and save / delete handlers.

### Shared UI library: `packages/ui` (`@printpal/ui`)
- One place for design tokens (colours, type sizes, corners, shadows, motion), a Tailwind preset, and the components: core parts (button, input, select, checkbox, switch, card, tabs, dialog, popover, table, accordion …), Pal (mascot, greeting), product parts (the Pal notch, date picker, calendar, image upload, modal system, search select, sheet, layout pieces) and website blocks.
- `npm run dev` inside `packages/ui` opens a one-page preview on port 5190, with a left menu, a live demo of every component, where it is used, and a code sample.
- **The product is fully built on it.** The product has no UI parts of its own. The library was made to match the product exactly, proven with a 24-screen pixel comparison.
- **The website is not on it yet.**
- **Brand tokens:** ink `#202428`, muted `#737B84`, border `#DCE1E5`, **orange `#D7440E`** (main actions), **blue `#2878D0`** (focus, selection, print), surface `#F3F5F7`, font **Inter**, radius 8px.

---

## 5. Database

All tables are created, and migrated, **every time the server starts**, by `src/shared/server/schema.mjs`. It runs each feature's `db/*.schema.mjs` in a fixed order. There is no migration tool. All the SQL is written to be safe to re-run.

| Table | Holds |
|---|---|
| `tenants` | One row per shop |
| `customers` | Customer, contact, GSTIN, billing / shipping, follow-up, payment terms, credit limit (soft delete) |
| `sites` | Sites per customer: address, geo, contacts, delivery date, survey fields, services (JSON) |
| `enquiries` | Enquiries: contact, source, stage, note, survey fields, follow-up |
| `suppliers` | Supplier details, services, regions, addresses, terms (soft delete) |
| `products`, `materials`, `finishes` | The catalogue (soft delete) |
| `methods` | The six pricing methods, shared by all shops: `sq_ft`, `run_ft`, `sq_m`, `run_m`, `per_piece`, `lump_sum` |
| `quotations` | Quote header: number, date, stored status, subtotal, charges, discount, GST rate, grand total, notes (JSON) |
| `quote_lines` | Line items: site, product / material / finish *names*, method, size, quantity, rate, discount, billable quantity, total |
| `business_details` | The shop's own details for the PDF (one row per shop) |

- **IDs are text: `<prefix>-<time>-<random>`**, e.g. `cust-1763600000000-9f2c…` (since 20 Nov 2026; `src/shared/newId.ts` in the browser, `src/shared/server/newId.mjs` on the server). The time part keeps lists that sort by id (products, materials, finishes) in creation order. The random part means two shops can never make the same id and nobody can guess one. Older rows keep their clock-only ids (`cust-1763…`) and work as before.
- **Money** is stored as `NUMERIC(15,2)` / `NUMERIC(14,2)`.
- **Quote status:** the database stores `Draft`, `Sent` or `Invoice`. The screens show a *derived* status: Open (latest version), Renegotiated (older version) or Invoice (ticked).
- **Quote lines store names, not catalogue links**, so an old quote keeps its wording even if the catalogue changes.
- **Not created:** `tax_slabs`. It is defined in `settings/tax/db/tax.schema.mjs` but never run, so tax settings aren't saved.
- **Leftovers:** `org_legacy_default`, the placeholder shop holding pre-multi-shop demo data. It is now a read-only template.

---

## 6. API

Everything is under `/api`. Every route needs a valid Clerk sign-in except `GET /api/health`.

| Route | Does |
|---|---|
| `GET /api/health` | Health check (no database). Also says which commit is running (`version`, from Render's `RENDER_GIT_COMMIT`) and whether the database row rules are on (`rowRules`), so a deploy can be checked from outside. |
| `POST /api/auth/sync-user` | After sign-in: make sure the shop, its business details and its starter catalogue exist |
| `GET` · `POST /api/customers`, `DELETE /api/customers/:id` | List, save (create or update), delete |
| Same pattern for `enquiries`, `suppliers`, `products`, `materials`, `finishes` | |
| `GET /api/methods` | The six pricing methods |
| `POST /api/quotations` | Save a quote. The server recomputes every line and total. |
| `GET /api/quotations`, `GET /api/quotations/:id`, `DELETE /api/quotations/:id` | List, read, delete |
| `PATCH /api/quotations/:id/finalize` | Make the quote the invoice, or undo that |
| `GET` · `PUT /api/business-details` | The shop's own details |

- **Rate limit:** 300 requests a minute.
- **CORS:** only listed origins. These are `printpal-app.pages.dev`, `printpal.com` and `printpal.app` (neither domain is owned) and `localhost:5173–5177`.

---

## 7. Sign-in and keeping shops apart

### How it works (sign-in built 16 Nov 2026; shop separation hardened 20 Nov 2026)
- **Sign-in:** the server verifies the Clerk token on every request (`src/shared/server/auth.mjs`, using `CLERK_SECRET_KEY`). It works out the shop **only** from the verified user. A shop id sent by the browser is rejected.
- **Every shop's database work runs through `withTenant()`** (`src/shared/server/tenantSession.mjs`). Each call gets its own transaction on its own connection. Inside it:
  - it switches to the restricted `app_user` role (`SET LOCAL ROLE`), so the database's row rules (RLS, on all 10 shop tables) apply;
  - it sets the shop for that transaction only (`set_config('app.current_tenant_id', …, true)`), so the setting never leaks into another request.
- **At start-up, `prepareRowRules()` checks that the database login may switch to `app_user`, and that `app_user` can really use all 10 shop tables.** If anything is missing, it grants it and checks again. The result shows in the server log (`[DB] Row rules: ON` / `OFF`) and in `GET /api/health` (`rowRules`). With OFF, shops are still kept apart by the next two layers.
- **Every query filters by `tenant_id = $1`** (the application filter).
- **Every save refuses to overwrite another shop's row.** Saves are `INSERT … ON CONFLICT (id) DO UPDATE … WHERE <table>.tenant_id = EXCLUDED.tenant_id RETURNING id`. They never change `tenant_id`. If no row comes back, the id belongs to another shop: the save is refused, nothing is changed, and the API answers **409**. A quote and its lines save in one transaction, so a refused save leaves nothing half-written.
- **New ids carry a random part** (section 5), so two shops can't collide by accident and nobody can guess an id.
- **First sign-in and the starter catalogue** also run shop by shop. They read the template shop as the template and write the new shop as the new shop, so they work with the row rules on.

### Two data bugs found and fixed (20 Nov 2026, live since commit `1d6e5cc`)
1. **One shop could overwrite another shop's records.**
   - Every save was an unchecked `INSERT … ON CONFLICT (id) DO UPDATE`, which even rewrote `tenant_id`, with ids made from the browser clock.
   - The app never switched to `app_user`, and it set the shop with `set_config(…, false)` on a shared connection pool.
   - So a save carrying another shop's id overwrote that record and moved it to the saving shop, by accident (the same millisecond) or on purpose.
   - **Proven** on a test copy of the real code: Shop A's customer and its *locked invoice* moved to Shop B, because the invoice lock only checked the saving shop's own quotes.
2. **Every server start deleted the products, materials and finishes that shops added themselves.**
   - The start-up catalogue loader ran `DELETE … WHERE id LIKE 'prod-%'` (and `mat-%`, `fin-%`) across all shops, and shop-made items have exactly those ids.
   - Render restarts on every deploy and every wake from sleep.
   - **Proven** the same way. Now the loader only touches the template shop.
- **After the fix,** the same scripts show both problems gone. `tests/crossShopSave.test.mjs` (25 checks) covers every record type, with the row rules on and off, through the real API routes, first sign-in, a restart, and the start-up repair and fallback.
- **Live:** deployed 20 Nov 2026 (API on Render, app on Cloudflare). Production `GET /api/health` answers `"version":"1d6e5cc","rowRules":true`, so the live Neon database runs every shop's queries as `app_user`.
- **Not recoverable:** items lost to bug 2 before the fix can't be restored from the app.

The website still makes no data-safety claim. Whether to add one is now the founder's call (file 05).

---

## 8. Money maths

- One calculation for the screen and the server lives in `src/features/quotation/shared/`. It has `calcLine` (one line) and `quoteTotals` (the whole quote) as TypeScript for the screen, plus `*.server.mjs` copies for the server.
- Tests (`quoteTotals.test.mjs`, `calcLine.test.mjs`) keep the two copies identical.
- Rounding is half-up to paise.
- The server recomputes every line and total on save and rejects bad input: discount over 100%, negative GST, totals too large, a quote with no customer, an unknown pricing method, or a "create" with incomplete lines.
- GST on a quote is 18% or 12% (a switch), always split into CGST and SGST. **Check the 12% option with a CA** (file 02, section 5.2).

---

## 9. Settings and secrets

| Name | Set where | What it does |
|---|---|---|
| `DATABASE_URL` (+ `DATABASE_URL_UNPOOLED`) | Render env vars; local `.env` | Neon connection. If it is not set, the server uses PGlite in `product/printpal/data/pgdata`. |
| `CLERK_SECRET_KEY` | Render env vars; local `.env` | Server-side sign-in check |
| `VITE_CLERK_PUBLISHABLE_KEY` | Build environment of the app and the website | Public key for Clerk's screens |
| `VITE_GEOAPIFY_API_KEY` | Build environment of the app | Address search |
| `PORT`, `NODE_ENV` | Render | Server port and mode |
| `PGLITE_DIR` | Local only | Points a local run at a throwaway PGlite folder (only when `DATABASE_URL` is not set) |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | The founder's shell only (or `wrangler login`) | Deploying to Cloudflare Pages |

- **Values never go into code, docs, git or chat.** Credentials once pasted into chat were advised to be rotated.

> **Warning: local runs use the production database.** `product/printpal/.env` has a live `DATABASE_URL`, which the 17 Nov notes say is the **production** Neon database (confirm). The server loads `.env` on every start (Node 20.6+; the laptop has Node 24). So `npm run dev` on the laptop reads and writes real data, and runs the start-up migrations against production.
> - To work locally on PGlite, comment out `DATABASE_URL` in `.env` first.
> - Never run tests, `scripts/db-clear-all.mjs` or experiments with it set.
> - The older docs said local development uses PGlite. That is only true when `DATABASE_URL` is not set.

---

## 10. Run, build and test

- **Run locally:** `npm run dev` in `product/printpal` (Vite on 5173, API on 3001).
- **Never kill a running local API that uses PGlite.** After an unclean stop, its recovery code deletes `data/pgdata`.
- **Build:** `npm run build` runs `check-structure` (folder rules), then `tsc --noEmit`, then `vite build`. `npm run check:structure -- --strict` also fails on leftover legacy folders (clean since 19 Nov).
- **Tests:** 12 test files in `product/printpal/tests/` (eleven `*.test.mjs` plus `fullProductAudit.mjs`). There were **58 checks passing, 0 failing** at the last full run on 20 Nov 2026.
  - Run one file at a time: `node --test --test-reporter=tap tests/<file>`. The folder form fails on Windows.
  - Coverage:
    - quote maths identical on screen and server, and line calculation;
    - quotation creation, versions and renegotiation;
    - the reports accordion and follow-ups;
    - multi-shop isolation, and cross-shop saves refused (`crossShopSave`, 25 checks, row rules on and off);
    - a restart keeping each shop's catalogue items;
    - first sign-in;
    - toast copy, and a full product audit.
  - `multiTenant` and `crossShopSave` run on a throwaway in-memory database, never on `data/pgdata` or Neon.
  - **Live-server tests** (`followUpWorkflow`, `fullProductAudit`, `quoteMoneyLive`, `renegotiationWorkflow`):
    - they need throwaway Clerk test users and a running server. Create the users with `node tests/makeQaUsers.mjs` and remove them with `--delete`. Without them, these tests skip cleanly.
    - **careful:** they call the server on `localhost:3001`, which talks to production while `.env` holds the production `DATABASE_URL` (section 9).
- **Visual safety net:** `product/printpal/tools/qa/` screenshots 24 app states with Clerk stubbed and the API mocked from fixtures, then pixel-compares before and after a change (`capture.mjs`, `compare.mjs`).
  - It is used to prove a refactor changed nothing visible.
  - `settings-product-new` jitters slightly from text anti-aliasing. That is not a regression.
  - Hover, focus and open states aren't covered.
- **UI library:** `npm run build` in `packages/ui` first runs `scripts/check.mjs`. It checks that every export has a demo in the preview, every file is exported, and no hex colour sits outside the allowlist.

---

## 11. Deploy

| What | How | Notes |
|---|---|---|
| **API** (Render) | Push to GitHub `main`. Render auto-deploys (root `product/printpal`, start `npm start` = `node server/server.mjs`). | **Pushing to `main` is a production deploy of the API.** Check the Render dashboard afterwards. |
| **App** (`printpal-app`) | Manual: `npm run build`, then `npx wrangler pages deploy dist --project-name printpal-app` | Not connected to git. The deploy includes `functions/` (the API forwarder) and `public/_redirects`. |
| **Website** (`printpal-web`) | Manual, from `websiteprintpal/`: `npm run build`, then `npx wrangler pages deploy dist --project-name printpal-web --branch main` | The website code sits in two git repos (section 12). |

- Wrangler signs in through the founder's Cloudflare account (OAuth) or the env token.
- **Deploy only when the founder asks.**
- **After an API deploy,** open `https://printpal-app.pages.dev/api/health`. `version` should be the pushed commit and `rowRules` should be `true`. Render takes about a minute or two after the push.

---

## 12. Coding rules (for any developer, human or AI)

**Structure**
- New code goes into the right feature folder (section 4). `src/shared/` is only for things used by two or more features.
- Screens never import `api/` or `db/` code, and vice versa. `api/` and `db/` files are `.mjs`. The structure check enforces this on every build.
- Server copies of shared maths are named `*.server.mjs`, because Vite would otherwise pick a `.mjs` file over the `.ts` one.

**UI**
- Every UI part comes from `@printpal/ui`. A new part goes into the library first, with a demo in its preview.
- **Tailwind trap:** the library preset redefines `text-xs…xl` (`text-sm` = 13px), `rounded-*`, `font-mono`, `animate-spin` and the shadcn colour names (`muted` is a *text* colour there). Product parts use explicit values (`text-[14px]/5`, `rounded-[6px]`, `bg-[hsl(var(--primary))]`). Never use plain `bg-muted` or `text-primary` in product parts.
- Use only the brand tokens (section 4). No new hex colours outside the library.
- **The mascot:** never scale it with a CSS transform on an HTML wrapper, because Chromium blurs it. Scale inside the SVG. Keep `pal-greeting.ts` identical in the product and on the website (the MIT notice stays in its header).

**Copy**
- In-app messages follow the rules in file 03, section 9. Add every new message to `tests/toastMatrix.test.mjs`.

**Data and money**
- **Scope every query to the shop:** `tenant_id = $1`, from `req.tenantId`. Never trust a shop id or a row id from the browser (section 7).
- **Feature database code runs inside the repository**, which wraps every call in `withTenant()`. Any other code that touches shop tables (start-up seeding, sign-up) must use `withTenant(db, shop, tx => …)` and `tx.query`.
- **Write every save the same way:** `ON CONFLICT (id) DO UPDATE SET … WHERE <table>.tenant_id = EXCLUDED.tenant_id RETURNING id`, wrapped in `assertSaved(...)`. Never put `tenant_id` in the `SET` list.
- **New ids come from `newId("<prefix>")`:** `src/shared/newId.ts` in screens, `src/shared/server/newId.mjs` on the server. Never use bare `Date.now()` ids.
- **Schema changes** go in the feature's `db/*.schema.mjs` and must be safe to run on every start.
- Money only goes through the shared maths (section 8). Keep the screen and server copies identical, and keep the tests green.
- PDFs stay as HTML plus the browser's print. No PDF library and no server rendering.

**Change safety**
- The product's look is final. A refactor must change nothing visible. Prove it with the 24-screen comparison.
- Run the tests and `npm run build` before calling a change done.
- **Windows:** never rewrite source files with PowerShell `Get-Content` / `Set-Content`. They corrupt UTF-8 characters such as — and × and add BOMs. Use an editor or UTF-8-safe tools.
- **Git:** `websiteprintpal/` is tracked by its own repo **and** the main repo, so commit and push both. Before any git command inside it, check that `git rev-parse --show-toplevel` is the website folder.
- No secrets in code, docs or commits.

**Working without the code (the Claude project)**
- Ask the founder to paste the current file before changing it. Never guess file contents, function names or paths that aren't listed here.
- Hand over either complete files with their paths, or a **task brief for Claude Code**, which works inside the repo. A brief covers the goal, the files involved, the rules from this section that apply, and the checks that prove it works.

---

## 13. Weak spots and tech debt

| Priority | Item | Where |
|---|---|---|
| **High** | Local `.env` points at the production database (section 9). Running `npm run dev` on the laptop also runs the start-up code against production. | `product/printpal/.env` |
| Medium | A save the server refuses still looks saved. The screens treat any failed save as "kept on this device" and never show the server's error. Older than the 20 Nov fix; an honest user can't trigger a refusal now that ids are random. | `src/shared/leadsService.ts` |
| Medium | Neon connection skips certificate checks (`ssl: { rejectUnauthorized: false }`) | `src/shared/server/database.mjs` |
| Medium | Tax slabs aren't saved: no API, no table, browser memory only. Default slabs are placeholders. | `settings/tax/` |
| Medium | No CI. Checks only run when someone runs them. | n/a |
| Low | CORS list includes unowned domains (`printpal.com`, `printpal.app`) and five localhost ports. Update it when the real domain is bought. | `server/server.mjs` |
| Low | Unused packages: `drizzle-orm`, `xlsx` (the npm version of `xlsx` has published security advisories), `@neon/config`, `@neon/env`. Remove them. | `product/printpal/package.json` |
| Low | Starter catalogue exists twice (`starter-catalogue/db/seedData.json` and `starter-catalogue/screen/seedCatalog.ts`). Make it one. | `settings/starter-catalogue/` |
| Low | `LeadsApp.tsx` (about 2,750 lines) holds every page's state and handlers. Split it into per-feature hooks. | `src/app/` |
| Low | The Supplier switch and the tax list live in the browser, not per shop on the server | Settings |
| Low | `leadsService` may still have unused browser-storage paths | `src/shared/leadsService.ts` |
| Low | The `org_legacy_default` placeholder shop | Neon |
| Low | Website not on the shared UI library | `websiteprintpal/` |
| Info | `scripts/db-clear-all.mjs` wipes data. Never run it against production. Other helpers: `check_neon.mjs`, `seedDataRealistic.mjs`, `buildSeedCatalog.cjs`. | `product/printpal/scripts/` |
| Info | Render's free tier sleeps. A keep-alive pinger (UptimeRobot) was planned on 15 Nov but isn't known to be set up. | Render |

---

## 14. Scaling later (Planned guardrails)

- **Stay on free tiers until there are paying customers:** Cloudflare Pages, Render, Neon, Clerk. Check each one's current free limits before relying on them. They change.
- **When scale needs it:**
  - a job queue (BullMQ on Redis) for PDFs, images and WhatsApp webhooks;
  - a workflow engine (Temporal) for long job lifecycles (lead → quote → advance payment → job card → dispatch → install).
- **Guardrail:** no Kafka, Temporal or microservices until a real workflow needs them.
- **UI library:** stays in this repo until there is a second developer or designer, or a third app. Then it moves to its own private repo as a versioned package.
- **Website onto the UI library:** same method as the product (match exactly, pixel compare). Not started.

---

## 15. Earlier plan vs what was built

The `tech_stack.md` plan (15 Nov 2026) said one thing. This is what actually happened:

| Plan | Reality |
|---|---|
| Vercel or Cloudflare Pages | Cloudflare Pages |
| Fastify in TypeScript | Fastify in plain JavaScript modules (`.mjs`) |
| Drizzle ORM and migrations | Plain SQL through `pg`. Schema created at start-up. Drizzle installed but unused. |
| GitHub Actions CI/CD | No CI. Render auto-deploys from `main`. Cloudflare deploys are manual. |
| A Neon branch per pull request | Not used |
| UptimeRobot keep-alive | Not known to be set up |
| shadcn/ui | Radix-based components, now all in `@printpal/ui` |
| Health check at `/health` | `GET /api/health` |
| Bind Fastify to `0.0.0.0` for Render | Done (`server/server.mjs`) |
