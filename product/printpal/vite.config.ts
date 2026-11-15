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
    alias: {
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
      input: {
        island: resolve(__dirname, "index.html"),
        settings: resolve(__dirname, "settings.html"),
        mochi: resolve(__dirname, "mochi.html"),
      },
    },
  },
});
