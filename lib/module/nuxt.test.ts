import { beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Контракт Nuxt-модуля (nuxt-module.md Issues 1, 3, 5).
 *
 * `defineNuxtModule` мокается в тождественную функцию: тест получает голый module-definition
 * и вызывает `setup(options, nuxt)` напрямую, подставляя `defaults` руками (в проде их
 * подмешивает сам `@nuxt/kit`). Так проверяется именно наша логика регистрации, без
 * поднятия Nuxt-приложения — полноценный `@nuxt/test-utils` остаётся отдельной задачей
 * (nuxt-module.md Issue 1).
 */
const addComponent = vi.fn()
const addPlugin = vi.fn()
const addPluginTemplate = vi.fn()

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (definition: any) => definition,
  addComponent: (...args: any[]) => addComponent(...args),
  addPlugin: (...args: any[]) => addPlugin(...args),
  addPluginTemplate: (...args: any[]) => addPluginTemplate(...args),
  createResolver: (base: string) => ({
    resolve: (path: string) => `${base}/${path.replace(/^\.\//, "")}`.replace(/\/$/, "")
  })
}))

const moduleDefinition = (await import("fishtvue/module/nuxt")).default as any

function createNuxt() {
  return { options: { build: { transpile: [] as string[] }, alias: {} as Record<string, string> } }
}

function runSetup(userOptions: Record<string, any> = {}) {
  const nuxt = createNuxt()
  const options = { ...moduleDefinition.defaults, ...userOptions }
  moduleDefinition.setup(options, nuxt)
  return { nuxt, options }
}

/** Имена, экспортируемые compound-баррелем `lib/{name}/index.ts` (кроме `default`). */
function namedExportsOf(barrel: string): string[] {
  const source = readFileSync(resolve(process.cwd(), `lib/${barrel}/index.ts`), "utf-8")
  return [...source.matchAll(/export\s*\{\s*default\s+as\s+(\w+)\s*}/g)].map((match) => match[1])
}

beforeEach(() => {
  addComponent.mockClear()
  addPlugin.mockClear()
  addPluginTemplate.mockClear()
})

describe("Nuxt module — auto-import компонентов", () => {
  it("регистрирует все top-level компоненты публичного barrel", () => {
    runSetup()
    const registered = addComponent.mock.calls.map(([arg]) => arg.name)
    expect(registered).toContain("Table")
    // VirtualScroller — 23-й компонент, добавлен в barrel позже остальных.
    expect(registered).toContain("VirtualScroller")
  })

  it("уважает prefix", () => {
    runSetup({ prefix: "Fv" })
    expect(addComponent.mock.calls.map(([arg]) => arg.name)).toContain("FvTable")
  })

  it("не регистрирует ничего при autoImport: false", () => {
    runSetup({ autoImport: false })
    expect(addComponent).not.toHaveBeenCalled()
  })
})

describe("Nuxt module — compound-дети (Issue 3)", () => {
  /**
   * Регрессия: `MenuItem`/`MenuGroup`/`AccordionItem` экспортируются баррелями, но не были
   * заведены в `FISHT_VUE_SUBCOMPONENTS` — в Nuxt-приложении `<MenuItem>` оставался
   * unresolved, хотя 02-installation.md обещает «В Nuxt — глобальны».
   */
  it("регистрирует каждый named-экспорт compound-баррелей", () => {
    runSetup()
    const registered = new Set(addComponent.mock.calls.map(([arg]) => arg.name))

    for (const barrel of ["table", "form", "select", "menu", "accordion"]) {
      for (const child of namedExportsOf(barrel)) {
        expect(registered, `${child} (fishtvue/${barrel}) не зарегистрирован в Nuxt`).toContain(child)
      }
    }
  })

  it("указывает родительский модуль как filePath и имя как export", () => {
    runSetup()
    const menuItem = addComponent.mock.calls.map(([arg]) => arg).find((arg) => arg.name === "MenuItem")

    expect(menuItem?.export).toBe("MenuItem")
    // Дети живут named-экспортами внутри бандла родителя (menu.mjs), а не отдельной папкой.
    expect(menuItem?.filePath.endsWith("/menu")).toBe(true)
  })
})

describe("Nuxt module — disableGlobalStyles (Issue 5)", () => {
  it("по умолчанию подключает server-плагин SSR-стилей", () => {
    runSetup()
    expect(addPlugin).toHaveBeenCalledTimes(1)
    expect(addPlugin.mock.calls[0][0]).toMatchObject({ mode: "server" })
    expect(addPlugin.mock.calls[0][0].src.endsWith("plugins/nuxt.mjs")).toBe(true)
  })

  it("не подключает server-плагин при disableGlobalStyles: true", () => {
    runSetup({ disableGlobalStyles: true })
    expect(addPlugin).not.toHaveBeenCalled()
  })

  it("оставляет client-плагин конфигурации нетронутым при disableGlobalStyles: true", () => {
    // Отключается только инжект CSS, но не сам `app.use(FishtVue, options)` —
    // иначе компоненты потеряли бы конфиг, локали и тему.
    runSetup({ disableGlobalStyles: true })
    expect(addPluginTemplate).toHaveBeenCalledTimes(1)
    expect(addPluginTemplate.mock.calls[0][0]).toMatchObject({ filename: "fishtvue.all.mjs", mode: "all" })
  })
})

describe("Nuxt module — plugin template", () => {
  it("отсекает module-only поля от конфига, уходящего в app.use", () => {
    runSetup({ prefix: "Fv", disableGlobalStyles: true, optionsTheme: { prefix: "fishtvue" } })
    const passed = addPluginTemplate.mock.calls[0][0].options

    for (const moduleOnly of ["global", "mode", "prefix", "autoImport", "disableGlobalStyles"]) {
      expect(passed).not.toHaveProperty(moduleOnly)
    }
    expect(passed).toHaveProperty("optionsTheme")
  })

  it("генерирует плагин, регистрирующий FishtVue на vueApp", () => {
    runSetup()
    const contents = addPluginTemplate.mock.calls[0][0].getContents({ options: { prefix: "" } })

    expect(contents).toContain('import FishtVue from "fishtvue/config"')
    expect(contents).toContain("nuxtApp.vueApp.use(FishtVue, options)")
  })
})

describe("Nuxt module — интеграция с nuxt.options", () => {
  it("добавляет runtime-каталог в transpile и алиас #fishtvue", () => {
    const { nuxt } = runSetup()
    expect(nuxt.options.build.transpile).toHaveLength(1)
    expect(nuxt.options.alias["#fishtvue"]).toBeTruthy()
  })
})
