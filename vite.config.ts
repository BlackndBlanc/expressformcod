import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";

installGlobals();

export default defineConfig({
  plugins: [remix()],
  server: {
    port: Number(process.env.PORT || 3000)
  }
});
