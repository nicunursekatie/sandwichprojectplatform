import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // Use '/' for Render deployment, '/sandwichprojectplatform/' for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/sandwichprojectplatform/' : '/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    allowedHosts: [
      ".replit.dev",
      ".spock.replit.dev",
      "bb1d30f8-d852-4bae-abcd-b7c4521e3d85-00-x9tsn55inx51.spock.replit.dev",
      "all",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
