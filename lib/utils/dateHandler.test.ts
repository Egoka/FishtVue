import { describe, it, expect } from "vitest"
import { isDate } from "fishtvue/utils/dateHandler"

describe("Testing date handler", () => {
  describe("isDate function", () => {
    it("should return true for a Date object", () => {
      const date = new Date()
      expect(isDate(date)).toBe(true)
    })

    it("should return false for a non-Date object", () => {
      const notDate = {}
      expect(isDate(notDate)).toBe(false)
    })

    it("should return false for a string", () => {
      const str = "2024-07-30"
      expect(isDate(str)).toBe(false)
    })

    it("should return false for a number", () => {
      const num = 1234567890
      expect(isDate(num)).toBe(false)
    })

    it("should return false for null", () => {
      const nullValue = null
      expect(isDate(nullValue)).toBe(false)
    })

    it("should return false for undefined", () => {
      const undefinedValue = undefined
      expect(isDate(undefinedValue)).toBe(false)
    })

    it("should return false for an array", () => {
      const array: any[] = []
      expect(isDate(array)).toBe(false)
    })

    it("should return false for a function", () => {
      const func = () => {}
      expect(isDate(func)).toBe(false)
    })

    it("should return false for an object with a Date-like structure", () => {
      const dateLikeObject = {
        getTime: () => {},
        constructor: Date
      }
      expect(isDate(dateLikeObject)).toBe(false)
    })
  })
})
