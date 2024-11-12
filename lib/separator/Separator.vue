<script setup lang="ts">
  import { computed, onMounted, useSlots } from "vue"
  import type { SeparatorProps, SeparatorExpose } from "./Separator"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Separator = new Component<"Separator">()
  const options = Separator.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<SeparatorProps>()
  const slots = useSlots()
  // ---PROPS-------------------------------
  const vertical = computed<NonNullable<SeparatorProps["vertical"]>>(() => props.vertical)
  const content = computed<NonNullable<SeparatorProps["content"]>>(() => props.content ?? options?.content ?? "center")
  const gradient = computed<number>(() => {
    let gradient = props.gradient ?? options?.gradient
    if (Array.isArray(gradient)) gradient = gradient[0]
    return typeof gradient === "boolean" ? 20 : gradient && gradient > 0 && gradient <= 100 ? +gradient : 0
  })
  const gradientLength = computed<number>(() => {
    const gradient = props.gradient ?? options?.gradient
    return Array.isArray(gradient) ? gradient[1] : 30
  })
  const depth = computed<NonNullable<SeparatorProps["depth"]>>(() => {
    const depth = props?.depth ?? options?.depth
    return depth && depth <= 7 ? depth : 1
  })
  const classBase = computed<SeparatorProps["class"]>(() =>
    Separator.setStyle([
      "justify-center",
      options?.class ?? "",
      props.class ?? "",
      vertical.value ? "flex-col h-full" : "",
      "relative flex"
    ])
  )
  const classBodyLineLeft = computed<StyleClass>(() =>
    Separator.setStyle([
      "items-center w-full",
      options?.classBodyLine ?? "",
      props.classBodyLine ?? "",
      options?.classBodyLineLeft ?? "",
      props.classBodyLineLeft ?? "",
      vertical.value ? "h-full justify-center" : "",
      "relative flex"
    ])
  )
  const classLineLeft = computed<StyleClass>(() =>
    Separator.setStyle([
      vertical.value ? "bg-gradient-to-b" : "bg-gradient-to-r",
      "from-transparent via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800",
      options?.classLine ?? "",
      props.classLine ?? "",
      options?.classLineLeft ?? "",
      props.classLineLeft ?? ""
    ])
  )
  const classContent = computed<StyleClass>(() =>
    Separator.setStyle([
      "min-w-max text-sm text-gray-500",
      slots?.default ? "mx-1" : "",
      options?.classContent ?? "",
      props.classContent ?? "",
      "relative"
    ])
  )
  const classBodyLineRight = computed<StyleClass>(() =>
    Separator.setStyle([
      "items-center w-full",
      options?.classBodyLine ?? "",
      props.classBodyLine ?? "",
      options?.classBodyLineRight ?? "",
      props.classBodyLineRight ?? "",
      vertical.value ? "h-full justify-center" : "",
      "relative flex"
    ])
  )
  const classLineRight = computed<StyleClass>(() =>
    Separator.setStyle([
      vertical.value ? "bg-gradient-to-t" : "bg-gradient-to-l",
      "from-transparent via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800",
      options?.classLine ?? "",
      props.classLine ?? "",
      options?.classLineRight ?? "",
      props.classLineRight ?? ""
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose<SeparatorExpose>({
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
  <div :class="classBase">
    <div v-if="!['left', 'full'].includes(content)" :class="classBodyLineLeft" aria-hidden="true">
      <div
        :class="classLineLeft"
        :style="[
          vertical ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--tw-gradient-from-position: ${gradient}%;--tw-gradient-via-position: ${gradient > 0 ? gradient + gradientLength : 0}%`
        ]" />
    </div>
    <span v-if="slots?.default" :class="classContent"><slot /></span>
    <div v-if="!['right', 'full'].includes(content)" :class="classBodyLineRight" aria-hidden="true">
      <div
        :class="classLineRight"
        :style="[
          vertical ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--tw-gradient-from-position: ${gradient}%;--tw-gradient-via-position: ${gradient > 0 ? gradient + gradientLength : 0}%`
        ]" />
    </div>
  </div>
</template>
