---
title: utils/dateHandler
summary: isDate type guard, formatDate с локалями, convertMask dayjs → date-fns.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/dateHandler

## 1. Overview

Date-утилиты: проверка, форматирование с локалями (через `date-fns`), конверсия dayjs-mask → date-fns format.

Stability: `stable`.

Source: [lib/utils/dateHandler.ts](../../lib/utils/dateHandler.ts), [lib/utils/dateHandler.d.ts](../../lib/utils/dateHandler.d.ts), [lib/utils/dateHandler.test.ts](../../lib/utils/dateHandler.test.ts).

## 2. How it's organized

```
lib/utils/dateHandler.ts
lib/utils/dateHandler.d.ts          # 204 строки
lib/utils/dateHandler.test.ts       # 40 кейсов
```

Зависимости: `date-fns ^4.1.0`, `date-fns/locale` ([lib/package.json:50](../../lib/package.json#L50)).

## 3. How it works

- `isDate(value)` — `value instanceof Date`.
- `convertMask(dayjsMask)` — преобразует dayjs-mask (`"DD.MM.YYYY"`, `"YYYY-MM-DDTHH:mm:ss"`) в date-fns формат (`"dd.MM.yyyy"`, `"yyyy-MM-dd'T'HH:mm:ss"`). Используется для совместимости с историческими паттернами.
- `formatDate(value, mask, options)` — обёртка над `date-fns/format`. Auto-detects локаль из mask-pattern'а (например, наличие `MMMM` русских месяцев) и подгружает соответствующую `date-fns/locale`.

`DateFormatMask` ([dateHandler.d.ts](../../lib/utils/dateHandler.d.ts)) — union из 30+ pattern'ов: `M | MM | MMM | MMMM | D | DD | Do | ... | "DD MMMM YYYY"` и т.д.

SSR/hydration: на сервере работает (date-fns SSR-friendly).

## 4. Quick Start

```ts
import { isDate, formatDate, convertMask } from "fishtvue/utils/dateHandler"
import { ru } from "date-fns/locale"

isDate(new Date())  // true

formatDate(new Date(2026, 4, 9), "DD.MM.YYYY")
// "09.05.2026"

formatDate(new Date(2026, 4, 9), "DD MMMM YYYY", { locale: ru })
// "09 мая 2026"

convertMask("YYYY-MM-DD")
// "yyyy-MM-dd"
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
| `isDate(value)` | `<T>(value: T) => boolean` | True если `instanceof Date`. |
| `convertMask(dayjsMask)` | `(dayjsMask: string) => string` | dayjs → date-fns mask. |
| `formatDate(value, mask, options)` | `(value: string \| number \| Date, mask: DateFormatMask, options: FormatDateOptions) => string` | Форматирует через date-fns с опциональной локалью. |

`FormatDateOptions = { locale?: Locale }` — Locale из `date-fns`.

`DateFormatMask` — открытый union с предопределёнными значениями + `string` (см. [dateHandler.d.ts](../../lib/utils/dateHandler.d.ts)).

## 9. Examples

### 9.1 Базовое форматирование

```ts
import { formatDate } from "fishtvue/utils/dateHandler"

formatDate("2026-05-09", "DD.MM.YYYY")  // "09.05.2026"
formatDate(1746816000000, "DD MMM YYYY") // "09 May 2026"
```

### 9.2 С русской локалью

```ts
import { formatDate } from "fishtvue/utils/dateHandler"
import { ru } from "date-fns/locale"

formatDate(new Date(), "DD MMMM YYYY", { locale: ru })
// "09 мая 2026"
```

### 9.3 convertMask для миграции с dayjs

```ts
import { convertMask } from "fishtvue/utils/dateHandler"
import { format } from "date-fns"

const fnsMask = convertMask("DD.MM.YYYY HH:mm")
format(new Date(), fnsMask)
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Используется внутри [Calendar](../components/calendar.md) для парсинга/форматирования значения.

## 12. Accessibility & Security

- Не делает network-вызовов. Pure-функции (с side-effect инициализации date-fns/locale).
- `formatDate` возвращает строку — безопасна для рендеринга через `v-text`.

## 13. TypeScript

```ts
import { formatDate } from "fishtvue/utils/dateHandler"
import type { DateFormatMask } from "fishtvue/utils/dateHandler"

const mask: DateFormatMask = "DD.MM.YYYY"
const s = formatDate(new Date(), mask)
```

## 14. Compatibility & Stability

- date-fns 4.x — major bumping может ломать совместимость.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { formatDate } from "fishtvue/utils/dateHandler"

describe("formatDate", () => {
  it("форматирует ISO", () => {
    expect(formatDate("2026-01-01", "DD.MM.YYYY")).toBe("01.01.2026")
  })
})
```

Реальные тесты — [dateHandler.test.ts](../../lib/utils/dateHandler.test.ts) (40 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `formatDate("2026-05-09", "...")` парсит как UTC и сдвигает на ±1 день | Парсинг ISO-строки — UTC. | Передавай `Date`-объект или используй `parseISO` явно. |
| Русские месяцы выводятся в именительном | По умолчанию `MMMM` в date-fns даёт nominative. Для родительного: `LLLL`. | Используй `LLLL` mask или передай локализованный custom-формат. |
| `convertMask` не трогает мой mask | Функция знает ограниченный набор замен. | Сверься с реализацией; для нестандартного — пиши свой. |
| Размер bundle большой из-за date-fns | Tree-shake работает, но `formatDate` тянет несколько locale-объектов. | В Vite/Rollup проверь, что bundler корректно tree-shake'ит `date-fns/locale/{en,ru}`. |

## 17. Related

- [components/calendar.md](../components/calendar.md) — основной потребитель.
- [components/table.md](../components/table.md) — для date-колонок.
- [utilities/numberHandler.md](./numberHandler.md), [utilities/stringHandler.md](./stringHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

- coverage `dateHandler.ts` — 72.61% statements / 65.38% branch ([lib/utils/dateHandler.ts:342–362](../../lib/utils/dateHandler.ts#L342-L362)). Часть веток не покрыта тестами.

### Skipped tests

Нет.

### API inconsistencies

- `DateFormatMask` — open union (`... | string`) → narrow на predefined значения не работает. TypeScript принимает любую строку.
- `isDate` не type-guard signature.

### Behavioral caveats

- Auto-detect локали по mask-pattern'у не идеален: если в кастомном тексте есть слово типа «года», функция может ошибочно подхватить русскую локаль.
- date-fns 4 переименовала ряд entry-points — при обновлении проекта проверь импорты.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
