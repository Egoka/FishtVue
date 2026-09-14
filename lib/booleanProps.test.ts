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
 */
/**
 * Renderless-дескрипторы compound-API (`<SelectItem>`, `<FormField>`, `<Column>`, …): собственного DOM
 * не рендерят, а родитель читает их props через VNode-walk (`slots.default()`), то есть СЫРЫЕ, до
 * `resolvePropValue`. Vue-кастинг отсутствующего Boolean в `false` их не касается, поэтому правило
 * «own default» к ним не применяется (dev-patterns §2 F).
 */
const RENDERLESS = new Set([
  "select/SelectItem.vue",
  "accordion/AccordionItem.vue",
  "table/Column.vue",
  "table/ColumnGroup.vue",
  "menu/MenuGroup.vue",
  "menu/MenuItem.vue",
  "form/FormField.vue",
  "form/FormSection.vue"
])

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

  it("у каждого Boolean-prop есть собственный default (слой componentsOptions достижим)", () => {
    const offenders: string[] = []
    for (const { rel, props } of entries) {
      if (RENDERLESS.has(rel)) continue
      for (const [name, def] of Object.entries(props)) {
        if (!typesOf(def).includes(Boolean)) continue
        // Обязательный prop потребитель не может опустить, поэтому cast отсутствующего в `false`
        // его не касается; и в `XOption` такие props не попадают (нет слоя, который стал бы недостижим).
        if ((def as { required?: boolean } | null)?.required) continue
        if (!Object.prototype.hasOwnProperty.call(def, "default")) offenders.push(`${rel}: ${name}`)
      }
    }
    expect(offenders, `Boolean-props без default (Vue кастует в false):\n${offenders.join("\n")}`).toEqual([])
  })

  it("имена props — bare-positive, без is/not/without/no/show/use", () => {
    const offenders: string[] = []
    for (const { rel, props } of entries) {
      for (const name of Object.keys(props)) {
        if (FORBIDDEN_PREFIX.test(name)) offenders.push(`${rel}: ${name}`)
      }
    }
    expect(offenders, `Props с запрещённым префиксом:\n${offenders.join("\n")}`).toEqual([])
  })
})
