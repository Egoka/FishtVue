<template>
  <div class="flex flex-wrap gap-5 justify-center">
    <div
      v-for="items in [25, 30, 40, 50, 60]"
      :key="items"
      class="flex flex-col justify-center items-center bg-neutral-200 dark:bg-neutral-800 rounded-lg p-5 size-22">
      <Loading type="FingerprintSpinner" :size="items" color="theme.600" />
      <div class="absolute text-sm text-neutral-400 dark:text-neutral-700" style="translate: 20px 30px">
        {{ items }}px
      </div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
