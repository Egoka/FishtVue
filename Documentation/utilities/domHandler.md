---
title: utils/domHandler
summary: DOM-проверки, isClient, setAttribute(s), minifyCSS.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/domHandler

## 1. Overview

DOM-утилиты: SSR-guard, проверка элементов, унифицированный `setAttribute(s)`, минификатор CSS-строк. Используется в [Component class](../architecture/component-class.md), [Config plugin](../architecture/config.md) и многих SFC.

Stability: `stable`.

Source: [lib/utils/domHandler.ts](../../lib/utils/domHandler.ts), [lib/utils/domHandler.d.ts](../../lib/utils/domHandler.d.ts), [lib/utils/domHandler.test.ts](../../lib/utils/domHandler.test.ts).

## 2. How it's organized

```
lib/utils/domHandler.ts
lib/utils/domHandler.d.ts          # 149 строк
lib/utils/domHandler.test.ts       # 70 кейсов
```

Зависимостей нет.

## 3. How it works

- `isClient()` — проверяет наличие `window` и `document`. Используется как SSR-guard перед DOM-операциями.
- `isElement(obj)` — `obj.nodeType === 1` + базовые проверки.
- `getParentNode(element)` — возвращает `parentNode`, если родитель — `ShadowRoot`, переключается на `host`.
- `setAttribute(el, name, value)` / `setAttributes(el, obj)` — обёртки над `el.setAttribute` с поддержкой `null/undefined` (удаляет атрибут).
- `minifyCSS(css)` — удаляет комментарии и whitespace из CSS-строки. Используется в [Component.__setStyle](../../lib/component/index.ts).

SSR/hydration: `isClient()` — guard. Прочие функции не должны вызываться на сервере (нет DOM).

## 4. Quick Start

```ts
import { isClient, isElement, minifyCSS } from "fishtvue/utils/domHandler"

if (isClient()) {
  document.querySelector(".x")
}

isElement(document.body)        // true
minifyCSS("/* comment */ .a { color: red; }")  // ".a{color:red}"
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
| `isClient()` | `() => boolean` | True если в браузере. |
| `isElement(obj)` | `(obj: HTMLElement \| any) => boolean` | True если `obj.nodeType === 1`. |
| `getParentNode(el)` | `(element: HTMLElement) => ParentNode \| Element \| null` | parent узла. |
| `setAttribute(el, name, value)` | `(el: HTMLElement, attribute: string, value: any) => void` | Устанавливает один атрибут. |
| `setAttributes(el, obj)` | `(el: HTMLElement, attributes: object) => void` | Устанавливает несколько атрибутов. |
| `minifyCSS(css)` | `(css: string \| any) => string` | Минификатор CSS-строки. |

## 9. Examples

```ts
import { isClient, setAttributes, minifyCSS } from "fishtvue/utils/domHandler"

if (isClient()) {
  const el = document.createElement("div")
  setAttributes(el, { id: "x", "data-foo": "bar", role: "button" })
}

const css = minifyCSS(`
  /* layer */
  .a {
    color: red;
  }
`)
// ".a{color:red}"
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

- `setAttributes` принимает любой объект как value — не санитизирует значения. Не передавай user input как value `data-*` без проверки.
- `minifyCSS` — текстовая обработка regex'ом. Безопасна.
- На сервере вызовы DOM-функций упадут — guard через `isClient()` обязателен.

## 13. TypeScript

```ts
import { isClient, setAttribute, minifyCSS } from "fishtvue/utils/domHandler"

if (isClient()) {
  const el = document.body
  setAttribute(el, "data-x", 42)  // any — TS не валидирует value
}

const min: string = minifyCSS("a { b: c }")
```

## 14. Compatibility & Stability

- Браузер evergreen + Node 18+ (для `isClient()` корректный fallback на сервере).
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { minifyCSS } from "fishtvue/utils/domHandler"

describe("minifyCSS", () => {
  it("strips comments", () => {
    expect(minifyCSS("/* x */ .a { b: c }")).toBe(".a{b:c}")
  })
})
```

Реальные тесты — [domHandler.test.ts](../../lib/utils/domHandler.test.ts) (70 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `isClient()` возвращает `true` в Node + jsdom | jsdom предоставляет `window`. Это by design. | Тесты в jsdom — норма. Для строгого SSR-guard'а используй `import.meta.server` (Nuxt) или `typeof process !== "undefined"`. |
| `getParentNode` возвращает `null` для root узла | У `<html>` нет parent. | Проверь явно. |
| `minifyCSS` ломает CSS с строками `content: "/* x */"` | Простая regex-минификация не учитывает CSS-строки. | Используй PostCSS pipeline для проблемных случаев. |
| `setAttribute(el, "data-x", null)` | Реализация может не удалить атрибут — проверь поведение. | Используй `el.removeAttribute("data-x")` явно. |

## 17. Related

- [architecture/component-class.md](../architecture/component-class.md) — `isClient()`, `minifyCSS` в `Component.__setStyle`.
- [architecture/theme.md](../architecture/theme.md) — `useStyle`, `tailwind` (соседняя DOM-инфраструктура).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

- В [.d.ts](../../lib/utils/domHandler.d.ts) JSDoc описания одной из функций упоминает `isExist()` (видимо, прошлое имя — сейчас функция называется `isClient`). Несоответствие документации/реализации.

### Skipped tests

Нет.

### API inconsistencies

- `isElement(obj: HTMLElement | any)` — union с `any` делает type-проверку нерабочей.
- `minifyCSS(css: string | any)` — то же.

### Behavioral caveats

- `minifyCSS` — простая regex; на сложном CSS может удалить значимые пробелы или сломать строки. Используй на доверенном CSS (генерированном внутри FishtVue).
- `setAttributes` устанавливает атрибуты последовательно — порядок важен для специфичных кейсов (например, `aria-*` + `role`).

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
