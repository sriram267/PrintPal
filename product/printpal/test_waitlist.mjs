const secretKey = "sk_test_HcZmGpnFNeGZpDuLkonXcR2fR51VXJFxBusWexue72";

async function checkWaitlist() {
  try {
    const res = await fetch("https://api.clerk.com/v1/waitlist_entries", {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    console.log("Waitlist status:", res.status, await res.json());
  } catch (err) {
    console.error("Waitlist error:", err);
  }
}

checkWaitlist();
