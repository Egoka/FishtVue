// rollup.config.js
// =====================================================================================================================
import fs from "fs-extra"
import path from "path"
// =====================================================================================================================
import vue from "@vitejs/plugin-vue"
import postcss from "rollup-plugin-postcss"
import postcssPresetEnv from "postcss-preset-env"
import postcssSelectorParser from "postcss-selector-parser"
import terser from "@rollup/plugin-terser"
import { babel } from "@rollup/plugin-babel"
import typescript from "rollup-plugin-typescript2"
import cleanup from "rollup-plugin-cleanup"
// =====================================================================================================================
const entries = []
const core = {}
// =====================================================================================================================
const PROJECT_NAME = "fishtvue"
// const CORE_LIB_DIR = "lib"
const OUTPUT_LIB_DIR = "../dist"
// =====================================================================================================================
const POSTCSS_PLUGIN_OPTIONS = {
  modules: false, // Обрабатывает scoped стили
  minimize: true,
  plugins: [
    postcssPresetEnv({
      selectorParser: postcssSelectorParser,
      selectors: true
    })
  ],
  sourceMap: false
}
const TERSER_PLUGIN_OPTIONS = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    reduce_funcs: false
  }
}
const BABEL_PLUGIN_OPTIONS = {
  extensions: [".js", ".vue"],
  exclude: "node_modules/**",
  presets: ["@babel/preset-env"],
  plugins: [],
  skipPreflightCheck: true,
  babelHelpers: "runtime",
  babelrc: false
}
const EXTERNAL = [
  "vue",
  "path",
  "node:url",
  "@nuxt/kit",
  "@heroicons/vue/20/solid",
  "@heroicons/vue/20/outline",
  "@heroicons/vue/24/solid",
  "@heroicons/vue/24/outline",
  "@vueup/vue-quill",
  "@vueup/vue-quill/dist/vue-quill.snow.css",
  "@vueup/vue-quill/dist/vue-quill.bubble.css",
  "@iconify/vue",
  "date-fns/locale",
  "date-fns",
  "v-calendar",
  "v-calendar/style.css",
  "nuxt/app",
  "tailwind-merge",
  "clsx",
  "lodash-es",
  "gsap"
]
const EXTERNAL_CORE_DEPENDENCIES = {
  "accordion/Accordion.vue": "accordion",
  "alert/Alert.vue": "alert",
  "aria/Aria.vue": "aria",
  "badge/Badge.vue": "badge",
  "button/Button.vue": "button",
  "calendar/Calendar.vue": "calendar",
  "dialog/Dialog.vue": "dialog",
  "fixwindow/FixWindow.vue": "fixwindow",
  "icons/Icons.vue": "icons",
  "input/Input.vue": "input",
  "inputlayout/InputLayout.vue": "inputlayout",
  "label/Label.vue": "label",
  "loading/Loading.vue": "loading",
  "menu/Menu.vue": "menu",
  "pagination/Pagination.vue": "pagination",
  "select/Select.vue": "select",
  "separator/Separator.vue": "separator",
  "split/Split.vue": "split",
  "switch/Switch.vue": "switch",
  "table/Table.vue": "table",
  "texteditor/TextEditor.vue": "texteditor",
  "form/Form.vue": "form",
  "virtualscroller/VirtualScroller.vue": "virtualscroller"
}
const EXTERNAL_FULL_CODE = {
  '\\.\\/(epic|svg)\\/[^"]+\\.vue': (match) => match.replace(".vue", ".mjs")
}
const RENAME_DEPENDENCIES = {
  component: "component/component.mjs",
  accordion: "accordion/accordion.mjs",
  alert: "alert/alert.mjs",
  aria: "aria/aria.mjs",
  badge: "badge/badge.mjs",
  button: "button/button.mjs",
  calendar: "calendar/calendar.mjs",
  dialog: "dialog/dialog.mjs",
  fixwindow: "fixwindow/fixwindow.mjs",
  icons: "icons/icons.mjs",
  input: "input/input.mjs",
  inputlayout: "inputlayout/inputlayout.mjs",
  label: "label/label.mjs",
  loading: "loading/loading.mjs",
  menu: "menu/menu.mjs",
  pagination: "pagination/pagination.mjs",
  select: "select/select.mjs",
  separator: "separator/separator.mjs",
  split: "split/split.mjs",
  switch: "switch/switch.mjs",
  table: "table/table.mjs",
  texteditor: "texteditor/texteditor.mjs",
  form: "form/form.mjs",
  virtualscroller: "virtualscroller/virtualscroller.mjs",
  theme: "theme/theme.mjs",
  "utils/domHandler": "utils/domHandler.mjs",
  "utils/colorsHandler": "utils/colorsHandler.mjs",
  "utils/rulesHandler": "utils/rulesHandler.mjs",
  "utils/dateHandler": "utils/dateHandler.mjs",
  "utils/arrayHandler": "utils/arrayHandler.mjs",
  "utils/numberHandler": "utils/numberHandler.mjs",
  "utils/stringHandler": "utils/stringHandler.mjs",
  "utils/objectHandler": "utils/objectHandler.mjs",
  "utils/functionHandler": "utils/functionHandler.mjs",
  "utils/tailwindHandler": "utils/tailwindHandler.mjs",
  "utils/uniqueCollection": "utils/uniqueCollection.mjs",
  "theme/primitive": "theme/primitive.mjs",
  "theme/semantic": "theme/semantic.mjs",
  "theme/uno": "theme/uno.mjs"
}
const EXTERNAL_RENAME_DEPENDENCIES = {}

// =====================================================================================================================
function replaceComponentImportPaths() {
  return {
    name: "replace-component-import-paths",
    transform(code, id) {
      if (id.endsWith(".vue") || id.endsWith(".ts")) {
        const reg = new RegExp(`"${PROJECT_NAME}\\/(${Object.keys(EXTERNAL_CORE_DEPENDENCIES).join("|")})"`, "gm")
        if (!reg.test(code)) return null
        const modifiedCode = code.replace(reg, (match, component) =>
          component ? `"${PROJECT_NAME}/${EXTERNAL_CORE_DEPENDENCIES[component]}"` : match
        )
        return { code: modifiedCode, map: null }
      }
      return null
    }
  }
}

function replaceImportPaths() {
  return {
    name: "replace-import-paths",
    transform(code) {
      const reg = new RegExp(
        `"${PROJECT_NAME}\\/(?<internal>${Object.keys(RENAME_DEPENDENCIES).join("|")})"|"(?<external>${Object.keys(EXTERNAL_RENAME_DEPENDENCIES).join("|")})"`,
        "gm"
      )
      if (!reg.test(code)) return null
      const modifiedCode = code.replace(reg, (match, component, group, position, allCode, groups) =>
        groups?.internal
          ? `"${PROJECT_NAME}/${RENAME_DEPENDENCIES[groups?.internal]}"`
          : groups?.external
            ? `"${EXTERNAL_RENAME_DEPENDENCIES[groups?.external]}"`
            : match
      )
      return { code: modifiedCode, map: null }
    }
  }
}

function replaceCode() {
  return {
    name: "replace-code",
    transform(code) {
      let modifiedCode = code
      let hasChanges = false

      for (const [searchPattern, replaceFn] of Object.entries(EXTERNAL_FULL_CODE)) {
        const regex = new RegExp(searchPattern, "g")
        if (regex.test(modifiedCode)) {
          modifiedCode = modifiedCode.replace(regex, replaceFn)
          hasChanges = true
        }
      }
      if (!hasChanges) return null
      return { code: modifiedCode, map: null }
    }
  }
}

function onWarn(message) {
  if (message.code === "UNUSED_EXTERNAL_IMPORT" && message.exporter === "vue") return ""
  else if (message.code === "CIRCULAR_DEPENDENCY") {
    if (message.message.endsWith("lib/alert/Alert.vue")) return ""
  } else console.error(message.message)
}

const GLOBAL_DEPENDENCIES = {
  "v-calendar": "vCalendar",
  "tailwind-merge": "tailwindMerge",
  "lodash-es": "lodash-es",
  "date-fns": "date-fns",
  clsx: "clsx",
  gsap: "gsap",
  vue: "Vue"
}
const CORE_DEPENDENCIES = JSON.parse(`{
  "${PROJECT_NAME}/config": "${PROJECT_NAME}.config",
  "${PROJECT_NAME}/config/index": "${PROJECT_NAME}.config.index",
  "${PROJECT_NAME}/component": "${PROJECT_NAME}.component",
  "${PROJECT_NAME}/component/component.mjs": "${PROJECT_NAME}.component.component.mjs",
  "${PROJECT_NAME}/types": "${PROJECT_NAME}.types",
  "${PROJECT_NAME}/accordion": "${PROJECT_NAME}.accordion",
  "${PROJECT_NAME}/accordion/accordion.mjs": "${PROJECT_NAME}.accordion.accordion.mjs",
  "${PROJECT_NAME}/alert": "${PROJECT_NAME}.alert",
  "${PROJECT_NAME}/alert/alert.mjs": "${PROJECT_NAME}.alert.alert.mjs",
  "${PROJECT_NAME}/aria": "${PROJECT_NAME}.aria",
  "${PROJECT_NAME}/aria/aria.mjs": "${PROJECT_NAME}.aria.aria.mjs",
  "${PROJECT_NAME}/badge": "${PROJECT_NAME}.badge",
  "${PROJECT_NAME}/badge/badge.mjs": "${PROJECT_NAME}.badge.badge.mjs",
  "${PROJECT_NAME}/button": "${PROJECT_NAME}.button",
  "${PROJECT_NAME}/button/button.mjs": "${PROJECT_NAME}.button.button.mjs",
  "${PROJECT_NAME}/calendar": "${PROJECT_NAME}.calendar",
  "${PROJECT_NAME}/calendar/calendar.mjs": "${PROJECT_NAME}.calendar.calendar.mjs",
  "${PROJECT_NAME}/dialog": "${PROJECT_NAME}.dialog",
  "${PROJECT_NAME}/dialog/dialog.mjs": "${PROJECT_NAME}.dialog.dialog.mjs",
  "${PROJECT_NAME}/fixwindow": "${PROJECT_NAME}.fixwindow",
  "${PROJECT_NAME}/fixwindow/fixwindow.mjs": "${PROJECT_NAME}.fixwindow.fixwindow.mjs",
  "${PROJECT_NAME}/icons": "${PROJECT_NAME}.icons",
  "${PROJECT_NAME}/icons/icons.mjs": "${PROJECT_NAME}.icons.icons.mjs",
  "${PROJECT_NAME}/input": "${PROJECT_NAME}.input",
  "${PROJECT_NAME}/input/input.mjs": "${PROJECT_NAME}.input.input.mjs",
  "${PROJECT_NAME}/inputlayout": "${PROJECT_NAME}.inputlayout",
  "${PROJECT_NAME}/inputlayout/inputlayout.mjs": "${PROJECT_NAME}.inputlayout.inputlayout.mjs",
  "${PROJECT_NAME}/label": "${PROJECT_NAME}.label",
  "${PROJECT_NAME}/label/label.mjs": "${PROJECT_NAME}.label.label.mjs",
  "${PROJECT_NAME}/loading": "${PROJECT_NAME}.loading",
  "${PROJECT_NAME}/loading/loading.mjs": "${PROJECT_NAME}.loading.loading.mjs",
  "${PROJECT_NAME}/menu": "${PROJECT_NAME}.menu",
  "${PROJECT_NAME}/menu/menu.mjs": "${PROJECT_NAME}.menu.menu.mjs",
  "${PROJECT_NAME}/pagination": "${PROJECT_NAME}.pagination",
  "${PROJECT_NAME}/pagination/pagination.mjs": "${PROJECT_NAME}.pagination.pagination.mjs",
  "${PROJECT_NAME}/select": "${PROJECT_NAME}.select",
  "${PROJECT_NAME}/select/select.mjs": "${PROJECT_NAME}.select.select.mjs",
  "${PROJECT_NAME}/separator": "${PROJECT_NAME}.separator",
  "${PROJECT_NAME}/separator/separator.mjs": "${PROJECT_NAME}.separator.separator.mjs",
  "${PROJECT_NAME}/split": "${PROJECT_NAME}.split",
  "${PROJECT_NAME}/split/split.mjs": "${PROJECT_NAME}.split.split.mjs",
  "${PROJECT_NAME}/switch": "${PROJECT_NAME}.switch",
  "${PROJECT_NAME}/switch/switch.mjs": "${PROJECT_NAME}.switch.switch.mjs",
  "${PROJECT_NAME}/table": "${PROJECT_NAME}.table",
  "${PROJECT_NAME}/table/table.mjs": "${PROJECT_NAME}.table.table.mjs",
  "${PROJECT_NAME}/texteditor": "${PROJECT_NAME}.texteditor",
  "${PROJECT_NAME}/texteditor/texteditor.mjs": "${PROJECT_NAME}.texteditor.texteditor.mjs",
  "${PROJECT_NAME}/form": "${PROJECT_NAME}.form",
  "${PROJECT_NAME}/form/form.mjs": "${PROJECT_NAME}.form.form.mjs",
  "${PROJECT_NAME}/virtualscroller": "${PROJECT_NAME}.virtualscroller",
  "${PROJECT_NAME}/virtualscroller/virtualscroller.mjs": "${PROJECT_NAME}.virtualscroller.virtualscroller.mjs",
  "${PROJECT_NAME}/utils/domHandler": "${PROJECT_NAME}.utils.domHandler",
  "${PROJECT_NAME}/utils/domHandler.mjs": "${PROJECT_NAME}.utils.domHandler.mjs",
  "${PROJECT_NAME}/utils/colorsHandler": "${PROJECT_NAME}.utils.colorsHandler",
  "${PROJECT_NAME}/utils/colorsHandler.mjs": "${PROJECT_NAME}.utils.colorsHandler.mjs",
  "${PROJECT_NAME}/utils/rulesHandler": "${PROJECT_NAME}.utils.rulesHandler",
  "${PROJECT_NAME}/utils/rulesHandler.mjs": "${PROJECT_NAME}.utils.rulesHandler.mjs",
  "${PROJECT_NAME}/utils/dateHandler": "${PROJECT_NAME}.utils.dateHandler",
  "${PROJECT_NAME}/utils/dateHandler.mjs": "${PROJECT_NAME}.utils.dateHandler.mjs",
  "${PROJECT_NAME}/utils/arrayHandler": "${PROJECT_NAME}.utils.arrayHandler",
  "${PROJECT_NAME}/utils/arrayHandler.mjs": "${PROJECT_NAME}.utils.arrayHandler.mjs",
  "${PROJECT_NAME}/utils/numberHandler": "${PROJECT_NAME}.utils.numberHandler",
  "${PROJECT_NAME}/utils/numberHandler.mjs": "${PROJECT_NAME}.utils.numberHandler.mjs",
  "${PROJECT_NAME}/utils/stringHandler": "${PROJECT_NAME}.utils.stringHandler",
  "${PROJECT_NAME}/utils/stringHandler.mjs": "${PROJECT_NAME}.utils.stringHandler.mjs",
  "${PROJECT_NAME}/utils/objectHandler": "${PROJECT_NAME}.utils.objectHandler",
  "${PROJECT_NAME}/utils/objectHandler.mjs": "${PROJECT_NAME}.utils.objectHandler.mjs",
  "${PROJECT_NAME}/utils/functionHandler": "${PROJECT_NAME}.utils.functionHandler",
  "${PROJECT_NAME}/utils/functionHandler.mjs": "${PROJECT_NAME}.utils.functionHandler.mjs",
  "${PROJECT_NAME}/utils/tailwindHandler": "${PROJECT_NAME}.utils.tailwindHandler",
  "${PROJECT_NAME}/utils/tailwindHandler.mjs": "${PROJECT_NAME}.utils.tailwindHandler.mjs",
  "${PROJECT_NAME}/utils/uniqueCollection": "${PROJECT_NAME}.utils.uniqueCollection",
  "${PROJECT_NAME}/utils/uniqueCollection.mjs": "${PROJECT_NAME}.utils.uniqueCollection.mjs",
  "${PROJECT_NAME}/utils": "${PROJECT_NAME}.utils",
  "${PROJECT_NAME}/plugins/nuxt": "${PROJECT_NAME}.plugins.nuxt",
  "${PROJECT_NAME}/plugins": "${PROJECT_NAME}.plugins",
  "${PROJECT_NAME}/modules/nuxt": "${PROJECT_NAME}.modules.nuxt",
  "${PROJECT_NAME}/modules": "${PROJECT_NAME}.modules",
  "${PROJECT_NAME}/locale": "${PROJECT_NAME}.locale",
  "${PROJECT_NAME}/locale/locale": "${PROJECT_NAME}.locale.locale",
  "${PROJECT_NAME}/theme": "${PROJECT_NAME}.theme",
  "${PROJECT_NAME}/theme/theme.mjs": "${PROJECT_NAME}.theme.theme.mjs",
  "${PROJECT_NAME}/theme/themes/Aurora": "${PROJECT_NAME}.theme.themes.Aurora",
  "${PROJECT_NAME}/theme/themes/Harmony": "${PROJECT_NAME}.theme.themes.Harmony",
  "${PROJECT_NAME}/theme/themes/Sapphire": "${PROJECT_NAME}.theme.themes.Sapphire",
  "${PROJECT_NAME}/theme/uno": "${PROJECT_NAME}.theme.uno",
  "${PROJECT_NAME}/theme/uno.mjs": "${PROJECT_NAME}.theme.uno.mjs",
  "${PROJECT_NAME}/theme/primitive": "${PROJECT_NAME}.theme.primitive",
  "${PROJECT_NAME}/theme/primitive.mjs": "${PROJECT_NAME}.theme.primitive.mjs",
  "${PROJECT_NAME}/theme/semantic": "${PROJECT_NAME}.theme.semantic",
  "${PROJECT_NAME}/theme/semantic.mjs": "${PROJECT_NAME}.theme.semantic.mjs"
}`)
const EXPORT_DEPENDENCIES = []
const GLOBAL_COMPONENT_DEPENDENCIES = {
  ...GLOBAL_DEPENDENCIES,
  ...CORE_DEPENDENCIES
}
// =====================================================================================================================
const PLUGINS = [
  replaceComponentImportPaths(),
  vue(),
  typescript({
    tsconfig: "./tsconfig.rollup.json",
    tsconfigOverride: { compilerOptions: { noImplicitAny: false } },
    exclude: [
      "**/doc/**",
      "**/docs/**",
      "**/sandbox/**",
      "**/sandbox-nuxt/**",
      "**/**/*.test.ts",
      "**/node_modules/v-calendar/**"
    ]
  }),
  postcss(POSTCSS_PLUGIN_OPTIONS),
  babel(BABEL_PLUGIN_OPTIONS),
  replaceImportPaths(),
  replaceCode(),
  cleanup({ extensions: ["mjs", "ts"] })
]
const EXTERNAL_COMPONENT = (id) => {
  return (
    EXTERNAL.includes(id) ||
    Object.keys(CORE_DEPENDENCIES).includes(id) ||
    id.startsWith("./svg/") ||
    id.startsWith("./epic/")
  )
}
// =====================================================================================================================
function addEntry(folder, inFile, outFile) {
  const exports = EXPORT_DEPENDENCIES.includes(inFile) ? "named" : "auto"
  const useCorePlugin = Object.keys(GLOBAL_COMPONENT_DEPENDENCIES).some(
    (d) => d.replace(`${PROJECT_NAME}/`, "") === folder
  )
  const output = `./${OUTPUT_LIB_DIR}/${folder}/${outFile}`

  const getEntry = (isMinify) => {
    return {
      input: `${folder}/${inFile}`,
      plugins: [...PLUGINS, isMinify && terser(TERSER_PLUGIN_OPTIONS), useCorePlugin && corePlugin()],
      external: EXTERNAL_COMPONENT
    }
  }
  // @typescript-eslint/no-unused-vars
  const get_ES = (isMinify) => {
    return {
      ...getEntry(isMinify),
      onwarn: onWarn,
      output: [
        {
          format: "es",
          file: `${output}${isMinify ? ".min" : ""}.mjs`,
          sourcemap: true,
          exports
        }
      ]
    }
  }

  // @typescript-eslint/no-unused-vars
  const get_CJS_ESM = (isMinify) => {
    return {
      ...getEntry(isMinify),
      output: [
        {
          format: "cjs",
          file: `${output}.cjs${isMinify ? ".min" : ""}.js`,
          exports
        },
        {
          format: "esm",
          file: `${output}.esm${isMinify ? ".min" : ""}.js`,
          exports
        }
      ]
    }
  }

  // @typescript-eslint/no-unused-vars
  const get_IIFE = (isMinify) => {
    return {
      ...getEntry(isMinify),
      output: [
        {
          format: "iife",
          name: `${PROJECT_NAME}.${folder.replaceAll("/", ".")}`,
          file: `${output}${isMinify ? ".min" : ""}.js`,
          globals: GLOBAL_COMPONENT_DEPENDENCIES,
          exports
        }
      ]
    }
  }

  entries.push(get_ES())
  // entries.push(get_CJS_ESM())
  // entries.push(get_IIFE())
}

// =====================================================================================================================
function corePlugin() {
  return {
    name: "corePlugin",
    generateBundle(outputOptions, bundle) {
      const { name, format } = outputOptions

      if (format === "iife") {
        Object.keys(bundle).forEach((id) => {
          const chunk = bundle[id]
          const folderName = name.replace(`${PROJECT_NAME}.`, "").replaceAll(".", "/")
          const filePath = `./${OUTPUT_LIB_DIR}/core/core${id.indexOf(".min.js") > 0 ? ".min.js" : ".js"}`

          if (core[filePath]) {
            core[filePath][folderName] = chunk.code
          } else {
            core[filePath] = { [`${folderName}`]: chunk.code }
          }
        })
      }
    }
  }
}

// =====================================================================================================================
// Компоненты с compound-API: собираются из index.ts (бандлят родителя + renderless-детей и реестр типов
// в {name}.mjs как named-экспорты) — см. явные addEntry(name, "index.ts", name) ниже. Авто-SFC-сборка их пропускает.
const COMPOUND_ENTRIES = ["table", "menu", "form", "select"]
// @typescript-eslint/no-unused-vars
function addSFC(coreDir) {
  fs.readdirSync(new URL(coreDir, import.meta.url).pathname, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .forEach(({ name: folderName }) => {
      if (COMPOUND_ENTRIES.includes(folderName)) return
      fs.readdirSync(new URL(`${coreDir}/${folderName}`, import.meta.url).pathname).forEach((file) => {
        const name = file.split(/(.vue)$|(.js)$/)[0].toLowerCase()
        if (/\.vue$/.test(file) && name === folderName) {
          addEntry(folderName, file, name)
        }
      })
    })
}

function addLoadingVariants(dir, outDir) {
  fs.readdirSync(new URL(dir, import.meta.url).pathname, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.endsWith(".vue"))
    .forEach((file) => {
      const name = file.name.replace(".vue", "")
      addEntry(outDir, file.name, name)
    })
}
// =====================================================================================================================
// @typescript-eslint/no-unused-vars
function addUtils() {
  addEntry("utils", "Utils.ts", "utils")
  const utilsHandlers = [
    "stringHandler",
    "numberHandler",
    "objectHandler",
    "arrayHandler",
    "dateHandler",
    "functionHandler",
    "tailwindHandler",
    "uniqueCollection",
    "colorsHandler",
    "rulesHandler",
    "domHandler"
  ]
  utilsHandlers.forEach((name) => addEntry("utils", `${name}.ts`, `${name}`))
}

// @typescript-eslint/no-unused-vars
function addBaseComponent() {
  addEntry("component", "index.ts", "component")
}

// @typescript-eslint/no-unused-vars
function addTheme() {
  addEntry("theme", "index.ts", "theme")
  addEntry("theme", "uno.ts", "uno")
  addEntry("theme", "semantic.ts", "semantic")
  addEntry("theme", "primitive.ts", "primitive")
  const themes = ["Aurora", "Harmony", "Sapphire"]
  themes.forEach((name) => addEntry("theme/themes", `${name}.ts`, `${name}`))
}

// @typescript-eslint/no-unused-vars
function addLocale() {
  addEntry("locale", "index.ts", "locale")
}

// @typescript-eslint/no-unused-vars
function addConfig() {
  addEntry("config", "index.ts", "config")
}

// @typescript-eslint/no-unused-vars
function addPlugins() {
  addEntry("plugins", "Plugins.ts", "plugins")
  const utilsHandlers = ["nuxt"]
  utilsHandlers.forEach((name) => addEntry("plugins", `${name}.ts`, `${name}`))
}

// @typescript-eslint/no-unused-vars
function addModules() {
  addEntry("module", "nuxt.ts", "index")
}

// @typescript-eslint/no-unused-vars
function addIndex() {
  addEntry("./", "index.ts", "index")
}

// @typescript-eslint/no-unused-vars
function copyDependencies(inFolder, outFolder) {
  fs.readdirSync(new URL(inFolder, import.meta.url).pathname, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .forEach(({ name: folderName }) => {
      fs.readdirSync(new URL(inFolder + folderName, import.meta.url).pathname).forEach((file) => {
        // Issue 14 (K52): не тащим test-артефакты (*.test.d.ts) в публикуемый пакет.
        if (file.includes(".test.")) return
        const srcPath = new URL(inFolder + folderName, import.meta.url).pathname + "/" + file
        const outPath = outFolder + folderName + "/" + file
        if (file === "package.json") {
          // Issue 5b (A2): помечаем под-пакет side-effect-free для tree-shaking точечных
          // импортов `fishtvue/{name}` — CSS инжектится в рантайме (lifecycle), не на import-time.
          const subPkg = fs.readJsonSync(srcPath)
          if (subPkg && subPkg.sideEffects === undefined) subPkg.sideEffects = false
          fs.ensureDirSync(outFolder + folderName)
          fs.writeFileSync(outPath, JSON.stringify(subPkg, null, "  "))
        } else if (file.endsWith(".d.ts")) {
          fs.copySync(srcPath, outPath)
        }
      })
    })
}

// Issue 5c-b (A4-5): корневая `exports`-карта.
// БЕЗ карты пакет резолвится только в бандлерах (через folder-`main`); в pure Node ESM
// `import "fishtvue/menu"` / `"fishtvue/config"` падают (directory import not supported).
// Карта генерируется из АВТОРИТЕТНОГО списка `entries` (.mjs-выходы rollup, populated до этого
// вызова) + уже скопированных вложенных `package.json`/`.d.ts` (copyDependencies идёт раньше).
// Стратегия — ЯВНЫЕ entry на каждый emitted `.mjs` (identity `*.mjs` + extensionless) + bare-dir
// из вложенного package.json. Нулевая wildcard-неоднозначность, гарантированный strict superset
// текущей резолюции (обходит проблему lowercase-`.mjs` vs PascalCase-`.d.ts`).
function buildRootExports() {
  const toRel = (f) => {
    const m = String(f).match(/dist\/(.+)$/)
    if (!m) return null
    return m[1].replace(/\/{2,}/g, "/").replace(/(^|\/)\.\//g, "$1")
  }
  const mjs = [
    ...new Set(
      entries.map((e) => toRel(e?.output?.[0]?.file)).filter((p) => p && p.endsWith(".mjs") && !p.endsWith(".map"))
    )
  ]
  const exp = {
    ".": { types: "./index.d.ts", import: "./index.mjs", default: "./index.mjs" },
    "./package.json": "./package.json",
    "./types": { types: "./types.d.ts" }
  }
  for (const rel of mjs) {
    if (rel === "index.mjs") continue
    // explicit `.mjs` (identity) — self-referential импорты бандла + явный deep-импорт потребителя
    exp[`./${rel}`] = { import: `./${rel}`, default: `./${rel}` }
    // extensionless субпуть (`fishtvue/utils/domHandler`) — types если есть парный `.d.ts`
    const noExt = rel.slice(0, -4)
    const e = { import: `./${rel}`, default: `./${rel}` }
    exp[`./${noExt}`] = fs.existsSync(path.resolve(OUTPUT_LIB_DIR, `${noExt}.d.ts`))
      ? { types: `./${noExt}.d.ts`, ...e }
      : e
  }
  // bare directory субпуть (`fishtvue/table`, `fishtvue/config`) из вложенного package.json —
  // даёт корректный PascalCase `types` (Table.d.ts) без wildcard-несовпадения с lowercase `.mjs`.
  for (const d of fs.readdirSync(OUTPUT_LIB_DIR, { withFileTypes: true })) {
    if (!d.isDirectory()) continue
    const pj = path.resolve(OUTPUT_LIB_DIR, d.name, "package.json")
    if (!fs.existsSync(pj)) continue
    const sub = fs.readJsonSync(pj)
    const main = String(sub.module || sub.main || "").replace(/^\.\//, "")
    if (!main) continue
    const e = { import: `./${d.name}/${main}`, default: `./${d.name}/${main}` }
    exp[`./${d.name}`] = sub.types ? { types: `./${d.name}/${String(sub.types).replace(/^\.\//, "")}`, ...e } : e
  }
  // доступ к вложенным package.json (читают некоторые resolver'ы/инструменты)
  exp["./*/package.json"] = "./*/package.json"
  return exp
}

// @typescript-eslint/no-unused-vars
function addPackageJson() {
  const packageJson = fs.readJsonSync(`./package.json`)
  if (packageJson) {
    if (packageJson?.["type"]) delete packageJson["type"]
  }
  // Issue 5c-b: инъекция корневой exports-карты (генерится из dist-выходов, см. buildRootExports).
  packageJson.exports = buildRootExports()
  !fs.existsSync(OUTPUT_LIB_DIR) && fs.mkdirSync(OUTPUT_LIB_DIR)
  fs.writeFileSync(path.resolve(OUTPUT_LIB_DIR, "package.json"), JSON.stringify(packageJson, null, "  "))
}

// @typescript-eslint/no-unused-vars
async function createDir(dir) {
  try {
    await fs.emptyDir(dir)
  } catch (err) {
    console.error(err)
  }
}

// =====================================================================================================================
function start() {
  fs.copySync(new URL(`./index.d.ts`, import.meta.url).pathname, `${OUTPUT_LIB_DIR}/index.d.ts`)
  fs.copySync(new URL(`./types.d.ts`, import.meta.url).pathname, `${OUTPUT_LIB_DIR}/types.d.ts`)
  fs.copySync(new URL("./../README.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/README.md`)
  fs.copySync(new URL("./../LICENSE.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/LICENSE.md`)
  fs.copySync(new URL("./../CHANGELOG.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/CHANGELOG.md`)
}

// =====================================================================================================================
await createDir(OUTPUT_LIB_DIR)
start()
addUtils()
addBaseComponent()
addTheme()
addLocale()
addConfig()
addSFC(`./`)
addEntry("table", "index.ts", "table") // compound entry: default Table + named Column/ColumnGroup
addEntry("menu", "index.ts", "menu") // compound entry: default Menu + named MenuItem/MenuGroup
addEntry("form", "index.ts", "form") // compound entry: default Form + named FormField/FormSection + registerFieldType
addEntry("select", "index.ts", "select") // compound entry: default Select + named SelectOption/SelectGroup
addLoadingVariants("./loading/svg", "loading/svg")
addLoadingVariants("./loading/epic", "loading/epic")
// addEntry("accordion", "Accordion.vue", "accordion")
// addEntry("alert", "Alert.vue", "alert")
// addEntry("aria", "Aria.vue", "aria")
// addEntry("badge", "Badge.vue", "badge")
// addEntry("button", "Button.vue", "button")
// addEntry("calendar", "Calendar.vue", "calendar")
// addEntry("dialog", "Dialog.vue", "dialog")
// addEntry("fixwindow", "FixWindow.vue", "fixwindow")
// addEntry("form", "Form.vue", "form")
// addEntry("icons", "Icons.vue", "icons")
// addEntry("input", "Input.vue", "input")
// addEntry("inputlayout", "InputLayout.vue", "inputlayout")
// addEntry("label", "Label.vue", "label")
// addEntry("loading", "Loading.vue", "loading")
// addEntry("menu", "Menu.vue", "menu")
// addEntry("pagination", "Pagination.vue", "pagination")
// addEntry("select", "Select.vue", "select")
// addEntry("separator", "Separator.vue", "separator")
// addEntry("split", "Split.vue", "split")
// addEntry("switch", "Switch.vue", "switch")
// addEntry("table", "Table.vue", "table")
// addEntry("texteditor", "TextEditor.vue", "texteditor")
addPlugins()
addModules()
addIndex()
copyDependencies(`./`, `${OUTPUT_LIB_DIR}/`)
addPackageJson()
// =====================================================================================================================
export default entries
