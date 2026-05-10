---
title: Button
summary: Универсальная кнопка с modes (primary/outline/ghost), color, size, rounded, icon, loading.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Button

## 1. Overview

`Button` — стандартная кнопка с тремя визуальными режимами (`primary | outline | ghost`), четырьмя цветовыми темами (`theme | neutral | creative | destructive`), пятью размерами (`xs | sm | md | lg | xl`), четырьмя вариантами рамки (`none | md | lg | full`), поддержкой иконки (через [Icons](./icons.md)), loading-индикатора и icon-only режима с tooltip через [FixWindow](./fix-window.md).

Stability: `stable` (есть тесты — 13 кейсов; покрытие Button.vue 100%).

Source: [Source](../../lib/button/Button.vue), [Button.d.ts](../../lib/button/Button.d.ts), [Button.test.ts](../../lib/button/Button.test.ts).

## 2. How it's organized

```
lib/button/
├── Button.vue          # SFC, ~380 строк
├── Button.d.ts         # ButtonProps (Simple|Icon), ButtonSlots, ButtonEmits=null, ButtonExpose, ButtonOption
├── Button.test.ts      # 13 кейсов
└── package.json
```

Внутренние зависимости (через `find_usages`): использует [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md). Базируется на [Component class](../architecture/component-class.md).

Внешние зависимости: нет (только Vue + transitively `clsx`/`tailwind-merge` через [tailwindHandler](../utilities/tailwindHandler.md)).

Tree-shaking & bundle: `import Button from "fishtvue/button"` импортирует SFC + TS-типы из `lib/button/`. При root-импорте `import { Button } from "fishtvue"` — barrel ([lib/index.ts:14–15](../../lib/index.ts#L14-L15)) тоже tree-shake-friendly.

## 3. How it works

- **Lifecycle:** базовая инжекция стилей через `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) автоматически. Дополнительно `onMounted(() => Button.initStyle())` ([Button.vue:346–348](../../lib/button/Button.vue#L346-L348)) — дублирующий вызов (см. [dev-patterns §12](../dev-patterns.md#12-known-deviations-from-this-pattern)).
- **Поток данных:** props + `Button.getOptions()` → computed (`type`, `icon`, `iconPosition`, `isLoading`, `disabled`, `mode`, `size`, `rounded`, `color`) → `classBase` (через `Button.setStyle`) и `classIcon`. Resolve порядок: `props ?? options ?? default`.
- **Стили:** `Button.setStyle(...)` вычисляется в computed `classBase` ([Button.vue:313–324](../../lib/button/Button.vue#L313-L324)), пересчитывается на изменение mode/size/rounded/color/disabled. Классы инжектятся в `@layer fishtvue`.
- **Конфиг:** читает `componentsOptions.Button` (поля: `mode`, `size`, `rounded`, `color`, `class`, `classIcon`).
- **Локализация:** не использует `t()`.
- **SSR / hydration:** SSR-safe — нет прямых `document`/`window`. `Component.__hooks()` инжектит CSS через `onServerPrefetch` + `onMounted`.
- **Animation:** `transition-colors duration-200` ([Button.vue:26](../../lib/button/Button.vue#L26)). `prefers-reduced-motion` не учитывается.

## 4. Quick Start

```vue
<script setup lang="ts">
import Button from "fishtvue/button"
</script>

<template>
  <Button mode="primary" color="theme" size="md">Submit</Button>
</template>
```

## 5. Props

`ButtonProps = SimpleButtonProps | IconButtonProps` ([Button.d.ts:105](../../lib/button/Button.d.ts#L105)). Общий базис `BaseButtonProps + ButtonStyle`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"button" \| "reset" \| "submit" \| "icon"` | `"button"` | `"icon"` — icon-only кнопка с FixWindow tooltip. |
| `icon` | `string` | `""` | Имя иконки (см. [Icons](./icons.md)). |
| `iconPosition` | `"left" \| "right"` | `"right"` | Позиция иконки в обычном режиме. |
| `disabled` | `boolean` | `false` | Стандартный disabled. |
| `loading` | `boolean` | `undefined` | Показывает [Loading](./loading.md) внутри кнопки. |
| `mode` | `"primary" \| "outline" \| "ghost"` | `"primary"` (или из global config) | Визуальный режим. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` (или из global config) | Размер. |
| `rounded` | `"none" \| "md" \| "lg" \| "full"` | `"md"` (или из global config) | Радиус скругления. |
| `color` | `"theme" \| "neutral" \| "creative" \| "destructive"` | `"neutral"` (или из global config) | Цветовая тема. |
| `class` | `StyleClass` | — | Дополнительные классы для контейнера. |
| `classIcon` | `StyleClass` | — | Классы для иконки. |

Defaults для `disabled` и `loading` — `undefined` через `withDefaults` ([Button.vue:13–16](../../lib/button/Button.vue#L13-L16)) — это намеренно: без значения работает auto-detect.

## 6. Events / Emits + v-model contract

`ButtonEmits = null` ([Button.d.ts:109](../../lib/button/Button.d.ts#L109)) — кнопка не эмитит. Используй native `@click` на самом `<Button>` — он прокидывается на корневой `<button>`.

v-model contract — не применимо.

## 7. Slots

`ButtonSlots = { default(): VNode[] }` ([Button.d.ts:106–108](../../lib/button/Button.d.ts#L106-L108)).

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Текст или произвольная разметка. В режиме `type="icon"` — content tooltip'а через [FixWindow](./fix-window.md). |

## 8. Exposed methods

`ButtonExpose` ([Button.d.ts:113–150](../../lib/button/Button.d.ts#L113-L150)):

| Name | Type | Description |
|---|---|---|
| `mode` | `ButtonProps["mode"]` | Текущий mode (computed). |
| `size` | `ButtonProps["size"]` | Текущий size. |
| `rounded` | `ButtonProps["rounded"]` | Текущий rounded. |
| `color` | `ButtonProps["color"]` | Текущий color. |
| `classBase` | `ButtonProps["class"]` | Финальный CSS-класс корневого `<button>`. |
| `classIcon` | `ButtonProps["classIcon"]` | Финальный класс иконки. |

```ts
import { useTemplateRef } from "vue"
import type Button from "fishtvue/button"

const btnRef = useTemplateRef<InstanceType<typeof Button>>("btn")
console.log(btnRef.value?.mode)
```

## 9. Examples

### 9.1 Базовый

```vue
<template>
  <Button>Click me</Button>
</template>
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Button: { mode: "outline", color: "theme", size: "lg" }
  }
})
```

### 9.3 Icon-only с tooltip

```vue
<template>
  <Button type="icon" icon="check" rounded="full">
    Confirm action
  </Button>
</template>
```

`type="icon"` рендерит иконку и при наличии default-slot показывает FixWindow-tooltip.

### 9.4 Loading + disabled (например, привязанные к Pinia)

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Button from "fishtvue/button"
import { useFormStore } from "@/stores/form"

const store = useFormStore()
const { isSubmitting } = storeToRefs(store)
</script>

<template>
  <Button
    type="submit"
    color="creative"
    :loading="isSubmitting"
    :disabled="isSubmitting"
    @click="store.submit">
    Save
  </Button>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`ButtonOption = Pick<ButtonProps, "mode" | "size" | "rounded" | "color" | "class" | "classIcon">` ([Button.d.ts:151](../../lib/button/Button.d.ts#L151)).

```ts
app.use<FishtVueConfiguration>(FishtVue, {
  componentsOptions: {
    Button: {
      mode: "primary",
      size: "md",
      rounded: "md",
      color: "theme",
      class: "shadow-sm",
      classIcon: "size-4"
    }
  }
})
```

### 10.2 Per-instance

Любое поле из `ButtonOption` переопределяется через props.

### 10.3 Theming

- Цветовые токены: `theme.*`, `neutral.*`, `green.*`, `red.*` (для `creative`/`destructive`). См. [Theme](../architecture/theme.md).
- Dark mode классы (`dark:*`) включены в каждой ветке `mode/color`.
- Кастомные токены через `theme.semantic.customThemeColor` влияют на `bg-theme-*`/`text-theme-*`.

### 10.4 CSS layer override

CSS root-класс — `fv fishtvue-button`. Override:

```css
@layer fishtvue, app;

@layer app {
  .fv.fishtvue-button { letter-spacing: 0.05em; }
}
```

См. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override).

## 11. Form integration & validation

Не применимо — Button сам не валидируется. Внутри [Form](./form.md) используется как submit-action: `<Button type="submit">`.

## 12. Accessibility & Security

### A11y

- Корневой элемент — `<button>`, имеет нативный focus/Enter/Space behavior.
- При `type="icon"` корневой `<button>` имеет `type="button"` ([Button.vue:354](../../lib/button/Button.vue#L354)) — не отправляет form по умолчанию.
- `disabled` — нативный атрибут, screen-reader озвучивает.
- ARIA-атрибутов сверх native нет (нет `aria-label`/`aria-pressed` для icon-only). См. Known issues.
- Keyboard: Tab/Enter/Space — нативное поведение. Стрелки не обрабатываются.
- Focus management — нативный, `focus:outline-none focus-visible:ring-1` ([Button.vue:23](../../lib/button/Button.vue#L23)).
- `prefers-reduced-motion` не учитывается.

### Security

- Не рендерит HTML из props. v-html не используется.
- Без `eval`/`new Function`.
- CSP: inline-style инжекция только через `@layer fishtvue` (общий механизм). См. [Component class §12](../architecture/component-class.md#12-accessibility--security).

## 13. TypeScript

```ts
import type {
  ButtonProps, ButtonEmits, ButtonSlots, ButtonExpose,
  SimpleButtonProps, IconButtonProps
} from "fishtvue/button"
import { useTemplateRef } from "vue"
import Button from "fishtvue/button"

const btnRef = useTemplateRef<InstanceType<typeof Button>>("btn")
btnRef.value?.classBase
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Browser:** evergreen.
- **Stability flag:** `stable` — 100% покрытие тестами Button.vue, нет TODO/FIXME, типы без `any` в публичной части.
- **Breaking changes:** на момент ревизии (2026-05-09) не зафиксировано.
- **Deprecations:** не зафиксировано.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Button from "fishtvue/button/Button.vue"
import type { ButtonExpose } from "fishtvue/button/Button"

describe("Button", () => {
  it("applies global options", () => {
    const wrapper = mount(Button, {
      global: {
        plugins: [[FishtVue, { componentsOptions: { Button: { mode: "primary" } } }]]
      }
    })
    expect((wrapper.vm as unknown as ButtonExpose).mode).toBe("primary")
  })
})
```

Реальные тесты — [Button.test.ts](../../lib/button/Button.test.ts) (13 кейсов, оба describe-блока «Without/With Library Initialization»).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Цвета не применяются для `color="theme"` | Не задан `theme.semantic.customThemeColor`. | Передай в plugin: `theme: { semantic: { customThemeColor: "200deg" } }`. |
| `type="icon"` не показывает tooltip | Нет default-слота. | Добавь содержимое slot'а или используй `<Button :icon>` без icon-режима. |
| `loading` не показывает индикатор | Не задан как `true`. | `:loading="state"` явно с reactive ref. |
| Тёмная тема не активируется | `optionsTheme.darkModeSelector` не совпадает. | Согласуй селектор с DOM. |
| Override CSS-класса не работает | Стиль внутри `@layer fishtvue`. | См. §10.4. |
| `<Button @click="...">` не реагирует при `disabled` | Native: disabled `<button>` не получает click. | OK — by design. |

## 17. Related

- [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md) — composed внутри.
- [Label](./label.md), [Input](./input.md), [Form](./form.md) — соседние form-controls.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Button.vue](../../lib/button/Button.vue) и [Button.d.ts](../../lib/button/Button.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- В [Button.vue:346–348](../../lib/button/Button.vue#L346-L348) дублирующий вызов `Button.initStyle()` через `onMounted` — `Component.__hooks()` уже регистрирует `vueOnMounted(() => initStyle())`. Лишняя работа.
- Словари классов (`baseClasses`, `modesClasses`, `textColorsPrimaryClasses`, …) хранятся в `ref(...)` ([Button.vue:21–294](../../lib/button/Button.vue#L21-L294)) — реактивность не нужна, должно быть `const`.

### Skipped tests

В [Button.test.ts](../../lib/button/Button.test.ts) на момент ревизии skip'ов нет.

### API inconsistencies

- `BaseButtonProps.icon: string` — пустая строка `""` принимается как «нет иконки», но typesystem не отличает «не задано» от «пусто». Default из `withDefaults` отсутствует — неявный `undefined`.
- `ButtonOption` ([Button.d.ts:151](../../lib/button/Button.d.ts#L151)) **не включает** `disabled`, `loading`, `icon`, `iconPosition`, `type` — эти props нельзя задать глобально через `componentsOptions.Button`. Это может удивить.

### Behavioral caveats

- Для icon-only кнопок (`type="icon"`) внутренний `<button>` всегда `type="button"` — это значит, что внутри `<form>` icon-button не может быть submit-кнопкой даже теоретически.
- При `loading: true` + `disabled: false` кнопка визуально показывает loading и может быть нажата — нет автоматического `disabled`. Управляй сам.
- Hard-coded цветовые скейлы (`green-*`/`red-*` для `creative`/`destructive`) — не зависят от theme.semantic, не подхватывают custom-темы. Чтобы переопределить — передай через `props.class`.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
