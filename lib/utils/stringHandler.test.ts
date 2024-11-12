import { describe, it, expect } from "vitest"
import { isString, toFlatCase, toKebabCase, toCapitalCase, stringify } from "fishtvue/utils/stringHandler"

describe("Testing string handler", () => {
  describe("isString function", () => {
    it("should return true for non-empty strings", () => {
      expect(isString("Hello")).toBe(true)
      expect(isString("World")).toBe(true)
    })

    it("should return true for empty strings by default", () => {
      expect(isString("")).toBe(true)
    })

    it('should return false for empty strings when "empty" is false', () => {
      expect(isString("", false)).toBe(false)
    })

    it("should return false for non-string values", () => {
      expect(isString(123)).toBe(false)
      expect(isString(true)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
      expect(isString({})).toBe(false)
      expect(isString([])).toBe(false)
      expect(isString(() => {})).toBe(false)
    })

    it('should return true for string objects when "empty" is true', () => {
      expect(isString(String("Hello"))).toBe(true) // String object
    })

    it('should return false for string objects when "empty" is false and the object is empty', () => {
      expect(isString(String(""), false)).toBe(false) // Empty String object
    })
  })

  describe("toFlatCase function", () => {
    it("should convert snake_case to flat case", () => {
      const snakeCaseStr = "hello_world"
      const result = toFlatCase(snakeCaseStr)
      expect(result).toBe("helloworld")
    })

    it("should convert kebab-case to flat case", () => {
      const kebabCaseStr = "hello-world"
      const result = toFlatCase(kebabCaseStr)
      expect(result).toBe("helloworld")
    })

    it("should convert camelCase to flat case", () => {
      const camelCaseStr = "helloWorld"
      const result = toFlatCase(camelCaseStr)
      expect(result).toBe("helloworld")
    })

    it("should convert PascalCase to flat case", () => {
      const pascalCaseStr = "HelloWorld"
      const result = toFlatCase(pascalCaseStr)
      expect(result).toBe("helloworld")
    })

    it("should return the same string for already flat case", () => {
      const flatCaseStr = "helloworld"
      const result = toFlatCase(flatCaseStr)
      expect(result).toBe(flatCaseStr)
    })

    it("should handle empty strings", () => {
      const emptyStr = ""
      const result = toFlatCase(emptyStr)
      expect(result).toBe(emptyStr)
    })

    it("should return the original value if input is not a string", () => {
      expect(toFlatCase(null as unknown as string)).toBe(null)
      expect(toFlatCase(undefined as unknown as string)).toBe(undefined)
      expect(toFlatCase(123 as unknown as string)).toBe(123)
    })

    it("should handle strings with special characters and numbers", () => {
      const specialStr = "Hello-World_123"
      const result = toFlatCase(specialStr)
      expect(result).toBe("helloworld123")
    })
  })

  describe("toKebabCase function", () => {
    it("should convert snake_case to kebab case", () => {
      const snakeCaseStr = "hello_world"
      const result = toKebabCase(snakeCaseStr)
      expect(result).toBe("hello-world")
    })

    it("should convert camelCase to kebab case", () => {
      const camelCaseStr = "helloWorld"
      const result = toKebabCase(camelCaseStr)
      expect(result).toBe("hello-world")
    })

    it("should convert PascalCase to kebab case", () => {
      const pascalCaseStr = "HelloWorld"
      const result = toKebabCase(pascalCaseStr)
      expect(result).toBe("hello-world")
    })

    it("should handle strings with existing hyphens", () => {
      const strWithHyphens = "hello-world-example"
      const result = toKebabCase(strWithHyphens)
      expect(result).toBe("hello-world-example")
    })

    it("should handle strings with numbers and special characters", () => {
      const strWithNumbersAndSpecials = "helloWorld123"
      const result = toKebabCase(strWithNumbersAndSpecials)
      expect(result).toBe("hello-world123")

      const strWithSpecials = "Hello@World#Example"
      const result2 = toKebabCase(strWithSpecials)
      expect(result2).toBe("hello@world#example")
    })

    it("should handle empty strings", () => {
      const emptyStr = ""
      const result = toKebabCase(emptyStr)
      expect(result).toBe(emptyStr)
    })

    it("should return the original value if input is not a string", () => {
      expect(toKebabCase(null as unknown as string)).toBe(null)
      expect(toKebabCase(undefined as unknown as string)).toBe(undefined)
      expect(toKebabCase(123 as unknown as string)).toBe(123)
    })

    it("should handle uppercase letters correctly", () => {
      const uppercaseStr = "HELLO WORLD"
      const result = toKebabCase(uppercaseStr)
      expect(result).toBe("hello-world")
    })

    it("should convert camelCase to kebab-case", () => {
      expect(toKebabCase("camelCaseExample")).toBe("camel-case-example")
    })

    it("should convert PascalCase to kebab-case", () => {
      expect(toKebabCase("PascalCaseExample")).toBe("pascal-case-example")
      expect(toKebabCase("Pascal")).toBe("pascal")
    })

    it("should convert string with spaces to kebab-case", () => {
      expect(toKebabCase("string with spaces")).toBe("string-with-spaces")
    })

    it("should convert string with underscores to kebab-case", () => {
      expect(toKebabCase("string_with_underscores")).toBe("string-with-underscores")
    })

    it("should handle mixed cases and separators", () => {
      expect(toKebabCase("Mixed_Example WithVarious-Separators")).toBe("mixed-example-with-various-separators")
    })

    it("should return an empty string if input is empty", () => {
      expect(toKebabCase("")).toBe("")
    })

    it("should handle single word input", () => {
      expect(toKebabCase("word")).toBe("word")
    })
  })

  describe("toCapitalCase function", () => {
    it("should capitalize the first letter of a lowercase string", () => {
      const lowercaseStr = "hello"
      const result = toCapitalCase(lowercaseStr)
      expect(result).toBe("Hello")
    })

    it("should capitalize the first letter of an uppercase string", () => {
      const uppercaseStr = "world"
      const result = toCapitalCase(uppercaseStr)
      expect(result).toBe("World")
    })

    it("should capitalize the first letter and leave the rest unchanged", () => {
      const mixedCaseStr = "hELLo"
      const result = toCapitalCase(mixedCaseStr)
      expect(result).toBe("HELLo")
    })

    it("should return an empty string when input is an empty string", () => {
      const emptyStr = ""
      const result = toCapitalCase(emptyStr)
      expect(result).toBe(emptyStr)
    })

    it("should handle strings with special characters", () => {
      const specialStr = "@hello"
      const result = toCapitalCase(specialStr)
      expect(result).toBe("@hello")
    })

    it("should handle strings with numbers", () => {
      const numberStr = "123hello"
      const result = toCapitalCase(numberStr)
      expect(result).toBe("123hello")
    })

    it("should return the original value if input is not a string", () => {
      expect(toCapitalCase(null as unknown as string)).toBe(null)
      expect(toCapitalCase(undefined as unknown as string)).toBe(undefined)
      expect(toCapitalCase(123 as unknown as string)).toBe(123)
    })

    it("should handle single character strings", () => {
      const singleCharStr = "a"
      const result = toCapitalCase(singleCharStr)
      expect(result).toBe("A")
    })

    it("should not modify already capitalized first letters", () => {
      const capitalizedStr = "AlreadyCapitalized"
      const result = toCapitalCase(capitalizedStr)
      expect(result).toBe(capitalizedStr)
    })
  })

  describe("stringify function", () => {
    it("should convert a simple object to string", () => {
      const obj = { name: "John", age: 30 }
      const result = stringify(obj)
      expect(result).toBe('{\n  name: "John",\n  age: 30\n}')
    })

    it("should handle nested objects with indentation", () => {
      const obj = { name: "John", address: { city: "New York", zip: "10001" } }
      const result = stringify(obj, 2)
      expect(result).toBe('{\n  name: "John",\n  address: {\n    city: "New York",\n    zip: "10001"\n  }\n}')
    })

    it("should handle arrays correctly", () => {
      const arr = [1, 2, 3, { a: "test" }]
      const result = stringify(arr)
      expect(result).toBe('[1, 2, 3, {\n    a: "test"\n  }]')
    })

    it("should handle dates correctly", () => {
      const date = new Date("2023-01-01T00:00:00Z")
      const result = stringify(date)
      expect(result).toBe("2023-01-01T00:00:00.000Z")
    })

    it("should convert functions to strings", () => {
      const func = function () {
        return "hello"
      }
      const result = stringify(func)
      expect(result).toContain("function")
      expect(result).toContain('function() {\n        return "hello";\n      }')
    })

    it("should handle null and undefined", () => {
      expect(stringify(null)).toBe("null")
      expect(stringify(undefined)).toBe(undefined)
    })

    it("should handle strings with special characters", () => {
      const str = "Hello\nWorld\t!"
      const result = stringify(str)
      expect(result).toBe(JSON.stringify(str))
    })

    it("should apply custom indentation levels", () => {
      const obj = { a: 1, b: { c: 2 } }
      const result = stringify(obj, 4)
      expect(result).toBe("{\n    a: 1,\n    b: {\n        c: 2\n    }\n}")
    })

    it("should handle numbers, booleans, and other primitives", () => {
      expect(stringify(42)).toBe("42")
      expect(stringify(true)).toBe("true")
      expect(stringify("string")).toBe('"string"')
    })
  })
})
