import { isClient } from "fishtvue/utils/domHandler"

let lockCount = 0
let originalOverflow: string | null = null
let originalPaddingRight: string | null = null

function getScrollbarWidth(): number {
  if (!isClient()) return 0
  return window.innerWidth - document.documentElement.clientWidth
}

/**
 #### `lockBodyScroll` Function Documentation

 Reference-counted body scroll lock. Безопасен при nested-Dialog и Toast+Dialog сценариях:
 при первом вызове сохраняет оригинальные `body.style.overflow` и `body.style.paddingRight`,
 устанавливает `overflow: hidden` и компенсирует исчезновение scrollbar добавлением
 `padding-right: <scrollbarWidth>px` (предотвращает layout-shift).
 Последующие вызовы только инкрементируют counter — body не модифицируется повторно.
 SSR-safe: на сервере функция no-op.

 ##### Syntax
 ```typescript
 export function lockBodyScroll(): void
 ```

 ##### Example Usage
 ```typescript
 import { lockBodyScroll, unlockBodyScroll } from "fishtvue/utils/scrollLockHandler"

 watch(isOpen, (value) => {
   if (value) lockBodyScroll()
   else unlockBodyScroll()
 })
 ```
 */
export function lockBodyScroll(): void {
  if (!isClient()) return
  if (lockCount === 0) {
    const bodyEl = document.body
    originalOverflow = bodyEl.style.overflow
    originalPaddingRight = bodyEl.style.paddingRight
    const scrollbarWidth = getScrollbarWidth()
    if (scrollbarWidth > 0) {
      bodyEl.style.paddingRight = `${scrollbarWidth}px`
    }
    bodyEl.style.overflow = "hidden"
    bodyEl.classList.add("fv-scroll-locked")
  }
  lockCount++
}

/**
 #### `unlockBodyScroll` Function Documentation

 Releases один уровень scroll lock. Когда counter становится 0 — восстанавливает
 оригинальные `body.style.overflow` и `body.style.paddingRight`, снимает class `fv-scroll-locked`.
 Безопасен при повторных вызовах сверх baseline (clamps к 0). SSR-safe.

 ##### Syntax
 ```typescript
 export function unlockBodyScroll(): void
 ```

 ##### Example Usage
 ```typescript
 onBeforeUnmount(() => {
   if (wasLocked) unlockBodyScroll()
 })
 ```
 */
export function unlockBodyScroll(): void {
  if (!isClient()) return
  if (lockCount === 0) return
  lockCount--
  if (lockCount === 0) {
    const bodyEl = document.body
    bodyEl.style.overflow = originalOverflow ?? ""
    bodyEl.style.paddingRight = originalPaddingRight ?? ""
    bodyEl.classList.remove("fv-scroll-locked")
    originalOverflow = null
    originalPaddingRight = null
  }
}

/**
 #### `getScrollLockCount` Function Documentation

 Возвращает текущий counter scroll lock. Предназначена для тестов и debugging.
 Production-код не должен полагаться на значение counter — используй `lockBodyScroll` / `unlockBodyScroll` парами.

 ##### Syntax
 ```typescript
 export function getScrollLockCount(): number
 ```
 */
export function getScrollLockCount(): number {
  return lockCount
}

/**
 #### `__resetScrollLockForTests` Function Documentation

 Сбрасывает internal state модуля. Только для unit-тестов между прогонами —
 production-код не должен вызывать.

 ##### Syntax
 ```typescript
 export function __resetScrollLockForTests(): void
 ```
 */
export function __resetScrollLockForTests(): void {
  lockCount = 0
  originalOverflow = null
  originalPaddingRight = null
  if (isClient()) {
    document.body.classList.remove("fv-scroll-locked")
  }
}
