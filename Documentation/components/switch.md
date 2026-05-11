---
title: Switch
summary: Toggle (checkbox/switch) с modelValue, иконками active/inactive, label и help-slot. FormData submission поддерживается в обоих режимах через native <input type="checkbox"> (для switch — скрытый bridge).
updated: 2026-05-11
stability: stable
since: 0.2.11
---

# Switch

## 1. Overview

`Switch` — переключатель двух состояний. Поддерживает два механизма: `switch` (классический slider) и `checkbox`. Опционально показывает иконки `iconActive`/`iconInactive` (через [Icons](./icons.md)), label, help (через `#help` slot или text-prop). Реализует v-model contract FishtVue (`update:modelValue` + `change:modelValue`). В обоих режимах участвует в native `<form>` submission через `FormData` (в switch-режиме параллельно visible `<button role="switch">` рендерится скрытый `<input type="checkbox">` как form-bridge).

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

- **Lifecycle:** базовый `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) автоматически инжектит стили через `onServerPrefetch + onMounted` → `initStyle()`. SFC сам **не** вызывает `Switch.initStyle()`.
- **Поток данных:** props + `Switch.getOptions()` → computed mode/rounded/iconActive/iconInactive/switchingType → `classBaseSwitch`/`classSwitch` через `setStyle`. modelValue → внутренний `isActiveSwitch` → emits.
- **v-model contract:**
  1. native `<input>` change/click event,
  2. `update:modelValue` payload `boolean`,
  3. parent watch'ы отрабатывают,
  4. `change:modelValue` payload `boolean` (после reactivity flush).
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
| `id` | `string` | — | id для `<input>`. Также используется как `name` для FormData submission. |
| `label` | `string` | — | Текст label (рядом со switch). |
| `disabled` | `boolean` | `false` | Отключение. |
| `help` | `string` | — | Text fallback для help-tooltip. Для rich HTML используй `#help` slot — prop рендерится как текст (без `v-html`). |
| `required` | `boolean` | `false` | Visual-маркер. |
| `mode` | `SwitchMode` (`"filled" \| "outlined" \| "underlined" \| "none"`) | from global config | Визуальный режим. |
| `rounded` | `1..10 \| number \| "full"` | — | Радиус скругления (px scale). |
| `iconActive` | `IconsProps["type"]` | — | Иконка в active-состоянии. |
| `iconInactive` | `IconsProps["type"]` | — | Иконка в inactive. |
| `switchingType` | `"checkbox" \| "switch"` | from global config | Механизм переключения. Closed union — typos ловятся `vue-tsc`. |
| `class` | `StyleClass` | — | Кастомный класс. |

## 6. Events / Emits + v-model contract

`SwitchEmits` ([Switch.d.ts:114–127](../../lib/switch/Switch.d.ts#L114-L127)):

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `boolean` | На каждом toggle (после реактивного обновления внутреннего состояния). |
| `change:modelValue` | `boolean` | После reactivity flush; для тяжёлых side-effect'ов. |

**v-model contract** (стандарт FishtVue):
1. native click/change на `<input>`,
2. `update:modelValue` (синхронизация v-model),
3. parent watcher'ы отрабатывают,
4. `change:modelValue` (значение действительно изменилось).

`update:modelValue` подписывай для непрерывного слежения; `change:modelValue` — для операций, которые не нужны при каждом toggle (запись в analytics, server sync).

## 7. Slots

`SwitchSlots` ([Switch.d.ts:98–110](../../lib/switch/Switch.d.ts#L98-L110)).

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива `label` prop'у — произвольный контент рядом со switch. |
| `help` | — | Кастомизация help-tooltip контента. Имеет приоритет над `help: string` (тот рендерится как text fallback). Рекомендуемый способ передачи rich HTML — `help` prop остаётся text-only для XSS safety. |

## 8. Exposed methods

`SwitchExpose` ([Switch.d.ts:133–235](../../lib/switch/Switch.d.ts#L133-L235)):

| Name | Type | Description |
|---|---|---|
| `isActiveSwitch` | `boolean` | Текущее состояние (true/false). |
| `inputRef` | `Ref<HTMLElement \| undefined>` | Template ref на native control — `<button role="switch">` в switch-режиме, `<input type="checkbox">` в checkbox-режиме. |
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
| `focus(options?)` | `(options?: FocusOptions) => void` | Программный focus на native control. Принимает native `FocusOptions` (например `{ preventScroll: true }`). |
| `blur()` | `() => void` | Программный blur с native control. |

```ts
const swRef = useTemplateRef<InstanceType<typeof Switch>>("sw")
swRef.value?.focus()
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

### 10.4 `switchingType` и global `componentsStyle`

`switchingType` — UX-выбор (checkbox vs switch slider), не визуальный preset. Принимает значение только из `componentsOptions.Switch.switchingType` или per-instance prop. Глобальный `componentsStyle` ([FishtVue.d.ts:128](../../lib/config/FishtVue.d.ts#L128)) **не** переопределяет `switchingType` — он влияет только на `mode` ([Switch.vue:30–32](../../lib/switch/Switch.vue#L30-L32)).

### 10.5 CSS layer override

Root класс — `fv fishtvue-switch`. Override как обычно.

## 11. Form integration & validation

- Поддерживается внутри [Form](./form.md) через `v-model`.
- **Native `<form>` submission:** оба режима участвуют в `FormData`.
  - `switchingType: "checkbox"` — visible `<input type="checkbox" :name="id">` уже form-control.
  - `switchingType: "switch"` — visible `<button role="switch">` не submitting (`type="button"`), поэтому рядом рендерится **скрытый bridge** `<input type="checkbox" :name="id" :checked="modelValue" :disabled="isDisabled" hidden tabindex="-1" aria-hidden="true">` ([Switch.vue:201–209](../../lib/switch/Switch.vue#L201-L209)). При `modelValue=true` `FormData.get(id) === "on"`; при `false` — ключ отсутствует (стандартное поведение native checkbox).
- `required: true` визуальный — для валидации используй [rulesHandler](../utilities/rulesHandler.md):

```ts
const rules = [{ type: "required", message: "Must be enabled" }]
```

- Состояния error/success — по конвенции через `mode` + custom `class`.
- При reset формы — родитель должен явно сбросить `modelValue`.

## 12. Accessibility & Security

### A11y

- В `switchingType: "switch"` корневой visible element — `<button role="switch">` с нативным `aria-checked` и поддержкой Space/Enter. Рядом скрытый `<input type="checkbox" hidden tabindex="-1" aria-hidden="true">` для FormData — он a11y-нейтрален: не фокусируется, не озвучивается screen reader'ом.
- В `switchingType: "checkbox"` — нативный `<input type="checkbox">` с focus/Space toggle.
- `disabled` нативный (распространяется и на bridge-input в switch-режиме).
- `label` через prop — но связь `<label for=id>` нужно проверить в шаблоне (см. Known issues — нет гарантии корректного `for=id`).
- ARIA-атрибуты сверх native не выставляются (`aria-checked` нативно у checkbox/button[role=switch]).
- `prefers-reduced-motion` не учтён.
- Help icon trigger (`QuestionMarkCircle`) контраст в light mode ≥4.5:1 (`text-gray-500 dark:text-gray-400`, [Switch.vue:265](../../lib/switch/Switch.vue#L265)) — WCAG AA passes для UI текста.
- RTL: `classAfterInput`/`classIconBody` используют logical properties (`end-0`, `me-2`, [Switch.vue:120–121](../../lib/switch/Switch.vue#L120-L121)) — корректно зеркалятся при `dir="rtl"`.

### Security

- **Не рендерит HTML из props.** `help: string` рендерится как text внутри fallback'а `#help` slot ([Switch.vue:268–270](../../lib/switch/Switch.vue#L268-L270)). XSS-нагрузки (`<img onerror>`, `<script>`) пропадают как текст.
- Для rich HTML используй `<template #help>...</template>` slot — контент санитизируется compiler'ом Vue.

## 13. TypeScript

```ts
import type { SwitchProps, SwitchEmits, SwitchExpose, SwitchSlots } from "fishtvue/switch"
import Switch from "fishtvue/switch"
import { useTemplateRef } from "vue"

const sw = useTemplateRef<InstanceType<typeof Switch>>("sw")
sw.value?.focus()
sw.value?.inputEvent(true)
```

Closed union типы: `switchingType: "checkbox" | "switch"` и `mode: StyleMode | "none"` — typo вроде `"swich"` ловится `vue-tsc`, no `| string` fallback.

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 30 кейсов, coverage 96.42%.
- **Breaking changes (2026-05-11):**
  - Удалён alias-emit `updateModelValue` ([Switch.d.ts:114–127](../../lib/switch/Switch.d.ts#L114-L127)) — подписчики `@update-model-value="..."` должны мигрировать на `@update:model-value="..."`.
  - `switchingType` и `SwitchMode` сужены до closed-union (`"checkbox" | "switch"`, `StyleMode | "none"` соответственно) — `| string` убран. Кастомные строковые значения больше не принимаются.
  - `help: string` теперь рендерится как текст вместо `v-html` — кто полагался на HTML-разметку в prop, должен перенести её в `#help` slot.
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

Реальные тесты — [Switch.test.ts](../../lib/switch/Switch.test.ts) (30 кейсов: XSS guard, help slot, no-dup-emit, FormData submit в switch+checkbox режимах, expose `inputRef`/`focus`/`blur`, logical CSS properties).

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

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Switch.vue](../../lib/switch/Switch.vue) и [Switch.d.ts](../../lib/switch/Switch.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 96.42% — две строки ([Switch.vue:251, 257](../../lib/switch/Switch.vue#L251)) не покрыты тестами (ветка icons-only rendering).

### Skipped tests

Нет.

### API inconsistencies

- ~~`SwitchEmits` объявляет два события для одного и того же payload: `update:modelValue` и `updateModelValue` — alias дублирует и затрудняет refactor.~~ ✅ resolved 2026-05-11 ([issues/switch.md Issue 2](../issues/switch.md)).
- ~~`mode: SwitchMode = StyleMode | "none" | string` — open union с `string` нивелирует narrow.~~ ✅ resolved 2026-05-11 ([Switch.d.ts:15](../../lib/switch/Switch.d.ts#L15)).
- `rounded: 1..10 | number | "full"` — TS narrow до `number` теряет смысл предопределённых значений. Открыт.
- ~~`switchingType: "checkbox" | "switch" | string` — open union.~~ ✅ resolved 2026-05-11 ([Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48)).

### Behavioral caveats

- При `disabled: true` + быстром клике состояние может не fire'нуть `update:modelValue` — не баг, native checkbox не triggerит при disabled. В switch-режиме скрытый bridge-input тоже получает `disabled` атрибут → FormData ключ отсутствует.
- `label` prop рендерится в шаблоне, но без guarantee нативной `<label for=id>` ассоциации — для надёжной a11y используй [InputLayout](./input-layout.md).
- При `modelValue: null` → отображается как "false" но без явного значения. Будь осторожен с tri-state.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
