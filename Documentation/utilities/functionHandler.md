---
title: utils/functionHandler
summary: isFunction(value) и generateUUID() — type guard и cryptographically secure UUID v4 (с Math.random fallback для legacy runtime'ов).
updated: 2026-05-10
stability: stable
since: 0.2.11
---

# utils/functionHandler

## 1. Overview

Два helper'а: `isFunction` — type guard для функций, `generateUUID` — генератор UUID v4 через `crypto.randomUUID()` (Web Crypto API) с fallback на `Math.random` для legacy runtime'ов. Используются повсеместно для валидации callback'ов и генерации id'ов в reactive стейтах.

Stability: `stable`.

Source: [lib/utils/functionHandler.ts](../../lib/utils/functionHandler.ts), [lib/utils/functionHandler.d.ts](../../lib/utils/functionHandler.d.ts), [lib/utils/functionHandler.test.ts](../../lib/utils/functionHandler.test.ts).

## 2. How it's organized

```
lib/utils/functionHandler.ts
lib/utils/functionHandler.d.ts
lib/utils/functionHandler.test.ts  # 8 кейсов
```

Зависимостей нет.

## 3. How it works

- `isFunction(value)` — проверяет через `typeof === "function"` + кросс-окружные guard'ы (constructor.name, наличие `apply`).
- `generateUUID()` — feature-detect `crypto.randomUUID()`; при наличии — используется (cryptographically secure). При отсутствии (или если call throws — например, insecure context до Node 19) — fallback на `Math.random` собирает 36-символьный UUID v4 в каноничной форме `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.

SSR/hydration: чистые функции.

## 4. Quick Start

```ts
import { isFunction, generateUUID } from "fishtvue/utils/functionHandler"

isFunction(() => {})         // true
isFunction(class A {})       // true
isFunction(null)             // false

generateUUID()
// "9d4f0c2e-...-..."
```

## 5. Props

Не применимо.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `isFunction(value)` | `<T>(value: T) => boolean` | Type guard для функций (включая классы и async-функции). |
| `generateUUID()` | `() => string` | UUID v4 (формат `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`). |

## 9. Examples

```ts
import { isFunction, generateUUID } from "fishtvue/utils/functionHandler"

function safeCall(cb: unknown) {
  if (isFunction(cb)) (cb as Function)()
}

const id = generateUUID()
const li = { id, label: "item" }
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

`generateUUID` использует `crypto.randomUUID()` (Web Crypto API) на evergreen browsers и Node 19+ — cryptographically secure из коробки. Math.random fallback срабатывает только в legacy runtime'ах без Web Crypto или в insecure contexts (например, http:// в старых браузерах) — там id'ы не следует использовать как security tokens.

## 13. TypeScript

```ts
import { isFunction, generateUUID } from "fishtvue/utils/functionHandler"

const x: unknown = () => {}
if (isFunction(x)) {
  // x здесь не narrow до Function — это runtime-проверка, не type guard
}
```

`isFunction` объявлен как возвращающий `boolean`, не `value is Function` — TS не сужает тип после проверки.

## 14. Compatibility & Stability

- Браузер evergreen, Node 18+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { isFunction, generateUUID } from "fishtvue/utils/functionHandler"

describe("functionHandler", () => {
  it("detects arrow function", () => {
    expect(isFunction(() => {})).toBe(true)
  })

  it("generates non-empty UUID", () => {
    expect(generateUUID()).toHaveLength(36)
  })
})
```

Реальные тесты — [functionHandler.test.ts](../../lib/utils/functionHandler.test.ts) (8 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| После `isFunction(x)` TypeScript не sugает тип | Не type-guard signature. | Используй `typeof x === "function"` напрямую — встроенный narrowing работает. |
| Коллизия UUID при массовой генерации в legacy runtime | Fallback на `Math.random` — не uniformly distributed на старых runtime'ах. | Обнови runtime до Node 19+ / evergreen-browser; на современных платформах используется secure `crypto.randomUUID()`. |

## 17. Related

- [utilities/objectHandler.md](./objectHandler.md), [utilities/arrayHandler.md](./arrayHandler.md), [utilities/stringHandler.md](./stringHandler.md) — соседние type-guards.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев нет.

### Incomplete or stubbed behavior

- `isFunction` не type-guard (`boolean` вместо `value is Function`).

### Skipped tests

Нет.

### API inconsistencies

Нет.

### Behavioral caveats

- `generateUUID` использует `crypto.randomUUID()` где доступен (evergreen browsers, Node 19+) — secure из коробки. `Math.random` fallback включается только в legacy runtime'ах / insecure context — там не годится для security tokens.
- `isFunction(class A {})` возвращает `true` — классы технически функции в JS.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
