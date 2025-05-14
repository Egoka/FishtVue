import * as _nuxt_schema from "@nuxt/schema"
import type { FishtVueConfiguration } from "fishtvue/config"
import type { AddComponentOptions } from "@nuxt/kit"

/**
 * Configuration options for the FishtVue module
 * @interface ModuleOptions
 */
type ModuleOptions = {
  /**
   * Determines whether components will be available globally
   * @type {AddComponentOptions["global"]}
   */
  global?: AddComponentOptions["global"]
  /**
   * Specifies the mode of component operation (client/server/all)
   * @type {AddComponentOptions["mode"]}
   */
  mode?: AddComponentOptions["mode"]
  /**
   * Prefix for auto-imported components
   * @type {string}
   */
  prefix?: string
  /**
   * Enable automatic component imports
   * @type {boolean}
   * @default true
   */
  autoImport?: boolean
  /**
   * Disable global styles
   * @type {boolean}
   * @default false
   */
  disableGlobalStyles?: boolean
}

/**
 * Complete FishtVue configuration combining base configuration and module options
 * @type {FishtVueConfiguration & ModuleOptions}
 */
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
