<script setup lang="ts">
  import { computed, useSlots } from "vue"
  import type { SeparatorClassKey, SeparatorProps } from "./Separator"
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
  // Пары ключей `["segment", "segmentStart"]` — «общий → частный»: оба сегмента получают `segment`,
  // затем конкретный ключ, поэтому при конфликте twMerge отдаёт победу частному.
  const { cls } = Separator.resolveClasses<SeparatorClassKey>(props)
  // ---PROPS-------------------------------
  // Ориентация: строковый prop вместо булева `vertical` (T2 редизайна props 1.0). Неизвестное
  // значение сводится к "horizontal" — дефолту, а не к пустой разметке (решение R6).
  const orientation = computed<NonNullable<SeparatorProps["orientation"]>>(() =>
    (props.orientation ?? options?.orientation) === "vertical" ? "vertical" : "horizontal"
  )
  const isVertical = computed<boolean>(() => orientation.value === "vertical")
  // Issue 3 / F31: logical start/end. RTL-корректность порядка сегментов обеспечивается тем,
  // что корень — flex, и его main-axis следует document direction; отдельный CSS или
  // `useDirectionality()` не нужен (зеркало Button Issue 3).
  // Физические алиасы "left"/"right" сняты в major 2026-09-06 (решение R7); неизвестное значение
  // сводится к "center" — дефолту, а не к пустой разметке.
  const content = computed<"start" | "end" | "center" | "full">(() => {
    const raw = props.contentPosition ?? options?.contentPosition ?? "center"
    return raw === "start" || raw === "end" || raw === "full" ? raw : "center"
  })
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
  // Корень: база → orientation → options.classes.root → props.classes.root → options.class → props.class
  // (dev-patterns §2 D).
  const classBase = computed<StyleClass>(() =>
    cls("root", "w-auto justify-center", isVertical.value && "flex-col h-full", "relative flex")
  )
  // Сегмент = обёртка линии. Общий ключ `segment` применяется к обоим, `segmentStart`/`segmentEnd` —
  // к конкретному (оба сегмента получают их после общего, поэтому частный ключ выигрывает twMerge).
  const classSegmentStart = computed<StyleClass>(() =>
    cls(
      ["segment", "segmentStart"],
      "items-center w-full",
      isVertical.value && "h-full justify-center",
      "relative flex"
    )
  )
  const classSegmentEnd = computed<StyleClass>(() =>
    cls(["segment", "segmentEnd"], "items-center w-full", isVertical.value && "h-full justify-center", "relative flex")
  )
  const lineBase = computed<Array<string>>(() => [
    gradient.value ? (isVertical.value ? "bg-gradient-to-b" : "bg-gradient-to-r rtl:bg-gradient-to-l") : "",
    "from-transparent via-surface-200 dark:via-surface-800 to-surface-200 dark:to-surface-800",
    "bg-surface-200 dark:bg-surface-800"
  ])
  const classLineStart = computed<StyleClass>(() => cls(["line", "lineStart"], lineBase.value, "rounded-l-[2px]"))
  const classLineEnd = computed<StyleClass>(() =>
    cls(
      ["line", "lineEnd"],
      gradient.value ? (isVertical.value ? "bg-gradient-to-t" : "bg-gradient-to-l rtl:bg-gradient-to-r") : "",
      "from-transparent via-surface-200 dark:via-surface-800 to-surface-200 dark:to-surface-800",
      "bg-surface-200 dark:bg-surface-800",
      "rounded-r-[2px]"
    )
  )
  const classContent = computed<StyleClass>(() =>
    cls("content", "min-w-max text-sm text-surface-500", !!slots?.default && "mx-1", "relative")
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    orientation,
    content,
    gradient,
    gradientLength,
    depth,
    classBase,
    classSegmentStart,
    classLineStart,
    classContent,
    classSegmentEnd,
    classLineEnd
  })
  // ---MOUNT-UNMOUNT-----------------------
  // `Separator.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:88-92).
</script>

<template>
  <div data-separator role="separator" :aria-orientation="orientation" :class="classBase">
    <div v-if="!['start', 'full'].includes(content)" data-separator-start :class="classSegmentStart" aria-hidden="true">
      <div
        data-separator-line
        :class="classLineStart"
        :style="[
          orientation === 'vertical' ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--fv-gradient-from-position: ${gradient}%;--fv-gradient-via-position: ${gradient > 0 ? gradientLength : 0}%`
        ]" />
    </div>
    <span v-if="slots?.default" data-separator-content :class="classContent"><slot /></span>
    <div v-if="!['end', 'full'].includes(content)" data-separator-end :class="classSegmentEnd" aria-hidden="true">
      <div
        data-separator-line
        :class="classLineEnd"
        :style="[
          orientation === 'vertical' ? `height: 100%;width: ${depth}px;` : `width: 100%;height: ${depth}px;`,
          `--fv-gradient-from-position: ${gradient}%;--fv-gradient-via-position: ${gradient > 0 ? gradientLength : 0}%`
        ]" />
    </div>
  </div>
</template>
