---
title: Issues — Input
summary: Аудит Input. 11/13 issues закрыты 2026-05-11 (initStyle dedup, componentsStyle fallback, password-toggle override, extended types, phoneFormats prop/option, autocomplete defaults, motion-safe, argless focus, print styles, RTL test, emit semantics docs). Открытыми остаются cross-cutting Issues 3 (packaging) и 4 (unstyled) — трекаются через Wave 2.1 / 3.1.
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/input/
related-doc: ../components/input.md
---

# Issues — Input

## Сводка

| Severity | Count (open) | Categories          |
| -------- | ------------ | ------------------- |
| critical | 0            | —                   |
| high     | 2            | A2, A4-5 (Issue 3); L53 (Issue 4) |
| medium   | 0            | — (все закрыты)     |
| low      | 0            | — (все закрыты)     |

Закрытые 2026-05-11: Issues 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13 (4 high + 5 medium + 3 low − 2 cross-cutting high остаются).

## ~~Issue 1: Стили SSR не инжектятся~~ ✅ resolved 2026-05-11

- **Категория:** C17
- **Severity:** ~~high~~
- **Где:** [Input.vue:156-161](../../lib/input/Input.vue#L156-L161)
- **Resolution:** Удалён дублирующий `Input.initStyle()` из `onMounted` в Input.vue — базовый `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted` ([lib/component/index.ts:79-84](../../lib/component/index.ts#L79-L84)). `onMounted` теперь только устанавливает фокус при `autoFocus: true`. Cross-cutting удаление дубля для остальных 21 SFC трекается в [issues/README.md](./README.md) Wave 2.3.

## ~~Issue 2: Нет componentsStyle global fallback для mode~~ ✅ resolved 2026-05-11

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [Input.vue:62-64](../../lib/input/Input.vue#L62-L64)
- **Resolution:** `mode` computed теперь содержит `?? Input.componentsStyle()` в fallback chain. Покрыто 2 тестами в [Input.test.ts](../../lib/input/Input.test.ts) (single-fallback + priority chain `props > options > componentsStyle > "outlined"`). Cross-cutting для Aria/Select/Calendar/TextEditor — отдельные строчки в Wave 3.2 ([issues/README.md](./README.md)).

### Acceptance criteria

- [x] `app.use(FishtVue, { componentsStyle: "filled" })` + `<Input />` без `mode` prop — рендерится как filled.

## Issue 3: Нет sideEffects/exports map (cross-cutting) — **open**

- **Категория:** A2, A4, A5
- **Severity:** high
- **Tracker:** [Wave 2.1 в issues/README.md](./README.md). Single PR на `lib/package.json` (`"sideEffects": ["**/*.css", "**/*.vue"]` + полная `exports` map для всех 22 subpath).

См. [button.md Issue 8 и Issue 9](./button.md).

## Issue 4: `unstyled: true` не обрабатывается — **open**

- **Категория:** L53
- **Severity:** high
- **Tracker:** [Wave 3.1 в issues/README.md](./README.md). Один guard `if (this.config?.unstyled) return ""` в [Component.setStyle()](../../lib/component/index.ts#L134) закрывает поведение для всех 22 SFC.

См. [button.md Issue 14](./button.md).

## ~~Issue 5: Eye/EyeSlash иконки имеют хардкоден class — нельзя перебить~~ ✅ resolved 2026-05-11

- **Категория:** B10 (hardcode)
- **Severity:** ~~medium~~
- **Где:** [Input.vue:96-102](../../lib/input/Input.vue#L96-L102), [Input.vue:255-266](../../lib/input/Input.vue#L255-L266)
- **Resolution:**
  1. Введён computed `classPasswordToggle = Input.setStyle([...defaults, options?.passwordToggleClass, props?.passwordToggleClass])`.
  2. В template `:class="classPasswordToggle"` на обеих иконках (`[data-eye-slash]` / `[data-eye]`).
  3. Default-цвет сменён с захардкоженного `text-cyan-500` на theme-токен `hover:text-theme-500 hover:dark:text-theme-700` (синхронно с border-токеном focused-input на L135 Input.vue).
  4. Добавлен `passwordToggleClass?: StyleClass` в `InputProps` и ключ `passwordToggleClass` в `InputOption` ([Input.d.ts](../../lib/input/Input.d.ts)).
  5. Покрыто 2 тестами (per-instance + global componentsOptions).

### Acceptance criteria

- [x] `<Input :password-toggle-class="'text-blue-500'">` перебивает дефолт.
- [x] `app.use(FishtVue, { componentsOptions: { Input: { passwordToggleClass: 'text-red-500' } } })` глобально применяется.

## ~~Issue 6: `arrayInputType` ограничен — нет `tel`, `url`, `search`~~ ✅ resolved 2026-05-11

- **Категория:** D25 (консистентность props), M54 (native form)
- **Severity:** ~~medium~~
- **Где:** [Input.vue:31-39](../../lib/input/Input.vue#L31-L39), [Input.vue:53-57](../../lib/input/Input.vue#L53-L57)
- **Resolution:**
  1. `arrayInputType` расширен до `["text", "number", "email", "password", "tel", "url", "search"]`.
  2. `type` computed обновлён: cast к `NonNullable<InputProps["type"]>` (без захардкоженного union).
  3. В `Input.d.ts` экспортирован тип `InputType` и используется в `BaseInputProps`.
  4. Покрыто `it.each(["tel", "url", "search"])` + regression на fallback `"text"` для невалидных значений.
- **Out of scope (deferred):** auto-set `type="tel"` при `mask="phone"` — отложено, требует tie-breaker между явным `type` и mask-inferred (`tel` мог быть нежелателен на desktop). Документирован как user-action в [components/input.md §5](../components/input.md#5-props).

### Acceptance criteria

- [x] `<Input type="tel" />` рендерит `<input type="tel">`.
- [x] `<Input type="invalid" />` fallback к `"text"`.

## ~~Issue 7: `mask: "phone"` не пробрасывает phoneFormats в Input~~ ✅ resolved 2026-05-11

- **Категория:** F32 (Date/number locale)
- **Severity:** ~~medium~~
- **Где:** [Input.vue:61](../../lib/input/Input.vue#L61), [Input.vue:178](../../lib/input/Input.vue#L178), [Input.vue:187](../../lib/input/Input.vue#L187), [lib/utils/numberHandler.ts:99](../../lib/utils/numberHandler.ts#L99)
- **Resolution:**
  - **Уточнение формулировки:** `convertToPhone` в [numberHandler.ts:33](../../lib/utils/numberHandler.ts#L33) уже поддерживала `ConvertToPhoneOptions.phoneFormats` с дефолтами `+1/+7/+81/+82/+86` — формулировка «hardcoded Russian» была устаревшей. Реальный gap — Input не пробрасывал formats.
  1. Расширена сигнатура `toPhone(e, options?: ConvertToPhoneOptions)` в [numberHandler.ts:99](../../lib/utils/numberHandler.ts#L99). Передаётся в `convertToPhone(value, options)` на L115.
  2. В Input.vue добавлен computed `phoneFormats = props?.phoneFormats ?? options?.phoneFormats` ([L61](../../lib/input/Input.vue#L61)).
  3. `toMask` ([L178](../../lib/input/Input.vue#L178)) и `inputEvent` ([L187](../../lib/input/Input.vue#L187)) передают `{ phoneFormats: phoneFormats.value }` в `convertToPhone`/`toPhone`.
  4. `InputProps.phoneFormats?: PhoneFormat[]` + ключ в `InputOption` ([Input.d.ts](../../lib/input/Input.d.ts)).
  5. Re-export `type { PhoneFormat }` из `fishtvue/input`.
  6. Покрыто 2 тестами (per-instance + global componentsOptions с UK маской `+44`).
- **Out of scope (deferred):** auto-binding `phoneFormats` к активной локали через `setActiveLocale` и подключение `libphonenumber-js` — отложено как отдельный issue (требует подключения peer-dep и расширения `lib/locale/`).

### Acceptance criteria

- [x] `<Input :phone-formats="[{ codeCountry: 44, mask: [4,3,3], codeCity: [] }]" mask-input="phone" />` форматирует UK-номера.
- [x] `componentsOptions.Input.phoneFormats` перебивает дефолт глобально.

## ~~Issue 8: Browser autocomplete конфликтует с password manager~~ ✅ resolved 2026-05-11

- **Категория:** M56 (Browser autocomplete)
- **Severity:** ~~medium~~
- **Где:** [Input.vue:42-50](../../lib/input/Input.vue#L42-L50), [Input.vue:68-73](../../lib/input/Input.vue#L68-L73)
- **Resolution:**
  1. Тип `autocomplete` расширен до `InputAutocomplete` (WHATWG autofill tokens + `string & {}`) в [Input.d.ts](../../lib/input/Input.d.ts).
  2. Добавлен `autocompleteDefaults` map в Input.vue ([L42-50](../../lib/input/Input.vue#L42-L50)): `password → "current-password"`, `email → "email"`, `tel → "tel"`, `url → "url"`, остальные → `"on"`.
  3. `autocomplete` computed теперь: `props.autocomplete ?? options.autocomplete ?? autocompleteDefaults[type]`.
  4. Добавлен `autocomplete` ключ в `InputOption` (componentsOptions.Input.autocomplete).
  5. Покрыто 6 тестами (5 авто-default + 1 на «явный prop wins»).
  6. Документировано в [components/input.md §5.1](../components/input.md#51-autocomplete-auto-defaults).

### Acceptance criteria

- [x] `<Input type="password" />` без autocomplete → renders `autocomplete="current-password"`.
- [x] `<Input type="password" autocomplete="new-password" />` корректно работает с менеджерами паролей.

## ~~Issue 9: Нет prefers-reduced-motion guard~~ ✅ resolved 2026-05-11

- **Категория:** E29.7
- **Severity:** ~~low~~
- **Где:** [Input.vue:87, 89](../../lib/input/Input.vue#L87-L89), [Input.vue:98](../../lib/input/Input.vue#L98)
- **Resolution:** Применён pattern из [done/button.md Issue 10](./done/button.md): `transition-all` → `motion-safe:transition-all`; `placeholder:transition-all` → `motion-safe:placeholder:transition-all`; eye-icon `transition` → `motion-safe:transition`. Tailwind transpилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`. Покрыто regression-тестом (`classBaseInput` содержит `motion-safe:transition-all`, не содержит unconditional `transition-all`).

### Acceptance criteria

- [x] `classBaseInput` использует `motion-safe:transition-all`, не unconditional.
- [ ] DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` — Input не показывает transition (manual).

## ~~Issue 10: `inputRef` exposed, но нет `focus()` метода с argless вариантом~~ ✅ resolved 2026-05-11

- **Категория:** G34 / D24
- **Severity:** ~~low~~
- **Где:** [Input.vue:210-220](../../lib/input/Input.vue#L210-L220)
- **Resolution:** `focus(eventOrOptions?: FocusEvent | FocusOptions)` — три формы:
  1. `focus()` — argless programmatic (паритет с `HTMLElement.focus()`).
  2. `focus({ preventScroll: true })` — programmatic с native `FocusOptions`.
  3. `focus(focusEvent)` — template handler (эмитит `"focus"`).

  В `InputExpose` ([Input.d.ts](../../lib/input/Input.d.ts)) сигнатура также обновлена. Паритет с `Button.focus()` ([done/button.md Issue 4](./done/button.md)). Покрыто 3 тестами (argless / FocusEvent / FocusOptions).
- **Cross-cutting (deferred):** Aria/Select/TextEditor имеют ту же проблему — оставлены открытыми в [aria.md](./aria.md), [select.md](./select.md), [texteditor.md](./texteditor.md) (вне scope Input-ТЗ).

### Acceptance criteria

- [x] `useTemplateRef<typeof Input>("i").value?.focus()` без аргументов фокусирует input.
- [x] `useTemplateRef.value?.focus({ preventScroll: true })` пробрасывает options в native focus.

## ~~Issue 11: print styles отсутствуют~~ ✅ resolved 2026-05-11

- **Категория:** N59
- **Severity:** ~~low~~
- **Где:** [Input.vue:90](../../lib/input/Input.vue#L90)
- **Resolution:** Добавлены `print:border print:border-black print:bg-white print:text-black print:shadow-none` в `classBaseInput`. Покрыто regression-тестом `classBaseInput.toMatch(/print:/)`.
- **Cross-cutting:** Wave-level @media print pattern для остальных компонентов отслеживается через [button.md Issue 15](./button.md).

## ~~Issue 12: RTL — `caret-theme-500`, padding hardcode~~ ✅ resolved 2026-05-11

- **Категория:** F31
- **Severity:** ~~medium~~
- **Где:** [Input.vue](../../lib/input/Input.vue), test [Input.test.ts](../../lib/input/Input.test.ts) (Issue 12 RTL eye-icon toggle).
- **Resolution:** Добавлен regression-тест: mount внутри `dir="rtl"` контейнера, click `[data-eye-slash]`, assert переключения type `password → text`. Layout не ломается — иконки остаются кликабельными благодаря тому, что они находятся в `<template #after>` (логический порядок), а позиционирование делегировано `InputLayout`'у через flex-направление (без hardcoded `left/right` padding).
- **Note:** `caret-theme-500` — design-token, корректно работает в обоих направлениях. Иконки в RTL визуально смещаются к левому краю — это **правильное** поведение для logical-positioning.

## ~~Issue 13: Дубликат семантики `update:modelValue` + `change:modelValue` + `update:isInvalid`~~ ✅ resolved 2026-05-11 (docs-only)

- **Категория:** D26
- **Severity:** ~~medium~~
- **Где:** [Input.vue:193-201](../../lib/input/Input.vue#L193-L201)
- **Resolution (docs-only — без breaking changes в API):**
  1. Timing явно расписан в [components/input.md §6.1](../components/input.md#61-timing--кто-за-чем-эмитится) с порядковым перечислением.
  2. Поведение `update:isInvalid(false)` как **reset-сигнал** объяснено в [§6.2](../components/input.md#62-почему-updateisinvalid-всегда-false): Input сам не валидирует, `true` ставит родитель/Form через `isInvalid` prop. Записано в API inconsistencies в [§18](../components/input.md#18-known-issues--limitations).
  3. Разница между `update:modelValue` и `change:modelValue` (когда что использовать) в [§6.3](../components/input.md#63-когда-нужен-changemodelvalue-vs-updatemodelvalue).
- **Out of scope (deferred):** переименование `update:isInvalid` → `reset:invalid` и удаление `change:modelValue` — breaking changes, требуют отдельного RFC и cross-cutting consideration (TextEditor/Select имеют тот же паттерн).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                                                       |
| ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.Input` | ✅          | mode/clear/class/classInput/**passwordToggleClass**/**phoneFormats**/**autocomplete** (расширено 2026-05-11)      |
| `componentsStyle` global  | ✅          | Issue 2 closed — fallback chain `props ?? options ?? Input.componentsStyle() ?? "outlined"`                       |
| `unstyled: true`          | ❌          | Issue 4 — cross-cutting Wave 3.1                                                                                  |
| Theme tokens vs hardcode  | ✅          | caret-theme-500, hover:text-theme-500/700 — все design-tokens (cyan-_ удалён)                                     |
| Runtime theme switch      | ⚠️          | theme-tokens OK, остальное — Tailwind (Wave 3.3)                                                                  |
| `t()` для текста          | N/A         | placeholder/label — пользовательские                                                                              |
| Runtime locale switch     | ⚠️          | `phoneFormats` per-instance/option работает; auto-binding к locale — deferred (см. Issue 7 deferred-section)      |
| Fallback на defaultLocale | N/A         | —                                                                                                                 |

## Dual-API gap

Не применимо — Input не collection-component.
