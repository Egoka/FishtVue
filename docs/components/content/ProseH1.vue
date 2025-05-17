<script setup lang="ts">
  defineProps<{ id: string }>()
</script>

<template>
  <h1
    :id="id"
    class="scroll-mt-[205px] lg:scroll-mt-[156px] font-asap font-bold mb-2 !text-4xl mt-12 ml-8 tracking-tight text-neutral-700 dark:text-neutral-200">
    <NuxtLink :href="`#${id}`" class="group">
      <div class="-ml-6 pr-2 py-2 inline-flex opacity-0 group-hover:opacity-100 transition-opacity absolute h-10">
        <AppIcons icon="heroicons:hashtag-16-solid" class="w-5 h-5 text-green-400 my-auto" />
      </div>
      <slot />
    </NuxtLink>
  </h1>
</template>
