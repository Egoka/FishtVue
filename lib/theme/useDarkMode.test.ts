import { afterEach, describe, expect, it, vi } from "vitest"
import { defineComponent, h, nextTick } from "vue"
import { mount } from "@vue/test-utils"
import FishtVue from "fishtvue/config"
import { useDarkMode } from "fishtvue/theme"

/**
 * `useDarkMode` (2026-09-05) — общий источник истины о тёмной теме.
 *
 * Раньше эти ~40 строк были скопированы в Table и Calendar, а TextEditor вовсе их не имел и
 * переключался по системной цветовой схеме. Тест закрывает обе ветки: DOM-селектор из конфига
 * и fallback на `prefers-color-scheme`.
 *
 * Размонтирование ведётся вручную: `enableAutoUnmount` — глобальный однократный вызов
 * @vue/test-utils, он уже занят `TextEditor.test.ts`.
 */
const mounted: Array<{ unmount: () => void }> = []

/** Монтирует компонент-обёртку, единственная задача которой — вызвать composable в setup(). */
function mountWithDarkMode(plugins: any[] = []) {
  const seen: { value: boolean | undefined } = { value: undefined }
  const Probe = defineComponent({
    setup() {
      const isDark = useDarkMode()
      return () => {
        seen.value = isDark.value
        return h("div", { "data-probe": String(isDark.value) })
      }
    }
  })
  const wrapper = mount(Probe, { global: { plugins } })
  mounted.push(wrapper)
  return { wrapper, seen }
}

function withSelector(selector: string) {
  return [
    {
      install(app: any) {
        app.use(FishtVue, { optionsTheme: { darkModeSelector: selector } })
      }
    }
  ]
}

afterEach(() => {
  // Наблюдатели снимаются в onUnmounted — без размонтирования они переживут файл (isolate: false).
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.documentElement.className = ""
  document.documentElement.removeAttribute("data-theme")
  delete (window as any).FishtVue
})

describe("useDarkMode — ветка darkModeSelector", () => {
  it("читает DOM при сконфигурированном селекторе-классе", () => {
    document.documentElement.classList.add("dark")
    const { wrapper } = mountWithDarkMode(withSelector(".dark"))

    expect(wrapper.attributes("data-probe")).toBe("true")
  })

  it("отдаёт false, когда селектор задан, но в DOM его нет", () => {
    const { wrapper } = mountWithDarkMode(withSelector(".dark"))
    expect(wrapper.attributes("data-probe")).toBe("false")
  })

  it("поддерживает data-атрибут как селектор", () => {
    document.documentElement.setAttribute("data-theme", "dark")
    const { wrapper } = mountWithDarkMode(withSelector("[data-theme='dark']"))

    expect(wrapper.attributes("data-probe")).toBe("true")
  })

  it("реагирует на изменение DOM после монтирования", async () => {
    const { wrapper } = mountWithDarkMode(withSelector(".dark"))
    expect(wrapper.attributes("data-probe")).toBe("false")

    document.documentElement.classList.add("dark")
    // MutationObserver доставляет колбэк микротаском — нужен реальный цикл, не только nextTick.
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()

    expect(wrapper.attributes("data-probe")).toBe("true")
  })

  it("отключает наблюдатель при размонтировании", async () => {
    const disconnect = vi.fn()
    const original = window.MutationObserver
    window.MutationObserver = class {
      observe() {}
      disconnect() {
        disconnect()
      }
      takeRecords() {
        return []
      }
    } as any

    try {
      const { wrapper } = mountWithDarkMode(withSelector(".dark"))
      wrapper.unmount()
      expect(disconnect).toHaveBeenCalledTimes(1)
    } finally {
      window.MutationObserver = original
    }
  })
})

describe("useDarkMode — fallback на prefers-color-scheme", () => {
  it("берёт значение из matchMedia, когда селектор не задан", () => {
    const original = window.matchMedia
    ;(window as any).matchMedia = () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {}
    })

    try {
      const { wrapper } = mountWithDarkMode()
      expect(wrapper.attributes("data-probe")).toBe("true")
    } finally {
      ;(window as any).matchMedia = original
    }
  })

  it("подписывается на change и снимает слушатель при размонтировании", () => {
    const removeEventListener = vi.fn()
    let handler: ((event: { matches: boolean }) => void) | undefined
    const original = window.matchMedia
    ;(window as any).matchMedia = () => ({
      matches: false,
      addEventListener: (_: string, fn: any) => (handler = fn),
      removeEventListener
    })

    try {
      const { wrapper, seen } = mountWithDarkMode()
      expect(seen.value).toBe(false)

      handler?.({ matches: true })
      expect(handler).toBeTypeOf("function")

      wrapper.unmount()
      expect(removeEventListener).toHaveBeenCalledTimes(1)
    } finally {
      ;(window as any).matchMedia = original
    }
  })
})
