/// <reference types="vitest" />
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

/**
 * @vitest-config https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "./.tests/setup/jsdomEnvironment.ts",
    silent: true,
    include: ["lib/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.claude/worktrees/**"],
    maxWorkers: 1,
    minWorkers: 1,
    isolate: false,
    coverage: {
      provider: "v8",
      enabled: true,
      reportsDirectory: "./coverage",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts", "lib/**/*.vue"],
      exclude: [
        "node_modules",
        "dist",
        "**/*.d.ts",
        "**/*.test.ts",
        // Хелперы для тестов движка: исполняются только из .test.ts, но сами тестами не покрыты —
        // без исключения занижали агрегат (test-helpers-advanced.ts давал 0%).
        "lib/theme/unoStyle/test-helpers*.ts",
        "lib/loading/epic/*",
        "lib/loading/svg/*"
      ]
    },
    setupFiles: ["./.tests/setup/setupTests.ts"],
    ui: false,
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      fishtvue: new URL("./lib", import.meta.url).pathname
    }
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      fishtvue: new URL("./lib", import.meta.url).pathname
    }
  }
} as any)
