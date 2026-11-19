import { Waitlist } from "@clerk/react";
import { APP_URL } from "../lib/links";
import { HAS_CLERK } from "../lib/clerk";

/**
 * Clerk's own waitlist form. Entries go straight to the Clerk dashboard (Waitlist), where you invite people.
 * Its "Already have access? Sign in" link goes to the PrintPal app.
 * `bare` drops Clerk's card chrome and heading, for places that already have their own heading.
 */
export function ClerkWaitlist({ bare = false }: { bare?: boolean }) {
  if (!HAS_CLERK) {
    return (
      <p className="wl-missing" role="alert">
        The waitlist isn't connected: set VITE_CLERK_PUBLISHABLE_KEY.
      </p>
    );
  }
  return (
    <Waitlist
      signInUrl={APP_URL}
      appearance={{
        elements: {
          rootBox: { width: "100%" },
          cardBox: { width: "100%", maxWidth: "100%", boxShadow: bare ? "0 18px 40px -16px rgba(0,0,0,0.55)" : "none", border: "none" },
          card: bare ? { boxShadow: "none" } : { boxShadow: "none", border: "none", padding: "8px 4px 4px" },
          ...(bare ? { header: { display: "none" } } : {}),
        },
      }}
    />
  );
}
