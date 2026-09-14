import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { defineComponent, createApp, h } from "vue"
import Textarea from "fishtvue/textarea/Textarea.vue"
import FishtVue from "fishtvue/config"
import type { TextareaExpose } from "fishtvue/textarea"

describe("Textarea Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Textarea)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles prop: modelValue", async () => {
      const wrapper = mount(Textarea, {
        props: { modelValue: "Test value" }
      })
      const textarea = wrapper.find("textarea")
      expect(textarea.element.value).toBe("Test value")

      await wrapper.setProps({ modelValue: "Updated value" })
      expect(textarea.element.value).toBe("Updated value")
    })

    it("emits correct events on input and change", async () => {
      const wrapper = mount(Textarea, {
        props: { modelValue: "" }
      })
      const textarea = wrapper.find("textarea")

      await textarea.setValue("New value")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
      expect(wrapper.emitted("update:invalid")?.[0]).toEqual([false])

      await textarea.trigger("change")
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual(["New value"])
    })

    it("applies correct attributes for props", () => {
      const wrapper = mount(Textarea, {
        props: {
          placeholder: "Enter text",
          autocomplete: "off",
          wrap: "hard",
          rows: 5,
          maxLength: 50
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Enter text")
      expect(textarea.attributes("autocomplete")).toBe("off")
      expect(textarea.attributes("wrap")).toBe("hard")
      expect(textarea.attributes("rows")).toBe("5")
      expect(textarea.attributes("maxlength")).toBe("50")
    })

    it("handles focus and blur events correctly", async () => {
      const wrapper = mount(Textarea)
      const textarea = wrapper.find("textarea")

      await textarea.trigger("focus")
      expect(wrapper.emitted("focus")).toBeTruthy()

      await textarea.trigger("blur")
      expect(wrapper.emitted("blur")).toBeTruthy()
    })

    it("clears the value and emits clear event when clear button is clicked", async () => {
      const wrapper = mount(Textarea, {
        props: { modelValue: "Test value", clearable: true }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] [data-icon]")
      await clearButton.trigger("click")
      expect(wrapper.emitted("update:invalid")?.[0]).toEqual([false])
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([""])
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Textarea: options
        }
      })
      return app
    }

    it("applies global component-specific options to Textarea", () => {
      const app: any = createAppWithFishtVue({
        rows: 3,
        maxLength: 100
      })

      const wrapper = mount(Textarea, {
        global: { plugins: [app] },
        props: {
          placeholder: "Global Placeholder"
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Global Placeholder")
      expect(textarea.attributes("rows")).toBe("3")
      expect(textarea.attributes("maxlength")).toBe("100")
    })

    it("overrides global options with local props", () => {
      const app: any = createAppWithFishtVue({
        placeholder: "Global Placeholder",
        rows: 5
      })

      const wrapper = mount(Textarea, {
        global: { plugins: [app] },
        props: {
          placeholder: "Local Placeholder",
          rows: 10
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Local Placeholder")
      expect(textarea.attributes("rows")).toBe("10")
    })

    it("emits correct events on input when initialized with options", async () => {
      const app: any = createAppWithFishtVue({
        rows: 4
      })

      const wrapper = mount(Textarea, {
        global: { plugins: [app] },
        props: { modelValue: "Initial value" }
      })

      const textarea = wrapper.find("textarea")
      await textarea.setValue("New value")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
    })
  })

  // ---AUDIT CLOSE-OUT (Documentation/issues/aria.md) ---------------
  describe("Audit close-out fixes", () => {
    const resetGlobalFishtVue = () => {
      delete (window as any).FishtVue
    }

    // ---ISSUE 1 — change:modelValue payload type is string -----------
    it("emits change:modelValue with a string payload (Issue 1)", async () => {
      resetGlobalFishtVue()
      const wrapper = mount(Textarea, { props: { modelValue: "" } })
      const textarea = wrapper.find("textarea")
      await textarea.setValue("hello")
      await textarea.trigger("change")
      const payload = wrapper.emitted("change:modelValue")?.[0]?.[0]
      expect(typeof payload).toBe("string")
      expect(payload).toBe("hello")
    })

    it("clear() emits change:modelValue with empty string (Issue 1)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Textarea, { props: { modelValue: "x", clearable: true } })
      ;(wrapper.vm as unknown as TextareaExpose).clear()
      const payload = wrapper.emitted("change:modelValue")?.[0]?.[0]
      expect(typeof payload).toBe("string")
      expect(payload).toBe("")
    })

    // ---ISSUE 4 — Textarea.componentsStyle() fallback in mode -----------
    describe("Issue 4 — componentsStyle global fallback", () => {
      it("uses Textarea.componentsStyle() fallback when no props.mode and no options.mode", () => {
        resetGlobalFishtVue()
        const app: any = createApp({})
        app.use(FishtVue, { componentsStyle: "filled" })
        const wrapper = mount(Textarea, { global: { plugins: [app] } })
        expect((wrapper.vm as unknown as TextareaExpose).mode).toBe("filled")
      })

      it("priority chain: props.mode > options.mode > componentsStyle > 'outlined'", () => {
        // 1. props.mode wins over everything else
        resetGlobalFishtVue()
        const app1: any = createApp({})
        app1.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Textarea: { mode: "underlined" } }
        })
        const w1 = mount(Textarea, {
          global: { plugins: [app1] },
          props: { mode: "outlined" }
        })
        expect((w1.vm as unknown as TextareaExpose).mode).toBe("outlined")

        // 2. options.mode wins over componentsStyle
        resetGlobalFishtVue()
        const app2: any = createApp({})
        app2.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Textarea: { mode: "underlined" } }
        })
        const w2 = mount(Textarea, { global: { plugins: [app2] } })
        expect((w2.vm as unknown as TextareaExpose).mode).toBe("underlined")

        // 3. componentsStyle wins over the literal default
        resetGlobalFishtVue()
        const app3: any = createApp({})
        app3.use(FishtVue, { componentsStyle: "filled" })
        const w3 = mount(Textarea, { global: { plugins: [app3] } })
        expect((w3.vm as unknown as TextareaExpose).mode).toBe("filled")

        // 4. literal default when nothing set
        resetGlobalFishtVue()
        const app4: any = createApp({})
        app4.use(FishtVue, {})
        const w4 = mount(Textarea, { global: { plugins: [app4] } })
        expect((w4.vm as unknown as TextareaExpose).mode).toBe("outlined")
      })
    })

    // ---ISSUE 5 — unstyled cross-cutting enforcement -----------
    it("respects unstyled: true via Component.setStyle guard (Issue 5)", () => {
      resetGlobalFishtVue()
      const app: any = createApp({})
      app.use(FishtVue, { unstyled: true })
      const wrapper = mount(Textarea, { global: { plugins: [app] } })
      const textarea = wrapper.find("textarea")
      // Под unstyled setStyle отдаёт только `fv` + классы потребителя (§2 E).
      expect(textarea.attributes("class") ?? "").toBe("fv")
    })

    // ---ISSUE 7 — modelValue narrowed to string|null|undefined -----------
    it.each<[string, string | null | undefined]>([
      ["null", null],
      ["undefined", undefined],
      ["empty", ""]
    ])("renders empty textarea for modelValue=%s (Issue 7)", (_label, value) => {
      resetGlobalFishtVue()
      const wrapper = mount(Textarea, { props: { modelValue: value } })
      const textarea = wrapper.find("textarea")
      expect((textarea.element as HTMLTextAreaElement).value).toBe("")
    })

    // ---ISSUE 8 — typed slot props for #before / #after -----------
    it("provides typed slot props { invalid, focused, clear } to #after (Issue 8)", async () => {
      resetGlobalFishtVue()
      let captured: { invalid?: boolean; focused?: boolean; clear?: () => void } = {}
      const Host = defineComponent({
        props: { invalid: { type: Boolean, default: false } },
        setup(props) {
          return () =>
            h(
              Textarea,
              { modelValue: "abc", invalid: props.invalid, clearable: true },
              {
                after: (slotProps: { invalid: boolean; focused: boolean; clear: () => void }) => {
                  captured = slotProps
                  return h("span", { "data-after-marker": true }, "after")
                }
              }
            )
        }
      })

      const wrapper = mount(Host)
      expect(typeof captured.invalid).toBe("boolean")
      expect(typeof captured.focused).toBe("boolean")
      expect(typeof captured.clear).toBe("function")
      expect(captured.invalid).toBe(false)
      expect(captured.focused).toBe(false)

      await wrapper.setProps({ invalid: true })
      expect(captured.invalid).toBe(true)
    })

    it("provides typed slot props { invalid, focused } to #before (Issue 8)", () => {
      resetGlobalFishtVue()
      let captured: { invalid?: boolean; focused?: boolean } = {}
      const Host = defineComponent({
        setup() {
          return () =>
            h(
              Textarea,
              { modelValue: "abc", invalid: true },
              {
                before: (slotProps: { invalid: boolean; focused: boolean }) => {
                  captured = slotProps
                  return h("span", "before")
                }
              }
            )
        }
      })

      mount(Host)
      expect(typeof captured.invalid).toBe("boolean")
      expect(typeof captured.focused).toBe("boolean")
      expect(captured.invalid).toBe(true)
    })

    // ---ISSUE 9 — motion-safe placeholder transition -----------
    it("uses motion-safe:placeholder:transition-all in classControl (Issue 9)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Textarea, { props: { label: "Comment" } })
      const cls = wrapper.find("textarea").attributes("class") ?? ""
      expect(cls).toMatch(/motion-safe:placeholder:transition-all/)
      expect(cls).not.toMatch(/(?<!motion-safe:)placeholder:transition-all/)
    })

    // ---ISSUE 11 — print styles -----------
    it("includes print:* classes in classControl (Issue 11)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Textarea)
      const cls = wrapper.find("textarea").attributes("class") ?? ""
      expect(cls).toMatch(/print:/)
    })

    // ---ISSUE 11 — B10 hardcode: gray-* → surface-* (design-token migration) -----------
    describe("Issue 11 — B10 hardcode: gray-* → surface-* (design-token migration)", () => {
      it("classControl uses surface-* for textarea text color, not hardcoded gray-*", () => {
        resetGlobalFishtVue()
        const wrapper = mount(Textarea)
        const cls = wrapper.find("textarea").attributes("class") ?? ""
        expect(cls).toContain("text-surface-900")
        expect(cls).toContain("dark:text-surface-100")
        expect(cls).not.toMatch(/(?:^|\s)text-gray-900(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)dark:text-gray-100(?:\s|$)/)
      })

      it("classControl uses surface-* for focus placeholder color, not hardcoded gray-*", () => {
        resetGlobalFishtVue()
        const wrapper = mount(Textarea)
        const cls = wrapper.find("textarea").attributes("class") ?? ""
        expect(cls).toContain("focus:placeholder:text-surface-400")
        expect(cls).toContain("focus:placeholder:dark:text-surface-500")
        expect(cls).not.toMatch(/(?:^|\s)focus:placeholder:text-gray-400(?:\s|$)/)
        expect(cls).not.toMatch(/(?:^|\s)focus:placeholder:dark:text-gray-500(?:\s|$)/)
      })
    })
  })

  // ---ISSUE 2 — no duplicate initStyle (Wave 2.3) ------------------
  describe("Initialization (no-dup initStyle)", () => {
    // `Component.initStyle` — class field arrow (instance property, not on
    // prototype) — поэтому vi.spyOn(prototype) не сработает. Регрессионный
    // static-source check вместо behavioural spy: канон требует, чтобы стили
    // инициализировались только через Component.__hooks(), без явного
    // Textarea.initStyle() в SFC.
    it("Textarea.vue does not contain duplicate onMounted(initStyle) (Issue 2)", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Textarea.vue"), "utf8")
      // Discard line comments before scanning so a future doc-comment about
      // the deprecation doesn't cause a false positive.
      const code = src.replace(/\/\/[^\n]*/g, "")
      expect(code).not.toMatch(/Textarea\.initStyle\s*\(/)
    })
  })

  describe("Accessibility — label/for association (Wave 4)", () => {
    it("auto-generates an id on the textarea and links the label via `for`", () => {
      const wrapper = mount(Textarea, { props: { label: "Bio" } })
      const ta = wrapper.find("textarea")
      const id = ta.attributes("id")
      expect(id).toBeTruthy()
      expect(wrapper.find("label[data-label]").attributes("for")).toBe(id)
    })

    it("respects an explicit `id` prop for both textarea and label `for`", () => {
      const wrapper = mount(Textarea, { props: { label: "Bio", id: "bio-field" } })
      expect(wrapper.find("textarea").attributes("id")).toBe("bio-field")
      expect(wrapper.find("label[data-label]").attributes("for")).toBe("bio-field")
    })
  })

  // Wave 13 / W2 — контракт props 1.0: `class` → корень `[data-textarea]`, `classes` → карта
  // (семейные ключи + `control`), positive-булевы, emit `update:invalid`, slot-props `invalid`/`focused`.
  describe("Props 1.0 — class / classes / булевы / emits (Wave 13, W2)", () => {
    const withOptions = (options: Record<string, unknown>): any => {
      const app = createApp({})
      app.use(FishtVue, { componentsOptions: { Textarea: options } })
      return app
    }
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("публичный набор props — контракт 1.0 (classInput/isInvalid/clear/classBody сняты)", () => {
      const wrapper = mount(Textarea)
      expect(wrapper.props()).toEqual({
        id: undefined,
        modelValue: undefined,
        classes: undefined,
        mode: undefined,
        label: undefined,
        labelMode: undefined,
        invalid: undefined,
        messageInvalid: undefined,
        required: undefined,
        loading: undefined,
        disabled: undefined,
        help: undefined,
        clearable: undefined,
        width: undefined,
        height: undefined,
        class: undefined,
        offsetTop: undefined,
        placeholder: undefined,
        autocomplete: undefined,
        wrap: undefined,
        rows: undefined,
        maxLength: undefined
      })
    })

    it("legacy-имена (classInput/isInvalid/clear) падают атрибутами на корень и ничего не меняют", () => {
      const wrapper = mount(Textarea, {
        props: { modelValue: "v", classInput: "old-ctl", isInvalid: true, clear: true } as any
      })
      expect(wrapper.find("[data-textarea]").attributes("classinput")).toBe("old-ctl")
      expect(wrapper.find("[data-textarea-control]").classes()).not.toContain("old-ctl")
      expect(wrapper.find("[data-input-layout-clear]").exists()).toBe(false)
    })

    it("корень Textarea — корень InputLayout с data-textarea; `class` только на нём", () => {
      const wrapper = mount(Textarea, { props: { label: "L", class: "probe-root" } })
      const root = wrapper.find("[data-textarea]")
      expect(root.attributes("data-input-layout")).toBeDefined()
      expect(root.classes()).toContain("probe-root")
      expect(root.element.querySelectorAll("[class~='probe-root']").length).toBe(0)
    })

    it.each([
      ["base", "[data-input-layout-base]"],
      ["label", "[data-label]"],
      ["control", "[data-textarea-control]"]
    ])("classes.%s → %s", (key, selector) => {
      const wrapper = mount(Textarea, { props: { label: "L", classes: { [key]: "probe-key" } } })
      expect(wrapper.find(selector).classes()).toContain("probe-key")
      expect(wrapper.find("[data-textarea]").classes()).not.toContain("probe-key")
    })

    it("рамка поля сохраняет max-h-max отдельным классом (раньше склеивалось с props.class без пробела)", () => {
      const wrapper = mount(Textarea, { props: { class: "probe-root" } })
      expect(wrapper.find("[data-input-layout-base]").classes()).toContain("max-h-max")
      expect(wrapper.find("[data-textarea]").classes()).toContain("probe-root")
      expect(wrapper.find("[data-textarea]").classes().join(" ")).not.toContain("probe-rootmax-h-max")
    })

    it("componentsOptions.Textarea.classes сливается по ключу под props.classes", () => {
      const wrapper = mount(Textarea, {
        global: { plugins: [withOptions({ class: "opt-root", classes: { control: "p-2 opt-ctl" } })] },
        props: { class: "prop-root", classes: { control: "p-4" } }
      })
      const control = wrapper.find("[data-textarea-control]").classes()
      expect(control).toContain("p-4")
      expect(control).toContain("opt-ctl")
      expect(control).not.toContain("p-2")
      expect(wrapper.find("[data-textarea]").classes()).toEqual(expect.arrayContaining(["opt-root", "prop-root"]))
    })

    it("focus-ring живёт в classes.base и уступает красной рамке ошибки", async () => {
      const wrapper = mount(Textarea, { attachTo: document.body })
      const base = () => wrapper.find("[data-input-layout-base]").classes()
      await wrapper.find("textarea").trigger("focus")
      expect(base()).toContain("ring-theme-600")
      await wrapper.setProps({ invalid: true })
      expect(base()).toContain("ring-red-500")
      expect(base()).not.toContain("ring-theme-600")
      wrapper.unmount()
    })

    it("clearable достижим через componentsOptions и перебивается prop'ом", () => {
      const opt = mount(Textarea, {
        global: { plugins: [withOptions({ clearable: true })] },
        props: { modelValue: "v" }
      })
      expect(opt.props("clearable")).toBeUndefined()
      expect(opt.find("[data-input-layout-clear]").exists()).toBe(true)
      delete (window as any).FishtVue
      const prop = mount(Textarea, {
        global: { plugins: [withOptions({ clearable: true })] },
        props: { modelValue: "v", clearable: false }
      })
      expect(prop.find("[data-input-layout-clear]").exists()).toBe(false)
    })

    it("emit update:invalid вместо update:isInvalid", async () => {
      const wrapper = mount(Textarea, { props: { modelValue: "" } })
      await wrapper.find("textarea").setValue("x")
      expect(wrapper.emitted("update:invalid")?.[0]).toEqual([false])
      expect(wrapper.emitted("update:isInvalid")).toBeUndefined()
    })

    it("unstyled: классы потребителя остаются на корне и control, темы нет", () => {
      const app: any = createApp({})
      app.use(FishtVue, { unstyled: true })
      const wrapper = mount(Textarea, {
        global: { plugins: [app] },
        props: { class: "probe-root", classes: { control: "probe-ctl" } }
      })
      expect(wrapper.find("[data-textarea]").classes()).toEqual(["fv", "probe-root"])
      expect(wrapper.find("[data-textarea-control]").classes()).toEqual(["fv", "probe-ctl"])
    })
  })
})
