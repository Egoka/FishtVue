<script setup lang="ts">
  import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from "vue"
  import Component from "fishtvue/component"
  import { EpicLoading, type LoadingExpose, LoadingProps, SvgLoading } from "fishtvue/loading/Loading"
  import { get } from "fishtvue/utils/objectHandler"
  import { colors } from "fishtvue/theme/primitive"
  import { isClient } from "fishtvue/utils/domHandler"
  import { hslToHex } from "fishtvue/utils/colorsHandler"
  import SimpleLoading from "./svg/simple.vue"
  import { componentsMapEpic, componentsMapSvg } from "./loadingTypes"

  // ---BASE-COMPONENT----------------------
  const Loading = new Component<"Loading">()
  const options = Loading.getOptions()

  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<LoadingProps>()

  // ---STATE-------------------------------
  // prefers-reduced-motion: вместо анимаций рендерим статичный simple-loader (Issue 6).
  // Один guard в обёртке покрывает все Epic/Svg вариации, без правок 126 файлов и без SFC <style>.
  const prefersReducedMotion = ref(false)
  if (isClient() && typeof window.matchMedia === "function") {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion.value = mql.matches
    const onMotionChange = (e: { matches: boolean }) => (prefersReducedMotion.value = e.matches)
    mql.addEventListener("change", onMotionChange)
    onBeforeUnmount(() => mql.removeEventListener("change", onMotionChange))
  }

  // ---PROPS-------------------------------
  // resolve type: props → componentsOptions → default (Issue 4).
  const resolvedType = computed<NonNullable<LoadingProps["type"]>>(() => props.type ?? options?.type ?? "simple")

  let ComponentLoad = defineAsyncComponent({
    loader: () => loadComponent(resolvedType.value) as Promise<any>,
    errorComponent: SimpleLoading,
    loadingComponent: SimpleLoading,
    delay: 200,
    timeout: 3000
  })

  /**
   * Loads the appropriate loading component based on the provided type.
   * @param type - The type of loading animation.
   * @returns A promise that resolves to the imported component.
   */
  function loadComponent(type: EpicLoading | SvgLoading) {
    if (type in componentsMapEpic) return componentsMapEpic[type as EpicLoading]()
    if (type in componentsMapSvg) return componentsMapSvg[type as SvgLoading]()
    console.warn(`Unknown loading type: ${type}. Falling back to 'simple'.`)
    return componentsMapSvg["simple"]()
  }

  /**
   * Updates the ComponentLoad when the type prop changes.
   */
  if (isClient())
    watch(resolvedType, (newType, oldType) => {
      if (newType !== oldType) {
        ComponentLoad = defineAsyncComponent({
          loader: () => loadComponent(newType) as Promise<any>,
          errorComponent: SimpleLoading,
          loadingComponent: SimpleLoading,
          delay: 200,
          timeout: 3000
        })
      }
    })

  // ---COMPUTED----------------------------
  const animationDuration = computed<NonNullable<LoadingProps["animationDuration"]>>(
    () => props.animationDuration ?? options?.animationDuration ?? 1500
  )

  const size = computed<LoadingProps["size"]>(() => props.size ?? options?.size ?? 20)

  const color = computed<LoadingProps["color"]>(() => {
    const colorProp = props.color ?? options?.color
    if (!colorProp) return "currentColor"
    if (colorProp.startsWith("#")) return colorProp
    let color = get(colors, colorProp) as string | undefined
    if (color && typeof color === "object") color = color?.["500"]
    if (color && color.startsWith("hsl")) {
      color = color.replace(" / <alpha-value>", "")
      // if (!isClient()) return color
      // color = color.replace(/var\((?<var>.*?)\)|(?<alpha><alpha-value>)/g, (substring, args) => {
      //   if (substring === "<alpha-value>") return "100"
      //   if (substring.startsWith("var")) {
      //     return getComputedStyle(document.documentElement).getPropertyValue(args)
      //   }
      //   return substring
      // })
      return hslToHex(color)
    }
    return color ?? "currentColor"
  })

  const classLoading = computed<LoadingProps["class"]>(() =>
    Loading.setStyle(["inline-block", "print:hidden", options?.class ?? "", props?.class ?? ""])
  )

  const containerStyle = computed(() => ({
    width: `${size.value}px`,
    height: `${size.value}px`,
    fill: color.value
  }))

  // Локализуемый ARIA-label статус-региона (Issue 3). `t()` возвращает key как last resort.
  const ariaLabel = computed<string>(() => Loading.t("loading.label") ?? "Loading")

  // ---EXPOSE------------------------------
  defineExpose<LoadingExpose>({
    type: resolvedType,
    animationDuration,
    size,
    color,
    classLoading
  })

  // `Loading.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84,
  // Documentation/dev-patterns.md §2 decision row 1).
</script>

<template>
  <div
    data-loading
    role="status"
    aria-live="polite"
    :aria-label="ariaLabel"
    :class="classLoading"
    :style="containerStyle">
    <SimpleLoading v-if="prefersReducedMotion" :size="size" :color="color" :animation-duration="0" />
    <component v-else :is="ComponentLoad" :size="size" :color="color" :animationDuration="animationDuration" />
    <span :class="Loading.setStyle('sr-only')">{{ ariaLabel }}</span>
  </div>
</template>
