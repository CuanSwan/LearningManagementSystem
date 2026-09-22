import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Binds on all network interfaces, not just localhost, so the dev
    // server is reachable from other machines on the LAN without needing
    // to remember to pass --host every time (which npm's argument
    // forwarding through the root workspace scripts doesn't do reliably).
    host: true,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
