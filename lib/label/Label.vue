<script setup lang="ts">
  import { computed, onMounted } from "vue"
  import type { LabelProps, LabelExpose } from "./Label"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Label = new Component<"Label">()
  const options = Label.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<LabelProps>()
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<LabelProps["mode"]>>(
    () => props?.mode ?? options?.mode ?? Label.componentsStyle() ?? "outlined"
  )
  const type = computed<NonNullable<LabelProps["type"]>>(() => props?.type ?? options?.type ?? "dynamic")
  const translateX = computed<NonNullable<LabelProps["translateX"]>>(
    () => props?.translateX ?? options?.translateX ?? 0
  )
  const maxWidth = computed<NonNullable<LabelProps["maxWidth"]>>(() => props?.maxWidth ?? options?.maxWidth ?? 0)
  const background = computed(() => {
    switch (mode.value) {
      case "outlined":
        return "from-white dark:from-neutral-950 from-50% to-transparent to-55%"
      case "underlined":
        return "from-stone-50 dark:from-stone-950 from-50% to-transparent to-55%"
      case "filled":
        return "from-stone-100 dark:from-stone-900 from-50% to-transparent to-55%"
      default:
        return ""
    }
  })
  const classBase = computed(() =>
    Label.setStyle([
      "absolute top-[38px] flex pointer-events-none select-none h-5 rounded-md transition-transform duration-200 px-1",
      type.value === "dynamic" ? `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` : "",
      type.value === "offsetDynamic"
        ? `peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7 bg-gradient-to-t ${background.value}`
        : "",
      type.value === "offsetStatic"
        ? `-translate-y-[48px] translate-x-4 bg-gradient-to-t ${background.value} from-50% to-transparent to-55%`
        : "",
      type.value === "static" ? "-translate-y-[60px] translate-x-4" : "",
      type.value === "vanishing" ? `-translate-y-[28px]` : "",
      type.value === "none" ? "opacity-0 -translate-y-[28px] translate-x-8" : "",
      props.isRequired ? `after:content-['*'] after:text-red-500 after:dark:text-red-800 after:ml-1` : "",
      options?.classBody ?? "",
      props.classBody ?? ""
    ])
  )
  const classContent = computed(() =>
    Label.setStyle([
      "block text-sm font-medium text-gray-400 dark:text-gray-500 truncate",
      options?.class ?? "",
      props?.class ?? ""
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose<LabelExpose>({
    // ---PROPS-------------------------
    mode,
    type,
    classBase,
    classContent
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => Label.initStyle())
</script>

<template>
  <div :class="classBase" :style="type !== 'none' ? `--tw-translate-x: ${translateX}px;` : ''">
    <span :class="classContent" :style="`max-width: ${maxWidth - 38}px`">
      {{ props.title }}
    </span>
  </div>
</template>
