import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import FishtVue from "fishtvue/config"
import TextEditor from "fishtvue/texteditor/TextEditor.vue"
import { QuillEditor } from "@vueup/vue-quill"
import { nextTick } from "vue"

describe("TextEditor Component", () => {
  describe("Without Library Initialization", () => {
    it("renders the TextEditor and updates modelValue on text input", async () => {
      const wrapper: any = mount(TextEditor, {
        attachTo: document.body,
        props: {
          modelValue: "",
          clear: true,
          paramsTextEditor: { content: "<p>Initial content</p>" },
          theme: "bubble"
        },
        global: {
          components: { QuillEditor }
        }
      })

      // Найти компонент QuillEditor
      const quillEditor = wrapper.findComponent(QuillEditor)
      expect(quillEditor.exists()).toBe(true)

      // Проверка начального значения контента
      expect(wrapper.props("modelValue")).toBe("")

      // Мокнуть метод `getHTML` редактора
      const quillEditorVm = quillEditor.vm as any
      quillEditorVm.getHTML = vi.fn(() => "<p>Updated content</p>")

      // Эмитить событие обновления текста
      await quillEditorVm.$emit("update:content", "<p>Updated content</p>")

      // Проверить, что события были вызваны
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["<p>Updated content</p>"])

      await wrapper.setProps({ modelValue: "<p>Updated content</p>" })
      await nextTick()
      // Найти кнопку очистки
      const clearButton = wrapper.find("[data-input-layout-clear] i")
      expect(clearButton.exists()).toBe(true)

      // Нажать на кнопку
      await clearButton.trigger("click")

      expect(wrapper.emitted("change:modelValue")).toBeTruthy()
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual(["<p></p>"])
    })

    it("clears content on clear button click", async () => {
      const wrapper = mount(TextEditor, {
        props: {
          clear: true,
          modelValue: "<p>Some content</p>"
        }
      })
      await nextTick()
      // Найти кнопку очистки
      const clearButton = wrapper.find("[data-input-layout-clear] i")
      expect(clearButton.exists()).toBe(true)

      // Нажать на кнопку
      await clearButton.trigger("click")

      // Проверить, что модель сбросилась
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["<p></p>"])

      expect(wrapper.emitted("change:modelValue")).toBeTruthy()
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual(["<p></p>"])
    })

    it("toggles between snow and bubble themes", async () => {
      const wrapper = mount(TextEditor, {
        props: {
          modelValue: "",
          theme: "bubble"
        }
      })

      // Проверить начальную тему
      expect(wrapper.vm.theme).toBe("bubble")

      // Найти кнопку изменения темы
      const toggleButton = wrapper.find("button[data-switch-size]")
      expect(toggleButton.exists()).toBe(true)

      // Нажать на кнопку
      await toggleButton.trigger("click")

      // Проверить, что тема изменилась на snow
      expect(wrapper.vm.theme).toBe("snow")
    })

    it("handles disabled state", async () => {
      const wrapper = mount(TextEditor, {
        props: {
          modelValue: "",
          disabled: true
        }
      })

      // Проверить, что редактор заблокирован
      const quillEditor = wrapper.findComponent(QuillEditor)
      expect(quillEditor.exists()).toBe(true)
      expect(quillEditor.props("readOnly")).toBe(true)

      // Попробовать ввод текста
      const quillEditorVm = quillEditor.vm as any
      quillEditorVm.$emit("update:content", "<p>Disabled content</p>")

      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["<p>Disabled content</p>"])
      expect(wrapper.emitted("change:modelValue")).toBeUndefined()
    })
    describe("TextEditor Component - isActiveTextEditor State", () => {
      it("sets isActiveTextEditor to true when editor gains focus", async () => {
        const wrapper = mount(TextEditor, {
          props: {
            modelValue: "<p>Initial content</p>"
          }
        })

        const quillEditor = wrapper.findComponent({ name: "QuillEditor" })
        expect(quillEditor.exists()).toBe(true)

        // Trigger focus event
        const quillEditorVm = quillEditor.vm as any
        quillEditorVm.$emit("focus")

        // Check that isActiveTextEditor is true
        expect(wrapper.vm.isActiveTextEditor).toBe(true)
      })

      it("sets isActiveTextEditor to false when editor loses focus", async () => {
        const wrapper = mount(TextEditor, {
          props: {
            modelValue: "<p>Initial content</p>"
          }
        })

        const quillEditor = wrapper.findComponent({ name: "QuillEditor" })
        expect(quillEditor.exists()).toBe(true)

        // Trigger focus event to activate editor
        const quillEditorVm = quillEditor.vm as any
        quillEditorVm.$emit("focus")

        // Trigger blur event to deactivate editor
        quillEditorVm.$emit("blur")

        // Check that isActiveTextEditor is false
        expect(wrapper.vm.isActiveTextEditor).toBe(false)
      })
    })
  })
  describe("TextEditor Component With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            TextEditor: options
          }
        })
      }
    })

    it.each([
      ["paramsDialog", { width: "500px", height: "600px" }],
      ["paramsTextEditor", { toolbar: "minimal", contentType: "html" }],
      ["theme", "snow"],
      ["mode", "outlined"],
      ["labelMode", "offsetDynamic"],
      ["animation", "transition-all duration-550"],
      ["classBody", "custom-body-class"],
      ["class", "custom-class"]
    ])("applies global %s option", (optionKey, optionValue) => {
      const localVue = createAppWithFishtVue({ [optionKey]: optionValue })

      const wrapper = mount(TextEditor, {
        global: { plugins: [localVue] }
      })

      if (optionKey === "paramsDialog") {
        expect(wrapper.vm.paramsDialog).toEqual(optionValue)
      } else if (optionKey === "paramsTextEditor") {
        expect(wrapper.vm.paramsQuillEditor).toMatchObject(optionValue as object)
      } else if (optionKey === "theme" || optionKey === "mode") {
        expect(wrapper.vm[optionKey]).toEqual(optionValue)
      } else {
        const componentInputLayout = wrapper.findComponent({ name: "InputLayout" })
        expect(componentInputLayout.vm[optionKey]).toContain(optionValue)
      }
    })

    it("overrides global options with local props", () => {
      const localVue = createAppWithFishtVue({
        theme: "bubble",
        mode: "outlined"
      })

      const wrapper = mount(TextEditor, {
        global: { plugins: [localVue] },
        props: {
          theme: "snow",
          mode: "filled"
        }
      })

      expect(wrapper.vm.theme).toBe("snow")
      expect(wrapper.vm.mode).toBe("filled")
    })

    it("applies default options when no props or global settings are provided", () => {
      const localVue = createAppWithFishtVue()

      const wrapper = mount(TextEditor, {
        global: { plugins: [localVue] }
      })

      expect(wrapper.vm.theme).toBe("bubble") // Default value
      expect(wrapper.vm.mode).toBe("outlined") // Default value
    })

    it("inherits and applies global styles from options", () => {
      const localVue = createAppWithFishtVue({
        classBody: "global-body-class",
        class: "global-class"
      })

      const wrapper = mount(TextEditor, {
        global: { plugins: [localVue] }
      })
      const componentInputLayout = wrapper.findComponent({ name: "InputLayout" })
      expect(componentInputLayout.vm.classBody).toContain("global-body-class")
      expect(componentInputLayout.vm.classBase).toContain("global-class")
    })

    it("emits events and updates modelValue when interacting with the editor", async () => {
      const localVue = createAppWithFishtVue({
        paramsTextEditor: { contentType: "delta" }
      })

      const wrapper = mount(TextEditor, {
        global: { plugins: [localVue] },
        props: {
          modelValue: "<p>Initial content</p>"
        }
      })

      const quillEditor = wrapper.findComponent({ name: "QuillEditor" })
      expect(quillEditor.exists()).toBe(true)

      // Mock QuillEditor behavior
      const quillEditorVm = quillEditor.vm as any
      quillEditorVm.getHTML = vi.fn(() => "<p>Updated content</p>")

      // Emit update event
      await quillEditorVm.$emit("update:content", "<p>Updated content</p>")

      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["<p>Updated content</p>"])
    })
  })
})
