import { describe, it, expect } from "vitest"
import { isFunction } from "fishtvue/utils/functionHandler"

describe("Testing function handler", () => {
  describe("isFunction function", () => {
    it("should return true for regular functions", () => {
      function regularFunction() {}

      expect(isFunction(regularFunction)).toBe(true)
    })

    it("should return true for arrow functions", () => {
      const arrowFunction = () => {}
      expect(isFunction(arrowFunction)).toBe(true)
    })

    it("should return true for functions created with Function constructor", () => {
      const funcConstructor = new Function("return true")
      expect(isFunction(funcConstructor)).toBe(true)
    })

    it("should return false for non-function values", () => {
      expect(isFunction(null)).toBe(false)
      expect(isFunction(undefined)).toBe(false)
      expect(isFunction({})).toBe(false)
      expect(isFunction([])).toBe(false)
      expect(isFunction(123)).toBe(false)
      expect(isFunction("string")).toBe(false)
      expect(isFunction(true)).toBe(false)
      expect(isFunction(new Date())).toBe(false)
    })

    it("should return false for objects with apply method", () => {
      const objWithApply = {
        apply: () => {}
      }
      expect(isFunction(objWithApply)).toBe(false)
    })
  })
})
