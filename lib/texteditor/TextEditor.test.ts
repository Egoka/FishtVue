import { mount, flushPromises } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import TextEditor from "fishtvue/texteditor/TextEditor.vue"
import { QuillEditor } from "@vueup/vue-quill"
import { nextTick } from "vue"

describe.todo("TextEditor Component", () => {
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
      await flushPromises()

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
      // ["animation", "transition-all duration-550"],
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

// Standalone (non-todo) block. Mounting TextEditor boots Quill, whose
// requestAnimationFrame callbacks fire after jsdom teardown and crash the run
// (the very fragility that keeps the suite above `todo`). So the label↔control
// association is verified at the source level — mirrors Aria.test's source scan.
describe("TextEditor — accessibility label association (Wave 4)", () => {
  it("binds the editor container to the InputLayout label via aria-labelledby", async () => {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const url = await import("node:url")
    const here = path.dirname(url.fileURLToPath(import.meta.url))
    const src = await fs.readFile(path.join(here, "TextEditor.vue"), "utf8")
    // Editor container consumes the scoped default slot and links the label.
    expect(src).toMatch(/#default="\{[^}]*\bid:\s*fieldId/)
    expect(src).toMatch(/:aria-labelledby="labelledby"/)
  })
})

// componentsStyle global fallback (Wave 3.2 — texteditor.md Issue 7). Mount поднимает Quill,
// чьи rAF-колбэки стреляют после teardown jsdom и роняют прогон (та же хрупкость, что держит
// основную суиту в `todo`) — поэтому цепочка резолва проверяется на уровне source,
// зеркало соседних source-scan блоков. Канон цепочки — Input.vue:
// `props.mode ?? options?.mode ?? X.componentsStyle() ?? "outlined"`.
describe("TextEditor — componentsStyle global fallback (Wave 3.2)", () => {
  it("mode falls back to TextEditor.componentsStyle() between options and the literal default", async () => {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const url = await import("node:url")
    const here = path.dirname(url.fileURLToPath(import.meta.url))
    const src = await fs.readFile(path.join(here, "TextEditor.vue"), "utf8")
    expect(src).toMatch(
      /props\.mode\s*\?\?\s*options\?\.mode\s*\?\?\s*TextEditor\.componentsStyle\(\)\s*\?\?\s*"outlined"/
    )
  })
})

// @vueup/vue-quill + quill = optional peerDependencies (Wave 2.1). Компонент уже грузит сам
// QuillEditor через `await import("@vueup/vue-quill")` в onMounted; Quill-CSS не должен висеть
// top-level side-effect-импортом (иначе тянется в каждый bundle с `fishtvue/texteditor` и
// исполняется на import-time даже без mount). Mount грузит Quill → rAF крашит jsdom после
// teardown (та же хрупкость, что держит суиту выше `todo`), поэтому проверяем на уровне source.
describe("TextEditor — lazy Quill assets (Wave 2.1 — optional peer)", () => {
  it("loads Quill component + CSS lazily, not as top-level imports", async () => {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const url = await import("node:url")
    const here = path.dirname(url.fileURLToPath(import.meta.url))
    const src = await fs.readFile(path.join(here, "TextEditor.vue"), "utf8")
    // нет top-level side-effect css-импортов
    expect(src).not.toMatch(/^\s*import\s+["']@vueup\/vue-quill\/dist\/[^"']+\.css["']/m)
    // компонент и css грузятся динамически
    expect(src).toMatch(/import\(["']@vueup\/vue-quill["']\)/)
    expect(src).toMatch(/import\(["']@vueup\/vue-quill\/dist\/vue-quill\.snow\.css["']\)/)
    expect(src).toMatch(/import\(["']@vueup\/vue-quill\/dist\/vue-quill\.bubble\.css["']\)/)
  })
})

// surface-* token migration (Wave 9 — texteditor.md Issue 2 / B10). Mount поднимает Quill,
// чьи rAF-колбэки крашат jsdom после teardown (та же хрупкость, что держит основную суиту
// в `todo`) — поэтому проверяем на уровне source, зеркало соседних source-scan блоков.
// primitive.ts:305-317 — surface = 23-й именованный цвет (дефолт — точная копия gray).
describe("TextEditor — surface-* token migration (Wave 9 — texteditor.md Issue 2 / B10)", () => {
  it("border/background/icon Tailwind classes use surface-* instead of neutral-*/stone-*/gray-* primitives", async () => {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const url = await import("node:url")
    const here = path.dirname(url.fileURLToPath(import.meta.url))
    const src = await fs.readFile(path.join(here, "TextEditor.vue"), "utf8")

    // Старые хардкод-примитивы больше не встречаются нигде в файле.
    expect(src).not.toMatch(/border-neutral-200/)
    expect(src).not.toMatch(/dark:border-neutral-800/)
    expect(src).not.toMatch(/dark:text-gray-400/)
    expect(src).not.toMatch(/bg-stone-50/)
    expect(src).not.toMatch(/dark:bg-stone-950/)
    expect(src).not.toMatch(/bg-stone-100/)
    expect(src).not.toMatch(/dark:bg-stone-900/)
    expect(src).not.toMatch(/text-gray-400 dark:text-gray-600/)

    // border + текст рядом с рамкой редактора (editor computed).
    expect(src).toMatch(/border-surface-200/)
    expect(src).toMatch(/dark:border-surface-800/)
    expect(src).toMatch(/dark:text-surface-400/)
    // underlined/filled фон редактора.
    expect(src).toMatch(/bg-surface-50 dark:bg-surface-950/)
    expect(src).toMatch(/bg-surface-100 dark:bg-surface-900/)
    // hover-состояние иконок resize-кнопок (встречается дважды — bubble + snow resize).
    const iconHoverMatches = src.match(
      /text-surface-400 dark:text-surface-600 hover:text-surface-600 hover:dark:text-surface-400/g
    )
    expect(iconHoverMatches?.length).toBe(2)
  })

  it("raw hex in the <style> block is routed through var(--fv-surface-{tone}) except the alpha-suffixed placeholder overlays", async () => {
    const fs = await import("node:fs/promises")
    const path = await import("node:path")
    const url = await import("node:url")
    const here = path.dirname(url.fileURLToPath(import.meta.url))
    const src = await fs.readFile(path.join(here, "TextEditor.vue"), "utf8")

    // Не-alpha hex-пары (background + picker-options) для light/dark больше не хардкод.
    expect(src).not.toMatch(/--background-quill-editor:\s*#f6f3f4/)
    expect(src).not.toMatch(/--background-picker-options-quill-editor:\s*#f5f5f5/)
    expect(src).not.toMatch(/--background-quill-editor:\s*#212121/)
    expect(src).not.toMatch(/--background-picker-options-quill-editor:\s*#131313/)

    // Заменены на var(--fv-surface-{tone}, <rgb-triplet>) — формат зеркалит unoStyle/helpers.resolveColor.
    expect(src).toMatch(/--background-quill-editor:\s*rgb\(var\(--fv-surface-100,\s*243 244 246\)\)/)
    expect(src).toMatch(/--background-picker-options-quill-editor:\s*rgb\(var\(--fv-surface-100,\s*243 244 246\)\)/)
    expect(src).toMatch(/--background-quill-editor:\s*rgb\(var\(--fv-surface-900,\s*17 24 39\)\)/)
    expect(src).toMatch(/--background-picker-options-quill-editor:\s*rgb\(var\(--fv-surface-900,\s*17 24 39\)\)/)

    // Alpha-suffixed placeholder overlays (translucent black/white) — вне scope, остаются литералами.
    expect(src).toMatch(/--placeholder-quill-editor:\s*#00000099/)
    expect(src).toMatch(/--placeholder-quill-editor:\s*#ffffff99/)
  })
})
