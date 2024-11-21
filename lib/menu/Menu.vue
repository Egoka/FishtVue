<script setup lang="ts">
  import { computed, ref, onMounted, useSlots } from "vue"
  import { ChevronRightIcon } from "@heroicons/vue/20/solid"
  import {
    MenuProps,
    MenuEmits,
    MenuExpose,
    ItemMenuPrivate,
    MenuSeparator,
    GroupsPrivate,
    MenuItemPrivate,
    GroupMenuPrivate,
    MenuStylesPrivate,
    MenuStyles
  } from "./Menu"
  import { FixWindowProps } from "fishtvue/fixwindow"
  import { SeparatorProps } from "fishtvue/separator"
  import { _key, RefLink, StyleClass } from "fishtvue/types"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  import Icons from "fishtvue/icons/Icons.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Separator from "fishtvue/separator/Separator.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const MenuComponent = new Component<"Menu">()
  const options = MenuComponent.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<MenuProps>()
  const emit = defineEmits<MenuEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const menuRefLink = ref<HTMLElement>()
  // ---STATE-------------------------------
  const selectedItemIndex = ref<_key>()
  const activeItemIndex = ref<_key>()
  const notPublicParamsMenu = ref(["menu", "class", "disabled", "onClick", "onActive", "onInactive"] as Array<
    keyof ItemMenuPrivate
  >)
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<MenuProps["mode"]>>(
    () => props?.mode ?? options?.mode ?? MenuComponent.componentsStyle() ?? "outlined"
  )
  const selected = computed<NonNullable<MenuProps["selected"]>>(() => props?.selected ?? options?.selected ?? false)
  const horizontal = computed<NonNullable<MenuProps["horizontal"]>>(
    () => props?.horizontal ?? options?.horizontal ?? false
  )
  const onlyIcons = computed<NonNullable<MenuProps["onlyIcons"]>>(() => props?.onlyIcons ?? options?.onlyIcons ?? false)
  const title = computed<NonNullable<MenuProps["title"]>>(() => props?.title ?? options?.title ?? "")
  const iconSeparator = computed<MenuSeparator["icon"]>(() => props.separator?.icon ?? options?.separator?.icon)
  const isSeparator = computed<NonNullable<MenuSeparator["isVisible"]>>(
    () => props.separator?.isVisible ?? options?.separator?.isVisible ?? true
  )
  const listGroups = computed<GroupsPrivate>(() => setItems(props as MenuItemPrivate)?.groups ?? [])
  const paramsWindowMenu = computed<MenuProps["paramsWindowMenu"]>(() => ({
    delay: 2,
    position: "right-top",
    eventOpen: onlyIcons.value ? "click" : "hover",
    eventClose: "hover",
    ...options?.paramsWindowMenu,
    ...props?.paramsWindowMenu
  }))
  const baseSeparator = computed<MenuSeparator>(() => ({
    class: horizontal.value ? "my-1" : "-mx-1",
    ...options?.separator,
    ...props.separator
  }))
  const styles = computed<MenuStylesPrivate>(() => {
    const s: MenuStyles = { ...options?.styles, ...props?.styles }
    return {
      class: s?.class,
      width: s?.width ? (typeof s?.width === "number" ? `${s?.width}px` : s?.width) : "",
      height: s?.height ? (typeof s?.height === "number" ? `${s?.height}px` : s?.height) : "",
      animation: s?.animation ?? "transition-all duration-500",
      activeRows:
        typeof s?.activeRows === "string" && s?.animation
          ? s?.activeRows
          : s?.activeRows || s?.activeRows === undefined
            ? "bg-neutral-200/50 dark:bg-neutral-700/50"
            : "",
      selectedRows:
        typeof s?.selectedRows === "string"
          ? s?.selectedRows
          : s?.selectedRows || s?.selectedRows === undefined
            ? "bg-neutral-200 dark:bg-neutral-700"
            : ""
    }
  })
  const modeStyle = computed<StyleClass>(() =>
    mode.value === "filled"
      ? "bg-stone-100 dark:bg-stone-900 rounded-md"
      : mode.value === "outlined"
        ? "bg-white dark:bg-neutral-950 rounded-md"
        : mode.value === "underlined"
          ? "bg-stone-50 dark:bg-stone-950"
          : ""
  )
  const classMenu = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "p-1 w-min max-w-4xl shadow-md border text-black dark:text-zinc-300 border-neutral-200 dark:border-neutral-800",
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
    MenuComponent.setStyle(["h-4 w-4 text-neutral-200 dark:text-neutral-800", styles.value?.class?.separatorIcon ?? ""])
  )
  const classGroup = computed<StyleClass>(() =>
    MenuComponent.setStyle([styles.value?.class?.group ?? "", horizontal.value ? "flex flex-row" : ""])
  )
  const classGroupTitle = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "mt-2 ml-8 leading-4 text-left text-neutral-400 dark:text-neutral-500 uppercase text-[10px] font-bold",
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
      styles.value?.class?.item ?? "",
      item?.class ?? "",
      horizontal.value ? "mr-0.5 last:mr-0" : "",
      activeItemIndex.value === item?._key ? (styles.value?.activeRows as StyleClass) : "",
      selectedItemIndex.value === item?._key ? `${styles.value?.selectedRows} font-semibold` : "",
      item?.disabled ? "pointer-events-none opacity-50" : "",
      "relative flex cursor-default select-none outline-none transition-colors"
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
      "ml-auto text-xs tracking-widest opacity-50 data-[info=true]:pl-2",
      styles.value?.class?.itemInfo ?? ""
    ])
  )
  const classItemTitleFixWindow = computed<StyleClass>(() =>
    MenuComponent.setStyle(["w-max", styles.value?.class?.itemTitle ?? ""])
  )
  const classItemInfoFixWindow = computed<StyleClass>(() =>
    MenuComponent.setStyle([
      "ml-auto text-xs tracking-widest opacity-50 data-[info=true]:pl-2",
      styles.value?.class?.itemInfo ?? ""
    ])
  )
  const classItemRightIcon = computed<StyleClass>(() =>
    MenuComponent.setStyle(["h-4 w-4 opacity-60", styles.value?.class?.itemRightIcon ?? ""])
  )
  // ---EXPOSE------------------------------
  defineExpose<MenuExpose>({
    // ---STATE-------------------------
    menuRefLink,
    selectedItemIndex,
    activeItemIndex,
    // ---PROPS-------------------------
    mode,
    selected,
    horizontal,
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
    classGroup,
    classGroupTitle,
    classTitle,
    classItemIcon,
    classItemTitleOnlyIcons,
    classItemInfoOnlyIcons,
    classItemTitleFixWindow,
    classItemInfoFixWindow,
    classItemRightIcon,
    // ---METHODS-----------------------
    setSelectedItem,
    setActiveItem,
    setItems
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    MenuComponent.initStyle()
  })

  // ---METHODS-----------------------------
  function overItem(event: MouseEvent, item: ItemMenuPrivate) {
    setActiveItem(item?._key)
    emit("onActive", event, item)
    if (item?.onActive)
      item?.onActive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
  }

  function leaveItem(event: MouseEvent, item: ItemMenuPrivate) {
    setActiveItem(undefined)
    emit("onInactive", event, item)
    if (item?.onInactive)
      item?.onInactive(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
  }

  function clickItem(event: PointerEvent, item: ItemMenuPrivate) {
    if (selected.value) setSelectedItem(item?._key)
    emit("onClick", event, item)
    if (item?.onClick) item?.onClick(event, fieldsOmit(item, ["onClick", "onActive", "onInactive"]) as ItemMenuPrivate)
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
      groups: menu.groups
        ? menu.groups?.map(
            (group): GroupMenuPrivate => ({
              ...group,
              separator: {
                icon: group.separator?.icon ?? iconSeparator.value,
                isVisible: group.separator?.isVisible ?? isSeparator.value,
                class: horizontal.value ? "-my-1" : "-mx-1",
                ...baseSeparator.value,
                ...group.separator
              },
              items: group.items?.map((item): ItemMenuPrivate => {
                return {
                  ...item,
                  _key: crypto.randomUUID(),
                  menu: item?.menu
                    ? setItems(
                        {
                          styles: props.styles,
                          paramsWindowMenu: {
                            ...paramsWindowMenu.value,
                            position: depth ? "right-top" : horizontal.value ? "bottom-left" : "right-top",
                            ...item?.menu?.paramsWindowMenu
                          } as FixWindowProps,
                          ...item?.menu
                        } as MenuItemPrivate,
                        depth > 0 ? depth + 1 : 1
                      )
                    : null
                }
              })
            })
          )
        : []
    }
  }
</script>

<template>
  <div
    ref="menuRefLink"
    role="menu"
    :class="classMenu"
    :style="`width:${styles.width};height:${styles.height};`"
    tabindex="-1">
    <div v-if="title.length || slots?.title" :class="classTitle">
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
          :vertical="horizontal">
          <Icons :type="group.separator?.icon ?? iconSeparator ?? ''" :class="classSeparatorIcon" />
        </Separator>
        <Separator
          v-else
          v-bind="fieldsOmit(group?.separator ?? baseSeparator, ['isVisible', 'icon']) as SeparatorProps"
          :class="classSeparator"
          :vertical="horizontal" />
      </template>
      <div role="group" :class="classGroup">
        <div v-if="!onlyIcons && group.title" :class="classGroupTitle">
          {{ group.title }}
        </div>
        <div
          v-for="(item, keyItem) in group.items as Array<ItemMenuPrivate>"
          :key="keyItem"
          role="menuitem"
          :data-collection-item="item?._key"
          :aria-disabled="item?.disabled ?? false"
          :tabindex="activeItemIndex === item?._key ? 0 : -2"
          @mouseover="(event) => overItem(event, item)"
          @mouseleave="(event) => leaveItem(event, item)"
          @click="(event) => clickItem(event, item)"
          :class="classMenuItem(item)">
          <slot name="item" :data="fieldsOmit(item, notPublicParamsMenu)">
            <Icons
              v-if="item?.icon"
              :type="item.icon"
              :class="['h-5 w-4 opacity-60', styles?.class?.itemIcon as string]" />
            <div v-else :class="classItemIcon">
              {{ item?.title?.[0] }}
            </div>
            <template v-if="!onlyIcons">
              <span :data-title="!!item?.title" :class="classItemTitleOnlyIcons">
                {{ item?.title }}
              </span>
              <span :data-info="!!item?.info" :class="classItemInfoOnlyIcons" v-html="item?.info" />
            </template>
            <FixWindow
              v-else
              :position="horizontal ? 'top' : 'right'"
              :delay="5"
              :margin-px="10"
              :scrollable-el="menuRefLink as RefLink"
              :mode="mode">
              <span :data-title="!!item?.title" :class="classItemTitleFixWindow">{{ item?.title }}</span>
              <span :data-info="!!item?.info" :class="classItemInfoFixWindow" v-html="item?.info" />
            </FixWindow>
          </slot>
          <ChevronRightIcon v-if="item?.menu && !onlyIcons" :class="classItemRightIcon" />
          <FixWindow
            v-if="!!item?.menu"
            v-bind="(item?.menu?.paramsWindowMenu ?? paramsWindowMenu) as FixWindowProps"
            :scrollable-el="menuRefLink as RefLink"
            class-body="z-10">
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
      <Separator v-bind="fieldsOmit(baseSeparator, ['isVisible', 'icon']) as SeparatorProps" class="!px-0 !-mx-1" />
      <slot name="footer"></slot>
    </template>
  </div>
</template>
