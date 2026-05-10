---
title: Input
summary: Текстовый input с masks (phone/number/price), v-model, focus/blur/clear emits, валидацией.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Input

## 1. Overview

`Input` — текстовое поле с поддержкой типов (`text`/`number`/`email`/`password`), масок ввода (телефон/число/цена/custom), валидации через [rulesHandler](../utilities/rulesHandler.md), интеграции с [InputLayout](./input-layout.md) (label/help/error message). Реализует v-model contract FishtVue.

Stability: `stable` (17 кейсов; coverage `Input.vue` 97.89%).

Source: [Source](../../lib/input/Input.vue), [Input.d.ts](../../lib/input/Input.d.ts), [Input.test.ts](../../lib/input/Input.test.ts).

## 2. How it's organized

```
lib/input/
├── Input.vue         # SFC
├── Input.d.ts        # 311 строк
├── Input.test.ts     # 17 кейсов
└── package.json
```

Зависимости:
- [InputLayout](./input-layout.md) — для отрисовки label/help/messages.
- [numberHandler](../utilities/numberHandler.md) — `toPhone`, `toNumber`, `convertToNumber`, `convertToPhone` для масок.
- [Component class](../architecture/component-class.md).

Внешних зависимостей нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `watch` синхронизирует props ↔ внутренний `value`.
- **Поток данных:** `modelValue` → внутренний reactive value → mask-обработка через `numberHandler` → emits.
- **v-model contract:**
  1. native `input` event,
  2. `update:modelValue` (синхронизация v-model),
  3. parent watcher'ы,
  4. `change:modelValue` после flush.
- **Стили:** через `Input.setStyle()` в computed.
- **Конфиг:** `componentsOptions.Input` — `classInput` + ключи `InputLayoutOption`.
- **Локализация:** через [InputLayout](./input-layout.md).
- **SSR:** SSR-safe.
- **Animation:** transition only через стили InputLayout.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Input from "fishtvue/input"

const value = ref("")
</script>

<template>
  <Input v-model="value" label="Name" placeholder="Enter your name" />
</template>
```

## 5. Props

`InputProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseInputProps>` ([Input.d.ts:70](../../lib/input/Input.d.ts#L70)).

`BaseInputProps` (Partial поверх InputLayout):

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"text" \| "number" \| "email" \| "password"` | `"text"` | HTML тип. |
| `autoFocus` | `boolean` | — | Фокус на mount. |
| `placeholder` | `string` | — | Native placeholder. |
| `autocomplete` | `"on" \| "off"` | — | HTML autocomplete. |
| `maskInput` | `"phone" \| "number" \| "price" \| string` | — | Маска ввода. |
| `lengthInteger` | `number` | — | Макс длина целой части (для `number`/`price`). |
| `lengthDecimal` | `number` | — | Макс длина дробной. |
| `classInput` | `StyleClass` | — | Классы native `<input>`. |

Свои поля Input:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id `<input>`. |
| `modelValue` | `string \| number \| null \| undefined` | — | v-model. |

Поля `InputLayoutProps` (omit `value`, `isValue`) — см. [InputLayout](./input-layout.md): `label`, `help`, `mode`, `disabled`, `loading`, `isInvalid`, `messageInvalid`, `required`, и др.

## 6. Events / Emits + v-model contract

`InputEmits` ([Input.d.ts](../../lib/input/Input.d.ts)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `string` | На каждый input event. |
| `change:modelValue` | `string` | После reactivity flush — для тяжёлых side-effect'ов. |
| `update:isInvalid` | `boolean` | При изменении статуса валидации (через rules). |
| `clear` | `string` | На клик clear-кнопки. Payload — текущее значение перед очисткой. |
| `focus` | `FocusEvent` | На native focus. |
| `blur` | `FocusEvent` | На native blur. |
| `isActive` | `boolean` | True/false при активности. |

**v-model contract**: `update:modelValue` для непрерывного отслеживания, `change:modelValue` для server sync.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива `<input>` content (редко используется). |
| `before` | — | Контент слева от input. |
| `after` | — | Контент справа от input. |

## 8. Exposed methods

`InputExpose`:

| Name | Type | Description |
|---|---|---|
| `layout` | InputLayout instance | Доступ к layout-обёртке. |
| `isActiveInput` | `boolean` | Текущий focus state. |
| `classLayout` | `StyleClass` | Класс layout. |
| `id`, `type`, `mask`, `modelValue`, `autoFocus`, `placeholder`, `autocomplete`, `lengthInteger`, `lengthDecimal`, `isValue`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `messageInvalid`, `classBaseInput` | derivative props | Computed, видимые наружу. |
| `toMask(baseValue)` | function | Применяет маску к значению. |
| `inputModelValue(valueResult)` | function | Программный update. |
| `changeModelValue(valueResult)` | function | Программный change. |
| `clear()` | `() => void` | Очищает значение и emit-ит `clear`. |
| `focus(eventFocus)` | function | Программный focus. |
| `blur(eventFocus)` | function | Программный blur. |

## 9. Examples

### 9.1 Базовый

```vue
<Input v-model="name" label="Name" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Input: { mode: "outlined", classInput: "tracking-wide" }
  }
})
```

### 9.3 Маска для телефона

```vue
<Input v-model="phone" mask-input="phone" placeholder="+7 (___) ___-__-__" />
```

### 9.4 С Pinia store + change-event

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Input from "fishtvue/input"
import { useUserStore } from "@/stores/user"

const store = useUserStore()
const { email } = storeToRefs(store)
</script>

<template>
  <Input
    v-model="email"
    label="Email"
    type="email"
    @change:model-value="(v) => store.persist({ email: v })" />
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`InputOption = Pick<InputProps, "classInput" | keyof InputLayoutOption>`. Включает все ключи [InputLayoutOption](./input-layout.md) + `classInput`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвета active/invalid состояний — через `theme.semantic`. Dark mode классы внутри встроены.

### 10.4 CSS layer override

Root класс — `fv fishtvue-input`. См. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override).

## 11. Form integration & validation

- Полностью поддерживается внутри [Form](./form.md).
- Через rules (см. [rulesHandler](../utilities/rulesHandler.md)):

```vue
<Input
  v-model="email"
  :rules="[{ type: 'required' }, { type: 'email' }]"
  label="Email" />
```

- Состояние invalid отображается через `isInvalid`/`messageInvalid` (передаются через [InputLayout](./input-layout.md)).
- При reset формы родитель сбрасывает modelValue, Input реагирует автоматически.

## 12. Accessibility & Security

### A11y

- Корневой `<input>` — нативные семантика и keyboard.
- `disabled`/`required` нативные.
- Связь label ↔ input через `id` — обеспечена при использовании [InputLayout](./input-layout.md).
- Error-сообщения через `aria-describedby` — реализация в InputLayout.
- `prefers-reduced-motion` не учтён.

### Security

- Не использует `v-html`.
- Маски не санитизируют user input — обрабатывают только цифры/символы. Для XSS-защиты при отображении введённых данных применяй sanitizer на стороне приложения.

## 13. TypeScript

```ts
import type { InputProps, InputEmits, InputExpose, BaseInputProps } from "fishtvue/input"
import Input from "fishtvue/input"
import { useTemplateRef } from "vue"

const inp = useTemplateRef<InstanceType<typeof Input>>("inp")
inp.value?.focus()
inp.value?.clear()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 17 кейсов, coverage 97.89%.
- **Breaking changes:** на 2026-05-09 не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Input from "fishtvue/input/Input.vue"

describe("Input", () => {
  it("emits update:modelValue on input", async () => {
    const wrapper = mount(Input, {
      global: { plugins: [[FishtVue, {}]] }
    })
    await wrapper.find("input").setValue("hello")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
  })
})
```

Реальные тесты — [Input.test.ts](../../lib/input/Input.test.ts) (17 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Маска `"phone"` форматирует не RU | `convertToPhone` рассчитан на +7. | Передай `maskInput: string` со своим custom-форматом. |
| `update:modelValue` не срабатывает на paste | По умолчанию обработчик слушает input event, paste тоже triggerит input. | Должно работать; проверь, не блокируется ли event `disabled` или `readonly`. |
| `clear()` сбрасывает в `""` вместо `null` | `clear` event payload — string. Если `modelValue` ожидает `null` — обработай в `@clear`. | На стороне родителя установи `null` явно. |
| Курсор прыгает при вводе с маской | Маска переписывает value → reset selection. | Сохрани `selectionStart` и восстанови; либо отключи маску для тех полей, где это критично. |
| `lengthDecimal: 2` не ограничивает | Возможно `maskInput` не задан. | Установи `mask-input="number"` или `"price"`. |

## 17. Related

- [InputLayout](./input-layout.md) — wrapper.
- [Label](./label.md), [Switch](./switch.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md).
- [Form](./form.md) — wrapper-валидатор.
- [utilities/numberHandler.md](../utilities/numberHandler.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Input.vue](../../lib/input/Input.vue) и [Input.d.ts](../../lib/input/Input.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 97.89% — одна строка ([Input.vue:203](../../lib/input/Input.vue#L203)) не покрыта тестами.

### Skipped tests

Нет.

### API inconsistencies

- `maskInput: "phone" \| "number" \| "price" \| string` — open union: `string` нивелирует narrow.
- `modelValue?: string | number | null | undefined` ([Input.d.ts](../../lib/input/Input.d.ts)) — широкий union; для строгих type-narrow на стороне родителя — кастуй.
- Дубль defaults для `autoFocus`: явный `withDefaults` + явная computed-ветка с fallback'ом.
- Payload `update:modelValue` всегда `string`, даже при `type="number"` — преобразование на стороне родителя.

### Behavioral caveats

- При маске `"phone"` строка `+7 (999) 123-45-67` хранится в `modelValue` как есть — для отправки на бекенд распарсивай (`replace(/[^\d]/g, "")`).
- `autoFocus: true` срабатывает при mount; на повторных rerender'ах не возвращает фокус.
- `loading: true` blur-ирует input визуально, но не блокирует ввод — комбинируй с `disabled`.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
