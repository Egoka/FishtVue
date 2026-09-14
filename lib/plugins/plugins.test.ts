import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Server-плагин SSR-инжекции стилей (nuxt-module.md Issue 7 — coverage 0%).
 *
 * Плагин — единственный путь, которым собранный `cssComponents` попадает в SSR-разметку: на
 * хуке `app:rendered` он пушит по `<style data-fishtvue-style-id="…">` на компонент в
 * `ssrContext.head`. Если он молча не отработает, страница приедет без стилей и «починится»
 * только после гидратации — регрессия, которую unit-тесты компонентов не видят.
 *
 * `defineNuxtPlugin` из `nuxt/app` мокается тождественной функцией: тест получает голый
 * обработчик и вызывает его с поддельным `nuxtApp`, без поднятия Nuxt.
 */
vi.mock("nuxt/app", () => ({ defineNuxtPlugin: (handler: any) => handler }))

function createNuxtApp(withSsrContext = true) {
  const hooks: Record<string, Array<() => void>> = {}
  const pushed: any[] = []
  return {
    hook: (name: string, fn: () => void) => {
      ;(hooks[name] ??= []).push(fn)
    },
    ssrContext: withSsrContext ? { head: { push: (entry: any) => pushed.push(entry) } } : undefined,
    /** Имитирует момент, когда Nuxt отрисовал приложение. */
    render: () => (hooks["app:rendered"] ?? []).forEach((fn) => fn()),
    pushed,
    hooks
  }
}

const originalServer = (process as any).server

beforeEach(() => {
  ;(process as any).server = true
})

afterEach(async () => {
  ;(process as any).server = originalServer
  const { cssComponents } = await import("fishtvue/component")
  cssComponents.clear()
})

describe("plugins/nuxt — SSR-инжекция стилей", () => {
  it("пушит по одному style-узлу на компонент со стилями", async () => {
    // `cssComponents` типизирован ключами реальных компонентов — пробам нужен cast.
    const { cssComponents } = (await import("fishtvue/component")) as unknown as {
      cssComponents: Map<string, string>
    }
    // Уникальные имена: при `isolate: false` реестр общий на весь прогон, и к моменту этого
    // файла в нём уже лежат стили компонентов из соседних тестов.
    cssComponents.set("ProbeAlpha", ".fv-probe-alpha{color:red}")
    cssComponents.set("ProbeBeta", ".fv-probe-beta{color:blue}")

    const plugin = (await import("fishtvue/plugins/nuxt")).default as any
    const app = createNuxtApp()
    plugin(app)
    app.render()

    const probes = app.pushed
      .map((entry) => entry.style["data-fishtvue-style-id"] as string)
      .filter((id) => id.startsWith("Probe"))

    expect(probes.sort()).toEqual(["ProbeAlpha", "ProbeBeta"])
    // Ровно по одному тегу на компонент — дублей плагин не создаёт.
    expect(app.pushed).toHaveLength(cssComponents.size)
  })

  it("отдаёт CSS как text/css с корректным innerHTML", async () => {
    // `cssComponents` типизирован ключами реальных компонентов — пробам нужен cast.
    const { cssComponents } = (await import("fishtvue/component")) as unknown as {
      cssComponents: Map<string, string>
    }
    cssComponents.set("Button", ".fv-button{color:red}")

    const plugin = (await import("fishtvue/plugins/nuxt")).default as any
    const app = createNuxtApp()
    plugin(app)
    app.render()

    expect(app.pushed[0].style).toMatchObject({
      type: "text/css",
      "data-fishtvue-style-id": "Button",
      innerHTML: ".fv-button{color:red}"
    })
  })

  it("ничего не пушит, когда стилей не собрано", async () => {
    // `cssComponents` типизирован ключами реальных компонентов — пробам нужен cast.
    const { cssComponents } = (await import("fishtvue/component")) as unknown as {
      cssComponents: Map<string, string>
    }
    cssComponents.clear()

    const plugin = (await import("fishtvue/plugins/nuxt")).default as any
    const app = createNuxtApp()
    plugin(app)
    app.render()

    expect(app.pushed).toHaveLength(0)
  })

  it("не регистрирует хук вне SSR-контекста", async () => {
    const plugin = (await import("fishtvue/plugins/nuxt")).default as any
    const app = createNuxtApp(false)
    plugin(app)

    // На клиенте стили инжектит useStyle() — дублировать их в head не нужно.
    expect(app.hooks["app:rendered"]).toBeUndefined()
  })

  it("не регистрирует хук, когда process.server false", async () => {
    ;(process as any).server = false
    const plugin = (await import("fishtvue/plugins/nuxt")).default as any
    const app = createNuxtApp()
    plugin(app)

    expect(app.hooks["app:rendered"]).toBeUndefined()
  })
})

describe("plugins/Plugins — барель", () => {
  it("реэкспортирует server-плагин под именем nuxtInitPlugin", async () => {
    const barrel = await import("fishtvue/plugins/Plugins")
    const direct = (await import("fishtvue/plugins/nuxt")).default

    expect(barrel.nuxtInitPlugin).toBe(direct)
    expect((barrel.default as any).nuxtInitPlugin).toBe(direct)
  })
})
