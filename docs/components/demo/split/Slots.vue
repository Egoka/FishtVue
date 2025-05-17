<template>
  <div
    class="preview flex min-h-[250px] w-full justify-center min-w-[448px] max-w-[448px] mx-auto items-center h-[5rem]">
    <Split
      :panels="[{ name: 'right' }, { name: 'left' }]"
      class="relative rounded-lg overflow-auto border dark:border-gray-800"
      units="percentages">
      <template #right>
        <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
          <img class="absolute left-0 max-w-[444px] w-[448px]" src="/pramod-tiwari-16-unsplash.jpg" alt="" />
        </div>
      </template>
      <template #left>
        <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
          <img class="absolute right-0 max-w-[448px] w-[448px]" src="/pramod-tiwari-17-unsplash.jpg" alt="" />
        </div>
      </template>
    </Split>
  </div>
</template>
<script setup lang="ts"></script>
