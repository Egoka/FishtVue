<script setup lang="ts">
  import { ref } from "vue"
  import VirtualScroller from "fishtvue/virtualscroller/VirtualScroller.vue"

  // Большой набор данных, который реально нужно скроллить — рендерится только видимое окно.
  const items = ref(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `User ${i + 1}`,
      email: `user${i + 1}@fishtvue.dev`
    }))
  )

  const scrollbar = ref<"macos" | "thin">("macos")
  const vsRef = ref<InstanceType<typeof VirtualScroller> | null>(null)

  function scrollRandom() {
    vsRef.value?.scrollToIndex(Math.floor(Math.random() * items.value.length), "smooth")
  }

  const btn =
    "rounded-md border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 transition-colors"
</script>

<template>
  <div class="w-full max-w-[420px] mx-auto">
    <div class="mb-3 flex items-center justify-between gap-2 text-sm text-neutral-600 dark:text-neutral-300">
      <span>{{ items.length.toLocaleString() }} rows</span>
      <div class="flex items-center gap-2">
        <button :class="btn" @click="scrollbar = scrollbar === 'macos' ? 'thin' : 'macos'">
          scrollbar: {{ scrollbar }}
        </button>
        <button :class="btn" @click="scrollRandom">scroll random</button>
      </div>
    </div>

    <VirtualScroller
      ref="vsRef"
      :items="items"
      :item-size="44"
      :scroll-height="320"
      :scrollbar="scrollbar"
      class="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
      style="--vs-thumb: rgb(120 120 130 / 0.55)">
      <template #item="{ item, index }">
        <div
          class="flex h-[44px] items-center gap-3 px-4 border-b border-neutral-100 dark:border-neutral-800"
          :class="index % 2 ? 'bg-neutral-50/60 dark:bg-neutral-800/40' : ''">
          <span class="w-12 shrink-0 text-xs tabular-nums text-neutral-400">#{{ index }}</span>
          <span
            class="size-7 shrink-0 grid place-items-center rounded-full bg-theme-100 dark:bg-theme-900 text-theme-700 dark:text-theme-300 text-xs font-semibold">
            {{ item.name[0] }}
          </span>
          <div class="min-w-0">
            <div class="truncate text-sm text-neutral-800 dark:text-neutral-100">{{ item.name }}</div>
            <div class="truncate text-xs text-neutral-400">{{ item.email }}</div>
          </div>
        </div>
      </template>
    </VirtualScroller>

    <p class="mt-2 text-xs text-neutral-400">
      DOM держит только видимое окно (~{{ Math.ceil(320 / 44) }} строк + overscan) из
      {{ items.length.toLocaleString() }}.
    </p>
  </div>
</template>
