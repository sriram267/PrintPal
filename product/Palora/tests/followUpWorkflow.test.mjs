// @ts-check
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3001";
const TENANT_A = "test_tenant_followup";

function isDueForFollowUpReminder(followUpDateStr, mockCurrentDate) {
  if (!followUpDateStr) return false;

  let targetDate = null;
  const parts = followUpDateStr.trim().split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      targetDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
  if (!targetDate || isNaN(targetDate.getTime())) {
    targetDate = new Date(followUpDateStr);
  }
  if (isNaN(targetDate.getTime())) return false;

  targetDate.setHours(23, 59, 59, 999);

  // 1 day before at 00:00:00
  const oneDayBefore = new Date(targetDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(0, 0, 0, 0);

  const now = mockCurrentDate || new Date();
  return now >= oneDayBefore && now <= targetDate;
}

async function runTests() {
  console.log("=== Running PrintPal Follow-Up & Pal Notch Workflow Tests ===");

  // 1. Test Date Logic: 1 day before until target date
  console.log("Test 1: Testing follow-up date calculation (1 day before until end date)...");
  const testFollowUpDate = "2026-11-17";
  
  // 2 days before (2026-11-15) -> Should NOT trigger
  const d2Before = new Date(2026, 10, 15, 12, 0, 0);
  assert.equal(isDueForFollowUpReminder(testFollowUpDate, d2Before), false, "2 days before should NOT trigger reminder");

  // 1 day before (2026-11-16 09:00) -> SHOULD trigger
  const d1Before = new Date(2026, 10, 16, 9, 0, 0);
  assert.equal(isDueForFollowUpReminder(testFollowUpDate, d1Before), true, "1 day before MUST trigger reminder");

  // Same day (2026-11-17 18:00) -> SHOULD trigger
  const dSameDay = new Date(2026, 10, 17, 18, 0, 0);
  assert.equal(isDueForFollowUpReminder(testFollowUpDate, dSameDay), true, "Same day MUST trigger reminder");

  // 1 day after (2026-11-18 01:00) -> Should NOT trigger
  const dAfter = new Date(2026, 10, 18, 1, 0, 0);
  assert.equal(isDueForFollowUpReminder(testFollowUpDate, dAfter), false, "Day after should NOT trigger reminder");
  console.log("  ✓ Date logic validated successfully.");

  // 2. Test Backend Persistence for Enquiries with follow_up_date
  console.log("Test 2: Testing backend API for enquiry follow_up_date persistence...");
  const testEnquiryId = `enq-test-${Date.now()}`;
  const enquiryPayload = {
    id: testEnquiryId,
    contactName: "Rajesh Kumar (Apex Advertising)",
    phone: "9840012345",
    email: "rajesh@apexsign.in",
    address: "74 Mount Road, Guindy, Chennai",
    source: "WALK_IN",
    stage: "NEEDS_FOLLOW_UP",
    followUpDate: "2026-11-17",
    inquiryNote: "ACP 3D Letter Signboard with Warm LED",
    hasVectorLogo: true,
    wallSubstrate: "CONCRETE",
    mountingHeightFt: 14,
    hasPowerPoint: true,
  };

  const createRes = await fetch(`${BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT_A,
    },
    body: JSON.stringify(enquiryPayload),
  });
  assert.ok([200, 201].includes(createRes.status), `POST /api/enquiries failed: ${createRes.status}`);
  const created = await createRes.json();
  assert.equal(created.id, testEnquiryId);
  console.log("  ✓ Enquiry with follow_up_date created in backend.");

  // 3. Test Retrieval of follow_up_date
  console.log("Test 3: Testing GET /api/enquiries to ensure followUpDate is returned...");
  const getRes = await fetch(`${BASE_URL}/api/enquiries`, {
    headers: { "x-tenant-id": TENANT_A },
  });
  assert.equal(getRes.status, 200);
  const enquiriesList = await getRes.json();
  const found = enquiriesList.find((e) => e.id === testEnquiryId);
  assert.ok(found, "Created enquiry should be present in enquiries list");
  assert.equal(found.followUpDate, "2026-11-17", "followUpDate must match");
  assert.equal(found.stage, "NEEDS_FOLLOW_UP", "stage must be NEEDS_FOLLOW_UP");
  console.log("  ✓ Found enquiry with followUpDate:", found.followUpDate, "stage:", found.stage);

  // 4. Test Conversion to Customer (Save action / Raise Quote action)
  console.log("Test 4: Testing Enquiry conversion to Customer record...");
  const customerPayload = {
    id: `cust-from-${testEnquiryId}`,
    name: found.contactName,
    businessName: "Apex Advertising",
    contactPerson: found.contactName,
    phone: found.phone,
    email: found.email,
    address: found.address,
    customerType: "RETAIL_BRAND",
    sites: [
      {
        id: `site-1`,
        siteName: "Guindy Main Office",
        address: found.address,
      },
    ],
  };

  const saveCustRes = await fetch(`${BASE_URL}/api/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT_A,
    },
    body: JSON.stringify(customerPayload),
  });
  assert.ok([200, 201].includes(saveCustRes.status), `POST /api/customers failed: ${saveCustRes.status}`);
  console.log("  ✓ Customer created from enquiry.");

  // Delete the converted enquiry
  console.log("Test 5: Testing deletion of enquiry line item upon conversion...");
  const deleteRes = await fetch(`${BASE_URL}/api/enquiries/${testEnquiryId}`, {
    method: "DELETE",
    headers: { "x-tenant-id": TENANT_A },
  });
  assert.equal(deleteRes.status, 200, `DELETE /api/enquiries/${testEnquiryId} failed: ${deleteRes.status}`);
  
  // Verify enquiry is gone
  const getAfterDelete = await fetch(`${BASE_URL}/api/enquiries`, {
    headers: { "x-tenant-id": TENANT_A },
  });
  const afterList = await getAfterDelete.json();
  assert.ok(!afterList.some((e) => e.id === testEnquiryId), "Enquiry should be deleted from enquiries list");
  console.log("  ✓ Enquiry removed from table successfully.");

  // Cleanup customer created for test
  await fetch(`${BASE_URL}/api/customers/${customerPayload.id}`, {
    method: "DELETE",
    headers: { "x-tenant-id": TENANT_A },
  });

  console.log("\n>>> ALL FOLLOW-UP WORKFLOW TESTS PASSED! <<<");
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
