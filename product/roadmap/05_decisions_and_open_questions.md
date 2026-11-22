# 05 · Decisions and open questions

> **What this file is:** every decision made so far, with its date and reason, followed by the questions only the founder can answer.
> **One of five files:** 01 Why · 02 Market and roadmap · 03 What is built · 04 Tech and engineering · 05 Decisions and open questions.
> **Last checked:** 20 Nov 2026.
> **This file wins.** If a decision here conflicts with older text anywhere else, this file is right. Report the conflict so the other file can be fixed.
> **Keeping it current:** when a decision is made in a chat, Claude writes a ready-to-paste row in the format below. The founder adds it to the right table and re-uploads this file.

**Row format:** `| Date | Decision | Why | Status |`
**Status words:** **Decided** (agreed, not built) · **Built** (agreed and live) · **Dropped** (decided against) · **Superseded** (replaced by a newer row).

---

## 1. Direction and business

| Date | Decision | Why | Status |
|---|---|---|---|
| Before Oct 2026 | Laundry software dropped as the vertical | Researched; didn't hold up. No written research survives. | Dropped |
| 12 Oct 2026 | "PalGen" (general marketing / lead-gen tool) dropped | Crowded market, generic not vertical, thin-margin resale on top of Meta and telecom providers | Dropped |
| Oct 2026 | Pivot to "Palora", a Workshop OS for made-to-order businesses, sign shops first | Physical, made-to-order shops are underserved. Their quotes decide profit. | Superseded by PrintPal |
| 16 Nov 2026 | Name is **PrintPal** (renamed from Palora). The industry is print and signage. | Narrower, clearer focus | Built |
| Oct–Nov 2026 | **Pilot customers: sign shops / fabricators and large-format printers only. India-first.** | Solve one pain deeply. The real competition is WhatsApp and Excel. | Decided |
| Oct–Nov 2026 | First wedge is **quoting, then billing**. Other modules come after pilot feedback. | The quote is where price and profit are decided, many times a day | Built (quoting and invoice step) |
| 15 Nov 2026 | **Pilot is free and invite-only.** No prices anywhere. | Validate demand before charging. Avoid overpromising. | Built |
| 15 Nov 2026 | Growth through **founder-led outreach**, not SEO | Early pilot. The site's job is to look complete and credible. | Decided |
| Nov 2026 | **Stay on free tiers ($0 a month) until there are paying customers** | Prove demand before spending money | Decided |
| Nov 2026 | One product or a family of products: **deferred until after the pilot** | Let customer pull decide | Open (question 1) |

## 2. Product

| Date | Decision | Why | Status |
|---|---|---|---|
| By 15 Nov 2026 | Supplier = a full contact form (services, regions, lead time, minimum order, addresses) behind a Settings switch. No supplier login. | Useful now without building a portal. It replaces the October "simple contact list" plan. | Built |
| 15 Nov 2026 | "Billing" renamed to **Quotation** and **Quotation Reports** | Matches what the screens do | Built |
| 16 Nov 2026 | **No customer accept / reject link or portal.** The quote goes out as a **PDF by WhatsApp or email**. | That's how shops already work. Simpler. It replaces the October plan of secure customer links. | Decided (PDF download built; sending from the app not built) |
| 16 Nov 2026 | **Quote versions:** V1, V2 … per customer. "Renegotiate" copies the last version. | Mirrors real back-and-forth with customers | Built |
| 16 Nov 2026 | **Status is derived, not typed:** Open (latest), Renegotiated (older), Invoice (ticked). It replaces Draft → Sent to supplier → … → Accepted / Rejected. | Fewer clicks, no wrong statuses | Built |
| 16 Nov 2026 | **Tick the latest version and it becomes the invoice.** It is locked from edit and delete, and unticking reopens it. Same PDF, titled "Invoice". | One source of truth for the agreed price | Built |
| 16 Nov 2026 | No payments, receipts, balances or separate invoice numbers yet. **Never market payment tracking.** | Not built | Decided |
| 16 Nov 2026 | Top menu: **Leads · Quotation · Quotation Reports · Settings** | Replaces "Leads, Quotation" | Built |
| 16 Nov 2026 | **PDF = an HTML page plus the browser's print to PDF.** No PDF library, no server rendering. | Costs nothing on free tiers | Built |
| 17 Nov 2026 | PDF look: plain white A4, browser header and footer removed, **no invented filler text** (no taglines, "Scope of work", "all taxes inclusive") | Shop owners notice anything fake | Built |
| 17 Nov 2026 | **One shared money calculation** for screen and server, rounded to paise. The server re-checks all money on save. | QA found total mismatches between the screen and the server | Built |
| 19 Nov 2026 | **The catalogue is not inventory.** No stock claims until stock tracking exists. | There are no quantities, stock movements or low-stock alerts | Decided |
| 19 Nov 2026 | **The product's look is final.** Refactors must change nothing visible, proven with the 24-screen comparison. | Protect finished, approved work | Decided |

## 3. Design, brand and copy

| Date | Decision | Why | Status |
|---|---|---|---|
| 16 Nov 2026 | **In-app copy rules:** plain shop words, outcome first ("{name} added to customers"), confirm with "Delete {name}?" plus "This can't be undone.", errors say what to do next. Banned: "successfully", "auto-populated", "Failed to …", "Offline mode", "Un-finalize" and similar. | The founder found the old copy unfriendly | Built (pinned by a test) |
| 16 Nov 2026 | **Messages leave quickly and never freeze:** success about 2 s, info 2.2 s, warning 3.2 s, error 4 s. Hovering shortens a message. One message per outcome. | Old toasts were slow and froze on hover | Built |
| 19 Nov 2026 | **Remove "Mochi"**, the borrowed mascot from the open-source Coucou app. Its character, name, animations as a character and sounds are reserved by its author. Coucou's code is MIT, so its notch and greeting engine stay, with the copyright notice kept. | Licence: a commercial product can't ship someone else's character | Built |
| 19 Nov 2026 | **PrintPal's own mascot, "Pal":** a glossy white / silver dome, tall capsule eyes, small mitten hands. **One character, no emotion system.** In toasts it is white, tinted by state. In the printer screen it "works" (a mouth slot opens and a sheet slides out). | The founder wanted it simple: "don't over-engineer" | Built |
| Nov 2026 | **Design references:** Attio (website layout), Linear, Stripe, Apple-like minimalism. Coucou's notch and Novra's "Grok Bot" mascot. Calm motion, no clutter, sharp vector art. | The founder's taste | Decided |

## 4. Website and marketing

| Date | Decision | Why | Status |
|---|---|---|---|
| 15 Nov 2026 | **Show nothing unbuilt.** No roadmap, no "coming soon", no prices. Check every claim against the code. | Print owners test every claim | Decided |
| 15 Nov 2026 | ~~Call to action = Clerk's email waitlist~~ | Invite-only pilot | Replaced on 22 Nov 2026 (below) |
| 22 Nov 2026 | **No waitlist. Sign-up and sign-in = one "Continue with Google" button** on the website and the app. Clerk access mode set to **Open**; the old Neon `waitlist` table dropped. | Founder: the simplest possible way in | Built |
| 16 Nov 2026 | **Name no competitors.** Comparisons say what each alternative (WhatsApp, Excel / Word, billing software, big print suites) is genuinely good at. | Honest, and legally safer | Built |
| 16 Nov 2026 | Page shape like Attio: **mostly light, one long dark block, a dark close** (not alternating light and dark) | The founder's correction after a first version | Built |
| 16 Nov 2026 | Founder note removed. "Try a quote" calculator dropped. No privacy or terms pages for now. | Founder's call | Decided |
| 16 Nov 2026 | Hosted on **Cloudflare Pages** in a **private** GitHub repo | GitHub Pages can't publish a private repo on the free plan | Built |
| 16 Nov 2026 | **No data-safety claim on the website** until the shop-separation work is complete | Don't claim what isn't proven | Decided. The work went live on 20 Nov 2026, so adding a claim is now open (question 5). |
| 19 Nov 2026 | On phones, content that hurts the flow may be hidden. This applies to phones only. | Founder: "hide them if they sabotage the flow" | Built |

## 5. Tech and security

| Date | Decision | Why | Status |
|---|---|---|---|
| Nov 2026 | Stack: Cloudflare Pages (app and website), Render (API), Neon (Postgres), Clerk (sign-in) | Free tiers, low ops | Built |
| 16 Nov 2026 | **Clerk is the only system for people** (accounts and sessions). PrintPal's database holds only shop business data, keyed to the Clerk user. | One source of truth for identity | Built |
| 16 Nov 2026 | The server verifies the Clerk token and derives the shop from it. Shop ids sent by the browser are rejected. | Before this, every user shared one demo shop | Built (see the weak spot below) |
| 16 Nov 2026 | Use `@clerk/react` 6 (version 5 is rejected by Clerk) | Sign-in broke on the old SDK | Built |
| 19 Nov 2026 | **Feature-folder code structure**, checked on every build | Non-developers can find things; it scales cleanly | Built |
| 19 Nov 2026 | **Shared UI library `packages/ui`** that matches the product exactly. It stays in this repo until there is a second developer or designer, or a third app. | One source for every UI part | Built (product). Website not yet. |
| Nov 2026 | No Kafka, Temporal or microservices until a real workflow needs them | Don't over-engineer | Decided |
| Nov 2026 | **Deploys are manual and only when the founder asks.** Pushing to `main` deploys the API. | Control over production | Decided |
| 20 Nov 2026 | **Shop data hardened** (founder approved):<br>• each shop's queries run as the restricted `app_user` role in their own transaction;<br>• a save can never overwrite another shop's row (the API answers 409);<br>• new ids carry a random part.<br>Also fixed: server start-up no longer deletes the products, materials and finishes shops added themselves. | Both problems were proven on a test copy of the real code: a save could move another shop's customer and even a locked invoice into the saving shop, and every restart wiped shop-made catalogue items | **Built:** live since 20 Nov 2026 (commit `1d6e5cc`). Production health shows the row rules on. |

## 6. Ways of working

| Date | Decision | Why | Status |
|---|---|---|---|
| Nov 2026 | The founder makes the final call on scope and taste. Claude acts as co-founder, COO, PM, designer and engineer. | Solo founder building with AI | Decided |
| Nov 2026 | **Confirm before risky or outward actions** (deploys, deleting data, emails, messages, payments) | Hard to undo | Decided |
| Nov 2026 | **Never store or repeat secrets.** Any credential pasted into a chat gets rotated. | Credentials were once pasted into a chat | Decided |
| Nov 2026 | **Research honesty:** all research is desk research. Never present market numbers as validated. | No interviews yet | Decided |
| Nov 2026 | **Plain language, short answers, no over-engineering.** Build visual ideas as drafts next to the founder's reference before polishing. The founder's taste sharpens when they see options. | How the founder works best | Decided |

---

## 7. Open questions (only the founder can decide)

| # | Question | Context | When it matters |
|---|---|---|---|
| 1 | **One product or a family** (PrintPal Sign, PrintPal Wrap …)? | Deferred until pilot pull is visible | After the pilot |
| 2 | **Pricing model and price** (per seat, per job, flat monthly)? | shopVOX charged USD 109–249 a month plus per-user fees when researched (Nov 2026) | Before charging |
| 3 | ~~Gate sign-up?~~ **Answered 22 Nov 2026:** no gate, Google-only open sign-up (section 4). | | Done |
| 4 | **Domain, legal entity and Clerk production instance.** Which domain? Which company form (proprietorship, LLP, private limited)? | Clerk production needs an owned domain. `help@printpal.in` isn't owned. | Now / before the pilot scales |
| 5 | **Add a data-safety line to the website?** Shop separation went live on 20 Nov 2026 (file 04, section 7). | The site deliberately said nothing until it was finished. Any claim must match the code exactly. | Any time |
| 6 | **Which GST rates apply?** Is the 12% option still right after India's Sept 2025 GST rate changes? | Check with a CA. Also covers IGST for inter-state jobs. | Now |
| 7 | **Pilot success numbers:** how many shops, how many quotes a week, what conversion to paid, by when? | None set | Before outreach |
| 8 | **Is any shop using the pilot today?** Who, and what have they said? | Not recorded in these files | Now |
| 9 | **Time and money:** how many hours a week, and how much money, can go into PrintPal over the next 6 months? When is the first hire, and for what role? | Shapes every plan | Now |
| 10 | Which **Phase 2 module** comes first: jobs, payments, supplier price requests, wraps …? | Pilot feedback decides | During the pilot |
| 11 | **WhatsApp Business API** for sending quotes from the app? | Cost per message, approval process | During the pilot |
| 12 | **Wraps quoting model** (area from vehicle templates)? | Phase 2 research | Phase 2 |
| 13 | Mention the **long-term vision** on the website, or stay "quoting software"? | Today the site claims only what's built | Before a public launch |
| 14 | ~~Drop the old `waitlist` table~~ **Done 22 Nov 2026.** | | Done |
| 15 | Start the **design-partner discovery plan** (5 shops, a 10-job audit; file 02, section 6)? | No interviews yet | Now |
| 16 | **Stop local runs from using the production database?** (file 04, section 9) | Today `npm run dev` on the laptop reads and writes real shop data | Now |
