# Shared — used by two or more features

Small helpers that more than one feature needs: talking to the server, checking which shop is signed in,
formatting helpers. If only one feature uses something, it belongs in that feature's folder instead.

## `server/` — what every feature's server code stands on

| File | What it does |
|---|---|
| `env.mjs` | Loads `.env` before anything reads settings |
| `database.mjs` | Connects to the database: Neon when `DATABASE_URL` is set, otherwise a local folder (`PGLITE_DIR` can point it at a throwaway one) |
| `schema.mjs` | Creates every table (each is defined in its feature's `db/`), then the multi-shop migrations and security rules |
| `tenants.schema.mjs` | The table of shops |
| `tenantContext.mjs` | Works out which shop a request belongs to |
| `auth.mjs` | The sign-in check on every request |
| `account.routes.mjs` | After sign-in: creates the shop, its business details and its starter catalogue |
| `repository.mjs` | Puts every feature's `db/` code together into one `repo` object; every call runs through `tenantSession.mjs` |
| `tenantSession.mjs` | Keeps shops apart: runs each shop's database work in its own transaction, as the restricted `app_user` role, with the shop set for that transaction only. Also the "this record belongs to another shop" refusal (409) |
| `newId.mjs` | New record ids made on the server: `<prefix>-<time>-<random>` |

## Screen helpers

| File | What it does |
|---|---|
| `leadsService.ts` | The screens' calls to the server, with the copy kept in the browser |
| `newId.ts` | New record ids made in the browser: `<prefix>-<time>-<random>` (same format as `server/newId.mjs`) |

Still to move here: `src/core/apiClient.ts`, `src/lib/utils.ts` (screen helpers).
