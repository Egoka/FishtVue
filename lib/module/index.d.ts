import * as _nuxt_schema from "@nuxt/schema"
import type { FishtVueConfiguration } from "fishtvue/config"
import type { AddComponentOptions } from "@nuxt/kit"

type ModuleOptions = {
  global?: AddComponentOptions["global"]
  mode?: AddComponentOptions["mode"]
  prefix?: string
  autoImport?: boolean
  disableGlobalStyles?: boolean
}
export type FishtVueOptions = FishtVueConfiguration & ModuleOptions
declare module "@nuxt/schema" {
  interface NuxtConfig {
    fishtvue?: FishtVueOptions
  }
  interface NuxtOptions {
    fishtvue?: FishtVueOptions
  }
}

declare const _default: _nuxt_schema.NuxtModule<FishtVueOptions, FishtVueOptions, false>

export default _default
