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
    dedupe: ["react", "react-dom", "react/jsx-runtime", "clsx", "tailwind-merge", "class-variance-authority", "lucide-react", "date-fns"],
    alias: [
      { find: "@clerk/react", replacement: STUB },
      { find: "@printpal/ui/tokens.css", replacement: `${APP}/../../packages/ui/src/tokens/tokens.css` },
      { find: "@printpal/ui/greeting-engine", replacement: `${APP}/../../packages/ui/src/pal/greetingEngine.ts` },
      { find: "@printpal/ui/pal.css", replacement: `${APP}/../../packages/ui/src/pal/palMascot.css` },
      { find: "@printpal/ui", replacement: `${APP}/../../packages/ui/src/index.ts` },
      { find: "@", replacement: `${APP}/src` },
    ],
  },
  server: { port: 5199, strictPort: true, fs: { strict: false } },
  logLevel: "warn",
});
