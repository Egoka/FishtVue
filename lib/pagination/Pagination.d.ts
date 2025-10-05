import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"
import type { BaseSelectProps, SelectExpose } from "fishtvue/select"

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
  sizePage?: number | 5 | 15 | 20 | 50 | 100 | 150

  /**
   * The available page sizes for selection.
   * @type {[5, 15, 20, 50, 100, 150] | Array<number> | undefined}
   */
  sizesSelector?: [5, 15, 20, 50, 100, 150] | Array<number>

  /**
   * The number of pages visible in the pagination control.
   * @type {5 | 6 | 7 | 8 | 9 | 10 | 11 | undefined}
   */
  visibleNumberPages?: 5 | 6 | 7 | 8 | 9 | 10 | 11

  /**
   * The total number of items across all pages.
   * @type {number | undefined}
   */
  total?: number

  /**
   * Enables informational text about the pagination state.
   * @type {boolean | undefined}
   */
  isInfoText?: boolean

  /**
   * Enables a selector for choosing page sizes.
   * @type {boolean | undefined}
   */
  isPageSizeSelector?: boolean

  /**
   * Hides navigation buttons if set to `true`.
   * @type {boolean | undefined}
   */
  isHiddenNavigationButtons?: boolean
  /**
   * The CSS class or classes to apply to the Pagination component.
   *
   * This property allows customization of the component's appearance
   * by specifying one or more CSS class names.
   *
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

export declare type PaginationSlots = {
  default(): VNode[]
}

/**
 * Events emitted by the Pagination component.
 */
export declare type PaginationEmits = {
  /**
   * Emitted when the active page (`modelValue`) is updated.
   * @param event
   * @param {PaginationProps["modelValue"]} payload - The updated page number.
   */
  (event: "update:modelValue", payload: PaginationProps["modelValue"]): void

  /**
   * Emitted when the page size is updated.
   * @param event
   * @param {PaginationProps["modelValue"]} payload - The updated page size.
   */
  (event: "update:sizePage", payload: PaginationProps["modelValue"]): void
}

/**
 * Methods and states exposed via `ref` for the Pagination component.
 */
export declare type PaginationExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the page size selector.
   * @type {SelectExpose | undefined}
   */
  selectPageSize: SelectExpose | undefined

  /**
   * The current page size.
   * @type {number | undefined}
   */
  sizePage: number | undefined

  // ---PROPS-------------------------
  /**
   * The number of pages visible in the pagination control.
   * @type {PaginationProps["visibleNumberPages"]}
   */
  visibleNumberPages: PaginationProps["visibleNumberPages"]

  /**
   * The total number of items across all pages.
   * @type {PaginationProps["total"]}
   */
  total: PaginationProps["total"]

  /**
   * Indicates whether informational text about pagination is enabled.
   * @type {PaginationProps["isInfoText"]}
   */
  isInfoText: PaginationProps["isInfoText"]

  /**
   * Indicates whether the page size selector is enabled.
   * @type {PaginationProps["isPageSizeSelector"]}
   */
  isPageSizeSelector: PaginationProps["isPageSizeSelector"]

  /**
   * Indicates whether navigation buttons are hidden.
   * @type {PaginationProps["isHiddenNavigationButtons"]}
   */
  isNavigationButtons: PaginationProps["isHiddenNavigationButtons"]

  /**
   * Array of available sizes for the page size selector.
   * @type {Array<{ key: number; value: string }>}
   */
  arraySizesSelector: Array<{ key: number; value: string }>

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
   * Parameters for the page size selector component.
   * @type {Partial<BaseSelectProps>}
   */
  paramsSelect: Partial<BaseSelectProps>

  // ---METHODS-----------------------
  /**
   * Switches to a specific page or an array of pages.
   * @param {PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>} value - The page(s) to switch to.
   */
  switchPage(value: PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>): void

  /**
   * Updates the page size.
   * @param {PaginationProps["modelValue"]} sizePageValue - The new page size.
   */
  switchSizePage(sizePageValue: PaginationProps["modelValue"]): void
}
export declare type PaginationOption = Pick<
  PaginationProps,
  | "mode"
  | "sizePage"
  | "sizesSelector"
  | "visibleNumberPages"
  | "total"
  | "isInfoText"
  | "isPageSizeSelector"
  | "isHiddenNavigationButtons"
  | "class"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Pagination: GlobalComponentConstructor<Pagination>
  }
}

export default Pagination
