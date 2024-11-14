<!-- https://epic-spinners.epicmax.co -->
<script setup lang="ts">
  import { computed, onMounted } from "vue"
  import { colors } from "fishtvue/theme/primitive"
  import {
    AtomSpinner,
    BreedingRhombusSpinner,
    CirclesToRhombusesSpinner,
    FingerprintSpinner,
    FlowerSpinner,
    FulfillingBouncingCircleSpinner,
    FulfillingSquareSpinner,
    HalfCircleSpinner,
    HollowDotsSpinner,
    IntersectingCirclesSpinner,
    LoopingRhombusesSpinner,
    OrbitSpinner,
    PixelSpinner,
    RadarSpinner,
    ScalingSquaresSpinner,
    SelfBuildingSquareSpinner,
    SemipolarSpinner,
    SpringSpinner,
    SwappingSquaresSpinner,
    TrinityRingsSpinner
  } from "epic-spinners"
  import type { LoadingProps, LoadingExpose } from "./Loading"
  import { get } from "fishtvue/utils/objectHandler"
  import Component from "fishtvue/component"
  import { hslToHex } from "fishtvue/utils/colorsHandler"
  // ---BASE-COMPONENT----------------------
  const Loading = new Component<"Loading">()
  const options = Loading.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<LoadingProps>()
  // ---PROPS-------------------------------
  const type = computed<any>(() => {
    switch (props.type) {
      case "simple":
        return "simple"
      case "Atom":
        return AtomSpinner
      case "BreedingRhombus":
        return BreedingRhombusSpinner
      case "CirclesToRhombuses":
        return CirclesToRhombusesSpinner
      case "Fingerprint":
        return FingerprintSpinner
      case "Flower":
        return FlowerSpinner
      case "FulfillingBouncingCircle":
        return FulfillingBouncingCircleSpinner
      case "FulfillingSquare":
        return FulfillingSquareSpinner
      case "HalfCircle":
        return HalfCircleSpinner
      case "HollowDots":
        return HollowDotsSpinner
      case "IntersectingCircles":
        return IntersectingCirclesSpinner
      case "LoopingRhombuses":
        return LoopingRhombusesSpinner
      case "Orbit":
        return OrbitSpinner
      case "Pixel":
        return PixelSpinner
      case "Radar":
        return RadarSpinner
      case "ScalingSquares":
        return ScalingSquaresSpinner
      case "SelfBuildingSquare":
        return SelfBuildingSquareSpinner
      case "Semipolar":
        return SemipolarSpinner
      case "Spring":
        return SpringSpinner
      case "SwappingSquares":
        return SwappingSquaresSpinner
      case "TrinityRings":
        return TrinityRingsSpinner
      default:
        return HalfCircleSpinner
    }
  })
  const animationDuration = computed<NonNullable<LoadingProps["animationDuration"]>>(
    () => props?.animationDuration ?? options?.animationDuration ?? 1500
  )
  const size = computed<LoadingProps["size"]>(() => props.size ?? options?.size)
  const color = computed<LoadingProps["color"]>(() => {
    let color = get(colors, props.color ?? options?.color) as string | undefined
    if (color && color.startsWith("hsl")) {
      color = color.replace(/var\((?<var>.*?)\)|(?<alpha><alpha-value>)/g, (substring, args) => {
        if (substring === "<alpha-value>") return "100"
        if (substring.startsWith("var")) return getComputedStyle(document.documentElement).getPropertyValue(args)
        return substring
      })
      return hslToHex(color)
    }
    return color
  })
  const baseClass = computed<LoadingProps["class"]>(() => Loading.setStyle("inline-block"))
  const classLoading = computed<LoadingProps["class"]>(() =>
    Loading.setStyle([options?.class ?? "", props?.class ?? ""])
  )
  const loadingIsSimple = computed(() =>
    Loading.setStyle(`animate-[spin_${animationDuration.value / 1000}s_ease-in-out_infinite] duration-50`)
  )
  // ---EXPOSE------------------------------
  defineExpose<LoadingExpose>({
    type,
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
  <div :class="baseClass">
    <svg
      v-if="type === 'simple'"
      :class="[loadingIsSimple, classLoading]"
      xmlns="http://www.w3.org/2000/svg"
      :width="size ?? 18"
      :height="size ?? 18"
      viewBox="0 0 24 24"
      fill="none"
      :style="color ? `color: ${color}` : null"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
    <component
      v-else
      :is="type"
      :class="classLoading"
      :animation-duration="animationDuration"
      :size="size"
      :color="color"
      :pixel-size="70"
      :dot-size="15"
      :dots-num="3"
      :circles-num="3"
      :circle-size="15" />
  </div>
</template>
