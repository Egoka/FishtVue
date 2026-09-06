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
  "top-end"
]

const valuesType = ["success", "warning", "info", "error", "neutral"]

// Issue 7 / F31 (RTL): валидация позиции по allow-list. Физические алиасы ("left"/"top-right"/…)
// сняты в major 2026-09-06 (решение R7) — они не были RTL-безопасны, а поддерживать два набора
// значений одного prop'а пришлось бы до следующего breaking-релиза.
//
// Allow-list оставлен: `openAlert` вызывают в том числе из untyped JS, и неизвестная позиция должна
// давать дефолтный тост, а не сломанную вёрстку. Старое `"left"` теперь попадает именно сюда.
function toLogicalPosition(position?: BaseAlert["position"]): string {
  const p = (position ?? "top") as string
  return valuesPosition.includes(p) ? p : "top"
}

// Allow-list для `type` (зеркало `toLogicalPosition`): openAlert вызывают в том числе из untyped JS,
// где TS-union не защищает. Неизвестное значение — dev-warn + фолбэк на default-тип "success",
// а не throw: рантайм-ошибка в toast-е дороже неверного цвета.
function toValidType(type: string): BaseAlert["type"] {
  if (valuesType.includes(type)) return type as BaseAlert["type"]
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[FishtVue Alert] type="${type}" is not supported; ` +
        `expected one of ${valuesType.join(", ")}. Falling back to "success".`
    )
  }
  return "success"
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
  // Issue 7 / F31: нормализация позиции по allow-list (физические алиасы сняты — решение R7).
  const pos = toLogicalPosition(options.position)
  options.position = pos as BaseAlert["position"]
  // `undefined` не трогаем: глобальные options компонента должны сохранить право подставить свой `type`.
  if (options.type !== undefined) options.type = toValidType(options.type)
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
    // N59 (print, решение R21): контейнер тостов адресуется data-атрибутом, а не классом позиции —
    // единый `@media print` в baseStyle прячет именно его. Инлайновый `<Alert>` при этом печатается:
    // он описывает документ, а всплывающий тост — состояние сеанса.
    newContainer.setAttribute("data-alert-container", pos)
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
