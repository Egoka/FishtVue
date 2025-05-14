<template>
  <div class="flex flex-wrap gap-5 justify-center">
    <div
      v-for="items in [300, 500, 1000, 2000, 5000, 9000]"
      :key="items"
      class="flex flex-col justify-center items-center bg-neutral-200 dark:bg-neutral-800 rounded-lg p-5 size-22">
      <Loading type="AtomSpinner" :animationDuration="items" :size="40" color="theme.600" />
      <div class="absolute text-sm text-neutral-400 dark:text-neutral-700" style="translate: 10px 32px">
        {{ items }}ms
      </div>
    </div>
  </div>
</template>
