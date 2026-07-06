---
title: Issues — Calendar
summary: 7/11 issues закрыты — memory leaks (MutationObserver disconnect + keydown cleanup), componentsStyle fallback, locale propagation, Wave 2.3 dup initStyle, + Wave 2.1 packaging (Issue 2 v-calendar → optional peer + lazy, Issue 3 vue → peer) + Wave 5 floating-ui (Issue 9, inherited от FixWindow) + B10 color-часть Issue 10 (hardcoded gray-*/stone-*/slate-* → semantic surface-* tokens) + Issue 11 (visibleDate stale-sync race с lazy-loaded v-calendar, CI-only flaky, PR #48). Открытые — SSR-packaging cross-cutting (Issue 4), dual-API (5), unstyled (7, framework-level), Issue 10 остаток (E29.7/N59/F31 — print/RTL/motion, cross-cutting).
updated: 2026-07-06
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/calendar/
related-doc: ../components/calendar.md
---

# Issues — Calendar

## Сводка

| Severity | Count (open) | Categories |
|---|---|---|
| critical | 0 | — |
| high | 3 | A2, A4-5 (packaging — Issue 4), C17 (SSR), L53 (unstyled — framework-level), P (dual-API) |
| medium | 2 | F31, G34 |
| low | 2 | E29.7, N59 |

## ~~Issue 1: CRITICAL — MutationObserver на documentElement не disconnect'ится при unmount~~ ✅ resolved 2026-05-11

- **Категория:** H41 (memory leaks)
- **Severity:** ~~**critical**~~
- **Где (was):** ~~[Calendar.vue:315-328]~~ → теперь [Calendar.vue:98-99, 258-265, 331-345](../../lib/calendar/Calendar.vue#L98-L99) — observer хранится в setup-scoped `let darkObserver`, cleanup в `onBeforeUnmount`.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- `const observer = new MutationObserver(...)` в `initDarkModeObserver()` → `darkObserver = new MutationObserver(...)` (присваивание setup-scoped `let darkObserver: MutationObserver | undefined`). См. [Calendar.vue:99](../../lib/calendar/Calendar.vue#L99) + [Calendar.vue:338](../../lib/calendar/Calendar.vue#L338).
- `onBeforeUnmount(() => { darkObserver?.disconnect(); document.removeEventListener("keydown", ...) × 2 })` добавлен после `onMounted`. См. [Calendar.vue:258-265](../../lib/calendar/Calendar.vue#L258-L265). SSR-guard `if (isClient())` обернут вокруг `removeEventListener`.
- Зеркалит [Select fix Issue 2](./select.md#issue-2-cleanup-2026-05-11) — тот же паттерн `let observer + onBeforeUnmount`.
- Бонус (Wave 2.3): `Calendar.initStyle()` удалён из `onMounted` ([Calendar.vue:248-256](../../lib/calendar/Calendar.vue#L248-L256)) — `Component.__hooks()` уже регистрирует его в конструкторе ([component/index.ts:79-84](../../lib/component/index.ts#L79-L84)).

**Acceptance criteria:**

- [x] Listener-sniff тест: после unmount — `document.removeEventListener("keydown", ...)` вызван. Тест: `Calendar.test.ts` > `removes keydown listeners on unmount-while-open`.
- [x] Observer disconnect тест: после unmount — `MutationObserver.disconnect` вызван. Тест: `Calendar.test.ts` > `disconnects MutationObserver on unmount`.
- [ ] (Optional, manual) Профилирование памяти: mount/unmount Calendar 100× — heap не растёт. Не автоматизировано в unit-тестах.

### Историческая запись (что было)

```ts
function initDarkModeObserver() {
  const selector = FishtV?.config.optionsTheme?.darkModeSelector ?? ""
  if (!selector || !isClient()) return

  const checkDarkMode = () => (isDark.value = !!document.querySelector(selector))
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true
  })
}
```

`observer` — local переменная. После выхода из функции — недоступен → невозможно disconnect. **Memory leak**. Также: `document.addEventListener("keydown", keydownCalendar)` и `openCalendarOnEnter` — без `onBeforeUnmount` cleanup.

`document.documentElement` глобальный — каждая Calendar-инстанция добавляла MutationObserver на root. При navigate-away — Calendar unmount, но observer продолжал работать. Усугублялось в SPA с динамическими view'ами (table-rows, modal-pickers).

> **Future direction (не входит в этот fix):** вынести dark-mode detection в shared composable `useDarkMode()` (singleton — ОДИН observer на app). См. [VueUse useDark](https://vueuse.org/core/useDark/). Текущий fix решает leak, но каждая Calendar-инстанция всё ещё держит свой observer.

## ~~Issue 2: v-calendar dependency может конфликтовать с пользовательской версией~~ ✅ resolved 2026-06-19 (Wave 2.1)

> **Status:** ✅ resolved 2026-06-19 (Wave 2.1). `v-calendar` переведён из `dependencies` в **optional `peerDependencies` (`^3.0.0`)** + lazy-загрузка в Calendar. Дубль Vue plugin'а исключён (потребитель ставит свою версию), bundle без Calendar не тянет v-calendar.

**Что сделано (2026-06-19):**

- [lib/package.json](../../lib/package.json) — `v-calendar` убран из `dependencies`, добавлен в `peerDependencies` + `peerDependenciesMeta: { "v-calendar": { optional: true } }`.
- [Calendar.vue](../../lib/calendar/Calendar.vue) — `DatePicker` грузится lazy: `const DatePicker = ref()` + `DatePicker.value = (await import("v-calendar")).DatePicker` в `onMounted` (ref-based, чтобы template-ref `calendarPicker` указывал на реальный инстанс — Calendar читает его `inputValue`/`dateParts`; `defineAsyncComponent` отдал бы async-wrapper). CSS — lazy `import("v-calendar/style.css")` там же (client-only → SSR-safe). Шаблон — `<component :is="DatePicker" v-if="DatePicker …">`. Без peer редактор просто не рендерится.
- Контракт — [lib/package.test.ts](../../lib/package.test.ts) (`v-calendar` — optional peer, не в `dependencies`); lazy-загрузка — source-scan в [Calendar.test.ts](../../lib/calendar/Calendar.test.ts).

**Acceptance criteria:**

- [x] `pnpm install fishtvue` без явной установки v-calendar — Calendar-импорт пакета не падает (optional peer; чанк грузится только при использовании Calendar).
- [x] При установке v-calendar потребителем — нет дубля (одна копия из node_modules приложения).

### Историческая запись (что было)

```json
"dependencies": { ..., "v-calendar": "^3.1.2" }
```

`v-calendar` находился в `dependencies` (не peer) + импортировался eager (`import { DatePicker } from "v-calendar"`). Если потребитель использовал свою версию v-calendar — npm мог установить две копии (два Vue plugin'а → конфликт `<DatePicker>`). Bundle inflation — каждая копия ~50kb.

- **Категория:** ~~A3 (дубли библиотеки), I44 (peer)~~ — закрыто
- **Severity:** ~~high~~
- **Где (was):** [lib/package.json:55](../../lib/package.json#L55)

### Что найдено

```json
"v-calendar": "^3.1.2"
```

`v-calendar` находится в `dependencies` (не в peer). Если потребитель уже использует v-calendar 4.x — npm установит обе версии (две копии Vue plugin'а). Кроме того, v-calendar тянет date-fns (тоже в lib's dependencies).

### Почему это проблема

- Дублированный Vue plugin (v-calendar register'ит global components) → конфликт `<DatePicker>` symbol.
- Bundle inflation — каждая копия ~50kb.
- Cross-cutting issue: lodash-es, date-fns, gsap, quill — все в `dependencies` lib/, должны быть optional peer.

### Что нужно сделать

1. Перевести `v-calendar`, `@vueup/vue-quill`, `quill` в `peerDependencies` с `peerDependenciesMeta.optional: true`.
2. В [lib/package.json](../../lib/package.json):
   ```json
   "peerDependencies": {
     "vue": "^3.5.0",
     "v-calendar": "^3.0.0",
     "@vueup/vue-quill": "^1.2.0",
     "quill": "^2.0.0"
   },
   "peerDependenciesMeta": {
     "v-calendar": { "optional": true },
     "@vueup/vue-quill": { "optional": true },
     "quill": { "optional": true }
   }
   ```
3. Документировать в [02-installation.md](../02-installation.md): «при использовании Calendar — установите v-calendar».
4. Lazy-import: `defineAsyncComponent(() => import("v-calendar"))` внутри Calendar.vue — bundle размер для не-Calendar потребителей становится меньше.

### Acceptance criteria

- [ ] `pnpm install fishtvue` без явной установки v-calendar — Calendar TypeScript-import не падает (optional peer).
- [ ] При установке v-calendar 4.x потребителем + fishtvue — нет дубля.

## ~~Issue 3: Vue в dependencies — duplicate Vue в потребителе~~ ✅ resolved 2026-06-19 (Wave 2.1)

> **Status:** ✅ resolved 2026-06-19 (Wave 2.1). `vue` перенесён из `dependencies` в **required `peerDependencies` (`^3.5.0`)**. Vue приложения — единственный runtime; дубль исключён.

**Что сделано (2026-06-19):**

- [lib/package.json](../../lib/package.json) — `vue` убран из `dependencies`, добавлен в `peerDependencies: { "vue": "^3.5.0" }` (НЕ optional — обязателен). В rollup vue уже был external — build не изменился, это чисто packaging.
- Контракт — [lib/package.test.ts](../../lib/package.test.ts): `vue` не в `dependencies`, в `peerDependencies` (`^3.5`), не optional.

### Что найдено (was)

```json
"dependencies": { ..., "vue": "^3.5.11" }
```

Vue должен быть `peerDependency`, иначе npm мог установить вторую копию Vue для fishtvue → два разных Vue runtime → reactive-контексты не работают, plugins дублируются.

- **Категория:** ~~A3 (дубль Vue)~~ — закрыто
- **Severity:** ~~high~~
- **Где (was):** [lib/package.json:56](../../lib/package.json#L56)

### Acceptance criteria

- [x] `npm ls vue` в Nuxt-проекте + fishtvue — одна копия Vue (vue резолвится из приложения).

## Issue 4: SSR styles + cross-cutting (sideEffects, exports map)

> **Status:** deferred — cross-cutting SSR-фикс, см. [button.md Issue 1, 8, 9](./button.md).

- **Категория:** C17, A2, A4, A5
- **Severity:** high

## Issue 5: Нет dual-API — компонент только schema-driven через `datePickerOptions`

> **Status:** deferred (redesign, not quick fix — спец сама фиксирует это как future direction).

- **Категория:** P (Dual-API)
- **Severity:** medium
- **Где:** [Calendar.d.ts](../../lib/calendar/Calendar.d.ts) (datePickerOptions structure)

### Что найдено

Все настройки через единый prop `datePickerOptions: { mode, isRange, ... }`. Нет compound API типа:

```vue
<Calendar v-model="date">
  <CalendarRange start="2026-01-01" end="2026-12-31" />
  <CalendarDisabled :dates="holidays" />
</Calendar>
```

### Почему это проблема

- v-calendar internal — uses scoped slot для custom day cell rendering. Этот power lost в FishtVue wrapper.
- Compound API позволил бы выразить per-day overrides (badge, tooltip, custom render) без передачи функций в schema.

### Что нужно сделать

1. Это redesign, не quick fix. Документировать gap в [Documentation/components/calendar.md](../components/calendar.md) §17 как future direction.
2. Минимально — пробросить v-calendar slot `day-content` через FishtVue Calendar slot.

### Acceptance criteria

- [ ] (Optional) `<Calendar><template #day="{ day }">...</template></Calendar>` пробрасывается в v-calendar.

## ~~Issue 6: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-11

- **Категория:** L53
- **Severity:** ~~high~~
- **Где (was):** ~~[Calendar.vue:102]~~ → теперь [Calendar.vue:106-108](../../lib/calendar/Calendar.vue#L106-L108)
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

```ts
const mode = computed<NonNullable<CalendarProps["mode"]>>(
  () => props.mode ?? options?.mode ?? Calendar.componentsStyle() ?? "outlined"
)
```

Зеркалит [input.md Issue 2](./input.md) и [select.md Issue 5](./select.md) — тот же fallback chain `props → options → componentsStyle → "outlined"`.

**Acceptance criteria:**

- [x] `app.use(FishtVue, { componentsStyle: "filled" })` → Calendar без `mode` prop рендерится в `filled` mode. Тест: `Calendar.test.ts` > `falls back to global componentsStyle when props.mode not provided`.
- [x] `prop.mode` побеждает над глобальным componentsStyle. Тест: `prop.mode wins over global componentsStyle`.
- [x] Без plugin'а — `mode` падает на `"outlined"`. Тест: `falls back to "outlined" when nothing is set`.

## Issue 7: `unstyled: true` не обрабатывается

> **Status:** ✅ framework-level resolved — `Component.setStyle()` уже гейтит на `__globalConfig.config.unstyled` ([component/index.ts:138](../../lib/component/index.ts#L138)) cross-cutting фиксом. Calendar-controlled классы (через `Calendar.setStyle([...])`) отключаются автоматически. Внешние v-calendar intrinsic классы (`vc-primary`) — не наша поверхность.

- **Категория:** L53
- **Severity:** ~~high~~

См. [button.md Issue 14](./button.md).

## ~~Issue 8: Locale для дат — не использует FishtVue locale~~ ✅ resolved 2026-05-11

- **Категория:** F32
- **Severity:** ~~medium~~
- **Где (was):** ~~[Calendar.vue]~~ → теперь [Calendar.vue:102-105, 378, 391](../../lib/calendar/Calendar.vue#L102-L105)
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

```ts
const locale = computed<NonNullable<IParamsDatePicker["locale"]>>(
  () => props.paramsDatePicker?.locale ?? options?.paramsDatePicker?.locale ?? FishtV?.getActiveLocale() ?? "en"
)
```

Priority: `props.paramsDatePicker.locale > options.paramsDatePicker.locale > FishtV.getActiveLocale() > "en"`. В обе `<DatePicker>` инстанции добавлен `:locale="locale"`; `locale` исключён из `v-bind="fieldsOmit(datePickerOptions, ['isRange', 'locale'])"` чтобы избежать двойного binding'а.

**Acceptance criteria:**

- [x] `app.use(FishtVue, { locale: { activeLocale: "ru" } })` → DatePicker получил `:locale="ru"`. Тест: `Calendar.test.ts` > `passes FishtVue active locale to DatePicker`.
- [x] `paramsDatePicker: { locale: "en" }` (consumer override) — `:locale="en"` wins. Тест: `paramsDatePicker.locale (consumer override) wins over active locale`.

> **NB:** `setActiveLocale("ru")` после mount — reactivity работает через `computed`, но v-calendar internally rebuilds month-data только при mount. Если runtime-switch нужен — pass `:key="locale"` to force remount (не делаем в этом фиксе — потребитель сам решает).

## ~~Issue 9: Floating positioning — не реагирует на window resize / scroll-parent~~ ✅ resolved 2026-07-02 (inherited)

- **Категория:** H39 (Floating UI / scroll/resize)
- **Severity:** ~~medium~~
- **Где:** [Calendar.vue](../../lib/calendar/Calendar.vue) (через FixWindow)

Picker открывается через `<FixWindow v-bind="paramsFixWindow">`. См. [done/fixwindow.md Issue 2](./done/fixwindow.md).

> ✅ **resolved 2026-07-02** — наследуется от FixWindow: тот же кластер, что [menu.md Issue 8](./menu.md) и
> [table.md Issue 10](./table.md) (оба закрыты 2026-06-06/2026-06-11 с идентичной формулировкой; table.md
> Issue 10 уже явно ссылался вперёд на «см. calendar.md Issue 9» — этот пункт был последним неподхваченным
> straggler'ом кластера). FixWindow имеет собственный dependency-free движок позиционирования (`useFloating`
> + `autoUpdate` + `flip`/`shift`; с 2026-06-14 без `@floating-ui/vue`). Scroll-parent repositioning не требует
> отдельного кода в Calendar — [`getScrollParents()`](../../lib/fixwindow/useFloating.ts#L279) безусловно
> обходит все scroll-родители и `reference`, и `floating` элементов, независимо от `scrollableEl` prop.
> Отдельного кода в Calendar не требуется.

## Issue 10: prefers-reduced-motion, print, colors hardcode, RTL

> **Status:** частично deferred — cross-cutting (затрагивает все 22 компонента). См. [button.md](./button.md), [switch.md](./switch.md). **B10 — resolved 2026-07-04** (см. подраздел ниже), остаётся **только** E29.7/N59/F31.

- **Категория:** E29.7, N59, F31
- **Severity:** low

### ~~B10 — hardcoded gray-*/stone-*/slate-* → semantic surface-* tokens~~ ✅ resolved 2026-07-04

- **Где (was):** [Calendar.vue:172, 175, 183, 185, 187, 195, 392, 396](../../lib/calendar/Calendar.vue#L172) — структурные классы `classDateText`, `classPicker`, `classPlaceholder` + inline separator-иконки в шаблоне.
- **Что сделано:** все hardcoded `gray-*`/`stone-*`/`slate-*` классы FishtVue-обёртки заменены на `surface-*` того же числового tone (family rename, не value change) — новый именованный цвет `surface` в [lib/theme/primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317) (дефолт = точная копия `gray`), тип в [lib/theme/Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187). Мигрировано: `text-gray-900`/`dark:text-gray-100` + `placeholder:text-gray-400`/`placeholder:dark:text-gray-600` (date text/placeholder), `border-gray-300`/`dark:border-gray-600` (outlined border), `border-gray-300`/`dark:border-gray-700` (underlined border), `bg-stone-100`/`dark:bg-stone-900` (filled background), `bg-stone-50`/`dark:bg-stone-950` (underlined background), `text-gray-400`/`dark:text-gray-600` (placeholder icon), `text-slate-500`/`dark:text-slate-500` (disabled state — несколько мест), `text-gray-400`/`dark:text-gray-400` и `text-gray-600`/`dark:text-gray-400` (separator icons, conditional). v-calendar's own internal theming (`--vc-accent-*`, `vc-primary` — [Calendar.vue:475-486](../../lib/calendar/Calendar.vue#L475-L486)) **не тронуто** — это отдельная, несвязанная с FishtVue theme палитра v-calendar.
- **Тесты:** [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) — обновлён блок «Calendar Component - Mode Variants» (ожидает `surface-*` вместо `gray-*`/`stone-*`) + новый блок «B10 — semantic surface-* tokens (2026-07-04)» (4 кейса: source-scan на отсутствие `gray-*`/`stone-*`/`slate-*`/`zinc-*`/`neutral-*`, source-scan на присутствие всех мигрированных `surface-*`, DOM-assertion по режимам, control-check что `--vc-accent-*`/`vc-primary` не тронуты).

### Acceptance criteria (B10)

- [x] Нет `gray-*`/`stone-*`/`slate-*`/`zinc-*`/`neutral-*` классов FishtVue-обёртки в [Calendar.vue](../../lib/calendar/Calendar.vue).
- [x] `surface-*` классы того же числового tone рендерятся для каждого `mode` (`outlined`/`filled`/`underlined`) и для disabled/separator состояний.
- [x] v-calendar's own `--vc-accent-*`/`vc-primary` theming не изменено.

## ~~Issue 11: visibleDate навсегда остаётся пустым — stale-sync race с lazy-loaded v-calendar~~ ✅ resolved 2026-07-06

- **Категория:** вне 60-точечного чек-листа — data correctness / reactive stale-sync race между родителем и lazy-loaded async-child
- **Severity:** ~~high~~ (не крашит, но показывает пустую/устаревшую дату конечному пользователю на медленном устройстве/сети)
- **Где (was):** [Calendar.vue:281-294](../../lib/calendar/Calendar.vue#L281) (`watch(calendarPicker, ..., {deep:true})` + guard `visibleDate.value == null`)
- **Status:** ✅ resolved 2026-07-06

**Как найдено:** PR #48 — CI (GitHub Actions, ubuntu-24.04) стабильно ронял 3 теста в `Calendar.test.ts` (`does not display placeholder when value is provided`, `renders correct range dates`, `applies mask correctly`) с `expected '' to contain/be '<дата>'`, при этом **ни разу не воспроизводилось локально** (macOS), ни изолированно, ни в полном прогоне. Промежуточная гипотеза (флуд `console.error` от несвязанного jsdom/`@layer`-бага плюс leak `vi.useFakeTimers()` из-за не-exception-safe cleanup в том же тесте) объясняла флаки в `Icons.test.ts`/`stringHandler.test.ts`, но не сами 3 теста Calendar — они продолжали падать даже после устранения обеих причин. Прямая репродукция в Docker-контейнере (`node:22-bookworm`, тот же образ, что CI) + diagnostic-логи показали: `calendarPicker.value.inputValue` (то, что реально знает v-calendar) корректен **с первого же тика**, а `visibleDate` (`ref` в Calendar.vue, из которого рендерится текст) навсегда остаётся `{start:"",end:""}` — сколько ни жди (проверено вплоть до 60 тиков / 3000ms).

**Что сделано (2026-07-06):**

Синхронизация `visibleDate` из `calendarPicker.value?.inputValue` не работала по двум независимым причинам:

1. `onMounted` (см. [Calendar.vue:256-272](../../lib/calendar/Calendar.vue#L256)) читает `calendarPicker.value?.inputValue` сразу после `await nextTick()` — v-calendar на этот момент ещё не успел посчитать форматированную строку из `modelValue`+`mask` и отдаёт пустой placeholder (`""` / `{start:"",end:""}`). `onMounted` присваивает этот пустой placeholder в `visibleDate.value` — теперь это уже не `null`, а пустой, но НЕ-`null` объект.
2. Watch-страховка "на случай гонки с onMounted-read" была реализована как `watch(calendarPicker, () => {...}, {deep:true})` с guard'ом `visibleDate.value == null`. Это ломается вдвойне: guard навсегда `false` после (1), а сам `deep`-watch на РЕФ, хранящий инстанс дочернего компонента, эмпирически (diagnostic-логи) срабатывает **только один раз** — при первом присвоении самого рефа — и не видит последующих внутренних реактивных изменений `inputValue` у v-calendar. Guard, даже если бы был правильным, всё равно не получил бы второго шанса сработать.

Фикс — [Calendar.vue:281-303](../../lib/calendar/Calendar.vue#L281): второй watch переписан на геттер конкретного свойства — `watch(() => calendarPicker.value?.inputValue, callback, {deep:true})` — вместо deep-watch на весь инстанс. Такой watch триггерится на каждое реальное изменение `inputValue` (подтверждено diagnostic-логами: второй fire с уже корректными датами). Guard заменён с «`visibleDate` ещё `null`» на «пришедшее значение непустое» (`hasInputValue()` — `""` для строкового режима, `{start:"",end:""}` для range — трактуются как «ещё не готово»), что и было изначальным намерением комментария «на случай гонки» — просто реализация guard'а была неверной. `emit("getCalendar", ...)` вынесен в отдельный (первый) watch — он должен реагировать на любое изменение инстанса picker'а, а не только на `inputValue`, поэтому не стоит смешивать оба назначения в одном callback'е.

**Тесты:** отдельно от этого фикса, [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) заменил фиксированные `flushPromises()`/`nextTick()` (угадывание числа тиков) на condition-based `waitFor(condition, timeoutMs=3000)` в 5 тестах, ожидающих picker — устраняет саму по себе таймингозависимость на медленном CI-раннере, независимо от production-фикса выше.

**Как проверено:** Docker-репродукция (`node:22-bookworm`, тот же `pnpm install --frozen-lockfile` + `pnpm-workspace.yaml`, что и `.github/workflows/pull_request.yml`) — полный pipeline (`typecheck` → `lint` → `vitest run`, весь suite) зелёный, 55/55 файлов, 5610/5610 реальных тестов. Дополнительно проверено интерактивно в sandbox (клик по дню в открытом picker'е → `[data-calendar]` корректно обновляет текст через тот же исправленный watch).

### Acceptance criteria

- [x] `Calendar` смонтирован с непустым `modelValue` (single и range режимы) — отображаемый текст показывает реальную дату, а не остаётся пустым, независимо от того, сколько времени занимает резолв lazy-loaded v-calendar.
- [x] Полный `vitest run` (весь suite, `isolate:false`) зелёный на Linux/Node 22 (CI-эквивалентная среда), не только на macOS.
- [x] Интерактивный выбор даты в открытом picker'е по-прежнему корректно обновляет отображаемый текст (regression-check ручной выбор через тот же watch).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Calendar` | ✅ | mode, datePickerOptions, separator, и др. |
| `componentsStyle` global | ✅ | Issue 6 ✅ resolved 2026-05-11 (fallback `props ?? options ?? componentsStyle ?? "outlined"`) |
| `unstyled: true` | ✅ | Issue 7 — framework-level через `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138)); v-calendar intrinsic классы остаются (внешняя зависимость). |
| Theme tokens vs hardcode | ⚠️ | v-calendar использует свои tokens — несвязанная палитра |
| Runtime theme switch | ✅ | dark detection через MutationObserver работает + Issue 1 ✅ resolved 2026-05-11 (cleanup в `onBeforeUnmount`). |
| `t()` для текста | ⚠️ | месяцы/дни недели — из v-calendar locale, теперь синхронно с `getActiveLocale()` (Issue 8 ✅) |
| Runtime locale switch | ⚠️ | Issue 8 ✅ resolved 2026-05-11 (reactive computed); v-calendar internally rebuilds только при remount — пользователь может сделать `:key="locale"` для forced rerender. |

## Dual-API gap

См. [Issue 5](#issue-5-нет-dual-api-—-компонент-только-schema-driven-через-datepickeroptions). Применимо опционально — Calendar менее очевидный кандидат на compound (single-purpose date picker), но composition slots для day-cell были бы полезны.
