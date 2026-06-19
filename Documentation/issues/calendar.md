---
title: Issues — Calendar
summary: 5/10 issues закрыты — memory leaks (MutationObserver disconnect + keydown cleanup), componentsStyle fallback, locale propagation, Wave 2.3 dup initStyle, + Wave 2.1 packaging (Issue 2 v-calendar → optional peer + lazy, Issue 3 vue → peer). Открытые — SSR-packaging cross-cutting (Issue 4), dual-API (5), unstyled (7, framework-level), floating-ui (9), RTL/print/motion (10).
updated: 2026-06-19
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
| medium | 3 | F31, G34, H39 |
| low | 3 | E29.7, B10, N59 |

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

## Issue 9: Floating positioning — не реагирует на window resize / scroll-parent

> **Status:** deferred — cross-cutting (FixWindow, Menu, Select dropdown все требуют floating-ui). Отдельный ТЗ.

- **Категория:** H39 (Floating UI / scroll/resize)
- **Severity:** medium
- **Где:** [Calendar.vue](../../lib/calendar/Calendar.vue) (через FixWindow)

### Что найдено

Picker открывается через FixWindow. Если внутри scroll-container и пользователь скроллит body — picker не remount'ится / не перепозиционируется.

### Что нужно сделать

1. Использовать Floating UI (`@floating-ui/vue`) для positioning — auto-flip, auto-shift, scroll-aware.
2. Cross-cutting: FixWindow, Menu, Select dropdown — все требуют floating-ui.
3. См. также [fixwindow.md](./fix-window.md) когда будет.

## Issue 10: prefers-reduced-motion, print, colors hardcode, RTL

> **Status:** deferred — cross-cutting (затрагивает все 22 компонента). См. [button.md](./button.md), [switch.md](./switch.md).

- **Категория:** E29.7, N59, B10, F31
- **Severity:** low

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
