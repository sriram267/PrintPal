import React, { useEffect } from "react";
import {
  ClerkProvider,
  Show,
  AuthenticateWithRedirectCallback,
  useAuth,
} from "@clerk/react";
import { LeadsApp } from "./LeadsApp";
import { LoginPage } from "./LoginPage";
import { installAuthFetchInterceptor, registerAuthTokenGetter } from "../shared/apiClient";

// Initialize the authenticated fetch interceptor immediately on client load
installAuthFetchInterceptor();

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_Y2xldmVyLW1vbml0b3ItOTgzNC5jbGVyay5hY2NvdW50cy5kZXYk";

function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerAuthTokenGetter(getToken);
  }, [getToken]);

  return <>{children}</>;
}

export function App() {
  // A Clerk invitation link carries __clerk_ticket and also
  // __clerk_status=sign_up. That is NOT an SSO callback: it must show the sign-up screen, which completes the invitation.
  const hasInvitation = typeof window !== "undefined" && window.location.search.includes("__clerk_ticket");
  const isSSOCallback =
    typeof window !== "undefined" &&
    !hasInvitation &&
    (window.location.pathname.startsWith("/sso-callback") ||
      window.location.hash.includes("sso-callback") ||
      window.location.search.includes("__clerk_status") ||
      window.location.search.includes("__clerk_created_session"));

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          // Clerk 6 (Core 3) names: colorForeground / colorMutedForeground / colorInput / colorInputForeground
          colorPrimary: "#2E333D",
          colorForeground: "#111827",
          colorMutedForeground: "#6B7280",
          colorBackground: "#FFFFFF",
          colorInput: "#FFFFFF",
          colorInputForeground: "#111827",
          borderRadius: "10px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Inter', -apple-system-subheading, sans-serif",
        },
      }}
    >
      {isSSOCallback ? (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/"
            signUpForceRedirectUrl="/"
          />
        </div>
      ) : (
        <AuthTokenBridge>
          {/* Clerk 6 (Core 3): <Show when="signed-in"> replaces <SignedIn>, "signed-out" replaces <SignedOut> */}
          <Show when="signed-in">
            <LeadsApp />
          </Show>
          <Show when="signed-out">
            <LoginPage />
          </Show>
        </AuthTokenBridge>
      )}
    </ClerkProvider>
  );
}
