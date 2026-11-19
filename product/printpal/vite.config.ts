import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

function printpalBackendPlugin(): Plugin {
  let backendProc: ChildProcess | null = null;
  return {
    name: "printpal-backend-launcher",
    async configureServer() {
      // Check if Fastify is already running on port 3001
      try {
        const res = await fetch("http://127.0.0.1:3001/api/health");
        if (res.ok) {
          console.log("\x1b[32m[PrintPal Engine]\x1b[0m Fastify PostgreSQL 16 backend is active on http://127.0.0.1:3001");
          return;
        }
      } catch {}

      console.log("\x1b[34m[PrintPal Engine]\x1b[0m Auto-launching Fastify PostgreSQL 16 backend daemon...");
      const serverScript = resolve(__dirname, "server/server.mjs");
      backendProc = spawn("node", [serverScript], {
        stdio: "inherit",
        shell: true,
      });

      backendProc.on("error", (err) => {
        console.error("[PrintPal Engine] Failed to spawn backend:", err);
      });

      const killProc = () => {
        if (backendProc && !backendProc.killed) {
          try {
            backendProc.kill();
          } catch {}
        }
      };

      process.on("exit", killProc);
      process.on("SIGINT", killProc);
      process.on("SIGTERM", killProc);
    },
  };
}

export default defineConfig({
  plugins: [react(), printpalBackendPlugin()],
  resolve: {
    // The library has its own node_modules; make sure there is only ever ONE copy of React and the UI parts.
    dedupe: ["react", "react-dom", "react/jsx-runtime", "clsx", "tailwind-merge", "class-variance-authority", "lucide-react", "date-fns"],
    alias: {
      "@printpal/ui/tokens.css": resolve(__dirname, "../../packages/ui/src/tokens/tokens.css"),
      "@printpal/ui/greeting-engine": resolve(__dirname, "../../packages/ui/src/pal/greetingEngine.ts"),
      "@printpal/ui/pal.css": resolve(__dirname, "../../packages/ui/src/pal/palMascot.css"),
      "@printpal/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@/components": resolve(__dirname, "./src/components"),
      "@ui": resolve(__dirname, "./src/components/ui"),
      "@ui-library": resolve(__dirname, "./src"),
      "@": resolve(__dirname, "./src"),
    },
  },
  base: "./",
  clearScreen: false,
  server: {
    port: 5173,
    host: true,
    fs: { allow: [resolve(__dirname, "../..")] }, // lets the dev server read packages/ui
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res: any) => {
            // Silently suppress unhandled ECONNREFUSED terminal crashes during backend boot
            if (!res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  error: "Fastify backend initializing",
                  message: "PostgreSQL 16 engine warming up...",
                  offline: true,
                })
              );
            }
          });
        },
      },
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      input: { app: resolve(__dirname, "index.html") },
    },
  },
});

