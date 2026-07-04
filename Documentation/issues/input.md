---
title: Issues — Input
summary: Аудит Input. Все 15/15 issues закрыты. 11 закрыты 2026-05-11 (initStyle dedup, componentsStyle fallback, password-toggle override, extended types, phoneFormats prop/option, autocomplete defaults, motion-safe, argless focus, print styles, RTL test, emit semantics docs). 2 cross-cutting закрыты 2026-06-13 (doc-sync к Wave 2.1/3.1 — packaging `sideEffects`+`exports` map и `unstyled` guard уже в каноне; добавлен Input-scoped unstyled regression-тест). Issue 14 закрыт 2026-06-13 (вспышка один кадр при mount/фокусе — широкий `motion-safe:transition-all` на инпуте → узкий `motion-safe:transition-colors`; пересмотрен acceptance Issue 9, E29.7 сохранён). Issue 15 закрыт 2026-07-04 (B10 hardcode — `text-gray-900`/`dark:text-gray-100`, `focus:placeholder:text-gray-400`/`focus:placeholder:dark:text-gray-500` и база `text-gray-400`/`dark:text-gray-600` password-toggle иконки мигрированы на новый semantic-токен `surface`, та же числовая шкала).
updated: 2026-07-04
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/input/
related-doc: ../components/input.md
---

# Issues — Input

## Сводка

| Severity | Count (open) | Categories          |
| -------- | ------------ | ------------------- |
| critical | 0            | —                   |
| high     | 0            | — (все закрыты)     |
| medium   | 0            | — (все закрыты)     |
| low      | 0            | — (все закрыты)     |

Закрытые 2026-05-11: Issues 1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13 (4 high + 5 medium + 3 low). Закрытые 2026-06-13: Issues 3, 4 (2 cross-cutting high — doc-sync к Wave 2.1 / 3.1, фиксы уже в каноне) + Issue 14 (1 low — outline-flash при фокусе). Закрытые 2026-07-04: Issue 15 (1 medium — B10 hardcode gray-\* → surface-\*, doc-gap: не был занумерован при первом аудите).

> **Файл остаётся active** (не перенесён в `./done/`) — зеркало Pagination/Form/Split: все numbered issues закрыты (0/0/0/0), но сохраняются deferred cross-cutting вне матрицы: runtime theme switch (Wave 3.3) и locale auto-binding `phoneFormats` (см. Issue 7 deferred + Configuration support ниже).

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

## ~~Issue 3: Нет sideEffects/exports map (cross-cutting)~~ ✅ resolved 2026-06-13 (doc-sync)

- **Категория:** A2, A4, A5
- **Severity:** ~~high~~
- **Где:** [lib/package.json:19](../../lib/package.json#L19), [lib/rollup.config.js (`buildRootExports()`)](../../lib/rollup.config.js)
- **Resolution (cross-cutting, фиксы уже в каноне):**
  1. **`sideEffects` (A2)** — `"sideEffects": false` на root `lib/package.json` (✅ 2026-06-07) + инъекция в каждый `dist/{name}/package.json` через `copyDependencies()`. Выбран `false`, **а не** изначально предложенный `["**/*.css","**/*.vue"]`: в опубликованном пакете нет `.vue`/`.css` (SFC скомпилированы в `.mjs`, CSS инжектится в рантайме через lifecycle, не на import-time), поэтому модули чисты на import. Обоснование — [button.md Issue 8](./button.md).
  2. **ESM-only + `engines` (A4)** — `"engines": { "node": ">=18" }`; CJS осознанно не включается (аудитория — bundler-based Vue/Nuxt). См. [button.md Issue 9](./button.md).
  3. **`exports` map (A5)** — корневая карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) (✅ 2026-06-11, Issue 5c-b): явный entry на каждый emitted `.mjs` + extensionless субпуть + bare-dir из вложенного `package.json` (обходит lowercase-`.mjs`/PascalCase-`.d.ts` асимметрию) + `./*/package.json`. `fishtvue/input` входит в strict-superset.
  4. Контракт манифеста зафиксирован [lib/package.test.ts](../../lib/package.test.ts). Input-specific правок не потребовалось — наследуется от cross-cutting Wave 2.1.

См. [button.md Issue 8 и Issue 9](./button.md), [issues/README.md Wave 2.1](./README.md).

## ~~Issue 4: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-06-13

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [Component.setStyle() guard — component/index.ts:138](../../lib/component/index.ts#L138)
- **Resolution (cross-cutting guard уже в каноне 2026-05-11; Input regression-тест 2026-06-13):** Guard `if (this.__globalConfig?.config?.unstyled) return ""` стоит первой строкой `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138)) — одна правка отключает Tailwind-классы во ВСЕХ 22 компонентах (см. [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md)). Input наследует автоматически: `classBaseInput` = `Input.setStyle([...])` → `""` при `unstyled: true`, корневой `<input>` рендерится без базовых классов и `fv {prefix}-input`-префикса. Добавлен Input-scoped regression-тест в [Input.test.ts](../../lib/input/Input.test.ts) (describe `Issue 4 — unstyled`): `app.use(FishtVue, { unstyled: true })` → `classBaseInput` пуст; контраст с `unstyled: false` → `caret-theme-500` присутствует; `resetGlobalFishtVue()` чистит `window.FishtVue` singleton-leak.

### Acceptance criteria

- [x] `app.use(FishtVue, { unstyled: true })` + `<Input />` — `classBaseInput === ""`, root `<input>` без базовых классов.
- [x] `unstyled: false` — базовые классы (`caret-theme-500`) присутствуют.

См. [button.md Issue 14](./button.md), [component-class.md Issue 6](./component-class.md), [issues/README.md Wave 3.1](./README.md).

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

## ~~Issue 14: вспышка один кадр при mount и фокусе (broad `transition-all` на инпуте)~~ ✅ resolved 2026-06-13

- **Категория:** C18 (visual / motion)
- **Severity:** ~~low~~
- **Где:** [Input.vue:89](../../lib/input/Input.vue#L89)
- **Симптом:** на `input[data-input]` один кадр мелькала граница/outline — и при фокусе, и при mount/перезагрузке.
- **Причина:** широкий `motion-safe:transition-all` в `classBaseInput`. Обёртка `InputLayout` гейтит свой `transition-all` через `isTick` (включается через `setTimeout 100ms` после mount — [InputLayout.vue:67-73](../../lib/inputlayout/InputLayout.vue#L67-L73), [:223](../../lib/inputlayout/InputLayout.vue#L223)), а у самого инпута такого гейта **не было**. Поэтому `transition-all` анимировал geometry/outline один кадр: (1) при mount — когда стили инжектятся в `onMounted` (`Component.__hooks()`), свойства анимируются из UA-дефолта в стилизованное состояние; (2) при фокусе — `outline-width` UA-initial → `focus:outline-0`. У `Aria.vue:67` тот же набор классов, но **без** `transition-all` — там дефекта нет.
- **Resolution:** широкий `motion-safe:transition-all` → узкий `motion-safe:transition-colors` ([Input.vue:89](../../lib/input/Input.vue#L89)). `transition-colors` покрывает только `color/background-color/border-color/...` — **не** `outline` и не geometry → анимировать на mount/фокусе нечего (поле пустое, фон `bg-transparent`, `border-0`). Переход остаётся `motion-safe:`-gated → **E29.7 не нарушен** (см. Issue 9). `outline` возвращён к исходному `focus:outline-0` (без transition он применяется мгновенно, вспышки нет); видимый focus-индикатор обеспечивает `ring-2 ring-theme-600` обёртки `InputLayout` (a11y не затронут).
- **Связь с Issue 9:** acceptance Issue 9 (motion-safe transitions) пересмотрен — тест `Issue 9 — motion-safe transitions` теперь требует `motion-safe:transition-colors` (узкий) и **запрещает** `transition-all`. Requirement E29.7 (reduced-motion) выполняется по-прежнему.
- **Verified:** browser-preview — `getComputedStyle(input).transitionProperty` = color-список (не `all`), outline вне transition-набора; `pnpm typecheck` + Input suite (43) зелёные.

## ~~Issue 15: Хардкоженные `gray-*` classes вместо semantic-токена~~ ✅ resolved 2026-07-04

- **Категория:** B10 (hardcode)
- **Severity:** ~~medium~~
- **Где:** [Input.vue:85-86](../../lib/input/Input.vue#L85-L86) (`classBaseInput`), [Input.vue:98](../../lib/input/Input.vue#L98) (`classPasswordToggle`)
- **Симптом:** `classBaseInput` использовал захардкоженные Tailwind color-primitive классы `text-gray-900`/`dark:text-gray-100` (цвет текста инпута) и `focus:placeholder:text-gray-400`/`focus:placeholder:dark:text-gray-500` (placeholder в фокусе) вместо design-token'а библиотеки. `classPasswordToggle` имел базовый цвет иконки `text-gray-400 dark:text-gray-600` (hover-часть `hover:text-theme-500 hover:dark:text-theme-700` уже была theme-token'ом, см. Issue 5). Проблема ранее не была занумерована как отдельный issue при аудите 2026-05-11 — doc-gap, только `Eye/EyeSlash`-хардкод (cyan) был описан в Issue 5.
- **Resolution:**
  1. Добавлен semantic-цвет `surface` (23-й именованный цвет, дефолт — точная копия шкалы `gray`) в [lib/theme/primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317) и в union `namesColors` в [lib/theme/Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187) — инфраструктура engine'а (вне scope этого issue, сделана отдельно).
  2. `text-gray-900 dark:text-gray-100` → `text-surface-900 dark:text-surface-100` в `classBaseInput` ([Input.vue:85](../../lib/input/Input.vue#L85)).
  3. `focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-500` → `focus:placeholder:text-surface-400 focus:placeholder:dark:text-surface-500` ([Input.vue:86](../../lib/input/Input.vue#L86)).
  4. `text-gray-400 dark:text-gray-600` → `text-surface-400 dark:text-surface-600` в `classPasswordToggle` ([Input.vue:98](../../lib/input/Input.vue#L98)); `hover:text-theme-500 hover:dark:text-theme-700` оставлен нетронутым (уже theme-token из Issue 5).
  5. Family rename, **не** value change — числовая тональность (900/100/400/500/600) идентична, поскольку `surface` дефолтится в точную копию `gray`-шкалы. Визуальной регрессии из коробки нет; библиотека получает точку расширения через `updateSurfacePalette()`.
  6. Покрыто 3 regression-тестами в [Input.test.ts](../../lib/input/Input.test.ts) (describe `Issue 15 — B10 hardcode: gray-* → surface-* (design-token migration)`): `classBaseInput` содержит `text-surface-900`/`dark:text-surface-100` и не содержит `text-gray-900`/`dark:text-gray-100`; `classBaseInput` содержит `focus:placeholder:text-surface-400`/`focus:placeholder:dark:text-surface-500` и не содержит gray-варианты; `classPasswordToggle` содержит `text-surface-400`/`dark:text-surface-600` + сохранённый `hover:text-theme-500`/`hover:dark:text-theme-700`, не содержит `text-gray-400`/`dark:text-gray-600`.
- **Note:** не путать с Issue 5 — там резолвился хардкоженный **cyan** цвет иконки (заменён на theme-token `hover:text-theme-500`), закрыт 2026-05-11. Этот issue — про структурный **gray**-хардкод (текст инпута + placeholder + база иконки), закрыт отдельно 2026-07-04 после появления `surface` в engine'е.

### Acceptance criteria

- [x] `classBaseInput` не содержит `text-gray-900`/`dark:text-gray-100`/`focus:placeholder:text-gray-400`/`focus:placeholder:dark:text-gray-500` — заменены на `surface-*` с той же тональностью.
- [x] `classPasswordToggle` не содержит базовый `text-gray-400`/`dark:text-gray-600` — заменён на `surface-*`; `hover:text-theme-500`/`hover:dark:text-theme-700` сохранён без изменений.
- [x] `pnpm typecheck` — без ошибок.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                                                       |
| ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.Input` | ✅          | mode/clear/class/classInput/**passwordToggleClass**/**phoneFormats**/**autocomplete** (расширено 2026-05-11)      |
| `componentsStyle` global  | ✅          | Issue 2 closed — fallback chain `props ?? options ?? Input.componentsStyle() ?? "outlined"`                       |
| `unstyled: true`          | ✅          | Issue 4 closed 2026-06-13 — guard `Component.setStyle()` ([index.ts:138](../../lib/component/index.ts#L138)) возвращает `""`; Input наследует cross-cutting Wave 3.1 |
| Theme tokens vs hardcode  | ✅          | caret-theme-500, hover:text-theme-500/700 — все design-tokens (cyan-\* удалён Issue 5); text/placeholder gray-\* → surface-\* (Issue 15, 2026-07-04) |
| Runtime theme switch      | ⚠️          | theme-tokens OK, остальное — Tailwind (Wave 3.3)                                                                  |
| `t()` для текста          | N/A         | placeholder/label — пользовательские                                                                              |
| Runtime locale switch     | ⚠️          | `phoneFormats` per-instance/option работает; auto-binding к locale — deferred (см. Issue 7 deferred-section)      |
| Fallback на defaultLocale | N/A         | —                                                                                                                 |

## Dual-API gap

Не применимо — Input не collection-component.
