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
 * `PENDING` — файлы до своей волны; обнуляется в W6.
 */
const LIB = resolve(process.cwd(), "lib")

const PENDING: string[] = [
  "accordion/Accordion.d.ts",
  "menu/Menu.d.ts",
  "pagination/Pagination.d.ts",
  "table/Table.d.ts"
]

const EVENT_NAME = /^(?:update:|change:)[a-zA-Z]+$|^[a-z]+(?:-[a-z]+)*$/
const FORBIDDEN = /^(?:on|is|get)[A-Z]/
const SIGNATURE = /\(\s*(?:event|e)\s*:\s*"([^"]+)"/g

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

/** Имена событий из всех `*Emits`-блоков файла (по глубине скобок). */
function emitsOf(file: string): Array<{ name: string; line: number }> {
  const found: Array<{ name: string; line: number }> = []
  let inEmits = false
  let depth = 0
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.replace(/\/\/.*$/, "")
      if (!inEmits && /^export\s+(?:declare\s+)?type\s+\w+Emits\s*=\s*(?:null\s*\|\s*)?{/.test(line)) {
        inEmits = true
        depth = 0
      }
      if (!inEmits) return
      let match: RegExpExecArray | null
      SIGNATURE.lastIndex = 0
      while ((match = SIGNATURE.exec(line))) found.push({ name: match[1], line: index + 1 })
      depth += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
      if (depth <= 0 && line.includes("}")) inEmits = false
    })
  return found
}

describe("Cross-cutting guard — emits naming (dev-patterns §2 H)", () => {
  const files = collectDts(LIB)

  it("PENDING содержит только существующие файлы", () => {
    const stale = PENDING.filter((rel) => !existsSync(join(LIB, rel)))
    expect(stale, `Файлов нет в lib/: ${stale.join(", ")}`).toEqual([])
  })

  it("находит объявления событий", () => {
    const total = files.reduce((sum, file) => sum + emitsOf(file).length, 0)
    expect(total).toBeGreaterThan(30)
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
