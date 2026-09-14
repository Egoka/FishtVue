import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Icons from "fishtvue/icons/Icons.vue"

// Issue 1: heroicons резолвятся sync (eager namespace) — flush нужен только для Iconify-fallback
// (async CDN/offline-коллекция). Heroicon-кейсы рендерятся без flush; helper оставлен для Iconify.
const flushHero = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r))
  await flushPromises()
}

// Issue 1 (icons.md): heroicons резолвятся через tree-shakeable const-реестр explicit
// named-импортов (НЕ namespace `import *`). Реестр покрывает curated-набор из 37 имён
// (30 публичных `HeroIconName` + 7 internal, которые `lib/`-компоненты хардкодят через
// <Icons type=...>: arrow-long-right (Calendar), arrows-pointing-in/out (Split),
// ellipsis-vertical (Calendar/Table), exclamation-circle (InputLayout), funnel (Table),
// square-2-stack (Table)). Список — drift-guard: удаление импорта из реестра краснит тест.
const CURATED_HERO_NAMES = [
  "check",
  "x-mark",
  "user",
  "users",
  "home",
  "cog-6-tooth",
  "bell",
  "envelope",
  "magnifying-glass",
  "plus",
  "minus",
  "chevron-up",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "trash",
  "pencil",
  "eye",
  "eye-slash",
  "lock-closed",
  "lock-open",
  "exclamation-triangle",
  "information-circle",
  "question-mark-circle",
  "check-circle",
  "x-circle",
  "arrow-long-right",
  "arrows-pointing-in",
  "arrows-pointing-out",
  "ellipsis-vertical",
  "exclamation-circle",
  "funnel",
  "square-2-stack"
] as const

describe("Icons Component Tests", () => {
  describe("Icon Component - Without Library Initialization", () => {
    it("renders a HeroIcon when type matches", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "Check"
        }
      })
      await flushHero()
      // props 1.0 (решение 6): база размера/цвета живёт на корне <i data-icon>, svg — block h-full w-full.
      const root = wrapper.find("[data-icon]")
      expect(root.classes()).toEqual([
        "fv",
        "fishtvue-icons",
        "inline-block",
        "shrink-0",
        "h-5",
        "w-5",
        "text-surface-900",
        "dark:text-surface-100",
        "select-none"
      ])
      const svg = wrapper.find("svg")
      expect(svg.attributes("data-icon-svg")).toBe("")
      expect(svg.attributes("aria-hidden")).toBe("true")
      expect(svg.classes()).toEqual(["fv", "fishtvue-icons", "block", "h-full", "w-full"])
      expect(svg.find("path").attributes("d")).toBe("m4.5 12.75 6 6 9-13.5")
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
      // `class` и `style` — корень <i data-icon> (dev-patterns §2 A); svg наследует цвет.
      const root = wrapper.find("[data-icon]")
      expect(root.attributes("class")).toContain("custom-class")
      expect(root.attributes("style")).toContain("color: red;")
      expect(wrapper.find("svg").attributes("class")).not.toContain("custom-class")
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
  // Variant — Issue 4 (icons.md). Алиас `stileIcon` снят в major 2026-09-06
  // (решение R7): у prop'а остался один публичный вход.
  // -----------------------------------------------------------------------
  describe("Variant prop", () => {
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

    it("stileIcon больше не объявлен и не влияет на рендер", async () => {
      // передан как обычный лишний атрибут — компонент его игнорирует,
      // вариант резолвится дефолтом
      const wrapper = mount(Icons, { props: { type: "Check", stileIcon: "solid" } as any })
      await flushHero()
      const svg = wrapper.find("svg")
      expect(svg.attributes("fill")).toBe("none")
      expect(svg.attributes("stroke-width")).toBe("1.5")
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

  // -----------------------------------------------------------------------
  // Heroicons — eager sync resolution — Issue 1 (icons.md, regression fix)
  // Heroicon резолвится через eager namespace import + sync lookup по имени, а
  // НЕ через per-icon dynamic import. Поэтому SVG обязан появляться на первом
  // paint — без flushHero(). Это и есть суть фикса: bare-specifier dynamic
  // import (`import(`@heroicons/...${name}.js`)`) не глобится Vite/Rollup
  // `dynamic-import-vars` → ломался в prod-Vite + отсутствовал в SSR-HTML.
  // Если кто-то вернёт async dynamic import — эти кейсы покраснеют.
  // -----------------------------------------------------------------------
  describe("Heroicons — eager sync resolution (Issue 1 / prod-Vite + SSR)", () => {
    it("renders the heroicon SVG synchronously on first paint (no async flush)", () => {
      const wrapper = mount(Icons, { props: { type: "Check" } })
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it('"XMark" (Alert close-button icon name) resolves to an SVG synchronously', () => {
      const wrapper = mount(Icons, { props: { type: "XMark" } })
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it("kebab-case 'x-mark' resolves to the same heroicon synchronously", () => {
      const wrapper = mount(Icons, { props: { type: "x-mark" } })
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it("solid variant resolves synchronously (fill=currentColor, no flush)", () => {
      const wrapper = mount(Icons, { props: { type: "Check", variant: "solid" } })
      const svg = wrapper.find("svg")
      expect(svg.exists()).toBe(true)
      expect(svg.attributes("fill")).toBe("currentColor")
    })
  })

  // -----------------------------------------------------------------------
  // Tree-shakeable const registry — Issue 1 (icons.md)
  // Heroicons резолвятся из explicit named-импортов (const-реестр), а НЕ из
  // namespace `import *` с dynamic `set[name]`. Это позволяет bundler'у
  // tree-shake'ить набор до curated-37 вместо всех 648 иконок. Цена — имена
  // вне реестра больше не резолвятся как heroicon (уходят в Iconify-fallback).
  // -----------------------------------------------------------------------
  describe("Heroicons — tree-shakeable const registry (Issue 1)", () => {
    it.each(CURATED_HERO_NAMES)("'%s' resolves to a heroicon SVG synchronously (outline)", (name) => {
      const wrapper = mount(Icons, { props: { type: name } })
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it.each(CURATED_HERO_NAMES)("'%s' resolves to a heroicon SVG synchronously (solid)", (name) => {
      const wrapper = mount(Icons, { props: { type: name, variant: "solid" } })
      expect(wrapper.find("svg").exists()).toBe(true)
    })

    it("outline vs solid spot-check ('bell'): outline has stroke-width, solid has fill", () => {
      const outline = mount(Icons, { props: { type: "bell" } })
      expect(outline.find("svg").attributes("stroke-width")).toBe("1.5")
      const solid = mount(Icons, { props: { type: "bell", variant: "solid" } })
      expect(solid.find("svg").attributes("fill")).toBe("currentColor")
    })

    // Tree-shaking boundary: валидное heroicon-имя ВНЕ curated-реестра ('camera',
    // 'beaker' существуют в @heroicons/vue, но не импортированы) НЕ должно резолвиться
    // как heroicon → нет синхронного <svg>. На старом namespace-коде они резолвились
    // (RED) → после перехода на const-реестр их нет в bundle (GREEN).
    it("non-curated heroicon name 'camera' is not bundled → no sync heroicon SVG", () => {
      const wrapper = mount(Icons, { props: { type: "camera" } })
      expect(wrapper.find("svg").exists()).toBe(false)
    })

    it("non-curated heroicon name 'beaker' is not bundled → no sync heroicon SVG", () => {
      const wrapper = mount(Icons, { props: { type: "beaker" } })
      expect(wrapper.find("svg").exists()).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Semantic token migration — Issue 9 / B10 (icons.md, cross-cutting Wave 9)
  // Default color hardcoded `gray-*` → renamed to library semantic `surface-*`
  // (lib/theme/primitive.ts: surface — 23rd named color, default = точная копия
  // gray-шкалы). Family rename only, same numeric tone (900/100) — zero visual
  // change, но подключает default-цвет иконки к theme-token indirection.
  // -----------------------------------------------------------------------
  describe("Semantic token migration — default color uses surface-* (Issue 9 / B10)", () => {
    it("classBase (root) default includes text-surface-900 dark:text-surface-100 (not gray)", () => {
      const wrapper = mount(Icons, { props: { type: "Check" } })
      const classBase = (wrapper.vm as any).classBase as string
      expect(classBase).toContain("text-surface-900")
      expect(classBase).toContain("dark:text-surface-100")
      expect(classBase).not.toContain("gray")
    })

    it("rendered root class attribute carries surface-* tone classes; svg inherits color", () => {
      const wrapper = mount(Icons, { props: { type: "Check" } })
      const rootClass = wrapper.find("[data-icon]").attributes("class")
      expect(rootClass).toContain("text-surface-900")
      expect(rootClass).toContain("dark:text-surface-100")
      expect(wrapper.find("svg").attributes("class")).not.toContain("text-surface-900")
    })
  })

  // props 1.0 (dev-patterns §2 A–D): `class` — корень <i data-icon>, `classes.icon` — <svg data-icon-svg>.
  describe("class / classes (props 1.0)", () => {
    it("`class` lands only on the root, `classes.icon` only on the svg", () => {
      const wrapper = mount(Icons, {
        props: { type: "Check", class: "probe-root", classes: { icon: "probe-icon" } }
      })
      const root = wrapper.find("[data-icon]")
      const svg = wrapper.find("[data-icon-svg]")
      expect(root.classes()).toContain("probe-root")
      expect(root.classes()).not.toContain("probe-icon")
      expect(svg.classes()).toContain("probe-icon")
      expect(svg.classes()).not.toContain("probe-root")
    })

    it("`classes.root` targets the same element as `class`", () => {
      const wrapper = mount(Icons, { props: { type: "Check", classes: { root: "probe-root" } } })
      expect(wrapper.find("[data-icon]").classes()).toContain("probe-root")
    })

    it("consumer sizing overrides the h-5 w-5 base through twMerge (hand-off contract for Button/Badge/Menu)", () => {
      const wrapper = mount(Icons, { props: { type: "Check", class: "h-4 w-4" } })
      const root = wrapper.find("[data-icon]").classes()
      expect(root).toContain("h-4")
      expect(root).toContain("w-4")
      expect(root).not.toContain("h-5")
      expect(root).not.toContain("w-5")
    })

    it("Iconify branch also renders the svg under classes.icon", async () => {
      const wrapper = mount(Icons, {
        props: { type: "icon-park-solid:circles-and-triangles", classes: { icon: "probe-icon" } }
      })
      await flushHero()
      const iconify = wrapper.findComponent({ name: "Icon" })
      if (iconify.exists()) expect(iconify.attributes("class")).toContain("probe-icon")
    })
  })

  // -----------------------------------------------------------------------
  // unstyled — Issue 6 / L53 (icons.md)
  // Наследует cross-cutting guard `Component.setStyle()` (config.unstyled → "").
  // -----------------------------------------------------------------------
  describe("Configuration support — unstyled (L53)", () => {
    afterEach(() => {
      delete (window as any).FishtVue
    })

    const appWith = (config: Record<string, unknown>) => ({
      install(app: any) {
        app.use(FishtVue, config)
      }
    })

    it("root and svg carry the bare `fv` when unstyled:true", () => {
      const wrapper = mount(Icons, {
        props: { type: "Check" },
        global: { plugins: [appWith({ unstyled: true })] }
      })
      expect((wrapper.vm as any).classBase).toBe("fv")
      expect((wrapper.vm as any).classIcon).toBe("fv")
    })

    it("keeps consumer class / classes.icon under unstyled", () => {
      const wrapper = mount(Icons, {
        props: { type: "Check", class: "probe-root", classes: { icon: "probe-icon" } },
        global: { plugins: [appWith({ unstyled: true })] }
      })
      expect(wrapper.find("[data-icon]").classes()).toEqual(["fv", "probe-root"])
      expect(wrapper.find("[data-icon-svg]").classes()).toEqual(["fv", "probe-icon"])
    })

    it("classBase keeps the default class when unstyled:false", () => {
      const wrapper = mount(Icons, {
        props: { type: "Check" },
        global: { plugins: [appWith({ unstyled: false })] }
      })
      expect((wrapper.vm as any).classBase).toContain("h-5")
      expect((wrapper.vm as any).classIcon).toContain("h-full")
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
      // Глобальный `class` — корень; `classes.icon` — svg (слияние по ключу, dev-patterns §2 C)
      expect(wrapper.find("[data-icon]").attributes("class")).toContain("global-class")
      expect(wrapper.find("svg").attributes("class")).not.toContain("global-class")
    })

    it("merges componentsOptions.Icons.classes.icon under props.classes.icon (local wins conflicts)", async () => {
      const app = createAppWithFishtVue({ classes: { icon: "global-icon opacity-50" } })
      const wrapper = mount(Icons, {
        props: { type: "Check", classes: { icon: "opacity-100" } },
        global: { plugins: [app] }
      })
      await flushHero()
      const svg = wrapper.find("[data-icon-svg]").classes()
      expect(svg).toContain("global-icon")
      expect(svg).toContain("opacity-100")
      expect(svg).not.toContain("opacity-50")
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
