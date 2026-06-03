---
title: Issues — Form
summary: Аудит Form — schema-driven only (нет compound API), нет registration механизма для произвольных typeField, slow при глубокой структуре, отсутствие FormData submit. XSS (Issue 1), validation i18n (Issue 6) и branch coverage (Issue 8) закрыты 2026-06-03.
updated: 2026-06-03
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/form/
related-doc: ../components/form.md
---

# Issues — Form

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | ~~C13 (v-html в select-marker)~~ ✅ resolved 2026-06-03 |
| high | 6 | A2, A4-5, C17, L53, P (dual-API), M55 (FormData) |
| medium | 3 | D21 (typeField generic), ~~F30~~ ✅ resolved 2026-06-03, F32, G34 |
| low | 2 | E29.7, B10, ~~K46 (branch coverage)~~ ✅ resolved 2026-06-03 |

## ~~Issue 1: CRITICAL — XSS через select-marker (наследуется через Form-rendered Select)~~ ✅ resolved 2026-06-03

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** ~~[Form.vue:380]~~ (template `#item` override удалён)

### Что найдено

```vue
<div v-if="!isQuery" v-html="item?.marker ?? item[key]" :class="classSelectItemIsQuery" />
```

Form переопределял Select `#item` slot через `v-html` для marker rendering — копия [select.md Issue 1](./select.md). Этот override **заменял** безопасный default Select (`#marker` slot + `markerParts()` `<mark>` highlight), воскрешая XSS и теряя подсветку.

### Что сделано ✅

Удалён `#item`-override в [Form.vue](../../lib/form/Form.vue) полностью — теперь Form переиспользует встроенный безопасный render Select (`#marker` slot + `markerParts()`, text-interpolation для значения). Удалены ставшие dead-кодом refs `classSelectItemIsQuery` / `classSelectItemNotQuery`. Никакого `v-html` в Form не осталось.

### Acceptance criteria

- [x] Form-rendered select option с XSS payload (`<img src=x onerror=…>`) не исполняется — рендерится как escaped-текст ([Form.test.ts](../../lib/form/Form.test.ts) → "does not execute an XSS payload from a Select option value"). ✅
- [x] Form переиспользует Select-component вместо дублирования render-логики. ✅

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

## ~~Issue 6: `t()` для validation error messages~~ ✅ resolved 2026-06-03

- **Категория:** F30
- **Severity:** medium
- **Где:** [Form.vue:131–146](../../lib/form/Form.vue#L131), [lib/utils/rulesHandler.ts:171](../../lib/utils/rulesHandler.ts#L171)

### Что найдено

Validation rules возвращают error messages: «Required field», «Invalid email», и т. д. Хардкоден встроенные английские defaults в [rulesHandler.ts](../../lib/utils/rulesHandler.ts).

### Что сделано ✅

1. Form вызывает `setDefaultRuleMessages()` через `applyLocaleToRules()`, мапя 10 rule-типов на `Form.t(<localeKey>)` (`requiredField`, `invalidEmail`, `invalidPhone`, `invalidNumeric`, `regexMismatch`, `valueOutOfRange`, `invalidLength`, `invalidField`, `compareMismatch`). Ключи **уже** присутствуют в [en.ts](../../lib/locale/locales/en.ts) / [ru.ts](../../lib/locale/locales/ru.ts).
2. Wiring guarded через `useFishtVue()` — standalone-Form (без plugin) сохраняет встроенные английские defaults. `watch(() => getActiveLocale(), …, { immediate: true })` переприменяет messages при runtime смене локали.
3. Тест: [Form.test.ts](../../lib/form/Form.test.ts) → "localizes default validation messages to ru when active locale is ru" / "keeps en messages under the default locale".

### Known limitation

`setDefaultRuleMessages` — global module state (shared между всеми instance'ами Form/Input/Select). Custom validator с `{ key, params }` interpolation не поддержан (требует `t(key, params)` — Wave 3.5). Per-rule `message` по-прежнему имеет высший приоритет.

## Issue 7: Date fields не уважают locale

- **Категория:** F32

См. [calendar.md Issue 8](./calendar.md). Form использует Calendar для date fields → наследует проблему.

## ~~Issue 8: Тестов 32, но branch coverage 78.91% — много untested ветвей~~ ✅ resolved 2026-06-03

- **Категория:** K46
- **Severity:** low
- **Где:** [Form.test.ts](../../lib/form/Form.test.ts)

### Что найдено

```
lib/form (было): 91.41 / 78.91 / 88.67 / 92.30
```

Branch coverage <80%. Особенно в complex validation flows (async rules, compare, custom typeField).

### Что сделано ✅

Добавлены тесты (40 кейсов всего): async-valid path, `compare` rule с `compareFields`, `FieldCustom` slot (`updateModelValue`/`changeModelValue` bridge), multi-section required validation, Select-field branch (`closeButtonBadge` defaulting). Branch coverage `Form.vue` поднят **78.91% → 80.6%** (statements 95.73%, functions 94.44%).

## Issue 9: prefers-reduced-motion / RTL / colors / print

Cross-cutting. См. [button.md](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Form` | ✅ | через Form.getOptions() |
| `componentsStyle` global | ⚠️ | пробрасывается в child fields через their own logic |
| `unstyled: true` | ❌ | Issue 5 |
| Theme tokens vs hardcode | ⚠️ | через child компоненты |
| `t()` для текста | ✅ | Issue 6 ✅ — validation messages локализованы через `setDefaultRuleMessages` |
| Runtime locale switch | ✅ | Issue 6 ✅ — `watch(getActiveLocale)` переприменяет rule-messages |

## Dual-API gap

См. [Issue 2](#issue-2-dual-api-gap-—-нет-compound-formformfield-api). Это **второй ключевой dual-API** компонент после Table.
