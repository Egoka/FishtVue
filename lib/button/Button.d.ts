import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass } from "../types"
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
 * Ключи карты `classes` (dev-patterns §2 B). `root` — сам `<button data-button>` (добавляется `ClassesMap`).
 * - `icon` — корень `Icons` (`[data-icon]`), бывший `classIcon`.
 * - `loading` — корень `Loading` (`[data-loading]`), появляется при `loading: true`.
 */
export declare type ButtonClassKey = "icon" | "loading"

/**
 * Styling options for the Button component.
 */
type ButtonStyle = {
  /**
   * Визуальный вариант кнопки (бывший `mode`; значения не изменились). Единое имя с [Badge](./badge.md):
   * `mode` во всей библиотеке означает `StyleMode` (`filled`/`outlined`/`underlined`), а здесь набор свой.
   * Глобальный `componentsStyle` маппится сюда: `filled → primary`, `outlined → outline`, `underlined → ghost`.
   * @type {"primary" | "outline" | "ghost" | undefined}
   */
  variant?: "primary" | "outline" | "ghost"

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
   * CSS-классы корня `<button data-button>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `icon` — корень `Icons`, `loading` — корень `Loading`;
   * `root` ≡ `class`. См. `ButtonClassKey`.
   * @type {ClassesMap<ButtonClassKey> | undefined}
   */
  classes?: ClassesMap<ButtonClassKey>
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
   * Физические алиасы `"left"` / `"right"` сняты в major 2026-09-06 (решение R7):
   * они не были RTL-безопасны, а второй набор значений для одного prop'а
   * приходилось бы поддерживать до следующего breaking-релиза.
   * @type {"start" | "end" | undefined}
   */
  iconPosition?: "start" | "end"

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
   * Current visual variant of the button.
   * @type {ButtonProps["variant"]}
   */
  variant: ButtonProps["variant"]

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
   * Итоговый класс корня `<button data-button>` (база + variant + size + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * Итоговый класс иконки — hand-off в корень `Icons` (база + `classes.icon`).
   * @type {StyleClass}
   */
  classIcon: StyleClass

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
export declare type ButtonOption = Pick<ButtonProps, "variant" | "size" | "rounded" | "color" | "class" | "classes">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Button: GlobalComponentConstructor<Button>
  }
}

export default Button
