import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

/* `npm run dev` opens the preview page: every component on one scrolling page. */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@ui": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 5190 },
});
