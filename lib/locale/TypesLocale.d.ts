import { DeepPartial } from "../types"

export declare type NameLocale = string | "en" | "ru"
declare type Locale = Partial<{
  name: string
  code: NameLocale
}>
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
    /** @deprecated С Wave 3.5 формы единичного/нулевого результата кодируются прямо в `resultsCount` (`=0`/`one`). Оставлено для backward compat. */
    resultsCountOne?: string
    /** @deprecated С Wave 3.5 формы единичного/нулевого результата кодируются прямо в `resultsCount` (`=0`/`one`). Оставлено для backward compat. */
    resultsCountNone?: string
  }
  table?: {
    /** Pluralized template (Wave 3.5): `<selector> <text>`-формы через `|`, selector = `=N` либо CLDR-категория. Читается через `Component.t("table.resultsCount", { count })`. */
    resultsCount?: string
    /** @deprecated С Wave 3.5 формы единичного/нулевого результата кодируются прямо в `resultsCount` (`=0`/`one`). Оставлено для backward compat. */
    resultsCountOne?: string
    /** @deprecated С Wave 3.5 формы единичного/нулевого результата кодируются прямо в `resultsCount` (`=0`/`one`). Оставлено для backward compat. */
    resultsCountNone?: string
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
}

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
