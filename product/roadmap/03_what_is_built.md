# 03 · What is built

> **What this file is:** everything PrintPal does today, screen by screen, plus what is not built and the known gaps.
> **One of five files:** 01 Why · 02 Market and roadmap · 03 What is built · 04 Tech and engineering · 05 Decisions and open questions.
> **Last checked:** 19–20 Nov 2026, against the code. "Built" means it is in the code and deployed.
> **Rule for every reader:** if a feature isn't described here, it isn't built. Sections 11 and 12 list what is missing.
> **Under the hood** (stack, database, API, security, deploys, coding rules): file 04.

---

## 1. At a glance

| Thing | What |
|---|---|
| **The app** | https://printpal-app.pages.dev. A desktop / laptop browser app, not designed for phones. |
| **The website** | https://printpal-web.pages.dev. Works on phones. |
| **Who can use it** | Anyone, by signing up with Google. No waitlist. Free during the pilot. No pricing. |
| **Main areas** | Leads · Quotation · Quotation Reports · Settings |
| **Cost to run** | $0 a month (free tiers) |
| **Custom domain / company** | None yet |

---

## 2. Accounts and access

- **Clerk is the only system for people:** accounts and sessions. PrintPal's own database stores only each shop's business data, linked to the Clerk user.
- **Google only, no waitlist (22 Nov 2026).** The login page is one **Continue with Google** button. The same button signs new shops up and existing ones in. `?auth=google` starts Google straight away (every website button links there). An old Clerk invitation link still opens Clerk's sign-up screen.
- **Clerk settings:** access mode **Open**; Google is the only way in (no email or password). Clerk's development instance, so Google's screen shows Clerk's name, not PrintPal's, until there's a domain and a production instance.
- **First sign-in** creates the shop on the server and fills it with the **starter catalogue** (section 8).
- **Each account is its own shop.** There are no team members or roles inside a shop yet.

---

## 3. The app frame

- **Top bar:**
  - the PrintPal wordmark;
  - **Leads · Quotation · Quotation Reports**;
  - **Settings** on the right.
- **Top-bar icons:**
  - **Help** shows "Need help? Write to us at help@printpal.in". That domain isn't owned yet.
  - **Bell** does nothing yet.
  - **User menu** shows the avatar, name, email, "Workspace: PrintPal ERP" and **Sign out**.
- **Pal notch:** a small black pill fixed at the top centre of every screen (section 9). It shows the page name, and every message, confirmation, prompt and the printed quotation comes out of it.

---

## 4. Leads

Leads has three tabs: **Customer · Enquiry · Supplier**. The Supplier tab only appears when Settings → Supplier is switched on.

Each tab has a searchable list, an empty state, and edit / delete per row. Deleting asks "Delete {name}?" and warns "This can't be undone."

### 4.1 Enquiry (a quick lead before someone becomes a customer)
- **Saved fields:** name, phone, email, address, note, and a **follow-up date**.
- An enquiry with a follow-up date shows **"Needs follow-up"**; otherwise it shows "New".
- **In the data model but not in the UI:**
  - a **source** (WhatsApp / call / walk-in / JustDial / referral). The source is always saved as walk-in.
  - **stages** (new → contacted → qualifying → needs follow-up → estimating → quoted → won / lost);
  - site-survey details.
- The enquiry form is the customer drawer in "enquiry mode" (**Save as enquiry**).
- **Convert to customer:** filling in the full details turns the enquiry into a customer and removes the enquiry ("{name} is now a customer").

### 4.2 Customer
A full-screen drawer: **Basic Details** on the left, and site details on the right with tabs **Signage** and **Billing Address**.
- **Basic details:**
  - business name and primary contact name;
  - primary contact number, with a "WhatsApp number is same" switch (or a separate WhatsApp number);
  - email and follow-up date.
- **Billing / shipping:**
  - billing entity / company name;
  - billing address (line 1 / 2, city, state, pincode);
  - "shipping same as billing", or a separate shipping address;
  - **GSTIN** (optional).
- **Sites (many per customer):**
  - site name;
  - **address search as you type** (Geoapify), or "Can't find it? Enter address manually" (line 1 / 2, city, state, pincode);
  - **360° street view** of the address (Google Maps), to check the wall before quoting;
  - target delivery date, site contact name and phone;
  - latitude / longitude and place ID are stored.
- **Services per site (many per site):**
  - sign style (product);
  - environment / placement: indoor, outdoor or coastal;
  - dimensions and quantity: width × height with a unit, or "not sure of dimensions";
  - material / substrate, finishing / mounting, colour / shade code and **artwork status**;
  - **upload artwork and reference files**;
  - fabrication notes.
- **Buttons:** **Save**, **Save as enquiry**, and **Raise Quote** (saves, then opens the Quotation page for this customer).
- In the list, a customer with several sites shows "has Multiple Sites (n)", which opens a site list pop-up.
- **Stored but not editable in the UI:** customer type, payment terms, credit limit, and site survey data (mounting height, wall type, power point and its distance).

### 4.3 Supplier (switch on in Settings → Supplier)
- **Who they are:**
  - supplier name (contact person) and company name;
  - supplier number, and WhatsApp (same or separate);
  - email and GSTIN.
- **Addresses:** a dispatch address, plus billing / shipping addresses (each "same as" or separate).
- **What they offer:**
  - services / materials they provide (a searchable multi-select);
  - serving regions / delivery coverage (a searchable multi-select).
- **Terms:** payment terms, delivery lead time, minimum order quantity and notes.
- It is a contact list only. There is no supplier login and no supplier price requests yet.

---

## 5. Quotation (creating a quote)

1. **Pick a customer:** search by name or number, or **Add New Customer**. Their **sites and services fill in automatically**, with no retyping.
2. **Quote number** is automatic: `Q-001-V1`, `Q-002-V1` … (V = version). The quote date is set too.
3. **For each site, one line per service:**
   - product, material and finish;
   - **pricing method**, one of six: **square feet, running feet, square metre, running metre, per piece, lump sum**;
   - size W × H, with unit conversion between ft, in, mm and m;
   - quantity, rate and a per-line discount %.
   - The line total is calculated, and incomplete lines are flagged.
   - **Add another service** / **Add another site**.
   - **Quick-add product** opens a pop-up that adds a catalogue product without leaving the page.
4. **Quote summary:**
   - subtotal;
   - **Transport and freight**, **Design and 3D visualiser** and **Installation** charges;
   - **Discount %**;
   - **GST** at 18% or 12% (one click switches), always shown **split into CGST and SGST**;
   - **Grand total**.
5. **Notes:**
   - "Commercial terms and conditions", for example "50% advance with purchase order, balance on handover";
   - "Fabrication and installation notes".
6. **Create:**
   - The quote is saved to the server. If the server can't be reached, it is kept in the browser ("saved on this device").
   - The **Pal notch turns into a little printer**: Pal's mouth opens and the A4 sheet slides out.
   - **Download** saves the PDF using the browser's print to PDF. The file is named, for example, "Quotation Q-001-V1 - Customer".
   - Closing it takes you to Quotation Reports.
- There's a **Customer Quotation / Supplier Quotation** switch, shown when suppliers are on. **Supplier mode does nothing yet.**
- The server recomputes every money figure on save, using the same calculation as the screen (file 04, section 8).

---

## 6. Quotation Reports, versions and the invoice

- All quotations, **grouped by customer** in an accordion, **newest version on top**.
- **Columns:** customer / quote, contact, sites, date, grand total, status and actions.
- **Status is worked out, not typed:**
  - **Open:** the latest version.
  - **Renegotiated:** any older version.
  - **Invoice:** the latest version, once ticked.
- **Renegotiate / create next version:** copies the last version into the Quotation page as `…-V2`, `…-V3`, with prices and sites carried over. Pal says "Q-001-V2 started from Q-001-V1. Prices and sites are copied over. Change what the customer asked for, then create the quote."
- **Tick the latest version and it becomes the Invoice.** It is then locked from edit and delete. Untick it to reopen.
- Click any row to preview its PDF. It is titled **Quotation** or **Invoice**.
- Delete with a confirmation ("Q-001-V1 deleted").
- **Not built:** payments, receipts, balances, separate invoice numbering, and sending from the app.

---

## 7. The quotation / invoice PDF

- A plain **white A4** page, made as HTML and printed by the browser. No PDF library and no server rendering, so it costs nothing. Page margins are set so the browser adds no header or footer.
- **Contents:**
  - the shop's **logo**, legal name, address, **GSTIN**, PAN and contacts (from Business Details);
  - the customer's details;
  - "Item and specification" grouped by site, with quantity and amount;
  - design, installation and transport charges;
  - taxable amount, GST and **total incl. GST**;
  - notes and terms;
  - **authorised signatory** with the signature image.
- No invented filler text: no taglines, no "Scope of work", no "all taxes inclusive" lines.

---

## 8. Settings

Left menu groups and pages:

| Group | Pages |
|---|---|
| Business Setting | **Business Details** |
| Products & Finishes | **Products**, **Materials**, **Finishes** |
| Quotation & Taxes | **Tax Setting** |
| Supplier & Vendors | **Supplier** (the on / off switch) |
| Workspace & Profile | The group exists but has no pages yet |

- **Business Details:**
  - **Fields:** company logo, legal / display name, address (line 1 / 2, city, state, pincode, country), GSTIN, PAN, phone, email, website, authorised signatory name, signature image, default tax, and default terms and conditions.
  - Saved on the server and also kept in the browser.
  - Shown on every PDF.
- **Products:**
  - add, edit and delete;
  - **form fields:** product name and description, plus **linked materials and finishes**, picked from searchable checklists;
  - a **quick-add product** pop-up is also available from the Quotation page;
  - the starter data carries richer fields (category, priced per, size range, lighting, installation, lead time, application, production type). These are stored but not editable in the form.
- **Materials:** material name / grade, substrate category, **thickness / gauge**, **standard sheet / pack size**, **preferred supplier / vendor**, application scope (**indoor / outdoor / coastal**) and fabrication / laser-cutting notes.
- **Finishes:** finish / treatment name, process type (powder coat, lamination …), **colour code (RAL / Pantone / grain texture)**, application environment, and curing temperature / film thickness / warranty notes.
- **Starter catalogue:** every new shop starts with **33 signage products, 30 materials and 23 finishes**, from flex banners and ACP boards to channel letters. All of it can be renamed, edited or deleted.
- **Tax Setting:**
  - a list of tax slabs (name, %), with add / edit / delete and an "Apply taxes to saleable items" switch;
  - **not saved:** the list lives only in the browser and resets;
  - the default slabs are placeholders (CGST 9, SGST 7, a "NT TAX" group of 16);
  - the quote's GST doesn't come from this list. It has its own 18% / 12% switch.
- **Supplier:** a switch that shows or hides the Supplier tab and the supplier quotation switch. It is stored in the browser only.

---

## 9. Pal: the notch, the mascot and how messages read

- **The Pal notch:** a black pill at the top centre. **When idle**, it shows the mascot and the page name.
  - **Messages (toasts):** success, error, warning, info and "workshop". Each shows a **white Pal tinted by state**: silver for brand, blue info, green success, amber warning, red error.
  - **Timing:**
    - success about 2 s, info 2.2 s, warning 3.2 s, error 4 s;
    - with a button, at least 3.5 s;
    - long text adds time (30 ms per character over 40), up to 6 s.
    - Messages never freeze: hovering *shortens* the rest to about 1.1 s.
    - One message per outcome; they never stack.
  - **Confirm and prompt pop-ups** open from the notch (for example delete confirmations).
  - **Document mode:** the notch becomes a printer for the quotation (section 5).
  - **Entrance:** on first load, the notch stretches, light streaks and a particle ring play, and Pal drops in, bounces, waves and settles.
    - The engine is MIT-licensed code adapted from the open-source "Coucou" notch app, with its copyright notice kept.
    - Coucou's character "Mochi" is **not** used: its look, name and sounds are reserved by its author.
- **Pal the mascot:**
  - PrintPal's own character: a glossy **white / silver dome** with tall capsule eyes and two small mitten hands;
  - it blinks and glances; hands are hidden at small sizes;
  - vector (SVG), sharp at every size;
  - used in the notch, the messages, the printer and the website.
- **How every message reads** (pinned by a test, `tests/toastMatrix.test.mjs`):
  - **plain shop words, outcome first:** "{name} added to customers", "{name} updated", "{name} deleted";
  - **confirms:** "Delete {name}?", a **Delete** button, and a one-line consequence ending "This can't be undone.";
  - **errors** say what failed and what to do: "Couldn't save the product. Please try again.";
  - **local-only saves** say "saved on this device" and promise nothing about syncing (the app doesn't re-sync);
  - **banned:** "successfully", "auto-populated", "billing screen", "Offline mode", "Cloud sync notice", "Un-finalize", "Failed to …".

---

## 10. The marketing website (printpal-web.pages.dev)

- **Stack:** Vite, React 18, TypeScript, plain CSS. Cloudflare Pages, deployed manually.
- **Title:** *"PrintPal: Quoting software for print & signage"*.
- **Call to action everywhere:** **Continue with Google** (a link to the app that goes straight to Google sign-up / sign-in). **Sign in** links to the app. The site doesn't load Clerk.
- **Page order and content** (one page):
  1. **Nav:** logo, links, a dark "Get started" button, and a burger menu on mobile.
  2. **Hero:**
     - **Text:**
       - Kicker: "Free during the pilot · Now inviting sign shops".
       - Headline: **"Quoting that speaks print & signage."**
       - Supporting line: "PrintPal turns every enquiry into a GST-ready quote, with sites, sizes, materials and finishes already in place."
       - Buttons: "See how it works" and "Continue with Google".
     - **A pinned scroll scene:** a faithful redraw of the app's Quotation screen rises into an orange band. An illustrated **wide-format printer** (left) and **CNC router** (right) flank it, with lines connecting each machine to its quote rows.
     - On phones it becomes a compact quote card.
  3. **How it works:** "One enquiry in, one quote out." Four steps:
     1. note the enquiry;
     2. add the customer and sites (address search, 360° view);
     3. list the services per site;
     4. "Price it, send it, invoice it".
  4. **Product:** a scroll-driven tabbed tour titled "Everything a sign shop needs to quote and bill, in one place, from first enquiry to final invoice". Four steps:
     - **Leads:** enquiry first, many sites and services, address and street view, follow-ups, GST-ready details.
     - **Quotation:** six pricing methods, charges, discount, GST split, a PDF with your name, all sites in one quote.
     - **Invoicing:** revise into versions, tick to make the invoice, locked once final, the same PDF titled Invoice.
     - **Catalogue:** 33 / 30 / 23 pre-loaded and editable, products linked to materials and finishes, material details, finish colour codes. No stock or inventory claims.
  5. **Who it's for:** "Made for shops that make and print signs." Two cards: **Sign shops and fabricators**, and **Large and wide-format printers**.
  6. **One dark block:**
     - "Sound familiar? Quoting shouldn't live in chats and spreadsheets." Five **Without / With PrintPal** pairs: scattered enquiries, retyping, forgotten follow-ups, calculator totals, lost old quotes.
     - **"How is PrintPal different?"** compares WhatsApp, Word / Excel templates, generic billing software and big print suites by what each is good at. No competitor is named.
  7. **FAQ:**
     - it's free during the pilot;
     - how to get access (Continue with Google, no form or password);
     - GST with the CGST / SGST split and your GSTIN;
     - sending a quote: download the PDF, send it on WhatsApp or email, version it, tick it to invoice;
     - nothing to install (a browser on a laptop or desktop).
  8. **Final call to action** (dark): "Be one of the first shops on PrintPal." One big white Continue with Google button.
  9. **Footer:** "Quoting software for sign shops and large-format printers in India." and "Made for the people who make signs."
- **The Pal notch is on the site too**, with the same entrance animation and mascot.
- **Mobile:** fully responsive.
  - The hero becomes a phone quote card.
  - Product and Who-it's-for become tabs or toggles.
  - The menu becomes a sheet.
  - Some detail is hidden on phones only.
- **Copy rules:** show nothing unbuilt (no roadmap, no "coming soon", no prices), name no competitors, check every claim against the code, and make no data-safety claim yet.
- **One claim to watch:** the FAQ says "you can set your tax slabs in Settings". That's true, but they aren't saved yet (section 8).

---

## 11. Not built (important)

- **Customer accept / reject links or portals.** Dropped on purpose: quotes go out as PDFs.
- **Supplier price requests by link.** The supplier-quotation switch does nothing yet.
- **Sending from the app** (WhatsApp / email). Today it's Download PDF only.
- **Payments**, receipts, balances, invoice numbering separate from the quote number, and payment reminders.
- **Jobs**, the production board, artwork proofing, dispatch, installation and scheduling.
- **Inventory / stock** (quantities, in / out, low-stock alerts). The catalogue is not inventory.
- **Team and people features:** staff roles and permissions, and team members inside a shop.
- **Other features:**
  - reports and analytics;
  - integrations (Tally, Zoho Books, payment gateways, WhatsApp API);
  - a mobile app;
  - Excel import.
- **IGST** for inter-state quotes. The quote always splits CGST / SGST.
- **Wraps / Products vertical tabs**, and any vertical beyond signage and large format.

---

## 12. Known gaps in what is built

> Fixed and live on 20 Nov 2026 (file 04, section 7):
> - one shop could overwrite another shop's records;
> - every server restart deleted the products, materials and finishes shops had added themselves. Items lost before the fix can't be restored from the app.

- **A save the server refuses still looks saved.** The screen shows it as kept on this device instead of showing the error. This is rare now (file 04, section 13).
- **The GST 12% option may be out of date** after India's Sept 2025 GST rate changes. Check with a CA (file 02, section 5.2).
- **Tax slabs aren't saved**, and the default values are placeholders.
- **Enquiry source and stages** exist in the data but can't be chosen in the UI. The source is always walk-in.
- **Site survey fields** (mounting height, wall type, power) and **customer type / payment terms / credit limit** are stored but not editable.
- The **bell** icon does nothing. The **help** message points to `help@printpal.in`, a domain not yet owned.
- The "Workspace & Profile" settings group is empty.
- The Supplier on / off switch and the tax settings live only in the browser, not per shop on the server.
- The **starter catalogue exists in two copies** (a server seed and a browser fallback). They should become one.
- **Clerk runs on its development instance.** There is no custom domain or legal entity.
- The website isn't on the shared UI library yet.
- Engineering weak spots and tech debt (local runs using the production database, certificate checks, unused packages, the large `LeadsApp.tsx` …) are listed in file 04, section 13.
