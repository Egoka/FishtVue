---
title: Issues — Locale system
summary: Аудит locale — coverage 0% (Issue 1 open). Fallback chain ✅ 2026-05-20, interpolation + pluralization ✅ 2026-06-19 (Wave 3.5, Component.t(key, params?) + Intl.PluralRules), packaging ✅ волна 2 (Issue 5). only en/ru bundled. Открыты: coverage, RTL-flag в NameLocale, date/number locale.
updated: 2026-09-05
audit-checklist: 60-point + Configuration support
source: lib/locale/
related-doc: ../architecture/locale.md
---

# Issues — Locale

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 0 | ~~J46 (coverage — Issue 1)~~ ✅ 2026-09-05, ~~A2, A4-5 (Issue 5)~~ ✅ закрыты волной 2, ~~F30~~ ✅ 2026-06-19, ~~L53~~ ✅ 2026-05-20 |
| medium | 4 | F31 (no RTL flag in NameLocale), F32 (date/number locale), D21, K46 |
| low | 2 | D22, B10 |

## ~~Issue 1: Locale runtime coverage 0%~~ ✅ resolved 2026-09-05

> **Закрыто тестами** — [locale.test.ts](../../lib/locale/locale.test.ts), 10 кейсов.
>
> План предлагал сверять локали с интерфейсом `DefaultMessages`, но в рантайме его нет — это только тип, и следит за ним `vue-tsc`. Реальный рантайм-риск другой: **дрейф между локалями**. Ключ добавили в `en`, забыли в `ru` — и `Component.t()` тихо отдаёт английский текст в русском интерфейсе, потому что fallback chain по построению не отличает «нет перевода» от «так задумано». Тест проверяет симметрию ключей в обе стороны, непустоту всех значений, отсутствие копипасты `en` в `ru` и формат pluralization-шаблонов (включая формы `few`/`many`, которых в английском нет).
>
> **Важно про саму метрику.** Поднять её тестами **нельзя**: у модуля 0 исполняемых инструкций после трансформа (`export default <литерал>` / чистый ре-экспорт), v8 рапортует `0/0 statements`, а репортер рисует это как «0%». Проверено по `coverage-final.json`. На агрегат такие файлы не влияют — они не добавляют ни в числитель, ни в знаменатель. Это тот же класс, что уже описанные «ложные нули — renderless-дети». Issue закрыт по существу: поведение теперь проверяется тестами, а цифра в отчёте останется нулём навсегда.

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

~~См. [config.md Issue 3](./done/config.md) — fallback логика должна быть в `t(key)` через config-уровень.~~

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

## ~~Issue 5: SSR styles + sideEffects + unstyled~~ ✅ resolved (наследуется от волн 2 и 3.1)

Все четыре корневых issue закрыты: [button.md Issue 1](./button.md) (SSR-инжекция) ✅ 2026-06-07, [Issue 8](./button.md) (`sideEffects`) ✅ 2026-06-07, [Issue 9](./button.md) (exports map) ✅ 2026-06-11, [Issue 14](./button.md) (`unstyled`) ✅ 2026-05-11.

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
| Fallback chain | ✅ | `Component.t()`: active → default → key (Issue 2 ✅ 2026-05-20) |
| Interpolation | ✅ | `t(key, params)` → `interpolate()` (Issue 3 ✅ 2026-06-19) |
| Pluralization | ✅ | `Intl.PluralRules` + формы через `\|` (Issue 3 ✅ 2026-06-19) |
| RTL detection | ❌ | Issue 4 — открыт |

> Три строки этой таблицы стояли `❌` со ссылками на issue, закрытые ещё в мае-июне. Синхронизировано 2026-09-05.

## Dual-API gap

Не применимо.
