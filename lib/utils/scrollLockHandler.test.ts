import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  __resetScrollLockForTests,
  getScrollLockCount,
  lockBodyScroll,
  unlockBodyScroll
} from "fishtvue/utils/scrollLockHandler"

describe("Testing scrollLockHandler", () => {
  beforeEach(() => {
    __resetScrollLockForTests()
    document.body.removeAttribute("style")
    document.body.classList.remove("fv-scroll-locked")
  })

  afterEach(() => {
    __resetScrollLockForTests()
    document.body.removeAttribute("style")
    document.body.classList.remove("fv-scroll-locked")
  })

  describe("lockBodyScroll / unlockBodyScroll", () => {
    it("single lock locks body, single unlock restores", () => {
      expect(getScrollLockCount()).toBe(0)
      lockBodyScroll()
      expect(getScrollLockCount()).toBe(1)
      expect(document.body.style.overflow).toBe("hidden")
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(true)

      unlockBodyScroll()
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("")
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(false)
    })

    it("nested locks: body remains locked until all unlock", () => {
      lockBodyScroll() // Dialog A open
      lockBodyScroll() // Dialog B (nested) open
      expect(getScrollLockCount()).toBe(2)
      expect(document.body.style.overflow).toBe("hidden")

      unlockBodyScroll() // Dialog A close
      expect(getScrollLockCount()).toBe(1)
      expect(document.body.style.overflow).toBe("hidden") // ещё locked, B открыт

      unlockBodyScroll() // Dialog B close
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("") // финально restored
    })

    it("preserves original body.style.overflow on unlock", () => {
      document.body.style.overflow = "scroll"
      lockBodyScroll()
      expect(document.body.style.overflow).toBe("hidden")

      unlockBodyScroll()
      expect(document.body.style.overflow).toBe("scroll")
    })

    it("preserves original body.style.paddingRight on unlock", () => {
      document.body.style.paddingRight = "12px"
      lockBodyScroll()
      // paddingRight теперь может быть либо "12px" (если jsdom не считает scrollbar)
      // либо изменён на scrollbar width — после unlock должно вернуться к "12px"

      unlockBodyScroll()
      expect(document.body.style.paddingRight).toBe("12px")
    })

    it("unlock without prior lock is no-op (counter clamps to 0)", () => {
      unlockBodyScroll()
      unlockBodyScroll()
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(false)
    })

    it("triple lock + triple unlock returns to baseline", () => {
      lockBodyScroll()
      lockBodyScroll()
      lockBodyScroll()
      expect(getScrollLockCount()).toBe(3)
      unlockBodyScroll()
      unlockBodyScroll()
      unlockBodyScroll()
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("")
    })
  })
})
