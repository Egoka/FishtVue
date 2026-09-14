import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"
import type { BaseSelectProps, SelectExpose, SelectProps } from "fishtvue/select"

/**
 * ## Pagination
 *
 * Pagination - a component for navigating through pages of data.
 *
 * Supports custom page sizes, navigation controls, and configuration for visible pages and total items.
 */
declare class Pagination extends ClassComponent<PaginationProps, PaginationSlots, PaginationEmits, PaginationExpose> {}

/**
 * Props for the Pagination component.
 */
export declare type PaginationProps = {
  /**
   * The current active page.
   * @type {number | undefined}
   */
  modelValue?: number

  /**
   * The styling mode of the pagination.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * The size of a single page (number of items per page).
   * @type {number | 5 | 15 | 20 | 50 | 100 | 150 | undefined}
   */
  pageSize?: number | 5 | 15 | 20 | 50 | 100 | 150

  /**
   * The available page sizes for selection.
   * @type {[5, 15, 20, 50, 100, 150] | Array<number> | undefined}
   */
  pageSizes?: [5, 15, 20, 50, 100, 150] | Array<number>

  /**
   * The number of pages visible in the pagination control.
   * @type {5 | 6 | 7 | 8 | 9 | 10 | 11 | undefined}
   */
  visiblePages?: 5 | 6 | 7 | 8 | 9 | 10 | 11

  /**
   * The total number of items across all pages.
   * @type {number | undefined}
   */
  total?: number

  /**
   * Enables informational text about the pagination state.
   * @type {boolean | undefined}
   */
  infoText?: boolean

  /**
   * Enables a selector for choosing page sizes.
   * @type {boolean | undefined}
   */
  pageSizeSelector?: boolean

  /**
   * Показывать кнопки навигации «назад/вперёд». Инверсия снятого `isHiddenNavigationButtons`
   * (dev-patterns §2 F): bare-positive имя, default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  navigationButtons?: boolean

  /**
   * CSS-классы корня `<nav data-pagination>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Props селектора размера страницы (dev-patterns §2 G). Бывший `paramsSelect` в expose.
   * @type {PaginationSelectProps | undefined}
   */
  selectProps?: PaginationSelectProps
}

/**
 * Подмножество props [Select](./select.md), которым Pagination настраивает свой селектор
 * размера страницы. `class`/`classes` вынесены явно — `Partial<BaseSelectProps>` их не содержит.
 */
export declare type PaginationSelectProps = Partial<BaseSelectProps> &
  Pick<SelectProps, "class" | "classes" | "fixWindowProps">

export declare type PaginationSlots = {
  default(): VNode[]
}

/**
 * Events emitted by the Pagination component.
 */
export declare type PaginationEmits = {
  /**
   * Emitted when the active page (`modelValue`) is updated.
   * Payload — всегда число: канал синхронизирует `modelValue`, а не отражает его optional-тип.
   * @param event
   * @param {number} payload - The updated page number.
   */
  (event: "update:modelValue", payload: number): void

  /**
   * Emitted when the page size is updated. Payload — новый размер страницы (не активная
   * страница: до 1.0 здесь по ошибке стоял тип `PaginationProps["modelValue"]`).
   * @param event
   * @param {number} payload - The updated page size.
   */
  (event: "update:pageSize", payload: number): void
}

/**
 * Methods and states exposed via `ref` for the Pagination component.
 */
export declare type PaginationExpose = {
  // ---STATE-------------------------
  /**
   * Ref на корневой `<nav>`-элемент пагинации. Позволяет programmatically делать
   * `.focus()` / `.scrollIntoView()` без обращения к DOM-селекторам.
   * @type {Readonly<Ref<HTMLElement | undefined>>}
   */
  paginationRef: Readonly<Ref<HTMLElement | undefined>>

  /**
   * Reference to the page size selector.
   * @type {SelectExpose | undefined}
   */
  selectPageSize: SelectExpose | undefined

  /**
   * The current page size.
   * @type {number | undefined}
   */
  pageSize: number | undefined

  // ---PROPS-------------------------
  /**
   * The number of pages visible in the pagination control.
   * @type {PaginationProps["visiblePages"]}
   */
  visiblePages: PaginationProps["visiblePages"]

  /**
   * The total number of items across all pages.
   * @type {PaginationProps["total"]}
   */
  total: PaginationProps["total"]

  /**
   * Indicates whether informational text about pagination is enabled.
   * @type {PaginationProps["infoText"]}
   */
  isInfoText: PaginationProps["infoText"]

  /**
   * Indicates whether the page size selector is enabled.
   * @type {PaginationProps["pageSizeSelector"]}
   */
  isPageSizeSelector: PaginationProps["pageSizeSelector"]

  /**
   * Показываются ли кнопки навигации (`navigationButtons`, default `true`).
   * @type {PaginationProps["navigationButtons"]}
   */
  isNavigationButtons: PaginationProps["navigationButtons"]

  /**
   * Array of available sizes for the page size selector.
   * @type {Array<{ key: number; value: string }>}
   */
  arrayPageSizes: Array<{ key: number; value: string }>

  /**
   * Array of page numbers available for navigation.
   * @type {Array<number>}
   */
  pages: Array<number>

  /**
   * The currently active page number.
   * @type {PaginationProps["modelValue"]}
   */
  activePage: PaginationProps["modelValue"]

  /**
   * The current styling mode of the pagination.
   * @type {PaginationProps["mode"]}
   */
  mode: PaginationProps["mode"]

  /**
   * The CSS class string for the select component based on the current mode.
   * @type {string}
   */
  modeStyleSelect: string

  /**
   * Итоговые props селектора размера страницы (база Pagination + `selectProps` потребителя).
   * @type {PaginationSelectProps}
   */
  selectProps: PaginationSelectProps

  /**
   * Итоговый класс корня `<nav data-pagination>` (база + mode + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  // ---METHODS-----------------------
  /**
   * Switches to a specific page or an array of pages.
   * @param {PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>} value - The page(s) to switch to.
   */
  switchPage(value: PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>): void

  /**
   * Updates the page size.
   * @param {PaginationProps["modelValue"]} value - The new page size.
   */
  switchPageSize(value: PaginationProps["modelValue"]): void

  /**
   * Программно фокусирует корневой `<nav>` пагинации. Опционально принимает native
   * `FocusOptions` (например, `{ preventScroll: true }`).
   */
  focus(options?: FocusOptions): void
}
export declare type PaginationOption = Pick<
  PaginationProps,
  | "mode"
  | "pageSize"
  | "pageSizes"
  | "visiblePages"
  | "total"
  | "infoText"
  | "pageSizeSelector"
  | "navigationButtons"
  | "class"
  | "selectProps"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Pagination: GlobalComponentConstructor<Pagination>
  }
}

export default Pagination
