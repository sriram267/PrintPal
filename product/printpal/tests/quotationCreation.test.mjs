import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

test('Quotation Creation Resilience & Local-First Fallback', () => {
  const quotationViewPath = path.join(ROOT, 'src', 'modules', 'leads', 'QuotationView.tsx');
  const content = fs.readFileSync(quotationViewPath, 'utf8');

  // 1. Verify safeCustomerId fallback is present
  assert.ok(
    content.includes('const safeCustomerId = selectedCustomer.id || `cust-${Date.now()}`'),
    'QuotationView must provide safe customer ID fallback'
  );

  // 2. Verify syncToLocalStorage is called in both online and resilient fallback paths
  assert.ok(
    content.includes('syncToLocalStorage(data.quoteId || data.id)'),
    'Online success must sync quote with server ID to localStorage'
  );
  assert.ok(
    content.includes('// Resilient Workshop Fallback: Always save locally and open preview'),
    'QuotationView must have resilient workshop fallback for non-200 responses'
  );

  // 3. Verify PDF preview is opened in all cases so workshop operations never halt
  const occurrences = (content.match(/setIsPreviewOpen\(true\)/g) || []).length;
  assert.ok(
    occurrences >= 3,
    'setIsPreviewOpen(true) must be called on success, non-200 response, and catch block'
  );

  // 4. Verify Pal Notch notification is invoked in all cases
  assert.ok(
    content.includes('Quotation ${quoteNumber} Created'),
    'Must notify user on cloud creation'
  );
  assert.ok(
    content.includes('Quotation ${quoteNumber} Created Locally'),
    'Must notify user on local creation'
  );

  // 5. Verify dynamic quote numbering initialization
  assert.ok(
    content.includes('Q-${String(nextNum).padStart(3, \'0\')}-V1'),
    'Quote number must be dynamically generated from existing quotations count'
  );
});

test('Backend Quotations Endpoint Safety & Error Handling', () => {
  const serverPath = path.join(ROOT, 'server', 'server.mjs');
  const serverContent = fs.readFileSync(serverPath, 'utf8');

  // 1. Verify customerId fallback
  assert.ok(
    serverContent.includes('const effectiveCustomerId = customerId || (body.customer?.id) || `cust-${Date.now()}`'),
    'Backend must safely handle customer ID'
  );

  // 2. Verify try-catch around repo.quotations.save
  assert.ok(
    serverContent.includes('try {\n    await repo.quotations.save('),
    'Backend must wrap repo.quotations.save in try-catch'
  );
  assert.ok(
    serverContent.includes('Failed to save quotation to database:'),
    'Backend must return clean JSON error message on database save failure'
  );
});
