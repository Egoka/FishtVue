import { describe, expect, it } from "vitest"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

/**
 * Cross-cutting guard именования событий (dev-patterns §2 H / §7).
 *
 * Правило: events — kebab-case (`item-click`, `scroll-index-change`, `close`); v-model-канал —
 * `update:<prop>` / `change:<prop>`, где `<prop>` — camelCase-имя prop'а (требование Vue для
 * `v-model:modelValue`). Формы `on*` (Vue-listener-стиль), `is*`, `get*` запрещены: `@on-click` на
 * компоненте и `onClick` в `defineEmits` — две разные вещи, а `isActive` — состояние, не событие.
 *
 * Источник — блоки `*Emits` в публичных `.d.ts` (call-signature `(event: "name", …)`).
 * Сигнатура может быть многострочной (`Table.click-cell`), поэтому тело блока сканируется как
 * текст по глубине скобок, а не построчно: построчный regex такие объявления не видел.
 *
 * Второй кейс — контракт v-model-канала: `change:modelValue` несут ровно form-control'ы
 * (dev-patterns §2 H). `PENDING` пуст с W5 и удаляется вместе с механизмом в W7.
 */
const LIB = resolve(process.cwd(), "lib")

const PENDING: string[] = []

const EVENT_NAME = /^(?:update:|change:)[a-zA-Z]+$|^[a-z]+(?:-[a-z]+)*$/
const FORBIDDEN = /^(?:on|is|get)[A-Z]/
const SIGNATURE = /\(\s*(?:event|e)\s*:\s*"([^"]+)"/gs

function collectDts(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectDts(full))
    else if (entry.name.endsWith(".d.ts")) out.push(full)
  }
  return out
}

/**
 * Form-control'ы библиотеки — зеркало `baseInputs` из `lib/form/Form.vue`: именно их `<Form>`
 * рендерит как поля. Только у них у `modelValue` есть момент «значение устоялось», отличный от
 * самого обновления, поэтому только они несут парный канал `change:modelValue` (dev-patterns §2 H).
 * Момент срабатывания у каждого свой (native `change`, закрытие дропдауна, blur) — контракт
 * фиксирует наличие канала и порядок, а не общий триггер.
 */
const FORM_CONTROLS = [
  "input/Input.d.ts",
  "textarea/Textarea.d.ts",
  "select/Select.d.ts",
  "calendar/Calendar.d.ts",
  "texteditor/TextEditor.d.ts",
  "switch/Switch.d.ts"
]

const EMITS_BLOCK = /export\s+(?:declare\s+)?type\s+\w+Emits\s*=\s*(?:null\s*\|\s*)?\{/g

/** Тела всех `*Emits`-блоков файла: от `{` объявления до парной `}` (по глубине скобок). */
function emitsBlocks(source: string): Array<{ body: string; offset: number }> {
  const blocks: Array<{ body: string; offset: number }> = []
  let match: RegExpExecArray | null
  EMITS_BLOCK.lastIndex = 0
  while ((match = EMITS_BLOCK.exec(source))) {
    const start = match.index + match[0].length
    let index = start
    let depth = 1
    while (index < source.length && depth > 0) {
      if (source[index] === "{") depth++
      else if (source[index] === "}") depth--
      index++
    }
    blocks.push({ body: source.slice(start, index), offset: start })
  }
  return blocks
}

/**
 * Имена событий из всех `*Emits`-блоков файла. Сканируем тело целиком, а не построчно:
 * у многострочных сигнатур (`(\n  event: "click-cell",`) `(` и `event:` на разных строках.
 */
function emitsOf(file: string): Array<{ name: string; line: number }> {
  const source = readFileSync(file, "utf8")
  const found: Array<{ name: string; line: number }> = []
  for (const { body, offset } of emitsBlocks(source)) {
    let match: RegExpExecArray | null
    SIGNATURE.lastIndex = 0
    while ((match = SIGNATURE.exec(body))) {
      const line = source.slice(0, offset + match.index).split("\n").length
      found.push({ name: match[1], line })
    }
  }
  return found
}

describe("Cross-cutting guard — emits naming (dev-patterns §2 H)", () => {
  const files = collectDts(LIB)

  it("PENDING содержит только существующие файлы", () => {
    const stale = PENDING.filter((rel) => !existsSync(join(LIB, rel)))
    expect(stale, `Файлов нет в lib/: ${stale.join(", ")}`).toEqual([])
  })

  it("находит объявления событий", () => {
    // Точное число, а не `> 30`: при потере видимости событий (напр. новая форма сигнатуры)
    // счётчик просядет и тест упадёт, вместо того чтобы молча пропустить объявление.
    const total = files.reduce((sum, file) => sum + emitsOf(file).length, 0)
    expect(total).toBe(70)
  })

  it("события вне PENDING — kebab-case или update:/change:<camelProp>, без on*/is*/get*", () => {
    const offenders: string[] = []
    for (const file of files) {
      const rel = file.slice(LIB.length + 1)
      if (PENDING.includes(rel)) continue
      for (const { name, line } of emitsOf(file)) {
        if (FORBIDDEN.test(name) || !EVENT_NAME.test(name)) offenders.push(`${rel}:${line} — "${name}"`)
      }
    }
    expect(offenders, `Нарушения именования событий:\n${offenders.join("\n")}`).toEqual([])
  })

  it("form-control'ы несут парный канал `change:modelValue`", () => {
    const offenders: string[] = []
    for (const rel of FORM_CONTROLS) {
      const names = emitsOf(join(LIB, rel)).map((e) => e.name)
      for (const channel of ["update:modelValue", "change:modelValue"]) {
        if (!names.includes(channel)) offenders.push(`${rel} — нет "${channel}"`)
      }
    }
    expect(offenders, `Form-control без полного v-model-канала:\n${offenders.join("\n")}`).toEqual([])
  })

  it("не-form-control с `update:modelValue` НЕ заводит `change:modelValue`", () => {
    const offenders: string[] = []
    for (const file of files) {
      const rel = file.slice(LIB.length + 1)
      if (FORM_CONTROLS.includes(rel)) continue
      const names = emitsOf(file).map((e) => e.name)
      if (names.includes("change:modelValue")) {
        offenders.push(`${rel} — не form-control, но объявляет "change:modelValue"`)
      }
    }
    expect(
      offenders,
      `Канал \`change:modelValue\` заводится только у form-control'ов (dev-patterns §2 H):\n${offenders.join("\n")}`
    ).toEqual([])
  })

  it("видит многострочные сигнатуры (Table.click-cell)", () => {
    const names = emitsOf(join(LIB, "table/Table.d.ts")).map((e) => e.name)
    expect(names).toContain("click-cell")
  })

  it("распознаёт синтетические нарушения (self-check)", () => {
    expect(
      ["onClick", "isActive", "getCalendar", "switch-Page", "update:is-invalid"].filter(
        (n) => !FORBIDDEN.test(n) && EVENT_NAME.test(n)
      )
    ).toEqual([])
    expect(
      ["item-click", "update:modelValue", "change:modelValue", "close", "scroll-index-change"].every(
        (n) => !FORBIDDEN.test(n) && EVENT_NAME.test(n)
      )
    ).toBe(true)
  })
})
