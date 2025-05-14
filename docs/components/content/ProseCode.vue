<script setup lang="ts">
  import { ref, onMounted } from "vue"
  import { cn } from "#imports"

  const props = defineProps<{
    lang?: string
    class?: any
  }>()

  const slotRef = ref<HTMLElement | null>(null)
  const classes = ref({
    root:
      "m-px px-1.5 py-0.5 text-sm font-mono font-medium inline-block border " +
      "rounded-sm " +
      "border-neutral-200 dark:border-neutral-700 " +
      "text-neutral-700 dark:text-neutral-300 " +
      "bg-neutral-50 dark:bg-neutral-800"
  })

  onMounted(() => {
    if (slotRef.value) {
      const slotText = slotRef.value.innerHTML.trim().replace("<!--[-->", "").replace("<!--]-->", "")
      if (slotText === "undefined" || slotText === "null") {
        classes.value.root += " text-neutral-500 dark:text-neutral-500"
      } else if (!isNaN(Number(slotText))) {
        classes.value.root += " text-blue-800 dark:text-blue-300"
      } else if (slotText.startsWith('"') && slotText.endsWith('"')) {
        classes.value.root += " text-red-800 dark:text-red-300"
      } else if (slotText === "true" || slotText === "false") {
        classes.value.root += " text-green-800 dark:text-green-300"
      } else if (
        slotText === "HTMLElement" ||
        slotText === "VNode[]" ||
        slotText === "MouseEvent" ||
        slotText === "CSSProperties"
      ) {
        classes.value.root += " text-orange-600 dark:text-orange-700"
      } else if (slotText === "_key" || slotText === "any" || slotText === "void") {
        classes.value.root += " text-orange-600 dark:text-orange-700"
      } else {
        try {
          if (slotText === "boolean") {
            classes.value.root += " text-green-800 dark:text-green-300"
          } else if (slotText === "string") {
            classes.value.root += " text-red-800 dark:text-red-300"
          } else if (slotText === "number") {
            classes.value.root += " text-blue-800 dark:text-blue-300"
          }
        } catch (e) {
          // Если парсинг не удался, оставляем классы без изменений
        }
      }
    }
  })
</script>

<template>
  <code :class="cn(classes.root, `shiki language-${props.lang ?? 'js'}`)" ref="slotRef">
    <slot></slot>
  </code>
</template>
