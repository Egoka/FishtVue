<script setup lang="ts">
  import { Comment, Fragment, Text, computed, nextTick, onMounted, ref, toValue, useSlots, watch } from "vue"
  import { ChevronRightIcon } from "@heroicons/vue/20/solid"
  import {
    MenuClassKey,
    MenuDataPrivate,
    MenuEmits,
    MenuGroupData,
    MenuGroupDataPrivate,
    MenuItemData,
    MenuItemDataPrivate,
    MenuProps,
    MenuSeparator
  } from "./Menu"
  import type { FixWindowProps } from "fishtvue/fixwindow"
  import type { SeparatorProps } from "fishtvue/separator"
  import type { ItemKey, StyleClass } from "fishtvue/types"
  import { fieldsOmit, fieldsPick } from "fishtvue/utils/objectHandler"
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
    firstLetter: undefined,
    onlyIcons: undefined
  })
  const emit = defineEmits<MenuEmits>()
  const slots = useSlots()
  // ---STATIC------------------------------
  const arrayFixWindowProps = [
    "eventOpen",
    "eventClose",
    "mode",
    "openDelay",
    "class",
    "classes",
    "marginPx",
    "translatePx",
    "paddingWindow"
  ]
  // ---STATE-------------------------------
  const selectedItemIndex = ref<ItemKey>()
  const activeItemIndex = ref<ItemKey>()
  // Корневой DOM-элемент `[data-menu]` (expose G34) + RTL-флаг (детект в onMounted).
  const rootRef = ref<HTMLElement | null>(null)
  const isRtl = ref(false)
  const notPublicParamsMenu = ref(["menu", "class", "disabled", "onClick", "onActive", "onInactive"] as Array<
    keyof MenuItemDataPrivate
  >)
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<MenuProps["mode"]>>(
    () => (props?.mode as MenuProps["mode"]) ?? options?.mode ?? MenuComponent.componentsStyle() ?? "outlined"
  )
  const selected = computed<NonNullable<MenuProps["selected"]>>(() => props?.selected ?? options?.selected ?? false)
  const orientation = computed<NonNullable<MenuProps["orientation"]>>(
    () => props?.orientation ?? options?.orientation ?? "vertical"
  )
  // Горизонтальная раскладка — частый предикат в классах и ориентации разделителя
  const isHorizontal = computed<boolean>(() => orientation.value === "horizontal")
  const firstLetter = computed<NonNullable<MenuProps["firstLetter"]>>(
    () => props?.firstLetter ?? options?.firstLetter ?? false
  )
  const onlyIcons = computed<NonNullable<MenuProps["onlyIcons"]>>(() => props?.onlyIcons ?? options?.onlyIcons ?? false)
  const title = computed<NonNullable<MenuProps["title"]>>(
    () => (props?.title as MenuProps["title"]) ?? options?.title ?? ""
  )
  const iconSeparator = computed<MenuSeparator["icon"]>(() => props.separator?.icon ?? options?.separator?.icon)
  const isSeparator = computed<NonNullable<MenuSeparator["visible"]>>(
    () => props.separator?.visible ?? options?.separator?.visible ?? true
  )
  const fixWindowProps = computed<MenuProps["fixWindowProps"]>(() => ({
    openDelay: 200,
    strategy: "absolute",
    position: "right-top",
    eventOpen: onlyIcons.value ? "click" : "hover",
    eventClose: "hover",
    ...fieldsPick(options?.fixWindowProps ?? {}, arrayFixWindowProps),
    ...fieldsPick(props?.fixWindowProps ?? {}, arrayFixWindowProps)
  }))
  // ---RTL---------------------------------
  // FixWindow зеркалит под RTL только alignment (start/end), но НЕ физическую сторону → флипаем
  // сторону submenu/tooltip-позиции сами (канон-идиом Table/Split, dev-patterns §2).
  function flipPosition(position?: FixWindowProps["position"]): FixWindowProps["position"] {
    if (!isRtl.value || !position) return position
    return position.replace(/left|right/g, (m) => (m === "left" ? "right" : "left")) as FixWindowProps["position"]
  }
  function submenuParams(item: MenuItemDataPrivate): FixWindowProps {
    const params = (item?.menu?.fixWindowProps ?? fixWindowProps.value) as FixWindowProps
    return isRtl.value && params?.position
      ? ({ ...params, position: flipPosition(params.position) } as FixWindowProps)
      : params
  }
  const baseSeparator = computed<MenuSeparator>(() => ({
    class: isHorizontal.value ? "my-1" : "-mx-1",
    ...options?.separator,
    ...props.separator
  }))
  const { cls, raw, pick } = MenuComponent.resolveClasses<MenuClassKey>(props)

  // Размеры меню: число трактуем как px (бывшие `styles.width`/`styles.height`)
  const toSize = (value: MenuProps["width"] | MenuProps["height"]): string =>
    value ? (typeof value === "number" ? `${value}px` : String(value)) : ""
  const width = computed<string>(() => toSize(props?.width ?? options?.width))
  const height = computed<string>(() => toSize(props?.height ?? options?.height))

  // ---ASPECT-КЛЮЧИ (§2 B: props ?? options ?? default, `""` отключает) ----
  const classAnimation = computed<StyleClass>(() =>
    pick("animation", "motion-safe:transition-all motion-safe:duration-500")
  )
  const classItemActive = computed<StyleClass>(() => pick("itemActive", "bg-surface-200/50 dark:bg-surface-700/50"))
  const classItemSelected = computed<StyleClass>(() => pick("itemSelected", "bg-surface-200 dark:bg-surface-700"))

  const modeStyle = computed<StyleClass>(() =>
    mode.value === "filled"
      ? "bg-surface-100 dark:bg-surface-900 rounded-md"
      : mode.value === "outlined"
        ? "bg-white dark:bg-surface-950 rounded-md"
        : mode.value === "underlined"
          ? "bg-surface-50 dark:bg-surface-950"
          : ""
  )
  const classBase = computed<StyleClass>(() =>
    cls(
      "root",
      "p-1 w-min max-w-4xl shadow-md border text-black dark:text-surface-300 border-surface-200 dark:border-surface-800",
      classAnimation.value,
      isHorizontal.value ? "flex flex-row items-center" : "",
      modeStyle.value,
      "overflow-auto"
    )
  )
  const classSeparator = computed<StyleClass>(() => raw("separator"))
  const classSeparatorIcon = computed<StyleClass>(() =>
    cls("separatorIcon", "h-4 w-4 text-surface-200 dark:text-surface-800")
  )
  // `group.class` — самый частный потребитель, поэтому идёт после `classes.group`
  const classGroup = (itemClass: MenuGroupData["class"]) =>
    MenuComponent.setStyle(["flex flex-col rounded", isHorizontal.value ? "flex flex-row" : ""], {
      consumer: [raw("group"), itemClass]
    })
  const classGroupTitle = computed<StyleClass>(() =>
    cls(
      "groupTitle",
      "mt-[10px] ms-4 me-2 leading-4 text-start text-surface-400 dark:text-surface-500 uppercase text-[10px] font-bold"
    )
  )
  const classTitle = computed<StyleClass>(() =>
    cls("title", "min-w-max px-2 py-1.5 text-sm font-semibold", modeStyle.value)
  )
  // `item.class` — последний сегмент; state-классы (active/selected/disabled) идут до него,
  // структурные — в базе, чтобы потребитель мог их перебить (§2 D)
  const classMenuItem = (item: MenuItemDataPrivate) =>
    MenuComponent.setStyle(
      [
        "items-center rounded mt-0.5 px-2 py-1.5 text-sm",
        classAnimation.value,
        isHorizontal.value ? "me-0.5 last:me-0" : "",
        "flex cursor-pointer select-none outline-none touch-manipulation min-h-[44px]",
        activeItemIndex.value === item?._key ? classItemActive.value : "",
        selectedItemIndex.value === item?._key ? classItemSelected.value : "",
        selectedItemIndex.value === item?._key ? "font-semibold" : "",
        item?.disabled ? "pointer-events-none opacity-50" : ""
      ],
      { consumer: [raw("item"), item?.class] }
    )
  const classItemIcon = computed<StyleClass>(() =>
    cls("itemIcon", "flex justify-center items-center h-5 w-4 opacity-60 text-sm font-extralight")
  )
  const classItemTitleOnlyIcons = computed<StyleClass>(() => cls("itemTitle", "w-max data-[title=true]:mx-2"))
  const classItemInfoOnlyIcons = computed<StyleClass>(() =>
    cls("itemInfo", "ms-auto text-xs tracking-widest opacity-50 data-[info=true]:ps-2")
  )
  const classItemTitleFixWindow = computed<StyleClass>(() => cls("itemTitle", "w-max"))
  const classItemInfoFixWindow = computed<StyleClass>(() =>
    cls("itemInfo", "ms-auto text-xs tracking-widest opacity-50 data-[info=true]:ps-2")
  )
  const classItemEndIcon = computed<StyleClass>(() =>
    cls("itemEndIcon", "inline-block h-4 w-4 opacity-60 rtl:-scale-x-100")
  )
  const listGroups = ref<Array<MenuGroupDataPrivate>>([])
  // ---COMPOUND-API (VNode-walk) ----------
  // Считываем декларативные <MenuItem>/<MenuGroup> из default slot и синтезируем MenuGroupData[].
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
  function extractItemFromVNode(vn: any): MenuItemData {
    const item: MenuItemData = { ...(vn?.props ?? {}) }
    const children = flattenVNodes(vnodeChildren(vn))
    const structural = children.filter((c) => isMenuItemVNode(c) || isMenuGroupVNode(c))
    if (item.title === undefined) {
      const text = textOfVNodes(children)
      if (text) item.title = text
    }
    if (structural.length) item.menu = { groups: extractGroupsFromVNodes(children) }
    return item
  }
  function extractItemsFromVNodes(nodes: Array<any>): Array<MenuItemData> {
    return flattenVNodes(nodes)
      .filter((vn) => isMenuItemVNode(vn))
      .map((vn) => extractItemFromVNode(vn))
  }
  function extractGroupsFromVNodes(nodes: Array<any>): Array<MenuGroupData> {
    const groups: Array<MenuGroupData> = []
    let loose: Array<MenuItemData> = []
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
  const compoundGroups = computed<Array<MenuGroupData>>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    return raw ? extractGroupsFromVNodes(normalizeChildren(raw)) : []
  })
  const sourceGroups = computed<Array<MenuGroupData>>(() => {
    const g = toValue(props.groups)
    if (g && isArray(g) && g.length) return g as Array<MenuGroupData>
    return compoundGroups.value
  })
  // ---KEYBOARD-NAVIGATION (roving tabindex + WAI-ARIA menu) ----------
  const focusedItemKey = ref<ItemKey>()
  const usingKeyboard = ref(false)
  const openSubmenuKeys = ref<Set<ItemKey>>(new Set())
  const itemElements = new Map<ItemKey, HTMLElement>()
  const submenuWindows = new Map<ItemKey, { open?: () => void; close?: () => void }>()
  const flatItems = computed<Array<MenuItemDataPrivate>>(() =>
    (listGroups.value ?? []).flatMap((group) => (group?.items ?? []) as Array<MenuItemDataPrivate>)
  )
  const focusableItems = computed<Array<MenuItemDataPrivate>>(() => flatItems.value.filter((item) => !item?.disabled))
  watch(
    focusableItems,
    (items) => {
      if (!items.some((item) => item._key === focusedItemKey.value)) focusedItemKey.value = items[0]?._key
    },
    { immediate: true }
  )
  function setItemRef(el: unknown, key: ItemKey): void {
    if (el) itemElements.set(key, el as HTMLElement)
    else itemElements.delete(key)
  }
  function setSubmenuRef(el: unknown, key: ItemKey): void {
    if (el) submenuWindows.set(key, el as { open?: () => void; close?: () => void })
    else submenuWindows.delete(key)
  }
  function currentItem(): MenuItemDataPrivate | undefined {
    return flatItems.value.find((item) => item._key === focusedItemKey.value)
  }
  function focusItemByKey(key: ItemKey | undefined): void {
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
  function onSubmenuOpen(item: MenuItemDataPrivate): void {
    const next = new Set(openSubmenuKeys.value)
    next.add(item._key)
    openSubmenuKeys.value = next
  }
  function onSubmenuClose(item: MenuItemDataPrivate): void {
    const next = new Set(openSubmenuKeys.value)
    next.delete(item._key)
    openSubmenuKeys.value = next
  }
  function openSubmenu(item: MenuItemDataPrivate): void {
    submenuWindows.get(item._key)?.open?.()
    onSubmenuOpen(item)
  }
  function closeSubmenu(item: MenuItemDataPrivate): void {
    submenuWindows.get(item._key)?.close?.()
    onSubmenuClose(item)
  }
  function onItemFocus(item: MenuItemDataPrivate): void {
    focusedItemKey.value = item._key
  }
  function onKeydown(event: KeyboardEvent): void {
    if (!flatItems.value.length) return
    const nextKey = isHorizontal.value ? "ArrowRight" : "ArrowDown"
    const prevKey = isHorizontal.value ? "ArrowLeft" : "ArrowUp"
    const openKey = isHorizontal.value ? "ArrowDown" : "ArrowRight"
    const closeKey = isHorizontal.value ? "ArrowUp" : "ArrowLeft"
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
    orientation,
    firstLetter,
    onlyIcons,
    title,
    width,
    height,
    iconSeparator,
    isSeparator,
    listGroups,
    fixWindowProps,
    baseSeparator,
    modeStyle,
    classBase,
    classSeparator,
    classSeparatorIcon,
    classGroupTitle,
    classTitle,
    classItemIcon,
    classItemTitleOnlyIcons,
    classItemInfoOnlyIcons,
    classItemTitleFixWindow,
    classItemInfoFixWindow,
    classItemEndIcon,
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
    listGroups.value = setItems({ ...props, groups: sourceGroups.value } as MenuDataPrivate)?.groups ?? []
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
  function enterItem(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate) {
    usingKeyboard.value = false
    setActiveItem(item?._key)
    emit("item-active", event, item)
    if (item?.onActive)
      item.onActive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as MenuItemDataPrivate)
  }

  function leaveItem(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate) {
    setActiveItem(undefined)
    emit("item-inactive", event, item)
    if (item?.onInactive)
      item.onInactive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as MenuItemDataPrivate)
  }

  function clickItem(event: MouseEvent | TouchEvent, item: MenuItemDataPrivate) {
    if (selected.value) setSelectedItem(item?._key)
    emit("item-click", event, item)
    if (item?.onClick)
      item.onClick(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as MenuItemDataPrivate)
  }

  function setSelectedItem(itemKey: ItemKey | undefined): void {
    selectedItemIndex.value = itemKey
  }

  function setActiveItem(itemKey: ItemKey | undefined): void {
    activeItemIndex.value = itemKey
  }

  function setItems(menu: MenuDataPrivate, depth: number = 0): NonNullable<MenuDataPrivate> {
    return {
      ...menu,
      groups:
        menu?.groups && isArray(menu.groups)
          ? toValue(menu.groups)?.map(
              (group, groupIndex): MenuGroupDataPrivate => ({
                ...group,
                separator: {
                  icon: group.separator?.icon ?? iconSeparator.value,
                  visible: group.separator?.visible ?? isSeparator.value,
                  class: isHorizontal.value ? "-my-1" : "-mx-1",
                  ...baseSeparator.value,
                  ...group.separator
                },
                items:
                  group?.items && isArray(group.items)
                    ? group.items?.map(
                        (item, itemGroupIndex): MenuItemDataPrivate => ({
                          ...item,
                          _key: listGroups?.value?.[groupIndex]?.items?.[itemGroupIndex]?._key ?? generateUUID(),
                          menu: item?.menu
                            ? setItems(
                                {
                                  classes: props.classes,
                                  fixWindowProps: {
                                    ...fixWindowProps.value,
                                    position: depth ? "right-top" : isHorizontal.value ? "bottom-left" : "right-top",
                                    ...fieldsPick(item?.menu?.fixWindowProps ?? {}, arrayFixWindowProps)
                                  } as FixWindowProps,
                                  ...item?.menu
                                } as MenuDataPrivate,
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
    :aria-orientation="orientation"
    :class="classBase"
    :data-orientation="orientation"
    :style="`${width.length ? `width:${width};` : ''}${height.length ? `height:${height};` : ''}`"
    tabindex="-1"
    @keydown="onKeydown">
    <div v-if="title.length || slots?.title" data-menu-title :class="classTitle">
      <slot name="title" :title="title">{{ title }}</slot>
    </div>
    <template v-for="(group, keyGroup) in listGroups as Array<MenuGroupDataPrivate>" :key="keyGroup">
      <template
        v-if="
          (group?.separator?.visible ?? isSeparator) &&
          listGroups.length !== 1 &&
          (keyGroup !== 0 || (group?.separator?.icon?.length ?? iconSeparator?.length) || title.length)
        ">
        <Separator
          v-if="group?.separator?.icon?.length ?? iconSeparator?.length"
          v-bind="fieldsOmit(group?.separator ?? baseSeparator, ['visible', 'icon']) as SeparatorProps"
          :class="classSeparator"
          :orientation="isHorizontal ? 'vertical' : 'horizontal'"
          role="separator"
          :aria-orientation="isHorizontal ? 'vertical' : 'horizontal'">
          <Icons :type="group.separator?.icon ?? iconSeparator ?? ''" :class="classSeparatorIcon" />
        </Separator>
        <Separator
          v-else
          v-bind="fieldsOmit(group?.separator ?? baseSeparator, ['visible', 'icon']) as SeparatorProps"
          :class="classSeparator"
          :orientation="isHorizontal ? 'vertical' : 'horizontal'"
          role="separator"
          :aria-orientation="isHorizontal ? 'vertical' : 'horizontal'" />
      </template>
      <div data-menu-group role="group" :class="classGroup(group.class)">
        <div v-if="!onlyIcons && group.title" data-menu-group-title :class="classGroupTitle">
          {{ group.title }}
        </div>
        <div
          v-for="item in group.items as Array<MenuItemDataPrivate>"
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
              data-menu-item-icon
              :type="item.icon"
              :class="MenuComponent.setStyle('h-5 w-4 opacity-60', { consumer: [raw('itemIcon')] })" />
            <div v-else-if="firstLetter" data-menu-item-icon :class="classItemIcon">
              {{ item?.title?.[0] }}
            </div>
            <template v-if="!onlyIcons">
              <span data-menu-item-title :data-title="!!item?.title" :class="classItemTitleOnlyIcons">
                {{ item?.title }}
              </span>
              <span data-menu-item-info :data-info="!!item?.info" :class="classItemInfoOnlyIcons">
                <slot name="item-info" :item="fieldsOmit(item, notPublicParamsMenu)" :info="item?.info">{{
                  item?.info
                }}</slot>
              </span>
            </template>
            <FixWindow
              v-else
              :position="flipPosition(isHorizontal ? 'top' : 'right')"
              :open-delay="500"
              :margin-px="10"
              :mode="mode">
              <span data-menu-item-title :data-title="!!item?.title" :class="classItemTitleFixWindow">{{
                item?.title
              }}</span>
              <span data-menu-item-info :data-info="!!item?.info" :class="classItemInfoFixWindow">
                <slot name="item-info" :item="fieldsOmit(item, notPublicParamsMenu)" :info="item?.info">{{
                  item?.info
                }}</slot>
              </span>
            </FixWindow>
          </slot>
          <!-- heroicons — функциональные компоненты: сквозь них проходят только class/style/on*,
               поэтому маркер и классы живут на обёртке (тот же приём, что у Icons в W1) -->
          <span v-if="item?.menu && !onlyIcons" data-menu-item-end-icon :class="classItemEndIcon">
            <ChevronRightIcon class="h-full w-full" />
          </span>
          <FixWindow
            v-if="!!item?.menu"
            :ref="(el) => setSubmenuRef(el, item._key)"
            v-bind="submenuParams(item)"
            :focus-trap="usingKeyboard"
            class="z-10"
            @open="() => onSubmenuOpen(item)"
            @close="() => onSubmenuClose(item)">
            <Menu
              v-bind="item?.menu as MenuProps"
              :mode="mode"
              :selected="selected"
              :classes="props.classes"
              @item-active="(event, itemChild) => emit('item-active', event, itemChild)"
              @item-inactive="(event, itemChild) => emit('item-inactive', event, itemChild)"
              @item-click="(event, itemChild) => emit('item-click', event, itemChild)" />
          </FixWindow>
        </div>
      </div>
    </template>
    <template v-if="slots?.footer">
      <Separator
        v-bind="fieldsOmit(baseSeparator, ['visible', 'icon']) as SeparatorProps"
        class="py-1.5 !px-0 !-mx-1" />
      <slot name="footer"></slot>
    </template>
  </div>
</template>
