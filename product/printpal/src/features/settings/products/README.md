# Products

**Where in the app:** Settings → **Products**

Your catalogue of signage products, and which materials and finishes each product can be made with.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

This folder is new (restructure phase A1). Until the code is moved here, it still lives in:
`src/modules/leads/LeadsApp.tsx` (products page, row, product pop-up, quick-add), `server/server.mjs` (`/api/products`)

See `docs/RESTRUCTURE_PLAN.md` for the plan.
