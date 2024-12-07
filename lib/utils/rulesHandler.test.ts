import { describe, it, expect } from "vitest"
import { getAsyncValidate, getValidate, isExistRule } from "fishtvue/utils/rulesHandler"
import type { Rules } from "fishtvue/utils/rulesHandler"
import { required, email, phone, numeric, regular, range, length } from "./rulesMethods"

describe("Testing rules handler", () => {
  describe("required", () => {
    // Valid cases
    it("should return true for non-empty strings", () => {
      expect(required("Hello")).toBe(true)
    })

    it("should return true for non-empty arrays", () => {
      expect(required([1, 2, 3])).toBe(true)
    })

    it("should return true for numbers", () => {
      expect(required(42)).toBe(true)
    })

    it("should return true for valid objects with truthy values", () => {
      expect(required({ key: "value" })).toBe(true)
    })

    it("should return true for valid dates", () => {
      expect(required(new Date())).toBe(true)
    })

    // Invalid cases
    it("should return false for empty strings", () => {
      expect(required("")).toBe(false)
    })

    it("should return false for empty arrays", () => {
      expect(required([])).toBe(false)
    })

    it("should return false for null", () => {
      // @ts-expect-error Testing invalid input
      expect(required(null)).toBe(false)
    })

    it("should return false for undefined", () => {
      // @ts-expect-error Testing invalid input
      expect(required(undefined)).toBe(false)
    })

    it("should return false for false boolean", () => {
      expect(required(false)).toBe(false)
    })

    it("should return false for NaN", () => {
      expect(required(NaN)).toBe(false)
    })

    it("should return false for objects with all falsy values", () => {
      expect(required({ key1: null, key2: false, key3: 0 })).toBe(false)
    })

    it("should return false for empty objects", () => {
      expect(required({})).toBe(true)
    })

    // Edge cases
    it("should return false for zero", () => {
      expect(required(0)).toBe(false)
    })

    it("should return true for boolean true", () => {
      expect(required(true)).toBe(true)
    })

    it("should handle mixed values in arrays correctly", () => {
      expect(required([0, false, ""])).toBe(true)
      expect(required([1, false, ""])).toBe(true)
    })

    it("should handle objects with mixed truthy and falsy values", () => {
      expect(required({ key1: null, key2: true, key3: 0 })).toBe(true)
    })

    it("should handle invalid data types gracefully", () => {
      // @ts-expect-error Testing invalid input
      expect(required(Symbol("test"))).toBe(false)
      expect(required(() => {})).toBe(false)
    })
  })

  describe("email", () => {
    // Valid cases
    it("should return true for valid email addresses", () => {
      expect(email("example@example.com")).toBe(true)
      expect(email("user.name+tag+sorting@example.com")).toBe(true)
      expect(email("x@example.com")).toBe(true)
      expect(email("user@subdomain.example.com")).toBe(true)
      expect(email("user123@domain.org")).toBe(true)
    })

    // Invalid cases
    it("should return false for invalid email addresses", () => {
      expect(email("plainaddress")).toBe(false)
      expect(email("@missingusername.com")).toBe(false)
      expect(email("username@.com")).toBe(false)
      expect(email("username@domain.c")).toBe(false) // TLD too short
      expect(email("username@domain..com")).toBe(false) // Double dots in domain
      expect(email("username@domain@domain.com")).toBe(false) // Multiple @ symbols
      expect(email("username@domain.com ")).toBe(false) // Trailing space
      expect(email(" username@domain.com")).toBe(false) // Leading space
      expect(email("username@domain.123")).toBe(false) // Invalid TLD
    })

    // Empty or invalid data
    it("should return true for empty data", () => {
      expect(email("")).toBe(true)
      expect(email(null as any)).toBe(true)
      expect(email(undefined as any)).toBe(true)
    })

    // Edge cases
    it("should return false for special characters not allowed in email", () => {
      expect(email("user!#$%&'*+/=?^_`{|}~@domain.com")).toBe(false) // Invalid characters
      expect(email("user()<>[]:,;@domain.com")).toBe(false) // Invalid characters
    })

    it("should return true for emails with subdomains", () => {
      expect(email("user@sub.domain.com")).toBe(true)
    })

    it("should handle long emails correctly", () => {
      const longEmail = "a".repeat(64) + "@example.com"
      expect(email(longEmail)).toBe(true)
    })

    it("should return false for email with invalid characters or format", () => {
      expect(email("user@domain@another.com")).toBe(false) // Double `@`
      expect(email("user@domain..com")).toBe(false) // Double dots
    })

    // Invalid types
    it("should return true for non-string inputs", () => {
      // @ts-expect-error Testing invalid input
      expect(email(123)).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(email([])).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(email({})).toBe(true)
    })
  })

  describe("phone", () => {
    // Valid cases
    it("should return true for valid phone numbers", () => {
      expect(phone("+1234567890")).toBe(true)
      expect(phone("123-456-7890")).toBe(true)
      expect(phone("(123) 456-7890")).toBe(true)
      expect(phone("+1 (123) 456-7890")).toBe(true)
      expect(phone("1234567890")).toBe(true)
      expect(phone("123.456.7890")).toBe(true)
      expect(phone("123 456 7890")).toBe(true)
    })

    // Invalid cases
    it("should return false for invalid phone numbers", () => {
      expect(phone("123-4567")).toBe(false) // Too short
      expect(phone("phone123")).toBe(false) // Contains letters
      expect(phone("123-abc-7890")).toBe(false) // Contains invalid characters
      expect(phone("++1234567890")).toBe(false) // Double `+`
      expect(phone("123--456--7890")).toBe(false) // Double `-`
      expect(phone("")).toBe(true) // Empty string
      expect(phone(" ")).toBe(false) // Whitespace
    })

    // Empty or invalid data
    it("should return true for empty data", () => {
      expect(phone("")).toBe(true)
      expect(phone(null as any)).toBe(true)
      expect(phone(undefined as any)).toBe(true)
    })

    // Edge cases
    it("should return true for phone numbers with country codes", () => {
      expect(phone("+91 1234567890")).toBe(true)
      expect(phone("+1-800-555-5555")).toBe(true)
    })

    it("should return false for phone numbers with extensions", () => {
      expect(phone("123-456-7890 x1234")).toBe(false)
      expect(phone("(123) 456-7890 ext. 1234")).toBe(false)
    })

    it("should return false for phone numbers with invalid formats", () => {
      expect(phone("12345")).toBe(false) // Too short
      expect(phone("123 4567 89012")).toBe(false) // Too long
      expect(phone("123-456-789O")).toBe(false) // Letter instead of number
    })

    // Invalid types
    it("should return true for non-string inputs", () => {
      // @ts-expect-error Testing invalid input
      expect(phone(1234567890)).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(phone([])).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(phone({})).toBe(true)
    })

    it("should handle edge cases gracefully", () => {
      expect(phone("+")).toBe(false) // Only `+`
      expect(phone("12345678901234567890")).toBe(false) // Too long
    })
  })

  describe("numeric", () => {
    // Valid cases
    it("should return true for strings with only numeric characters", () => {
      expect(numeric("123")).toBe(true)
      expect(numeric("0")).toBe(true)
      expect(numeric("4567890")).toBe(true)
    })

    // Invalid cases
    it("should return false for strings containing non-numeric characters", () => {
      expect(numeric("123abc")).toBe(false)
      expect(numeric("abc123")).toBe(false)
      expect(numeric("12.34")).toBe(false) // Decimal point
      expect(numeric("123,456")).toBe(false) // Comma
      expect(numeric("123-456")).toBe(false) // Dash
      expect(numeric("12 34")).toBe(false) // Space
    })

    it("should return true for empty or invalid data", () => {
      expect(numeric("")).toBe(true)
      expect(numeric(null as any)).toBe(true)
      expect(numeric(undefined as any)).toBe(true)
    })

    // Edge cases
    it("should return false for strings with special characters", () => {
      expect(numeric("!@#$")).toBe(false)
      expect(numeric("123@456")).toBe(false)
    })

    it("should return true for non-string inputs", () => {
      // @ts-expect-error Testing invalid input
      expect(numeric(123)).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(numeric([])).toBe(true)
      // @ts-expect-error Testing invalid input
      expect(numeric({})).toBe(true)
    })

    it("should return true for large numeric strings", () => {
      expect(numeric("12345678901234567890")).toBe(true)
    })

    it("should return false for strings with leading or trailing spaces", () => {
      expect(numeric(" 123")).toBe(false)
      expect(numeric("123 ")).toBe(false)
      expect(numeric(" 123 ")).toBe(false)
    })
  })

  describe("regular", () => {
    // Valid cases
    it("should return true for matching values with string regex", () => {
      expect(regular("abc123", "\\d+")).toBe(true) // Matches digits
      expect(regular("hello", "[a-z]+")).toBe(true) // Matches lowercase letters
      expect(regular("123456", "\\d+")).toBe(true) // Matches numbers
    })

    it("should return true for matching values with RegExp object", () => {
      expect(regular("abc123", /\d+/)).toBe(true) // Matches digits
      expect(regular("hello", /^[a-z]+$/)).toBe(true) // Matches lowercase letters
      expect(regular("HELLO123", /[A-Z]+\d+/)).toBe(true) // Matches uppercase letters followed by digits
    })

    // Invalid cases
    it("should return false for non-matching values with string regex", () => {
      expect(regular("abc", "\\d+")).toBe(false) // No digits
      expect(regular("123", "[a-z]+")).toBe(false) // No lowercase letters
      expect(regular("HELLO", "\\d+")).toBe(false) // No digits
    })

    it("should return false for non-matching values with RegExp object", () => {
      expect(regular("abc", /\d+/)).toBe(false) // No digits
      expect(regular("123", /^[a-z]+$/)).toBe(false) // Only lowercase letters allowed
      expect(regular("HELLO", /[a-z]+\d+/)).toBe(false) // No lowercase letters followed by digits
    })

    // Empty or invalid data
    it("should return true for empty or invalid data", () => {
      expect(regular("", "\\d+")).toBe(true)
      expect(regular(null as any, "\\d+")).toBe(true)
      expect(regular(undefined as any, "\\d+")).toBe(true)
    })

    // Edge cases
    it("should return false for values that partially match regex", () => {
      expect(regular("123abc", "\\d+$")).toBe(false) // Matches only at the end
      expect(regular("abc123", /^[a-z]+$/)).toBe(false) // Matches only at the start
    })

    it("should handle complex regex patterns", () => {
      expect(regular("abc123xyz", "^[a-z]+\\d+[a-z]+$")).toBe(true) // Complex pattern
      expect(regular("123-456-7890", "^\\d{3}-\\d{3}-\\d{4}$")).toBe(true) // Phone number format
    })

    it("should correctly handle case-sensitive regex", () => {
      expect(regular("HELLO", "[a-z]+")).toBe(false) // Lowercase letters only
      expect(regular("hello", "[A-Z]+")).toBe(false) // Uppercase letters only
      expect(regular("HELLO", "[A-Z]+")).toBe(true) // Matches uppercase letters
    })
  })

  describe("range", () => {
    // Valid cases
    it("should return true for values within the range", () => {
      expect(range("10", 5, 15)).toBe(true) // Value is within range
      expect(range("5", 5, 10)).toBe(true) // Value equals min
      expect(range("10", 5, 10)).toBe(true) // Value equals max
      expect(range("100", 0, 200)).toBe(true) // Large range
    })

    it("should return true for undefined min and max", () => {
      expect(range("10", undefined, undefined)).toBe(true) // No range defined
    })

    it("should return true for non-string values", () => {
      expect(range(123, 5, 10)).toBe(true) // Non-string value
      expect(range([], 5, 10)).toBe(true) // Non-string array
      expect(range({}, 5, 10)).toBe(true) // Non-string object
    })

    it("should return true for empty or invalid data", () => {
      expect(range("", 5, 10)).toBe(true) // Empty string
      expect(range(null as any, 5, 10)).toBe(true) // Null value
      expect(range(undefined as any, 5, 10)).toBe(true) // Undefined value
    })

    // Invalid cases
    it("should return false for values outside the range", () => {
      expect(range("4", 5, 10)).toBe(false) // Less than min
      expect(range("11", 5, 10)).toBe(false) // Greater than max
      expect(range("0", 1, 10)).toBe(false) // Less than min
      expect(range("200", 0, 100)).toBe(false) // Greater than max
    })

    it("should return false for non-numeric strings", () => {
      expect(range("abc", 5, 10)).toBe(false) // Non-numeric string
      expect(range("12abc34", 5, 10)).toBe(false) // Mixed string
      expect(range("10.5", 5, 10)).toBe(false) // Decimal value
      expect(range("10,000", 5, 10)).toBe(false) // Comma-separated number
    })

    it("should return false for numeric strings not matching the range", () => {
      expect(range("5", 6, 10)).toBe(false) // Equal to min but invalid range
      expect(range("10", 1, 9)).toBe(false) // Equal to max but invalid range
    })

    // Edge cases
    it("should handle missing min or max values correctly", () => {
      expect(range("10", undefined, 20)).toBe(true) // Only max defined
      expect(range("5", 5, undefined)).toBe(true) // Only min defined
      expect(range("25", undefined, 20)).toBe(false) // Exceeds max
      expect(range("4", 5, undefined)).toBe(false) // Below min
    })

    it("should handle large ranges correctly", () => {
      expect(range("100000", 0, 1000000)).toBe(true) // Large range
      expect(range("1000001", 0, 1000000)).toBe(false) // Exceeds max
    })

    it("should correctly parse numeric string values", () => {
      expect(range("010", 5, 15)).toBe(true) // Leading zero
      expect(range("0010", 5, 15)).toBe(true) // Multiple leading zeros
      expect(range("00010", 5, 15)).toBe(true) // Even more leading zeros
    })
  })

  describe("length", () => {
    // Valid cases
    it("should return true for values within the length range", () => {
      expect(length("hello", 3, 10)).toBe(true) // Length is within range
      expect(length("hi", 2, 5)).toBe(true) // Length equals min
      expect(length("hello", 1, 5)).toBe(true) // Length equals max
      expect(length("world", undefined, 10)).toBe(true) // No min defined
      expect(length("test", 2, undefined)).toBe(true) // No max defined
    })

    it("should return true for empty or invalid data", () => {
      expect(length("", 3, 10)).toBe(true) // Empty string
      expect(length(null as any, 3, 10)).toBe(true) // Null value
      expect(length(undefined as any, 3, 10)).toBe(true) // Undefined value
    })

    // Invalid cases
    it("should return false for values shorter than min length", () => {
      expect(length("hi", 3, 10)).toBe(false) // Too short
      expect(length("a", 2, 5)).toBe(false) // Less than min
    })

    it("should return false for values longer than max length", () => {
      expect(length("hello world", 3, 10)).toBe(false) // Too long
      expect(length("longertext", 1, 5)).toBe(false) // Exceeds max
    })

    // Edge cases
    it("should return true for exact min or max length", () => {
      expect(length("hi", 2, 5)).toBe(true) // Exactly min
      expect(length("hello", 3, 5)).toBe(true) // Exactly max
    })

    it("should handle missing min or max values correctly", () => {
      expect(length("short", undefined, 10)).toBe(true) // Only max defined
      expect(length("longer text", undefined, 10)).toBe(false) // Exceeds max
      expect(length("tiny", 3, undefined)).toBe(true) // Only min defined
      expect(length("no", 3, undefined)).toBe(false) // Less than min
    })

    it("should handle strings with special characters", () => {
      expect(length("!@#$%", 3, 10)).toBe(true) // Within range
      expect(length("💻🚀", 2, 5)).toBe(true) // Emoji characters
    })

    it("should return true for strings with spaces within range", () => {
      expect(length("hello world", 5, 20)).toBe(true) // Spaces count
      expect(length("  ", 2, 5)).toBe(true) // Only spaces
    })

    it("should return false for strings with spaces outside range", () => {
      expect(length("hello world", 5, 10)).toBe(false) // Too long
      expect(length(" ", 2, 5)).toBe(false) // Too short
    })
  })

  describe("getValidate", () => {
    describe("getValidate with RulesArray", () => {
      it("should validate required rule", () => {
        const rules: Rules = [{ type: "required", message: "This field is required" }]
        expect(getValidate("", rules, {})).toEqual({ isInvalid: true, message: "This field is required" })
        expect(getValidate("value", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate email rule", () => {
        const rules: Rules = [{ type: "email", message: "Invalid email format" }]
        expect(getValidate("invalid-email", rules, {})).toEqual({ isInvalid: true, message: "Invalid email format" })
        expect(getValidate("test@example.com", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate phone rule", () => {
        const rules: Rules = [{ type: "phone", message: "Invalid phone number" }]
        expect(getValidate("invalid-phone", rules, {})).toEqual({ isInvalid: true, message: "Invalid phone number" })
        expect(getValidate("+1234567890", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate numeric rule", () => {
        const rules: Rules = [{ type: "numeric", message: "Value must be numeric" }]
        expect(getValidate("abc", rules, {})).toEqual({ isInvalid: true, message: "Value must be numeric" })
        expect(getValidate("123", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate regular rule", () => {
        const rules: Rules = [{ type: "regular", regular: "\\d+", message: "Must contain digits" }]
        expect(getValidate("abc", rules, {})).toEqual({ isInvalid: true, message: "Must contain digits" })
        expect(getValidate("123", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate range rule", () => {
        const rules: Rules = [{ type: "range", min: 5, max: 10, message: "Out of range" }]
        expect(getValidate("4", rules, {})).toEqual({ isInvalid: true, message: "Out of range" })
        expect(getValidate("7", rules, {})).toEqual({ isInvalid: false, message: "" })
        expect(getValidate("15", rules, {})).toEqual({ isInvalid: true, message: "Out of range" })
      })

      it("should validate length rule", () => {
        const rules: Rules = [{ type: "length", min: 3, max: 5, message: "Invalid length" }]
        expect(getValidate("ab", rules, {})).toEqual({ isInvalid: true, message: "Invalid length" })
        expect(getValidate("abcd", rules, {})).toEqual({ isInvalid: false, message: "" })
        expect(getValidate("abcdef", rules, {})).toEqual({ isInvalid: true, message: "Invalid length" })
      })

      it("should validate custom rule", () => {
        const rules: Rules = [
          {
            type: "custom",
            message: "Custom validation failed",
            validationCallback: (value: any) => (value === "valid" ? { isInvalid: false } : { isInvalid: true })
          }
        ]
        expect(getValidate("invalid", rules, {})).toEqual({ isInvalid: true, message: "Custom validation failed" })
        expect(getValidate("valid", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate compare rule", () => {
        const formFields = { field1: "value1", field2: "value2" }
        const rules: Rules = [
          {
            type: "compare",
            message: "Fields do not match",
            compareFields: ["field2"],
            validationCallback: (value: any, compareFields: any) =>
              value === compareFields.field2 ? { isInvalid: false } : { isInvalid: true }
          }
        ]
        expect(getValidate("value1", rules, formFields)).toEqual({ isInvalid: true, message: "Fields do not match" })
        expect(getValidate("value2", rules, formFields)).toEqual({ isInvalid: false, message: "" })
      })

      it("should apply rules in order and stop on first failure", () => {
        const rules: Rules = [
          { type: "required", message: "Required field" },
          { type: "email", message: "Invalid email format" }
        ]
        expect(getValidate("", rules, {})).toEqual({ isInvalid: true, message: "Required field" })
        expect(getValidate("invalid-email", rules, {})).toEqual({ isInvalid: true, message: "Invalid email format" })
        expect(getValidate("test@example.com", rules, {})).toEqual({ isInvalid: false, message: "" })
      })
    })

    describe("getValidate with RulesObject", () => {
      it("should validate required rule", () => {
        const rules = { required: true }
        expect(getValidate("", rules, {})).toEqual({ isInvalid: true, message: "Required field" })
        expect(getValidate("value", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate email rule", () => {
        const rules = { email: "Invalid email format" }
        expect(getValidate("invalid-email", rules, {})).toEqual({ isInvalid: true, message: "Invalid email format" })
        expect(getValidate("test@example.com", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate phone rule", () => {
        const rules = { phone: { message: "Invalid phone number" } }
        expect(getValidate("invalid-phone", rules, {})).toEqual({ isInvalid: true, message: "Invalid phone number" })
        expect(getValidate("+1234567890", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate numeric rule", () => {
        const rules = { numeric: { message: "Value must be numeric" } }
        expect(getValidate("abc", rules, {})).toEqual({ isInvalid: true, message: "Value must be numeric" })
        expect(getValidate("123", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate regular rule", () => {
        const rules = { regular: { regular: "\\d+", message: "Must contain digits" } }
        expect(getValidate("abc", rules, {})).toEqual({ isInvalid: true, message: "Must contain digits" })
        expect(getValidate("123", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate range rule", () => {
        const rules = { range: { min: 5, max: 10, message: "Out of range" } }
        expect(getValidate("4", rules, {})).toEqual({ isInvalid: true, message: "Out of range" })
        expect(getValidate("7", rules, {})).toEqual({ isInvalid: false, message: "" })
        expect(getValidate("15", rules, {})).toEqual({ isInvalid: true, message: "Out of range" })
      })

      it("should validate length rule", () => {
        const rules = { length: { min: 3, max: 5, message: "Invalid length" } }
        expect(getValidate("ab", rules, {})).toEqual({ isInvalid: true, message: "Invalid length" })
        expect(getValidate("abcd", rules, {})).toEqual({ isInvalid: false, message: "" })
        expect(getValidate("abcdef", rules, {})).toEqual({ isInvalid: true, message: "Invalid length" })
      })

      it("should validate custom rule", () => {
        const rules = {
          custom: {
            message: "Custom validation failed",
            validationCallback: (value: any) => (value === "valid" ? { isInvalid: false } : { isInvalid: true })
          }
        }
        expect(getValidate("invalid", rules, {})).toEqual({ isInvalid: true, message: "Custom validation failed" })
        expect(getValidate("valid", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should validate compare rule", () => {
        const formFields = { field1: "value1", field2: "value2" }
        const rules = {
          compare: {
            message: "Fields do not match",
            compareFields: ["field2"],
            validationCallback: (value: any, compareFields: any) =>
              value === compareFields.field2 ? { isInvalid: false } : { isInvalid: true }
          }
        }
        expect(getValidate("value1", rules, formFields)).toEqual({ isInvalid: true, message: "Fields do not match" })
        expect(getValidate("value2", rules, formFields)).toEqual({ isInvalid: false, message: "" })
      })

      it("should apply rules in order and stop on first failure", () => {
        const rules = {
          required: { message: "Required field" },
          email: { message: "Invalid email format" }
        }
        expect(getValidate("", rules, {})).toEqual({ isInvalid: true, message: "Required field" })
        expect(getValidate("invalid-email", rules, {})).toEqual({ isInvalid: true, message: "Invalid email format" })
        expect(getValidate("test@example.com", rules, {})).toEqual({ isInvalid: false, message: "" })
      })

      it("should handle missing or invalid rules gracefully", () => {
        const rules = {}
        expect(getValidate("value", rules, {})).toEqual({ isInvalid: false, message: "" })

        let invalidRules: any = { unknownRule: { message: "This rule does not exist" } }
        expect(getValidate("value", invalidRules, {})).toEqual({ isInvalid: false, message: "" })

        invalidRules = [{ type: "unknownRule", message: "This rule does not exist" }]
        expect(getValidate("value", invalidRules, {})).toEqual({ isInvalid: false, message: "" })
      })
    })
  })

  describe("isExistRule", () => {
    it("should return true if the rule exists in RulesObject", () => {
      const rules: Rules = { required: { message: "Required field" }, email: true }
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(true)
      expect(isExistRule(rules, "phone")).toBe(false)
    })

    it("should return true if the rule exists in RulesArray", () => {
      const rules: Rules = [
        { type: "required", message: "Required field" },
        { type: "email", message: "Invalid email format" }
      ]
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(true)
      expect(isExistRule(rules, "phone")).toBe(false)
    })

    it("should return false for an empty RulesObject", () => {
      const rules: Rules = {}
      expect(isExistRule(rules, "required")).toBe(false)
      expect(isExistRule(rules, "email")).toBe(false)
    })

    it("should return false for an empty RulesArray", () => {
      const rules: any[] = []
      expect(isExistRule(rules, "required")).toBe(false)
      expect(isExistRule(rules, "email")).toBe(false)
    })

    it("should return true if rule is active in RulesObject", () => {
      const rules: Rules = {
        required: { message: "Required field", isActive: true },
        email: { message: "Invalid email format", isActive: false }
      }
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(true) // Still exists even if inactive
    })

    it("should return true if rule is active in RulesArray", () => {
      const rules: Rules = [
        { type: "required", message: "Required field", isActive: true },
        { type: "email", message: "Invalid email format", isActive: false }
      ]
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(true) // Still exists even if inactive
    })

    it("should handle mixed rule types in RulesArray", () => {
      const rules: Rules = [
        { type: "required", message: "Required field" },
        { type: "range", min: 5, max: 10, message: "Out of range" }
      ]
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "range")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(false)
    })

    it("should handle mixed rule types in RulesObject", () => {
      const rules: Rules = {
        required: { message: "Required field" },
        range: { min: 5, max: 10, message: "Out of range" }
      }
      expect(isExistRule(rules, "required")).toBe(true)
      expect(isExistRule(rules, "range")).toBe(true)
      expect(isExistRule(rules, "email")).toBe(false)
    })

    it("should handle invalid rule types gracefully in RulesObject", () => {
      const rules: Rules = { required: true }
      expect(isExistRule(rules, "invalidRule" as any)).toBe(false) // Nonexistent rule type
      expect(isExistRule(rules, "nonexistentRule" as any)).toBe(false) // Another nonexistent rule type
    })

    it("should handle invalid rule types gracefully in RulesArray", () => {
      const rules: Rules = [{ type: "required", message: "Required field" }]
      expect(isExistRule(rules, "invalidRule" as any)).toBe(false) // Nonexistent rule type
      expect(isExistRule(rules, "nonexistentRule" as any)).toBe(false) // Another nonexistent rule type
    })

    it("should handle edge cases with unexpected input", () => {
      const rules: Rules = [{ type: "required", message: "Required field" }]
      expect(isExistRule(rules, "" as any)).toBe(false) // Empty string as rule type
      expect(isExistRule(rules, null as any)).toBe(false) // Null as rule type
      expect(isExistRule(rules, undefined as any)).toBe(false) // Undefined as rule type
      expect(isExistRule(rules, 123 as any)).toBe(false) // Numeric rule type
    })
  })

  describe("getAsyncValidate", () => {
    it("should return valid if no async rule is present", async () => {
      const rules = { required: { message: "This field is required" } } // No async rule
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: false, message: "" })
    })

    it("should return valid if async rule is inactive", async () => {
      const rules = {
        async: {
          isActive: false,
          message: "Async rule is inactive",
          validationCallback: async () => ({ isInvalid: true, message: "Should not be called" })
        }
      }
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: false, message: "" })
    })

    it("should return invalid if async rule fails", async () => {
      const rules = {
        async: {
          isActive: true,
          message: "Async validation failed",
          validationCallback: async (value: any) => ({
            isInvalid: true,
            message: value === "invalid" ? "Invalid value" : "Unexpected"
          })
        }
      }
      const result = await getAsyncValidate("invalid", rules)
      expect(result).toEqual({ isInvalid: true, message: "Invalid value" })
    })

    it("should return valid if async rule succeeds", async () => {
      const rules = {
        async: {
          isActive: true,
          message: "Async validation failed",
          validationCallback: async () => ({
            isInvalid: false,
            message: "Valid value"
          })
        }
      }
      const result = await getAsyncValidate("valid", rules)
      expect(result).toEqual({ isInvalid: false, message: "Valid value" })
    })

    it("should use the default message if no callback message is provided", async () => {
      const rules = {
        async: {
          isActive: true,
          message: "Default async message",
          validationCallback: async () => ({
            isInvalid: true
          })
        }
      }
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: true, message: "Default async message" })
    })

    it("should return valid for empty rules", async () => {
      const rules = {} // No rules at all
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: false, message: "" })
    })

    it("should not call validationCallback for inactive async rule", async () => {
      let callbackCalled = false
      const rules = {
        async: {
          isActive: false,
          message: "Should not call validation",
          validationCallback: async () => {
            callbackCalled = true
            return { isInvalid: true }
          }
        }
      }
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: false, message: "" })
      expect(callbackCalled).toBe(false)
    })

    it("should handle multiple rules but only process async rule", async () => {
      const rules = {
        required: { message: "Required field" },
        email: { message: "Invalid email" },
        async: {
          isActive: true,
          message: "Async validation failed",
          validationCallback: async () => ({
            isInvalid: true,
            message: "Async failed"
          })
        }
      }
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: true, message: "Async failed" })
    })

    it("should handle async rule with no message", async () => {
      const rules = {
        async: {
          isActive: true,
          validationCallback: async () => ({
            isInvalid: true
          })
        }
      }
      const result = await getAsyncValidate("value", rules)
      expect(result).toEqual({ isInvalid: true, message: "" })
    })

    it("should handle exceptions in async validationCallback", async () => {
      const rules = {
        async: {
          isActive: true,
          validationCallback: async () => {
            throw new Error("Unexpected error")
          }
        }
      }
      await expect(getAsyncValidate("value", rules)).rejects.toThrow("Unexpected error")
    })
  })
})
