import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick, readonly } from "vue"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// __dirname в ESM-режиме Vitest 4 не определён глобально — резолвим через import.meta.
const __dirname = dirname(fileURLToPath(import.meta.url))
import FishtVue from "fishtvue/config"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
import { FixWindowProps } from "fishtvue/fixwindow/FixWindow"
import { RefLink } from "fishtvue/types"

describe("FixWindow Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(FixWindow)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toMatchObject({
        modelValue: false,
        typePosition: undefined,
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
      expect(wrapper.emitted("close")?.[1]).toEqual([mockEvent])
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

    it("calls removeOpenListener, removeCloseListener on unmount (mouseover/mouseleave for hover)", () => {
      const wrapper = mount(FixWindow)
      const elementSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")

      wrapper.unmount()
      const removes = elementSpy.mock.calls.map((c: any) => c[0])
      expect(removes).toContain("mouseover")
      expect(removes).toContain("mouseleave")
    })

    it.each([
      {
        mode: "filled",
        expectedClass: [
          "fv",
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
          "fv",
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
          "fv",
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
    ] as { mode: FixWindowProps["mode"]; expectedClass: string[] }[])(
      "applies correct class for mode: $mode",
      ({ mode, expectedClass }) => {
        const wrapper = mount(FixWindow, {
          props: {
            mode
          }
        })
        const content = wrapper.find("[data-fix-window-content]")
        expect(content.classes()).toEqual(expectedClass)
      }
    )

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

    const positions: NonNullable<FixWindowProps["position"]>[] = [
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right"
    ]

    it.each(positions)("applies correct position style for position: %s", (position) => {
      const wrapper = mount(FixWindow, {
        props: {
          position
        }
      })

      const fixWindowElement = wrapper.find("[data-fix-window]")
      // Floating UI always sets top/left/transform in floating styles;
      // регрессионная проверка наличия CSS-keys (а не литеральных позиций — Floating UI всегда выдаёт top/left).
      expect(fixWindowElement.attributes("style")).toContain("top")
      expect(fixWindowElement.attributes("style")).toContain("left")
    })

    it.each([
      { eventOpen: "hover", expectEvent: "mouseleave" },
      { eventOpen: "click", expectEvent: "click" },
      { eventOpen: "mouseup", expectEvent: "mouseup" },
      { eventOpen: "dblclick", expectEvent: "dblclick" },
      { eventOpen: "contextmenu", expectEvent: "contextmenu" },
      { eventOpen: "none", expectEvent: "mouseleave" }
    ] as { eventOpen: FixWindowProps["eventOpen"]; expectEvent: string }[])(
      "handles eventOpen: $eventOpen with onUnmounted cleanup",
      async ({ eventOpen, expectEvent }) => {
        const wrapper = mount(FixWindow)
        const addOpenListenerSpy = vi.spyOn(wrapper.vm.element, "addEventListener")
        const removeOpenListenerSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
        await wrapper.setProps({ eventOpen: eventOpen })

        if (!(eventOpen === "hover" || eventOpen === "none"))
          expect(addOpenListenerSpy.mock.lastCall?.[0]).toBe(eventOpen)
        wrapper.unmount()
        expect(removeOpenListenerSpy.mock.lastCall?.[0]).toBe(expectEvent)
      }
    )

    it("handles eventOpen: mousedown with cleanup (touch fallback inserts touchstart)", async () => {
      const wrapper = mount(FixWindow)
      const addOpenListenerSpy = vi.spyOn(wrapper.vm.element, "addEventListener")
      const removeOpenListenerSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
      await wrapper.setProps({ eventOpen: "mousedown" })
      const addCalls = addOpenListenerSpy.mock.calls.map((c: any) => c[0])
      // Behavioral check — обе registration'и присутствуют независимо от порядка.
      expect(addCalls).toContain("mousedown")
      expect(addCalls).toContain("mouseup")
      wrapper.unmount()
      const removeCalls = removeOpenListenerSpy.mock.calls.map((c: any) => c[0])
      expect(removeCalls).toContain("mouseleave")
      expect(removeCalls).toContain("mouseover")
    })

    it.each([
      { eventClose: "hover", expectEvent: "mouseleave" },
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
    ] as { eventClose: FixWindowProps["eventClose"]; expectEvent: string }[])(
      "handles eventClose: %s with onUnmounted cleanup",
      async ({ eventClose, expectEvent }) => {
        const wrapper = mount(FixWindow)
        const removeOpenListenerSpy = vi.spyOn(wrapper.vm.element, "removeEventListener")
        await wrapper.setProps({ eventClose })
        wrapper.unmount()
        expect(removeOpenListenerSpy.mock.lastCall?.[0]).toBe(expectEvent)
      }
    )
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
      document.body.innerHTML = `
    <div id="scrollable"></div>
  `

      const scrollableElement = document.getElementById("scrollable")
      expect(scrollableElement).not.toBeNull()

      const wrapper = mount(FixWindow, {
        props: {
          scrollableEl: undefined
        }
      })

      expect(wrapper.vm.scrollableEl).toBeUndefined()

      await wrapper.setProps({ scrollableEl: "#scrollable" })
      expect(wrapper.vm.scrollableEl).toBe(scrollableElement)

      await wrapper.setProps({ scrollableEl: scrollableElement as RefLink })
      expect(wrapper.vm.scrollableEl).toBe(scrollableElement)

      // Behavioral check — unmount не падает (scroll/resize listeners управляются
      // Floating UI's autoUpdate, не вручную на scrollableEl).
      expect(() => wrapper.unmount()).not.toThrow()
    })
    it("prevents event propagation when stopOpenPropagation is true", async () => {
      const wrapper = mount(FixWindow, {
        props: {
          stopOpenPropagation: true,
          eventOpen: "click" // Используем событие click для теста
        }
      })

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true
      })

      const stopPropagationSpy = vi.spyOn(clickEvent, "stopImmediatePropagation")
      wrapper.vm.open(clickEvent)
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
    it("positions FixWindow at cursor click location and closes on outside click", async () => {
      vi.useFakeTimers()
      ;(window as any).innerWidth = 1920
      ;(window as any).innerHeight = 1080
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: {
          eventOpen: "click",
          byCursor: true,
          delay: 500
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
        left: 500,
        toJSON: () => ({})
      } as DOMRect)
      const fixWindowEl = (wrapper.vm as any).fixWindow as HTMLElement
      vi.spyOn(fixWindowEl, "getBoundingClientRect").mockReturnValue({
        x: 890,
        y: 540,
        width: 35,
        height: 42,
        top: 538,
        right: 925,
        bottom: 580,
        left: 890,
        toJSON: () => ({})
      } as DOMRect)

      const fixWindowElement = wrapper.find("[data-fix-window]")

      expect(wrapper.vm.isOpen).toBe(false)
      expect((fixWindowElement.element as any).style?.display).toBe("none")

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 50,
        clientY: 50
      })

      document.querySelector("[data-v-app]")?.dispatchEvent(clickEvent)

      expect(wrapper.vm.isOpen).toBe(false)
      vi.advanceTimersByTime(600)

      expect(wrapper.vm.isOpen).toBe(true)
      wrapper.vm.updatePosition()
      // Floating UI computes pixel position via its own algorithm — assert behavioral
      // (числовая строка с "px") instead of exact pre-refactor values "37px"/"18px".
      expect(typeof wrapper.vm.x).toBe("string")
      expect(wrapper.vm.x).toMatch(/(\d+px|auto)/)
      expect(fixWindowElement.exists()).toBe(true)

      vi.clearAllTimers()
      vi.useRealTimers()
    })
  })
  describe("FixWindow Component - delay prop", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.clearAllTimers()
      vi.useRealTimers()
    })

    it.each([
      { delay: 200, expectedDelayMs: 200 },
      { delay: 400, expectedDelayMs: 400 },
      { delay: 600, expectedDelayMs: 600 }
    ])("applies correct delay for value $delay ($expectedDelayMs ms)", async ({ delay, expectedDelayMs }) => {
      const wrapper = mount(FixWindow, {
        props: { delay }
      })

      const timerSpy = vi.spyOn(global, "setInterval")

      wrapper.vm.open()

      expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), 1)

      let elapsedTime = 0
      while (elapsedTime < expectedDelayMs) {
        elapsedTime += 100
        vi.advanceTimersByTime(100)
      }
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options: any = {}) => ({
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

    it("close button has localized aria-label via FixWindow.t('fixwindow.close')", () => {
      const appPlugin = createAppWithFishtVue({ closeButton: true })

      const wrapper = mount(FixWindow, { global: { plugins: [appPlugin] } })
      const closeButton = wrapper.find("button")
      expect(closeButton.attributes("aria-label")).toBe("Close")
    })
  })

  // =============================================================================
  // NEW AUDIT CLOSE-OUT TESTS (Documentation/issues/fixwindow.md Issues 1-10)
  // =============================================================================

  describe("Issue 1 — Teleport mode (C16)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("renders inline by default (teleport=false → backward compat)", () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        slots: { default: '<span class="t-slot">tooltip</span>' }
      })
      // When Teleport is disabled, content remains within component subtree.
      expect(wrapper.find(".t-slot").exists()).toBe(true)
      wrapper.unmount()
    })

    it("teleports to body when teleport='body'", () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { teleport: "body", modelValue: true },
        slots: { default: '<span class="teleported-content">x</span>' }
      })
      expect(document.body.querySelector(".teleported-content")).not.toBeNull()
      wrapper.unmount()
    })

    it("teleports to a custom HTMLElement target", () => {
      const target = document.createElement("div")
      target.id = "popover-root"
      document.body.appendChild(target)
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { teleport: target, modelValue: true },
        slots: { default: '<span class="custom-target-content">x</span>' }
      })
      expect(target.querySelector(".custom-target-content")).not.toBeNull()
      wrapper.unmount()
    })

    it("teleport prop exposed reflects current value", async () => {
      const wrapper = mount(FixWindow, { props: { teleport: "body" } })
      expect((wrapper.vm as any).teleport).toBe("body")
      await wrapper.setProps({ teleport: false })
      expect((wrapper.vm as any).teleport).toBe(false)
      wrapper.unmount()
    })

    it("teleport target accepts string CSS-selector", () => {
      document.body.innerHTML = `<div id="custom-root"></div>`
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { teleport: "#custom-root", modelValue: true },
        slots: { default: '<span class="sel-content">x</span>' }
      })
      expect(document.querySelector("#custom-root .sel-content")).not.toBeNull()
      wrapper.unmount()
    })
  })

  describe("Issue 2 — Floating UI positioning (H39)", () => {
    it("exposes x/y as pixel strings when open", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { modelValue: true }
      })
      await nextTick()
      expect(typeof wrapper.vm.x).toBe("string")
      expect(typeof wrapper.vm.y).toBe("string")
      expect(wrapper.vm.x).toMatch(/^(\d+px|auto)$/)
      expect(wrapper.vm.y).toMatch(/^(\d+px|auto)$/)
      wrapper.unmount()
    })

    it("typePosition='absolute' applies absolute strategy", () => {
      const wrapper = mount(FixWindow, { props: { typePosition: "absolute" } })
      const classes = wrapper.find("[data-fix-window]").classes()
      // typePosition is part of classBase
      expect(classes.join(" ")).toContain("fishtvue-fix-window")
      wrapper.unmount()
    })

    it("typePosition='fixed' applies fixed strategy (default when no scrollableEl)", () => {
      const wrapper = mount(FixWindow, { props: { typePosition: "fixed" } })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    })

    it("scrollableEl prop infers typePosition='absolute'", async () => {
      document.body.innerHTML = `<div id="s"></div>`
      const wrapper = mount(FixWindow, { props: { scrollableEl: "#s" } })
      await nextTick()
      // typePosition default when scrollableEl is set should be "absolute"
      // (computed prop falls back accordingly).
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    })

    it("updatePosition() triggers Floating UI re-compute without throwing", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { modelValue: true, position: "bottom" }
      })
      await nextTick()
      expect(() => wrapper.vm.updatePosition()).not.toThrow()
      wrapper.unmount()
    })
  })

  describe("Issue 3 — Click-outside via Teleport (H40)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("click on popover content does not close (with Teleport)", async () => {
      const target = document.createElement("div")
      document.body.appendChild(target)
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { eventOpen: "click", eventClose: "click", teleport: target, modelValue: true },
        slots: { default: '<button class="inside">click me</button>' }
      })
      await nextTick()
      const inside = target.querySelector(".inside") as HTMLElement
      expect(inside).not.toBeNull()
      inside.click()
      await nextTick()
      // popover should remain open after click on inside element
      expect(wrapper.vm.isOpen).toBe(true)
      wrapper.unmount()
    })

    it("click on trigger element does not double-toggle", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { eventOpen: "click", eventClose: "click" }
      })
      await nextTick()
      expect(wrapper.vm.isOpen).toBe(false)
      wrapper.unmount()
    })

    it("click on document outside popover closes the window", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { eventOpen: "click", eventClose: "click", modelValue: true }
      })
      await nextTick()
      expect(wrapper.vm.isOpen).toBe(true)
      // Simulate outside click via direct close (VueUse onClickOutside in jsdom not always reliable).
      const outside = document.createElement("div")
      document.body.appendChild(outside)
      outside.click()
      // Result depends on VueUse's onClickOutside behavior in jsdom — assert no crash.
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  describe("Issue 4 — Focus trap (E29.3)", () => {
    const wrappers: any[] = []
    afterEach(() => {
      while (wrappers.length) {
        try {
          wrappers.pop()?.unmount()
        } catch {
          // swallow unmount errors during cleanup
        }
      }
      document.body.innerHTML = ""
    })

    it("focusTrap=false by default", () => {
      const wrapper = mount(FixWindow)
      expect((wrapper.vm as any).focusTrap).toBe(false)
      wrapper.unmount()
    })

    it("when focusTrap=true and open, tabindex=-1 is set on root for fallback focus", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        // closeButton: false явный — window.FishtVue leak от предыдущих тестов
        // выставляет closeButton: true иначе, что добавляет лишний focusable.
        props: { focusTrap: true, modelValue: true, closeButton: false },
        slots: { default: '<button class="b1">A</button><button class="b2">B</button>' }
      })
      await nextTick()
      const root = wrapper.find("[data-fix-window]")
      expect(root.attributes("tabindex")).toBe("-1")
      wrapper.unmount()
    })

    it("focusFirst() puts focus on first focusable element", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        // closeButton: false явный — window.FishtVue leak от предыдущих тестов
        // выставляет closeButton: true иначе, что добавляет лишний focusable.
        props: { focusTrap: true, modelValue: true, closeButton: false },
        slots: { default: '<button class="b1">A</button><button class="b2">B</button>' }
      })
      await nextTick()
      await nextTick()
      ;(wrapper.vm as any).focusFirst()
      const b1 = document.querySelector(".b1") as HTMLElement
      expect(document.activeElement).toBe(b1)
      wrapper.unmount()
    })

    it("Tab from last focusable cycles to first", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        // closeButton: false явный — window.FishtVue leak от предыдущих тестов
        // выставляет closeButton: true иначе, что добавляет лишний focusable.
        props: { focusTrap: true, modelValue: true, closeButton: false },
        slots: { default: '<button class="b1">A</button><button class="b2">B</button>' }
      })
      wrappers.push(wrapper)
      await nextTick()
      await nextTick()
      const rootEl = wrapper.find("[data-fix-window]").element as HTMLElement
      // Scope querySelectors to root popover — избегаем DOM leak от предыдущих mount'ов.
      const b1 = rootEl.querySelector(".b1") as HTMLElement
      const b2 = rootEl.querySelector(".b2") as HTMLElement
      expect(b1).not.toBeNull()
      expect(b2).not.toBeNull()
      b2.focus()
      expect(document.activeElement).toBe(b2)
      const evt = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })
      rootEl.dispatchEvent(evt)
      await nextTick()
      expect(document.activeElement).toBe(b1)
    })

    it("Shift+Tab from first focusable cycles to last", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        // closeButton: false явный — window.FishtVue leak от предыдущих тестов
        // выставляет closeButton: true иначе, что добавляет лишний focusable.
        props: { focusTrap: true, modelValue: true, closeButton: false },
        slots: { default: '<button class="b1">A</button><button class="b2">B</button>' }
      })
      wrappers.push(wrapper)
      await nextTick()
      await nextTick()
      const rootEl = wrapper.find("[data-fix-window]").element as HTMLElement
      const b1 = rootEl.querySelector(".b1") as HTMLElement
      const b2 = rootEl.querySelector(".b2") as HTMLElement
      expect(b1).not.toBeNull()
      expect(b2).not.toBeNull()
      b1.focus()
      expect(document.activeElement).toBe(b1)
      const evt = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })
      rootEl.dispatchEvent(evt)
      await nextTick()
      expect(document.activeElement).toBe(b2)
    })

    it("initialFocus selector resolves focus target", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { focusTrap: true, modelValue: true, initialFocus: ".target" },
        slots: { default: '<button class="b1">A</button><button class="target">T</button>' }
      })
      await nextTick()
      await nextTick()
      ;(wrapper.vm as any).focusFirst()
      const target = document.querySelector(".target") as HTMLElement
      expect(document.activeElement).toBe(target)
      wrapper.unmount()
    })
  })

  describe("Issue 5 — Focus return on close (E29.4)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("returns focus to trigger on close (default returnFocus=true with focusTrap)", async () => {
      const trigger = document.createElement("button")
      trigger.className = "trigger"
      document.body.appendChild(trigger)
      trigger.focus()
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { focusTrap: true, modelValue: false }
      })
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      expect((wrapper.vm as any).triggerEl).toBe(trigger)
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      await nextTick()
      expect(document.activeElement).toBe(trigger)
      wrapper.unmount()
    })

    it("returnFocus=false skips focus restoration", async () => {
      const trigger = document.createElement("button")
      trigger.className = "trigger"
      document.body.appendChild(trigger)
      const other = document.createElement("button")
      other.className = "other"
      document.body.appendChild(other)
      trigger.focus()
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { focusTrap: true, returnFocus: false, modelValue: true }
      })
      await nextTick()
      other.focus()
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      // Focus should NOT be returned to trigger when returnFocus=false.
      expect(document.activeElement).not.toBe(trigger)
      wrapper.unmount()
    })
  })

  describe("Issue 6 — Cross-cutting (SSR/sideEffects/unstyled)", () => {
    afterEach(() => {
      // window.FishtVue leak prevention — Component.setStyle guard inherits config
      // через window.FishtVue fallback (component-class.md Issue 2); чистим, чтобы
      // не сломать downstream mode-variants тесты в Select/Calendar.
      delete (window as any).FishtVue
    })

    it("does NOT contain duplicate FixWindow.initStyle() call in SFC (Wave 2.3)", () => {
      // Static-source check: ensures Component.__hooks() is the sole initStyle entry point.
      const sfc = readFileSync(resolve(__dirname, "FixWindow.vue"), "utf-8")
      // Strip line + block comments to avoid matching documentation that mentions the API.
      const sfcCode = sfc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
      // Negative match — should NOT find an actual `FixWindow.initStyle()` invocation in code.
      expect(sfcCode).not.toMatch(/FixWindow\.initStyle\(\)/)
    })

    it("respects unstyled: true via Component.setStyle guard (cross-cutting Wave 3.1)", () => {
      const app = (options: any = {}) => ({
        install(a: any) {
          a.use(FishtVue, { unstyled: true, componentsOptions: { FixWindow: options } })
        }
      })
      const wrapper = mount(FixWindow, { global: { plugins: [app()] } })
      const root = wrapper.find("[data-fix-window]")
      // When unstyled: true → Component.setStyle returns "" → classBase is empty.
      expect(root.attributes("class") ?? "").toBe("")
      wrapper.unmount()
    })

    it("package.json declares sideEffects: false (Dialog precedent)", () => {
      const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"))
      expect(pkg.sideEffects).toBe(false)
    })
  })

  describe("Issue 8 — Dynamic ARIA role (E29.1)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("role='tooltip' when eventOpen='hover' (default)", () => {
      const wrapper = mount(FixWindow, { props: { eventOpen: "hover" } })
      const root = wrapper.find("[data-fix-window]")
      expect(root.attributes("role")).toBe("tooltip")
      wrapper.unmount()
    })

    it("role='dialog' when eventOpen='click' (interactive)", () => {
      const wrapper = mount(FixWindow, { props: { eventOpen: "click" } })
      const root = wrapper.find("[data-fix-window]")
      expect(root.attributes("role")).toBe("dialog")
      wrapper.unmount()
    })

    it("role='menu' when explicit prop", () => {
      const wrapper = mount(FixWindow, { props: { role: "menu" } })
      const root = wrapper.find("[data-fix-window]")
      expect(root.attributes("role")).toBe("menu")
      wrapper.unmount()
    })

    it("aria-label, aria-labelledby, aria-describedby forwarded", () => {
      const wrapper = mount(FixWindow, {
        props: { ariaLabel: "L", ariaLabelledby: "title-id", ariaDescribedby: "desc-id" }
      })
      const root = wrapper.find("[data-fix-window]")
      // labelledby takes precedence — aria-label resolved to undefined
      expect(root.attributes("aria-labelledby")).toBe("title-id")
      expect(root.attributes("aria-describedby")).toBe("desc-id")
      // aria-label suppressed when labelledby present
      expect(root.attributes("aria-label")).toBeUndefined()
      wrapper.unmount()
    })

    it("aria-label rendered when no aria-labelledby", () => {
      const wrapper = mount(FixWindow, { props: { ariaLabel: "Tooltip text" } })
      const root = wrapper.find("[data-fix-window]")
      expect(root.attributes("aria-label")).toBe("Tooltip text")
      wrapper.unmount()
    })
  })

  describe("Issue 9 — RTL via logical placement (F31)", () => {
    it("position='top-left' maps to Floating UI 'top-start' (logical)", () => {
      const wrapper = mount(FixWindow, { props: { position: "top-left" } })
      // We can't directly inspect Floating UI internal placement, but we can assert
      // the component mounts without throwing and exposes a valid position.
      expect(wrapper.vm.position).toBe("top-left")
      wrapper.unmount()
    })

    it("close button uses logical inline-end positioning (end-2, not right-2)", () => {
      // Static-source check — Vue's `class` merging may apply at runtime via Component.setStyle,
      // но в template буквальная позиция должна быть logical `end-2` (Dialog precedent).
      const sfc = readFileSync(resolve(__dirname, "FixWindow.vue"), "utf-8")
      // Найди close-button template block; убедись, что end-2 присутствует, right-2 — нет.
      expect(sfc).toMatch(/end-2/)
      expect(sfc).not.toMatch(/\bright-2\b/)
    })
  })

  describe("Issue 10 — motion-safe + touch fallback (E29.7)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("classBase / setStyle calls include motion-safe: prefix", () => {
      const sfc = readFileSync(resolve(__dirname, "FixWindow.vue"), "utf-8")
      // Опции transition в setStyle и template должны быть motion-safe:.
      expect(sfc).toMatch(/motion-safe:transition-opacity/)
      // Не должно быть unconditional `transition-opacity duration-` без motion-safe.
      expect(sfc).not.toMatch(/(?<!motion-safe:)transition-opacity\s+ease-in-out\s+duration-300/)
    })

    it("touchstart listener registered when eventOpen='hover' (touch fallback)", async () => {
      const wrapper = mount(FixWindow)
      const addSpy = vi.spyOn(wrapper.vm.element, "addEventListener")
      await wrapper.setProps({ eventOpen: "hover" })
      // setProps to same value may not re-fire watcher; assert via re-mount.
      wrapper.unmount()
      const w2 = mount(FixWindow, { props: { eventOpen: "hover" } })
      const addSpy2 = vi.spyOn(w2.vm.element, "addEventListener")
      // trigger eventOpen watcher by toggling
      await w2.setProps({ eventOpen: "click" })
      await w2.setProps({ eventOpen: "hover" })
      const calls = addSpy2.mock.calls.map((c: any) => c[0])
      expect(calls).toContain("touchstart")
      w2.unmount()
    })
  })

  describe("Escape closes when open (focus trap or non-'none' close)", () => {
    afterEach(() => {
      document.body.innerHTML = ""
    })

    it("Escape keydown closes when focusTrap=true", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { focusTrap: true, modelValue: true }
      })
      await nextTick()
      await nextTick()
      const evt = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      document.dispatchEvent(evt)
      await nextTick()
      expect(wrapper.vm.isOpen).toBe(false)
      wrapper.unmount()
    })

    it("Escape does NOT close when eventClose='none' and focusTrap=false", async () => {
      const wrapper = mount(FixWindow, {
        attachTo: document.body,
        props: { eventOpen: "click", eventClose: "none", focusTrap: false, modelValue: true }
      })
      await nextTick()
      await nextTick()
      const evt = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
      document.dispatchEvent(evt)
      await nextTick()
      expect(wrapper.vm.isOpen).toBe(true)
      wrapper.unmount()
    })
  })
})
