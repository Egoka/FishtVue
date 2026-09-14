<script setup lang="ts">
  import { ref } from "vue"
  import DemoForm from "@/components/demo/Form.vue"
  import Button from "fishtvue/button/Button.vue"
  import Dialog from "fishtvue/dialog/Dialog.vue"

  const dialog = ref(false)
</script>

<template>
  <div class="relative">
    <Button @click="dialog = true">Dialog</Button>
    <!-- props 1.0: `class` у Dialog теперь корень `[data-dialog]`, а карточка — ключ `content`.
         `p-0` снимает отступы именно карточки, поэтому уезжает в `classes.content`. -->
    <Dialog v-model="dialog" position="center" close-button :classes="{ content: 'p-0' }" size="md">
      <template #default>
        <div class="p-5">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-400">Authentication</h3>
          <DemoForm />
        </div>
      </template>
    </Dialog>
  </div>
</template>
