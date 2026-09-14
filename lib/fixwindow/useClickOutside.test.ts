import { afterEach, describe, expect, it, vi } from "vitest"
import { ref } from "vue"
import { useClickOutside } from "fishtvue/fixwindow/useClickOutside"

// pointerdown через MouseEvent (jsdom не всегда имеет PointerEvent-конструктор).
const fire = (el: EventTarget, type = "pointerdown") => el.dispatchEvent(new MouseEvent(type, { bubbles: true }))

describe("useClickOutside", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  function setup() {
    const target = document.createElement("div")
    const inside = document.createElement("button")
    target.appendChild(inside)
    const trigger = document.createElement("button")
    const outside = document.createElement("div")
    document.body.append(target, trigger, outside)
    return { target, inside, trigger, outside }
  }

  it("fires the handler on an outside click", () => {
    const { target, outside } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler)
    fire(outside)
    expect(handler).toHaveBeenCalledTimes(1)
    stop()
  })

  it("does NOT fire when the click is inside the target (composedPath)", () => {
    const { target, inside } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler)
    fire(inside)
    expect(handler).not.toHaveBeenCalled()
    stop()
  })

  it("does NOT fire when the click is on an ignored element (trigger)", () => {
    const { target, trigger } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler, { ignore: [ref(trigger)] })
    fire(trigger)
    expect(handler).not.toHaveBeenCalled()
    stop()
  })

  it("stops firing after stop()", () => {
    const { target, outside } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler)
    stop()
    fire(outside)
    expect(handler).not.toHaveBeenCalled()
  })

  it("survives inner stopPropagation (capture phase)", () => {
    const { target, inside, outside } = setup()
    inside.addEventListener("pointerdown", (e) => e.stopPropagation())
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler)
    fire(outside)
    expect(handler).toHaveBeenCalledTimes(1) // capture видит событие до bubble-stop
    stop()
  })

  it("falls back to contains() when composedPath is unavailable", () => {
    const { target, inside, outside } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler)

    const noPath = (el: EventTarget) => {
      const ev = new MouseEvent("pointerdown", { bubbles: true })
      Object.defineProperty(ev, "composedPath", { value: undefined })
      el.dispatchEvent(ev)
    }
    noPath(inside)
    expect(handler).not.toHaveBeenCalled() // contains(target, inside) → внутри
    noPath(outside)
    expect(handler).toHaveBeenCalledTimes(1)
    stop()
  })

  it("listens on custom events when provided", () => {
    const { target, outside } = setup()
    const handler = vi.fn()
    const stop = useClickOutside(ref(target), handler, { events: ["click"] })
    fire(outside, "pointerdown")
    expect(handler).not.toHaveBeenCalled() // не подписан на pointerdown
    fire(outside, "click")
    expect(handler).toHaveBeenCalledTimes(1)
    stop()
  })
})
