---
title: Issues — Calendar
summary: Аудит Calendar — memory leaks (MutationObserver на documentElement без disconnect, keydown listeners без unmount cleanup), v-calendar версия 3.x с peer-dependency conflict потенциалом, нет dual-API.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/calendar/
related-doc: ../components/calendar.md
---

# Issues — Calendar

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | H41 (memory leaks: MutationObserver + keydown) |
| high | 6 | A2, A4-5, C17, I44, L53, P |
| medium | 4 | F31, F32, G34, H39 |
| low | 3 | E29.7, B10, N59 |

## Issue 1: CRITICAL — MutationObserver на documentElement не disconnect'ится при unmount

- **Категория:** H41 (memory leaks)
- **Severity:** **critical**
- **Где:** [Calendar.vue:315-328](../../lib/calendar/Calendar.vue#L315-L328)

### Что найдено

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

`observer` — local переменная. После выхода из функции — недоступен → невозможно disconnect. **Memory leak**.

Также: `document.addEventListener("keydown", keydownCalendar)` ([Calendar.vue:254](../../lib/calendar/Calendar.vue#L254)) и `openCalendarOnEnter` ([Calendar.vue:261](../../lib/calendar/Calendar.vue#L261)) — без `onBeforeUnmount` cleanup.

### Почему это проблема

- `document.documentElement` глобальный — каждая Calendar-инстанция добавляет MutationObserver на root. Если на странице 5 Calendar → 5 observers, каждый при изменении `class` (тoggle dark) вызывает callback.
- При navigate-away — Calendar unmount, но observer продолжает работать. Это classic Vue 3 memory-leak.
- Усугубляется в SPA с динамическими view'ами (table-rows, modal-pickers).

### Что нужно сделать

1. В [Calendar.vue:315](../../lib/calendar/Calendar.vue#L315) сохранить observer в ref и disconnect:
   ```ts
   const darkObserver = ref<MutationObserver>()
   function initDarkModeObserver() {
     ...
     darkObserver.value = new MutationObserver(checkDarkMode)
     darkObserver.value.observe(document.documentElement, { ... })
   }
   onBeforeUnmount(() => {
     darkObserver.value?.disconnect()
     document.removeEventListener("keydown", keydownCalendar)
     document.removeEventListener("keydown", openCalendarOnEnter)
   })
   ```
2. Лучше — вынести dark-mode detection в **shared composable** `useDarkMode()` (singleton), который установит ОДИН observer на весь app, а компоненты подписываются через reactive `isDark`. См. [VueUse useDark](https://vueuse.org/core/useDark/).
3. Cross-cutting — Select имеет аналогичную проблему ([select.md Issue 2](./select.md)). Применить тот же fix.

### Acceptance criteria

- [ ] Профилирование памяти: mount/unmount Calendar 100× — heap не растёт.
- [ ] Listener-sniff тест: после unmount — keydown event на document не вызывает Calendar-обработчик.

## Issue 2: v-calendar dependency может конфликтовать с пользовательской версией

- **Категория:** A3 (дубли библиотеки), I44 (peer)
- **Severity:** high
- **Где:** [lib/package.json:55](../../lib/package.json#L55)

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

## Issue 3: Vue в dependencies — duplicate Vue в потребителе

- **Категория:** A3 (дубль Vue)
- **Severity:** high
- **Где:** [lib/package.json:56](../../lib/package.json#L56)

### Что найдено

```json
"dependencies": { ..., "vue": "^3.5.11" }
```

Vue должен быть `peerDependency`, иначе npm может установить вторую копию Vue для fishtvue, что вызовет два разных Vue runtime → reactive контексты не работают, plugins дублируются.

### Что нужно сделать

1. Перенести vue из `dependencies` в `peerDependencies` с диапазоном `"^3.5.0"`.
2. В rollup config vue уже external (line 50), build корректен — это только packaging.
3. Cross-cutting — same fix актуален для всех runtime-deps.

### Acceptance criteria

- [ ] `npm ls vue` в Nuxt-проекте + fishtvue — одна копия Vue.

## Issue 4: SSR styles + cross-cutting (sideEffects, exports map)

- **Категория:** C17, A2, A4, A5
- **Severity:** high

См. [button.md Issue 1, 8, 9](./button.md).

## Issue 5: Нет dual-API — компонент только schema-driven через `datePickerOptions`

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

## Issue 6: Нет componentsStyle global fallback

- **Категория:** L53
- **Severity:** high

См. [input.md Issue 2](./input.md).

## Issue 7: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 8: Locale для дат — не использует FishtVue locale

- **Категория:** F32
- **Severity:** medium
- **Где:** [Calendar.vue](../../lib/calendar/Calendar.vue) (v-calendar wrapping)

### Что найдено

v-calendar имеет свой `locale` prop. FishtVue Calendar его не пробрасывает из FishtVue config. При смене `setActiveLocale("ru")` — Calendar остаётся на default locale.

### Что нужно сделать

1. В Calendar.vue добавить computed:
   ```ts
   const locale = computed(() => FishtV?.getActiveLocale() ?? "en")
   ```
2. Передавать `<DatePicker :locale="locale">` в v-calendar.
3. Также пробрасывать формат через `dayjs/date-fns` locale, если formatDate используется.

### Acceptance criteria

- [ ] `setActiveLocale("ru")` → месяцы в Calendar отображаются на русском.

## Issue 9: Floating positioning — не реагирует на window resize / scroll-parent

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

- **Категория:** E29.7, N59, B10, F31
- **Severity:** low

Cross-cutting. См. [button.md](./button.md), [switch.md](./switch.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Calendar` | ✅ | mode, datePickerOptions, separator, и др. |
| `componentsStyle` global | ❌ | Issue 6 |
| `unstyled: true` | ❌ | Issue 7 |
| Theme tokens vs hardcode | ⚠️ | v-calendar использует свои tokens — несвязанная палитра |
| Runtime theme switch | ⚠️ | dark detection через MutationObserver (Issue 1) — работает, но утекает |
| `t()` для текста | ❌ | месяцы/дни недели — из v-calendar default, не из FishtVue locale |
| Runtime locale switch | ❌ | Issue 8 |

## Dual-API gap

См. [Issue 5](#issue-5-нет-dual-api-—-компонент-только-schema-driven-через-datepickeroptions). Применимо опционально — Calendar менее очевидный кандидат на compound (single-purpose date picker), но composition slots для day-cell были бы полезны.
