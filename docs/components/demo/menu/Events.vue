<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { groupHorizontal } from "~/components/demo/menu/dataForExamples"

  function open(title: string, subtitle: string) {
    openAlert({ title, subtitle, displayTime: 2000, position: "top-right", type: "neutral" })
  }
</script>

<template>
  <Menu
    :groups="groupHorizontal()"
    @on-active="(_: any, item: any) => open(`Hovered`, item.title)"
    @on-click="(_: any, item: any) => open(`Clicked`, item.title)">
  </Menu>
</template>
