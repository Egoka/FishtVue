---
title: Issues — Utilities (consolidated)
summary: Сводный аудит 11 utility-handlers — большинство пунктов закрыто (`crypto.randomUUID`, locale-aware phone, Unicode caseing, rules i18n hook, packaging metadata, sort-stability документирована 2026-09-05, coverage dateHandler 72.61 → 92.2 с фиксом регистра AM/PM). Открытых пунктов нет.
updated: 2026-09-05
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
| high | 0 | ~~J46 (dateHandler coverage)~~ ✅ 2026-09-05 — 72.61 / 65.38 → **92.2 / 85.71** |
| medium | 0 | — |
| low | 0 | ~~D22 (arrayHandler.sort документация)~~ ✅ 2026-09-05, ~~J46 (Utils.ts re-export)~~ ✅ 2026-09-05 (non-issue) |

## ~~Issue 1: `functionHandler.generateUUID` использует `Math.random()` — не cryptographically secure~~ ✅ resolved (2026-05-10)

- **Категория:** C13 (security)
- **Severity:** ~~medium~~
- **Где:** [functionHandler.ts:63](../../lib/utils/functionHandler.ts#L63)

`generateUUID` теперь использует `crypto.randomUUID()` (Web Crypto API) с feature-detect и try/catch fallback на `Math.random` только для legacy-runtime'ов / insecure-context. Тесты — [functionHandler.test.ts](../../lib/utils/functionHandler.test.ts) (`crypto.randomUUID integration` describe block, 3 кейса).

## ~~Issue 2: `rulesHandler` validation messages — hardcoded английские строки~~ ✅ resolved (2026-05-10)

- **Категория:** F30 (i18n)
- **Severity:** ~~high~~
- **Где:** [rulesHandler.ts](../../lib/utils/rulesHandler.ts)

Добавлен exported helper `setDefaultRuleMessages(partial)` ([rulesHandler.ts](../../lib/utils/rulesHandler.ts)) — потребитель может переопределить дефолтные сообщения для всех 10 rule-types одной вызовом, либо восстановить английские defaults через `setDefaultRuleMessages({})`. Явно заданный `rule.message` по-прежнему имеет высший приоритет.

В `DefaultMessages` ([locale/TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts)) добавлены optional ключи: `invalidEmail`, `invalidPhone`, `invalidNumeric`, `regexMismatch`, `valueOutOfRange`, `invalidLength`, `invalidField`, `compareMismatch`. Переводы — в [en.ts](../../lib/locale/locales/en.ts) и [ru.ts](../../lib/locale/locales/ru.ts).

Вызов `setDefaultRuleMessages` из Form/Input setup-блока (с маппингом на `t()`) — отдельная задача за пределами `lib/utils/`; обсуждается в [form.md Issue 6](./form.md).

## ~~Issue 3: `numberHandler.convertToPhone` — hardcoded РФ-формат~~ ✅ resolved (2026-05-10)

- **Категория:** F32 (locale aware)
- **Severity:** ~~medium~~
- **Где:** [numberHandler.ts:24](../../lib/utils/numberHandler.ts#L24)

`convertToPhone(value, options?)` теперь принимает второй опциональный параметр `{ phoneFormats?: PhoneFormat[] }`. По умолчанию используются текущие 5 форматов (1, 7, 81, 82, 86) — backward compatible. Тип `PhoneFormat` экспортирован.

Тесты — [numberHandler.test.ts](../../lib/utils/numberHandler.test.ts) (`custom phoneFormats option` describe block, 4 кейса: UK +44, DE +49, fallback при пустом массиве, fallback при отсутствии options).

## ~~Issue 4: `dateHandler` coverage — подтверждён, 72.61 / 65.38~~ ✅ resolved 2026-09-05

- **Категория:** J46
- **Severity:** ~~high~~
- **Где:** [dateHandler.ts](../../lib/utils/dateHandler.ts) — мёртвый switch удалён, регистр AM/PM решается по исходной маске

> **Закрыто 2026-09-05: 72.61 / 65.38 → 92.2 / 85.71** (порог 80 / 70 перекрыт). Заведён
> [dateHandlerMasks.test.ts](../../lib/utils/dateHandlerMasks.test.ts) — 37 кейсов.
>
> **Непокрытый блок оказался недостижимым кодом, а не пробелом в тестах.** В `formatDate` строкой выше switch'а
> стоит `mask = convertMask(mask)`, которая переписывает маску (`Do` → `do`, `W` → `w`, `L` → `P`, `ZZ` → `xx`,
> `ZZZZ` → `zzzz`). Все метки switch'а — исходные dayjs-маски, поэтому **ни одна не могла совпасть**. Coverage
> годами показывал этот блок непокрытым именно потому, что исполнить его было нельзя.
>
> **Найденный баг.** Единственной живой веткой была `case "a"` — `A` и `a` конвертируются в один токен. Поэтому
> `formatDate(date, "A")` возвращала `"pm"` вместо `"PM"`, хотя мёртвая ветка `case "A"` рядом объявляла верхний
> регистр. Исправлено: регистр решается по **исходной** маске, до конвертации. Обе ветки заданы явно — у date-fns
> токен `a` отдаёт верхний регистр, у dayjs нижний, так что нижний тоже приходится восстанавливать вручную.
>
> **Мёртвые ветки удалены, а не «оживлены»** переносом switch'а до конвертации: часть из них расходилась с
> семантикой dayjs, которую модуль эмулирует (`W` в dayjs — номер недели года, а switch отдавал `getDay()`, то есть
> день недели; `Do` — порядковый день месяца, а switch добавлял название месяца). Текущее поведение ближе к dayjs
> и теперь зафиксировано тестами. Заодно ушёл ставший неиспользуемым импорт `getDay`.
>
> Остаток непокрытого — редкие ветки `detectLocale` (скандинавские и восточноевропейские диакритики), низкий приоритет.

### Что нужно сделать

1. ~~Прогнать coverage и подтвердить цифру~~ ✅ 2026-09-05.
2. ~~Добавить тесты на ветви форматирования (`Do`, `A`/`a`, `W`/`WW`/`WWW`/`WWWW`, `L`, `ZZ`–`ZZZZ`) до порога ≥80 % / ≥70 %~~ ✅ 2026-09-05 — 92.2 / 85.71.

## ~~Issue 5: `domHandler.minifyCSS` использует document.createElement — нужен SSR guard~~ ✅ resolved + doc-error fix (2026-05-10)

- **Категория:** C14 (SSR)
- **Severity:** ~~medium~~ → non-issue
- **Где:** [domHandler.ts:280](../../lib/utils/domHandler.ts#L280)

В [domHandler.ts](../../lib/utils/domHandler.ts) функции `minifyCSS` не существует — это была ошибка в исходной формулировке аудита. Реальная функция, использующая `document.createElement`, — `htmlToText` ([domHandler.ts:280–286](../../lib/utils/domHandler.ts#L280)), и SSR-guard `if (!isClient() || typeof html !== "string") return html` уже стоит на L281 до обращения к `document`. Никаких изменений не требуется.

## ~~Issue 7: Open-string types в utility-API — narrow невозможен~~ withdrawn (2026-05-10)

- **Категория:** D21
- **Severity:** ~~medium~~ → withdrawn

Формулировка была неконкретной (упоминался `convertMask("dayjs-format")`). На момент ревизии:
- [dateHandler.ts](../../lib/utils/dateHandler.ts) `convertMask(dayjsMask: string)` принимает обычный `string` — это интерфейс trivial passthrough к `date-fns`/`dayjs` форматам, narrow через template literal type здесь не оправдан (~10⁴ комбинаций токенов).
- Других open-string API в utilities нет.

Issue снимается без действий.

## ~~Issue 8: `objectHandler.deepMerge` — mutation vs immutable behavior~~ ✅ resolved (2026-05-10)

- **Категория:** D22 / API consistency
- **Severity:** ~~low~~
- **Где:** [objectHandler.ts:406](../../lib/utils/objectHandler.ts#L406)

Поведение явно зафиксировано в JSDoc и регрессионном тесте. **Канон:** `deepMerge` мутирует и возвращает первый non-empty object аргумент; subsequent objects merge into it. Безопасный паттерн — `deepMerge(deepCopy(defaults), overrides)`. Тесты — [objectHandler.test.ts](../../lib/utils/objectHandler.test.ts) (`should mutate and return the first non-empty object argument`, `should preserve later inputs unchanged when first argument is deep-cloned`).

## ~~Issue 9: `arrayHandler.sort` — stability не гарантируется~~ ✅ resolved 2026-09-05 (doc-only)

- **Категория:** D22
- **Severity:** ~~low~~
- **Где:** [arrayHandler.ts:222](../../lib/utils/arrayHandler.ts#L222)

> **Ответ на вопрос issue.** `sort` — **comparator, а не сортировщик**: принимает два значения, возвращает число, `Array.prototype.sort` внутри не вызывает вовсе. Значит стабильность обеспечивает вызывающая сторона, и она гарантирована: `Array.prototype.sort` стабилен по спецификации с **ES2019**, а библиотека таргетирует evergreen-браузеры.
>
> Оговорка, специфичная именно для этой функции: при `nullSortOrder ≠ order` пары с `null`/`undefined` сравниваются другим множителем, чем остальные. Стабильность это не нарушает, но «пустые» значения образуют отдельный блок в начале или конце, а не участвуют в общей шкале.
>
> Отдельно проверено: внутри `lib/` `sort` не вызывается ни одним компонентом — это чисто публичная утилита (Table сортирует своим `localeCompare`-компаратором).
>
> Документировано в [utilities/arrayHandler.md §9.1](../utilities/arrayHandler.md). Код не трогали, как и предписывал план.

## ~~Issue 10: `stringHandler.toCapitalCase` — non-ASCII и Unicode~~ ✅ resolved (2026-05-10)

- **Категория:** F32
- **Severity:** ~~low~~
- **Где:** [stringHandler.ts:183](../../lib/utils/stringHandler.ts#L183)

`toCapitalCase(str, locale?)` теперь использует `String.prototype.toLocaleUpperCase(locale)` вместо `toUpperCase()`. Без `locale` берётся host environment locale — для ASCII результат идентичен прежнему. Явный `locale` (например, `"tr-TR"`) — корректно обрабатывает Turkish dotted I (`"i"` → `"İ"`).

Тесты — [stringHandler.test.ts](../../lib/utils/stringHandler.test.ts) (Unicode diacritics, Turkish locale, locale array).

## ~~Issue 11: `Utils.ts` (агрегатор) coverage 0% — не реальная проблема~~ ✅ closed 2026-09-05 (non-issue)

- **Категория:** K46 → non-issue

[Utils.ts](../../lib/utils/Utils.ts) — re-export aggregator (~25 строк), исполняемого кода нет, coverage 0% ожидаем. Документировано в [utilities/](../utilities/) что это барель-файл. Issue снимается без действий.

## Cross-cutting: ~~Issue 6: sideEffects, exports map, ESM/CJS~~ ✅ partially resolved (2026-05-10)

- **Категория:** A2, A4, A5
- **Severity:** ~~high~~ → ⚠️ partial

В [lib/utils/package.json](../../lib/utils/package.json) добавлены `"sideEffects": false` и `exports` map с условиями `types`/`import`/`default` (включая subpath pattern `./*` для индивидуальных handler'ов и `./package.json`).

**Не входит в этот ТЗ** (cross-cutting на 22 component'а + root):
- Аналогичный fix для [lib/package.json](../../lib/package.json) и каждого [lib/{component}/package.json](../../lib/).
- CJS-вариант (требует расширения [lib/rollup.config.js](../../lib/rollup.config.js)).

Полный fix — отдельное ТЗ; см. [button.md Issue 8 и Issue 9](./button.md), [issues/README.md cross-cutting](../README.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| Locale awareness (rulesHandler) | ✅ | через `setDefaultRuleMessages` |
| Locale awareness (numberHandler.convertToPhone) | ✅ | через optional `phoneFormats` |
| Locale awareness (dateHandler.formatDate) | ⚠️ | через `date-fns` |
| Locale awareness (stringHandler.toCapitalCase) | ✅ | через optional `locale` |
| `componentsOptions` | N/A | utilities — это helpers, не components |

## Dual-API gap

Не применимо к utilities.
