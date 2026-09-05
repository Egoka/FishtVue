import { describe, expect, it } from "vitest"
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import Aurora from "fishtvue/theme/themes/Aurora"
import Harmony from "fishtvue/theme/themes/Harmony"
import Sapphire from "fishtvue/theme/themes/Sapphire"
import defaultPrimitive from "fishtvue/theme/primitive"
import defaultSemantic from "fishtvue/theme/semantic"
import { NamesTheme } from "fishtvue/theme"

/**
 * Встроенные пресеты тем (theme.md Issue 2 — coverage 0%).
 *
 * Тест фиксирует не только структуру, но и факт, который иначе виден только при чтении трёх
 * файлов подряд: **пресеты идентичны по содержимому и отличаются только полем `name`**. Оба
 * поля (`primitive`, `semantic`) во всех трёх — один и тот же импортированный объект.
 * Это ожидаемое текущее состояние, а не опечатка: слоты заведены под будущую дифференциацию,
 * а брендовый цвет задаётся через `customThemeColor` / `updatePrimaryPalette()`, а не пресетом.
 * Если пресеты начнут расходиться — тест на идентичность упадёт и заставит обновить и его,
 * и документацию, где сейчас написано «три встроенные темы».
 */
/**
 * `as any` — не небрежность: поле `name` есть во всех трёх пресетах в рантайме, но **не объявлено**
 * в типе темы (`FishtVueConfiguration["theme"]` = `DeepPartial<{ primitive, semantic }>`). Файлы
 * пресетов проносят его через type assertion, то есть тип расходится с реальностью — это часть
 * открытого D21 в [theme.md](../../../Documentation/issues/theme.md).
 */
const PRESETS = [
  ["Aurora", Aurora as any],
  ["Harmony", Harmony as any],
  ["Sapphire", Sapphire as any]
] as const

describe("Встроенные темы — структура пресета", () => {
  it.each(PRESETS)("%s объявляет name, primitive и semantic", (name, preset) => {
    expect(preset?.name).toBe(name)
    expect(preset?.primitive).toBeDefined()
    expect(preset?.semantic).toBeDefined()
  })

  it.each(PRESETS)("%s переиспользует общие primitive/semantic по ссылке", (_name, preset) => {
    expect(preset?.primitive).toBe(defaultPrimitive)
    expect(preset?.semantic).toBe(defaultSemantic)
  })

  it("все три пресета различаются ТОЛЬКО именем", () => {
    const shapes = PRESETS.map(([, preset]) => JSON.stringify({ ...(preset as any), name: null }))

    expect(new Set(shapes).size).toBe(1)
  })

  it("NamesTheme перечисляет ровно те пресеты, что экспортированы", () => {
    expect(NamesTheme).toEqual(PRESETS.map(([name]) => name))
  })
})

describe("Встроенные темы — применение через plugin", () => {
  it.each(PRESETS)("%s резолвится как активная тема по nameTheme", (name) => {
    const app = createApp({ render: () => null })
    app.use(FishtVue, { optionsTheme: { nameTheme: name } })

    // linksTheme прогоняет пресет и разрешает ссылки semantic → primitive.
    const config = (app.config.globalProperties as any).$fishtVue.config

    expect(config.theme?.name).toBe(name)
    // `primitive` — плоский объект токенов: spacing-шкалы + именованные цвета на одном уровне
    // (`colors` отдельным ключом НЕ лежит — это отдельный named-экспорт primitive.ts).
    expect(config.theme?.primitive?.m).toBeDefined()
    expect(config.theme?.primitive?.theme).toBeDefined()
    expect(config.theme?.primitive?.surface).toBeDefined()
    app.unmount()
  })

  it("неизвестное имя темы откатывается на Aurora, а не падает", () => {
    const app = createApp({ render: () => null })
    app.use(FishtVue, { optionsTheme: { nameTheme: "NoSuchTheme" as any } })

    expect((app.config.globalProperties as any).$fishtVue.config.theme?.name).toBe("Aurora")
    app.unmount()
  })
})

describe("semantic.ts — дефолтные слоты", () => {
  it("не задаёт primary: слот остаётся опциональным user-override'ом", () => {
    // Wave 3.3: дефолтный `primary` снят намеренно — после linksTheme он давал статические
    // hsl(0 0 …)-строки и перебивал живые var(--theme)-формулы, ломая смену customThemeColor.
    expect(defaultSemantic).not.toHaveProperty("primary")
  })

  it("держит нулевые дефолты кастомного цвета темы", () => {
    expect(defaultSemantic.customThemeColor).toBe(0)
    expect(defaultSemantic.customThemeColorContrast).toBe(0)
  })
})
