---
title: Button
summary: Универсальная кнопка с modes (primary/outline/ghost), color, size, rounded, icon, loading.
updated: 2026-06-07
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

- **Lifecycle:** базовая инжекция стилей через `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) автоматически. Дополнительно `onMounted(() => Button.initStyle())` ([Button.vue:368–379](../../lib/button/Button.vue#L368-L379)) — дублирующий вызов (см. [dev-patterns §12](../dev-patterns.md#12-known-deviations-from-this-pattern)); тот же `onMounted` несёт dev-warning для unlabeled icon-кнопок.
- **Поток данных:** props + `Button.getOptions()` → computed (`type`, `icon`, `iconPosition`, `isLoading`, `disabled`, `resolvedAriaLabel`, `mode`, `size`, `rounded`, `color`) → `classBase` (через `Button.setStyle`) и `classIcon`. Resolve порядок: `props ?? options ?? default`. `resolvedAriaLabel` — `props.ariaLabel ?? (type === 'icon' ? icon : undefined)`.
- **Стили:** `Button.setStyle(...)` вычисляется в computed `classBase` ([Button.vue:321–332](../../lib/button/Button.vue#L321-L332)), пересчитывается на изменение mode/size/rounded/color/disabled. Классы инжектятся в `@layer fishtvue`.
- **Конфиг:** читает `componentsOptions.Button` (поля: `mode`, `size`, `rounded`, `color`, `class`, `classIcon`).
- **Локализация:** не использует `t()`.
- **SSR / hydration:** SSR-safe — нет прямых `document`/`window`. `Component.__hooks()` инжектит CSS через `onServerPrefetch` + `onMounted`.
- **Animation:** `motion-safe:transition-colors motion-safe:duration-200` ([Button.vue:26](../../lib/button/Button.vue#L26)) — `prefers-reduced-motion: reduce` отключает переходы автоматически.

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

`ButtonProps = SimpleButtonProps | IconButtonProps` ([Button.d.ts:117](../../lib/button/Button.d.ts#L117)). Общий базис `BaseButtonProps + ButtonStyle`.

| Prop           | Type                                                  | Default                            | Description                                                                                                                                                        |
| -------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`         | `"button" \| "reset" \| "submit" \| "icon"`           | `"button"`                         | `"icon"` — icon-only кнопка с FixWindow tooltip.                                                                                                                   |
| `icon`         | `string`                                              | `""`                               | Имя иконки (см. [Icons](./icons.md)).                                                                                                                              |
| `iconPosition` | `"start" \| "end" \| "left" \| "right"`               | `"end"`                            | Logical-позиция иконки в обычном режиме (`start` — перед контентом, `end` — после; RTL-safe). `"left"`/`"right"` — deprecated алиасы (`left → start`, `right → end`) с dev-warning. См. §12. |
| `disabled`     | `boolean`                                             | `false`                            | Стандартный disabled.                                                                                                                                              |
| `loading`      | `boolean`                                             | `undefined`                        | Показывает [Loading](./loading.md) внутри кнопки.                                                                                                                  |
| `ariaLabel`    | `string`                                              | `undefined`                        | Accessible name для screen-reader. Особенно важен для `type="icon"` без default-slot. Если опущен и `type="icon"` — fallback на имя иконки (`icon` prop). См. §12. |
| `mode`         | `"primary" \| "outline" \| "ghost"`                   | `"primary"` (или из global config) | Визуальный режим.                                                                                                                                                  |
| `size`         | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                | `"md"` (или из global config)      | Размер.                                                                                                                                                            |
| `rounded`      | `"none" \| "md" \| "lg" \| "full"`                    | `"md"` (или из global config)      | Радиус скругления.                                                                                                                                                 |
| `color`        | `"theme" \| "neutral" \| "creative" \| "destructive"` | `"neutral"` (или из global config) | Цветовая тема.                                                                                                                                                     |
| `class`        | `StyleClass`                                          | —                                  | Дополнительные классы для контейнера.                                                                                                                              |
| `classIcon`    | `StyleClass`                                          | —                                  | Классы для иконки.                                                                                                                                                 |

Defaults для `disabled` и `loading` — `undefined` через `withDefaults` ([Button.vue:13–17](../../lib/button/Button.vue#L13-L17)) — это намеренно: без значения работает auto-detect.

## 6. Events / Emits + v-model contract

`ButtonEmits` ([Button.d.ts:137–144](../../lib/button/Button.d.ts#L137-L144)):

| Event   | Payload      | When fired                                                                                                                                |
| ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `click` | `MouseEvent` | На нативный click по корневому `<button>`. Payload — пробрасываемое native MouseEvent (с `target`/`currentTarget`/`button`/координатами). |

Кнопка не интерсептит и не превращает payload. `disabled`-кнопки native click не отправляют (стандартное браузерное поведение).

v-model contract — не применимо.

## 7. Slots

`ButtonSlots` ([Button.d.ts:118–136](../../lib/button/Button.d.ts#L118-L136)).

| Slot      | Slot props | Description                                                                                                                                                                 |
| --------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | —          | Текст или произвольная разметка. В режиме `type="icon"` — content tooltip'а через [FixWindow](./fix-window.md).                                                             |
| `start`   | —          | Контент перед `default` и до иконки (`iconPosition="start"`). Используется для prepend-композиции — badge, status dot, counter и т. п. Не рендерится в `type="icon"` режиме. |
| `end`     | —          | Контент после `default`, иконки (`iconPosition="end"`) и loading-индикатора. Append-композиция. Не рендерится в `type="icon"` режиме.                                       |

## 8. Exposed methods

`ButtonExpose` ([Button.d.ts:148–205](../../lib/button/Button.d.ts#L148-L205)):

| Name              | Type                                            | Description                                                                                                           |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `buttonRef`       | `Readonly<Ref<HTMLButtonElement \| undefined>>` | Ref на корневой `<button>`. Доступ к native DOM для `.click()`/`.scrollIntoView()`/etc.                               |
| `mode`            | `ButtonProps["mode"]`                           | Текущий mode (computed).                                                                                              |
| `size`            | `ButtonProps["size"]`                           | Текущий size.                                                                                                         |
| `rounded`         | `ButtonProps["rounded"]`                        | Текущий rounded.                                                                                                      |
| `color`           | `ButtonProps["color"]`                          | Текущий color.                                                                                                        |
| `classBase`       | `ButtonProps["class"]`                          | Финальный CSS-класс корневого `<button>`.                                                                             |
| `classIcon`       | `ButtonProps["classIcon"]`                      | Финальный класс иконки.                                                                                               |
| `focus(options?)` | `(options?: FocusOptions) => void`              | Делает `buttonRef.focus(options)`. Опционально принимает native `FocusOptions` (например, `{ preventScroll: true }`). |
| `blur()`          | `() => void`                                    | Делает `buttonRef.blur()`.                                                                                            |

```ts
import { useTemplateRef } from "vue"
import type Button from "fishtvue/button"

const btnRef = useTemplateRef<InstanceType<typeof Button>>("btn")
console.log(btnRef.value?.mode)
btnRef.value?.focus() // programmatic focus
btnRef.value?.buttonRef // native HTMLButtonElement
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
  <Button type="icon" icon="check" rounded="full"> Confirm action </Button>
</template>
```

`type="icon"` рендерит иконку и при наличии default-slot показывает FixWindow-tooltip.

### 9.4 Icon-only с явным aria-label

```vue
<template>
  <Button type="icon" icon="Trash" aria-label="Delete user" rounded="full" />
</template>
```

`aria-label="Delete user"` — screen-reader озвучит «Delete user button» вместо безымянного «button». Если `aria-label` опущен, fallback'имся на имя иконки (`"Trash"` → «Trash button») — лучше чем ничего, но рекомендуется явный человекочитаемый текст.

### 9.5 Composition через slots `start` / `end`

```vue
<template>
  <Button color="theme">
    <template #start>
      <Icons type="Check" />
    </template>
    Save
    <template #end>
      <Badge mode="point" color="creative">12</Badge>
    </template>
  </Button>
</template>
```

`start` рендерится перед content, `end` — после loading-индикатора. Применимо только в не-icon режиме.

### 9.6 Programmatic focus через `useTemplateRef`

```vue
<script setup lang="ts">
  import { useTemplateRef } from "vue"
  import Button from "fishtvue/button"

  const submitBtn = useTemplateRef<InstanceType<typeof Button>>("submitBtn")

  function focusSubmit() {
    submitBtn.value?.focus({ preventScroll: true })
  }
</script>

<template>
  <Button ref="submitBtn" type="submit">Submit</Button>
  <button type="button" @click="focusSubmit">Jump to Submit</button>
</template>
```

### 9.7 Loading + disabled (например, привязанные к Pinia)

```vue
<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import Button from "fishtvue/button"
  import { useFormStore } from "@/stores/form"

  const store = useFormStore()
  const { isSubmitting } = storeToRefs(store)
</script>

<template>
  <Button type="submit" color="creative" :loading="isSubmitting" :disabled="isSubmitting" @click="store.submit">
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
  .fv.fishtvue-button {
    letter-spacing: 0.05em;
  }
}
```

См. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override).

## 11. Form integration & validation

Не применимо — Button сам не валидируется. Внутри [Form](./form.md) используется как submit-action: `<Button type="submit">`.

## 12. Accessibility & Security

### A11y

- Корневой элемент — `<button>`, имеет нативный focus/Enter/Space behavior.
- При `type="icon"` корневой `<button>` имеет `type="button"` ([Button.vue:385](../../lib/button/Button.vue#L385)) — не отправляет form по умолчанию.
- `disabled` — нативный атрибут, screen-reader озвучивает.
- `aria-label` — поддерживается через prop `ariaLabel` ([Button.d.ts:78–89](../../lib/button/Button.d.ts#L78-L89), [Button.vue:388](../../lib/button/Button.vue#L388)). Для `type="icon"` без `ariaLabel` и без default-slot fallback'имся на имя иконки (`icon` prop) — это хоть какой-то accessible name. Рекомендуется задавать явный человекочитаемый `aria-label`. Если ничего не задано — на mount Button пишет `console.warn` в DEV ([Button.vue:368–379](../../lib/button/Button.vue#L368-L379)).
- `aria-pressed` для toggle-режима не реализовано (Button не is-state-component).
- Keyboard: Tab/Enter/Space — нативное поведение. Стрелки не обрабатываются.
- Focus management — нативный, `focus:outline-none focus-visible:ring-1` ([Button.vue:23](../../lib/button/Button.vue#L23)). Programmatic `focus()` / `blur()` — через exposed методы (см. §8).
- `prefers-reduced-motion` учитывается: transition'ы применяются через `motion-safe:` вариант ([Button.vue:26](../../lib/button/Button.vue#L26)) — `@media (prefers-reduced-motion: reduce)` отключает их автоматически.
- RTL: `iconPosition` использует logical-значения `"start"`/`"end"`. Так как корневой `<button>` — `inline-flex`, его main-axis следует document direction, поэтому при `dir="rtl"` иконка `start` визуально оказывается справа без дополнительного CSS. `"left"`/`"right"` остаются как deprecated алиасы (`left → start`, `right → end`) с DEV-warning ([Button.vue:299–308](../../lib/button/Button.vue#L299-L308)). Loading-индикатор использует logical-отступ `-me-2` (а не физический `-mr-2`), поэтому тоже корректен в RTL.

### Security

- Не рендерит HTML из props. v-html не используется.
- Без `eval`/`new Function`.
- CSP: inline-style инжекция только через `@layer fishtvue` (общий механизм). См. [Component class §12](../architecture/component-class.md#12-accessibility--security).

## 13. TypeScript

```ts
import type {
  ButtonProps,
  ButtonEmits,
  ButtonSlots,
  ButtonExpose,
  SimpleButtonProps,
  IconButtonProps
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
- **Breaking changes:** на момент ревизии (2026-05-10) не зафиксировано. `ButtonEmits` сменился с `null` на typed `{ click: MouseEvent }` — это additive change: подписчики `@click` продолжают работать, новые получают корректный type-hint.
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

Реальные тесты — [Button.test.ts](../../lib/button/Button.test.ts) (27 кейсов: «Without Library Initialization» — 10, «With Library Initialization» — 3, «A11y, refs, slots, emits (issues 2/4/10/11/12)» — 14).

## 16. Troubleshooting / FAQ

| Проблема                                            | Причина                                        | Решение                                                                  |
| --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Цвета не применяются для `color="theme"`            | Не задан `theme.semantic.customThemeColor`.    | Передай в plugin: `theme: { semantic: { customThemeColor: "200deg" } }`. |
| `type="icon"` не показывает tooltip                 | Нет default-слота.                             | Добавь содержимое slot'а или используй `<Button :icon>` без icon-режима. |
| `loading` не показывает индикатор                   | Не задан как `true`.                           | `:loading="state"` явно с reactive ref.                                  |
| Тёмная тема не активируется                         | `optionsTheme.darkModeSelector` не совпадает.  | Согласуй селектор с DOM.                                                 |
| Override CSS-класса не работает                     | Стиль внутри `@layer fishtvue`.                | См. §10.4.                                                               |
| `<Button @click="...">` не реагирует при `disabled` | Native: disabled `<button>` не получает click. | OK — by design.                                                          |

## 17. Related

- [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md) — composed внутри.
- [Label](./label.md), [Input](./input.md), [Form](./form.md) — соседние form-controls.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-10) комментариев `TODO/FIXME/HACK/XXX` в [Button.vue](../../lib/button/Button.vue) и [Button.d.ts](../../lib/button/Button.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- В [Button.vue:368–379](../../lib/button/Button.vue#L368-L379) дублирующий вызов `Button.initStyle()` через `onMounted` — `Component.__hooks()` уже регистрирует `vueOnMounted(() => initStyle())`. Лишняя работа.
- Словари классов (`baseClasses`, `modesClasses`, `textColorsPrimaryClasses`, …) хранятся в `ref(...)` ([Button.vue:21–294](../../lib/button/Button.vue#L21-L294)) — реактивность не нужна, должно быть `const`.

### Skipped tests

В [Button.test.ts](../../lib/button/Button.test.ts) на момент ревизии skip'ов нет.

### API inconsistencies

- `BaseButtonProps.icon: string` — пустая строка `""` принимается как «нет иконки», но typesystem не отличает «не задано» от «пусто». Default из `withDefaults` отсутствует — неявный `undefined`.
- `ButtonOption` ([Button.d.ts:206](../../lib/button/Button.d.ts#L206)) **не включает** `disabled`, `loading`, `icon`, `iconPosition`, `type`, `ariaLabel` — эти props нельзя задать глобально через `componentsOptions.Button`. Это может удивить.

### Behavioral caveats

- Для icon-only кнопок (`type="icon"`) внутренний `<button>` всегда `type="button"` — это значит, что внутри `<form>` icon-button не может быть submit-кнопкой даже теоретически.
- При `loading: true` + `disabled: false` кнопка визуально показывает loading и может быть нажата — нет автоматического `disabled`. Управляй сам.
- Hard-coded цветовые скейлы (`green-*`/`red-*` для `creative`/`destructive`) — не зависят от theme.semantic, не подхватывают custom-темы. Чтобы переопределить — передай через `props.class`.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
