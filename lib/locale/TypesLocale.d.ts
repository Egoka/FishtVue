import { DeepPartial } from "../types"

export declare type NameLocale = string | "en" | "ru"
declare type Locale = Partial<{
  name: string
  code: NameLocale
}>

/**
 * Метаданные локали — [locale.md Issues 4 и 6](../../Documentation/issues/locale.md).
 *
 * `NameLocale` остаётся открытым union'ом (закрывать его значило бы запретить пользовательские
 * локали), поэтому «что это за язык» описывается отдельным объектом, а не типом кода.
 */
export declare interface LocaleMetadata {
  /** Код локали (BCP 47), как он передаётся в `setActiveLocale`. */
  code: NameLocale
  /** Человекочитаемое имя на самом языке — для UI выбора локали. */
  name: string
  /** Направление письма. Выставляется на `<html dir>` при смене активной локали. */
  direction: "ltr" | "rtl"
  /** Строка локали для `date-fns` / `Intl.DateTimeFormat`. */
  dateLocale: string
  /** Строка локали для `Intl.NumberFormat`. */
  numberLocale: string
}
declare type TypeLocale = { [key: string]: string | string[] | TypeLocale }

export declare interface DefaultMessages extends DeepPartial<TypeLocale> {
  of: string
  items: string
  lines: string
  previous: string
  next: string
  save: string
  increase: string
  show: string
  find: string
  copy: string
  requiredField: string
  noData: string
  noColumn: string
  noDataForQuery: string
  clearAllFilters: string
  invalidEmail?: string
  invalidPhone?: string
  invalidNumeric?: string
  regexMismatch?: string
  valueOutOfRange?: string
  invalidLength?: string
  invalidField?: string
  compareMismatch?: string
  inputLayout?: {
    copied?: string
  }
  select?: {
    /** Pluralized template (Wave 3.5): `<selector> <text>`-формы через `|`, selector = `=N` либо CLDR-категория. Читается через `Component.t("select.resultsCount", { count })`. */
    resultsCount?: string
  }
  table?: {
    /** Pluralized template (Wave 3.5): `<selector> <text>`-формы через `|`, selector = `=N` либо CLDR-категория. Читается через `Component.t("table.resultsCount", { count })`. */
    resultsCount?: string
  }
  alert?: {
    close?: string
  }
  fixwindow?: {
    close?: string
  }
  loading?: {
    label?: string
  }
  pagination?: {
    label?: string
    page?: string
  }
  virtualScroller?: {
    loading?: string
  }
  textEditor?: {
    /** Подпись поля ввода ссылки в Quill-tooltip. Подставляется в `content` через CSS-переменную. */
    linkLabel?: string
    /** Подпись кнопки подтверждения ссылки. По умолчанию берётся из общего ключа `save`. */
    saveLabel?: string
  }
}

/**
 * Направление письма для кода локали (BCP 47). Регион игнорируется, кроме случаев,
 * где он и определяет письменность (`uz-AF`).
 */
export declare function localeDirection(code: NameLocale | undefined): "ltr" | "rtl"

/**
 * Метаданные локали: встроенные (`en`, `ru`) — как заданы, любые другие — выведенные из кода.
 * Для неизвестного кода `dateLocale`/`numberLocale` равны самому коду — это ровно то,
 * что ждут `Intl.*` и `date-fns`.
 */
export declare function resolveLocaleMetadata(code: NameLocale | undefined): LocaleMetadata

/** Метаданные всех встроенных локалей — для UI выбора языка. */
export declare function builtInLocales(): LocaleMetadata[]

export declare type Messages = DeepPartial<Record<NameLocale, DefaultMessages>>

export declare type Locales = Partial<{
  defaultLocale: NameLocale
  activeLocale: NameLocale
  locales: Array<Locale>
  messages: Messages
}>

// eslint-disable-next-line no-redeclare
declare let Locales: Messages

export default Locales
