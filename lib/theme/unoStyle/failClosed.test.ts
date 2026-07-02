import { afterEach, describe, expect, it, vi } from "vitest"
import { tailwind } from "fishtvue/theme"

/**
 * uno-engine.md Issues 1, 3 (2026-07-02) — fail-closed контракт движка tailwind().
 *
 * Issue 1 — silent degradation, три режима тихого отказа:
 *   1. класс не распознан → undefined (раньше — без диагностики);
 *   2. правило с литералом `undefined`/пустым значением (`clear-both { undefined }`,
 *      `blur-xs { --fv-blur: blur(); }`, `min-h-dvh { min-height: ; }`) → теперь undefined;
 *   3. нераспознанный вариант → правило БЕЗ условия (`not-hover:opacity-75` применялся всегда) →
 *      теперь undefined.
 *   Во всех режимах — dev-only `console.warn` (гейт `process.env.NODE_ENV !== "production"`,
 *   прецедент Button.vue/Alert.vue) с дедупом по имени класса (module-scope Set — поэтому
 *   каждый warn-тест использует УНИКАЛЬНОЕ имя класса).
 *
 * Issue 3 — false positives: классы, матчившиеся чужими правилами, либо дропаются fail-closed
 * (mask-*, perspective-*, scale-3d), либо получают корректные значения (негативные transforms,
 * v4-шкалы rounded/blur, двухсловные позиции, viewport-юниты min-h/max-h, container scale basis/min-w).
 *
 * Пустой reset custom property (`blur-none` → `--fv-blur: ;`) — легитимен и НЕ дропается.
 */

const TRANSFORM = `transform: translate(var(--fv-translate-x), var(--fv-translate-y)) rotate(var(--fv-rotate)) skewX(var(--fv-skew-x)) skewY(var(--fv-skew-y)) scaleX(var(--fv-scale-x)) scaleY(var(--fv-scale-y));`
const FILTER = `filter: var(--fv-blur) var(--fv-brightness) var(--fv-contrast) var(--fv-grayscale) var(--fv-hue-rotate) var(--fv-invert) var(--fv-saturate) var(--fv-sepia) var(--fv-drop-shadow);`
const BACKDROP = `-webkit-backdrop-filter: var(--fv-backdrop-blur) var(--fv-backdrop-brightness) var(--fv-backdrop-contrast) var(--fv-backdrop-grayscale) var(--fv-backdrop-hue-rotate) var(--fv-backdrop-invert) var(--fv-backdrop-opacity) var(--fv-backdrop-saturate) var(--fv-backdrop-sepia);\n  backdrop-filter: var(--fv-backdrop-blur) var(--fv-backdrop-brightness) var(--fv-backdrop-contrast) var(--fv-backdrop-grayscale) var(--fv-backdrop-hue-rotate) var(--fv-backdrop-invert) var(--fv-backdrop-opacity) var(--fv-backdrop-saturate) var(--fv-backdrop-sepia);`

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe("Issue 1 — fail-closed + dev-диагностика", () => {
  describe("режим 1: нераспознанный класс", () => {
    it("возвращает undefined и предупреждает в dev", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind("totally-unknown-utility-a")).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain("totally-unknown-utility-a")
    })

    it("дедуплицирует warn по имени класса", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind("totally-unknown-utility-b")).toBeUndefined()
      expect(tailwind("totally-unknown-utility-b")).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it("в production не предупреждает (но по-прежнему возвращает undefined)", () => {
      vi.stubEnv("NODE_ENV", "production")
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind("totally-unknown-utility-c")).toBeUndefined()
      expect(warn).not.toHaveBeenCalled()
    })

    it("пустая строка и не-строка — undefined без warn", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind("")).toBeUndefined()
      expect(tailwind(42 as unknown as string)).toBeUndefined()
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe("режим 2: пустое значение / литерал undefined не попадает в CSS", () => {
    it.each(["transition-discrete", "shadow-xs", "content-none"])("%s → undefined + warn", (classValue) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind(classValue)).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it("JS-интерполяция undefined в arbitrary value (кейс из сандбокса: Select ms-[undefinedpx])", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      // НЕ ms-[undefinedpx]: его при mount реально генерирует Select-сюита (isolate:false →
      // общий дедуп-Set движка уже содержит класс, warn не повторится). Уникальная форма того же бага:
      expect(tailwind("me-[undefinedrem]")).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it("regression: валидный arbitrary margin не задет", () => {
      expect(tailwind("ms-[10px]")).toBe(".ms-\\[10px\\] {\n  margin-inline-start: 10px;\n}")
    })

    it("regression: blur-none — пустой reset custom property легитимен", () => {
      expect(tailwind("blur-none")).toBe(`.blur-none {\n  --fv-blur: ;\n  ${FILTER}\n}`)
    })
  })

  describe("режим 3: нераспознанный вариант — fail-closed (раньше: правило без условия)", () => {
    it.each([
      "not-hover:opacity-75",
      "group-aria-checked:underline",
      "@sm:flex",
      "@max-md:grid",
      "**:text-red-500",
      "[@media(hover:hover)]:underline",
      "in-focus:opacity-100",
      "nth-3:underline",
      "starting:opacity-0"
    ])("%s → undefined + warn", (classValue) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind(classValue)).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
    })
  })
})

describe("Issue 3 — false positives", () => {
  describe("чужие семейства больше не матчатся соседними правилами", () => {
    it.each(["mask-t-from-50%", "mask-b-to-90%", "mask-radial-from-75%", "perspective-origin-top", "scale-3d"])(
      "%s → undefined + warn",
      (classValue) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
        expect(tailwind(classValue)).toBeUndefined()
        expect(warn).toHaveBeenCalledTimes(1)
      }
    )
  })

  describe("негативные значения rotate/scale/hue-rotate/order", () => {
    it("-rotate-45", () => {
      expect(tailwind("-rotate-45")).toBe(`.-rotate-45 {\n  --fv-rotate: calc(45deg * -1);\n  ${TRANSFORM}\n}`)
    })
    it("-scale-100", () => {
      expect(tailwind("-scale-100")).toBe(
        `.-scale-100 {\n  --fv-scale-x: calc(1 * -1);\n  --fv-scale-y: calc(1 * -1);\n  ${TRANSFORM}\n}`
      )
    })
    it("-scale-x-100", () => {
      expect(tailwind("-scale-x-100")).toBe(`.-scale-x-100 {\n  --fv-scale-x: calc(1 * -1);\n  ${TRANSFORM}\n}`)
    })
    it("rtl:-scale-x-100 (Menu/Pagination RTL-зеркалирование иконок)", () => {
      expect(tailwind("rtl:-scale-x-100")).toBe(
        `.rtl\\:-scale-x-100:where([dir="rtl"], [dir="rtl"] *) {\n  --fv-scale-x: calc(1 * -1);\n  ${TRANSFORM}\n}`
      )
    })
    it("-hue-rotate-15", () => {
      expect(tailwind("-hue-rotate-15")).toBe(
        `.-hue-rotate-15 {\n  --fv-hue-rotate: hue-rotate(calc(15deg * -1));\n  ${FILTER}\n}`
      )
    })
    it("-order-1", () => {
      expect(tailwind("-order-1")).toBe(`.-order-1 {\n  order: calc(1 * -1);\n}`)
    })
  })

  describe("дозаполненные шкалы и значения", () => {
    it.each([
      { classValue: "rounded-xs", expected: ".rounded-xs {\n  border-radius: 0.125rem;\n}" },
      { classValue: "rounded-4xl", expected: ".rounded-4xl {\n  border-radius: 2rem;\n}" },
      { classValue: "object-top-left", expected: ".object-top-left {\n  object-position: top left;\n}" },
      { classValue: "bg-top-left", expected: ".bg-top-left {\n  background-position: top left;\n}" },
      { classValue: "items-baseline-last", expected: ".items-baseline-last {\n  align-items: last baseline;\n}" },
      { classValue: "basis-3xs", expected: ".basis-3xs {\n  flex-basis: 16rem;\n}" },
      { classValue: "min-w-sm", expected: ".min-w-sm {\n  min-width: 24rem;\n}" },
      { classValue: "min-h-dvh", expected: ".min-h-dvh {\n  min-height: 100dvh;\n}" },
      { classValue: "min-h-screen", expected: ".min-h-screen {\n  min-height: 100vh;\n}" },
      { classValue: "max-h-dvh", expected: ".max-h-dvh {\n  max-height: 100dvh;\n}" },
      { classValue: "clear-both", expected: ".clear-both {\n  clear: both;\n}" }
    ])("$classValue", ({ classValue, expected }) => {
      expect(tailwind(classValue)).toBe(expected)
    })

    it("blur-xs / blur-2xs / backdrop-blur-xs (v4-значения)", () => {
      expect(tailwind("blur-xs")).toBe(`.blur-xs {\n  --fv-blur: blur(4px);\n  ${FILTER}\n}`)
      expect(tailwind("blur-2xs")).toBe(`.blur-2xs {\n  --fv-blur: blur(2px);\n  ${FILTER}\n}`)
      expect(tailwind("backdrop-blur-xs")).toBe(
        `.backdrop-blur-xs {\n  --fv-backdrop-blur: blur(4px);\n  ${BACKDROP}\n}`
      )
    })
  })
})

describe("Regression — валидные классы байт-в-байт (baseline снят с движка до фикса)", () => {
  it.each([
    { classValue: "hover:opacity-75", expected: ".hover\\:opacity-75:hover {\n  opacity: 0.75;\n}" },
    {
      classValue: "dark:md:hover:underline",
      expected:
        "@media (prefers-color-scheme: dark) {\n@media (min-width: 768px) {\n.dark\\:md\\:hover\\:underline:hover {\n  text-decoration-line: underline;\n}\n}\n}"
    },
    {
      classValue: "group-hover/edit:opacity-50",
      expected: ".group\\/edit:hover .group-hover\\/edit\\:opacity-50 {\n  opacity: 0.5;\n}"
    },
    {
      classValue: "group-[.is-published]:block",
      expected: ".group.is-published .group-\\[\\.is-published\\]\\:block {\n  display: block;\n}"
    },
    {
      classValue: "peer-[.is-dirty]:underline",
      expected: ".peer.is-dirty ~ .peer-\\[\\.is-dirty\\]\\:underline {\n  text-decoration-line: underline;\n}"
    },
    { classValue: "peer-checked:block", expected: ".peer:checked ~ .peer-checked\\:block {\n  display: block;\n}" },
    {
      classValue: "group-has-[a]:underline",
      expected: ".group:has(a) .group-has-\\[a\\]\\:underline {\n  text-decoration-line: underline;\n}"
    },
    {
      classValue: "has-[a]:underline",
      expected: ".has-\\[a\\]\\:underline:has(a) {\n  text-decoration-line: underline;\n}"
    },
    {
      classValue: "aria-[sort=ascending]:underline",
      expected:
        '.aria-\\[sort\\=ascending\\]\\:underline[aria-sort="ascending"] {\n  text-decoration-line: underline;\n}'
    },
    {
      classValue: "data-[state=open]:underline",
      expected: '.data-\\[state\\=open\\]\\:underline[data-state="open"] {\n  text-decoration-line: underline;\n}'
    },
    {
      classValue: "supports-[display:grid]:grid",
      expected: "@supports (display:grid) {\n.supports-\\[display\\:grid\\]\\:grid {\n  display: grid;\n}\n}"
    },
    {
      classValue: "min-[600px]:flex",
      expected: "@media (min-width: 600px) {\n.min-\\[600px\\]\\:flex {\n  display: flex;\n}\n}"
    },
    {
      classValue: "[&>[data-active]+span]:text-blue-600",
      expected:
        ".\\[\\&\\>\\[data-active\\]\\+span\\]\\:text-blue-600>[data-active]+span {\n  color: rgb(var(--fv-blue-600, 37 99 235));\n}"
    },
    { classValue: "*:pt-4", expected: ".\\*\\:pt-4 > * {\n  padding-top: 1rem;\n}" },
    {
      classValue: "rtl:me-2",
      expected: '.rtl\\:me-2:where([dir="rtl"], [dir="rtl"] *) {\n  margin-inline-end: 0.5rem;\n}'
    },
    {
      classValue: "before:absolute",
      expected: ".before\\:absolute::before {\n  content: var(--fv-content);\n  position: absolute;\n}"
    },
    {
      classValue: "placeholder:text-gray-400",
      expected: ".placeholder\\:text-gray-400::placeholder {\n  color: rgb(var(--fv-gray-400, 156 163 175));\n}"
    },
    {
      classValue: "first-letter:uppercase",
      expected: ".first-letter\\:uppercase::first-letter {\n  text-transform: uppercase;\n}"
    },
    {
      classValue: "odd:bg-gray-50",
      expected: ".odd\\:bg-gray-50:nth-child(odd) {\n  background-color: rgb(var(--fv-gray-50, 249 250 251));\n}"
    },
    {
      classValue: "max-md:flex",
      expected: "@media not all and (min-width: 768px) {\n.max-md\\:flex {\n  display: flex;\n}\n}"
    },
    { classValue: "print:hidden", expected: "@media print {\n.print\\:hidden {\n  display: none;\n}\n}" },
    { classValue: "rotate-45", expected: `.rotate-45 {\n  --fv-rotate: 45deg;\n  ${TRANSFORM}\n}` },
    {
      classValue: "scale-100",
      expected: `.scale-100 {\n  --fv-scale-x: 1;\n  --fv-scale-y: 1;\n  ${TRANSFORM}\n}`
    },
    { classValue: "scale-x-100", expected: `.scale-x-100 {\n  --fv-scale-x: 1;\n  ${TRANSFORM}\n}` },
    {
      classValue: "hue-rotate-15",
      expected: `.hue-rotate-15 {\n  --fv-hue-rotate: hue-rotate(15deg);\n  ${FILTER}\n}`
    },
    { classValue: "order-1", expected: ".order-1 {\n  order: 1;\n}" },
    { classValue: "order-first", expected: ".order-first {\n  order: -9999;\n}" },
    { classValue: "rounded", expected: ".rounded {\n  border-radius: 0.25rem;\n}" },
    { classValue: "rounded-sm", expected: ".rounded-sm {\n  border-radius: 0.125rem;\n}" },
    { classValue: "rounded-lg", expected: ".rounded-lg {\n  border-radius: 0.5rem;\n}" },
    { classValue: "rounded-full", expected: ".rounded-full {\n  border-radius: 9999px;\n}" },
    { classValue: "blur", expected: `.blur {\n  --fv-blur: blur(8px);\n  ${FILTER}\n}` },
    { classValue: "blur-sm", expected: `.blur-sm {\n  --fv-blur: blur(4px);\n  ${FILTER}\n}` },
    {
      classValue: "backdrop-blur-sm",
      expected: `.backdrop-blur-sm {\n  --fv-backdrop-blur: blur(4px);\n  ${BACKDROP}\n}`
    },
    { classValue: "bg-left-top", expected: ".bg-left-top {\n  background-position: left top;\n}" },
    { classValue: "bg-top", expected: ".bg-top {\n  background-position: top;\n}" },
    { classValue: "object-left-top", expected: ".object-left-top {\n  object-position: left top;\n}" },
    { classValue: "items-baseline", expected: ".items-baseline {\n  align-items: baseline;\n}" },
    { classValue: "clear-start", expected: ".clear-start {\n  clear: inline-start;\n}" },
    { classValue: "clear-left", expected: ".clear-left {\n  clear: left;\n}" },
    { classValue: "basis-1/2", expected: ".basis-1\\/2 {\n  flex-basis: calc(1 / 2 * 100%);\n}" },
    { classValue: "min-w-full", expected: ".min-w-full {\n  min-width: 100%;\n}" },
    { classValue: "min-h-4", expected: ".min-h-4 {\n  min-height: 1rem;\n}" },
    { classValue: "max-h-64", expected: ".max-h-64 {\n  max-height: 16rem;\n}" },
    { classValue: "w-3xs", expected: ".w-3xs {\n  width: 16rem;\n}" },
    { classValue: "-m-4", expected: ".-m-4 {\n  margin: calc(1rem * -1);\n}" },
    {
      classValue: "-translate-y-1/2",
      expected:
        ".-translate-y-1\\/2 {\n  --fv-translate-y: calc(calc(1 / 2 * 100%) * -1);\n  translate: var(--fv-translate-x) var(--fv-translate-y);\n}"
    },
    { classValue: "-top-4", expected: ".-top-4 {\n  top: calc(1rem * -1);\n}" },
    { classValue: "-z-10", expected: ".-z-10 {\n  z-index: calc(10 * -1);\n}" }
  ])("$classValue", ({ classValue, expected }) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("darkSelector-режим не изменился", () => {
    expect(tailwind("dark:bg-gray-900", { selector: ".x", darkSelector: ".dark" })).toBe(
      ".dark {\n.x.dark\\:bg-gray-900 {\n  background-color: rgb(var(--fv-gray-900, 17 24 39));\n}\n}"
    )
  })
})
