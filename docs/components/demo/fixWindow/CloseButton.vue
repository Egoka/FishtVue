<script setup lang="ts">
  const { t } = useI18n()
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
</script>

<template>
  <div :class="classDiv">
    {{ t("button.clickMe") }}
    <FixWindow position="center" eventOpen="click" closeButton>
      <img class="max-w-[448px] rounded-sm" src="/pramod-tiwari-16-unsplash.jpg" alt="" />
    </FixWindow>
  </div>
</template>
