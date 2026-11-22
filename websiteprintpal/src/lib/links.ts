/** Where "Sign in" goes: the PrintPal app (its login page is a single "Continue with Google" button). */
export const APP_URL: string = import.meta.env.VITE_APP_URL || "https://printpal-app.pages.dev";

/** Opens the app and goes straight to Google. The same link signs people up or signs them in. */
export const GOOGLE_START_URL: string = `${APP_URL.replace(/\/$/, "")}/?auth=google`;
