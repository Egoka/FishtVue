import { MaybeRef, Ref, VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

/**
 * ## Accordion
 *
 * Accordion - a component that implements an accordion with support for multiple items,
 * customizable appearance, and flexible animation settings.
 *
 * Designed to display data as collapsible and expandable sections.
 */
declare class Accordion extends ClassComponent<AccordionProps, AccordionSlots, AccordionEmits, AccordionExpose> {}

// ---------------------------------------
/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-accordion>` (добавляется `ClassesMap`).
 * - `item` — секция `[data-accordion-group]` (бывший `classItem`).
 * - `header` — заголовок-кнопка `[data-accordion-button]`.
 * - `title` — `<span data-accordion-title>` с текстом заголовка (бывший `classTitle`).
 * - `panel` — раскрывающаяся панель `[data-accordion-panel]` (`role="region"`), бывший `classSubtitle`.
 * - `content` — внутренний контейнер контента `[data-accordion-content]`.
 */
export declare type AccordionClassKey = "item" | "header" | "title" | "panel" | "content"

/**
 * Represents a single item within the Accordion component.
 *
 * Переименован из `AccordionItem` в 1.0.0: имя `AccordionItem` занято renderless-компонентом
 * compound-API (`<AccordionItem>`), и одно имя на компонент и на тип данных путало импорт.
 */
export type AccordionItemData = {
  /**
   * The title of the accordion item.
   * @type {string}
   */
  title: string

  /**
   * The optional subtitle of the accordion item.
   * @type {string | undefined}
   */
  subtitle?: string

  /**
   * Indicates whether the item is initially open.
   * @type {boolean | undefined}
   */
  open?: boolean

  /**
   * The optional custom template for the accordion item's content.
   * @type {string | undefined}
   */
  template?: string

  /**
   * Internal: захваченный render-функционал содержимого секции для compound-API
   * (`<AccordionItem>…</AccordionItem>`). Заполняется родительским `<Accordion>` при VNode-walk,
   * не предназначен для прямого использования в schema-`items`.
   * @type {(() => any) | undefined}
   * @internal
   */
  _content?: () => any

  /**
   * Any additional properties for the accordion item.
   * @type {any}
   */
  [key: string]: any
}
/**
 * Props for the Accordion component.
 */
export declare type AccordionProps = {
  /**
   * Секции аккордеона (бывший `dataSource`). Единое имя коллекции с [VirtualScroller](./virtualscroller.md).
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<AccordionItemData>> | undefined}
   */
  items?: MaybeRef<Array<AccordionItemData>>
  /**
   * Enables multiple sections to be open simultaneously.
   * @type {boolean}
   */
  multiple?: boolean
  /**
   * Duration of the animation for opening/closing sections (in milliseconds).
   * @type {100 | 200 | 300 | 500 | 1000 | 3000 | number}
   */
  animationDuration?: number | 100 | 200 | 300 | 500 | 1000 | 3000
  /**
   * Type of icon displayed in the accordion section.
   * @type {"ChevronDown" | "ArrowDownCircle" | "Plus" | string}
   */
  icon?: "ChevronDown" | "ArrowDownCircle" | "Plus" | string
  /**
   * CSS-классы корня `<div data-accordion>` (dev-patterns §2 A).
   * @type {StyleClass}
   */
  class?: StyleClass
  /**
   * Карта классов внутренних элементов: `item`, `header`, `title`, `panel`, `content`; `root` ≡ `class`.
   * См. `AccordionClassKey`.
   * @type {ClassesMap<AccordionClassKey> | undefined}
   */
  classes?: ClassesMap<AccordionClassKey>
}
interface DynamicSlots {
  [key: string]: (args: Omit<AccordionItemData, "template" | "open">) => VNode[]
}
export declare type AccordionSlots = {
  /**
   * Custom rendering for the title area of a section.
   */
  title(args: { title: string }): VNode[]
  /**
   * Custom rendering for the subtitle area of a section.
   * Replaces the default text fallback. The slot scope receives all `AccordionItemData`
   * fields except `template` and `open`. Use this slot to opt into rich markup —
   * the consumer is responsible for sanitizing any HTML they pass.
   */
  "item-subtitle"(args: Omit<AccordionItemData, "template" | "open">): VNode[]
} & DynamicSlots
/**
 * Events emitted by the Accordion component.
 */
/**
 * Payload события `toggle`: какая секция переключилась, в какое состояние и весь набор секций.
 * До 1.0.0 событие отдавало только массив — по нему нельзя было понять, что именно изменилось.
 */
export declare type AccordionTogglePayload = {
  /** Индекс переключённой секции. */
  key: number
  /** Новое состояние секции: `true` — раскрыта. */
  open: boolean
  /** Текущее состояние всех секций (тот же массив, что и раньше). */
  items: Array<AccordionItemData>
}

export declare type AccordionEmits = {
  /**
   * Emitted when a section's state is toggled (opened/closed).
   * @param event
   * @param {AccordionTogglePayload} payload - Какая секция переключилась и полный набор секций.
   */
  (event: "toggle", payload: AccordionTogglePayload): void
}
export declare type AccordionExpose = {
  // ---STATE-------------------------

  /**
   * Current state of the accordion items.
   * @type {ReadRef<Array<AccordionItemData>>}
   */
  dataItems: ReadRef<Array<AccordionItemData>>

  // ---PROPS-------------------------

  /**
   * Current value of the `multiple` prop.
   * @type {ReadRef<AccordionProps["multiple"]>}
   */
  multiple: ReadRef<AccordionProps["multiple"]>

  /**
   * Current animation duration value.
   * @type {ReadRef<AccordionProps["animationDuration"]>}
   */
  animationDuration: ReadRef<AccordionProps["animationDuration"]>

  /**
   * Current type of the icon.
   * @type {ReadRef<AccordionProps["icon"]>}
   */
  icon: ReadRef<AccordionProps["icon"]>

  /**
   * Итоговый класс корня `<div data-accordion>` (база + `class`/`classes.root`).
   * @type {ReadRef<StyleClass>}
   */
  classBase: ReadRef<StyleClass>

  /**
   * Итоговый класс секции `[data-accordion-group]` (база + `classes.item`).
   * @type {ReadRef<StyleClass>}
   */
  classItem: ReadRef<StyleClass>

  /**
   * Итоговый класс `<span data-accordion-title>` (база + `classes.title`).
   * @type {ReadRef<StyleClass>}
   */
  classTitle: ReadRef<StyleClass>

  /**
   * Итоговый класс панели `[data-accordion-panel]` (база + `classes.panel`).
   * @type {ReadRef<StyleClass>}
   */
  classPanel: ReadRef<StyleClass>

  // ---ELEMENTS----------------------

  /**
   * Ref на корневой DOM-элемент аккордеона (`[data-accordion]`). `null`, пока секций нет
   * (root скрыт через `v-if`). Полезно для скролла/измерений/интеграций со стороны потребителя.
   * @type {Ref<HTMLElement | null>}
   */
  rootRef: Ref<HTMLElement | null>

  // ---METHODS-----------------------

  /**
   * Toggles the state of an accordion section (open/close) by key.
   * @param {string | number} key - The key of the item to toggle.
   */
  toggle(key: string | number): void

  /**
   * Programmatically focuses the header at the given index and updates the
   * roving tabindex so the focused header is keyboard-tabbable.
   * @param {number} index - Zero-based index of the header to focus.
   */
  focus(index: number): void
}
export declare type AccordionOption = Pick<
  AccordionProps,
  "multiple" | "animationDuration" | "icon" | "class" | "classes"
>

// ---------------------------------------
declare module "vue" {
  export interface GlobalComponents {
    Accordion: GlobalComponentConstructor<Accordion>
  }
}

export default Accordion
