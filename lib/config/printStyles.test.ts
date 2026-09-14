import { describe, expect, it } from "vitest"
import baseStyle from "fishtvue/config/baseStyle"

/**
 * Print-стили — категория N59, решение R21.
 *
 * Исходный план был покомпонентным: добавить `print:`-классы в тринадцать оставшихся SFC.
 * Он провалился бы по двум причинам сразу, и обе не видны из отдельного компонента:
 *
 * 1. `print:`-классы попадают в CSS **только у смонтированного компонента** — их эмитит
 *    `Component.setStyle()`. Незакрытый Dialog, неоткрытый FixWindow и не показанный тост своих
 *    правил в документ не добавляют, а печатают страницу именно в таком состоянии.
 * 2. Портальные узлы (Dialog, FixWindow, тосты `openAlert`) рендерятся в `body`, вне дерева
 *    приложения — покомпонентные классы до них доезжают, а вот любые правила, завязанные на
 *    контейнер приложения, нет.
 *
 * Единый блок в `baseStyle` инжектится один раз на `install()` и адресуется data-атрибутами,
 * поэтому оба случая покрыты. Тест держит контракт: блок существует, гейтнут `@media print`
 * и перечисляет ровно те узлы, ради которых заводился.
 */
const printBlock = (() => {
  const start = baseStyle.indexOf("@media print")
  return start === -1 ? "" : baseStyle.slice(start)
})()

describe("baseStyle — единый print-блок", () => {
  it("блок существует и гейтнут @media print", () => {
    expect(printBlock).not.toBe("")
    expect(printBlock.startsWith("@media print")).toBe(true)
  })

  it("эфемерные оверлеи скрыты — они описывают сеанс, а не документ", () => {
    for (const selector of ["[data-fix-window]", "[data-alert-container]", "[data-dialog-background]"]) {
      expect(printBlock).toContain(selector)
    }
    expect(printBlock).toContain("display: none !important;")
  })

  it("поверхности печатаются плоскими", () => {
    for (const selector of [
      "[data-accordion]",
      "[data-alert]",
      "[data-badge]",
      "[data-calendar]",
      "[data-dialog]",
      "[data-label]",
      "[data-menu]",
      "[data-separator]",
      "[data-split]",
      "[data-text-editor]",
      "[data-virtual-scroller]"
    ]) {
      expect(printBlock).toContain(selector)
    }
    expect(printBlock).toContain("box-shadow: none !important;")
  })

  it("скролл-контейнеры не обрезают контент на бумаге", () => {
    expect(printBlock).toContain("[data-vs-viewport]")
    expect(printBlock).toContain("overflow: visible !important;")
    expect(printBlock).toContain("max-height: none !important;")
  })

  it("ни одно правило не действует вне печати", () => {
    // весь блок целиком лежит внутри @media print: за его пределами baseStyle
    // не содержит ни одного из этих селекторов
    const beforePrint = baseStyle.slice(0, baseStyle.indexOf("@media print"))
    expect(beforePrint).not.toContain("[data-fix-window]")
    expect(beforePrint).not.toContain("[data-virtual-scroller]")
  })
})
