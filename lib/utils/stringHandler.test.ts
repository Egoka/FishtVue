import { describe, it, expect } from "vitest"
import {
  isString,
  toFlatCase,
  toKebabCase,
  toCapitalCase,
  stringify,
  convertToDashCase,
  convertToCamelCase,
  convertToSnakeCase
} from "fishtvue/utils/stringHandler"

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

  describe("convertToCamelCase", () => {
    it("should convert snake_case to CamelCase", () => {
      const snakeCaseStr = "snake_case_string"
      expect(convertToCamelCase(snakeCaseStr)).toBe("SnakeCaseString")
    })

    it("should convert kebab-case to CamelCase", () => {
      const kebabCaseStr = "kebab-case-string"
      expect(convertToCamelCase(kebabCaseStr)).toBe("KebabCaseString")
    })

    it("should convert a string with mixed delimiters to CamelCase", () => {
      const mixedStr = "mixed-delimiter_string-example"
      expect(convertToCamelCase(mixedStr)).toBe("MixedDelimiterStringExample")
    })

    it("should capitalize the first letter of a single word", () => {
      const singleWord = "word"
      expect(convertToCamelCase(singleWord)).toBe("Word")
    })

    it("should handle strings with leading delimiters", () => {
      const leadingDelimiters = "-_leading-underscore"
      expect(convertToCamelCase(leadingDelimiters)).toBe("_leadingUnderscore")
    })

    it("should handle strings with trailing delimiters", () => {
      const trailingDelimiters = "trailing-underscore-_"
      expect(convertToCamelCase(trailingDelimiters)).toBe("TrailingUnderscore_")
    })

    it("should handle strings with multiple consecutive delimiters", () => {
      const consecutiveDelimiters = "multiple--underscores__example"
      expect(convertToCamelCase(consecutiveDelimiters)).toBe("Multiple-Underscores_example")
    })

    it("should handle an empty string", () => {
      const emptyStr = ""
      expect(convertToCamelCase(emptyStr)).toBe("")
    })

    it("should handle a string with no delimiters", () => {
      const noDelimiters = "alreadycamelcase"
      expect(convertToCamelCase(noDelimiters)).toBe("Alreadycamelcase")
    })

    it("should capitalize the first letter of a single character", () => {
      const singleChar = "a"
      expect(convertToCamelCase(singleChar)).toBe("A")
    })

    it("should handle a string with only delimiters", () => {
      const onlyDelimiters = "---___"
      expect(convertToCamelCase(onlyDelimiters)).toBe("--__")
    })

    it("should convert a string with numbers and delimiters to CamelCase", () => {
      const numbersAndDelimiters = "convert-to-2camel_case"
      expect(convertToCamelCase(numbersAndDelimiters)).toBe("ConvertTo2camelCase")
    })

    it("should handle strings with special characters", () => {
      const specialChars = "special-@-case"
      expect(convertToCamelCase(specialChars)).toBe("Special-@Case")
    })
  })

  describe("convertToDashCase", () => {
    it("should convert camelCase to dash-case", () => {
      const camelCaseStr = "camelCaseString"
      expect(convertToDashCase(camelCaseStr)).toBe("camel-case-string")
    })

    it("should convert PascalCase to dash-case", () => {
      const pascalCaseStr = "PascalCaseString"
      expect(convertToDashCase(pascalCaseStr)).toBe("pascal-case-string")
    })

    it("should convert snake_case to dash-case", () => {
      const snakeCaseStr = "snake_case_string"
      expect(convertToDashCase(snakeCaseStr)).toBe("snake-case-string")
    })

    it("should convert strings with special characters to dash-case", () => {
      const specialCharStr = "hello@World#Test"
      expect(convertToDashCase(specialCharStr)).toBe("hello--world--test")
    })

    it("should handle strings with only special characters", () => {
      const specialChars = "@#_$"
      expect(convertToDashCase(specialChars)).toBe("----")
    })

    it("should handle strings with mixed cases and special characters", () => {
      const mixedStr = "Hello_World-Test123"
      expect(convertToDashCase(mixedStr)).toBe("hello--world--test123")
    })

    it("should handle empty strings", () => {
      const emptyStr = ""
      expect(convertToDashCase(emptyStr)).toBe("")
    })

    it("should handle strings with no uppercase or special characters", () => {
      const simpleStr = "helloworld"
      expect(convertToDashCase(simpleStr)).toBe("helloworld")
    })

    it("should handle a single uppercase character", () => {
      const singleUpper = "A"
      expect(convertToDashCase(singleUpper)).toBe("a")
    })

    it("should handle strings with numbers and uppercase letters", () => {
      const strWithNumbers = "Test123String456"
      expect(convertToDashCase(strWithNumbers)).toBe("test123-string456")
    })

    it("should handle strings starting with special characters", () => {
      const specialStart = "@HelloWorld"
      expect(convertToDashCase(specialStart)).toBe("--hello-world")
    })
  })

  describe("convertToSnakeCase", () => {
    it("should convert camelCase to snake_case", () => {
      const camelCaseStr = "camelCaseString"
      expect(convertToSnakeCase(camelCaseStr)).toBe("camel_case_string")
    })

    it("should convert PascalCase to snake_case", () => {
      const pascalCaseStr = "PascalCaseString"
      expect(convertToSnakeCase(pascalCaseStr)).toBe("pascal_case_string")
    })

    it("should convert kebab-case to snake_case", () => {
      const kebabCaseStr = "kebab-case-string"
      expect(convertToSnakeCase(kebabCaseStr)).toBe("kebab_case_string")
    })

    it("should convert a string with mixed delimiters to snake_case", () => {
      const mixedStr = "Mixed-Delimiter_stringExample"
      expect(convertToSnakeCase(mixedStr)).toBe("mixed__delimiter_string_example")
    })

    it("should handle strings with special characters", () => {
      const specialChars = "special@Case#Test"
      expect(convertToSnakeCase(specialChars)).toBe("special__case__test")
    })

    it("should handle strings with leading uppercase letters", () => {
      const leadingUpper = "LeadingCaseString"
      expect(convertToSnakeCase(leadingUpper)).toBe("leading_case_string")
    })

    it("should handle strings with trailing uppercase letters", () => {
      const trailingUpper = "TrailingCaseString"
      expect(convertToSnakeCase(trailingUpper)).toBe("trailing_case_string")
    })

    it("should handle strings with multiple consecutive uppercase letters", () => {
      const multipleUpper = "XMLHTTPRequest"
      expect(convertToSnakeCase(multipleUpper)).toBe("x_m_l_h_t_t_p_request")
    })

    it("should handle an empty string", () => {
      const emptyStr = ""
      expect(convertToSnakeCase(emptyStr)).toBe("")
    })

    it("should handle a string with no uppercase or special characters", () => {
      const simpleStr = "already_snake_case"
      expect(convertToSnakeCase(simpleStr)).toBe("already_snake_case")
    })

    it("should handle a single uppercase character", () => {
      const singleUpper = "A"
      expect(convertToSnakeCase(singleUpper)).toBe("a")
    })

    it("should handle strings with numbers", () => {
      const strWithNumbers = "convertTo2SnakeCase"
      expect(convertToSnakeCase(strWithNumbers)).toBe("convert_to2_snake_case")
    })

    it("should handle strings with only special characters", () => {
      const onlySpecials = "@#_$"
      expect(convertToSnakeCase(onlySpecials)).toBe("____")
    })

    it("should handle strings with leading special characters", () => {
      const leadingSpecials = "@HelloWorld"
      expect(convertToSnakeCase(leadingSpecials)).toBe("__hello_world")
    })

    it("should handle strings with trailing special characters", () => {
      const trailingSpecials = "HelloWorld@#"
      expect(convertToSnakeCase(trailingSpecials)).toBe("hello_world__")
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
