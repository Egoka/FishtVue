import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import { addDays, format } from "date-fns"
import * as functionHandler from "fishtvue/utils/functionHandler"
import Table from "fishtvue/table/Table.vue"
import { TableOption, TableProps } from "fishtvue/table/Table"
import { nextTick } from "vue"

describe("Table Component", () => {
  beforeAll(() => {
    // @ts-ignore
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    // Mock fetch globally to prevent real HTTP requests
    global.fetch = vi.fn()
  })

  beforeEach(() => {
    // Reset fetch mock before each test and set default response
    vi.mocked(global.fetch).mockClear()
    // Default mock: return empty array to prevent network errors
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => []
    } as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
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

        const columns: TableProps["columns"] = [
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
        expect(summaryFields[0].text()).toContain("Кол. 5")
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
      const generateData = (count: number) => {
        const startDate = new Date(2023, 9, 1) // October 1, 2023
        return Array.from({ length: count }, (_, i) => {
          const currentDate = addDays(startDate, i)
          return {
            id: i + 1,
            name: `Item ${i + 1}`,
            date: format(currentDate, "yyyy-MM-dd"),
            value: i * 10
          }
        })
      }

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
              { dataField: "name", width: 120, minWidth: 100, maxWidth: 200 },
              { dataField: "date", type: "date", width: 130, minWidth: 120, maxWidth: 250 },
              { dataField: "value", type: "number", width: 150 }
            ],
            resizedColumns: true
          } as TableProps
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
        const uuidMock = vi.spyOn(functionHandler, "generateUUID")
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name" }, { dataField: "color" }, { dataField: "shape" }]
          }
        })
        expect(wrapper.vm.addRow()).toBeNull()

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
        expect(wrapper.vm.deleteRow()).toBeNull()

        const instance = wrapper.vm as any

        // Вызываем метод deleteRow
        const keyToDelete = wrapper.vm.allData?.[2]?.["_key"] // Удаляем вторую строку
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
        expect(wrapper.vm.updateRow()).toBeNull()

        const instance = wrapper.vm as any

        // Вызываем метод updateRow
        const keyToUpdate = wrapper.vm.allData?.[3]?.["_key"]
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
        expect(wrapper.vm.updateCell()).toBeNull()

        const instance = wrapper.vm as any

        // Вызываем метод updateCell
        const keyToUpdate = wrapper.vm.allData?.[0]?.["_key"]
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
        const highlightedText = wrapper.find("[data-table-tbody-td] [data-table-tbody-not-cell-template] div mark")
        expect(highlightedText.exists()).toBe(true)
        expect(highlightedText.text()).toBe("orange")
        expect(highlightedText.classes()).toContain("fishtvue-table")
        expect(highlightedText.classes()).toContain("font-bold")
        expect(highlightedText.classes()).toContain("text-theme-700")
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
        activeRow: "",
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
  describe("Table Component - Audit: XSS / cleanup / a11y / unstyled", () => {
    const XSS = "<img src=x onerror=alert(1)>"
    // unstyled инициализируется через window.FishtVue fallback при install — чистим, чтобы
    // не утекало в соседние тесты/файлы (см. memory: window.FishtVue leak across Vitest files).
    afterEach(() => {
      try {
        // @ts-ignore
        delete window.FishtVue
      } catch {
        // @ts-ignore
        window.FishtVue = undefined
      }
    })

    describe("Issue 1 — XSS via v-html", () => {
      it("does not render raw HTML from cell data (cell content)", () => {
        const wrapper = mount(Table, {
          props: { dataSource: [{ name: XSS }], columns: [{ dataField: "name" }] }
        })
        expect(wrapper.find("[data-table-tbody-td] img").exists()).toBe(false)
        expect(wrapper.find("[data-table-tbody-not-cell-template]").text()).toContain("<img")
      })

      it("renders search highlight via <mark> text-node, not v-html <span>", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: { dataSource: baseData, search: true, styles: { maskQuery: "font-bold text-theme-700" } } as TableProps
        })
        await wrapper.find("[data-table-search] input").setValue("orange")
        vi.advanceTimersByTime(850)
        await nextTick()
        const cell = wrapper.find("[data-table-tbody-td] [data-table-tbody-not-cell-template] div")
        const mark = cell.find("mark")
        expect(mark.exists()).toBe(true)
        expect(mark.text()).toBe("orange")
        expect(mark.classes()).toContain("font-bold")
        expect(mark.classes()).toContain("text-theme-700")
        // нет инъекции через v-html span
        expect(cell.find("span").exists()).toBe(false)
        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("does not highlight cells without an active query", () => {
        const wrapper = mount(Table, {
          props: { dataSource: baseData, columns: [{ dataField: "name" }] }
        })
        expect(wrapper.find("[data-table-tbody-not-cell-template] mark").exists()).toBe(false)
        expect(wrapper.find("[data-table-tbody-td]").text()).toBe("orange")
      })

      it("renders noData message as text, not HTML", () => {
        const wrapper = mount(Table, { props: { dataSource: [], noData: XSS } })
        const el = wrapper.find("[data-table-no-data]")
        expect(el.exists()).toBe(true)
        expect(el.find("img").exists()).toBe(false)
        expect(el.text()).toContain("<img")
      })

      it("renders noColumn message as text, not HTML", () => {
        const wrapper = mount(Table, { props: { dataSource: [{}], noColumn: XSS } })
        const el = wrapper.find("[data-table-no-column]")
        expect(el.exists()).toBe(true)
        expect(el.find("img").exists()).toBe(false)
      })

      it("renders noFilter message as text, not HTML", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name", isFilter: true }],
            filter: { noFilter: XSS }
          } as TableProps
        })
        await wrapper.find("[data-table-thead-col-filter] input").setValue("zzz-nomatch")
        vi.advanceTimersByTime(50)
        await nextTick()
        const el = wrapper.find("[data-table-no-filter]")
        expect(el.exists()).toBe(true)
        expect(el.find("img").exists()).toBe(false)
        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("renders summary as text, not HTML", () => {
        const wrapper = mount(Table, {
          props: {
            dataSource: [{ t1: 1 }, { t1: 2 }],
            columns: [{ dataField: "t1", type: "number" }],
            summary: [{ dataField: "t1", type: "sum", displayFormat: `${XSS}{0}` }]
          } as TableProps
        })
        const tfoot = wrapper.find("[data-table-tfoot]")
        expect(tfoot.exists()).toBe(true)
        expect(tfoot.find("img").exists()).toBe(false)
        expect(tfoot.text()).toContain("<img")
      })

      it("allows custom HTML only via explicit empty slot", () => {
        const wrapper = mount(Table, {
          props: { dataSource: [] },
          slots: { empty: "<div class='my-empty'>Nothing</div>" }
        })
        expect(wrapper.find("[data-table-no-data] .my-empty").exists()).toBe(true)
      })

      it("supports #empty-columns slot", () => {
        const wrapper = mount(Table, {
          props: { dataSource: [{}] },
          slots: { "empty-columns": "<div class='my-noc'>No columns</div>" }
        })
        expect(wrapper.find("[data-table-no-column] .my-noc").exists()).toBe(true)
      })

      it("supports #empty-filter slot", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: { dataSource: baseData, columns: [{ dataField: "name", isFilter: true }] } as TableProps,
          slots: { "empty-filter": "<div class='my-nof'>No filter</div>" }
        })
        await wrapper.find("[data-table-thead-col-filter] input").setValue("zzz-nomatch")
        vi.advanceTimersByTime(50)
        await nextTick()
        expect(wrapper.find("[data-table-no-filter] .my-nof").exists()).toBe(true)
        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })

    describe("Issue 2 — observer / listener cleanup on unmount", () => {
      it("disconnects IntersectionObserver and removes window listeners on unmount", async () => {
        const disconnectSpy = vi.spyOn(global.IntersectionObserver.prototype, "disconnect")
        const removeSpy = vi.spyOn(window, "removeEventListener")
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            columns: [{ dataField: "name", width: 120 }],
            resizedColumns: true
          } as TableProps
        })
        // начинаем drag-resize → добавляются window mousemove/mouseup
        await wrapper.find("[data-table-thead-col-resized]").trigger("mousedown")
        wrapper.unmount()
        expect(disconnectSpy).toHaveBeenCalled()
        expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function))
        expect(removeSpy).toHaveBeenCalledWith("mouseup", expect.any(Function))
      })
    })

    describe("Issue 8 — caption + scope", () => {
      it("renders <caption> from the caption prop (sr-only)", () => {
        const wrapper = mount(Table, { props: { dataSource: baseData, caption: "Fruit inventory" } as TableProps })
        const cap = wrapper.find("caption[data-table-caption]")
        expect(cap.exists()).toBe(true)
        expect(cap.text()).toBe("Fruit inventory")
        expect(cap.classes()).toContain("sr-only")
      })

      it("renders #caption slot over the prop", () => {
        const wrapper = mount(Table, {
          props: { dataSource: baseData },
          slots: { caption: "<span class='cap'>Custom</span>" }
        })
        expect(wrapper.find("caption[data-table-caption] .cap").exists()).toBe(true)
      })

      it("does not render <caption> without prop or slot", () => {
        const wrapper = mount(Table, { props: { dataSource: baseData } })
        expect(wrapper.find("caption[data-table-caption]").exists()).toBe(false)
      })

      it("keeps scope=col on header cells", () => {
        const wrapper = mount(Table, { props: { dataSource: baseData, columns: true } as TableProps })
        const headers = wrapper.findAll("[data-table-thead-col]")
        expect(headers.length).toBeGreaterThan(0)
        headers.forEach((th) => expect(th.attributes("scope")).toBe("col"))
      })
    })

    describe("Issue 9 — aria-live results announcement", () => {
      it("renders a polite sr-only live region reflecting the result count", () => {
        const wrapper = mount(Table, { props: { dataSource: baseData } })
        const live = wrapper.find("[data-table-aria-live]")
        expect(live.exists()).toBe(true)
        expect(live.attributes("aria-live")).toBe("polite")
        expect(live.attributes("aria-atomic")).toBe("true")
        expect(live.classes()).toContain("sr-only")
        expect(live.text()).toBe("Results: 5")
      })

      it("announces one / none after filtering", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: { dataSource: baseData, columns: [{ dataField: "name", isFilter: true }] } as TableProps
        })
        await wrapper.find("[data-table-thead-col-filter] input").setValue("orange")
        vi.advanceTimersByTime(50)
        await nextTick()
        expect(wrapper.find("[data-table-aria-live]").text()).toBe("1 result")
        await wrapper.find("[data-table-thead-col-filter] input").setValue("zzz-nomatch")
        vi.advanceTimersByTime(50)
        await nextTick()
        expect(wrapper.find("[data-table-aria-live]").text()).toBe("No results")
        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })

    describe("Issue 6 — unstyled", () => {
      it("respects unstyled: true via Component.setStyle guard", () => {
        const styled = mount(Table, { props: { dataSource: baseData } })
        expect(styled.find("[data-table-component]").classes()).toContain("fishtvue-table")

        const wrapper = mount(Table, {
          global: { plugins: [[FishtVue, { unstyled: true }] as any] },
          props: { dataSource: baseData }
        })
        expect(wrapper.find("[data-table-component]").classes()).not.toContain("fishtvue-table")
      })
    })
  })
  describe("Table Component - Virtualization (Issue 4)", () => {
    const genRows = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `Item ${i}`, id: i }))
    // jsdom не считает layout — мокаем viewport-высоту scroll-контейнера и scrollTop.
    const setViewport = async (wrapper: any, { scrollTop = 0, clientHeight = 0 } = {}) => {
      const el = wrapper.find("[data-table-scroll]").element as HTMLElement
      Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true })
      el.scrollTop = scrollTop
      await wrapper.find("[data-table-scroll]").trigger("scroll")
      await nextTick()
      return el
    }

    it("auto-enables virtualization for large client-side tables", () => {
      const wrapper = mount(Table, { props: { dataSource: genRows(500) } })
      const rendered = wrapper.findAll("[data-table-tbody-tr]").length
      expect(rendered).toBeGreaterThan(0)
      expect(rendered).toBeLessThan(500) // окно, не весь список
      expect(wrapper.find("[data-table-virtual-spacer-bottom]").exists()).toBe(true)
      expect(wrapper.find("[data-table]").attributes("aria-rowcount")).toBe("500")
    })

    it("opt-out via :virtual=false renders all rows (legacy)", () => {
      const wrapper = mount(Table, { props: { dataSource: genRows(500), virtual: false } as TableProps })
      expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(500)
      expect(wrapper.find("[data-table-virtual-spacer-top]").exists()).toBe(false)
      expect(wrapper.find("[data-table]").attributes("aria-rowcount")).toBeUndefined()
    })

    it("force-enables via :virtual=true below threshold", () => {
      const wrapper = mount(Table, { props: { dataSource: genRows(10), virtual: true } as TableProps })
      expect(wrapper.find("[data-table]").attributes("aria-rowcount")).toBe("10")
    })

    it("does NOT virtualize with grouping / pagination / asyncData:true", () => {
      const grouped = mount(Table, {
        props: { dataSource: genRows(500), grouping: "name" } as TableProps
      })
      expect(grouped.find("[data-table]").attributes("aria-rowcount")).toBeUndefined()

      const paged = mount(Table, {
        props: { dataSource: genRows(500), pagination: true, countVisibleRows: 3 } as TableProps
      })
      expect(paged.find("[data-table]").attributes("aria-rowcount")).toBeUndefined()

      const asyncTrue = mount(Table, { props: { dataSource: genRows(500), asyncData: true } as TableProps })
      expect(asyncTrue.find("[data-table]").attributes("aria-rowcount")).toBeUndefined()
    })

    it("shifts the window and top spacer on scroll (rowHeight math)", async () => {
      const wrapper = mount(Table, {
        props: { dataSource: genRows(500), virtual: { rowHeight: 50, overscan: 5 } } as TableProps
      })
      await setViewport(wrapper, { scrollTop: 0, clientHeight: 200 })
      const firstBefore = wrapper.find("[data-table-tbody-tr] [data-table-tbody-td]").text()

      await setViewport(wrapper, { scrollTop: 1000, clientHeight: 200 })
      // startIndex = floor(1000/50) - overscan(5) = 15 -> topPad = 15*50 = 750
      expect(wrapper.find("[data-table-virtual-spacer-top]").attributes("style")).toContain("750px")
      const firstAfter = wrapper.find("[data-table-tbody-tr] [data-table-tbody-td]").text()
      expect(firstAfter).not.toBe(firstBefore)
      expect(firstAfter).toContain("Item 15")
    })

    it("emits click-row with the absolute index after scrolling", async () => {
      const wrapper = mount(Table, {
        props: { dataSource: genRows(500), virtual: { rowHeight: 50, overscan: 5 } } as TableProps
      })
      await setViewport(wrapper, { scrollTop: 1000, clientHeight: 200 })
      await wrapper.find("[data-table-tbody-tr]").trigger("click")
      const payload = wrapper.emitted("click-row")?.[0]?.[0] as any
      expect(payload).toBeTruthy()
      // первая отрисованная строка = startIndex; data.name должна совпасть с absolute index
      expect(payload.data.name).toBe(`Item ${payload.indexRow}`)
      expect(payload.indexRow).toBe(15)
    })

    it("removes the scroll listener on unmount", () => {
      const wrapper = mount(Table, { props: { dataSource: genRows(500) } })
      const el = wrapper.find("[data-table-scroll]").element as HTMLElement
      const removeSpy = vi.spyOn(el, "removeEventListener")
      wrapper.unmount()
      expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function))
    })
  })
  describe("Table Component - asyncData Feature", () => {
    describe("Mode 1: asyncData = true (Boolean mode)", () => {
      it("disables client-side sorting when asyncData is true", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            asyncData: true,
            columns: [
              { dataField: "name", isSort: true },
              { dataField: "color", isSort: true }
            ]
          }
        })

        await nextTick()
        const initialRows = wrapper.findAll("[data-table-tbody-tr]")
        const initialFirstRowText = initialRows[0].text()

        // Вызываем сортировку
        await wrapper.findAll("[data-table-thead-col-sort]")[0].trigger("click")
        vi.advanceTimersByTime(850)
        await nextTick()

        // Проверяем, что данные НЕ отсортировались на клиенте
        const afterSortRows = wrapper.findAll("[data-table-tbody-tr]")
        expect(afterSortRows[0].text()).toBe(initialFirstRowText)

        // Но событие должно быть отправлено
        expect(wrapper.emitted("sort")).toBeTruthy()

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("disables client-side filtering when asyncData is true", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            asyncData: true,
            columns: [
              { dataField: "name", isFilter: true },
              { dataField: "color", isFilter: true }
            ]
          }
        })

        await nextTick()
        const initialRowsCount = wrapper.findAll("[data-table-tbody-tr]").length

        // Применяем фильтр
        const filterInput = wrapper.find("[data-table-thead-col-filter] input")
        await filterInput.setValue("orange")
        vi.advanceTimersByTime(850)
        await nextTick()

        // Проверяем, что данные НЕ отфильтровались на клиенте
        const afterFilterRowsCount = wrapper.findAll("[data-table-tbody-tr]").length
        expect(afterFilterRowsCount).toBe(initialRowsCount)

        // Но событие должно быть отправлено
        expect(wrapper.emitted("filter")).toBeTruthy()

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("disables client-side search when asyncData is true", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            asyncData: true,
            search: true
          }
        })

        await nextTick()
        const initialRowsCount = wrapper.findAll("[data-table-tbody-tr]").length

        // Выполняем поиск
        const searchInput = wrapper.find("[data-table-search] input")
        await searchInput.setValue("orange")
        vi.advanceTimersByTime(850)
        await nextTick()

        // Проверяем, что данные НЕ отфильтровались на клиенте
        const afterSearchRowsCount = wrapper.findAll("[data-table-tbody-tr]").length
        expect(afterSearchRowsCount).toBe(initialRowsCount)

        // Но событие должно быть отправлено
        expect(wrapper.emitted("search")).toBeTruthy()

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("disables client-side pagination slicing when asyncData is true", async () => {
        const largeData = Array.from({ length: 50 }, (_, i) => ({
          name: `Item ${i + 1}`,
          color: "blue",
          id: i + 1
        }))

        const wrapper = mount(Table, {
          props: {
            dataSource: largeData,
            asyncData: true,
            totalCount: 50,
            pagination: { sizePage: 10 },
            columns: [{ dataField: "name" }, { dataField: "color" }]
          }
        })

        await nextTick()

        // В режиме asyncData = true пагинационный слайсинг не должен применяться:
        // внутренний dataSource содержит все 50 элементов (видимый рендер ограничен
        // virtual-scroll окном, поэтому проверяем внутренние данные).
        expect((wrapper.vm as any).dataSource.length).toBe(50)
      })

      it("emits events for sort, filter, search, pagination when asyncData is true", async () => {
        vi.useFakeTimers()
        const wrapper = mount(Table, {
          props: {
            dataSource: baseData,
            asyncData: true,
            search: true,
            pagination: true,
            columns: [{ dataField: "name", isSort: true, isFilter: true }]
          }
        })

        await nextTick()

        // Тестируем sort event
        await wrapper.find("[data-table-thead-col-sort]").trigger("click")
        vi.advanceTimersByTime(100)
        await nextTick()
        expect(wrapper.emitted("sort")).toBeTruthy()

        // Тестируем filter event
        const filterInput = wrapper.find("[data-table-thead-col-filter] input")
        await filterInput.setValue("test")
        vi.advanceTimersByTime(850)
        await nextTick()
        expect(wrapper.emitted("filter")).toBeTruthy()

        // Тестируем search event
        const searchInput = wrapper.find("[data-table-search] input")
        await searchInput.setValue("test")
        vi.advanceTimersByTime(850)
        await nextTick()
        expect(wrapper.emitted("search")).toBeTruthy()

        // Тестируем pagination events
        expect(wrapper.emitted("switch-page")).toBeTruthy()

        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })

    describe("Mode 2: asyncData = string (URL mode)", () => {
      it("loads data from URL on mount", async () => {
        const mockData = [
          { id: 1, title: "Test 1", body: "Body 1" },
          { id: 2, title: "Test 2", body: "Body 2" }
        ]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: "https://jsonplaceholder.typicode.com/posts",
            columns: [{ dataField: "id" }, { dataField: "title" }, { dataField: "body" }]
          }
        })

        await nextTick()
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        await nextTick()
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(2)
      })

      it("handles HTTP errors gracefully in URL mode", async () => {
        // Mock fetch to return error response (not ok) with empty array
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => []
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: "https://invalid-url.com/data",
            columns: [{ dataField: "id" }]
          }
        })

        await nextTick()
        await flushPromises()

        // Проверяем, что данные пустые при ошибке
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(0)
      })

      it("handles network errors gracefully in URL mode", async () => {
        // Mock fetch to throw error (network failure)
        vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"))

        const wrapper = mount(Table, {
          props: {
            asyncData: "https://invalid-url.com/data",
            columns: [{ dataField: "id" }]
          }
        })

        await nextTick()
        await flushPromises()

        // Проверяем, что данные пустые при сетевой ошибке
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(0)
      })

      it("applies client-side filtering, sorting, search when asyncData is URL string", async () => {
        vi.useFakeTimers()
        const mockData = [
          { id: 1, name: "apple", type: "fruit" },
          { id: 2, name: "banana", type: "fruit" },
          { id: 3, name: "carrot", type: "vegetable" }
        ]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: "https://api.example.com/data",
            search: true,
            columns: [{ dataField: "name", isSort: true, isFilter: true }, { dataField: "type" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        // Проверяем, что все данные загружены
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(3)

        // Проверяем поиск (должен работать на клиенте)
        const searchInput = wrapper.find("[data-table-search] input")
        await searchInput.setValue("apple")
        vi.advanceTimersByTime(850)
        await nextTick()

        // После поиска должна остаться одна строка
        expect(wrapper.findAll("[data-table-tbody-tr]").length).toBe(1)

        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })

    describe("Mode 3: asyncData = object (Config mode)", () => {
      it("loads data with custom headers", async () => {
        const mockData = [{ id: 1, name: "Test" }]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: {
              url: "https://api.example.com/data",
              headers: {
                Authorization: "Bearer token123",
                "Custom-Header": "custom-value"
              }
            },
            columns: [{ dataField: "id" }, { dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()

        expect(global.fetch).toHaveBeenCalledWith("https://api.example.com/data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token123",
            "Custom-Header": "custom-value"
          }
        })
      })

      it("loads data with query parameters", async () => {
        const mockData = [{ id: 1 }]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: {
              url: "https://api.example.com/data",
              query: {
                limit: 10,
                offset: 0,
                sort: "name"
              }
            },
            columns: [{ dataField: "id" }]
          }
        })

        await nextTick()
        await flushPromises()

        const fetchCall = (global.fetch as any).mock.calls[0]
        const url = fetchCall[0]
        expect(url).toContain("limit=10")
        expect(url).toContain("offset=0")
        expect(url).toContain("sort=name")
      })

      it("handles empty query parameters correctly", async () => {
        const mockData = [{ id: 1 }]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        } as Response)

        const wrapper = mount(Table, {
          props: {
            asyncData: {
              url: "https://api.example.com/data",
              query: {
                limit: 10,
                emptyParam: undefined,
                nullParam: null
              }
            },
            columns: [{ dataField: "id" }]
          }
        })

        await nextTick()
        await flushPromises()

        const fetchCall = (global.fetch as any).mock.calls[0]
        const url = fetchCall[0]
        expect(url).toContain("limit=10")
        expect(url).not.toContain("emptyParam")
        expect(url).not.toContain("nullParam")
      })
    })

    describe("Mode 4: asyncData = function (Function mode)", () => {
      it("calls asyncData function on mount", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "name" }, { dataField: "color" }]
          }
        })

        await nextTick()
        await flushPromises()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
        expect(mockAsyncFunction).toHaveBeenCalledWith({
          filters: {},
          sort: {},
          search: "",
          pagination: {
            page: 1,
            size: 5
          }
        })
      })

      it("loads data from function and displays it", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: [
            { id: 1, name: "Test 1" },
            { id: 2, name: "Test 2" }
          ],
          totalCount: 2
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "id" }, { dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(2)
      })

      it("calls asyncData function when filters change", async () => {
        vi.useFakeTimers()
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "name", isFilter: true }, { dataField: "color" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        // Сбрасываем счетчик вызовов после монтирования
        mockAsyncFunction.mockClear()

        // Применяем фильтр
        const filterInput = wrapper.find("[data-table-thead-col-filter] input")
        await filterInput.setValue("orange")
        vi.advanceTimersByTime(850)
        await nextTick()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
        const callArgs = mockAsyncFunction.mock.calls[0][0]
        expect(callArgs.filters.name).toBe("orange")

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("calls asyncData function when sort changes", async () => {
        vi.useFakeTimers()
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "name", isSort: true }, { dataField: "color" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        mockAsyncFunction.mockClear()

        // Вызываем сортировку
        await wrapper.find("[data-table-thead-col-sort]").trigger("click")
        vi.advanceTimersByTime(100)
        await nextTick()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
        const callArgs = mockAsyncFunction.mock.calls[0][0]
        expect(callArgs.sort.name).toBe("asc")

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("calls asyncData function when search changes", async () => {
        vi.useFakeTimers()
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            search: true,
            columns: [{ dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        mockAsyncFunction.mockClear()

        // Выполняем поиск
        const searchInput = wrapper.find("[data-table-search] input")
        await searchInput.setValue("test")
        vi.advanceTimersByTime(850)
        await nextTick()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
        const callArgs = mockAsyncFunction.mock.calls[0][0]
        expect(callArgs.search).toBe("test")

        vi.clearAllTimers()
        vi.useRealTimers()
      })

      it("calls asyncData function when pagination changes", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            pagination: { sizePage: 2 },
            columns: [{ dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        mockAsyncFunction.mockClear()

        // Меняем страницу через expose метод
        wrapper.vm.switchPage(2)
        await nextTick()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(1)
        const callArgs = mockAsyncFunction.mock.calls[0][0]
        expect(callArgs.pagination.page).toBe(2)
        expect(callArgs.pagination.size).toBe(2)
      })

      it("uses totalCount from function result for pagination", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" }
          ],
          totalCount: 100
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            pagination: { sizePage: 10 },
            columns: [{ dataField: "id" }, { dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        // Проверяем, что lengthData использует totalCount из функции
        expect(wrapper.vm.lengthData).toBe(100)
      })

      it("handles function errors gracefully", async () => {
        const mockAsyncFunction = vi.fn().mockRejectedValue(new Error("API Error"))

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        // При ошибке данные должны быть пустыми
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(0)
      })

      it("reloads data when reloadData method is called", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            columns: [{ dataField: "name" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        const initialCallCount = mockAsyncFunction.mock.calls.length

        // Вызываем метод reloadData
        await wrapper.vm.reloadData()
        await nextTick()

        expect(mockAsyncFunction).toHaveBeenCalledTimes(initialCallCount + 1)
      })

      it("disables client-side pagination slicing when asyncData is function", async () => {
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: [
            { id: 1, name: "Item 1" },
            { id: 2, name: "Item 2" }
          ],
          totalCount: 2
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            pagination: { sizePage: 10 },
            columns: [{ dataField: "id" }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        // В режиме функции данные уже приходят отфильтрованными, слайсинг не нужен
        const rows = wrapper.findAll("[data-table-tbody-tr]")
        expect(rows.length).toBe(2) // Все загруженные данные отображаются
      })

      it("disables client-side filtering, sorting, search when asyncData is function", async () => {
        vi.useFakeTimers()
        const mockAsyncFunction = vi.fn().mockResolvedValue({
          dataSource: baseData,
          totalCount: 5
        })

        const wrapper = mount(Table, {
          props: {
            asyncData: mockAsyncFunction,
            search: true,
            columns: [{ dataField: "name", isSort: true, isFilter: true }]
          }
        })

        await nextTick()
        await flushPromises()
        await nextTick()

        const initialRowsCount = wrapper.findAll("[data-table-tbody-tr]").length
        mockAsyncFunction.mockClear()

        // Применяем фильтр - должно вызвать функцию, но не фильтровать на клиенте
        const filterInput = wrapper.find("[data-table-thead-col-filter] input")
        await filterInput.setValue("orange")
        vi.advanceTimersByTime(850)
        await nextTick()

        // Функция должна быть вызвана
        expect(mockAsyncFunction).toHaveBeenCalled()

        // Но данные на клиенте не должны измениться до получения ответа
        // (в реальном сценарии функция вернет новые данные)

        vi.clearAllTimers()
        vi.useRealTimers()
      })
    })
  })
})
