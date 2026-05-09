---
title: utils/uniqueCollection
summary: UniqueKeySetCollection<K, V> — Map ключ→Set значений.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/uniqueCollection

## 1. Overview

Класс-контейнер `UniqueKeySetCollection<K, V>` — `Map<K, Set<V>>` с удобным API. Используется в [Component class](../architecture/component-class.md) как `listOfStyledComponents` и `listOfCssComponents` — реестры уникальных классов и CSS на каждый компонент.

Stability: `stable`.

Source: [lib/utils/uniqueCollection.ts](../../lib/utils/uniqueCollection.ts), [lib/utils/uniqueCollection.d.ts](../../lib/utils/uniqueCollection.d.ts), [lib/utils/uniqueCollection.test.ts](../../lib/utils/uniqueCollection.test.ts).

## 2. How it's organized

```
lib/utils/uniqueCollection.ts
lib/utils/uniqueCollection.d.ts       # 149 строк
lib/utils/uniqueCollection.test.ts    # 16 кейсов
```

Зависимостей нет.

## 3. How it works

Внутри — `Map<K, Set<V>>`. Каждый метод обёртывает `Map.set/get/delete` и `Set.add/has/delete`. Интерфейс ориентирован на «ключ → набор уникальных значений».

SSR/hydration: чистый класс без DOM/network.

## 4. Quick Start

```ts
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"

const c = new UniqueKeySetCollection<string, number>()
c.add("a", [1, 2, 3])
c.add("a", [3, 4])
c.get("a") // Set<number> { 1, 2, 3, 4 }

c.hasValue("a", 2) // true
c.deleteValue("a", [1])
c.deleteKey("a")
```

## 5. Props

Не применимо.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

Класс `UniqueKeySetCollection<K, V>`:

| Method | Type | Description |
|---|---|---|
| `add(key, values?)` | `(key: K, values?: V[]) => void` | Добавляет значения в Set под ключом. Если values нет — создаёт пустой Set. |
| `deleteValue(key, values)` | `(key: K, values: V[]) => void` | Удаляет указанные значения из Set ключа. |
| `deleteKey(key)` | `(key: K) => void` | Удаляет ключ и его Set. |
| `hasValue(key, value)` | `(key: K, value: V) => boolean` | True, если value есть в Set ключа. |
| `get(key)` | `(key: K) => Set<V> \| undefined` | Возвращает Set или undefined. |
| `hasKey(key)` | `(key: K) => boolean` | True, если ключ есть. |
| `keys()` | `() => K[]` | Массив ключей. |
| `values()` | `() => Set<V>[]` | Массив всех Set'ов (по ключам). |
| `size()` | `() => number` | Количество ключей (не суммарных значений). |
| `clear()` | `() => void` | Удаляет все ключи. |

## 9. Examples

### 9.1 Реестр компонент → классов

```ts
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"

const styled = new UniqueKeySetCollection<string, string>()
styled.add("Button", ["px-4", "py-2", "rounded"])
styled.hasValue("Button", "px-4") // true
styled.deleteValue("Button", ["py-2"])
```

### 9.2 Многомерные тэги

```ts
const tags = new UniqueKeySetCollection<string, string>()
tags.add("article-1", ["news", "front-page"])
tags.add("article-2", ["tech"])
console.log(tags.keys())   // ["article-1", "article-2"]
console.log(tags.size())   // 2
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

Чистая структура данных. Безопасна.

## 13. TypeScript

```ts
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"

const c = new UniqueKeySetCollection<symbol, { id: number }>()
c.add(Symbol("a"), [{ id: 1 }])
```

`K` и `V` — открытые generic'и; `K` должен быть hashable (`Map`-совместимый).

## 14. Compatibility & Stability

- Чистый JS, ES2017+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"

describe("UniqueKeySetCollection", () => {
  it("дедуплицирует значения", () => {
    const c = new UniqueKeySetCollection<string, number>()
    c.add("a", [1, 1, 2])
    expect(c.get("a")?.size).toBe(2)
  })
})
```

Реальные тесты — [uniqueCollection.test.ts](../../lib/utils/uniqueCollection.test.ts) (16 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `add(key)` без values не добавляет ничего | Поведение by design — создаёт пустой Set. | Передай `values: []` явно если нужно «зарезервировать ключ». |
| `deleteValue` для несуществующего value тихо ничего не делает | Соответствует `Set.delete`. | Проверь через `hasValue` сначала. |
| Объекты в Set не дедуплицируются по структуре | `Set` сравнивает по ссылке. | Используй `K = string` и сериализуй объекты. |

## 17. Related

- [architecture/component-class.md](../architecture/component-class.md) — `listOfStyledComponents` / `listOfCssComponents`.
- [utilities/objectHandler.md](./objectHandler.md) — соседние коллекционные хелперы.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

Нет.

### Skipped tests

Нет.

### API inconsistencies

- `size()` — метод, а не геттер (как у `Map`/`Set`). Может удивить тех, кто ожидает property.
- `values()` возвращает массив `Set<V>[]`, а не плоский `V[]` — API отличается от `Map.values()`. Намеренно: задумано как «все Set'ы».

### Behavioral caveats

- Без weak references — long-lived collection растёт. Очищай `clear()` или `deleteKey` явно.
- `keys()` возвращает массив, не итератор — на больших коллекциях оверхед.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
