import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"
import Alert from "fishtvue/alert/Alert.vue"
import { openAlert } from "fishtvue/alert/openAlert"
import { sanitizeHtml } from "fishtvue/alert/sanitizeHtml"
import { AlertClassKey, AlertPosition, AlertProps } from "fishtvue/alert/Alert"

describe("Alert Component", () => {
  describe("Without Library Initialization", () => {
    it("should render with default props", () => {
      const wrapper = mount(Alert)
      expect(wrapper.exists()).toBe(true)
      expect((wrapper.props() as any).type).toBeUndefined()
    })

    it("should render custom title, subtitle, and slot content", () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true,
          title: "Custom Title",
          subtitle: "Custom Subtitle"
        },
        slots: {
          default: "<p>Custom Slot Content</p>"
        }
      })

      expect(wrapper.find("[data-alert-content] [data-alert-title]").text()).toBe("Custom Title")
      expect(wrapper.find("[data-alert-content] [data-alert-subtitle]").text()).toBe("Custom Subtitle")
      expect(wrapper.find("[data-alert-content] [data-alert-slot]").html()).toContain("Custom Slot Content")
    })

    it("should expose reactive fields and methods", async () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.vm.isVisible).toBe(true)
      expect(wrapper.vm.type).toBe("success") // default type
      wrapper.vm.close()
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })
  })

  describe("Integration with FishtVue Library", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Alert: options
        }
      })
      return app
    }

    it("should render with global options", () => {
      const app: any = createAppWithFishtVue({
        type: "warning"
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          title: "Global Title",
          subtitle: "Global Subtitle"
        }
      })

      expect(wrapper.vm.type).toBe("warning")
      expect(wrapper.vm.title).toBe("Global Title")
      expect(wrapper.vm.subtitle).toBe("Global Subtitle")
    })

    it("should override global options with props", () => {
      const app: any = createAppWithFishtVue({
        type: "warning"
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          type: "error",
          title: "Prop Title"
        }
      })

      expect(wrapper.vm.type).toBe("error")
      expect(wrapper.vm.title).toBe("Prop Title")
    })

    it("should handle visibility and emit update:modelValue", async () => {
      const app: any = createAppWithFishtVue()

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          modelValue: true
        }
      })

      expect(wrapper.vm.isVisible).toBe(true)
      wrapper.vm.close()
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe("Alert Component - Extended Tests", () => {
    describe("Each test for type", () => {
      it.each([
        { type: "success", expectClass: "bg-success-50 dark:bg-success-950" },
        { type: "warning", expectClass: "bg-warning-50 dark:bg-warning-950" },
        {
          type: "info",
          expectClass: "bg-info-50 dark:bg-info-950"
        },
        { type: "error", expectClass: "bg-error-50 dark:bg-error-950" },
        { type: "neutral", expectClass: "bg-neutral-100 dark:bg-neutral-800" }
      ] as { type: AlertProps["type"]; expectClass: string }[])(
        "should render alert with type '%s'",
        ({ type, expectClass }) => {
          const wrapper = mount(Alert, {
            props: { type }
          })
          expect(wrapper.vm.classesStyle.body).toBe(expectClass)
        }
      )
    })

    describe("Each test for position", () => {
      it.each(["top", "bottom", "start", "end", "center"] as AlertProps["position"][])(
        "should render alert with position '%s'",
        (position) => {
          const wrapper = mount(Alert, {
            props: { position }
          })

          expect(wrapper.vm.position).toBe(position)
        }
      )
    })

    describe("Each test for size", () => {
      it.each(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"] as AlertProps["size"][])(
        "should render alert with size '%s'",
        (size) => {
          const wrapper = mount(Alert, {
            props: { size }
          })

          expect(wrapper.vm.size).toContain(size)
        }
      )
    })

    describe("displayTime functionality", () => {
      it.each([1000, 2000, 3000])("should hide alert after %sms", async (displayTime) => {
        const wrapper = mount(Alert, {
          props: { displayTime, modelValue: true }
        })

        expect(wrapper.vm.isVisible).toBe(true)

        await new Promise((resolve) => setTimeout(resolve, displayTime + 500))

        expect(wrapper.vm.isVisible).toBe(false)
      })
    })

    describe("notAnimate functionality", () => {
      it("should not include transition classes when notAnimate is true", () => {
        const wrapper = mount(Alert, {
          props: { notAnimate: true }
        })

        const transitionClasses = ["translate-x-[200%]", "opacity-0", "translate-y-[200%]"]
        const wrapperHtml = wrapper.html()

        transitionClasses.forEach((cls) => {
          expect(wrapperHtml).not.toContain(cls)
        })
      })
    })

    describe("closeButton functionality", () => {
      it("should render a close button and handle close action", async () => {
        const wrapper = mount(Alert, {
          props: { closeButton: true, modelValue: true }
        })

        expect(wrapper.find("[data-alert-button]").exists()).toBe(true)

        await wrapper.find("button").trigger("click")

        expect(wrapper.vm.isVisible).toBe(false)
      })
    })

    describe("class and style props", () => {
      it("should apply custom class to alert root (1.0.0: `class` — корень, карточка — classes.body)", () => {
        const customClass = "custom-alert-class"
        const wrapper = mount(Alert, {
          props: { class: customClass, classes: { body: "custom-body-class" }, modelValue: true }
        })

        expect(wrapper.find("[data-alert]").attributes("class")).toContain(customClass)
        expect(wrapper.find("[data-alert-body]").attributes("class")).toContain("custom-body-class")
        expect(wrapper.find("[data-alert-body]").attributes("class")).not.toContain(customClass)
      })

      it("should apply custom style to alert", () => {
        const customStyle = { color: "red" }
        const wrapper = mount(Alert, {
          props: { style: customStyle, modelValue: true }
        })

        expect(wrapper.find("[data-alert] > div").attributes("style")).toContain("color: red;")
      })
    })
  })

  describe("Alert Component - Icon Rendering", () => {
    const iconMap = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-success-400 dark:text-success-600">
  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path>
</svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-warning-400 dark:text-warning-600">
  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"></path>
</svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-info-400 dark:text-info-600">
  <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd"></path>
</svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-error-400 dark:text-error-600">
  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd"></path>
</svg>`,
      neutral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-neutral-400 dark:text-neutral-600">
  <path fill-rule="evenodd" d="M2 10c0-3.967 3.69-7 8-7 4.31 0 8 3.033 8 7s-3.69 7-8 7a9.165 9.165 0 0 1-1.504-.123 5.976 5.976 0 0 1-3.935 1.107.75.75 0 0 1-.584-1.143 3.478 3.478 0 0 0 .522-1.756C2.979 13.825 2 12.025 2 10Z" clip-rule="evenodd"></path>
</svg>`
    }

    it.each(Object.entries(iconMap) as [AlertProps["type"], string][])(
      "should render correct icon for type '%s'",
      (type, expectedIcon) => {
        const wrapper = mount(Alert, {
          props: { type, modelValue: true }
        })

        expect(wrapper.find("[data-alert-icon] svg").html()).toBe(expectedIcon)
      }
    )
  })

  // -------------------------------------------------------------------------
  // A1 — типовая гигиена (styleBase без `as any`) + defensive default
  // в switch-ах `classesStyle` / `icon`.
  // -------------------------------------------------------------------------

  describe("styleBase — типизированный резолв style (A1)", () => {
    afterEach(() => {
      // window.FishtVue — глобальный singleton, утекает между тестами (см. Configuration support).
      delete (window as any).FishtVue
    })

    it("applies style from global options when the prop is absent", () => {
      const app: any = createApp({})
      app.use(FishtVue, {
        componentsOptions: { Alert: { style: { color: "blue" } } }
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: { modelValue: true }
      })

      expect(wrapper.find("[data-alert] > div").attributes("style")).toContain("color: blue;")
    })

    it("prop style overrides the options layer", () => {
      const app: any = createApp({})
      app.use(FishtVue, {
        componentsOptions: { Alert: { style: { color: "blue" } } }
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: { modelValue: true, style: { color: "red" } }
      })

      const style = wrapper.find("[data-alert] > div").attributes("style")
      expect(style).toContain("color: red;")
      expect(style).not.toContain("blue")
    })

    it("renders no inline style when neither layer provides one", () => {
      const wrapper = mount(Alert, { props: { modelValue: true } })
      expect(wrapper.find("[data-alert] > div").attributes("style")).toBeUndefined()
    })
  })

  describe("Defensive default for an out-of-union type (A1)", () => {
    // `type` вне union приходит только из untyped JS / openAlert — TS такой вызов не пропустит,
    // поэтому в тестах нужен явный `as any`.
    const unknownType = "chartreuse" as unknown as AlertProps["type"]

    it("falls back to the default type styles instead of returning undefined classesStyle", () => {
      const wrapper = mount(Alert, {
        props: { modelValue: true, type: unknownType }
      })

      expect(wrapper.vm.classesStyle).toBeDefined()
      expect(wrapper.vm.classesStyle.body).toBe("bg-success-50 dark:bg-success-950")
      expect(wrapper.vm.classesStyle.button).toBe("hover:bg-success-200 dark:hover:bg-success-800")
      expect(wrapper.vm.classesStyle.buttonIcon).toBe("fill-success-500 dark:fill-success-500")
    })

    it("keeps every classesStyle consumer renderable for an out-of-union type", () => {
      const wrapper = mount(Alert, {
        props: { modelValue: true, type: unknownType, title: "t", subtitle: "s", closeButton: true },
        slots: { default: "<p>slot content</p>" }
      })

      // classBase (body), classIcon, classTitle, classSubtitle, classSlotDefault
      expect(wrapper.find("[data-alert] > div").attributes("class")).toContain("bg-success-50")
      expect(wrapper.find("[data-alert-icon] svg").attributes("class")).toContain("text-success-400")
      expect(wrapper.find("[data-alert-title]").attributes("class")).toContain("text-success-800")
      expect(wrapper.find("[data-alert-subtitle]").attributes("class")).toContain("text-success-700")
      expect(wrapper.find("[data-alert-slot]").attributes("class")).toContain("text-success-700")
    })

    it("still renders an icon (not an empty <component :is>) for an out-of-union type", () => {
      const wrapper = mount(Alert, {
        props: { modelValue: true, type: unknownType }
      })

      const icon = wrapper.find("[data-alert-icon] svg")
      expect(icon.exists()).toBe(true)
      // Иконка default-типа "success" — CheckCircleIcon.
      expect(icon.html()).toContain("M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809")
    })
  })

  describe("openAlert Function", () => {
    beforeEach(() => {
      document.body.innerHTML = "" // Очистить DOM перед каждым тестом
    })

    it("should create and mount an alert with default options", () => {
      openAlert({})

      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.querySelector(`[data-alert]`)).not.toBeNull()
    })

    it("should set custom position and create the corresponding container", () => {
      openAlert({ position: "bottom-end" })

      const alertElement = document.querySelector(".alert-bottom-end")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.className).toContain("items-end")
    })

    it("should set default position to 'top' if none is provided", () => {
      openAlert({})
      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
    })

    it("should handle invalid position gracefully", () => {
      openAlert({ position: "invalid-position" as any })

      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.className).toContain("top-0")
      expect(alertElement?.className).toContain("-translate-x-1/2")
    })

    it("should handle invalid type gracefully (allow-list fallback + dev-warn)", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      openAlert({ type: "invalid-type" as any })

      const alertBody = document.querySelector("[data-alert] > div")
      expect(alertBody).not.toBeNull()
      // Фолбэк на default-тип "success" — стили отрисованы, undefined-классов нет.
      expect(alertBody?.className).toContain("bg-success-50")
      expect(alertBody?.className).not.toContain("undefined")
      expect(document.querySelector("[data-alert-icon] svg")).not.toBeNull()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('type="invalid-type"'))
      warn.mockRestore()
    })

    it("should pass a valid type through without warning", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      openAlert({ type: "error" })

      const alertBody = document.querySelector("[data-alert] > div")
      expect(alertBody?.className).toContain("bg-error-50")
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    it("should apply displayTime and unmount alert after the timeout", async () => {
      vi.useFakeTimers()

      openAlert({ displayTime: 1000 })

      let alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).not.toBeNull()

      vi.advanceTimersByTime(1600)

      alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).toBeNull()

      vi.useRealTimers()
    })

    it("should allow manual close via close button", async () => {
      vi.useFakeTimers()
      openAlert({ closeButton: true })

      const closeButton = document.querySelector("[data-alert-button] [data-button]")
      expect(closeButton).not.toBeNull()

      closeButton?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true
        })
      )
      vi.advanceTimersByTime(600)

      const alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).toBeNull()
      vi.useRealTimers()
    })

    it("should mount alert to the specified teleport target", () => {
      const teleportTarget = document.createElement("div")
      teleportTarget.id = "custom-teleport"
      document.body.appendChild(teleportTarget)

      openAlert({ teleport: "#custom-teleport" })

      const alertElement = teleportTarget.querySelector(`[data-alert]`)
      expect(alertElement).not.toBeNull()
    })

    it("should log a warning if teleport target is not found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      openAlert({ teleport: "#non-existent" })

      expect(consoleSpy).toHaveBeenCalledWith("The element for mounting the Alert component was not found")

      consoleSpy.mockRestore()
    })

    it("should remove the alert container if all alerts are destroyed", async () => {
      vi.useFakeTimers()
      openAlert({ position: "top" })

      const alertContainer = document.querySelector(".alert-top")
      expect(alertContainer).not.toBeNull()

      const closeButton = document.querySelector("[data-alert-button] [data-button]")
      closeButton?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true
        })
      )
      vi.advanceTimersByTime(600)

      expect(document.querySelector("[data-alert]")).toBeNull()
      vi.useRealTimers()
    })

    it("should create three alerts in the same container", () => {
      // Вызов функции трижды с разными заголовками
      openAlert({ title: "First Alert", position: "top" })
      openAlert({ title: "Second Alert", position: "top" })
      openAlert({ title: "Third Alert", position: "top" })

      // Проверяем, что контейнер создан
      const alertContainer = document.querySelector(".alert-top")
      expect(alertContainer).not.toBeNull()

      // Проверяем, что внутри контейнера три алерта
      const alerts = alertContainer?.querySelectorAll(`[data-alert]`)
      expect(alerts?.length).toBe(3)

      // Проверяем заголовки для каждого алерта
      const alertTitles = Array.from(alerts || []).map((alert) => alert.querySelector("h3")?.textContent)

      expect(alertTitles).toEqual(["Third Alert", "Second Alert", "First Alert"])
    })
    describe("openAlert Function - Position Tests (logical, RTL-safe)", () => {
      const positions: AlertPosition[] = [
        "top",
        "bottom",
        "start",
        "end",
        "center",
        "bottom-start",
        "top-start",
        "bottom-end",
        "top-end"
      ]

      /**
       * Возвращает ожидаемые logical-классы для заданной позиции (RTL-safe + mobile-first gutters).
       */
      function getExpectedClassesForPosition(position: string): string[] {
        const positionClasses: Record<string, string[]> = {
          top: ["top-0", "pt-3", "sm:pt-5", "items-center"],
          bottom: ["bottom-0", "pb-3", "sm:pb-5", "items-center", "flex-col-reverse"],
          start: ["start-0", "ps-3", "sm:ps-5", "top-1/2", "-translate-y-1/2", "items-start"],
          end: ["end-0", "pe-3", "sm:pe-5", "top-1/2", "-translate-y-1/2", "items-end"],
          center: ["top-1/2", "left-1/2", "-translate-y-1/2", "-translate-x-1/2"],
          "bottom-start": ["bottom-0", "pb-3", "start-0", "ps-3", "flex-col-reverse", "items-start"],
          "top-start": ["top-0", "pt-3", "start-0", "ps-3", "items-start"],
          "bottom-end": ["bottom-0", "pb-3", "end-0", "pe-3", "flex-col-reverse", "items-end"],
          "top-end": ["top-0", "pt-3", "end-0", "pe-3", "items-end"]
        }

        return positionClasses[position] || []
      }

      it.each(positions)("should create an alert with logical position '%s'", (position) => {
        openAlert({ position })

        const alertContainer = document.querySelector(`.alert-${position}`)
        expect(alertContainer).not.toBeNull()

        const alertElement = alertContainer?.querySelector(`[data-alert]`)
        expect(alertElement).not.toBeNull()

        // Проверяем наличие logical-классов, соответствующих позиции
        const expectedClasses = getExpectedClassesForPosition(position)
        expectedClasses.forEach((cls) => {
          expect(alertContainer?.className).toContain(cls)
        })
      })

      // Физические алиасы сняты в major 2026-09-06 (решение R7). Allow-list оставлен: openAlert
      // вызывают в том числе из untyped JS, и старое значение должно давать дефолтный тост,
      // а не контейнер с несуществующим классом позиции.
      it.each(["left", "right", "top-left", "bottom-right"])(
        "снятая физическая позиция '%s' резолвится в дефолтный top-контейнер",
        (physical) => {
          openAlert({ position: physical as AlertPosition })

          expect(document.querySelector(`.alert-top`)).not.toBeNull()
          expect(document.querySelector(`.alert-${physical}`)).toBeNull()
        }
      )
    })
  })

  // -------------------------------------------------------------------------
  // Audit fixes (2026-05-11): Issue 1 (XSS), 2 (openAlert createApp+h),
  // 3 (ARIA role/aria-live), 6-partial (close-button locale), 9 (motion-safe).
  // -------------------------------------------------------------------------

  describe("Security — XSS guard in subtitle prop (Issue 1, sanitized v-html)", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
      delete (window as any).__xssTriggered
    })

    it("strips <script> tag from subtitle prop (template usage)", () => {
      const payload = "<script>window.__xssTriggered=true</script>"
      const wrapper = mount(Alert, {
        props: { modelValue: true, subtitle: payload }
      })

      expect(wrapper.find("[data-alert-subtitle] script").exists()).toBe(false)
      expect(wrapper.find("[data-alert-subtitle]").html()).not.toContain("<script>")
      expect((window as any).__xssTriggered).toBeUndefined()
    })

    it("strips on* handler from <img onerror> payload (template usage)", () => {
      const payload = '<img src=x onerror="window.__xssTriggered=true">'
      const wrapper = mount(Alert, {
        props: { modelValue: true, subtitle: payload }
      })

      const img = wrapper.find("[data-alert-subtitle] img")
      // <img> рендерится (safe-тег), но onerror-обработчик вырезан → исполнения нет.
      expect(img.attributes("onerror")).toBeUndefined()
      expect(wrapper.find("[data-alert-subtitle]").html()).not.toContain("onerror")
      expect((window as any).__xssTriggered).toBeUndefined()
    })

    it("strips javascript: protocol from anchor href (template usage)", () => {
      const payload = '<a href="javascript:window.__xssTriggered=true">link</a>'
      const wrapper = mount(Alert, {
        props: { modelValue: true, subtitle: payload }
      })

      const anchor = wrapper.find("[data-alert-subtitle] a")
      expect(anchor.attributes("href")).toBeUndefined()
      expect(wrapper.find("[data-alert-subtitle]").html()).not.toContain("javascript:")
    })

    it("strips XSS payload from openAlert programmatic subtitle", () => {
      const payload = "<script>window.__xssTriggered=true</script>"
      openAlert({ subtitle: payload })

      const subtitle = document.querySelector("[data-alert-subtitle]")
      expect(subtitle).not.toBeNull()
      expect(subtitle?.querySelector("script")).toBeNull()
      expect((window as any).__xssTriggered).toBeUndefined()
    })
  })

  describe("Subtitle — sanitized HTML support (Issue 1 amended 2026-06-14)", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
    })

    it("renders safe HTML markup (<span>, <b>) from subtitle prop", () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true,
          subtitle: "An example <span class='badge'>html markup</span> can be <b>used</b>"
        }
      })
      const subtitle = wrapper.find("[data-alert-subtitle]")
      expect(subtitle.find("span.badge").exists()).toBe(true)
      expect(subtitle.find("b").exists()).toBe(true)
      expect(subtitle.text()).toContain("html markup")
    })

    it("renders <img> with a safe src from subtitle prop", () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true,
          subtitle: "<img class='rounded-lg' src='https://example.com/a.jpg' alt=''>"
        }
      })
      const img = wrapper.find("[data-alert-subtitle] img")
      expect(img.exists()).toBe(true)
      expect(img.attributes("src")).toBe("https://example.com/a.jpg")
    })

    it("renders safe HTML from openAlert programmatic subtitle", () => {
      openAlert({ subtitle: "<span class='badge'>ok</span>" })
      const subtitle = document.querySelector("[data-alert-subtitle]")
      expect(subtitle?.querySelector("span.badge")).not.toBeNull()
    })
  })

  describe("sanitizeHtml() — unit", () => {
    it("removes <script> blocks with content", () => {
      expect(sanitizeHtml("a<script>alert(1)</script>b")).toBe("ab")
    })

    it("removes <style> and <iframe> blocks", () => {
      expect(sanitizeHtml("<style>body{}</style>x")).toBe("x")
      expect(sanitizeHtml("<iframe src='evil'></iframe>y")).toBe("y")
    })

    it("removes nested / obfuscated script constructions", () => {
      expect(sanitizeHtml("<scr<script>ipt>alert(1)</script>")).not.toContain("script>alert")
      expect(sanitizeHtml("<scr<script>ipt>alert(1)</script>")).not.toContain("alert(1)")
    })

    it("strips on* event-handler attributes", () => {
      expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toContain("onerror")
      expect(sanitizeHtml("<div onclick=alert(1)>x</div>")).not.toContain("onclick")
    })

    it("strips javascript:/vbscript: protocols from attributes", () => {
      expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:")
      expect(sanitizeHtml("<a href='vbscript:msgbox(1)'>x</a>")).not.toContain("vbscript:")
    })

    it("keeps safe tags, classes and http(s)/relative attributes", () => {
      const safe = "<span class='badge'>ok</span> <a href='https://x.io'>l</a> <img src='/a.png'>"
      const out = sanitizeHtml(safe)
      expect(out).toContain("<span class='badge'>")
      expect(out).toContain("href='https://x.io'")
      expect(out).toContain("src='/a.png'")
    })

    it("does not strip safe attributes that merely start differently (data-*)", () => {
      expect(sanitizeHtml("<div data-on='x'>y</div>")).toContain("data-on='x'")
    })

    it("handles empty / null / undefined", () => {
      expect(sanitizeHtml("")).toBe("")
      expect(sanitizeHtml(null)).toBe("")
      expect(sanitizeHtml(undefined)).toBe("")
    })
  })

  describe("sanitizeHtml() — санитизация не изготавливает опасный элемент из инертного ввода", () => {
    // Разбираем РЕЗУЛЬТАТ, а не строку: важно, какой элемент получит браузер.
    const parseAll = (html: string) => {
      const host = document.createElement("div")
      host.innerHTML = html
      return host
    }

    // Вырезание «осиротевшего» закрывающего тега склеивает соседние куски: `<scr` + `ipt>`.
    // Пока шаг 2 стоял после цикла, вход НИЖЕ (инертный в браузере) превращался в живой
    // `<script>alert(1)</script>` — санитайзер сам создавал то, чего во входе не было.
    const fusion: Array<[string, string]> = [
      ["<scr</script>ipt>alert(1)</scr</script>ipt>", "script"],
      ["<scr</script>ipt src=//evil></scr</script>ipt>", "script"],
      ["<sty</style>le>body{}</sty</style>le>", "style"],
      ["<sv</svg>g onload=alert(1)></sv</svg>g>", "svg"]
    ]

    it.each(fusion)("вход %j инертен в браузере ДО санитизации (предпосылка теста)", (raw, tag) => {
      expect(parseAll(raw).querySelector(tag)).toBeNull()
    })

    it.each(fusion)("и не становится элементом <%s> ПОСЛЕ санитизации", (raw, tag) => {
      const out = sanitizeHtml(raw)
      expect(out).not.toMatch(new RegExp(`<\\s*/?\\s*${tag}\\b`, "i"))
      expect(parseAll(out).querySelector(tag)).toBeNull()
    })

    it("не оставляет исполняемого содержимого от склейки", () => {
      expect(sanitizeHtml("<scr</script>ipt>alert(1)</scr</script>ipt>")).toBe("")
      expect(sanitizeHtml("<sty</style>le>body{}</sty</style>le>")).toBe("")
    })

    it("осиротевший закрывающий тег в безобидной разметке по-прежнему просто удаляется", () => {
      expect(sanitizeHtml("<p>text</script>more</p>")).toBe("<p>textmore</p>")
      expect(sanitizeHtml("<p>обычный текст</p>")).toBe("<p>обычный текст</p>")
    })
  })

  describe("sanitizeHtml() — HTML-entity bypass in URL schemes", () => {
    // Атрибут вырезается целиком, поэтому надёжный маркер «заблокировано» — отсутствие имени атрибута.
    const blocked = (html: string) => expect(sanitizeHtml(html)).not.toMatch(/href|srcset|formaction/i)

    it("blocks decimal character references (with and without the trailing semicolon)", () => {
      blocked('<a href="&#106;avascript:alert(1)">x</a>')
      blocked('<a href="&#106avascript:alert(1)">x</a>')
    })

    it("blocks zero-padded decimal character references", () => {
      blocked('<a href="&#0000106;avascript:alert(1)">x</a>')
      blocked('<a href="&#0000106avascript:alert(1)">x</a>')
    })

    it("blocks hex character references (with and without the trailing semicolon)", () => {
      blocked('<a href="&#x6a;avascript:alert(1)">x</a>')
      blocked('<a href="&#X6A;avascript:alert(1)">x</a>')
      // Без `;` жадный разбор дал бы `0x6aa` — ловится ASCII-щадящим вариантом нормализации.
      blocked('<a href="&#x6aavascript:alert(1)">x</a>')
    })

    it("blocks partial / mixed encodings inside the scheme", () => {
      blocked('<a href="ja&#118;ascript:alert(1)">x</a>')
      blocked('<a href="&#106;&#97;vascript:alert(1)">x</a>')
      blocked('<a href="&#106;av&#x61;script:alert(1)">x</a>')
    })

    it("blocks encoded colons (named &colon; and numeric &#58;)", () => {
      blocked('<a href="javascript&colon;alert(1)">x</a>')
      blocked('<a href="javascript&#58;alert(1)">x</a>')
      blocked('<a href="javascript&#x3a;alert(1)">x</a>')
    })

    it("blocks encoded forms of vbscript: and data:text/html", () => {
      blocked('<a href="&#118;bscript:msgbox(1)">x</a>')
      blocked('<a href="&#100;ata:text/html,<b>hi</b>">x</a>')
      blocked('<a href="data:text&sol;html,<b>hi</b>">x</a>')
    })

    it("blocks control characters embedded in the scheme (tab/newline/CR/NUL)", () => {
      blocked('<a href="java\tscript:alert(1)">x</a>')
      blocked('<a href="java\nscript:alert(1)">x</a>')
      blocked('<a href="java\rscript:alert(1)">x</a>')
      // NUL не входит в `\s` — до фикса проходил насквозь.
      blocked(`<a href="java${String.fromCharCode(0)}script:alert(1)">x</a>`)
      // Control character, полученный из entity, тоже вырезается.
      blocked('<a href="java&#9;script:alert(1)">x</a>')
    })

    it("applies the same decoding to every URL attribute, not just href", () => {
      blocked('<img srcset="&#106;avascript:alert(1)">')
      blocked('<button formaction="&#x6a;avascript:alert(1)">b</button>')
      blocked("<a href=&#106;avascript:alert(1)>x</a>")
    })

    it("keeps safe URLs and legitimate &#-sequences byte-identical", () => {
      const safe = [
        '<a href="https://x.io/a?b=1&#38;c=2">l</a>',
        '<a href="/rel/path">l</a>',
        '<a href="#anchor">l</a>',
        '<a href="mailto:a@b.c">l</a>',
        '<a href="/search?q=a&#38;b=1">s</a>',
        // Числовая ссылка без `;` в безопасном URL — проходит оба варианта нормализации.
        '<a href="/p?x=&#38y=1">s</a>',
        '<a href="/s?a=1&amp;b=2">s</a>',
        "<div data-on='x'>y</div>",
        "<span>&#106;avascript: as text</span>",
        "price &#38; tax &#106; text"
      ]
      for (const html of safe) expect(sanitizeHtml(html)).toBe(html)
    })

    it("does not resolve prototype keys as named references", () => {
      const html = '<a href="javascript&constructor;alert(1)">x</a>'
      expect(sanitizeHtml(html)).toBe(html)
    })

    it("tolerates out-of-range numeric references without throwing", () => {
      expect(sanitizeHtml('<a href="&#99999999;/path">x</a>')).toContain("href")
    })

    it("stays linear on pathological self-regenerating entities", () => {
      // `&#38;` декодируется в `&`, воспроизводя следующую ссылку — вход, на котором наивный
      // fixed-point-цикл не завершается. Цикла нет: декодирование делает ровно один проход,
      // поэтому стоимость линейна по длине входа независимо от глубины вложенности.
      const nested = `<a href="&#38;${"#38;".repeat(64)}#106;avascript:alert(1)">x</a>`
      const wide = `<a href="${"&#38;".repeat(20000)}javascript:alert(1)">x</a>`
      const started = Date.now()
      expect(typeof sanitizeHtml(nested)).toBe("string")
      expect(typeof sanitizeHtml(wide)).toBe("string")
      expect(Date.now() - started).toBeLessThan(2000)
    })
  })

  describe("sanitizeHtml() — attribute-boundary bypasses", () => {
    // HTML-парсер начинает новый атрибут не только после whitespace, но и после `/`
    // и после закрывающей кавычки предыдущего значения (`<a x="1"href=…>`).
    const noLiveAttr = (html: string) => {
      const out = sanitizeHtml(html)
      expect(out).not.toMatch(/javascript|vbscript/i)
      expect(out).not.toMatch(/on(error|click|load)\s*=/i)
    }

    it("blocks URL attributes glued to the previous quoted value", () => {
      noLiveAttr('<a title="x"href="javascript:alert(1)">x</a>')
      noLiveAttr("<a title='x'href='javascript:alert(1)'>x</a>")
      noLiveAttr('<button x="1"formaction="javascript:alert(1)">b</button>')
      noLiveAttr('<img alt="1"srcset="javascript:alert(1)">')
      noLiveAttr('<a x="1"xlink:href="vbscript:msgbox(1)">x</a>')
    })

    it("blocks URL attributes separated only by a slash", () => {
      noLiveAttr('<a/href="javascript:alert(1)">x</a>')
      noLiveAttr('<img/src="javascript:alert(1)">')
      noLiveAttr('<a x=1 /href="javascript:alert(1)">x</a>')
      noLiveAttr('<a//href="javascript:alert(1)">x</a>')
    })

    it("blocks event-handler attributes glued to a quote or a slash", () => {
      noLiveAttr('<img src="x"onerror="alert(1)">')
      noLiveAttr("<img src=x /onerror=alert(1)>")
      noLiveAttr("<div/onclick=alert(1)>x</div>")
      noLiveAttr("<div x='1'/onload=alert(1)>x</div>")
    })

    it("blocks every attribute in an adjacent chain (fixed-point loop)", () => {
      // Первое совпадение съедает закрывающую кавычку, за которой прячется следующий
      // атрибут — без повторного прохода уцелел бы второй (и третий).
      noLiveAttr('<img onerror="a"onerror="alert(1)">')
      noLiveAttr('<a href="javascript:a"href="javascript:b">x</a>')
      noLiveAttr('<a href="javascript:a"href="javascript:b"href="javascript:c">x</a>')
      noLiveAttr('<img src="javascript:a"onerror="alert(1)"href="javascript:b">')
    })

    it("does not let a safe attribute shield the dangerous one behind it", () => {
      // Совпадение по безопасному атрибуту поглощает закрывающую кавычку, которая служит
      // границей для следующего — без отката `lastIndex` опасный атрибут уцелел бы.
      noLiveAttr('<a href="/ok"href="javascript:alert(1)">y</a>')
      noLiveAttr('<img alt="1" src="/ok.png"src="javascript:alert(1)">')
      noLiveAttr('<a href="/ok"href="/ok2"href="javascript:alert(1)">y</a>')
      expect(sanitizeHtml('<a title="t" href="/ok"href="&#106;avascript:alert(1)">y</a>')).toBe(
        '<a title="t" href="/ok">y</a>'
      )
    })

    it("keeps the following safe attribute intact when the dangerous one comes first", () => {
      // Зеркало предыдущего кейса: опасный атрибут стоит ПЕРВЫМ, безопасный — за ним.
      // Из-за отката `lastIndex` следующее совпадение начинается внутри уже вырезанного
      // куска, и его «граница» — закрывающая кавычка удалённого значения. Возврат этой
      // кавычки в вывод приклеивал её к имени следующего атрибута (`<a "href="/ok">`),
      // и парсер видел атрибут с именем `"href` — безопасный href уничтожался.
      const dangerousFirst = [
        '<a href="javascript:x" href="/ok">y</a>',
        '<a href="javascript:x"href="/ok">y</a>',
        '<a href="javascript:a"href="javascript:b"href="/ok">y</a>',
        '<a href="javascript:a"href="javascript:b" href="/ok">y</a>',
        '<a href="javascript:a"href="&#106;avascript:b"href="/ok">y</a>'
      ]
      for (const html of dangerousFirst) {
        const out = sanitizeHtml(html)
        noLiveAttr(html)
        expect(out).toContain('href="/ok"')
        expect(out).not.toMatch(/"href/)
      }
    })

    it("re-parses to a real href attribute after a dangerous-first chain (jsdom)", () => {
      // Проверяем не строку, а РЕЗУЛЬТАТ РАЗБОРА: строка может «выглядеть» целой, но
      // парситься как атрибут с именем `"href`.
      const parse = (html: string, selector: string) => {
        const host = document.createElement("div")
        host.innerHTML = sanitizeHtml(html)
        const el = host.querySelector(selector)
        expect(el).not.toBeNull()
        return el as Element
      }

      const spaced = parse('<a href="javascript:x" href="/ok">y</a>', "a")
      expect(spaced.getAttribute("href")).toBe("/ok")

      const glued = parse('<a href="javascript:x"href="/ok">y</a>', "a")
      expect(glued.getAttribute("href")).toBe("/ok")

      const chain = parse('<a href="javascript:a"href="javascript:b"href="/ok">y</a>', "a")
      expect(chain.getAttribute("href")).toBe("/ok")
      expect(chain.getAttributeNames()).toEqual(["href"])

      // Смешанная цепочка из трёх атрибутов: опасный URL + on*-handler + безопасный src.
      const mixed = parse('<img src="javascript:a"onerror="alert(1)"src="/ok.png">', "img")
      expect(mixed.getAttribute("src")).toBe("/ok.png")
      expect(mixed.getAttributeNames()).toEqual(["src"])

      // Цепочка on*-handler'ов перед безопасным атрибутом — та же фантомная граница.
      const handlers = parse('<img onerror="a"onerror="b"src="/ok.png">', "img")
      expect(handlers.getAttribute("src")).toBe("/ok.png")
      expect(handlers.getAttributeNames()).toEqual(["src"])
    })

    it("never fuses the surrounding text into a new tag when removing an attribute", () => {
      // Символ границы остаётся в выводе — иначе `<scr` + `ipt>` склеились бы в `<script>`
      // уже ПОСЛЕ того, как шаг 1 отработал.
      expect(sanitizeHtml('<scr href="javascript:x"ipt>alert(1)</script>')).not.toMatch(/<script/i)
      expect(sanitizeHtml('<scr onclick="1"ipt>alert(1)</script>')).not.toMatch(/<script/i)
      expect(sanitizeHtml("<scr href=javascript:x ipt>alert(1)</script>")).not.toMatch(/<script/i)
    })

    it("blocks entity-encoded and mixed-case schemes behind a boundary", () => {
      const out = sanitizeHtml('<a x="1"href="&#106;avascript:alert(1)">x</a>')
      expect(out).toBe('<a x="1">x</a>')
      noLiveAttr('<a x="1"HREF="JaVaScRiPt:alert(1)">x</a>')
      noLiveAttr('<a x="1"href="java&#9;script:alert(1)">x</a>')
    })

    it("terminates in bounded time on long adjacent-attribute chains", () => {
      const chain = `<img ${'onerror="a"'.repeat(2000)}>`
      const urls = `<a ${'href="javascript:a"'.repeat(2000)}>x</a>`
      const started = Date.now()
      expect(sanitizeHtml(chain)).not.toMatch(/onerror\s*=/i)
      expect(sanitizeHtml(urls)).not.toMatch(/javascript/i)
      expect(Date.now() - started).toBeLessThan(2000)
    })

    it("stays linear on long zero-padded character references", () => {
      // Ссылка без `;`, чей жадный разбор безопасен, уводит нормализацию в ASCII-щадящую
      // ветку; разбор префикса заново на каждом шаге давал O(n²) — 200 000 нулей вешали
      // санитизацию на ~6 с. Значение накапливается инкрементально.
      const dec = `<a href="/p?x=&#${"0".repeat(200000)}38y=1">s</a>`
      const hex = `<a href="/p?x=&#x${"0".repeat(200000)}26y=1">s</a>`
      const started = Date.now()
      expect(sanitizeHtml(dec)).toBe(dec)
      expect(sanitizeHtml(hex)).toBe(hex)
      expect(Date.now() - started).toBeLessThan(1000)
    })

    it("keeps safe markup byte-identical despite the wider boundary", () => {
      const safe = [
        '<a href="https://x.io" title="t">l</a>',
        "<a href='/rel' class='c'>l</a>",
        '<img src="/a.png" alt="a">',
        '<a href="#anchor">l</a>',
        '<a href="mailto:a@b.c">l</a>',
        "<div data-on='x'>y</div>",
        '<div title="x"data-href="/ok">y</div>',
        // Проза с кавычкой ПЕРЕД настоящим `name=value` — именно то, что широкая граница
        // атрибута выкусывала из текстового узла (`<p>write " here</p>`).
        '<p>write "href=javascript:x" here</p>',
        '<p>писать "onclick=foo" нельзя</p>',
        "<p>цитата: \"href=/ok\" и 'onclick=1' в тексте</p>"
      ]
      for (const html of safe) expect(sanitizeHtml(html)).toBe(html)
    })

    it("никогда не трогает текст между тегами, как бы он ни выглядел", () => {
      // Атрибуты существуют только ВНУТРИ тега, поэтому и вырезаются только там
      // (`mapTagRegions` + `findTagEnd`). Раньше поиск шёл по всей строке, и любая проза,
      // где за кавычкой/слэшем/пробелом следует `name=value`, теряла кусок текста —
      // видимая потеря контента в `subtitle`.
      const prose = [
        '<p>write "href=javascript:x" here</p>',
        '<p>писать "onclick=foo" нельзя</p>',
        "<p>don't onload=1 here</p>",
        "<p>цитата: \"href=/ok\" и 'onclick=1' в тексте</p>",
        "<p>путь a/href=javascript:x — это не атрибут</p>",
        '<b>bold</b> хвост: "onerror=alert(1)" и всё',
        "<p>2 < 3 onclick=1 ok</p>",
        'обычный текст без тегов: "href=javascript:x"'
      ]
      for (const html of prose) expect(sanitizeHtml(html)).toBe(html)
    })

    it("определяет конец тега как HTML-токенизатор, а не по первому '>'", () => {
      // `>` внутри значения в кавычках НЕ закрывает тег — атрибут за ним обязан быть найден.
      noLiveAttr('<a title="a>b" href="javascript:alert(1)">z</a>')
      noLiveAttr('<a title="a>b" onclick="alert(1)">z</a>')
      noLiveAttr('<a title="a>b"href="javascript:x">z</a>')
      expect(sanitizeHtml('<a title="a>b" href="javascript:alert(1)">z</a>')).toContain('title="a>b"')

      // `<` внутри значения не начинает новый тег.
      noLiveAttr('<a title="<b" href="javascript:x">z</a>')

      // Незакрытый тег / незакрытая кавычка в конце входа: браузер выбрасывает такой тег
      // целиком, санитайзер тоже не должен оставлять в нём живой атрибут.
      noLiveAttr('<a href="javascript:alert(1)"')
      noLiveAttr('<a href="javascript:alert(1)')
      noLiveAttr('<a href="javascript:x>text onclick=1')

      // Текстовый `<` (не буква/`/`/`!`/`?` следом) разметку не открывает, но и не сбивает
      // поиск настоящего тега дальше по строке.
      noLiveAttr('<p>2 < 3</p><a href="javascript:x">z</a>')
      expect(sanitizeHtml('<p>2 < 3</p><a href="javascript:x">z</a>')).toContain("<p>2 < 3</p>")

      // Взаимодействие с шагом 1 (удаление опасных элементов идёт ДО поиска атрибутов).
      expect(sanitizeHtml('<script title="a>b">alert(1)</script>')).not.toContain("alert(1)")
      noLiveAttr('<div>t</div><img src="x"onerror="alert(1)">')
    })

    it("совпадает с парсером там, где кавычка стоит не в позиции значения (jsdom)", () => {
      // `<a "b>c" href="javascript:x">` браузер разбирает как тег `<a "b>` с именем атрибута
      // `"b` плюс ТЕКСТ `c" href="javascript:x">z`. href там неживой, поэтому санитайзер
      // обязан оставить текст нетронутым — и это не обход.
      const html = '<a "b>c" href="javascript:x">z</a>'
      expect(sanitizeHtml(html)).toBe(html)

      const host = document.createElement("div")
      host.innerHTML = sanitizeHtml(html)
      const anchor = host.querySelector("a") as HTMLAnchorElement
      expect(anchor).not.toBeNull()
      expect(anchor.getAttribute("href")).toBeNull()
      expect(host.textContent).toContain('c" href="javascript:x">z')
    })

    it("не считает границей атрибута позицию ВНУТРИ чужого значения (jsdom)", () => {
      // Регулярка не знает состояния токенизатора и цеплялась за символ-границу, лежащий
      // внутри значения соседнего атрибута. Дальше `ATTR_VALUE` спаривал НЕ ТЕ кавычки:
      // в `<a title="href=" href="javascript:x">` совпадение начиналось на ОТКРЫВАЮЩЕЙ
      // кавычке `title`, «значением» считалось `" href="`, проверка схемы его пропускала —
      // и живой `href="javascript:x"` доезжал до DOM нетронутым.
      const bypasses = [
        '<a title="href=" href="javascript:alert(1)">x</a>',
        "<a title='href=' href='javascript:alert(1)'>x</a>",
        '<a title="href= " href="javascript:alert(1)">x</a>',
        '<a title="/href=" href="javascript:alert(1)">x</a>',
        '<a title="q href=" href="javascript:alert(1)">x</a>',
        '<a title="<a href=" href="javascript:alert(1)">x</a>',
        '<img alt="src=" src="javascript:alert(1)">',
        '<a data-x="formaction=" formaction="javascript:alert(1)">x</a>',
        '<p title="onclick=" onclick="alert(1)">x</p>',
        // Значение БЕЗ кавычек: `title=href=` — значение `href=`, а whitespace после него
        // регулярка проглатывала как `\s*` внутри `name\s*=\s*value`.
        "<img title= href=\thref=javascript:alert(1)>",
        "<a href= href=javascript:alert(1)>x</a>",
        // Кавычки и `=` внутри ИМЕНИ ТЕГА (`<ahref="href="`) — там атрибут начаться не может.
        '<ahref="href="/href="javascript:alert(1)">x</a>',
        "<adata-x='src='/href='javascript:alert(1)'>x</a>"
      ]
      // Проверяем РЕЗУЛЬТАТ РАЗБОРА, а не строку: `title="onclick="` в выводе остаётся
      // законно (это безопасное значение), поэтому строковый `noLiveAttr` тут не годится.
      for (const html of bypasses) {
        const host = document.createElement("div")
        host.innerHTML = sanitizeHtml(html)
        for (const el of Array.from(host.querySelectorAll("*")))
          for (const attr of el.getAttributeNames()) {
            expect(attr).not.toMatch(/^on/i)
            // Схема проверяется по НАЧАЛУ значения, как её видит URL-парсер: значение
            // `href=javascript:alert(1)` — относительный путь, а не опасная схема.
            const value = (el.getAttribute(attr) ?? "").replace(/\s+/g, "").toLowerCase()
            expect(value).not.toMatch(/^(?:javascript:|vbscript:|data:text\/html)/)
          }
      }
    })

    it("не путает `=` в начале имени атрибута с началом значения в кавычках (jsdom)", () => {
      // `<a =" href="javascript:x">`: `=` перед именем атрибута — это «unexpected-equals-sign-
      // before-attribute-name», символ становится ПЕРВЫМ СИМВОЛОМ ИМЕНИ, а не присваиванием.
      // Значит следующая кавычка значение НЕ открывает, и href за ней — живой.
      const html = '<a =" href="javascript:alert(1)">x</a>'
      const host = document.createElement("div")
      host.innerHTML = html
      expect(host.querySelector("a")?.getAttribute("href")).toBe("javascript:alert(1)")

      noLiveAttr(html)
      host.innerHTML = sanitizeHtml(html)
      expect(host.querySelector("a")?.getAttribute("href")).toBeNull()

      // То же для одинарной кавычки и для `=` внутри ИМЕНИ ТЕГА (`<a=` — часть имени).
      noLiveAttr("<a =' href='javascript:alert(1)'>x</a>")
      noLiveAttr('<a="x" href="javascript:alert(1)">x</a>')
    })

    it("выбрасывает тег без закрывающего `>` целиком, а не чинит его вырезом атрибута", () => {
      // Парсер доедает незакрытый тег до конца входа и ВЫБРАСЫВАЕТ его. Частичный вырез
      // атрибута из такого тега «чинит» разметку и оживляет то, чего браузер бы не исполнил:
      // вход инертен (кавычка не закрыта), но после выреза первого `onclick="` остаётся тег
      // с живым обработчиком.
      const revived = [
        "<pdata-x=\" onclick=\"\nonclick=alert(1)\nsrc='x'>",
        "<pid=' onclick='  data-x=\" href=\" onclick=alert(1)>x</a>"
      ]
      for (const html of revived) {
        // Контроль: в исходном виде браузер этот тег выбрасывает — живого обработчика нет.
        const host = document.createElement("div")
        host.innerHTML = html
        for (const el of Array.from(host.querySelectorAll("*")))
          for (const attr of el.getAttributeNames()) expect(attr).not.toMatch(/^on/i)

        // После санитизации живой обработчик не должен ПОЯВИТЬСЯ.
        host.innerHTML = sanitizeHtml(html)
        for (const el of Array.from(host.querySelectorAll("*")))
          for (const attr of el.getAttributeNames()) expect(attr).not.toMatch(/^on/i)
      }

      // Зеркало: тег ЗАКРЫТ и обработчик в нём живой — его обязаны вырезать, а безопасные
      // соседние атрибуты (включая значение `"onclick="`) оставить.
      const live = '<a alt=\' onclick=\'\nhref="onclick="\tonclick=alert(1)class=x">'
      const host = document.createElement("div")
      host.innerHTML = live
      expect(host.querySelector("a")?.getAttributeNames()).toContain("onclick")

      host.innerHTML = sanitizeHtml(live)
      const anchor = host.querySelector("a")
      // Раньше вырез съедал куски соседних значений, и тег переставал разбираться вовсе
      // (`<a alt=' \nhref=">` → ни одного элемента) — видимая потеря контента.
      expect(anchor).not.toBeNull()
      expect(anchor?.getAttributeNames()).not.toContain("onclick")
      expect(anchor?.getAttribute("href")).toBe("onclick=")
    })

    it("leaves double-encoded references alone — the sanitizer decodes exactly once", () => {
      // Общее правило (не исключение): санитайзер раскрывает character references столько же
      // раз, сколько HTML-парсер, — один. `&amp;#106;` даёт текст `&#106;avascript:`, это
      // относительный URL, а не схема, поэтому блокировать его было бы избыточно.
      const html = '<a href="&amp;#106;avascript:alert(1)">x</a>'
      expect(sanitizeHtml(html)).toBe(html)
    })
  })

  describe("sanitizeHtml() — decode policy: exactly one pass", () => {
    const blocked = (html: string) => expect(sanitizeHtml(html)).not.toMatch(/href|src/i)

    it("blocks payloads that reach a dangerous scheme after ONE decode", () => {
      blocked('<a href="&#106;avascript:alert(1)">x</a>')
      blocked('<a href="&#x6a;avascript:alert(1)">x</a>')
      blocked('<a href="javascript&colon;alert(1)">x</a>')
      // Control character из entity вырезается в том же единственном проходе.
      blocked('<a href="java&#9;script:alert(1)">x</a>')
    })

    it("lets double-encoded payloads through — one decode leaves an inert relative URL", () => {
      // Обе записи после одного декодирования дают байт-в-байт одинаковый текст
      // `&#106;avascript:alert(1)`. Раньше вердикты расходились: `&#38;#106;…` резался
      // (`&#38;` → `&` на первом проходе + второй проход), а `&amp;#106;…` — нет,
      // потому что `amp` отсутствует в NAMED_REFS. Теперь оба пропускаются.
      const ampNumeric = '<a href="&#38;#106;avascript:alert(1)">x</a>'
      const ampNamed = '<a href="&amp;#106;avascript:alert(1)">x</a>'
      expect(sanitizeHtml(ampNumeric)).toBe(ampNumeric)
      expect(sanitizeHtml(ampNamed)).toBe(ampNamed)
    })

    it("has no depth cliff: former-depth-6 nesting behaves like depth 2", () => {
      // Вложенность глубины n: каждый проход снимает ровно одну обёртку `&#38;`.
      // При MAX_DECODE_PASSES = 5 глубина 2-5 резалась, а 6+ проходила насквозь — вердикт
      // зависел от числа обёрток. Теперь любая глубина ≥ 2 одинаково инертна.
      const depth = (n: number) => `<a href="&${"#38;".repeat(n - 1)}#106;avascript:alert(1)">x</a>`
      expect(depth(2)).toContain('href="&#38;#106;avascript:alert(1)"')
      for (const n of [2, 5, 6, 7]) expect(sanitizeHtml(depth(n))).toBe(depth(n))
    })
  })

  describe("sanitizeHtml() — adversarial confirmation: single-decode не ослабил guard", () => {
    // Оракул «живости» — разбор ВЫВОДА настоящим HTML-парсером: строка может выглядеть
    // безобидной, а парситься в живой атрибут (и наоборот). Проверяем результат разбора,
    // а не подстроку.
    const URL_ATTRS = ["href", "src", "srcset", "action", "formaction", "background", "poster", "xlink:href"]
    const NUL = String.fromCharCode(0)
    const TAB = String.fromCharCode(9)
    const browserView = (value: string) => value.replace(/\s+/g, "").split(NUL).join("").toLowerCase()

    const parse = (html: string) => {
      const host = document.createElement("div")
      host.innerHTML = sanitizeHtml(html)
      return host
    }

    /** В разобранном выводе нет ни on*-handler'ов, ни URL-атрибута с опасной схемой. */
    const noLiveDanger = (html: string) => {
      for (const el of Array.from(parse(html).querySelectorAll("*"))) {
        for (const name of el.getAttributeNames()) {
          expect(name).not.toMatch(/^on/i)
          if (!URL_ATTRS.includes(name.toLowerCase())) continue
          expect(browserView(el.getAttribute(name) ?? "")).not.toMatch(/^(?:javascript:|vbscript:|data:text\/html)/)
        }
      }
    }

    it("blocks every single-decode spelling of a dangerous scheme", () => {
      // Расширенный корпус: всё, до чего опасная схема добирается за ОДНО декодирование.
      const payloads = [
        // hex — с нулевым padding, без `;`, в обоих регистрах маркера и цифр
        '<a href="&#x0006a;avascript:alert(1)">x</a>',
        '<a href="&#x0006aavascript:alert(1)">x</a>',
        '<a href="&#x6Aavascript:alert(1)">x</a>',
        '<a href="&#X6Aavascript:alert(1)">x</a>',
        // decimal — двоеточие без `;`, полностью закодированная схема
        '<a href="javascript&#58alert(1)">x</a>',
        '<a href="&#106avascript&#58alert(1)">x</a>',
        '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">x</a>',
        '<a href="jav&#x0000000061;script:alert(1)">x</a>',
        // именованные ссылки: регистр имени не спасает, `&tab;`/`&newline;` тоже декодируются
        '<a href="javascript&COLON;alert(1)">x</a>',
        '<a href="&#106;avascript&colon;alert(1)">x</a>',
        '<a href="java&tab;script:alert(1)">x</a>',
        '<a href="java&newline;script:alert(1)">x</a>',
        // control characters из entity и в виде префикса значения
        '<a href="java&#0;script:alert(1)">x</a>',
        '<a href="java&#10;script:alert(1)">x</a>',
        '<a href="java&#x9;script:alert(1)">x</a>',
        '<a href="&#32;javascript:alert(1)">x</a>',
        '<a href="&#9;javascript:alert(1)">x</a>',
        '<a href="   javascript:alert(1)">x</a>',
        `<a href="&#1${TAB}06;avascript:alert(1)">x</a>`,
        // регистр схемы
        '<a href="JaVaScRiPt:alert(1)">x</a>',
        '<a href="VBSCRIPT:msgbox(1)">x</a>',
        '<a href="DATA:TEXT/HTML,x">x</a>',
        // значение без кавычек
        "<a href=javascript:alert(1)>x</a>",
        "<a href=&#106;avascript:alert(1)>x</a>",
        // остальные URL-атрибуты
        '<div action="javascript:alert(1)">x</div>',
        '<video poster="javascript:alert(1)"></video>',
        '<table background="javascript:alert(1)"></table>',
        '<a x="1"xlink:href="&#118;bscript:msgbox(1)">x</a>'
      ]
      for (const html of payloads) {
        expect(sanitizeHtml(html)).not.toMatch(/javascript|vbscript|data:text\/html/i)
        noLiveDanger(html)
      }
    })

    it("сохраняет over-approximation: режет даже то, что браузер не исполнил бы", () => {
      // Спека: `&#x6aavascript:` жадно читается как U+06AA, `&COLON;` не существует (регистр
      // именованных ссылок значим), NUL в атрибуте становится U+FFFD. Ни один из этих URL
      // не запустил бы код, но санитайзер всё равно вырезает атрибут — запас прочности.
      expect(sanitizeHtml('<a href="&#x6aavascript:alert(1)">x</a>')).not.toMatch(/href/i)
      expect(sanitizeHtml('<a href="javascript&COLON;alert(1)">x</a>')).not.toMatch(/href/i)
      expect(sanitizeHtml(`<a href="java${NUL}script:alert(1)">x</a>`)).not.toMatch(/href/i)
    })

    it("оставляет double-encoded значения нетронутыми, и они инертны при разборе", () => {
      // Каждая запись после ОДНОГО декодирования — относительный URL, а не схема. Проверяем
      // не строку, а `a.protocol` после разбора: браузер резолвит их относительно документа.
      const inert: Array<[string, string]> = [
        ['<a href="&amp;#106;avascript:alert(1)">x</a>', "&#106;avascript:alert(1)"],
        ['<a href="&#38;#106;avascript:alert(1)">x</a>', "&#106;avascript:alert(1)"],
        ['<a href="&#x26;#106;avascript:alert(1)">x</a>', "&#106;avascript:alert(1)"],
        ['<a href="&AMP;#106;avascript:alert(1)">x</a>', "&#106;avascript:alert(1)"],
        ['<a href="&amp;#x6a;avascript:alert(1)">x</a>', "&#x6a;avascript:alert(1)"],
        ['<a href="&#38;#x6a;avascript:alert(1)">x</a>', "&#x6a;avascript:alert(1)"],
        ['<a href="javascript&amp;colon;alert(1)">x</a>', "javascript&colon;alert(1)"],
        ['<a href="javascript&#38;colon;alert(1)">x</a>', "javascript&colon;alert(1)"],
        ['<a href="jav&#38;#97;script:alert(1)">x</a>', "jav&#97;script:alert(1)"],
        ['<a href="&#106;&#38;#97;vascript:alert(1)">x</a>', "j&#97;vascript:alert(1)"]
      ]
      for (const [html, decodedOnce] of inert) {
        expect(sanitizeHtml(html)).toBe(html)
        const a = parse(html).querySelector("a") as HTMLAnchorElement
        expect(a.getAttribute("href")).toBe(decodedOnce)
        expect(a.protocol).not.toBe("javascript:")
        expect(a.protocol).not.toBe("vbscript:")
        noLiveDanger(html)
      }
    })

    it("в цепочке дубликатов побеждает инертное значение, а не опасное", () => {
      // Дубликаты атрибутов: парсер оставляет ПЕРВЫЙ. Раньше первый (double-encoded) вырезался
      // и выигрывал безопасный `/ok.png`; теперь выигрывает double-encoded — но он инертен,
      // а опасный `onerror` по-прежнему вырезан.
      const html = '<img src="&#38;#106;avascript:a"onerror="alert(1)"src="/ok.png">'
      const out = sanitizeHtml(html)
      expect(out).not.toMatch(/onerror/i)
      const img = parse(html).querySelector("img") as Element
      expect(img.getAttributeNames()).toEqual(["src"])
      expect(img.getAttribute("src")).toBe("&#106;avascript:a")
      expect(new URL(img.getAttribute("src") as string, "https://example.test/").protocol).toBe("https:")
      noLiveDanger(html)
    })

    it("ранее исправленные дефекты остаются исправленными", () => {
      // Безопасный атрибут перед опасным — опасный всё равно вырезается.
      expect(sanitizeHtml('<a href="/ok"href="&#x6a;avascript:alert(1)">y</a>')).toBe('<a href="/ok">y</a>')
      expect(sanitizeHtml('<img alt="1" src="/ok.png"src="&#x6a;avascript:x">')).toBe('<img alt="1" src="/ok.png">')
      // Опасный + разрешённый инертный + безопасный: живой схемы не остаётся.
      const chain = '<a href="javascript:a"href="&amp;#106;avascript:b"href="/ok">y</a>'
      expect(sanitizeHtml(chain)).not.toMatch(/javascript:a/)
      noLiveDanger(chain)
      // Нет склейки токенов при удалении атрибута с entity-значением.
      expect(sanitizeHtml('<scr href="&#x6a;avascript:x"ipt>alert(1)</script>')).not.toMatch(/<script/i)
    })

    it("не зависит от глубины вложенности по времени", () => {
      // Цикла проходов нет ⇒ стоимость линейна по длине входа: глубина 2000 обрабатывается
      // так же, как глубина 2 (раньше цена росла до MAX_DECODE_PASSES).
      const deep = `<a href="&${"#38;".repeat(2000)}#106;avascript:alert(1)">x</a>`
      const wide = `<a href="${"&#38;".repeat(5000)}&#106;avascript:x">y</a>`
      const started = Date.now()
      expect(sanitizeHtml(deep)).toBe(deep)
      expect(sanitizeHtml(wide)).toBe(wide)
      expect(Date.now() - started).toBeLessThan(1000)
    })
  })

  describe("Slots — subtitle (Issue 1)", () => {
    it("renders subtitle prop as plain text when no #subtitle slot is provided", () => {
      const wrapper = mount(Alert, {
        props: { modelValue: true, subtitle: "Plain text subtitle" }
      })
      expect(wrapper.find("[data-alert-subtitle]").text()).toBe("Plain text subtitle")
    })

    it("renders custom #subtitle slot content when provided", () => {
      const wrapper = mount(Alert, {
        props: { modelValue: true, subtitle: "fallback" },
        slots: { subtitle: "<strong data-custom-subtitle>Custom subtitle</strong>" }
      })
      const subtitle = wrapper.find("[data-alert-subtitle]")
      expect(subtitle.exists()).toBe(true)
      expect(subtitle.find("[data-custom-subtitle]").exists()).toBe(true)
      expect(subtitle.text()).toContain("Custom subtitle")
      // when slot is used, fallback "fallback" should not also be rendered
      expect(subtitle.text()).not.toContain("fallback")
    })
  })

  describe("Accessibility — ARIA role/aria-live (Issue 3)", () => {
    it.each([
      { type: "error" as const, role: "alert", live: "assertive" },
      { type: "warning" as const, role: "alert", live: "assertive" }
    ])("type '%s' uses role='alert' + aria-live='assertive'", ({ type, role, live }) => {
      const wrapper = mount(Alert, { props: { modelValue: true, type } })
      const root = wrapper.find("[data-alert]")
      expect(root.attributes("role")).toBe(role)
      expect(root.attributes("aria-live")).toBe(live)
      expect(root.attributes("aria-atomic")).toBe("true")
    })

    it.each([
      { type: "success" as const, role: "status", live: "polite" },
      { type: "info" as const, role: "status", live: "polite" },
      { type: "neutral" as const, role: "status", live: "polite" }
    ])("type '%s' uses role='status' + aria-live='polite'", ({ type, role, live }) => {
      const wrapper = mount(Alert, { props: { modelValue: true, type } })
      const root = wrapper.find("[data-alert]")
      expect(root.attributes("role")).toBe(role)
      expect(root.attributes("aria-live")).toBe(live)
      expect(root.attributes("aria-atomic")).toBe("true")
    })
  })

  describe("Motion — prefers-reduced-motion (Issue 9)", () => {
    it("transition classes use motion-safe: prefix on root style injection", () => {
      const wrapper = mount(Alert, { props: { modelValue: true } })
      const html = wrapper.html()
      expect(html).toMatch(/motion-safe:transition/)
      expect(html).toMatch(/motion-safe:duration/)
    })
  })

  describe("Close button — localized aria-label (Issue 6 partial)", () => {
    it("uses 'Close' aria-label by default (en locale)", () => {
      const app: any = createApp({})
      app.use(FishtVue, {
        locale: { activeLocale: "en", defaultLocale: "en" }
      })
      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: { modelValue: true, closeButton: true }
      })
      const button = wrapper.find("[data-alert-button] button")
      expect(button.attributes("aria-label")).toBe("Close")
    })

    it("uses 'Закрыть' aria-label when active locale is 'ru'", () => {
      const app: any = createApp({})
      app.use(FishtVue, {
        locale: { activeLocale: "ru", defaultLocale: "ru" }
      })
      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: { modelValue: true, closeButton: true }
      })
      const button = wrapper.find("[data-alert-button] button")
      expect(button.attributes("aria-label")).toBe("Закрыть")
    })
  })

  describe("openAlert — Vue-bound cleanup (Issue 2)", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
    })

    it("cleanly unmounts via Vue when close button is clicked (no orphaned DOM)", async () => {
      vi.useFakeTimers()
      openAlert({ closeButton: true, position: "top" })

      const closeButton = document.querySelector("[data-alert-button] [data-button]")
      expect(closeButton).not.toBeNull()
      closeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))

      vi.advanceTimersByTime(700)
      expect(document.querySelector("[data-alert]")).toBeNull()
      expect(document.querySelector(".alert-top")).toBeNull()
      vi.useRealTimers()
    })

    it("cleans up cleanly after displayTime expiration (no leaked listeners)", async () => {
      vi.useFakeTimers()
      openAlert({ displayTime: 500, position: "top" })
      expect(document.querySelector("[data-alert]")).not.toBeNull()

      vi.advanceTimersByTime(1500)
      expect(document.querySelector("[data-alert]")).toBeNull()
      vi.useRealTimers()
    })

    it("preserves stacking when multiple alerts share a position container", () => {
      openAlert({ title: "first", position: "top" })
      openAlert({ title: "second", position: "top" })
      openAlert({ title: "third", position: "top" })

      const container = document.querySelector(".alert-top")
      expect(container).not.toBeNull()
      expect(container?.querySelectorAll("[data-alert]").length).toBe(3)
    })
  })

  // -------------------------------------------------------------------------
  // Audit fixes (2026-06-14): unstyled (L53), RTL logical position (Issue 7 /
  // F31), mobile-first responsive gutters.
  // -------------------------------------------------------------------------

  describe("Configuration support — unstyled (L53)", () => {
    afterEach(() => {
      // window.FishtVue — глобальный singleton, утекает между тестами (см. memory).
      delete (window as any).FishtVue
    })

    it("strips all classes from the styled root when global unstyled: true", () => {
      const app: any = createApp({})
      app.use(FishtVue, { unstyled: true })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: { modelValue: true }
      })

      const styled = wrapper.find("[data-alert] > div")
      expect((styled.attributes("class") ?? "").trim()).toBe("fv")
    })

    it("keeps classes when unstyled is not set (contrast)", () => {
      const wrapper = mount(Alert, { props: { modelValue: true } })
      const styled = wrapper.find("[data-alert] > div")
      expect(styled.attributes("class")).toContain("alert-body")
    })
  })

  describe("RTL & logical position (Issue 7 / F31)", () => {
    it.each(["top", "bottom", "center", "start", "end"] as AlertProps["position"][])(
      "passes through logical position '%s'",
      (position) => {
        const wrapper = mount(Alert, { props: { modelValue: true, position } })
        expect(wrapper.vm.positionLogical).toBe(position)
      }
    )

    it("uses logical margin (ms-3) on content, not physical ml-3", () => {
      const wrapper = mount(Alert, { props: { modelValue: true, title: "t", subtitle: "s" } })
      const content = wrapper.find("[data-alert-content]")
      expect(content.attributes("class")).toContain("ms-3")
      expect(content.attributes("class")).not.toContain("ml-3")
    })

    it("uses logical close-button spacing (ms-auto ps-3), not physical ml-auto pl-3", () => {
      const wrapper = mount(Alert, { props: { modelValue: true, closeButton: true } })
      const btnBox = wrapper.find("[data-alert-button]")
      expect(btnBox.attributes("class")).toContain("ms-auto")
      expect(btnBox.attributes("class")).toContain("ps-3")
      expect(btnBox.attributes("class")).not.toContain("ml-auto")
      expect(btnBox.attributes("class")).not.toContain("pl-3")
    })

    it("flips slide-in translate in RTL for logical 'start'", () => {
      const wrapper = mount(Alert, { props: { modelValue: true, position: "start" } })
      expect(wrapper.vm.startEnterAndLeaveClass).toContain("-translate-x-[200%]")
      expect(wrapper.vm.startEnterAndLeaveClass).toContain("rtl:translate-x-[200%]")
    })

    it("flips slide-in translate in RTL for logical 'end'", () => {
      const wrapper = mount(Alert, { props: { modelValue: true, position: "end" } })
      expect(wrapper.vm.startEnterAndLeaveClass).toContain("translate-x-[200%]")
      expect(wrapper.vm.startEnterAndLeaveClass).toContain("rtl:-translate-x-[200%]")
    })

    it("does not warn for logical position", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mount(Alert, { props: { modelValue: true, position: "start" } })
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    // A2 — поведенческие кейсы с реальным dir="rtl" на <body>.
    // ВАЖНО: jsdom не вычисляет `direction` и logical properties (getComputedStyle их не
    // резолвит), а tailwind()-движок в тестах не запускается — поэтому проверки СТРУКТУРНЫЕ:
    // разметка под dir="rtl" остаётся на logical-утилитах (ms/ps/start/end) и не содержит
    // физических ml/pl/left. Что alert реально уезжает вправо — проверяется только в
    // настоящем браузере (Playwright), это вне scope unit-тестов.
    it("renders with logical (not physical) spacing inside a dir='rtl' body", () => {
      document.body.dir = "rtl"
      const wrapper = mount(Alert, {
        props: { modelValue: true, title: "t", subtitle: "s", closeButton: true },
        attachTo: document.body
      })
      try {
        expect(wrapper.find("[data-alert]").element.closest("[dir='rtl']")).toBe(document.body)

        const content = wrapper.find("[data-alert-content]")
        expect(content.attributes("class")).toContain("ms-3")
        expect(content.attributes("class")).not.toContain("ml-3")

        const btnBox = wrapper.find("[data-alert-button]")
        expect(btnBox.attributes("class")).toContain("ms-auto")
        expect(btnBox.attributes("class")).toContain("ps-3")
        expect(btnBox.attributes("class")).not.toContain("ml-auto")
        expect(btnBox.attributes("class")).not.toContain("pl-3")
      } finally {
        document.body.dir = ""
        wrapper.unmount()
      }
    })

    it("keeps the rtl: translate flip on the slide-in class inside a dir='rtl' body", () => {
      document.body.dir = "rtl"
      const wrapper = mount(Alert, {
        props: { modelValue: true, position: "start" },
        attachTo: document.body
      })
      try {
        expect(wrapper.vm.positionLogical).toBe("start")
        expect(wrapper.vm.startEnterAndLeaveClass).toContain("rtl:translate-x-[200%]")
      } finally {
        document.body.dir = ""
        wrapper.unmount()
      }
    })

    it.each([
      { position: "start", side: "start-0", padding: "ps-3", items: "items-start", physical: ["left-0", "pl-3"] },
      { position: "end", side: "end-0", padding: "pe-3", items: "items-end", physical: ["right-0", "pr-3"] }
    ])(
      "openAlert container for logical '$position' stays logical inside a dir='rtl' body",
      ({ position, side, padding, items, physical }) => {
        document.body.innerHTML = ""
        document.body.dir = "rtl"
        try {
          openAlert({ position: position as AlertPosition })

          const container = document.querySelector(`.alert-${position}`)
          expect(container).not.toBeNull()
          expect(container?.closest("[dir='rtl']")).toBe(document.body)
          expect(container?.querySelector("[data-alert]")).not.toBeNull()

          expect(container?.className).toContain(side)
          expect(container?.className).toContain(padding)
          expect(container?.className).toContain(items)
          physical.forEach((cls) => expect(container?.className).not.toContain(cls))
        } finally {
          document.body.dir = ""
          document.body.innerHTML = ""
        }
      }
    )
  })

  describe("Mobile-first responsive gutters", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
    })

    it("uses smaller body padding on mobile (p-3) + sm: on desktop (sm:p-4)", () => {
      const wrapper = mount(Alert, { props: { modelValue: true } })
      const body = wrapper.find("[data-alert] > div")
      expect(body.attributes("class")).toContain("p-3")
      expect(body.attributes("class")).toContain("sm:p-4")
    })

    it("openAlert container uses mobile-first gutters (gap-3 / sm:gap-4, pt-3 / sm:pt-5)", () => {
      openAlert({ position: "top" })
      const container = document.querySelector(".alert-top")
      expect(container?.className).toContain("gap-3")
      expect(container?.className).toContain("sm:gap-4")
      expect(container?.className).toContain("pt-3")
      expect(container?.className).toContain("sm:pt-5")
    })
  })
})

// Контракт props 1.0.0 (dev-patterns §2 A–D, F): `class` переехал с карточки на корень,
// карточка адресуется `classes.body`; precedence props/options выправлен helper'ом.
describe("Alert — контракт props 1.0.0", () => {
  afterEach(() => {
    delete (window as any).FishtVue
  })

  const withOptions = (options: any = {}, extra: any = {}) => ({
    install(app: any) {
      app.use(FishtVue, { componentsOptions: { Alert: options }, ...extra })
    }
  })
  const OPEN = { modelValue: true, title: "T", subtitle: "S" }

  it("отсутствующие булевы приходят `undefined`, а не скастованными в false", () => {
    const wrapper = mount(Alert, { props: OPEN })

    expect(wrapper.props("animated")).toBeUndefined()
    expect(wrapper.props("closeButton")).toBeUndefined()
    expect(wrapper.props("teleport")).toBeUndefined()
  })

  it("`class` уходит только на корень и не протекает во внутренние элементы", () => {
    const wrapper = mount(Alert, { props: { ...OPEN, class: "probe-root", closeButton: true } })
    const root = wrapper.find("[data-alert]")

    expect(root.classes()).toContain("probe-root")
    expect(root.element.querySelectorAll("[class~='probe-root']")).toHaveLength(0)
  })

  it.each([
    ["body", "[data-alert-body]"],
    ["icon", "[data-alert-icon]"],
    ["content", "[data-alert-content]"],
    ["title", "[data-alert-title]"],
    ["subtitle", "[data-alert-subtitle]"],
    ["close", "[data-alert-button]"]
  ] as Array<[AlertClassKey, string]>)("classes.%s доезжает до своего элемента", (key, selector) => {
    const wrapper = mount(Alert, {
      props: { ...OPEN, closeButton: true, classes: { [key]: "probe-key" } }
    })

    expect(wrapper.find(selector).classes()).toContain("probe-key")
    expect(wrapper.find("[data-alert]").classes()).not.toContain("probe-key")
  })

  it("props.class перебивает options.class (до 1.0.0 precedence была инвертирована)", () => {
    const wrapper = mount(Alert, {
      props: { ...OPEN, class: "p-8" },
      global: { plugins: [withOptions({ class: "p-2 opt-only" })] }
    })
    const classes = wrapper.find("[data-alert]").classes()

    expect(classes).toContain("p-8")
    expect(classes).toContain("opt-only")
    expect(classes).not.toContain("p-2")
  })

  it("props.classes перебивает options.classes, неконфликтный класс options остаётся", () => {
    const wrapper = mount(Alert, {
      props: { ...OPEN, classes: { title: "p-8" } },
      global: { plugins: [withOptions({ classes: { title: "p-2 italic" } })] }
    })
    const classes = wrapper.find("[data-alert-title]").classes()

    expect(classes).toContain("p-8")
    expect(classes).not.toContain("p-2")
    expect(classes).toContain("italic")
  })

  it("`animated` — positive-инверсия: default true даёт directional transition-класс", () => {
    const animated = mount(Alert, { props: { ...OPEN, position: "top" } })
    expect(String((animated.vm as any).startEnterAndLeaveClass)).toContain("-translate-y-[200%]")

    const plain = mount(Alert, { props: { ...OPEN, position: "top", animated: false } })
    expect(String((plain.vm as any).startEnterAndLeaveClass)).toContain("opacity-0")
    expect(String((plain.vm as any).startEnterAndLeaveClass)).not.toContain("translate")
  })

  it("снятый `notAnimate` больше не влияет — падает fallthrough-атрибутом", () => {
    const wrapper = mount(Alert, { props: { ...OPEN, position: "top", notAnimate: true } as any })

    expect(String((wrapper.vm as any).startEnterAndLeaveClass)).toContain("-translate-y-[200%]")
  })

  it("unstyled сохраняет классы потребителя и режет тему", () => {
    const wrapper = mount(Alert, {
      props: { ...OPEN, class: "probe-root", classes: { body: "probe-body" } },
      global: { plugins: [withOptions({}, { unstyled: true })] }
    })

    // На корне дополнительно живут transition-классы (`<transition appear>` вешает enter-*).
    const root = wrapper.find("[data-alert]").classes()
    expect(root).toContain("fv")
    expect(root).toContain("probe-root")
    expect(root.some((c) => c.startsWith("fishtvue-"))).toBe(false)
    expect(wrapper.find("[data-alert-body]").classes()).toEqual(["fv", "probe-body"])
  })

  it("expose отдаёт classBase (корень) и classBody (карточка)", () => {
    const wrapper = mount(Alert, { props: OPEN })
    const vm = wrapper.vm as any

    expect(typeof vm.classBase).toBe("string")
    expect(String(vm.classBody)).toContain("alert-body")
  })
})
