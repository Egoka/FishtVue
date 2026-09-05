import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

/**
 * Cross-cutting guard для E29.7 (`prefers-reduced-motion`) — Wave 10.1.
 *
 * Волна закрывалась покомпонентно, и её прогресс годами трекался счётчиком «N / 22» в
 * [Documentation/issues/README.md]. Счётчик отвечал на вопрос «сколько файлов тронули», а не
 * «не осталось ли негейтнутых переходов», поэтому построчная проверка каждый раз откладывалась.
 * Проведённая 2026-09-05, она нашла два реальных пробела:
 *
 * - `InputLayout.vue` — active-классы `<transition>` (`leave-active-class`/`enter-active-class`).
 *   Они попадают в DOM напрямую, минуя `Component.setStyle()`, поэтому заход по классам
 *   компонента их не задевал;
 * - `Switch.vue` — голый `transition` на иконке помощи.
 *
 * Этот тест заменяет ручную сверку: любой новый негейтнутый `transition-*` в `lib/**\/*.vue`
 * валит сборку с указанием файла и строки.
 */
const LIB = resolve(process.cwd(), "lib")

/**
 * Утилитарные классы Tailwind вида `transition` / `transition-colors`.
 * Отсекаются: Vue-теги `<transition>`, CSS-свойство `transition:` и имена вроде `transitionName`.
 */
const TRANSITION_CLASS = /(?<![\w:-])(transition(?:-[a-z]+)?)(?![\w:-])/g

function collectSfc(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectSfc(full))
    else if (entry.name.endsWith(".vue")) out.push(full)
  }
  return out
}

function unguardedTransitions(file: string): Array<{ line: number; text: string }> {
  const found: Array<{ line: number; text: string }> = []
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      // Комментарии исходника — не разметка.
      const code = line.replace(/\/\/.*$/, "")
      let match: RegExpExecArray | null
      TRANSITION_CLASS.lastIndex = 0
      while ((match = TRANSITION_CLASS.exec(code))) {
        const before = code.slice(Math.max(0, match.index - 12), match.index)
        if (before.endsWith("motion-safe:")) continue
        // `<transition>` / `</transition>` — компонент Vue, не класс.
        if (/[</]$/.test(before.trimEnd()) || /[</]transition/i.test(code.slice(Math.max(0, match.index - 2)))) continue
        // `transition:` в CSS-блоке или сравнение строки в скрипте.
        if (code.slice(match.index + match[0].length).startsWith(":")) continue
        if (/["']transition-none["']/.test(code)) continue
        found.push({ line: index + 1, text: code.trim().slice(0, 120) })
      }
    })
  return found
}

describe("Cross-cutting E29.7 — prefers-reduced-motion (Wave 10.1)", () => {
  const files = collectSfc(LIB)

  it("находит SFC для проверки", () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it("ни один transition-класс не остаётся без motion-safe:", () => {
    const offenders: string[] = []
    for (const file of files) {
      for (const hit of unguardedTransitions(file)) {
        offenders.push(`${file.slice(LIB.length + 1)}:${hit.line} — ${hit.text}`)
      }
    }

    expect(offenders, `Негейтнутые переходы:\n${offenders.join("\n")}`).toEqual([])
  })

  it("покрывает active-классы <transition>, а не только class-атрибуты", () => {
    // Регрессия InputLayout: пробел жил именно в enter/leave-active-class, поэтому проверка
    // обязана видеть их. Синтетический пример должен распознаваться как нарушение.
    const probe = '<transition leave-active-class="transition ease-in duration-200">'
    const matches = [...probe.matchAll(TRANSITION_CLASS)].filter(
      (m) => !probe.slice(Math.max(0, m.index! - 12), m.index!).endsWith("motion-safe:")
    )

    expect(matches.length).toBeGreaterThan(0)
  })
})
