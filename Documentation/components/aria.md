---
title: Aria
summary: Многострочный input (textarea-like) с InputLayout-обёрткой, validation, focus/blur events.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Aria

## 1. Overview

`Aria` — компонент для многострочного ввода (textarea-семантика) с интеграцией [InputLayout](./input-layout.md). Поддерживает `wrap`-режимы, `rows`, `maxLength`, валидацию через [Form](./form.md) и [rulesHandler](../utilities/rulesHandler.md). Реализует v-model contract FishtVue.

Наименование «Aria» восходит к семантике form-controls (как WAI-ARIA), но компонент — **не** общий a11y abstraction. Это конкретный textarea-аналог.

Stability: `stable` — 9 кейсов, coverage `Aria.vue` 98.43%.

Source: [Source](../../lib/aria/Aria.vue), [Aria.d.ts](../../lib/aria/Aria.d.ts), [Aria.test.ts](../../lib/aria/Aria.test.ts).

## 2. How it's organized

```
lib/aria/
├── Aria.vue
├── Aria.d.ts          # 255 строк
├── Aria.test.ts       # 9 кейсов
└── package.json
```

Зависимости: [InputLayout](./input-layout.md), [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для подключения focus/blur listener'ов.
- **Поток данных:** `modelValue` ↔ внутренний `<textarea>` value через v-model contract (4 шага, как в [dev-patterns §4](../dev-patterns.md#4-sfc-pattern)).
- **Стили:** `Aria.setStyle()` для контейнера и textarea.
- **Конфиг:** `componentsOptions.Aria` — см. §10.
- **Локализация:** через [InputLayout](./input-layout.md).
- **SSR:** SSR-safe.
- **Animation:** только transitions из [InputLayout](./input-layout.md).

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Aria from "fishtvue/aria"

const text = ref("")
</script>

<template>
  <Aria v-model="text" label="Comment" :rows="4" />
</template>
```

## 5. Props

`AriaProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseAriaProps>` ([Aria.d.ts:55–67](../../lib/aria/Aria.d.ts#L55-L67)).

`BaseAriaProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | — | Native placeholder. |
| `autocomplete` | `"on" \| "off"` | — | Native autocomplete. |
| `wrap` | `"soft" \| "hard" \| "off"` | — | Текст-wrap режим textarea. |
| `rows` | `number` | — | Видимое количество строк. |
| `maxLength` | `number` | — | Макс. длина. |
| `classInput` | `StyleClass` | — | Класс textarea. |

Свои:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id `<textarea>`. |
| `modelValue` | `string \| number \| null \| undefined` | — | v-model. |

Поля `InputLayoutProps` — см. [InputLayout §5](./input-layout.md#5-props).

## 6. Events / Emits + v-model contract

`AriaEmits` ([Aria.d.ts:77–112](../../lib/aria/Aria.d.ts#L77-L112)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `string` | На input event. |
| `update:isInvalid` | `boolean` | На смену состояния валидации. |
| `change:modelValue` | `boolean` | **Type bug** — должно быть `string`. См. Known issues. |
| `focus` | `FocusEvent` | На native focus. |
| `blur` | `FocusEvent` | На native blur. |

**v-model contract:** стандартный для FishtVue.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Контент textarea (редко используется). |
| `before` | — | Контент слева. |
| `after` | — | Контент справа. |

## 8. Exposed methods

`AriaExpose`:

| Name | Type | Description |
|---|---|---|
| `layout` | `InputLayoutExpose \| undefined` | Доступ к InputLayout. |
| `inputRef` | `HTMLElement \| undefined` | DOM-узел textarea. |
| `id`, `modelValue`, `placeholder`, `autocomplete`, `wrap`, `rows`, `maxLength`, `isValue`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `messageInvalid`, `classStyle` | derived | Computed. |
| `clear()` | function | Очистить значение и сбросить invalid state. |
| `focus(env)` | function | Программный focus. |
| `blur(env)` | function | Программный blur. |

## 9. Examples

### 9.1 Базовый

```vue
<Aria v-model="comment" label="Comment" :rows="3" :max-length="500" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Aria: { mode: "outlined", rows: 4, wrap: "soft" }
  }
})
```

### 9.3 В Form

```vue
<Form :structure="[
  { fields: [
    { name: 'feedback', typeField: 'Aria', label: 'Feedback', rows: 5, rules: [{ type: 'required' }] }
  ]}
]" v-model:form-fields="values" />
```

(Note: проверь, регистрирует ли Form тип `"Aria"` для своего FieldType union — может потребоваться custom field или Input.)

### 9.4 С Pinia

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Aria from "fishtvue/aria"
import { useDraftStore } from "@/stores/draft"

const store = useDraftStore()
const { content } = storeToRefs(store)
</script>

<template>
  <Aria
    v-model="content"
    label="Draft content"
    :rows="10"
    @blur="() => store.persist({ content })" />
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`AriaOption = Pick<AriaProps, "autocomplete" | "wrap" | "rows" | "maxLength" | "classInput" | keyof InputLayoutOption>`.

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
- `prefers-reduced-motion` не учтён.

### Security

- Не рендерит HTML из props.
- `maxLength` ограничивает только client-side; для надёжности дублируй на server.

## 13. TypeScript

```ts
import type { AriaProps, AriaEmits, AriaExpose, BaseAriaProps } from "fishtvue/aria"
import Aria from "fishtvue/aria"
import { useTemplateRef } from "vue"

const a = useTemplateRef<InstanceType<typeof Aria>>("a")
a.value?.focus(new FocusEvent("focus"))
a.value?.clear()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 9 кейсов, coverage 98.43%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Aria from "fishtvue/aria/Aria.vue"

describe("Aria", () => {
  it("emits update:modelValue", async () => {
    const wrapper = mount(Aria, {
      global: { plugins: [[FishtVue, {}]] }
    })
    await wrapper.find("textarea").setValue("hello")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
  })
})
```

Реальные тесты — [Aria.test.ts](../../lib/aria/Aria.test.ts) (9 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Высота не реагирует на rows | CSS-override родительского `height`. | Снять `height` или передавать `class` явно. |
| `wrap: "off"` создаёт горизонтальный scroll | By design — soft-wrap отключён. | Используй `wrap: "soft"` для wrap при overflow. |
| `change:modelValue` приходит с `boolean` | Type bug — реальный payload — `string`. | Используй runtime; type — игнорировать. См. Known issues. |
| `maxLength` не enforce'ится при paste | Native поведение зависит от браузера. | Дополнительная проверка на input handler. |
| Form не распознаёт `typeField: "Aria"` | Возможно тип не зарегистрирован. | Проверь FieldType в [Form.d.ts](../../lib/form/Form.d.ts). |

## 17. Related

- [InputLayout](./input-layout.md) — обёртка.
- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md) — соседние form-controls.
- [Form](./form.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Aria.vue](../../lib/aria/Aria.vue) и [Aria.d.ts](../../lib/aria/Aria.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 98.43% statements / 87.5% branch — одна строка ([Aria.vue:178](../../lib/aria/Aria.vue#L178)) не покрыта тестами.

### Skipped tests

Нет.

### API inconsistencies

- **Type bug:** `change:modelValue(payload: boolean)` ([Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97)) — должен быть `string`. Аналогичный bug есть в [TextEditor](./text-editor.md).
- `modelValue?: string | number | null | undefined` — `number` для текста странно.
- Имя «Aria» вводит в заблуждение — компонент не общая a11y abstraction, а textarea-аналог.

### Behavioral caveats

- При `maxLength` + paste — браузер обрезает paste до лимита по умолчанию (нативно).
- `rows` влияет только на initial height — пользователь может resize'нуть native textarea handle (если CSS не запрещает).
- `wrap: "hard"` добавляет реальные `\n` в значение при wrap'е — отличается от `"soft"` (только визуально).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
