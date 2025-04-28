<script setup lang="ts">
  import { computed, defineAsyncComponent, onMounted, watch } from "vue"
  import Component from "fishtvue/component"
  import { type LoadingExpose, LoadingProps } from "fishtvue/loading/Loading"
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

  let ComponentLoad = defineAsyncComponent({
    loader: () => loadComponent(props.type ?? "simple"),
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
  function loadComponent(type: string) {
    if (componentsMapEpic[type]) return componentsMapEpic[type]()
    if (componentsMapSvg[type]) return componentsMapSvg[type]()
    console.warn(`Unknown loading type: ${type}. Falling back to 'simple'.`)
    return componentsMapSvg["simple"]()
  }

  /**
   * Updates the ComponentLoad when the type prop changes.
   */
  if (isClient())
    watch(
      () => props.type,
      (newType, oldType) => {
        if (newType !== oldType) {
          ComponentLoad = defineAsyncComponent({
            loader: () => loadComponent(newType ?? "simple"),
            errorComponent: SimpleLoading,
            loadingComponent: SimpleLoading,
            delay: 200,
            timeout: 3000
          })
        }
      }
    )

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
    Loading.setStyle(["inline-block", options?.class ?? "", props?.class ?? ""])
  )

  const containerStyle = computed(() => ({
    width: `${size.value}px`,
    height: `${size.value}px`,
    fill: color.value
  }))

  // ---EXPOSE------------------------------
  defineExpose<LoadingExpose>({
    type: props.type,
    animationDuration,
    size,
    color,
    classLoading
  })

  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Loading.initStyle()
  })
</script>

<template>
  <div data-loading :class="classLoading" :style="containerStyle">
    <component :is="ComponentLoad" :size="size" :color="color" :animationDuration="animationDuration" />
  </div>
</template>
