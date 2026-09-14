/// <reference types="vite/client" />
import { describe, expect, it } from "vitest"

/**
 * Cross-cutting guard булевого правила канона (dev-patterns §2 F).
 *
 * Vue кастует отсутствующий Boolean-prop в `false`, если у prop'а нет собственного `default`
 * (`resolvePropValue`: `if (isAbsent && !hasDefault) value = false`). Это молча ломает цепочку
 * `props.x ?? options?.x ?? <literal>` — слой `componentsOptions` становится недостижим, а для props
 * с default `true` (`animated`, `closeOnBackdrop`, `searchable`) компонент получает `false` вместо
 * «не задано». Канон: каждый optional boolean объявляется в `withDefaults(..., { x: undefined })`,
 * литеральный default живёт только в резолвере. Имена — bare-positive.
 *
 * Скан идёт по скомпилированным runtime-опциям props (`Component.props`) всех SFC верхнего уровня
 * `lib/<name>/<Name>.vue` (компоненты + renderless-дескрипторы; `lib/loading/svg|epic` не входят).
 * `PENDING` — компоненты, ещё не переведённые на 1.0; обнуляется в W7.
 */
const PENDING: string[] = [
  "accordion/Accordion.vue",
  "accordion/AccordionItem.vue",
  "alert/Alert.vue",
  "badge/Badge.vue",
  "button/Button.vue",
  "calendar/Calendar.vue",
  "dialog/Dialog.vue",
  "fixwindow/FixWindow.vue",
  "form/Form.vue",
  "form/FormField.vue",
  "form/FormSection.vue",
  "input/Input.vue",
  "inputlayout/InputLayout.vue",
  "menu/Menu.vue",
  "menu/MenuGroup.vue",
  "menu/MenuItem.vue",
  "pagination/Pagination.vue",
  "select/Select.vue",
  "select/SelectGroup.vue",
  "select/SelectOption.vue",
  "separator/Separator.vue",
  "split/Split.vue",
  "switch/Switch.vue",
  "table/Column.vue",
  "table/ColumnGroup.vue",
  "table/Table.vue",
  "textarea/Textarea.vue",
  "texteditor/TextEditor.vue",
  "virtualscroller/VirtualScroller.vue"
]

const FORBIDDEN_PREFIX = /^(?:is|not|without|no|show|use)[A-Z]/

type PropDef = { type?: unknown; default?: unknown } | null | undefined
type Sfc = { default?: { props?: Record<string, PropDef> } }

const modules = import.meta.glob<Sfc>("./*/*.vue", { eager: true })

function typesOf(def: PropDef): unknown[] {
  if (!def || typeof def !== "object") return []
  return Array.isArray(def.type) ? def.type : [def.type]
}

describe("Cross-cutting guard — boolean props (dev-patterns §2 F)", () => {
  const entries = Object.entries(modules).map(([path, mod]) => ({
    rel: path.replace(/^\.\//, ""),
    props: mod.default?.props ?? {}
  }))

  it("находит SFC для проверки", () => {
    expect(entries.length).toBeGreaterThan(25)
  })

  it("PENDING содержит только существующие SFC", () => {
    const known = new Set(entries.map((e) => e.rel))
    const stale = PENDING.filter((rel) => !known.has(rel))
    expect(stale, `SFC нет в lib/: ${stale.join(", ")}`).toEqual([])
  })

  it("у каждого Boolean-prop есть собственный default (слой componentsOptions достижим)", () => {
    const offenders: string[] = []
    for (const { rel, props } of entries) {
      if (PENDING.includes(rel)) continue
      for (const [name, def] of Object.entries(props)) {
        if (!typesOf(def).includes(Boolean)) continue
        if (!Object.prototype.hasOwnProperty.call(def, "default")) offenders.push(`${rel}: ${name}`)
      }
    }
    expect(offenders, `Boolean-props без default (Vue кастует в false):\n${offenders.join("\n")}`).toEqual([])
  })

  it("имена props — bare-positive, без is/not/without/no/show/use", () => {
    const offenders: string[] = []
    for (const { rel, props } of entries) {
      if (PENDING.includes(rel)) continue
      for (const name of Object.keys(props)) {
        if (FORBIDDEN_PREFIX.test(name)) offenders.push(`${rel}: ${name}`)
      }
    }
    expect(offenders, `Props с запрещённым префиксом:\n${offenders.join("\n")}`).toEqual([])
  })
})
