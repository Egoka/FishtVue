import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"
import type { BaseSelectProps, SelectExpose } from "fishtvue/select"
// ---------------------------------------

export declare type PaginationProps = {
  modelValue?: number
  mode?: StyleMode
  sizePage?: number | 5 | 15 | 20 | 50 | 100 | 150
  sizesSelector?: [5, 15, 20, 50, 100, 150] | Array<number>
  visibleNumberPages?: 5 | 6 | 7 | 8 | 9 | 10 | 11
  total?: number
  isInfoText?: boolean
  isPageSizeSelector?: boolean
  isHiddenNavigationButtons?: boolean
  class?: StyleClass
}
export declare type PaginationSlots = {
  default(): VNode[]
}
export declare type PaginationEmits = {
  (event: "update:modelValue", payload: PaginationProps["modelValue"]): void
  (event: "update:sizePage", payload: PaginationProps["modelValue"]): void
}
export declare type PaginationExpose = {
  // ---STATE-------------------------
  selectPageSize: Ref<SelectExpose | undefined>
  sizePage: ReadRef<number | undefined>
  // ---PROPS-------------------------
  visibleNumberPages: ReadRef<NonNullable<PaginationProps["visibleNumberPages"]>>
  total: ReadRef<NonNullable<PaginationProps["total"]>>
  isInfoText: ReadRef<PaginationProps["isInfoText"]>
  isPageSizeSelector: ReadRef<PaginationProps["isPageSizeSelector"]>
  isNavigationButtons: ReadRef<PaginationProps["isHiddenNavigationButtons"]>
  arraySizesSelector: ReadRef<Array<{ key: number; value: string }>>
  pages: ReadRef<Array<number>>
  activePage: Ref<PaginationProps["modelValue"]>
  mode: ReadRef<NonNullable<PaginationProps["mode"]>>
  paramsSelect: ReadRef<Partial<BaseSelectProps>>
  // ---METHODS-----------------------
  switchPage(value: PaginationProps["modelValue"] | Array<PaginationProps["modelValue"]>): void
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
declare class Pagination extends ClassComponent<PaginationProps, PaginationSlots, PaginationEmits, PaginationExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Pagination: GlobalComponentConstructor<Pagination>
  }
}

export default Pagination
