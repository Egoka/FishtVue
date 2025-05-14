<script setup lang="ts">
  import type { EpicLoading, SvgLoading } from "fishtvue"
  const svgLoading = ref<SvgLoading[]>([
    "simple",
    "3-dots-bounce",
    "3-dots-fade",
    "3-dots-move",
    "3-dots-rotate",
    "3-dots-scale",
    "3-dots-scale-middle",
    "4-dots-goeey",
    "4-dots-rotate",
    "6-dots-rotate",
    "6-dots-scale",
    "6-dots-scale-middle",
    "8-dots-rotate",
    "8-dots-rotate-scale",
    "12-dots-scale-rotate",
    "90-ring",
    "90-ring-with-bg",
    "90-ring-with-gradient",
    "180-ring",
    "180-ring-with-bg",
    "270-ring",
    "270-ring-with-bg",
    "ball-triangle",
    "bars",
    "bars-fade",
    "bars-rotate-fade",
    "bars-scale",
    "bars-scale-fade",
    "bars-scale-middle",
    "blocks-scale",
    "blocks-shuffle-2",
    "blocks-shuffle-3",
    "blocks-shuffle-4",
    "blocks-shuffle-5",
    "blocks-wave",
    "bouncing-ball",
    "circle-fade",
    "circles",
    "clock",
    "cog01",
    "cog02",
    "cog03",
    "cog04",
    "cog05",
    "cog06",
    "cog07",
    "cog08",
    "cog09",
    "cog10",
    "cog11",
    "cog12",
    "cog13",
    "cog14",
    "cog15",
    "cog16",
    "cog17",
    "cog18",
    "cog19",
    "cog20",
    "cog21",
    "cog22",
    "cog23",
    "cog24",
    "dot-revolve",
    "eclipse",
    "eclipse-half",
    "gooey-balls-1",
    "gooey-balls-2",
    "grid",
    "hearts",
    "horizontal-bar",
    "jump",
    "loader1",
    "loader2",
    "loader3",
    "loader4",
    "loader5",
    "loader6",
    "loader7",
    "loader8",
    "loader9",
    "loader10",
    "loader-wifi",
    "oval",
    "pacman",
    "puff",
    "pulse",
    "pulse2",
    "pulse-3",
    "pulse-multiple",
    "pulse-ring",
    "pulse-rings-2",
    "pulse-rings-3",
    "pulse-rings-multiple",
    "ring-resize",
    "rings",
    "spinner",
    "spinner-double",
    "spinner-multiple",
    "spinning-circles",
    "tadpole",
    "tail-spin",
    "wifi",
    "wifi-fade",
    "wind-toy"
  ])
  const dialog = ref(false)
  const activeLoader = ref<SvgLoading>()

  function open(item: SvgLoading) {
    dialog.value = true
    activeLoader.value = item
  }
</script>

<template>
  <div class="grid grid-cols-4 lg:grid-cols-7 gap-x-2 gap-y-12 justify-items-center my-5">
    <div
      v-for="(item, key) in svgLoading"
      :key="item"
      class="flex flex-col items-center bg-neutral-200 dark:bg-neutral-800 rounded-lg p-5"
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
