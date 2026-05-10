---
title: utils/tailwindHandler
summary: cn() — слияние Tailwind-классов через clsx + tailwind-merge.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/tailwindHandler

## 1. Overview

Один helper — `cn(...classes)`. Принимает любую комбинацию форматов `clsx` (строка, массив, объект, falsy) и возвращает строку Tailwind-классов с резолвом конфликтующих утилит через `tailwind-merge`. Используется в [Component.setStyle](../../lib/component/index.ts) и многих SFC.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/utils/tailwindHandler.ts](../../lib/utils/tailwindHandler.ts), [lib/utils/tailwindHandler.d.ts](../../lib/utils/tailwindHandler.d.ts), [lib/utils/tailwindHandler.test.ts](../../lib/utils/tailwindHandler.test.ts).

## 2. How it's organized

```
lib/utils/tailwindHandler.ts
lib/utils/tailwindHandler.d.ts
lib/utils/tailwindHandler.test.ts   # 7 кейсов
```

Зависимости — `clsx ^2.1.x`, `tailwind-merge ^3.4.0` ([lib/package.json:48, 54](../../lib/package.json#L48)).

## 3. How it works

`cn(...inputs)` ≡ `twMerge(clsx(...inputs))`. Сначала `clsx` собирает строку из любых вариантов (массивы, объекты, false/undefined фильтруются). Затем `twMerge` дедуплицирует и резолвит Tailwind-конфликты — например, `"px-2 px-4"` → `"px-4"`.

SSR/hydration: чистая функция.

## 4. Quick Start

```ts
import { cn } from "fishtvue/utils/tailwindHandler"

cn("px-2", "py-1", false, ["text-white", { "bg-red-500": true }])
// "px-2 py-1 text-white bg-red-500"

cn("px-2 px-4")         // "px-4"  — конфликт резолвлен
cn("px-2", "px-4")      // "px-4"
cn("text-red-500", null, undefined, "text-blue-500") // "text-blue-500"
```

## 5. Props

Не применимо. Параметр:

| Param | Type | Description |
|---|---|---|
| `...inputs` | `ClassValue[]` (из `clsx`) | Любая комбинация: strings, arrays, objects, falsy. |

Returns: `string`.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `cn(...inputs)` | `(...inputs: ClassValue[]) => string` | Merge + dedup Tailwind-классов. |

## 9. Examples

См. §4. Дополнительно — внутри SFC:

```vue
<script setup lang="ts">
import { cn } from "fishtvue/utils/tailwindHandler"
import { computed } from "vue"

const props = defineProps<{ active?: boolean }>()
const cls = computed(() =>
  cn("rounded px-3 py-1", props.active && "bg-blue-500 text-white")
)
</script>
```

## 10. Configuration & Customization

Не применимо. Поведение конфликт-резолва — из `tailwind-merge` defaults. Кастомная конфигурация (для проектов с extend палитры) — на стороне приложения через `extendTailwindMerge` (импорт из `tailwind-merge`).

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

Чистая функция, без DOM. Безопасна.

## 13. TypeScript

```ts
import { cn } from "fishtvue/utils/tailwindHandler"
import type { ClassValue } from "clsx"

const arr: ClassValue[] = ["px-2", { "bg-red-500": true }]
const cls: string = cn(...arr)
```

## 14. Compatibility & Stability

- Зависит от мажорных версий `clsx` и `tailwind-merge` — bumping major у этих пакетов может сломать поведение.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { cn } from "fishtvue/utils/tailwindHandler"

describe("cn", () => {
  it("merges conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
```

Реальные тесты — [tailwindHandler.test.ts](../../lib/utils/tailwindHandler.test.ts) (7 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Конфликт между `text-{color}` не резолвится | `tailwind-merge` не знает о кастомных утилитах. | Используй `extendTailwindMerge` на стороне приложения. |
| Класс `pseudo:variant` не сливается с `pseudo:other-variant` | По умолчанию `twMerge` группирует по канонам Tailwind v3. | Проверь версию `tailwind-merge` и канонические правила. |
| `cn(0)` возвращает `"0"` (а не пустую строку) | `clsx` по дизайну преобразует число в строку. | Передавай явно false вместо 0 для truthy-проверок. |

## 17. Related

- [architecture/component-class.md](../architecture/component-class.md) — `Component.setStyle()` использует `cn` внутри.
- [architecture/theme.md](../architecture/theme.md) — uno-engine после `cn`.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

Нет.

### Skipped tests

Нет.

### API inconsistencies

Нет.

### Behavioral caveats

- При очень больших списках классов (>100) есть микро-оверхед `twMerge`. Для критичных hot-path кэшируй результат через computed.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
