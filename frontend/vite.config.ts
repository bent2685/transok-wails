import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
const rootPath = new URL(".", import.meta.url).pathname;
// https://vitejs.dev/config/``
export default defineConfig({
  plugins: [react(), UnoCSS()],
  resolve: {
    alias: {
      "@": rootPath + "src",
      "@wa": rootPath + "wailsjs/go",
      "@runtime": rootPath + "wailsjs/runtime",
    },
  },
});
