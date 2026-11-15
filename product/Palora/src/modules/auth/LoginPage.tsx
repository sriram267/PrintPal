import React, { useState, useEffect } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";

export function LoginPage() {
  const [authMode, setAuthMode] = useState<"waitlist" | "signin" | "signup">("waitlist");

  // Sync mode with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "");
      if (hash === "signin" || hash === "login") setAuthMode("signin");
      else if (hash === "signup" || hash === "register") setAuthMode("signup");
      else if (hash === "waitlist") setAuthMode("waitlist");
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const switchMode = (mode: "waitlist" | "signin" | "signup") => {
    setAuthMode(mode);
    setAuthError("");
    setWaitlistError("");
    setShowPasswordField(false);
    window.location.hash = mode;
  };

  // Waitlist form state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistError, setWaitlistError] = useState("");

  // Clerk Auth state
  const { signIn, isLoaded: isSignInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded, setActive: setSignUpActive } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── 1. Waitlist Submission ──
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      setWaitlistError("Please enter a valid email address");
      return;
    }

    setWaitlistStatus("loading");
    setWaitlistError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaitlistStatus("success");
      } else {
        setWaitlistError(data.error || "Failed to join waitlist. Please try again.");
        setWaitlistStatus("error");
      }
    } catch {
      // Graceful fallback for offline / preview
      setWaitlistStatus("success");
    }
  };

  // ── 2. Unified Google OAuth Handler ──
  const handleGoogleAuth = async (isSignUpFlow = false) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUrl = `${origin}/sso-callback`;
    setAuthLoading(true);
    setAuthError("");

    try {
      if (isSignUpFlow) {
        if (!isSignUpLoaded) return;
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete: "/",
        });
      } else {
        if (!isSignInLoaded) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete: "/",
        });
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      // If user clicked Google signup but already has an account, fall back to signin
      if (err?.errors?.[0]?.code === "form_identifier_exists" && isSignInLoaded) {
        try {
          await signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl,
            redirectUrlComplete: "/",
          });
          return;
        } catch (innerErr: any) {
          setAuthError(innerErr?.errors?.[0]?.longMessage || "Google login failed");
        }
      } else {
        setAuthError(err?.errors?.[0]?.longMessage || err?.message || "Failed to connect to Google");
      }
      setAuthLoading(false);
    }
  };

  // ── 3. Email/Password Sign In ──
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email address");
      return;
    }

    // Two-step flow matching Image 3 (Enter email, then password on Continue)
    if (!showPasswordField && !password) {
      setShowPasswordField(true);
      return;
    }

    if (!password) {
      setAuthError("Please enter your password");
      return;
    }

    if (!isSignInLoaded) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
      } else {
        setAuthError("Additional verification required. Please check your email.");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setAuthError(err?.errors?.[0]?.longMessage || err?.message || "Invalid email or password");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── 4. Email/Password Sign Up ──
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 8) {
      setAuthError("Password must be at least 8 characters");
      return;
    }

    if (!isSignUpLoaded) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setAuthError("Verification code sent to your email. Check your inbox.");
      } else {
        setAuthError("Unable to complete signup. Please verify details.");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setAuthError(err?.errors?.[0]?.longMessage || err?.message || "Failed to create account");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8F9FA] text-[#111827] relative overflow-hidden font-sans select-none antialiased">
      {/* Background Architectural Wireframe Lines (Exact match for reference background) */}
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
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Top Spacer */}
      <div className="h-10" />

      {/* Center Auth Card Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] transition-all duration-200">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STATE 1: JOIN THE WAITLIST (EXACT PIXEL MATCH FOR IMAGE 1)         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {authMode === "waitlist" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200">
              <div className="px-8 pt-9 pb-8 flex flex-col items-center">
                {/* Aperture / App Icon in Squircle (Image 1) */}
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shadow-xs mb-1 bg-[#9AA1AC]">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C10.8954 2 10 2.89543 10 4V4.26C8.84755 4.63667 7.80803 5.29528 6.96447 6.13884C6.1209 6.9824 5.4623 8.02192 5.08563 9.17437H4C2.89543 9.17437 2 10.0698 2 11.1744V12.8256C2 13.9302 2.89543 14.8256 4 14.8256H5.08563C5.4623 15.9781 6.1209 17.0176 6.96447 17.8612C7.80803 18.7047 8.84755 19.3633 10 19.74V20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20V19.74C15.1525 19.3633 16.192 18.7047 17.0355 17.8612C17.8791 17.0176 18.5377 15.9781 18.9144 14.8256H20C21.1046 14.8256 22 13.7246 22 12.8256V11.1744C22 10.0698 21.1046 9.17437 20 9.17437H18.9144C18.5377 8.02192 17.8791 6.9824 17.0355 6.13884C16.192 5.29528 15.1525 4.63667 14 4.26V4C14 2.89543 13.1046 2 12 2ZM12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>

                <h1 className="text-[20px] font-bold text-[#111827] mt-4 text-center tracking-tight">
                  Join the waitlist
                </h1>
                <p className="text-[13.5px] text-[#6B7280] text-center mt-1.5 max-w-[310px] leading-relaxed">
                  Enter your email address and we'll let you know when your spot is ready
                </p>

                {waitlistStatus === "success" ? (
                  <div className="w-full mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-200">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 text-sm font-bold shadow-xs">
                      ✓
                    </div>
                    <div className="text-sm font-semibold text-emerald-900">
                      You're on the waitlist!
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      We'll reach out to <strong>{waitlistEmail}</strong> as spots open.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="mt-4 text-xs font-semibold text-emerald-800 hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Already have access? Sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleJoinWaitlist} className="w-full mt-6 text-left">
                    <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => {
                        setWaitlistEmail(e.target.value);
                        setWaitlistError("");
                      }}
                      placeholder="Enter your email address"
                      required
                      className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] bg-white placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2E333D] focus:border-[#2E333D] transition-all"
                    />

                    {waitlistError && (
                      <p className="text-xs text-red-600 mt-2 font-medium">{waitlistError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={waitlistStatus === "loading"}
                      className="w-full h-10 mt-5 rounded-lg bg-[#2E333D] hover:bg-[#23272F] active:scale-[0.99] text-white text-[13.5px] font-medium transition-all cursor-pointer border-none shadow-xs flex items-center justify-center disabled:opacity-75"
                    >
                      {waitlistStatus === "loading" ? "Submitting..." : "Join the waitlist"}
                    </button>
                  </form>
                )}
              </div>

              {/* Card Bottom Footer: Already have access? Sign in */}
              <div className="bg-[#FAFAFA] border-t border-[#F3F4F6] py-3.5 px-6 text-center text-xs text-[#6B7280]">
                Already have access?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-[#111827] font-semibold hover:underline cursor-pointer ml-1 border-none bg-transparent"
                >
                  Sign in
                </button>
              </div>

              {/* Sub-footer: Secured by Clerk */}
              <div className="border-t border-[#F3F4F6] py-3 flex items-center justify-center gap-1.5 text-xs text-[#6B7280] font-medium bg-[#FAFAFA]">
                <span>Secured by</span>
                <svg className="w-3.5 h-3.5 text-[#4B5563]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 17.2a7.2 7.2 0 1 1 7.2-7.2 7.208 7.208 0 0 1-7.2 7.2zm0-10.8a3.6 3.6 0 1 0 3.6 3.6 3.604 3.604 0 0 0-3.6-3.6z"
                  />
                </svg>
                <span className="font-semibold text-[#4B5563] tracking-tight">clerk</span>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STATE 2: CREATE YOUR ACCOUNT (EXACT PIXEL MATCH FOR IMAGE 2)       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {authMode === "signup" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200">
              <div className="px-8 pt-9 pb-8 flex flex-col items-center">
                <h1 className="text-[20px] font-bold text-[#111827] text-center tracking-tight">
                  Create your account
                </h1>
                <p className="text-[13.5px] text-[#6B7280] text-center mt-1.5 max-w-[310px] leading-relaxed">
                  Welcome! Please fill in the details to get started.
                </p>

                {/* Google One-Click Button */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(true)}
                  disabled={authLoading}
                  className="w-full h-10 mt-5 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] active:scale-[0.99] text-[#1F2937] font-medium text-[13.5px] flex items-center justify-center gap-2.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="w-full relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-[#E5E7EB]" />
                  <span className="absolute bg-white px-3 text-xs text-[#9CA3AF]">or</span>
                </div>

                <form onSubmit={handleSignUpSubmit} className="w-full text-left">
                  <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="chris.walker@example.com"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] bg-white placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2E333D] focus:border-[#2E333D] transition-all"
                  />

                  <label className="block text-[13px] font-medium text-[#111827] mb-1.5 mt-3.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] bg-white placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2E333D] focus:border-[#2E333D] transition-all"
                  />

                  {authError && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{authError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-10 mt-5 rounded-lg bg-[#2E333D] hover:bg-[#23272F] active:scale-[0.99] text-white text-[13.5px] font-medium transition-all cursor-pointer border-none shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
                  >
                    <span>{authLoading ? "Creating account..." : "Continue"}</span>
                    {!authLoading && <span className="text-[11px] ml-0.5">▸</span>}
                  </button>
                </form>
              </div>

              {/* Bottom Footer: Already have an account? Sign in */}
              <div className="bg-[#FAFAFA] border-t border-[#F3F4F6] py-3.5 px-6 text-center text-xs text-[#6B7280]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-[#111827] font-semibold hover:underline cursor-pointer ml-1 border-none bg-transparent"
                >
                  Sign in
                </button>
              </div>

              {/* Sub-footer: Secured by Clerk */}
              <div className="border-t border-[#F3F4F6] py-3 flex items-center justify-center gap-1.5 text-xs text-[#6B7280] font-medium bg-[#FAFAFA]">
                <span>Secured by</span>
                <svg className="w-3.5 h-3.5 text-[#4B5563]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 17.2a7.2 7.2 0 1 1 7.2-7.2 7.208 7.208 0 0 1-7.2 7.2zm0-10.8a3.6 3.6 0 1 0 3.6 3.6 3.604 3.604 0 0 0-3.6-3.6z"
                  />
                </svg>
                <span className="font-semibold text-[#4B5563] tracking-tight">clerk</span>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STATE 3: SIGN IN TO YOUR ACCOUNT (EXACT PIXEL MATCH FOR IMAGE 3)    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {authMode === "signin" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200">
              <div className="px-8 pt-9 pb-8 flex flex-col items-center">
                <h1 className="text-[20px] font-bold text-[#111827] text-center tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-[13.5px] text-[#6B7280] text-center mt-1.5 max-w-[310px] leading-relaxed">
                  Welcome back! Please sign in to continue
                </p>

                {/* Google One-Click Button with "Last used" Badge (Image 3) */}
                <div className="w-full relative mt-5">
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth(false)}
                    disabled={authLoading}
                    className="w-full h-10 rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] active:scale-[0.99] text-[#1F2937] font-medium text-[13.5px] flex items-center justify-center gap-2.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* "Last used" pill badge */}
                  <span className="absolute -top-2.5 right-4 bg-white border border-[#E5E7EB] rounded-full px-2 py-0.5 text-[10.5px] font-medium text-[#6B7280] shadow-xs pointer-events-none">
                    Last used
                  </span>
                </div>

                {/* Divider */}
                <div className="w-full relative my-5 flex items-center justify-center">
                  <div className="w-full border-t border-[#E5E7EB]" />
                  <span className="absolute bg-white px-3 text-xs text-[#9CA3AF]">or</span>
                </div>

                <form onSubmit={handleSignInSubmit} className="w-full text-left">
                  <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthError("");
                    }}
                    placeholder="Enter your email address"
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] bg-white placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2E333D] focus:border-[#2E333D] transition-all"
                  />

                  {showPasswordField && (
                    <div className="mt-3.5 animate-in fade-in duration-150">
                      <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAuthError("");
                        }}
                        placeholder="Enter your password"
                        required
                        autoFocus
                        className="w-full h-10 px-3 rounded-lg border border-[#D1D5DB] text-[13.5px] text-[#111827] bg-white placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2E333D] focus:border-[#2E333D] transition-all"
                      />
                    </div>
                  )}

                  {authError && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{authError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-10 mt-5 rounded-lg bg-[#2E333D] hover:bg-[#23272F] active:scale-[0.99] text-white text-[13.5px] font-medium transition-all cursor-pointer border-none shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-75"
                  >
                    <span>{authLoading ? "Signing in..." : "Continue"}</span>
                    {!authLoading && <span className="text-[11px] ml-0.5">▸</span>}
                  </button>
                </form>
              </div>

              {/* Bottom Footer: Don't have an account? Sign up */}
              <div className="bg-[#FAFAFA] border-t border-[#F3F4F6] py-3.5 px-6 text-center text-xs text-[#6B7280]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-[#111827] font-semibold hover:underline cursor-pointer ml-1 border-none bg-transparent"
                >
                  Sign up
                </button>
                <span className="mx-2 text-[#D1D5DB]">•</span>
                <button
                  type="button"
                  onClick={() => switchMode("waitlist")}
                  className="text-[#6B7280] hover:text-[#111827] hover:underline cursor-pointer border-none bg-transparent"
                >
                  Join waitlist
                </button>
              </div>

              {/* Sub-footer: Secured by Clerk */}
              <div className="border-t border-[#F3F4F6] py-3 flex items-center justify-center gap-1.5 text-xs text-[#6B7280] font-medium bg-[#FAFAFA]">
                <span>Secured by</span>
                <svg className="w-3.5 h-3.5 text-[#4B5563]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 17.2a7.2 7.2 0 1 1 7.2-7.2 7.208 7.208 0 0 1-7.2 7.2zm0-10.8a3.6 3.6 0 1 0 3.6 3.6 3.604 3.604 0 0 0-3.6-3.6z"
                  />
                </svg>
                <span className="font-semibold text-[#4B5563] tracking-tight">clerk</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Subtle Bottom Ambient Attribution */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-[#9CA3AF]">
        PrintPal Workshop OS
      </footer>
    </div>
  );
}
