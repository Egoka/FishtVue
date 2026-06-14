import { createApp, type App } from "vue"
import Alert from "./Alert.vue"
import Component from "fishtvue/component"
import type { BaseAlert } from "./Alert"
import { isClient } from "fishtvue/utils/domHandler"
import { generateUUID } from "fishtvue/utils/functionHandler"

const valuesPosition = [
  // logical (RTL-safe)
  "top",
  "bottom",
  "center",
  "start",
  "end",
  "bottom-start",
  "top-start",
  "bottom-end",
  "top-end",
  // deprecated физические алиасы — нормализуются в logical (left → start, right → end)
  "left",
  "right",
  "bottom-left",
  "top-left",
  "bottom-right",
  "top-right"
]

// Issue 7 / F31 (RTL): валидация + нормализация позиции в logical (left → start, right → end).
function toLogicalPosition(position?: BaseAlert["position"]): string {
  let p = (position ?? "top") as string
  if (!valuesPosition.includes(p)) p = "top"
  return p.replace("left", "start").replace("right", "end")
}

// Принимает уже нормализованную logical-позицию. Logical-utilities (start/end/ps/pe) авто-зеркалятся
// при dir="rtl"; gutters mobile-first (pt-3 sm:pt-5).
function alertClassPosition(position: string): Array<string> {
  const arrayClass: string[] = []
  if (position === "center") arrayClass.push("top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2")
  if (position.includes("bottom")) arrayClass.push(`bottom-0 pb-3 sm:pb-5`)
  else if (position.includes("top")) arrayClass.push(`top-0 pt-3 sm:pt-5`)
  else arrayClass.push("top-1/2 -translate-y-1/2")
  if (position.includes("end")) arrayClass.push(`end-0 pe-3 sm:pe-5`)
  else if (position.includes("start")) arrayClass.push(`start-0 ps-3 sm:ps-5`)
  else arrayClass.push("left-1/2 -translate-x-1/2")
  return arrayClass
}

export function openAlert(optionsAlert: BaseAlert) {
  // SSR no-op (Issue 2, audit 2026-05-11): `document` is unavailable on the server.
  if (!isClient()) return
  const AlertComponent = new Component<"Alert">("Alert")
  const globalOptions = AlertComponent.getOptions()

  const alertId = `alert-${generateUUID()}`
  const options: BaseAlert = Object.assign({}, optionsAlert)
  // Issue 7 / F31: dev-warn для deprecated физических позиций + нормализация в logical (RTL-safe).
  if (process.env.NODE_ENV !== "production" && options.position && /left|right/.test(options.position)) {
    console.warn(
      `[FishtVue Alert] position="${options.position}" is deprecated; ` +
        `use logical "${toLogicalPosition(options.position)}" (start/end) for RTL-safe positioning.`
    )
  }
  const pos = toLogicalPosition(options.position)
  options.position = pos as BaseAlert["position"]
  if (!("modelValue" in options) || typeof options?.modelValue !== "boolean") {
    options.modelValue = true
  }

  // Step 1 — resolve / create shared position container (preserves stacking).
  let alertBody = document.querySelector(`.alert-${pos}`)
  if (!alertBody) {
    const toMount = document.querySelector(optionsAlert?.toTeleport ?? globalOptions?.toTeleport ?? "body")
    if (!toMount) {
      console.warn("The element for mounting the Alert component was not found")
      return
    }
    const newContainer = document.createElement("div")
    newContainer.className = AlertComponent.setStyle(
      `alert-${pos} ${optionsAlert?.toTeleport ? "absolute" : "fixed"} z-[100] flex gap-3 sm:gap-4 overflow-auto max-h-screen pointer-events-none motion-safe:transition-all motion-safe:duration-500 ${
        pos.includes("bottom") ? "flex-col-reverse" : "flex-col"
      } ${pos.includes("start") ? "items-start" : pos.includes("end") ? "items-end" : "items-center"} ${alertClassPosition(pos).join(" ")}`
    )
    toMount.append(newContainer)
    alertBody = newContainer
  }

  // Step 2 — per-alert child node; Vue mounts and owns its inner subtree.
  const divAlert = document.createElement("div")
  divAlert.id = alertId
  divAlert.className = AlertComponent.setStyle("z-[100]")
  divAlert.style.cssText = "pointer-events: all;"
  alertBody.prepend(divAlert)

  // Step 3 — Vue-bound cleanup (Issue 2, audit 2026-05-11). No manual addEventListener;
  // Alert emits `update:modelValue(false)` on both close-button click and timer expiry.
  let destroyed = false
  let app: App | null = null

  function destroy() {
    if (destroyed) return
    destroyed = true
    // Match leave-transition duration (motion-safe:duration-500) + small buffer.
    setTimeout(() => {
      try {
        app?.unmount()
      } catch {
        // Already torn down — ignore.
      }
      app = null
      divAlert.remove()
      const sharedContainer = document.querySelector(`.alert-${pos}`)
      if (sharedContainer && sharedContainer.childElementCount === 0) {
        sharedContainer.remove()
      }
    }, 600)
  }

  // createApp(rootComponent, rootProps) — event listeners pass as `on*` props (Vue 3 idiom).
  app = createApp(Alert, {
    ...options,
    "onUpdate:modelValue": (visible: boolean) => {
      if (!visible) destroy()
    }
  })
  app.mount(divAlert)
}
