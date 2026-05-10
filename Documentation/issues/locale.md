---
title: Issues — Locale system
summary: Аудит locale — coverage 0%, нет fallback chain, нет pluralization, нет interpolation, only en/ru bundled.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support
source: lib/locale/
related-doc: ../architecture/locale.md
---

# Issues — Locale

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 5 | A2, A4-5, F30 (no interpolation/pluralization), J46 (0% coverage), L53 (no fallback) |
| medium | 4 | F31 (no RTL flag in NameLocale), F32 (date/number locale), D21, K46 |
| low | 2 | D22, B10 |

## Issue 1: Locale runtime coverage 0%

- **Категория:** J46
- **Severity:** high
- **Где:** [locale/index.ts](../../lib/locale/index.ts), [locale/locales/{en,ru}.ts](../../lib/locale/locales/), coverage 0%

### Что найдено

`lib/locale/index.ts` всего 4 строки — re-export en/ru. Locales themselves — coverage 0%. Нет тестов, проверяющих структуру locale-объектов или соответствие interface `DefaultMessages`.

### Что нужно сделать

1. Добавить тесты:
   - Каждая locale содержит все ключи из `DefaultMessages` interface.
   - Структура nested-keys валидна.
2. CI-step: при добавлении ключа в `DefaultMessages` — все locales должны иметь его (TS catches это, но runtime test confirms).

## Issue 2: Нет fallback chain для отсутствующих ключей

- **Категория:** L53
- **Severity:** high

См. [config.md Issue 3](./config.md) — fallback логика должна быть в `t(key)` через config-уровень.

## Issue 3: Нет interpolation / pluralization

- **Категория:** F30
- **Severity:** high
- **Где:** [Component.t()](../../lib/component/index.ts) (предположительно)

### Что найдено

Текущий `t("button.save")` возвращает строку как есть. Нет:
- **Interpolation**: `t("welcome", { name: "Egor" })` → `"Welcome, Egor!"`.
- **Pluralization**: `t("itemsCount", { count: 5 })` → `"5 items"` / `"1 item"`.

### Что нужно сделать

1. Расширить `t(key, params?, options?)`:
   ```ts
   public t(key: string, params?: Record<string, any>): string {
     let value = lookup(key, locale)
     if (params) {
       value = value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "")
     }
     // pluralization: choose based on params.count
     return value
   }
   ```
2. Или интегрировать `vue-i18n` (peer-dep) и делегировать.
3. Pluralization rules per-locale (Russian имеет 4 формы: 1, 2-4, 5-many, others).

### Acceptance criteria

- [ ] `t("welcome", { name: "Egor" })` returns `"Hello, Egor"`.
- [ ] `t("itemsCount", { count: 5 })` использует Russian pluralization rules.

## Issue 4: NameLocale type — открытый string, нет встроенного RTL flag

- **Категория:** D21 / F31
- **Severity:** medium
- **Где:** [locale/TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts)

### Что найдено

`type NameLocale = string | "en" | "ru"` — open union. Не запрещает добавлять произвольные locale codes, но и не имеет metadata "is RTL?".

### Что нужно сделать

1. Расширить:
   ```ts
   interface LocaleMetadata {
     code: NameLocale
     name: string
     direction?: "ltr" | "rtl"
     dateLocale?: string  // for date-fns
     numberLocale?: string  // for Intl.NumberFormat
   }
   ```
2. Auto-set `<html dir="rtl">` для RTL locales.

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 6: Date/number formatting не уважает locale

- **Категория:** F32

См. [calendar.md Issue 8](./calendar.md). Cross-cutting через FishtVue locale.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `locale.defaultLocale` | ✅ | hardcoded "en" в getDefaultOptions |
| `locale.activeLocale` | ✅ | runtime через setActiveLocale |
| `locale.locales` (metadata) | ⚠️ | structure private |
| `locale.messages` (custom) | ✅ | через config |
| Fallback chain | ❌ | Issue 2 |
| Interpolation | ❌ | Issue 3 |
| Pluralization | ❌ | Issue 3 |
| RTL detection | ❌ | Issue 4 |

## Dual-API gap

Не применимо.
