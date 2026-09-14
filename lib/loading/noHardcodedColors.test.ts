import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

/**
 * Guard для [loading.md Issue 7](../../Documentation/issues/loading.md) — hardcoded HEX в спиннерах.
 *
 * Проблема была не в том, что цвета «некрасивые», а в том, что они не подчинялись теме: `Loading`
 * резолвит `color` из палитры и прокидывает его вниз инлайн-стилем, но CSS-фолбэки внутри самих
 * спиннеров оставались литеральным `#ff1d5e`, а дефолт prop'а — `#fff`. Любой путь, где инлайн-стиль
 * не доезжает (SSR-снимок до гидратации, потребитель, рендерящий спиннер напрямую), показывал
 * розовый или белый вместо цвета темы.
 *
 * Все они переведены на `currentColor` — то есть спиннер наследует цвет текста, а `Loading`
 * по-прежнему может задать конкретный. Тест держит это состояние: 22 файла легко разъезжаются,
 * а глазами такой дрейф не ловится.
 */
const LOADING = resolve(process.cwd(), "lib/loading")
const HEX = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g

function collectVue(dir: string): string[] {
  return readdirSync(join(LOADING, dir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".vue"))
    .map((entry) => join(LOADING, dir, entry.name))
}

describe("Loading — спиннеры не содержат захардкоженных цветов", () => {
  it.each([["epic"], ["svg"]])("в %s/*.vue нет HEX-литералов", (dir) => {
    const offenders = collectVue(dir)
      .map((file) => ({ file, hits: [...new Set(readFileSync(file, "utf8").match(HEX) ?? [])] }))
      .filter((entry) => entry.hits.length > 0)
      .map((entry) => `${entry.file.replace(`${LOADING}/`, "")}: ${entry.hits.join(", ")}`)

    expect(offenders).toEqual([])
  })

  it("epic-спиннеры по умолчанию наследуют цвет текста", async () => {
    const files = collectVue("epic")
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const source = readFileSync(file, "utf8")
      // у каждого спиннера есть prop `color`; его дефолт должен быть currentColor
      expect(source).toMatch(/color:\s*\{[^}]*default:\s*"currentColor"/s)
    }
  })
})
