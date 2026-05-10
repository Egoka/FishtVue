---
title: utils/colorsHandler
summary: Конвертация HSL → HEX строкой.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# utils/colorsHandler

## 1. Overview

Один публичный helper — `hslToHex(hsl)`. Принимает строку формата `hsl(H, S%, L%)` и возвращает `#rrggbb`. Используется внутри [theme/helpers/palette.ts](../../lib/theme/helpers/palette.ts) и в местах, где CSS-переменные с HSL надо привести к виду, понятному внешним инструментам.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/utils/colorsHandler.ts](../../lib/utils/colorsHandler.ts), [lib/utils/colorsHandler.d.ts](../../lib/utils/colorsHandler.d.ts), [lib/utils/colorsHandler.test.ts](../../lib/utils/colorsHandler.test.ts).

## 2. How it's organized

```
lib/utils/colorsHandler.ts        # реализация
lib/utils/colorsHandler.d.ts      # тип-декларация (1 строка — declare)
lib/utils/colorsHandler.test.ts   # 14 кейсов
```

Внутренних/внешних зависимостей нет. Tree-shake friendly.

## 3. How it works

`hslToHex(hsl)`:

1. Если строка пустая — возвращает `""`.
2. Если не соответствует pattern'у `hsl(...)` — возвращает входную строку без изменений.
3. Парсит H/S/L, конвертирует в RGB через стандартную HSL-RGB формулу, форматирует в `#rrggbb`.

SSR/hydration: чистая функция, side-effect отсутствует.

## 4. Quick Start

```ts
import { hslToHex } from "fishtvue/utils/colorsHandler"

hslToHex("hsl(120, 100%, 50%)") // "#00ff00"
```

## 5. Props

Не применимо. Параметры функции:

| Param | Type | Description |
|---|---|---|
| `hsl` | `string` | Строка HSL вида `"hsl(H, S%, L%)"`. |

Returns: `string` — HEX или входная строка/пустая строка при невалидном вводе.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `hslToHex(hsl)` | `(hsl: string) => string` | HSL → HEX. |

## 9. Examples

```ts
import { hslToHex } from "fishtvue/utils/colorsHandler"

hslToHex("hsl(0, 100%, 50%)")   // "#ff0000"
hslToHex("hsl(240, 100%, 50%)") // "#0000ff"
hslToHex("")                    // ""
hslToHex("not hsl")             // "not hsl"
```

## 10. Configuration & Customization

Не применимо.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

Чистая функция, без DOM/network. Безопасна.

## 13. TypeScript

```ts
import { hslToHex } from "fishtvue/utils/colorsHandler"
const hex: string = hslToHex("hsl(60, 100%, 50%)")
```

## 14. Compatibility & Stability

- Чистый JS, без браузерных зависимостей.
- Stability: `stable`.
- На момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { describe, it, expect } from "vitest"
import { hslToHex } from "fishtvue/utils/colorsHandler"

describe("hslToHex", () => {
  it("converts pure red", () => {
    expect(hslToHex("hsl(0, 100%, 50%)")).toBe("#ff0000")
  })
})
```

Реальные тесты — [colorsHandler.test.ts](../../lib/utils/colorsHandler.test.ts) (14 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Невалидный HSL возвращается без конверсии | Пограничное поведение функции. | Проверь формат `hsl(H, S%, L%)` — обязательны `,` и `%`. |
| Алфа-канал не учитывается | Функция не поддерживает `hsla()`. | Используй сторонний колор-helper для HSLA. |

## 17. Related

- [architecture/theme.md](../architecture/theme.md) — `palette()`, `tailwind()`.
- [utilities/numberHandler.md](./numberHandler.md), [utilities/stringHandler.md](./stringHandler.md) — соседние handlers.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` не зафиксировано.

### Incomplete or stubbed behavior

- HSLA не поддерживается.
- При невалидном вводе функция возвращает входную строку без диагностики — silent failure.

### Skipped tests

Нет.

### API inconsistencies

- [colorsHandler.d.ts](../../lib/utils/colorsHandler.d.ts) — 1 строка (`declare`-stub). Реальный тип берётся из `.ts`.

### Behavioral caveats

- Округление при HSL→RGB может дать отличие на 1 единицу в каналах vs другие генераторы.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
