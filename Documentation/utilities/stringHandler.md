---
title: utils/stringHandler
summary: isString type guard, case-конверсии (включая locale-aware `toCapitalCase`), stringify сериализация.
updated: 2026-05-10
stability: stable
since: 0.2.11
---

# utils/stringHandler

## 1. Overview

Утилиты для проверки строк, конвертации регистров (flat/kebab/capital) и сериализации произвольных значений в строку с отступами.

Stability: `stable`.

Source: [lib/utils/stringHandler.ts](../../lib/utils/stringHandler.ts), [lib/utils/stringHandler.d.ts](../../lib/utils/stringHandler.d.ts), [lib/utils/stringHandler.test.ts](../../lib/utils/stringHandler.test.ts).

## 2. How it's organized

```
lib/utils/stringHandler.ts
lib/utils/stringHandler.d.ts       # 223 строки (полные сигнатуры с JSDoc)
lib/utils/stringHandler.test.ts    # 86 кейсов
```

Зависимостей нет.

## 3. How it works

- `isString(value, empty?)` — type-проверка через `typeof === "string"`. Если `empty: true` — дополнительно требует ненулевую длину.
- `toFlatCase(str)` — нормализует к lowercase без разделителей: `"my-thing"`/`"myThing"`/`"MyThing"`/`"my_thing"` → `"mything"`.
- `toKebabCase(str)` — `"myThing"` → `"my-thing"`.
- `toCapitalCase(str, locale?)` — `"hello"` → `"Hello"`. Использует `String.prototype.toLocaleUpperCase(locale)` — без `locale` берётся host environment locale; явный `locale` (например, `"tr-TR"`) корректно обрабатывает Turkish dotted I (`"i"` → `"İ"`).
- `stringify(value, indent?, currentIndent?)` — `JSON.stringify`-подобный сериализатор с отступами, понимает функции, циклы и спец-кейсы.

SSR/hydration: чистые функции.

## 4. Quick Start

```ts
import { isString, toKebabCase, toFlatCase, toCapitalCase, stringify } from "fishtvue/utils/stringHandler"

isString("hello")            // true
isString("", true)           // false
toFlatCase("MyComponent")    // "mycomponent"
toKebabCase("MyComponent")   // "my-component"
toCapitalCase("hello world") // "Hello world"
stringify({ a: 1 }, 2)       // "{\n  a: 1\n}"
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
| `isString(value, empty?)` | `<T>(value: T, empty?: boolean) => boolean` | Тип-проверка с опциональной валидацией непустоты. |
| `toFlatCase(str)` | `(str: string) => string` | Любой регистр → lowercase без разделителей. |
| `toKebabCase(str)` | `(str: string) => string` | → kebab-case. |
| `toCapitalCase(str, locale?)` | `(str: string, locale?: string \| string[]) => string` | Первая буква → uppercase через `toLocaleUpperCase(locale)`. Поддерживает Unicode (`"über"` → `"Über"`) и явный locale для Turkish dotted I и т.п. |
| `stringify(value, indent?, currentIndent?)` | `(value: any, indent?: number, currentIndent?: number) => string` | Сериализация с отступами. |

## 9. Examples

### 9.1 Регистры

```ts
import { toKebabCase, toFlatCase } from "fishtvue/utils/stringHandler"

toKebabCase("FishtVueButton")  // "fishtvue-button" (или "fisht-vue-button" — зависит от реализации)
toFlatCase("FishtVueButton")   // "fishtvuebutton"
```

### 9.2 Type-guard

```ts
import { isString } from "fishtvue/utils/stringHandler"

function ensure(s: unknown) {
  if (isString(s, true)) return s
  throw new Error("Expected non-empty string")
}
```

### 9.3 Stringify для отладки

```ts
import { stringify } from "fishtvue/utils/stringHandler"

const obj = { name: "X", values: [1, 2, 3] }
console.log(stringify(obj, 2))
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

- `stringify` поддерживает функции — внутри сериализуется их строковое представление, что может содержать чувствительный код. Не отправляй результат во внешние сервисы без фильтрации.
- Чистые функции, без DOM/network.

## 13. TypeScript

```ts
import { isString, toKebabCase } from "fishtvue/utils/stringHandler"

const a: unknown = "hello"
if (isString(a)) {
  // a здесь `unknown` — isString возвращает boolean, не type-guard
}

const k: string = toKebabCase("FishtButton")
```

## 14. Compatibility & Stability

- Чистый JS, ES2017+.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { toKebabCase } from "fishtvue/utils/stringHandler"

describe("toKebabCase", () => {
  it("converts camel", () => {
    expect(toKebabCase("camelCase")).toBe("camel-case")
  })
})
```

Реальные тесты — [stringHandler.test.ts](../../lib/utils/stringHandler.test.ts) (86 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `toKebabCase("FishtVue")` возвращает не то, что ожидал | Алгоритм рассчитан на cammel-case с заглавными как разделителями. | Проверь поведение на тестах; для нестандартного — пиши свой. |
| `isString` после проверки не сужает тип | Возвращает `boolean`, не `value is string`. | Используй `typeof a === "string"` напрямую. |
| `stringify` падает на циклических ссылках | Проверь, что граф объектов не циклический — `JSON.stringify` тоже падает. | Удали циклы вручную или используй `flatted`. |

## 17. Related

- [utilities/objectHandler.md](./objectHandler.md) — `get`, dot-path navigation.
- [utilities/numberHandler.md](./numberHandler.md) — числовое форматирование.
- [architecture/component-class.md](../architecture/component-class.md) — `Component` использует `toKebabCase` для CSS-селектора.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

Нет.

### Skipped tests

Нет.

### API inconsistencies

- В [.d.ts](../../lib/utils/stringHandler.d.ts) на строках 126–127 описание перепутано: блок с заголовком `toKebabCase` выводит результат `toCapitalCase`. На строке 167 `toKebabCase` объявлен повторно. Type-system это пропускает, но JSDoc поясняет некорректно — потребитель может ошибиться при чтении.
- `isString` не type-guard signature.

### Behavioral caveats

- `toFlatCase` теряет различение слов — если потом нужно вернуться к camel/kebab, информация утеряна.
- `toCapitalCase` без `locale` использует host environment locale — для строк с language-specific casing (Turkish `i`/`İ`, Lithuanian `i̇`) передавай `locale` явно.
- `stringify` для функций возвращает их `.toString()` — это включает body. Нежелательно для логирования в production.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
