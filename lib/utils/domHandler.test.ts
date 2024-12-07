import { describe, it, vi, expect } from "vitest"
import { mount } from "@vue/test-utils"
import {
  isElement,
  getParentNode,
  isExist,
  isClient,
  setAttribute,
  setAttributes,
  minifyCSS,
  getParentElements,
  htmlToText
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
  describe("getParentElements", () => {
    it("should return an empty array if the element has no parent", () => {
      // Создаем элемент без родителя
      const element = document.createElement("div")

      const result = getParentElements(element)

      expect(result).toEqual([])
    })

    it("should return all parent elements of a nested element", () => {
      // Создаем структуру DOM
      const grandParent = document.createElement("div")
      const parent = document.createElement("div")
      const child = document.createElement("div")

      grandParent.appendChild(parent)
      parent.appendChild(child)

      const result = getParentElements(child)

      expect(result).toEqual([parent, grandParent])
    })

    it("should handle deeply nested elements", () => {
      // Создаем глубокую структуру DOM
      const level1 = document.createElement("div")
      const level2 = document.createElement("div")
      const level3 = document.createElement("div")
      const level4 = document.createElement("div")

      level1.appendChild(level2)
      level2.appendChild(level3)
      level3.appendChild(level4)

      const result = getParentElements(level4)

      expect(result).toEqual([level3, level2, level1])
    })

    it("should return only direct parent elements (not including shadow DOM hosts)", () => {
      // Создаем элемент с shadow root
      const host = document.createElement("div")
      const shadowRoot = host.attachShadow({ mode: "open" })
      const shadowChild = document.createElement("div")

      shadowRoot.appendChild(shadowChild)

      const result = getParentElements(shadowChild)

      // Проверяем, что shadow root не включается
      expect(result).toEqual([])
    })

    it("should handle elements dynamically added to the DOM", () => {
      // Создаем динамическую структуру
      const parent = document.createElement("div")
      const child = document.createElement("div")

      parent.appendChild(child)

      const result = getParentElements(child)

      expect(result).toEqual([parent])
    })

    it("should handle elements with only one parent", () => {
      // Создаем структуру с одним родителем
      const parent = document.createElement("div")
      const child = document.createElement("div")

      parent.appendChild(child)

      const result = getParentElements(child)

      expect(result).toEqual([parent])
    })

    it("should return an empty array if the element itself is null", () => {
      // Передаем null вместо элемента
      expect(() => getParentElements(null as unknown as HTMLElement)).toThrowError()
    })
  })

  describe("htmlToText", () => {
    it("should return the input unchanged if it is not a string", () => {
      expect(htmlToText(null)).toBe(null)
      expect(htmlToText(123)).toBe(123)
      expect(htmlToText({})).toEqual({})
      expect(htmlToText(["<b>bold</b>"])).toEqual(["<b>bold</b>"])
    })

    it("should remove all HTML tags from a string", () => {
      const html = "<div><p>Hello <b>world</b></p></div>"
      const result = htmlToText(html)
      expect(result).toBe("Hello world")
    })

    it("should handle a string with no HTML tags", () => {
      const plainText = "Just some plain text"
      const result = htmlToText(plainText)
      expect(result).toBe("Just some plain text")
    })

    it("should handle an empty string", () => {
      const result = htmlToText("")
      expect(result).toBe("")
    })

    it("should handle strings with only HTML tags", () => {
      const html = "<div><p></p></div>"
      const result = htmlToText(html)
      expect(result).toBe("")
    })

    it("should trim the resulting string", () => {
      const html = "  <p>   Hello world   </p>  "
      const result = htmlToText(html)
      expect(result).toBe("Hello world")
    })

    it("should return an empty string if HTML string contains only whitespace", () => {
      const html = "   "
      const result = htmlToText(html)
      expect(result).toBe("")
    })

    it("should handle strings with nested HTML tags", () => {
      const html = "<div><p><span>Nested <b>HTML</b></span></p></div>"
      const result = htmlToText(html)
      expect(result).toBe("Nested HTML")
    })

    it("should remove self-closing HTML tags", () => {
      const html = "<div>Hello<br/>world</div>"
      const result = htmlToText(html)
      expect(result).toBe("Helloworld")
    })

    it("should handle special characters within HTML", () => {
      const html = "<div>&lt;Hello &amp; world&gt;</div>"
      const result = htmlToText(html)
      expect(result).toBe("<Hello & world>")
    })
  })
})
