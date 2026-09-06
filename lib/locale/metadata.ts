import type { LocaleMetadata, NameLocale } from "./TypesLocale"

/**
 * ## Метаданные локалей — [locale.md Issues 4 и 6](../../Documentation/issues/locale.md)
 *
 * `NameLocale` — открытый union (`string | "en" | "ru"`), и до этого модуля из кода локали
 * нельзя было узнать ничего, кроме её имени: ни направление письма, ни какую строку передавать
 * в `Intl`/`date-fns`. Это било по двум разным местам сразу — `<html dir>` никто не выставлял,
 * а форматирование дат и чисел приходилось прокидывать вручную в каждом компоненте.
 *
 * Здесь метаданные заданы для встроенных локалей и **выводятся** для любых пользовательских:
 * жёсткий словарь всех локалей мира в библиотеке компонентов не нужен, а BCP 47-код и так несёт
 * достаточно информации.
 */

/**
 * Языки с письмом справа налево (ISO 639-1/639-2, без региона).
 *
 * Список намеренно короткий: это не справочник, а набор языков, для которых `dir="rtl"` —
 * единственно верное значение. Регион (`ar-EG`) отбрасывается перед проверкой.
 */
const RTL_LANGUAGES = new Set([
  "ar", // арабский
  "arc", // арамейский
  "dv", // дивехи
  "fa", // персидский
  "ha", // хауса (аджами)
  "he", // иврит
  "khw", // ховар
  "ks", // кашмири
  "ku", // курдский (сорани)
  "ps", // пушту
  "sd", // синдхи
  "ur", // урду
  "uz-AF", // узбекский (Афганистан, арабица)
  "yi" // идиш
])

/** Метаданные встроенных локалей. */
const BUILT_IN: Record<string, LocaleMetadata> = {
  en: { code: "en", name: "English", direction: "ltr", dateLocale: "en-US", numberLocale: "en-US" },
  ru: { code: "ru", name: "Русский", direction: "ltr", dateLocale: "ru-RU", numberLocale: "ru-RU" }
}

/** Направление письма для кода локали. Регион игнорируется, кроме случаев вроде `uz-AF`. */
export function localeDirection(code: NameLocale | undefined): "ltr" | "rtl" {
  if (!code) return "ltr"
  const normalized = String(code).replace(/_/g, "-")
  if (RTL_LANGUAGES.has(normalized)) return "rtl"
  return RTL_LANGUAGES.has(normalized.split("-")[0]) ? "rtl" : "ltr"
}

/**
 * Метаданные локали: встроенные — как заданы, остальные — выведенные из кода.
 *
 * Для неизвестного кода `dateLocale`/`numberLocale` равны самому коду: это ровно то, что ждут
 * `Intl.*` и `date-fns`, и лучше, чем `undefined`, который каждому вызывающему пришлось бы
 * подменять на `"en"`.
 */
export function resolveLocaleMetadata(code: NameLocale | undefined): LocaleMetadata {
  const normalized = code ? String(code) : "en"
  const builtIn = BUILT_IN[normalized]
  if (builtIn) return { ...builtIn }
  return {
    code: normalized,
    name: normalized,
    direction: localeDirection(normalized),
    dateLocale: normalized,
    numberLocale: normalized
  }
}

/** Метаданные всех встроенных локалей — для UI выбора языка. */
export function builtInLocales(): LocaleMetadata[] {
  return Object.values(BUILT_IN).map((meta) => ({ ...meta }))
}

export default BUILT_IN
