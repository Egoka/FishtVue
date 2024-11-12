import { describe, it, expect } from "vitest"
import {
  isArray,
  contains,
  nestedKeys,
  sort,
  filter,
  reorderArray,
  findLast,
  findLastIndex,
  findIndexInList,
  insertIntoOrderedArray,
  deepCopyArray
} from "fishtvue/utils/arrayHandler"

describe("Testing array handler", () => {
  describe("isArray function", () => {
    it("should return true for non-empty arrays by default", () => {
      expect(isArray([1, 2, 3])).toBe(true)
      expect(isArray(["a", "b", "c"])).toBe(true)
    })

    it('should return true for empty arrays when "empty" is true', () => {
      expect(isArray([], true)).toBe(true)
    })

    it('should return false for empty arrays when "empty" is false', () => {
      expect(isArray([], false)).toBe(false)
    })

    it("should return false for non-array values", () => {
      expect(isArray("string")).toBe(false)
      expect(isArray(123)).toBe(false)
      expect(isArray({ key: "value" })).toBe(false)
      expect(isArray(null)).toBe(false)
      expect(isArray(undefined)).toBe(false)
    })

    it('should return true for arrays when "empty" parameter is not provided and array is non-empty', () => {
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('should return false for arrays with non-zero length when "empty" is set to false', () => {
      expect(isArray([1], false)).toBe(true)
    })

    it('should return true for arrays with zero length when "empty" is set to true', () => {
      expect(isArray([], true)).toBe(true)
    })

    it("should work correctly with mixed data types in the array", () => {
      expect(isArray([1, "string", null, undefined, {}])).toBe(true)
    })
  })

  describe("contains function", () => {
    it("should return true if value is present in the list", () => {
      const list = [1, 2, 3, 4, 5]
      const value = 3
      expect(contains(value, list)).toBe(true)
    })

    it("should return false if value is not present in the list", () => {
      const list = [1, 2, 3, 4, 5]
      const value = 6
      expect(contains(value, list)).toBe(false)
    })

    it("should return false if list is empty", () => {
      const list: number[] = []
      const value = 1
      expect(contains(value, list)).toBe(false)
    })

    it("should return false if list is null", () => {
      const list = null
      const value = 1
      expect(contains<number>(value, list as any)).toBe(false)
    })

    it("should return false if list is undefined", () => {
      const list: number[] | undefined = undefined
      const value = 1
      expect(contains(value, list as any)).toBe(false)
    })

    it("should correctly handle lists with different data types", () => {
      const list = [1, "2", true, null, undefined, {}, []]
      expect(contains("2", list)).toBe(true)
      expect(contains(true, list)).toBe(true)
      expect(contains({}, list)).toBe(true)
      expect(contains([], list)).toBe(true)
    })
  })

  describe("nestedKeys function", () => {
    it("should return an array of nested keys for a simple object", () => {
      const obj = {
        key1: "value1",
        key2: "value2"
      }
      const keys = nestedKeys(obj)
      expect(keys).toEqual(["key1", "key2"])
    })

    it("should return an array of nested keys for a nested object", () => {
      const obj = {
        key1: {
          nestedKey1: "value1",
          nestedKey2: "value2"
        },
        key2: {
          nestedKey3: "value3",
          nestedKey4: "value4"
        }
      }
      const keys = nestedKeys(obj)
      expect(keys).toEqual(["key1.nestedKey1", "key1.nestedKey2", "key2.nestedKey3", "key2.nestedKey4"])
    })

    it("should return an empty array for an empty object", () => {
      const obj = {}
      const keys = nestedKeys(obj)
      expect(keys).toEqual([])
    })

    it("should handle objects with mixed data types correctly", () => {
      const obj = {
        key1: {
          nestedKey1: "value1",
          nestedKey2: 123
        },
        key2: {
          nestedKey3: true,
          nestedKey4: null
        },
        key3: "simpleValue"
      }
      const keys = nestedKeys(obj)
      expect(keys).toEqual(["key1.nestedKey1", "key1.nestedKey2", "key2.nestedKey3", "key2.nestedKey4", "key3"])
    })

    it("should correctly use parentKey parameter", () => {
      const obj = {
        nestedKey1: "value1",
        nestedKey2: "value2"
      }
      const parentKey = "parent"
      const keys = nestedKeys(obj, parentKey)
      expect(keys).toEqual(["parent.nestedKey1", "parent.nestedKey2"])
    })

    it("should work correctly with arrays as values", () => {
      const obj = {
        key1: ["value1", "value2"],
        key2: {
          nestedKey1: "value3",
          nestedKey2: ["value4", "value5"]
        }
      }
      const keys = nestedKeys(obj)
      expect(keys).toEqual(["key1", "key2.nestedKey1", "key2.nestedKey2"])
    })
  })

  describe("sort function", () => {
    it("should sort values in ascending order using default order", () => {
      const value1 = 3
      const value2 = 5
      const comparator = (a: number, b: number) => a - b
      expect(sort(value1, value2, 1, comparator)).toBeLessThan(0)
      expect(sort(value2, value1, 1, comparator)).toBeGreaterThan(0)
    })

    it("should sort values in descending order when order is -1", () => {
      const value1 = 3
      const value2 = 5
      const comparator = (a: number, b: number) => a - b
      expect(sort(value1, value2, -1, comparator)).toBeGreaterThan(0)
      expect(sort(value2, value1, -1, comparator)).toBeLessThan(0)
    })

    it("should handle null or empty values with default nullSortOrder", () => {
      const value1 = null
      const value2 = 5
      const comparator = (a: number, b: number) => a - b
      expect(sort(value1, value2, 1, comparator)).toBe(1) // null comes after non-null
      expect(sort(value2, value1, 1, comparator)).toBe(-1) // non-null comes before null
    })

    it("should handle null or empty values with custom nullSortOrder", () => {
      const value1 = null
      const value2 = 5
      const comparator = (a: number, b: number) => a - b
      expect(sort(value1, value2, 1, comparator, -1)).toBe(-1) // null comes before non-null
      expect(sort(value2, value1, 1, comparator, -1)).toBe(1) // non-null comes after null
    })

    it("should return 0 when values are equal", () => {
      const value1 = 5
      const value2 = 5
      const comparator = (a: number, b: number) => a - b
      expect(sort(value1, value2, 1, comparator)).toBe(0)
    })

    it("should sort string values correctly", () => {
      const value1 = "apple"
      const value2 = "banana"
      const comparator = (a: string, b: string) => a.localeCompare(b)
      expect(sort(value1, value2, 1, comparator)).toBeLessThan(0)
      expect(sort(value2, value1, 1, comparator)).toBeGreaterThan(0)
    })
  })

  describe("filter function", () => {
    type T = { name: string; age: number }
    it("should filter items based on a single field match", () => {
      const value: T[] = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
        { name: "Bob", age: 35 }
      ]
      const fields: (keyof T)[] = ["name"]
      const filterValue = "Jo"
      const result = filter(value, fields, filterValue)
      expect(result).toEqual([{ name: "John", age: 25 }])
    })

    it("should filter items based on multiple fields", () => {
      const value = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
        { name: "Bob", age: 35 },
        { name: "Joanne", age: 40 }
      ]
      const fields: (keyof T)[] = ["name", "age"]
      const filterValue = "Jo"
      const result = filter(value, fields, filterValue)
      expect(result).toEqual([
        { name: "John", age: 25 },
        { name: "Joanne", age: 40 }
      ])
    })

    it("should return an empty array when no items match", () => {
      const value = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
        { name: "Bob", age: 35 }
      ]
      const fields: (keyof T)[] = ["name"]
      const filterValue = "Mike"
      const result = filter(value, fields, filterValue)
      expect(result).toEqual([])
    })

    it("should be case insensitive when filtering", () => {
      const value = [
        { name: "John", age: 25 },
        { name: "jane", age: 30 },
        { name: "Bob", age: 35 }
      ]
      const fields: (keyof T)[] = ["name"]
      const filterValue = "JANE"
      const result = filter(value, fields, filterValue)
      expect(result).toEqual([{ name: "jane", age: 30 }])
    })

    it("should handle empty filterValue and return original array", () => {
      const value = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
        { name: "Bob", age: 35 }
      ]
      const fields: (keyof T)[] = ["name"]
      const filterValue = ""
      const result = filter(value, fields, filterValue)
      expect(result).toEqual(value)
    })

    it("should handle empty array and return empty array", () => {
      const value: any[] = []
      const fields = ["name"]
      const filterValue = "Jo"
      const result = filter(value, fields, filterValue)
      expect(result).toEqual([])
    })

    it("should handle missing fields gracefully", () => {
      const value = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 }
      ]
      const fields = ["nonExistentField"]
      const filterValue = "someValue"
      const result = filter(value, fields as (keyof T)[], filterValue)
      expect(result).toEqual([])
    })
  })

  describe("reorderArray function", () => {
    it("should move element from index 2 to index 4", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 2, 4)
      expect(array).toEqual([1, 2, 4, 5, 3])
    })

    it("should move element from index 0 to index 3", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 0, 3)
      expect(array).toEqual([2, 3, 4, 1, 5])
    })

    it("should handle indices that are equal (no change)", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 2, 2)
      expect(array).toEqual([1, 2, 3, 4, 5])
    })

    it("should handle `from` index greater than array length (wrap around)", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 7, 1) // 7 % 5 = 2
      expect(array).toEqual([1, 3, 2, 4, 5])
    })

    it("should handle `to` index greater than array length (wrap around)", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 1, 6) // 6 % 5 = 1
      expect(array).toEqual([1, 2, 3, 4, 5]) // no change, as from and to are effectively the same
    })

    it("should handle moving element to the beginning of the array", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 4, 0)
      expect(array).toEqual([5, 1, 2, 3, 4])
    })

    it("should handle moving element to the end of the array", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, 0, 5) // 5 is beyond the last index
      expect(array).toEqual([1, 2, 3, 4, 5])
    })

    it("should not modify the array if `from` or `to` are negative or invalid", () => {
      const array = [1, 2, 3, 4, 5]
      reorderArray(array, -1, 2) // invalid `from`
      expect(array).toEqual([1, 2, 5, 3, 4])

      reorderArray(array, 2, -1) // invalid `to`
      expect(array).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe("findLast function", () => {
    it("should return the last element that satisfies the condition", () => {
      const array = [1, 2, 3, 4, 5]
      const result = findLast<number>(array, (value) => value % 2 === 0)
      expect(result).toBe(4)
    })

    it("should return undefined if no element satisfies the condition", () => {
      const array = [1, 3, 5]
      const result = findLast(array, (value) => value % 2 === 0)
      expect(result).toBeUndefined()
    })

    it("should handle arrays with multiple elements satisfying the condition", () => {
      const array = [1, 2, 3, 4, 6]
      const result = findLast(array, (value) => value % 2 === 0)
      expect(result).toBe(6)
    })

    it("should return the last element if all elements satisfy the condition", () => {
      const array = [1, 2, 3, 4, 5]
      const result = findLast(array, () => true)
      expect(result).toBe(5)
    })

    it("should return undefined for an empty array", () => {
      const array: number[] = []
      const result = findLast(array, (value) => value % 2 === 0)
      expect(result).toBeUndefined()
    })

    it("should handle arrays with mixed data types", () => {
      const array = [1, "2", true, null, undefined, 5]
      const result = findLast(array, (value) => typeof value === "number")
      expect(result).toBe(5)
    })
    it("should use fallback method if Array.prototype.findLast is not available", () => {
      const array = [1, 2, 3, 4, 5]
      // Переопределяем findLast для теста
      const originalFindLast = Array.prototype.findLast
      // @ts-ignore
      Array.prototype.findLast = undefined

      // @ts-ignore
      const result = findLast(array, (value) => value % 2 === 0)

      // Восстанавливаем findLast
      Array.prototype.findLast = originalFindLast

      expect(result).toBe(4) // Последний четный элемент
    })

    it("should handle errors in findLast gracefully and use fallback", () => {
      const array = [1, 2, 3, 4, 5]
      const callback = (value: number) => value % 2 === 0 // ищем последнее четное число

      // Принудительно выбрасываем ошибку при вызове findLast
      const originalFindLast = Array.prototype.findLast
      Array.prototype.findLast = function () {
        throw new Error("Simulated error")
      }

      // @ts-ignore
      const result = findLast(array, callback)

      // Восстанавливаем findLast
      Array.prototype.findLast = originalFindLast

      expect(result).toBe(4) // Последний четный элемент
    })
  })

  describe("findLastIndex function", () => {
    it("should return the index of the last element that satisfies the condition", () => {
      const array = [1, 2, 3, 4, 5]
      const callback = (value: number) => value % 2 === 0 // ищем последнее четное число
      const result = findLastIndex(array, callback)
      expect(result).toBe(3)
    })

    it("should return -1 if no element satisfies the condition", () => {
      const array = [1, 3, 5]
      const callback = (value: number) => value % 2 === 0 // нет четных чисел
      const result = findLastIndex(array, callback)
      expect(result).toBe(-1)
    })

    it("should handle arrays with multiple elements satisfying the condition", () => {
      const array = [1, 2, 3, 4, 6]
      const callback = (value: number) => value % 2 === 0 // несколько четных чисел
      const result = findLastIndex(array, callback)
      expect(result).toBe(4)
    })

    it("should return -1 for an empty array", () => {
      const array: number[] = []
      const callback = (value: number) => value % 2 === 0
      const result = findLastIndex(array, callback)
      expect(result).toBe(-1)
    })

    it("should handle arrays with mixed data types", () => {
      const array = [1, "2", true, null, undefined, 5]
      const callback = (value: any) => typeof value === "number"
      const result = findLastIndex(array, callback)
      expect(result).toBe(5)
    })

    it("should return the last index of matching elements even if there are duplicates", () => {
      const array = [1, 2, 3, 2, 5]
      const callback = (value: number) => value === 2
      const result = findLastIndex(array, callback)
      expect(result).toBe(3)
    })
    it("should use fallback method if Array.prototype.findLastIndex is not available", () => {
      const array = [1, 2, 3, 4, 5]
      const callback = (value: number) => value % 2 === 0 // ищем последнее четное число

      // Переопределяем findLastIndex для теста
      const originalFindLastIndex = Array.prototype.findLastIndex
      // @ts-ignore
      Array.prototype.findLastIndex = undefined
      // @ts-ignore
      const result = findLastIndex(array, callback)

      // Восстанавливаем findLastIndex
      Array.prototype.findLastIndex = originalFindLastIndex

      expect(result).toBe(3) // Последний четный элемент на позиции 3
    })

    it("should handle errors in findLastIndex gracefully and use fallback", () => {
      const array = [1, 2, 3, 4, 5]
      const callback = (value: number) => value % 2 === 0 // ищем последнее четное число

      // Принудительно выбрасываем ошибку при вызове findLastIndex
      const originalFindLastIndex = Array.prototype.findLastIndex
      Array.prototype.findLastIndex = function (): number {
        throw new Error("Simulated error")
      }
      // @ts-ignore
      const result = findLastIndex(array, callback)

      // Восстанавливаем findLastIndex
      Array.prototype.findLastIndex = originalFindLastIndex

      expect(result).toBe(3) // Последний четный элемент на позиции 3
    })
  })

  describe("findIndexInList function", () => {
    it("should return the index of the first occurrence of the value", () => {
      const array = [1, 2, 3, 4, 5]
      const value = 3
      const result = findIndexInList(value, array)
      expect(result).toBe(2)
    })

    it("should return -1 if the value is not found in the array", () => {
      const array = [1, 2, 3, 4, 5]
      const value = 6
      const result = findIndexInList(value, array)
      expect(result).toBe(-1)
    })

    it("should return -1 if the array is empty", () => {
      const array: number[] = []
      const value = 1
      const result = findIndexInList(value, array)
      expect(result).toBe(-1)
    })

    it("should handle arrays with multiple occurrences of the value", () => {
      const array = [1, 2, 3, 2, 4, 2]
      const value = 2
      const result = findIndexInList(value, array)
      expect(result).toBe(1) // Index of the first occurrence of 2
    })

    it("should return -1 if the list parameter is null or undefined", () => {
      const value = 1
      expect(findIndexInList(value, null as unknown as number[])).toBe(-1)
      expect(findIndexInList(value, undefined as unknown as number[])).toBe(-1)
    })

    it("should correctly handle non-primitive values (objects)", () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const value = { id: 2 }
      const result = findIndexInList(value, array)
      expect(result).toBe(-1) // Because {} !== {}
    })

    it("should correctly find the index when the array contains mixed data types", () => {
      const array = [1, "2", true, { key: "value" }, null]
      const value = "2"
      const result = findIndexInList(value, array)
      expect(result).toBe(1)
    })
  })

  describe("insertIntoOrderedArray function", () => {
    it("should insert item at the correct position based on the index", () => {
      const array = [1, 3, 5, 7]
      const item = 4
      const index = 2 // Значение 4 должно быть вставлено после 3 и перед 5
      insertIntoOrderedArray(item, index, array, array)
      expect(array).toEqual([1, 3, 4, 5, 7])
    })

    it("should insert item at the beginning of the array", () => {
      const array = [3, 5, 7]
      const item = 1
      const index = 0
      insertIntoOrderedArray(item, index, array, array)
      expect(array).toEqual([1, 3, 5, 7])
    })

    it("should insert item at the end of the array if index is greater than all elements", () => {
      const array = [1, 3, 5]
      const item = 7
      const index = 4 // Индекс больше, чем любой элемент в массиве
      insertIntoOrderedArray(item, index, array, array)
      expect(array).toEqual([1, 3, 5, 7])
    })

    it("should handle insertion into an empty array", () => {
      const array: number[] = []
      const item = 1
      const index = 0
      insertIntoOrderedArray(item, index, array, array)
      expect(array).toEqual([1])
    })

    it("should insert item at the correct position even if sourceArr is different", () => {
      const array = [2, 4, 6]
      const item = 5
      const index = 4 // Исходный массив: [1, 2, 3, 4, 5, 6]
      const sourceArr = [1, 2, 3, 4, 5, 6]
      insertIntoOrderedArray(item, index, array, sourceArr)
      expect(array).toEqual([2, 4, 5, 6])
    })

    it("should not fail if the index is out of bounds", () => {
      const array = [1, 3, 5, 7]
      const item = 2
      const index = 10 // Индекс за пределами массива
      insertIntoOrderedArray(item, index, array, array)
      expect(array).toEqual([1, 3, 5, 7, 2])
    })
  })

  describe("deepCopyArray function", () => {
    it("should create a deep copy of an array with primitive values", () => {
      const array = [1, 2, 3, 4, 5]
      const copy = deepCopyArray(array)
      expect(copy).toEqual(array)
      expect(copy).not.toBe(array) // Ensure it's a different reference
    })

    it("should create a deep copy of an array with objects", () => {
      const array = [{ name: "John" }, { name: "Jane" }]
      const copy = deepCopyArray(array)
      expect(copy).toEqual(array)
      expect(copy).not.toBe(array) // Ensure it's a different reference
      expect(copy[0]).not.toBe(array[0]) // Ensure objects are deeply copied
    })

    it("should create a deep copy of a nested array", () => {
      const array = [1, [2, 3], [4, 5]]
      const copy = deepCopyArray(array)
      expect(copy).toEqual(array)
      expect(copy).not.toBe(array) // Ensure it's a different reference
      expect(copy[1]).not.toBe(array[1]) // Ensure nested arrays are deeply copied
    })

    it("should handle complex structures with nested objects and arrays", () => {
      const array = [1, { key: "value", arr: [2, 3] }, [4, { inner: "object" }]]
      const copy = deepCopyArray(array)
      expect(copy).toEqual(array)
      expect(copy).not.toBe(array) // Ensure it's a different reference
      expect(copy[1]).not.toBe(array[1]) // Ensure objects are deeply copied
      // @ts-ignore
      expect(copy[1].arr).not.toBe(array[1].arr) // Ensure nested arrays in objects are deeply copied
      // @ts-ignore
      expect(copy[2][1]).not.toBe(array[2][1]) // Ensure objects in nested arrays are deeply copied
    })

    it("should return an empty array if the original array is empty", () => {
      const array: any[] = []
      const copy = deepCopyArray(array)
      expect(copy).toEqual([])
      expect(copy).not.toBe(array) // Ensure it's a different reference
    })
  })
})
