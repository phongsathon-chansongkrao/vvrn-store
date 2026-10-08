import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Send /api requests to the backend, so the browser sees one origin and cookies just work.
    proxy: { "/api": "http://localhost:4000" },
  },
});
