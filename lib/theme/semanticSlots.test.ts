import { describe, expect, it } from "vitest"
import { tailwind } from "fishtvue/theme/unoStyle/tailwind"
import { colors } from "fishtvue/theme/primitive"

/**
 * Semantic-слоты интентов — [alert.md Issue 9](../../Documentation/issues/alert.md), решение R11.
 *
 * `success` / `warning` / `info` / `error` заведены как **обычные именованные цвета** движка,
 * зеркаля структурный слот `surface` (Wave 9). Ключевое свойство механизма: цветовые regex в
 * `unoRules.ts` собираются через `Object.keys(colors)`, поэтому новое имя подхватывается само —
 * правок движка не потребовалось ни тогда, ни сейчас.
 *
 * Смысл слотов — не в новых цветах (дефолты равны green/yellow/blue/red), а в том, что интент
 * Alert стало возможно перекрасить темой, не отбирая у потребителя саму палитру `red-*`.
 */
const INTENTS = [
  ["success", "green"],
  ["warning", "yellow"],
  ["info", "blue"],
  ["error", "red"]
] as const

describe("Semantic-слоты интентов", () => {
  it.each(INTENTS)("%s объявлен в палитре полной шкалой", (intent) => {
    const scale = (colors as any)[intent]
    expect(scale).toBeDefined()
    for (const tone of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      expect(scale[tone]).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it.each(INTENTS)("%s по умолчанию совпадает с примитивной шкалой %s", (intent, primitive) => {
    expect((colors as any)[intent]).toEqual((colors as any)[primitive])
  })

  it.each(INTENTS)("движок принимает %s как любой другой именованный цвет", (intent) => {
    // важна не строка, а сам факт: правило собирается из Object.keys(colors), поэтому
    // класс не дропается fail-closed'ом и эмитится через CSS-variable indirection
    const css = tailwind(`bg-${intent}-500`)
    expect(css).toBeDefined()
    expect(css).toContain(`var(--fv-${intent}-500`)
  })

  it("слоты независимы от исходных палитр — переопределение одного не трогает другую", () => {
    // Проверяется структурно: это разные ключи в `colors`, а не алиасы одного объекта.
    for (const [intent, primitive] of INTENTS) {
      expect((colors as any)[intent]).not.toBe((colors as any)[primitive])
    }
  })
})
