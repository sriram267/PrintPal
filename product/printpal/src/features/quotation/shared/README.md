# Quotation — shared money maths

Used by **Create quote**, **Quotation reports** and the **PDF**, and by the server, so all of them always show the same numbers.

What goes here: line totals for every pricing method, discount and GST totals, and number / date formatting for quotes.
The screen copy and the server copy must stay identical — a test checks this.

Both copies live here: the server's `calcLine.server.mjs` and `quoteTotals.server.mjs`, and the screen's `calcLine.ts`, `quoteTotals.ts`, plus `quoteFormatters.ts` and `types.ts`. (The server files are named `.server.mjs` so the screen never loads them by accident.)
