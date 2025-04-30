import { describe, expect, it } from "vitest"
import { isFunction, generateUUID } from "fishtvue/utils/functionHandler"

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
  describe("generateUUID function", () => {
    it("should return a string", () => {
      const uuid = generateUUID()
      expect(typeof uuid).toBe("string")
    })

    it("should return a valid UUID v4 format", () => {
      const uuid = generateUUID()
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuid).toMatch(uuidV4Regex)
    })

    it("should return different values on multiple calls", () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      expect(uuid1).not.toBe(uuid2)
    })
  })
})
