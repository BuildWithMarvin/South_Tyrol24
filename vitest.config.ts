import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname) } },
  test: {
    environment: "jsdom",
    include: ["tests/components/**/*.test.tsx"],
    setupFiles: ["tests/components/setup.ts"],
    restoreMocks: true,
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
