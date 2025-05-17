<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-32 p-5' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    :separatorNotHoverOpacity="true"></Split>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-32 p-5' }"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    :separatorNotHoverOpacity="false"></Split>
</template>
