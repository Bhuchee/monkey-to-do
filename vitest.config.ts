import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    // Each test file boots its own PGlite (WASM) instance in beforeAll.
    // Running files in parallel makes several of these boots compete for
    // CPU at once, which was pushing the slowest past hookTimeout. Files
    // are few and fast once running, so sequential execution costs little
    // and removes the flakiness.
    fileParallelism: false,
  },
});
