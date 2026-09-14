import { MaybeRef, Ref, VNode } from "vue"
import {
  ItemKey,
  ClassComponent,
  ClassesMap,
  GlobalComponentConstructor,
  StyleClass,
  StyleMode,
  THeight,
  TWidth
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
 * Represents a menu item with customizable properties and event handlers.
 * Provides options for styling, nested menus, and event-based interactions.
 */
export interface MenuItemData {
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
   * @param {MenuItemDataPrivate} item - The menu item instance.
   */
  onActive?(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void

  /**
   * Event triggered when the menu item becomes inactive (e.g., unhovered).
   * @param {MouseEvent | TouchEvent} event - The event object.
   * @param {MenuItemDataPrivate} item - The menu item instance.
   */
  onInactive?(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void

  /**
   * Event triggered when the menu item is clicked.
   * @param {MouseEvent | TouchEvent} event - The event object.
   * @param {MenuItemDataPrivate} item - The menu item instance.
   */
  onClick?(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void

  /**
   * Custom CSS class for the menu item.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Nested menu associated with the menu item.
   * @type {MenuData | null | undefined}
   */
  menu?: MenuData | null

  /**
   * Additional custom properties that can be added to the menu item.
   * @type {unknown}
   */
  [key: string]: any
}

export interface MenuItemDataPrivate extends MenuItemData {
  _key: ItemKey
}

/**
 * Represents a group of menu items within the Menu component.
 *
 * A group can include a title, a list of items, styling, and an optional separator.
 */
export type MenuGroupData = {
  /**
   * The title of the group.
   * @type {string | undefined}
   */
  title?: string

  /**
   * The list of items within the group.
   * @type {Array<MenuItemData> | undefined}
   */
  items?: Array<MenuItemData>

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

export interface MenuGroupDataPrivate extends Omit<MenuGroupData, "items"> {
  items?: Array<MenuItemDataPrivate>
}

// ---------------------------------------
/**
 * Defines a separator for the Menu component, with optional icon and visibility settings.
 */
export interface MenuSeparator extends Omit<SeparatorProps, "orientation"> {
  /**
   * The icon displayed within the separator.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Показывать разделитель. Bare-positive имя снятого `isVisible` (dev-patterns §2 F).
   * @type {boolean | undefined}
   */
  visible?: boolean
}

/**
 * Defines a fixWindow for the Menu component, with optional icon and visibility settings.
 */
export type MenuFixWindowProps = Pick<
  FixWindowProps,
  "eventOpen" | "eventClose" | "mode" | "openDelay" | "class" | "classes" | "marginPx" | "translatePx" | "paddingWindow"
>

/**
 * Represents a single item in the Menu component.
 */
export type MenuData = {
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
   * Props подменю-окна `<FixWindow>`. Бывший `paramsWindowMenu` (dev-patterns §2 G).
   * @type {MenuFixWindowProps | undefined}
   */
  fixWindowProps?: MenuFixWindowProps

  /**
   * Nested groups associated with the menu item.
   * @type {Array<MenuGroupData> | undefined}
   */
  groups?: Array<MenuGroupData>
}

export interface MenuDataPrivate extends Omit<MenuData, "groups"> {
  groups?: Array<MenuGroupDataPrivate>
}

// ---------------------------------------
/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-menu>` (добавляется `ClassesMap`);
 * наследуется подменю, в отличие от prop `class`, который остаётся на верхнем меню.
 *
 * **element** (аддитивные, конфликт решает twMerge):
 * - `title` — заголовок меню `[data-menu-title]` (бывший `styles.class.title`).
 * - `separator` — корень `<Separator>` между группами (бывший `styles.class.separator`).
 * - `separatorIcon` — иконка внутри разделителя (бывший `styles.class.separatorIcon`).
 * - `group` — контейнер группы `[data-menu-group]` (бывший `styles.class.group`).
 * - `groupTitle` — заголовок группы `[data-menu-group-title]` (бывший `styles.class.groupTitle`).
 * - `item` — пункт `[data-menu-item]` (бывший `styles.class.item`).
 * - `itemIcon` — иконка пункта `[data-menu-item-icon]` (бывший `styles.class.itemIcon`).
 * - `itemTitle` — заголовок пункта `[data-menu-item-title]` (бывший `styles.class.itemTitle`).
 * - `itemInfo` — подпись справа `[data-menu-item-info]` (бывший `styles.class.itemInfo`).
 * - `itemEndIcon` — стрелка подменю `[data-menu-item-end-icon]` (бывший `styles.class.itemRightIcon`).
 *
 * **aspect** (заменяющие: `props ?? options ?? default`, `""` отключает):
 * - `animation` — transition корня и пункта (бывший `styles.animation`).
 * - `itemActive` — подсветка пункта под курсором (бывший `styles.activeRows`).
 * - `itemSelected` — подсветка выбранного пункта (бывший `styles.selectedRows`).
 */
export declare type MenuClassKey =
  | "title"
  | "separator"
  | "separatorIcon"
  | "group"
  | "groupTitle"
  | "item"
  | "itemIcon"
  | "itemTitle"
  | "itemInfo"
  | "itemEndIcon"
  | "animation"
  | "itemActive"
  | "itemSelected"

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
   * Ориентация раскладки пунктов. Единое имя с [Separator](./separator.md) и [Split](./split.md).
   * Бывший булев `horizontal` (`true` ≡ `"horizontal"`).
   * @type {"horizontal" | "vertical" | undefined}
   */
  orientation?: "horizontal" | "vertical"

  /**
   * Показывать первую букву `title` вместо иконки, если у пункта нет `icon`.
   * Bare-positive имя снятого `useFirstLetter` (dev-patterns §2 F).
   * @type {boolean | undefined}
   */
  firstLetter?: boolean
  /**
   * Displays only icons for the menu items.
   * @type {boolean | undefined}
   */
  onlyIcons?: boolean

  /**
   * Ширина меню. Число трактуется как `px`. Бывший `styles.width`.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * Высота меню. Число трактуется как `px`. Бывший `styles.height`.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * CSS-классы корня `<div data-menu>` (dev-patterns §2 A). На подменю не наследуется —
   * для этого есть `classes.root`.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов; `root` ≡ `class`, но наследуется подменю.
   * См. `MenuClassKey`.
   * @type {ClassesMap<MenuClassKey> | undefined}
   */
  classes?: ClassesMap<MenuClassKey>
} & Omit<MenuData, "groups"> & {
    /**
     * Nested groups associated with the menu item.
     * Can be passed as a constant value or as a ref.
     * @type {MaybeRef<Array<MenuGroupData>> | undefined}
     */
    groups?: MaybeRef<Array<MenuGroupData>>
  }

export declare type MenuSlots = {
  title(args: { title: string }): VNode[]
  item(args: {
    data: Omit<MenuItemData, "menu" | "class" | "disabled" | "onClick" | "onActive" | "onInactive"> & {
      isActive: boolean
      isSelected: boolean
    }
  }): VNode[]
  /**
   * Кастомный рендеринг `item.info`. По умолчанию `info` рендерится как text (без `v-html`).
   * Используйте этот scoped slot, если нужен собственный (в т.ч. HTML) рендеринг — ответственность
   * за безопасность контента на потребителе.
   */
  "item-info"(args: {
    item: Omit<MenuItemData, "menu" | "class" | "disabled" | "onClick" | "onActive" | "onInactive">
    info: string | undefined
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
   * @param {MenuItemDataPrivate} item - The activated menu item.
   */
  (e: "item-active", event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void

  /**
   * Emitted when a menu item becomes inactive.
   * @param e
   * @param {MouseEvent | TouchEvent} event - The event that triggered the deactivation.
   * @param {MenuItemDataPrivate} item - The deactivated menu item.
   */
  (e: "item-inactive", event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void

  /**
   * Emitted when a menu item is clicked.
   * @param e
   * @param {MouseEvent | TouchEvent} event - The event that triggered the click.
   * @param {MenuItemDataPrivate} item - The clicked menu item.
   */
  (e: "item-click", event: MouseEvent | TouchEvent, item: MenuItemDataPrivate): void
}

/**
 * Methods and states exposed via `ref` for the Menu component.
 */
export declare type MenuExpose = {
  // ---STATE-------------------------
  /**
   * The key of the currently selected menu item.
   * @type {ItemKey | undefined}
   */
  selectedItemIndex: ItemKey | undefined

  /**
   * The key of the currently active menu item.
   * @type {Ref<ItemKey | undefined>}
   */
  activeItemIndex: ItemKey | undefined

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
   * Ориентация раскладки пунктов.
   * @type {MenuProps["orientation"]}
   */
  orientation: MenuProps["orientation"]

  /**
   * Determines whether the first letter of a menu item's title is displayed in the absence of an icon.
   * When enabled, the first letter will be styled and shown as a placeholder.
   * @type {MenuProps["firstLetter"]}
   */
  firstLetter: MenuProps["firstLetter"]

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
   * @type {MenuSeparator["visible"]}
   */
  isSeparator: MenuSeparator["visible"]

  /**
   * List of groups within the menu.
   * @type {Array<MenuGroupDataPrivate>}
   */
  listGroups: Array<MenuGroupDataPrivate>

  /**
   * Props подменю-окна `<FixWindow>`.
   * @type {MenuProps["fixWindowProps"]}
   */
  fixWindowProps: MenuProps["fixWindowProps"]

  /**
   * Base settings for the separator.
   * @type {MenuSeparator}
   */
  baseSeparator: MenuSeparator

  /**
   * Mode-specific styles for the menu.
   * @type {StyleClass}
   */
  modeStyle: StyleClass

  /**
   * Классы корня `[data-menu]`. Бывший `classMenu`.
   * @type {StyleClass}
   */
  classBase: StyleClass

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
   * Классы стрелки подменю. Бывший `classItemRightIcon`.
   * @type {StyleClass}
   */
  classItemEndIcon: StyleClass

  // ---ELEMENTS----------------------
  /**
   * Ref на корневой DOM-элемент меню (`[data-menu]`). `null`, пока групп нет
   * (root скрыт через `v-if="listGroups.length"`). Полезно для скролла, измерений
   * и интеграций со стороны потребителя.
   * @type {Ref<HTMLElement | null>}
   */
  rootRef: Ref<HTMLElement | null>

  // ---METHODS-----------------------
  /**
   * Sets the selected menu item.
   * @param {ItemKey | undefined} itemKey - The key of the selected item.
   */
  setSelectedItem(itemKey: ItemKey | undefined): void

  /**
   * Sets the active menu item.
   * @param {ItemKey | undefined} itemKey - The key of the active item.
   */
  setActiveItem(itemKey: ItemKey | undefined): void

  /**
   * Populates the menu items.
   * @param {MenuDataPrivate} menu - The menu configuration.
   * @param {number} depth - The depth of the menu.
   * @returns {NonNullable<MenuDataPrivate>} - The updated menu items.
   */
  setItems(menu: MenuDataPrivate, depth: number): NonNullable<MenuDataPrivate>
}
export declare type MenuOption = Pick<
  MenuProps,
  | "mode"
  | "selected"
  | "orientation"
  | "firstLetter"
  | "onlyIcons"
  | "width"
  | "height"
  | "class"
  | "classes"
  | "title"
  | "separator"
  | "fixWindowProps"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Menu: GlobalComponentConstructor<Menu>
  }
}

export default Menu
// value-экспорты compound-детей (зеркало Table.d.ts / Select.d.ts / Form.d.ts).
// `fishtvue/menu` типизируется через этот файл (`package.json.types`), поэтому классы и
// props-типы детей обязаны реэкспортироваться отсюда — иначе `import { MenuItem } from
// "fishtvue/menu"` проходит рантайм (named-экспорт menu.mjs), но падает на typecheck,
// а `declare module "vue"` этих файлов не подхватывается при subpath-импорте.
export * from "./MenuItem"
export * from "./MenuGroup"
export { default as MenuItem } from "./MenuItem"
export { default as MenuGroup } from "./MenuGroup"
