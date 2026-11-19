/* Loads product/printpal/.env (if present) before anything reads process.env. Moved from server/server.mjs (A2). */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env if present (native in Node.js 20.6+)
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(path.resolve(__dirname, "../../../.env"));
  } catch {}
}
