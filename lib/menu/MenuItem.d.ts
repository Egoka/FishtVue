import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { ItemMenuPrivate } from "./Menu"

/**
 * ## MenuItem
 *
 * MenuItem — renderless descriptor component for the compound `<Menu>` API.
 *
 * Не рендерит собственный DOM: родительский [Menu](./Menu.d.ts) читает его `props`/`slots`
 * через VNode-walk и сам рендерит пункт меню. Используется только для декларативной записи:
 *
 * ```vue
 * <Menu>
 *   <MenuItem icon="home" @click="goHome">Home</MenuItem>
 * </Menu>
 * ```
 *
 * Submenu задаётся вложением: `<MenuItem><MenuItem /></MenuItem>`.
 */
declare class MenuItem extends ClassComponent<MenuItemProps, MenuItemSlots, MenuItemEmits, MenuItemExpose> {}

/**
 * Props for the MenuItem descriptor component.
 */
export declare type MenuItemProps = {
  /**
   * The title of the menu item. Если не задан — берётся из текстового содержимого default slot.
   * @type {string | undefined}
   */
  title?: string

  /**
   * The icon displayed alongside the menu item.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Additional information or description rendered on the right side of the item.
   * Рендерится как текст; для HTML используйте `#item-info` scoped slot на `<Menu>`.
   * @type {string | undefined}
   */
  info?: string

  /**
   * Disables the menu item if set to `true`.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Custom CSS class for the menu item.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

/**
 * Slots of the MenuItem descriptor component.
 */
export declare type MenuItemSlots = {
  /**
   * Default slot. Вложенные `<MenuItem>` / `<MenuGroup>` становятся submenu; текстовое
   * содержимое — fallback для `title`.
   */
  default(): VNode[]
}

/**
 * Events of the MenuItem descriptor component. Обработчики читаются `<Menu>` через VNode-walk
 * и вызываются при соответствующем взаимодействии с пунктом.
 */
export declare type MenuItemEmits = {
  /**
   * Emitted when the menu item is clicked.
   * @param event
   * @param {MouseEvent | TouchEvent} nativeEvent - The triggering event.
   * @param {ItemMenuPrivate} item - The resolved menu item.
   */
  (event: "click", nativeEvent: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when the menu item becomes active (hover/touch in).
   * @param event
   * @param {MouseEvent | TouchEvent} nativeEvent - The triggering event.
   * @param {ItemMenuPrivate} item - The resolved menu item.
   */
  (event: "active", nativeEvent: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when the menu item becomes inactive (hover/touch out).
   * @param event
   * @param {MouseEvent | TouchEvent} nativeEvent - The triggering event.
   * @param {ItemMenuPrivate} item - The resolved menu item.
   */
  (event: "inactive", nativeEvent: MouseEvent | TouchEvent, item: ItemMenuPrivate): void
}

/**
 * MenuItem is a renderless descriptor — никаких публичных методов/состояния не экспонирует.
 */
export declare type MenuItemExpose = NonNullable<unknown>

export declare type MenuItemOption = Pick<MenuItemProps, "icon" | "disabled" | "class">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    MenuItem: GlobalComponentConstructor<MenuItem>
  }
}

export default MenuItem
