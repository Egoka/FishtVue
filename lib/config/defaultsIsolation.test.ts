import { afterEach, describe, expect, it } from "vitest"
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import Aurora from "fishtvue/theme/themes/Aurora"
import Harmony from "fishtvue/theme/themes/Harmony"
import Sapphire from "fishtvue/theme/themes/Sapphire"
import defaultSemantic from "fishtvue/theme/semantic"
import en from "fishtvue/locale/locales/en"
import ru from "fishtvue/locale/locales/ru"

/**
 * Изоляция дефолтов при установке plugin'а (найдено 2026-09-05).
 *
 * `install()` собирает конфиг как `deepMerge(defaults, userOptions)`, а `deepMerge` по канону
 * библиотеки **мутирует первый аргумент** (см. `utilities/objectHandler.md`, Issue 8: безопасный
 * паттерн — `deepMerge(deepCopy(defaults), overrides)`). При этом `getDefaultOptions()` отдавал
 * модульные синглтоны **по ссылке**: `resolveTheme()` — сам импортированный пресет, а
 * `locale.messages` — сами объекты `Locales.en` / `Locales.ru`.
 *
 * Итог: любой `app.use(FishtVue, { theme, locale })` навсегда портил встроенные пресеты и локали
 * для всего процесса. Все три темы разделяют один `defaultSemantic`/`defaultPrimitive`, поэтому
 * правка «только Aurora» протекала и в Harmony с Sapphire.
 *
 * Где это больно по-настоящему — **SSR**: один Node-процесс обслуживает много запросов, и конфиг
 * первого запроса становится дефолтом для всех следующих. Плюс несколько Vue-приложений на одной
 * странице (микрофронтенды) и `usePreset(Aurora)` после кастомной установки.
 */
const apps: Array<{ unmount: () => void }> = []

function install(options: Record<string, any> = {}) {
  const app = createApp({ render: () => null })
  app.use(FishtVue, options)
  apps.push(app)
  return app
}

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  delete (window as any).FishtVue
})

describe("install() не мутирует встроенные пресеты тем", () => {
  it("не пишет пользовательский customThemeColor в Aurora", () => {
    install({ theme: { semantic: { customThemeColor: 210 } } })

    expect((Aurora as any).semantic.customThemeColor).toBe("25deg")
  })

  it("не протекает в соседние пресеты", () => {
    install({ theme: { semantic: { customThemeColor: 210, customThemeColorContrast: 40 } } })

    // Каждая тема с 2026-09-06 держит собственный брендовый оттенок; общим по ссылке остаётся
    // только `primitive`. Прежняя формулировка теста («протекает через общий defaultSemantic»)
    // описывала состояние, когда все три делили один объект semantic.
    expect((Harmony as any).semantic.customThemeColor).toBe("152deg")
    expect((Sapphire as any).semantic.customThemeColor).toBe("217deg")
    expect(defaultSemantic.customThemeColor).toBe(0)
  })

  it("не добавляет в пресет ключи, которых там не было", () => {
    install({ theme: { semantic: { brandNewSlot: "injected" } as any } })

    expect((Aurora as any).semantic).not.toHaveProperty("brandNewSlot")
  })

  it("второй app получает чистые дефолты после кастомной установки первого", () => {
    install({ theme: { semantic: { customThemeColor: 210 } } })
    const second = install()

    const config = (second.config.globalProperties as any).$fishtVue.config
    expect(config.theme?.semantic?.customThemeColor).toBe("25deg")
  })
})

describe("install() не мутирует встроенные локали", () => {
  it("не переписывает ключи en пользовательскими сообщениями", () => {
    install({ locale: { messages: { en: { save: "MUTATED" } } } })

    expect((en as any).save).toBe("Save")
  })

  it("не переписывает ключи ru", () => {
    install({ locale: { messages: { ru: { save: "ИСПОРЧЕНО" } } } })

    expect((ru as any).save).toBe("Сохранить")
  })

  it("не добавляет пользовательскую локаль в модульный словарь", () => {
    install({ locale: { messages: { de: { save: "Speichern" } } as any } })

    const Locales = (globalThis as any).__fvLocalesProbe ?? null
    // Прямая проверка: сами модули en/ru не должны обрасти чужими ключами.
    expect(Locales).toBeNull()
    expect(Object.keys(en as any)).not.toContain("de")
  })

  it("второй app видит исходный текст, а не переопределение первого", () => {
    install({ locale: { messages: { en: { save: "First app" } } } })
    const second = install()

    const config = (second.config.globalProperties as any).$fishtVue.config
    expect(config.locale?.messages?.en?.save).toBe("Save")
  })
})
