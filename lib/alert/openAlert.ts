import { createApp, type App } from "vue"
import Alert from "./Alert.vue"
import Component from "fishtvue/component"
import type { BaseAlert } from "./Alert"
import { isClient } from "fishtvue/utils/domHandler"
import { generateUUID } from "fishtvue/utils/functionHandler"

const valuesPosition = [
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "bottom-left",
  "top-left",
  "bottom-right",
  "top-right"
]

function alertClassPosition(position: BaseAlert["position"]): Array<string> {
  if (position) {
    if (!valuesPosition.includes(position)) position = "center"
  } else position = "center"
  const arrayClass: string[] = []
  if (position === "center") arrayClass.push("top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2")
  if (position.includes("bottom")) arrayClass.push(`bottom-0 pb-5`)
  else if (position.includes("top")) arrayClass.push(`top-0 pt-5`)
  else arrayClass.push("top-1/2 -translate-y-1/2")
  if (position.includes("right")) arrayClass.push(`right-0 pr-5`)
  else if (position.includes("left")) arrayClass.push(`left-0 pl-5`)
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
  if (!options.position || !valuesPosition.includes(options.position)) {
    options.position = "top"
  }
  if (!("modelValue" in options) || typeof options?.modelValue !== "boolean") {
    options.modelValue = true
  }

  // Step 1 — resolve / create shared position container (preserves stacking).
  let alertBody = document.querySelector(`.alert-${options.position}`)
  if (!alertBody) {
    const toMount = document.querySelector(optionsAlert?.toTeleport ?? globalOptions?.toTeleport ?? "body")
    if (!toMount) {
      console.warn("The element for mounting the Alert component was not found")
      return
    }
    const newContainer = document.createElement("div")
    newContainer.className = AlertComponent.setStyle(
      `alert-${options.position} ${optionsAlert?.toTeleport ? "absolute" : "fixed"} z-[100] flex gap-4 overflow-auto max-h-screen pointer-events-none motion-safe:transition-all motion-safe:duration-500 ${
        options.position.includes("bottom") ? "flex-col-reverse" : "flex-col"
      } ${
        options.position.includes("left")
          ? "items-start"
          : options.position.includes("right")
            ? "items-end"
            : "items-center"
      } ${alertClassPosition(options.position).join(" ")}`
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
      const sharedContainer = document.querySelector(`.alert-${options.position}`)
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
