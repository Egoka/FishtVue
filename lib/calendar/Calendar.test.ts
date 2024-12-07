import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import Calendar from "fishtvue/calendar/Calendar.vue"
import { nextTick } from "vue"

describe("Calendar Component", () => {
  describe("Basic functionality", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Calendar)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles open and close calendar methods", async () => {
      const wrapper = mount(Calendar)

      const calendarRef: any = wrapper.vm

      // Initially calendar should not be open
      expect(calendarRef.isOpenPicker).toBe(false)

      // Open calendar
      calendarRef.openCalendar()
      expect(calendarRef.isOpenPicker).toBe(true)

      // Close calendar
      calendarRef.closeCalendar()
      expect(calendarRef.isOpenPicker).toBe(false)
    })

    it("clears the calendar picker value", async () => {
      const wrapper = mount(Calendar, {
        props: {
          modelValue: "2024-11-23"
        }
      })

      const calendarRef: any = wrapper.vm

      // Clear value
      calendarRef.clearDataPicker()
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(null)
    })
    it("renders the correct placeholder when no value is provided", () => {
      const placeholderText = "Select a date"
      const wrapper = mount(Calendar, {
        props: {
          placeholder: placeholderText
        }
      })

      // Открываем календарь
      const inputElement = wrapper.find("[data-calendar] div")
      expect(inputElement.exists()).toBe(true)

      // Проверяем, отображается ли placeholder
      expect(wrapper.attributes("placeholder")).toBe(placeholderText)
    })

    it("does not display placeholder when value is provided", async () => {
      const placeholderText = "Select a date"
      const value = "2024-11-30"

      const wrapper = mount(Calendar, {
        props: {
          placeholder: placeholderText,
          modelValue: value
        }
      })
      await nextTick()
      // Открываем календарь
      const inputElement = wrapper.find("[data-calendar]")
      await nextTick()
      expect(inputElement.exists()).toBe(true)

      // Проверяем, что placeholder не отображается
      expect(inputElement.text()).not.toContain(placeholderText)

      // Проверяем, что отображается значение
      expect(inputElement.text()).toContain("30 November 2024")
    })

    describe("Calendar Component - Mode Variants", () => {
      const modes = ["outlined", "filled", "underlined"]

      it.each(modes)("renders correctly with mode: %s", (mode) => {
        const wrapper = mount(Calendar, {
          props: {
            mode,
            placeholder: "Select a date"
          }
        })

        const layout = wrapper.find("[data-calendar-picker]")
        expect(layout.exists()).toBe(true)

        // Проверяем, что класс для текущего режима установлен
        if (mode === "outlined") {
          expect(layout.classes().join(" ")).toContain("border-gray-300")
          expect(layout.classes().join(" ")).toContain("dark:border-gray-600")
        } else if (mode === "filled") {
          expect(layout.classes().join(" ")).toContain("bg-stone-100")
          expect(layout.classes().join(" ")).toContain("dark:bg-stone-900")
        } else if (mode === "underlined") {
          expect(layout.classes().join(" ")).toContain("border-b")
          expect(layout.classes().join(" ")).toContain("dark:border-gray-700")
        }
      })
    })
    describe("Calendar Component - Date Selection", () => {
      it("triggers update:isInvalid, update:modelValue, and change:modelValue events on date selection", async () => {
        const wrapper = mount(Calendar, {
          props: {
            clear: true,
            modelValue: null,
            isInvalid: true,
            paramsDatePicker: {
              isRange: false,
              mask: "DD.MM.YYYY"
            }
          }
        })

        // Найти элемент календаря
        const calendarTrigger = wrapper.find("[data-calendar]")
        expect(calendarTrigger.exists()).toBe(true)

        // Кликнуть по элементу для открытия календаря
        await calendarTrigger.trigger("click")

        // Найти и выбрать дату из календаря
        const dateElement = wrapper.find(".vc-pane-container .vc-day:not(.vc-disabled) .vc-day-content")
        expect(dateElement.exists()).toBe(true)
        // Нажать на дату
        await dateElement.trigger("click")
        // Проверить события
        expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])

        expect(wrapper.emitted("update:modelValue")).toBeTruthy()
        const emittedModelValue = wrapper.emitted("update:modelValue")?.[0][0]
        expect(typeof emittedModelValue).toBe("object") // Должна быть строка формата "DD.MM.YYYY"

        expect(wrapper.emitted("change:modelValue")).toBeTruthy()
        const emittedChangeValue = wrapper.emitted("change:modelValue")?.[0][0]
        expect(emittedChangeValue).toEqual(emittedModelValue) // Значения должны совпадать
        const clearButton = wrapper.find("[data-input-layout-clear] i")
        await clearButton.trigger("click")
        expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
        expect(wrapper.emitted("change:modelValue")?.[2][0]).toBeUndefined()
      })
    })
  })

  describe("Slots", () => {
    it("renders slot content in the footer", () => {
      const wrapper = mount(Calendar, {
        slots: {
          footerPicker: "<div class='footer-slot'>Footer Content</div>"
        }
      })

      const footerSlot = wrapper.find(".footer-slot")
      expect(footerSlot.exists()).toBe(true)
      expect(footerSlot.text()).toBe("Footer Content")
    })

    it("renders slot content in before and after", () => {
      const wrapper = mount(Calendar, {
        slots: {
          before: "<div class='before-slot'>Before Content</div>",
          after: "<div class='after-slot'>After Content</div>"
        }
      })

      const beforeSlot = wrapper.find(".before-slot")
      const afterSlot = wrapper.find(".after-slot")

      expect(beforeSlot.exists()).toBe(true)
      expect(beforeSlot.text()).toBe("Before Content")

      expect(afterSlot.exists()).toBe(true)
      expect(afterSlot.text()).toBe("After Content")
    })
  })

  describe("Date range selection", () => {
    it("renders correct range dates", async () => {
      const wrapper = mount(Calendar, {
        props: {
          modelValue: { start: "2024-11-23", end: "2024-11-25" },
          paramsDatePicker: {
            isRange: true,
            mask: "YYYY-MM-DD"
          }
        }
      })
      await nextTick()
      const dateDisplay = wrapper.find("[data-calendar]")
      await nextTick()
      expect(dateDisplay.text()).toContain("2024-11-23")
      expect(dateDisplay.text()).toContain("2024-11-25")
    })
  })

  describe("Masks and placeholders", () => {
    it("applies mask correctly", async () => {
      vi.useFakeTimers()
      const wrapper = mount(Calendar, {
        props: {
          modelValue: "2024-11-23",
          paramsDatePicker: {
            mask: "DD.MM.YYYY"
          }
        }
      })
      await nextTick()
      const dateDisplay = wrapper.find("[data-calendar]")
      await nextTick()
      expect(dateDisplay.text()).toBe("23.11.2024")
      vi.clearAllTimers()
      vi.useRealTimers()
    })

    it("renders placeholder if no value is provided", () => {
      const wrapper = mount(Calendar, {
        props: {
          placeholder: "Select a date"
        }
      })

      const dateDisplay = wrapper.find("[data-input-layout]")
      expect(dateDisplay.attributes("placeholder")).toBe("Select a date")
    })
  })
})
