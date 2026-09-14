import { describe, expect, it } from "vitest"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

/**
 * Cross-cutting guard канона props 1.0 (dev-patterns §2 A–I) — source-scan публичных `.d.ts`.
 *
 * Правила, которые он держит:
 * - нет плоских `classX`-хуков и суффиксных `*Class` — внутренние элементы адресуются только через
 *   карту `classes: ClassesMap<XClassKey>`;
 * - нет bag'а `styles` (растворён в `classes` + top-level props);
 * - bag'и, пробрасываемые во внутренний компонент, называются `{inner}Props`, не `params*`;
 * - булевы props — bare-positive (`animated`, `searchable`), без `is*`/`not*`/`without*`/`no*`/`show*`/`use*`;
 * - экспортируемые типы — PascalCase без Hungarian `I*`;
 * - `MaybeRef` только у data/schema-props из allowlist (решение 3).
 *
 * `PENDING` — файлы, ещё не переведённые на 1.0. Список сокращается волнами (W1–W5) и обнуляется в W7,
 * после чего механизм удаляется: guard становится безусловным.
 */
const LIB = resolve(process.cwd(), "lib")

const PENDING: string[] = [
  "alert/Alert.d.ts",
  "dialog/Dialog.d.ts",
  "form/Form.d.ts",
  "menu/Menu.d.ts",
  "menu/MenuGroup.d.ts",
  "menu/MenuItem.d.ts",
  "split/Split.d.ts",
  "table/Table.d.ts",
  // T5 / W7: `_key` → `ItemKey`, `namesColors` → `ColorName`.
  "types.d.ts",
  "theme/Theme.d.ts"
]

/** `file:prop` — единственные места, где `MaybeRef` допустим (data/schema-props, решение 3). */
const MAYBE_REF_ALLOWLIST = new Set([
  "accordion/Accordion.d.ts:items",
  "form/Form.d.ts:structure",
  "form/Form.d.ts:formFields",
  "menu/Menu.d.ts:groups",
  "select/Select.d.ts:options",
  "split/Split.d.ts:panels",
  "table/Table.d.ts:dataSource",
  "table/Table.d.ts:columns",
  "table/Table.d.ts:summary",
  "table/Table.d.ts:toolbar",
  "table/Table.d.ts:sort",
  "table/Table.d.ts:filter",
  "table/Table.d.ts:grouping",
  "table/Table.d.ts:pagination"
])

/** Блоки, где правила props не применяются: state/emits/slots — не публичные props. */
const SKIPPED_BLOCK = /(Expose|Emits|Slots)$/

/**
 * Инфраструктурные каталоги: их `.d.ts` описывают конфиг плагина, утилиты и движок темы, а не props
 * компонентов — булево правило (F) на них не распространяется (`isNotMinifyCSS`, результат валидации
 * `isInvalid` в rulesHandler). Правила типов (Hungarian, PascalCase) действуют везде.
 */
const INFRA_DIRS = new Set(["component", "config", "locale", "module", "plugins", "theme", "utils"])

/**
 * Блоки-зеркала API сторонних библиотек (решения R30/R33): `DatePickerProps`, `CalendarPicker`, `PopoverConfig`
 * и `Highlight` повторяют имена v-calendar (`isDark`, `isRequired`, `is24hr`, `wrapperClass`…) — переименовать
 * их значит сломать passthrough в `<DatePicker>`. Правила именования на такие блоки не распространяются.
 */
const THIRD_PARTY_BLOCKS = new Set([
  "calendar/Calendar.d.ts:DatePickerProps",
  "calendar/Calendar.d.ts:CalendarPicker",
  "calendar/Calendar.d.ts:PopoverConfig",
  "calendar/Calendar.d.ts:Highlight"
])

const RULES: Array<{ id: string; test: RegExp; componentsOnly?: boolean }> = [
  { id: "flat class*-prop → classes.<key>", test: /^\s+class[A-Z]\w*\??:/ },
  { id: "suffix *Class-prop → classes.<key>", test: /^\s+\w+[a-z]Class(?:Body|Grid)?\??:/ },
  { id: "styles-bag → classes + top-level props", test: /^\s+styles\??:/ },
  { id: "params* → {inner}Props", test: /^\s+params[A-Z]\w*\??:/ },
  {
    id: "boolean prop с префиксом is/not/without/no/show/use → bare-positive",
    test: /^\s+(?:is|not|without|no|show|use)[A-Z]\w*\??:\s*boolean\b/,
    componentsOnly: true
  },
  { id: "Hungarian I*-тип → PascalCase без префикса", test: /^export\s+(?:declare\s+)?(?:interface|type)\s+I[A-Z]\w*/ },
  { id: "type alias не в PascalCase", test: /^export\s+(?:declare\s+)?type\s+[a-z_]\w*\s*=/ }
]

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

type Hit = { file: string; line: number; rule: string; text: string }

function scan(file: string): { hits: Hit[]; maybeRefs: Array<{ key: string; line: number }> } {
  const rel = file.slice(LIB.length + 1)
  const isComponentFile = !INFRA_DIRS.has(rel.split("/")[0]) && rel.includes("/")
  const hits: Hit[] = []
  const maybeRefs: Array<{ key: string; line: number }> = []
  let block = ""
  let depth = 0
  let inComment = false
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.replace(/\/\/.*$/, "")
      // JSDoc / block comments — описание, не объявление.
      if (inComment) {
        if (line.includes("*/")) inComment = false
        return
      }
      if (/^\s*\/\*/.test(line)) {
        if (!line.includes("*/")) inComment = true
        return
      }
      const open = (line.match(/{/g) ?? []).length
      const close = (line.match(/}/g) ?? []).length
      if (depth === 0) {
        const decl = line.match(/^(?:export\s+)?(?:declare\s+)?(?:interface|type|class)\s+(\w+)/)
        block = decl?.[1] ?? ""
      }
      const skipped = SKIPPED_BLOCK.test(block) || THIRD_PARTY_BLOCKS.has(`${rel}:${block}`)
      if (!skipped) {
        for (const rule of RULES) {
          if (rule.componentsOnly && !isComponentFile) continue
          if (rule.test.test(line)) hits.push({ file: rel, line: index + 1, rule: rule.id, text: line.trim() })
        }
        const ref = line.match(/^\s+(\w+)\??:\s*MaybeRef</)
        if (ref) maybeRefs.push({ key: `${rel}:${ref[1]}`, line: index + 1 })
      }
      depth += open - close
      if (depth <= 0) {
        depth = 0
        if (close > 0) block = ""
      }
    })
  return { hits, maybeRefs }
}

describe("Cross-cutting guard — props naming 1.0 (dev-patterns §2 A–I)", () => {
  const files = collectDts(LIB)

  it("находит .d.ts для проверки", () => {
    expect(files.length).toBeGreaterThan(25)
  })

  it("PENDING содержит только существующие файлы (нет устаревших записей)", () => {
    const stale = PENDING.filter((rel) => !existsSync(join(LIB, rel)))
    expect(stale, `Файлов нет в lib/: ${stale.join(", ")}`).toEqual([])
  })

  it("файлы вне PENDING соответствуют канону props 1.0", () => {
    const offenders: string[] = []
    for (const file of files) {
      const rel = file.slice(LIB.length + 1)
      if (PENDING.includes(rel)) continue
      for (const hit of scan(file).hits) offenders.push(`${hit.file}:${hit.line} [${hit.rule}] — ${hit.text}`)
    }
    expect(offenders, `Нарушения канона props 1.0:\n${offenders.join("\n")}`).toEqual([])
  })

  it("MaybeRef в props — только у data/schema-props из allowlist (решение 3)", () => {
    const offenders: string[] = []
    for (const file of files) {
      const rel = file.slice(LIB.length + 1)
      if (PENDING.includes(rel)) continue
      for (const ref of scan(file).maybeRefs) {
        if (!MAYBE_REF_ALLOWLIST.has(ref.key)) offenders.push(`${ref.key} (line ${ref.line})`)
      }
    }
    expect(offenders, `MaybeRef вне allowlist:\n${offenders.join("\n")}`).toEqual([])
  })

  it("распознаёт синтетические нарушения (self-check сканера)", () => {
    const probe = [
      "export interface ProbeProps {",
      "  classBody?: StyleClass",
      "  passwordToggleClass?: StyleClass",
      "  styles?: MaybeRef<Foo>",
      "  paramsFixWindow?: Partial<FixWindowProps>",
      "  isInvalid?: boolean",
      "  notAnimate?: boolean | undefined",
      "}",
      "export declare type IColumn = {}",
      "export declare type classCol = string"
    ]
    const ids = probe.flatMap((line) => RULES.filter((rule) => rule.test.test(line)).map((rule) => rule.id))
    expect(new Set(ids).size).toBe(RULES.length)
  })
})
