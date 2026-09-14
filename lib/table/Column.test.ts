import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { defineComponent, h, nextTick, ref } from "vue"
import Table from "fishtvue/table/Table.vue"
// Renderless compound-дети импортируются напрямую как .vue (как Table выше) — barrel
// `fishtvue/table` резолвится в собранный table.mjs только после build; в тестах нужен source.
import Column from "fishtvue/table/Column.vue"
import ColumnGroup from "fishtvue/table/ColumnGroup.vue"
import Pagination from "fishtvue/pagination/Pagination.vue"
import Loading from "fishtvue/loading/Loading.vue"

/**
 * Issue 3 — compound `<Table><Column>` API (флагман dual-API).
 *
 * Механизм — VNode-walk `slots.default()` (зеркало Menu): renderless `<Column>`/`<ColumnGroup>`
 * читаются родительским `<Table>` и синтезируются в descriptor'ы колонок. Schema `:columns`
 * при наличии ВЫИГРЫВАЕТ (backward compat). `<Pagination>`/`<Loading>`-дети override-ят
 * встроенные конфиги.
 */
describe("Table — compound <Column> API (Issue 3)", () => {
  beforeAll(() => {
    // @ts-ignore
    global.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response)
  })
  afterEach(() => vi.restoreAllMocks())

  const baseData = [
    { name: "orange", color: "orange", shape: "round" },
    { name: "banana", color: "yellow", shape: "long" },
    { name: "grape", color: "purple", shape: "round" }
  ]

  // Хелпер: смонтировать Table с compound-детьми в default slot.
  const mountCompound = (children: any[], props: Record<string, any> = {}) =>
    mount(Table, { props: { dataSource: baseData, ...props }, slots: { default: () => children } })

  describe("Backward-compat (schema :columns)", () => {
    it("renders schema columns without any <Column> children", () => {
      const wrapper = mount(Table, {
        props: { dataSource: baseData, columns: [{ dataField: "name" }, { dataField: "color" }] }
      })
      expect(wrapper.find("[data-table-thead]").exists()).toBe(true)
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(2)
    })

    it("schema :columns WINS when both schema and <Column> children present (precedence)", () => {
      const wrapper = mount(Table, {
        props: { dataSource: baseData, columns: [{ dataField: "name" }] },
        slots: {
          default: () => [
            h(Column, { dataField: "name" }),
            h(Column, { dataField: "color" }),
            h(Column, { dataField: "shape" })
          ]
        }
      })
      // schema задаёт 1 колонку → children игнорируются.
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(1)
    })
  })

  describe("Compound mode (<Column> children)", () => {
    it("builds columns from <Column> children when :columns is absent", () => {
      const wrapper = mountCompound([
        h(Column, { dataField: "name", caption: "Имя" }),
        h(Column, { dataField: "color", caption: "Цвет" })
      ])
      expect(wrapper.find("[data-table-thead]").exists()).toBe(true)
      const ths = wrapper.findAll("[data-table-thead-col]")
      expect(ths.length).toBe(2)
      expect(wrapper.text()).toContain("Имя")
      expect(wrapper.text()).toContain("Цвет")
    })

    it("renders body cells for compound columns", () => {
      const wrapper = mountCompound([h(Column, { dataField: "name" }), h(Column, { dataField: "color" })])
      // 3 строки * 2 колонки = 6 ячеек.
      expect(wrapper.findAll("[data-table-tbody-td]").length).toBe(6)
    })

    it("ignores comments / falsy nodes between children (vnode hygiene)", () => {
      const wrapper = mountCompound([
        h(Column, { dataField: "name" }),
        false,
        null,
        " ",
        h(Column, { dataField: "color" })
      ])
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(2)
    })

    it("skips <Column> without data-field gracefully (falls back to field order)", () => {
      const wrapper = mountCompound([h(Column, { caption: "Auto" }), h(Column, { dataField: "color" })])
      // оба рендерятся (первый берёт dataField из порядка полей, как schema-нормализация).
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(2)
    })
  })

  describe("Per-column scoped slots", () => {
    it("forwards <Column> #cell slot into the cell render", () => {
      const wrapper = mountCompound([
        h(
          Column,
          { dataField: "name" },
          { cell: (p: any) => h("strong", { class: "custom-cell" }, `★${p.rowData.name}`) }
        ),
        h(Column, { dataField: "color" })
      ])
      const custom = wrapper.findAll(".custom-cell")
      expect(custom.length).toBe(3) // по одной на каждую из 3 строк
      expect(custom[0].text()).toBe("★orange")
    })

    it("forwards <Column> #header slot into the <th>", () => {
      const wrapper = mountCompound([
        h(Column, { dataField: "name" }, { header: () => h("span", { class: "custom-head" }, "HDR") })
      ])
      expect(wrapper.find(".custom-head").exists()).toBe(true)
      expect(wrapper.find(".custom-head").text()).toBe("HDR")
    })
  })

  describe("<ColumnGroup> multi-level headers", () => {
    it("renders a group caption row with colspan over its columns", () => {
      const wrapper = mountCompound([
        h(ColumnGroup, { caption: "Группа" }, () => [
          h(Column, { dataField: "name" }),
          h(Column, { dataField: "color" })
        ]),
        h(Column, { dataField: "shape" })
      ])
      // тело: 3 колонки.
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(3)
      // верхний ряд шапки с групповым <th colspan=2>.
      const groupCol = wrapper.find("[data-table-thead-group-col]")
      expect(groupCol.exists()).toBe(true)
      expect(groupCol.text()).toContain("Группа")
      expect(groupCol.attributes("colspan")).toBe("2")
      expect(groupCol.attributes("scope")).toBe("colgroup")
    })

    it("does NOT render the group row when there are no <ColumnGroup> children", () => {
      const wrapper = mountCompound([h(Column, { dataField: "name" })])
      expect(wrapper.find("[data-table-thead-group-col]").exists()).toBe(false)
    })
  })

  describe("<Pagination> / <Loading> overrides", () => {
    it("enables pagination from a <Pagination> child", async () => {
      const wrapper = mountCompound([h(Column, { dataField: "name" }), h(Pagination, { sizesSelector: [10, 25] })])
      await flushPromises()
      await nextTick()
      expect(wrapper.find("[data-table-pagination]").exists()).toBe(true)
    })

    it("explicit :pagination prop wins over a <Pagination> child", async () => {
      const wrapper = mountCompound([h(Column, { dataField: "name" }), h(Pagination, { sizesSelector: [10, 25] })], {
        pagination: false
      })
      await flushPromises()
      await nextTick()
      // :pagination=false бьёт child → пейджер выключен.
      expect(wrapper.find("[data-table-pagination]").exists()).toBe(false)
    })

    it("accepts a <Loading> child without breaking render", () => {
      const wrapper = mountCompound([h(Column, { dataField: "name" }), h(Loading, { type: "simple" })])
      expect(wrapper.find("[data-table-thead]").exists()).toBe(true)
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(1)
    })
  })

  describe("Reactivity", () => {
    it("updates columns when a <Column v-if> toggles", async () => {
      const show = ref(true)
      const Parent = defineComponent({
        setup() {
          return () =>
            h(
              Table,
              { dataSource: baseData },
              {
                default: () => [
                  h(Column, { dataField: "name" }),
                  ...(show.value ? [h(Column, { dataField: "color" })] : [])
                ]
              }
            )
        }
      })
      const wrapper = mount(Parent)
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(2)
      show.value = false
      await nextTick()
      expect(wrapper.findAll("[data-table-thead-col]").length).toBe(1)
    })
  })
})
