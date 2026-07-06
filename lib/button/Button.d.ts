import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { Component, Ref, VNode } from "vue"

/**
 * ## Button
 *
 * Button - a versatile component for triggering actions or events.
 *
 * Supports different styles, sizes, icons, and states such as loading or disabled.
 */
declare class Button extends ClassComponent<ButtonProps, ButtonSlots, ButtonEmits, ButtonExpose> {}

/**
 * Styling options for the Button component.
 */
type ButtonStyle = {
  /**
   * The visual mode of the button.
   * @type {"primary" | "outline" | "ghost" | undefined}
   */
  mode?: "primary" | "outline" | "ghost"

  /**
   * Size of the button.
   * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"

  /**
   * The corner rounding style of the button.
   * @type {"none" | "md" | "lg" | "full" | undefined}
   */
  rounded?: "none" | "md" | "lg" | "full"

  /**
   * Color theme for the button.
   * @type {"theme" | "neutral" | "creative" | "destructive" | undefined}
   */
  color?: "theme" | "neutral" | "creative" | "destructive"

  /**
   * Custom CSS class for the button.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the button's icon.
   * @type {StyleClass | undefined}
   */
  classIcon?: StyleClass
}
/**
 * Base props shared between simple and icon buttons.
 */
type BaseButtonProps = ButtonStyle & {
  /**
   * Icon to be displayed in the button.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Position of the icon relative to the default content, using logical
   * (writing-direction-aware) values:
   * - `"start"` — перед контентом (визуально слева в LTR, справа в RTL);
   * - `"end"` — после контента (default; визуально справа в LTR, слева в RTL).
   *
   * Значения `"left"` / `"right"` — **deprecated** алиасы (`left → start`,
   * `right → end`), сохранены для обратной совместимости и в dev-режиме
   * выводят предупреждение. Используй logical-значения для корректного RTL.
   * @type {"start" | "end" | "left" | "right" | undefined}
   */
  iconPosition?: "start" | "end" | "left" | "right"

  /**
   * Disables the button.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Indicates if the button is in a loading state.
   * @type {boolean | undefined}
   */
  loading?: boolean

  /**
   * Accessible name announced by screen readers.
   *
   * Особенно важен для `type="icon"` без default-slot — без `ariaLabel` icon-only
   * кнопка озвучивается screen-reader'ом просто как «button» (WCAG 2.1 SC 4.1.2).
   *
   * Для не-icon-кнопок не используется (текст внутри `<slot>` сам по себе является
   * accessible name).
   * @type {string | undefined}
   */
  ariaLabel?: string

  /**
   * Polymorphic корневой тег/компонент. По умолчанию `"button"`. Позволяет рендерить
   * Button как `<a>` / `<RouterLink>` / `<NuxtLink>` с сохранением стилей. Для
   * не-`<button>`/не-`<a>` корней автоматически проставляются `role="button"` и
   * `tabindex` (`0`, либо `-1` при `disabled`); нативный `type` ставится только на
   * `<button>`. Атрибуты вроде `href`/`to`/`target` пробрасываются через fallthrough.
   * @type {string | Component | undefined}
   */
  as?: string | Component
}

/**
 * Props for a simple button.
 */
export type SimpleButtonProps = BaseButtonProps & {
  /**
   * Type of the button element.
   * @type {"button" | "reset" | "submit" | undefined}
   */
  type?: "button" | "reset" | "submit"
}
/**
 * Props for an icon-only button.
 */
export type IconButtonProps = BaseButtonProps & {
  /**
   * Indicates the button is icon-only.
   * @type {"icon"}
   */
  type?: "icon"
}
/**
 * Props for the Button component.
 */
export type ButtonProps = SimpleButtonProps | IconButtonProps
export declare type ButtonSlots = {
  /**
   * Содержимое кнопки. Для `type="icon"` — content tooltip'а через FixWindow.
   */
  default(): VNode[]

  /**
   * Контент перед `default`-slot'ом и до иконки. Используется для prepend-композиции
   * (badge, status dot и т. п.). Имя `start` соответствует logical writing order: при
   * `dir="rtl"` slot визуально оказывается справа (корневой `<button>` — `inline-flex`,
   * main-axis следует document direction).
   */
  start?(): VNode[]

  /**
   * Контент после `default`-slot'а, после иконки и loading-индикатора. Используется
   * для append-композиции. См. описание `start` про logical naming.
   */
  end?(): VNode[]
}
export declare type ButtonEmits = {
  /**
   * Эмитится при нативном click по `<button>`. Кнопка не интерсептит и не превращает
   * payload — это пробрасываемое нативное MouseEvent.
   * @param {MouseEvent} payload — нативный click event с `target`/`currentTarget`.
   */
  (event: "click", payload: MouseEvent): void
}
/**
 * Methods and states exposed via `ref` for the Button component.
 */
export declare type ButtonExpose = {
  // ---STATE-------------------------
  /**
   * Ref на корневой элемент. По умолчанию `<button>`; при polymorphic `as` —
   * соответствующий тег (`<a>` и т. п.). Позволяет programmatically делать
   * `.focus()`/`.click()`/`.scrollIntoView()` без обращения к DOM-селекторам.
   * @type {Readonly<Ref<HTMLElement | undefined>>}
   */
  buttonRef: Readonly<Ref<HTMLElement | undefined>>

  // ---PROPS-------------------------
  /**
   * Current visual mode of the button.
   * @type {ButtonProps["mode"]}
   */
  mode: ButtonProps["mode"]

  /**
   * Current size of the button.
   * @type {ButtonProps["size"]}
   */
  size: ButtonProps["size"]

  /**
   * Current corner rounding style of the button.
   * @type {ButtonProps["rounded"]}
   */
  rounded: ButtonProps["rounded"]

  /**
   * Current color theme of the button.
   * @type {ButtonProps["color"]}
   */
  color: ButtonProps["color"]

  /**
   * Current CSS class for the button container.
   * @type {ButtonProps["class"]}
   */
  classBase: ButtonProps["class"]

  /**
   * Current CSS class for the button's icon.
   * @type {ButtonProps["classIcon"]}
   */
  classIcon: ButtonProps["classIcon"]

  // ---METHODS-----------------------
  /**
   * Programmatically focuses the underlying `<button>`. Опционально принимает
   * native `FocusOptions` (например, `{ preventScroll: true }`).
   */
  focus(options?: FocusOptions): void

  /**
   * Programmatically blurs the underlying `<button>`.
   */
  blur(): void
}
export declare type ButtonOption = Pick<ButtonProps, "mode" | "size" | "rounded" | "color" | "class" | "classIcon">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Button: GlobalComponentConstructor<Button>
  }
}

export default Button
