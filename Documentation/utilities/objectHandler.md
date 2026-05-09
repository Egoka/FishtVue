---
title: utils/objectHandler
summary: type/isObject/isEmpty, get(dot-path), fieldsOmit/Pick, deepMerge/Equals/Copy, freeze.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/objectHandler

## 1. Overview

Самый объёмный handler. Содержит type-проверки, навигацию по dot-path, выборку/исключение полей, deep-операции (merge/equals/copy) и заморозку. Используется внутри [Component class](../architecture/component-class.md), [Config plugin](../architecture/config.md) и многих SFC.

Stability: `stable`.

Source: [lib/utils/objectHandler.ts](../../lib/utils/objectHandler.ts), [lib/utils/objectHandler.d.ts](../../lib/utils/objectHandler.d.ts), [lib/utils/objectHandler.test.ts](../../lib/utils/objectHandler.test.ts).

## 2. How it's organized

```
lib/utils/objectHandler.ts
lib/utils/objectHandler.d.ts        # 713 строк (полный JSDoc)
lib/utils/objectHandler.test.ts     # 157 кейсов
```

Зависимостей нет.

## 3. How it works

- `type(obj)` возвращает lowercase-имя типа (`"object"`, `"array"`, `"date"`, `"null"` и т.д.) через `Object.prototype.toString.call`.
- `isObject` / `isEmpty` / `isNotEmpty` — проверки разных flavor.
- `get(obj, path)` — dot-path или array-path (`"a.b.c"` или `["a", "b", "c"]`).
- `fieldsOmit` / `fieldsPick` — возвращают новый объект без/только перечисленных полей. Возвращаемый тип сужается через TS Pick/Omit.
- `deepMerge(...objects)` — глубокий мерж. Обработка примитивов: если все аргументы примитивы — возвращает последний непустой; если смешано с объектами — примитивы игнорятся.
- `deepEquals(a, b)` — рекурсивное сравнение по структуре.
- `equals(a, b, field?)` — обёртка с опциональным полем (если задан — сравнение `a[field] === b[field]` с deep если объекты).
- `compare(v1, v2, comparator, order)` — wrapper вокруг comparator с направлением.
- `resolveFieldData(obj, field)` — `get` с лёгким API.
- `deepCopyObject` / `deepCopy` — глубокая копия. Поддерживает массивы, объекты, примитивы, Date, RegExp, Map, Set (зависит от реализации).
- `deepFreeze(obj)` — рекурсивный `Object.freeze`.
- `freeze(obj)` — поверхностный `Object.freeze`.
- `unFreeze(obj)` — возвращает разморожённую копию через `deepCopy`.

SSR/hydration: чистые функции.

## 4. Quick Start

```ts
import {
  isObject, isEmpty, get,
  fieldsOmit, fieldsPick,
  deepMerge, deepEquals, deepCopy,
  deepFreeze
} from "fishtvue/utils/objectHandler"

isObject({ a: 1 })           // true
isEmpty({})                  // true
isEmpty(null)                // true
isEmpty([])                  // true

get({ a: { b: 42 } }, "a.b") // 42
get({ a: { b: 42 } }, ["a", "b"]) // 42

fieldsOmit({ a: 1, b: 2, c: 3 }, ["b"]) // { a: 1, c: 3 }
fieldsPick({ a: 1, b: 2, c: 3 }, ["a", "c"]) // { a: 1, c: 3 }

deepMerge({ a: { b: 1 } }, { a: { c: 2 } }) // { a: { b: 1, c: 2 } }
deepEquals({ a: 1 }, { a: 1 })  // true

const frozen = deepFreeze({ a: { b: 1 } })
// frozen.a.b = 2  // throws in strict mode
```

## 5. Props

Не применимо.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Description |
|---|---|
| `type(obj)` | Lowercase tag (`"array"` / `"object"` / etc.). |
| `isObject(value, empty?)` | Проверка objectness; `empty=true` требует ненулевые ключи. |
| `isEmpty(value)` | True для null/undefined/""/[]/{}. |
| `isNotEmpty(value)` | Negation. |
| `get(obj, path)` | Dot-/array-path извлечение. |
| `fieldsOmit(structure, omitFields)` | Новый объект без полей. |
| `fieldsPick(structure, pickFields)` | Новый объект только с полями. |
| `deepMerge(...objects)` | Глубокий мерж. |
| `deepEquals(a, b)` | Глубокое сравнение. |
| `resolveFieldData(data, field)` | Поле/dot-path. |
| `equals(o1, o2, field?)` | Сравнение объектов или их полей. |
| `compare(v1, v2, comparator, order)` | Compare-функция с направлением. |
| `deepCopyObject(object)` | Глубокая копия объекта. |
| `deepCopy(value)` | Глубокая копия любого значения. |
| `deepFreeze(obj)` | Рекурсивная заморозка. |
| `freeze(obj)` | Поверхностная заморозка. |
| `unFreeze(obj)` | Разморозка через копию. |

Полные сигнатуры — [objectHandler.d.ts](../../lib/utils/objectHandler.d.ts).

## 9. Examples

### 9.1 Безопасный get

```ts
import { get } from "fishtvue/utils/objectHandler"
const messages = { en: { title: "Hi" } }
const t: string | undefined = get(messages, "en.title") // "Hi"
const miss = get(messages, "ru.title") // undefined
```

### 9.2 deepMerge для конфигов

```ts
import { deepMerge } from "fishtvue/utils/objectHandler"

const defaults = { theme: { primary: "#000" }, options: { autoImport: true } }
const user = { theme: { primary: "#3b82f6" } }
const merged = deepMerge(defaults, user)
// { theme: { primary: "#3b82f6" }, options: { autoImport: true } }
```

### 9.3 Frozen-копия для useFishtVue

```ts
import { deepCopyObject, deepFreeze } from "fishtvue/utils/objectHandler"

const safe = deepFreeze(deepCopyObject(originalConfig))
// safe — readonly snapshot, мутации тихо игнорируются (или throw в strict)
```

### 9.4 fieldsOmit для пробрасывания module-options

```ts
import { fieldsOmit } from "fishtvue/utils/objectHandler"

const cleaned = fieldsOmit(options, ["global", "mode", "prefix", "autoImport"])
// cleaned пригодно для передачи в plugin
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

- `deepCopy` через JSON-pipeline теряет функции/Symbol/Date/Set/Map → проверь поведение для сложных структур.
- `deepMerge` для массивов конкатенирует — может привести к утечке user-input в default-конфиге, если консумер не санитизировал.
- Чистые функции, без network/DOM.

## 13. TypeScript

```ts
import { fieldsOmit, fieldsPick } from "fishtvue/utils/objectHandler"

type X = { a: number; b: string; c: boolean }
const x: X = { a: 1, b: "B", c: true }

const xWithoutB = fieldsOmit(x, ["b"]) // typeof xWithoutB = Omit<X, "b">
const xPickAC = fieldsPick(x, ["a", "c"]) // typeof xPickAC = Pick<X, "a" | "c">
```

`get` возвращает `T | undefined` — не сужает по path. Для строгой типизации делай assertion.

## 14. Compatibility & Stability

- Чистый JS, ES2017+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { deepMerge } from "fishtvue/utils/objectHandler"

describe("deepMerge", () => {
  it("merges nested", () => {
    expect(deepMerge({ a: { b: 1 } }, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } })
  })
})
```

Реальные тесты — [objectHandler.test.ts](../../lib/utils/objectHandler.test.ts) (157 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `deepMerge` объединяет массивы вместо замены | By design — для config'а удобнее. | Если нужна замена — извлеки массив и присваивай явно: `merged.field = newArray`. |
| `deepCopy` теряет Date/RegExp | JSON-pipeline не сохраняет их. | Используй `structuredClone` для browser-only кода или `lodash.cloneDeep`. |
| `get(obj, "a.b")` возвращает `undefined` для существующего поля `a.b` (буквальный ключ) | Помешали dot-path expansion. | Передай как массив: `get(obj, ["a.b"])`. |
| `deepFreeze` не предотвращает мутации в Vue reactive | reactive-обёртка перехватывает freeze. | Используй для frozen snapshots, не для reactive state. |
| `isObject(null)` | `null` имеет `typeof === "object"` в JS. | Реализация фильтрует null отдельно — проверь конкретное поведение. |

## 17. Related

- [utilities/arrayHandler.md](./arrayHandler.md) — параллель для массивов.
- [utilities/stringHandler.md](./stringHandler.md) — соседи.
- [architecture/config.md](../architecture/config.md) — `deepMerge`/`deepFreeze` в plugin install.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

Нет.

### Skipped tests

Нет.

### API inconsistencies

- `compare(value1: A, value2: B, comparator: (a: A, b: B) => any, order: number)` — `comparator` объявлен возвращающим `any`. Generic'и поддерживают разные типы для левого и правого аргумента — необычно для compare.
- `isObject` / `isEmpty` / `isNotEmpty` — не type-guards (`boolean`, не `value is X`).
- Существуют две функции глубокой копии: `deepCopyObject` и `deepCopy`. Разница только в namespace, не в поведении (или почти не — нужно сверять с реализацией). Дубль.

### Behavioral caveats

- `deepMerge` мерджит массивы как `[...left, ...right]` — может привести к дубликатам элементов и нежелательному росту массивов. Для config'а с массивами планируй явный override.
- `deepFreeze` не trakит замену верхнего уровня — `obj = newObj` за пределами области не возбраняется.
- `unFreeze` возвращает копию; оригинал остаётся frozen.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
