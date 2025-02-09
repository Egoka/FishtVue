import { addComponent, addPlugin, addPluginTemplate, createResolver, defineNuxtModule } from "@nuxt/kit"
import { fileURLToPath } from "node:url"
import { dirname, join } from "path"
import { toFlatCase } from "fishtvue/utils/stringHandler"
import { fieldsOmit } from "fishtvue/utils/objectHandler"
import type { FishtVueOptions } from "fishtvue/module"

export default defineNuxtModule<FishtVueOptions>({
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
    // @ts-ignore
    // nuxt.options.fishtvue = options
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.alias["#fishtvue"] = runtimeDir

    if (autoImport)
      FISHT_VUE_COMPONENTS.forEach((componentName) =>
        addComponent({
          name: `${options.prefix}${componentName}`,
          filePath: join(runtimeDir, toFlatCase(componentName)),
          global: options.global,
          mode: options.mode
        })
      )
    addPlugin({
      src: resolve("./plugins/nuxt.mjs"),
      mode: "server"
    })
    addPluginTemplate({
      filename: "fishtvue.all.mjs",
      mode: "all",
      getContents({ options }) {
        return `
import { defineNuxtPlugin } from '#app'
import FishtVue from "fishtvue/config"
export default defineNuxtPlugin((nuxtApp) => {
  const options = ${JSON.stringify(options)}
  nuxtApp.vueApp.use(FishtVue, options)
})
`
      },
      options: fieldsOmit<FishtVueOptions>(options, MODULE_OPTIONS)
    })
  }
})

const MODULE_OPTIONS = ["global", "mode", "prefix", "autoImport", "disableGlobalStyles"]
const FISHT_VUE_COMPONENTS = [
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
