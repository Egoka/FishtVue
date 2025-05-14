<script setup lang="ts">
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const divRef = ref<HTMLElement>()
</script>

<template>
  <div ref="divRef" :class="[classDiv, 'size-46 overflow-auto']">
    <Button class="my-48">
      {{ t("title.scrollMeUp") }}
      <FixWindow :scrollableEl="divRef" event-open="click" mode="filled">
        {{ t("title.thisHintMovesWithTheButton") }}
      </FixWindow>
    </Button>
  </div>
</template>
