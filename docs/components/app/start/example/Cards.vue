<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>

<template>
  <div
    class="element flex-1 h-full overflow-y-auto overflow-x-clip overflow-hidden border border-black/10 dark:border-white/5 rounded-xl p-6">
    <div class="text-color text-2xl font-medium leading-8">{{ t("start.example.cards.title") }}</div>
    <div class="mt-1 text-muted-color leading-6 text-neutral-500 dark:text-neutral-400">
      {{ t("start.example.cards.subtitle") }}
    </div>
    <div class="mt-6 flex flex-wrap gap-2 gap-y-5 justify-around items-center">
      <div
        class="rounded-xl p-5 max-w-full md:max-w-4/12 border border-black/10 dark:border-white/5 bg-stone-100 dark:bg-stone-900">
        <AppStartExampleCardForm />
      </div>
      <div class="rounded-xl max-w-full md:max-w-7/12 bg-stone-100 dark:bg-stone-900">
        <AppStartExampleCardTable />
      </div>
      <div class="max-w-full min-w-[448px] md:max-w-5/12 rounded-lg bg-stone-100 dark:bg-stone-900">
        <AppStartExampleCardSplit />
      </div>
      <div
        class="rounded-xl p-5 max-w-full md:max-w-6/12 border border-black/10 dark:border-white/5 bg-stone-100 dark:bg-stone-900">
        <AppStartExampleCardFAQ />
      </div>
      <div class="rounded-xl p-5 min-w-[21rem] max-w-full md:max-w-4/12 bg-stone-100 dark:bg-stone-900">
        <DemoMenuItemsGroupInfo />
      </div>
      <div
        class="rounded-xl p-5 max-w-full md:max-w-7/12 border border-black/10 dark:border-white/5 bg-stone-100 dark:bg-stone-900">
        <DemoPaginationIsPageSizeSelector />
      </div>
      <div class="rounded-xl p-5 w-full text-center text-neutral-400 dark:text-neutral-700">
        <div class="text-4xl sm:text-7xl font-thin leading-8 my-22">
          {{ t("start.example.cards.more") }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .element {
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 20%, transparent);
    background-image: radial-gradient(var(--pattern-fg) 1px, transparent 1px);
    background-size: 4px 4px;
  }
</style>
