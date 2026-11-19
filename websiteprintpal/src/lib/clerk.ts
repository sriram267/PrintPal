import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/react";

/**
 * Clerk setup for the marketing site.
 *
 * The site and the PrintPal app use the SAME Clerk instance, so:
 * - the waitlist form here is Clerk's own <Waitlist /> (entries appear in the Clerk dashboard, where you invite people);
 * - "Sign in" / "Sign up" send people to the app, where Clerk's sign-in and sign-up screens live, so the
 *   session is created on the app's domain and they land inside PrintPal signed in.
 *
 * Only the PUBLISHABLE key belongs here (it is public by design). Never put the secret key in this project.
 */
export const CLERK_PUBLISHABLE_KEY: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
export const HAS_CLERK = CLERK_PUBLISHABLE_KEY.startsWith("pk_");

type Appearance = ComponentProps<typeof ClerkProvider>["appearance"];

/** Clerk components styled to match the site (Inter, dark buttons, 10px radius). */
export const clerkAppearance: Appearance = {
  variables: {
    // Clerk 6 (Core 3) names: colorForeground / colorMutedForeground / colorInput / colorInputForeground
    colorPrimary: "#1d1f22",
    colorForeground: "#1c1d1f",
    colorMutedForeground: "#6b7178",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#1c1d1f",
    fontFamily: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    borderRadius: "10px",
  },
  elements: {
    formButtonPrimary: { fontSize: "14px", fontWeight: 550, textTransform: "none", letterSpacing: "-0.01em" },
    headerTitle: { fontSize: "20px", fontWeight: 620, letterSpacing: "-0.025em" },
    footerActionLink: { color: "#d7440e", fontWeight: 600 },
  },
};
