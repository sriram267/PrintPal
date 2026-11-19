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
| `repository.mjs` | Puts every feature's `db/` code together into one `repo` object |

Still to move here: `src/core/apiClient.ts`, `src/lib/utils.ts` (screen helpers).
