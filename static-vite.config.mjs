import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  root: resolve("static-src"),
  publicDir: resolve("public"),
  resolve: {
    alias: { "@": resolve(".") },
  },
  plugins: [react()],
  build: {
    outDir: resolve("site"),
    emptyOutDir: true,
  },
});
