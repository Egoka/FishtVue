import { addComponent, addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit"
import { fileURLToPath } from "node:url"
import { dirname, join } from "path"
import type { FishtVueConfiguration } from "fishtvue/config"
import { toFlatCase } from "fishtvue/utils/stringHandler"

export type FishtVueModuleOptions = FishtVueConfiguration & {
  prefix?: string
  autoImport?: boolean
  disableGlobalStyles?: boolean
}
export default defineNuxtModule<FishtVueModuleOptions>({
  meta: {
    name: "fishtvue",
    configKey: "fishtvue",
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {
    prefix: "F",
    autoImport: true,
    disableGlobalStyles: false
  },
  setup(options, nuxt) {
    const parentDir = join(dirname(fileURLToPath(import.meta.url)), "..")

    const { resolve } = createResolver(parentDir)
    const { autoImport } = options
    const runtimeDir = resolve("./")
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.alias["#fishtvue"] = runtimeDir

    if (autoImport)
      FishtVueComponents.forEach((componentName) =>
        addComponent({
          name: `${options.prefix}${componentName}`,
          filePath: join(runtimeDir, toFlatCase(componentName))
        })
      )
    addPlugin({
      src: resolve("./plugins/nuxt.mjs"),
      mode: "server"
    })
  }
})
const FishtVueComponents = [
  "Accordion",
  "Alert",
  "Aria",
  "Badge",
  "Button",
  "Calendar",
  "Dialog",
  "FixWindow",
  "Icons",
  "Input",
  "InputLayout",
  "Label",
  "Loading",
  "Menu",
  "Pagination",
  "Select",
  "Separator",
  "Split",
  "Switch",
  "Table",
  "TextEditor",
  "Form"
]
