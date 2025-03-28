import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Enables global test APIs like `describe` and `it`
    environment: "jsdom", // Simulates a browser-like environment
  },
});
