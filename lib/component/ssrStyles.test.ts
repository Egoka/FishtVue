import { beforeEach, describe, expect, it } from "vitest"
import { createSSRApp, h } from "vue"
import { renderToString } from "vue/server-renderer"
import Separator from "fishtvue/separator/Separator.vue"
import { cssComponents } from "fishtvue/component"

/**
 * Issue 5 (cross-cutting C17 / Button #1) — SSR-инжекция стилей.
 *
 * Канон: `Component.__hooks()` регистрирует `onServerPrefetch(() => initStyle())`,
 * а `__setStyle()` пишет в `cssComponents` БЕЗ guard `isClient()` (client-gated только
 * вызов `useStyle`). Nuxt server plugin (`lib/plugins/nuxt.ts`) сливает `cssComponents`
 * в `ssrContext.head` на хуке `app:rendered`. Значит, критический CSS попадает в SSR-HTML
 * ДО hydration — без flash-of-unstyled-content и hydration-mismatch на первом frame.
 *
 * `renderToString` НЕ вызывает `onMounted` (он срабатывает только при client mount),
 * поэтому если после server-render `cssComponents` заполнен — это доказывает, что
 * сработал именно `onServerPrefetch`-путь, а не клиентский. Тест ловит регрессию, если
 * кто-то обернёт `cssComponents.set` в `isClient()` или уберёт `onServerPrefetch` из
 * `Component.__hooks()`.
 */
describe("Component SSR style collection (Issue 5 — C17)", () => {
  beforeEach(() => {
    // cssComponents — module-singleton (живёт между тестами при isolate:false);
    // чистим ключ, чтобы доказать, что заполняет его именно текущий server-render,
    // а не прогрев из соседнего теста/файла.
    cssComponents.delete("Separator")
  })

  it("collects component CSS during server render (onServerPrefetch path)", async () => {
    const app = createSSRApp({ render: () => h(Separator) })
    const html = await renderToString(app)
    // 1) SSR-HTML уже содержит компонент со «special»-классом — нет пустого first paint.
    expect(html).toContain("fishtvue-separator")
    // 2) cssComponents заполнен server-side → Nuxt plugin сможет влить его в <head>.
    expect(cssComponents.has("Separator")).toBe(true)
    const css = cssComponents.get("Separator")
    expect(typeof css).toBe("string")
    expect((css as string).length).toBeGreaterThan(0)
  })

  it("does not require a client mount to populate the SSR style map", async () => {
    expect(cssComponents.has("Separator")).toBe(false) // очищено в beforeEach
    await renderToString(createSSRApp({ render: () => h(Separator) }))
    // onMounted при renderToString не вызывается — значит запись сделал onServerPrefetch.
    expect(cssComponents.has("Separator")).toBe(true)
  })
})
