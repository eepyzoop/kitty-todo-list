import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const manifest = defineManifest({
  manifest_version: 3,
  name: "TaskKitty",
  version: "0.1.0",
  description: "Add and check off tasks without leaving your tab.",
  action: {
    default_popup: "src/popup/index.html",
  },
  permissions: ["storage"],
});

export default defineConfig({
  plugins: [react(), crx({ manifest })],
});
