<script setup lang="ts">
  import { computed } from "vue"
  import type { BadgeClassKey, BadgeEmits, BadgeProps } from "./Badge"
  import Icons from "fishtvue/icons/Icons.vue"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import { cn } from "fishtvue/utils/tailwindHandler"
  // ---BASE-COMPONENT----------------------
  const Badge = new Component<"Badge">()
  const options = Badge.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  // Каждый optional boolean — `undefined` (dev-patterns §2 F): иначе слой componentsOptions недостижим.
  const props = withDefaults(defineProps<BadgeProps>(), {
    point: undefined,
    closeButton: undefined
  })
  const emit = defineEmits<BadgeEmits>()
  const { cls, raw } = Badge.resolveClasses<BadgeClassKey>(props)
  // ---PROPS-------------------------------
  const componentsStyleVariant = computed<NonNullable<BadgeProps["variant"]> | undefined>(() => {
    const cs = Badge.componentsStyle()
    return cs === "filled" ? "primary" : cs === "outlined" ? "outline" : cs === "underlined" ? "neutral" : undefined
  })
  const variant = computed<NonNullable<BadgeProps["variant"]>>(
    () => props.variant ?? options?.variant ?? componentsStyleVariant.value ?? "primary"
  )
  const isPoint = computed<NonNullable<BadgeProps["point"]>>(() => props.point ?? options?.point ?? false)
  const isButton = computed<NonNullable<BadgeProps["closeButton"]>>(
    () => props.closeButton ?? options?.closeButton ?? false
  )
  const variantStyle = computed<string>(() =>
    variant.value === "primary"
      ? "bg-theme-600 text-theme-100 dark:bg-theme-700 dark:text-theme-100"
      : variant.value === "secondary"
        ? "bg-theme-100 text-theme-900 dark:bg-theme-950 dark:text-theme-100"
        : variant.value === "neutral"
          ? "ring-1 ring-inset"
          : variant.value === "outline"
            ? !isPoint.value && !isButton.value
              ? "ring-1 ring-inset bg-theme-50 dark:bg-theme-900 text-theme-600 dark:text-theme-400 ring-theme-500/10"
              : "ring-1 ring-inset text-surface-600 dark:text-surface-200 ring-surface-300 dark:ring-surface-700"
            : ""
  )
  // fill-цвета иконок наследуют вариант badge — общий сегмент для point-svg и иконки close-кнопки.
  const fillVariant = computed<string[]>(() => {
    const arrayClasses: string[] = []
    !(variant.value === "primary") || arrayClasses.push("fill-theme-100 dark:fill-theme-300")
    !(variant.value === "secondary") || arrayClasses.push("fill-theme-600 dark:fill-theme-300")
    !(variant.value === "outline") || arrayClasses.push("fill-theme-500 dark:fill-theme-600")
    return arrayClasses
  })
  // Корень: база → variant → state → options.classes.root → props.classes.root → options.class → props.class
  // (dev-patterns §2 D).
  const classBase = computed(() =>
    cls(
      "root",
      // Issue 6 (B10): forced-colors:outline сохраняет badge видимым в Windows high-contrast (bg-* там сбрасывается)
      "items-center w-max h-max m-[2px] px-2 py-1 text-xs font-medium rounded-md forced-colors:outline",
      (isPoint.value || isButton.value) && "gap-x-[2px]",
      // Issue 6 (F31): логические ps/pe (padding-inline-*) авто-флипают отступ point/close-кнопки в RTL
      isPoint.value && isButton.value
        ? "px-1"
        : isPoint.value && !isButton.value
          ? "ps-1"
          : !isPoint.value && isButton.value
            ? "pe-1"
            : "",
      variantStyle.value,
      "inline-flex"
    )
  )
  const classContent = computed(() => cls("content"))
  const classPoint = computed(() => cls("point", "h-1.5 w-1.5 mx-1", fillVariant.value))
  // Hand-off в корень `Button` (`:class` ребёнка = его корень) — без setStyle-префикса.
  const classClose = computed(() => cn("m-0 rounded-[5px] h-4 w-4 px-0", raw("close")))
  // Иконка внутри close-кнопки наследует fill варианта: собственного ключа у неё нет —
  // адресуется через `classes.close` у самой кнопки (Button отдаёт иконке свой `classes.icon`).
  const classCloseIcon = computed(() => Badge.setStyle(["h-4 w-4", fillVariant.value]))
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    variant,
    isPoint,
    isCloseButton: isButton,
    classBase,
    classContent,
    // ---METHODS-----------------------
    deleteBadge
  })
  // ---METHODS-----------------------------
  function deleteBadge() {
    // Дублирующий emit "delete" снят в major 2026-09-06 (решение R7): два события на одно
    // действие заставляли потребителя гадать, на какое подписываться, а библиотеку — эмитить оба.
    emit("close")
  }
</script>

<template>
  <div :class="classBase" data-badge>
    <svg v-if="isPoint" data-badge-point :class="classPoint" viewBox="0 0 6 6" aria-hidden="true">
      <circle cx="3" cy="3" r="3"></circle>
    </svg>
    <div data-badge-content :class="classContent">
      <slot />
    </div>
    <Button v-if="isButton" data-badge-close variant="ghost" :class="classClose" @click="deleteBadge">
      <Icons type="XMark" :class="classCloseIcon" />
    </Button>
  </div>
</template>
