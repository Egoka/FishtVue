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
      ],
      // Гейт по фактическому уровню на момент закрытия сводки (решение R31). Смысл не в том,
      // чтобы гнаться за цифрой, а в том, чтобы покрытие не сползало незаметно: без порога
      // единственным сигналом был бы глазами прочитанный отчёт.
      //
      // Пороги стоят на 1–2 пункта ниже факта (91.12 / 80.26 / 94.29 / 95.27) — v8 даёт небольшой
      // разброс между прогонами, и гейт не должен падать на шуме. Риск ложных срабатываний
      // обсуждался и принят; если CI начнёт мигать, порог опускается, а не отключается.
      thresholds: {
        statements: 91,
        branches: 80,
        functions: 93,
        lines: 94
      }
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
