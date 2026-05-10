---
title: InputLayout
summary: Контейнер-обёртка для form-controls — label, error, help, clear/copy кнопки.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# InputLayout

## 1. Overview

`InputLayout` — внутренняя обёртка для всех form-controls. Содержит `Label`, error-message, help-text, опциональные copy/clear-кнопки. Используется внутри [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md). `InputLayoutProps` — родительский тип для всех form-controls (через `Omit<InputLayoutProps, "value" | "isValue">`).

Stability: `stable` — 24 кейса, coverage 89.91%.

Source: [Source](../../lib/inputlayout/InputLayout.vue), [InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts), [InputLayout.test.ts](../../lib/inputlayout/InputLayout.test.ts).

## 2. How it's organized

```
lib/inputlayout/
├── InputLayout.vue
├── InputLayout.d.ts        # 316 строк
├── InputLayout.test.ts     # 24 кейса
└── package.json
```

Зависимости: [Label](./label.md), [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md). Внешних — нет, кроме `navigator.clipboard` для copy.

## 3. How it works

- **Lifecycle:** Component инжекция стилей; `onMounted` для `headerHeight = document.querySelector("header")?.offsetHeight` (для float-label позиционирования) и copy-handler.
- **Поток данных:** props → computed states → slot rendering. `value`/`isValue` управляют отображением label dynamic states.
- **Стили:** `InputLayout.setStyle()` интенсивно.
- **Конфиг:** `componentsOptions.InputLayout` — см. §10.
- **Локализация:** `InputLayout.t("clear")`, `InputLayout.t("copy")`.
- **SSR:** `document.querySelector` в `onMounted` — guard'ится самим Vue lifecycle (server не вызывает `onMounted`). `navigator.clipboard.writeText` — только клиент.
- **Animation:** CSS transitions ("transition-all duration-550", "transition ease-in duration-200").

## 4. Quick Start

```vue
<script setup lang="ts">
import InputLayout from "fishtvue/inputlayout"
</script>

<template>
  <InputLayout
    :value="text"
    label="Custom field"
    :is-value="!!text"
    :clear="true"
    @clear="text = ''">
    <input v-model="text" />
  </InputLayout>
</template>
```

(Чаще всего InputLayout используется внутри других компонентов — самостоятельный rendering нужен только для custom form-controls.)

## 5. Props

`InputLayoutProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `any` | — | Текущее значение (для отображения dynamic-label). **Обязателен**. |
| `isValue` | `boolean` | — | Есть ли значение (для label-стейта). |
| `mode` | `StyleMode` (`"filled" \| "outlined" \| "underlined"`) | — | Визуальный режим. |
| `label` | `string` | — | Текст label. |
| `labelMode` | `LabelMode` | — | Режим label (`dynamic`/`static`/...). |
| `isInvalid` | `boolean` | — | Состояние ошибки. |
| `messageInvalid` | `string` | — | Сообщение ошибки. |
| `required` | `boolean` | — | Required-маркер. |
| `loading` | `boolean` | — | Loading-индикатор. |
| `disabled` | `boolean` | — | Disabled. |
| `help` | `string` | — | Help-text. |
| `clear` | `boolean` | — | Показать clear-кнопку. |
| `width` / `height` | `TWidth` / `THeight` | — | Размеры. |
| `animation` | `string` | `"transition-all duration-500"` | CSS animation. |
| `classBody` | `StyleClass` | (preset) | Класс тела. |
| `class` | `StyleClass` | — | Класс контейнера. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `clear` | — | На клик clear-кнопки. |

v-model: не применимо — InputLayout не имеет собственного value, только отображает.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Сам input/select/calendar — основной element. |
| `before` | — | Контент перед input. |
| `after` | — | Контент после input. |
| `body` | — | Полный override body (вместо default). |

## 8. Exposed methods

`InputLayoutExpose`:

| Name | Type | Description |
|---|---|---|
| `input`, `inputBody`, `beforeInput`, `afterInput` | `HTMLElement \| undefined` | DOM-refs. |
| `headerHeight` | `number` | Высота `<header>` (для расчёта float-label). |
| `isCopy` | `boolean` | Состояние copy-confirmation. |
| `beforeWidth`, `afterWidth` | `number \| null` | Ширины before/after слотов. |
| `value`, `isValue`, `mode`, `label`, `labelMode`, `labelType`, `isRequired`, `isLoading`, `isDisabled`, `isInvalid`, `messageInvalid`, `help`, `width`, `height`, `animation`, `class`, `classBody` | derived | Computed. |
| `copy()` | `() => void` | Копирует значение в clipboard. |

## 9. Examples

### 9.1 Стандартное использование (внутри другого компонента)

[Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md) уже оборачивают InputLayout автоматически — самостоятельная инстанциация нужна только для custom-полей.

### 9.2 Custom form-control

```vue
<script setup lang="ts">
import { ref } from "vue"
import InputLayout from "fishtvue/inputlayout"

const value = ref("")
</script>

<template>
  <InputLayout
    :value="value"
    :is-value="!!value"
    label="Custom"
    mode="outlined"
    :clear="true"
    @clear="value = ''">
    <textarea v-model="value" rows="3" />
  </InputLayout>
</template>
```

### 9.3 С ошибкой

```vue
<InputLayout
  :value="value"
  :is-value="!!value"
  :is-invalid="true"
  message-invalid="This field is required"
  label="Email">
  <input v-model="value" type="email" />
</InputLayout>
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    InputLayout: { mode: "outlined", labelMode: "dynamic", animation: "transition-all duration-300" }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

`InputLayoutOption = Pick<InputLayoutProps, "mode" | "labelMode" | "clear" | "width" | "height" | "animation" | "classBody" | "class">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Mode-зависимые стили (filled/outlined/underlined).

### 10.4 CSS layer override

Root класс — `fv fishtvue-input-layout`.

## 11. Form integration & validation

Это сам form-контейнер. Проп `isInvalid`/`messageInvalid` отображает ошибку. Обычно эти props приходят из родительского form-control (Input, Select, ...) или [Form](./form.md).

## 12. Accessibility & Security

### A11y

- Связь Label ↔ input — управляется родительским form-control'ом (передаёт `id` в slot).
- `aria-describedby` для error-message — реализация в шаблоне.
- Clear/copy кнопки — `<button>` с tooltip через [FixWindow](./fix-window.md).

### Security

- `navigator.clipboard.writeText(value)` — копирует значение в системный clipboard. Не используется для security-чувствительных данных по умолчанию (учитывай при работе с password).

## 13. TypeScript

```ts
import type { InputLayoutProps, InputLayoutEmits, InputLayoutExpose } from "fishtvue/inputlayout"
import InputLayout from "fishtvue/inputlayout"
```

`InputLayoutProps` — родитель для всех form-controls. См. [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md): они расширяют `Omit<InputLayoutProps, "value" | "isValue">`.

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 24 кейса, coverage 89.91%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import InputLayout from "fishtvue/inputlayout/InputLayout.vue"

describe("InputLayout", () => {
  it("emits clear", async () => {
    const wrapper = mount(InputLayout, {
      props: { value: "x", isValue: true, clear: true },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [InputLayout.test.ts](../../lib/inputlayout/InputLayout.test.ts) (24 кейса).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Floating label не двигается | `value` не обновляется или `isValue: false`. | Передавай `:is-value="!!value"`. |
| `headerHeight` всегда 0 | Нет `<header>` в DOM или вне body. | Не критично — используется только для специфичных layouts. |
| Copy кнопка не копирует | Нет `navigator.clipboard` (HTTP, без HTTPS). | Используй на HTTPS или localhost. |
| Stop showing tooltip | FixWindow обёртка в copy/clear иногда виснет на безопасных движениях. | Проверь [FixWindow](./fix-window.md) issues. |
| Custom form-controls не используют style — только разметка | Body-slot не передан или default-slot пустой. | Передай `<input>`/`<textarea>` в default. |

## 17. Related

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md), [Form](./form.md) — потребители.
- [Label](./label.md), [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md) — composed.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) и [InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 89.91% statements / 75.16% branch — ветви ([InputLayout.vue:198–199, 207, 221](../../lib/inputlayout/InputLayout.vue#L198-L199)) не покрыты.

### Skipped tests

Нет.

### API inconsistencies

- `value: any` — обязательный prop с `any`-типом. Type-system теряет связь со значением child-input'а.
- `beforeWidth: number | null` / `afterWidth: number | null` ([InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts)) — реально инициализируются как `0`, не `null`. Type не совпадает с runtime.
- `animation: "transition-all duration-500" | "transition-none" | string` — open union с literals.
- `classBody: StyleClass | "mb-6 rounded-md"` — литерал среди StyleClass.

### Behavioral caveats

- Copy-функционал использует `navigator.clipboard` — недоступно на HTTP (только HTTPS/localhost).
- Tooltip'ы для copy/clear через [FixWindow](./fix-window.md) — наследуют все его SSR-проблемы (см. соответствующий документ).
- `headerHeight` — расчёт через `document.querySelector("header")` — если приложение не имеет `<header>`, этот pollyfill даёт 0; не критично.
- При `clear: true` без `default-slot` clear-кнопка появляется, но не имеет к чему привязаться.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
