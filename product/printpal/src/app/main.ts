// Entry point: mounts the PrintPal workshop app.

import "@printpal/ui/tokens.css";
import "./style.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("printpal-leads-root");
if (root) createRoot(root).render(React.createElement(App));
