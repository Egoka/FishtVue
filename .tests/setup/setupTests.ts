import { config } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"
import { afterEach, vi } from "vitest"
import { mockFishtvueTheme } from "./mocks/fishtvueThemeMock"

global.ResizeObserver = ResizeObserver
config.global.stubs.transition = false

mockFishtvueTheme()

// vite.config.ts isolate:false — vi-состояние общее на весь прогон (все *.test.ts в одном
// worker'е). Если тест берёт vi.useFakeTimers() и падает раньше своего vi.useRealTimers()
// (inline-cleanup в теле теста, а не afterEach), фейковые таймеры остаются висеть на ВСЕ
// последующие файлы: setTimeout-based ожидания виснут до собственного таймаута, а new Date()
// перестаёт быть настоящим Date (fake timers по умолчанию подменяют и его). Global afterEach —
// страховка от всего класса такой утечки, а не точечный фикс одного теста.
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // устарело, для старых браузеров
    removeListener: () => {}, // устарело, для старых браузеров
    addEventListener: () => {}, // новый стандарт
    removeEventListener: () => {}, // новый стандарт
    dispatchEvent: () => false
  })
})

Object.defineProperty(window, "scrollTo", {
  writable: true,
  configurable: true,
  value: vi.fn()
})
