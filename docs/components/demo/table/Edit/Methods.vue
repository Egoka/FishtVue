<script setup lang="ts">
  import type { TableProps, TableExpose } from "fishtvue/table"
  import type { FormStructure } from "fishtvue/form"
  import { useI18n } from "vue-i18n"
  import generateData from "~/components/demo/table/dataForExample"

  const { t } = useI18n()
  const activeRow = ref()
  const tableEdit = ref<TableExpose>()
  const dialog = ref(false)
  const formFields = ref()
  const { data } = useAsyncData("tableEditGlobal", () =>
    Promise.resolve(generateData(1000, "users", ["name", "role", "createdAt", "updatedAt"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", width: 100 },
    { dataField: "role", caption: t("caption.role"), type: "select", width: 100 },
    { dataField: "createdAt", caption: t("caption.createdAt"), type: "date", width: 100 },
    { dataField: "updatedAt", caption: t("caption.updatedAt"), type: "date", width: 100 }
  ])
  const structureDialog = ref<Array<FormStructure>>([
    {
      title: "Данные записи",
      subTitle: "Эта информация будет отображаться публично, поэтому будьте осторожны с тем, чем вы делитесь.",
      fields: [
        {
          name: "name",
          typeComponent: "Input",
          label: t("label.name"),
          classCol: "sm:col-span-3",
          required: true
        },
        {
          name: "role",
          typeComponent: "Select",
          label: t("label.role"),
          dataSelect: ["admin", "user", "guest"],
          classCol: "sm:col-span-2",
          required: true,
          paramsFixWindow: {
            typePosition: "absolute"
          }
        },
        {
          name: "createdAt",
          typeComponent: "Calendar",
          classCol: "sm:col-span-3",
          label: t("label.createdAt"),
          paramsFixWindow: {
            typePosition: "absolute"
          }
        },
        {
          name: "updatedAt",
          typeComponent: "Calendar",
          classCol: "sm:col-span-3",
          label: t("label.updatedAt"),
          paramsFixWindow: {
            typePosition: "absolute"
          }
        }
      ]
    }
  ])
  function clickRow(params: any) {
    if (params) {
      const activeTr = params.eventEl.parentElement.querySelector(".active-tr")
      if (activeTr) {
        activeTr.classList.remove("active-tr", "!bg-theme-100", "dark:!bg-theme-900")
      }
      params.eventEl.classList.add("active-tr", "!bg-theme-100", "dark:!bg-theme-900")
      dialog.value = true
      activeRow.value = params.data._key
      formFields.value = params.data
    }
  }
  function addRow() {
    dialog.value = true
    formFields.value = {}
  }
  function deleteRow(key: any) {
    tableEdit.value?.deleteRow(key)
  }
  function submit(fields: any) {
    if (fields) {
      console.log("fields", fields, activeRow.value)
      dialog.value = false
      if (activeRow.value) {
        const result = tableEdit.value?.updateRow(activeRow.value, fields)
        console.log("result", result)
      } else {
        tableEdit.value?.addRow(fields)
      }
    }
  }
</script>

<template>
  <Table
    ref="tableEdit"
    :data-source="data as any[]"
    :count-visible-rows="7"
    :filter="{ isClearAllFilter: true }"
    sort
    resized-columns
    search
    :columns="columns"
    :pagination="{ sizePage: 7, isInfoText: true }"
    toolbar
    :count-data-on-loading="100.0"
    @clickRow="clickRow">
    <template #toolbar>
      <Button mode="primary" icon="Plus" class="h-9" @click.stop="addRow"> Создать </Button>
    </template>
    <template #delete="{ key }">
      <div class="bg-stone-50 dark:bg-stone-950 rounded-lg">
        <Button type="icon" icon="XMark" mode="ghost" class="px-[5px] h-9 w-9 m-0" @click.stop="deleteRow(key)">
        </Button>
      </div>
    </template>
  </Table>
  <Dialog
    v-model:model-value="dialog"
    notAnimate
    toTeleport="#__nuxt"
    position="center"
    close-button
    class="p-0 sm:max-w-xl">
    <Form class="relative m-5" :structure="structureDialog" :form-fields="formFields" @submit="submit">
      <template #itemTitle="{ structure }">
        <h2 v-if="structure?.title?.length" class="text-xl font-semibold leading-7 text-gray-900 dark:text-gray-100">
          {{ structure?.title }}
        </h2>
        <p v-if="structure?.subTitle?.length" class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {{ structure?.subTitle }}
        </p>
      </template>
    </Form>
  </Dialog>
</template>
