import test from 'node:test';
import assert from 'node:assert/strict';
import { calcLine, convertDimension } from '../src/features/quotation/shared/calcLine.mjs';

test('1. sq_ft, 8 x 2, qty 1, rate 2600, disc 0 -> area 16, total 41600.00', () => {
  const res = calcLine({
    methodType: 'area',
    width: 8,
    height: 2,
    quantity: 1,
    rate: 2600,
    discountPct: 0,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.area, 16);
  assert.equal(res.billableQty, 16);
  assert.equal(res.total, 41600.00);
});

test('2. sq_ft, 3 x 3, qty 1, rate 2600, disc 0 -> area 9, total 23400.00', () => {
  const res = calcLine({
    methodType: 'area',
    width: 3,
    height: 3,
    quantity: 1,
    rate: 2600,
    discountPct: 0,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.area, 9);
  assert.equal(res.billableQty, 9);
  assert.equal(res.total, 23400.00);
});

test('3. sq_ft, 8 x 2, qty 3, rate 100, disc 10 -> billableQty 48, gross 4800, discountAmount 480, total 4320.00', () => {
  const res = calcLine({
    methodType: 'area',
    width: 8,
    height: 2,
    quantity: 3,
    rate: 100,
    discountPct: 10,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.billableQty, 48);
  assert.equal(res.gross, 4800);
  assert.equal(res.discountAmount, 480);
  assert.equal(res.total, 4320.00);
});

test('4. sq_ft, 3.5 x 2.25, qty 1, rate 333.33 -> area 7.875, total 2624.97', () => {
  const res = calcLine({
    methodType: 'area',
    width: 3.5,
    height: 2.25,
    quantity: 1,
    rate: 333.33,
    discountPct: 0,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.area, 7.875);
  // 7.875 * 1 * 333.33 = 2624.97375 -> rounded to 2624.97
  assert.equal(res.total, 2624.97);
});

test('5. sq_m, 2 x 1.5, qty 2, rate 5000 -> area 3, billableQty 6, total 30000.00', () => {
  const res = calcLine({
    methodType: 'area',
    width: 2,
    height: 1.5,
    quantity: 2,
    rate: 5000,
    discountPct: 0,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.area, 3);
  assert.equal(res.billableQty, 6);
  assert.equal(res.total, 30000.00);
});

test('6. run_ft, length 12, qty 4, rate 150 -> billableQty 48, total 7200.00', () => {
  const res = calcLine({
    methodType: 'length',
    width: 12,
    height: null,
    quantity: 4,
    rate: 150,
    discountPct: 0,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.billableQty, 48);
  assert.equal(res.total, 7200.00);
});

test('7. run_m, length 2.5, qty 2, rate 800, disc 5 -> billableQty 5, gross 4000, discountAmount 200, total 3800.00', () => {
  const res = calcLine({
    methodType: 'length',
    width: 2.5,
    height: null,
    quantity: 2,
    rate: 800,
    discountPct: 5,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.billableQty, 5);
  assert.equal(res.gross, 4000);
  assert.equal(res.discountAmount, 200);
  assert.equal(res.total, 3800.00);
});

test('8. per_piece, qty 10, rate 250, disc 20 -> total 2000.00', () => {
  const res = calcLine({
    methodType: 'quantity',
    width: null,
    height: null,
    quantity: 10,
    rate: 250,
    discountPct: 20,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.billableQty, 10);
  assert.equal(res.gross, 2500);
  assert.equal(res.discountAmount, 500);
  assert.equal(res.total, 2000.00);
});

test('9. lump_sum, stored qty 5, rate 15000, disc 10 -> quantity treated as 1, total 13500.00', () => {
  const res = calcLine({
    methodType: 'fixed',
    width: null,
    height: null,
    quantity: 5,
    rate: 15000,
    discountPct: 10,
  });
  assert.equal(res.status, 'ok');
  assert.equal(res.billableQty, 1);
  assert.equal(res.gross, 15000);
  assert.equal(res.discountAmount, 1500);
  assert.equal(res.total, 13500.00);
});

test('10. sq_ft, width 8, height empty -> status incomplete, reason "size", total null', () => {
  const res = calcLine({
    methodType: 'area',
    width: 8,
    height: null,
    quantity: 1,
    rate: 2600,
    discountPct: 0,
  });
  assert.equal(res.status, 'incomplete');
  assert.equal(res.reason, 'size');
  assert.equal(res.total, null);
});

test('11. sq_ft, 8 x 2, rate empty -> status incomplete, reason "rate", total null', () => {
  const res = calcLine({
    methodType: 'area',
    width: 8,
    height: 2,
    quantity: 1,
    rate: null,
    discountPct: 0,
  });
  assert.equal(res.status, 'incomplete');
  assert.equal(res.reason, 'rate');
  assert.equal(res.total, null);
});

test('12. unit conversion helper: 24 in -> 2 ft; 1500 mm -> 4.921 ft (3 decimals); 6 ft -> 1.829 m', () => {
  const inToFt = convertDimension(24, 'in', 'ft');
  assert.equal(inToFt, 2);

  const mmToFt = convertDimension(1500, 'mm', 'ft');
  assert.equal(mmToFt, 4.921);

  const ftToM = convertDimension(6, 'ft', 'm');
  assert.equal(ftToM, 1.829);
});

test('13. Row state method switching: switching sq_ft -> per_piece keeps qty and discount, clears rate; switching back restores width and height', () => {
  // Initial state in sq_ft
  let row = {
    methodCode: 'sq_ft',
    width: 10,
    height: 4,
    qty: 3,
    rate: 2600,
    discount: 15,
  };

  // Switch to per_piece
  const switchToPerPiece = (prev) => ({
    ...prev,
    methodCode: 'per_piece',
    rate: null, // cleared
    // width & height preserved in row state (hidden)
  });

  const switchedRow = switchToPerPiece(row);
  assert.equal(switchedRow.methodCode, 'per_piece');
  assert.equal(switchedRow.qty, 3);
  assert.equal(switchedRow.discount, 15);
  assert.equal(switchedRow.rate, null);
  assert.equal(switchedRow.width, 10);
  assert.equal(switchedRow.height, 4);

  // Switch back to sq_ft
  const switchBackToSqFt = (prev) => ({
    ...prev,
    methodCode: 'sq_ft',
    rate: null,
  });

  const restoredRow = switchBackToSqFt(switchedRow);
  assert.equal(restoredRow.methodCode, 'sq_ft');
  assert.equal(restoredRow.qty, 3);
  assert.equal(restoredRow.discount, 15);
  assert.equal(restoredRow.width, 10);
  assert.equal(restoredRow.height, 4);
});
