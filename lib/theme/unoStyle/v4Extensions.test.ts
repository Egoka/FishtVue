import { afterEach, describe, expect, it, vi } from "vitest"
import { tailwind } from "./tailwind"

// Волна 2 uno-движка (uno-engine.md Issues 2, 4, 5, 6):
// - Issue 4 P1: arbitrary properties [prop:value]/[--var:value], space-x/y-*, font smoothing;
// - Issue 2: дешёвые словарные дополнения вариантов (v4 pseudo/media/data-boolean/has-named);
// - Issue 5: дозаполнение v4-имён (shadow-xs/2xs, drop-shadow-xs, outline-hidden) без миграции шкал;
// - Issue 6: modern transform properties (rotate:/scale:; skew — единственный житель transform:).
//
// ⚠️ Warn-дедуп движка (module-scope Set) шарится между файлами при isolate:false —
// в warn-тестах используются классы, которые не встречаются ни в компонентных словарях, ни в других сюитах.

const TRANSLATE = "translate: var(--fv-translate-x) var(--fv-translate-y);"
const SCALE = "scale: var(--fv-scale-x) var(--fv-scale-y);"
const SKEW = "transform: skewX(var(--fv-skew-x)) skewY(var(--fv-skew-y));"
const FILTER =
  "filter: var(--fv-blur) var(--fv-brightness) var(--fv-contrast) var(--fv-grayscale) var(--fv-hue-rotate) var(--fv-invert) var(--fv-saturate) var(--fv-sepia) var(--fv-drop-shadow);"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Issue 4.1 — arbitrary properties [prop:value]", () => {
  it.each([
    ["[appearance:textfield]", ".\\[appearance\\:textfield\\] {\n  appearance: textfield;\n}"],
    ["[--my-var:10px]", ".\\[--my-var\\:10px\\] {\n  --my-var: 10px;\n}"],
    ["[font-family:Fira_Sans]", ".\\[font-family\\:Fira_Sans\\] {\n  font-family: Fira Sans;\n}"],
    ["[mask-type:luminance]", ".\\[mask-type\\:luminance\\] {\n  mask-type: luminance;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("работает с вариантами: hover:[appearance:none]", () => {
    expect(tailwind("hover:[appearance:none]")).toBe(".hover\\:\\[appearance\\:none\\]:hover {\n  appearance: none;\n}")
  })

  it("работает с media-вариантами: md:[appearance:none]", () => {
    expect(tailwind("md:[appearance:none]")).toBe(
      "@media (min-width: 768px) {\n.md\\:\\[appearance\\:none\\] {\n  appearance: none;\n}\n}"
    )
  })

  it("инъекция в value ({};) — drop + dev-warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(tailwind("[color:red;}]")).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain("[color:red;}]")
  })

  it("литерал undefined в value — drop (invalidValueReg)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(tailwind("[appearance:undefined]")).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it("пустое value не матчится — drop", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(tailwind("[appearance:]")).toBeUndefined()
  })
})

describe("Issue 4.2 — space-x/y-*", () => {
  it.each([
    [
      "space-x-4",
      ".space-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-x-reverse: 0;\n  margin-right: calc(1rem * var(--fv-space-x-reverse));\n  margin-left: calc(1rem * calc(1 - var(--fv-space-x-reverse)));\n}"
    ],
    [
      "space-y-1.5",
      ".space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-y-reverse: 0;\n  margin-top: calc(0.375rem * calc(1 - var(--fv-space-y-reverse)));\n  margin-bottom: calc(0.375rem * var(--fv-space-y-reverse));\n}"
    ],
    [
      "-space-x-4",
      ".-space-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-x-reverse: 0;\n  margin-right: calc(calc(1rem * -1) * var(--fv-space-x-reverse));\n  margin-left: calc(calc(1rem * -1) * calc(1 - var(--fv-space-x-reverse)));\n}"
    ],
    [
      "space-x-px",
      ".space-x-px > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-x-reverse: 0;\n  margin-right: calc(1px * var(--fv-space-x-reverse));\n  margin-left: calc(1px * calc(1 - var(--fv-space-x-reverse)));\n}"
    ],
    [
      "space-x-[3px]",
      ".space-x-\\[3px\\] > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-x-reverse: 0;\n  margin-right: calc(3px * var(--fv-space-x-reverse));\n  margin-left: calc(3px * calc(1 - var(--fv-space-x-reverse)));\n}"
    ],
    ["space-x-reverse", ".space-x-reverse > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-x-reverse: 1;\n}"],
    ["space-y-reverse", ".space-y-reverse > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-y-reverse: 1;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("вариант + space-*: sm:space-y-2", () => {
    expect(tailwind("sm:space-y-2")).toBe(
      "@media (min-width: 640px) {\n.sm\\:space-y-2 > :not([hidden]) ~ :not([hidden]) {\n  --fv-space-y-reverse: 0;\n  margin-top: calc(0.5rem * calc(1 - var(--fv-space-y-reverse)));\n  margin-bottom: calc(0.5rem * var(--fv-space-y-reverse));\n}\n}"
    )
  })

  it("regression: whitespace-nowrap не задет правилом space", () => {
    expect(tailwind("whitespace-nowrap")).toBe(".whitespace-nowrap {\n  white-space: nowrap;\n}")
  })

  it("regression: divide-x-4 байт-в-байт", () => {
    expect(tailwind("divide-x-4")).toBe(
      ".divide-x-4 > :not([hidden]) ~ :not([hidden]) {\n  --fv-divide-x-reverse: 0;\n  border-right-width: calc(4px* var(--fv-divide-x-reverse));\n  border-left-width: calc(4px* calc(1 - var(--fv-divide-x-reverse)));\n}"
    )
  })
})

describe("Issue 4.3 — font smoothing", () => {
  it("antialiased", () => {
    expect(tailwind("antialiased")).toBe(
      ".antialiased {\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}"
    )
  })
  it("subpixel-antialiased", () => {
    expect(tailwind("subpixel-antialiased")).toBe(
      ".subpixel-antialiased {\n  -webkit-font-smoothing: auto;\n  -moz-osx-font-smoothing: auto;\n}"
    )
  })
})

describe("Issue 2 — новые варианты (v4)", () => {
  it.each([
    ["optional:underline", ".optional\\:underline:optional {\n  text-decoration-line: underline;\n}"],
    ["user-valid:underline", ".user-valid\\:underline:user-valid {\n  text-decoration-line: underline;\n}"],
    ["user-invalid:underline", ".user-invalid\\:underline:user-invalid {\n  text-decoration-line: underline;\n}"],
    ["inert:opacity-50", ".inert\\:opacity-50[inert] {\n  opacity: 0.5;\n}"],
    ["details-content:block", ".details-content\\:block::details-content {\n  display: block;\n}"],
    ["pointer-fine:block", "@media (pointer: fine) {\n.pointer-fine\\:block {\n  display: block;\n}\n}"],
    ["pointer-coarse:block", "@media (pointer: coarse) {\n.pointer-coarse\\:block {\n  display: block;\n}\n}"],
    ["pointer-none:block", "@media (pointer: none) {\n.pointer-none\\:block {\n  display: block;\n}\n}"],
    ["any-pointer-fine:block", "@media (any-pointer: fine) {\n.any-pointer-fine\\:block {\n  display: block;\n}\n}"],
    [
      "any-pointer-coarse:block",
      "@media (any-pointer: coarse) {\n.any-pointer-coarse\\:block {\n  display: block;\n}\n}"
    ],
    [
      "inverted-colors:underline",
      "@media (inverted-colors: inverted) {\n.inverted-colors\\:underline {\n  text-decoration-line: underline;\n}\n}"
    ],
    ["noscript:block", "@media (scripting: none) {\n.noscript\\:block {\n  display: block;\n}\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  describe("boolean data-<name>:", () => {
    it.each([
      ["data-active:underline", ".data-active\\:underline[data-active] {\n  text-decoration-line: underline;\n}"],
      ["data-foo-bar:underline", ".data-foo-bar\\:underline[data-foo-bar] {\n  text-decoration-line: underline;\n}"]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })

    it("regression: bracket-форма data-[state=open]: не задета", () => {
      expect(tailwind("data-[state=open]:underline")).toBe(
        '.data-\\[state\\=open\\]\\:underline[data-state="open"] {\n  text-decoration-line: underline;\n}'
      )
    })
  })

  describe("именованные has-<state>:", () => {
    it.each([
      ["has-checked:underline", ".has-checked\\:underline:has(:checked) {\n  text-decoration-line: underline;\n}"],
      ["has-hover:underline", ".has-hover\\:underline:has(:hover) {\n  text-decoration-line: underline;\n}"],
      [
        "group-has-checked:underline",
        ".group:has(:checked) .group-has-checked\\:underline {\n  text-decoration-line: underline;\n}"
      ]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })

    it("неизвестное имя has-<state> — fail-closed + dev-warn", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      expect(tailwind("has-bogus-state:underline")).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain("has-bogus-state")
    })

    it("regression: bracket-формы has-[a]:/group-has-[a]: не задеты", () => {
      expect(tailwind("has-[a]:underline")).toBe(
        ".has-\\[a\\]\\:underline:has(a) {\n  text-decoration-line: underline;\n}"
      )
      expect(tailwind("group-has-[a]:underline")).toBe(
        ".group:has(a) .group-has-\\[a\\]\\:underline {\n  text-decoration-line: underline;\n}"
      )
    })
  })

  it("regression: valid:/invalid:/open: не задеты новыми ключами", () => {
    expect(tailwind("valid:underline")).toBe(".valid\\:underline:valid {\n  text-decoration-line: underline;\n}")
    expect(tailwind("invalid:underline")).toBe(".invalid\\:underline:invalid {\n  text-decoration-line: underline;\n}")
    expect(tailwind("open:underline")).toBe(".open\\:underline[open] {\n  text-decoration-line: underline;\n}")
  })
})

describe("Issue 5 — дозаполнение v4-имён (шкалы остаются v3)", () => {
  it.each([
    ["shadow-2xs", ".shadow-2xs {\n  box-shadow: 0 1px rgb(0 0 0 / 0.05);\n}"],
    ["shadow-xs", ".shadow-xs {\n  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n}"],
    [
      "drop-shadow-xs",
      `.drop-shadow-xs {\n  --fv-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));\n  ${FILTER}\n}`
    ],
    ["outline-hidden", ".outline-hidden {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("regression: v3-семантика общих имён не изменилась", () => {
    expect(tailwind("shadow-sm")).toBe(".shadow-sm {\n  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);\n}")
    expect(tailwind("shadow-md")).toBe(
      ".shadow-md {\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\n}"
    )
    expect(tailwind("outline-none")).toBe(
      ".outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}"
    )
    expect(tailwind("outline")).toBe(".outline {\n  outline-style: solid;\n}")
    expect(tailwind("rounded")).toBe(".rounded {\n  border-radius: 0.25rem;\n}")
    expect(tailwind("rounded-sm")).toBe(".rounded-sm {\n  border-radius: 0.125rem;\n}")
    expect(tailwind("drop-shadow-sm")).toBe(
      `.drop-shadow-sm {\n  --fv-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));\n  ${FILTER}\n}`
    )
  })
})

describe("Issue 6 — modern transform properties", () => {
  describe("rotate → CSS property rotate:", () => {
    it.each([
      ["rotate-45", ".rotate-45 {\n  rotate: 45deg;\n}"],
      ["-rotate-45", ".-rotate-45 {\n  rotate: calc(45deg * -1);\n}"],
      ["rotate-[17deg]", ".rotate-\\[17deg\\] {\n  rotate: 17deg;\n}"],
      ["rotate-(--r)", ".rotate-\\(--r\\) {\n  rotate: var(--r);\n}"]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("scale → CSS property scale:", () => {
    it.each([
      ["scale-100", `.scale-100 {\n  --fv-scale-x: 1;\n  --fv-scale-y: 1;\n  ${SCALE}\n}`],
      ["scale-x-50", `.scale-x-50 {\n  --fv-scale-x: 0.5;\n  ${SCALE}\n}`],
      ["scale-y-75", `.scale-y-75 {\n  --fv-scale-y: 0.75;\n  ${SCALE}\n}`],
      ["-scale-x-100", `.-scale-x-100 {\n  --fv-scale-x: calc(1 * -1);\n  ${SCALE}\n}`]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })

    it("rtl:-scale-x-100 — RTL-зеркалирование через modern property", () => {
      expect(tailwind("rtl:-scale-x-100")).toBe(
        `.rtl\\:-scale-x-100:where([dir="rtl"], [dir="rtl"] *) {\n  --fv-scale-x: calc(1 * -1);\n  ${SCALE}\n}`
      )
    })
  })

  describe("skew — единственный житель transform:-цепочки", () => {
    it.each([
      ["skew-x-6", `.skew-x-6 {\n  --fv-skew-x: 6deg;\n  ${SKEW}\n}`],
      ["skew-y-3", `.skew-y-3 {\n  --fv-skew-y: 3deg;\n  ${SKEW}\n}`]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("translate — без изменений (regression)", () => {
    it.each([
      ["translate-x-4", `.translate-x-4 {\n  --fv-translate-x: 1rem;\n  ${TRANSLATE}\n}`],
      [
        "-translate-y-1/2",
        `.-translate-y-1\\/2 {\n  --fv-translate-y: calc(calc(1 / 2 * 100%) * -1);\n  ${TRANSLATE}\n}`
      ]
    ])("%s", (classValue, expected) => {
      expect(tailwind(classValue)).toBe(expected)
    })
  })

  describe("композиция без двойного сдвига", () => {
    it("rotate-45 не тянет translate/scale внутрь transform", () => {
      const css = tailwind("rotate-45")!
      expect(css).not.toContain("translate")
      expect(css).not.toContain("scale")
      expect(css).not.toContain("transform:")
    })
    it("translate-x-4 не эмитит transform:", () => {
      expect(tailwind("translate-x-4")).not.toContain("transform:")
    })
  })

  describe("transition-* знает о modern properties", () => {
    it("transition-transform", () => {
      expect(tailwind("transition-transform")).toBe(
        ".transition-transform {\n  transition-property: transform, translate, scale, rotate;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}"
      )
    })
    it("transition (bare)", () => {
      expect(tailwind("transition")).toBe(
        ".transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}"
      )
    })
    it("regression: transition-colors без изменений", () => {
      expect(tailwind("transition-colors")).toBe(
        ".transition-colors {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}"
      )
    })
  })
})
