---
title: InputLayout
summary: Контейнер-обёртка для form-controls — label, error, help, clear/copy кнопки.
updated: 2026-06-19
stability: stable
since: 0.2.11
---

# InputLayout

## 1. Overview

`InputLayout` — внутренняя обёртка для всех form-controls. Содержит `Label`, error-message, help-text, опциональные copy/clear-кнопки. Используется внутри [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md). `InputLayoutProps` — родительский тип для всех form-controls (через `Omit<InputLayoutProps, "value" | "isValue">`).

Stability: `stable` — 47 кейсов.

Source: [Source](../../lib/inputlayout/InputLayout.vue), [InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts), [InputLayout.test.ts](../../lib/inputlayout/InputLayout.test.ts).

## 2. How it's organized

```
lib/inputlayout/
├── InputLayout.vue
├── InputLayout.d.ts        # 316 строк
├── InputLayout.test.ts     # 47 кейсов
└── package.json
```

Зависимости: [Label](./label.md), [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md). Внешних — нет, кроме `navigator.clipboard` для copy.

## 3. How it works

- **Lifecycle:** Component инжекция стилей; `onMounted` для `ResizeObserver`-инициализации (`beforeInput`/`afterInput`/`inputBody`) и резолва `headerHeight` через prop `offsetTop` (см. §5). `onUnmounted` дисконнектит все три observer'а — нет утечек.
- **Поток данных:** props → computed states → slot rendering. `value`/`isValue` управляют отображением label dynamic states.
- **Стили:** `InputLayout.setStyle()` интенсивно.
- **Конфиг:** `componentsOptions.InputLayout` — см. §10.
- **Локализация:** `InputLayout.t("clear")`, `InputLayout.t("copy")`, `InputLayout.t("inputLayout.copied")` (confirm после copy).
- **SSR:** все DOM-доступы guard'ятся `isClient()`. `headerHeight` синхронно резолвится из `offsetTop` prop ещё до mount — без coupling с потребительской разметкой (`<header>`). `navigator.clipboard.writeText` — feature-detect + fallback на `document.execCommand("copy")` через скрытый `<textarea>`.
- **Animation:** все transitions обёрнуты в `motion-safe:` (`motion-safe:transition-all motion-safe:duration-550` для root, `motion-safe:transition motion-safe:ease-in motion-safe:duration-200` для loading/clear `<transition>`-блоков) — при `prefers-reduced-motion: reduce` анимации отключаются. Inline-классы шаблона зарегистрированы явно через module-scope `InputLayout.setStyle`.
- **Print / high-contrast:** style-for-print (`print:border print:bg-white print:text-black print:shadow-none` на `classBody` — печатается монохромным, не `display:none`); `forced-colors:outline` на поле (`classBase`) — граница видима в Windows high-contrast.
- **Unstyled:** при `app.use(FishtVue, { unstyled: true })` корень `[data-input-layout]` и все вложенные классы пусты (cross-cutting guard `Component.setStyle()`).

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
| `id` | `string` | (auto `useId()`) | Id slotted-контрола. Если не передан — генерируется стабильный SSR-safe id. Прокидывается в default-слот (`scope.id`) и связывает `<label for>` / `aria-labelledby` (см. §12 A11y). |
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
| `offsetTop` | `number \| string \| (() => number)` | `0` | Вертикальный offset для `scroll-margin-top` invalid-региона (sticky-header awareness). Заменил hardcoded `document.querySelector("header")` — потребитель явно передаёт значение / геттер. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `clear` | — | На клик clear-кнопки. |

v-model: не применимо — InputLayout не имеет собственного value, только отображает.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | `{ id: string; labelledby?: string }` | Сам input/select/calendar — основной element. `id` — стабильный id контрола (бинди на `id` → `<label for>` срабатывает); `labelledby` — id `<Label>` (или `undefined` без `label`), для non-labelable триггеров бинди на `aria-labelledby`. |
| `before` | — | Контент перед input. |
| `after` | — | Контент после input. |
| `body` | — | Полный override body (вместо default). |
| `help` | — | Override для содержимого help-tooltip'а. Если не передан — рендерится `help` prop как text-node (XSS-safe). См. §12 Security. |
| `messageInvalid` | — | Override для содержимого error-tooltip'а (FixWindow). Если не передан — рендерится `messageInvalid` prop как text-node. Корневой `<p data-input-layout-message-invalid>` под input'ом всегда показывает `messageInvalid` текстом + имеет `aria-live="assertive"`. |

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
    <!-- scoped default slot отдаёт id (для <label for>) и labelledby (для aria-labelledby) -->
    <template #default="{ id }">
      <textarea :id="id" v-model="value" rows="3" />
    </template>
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

`InputLayoutOption = Pick<InputLayoutProps, "mode" | "labelMode" | "clear" | "width" | "height" | "animation" | "classBody" | "class" | "offsetTop">`.

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

- **Связь Label ↔ control (WCAG 1.3.1 / 3.3.2 / 4.1.2).** InputLayout — single source of truth: генерит стабильный id (`useId()`, либо `id` prop) и раздаёт его. `<Label :for-id="fieldId" :id="labelId">`, а default-слот scoped — `<slot :id="fieldId" :labelledby="labelId" />`. Потребитель биндит `scope.id` на контрол: для нативных `<input>`/`<textarea>` (Input/Aria) этого достаточно — клик по метке фокусирует контрол через `<label for>`. Для non-labelable триггеров (Select/Calendar/TextEditor `<div>`) дополнительно биндится `:aria-labelledby="scope.labelledby"` → screen reader озвучивает метку. См. [Issue 10 inputlayout.md](../issues/inputlayout.md).
- **Error-region** `<p data-input-layout-message-invalid>` имеет `aria-live="assertive"` + `aria-atomic="true"` — screen reader озвучивает появление / изменение `messageInvalid` сразу.
- Clear/copy кнопки — `<button>` с tooltip через [FixWindow](./fix-window.md). После успешного copy — confirm-icon с `aria-label` и FixWindow tooltip, локализованные через `InputLayout.t("inputLayout.copied")` (`"Copied"` / `"Скопировано"`).
- **Reduced motion:** все transitions через `motion-safe:` — при `prefers-reduced-motion: reduce` поле и иконки не анимируются.
- **Forced colors:** `forced-colors:outline` на поле сохраняет видимую границу в Windows high-contrast (где `border-*`/`bg-*` сбрасываются).

### Security

- **XSS-safe рендер `help` / `messageInvalid`.** Props рендерятся как text-node через `{{ }}`-интерполяцию (slot fallback `<span data-input-layout-help-text>` / `<span data-input-layout-message-invalid-text>`). HTML возможен **только** через явный `<template #help>` / `<template #messageInvalid>` — потребитель сам отвечает за санитизацию ввода (`DOMPurify` и т.п.). См. [Issue 1 inputlayout.md](../issues/inputlayout.md). Это закрывает cross-cutting XSS-канал во всех 5 form-controls (Input/Aria/Select/Calendar/TextEditor), которые пробрасывали server-validation HTML в `messageInvalid`.
- **Clipboard.** `copy()` использует feature-detect (`navigator.clipboard.writeText`); при отсутствии API или TypeError (HTTP, iframe-sandbox, permission-denied) — fallback на `document.execCommand("copy")` через скрытый `<textarea>`. SSR-safe: операции guard'ятся `isClient()`. Не используется для security-чувствительных данных по умолчанию (учитывай при работе с password).

## 13. TypeScript

```ts
import type { InputLayoutProps, InputLayoutEmits, InputLayoutExpose } from "fishtvue/inputlayout"
import InputLayout from "fishtvue/inputlayout"
```

`InputLayoutProps` — родитель для всех form-controls. См. [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md): они расширяют `Omit<InputLayoutProps, "value" | "isValue">`.

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 47 кейсов.
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

Реальные тесты — [InputLayout.test.ts](../../lib/inputlayout/InputLayout.test.ts) (47 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Floating label не двигается | `value` не обновляется или `isValue: false`. | Передавай `:is-value="!!value"`. |
| `headerHeight` всегда 0 | Не передан `offsetTop` prop / опция. | Передай `:offset-top="80"` (или функцию `() => stickyHeader.offsetHeight`) — компонент больше не делает hardcoded поиск `<header>`. |
| Copy кнопка не копирует | Нет `navigator.clipboard` (HTTP без HTTPS) и `document.execCommand("copy")` тоже недоступен. | На HTTPS / localhost — работает clipboard API; на HTTP — fallback через `execCommand`; в SSR — no-op без падения. Если нужен custom-copy, override через `defineExpose`-метод компонента-обёртки. |
| HTML внутри help / messageInvalid не рендерится | По умолчанию props рендерятся как text (XSS-safe). | Передай через slot: `<template #help><strong>...</strong></template>` (потребитель отвечает за санитизацию). |
| Stop showing tooltip | FixWindow обёртка в copy/clear иногда виснет на безопасных движениях. | Проверь [FixWindow](./fix-window.md) issues. |
| Custom form-controls не используют style — только разметка | Body-slot не передан или default-slot пустой. | Передай `<input>`/`<textarea>` в default. |

## 17. Related

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md), [Form](./form.md) — потребители.
- [Label](./label.md), [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md) — composed.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) и [InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Все numbered issues закрыты ([issues/inputlayout.md](../issues/inputlayout.md): Issues 1–8 ✅). Остаётся cross-cutting residual: полная shadcn-style миграция структурных нейтралей (`gray-*`/`neutral-*`/`stone-*`) на semantic-токены (`bg-surface`/`border-border`) — трекается [theme.md](../issues/theme.md) / Wave 9. `forced-colors:outline` (high-contrast видимость) уже добавлен.

### Skipped tests

Нет.

### API inconsistencies

- `value: any` — обязательный prop с `any`-типом. Type-system теряет связь со значением child-input'а.
- `beforeWidth: number | null` / `afterWidth: number | null` ([InputLayout.d.ts](../../lib/inputlayout/InputLayout.d.ts)) — реально инициализируются как `0`, не `null`. Type не совпадает с runtime.
- `animation: "transition-all duration-500" | "transition-none" | string` — open union с literals.
- `classBody: StyleClass | "mb-6 rounded-md"` — литерал среди StyleClass.

### Behavioral caveats

- Copy-функционал использует `navigator.clipboard` с feature-detect; при недоступности (HTTP, iframe-sandbox, permission-denied) — fallback на `document.execCommand("copy")` через скрытый `<textarea>`. SSR — no-op без падения.
- Tooltip'ы для copy/clear через [FixWindow](./fix-window.md) — наследуют все его SSR-проблемы (см. соответствующий документ).
- `headerHeight` резолвится из prop `offsetTop` (`number | string | () => number`) — без coupling с разметкой потребителя. По умолчанию `0`.
- При `clear: true` без `default-slot` clear-кнопка появляется, но не имеет к чему привязаться.
- Слоты `help` / `messageInvalid` рендерят пользовательский content «как есть» — потребитель отвечает за санитизацию (DOMPurify и т.п.) при передаче server-данных в slot.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
