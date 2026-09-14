import { describe, expect, it } from "vitest"
import { cn, mergeClasses } from "fishtvue/utils/tailwindHandler"

describe("Testing tailwind handler", () => {
  describe("cn function", () => {
    it("should combine multiple class names into a single string", () => {
      const class1 = "text-red-500"
      const class2 = "bg-blue-500"
      const class3 = "font-bold"
      const result = cn(class1, class2, class3)
      expect(result).toBe("text-red-500 bg-blue-500 font-bold")
    })

    it("should remove duplicate classes, keeping the last one in case of conflicts", () => {
      const result = cn("text-red-500", "text-blue-500", "text-red-500")
      expect(result).toBe("text-red-500")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("text-red-500", isActive && "font-bold", "bg-blue-500")
      expect(result).toBe("text-red-500 font-bold bg-blue-500")
    })

    it("should handle falsy values and ignore them", () => {
      const result = cn("text-red-500", false, null, undefined, "", "bg-blue-500")
      expect(result).toBe("text-red-500 bg-blue-500")
    })

    it("should merge conflicting Tailwind CSS classes correctly", () => {
      const result = cn("text-red-500", "text-blue-500", "bg-blue-500")
      // Предполагается, что twMerge корректно обрабатывает конфликты классов
      expect(result).toBe("text-blue-500 bg-blue-500")
    })

    it("should handle array of class names", () => {
      const classArray = ["text-red-500", "bg-blue-500"]
      const result = cn(classArray)
      expect(result).toBe("text-red-500 bg-blue-500")
    })

    it("should handle nested arrays of class names", () => {
      const result = cn(["text-red-500", ["bg-blue-500", "font-bold"]])
      expect(result).toBe("text-red-500 bg-blue-500 font-bold")
    })
  })

  describe("mergeClasses (classes-map, props 1.0)", () => {
    // По-ключевой cn: родитель складывает свои дефолты с `xProps.classes` потребителя
    // (Table → filter Input, Form → Field, InputLayout-семья → InputLayout). Позднее — побеждает.
    it("merges maps per key, later wins twMerge conflicts, non-conflicting classes accumulate", () => {
      expect(mergeClasses({ root: "p-2 rounded", base: "border" }, { root: "p-4" })).toEqual({
        root: "rounded p-4",
        base: "border"
      })
    })

    it("skips undefined maps and keys without a value", () => {
      expect(mergeClasses(undefined, { base: "x" }, undefined)).toEqual({ base: "x" })
      expect(mergeClasses({ base: undefined, root: "" }, {})).toEqual({})
    })

    it("flattens StyleClass arrays", () => {
      expect(mergeClasses({ base: ["a", "b"] }, { base: "c" })).toEqual({ base: "a b c" })
    })

    it("returns a fresh object and never mutates the inputs", () => {
      const first = { base: "a" }
      const out = mergeClasses(first, { base: "b" })
      expect(first).toEqual({ base: "a" })
      expect(out).not.toBe(first)
    })

    it("returns an empty map when nothing is passed", () => {
      expect(mergeClasses()).toEqual({})
    })
  })
})
