import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./styles/tokens.css";
import "./styles/global.css";
import { App } from "./App";

// No Clerk on the marketing site: every sign-up/sign-in button links to the PrintPal app,
// whose login page is a single "Continue with Google" button (see lib/links.ts).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
