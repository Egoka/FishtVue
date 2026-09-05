import { config } from "@vue/test-utils"
import ResizeObserver from "resize-observer-polyfill"
import { afterEach, vi } from "vitest"
import { mockFishtvueTheme } from "./mocks/fishtvueThemeMock"

global.ResizeObserver = ResizeObserver
config.global.stubs.transition = false

mockFishtvueTheme()

// NB: `enableAutoUnmount` сюда поставить нельзя — setupFiles переисполняются на каждый тест-файл,
// а счётчик внутри @vue/test-utils глобальный: со второго файла прогон падает с
// «enableAutoUnmount cannot be called more than once». Размонтирование делается в тех файлах,
// где оно нужно (см. `TextEditor.test.ts`).

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
