import { describe, expect, it } from "vitest"
import { isDate, convertMask, formatDate } from "fishtvue/utils/dateHandler"
import { ru, enUS, de } from "date-fns/locale"

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
  describe("convertMask function", () => {
    it("should convert 'DD.MM.YYYY' to 'dd.MM.yyyy'", () => {
      expect(convertMask("DD.MM.YYYY")).toBe("dd.MM.yyyy")
    })

    it("should convert 'YYYY/MM/DD' to 'yyyy/MM/dd'", () => {
      expect(convertMask("YYYY/MM/DD")).toBe("yyyy/MM/dd")
    })

    it("should convert 'DD MMMM YYYY' to 'dd MMMM yyyy'", () => {
      expect(convertMask("DD MMMM YYYY")).toBe("dd MMMM yyyy")
    })

    it("should convert 'MM' to 'MM'", () => {
      expect(convertMask("MM")).toBe("MM")
    })

    it("should convert 'Do' to 'do'", () => {
      expect(convertMask("Do")).toBe("do")
    })

    it("should convert 'HH' to 'HH'", () => {
      expect(convertMask("HH")).toBe("HH")
    })

    it("should convert 'SSS' to 'SSS'", () => {
      expect(convertMask("SSS")).toBe("SSS")
    })

    it("should convert 'ZZ' to 'xx'", () => {
      expect(convertMask("ZZ")).toBe("xx")
    })

    it("should convert 'ZZZ' to 'xxx'", () => {
      expect(convertMask("ZZZ")).toBe("xxx")
    })

    it("should convert 'L' to 'P'", () => {
      expect(convertMask("L")).toBe("P")
    })
  })

  describe("formatDate function", () => {
    const testDate = new Date(2023, 9, 13, 15, 30, 45) // 13 октября 2023, 15:30:45

    it("should format Date object with default mask", () => {
      expect(formatDate(testDate)).toBe("13.10.2023")
    })

    it("should format ISO string correctly", () => {
      expect(formatDate("2023-10-13T15:30:45.000Z")).toBe("13.10.2023")
    })

    it("should format short ISO date correctly", () => {
      expect(formatDate("2023-10-13")).toBe("13.10.2023")
    })

    it("should format localized date string (DD.MM.YYYY)", () => {
      expect(formatDate("13.10.2023")).toBe("13.10.2023")
    })

    it("should handle custom date format (DD MMMM YYYY)", () => {
      expect(formatDate(testDate, "DD MMMM YYYY")).toBe("13 October 2023")
    })

    it("should handle time formatting (HH:mm:ss)", () => {
      expect(formatDate(testDate, "HH:mm:ss")).toBe("15:30:45")
    })

    it("should handle AM/PM formatting (hh:mm A)", () => {
      expect(formatDate(testDate, "hh:mm A")).toBe("03:30 PM")
    })

    it("should handle Russian locale automatically", () => {
      expect(formatDate("13.10.2023", "DD MMMM YYYY")).toBe("13 октября 2023")
    })

    it("should handle explicit locale override", () => {
      expect(formatDate(testDate, "DD MMMM YYYY", { locale: de })).toBe("13 Oktober 2023")
    })

    it("should handle weekday formatting (WWWW)", () => {
      expect(formatDate(testDate, "WWWW")).toBe("Friday")
    })

    it("should handle ordinal day (Do)", () => {
      expect(formatDate(testDate, "Do MMMM")).toBe("13th October")
    })

    it("should handle localized format (L)", () => {
      expect(formatDate(testDate, "L", { locale: enUS })).toBe("10/13/2023")
      expect(formatDate(testDate, "L", { locale: ru })).toBe("13.10.2023")
    })

    it("should throw error for invalid date string", () => {
      expect(() => formatDate("invalid-date")).toThrow("Invalid date")
    })

    it("should throw error for non-date value", () => {
      expect(() => formatDate({} as any)).toThrow("Invalid date value")
    })

    it("should handle empty string as invalid date", () => {
      expect(() => formatDate("")).toThrow("Invalid date")
    })

    it("should handle null value", () => {
      expect(() => formatDate(null as any)).toThrow("Invalid date value")
    })

    it("should handle undefined value", () => {
      expect(() => formatDate(undefined as any)).toThrow("Invalid date value")
    })

    it("should handle number timestamp", () => {
      expect(formatDate(testDate.getTime())).toBe("13.10.2023")
    })

    it("should handle complex format with timezone", () => {
      const result = formatDate(testDate, "YYYY-MM-DD HH:mm ZZ")
      expect(result).toMatch(/^2023-10-13 15:30 [+-]\d{4}$/)
    })

    it("should handle different month formats", () => {
      expect(formatDate(testDate, "MM")).toBe("10")
      expect(formatDate(testDate, "MMM")).toBe("Oct")
      expect(formatDate(testDate, "MMMM")).toBe("October")
    })

    it("should handle different year formats", () => {
      expect(formatDate(testDate, "YY")).toBe("23")
      expect(formatDate(testDate, "YYYY")).toBe("2023")
    })
  })
})
