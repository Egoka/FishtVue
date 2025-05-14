<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-22' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    units="percentages">
    <template #t1="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">%</span>
      </div>
    </template>
    <template #t2="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">%</span>
      </div>
    </template>
  </Split>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-22' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    units="pixels">
    <template #t1="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">px</span>
      </div>
    </template>
    <template #t2="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">px</span>
      </div>
    </template>
  </Split>
</template>
