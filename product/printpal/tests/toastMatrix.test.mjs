/**
 * toastMatrix.test.mjs
 * End-to-end verification of CRUD Toast Notifications & Pal Notch Queueing
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PAL_NOTCH_PATH = path.join(ROOT, 'src', 'components', 'ui', 'pal-notch.tsx');
const BILLING_REPORTS_PATH = path.join(ROOT, 'src', 'features', 'quotation', 'reports', 'screen', 'QuotationReportsView.tsx');
const QUOTATION_VIEW_PATH = path.join(ROOT, 'src', 'features', 'quotation', 'create-quote', 'screen', 'QuotationView.tsx');
const LEADS_APP_PATH = path.join(ROOT, 'src', 'modules', 'leads', 'LeadsApp.tsx');
/* Source files may be checked out with CRLF line endings; compare on LF. */
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

test('1. Pal Notch Modal-Closing Toast Queueing Architecture', () => {
  const content = read(PAL_NOTCH_PATH);

  // Verify pendingToastRef exists
  assert.ok(content.includes('pendingToastRef = React.useRef'), 'Pal Notch must define pendingToastRef');

  // Verify push events during non-idle stage are queued, not discarded
  assert.ok(
    content.includes('if (confirmStage !== "idle") {\n          pendingToastRef.current = event.item\n          return'),
    'Push events while modal is open/closing must be stored in pendingToastRef instead of dropped'
  );

  // Verify handleDismissConfirm dequeues pending toast on confirm
  assert.ok(
    content.includes('action === "confirm" && pendingToastRef.current'),
    'handleDismissConfirm must pop pendingToastRef when confirm closes'
  );

  // Verify handleDismissPrompt dequeues pending toast on submit
  assert.ok(
    content.includes('action === "submit" && pendingToastRef.current'),
    'handleDismissPrompt must pop pendingToastRef when prompt closes'
  );
});


test('2. Quotation CRUD Toasts in Pal Notch (plain shop language)', () => {
  const billingContent = read(BILLING_REPORTS_PATH);
  const quoteContent = read(QUOTATION_VIEW_PATH);

  assert.ok(billingContent.includes("showToast(`${q.quoteNumber} deleted`, 'success')"), 'deleting a quotation confirms briefly');
  assert.ok(quoteContent.includes("showToast(`${site.siteName} deleted`, 'success')"), 'deleting a site confirms briefly');
  assert.ok(quoteContent.includes("showToast(`${item.productTitle} deleted`, 'success')"), 'deleting an item confirms briefly');

  // Creating a quote: one message per outcome, local saves say so
  assert.ok(quoteContent.includes('Quote ${quoteNumber} saved'), 'quote creation toast says the quote is saved');
  assert.ok(quoteContent.includes('saved on this device'), 'local saves are stated plainly');
  assert.ok(!quoteContent.includes('Cloud sync notice'), 'no sync jargon shown to the user');
  assert.ok(!quoteContent.includes('Offline mode'), 'no mode jargon shown to the user');
});

test('3. Leads & Catalogue CRUD Toasts in LeadsApp (plain shop language)', () => {
  const c = read(LEADS_APP_PATH);
  const expected = [
    '${customerRecord.name} added to customers',
    '${customerRecord.name} updated',
    '${customerRecord.name} is now a customer',
    'Enquiry from ${newEnquiry.contactName} added',
    'Enquiry from ${newEnquiry.contactName} updated',
    '${supplierPayload.supplierName} added to suppliers',
    '${supplierPayload.supplierName} updated',
    '${newProd.title} added to products',
    '${newProd.title} updated',
    '${newMat.name} added to materials',
    '${newMat.name} updated',
    '${newFin.name} added to finishes',
    '${newFin.name} updated',
    '${trimmedName} added to taxes',
    '${trimmedName} updated',
    'Business details saved',
    'showToast(`${name} deleted`, "success")',
    'showToast(`Enquiry from ${name} deleted`, "success")',
  ];
  for (const s of expected) assert.ok(c.includes(s), `missing copy: ${s}`);

  // Jargon that must not come back
  for (const bad of ['created successfully', 'updated successfully', 'deleted successfully', 'auto-populated', 'billing screen', 'Failed to ']) {
    assert.ok(!c.includes(bad), `jargon should be gone: ${bad}`);
  }

  // Revision message tells the owner what to do, in their words
  assert.ok(c.includes('started from ${q.quoteNumber}'), 'revision toast names the new and the original quote');
  assert.ok(c.includes('Prices and sites are copied over. Change what the customer asked for, then create the quote.'), 'revision toast says what to do next');
});

test('4. Toasts leave quickly and never freeze on hover', () => {
  const content = read(PAL_NOTCH_PATH);
  assert.ok(content.includes('TOAST_HOVER_MS'), 'hover shortens the toast');
  assert.ok(content.includes('speedUpToast'), 'hover handler speeds the toast up');
  assert.ok(!/onMouseEnter=\{\(\) => \{\s*if \(isToast\) setIsPaused\(true\)/.test(content), 'hover must not pause the countdown');
  assert.ok(!content.includes('animationPlayState: isPaused'), 'progress bar never pauses');
  // Base durations are short: success 2s, error 4s
  assert.ok(/success: 2000/.test(content) && /error: 4000/.test(content), 'short base durations');
});