<script setup lang="ts">
  import Split from "fishtvue/split/Split.vue"
</script>
<template>
  <div
    class="preview flex min-h-[120px] w-full justify-center min-w-[250px] max-w-[250px] mx-auto items-center h-[5rem] bg-neutral-50 dark:bg-neutral-800 rounded-lg">
    <Split
      :panels="[{ name: 'right' }, { name: 'left' }]"
      class="relative rounded-lg overflow-auto border dark:border-gray-800"
      units="percentages">
      <template #right>
        <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
          <div class="absolute left-0 max-w-[246px] w-[250px] text-center font-asap font-bold text-6xl">Fisht</div>
        </div>
      </template>
      <template #left>
        <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
          <div
            class="absolute right-0 max-w-[250px] w-[250px] text-center font-asap font-bold text-6xl text-theme-600 dark:text-theme-400">
            Fisht
          </div>
        </div>
      </template>
    </Split>
  </div>
</template>
