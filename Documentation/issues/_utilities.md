---
title: Issues — Utilities (consolidated)
summary: Сводный аудит 11 utility-handlers — generateUUID через Math.random (не secure), validation messages локализация, dateHandler coverage 72%.
updated: 2026-05-10
audit-checklist: 60-point (subset relevant) + Configuration support
source: lib/utils/
related-doc: ../utilities/
---

# Issues — Utilities (consolidated)

> Большинство пунктов чек-листа неприменимы к утилитам (не UI, не SSR, не a11y, не RTL). Этот документ покрывает A1–A5 (distribution), D20–D21 (TS), L (locale awareness), J46 (тесты).

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 4 | A2, A4-5, F30 (validation messages no i18n), J46 (dateHandler 72%) |
| medium | 4 | C13 (functionHandler.generateUUID Math.random), F32 (numberHandler phone hardcode), D21 (some open-string types), K46 |
| low | 3 | A1 (no per-utility tree-shake markers), D22, K46 |

## Issue 1: `functionHandler.generateUUID` использует `Math.random()` — не cryptographically secure

- **Категория:** C13 (security)
- **Severity:** medium
- **Где:** [functionHandler.ts:65](../../lib/utils/functionHandler.ts#L65)

### Что найдено

```ts
const r = (Math.random() * 16) | 0
```

`Math.random()` — pseudorandom (Mersenne Twister), не cryptographically secure. Если UUID используется для security-context (CSRF tokens, session keys), это уязвимость.

### Почему это проблема

- Если consumer использует `generateUUID()` для security purposes (документация не запрещает это), уязвим.
- Современные browsers + Node 14.17+ имеют `crypto.randomUUID()` — secure из коробки.

### Что нужно сделать

1. Использовать `crypto.randomUUID()` с fallback:
   ```ts
   export function generateUUID(): string {
     if (typeof crypto !== "undefined" && crypto.randomUUID) {
       return crypto.randomUUID()
     }
     // Math.random fallback for very old browsers
     return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
       const r = (Math.random() * 16) | 0
       const v = c === "x" ? r : (r & 0x3) | 0x8
       return v.toString(16)
     })
   }
   ```
2. Документировать в [Documentation/utilities/functionHandler.md](../utilities/functionHandler.md): «v2 generates secure UUID; fallback for IE11 / very old Node только».

### Acceptance criteria

- [ ] В Chrome/Node 18+ — `crypto.randomUUID` используется.
- [ ] Тест: collision rate over 1M generations.

## Issue 2: `rulesHandler` validation messages — hardcoded английские строки

- **Категория:** F30 (i18n)
- **Severity:** high
- **Где:** [rulesHandler.ts](../../lib/utils/rulesHandler.ts), [rulesMethods.ts](../../lib/utils/rulesMethods.ts)

### Что найдено

Уже отмечено в [form.md Issue 6](./form.md). Validation rules возвращают error messages на английском — hardcoded.

### Что нужно сделать

См. [form.md Issue 6](./form.md). Локализация через `t("validation.required")` keys + добавить ключи в [locale/locales/{en,ru}.ts](../../lib/locale/locales/).

## Issue 3: `numberHandler.convertToPhone` — hardcoded РФ-формат

- **Категория:** F32 (locale aware)
- **Severity:** medium

См. [input.md Issue 7](./input.md). Phone mask не учитывает текущую locale.

## Issue 4: `dateHandler` coverage 72%/65% — uncovered ветви

- **Категория:** J46
- **Severity:** high
- **Где:** [dateHandler.test.ts](../../lib/utils/dateHandler.test.ts), coverage 72.61/65.38

### Что найдено

```
lib/utils/dateHandler.ts: 72.61 / 65.38 / 100 / 84.05
Uncovered: 342-362
```

Lines 342-362 — последние 20 строк (вероятно edge cases formatDate / convertMask).

### Что нужно сделать

1. Audit lines 342-362 — какие сценарии untested.
2. Добавить тесты для: invalid date input, custom mask, locale switching, SSR-context.
3. Целевой coverage > 90%.

## Issue 5: `domHandler.minifyCSS` использует document.createElement — нужен SSR guard

- **Категория:** C14 (SSR)
- **Severity:** medium
- **Где:** [domHandler.ts:283](../../lib/utils/domHandler.ts#L283)

### Что найдено

```ts
const textarea = document.createElement("textarea")
```

Внутри функции (не на верхнем уровне, вероятно execCommand-related). Если функция вызывается на SSR — крэш. Нужен guard.

### Что нужно сделать

1. На верху функции: `if (!isClient()) return value` (или return as-is).
2. Тест: `vi.stubGlobal("document", undefined); minifyCSS("...")` — не падает.

## Issue 6: Cross-cutting — sideEffects, exports map, ESM/CJS

- **Категория:** A2, A4, A5
- **Severity:** high

См. [button.md Issue 8, 9](./button.md). Каждый utility-файл имеет минимальный package.json (`main`, `types`) без `sideEffects`. Tree-shake потребителя не оптимален.

## Issue 7: Open-string types в utility-API — narrow невозможен

- **Категория:** D21
- **Severity:** medium

Например, `convertMask("dayjs-format")` (если такой API есть) — принимает open-string. Документировать или narrow через template literal type.

## Issue 8: `objectHandler.deepMerge` — mutation vs immutable behavior

- **Категория:** D22 / API consistency
- **Severity:** low
- **Где:** [objectHandler.ts](../../lib/utils/objectHandler.ts) (deepMerge)

### Что найдено

`deepMerge` мутирует target? Возвращает новый объект? Документация [utilities/objectHandler.md](../utilities/objectHandler.md) должна явно указывать.

### Что нужно сделать

Документировать поведение mutation/immutable. Если иммутабильный — название можно оставить; если мутирует — лучше `deepMergeInto`.

## Issue 9: `arrayHandler.sort` — stability не гарантируется

- **Категория:** D22
- **Severity:** low
- **Где:** [arrayHandler.ts](../../lib/utils/arrayHandler.ts) (sort/filter)

### Что нужно сделать

Документировать: используется ли native `Array.prototype.sort` (stable since ES2019)? Custom comparator?

## Issue 10: `stringHandler.toCapitalCase` — non-ASCII и Unicode

- **Категория:** F32
- **Severity:** low

`toCapitalCase("über")` — корректно ли uppercase'ит «ü»? Использует ли `String.toUpperCase()` (locale-неосознанный) или `toLocaleUpperCase`?

### Что нужно сделать

Тест Unicode + локализованный uppercase, документировать ограничения.

## Issue 11: `Utils.ts` (агрегатор) coverage 0% — но это re-export

- **Категория:** K46

`lib/utils/Utils.ts` 0% — но это обычно просто `export * from "./..."`. Coverage не существенен. Документировать в [Documentation/utilities/](../utilities/) что это агрегатор.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| Locale awareness (rulesHandler) | ❌ | Issue 2 |
| Locale awareness (numberHandler.convertToPhone) | ❌ | Issue 3 |
| Locale awareness (dateHandler.formatDate) | ⚠️ | через date-fns |
| Locale awareness (stringHandler.toUpperCase) | ❌ | Issue 10 |
| `componentsOptions` | N/A | utilities — это helpers, не components |

## Dual-API gap

Не применимо к utilities.
