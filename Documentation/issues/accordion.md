---
title: Issues — Accordion
summary: Аудит Accordion — XSS через item.subtitle v-html, schema-driven only (нет compound), нет ARIA disclosure pattern, нет keyboard navigation.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/accordion/
related-doc: ../components/accordion.md
---

# Issues — Accordion

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | C13 (v-html в item.subtitle) |
| high | 5 | A2, A4-5, C17, E29.1, E29.2, P (dual-API) |
| medium | 3 | F31, G34, H42 |
| low | 3 | E29.7, B10, F30 |

## Issue 1: CRITICAL — XSS через `item.subtitle` v-html

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Accordion.vue:149](../../lib/accordion/Accordion.vue#L149)

### Что найдено

```vue
<p v-else :class="classNotTemplate" v-html="item.subtitle" />
```

### Что нужно сделать

См. [select.md Issue 1](./select.md) — slot вместо v-html. `<template #subtitle="{ item }">{{ item.subtitle }}</template>`.

## Issue 2: Dual-API gap — нет compound `<Accordion><AccordionItem>`

- **Категория:** P
- **Severity:** high
- **Где:** [Accordion.d.ts](../../lib/accordion/Accordion.d.ts)

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

См. [table.md Issue 3](./table.md) — параллельный fix через provide/inject. Industry parallel: Element Plus `<el-collapse><el-collapse-item>`, PrimeVue `<Accordion><AccordionTab>`.

## Issue 3: ARIA disclosure pattern не реализован

- **Категория:** E29.1
- **Severity:** high
- **Где:** [Accordion.vue](../../lib/accordion/Accordion.vue)

### Что нужно сделать

1. Каждый item header → `<button :aria-expanded="isOpen" :aria-controls="contentId">`.
2. Item content → `<div :id="contentId" role="region" :aria-labelledby="headerId">`.
3. Roving tabindex для keyboard navigation.

## Issue 4: Keyboard navigation между items

- **Категория:** E29.2
- **Severity:** high

ArrowDown/ArrowUp между header'ами accordion items. См. [menu.md Issue 3](./menu.md) — аналогичный pattern.

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 6: Animation `animationDuration` блокирует unmount

- **Категория:** H42
- **Severity:** medium
- **Где:** [Accordion.vue](../../lib/accordion/Accordion.vue)

### Что найдено

`animationDuration` (collapse/expand) реализован через CSS transition. Если parent v-if'ится во время collapse-анимации — DOM unmount'ится прежде чем transition завершится → flash.

### Что нужно сделать

1. Использовать `<TransitionGroup>` или `<Transition>` обёртку с `@after-leave` callback.
2. Или защитить unmount через `onAfterLeave` — отложить v-if removal до after-transition.

## Issue 7: prefers-reduced-motion / RTL / colors / labels-i18n

Cross-cutting. См. [button.md](./button.md), [menu.md Issue 7](./menu.md).

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
