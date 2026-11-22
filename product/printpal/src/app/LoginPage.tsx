import { useEffect, useRef, useState } from "react";
import { SignUp, useClerk } from "@clerk/react";
import { Button } from "@printpal/ui";

/**
 * PrintPal's single door: one "Continue with Google" button.
 *
 * The same button signs people in and signs them up. Clerk starts a Google sign-in; if no account exists yet,
 * <AuthenticateWithRedirectCallback> (App.tsx, at /sso-callback) turns it into a sign-up automatically.
 * Clerk is the ONLY system of record for people. Once someone is signed in, the app creates their
 * workshop (tenant) in Neon, keyed by their Clerk user id (see /api/auth/sync-user).
 *
 * URL options:
 *   ?auth=google       start Google straight away (the marketing site links here, so it's one click)
 *   ?__clerk_ticket=…  an old invitation link from Clerk: shows Clerk's sign-up, which completes the invitation
 */
const hasInvitation = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("__clerk_ticket");

const wantsGoogleNow = () =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("auth") === "google";

const cardAppearance = {
  elements: {
    rootBox: { width: "100%" },
    cardBox: {
      width: "100%",
      maxWidth: "400px",
      borderRadius: "16px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    },
    footerAction: { display: "none" },
  },
} as const;

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function GoogleDoor() {
  const clerk = useClerk();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const autoStarted = useRef(false);

  const start = async () => {
    if (!clerk.loaded || !clerk.client) return;
    setBusy(true);
    setFailed(false);
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  // Came from the website's button: go straight to Google, once
  useEffect(() => {
    if (clerk.loaded && wantsGoogleNow() && !autoStarted.current) {
      autoStarted.current = true;
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk.loaded]);

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] px-8 py-9 flex flex-col items-center text-center">
      <h1 className="text-[20px]/7 font-semibold tracking-[-0.02em] text-[#111827]">Welcome to PrintPal</h1>
      <p className="mt-1.5 text-[14px]/5 text-[#6B7280]">Sign in or create your account with Google.</p>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={start}
        loading={busy}
        disabled={!clerk.loaded}
        className="mt-7 w-full h-11 gap-3 [&_svg]:size-[18px]"
      >
        {!busy && <GoogleMark />}
        {busy ? "Opening Google…" : "Continue with Google"}
      </Button>

      {failed && (
        <p role="alert" className="mt-3 text-[13px]/5 text-[#B42318]">
          Couldn't open Google sign-in. Please try again.
        </p>
      )}
    </div>
  );
}

export function LoginPage() {
  const invited = hasInvitation();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8F9FA] text-[#111827] relative overflow-hidden font-sans antialiased">
      {/* Background Architectural Wireframe Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <path d="M-100 200 L600 -100" stroke="#E5E7EB" strokeWidth="1" />
        <path d="M-50 450 L900 -200" stroke="#E5E7EB" strokeWidth="1" />
        <path d="M1200 100 L400 900" stroke="#E5E7EB" strokeWidth="1" />
        <path d="M1400 350 L700 1100" stroke="#E5E7EB" strokeWidth="1" />
      </svg>

      {/* Subtle Warm Violet Glow at Bottom Center */}
      <div
        className="absolute bottom-[-160px] left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full pointer-events-none opacity-40 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)" }}
      />

      <div className="h-10" />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] flex flex-col items-center animate-in fade-in duration-200">
          {invited ? (
            <SignUp routing="hash" forceRedirectUrl="/" appearance={cardAppearance} />
          ) : (
            <GoogleDoor />
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-[12px]/4 text-[#9CA3AF]">
        PrintPal Workshop OS
      </footer>
    </div>
  );
}
