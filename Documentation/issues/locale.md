---
title: Issues — Locale system
summary: Аудит locale — coverage 0% (Issue 1 open). Fallback chain ✅ 2026-05-20, interpolation + pluralization ✅ 2026-06-19 (Wave 3.5, Component.t(key, params?) + Intl.PluralRules). only en/ru bundled.
updated: 2026-06-19
audit-checklist: 60-point + Configuration support
source: lib/locale/
related-doc: ../architecture/locale.md
---

# Issues — Locale

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 3 | A2, A4-5, J46 (0% coverage); ~~F30~~ ✅ 2026-06-19, ~~L53~~ ✅ 2026-05-20 |
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

## ~~Issue 2: Нет fallback chain для отсутствующих ключей~~ ✅ resolved 2026-05-20

- **Категория:** L53
- **Severity:** ~~high~~ ✅ resolved

~~См. [config.md Issue 3](./config.md) — fallback логика должна быть в `t(key)` через config-уровень.~~

> ✅ **resolved 2026-05-20** — `Component.t(key)` ([component/index.ts:191](../../lib/component/index.ts#L191)) реализует fallback chain `messages[active][key] → messages[default][key] → key` (dot-path через `objectHandler.get`), возвращает `string` (key как last resort). См. [locale.md §3/§18](../architecture/locale.md#3-how-it-works).

## ~~Issue 3: Нет interpolation / pluralization~~ ✅ resolved 2026-06-19 (Wave 3.5)

- **Категория:** F30
- **Severity:** ~~high~~ ✅ resolved
- **Где:** [Component.t(key, params?)](../../lib/component/index.ts#L191), [stringHandler.interpolate / selectPlural](../../lib/utils/stringHandler.ts)

### Что найдено

~~Текущий `t("button.save")` возвращает строку как есть.~~ Нет было:
- **Interpolation**: `t("welcome", { name: "Egor" })` → `"Hello, Egor!"`.
- **Pluralization**: `t("itemsCount", { count: 5 })` → `"5 items"` / `"1 item"`.

### Что сделано (✅ 2026-06-19)

`Component.t(key, params?)` расширен опциональным `params: Record<string, string | number>` (backward-compatible — без `params` поведение прежнее):

```ts
public t(key, params?): string {
  // ...fallback chain даёт value: string (active → default → key)...
  if (params) {
    if (typeof params.count === "number" && value.includes("|")) value = selectPlural(value, params.count, active)
    value = interpolate(value, params)
  }
  return value
}
```

- **interpolation** — [`interpolate(template, params)`](../../lib/utils/stringHandler.ts): `{name}` → `params[name]`; неизвестный плейсхолдер остаётся литералом (dev-сигнал).
- **pluralization** — [`selectPlural(template, count, locale)`](../../lib/utils/stringHandler.ts): per-locale CLDR-правила через **`Intl.PluralRules`** (платформенный API, без новой npm-зависимости вопреки `vue-i18n`-варианту). Формат формы — `<selector> <text>` через `|`, selector = `=N` (точное) либо CLDR-категория (`zero|one|two|few|many|other`); порядок выбора `=count → категория → other → первая форма`. Russian-формы корректны для краёв (21 → `one`, 11 → `many`, 22 → `few`), чего эвристика `n === 1` не давала.

Locale-сообщения `select.resultsCount`/`table.resultsCount` переведены на pluralized-формат; `Select.vue`/`Table.vue` (aria-live results) читают через `t("…resultsCount", { count })`.

### Acceptance criteria

- [x] `t("welcome", { name: "Egor" })` returns `"Hello, Egor!"`.
- [x] `t("itemsCount", { count: 5 })` использует Russian pluralization rules (через `Intl.PluralRules`).

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
