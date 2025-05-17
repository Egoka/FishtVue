<script setup lang="ts"></script>

<template>
  <div class="-z-1 w-full h-max absolute top-0 left-0 inset-0 pointer-events-none flex justify-center overflow-hidden">
    <div
      class="z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform translate-x-0 left-0 -translate-y-80">
      <div
        class="rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform translate-x-0 left-0 -translate-y-80"></div>
    </div>
    <div class="w-screen flex-none flex justify-end h-screen relative">
      <ClientOnly>
        <Doc039 />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
