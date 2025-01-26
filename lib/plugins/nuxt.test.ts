import { beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "vue"
import plugin from "fishtvue/plugins/nuxt"

describe("Nuxt Plugin", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it("registers all FishtVue components", () => {
    const nuxtApp = {
      vueApp: createApp({}),
      ssrContext: null,
      hook: vi.fn()
    }
    plugin(nuxtApp)
    const registeredComponents = Object.keys(nuxtApp.vueApp._context.components)
    const expectedComponents = [
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

    expectedComponents.forEach((component) => {
      expect(registeredComponents).toContain(component)
    })
  })

  it("adds styles to head on server side", async () => {
    vi.stubGlobal("process", { server: true })
    vi.mock("fishtvue/component", () => ({
      cssComponents: new Map([["test-component", "body { color: red; }"]])
    }))

    const plugin = await import("fishtvue/plugins/nuxt")
    const nuxtApp = {
      vueApp: createApp({}),
      ssrContext: {
        head: []
      },
      hook: vi.fn((event, callback) => {
        if (event === "app:rendered") {
          callback()
        }
      })
    }
    plugin.default(nuxtApp)
    expect(nuxtApp.ssrContext.head).toContainEqual({
      style: {
        type: "text/css",
        "data-fishtvue-style-id": "test-component",
        children: "body { color: red; }"
      }
    })
  })

  it("does not add styles to head on client side", async () => {
    vi.stubGlobal("process", { server: false })

    vi.mock("fishtvue/component", () => ({
      cssComponents: new Map([["test-component", "body { color: red; }"]])
    }))

    const plugin = await import("fishtvue/plugins/nuxt")
    const nuxtApp = {
      vueApp: createApp({}),
      ssrContext: {
        head: []
      },
      hook: vi.fn((event, callback) => {
        if (event === "app:rendered") {
          callback()
        }
      })
    }
    plugin.default(nuxtApp)
    expect(nuxtApp.ssrContext.head.length).toBe(0)
  })
})
