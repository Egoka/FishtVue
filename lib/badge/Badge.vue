<script setup lang="ts">
  import { computed, onMounted } from "vue"
  import type { BadgeProps, BadgeEmits, BadgeExpose } from "./Badge"
  import Icons from "fishtvue/icons/Icons.vue"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Badge = new Component<"Badge">()
  const options = Badge.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<BadgeProps>()
  const emit = defineEmits<BadgeEmits>()
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<BadgeProps["mode"]>>(() => props.mode ?? options?.mode ?? "primary")
  const isPoint = computed<BadgeProps["point"]>(() => props.point || options?.point)
  const isButton = computed<BadgeProps["closeButton"]>(() => props.closeButton || options?.closeButton)
  const modeStyle = computed<string>(() =>
    mode.value === "primary"
      ? "bg-theme-600 text-theme-100 dark:bg-theme-700 dark:text-theme-100"
      : mode.value === "secondary"
        ? "bg-theme-100 text-theme-900 dark:bg-theme-950 dark:text-theme-100"
        : mode.value === "neutral"
          ? "ring-1 ring-inset"
          : mode.value === "outline"
            ? !isPoint.value && !isButton.value
              ? "ring-1 ring-inset bg-theme-50 dark:bg-theme-900 text-theme-600 dark:text-theme-400 ring-theme-500/10"
              : "ring-1 ring-inset text-neutral-600 dark:text-neutral-200 ring-neutral-500/30"
            : ""
  )
  const classBadgeContent = computed<BadgeProps["classContent"]>(() => {
    const arrayClasses: string[] = []
    !(mode.value === "primary") || arrayClasses.push("fill-theme-100 dark:fill-theme-300")
    !(mode.value === "secondary") || arrayClasses.push("fill-theme-600 dark:fill-theme-300")
    !(mode.value === "outline") || arrayClasses.push("fill-theme-500 dark:fill-theme-600")
    !(mode.value === "neutral") || arrayClasses.push((props.classContent ?? options?.classContent) as string)
    return arrayClasses
  })
  const classBase = computed(() =>
    Badge.setStyle([
      "items-center m-[2px] px-2 py-1 text-xs font-medium rounded-md",
      isPoint.value || isButton ? "gap-x-[2px]" : "",
      isPoint.value && isButton
        ? "px-1"
        : isPoint.value && !isButton.value
          ? "pl-1"
          : !isPoint.value && isButton.value
            ? "pr-1"
            : "",
      modeStyle.value,
      options?.class ?? "",
      props.class,
      "inline-flex"
    ])
  )
  const classIcon = computed(() => Badge.setStyle(["h-1.5 w-1.5 mx-1", classBadgeContent.value]))
  const classButtonIcon = computed(() => Badge.setStyle(["h-4 w-4", classBadgeContent.value]))
  // ---EXPOSE------------------------------
  defineExpose<BadgeExpose>({
    // ---PROPS-------------------------
    mode,
    isPoint,
    isCloseButton: isButton,
    // ---METHODS-----------------------
    deleteBadge
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Badge.initStyle()
  })

  // ---METHODS-----------------------------
  function deleteBadge() {
    emit("delete")
  }
</script>

<template>
  <div :class="classBase">
    <svg v-if="isPoint" :class="classIcon" viewBox="0 0 6 6" aria-hidden="true">
      <circle cx="3" cy="3" r="3"></circle>
    </svg>
    <slot />
    <Button v-if="isButton" mode="ghost" class="m-0 rounded-[5px] h-4 w-4 px-0" @click="deleteBadge">
      <Icons type="XMark" :class="classButtonIcon" />
    </Button>
  </div>
</template>
