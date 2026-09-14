import { describe, expect, it } from "vitest"
import Locales from "fishtvue/locale"
import en from "fishtvue/locale/locales/en"
import ru from "fishtvue/locale/locales/ru"

/**
 * Полнота и согласованность встроенных локалей (locale.md Issue 1 — coverage 0%).
 *
 * `DefaultMessages` — только тип, в рантайме его нет, поэтому «все ключи интерфейса на месте»
 * напрямую не проверить: за этим следит `vue-tsc`. Рантайм-риск другой — **дрейф между
 * локалями**: ключ добавили в `en`, забыли в `ru`, и `Component.t()` тихо отдаёт английский
 * текст в русском интерфейсе (fallback chain по построению не различает «нет перевода» и
 * «так задумано»). Симметрия ключей ловит именно это.
 */

/** Плоский список dot-path'ов всех листьев объекта. */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix]
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key)
  )
}

const enPaths = leafPaths(en).sort()
const ruPaths = leafPaths(ru).sort()

describe("locale — барель", () => {
  it("экспортирует ровно en и ru", () => {
    expect(Object.keys(Locales).sort()).toEqual(["en", "ru"])
  })

  it("отдаёт те же объекты, что и точечные импорты", () => {
    expect(Locales.en).toBe(en)
    expect(Locales.ru).toBe(ru)
  })
})

describe("locale — симметрия ключей", () => {
  it("ru покрывает все ключи en", () => {
    const missing = enPaths.filter((path) => !ruPaths.includes(path))
    expect(missing, `Нет в ru: ${missing.join(", ")}`).toEqual([])
  })

  it("en покрывает все ключи ru", () => {
    const extra = ruPaths.filter((path) => !enPaths.includes(path))
    expect(extra, `Нет в en: ${extra.join(", ")}`).toEqual([])
  })
})

describe("locale — значения", () => {
  it.each([
    ["en", en],
    ["ru", ru]
  ])("%s: все листья — непустые строки", (_name, messages) => {
    const empty = leafPaths(messages).filter((path) => {
      const value = path.split(".").reduce<any>((acc, key) => acc?.[key], messages)
      return typeof value !== "string" || value.trim().length === 0
    })

    expect(empty, `Пустые значения: ${empty.join(", ")}`).toEqual([])
  })

  it("ru действительно переведён, а не скопирован из en", () => {
    // Совпадение по всем ключам означало бы, что кто-то продублировал файл.
    const identical = enPaths.filter((path) => {
      const read = (src: unknown) => path.split(".").reduce<any>((acc, key) => acc?.[key], src)
      return read(en) === read(ru)
    })

    expect(identical.length).toBeLessThan(enPaths.length / 2)
  })
})

describe("locale — pluralization-шаблоны (Wave 3.5)", () => {
  it.each([
    ["en", en],
    ["ru", ru]
  ])("%s: resultsCount задан формами через | ", (_name, messages: any) => {
    for (const scope of ["select", "table"]) {
      const template = messages[scope]?.resultsCount
      expect(template, `${scope}.resultsCount отсутствует`).toBeTypeOf("string")
      expect(template).toContain("|")
      // `=0` — точный селектор нуля; далее CLDR-категории.
      expect(template).toMatch(/^=0\s/)
    }
  })

  it("ru покрывает few/many — формы, которых нет в английском", () => {
    // Эвристика `n === 1` дала бы неверный результат для 11 и 22; ради этого и заведены CLDR-формы.
    expect((ru as any).table.resultsCount).toContain("few")
    expect((ru as any).table.resultsCount).toContain("many")
  })
})
