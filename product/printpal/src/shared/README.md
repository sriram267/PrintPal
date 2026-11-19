# Shared — used by two or more features

Small helpers that more than one feature needs: talking to the server, checking which shop is signed in,
formatting helpers. If only one feature uses something, it belongs in that feature's folder instead.

Until the code is moved here, it still lives in: `src/core/apiClient.ts`, `src/lib/utils.ts`, `server/tenantContext.mjs`.
