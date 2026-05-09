<script setup lang="ts">
  import type { IColumn } from "fishtvue/table"
  import type { Panel } from "fishtvue/split"
  import Split from "fishtvue/split/Split.vue"
  import Table from "fishtvue/table/Table.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import Button from "fishtvue/button/Button.vue"
  import Form from "fishtvue/form/Form.vue"
  import type { FormProps } from "fishtvue/form"
  import { ref, shallowRef } from "vue"

  const panels = ref<Panel[]>([
    {
      name: "table",
      minSize: 10
    },
    {
      name: "item",
      minSize: 10,
      size: 30,
      hidden: true
    }
  ])
  // Моковые данные для пользователей
  const data = shallowRef<Array<any>>([
    {
      id: 1,
      name: "Александр Иванов",
      email: "alex.ivanov@example.com",
      role: "ADMIN",
      slug: "alex-ivanov",
      bio: "Администратор системы, эксперт по веб-разработке и управлению контентом",
      photoUrl: "/avatars/William_Taylor.jpg",
      articlesCount: 25,
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-20T14:22:00Z"
    },
    {
      id: 2,
      name: "Мария Петрова",
      email: "maria.petrova@example.com",
      role: "AUTHOR",
      slug: "maria-petrova",
      bio: "Автор статей о дизайне и UX/UI, специалист по созданию пользовательских интерфейсов",
      photoUrl: null,
      articlesCount: 18,
      createdAt: "2024-01-08T11:20:00Z",
      updatedAt: "2024-01-18T16:45:00Z"
    },
    {
      id: 3,
      name: "Дмитрий Сидоров",
      email: "dmitry.sidorov@example.com",
      role: "AUTHOR",
      slug: "dmitry-sidorov",
      bio: "Технический писатель, эксперт по программированию и современным технологиям",
      photoUrl: null,
      articlesCount: 32,
      createdAt: "2024-01-05T14:10:00Z",
      updatedAt: "2024-01-19T13:30:00Z"
    },
    {
      id: 4,
      name: "Елена Козлова",
      email: "elena.kozlova@example.com",
      role: "AUTHOR",
      slug: "elena-kozlova",
      bio: "Контент-менеджер, специалист по маркетингу и созданию образовательного контента",
      photoUrl: null,
      articlesCount: 15,
      createdAt: "2024-01-12T16:25:00Z",
      updatedAt: "2024-01-21T09:40:00Z"
    },
    {
      id: 5,
      name: "Анна Смирнова",
      email: "anna.smirnova@example.com",
      role: "READER",
      slug: "anna-smirnova",
      bio: "Активный читатель, интересуется технологиями и дизайном",
      photoUrl: null,
      articlesCount: 0,
      createdAt: "2024-01-14T12:00:00Z",
      updatedAt: "2024-01-20T15:20:00Z"
    },
    {
      id: 6,
      name: "Владимир Новиков",
      email: "vladimir.novikov@example.com",
      role: "READER",
      slug: "vladimir-novikov",
      bio: "Энтузиаст программирования, изучает новые технологии",
      photoUrl: null,
      articlesCount: 0,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-22T11:15:00Z"
    },
    {
      id: 7,
      name: "Ольга Волкова",
      email: "olga.volkova@example.com",
      role: "AUTHOR",
      slug: "olga-volkova",
      bio: "Дизайнер и иллюстратор, создает визуальный контент для статей",
      photoUrl: null,
      articlesCount: 8,
      createdAt: "2024-01-16T08:45:00Z",
      updatedAt: "2024-01-23T14:30:00Z"
    },
    {
      id: 8,
      name: "Сергей Морозов",
      email: "sergey.morozov@example.com",
      role: "ADMIN",
      slug: "sergey-morozov",
      bio: "Системный администратор, отвечает за техническую поддержку и безопасность",
      photoUrl: null,
      articlesCount: 5,
      createdAt: "2024-01-18T13:20:00Z",
      updatedAt: "2024-01-24T16:45:00Z"
    }
  ])

  // Конфигурация колонок таблицы
  const columns = shallowRef<Array<IColumn>>([
    {
      dataField: "name",
      name: "name",
      type: "string",
      caption: "Имя",
      visible: true,
      width: 250,
      minWidth: 200,
      isFilter: true,
      isSort: true,
      defaultSort: "asc",
      class: {
        td: "cursor-pointer"
      }
    },
    {
      dataField: "email",
      name: "email",
      type: "string",
      caption: "Email",
      visible: true,
      width: 250,
      minWidth: 200,
      isFilter: true,
      isSort: true
    },
    {
      dataField: "role",
      name: "role",
      type: "select",
      caption: "Роль",
      visible: true,
      width: 150,
      minWidth: 150,
      isFilter: true,
      isSort: true,
      cellTemplate: "role",
      paramsFilter: {
        dataSelect: [
          {
            id: "ADMIN",
            value: "Администратор"
          },
          {
            id: "AUTHOR",
            value: "Автор"
          },
          {
            id: "READER",
            value: "Читатель"
          }
        ]
      }
    },
    {
      dataField: "bio",
      name: "bio",
      type: "string",
      caption: "Описание",
      visible: true,
      width: 300,
      minWidth: 250,
      isFilter: true,
      isSort: false
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
      caption: "Зарегистрирован",
      visible: true,
      width: 150,
      minWidth: 120,
      isFilter: true,
      isSort: true
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
      isSort: true
    }
  ])

  const red = "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950 dark:text-red-300 dark:ring-red-400/10"
  const green =
    "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-300 dark:ring-green-400/20"
  const blue = "bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-400/10"
  const yellow =
    "bg-yellow-50 text-yellow-700 ring-yellow-600/10 dark:bg-yellow-950 dark:text-yellow-300 dark:ring-yellow-400/10"

  // Функция для получения стилей роли
  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return red
      case "AUTHOR":
        return green
      case "READER":
        return blue
      default:
        return yellow
    }
  }

  // Функция для получения текста роли
  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Администратор"
      case "AUTHOR":
        return "Автор"
      case "READER":
        return "Читатель"
      default:
        return "Неизвестно"
    }
  }
  const activeRow = ref<string>()

  // Данные формы редактирования
  const formValues = ref({
    name: "",
    email: "",
    role: "",
    slug: "",
    bio: ""
  })

  // Структура формы редактирования пользователя
  const formStructure = ref<FormProps["structure"]>([
    {
      class: "border-b border-gray-900/10 pb-12",
      classGrid: "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6",
      fields: [
        {
          typeComponent: "Input",
          name: "name",
          rules: { required: true },
          label: "Имя",
          placeholder: "Введите имя пользователя",
          classCol: "sm:col-span-6"
        },
        {
          typeComponent: "Input",
          name: "email",
          rules: { required: true, email: true },
          label: "Email",
          placeholder: "Введите email",
          classCol: "sm:col-span-6"
        },
        {
          typeComponent: "Select",
          name: "role",
          rules: { required: true },
          label: "Роль",
          classCol: "sm:col-span-6",
          ...({
            params: {
              dataSelect: [
                {
                  id: "ADMIN",
                  value: "Администратор"
                },
                {
                  id: "AUTHOR",
                  value: "Автор"
                },
                {
                  id: "READER",
                  value: "Читатель"
                }
              ]
            }
          } as any)
        },
        {
          typeComponent: "Input",
          name: "slug",
          rules: { required: true },
          label: "Slug",
          placeholder: "Введите slug",
          classCol: "sm:col-span-6"
        },
        {
          typeComponent: "Aria",
          name: "bio",
          rules: {},
          label: "Описание",
          placeholder: "Введите описание пользователя",
          classCol: "sm:col-span-6"
        }
      ]
    }
  ])

  // Поиск пользователя по slug
  const findUserBySlug = (slug: string) => {
    return data.value.find((user) => user.slug === slug)
  }

  // Загрузка данных пользователя в форму
  const loadUserData = (slug: string) => {
    const user = findUserBySlug(slug)
    if (user) {
      formValues.value = {
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        slug: user.slug || "",
        bio: user.bio || ""
      }
    }
  }

  const open = (data: { eventEl: HTMLElement; data: any; indexRow: number }) => {
    const userSlug = data.data.slug
    if (userSlug) {
      activeRow.value = userSlug
      loadUserData(userSlug)
      if (panels.value?.[1]?.hidden) panels.value[1].hidden = false
    }
  }

  const close = () => {
    if (panels.value[1]) panels.value[1].hidden = true
    activeRow.value = undefined
    formValues.value = {
      name: "",
      email: "",
      role: "",
      slug: "",
      bio: ""
    }
  }

  // Обработчик отправки формы
  const handleSubmit = () => {
    if (activeRow.value) {
      const user = findUserBySlug(activeRow.value)
      if (user) {
        // Сохраняем старый slug для поиска
        const oldSlug = user.slug

        // Обновляем данные пользователя
        user.name = formValues.value.name
        user.email = formValues.value.email
        user.role = formValues.value.role
        user.slug = formValues.value.slug
        user.bio = formValues.value.bio
        user.updatedAt = new Date().toISOString()

        // Если slug изменился, обновляем activeRow
        if (oldSlug !== formValues.value.slug) {
          activeRow.value = formValues.value.slug
        }

        // Здесь можно добавить вызов API для сохранения изменений
        console.log("Сохранение пользователя:", user)
      }
    }
  }
</script>

<template>
  <Split
    :panels="panels"
    units="percentages"
    :styles="{
      separator: 'bg-transparent dark:bg-transparent w-2',
      panel: 'max-h-[calc(100vh-24px)] sm:rounded-xl bg-zinc-100 dark:bg-zinc-900 p-3'
    }">
    <template #table>
      <!--      <Table-->
      <!--        :data-source="data"-->
      <!--        pagination>-->
      <!--      </Table>-->
      <Table
        :dataSource="[...data, ...data]"
        :columns="columns"
        search
        toolbar
        class="p-0 overflow-auto"
        :styles="{
          activeRow: 'bg-zinc-100 dark:bg-zinc-950',
          hoverRows: 'hover:bg-zinc-100 dark:hover:bg-zinc-950',
          class: {
            toolbar: 'flex-col md:flex-row'
          },
          width: '100%',
          height: 'calc(100vh - 47px)'
        }"
        pagination
        @click-row="open">
        <template #toolbar>
          <div class="flex items-start gap-2 justify-between my-2.5 ml-5 text-xs sm:text-base">
            <div class="">
              <div class="text-lg sm:text-2xl font-medium leading-8 text-black dark:text-zinc-300">
                Управление пользователями
              </div>
              <div class="mt-1 leading-6 text-neutral-400 dark:text-neutral-500">
                Просмотр и управление пользователями системы
              </div>
            </div>
          </div>
        </template>
        <template #role="{ rowData }">
          <Badge :class="getRoleStyle(rowData.role)">
            {{ getRoleText(rowData.role) }}
          </Badge>
        </template>
      </Table>
    </template>
    <template #item>
      <div class="relative h-[calc(100vh-50px)] overflow-y-auto">
        <Button
          class="absolute -top-1 -right-1 z-10"
          type="icon"
          :mode="'primary'"
          icon="x-mark"
          @click="close"></Button>
        <div class="px-4 py-6">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-black dark:text-zinc-300 mb-2">Редактирование пользователя</h2>
            <p class="text-sm text-neutral-400 dark:text-neutral-500">
              Измените данные пользователя и нажмите "Сохранить"
            </p>
          </div>
          {{ formValues }}
          <Form
            :formFields="formValues"
            :structure="formStructure"
            modeValidate="onChange"
            submitButton="Сохранить"
            @submit="handleSubmit" />
        </div>
      </div>
    </template>
  </Split>
</template>

<style scoped></style>
