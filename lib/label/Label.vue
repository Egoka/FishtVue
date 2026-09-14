<script setup lang="ts">
  import { computed } from "vue"
  import type { LabelClassKey, LabelProps } from "./Label"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Label = new Component<"Label">()
  const options = Label.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  // Каждый optional boolean — `undefined`: иначе Vue кастует отсутствующий prop в `false`,
  // и default `true` у `animated` был бы недостижим (dev-patterns §2 F).
  const props = withDefaults(defineProps<LabelProps>(), {
    required: undefined,
    animated: undefined
  })
  const { cls } = Label.resolveClasses<LabelClassKey>(props)
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<LabelProps["mode"]>>(
    () => (props?.mode as LabelProps["mode"]) ?? options?.mode ?? Label.componentsStyle() ?? "outlined"
  )
  const labelMode = computed<NonNullable<LabelProps["labelMode"]>>(
    () => (props?.labelMode as LabelProps["labelMode"]) ?? options?.labelMode ?? "dynamic"
  )
  const translateX = computed<NonNullable<LabelProps["translateX"]>>(
    () => (props?.translateX as LabelProps["translateX"]) ?? options?.translateX ?? 0
  )
  const maxWidth = computed<NonNullable<LabelProps["maxWidth"]>>(
    () => (props?.maxWidth as LabelProps["maxWidth"]) ?? options?.maxWidth ?? 0
  )
  const animated = computed<boolean>(() => props.animated ?? true)
  // Issue 9 (F31, RTL): величина горизонтального смещения умножается на направление письма.
  // `--fv-label-dir` равен 1 в LTR и -1 в RTL (переключается CSS-вариантом `rtl:` в classBase),
  // поэтому в LTR вывод побайтово прежний, а в RTL лейбл уезжает в правильную сторону.
  // JS-детекта направления нет и не нужно: это чистая CSS-арифметика (решение R22).
  const translateXStyle = computed(() => {
    if (labelMode.value === "none") return ""
    const v = translateX.value
    return `--fv-translate-x: calc(${typeof v === "number" ? `${v}px` : v} * var(--fv-label-dir, 1));`
  })
  const maxWidthStyle = computed(() => {
    const v = maxWidth.value
    return typeof v === "number" ? `max-width: ${v - 38}px` : `max-width: calc(${v} - 38px)`
  })
  // Корень: база → state → options.classes.root → props.classes.root → options.class → props.class
  // (dev-patterns §2 D) — потребитель всегда последний, twMerge отдаёт ему конфликт.
  const classBase = computed(() =>
    cls(
      "root",
      "absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5",
      // transition позиционирования гейтится `animated` (InputLayout даёт mount-tick isTick) —
      // иначе на первом кадре лейбл «переезжает» из исходной точки в финальную.
      animated.value && "motion-safe:transition-all motion-safe:duration-200",
      "px-1",
      // Issue 5 (B11): вертикальные смещения идут через CSS custom properties, а не литералами в px.
      // Прежние `-translate-y-[60px]` не учитывали увеличенный font-size (например,
      // `componentsOptions.Label.class = "text-base"`) — лейбл вылезал за пределы поля.
      // Переопределяется на любом предке без правки JS:
      //   .my-form { --fv-label-translate-y: 68px }
      // Fallback'и в var() равны прежним литералам, поэтому поведение по умолчанию не изменилось.
      // Issue 9 (F31, RTL): горизонтальные смещения умножаются на `--fv-label-dir` — 1 в LTR,
      // -1 в RTL. Величины не изменились, поэтому в LTR рендер прежний; в RTL лейбл смещается
      // к началу строки, а не к её концу. Направление переключается CSS-вариантом ниже, без JS.
      "rtl:[--fv-label-dir:-1]",
      labelMode.value === "dynamic" &&
        `peer-focus:-translate-y-[var(--fv-label-translate-y,60px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]`,
      labelMode.value === "offsetDynamic" &&
        `peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]`,
      labelMode.value === "offsetStatic" &&
        `-translate-y-[var(--fv-label-translate-y-offset,48px)] translate-x-[calc(16px*var(--fv-label-dir,1))]`,
      labelMode.value === "static" &&
        "-translate-y-[var(--fv-label-translate-y,60px)] translate-x-[calc(16px*var(--fv-label-dir,1))]",
      labelMode.value === "vanishing" && `-translate-y-[var(--fv-label-translate-y-rest,28px)]`,
      labelMode.value === "none" &&
        "opacity-0 -translate-y-[var(--fv-label-translate-y-rest,28px)] translate-x-[calc(32px*var(--fv-label-dir,1))]",
      // Красная звёздочка обязательного поля: логический отступ, чтобы в RTL она стояла слева.
      props.required &&
        `after:content-['*'] after:relative after:-top-[10px] after:text-red-500 after:dark:text-red-800 after:ms-0.5`
    )
  )
  const classContent = computed(() =>
    cls(
      "text",
      "relative -top-[10px] h-max block text-sm font-medium text-surface-400 dark:text-surface-500 truncate z-10"
    )
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    mode,
    labelMode,
    classBase,
    classContent
  })
  // Style injection wired up via Component.__hooks() in the base class
  // (onServerPrefetch + vueOnMounted -> initStyle). No explicit onMounted
  // call here — see Documentation/dev-patterns.md §2 decision row 1.
</script>

<template>
  <label data-label :for="props.forId || undefined" :class="classBase" :style="translateXStyle">
    <span data-label-text :class="classContent" :style="maxWidthStyle">
      <slot>{{ props.label }}</slot>
    </span>
  </label>
</template>
