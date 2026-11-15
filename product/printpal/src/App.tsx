import React, { useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  AuthenticateWithRedirectCallback,
  useAuth,
} from "@clerk/clerk-react";
import { LeadsApp } from "./modules/leads/LeadsApp";
import { LoginPage } from "./modules/auth/LoginPage";
import { installAuthFetchInterceptor, registerAuthTokenGetter } from "./core/apiClient";

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
  const isSSOCallback =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/sso-callback") ||
      window.location.hash.includes("sso-callback") ||
      window.location.search.includes("__clerk_status") ||
      window.location.search.includes("__clerk_created_session"));

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#2E333D",
          colorText: "#111827",
          colorTextSecondary: "#6B7280",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#111827",
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
          <SignedIn>
            <LeadsApp />
          </SignedIn>
          <SignedOut>
            <LoginPage />
          </SignedOut>
        </AuthTokenBridge>
      )}
    </ClerkProvider>
  );
}
