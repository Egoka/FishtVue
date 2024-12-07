import * as Vue from "vue"
import Alert from "./Alert.vue"
import Component from "fishtvue/component"
import type { BaseAlert } from "./Alert"

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

export function openAlert(optionsAlert: BaseAlert) {
  const AlertComponent = new Component<"Alert">("Alert")
  const globalOptions = AlertComponent.getOptions()
  // SET alertId
  const alertId = `alert-${crypto.randomUUID()}`
  // SET options
  const options: BaseAlert = Object.assign({}, optionsAlert)
  if (!options.position || !(options?.position && valuesPosition.includes(options.position))) {
    options.position = "top"
  }
  if (!("modelValue" in options) || typeof options?.modelValue !== "boolean") {
    options.modelValue = true
  }
  /////////////////////////////////////////////////////////
  const alertBody = document.querySelector(`.alert-${options.position}`)
  if (alertBody) {
    const divAlert = document.createElement("div")
    divAlert.id = alertId
    divAlert.className = "z-[100]"
    divAlert.style.cssText = "pointer-events: all;"
    divAlert.className = AlertComponent.setStyle(divAlert.className)
    alertBody.prepend(divAlert)
  } else {
    const toMount = document.querySelector(optionsAlert?.toTeleport ?? globalOptions?.toTeleport ?? "body")
    const div = document.createElement("div")
    div.className = AlertComponent.setStyle(
      `alert-${options.position} fixed z-[100] flex gap-4 overflow-auto max-h-screen pointer-events-none transition-all duration-500 ${
        options.position.includes("bottom") ? "flex-col-reverse" : "flex-col"
      } ${
        options.position.includes("left")
          ? "items-start"
          : options.position.includes("right")
            ? "items-end"
            : "items-center"
      } ${alertClassPosition(options.position).join(" ")}`
    )
    if (toMount) toMount.append(div)
    else console.warn("The element for mounting the Alert component was not found")
    // SET div alert
    const divAlert = document.createElement("div")
    divAlert.id = alertId
    divAlert.className = "z-[100]"
    divAlert.style.cssText = "pointer-events: all;"
    divAlert.className = AlertComponent.setStyle(divAlert.className)
    div.prepend(divAlert)
  }
  /////////////////////////////////////////////////////////
  // SET mount
  const alert = Vue.createApp(Alert, { ...options })
  alert.mount(`#${alertId}`)
  /////////////////////////////////////////////////////////
  // SET destroy
  let timer: number | null = null
  if (options.displayTime && +options.displayTime >= 100) {
    timer = +setTimeout(() => destroy(), +options.displayTime) as number
  }
  const alertButton = document.querySelector(`#${alertId} [data-alert-button] button[data-button]`)
  if (alertButton) {
    alertButton.addEventListener("click", destroy)
  }
  /////////////////////////////////////////////////////////
  // functions
  function destroy() {
    const alertEl = document.querySelector(`#${alertId}`)
    if (alertEl) {
      alertEl.className = "z-10"
    }
    if (typeof timer === "number" && timer > 0) {
      clearTimeout(timer)
    }
    setTimeout(() => {
      alert.unmount()
      const divAlert = document.querySelector(`#${alertId}`)
      if (divAlert) {
        divAlert.remove()
      }
      const alertBodyForDelete = document.querySelector(`.alert-${options.position}`)
      if (alertBodyForDelete && alertBodyForDelete.childElementCount === 0) {
        alertBodyForDelete.remove()
      }
    }, 600)
  }

  function alertClassPosition(position: BaseAlert["position"]): Array<string> {
    if (position) {
      if (!valuesPosition.includes(position)) position = "center"
    } else position = "center"
    const arrayClass: string[] = []
    if (position === "center") arrayClass.push("top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2")
    if (position.includes("bottom")) arrayClass.push(`bottom-0 mb-5`)
    else if (position.includes("top")) arrayClass.push(`top-0 mt-5`)
    else arrayClass.push("top-1/2 -translate-y-1/2")
    if (position.includes("right")) arrayClass.push(`right-0 mr-5`)
    else if (position.includes("left")) arrayClass.push(`left-0 ml-5`)
    else arrayClass.push("left-1/2 -translate-x-1/2")
    return arrayClass
  }
}
