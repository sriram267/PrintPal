// A3 visual baseline: every page / drawer / pop-up of the app, from a fresh load each, fixed clock, fixed data.
// usage: node capture.mjs <outDir> [onlyStateName]
import { chromium } from "playwright-core";
import fs from "node:fs";
const S = "C:/Users/vssri/AppData/Local/Temp/claude/37d623c9cbf993e5/df20edba-393c-40ce-8465-2db6fc71f303/scratchpad";
const OUT = process.argv[2];
const ONLY = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const fx = JSON.parse(fs.readFileSync(`${S}/a3/fixtures.json`, "utf8"));

const nav = (label) => async (p) => p.locator(`nav >> text="${label}"`).first().click();
const click = (sel) => async (p) => p.locator(sel).first().click();
const text = (t) => async (p) => p.getByText(t, { exact: true }).first().click();
const role = (r, name) => async (p) => p.getByRole(r, { name }).first().click();
const wait = (ms) => async (p) => p.waitForTimeout(ms);
const settings = (item) => [text("Settings"), wait(500), text(item)];

const STATES = {
  "leads-customer": [],
  "leads-enquiry": [text("Enquiry")],
  "leads-supplier": [text("Supplier")],
  "customer-new": [click("button:has-text('Add new Customer')"), wait(700)],
  "customer-edit": [click(".printpal-btn-edit-icon >> nth=2"), wait(700)],
  "customer-multisite": [text("Multiple Sites (2)"), wait(600)],
  "customer-delete-confirm": [click(".printpal-btn-delete-icon >> nth=0"), wait(900)],
  "enquiry-new": [text("Enquiry"), wait(300), click("button:has-text('Add new')"), wait(700)],
  "enquiry-edit": [text("Enquiry"), wait(300), click(".printpal-btn-edit-icon >> nth=0"), wait(700)],
  "supplier-new": [text("Supplier"), wait(300), click("button:has-text('Add new')"), wait(700)],
  "supplier-edit": [text("Supplier"), wait(300), click(".printpal-btn-edit-icon >> nth=0"), wait(700)],
  "user-menu": [click(".printpal-user-pill"), wait(400)],
  quotation: [text("Quotation"), wait(800)],
  "quotation-reports": [text("Quotation Reports"), wait(800)],
  "quotation-reports-open": [text("Quotation Reports"), wait(600), text("Meridian Interiors"), wait(500)],
  "settings-business": [...settings("Business Details"), wait(600)],
  "settings-products": [...settings("Products"), wait(600)],
  "settings-product-new": [...settings("Products"), wait(400), click("button:has-text('Add new Product')"), wait(700)],
  "settings-materials": [...settings("Materials"), wait(600)],
  "settings-material-new": [...settings("Materials"), wait(400), click("button:has-text('Add new Material')"), wait(700)],
  "settings-finishes": [...settings("Finishes"), wait(600)],
  "settings-finish-new": [...settings("Finishes"), wait(400), click("button:has-text('Add new Finish')"), wait(700)],
  "settings-tax": [text("Settings"), wait(500), click("[class*=settings-sidebar] >> text=Quotation >> nth=-1"), wait(600)],
  "settings-supplier": [...settings("Supplier"), wait(600)],
};

const browser = await chromium.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const report = {};
for (const [name, steps] of Object.entries(STATES)) {
  if (ONLY && name !== ONLY) continue;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date("2026-11-19T10:00:00+05:30"));
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message.slice(0, 160)));
  await page.route("**/api/**", (route) => {
    const u = new URL(route.request().url());
    const key = `${route.request().method()} ${u.pathname}`;
    return route.fulfill({ json: key in fx ? fx[key] : { success: true } });
  });
  try {
    await page.goto("http://localhost:5199/");
    await page.waitForTimeout(5500); // Pal greeting finishes
    for (const s of steps) await s(page);
    await page.mouse.move(2, 895); // no hover effects in the picture
    await page.waitForTimeout(1200); // let slide-ins and colour fades settle
    await page.screenshot({ path: `${OUT}/${name}.png`, animations: "disabled", caret: "hide" });
    report[name] = errs.length ? `ok (page errors: ${errs.join(" | ")})` : "ok";
  } catch (e) {
    report[name] = "FAILED: " + e.message.split("\n")[0].slice(0, 160);
  }
  await ctx.close();
}
await browser.close();
for (const [k, v] of Object.entries(report)) console.log(`${v.startsWith("ok") ? "✓" : "✗"} ${k}: ${v}`);
