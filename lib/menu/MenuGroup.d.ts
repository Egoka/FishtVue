import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { MenuSeparator } from "./Menu"

/**
 * ## MenuGroup
 *
 * MenuGroup — renderless descriptor component for the compound `<Menu>` API.
 *
 * Группирует вложенные `<MenuItem>` в одну группу с опциональным заголовком и separator'ом.
 * Не рендерит собственный DOM: родительский [Menu](./Menu.d.ts) читает `props`/`slots`
 * через VNode-walk.
 *
 * ```vue
 * <Menu>
 *   <MenuGroup title="Account">
 *     <MenuItem icon="user">Profile</MenuItem>
 *   </MenuGroup>
 * </Menu>
 * ```
 */
declare class MenuGroup extends ClassComponent<MenuGroupProps, MenuGroupSlots, MenuGroupEmits, MenuGroupExpose> {}

/**
 * Props for the MenuGroup descriptor component.
 */
export declare type MenuGroupProps = {
  /**
   * The title of the group.
   * @type {string | undefined}
   */
  title?: string

  /**
   * Custom CSS class for the group container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * The separator displayed before the group.
   * @type {MenuSeparator | undefined}
   */
  separator?: MenuSeparator
}

/**
 * Slots of the MenuGroup descriptor component.
 */
export declare type MenuGroupSlots = {
  /**
   * Default slot — вложенные `<MenuItem>` этой группы.
   */
  default(): VNode[]
}

/**
 * MenuGroup не эмитит событий.
 */
export declare type MenuGroupEmits = null

/**
 * MenuGroup is a renderless descriptor — никаких публичных методов/состояния не экспонирует.
 */
export declare type MenuGroupExpose = NonNullable<unknown>

export declare type MenuGroupOption = Pick<MenuGroupProps, "class">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    MenuGroup: GlobalComponentConstructor<MenuGroup>
  }
}

export default MenuGroup
