import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme"

/**
 * Wave 3.3 (theme.md Issue 1) — CSS-variable indirection для палитры.
 *
 * Контракт эмиссии цвета:
 * - Именованные цвета палитры (red/emerald/gray/…): `rgb(var(--fv-{name}-{tone}, R G B) / α)`.
 *   Fallback-триплет обязателен — компонент, смонтированный без `app.use(FishtVue)`
 *   (нет tokens-тега в `:root`), рендерится байт-в-байт как раньше.
 * - Слот `theme` (значение — hsla-формула на var(--theme)): переменная несёт ПОЛНЫЙ цвет —
 *   `var(--fv-theme-{tone}, hsla(var(--theme) var(--theme-contrast) L% / 100))`;
 *   alpha-вариант — `color-mix(in srgb, <var> α%, transparent)`. Это чинит и прежний silent-баг:
 *   `addAlphaToHex` для hsl-строк игнорировал alpha (ранний return `<alpha-value>`→100), поэтому
 *   `ring-theme-600/20` (Select chips) и `ring-theme-500/10` (Badge) рендерились непрозрачными.
 * - specialColor (white/black/transparent/…) и arbitrary-хексы (`text-[#50d71e]`) — БЕЗ изменений:
 *   это не палитровые токены, runtime-теминг их не касается.
 *
 * Runtime-подмена значения переменной (`--fv-red-500: 255 0 0` в tokens-теге) перекрашивает все
 * уже сгенерированные правила без regen — сам движок остаётся process-wide singleton без чтения
 * live config (SSR multi-tenant safe).
 */
describe("Color emission via CSS variables (Wave 3.3 — theme.md Issue 1)", () => {
  describe("named palette colors → rgb(var(--fv-*, R G B))", () => {
    it.each([
      {
        classValue: "text-red-400",
        expected: ".text-red-400 {\n  color: rgb(var(--fv-red-400, 248 113 113));\n}"
      },
      {
        classValue: "text-red-400/50",
        expected: ".text-red-400\\/50 {\n  color: rgb(var(--fv-red-400, 248 113 113) / 0.5);\n}"
      },
      {
        classValue: "bg-emerald-500",
        expected: ".bg-emerald-500 {\n  background-color: rgb(var(--fv-emerald-500, 16 185 129));\n}"
      },
      {
        classValue: "bg-emerald-500/[0.37]",
        expected:
          ".bg-emerald-500\\/\\[0\\.37\\] {\n  background-color: rgb(var(--fv-emerald-500, 16 185 129) / 0.37);\n}"
      },
      {
        classValue: "border-gray-900/5",
        expected: ".border-gray-900\\/5 {\n  border-color: rgb(var(--fv-gray-900, 17 24 39) / 0.05);\n}"
      },
      {
        classValue: "ring-indigo-500",
        expected: ".ring-indigo-500 {\n  --fv-ring-color: rgb(var(--fv-indigo-500, 99 102 241));\n}"
      },
      {
        classValue: "shadow-indigo-500/50",
        expected: ".shadow-indigo-500\\/50 {\n  --fv-shadow-color: rgb(var(--fv-indigo-500, 99 102 241) / 0.5);\n}"
      },
      // alpha 100 ≡ непрозрачный — слэш-суффикс не эмитится (зеркало прежнего `addAlphaToHex(x, 100) → x`)
      {
        classValue: "bg-red-500/100",
        expected: ".bg-red-500\\/100 {\n  background-color: rgb(var(--fv-red-500, 239 68 68));\n}"
      }
    ])("$classValue", ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("gradient stops", () => {
    it.each([
      {
        classValue: "from-red-400/50",
        expected:
          ".from-red-400\\/50 {\n  --fv-gradient-from: rgb(var(--fv-red-400, 248 113 113) / 0.5) var(--fv-gradient-from-position);\n  --fv-gradient-to: rgb(var(--fv-red-400, 248 113 113) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
      },
      {
        classValue: "to-blue-500",
        expected:
          ".to-blue-500 {\n  --fv-gradient-to: rgb(var(--fv-blue-500, 59 130 246)) var(--fv-gradient-to-position);\n}"
      },
      {
        classValue: "via-blue-500",
        expected:
          ".via-blue-500 {\n  --fv-gradient-to: rgb(var(--fv-blue-500, 59 130 246) / 0) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), rgb(var(--fv-blue-500, 59 130 246)) var(--fv-gradient-via-position), var(--fv-gradient-to);\n}"
      }
    ])("$classValue", ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("theme slot → var(--fv-theme-*) / color-mix for alpha", () => {
    it.each([
      {
        classValue: "text-theme-500",
        expected:
          ".text-theme-500 {\n  color: var(--fv-theme-500, hsla(var(--theme) var(--theme-contrast) 46.9% / 100));\n}"
      },
      // Поведенческий фикс: alpha для theme-слота теперь применяется (раньше — silent no-op).
      {
        classValue: "ring-theme-600/20",
        expected:
          ".ring-theme-600\\/20 {\n  --fv-ring-color: color-mix(in srgb, var(--fv-theme-600, hsla(var(--theme) var(--theme-contrast) 39.5% / 100)) 20%, transparent);\n}"
      },
      // Градиентный transparent-хвост для theme раньше был битым (`hsla(...)00`) — теперь color-mix 0%.
      {
        classValue: "from-theme-500",
        expected:
          ".from-theme-500 {\n  --fv-gradient-from: var(--fv-theme-500, hsla(var(--theme) var(--theme-contrast) 46.9% / 100)) var(--fv-gradient-from-position);\n  --fv-gradient-to: color-mix(in srgb, var(--fv-theme-500, hsla(var(--theme) var(--theme-contrast) 46.9% / 100)) 0%, transparent) var(--fv-gradient-to-position);\n  --fv-gradient-stops: var(--fv-gradient-from), var(--fv-gradient-to);\n}"
      }
    ])("$classValue", ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("guards — non-token colors keep raw emission", () => {
    it.each([
      { classValue: "text-white/50", expected: ".text-white\\/50 {\n  color: #ffffff80;\n}" },
      { classValue: "bg-black", expected: ".bg-black {\n  background-color: #000000;\n}" },
      { classValue: "text-[#50d71e]", expected: ".text-\\[\\#50d71e\\] {\n  color: #50d71e;\n}" },
      { classValue: "text-[#50d71e]/25", expected: ".text-\\[\\#50d71e\\]\\/25 {\n  color: #50d71e40;\n}" }
    ])("$classValue", ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })
})
