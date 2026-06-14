import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"
import Alert from "fishtvue/alert/Alert.vue"
import { openAlert } from "fishtvue/alert/openAlert"
import { sanitizeHtml } from "fishtvue/alert/sanitizeHtml"
import { AlertPosition, AlertProps } from "fishtvue/alert/Alert"

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
        { type: "success", expectClass: "bg-green-50 dark:bg-green-950" },
        { type: "warning", expectClass: "bg-yellow-50 dark:bg-yellow-950" },
        {
          type: "info",
          expectClass: "bg-blue-50 dark:bg-blue-950"
        },
        { type: "error", expectClass: "bg-red-50 dark:bg-red-950" },
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
      it.each(["top", "bottom", "left", "right", "center"] as AlertProps["position"][])(
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
      it("should apply custom class to alert", () => {
        const customClass = "custom-alert-class"
        const wrapper = mount(Alert, {
          props: { class: customClass, modelValue: true }
        })

        expect(wrapper.find("[data-alert] > div").attributes("class")).toContain(customClass)
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
      success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-green-400 dark:text-green-600">
  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path>
</svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-yellow-400 dark:text-yellow-600">
  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"></path>
</svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-blue-400 dark:text-blue-600">
  <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd"></path>
</svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-alert h-5 w-5 text-red-400 dark:text-red-600">
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

      openAlert({ toTeleport: "#custom-teleport" })

      const alertElement = teleportTarget.querySelector(`[data-alert]`)
      expect(alertElement).not.toBeNull()
    })

    it("should log a warning if teleport target is not found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      openAlert({ toTeleport: "#non-existent" })

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

      it.each([
        { physical: "left", logical: "start" },
        { physical: "right", logical: "end" },
        { physical: "top-left", logical: "top-start" },
        { physical: "top-right", logical: "top-end" },
        { physical: "bottom-left", logical: "bottom-start" },
        { physical: "bottom-right", logical: "bottom-end" }
      ])(
        "maps deprecated physical '$physical' → logical container '.alert-$logical' (+ dev-warn)",
        ({ physical, logical }) => {
          const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
          openAlert({ position: physical as AlertPosition })

          expect(document.querySelector(`.alert-${logical}`)).not.toBeNull()
          expect(document.querySelector(`.alert-${physical}`)).toBeNull()
          expect(warn).toHaveBeenCalled()
          warn.mockRestore()
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
      expect((styled.attributes("class") ?? "").trim()).toBe("")
    })

    it("keeps classes when unstyled is not set (contrast)", () => {
      const wrapper = mount(Alert, { props: { modelValue: true } })
      const styled = wrapper.find("[data-alert] > div")
      expect(styled.attributes("class")).toContain("alert-body")
    })
  })

  describe("RTL & logical position (Issue 7 / F31)", () => {
    it.each([
      { input: "left", logical: "start" },
      { input: "right", logical: "end" }
    ])("maps deprecated physical position '$input' → '$logical' (positionLogical)", ({ input, logical }) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      const wrapper = mount(Alert, {
        props: { modelValue: true, position: input as AlertProps["position"] }
      })
      expect(wrapper.vm.positionLogical).toBe(logical)
      warn.mockRestore()
    })

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

    it("warns in dev when deprecated physical position is used", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mount(Alert, { props: { modelValue: true, position: "left" } })
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it("does not warn for logical position", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mount(Alert, { props: { modelValue: true, position: "start" } })
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
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
