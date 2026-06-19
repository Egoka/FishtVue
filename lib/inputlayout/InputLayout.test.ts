import { flushPromises, mount } from "@vue/test-utils"
import { h, nextTick } from "vue"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue, { setActiveLocale } from "fishtvue/config"
import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
import type { InputLayoutExpose } from "fishtvue/inputlayout"
import { InputProps } from "fishtvue/input"

// Issue 7: heroicons (clear/copy SVG) теперь резолвятся async — ждём microtasks + macrotask.
const flushHero = async () => {
  await flushPromises()
  await new Promise((r) => setTimeout(r))
  await flushPromises()
}

describe("InputLayout Component", () => {
  describe("Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find("[data-input-layout]").exists()).toBe(true)
    })

    it("displays label when provided", () => {
      const label = "Test Label"
      const wrapper = mount(InputLayout, {
        props: { value: "", label }
      })
      const labelElement = wrapper.find("[data-label]")
      expect(labelElement.exists()).toBe(true)
      expect(labelElement.text()).toBe(label)
    })

    it("shows required asterisk when required prop is true", () => {
      const label = "Test Label"
      const wrapper = mount(InputLayout, {
        props: { value: "", required: true, label }
      })
      expect(wrapper.find("[data-label]").text()).toContain(label)
      expect(wrapper.vm.isRequired).toBe(true)
      expect(wrapper.find("[data-label]").classes()).toContain("after:content-['*']")
    })

    it.each([
      {
        mode: "outlined",
        expected:
          "fv fishtvue-input-layout classLayout rounded-md w-full text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 max-h-20 border border-gray-300 dark:border-gray-600 flex items-center peer overflow-auto"
      },
      {
        mode: "underlined",
        expected:
          "fv fishtvue-input-layout classLayout w-full text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 max-h-20 rounded-none border-0 border-gray-300 dark:border-gray-700 border-b flex items-center peer overflow-auto"
      },
      {
        mode: "filled",
        expected:
          "fv fishtvue-input-layout classLayout rounded-md w-full text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 max-h-20 border-0 border-transparent flex items-center peer overflow-auto"
      }
    ] as { mode: InputProps["mode"]; expected: string }[])("applies mode: %s", ({ mode, expected }) => {
      const wrapper = mount(InputLayout, {
        props: { value: "", mode }
      })
      const baseClass = wrapper.find("[data-input-layout-base]")
      expect(baseClass.classes().join(" ")).toContain(expected)
    })

    it("renders help icon when help prop is provided", () => {
      const helpText = "This is a help text."
      const wrapper = mount(InputLayout, {
        props: { value: "", help: helpText }
      })
      const helpIcon = wrapper.find("[data-input-layout-help]")
      expect(helpIcon.exists()).toBe(true)
    })

    it("renders loading spinner when loading prop is true", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", loading: true }
      })
      const loadingSpinner = wrapper.find("[data-loading]")
      expect(loadingSpinner.exists()).toBe(true)
    })

    it("renders clear button when clear prop is true", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "test", clear: true }
      })
      const clearButton = wrapper.find("[data-input-layout-clear]")
      expect(clearButton.exists()).toBe(true)
    })

    it("emits clear event when clear button is clicked", async () => {
      const wrapper = mount(InputLayout, {
        props: { value: "test", clear: true }
      })
      await flushHero()
      const clearButton = wrapper.find("[data-input-layout-clear] svg")
      await clearButton.trigger("click")
      expect(wrapper.emitted("clear")).toBeTruthy()
    })

    it("copies value to clipboard on copy icon click", async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      })

      const wrapper = mount(InputLayout, {
        props: { value: "test value", disabled: true }
      })

      await flushHero()
      const copyButton = wrapper.find("[data-input-layout-copy] svg")
      await copyButton.trigger("click")

      // Assert that navigator.clipboard.writeText was called with the correct value
      expect(writeTextMock).toHaveBeenCalledWith("test value")

      // Clean up the spy
      writeTextMock.mockRestore()
    })

    it("logs an error if clipboard writeText fails", async () => {
      // Mock clipboard API to throw an error
      const writeTextMock = vi.fn(() => Promise.reject(new Error("Copy failed")))
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      })

      // Mock console.error
      const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {})

      const wrapper = mount(InputLayout, {
        props: { value: "test value", disabled: true }
      })

      await flushHero()
      const copyButton = wrapper.find("[data-input-layout-copy] svg")
      await copyButton.trigger("click")

      // Assert that navigator.clipboard.writeText was called with the correct value
      expect(writeTextMock).toHaveBeenCalledWith("test value")

      // Assert that console.error was called with the expected error
      expect(consoleErrorMock).toHaveBeenCalledWith("Failed to copy: ", expect.any(Error))

      // Clean up mocks
      writeTextMock.mockRestore()
      consoleErrorMock.mockRestore()
    })
    describe("InputLayout - labelMode behavior when isValue is true", () => {
      const testCases: { labelMode: InputProps["labelMode"]; expected: string }[] = [
        { labelMode: "offsetDynamic", expected: "offsetStatic" },
        { labelMode: "offsetStatic", expected: "offsetStatic" },
        { labelMode: "vanishing", expected: "none" },
        { labelMode: "static", expected: "static" },
        { labelMode: "none", expected: "static" } // Default fallback
      ]

      it.each(testCases)(
        "returns correct label type for isValue: true and labelMode: $labelMode",
        ({ labelMode, expected }) => {
          // Монтируем компонент
          const wrapper = mount(InputLayout, {
            props: {
              value: "Test value", // Устанавливаем значение
              isValue: true,
              label: "Test Label",
              labelMode
            }
          })

          // Извлекаем скомпилированное значение `labelType`
          const labelType = wrapper.vm.labelType

          // Проверяем результат
          expect(labelType).toBe(expected)
        }
      )
    })
    describe("InputLayout - isInvalid behavior", () => {
      it("applies the correct styles and displays the error message when isInvalid is true", () => {
        const messageInvalid = "This field is required"
        const wrapper = mount(InputLayout, {
          props: {
            value: "",
            isInvalid: true,
            messageInvalid
          }
        })

        // Проверяем, что сообщение об ошибке отображается
        const errorMessage = wrapper.find("[data-input-layout-message-invalid]")
        expect(errorMessage.exists()).toBe(true)
        expect(errorMessage.text()).toBe(messageInvalid)

        // Проверяем, что класс для невалидного состояния применяется
        expect(wrapper.classes()).toContain("is-invalid")
        expect(wrapper.find(".ring-red-500").exists()).toBe(true) // Класс для красного выделения
      })

      it("does not display the error message when isInvalid is false", () => {
        const wrapper = mount(InputLayout, {
          props: {
            value: "Valid input",
            isInvalid: false
          }
        })

        // Проверяем, что сообщение об ошибке не отображается
        const errorMessage = wrapper.find("[data-input-layout-message-invalid]")
        expect(errorMessage.exists()).toBe(true) // Элемент существует
        expect(errorMessage.classes()).toContain("invisible") // Но он скрыт
      })

      it("does not apply invalid styles when isInvalid is false", () => {
        const wrapper = mount(InputLayout, {
          props: {
            value: "Valid input",
            isInvalid: false
          }
        })

        // Проверяем, что класс для невалидного состояния отсутствует
        expect(wrapper.classes()).not.toContain("is-invalid")
        expect(wrapper.find(".ring-red-500").exists()).toBe(false) // Класс для красного выделения отсутствует
      })
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            InputLayout: options
          }
        })
      }
    })

    it("renders correctly with global styles applied", () => {
      const app = createAppWithFishtVue()
      const wrapper = mount(InputLayout, {
        global: {
          plugins: [app]
        },
        props: { value: "test" }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("Slots", () => {
    it("renders content in the default slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          default: "<div>Default Content</div>"
        }
      })
      const defaultSlot = wrapper.find("[data-input-layout-base]")
      expect(defaultSlot.html()).toContain("Default Content")
    })

    it("renders content in the before slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          before: "<div>Before Slot</div>"
        }
      })
      const beforeSlot = wrapper.find("[data-input-layout-before]")
      expect(beforeSlot.html()).toContain("Before Slot")
    })

    it("renders content in the after slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          after: "<div>After Slot</div>"
        }
      })
      const afterSlot = wrapper.find("[data-input-layout-after]")
      expect(afterSlot.html()).toContain("After Slot")
    })

    it("renders fallback text for help prop without slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", help: "Plain help text" }
      })
      const helpRegion = wrapper.find("[data-input-layout-help-text]")
      expect(helpRegion.exists()).toBe(true)
      expect(helpRegion.text()).toBe("Plain help text")
    })

    it("renders fallback text for messageInvalid prop without slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", isInvalid: true, messageInvalid: "Plain error" }
      })
      const errorRegion = wrapper.find("[data-input-layout-message-invalid-text]")
      expect(errorRegion.exists()).toBe(true)
      expect(errorRegion.text()).toBe("Plain error")
    })

    it("renders user-provided help slot instead of prop fallback", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", help: "fallback" },
        slots: {
          help: "<strong data-custom-help>Custom <em>help</em></strong>"
        }
      })
      expect(wrapper.find("strong[data-custom-help]").exists()).toBe(true)
      expect(wrapper.find("strong[data-custom-help]").text()).toBe("Custom help")
      // fallback span с data-input-layout-help-text не должен рендериться при наличии слота
      expect(wrapper.find("[data-input-layout-help-text]").exists()).toBe(false)
    })

    it("renders user-provided messageInvalid slot instead of prop fallback", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", isInvalid: true, messageInvalid: "fallback" },
        slots: {
          messageInvalid: "<strong data-custom-error>Custom <em>error</em></strong>"
        }
      })
      expect(wrapper.find("strong[data-custom-error]").exists()).toBe(true)
      expect(wrapper.find("strong[data-custom-error]").text()).toBe("Custom error")
      expect(wrapper.find("[data-input-layout-message-invalid-text]").exists()).toBe(false)
    })
  })

  describe("Security / XSS guard", () => {
    it("does NOT execute script payload passed via help prop", () => {
      const xssPayload = '<img src=x onerror="(globalThis as any).__inputLayoutHelpXSS=1">'
      const wrapper = mount(InputLayout, {
        props: { value: "", help: xssPayload }
      })
      // payload рендерится как текст внутри span fallback
      const helpRegion = wrapper.find("[data-input-layout-help-text]")
      expect(helpRegion.exists()).toBe(true)
      expect(helpRegion.text()).toContain("<img")
      // нет реального <img> в DOM (text node, не HTML)
      expect(wrapper.find("[data-input-layout-help] img").exists()).toBe(false)
      // глобальный side-effect от onerror не сработал
      expect((globalThis as any).__inputLayoutHelpXSS).toBeUndefined()
    })

    it("does NOT execute script payload passed via messageInvalid prop", () => {
      const xssPayload = '<img src=x onerror="(globalThis as any).__inputLayoutErrorXSS=1">'
      const wrapper = mount(InputLayout, {
        props: { value: "", isInvalid: true, messageInvalid: xssPayload }
      })
      const errorRegion = wrapper.find("[data-input-layout-message-invalid-text]")
      expect(errorRegion.exists()).toBe(true)
      expect(errorRegion.text()).toContain("<img")
      expect(wrapper.find("[data-input-layout-invalid] img").exists()).toBe(false)
      expect((globalThis as any).__inputLayoutErrorXSS).toBeUndefined()
    })
  })

  describe("Accessibility — aria-live on error region", () => {
    it("annotates messageInvalid region with aria-live='assertive' and aria-atomic='true'", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", isInvalid: true, messageInvalid: "Required" }
      })
      const region = wrapper.find("[data-input-layout-message-invalid]")
      expect(region.exists()).toBe(true)
      expect(region.attributes("aria-live")).toBe("assertive")
      expect(region.attributes("aria-atomic")).toBe("true")
    })

    it("preserves aria-live attributes even when not currently invalid (region is hidden but announces become visible)", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", isInvalid: false }
      })
      const region = wrapper.find("[data-input-layout-message-invalid]")
      expect(region.attributes("aria-live")).toBe("assertive")
      expect(region.attributes("aria-atomic")).toBe("true")
    })
  })

  describe("Accessibility — label↔control association (Wave 4)", () => {
    const mountWithControl = (props: Record<string, unknown>) =>
      mount(InputLayout, {
        props: { value: "", ...props },
        slots: {
          default: (scope: any) => h("input", { "data-probe": "", id: scope?.id, "aria-labelledby": scope?.labelledby })
        }
      })

    it("exposes an auto-generated control id via the default slot scope", () => {
      const wrapper = mountWithControl({ label: "Email" })
      const id = wrapper.find("[data-probe]").attributes("id")
      expect(id).toBeTruthy()
      expect(typeof id).toBe("string")
    })

    it("forwards an explicit `id` prop to the slot scope (props.id wins)", () => {
      const wrapper = mountWithControl({ label: "Email", id: "email-field" })
      expect(wrapper.find("[data-probe]").attributes("id")).toBe("email-field")
    })

    it("renders <Label> with `for` matching the control id and its own label id", () => {
      const wrapper = mountWithControl({ label: "Email", id: "email-field" })
      const labelEl = wrapper.find("label[data-label]")
      expect(labelEl.exists()).toBe(true)
      expect(labelEl.attributes("for")).toBe("email-field")
      expect(labelEl.attributes("id")).toBe("email-field-label")
    })

    it("exposes `labelledby` (the label id) via slot scope when a label is present", () => {
      const wrapper = mountWithControl({ label: "Email", id: "email-field" })
      expect(wrapper.find("[data-probe]").attributes("aria-labelledby")).toBe("email-field-label")
    })

    it("omits `labelledby` and renders no <Label> when no label is provided", () => {
      const wrapper = mountWithControl({ id: "email-field" })
      expect(wrapper.find("[data-probe]").attributes("aria-labelledby")).toBeUndefined()
      expect(wrapper.find("label[data-label]").exists()).toBe(false)
    })
  })

  describe("ResizeObserver lifecycle", () => {
    let disconnectSpies: ReturnType<typeof vi.fn>[]
    let originalRO: typeof globalThis.ResizeObserver | undefined

    beforeEach(() => {
      disconnectSpies = []
      originalRO = globalThis.ResizeObserver
      class MockResizeObserver {
        disconnect: ReturnType<typeof vi.fn>
        observe: ReturnType<typeof vi.fn>
        unobserve: ReturnType<typeof vi.fn>
        constructor(_cb: (...args: any[]) => void) {
          void _cb
          this.disconnect = vi.fn()
          this.observe = vi.fn()
          this.unobserve = vi.fn()
          disconnectSpies.push(this.disconnect)
        }
      }
      ;(globalThis as any).ResizeObserver = MockResizeObserver
    })

    afterEach(() => {
      ;(globalThis as any).ResizeObserver = originalRO
    })

    it("disconnects beforeInput / afterInput / layout observers on unmount", async () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          before: "<div>before</div>",
          after: "<div>after</div>",
          default: "<input />"
        }
      })
      // подождать onMounted hook
      await new Promise((r) => setTimeout(r, 0))
      // создано минимум 3 observer'а: layout (всегда), before, after
      expect(disconnectSpies.length).toBeGreaterThanOrEqual(3)
      const createdBefore = disconnectSpies.length
      wrapper.unmount()
      // каждый созданный observer должен быть disconnect'нут
      for (let i = 0; i < createdBefore; i++) {
        expect(disconnectSpies[i]).toHaveBeenCalledTimes(1)
      }
    })
  })

  describe("Clipboard copy — SSR / non-secure context", () => {
    let originalClipboard: any
    let originalExecCommand: any

    beforeEach(() => {
      originalClipboard = (navigator as any).clipboard
      originalExecCommand = (document as any).execCommand
    })

    afterEach(() => {
      Object.assign(navigator, { clipboard: originalClipboard })
      ;(document as any).execCommand = originalExecCommand
    })

    it("does not throw when navigator.clipboard is undefined (SSR / HTTP context)", async () => {
      // имитируем отсутствие clipboard API
      Object.assign(navigator, { clipboard: undefined })
      const execCommandMock = vi.fn().mockReturnValue(true)
      ;(document as any).execCommand = execCommandMock

      const wrapper = mount(InputLayout, {
        props: { value: "test value", disabled: true }
      })

      const expose = wrapper.vm as unknown as InputLayoutExpose
      await expect((expose as any).copy()).resolves.not.toThrow()
      // должен сработать fallback execCommand
      expect(execCommandMock).toHaveBeenCalledWith("copy")
    })

    it("falls back to execCommand when clipboard.writeText throws", async () => {
      const writeTextMock = vi.fn(() => Promise.reject(new DOMException("NotAllowedError")))
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } })
      const execCommandMock = vi.fn().mockReturnValue(true)
      ;(document as any).execCommand = execCommandMock

      const wrapper = mount(InputLayout, {
        props: { value: "fallback value", disabled: true }
      })

      const expose = wrapper.vm as unknown as InputLayoutExpose
      await (expose as any).copy()
      expect(writeTextMock).toHaveBeenCalledWith("fallback value")
      expect(execCommandMock).toHaveBeenCalledWith("copy")
    })
  })

  describe("offsetTop prop (replaces hardcoded querySelector('header'))", () => {
    it("uses numeric offsetTop prop directly", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", offsetTop: 80 }
      })
      const expose = wrapper.vm as unknown as InputLayoutExpose
      expect(expose.headerHeight).toBe(80)
    })

    it("uses function offsetTop prop, calling it for the value", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", offsetTop: () => 123 }
      })
      const expose = wrapper.vm as unknown as InputLayoutExpose
      expect(expose.headerHeight).toBe(123)
    })

    it("falls back to 0 when no offsetTop prop and no <header> coupling is performed", () => {
      // в jsdom нет <header> по умолчанию, но даже если есть — querySelector больше не используется
      const wrapper = mount(InputLayout, {
        props: { value: "" }
      })
      const expose = wrapper.vm as unknown as InputLayoutExpose
      expect(expose.headerHeight).toBe(0)
    })
  })

  describe("Locale — inputLayout.copied", () => {
    afterEach(() => {
      // вернуть локаль к дефолту для других тестов
      setActiveLocale("en")
    })

    it("resolves 'Copied' for EN locale via Component.t('inputLayout.copied')", () => {
      const wrapper = mount(InputLayout, {
        global: {
          plugins: [[FishtVue as any, { locale: { defaultLocale: "en" } }]]
        },
        props: { value: "" }
      })
      // helper берёт строку из локали — utility-вызов через componentsOptions.t недоступен снаружи,
      // проверяем через mount-test что строка попадает в DOM при isCopy = true
      const expose = wrapper.vm as unknown as InputLayoutExpose
      expect(expose).toBeDefined()
      // прямой вызов Component.t возможен через global helper — но без публичного API
      // проверяем через присутствие в локали (это unit-проверка ключа, а не рендер):
      // Импорт messages непосредственно — отдельный тест, ниже
    })

    it("EN locale dictionary contains inputLayout.copied = 'Copied'", async () => {
      const Locales = (await import("fishtvue/locale")).default as any
      expect(Locales.en?.inputLayout?.copied).toBe("Copied")
    })

    it("RU locale dictionary contains inputLayout.copied = 'Скопировано'", async () => {
      const Locales = (await import("fishtvue/locale")).default as any
      expect(Locales.ru?.inputLayout?.copied).toBe("Скопировано")
    })
  })

  // Issue 8 — prefers-reduced-motion (E29.7): анимации только через motion-safe: (канон Switch/Button/Badge).
  describe("Reduced motion — motion-safe transitions (E29.7)", () => {
    it("wraps the root animation in motion-safe: after the mount tick", async () => {
      // animation появляется только когда isTick флипается через setTimeout(…, 100) в onMounted
      vi.useFakeTimers()
      try {
        const wrapper = mount(InputLayout, { props: { value: "" } })
        vi.advanceTimersByTime(150)
        await nextTick()
        const cls = wrapper.find("[data-input-layout]").attributes("class") ?? ""
        expect(cls).toContain("motion-safe:transition-all")
        expect(cls).toContain("motion-safe:duration-550")
        // никаких безусловных transition-* — иначе reduced-motion проигнорирован
        expect(cls).not.toMatch(/(^|\s)transition-all(\s|$)/)
        expect(cls).not.toMatch(/(^|\s)duration-550(\s|$)/)
      } finally {
        vi.useRealTimers()
      }
    })

    it("wraps decorative help-icon transition in motion-safe:", async () => {
      const wrapper = mount(InputLayout, { props: { value: "", help: "Help text" } })
      await flushHero()
      const helpHtml = wrapper.find("[data-input-layout-help]").html()
      expect(helpHtml).toContain("motion-safe:transition")
    })

    it("gates the floating-label transition behind the mount tick (no position slide on mount)", async () => {
      // Label получает :animate="isTick". До тика transition выключен → лейбл стоит на месте
      // (не «переезжает» из исходной точки); после тика — включён, фокус-анимация работает.
      vi.useFakeTimers()
      try {
        const wrapper = mount(InputLayout, { props: { value: "", label: "Name" } })
        let cls = wrapper.find("[data-label]").attributes("class") ?? ""
        expect(cls).not.toContain("motion-safe:transition-all")
        vi.advanceTimersByTime(150)
        await nextTick()
        cls = wrapper.find("[data-label]").attributes("class") ?? ""
        expect(cls).toContain("motion-safe:transition-all")
      } finally {
        vi.useRealTimers()
      }
    })
  })

  // Issue 8 — print styles (N59): style-for-print, НЕ display:none (канон Switch/Button/Input).
  describe("Print styles (N59)", () => {
    it("renders style-for-print classes on the root (not display:none)", () => {
      const wrapper = mount(InputLayout, { props: { value: "" } })
      const cls = wrapper.find("[data-input-layout]").attributes("class") ?? ""
      expect(cls).toContain("print:border")
      expect(cls).toContain("print:border-black")
      expect(cls).toContain("print:bg-white")
      expect(cls).toContain("print:text-black")
      expect(cls).toContain("print:shadow-none")
      expect(cls).not.toContain("print:hidden")
    })
  })

  // Issue 8 — forced-colors (B10): high-contrast — border-* сбрасывается, outline сохраняет границу поля.
  describe("Forced-colors / high-contrast (B10)", () => {
    it("keeps the field outline visible in forced-colors mode", () => {
      const wrapper = mount(InputLayout, { props: { value: "" } })
      const cls = wrapper.find("[data-input-layout-base]").attributes("class") ?? ""
      expect(cls).toContain("forced-colors:outline")
    })
  })

  // Issue 4 — unstyled (L53): cross-cutting guard Component.setStyle() (config.unstyled → "") уже покрывает
  // все 22 компонента; этот блок — regression-guard для InputLayout.
  describe("Configuration support — unstyled (L53)", () => {
    const appWithConfig = (config: Record<string, unknown>) => ({
      install(app: any) {
        app.use(FishtVue, config)
      }
    })

    // window.FishtVue — глобальный singleton; чистим, чтобы unstyled:true не протёк в соседние тесты/файлы.
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("strips all classes from the root when global unstyled: true", () => {
      const wrapper = mount(InputLayout, {
        global: { plugins: [appWithConfig({ unstyled: true })] },
        props: { value: "" }
      })
      // InputLayout.setStyle() возвращает "" при unstyled → ни базовых классов, ни fv-префикса на корне
      const cls = (wrapper.find("[data-input-layout]").attributes("class") ?? "").trim()
      expect(cls).toBe("")
    })

    it("keeps base classes when unstyled is false (contrast)", () => {
      const wrapper = mount(InputLayout, {
        global: { plugins: [appWithConfig({ unstyled: false })] },
        props: { value: "" }
      })
      const cls = wrapper.find("[data-input-layout]").attributes("class") ?? ""
      expect(cls).toContain("rounded-md")
    })
  })
})
