import { afterEach, describe, expect, it } from "vitest"
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import baseStyle from "fishtvue/config/baseStyle"

/**
 * Глобальный preflight (`config.md` Issue 2 — coverage 0%).
 *
 * `baseStyle` — не компонентные классы, а базовый слой: `:root`-типографика, сброс нативных
 * контролов и **дефолты всех `--fv-*`-переменных**, на которые опирается движок (`--fv-translate-x`,
 * `--fv-rotate` и т.д.). Если он не доедет до документа, компоненты отрендерятся, но трансформы
 * и градиенты будут собираться из `var()` без значений — молчаливая деградация без ошибок.
 */
describe("baseStyle — содержимое", () => {
  it("объявляет :root-типографику и класс-хук .fv", () => {
    expect(baseStyle).toContain(":root")
    expect(baseStyle).toContain(".fv")
  })

  it("задаёт дефолты --fv-переменных, которые потребляет движок", () => {
    // Движок эмитит `translate: var(--fv-translate-x) var(--fv-translate-y)` — без дефолтов
    // свойство было бы невалидным и браузер отбросил бы всё правило.
    for (const variable of ["--fv-translate-x", "--fv-translate-y", "--fv-rotate"]) {
      expect(baseStyle, `нет дефолта ${variable}`).toContain(`${variable}:`)
    }
  })

  it("не содержит незакрытых фигурных скобок", () => {
    const open = (baseStyle.match(/{/g) ?? []).length
    const close = (baseStyle.match(/}/g) ?? []).length
    // В config/index.ts строка оборачивается в `@layer fishtvue {…}` с ОДНОЙ закрывающей скобкой
    // в конце самого baseStyle — это осознанная асимметрия, а не опечатка.
    expect(close - open).toBe(1)
  })
})

describe("baseStyle — инжекция при установке plugin'а", () => {
  const created: Array<{ unmount: () => void }> = []

  afterEach(() => {
    created.splice(0).forEach((app) => app.unmount())
    delete (window as any).FishtVue
  })

  function install(options: Record<string, any> = {}) {
    const app = createApp({ render: () => null })
    app.use(FishtVue, options)
    created.push(app)
    return app
  }

  /** CSS инжектится минифицированным — пробелы вокруг разделителей не сохраняются. */
  function injectedCss() {
    return Array.from(document.head.querySelectorAll("style"))
      .map((el) => el.textContent ?? "")
      .join("\n")
      .replace(/\s+/g, "")
  }

  it("оборачивает базовый слой в @layer fishtvue", () => {
    install()
    expect(injectedCss()).toContain("@layerfishtvue")
  })

  it("прокидывает customThemeColor в :root как --theme", () => {
    install({ theme: { semantic: { customThemeColor: 210, customThemeColorContrast: 40 } } })
    const css = injectedCss()

    expect(css).toContain("--theme:210")
    expect(css).toContain("--theme-contrast:40")
  })

  it("ставит пользовательские layers перед fishtvue, когда они заданы", () => {
    install({ optionsTheme: { layers: "reset, fishtvue, utilities" } })

    // Ищем ИМЕННО базовый style-тег: при `isolate: false` в head накапливаются теги от
    // предыдущих файлов, поэтому сравнивать индексы по всему документу нельзя.
    const base = Array.from(document.head.querySelectorAll("style"))
      .map((el) => (el.textContent ?? "").replace(/\s+/g, ""))
      .find((css) => css.includes("@layerreset,fishtvue,utilities;"))

    expect(base, "базовый style-тег с пользовательскими layers не найден").toBeDefined()
    // Порядок @layer-декларации определяет каскад — объявление обязано идти до блока.
    expect(base!.indexOf("@layerreset,fishtvue,utilities;")).toBeLessThan(base!.indexOf("@layerfishtvue{"))
  })
})
