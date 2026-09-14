import { describe, expect, it } from "vitest"
import { tailwind } from "./tailwind"

/**
 * Волна 3 uno-движка — [uno-engine.md Issue 4](../../../Documentation/issues/uno-engine.md),
 * приоритет 2: семейства утилит Tailwind v4 / v4.1, которых движок не генерировал вовсе.
 *
 * До этой волны каждый класс отсюда либо тихо дропался (fail-closed после волны 2), либо —
 * хуже — уводил разбор в чужое правило: `perspective-origin-top` матчился правилом
 * `origin` (`transform-origin`), а `text-shadow-lg` — правилом размера текста.
 */

const FILTER =
  "filter: var(--fv-blur) var(--fv-brightness) var(--fv-contrast) var(--fv-grayscale) var(--fv-hue-rotate) var(--fv-invert) var(--fv-saturate) var(--fv-sepia) var(--fv-drop-shadow);"
const TRANSFORM =
  "transform: rotateX(var(--fv-rotate-x, 0)) rotateY(var(--fv-rotate-y, 0)) rotateZ(var(--fv-rotate-z, 0)) skewX(var(--fv-skew-x, 0)) skewY(var(--fv-skew-y, 0));"
const SHADOW_CHAIN =
  "box-shadow: var(--fv-inset-shadow, 0 0 #0000), var(--fv-inset-ring-shadow, 0 0 #0000), var(--fv-ring-offset-shadow, 0 0 #0000), var(--fv-ring-shadow, 0 0 #0000), var(--fv-shadow, 0 0 #0000);"

describe("Issue 4 — Typography (v4.1)", () => {
  it.each([
    ["wrap-anywhere", ".wrap-anywhere {\n  overflow-wrap: anywhere;\n}"],
    ["wrap-break-word", ".wrap-break-word {\n  overflow-wrap: break-word;\n}"],
    ["wrap-normal", ".wrap-normal {\n  overflow-wrap: normal;\n}"],
    ["font-stretch-condensed", ".font-stretch-condensed {\n  font-stretch: condensed;\n}"],
    ["font-stretch-ultra-expanded", ".font-stretch-ultra-expanded {\n  font-stretch: ultra-expanded;\n}"],
    ["font-stretch-75%", ".font-stretch-75\\% {\n  font-stretch: 75%;\n}"],
    ["font-stretch-[66.66%]", ".font-stretch-\\[66\\.66\\%\\] {\n  font-stretch: 66.66%;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("font-stretch не перехватывает font-bold / font-sans", () => {
    expect(tailwind("font-bold")).toBe(".font-bold {\n  font-weight: 700;\n}")
    expect(tailwind("font-sans")).toContain("font-family:")
  })
})

describe("Issue 4 — Gradient API (v4)", () => {
  it.each([
    [
      "bg-linear-to-r",
      ".bg-linear-to-r {\n  background-image: linear-gradient(to right, var(--fv-gradient-stops));\n}"
    ],
    [
      "bg-linear-to-br",
      ".bg-linear-to-br {\n  background-image: linear-gradient(to bottom right, var(--fv-gradient-stops));\n}"
    ],
    ["bg-linear-45", ".bg-linear-45 {\n  background-image: linear-gradient(45deg, var(--fv-gradient-stops));\n}"],
    [
      "-bg-linear-45",
      ".-bg-linear-45 {\n  background-image: linear-gradient(calc(45deg * -1), var(--fv-gradient-stops));\n}"
    ],
    ["bg-conic-180", ".bg-conic-180 {\n  background-image: conic-gradient(from 180deg, var(--fv-gradient-stops));\n}"],
    [
      "bg-radial-[at_50%_75%]",
      ".bg-radial-\\[at_50\\%_75\\%\\] {\n  background-image: radial-gradient(at 50% 75%, var(--fv-gradient-stops));\n}"
    ],
    ["bg-size-cover", ".bg-size-cover {\n  background-size: cover;\n}"],
    ["bg-size-[auto_100px]", ".bg-size-\\[auto_100px\\] {\n  background-size: auto 100px;\n}"],
    ["bg-position-top", ".bg-position-top {\n  background-position: top;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("bg-radial / bg-conic без аргумента — форма без параметров", () => {
    expect(tailwind("bg-radial")).toBe(
      ".bg-radial {\n  background-image: radial-gradient(var(--fv-gradient-stops));\n}"
    )
    expect(tailwind("bg-conic")).toBe(".bg-conic {\n  background-image: conic-gradient(var(--fv-gradient-stops));\n}")
  })

  it("модификатор интерполяции: цветовое пространство и hue-метод разбираются по-разному", () => {
    expect(tailwind("bg-linear-to-r/oklch")).toBe(
      ".bg-linear-to-r\\/oklch {\n  background-image: linear-gradient(to right in oklch, var(--fv-gradient-stops));\n}"
    )
    expect(tailwind("bg-linear-to-r/longer")).toBe(
      ".bg-linear-to-r\\/longer {\n  background-image: linear-gradient(to right in oklch longer hue, var(--fv-gradient-stops));\n}"
    )
  })

  it("v3-форма bg-gradient-to-* не задета", () => {
    expect(tailwind("bg-gradient-to-r")).toBe(
      ".bg-gradient-to-r {\n  background-image: linear-gradient(to right, var(--fv-gradient-stops));\n}"
    )
  })
})

describe("Issue 4 — Effects: text-shadow / inset-shadow / inset-ring (v4, v4.1)", () => {
  it("text-shadow-* разбирается своим правилом, а не размером текста", () => {
    expect(tailwind("text-shadow-lg")).toBe(
      `.text-shadow-lg {\n  text-shadow: 0px 1px 2px var(--fv-text-shadow-color, rgb(0 0 0 / 0.1)), 0px 3px 2px var(--fv-text-shadow-color, rgb(0 0 0 / 0.1)), 0px 4px 8px var(--fv-text-shadow-color, rgb(0 0 0 / 0.1));\n}`
    )
    expect(tailwind("text-shadow-none")).toBe(".text-shadow-none {\n  text-shadow: none;\n}")
  })

  it("text-lg / text-red-500 не задеты", () => {
    expect(tailwind("text-lg")).toContain("font-size: 1.125rem;")
    expect(tailwind("text-red-500")).toContain("color:")
  })

  it("цвет тени текста пишет отдельную переменную — порядок классов не важен", () => {
    expect(tailwind("text-shadow-red-500")).toBe(
      ".text-shadow-red-500 {\n  --fv-text-shadow-color: rgb(var(--fv-red-500, 239 68 68));\n}"
    )
  })

  it("inset-shadow-* использует пятислотовую цепочку box-shadow", () => {
    expect(tailwind("inset-shadow-sm")).toBe(
      `.inset-shadow-sm {\n  --fv-inset-shadow: inset 0 2px 4px var(--fv-inset-shadow-color, rgb(0 0 0 / 0.05));\n  ${SHADOW_CHAIN}\n}`
    )
  })

  it("inset-ring-<width> и его цвет", () => {
    expect(tailwind("inset-ring-2")).toBe(
      `.inset-ring-2 {\n  --fv-inset-ring-shadow: inset 0 0 0 2px var(--fv-inset-ring-color, currentcolor);\n  ${SHADOW_CHAIN}\n}`
    )
    expect(tailwind("inset-ring-blue-500")).toBe(
      ".inset-ring-blue-500 {\n  --fv-inset-ring-color: rgb(var(--fv-blue-500, 59 130 246));\n}"
    )
  })

  it("inset-0 и ring-2 не задеты новыми семействами", () => {
    expect(tailwind("inset-0")).toBe(".inset-0 {\n  inset: 0px;\n}")
    expect(tailwind("ring-2")).toContain("--fv-ring-shadow:")
  })
})

describe("Issue 4 — Filters (v4, v4.1)", () => {
  it.each([
    ["filter-none", ".filter-none {\n  filter: none;\n}"],
    ["backdrop-filter-none", ".backdrop-filter-none {\n  -webkit-backdrop-filter: none;\n  backdrop-filter: none;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("цветной drop-shadow (v4.1) пишет переменную, а размер её подставляет", () => {
    expect(tailwind("drop-shadow-indigo-500")).toBe(
      ".drop-shadow-indigo-500 {\n  --fv-drop-shadow-color: rgb(var(--fv-indigo-500, 99 102 241));\n}"
    )
    // размерная форма ссылается на ту же переменную с fallback'ом на прежний литерал —
    // внешний вид без класса цвета не изменился
    expect(tailwind("drop-shadow-sm")).toBe(
      `.drop-shadow-sm {\n  --fv-drop-shadow: drop-shadow(0 1px 1px var(--fv-drop-shadow-color, rgb(0 0 0 / 0.05)));\n  ${FILTER}\n}`
    )
  })
})

describe("Issue 4 — 3D transforms (v4)", () => {
  it.each([
    ["rotate-x-45", `.rotate-x-45 {\n  --fv-rotate-x: 45deg;\n  ${TRANSFORM}\n}`],
    ["rotate-y-30", `.rotate-y-30 {\n  --fv-rotate-y: 30deg;\n  ${TRANSFORM}\n}`],
    ["-rotate-z-15", `.-rotate-z-15 {\n  --fv-rotate-z: calc(15deg * -1);\n  ${TRANSFORM}\n}`],
    [
      "translate-z-4",
      ".translate-z-4 {\n  --fv-translate-z: 1rem;\n  translate: var(--fv-translate-x) var(--fv-translate-y) var(--fv-translate-z, 0);\n}"
    ],
    [
      "scale-z-125",
      ".scale-z-125 {\n  --fv-scale-z: 1.25;\n  scale: var(--fv-scale-x) var(--fv-scale-y) var(--fv-scale-z, 1);\n}"
    ],
    ["transform-3d", ".transform-3d {\n  transform-style: preserve-3d;\n}"],
    ["transform-flat", ".transform-flat {\n  transform-style: flat;\n}"],
    ["transform-none", ".transform-none {\n  transform: none;\n}"],
    ["backface-hidden", ".backface-hidden {\n  backface-visibility: hidden;\n}"],
    ["perspective-normal", ".perspective-normal {\n  perspective: 500px;\n}"],
    ["perspective-[750px]", ".perspective-\\[750px\\] {\n  perspective: 750px;\n}"],
    ["perspective-origin-top", ".perspective-origin-top {\n  perspective-origin: top;\n}"],
    ["perspective-origin-bottom-left", ".perspective-origin-bottom-left {\n  perspective-origin: bottom left;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("унифицированный skew-<n> без оси (v4) задаёт обе оси", () => {
    // до волны 3 эта форма роняла движок: skew[undefined] не существовало
    expect(tailwind("skew-6")).toBe(`.skew-6 {\n  --fv-skew-x: 6deg;\n  --fv-skew-y: 6deg;\n  ${TRANSFORM}\n}`)
  })

  it("плоские rotate-* и origin-* не задеты", () => {
    expect(tailwind("rotate-45")).toBe(".rotate-45 {\n  rotate: 45deg;\n}")
    expect(tailwind("origin-top-left")).toBe(".origin-top-left {\n  transform-origin: top left;\n}")
  })
})

describe("Issue 4 — Interactivity / a11y / transitions (v4)", () => {
  it.each([
    ["scheme-dark", ".scheme-dark {\n  color-scheme: dark;\n}"],
    ["scheme-light-dark", ".scheme-light-dark {\n  color-scheme: light dark;\n}"],
    ["field-sizing-content", ".field-sizing-content {\n  field-sizing: content;\n}"],
    ["forced-color-adjust-none", ".forced-color-adjust-none {\n  forced-color-adjust: none;\n}"],
    ["transition-discrete", ".transition-discrete {\n  transition-behavior: allow-discrete;\n}"],
    ["transition-normal", ".transition-normal {\n  transition-behavior: normal;\n}"]
  ])("%s", (classValue, expected) => {
    expect(tailwind(classValue)).toBe(expected)
  })

  it("transition-none / transition-colors не задеты", () => {
    expect(tailwind("transition-none")).toBe(".transition-none {\n  transition-property: none;\n}")
    expect(tailwind("transition-colors")).toContain("transition-property: color,")
  })
})

describe("Issue 4 — mask-* остаётся вне диалекта (P3)", () => {
  it("mask-* по-прежнему fail-closed, а не матчится градиентными правилами", () => {
    expect(tailwind("mask-linear-45")).toBeUndefined()
  })
})
