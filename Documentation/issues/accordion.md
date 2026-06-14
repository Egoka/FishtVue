---
title: Issues — Accordion
summary: Аудит Accordion — XSS / ARIA / keyboard / animation закрыты 2026-05-11; dual-API / SSR+sideEffects+unstyled / RTL / motion-safe / root-ref-expose закрыты 2026-06-14. Остаётся только B10 (semantic tokens / high-contrast) — deferred на Wave 9.
updated: 2026-06-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/accordion/
related-doc: ../components/accordion.md
---

# Issues — Accordion

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | ~~C13~~ ✅ |
| high | 0 | ~~P (dual-API)~~ ✅, ~~C17~~ ✅, ~~E29.1/29.2~~ ✅ |
| medium | 0 | ~~F31~~ ✅, ~~G34~~ ✅ |
| low | 1 | B10 (deferred Wave 9); ~~E29.7~~ ✅, ~~F30~~ N/A |

**Закрыто 2026-05-11** в `fix(accordion): close XSS in subtitle, add WAI-ARIA disclosure + keyboard nav, transition unmount`: Issues 1 (critical), 3 (high), 4 (high), 6 (medium). Подробности — в зачёркнутых блоках ниже.

**Закрыто 2026-06-14** в `feat(accordion): compound <AccordionItem> API + RTL/motion-safe a11y + root-ref expose`: Issue 2 (P, dual-API), Issue 5 (C17/A2/L53), Issue 7 частично (E29.7 motion-safe, F31 RTL, F30 i18n → N/A), G34 (root-ref expose). Остаётся **только B10** (semantic tokens / high-contrast) — отложен на Wave 9 (требует расширения theme-engine, решается скоординированно по всем компонентам).

## ~~Issue 1: CRITICAL — XSS через `item.subtitle` v-html~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~
- **Где:** ~~[Accordion.vue:149](../../lib/accordion/Accordion.vue#L149)~~

### ~~Что найдено~~

```vue
<p v-else :class="classNotTemplate" v-html="item.subtitle" />
```

### Что было сделано

Заменено на `<slot name="item-subtitle">` с safe text-default. Consumer opt-in к custom HTML через override slot'а. Тест-блок «Security — XSS in subtitle» проверяет, что payload `<img src=x onerror=alert(1)>` рендерится как plain text.

## ~~Issue 2: Dual-API gap — нет compound `<Accordion><AccordionItem>`~~ ✅ resolved 2026-06-14

- **Категория:** P
- **Severity:** ~~high~~
- **Где:** ~~[Accordion.d.ts](../../lib/accordion/Accordion.d.ts)~~

### Что найдено

Был только schema-API через `:data-source`-массив; не было декларативного compound-варианта:
```vue
<Accordion>
  <AccordionItem title="Section 1" :open="true"><RichContent /></AccordionItem>
  <AccordionItem title="Section 2" subtitle="Plain fallback" />
</Accordion>
```

### Что было сделано

Добавлен renderless descriptor [AccordionItem.vue](../../lib/accordion/AccordionItem.vue) (+ [AccordionItem.d.ts](../../lib/accordion/AccordionItem.d.ts)) и VNode-walk в [Accordion.vue](../../lib/accordion/Accordion.vue) (`compoundItems`/`sourceItems`/`usingCompound`). Реализация — через обход `slots.default()` по имени компонента (**не** provide/inject), зеркало [Menu](../components/menu.md)/`Table`. Schema-`:data-source` при наличии выигрывает (backward compat); содержимое секции — default slot `<AccordionItem>`, open-state сохраняется по индексу при re-render. Пакет переведён в compound-entry (`lib/rollup.config.js` `COMPOUND_ENTRIES` + `addEntry`); `accordion.mjs` экспортирует `AccordionItem` named-экспортом. Тест-блок «Dual-API — compound <Accordion><AccordionItem>» (8 кейсов) + [AccordionItem.test.ts](../../lib/accordion/AccordionItem.test.ts) — green. Industry parallel: Element Plus `<el-collapse><el-collapse-item>`, PrimeVue `<Accordion><AccordionTab>`.

## ~~Issue 3: ARIA disclosure pattern не реализован~~ ✅ resolved 2026-05-11

- **Категория:** E29.1
- **Severity:** ~~high~~
- **Где:** ~~[Accordion.vue](../../lib/accordion/Accordion.vue)~~

### Что было сделано

1. Каждый header → `<button :id :aria-expanded="!!item.open" :aria-controls="panelId(key)">`.
2. Item content → `<div :id="panelId(key)" role="region" :aria-labelledby="headerId(key)">`.
3. Стабильные id-base через `useId()` (Vue 3.5+).

Тест-блок «Accessibility — disclosure pattern» / «links header to panel via aria-controls/aria-labelledby with stable ids» — green.

## ~~Issue 4: Keyboard navigation между items~~ ✅ resolved 2026-05-11

- **Категория:** E29.2
- **Severity:** ~~high~~

ArrowUp/Down/Home/End на root `<div data-accordion>` + roving tabindex на header'ах. После Arrow nav focus переходит на новый header через `headerRefs[focusedIndex].focus()`. `Tab`/непомеченные клавиши — не перехватываются.

Тесты «ArrowDown moves focus to next header», «ArrowUp …», «Home / End …», «roving tabindex», «exposes focus(index) helper», «non-handled keys are ignored» — green.

## ~~Issue 5: SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-06-14

- **Категория:** C17 / A2 / L53
- **Severity:** ~~high~~

### Что было сделано

- **SSR-стили (C17):** инжект через `Component.__hooks()` (`onServerPrefetch` + `onMounted`) — уже задействован в Accordion (без дублирующего `onMounted` в SFC). Стабильные ARIA-id через `useId()` (SSR-safe).
- **`unstyled` (L53):** guard в `Component.setStyle()` (Wave 3.1, 2026-05-11) применяется ко всем 22 компонентам — Accordion наследует.
- **`sideEffects` (A2):** [lib/accordion/package.json](../../lib/accordion/package.json) явно помечен `["**/*.css", "**/*.vue"]` (compound-bundle, зеркало `lib/menu/package.json`); dist-`exports`-карта генерируется `buildRootExports()`.

Cross-cutting часть (общий guard) исходно из [button.md Issue 1, 8, 9, 14](../button.md) / Wave 2 / Wave 3 — теперь подтверждена для Accordion локально.

## ~~Issue 6: Animation `animationDuration` блокирует unmount~~ ✅ resolved 2026-05-11

- **Категория:** H42
- **Severity:** ~~medium~~
- **Где:** ~~[Accordion.vue](../../lib/accordion/Accordion.vue)~~

### Что было сделано

Root обёрнут в `<Transition :css="false">` с JS `@leave` hook `onRootLeave(el, done) => setTimeout(done, animationDuration)`. Это держит панель смонтированной `animationDuration` ms после того, как внутренний `v-if="dataItems?.length"` стал false. Тест «renders <Transition> wrapper around root for unmount delay» — green.

Внимание: внешний `<Accordion v-if="show" />` на стороне consumer'а **не** защищается этой обёрткой — Vue unmount'ит компонент-инстанс целиком. Для этого сценария consumer оборачивает Accordion в собственный `<Transition>`.

## Issue 7: prefers-reduced-motion / RTL / colors / labels-i18n

Раздроблено по под-категориям; accordion-локальная часть закрыта 2026-06-14, остаётся только B10.

### ~~E29.7 — prefers-reduced-motion~~ ✅ resolved 2026-06-14

Все transition/animation-классы переведены на `motion-safe:` (`classSubtitle`, `styleIcon`, `classRect` в [Accordion.vue](../../lib/accordion/Accordion.vue)); `onRootLeave` под `prefers-reduced-motion: reduce` размонтирует панель мгновенно (без `setTimeout`). Тест-блок «A11y — motion-safe & RTL» — green.

### ~~F31 — RTL~~ ✅ resolved 2026-06-14

Логические утилиты: `text-left` → `text-start` (заголовок), `ml-8` → `ms-8` (иконки `styleIcon`/`classPlus`). Вертикальная keyboard-навигация (Arrow Up/Down/Home/End) направление-нейтральна — direction-aware изменения не требуются.

### ~~F30 — labels-i18n~~ N/A

У Accordion нет собственных статичных текстовых лейблов (весь текст приходит через `dataSource`/`<AccordionItem>` props или slots) — локализовать нечего.

### B10 — semantic tokens / high-contrast — **остаётся открытым**

- **Severity:** low
- **Статус:** deferred → **Wave 9** (semantic tokens + dark mode).
- Hardcoded `slate-*` (`text-slate-800`, `divide-slate-200`, `fill-slate-600` и т.д.) и отсутствие `forced-colors`/high-contrast outline. Решается скоординированно по всем 22 компонентам через расширение theme-engine (`bg-surface`/`border-border`/`text-foreground`), **не** accordion-локально. См. [issues/README.md](../README.md) Wave 9.

## ~~Issue 8: G34 — root element ref не экспонируется~~ ✅ resolved 2026-06-14

- **Категория:** G34
- **Severity:** ~~medium~~

### Что было сделано

Добавлен `rootRef: Ref<HTMLElement | null>` в [AccordionExpose](../../lib/accordion/Accordion.d.ts) — `ref` корневого `[data-accordion]` элемента (`null`, пока секций нет, т.к. root под `v-if`). Тест-блок «Expose — root element ref (G34)» — green.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Accordion` | ✅ | items, multiple, и др. |
| `componentsStyle` global | ✅ | fallback `options?.class*` в каждом `setStyle`-computed |
| `unstyled: true` | ✅ | guard в `Component.setStyle()` (Wave 3.1) — наследуется |
| Theme tokens vs hardcode | ⚠️ | B10 — deferred Wave 9 (см. Issue 7) |
| `t()` для текста | N/A | через items / `<AccordionItem>` props |

## Dual-API gap

~~См. Issue 2.~~ ✅ resolved 2026-06-14 — реализован compound `<Accordion><AccordionItem>` через VNode-walk.
