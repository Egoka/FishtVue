<script setup lang="ts">
  import { computed } from "vue"
  import type { LabelProps } from "./Label"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Label = new Component<"Label">()
  const options = Label.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<LabelProps>(), {
    isRequired: undefined,
    animate: true
  })
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<LabelProps["mode"]>>(
    () => (props?.mode as LabelProps["mode"]) ?? options?.mode ?? Label.componentsStyle() ?? "outlined"
  )
  const type = computed<NonNullable<LabelProps["type"]>>(
    () => (props?.type as LabelProps["type"]) ?? options?.type ?? "dynamic"
  )
  const translateX = computed<NonNullable<LabelProps["translateX"]>>(
    () => (props?.translateX as LabelProps["translateX"]) ?? options?.translateX ?? 0
  )
  const maxWidth = computed<NonNullable<LabelProps["maxWidth"]>>(
    () => (props?.maxWidth as LabelProps["maxWidth"]) ?? options?.maxWidth ?? 0
  )
  const translateXStyle = computed(() => {
    if (type.value === "none") return ""
    const v = translateX.value
    return `--fv-translate-x: ${typeof v === "number" ? `${v}px` : v};`
  })
  const maxWidthStyle = computed(() => {
    const v = maxWidth.value
    return typeof v === "number" ? `max-width: ${v - 38}px` : `max-width: calc(${v} - 38px)`
  })
  const classBase = computed(() =>
    Label.setStyle([
      "absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5",
      // transition позиционирования гейтится `animate` (InputLayout даёт mount-tick isTick) —
      // иначе на первом кадре лейбл «переезжает» из исходной точки в финальную.
      props.animate ? "motion-safe:transition-all motion-safe:duration-200" : "",
      "px-1",
      type.value === "dynamic" ? `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` : "",
      type.value === "offsetDynamic" ? `peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7` : "",
      type.value === "offsetStatic" ? `-translate-y-[48px] translate-x-4` : "",
      type.value === "static" ? "-translate-y-[60px] translate-x-4" : "",
      type.value === "vanishing" ? `-translate-y-[28px]` : "",
      type.value === "none" ? "opacity-0 -translate-y-[28px] translate-x-8" : "",
      props.isRequired
        ? `after:content-['*'] after:relative after:-top-[10px] after:text-red-500 after:dark:text-red-800 after:ml-0.5`
        : "",
      options?.classBody ?? "",
      props.classBody ?? ""
    ])
  )
  const classContent = computed(() =>
    Label.setStyle([
      "relative -top-[10px] h-max block text-sm font-medium text-surface-400 dark:text-surface-500 truncate z-10",
      options?.class ?? "",
      props?.class ?? ""
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    mode,
    type,
    classBase,
    classContent
  })
  // Style injection wired up via Component.__hooks() in the base class
  // (onServerPrefetch + vueOnMounted -> initStyle). No explicit onMounted
  // call here — see Documentation/dev-patterns.md §2 decision row 1.
</script>

<template>
  <label data-label :for="props.forId || undefined" :class="classBase" :style="translateXStyle">
    <span :class="classContent" :style="maxWidthStyle">
      <slot>{{ props.title }}</slot>
    </span>
  </label>
</template>
