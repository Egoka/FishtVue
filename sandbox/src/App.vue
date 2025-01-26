<script setup lang="ts">
  import Select from "fishtvue/select/Select.vue"
  import Switch from "fishtvue/switch/Switch.vue"
  import Table from "fishtvue/table/Table.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import LD from "lodash"
  import type { ITableStyles } from "fishtvue/table"
  import { reactive, ref } from "vue"

  const refLink = ref("awd")

  function generateData(size: number) {
    return LD.times(size, (key) => {
      const item = LD.random(size)
      return {
        key: key,
        name: `Car ${item + item}`,
        age: new Date(2023, item % 12, item % 25, 0, 0, 0),
        etc: `Etc ${item}`,
        t1: item % 25,
        t2: item % 6,
        t3: item % 10,
        t4: item % 15
      }
    })
  }

  const data = reactive({
    generateData1000: generateData(1000),
    generateData100: generateData(100),
    generateData5: generateData(5)
  })
  const mode = ref("filled")
  const countVisibleRowsExampleTwo = ref<number>(3)
  const styles = reactive<ITableStyles>({ horizontalLines: false })
  const classesDataSelect = ref([
    { id: "body", value: "Тело компонента", key: { body: "p-1.5 bg-theme-300 dark:bg-theme-800" } },
    { id: "toolbar", value: "toolbar", key: { toolbar: "justify-end items-end bg-theme-300 dark:bg-theme-800" } },
    { id: "bodyTable", value: "bodyTable", key: { bodyTable: "bg-theme-300 dark:bg-theme-800" } },
    { id: "slotHeader", value: "slotHeader", key: { slotHeader: "bg-theme-300 dark:bg-theme-800" } },
    { id: "slotFooter", value: "slotFooter", key: { slotFooter: "bg-theme-300 dark:bg-theme-800" } },
    { id: "table", value: "table", key: { table: "bg-theme-300 dark:bg-theme-800" } },
    { id: "thead", value: "thead", key: { thead: "bg-theme-300 dark:bg-theme-800" } },
    { id: "tbody", value: "tbody", key: { tbody: "bg-theme-300 dark:bg-theme-800" } },
    { id: "tfoot", value: "tfoot", key: { tfoot: "bg-theme-300 dark:bg-theme-800" } },
    {
      id: "group",
      value: "group",
      key: {
        group: "text-left text-gray-800 dark:text-gray-300 px-6 py-2 pr-3 pl-10 sm:pl-12 bg-theme-300 dark:bg-theme-800"
      }
    },
    {
      id: "groupText",
      value: "groupText",
      key: {
        groupText: "left-10 sm:left-12 flex items-center w-fit min-h-[2.5rem] truncate bg-theme-300 dark:bg-theme-800"
      }
    },
    { id: "pagination", value: "pagination", key: { pagination: "bg-theme-300 dark:bg-theme-800" } }
  ])
</script>

<template>
  <div class="border-b border-theme-700/50 dark:border-theme-500/50 pb-0 mt-10">
    <Select :data-select="[12, 21, 23, 4, 34, 234]" :params-fix-window="{ eventClose: 'click' }"></Select>
    <h2 id="styles" class="ml-5 text-xl font-semibold leading-7 text-theme-600 dark:text-theme-500">Стилизация</h2>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">mode</Badge>
        : Режим стилизации таблицы. Доступно три разных стиля: filled, outlined, underlined
      </p>
    </div>
    <div class="grid transition grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-6">
      <div class="col-span-full my-5">
        <Table
          key="TableMode"
          :data-source="data.generateData1000"
          :count-visible-rows="5"
          filter
          sort
          resized-columns
          search
          :mode="mode"
          :columns="[
            {},
            { width: 110 },
            { type: 'date' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' }
          ]"
          :summary="[
            { type: 'count' },
            { type: 'min' },
            { type: 'max' },
            { type: 'count' },
            { type: 'max' },
            { type: 'max' },
            { type: 'max' },
            { type: 'max' }
          ]"
          :pagination="{ sizePage: 100 }"
          toolbar>
          <template #toolbar>
            <Select
              label="Стиль"
              :data-select="['filled', 'outlined', 'underlined']"
              v-model="mode"
              :mode="mode"
              class-body="w-[9rem] mb-0 rounded-md" />
          </template>
        </Table>
      </div>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">horizontalLines</Badge>
        : Булево значение, указывающее, должны ли отображаться горизонтальные линии между строками таблицы.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">verticalLines</Badge>
        : Булево значение, указывающее, должны ли отображаться вертикальные линии между столбцами таблицы.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">filterLines</Badge>
        : Булево значение, указывающее, должны ли отображаться линии между фильтрами столбцов таблицы.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">hoverRows</Badge>
        : Строка или булево значение, определяющее стиль при наведении на строки таблицы. Может принимать значения
        "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50" для применения фонового цвета при наведении, или
        true/false для включения/отключения стиля при наведении.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">isStripedRows</Badge>
        : Булево значение, указывающее, должны ли строки таблицы иметь полосатый фон.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">borderRadiusPx</Badge>
        : Число, определяющее радиус скругления углов таблицы в пикселях.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">heightCell</Badge>
        : Число, определяющее высоту ячейки таблицы в пикселях.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">maskQuery</Badge>
        : Строка, определяющая стиль для выделения поискового запроса в тексте таблицы.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">class</Badge>
        : Объект, содержащий классы стилей для различных элементов таблицы. Внутри объекта можно задать классы для
        следующих элементов: body, toolbar, bodyTable, slotHeader, slotFooter, table, thead, tbody, tfoot, group,
        groupText, pagination.
      </p>
    </div>
    <div class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
      <p>
        <Badge mode="outline">border</Badge>
        : Строка или объект, определяющий стили границ таблицы и ее элементов. Может принимать значения
        "border-neutral-200 dark:border-neutral-800" для применения стандартной границы, "border-0 border-b-0 border-t-0
        border-r-0" для отключения границы, или объект с ключами table, header, filter, head, cell, summary, pagination,
        footer, определяющими стили границ для соответствующих элементов таблицы.
      </p>
    </div>
    <div class="grid transition grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-6">
      <div class="col-span-full my-5">
        <Table
          :data-source="data.generateData1000"
          :count-visible-rows="countVisibleRowsExampleTwo ?? 5"
          filter
          sort
          resized-columns
          search
          :columns="[
            {},
            { width: 110 },
            { type: 'date' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' },
            { type: 'select' }
          ]"
          :summary="[
            { type: 'count' },
            { type: 'min' },
            { type: 'max' },
            { type: 'count' },
            { type: 'max' },
            { type: 'max' },
            { type: 'max' },
            { type: 'max' }
          ]"
          :pagination="{ sizePage: 100 }"
          toolbar
          :count-data-on-loading="100.0"
          :styles="{ ...styles }">
          <template #header>
            <div class="flex flex-wrap m-2">
              <Switch label="Горизонтальные линии" v-model="styles.horizontalLines" :switching-type="'switch'"></Switch>
              <Switch label="Вертикальные линии" v-model="styles.verticalLines" :switching-type="'switch'"></Switch>
              <Switch label="Разделители заголовков" v-model="styles.filterLines" :switching-type="'switch'"></Switch>
              <Switch label="Выделение при наведении" v-model="styles.hoverRows" :switching-type="'switch'"></Switch>
              <Switch label="Чередующиеся строки" v-model="styles.isStripedRows" :switching-type="'switch'"></Switch>
            </div>
            <div class="flex flex-wrap m-2">
              <Select
                label="Радиус"
                class-select="justify-end pr-px"
                :dataSelect="[1, 3, 5, 7, 9, 13, 17, 25, 30]"
                no-query
                v-model="styles.borderRadiusPx"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear>
                <template v-if="styles.borderRadiusPx" #after>px</template>
              </Select>
              <Select
                label="Высота ячейки"
                class-select="justify-end pr-px"
                :dataSelect="[20, 30, 40, 60, 80, 100]"
                no-query
                v-model="styles.heightCell"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear>
                <template v-if="styles.heightCell" #after>px</template>
              </Select>
              <Select
                label="Рамка"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear
                multiple
                :max-visible="0"
                noQuery
                :data-select="borderDataSelect"
                @update:model-value="
                  (value) =>
                    (styles.border = (value as [])?.reduce(
                      (result, item) => Object.assign(result, borderDataSelect.find((i) => i.id === item).key),
                      {}
                    ))
                " />
              <Select
                label="Зоны таблицы"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear
                multiple
                :max-visible="0"
                noQuery
                :data-select="classesDataSelect"
                @update:model-value="
                  (value) =>
                    (styles.class = (value as [])?.reduce(
                      (result, item) => Object.assign(result, classesDataSelect.find((i) => i.id === item).key),
                      {}
                    ))
                " />
            </div>
            <div class="flex flex-wrap m-2">
              <Select
                label="Ширина"
                class-select="justify-end pr-px"
                :data-select="[400, 500, 700, 900, 1300, 1700, 2500, 3000]"
                no-query
                v-model="styles.width"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear>
                <template v-if="styles.width" #after>px</template>
              </Select>
              <Select
                label="Высота"
                class-select="justify-end pr-px"
                :data-select="[600, 700, 900, 1300, 1700, 2500, 3000]"
                no-query
                v-model="styles.height"
                class-body="m-2 w-[9rem] mb-0 rounded-md"
                clear>
                <template v-if="styles.height" #after>px</template>
              </Select>
              <Select
                label="Количество видимых строк"
                class-select="justify-end pr-px"
                :data-select="[1, 3, 5, 7, 9, 13, 17, 25, 30]"
                no-query
                v-model="countVisibleRowsExampleTwo"
                class-body="m-2 w-[15rem] mb-0 rounded-md"
                clear>
                <template v-if="countVisibleRowsExampleTwo" #after>строк</template>
              </Select>
            </div>
          </template>
          <template #footer>
            <tr class="flex w-full justify-end text-right">
              <th scope="row" colspan="3" class="md atn auc ave avm awa awf axr bxt cgi">Subtotal</th>
              <td class="atm aue ave avm awa axr cgp">$8,800.00</td>
            </tr>
          </template>
        </Table>
        <div class="col-span-full my-5">
          <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Пример таблицы без интерфейсов управления
          </p>
          <Table
            :data-source="data.generateData100"
            :count-visible-rows="5"
            :columns="[
              {},
              { width: 110 },
              { type: 'date' },
              { type: 'select' },
              { type: 'select' },
              { type: 'select' },
              { type: 'select' },
              { type: 'select' }
            ]"
            :styles="{ horizontalLines: false, verticalLines: true, class: { thead: 'hidden' }, borderRadiusPx: 3 }" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
