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

// ---------------------------------------
export interface ItemMenu {
  title?: string
  icon?: string
  info?: string
  disabled?: boolean

  onActive?(event: MouseEvent, item: ItemMenuPrivate): void

  onInactive?(event: MouseEvent, item: ItemMenuPrivate): void

  onClick?(event: PointerEvent, item: ItemMenuPrivate): void

  class?: StyleClass
  menu?: MenuItem | null
}

export interface ItemMenuPrivate extends ItemMenu {
  _key: _key
}

export type GroupMenu = {
  title?: string
  items?: Array<ItemMenu>
  class?: StyleClass
  separator?: MenuSeparator
}

export interface GroupMenuPrivate extends Omit<GroupMenu, "items"> {
  items?: Array<ItemMenuPrivate>
}

export type Groups = Array<GroupMenu> | []
export type GroupsPrivate = Array<GroupMenuPrivate> | []

// ---------------------------------------
export interface MenuSeparator extends Omit<SeparatorProps, "vertical"> {
  icon?: string
  isVisible?: boolean
}

export type MenuItem = {
  title?: string
  separator?: MenuSeparator
  paramsWindowMenu?: FixWindowProps
  groups?: Groups
}

export interface MenuItemPrivate extends Omit<MenuItem, "groups"> {
  groups?: GroupsPrivate
}

// ---------------------------------------
export type MenuStyles = {
  class?: {
    body?: StyleClass
    title?: StyleClass
    separator?: StyleClass
    separatorIcon?: StyleClass
    group?: StyleClass
    groupTitle?: StyleClass
    item?: StyleClass
    itemIcon?: StyleClass
    itemTitle?: StyleClass
    itemInfo?: StyleClass
    itemRightIcon?: StyleClass
  }
  width?: TWidth
  height?: THeight
  animation?: StyleClass | "transition-all duration-500" | "transition-none"
  activeRows?: StyleClass | boolean | "bg-neutral-200/50 dark:bg-neutral-700/50"
  selectedRows?: StyleClass | boolean | "bg-neutral-300 dark:bg-neutral-700"
}
export type MenuStylesPrivate = Omit<MenuStyles, "activeRows" | "selectedRows"> & {
  activeRows?: StyleClass
  selectedRows?: StyleClass
}
// ---------------------------------------
export declare type MenuProps = {
  mode?: StyleMode
  selected?: boolean
  horizontal?: boolean
  onlyIcons?: boolean
  styles?: MenuStyles
  class?: StyleClass
} & MenuItem
export declare type MenuSlots = {
  title(): VNode[]
  item(): VNode[]
  footer(): VNode[]
}
export declare type MenuEmits = {
  (e: "onActive", event: MouseEvent, item: ItemMenuPrivate): void
  (e: "onInactive", event: MouseEvent, item: ItemMenuPrivate): void
  (e: "onClick", event: PointerEvent, item: ItemMenuPrivate): void
}
export declare type MenuExpose = {
  // ---STATE-------------------------
  menuRefLink: ReadRef<HTMLElement | undefined>
  selectedItemIndex: Ref<_key | undefined>
  activeItemIndex: Ref<_key | undefined>
  // ---PROPS-------------------------
  mode: ReadRef<NonNullable<MenuProps["mode"]>>
  selected: ReadRef<NonNullable<MenuProps["selected"]>>
  horizontal: ReadRef<NonNullable<MenuProps["horizontal"]>>
  onlyIcons: ReadRef<NonNullable<MenuProps["onlyIcons"]>>
  title: ReadRef<NonNullable<MenuProps["title"]>>
  iconSeparator: ReadRef<MenuSeparator["icon"]>
  isSeparator: ReadRef<NonNullable<MenuSeparator["isVisible"]>>
  listGroups: ReadRef<GroupsPrivate>
  paramsWindowMenu: ReadRef<MenuProps["paramsWindowMenu"]>
  baseSeparator: ReadRef<MenuSeparator>
  styles: ReadRef<MenuStylesPrivate>
  modeStyle: ReadRef<StyleClass>
  classMenu: ReadRef<StyleClass>
  classSeparator: ReadRef<StyleClass>
  classSeparatorIcon: ReadRef<StyleClass>
  classGroup: ReadRef<StyleClass>
  classGroupTitle: ReadRef<StyleClass>
  classTitle: ReadRef<StyleClass>
  classItemIcon: ReadRef<StyleClass>
  classItemTitleOnlyIcons: ReadRef<StyleClass>
  classItemInfoOnlyIcons: ReadRef<StyleClass>
  classItemTitleFixWindow: ReadRef<StyleClass>
  classItemInfoFixWindow: ReadRef<StyleClass>
  classItemRightIcon: ReadRef<StyleClass>
  // ---METHODS-----------------------
  setSelectedItem(itemKey: _key | undefined): void
  setActiveItem(itemKey: _key | undefined): void
  setItems(menu: MenuItemPrivate, depth: number): NonNullable<MenuItemPrivate>
}
export declare type MenuOption = Pick<
  MenuProps,
  "mode" | "selected" | "horizontal" | "onlyIcons" | "styles" | "class" | "title" | "separator" | "paramsWindowMenu"
>

// ---------------------------------------
declare class Menu extends ClassComponent<MenuProps, MenuSlots, MenuEmits, MenuExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Menu: GlobalComponentConstructor<Menu>
  }
}

export default Menu
