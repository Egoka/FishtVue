import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Icons from "fishtvue/icons/Icons.vue"

// Issue 7: heroicons теперь резолвятся через dynamic import (async) — ждём microtasks + macrotask.
const flushHero = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r))
  await flushPromises()
}

describe("Icons Component Tests", () => {
  describe("Icon Component - Without Library Initialization", () => {
    it("renders a HeroIcon when type matches", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "Check"
        }
      })
      await flushHero()
      expect(wrapper.html())
        .toBe(`<i data-icon=""><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-icons h-5 w-5 text-gray-900 dark:text-gray-100 select-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>
  </svg></i>`)
    })

    it("does not render any icon if type is invalid", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "test"
        }
      })

      // Проверяем, что ни HeroIcon, ни Iconify не рендерятся
      expect(wrapper.findComponent({ name: "Icon" }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: "CheckIcon" }).exists()).toBe(false)
    })

    it("applies custom class and style", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "Check",
          class: "custom-class",
          style: { color: "red" }
        }
      })

      await flushHero()
      const iconElement = wrapper.find("svg")
      expect(iconElement.attributes("class")).toContain("custom-class")
      expect(iconElement.attributes("style")).toContain("color: red;")
    })

    it("renders an Iconify icon when type matches", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "icon-park-solid:circles-and-triangles"
        }
      })

      // Эмулируем обновление пропса type
      await wrapper.setProps({ type: "icon-park-solid:circles-and-triangles" })
    })
  })

  // -----------------------------------------------------------------------
  // ARIA — Issue 3 (icons.md)
  // role/aria-label live on the <i data-icon> wrapper, не на <svg>: heroicons
  // hardcode aria-hidden="true" в render и не пробрасывают $attrs. Wrapper-based
  // pattern сохраняет корректную семантику для screen-reader'ов.
  // -----------------------------------------------------------------------
  describe("ARIA — accessibility attrs", () => {
    it("default (no label) — wrapper has no role/aria-label, SVG keeps built-in aria-hidden", async () => {
      const wrapper = mount(Icons, { props: { type: "Check" } })
      await flushHero()
      const root = wrapper.find("[data-icon]")
      expect(root.attributes("role")).toBeUndefined()
      expect(root.attributes("aria-label")).toBeUndefined()
      expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true")
    })

    it("label prop — wrapper receives role=img + aria-label", () => {
      const wrapper = mount(Icons, {
        props: { type: "Check", label: "Confirm" }
      })
      const root = wrapper.find("[data-icon]")
      expect(root.attributes("role")).toBe("img")
      expect(root.attributes("aria-label")).toBe("Confirm")
    })

    it("label prop on Iconify icon — wrapper receives a11y attrs even before CDN fetch", async () => {
      const wrapper = mount(Icons, {
        props: { type: "icon-park-solid:circles-and-triangles", label: "Decorative shape" }
      })
      await wrapper.vm.$nextTick()
      const root = wrapper.find("[data-icon]")
      expect(root.attributes("role")).toBe("img")
      expect(root.attributes("aria-label")).toBe("Decorative shape")
      expect((wrapper.vm as any).label).toBe("Decorative shape")
    })

    it("empty label string — treated as no label (wrapper stays transparent)", () => {
      const wrapper = mount(Icons, { props: { type: "Check", label: "" } })
      const root = wrapper.find("[data-icon]")
      expect(root.attributes("role")).toBeUndefined()
      expect(root.attributes("aria-label")).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // Variant + stileIcon deprecation — Issue 4 (icons.md)
  // -----------------------------------------------------------------------
  describe("Variant prop + stileIcon soft-deprecation", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    })
    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('variant="solid" renders solid HeroIcon (fill="currentColor" instead of stroke)', async () => {
      const wrapper = mount(Icons, { props: { type: "Check", variant: "solid" } })
      await flushHero()
      const svg = wrapper.find("svg")
      // Solid heroicons use fill, outline use stroke-width.
      expect(svg.attributes("fill")).toBe("currentColor")
      expect(svg.attributes("stroke-width")).toBeUndefined()
    })

    it('variant="outline" renders outline HeroIcon (default)', async () => {
      const wrapper = mount(Icons, { props: { type: "Check", variant: "outline" } })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("stroke-width")).toBe("1.5")
      expect(svg.attributes("fill")).toBe("none")
    })

    // Note: warnSpy ловит все `console.warn` — включая Vue injection-warning
    // про `Symbol(FishtVue)`, который иногда фигурирует при mount без plugin'а
    // (зависит от global window-state и предыдущих тестов). Поэтому проверяем
    // ТОЛЬКО deprecation-сообщение через регулярку, игнорируя остальные warn'ы.
    const deprecationCalls = (spy: ReturnType<typeof vi.spyOn>) =>
      spy.mock.calls.filter((c: unknown[]) => /stileIcon.*deprecated.*variant/i.test(String(c[0])))

    it('stileIcon="solid" (without variant) still works AND emits dev console.warn', async () => {
      const wrapper = mount(Icons, { props: { type: "Check", stileIcon: "solid" } })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("fill")).toBe("currentColor")
      expect(deprecationCalls(warnSpy)).toHaveLength(1)
    })

    it("variant overrides stileIcon (no deprecation warn fired when variant present)", async () => {
      const wrapper = mount(Icons, {
        props: { type: "Check", variant: "outline", stileIcon: "solid" }
      })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("fill")).toBe("none")
      expect(svg.attributes("stroke-width")).toBe("1.5")
      expect(deprecationCalls(warnSpy)).toHaveLength(0)
    })
  })

  // -----------------------------------------------------------------------
  // Type narrowing — Issue 5 (icons.md)
  // Compile-time narrowing is enforced by vue-tsc (pnpm typecheck).
  // Runtime: verify that all three branches (HeroIconName, IconifyIconName,
  // arbitrary string fallback) mount without throwing.
  // -----------------------------------------------------------------------
  describe("Type narrowing — IconType union accepts all branches at runtime", () => {
    it("HeroIconName branch — 'check' mounts and renders", async () => {
      const wrapper = mount(Icons, { props: { type: "Check" } })
      await flushHero()
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it("IconifyIconName branch — 'mdi:home' pattern accepted (no SVG without CDN, but mount OK)", () => {
      const wrapper = mount(Icons, { props: { type: "mdi:home" } })
      expect(wrapper.exists()).toBe(true)
    })

    it("(string & {}) branch — arbitrary unknown type accepted (graceful no-render)", () => {
      const wrapper = mount(Icons, { props: { type: "totally-unknown-icon-name" } })
      expect(wrapper.exists()).toBe(true)
      // graceful: neither heroicon nor iconify resolved → no <svg>
      expect(wrapper.find("svg").exists()).toBe(false)
    })
  })

  describe("Icon Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Icons: options
          }
        })
      }
    })

    it("renders a HeroIcon with global options applied", async () => {
      const app = createAppWithFishtVue({ class: "global-class" })
      const wrapper = mount(Icons, {
        props: {
          type: "Check"
        },
        global: {
          plugins: [app]
        }
      })

      await flushHero()
      // Проверяем, что иконка рендерится с глобальным классом
      const iconElement = wrapper.find("svg")
      expect(iconElement.attributes("class")).toContain("global-class")
    })

    it('componentsOptions.Icons.variant="solid" applies when prop is absent', async () => {
      const app = createAppWithFishtVue({ variant: "solid" })
      const wrapper = mount(Icons, {
        props: { type: "Check" },
        global: { plugins: [app] }
      })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("fill")).toBe("currentColor")
    })

    it("per-instance variant overrides componentsOptions.variant", async () => {
      const app = createAppWithFishtVue({ variant: "solid" })
      const wrapper = mount(Icons, {
        props: { type: "Check", variant: "outline" },
        global: { plugins: [app] }
      })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("fill")).toBe("none")
      expect(svg.attributes("stroke-width")).toBe("1.5")
    })
  })
})
