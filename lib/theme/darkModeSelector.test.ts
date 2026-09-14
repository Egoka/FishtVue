import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { defineComponent, h } from "vue"
import FishtVue from "fishtvue/config"
import Component from "fishtvue/component"
import { cssComponents } from "fishtvue/component"

/**
 * Cross-cutting B11 — `optionsTheme.darkModeSelector` (button.md Issue 16 / theme.md Issue 5, Wave 3.4).
 *
 * Контракт: при заданном `darkModeSelector` движок генерирует `dark:*` варианты на этот селектор
 * вместо дефолтного `@media (prefers-color-scheme: dark)`. Полный production-путь:
 *   plugin `optionsTheme.darkModeSelector`
 *     → `Component.__globalOptionsTheme.darkModeSelector` (lib/component/index.ts:70)
 *     → `Component.setStyle` прокидывает как `darkSelector` (lib/component/index.ts:150)
 *     → `tailwind()` подменяет media-query на селектор (lib/theme/unoStyle/tailwind.ts:95).
 *
 * Почему уникально-именованные probe, а не Button:
 * `setStyle` дедуплицирует уже сгенерированные классы через module-private singletons
 * (`listOfStyledComponents`/`listOfCssComponents`), и ключ дедупа = имя компонента, БЕЗ селектора.
 * vitest делит module-registry между файлами, поэтому реальные компоненты (Button и пр.) монтируются
 * в своих test-файлах БЕЗ dark-конфига и «занимают» свой ключ первыми → `cssComponents.get("Button")`
 * отдал бы устаревший `@media`-вариант (и наоборот — мы бы протекли darkSelector-CSS в их ключ).
 * Конструктор `Component` принимает явное имя (lib/component/index.ts:65,72) → probe с уникальным
 * именем получает свежие ключи дедупа: детерминированно и без загрязнения чужих ключей. По одному
 * имени на сценарий — иначе дедуп отдал бы CSS первого мона второму.
 *
 * jsdom не вычисляет `@media`/CSS-nesting, поэтому контракт проверяется на уровне строки
 * сгенерированного CSS (так же, как все `tailwind()`-тесты движка). `isNotMinifyCSS: true` отключает
 * минификацию — сравниваем с «сырым» селектором.
 */
const makeProbe = (name: string) =>
  defineComponent({
    name,
    setup() {
      // Конфиг (darkModeSelector / isNotMinifyCSS) инжектится из плагина смонтированного приложения.
      const probe = new Component<any>(name)
      const cls = probe.setStyle(["dark:bg-neutral-900", "dark:p-0"])
      return () => h("div", { class: cls }, "probe")
    }
  })

const CONFIGURED_PROBE = "DarkModeSelectorProbeConfigured"
const DEFAULT_PROBE = "DarkModeSelectorProbeDefault"
const ConfiguredProbe = makeProbe(CONFIGURED_PROBE)
const DefaultProbe = makeProbe(DEFAULT_PROBE)

describe("optionsTheme.darkModeSelector → dark:* CSS", () => {
  const appWithConfig = (config: Record<string, unknown>) => ({
    install(app: any) {
      app.use(FishtVue, config)
    }
  })

  beforeEach(() => {
    // `window.FishtVue` — глобальный singleton (config inject-first / window-fallback): чистим,
    // чтобы dark-конфиг не протёк в соседние файлы и наоборот.
    delete (window as any).FishtVue
    cssComponents.delete(CONFIGURED_PROBE as any)
    cssComponents.delete(DEFAULT_PROBE as any)
  })

  afterEach(() => {
    delete (window as any).FishtVue
    document.documentElement.removeAttribute("data-theme")
  })

  it("generates dark:* variants against the configured selector instead of the media query", () => {
    // Runtime-сценарий из ТЗ: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"`.
    document.documentElement.setAttribute("data-theme", "dark")

    const wrapper = mount(ConfiguredProbe, {
      global: {
        plugins: [appWithConfig({ optionsTheme: { darkModeSelector: "[data-theme='dark']", isNotMinifyCSS: true } })]
      }
    })
    expect(wrapper.exists()).toBe(true)
    // Компонент эмитит `dark:*` variant-классы в DOM (сторона разметки).
    expect(wrapper.html()).toContain("dark:")

    const css = cssComponents.get(CONFIGURED_PROBE as any) ?? ""
    // ...а сгенерированный CSS скоупит их на настроенный селектор (сторона стилей).
    expect(css).toContain("[data-theme='dark']")
    // Ни один dark:* не остался дефолтным OS-pref media-query.
    expect(css).not.toContain("prefers-color-scheme")
  })

  it("falls back to the prefers-color-scheme media query when no darkModeSelector is configured", () => {
    const wrapper = mount(DefaultProbe, {
      global: { plugins: [appWithConfig({ optionsTheme: { isNotMinifyCSS: true } })] }
    })
    expect(wrapper.exists()).toBe(true)

    const css = cssComponents.get(DEFAULT_PROBE as any) ?? ""
    // Без конфига — дефолтное поведение (OS-preference), селектор не подставляется.
    expect(css).toContain("@media (prefers-color-scheme: dark)")
    expect(css).not.toContain("[data-theme='dark']")
  })
})
