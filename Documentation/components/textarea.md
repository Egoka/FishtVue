---
title: Textarea
summary: Многострочный input (textarea-like) с InputLayout-обёрткой, validation, focus/blur events. С 1.0.0: `class` — корень `[data-textarea]`, контрол — `classes.control`, positive-булевы `invalid`/`clearable`, slot-props `invalid`/`focused`.
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Textarea

## 1. Overview

`Textarea` — компонент для многострочного ввода (textarea-семантика) с интеграцией [InputLayout](./input-layout.md). Поддерживает `wrap`-режимы, `rows`, `maxLength`, валидацию через [Form](./form.md) и [rulesHandler](../utilities/rulesHandler.md). Реализует v-model contract FishtVue.

Наименование «Textarea» восходит к семантике form-controls (как WAI-ARIA), но компонент — **не** общий a11y abstraction. Это конкретный textarea-аналог.

Stability: `stable` — 38 кейсов, coverage `Textarea.vue` 98.43%.

Source: [Source](../../lib/textarea/Textarea.vue), [Textarea.d.ts](../../lib/textarea/Textarea.d.ts), [Textarea.test.ts](../../lib/textarea/Textarea.test.ts).

## 2. How it's organized

```
lib/textarea/
├── Textarea.vue
├── Textarea.d.ts          # 305 строк
├── Textarea.test.ts       # 38 кейсов
└── package.json
```

Зависимости: [InputLayout](./input-layout.md), [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` ([component/index.ts:88-92](../../lib/component/index.ts#L88-L92)) сам регистрирует `onServerPrefetch + vueOnMounted → initStyle()` в конструкторе — никакого `onMounted(() => Textarea.initStyle())` в SFC.
- **Поток данных:** `modelValue` ↔ внутренний `<textarea>` value через v-model contract (4 шага, как в [dev-patterns §4](../dev-patterns.md#4-sfc-pattern)).
- **Стили:** `Textarea.resolveClasses<TextareaClassKey>(props)` — `cls("control", …)` для `<textarea>`, `mergeClasses` для семейных ключей, уходящих в `InputLayout` (dev-patterns §2 C–D, §4).
- **Конфиг:** `componentsOptions.Textarea` — см. §10.
- **Локализация:** через [InputLayout](./input-layout.md).
- **SSR:** SSR-safe.
- **Animation:** только transitions из [InputLayout](./input-layout.md).

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Textarea from "fishtvue/textarea"

const text = ref("")
</script>

<template>
  <Textarea v-model="text" label="Comment" :rows="4" />
</template>
```

## 5. Props

`TextareaProps extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseTextareaProps>` ([Textarea.d.ts:56-79](../../lib/textarea/Textarea.d.ts#L56-L79)).

`BaseTextareaProps` ([Textarea.d.ts:21-51](../../lib/textarea/Textarea.d.ts#L21-L51)) — переименован из `BaseAriaProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | `""` | Native placeholder. |
| `autocomplete` | `InputAutocomplete` (WHATWG-токены + `string`) | `"on"` | Native autocomplete. Тип расширен до общего с [Input](./input.md) — additive. |
| `wrap` | `"soft" \| "hard" \| "off"` | `"soft"` | Текст-wrap режим textarea. |
| `rows` | `number` | `3` | Видимое количество строк. |
| `maxLength` | `number` | `9999` | Макс. длина. |

Свои:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id `<textarea>`. |
| `modelValue` | `string \| null \| undefined` | — | v-model. Narrowed 2026-05-11: `number` removed (textarea не принимает числовой ввод). |
| `class` | `StyleClass` | — | Классы корня (он же корень `InputLayout`, `[data-textarea]`). |
| `classes` | `ClassesMap<TextareaClassKey>` | — | Карта классов внутренних элементов — см. §5.1. |

Поля `InputLayoutProps` (omit `value`, `hasValue`, `classes`) — см. [InputLayout §5](./input-layout.md#5-props): `label`, `labelMode`, `mode`, `invalid`, `messageInvalid`, `required`, `loading`, `disabled`, `help`, `clearable`, …

### 5.1 Classes keys

`TextareaClassKey = InputLayoutClassKey | "control"` ([Textarea.d.ts:19](../../lib/textarea/Textarea.d.ts#L19)).

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-textarea]` (корень layout'а) | element | `relative rounded-md` + фон режима |
| `base` | `[data-input-layout-base]` | element | рамка поля + `max-h-max` + focus-ring |
| `control` | `[data-textarea-control]` (`<textarea>`) | element | `w-full ring-0 border-0 … caret-theme-500` (бывший `classInput`) |
| `label` / `help` / `message` / `before` / `after` | см. [InputLayout §5.1](./input-layout.md) | element | — |
| `animation` | корень + `base` | **aspect** | `motion-safe:transition-all motion-safe:duration-550` (`""` отключает) |

`max-h-max` теперь отдельный класс в `classes.base`: раньше он склеивался с `props.class` без пробела и ломал последний класс потребителя.

## 6. Events / Emits + v-model contract

`TextareaEmits` ([Textarea.d.ts:111-149](../../lib/textarea/Textarea.d.ts#L111-L149)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `string` | На input event. |
| `update:invalid` | `boolean` (всегда `false`) | На каждый input event — reset-сигнал (`v-model:invalid`). |
| `change:modelValue` | `string` | На native `change` event textarea и при `clear()` (payload `""`). Fixed 2026-05-11 (раньше тип был ошибочно `boolean`). |
| `focus` | `FocusEvent` | На native focus. |
| `blur` | `FocusEvent` | На native blur. |

**v-model contract:** стандартный для FishtVue.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Контент textarea (редко используется). |
| `before` | `{ invalid: boolean; focused: boolean }` | Контент слева. С 1.0.0 slot-props positive: `isInvalid`/`isFocused` → `invalid`/`focused`. |
| `after` | `{ invalid: boolean; focused: boolean; clear: () => void }` | Контент справа — условная стилизация + вызов `clear()` изнутри slot-шаблона. |

```vue
<Textarea v-model="comment" :invalid="hasError" clearable>
  <template #after="{ invalid, focused, clear }">
    <button v-if="invalid" type="button" @click="clear">сбросить</button>
    <span v-else-if="focused" class="text-xs text-surface-500">{{ comment.length }} / 500</span>
  </template>
</Textarea>
```

## 8. Exposed methods

`TextareaExpose`:

| Name | Type | Description |
|---|---|---|
| `layout` | `InputLayoutExpose \| undefined` | Доступ к InputLayout. |
| `inputRef` | `HTMLElement \| undefined` | DOM-узел textarea. |
| `id`, `modelValue`, `placeholder`, `autocomplete`, `wrap`, `rows`, `maxLength`, `isValue`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `isClearable`, `messageInvalid` | derived | Computed. |
| `classControl` | `string` | Итоговый класс `<textarea data-textarea-control>`. |
| `inputLayout` | `Omit<InputLayoutProps, "value">` | Итоговый hand-off в `InputLayout` (заменил `classStyle`/`classLayout`). |
| `clear()` | function | Очистить значение и сбросить invalid state. |
| `focus(env)` | function | Программный focus. |
| `blur(env)` | function | Программный blur. |

## 9. Examples

### 9.1 Базовый

```vue
<Textarea v-model="comment" label="Comment" :rows="3" :max-length="500" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Textarea: { mode: "outlined", rows: 4, wrap: "soft" }
  }
})
```

### 9.3 В Form

```vue
<Form :structure="[
  { fields: [
    { name: 'feedback', typeField: 'Textarea', label: 'Feedback', rows: 5, rules: [{ type: 'required' }] }
  ]}
]" v-model:form-fields="values" />
```

(Note: проверь, регистрирует ли Form тип `"Textarea"` для своего FieldType union — может потребоваться custom field или Input.)

### 9.4 С Pinia

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Textarea from "fishtvue/textarea"
import { useDraftStore } from "@/stores/draft"

const store = useDraftStore()
const { content } = storeToRefs(store)
</script>

<template>
  <Textarea
    v-model="content"
    label="Draft content"
    :rows="10"
    @blur="() => store.persist({ content })" />
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`TextareaOption = Pick<TextareaProps, "autocomplete" | "wrap" | "rows" | "maxLength" | "class" | "classes" | keyof InputLayoutOption>` ([Textarea.d.ts:292-295](../../lib/textarea/Textarea.d.ts#L292-L295)). Карта `classes` сливается с props по ключу (dev-patterns §2 C).

`mode` определяется через стандартный fallback chain — `props.mode ?? componentsOptions.Textarea.mode ?? Textarea.componentsStyle() ?? "outlined"` ([Textarea.vue:52-54](../../lib/textarea/Textarea.vue#L52-L54)). Установка глобального `componentsStyle: "filled"` через `FishtVue` plugin автоматически меняет `mode` в Textarea, если он не задан per-instance.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Через [InputLayout](./input-layout.md) + native textarea стили.

### 10.4 CSS layer override

Root класс — `fv fishtvue-aria`.

## 11. Form integration & validation

- Поддержка через v-model + rules.
- `messageInvalid` отображается через [InputLayout](./input-layout.md).
- Reset — `modelValue: ""`.

## 12. Accessibility & Security

### A11y

- Корневой `<textarea>` — нативные семантика и keyboard.
- `aria-describedby` для error — управляется [InputLayout](./input-layout.md).
- `aria-required` через `required` prop.
- `placeholder:transition-all` обёрнут в `motion-safe:` ([Textarea.vue:66](../../lib/textarea/Textarea.vue#L66)) — Tailwind транспилирует это в `@media (prefers-reduced-motion: no-preference)`, поэтому пользователи с настройкой `reduce` не видят анимации placeholder'а. WCAG 2.3.3.
- `print:*` классы ([Textarea.vue:69](../../lib/textarea/Textarea.vue#L69)) гарантируют читаемое отображение textarea при печати (`bg-white text-black border-black`, без теней).

### Security

- Не рендерит HTML из props.

#### `maxLength` — ограничение только на клиенте

`maxLength` пробрасывается в нативный атрибут `<textarea maxlength>`. Это **UX-ограничение, а не проверка**: браузер не даст набрать больше символов, но атрибут снимается через DevTools за пару секунд, и при native form submit на сервер приедет строка любой длины.

Трактуй его как подсказку пользователю, а не как гарантию. Реальное ограничение нужно ставить в двух местах:

```ts
// 1) клиентское правило — чтобы пользователь увидел ошибку в форме, а не после отправки
const rules = [{ type: "length", max: 500 }]

// 2) серверная валидация — единственное, на что можно полагаться
```

Правило `length` из [rulesHandler](../utilities/rulesHandler.md) отработает и при вставке из буфера, и при программной установке `modelValue` — то есть в случаях, где нативный `maxlength` молчит.

## 13. TypeScript

```ts
import type { TextareaProps, TextareaEmits, TextareaExpose, TextareaClassKey, BaseTextareaProps } from "fishtvue/textarea"
import Textarea from "fishtvue/textarea"
import { useTemplateRef } from "vue"

const a = useTemplateRef<InstanceType<typeof Textarea>>("a")
a.value?.focus(new FocusEvent("focus"))
a.value?.clear()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 38 кейсов, coverage 98.43%.
- **Breaking changes (1.0.0, редизайн props):**
  - `classInput` → `classes.control`; `classBody` → `class` (корень), прежний `class` → `classes.base`.
  - тип `BaseAriaProps` → `BaseTextareaProps`; `autocomplete` расширен до `InputAutocomplete` (additive).
  - булевы: `isInvalid` → `invalid`, `clear` → `clearable`; slot-props `isInvalid`/`isFocused` → `invalid`/`focused`.
  - emit `update:isInvalid` → `update:invalid` (silent break).
  - `data-textarea` на корне, `<textarea>` помечен `data-textarea-control`.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Textarea from "fishtvue/textarea/Textarea.vue"

describe("Textarea", () => {
  it("emits update:modelValue", async () => {
    const wrapper = mount(Textarea, {
      global: { plugins: [[FishtVue, {}]] }
    })
    await wrapper.find("textarea").setValue("hello")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
  })
})
```

Реальные тесты — [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) (38 кейсов, включая блок «Props 1.0 — class / classes / булевы / emits»).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Высота не реагирует на rows | CSS-override родительского `height`. | Снять `height` или передавать `class` явно. |
| `wrap: "off"` создаёт горизонтальный scroll | By design — soft-wrap отключён. | Используй `wrap: "soft"` для wrap при overflow. |
| `maxLength` не enforce'ится при paste | Native поведение зависит от браузера. | Дополнительная проверка на input handler. |
| Form не распознаёт `typeField: "Textarea"` | Возможно тип не зарегистрирован. | Проверь FieldType в [Form.d.ts](../../lib/form/Form.d.ts). |

## 17. Related

- [InputLayout](./input-layout.md) — обёртка.
- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md) — соседние form-controls.
- [Form](./form.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Textarea.vue](../../lib/textarea/Textarea.vue) и [Textarea.d.ts](../../lib/textarea/Textarea.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 98.43% statements / 87.5% branch (на момент 2026-05-11 — после close-out увеличится; пересчитать `pnpm coverage`).

### Skipped tests

Нет.

### API inconsistencies

- Имя «Textarea» вводит в заблуждение — компонент не общая a11y abstraction, а textarea-аналог. Tracked в [Documentation/issues/textarea.md](../issues/textarea.md) Issue 6 — переименование в `Textarea` отложено в отдельный breaking-change PR.

### Resolved 2026-05-11

- ~~`change:modelValue(payload: boolean)` type bug~~ — исправлено: payload теперь `string` ([Textarea.d.ts:134](../../lib/textarea/Textarea.d.ts#L134)). Cross-cutting fix также в TextEditor.
- ~~`modelValue?: string | number | null | undefined`~~ — narrowed до `string | null | undefined`.
- ~~Дубль `onMounted(() => Textarea.initStyle())`~~ — удалён, остался только `Component.__hooks()`-канон.
- ~~`mode` не учитывает `Textarea.componentsStyle()`~~ — добавлен fallback chain.
- ~~Slots `before` / `after` без типизированного контекста~~ — добавлены `{ invalid, focused, clear }` (positive-имена с 1.0.0).
- ~~`placeholder:transition-all` без `motion-safe:`~~ — обёрнут в `motion-safe:`.
- ~~Нет print styles~~ — добавлены `print:*` классы в `classes.control`.

### Behavioral caveats

- При `maxLength` + paste — браузер обрезает paste до лимита по умолчанию (нативно).
- `rows` влияет только на initial height — пользователь может resize'нуть native textarea handle (если CSS не запрещает).
- `wrap: "hard"` добавляет реальные `\n` в значение при wrap'е — отличается от `"soft"` (только визуально).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
