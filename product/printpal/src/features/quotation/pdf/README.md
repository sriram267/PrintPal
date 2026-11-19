# Quotation PDF

**Where in the app:** The printed sheet that slides out of the Pal notch (Quotation or Invoice)

The A4 quotation / invoice sheet: your logo, GSTIN and signature, the lines, totals and GST, and Download.

## What is in this folder

| Folder | What is inside |
|---|---|
| `screen/` | What you see: the page, forms, lists, pop-ups, and how the screen talks to the server |
| `api/` | The server side: the web addresses the screen calls (save, list, delete) |
| `db/` | How the data is stored in and read from the database |
| `tests/` | Checks that this feature still works |

## Moving in progress

This folder is new (restructure phase A1). Until the code is moved here, it still lives in:
`src/modules/leads/QuotePDFPreview.tsx`

See `docs/RESTRUCTURE_PLAN.md` for the plan.
