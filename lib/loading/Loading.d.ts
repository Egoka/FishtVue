import { ClassComponent, ClassesMap, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { componentsMapEpic, componentsMapSvg } from "fishtvue/loading/loadingTypes"

/**
 * ## Loading
 *
 * Loading - a component for displaying loading indicators with various styles and animations.
 *
 * Supports multiple loading types, customizable sizes, colors, and animation durations.
 */
declare class Loading extends ClassComponent<LoadingProps, LoadingSlots, LoadingEmits, LoadingExpose> {}

export type EpicLoading = keyof typeof componentsMapEpic
export type SvgLoading = keyof typeof componentsMapSvg

/**
 * Props for the Loading component.
 */
export declare type LoadingProps = {
  /**
   * The type of loading animation to display.
   *
   * `"simple"` не перечисляется отдельно: это ключ `componentsMapSvg`, то есть уже член
   * `SvgLoading` (см. `loadingTypes.ts`). Набор значений для вызывающего кода не изменился.
   * @type {EpicLoading | SvgLoading | undefined}
   */
  type?: EpicLoading | SvgLoading

  /**
   * The duration of the animation in milliseconds.
   *
   * Литералы — рекомендованные пресеты, `(number & {})` держит union открытым: любое число
   * по-прежнему допустимо, но подсказки не схлопываются в `number` (идиома `lib/icons/Icons.d.ts`).
   * @type {1000 | 1200 | 1500 | 2000 | 2500 | 3000 | 4000 | 5000 | 6000 | (number & {}) | undefined}
   */
  animationDuration?: 1000 | 1200 | 1500 | 2000 | 2500 | 3000 | 4000 | 5000 | 6000 | (number & {})

  /**
   * The size of the loading animation in pixels.
   *
   * Пресетов нет — рендер принимает любое px-значение (default `20`), поэтому прежний
   * `number | 40 | 50 | …` был декоративным: TS схлопывал его в `number` без autocomplete.
   * @type {number | undefined}
   */
  size?: number

  /**
   * The color of the loading animation.
   * @type {string | undefined}
   */
  color?: string

  /**
   * CSS-классы корня `<div data-loading>`.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов (dev-patterns §2 B). У Loading единственный элемент — корень, поэтому доступен только `root` (≡ `class`).
   * @type {ClassesMap | undefined}
   */
  classes?: ClassesMap
}

export declare type LoadingSlots = null

export declare type LoadingEmits = null

/**
 * Methods and states exposed via `ref` for the Loading component.
 */
export declare type LoadingExpose = {
  // ---PROPS-------------------------
  /**
   * The current type of the loading animation.
   * @type {ReadRef<LoadingProps["type"]>}
   */
  type: ReadRef<LoadingProps["type"]>

  /**
   * The current animation duration in milliseconds.
   * @type {ReadRef<LoadingProps["animationDuration"]>}
   */
  animationDuration: ReadRef<LoadingProps["animationDuration"]>

  /**
   * The current size of the loading animation.
   * @type {ReadRef<LoadingProps["size"]>}
   */
  size: ReadRef<LoadingProps["size"]>

  /**
   * The current color of the loading animation.
   * @type {ReadRef<LoadingProps["color"]>}
   */
  color: ReadRef<LoadingProps["color"]>

  /**
   * The current CSS class applied to the loading container.
   * @type {ReadRef<LoadingProps["class"]>}
   */
  classLoading: ReadRef<LoadingProps["class"]>
}
export declare type LoadingOption = Pick<
  LoadingProps,
  "type" | "animationDuration" | "size" | "color" | "class" | "classes"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Loading: GlobalComponentConstructor<Loading>
  }
}

export default Loading
