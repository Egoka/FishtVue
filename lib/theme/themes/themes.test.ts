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
 * Встроенные пресеты тем (theme.md Issues 2 и D21).
 *
 * **История этого теста стоит того, чтобы её знать.** В первой редакции (2026-09-05) он фиксировал
 * обратное текущему: пресеты идентичны и отличаются только полем `name`. Это было честное описание
 * состояния — «три темы» библиотеки различались строкой, а выглядели одинаково серыми, потому что
 * `customThemeColor` у всех трёх был `0`.
 *
 * 2026-09-06 обе половины исправлены разом:
 *
 * - темы **дифференцированы** брендовым слотом (Aurora тёплая, Harmony зелёная, Sapphire синяя);
 *   различаются ровно два значения `semantic`, вся остальная палитра общая по ссылке;
 * - поле `name` **снято** с пресетов. Оно не было объявлено в типе темы и проносилось через type
 *   assertion — тип расходился с реальностью (D21). Идентичность активной темы теперь живёт в
 *   `config.optionsTheme.nameTheme`, где она типизирована и нормализована `install()`.
 */
const PRESETS = [
  ["Aurora", Aurora, "25deg"],
  ["Harmony", Harmony, "152deg"],
  ["Sapphire", Sapphire, "217deg"]
] as const

describe("Встроенные темы — структура пресета", () => {
  it.each(PRESETS)("%s объявляет primitive и semantic, но не имя", (_name, preset) => {
    expect(preset?.primitive).toBeDefined()
    expect(preset?.semantic).toBeDefined()
    // D21: идентичность темы — в optionsTheme.nameTheme, а не в самом объекте темы.
    expect(preset).not.toHaveProperty("name")
  })

  it.each(PRESETS)("%s переиспользует общий primitive по ссылке", (_name, preset) => {
    expect(preset?.primitive).toBe(defaultPrimitive)
  })

  it.each(PRESETS)("%s задаёт собственный оттенок брендового слота", (_name, preset, hue) => {
    expect(preset?.semantic?.customThemeColor).toBe(hue)
    expect(preset?.semantic?.customThemeColorContrast).toBeDefined()
  })

  it("пресеты различаются ТОЛЬКО брендовым слотом", () => {
    const withoutBrand = PRESETS.map(([, preset]) =>
      JSON.stringify({
        ...preset,
        semantic: { ...preset?.semantic, customThemeColor: null, customThemeColorContrast: null }
      })
    )

    expect(new Set(withoutBrand).size).toBe(1)
  })

  it("оттенки не повторяются — иначе «три темы» снова стали бы одной", () => {
    const hues = PRESETS.map(([, preset]) => preset?.semantic?.customThemeColor)

    expect(new Set(hues).size).toBe(PRESETS.length)
  })

  it("NamesTheme перечисляет ровно те пресеты, что экспортированы", () => {
    expect(NamesTheme).toEqual(PRESETS.map(([name]) => name))
  })
})

describe("Встроенные темы — применение через plugin", () => {
  it.each(PRESETS)("%s резолвится как активная тема по nameTheme", (name, _preset, hue) => {
    const app = createApp({ render: () => null })
    app.use(FishtVue, { optionsTheme: { nameTheme: name } })

    // linksTheme прогоняет пресет и разрешает ссылки semantic → primitive.
    const config = (app.config.globalProperties as any).$fishtVue.config

    expect(config.optionsTheme?.nameTheme).toBe(name)
    expect(config.theme?.semantic?.customThemeColor).toBe(hue)
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

    const config = (app.config.globalProperties as any).$fishtVue.config
    // nameTheme нормализуется до фактически применённой темы: держать в конфиге несуществующее
    // имя значило бы врать про активную тему.
    expect(config.optionsTheme?.nameTheme).toBe("Aurora")
    expect(config.theme?.semantic?.customThemeColor).toBe("25deg")
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
    // Сам `semantic.ts` остаётся нейтральным: брендовый оттенок задаёт пресет темы поверх него.
    expect(defaultSemantic.customThemeColor).toBe(0)
    expect(defaultSemantic.customThemeColorContrast).toBe(0)
  })
})
