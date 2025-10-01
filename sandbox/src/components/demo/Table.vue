<script setup lang="ts">
  import Table from "fishtvue/table/Table.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import type { IColumn } from "fishtvue/table"
  import { shallowRef } from "vue"

  // Моковые данные для тегов
  const data = shallowRef<Array<any>>([
    {
      id: 1,
      name: "Технологии",
      slug: "tehnologii",
      description: "Статьи о современных технологиях и инновациях",
      isActive: true,
      articlesCount: 15,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:22:00Z"
    },
    {
      id: 2,
      name: "Дизайн",
      slug: "dizajn",
      description: "Всё о дизайне, UX/UI и визуальном творчестве",
      isActive: true,
      articlesCount: 23,
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-18T16:45:00Z"
    },
    {
      id: 3,
      name: "Бизнес",
      slug: "biznes",
      description: "Предпринимательство, стартапы и бизнес-стратегии",
      isActive: true,
      articlesCount: 8,
      createdAt: "2024-01-08T11:20:00Z",
      updatedAt: "2024-01-19T13:30:00Z"
    },
    {
      id: 4,
      name: "Образование",
      slug: "obrazovanie",
      description: "Обучение, курсы и образовательные материалы",
      isActive: false,
      articlesCount: 0,
      createdAt: "2024-01-05T14:10:00Z",
      updatedAt: "2024-01-12T10:15:00Z"
    },
    {
      id: 5,
      name: "Здоровье",
      slug: "zdorove",
      description: "Медицина, фитнес и здоровый образ жизни",
      isActive: true,
      articlesCount: 12,
      createdAt: "2024-01-12T16:25:00Z",
      updatedAt: "2024-01-21T09:40:00Z"
    },
    {
      id: 6,
      name: "Путешествия",
      slug: "puteshestviya",
      description: "Туризм, путешествия и география",
      isActive: true,
      articlesCount: 6,
      createdAt: "2024-01-14T12:00:00Z",
      updatedAt: "2024-01-20T15:20:00Z"
    }
  ])

  // Конфигурация колонок таблицы
  const columns = shallowRef<Array<IColumn>>([
    {
      dataField: "name",
      name: "name",
      type: "string",
      caption: "Название",
      visible: true,
      width: 200,
      minWidth: 150,
      isFilter: true,
      isSort: true,
      defaultSort: "asc"
    },
    {
      dataField: "slug",
      name: "slug",
      type: "string",
      caption: "URL-адрес",
      visible: true,
      width: 150,
      minWidth: 120,
      isFilter: true,
      isSort: true
    },
    {
      dataField: "description",
      name: "description",
      type: "string",
      caption: "Описание",
      visible: true,
      width: 300,
      minWidth: 200,
      isFilter: true,
      isSort: false
    },
    {
      dataField: "isActive",
      name: "isActive",
      type: "select",
      caption: "Статус",
      visible: true,
      width: 120,
      minWidth: 100,
      isFilter: true,
      isSort: true,
      cellTemplate: "status"
    },
    {
      dataField: "articlesCount",
      name: "articlesCount",
      type: "number",
      caption: "Статей",
      visible: true,
      width: 100,
      minWidth: 80,
      isFilter: false,
      isSort: true,
      defaultSort: "desc"
    },
    {
      dataField: "createdAt",
      name: "createdAt",
      type: "date",
      caption: "Создан",
      visible: true,
      width: 150,
      minWidth: 120,
      isFilter: true,
      isSort: false
    },
    {
      dataField: "updatedAt",
      name: "updatedAt",
      type: "date",
      caption: "Обновлён",
      visible: true,
      width: 150,
      minWidth: 120,
      isFilter: true,
      isSort: false
    }
  ])

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
    :styles="{
      hoverRows: true,
      class: {
        toolbar: 'flex-col md:flex-row'
      },
      width: '42rem',
      height: '25rem'
    }">
    <template #status="{ rowData }">
      <Badge :class="[rowData.isActive ? green : red]">
        {{ rowData.isActive ? "Активен" : "Неактивен" }}
      </Badge>
    </template>
  </Table>
</template>

<style scoped></style>
