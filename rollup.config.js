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
const CORE_LIB_DIR = "lib"
const OUTPUT_LIB_DIR = "dist"
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
  "@heroicons/vue/20/solid",
  "@heroicons/vue/20/outline",
  "@heroicons/vue/24/solid",
  "@heroicons/vue/24/outline",
  "@vueup/vue-quill",
  "@vueup/vue-quill/dist/vue-quill.snow.css",
  "@vueup/vue-quill/dist/vue-quill.bubble.css",
  "@iconify/vue",
  "dayjs/plugin/isBetween",
  "dayjs",
  "epic-spinners",
  "v-calendar",
  "v-calendar/style.css",
  "tailwind-merge",
  "clsx",
  "lodash",
  "gsap"
]
const EXTERNAL_CORE_DEPENDENCIES = {
  "label/Label": "label",
  "inputlayout/InputLayout": "inputlayout",
  "input/Input": "input",
  "aria/Aria": "aria",
  "select/Select": "select",
  "calendar/Calendar": "calendar",
  "texteditor/TextEditor": "texteditor",
  "switch/Switch": "switch",
  "button/Button": "button",
  "badge/Badge": "badge",
  "icons/Icons": "icons",
  "loading/Loading": "loading",
  "dialog/Dialog": "dialog",
  "fixwindow/FixWindow": "fixwindow",
  "separator/Separator": "separator",
  "menu/Menu": "menu",
  "pagination/Pagination": "pagination"
}

// =====================================================================================================================
function replaceComponentImportPaths() {
  return {
    name: "replace-component-import-paths",
    transform(code, id) {
      if (id.endsWith(".vue")) {
        const reg = new RegExp(`"${PROJECT_NAME}\\/(${Object.keys(EXTERNAL_CORE_DEPENDENCIES).join("|")})\\.vue"`, "gm")
        const modifiedCode = code.replace(reg, (match, component) =>
          component ? `"${PROJECT_NAME}/${EXTERNAL_CORE_DEPENDENCIES[component]}"` : match
        )
        return { code: modifiedCode, map: null }
      }
      return null
    }
  }
}

function onWarn(message) {
  if (message.code === "CIRCULAR_DEPENDENCY") {
    if (message.message.endsWith("lib/alert/Alert.vue")) return ""
  } else console.error(message.message)
}

const GLOBAL_DEPENDENCIES = {
  "epic-spinners": "epicSpinners",
  "v-calendar": "vCalendar",
  "tailwind-merge": "tailwindMerge",
  clsx: "clsx",
  lodash: "lodash",
  dayjs: "dayjs",
  gsap: "gsap",
  vue: "Vue"
}
const CORE_DEPENDENCIES = JSON.parse(`{
  "${PROJECT_NAME}/config": "${PROJECT_NAME}.config",
  "${PROJECT_NAME}/component": "${PROJECT_NAME}.component",
  "${PROJECT_NAME}/types": "${PROJECT_NAME}.types",
  "${PROJECT_NAME}/label": "${PROJECT_NAME}.label",
  "${PROJECT_NAME}/badge": "${PROJECT_NAME}.badge",
  "${PROJECT_NAME}/button": "${PROJECT_NAME}.button",
  "${PROJECT_NAME}/icons": "${PROJECT_NAME}.icons",
  "${PROJECT_NAME}/loading": "${PROJECT_NAME}.loading",
  "${PROJECT_NAME}/fixwindow": "${PROJECT_NAME}.fixwindow",
  "${PROJECT_NAME}/dialog": "${PROJECT_NAME}.dialog",
  "${PROJECT_NAME}/input": "${PROJECT_NAME}.input",
  "${PROJECT_NAME}/aria": "${PROJECT_NAME}.aria",
  "${PROJECT_NAME}/select": "${PROJECT_NAME}.select",
  "${PROJECT_NAME}/calendar": "${PROJECT_NAME}.calendar",
  "${PROJECT_NAME}/texteditor": "${PROJECT_NAME}.texteditor",
  "${PROJECT_NAME}/switch": "${PROJECT_NAME}.switch",
  "${PROJECT_NAME}/select": "${PROJECT_NAME}.select",
  "${PROJECT_NAME}/inputlayout": "${PROJECT_NAME}.inputlayout",
  "${PROJECT_NAME}/separator": "${PROJECT_NAME}.separator",
  "${PROJECT_NAME}/menu": "${PROJECT_NAME}.menu",
  "${PROJECT_NAME}/pagination": "${PROJECT_NAME}.pagination",
  "${PROJECT_NAME}/utils/domHandler": "${PROJECT_NAME}.utils.domHandler",
  "${PROJECT_NAME}/utils/dateHandler": "${PROJECT_NAME}.utils.dateHandler",
  "${PROJECT_NAME}/utils/arrayHandler": "${PROJECT_NAME}.utils.arrayHandler",
  "${PROJECT_NAME}/utils/stringHandler": "${PROJECT_NAME}.utils.stringHandler",
  "${PROJECT_NAME}/utils/objectHandler": "${PROJECT_NAME}.utils.objectHandler",
  "${PROJECT_NAME}/utils/functionHandler": "${PROJECT_NAME}.utils.functionHandler",
  "${PROJECT_NAME}/utils/tailwindHandler": "${PROJECT_NAME}.utils.tailwindHandler",
  "${PROJECT_NAME}/utils/uniqueCollection": "${PROJECT_NAME}.utils.uniqueCollection",
  "${PROJECT_NAME}/utils": "${PROJECT_NAME}.utils",
  "${PROJECT_NAME}/locale/locale": "${PROJECT_NAME}.locale.locale",
  "${PROJECT_NAME}/theme": "${PROJECT_NAME}.theme",
  "${PROJECT_NAME}/theme/themes/Aurora": "${PROJECT_NAME}.theme.themes.Aurora",
  "${PROJECT_NAME}/theme/themes/Harmony": "${PROJECT_NAME}.theme.themes.Harmony",
  "${PROJECT_NAME}/theme/themes/Sapphire": "${PROJECT_NAME}.theme.themes.Sapphire",
  "${PROJECT_NAME}/theme/uno": "${PROJECT_NAME}.theme.uno",
  "${PROJECT_NAME}/theme/primitive": "${PROJECT_NAME}.theme.primitive",
  "${PROJECT_NAME}/theme/semantic": "${PROJECT_NAME}.theme.semantic"
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
  typescript({ tsconfigOverride: { compilerOptions: { noImplicitAny: false } } }),
  postcss(POSTCSS_PLUGIN_OPTIONS),
  babel(BABEL_PLUGIN_OPTIONS),
  cleanup({ extensions: ["mjs", "ts"] })
]
const EXTERNAL_COMPONENT = [...EXTERNAL, ...Object.keys(CORE_DEPENDENCIES)]

// =====================================================================================================================
function addEntry(folder, inFile, outFile) {
  const exports = EXPORT_DEPENDENCIES.includes(inFile) ? "named" : "auto"
  const useCorePlugin = Object.keys(GLOBAL_COMPONENT_DEPENDENCIES).some(
    (d) => d.replace(`${PROJECT_NAME}/`, "") === folder
  )
  const plugins = PLUGINS
  const external = EXTERNAL_COMPONENT

  const input = `${CORE_LIB_DIR}/${folder}/${inFile}`
  const output = `./${OUTPUT_LIB_DIR}/${folder}/${outFile}`

  const getEntry = (isMinify) => {
    return {
      input,
      plugins: [...plugins, isMinify && terser(TERSER_PLUGIN_OPTIONS), useCorePlugin && corePlugin()],
      external
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Minify
  // entries.push(get_ES(true))
  // entries.push(get_CJS_ESM(true))
  // entries.push(get_IIFE(true))
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addSFC(coreDir) {
  fs.readdirSync(new URL(coreDir, import.meta.url).pathname, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .forEach(({ name: folderName }) => {
      fs.readdirSync(new URL(`${coreDir}/${folderName}`, import.meta.url).pathname).forEach((file) => {
        const name = file.split(/(.vue)$|(.js)$/)[0].toLowerCase()
        if (/\.vue$/.test(file) && name === folderName) {
          addEntry(folderName, file, name)
        }
      })
    })
}

// =====================================================================================================================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addUtils() {
  addEntry("utils", "Utils.ts", "utils")
  const utilsHandlers = [
    "stringHandler",
    "objectHandler",
    "arrayHandler",
    "dateHandler",
    "functionHandler",
    "tailwindHandler",
    "uniqueCollection",
    "domHandler"
  ]
  utilsHandlers.forEach((name) => addEntry("utils", `${name}.ts`, `${name}`))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addBaseComponent() {
  addEntry("component", "index.ts", "component")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addTheme() {
  addEntry("theme", "index.ts", "theme")
  addEntry("theme", "uno.ts", "uno")
  addEntry("theme", "semantic.ts", "semantic")
  addEntry("theme", "primitive.ts", "primitive")
  const themes = ["Aurora", "Harmony", "Sapphire"]
  themes.forEach((name) => addEntry("theme/themes", `${name}.ts`, `${name}`))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addLocale() {
  addEntry("locale", "locale.ts", "locale")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addConfig() {
  addEntry("config", "index.ts", "config")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function copyDependencies(inFolder, outFolder, subFolder) {
  fs.readdirSync(new URL(inFolder, import.meta.url).pathname, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .forEach(({ name: folderName }) => {
      fs.readdirSync(new URL(inFolder + folderName, import.meta.url).pathname).forEach((file) => {
        if (file === "package.json" || file.endsWith(".d.ts")) {
          fs.copySync(
            new URL(inFolder + folderName, import.meta.url).pathname + "/" + file,
            outFolder + folderName + "/" + file
          )
        }
      })

      if (subFolder) {
        try {
          fs.readdirSync(new URL(inFolder + folderName + subFolder, import.meta.url).pathname).forEach((subFile) => {
            if (subFile === "package.json" || subFile.endsWith(".d.ts")) {
              fs.copySync(
                new URL(inFolder + folderName + subFolder, import.meta.url).pathname + "/" + subFile,
                outFolder + folderName + subFolder + "/" + subFile
              )
            }
          })
        } catch (e) {
          console.log(e)
        }
      }
    })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addPackageJson() {
  const packageJson = fs.readJsonSync(`./${CORE_LIB_DIR}/package.json`)
  !fs.existsSync(OUTPUT_LIB_DIR) && fs.mkdirSync(OUTPUT_LIB_DIR)
  fs.writeFileSync(path.resolve(OUTPUT_LIB_DIR, "package.json"), JSON.stringify(packageJson, null, "  "))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createDir(dir) {
  try {
    await fs.emptyDir(dir)
  } catch (err) {
    console.error(err)
  }
}

// =====================================================================================================================
async function start() {
  await createDir(OUTPUT_LIB_DIR)
  fs.copySync(new URL(`./${CORE_LIB_DIR}/types.d.ts`, import.meta.url).pathname, `${OUTPUT_LIB_DIR}/types.d.ts`)
  fs.copySync(new URL("./README.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/README.md`)
  fs.copySync(new URL("./LICENSE.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/LICENSE.md`)
  fs.copySync(new URL("./CHANGELOG.md", import.meta.url).pathname, `${OUTPUT_LIB_DIR}/CHANGELOG.md`)
}

// =====================================================================================================================
await start()
addUtils()
addBaseComponent()
addTheme()
addLocale()
addConfig()
addSFC(`./${CORE_LIB_DIR}`)
copyDependencies(`./${CORE_LIB_DIR}/`, `${OUTPUT_LIB_DIR}/`)
addPackageJson()
// =====================================================================================================================
export default entries
