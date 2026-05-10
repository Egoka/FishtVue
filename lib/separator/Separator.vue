<script setup lang="ts">
  import { computed, onMounted, useSlots } from "vue"
  import type { SeparatorProps } from "./Separator"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Separator = new Component<"Separator">()
  const options = Separator.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<SeparatorProps>(), {
    gradient: undefined
  })
  const slots = useSlots()
  // ---PROPS-------------------------------
  const vertical = computed<NonNullable<SeparatorProps["vertical"]>>(() => props.vertical)
  const content = computed<NonNullable<SeparatorProps["contentPosition"]>>(
    () => props.contentPosition ?? options?.contentPosition ?? "center"
  )
  const gradient = computed<number>(() => {
    let gradient = props?.gradient ?? options?.gradient
    if (typeof gradient === "boolean") return gradient ? 20 : 0
    else if (typeof gradient === "number") {
      if (gradient >= 100) return 90
      return gradient
    } else if (Array.isArray(gradient)) {
      if (gradient[0] >= 100) return 90
      return gradient[0]
    } else return 0
  })
  const gradientLength = computed<number>(() => {
    let gradient = props?.gradient ?? options?.gradient
    if (typeof gradient === "boolean") return gradient ? 20 + 10 : 0
    else if (typeof gradient === "number") {
      if (gradient >= 100) return 100
      return gradient + 10
    } else if (Array.isArray(gradient)) {
      if (gradient[0] >= 100) return 95
      if (gradient[0] > gradient[1]) return gradient[0] + 10
      if (gradient[1] >= 100) return 95
      return gradient[1]
    } else return 0
  })
  const depth = computed<NonNullable<SeparatorProps["depth"]>>(() => {
    const depth = (props?.depth as SeparatorProps["depth"]) ?? options?.depth ?? 1
    return depth && depth <= 7 ? depth : 1
  })
  const classBase = computed<SeparatorProps["class"]>(() =>
    Separator.setStyle([
      "w-auto justify-center",
      vertical.value ? "flex-col h-full" : "",
      options?.class ?? "",
      props?.class ?? "",
      "relative flex"
    ])
  )
  const classBodyLineLeft = computed<StyleClass>(() =>
    Separator.setStyle([
      "items-center w-full",
      options?.classBodyLine ?? "",
      props?.classBodyLine ?? "",
      options?.classBodyLineLeft ?? "",
      props?.classBodyLineLeft ?? "",
      vertical.value ? "h-full justify-center" : "",
      "relative flex"
    ])
  )
  const classLineLeft = computed<StyleClass>(() =>
    Separator.setStyle([
      gradient.value ? (vertical.value ? "bg-gradient-to-b" : "bg-gradient-to-r") : "",
      "from-transparent via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800",
      "bg-neutral-200 dark:bg-neutral-800",
      "rounded-l-[2px]",
      options?.classLine ?? "",
      props?.classLine ?? "",
      options?.classLineLeft ?? "",
      props?.classLineLeft ?? ""
    ])
  )
  const classContent = computed<StyleClass>(() =>
    Separator.setStyle([
      "min-w-max text-sm text-gray-500",
      slots?.default ? "mx-1" : "",
      options?.classContent ?? "",
      props?.classContent ?? "",
      "relative"
    ])
  )
  const classBodyLineRight = computed<StyleClass>(() =>
    Separator.setStyle([
      "items-center w-full",
      options?.classBodyLine ?? "",
      props?.classBodyLine ?? "",
      options?.classBodyLineRight ?? "",
      props?.classBodyLineRight ?? "",
      vertical?.value ? "h-full justify-center" : "",
      "relative flex"
    ])
  )
  const classLineRight = computed<StyleClass>(() =>
    Separator.setStyle([
      gradient.value ? (vertical.value ? "bg-gradient-to-t" : "bg-gradient-to-l") : "",
      "from-transparent via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800",
      "bg-neutral-200 dark:bg-neutral-800",
      "rounded-r-[2px]",
      options?.classLine ?? "",
      props?.classLine ?? "",
      options?.classLineRight ?? "",
      props?.classLineRight ?? ""
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    vertical,
    content,
    gradient,
    gradientLength,
    depth,
    classBase,
    classBodyLineLeft,
    classLineLeft,
    classContent,
    classBodyLineRight,
    classLineRight
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Separator.initStyle()
  })
</script>

<template>
  <div data-separator :class="classBase">
    <div v-if="!['left', 'full'].includes(content)" data-separator-left :class="classBodyLineLeft" aria-hidden="true">
      <div
        :class="classLineLeft"
        :style="[
          vertical ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--fv-gradient-from-position: ${gradient}%;--fv-gradient-via-position: ${gradient > 0 ? gradientLength : 0}%`
        ]" />
    </div>
    <span v-if="slots?.default" data-separator-content :class="classContent"><slot /></span>
    <div
      v-if="!['right', 'full'].includes(content)"
      data-separator-right
      :class="classBodyLineRight"
      aria-hidden="true">
      <div
        :class="classLineRight"
        :style="[
          vertical ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--fv-gradient-from-position: ${gradient}%;--fv-gradient-via-position: ${gradient > 0 ? gradientLength : 0}%`
        ]" />
    </div>
  </div>
</template>
