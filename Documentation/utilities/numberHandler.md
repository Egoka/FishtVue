---
title: utils/numberHandler
summary: Форматирование чисел и телефонов + input-handlers для масок. `convertToPhone` принимает optional `phoneFormats` для произвольных стран.
updated: 2026-05-10
stability: beta
since: 0.2.11
---

# utils/numberHandler

## 1. Overview

Утилиты для форматирования чисел и телефонов. Предоставляет:

- Pure-функции форматирования (`convertToPhone`, `convertToNumber`).
- Inline-handlers для DOM-событий (`onkeydown`, `toPhone`, `toNumber`) — используются изнутри [Input.vue](../../lib/input/Input.vue).

Stability: `beta` — DOM-handlers (`onkeydown`, `toPhone`, `toNumber`) принимают `e: any` и не имеют JSDoc, документируются по поведению. Остальное стабильно.

Source: [lib/utils/numberHandler.ts](../../lib/utils/numberHandler.ts), [lib/utils/numberHandler.d.ts](../../lib/utils/numberHandler.d.ts), [lib/utils/numberHandler.test.ts](../../lib/utils/numberHandler.test.ts).

## 2. How it's organized

```
lib/utils/numberHandler.ts
lib/utils/numberHandler.d.ts       # 17 строк (только public функции)
lib/utils/numberHandler.test.ts    # 47 кейсов
```

Зависимостей нет.

## 3. How it works

- `convertToPhone(value, options?)` — форматирует строку из цифр в телефонный формат (внутренние сепараторы по канону). По умолчанию поддерживает country codes 1, 7, 81, 82, 86 (РФ, JP, KR, CN, US/CA). Через `options.phoneFormats: PhoneFormat[]` можно передать произвольный набор стран — backward compatible (без options используются дефолты).
- `convertToNumber(number, lengthInteger, lengthDecimal, separator, end, interval, floatingPoint)` — приводит число/строку к фиксированному формату с разделителем тысяч, обрезанной целой/дробной частью, кастомным окончанием.
- `onkeydown(e)` / `toPhone(e)` / `toNumber(e, separator, lengthInteger, lengthDecimal)` — DOM-handlers для `<input>` (input/keydown event'ы), которые мутируют `e.target.value` в момент ввода для маскирования.

SSR/hydration: pure-функции работают везде; DOM-handlers вызываются только из event listener'ов, на сервере не запускаются.

## 4. Quick Start

```ts
import { convertToPhone, convertToNumber } from "fishtvue/utils/numberHandler"

convertToPhone("79991234567")
// "+7 (999) 123-45-67" (формат фиксирован реализацией)

convertToNumber(1234567.891, 20, 2, " ", " ₽", 3, ".")
// "1 234 567.89 ₽"
```

## 5. Props

Не применимо. Параметры функций — см. §8.

## 6. Events / Emits + v-model contract

Не применимо для самого модуля. `onkeydown`/`toPhone`/`toNumber` подписываются на native input-events внутри SFC.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `convertToPhone(value, options?)` | `(value: string, options?: ConvertToPhoneOptions) => string` | Форматирует строку цифр в телефон. `options.phoneFormats` — кастомные форматы вида `{ codeCountry, mask, codeCity }[]`. |
| `convertToNumber(number, lengthInteger, lengthDecimal, separator, end, interval, floatingPoint)` | См. [.d.ts](../../lib/utils/numberHandler.d.ts) | Форматирует число с разделителем, обрезкой, suffix. |
| `onkeydown(e)` | `(e: any) => void` | Keyboard handler — фильтрует не-цифровой ввод. |
| `toPhone(e)` | `(e: any) => void` | Маска для ввода телефона. |
| `toNumber(e, separator, lengthInteger, lengthDecimal)` | См. [.d.ts](../../lib/utils/numberHandler.d.ts) | Маска для числового ввода. |

## 9. Examples

### 9.1 Простое форматирование

```ts
import { convertToNumber } from "fishtvue/utils/numberHandler"

const formatted = convertToNumber(9999.5, 20, 2, ",", "", 3, ".")
// "9,999.50"
```

### 9.2 Использование handler'а в кастомном input

```vue
<script setup lang="ts">
import { ref } from "vue"
import { toNumber } from "fishtvue/utils/numberHandler"

const val = ref("")
function onInput(e: Event) {
  toNumber(e, ",", 10, 2)
  val.value = (e.target as HTMLInputElement).value
}
</script>

<template>
  <input :value="val" @input="onInput" />
</template>
```

### 9.3 Через Input компонент

Чаще всего эти helpers не вызываются напрямую — за маски ввода в FishtVue отвечает [Input](../components/input.md) с props `maskInput`.

### 9.4 Кастомный набор стран в `convertToPhone`

```ts
import { convertToPhone, type PhoneFormat } from "fishtvue/utils/numberHandler"

const europe: PhoneFormat[] = [
  { codeCountry: 44, mask: [4, 4, 2], codeCity: [20] }, // UK
  { codeCountry: 49, mask: [4, 4, 4], codeCity: [30] }  // DE
]

convertToPhone("442012345678", { phoneFormats: europe })
// "+44 (20) 1234-5678"
```

Если `phoneFormats` пустой массив или не передан — используются дефолтные форматы (1, 7, 81, 82, 86).

## 10. Configuration & Customization

`convertToPhone(value, options?)`:

| Field | Type | Description |
|---|---|---|
| `options.phoneFormats` | `PhoneFormat[]` | Опциональный набор форматов стран. Каждый элемент: `{ codeCountry: number; mask: number[]; codeCity: number[] }`. |

При отсутствии `options.phoneFormats` или передаче пустого массива — fallback на встроенный набор (РФ + JP/KR/CN + US/CA).

## 11. Form integration & validation

Не применимо. Валидация — [utilities/rulesHandler.md](./rulesHandler.md).

## 12. Accessibility & Security

- DOM-handlers мутируют `e.target.value` — это side-effect. Не вызывают `alert`/eval.
- При вводе с paste-event'а handlers могут не сработать (handlers слушают только keydown/input). Используй `onPaste` отдельно при необходимости.

## 13. TypeScript

```ts
import { convertToNumber } from "fishtvue/utils/numberHandler"

const formatted: string = convertToNumber(123456, 20, 2, " ", " usd", 3, ".")
```

DOM-handlers типизированы как `(e: any) => void` — TS не верифицирует event-кастинги.

## 14. Compatibility & Stability

- Браузер evergreen.
- Stability: `beta` (см. §1).
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { convertToNumber } from "fishtvue/utils/numberHandler"

describe("convertToNumber", () => {
  it("формирует разделители тысяч", () => {
    expect(convertToNumber(1234567, 20, 0, " ", "", 3, ".")).toContain(" ")
  })
})
```

Реальные тесты — [numberHandler.test.ts](../../lib/utils/numberHandler.test.ts) (47 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `convertToPhone` форматирует не как ожидалось | Дефолтный набор стран — РФ + JP/KR/CN + US/CA. | Передай свой набор через `options.phoneFormats: PhoneFormat[]`. |
| `toNumber` теряет курсор при вводе | Handler пере-присваивает `e.target.value` → теряется selection range. | Сохраняй и восстанавливай `selectionStart` снаружи handler'а. |
| Paste не маскируется | Handler слушает только keydown/input. | Подпиши свой `paste` handler, вызывай `convertToNumber` вручную. |

## 17. Related

- [components/input.md](../components/input.md) — основной потребитель.
- [utilities/stringHandler.md](./stringHandler.md), [utilities/dateHandler.md](./dateHandler.md) — соседи по форматированию.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

- DOM-handlers (`onkeydown`, `toPhone`, `toNumber`) — без JSDoc и с `e: any`. Поведение восстанавливается из тестов.

### Skipped tests

Нет.

### API inconsistencies

- `convertToNumber` принимает много позиционных параметров — менее удобно, чем options-объект. Изменить — breaking.
- Параметр `interval` числовой, но default объявлен как `interval: number | 3` (union с литералом 3) — нестандартный type для default value.

### Behavioral caveats

- `convertToPhone` без `options` форматирует с расчётом на встроенный набор стран (1, 7, 81, 82, 86). Для произвольных стран используй `options.phoneFormats`.
- `toNumber` при многократном вводе может тратить performance на каждый keydown. Для больших input'ов — debounce.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
