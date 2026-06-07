import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
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
})
