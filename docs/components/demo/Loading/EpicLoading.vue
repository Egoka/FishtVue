<script setup lang="ts">
  import type { EpicLoading } from "#fishtvue"

  const epicLoading = ref<EpicLoading[]>([
    "AtomSpinner",
    "BreedingRhombusSpinner",
    "FingerprintSpinner",
    "FlowerSpinner",
    "FulfillingBouncingCircleSpinner",
    "FulfillingSquareSpinner",
    "HalfCircleSpinner",
    "IntersectingCirclesSpinner",
    "LoopingRhombusesSpinner",
    "OrbitSpinner",
    "PixelSpinner",
    "RadarSpinner",
    "ScalingSquaresSpinner",
    "SelfBuildingSquareSpinner",
    "SemipolarSpinner",
    "SpringSpinner",
    "SwappingSquaresSpinner",
    "TrinityRingsSpinner",
    "HollowDotsSpinner",
    "CirclesToRhombusesSpinner"
  ])
  const dialog = ref(false)
  const activeLoader = ref<EpicLoading>()

  function open(item: EpicLoading) {
    dialog.value = true
    activeLoader.value = item
  }
</script>

<template>
  <div class="grid grid-cols-4 lg:grid-cols-7 gap-x-2 gap-y-12 justify-items-center my-12">
    <div
      v-for="(item, key) in epicLoading"
      :key="item"
      class="flex flex-col items-center bg-neutral-200 dark:bg-neutral-800 rounded-lg p-5 size-20"
      @click="open(item)">
      <Loading :size="40" :type="item" color="theme.600" />
      <div class="absolute text-sm text-neutral-400 dark:text-neutral-700" style="translate: 25px 38px">
        {{ key + 1 }}
      </div>
      <FixWindow type-position="absolute" :margin-px="5">
        <div class="text-neutral-400 dark:text-neutral-700">
          {{ item }}
        </div>
      </FixWindow>
    </div>
  </div>
  <Dialog v-model="dialog" size="sm" class="text-center" closeButton>
    <div class="text-xl mb-5 text-neutral-400 dark:text-neutral-700">{{ activeLoader }}</div>
    <Loading :size="240" :type="activeLoader" color="theme.600" />
  </Dialog>
</template>

<style scoped></style>
