// Creates (or removes) two throwaway users in the Clerk DEV instance for the live-server tests.
// Reads CLERK_SECRET_KEY from the environment or from .env. Never prints the key or any token.
//
//   node tests/makeQaUsers.mjs            create two users, print the QA_SESSION_A / QA_SESSION_B lines
//   node tests/makeQaUsers.mjs --delete   delete the users listed in tests/.qa-users.json
//
// Refuses to run against a live (sk_live_) key.
import fs from "node:fs";
import path from "node:path";
import { createClerkClient } from "@clerk/backend";

const file = path.resolve("tests/.qa-users.json");
const dotenv = fs.existsSync(".env")
  ? Object.fromEntries(
      fs.readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
      })
    )
  : {};
const secretKey = process.env.CLERK_SECRET_KEY || dotenv.CLERK_SECRET_KEY;
if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set.");
if (secretKey.startsWith("sk_live_")) throw new Error("Refusing to create test users on a live Clerk instance.");
const clerk = createClerkClient({ secretKey });

if (process.argv.includes("--delete")) {
  if (!fs.existsSync(file)) {
    console.log("Nothing to delete.");
  } else {
    for (const id of JSON.parse(fs.readFileSync(file, "utf8")).userIds) await clerk.users.deleteUser(id).catch(() => {});
    fs.rmSync(file);
    console.log("Test users deleted.");
  }
} else {
  const stamp = Date.now();
  const userIds = [];
  const sessions = [];
  // The dev instance has no email or username sign-in, so a user can only carry an external id.
  for (const label of ["alpha", "beta"]) {
    const user = await clerk.users.createUser({ externalId: `qa-${label}-${stamp}` });
    userIds.push(user.id);
    sessions.push((await clerk.sessions.createSession({ userId: user.id })).id);
  }
  fs.writeFileSync(file, JSON.stringify({ userIds, sessionIds: sessions }));
  console.log("Created two throwaway test users. The live-server tests will pick them up automatically.");
  console.log("Delete them afterwards with: node tests/makeQaUsers.mjs --delete");
}
