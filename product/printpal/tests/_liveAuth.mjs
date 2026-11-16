// Lets the live-server tests (followUpWorkflow, fullProductAudit) talk to a server that now requires a Clerk token.
//
// The tests were written when the tenant came from an x-tenant-id header. That header is ignored now, so this
// helper swaps it for a real Bearer token: a tenant label ending in "beta" uses user B, everything else user A.
//
// Setup (once): node tests/makeQaUsers.mjs   (creates two throwaway Clerk dev users, saved in tests/.qa-users.json)
// Then just run the test. CLERK_SECRET_KEY comes from .env; set QA_BASE if the server is not on :3001.
// When finished: node tests/makeQaUsers.mjs --delete
//
// Without those, the live tests print why they were skipped and exit 0, so a plain run stays honest.
import fs from "node:fs";
import path from "node:path";
import { createClerkClient } from "@clerk/backend";

/** Sessions written by makeQaUsers.mjs and the secret key from .env, unless already set in the environment. */
function loadLocalSetup() {
  const out = {};
  try {
    const users = JSON.parse(fs.readFileSync(path.resolve("tests/.qa-users.json"), "utf8"));
    [out.QA_SESSION_A, out.QA_SESSION_B] = users.sessionIds || [];
  } catch {}
  try {
    const line = fs.readFileSync(path.resolve(".env"), "utf8").split(/\r?\n/).find((l) => l.startsWith("CLERK_SECRET_KEY="));
    if (line) out.CLERK_SECRET_KEY = line.slice("CLERK_SECRET_KEY=".length).replace(/^["']|["']$/g, "");
  } catch {}
  return out;
}

export async function useLiveAuth(base) {
  const local = loadLocalSetup();
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || local.CLERK_SECRET_KEY;
  const QA_SESSION_A = process.env.QA_SESSION_A || local.QA_SESSION_A;
  const QA_SESSION_B = process.env.QA_SESSION_B || local.QA_SESSION_B;
  const skip = (why) => {
    console.log(`  - skipped: ${why}`);
    console.log("    To run it: node tests/makeQaUsers.mjs (creates two throwaway Clerk dev users), then run this test again.");
    return false;
  };
  if (!CLERK_SECRET_KEY || !QA_SESSION_A || !QA_SESSION_B) return skip("needs two signed-in test users.");
  try {
    const r = await fetch(`${base}/api/health`);
    if (!r.ok) return skip(`server at ${base} is not healthy (${r.status}).`);
  } catch {
    return skip(`no server is running at ${base}.`);
  }

  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const tokenFor = async (sessionId) => (await clerk.sessions.getToken(sessionId, "")).jwt;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const headers = new Headers(init.headers || {});
    const tenant = headers.get("x-tenant-id");
    if (tenant) {
      headers.delete("x-tenant-id");
      headers.set("Authorization", `Bearer ${await tokenFor(/beta$/.test(tenant) ? QA_SESSION_B : QA_SESSION_A)}`);
    }
    return realFetch(url, { ...init, headers });
  };
  return true;
}
