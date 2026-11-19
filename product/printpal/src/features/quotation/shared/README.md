# Quotation — shared money maths

Used by **Create quote**, **Quotation reports** and the **PDF**, and by the server, so all of them always show the same numbers.

What goes here: line totals for every pricing method, discount and GST totals, and number / date formatting for quotes.
The screen copy and the server copy must stay identical — a test checks this.

Until the code is moved here, it still lives in: `src/modules/quotation/` (`calcLine.ts`, `quoteTotals.ts`, `quoteFormatters.ts`, `types.ts`) and `server/` (`calcLine.mjs`, `quoteTotals.mjs`).
