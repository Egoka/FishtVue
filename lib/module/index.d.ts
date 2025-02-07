import type { FishtVueConfiguration } from "fishtvue/config"

export type FishtVueModuleOptions = FishtVueConfiguration & {
  prefix?: string
}
declare module "@nuxt/schema" {
  interface AppConfigInput {
    fishtvue?: FishtVueModuleOptions
  }
  interface NuxtConfig {
    fishtvue?: FishtVueModuleOptions
  }
  interface NuxtOptions {
    fishtvue?: FishtVueModuleOptions
  }
}
