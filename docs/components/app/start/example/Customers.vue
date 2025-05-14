<script setup lang="ts">
  import { columnsCustomers, dataCustomers } from "~/components/app/start/dataExemple"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const data = shallowRef(dataCustomers())
  const columns = shallowRef(columnsCustomers())
  const red = "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/10"
  const green =
    "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-300 dark:ring-green-400/20"
</script>

<template>
  <Table
    :dataSource="data"
    :columns="columns"
    search
    toolbar
    class="p-0 overflow-auto"
    :styles="{ width: '100%', height: '81.5vh' }">
    <template #toolbar>
      <div class="flex items-start gap-2 justify-between mt-7 ml-5">
        <div>
          <div class="text-2xl font-medium leading-8 text-color text-black dark:text-zinc-300">
            {{ t("start.example.customers.title") }}
          </div>
          <div class="mt-1 leading-6 text-neutral-400 dark:text-neutral-500">
            {{ t("start.example.customers.subtitle") }}
          </div>
        </div>
      </div>
    </template>
    <template #name="{ rowData }">
      <div class="flex flex-row w-full min-w-max items-center">
        <div
          class="inline-flex items-center justify-center bg-transparent rounded-xl size-8 min-w-8 text-2xl font-medium mr-3">
          <img :src="`/avatars/${rowData.avatar}`" alt="avatar" class="rounded-full h-full min-w-full object-cover" />
        </div>
        <div>
          <div class="font-semibold text-sm leading-5">{{ rowData.name }}</div>
          <div class="font-semibold text-neutral-400 dark:text-neutral-500">{{ rowData.email }}</div>
        </div>
      </div>
    </template>
    <template #status="{ rowData, value }">
      <Badge :class="[rowData.isActive ? green : red]">
        {{ value }}
      </Badge>
    </template>
  </Table>
</template>

<style scoped></style>
