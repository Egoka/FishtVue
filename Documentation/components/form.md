---
title: Form
summary: Динамическая форма из FormStructure ИЛИ compound `<Form><FormSection><FormField>`. Валидация в трёх режимах, поля Input/Select/Calendar/TextEditor/Switch/Custom + произвольные через `registerFieldType`. Native submit + FormData. Validation messages локализуются через активную локаль.
updated: 2026-06-13
stability: stable
since: 0.2.11
---

# Form

## 1. Overview

`Form` — оркестратор формы из декларативной `FormStructure`. Поддерживает поля типов `Input`, `Select`, `Calendar`, `TextEditor`, `Switch`, `Custom` (через slot). Валидация в режимах `onSubmit`/`onChange`/`onInput`. Использует [rulesHandler](../utilities/rulesHandler.md).

Stability: `stable` — 58 кейсов, coverage `Form.vue` 91.41%.

Source: [Source](../../lib/form/Form.vue), [Form.d.ts](../../lib/form/Form.d.ts), [Form.test.ts](../../lib/form/Form.test.ts).

## 2. How it's organized

```
lib/form/
├── Form.vue
├── Form.d.ts          # типы Form + FormField/FormSection + FieldRegistered
├── FormField.vue      # renderless descriptor (compound API)
├── FormSection.vue    # renderless descriptor (compound API)
├── fieldRegistry.ts   # registerFieldType / getFieldType / hasFieldType
├── index.ts           # runtime barrel (form.mjs entry: default Form + named дети + registry)
├── Form.test.ts
└── package.json
```

Зависимости: [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md), [Button](./button.md), [Aria](./aria.md). [rulesHandler](../utilities/rulesHandler.md), [objectHandler](../utilities/objectHandler.md), [functionHandler](../utilities/functionHandler.md), [domHandler.isClient](../utilities/domHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для инициализации значений.
- **Поток данных:** `structure` → массив FormStructure → массив Field per type → значение пишется в `formFields` reactive map → emits `update:formFields`. Submit → валидация всех полей → emit `submit`.
- **Validation:**
  - `modeValidate: "onSubmit"` — только при submit.
  - `modeValidate: "onChange"` — на change-event.
  - `modeValidate: "onInput"` — на каждый input.
- **Стили:** через `Form.setStyle()`.
- **Конфиг:** `componentsOptions.Form` — см. §10.
- **Локализация:** через `Form.t("save")`, `Form.t("requiredField")`. Default validation-messages (email/phone/numeric/regular/range/length/async/custom/compare) локализуются через `setDefaultRuleMessages()` — см. §11.
- **SSR:** `isClient()` guard в нескольких местах. Внутренние компоненты SSR-совместимы (за исключением TextEditor — см. соответствующий документ).
- **Animation:** CSS transitions при появлении ошибок.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Form from "fishtvue/form"
import type { FormStructure, FormValues } from "fishtvue/form"

const values = ref<FormValues>({})
const structure: FormStructure[] = [
  {
    title: "Profile",
    fields: [
      { name: "name", typeField: "Input", label: "Name", rules: [{ type: "required" }] },
      { name: "email", typeField: "Input", type: "email", label: "Email" }
    ]
  }
]
</script>

<template>
  <Form
    :structure="structure"
    v-model:form-fields="values"
    @submit="(v) => console.log(v)" />
</template>
```

## 5. Props

`FormProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `structure` | `MaybeRef<FormStructure[]>` | — | Декларация секций и полей. Optional — при отсутствии Form строит структуру из compound `<FormSection>`/`<FormField>` детей (§10.5). Schema выигрывает, если задан. |
| `formFields` | `MaybeRef<FormValues>` | `{}` | Текущие значения. v-model. |
| `name` | `string` | — | Имя формы. |
| `class` | `StyleClass` | — | Класс контейнера. |
| `modeStyle` | `StyleMode` | — | Стиль для полей внутри формы. |
| `modeLabel` | `LabelMode` | — | Режим label. |
| `modeValidate` | `"onSubmit" \| "onChange" \| "onInput"` | `"onSubmit"` | Когда валидировать. |
| `submitButton` | `string \| "Save"` | `"Save"` (или `Form.t("save")`) | Текст submit-кнопки. |
| `structureClass` | `string` | (preset) | Класс каждой секции. |
| `structureClassGrid` | `string` | (preset grid 1/6 cols) | Класс grid внутри секции. |
| `disabled` | `boolean` | — | Отключить всю форму. |
| `autocomplete` | `"on" \| "off"` | — | Native autocomplete. |
| `action` | `string` | — | Native `action` URL. Валидная отправка идёт native-сабмитом (§10.7). |
| `method` | `"get" \| "post" \| "dialog"` | — | Native form method. |
| `enctype` | `string` | — | Native form enctype (например `multipart/form-data`). |
| `nativeSubmit` | `boolean` | `false` | Opt-in native browser submit для валидной формы без `action`. |

`FormStructure` (фрагмент): `{ title?, description?, fields: FieldType[] }`.

`FieldType` — discriminated union по `typeField`:
- `FieldInput` — `typeField: "Input"`, поля Input + rules.
- `FieldSelect` — `typeField: "Select"`, поля Select.
- `FieldCalendar` — `typeField: "Calendar"`.
- `FieldTextEditor` — `typeField: "TextEditor"`.
- `FieldSwitch` — `typeField: "Switch"`.
- `FieldCustom` — `typeField: "Custom"`, рендерится через slot `[nameTemplate]`.

См. полные типы в [Form.d.ts](../../lib/form/Form.d.ts).

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:formFields` | `FormValues` | На каждое изменение поля. |
| `submit` | `FormValues` | На submit (после валидации, если passed). |

v-model: `v-model:form-fields="..."` — стандартный pattern для secondary v-model.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `itemTitle` | `{ structure }` | Override заголовка секции. |
| `footer` | — | Контент под submit-кнопкой. |
| `[nameTemplate]` | `{ data, updateModelValue, changeModelValue }` | Динамический slot для `FieldCustom` — `nameTemplate` совпадает с `field.nameTemplate`. |

## 8. Exposed methods

`FormExpose`:

| Name | Type | Description |
|---|---|---|
| `formElement` | `HTMLFormElement \| undefined` | Ref на корневой `<form>` (native `requestSubmit()`, scroll, focus). |
| `formFields` | `FormValues` | Текущие значения. |
| `formInvalidFields` | `{ [key: string]: boolean }` | Map имя_поля → invalid. |
| `formStructure` | `FormStructure[] \| undefined` | Резолвленная структура. |
| `setFieldValue(fieldName, value)` | function | Установить значение поля. |
| `setFieldParam(fieldName, param, value)` | function | Изменить prop поля программно. |
| `getField(fieldName)` | function | Получить FieldType. |
| `isFieldInvalid(fieldName)` | function | Проверить invalid. |
| `setStructureParam(index, param, value)` | function | Изменить секцию структуры. |
| `validateFields(name?)` | function | Валидация всех или конкретного поля. |

## 9. Examples

### 9.1 Простая форма

```vue
<Form :structure="[
  { fields: [
    { name: 'login', typeField: 'Input', label: 'Login', rules: [{ type: 'required' }] }
  ] }
]" v-model:form-fields="values" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Form: {
      modeStyle: "outlined",
      modeLabel: "dynamic",
      modeValidate: "onChange",
      submitButton: "Send"
    }
  }
})
```

### 9.3 Custom field через slot

```vue
<script setup lang="ts">
import Form from "fishtvue/form"
const structure = [
  { fields: [
    { name: "rating", typeField: "Custom", nameTemplate: "rating", label: "Rating" }
  ]}
]
</script>

<template>
  <Form :structure="structure" v-model:form-fields="values">
    <template #rating="{ data, updateModelValue }">
      <input type="range" :value="data" @input="updateModelValue(($event.target as any).value)" />
    </template>
  </Form>
</template>
```

### 9.4 С Pinia

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Form from "fishtvue/form"
import { useUserStore } from "@/stores/user"

const store = useUserStore()
const { profile } = storeToRefs(store)

async function onSubmit(values: any) {
  await store.save(values)
}
</script>

<template>
  <Form
    :structure="store.profileStructure"
    v-model:form-fields="profile"
    @submit="onSubmit" />
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`FormOption = Pick<FormProps, "class" | "modeStyle" | "modeLabel" | "modeValidate" | "submitButton" | "structureClass" | "structureClassGrid" | "autocomplete">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Через стили подкомпонентов ([Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md), [Button](./button.md)).

### 10.4 CSS layer override

Root класс — `fv fishtvue-form`.

### 10.5 Compound API

Альтернатива schema-driven `:structure` — декларативные дети `<FormSection>`/`<FormField>` (canon: VNode-walk `slots.default()`, зеркало `<Table><Column>`). Если заданы и `:structure`, и дети — **schema выигрывает** (backward compat).

```vue
<script setup lang="ts">
import { ref } from "vue"
import Form, { FormSection, FormField } from "fishtvue/form"

const values = ref({})
const roles = [{ id: 1, value: "Admin" }]
</script>

<template>
  <Form v-model:form-fields="values" @submit="(v) => console.log(v)">
    <FormSection title="User">
      <FormField name="email" type="Input" label="Email" :rules="{ required: true, email: true }" />
      <FormField name="role" type="Select" :data-select="roles" />
    </FormSection>
    <!-- custom-контрол через default-slot FormField -->
    <FormField name="rating">
      <template #default="{ data, updateModelValue }">
        <MyRating :model-value="data.modelValue" @update:model-value="updateModelValue" />
      </template>
    </FormField>
  </Form>
</template>
```

`<FormField>` props: `name` (required), `type` / `typeComponent`, `label`, `rules`, `modelValue`, плюс passthrough. `<FormSection>` props: `title`, `description`, `class`, `classGrid`, `isHidden`. В Nuxt оба авто-импортируются.

### 10.6 Custom field types

Произвольный компонент рендерится по строковому `type`/`typeComponent`, зарегистрированному через `registerFieldType`:

```ts
import { registerFieldType } from "fishtvue/form"
import MyDatePicker from "@/components/MyDatePicker.vue"

registerFieldType("MyDatePicker", MyDatePicker)
```

```vue
<Form :structure="[{ fields: [{ name: 'date', typeComponent: 'MyDatePicker' }] }]" v-model:form-fields="values" />
<!-- или compound: <FormField name="date" type="MyDatePicker" /> -->
```

Зарегистрированный компонент получает `v-model:model-value` (auto-binding на `formFields[name]`) и passthrough props. Резолв: встроенный тип > registry > Custom-slot. Custom/registered-поле с `rules` валидируется.

### 10.7 Native submit & FormData

Корень Form — native `<form>`. По умолчанию (SPA-режим) валидный submit эмитит `submit` и предотвращает перезагрузку. Для реальной browser-отправки:

```vue
<Form :structure="structure" action="/api/submit" method="post">...</Form>
<!-- или без action: -->
<Form :structure="structure" :nativeSubmit="true">...</Form>
```

Невалидная форма всегда блокирует submit. `new FormData(form.formElement)` собирает значения Input-полей (несут native `name`); Switch/Select/Calendar/TextEditor — через `v-model:form-fields` (нет hidden native input — см. §18).

## 11. Form integration & validation

Это и есть Form. Внутри использует [rulesHandler.getValidate](../utilities/rulesHandler.md). Для async-валидации (например, server-side username check) используй `rulesHandler.getAsyncValidate` — но Form его не вызывает автоматически; делай через ref-метод `validateFields` + custom rule с async validator.

### Локализация validation messages

Когда подключён FishtVue plugin, Form один раз при mount (и при смене активной локали) вызывает `setDefaultRuleMessages()`, мапя 10 rule-типов на ключи активной локали (`requiredField`, `invalidEmail`, `invalidPhone`, `invalidNumeric`, `regexMismatch`, `valueOutOfRange`, `invalidLength`, `invalidField`, `compareMismatch`). Это применяется к rules без явного `message`. Для standalone-Form (без plugin) сохраняются встроенные английские defaults. Явный `rule.message` всегда имеет высший приоритет. Подробнее — [rulesHandler §10](../utilities/rulesHandler.md).

## 12. Accessibility & Security

### A11y

- Семантика — `<form>` (нативная).
- Submit-кнопка — `<button type="submit">` (через [Button](./button.md)).
- Каждое поле — обёрнуто [InputLayout](./input-layout.md) + [Label](./label.md).
- ARIA-описание ошибок — через `aria-describedby` (управляется InputLayout).
- Keyboard: Tab навигация по полям, Enter в Input — submit (если type="text").

### Security

- Не рендерит HTML из props. Для полей `Select` Form переиспользует встроенный безопасный render Select (`#marker` slot + `markerParts()` через text-interpolation); собственного `v-html` Form не содержит (ранее был `#item`-override — удалён 2026-06-03, [issues/form.md Issue 1](../issues/form.md)).
- Custom slot `nameTemplate` — родитель отвечает за безопасный rendering.

## 13. TypeScript

```ts
import Form, { FormField, FormSection, registerFieldType } from "fishtvue/form"
import type {
  FormProps, FormEmits, FormSlots, FormExpose,
  FormStructure, FormValues, FieldType,
  FieldInput, FieldSelect, FieldCalendar, FieldTextEditor, FieldSwitch, FieldCustom,
  FieldRegistered, FormFieldProps, FormSectionProps
} from "fishtvue/form"
import { useTemplateRef } from "vue"

const f = useTemplateRef<InstanceType<typeof Form>>("f")
f.value?.validateFields()
f.value?.formElement?.requestSubmit()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 58 кейсов, coverage 91.41%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Form from "fishtvue/form/Form.vue"

describe("Form", () => {
  it("emits submit", async () => {
    const wrapper = mount(Form, {
      props: { structure: [{ fields: [{ name: "x", typeField: "Input" }] }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Form.test.ts](../../lib/form/Form.test.ts) (58 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Custom field не рендерится | Slot имя не совпадает с `nameTemplate`. | Совпадай 1:1. |
| Валидация не срабатывает | `rules` не указаны или modeValidate другой. | Добавь rules + проверь modeValidate. |
| `submit` event не emit | Валидация не прошла. | Проверь `formInvalidFields` или `validateFields()` вручную. |
| Async-валидация не отрабатывает | Form не вызывает `getAsyncValidate`. | Через template ref → `validateFields(name)` после await. |
| Поля Input/Select не реагируют на reset | `formFields` ref должен быть переприсвоен. | `formFields.value = {}`. |

## 17. Related

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md), [Button](./button.md).
- [InputLayout](./input-layout.md), [Label](./label.md).
- [utilities/rulesHandler.md](../utilities/rulesHandler.md) — engine валидации.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-06-03) комментариев `TODO/FIXME/HACK/XXX` в [Form.vue](../../lib/form/Form.vue) и [Form.d.ts](../../lib/form/Form.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage `Form.vue` 95.73% statements / **80.6% branch** (было 78.91% — поднято 2026-06-03 в [issues/form.md Issue 8](../issues/form.md)). Непокрытые ветви — [Form.vue:159–164](../../lib/form/Form.vue#L159) (sync-watch при reassign внешнего `props.formFields`).
- Validation messages локализуются глобально через `setDefaultRuleMessages` (global module state) — при нескольких Form с разными локалями последний mount выигрывает. Custom validator с `{ key, params }` interpolation не поддержан (нужен `t(key, params)` — Wave 3.5). См. [issues/form.md Issue 6](../issues/form.md).
- В `FieldSelect`/`FieldCalendar`/`FieldTextEditor` rules-поле закомментировано в `.d.ts` (планируется).
- **B10 (colors):** `gray-*`/`red-*` Tailwind-примитивы ещё не мигрированы на semantic tokens — библиотечная Wave 9 (cross-cutting, [issues/README.md](../issues/README.md)). `issues/form.md` остаётся active до Wave 9, хотя numbered-issue matrix `0/0/0/0`.
- **FormData для non-Input полей:** `new FormData(formElement)` собирает только Input-поля (несут native `name`); Switch/Select/Calendar/TextEditor не рендерят hidden native input. Значения — через `v-model:form-fields`/`submit`-event. См. [issues/form.md Issue 4](../issues/form.md).

### Skipped tests

Нет.

### API inconsistencies

- `FieldCustom.modelValue: any` — потеря типизации для custom-полей.
- `FieldType<T>` использует условные типы по `typeField`, но fallback path возвращает `any`.
- `formFields: MaybeRef<FormValues>` — `FormValues = Record<string, any>` — нет per-field типа.
- `setFieldValue(fieldName: string, value: any): unknown` — возвращает `unknown`.

### Behavioral caveats

- Async-валидация не интегрирована в стандартный flow — потребителю нужно явно вызывать `validateFields()` после await.
- `modeValidate: "onInput"` может вызвать множество rerender'ов при медленных rules (особенно regex).
- `submit` event срабатывает только если все поля валидны; нет отдельного `submit-failed` event.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
