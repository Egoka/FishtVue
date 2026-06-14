---
title: FixWindow
summary: Плавающее окно (popover/tooltip), позиционирование через Floating UI с auto-flip/auto-shift, опциональный Teleport в body, focus trap, ARIA-семантика, motion-safe transitions, RTL-aware logical placement.
updated: 2026-06-14
stability: stable
since: 0.2.11
---

# FixWindow

## 1. Overview

`FixWindow` — плавающее окно: popover, tooltip, attached menu. Позиционируется относительно `el` (DOM-узел или selector) или курсора (`byCursor: true`) через [`@floating-ui/vue`](https://floating-ui.com/) — auto-flip при достижении viewport edge, auto-shift при overflow, scroll/resize tracking. 13 значений `position`, `eventOpen`/`eventClose` (`hover/click/mousedown/mouseup/dblclick/contextmenu/none`), задержка открытия, отступ от viewport, опциональный Teleport в body для popover'ов внутри scroll-parent'ов с `overflow: hidden / auto`, опциональный focus trap для popover-form, динамический ARIA role.

Stability: `stable` — 82 кейса, coverage 88.4% statements / 83.8% branch (Wave 1 close-out 2026-05-16).

Source: [Source](../../lib/fixwindow/FixWindow.vue), [FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts), [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts).

## 2. How it's organized

```
lib/fixwindow/
├── FixWindow.vue
├── FixWindow.d.ts        # 261 строка
├── FixWindow.test.ts     # 82 кейса
└── package.json          # main, module, types, sideEffects: false
```

Зависимости: [Button](./button.md) (close-кнопка), `@heroicons/vue/20/solid` (XMarkIcon), [domHandler.isClient](../utilities/domHandler.md), [`@floating-ui/vue`](https://floating-ui.com/docs/vue) (positioning), [`@vueuse/core`](https://vueuse.org/) (`onClickOutside` — Teleport-aware click-outside detection).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) инжектит стили на `onServerPrefetch + vueOnMounted`; `onMounted` подписывается на trigger-event (`addOpenListener`); `onBeforeUnmount` снимает все listeners + tears down click-outside / Escape / autoUpdate-listener'ы движка позиционирования.
- **Поток позиционирования:** собственный **dependency-free** движок [`useFloating(referenceRef, fixWindow, { placement, strategy, offset, padding, scrollableEl, open })`](../../lib/fixwindow/useFloating.ts) (замена `@floating-ui/vue`, 2026-06-14): чистое ядро `computePosition(rects)` (placement + offset + flip + shift) + реактивная обёртка (rects через `getBoundingClientRect`, autoUpdate = scroll/resize/`ResizeObserver`-listeners пока открыто). FishtVue `position` мапится в `Placement` через `positionToPlacement(...)`: `top-left → top-start`, `top-right → top-end`, …, `right-top → right-start` и т.д. — `-start`/`-end` логические, зеркалятся на documents с `dir="rtl"`. В `offset` идёт **только** `translatePx`; зазор `marginPx` создаётся прозрачным `border` (hover-bridge), иначе `marginPx` учитывался бы дважды — двойной зазор + dead-zone (см. [issues/done/fixwindow.md Issue 2](../issues/done/fixwindow.md)).
- **byCursor:** virtual reference element создаётся в `virtualReferenceEl` computed на основе `positionMouse: { x, y }` из MouseEvent — движок работает с виртуальной точкой (0×0 rect) как с рефом.
- **Click-outside:** собственный **dependency-free** [`useClickOutside(fixWindow, close, { ignore: [trigger], events: [eventClose] })`](../../lib/fixwindow/useClickOutside.ts) (замена `@vueuse/core onClickOutside`, 2026-06-14): listener на `document` (capture), «снаружи» определяется через `event.composedPath()` — Teleport/Shadow-DOM-aware; слушает именно `eventClose`-событие.
- **Click-outside:** через `onClickOutside(fixWindow, callback, { ignore: [element] })` — Teleport-aware (правильно работает когда popover вынесен в body).
- **Focus trap:** native реализация (mirror Dialog) — `FOCUSABLE_SELECTOR` + `getFocusable` + `onPopoverKeydown` циклит Tab/Shift+Tab между focusable элементами. Активируется через `focusTrap: true` prop.
- **Focus return:** при `focusTrap: true` сохраняется `document.activeElement` в `triggerEl` ref при open; при close через `nextTick` возвращается focus на trigger (если `returnFocus !== false`).
- **ARIA:** `role` динамически — `eventOpen: "hover"` → `"tooltip"`, иначе `"dialog"`; явное переопределение через `role` prop. `aria-label`/`aria-labelledby`/`aria-describedby` forwardятся на корневой узел; `labelledby` имеет приоритет над `label` (browser-канон).
- **Escape:** при `focusTrap: true` или `eventClose !== "none"` — global `keydown` listener закрывает popover на Escape.
- **Touch fallback:** `eventOpen: "hover"` добавляет `touchstart` listener на trigger (mobile-устройства, где hover не fires).
- **Стили:** `FixWindow.setStyle()`; все transitions через `motion-safe:` префикс (Tailwind transpилирует в `@media (prefers-reduced-motion: no-preference)`). Опционально close-кнопка через [Button](./button.md) с `end-2` (Tailwind logical inline-end — RTL-safe).
- **Конфиг:** `componentsOptions.FixWindow` — см. §10.
- **Локализация:** `FixWindow.t("fixwindow.close")` для aria-label close-кнопки (en/ru).
- **SSR:** SFC безопасен для SSR — все DOM-зависимые операции guarded через `isClient()`. На сервере popover не рендерится; client-mount подхватывает.
- **Animation:** `motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300`.

## 4. Quick Start

```vue
<script setup lang="ts">
  import FixWindow from "fishtvue/fixwindow"
</script>

<template>
  <button id="trigger">Hover me</button>
  <FixWindow el="#trigger" position="bottom" event-open="hover"> Tooltip text </FixWindow>
</template>
```

## 5. Props

`FixWindowProps` ([FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts)):

| Prop                  | Type                                                   | Default                                       | Description                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`          | `boolean`                                              | —                                             | v-model видимость.                                                                                                                                                                                                                                             |
| `el`                  | `RefLink` (`string` selector \| `HTMLElement`)         | parent component                              | Целевой элемент trigger'а. Если не задан — родитель компонента.                                                                                                                                                                                                |
| `scrollableEl`        | `RefLink`                                              | —                                             | Скролл-контейнер (для absolute-positioning).                                                                                                                                                                                                                   |
| `typePosition`        | `"absolute" \| "fixed"`                                | `"absolute"` if `scrollableEl` else `"fixed"` | Floating UI strategy.                                                                                                                                                                                                                                          |
| `position`            | `Position` (13 опций)                                  | `"top"` / `"center-bottom"` (byCursor)        | Позиция относительно trigger'а: `top`, `top-left`, `top-right`, `bottom`, `bottom-left`, `bottom-right`, `left`, `left-top`, `left-bottom`, `right`, `right-top`, `right-bottom`, `center`. Мапится в Floating UI logical `start`/`end` placement — RTL-aware. |
| `class` / `classBody` | `StyleClass`                                           | —                                             | Контейнер / тело.                                                                                                                                                                                                                                              |
| `mode`                | `StyleMode` (`"filled" \| "outlined" \| "underlined"`) | —                                             | Стиль; fallback на `FixWindow.componentsStyle()`.                                                                                                                                                                                                              |
| `eventOpen`           | `FixWindowEvent`                                       | `"hover"`                                     | `hover \| click \| mousedown \| mouseup \| dblclick \| contextmenu \| none`. Для `"hover"` дополнительно регистрируется `touchstart` (touch fallback).                                                                                                         |
| `eventClose`          | `FixWindowEvent`                                       | auto (см. `defaultCloseEvent`)                | Аналогично. Click-based close через VueUse `onClickOutside` — Teleport-aware.                                                                                                                                                                                  |
| `delay`               | `number \| 100 \| 500 \| 1000 \| 1500 \| 2000`         | `0`                                           | Задержка открытия (ms).                                                                                                                                                                                                                                        |
| `marginPx`            | `number \| 2 \| 5 \| 10`                               | `10`                                          | Видимый зазор между popover и trigger — задаётся прозрачным `border` (он же hover-bridge: курсор не покидает окно при переходе trigger → window). НЕ через Floating UI `offset` (иначе зазор удвоился бы + появился dead-zone). border-box-кромка окна остаётся вплотную к триггеру.                                                                                                                                                                                                         |
| `translatePx`         | `number \| 2 \| 5 \| 10`                               | `0`                                           | Тонкая подстройка смещения по главной оси — единственное, что идёт в Floating UI `offset` (с `marginPx` **не** суммируется).                                                                                                                                                                                                      |
| `paddingWindow`       | `number \| 2 \| 5 \| 10`                               | `0`                                           | Padding от viewport (Floating UI `flip` + `shift` middleware).                                                                                                                                                                                                 |
| `byCursor`            | `boolean`                                              | `false`                                       | Позиционировать по cursor click coordinates (virtual reference).                                                                                                                                                                                               |
| `closeButton`         | `boolean`                                              | `false`                                       | Показать `×`-кнопку с localized aria-label (`fixwindow.close`).                                                                                                                                                                                                |
| `stopOpenPropagation` | `boolean`                                              | `false`                                       | `stopImmediatePropagation` при открытии.                                                                                                                                                                                                                       |
| `teleport`            | `string \| HTMLElement \| false`                       | `false`                                       | Teleport target для popover. `false` — inline-render (backward compat). `"body"` — рекомендованный target для popover'ов внутри scroll-parent'ов. Также CSS-селектор или `HTMLElement`.                                                                        |
| `focusTrap`           | `boolean`                                              | `false`                                       | Включает focus trap (Tab/Shift+Tab циклятся между focusable элементами). Native реализация (mirror Dialog).                                                                                                                                                    |
| `role`                | `"tooltip" \| "dialog" \| "menu"`                      | auto                                          | Семантическая ARIA role. Авто-резолв: `eventOpen: "hover"` → `"tooltip"`, иначе `"dialog"`.                                                                                                                                                                    |
| `ariaLabel`           | `string`                                               | —                                             | Accessible label корневого элемента (когда нет `aria-labelledby`).                                                                                                                                                                                             |
| `ariaLabelledby`      | `string`                                               | —                                             | ID элемента-заголовка. Имеет приоритет над `aria-label`.                                                                                                                                                                                                       |
| `ariaDescribedby`     | `string`                                               | —                                             | ID элемента-описания.                                                                                                                                                                                                                                          |
| `initialFocus`        | `string`                                               | —                                             | CSS-селектор внутри popover для автофокуса при open (с `focusTrap: true`). По умолчанию — первый focusable.                                                                                                                                                    |
| `returnFocus`         | `boolean`                                              | `true`                                        | Возвращать focus на trigger при close (с `focusTrap: true`).                                                                                                                                                                                                   |

## 6. Events / Emits + v-model contract

| Event               | Payload                   | When fired            |
| ------------------- | ------------------------- | --------------------- |
| `update:modelValue` | `boolean`                 | Видимость изменилась. |
| `open`              | `MouseEvent \| undefined` | Окно открыто.         |
| `close`             | `MouseEvent \| undefined` | Окно закрыто.         |

v-model: `v-model="visible"` стандартный.

## 7. Slots

| Slot      | Slot props | Description   |
| --------- | ---------- | ------------- |
| `default` | —          | Контент окна. |

## 8. Exposed methods

`FixWindowExpose`:

| Name                                                                        | Type                           | Description                                                                                         |
| --------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `x`, `y`                                                                    | `string`                       | Текущие координаты (CSS units; `"auto"` пока popover не открыт).                                    |
| `isOpen`                                                                    | `boolean`                      | Открыт ли.                                                                                          |
| `position`, `delay`, `marginPx`, `isCloseButton`, `eventOpen`, `eventClose` | derived                        | Computed.                                                                                           |
| `element`                                                                   | `HTMLElement`                  | Резолвленный target.                                                                                |
| `triggerEl`                                                                 | `HTMLElement \| null`          | Trigger element, который был активен до open (для focus return). `null` пока popover не открывался. |
| `open(event?)` / `close(event?)`                                            | `(event?: MouseEvent) => void` | Программный toggle.                                                                                 |
| `updatePosition()`                                                          | `() => void`                   | Императивный re-compute через Floating UI `update()`.                                               |
| `focusFirst()`                                                              | `() => void`                   | Программно ставит focus на `initialFocus` selector или первый focusable.                            |

## 9. Examples

### 9.1 Tooltip на hover

```vue
<button ref="btn">Info</button>
<FixWindow :el="btn" event-open="hover" :delay="500">Helpful tip</FixWindow>
```

### 9.2 Context menu

```vue
<FixWindow :el="$el" event-open="contextmenu" position="bottom-start" :close-button="true">
  <ul>
    <li>Cut</li><li>Copy</li><li>Paste</li>
  </ul>
</FixWindow>
```

### 9.3 По курсору

```vue
<FixWindow event-open="mousedown" :by-cursor="true" position="bottom-end">
  Quick action
</FixWindow>
```

### 9.4 Программный open/close

```vue
<script setup lang="ts">
  import { ref } from "vue"
  import FixWindow from "fishtvue/fixwindow"

  const visible = ref(false)
</script>

<template>
  <button @click="visible = true">Open</button>
  <FixWindow v-model="visible" event-open="none" :close-button="true"> Programmatic </FixWindow>
</template>
```

### 9.5 Teleport mode (popover внутри scroll-parent'а)

```vue
<!-- Popover не обрезается scroll-parent'ом с overflow: hidden / auto. -->
<FixWindow el="#trigger" position="bottom-start" teleport="body">
  Tooltip text rendered in body
</FixWindow>
```

### 9.6 Focus trap для popover-form

```vue
<FixWindow
  el="#trigger"
  event-open="click"
  :focus-trap="true"
  :return-focus="true"
  initial-focus="input[type='email']"
  aria-labelledby="signup-title"
  teleport="body">
  <div>
    <h3 id="signup-title">Sign up</h3>
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Submit</button>
  </div>
</FixWindow>
```

### 9.7 Labeled tooltip via aria-labelledby

```vue
<button id="info-btn" aria-describedby="tooltip-desc">?</button>
<FixWindow el="#info-btn" event-open="hover" role="tooltip" aria-labelledby="tooltip-desc">
  <span id="tooltip-desc">More context about this action</span>
</FixWindow>
```

## 10. Configuration & Customization

### 10.1 Global

```ts
FixWindowOption = Pick<
  FixWindowProps,
  | "typePosition"
  | "position"
  | "class"
  | "classBody"
  | "mode"
  | "eventOpen"
  | "eventClose"
  | "delay"
  | "marginPx"
  | "translatePx"
  | "paddingWindow"
  | "byCursor"
  | "closeButton"
  | "teleport"
  | "focusTrap"
  | "role"
  | "ariaLabel"
  | "ariaLabelledby"
  | "ariaDescribedby"
  | "initialFocus"
  | "returnFocus"
>
```

```ts
app.use(FishtVue, {
  componentsOptions: {
    FixWindow: {
      teleport: "body", // global Teleport target
      focusTrap: false,
      paddingWindow: 8,
      delay: 300
    }
  }
})
```

### 10.2 Per-instance

Через props (перебивают global).

### 10.3 Theming

Mode-зависимые стили; цвет background — `theme.semantic.primary` или neutral. Все transitions через `motion-safe:` префикс.

### 10.4 CSS layer override

Root класс — `fv fishtvue-fix-window`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- **ARIA role:** динамический — `eventOpen: "hover"` → `"tooltip"`, иначе `"dialog"`. Явное переопределение через `role` prop (`"tooltip" | "dialog" | "menu"`).
- **aria-label / aria-labelledby / aria-describedby:** forwarding на корневой узел; `labelledby` имеет приоритет над `label` (browser-канон).
- **Focus trap:** опционально через `focusTrap: true` — native реализация (mirror [Dialog](./dialog.md)) с `FOCUSABLE_SELECTOR` и `Tab` / `Shift+Tab` cycling.
- **Focus return:** при `focusTrap: true` сохраняется `document.activeElement` как trigger; при close через `nextTick` возвращается. Управляется `returnFocus` prop (default `true`).
- **Keyboard:** Escape закрывает popover при `focusTrap: true` или `eventClose !== "none"`. Tab навигация внутри popover работает; при focus trap — цикл.
- **`prefers-reduced-motion`:** все transitions через `motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300` — Tailwind транспилирует в `@media (prefers-reduced-motion: no-preference)`. WCAG 2.3.3.
- **Mobile touch:** `eventOpen: "hover"` регистрирует `touchstart` listener (touch-устройства, где `mouseover` не fires).
- **RTL:** Floating UI's logical `start`/`end` placement (через `positionToPlacement` mapping). Close-button использует `end-2` (Tailwind logical inline-end) вместо `right-2` — автоматическое зеркалирование на `dir="rtl"`.

### Security

- Нет `v-html`.
- Подписки на window/document-events очищаются в `onBeforeUnmount` (Escape listener + `onClickOutside` teardown). При rapid mount/unmount утечек не возникает.
- Click-outside detection через VueUse `onClickOutside` — корректно работает через Teleport, не зависит от composedPath/contains внутреннего DOM tree.
- `border` computed как inline style — учитывай в CSP `style-src 'unsafe-inline'`.

## 13. TypeScript

```ts
import type {
  FixWindowProps,
  FixWindowEmits,
  FixWindowExpose,
  FixWindowRole,
  FixWindowTeleport,
  Position,
  FixWindowEvent,
  RefLink
} from "fishtvue/fixwindow"
import FixWindow from "fishtvue/fixwindow"
import { useTemplateRef } from "vue"

const fw = useTemplateRef<InstanceType<typeof FixWindow>>("fw")
fw.value?.open()
fw.value?.updatePosition()
fw.value?.focusFirst()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Browser:** evergreen. Использует `@floating-ui/vue` `useFloating` + `autoUpdate`; нативные API `addEventListener`, `KeyboardEvent`.
- **Stability flag:** `stable` — 82 кейса, coverage 88.4% statements / 83.8% branch (Wave 1 close-out 2026-05-16).
- **Breaking changes:** не зафиксировано на уровне публичного API. Pre-Floating UI tests, проверявшие точные пиксельные координаты `x`/`y`, релаксированы — Floating UI считает иначе чем manual algorithm, но shape API (string CSS units, `isOpen`, `updatePosition()`) сохранён.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"

describe("FixWindow", () => {
  it("mounts with Teleport", () => {
    const wrapper = mount(FixWindow, {
      props: { eventOpen: "none", teleport: "body" },
      slots: { default: "<div>test</div>" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it("focus trap cycles Tab", async () => {
    const wrapper = mount(FixWindow, {
      attachTo: document.body,
      props: { focusTrap: true, modelValue: true, closeButton: false },
      slots: { default: '<button class="b1">A</button><button class="b2">B</button>' }
    })
    // ... see lib/fixwindow/FixWindow.test.ts → "Issue 4 — Focus trap"
  })
})
```

Реальные тесты — [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts) (82 кейса; describe-блоки по Issue 1–10 audit close-out).

## 16. Troubleshooting / FAQ

| Проблема                                     | Причина                                                                         | Решение                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Window не появляется                         | `el` не резолвится в DOM.                                                       | Передай явный `<button ref="...">` или `el="#id"`.                                     |
| Popover обрезается scroll-parent'ом          | По умолчанию `teleport: false` (inline-render).                                 | Установи `teleport="body"` для рендера в body.                                         |
| Window открывается мимо trigger              | Floating UI пересчитывает позицию через `flip` / `shift` middleware.            | Floating UI должен автоматически skорректировать. Если нет — увеличь `paddingWindow`.  |
| Tab выходит за пределы popover               | `focusTrap: false` (default).                                                   | Установи `focusTrap: true` для modal-popover'ов.                                       |
| Focus не возвращается на trigger после close | `returnFocus: false` или `focusTrap: false`.                                    | Включи `focusTrap: true` и `returnFocus: true` (default).                              |
| `byCursor: true` дёргается                   | Position обновляется на каждое движение мыши.                                   | Установи `event-open="click"` для статичной позиции по cursor click.                   |
| Memory leak при частом mount/unmount         | На практике — нет; `onBeforeUnmount` очищает Escape, click-outside, autoUpdate. | Если воспроизводится — дай минимальный repro.                                          |
| Window не появляется в Nuxt SSR              | Floating UI / DOM-event подписки не работают на сервере.                        | Оборачивай в `<ClientOnly>` или используй `import.meta.client` guard.                  |
| `mouseover` не работает на mobile            | Touch-устройства не fires `mouseover` (нет mouse pointer).                      | Touch fallback включён — `eventOpen: "hover"` дополнительно регистрирует `touchstart`. |

## 17. Related

- [Dialog](./dialog.md) — full-screen модал с focus trap (тот же native focus-trap pattern).
- [Menu](./menu.md), [Select](./select.md), [Calendar](./calendar.md) — потребители FixWindow для popover/dropdown.
- [Button](./button.md) — `type="icon"` использует FixWindow для tooltip.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-16) комментариев `TODO/FIXME/HACK/XXX` в [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) и [FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 88.4% statements / 83.8% branch — улучшение с 77.27% / 65.36% (audit baseline). Целевой 92% / 85% (Wave 1 cleanup) — частично, остальное — uncovered ветви в edge cases byCursor + scrollableEl combination.
- Root-level `exports` map в [lib/package.json](../../lib/package.json) — open в Wave 2.1 ([button.md Issue 9](../issues/button.md)). Per-component `sideEffects: false` — ✅ resolved 2026-05-16.

### Skipped tests

Нет.

### API inconsistencies

- `delay`, `marginPx`, `translatePx`, `paddingWindow` объявлены как `number | <literal>` open union — narrow не работает; защищается рантайм.
- `el?: RefLink` — `RefLink = string | HTMLElement | Element` — тип несколько overloaded, но соответствует общему канону FishtVue.

### Behavioral caveats

- На SSR popover не рендерится (Floating UI требует client-side DOM API). Hydration mismatch не возникает — `v-show="isOpen"` управляет visibility consistently.
- При смене `el` (reactive) — Floating UI's `autoUpdate` подхватывает новый reference автоматически.
- `byCursor: true` — virtual reference создаётся на основе MouseEvent x/y; не учитывает scroll body (положение mouse в viewport-coords).
- `teleport` default `false` для backward-compat; на новых popover'ах рекомендуем `teleport: "body"`.

### Resolved 2026-05-16 (Wave 1 audit close-out)

- ~~Issue 1: Нет Teleport — popover/tooltip overflow обрезается scroll-parent~~ ✅ — добавлен `teleport` prop.
- ~~Issue 2: Manual position calculation вместо Floating UI~~ ✅ — интегрирован `@floating-ui/vue` `useFloating` + `offset` + `flip` + `shift` + `autoUpdate`. Auto-flip/auto-shift при overflow viewport.
- ~~Issue 3: Click-outside не работает при Teleport~~ ✅ — VueUse `onClickOutside` с правильным Teleport awareness.
- ~~Issue 4: Focus trap отсутствует для popover-mode~~ ✅ — native реализация (mirror Dialog) через `focusTrap` prop.
- ~~Issue 5: Focus return на trigger при close~~ ✅ — `triggerEl` capture + `returnFocus` prop.
- ~~Issue 6: SSR styles + sideEffects/exports map / unstyled~~ ✅ partial — `sideEffects: false` per-component, удалён duplicate `FixWindow.initStyle()` из SFC (Wave 2.3), `unstyled` cross-cutting через `Component.setStyle` guard (Wave 3.1). Root exports map — defer Wave 2.1.
- ~~Issue 7: Coverage 77% statements~~ ✅ partial — 88.4% statements / 83.8% branch. Lines 568–661 (manual position calc) полностью устранены через Floating UI.
- ~~Issue 8: ARIA role="tooltip" / "dialog" / "menu" — нет~~ ✅ — динамический `role` computed + `aria-label`/`aria-labelledby`/`aria-describedby` forwarding.
- ~~Issue 9: RTL для positions~~ ✅ — Floating UI's logical `start`/`end` placement; close-button использует Tailwind logical `end-2`.
- ~~Issue 10: prefers-reduced-motion / mobile touch~~ ✅ — все transitions через `motion-safe:` префикс, `touchstart` fallback для `eventOpen: "hover"`.

Подробности — [Documentation/issues/done/fixwindow.md](../issues/done/fixwindow.md).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
