import { useEffect, useState } from "react";
import { SignIn, SignUp, Waitlist } from "@clerk/react";

/**
 * PrintPal's single door: Clerk's own Waitlist, SignIn and SignUp components.
 *
 * Clerk is the ONLY system of record for people:
 *   waitlist entries → invitations → accounts → sessions.
 * Nothing about people is copied into our database. Once someone is signed in, the app creates their
 * workshop (tenant) in Neon, keyed by their Clerk user id (see /api/auth/sync-user).
 *
 * Modes (chosen from the URL, so the marketing site can deep-link):
 *   ?auth=signin    sign in (default: returning users)
 *   ?auth=waitlist  join the waitlist
 *   ?auth=signup    sign up (Clerk shows the waitlist form while sign-up is invite-only)
 *   ?__clerk_ticket=…  an invitation link from Clerk: shows sign-up, which completes the invitation
 */
type Mode = "signin" | "signup" | "waitlist";

function initialMode(): Mode {
  if (typeof window === "undefined") return "signin";
  const q = new URLSearchParams(window.location.search);
  if (q.has("__clerk_ticket")) return "signup";
  const wanted = (q.get("auth") || window.location.hash.replace("#", "")).toLowerCase();
  if (wanted === "waitlist") return "waitlist";
  if (wanted === "signup" || wanted === "register") return "signup";
  return "signin";
}

// Clerk's card, styled to sit in this page. Its own "have an account?" row is hidden; we show one link below the card.
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

export function LoginPage() {
  const [mode, setMode] = useState<Mode>(initialMode);

  // Keep the URL in step with the mode (query string, so it never fights Clerk's own hash routing)
  const switchMode = (next: Mode) => {
    const url = new URL(window.location.href);
    url.searchParams.set("auth", next);
    url.searchParams.delete("__clerk_ticket");
    url.searchParams.delete("__clerk_status");
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    setMode(next);
  };

  // Honour browser back/forward and edits to ?auth=
  useEffect(() => {
    const onPop = () => setMode(initialMode());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const link = (label: string, to: Mode) => (
    <button
      type="button"
      onClick={() => switchMode(to)}
      className="text-[#111827] font-semibold hover:underline cursor-pointer border-none bg-transparent p-0"
    >
      {label}
    </button>
  );

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

      {/* Center Auth Card Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <div key={mode} className="w-full flex justify-center animate-in fade-in duration-200">
            {mode === "signin" && (
              <SignIn routing="hash" forceRedirectUrl="/" appearance={cardAppearance} />
            )}
            {mode === "signup" && (
              <SignUp routing="hash" forceRedirectUrl="/" appearance={cardAppearance} />
            )}
            {mode === "waitlist" && <Waitlist appearance={cardAppearance} />}
          </div>

          <p className="mt-5 text-center text-[12px]/4 text-[#6B7280]">
            {mode === "signin" ? (
              <>
                New to PrintPal? {link("Sign up", "signup")}
                <span className="mx-2 text-[#D1D5DB]">•</span>
                {link("Join the waitlist", "waitlist")}
              </>
            ) : (
              <>Already have access? {link("Sign in", "signin")}</>
            )}
          </p>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-[12px]/4 text-[#9CA3AF]">
        PrintPal Workshop OS
      </footer>
    </div>
  );
}
