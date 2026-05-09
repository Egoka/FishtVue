---
title: Switch
summary: Toggle (checkbox/switch) с modelValue, иконками active/inactive, label и help-text.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Switch

## 1. Overview

`Switch` — переключатель двух состояний. Поддерживает два механизма: `switch` (классический slider) и `checkbox`. Опционально показывает иконки `iconActive`/`iconInactive` (через [Icons](./icons.md)), label, help-text. Реализует v-model contract FishtVue (`update:modelValue` + alias `updateModelValue` + `change:modelValue`).

Stability: `stable` (12 кейсов; coverage Switch.vue 96.36%).

Source: [Source](../../lib/switch/Switch.vue), [Switch.d.ts](../../lib/switch/Switch.d.ts), [Switch.test.ts](../../lib/switch/Switch.test.ts).

## 2. How it's organized

```
lib/switch/
├── Switch.vue          # SFC
├── Switch.d.ts         # SwitchProps, SwitchSlots, SwitchEmits, SwitchExpose, SwitchOption
├── Switch.test.ts      # 12 кейсов
└── package.json
```

Зависимости: [Icons](./icons.md) для отображения иконок, [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; компонент сам реагирует на изменение `modelValue` через native `<input>` + emit chain.
- **Поток данных:** props + `Switch.getOptions()` → computed mode/rounded/iconActive/iconInactive/switchingType → `classBaseSwitch`/`classSwitch` через `setStyle`. modelValue → внутренний `isActiveSwitch` → emits.
- **v-model contract:**
  1. native `<input>` change/click event,
  2. `update:modelValue` payload `boolean`,
  3. parent watch'ы отрабатывают,
  4. `change:modelValue` payload `boolean` (после reactivity flush).
  Alias `updateModelValue` ([Switch.d.ts:118](../../lib/switch/Switch.d.ts#L118)) — для тех, кто без `:` в имени события.
- **Стили:** меняются на изменение mode/rounded/iconActive/iconInactive.
- **Конфиг:** `componentsOptions.Switch` ключи — `mode`, `rounded`, `iconActive`, `iconInactive`, `switchingType`, `class`.
- **Локализация:** не использует `t()`.
- **SSR:** SSR-safe.
- **Animation:** transition применяется к slider'у. `prefers-reduced-motion` не учтён.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Switch from "fishtvue/switch"

const enabled = ref(false)
</script>

<template>
  <Switch v-model="enabled" label="Notifications" />
</template>
```

## 5. Props

`SwitchProps extends Partial<BaseSwitchProps>` ([Switch.d.ts:54–96](../../lib/switch/Switch.d.ts#L54-L96)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean \| null \| undefined` | — | v-model. |
| `id` | `string` | — | id для `<input>`. |
| `label` | `string` | — | Текст label (рядом со switch). |
| `disabled` | `boolean` | `false` | Отключение. |
| `help` | `string` | — | Help-text под switch. |
| `required` | `boolean` | `false` | Visual-маркер. |
| `mode` | `SwitchMode` (`"filled" \| "outlined" \| "underlined" \| "none" \| string`) | from global config | Визуальный режим. |
| `rounded` | `1..10 \| number \| "full"` | — | Радиус скругления (px scale). |
| `iconActive` | `IconsProps["type"]` | — | Иконка в active-состоянии. |
| `iconInactive` | `IconsProps["type"]` | — | Иконка в inactive. |
| `switchingType` | `"checkbox" \| "switch" \| string` | from global config | Механизм переключения. |
| `class` | `StyleClass` | — | Кастомный класс. |

## 6. Events / Emits + v-model contract

`SwitchEmits` ([Switch.d.ts:105–126](../../lib/switch/Switch.d.ts#L105-L126)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `boolean` | На каждом toggle (после реактивного обновления внутреннего состояния). |
| `updateModelValue` | `boolean` | Alias `update:modelValue` — emits в обоих формах. |
| `change:modelValue` | `boolean` | После reactivity flush; для тяжёлых side-effect'ов. |

**v-model contract** (стандарт FishtVue):
1. native click/change на `<input>`,
2. `update:modelValue` (синхронизация v-model),
3. parent watcher'ы отрабатывают,
4. `change:modelValue` (значение действительно изменилось).

`update:modelValue` подписывай для непрерывного слежения; `change:modelValue` — для операций, которые не нужны при каждом toggle (запись в analytics, server sync).

## 7. Slots

`SwitchSlots = { default(): VNode[] }` ([Switch.d.ts:98–100](../../lib/switch/Switch.d.ts#L98-L100)).

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива `label` prop'у — произвольный контент рядом со switch. |

## 8. Exposed methods

`SwitchExpose` ([Switch.d.ts:131–212](../../lib/switch/Switch.d.ts#L131-L212)):

| Name | Type | Description |
|---|---|---|
| `isActiveSwitch` | `boolean` | Текущее состояние (true/false). |
| `id` | `SwitchProps["id"]` | id `<input>`. |
| `mode` | `SwitchProps["mode"]` | Текущий mode. |
| `label` | `SwitchProps["label"]` | Label. |
| `rounded` | `SwitchProps["rounded"]` | Скругление. |
| `isDisabled` | `SwitchProps["disabled"]` | Disabled. |
| `isRequired` | `SwitchProps["required"]` | Required. |
| `iconActive` | `SwitchProps["iconActive"]` | Active иконка. |
| `iconInactive` | `SwitchProps["iconInactive"]` | Inactive иконка. |
| `switchingType` | `SwitchProps["switchingType"]` | Механизм. |
| `classBaseSwitch` | `StyleClass` | Класс контейнера. |
| `classSwitch` | `StyleClass` | Класс самого switch. |
| `inputEvent(value)` | `(value: boolean) => void` | Программный toggle. |

```ts
const swRef = useTemplateRef<InstanceType<typeof Switch>>("sw")
swRef.value?.inputEvent(true)
```

## 9. Examples

### 9.1 Базовый

```vue
<script setup lang="ts">
import { ref } from "vue"
import Switch from "fishtvue/switch"

const on = ref(false)
</script>

<template>
  <Switch v-model="on" label="Push notifications" />
</template>
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Switch: {
      mode: "filled",
      rounded: "full",
      switchingType: "switch",
      iconActive: "check",
      iconInactive: "x-mark"
    }
  }
})
```

### 9.3 Checkbox-режим

```vue
<Switch v-model="agreed" switching-type="checkbox" label="I agree" />
```

### 9.4 Связь с Pinia

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Switch from "fishtvue/switch"
import { useSettingsStore } from "@/stores/settings"

const store = useSettingsStore()
const { darkMode } = storeToRefs(store)
</script>

<template>
  <Switch
    v-model="darkMode"
    label="Dark mode"
    @change:model-value="(v) => store.persist({ darkMode: v })" />
</template>
```

`@change:model-value` — для server sync, чтобы не дёргать API на каждый toggle.

## 10. Configuration & Customization

### 10.1 Global

`SwitchOption = Pick<SwitchProps, "mode" | "rounded" | "iconActive" | "iconInactive" | "switchingType" | "class">` ([Switch.d.ts:214–217](../../lib/switch/Switch.d.ts#L214-L217)).

### 10.2 Per-instance

Через props.

### 10.3 Theming

- Цвета active-state используют `theme.*` через CSS-переменную `--theme`.
- Dark mode через `optionsTheme.darkModeSelector`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-switch`. Override как обычно.

## 11. Form integration & validation

- Поддерживается внутри [Form](./form.md) через `v-model`.
- `required: true` визуальный — для валидации используй [rulesHandler](../utilities/rulesHandler.md):

```ts
const rules = [{ type: "required", message: "Must be enabled" }]
```

- Состояния error/success — по конвенции через `mode` + custom `class`.
- При reset формы — родитель должен явно сбросить `modelValue`.

## 12. Accessibility & Security

### A11y

- Корневой `<input type="checkbox">` (или radio) — нативный focus/Space toggle.
- `disabled` нативный.
- `label` через prop — но связь `<label for=id>` нужно проверить в шаблоне (см. Known issues — нет гарантии корректного `for=id`).
- ARIA-атрибуты сверх native не выставляются (`aria-checked` нативно у checkbox).
- `prefers-reduced-motion` не учтён.

### Security

- Не рендерит HTML из props. Без `v-html`.

## 13. TypeScript

```ts
import type { SwitchProps, SwitchEmits, SwitchExpose } from "fishtvue/switch"
import Switch from "fishtvue/switch"
import { useTemplateRef } from "vue"

const sw = useTemplateRef<InstanceType<typeof Switch>>("sw")
sw.value?.inputEvent(true)
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 12 кейсов, coverage 96.36%.
- **Breaking changes:** на 2026-05-09 не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Switch from "fishtvue/switch/Switch.vue"

describe("Switch", () => {
  it("emits update:modelValue on toggle", async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false },
      global: { plugins: [[FishtVue, {}]] }
    })
    await wrapper.find("input").setValue(true)
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toBe(true)
  })
})
```

Реальные тесты — [Switch.test.ts](../../lib/switch/Switch.test.ts) (12 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `v-model` не реагирует | Нет plugin'а — `componentsOptions` не подхвачен. | `app.use(FishtVue, {})`. |
| Tap on label не toggle'ит switch | Связь `<label for=id>` не настроена — см. Known issues. | Используй [InputLayout](./input-layout.md) или передавай `id` явно. |
| `change:modelValue` не срабатывает | Возможно nextTick не отработал. | Используй `@update:modelValue` для немедленного отклика. |
| `iconActive`/`iconInactive` не показываются | Нет компонента Icons или указано несуществующее имя. | Проверь [Icons](./icons.md) каталог. |
| Tab переходит мимо switch | `tabindex` не установлен — нативный input должен фокусироваться. | Проверь `disabled` и наличие native input в DOM. |

## 17. Related

- [Icons](./icons.md), [Label](./label.md), [InputLayout](./input-layout.md).
- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md) — соседние form-controls.
- [Form](./form.md) — wrapper.
- [utilities/rulesHandler.md](../utilities/rulesHandler.md) — валидация.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Switch.vue](../../lib/switch/Switch.vue) и [Switch.d.ts](../../lib/switch/Switch.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 96.36% — две строки ([Switch.vue:220, 226](../../lib/switch/Switch.vue#L220)) не покрыты тестами.

### Skipped tests

Нет.

### API inconsistencies

- `SwitchEmits` объявляет два события для одного и того же payload: `update:modelValue` и `updateModelValue` ([Switch.d.ts:111, 118](../../lib/switch/Switch.d.ts#L111)) — alias дублирует и затрудняет refactor (потребитель может подписаться на оба, что вызовет double-handlers).
- `mode: SwitchMode = StyleMode | "none" | string` ([Switch.d.ts:15](../../lib/switch/Switch.d.ts#L15)) — open union с `string` нивелирует narrow.
- `rounded: 1..10 | number | "full"` — TS narrow до `number` теряет смысл предопределённых значений.
- `switchingType: "checkbox" | "switch" | string` — open union.

### Behavioral caveats

- При `disabled: true` + быстром клике состояние может не fire'нуть `update:modelValue` — не баг, native checkbox не triggerит при disabled.
- `label` prop рендерится в шаблоне, но без guarantee нативной `<label for=id>` ассоциации — для надёжной a11y используй [InputLayout](./input-layout.md).
- При `modelValue: null` → отображается как "false" но без явного значения. Будь осторожен с tri-state.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
