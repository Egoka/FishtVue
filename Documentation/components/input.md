---
title: Input
summary: Текстовый input с masks (phone/number/price), v-model, focus/blur/clear emits, валидацией; password toggle override, кастомные phoneFormats, auto-defaults autocomplete, motion-safe + print стили; unstyled-режим (cross-cutting guard).
updated: 2026-06-13
stability: stable
since: 0.2.11
---

# Input

## 1. Overview

`Input` — текстовое поле с поддержкой типов (`text`/`number`/`email`/`password`/`tel`/`url`/`search`), масок ввода (телефон/число/цена/custom), валидации через [rulesHandler](../utilities/rulesHandler.md), интеграции с [InputLayout](./input-layout.md) (label/help/error message). Реализует v-model contract FishtVue.

Дополнительно:

- fallback `mode` через глобальный `componentsStyle: "filled" | "outlined" | "underlined"` (см. [Configuration](../architecture/config.md));
- кастомные phone-форматы через `phoneFormats` (prop или `componentsOptions.Input`);
- автоподбор `autocomplete` по `type` (для password-manager совместимости);
- override класса password-toggle через `passwordToggleClass`;
- `motion-safe:` transitions (учитывает `prefers-reduced-motion`);
- `@media print` стили на input;
- argless `focus()` (паритет с `HTMLElement.focus()`).

Stability: `stable` (41 кейс; coverage `Input.vue` ≥ 97.89%).

Source: [Source](../../lib/input/Input.vue), [Input.d.ts](../../lib/input/Input.d.ts), [Input.test.ts](../../lib/input/Input.test.ts).

## 2. How it's organized

```
lib/input/
├── Input.vue         # SFC
├── Input.d.ts        # типы (включая InputType, InputAutocomplete, re-export PhoneFormat)
├── Input.test.ts     # 41 кейс (17 base + 24 audit)
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

`InputProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseInputProps>` ([Input.d.ts](../../lib/input/Input.d.ts)).

`BaseInputProps` (Partial поверх InputLayout):

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `InputType` = `"text" \| "number" \| "email" \| "password" \| "tel" \| "url" \| "search"` | `"text"` | HTML тип. Неизвестные значения молча fallback к `"text"`. |
| `autoFocus` | `boolean` | — | Фокус на mount. |
| `placeholder` | `string` | — | Native placeholder. |
| `autocomplete` | `InputAutocomplete` (WHATWG autofill tokens + `string`) | auto по `type` (см. ниже) | HTML autocomplete. |
| `maskInput` | `"phone" \| "number" \| "price" \| string` | — | Маска ввода. |
| `phoneFormats` | `PhoneFormat[]` | дефолтный набор (+1/+7/+81/+82/+86) | Кастомные phone-форматы для `maskInput: "phone"`. |
| `lengthInteger` | `number` | `20` | Макс длина целой части (для `number`/`price`). |
| `lengthDecimal` | `number` | `0` | Макс длина дробной. |
| `classInput` | `StyleClass` | — | Классы native `<input>`. |
| `passwordToggleClass` | `StyleClass` | — | Доп. класс для иконки toggle-пароля (Eye/EyeSlash). |

### 5.1 Autocomplete auto-defaults

Если `autocomplete` не задан явно (ни props, ни `componentsOptions.Input`), Input выбирает значение по `type`:

| `type` | default `autocomplete` |
|---|---|
| `password` | `"current-password"` |
| `email` | `"email"` |
| `tel` | `"tel"` |
| `url` | `"url"` |
| `text` / `number` / `search` | `"on"` |

Помогает password-managers (1Password, LastPass) и browser autofill попадать в правильные поля. Для регистрации задавай `autocomplete="new-password"` явно.

### 5.2 PhoneFormat

```ts
type PhoneFormat = {
  codeCountry: number  // e.g. 7, 1, 44
  mask: number[]       // длины групп цифр после кода страны: [3, 2, 2, 7] → (XXX) XX-XX-XXXX
  codeCity: number[]   // префиксы городских кодов (если нужны)
}
```

Дефолтный набор покрывает `+1` (US/CA), `+7` (RU/KZ), `+81` (JP), `+82` (KR), `+86` (CN) — см. [lib/utils/numberHandler.ts](../../lib/utils/numberHandler.ts).

Свои поля Input:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id `<input>`. |
| `modelValue` | `string \| number \| null \| undefined` | — | v-model. |

Поля `InputLayoutProps` (omit `value`, `isValue`) — см. [InputLayout](./input-layout.md): `label`, `help`, `mode`, `disabled`, `loading`, `isInvalid`, `messageInvalid`, `required`, и др.

> **`mode` fallback chain:** `props.mode → componentsOptions.Input.mode → Input.componentsStyle() → "outlined"`.
> Глобальный `componentsStyle: "filled"` в `app.use(FishtVue, ...)` теперь действительно влияет на Input (закрывает [issues/input.md Issue 2](../issues/input.md)).

## 6. Events / Emits + v-model contract

`InputEmits` ([Input.d.ts](../../lib/input/Input.d.ts)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `string` | На каждый native `input` event (печать, paste, маска). |
| `change:modelValue` | `string` | На native `change` event (blur с изменением). |
| `update:isInvalid` | `boolean` (всегда `false`) | На каждый input event — reset-сигнал. |
| `clear` | `string` (`""`) | На клик clear-кнопки. |
| `focus` | `FocusEvent` | На native focus (и при programmatic `focus(event)`). |
| `blur` | `FocusEvent` | На native blur. |
| `isActive` | `boolean` | При смене focus state. |

### 6.1 Timing — кто за чем эмитится

Каждое нажатие клавиши в input триггерит **в этом порядке**:

1. native `input` event → `inputEvent($event)` ([Input.vue:185](../../lib/input/Input.vue#L185))
2. `update:isInvalid(false)` — *reset-сигнал* (см. ниже) ([Input.vue:195](../../lib/input/Input.vue#L195))
3. `update:modelValue(value)` — синхронизация v-model ([Input.vue:196](../../lib/input/Input.vue#L196))

Native `change` event (blur с изменением) триггерит:

1. `change:modelValue(value)` ([Input.vue:199-201](../../lib/input/Input.vue#L199-L201))

### 6.2 Почему `update:isInvalid` всегда `false`

Input сам **не знает**, валидно ли значение — правила (`rules`) живут на стороне родителя ([Form](./form.md) или вручную). Поэтому Input эмитит `update:isInvalid(false)` как «новый ввод — пересчитай валидацию», а `true` ставит внешний код (родитель / Form / rulesHandler) через [InputLayoutProps.isInvalid](./input-layout.md).

Использование:

```vue
<Input
  v-model="email"
  :is-invalid="isInvalid"
  @update:is-invalid="(reset) => (isInvalid = reset ? isInvalid : false)" />
```

Или (типичнее) — отдай весь поток правил [Form](./form.md), он сделает это сам.

### 6.3 Когда нужен `change:modelValue` vs `update:modelValue`

| Сценарий | Используй |
|---|---|
| Live-фильтр / debounced server search | `update:modelValue` (+ debounce) |
| Реактивные computed зависят от значения | `update:modelValue` (через `v-model`) |
| Сохранение на бекенд при выходе из поля | `change:modelValue` |
| Heavy side-effect (PATCH, IndexedDB write) | `change:modelValue` |

**v-model contract**: стандартный `v-model` использует `update:modelValue`. `change:modelValue` — дополнительный канал для тяжёлых side-effect'ов.

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
| `focus(eventOrOptions?)` | `(FocusEvent \| FocusOptions)?` → `void` | Programmatic focus. Без аргумента — паритет с `HTMLElement.focus()`. С `FocusEvent` — режим template handler (эмитит `"focus"`). С `FocusOptions` — `{ preventScroll: true }`. |
| `blur(eventFocus?)` | function | Programmatic blur. Опциональный native `FocusEvent` — если передан, эмитится `"blur"`. |

### 8.1 Programmatic focus — примеры

```ts
import { useTemplateRef } from "vue"
import Input from "fishtvue/input"

const inp = useTemplateRef<InstanceType<typeof Input>>("inp")

// 1. Argless (типичный programmatic) — фокусирует input
inp.value?.focus()

// 2. С FocusOptions — без скролла к элементу
inp.value?.focus({ preventScroll: true })

// 3. С FocusEvent — режим template handler (внутренний путь @focus="focus")
inp.value?.focus(new FocusEvent("focus"))  // эмитит "focus"
```

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

`InputOption = Pick<InputProps, "classInput" | "passwordToggleClass" | "phoneFormats" | "autocomplete" | keyof InputLayoutOption>`. Включает все ключи [InputLayoutOption](./input-layout.md) + `classInput`, `passwordToggleClass`, `phoneFormats`, `autocomplete`.

```ts
app.use(FishtVue, {
  componentsOptions: {
    Input: {
      classInput: "tracking-wide",
      passwordToggleClass: "text-blue-500 hover:text-blue-700",
      autocomplete: "off",
      phoneFormats: [{ codeCountry: 44, mask: [4, 3, 3], codeCity: [] }]
    }
  },
  componentsStyle: "filled" // повлияет на Input.mode когда prop не задан
})
```

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
- `prefers-reduced-motion` учтён: все transitions завернуты в `motion-safe:`, при `@media (prefers-reduced-motion: reduce)` они отключаются автоматически.
- `@media print`: input получает контрастные `print:border print:border-black print:bg-white print:text-black print:shadow-none` для читабельной печати.
- Расширенный `type` union (`tel`/`url`/`search`) включает нативные mobile keyboards и clear-affordances.
- Автоподбор `autocomplete` по `type` помогает screen-reader'ам и password manager'ам корректно идентифицировать назначение поля.

### Security

- Не использует `v-html`.
- Маски не санитизируют user input — обрабатывают только цифры/символы. Для XSS-защиты при отображении введённых данных применяй sanitizer на стороне приложения.

## 13. TypeScript

```ts
import type {
  InputProps,
  InputEmits,
  InputExpose,
  BaseInputProps,
  InputType,
  InputAutocomplete,
  PhoneFormat
} from "fishtvue/input"
import Input from "fishtvue/input"
import { useTemplateRef } from "vue"

const inp = useTemplateRef<InstanceType<typeof Input>>("inp")
inp.value?.focus()                           // argless
inp.value?.focus({ preventScroll: true })   // с options
inp.value?.clear()

const ukFormat: PhoneFormat = { codeCountry: 44, mask: [4, 3, 3], codeCity: [] }
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 41 кейс, coverage `Input.vue` ≥ 97.89%.
- **Breaking changes:** на 2026-05-11 не зафиксировано. Расширение `type` / `autocomplete` union — additive (старые значения работают). `focus(eventFocus)` теперь принимает опциональный аргумент — `focus()` без аргументов не падает, старый код продолжает работать.
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
| Маска `"phone"` форматирует не под нужный регион | Дефолтный набор покрывает только `+1/+7/+81/+82/+86`. | Передай `:phone-formats="[{ codeCountry: 44, mask: [4,3,3], codeCity: [] }]"` или установи `componentsOptions.Input.phoneFormats` глобально. |
| `update:modelValue` не срабатывает на paste | По умолчанию обработчик слушает input event, paste тоже triggerит input. | Должно работать; проверь, не блокируется ли event `disabled` или `readonly`. |
| `clear()` сбрасывает в `""` вместо `null` | `clear` event payload — string. Если `modelValue` ожидает `null` — обработай в `@clear`. | На стороне родителя установи `null` явно. |
| Курсор прыгает при вводе с маской | Маска переписывает value → reset selection. | Сохрани `selectionStart` и восстанови; либо отключи маску для тех полей, где это критично. |
| `lengthDecimal: 2` не ограничивает | Возможно `maskInput` не задан. | Установи `mask-input="number"` или `"price"`. |
| Browser показывает «save password» для **обычного** поля | `autocomplete` по умолчанию для `type="text"` = `"on"`. | Задай `autocomplete="off"` явно или через `componentsOptions.Input`. |
| `update:isInvalid(true)` никогда не эмитится | Это by design: Input всегда эмитит `false` как reset; `true` ставит родитель/Form по результату `rules`. | См. §6.2. |

## 17. Related

- [InputLayout](./input-layout.md) — wrapper.
- [Label](./label.md), [Switch](./switch.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md).
- [Form](./form.md) — wrapper-валидатор.
- [utilities/numberHandler.md](../utilities/numberHandler.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Input.vue](../../lib/input/Input.vue) и [Input.d.ts](../../lib/input/Input.d.ts) не зафиксировано.

### Open audit issues

Все numbered audit-issues Input закрыты (см. [issues/input.md](../issues/input.md), матрица 0/0/0/0). Последними закрыты cross-cutting (2026-06-13):

- ~~**Issue 3** — sideEffects + exports map в `lib/package.json`~~ ✅ Wave 2.1 (`sideEffects: false` + build-генерируемая `exports` map).
- ~~**Issue 4** — `unstyled: true` guard в `Component.setStyle()`~~ ✅ Wave 3.1 ([component/index.ts:138](../../lib/component/index.ts#L138)).

Остаются deferred cross-cutting (вне матрицы, отдельные waves): runtime theme switch (Wave 3.3) и auto-binding `phoneFormats` к активной локали (см. [issues/input.md](../issues/input.md) Issue 7 deferred).

См. [Documentation/issues/README.md](../issues/README.md) roadmap.

### Skipped tests

Нет.

### API inconsistencies

- `maskInput: "phone" \| "number" \| "price" \| string` — open union: `string` нивелирует narrow.
- `modelValue?: string | number | null | undefined` ([Input.d.ts](../../lib/input/Input.d.ts)) — широкий union; для строгих type-narrow на стороне родителя — кастуй.
- Дубль defaults для `autoFocus`: явный `withDefaults` + явная computed-ветка с fallback'ом.
- Payload `update:modelValue` всегда `string`, даже при `type="number"` — преобразование на стороне родителя.
- `update:isInvalid` всегда эмитит `false` (по design — см. §6.2). Если в будущем добавим встроенные правила в Input, поведение поменяется (breaking — будет отмечено в CHANGELOG).

### Behavioral caveats

- При маске `"phone"` строка `+7 (999) 123-45-67` хранится в `modelValue` как есть — для отправки на бекенд распарсивай (`replace(/[^\d]/g, "")`).
- `autoFocus: true` срабатывает при mount; на повторных rerender'ах не возвращает фокус.
- `loading: true` blur-ирует input визуально, но не блокирует ввод — комбинируй с `disabled`.
- Сборки Tailwind без motion-safe variant (нестандартные пресеты) — transitions останутся применёнными независимо от `prefers-reduced-motion`. Стандартные пресеты Tailwind (v3+) поддерживают `motion-safe:` из коробки.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
