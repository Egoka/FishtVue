import { toValue, type MaybeRefOrGetter } from "vue"
import { isClient } from "fishtvue/utils/domHandler"

// ---------------------------------------------------------------------------
// Teleport-aware click-outside (замена @vueuse/core onClickOutside).
// Слушает на `document` (capture), определяет «снаружи» через `event.composedPath()`
// — корректно работает с Teleport/Shadow DOM. `ignore` исключает триггер.
// ---------------------------------------------------------------------------

/** Цель/исключения — ref/getter/значение элемента. */
type MaybeEl = MaybeRefOrGetter<HTMLElement | Element | null | undefined>

/** Опции `useClickOutside`. */
export interface ClickOutsideOptions {
  /** Элементы-исключения (клик по ним не считается «снаружи»). Обычно — триггер. */
  ignore?: MaybeEl[]
  /** Типы событий. По умолчанию `["pointerdown"]` (паритет с прежним onClickOutside). */
  events?: string[]
  /** Capture-фаза — `true` (видим событие даже при `stopPropagation` на bubble). */
  capture?: boolean
}

/**
 * ## useClickOutside
 * Подписывает обработчик на «клик снаружи» `target`. Возвращает идемпотентный `stop()`.
 */
export function useClickOutside(
  target: MaybeEl,
  handler: (event: Event) => void,
  options: ClickOutsideOptions = {}
): () => void {
  if (!isClient()) return () => {}
  const events = options.events ?? ["pointerdown"]
  const capture = options.capture ?? true

  const listener = (event: Event): void => {
    const targetEl = toValue(target)
    if (!targetEl) return
    const path = typeof event.composedPath === "function" ? event.composedPath() : []
    const eventTarget = event.target as Node | null

    // внутри target → игнор
    if (path.length ? path.includes(targetEl) : targetEl.contains(eventTarget)) return
    // на одном из ignore (триггер) → игнор
    for (const maybeEl of options.ignore ?? []) {
      const el = toValue(maybeEl)
      if (!el) continue
      if (path.length ? path.includes(el) : el.contains(eventTarget)) return
    }
    handler(event)
  }

  for (const type of events) document.addEventListener(type, listener, capture)

  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    for (const type of events) document.removeEventListener(type, listener, capture)
  }
}
