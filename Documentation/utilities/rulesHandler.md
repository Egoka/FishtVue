---
title: utils/rulesHandler
summary: Валидация: Rules union (RulesArray/RulesObject), getValidate (sync), getAsyncValidate.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/rulesHandler

## 1. Overview

Валидационный engine для form-controls. Поддерживает 10 типов правил (required, email, phone, numeric, regular, range, length, async, custom, compare). Принимает rules в двух форматах — `RulesArray` (массив объектов) или `RulesObject` (объект с ключами по типу). Используется внутри [Form](../components/form.md), [Input](../components/input.md), [Select](../components/select.md).

Stability: `stable`.

Source: [lib/utils/rulesHandler.ts](../../lib/utils/rulesHandler.ts), [lib/utils/rulesHandler.d.ts](../../lib/utils/rulesHandler.d.ts), [lib/utils/rulesHandler.test.ts](../../lib/utils/rulesHandler.test.ts), [lib/utils/rulesMethods.ts](../../lib/utils/rulesMethods.ts) (internal).

## 2. How it's organized

```
lib/utils/rulesHandler.ts          # public API
lib/utils/rulesHandler.d.ts        # 110 строк
lib/utils/rulesHandler.test.ts     # 110 кейсов
lib/utils/rulesMethods.ts          # internal — методы валидации каждого типа
```

Зависимости — нет внешних. `rulesMethods.ts` не экспортируется наружу.

## 3. How it works

`Rules = RulesArray | RulesObject` ([rulesHandler.d.ts](../../lib/utils/rulesHandler.d.ts)):

- `RulesArray` — `[{ type: "required", message?: string }, { type: "email", ... }, ...]`.
- `RulesObject` — `{ required: { ... }, email: { ... }, ... }`.

Для каждого типа в `rulesMethods.ts` есть проверочная функция, возвращающая `{ isInvalid: boolean, message?: string }`.

`getValidate(value, rules)` — синхронно прогоняет все правила, возвращает `ReturnValid = { isInvalid, message }`. Останавливается на первом невалидном (или собирает все — зависит от реализации).

`getAsyncValidate(value, rules)` — для async-правил (например, server-side check). Возвращает `Promise<ReturnValid>`.

`isExistRule(rules, ruleName)` — проверяет наличие правила в наборе.

SSR/hydration: чистые функции (для async — Promise; вызывается на клиенте).

## 4. Quick Start

```ts
import { getValidate, getAsyncValidate, type Rules } from "fishtvue/utils/rulesHandler"

const rules: Rules = [
  { type: "required", message: "Required field" },
  { type: "email", message: "Invalid email" }
]

const { isInvalid, message } = getValidate("user@example.com", rules)
// { isInvalid: false, message: "" }

const { isInvalid: bad } = getValidate("", rules)
// { isInvalid: true, message: "Required field" }

await getAsyncValidate("user@example.com", [
  { type: "async", validator: async (v) => /* server check */ }
])
```

## 5. Props

Не применимо. Структуры `RuleObject` (фрагмент):

| Field | Type | Description |
|---|---|---|
| `type` | `"required" \| "email" \| "phone" \| ...` | Тип правила. |
| `message` | `string` | Сообщение при невалидности. |
| Прочие поля | зависят от типа | Например, `min`/`max` для `range`. |

Полные сигнатуры — [rulesHandler.d.ts](../../lib/utils/rulesHandler.d.ts).

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `getValidate(value, rules)` | `(value: any, rules: Rules) => ReturnValid` | Синхронная валидация. |
| `getAsyncValidate(value, rules)` | `(value: any, rules: Rules) => Promise<ReturnValid>` | Async-валидация. |
| `isExistRule(rules, rule)` | `(rules: Rules, rule: keyof RulesObject) => boolean` | Есть ли тип правила в наборе. |

Типы:

| Name | Description |
|---|---|
| `Rules` | `RulesArray \| RulesObject`. |
| `RulesArray` | Массив `RequiredRule \| EmailRule \| ...`. |
| `RulesObject` | `{ required?, email?, phone?, numeric?, regular?, range?, length?, async?, custom?, compare? }`. |
| `RuleCallback` | `{ isInvalid: boolean; message?: string }` — возврат custom-валидатора. |

## 9. Examples

### 9.1 Через RulesObject

```ts
import { getValidate } from "fishtvue/utils/rulesHandler"

const { isInvalid } = getValidate("hello", {
  required: { message: "Required" },
  length: { min: 3, max: 10, message: "3-10 chars" }
})
```

### 9.2 Custom-rule

```ts
import { getValidate } from "fishtvue/utils/rulesHandler"

getValidate(42, [
  {
    type: "custom",
    validator: (v) => ({ isInvalid: v < 0, message: "Must be ≥ 0" })
  }
])
```

### 9.3 Compare между двумя полями

```ts
const { isInvalid } = getValidate(passwordConfirm, [
  { type: "compare", to: password, message: "Passwords don't match" }
])
```

### 9.4 Async check

```ts
import { getAsyncValidate } from "fishtvue/utils/rulesHandler"

const { isInvalid, message } = await getAsyncValidate(login, [
  {
    type: "async",
    validator: async (v) => {
      const free = await api.checkLogin(v)
      return { isInvalid: !free, message: "Login taken" }
    }
  }
])
```

## 10. Configuration & Customization

Не применимо. Сообщения локализуются через `Component.t(key)` на стороне SFC; rulesHandler сам не подхватывает локали — `message` передаётся явно.

## 11. Form integration & validation

Это и есть модуль валидации. См. [components/form.md](../components/form.md) для интеграции на уровне формы.

## 12. Accessibility & Security

- Async-валидаторы могут делать сетевые вызовы — следи за rate-limit'ом и user-input sanitization на стороне валидатора.
- `regular` rule использует `RegExp` — следи за ReDoS-уязвимостями в пользовательских паттернах.

## 13. TypeScript

```ts
import type { Rules, RulesArray, RulesObject, RuleCallback } from "fishtvue/utils/rulesHandler"

const rules: RulesArray = [
  { type: "required", message: "Req" }
]

const cb: RuleCallback = { isInvalid: false }
```

## 14. Compatibility & Stability

- Чистый JS, ES2017+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { getValidate } from "fishtvue/utils/rulesHandler"

describe("getValidate required", () => {
  it("отклоняет пустую строку", () => {
    const { isInvalid } = getValidate("", [{ type: "required", message: "x" }])
    expect(isInvalid).toBe(true)
  })
})
```

Реальные тесты — [rulesHandler.test.ts](../../lib/utils/rulesHandler.test.ts) (110 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `getValidate` возвращает `isInvalid: true` для валидного значения | Не совпала версия rule-объекта (тип-property отличается). | Проверь, что `type` совпадает с одним из 10 значений. |
| Async validator тайм-аутит | Нет встроенного timeout. | Оборачивай в `Promise.race([..., new Promise((_, r) => setTimeout(() => r(...), N))])`. |
| `compare` не сравнивает с reactive ref | Передаётся snapshot значения. | Передавай `.value` явно при вызове. |
| Нет message — выводится `""` | message не передан в правило. | Указывай `message` явно. |

## 17. Related

- [components/form.md](../components/form.md) — wrapper-компонент.
- [components/input.md](../components/input.md), [components/select.md](../components/select.md) — потребители per-control.
- [architecture/locale.md](../architecture/locale.md) — `requiredField` как пример ключа.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

- coverage 98.48% statements / 85.32% branch — большинство веток покрыто, но 5 строк ([rulesHandler.ts:237, 240, 260–262](../../lib/utils/rulesHandler.ts#L237)) — не выполнены тестами.

### Skipped tests

Нет.

### API inconsistencies

- `Rules` union с двумя формами (`RulesArray` и `RulesObject`) — потребителю надо знать, какой формат поддерживает каждый компонент. Form'ы FishtVue — обычно `RulesArray`; для свободного использования — выбирай по удобству.
- `RulesObject` ключ `compare` ожидает `to: any` — TS не узнаёт связь между `to` и проверяемым значением.

### Behavioral caveats

- `getValidate` может возвращать первое сообщение или агрегировать — поведение зависит от реализации; для UI обычно достаточно «первая ошибка», но Form может показать все.
- Локализация message — на стороне консумера (через `Component.t()`).
- Async-валидаторы НЕ дебоунсятся — вызывай ответственно (debounce на стороне SFC).

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
