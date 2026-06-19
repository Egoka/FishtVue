---
title: Issues — InputLayout
summary: Аудит InputLayout — все issues ✅ resolved (1/2/3/5/6/7 — 2026-05-11; 4/8 — 2026-06-13: motion-safe, print, forced-colors, unstyled + packaging inherited; 9 — 2026-06-14: floating-label mount-slide gate; 10 — 2026-06-19: label↔control association через useId + for/aria-labelledby, Wave 4). Остаётся active как Wave 9 tracker (semantic-token migration, B10 residual).
updated: 2026-06-19
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/inputlayout/
related-doc: ../components/input-layout.md
---

# Issues — InputLayout

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | (2 closed: ~~C13 v-html × 2~~, ~~H41 ResizeObservers leak~~) |
| high | 0 | (4 closed: ~~A2, A4-5, C17~~ inherited cross-cutting, ~~L53 unstyled~~; + ~~E29 label↔control association~~ Issue 10 найден+закрыт 2026-06-19, open-counts не затрагивает) |
| medium | 0 | (4 closed: ~~C14 clipboard SSR~~, ~~E29.5 aria-live~~, ~~F30 i18n copied~~, ~~G34 querySelector coupling~~) |
| low | 0 | (4 closed: ~~E29.7 motion-safe~~, ~~B10 forced-colors~~, ~~N59 print~~, ~~C18 label mount-slide~~) |

> **Wave 9 residual:** B10 — структурные нейтрали (`gray-*`/`neutral-*`/`stone-*`) на semantic-токены (`bg-surface`/`border-border`) ещё не мигрированы; трекается cross-cutting [theme.md](./theme.md) / Wave 9. Сам `forced-colors:outline` (high-contrast видимость) добавлен.

## Issue 1: ~~CRITICAL — XSS через `help` и `messageInvalid` (v-html)~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где (was):** ~~[InputLayout.vue:294, 313]~~ → [InputLayout.vue:372-375](../../lib/inputlayout/InputLayout.vue#L372-L375) и [InputLayout.vue:394-398](../../lib/inputlayout/InputLayout.vue#L394-L398) — теперь slot-fallback на text-node.
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```vue
<div v-html="help" :class="classIconContent" />
<div v-html="messageInvalid" :class="classIconContent" />
```

`help: string` и `messageInvalid: string` — пользовательские props (приходят из Input/Aria/Select/Calendar/TextEditor через `inputLayout` computed-объект).

### Почему это проблема

- Самое критичное: `messageInvalid` часто формируется из server-validation messages (`response.errors[0].message`). Если backend возвращает HTML/escapes плохо — XSS payload в DOM.
- Cross-cutting: ВСЕ form-controls (Input, Aria, Select, Calendar, TextEditor) пробрасывают эти props в InputLayout — фикс здесь устраняет XSS во всех 5 компонентах разом.

### Что нужно сделать

1. Заменить v-html на slot:
   ```vue
   <slot name="help">{{ help }}</slot>
   <slot name="messageInvalid">{{ messageInvalid }}</slot>
   ```
2. `help`/`messageInvalid` остаются props как fallback — рендерятся как text-node.
3. Если HTML-форматирование требуется — пользователь явно использует slot.
4. Cross-cutting эффект: устраняет XSS в Input, Aria, Select, Calendar, TextEditor.
5. Тест с payload `<img src=x onerror=alert(1)>` для `messageInvalid` — НЕ исполняется.

### Acceptance criteria

- [x] `<InputLayout :message-invalid="<script>alert(1)</script>">` НЕ исполняет — рендер как text-node (тест `Security / XSS guard` в `InputLayout.test.ts`).
- [x] `<InputLayout><template #messageInvalid><strong>Error</strong></template></InputLayout>` рендерит strong-text (тест `renders user-provided messageInvalid slot`).
- [x] `help` идентично: `<template #help>` overrides text-node fallback; XSS payload не выполняется.
- [ ] Cross-cutting forwarding в Input/Aria/Select/Calendar/TextEditor (`<template #help><slot name="help" /></template>`) — отдельный follow-up PR; на уровне самого InputLayout XSS невозможен — fallback всегда text.

## Issue 2: ~~CRITICAL — Memory leak: 2 anonymous ResizeObservers без disconnect~~ ✅ resolved 2026-05-11

- **Категория:** H41
- **Severity:** **critical**
- **Где (was):** ~~[InputLayout.vue:177, 181]~~ → теперь [InputLayout.vue:210-220](../../lib/inputlayout/InputLayout.vue#L210-L220) (сохранены в `let beforeObserver` / `let afterObserver`) + [InputLayout.vue:243-248](../../lib/inputlayout/InputLayout.vue#L243-L248) (`onUnmounted` disconnect всех трёх).
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
onMounted(() => {
  InputLayout.initStyle()
  if (beforeInput.value)
    new ResizeObserver(...).observe(beforeInput.value)  // anonymous, не cleanup'ится
  if (afterInput.value)
    new ResizeObserver(...).observe(afterInput.value)  // anonymous, не cleanup'ится
  ...
})
...
onUnmounted(() => {
  if (isClient() && layoutObserver) layoutObserver.disconnect()
})
```

`onUnmounted` cleans только один observer (`layoutObserver`). Два других (для `beforeInput` / `afterInput`) — anonymous, references потеряны → утечка.

### Почему это проблема

- ВСЕ form-controls используют InputLayout как обёртку. На странице с 10 inputs → 30 неубранных observers.
- При SPA-навигации каждая mount/unmount-цикл оставляет 2 observer на DOM-узлы которые garbage-collect'ятся, но callback-замыкания держат ref на DOM → утечка памяти.

### Что нужно сделать

1. Сохранить observers в refs:
   ```ts
   const beforeObserver = ref<ResizeObserver>()
   const afterObserver = ref<ResizeObserver>()
   onMounted(() => {
     ...
     if (beforeInput.value) {
       beforeObserver.value = new ResizeObserver(...)
       beforeObserver.value.observe(beforeInput.value)
     }
     if (afterInput.value) {
       afterObserver.value = new ResizeObserver(...)
       afterObserver.value.observe(afterInput.value)
     }
   })
   onUnmounted(() => {
     beforeObserver.value?.disconnect()
     afterObserver.value?.disconnect()
     layoutObserver?.disconnect()
   })
   ```
2. Альтернатива — VueUse `useResizeObserver`.

### Acceptance criteria

- [x] Observers сохраняются в `let`-переменные, `onUnmounted` дисконнектит каждый (тест `ResizeObserver lifecycle > disconnects beforeInput / afterInput / layout observers on unmount`).
- [ ] Long-running heap-profiler test (mount/unmount × 100) — не выполнен в CI (out of scope для unit-теста; покрыт unit-проверкой `disconnect.mock.calls`).

## Issue 3: ~~clipboard.writeText без feature-detect — падает в небезопасных контекстах~~ ✅ resolved 2026-05-11

- **Категория:** C14 (SSR + non-secure context)
- **Severity:** medium
- **Где (was):** ~~[InputLayout.vue:226]~~ → теперь [InputLayout.vue:285-309](../../lib/inputlayout/InputLayout.vue#L285-L309) (feature-detect) + [InputLayout.vue:264-283](../../lib/inputlayout/InputLayout.vue#L264-L283) (`legacyCopy` execCommand fallback).
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
async function copy() {
  if (value.value) {
    await navigator.clipboard.writeText(String(value.value))
    isCopy.value = true
    setTimeout(() => (isCopy.value = false), 3000)
  }
}
```

`navigator.clipboard.writeText`:
- Throws TypeError в HTTP context (требует HTTPS).
- Throws в iframe sandbox без `clipboard-write` permission.
- `navigator` undefined на SSR.

### Что нужно сделать

1. Feature-detect:
   ```ts
   if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
     try {
       await navigator.clipboard.writeText(String(value.value))
       isCopy.value = true
     } catch (err) {
       // Fallback: legacy execCommand
       const el = document.createElement("textarea")
       el.value = String(value.value)
       document.body.appendChild(el)
       el.select()
       document.execCommand("copy")
       document.body.removeChild(el)
       isCopy.value = true
     }
   }
   ```
2. Или использовать VueUse `useClipboard` — handles fallback automatically.

### Acceptance criteria

- [x] `navigator.clipboard === undefined` → `copy()` не бросает; fallback на `execCommand` (тест `Clipboard copy — SSR / non-secure context > does not throw when navigator.clipboard is undefined`).
- [x] `clipboard.writeText` бросает → fallback на `execCommand` (тест `falls back to execCommand when clipboard.writeText throws`).
- [x] SSR-render не падает (`isClient()` guard в начале `copy()` и `legacyCopy()`).

## Issue 4: ~~SSR styles + sideEffects/exports map / unstyled~~ ✅ resolved 2026-06-13

- **Категория:** C17, A2, A4, A5, L53
- **Status:** ✅ resolved 2026-06-13

### A2 / A4-5 / C17 — inherited cross-cutting (правок исходника нет)

Зеркало [button.md Issue 1/8/9](./button.md), [switch.md Issue 5](./switch.md), [badge.md Issue 1](./badge.md):

- **A2 (`sideEffects`):** root [lib/package.json](../../lib/package.json) `"sideEffects": false` ✅ 2026-06-07; `copyDependencies()` инъектит `sideEffects:false` в каждый `dist/{name}/package.json`. В опубликованном пакете нет `.vue`/`.css` (SFC → `.mjs`, CSS инжектится в рантайме через `onServerPrefetch`/`vueOnMounted`) — модули чисты на import.
- **A4-5 (ESM-only + `exports` map):** `engines.node >=18` ратифицирован; корневая `exports`-карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) ✅ 2026-06-11 — `fishtvue/inputlayout` (`./inputlayout` + identity `./inputlayout/inputlayout.mjs` + PascalCase `InputLayout.d.ts`) входит в strict-superset.
- **C17 (SSR styles):** канон `Component.__hooks()` ([component/index.ts:79-84](../../lib/component/index.ts#L79-L84)) регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`; `__setStyle()` пишет CSS в `cssComponents` Map без `isClient()`-guard, Nuxt server plugin сливает критический CSS в SSR-HTML до hydration. InputLayout не дублирует `initStyle()` в SFC ([InputLayout.vue:207-208](../../lib/inputlayout/InputLayout.vue#L207-L208)).

### L53 — unstyled ✅

Cross-cutting guard `if (this.__globalConfig?.config?.unstyled) return ""` в `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138), landed 2026-05-11) покрывает все 22 компонента. InputLayout маршрутизирует **все** классы через `InputLayout.setStyle` → при `unstyled: true` корень `[data-input-layout]` (`:class="classBody"`) и все вложенные классы получают `""`. Правок исходника не потребовалось; добавлен regression-тест (блок `Configuration support — unstyled (L53)`, 2 кейса, `afterEach` чистит `window.FishtVue` singleton-leak).

## Issue 5: ~~`document.querySelector("header")` — coupling с конкретным DOM в потребителе~~ ✅ resolved 2026-05-11

- **Категория:** C13 (утечка структуры)
- **Severity:** medium
- **Где (was):** ~~[InputLayout.vue:184]~~ — удалено. Заменено на `offsetTop` prop ([InputLayout.vue:188-203](../../lib/inputlayout/InputLayout.vue#L188-L203) — `resolveOffsetTop()`). Тип: `number | string | (() => number)`. По умолчанию `0`.
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
if (isClient()) headerHeight.value = <number>document.querySelector("header")?.offsetHeight
```

Хардкоден поиск `<header>`-тега в потребительском приложении. Если у пользователя нет `<header>` или он не на верхнем уровне — `headerHeight` = undefined.

### Почему это проблема

- Coupling с потребительской разметкой — anti-pattern.
- Если пользователь использует `<NuxtPageHeader>` или `<v-app-bar>` — поиск не работает.

### Что нужно сделать

1. Добавить prop `offsetTop?: number | string | (() => number)`:
   ```ts
   const offsetTop = computed(() => {
     if (typeof props.offsetTop === "number") return props.offsetTop
     if (typeof props.offsetTop === "function") return props.offsetTop()
     return 0
   })
   ```
2. Удалить hardcoded `querySelector("header")` или сделать opt-in через prop.

## Issue 6: ~~aria-live для error messages отсутствует~~ ✅ resolved 2026-05-11

- **Категория:** E29.5
- **Severity:** medium
- **Где:** [InputLayout.vue:443-451](../../lib/inputlayout/InputLayout.vue#L443-L451) — `<p data-input-layout-message-invalid aria-live="assertive" aria-atomic="true">`.
- **Status:** ✅ resolved 2026-05-11

`messageInvalid` появляется при validation error. Screen reader озвучивает изменения сразу. Тест: `Accessibility — aria-live on error region` в `InputLayout.test.ts`.

## Issue 7: ~~Hardcoded text "copied!" / "копировано!" для clipboard feedback~~ ✅ resolved 2026-05-11

- **Категория:** F30 (i18n)
- **Severity:** medium
- **Где:** Локализованный ключ `inputLayout.copied` ([locale/locales/en.ts:16-18](../../lib/locale/locales/en.ts#L16-L18), [ru.ts:16-18](../../lib/locale/locales/ru.ts#L16-L18)). Тип в [TypesLocale.d.ts:34-36](../../lib/locale/TypesLocale.d.ts#L34-L36). Использование — [InputLayout.vue:431-439](../../lib/inputlayout/InputLayout.vue#L431-L439) (FixWindow tooltip + `aria-label` на Check-иконке).
- **Status:** ✅ resolved 2026-05-11

Confirm-feedback после успешного copy теперь рендерит FixWindow с локализованным текстом + `aria-label`. Тесты: `Locale — inputLayout.copied` (EN / RU dictionary).

## Issue 8: ~~prefers-reduced-motion / colors / print~~ ✅ resolved 2026-06-13

- **Категория:** E29.7, B10, N59
- **Status:** ✅ resolved 2026-06-13

Канон FishtVue (зеркало [switch.md Issue 7/12/14](./switch.md), [button.md](./button.md)) — без правок theme-движка (`unoStatic.ts` уже знает media `motion-safe`/`forced-colors`/`print`).

### E29.7 — prefers-reduced-motion ✅

Все собственные transitions InputLayout обёрнуты в `motion-safe:`:

- root `animation` (`classBody`/`classBase`) → `motion-safe:transition-all motion-safe:duration-550` ([InputLayout.vue:67-72](../../lib/inputlayout/InputLayout.vue#L67-L72)).
- Inline-классы шаблона движок сам не регистрирует — их `motion-safe:`-варианты явно зарегистрированы module-scope `InputLayout.setStyle(...)` ([InputLayout.vue:149-154](../../lib/inputlayout/InputLayout.vue#L149-L154)).
- Оба `<transition>`-блока (loading / clear): `enter/leave-active-class` → `motion-safe:transition motion-safe:ease-in motion-safe:duration-200` (`opacity-*` from/to — состояния, не тайминг).
- Hover-иконки (help / invalid / clear / copy): `transition`/`transition-all duration-300` → `motion-safe:*`.
- Тесты: блок `Reduced motion — motion-safe transitions (E29.7)` — root после tick содержит `motion-safe:transition-all`/`duration-550` и НЕ содержит bare-варианты; help-icon содержит `motion-safe:transition`.

### N59 — print ✅

Style-for-print (не `display:none`) — корневой `classBody` получил `print:border print:border-black print:bg-white print:text-black print:shadow-none` ([InputLayout.vue:92](../../lib/inputlayout/InputLayout.vue#L92)). Тест: блок `Print styles (N59)` (`print:*` присутствует, `print:hidden` отсутствует).

### B10 — forced-colors + theme tokens ⚠️ (forced-colors ✅, semantic-токены → Wave 9)

- **NEW `forced-colors:outline`** на поле `classBase` ([InputLayout.vue:115](../../lib/inputlayout/InputLayout.vue#L115)) — в Windows high-contrast `border-*` сбрасывается, outline сохраняет границу поля. Тест: блок `Forced-colors / high-contrast (B10)`.
- **Структурные нейтрали** (`gray-*`/`neutral-*`/`stone-*`) и semantic-красный (`red-*`) **оставлены** — полная shadcn-style `bg-surface`/`border-border` миграция остаётся cross-cutting [theme.md Issue 1](./theme.md) / **Wave 9**. InputLayout не имеет собственного accent-цвета (нет `theme-*`-токенов вне дочерних Label/Icons).

## Issue 9: ~~floating-label «переезжает» из исходной точки в финальную на mount~~ ✅ resolved 2026-06-14

- **Категория:** C18 (visual / motion)
- **Severity:** ~~low~~
- **Где:** [Label.vue:40](../../lib/label/Label.vue#L40), [InputLayout.vue:338](../../lib/inputlayout/InputLayout.vue#L338)
- **Симптом:** после перезагрузки на первом кадре floating-label `[data-label]` ехал из исходной точки (нижний-левый угол) в финальную позицию.
- **Причина:** `classBase` дочернего `Label` нёс **негейтнутый** `motion-safe:transition-all motion-safe:duration-200`. Свой transition InputLayout гейтит через `isTick` (`setTimeout 100ms` после mount — [InputLayout.vue:67-73](../../lib/inputlayout/InputLayout.vue#L67-L73)), но у Label такого гейта не было. На mount позиция лейбла меняется (инжект стилей в `onMounted` + устаканивание измерений `beforeWidth`/`labelType`), и live-transition анимировал это смещение один кадр.
- **Resolution:** у Label появился опциональный prop `animate?: boolean` (default `true` — поведение standalone Label не изменилось), который гейтит `motion-safe:transition-all motion-safe:duration-200` в `classBase`. `InputLayout` передаёт `:animate="isTick"` ([InputLayout.vue:338](../../lib/inputlayout/InputLayout.vue#L338)) — на первом кадре `false` (лейбл сразу в нужной позиции, без анимации), после mount-tick `true` (focus / value-float анимируется как раньше). E29.7 не нарушен — переход остаётся `motion-safe:`-gated.
- **Тесты:** `Label.test.ts` блок `animate prop (position transition gate)` (default → transition есть; `animate:false` → нет, позиционные классы остаются); `InputLayout.test.ts` (E29.7) — `gates the floating-label transition behind the mount tick` (до тика у `[data-label]` нет `motion-safe:transition-all`, после `advanceTimersByTime(150)` — есть).
- **Verified:** browser-preview после рестарта dev-сервера — post-settle `props.animate === true`, `isTick === true`, label `transitionDuration: 0.2s`; лейблы Input/Select/Calendar отрисованы в покое без «переезда».

## Issue 10: ~~`<label>` не связан с control — `forId` не пробрасывается, у контролов нет стабильного id~~ ✅ resolved 2026-06-19

- **Категория:** E29 (a11y — WCAG 1.3.1 Info & Relationships, 3.3.2 Labels, 4.1.2 Name Role Value)
- **Severity:** ~~high~~ (Wave 4; найден и закрыт в одной сессии → open-counts матрицы не затрагивает — остаётся 0/0/0/0)
- **Где (was):** [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) (`<Label>` без `:for-id`, сейчас [:338](../../lib/inputlayout/InputLayout.vue#L338)), плюс все 5 потребителей.
- **Симптом:** `Label` уже умел `<label :for="forId">` ([Issue 1 label.md](./label.md) ✅ 2026-05-11), но InputLayout рендерил `<Label v-if="label" :title …>` **без `:forId`** → у `<label>` пустой `for`. Контролы (`<input>`/`<textarea>`/триггеры) принимали `id?` опционально и **без автогенерации**; `inputLayout`-computed потребителей даже не пробрасывал `id`. Итог: клик по метке не фокусировал контрол, screen-reader не озвучивал связку — во **всех** form-controls (Input/Aria/Select/Calendar/TextEditor).
- **Resolution (single source of truth = InputLayout):** добавлен `InputLayoutProps.id?` + автогенерация `useId()` (SSR-stable, зеркало Accordion/Split). Computed `fieldId = props.id ?? autoId`, `labelId = label ? `${fieldId}-label` : undefined` ([InputLayout.vue](../../lib/inputlayout/InputLayout.vue)). `<Label :id="labelId" :for-id="fieldId">`, дефолт-слот стал scoped — `<slot :id="fieldId" :labelledby="labelId" />`. Потребители забиндили scope: **Input/Aria** (labelable нативные) — `:id="fieldId"` → `<label for>` срабатывает нативно; **Select** — `:id` + `role="combobox"` + `:aria-labelledby="labelledby"` + `:aria-expanded="isOpenList"`; **Calendar/TextEditor** (div-триггеры) — `:id` + `:aria-labelledby="labelledby"`. Каждый добавил `id: props.id` в `inputLayout`-computed (явный `props.id` выигрывает над автогенерацией). Backward-compatible: внешние консьюмеры без `<template #default>` рендерятся как прежде.
- **Тесты:** `InputLayout.test.ts` блок «label↔control association» (auto-id, props.id wins, `<Label>` `for`+`id`, slot `{id, labelledby}`, нет `labelledby` без label); `Input.test.ts`/`Aria.test.ts` (id всегда есть, `<label for>` === control id, явный id уважается); `Select.test.ts` (`role=combobox` + `aria-labelledby` + `aria-expanded` реактивен); `Calendar.test.ts` (aria-labelledby на триггере); `TextEditor.test.ts` source-scan (`#default` scope + `aria-labelledby` binding — mount Quill крашит jsdom rAF, см. Issue 1 todo); `Label.test.ts` (`id` fallthrough на `<label>`).
- **Note (Switch):** Switch не использует InputLayout (собственный label-рендер) → вне scope этого fix.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.InputLayout` | ✅ | mode, animation, `offsetTop` и др. |
| `componentsStyle` global | ✅ | `InputLayout.componentsStyle()` ([InputLayout.vue:43](../../lib/inputlayout/InputLayout.vue#L43)) |
| `unstyled: true` | ✅ | Issue 4 ✅ — cross-cutting guard `Component.setStyle()` |
| Theme tokens vs hardcode | ⚠️ | `forced-colors:outline` добавлен (Issue 8); semantic-токены `neutral-*` → Wave 9 |
| Runtime theme switch | ✅ | через CSS-variables |
| `t()` для текста | ✅ | clear, copy, `inputLayout.copied` confirm — все локализованы (Issue 7 ✅) |
| Runtime locale switch | ✅ | если использует t() — реагирует |

## Dual-API gap

Не применимо — InputLayout — wrapper, не collection.
