// QA-only Vite config: the real app, with Clerk swapped for a stub and WITHOUT the plugin that auto-starts the
// local server (all /api calls are answered by Playwright from fixtures). Run with cwd = product/printpal.
import { defineConfig } from "file:///C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal/node_modules/@vitejs/plugin-react/dist/index.mjs";

const APP = "C:/Users/vssri/OneDrive/Desktop/Skills/product/printpal";
const STUB = "C:/Users/vssri/AppData/Local/Temp/claude/37d623c9cbf993e5/df20edba-393c-40ce-8465-2db6fc71f303/scratchpad/a3/clerk-stub.jsx";

export default defineConfig({
  root: APP,
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@clerk/react", replacement: STUB },
      { find: "@/components", replacement: `${APP}/src/components` },
      { find: "@ui-library", replacement: `${APP}/src` },
      { find: "@ui", replacement: `${APP}/src/components/ui` },
      { find: "@", replacement: `${APP}/src` },
    ],
  },
  server: { port: 5199, strictPort: true, fs: { strict: false } },
  logLevel: "warn",
});
