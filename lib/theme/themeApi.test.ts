import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import FishtVue from "fishtvue/config"
import { cssComponents } from "fishtvue/component"
import { $dt, palette, updatePreset, updatePrimaryPalette, updateSurfacePalette, usePreset } from "fishtvue/theme"

/**
 * Wave 3.3 (theme.md Issue 1) — runtime theme API.
 *
 * Механика: install (и каждый runtime-вызов API) собирает из live `config.theme` один
 * `:root`-блок токенов и инжектит его тегом `style[data-fishtvue-style-id="FishtVueTokens"]`
 * (дедуп useStyle заменяет контент). Сгенерированный компонентный CSS ссылается на эти
 * переменные (`rgb(var(--fv-…, fallback))`, см. unoStyle/colorVars.test.ts) — поэтому
 * перезапись ОДНОГО тега перекрашивает все смонтированные компоненты без regen и без
 * invalidation дедуп-реестров (roadmap-пункт «style invalidation mechanism» закрыт by design).
 *
 * Изоляция (isolate:false): window.FishtVue — глобальный singleton, tokens-тег живёт в
 * document.head между файлами → чистим оба в beforeEach/afterEach; cssComponents-запись
 * "FishtVueTokens" тоже (зеркало дисциплины darkModeSelector.test.ts).
 */
const TOKENS_TAG = "FishtVueTokens"
const tokensEl = () => document.querySelector(`style[data-fishtvue-style-id="${TOKENS_TAG}"]`)
const tokensCss = () => tokensEl()?.textContent ?? ""

const Probe = defineComponent({
  name: "ThemeApiProbe",
  setup: () => () => h("div", "probe")
})

const mountWithFishtVue = (config: Record<string, unknown> = {}) =>
  mount(Probe, {
    global: {
      plugins: [
        {
          install(app: any) {
            app.use(FishtVue, config)
          }
        }
      ]
    }
  })

const liveTheme = () => (window as any).FishtVue?.config?.theme

const cleanup = () => {
  delete (window as any).FishtVue
  cssComponents.delete(TOKENS_TAG as any)
  document.querySelectorAll(`style[data-fishtvue-style-id="${TOKENS_TAG}"]`).forEach((el) => el.remove())
}

describe("theme runtime API (Wave 3.3 — theme.md Issue 1)", () => {
  beforeEach(cleanup)
  afterEach(cleanup)

  describe("install → FishtVueTokens injection", () => {
    it("injects the tokens tag with palette triplets, theme slot and @layer fishtvue", () => {
      mountWithFishtVue()
      // SSR-путь: строка уходит в cssComponents (Nuxt-plugin инлайнит всю Map в head).
      const ssrCss = cssComponents.get(TOKENS_TAG as any) ?? ""
      expect(ssrCss).toContain("@layer fishtvue")
      expect(ssrCss).toMatch(/--fv-red-500:\s*239 68 68/)
      expect(ssrCss).toMatch(/--fv-theme-500:\s*hsla\(var\(--theme\) var\(--theme-contrast\) 46\.9% \/ 100\)/)
      // Client-путь: реальный тег в head (инжекция через useStyle с дедупом по style-id).
      expect(tokensEl()).not.toBeNull()
      expect(tokensCss()).toMatch(/--fv-red-500:\s*239 68 68/)
      expect(tokensCss()).toMatch(/--theme:\s*/)
    })
  })

  describe("usePreset — full preset replacement", () => {
    it("replaces config.theme and rewrites the tokens tag", () => {
      mountWithFishtVue()
      expect(tokensCss()).toMatch(/--fv-red-500:\s*239 68 68/)

      const result = usePreset({
        primitive: { red: { 500: "#ff0000" } },
        semantic: { customThemeColor: 90, customThemeColorContrast: "40%" }
      } as any)

      expect(result).toBeTruthy()
      expect(liveTheme()?.primitive?.red?.[500]).toBe("#ff0000")
      // Полная замена: заданный цвет — новым триплетом…
      expect(tokensCss()).toMatch(/--fv-red-500:\s*255 0 0/)
      expect(tokensCss()).toMatch(/--theme:\s*90/)
      // …а не заданные пресетом цвета в теге не эмитятся — их вернёт запечённый fallback в правилах.
      expect(tokensCss()).not.toMatch(/--fv-blue-500/)
    })

    it("is a no-op returning undefined when FishtVue is not installed", () => {
      expect(usePreset({ primitive: {}, semantic: {} } as any)).toBeUndefined()
      expect(tokensEl()).toBeNull()
    })
  })

  describe("updatePreset — deep merge over the current theme", () => {
    it("merges the partial and keeps untouched tokens intact", () => {
      mountWithFishtVue()

      const result = updatePreset({ semantic: { customThemeColor: 180 } } as any)

      expect(result).toBeTruthy()
      expect(liveTheme()?.semantic?.customThemeColor).toBe(180)
      expect(tokensCss()).toMatch(/--theme:\s*180/)
      // Merge, не replace: палитра осталась от текущей темы.
      expect(tokensCss()).toMatch(/--fv-red-500:\s*239 68 68/)
    })
  })

  describe("updatePrimaryPalette — brand (theme) slot override", () => {
    it("writes --fv-theme-* full-color overrides and semantic.primary", () => {
      mountWithFishtVue()

      updatePrimaryPalette({ 50: "#eef2ff", 500: "#6366f1", 950: "#1e1b4b" } as any)

      expect(tokensCss()).toMatch(/--fv-theme-500:\s*#6366f1/)
      expect(tokensCss()).toMatch(/--fv-theme-50:\s*#eef2ff/)
      expect(liveTheme()?.semantic?.primary?.[500]).toBe("#6366f1")
    })

    it("resolves '{indigo.500}'-style token refs through the current primitive palette", () => {
      mountWithFishtVue()

      updatePrimaryPalette({ 500: "{indigo.500}" } as any)

      expect(tokensCss()).toMatch(/--fv-theme-500:\s*#6366f1/)
    })

    it("expands a single HEX into a generated 11-step palette", () => {
      mountWithFishtVue()

      updatePrimaryPalette("#3b82f6")

      expect(tokensCss()).toMatch(/--fv-theme-500:\s*#3b82f6/)
      const primary = liveTheme()?.semantic?.primary ?? {}
      expect(Object.keys(primary)).toHaveLength(11)
    })
  })

  describe("updateSurfacePalette — semantic.surface slot", () => {
    it("emits --fv-surface-* variables and stores semantic.surface", () => {
      mountWithFishtVue()

      updateSurfacePalette({ 100: "#f4f4f5" } as any)

      expect(tokensCss()).toMatch(/--fv-surface-100:\s*#f4f4f5/)
      expect(liveTheme()?.semantic?.surface?.[100]).toBe("#f4f4f5")
    })

    it("scopes the dark subset to darkModeSelector when configured", () => {
      mountWithFishtVue({ optionsTheme: { darkModeSelector: ".dark" } })

      updateSurfacePalette({ light: { 100: "#ffffff" }, dark: { 100: "#000000" } } as any)

      const css = tokensCss()
      expect(css).toMatch(/--fv-surface-100:\s*#ffffff/)
      expect(css).toContain(".dark")
      expect(css).toMatch(/--fv-surface-100:\s*#000000/)
      expect(css).not.toContain("prefers-color-scheme")
    })

    it("falls back to the prefers-color-scheme media query for the dark subset", () => {
      mountWithFishtVue()

      updateSurfacePalette({ dark: { 100: "#000000" } } as any)

      const css = tokensCss()
      expect(css).toMatch(/@media \(prefers-color-scheme:\s*dark\)/)
      expect(css).toMatch(/--fv-surface-100:\s*#000000/)
    })
  })

  describe("$dt — token metadata lookup", () => {
    it("returns name/variable/value for a primitive color path", () => {
      mountWithFishtVue()

      expect($dt("primitive.emerald.500")).toEqual({
        name: "--fv-emerald-500",
        variable: "var(--fv-emerald-500)",
        value: "#10b981"
      })
    })

    it("maps semantic.customThemeColor to --theme", () => {
      mountWithFishtVue({ theme: { semantic: { customThemeColor: 220 } } })

      expect($dt("semantic.customThemeColor")).toEqual({
        name: "--theme",
        variable: "var(--theme)",
        value: 220
      })
    })

    it("returns the value without a variable for non-tokenized paths", () => {
      mountWithFishtVue()

      const dt = $dt("primitive.duration.300")
      expect(dt?.value).toBe("300ms")
      expect(dt?.name).toBeUndefined()
    })

    it("returns undefined for unknown paths and without an installed FishtVue", () => {
      mountWithFishtVue()
      expect($dt("primitive.nope.500")).toBeUndefined()

      cleanup()
      expect($dt("primitive.emerald.500")).toBeUndefined()
    })
  })

  describe("palette — public token-ref form", () => {
    it("returns the primitive palette for a '{name}' token ref", () => {
      const scale = palette("{blue}" as any)
      expect(scale?.[500]).toBe("#3b82f6")
      expect(Object.keys(scale ?? {})).toHaveLength(11)
    })

    it("keeps generating an 11-step scale from a HEX (regression)", () => {
      const scale = palette("#3498db")
      expect(Object.keys(scale)).toEqual(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"])
    })
  })
})
