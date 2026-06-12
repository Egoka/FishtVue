import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import Input from "fishtvue/input/Input.vue"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"
import { InputProps } from "fishtvue/input/Input"

// Issue 7: heroicons (clear/eye SVG) теперь резолвятся async — ждём microtasks + macrotask.
const flushHero = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r))
  await flushPromises()
}

describe("Input Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Input)
      expect(wrapper.exists()).toBe(true)
    })

    it("applies props and renders input attributes", () => {
      const wrapper = mount(Input, {
        props: {
          id: "input-id",
          type: "email",
          autoFocus: true,
          placeholder: "Enter email",
          autocomplete: "off",
          maskInput: "number",
          lengthInteger: 5,
          lengthDecimal: 2
        }
      })

      const input = wrapper.find("input[data-input]")
      expect(input.attributes("id")).toBe("input-id")
      expect(input.attributes("type")).toBe("email")
      expect(input.attributes("placeholder")).toBe("Enter email")
      expect(input.attributes("autocomplete")).toBe("off")
    })

    it("handles focus and blur events", async () => {
      const wrapper = mount(Input)
      const input = wrapper.find("input[data-input]")

      await input.trigger("focus")
      expect(wrapper.emitted("focus")).toBeTruthy()

      await input.trigger("blur")
      expect(wrapper.emitted("blur")).toBeTruthy()
    })

    it("handles modelValue and emits updates", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "" }
      })

      const input = wrapper.find("input[data-input]")
      await input.setValue("New value")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
    })

    it("applies maskInput: 'number' correctly", async () => {
      const wrapper = mount(Input, {
        props: { maskInput: "number", lengthInteger: 3, lengthDecimal: 2 }
      })

      const input = wrapper.find("input[data-input]")
      await input.setValue("123.45")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["123.45"])
    })

    it("toggles password visibility", async () => {
      const wrapper = mount(Input, {
        props: { type: "password" }
      })

      let input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("password")

      const toggleButton = wrapper.find("[data-eye-slash]")
      await toggleButton.trigger("click")

      input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("text")

      const toggleButtonAgain = wrapper.find("[data-eye]")
      await toggleButtonAgain.trigger("click")

      input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("password")
    })

    it("clears the input when clear button is clicked", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "Test value", clear: true }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("clear")).toBeTruthy()
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Input, {
        slots: {
          default: '<span class="default-slot">Default Slot Content</span>',
          before: '<span class="before-slot">Before Slot Content</span>',
          after: '<span class="after-slot">After Slot Content</span>'
        }
      })

      // Проверка содержимого default слота
      const defaultSlot = wrapper.find(".default-slot")
      expect(defaultSlot.exists()).toBe(true)
      expect(defaultSlot.text()).toBe("Default Slot Content")

      // Проверка содержимого before слота
      const beforeSlot = wrapper.find(".before-slot")
      expect(beforeSlot.exists()).toBe(true)
      expect(beforeSlot.text()).toBe("Before Slot Content")

      // Проверка содержимого after слота
      const afterSlot = wrapper.find(".after-slot")
      expect(afterSlot.exists()).toBe(true)
      expect(afterSlot.text()).toBe("After Slot Content")
    })
    it("handles text input and clearing correctly", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "" }
      })

      const inputElement = wrapper.find("input[data-input]")

      // Набор текста
      await inputElement.setValue("Test Input")
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Test Input"])
      expect((inputElement.element as any).value).toBe("Test Input")

      // Удаление текста через кнопку очистки
      await wrapper.setProps({ clear: true })
      await flushHero()
      const clearButton = wrapper.find("[data-input-layout-clear] .cursor-pointer")
      expect(clearButton.exists()).toBe(true)

      await clearButton.trigger("click")
      expect(wrapper.emitted("clear")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([""])
      expect((inputElement.element as any).value).toBe("")
    })

    describe("Input Component - mask functionality", () => {
      const testCases: { mask: InputProps["maskInput"]; input: string; expected: string }[] = [
        { mask: "phone", input: "1234567890", expected: "+1 (234) 567-89-0" },
        { mask: "number", input: "1234.567", expected: "1234" },
        { mask: "price", input: "1234.567", expected: "1 234" },
        { mask: "custom", input: "CustomText123", expected: "CustomText123" }, // Assuming no specific transformation
        // @ts-ignore
        { mask: null, input: "Text123", expected: "Text123" } // No mask applied
      ]

      it.each(testCases)("applies the correct mask for mask: $mask", async ({ mask, input, expected }) => {
        const wrapper = mount(Input, {
          props: { maskInput: mask, modelValue: "" }
        })

        const inputElement = wrapper.find("input[data-input]")

        await inputElement.setValue(input)

        expect(wrapper.emitted("update:modelValue")).toBeTruthy()
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expected)
        expect((inputElement.element as any).value).toBe(expected)
        await wrapper.setProps({ modelValue: "" })
        await wrapper.setProps({ modelValue: input })
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expected)
      })

      it("handles unrecognized mask gracefully", async () => {
        const wrapper = mount(Input, {
          props: { maskInput: "unknown", modelValue: "" }
        })

        const inputElement = wrapper.find("input[data-input]")

        await inputElement.setValue("RandomInput")
        expect(wrapper.emitted("update:modelValue")).toBeTruthy()
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe("RandomInput")
        expect((inputElement.element as any).value).toBe("RandomInput")
      })
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Input: options
        }
      })
      return app
    }

    it("overrides local props", () => {
      const app: any = createAppWithFishtVue({
        type: "text"
      })

      const wrapper = mount(Input, {
        global: { plugins: [app] },
        props: {
          placeholder: "Local Placeholder",
          type: "number"
        }
      })

      const input = wrapper.find("input[data-input]")
      expect(input.attributes("placeholder")).toBe("Local Placeholder")
      expect(input.attributes("type")).toBe("number")
    })

    it("handles clear event correctly", async () => {
      const app: any = createAppWithFishtVue()

      const wrapper = mount(Input, {
        global: { plugins: [app] },
        props: {
          clear: true,
          modelValue: "Test value"
        }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("clear")).toBeTruthy()
    })
  })

  // ---------------------------------------
  // Audit issues — Documentation/issues/input.md (2026-05-11)
  // ---------------------------------------
  describe("Audit issues 2026-05-11", () => {
    describe("Issue 1 — initStyle deduplication (Component.__hooks owns lifecycle)", () => {
      it("renders correctly after onMounted dedup — classBaseInput is computed", () => {
        const wrapper = mount(Input)
        expect(wrapper.exists()).toBe(true)
        expect((wrapper.vm as any).classBaseInput).toBeTruthy()
      })

      it("autoFocus still works when initStyle is moved to Component.__hooks()", () => {
        const wrapper = mount(Input, { props: { autoFocus: true }, attachTo: document.body })
        expect(document.activeElement).toBe(wrapper.find("input").element)
        wrapper.unmount()
      })
    })

    describe("Issue 2 — componentsStyle global fallback", () => {
      // Чистим оставшийся `window.FishtVue` от предыдущих `app.use(FishtVue,...)`
      // — Component.constructor читает его как fallback (lib/component/index.ts:67-68),
      // и без cleanup тест на дефолт ловит config предыдущего сценария.
      const resetGlobalFishtVue = () => {
        delete (window as any).FishtVue
      }

      it("uses Input.componentsStyle() fallback when no props.mode and no options.mode", () => {
        resetGlobalFishtVue()
        const app: any = createApp({})
        app.use(FishtVue, { componentsStyle: "filled" })
        const wrapper = mount(Input, { global: { plugins: [app] } })
        expect((wrapper.vm as any).mode).toBe("filled")
      })

      it("priority chain: props.mode > options.mode > componentsStyle > 'outlined'", () => {
        // 1. props.mode wins over everything else
        resetGlobalFishtVue()
        const app1: any = createApp({})
        app1.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Input: { mode: "underlined" } }
        })
        const w1 = mount(Input, {
          global: { plugins: [app1] },
          props: { mode: "outlined" }
        })
        expect((w1.vm as any).mode).toBe("outlined")

        // 2. options.mode wins over componentsStyle
        resetGlobalFishtVue()
        const app2: any = createApp({})
        app2.use(FishtVue, {
          componentsStyle: "filled",
          componentsOptions: { Input: { mode: "underlined" } }
        })
        const w2 = mount(Input, { global: { plugins: [app2] } })
        expect((w2.vm as any).mode).toBe("underlined")

        // 3. componentsStyle wins over the literal default
        resetGlobalFishtVue()
        const app3: any = createApp({})
        app3.use(FishtVue, { componentsStyle: "filled" })
        const w3 = mount(Input, { global: { plugins: [app3] } })
        expect((w3.vm as any).mode).toBe("filled")

        // 4. fallback to literal default — no plugin, clean global
        resetGlobalFishtVue()
        const w4 = mount(Input)
        expect((w4.vm as any).mode).toBe("outlined")
      })
    })

    describe("Issue 5 — passwordToggleClass override", () => {
      // Icons.vue консумит `class` как prop и применяет его на внутренний SVG
      // (см. lib/icons/Icons.vue:37, 94), а не на root `<i data-eye-slash>`,
      // поэтому проверка через `.html()` — единственный надёжный способ
      // подтвердить, что override-класс пробросился до DOM.
      it("applies passwordToggleClass prop to eye-icon", async () => {
        const wrapper = mount(Input, {
          props: { type: "password", passwordToggleClass: "text-blue-500" }
        })
        const eyeSlash = wrapper.find("[data-eye-slash]")
        expect(eyeSlash.exists()).toBe(true)
        await flushHero()
        expect(eyeSlash.html()).toContain("text-blue-500")
      })

      it("applies componentsOptions.Input.passwordToggleClass globally", async () => {
        delete (window as any).FishtVue
        const app: any = createApp({})
        app.use(FishtVue, {
          componentsOptions: { Input: { passwordToggleClass: "text-red-500" } }
        })
        const wrapper = mount(Input, {
          global: { plugins: [app] },
          props: { type: "password" }
        })
        const eyeSlash = wrapper.find("[data-eye-slash]")
        await flushHero()
        expect(eyeSlash.html()).toContain("text-red-500")
      })
    })

    describe("Issue 6 — extended input types (tel/url/search)", () => {
      it.each(["tel" as const, "url" as const, "search" as const])("renders <input type='%s'>", (type) => {
        const wrapper = mount(Input, { props: { type } })
        expect(wrapper.find("input[data-input]").attributes("type")).toBe(type)
      })

      it("falls back to 'text' for unknown type (regression)", () => {
        const wrapper = mount(Input, {
          // @ts-expect-error — intentionally invalid for fallback regression
          props: { type: "invalid-type" }
        })
        expect(wrapper.find("input[data-input]").attributes("type")).toBe("text")
      })
    })

    describe("Issue 7 — phoneFormats prop / option", () => {
      it("applies custom phoneFormats per-instance", async () => {
        const wrapper = mount(Input, {
          props: {
            maskInput: "phone",
            phoneFormats: [{ codeCountry: 44, mask: [4, 3, 3], codeCity: [] }],
            modelValue: ""
          }
        })
        const input = wrapper.find("input[data-input]")
        await input.setValue("441234567890")
        const emitted = wrapper.emitted("update:modelValue") as Array<[string]> | undefined
        expect(emitted?.[0]?.[0]).toContain("+44")
      })

      it("applies componentsOptions.Input.phoneFormats globally", async () => {
        const app: any = createApp({})
        app.use(FishtVue, {
          componentsOptions: {
            Input: { phoneFormats: [{ codeCountry: 44, mask: [4, 3, 3], codeCity: [] }] }
          }
        })
        const wrapper = mount(Input, {
          global: { plugins: [app] },
          props: { maskInput: "phone", modelValue: "" }
        })
        const input = wrapper.find("input[data-input]")
        await input.setValue("441234567890")
        const emitted = wrapper.emitted("update:modelValue") as Array<[string]> | undefined
        expect(emitted?.[0]?.[0]).toContain("+44")
      })
    })

    describe("Issue 8 — autocomplete auto-defaults", () => {
      it.each([
        ["password", "current-password"],
        ["email", "email"],
        ["tel", "tel"],
        ["url", "url"],
        ["text", "on"]
      ] as const)("auto-suggests autocomplete for type='%s'", (type, expected) => {
        const wrapper = mount(Input, { props: { type } })
        const input = wrapper.find("input[data-input]")
        expect(input.attributes("autocomplete")).toBe(expected)
      })

      it("explicit autocomplete prop wins over auto-suggest", () => {
        const wrapper = mount(Input, {
          props: { type: "password", autocomplete: "new-password" }
        })
        expect(wrapper.find("input[data-input]").attributes("autocomplete")).toBe("new-password")
      })
    })

    describe("Issue 9 — motion-safe transitions", () => {
      it("classBaseInput uses motion-safe:transition-all (not unconditional)", () => {
        const wrapper = mount(Input)
        const cls = String((wrapper.vm as any).classBaseInput ?? "")
        expect(cls).toContain("motion-safe:transition-all")
        expect(cls).not.toMatch(/(?:^|\s)transition-all(?:\s|$)/)
      })
    })

    describe("Issue 10 — focus() argless / programmatic", () => {
      it("focus() without args focuses input and does not throw", () => {
        const wrapper = mount(Input, { attachTo: document.body })
        expect(() => (wrapper.vm as any).focus()).not.toThrow()
        expect(document.activeElement).toBe(wrapper.find("input").element)
        wrapper.unmount()
      })

      it("focus(FocusEvent) keeps existing behavior — emits 'focus'", () => {
        const wrapper = mount(Input)
        const fakeEvent = new FocusEvent("focus")
        ;(wrapper.vm as any).focus(fakeEvent)
        expect(wrapper.emitted("focus")).toBeTruthy()
      })

      it("focus(FocusOptions) passes preventScroll to native focus()", () => {
        const wrapper = mount(Input, { attachTo: document.body })
        const inp = wrapper.find("input").element as HTMLInputElement
        const spy = vi.spyOn(inp, "focus")
        ;(wrapper.vm as any).focus({ preventScroll: true })
        expect(spy).toHaveBeenCalledWith({ preventScroll: true })
        spy.mockRestore()
        wrapper.unmount()
      })
    })

    describe("Issue 11 — print styles", () => {
      it("classBaseInput contains print: variant classes", () => {
        const wrapper = mount(Input)
        const cls = String((wrapper.vm as any).classBaseInput ?? "")
        expect(cls).toMatch(/(?:^|\s)print:/)
      })
    })

    describe("Issue 12 — RTL eye-icon toggle", () => {
      it("password toggle works inside dir='rtl' container", async () => {
        document.body.dir = "rtl"
        const wrapper = mount(Input, {
          props: { type: "password" },
          attachTo: document.body
        })
        try {
          const eyeSlash = wrapper.find("[data-eye-slash]")
          expect(eyeSlash.exists()).toBe(true)
          await eyeSlash.trigger("click")
          expect(wrapper.find("input[data-input]").attributes("type")).toBe("text")
        } finally {
          document.body.dir = ""
          wrapper.unmount()
        }
      })
    })
  })
})
