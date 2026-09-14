/**
 #### `lockBodyScroll` Function Documentation

 Reference-counted body scroll lock. Безопасен при nested-Dialog и Toast+Dialog сценариях:
 при первом вызове сохраняет оригинальные `body.style.overflow` и `body.style.paddingRight`,
 устанавливает `overflow: hidden` и компенсирует исчезновение scrollbar добавлением
 `padding-right: <scrollbarWidth>px`. Последующие вызовы инкрементируют counter.
 SSR-safe: на сервере функция no-op.

 ##### Syntax
 ```typescript
 export function lockBodyScroll(): void
 ```
 */
export declare function lockBodyScroll(): void

/**
 #### `unlockBodyScroll` Function Documentation

 Releases один уровень scroll lock. Когда counter становится 0 — восстанавливает
 оригинальные `body.style.overflow` и `body.style.paddingRight`. SSR-safe.

 ##### Syntax
 ```typescript
 export function unlockBodyScroll(): void
 ```
 */
export declare function unlockBodyScroll(): void

/**
 #### `getScrollLockCount` Function Documentation

 Возвращает текущий counter scroll lock. Предназначена для тестов и debugging.

 ##### Syntax
 ```typescript
 export function getScrollLockCount(): number
 ```
 */
export declare function getScrollLockCount(): number

/**
 #### `__resetScrollLockForTests` Function Documentation

 Сбрасывает internal state модуля. Только для unit-тестов.

 ##### Syntax
 ```typescript
 export function __resetScrollLockForTests(): void
 ```
 */
export declare function __resetScrollLockForTests(): void
