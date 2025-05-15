<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"

  const badgesClass =
    "inline-flex items-center rounded-md bg-theme-50 dark:bg-theme-900 px-2 py-0.5 text-xs font-medium text-theme-600 dark:text-theme-400 ring-1 ring-inset ring-theme-500/10"

  function open() {
    openAlert({
      position: "top-right",
      type: "neutral",
      size: "xs",
      displayTime: 5000,
      title: "Notification with html",
      subtitle: `An example of an alert in which${`<span class='${badgesClass}'>html markup</span>`}can be used
                    <img class='w-56 m-2 ml-0 rounded-lg' src='https://images.unsplash.com/photo-1682687220989-cbbd30be37e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3870&q=80' alt=''>`
    })
  }
</script>
<template>
  <Button @click="open"> With HTML </Button>
</template>
