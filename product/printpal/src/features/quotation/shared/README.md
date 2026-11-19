# Quotation — shared money maths

Used by **Create quote**, **Quotation reports** and the **PDF**, and by the server, so all of them always show the same numbers.

What goes here: line totals for every pricing method, discount and GST totals, and number / date formatting for quotes.
The screen copy and the server copy must stay identical — a test checks this.

The server copies are here: `calcLine.mjs`, `quoteTotals.mjs`. The screen copies still live in `src/modules/quotation/` (`calcLine.ts`, `quoteTotals.ts`, `quoteFormatters.ts`, `types.ts`) and move here in A3/A4.
