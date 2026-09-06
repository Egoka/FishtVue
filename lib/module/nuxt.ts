import { addComponent, addPlugin, addPluginTemplate, createResolver, defineNuxtModule } from "@nuxt/kit"
import { fileURLToPath } from "node:url"
// Строго `node:path`: в монорепозитории есть legacy-пакет `path@0.12.7`, который перехватывает
// голый спецификатор `"path"` и падает на современном Node (`util.isString is not a function`).
import { dirname, join } from "node:path"
import { toFlatCase } from "fishtvue/utils/stringHandler"
import { fieldsOmit } from "fishtvue/utils/objectHandler"
import type { FishtVueOptions } from "fishtvue/module"

export default defineNuxtModule<FishtVueOptions>({
  meta: {
    name: "fishtvue",
    configKey: "fishtvue",
    compatibility: {
      nuxt: ">=3.0.0"
    }
  },
  defaults: {
    prefix: "",
    autoImport: true,
    disableGlobalStyles: false
  },
  setup(options, nuxt) {
    const parentDir = join(dirname(fileURLToPath(import.meta.url)), "..")

    const { resolve } = createResolver(parentDir)
    const { autoImport } = options
    const runtimeDir = resolve("./")
    if (nuxt.options.build?.transpile) nuxt.options.build.transpile.push(runtimeDir)
    if (nuxt.options.alias) nuxt.options.alias["#fishtvue"] = runtimeDir
    if (autoImport) {
      FISHT_VUE_COMPONENTS.forEach((componentName) =>
        addComponent({
          name: `${options.prefix}${componentName}`,
          filePath: join(runtimeDir, toFlatCase(componentName)),
          global: options.global,
          mode: options.mode
        })
      )
      // Compound-subcomponents (Issue 3): живут как named-экспорты внутри родительского модуля
      // (`fishtvue/table` → table.mjs), поэтому регистрируются через `export` + общий filePath —
      // в отличие от top-level компонентов с папкой на каждый.
      FISHT_VUE_SUBCOMPONENTS.forEach((sub) =>
        addComponent({
          name: `${options.prefix}${sub.name}`,
          filePath: join(runtimeDir, sub.from),
          export: sub.export,
          global: options.global,
          mode: options.mode
        })
      )
    }
    // Issue 5: `disableGlobalStyles: true` отключает SSR-инжект CSS — server-плагин
    // (`plugins/nuxt.mjs` пушит собранный `cssComponents` в `ssrContext.head`) не подключается.
    // Client-плагин конфигурации ниже остаётся: иначе компоненты потеряли бы config, локали и тему.
    if (!options.disableGlobalStyles) {
      addPlugin({
        src: resolve("./plugins/nuxt.mjs"),
        mode: "server"
      })
    }
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
  "Textarea",
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
  "Form",
  "VirtualScroller"
]
// Compound-дети (Issue 3) — named-экспорты модуля `fishtvue/table` (table.mjs). Pagination/Loading
// уже top-level в FISHT_VUE_COMPONENTS — для compound-override отдельная регистрация не нужна.
const FISHT_VUE_SUBCOMPONENTS: Array<{ name: string; from: string; export: string }> = [
  { name: "Column", from: "table", export: "Column" },
  { name: "ColumnGroup", from: "table", export: "ColumnGroup" },
  { name: "FormField", from: "form", export: "FormField" },
  { name: "FormSection", from: "form", export: "FormSection" },
  { name: "SelectOption", from: "select", export: "SelectOption" },
  { name: "SelectGroup", from: "select", export: "SelectGroup" },
  { name: "MenuItem", from: "menu", export: "MenuItem" },
  { name: "MenuGroup", from: "menu", export: "MenuGroup" },
  { name: "AccordionItem", from: "accordion", export: "AccordionItem" }
]
