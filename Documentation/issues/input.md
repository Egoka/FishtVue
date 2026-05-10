---
title: Issues — Input
summary: Аудит Input — SSR-стили, no componentsStyle global fallback, type union без narrowing, hardcoded eye-icon classes.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/input/
related-doc: ../components/input.md
---

# Issues — Input

## Сводка

| Severity | Count | Categories              |
| -------- | ----- | ----------------------- |
| critical | 0     | —                       |
| high     | 4     | A2, A4-5, C17, L53      |
| medium   | 5     | B10, F31, F32, M56, D26 |
| low      | 3     | E29.7, G34, N59         |

## Issue 1: Стили SSR не инжектятся

- **Категория:** C17
- **Severity:** high
- **Где:** [Input.vue:120-125](../../lib/input/Input.vue#L120-L125)

См. [button.md Issue 1](./button.md). Также `inputRef.value?.focus()` через autoFocus — должно быть после mount, но при SSR это не проблема (focus delegated to client).

## Issue 2: Нет componentsStyle global fallback для mode

- **Категория:** L53
- **Severity:** high
- **Где:** [Input.vue:42](../../lib/input/Input.vue#L42)

### Что найдено

```ts
const mode = computed(() => props.mode ?? options?.mode ?? "outlined")
```

В отличие от Switch ([Switch.vue:31](../../lib/switch/Switch.vue#L31)) и Label, Input НЕ вызывает `Input.componentsStyle()` для fallback к глобальному `componentsStyle: "filled" | "outlined" | "underlined"`.

### Почему это проблема

- Documentation [docs/content/ru/3.Configuration/1.Options.md](../../docs/content/ru/3.Configuration/1.Options.md) обещает `componentsStyle` управляет ВСЕМИ компонентами.
- Inconsistency среди form-controls: Switch/Label реагируют, Input — нет.

### Что нужно сделать

1. В [Input.vue:42](../../lib/input/Input.vue#L42):
   ```ts
   const mode = computed(() => props.mode ?? options?.mode ?? Input.componentsStyle() ?? "outlined")
   ```
2. Аналогично — для Aria.vue:49, Select, TextEditor.
3. Cross-cutting тест: переключение global `componentsStyle: "filled"` влияет на Input.mode.

### Acceptance criteria

- [ ] `app.use(FishtVue, { componentsStyle: "filled" })` + `<Input />` без `mode` prop — рендерится как filled.

## Issue 3: Нет sideEffects/exports map (cross-cutting)

- **Категория:** A2, A4, A5
- **Severity:** high

См. [button.md Issue 8 и Issue 9](./button.md).

## Issue 4: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 5: Eye/EyeSlash иконки имеют хардкоден class — нельзя перебить

- **Категория:** B10 (hardcode)
- **Severity:** medium
- **Где:** [Input.vue:213-224](../../lib/input/Input.vue#L213-L224)

### Что найдено

```vue
<Icons
  v-if="type === 'password' && privateType === 'password'"
  data-eye-slash
  type="EyeSlash"
  class="text-gray-400 dark:text-gray-600 hover:text-cyan-500 hover:dark:text-cyan-700 transition cursor-pointer"
  @click="privateType = 'text'" />
```

Класс `text-cyan-500` хардкоден внутри template — пользователь не может изменить через `componentsOptions.Input` или theme tokens.

### Что нужно сделать

1. Вынести class в `Input.setStyle([...])` через computed.
2. Добавить опцию `passwordToggleClass?: StyleClass` в InputProps.
3. Использовать semantic token: `hover:text-accent-foreground`.

### Acceptance criteria

- [ ] `<Input :password-toggle-class="'text-blue-500'">` перебивает дефолт.

## Issue 6: `arrayInputType` ограничен — нет `tel`, `url`, `search`, `date`

- **Категория:** D25 (консистентность props), M54 (native form)
- **Severity:** medium
- **Где:** [Input.vue:31](../../lib/input/Input.vue#L31), [Input.vue:34-38](../../lib/input/Input.vue#L34-L38)

### Что найдено

```ts
const arrayInputType: Array<InputProps["type"]> = ["text", "number", "email", "password"]
const type = computed(
  () =>
    props?.type && arrayInputType.find((i) => i === props.type)
      ? (props.type as "text" | "number" | "email" | "password")
      : "text" // fallback
)
```

Если пользователь передаст `type="tel"` или `type="search"`, компонент молча fallback к `"text"`. Native input semantics теряются (mobile не покажет тёмную клавиатуру для tel, не будет clear-button для search).

### Что нужно сделать

1. Расширить allowed types: `["text", "number", "email", "password", "tel", "url", "search"]`.
2. Если `mask: "phone"` — auto-set `type="tel"` для лучшего UX на mobile.
3. Документировать в [Documentation/components/input.md](../components/input.md) §5.

### Acceptance criteria

- [ ] `<Input type="tel" />` рендерит `<input type="tel">`.

## Issue 7: `mask: "phone"` не уважает локаль

- **Категория:** F32 (Date/number locale)
- **Severity:** medium
- **Где:** [Input.vue:143](../../lib/input/Input.vue#L143), [lib/utils/numberHandler.ts](../../lib/utils/numberHandler.ts)

### Что найдено

`convertToPhone(baseValue)` использует hardcoded маску (по коду — российская +7 (XXX) XXX-XX-XX). Не учитывает текущую locale.

### Почему это проблема

- US-пользователь введёт `+1 555-123-4567` → mask наложит +7-формат.
- Documentation [docs/content/ru/3.Configuration/3.Internationalization.md](../../docs/content/ru/3.Configuration/3.Internationalization.md) обещает интернационализацию, но phone mask её игнорирует.

### Что нужно сделать

1. Добавить параметр `convertToPhone(value, locale)` в [numberHandler.ts](../../lib/utils/numberHandler.ts).
2. Подключить к `setActiveLocale` через FishtVue context.
3. Использовать `libphonenumber-js` (peerDependency) или предоставить mask-templates per-locale.
4. Альтернатива — позволить пользователю задать `:mask-pattern="+1 (xxx) xxx-xxxx"`.

### Acceptance criteria

- [ ] `setActiveLocale("en")` — phone mask использует US-формат.
- [ ] Per-instance `:mask-pattern` перебивает.

## Issue 8: Browser autocomplete конфликтует с password manager

- **Категория:** M56 (Browser autocomplete)
- **Severity:** medium
- **Где:** [Input.vue:46-48](../../lib/input/Input.vue#L46-L48), [Input.vue:197](../../lib/input/Input.vue#L197)

### Что найдено

```ts
const autocomplete = computed(() => props?.autocomplete ?? "on")
```

Default `autocomplete="on"` для всех типов, включая password. Browser password managers (1Password, LastPass, browser-built) лучше работают с конкретными значениями: `autocomplete="current-password"`, `new-password`, `email`, `tel`, `cc-number`.

### Что нужно сделать

1. Расширить тип `autocomplete?: HTMLInputElement["autocomplete"] | string` (vs `"on" | "off"` сейчас).
2. Auto-detect разумные defaults: `type="password"` → suggest `current-password` (с warning если не указано), `type="email"` → `email`.
3. Документировать [полный список autocomplete-значений](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete).

### Acceptance criteria

- [ ] `<Input type="password" autocomplete="new-password" />` корректно работает с менеджерами паролей.

## Issue 9: Нет prefers-reduced-motion guard

- **Категория:** E29.7
- **Severity:** low

См. [done/button.md Issue 10](./done/button.md) — там готовый pattern. Input.vue имеет `transition-all` на classBaseInput.

## Issue 10: `inputRef` exposed, но нет `focus()` метода с argless вариантом

- **Категория:** G34 / D24
- **Severity:** low
- **Где:** [Input.vue:175](../../lib/input/Input.vue#L175)

### Что найдено

```ts
function focus(eventFocus: FocusEvent) { inputRef.value?.focus(); ... }
```

Метод `focus(event: FocusEvent)` требует FocusEvent аргумент. Для programmatic focus (`useTemplateRef.value.focus()`) пользователь должен сконструировать event:

```ts
input.value?.focus(new FocusEvent("focus"))
```

Это контр-интуитивно. Нативный `HTMLElement.focus()` без аргументов.

### Что нужно сделать

1. Сделать `event` опциональным: `function focus(event?: FocusEvent)`.
2. Для emit `"focus"` event — если event не передан, не эмитить (или сконструировать сами).
3. Cross-cutting — Aria.vue, Select имеют ту же проблему.

### Acceptance criteria

- [ ] `useTemplateRef<typeof Input>("i").value?.focus()` без аргументов фокусирует input.

## Issue 11: print styles отсутствуют

- **Категория:** N59
- **Severity:** low

См. [button.md Issue 15](./button.md).

## Issue 12: RTL — `caret-theme-500`, padding hardcode

- **Категория:** F31
- **Severity:** medium
- **Где:** [Input.vue:60-67](../../lib/input/Input.vue#L60-L67)

### Что найдено

`caret-theme-500` — каретка цвета, OK. Но `eye`/`eye-slash` иконки в `<template #after>` всегда в конце input — в RTL окажутся слева, что вообще-то OK (они визуально остаются «после input»). Но click-area проверить.

### Что нужно сделать

Тест с `dir="rtl"` — eye-icon кликабелен, layout не ломается.

## Issue 13: Дубликат семантики `update:modelValue` + `change:modelValue` + `update:isInvalid`

- **Категория:** D26
- **Severity:** medium
- **Где:** [Input.vue:160-166](../../lib/input/Input.vue#L160-L166)

### Что найдено

При каждом input-event эмитятся:

- `update:isInvalid(false)` — сброс
- `update:modelValue(value)` — sync v-model
- `change:modelValue(value)` — final value (на change-event ещё раз)

Это inconsistency: `update:isInvalid` всегда `false`, `change:modelValue` дублирует `update:modelValue` но с другим timing. Vue native: `input` → `update:modelValue`, `change` → дополнительно. Здесь два custom event перемешаны.

### Что нужно сделать

1. Документировать timing в [Documentation/components/input.md](../components/input.md) §6 явно — кто за чем эмитится.
2. Решить — нужен ли `change:modelValue` если есть native `change` event? Возможно убрать как дубль.
3. `update:isInvalid` — почему всегда false? Если идея — "сбрасывать invalid при печатании", переименовать в `reset:invalid` или эмитить только при transition true→false.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                               |
| ------------------------- | ----------- | --------------------------------------------------------- |
| `componentsOptions.Input` | ✅          | mode/clear/class/classInput                               |
| `componentsStyle` global  | ❌          | Issue 2 — нет fallback                                    |
| `unstyled: true`          | ❌          | Issue 4                                                   |
| Theme tokens vs hardcode  | ⚠️          | caret-theme-500 — design token; gray-_, cyan-_ — hardcode |
| Runtime theme switch      | ⚠️          | theme-tokens OK, остальное — Tailwind                     |
| `t()` для текста          | N/A         | placeholder/label — пользовательские                      |
| Runtime locale switch     | ❌          | phone mask не уважает locale (Issue 7)                    |
| Fallback на defaultLocale | N/A         | —                                                         |

## Dual-API gap

Не применимо — Input не collection-component.
