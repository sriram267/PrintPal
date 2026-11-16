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
const PAL_NOTCH_PATH = fs.existsSync(path.join(ROOT, 'src', 'components', 'ui', 'pal-notch.tsx'))
  ? path.join(ROOT, 'src', 'components', 'ui', 'pal-notch.tsx')
  : path.join(ROOT, '..', 'Ui component library', 'src', 'components', 'ui', 'pal-notch.tsx');
const BILLING_REPORTS_PATH = fs.existsSync(path.join(ROOT, 'src', 'modules', 'leads', 'QuotationReportsView.tsx'))
  ? path.join(ROOT, 'src', 'modules', 'leads', 'QuotationReportsView.tsx')
  : path.join(ROOT, 'src', 'modules', 'leads', 'BillingReportsView.tsx');
const QUOTATION_VIEW_PATH = path.join(ROOT, 'src', 'modules', 'leads', 'QuotationView.tsx');
const LEADS_APP_PATH = path.join(ROOT, 'src', 'modules', 'leads', 'LeadsApp.tsx');

test('1. Pal Notch Modal-Closing Toast Queueing Architecture', () => {
  const content = fs.readFileSync(PAL_NOTCH_PATH, 'utf8');

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

test('2. Quotation CRUD Toasts in Pal Notch', () => {
  const billingContent = fs.readFileSync(BILLING_REPORTS_PATH, 'utf8');
  const quoteContent = fs.readFileSync(QUOTATION_VIEW_PATH, 'utf8');

  // Delete Quote
  assert.ok(
    billingContent.includes('showToast(`Quotation "${q.quoteNumber}" deleted successfully`, \'success\')'),
    'BillingReportsView must show success toast when deleting quotation'
  );

  // Delete Site
  assert.ok(
    quoteContent.includes('showToast(`Site "${site.siteName}" deleted successfully\`, \'success\')'),
    'QuotationView must show success toast when deleting site'
  );

  // Delete Line Item
  assert.ok(
    quoteContent.includes('showToast(`Item "${item.productTitle}" deleted successfully\`, \'success\')'),
    'QuotationView must show success toast when deleting line item'
  );

  // Create Quote
  assert.ok(
    quoteContent.includes('Quotation ${quoteNumber} Created'),
    'QuotationView must trigger workshop notification badge on quote creation'
  );
});

test('3. Leads & Catalogue CRUD Toasts in LeadsApp', () => {
  const leadsContent = fs.readFileSync(LEADS_APP_PATH, 'utf8');

  // Customers
  assert.ok(
    leadsContent.includes('Customer "${customerRecord.name}" created successfully'),
    'Customer create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Customer "${customerRecord.name}" updated successfully'),
    'Customer update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Customer "${name}" deleted successfully'),
    'Customer delete toast must use standardized success copy'
  );

  // Enquiries
  assert.ok(
    leadsContent.includes('Enquiry for "${newEnquiry.contactName}" created successfully'),
    'Enquiry create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Enquiry "${name}" deleted successfully'),
    'Enquiry delete toast must use standardized success copy'
  );

  // Suppliers
  assert.ok(
    leadsContent.includes('Supplier "${supplierPayload.supplierName}" created successfully'),
    'Supplier create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Supplier "${supplierPayload.supplierName}" updated successfully'),
    'Supplier update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Supplier "${name}" deleted successfully'),
    'Supplier delete toast must use standardized success copy'
  );

  // Products
  assert.ok(
    leadsContent.includes('Product "${newProd.title}" created successfully'),
    'Product create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Product "${newProd.title}" updated successfully'),
    'Product update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Product "${name}" deleted successfully'),
    'Product delete toast must use standardized success copy'
  );

  // Materials
  assert.ok(
    leadsContent.includes('Material "${newMat.name}" created successfully'),
    'Material create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Material "${trimmed}" updated successfully') ||
    leadsContent.includes('Material "${newMat.name}" updated successfully'),
    'Material update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Material "${name}" deleted successfully'),
    'Material delete toast must use standardized success copy'
  );

  // Finishes
  assert.ok(
    leadsContent.includes('Finish "${newFin.name}" created successfully'),
    'Finish create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Finish "${trimmed}" updated successfully') ||
    leadsContent.includes('Finish "${newFin.name}" updated successfully'),
    'Finish update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Finish "${name}" deleted successfully'),
    'Finish delete toast must use standardized success copy'
  );

  // Taxes
  assert.ok(
    leadsContent.includes('Tax "${trimmedName}" created successfully'),
    'Tax create toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Tax "${trimmedName}" updated successfully'),
    'Tax update toast must use standardized success copy'
  );
  assert.ok(
    leadsContent.includes('Tax "${name}" deleted successfully'),
    'Tax delete toast must use standardized success copy'
  );

  // Business Details
  assert.ok(
    leadsContent.includes('Business details updated successfully'),
    'Business details update toast must use standardized success copy'
  );
});
