import { Ref, VNode } from "vue"
import {
  ClassComponent,
  GlobalComponentConstructor,
  StyleMode,
  StyleClass,
  _key,
  TWidth,
  THeight,
  ReadRef
} from "../types"
import { FixWindowProps } from "fishtvue/fixwindow"
import { SeparatorProps } from "fishtvue/separator"

/**
 * ## Menu
 *
 * Menu - a component for creating structured, customizable menus with nested groups and item actions.
 *
 * Supports various styles, separators, icons, and interaction events.
 */
declare class Menu extends ClassComponent<MenuProps, MenuSlots, MenuEmits, MenuExpose> {}

// ---------------------------------------

/**
 * Represents a single menu item with optional actions and nested menus.
 *
 * Each item can have a title, icon, info, actions, and nested menus.
 */
export interface ItemMenu {
  /**
   * The title of the menu item.
   * @type {string | undefined}
   */
  title?: string

  /**
   * The icon displayed alongside the menu item.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Additional information or description for the menu item.
   * @type {string | undefined}
   */
  info?: string

  /**
   * Disables the menu item if set to `true`.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Event triggered when the menu item becomes active (e.g., hovered).
   * @param {MouseEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onActive?(event: MouseEvent, item: ItemMenuPrivate): void

  /**
   * Event triggered when the menu item becomes inactive (e.g., unhovered).
   * @param {MouseEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onInactive?(event: MouseEvent, item: ItemMenuPrivate): void

  /**
   * Event triggered when the menu item is clicked.
   * @param {PointerEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onClick?(event: PointerEvent, item: ItemMenuPrivate): void

  /**
   * Custom CSS class for the menu item.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Nested menu associated with the menu item.
   * @type {MenuItem | null | undefined}
   */
  menu?: MenuItem | null
}

export interface ItemMenuPrivate extends ItemMenu {
  _key: _key
}

/**
 * Represents a group of menu items within the Menu component.
 *
 * A group can include a title, a list of items, styling, and an optional separator.
 */
export type GroupMenu = {
  /**
   * The title of the group.
   * @type {string | undefined}
   */
  title?: string

  /**
   * The list of items within the group.
   * @type {Array<ItemMenu> | undefined}
   */
  items?: Array<ItemMenu>

  /**
   * Custom CSS class for the group container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * The separator displayed for the group.
   * @type {MenuSeparator | undefined}
   */
  separator?: MenuSeparator
}

export interface GroupMenuPrivate extends Omit<GroupMenu, "items"> {
  items?: Array<ItemMenuPrivate>
}

/**
 * Represents a collection of menu groups.
 *
 * Each group can contain multiple items and additional configurations.
 */
export type Groups = Array<GroupMenu> | []
export type GroupsPrivate = Array<GroupMenuPrivate> | []

// ---------------------------------------
/**
 * Defines a separator for the Menu component, with optional icon and visibility settings.
 */
export interface MenuSeparator extends Omit<SeparatorProps, "vertical"> {
  /**
   * The icon displayed within the separator.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Indicates whether the separator is visible.
   * @type {boolean | undefined}
   */
  isVisible?: boolean
}

/**
 * Represents a single item in the Menu component.
 */
export type MenuItem = {
  /**
   * The title of the menu item.
   * @type {string | undefined}
   */
  title?: string

  /**
   * Separator configuration for the menu item.
   * @type {MenuSeparator | undefined}
   */
  separator?: MenuSeparator

  /**
   * Configuration options for the fixed window menu.
   * @type {FixWindowProps | undefined}
   */
  paramsWindowMenu?: FixWindowProps

  /**
   * Nested groups associated with the menu item.
   * @type {Groups | undefined}
   */
  groups?: Groups
}

export interface MenuItemPrivate extends Omit<MenuItem, "groups"> {
  groups?: GroupsPrivate
}

// ---------------------------------------
/**
 * Defines the styles and customization options for the Menu component.
 */
export type MenuStyles = {
  /**
   * Custom CSS classes for various parts of the menu.
   */
  class?: {
    /**
     * CSS class for the menu body container.
     * @type {StyleClass | undefined}
     */
    body?: StyleClass

    /**
     * CSS class for the menu title.
     * @type {StyleClass | undefined}
     */
    title?: StyleClass

    /**
     * CSS class for the menu separator.
     * @type {StyleClass | undefined}
     */
    separator?: StyleClass

    /**
     * CSS class for the separator icon.
     * @type {StyleClass | undefined}
     */
    separatorIcon?: StyleClass

    /**
     * CSS class for menu groups.
     * @type {StyleClass | undefined}
     */
    group?: StyleClass

    /**
     * CSS class for group titles.
     * @type {StyleClass | undefined}
     */
    groupTitle?: StyleClass

    /**
     * CSS class for menu items.
     * @type {StyleClass | undefined}
     */
    item?: StyleClass

    /**
     * CSS class for item icons.
     * @type {StyleClass | undefined}
     */
    itemIcon?: StyleClass

    /**
     * CSS class for item titles.
     * @type {StyleClass | undefined}
     */
    itemTitle?: StyleClass

    /**
     * CSS class for item information text.
     * @type {StyleClass | undefined}
     */
    itemInfo?: StyleClass

    /**
     * CSS class for right-aligned item icons.
     * @type {StyleClass | undefined}
     */
    itemRightIcon?: StyleClass
  }

  /**
   * The width of the menu.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * The height of the menu.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * The animation style for menu transitions.
   * @type {StyleClass | "transition-all duration-500" | "transition-none" | undefined}
   */
  animation?: StyleClass | "transition-all duration-500" | "transition-none"

  /**
   * Styles or behavior for active menu rows.
   * @type {StyleClass | boolean | "bg-neutral-200/50 dark:bg-neutral-700/50" | undefined}
   */
  activeRows?: StyleClass | boolean | "bg-neutral-200/50 dark:bg-neutral-700/50"

  /**
   * Styles or behavior for selected menu rows.
   * @type {StyleClass | boolean | "bg-neutral-300 dark:bg-neutral-700" | undefined}
   */
  selectedRows?: StyleClass | boolean | "bg-neutral-300 dark:bg-neutral-700"
}

export type MenuStylesPrivate = Omit<MenuStyles, "activeRows" | "selectedRows"> & {
  activeRows?: StyleClass
  selectedRows?: StyleClass
}
// ---------------------------------------

/**
 * Props for the Menu component.
 */
export declare type MenuProps = {
  /**
   * The styling mode for the menu.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * Indicates whether an item is selected.
   * @type {boolean | undefined}
   */
  selected?: boolean

  /**
   * Renders the menu items in a horizontal layout.
   * @type {boolean | undefined}
   */
  horizontal?: boolean

  /**
   * Displays only icons for the menu items.
   * @type {boolean | undefined}
   */
  onlyIcons?: boolean

  /**
   * Custom styles for the menu and its components.
   * @type {MenuStyles | undefined}
   */
  styles?: MenuStyles

  /**
   * Custom CSS class for the menu container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
} & MenuItem

export declare type MenuSlots = {
  title(): VNode[]
  item(): VNode[]
  footer(): VNode[]
}

/**
 * Events emitted by the Menu component.
 */
export declare type MenuEmits = {
  /**
   * Emitted when a menu item becomes active.
   * @param e
   * @param {MouseEvent} event - The mouse event that triggered the activation.
   * @param {ItemMenuPrivate} item - The activated menu item.
   */
  (e: "onActive", event: MouseEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when a menu item becomes inactive.
   * @param e
   * @param {MouseEvent} event - The mouse event that triggered the deactivation.
   * @param {ItemMenuPrivate} item - The deactivated menu item.
   */
  (e: "onInactive", event: MouseEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when a menu item is clicked.
   * @param e
   * @param {PointerEvent} event - The pointer event that triggered the click.
   * @param {ItemMenuPrivate} item - The clicked menu item.
   */
  (e: "onClick", event: PointerEvent, item: ItemMenuPrivate): void
}

/**
 * Methods and states exposed via `ref` for the Menu component.
 */
export declare type MenuExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the menu container element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  menuRefLink: ReadRef<HTMLElement | undefined>

  /**
   * The key of the currently selected menu item.
   * @type {Ref<_key | undefined>}
   */
  selectedItemIndex: Ref<_key | undefined>

  /**
   * The key of the currently active menu item.
   * @type {Ref<_key | undefined>}
   */
  activeItemIndex: Ref<_key | undefined>

  // ---PROPS-------------------------
  /**
   * Current styling mode of the menu.
   * @type {ReadRef<NonNullable<MenuProps["mode"]>>}
   */
  mode: ReadRef<NonNullable<MenuProps["mode"]>>

  /**
   * Indicates whether an item is selected.
   * @type {ReadRef<NonNullable<MenuProps["selected"]>>}
   */
  selected: ReadRef<NonNullable<MenuProps["selected"]>>

  /**
   * Indicates whether the menu is in horizontal layout.
   * @type {ReadRef<NonNullable<MenuProps["horizontal"]>>}
   */
  horizontal: ReadRef<NonNullable<MenuProps["horizontal"]>>

  /**
   * Indicates whether the menu displays only icons.
   * @type {ReadRef<NonNullable<MenuProps["onlyIcons"]>>}
   */
  onlyIcons: ReadRef<NonNullable<MenuProps["onlyIcons"]>>

  /**
   * The title of the menu.
   * @type {ReadRef<NonNullable<MenuProps["title"]>>}
   */
  title: ReadRef<NonNullable<MenuProps["title"]>>

  /**
   * Icon for the separator.
   * @type {ReadRef<MenuSeparator["icon"]>}
   */
  iconSeparator: ReadRef<MenuSeparator["icon"]>

  /**
   * Indicates whether the separator is visible.
   * @type {ReadRef<NonNullable<MenuSeparator["isVisible"]>>}
   */
  isSeparator: ReadRef<NonNullable<MenuSeparator["isVisible"]>>

  /**
   * List of groups within the menu.
   * @type {ReadRef<GroupsPrivate>}
   */
  listGroups: ReadRef<GroupsPrivate>

  /**
   * Parameters for the menu window behavior.
   * @type {ReadRef<MenuProps["paramsWindowMenu"]>}
   */
  paramsWindowMenu: ReadRef<MenuProps["paramsWindowMenu"]>

  /**
   * Base settings for the separator.
   * @type {ReadRef<MenuSeparator>}
   */
  baseSeparator: ReadRef<MenuSeparator>

  /**
   * Custom styles for the menu.
   * @type {ReadRef<MenuStylesPrivate>}
   */
  styles: ReadRef<MenuStylesPrivate>

  /**
   * Mode-specific styles for the menu.
   * @type {ReadRef<StyleClass>}
   */
  modeStyle: ReadRef<StyleClass>

  /**
   * Custom CSS class for the menu container.
   * @type {ReadRef<StyleClass>}
   */
  classMenu: ReadRef<StyleClass>

  /**
   * Custom CSS class for the separator.
   * @type {ReadRef<StyleClass>}
   */
  classSeparator: ReadRef<StyleClass>

  /**
   * Custom CSS class for the separator icon.
   * @type {ReadRef<StyleClass>}
   */
  classSeparatorIcon: ReadRef<StyleClass>

  /**
   * Custom CSS class for menu groups.
   * @type {ReadRef<StyleClass>}
   */
  classGroup: ReadRef<StyleClass>

  /**
   * Custom CSS class for group titles.
   * @type {ReadRef<StyleClass>}
   */
  classGroupTitle: ReadRef<StyleClass>

  /**
   * Custom CSS class for menu titles.
   * @type {ReadRef<StyleClass>}
   */
  classTitle: ReadRef<StyleClass>

  /**
   * Custom CSS class for item icons.
   * @type {ReadRef<StyleClass>}
   */
  classItemIcon: ReadRef<StyleClass>

  /**
   * Custom CSS class for item titles in icon-only mode.
   * @type {ReadRef<StyleClass>}
   */
  classItemTitleOnlyIcons: ReadRef<StyleClass>

  /**
   * Custom CSS class for item info in icon-only mode.
   * @type {ReadRef<StyleClass>}
   */
  classItemInfoOnlyIcons: ReadRef<StyleClass>

  /**
   * Custom CSS class for item titles in fixed window mode.
   * @type {ReadRef<StyleClass>}
   */
  classItemTitleFixWindow: ReadRef<StyleClass>

  /**
   * Custom CSS class for item info in fixed window mode.
   * @type {ReadRef<StyleClass>}
   */
  classItemInfoFixWindow: ReadRef<StyleClass>

  /**
   * Custom CSS class for right-aligned item icons.
   * @type {ReadRef<StyleClass>}
   */
  classItemRightIcon: ReadRef<StyleClass>

  // ---METHODS-----------------------
  /**
   * Sets the selected menu item.
   * @param {_key | undefined} itemKey - The key of the selected item.
   */
  setSelectedItem(itemKey: _key | undefined): void

  /**
   * Sets the active menu item.
   * @param {_key | undefined} itemKey - The key of the active item.
   */
  setActiveItem(itemKey: _key | undefined): void

  /**
   * Populates the menu items.
   * @param {MenuItemPrivate} menu - The menu configuration.
   * @param {number} depth - The depth of the menu.
   * @returns {NonNullable<MenuItemPrivate>} - The updated menu items.
   */
  setItems(menu: MenuItemPrivate, depth: number): NonNullable<MenuItemPrivate>
}
export declare type MenuOption = Pick<
  MenuProps,
  "mode" | "selected" | "horizontal" | "onlyIcons" | "styles" | "class" | "title" | "separator" | "paramsWindowMenu"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Menu: GlobalComponentConstructor<Menu>
  }
}

export default Menu
