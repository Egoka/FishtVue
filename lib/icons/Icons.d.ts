import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { CSSProperties } from "vue"

/**
 * ## Icons
 *
 * Icons - a component for rendering customizable icons.
 *
 * Supports various icon types, styles, and CSS classes for flexible usage.
 */
declare class Icons extends ClassComponent<IconsProps, IconsSlots, IconsEmits, IconsExpose> {}

/**
 * Curated-набор имён Heroicons, которые библиотека бандлит и резолвит offline.
 *
 * Этот union === runtime const-реестр в [Icons.vue](./Icons.vue) (HERO_OUTLINE/HERO_SOLID,
 * Issue 1 — tree-shaking): только эти 37 имён резолвятся как heroicon (outline + solid).
 * Любое другое имя (в т.ч. валидный heroicon вне набора — `"camera"`, `"beaker"`) валидно
 * через `(string & {})`-fallback в `IconType`, но в runtime уходит в Iconify-fallback,
 * а не в heroicons. Расширение набора — добавить имя сюда И импорт в оба реестра Icons.vue.
 *
 * 30 публичных + 7 internal (используются `lib/`-компонентами): `arrow-long-right`,
 * `arrows-pointing-in`/`-out`, `ellipsis-vertical`, `exclamation-circle`, `funnel`, `square-2-stack`.
 */
export declare type HeroIconName =
  | "check"
  | "x-mark"
  | "user"
  | "users"
  | "home"
  | "cog-6-tooth"
  | "bell"
  | "envelope"
  | "magnifying-glass"
  | "plus"
  | "minus"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "trash"
  | "pencil"
  | "eye"
  | "eye-slash"
  | "lock-closed"
  | "lock-open"
  | "exclamation-triangle"
  | "information-circle"
  | "question-mark-circle"
  | "check-circle"
  | "x-circle"
  | "arrow-long-right"
  | "arrows-pointing-in"
  | "arrows-pointing-out"
  | "ellipsis-vertical"
  | "exclamation-circle"
  | "funnel"
  | "square-2-stack"

/**
 * Iconify icon name pattern — `${collection}:${name}`, например `"mdi:home"`, `"ph:user"`.
 */
export declare type IconifyIconName = `${string}:${string}`

/**
 * Public union for `IconsProps.type`. Heroicons subset + Iconify pattern + open string fallback.
 *
 * `(string & {})` сохраняет совместимость с произвольными строками (runtime look-up не меняется),
 * не разрушая autocomplete для известных вариантов.
 */
export declare type IconType = HeroIconName | IconifyIconName | (string & {})

/**
 * Props for the Icons component.
 */
export declare type IconsProps = {
  /**
   * The type of the icon to render.
   *
   * Heroicons — kebab-case имя из <https://heroicons.com>, например `"check"`, `"x-mark"`.
   * Iconify — `collection:name`, например `"mdi:home"`, `"ph:user"` (см. <https://icon-sets.iconify.design>).
   *
   * Любая другая строка пройдёт компиляцию через `(string & {})`-fallback, но в runtime
   * иконка не отрисуется, если она отсутствует в обоих источниках.
   * @type {IconType}
   */
  type: IconType

  /**
   * Style variant for Heroicons.
   * Iconify имеет собственный механизм через suffix в `type`, на него этот prop не влияет.
   * @type {"outline" | "solid"}
   */
  variant?: "outline" | "solid"

  /**
   * Accessible label for semantic (meaningful) icons.
   *
   * Если задан непустой `label` — wrapper `<i data-icon>` получает `role="img"` + `aria-label="<label>"`.
   * SVG внутри сохраняет `aria-hidden="true"` (либо встроенный в heroicons, либо передаваемый
   * в Iconify) — screen reader озвучивает только wrapper как labelled image.
   *
   * Если опущен (или пустая строка) — wrapper остаётся прозрачным (нет role/aria-label),
   * SVG же сохраняет `aria-hidden="true"` — иконка трактуется как декоративная.
   *
   * Задавай `label` только когда иконка несёт самостоятельный смысл и не дублирует видимый
   * рядом текст (например, icon-button без visible label).
   * @type {string | undefined}
   */
  label?: string

  /**
   * @deprecated Use `variant` instead. `stileIcon` сохранён как обратно совместимый alias
   * и будет удалён в 1.0. При использовании без `variant` компонент выведет dev-warning в консоль.
   * @type {"outline" | "solid"}
   */
  stileIcon?: "outline" | "solid"

  /**
   * Custom CSS class for the icon.
   * @type {"h-5 w-5 text-surface-900 dark:text-surface-100" | StyleClass | undefined}
   */
  class?: "h-5 w-5 text-surface-900 dark:text-surface-100" | StyleClass

  /**
   * Custom inline styles for the icon.
   * @type {CSSProperties | undefined}
   */
  style?: CSSProperties
}
export declare type IconsSlots = null
export declare type IconsEmits = null
/**
 * Methods and states exposed via `ref` for the Icons component.
 */
export declare type IconsExpose = {
  // ---PROPS-------------------------
  /**
   * The current type of the icon.
   * @type {IconsProps["type"]}
   */
  type: IconsProps["type"]

  /**
   * The resolved style variant (`outline` или `solid`), уже с учётом `stileIcon`-fallback и options.
   * @type {NonNullable<IconsProps["variant"]>}
   */
  variant: NonNullable<IconsProps["variant"]>

  /**
   * Accessible label или `undefined`, если иконка декоративная.
   * @type {IconsProps["label"]}
   */
  label: IconsProps["label"]

  /**
   * The current CSS class applied to the icon.
   * @type {IconsProps["class"]}
   */
  classIcon: IconsProps["class"]

  /**
   * The current inline styles applied to the icon.
   * @type {IconsProps["style"]}
   */
  style: IconsProps["style"]
}
export declare type IconsOption = Pick<IconsProps, "class" | "variant">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Icons: GlobalComponentConstructor<Icons>
  }
}

export default Icons
