import { afterEach, describe, expect, it } from "vitest"
import { createApp } from "vue"
import FishtVue, { applyDocumentDirection, getLocaleMetadata, setActiveLocale } from "fishtvue/config"
import { builtInLocales, localeDirection, resolveLocaleMetadata } from "fishtvue/locale"

/**
 * Метаданные локалей — [locale.md Issues 4 и 6](../../Documentation/issues/locale.md), решение R23.
 *
 * До этого из кода локали нельзя было узнать ничего, кроме имени: ни направление письма, ни какую
 * строку передавать в `Intl` / `date-fns`. Отсюда два разных симптома — `<html dir>` никто не
 * выставлял (и логические CSS-свойства в RTL не срабатывали), а формат дат и чисел приходилось
 * прокидывать вручную в каждом компоненте.
 */

const apps: ReturnType<typeof createApp>[] = []

function install(config: Record<string, any> = {}) {
  const app = createApp({ render: () => null })
  app.use(FishtVue as any, config)
  apps.push(app)
  return app
}

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.documentElement.removeAttribute("dir")
  document.documentElement.removeAttribute("data-fv-dir")
  delete (window as any).FishtVue
})

describe("localeDirection", () => {
  it.each([
    ["en", "ltr"],
    ["ru", "ltr"],
    ["de-CH", "ltr"],
    ["ar", "rtl"],
    ["he", "rtl"],
    ["fa-IR", "rtl"],
    ["ur", "rtl"]
  ])("%s → %s", (code, expected) => {
    expect(localeDirection(code)).toBe(expected)
  })

  it("регион отбрасывается, но не там, где он и определяет письменность", () => {
    // узбекский латиницей — LTR, он же в Афганистане арабицей — RTL
    expect(localeDirection("uz")).toBe("ltr")
    expect(localeDirection("uz-AF")).toBe("rtl")
  })

  it("подчёркивание как разделитель тоже понимается", () => {
    expect(localeDirection("ar_EG")).toBe("rtl")
  })

  it("пустое значение не роняет резолв", () => {
    expect(localeDirection(undefined)).toBe("ltr")
  })
})

describe("resolveLocaleMetadata", () => {
  it("встроенные локали описаны явно", () => {
    expect(resolveLocaleMetadata("ru")).toEqual({
      code: "ru",
      name: "Русский",
      direction: "ltr",
      dateLocale: "ru-RU",
      numberLocale: "ru-RU"
    })
  })

  it("для неизвестного кода метаданные выводятся, а не отдаются пустыми", () => {
    // важное свойство: dateLocale/numberLocale равны самому коду — это ровно то, что ждут
    // Intl.* и date-fns; undefined каждому вызывающему пришлось бы подменять на "en"
    expect(resolveLocaleMetadata("ar-EG")).toEqual({
      code: "ar-EG",
      name: "ar-EG",
      direction: "rtl",
      dateLocale: "ar-EG",
      numberLocale: "ar-EG"
    })
  })

  it("возвращает копию — правка результата не портит словарь", () => {
    const first = resolveLocaleMetadata("en")
    first.name = "MUTATED"

    expect(resolveLocaleMetadata("en").name).toBe("English")
  })

  it("builtInLocales перечисляет обе встроенные локали", () => {
    expect(builtInLocales().map((meta) => meta.code)).toEqual(["en", "ru"])
  })
})

describe("<html dir> синхронизируется с активной локалью", () => {
  it("install выставляет направление сразу, не дожидаясь смены локали", () => {
    install({ locale: { defaultLocale: "en" } })

    expect(document.documentElement.getAttribute("dir")).toBe("ltr")
  })

  it("RTL-локаль в конфиге даёт dir=rtl на старте", () => {
    install({ locale: { defaultLocale: "ar", messages: { ar: {} } } })

    expect(document.documentElement.getAttribute("dir")).toBe("rtl")
  })

  it("setActiveLocale переключает направление", () => {
    install({ locale: { defaultLocale: "en", messages: { en: {}, he: {} } } })
    expect(document.documentElement.getAttribute("dir")).toBe("ltr")

    setActiveLocale("he")

    expect(document.documentElement.getAttribute("dir")).toBe("rtl")
  })

  it("выставленный вручную dir не перетирается", () => {
    // потребитель, который сам управляет направлением (FishtVue — лишь часть страницы),
    // не должен получать спор с библиотекой. Признак «выставили мы» — атрибут data-fv-dir;
    // здесь его нет, значит dir чужой.
    document.documentElement.setAttribute("dir", "rtl")

    expect(applyDocumentDirection("en")).toBe("rtl")
    expect(document.documentElement.getAttribute("dir")).toBe("rtl")
  })
})

describe("getLocaleMetadata", () => {
  it("без аргумента отдаёт метаданные активной локали", () => {
    install({ locale: { defaultLocale: "ru", messages: { ru: {} } } })

    expect(getLocaleMetadata().dateLocale).toBe("ru-RU")
  })

  it("с аргументом не зависит от активной локали", () => {
    install({ locale: { defaultLocale: "ru", messages: { ru: {} } } })

    expect(getLocaleMetadata("en").numberLocale).toBe("en-US")
  })
})
