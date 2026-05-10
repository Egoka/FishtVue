---
title: Issues — Form
summary: Аудит Form — XSS via item.marker (через Select), schema-driven only (нет compound API), нет registration механизма для произвольных typeField, slow при глубокой структуре, отсутствие FormData submit.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/form/
related-doc: ../components/form.md
---

# Issues — Form

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | C13 (v-html в select-marker внутри Form, наследуется через Select) |
| high | 6 | A2, A4-5, C17, L53, P (dual-API), M55 (FormData) |
| medium | 4 | D21 (typeField generic), F30, F32, G34 |
| low | 3 | E29.7, B10, K46 (branch coverage) |

## Issue 1: CRITICAL — XSS через select-marker (наследуется через Form-rendered Select)

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Form.vue:380](../../lib/form/Form.vue#L380)

### Что найдено

```vue
<div v-if="!isQuery" v-html="item?.marker ?? item[key]" :class="classSelectItemIsQuery" />
```

Form имеет inline-rendered select dropdown (для typeField "Select" возможно). Использует `v-html` для marker rendering — копия [select.md Issue 1](./select.md).

### Что нужно сделать

См. [select.md Issue 1](./select.md). Заменить v-html на slot/VNode-render через CellWithMarker компонент.

Дополнительно: Form должен использовать `<Select>` напрямую, а не дублировать render-логику. Это уменьшит surface XSS-уязвимостей.

### Acceptance criteria

- [ ] Form-rendered select option с XSS payload не исполняется.
- [ ] Form переиспользует Select-component вместо дублирования.

## Issue 2: Dual-API gap — нет compound `<Form><FormField>` API

- **Категория:** P (Dual-API)
- **Severity:** high
- **Где:** [Form.d.ts](../../lib/form/Form.d.ts) (FormStructure type)

### Что найдено

API только schema-driven через `structure: FormStructure[]`:
```vue
<Form :structure="[
  { fields: [
    { name: 'email', typeField: 'Input', label: 'Email', rules: [{type:'required'}] },
    { name: 'role', typeField: 'Select', dataSelect: roles }
  ]}
]" v-model:form-fields="values" />
```

Нет:
```vue
<Form v-model:form-fields="values">
  <FormSection title="User">
    <FormField name="email" type="Input" label="Email" :rules="[{type:'required'}]" />
    <FormField name="role" type="Select" :data-select="roles" />
  </FormSection>
</Form>
```

### Почему это проблема

- Industry: VueForm, FormKit, Element Plus el-form — все compound.
- Schema-driven полезен для CMS-driven форм. Compound — для статически известных.
- Custom typeField (e.g., `typeField: "MyCustomComponent"`) — сейчас невозможно без регистрации в Form internals. Compound сделал бы тривиальным:
  ```vue
  <FormField name="custom"><MyCustomComponent /></FormField>
  ```

### Что нужно сделать

См. [table.md Issue 3](./table.md) — параллельный fix-план через `provide(FORM_CONTEXT, ...)` + child `<FormField>` registration.

1. `lib/form/FormField.vue` — child компонент. Inject `FORM_CONTEXT` parent, register self.
2. Resolve приоритет: `:structure` prop выигрывает; иначе используется children walk.
3. Slot pattern: `<FormField name="x"><CustomInput /></FormField>` — рендер любого компонента.
4. Validation: rules определяются через FormField props или custom validator function.
5. v-model bridge: FormField emit `update:modelValue` → Form aggregate в formFields.

### Acceptance criteria

- [ ] Schema-driven продолжает работать.
- [ ] `<Form><FormField name="email" type="Input" /></Form>` рендерит Input с auto-binding.
- [ ] Custom typeField через slot: `<FormField name="x"><MyComp /></FormField>`.

## Issue 3: typeField string union — нельзя расширить custom компонентами

- **Категория:** D21 (Generic типов)
- **Severity:** medium
- **Где:** [Form.d.ts](../../lib/form/Form.d.ts) (FieldType union)

### Что найдено

`typeField` — closed union из FishtVue-компонентов: `"Input" | "Select" | "Calendar" | ...`. Нельзя добавить custom typeField (`"MyDatePicker"`).

### Что нужно сделать

1. Расширить тип: `typeField: FieldType | string` (open union).
2. Internal map для регистрации custom-типов:
   ```ts
   Form.registerFieldType("MyDatePicker", MyDatePickerComponent)
   ```
3. Documentation в [components/form.md](../components/form.md) §10 Custom field types.
4. Compound API (Issue 2) — natural fit для custom rendering.

## Issue 4: FormData/native submit не интегрируется

- **Категория:** M55 (FormData)
- **Severity:** high
- **Где:** [Form.vue](../../lib/form/Form.vue) (нет `<form>` тега как корня)

### Что найдено

Form-компонент не использует native `<form>` element. Native submit, FormData, browser form-validation — недоступны.

### Что нужно сделать

1. Корень → `<form @submit.prevent="onSubmit">` (default action).
2. Каждый field имеет `name` атрибут — native FormData собирает.
3. Add prop `:nativeSubmit="true"` — позволяет native form submission.
4. Документировать в [components/form.md](../components/form.md) §M.

### Acceptance criteria

- [ ] `new FormData(formElement)` → собирает все field-values.
- [ ] `<Form action="/api/submit" method="post">` отправляет POST на server.

## Issue 5: SSR styles + sideEffects/exports map + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 6: `t()` для validation error messages

- **Категория:** F30
- **Severity:** medium
- **Где:** [Form.vue](../../lib/form/Form.vue), [lib/utils/rulesHandler.ts](../../lib/utils/rulesHandler.ts)

### Что найдено

Validation rules возвращают error messages: «Field is required», «Email is invalid», и т. д. Хардкоден строки в [rulesHandler.ts](../../lib/utils/rulesHandler.ts) на английском.

### Что нужно сделать

1. Перевести error messages через `t("validation.required")` / `t("validation.email")` keys.
2. Добавить ключи в [lib/locale/locales/en.ts](../../lib/locale/locales/en.ts) и [ru.ts](../../lib/locale/locales/ru.ts).
3. Custom validator може возвращать `{ key: "validation.minLength", params: { min: 8 } }` — Form подставит локализацию.

## Issue 7: Date fields не уважают locale

- **Категория:** F32

См. [calendar.md Issue 8](./calendar.md). Form использует Calendar для date fields → наследует проблему.

## Issue 8: Тестов 32, но branch coverage 78.91% — много untested ветвей

- **Категория:** K46
- **Severity:** low
- **Где:** [Form.test.ts](../../lib/form/Form.test.ts)

### Что найдено

```
lib/form: 91.41 / 78.91 / 88.67 / 92.30
```

Branch coverage <80%. Особенно в complex validation flows (async rules, dynamic typeField switching).

### Что нужно сделать

Add tests for: async validators, conditional-required (rules depending on other field), nested FormStructure, custom typeField, SSR-render.

## Issue 9: prefers-reduced-motion / RTL / colors / print

Cross-cutting. См. [button.md](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Form` | ✅ | через Form.getOptions() |
| `componentsStyle` global | ⚠️ | пробрасывается в child fields через their own logic |
| `unstyled: true` | ❌ | Issue 5 |
| Theme tokens vs hardcode | ⚠️ | через child компоненты |
| `t()` для текста | ❌ | Issue 6 — validation messages не локализованы |
| Runtime locale switch | ❌ | Issue 6 |

## Dual-API gap

См. [Issue 2](#issue-2-dual-api-gap-—-нет-compound-formformfield-api). Это **второй ключевой dual-API** компонент после Table.
