import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://softsync-backend.onrender.com/", changeOrigin: true },
      "/uploads": { target: "https://softsync-backend.onrender.com/", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
  },
});
