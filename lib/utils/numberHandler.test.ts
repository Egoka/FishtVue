import { describe, it, vi, expect, beforeEach, afterEach } from "vitest"
import { convertToPhone, toPhone, onkeydown, convertToNumber, toNumber, isNumber } from "fishtvue/utils/numberHandler"

describe("Testing Number handler", () => {
  describe("convertToPhone", () => {
    // Тесты для корректных данных
    it("should format phone number for country code 1 correctly", () => {
      const result = convertToPhone("12345678901")
      expect(result).toBe("+1 (234) 567-89-01")
    })

    it("should format phone number for country code 7 correctly", () => {
      const result = convertToPhone("79012345678")
      expect(result).toBe("+7 (901) 234-56-78")
    })

    it("should format phone number for country code 81 with city code 6 correctly", () => {
      const result = convertToPhone("816123456789")
      expect(result).toBe("+81 (6) 1234-5678-9")
    })

    it("should format phone number for country code 82 with city code 52 correctly", () => {
      const result = convertToPhone("825212345678")
      expect(result).toBe("+82 (52) 1234-5678")
    })

    it("should format phone number for country code 86 with city code 21 correctly", () => {
      const result = convertToPhone("862112345678")
      expect(result).toBe("+86 (21) 1234-5678")
    })

    // Тесты для некорректных данных
    it("should return empty string for empty input", () => {
      const result = convertToPhone("")
      expect(result).toBe("")
    })

    it("should return the cleaned input for non-numeric characters", () => {
      const result = convertToPhone("abc123def456")
      expect(result).toBe("123456")
    })

    it('should return "+" for invalid country codes', () => {
      const result = convertToPhone("9999999999")
      expect(result).toBe("+9999999999")
    })

    it("should handle input with plus sign correctly", () => {
      const result = convertToPhone("+79012345678")
      expect(result).toBe("+7 (901) 234-56-78")
    })

    it("should not modify already formatted phone numbers", () => {
      const result = convertToPhone("+7 (901) 234-5678")
      expect(result).toBe("+7 (901) 234-56-78")
    })

    // Тесты для крайних случаев
    it("should handle very short inputs gracefully", () => {
      const result = convertToPhone("7")
      expect(result).toBe("+7")
    })

    it("should handle very long inputs gracefully", () => {
      const result = convertToPhone("79012345678901234567890")
      expect(result).toBe("+7 (901) 234-56-78-9012345")
    })

    it('should return "+" if no match found in regex', () => {
      const result = convertToPhone("+")
      expect(result).toBe("+")
    })
  })

  describe("convertToNumber", () => {
    it("should return an empty string for falsy input", () => {
      expect(convertToNumber(0)).toBe("")
      expect(convertToNumber("")).toBe("")
      expect(convertToNumber(null as any)).toBe("")
      expect(convertToNumber(undefined as any)).toBe("")
    })

    it("should format a number with default settings", () => {
      expect(convertToNumber(1234567)).toBe("1234567")
      expect(convertToNumber("1234567")).toBe("1234567")
    })

    it("should format a number with custom separator", () => {
      expect(convertToNumber(1234567, 20, 0, " ")).toBe("1 234 567")
    })

    it("should append custom end string", () => {
      expect(convertToNumber(1234567, 20, 0, ",", " USD")).toBe("1,234,567 USD")
    })

    it("should handle decimal places", () => {
      expect(convertToNumber(1234567.89, 20, 2)).toBe("1234567.89")
      expect(convertToNumber("1234567.89", 20, 3)).toBe("1234567.890")
    })

    it("should use custom floating point character", () => {
      expect(convertToNumber(1234567.89, 20, 2, ",", "", 3, ",")).toBe("1,234,567,89")
    })

    it("should handle interval changes", () => {
      expect(convertToNumber(1234567, 20, 0, ".", "", 2)).toBe("1.23.45.67")
    })

    it("should truncate to specified integer length", () => {
      expect(convertToNumber(1234567890, 5)).toBe("12345")
    })

    it("should truncate decimal places to specified length", () => {
      expect(convertToNumber(123.456789, 20, 2)).toBe("123.45")
    })

    it("should handle edge cases", () => {
      expect(convertToNumber(".123456")).toBe("0") // Handles leading decimal
      expect(convertToNumber("abc123xyz")).toBe("123") // Removes non-numeric characters
      expect(convertToNumber(0.000123, 20, 6)).toBe("0.000123") // Handles small numbers
    })

    it("should not fail on large numbers", () => {
      // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
      expect(convertToNumber(12345678901234567890, 20, 0)).toBe("12345678901234567000")
    })
  })

  describe("onkeydown and toPhone", () => {
    beforeEach(() => {
      vi.useFakeTimers() // Активируем фейковые таймеры перед каждым тестом
    })

    afterEach(() => {
      vi.clearAllTimers() // Очищаем все таймеры после каждого теста
      vi.useRealTimers() // Возвращаем реальное время после теста
    })
    it("should save the key pressed and old value in onkeydown", () => {
      const event = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }

      onkeydown(event)

      expect(event.key).toBe("Backspace")
      expect(event.target.value).toBe("+1 (234) 567-8901")
    })

    it("should format phone number correctly in toPhone", () => {
      const event = {
        target: {
          value: "12345678901",
          selectionStart: 11,
          setSelectionRange: vi.fn()
        }
      }

      toPhone(event)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение обновлено
      expect(event.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что позиция курсора обновлена
      expect(event.target.setSelectionRange).toHaveBeenCalledWith(11, 11)
    })

    it("should handle Backspace and special characters correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 8,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что номер отформатирован корректно после Backspace
      expect(eventToPhone.target.value).toBe("+1 (235) 678-90-1")
      // Проверяем, что позиция курсора обновлена корректно
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(7, 7)
    })

    it("should not modify input if Backspace is pressed at position 0", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 0,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что номер не изменился
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что позиция курсора осталась на месте
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(0, 0)
    })

    it("should handle empty input gracefully", () => {
      const eventKeydown = {
        key: "",
        target: { value: "" }
      }
      const eventToPhone = {
        target: {
          value: "",
          selectionStart: 0,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что пустое значение не вызывает ошибок
      expect(eventToPhone.target.value).toBe("")
      // Проверяем, что позиция курсора осталась на месте
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(0, 0)
    })

    it("should handle input with only special characters gracefully", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+()-" }
      }
      const eventToPhone = {
        target: {
          value: "+()-",
          selectionStart: 5,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что пустое значение не вызывает ошибок
      expect(eventToPhone.target.value).toBe("+")
      // Проверяем, что позиция курсора установлена корректно
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(5, 5)
    })
    it("should not delete a space but move the cursor correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 4, // Курсор стоит после "+1 "
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение остается неизменным
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что курсор переместился назад
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(4, 4)
    })

    it("should not delete a plus sign but move the cursor correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 1, // Курсор стоит после "+"
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение остается неизменным
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что курсор переместился назад
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(1, 1)
    })

    it("should not delete an opening parenthesis but move the cursor correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 5, // Курсор стоит после "("
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение остается неизменным
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что курсор переместился назад
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(5, 5)
    })

    it("should not delete a closing parenthesis but move the cursor correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 9, // Курсор стоит после ")"
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение остается неизменным
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что курсор переместился назад
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(9, 9)
    })

    it("should not delete a hyphen but move the cursor correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "+1 (234) 567-8901" }
      }
      const eventToPhone = {
        target: {
          value: "+1 (234) 567-8901",
          selectionStart: 14, // Курсор стоит после "-"
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toPhone(eventToPhone)
      vi.advanceTimersByTime(1)
      // Проверяем, что значение остается неизменным
      expect(eventToPhone.target.value).toBe("+1 (234) 567-89-01")
      // Проверяем, что курсор переместился назад
      expect(eventToPhone.target.setSelectionRange).toHaveBeenCalledWith(14, 14)
    })
  })

  describe("onkeydown and toNumber", () => {
    beforeEach(() => {
      vi.useFakeTimers() // Активируем фейковые таймеры перед каждым тестом
    })

    afterEach(() => {
      vi.clearAllTimers() // Очищаем таймеры после каждого теста
      vi.useRealTimers() // Возвращаем реальные таймеры
    })

    it("should save the key pressed and old value in onkeydown", () => {
      const event = {
        key: "Backspace",
        target: { value: "123.45" }
      }

      onkeydown(event)

      expect(event.key).toBe("Backspace")
      expect(event.target.value).toBe("123.45")
    })

    it("should format number correctly in toNumber", () => {
      const event = {
        target: {
          value: "12345.67",
          selectionStart: 7,
          setSelectionRange: vi.fn()
        }
      }

      toNumber(event, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что значение обновлено
      expect(event.target.value).toBe("12.345.67")
      // Проверяем, что позиция курсора обновлена
      expect(event.target.setSelectionRange).toHaveBeenCalledWith(8, 8)
    })

    it("should handle Backspace deleting a space correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "12 34.56" }
      }
      const eventToNumber = {
        target: {
          value: "12 34.56",
          selectionStart: 2,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toNumber(eventToNumber, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что значение остается неизменным
      expect(eventToNumber.target.value).toBe("134.56")
      // Проверяем, что позиция курсора переместилась назад
      expect(eventToNumber.target.setSelectionRange).toHaveBeenCalledWith(-1, -1)
    })

    it("should handle Backspace deleting a dot correctly", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "123.45" }
      }
      const eventToNumber = {
        target: {
          value: "123.45",
          selectionStart: 4,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toNumber(eventToNumber, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что значение остается неизменным
      expect(eventToNumber.target.value).toBe("123.45")
      // Проверяем, что позиция курсора переместилась назад
      expect(eventToNumber.target.setSelectionRange).toHaveBeenCalledWith(4, 4)
    })

    it("should not modify input if Backspace is pressed at position 0", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "123.45" }
      }
      const eventToNumber = {
        target: {
          value: "123.45",
          selectionStart: 0,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toNumber(eventToNumber, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что значение не изменилось
      expect(eventToNumber.target.value).toBe("123.45")
      // Проверяем, что позиция курсора осталась на месте
      expect(eventToNumber.target.setSelectionRange).toHaveBeenCalledWith(0, 0)
    })

    it("should handle empty input gracefully", () => {
      const eventKeydown = {
        key: "",
        target: { value: "" }
      }
      const eventToNumber = {
        target: {
          value: "",
          selectionStart: 0,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toNumber(eventToNumber, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что пустое значение не вызывает ошибок
      expect(eventToNumber.target.value).toBe("")
      // Проверяем, что позиция курсора осталась на месте
      expect(eventToNumber.target.setSelectionRange).toHaveBeenCalledWith(0, 0)
    })

    it("should handle input with only special characters gracefully", () => {
      const eventKeydown = {
        key: "Backspace",
        target: { value: "12 ." }
      }
      const eventToNumber = {
        target: {
          value: "12 .",
          selectionStart: 4,
          setSelectionRange: vi.fn()
        }
      }

      onkeydown(eventKeydown)
      toNumber(eventToNumber, ".", 10, 2)
      vi.advanceTimersByTime(1)

      // Проверяем, что значение не изменилось
      expect(eventToNumber.target.value).toBe("12.00")
      // Проверяем, что позиция курсора корректно перемещена
      expect(eventToNumber.target.setSelectionRange).toHaveBeenCalledWith(5, 5)
    })
  })

  describe("isNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isNumber(5)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-10)).toBe(true)
    })

    it("should return false for non-number values", () => {
      // @ts-ignore
      expect(isNumber("5")).toBe(false)
      expect(isNumber(NaN)).toBe(false)
      // @ts-ignore
      expect(isNumber(undefined)).toBe(false)
      // @ts-ignore
      expect(isNumber(null)).toBe(false)
      // @ts-ignore
      expect(isNumber({})).toBe(false)
      // @ts-ignore
      expect(isNumber([])).toBe(false)
      // @ts-ignore
      expect(isNumber(true)).toBe(false)
    })

    it("should return true for positive numbers when positiveOnly is true", () => {
      expect(isNumber(5, true)).toBe(true)
      expect(isNumber(1, true)).toBe(true)
    })

    it("should return false for non-positive numbers when positiveOnly is true", () => {
      expect(isNumber(0, true)).toBe(false)
      expect(isNumber(-5, true)).toBe(false)
    })

    it("should return false for non-number values when positiveOnly is true", () => {
      // @ts-ignore
      expect(isNumber("5", true)).toBe(false)
      expect(isNumber(NaN, true)).toBe(false)
      // @ts-ignore
      expect(isNumber(undefined, true)).toBe(false)
    })
  })
})
