# Starter catalogue

**Where in the app:** Not a page: it fills Products, Materials and Finishes for every new shop

The 33 products, 30 materials and 23 finishes every new shop starts with, and the code that copies them into a new shop.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

**Already here (A2):** `db/seedData.json` (the catalogue), `db/catalogueCopy.mjs` (copies it into a new shop), `db/seedDefaultCatalogue.mjs` (loads it at start-up).

**Still to move (A3):** the screen — it still lives in `src/modules/leads/seedCatalog.ts` (the screen's copy of the catalogue).

See `docs/RESTRUCTURE_PLAN.md` for the plan.
