import { DeepPartial } from "../types"

export declare type NameLocale = string | "en" | "ru"
declare type Locale = Partial<{
  name: string
  code: NameLocale
}>
declare type TypeLocale = { [key: string]: string | string[] | TypeLocale }

export declare interface DefaultMessages extends DeepPartial<TypeLocale> {
  find: string
  copy: string
  requiredField: string
  noData: string
  noColumn: string
  noDataForQuery: string
}

export declare type Messages = DeepPartial<Record<NameLocale, DefaultMessages>>

export declare type Locales = Partial<{
  defaultLocale: NameLocale
  activeLocale: NameLocale
  locales: Array<Locale>
  messages: Messages
}>

export declare function switchLocale(activeLocale: NameLocale): string | boolean | undefined

declare let Locales: Messages

export default Locales
