# 01 · Why PrintPal exists

> **What this file is:** why the project started, why print and signage, why India, who the founder is, and what has happened so far.
> **One of five files:** 01 Why · 02 Market and roadmap · 03 What is built · 04 Tech and engineering · 05 Decisions and open questions.
> **Last checked:** 20 Nov 2026, against the code, the git history and the planning documents. The founder's own reasoning is marked as theirs.
> **If files disagree:** file 05 wins, then whichever text is newer. Any other file is background only.

---

## 1. PrintPal in one paragraph

PrintPal is a web app for **sign shops, signage fabricators and large / wide-format printers in India**. Today it handles:
- enquiries;
- customers with many sites;
- a catalogue of products, materials and finishes;
- GST-ready quotations with versions;
- turning the agreed quote into an invoice.

It is meant to be the first step of a "business OS" for print shops. A solo founder, a B2B SaaS product designer, builds it with AI coding assistants on free hosting ($0 a month). The pilot is free and open: shops sign up with their Google account. No price has been set.

---

## 2. How the idea was found

The founder did not start with print. The project began as a search for **which software vertical to build a company in**:

| Step | What was explored | What happened |
|---|---|---|
| 1 | **Laundry software** (for laundry and dry-cleaning businesses) | Researched, then dropped. No written research from this step survives. |
| 2 | **"PalGen"**, a general marketing and lead-generation tool (Oct 2026) | One place to run WhatsApp, SMS, email, phone and Instagram campaigns with a pay-as-you-go message balance, later adding lead management and a messaging API. Strategy and architecture were written on 12 Oct 2026. **Dropped:** a crowded market (Interakt, Wati, Twilio, Zoho and many more), generic rather than vertical, and a thin-margin resale business on top of Meta and telecom providers. |
| 3 | **"Palora"**, a "Workshop OS" for made-to-order businesses (Oct to mid-Nov 2026) | Sign manufacturing first, then display printing and metal fabrication. Promise: *"No job leaves you with less money than you thought."* Profit protection from enquiry to final payment. Partly inspired by ClarWorks' phone-first apps for Indian small businesses (Sadan for builders, Sarathi for fleets). |
| 4 | **PrintPal** (the name since 16 Nov 2026) | Palora was narrowed and renamed. The industry became print and signage. The first wedge is quoting, then billing. The code moved from `product/Palora` to `product/printpal`. |

The name **"Pal"** survives from the first stage. Pal is the app's helper: a small black pill at the top of the screen that shows messages, with a mascot.

---

## 3. Why print and signage, and why India (the founder's reasoning)

1. **Many big Indian tech companies localised a category that was proven in the US.** Paytm followed PayPal, Ola followed Uber, and Zoho built an Indian answer to Google's and Microsoft's business software.
2. **So pick a category that is proven abroad, nearly empty in India, and served by dated, hard-to-use tools.** The obvious copies (payments, ride-hailing, office suites) are taken.
3. **Print and signage software fits.** In the US, UK, Australia and South Africa, "print MIS" and sign-shop software is a mature category that shops pay for. shopVOX, PrintPLANR, InfoFlo Print, Printavo and others charge roughly USD 100–250+ per shop per month. In India the category is small. Shops run on WhatsApp, phone calls, Excel, paper notebooks and Tally (accounts).
4. **Enter India while the category is still empty**, and become the default tool.

### What the desk research adds (not yet checked with real shops)

- **The pain repeats every day.** Every sign or print job is one-off (its own sizes, materials, finishes, lighting and site), so every enquiry needs a custom quote. The quote is where the price, and so the profit, is decided.
- **The real competition in India is WhatsApp and Excel.** Clearly beating them is enough to charge. The global tools are built for US workflows (US tax, QuickBooks, US carriers), priced in dollars and slow to learn.
- **India-specific needs the global tools miss:**
  - GST (GSTIN, the CGST / SGST split);
  - quotes and invoices sent as PDFs on WhatsApp;
  - many sites per customer (retail chains, franchises);
  - Indian units (sq ft, running ft);
  - Indian payment habits (advance, then balance).
- **Rough market size (unverified):** about 1,470 formal signage manufacturers in India (RevenueBase listing), plus an estimated 8,000+ local workshops. Hubs: Mumbai, Bengaluru, Delhi NCR, Chennai, Hyderabad, Ahmedabad and Pune. Shops quote 35–55% gross margins, but the research suggests real margins of 12–18% after waste, unbilled revisions and unpaid balances.
- **Room to grow.** Each of these is a vertical the global tools already charge for, and India can be entered one vertical at a time (file 02):
  - signage;
  - large format;
  - vehicle wraps;
  - screen printing;
  - embroidery;
  - promotional products;
  - commercial / offset;
  - packaging and labels.

> **Honesty note:** all research so far is **desk research and competitor benchmarking** (websites, demo videos, public listings, AI-assisted analysis). **No shop-owner interviews or paid pilots have happened yet.** Treat every market number and margin figure as a hypothesis.

---

## 4. The founder, and the angle

- The founder is a **UI/UX and product designer with about 3 years in B2B SaaS**. That includes a vertical B2B product for salons (designed mobile-first) and work at an engineering company. They are not from the print industry. Their edge is **design**.
- The research thesis is that print software everywhere is **"built by engineers, for engineers"**. It works, but it is dated, slow to set up and hard to learn.
- PrintPal's angle is **design-led print and signage software**: the depth of PrintPLANR or shopVOX with the feel of Linear, Notion or Stripe. A shop should be working in it within an hour, in the owner's own words.
- The founder builds **with AI assistants** on a $0-a-month stack, to prove demand before spending money. Claude acts as co-founder, COO, PM, designer and full-stack engineer.

---

## 5. What success means for the pilot

- Sign shops and large-format printers in India use PrintPal for **real enquiries and real quotes**, instead of WhatsApp and Excel.
- They accept it in place of their old habit. The quote PDF goes out the way they already send things: WhatsApp or email.
- There is enough pull to set a price and charge. **Pricing isn't set.** The pilot is "free during the pilot".
- The pilot shows which second step matters most (job tracking, payments, wraps …), and that decides the roadmap in file 02.
- **No numeric targets exist yet** (how many shops, how many quotes a week, what conversion to paid, by when). Setting them is open question 7 in file 05.

---

## 6. Timeline (2026)

| Date | What happened |
|---|---|
| Before Oct | Vertical search, including laundry software. |
| 12 Oct | PalGen strategy, decisions and architecture written. First commit in the repo. |
| Oct | Print market research document (v0.2). Competitor analyses of shopVOX, PrintPLANR and InfoFlo Print. Indian signage industry research. Pivot through "Palora" (Workshop OS). |
| Oct to mid-Nov | Leads, Quotation and Settings built (under the Palora name). |
| 15 Nov | Clerk sign-in. "Billing" renamed "Quotation" and "Quotation Reports". Marketing website started. |
| 16 Nov | Renamed **PrintPal**. Server-side shop security (verified sign-in, shop worked out on the server). Quotation versions, and "tick to make it the invoice". Website live at printpal-web.pages.dev. |
| 17 Nov | End-to-end QA. Quote money bugs fixed: one shared total calculation for the screen and the server. |
| 19 Nov | PrintPal's own mascot "Pal" replaces the borrowed one. Website mobile pass and catalogue section. Code reorganised into plain feature folders. Shared UI component library (`packages/ui`) built, and the product now uses it for everything. Product redeployed. |
| 20 Nov | Docs rewritten into this 5-file set for a Claude project. Checking the code turned up three problems (file 04, sections 7, 9 and 13):<br>• a save could overwrite another shop's record;<br>• every server restart deleted the catalogue items shops had added;<br>• local runs use the production database.<br>The first two were fixed, tested and made live the same day (commit `1d6e5cc`). The third is still open. |
