import { mount } from "@vue/test-utils"
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest"
import FishtVue from "fishtvue/config"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"

describe("FixWindow Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(FixWindow)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toMatchObject({
        modelValue: false,
        stylePosition: undefined,
        position: undefined,
        byCursor: undefined,
        eventOpen: undefined,
        eventClose: undefined
      })
    })

    it("opens when open() is called", async () => {
      const wrapper = mount(FixWindow)
      await wrapper.vm.open()
      expect(wrapper.vm.isOpen).toBe(true)
    })

    it("closes when close() is called", async () => {
      const wrapper = mount(FixWindow, {
        props: {
          modelValue: true
        }
      })

      await wrapper.vm.close()
      expect(wrapper.vm.isOpen).toBe(false)
    })

    it('emits "open" and "close" events', async () => {
      const wrapper = mount(FixWindow)
      const mockEvent = new MouseEvent("click")

      await wrapper.vm.open(mockEvent)
      expect(wrapper.emitted("open")).toBeTruthy()
      expect(wrapper.emitted("open")?.[0]).toEqual([mockEvent])

      await wrapper.vm.close(mockEvent)
      expect(wrapper.emitted("close")).toBeTruthy()
      expect(wrapper.emitted("close")?.[0]).toEqual([mockEvent])
    })

    it("updates position when updatePosition() is called", async () => {
      const wrapper = mount(FixWindow)
      const initialX = wrapper.vm.x
      const initialY = wrapper.vm.y

      await wrapper.vm.updatePosition()

      expect(wrapper.vm.x).toBe(initialX)
      expect(wrapper.vm.y).toBe(initialY)
    })

    it("renders slots correctly", () => {
      const wrapper = mount(FixWindow, {
        slots: {
          default: '<div class="slot-content">Slot Content</div>'
        }
      })

      const slot = wrapper.find(".slot-content")
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe("Slot Content")
    })

    it("applies correct position style based on props", () => {
      const wrapper = mount(FixWindow, {
        props: {
          position: "top-left"
        }
      })

      const fixWindowElement = wrapper.find("[data-fix-window]")
      expect(fixWindowElement.attributes("style")).toContain("top")
      expect(fixWindowElement.attributes("style")).toContain("left")
    })

    it("calls removeOpenListener, removeCloseListener, and removePositionListener on unmount", () => {
      const wrapper = mount(FixWindow)
      const elementSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
      const windowSpy = vi.spyOn(window, "removeEventListener")

      wrapper.unmount()
      expect(elementSpy.mock.lastCall?.[0]).toBe("mouseover")
      expect(windowSpy.mock.calls?.[0]?.[0]).toBe("mouseleave")
      expect(windowSpy.mock.calls?.[1]?.[0]).toBe("scroll")
      expect(windowSpy.mock.calls?.[2]?.[0]).toBe("resize")
    })

    it.each([
      {
        mode: "filled",
        expectedClass: [
          "fishtvue-fix-window",
          "flex",
          "items-center",
          "px-1",
          "border",
          "border-neutral-200",
          "dark:border-neutral-900",
          "text-zinc-600",
          "dark:text-zinc-400",
          "bg-stone-100",
          "dark:bg-stone-900",
          "rounded-md"
        ]
      },
      {
        mode: "outlined",
        expectedClass: [
          "fishtvue-fix-window",
          "flex",
          "items-center",
          "px-1",
          "border",
          "border-neutral-200",
          "dark:border-neutral-900",
          "text-zinc-600",
          "dark:text-zinc-400",
          "bg-white",
          "dark:bg-neutral-950",
          "rounded-md"
        ]
      },
      {
        mode: "underlined",
        expectedClass: [
          "fishtvue-fix-window",
          "flex",
          "items-center",
          "px-1",
          "border",
          "border-neutral-200",
          "dark:border-neutral-900",
          "text-zinc-600",
          "dark:text-zinc-400",
          "bg-stone-50",
          "dark:bg-stone-950"
        ]
      }
    ])("applies correct class for mode: $mode", ({ mode, expectedClass }) => {
      const wrapper = mount(FixWindow, {
        props: {
          mode
        }
      })
      const content = wrapper.find("[data-fix-window-content]")
      expect(content.classes()).toEqual(expectedClass)
    })

    it.each([
      { el: "#element-id", description: "as string selector" },
      { el: document.createElement("div"), description: "as HTMLElement" },
      { el: undefined, description: "not provided" }
    ])(`handles el prop correctly when $description`, ({ el }) => {
      document.body.innerHTML = `<div id="element-id"></div>`

      const wrapper = mount(FixWindow, {
        props: {
          el
        }
      })

      const expectedElement =
        typeof el === "string"
          ? document.querySelector(el)
          : el instanceof HTMLElement
            ? el
            : wrapper.vm.$el.parentElement

      expect(wrapper.vm.element).toBe(expectedElement)
    })

    const positions = ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"]

    it.each(positions)("applies correct position style for position: %s", (position) => {
      const wrapper = mount(FixWindow, {
        props: {
          position
        }
      })

      const fixWindowElement = wrapper.find("[data-fix-window]")
      expect(fixWindowElement.attributes("style")).toContain(
        position.includes("top") || position.includes("bottom") ? "top" : ""
      )
      expect(fixWindowElement.attributes("style")).toContain(
        position.includes("left") || position.includes("right") ? "left" : ""
      )
    })

    it.each([
      { eventOpen: "hover", expectEvent: "mouseover" },
      { eventOpen: "click", expectEvent: "click" },
      { eventOpen: "mousedown", expectEvent: "mousedown" },
      { eventOpen: "mouseup", expectEvent: "mouseup" },
      { eventOpen: "dblclick", expectEvent: "dblclick" },
      { eventOpen: "contextmenu", expectEvent: "contextmenu" },
      { eventOpen: "none", expectEvent: undefined }
    ])("handles eventOpen: $event with onUnmounted cleanup", async ({ eventOpen, expectEvent }) => {
      const wrapper = mount(FixWindow)
      const addOpenListenerSpy = vi.spyOn(wrapper.vm.element, "addEventListener")
      const removeOpenListenerSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
      await wrapper.setProps({ eventOpen: eventOpen })

      if (!(eventOpen === "hover" || eventOpen === "none"))
        expect(addOpenListenerSpy.mock.lastCall?.[0]).toBe(eventOpen)
      wrapper.unmount()
      expect(removeOpenListenerSpy.mock.lastCall?.[0]).toBe(expectEvent)
    })

    it.each([
      { eventClose: "hover", expectEvent: "mouseover" },
      { eventClose: "click", expectEvent: "mouseover" },
      {
        eventClose: "mousedown",
        expectEvent: "mouseover"
      },
      { eventClose: "mouseup", expectEvent: "mouseover" },
      {
        eventClose: "dblclick",
        expectEvent: "mouseover"
      },
      { eventClose: "contextmenu", expectEvent: "mouseover" },
      {
        eventClose: "none",
        expectEvent: "mouseover"
      }
    ])("handles eventClose: %s with onUnmounted cleanup", async ({ eventClose, expectEvent }) => {
      const wrapper = mount(FixWindow)
      const removeOpenListenerSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
      await wrapper.setProps({ eventClose })
      wrapper.unmount()
      expect(removeOpenListenerSpy.mock.lastCall?.[0]).toBe(expectEvent)
    })
    it("applies correct styles when marginPx is 0", () => {
      const wrapper = mount(FixWindow, {
        props: {
          marginPx: 0,
          position: "top-left" // Позиция для проверки стилей
        }
      })

      const fixWindowElement = wrapper.find("[data-fix-window]")
      const styles = fixWindowElement.attributes("style")

      // Проверяем, что стили границы не содержат margin
      expect(styles).not.toContain("border-top: 0px solid transparent")
      expect(styles).not.toContain("border-left: 0px solid transparent")
    })
    it("handles changes to scrollableEl prop (default -> string -> HTMLElement)", async () => {
      // Создаём HTML-элементы для теста
      document.body.innerHTML = `
    <div id="scrollable"></div>
  `

      const scrollableElement = document.getElementById("scrollable")

      const wrapper = mount(FixWindow, {
        props: {
          scrollableEl: undefined // Начальное значение
        }
      })

      // Проверяем, что scrollableEl изначально не задан
      expect(wrapper.vm.scrollableEl).toBeUndefined()

      // Изменяем scrollableEl на строку
      await wrapper.setProps({ scrollableEl: "#scrollable" })

      // Проверяем, что элемент корректно найден
      expect(wrapper.vm.scrollableEl).toBe(scrollableElement)

      // Изменяем scrollableEl на HTMLElement
      await wrapper.setProps({ scrollableEl: scrollableElement })

      // Проверяем, что scrollableEl правильно указывает на элемент
      expect(wrapper.vm.scrollableEl).toBe(scrollableElement)

      const scrollableElSpy = vi.spyOn(wrapper.vm.scrollableEl, "removeEventListener")
      wrapper.unmount()
      expect(scrollableElSpy.mock.lastCall?.[0]).toBe("resize")
    })
    it("prevents event propagation when stopOpenPropagation is true", async () => {
      const wrapper = mount(FixWindow, {
        props: {
          stopOpenPropagation: true,
          eventOpen: "click" // Используем событие click для теста
        }
      })

      const clickEvent = new MouseEvent("click", {
        bubbles: true, // Событие должно распространяться
        cancelable: true
      })

      const stopPropagationSpy = vi.spyOn(clickEvent, "stopImmediatePropagation") // Шпионим за методом остановки распространения

      // Эмитируем клик на элемент
      wrapper.vm.open(clickEvent)

      // Проверяем, что stopImmediatePropagation был вызван
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
    it("positions FixWindow at cursor click location and closes on outside click", async () => {
      vi.useFakeTimers()

      // Устанавливаем размер окна
      ;(window as any).innerWidth = 1920
      ;(window as any).innerHeight = 1080
      // Монтируем FixWindow в контейнер
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: {
          eventOpen: "click",
          byCursor: true,
          delay: 5
        }
      })
      vi.spyOn(wrapper.vm.element, "getBoundingClientRect").mockReturnValue({
        x: 500,
        y: 400,
        width: 150,
        height: 250,
        top: 400,
        right: 700,
        bottom: 650,
        left: 500
      })
      vi.spyOn(wrapper.vm.fixWindow, "getBoundingClientRect").mockReturnValue({
        x: 890,
        y: 540,
        width: 35,
        height: 42,
        top: 538,
        right: 925,
        bottom: 580,
        left: 890
      })

      const fixWindowElement = wrapper.find("[data-fix-window]")

      // Проверяем, что FixWindow изначально скрыт
      expect(wrapper.vm.isOpen).toBe(false)
      expect((fixWindowElement.element as any).style?.display).toBe("none")

      // Создаём событие клика в точке (50, 50) на div
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 50,
        clientY: 50
      })

      // Эмитируем событие клика
      document.querySelector("[data-v-app]")?.dispatchEvent(clickEvent)

      // Убеждаемся, что FixWindow не открылся мгновенно
      expect(wrapper.vm.isOpen).toBe(false)

      // Эмулируем задержку 600ms
      vi.advanceTimersByTime(600)

      // Проверяем, что FixWindow открылся в правильной позиции
      expect(wrapper.vm.isOpen).toBe(true)
      wrapper.vm.updatePosition()
      expect(wrapper.vm.x).toBe("32px")
      expect(wrapper.vm.y).toBe("8px")
      expect(fixWindowElement.exists()).toBe(true)

      // Эмитируем клик за пределами FixWindow
      const outsideClickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 500,
        clientY: 500
      })
      window.dispatchEvent(outsideClickEvent)

      // Проверяем, что FixWindow закрылся
      expect(wrapper.vm.isOpen).toBe(false)
      vi.clearAllTimers()
      vi.useRealTimers()
    })
  })
  describe("FixWindow Component - delay prop", () => {
    beforeEach(() => {
      vi.useFakeTimers() // Активируем фейковые таймеры перед каждым тестом
    })

    afterEach(() => {
      vi.clearAllTimers() // Очищаем все таймеры после каждого теста
      vi.useRealTimers() // Возвращаем реальное время после теста
    })

    it.each([
      { delay: 2, expectedDelayMs: 200 },
      { delay: 4, expectedDelayMs: 400 },
      { delay: 6, expectedDelayMs: 600 }
    ])("applies correct delay for value %i (%ims)", async ({ delay, expectedDelayMs }) => {
      const wrapper = mount(FixWindow, {
        props: { delay }
      })

      const timerSpy = vi.spyOn(global, "setInterval")

      // Вызываем метод open
      wrapper.vm.open()

      // Проверяем, что setInterval вызывается
      expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), 100)

      // Эмулируем выполнение таймера
      let elapsedTime = 0
      while (elapsedTime < expectedDelayMs) {
        elapsedTime += 100
        vi.advanceTimersByTime(100) // Эмулируем прохождение времени
      }
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            FixWindow: options
          }
        })
      }
    })

    it("applies global options correctly", () => {
      const appPlugin = createAppWithFishtVue({
        position: "bottom-right",
        byCursor: true,
        closeButton: true
      })

      const wrapper = mount(FixWindow, {
        global: {
          plugins: [appPlugin]
        }
      })

      expect(wrapper.vm.position).toBe("bottom-right")
      expect(wrapper.vm.byCursor).toBe(true)
      expect(wrapper.vm.isCloseButton).toBe(true)
    })

    it("overrides global options with local props", () => {
      const appPlugin = createAppWithFishtVue({
        position: "top-left",
        byCursor: false
      })

      const wrapper = mount(FixWindow, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          position: "bottom-right",
          byCursor: true
        }
      })

      expect(wrapper.vm.position).toBe("bottom-right")
      expect(wrapper.vm.byCursor).toBe(true)
    })

    it("renders close button if closeButton prop or global option is true", () => {
      const appPlugin = createAppWithFishtVue({
        closeButton: true
      })

      const wrapper = mount(FixWindow, {
        global: {
          plugins: [appPlugin]
        }
      })

      const closeButton = wrapper.find("button")
      expect(closeButton.exists()).toBe(true)
    })
  })
})
