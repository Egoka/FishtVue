import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Table from "fishtvue/table/Table.vue"
import { TableOption, TableProps } from "fishtvue/table/Table"
import { nextTick } from "vue"

describe("Table Component", () => {
  const baseData = [
    { name: "orange", color: "orange", shape: "round" },
    { name: "banana", color: "yellow", shape: "long" },
    { name: "grape", color: "purple", shape: "round" },
    { name: "pear", color: "green", shape: "pear-shaped" },
    { name: "grape", color: "purple", shape: "round" }
  ]
  describe("Table Component - Without Library Initialization", () => {
    describe("Basic usage of the component", () => {
      it("renders the table with basic data", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData
          }
        })

        // Проверяем количество строк и ячеек
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(5) // 5 строк
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(15) // 15 ячеек (5 строк * 3 столбца)

        // Проверяем отсутствие элементов интерфейса
        expect(wrapper.find("[data-table-toolbar]").exists()).toBe(false)
        expect(wrapper.find("[data-table-header]").exists()).toBe(false)
        expect(wrapper.find("[data-table-thead]").exists()).toBe(false)
        expect(wrapper.find("[data-table-tfoot]").exists()).toBe(false)
        expect(wrapper.find("[data-table-pagination]").exists()).toBe(false)
        expect(wrapper.find("[data-table-footer]").exists()).toBe(false)
      })
      it("renders the table with basic number data", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: [
              [1, 2, 3],
              [10, 20, 30],
              [100, 200, 300]
            ]
          }
        })

        // Проверяем количество строк и ячеек
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(3) // 5 строк
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(9) // 15 ячеек (5 строк * 3 столбца)

        // Проверяем отсутствие элементов интерфейса
        expect(wrapper.find("[data-table-toolbar]").exists()).toBe(false)
        expect(wrapper.find("[data-table-header]").exists()).toBe(false)
        expect(wrapper.find("[data-table-thead]").exists()).toBe(false)
        expect(wrapper.find("[data-table-tfoot]").exists()).toBe(false)
        expect(wrapper.find("[data-table-pagination]").exists()).toBe(false)
        expect(wrapper.find("[data-table-footer]").exists()).toBe(false)
      })

      it("renders no data message when dataSource is empty", () => {
        const wrapper = mount(Table, {
          props: {
            noData: "Текст при отсутствии данных"
          }
        })

        // Проверяем, что выводится сообщение об отсутствии данных
        const noDataMessage = wrapper.find("[data-table-no-data]")
        expect(noDataMessage.exists()).toBe(true)
        expect(noDataMessage.text()).toBe("Текст при отсутствии данных")

        // Убедимся, что строки таблицы не рендерятся
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(0)
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(0)
      })
    })
    describe("Table Component - Columns", () => {
      it("renders table with basic data and default columns", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true
          }
        })

        // Проверяем количество строк и ячеек
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(5)
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(15) // 5 строк * 3 столбца

        // Проверяем, что рендерится заголовок таблицы
        expect(wrapper.find("[data-table-thead]").exists()).toBe(true)
      })

      it("renders table with specified columns", () => {
        const columns = [{ dataField: "name" }, { dataField: "shape" }, { dataField: "color" }]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns
          }
        })

        // Проверяем количество ячеек
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(5)
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(15) // 5 строк * 3 столбца
      })

      it("renders table with sortable columns", async () => {
        const columns = [
          { dataField: "name", isSort: true },
          { dataField: "shape", isSort: true },
          { dataField: "color", isSort: true }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns
          }
        })

        // Проверяем, что сортировка активна
        expect(wrapper.findAll("[data-table-thead-col-sort]").length).toBe(3)

        // Проверяем, что можно вызвать сортировку
        await wrapper.find("[data-table-thead-col-sort]").trigger("click")
        expect(wrapper.emitted("sort")).toBeTruthy()
      })

      it("renders table with filterable columns", async () => {
        const columns = [
          { dataField: "name", isFilter: true },
          { dataField: "shape", isFilter: true },
          { dataField: "color", isFilter: true }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns
          }
        })

        // Проверяем, что фильтры активны
        expect(wrapper.findAll("[data-table-thead-col-filter]").length).toBe(3)

        // Проверяем, что фильтры работают
        const filterInput = wrapper.find("[data-table-thead-col-filter] input")
        await filterInput.setValue("orange")
        expect(wrapper.emitted("filter")).toBeTruthy()
      })

      it("renders table with custom column captions", () => {
        const columns = [
          { dataField: "name", caption: "Название" },
          { dataField: "shape", caption: "Форма" },
          { dataField: "color", caption: "Цвет" }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns
          }
        })

        // Проверяем заголовки колонок
        const headers = wrapper.findAll("[data-table-thead-col]")
        expect(headers[0].text()).toBe("Название")
        expect(headers[1].text()).toBe("Форма")
        expect(headers[2].text()).toBe("Цвет")
      })

      it("renders table with multiple column types", () => {
        const baseTypeData = [
          {
            name: "orange",
            color: "orange",
            t1: 122530000,
            t2: 4,
            date: "2023-10-13T19:09:01.833Z"
          },
          {
            name: "banana",
            color: "yellow",
            t1: 122520000,
            t2: 3,
            date: "2023-11-12T19:09:01.833Z"
          }
        ]

        const columns = [
          {
            dataField: "name",
            caption: "Название",
            type: "string",
            isSort: true,
            isFilter: true
          },
          {
            dataField: "color",
            caption: "Цвет",
            type: "select",
            isSort: true,
            isFilter: true
          },
          {
            dataField: "date",
            type: "date",
            isSort: true,
            isFilter: true
          },
          {
            dataField: "t1",
            type: "number",
            mask: "price",
            isSort: true,
            isFilter: true
          }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseTypeData,
            columns
          }
        })

        // Проверяем количество строк и колонок
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(2)
        expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(8) // 2 строки * 4 колонки

        // Проверяем наличие фильтров и сортировки для всех типов колонок
        expect(wrapper.findAll("[data-table-thead-col-filter]").length).toBe(4)
        expect(wrapper.findAll("[data-table-thead-col-sort]").length).toBe(4)
      })
    })
    describe("Table Component - Advanced Features", () => {
      it("renders table with custom cell templates", () => {
        const baseCellData = [
          { name: "orange", color: "orange", t1: true, t2: 4, date: "2023-10-13T19:09:01.833Z" },
          { name: "banana", color: "yellow", t1: false, t2: 3, date: "2023-11-12T19:09:01.833Z" }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseCellData,
            columns: [
              { dataField: "name", caption: "Название", type: "string", cellTemplate: "nameTemplate" },
              { dataField: "t2", caption: "Rating", cellTemplate: "ratingTemplate" }
            ]
          },
          slots: {
            nameTemplate: `<template #nameTemplate="{ value }">{{ value.toUpperCase() }}</template>`,
            ratingTemplate: `<template #ratingTemplate="{ value }"><span>⭐ {{ value }}</span></template>`
          }
        })

        // Проверяем отображение кастомных ячеек
        const nameCell = wrapper.find("[data-table-tbody-td]:nth-child(1)")
        expect(nameCell.text()).toBe("ORANGE")

        const ratingCell = wrapper.find("[data-table-tbody-td]:nth-child(2)")
        expect(ratingCell.text()).toBe("⭐ 4")
      })

      it("renders table with toolbar", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            toolbar: true
          },
          slots: {
            toolbar: `<div class="custom-toolbar">Custom Toolbar Content</div>`
          }
        })

        // Проверяем наличие toolbar
        const toolbar = wrapper.find("[data-table-toolbar]")
        expect(toolbar.exists()).toBe(true)
        expect(toolbar.text()).toBe("Custom Toolbar Content")
      })

      it("renders table with enabled sorting", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            sort: true
          }
        })

        // Проверяем, что сортировка активна
        expect(wrapper.findAll("[data-table-thead-col-sort]").length).toBeGreaterThan(0)

        // Проверяем событие сортировки
        await wrapper.find("[data-table-thead-col-sort]").trigger("click")
        expect(wrapper.emitted("sort")).toBeTruthy()
      })

      it("renders table with enabled filters", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            toolbar: true,
            filter: { isClearAllFilter: true, visible: true, noFilter: "No data was found for your query" }
          }
        })

        // Проверяем, что фильтры отображаются
        expect(wrapper.findAll("[data-table-thead-col-filter]").length).toBeGreaterThan(0)

        // Проверяем кнопку очистки фильтров
        expect(wrapper.find("[data-table-clear-filter]").exists()).toBe(false)
        await wrapper.find("[data-table-thead-col-filter] input[data-input]").setValue("orange")

        // Эмулируем задержку 600ms
        vi.advanceTimersByTime(850)
        await nextTick()

        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(1)
        expect(wrapper.find("[data-table-clear-filter]").exists()).toBe(true)

        await wrapper.find("[data-table-thead-col-filter] input[data-input]").setValue("orange12")

        // Эмулируем задержку 600ms
        vi.advanceTimersByTime(850)
        await nextTick()

        expect(wrapper.find("[data-table-no-filter]").text()).toBe("No data was found for your query")

        // Проверяем, что событие очистки фильтров вызывается
        await wrapper.find("[data-table-clear-filter]").trigger("click")
        expect(wrapper.emitted("clear-filter")).toBeTruthy()
        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("renders table with search enabled", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            search: true
          }
        })

        // Проверяем наличие поля поиска
        const searchInput = wrapper.find("[data-table-search] input")
        expect(searchInput.exists()).toBe(true)

        // Проверяем, что событие поиска вызывается
        await searchInput.setValue("orange")

        // Эмулируем задержку 600ms
        vi.advanceTimersByTime(850)
        await nextTick()

        expect(wrapper.emitted("search")?.[0]).toEqual(["orange"])

        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })
    describe("Table Component - Grouping and Summary", () => {
      it("renders table with grouped data", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            grouping: "color"
          }
        })

        // Проверяем наличие групп
        const groups = wrapper.findAll("[data-table-tbody-group]")
        expect(groups.length).toBe(4) // "orange", "yellow", "purple", "green"

        // Проверяем количество строк в группах
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(5) // Все строки отображаются
      })

      it("renders table with enabled summary", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            summary: true
          }
        })

        // Проверяем наличие footer с summary
        const summary = wrapper.find("[data-table-tfoot]")
        expect(summary.exists()).toBe(true)
      })

      it("renders table with isolated summary fields", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: true,
            summary: [{ dataField: "name" }]
          }
        })

        // Проверяем, что summary отображает информацию для указанных полей
        const summaryFields = wrapper.findAll("[data-table-tfoot-th]")
        expect(summaryFields.length).toBeGreaterThan(0)
        expect(summaryFields[0].text()).toContain("Count")
      })

      it("renders table with typed summary", () => {
        const baseSummaryData = [
          { name: "orange", t1: 10, t2: 20, t3: 30, date: "2023-10-13T19:09:01.833Z" },
          { name: "banana", t1: 15, t2: 25, t3: 35, date: "2023-10-14T19:09:01.833Z" },
          { name: "grape", t1: 5, t2: 15, t3: 25, date: "2023-10-15T19:09:01.833Z" }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseSummaryData,
            columns: [
              { dataField: "name", type: "string" },
              { dataField: "t1", type: "number" },
              { dataField: "t2", type: "number" },
              { dataField: "t3", type: "number" },
              { dataField: "date", type: "date" }
            ],
            summary: [
              { dataField: "name", type: "count" },
              { dataField: "t1", type: "max" },
              { dataField: "t2", type: "avg" },
              { dataField: "t3", type: "sum" },
              { dataField: "date", type: "max", dataType: "date" }
            ]
          }
        })

        // Проверяем, что summary отображает корректную информацию для каждого типа
        const summaryFields = wrapper.findAll("[data-table-tfoot-th]")
        expect(summaryFields.length).toBe(5)
        expect(summaryFields[0].text()).toContain("3") // Count
        expect(summaryFields[1].text()).toContain("15") // Max
        expect(summaryFields[2].text()).toContain("20") // Avg
        expect(summaryFields[3].text()).toContain("90") // Sum
        expect(summaryFields[4].text()).toContain("Max: 15.10.2023") // Max date
      })

      it("renders table with formatted summary fields", () => {
        const baseSummaryData = [
          { name: "orange", t1: 10, t2: 20, t3: 30, date: "2023-10-13T19:09:01.833Z" },
          { name: "banana", t1: 15, t2: 25, t3: 35, date: "2023-10-14T19:09:01.833Z" },
          { name: "grape", t1: 5, t2: 15, t3: 25, date: "2023-10-15T19:09:01.833Z" }
        ]

        const wrapper = mount(Table, {
          props: {
            dataSource: baseSummaryData,
            columns: [
              { dataField: "name", type: "string" },
              { dataField: "t1", type: "number" },
              { dataField: "t2", type: "number" },
              { dataField: "t3", type: "number" },
              { dataField: "date", type: "date" }
            ],
            summary: [
              { dataField: "name", type: "count", displayFormat: "Количество: {0}" },
              { dataField: "t1", type: "min", displayFormat: "Минимальное: {0}" },
              { dataField: "t2", type: "avg", displayFormat: "Среднее: {0}" },
              { dataField: "t3", type: "sum", displayFormat: "Сумма: {0}" },
              { dataField: "date", type: "max", displayFormat: "Максимальное: {0}" }
            ]
          }
        })

        // Проверяем форматированное отображение summary
        const summaryFields = wrapper.findAll("[data-table-tfoot-th]")
        expect(summaryFields[0].text()).toBe("Количество: 3")
        expect(summaryFields[1].text()).toBe("Минимальное: 5")
        expect(summaryFields[2].text()).toBe("Среднее: 20")
        expect(summaryFields[3].text()).toBe("Сумма: 90")
        expect(summaryFields[4].text()).toBe("Максимальное: 15.10.2023")
      })
    })
    describe("Table Component - Pagination", () => {
      const generateData = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          date: `2023-10-${String(i + 1).padStart(2, "0")}`,
          value: i * 10
        }))

      it("renders table with pagination enabled", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: generateData(1000),
            columns: [
              { dataField: "name" },
              { dataField: "date", type: "date" },
              { dataField: "value", type: "number" }
            ],
            pagination: true,
            countVisibleRows: 3
          }
        })

        // Проверяем наличие пагинации
        const pagination = wrapper.find("[data-table-pagination]")
        expect(pagination.exists()).toBe(true)

        // Проверяем количество видимых строк
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(3)
      })

      it("renders table with specific start page for pagination", async () => {
        vi.useFakeTimers()
        const data = generateData(1000)

        const wrapper = mount(Table, {
          props: {
            dataSource: data,
            columns: [
              { dataField: "name" },
              { dataField: "date", type: "date" },
              { dataField: "value", type: "number" }
            ],
            pagination: { startPage: 20 },
            countVisibleRows: 3
          }
        })

        await nextTick()
        // Эмулируем задержку 600ms
        vi.advanceTimersByTime(10)
        await nextTick()

        // Проверяем, что начальная страница соответствует заданной
        const firstRow = wrapper.find("[data-table-tbody-tr] [data-table-tbody-td]")
        expect(firstRow.text()).toContain("Item 58") // 20-я страница, 3 строки на страницу

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("renders table with page size selector in pagination", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: generateData(1000),
            columns: [
              { dataField: "name" },
              { dataField: "date", type: "date" },
              { dataField: "value", type: "number" }
            ],
            pagination: { sizePage: 20, sizesSelector: [5, 15, 20, 50, 100, 150] },
            countVisibleRows: 3
          }
        })

        // Проверяем наличие селектора размеров страниц
        const SelectComponent = wrapper.find("[data-table-pagination]").findComponent({ name: "Select" })
        expect(SelectComponent.exists()).toBe(true)
        await wrapper.find("[data-pagination-selector]").trigger("click")
        expect(SelectComponent.vm.isOpenList).toBe(true)
        expect(SelectComponent.vm.value).toBe(20)

        // Проверяем смену размера страницы
        await SelectComponent.findAll("[data-select-list-item]")[3].trigger("click")
        expect(SelectComponent.vm.value).toBe(50)
        expect(wrapper.emitted("switch-size-page")).toBeTruthy()
        expect(wrapper.emitted("switch-size-page")?.[1][0]).toBe(50) // Новое значение размера страницы
      })
    })
    describe("Table Component - Resize Columns", () => {
      const generateData = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          date: `2023-10-${String(i + 1).padStart(2, "0")}`,
          value: i * 10
        }))

      it("allows resizing columns using mouse events", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: generateData(5),
            columns: [
              { dataField: "name", id: "col-name", width: 120, minWidth: 100, maxWidth: 200 },
              { dataField: "date", id: "col-date", type: "date", width: 130, minWidth: 120, maxWidth: 250 },
              { dataField: "value", id: "col-value", type: "number", width: 150 }
            ],
            resizedColumns: true
          }
        })

        const resizeHandle = wrapper.find("[data-table-thead-col-resized] div")

        // Проверяем, что resizeHandle существует
        expect(resizeHandle.exists()).toBe(true)
        expect(wrapper.vm.widthsColumns).toEqual({ name: 120, date: 130, value: 150 })
        // Имитируем mousedown на resizeHandle
        await resizeHandle.trigger("mousedown")
        // Проверяем, что resizableColumn обновилось
        expect(wrapper.vm.resizableColumn).toBe("Col-name-0")

        // Имитируем движение мыши
        // @ts-ignore
        const moveEvent = new MouseEvent("mousemove", { clientX: 200 })
        window.dispatchEvent(moveEvent)

        // Проверяем, что ширина обновилась
        expect(wrapper.vm.widthsColumns).toEqual({ name: 200, date: 130, value: 150 }) // Исходная ширина + delta

        // Имитируем mouseup
        const upEvent = new MouseEvent("mouseup")
        window.dispatchEvent(upEvent)

        // Проверяем, что resizableColumn сбросился
        expect(wrapper.vm.resizableColumn).toBe(null)
      })

      it("respects minWidth and maxWidth constraints during resizing", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: generateData(5),
            columns: [{ dataField: "name", id: "col-name", width: 120, minWidth: 100, maxWidth: 200 }],
            resizedColumns: true
          }
        })

        const resizeHandle = wrapper.find("[data-table-thead-col-resized]")

        // Проверяем, что resizeHandle существует
        expect(resizeHandle.exists()).toBe(true)

        // Имитируем mousedown
        await resizeHandle.trigger("mousedown", { pageX: 150 })

        const instance = wrapper.vm as any

        // Имитируем движение мыши за пределы maxWidth
        const moveEventMax = new MouseEvent("mousemove", { clientX: 400 })
        window.dispatchEvent(moveEventMax)

        // Проверяем, что ширина не превышает maxWidth
        expect(instance.widthsColumns["name"]).toBe(200)

        // Имитируем движение мыши за пределы minWidth
        const moveEventMin = new MouseEvent("mousemove", { clientX: 50 })
        window.dispatchEvent(moveEventMin)

        // Проверяем, что ширина не меньше minWidth
        expect(instance.widthsColumns["name"]).toBe(100)

        // Имитируем mouseup
        const upEvent = new MouseEvent("mouseup")
        window.dispatchEvent(upEvent)

        // Проверяем, что resizableColumn сбросился
        expect(instance.resizableColumn).toBe(null)
      })
    })
    describe("Table Component - click-row and click-cell emits", () => {
      it("emits click-row when a row is clicked", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }, { dataField: "shape" }]
          }
        })

        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(5)

        // Имитируем клик по первой строке
        await rows[0].trigger("click")

        // Проверяем, что событие click-row было вызвано
        const emittedEvents = wrapper.emitted("click-row")
        expect(emittedEvents).toBeTruthy()
        expect(emittedEvents?.[0][0]).toMatchObject({
          data: baseData[0],
          indexRow: 0,
          eventEl: expect.any(HTMLElement) // Элемент строки
        })
      })

      it("emits click-cell when a cell is clicked", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [
              { dataField: "name", caption: "Name", edit: true },
              { dataField: "color", caption: "Color" },
              { dataField: "shape", caption: "Shape" }
            ]
          } as TableProps
        })

        const cells = wrapper.findAll("[data-table-tbody-td]")
        expect(cells.length).toBe(15) // 3 строки * 3 колонки

        // Имитируем клик по первой ячейке
        await cells[0].trigger("click")

        // Проверяем, что событие click-cell было вызвано
        const emittedEvents = wrapper.emitted("click-cell")
        expect(emittedEvents).toBeTruthy()
        expect(emittedEvents?.[0][0]).toMatchObject({
          column: expect.objectContaining({ dataField: "name" }),
          value: "orange",
          data: baseData[0],
          indexRow: 0,
          eventEl: expect.any(HTMLElement) // Элемент ячейки
        })

        // Проверяем, что editableCell обновился
        const instance = wrapper.vm as any
        expect(instance.editableCell).toEqual({ indexRow: 0, indexCol: 0 })
      })

      it("does not set editableCell for non-editable cells", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [
              { dataField: "name", caption: "Name" },
              { dataField: "color", caption: "Color", isEdit: false },
              { dataField: "shape", caption: "Shape" }
            ]
          }
        })

        const cells = wrapper.findAll("[data-table-tbody-td]")
        expect(cells.length).toBe(15)

        // Имитируем клик по не редактируемой ячейке
        await cells[1].trigger("click")

        // Проверяем, что editableCell не изменился
        expect(wrapper.vm.editableCell).toBeUndefined()
      })
    })
    describe("Table Component - External Methods", () => {
      it("adds a new row using addRow", async () => {
        const uuidMock = vi.spyOn(crypto, "randomUUID")
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }, { dataField: "shape" }]
          }
        })
        expect(wrapper.vm.addRow()).toBe(false)

        const instance = wrapper.vm as any

        // Вызываем метод addRow
        const newRow = { name: "pear new", color: "green", shape: "pear-shaped" }
        const newIndex = instance.addRow(newRow)
        await nextTick()

        // Проверяем, что строка добавлена
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(6)
        expect(wrapper.emitted("add-row")?.[0][0]).toEqual({
          value: newRow,
          index: newIndex,
          _key: uuidMock.mock.results.at(-1)?.value
        })

        // Проверяем, что новая строка добавлена на правильную позицию
        expect(instance.allData[newIndex]).toMatchObject(newRow)
      })

      it("deletes a row using deleteRow", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }, { dataField: "shape" }]
          }
        })
        expect(wrapper.vm.deleteRow()).toBe(false)

        const instance = wrapper.vm as any

        // Вызываем метод deleteRow
        const keyToDelete = wrapper.vm.allData[2]?.["_key"] // Удаляем вторую строку
        const deletedRow = instance.deleteRow(keyToDelete)
        await nextTick()

        // Проверяем, что строка удалена
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(4)

        // Проверяем, что удалённая строка совпадает с ожиданиями
        expect(deletedRow[0]).toMatchObject({ name: "grape", color: "purple", shape: "round", _key: keyToDelete })
      })

      it("updates a row using updateRow", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }, { dataField: "shape" }]
          }
        })
        expect(wrapper.vm.updateRow()).toBe(false)

        const instance = wrapper.vm as any

        // Вызываем метод updateRow
        const keyToUpdate = wrapper.vm.allData[3]?.["_key"]
        const updatedData = { color: "green" }
        const updatedRow = instance.updateRow(keyToUpdate, updatedData)
        await nextTick()

        // Проверяем, что строка обновлена
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(5)

        // Проверяем обновлённое значение
        expect(updatedRow.color).toBe("green")
      })

      it("updates a cell using updateCell", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [
              { dataField: "name", id: "col-name" },
              { dataField: "color", id: "col-color" },
              { dataField: "shape", id: "col-shape" }
            ]
          }
        })
        expect(wrapper.vm.updateCell()).toBe(false)

        const instance = wrapper.vm as any

        // Вызываем метод updateCell
        const keyToUpdate = wrapper.vm.allData[0]?.["_key"]
        const columnToUpdate = { dataField: "color" }
        const newValue = "blue"
        const updatedCell = instance.updateCell(keyToUpdate, columnToUpdate, newValue)
        await nextTick()
        // Проверяем, что значение ячейки обновлено
        expect(updatedCell).toBe("blue")

        // Проверяем обновление DOM
        const firstRowCells = wrapper.findAll("[data-table-tbody-tr]")[0].findAll("[data-table-tbody-td]")
        expect(firstRowCells[1].text()).toBe("blue")
      })
    })
    describe("Table Component - Style Props", () => {
      it("applies horizontal lines between rows", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: {
              horizontalLines: true
            }
          } as TableProps
        })

        const rows = wrapper.findAll("[data-table-tbody-td]")
        rows.forEach((row) => {
          expect(row.classes()).toContain("border-b") // Класс, добавляющий горизонтальные линии
        })
      })

      it("applies vertical lines between columns", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }],
            styles: {
              verticalLines: true
            }
          } as TableProps
        })

        const cells = wrapper.findAll("[data-table-tbody-td]")
        cells.forEach((cell) => {
          expect(cell.classes()).toContain("border-r") // Класс, добавляющий вертикальные линии
        })
      })

      it("applies lines between column filters", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name", isFilter: true }],
            styles: {
              filterLines: true
            }
          } as TableProps
        })

        const filters = wrapper.findAll("[data-table-thead-col] > div")
        filters.forEach((filter) => {
          expect(filter.classes()).toContain("border-r") // Линии между фильтрами
        })
      })

      it("applies hover style for rows", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: {
              hoverRows: "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50"
            }
          } as TableProps
        })

        const rows = wrapper.findAll("[data-table-tbody-tr]")
        rows.forEach((row) => {
          expect(row.classes()).toContain("hover:bg-neutral-100/90")
          expect(row.classes()).toContain("dark:hover:bg-neutral-900/50")
        })
      })

      it("applies striped background for rows", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: {
              isStripedRows: true
            }
          } as TableProps
        })

        const rows = wrapper.findAll("[data-table-tbody-tr]")
        rows.forEach((row) => {
          expect(row.classes()).toContain("odd:bg-white")
          expect(row.classes()).toContain("even:bg-neutral-50")
        })
      })

      it("applies border radius to table", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: {
              borderRadiusPx: 10
            }
          } as TableProps
        })

        const tableBody = wrapper.find("[data-table-body]")
        expect(tableBody.attributes("style")).toContain("border-radius: 10px;")
      })

      it("applies custom height to table cells", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: {
              heightCell: 50
            }
          } as TableProps
        })

        const cells = wrapper.findAll("[data-table-tbody-not-cell-template]")
        cells.forEach((cell) => {
          expect(cell.attributes("style")).toContain("min-height: 50px;")
        })
      })

      it("applies custom maskQuery style", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            search: true,
            styles: {
              maskQuery: "font-bold text-theme-700"
            }
          } as TableProps
        })

        // Проверяем наличие поля поиска
        const searchInput = wrapper.find("[data-table-search] input")
        expect(searchInput.exists()).toBe(true)

        // Проверяем, что событие поиска вызывается
        await searchInput.setValue("orange")

        vi.advanceTimersByTime(850)
        await nextTick()
        const highlightedText = wrapper.find("[data-table-tbody-td] [data-table-tbody-not-cell-template] div span")
        expect(highlightedText.exists()).toBe(true)
        expect(highlightedText.html()).toBe('<span class="font-bold text-theme-700">orange</span>')
        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("applies custom class styles", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            toolbar: true,
            styles: {
              class: {
                body: "custom-body-class",
                toolbar: "custom-toolbar-class"
              }
            }
          } as TableProps
        })

        expect(wrapper.find("[data-table-component]").classes()).toContain("custom-body-class")
        expect(wrapper.find("[data-table-toolbar]").classes()).toContain("custom-toolbar-class")
      })

      it("applies custom border styles", async () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            styles: { border: "border-0 border-b-0 border-t-0 border-r-0" }
          } as TableProps
        })

        const tableBody = wrapper.find("[data-table-body]")
        expect(tableBody.classes()).toContain("border-0")
        expect(tableBody.classes()).toContain("border-b-0")
      })

      it("applies border styles using an object", async () => {
        const wrapper = mount(Table, {
          slots: {
            header: '<div class="slot-header">Slot header</div>'
          },
          props: {
            dataSource: baseData,
            styles: {
              border: {
                table: "border-red-500",
                header: "border-blue-500"
              }
            }
          } as TableProps
        })

        const tableBody = wrapper.find("[data-table-body]")
        const header = wrapper.find("[data-table-header-slot]")

        expect(tableBody.classes()).toContain("border-red-500")
        expect(header.classes()).toContain("border-blue-500")
      })
    })
  })
  describe("Table Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options: TableOption = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Table: options
          }
        })
      }
    })
    // Test with global options from library
    it("applies default options from library", () => {
      const app = createAppWithFishtVue({
        mode: "filled",
        toolbar: true,
        edit: true,
        sort: true,
        filter: true,
        grouping: "color",
        resizedColumns: false,
        pagination: false,
        search: true,
        countVisibleRows: 5,
        sizeLoadingRows: 5,
        noData: "No data",
        noColumn: "No column",
        countDataOnLoading: 1000,
        class: "optionClass",
        styles: { class: { body: "optionClassBody" } }
      })

      const wrapper = mount(Table, {
        global: { plugins: [app] },
        props: {
          dataSource: baseData
        }
      })

      expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(5)

      expect(wrapper.vm.mode).toBe("filled")
      expect(wrapper.vm.toolbar).toBe(true)
      expect(wrapper.vm.isEditCells).toBe(true)
      expect(wrapper.vm.sort).toBe(true)
      expect(wrapper.vm.filter).toBe(true)
      expect(wrapper.vm.grouping).toBe("color")
      expect(wrapper.vm.resizedColumns).toBe(false)
      expect(wrapper.vm.pagination).toBe(false)
      expect(wrapper.vm.isSearch).toBe(true)
      expect(wrapper.vm.countVisibleRows).toBe(5)
      expect(wrapper.vm.sizeLoadingRows).toBe(5)
      expect(wrapper.vm.noData).toBe("No data")
      expect(wrapper.vm.noColumn).toBe("No column")
      expect(wrapper.vm.countDataOnLoading).toBe(1000)
      expect(wrapper.vm.classBaseTable).toContain("optionClass")
      expect(wrapper.vm.styles).toEqual({
        animation: "transition-all duration-500",
        borderRadiusPx: 7,
        class: {
          body: "optionClassBody"
        },
        height: "",
        horizontalLines: true,
        hoverRows: "",
        isStripedRows: false,
        width: ""
      })
    })
  })
})
