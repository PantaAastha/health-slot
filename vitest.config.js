import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true, // Enables global test APIs like `describe` and `it`
    environment: "jsdom", // Simulates a browser-like environment
  },
});
