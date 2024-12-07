import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

/**
 * @vitest-config https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    silent: true,
    include: ["lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      enabled: true,
      reportsDirectory: "./coverage",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts", "lib/**/*.vue"],
      exclude: ["node_modules", "dist", "**/*.d.ts", "**/*.test.ts"]
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
})
