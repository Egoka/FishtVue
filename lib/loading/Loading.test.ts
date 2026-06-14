import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import Loading from "fishtvue/loading/Loading.vue"
import type { LoadingExpose, LoadingProps } from "fishtvue/loading/Loading"
import { componentsMapEpic, componentsMapSvg } from "fishtvue/loading/loadingTypes"

type Expose = LoadingExpose & { classLoading: string; type: LoadingProps["type"] }
const vm = (wrapper: ReturnType<typeof mount>) => wrapper.vm as unknown as Expose

// matchMedia mock-factory: jsdom не реализует matchMedia, поэтому подставляем заглушку.
const stubMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia
}

const createAppWithFishtVue = (config: Record<string, any> = {}) => {
  const app = createApp({})
  app.use(FishtVue, config)
  return app
}

describe("Loading Component", () => {
  beforeEach(() => stubMatchMedia(false))
  afterEach(() => {
    // window.FishtVue утекает между файлами Vitest — чистим (см. memory).
    delete (window as any).FishtVue
    vi.restoreAllMocks()
  })

  describe("Without Library Initialization", () => {
    it("renders the root container with defaults", () => {
      const wrapper = mount(Loading)
      expect(wrapper.find("[data-loading]").exists()).toBe(true)
      expect(vm(wrapper).type).toBe("simple")
      expect(vm(wrapper).size).toBe(20)
      expect(vm(wrapper).animationDuration).toBe(1500)
      expect(vm(wrapper).color).toBe("currentColor")
    })

    it("exposes reactive computed fields", async () => {
      const wrapper = mount(Loading, { props: { type: "bars" } })
      expect(vm(wrapper).type).toBe("bars")
      await wrapper.setProps({ type: "oval" })
      expect(vm(wrapper).type).toBe("oval")
    })
  })

  describe("Accessibility (Issue 3)", () => {
    it("marks the root as an ARIA live status region", () => {
      const wrapper = mount(Loading)
      const root = wrapper.find("[data-loading]")
      expect(root.attributes("role")).toBe("status")
      expect(root.attributes("aria-live")).toBe("polite")
      expect(root.attributes("aria-label")).toBeTruthy()
    })

    it("renders a visually-hidden label", () => {
      const wrapper = mount(Loading)
      const sr = wrapper.find("[data-loading] .sr-only")
      expect(sr.exists()).toBe(true)
      expect(sr.text().length).toBeGreaterThan(0)
    })

    it("routes the visually-hidden label class through the setStyle factory", () => {
      // `sr-only` должен генерироваться движком через `Loading.setStyle`, а не быть
      // литеральным `class="sr-only"`: у потребителя без Tailwind литеральный класс не
      // сгенерит CSS → текст скринридера потеряет visually-hidden-позиционирование.
      // setStyle возвращает `fv {prefix}-{name} {classes}` — проверяем эти маркеры.
      const wrapper = mount(Loading)
      const cls = wrapper.find("[data-loading] .sr-only").attributes("class") ?? ""
      expect(cls).toContain("fv")
      expect(cls).toContain("fishtvue-loading")
      expect(cls).toContain("sr-only")
    })

    it("localizes the label via t('loading.label')", () => {
      const en = createAppWithFishtVue({
        locale: { activeLocale: "en", messages: { en: { loading: { label: "Loading" } } } }
      })
      const enWrapper = mount(Loading, { global: { plugins: [en as any] } })
      expect(enWrapper.find("[data-loading]").attributes("aria-label")).toBe("Loading")
      expect(enWrapper.find("[data-loading] .sr-only").text()).toBe("Loading")
      delete (window as any).FishtVue

      const ru = createAppWithFishtVue({
        locale: { activeLocale: "ru", messages: { ru: { loading: { label: "Загрузка" } } } }
      })
      const ruWrapper = mount(Loading, { global: { plugins: [ru as any] } })
      expect(ruWrapper.find("[data-loading]").attributes("aria-label")).toBe("Загрузка")
    })
  })

  describe("Reduced motion (Issue 6)", () => {
    it("renders the static simple loader when prefers-reduced-motion: reduce", () => {
      stubMatchMedia(true)
      const wrapper = mount(Loading, { props: { type: "AtomSpinner" } })
      // simple.vue — это <svg> с 8 <line>; epic AtomSpinner рендерит .atom-spinner
      expect(wrapper.findAll("[data-loading] svg line").length).toBe(8)
      expect(wrapper.find(".atom-spinner").exists()).toBe(false)
    })

    it("renders the animated loader when motion is allowed", async () => {
      stubMatchMedia(false)
      const wrapper = mount(Loading, { props: { type: "simple" } })
      await flushPromises()
      expect(wrapper.find("[data-loading]").exists()).toBe(true)
    })
  })

  describe("Print styles (Issue 8)", () => {
    it("hides the loader on print", () => {
      const wrapper = mount(Loading)
      expect(vm(wrapper).classLoading).toContain("print:hidden")
    })
  })

  describe("Unstyled mode (Issue 5 / cross-cutting)", () => {
    it("drops all utility classes when unstyled: true", () => {
      const app = createAppWithFishtVue({ unstyled: true })
      const wrapper = mount(Loading, { global: { plugins: [app as any] } })
      const classLoading = vm(wrapper).classLoading
      expect(classLoading).not.toContain("inline-block")
      expect(classLoading).not.toContain("print:hidden")
    })
  })

  describe("Option resolution (Issue 4)", () => {
    it("applies componentsOptions.Loading including type", () => {
      const app = createAppWithFishtVue({
        componentsOptions: { Loading: { type: "spinner", size: 50, color: "#abcdef", animationDuration: 2000 } }
      })
      const wrapper = mount(Loading, { global: { plugins: [app as any] } })
      expect(vm(wrapper).type).toBe("spinner")
      expect(vm(wrapper).size).toBe(50)
      expect(vm(wrapper).color).toBe("#abcdef")
      expect(vm(wrapper).animationDuration).toBe(2000)
    })

    it("lets explicit props override global options", () => {
      const app = createAppWithFishtVue({
        componentsOptions: { Loading: { type: "spinner", size: 50 } }
      })
      const wrapper = mount(Loading, {
        props: { type: "bars", size: 64 },
        global: { plugins: [app as any] }
      })
      expect(vm(wrapper).type).toBe("bars")
      expect(vm(wrapper).size).toBe(64)
    })
  })

  describe("Color resolution", () => {
    it("passes hex colors through unchanged", () => {
      const wrapper = mount(Loading, { props: { color: "#3b82f6" } })
      expect(vm(wrapper).color).toBe("#3b82f6")
    })

    it("falls back to currentColor when no color is set", () => {
      const wrapper = mount(Loading)
      expect(vm(wrapper).color).toBe("currentColor")
    })

    it("resolves a theme palette token to its hex value", () => {
      const wrapper = mount(Loading, { props: { color: "emerald" } })
      expect(vm(wrapper).color).toBe("#10b981")
    })

    it("falls back to currentColor for an unknown token", () => {
      const wrapper = mount(Loading, { props: { color: "totallyUnknownToken" } })
      expect(vm(wrapper).color).toBe("currentColor")
    })
  })

  describe("loadComponent fallback", () => {
    it("warns and renders simple for an unknown type", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const wrapper = mount(Loading, { props: { type: "does-not-exist" as any } })
      await flushPromises()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unknown loading type"))
      expect(wrapper.find("[data-loading]").exists()).toBe(true)
    })
  })

  // Issue 1: каждая Epic/Svg вариация должна рендериться без ошибок (coverage loadingTypes.ts).
  describe("All Epic variations render", () => {
    it.each(Object.entries(componentsMapEpic))("renders Epic %s", async (_name, loader) => {
      const mod = (await loader()) as { default: any }
      expect(mod.default).toBeTruthy()
      const wrapper = mount(mod.default, { props: { size: 40, color: "#000000", animationDuration: 1000 } })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("All Svg variations render", () => {
    it.each(Object.entries(componentsMapSvg))("renders Svg %s", async (_name, loader) => {
      const mod = (await loader()) as { default: any }
      expect(mod.default).toBeTruthy()
      const wrapper = mount(mod.default, { props: { size: 40, color: "#000000", animationDuration: 1000 } })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("Wrapper integration through the async path", () => {
    it.each(["simple", "AtomSpinner", "bars"] as const)("mounts Loading with type %s", async (type) => {
      const wrapper = mount(Loading, { props: { type } })
      await flushPromises()
      expect(wrapper.find("[data-loading]").exists()).toBe(true)
    })
  })
})
