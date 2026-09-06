import { describe, expect, it, vi } from "vitest"
import { tailwind } from "./tailwind"

/**
 * Волна 3 uno-движка — [uno-engine.md Issue 2](../../../Documentation/issues/uno-engine.md):
 * варианты Tailwind v4, которых движок не понимал.
 *
 * До волны 2 они деградировали по «режиму 3» — правило генерировалось БЕЗ условия, то есть
 * `not-hover:opacity-75` применялся всегда. Волна 2 закрыла это fail-closed'ом (класс дропался
 * с warn), волна 3 реализует сами формы.
 *
 * Отдельного упоминания стоят container queries: `@sm:` раньше матчился обычным breakpoint'ом
 * `sm` и выдавал **viewport**-`@media`. Это был не отказ, а ложное срабатывание: CSS валиден,
 * на full-width контейнере визуально «работает» и расходится с ожиданием везде остальном.
 */

describe("Issue 2 — not-*: отрицание варианта", () => {
  it("псевдо-класс уходит в :not()", () => {
    expect(tailwind("not-hover:opacity-75")).toBe(".not-hover\\:opacity-75:not(:hover) {\n  opacity: 0.75;\n}")
    expect(tailwind("not-first:mt-4")).toBe(".not-first\\:mt-4:not(:first-child) {\n  margin-top: 1rem;\n}")
  })

  it("media-условие отрицается на уровне at-rule", () => {
    expect(tailwind("not-dark:text-black")).toBe(
      "@media not all and (prefers-color-scheme: dark) {\n.not-dark\\:text-black {\n  color: #000000;\n}\n}"
    )
  })

  it("безусловное media-имя отрицается без `all and`", () => {
    expect(tailwind("not-print:block")).toBe("@media not print {\n.not-print\\:block {\n  display: block;\n}\n}")
  })

  it("not-supports-[...] даёт @supports not", () => {
    expect(tailwind("not-supports-[display:grid]:block")).toBe(
      "@supports not (display:grid) {\n.not-supports-\\[display\\:grid\\]\\:block {\n  display: block;\n}\n}"
    )
  })

  it("произвольный селектор в not-[...]", () => {
    expect(tailwind("not-[.foo]:block")).toBe(".not-\\[\\.foo\\]\\:block:not(.foo) {\n  display: block;\n}")
  })

  it("in-range: не перехватывается веткой in-* (регрессия волны 3)", () => {
    expect(tailwind("in-range:p-0")).toBe(".in-range\\:p-0:in-range {\n  padding: 0px;\n}")
  })
})

describe("Issue 2 — in-*: неявная группа v4", () => {
  it("условие проверяется на любом предке, без класса group", () => {
    expect(tailwind("in-focus:opacity-100")).toBe(":where(*:focus) .in-focus\\:opacity-100 {\n  opacity: 1;\n}")
  })

  it("произвольный селектор предка", () => {
    expect(tailwind("in-[.card]:underline")).toBe(
      ":where(.card) .in-\\[\\.card\\]\\:underline {\n  text-decoration-line: underline;\n}"
    )
  })
})

describe("Issue 2 — nth-*: функциональные структурные псевдо-классы", () => {
  it.each([
    ["nth-3:underline", ".nth-3\\:underline:nth-child(3)"],
    ["nth-last-2:underline", ".nth-last-2\\:underline:nth-last-child(2)"],
    ["nth-of-type-2:underline", ".nth-of-type-2\\:underline:nth-of-type(2)"],
    ["nth-last-of-type-2:underline", ".nth-last-of-type-2\\:underline:nth-last-of-type(2)"],
    ["nth-[3n+1]:underline", ".nth-\\[3n\\+1\\]\\:underline:nth-child(3n+1)"]
  ])("%s", (classValue, expectedSelector) => {
    expect(tailwind(classValue)).toBe(`${expectedSelector} {\n  text-decoration-line: underline;\n}`)
  })
})

describe("Issue 2 — композиции group-/peer- × aria-/data-", () => {
  it("group-aria-checked: сохраняет условие на группе", () => {
    expect(tailwind("group-aria-checked:underline")).toBe(
      '.group[aria-checked="true"] .group-aria-checked\\:underline {\n  text-decoration-line: underline;\n}'
    )
  })

  it("group-data-[...] и boolean group-data-*", () => {
    expect(tailwind("group-data-[loading]:opacity-50")).toBe(
      ".group[data-loading] .group-data-\\[loading\\]\\:opacity-50 {\n  opacity: 0.5;\n}"
    )
    expect(tailwind("group-data-active:underline")).toBe(
      ".group[data-active] .group-data-active\\:underline {\n  text-decoration-line: underline;\n}"
    )
  })

  it("peer-aria-* использует sibling-комбинатор", () => {
    expect(tailwind("peer-aria-expanded:block")).toBe(
      '.peer[aria-expanded="true"] ~ .peer-aria-expanded\\:block {\n  display: block;\n}'
    )
  })

  it("именованная группа group-data-[...]/name", () => {
    expect(tailwind("group-data-[open]/menu:block")).toBe(
      ".group\\/menu[data-open] .group-data-\\[open\\]\\/menu\\:block {\n  display: block;\n}"
    )
  })

  it("прежние формы group-hover / peer-checked не задеты", () => {
    expect(tailwind("group-hover:underline")).toBe(
      ".group:hover .group-hover\\:underline {\n  text-decoration-line: underline;\n}"
    )
    expect(tailwind("peer-checked:block")).toBe(".peer:checked ~ .peer-checked\\:block {\n  display: block;\n}")
  })
})

describe("Issue 2 — container queries (v4 core)", () => {
  it("утилита @container объявляет контейнер", () => {
    expect(tailwind("@container")).toBe(".\\@container {\n  container-type: inline-size;\n}")
    expect(tailwind("@container-normal")).toBe(".\\@container-normal {\n  container-type: normal;\n}")
    expect(tailwind("@container/main")).toBe(
      ".\\@container\\/main {\n  container-type: inline-size;\n  container-name: main;\n}"
    )
  })

  it("@sm: даёт @container, а не viewport-@media", () => {
    expect(tailwind("@sm:flex")).toBe("@container (min-width: 24rem) {\n.\\@sm\\:flex {\n  display: flex;\n}\n}")
  })

  it("@max-md: — верхняя граница", () => {
    expect(tailwind("@max-md:grid")).toBe("@container (width < 28rem) {\n.\\@max-md\\:grid {\n  display: grid;\n}\n}")
  })

  it("@min-[...] / @max-[...] — произвольный размер", () => {
    expect(tailwind("@min-[475px]:flex")).toBe(
      "@container (min-width: 475px) {\n.\\@min-\\[475px\\]\\:flex {\n  display: flex;\n}\n}"
    )
  })

  it("именованный контейнер @sm/main:", () => {
    expect(tailwind("@sm/main:flex")).toBe(
      "@container main (min-width: 24rem) {\n.\\@sm\\/main\\:flex {\n  display: flex;\n}\n}"
    )
  })

  it("обычный breakpoint sm: по-прежнему viewport-@media", () => {
    expect(tailwind("sm:flex")).toBe("@media (min-width: 640px) {\n.sm\\:flex {\n  display: flex;\n}\n}")
  })
})

describe("Issue 2 — **: все потомки vs *: прямые дети", () => {
  it("**: даёт потомковый комбинатор, *: — дочерний", () => {
    expect(tailwind("**:text-red-500")).toContain(".\\*\\*\\:text-red-500 * {")
    expect(tailwind("*:text-red-500")).toContain(".\\*\\:text-red-500 > * {")
  })
})

describe("Issue 2 — arbitrary at-rule variant и named supports", () => {
  it("[@media(hover:hover)]: открывает свой блок вместо мусорного селектора", () => {
    expect(tailwind("[@media(hover:hover)]:underline")).toBe(
      "@media (hover:hover) {\n.\\[\\@media\\(hover\\:hover\\)\\]\\:underline {\n  text-decoration-line: underline;\n}\n}"
    )
  })

  it("именованный supports-<feature>: проверяет поддержку свойства", () => {
    expect(tailwind("supports-backdrop-filter:bg-black/50")).toContain(
      "@supports (backdrop-filter: var(--fv-supports)) {"
    )
  })

  it("bracket-форма supports-[...] не задета", () => {
    expect(tailwind("supports-[display:grid]:block")).toBe(
      "@supports (display:grid) {\n.supports-\\[display\\:grid\\]\\:block {\n  display: block;\n}\n}"
    )
  })

  it("starting: оборачивает правило в @starting-style", () => {
    expect(tailwind("starting:opacity-0")).toBe("@starting-style {\n.starting\\:opacity-0 {\n  opacity: 0;\n}\n}")
  })
})

describe("Issue 2 — important-модификатор", () => {
  it("суффиксная форма v4", () => {
    expect(tailwind("mt-4!")).toBe(".mt-4\\! {\n  margin-top: 1rem !important;\n}")
  })

  it("префиксная форма v3", () => {
    expect(tailwind("!mt-4")).toBe(".\\!mt-4 {\n  margin-top: 1rem !important;\n}")
  })

  it("работает вместе с вариантом и с многострочным значением", () => {
    expect(tailwind("hover:underline!")).toBe(
      ".hover\\:underline\\!:hover {\n  text-decoration-line: underline !important;\n}"
    )
    const scale = tailwind("scale-95!") as string
    expect(scale).toContain("--fv-scale-x: 0.95 !important;")
    expect(scale).toContain("--fv-scale-y: 0.95 !important;")
    expect(scale).toContain("scale: var(--fv-scale-x) var(--fv-scale-y) !important;")
  })

  it("без модификатора !important не появляется", () => {
    expect(tailwind("mt-4")).toBe(".mt-4 {\n  margin-top: 1rem;\n}")
  })
})

describe("Issue 2 — неизвестные имена внутри известных форм остаются fail-closed", () => {
  // ⚠️ Классы уникальны в пределах всей сюиты: warn-дедуп движка — module-scope Set, а при
  // isolate:false он шарится между файлами. Одинаковая строка в двух файлах ломает тот из них,
  // который считает вызовы warn (см. failClosed.test.ts).
  it.each(["not-hocus:underline", "in-hocus:underline", "@gigantic:flex"])("%s", (classValue) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(tailwind(classValue)).toBeUndefined()
    warn.mockRestore()
  })
})
