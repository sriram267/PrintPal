import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "@fontsource-variable/inter";
import "./styles/tokens.css";
import "./styles/global.css";
import { App } from "./App";
import { APP_URL } from "./lib/links";
import { CLERK_PUBLISHABLE_KEY, HAS_CLERK, clerkAppearance } from "./lib/clerk";

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    {HAS_CLERK ? (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        // Sign-in and sign-up live in the PrintPal app (same Clerk instance), so people end up inside the product.
        signInUrl={APP_URL}
        signUpUrl={APP_URL}
        signInFallbackRedirectUrl={APP_URL}
        signUpFallbackRedirectUrl={APP_URL}
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
