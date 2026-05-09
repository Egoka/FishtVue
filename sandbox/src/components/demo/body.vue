<script setup lang="ts">
  import type { Panel } from "fishtvue/split"
  import Split from "fishtvue/split/Split.vue"
  import { ref } from "vue"

  const isOnlyIcons = ref(true)
  const panels = ref([
    {
      name: "menu",
      size: 75,
      minSize: 75,
      maxSize: 200
    },
    {
      name: "main"
    }
  ])
  function updateSize(panels: Record<Panel["name"], number>) {
    if ("menu" in panels) isOnlyIcons.value = Math.round(panels.menu) < 120
  }
</script>

<template>
  <Split
    :panels="panels"
    units="pixels"
    :styles="{ separator: 'bg-transparent dark:bg-transparent' }"
    class="overflow-auto bg-white dark:bg-zinc-800 sm:p-3"
    @updated-panels="updateSize">
    <template #menu><div class="bg-red-600">test</div></template>
    <template #main><div class="bg-blue-600">item</div></template>
  </Split>
  <!--  <div class="flex flex-col md:flex-row w-full h-screen bg-zinc-100 dark:bg-zinc-900 sm:p-3 items-start gap-3">-->
  <!--    <AdminHeader />-->
  <!--    <AdminMain>-->
  <!--      <slot />-->
  <!--    </AdminMain>-->
  <!--  </div>-->
</template>
