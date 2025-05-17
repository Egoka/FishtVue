<template>
  <div class="flex flex-wrap gap-5 justify-center">
    <div
      v-for="items in ['red', 'green', 'blue', 'yellow', 'pink', 'purple']"
      :key="items"
      class="flex flex-col justify-center items-center bg-neutral-200 dark:bg-neutral-800 rounded-lg p-5 size-22">
      <Loading type="SemipolarSpinner" :size="40" :color="items" />
      <div class="absolute text-sm text-neutral-400 dark:text-neutral-700" style="translate: 0 30px">
        {{ items }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
