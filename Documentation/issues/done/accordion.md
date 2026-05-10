---
title: Issues — Accordion
summary: Аудит Accordion — XSS / ARIA / keyboard / animation закрыты 2026-05-11. Остаются (cross-cutting, отслеживаются глобально): dual-API gap (Wave 6.5), SSR/sideEffects/unstyled (Wave 2/3), RTL/prefers-reduced-motion/labels-i18n (Wave 8/9/10).
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/accordion/
related-doc: ../../components/accordion.md
---

# Issues — Accordion

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | ~~C13~~ ✅ |
| high | 3 | P (dual-API), C17, E29.1/29.2 ✅ partially |
| medium | 2 | F31, G34 |
| low | 3 | E29.7, B10, F30 |

**Закрыто 2026-05-11** в `fix(accordion): close XSS in subtitle, add WAI-ARIA disclosure + keyboard nav, transition unmount`: Issues 1 (critical), 3 (high), 4 (high), 6 (medium). Подробности — в зачёркнутых блоках ниже.

## ~~Issue 1: CRITICAL — XSS через `item.subtitle` v-html~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~
- **Где:** ~~[Accordion.vue:149](../../../lib/accordion/Accordion.vue#L149)~~

### ~~Что найдено~~

```vue
<p v-else :class="classNotTemplate" v-html="item.subtitle" />
```

### Что было сделано

Заменено на `<slot name="item-subtitle">` с safe text-default. Consumer opt-in к custom HTML через override slot'а. Тест-блок «Security — XSS in subtitle» проверяет, что payload `<img src=x onerror=alert(1)>` рендерится как plain text.

## Issue 2: Dual-API gap — нет compound `<Accordion><AccordionItem>`

- **Категория:** P
- **Severity:** high
- **Где:** [Accordion.d.ts](../../../lib/accordion/Accordion.d.ts)

### Что найдено

API через `:items` массив:
```vue
<Accordion :items="[
  { title: 'Section 1', subtitle: 'Description', content: 'Content...' },
  ...
]" />
```

Compound вариант:
```vue
<Accordion>
  <AccordionItem title="Section 1" subtitle="Description">
    <RichContent />
  </AccordionItem>
  <AccordionItem title="Section 2">
    <NestedComponent />
  </AccordionItem>
</Accordion>
```

### Что нужно сделать

См. [table.md Issue 3](../table.md) — параллельный fix через provide/inject. Industry parallel: Element Plus `<el-collapse><el-collapse-item>`, PrimeVue `<Accordion><AccordionTab>`.

## ~~Issue 3: ARIA disclosure pattern не реализован~~ ✅ resolved 2026-05-11

- **Категория:** E29.1
- **Severity:** ~~high~~
- **Где:** ~~[Accordion.vue](../../../lib/accordion/Accordion.vue)~~

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

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](../button.md). **Cross-cutting**, не accordion-локально. Делается одним патчем для 22 SFC в Wave 2 / Wave 3 (см. [issues/README.md](../README.md)).

## ~~Issue 6: Animation `animationDuration` блокирует unmount~~ ✅ resolved 2026-05-11

- **Категория:** H42
- **Severity:** ~~medium~~
- **Где:** ~~[Accordion.vue](../../../lib/accordion/Accordion.vue)~~

### Что было сделано

Root обёрнут в `<Transition :css="false">` с JS `@leave` hook `onRootLeave(el, done) => setTimeout(done, animationDuration)`. Это держит панель смонтированной `animationDuration` ms после того, как внутренний `v-if="dataItems?.length"` стал false. Тест «renders <Transition> wrapper around root for unmount delay» — green.

Внимание: внешний `<Accordion v-if="show" />` на стороне consumer'а **не** защищается этой обёрткой — Vue unmount'ит компонент-инстанс целиком. Для этого сценария consumer оборачивает Accordion в собственный `<Transition>`.

## Issue 7: prefers-reduced-motion / RTL / colors / labels-i18n

Cross-cutting. См. [button.md](../button.md), [menu.md Issue 7](../menu.md), Wave 8/9/10.1.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Accordion` | ✅ | items, multiple, и др. |
| `componentsStyle` global | ⚠️ | проверить наличие fallback |
| `unstyled: true` | ❌ | cross-cutting |
| Theme tokens vs hardcode | ⚠️ | частично |
| `t()` для текста | N/A | через items |

## Dual-API gap

См. Issue 2. Один из ключевых dual-API кандидатов.
