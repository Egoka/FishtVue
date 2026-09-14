---
title: Button
summary: Универсальная кнопка с variants (primary/outline/ghost), color, size, rounded, icon, loading.
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Button

## 1. Overview

`Button` — стандартная кнопка с тремя визуальными вариантами (`variant: primary | outline | ghost`), четырьмя цветовыми темами (`theme | neutral | creative | destructive`), пятью размерами (`xs | sm | md | lg | xl`), четырьмя вариантами рамки (`none | md | lg | full`), поддержкой иконки (через [Icons](./icons.md)), loading-индикатора и icon-only режима с tooltip через [FixWindow](./fix-window.md).

Stability: `stable` (есть тесты — 13 кейсов; покрытие Button.vue 100%).

Source: [Source](../../lib/button/Button.vue), [Button.d.ts](../../lib/button/Button.d.ts), [Button.test.ts](../../lib/button/Button.test.ts).

## 2. How it's organized

```
lib/button/
├── Button.vue          # SFC, ~380 строк
├── Button.d.ts         # ButtonProps (Simple|Icon), ButtonClassKey, ButtonSlots, ButtonEmits=null, ButtonExpose, ButtonOption
├── Button.test.ts      # 13 кейсов
└── package.json
```

Внутренние зависимости (через `find_usages`): использует [Icons](./icons.md), [Loading](./loading.md), [FixWindow](./fix-window.md). Базируется на [Component class](../architecture/component-class.md).

Внешние зависимости: нет (только Vue + transitively `clsx`/`tailwind-merge` через [tailwindHandler](../utilities/tailwindHandler.md)).

Tree-shaking & bundle: `import Button from "fishtvue/button"` импортирует SFC + TS-типы из `lib/button/`. При root-импорте `import { Button } from "fishtvue"` — barrel ([lib/index.ts:14–15](../../lib/index.ts#L14-L15)) тоже tree-shake-friendly.

## 3. How it works

- **Lifecycle:** базовая инжекция стилей через `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) автоматически. Дополнительно `onMounted(() => Button.initStyle())` ([Button.vue:425–436](../../lib/button/Button.vue#L425-L436)) — дублирующий вызов (см. [dev-patterns §12](../dev-patterns.md#12-known-deviations-from-this-pattern)); тот же `onMounted` несёт dev-warning для unlabeled icon-кнопок.
- **Поток данных:** props + `Button.getOptions()` → computed (`type`, `icon`, `iconPosition`, `isLoading`, `disabled`, `resolvedAriaLabel`, `variant`, `size`, `rounded`, `color`) → `classBase` (через `cls("root", …)`) и hand-off'ы `classIcon`/`classLoading` (через `raw(key)`, без setStyle-префикса — их компилирует ребёнок). Resolve порядок: `props ?? options ?? default`. `resolvedAriaLabel` — `props.ariaLabel ?? (type === 'icon' ? icon : undefined)`.
- **Стили:** `classBase` = `cls("root", …)` ([Button.vue:375](../../lib/button/Button.vue#L375)), пересчитывается на изменение variant/size/rounded/color/disabled. Порядок склейки — база → variant → state → `options.classes.root` → `props.classes.root` → `options.class` → `props.class` (dev-patterns §2 D). Классы инжектятся в `@layer fishtvue`.
- **Конфиг:** читает `componentsOptions.Button` (поля: `variant`, `size`, `rounded`, `color`, `class`, `classes`) + глобальный `componentsStyle` как fallback для `variant` (`filled→primary` / `outlined→outline` / `underlined→ghost`).
- **Bundle:** `Loading` и `FixWindow` подключены через `defineAsyncComponent` — текстовая `<Button>` (без `loading` и без icon-tooltip) не тянет их в синхронный chunk (Issue 6).
- **Локализация:** не использует `t()`.
- **SSR / hydration:** SSR-safe — нет прямых `document`/`window`. `Component.__hooks()` инжектит CSS через `onServerPrefetch` + `onMounted`.
- **Animation:** `motion-safe:transition-colors motion-safe:duration-200` ([Button.vue:37](../../lib/button/Button.vue#L37)) — `prefers-reduced-motion: reduce` отключает переходы автоматически.

## 4. Quick Start

```vue
<script setup lang="ts">
  import Button from "fishtvue/button"
</script>

<template>
  <Button variant="primary" color="theme" size="md">Submit</Button>
</template>
```

## 5. Props

`ButtonProps = SimpleButtonProps | IconButtonProps` ([Button.d.ts:144](../../lib/button/Button.d.ts#L144)). Общий базис `BaseButtonProps + ButtonStyle`.

| Prop           | Type                                                  | Default                            | Description                                                                                                                                                        |
| -------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`         | `"button" \| "reset" \| "submit" \| "icon"`           | `"button"`                         | `"icon"` — icon-only кнопка с FixWindow tooltip.                                                                                                                   |
| `icon`         | `string`                                              | `""`                               | Имя иконки (см. [Icons](./icons.md)).                                                                                                                              |
| `iconPosition` | `"start" \| "end"`                                    | `"end"`                            | Logical-позиция иконки (`start` — перед контентом, `end` — после; RTL-safe). Физические `"left"`/`"right"` сняты в major 2026-09-06. См. §12. |
| `disabled`     | `boolean`                                             | `false`                            | Стандартный disabled.                                                                                                                                              |
| `loading`      | `boolean`                                             | `undefined`                        | Показывает [Loading](./loading.md) внутри кнопки.                                                                                                                  |
| `ariaLabel`    | `string`                                              | `undefined`                        | Accessible name для screen-reader. Особенно важен для `type="icon"` без default-slot. Если опущен и `type="icon"` — fallback на имя иконки (`icon` prop). См. §12. |
| `variant`      | `"primary" \| "outline" \| "ghost"`                   | `"primary"` (или из global config) | Визуальный вариант (бывший `mode`, значения те же).                                                                                                                |
| `size`         | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                | `"md"` (или из global config)      | Размер.                                                                                                                                                            |
| `rounded`      | `"none" \| "md" \| "lg" \| "full"`                    | `"md"` (или из global config)      | Радиус скругления.                                                                                                                                                 |
| `color`        | `"theme" \| "neutral" \| "creative" \| "destructive"` | `"neutral"` (или из global config) | Цветовая тема.                                                                                                                                                     |
| `class`        | `StyleClass`                                          | —                                  | Классы **только корня** `[data-button]` (dev-patterns §2 A).                                                                                                        |
| `classes`      | `ClassesMap<ButtonClassKey>`                          | —                                  | Карта внутренних элементов: `icon`, `loading`; `root` ≡ `class`. См. §5.1.                                                                                          |
| `as`           | `string \| Component`                                 | `"button"`                         | Polymorphic корневой тег/компонент (`<a>` / `<RouterLink>` / `<NuxtLink>`). Для не-button/не-`<a>` — авто `role="button"` + `tabindex`; нативный `type` только на `<button>`; `href`/`to`/`target` пробрасываются. См. §10.5. |

Defaults для `disabled` и `loading` — `undefined` через `withDefaults` ([Button.vue:22–25](../../lib/button/Button.vue#L22-L25)) — это намеренно: без значения работает auto-detect.

### 5.1 Classes keys

`ButtonClassKey = "icon" | "loading"` ([Button.d.ts:18](../../lib/button/Button.d.ts#L18)). Оба ключа — hand-off'ы в корни дочерних компонентов: `:class` ребёнка = его корень, поэтому сегменты потребителя уходят туда через `raw(key)` без `setStyle`-префикса Button (компилирует их сам ребёнок).

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-button]` | element | база + `variant`/`color`/`size`/`rounded` + `disabled:opacity-50` |
| `icon` | `[data-button-icon]` (= корень [Icons](./icons.md) `[data-icon]`) | element | `inline-flex items-center` + text-цвет варианта (бывший `classIcon`) |
| `loading` | `[data-button-loading]` (= корень [Loading](./loading.md) `[data-loading]`) | element | — (позиционирование `absolute` / `-me-2` даёт сам Button) |

Собственные маркеры `data-button-icon` / `data-button-loading` нужны потому, что state-атрибут `:data-loading` висит на корне самой кнопки — селектор `[data-loading]` без них попадал бы в оба узла.

## 6. Events / Emits + v-model contract

`ButtonEmits` ([Button.d.ts:165–174](../../lib/button/Button.d.ts#L165-L174)):

| Event   | Payload      | When fired                                                                                                                                |
| ------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `click` | `MouseEvent` | На нативный click по корневому элементу (по умолчанию `<button>`; при polymorphic `as` — соответствующему тегу). Payload — пробрасываемое native MouseEvent (с `target`/`currentTarget`/`button`/координатами). |

Кнопка не интерсептит и не превращает payload. `disabled`-кнопки native click не отправляют (стандартное браузерное поведение).

v-model contract — не применимо.

## 7. Slots

`ButtonSlots` ([Button.d.ts:145–163](../../lib/button/Button.d.ts#L145-L163)).

| Slot      | Slot props | Description                                                                                                                                                                 |
| --------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | —          | Текст или произвольная разметка. В режиме `type="icon"` — content tooltip'а через [FixWindow](./fix-window.md).                                                             |
| `start`   | —          | Контент перед `default` и до иконки (`iconPosition="start"`). Используется для prepend-композиции — badge, status dot, counter и т. п. Не рендерится в `type="icon"` режиме. |
| `end`     | —          | Контент после `default`, иконки (`iconPosition="end"`) и loading-индикатора. Append-композиция. Не рендерится в `type="icon"` режиме.                                       |

## 8. Exposed methods

`ButtonExpose` ([Button.d.ts:176–233](../../lib/button/Button.d.ts#L176-L233)):

| Name              | Type                                            | Description                                                                                                           |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `buttonRef`       | `Readonly<Ref<HTMLElement \| undefined>>`       | Ref на корневой элемент (`<button>` по умолчанию; при polymorphic `as` — соответствующий тег). Доступ к native DOM.    |
| `variant`         | `ButtonProps["variant"]`                        | Текущий variant (computed).                                                                                           |
| `size`            | `ButtonProps["size"]`                           | Текущий size.                                                                                                         |
| `rounded`         | `ButtonProps["rounded"]`                        | Текущий rounded.                                                                                                      |
| `color`           | `ButtonProps["color"]`                          | Текущий color.                                                                                                        |
| `classBase`       | `ButtonProps["class"]`                          | Финальный CSS-класс корневого `<button>`.                                                                             |
| `classIcon`       | `StyleClass`                                    | Финальный класс, уходящий в корень `Icons`.                                                                           |
| `focus(options?)` | `(options?: FocusOptions) => void`              | Делает `buttonRef.focus(options)`. Опционально принимает native `FocusOptions` (например, `{ preventScroll: true }`). |
| `blur()`          | `() => void`                                    | Делает `buttonRef.blur()`.                                                                                            |

```ts
import { useTemplateRef } from "vue"
import type Button from "fishtvue/button"

const btnRef = useTemplateRef<InstanceType<typeof Button>>("btn")
console.log(btnRef.value?.variant)
btnRef.value?.focus() // programmatic focus
btnRef.value?.buttonRef // корневой HTMLElement (по умолчанию <button>)
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
    Button: { variant: "outline", color: "theme", size: "lg" }
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
      <Badge point variant="secondary">12</Badge>
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

`ButtonOption = Pick<ButtonProps, "variant" | "size" | "rounded" | "color" | "class" | "classes">` ([Button.d.ts:235](../../lib/button/Button.d.ts#L235)). Карта `classes` сливается с props **по ключу** (dev-patterns §2 C).

```ts
app.use<FishtVueConfiguration>(FishtVue, {
  componentsOptions: {
    Button: {
      variant: "primary",
      size: "md",
      rounded: "md",
      color: "theme",
      class: "shadow-sm",
      classes: { icon: "size-4" }
    }
  }
})
```

**Global `componentsStyle`.** Помимо `componentsOptions.Button.variant`, Button реагирует на глобальный `componentsStyle` (`"filled" | "outlined" | "underlined"`): он маппится в `variant` через computed `componentsStyleVariant` ([Button.vue](../../lib/button/Button.vue)) — `filled → primary`, `outlined → outline`, `underlined → ghost`. Приоритет резолва: `props.variant` → `componentsOptions.Button.variant` → `componentsStyle`-mapping → `"primary"`.

```ts
app.use(FishtVue, { componentsStyle: "outlined" }) // <Button> по умолчанию рендерится как variant="outline"
```

### 10.2 Per-instance

Любое поле из `ButtonOption` переопределяется через props.

### 10.3 Theming

- Цветовые токены: `theme.*`, `neutral.*`, `green.*`, `red.*` (для `creative`/`destructive`). См. [Theme](../architecture/theme.md).
- Dark mode классы (`dark:*`) включены в каждой ветке `variant/color`.
- Кастомные токены через `theme.semantic.customThemeColor` влияют на `bg-theme-*`/`text-theme-*`.
- **Print:** `baseClasses` содержит `print:*` варианты (`print:border print:bg-white print:text-black print:shadow-none`) — при печати кнопка рендерится монохромно и читаемо, а не скрывается (канон Input/Loading/Table).

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

### 10.5 As link / NuxtLink (polymorphic `as`)

Проп `as` меняет корневой тег/компонент, сохраняя стили и slot-композицию Button:

```vue
<!-- ссылка, выглядит как кнопка -->
<Button as="a" href="/docs" color="theme">Docs</Button>

<!-- Nuxt-навигация -->
<Button :as="NuxtLink" to="/profile" variant="outline">Profile</Button>
```

Поведение:

- Дефолт — нативный `<button>` (`type` применяется только к нему; `type="icon"` → `type="button"`).
- `as="a"` — рендерит `<a>`; `href`/`target`/`rel` пробрасываются через attribute fallthrough; `role` не добавляется (ссылка уже интерактивна).
- Любой другой тег (`"span"`, `"div"`) или компонент — добавляются `role="button"` + `tabindex="0"` (либо `-1` + `aria-disabled="true"` при `disabled`) для клавиатурной доступности.
- `buttonRef` (expose) указывает на корневой элемент независимо от `as`.

## 11. Form integration & validation

Не применимо — Button сам не валидируется. Внутри [Form](./form.md) используется как submit-action: `<Button type="submit">`.

## 12. Accessibility & Security

### A11y

- Корневой элемент — `<button>`, имеет нативный focus/Enter/Space behavior.
- При `type="icon"` корневой `<button>` имеет `type="button"` ([Button.vue:385](../../lib/button/Button.vue#L385)) — не отправляет form по умолчанию.
- `disabled` — нативный атрибут, screen-reader озвучивает.
- `aria-label` — поддерживается через prop `ariaLabel` ([Button.d.ts:99–108](../../lib/button/Button.d.ts#L99-L108), [Button.vue:388](../../lib/button/Button.vue#L388)). Для `type="icon"` без `ariaLabel` и без default-slot fallback'имся на имя иконки (`icon` prop) — это хоть какой-то accessible name. Рекомендуется задавать явный человекочитаемый `aria-label`. Если ничего не задано — на mount Button пишет `console.warn` в DEV ([Button.vue:425–436](../../lib/button/Button.vue#L425-L436)).
- `aria-pressed` для toggle-режима не реализовано (Button не is-state-component).
- Keyboard: Tab/Enter/Space — нативное поведение. Стрелки не обрабатываются.
- Focus management — нативный, `focus:outline-none focus-visible:ring-1` ([Button.vue:23](../../lib/button/Button.vue#L23)). Programmatic `focus()` / `blur()` — через exposed методы (см. §8).
- `prefers-reduced-motion` учитывается: transition'ы применяются через `motion-safe:` вариант ([Button.vue:37](../../lib/button/Button.vue#L37)) — `@media (prefers-reduced-motion: reduce)` отключает их автоматически.
- RTL: `iconPosition` использует logical-значения `"start"`/`"end"`. Так как корневой `<button>` — `inline-flex`, его main-axis следует document direction, поэтому при `dir="rtl"` иконка `start` визуально оказывается справа без дополнительного CSS. Физические `"left"`/`"right"` сняты — неизвестное значение сводится к дефолту `"end"` ([Button.vue:317](../../lib/button/Button.vue#L317)). Loading-индикатор использует logical-отступ `-me-2` (а не физический `-mr-2`), поэтому тоже корректен в RTL.

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
- **Breaking changes (1.0.0, редизайн props):**
  - `mode` → `variant` (значения те же); `componentsOptions.Button.mode` → `.variant`; глобальный `componentsStyle` маппится в `variant`.
  - `classIcon` → `classes.icon`; добавлен ключ `classes.loading`; `class` теперь адресует **только** корень.
  - `ButtonOption` — `Pick<…, "variant" | "size" | "rounded" | "color" | "class" | "classes">`.
  - expose: `mode` → `variant`.
  - DOM: hand-off'ы получили собственные маркеры `data-button-icon` / `data-button-loading`.
  - Ранее (0.2.x): `ButtonEmits` сменился с `null` на typed `{ click: MouseEvent }` — additive change.
- **Deprecations:** нет — старые имена сняты без алиасов (решение R6).

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
        plugins: [[FishtVue, { componentsOptions: { Button: { variant: "primary" } } }]]
      }
    })
    expect((wrapper.vm as unknown as ButtonExpose).variant).toBe("primary")
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

- В [Button.vue:425–436](../../lib/button/Button.vue#L425-L436) дублирующий вызов `Button.initStyle()` через `onMounted` — `Component.__hooks()` уже регистрирует `vueOnMounted(() => initStyle())`. Лишняя работа.
- Словари классов (`baseClasses`, `variantsClasses`, `textColorsPrimaryClasses`, …) хранятся в `ref(...)` ([Button.vue:32–310](../../lib/button/Button.vue#L32-L310)) — реактивность не нужна, должно быть `const`.

### Skipped tests

В [Button.test.ts](../../lib/button/Button.test.ts) на момент ревизии skip'ов нет.

### API inconsistencies

- `BaseButtonProps.icon: string` — пустая строка `""` принимается как «нет иконки», но typesystem не отличает «не задано» от «пусто». Default из `withDefaults` отсутствует — неявный `undefined`.
- `ButtonOption` ([Button.d.ts:235](../../lib/button/Button.d.ts#L235)) **не включает** `disabled`, `loading`, `icon`, `iconPosition`, `type`, `ariaLabel` — эти props нельзя задать глобально через `componentsOptions.Button`. Это может удивить.

### Behavioral caveats

- Для icon-only кнопок (`type="icon"`) внутренний `<button>` всегда `type="button"` — это значит, что внутри `<form>` icon-button не может быть submit-кнопкой даже теоретически.
- При `loading: true` + `disabled: false` кнопка визуально показывает loading и может быть нажата — нет автоматического `disabled`. Управляй сам.
- Hard-coded цветовые скейлы (`green-*`/`red-*` для `creative`/`destructive`) — не зависят от theme.semantic, не подхватывают custom-темы. Чтобы переопределить — передай через `props.class`.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
