<script setup lang="ts"></script>

<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-32 p-5' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    :separatorNotHoverOpacity="true"
    separatorType="strip"></Split>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-32 p-5' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    :separatorNotHoverOpacity="true"
    separatorType="hexagon"></Split>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-32 p-5' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    :separatorNotHoverOpacity="true"
    separatorType="user"></Split>
</template>
