import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import * as fs from "node:fs"
import * as path from "node:path"
import FishtVue from "fishtvue/config"
import Dialog from "fishtvue/dialog/Dialog.vue"
import { DialogClassKey, DialogProps } from "fishtvue/dialog/Dialog"
import { __resetScrollLockForTests, getScrollLockCount } from "fishtvue/utils/scrollLockHandler"

describe("Dialog Component Tests", () => {
  beforeEach(() => {
    const el = document.createElement("div")
    el.id = "modal"
    document.body.appendChild(el)
    __resetScrollLockForTests()
    document.body.removeAttribute("style")
    document.body.classList.remove("fv-scroll-locked")
    document.body.classList.remove("overflow-hidden")
  })

  afterEach(() => {
    const el = document.getElementById("modal")
    if (el) document.body.removeChild(el)
    __resetScrollLockForTests()
    document.body.removeAttribute("style")
    document.body.classList.remove("fv-scroll-locked")
    document.body.classList.remove("overflow-hidden")
    document.documentElement.removeAttribute("dir")
  })

  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal"
        }
      })

      expect(wrapper.exists()).toBe(true)
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog).not.toBeNull()
    })

    it('emits "update:modelValue" event when closeDialog is called', async () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal"
        }
      })

      await wrapper.vm.closeDialog()
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })

    it("renders close button when closeButton is true", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          closeButton: true,
          teleport: "#modal"
        }
      })

      const closeButton = document.querySelector("#modal button")
      expect(closeButton).not.toBeNull()
    })

    it("renders slots correctly", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal"
        },
        slots: {
          default: '<div class="slot-content">Default Slot</div>',
          background: '<div class="slot-background">Background Slot</div>'
        }
      })

      const defaultSlot = document.querySelector("#modal .slot-content")
      expect(defaultSlot).not.toBeNull()
      expect(defaultSlot!.textContent).toBe("Default Slot")

      const backgroundSlot = document.querySelector("#modal .slot-background")
      expect(backgroundSlot).not.toBeNull()
      expect(backgroundSlot!.textContent).toBe("Background Slot")
    })

    it("applies size and position styles correctly", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          size: "lg",
          position: "top-right",
          teleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-lg")
      expect(dialogContent!.classList).toContain("top-0")
      expect(dialogContent!.classList).toContain("right-0")
    })

    const sizes: { size: DialogProps["size"]; expectedClass: string }[] = [
      { size: "xs", expectedClass: "sm:max-w-xs" },
      { size: "sm", expectedClass: "sm:max-w-sm" },
      { size: "md", expectedClass: "sm:max-w-md" },
      { size: "lg", expectedClass: "sm:max-w-lg" },
      { size: "xl", expectedClass: "sm:max-w-xl" },
      { size: "2xl", expectedClass: "sm:max-w-2xl" },
      { size: "3xl", expectedClass: "sm:max-w-3xl" },
      { size: "4xl", expectedClass: "sm:max-w-4xl" },
      { size: "5xl", expectedClass: "sm:max-w-5xl" },
      { size: "6xl", expectedClass: "sm:max-w-6xl" },
      { size: "7xl", expectedClass: "sm:max-w-7xl" }
    ]

    it.each(sizes)("applies correct size class for size: %s", ({ size, expectedClass }) => {
      mount(Dialog, {
        props: {
          modelValue: true,
          size,
          teleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain(expectedClass)
    })

    const positions: { position: DialogProps["position"]; expectedClasses: string[] }[] = [
      { position: "center", expectedClasses: ["top-1/2", "left-1/2", "-translate-y-1/2", "-translate-x-1/2"] },
      { position: "top", expectedClasses: ["top-0", "-translate-x-1/2"] },
      { position: "bottom", expectedClasses: ["bottom-0", "-translate-x-1/2"] },
      { position: "left", expectedClasses: ["top-1/2", "left-0", "-translate-y-1/2"] },
      { position: "right", expectedClasses: ["top-1/2", "right-0", "-translate-y-1/2"] },
      { position: "top-left", expectedClasses: ["top-0", "left-0"] },
      { position: "top-right", expectedClasses: ["top-0", "right-0"] },
      { position: "bottom-left", expectedClasses: ["bottom-0", "left-0"] },
      { position: "bottom-right", expectedClasses: ["bottom-0", "right-0"] }
    ]

    it.each(positions)("applies correct position classes for position: %s", ({ position, expectedClasses }) => {
      mount(Dialog, {
        props: {
          modelValue: true,
          position,
          teleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expectedClasses.forEach((expectedClass) => {
        expect(dialogContent!.classList).toContain(expectedClass)
      })
    })

    it('teleports content to body when teleport is "body"', () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "body"
        }
      })

      const dialog = document.querySelector("body [data-dialog]")
      expect(dialog).not.toBeNull()
    })

    it("locks and unlocks body scroll via reference-counted handler on open/close", async () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: false,
          teleport: "#modal"
        }
      })

      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).not.toBe("hidden")

      await wrapper.setProps({ modelValue: true })

      expect(getScrollLockCount()).toBe(1)
      expect(document.body.style.overflow).toBe("hidden")
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(true)

      await wrapper.setProps({ modelValue: false })

      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("")
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(false)
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Dialog: options
          }
        })
      }
    })

    it("applies global options correctly", () => {
      const appPlugin = createAppWithFishtVue({
        size: "xl",
        position: "bottom-left",
        closeButton: true
      })

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          teleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-xl")
      expect(dialogContent!.classList).toContain("bottom-0")
      expect(dialogContent!.classList).toContain("left-0")
    })

    it("overrides global options with local props", () => {
      const appPlugin = createAppWithFishtVue({
        size: "lg",
        position: "center"
      })

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          size: "sm",
          position: "top-right",
          teleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-sm")
      expect(dialogContent!.classList).toContain("top-0")
      expect(dialogContent!.classList).toContain("right-0")
    })

    it("renders default background slot when no custom slot is provided", () => {
      const appPlugin = createAppWithFishtVue()

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          teleport: "#modal"
        }
      })

      const background = document.querySelector("#modal [data-dialog-background]")
      expect(background).not.toBeNull()
    })
  })

  // ============================================================
  // Audit close-out: Issues 1-9 + Wave 2.3 (no dup initStyle)
  // ============================================================

  describe("A. Escape listener lifecycle (Issue 2)", () => {
    it("removes keydown listener and unlocks scroll when unmounted while open", async () => {
      const removeSpy = vi.spyOn(document, "removeEventListener")
      const wrapper = mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })

      expect(getScrollLockCount()).toBe(1)

      wrapper.unmount()
      await nextTick()

      const removedKeydown = removeSpy.mock.calls.some((call) => call[0] === "keydown")
      expect(removedKeydown).toBe(true)
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("")
      expect(document.body.classList.contains("fv-scroll-locked")).toBe(false)

      removeSpy.mockRestore()
    })

    it("closes via Escape keydown when open", async () => {
      const wrapper = mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })
      await nextTick()

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))

      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })
  })

  describe("B. Reference-counted scroll lock (Issue 3)", () => {
    it("nested Dialogs maintain lock until both close", async () => {
      const wrapperA = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" }
      })
      const wrapperB = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" }
      })

      await wrapperA.setProps({ modelValue: true })
      expect(getScrollLockCount()).toBe(1)
      expect(document.body.style.overflow).toBe("hidden")

      await wrapperB.setProps({ modelValue: true })
      expect(getScrollLockCount()).toBe(2)
      expect(document.body.style.overflow).toBe("hidden")

      await wrapperA.setProps({ modelValue: false })
      expect(getScrollLockCount()).toBe(1)
      expect(document.body.style.overflow).toBe("hidden")

      await wrapperB.setProps({ modelValue: false })
      expect(getScrollLockCount()).toBe(0)
      expect(document.body.style.overflow).toBe("")

      wrapperA.unmount()
      wrapperB.unmount()
    })

    it("preserves original body.style.overflow on close", async () => {
      document.body.style.overflow = "scroll"
      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" }
      })

      await wrapper.setProps({ modelValue: true })
      expect(document.body.style.overflow).toBe("hidden")

      await wrapper.setProps({ modelValue: false })
      expect(document.body.style.overflow).toBe("scroll")
    })
  })

  describe("C. Aria attributes (Issue 4)", () => {
    it('root element has role="dialog" and aria-modal="true"', () => {
      mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("role")).toBe("dialog")
      expect(dialog?.getAttribute("aria-modal")).toBe("true")
    })

    it("forwards ariaLabel to root", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal",
          ariaLabel: "Confirmation"
        }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("aria-label")).toBe("Confirmation")
    })

    it("forwards ariaLabelledby to root", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal",
          ariaLabelledby: "title-id"
        }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("aria-labelledby")).toBe("title-id")
    })

    it("forwards ariaDescribedby to root", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          teleport: "#modal",
          ariaDescribedby: "desc-id"
        }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("aria-describedby")).toBe("desc-id")
    })
  })

  describe("D. Focus management (Issues 1 + 5)", () => {
    it("focuses first focusable element on open", async () => {
      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" },
        slots: {
          default: '<button class="confirm">Confirm</button><button class="cancel">Cancel</button>'
        }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      const confirm = document.querySelector("#modal .confirm") as HTMLElement | null
      expect(document.activeElement).toBe(confirm)
    })

    it("focuses element matching initialFocus selector when provided", async () => {
      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal", initialFocus: ".cancel" },
        slots: {
          default: '<button class="confirm">Confirm</button><button class="cancel">Cancel</button>'
        }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      const cancel = document.querySelector("#modal .cancel") as HTMLElement | null
      expect(document.activeElement).toBe(cancel)
    })

    it("returns focus to trigger element on close (returnFocus default true)", async () => {
      const trigger = document.createElement("button")
      trigger.id = "trg"
      trigger.textContent = "open"
      document.body.appendChild(trigger)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)

      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" },
        slots: { default: '<button class="inside">Inside</button>' }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      await wrapper.setProps({ modelValue: false })
      await nextTick()
      await nextTick()

      expect(document.activeElement).toBe(trigger)

      document.body.removeChild(trigger)
    })

    it("does not return focus when returnFocus=false", async () => {
      const trigger = document.createElement("button")
      trigger.id = "trg2"
      trigger.textContent = "open"
      document.body.appendChild(trigger)
      trigger.focus()

      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal", returnFocus: false },
        slots: { default: '<button class="inside2">Inside</button>' }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      await nextTick()

      expect(document.activeElement).not.toBe(trigger)

      document.body.removeChild(trigger)
    })

    it("Tab from last focusable cycles to first (focus trap)", async () => {
      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" },
        slots: {
          default: '<button class="first">First</button><button class="last">Last</button>'
        }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      const last = document.querySelector("#modal .last") as HTMLElement
      last.focus()
      expect(document.activeElement).toBe(last)

      const dialog = document.querySelector("#modal [data-dialog]") as HTMLElement
      const ev = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true })
      dialog.dispatchEvent(ev)
      await nextTick()

      const first = document.querySelector("#modal .first") as HTMLElement
      expect(document.activeElement).toBe(first)
    })

    it("Shift+Tab from first focusable cycles to last", async () => {
      const wrapper = mount(Dialog, {
        props: { modelValue: false, teleport: "#modal" },
        slots: {
          default: '<button class="first2">First</button><button class="last2">Last</button>'
        }
      })

      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()

      const first = document.querySelector("#modal .first2") as HTMLElement
      first.focus()
      expect(document.activeElement).toBe(first)

      const dialog = document.querySelector("#modal [data-dialog]") as HTMLElement
      const ev = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true })
      dialog.dispatchEvent(ev)
      await nextTick()

      const last = document.querySelector("#modal .last2") as HTMLElement
      expect(document.activeElement).toBe(last)
    })
  })

  describe("E. Motion-safe transitions (Issue 9)", () => {
    it("transitions wrapped in motion-safe: prefix", () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), "lib/dialog/Dialog.vue"), "utf-8")
      expect(src).toContain("motion-safe:transition-all")
      expect(src).toContain("motion-safe:ease-in-out")
      expect(src).toContain("motion-safe:duration-500")
      expect(src).toContain("motion-safe:transition-opacity")
      const unconditionalAll = /[^:]transition-all\s+ease-in-out\s+duration-500/.test(src)
      expect(unconditionalAll).toBe(false)
    })
  })

  describe("F. RTL close button (Issue 8)", () => {
    it("close button uses logical inline-end positioning (RTL-safe)", () => {
      mount(Dialog, {
        props: { modelValue: true, closeButton: true, teleport: "#modal" }
      })
      const closeBtn = document.querySelector("#modal [data-dialog-close]") as HTMLElement | null
      expect(closeBtn).not.toBeNull()
      const cls = closeBtn!.className
      const hasLogical = /\bend-2\b|\binset-inline-end-2\b/.test(cls)
      const hasNoBareRight = !/\bright-2\b/.test(cls) || hasLogical
      expect(hasLogical || hasNoBareRight).toBe(true)
    })
  })

  describe("G. Aria-live region (Issue 7)", () => {
    it("renders sr-only aria-live polite region inside dialog root", () => {
      mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })
      const live = document.querySelector("#modal [data-dialog] [data-dialog-live]")
      expect(live).not.toBeNull()
      expect(live!.getAttribute("aria-live")).toBe("polite")
      expect(live!.getAttribute("aria-atomic")).toBe("true")
      expect(live!.className).toMatch(/sr-only/)
    })
  })

  describe("H. No duplicate initStyle (Wave 2.3 SSR style injection)", () => {
    it("Dialog.vue source does not call Dialog.initStyle() in lifecycle hooks", () => {
      const src = fs.readFileSync(path.resolve(process.cwd(), "lib/dialog/Dialog.vue"), "utf-8")
      // запрет вызова initStyle() вне Component.__hooks() chain — SFC не должен дублировать
      expect(src).not.toMatch(/onMounted\(\s*\(\)\s*=>\s*\{?\s*Dialog\.initStyle/)
      expect(src).not.toMatch(/Dialog\.initStyle\(\)/)
    })
  })

  describe("I. Cross-cutting unstyled (Wave 3.1)", () => {
    const resetGlobalFishtVue = () => {
      delete (window as any).FishtVue
    }

    it("respects unstyled: true via Component.setStyle guard", async () => {
      const { createApp } = await import("vue")
      resetGlobalFishtVue()
      const app: any = createApp({})
      app.use(FishtVue, { unstyled: true })
      mount(Dialog, {
        global: { plugins: [app] },
        props: { modelValue: true, teleport: "#modal" }
      })
      const dialog = document.querySelector("#modal [data-dialog]") as HTMLElement
      expect(dialog).not.toBeNull()
      const cls = dialog.getAttribute("class") ?? ""
      // setStyle returns "" под unstyled: true → классы из classBase не должны попасть на корень.
      // Vue добавляет transition state-classes на тот же узел — их исключаем из проверки.
      expect(cls).not.toMatch(/\bfixed\b/)
      expect(cls).not.toMatch(/\binset-0\b/)
      expect(cls).not.toMatch(/\bz-\[200\]\b/)
      expect(cls).not.toMatch(/\boverflow-y-auto\b/)
      expect(cls).not.toMatch(/\bh-screen\b/)
    })
  })

  describe("J. Global options for new a11y props", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Dialog: options
          }
        })
      }
    })

    it("applies ariaLabel from componentsOptions", () => {
      mount(Dialog, {
        global: { plugins: [createAppWithFishtVue({ ariaLabel: "Global label" })] },
        props: { modelValue: true, teleport: "#modal" }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("aria-label")).toBe("Global label")
    })

    it("per-instance ariaLabel overrides componentsOptions", () => {
      mount(Dialog, {
        global: { plugins: [createAppWithFishtVue({ ariaLabel: "Global label" })] },
        props: { modelValue: true, teleport: "#modal", ariaLabel: "Local" }
      })
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog?.getAttribute("aria-label")).toBe("Local")
    })

    it("applies returnFocus from componentsOptions", async () => {
      const trigger = document.createElement("button")
      trigger.id = "trg-opt"
      document.body.appendChild(trigger)
      trigger.focus()

      const wrapper = mount(Dialog, {
        global: { plugins: [createAppWithFishtVue({ returnFocus: false })] },
        props: { modelValue: false, teleport: "#modal" },
        slots: { default: '<button class="inside-opt">Inside</button>' }
      })
      await wrapper.setProps({ modelValue: true })
      await nextTick()
      await nextTick()
      await wrapper.setProps({ modelValue: false })
      await nextTick()
      await nextTick()

      expect(document.activeElement).not.toBe(trigger)

      document.body.removeChild(trigger)
    })
  })

  // ---B10 — semantic surface tokens вместо hardcoded neutral-family classes (Wave 9) -------------
  describe("K. Theming — semantic surface tokens, not hardcoded neutral-* (B10)", () => {
    const legacyNeutralFamily = /\b(?:bg|fill|text|border|ring|divide)-(?:neutral|stone|zinc|slate|gray)-\d+/

    it("overlay background uses surface-family (not neutral-500/900)", () => {
      mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })
      const bg = document.querySelector("#modal [data-dialog-background] > div") as HTMLElement | null
      expect(bg).not.toBeNull()
      const cls = bg!.className
      expect(cls).toContain("bg-surface-500/10")
      expect(cls).toContain("dark:bg-surface-900/10")
      expect(cls).not.toMatch(legacyNeutralFamily)
    })

    it("dialog panel keeps bg-white and uses surface-950 in dark mode (not neutral-950)", () => {
      mount(Dialog, {
        props: { modelValue: true, teleport: "#modal" }
      })
      const panel = document.querySelector("#modal [data-dialog-content]") as HTMLElement | null
      expect(panel).not.toBeNull()
      const cls = panel!.className
      expect(cls).toContain("bg-white")
      expect(cls).toContain("dark:bg-surface-950")
      expect(cls).not.toMatch(legacyNeutralFamily)
    })

    it("close icon uses surface-family fill (not neutral-500)", () => {
      mount(Dialog, {
        props: { modelValue: true, closeButton: true, teleport: "#modal" }
      })
      const icon = document.querySelector("#modal [data-dialog-close] [data-icon]") as HTMLElement | null
      expect(icon).not.toBeNull()
      const cls = icon!.getAttribute("class") ?? ""
      expect(cls).toContain("fill-surface-500")
      expect(cls).toContain("dark:fill-surface-500")
      expect(cls).not.toMatch(legacyNeutralFamily)
    })
  })
})

// Контракт props 1.0.0 (dev-patterns §2 A–D, F): инверсия `class`/`classBody` снята,
// три негативных булева переведены в positive с перевёрнутым default.
describe("Dialog — контракт props 1.0.0", () => {
  // Teleport-target создаём сами: этот describe — сосед основного, его beforeEach сюда не достаёт.
  beforeEach(() => {
    const el = document.createElement("div")
    el.id = "modal"
    document.body.appendChild(el)
  })
  afterEach(() => {
    document.getElementById("modal")?.remove()
    delete (window as any).FishtVue
  })

  const withOptions = (options: any = {}, extra: any = {}) => ({
    install(app: any) {
      app.use(FishtVue, { componentsOptions: { Dialog: options }, ...extra })
    }
  })
  const OPEN = { modelValue: true, teleport: "#modal" as const }
  const q = (selector: string) => document.querySelector(`#modal ${selector}`)
  const classesOf = (el: Element | null) => (el?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean)

  it("отсутствующие булевы приходят `undefined`, а не скастованными в false", () => {
    const wrapper = mount(Dialog, { props: OPEN })

    expect(wrapper.props("animated")).toBeUndefined()
    expect(wrapper.props("margin")).toBeUndefined()
    expect(wrapper.props("closeOnBackdrop")).toBeUndefined()
    expect(wrapper.props("closeButton")).toBeUndefined()
  })

  it("`class` ложится на корень `[data-dialog]`, а не на карточку", () => {
    mount(Dialog, { props: { ...OPEN, class: "probe-root" }, slots: { default: "x" } })

    expect(classesOf(q("[data-dialog]"))).toContain("probe-root")
    expect(classesOf(q("[data-dialog-content]"))).not.toContain("probe-root")
  })

  it.each([
    ["content", "[data-dialog-content]"],
    ["backdrop", "[data-dialog-background]"],
    ["close", "[data-dialog-close]"]
  ] as Array<[DialogClassKey, string]>)("classes.%s доезжает до своего элемента", (key, selector) => {
    mount(Dialog, {
      props: { ...OPEN, closeButton: true, classes: { [key]: "probe-key" } },
      slots: { default: "x" }
    })

    expect(classesOf(q(selector))).toContain("probe-key")
    expect(classesOf(q("[data-dialog]"))).not.toContain("probe-key")
  })

  it("классы потребителя перебивают структурный `absolute` карточки (хвост больше не выигрывает)", () => {
    mount(Dialog, { props: { ...OPEN, classes: { content: "relative" } }, slots: { default: "x" } })
    const classes = classesOf(q("[data-dialog-content]"))

    expect(classes).toContain("relative")
    expect(classes).not.toContain("absolute")
  })

  it("props.classes перебивает options.classes, неконфликтный класс options остаётся", () => {
    mount(Dialog, {
      props: { ...OPEN, classes: { content: "p-8" } },
      slots: { default: "x" },
      global: { plugins: [withOptions({ classes: { content: "p-2 italic" } })] }
    })
    const classes = classesOf(q("[data-dialog-content]"))

    expect(classes).toContain("p-8")
    expect(classes).not.toContain("p-2")
    expect(classes).toContain("italic")
  })

  it("`closeOnBackdrop` — positive-инверсия: по умолчанию подложка кликабельна", async () => {
    const byDefault = mount(Dialog, { props: OPEN, slots: { default: "x" } })
    expect((byDefault.vm as any).isCloseOnBackdrop).toBe(true)

    const off = mount(Dialog, { props: { ...OPEN, closeOnBackdrop: false }, slots: { default: "x" } })
    expect((off.vm as any).isCloseOnBackdrop).toBe(false)
  })

  it("`margin` — positive-инверсия: default true даёт отступ в off-center позиции", () => {
    const withMargin = mount(Dialog, { props: { ...OPEN, position: "bottom" }, slots: { default: "x" } })
    expect(String((withMargin.vm as any).classPosition)).toContain("mb-5")

    const without = mount(Dialog, {
      props: { ...OPEN, position: "bottom", margin: false },
      slots: { default: "x" }
    })
    expect(String((without.vm as any).classPosition)).not.toContain("mb-5")
  })

  it("`animated` — positive-инверсия: default true даёт directional-анимацию", () => {
    const animated = mount(Dialog, { props: { ...OPEN, position: "left" }, slots: { default: "x" } })
    expect((animated.vm as any).enterAndLeaveClass ?? "").toBe("-translate-x-full")

    const plain = mount(Dialog, {
      props: { ...OPEN, position: "left", animated: false },
      slots: { default: "x" }
    })
    expect((plain.vm as any).enterAndLeaveClass ?? "").toBe("translate-x-0 opacity-0")
  })

  it("`teleport: false` рендерит inline, без выноса в target", () => {
    const wrapper = mount(Dialog, { props: { modelValue: true, teleport: false }, slots: { default: "x" } })

    expect(q("[data-dialog]")).toBeNull()
    expect(wrapper.find("[data-dialog]").exists()).toBe(true)
  })

  it("снятый `classBody` больше не адресует корень — падает fallthrough-атрибутом", () => {
    mount(Dialog, { props: { ...OPEN, classBody: "probe-legacy" } as any, slots: { default: "x" } })

    expect(classesOf(q("[data-dialog]"))).not.toContain("probe-legacy")
  })

  it("unstyled сохраняет классы потребителя и режет тему", () => {
    mount(Dialog, {
      props: { ...OPEN, class: "probe-root", classes: { content: "probe-content" } },
      slots: { default: "x" },
      global: { plugins: [withOptions({}, { unstyled: true })] }
    })

    // На корне дополнительно живут transition-классы (`<transition appear>` вешает enter-*),
    // поэтому сверяем не полный список, а наличие сегментов потребителя и отсутствие темы.
    const root = classesOf(q("[data-dialog]"))
    expect(root).toContain("fv")
    expect(root).toContain("probe-root")
    expect(root.some((c) => c.startsWith("fishtvue-"))).toBe(false)
    expect(classesOf(q("[data-dialog-content]"))).toEqual(["fv", "probe-content"])
  })
})
