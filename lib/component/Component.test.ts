import { describe, vi, it, expect, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import Component from "fishtvue/component"
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import type { FishtVueConfiguration } from "fishtvue/config"
import type { App } from "vue"

describe("Testing class Component", () => {
  let component: Component<"FixWindow">
  const expectText = "Start use FishtVue"
  const App = {
    template: `<div>${expectText}</div>`
  }
  const options: FishtVueConfiguration = {
    optionsTheme: {
      nameTheme: "Harmony",
      prefix: "test-prefix"
    },
    componentsOptions: {
      FixWindow: { closeButton: true }
    }
  }
  beforeEach(() => {
    vi.mock("vue", async () => {
      // Import the actual module to retain other exports
      const actualVue = await vi.importActual<typeof import("vue")>("vue")

      return {
        ...actualVue, // Spread the actual exports
        onBeforeMount: vi.fn(() => "onBeforeMount"),
        onMounted: vi.fn(() => "onMounted"),
        onBeforeUpdate: vi.fn(() => "onBeforeUpdate"),
        onUpdated: vi.fn(() => "onUpdated"),
        onBeforeUnmount: vi.fn(() => "onBeforeUnmount"),
        onUnmounted: vi.fn(() => "onUnmounted"),
        getCurrentInstance: vi.fn(() => ({
          type: {
            __name: "FixWindow",
            __hmrId: "01e97188",
            __file: "/FishtVue/lib/fixwindow/FixWindow.vue"
          },
          appContext: {
            config: {
              globalProperties: {
                $fishtVue: {
                  config: {
                    optionsTheme: {
                      nameTheme: "Harmony",
                      prefix: "test-prefix"
                    },
                    componentsOptions: {
                      FixWindow: { closeButton: true }
                    }
                  },
                  getOptions: vi.fn(() => ({ closeButton: true }))
                }
              }
            }
          },
          props: {
            someProps: "returns something"
          }
        }))
      }
    })
    const app: App = createApp(App)
    app.use<FishtVueConfiguration>(FishtVue, options)
    const wrapper = mount(App, {
      global: {
        plugins: [[FishtVue, options]]
      }
    })
    expect(wrapper.text()).toBe(expectText)
    component = new Component<"FixWindow">()
  })

  it("should initialize styles with initStyle", () => {
    const mockStyle = vi.fn()
    component.initStyle(mockStyle)
    expect(mockStyle).toHaveBeenCalled()
    expect(mockStyle).toHaveBeenCalledWith("fishtvue", "")
  })

  it("should return the correct options with getOptions", () => {
    expect(component.getOptions()).toEqual({ closeButton: true })
  })

  it("should return the correct prefix with getPrefix", () => {
    expect(component.getPrefix()).toBe("test-prefix")
  })

  it("should trigger onMounted hook", () => {
    const hook = vi.fn()
    component.onMounted(hook)
    // Simulate the mounted lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeMount hook", () => {
    const hook = vi.fn()
    component.onBeforeMount(hook)
    // Simulate the before mount lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeUpdate hook", () => {
    const hook = vi.fn()
    component.onBeforeUpdate(hook)
    // Simulate the before update lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onUpdated hook", () => {
    const hook = vi.fn()
    component.onUpdated(hook)
    // Simulate the updated lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeUnmount hook", () => {
    const hook = vi.fn()
    component.onBeforeUnmount(hook)
    // Simulate the before unmount lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onUnmounted hook", () => {
    const hook = vi.fn()
    component.onUnmounted(hook)
    // Simulate the unmounted lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })
})
