<script setup lang="ts">
  defineProps<{ id: string }>()
</script>

<template>
  <h3
    :id="id"
    class="scroll-mt-[175px] lg:scroll-mt-[126px] font-asap tracking-wide font-semibold mb-1 text-xl mt-11 ml-5 text-neutral-700 dark:text-neutral-200">
    <NuxtLink :href="`#${id}`" class="group">
      <div class="-ml-6 pr-2 inline-flex opacity-0 group-hover:opacity-100 transition-opacity absolute h-7">
        <AppIcons icon="heroicons:hashtag-16-solid" class="w-4 h-4 text-green-400 my-auto" />
      </div>

      <slot />
    </NuxtLink>
  </h3>
</template>
