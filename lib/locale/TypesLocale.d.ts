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
}

export declare type Messages = DeepPartial<Record<NameLocale, DefaultMessages>>

export declare type Locales = Partial<{
  defaultLocale: NameLocale
  activeLocale: NameLocale
  locales: Array<Locale>
  messages: Messages
}>

declare let Locales: Messages

export default Locales
