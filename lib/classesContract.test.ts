import { afterEach, describe, expect, it } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import type { Component } from "vue"
import FishtVue from "fishtvue/config"

/**
 * Cross-cutting контракт `class` / `classes` (dev-patterns §2 A–E) для всех стилизуемых компонентов.
 *
 * Для каждого компонента манифест фиксирует корень (`data-{name}`) и карту ключей `classes.<key>` →
 * селектор элемента (`data-{name}-{key}`). Проверяется:
 * 1. prop `class` ложится **только** на корень — ни на один внутренний `data-*`-элемент;
 * 2. `classes.<key>` ложится на объявленный элемент;
 * 3. под `unstyled: true` классы потребителя переживают, а тема (`{prefix}-{name}`) — нет.
 *
 * Per-component нюансы (aspect-ключи, hand-off'ы, слоты) живут в `<Name>.test.ts`; здесь — инвариант.
 * `PENDING` — компоненты до своей волны; обнуляется в W7, после чего `skipIf` удаляется.
 */
const PENDING: string[] = ["Alert", "Dialog", "Form", "Menu", "Split", "Table"]

type Entry = {
  name: string
  load: () => Promise<{ default: Component }>
  root: string
  props?: Record<string, unknown>
  slots?: Record<string, string>
  /** key → selектор элемента (все совпадения обязаны нести класс). */
  keys: Record<string, string>
}

const CONTRACT: Entry[] = [
  {
    name: "Accordion",
    load: () => import("fishtvue/accordion/Accordion.vue"),
    root: "[data-accordion]",
    props: { items: [{ title: "A", subtitle: "B", open: true }] },
    keys: {
      item: "[data-accordion-group]",
      header: "[data-accordion-button]",
      title: "[data-accordion-title]",
      panel: "[data-accordion-panel]",
      content: "[data-accordion-content]"
    }
  },
  {
    name: "Alert",
    load: () => import("fishtvue/alert/Alert.vue"),
    root: "[data-alert]",
    props: { modelValue: true, title: "T", subtitle: "S", closeButton: true },
    keys: {
      body: "[data-alert-body]",
      icon: "[data-alert-icon]",
      content: "[data-alert-content]",
      title: "[data-alert-title]",
      subtitle: "[data-alert-subtitle]",
      close: "[data-alert-button]"
    }
  },
  {
    name: "Badge",
    load: () => import("fishtvue/badge/Badge.vue"),
    root: "[data-badge]",
    props: { point: true, closeButton: true },
    slots: { default: "x" },
    keys: { content: "[data-badge-content]", point: "[data-badge-point]", close: "[data-badge-close]" }
  },
  {
    name: "Button",
    load: () => import("fishtvue/button/Button.vue"),
    root: "[data-button]",
    props: { icon: "check", loading: true },
    slots: { default: "x" },
    // Собственные маркеры hand-off'ов: `[data-loading]` — корень `Loading`, но такой же
    // state-атрибут `:data-loading` висит на корне самого Button (§2 I).
    keys: { icon: "[data-button-icon]", loading: "[data-button-loading]" }
  },
  {
    name: "Calendar",
    load: () => import("fishtvue/calendar/Calendar.vue"),
    root: "[data-calendar]",
    props: { label: "L", help: "H" },
    keys: {
      base: "[data-input-layout-base]",
      label: "[data-label]",
      help: "[data-input-layout-help]",
      control: "[data-calendar-control]",
      text: "[data-calendar-text]"
    }
  },
  {
    name: "Dialog",
    load: () => import("fishtvue/dialog/Dialog.vue"),
    root: "[data-dialog]",
    props: { modelValue: true, closeButton: true, teleport: false },
    slots: { default: "x" },
    keys: { content: "[data-dialog-content]", backdrop: "[data-dialog-background]", close: "[data-dialog-close]" }
  },
  {
    name: "FixWindow",
    load: () => import("fishtvue/fixwindow/FixWindow.vue"),
    root: "[data-fix-window]",
    props: { modelValue: true, closeButton: true, teleport: false },
    slots: { default: "x" },
    keys: { content: "[data-fix-window-content]", close: "[data-fix-window-close]" }
  },
  {
    name: "Form",
    load: () => import("fishtvue/form/Form.vue"),
    root: "[data-form]",
    props: { structure: [{ fields: [{ typeComponent: "Input", name: "a" }] }] },
    keys: {
      section: "[data-form-item]",
      grid: "[data-form-group]",
      field: "[data-form-field]",
      footer: "[data-form-footer]"
    }
  },
  {
    name: "Icons",
    load: () => import("fishtvue/icons/Icons.vue"),
    root: "[data-icon]",
    props: { type: "check" },
    keys: { icon: "[data-icon-svg]" }
  },
  {
    name: "Input",
    load: () => import("fishtvue/input/Input.vue"),
    root: "[data-input]",
    props: { type: "password", label: "L" },
    keys: {
      base: "[data-input-layout-base]",
      label: "[data-label]",
      control: "[data-input-control]",
      passwordToggle: "[data-input-password-toggle]"
    }
  },
  {
    name: "InputLayout",
    load: () => import("fishtvue/inputlayout/InputLayout.vue"),
    root: "[data-input-layout]",
    props: { value: "v", label: "L", help: "H", invalid: true, messageInvalid: "M" },
    slots: { default: "<input />", before: "b", after: "a" },
    keys: {
      base: "[data-input-layout-base]",
      label: "[data-label]",
      help: "[data-input-layout-help]",
      message: "[data-input-layout-message-invalid]",
      before: "[data-input-layout-before]",
      after: "[data-input-layout-after]"
    }
  },
  {
    name: "Label",
    load: () => import("fishtvue/label/Label.vue"),
    root: "[data-label]",
    props: { label: "L" },
    keys: { text: "[data-label-text]" }
  },
  { name: "Loading", load: () => import("fishtvue/loading/Loading.vue"), root: "[data-loading]", keys: {} },
  {
    name: "Menu",
    load: () => import("fishtvue/menu/Menu.vue"),
    root: "[data-menu]",
    props: {
      title: "T",
      groups: [{ title: "G", items: [{ title: "I", icon: "check", info: "i", menu: { groups: [] } }], separator: {} }]
    },
    keys: {
      title: "[data-menu-title]",
      separator: "[data-separator]",
      group: "[data-menu-group]",
      groupTitle: "[data-menu-group-title]",
      item: "[data-menu-item]",
      itemIcon: "[data-menu-item-icon]",
      itemTitle: "[data-menu-item-title]",
      itemInfo: "[data-menu-item-info]",
      itemEndIcon: "[data-menu-item-end-icon]"
    }
  },
  {
    name: "Pagination",
    load: () => import("fishtvue/pagination/Pagination.vue"),
    root: "[data-pagination]",
    props: { total: 100 },
    keys: {}
  },
  {
    name: "Select",
    load: () => import("fishtvue/select/Select.vue"),
    root: "[data-select]",
    props: { options: [{ id: 1, value: "a" }], label: "L" },
    // Внутри дропдауна живёт собственный поисковый `Input` со своим layout'ом и лейблом — семейные
    // ключи скоупим на корень Select, иначе проверка требовала бы probe и на чужих элементах.
    keys: {
      base: "[data-select] > [data-input-layout-base]",
      label: "[data-select] > [data-label]",
      control: "[data-select-control]",
      list: "[data-select-list]",
      option: "[data-select-list-item]"
    }
  },
  {
    name: "Separator",
    load: () => import("fishtvue/separator/Separator.vue"),
    root: "[data-separator]",
    props: { contentPosition: "center" },
    slots: { default: "x" },
    keys: {
      segment: "[data-separator-start], [data-separator-end]",
      segmentStart: "[data-separator-start]",
      segmentEnd: "[data-separator-end]",
      line: "[data-separator-line]",
      lineStart: "[data-separator-start] [data-separator-line]",
      lineEnd: "[data-separator-end] [data-separator-line]",
      content: "[data-separator-content]"
    }
  },
  {
    name: "Split",
    load: () => import("fishtvue/split/Split.vue"),
    root: "[data-split]",
    props: { panels: [{ name: "a" }, { name: "b" }] },
    keys: { panel: "[data-split-item]", separator: "[data-split-separator]" }
  },
  {
    name: "Switch",
    load: () => import("fishtvue/switch/Switch.vue"),
    root: "[data-switch]",
    props: { label: "L", help: "H" },
    keys: { control: "[data-switch-control]", label: "[data-switch-label]", help: "[data-switch-help]" }
  },
  {
    name: "Table",
    load: () => import("fishtvue/table/Table.vue"),
    root: "[data-table]",
    props: {
      dataSource: [{ a: 1 }, { a: 2 }],
      columns: [{ dataField: "a", name: "a" }],
      toolbar: true,
      pagination: true,
      summary: [{ dataField: "a", type: "sum" }]
    },
    slots: { header: "h", footer: "f" },
    keys: {
      toolbar: "[data-table-toolbar]",
      header: "[data-table-header]",
      footer: "[data-table-footer]",
      body: "[data-table-body]",
      viewport: "[data-table-viewport]",
      table: "[data-table-element]",
      thead: "[data-table-thead]",
      tbody: "[data-table-tbody]",
      tfoot: "[data-table-tfoot]",
      th: "[data-table-thead-col]",
      td: "[data-table-tbody-td]",
      pagination: "[data-pagination]"
    }
  },
  {
    name: "Textarea",
    load: () => import("fishtvue/textarea/Textarea.vue"),
    root: "[data-textarea]",
    props: { label: "L" },
    keys: { base: "[data-input-layout-base]", label: "[data-label]", control: "[data-textarea-control]" }
  },
  {
    name: "TextEditor",
    load: () => import("fishtvue/texteditor/TextEditor.vue"),
    root: "[data-text-editor]",
    props: { label: "L" },
    keys: { base: "[data-input-layout-base]", label: "[data-label]", editor: "[data-text-editor-editor]" }
  },
  {
    name: "VirtualScroller",
    load: () => import("fishtvue/virtualscroller/VirtualScroller.vue"),
    root: "[data-virtual-scroller]",
    props: { items: [1, 2, 3], loading: true, loader: true },
    keys: { content: "[data-vs-content]", viewport: "[data-vs-viewport]", loader: "[data-vs-loader]" }
  }
]

const unstyledPlugin = {
  install(app: any) {
    app.use(FishtVue, { unstyled: true })
  }
}

const classesOf = (el: Element) => (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean)

/**
 * Область поиска ключей. У телепортируемых компонентов (FixWindow/Dialog/Alert) корень живёт под
 * `<Teleport>`, поэтому `wrapper.element` в VTU — fragment-якорь, а не DOM-узел: `querySelectorAll`
 * от него ничего не находит. Все entry монтируются с `attachTo: document.body`, так что fallback
 * на `document.body` покрывает и телепорт, и inline-render.
 */
const scopeOf = (wrapper: { element: unknown }): Element =>
  (wrapper.element as Element)?.querySelectorAll ? (wrapper.element as Element) : document.body

/**
 * Ленивые дети (`Loading`/`FixWindow` под `defineAsyncComponent`) резолвятся за несколько
 * macrotask-тиков. На холодном графе модулей селектор ключа не найдётся сразу, поэтому
 * прокручиваем очередь до готовности — иначе результат зависит от порядка файлов (`isolate:false`).
 */
const flushLazy = async (isReady: () => boolean, maxTicks = 50): Promise<void> => {
  for (let tick = 0; tick < maxTicks; tick++) {
    if (isReady()) return
    await flushPromises()
    await new Promise((r) => setTimeout(r))
    await flushPromises()
  }
}

describe("Cross-cutting контракт class/classes (dev-patterns §2 A–E)", () => {
  // `window.FishtVue` — глобальный singleton (config inject-first / window-fallback): чистим,
  // чтобы `unstyled: true` не протёк в соседние файлы (vite.config.ts: isolate:false).
  afterEach(() => {
    delete (window as any).FishtVue
  })

  it("манифест покрывает все 23 стилизуемых компонента без дублей", () => {
    const names = CONTRACT.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names.length).toBe(23)
    expect(PENDING.every((n) => names.includes(n))).toBe(true)
  })

  for (const entry of CONTRACT) {
    const skip = PENDING.includes(entry.name)
    describe(entry.name, () => {
      const render = async (extra: Record<string, unknown>, plugins: unknown[] = []) => {
        const { default: component } = await entry.load()
        return mount(component, {
          props: { ...(entry.props ?? {}), ...extra },
          slots: entry.slots,
          global: { plugins: plugins as any },
          attachTo: document.body
        })
      }

      it.skipIf(skip)("prop `class` ложится только на корень", async () => {
        const wrapper = await render({ class: "probe-root" })
        const root = wrapper.find(entry.root)
        expect(root.exists(), `корень ${entry.root} не найден`).toBe(true)
        expect(classesOf(root.element)).toContain("probe-root")
        const leaked = Array.from(root.element.querySelectorAll("[class~='probe-root']"))
        expect(leaked, "`class` утёк во внутренний элемент").toEqual([])
        wrapper.unmount()
      })

      for (const [key, selector] of Object.entries(entry.keys)) {
        it.skipIf(skip)(`classes.${key} → ${selector}`, async () => {
          const probe = `probe-${key.toLowerCase()}`
          const wrapper = await render({ classes: { [key]: probe } })
          await flushLazy(() => scopeOf(wrapper).querySelector(selector) !== null)
          const targets = Array.from(scopeOf(wrapper).querySelectorAll(selector))
          expect(targets.length, `элемент ${selector} не найден`).toBeGreaterThan(0)
          for (const el of targets) expect(classesOf(el), `${selector} без ${probe}`).toContain(probe)
          wrapper.unmount()
        })
      }

      it.skipIf(skip)("под unstyled классы потребителя остаются, тема — нет", async () => {
        const firstKey = Object.keys(entry.keys)[0]
        const wrapper = await render({ class: "probe-root", classes: firstKey ? { [firstKey]: "probe-inner" } : {} }, [
          unstyledPlugin
        ])
        if (firstKey) await flushLazy(() => scopeOf(wrapper).querySelector(entry.keys[firstKey]) !== null)
        const root = wrapper.find(entry.root)
        expect(classesOf(root.element)).toContain("probe-root")
        expect(classesOf(root.element).some((c) => c.startsWith("fishtvue-"))).toBe(false)
        if (firstKey) {
          const el = scopeOf(wrapper).querySelector(entry.keys[firstKey])
          expect(el && classesOf(el)).toContain("probe-inner")
        }
        wrapper.unmount()
      })
    })
  }
})
