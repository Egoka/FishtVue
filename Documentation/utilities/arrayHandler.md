---
title: utils/arrayHandler
summary: isArray, contains, sort/filter, find/findIndex, reorder, deepCopyArray, nestedKeys.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/arrayHandler

## 1. Overview

Набор array-утилит: type-проверки (`isArray`, `contains`), поиск (`findLast`, `findLastIndex`, `findIndexInList`), сортировка/фильтрация (`sort`, `filter`), реорганизация (`reorderArray`, `insertIntoOrderedArray`), deep copy и dot-path извлечение (`nestedKeys`).

Stability: `stable`.

Source: [lib/utils/arrayHandler.ts](../../lib/utils/arrayHandler.ts), [lib/utils/arrayHandler.d.ts](../../lib/utils/arrayHandler.d.ts), [lib/utils/arrayHandler.test.ts](../../lib/utils/arrayHandler.test.ts).

## 2. How it's organized

```
lib/utils/arrayHandler.ts
lib/utils/arrayHandler.d.ts          # 487 строк (полный JSDoc)
lib/utils/arrayHandler.test.ts       # 75 кейсов
```

Зависимостей нет.

## 3. How it works

Все функции — pure (за исключением `reorderArray` и `insertIntoOrderedArray`, которые мутируют переданный массив).

`nestedKeys` обходит объект рекурсивно и возвращает плоский список dot-path'ов (`"a.b[0]"`-стилем).

`sort` принимает custom comparator и направление; `nullSortOrder` определяет, куда пушатся `null`/`undefined` значения.

`filter` ищет вхождение `filterValue` в `fields` каждого элемента — case-insensitive.

`reorderArray` мутирует массив in-place: `arr[from]` → `arr[to]`.

`insertIntoOrderedArray` — вставляет элемент в отсортированный массив, поддерживая порядок.

SSR/hydration: чистые функции (или мутаторы переданного аргумента — без глобальных побочных эффектов).

## 4. Quick Start

```ts
import {
  isArray, contains, sort, filter,
  findLast, findLastIndex, reorderArray,
  deepCopyArray, nestedKeys
} from "fishtvue/utils/arrayHandler"

isArray([1, 2])              // true
isArray([], true)            // false (empty=true требует ненулевую длину)
contains(2, [1, 2, 3])       // true

const arr = [{ name: "B" }, { name: "A" }]
arr.sort((a, b) => sort(a.name, b.name, 1, (x, y) => x.localeCompare(y), -1))

filter([{ name: "Apple" }, { name: "Banana" }], ["name"], "ap")
// [{ name: "Apple" }]

const list = [1, 2, 3, 4]
reorderArray(list, 0, 3)     // list = [2, 3, 4, 1]

deepCopyArray([{ a: 1 }, { b: 2 }])  // глубокая копия

nestedKeys({ a: { b: 1, c: { d: 2 } } })
// ["a.b", "a.c.d"]
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
| `isArray(value, empty?)` | `<T>(value: T, empty?: boolean) => boolean` | Type-проверка с опциональной валидацией непустоты. |
| `contains(value, list)` | `<T>(value: T, list: T[]) => boolean` | `Array.includes`-обёртка. |
| `nestedKeys(obj, parentKey?)` | `(obj: object, parentKey?: string) => string[]` | Плоский список dot-path ключей. |
| `sort(v1, v2, order, comparator, nullSortOrder)` | `(...) => number` | Compare-функция для `Array.sort`. |
| `filter(value, fields, filterValue)` | `<T>(value: T[], fields: T[], filterValue: string) => T[]` | Текстовый фильтр по полям. |
| `reorderArray(arr, from, to)` | `<T>(arr: T[], from: number, to: number) => void` | Перестановка элемента. **Мутирует**. |
| `findLast(arr, callback)` | `<T>(arr: T[], cb) => T \| undefined` | Аналог `Array.findLast`. |
| `findLastIndex(arr, callback)` | `<T>(arr: T[], cb) => number` | `findLastIndex`-полифил. |
| `findIndexInList(value, list)` | `<T>(value: T, list: T[]) => number` | `Array.indexOf`. |
| `insertIntoOrderedArray(item, idx, arr, sourceArr)` | `<T>(item, idx, arr, sourceArr) => void` | Вставка в упорядоченный массив. **Мутирует**. |
| `deepCopyArray(arr)` | `<T>(arr: T[]) => T[]` | Глубокая копия. |

## 9. Examples

### 9.1 Сортировка с null-handling

```ts
const data = [{ name: null }, { name: "B" }, { name: "A" }]
data.sort((a, b) => sort(a.name, b.name, 1, (x, y) => (x ?? "").localeCompare(y ?? ""), -1))
// null уйдёт в конец (nullSortOrder = -1 при возрастании)
```

### 9.2 Фильтр Table

```ts
const rows = [{ city: "Moscow" }, { city: "Berlin" }]
filter(rows, ["city"] as any, "ber") // [{ city: "Berlin" }]
```

### 9.3 nestedKeys для path-навигации

```ts
const config = { theme: { primary: "#3b82f6" }, locale: { default: "en" } }
nestedKeys(config) // ["theme.primary", "locale.default"]
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

Чистые/мутирующие функции, без DOM. `filter` приводит входной regex/строку к нижнему регистру — не санитизирует HTML.

## 13. TypeScript

`sort` объявлен с `value1: any, value2: any` и comparator `(a: any, b: any) => any` — generic'ов нет, тип теряется. Для строгих требований оборачивай вызов:

```ts
import { sort } from "fishtvue/utils/arrayHandler"

function sortStr(a: string, b: string, order: 1 | -1): number {
  return sort(a, b, order, (x, y) => x.localeCompare(y), -1)
}
```

## 14. Compatibility & Stability

- Чистый JS, ES2017+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { reorderArray } from "fishtvue/utils/arrayHandler"

describe("reorderArray", () => {
  it("moves element", () => {
    const arr = [1, 2, 3]
    reorderArray(arr, 0, 2)
    expect(arr).toEqual([2, 3, 1])
  })
})
```

Реальные тесты — [arrayHandler.test.ts](../../lib/utils/arrayHandler.test.ts) (75 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `reorderArray` не возвращает значение | Мутирует in-place. | Используй переданный массив; для immutable — `[...arr]` сначала. |
| `sort` падает на `null` | comparator должен сам обрабатывать null'ы. | В comparator пиши `(x, y) => (x ?? "").localeCompare(y ?? "")`. |
| `filter` возвращает пустой массив на корректном фильтре | `fields` принимает массив **значений**, но семантически ожидаются ключи. См. Known issues. | Передавай ключи как `string[]` через cast (`as any`). |
| `nestedKeys({})` возвращает `[]` | Корректно — на пустом объекте ключей нет. | OK. |
| `findLast` дублирует Array.prototype | На old-target'ах `Array.findLast` отсутствует — этот helper полифил. | OK. |

## 17. Related

- [utilities/objectHandler.md](./objectHandler.md) — `get`, `deepCopyObject`, `deepEquals`.
- [utilities/stringHandler.md](./stringHandler.md), [utilities/numberHandler.md](./numberHandler.md).
- [components/table.md](../components/table.md) — основной потребитель `filter`/`sort`.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

Нет.

### Skipped tests

Нет.

### API inconsistencies

- `sort(value1: any, value2: any, ...)` — тип `any` на публичных параметрах ([arrayHandler.d.ts](../../lib/utils/arrayHandler.d.ts)). Generic-обёртка отсутствует.
- `filter<T>(value: T[], fields: T[], filterValue: string)` — параметр `fields: T[]` назван как массив значений того же типа, что и элементы; в реальности используются как массив ключей-строк. Type-сигнатура вводит в заблуждение.
- `isArray` не type-guard signature.

### Behavioral caveats

- `reorderArray` / `insertIntoOrderedArray` — мутирующие. На reactive ref-массивах (Vue) изменения отслеживаются, но это всё ещё side-effect.
- `deepCopyArray` использует `JSON.stringify`/`JSON.parse` для глубокой копии (или похожий паттерн) — теряет функции, Date'ы, Set/Map. Для сложных структур используй [`utilities/objectHandler.deepCopy`](./objectHandler.md).

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
