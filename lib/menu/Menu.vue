<script setup lang="ts">
  import { Comment, Fragment, Text, computed, nextTick, onMounted, ref, unref, useSlots, watch } from "vue"
  import { ChevronRightIcon } from "@heroicons/vue/20/solid"
  import {
    GroupMenu,
    GroupMenuPrivate,
    ItemMenu,
    ItemMenuPrivate,
    MenuEmits,
    MenuItemPrivate,
    MenuProps,
    MenuSeparator,
    MenuStyles,
    MenuStylesPrivate
  } from "./Menu"
  import type { FixWindowProps } from "fishtvue/fixwindow"
  import type { SeparatorProps } from "fishtvue/separator"
  import type { _key, StyleClass } from "fishtvue/types"
  import { deepCopyObject, deepMergeSoft, fieldsOmit, fieldsPick } from "fishtvue/utils/objectHandler"
  import { generateUUID } from "fishtvue/utils/functionHandler"
  import { isArray } from "fishtvue/utils/arrayHandler"
  import Icons from "fishtvue/icons/Icons.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Separator from "fishtvue/separator/Separator.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const MenuComponent = new Component<"Menu">()
  const options = MenuComponent.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<MenuProps>(), {
    selected: undefined,
    horizontal: undefined,
    useFirstLetter: undefined,
    onlyIcons: undefined
  })
  const emit = defineEmits<MenuEmits>()
  const slots = useSlots()
  // ---STATIC------------------------------
  const arrayParamsWindowMenu = [
    "eventOpen",
    "eventClose",
    "mode",
    "delay",
    "class",
    "classBody",
    "marginPx",
    "translatePx",
    "paddingWindow"
  ]
  // ---STATE-------------------------------
  const selectedItemIndex = ref<_key>()
  const activeItemIndex = ref<_key>()
  // Корневой DOM-элемент `[data-menu]` (expose G34) + RTL-флаг (детект в onMounted).
  const rootRef = ref<HTMLElement | null>(null)
  const isRtl = ref(false)
  const notPublicParamsMenu = ref(["menu", "class", "disabled", "onClick", "onActive", "onInactive"] as Array<
    keyof ItemMenuPrivate
  >)
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<MenuProps["mode"]>>(
    () => (props?.mode as MenuProps["mode"]) ?? options?.mode ?? MenuComponent.componentsStyle() ?? "outlined"
  )
  const selected = computed<NonNullable<MenuProps["selected"]>>(() => props?.selected ?? options?.selected ?? false)
  const horizontal = computed<NonNullable<MenuProps["horizontal"]>>(
    () => props?.horizontal ?? options?.horizontal ?? false
  )
  const useFirstLetter = computed<MenuProps["useFirstLetter"]>(
    () => props?.useFirstLetter ?? options?.useFirstLetter ?? false
  )
  const onlyIcons = computed<NonNullable<MenuProps["onlyIcons"]>>(() => props?.onlyIcons ?? options?.onlyIcons ?? false)
  const title = computed<NonNullable<MenuProps["title"]>>(
    () => (props?.title as MenuProps["title"]) ?? options?.title ?? ""
  )
  const iconSeparator = computed<MenuSeparator["icon"]>(() => props.separator?.icon ?? options?.separator?.icon)
  const isSeparator = computed<NonNullable<MenuSeparator["isVisible"]>>(
    () => props.separator?.isVisible ?? options?.separator?.isVisible ?? true
  )
  const paramsWindowMenu = computed<MenuProps["paramsWindowMenu"]>(() => ({
    delay: 200,
    typePosition: "absolute",
    position: "right-top",
    eventOpen: onlyIcons.value ? "click" : "hover",
    eventClose: "hover",
    ...fieldsPick(options?.paramsWindowMenu ?? {}, arrayParamsWindowMenu),
    ...fieldsPick(props?.paramsWindowMenu ?? {}, arrayParamsWindowMenu)
  }))
  // ---RTL---------------------------------
  // FixWindow зеркалит под RTL только alignment (start/end), но НЕ физическую сторону → флипаем
  // сторону submenu/tooltip-позиции сами (канон-идиом Table/Split, dev-patterns §2).
  function flipPosition(position?: FixWindowProps["position"]): FixWindowProps["position"] {
    if (!isRtl.value || !position) return position
    return position.replace(/left|right/g, (m) => (m === "left" ? "right" : "left")) as FixWindowProps["position"]
  }
  function submenuParams(item: ItemMenuPrivate): FixWindowProps {
    const params = (item?.menu?.paramsWindowMenu ?? paramsWindowMenu.value) as FixWindowProps
    return isRtl.value && params?.position
      ? ({ ...params, position: flipPosition(params.position) } as FixWindowProps)
      : params
  }
  const baseSeparator = computed<MenuSeparator>(() => ({
    class: horizontal.value ? "my-1" : "-mx-1",
    ...options?.separator,
    ...props.separator
  }))
  const styles = computed<MenuStylesPrivate>(() => {
    const s = deepMergeSoft<MenuStyles>(deepCopyObject(options?.styles), deepCopyObject(unref(props?.styles)))
    return {
      class: s?.class,
      width: s?.width ? (typeof s?.width === "number" ? `${s?.width}px` : s?.width) : "",
      height: s?.height ? (typeof s?.height === "number" ? `${s?.height}px` : s?.height) : "",
      animation: s?.animation ?? "motion-safe:transition-all motion-safe:duration-500",
      activeRows:
        typeof s?.activeRows === "string"
          ? s?.activeRows
          : s?.activeRows || s?.activeRows === undefined
            ? "bg-surface-200/50 dark:bg-surface-700/50"
            : "",
      selectedRows:
        typeof s?.selectedRows === "string"
          ? s?.selectedRows
          : s?.selectedRows || s?.selectedRows === undefined
            ? "bg-surface-200 dark:bg-surface-700"
            : ""
    }
  })
  const modeStyle = computed<StyleClass>(() =>
    mode.value === "filled"
      ? "bg-surface-100 dark:bg-surface-900 rounded-md"
      : mode.value === "outlined"
        ? "bg-white dark:bg-surface-950 rounded-md"
        : mode.value === "underlined"
          ? "bg-surface-50 dark:bg-surface-950"
          : ""
  )
  const classMenu = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "p-1 w-min max-w-4xl shadow-md border text-black dark:text-surface-300 border-surface-200 dark:border-surface-800",
      styles.value.animation ?? "",
      horizontal.value ? "flex flex-row items-center" : "",
      modeStyle.value,
      styles.value?.class?.body ?? "",
      options?.class ?? "",
      props?.class ?? "",
      "overflow-auto"
    ])
  )
  const classSeparator = computed<StyleClass>(() =>
    MenuComponent.setStyle(["my-1", styles.value?.class?.separator ?? ""])
  )
  const classSeparatorIcon = computed<StyleClass>(() =>
    MenuComponent.setStyle(["h-4 w-4 text-surface-200 dark:text-surface-800", styles.value?.class?.separatorIcon ?? ""])
  )
  const classGroup = function (itemClass: GroupMenu["class"]) {
    return MenuComponent.setStyle([
      "flex flex-col rounded",
      styles.value?.class?.group ?? "",
      itemClass,
      horizontal.value ? "flex flex-row" : ""
    ])
  }
  const classGroupTitle = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "mt-[10px] ms-4 me-2 leading-4 text-start text-surface-400 dark:text-surface-500 uppercase text-[10px] font-bold",
      styles.value?.class?.groupTitle ?? ""
    ])
  )
  const classTitle = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "min-w-max px-2 py-1.5 text-sm font-semibold",
      modeStyle.value,
      styles.value?.class?.title ?? ""
    ])
  )
  const classMenuItem = function (item: ItemMenuPrivate) {
    return MenuComponent.setStyle([
      "items-center rounded mt-0.5 px-2 py-1.5 text-sm",
      styles.value?.animation ?? "",
      styles.value?.class?.item ?? "",
      item?.class ?? "",
      horizontal.value ? "me-0.5 last:me-0" : "",
      activeItemIndex.value === item?._key ? (styles.value?.activeRows as StyleClass) : "",
      selectedItemIndex.value === item?._key ? `${styles.value?.selectedRows} font-semibold` : "",
      item?.disabled ? "pointer-events-none opacity-50" : "",
      "flex cursor-pointer select-none outline-none touch-manipulation min-h-[44px]"
    ])
  }
  const classItemIcon = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "flex justify-center items-center h-5 w-4 opacity-60 text-sm font-extralight",
      styles.value?.class?.itemIcon ?? ""
    ])
  )
  const classItemTitleOnlyIcons = computed<StyleClass>(() =>
    MenuComponent.setStyle(["w-max data-[title=true]:mx-2", styles.value?.class?.itemTitle ?? ""])
  )
  const classItemInfoOnlyIcons = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "ms-auto text-xs tracking-widest opacity-50 data-[info=true]:ps-2",
      styles.value?.class?.itemInfo ?? ""
    ])
  )
  const classItemTitleFixWindow = computed<StyleClass>(() =>
    MenuComponent.setStyle(["w-max", styles.value?.class?.itemTitle ?? ""])
  )
  const classItemInfoFixWindow = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "ms-auto text-xs tracking-widest opacity-50 data-[info=true]:ps-2",
      styles.value?.class?.itemInfo ?? ""
    ])
  )
  const classItemRightIcon = computed<StyleClass>(() =>
    MenuComponent.setStyle(["h-4 w-4 opacity-60 rtl:-scale-x-100", styles.value?.class?.itemRightIcon ?? ""])
  )
  const listGroups = ref<Array<GroupMenuPrivate>>([])
  // ---COMPOUND-API (VNode-walk) ----------
  // Считываем декларативные <MenuItem>/<MenuGroup> из default slot и синтезируем GroupMenu[].
  // Schema-driven `groups` prop при наличии выигрывает (backward compat).
  function normalizeChildren(raw: unknown): Array<any> {
    if (raw === null || raw === undefined) return []
    return isArray(raw) ? (raw as Array<any>) : [raw]
  }
  // Сопоставление по имени компонента (defineOptions name / __name), без импорта SFC —
  // импорт MenuItem.vue/MenuGroup.vue в этот SFC ломает type-resolver @vue/compiler-sfc
  // (re-export `declare class ... extends ClassComponent`). Имя надёжно и не минифицируется.
  function isMenuItemVNode(vn: any): boolean {
    const t = vn?.type
    return !!t && (t?.name === "MenuItem" || t?.__name === "MenuItem")
  }
  function isMenuGroupVNode(vn: any): boolean {
    const t = vn?.type
    return !!t && (t?.name === "MenuGroup" || t?.__name === "MenuGroup")
  }
  function flattenVNodes(nodes: Array<any>): Array<any> {
    const out: Array<any> = []
    for (const n of nodes) {
      if (n === null || n === undefined || typeof n === "boolean") continue
      if (typeof n === "object" && n.type === Comment) continue
      if (typeof n === "object" && n.type === Fragment) out.push(...flattenVNodes(normalizeChildren(n.children)))
      else out.push(n)
    }
    return out
  }
  function textOfVNodes(nodes: Array<any>): string {
    const parts: Array<string> = []
    for (const n of nodes) {
      if (typeof n === "string") parts.push(n)
      else if (typeof n === "number") parts.push(String(n))
      else if (n && typeof n === "object" && n.type === Text) parts.push(String(n.children ?? ""))
    }
    return parts.join("").trim()
  }
  function vnodeChildren(vn: any): Array<any> {
    const def = vn?.children?.default
    return typeof def === "function" ? normalizeChildren(def()) : []
  }
  function extractItemFromVNode(vn: any): ItemMenu {
    const item: ItemMenu = { ...(vn?.props ?? {}) }
    const children = flattenVNodes(vnodeChildren(vn))
    const structural = children.filter((c) => isMenuItemVNode(c) || isMenuGroupVNode(c))
    if (item.title === undefined) {
      const text = textOfVNodes(children)
      if (text) item.title = text
    }
    if (structural.length) item.menu = { groups: extractGroupsFromVNodes(children) }
    return item
  }
  function extractItemsFromVNodes(nodes: Array<any>): Array<ItemMenu> {
    return flattenVNodes(nodes)
      .filter((vn) => isMenuItemVNode(vn))
      .map((vn) => extractItemFromVNode(vn))
  }
  function extractGroupsFromVNodes(nodes: Array<any>): Array<GroupMenu> {
    const groups: Array<GroupMenu> = []
    let loose: Array<ItemMenu> = []
    const flush = () => {
      if (loose.length) {
        groups.push({ items: loose })
        loose = []
      }
    }
    for (const vn of flattenVNodes(nodes)) {
      if (isMenuGroupVNode(vn)) {
        flush()
        groups.push({ ...(vn?.props ?? {}), items: extractItemsFromVNodes(vnodeChildren(vn)) })
      } else if (isMenuItemVNode(vn)) {
        loose.push(extractItemFromVNode(vn))
      }
    }
    flush()
    return groups
  }
  const compoundGroups = computed<Array<GroupMenu>>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    return raw ? extractGroupsFromVNodes(normalizeChildren(raw)) : []
  })
  const sourceGroups = computed<Array<GroupMenu>>(() => {
    const g = unref(props.groups)
    if (g && isArray(g) && g.length) return g as Array<GroupMenu>
    return compoundGroups.value
  })
  // ---KEYBOARD-NAVIGATION (roving tabindex + WAI-ARIA menu) ----------
  const focusedItemKey = ref<_key>()
  const usingKeyboard = ref(false)
  const openSubmenuKeys = ref<Set<_key>>(new Set())
  const itemElements = new Map<_key, HTMLElement>()
  const submenuWindows = new Map<_key, { open?: () => void; close?: () => void }>()
  const flatItems = computed<Array<ItemMenuPrivate>>(() =>
    (listGroups.value ?? []).flatMap((group) => (group?.items ?? []) as Array<ItemMenuPrivate>)
  )
  const focusableItems = computed<Array<ItemMenuPrivate>>(() => flatItems.value.filter((item) => !item?.disabled))
  watch(
    focusableItems,
    (items) => {
      if (!items.some((item) => item._key === focusedItemKey.value)) focusedItemKey.value = items[0]?._key
    },
    { immediate: true }
  )
  function setItemRef(el: unknown, key: _key): void {
    if (el) itemElements.set(key, el as HTMLElement)
    else itemElements.delete(key)
  }
  function setSubmenuRef(el: unknown, key: _key): void {
    if (el) submenuWindows.set(key, el as { open?: () => void; close?: () => void })
    else submenuWindows.delete(key)
  }
  function currentItem(): ItemMenuPrivate | undefined {
    return flatItems.value.find((item) => item._key === focusedItemKey.value)
  }
  function focusItemByKey(key: _key | undefined): void {
    if (key === undefined) return
    focusedItemKey.value = key
    setActiveItem(key)
    itemElements.get(key)?.focus?.()
  }
  function moveFocus(delta: number): void {
    const items = focusableItems.value
    if (!items.length) return
    const current = items.findIndex((item) => item._key === focusedItemKey.value)
    const base = current < 0 ? 0 : current
    const next = Math.min(Math.max(0, base + delta), items.length - 1)
    focusItemByKey(items[next]?._key)
  }
  function focusEdge(edge: "first" | "last"): void {
    const items = focusableItems.value
    if (!items.length) return
    focusItemByKey((edge === "first" ? items[0] : items[items.length - 1])?._key)
  }
  function typeahead(char: string): void {
    const items = focusableItems.value
    if (!items.length) return
    const needle = char.toLowerCase()
    const current = items.findIndex((item) => item._key === focusedItemKey.value)
    const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)]
    const hit = ordered.find((item) => (item.title ?? "").trim().toLowerCase().startsWith(needle))
    if (hit) focusItemByKey(hit._key)
  }
  function onSubmenuOpen(item: ItemMenuPrivate): void {
    const next = new Set(openSubmenuKeys.value)
    next.add(item._key)
    openSubmenuKeys.value = next
  }
  function onSubmenuClose(item: ItemMenuPrivate): void {
    const next = new Set(openSubmenuKeys.value)
    next.delete(item._key)
    openSubmenuKeys.value = next
  }
  function openSubmenu(item: ItemMenuPrivate): void {
    submenuWindows.get(item._key)?.open?.()
    onSubmenuOpen(item)
  }
  function closeSubmenu(item: ItemMenuPrivate): void {
    submenuWindows.get(item._key)?.close?.()
    onSubmenuClose(item)
  }
  function onItemFocus(item: ItemMenuPrivate): void {
    focusedItemKey.value = item._key
  }
  function onKeydown(event: KeyboardEvent): void {
    if (!flatItems.value.length) return
    const nextKey = horizontal.value ? "ArrowRight" : "ArrowDown"
    const prevKey = horizontal.value ? "ArrowLeft" : "ArrowUp"
    const openKey = horizontal.value ? "ArrowDown" : "ArrowRight"
    const closeKey = horizontal.value ? "ArrowUp" : "ArrowLeft"
    switch (event.key) {
      case nextKey:
        usingKeyboard.value = true
        event.preventDefault()
        moveFocus(1)
        break
      case prevKey:
        usingKeyboard.value = true
        event.preventDefault()
        moveFocus(-1)
        break
      case "Home":
        usingKeyboard.value = true
        event.preventDefault()
        focusEdge("first")
        break
      case "End":
        usingKeyboard.value = true
        event.preventDefault()
        focusEdge("last")
        break
      case openKey: {
        const item = currentItem()
        if (item?.menu) {
          usingKeyboard.value = true
          event.preventDefault()
          openSubmenu(item)
        }
        break
      }
      case closeKey: {
        const item = currentItem()
        if (item && openSubmenuKeys.value.has(item._key)) {
          usingKeyboard.value = true
          event.preventDefault()
          closeSubmenu(item)
        }
        break
      }
      case "Enter":
      case " ": {
        const item = currentItem()
        if (item) {
          event.preventDefault()
          clickItem(event as unknown as MouseEvent, item)
        }
        break
      }
      case "Escape": {
        const item = currentItem()
        if (item && openSubmenuKeys.value.has(item._key)) {
          event.preventDefault()
          closeSubmenu(item)
        }
        break
      }
      default:
        if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          usingKeyboard.value = true
          typeahead(event.key)
        }
    }
  }
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    selectedItemIndex,
    activeItemIndex,
    // ---PROPS-------------------------
    mode,
    selected,
    horizontal,
    useFirstLetter,
    onlyIcons,
    title,
    iconSeparator,
    isSeparator,
    listGroups,
    paramsWindowMenu,
    baseSeparator,
    styles,
    modeStyle,
    classMenu,
    classSeparator,
    classSeparatorIcon,
    classGroupTitle,
    classTitle,
    classItemIcon,
    classItemTitleOnlyIcons,
    classItemInfoOnlyIcons,
    classItemTitleFixWindow,
    classItemInfoFixWindow,
    classItemRightIcon,
    // ---ELEMENTS----------------------
    rootRef,
    // ---METHODS-----------------------
    setSelectedItem,
    setActiveItem,
    setItems
  })
  // ---MOUNT-UNMOUNT-----------------------
  // `MenuComponent.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).
  // `setItems` (через generateUUID) запускаем только на клиенте, чтобы избежать hydration mismatch.
  function rebuildItems(): void {
    listGroups.value = setItems({ ...props, groups: sourceGroups.value } as MenuItemPrivate)?.groups ?? []
  }
  onMounted(() => {
    rebuildItems()
    // RTL-детект только после populate `listGroups` — корень под `v-if`, до этого `rootRef` === null.
    void nextTick(() => {
      if (rootRef.value) isRtl.value = getComputedStyle(rootRef.value).direction === "rtl"
    })
  })
  // ---WATCHERS----------------------------
  watch(props, rebuildItems, { deep: true })
  watch(compoundGroups, rebuildItems, { deep: true })
  // ---METHODS-----------------------------
  function enterItem(event: MouseEvent | TouchEvent, item: ItemMenuPrivate) {
    usingKeyboard.value = false
    setActiveItem(item?._key)
    emit("onActive", event, item)
    if (item?.onActive) item.onActive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
  }

  function leaveItem(event: MouseEvent | TouchEvent, item: ItemMenuPrivate) {
    setActiveItem(undefined)
    emit("onInactive", event, item)
    if (item?.onInactive)
      item.onInactive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
  }

  function clickItem(event: MouseEvent | TouchEvent, item: ItemMenuPrivate) {
    if (selected.value) setSelectedItem(item?._key)
    emit("onClick", event, item)
    if (item?.onClick) item.onClick(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
  }

  function setSelectedItem(itemKey: _key | undefined): void {
    selectedItemIndex.value = itemKey
  }

  function setActiveItem(itemKey: _key | undefined): void {
    activeItemIndex.value = itemKey
  }

  function setItems(menu: MenuItemPrivate, depth: number = 0): NonNullable<MenuItemPrivate> {
    return {
      ...menu,
      groups:
        menu?.groups && isArray(menu.groups)
          ? unref(menu.groups)?.map(
              (group, groupIndex): GroupMenuPrivate => ({
                ...group,
                separator: {
                  icon: group.separator?.icon ?? iconSeparator.value,
                  isVisible: group.separator?.isVisible ?? isSeparator.value,
                  class: horizontal.value ? "-my-1" : "-mx-1",
                  ...baseSeparator.value,
                  ...group.separator
                },
                items:
                  group?.items && isArray(group.items)
                    ? group.items?.map(
                        (item, itemGroupIndex): ItemMenuPrivate => ({
                          ...item,
                          _key: listGroups?.value?.[groupIndex]?.items?.[itemGroupIndex]?._key ?? generateUUID(),
                          menu: item?.menu
                            ? setItems(
                                {
                                  styles: props.styles,
                                  paramsWindowMenu: {
                                    ...paramsWindowMenu.value,
                                    position: depth ? "right-top" : horizontal.value ? "bottom-left" : "right-top",
                                    ...fieldsPick(item?.menu?.paramsWindowMenu ?? {}, arrayParamsWindowMenu)
                                  } as FixWindowProps,
                                  ...item?.menu
                                } as MenuItemPrivate,
                                depth > 0 ? depth + 1 : 1
                              )
                            : null
                        })
                      )
                    : []
              })
            )
          : []
    }
  }
</script>

<template>
  <div
    v-if="listGroups.length"
    ref="rootRef"
    data-menu
    role="menu"
    :aria-orientation="horizontal ? 'horizontal' : 'vertical'"
    :class="classMenu"
    :style="`${(styles.width as string).length ? `width:${styles.width};` : ''}${(styles.height as string).length ? `height:${styles.height};` : ''}`"
    tabindex="-1"
    @keydown="onKeydown">
    <div v-if="title.length || slots?.title" data-menu-title :class="classTitle">
      <slot name="title" :title="title">{{ title }}</slot>
    </div>
    <template v-for="(group, keyGroup) in listGroups as Array<GroupMenuPrivate>" :key="keyGroup">
      <template
        v-if="
          (group?.separator?.isVisible ?? isSeparator) &&
          listGroups.length !== 1 &&
          (keyGroup !== 0 || (group?.separator?.icon?.length ?? iconSeparator?.length) || title.length)
        ">
        <Separator
          v-if="group?.separator?.icon?.length ?? iconSeparator?.length"
          v-bind="fieldsOmit(group?.separator ?? baseSeparator, ['isVisible', 'icon']) as SeparatorProps"
          :class="classSeparator"
          :vertical="horizontal"
          role="separator"
          :aria-orientation="horizontal ? 'vertical' : 'horizontal'">
          <Icons :type="group.separator?.icon ?? iconSeparator ?? ''" :class="classSeparatorIcon" />
        </Separator>
        <Separator
          v-else
          v-bind="fieldsOmit(group?.separator ?? baseSeparator, ['isVisible', 'icon']) as SeparatorProps"
          :class="classSeparator"
          :vertical="horizontal"
          role="separator"
          :aria-orientation="horizontal ? 'vertical' : 'horizontal'" />
      </template>
      <div data-menu-group role="group" :class="classGroup(group.class)">
        <div v-if="!onlyIcons && group.title" data-menu-group-title :class="classGroupTitle">
          {{ group.title }}
        </div>
        <div
          v-for="item in group.items as Array<ItemMenuPrivate>"
          :key="item._key"
          :ref="(el) => setItemRef(el, item._key)"
          data-menu-item
          role="menuitem"
          :data-collection-item="item?._key"
          :aria-disabled="item?.disabled ?? false"
          :aria-haspopup="item?.menu ? 'menu' : undefined"
          :aria-expanded="item?.menu ? openSubmenuKeys.has(item._key) : undefined"
          :tabindex="!item?.disabled && focusedItemKey === item?._key ? 0 : -1"
          @pointerenter="(event) => enterItem(event, item)"
          @pointerleave="(event) => leaveItem(event, item)"
          @focus="() => onItemFocus(item)"
          @click="(event) => clickItem(event, item)"
          @touchstart="(event) => enterItem(event, item)"
          @touchend="(event) => leaveItem(event, item)"
          :class="classMenuItem(item)">
          <slot
            name="item"
            :data="{
              ...fieldsOmit(item, notPublicParamsMenu),
              isActive: activeItemIndex === item?._key,
              isSelected: selectedItemIndex === item?._key
            }">
            <Icons
              v-if="item?.icon"
              :type="item.icon"
              :class="['h-5 w-4 opacity-60', styles?.class?.itemIcon as string]" />
            <div v-else-if="useFirstLetter" :class="classItemIcon">
              {{ item?.title?.[0] }}
            </div>
            <template v-if="!onlyIcons">
              <span :data-title="!!item?.title" :class="classItemTitleOnlyIcons">
                {{ item?.title }}
              </span>
              <span :data-info="!!item?.info" :class="classItemInfoOnlyIcons">
                <slot name="item-info" :item="fieldsOmit(item, notPublicParamsMenu)" :info="item?.info">{{
                  item?.info
                }}</slot>
              </span>
            </template>
            <FixWindow
              v-else
              :position="flipPosition(horizontal ? 'top' : 'right')"
              :delay="500"
              :margin-px="10"
              :mode="mode">
              <span :data-title="!!item?.title" :class="classItemTitleFixWindow">{{ item?.title }}</span>
              <span :data-info="!!item?.info" :class="classItemInfoFixWindow">
                <slot name="item-info" :item="fieldsOmit(item, notPublicParamsMenu)" :info="item?.info">{{
                  item?.info
                }}</slot>
              </span>
            </FixWindow>
          </slot>
          <ChevronRightIcon v-if="item?.menu && !onlyIcons" :class="classItemRightIcon" />
          <FixWindow
            v-if="!!item?.menu"
            :ref="(el) => setSubmenuRef(el, item._key)"
            v-bind="submenuParams(item)"
            :focus-trap="usingKeyboard"
            class-body="z-10"
            @open="() => onSubmenuOpen(item)"
            @close="() => onSubmenuClose(item)">
            <Menu
              v-bind="item?.menu as MenuProps"
              :mode="mode"
              :selected="selected"
              @on-active="(event, itemChild) => emit('onActive', event, itemChild)"
              @on-inactive="(event, itemChild) => emit('onInactive', event, itemChild)"
              @on-click="(event, itemChild) => emit('onClick', event, itemChild)" />
          </FixWindow>
        </div>
      </div>
    </template>
    <template v-if="slots?.footer">
      <Separator
        v-bind="fieldsOmit(baseSeparator, ['isVisible', 'icon']) as SeparatorProps"
        class="py-1.5 !px-0 !-mx-1" />
      <slot name="footer"></slot>
    </template>
  </div>
</template>
