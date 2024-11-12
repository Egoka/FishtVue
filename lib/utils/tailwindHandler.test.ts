import { describe, it, expect } from "vitest"
import { cn } from "fishtvue/utils/tailwindHandler"

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
})
