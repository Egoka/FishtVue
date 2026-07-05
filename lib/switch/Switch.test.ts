import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Switch from "fishtvue/switch/Switch.vue"

describe("Switch Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Switch)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles the modelValue prop correctly", async () => {
      const wrapper: any = mount(Switch, {
        props: { modelValue: true, switchingType: "switch" }
      })
      expect(wrapper.props("modelValue")).toBe(true)

      const button = wrapper.find("[data-input-switch]")
      expect(button.attributes("aria-checked")).toBe("true")

      await button.trigger("click")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })

    it("supports switchingType as 'checkbox'", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox", modelValue: false }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      expect(checkbox.exists()).toBe(true)
      expect((checkbox.element as any).checked).toBe(false)

      await (checkbox as any).setChecked(true)
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true])
    })

    it("supports the rounded prop", () => {
      const wrapper = mount(Switch, {
        props: { rounded: 5, switchingType: "checkbox" }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      expect(checkbox.attributes("style")).toContain("border-radius: 4px")
    })

    it("emits change:modelValue when value changes", async () => {
      const wrapper = mount(Switch, {
        props: { modelValue: false, switchingType: "checkbox" }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      await (checkbox as any).setChecked(true)
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([true])
    })

    it("disables the switch when the disabled prop is true", () => {
      const wrapper = mount(Switch, {
        props: { disabled: true, switchingType: "switch" }
      })

      const button = wrapper.find("[data-input-switch]")
      expect(button.attributes("disabled")).toBeDefined()
    })

    it("renders label and help text correctly", () => {
      const wrapper = mount(Switch, {
        props: { label: "Test Label", help: "Help text" }
      })

      const label = wrapper.find("[data-switch-label]")
      const help = wrapper.find("[data-switch-help]")
      expect(label.text()).toBe("Test Label")
      expect(help.exists()).toBe(true)
    })

    describe("Switch Component Focus and Blur Tests", () => {
      it.each(["checkbox", "switch"] as const)("handles focus and blur events for type '%s'", async (switchingType) => {
        const wrapper = mount(Switch, {
          props: { switchingType, modelValue: false },
          attachTo: document.body
        })

        const input =
          switchingType === "checkbox" ? wrapper.find("[data-input-checkbox]") : wrapper.find("[data-input-switch]")

        expect(input.exists()).toBe(true)

        await input.trigger("focus")
        expect(wrapper.vm.isActiveSwitch).toBe(true)

        await input.trigger("blur")
        expect(wrapper.vm.isActiveSwitch).toBe(false)

        wrapper.unmount()
      })
    })
  })

  describe("Switch Component Tests with Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Switch: options
          }
        })
      }
    })

    it("applies global options to Switch", () => {
      const app = createAppWithFishtVue({
        mode: "outlined",
        rounded: 10,
        iconActive: "Check",
        iconInactive: "X"
      })

      const wrapper = mount(Switch, { global: { plugins: [app] } })
      expect(wrapper.vm.mode).toBe("outlined")
      expect(wrapper.vm.rounded).toBe(10)
      expect(wrapper.vm.iconActive).toBe("Check")
      expect(wrapper.vm.iconInactive).toBe("X")
    })

    it("overrides global options with local props", () => {
      const app = createAppWithFishtVue({
        mode: "filled",
        rounded: 5
      })

      const wrapper = mount(Switch, {
        global: { plugins: [app] },
        props: { mode: "underlined", rounded: 8 }
      })

      expect(wrapper.vm.mode).toBe("underlined")
      expect(wrapper.vm.rounded).toBe(8)
    })

    it("inherits and applies global styles from options", () => {
      const app = createAppWithFishtVue({
        class: "global-class"
      })

      const wrapper = mount(Switch, { global: { plugins: [app] } })
      const baseSwitch = wrapper.find("[data-switch]")
      expect(baseSwitch.classes()).toContain("global-class")
    })
  })

  // ---------------------------------------------------------------------------
  // Security — XSS guard in help prop (Issue 1)
  // ---------------------------------------------------------------------------
  describe("Security — XSS in help prop", () => {
    it("renders help as text, not HTML, when no slot provided", () => {
      const payload = "<img src=x onerror=\"alert('xss')\">"
      const wrapper = mount(Switch, {
        props: { help: payload, switchingType: "switch" }
      })

      expect(wrapper.html()).not.toContain("<img")
      expect(wrapper.text()).toContain(payload)
    })

    it("does not execute <script> payload in help prop", () => {
      const payload = "<script>window.__xssTriggered=true</script>"
      const wrapper = mount(Switch, {
        props: { help: payload, switchingType: "switch" }
      })

      expect(wrapper.find("script").exists()).toBe(false)
      expect((window as any).__xssTriggered).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Help slot (Issue 1, Option A — slot pattern)
  // ---------------------------------------------------------------------------
  describe("Help slot", () => {
    it("renders help slot content when provided (overrides text fallback)", () => {
      const wrapper = mount(Switch, {
        props: { help: "fallback", switchingType: "switch" },
        slots: { help: "<strong>custom slot</strong>" }
      })

      expect(wrapper.find("strong").exists()).toBe(true)
      expect(wrapper.text()).toContain("custom slot")
      expect(wrapper.text()).not.toContain("fallback")
    })

    it("shows help icon trigger when only slot is provided (no help prop)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        slots: { help: "<em>slot-only</em>" }
      })

      const help = wrapper.find("[data-switch-help]")
      expect(help.exists()).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Emits — no duplicate updateModelValue (Issue 2)
  // ---------------------------------------------------------------------------
  describe("Emits — no duplicate updateModelValue", () => {
    it("does NOT emit camelCase updateModelValue alongside update:modelValue (switch mode)", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", modelValue: false }
      })

      await wrapper.find("[data-input-switch]").trigger("click")
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("updateModelValue")).toBeUndefined()
    })

    it("does NOT emit camelCase updateModelValue (checkbox mode)", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox", modelValue: false }
      })

      await (wrapper.find("[data-input-checkbox]") as any).setChecked(true)
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("updateModelValue")).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Native form integration (Issue 3)
  // ---------------------------------------------------------------------------
  describe("Native form integration", () => {
    it("submits value via FormData in switch mode (modelValue=true)", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="true" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBe("on")

      wrapper.unmount()
    })

    it("omits value from FormData when modelValue=false in switch mode", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="false" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBeNull()

      wrapper.unmount()
    })

    it("omits value from FormData when disabled in switch mode", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="true" :disabled="true" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBeNull()

      wrapper.unmount()
    })

    it("regression — checkbox mode still submits FormData correctly", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="agree" :model-value="true" switching-type="checkbox" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("agree")).toBe("on")

      wrapper.unmount()
    })
  })

  // ---------------------------------------------------------------------------
  // Expose — inputRef / focus / blur (Issue 11)
  // ---------------------------------------------------------------------------
  describe("Expose — inputRef + focus/blur", () => {
    it("exposes inputRef pointing to the native button in switch mode", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const input = wrapper.find("[data-input-switch]").element
      expect((wrapper.vm as any).inputRef).toBe(input)

      wrapper.unmount()
    })

    it("exposes inputRef pointing to the native input in checkbox mode", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox" },
        attachTo: document.body
      })

      const input = wrapper.find("[data-input-checkbox]").element
      expect((wrapper.vm as any).inputRef).toBe(input)

      wrapper.unmount()
    })

    it("focus() programmatically focuses the native control (switch mode)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      ;(wrapper.vm as any).focus()
      expect(document.activeElement).toBe(wrapper.find("[data-input-switch]").element)

      wrapper.unmount()
    })

    it("focus() programmatically focuses the native control (checkbox mode)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox" },
        attachTo: document.body
      })

      ;(wrapper.vm as any).focus()
      expect(document.activeElement).toBe(wrapper.find("[data-input-checkbox]").element)

      wrapper.unmount()
    })

    it("blur() removes focus from the native control", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const el = wrapper.find("[data-input-switch]").element as HTMLElement
      el.focus()
      expect(document.activeElement).toBe(el)
      ;(wrapper.vm as any).blur()
      expect(document.activeElement).not.toBe(el)

      wrapper.unmount()
    })

    it("focus(options) forwards FocusOptions to native focus()", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const el = wrapper.find("[data-input-switch]").element as HTMLElement
      const spy = vi.spyOn(el, "focus")

      ;(wrapper.vm as any).focus({ preventScroll: true })
      expect(spy).toHaveBeenCalledWith({ preventScroll: true })

      spy.mockRestore()
      wrapper.unmount()
    })
  })

  // ---------------------------------------------------------------------------
  // Logical properties — RTL friendliness (Issue 8)
  // ---------------------------------------------------------------------------
  describe("Logical CSS properties (RTL)", () => {
    it("uses logical end-0 instead of right-0 on the after-input container", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", help: "h" }
      })

      const after = wrapper.find("[data-switch-after]")
      const cls = after.attributes("class") ?? ""
      expect(cls).toMatch(/(^|\s)end-0(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)right-0(\s|$)/)
    })

    it("uses logical me-2 instead of mr-2 on the help icon body", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", help: "h" }
      })

      const help = wrapper.find("[data-switch-help]")
      const cls = help.attributes("class") ?? ""
      expect(cls).toMatch(/(^|\s)me-2(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)mr-2(\s|$)/)
    })
  })

  // ---------------------------------------------------------------------------
  // Reduced motion — motion-safe transitions (Issue 7)
  // ---------------------------------------------------------------------------
  describe("Reduced motion — motion-safe transitions", () => {
    it("wraps switch-track transitions in motion-safe: (switch mode)", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch" } })
      const cls = wrapper.find("[data-input-switch]").attributes("class") ?? ""
      expect(cls).toContain("motion-safe:transition-colors")
      expect(cls).toContain("motion-safe:duration-200")
      expect(cls).not.toMatch(/(^|\s)transition-colors(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)duration-200(\s|$)/)
    })

    it("wraps the checkbox-track transition in motion-safe: (checkbox mode)", () => {
      const wrapper = mount(Switch, { props: { switchingType: "checkbox" } })
      const cls = wrapper.find("[data-input-checkbox]").attributes("class") ?? ""
      expect(cls).toContain("motion-safe:transition")
      expect(cls).not.toMatch(/(^|\s)transition(\s|$)/)
    })

    it("wraps the root container transition in motion-safe:", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch" } })
      const cls = wrapper.find("[data-switch]").attributes("class") ?? ""
      expect(cls).toContain("motion-safe:transition-all")
      expect(cls).not.toMatch(/(^|\s)transition-all(\s|$)/)
    })

    it("routes the icon-thumb (iconActive/iconInactive branch) through motion-safe + theme via setStyle", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", modelValue: true, iconActive: "Check", iconInactive: "X" }
      })
      // Switch передаёт thumb-классы в Icons как `class`-prop (Icons прокидывает их
      // на async-резолвящуюся иконку); сам heroicon в jsdom не резолвится синхронно,
      // поэтому ассертим на prop, а не на DOM.
      const cls = String(wrapper.findComponent({ name: "Icons" }).props("class") ?? "")
      expect(cls).toContain("motion-safe:transition-all")
      expect(cls).toContain("motion-safe:duration-300")
      expect(cls).toContain("bg-theme-100")
      expect(cls).not.toMatch(/(^|\s)transition-all(\s|$)/)
    })
  })

  // ---------------------------------------------------------------------------
  // Print styles (Issue 14) — style-for-print, not display:none
  // ---------------------------------------------------------------------------
  describe("Print styles", () => {
    it("renders style-for-print classes on the root (not display:none)", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch" } })
      const cls = wrapper.find("[data-switch]").attributes("class") ?? ""
      expect(cls).toContain("print:bg-white")
      expect(cls).toContain("print:text-black")
      expect(cls).toContain("print:shadow-none")
      expect(cls).not.toContain("print:hidden")
    })
  })

  // ---------------------------------------------------------------------------
  // B10 — forced-colors visibility + preset-aware theme tokens (Issue 12)
  // ---------------------------------------------------------------------------
  describe("B10 — forced-colors + theme tokens", () => {
    it("keeps the switch track visible in forced-colors (high-contrast) mode", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch" } })
      const cls = wrapper.find("[data-input-switch]").attributes("class") ?? ""
      expect(cls).toContain("forced-colors:outline")
    })

    it("routes the active thumb through the preset-aware theme-* token", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch", modelValue: true } })
      const thumb = wrapper.find("[data-input-switch] span")
      expect(thumb.attributes("class") ?? "").toContain("bg-theme-")
    })
  })

  // ---------------------------------------------------------------------------
  // Configuration support — unstyled (Issue 10, cross-cutting Component.setStyle guard)
  // ---------------------------------------------------------------------------
  describe("Configuration support — unstyled", () => {
    const appWithConfig = (config: Record<string, unknown>) => ({
      install(app: any) {
        app.use(FishtVue, config)
      }
    })

    // `window.FishtVue` — глобальный singleton (config inject-first / window-fallback):
    // чистим, чтобы unstyled:true из теста не протёк в соседние тесты/файлы.
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("strips all classes from the root when global unstyled: true", () => {
      const wrapper = mount(Switch, {
        global: { plugins: [appWithConfig({ unstyled: true })] },
        props: { switchingType: "switch" }
      })
      // Component.setStyle() возвращает "" при unstyled → ни базовых классов,
      // ни `fv {prefix}-switch`-префикса на корне.
      const cls = (wrapper.find("[data-switch]").attributes("class") ?? "").trim()
      expect(cls).toBe("")
    })

    it("keeps base classes when unstyled is false (contrast)", () => {
      const wrapper = mount(Switch, {
        global: { plugins: [appWithConfig({ unstyled: false })] },
        props: { switchingType: "switch" }
      })
      const cls = wrapper.find("[data-switch]").attributes("class") ?? ""
      expect(cls).toContain("relative")
    })
  })

  // ---------------------------------------------------------------------------
  // Audit issue — Documentation/issues/switch.md Issue 12 residual (2026-07-05, Wave 9)
  // Структурные нейтрали gray-*/stone-*/slate-* → surface-* (family rename, same tone).
  // theme-*/forced-colors/motion-safe/print: accents и text-red-* asterisk НЕ трогаются.
  // ---------------------------------------------------------------------------
  describe("Issue 12 residual — B10 hardcode: gray-*/stone-*/slate-* → surface-* (Wave 9)", () => {
    it("classBaseSwitch (outlined, switch mode) uses surface-* border/bg, not gray-*/slate-*/stone-*", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", mode: "outlined", disabled: true }
      })
      const cls = String((wrapper.vm as any).classBaseSwitch ?? "")
      expect(cls).toContain("border-surface-300")
      expect(cls).toContain("dark:border-surface-600")
      // twMerge коллапсирует конфликтующий bg-* utility-slot — при disabled:true survivor'ом
      // остаётся bg-surface-50/dark:bg-surface-950 (последний в массиве), bg-white/dark:bg-black
      // (недизейбленный base) уходит. Это pre-existing поведение merge-движка, не связано с миграцией.
      expect(cls).toContain("bg-surface-50")
      expect(cls).toContain("dark:bg-surface-950")
      expect(cls).not.toMatch(/(?:^|\s)border-gray-300(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:border-gray-600(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)bg-slate-50(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-stone-950(?:\s|$)/)
    })

    it("classBaseSwitch (outlined, switch mode, enabled) keeps bg-white/dark:bg-black base untouched (no disabled-override collision)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", mode: "outlined", disabled: false }
      })
      const cls = String((wrapper.vm as any).classBaseSwitch ?? "")
      expect(cls).toContain("bg-white")
      expect(cls).toContain("dark:bg-black")
    })

    it("classBaseSwitch (outlined, checkbox mode) uses surface-* border/bg, not gray-*/slate-*/stone-*", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox", mode: "outlined", disabled: true }
      })
      const cls = String((wrapper.vm as any).classBaseSwitch ?? "")
      expect(cls).toContain("border-surface-300")
      expect(cls).toContain("dark:border-surface-600")
      expect(cls).toContain("bg-surface-50")
      expect(cls).toContain("dark:bg-surface-950")
      expect(cls).not.toMatch(/(?:^|\s)border-gray-300(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)bg-slate-50(?:\s|$)/)
    })

    it("classBaseSwitch (underlined, both modes) uses surface-* border/bg, not gray-*/stone-*", () => {
      for (const switchingType of ["switch", "checkbox"] as const) {
        const wrapper = mount(Switch, { props: { switchingType, mode: "underlined" } })
        const cls = String((wrapper.vm as any).classBaseSwitch ?? "")
        expect(cls).toContain("border-surface-300")
        expect(cls).toContain("dark:border-surface-700")
        expect(cls).toContain("bg-surface-50")
        expect(cls).toContain("dark:bg-surface-950")
        expect(cls).not.toMatch(/(?:^|\s)border-gray-300(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)dark:border-gray-700(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)bg-stone-50(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)dark:bg-stone-950(?:\s|$)/)
      }
    })

    it("classBaseSwitch (filled, both modes) uses surface-* bg, not stone-*", () => {
      for (const switchingType of ["switch", "checkbox"] as const) {
        const wrapper = mount(Switch, { props: { switchingType, mode: "filled" } })
        const cls = String((wrapper.vm as any).classBaseSwitch ?? "")
        expect(cls).toContain("bg-surface-100")
        expect(cls).toContain("dark:bg-surface-900")
        expect(cls).not.toMatch(/(?:^|\s)bg-stone-100(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)dark:bg-stone-900(?:\s|$)/)
      }
    })

    it("classSwitch (switch-track, disabled off-state) uses surface-* bg, not gray-*", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", disabled: true, modelValue: false }
      })
      const cls = String((wrapper.vm as any).classSwitch ?? "")
      expect(cls).toContain("bg-surface-200")
      expect(cls).toContain("dark:bg-surface-800")
      expect(cls).not.toMatch(/(?:^|\s)bg-gray-200(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-gray-800(?:\s|$)/)
    })

    it("classSwitch (switch-track, disabled on-state) has no leftover gray-* — surviving bg is the later theme-* accent (twMerge collapses the bg-* conflict slot)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", disabled: true, modelValue: true }
      })
      const cls = String((wrapper.vm as any).classSwitch ?? "")
      // twMerge коллапсирует конфликтующий bg-*: disabled-branch пишет bg-surface-600/dark:bg-surface-400
      // ПЕРЕД безусловной on-state строкой bg-theme-600/dark:bg-theme-400 → выживает последняя (theme-*).
      // Pre-existing поведение merge-движка (было идентично с bg-gray-600 до миграции) — важно, что
      // никакого bg-gray-600/dark:bg-gray-400 не осталось нигде в строке.
      expect(cls).toContain("bg-theme-600")
      expect(cls).toContain("dark:bg-theme-400")
      expect(cls).not.toMatch(/(?:^|\s)bg-gray-600(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-gray-400(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)bg-surface-600(?:\s|$)/) // тоже коллапсировано — не должно "случайно" выжить
    })

    it("classSwitch (switch-track, enabled off-state) uses surface-* bg, keeps theme-* on-state untouched", () => {
      const off = mount(Switch, { props: { switchingType: "switch", modelValue: false } })
      const offCls = String((off.vm as any).classSwitch ?? "")
      expect(offCls).toContain("bg-surface-200")
      expect(offCls).toContain("dark:bg-surface-800")
      expect(offCls).not.toMatch(/(?:^|\s)bg-gray-200(?:\s|$)/)
      expect(offCls).not.toMatch(/(?:^|\s)dark:bg-gray-800(?:\s|$)/)

      const on = mount(Switch, { props: { switchingType: "switch", modelValue: true } })
      const onCls = String((on.vm as any).classSwitch ?? "")
      // preset-aware theme accent — уже semantic, НЕ мигрируется (см. Issue 12 note)
      expect(onCls).toContain("bg-theme-600")
      expect(onCls).toContain("dark:bg-theme-400")
    })

    it("classSwitch (switch-track ring) uses surface-* ring, keeps /5 opacity suffix", () => {
      const wrapper = mount(Switch, { props: { switchingType: "switch" } })
      const cls = String((wrapper.vm as any).classSwitch ?? "")
      expect(cls).toContain("ring-surface-900/5")
      expect(cls).toContain("dark:ring-surface-900/5")
      expect(cls).not.toMatch(/(?:^|\s)ring-gray-900\/5(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:ring-gray-900\/5(?:\s|$)/)
    })

    it("classSwitch (checkbox-track thumb bg/border) uses surface-*, not stone-*/gray-*", () => {
      const wrapper = mount(Switch, { props: { switchingType: "checkbox" } })
      const cls = String((wrapper.vm as any).classSwitch ?? "")
      expect(cls).toContain("bg-surface-50")
      expect(cls).toContain("dark:bg-surface-950")
      expect(cls).toContain("border-surface-300")
      expect(cls).toContain("dark:border-surface-700")
      expect(cls).not.toMatch(/(?:^|\s)bg-stone-50(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-stone-950(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)border-gray-300(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:border-gray-700(?:\s|$)/)
    })

    it("classSwitch (checkbox-track disabled) uses surface-* for disabled:bg/text/accent, not slate-*", () => {
      const wrapper = mount(Switch, { props: { switchingType: "checkbox", disabled: true } })
      const cls = String((wrapper.vm as any).classSwitch ?? "")
      expect(cls).toContain("disabled:bg-surface-500")
      expect(cls).toContain("disabled:text-surface-500")
      expect(cls).toContain("disabled:accent-surface-500")
      expect(cls).not.toMatch(/(?:^|\s)disabled:bg-slate-500(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)disabled:text-slate-500(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)disabled:accent-slate-500(?:\s|$)/)
    })

    it("classLabel (switch mode) uses surface-* text color, not gray-*/slate-*; keeps text-red-* asterisk untouched", () => {
      const enabled = mount(Switch, { props: { switchingType: "switch", label: "L", required: true } })
      const enabledCls = String((enabled.vm as any).classLabel ?? "")
      expect(enabledCls).toContain("text-surface-900")
      expect(enabledCls).toContain("dark:text-surface-100")
      expect(enabledCls).toContain("after:text-red-500")
      expect(enabledCls).not.toMatch(/(?:^|\s)text-gray-900(?:\s|$)/)
      expect(enabledCls).not.toMatch(/(?:^|\s)dark:text-gray-100(?:\s|$)/)

      const disabled = mount(Switch, { props: { switchingType: "switch", label: "L", disabled: true } })
      const disabledCls = String((disabled.vm as any).classLabel ?? "")
      expect(disabledCls).toContain("text-surface-800")
      expect(disabledCls).toContain("dark:text-surface-200")
      expect(disabledCls).not.toMatch(/(?:^|\s)text-slate-800(?:\s|$)/)
      expect(disabledCls).not.toMatch(/(?:^|\s)dark:text-slate-200(?:\s|$)/)
    })

    it("classLabel (checkbox mode) uses surface-* text color, not gray-*/slate-*; keeps text-red-* asterisk untouched", () => {
      const enabled = mount(Switch, {
        props: { switchingType: "checkbox", label: "L", required: true }
      })
      const enabledCls = String((enabled.vm as any).classLabel ?? "")
      expect(enabledCls).toContain("text-surface-600")
      expect(enabledCls).toContain("dark:text-surface-400")
      expect(enabledCls).toContain("after:text-red-500")
      expect(enabledCls).toContain("after:dark:text-red-800")
      expect(enabledCls).not.toMatch(/(?:^|\s)text-gray-600(?:\s|$)/)
      expect(enabledCls).not.toMatch(/(?:^|\s)dark:text-gray-400(?:\s|$)/)

      const disabled = mount(Switch, { props: { switchingType: "checkbox", label: "L", disabled: true } })
      const disabledCls = String((disabled.vm as any).classLabel ?? "")
      expect(disabledCls).toContain("text-surface-800")
      expect(disabledCls).toContain("dark:text-surface-200")
      expect(disabledCls).not.toMatch(/(?:^|\s)text-slate-800(?:\s|$)/)
      expect(disabledCls).not.toMatch(/(?:^|\s)dark:text-slate-200(?:\s|$)/)
    })

    it("classIconContent (help tooltip) uses surface-* bg/text, not stone-*/gray-*", () => {
      const wrapper = mount(Switch, { props: { help: "h" } })
      const cls = String((wrapper.vm as any).classIconContent ?? "")
      expect(cls).toContain("bg-white")
      expect(cls).toContain("dark:bg-surface-900")
      expect(cls).toContain("text-surface-500")
      expect(cls).toContain("dark:text-surface-400")
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-stone-900(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)text-gray-500(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:text-gray-400(?:\s|$)/)
    })

    it("classSwitchIcon (thumb off-state bg + ring) uses surface-*, keeps theme-* on-state untouched", () => {
      const off = mount(Switch, { props: { switchingType: "switch", modelValue: false } })
      const offIcon = off.find("[data-input-switch] span")
      const offCls = offIcon.attributes("class") ?? ""
      expect(offCls).toContain("bg-surface-100")
      expect(offCls).toContain("dark:bg-surface-950")
      expect(offCls).toContain("ring-surface-900/5")
      expect(offCls).not.toMatch(/(?:^|\s)bg-gray-100(?:\s|$)/)
      expect(offCls).not.toMatch(/(?:^|\s)dark:bg-gray-950(?:\s|$)/)
      expect(offCls).not.toMatch(/(?:^|\s)ring-gray-900\/5(?:\s|$)/)

      const on = mount(Switch, { props: { switchingType: "switch", modelValue: true } })
      const onIcon = on.find("[data-input-switch] span")
      const onCls = onIcon.attributes("class") ?? ""
      // preset-aware theme accent — уже semantic, НЕ мигрируется
      expect(onCls).toContain("bg-theme-100")
      expect(onCls).toContain("dark:bg-theme-900")
    })

    it("classSwitchIconImg (icon-thumb branch) uses surface-* off-state bg + icon color, not gray-*", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", modelValue: false, iconActive: "Check", iconInactive: "X" }
      })
      const cls = String(wrapper.findComponent({ name: "Icons" }).props("class") ?? "")
      expect(cls).toContain("bg-surface-100")
      expect(cls).toContain("dark:bg-surface-950")
      expect(cls).toContain("text-surface-400")
      expect(cls).toContain("dark:text-surface-600")
      expect(cls).not.toMatch(/(?:^|\s)bg-gray-100(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:bg-gray-950(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)text-gray-400(?:\s|$)/)
      expect(cls).not.toMatch(/(?:^|\s)dark:text-gray-600(?:\s|$)/)
    })

    it("keeps the required-asterisk text-red-* and help-icon hover:text-yellow-500 fully untouched (out of scope)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", required: true, help: "h" },
        slots: { help: "x" }
      })
      const labelCls = String((wrapper.vm as any).classLabel ?? "")
      expect(labelCls).toContain("after:text-red-500")

      const helpIcon = wrapper.find(
        "[data-switch-help] svg, [data-switch-help] .fv-icon, [data-switch-help] [class*='Icon']"
      )
      // Icons может не резолвиться синхронно в jsdom — ищем по классу на любом дочернем узле help-блока.
      const helpBlockHtml = wrapper.find("[data-switch-help]").html()
      expect(helpBlockHtml).toContain("hover:text-yellow-500")
    })
  })
})
