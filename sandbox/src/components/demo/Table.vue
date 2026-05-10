<script setup lang="ts">
  import Table from "fishtvue/table/Table.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import Button from "fishtvue/button/Button.vue"
  import type { IColumn, IAsyncDataParams, IAsyncDataResult } from "fishtvue/table"
  import { shallowRef, ref } from "vue"

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
      onClick(column: IColumn, indexRow: number) {
        console.log("onClick", column, indexRow)
      },
      dataField: "name",
      name: "name",
      type: "string",
      caption: "Название",
      visible: true,
      width: 200,
      minWidth: 150,
      isFilter: true,
      isSort: true,
      defaultSort: "asc",
      paramsFilter: {
        paramsFilter: {
          labelMode: "offsetStatic"
        }
      }
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

  // Тестирование asyncData режимов
  const activeMode = ref<"default" | "mode1" | "mode2" | "mode3" | "mode4">("default")
  const tableRef = ref<InstanceType<typeof Table>>()

  // Режим 1: asyncData = true
  const asyncDataMode1 = ref(true)
  const dataMode1 = shallowRef<Array<any>>([...data.value])

  // Режим 2: asyncData = string URL (используем моковый URL)
  const asyncDataMode2 = ref("https://jsonplaceholder.typicode.com/posts")

  // Режим 3: asyncData = object config
  const asyncDataMode3 = ref({
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: {
      "Content-Type": "application/json"
    },
    query: {
      _limit: 50
    }
  })

  // Режим 4: asyncData = function
  const asyncDataMode4 = ref(async (params: IAsyncDataParams): Promise<IAsyncDataResult> => {
    console.log("Loading data with params:", params)
    // Симуляция задержки
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Фильтрация и пагинация на стороне клиента (для демо)
    let filteredData = [...data.value]

    // Применяем поиск
    if (params.search) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(params.search.toLowerCase()))
      )
    }

    // Применяем фильтры
    if (Object.keys(params.filters).length > 0) {
      Object.keys(params.filters).forEach((field) => {
        const filterValue = params.filters[field]
        if (filterValue !== null && filterValue !== undefined && filterValue !== "") {
          filteredData = filteredData.filter((item) => {
            const itemValue = item[field]
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue)
            }
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase())
          })
        }
      })
    }

    // Применяем сортировку
    if (Object.keys(params.sort).length > 0) {
      const sortField = Object.keys(params.sort)[0]
      const sortOrder = params.sort[sortField]
      if (sortOrder) {
        filteredData.sort((a, b) => {
          const aVal = a[sortField]
          const bVal = b[sortField]
          if (sortOrder === "asc") {
            return aVal > bVal ? 1 : -1
          } else {
            return aVal < bVal ? 1 : -1
          }
        })
      }
    }

    const totalCount = filteredData.length
    const startIndex = (params.pagination.page - 1) * params.pagination.size
    const endIndex = startIndex + params.pagination.size
    const paginatedData = filteredData.slice(startIndex, endIndex)

    return {
      dataSource: paginatedData,
      totalCount
    }
  })

  // Обработчики событий для режима 1
  function handleSort(payload: any) {
    console.log("Sort event:", payload)
    // Здесь пользователь должен сделать запрос на сервер и обновить dataSource
  }

  function handleFilter(payload: any) {
    console.log("Filter event:", payload)
    // Здесь пользователь должен сделать запрос на сервер и обновить dataSource
  }

  function handleSearch(query: string) {
    console.log("Search event:", query)
    // Здесь пользователь должен сделать запрос на сервер и обновить dataSource
  }

  function handleSwitchPage(page: number) {
    console.log("Switch page event:", page)
    // Здесь пользователь должен сделать запрос на сервер и обновить dataSource
  }

  function handleSwitchSizePage(size: number) {
    console.log("Switch size page event:", size)
    // Здесь пользователь должен сделать запрос на сервер и обновить dataSource
  }
</script>

<template>
  <div class="space-y-4">
    <!-- Переключатель режимов -->
    <div class="flex gap-2 flex-wrap">
      <Button :mode="activeMode === 'default' ? 'primary' : 'outline'" @click="activeMode = 'default'">
        Обычный режим
      </Button>
      <Button :mode="activeMode === 'mode1' ? 'primary' : 'outline'" @click="activeMode = 'mode1'">
        Режим 1: asyncData = true
      </Button>
      <Button :mode="activeMode === 'mode2' ? 'primary' : 'outline'" @click="activeMode = 'mode2'">
        Режим 2: asyncData = URL
      </Button>
      <Button :mode="activeMode === 'mode3' ? 'primary' : 'outline'" @click="activeMode = 'mode3'">
        Режим 3: asyncData = Config
      </Button>
      <Button :mode="activeMode === 'mode4' ? 'primary' : 'outline'" @click="activeMode = 'mode4'">
        Режим 4: asyncData = Function
      </Button>
    </div>

    <!-- Обычный режим -->
    <div v-if="activeMode === 'default'" class="space-y-2">
      <h3 class="text-lg font-semibold">Обычный режим (без asyncData)</h3>
      <Table
        :dataSource="data"
        :columns="columns"
        :count-visible-rows="2"
        :pagination="{
          startPage: 1,
          sizePage: 2
        }"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: true,
          hoverRows: true,
          class: {
            toolbar: 'flex-col md:flex-row',
            tfoot: 'bg-zinc-100 dark:bg-zinc-900',
            pagination: 'bg-zinc-100 dark:bg-zinc-900'
          },
          borderRadiusPx: 3,
          width: '42rem',
          height: '39rem'
        }">
        <template #toolbar>
          <div class="flex items-start gap-2 justify-between my-2.5 ml-5 text-xs sm:text-base">
            <div class="">
              <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300 truncate">
                Управление пользователями
              </div>
              <div class="mt-1 leading-6 text-neutral-400 dark:text-neutral-500 truncate">
                Просмотр и управление пользователями системы
              </div>
            </div>
          </div>
        </template>
        <template #status="{ rowData }">
          <Badge :class="[rowData.isActive ? green : red]">
            {{ rowData.isActive ? "Активен" : "Неактивен" }}
          </Badge>
        </template>
      </Table>
    </div>

    <!-- Режим 1: asyncData = true -->
    <div v-if="activeMode === 'mode1'" class="space-y-2">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">Режим 1: asyncData = true</h3>
        <p class="text-sm text-gray-500">События в консоли. Данные должны обновляться пользователем через события.</p>
      </div>
      <Table
        ref="tableRef"
        :dataSource="dataMode1"
        :asyncData="asyncDataMode1"
        :totalCount="dataMode1.length"
        :columns="columns"
        :count-visible-rows="2"
        :pagination="{
          startPage: 1,
          sizePage: 2
        }"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: true,
          hoverRows: true,
          class: {
            toolbar: 'flex-col md:flex-row',
            tfoot: 'bg-zinc-100 dark:bg-zinc-900',
            pagination: 'bg-zinc-100 dark:bg-zinc-900'
          },
          borderRadiusPx: 3,
          width: '42rem',
          height: '39rem'
        }"
        @sort="handleSort"
        @filter="handleFilter"
        @search="handleSearch"
        @switch-page="handleSwitchPage"
        @switch-size-page="handleSwitchSizePage">
        <template #toolbar>
          <div class="flex items-start gap-2 justify-between my-2.5 ml-5 text-xs sm:text-base">
            <div class="">
              <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300 truncate">
                Async Mode (Режим 1)
              </div>
              <div class="mt-1 leading-6 text-neutral-400 dark:text-neutral-500 truncate">
                События отправляются, но клиентские вычисления отключены
              </div>
            </div>
          </div>
        </template>
        <template #status="{ rowData }">
          <Badge :class="[rowData.isActive ? green : red]">
            {{ rowData.isActive ? "Активен" : "Неактивен" }}
          </Badge>
        </template>
      </Table>
    </div>

    <!-- Режим 2: asyncData = URL string -->
    <div v-if="activeMode === 'mode2'" class="space-y-2">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">Режим 2: asyncData = URL (string)</h3>
        <p class="text-sm text-gray-500">Загружает данные из JSONPlaceholder API при монтировании</p>
      </div>
      <Table
        :asyncData="asyncDataMode2"
        :columns="[
          {
            dataField: 'id',
            caption: 'ID',
            type: 'number',
            width: 80
          },
          {
            dataField: 'title',
            caption: 'Заголовок',
            type: 'string',
            isFilter: true,
            isSort: true
          },
          {
            dataField: 'body',
            caption: 'Описание',
            type: 'string',
            isFilter: true
          }
        ]"
        :count-visible-rows="2"
        :pagination="{
          startPage: 1,
          sizePage: 5
        }"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: true,
          hoverRows: true,
          borderRadiusPx: 3,
          width: '42rem',
          height: '39rem'
        }">
        <template #toolbar>
          <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300 truncate my-2.5 ml-5">
            Загрузка из URL
          </div>
        </template>
      </Table>
    </div>

    <!-- Режим 3: asyncData = Config object -->
    <div v-if="activeMode === 'mode3'" class="space-y-2">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">Режим 3: asyncData = Config (object)</h3>
        <p class="text-sm text-gray-500">Загружает данные с дополнительными параметрами (headers, query)</p>
      </div>
      <Table
        :asyncData="asyncDataMode3"
        :columns="[
          {
            dataField: 'id',
            caption: 'ID',
            type: 'number',
            width: 80
          },
          {
            dataField: 'title',
            caption: 'Заголовок',
            type: 'string',
            isFilter: true,
            isSort: true
          },
          {
            dataField: 'body',
            caption: 'Описание',
            type: 'string',
            isFilter: true
          }
        ]"
        :count-visible-rows="2"
        :pagination="{
          startPage: 1,
          sizePage: 5
        }"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: true,
          hoverRows: true,
          borderRadiusPx: 3,
          width: '42rem',
          height: '39rem'
        }">
        <template #toolbar>
          <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300 truncate my-2.5 ml-5">
            Загрузка из Config
          </div>
        </template>
      </Table>
    </div>

    <!-- Режим 4: asyncData = Function -->
    <div v-if="activeMode === 'mode4'" class="space-y-2">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="text-lg font-semibold">Режим 4: asyncData = Function</h3>
        <Button @click="tableRef?.reloadData()">Перезагрузить данные</Button>
        <p class="text-sm text-gray-500">
          Данные загружаются через функцию. Обновляется при изменениях фильтров/сортировки/поиска/пагинации
        </p>
      </div>
      <Table
        ref="tableRef"
        :asyncData="asyncDataMode4"
        :columns="columns"
        :count-visible-rows="2"
        :pagination="{
          startPage: 1,
          sizePage: 2
        }"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: true,
          hoverRows: true,
          class: {
            toolbar: 'flex-col md:flex-row',
            tfoot: 'bg-zinc-100 dark:bg-zinc-900',
            pagination: 'bg-zinc-100 dark:bg-zinc-900'
          },
          borderRadiusPx: 3,
          width: '42rem',
          height: '39rem'
        }">
        <template #toolbar>
          <div class="flex items-start gap-2 justify-between my-2.5 ml-5 text-xs sm:text-base">
            <div class="">
              <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300 truncate">
                Function Mode (Режим 4)
              </div>
              <div class="mt-1 leading-6 text-neutral-400 dark:text-neutral-500 truncate">
                Данные загружаются через функцию при каждом изменении
              </div>
            </div>
          </div>
        </template>
        <template #status="{ rowData }">
          <Badge :class="[rowData.isActive ? green : red]">
            {{ rowData.isActive ? "Активен" : "Неактивен" }}
          </Badge>
        </template>
      </Table>
    </div>
  </div>
</template>

<style scoped></style>
