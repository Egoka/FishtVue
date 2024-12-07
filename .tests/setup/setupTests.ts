import { config } from "@vue/test-utils"
import "intersection-observer"
import ResizeObserver from "resize-observer-polyfill"
import { mockFishtvueTheme } from "./mocks/fishtvueThemeMock"

global.ResizeObserver = ResizeObserver
config.global.stubs.transition = false

mockFishtvueTheme()
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
