<script setup lang="ts">
  import { computed, ref, watch, onMounted, reactive } from "vue"
  import type { SplitProps, SplitEmits, SplitExpose, Panel, CursorType } from "./Split"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Split = new Component<"Split">()
  const options = Split.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<SplitProps>()
  const emit = defineEmits<SplitEmits>()
  // ---REF-LINK----------------------------
  const resizableGroup = ref<HTMLElement>()
  const resizablePanels = ref<Record<string, HTMLElement>>({})
  // ---STATE-------------------------------
  const sizePanels = reactive<Record<Panel["name"], number>>({})
  const cursorPanels = reactive<Record<Panel["name"], CursorType>>({})
  const activeCursorPanel = ref<CursorType>("center")
  // ---PROPS-------------------------------
  const units = computed<SplitProps["units"]>(() => props.units ?? "percentages")
  const panels = computed<SplitProps["panels"]>(
    () =>
      props?.panels.map((item) => {
        if (item?.size && (typeof item?.size as string) === "string" && +item?.size > 0) item.size = +item.size
        if (item?.minSize && (typeof item?.minSize as string) === "string" && +item?.minSize > 0)
          item.minSize = +item.minSize
        if (item?.maxSize && (typeof item?.maxSize as string) === "string" && +item?.maxSize > 0)
          item.maxSize = +item.maxSize
        if (item?.minSize || item?.maxSize) {
          if (item?.size && item?.maxSize && item?.size > item?.maxSize) {
            item.size = item?.maxSize
          } else if (item?.size && item?.minSize && item?.size < item?.minSize) {
            item.size = item?.minSize
          } else if (item?.maxSize && item?.minSize && !item.size) {
            item.size = item?.minSize + (item?.maxSize - item?.minSize) / 2
          }
        }
        if (styles.value && styles.value?.panel) item.class = [styles.value?.panel as string, item.class as string]
        return item
      }) ?? []
  )
  const direction = computed<SplitProps["direction"]>(() => props?.direction || "horizontal")
  const separatorType = computed<NonNullable<SplitProps["separatorType"]>>(
    () => props?.separatorType ?? options?.separatorType ?? "strip"
  )
  const separatorNotHoverOpacity = computed<SplitProps["separatorNotHoverOpacity"]>(
    () => props?.separatorNotHoverOpacity ?? options?.separatorNotHoverOpacity
  )
  // ---STYLE-------------------------------
  const styles = computed<SplitProps["styles"]>(() => props?.styles ?? options?.styles)
  const separatorClass = ref<StyleClass>([
    "relative flex w-px items-center justify-center bg-gray-200 dark:bg-gray-800",
    "touch-none select-none",
    "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 after:z-10",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
    "data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-3 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0"
  ])
  const separatorIconClass = computed<StyleClass>(() => [
    "split z-10 inset-y-0 flex items-center justify-center",
    separatorNotHoverOpacity.value ? "" : "transition-opacity duration-500 opacity-0",
    direction.value === "vertical" ? "rotate-90" : ""
  ])
  const classBase = computed<StyleClass>(() =>
    Split.setStyle([
      "h-full w-full",
      options?.class ?? "",
      props?.class ?? "",
      isStartResize.value ? getStyleCursor(activeCursorPanel.value) : "",
      "flex data-[direction=vertical]:flex-col overflow-hidden dark:text-gray-300 transition-all"
    ])
  )
  const classPanelBody = (panel: Panel) => Split.setStyle([panel.class, "relative overflow-hidden w-full"])
  const classSeparator = (panel: Panel) =>
    Split.setStyle([separatorClass.value, getStyleCursor(cursorPanels[panel.name]), "group"])
  const classSeparatorStrip = (panel: Panel) =>
    Split.setStyle([
      separatorIconClass.value,
      separatorNotHoverOpacity.value ? "" : resizablePanel.value === panel.name ? "opacity-100" : ""
    ])
  const classSeparatorStripStyle = ref(Split.setStyle("h-8 w-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full"))
  const classSeparatorIcon = (panel: Panel) =>
    Split.setStyle([
      separatorIconClass.value,
      separatorNotHoverOpacity.value ? "" : resizablePanel.value === panel.name ? "opacity-100" : "",
      "h-4 w-3 rounded-sm bg-neutral-300 dark:bg-neutral-600"
    ])
  const classSeparatorHexagonStyle = ref(Split.setStyle("h-2.5 w-2.5 bg-neutral-300 dark:bg-neutral-600"))
  const classSeparatorDisabled = ref(Split.setStyle([separatorClass.value, "group"]))
  // ---EXPOSE------------------------------
  defineExpose<SplitExpose>({
    // ---REF-LINK----------------------------
    resizableGroup,
    resizablePanels,
    // ---STATE-------------------------------
    sizePanels,
    cursorPanels,
    activeCursorPanel,
    // ---PROPS-------------------------
    units,
    panels,
    direction,
    separatorType,
    separatorNotHoverOpacity,
    styles,
    classBase
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Split.initStyle()
    setCursorPanels(panels.value)
    const defaultSize = getDefaultSize(panels.value)
    Object.assign(
      sizePanels,
      Object.fromEntries(
        new Map(panels.value.map((panel) => [panel.name, sizePanels[panel.name] ?? panel.size ?? defaultSize]))
      )
    )
    if (resizableGroup.value) {
      splitObserver.observe(resizableGroup.value as HTMLElement)
    }
  })
  // ---WATCHERS----------------------------
  watch(
    () => props.panels,
    (array) => {
      const defaultSize = getDefaultSize(panels.value)
      Object.assign(
        sizePanels,
        Object.fromEntries(new Map(array.map((panel) => [panel.name, panel.size ?? defaultSize])))
      )
    }
  )

  // ---METHODS-----------------------------
  function setItemRef(el: HTMLElement, namePanel: Panel["name"]) {
    resizablePanels.value[namePanel] = el
  }

  function setCursorPanels(array: SplitProps["panels"]) {
    Object.assign(
      cursorPanels,
      Object.fromEntries(new Map(array.map((panel) => [panel.name, cursorPanels[panel.name] ?? "center"])))
    )
  }

  function getDefaultSize(array: SplitProps["panels"]) {
    const fullSizeSplit =
      units.value === "pixels"
        ? direction.value === "horizontal"
          ? (resizableGroup.value?.offsetWidth ?? 0)
          : (resizableGroup.value?.offsetHeight ?? 0)
        : 100
    const totalDefinedSize = array.reduce((sum, panel) => sum + (panel?.size && panel?.size > 0 ? panel?.size : 0), 0)
    const countNotDefinedSize = array.reduce((sum, panel) => sum + (panel?.size && panel?.size > 0 ? 0 : 1), 0)
    return (fullSizeSplit - totalDefinedSize) / countNotDefinedSize
  }

  function getStyleCursor(cursor: CursorType) {
    switch (cursor) {
      case "center":
        return direction.value === "horizontal"
          ? "cursor-col-resize"
          : direction.value === "vertical"
            ? "cursor-row-resize"
            : ""
      case "right":
        return direction.value === "horizontal"
          ? "cursor-e-resize"
          : direction.value === "vertical"
            ? "cursor-s-resize"
            : ""
      case "left":
        return direction.value === "horizontal"
          ? "cursor-w-resize"
          : direction.value === "vertical"
            ? "cursor-n-resize"
            : ""
    }
  }

  // ---RESIZE-PANELS-----------------------
  function resizePanel($event: MouseEvent, namePanel: Panel["name"]) {
    if (!resizableGroup.value && !resizablePanels.value[namePanel]) return
    //------------------
    const getNewSize = (panel: Panel, oldSize: number, addedSize: number): number => {
      if (
        (typeof panel.maxSize === "number" && panel.maxSize > 0) ||
        (typeof panel.minSize === "number" && panel.minSize > 0)
      ) {
        if (oldSize + addedSize > (panel.maxSize as number)) {
          return panel.maxSize as number
        } else if (oldSize + addedSize < (panel.minSize as number)) {
          return panel.minSize as number
        }
      }
      if (oldSize + addedSize > 0) {
        return oldSize + addedSize
      }
      return 0
    }
    const updateAddedDistance = (panel: Panel, addedSize: number, oldSize: number): number => {
      if (
        (typeof panel.maxSize === "number" && panel.maxSize > 0) ||
        (typeof panel.minSize === "number" && panel.minSize > 0)
      ) {
        if (oldSize + addedSize > (panel.maxSize as number)) {
          return oldSize + addedSize - (panel.maxSize as number)
        } else if (oldSize + addedSize < (panel.minSize as number)) {
          return oldSize + addedSize - (panel.minSize as number)
        }
      }
      if (-addedSize - oldSize > 0) {
        return -(-addedSize - oldSize)
      }
      return 0
    }
    const addedDistanceToSum = (panel: Panel, added: number): number =>
      added > 0
        ? sizePanels[panel.name] - (panel?.minSize ?? 0)
        : (sizePanels[panel.name] - (panel?.maxSize ?? 0)) * (panel?.maxSize ? -1 : 1)
    const setAddedDistance = (added: number, sum: number, oppositeSum: number, realSum: number): number =>
      added > 0
        ? added > sum
          ? sum > oppositeSum
            ? oppositeSum
            : sum
          : added > oppositeSum
            ? oppositeSum > 0
              ? oppositeSum
              : added
            : added
        : -added > sum
          ? sum > 0
            ? -sum
            : realSum === sum
              ? added
              : -sum
          : added
    //------------------
    const group = resizableGroup.value?.getBoundingClientRect()
    const panel = resizablePanels.value[namePanel]?.getBoundingClientRect()
    const indexNamePanel = panels.value.findIndex((item) => item.name === namePanel)
    //------------------
    let addedDistance =
      direction.value === "horizontal"
        ? $event.clientX - panel.x - panel.width
        : $event.clientY - panel.y - panel.height
    addedDistance = units.value === "percentages" ? addedDistance / ((group?.width ?? 0) / 100) : addedDistance
    //------------------
    let rightAddedDistance = addedDistance * -1
    let leftAddedDistance = addedDistance
    //------------------
    let sumLeftPanels = 0
    let indexLastLeft = 0
    for (let i = indexNamePanel; i >= 0; i--) {
      if (panels.value[i].disabled) break
      sumLeftPanels += addedDistanceToSum(panels.value[i], rightAddedDistance)
      indexLastLeft = i
    }
    let sumRightPanels = 0
    let indexRightLeft = panels.value.length - 1
    for (let i = indexNamePanel + 1; i < panels.value.length; i++) {
      if (panels.value[i].disabled) break
      sumRightPanels += addedDistanceToSum(panels.value[i], leftAddedDistance)
      indexRightLeft = i
    }
    //------------------
    rightAddedDistance = setAddedDistance(
      rightAddedDistance,
      sumLeftPanels,
      sumRightPanels,
      sizePanels[panels.value[indexLastLeft].name]
    )
    leftAddedDistance = setAddedDistance(
      leftAddedDistance,
      sumRightPanels,
      sumLeftPanels,
      sizePanels[panels.value[indexRightLeft].name]
    )
    //------------------
    if (rightAddedDistance === 0) {
      cursorPanels[namePanel] = addedDistance < 0 ? "right" : addedDistance > 0 ? "left" : "center"
    } else if (leftAddedDistance === 0) {
      cursorPanels[namePanel] = addedDistance > 0 ? "left" : addedDistance < 0 ? "right" : "center"
    } else {
      cursorPanels[namePanel] = "center"
    }
    activeCursorPanel.value = cursorPanels[namePanel]
    //------------------
    for (let i = indexNamePanel + 1; i < panels.value.length; i++) {
      if (panels.value[i]?.disabled || panels.value[i - 1]?.disabled) break
      if (rightAddedDistance < 0 && sizePanels[panels.value[i].name] === (panels.value[i]?.minSize ?? 0)) continue
      const oldSize = sizePanels[panels.value[i].name]
      sizePanels[panels.value[i].name] = getNewSize(panels.value[i], oldSize, rightAddedDistance)
      rightAddedDistance = updateAddedDistance(panels.value[i], rightAddedDistance, oldSize)
      if (rightAddedDistance === 0) break
    }
    //------------------
    for (let i = indexNamePanel; i >= 0; i--) {
      if (panels.value[i]?.disabled || panels.value[i + 1]?.disabled) break
      if (leftAddedDistance < 0 && sizePanels[panels.value[i].name] === (panels.value[i]?.minSize ?? 0)) continue
      const oldSize = sizePanels[panels.value[i].name]
      sizePanels[panels.value[i].name] = getNewSize(panels.value[i], oldSize, leftAddedDistance)
      leftAddedDistance = updateAddedDistance(panels.value[i], leftAddedDistance, oldSize)
      if (leftAddedDistance === 0) break
    }
  }

  // ---ON-RESIZE-OBSERVER------------------
  const splitObserver = new ResizeObserver(() => {
    const defaultSize = getDefaultSize(panels.value)
    Object.assign(
      sizePanels,
      Object.fromEntries(
        new Map(panels.value.map((panel) => [panel.name, sizePanels[panel.name] ?? panel.size ?? defaultSize]))
      )
    )
  })
  // ---ON-RESIZE-PANELS--------------------
  const resizablePanel = ref<Panel["name"] | null>(null)
  const isStartResize = ref<boolean>(false)
  const isStartMove = ref<boolean>(false)

  function moveResizedPanels(ev: MouseEvent) {
    panels.value.find((panel) => panel.name === resizablePanel.value)
    resizePanel(ev, resizablePanel.value ?? "")
    emit("updated-panels", sizePanels)
    emit("updated-size-panel", sizePanels[resizablePanel.value ?? ""], resizablePanel.value ?? "")
  }

  function startResizePanel($event: MouseEvent, namePanel: Panel["name"]) {
    if ($event.stopPropagation) $event.stopPropagation()
    if ($event.preventDefault) $event.preventDefault()
    resizablePanel.value = namePanel
    isStartResize.value = true
    document.body.classList.add(getStyleCursor(activeCursorPanel.value))
    window.addEventListener("mousemove", moveResizedPanels)
    window.addEventListener("mouseup", stopResizePanel)
    emit("start-resize-panel", $event, namePanel)
  }

  function stopResizePanel($event: MouseEvent, namePanel?: Panel["name"]) {
    isStartResize.value = false
    if (!isStartMove.value) {
      resizablePanel.value = null
    }
    document.body.classList.remove(getStyleCursor(activeCursorPanel.value))
    window.removeEventListener("mousemove", moveResizedPanels)
    window.removeEventListener("mouseup", stopResizePanel)
    emit("stop-resize-panel", $event, namePanel as Panel["name"])
  }

  function moveResizePanel($event: MouseEvent, namePanel: Panel["name"]) {
    isStartMove.value = true
    if (!isStartResize.value) resizablePanel.value = namePanel
    emit("move-resize-panel", $event, namePanel)
  }

  function outResizePanel($event: MouseEvent, namePanel: Panel["name"]) {
    isStartMove.value = false
    if (!isStartResize.value) resizablePanel.value = null
    emit("out-resize-panel", $event, namePanel)
  }

  watch(activeCursorPanel, (value, oldValue) => {
    document.body.classList.remove(getStyleCursor(oldValue))
    document.body.classList.add(getStyleCursor(value))
  })
</script>

<template>
  <div
    ref="resizableGroup"
    :class="classBase"
    :data-direction="direction"
    :data-name="props.autoSaveName ?? null"
    :data-units="units ?? null">
    <template v-for="(panel, key) in panels" :key="key">
      <div
        :ref="(el) => setItemRef(el as HTMLElement, panel.name)"
        :class="classPanelBody(panel)"
        :data-name="panel.name"
        :data-size="sizePanels[panel.name]"
        :style="`flex: ${units === 'percentages' ? sizePanels[panel.name] : '0'} 1 ${units === 'pixels' ? sizePanels[panel.name] + 'px' : '0px'}`">
        <slot :name="panel.name" :size="sizePanels[panel.name]" :panel="panel" />
      </div>
      <div
        v-if="!(panel.disabled || panels[key + 1]?.disabled) && key !== panels?.length - 1"
        role="separator"
        tabindex="0"
        :class="classSeparator(panel)"
        :data-direction="direction"
        :data-unit="units"
        :data-now="sizePanels[panel.name]"
        :data-max="panel.maxSize"
        :data-min="panel.minSize"
        :aria-valuenow="sizePanels[panel.name]"
        :aria-valuemax="panel.maxSize"
        :aria-valuemin="panel.minSize"
        data-panel-resize-handle-enabled="true"
        @mousemove="moveResizePanel($event, panel.name)"
        @mouseout="outResizePanel($event, panel.name)"
        @mousedown="startResizePanel($event, panel.name)"
        @mouseup="stopResizePanel($event, panel.name)">
        <div v-if="separatorType === 'strip'" :class="classSeparatorStrip(panel)">
          <div :class="classSeparatorStripStyle"></div>
        </div>
        <div v-else :class="classSeparatorIcon(panel)">
          <svg
            v-if="separatorType === 'hexagon'"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            :class="classSeparatorHexagonStyle">
            <path
              d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"></path>
          </svg>
          <Icons
            v-else
            :type="separatorType"
            :class="['h-2.5 w-2.5 text-gray-500', direction === 'vertical' ? 'rotate-90' : '']" />
        </div>
      </div>
      <div v-else-if="key !== panels?.length - 1" role="separator" :class="classSeparatorDisabled" />
    </template>
  </div>
</template>
