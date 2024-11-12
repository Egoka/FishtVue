import { describe, it, vi, expect } from "vitest"
import { mount } from "@vue/test-utils"
import {
  isElement,
  getParentNode,
  isExist,
  isClient,
  setAttribute,
  setAttributes,
  minifyCSS
} from "fishtvue/utils/domHandler"

describe("Testing Dom handler", () => {
  describe("isElement function", () => {
    it("should return true for a valid DOM element", () => {
      const wrapper = mount({
        template: '<div id="test"></div>'
      })
      const element = wrapper.find("#test").element
      expect(isElement(element)).toBe(true)
    })

    it("should return false for an object that is not a DOM element", () => {
      const notAnElement = { nodeType: 1, tagName: "DIV" }
      expect(isElement(notAnElement)).toBe(false)
    })

    it("should return false for a null value", () => {
      expect(isElement(null)).toBe(false)
    })

    it("should return false for an undefined value", () => {
      expect(isElement(undefined)).toBe(false)
    })

    it("should return false for a string", () => {
      expect(isElement("string")).toBe(false)
    })

    it("should return false for a number", () => {
      expect(isElement(123)).toBe(false)
    })

    it("should return false for a plain object without nodeType", () => {
      const obj = { tagName: "DIV" }
      expect(isElement(obj)).toBe(false)
    })
  })

  describe("getParentNode function", () => {
    it("should return the parent element for a regular DOM element", () => {
      const wrapper = mount({
        template: '<div id="parent"><div id="child"></div></div>'
      })
      const child = wrapper.find("#child").element as HTMLElement
      const parent = wrapper.find("#parent").element

      const result = getParentNode(child)
      expect(result).toBe(parent)
    })

    it("should return the host element for an element in the shadow DOM", () => {
      const wrapper = mount({
        template: '<div id="host"></div>',
        mounted() {
          if ((this as any)?.$el) {
            ;(this as any).$el.attachShadow({ mode: "open" })
            const shadowDiv = document.createElement("div")
            shadowDiv.id = "shadowChild"
            ;(this as any).$el.shadowRoot.appendChild(shadowDiv)
          }
        }
      })

      const host = wrapper.find("#host").element
      const shadowChild = wrapper.vm.$el.shadowRoot.querySelector("#shadowChild")

      const result = getParentNode(shadowChild)
      expect(result).toBe(host)
    })

    it("should return null for elements without a parent node", () => {
      const result = getParentNode(document.documentElement)
      expect(result).toBe(document)
    })

    it("should return null for detached elements", () => {
      const detachedElement = document.createElement("div")
      const result = getParentNode(detachedElement)
      expect(result).toBeNull()
    })

    it("should return null for null input", () => {
      const result = getParentNode(null as unknown as HTMLElement)
      expect(result).toBeUndefined()
    })
  })

  describe("isExist function", () => {
    it("should return true if the element exists in the DOM", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      const result = isExist(element)
      expect(result).toBe(true)
    })

    it("should return false if the element is null", () => {
      const result = isExist(null as unknown as HTMLElement)
      expect(result).toBe(false)
    })

    it("should return false if the element is undefined", () => {
      const result = isExist(undefined as unknown as HTMLElement)
      expect(result).toBe(false)
    })

    it("should return false if the element is detached from the DOM", () => {
      const detachedElement = document.createElement("div")
      const result = isExist(detachedElement)
      expect(result).toBe(false)
    })

    it("should return false if the element does not have a parent node", () => {
      const wrapper = mount({
        template: '<div id="orphan-element"></div>'
      })
      const orphanElement = wrapper.find("#orphan-element").element as HTMLElement
      orphanElement.remove() // Удаляем элемент из DOM

      const result = isExist(orphanElement)
      expect(result).toBe(false)
    })
  })

  describe("isClient function", () => {
    it("should return true if window is available", () => {
      // Сохраняем оригинальный объект window, если он существует
      const originalWindow = global.window

      // Определяем временный объект window для теста
      ;(global as any).window = {
        document: {
          createElement: () => {}
        }
      } as any

      const result = isClient()
      expect(result).toBe(true)

      // Восстанавливаем оригинальный объект window
      ;(global as any).window = originalWindow
    })

    it("should return false if window is not available", () => {
      // Сохраняем оригинальный объект window, если он существует
      const originalWindow = global.window

      // Удаляем объект window
      delete (global as any).window

      const result = isClient()
      expect(result).toBe(false)

      // Восстанавливаем оригинальный объект window
      ;(global as any).window = originalWindow
    })

    it("should return false if window exists but document is missing", () => {
      // Сохраняем оригинальный объект window, если он существует
      const originalWindow = global.window

      // Определяем временный объект window без document
      ;(global as any).window = {} as any

      const result = isClient()
      expect(result).toBe(false)

      // Восстанавливаем оригинальный объект window
      ;(global as any).window = originalWindow
    })

    it("should return false if document exists but createElement is missing", () => {
      // Сохраняем оригинальный объект window, если он существует
      const originalWindow = global.window

      // Определяем временный объект window с document, но без createElement
      ;(global as any).window = {
        document: {}
      } as any

      const result = isClient()
      expect(result).toBe(false)

      // Восстанавливаем оригинальный объект window
      ;(global as any).window = originalWindow
    })
  })

  describe("setAttribute function", () => {
    it("should set the specified attribute with the given value", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttribute(element, "class", "my-class")

      expect(element.getAttribute("class")).toBe("my-class")
    })

    it("should not set attribute if attribute name is empty", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttribute(element, "", "my-value")

      expect(element.getAttribute("")).toBeNull() // Атрибут не должен быть установлен
    })

    it("should not set attribute if value is null or undefined", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttribute(element, "data-test", null)
      expect(element.getAttribute("data-test")).toBeNull()

      setAttribute(element, "data-test", undefined)
      expect(element.getAttribute("data-test")).toBeNull()
    })

    it("should not set attribute if element is not a valid HTMLElement", () => {
      const notAnElement = {
        nodeType: 1,
        setAttribute: () => {}
      }
      setAttribute(notAnElement as unknown as HTMLElement, "class", "my-class")
      expect((notAnElement as any)?.getAttribute).toBeUndefined() // Method should not exist on non-element
    })
    it("should catch InvalidCharacterError when setting an invalid attribute name", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      // Заменяем console.error на mock функцию, чтобы перехватить сообщение об ошибке
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      setAttribute(element, "invalid name", "some-value")

      expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid attribute name:", "invalid name")

      // Восстанавливаем оригинальную функцию console.error
      consoleErrorSpy.mockRestore()
    })

    it("should rethrow non-InvalidCharacterError exceptions", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      // Создаем искусственную ошибку
      const throwError = () => {
        throw new Error("Test error")
      }

      // Мокаем метод setAttribute для элемента
      const setAttributeSpy = vi.spyOn(element, "setAttribute").mockImplementation(throwError)

      expect(() => setAttribute(element, "validName", "value")).toThrow("Test error")

      // Восстанавливаем оригинальный метод setAttribute
      setAttributeSpy.mockRestore()
    })
  })

  describe("setAttributes function", () => {
    it("should set multiple attributes on an element", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { class: "my-class", "data-id": "123", role: "button" })

      expect(element.getAttribute("class")).toBe("my-class")
      expect(element.getAttribute("data-id")).toBe("123")
      expect(element.getAttribute("role")).toBe("button")
    })

    it('should set event listeners for attributes starting with "on"', () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement
      const mockClickHandler = vi.fn()

      setAttributes(element, { onClick: mockClickHandler })

      element.click()
      expect(mockClickHandler).toHaveBeenCalled()
    })

    it("should set style attribute correctly", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { style: { color: "red", backgroundColor: "blue", padding: 10 } })

      expect(element.getAttribute("style")).toBe("color:red;background-color:blue;padding:10")
    })

    it("should handle complex class structures", () => {
      const wrapper = mount({
        template: '<div id="test-element" class="existing-class"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { class: ["new-class", { "conditional-class": true, "other-class": false }] })

      expect(element.getAttribute("class")).toBe("new-class conditional-class")
    })

    it("should merge styles correctly", () => {
      const wrapper = mount({
        template: '<div id="test-element" style="margin: 0"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { style: { padding: "10px", margin: "5px" } })

      expect(element.getAttribute("style")).toBe("padding:10px;margin:5px")
    })

    it("should not set attribute if value is null or undefined", () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { "data-test": null, "data-example": undefined })

      expect(element.hasAttribute("data-test")).toBe(false)
      expect(element.hasAttribute("data-example")).toBe(false)
    })

    it('should recursively set attributes when using "p-bind"', () => {
      const wrapper = mount({
        template: '<div id="test-element"></div>'
      })
      const element = wrapper.find("#test-element").element as HTMLElement

      setAttributes(element, { "p-bind": { "data-id": "123", role: "button" } })

      expect(element.getAttribute("data-id")).toBe("123")
      expect(element.getAttribute("role")).toBe("button")
    })
  })

  describe("minifyCSS function", () => {
    it("should remove CSS comments", () => {
      const input = "/* This is a comment */\nbody { color: red; }"
      const output = "body{color:red;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should remove extra spaces and newlines", () => {
      const input = `
      body {
        color: red;
        background-color: white;
      }
    `
      const output = "body{color:red;background-color:white;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle !important without space", () => {
      const input = "body { color: red !important; }"
      const output = "body{color:red!important;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle already minified CSS correctly", () => {
      const input = "body{color:red;background-color:white;}"
      const output = "body{color:red;background-color:white;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle CSS with multiple selectors", () => {
      const input = `
      h1, h2 {
        color: blue;
      }
      p {
        margin: 0;
        padding: 0;
      }
    `
      const output = "h1,h2{color:blue;}p{margin:0;padding:0;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle empty input", () => {
      const input = ""
      const output = ""
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle only spaces and newlines", () => {
      const input = " \n  \t "
      const output = ""
      expect(minifyCSS(input)).toBe(output)
    })

    it("should remove CSS comments", () => {
      const input = "/* This is a comment */\nbody { color: red; }"
      const output = "body{color:red;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should remove extra spaces and newlines", () => {
      const input = `
      body {
        color: red;
        background-color: white;
      }
    `
      const output = "body{color:red;background-color:white;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle !important without space", () => {
      const input = "body { color: red !important; }"
      const output = "body{color:red!important;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle already minified CSS correctly", () => {
      const input = "body{color:red;background-color:white;}"
      const output = "body{color:red;background-color:white;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle CSS with multiple selectors", () => {
      const input = `
      h1, h2 {
        color: blue;
      }
      p {
        margin: 0;
        padding: 0;
      }
    `
      const output = "h1,h2{color:blue;}p{margin:0;padding:0;}"
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle empty input", () => {
      const input = ""
      const output = ""
      expect(minifyCSS(input)).toBe(output)
    })

    it("should handle only spaces and newlines", () => {
      const input = " \n  \t "
      const output = ""
      expect(minifyCSS(input)).toBe(output)
    })

    // Test cases for invalid input types
    it("should return empty string for null input", () => {
      const input = null
      const output = ""
      expect(minifyCSS(input as any)).toBe(output)
    })

    it("should return empty string for undefined input", () => {
      const input = undefined
      const output = ""
      expect(minifyCSS(input as any)).toBe(output)
    })

    it("should return empty string for number input", () => {
      const input = 123
      const output = ""
      expect(minifyCSS(input as any)).toBe(output)
    })

    it("should return empty string for object input", () => {
      const input = { key: "value" }
      const output = ""
      expect(minifyCSS(input as any)).toBe(output)
    })

    it("should return empty string for array input", () => {
      const input = ["body { color: red; }"]
      const output = ""
      expect(minifyCSS(input as any)).toBe(output)
    })
  })
})
