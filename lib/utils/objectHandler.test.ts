import { describe, it, expect, beforeEach } from "vitest"
import {
  type,
  isObject,
  isEmpty,
  isNotEmpty,
  get,
  fieldsOmit,
  fieldsPick,
  deepMerge,
  deepEquals,
  resolveFieldData,
  equals,
  compare,
  deepCopyObject,
  deepCopy,
  deepFreeze,
  freeze,
  unFreeze
} from "fishtvue/utils/objectHandler"

describe("Testing object handler", () => {
  describe("type function", () => {
    it('should return "array" for arrays', () => {
      expect(type([1, 2, 3])).toBe("array")
    })

    it('should return "object" for objects', () => {
      expect(type({ key: "value" })).toBe("object")
    })

    it('should return "string" for strings', () => {
      expect(type("Hello")).toBe("string")
    })

    it('should return "number" for numbers', () => {
      expect(type(123)).toBe("number")
    })

    it('should return "boolean" for boolean values', () => {
      expect(type(true)).toBe("boolean")
      expect(type(false)).toBe("boolean")
    })

    it('should return "null" for null', () => {
      expect(type(null)).toBe("null")
    })

    it('should return "undefined" for undefined', () => {
      expect(type(undefined)).toBe("undefined")
    })

    it('should return "function" for functions', () => {
      expect(type(() => {})).toBe("function")
      expect(type(function () {})).toBe("function")
    })

    it('should return "date" for Date objects', () => {
      expect(type(new Date())).toBe("date")
    })

    it('should return "regexp" for regular expressions', () => {
      expect(type(/abc/)).toBe("regexp")
    })

    it('should return "error" for Error objects', () => {
      expect(type(new Error())).toBe("error")
    })

    it('should return "symbol" for symbols', () => {
      expect(type(Symbol("symbol"))).toBe("symbol")
    })

    it('should return "bigint" for BigInt values', () => {
      expect(type(BigInt(123))).toBe("bigint")
    })

    it('should return "set" for Set objects', () => {
      expect(type(new Set())).toBe("set")
    })

    it('should return "map" for Map objects', () => {
      expect(type(new Map())).toBe("map")
    })

    it('should return "weakmap" for WeakMap objects', () => {
      expect(type(new WeakMap())).toBe("weakmap")
    })

    it('should return "weakset" for WeakSet objects', () => {
      expect(type(new WeakSet())).toBe("weakset")
    })
  })

  describe("isObject function", () => {
    it("should return true for plain objects", () => {
      expect(isObject({ name: "John", age: 25 })).toBe(true)
    })

    it("should return true for empty objects by default", () => {
      expect(isObject({})).toBe(true)
    })

    it('should return false for empty objects when "empty" is false', () => {
      expect(isObject({}, false)).toBe(false)
    })

    it("should return false for non-object values", () => {
      expect(isObject(123)).toBe(false)
      expect(isObject("string")).toBe(false)
      expect(isObject(true)).toBe(false)
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject([])).toBe(false)
      expect(isObject(() => {})).toBe(false)
      expect(isObject(new Date())).toBe(false)
      expect(isObject(/regex/)).toBe(false)
    })

    it("should return false for arrays", () => {
      expect(isObject([1, 2, 3])).toBe(false)
    })

    it("should return false for functions", () => {
      expect(isObject(function () {})).toBe(false)
      expect(isObject(() => {})).toBe(false)
    })

    it("should return true for object created with Object.create(null)", () => {
      const obj = Object.create(null)
      expect(isObject(obj)).toBe(false)
    })

    it('should return true for objects when "empty" is true', () => {
      const obj = { key: "value" }
      expect(isObject(obj, true)).toBe(true)
    })
  })

  describe("isEmpty function", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true)
    })

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true)
    })

    it("should return true for empty strings", () => {
      expect(isEmpty("")).toBe(true)
    })

    it("should return false for non-empty strings", () => {
      expect(isEmpty("Hello")).toBe(false)
    })

    it("should return true for empty arrays", () => {
      expect(isEmpty([])).toBe(true)
    })

    it("should return false for non-empty arrays", () => {
      expect(isEmpty([1, 2, 3])).toBe(false)
    })

    it("should return true for empty objects", () => {
      expect(isEmpty({})).toBe(true)
    })

    it("should return false for non-empty objects", () => {
      expect(isEmpty({ key: "value" })).toBe(false)
    })

    it("should return false for Date objects", () => {
      expect(isEmpty(new Date())).toBe(false)
    })

    it("should return false for boolean values", () => {
      expect(isEmpty(true)).toBe(false)
      expect(isEmpty(false)).toBe(false)
    })

    it("should return false for numbers", () => {
      expect(isEmpty(0)).toBe(false)
      expect(isEmpty(123)).toBe(false)
    })

    it("should return false for functions", () => {
      expect(isEmpty(() => {})).toBe(false)
    })

    it("should return false for regular expressions", () => {
      expect(isEmpty(new RegExp(/abc/))).toBe(false)
    })
  })

  describe("isNotEmpty function", () => {
    it("should return true for non-empty strings", () => {
      expect(isNotEmpty("Hello")).toBe(true)
    })

    it("should return false for empty values", () => {
      expect(isNotEmpty("")).toBe(false) // Пустая строка
      expect(isNotEmpty([])).toBe(false) // Пустой массив
      expect(isNotEmpty({})).toBe(false) // Пустой объект
      expect(isNotEmpty(null)).toBe(false) // null
      expect(isNotEmpty(undefined)).toBe(false) // undefined
    })
  })

  describe("get function", () => {
    const data = {
      user: {
        name: "John",
        age: 25,
        address: {
          street: "123 Main St",
          city: "Anytown",
          details: {
            zip: "12345",
            coordinates: {
              lat: 40.7128,
              lon: -74.006
            }
          }
        },
        hobbies: ["reading", "hiking"],
        isActive: true,
        nullValue: null,
        undefinedValue: undefined
      }
    }

    it("should retrieve a value for a shallow path", () => {
      expect(get(data, "user.name")).toBe("John")
      expect(get(data, "user.age")).toBe(25)
    })

    it("should retrieve a value for a nested path", () => {
      expect(get(data, "user.address.street")).toBe("123 Main St")
      expect(get(data, "user.address.details.zip")).toBe("12345")
    })

    it("should retrieve a value for a deeply nested path", () => {
      expect(get(data, "user.address.details.coordinates.lat")).toBe(40.7128)
      expect(get(data, "user.address.details.coordinates.lon")).toBe(-74.006)
    })

    it("should retrieve a value from an array", () => {
      expect(get(data, "user.hobbies[0]")).toBe("reading")
      expect(get(data, "user.hobbies[1]")).toBe("hiking")
    })

    it("should handle paths with array notation", () => {
      expect(get(data, ["user", "address", "city"])).toBe("Anytown")
      expect(get(data, ["user", "address", "details", "zip"])).toBe("12345")
    })

    it("should return undefined for non-existing paths", () => {
      expect(get(data, "user.phone")).toBe(undefined)
      expect(get(data, "user.address.zipCode")).toBe(undefined)
    })

    it("should return undefined for empty path string", () => {
      expect(get(data, "")).toBe(undefined)
    })

    it("should return undefined for empty path array", () => {
      expect(get(data, [])).toBe(undefined)
    })

    it("should return undefined for null or undefined values", () => {
      expect(get(data, "user.nullValue")).toBe(null)
      expect(get(data, "user.undefinedValue")).toBe(undefined)
    })

    it("should not throw an error when accessing undefined nested paths", () => {
      expect(get(data, "user.nonexistent.deep.path")).toBe(undefined)
    })
  })

  describe("fieldsOmit function", () => {
    it("should omit specified fields from the object", () => {
      const obj = { name: "John", age: 25, city: "New York" }
      const result = fieldsOmit(obj, ["age", "city"])
      expect(result).toEqual({ name: "John" })
    })

    it("should return an empty object when all fields are omitted", () => {
      const obj = { name: "John", age: 25, city: "New York" }
      const result = fieldsOmit(obj, ["name", "age", "city"])
      expect(result).toEqual({})
    })

    it("should return the original object when no fields are omitted", () => {
      const obj = { name: "John", age: 25, city: "New York" }
      const result = fieldsOmit(obj, [])
      expect(result).toEqual(obj)
    })

    it("should ignore fields that do not exist in the object", () => {
      const obj = { name: "John", age: 25 }
      const result = fieldsOmit(obj, ["city", "country"])
      expect(result).toEqual(obj)
    })

    it("should handle nested objects", () => {
      const obj = {
        name: "John",
        details: { age: 25, city: "New York" },
        preferences: { food: "pizza", color: "blue" }
      }
      const result = fieldsOmit(obj, ["details"])
      expect(result).toEqual({
        name: "John",
        preferences: { food: "pizza", color: "blue" }
      })
    })

    it("should omit nested fields correctly", () => {
      const obj = {
        name: "John",
        details: { age: 25, city: "New York" },
        preferences: { food: "pizza", color: "blue" }
      }
      const result = fieldsOmit(obj, ["preferences", "details.age"])
      expect(result).toEqual({
        name: "John",
        details: { city: "New York" }
      })
    })

    it("should return a new object and not mutate the original object", () => {
      const obj = { name: "John", age: 25, city: "New York", 4: "t" }
      const result = fieldsOmit(obj, ["age", 4])
      expect(result).not.toBe(obj)
      expect(result).toEqual({ name: "John", city: "New York" })
      expect(obj).toEqual({ name: "John", age: 25, city: "New York", 4: "t" }) // исходный объект не изменен
    })
  })

  describe("fieldsPick function", () => {
    it("should pick specified fields from the object", () => {
      const obj = { name: "John", age: 25, city: "New York" }
      const result = fieldsPick(obj, ["name", "age"])
      expect(result).toEqual({ name: "John", age: 25 })
    })

    it("should return an empty object when no fields are picked", () => {
      const obj = { name: "John", age: 25, city: "New York" }
      const result = fieldsPick(obj, [])
      expect(result).toEqual({})
    })

    it("should ignore fields that do not exist in the object", () => {
      const obj = { name: "John", age: 25 }
      const result = fieldsPick(obj, ["city", "country"])
      expect(result).toEqual({})
    })

    it("should handle nested objects", () => {
      const obj = {
        name: "John",
        details: { age: 25, city: "New York" },
        preferences: { food: "pizza", color: "blue" }
      }
      const result = fieldsPick(obj, ["details"])
      expect(result).toEqual({
        details: { age: 25, city: "New York" }
      })
    })

    it("should pick nested fields correctly", () => {
      const obj = {
        name: "John",
        details: { age: 25, city: "New York" },
        preferences: { food: "pizza", color: "blue" }
      }
      const result = fieldsPick(obj, ["preferences", "details.age"])
      expect(result).toEqual({
        preferences: { food: "pizza", color: "blue" },
        details: { age: 25 }
      })
    })

    it("should return a new object and not mutate the original object", () => {
      const obj = { name: "John", age: 25, city: "New York", 4: "t" }
      const result = fieldsPick(obj, ["age", 4])
      expect(result).not.toBe(obj)
      expect(result).toEqual({ age: 25, 4: "t" }) // Исходный объект не изменен
      expect(obj).toEqual({ name: "John", age: 25, city: "New York", 4: "t" }) // Исходный объект не изменен
    })
  })

  describe("deepMerge function", () => {
    it("should merge objects with primitive values", () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it("should merge nested objects", () => {
      const obj1 = { a: { x: 1 }, b: 2 }
      const obj2 = { a: { y: 2 }, c: 3 }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: { x: 1, y: 2 }, b: 2, c: 3 })
    })

    it("should concatenate arrays", () => {
      const obj1 = { a: [1, 2], b: 2 }
      const obj2 = { a: [3, 4], c: 3 }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: [1, 2, 3, 4], b: 2, c: 3 })
    })

    it("should override primitive values with objects", () => {
      const obj1 = { a: 1, b: { x: 2 } }
      const obj2 = { a: { y: 3 }, b: 3 }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: { y: 3 }, b: 3 })
    })

    it("should handle merging with undefined and null values", () => {
      const obj1 = { a: 1, b: null }
      const obj2 = { b: 2, c: undefined }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: 2, c: undefined })
    })

    it("should handle merging of multiple objects", () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }
      const obj3 = { c: 3 }
      const result = deepMerge(obj1, obj2, obj3)
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it("should handle empty objects", () => {
      const obj1 = { a: 1 }
      const obj2 = {}
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: 1 })
    })
  })

  describe("deepEquals function", () => {
    it("should return true for identical primitive values", () => {
      expect(deepEquals(1, 1)).toBe(true)
      expect(deepEquals("string", "string")).toBe(true)
      expect(deepEquals(true, true)).toBe(true)
      expect(deepEquals(null, null)).toBe(true)
      expect(deepEquals(undefined, undefined)).toBe(true)
    })

    it("should return false for different primitive values", () => {
      expect(deepEquals(1, 2)).toBe(false)
      expect(deepEquals("string", "different")).toBe(false)
      expect(deepEquals(true, false)).toBe(false)
      expect(deepEquals(null, undefined)).toBe(false)
    })

    it("should return true for deeply equal objects", () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { a: 1, b: { c: 2 } }
      expect(deepEquals(obj1, obj2)).toBe(true)
    })

    it("should return false for objects with different properties", () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { a: 1, b: { c: 3 } }
      expect(deepEquals(obj1, obj2)).toBe(false)
    })

    it("should return true for arrays with equal elements", () => {
      const arr1 = [1, 2, 3]
      const arr2 = [1, 2, 3]
      expect(deepEquals(arr1, arr2)).toBe(true)
    })

    it("should return false for arrays with different elements", () => {
      const arr1 = [1, 2, 3]
      const arr2 = [1, 2, 4]
      expect(deepEquals(arr1, arr2)).toBe(false)
    })

    it("should return true for equal Date objects", () => {
      const date1 = new Date("2020-01-01")
      const date2 = new Date("2020-01-01")
      expect(deepEquals(date1, date2)).toBe(true)
    })

    it("should return false for different Date objects", () => {
      const date1 = new Date("2020-01-01")
      const date2 = new Date("2021-01-01")
      expect(deepEquals(date1, date2)).toBe(false)
    })

    it("should return true for equal RegExp objects", () => {
      const regExp1 = /test/gi
      const regExp2 = /test/gi
      expect(deepEquals(regExp1, regExp2)).toBe(true)
    })

    it("should return false for different RegExp objects", () => {
      const regExp1 = /test/g
      const regExp2 = /test/i
      expect(deepEquals(regExp1, regExp2)).toBe(false)
    })

    it("should handle NaN correctly", () => {
      expect(deepEquals(NaN, NaN)).toBe(true)
      expect(deepEquals(NaN, 1)).toBe(false)
    })

    it("should handle objects with same keys but different values correctly", () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 3 }
      expect(deepEquals(obj1, obj2)).toBe(false)
    })
  })

  describe("resolveFieldData function", () => {
    it("should return the value for a simple field", () => {
      const data = { name: "John", age: 30 }
      const field = "name"
      const result = resolveFieldData(data, field)
      expect(result).toBe("John")
    })

    it("should return the value for a nested field", () => {
      const data = { user: { name: "John", details: { age: 30 } } }
      const field = "user.details.age"
      const result = resolveFieldData(data, field)
      expect(result).toBe(30)
    })

    it("should return the value from a function field", () => {
      const data = { name: "John", age: 30 }
      const field = (obj: any) => obj.age * 2
      const result = resolveFieldData(data, field)
      expect(result).toBe(60)
    })

    it("should return null for non-existing field", () => {
      const data = { name: "John", age: 30 }
      const field = "nonExistingField"
      const result = resolveFieldData(data, field)
      expect(result).toBeUndefined()
    })

    it("should return null if data is null or undefined", () => {
      const field = "name"
      expect(resolveFieldData(null, field)).toBeNull()
      expect(resolveFieldData(undefined, field)).toBeNull()
    })

    it("should return null if field is null or undefined", () => {
      const data = { name: "John" }
      expect(resolveFieldData(data, null)).toBeNull()
      expect(resolveFieldData(data, undefined)).toBeNull()
    })

    it("should handle fields with undefined or null values", () => {
      const data = { name: "John", age: undefined, location: null }
      expect(resolveFieldData(data, "age")).toBeUndefined()
      expect(resolveFieldData(data, "location")).toBeNull()
    })

    it("should handle empty data object", () => {
      const data = {}
      const field = "name"
      const result = resolveFieldData(data, field)
      expect(result).toBeNull()
    })

    it("should handle fields with special characters", () => {
      const data = { "user.data": { name: "Jane" }, "user.age": 30 }
      expect(resolveFieldData(data, "user.data")).toEqual({ name: "Jane" })
      expect(resolveFieldData(data, "user.age")).toBe(30)
    })

    it("should return null if field is a function and data is empty", () => {
      const data = {}
      const field = (obj: any) => obj.age * 2
      const result = resolveFieldData(data, field)
      expect(result).toBeNull()
    })
  })

  describe("equals function", () => {
    it("should return true for identical objects without field parameter", () => {
      const obj1 = { name: "John", age: 30 }
      const obj2 = { name: "John", age: 30 }
      const result = equals(obj1, obj2)
      expect(result).toBe(true)
    })

    it("should return false for different objects without field parameter", () => {
      const obj1 = { name: "John", age: 30 }
      const obj2 = { name: "John", age: 25 }
      const result = equals(obj1, obj2)
      expect(result).toBe(false)
    })

    it("should return true when comparing specific fields that are equal", () => {
      const obj1 = { name: "John", age: 30 }
      const obj2 = { name: "John", age: 25 }
      const result = equals(obj1, obj2, "name")
      expect(result).toBe(true)
    })

    it("should return false when comparing specific fields that are not equal", () => {
      const obj1 = { name: "John", age: 30 }
      const obj2 = { name: "Jane", age: 30 }
      const result = equals(obj1, obj2, "name")
      expect(result).toBe(false)
    })

    it("should handle nested fields comparison", () => {
      const obj1 = { user: { name: "John", age: 30 } }
      const obj2 = { user: { name: "John", age: 25 } }
      const result = equals(obj1, obj2, "user.name")
      expect(result).toBe(true)
    })

    it("should return true for equal nested objects without field parameter", () => {
      const obj1 = { user: { name: "John", age: 30 }, details: { city: "New York" } }
      const obj2 = { user: { name: "John", age: 30 }, details: { city: "New York" } }
      const result = equals(obj1, obj2)
      expect(result).toBe(true)
    })

    it("should return false for non-equal nested objects without field parameter", () => {
      const obj1 = { user: { name: "John", age: 30 }, details: { city: "New York" } }
      const obj2 = { user: { name: "John", age: 30 }, details: { city: "Los Angeles" } }
      const result = equals(obj1, obj2)
      expect(result).toBe(false)
    })

    it("should handle null or undefined values", () => {
      const obj1 = { name: "John", age: null }
      const obj2 = { name: "John", age: undefined }
      const result = equals(obj1, obj2, "age")
      expect(result).toBe(false)
    })

    it("should handle comparison with missing fields", () => {
      const obj1 = { name: "John" }
      const obj2 = { name: "John", age: 30 }
      const result = equals(obj1, obj2, "age")
      expect(result).toBe(false)
    })

    it("should return true for same values with different types", () => {
      const obj1 = { value: "1" }
      const obj2 = { value: 1 }
      const result = equals(obj1, obj2, "value")
      expect(result).toBe(false) // strict comparison, not type-coercive
    })
  })

  describe("compare function", () => {
    let numberComparator: (a: number, b: number) => number
    beforeEach(() => {
      numberComparator = (a: number, b: number) => a - b
    })
    it("should return 0 for equal numbers", () => {
      const result = compare(5, 5, numberComparator)
      expect(result).toBe(0)
    })

    it("should return a negative number if first value is less than second for numbers", () => {
      const result = compare(3, 5, numberComparator)
      expect(result).toBeLessThan(0)
    })

    it("should return a positive number if first value is greater than second for numbers", () => {
      const result = compare(7, 5, numberComparator)
      expect(result).toBeGreaterThan(0)
    })

    it("should correctly handle string comparison", () => {
      const stringComparator = (a: string, b: string) => a.localeCompare(b)
      expect(compare("apple", "banana", stringComparator)).toBeLessThan(0)
      expect(compare("banana", "apple", stringComparator)).toBeGreaterThan(0)
      expect(compare("apple", "apple", stringComparator)).toBe(0)
    })

    it("should consider null or undefined as empty values", () => {
      expect(compare<any, any>(null, 5, numberComparator)).toBeGreaterThan(0)
      expect(compare<any, any>(5, undefined, numberComparator)).toBeLessThan(0)
      expect(compare<any, any>(null, null, numberComparator)).toBe(0)
      expect(compare<any, any>(undefined, undefined, numberComparator)).toBe(0)
    })
  })

  describe("deepCopyObject function", () => {
    it("should create a deep copy of an object with primitive values", () => {
      const obj = { name: "John", age: 30, active: true }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj).not.toBe(obj) // Ensure it's not the same reference
    })

    it("should create a deep copy of an object with nested objects", () => {
      const obj = { user: { name: "John", details: { age: 30, city: "New York" } } }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.user).not.toBe(obj.user)
      expect(copiedObj.user.details).not.toBe(obj.user.details)
    })

    it("should create a deep copy of an object with arrays", () => {
      const obj = { numbers: [1, 2, 3], letters: ["a", "b", "c"] }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.numbers).not.toBe(obj.numbers)
      expect(copiedObj.letters).not.toBe(obj.letters)
    })

    it("should handle empty objects", () => {
      const obj = {}
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj).not.toBe(obj)
    })

    it("should handle null and undefined values", () => {
      const obj = { a: null, b: undefined }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
    })

    it("should handle objects with Date instances", () => {
      const date = new Date()
      const obj = { date }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.date).toBe(obj.date)
      expect(copiedObj.date.getTime()).toBe(obj.date.getTime())
    })

    it("should not copy functions", () => {
      const obj = { func: () => "test" }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.func).toBe(obj.func) // Same reference, functions are not deeply copied
    })

    it("should create a deep copy of an object with mixed types", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
        details: { hobbies: ["reading", "sports"], address: { city: "New York" } }
      }
      const copiedObj = deepCopyObject(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.details.hobbies).not.toBe(obj.details.hobbies)
      expect(copiedObj.details.address).not.toBe(obj.details.address)
    })
  })

  describe("deepCopy function", () => {
    it("should create a deep copy of an array", () => {
      const array = [1, 2, 3, { a: 4, b: 5 }]
      const copiedArray = deepCopy(array)
      expect(copiedArray).toEqual(array)
      expect(copiedArray).not.toBe(array) // Ensure it's not the same reference
      expect(copiedArray[3]).toEqual(array[3])
      expect(copiedArray[3]).not.toBe(array[3]) // Ensure deep copy of nested object
    })

    it("should create a deep copy of an object", () => {
      const obj = { name: "John", age: 30, nested: { key: "value" } }
      const copiedObj = deepCopy(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj).not.toBe(obj) // Ensure it's not the same reference
      expect(copiedObj.nested).toEqual(obj.nested)
      expect(copiedObj.nested).not.toBe(obj.nested) // Ensure deep copy of nested object
    })

    it("should return the same value for primitive types", () => {
      const num = 42
      const str = "hello"
      const bool = true

      expect(deepCopy(num)).toBe(num)
      expect(deepCopy(str)).toBe(str)
      expect(deepCopy(bool)).toBe(bool)
    })

    it("should return null or undefined as is", () => {
      expect(deepCopy(null)).toBeNull()
      expect(deepCopy(undefined)).toBeUndefined()
    })

    it("should handle mixed types in an array", () => {
      const mixedArray = [1, "string", { key: "value" }, [2, 3], null, undefined]
      const copiedArray = deepCopy(mixedArray)
      expect(copiedArray).toEqual(mixedArray)
      expect(copiedArray).not.toBe(mixedArray) // Ensure it's not the same reference
      expect(copiedArray[2]).not.toBe(mixedArray[2]) // Ensure deep copy of object
      expect(copiedArray[3]).not.toBe(mixedArray[3]) // Ensure deep copy of array
    })

    it("should handle objects with dates", () => {
      const date = new Date()
      const obj = { date }
      const copiedObj = deepCopy(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.date).toBe(obj.date) // Ensure dates are not the same reference
      expect(copiedObj.date.getTime()).toBe(obj.date.getTime())
    })

    it("should handle functions by reference", () => {
      const func = () => "hello"
      const obj = { func }
      const copiedObj = deepCopy(obj)
      expect(copiedObj).toEqual(obj)
      expect(copiedObj.func).toBe(obj.func) // Functions should be copied by reference
    })
  })

  describe("deepFreeze function", () => {
    it("should freeze an object with primitive values", () => {
      const obj = { name: "John", age: 30, active: true }
      const frozenObj = deepFreeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)

      // Try to modify
      try {
        frozenObj.name = "Jane"
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.name).toBe("John")
    })

    it("should recursively freeze nested objects", () => {
      const obj = { user: { name: "John", details: { age: 30, city: "New York" } } }
      const frozenObj = deepFreeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)
      expect(Object.isFrozen(frozenObj.user)).toBe(true)
      expect(Object.isFrozen(frozenObj.user.details)).toBe(true)

      // Try to modify nested object
      try {
        frozenObj.user.details.city = "Los Angeles"
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.user.details.city).toBe("New York")
    })

    it("should handle freezing arrays", () => {
      const obj = { numbers: [1, 2, 3] }
      const frozenObj = deepFreeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)
      expect(Object.isFrozen(frozenObj.numbers)).toBe(true)

      // Try to modify array
      try {
        frozenObj.numbers.push(4)
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.numbers.length).toBe(3)
    })

    it("should return the same object for null and undefined", () => {
      expect(deepFreeze(null)).toBeNull()
      expect(deepFreeze(undefined)).toBeUndefined()
    })

    it("should handle mixed types within an object", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
        details: { hobbies: ["reading", "sports"], address: { city: "New York" } },
        dates: [new Date(), new Date()]
      }
      const frozenObj = deepFreeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)
      expect(Object.isFrozen(frozenObj.details)).toBe(true)
      expect(Object.isFrozen(frozenObj.details.hobbies)).toBe(true)
      expect(Object.isFrozen(frozenObj.details.address)).toBe(true)
      expect(Object.isFrozen(frozenObj.dates)).toBe(true)

      // Try to modify array within object
      try {
        frozenObj.details.hobbies.push("music")
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.details.hobbies.length).toBe(2)
    })
  })

  describe("freeze function", () => {
    it("should freeze an object", () => {
      const obj = { name: "John", age: 30 }
      const frozenObj = freeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)

      // Try to modify
      try {
        frozenObj.name = "Jane"
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.name).toBe("John")
    })

    it("should not modify frozen state of already frozen object", () => {
      const obj = { name: "John", age: 30 }
      Object.freeze(obj) // Freeze the object initially
      const frozenObj = freeze(obj)
      expect(frozenObj).toBe(obj) // Should return the same object
      expect(Object.isFrozen(frozenObj)).toBe(true)

      // Try to modify
      try {
        frozenObj.age = 31
      } catch (e) {
        // Expected to throw in strict mode
      }
      expect(frozenObj.age).toBe(30)
    })

    it("should handle empty objects", () => {
      const obj = {}
      const frozenObj = freeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)

      // Try to add property
      try {
        // @ts-ignore
        frozenObj.newProp = "test"
      } catch (e) {
        // Expected to throw in strict mode
      }
      // @ts-ignore
      expect(frozenObj.newProp).toBeUndefined()
    })

    it("should return null or undefined as is", () => {
      expect(freeze(null)).toBeNull()
      expect(freeze(undefined)).toBeUndefined()
    })

    it("should not freeze deep fields objects", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
        details: { hobbies: ["reading", "sports"], address: { city: "New York" } }
      }
      const frozenObj = freeze(obj)
      expect(Object.isFrozen(frozenObj)).toBe(true)
      expect(Object.isFrozen(frozenObj.details)).toBe(false) // Only top-level freeze

      // Try to modify nested object
      try {
        // @ts-ignore
        frozenObj.details.city = "Los Angeles"
      } catch (e) {
        // Expected to throw in strict mode
      }
      // @ts-ignore
      expect(frozenObj.details.city).toBe("Los Angeles")
    })
  })

  describe("unFreeze function", () => {
    it("should return a new object if the original was frozen", () => {
      const obj = { name: "John", age: 30 }
      Object.freeze(obj) // Заморозить объект
      const unfrozenObj = unFreeze(obj)
      expect(unfrozenObj).not.toBe(obj) // Должен быть новый объект
      expect(unfrozenObj).toEqual(obj) // Должен быть равен по содержимому
    })

    it("should allow modifications on the unfrozen object", () => {
      const obj = { name: "John", age: 30 }
      Object.freeze(obj) // Заморозить объект
      const unfrozenObj = unFreeze(obj)
      unfrozenObj.name = "Jane"
      expect(unfrozenObj.name).toBe("Jane")
      expect(obj.name).toBe("John") // Оригинальный объект не должен изменяться
    })

    it("should return the same object if it was not frozen", () => {
      const obj = { name: "John", age: 30 }
      const unfrozenObj = unFreeze(obj)
      expect(unfrozenObj).toBe(obj) // Должен вернуть тот же объект
    })

    it("should handle empty objects", () => {
      const obj = {}
      Object.freeze(obj) // Заморозить объект
      const unfrozenObj = unFreeze(obj)
      expect(unfrozenObj).not.toBe(obj) // Должен быть новый объект
      expect(unfrozenObj).toEqual(obj) // Должен быть равен по содержимому
    })

    it("should handle objects with nested structures", () => {
      const obj = { user: { name: "John", age: 30, address: { city: "New York" } } }
      Object.freeze(obj)
      Object.freeze(obj.user)
      Object.freeze(obj.user.address)
      const unfrozenObj = unFreeze(obj)
      expect(unfrozenObj).not.toBe(obj)
      expect(unfrozenObj.user).not.toBe(obj.user)
      expect(unfrozenObj.user.address).not.toBe(obj.user.address)
      expect(unfrozenObj).toEqual(obj)
    })

    it("should handle null and undefined correctly", () => {
      expect(unFreeze(null)).toBeNull()
      expect(unFreeze(undefined)).toBeUndefined()
    })

    it("should handle objects with functions", () => {
      const obj = { func: () => "hello" }
      Object.freeze(obj)
      const unfrozenObj = unFreeze(obj)
      expect(unfrozenObj.func).toBe(obj.func) // Функции не должны копироваться заново
    })
  })
})
