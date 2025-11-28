import { MaybeRef, VNode } from "vue"
import { _key, ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode, THeight, TWidth } from "../types"
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
 * Represents a menu item with customizable properties and event handlers.
 * Provides options for styling, nested menus, and event-based interactions.
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
   * @param {MouseEvent | TouchEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onActive?(event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Event triggered when the menu item becomes inactive (e.g., unhovered).
   * @param {MouseEvent | TouchEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onInactive?(event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Event triggered when the menu item is clicked.
   * @param {MouseEvent | TouchEvent} event - The event object.
   * @param {ItemMenuPrivate} item - The menu item instance.
   */
  onClick?(event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

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

  /**
   * Additional custom properties that can be added to the menu item.
   * @type {unknown}
   */
  [key: string]: any
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
 * Defines a fixWindow for the Menu component, with optional icon and visibility settings.
 */
export type MenuFixWindow = Pick<
  FixWindowProps,
  "eventOpen" | "eventClose" | "mode" | "delay" | "class" | "classBody" | "marginPx" | "translatePx" | "paddingWindow"
>

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
   * @type {MenuFixWindow | undefined}
   */
  paramsWindowMenu?: MenuFixWindow

  /**
   * Nested groups associated with the menu item.
   * @type {Array<GroupMenu> | undefined}
   */
  groups?: Array<GroupMenu>
}

export interface MenuItemPrivate extends Omit<MenuItem, "groups"> {
  groups?: Array<GroupMenuPrivate>
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
   * Controls whether the first letter of the menu item's title is displayed when no icon is provided.
   * If set to `true`, the first letter of the title will be shown with a styled appearance.
   * If set to `false`, no placeholder will be displayed for items without icons.
   * @type {boolean | undefined}
   */
  useFirstLetter?: boolean
  /**
   * Displays only icons for the menu items.
   * @type {boolean | undefined}
   */
  onlyIcons?: boolean

  /**
   * Custom styles for the menu and its components.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<MenuStyles> | undefined}
   */
  styles?: MaybeRef<MenuStyles>

  /**
   * Custom CSS class for the menu container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
} & Omit<MenuItem, "groups"> & {
    /**
     * Nested groups associated with the menu item.
     * Can be passed as a constant value or as a ref.
     * @type {MaybeRef<Array<GroupMenu>> | undefined}
     */
    groups?: MaybeRef<Array<GroupMenu>>
  }

export declare type MenuSlots = {
  title(args: { title: string }): VNode[]
  item(args: {
    data: Omit<ItemMenu, "menu" | "class" | "disabled" | "onClick" | "onActive" | "onInactive"> & {
      isActive: boolean
      isSelected: boolean
    }
  }): VNode[]
  footer(): VNode[]
}

/**
 * Events emitted by the Menu component.
 */
export declare type MenuEmits = {
  /**
   * Emitted when a menu item becomes active.
   * @param e
   * @param {MouseEvent | TouchEvent} event - The event that triggered the activation.
   * @param {ItemMenuPrivate} item - The activated menu item.
   */
  (e: "onActive", event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when a menu item becomes inactive.
   * @param e
   * @param {MouseEvent | TouchEvent} event - The event that triggered the deactivation.
   * @param {ItemMenuPrivate} item - The deactivated menu item.
   */
  (e: "onInactive", event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void

  /**
   * Emitted when a menu item is clicked.
   * @param e
   * @param {MouseEvent | TouchEvent} event - The event that triggered the click.
   * @param {ItemMenuPrivate} item - The clicked menu item.
   */
  (e: "onClick", event: MouseEvent | TouchEvent, item: ItemMenuPrivate): void
}

/**
 * Methods and states exposed via `ref` for the Menu component.
 */
export declare type MenuExpose = {
  // ---STATE-------------------------
  /**
   * The key of the currently selected menu item.
   * @type {_key | undefined}
   */
  selectedItemIndex: _key | undefined

  /**
   * The key of the currently active menu item.
   * @type {Ref<_key | undefined>}
   */
  activeItemIndex: _key | undefined

  // ---PROPS-------------------------
  /**
   * Current styling mode of the menu.
   * @type {MenuProps["mode"]}
   */
  mode: MenuProps["mode"]

  /**
   * Indicates whether an item is selected.
   * @type {MenuProps["selected"]}
   */
  selected: MenuProps["selected"]

  /**
   * Indicates whether the menu is in horizontal layout.
   * @type {MenuProps["horizontal"]}
   */
  horizontal: MenuProps["horizontal"]

  /**
   * Determines whether the first letter of a menu item's title is displayed in the absence of an icon.
   * When enabled, the first letter will be styled and shown as a placeholder.
   * @type {MenuProps["useFirstLetter"]}
   */
  useFirstLetter: MenuProps["useFirstLetter"]

  /**
   * Indicates whether the menu displays only icons.
   * @type {MenuProps["onlyIcons"]}
   */
  onlyIcons: MenuProps["onlyIcons"]

  /**
   * The title of the menu.
   * @type {MenuProps["title"]}
   */
  title: MenuProps["title"]

  /**
   * Icon for the separator.
   * @type {MenuSeparator["icon"]}
   */
  iconSeparator: MenuSeparator["icon"]

  /**
   * Indicates whether the separator is visible.
   * @type {MenuSeparator["isVisible"]}
   */
  isSeparator: MenuSeparator["isVisible"]

  /**
   * List of groups within the menu.
   * @type {Array<GroupMenuPrivate>}
   */
  listGroups: Array<GroupMenuPrivate>

  /**
   * Parameters for the menu window behavior.
   * @type {MenuProps["paramsWindowMenu"]}
   */
  paramsWindowMenu: MenuProps["paramsWindowMenu"]

  /**
   * Base settings for the separator.
   * @type {MenuSeparator}
   */
  baseSeparator: MenuSeparator

  /**
   * Custom styles for the menu.
   * @type {MenuStylesPrivate}
   */
  styles: MenuStylesPrivate

  /**
   * Mode-specific styles for the menu.
   * @type {StyleClass}
   */
  modeStyle: StyleClass

  /**
   * Custom CSS class for the menu container.
   * @type {StyleClass}
   */
  classMenu: StyleClass

  /**
   * Custom CSS class for the separator.
   * @type {StyleClass}
   */
  classSeparator: StyleClass

  /**
   * Custom CSS class for the separator icon.
   * @type {StyleClass}
   */
  classSeparatorIcon: StyleClass

  /**
   * Custom CSS class for group titles.
   * @type {StyleClass}
   */
  classGroupTitle: StyleClass

  /**
   * Custom CSS class for menu titles.
   * @type {StyleClass}
   */
  classTitle: StyleClass

  /**
   * Custom CSS class for item icons.
   * @type {StyleClass}
   */
  classItemIcon: StyleClass

  /**
   * Custom CSS class for item titles in icon-only mode.
   * @type {StyleClass}
   */
  classItemTitleOnlyIcons: StyleClass

  /**
   * Custom CSS class for item info in icon-only mode.
   * @type {StyleClass}
   */
  classItemInfoOnlyIcons: StyleClass

  /**
   * Custom CSS class for item titles in fixed window mode.
   * @type {StyleClass}
   */
  classItemTitleFixWindow: StyleClass

  /**
   * Custom CSS class for item info in fixed window mode.
   * @type {StyleClass}
   */
  classItemInfoFixWindow: StyleClass

  /**
   * Custom CSS class for right-aligned item icons.
   * @type {StyleClass}
   */
  classItemRightIcon: StyleClass

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
  | "mode"
  | "selected"
  | "horizontal"
  | "useFirstLetter"
  | "onlyIcons"
  | "styles"
  | "class"
  | "title"
  | "separator"
  | "paramsWindowMenu"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Menu: GlobalComponentConstructor<Menu>
  }
}

export default Menu
