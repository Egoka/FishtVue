import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Контракт публикуемого манифеста (Issues 5b / 13 / 14, категории A2 / K51 / K52).
 *
 * `lib/package.json` — канонический источник: `@semantic-release/exec` бампает именно его
 * (`cd lib && npm version`), а `addPackageJson()` в rollup.config.js копирует его в
 * `dist/package.json` (удаляя только поле `type`). Публикация идёт из `pkgRoot: "dist"`
 * (release.config.cjs). Значит, проверяемые ниже поля попадают ровно в npm-tarball.
 *
 * JSON читаем через fs (а не `import ... from "./package.json"`), чтобы тест не зависел
 * от `resolveJsonModule` в tsconfig и не ломал `vue-tsc --noEmit`. Vitest запускается из
 * корня репозитория, поэтому путь резолвим относительно `process.cwd()`.
 */
const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "lib/package.json"), "utf-8")) as {
  main?: string
  types?: string
  sideEffects?: unknown
  files?: string[]
  engines?: { node?: string }
  dependencies?: Record<string, string>
}

describe("lib/package.json publish contract", () => {
  it("marks the package side-effect-free for tree-shaking (Issue 5 — A2)", () => {
    // CSS инжектится в рантайме через lifecycle (onServerPrefetch/onMounted), а не на
    // import-time — поэтому модули чисты и `false` безопасен для tree-shaker'а.
    expect(pkg.sideEffects).toBe(false)
  })

  it("whitelists distributable files and ships sourcemaps (Issue 13/14 — K51/K52)", () => {
    expect(Array.isArray(pkg.files)).toBe(true)
    const files = pkg.files as string[]
    // .map обязателен — без него sourcemaps (sourcemap:true в rollup) не публикуются (Issue 13).
    expect(files).toContain("**/*.map")
    expect(files).toContain("**/*.mjs")
    expect(files).toContain("**/*.d.ts")
    expect(files).toContain("**/package.json")
    // whitelist не должен тащить исходники/тесты в tarball (Issue 14).
    expect(files.some((f) => f.includes(".test."))).toBe(false)
    expect(files).not.toContain("**/*.ts")
    expect(files).not.toContain("**/*.vue")
  })

  it("declares an ESM-only Node floor (Issue 5 — A4, package is type:module / .mjs)", () => {
    expect(pkg.engines?.node).toBeDefined()
    expect(typeof pkg.engines?.node).toBe("string")
  })

  it("keeps ESM entry points intact", () => {
    expect(pkg.main).toBe("./index.mjs")
    expect(pkg.types).toBe("./index.d.ts")
  })

  it("does not declare @floating-ui/vue or @vueuse/core (FixWindow is dependency-free)", () => {
    // Раньше FixWindow тянул @floating-ui/vue + @vueuse/core bare-import'ом → они были
    // обязаны быть в dependencies. Миграция на собственный движок (lib/fixwindow/useFloating.ts
    // + useClickOutside.ts) убрала обе зависимости из рантайма — пакет больше не требует их
    // при чистой установке. Регрессия-guard: они не должны вернуться в dependencies.
    const deps = pkg.dependencies ?? {}
    expect(deps["@floating-ui/vue"]).toBeUndefined()
    expect(deps["@vueuse/core"]).toBeUndefined()
  })
})

/**
 * Контракт корневой `exports`-карты (Issue 5c-b / A4-5). Карта генерируется build-step'ом
 * (`buildRootExports()` в rollup.config.js) из выходов rollup, поэтому проверяем по
 * `dist/package.json` — но ТОЛЬКО если сборка присутствует (иначе skip, чтобы `pnpm test`
 * без `lib:build` не падал). Полная проверка резолва — отдельным `npm pack` + import-смоком.
 */
const distPkgPath = resolve(process.cwd(), "dist/package.json")
const hasDist = existsSync(distPkgPath)
describe.skipIf(!hasDist)("dist/package.json root exports map (Issue 5c-b)", () => {
  const dist = hasDist
    ? (JSON.parse(readFileSync(distPkgPath, "utf-8")) as { exports?: Record<string, any> })
    : { exports: undefined }
  const exp = dist.exports ?? {}

  it("exposes root + package.json conditions", () => {
    expect(exp["."]).toMatchObject({ types: "./index.d.ts", import: "./index.mjs" })
    expect(exp["./package.json"]).toBe("./package.json")
  })

  it("maps component bare subpaths to lowercase .mjs + PascalCase .d.ts", () => {
    // ключевой обход обструкции: `./table` → import lowercase, types PascalCase.
    expect(exp["./table"]).toMatchObject({ types: "./table/Table.d.ts", import: "./table/table.mjs" })
    expect(exp["./menu"]).toMatchObject({ types: "./menu/Menu.d.ts", import: "./menu/menu.mjs" })
    expect(exp["./config"]).toMatchObject({ import: "./config/config.mjs" })
  })

  it("keeps explicit deep .mjs (self-referential) + extensionless util subpaths resolvable", () => {
    expect(exp["./table/table.mjs"]).toMatchObject({ import: "./table/table.mjs" })
    expect(exp["./menu/menu.mjs"]).toMatchObject({ import: "./menu/menu.mjs" })
    expect(exp["./utils/domHandler"]).toMatchObject({ import: "./utils/domHandler.mjs" })
    expect(exp["./*/package.json"]).toBe("./*/package.json")
  })

  // A4-5 (loading.md Issue 5). Loading — ЕДИНСТВЕННЫЙ компонент, чей runtime делает глубокий
  // динамический `import("./epic/*.mjs")` / `import("./svg/*.mjs")` (126 lazy-вариаций, см.
  // addLoadingVariants() + .vue→.mjs rewrite в rollup.config.js). В pure Node ESM эти чанки
  // резолвятся ТОЛЬКО через identity-entry в exports-карте — generic-спот-чеки выше (table/menu/
  // config/utils) этого deep-chunk-кейса не покрывают. Guard ломается, если buildRootExports()
  // перестанет эмитить per-`.mjs` identity-entry (тогда Loading молча сломается у потребителя).
  it("covers fishtvue/loading bare subpath + its lazy epic/svg chunks (A4-5)", () => {
    expect(exp["./loading"]).toMatchObject({ types: "./loading/Loading.d.ts", import: "./loading/loading.mjs" })

    for (const variant of ["epic", "svg"] as const) {
      const keys = Object.keys(exp)
      const identity = keys.filter((k) => new RegExp(`^\\./loading/${variant}/[^/]+\\.mjs$`).test(k))
      expect(identity.length, `expected ≥1 lazy ${variant} chunk identity entry`).toBeGreaterThan(0)
      // каждый identity-чанк имеет парный extensionless субпуть (`fishtvue/loading/epic/Foo`)
      for (const id of identity) {
        const noExt = id.slice(0, -4)
        expect(exp[noExt], `missing extensionless entry for ${id}`).toBeDefined()
        expect(exp[id]).toMatchObject({ import: id })
      }
    }
  })
})
