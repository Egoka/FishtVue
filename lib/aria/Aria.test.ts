import { mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import { defineComponent, createApp, h } from "vue"
import Aria from "fishtvue/aria/Aria.vue"
import FishtVue from "fishtvue/config"
import type { AriaExpose } from "fishtvue/aria"

describe("Aria Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Aria)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles prop: modelValue", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "Test value" }
      })
      const textarea = wrapper.find("textarea")
      expect(textarea.element.value).toBe("Test value")

      await wrapper.setProps({ modelValue: "Updated value" })
      expect(textarea.element.value).toBe("Updated value")
    })

    it("emits correct events on input and change", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "" }
      })
      const textarea = wrapper.find("textarea")

      await textarea.setValue("New value")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])

      await textarea.trigger("change")
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual(["New value"])
    })

    it("applies correct attributes for props", () => {
      const wrapper = mount(Aria, {
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
      const wrapper = mount(Aria)
      const textarea = wrapper.find("textarea")

      await textarea.trigger("focus")
      expect(wrapper.emitted("focus")).toBeTruthy()

      await textarea.trigger("blur")
      expect(wrapper.emitted("blur")).toBeTruthy()
    })

    it("clears the value and emits clear event when clear button is clicked", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "Test value", clear: true }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([""])
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Aria: options
        }
      })
      return app
    }

    it("applies global component-specific options to Aria", () => {
      const app: any = createAppWithFishtVue({
        rows: 3,
        maxLength: 100
      })

      const wrapper = mount(Aria, {
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

      const wrapper = mount(Aria, {
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
        isInvalid: true
      })

      const wrapper = mount(Aria, {
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
      const wrapper = mount(Aria, { props: { modelValue: "" } })
      const textarea = wrapper.find("textarea")
      await textarea.setValue("hello")
      await textarea.trigger("change")
      const payload = wrapper.emitted("change:modelValue")?.[0]?.[0]
      expect(typeof payload).toBe("string")
      expect(payload).toBe("hello")
    })

    it("clear() emits change:modelValue with empty string (Issue 1)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Aria, { props: { modelValue: "x", clear: true } })
      ;(wrapper.vm as unknown as AriaExpose).clear()
      const payload = wrapper.emitted("change:modelValue")?.[0]?.[0]
      expect(typeof payload).toBe("string")
      expect(payload).toBe("")
    })

    // ---ISSUE 4 — Aria.componentsStyle() fallback in mode -----------
    describe("Issue 4 — componentsStyle global fallback", () => {
      it("uses Aria.componentsStyle() fallback when no props.mode and no options.mode", () => {
        resetGlobalFishtVue()
        const app: any = createApp({})
        app.use(FishtVue, { componentsStyle: "filled" })
        const wrapper = mount(Aria, { global: { plugins: [app] } })
        expect((wrapper.vm as unknown as AriaExpose).mode).toBe("filled")
      })

      it("priority chain: props.mode > options.mode > componentsStyle > 'outlined'", () => {
        // 1. props.mode wins over everything else
        resetGlobalFishtVue()
        const app1: any = createApp({})
        app1.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Aria: { mode: "underlined" } }
        })
        const w1 = mount(Aria, {
          global: { plugins: [app1] },
          props: { mode: "outlined" }
        })
        expect((w1.vm as unknown as AriaExpose).mode).toBe("outlined")

        // 2. options.mode wins over componentsStyle
        resetGlobalFishtVue()
        const app2: any = createApp({})
        app2.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Aria: { mode: "underlined" } }
        })
        const w2 = mount(Aria, { global: { plugins: [app2] } })
        expect((w2.vm as unknown as AriaExpose).mode).toBe("underlined")

        // 3. componentsStyle wins over the literal default
        resetGlobalFishtVue()
        const app3: any = createApp({})
        app3.use(FishtVue, { componentsStyle: "filled" })
        const w3 = mount(Aria, { global: { plugins: [app3] } })
        expect((w3.vm as unknown as AriaExpose).mode).toBe("filled")

        // 4. literal default when nothing set
        resetGlobalFishtVue()
        const app4: any = createApp({})
        app4.use(FishtVue, {})
        const w4 = mount(Aria, { global: { plugins: [app4] } })
        expect((w4.vm as unknown as AriaExpose).mode).toBe("outlined")
      })
    })

    // ---ISSUE 5 — unstyled cross-cutting enforcement -----------
    it("respects unstyled: true via Component.setStyle guard (Issue 5)", () => {
      resetGlobalFishtVue()
      const app: any = createApp({})
      app.use(FishtVue, { unstyled: true })
      const wrapper = mount(Aria, { global: { plugins: [app] } })
      const textarea = wrapper.find("textarea")
      // setStyle returns "" under unstyled: true, so the textarea class is empty.
      expect(textarea.attributes("class") ?? "").toBe("")
    })

    // ---ISSUE 7 — modelValue narrowed to string|null|undefined -----------
    it.each<[string, string | null | undefined]>([
      ["null", null],
      ["undefined", undefined],
      ["empty", ""]
    ])("renders empty textarea for modelValue=%s (Issue 7)", (_label, value) => {
      resetGlobalFishtVue()
      const wrapper = mount(Aria, { props: { modelValue: value } })
      const textarea = wrapper.find("textarea")
      expect((textarea.element as HTMLTextAreaElement).value).toBe("")
    })

    // ---ISSUE 8 — typed slot props for #before / #after -----------
    it("provides typed slot props { isInvalid, isFocused, clear } to #after (Issue 8)", async () => {
      resetGlobalFishtVue()
      let captured: { isInvalid?: boolean; isFocused?: boolean; clear?: () => void } = {}
      const Host = defineComponent({
        props: { isInvalid: { type: Boolean, default: false } },
        setup(props) {
          return () =>
            h(
              Aria,
              { modelValue: "abc", isInvalid: props.isInvalid, clear: true },
              {
                after: (slotProps: { isInvalid: boolean; isFocused: boolean; clear: () => void }) => {
                  captured = slotProps
                  return h("span", { "data-after-marker": true }, "after")
                }
              }
            )
        }
      })

      const wrapper = mount(Host)
      expect(typeof captured.isInvalid).toBe("boolean")
      expect(typeof captured.isFocused).toBe("boolean")
      expect(typeof captured.clear).toBe("function")
      expect(captured.isInvalid).toBe(false)
      expect(captured.isFocused).toBe(false)

      await wrapper.setProps({ isInvalid: true })
      expect(captured.isInvalid).toBe(true)
    })

    it("provides typed slot props { isInvalid, isFocused } to #before (Issue 8)", () => {
      resetGlobalFishtVue()
      let captured: { isInvalid?: boolean; isFocused?: boolean } = {}
      const Host = defineComponent({
        setup() {
          return () =>
            h(
              Aria,
              { modelValue: "abc", isInvalid: true },
              {
                before: (slotProps: { isInvalid: boolean; isFocused: boolean }) => {
                  captured = slotProps
                  return h("span", "before")
                }
              }
            )
        }
      })

      mount(Host)
      expect(typeof captured.isInvalid).toBe("boolean")
      expect(typeof captured.isFocused).toBe("boolean")
      expect(captured.isInvalid).toBe(true)
    })

    // ---ISSUE 9 — motion-safe placeholder transition -----------
    it("uses motion-safe:placeholder:transition-all in classInput (Issue 9)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Aria, { props: { label: "Comment" } })
      const cls = wrapper.find("textarea").attributes("class") ?? ""
      expect(cls).toMatch(/motion-safe:placeholder:transition-all/)
      expect(cls).not.toMatch(/(?<!motion-safe:)placeholder:transition-all/)
    })

    // ---ISSUE 11 — print styles -----------
    it("includes print:* classes in classInput (Issue 11)", () => {
      resetGlobalFishtVue()
      const wrapper = mount(Aria)
      const cls = wrapper.find("textarea").attributes("class") ?? ""
      expect(cls).toMatch(/print:/)
    })
  })

  // ---ISSUE 2 — no duplicate initStyle (Wave 2.3) ------------------
  describe("Initialization (no-dup initStyle)", () => {
    // `Component.initStyle` — class field arrow (instance property, not on
    // prototype) — поэтому vi.spyOn(prototype) не сработает. Регрессионный
    // static-source check вместо behavioural spy: канон требует, чтобы стили
    // инициализировались только через Component.__hooks(), без явного
    // Aria.initStyle() в SFC.
    it("Aria.vue does not contain duplicate onMounted(initStyle) (Issue 2)", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Aria.vue"), "utf8")
      // Discard line comments before scanning so a future doc-comment about
      // the deprecation doesn't cause a false positive.
      const code = src.replace(/\/\/[^\n]*/g, "")
      expect(code).not.toMatch(/Aria\.initStyle\s*\(/)
    })
  })
})
