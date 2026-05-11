---
title: Alert
summary: Уведомления (success/warning/info/error/neutral) + programmatic openAlert.
updated: 2026-05-11
stability: stable
since: 0.2.11
---

# Alert

## 1. Overview

`Alert` — уведомление с типами `success`/`warning`/`info`/`error`/`neutral`, позиционированием на экране, auto-dismiss через `displayTime`, опциональной close-кнопкой. Поддерживает programmatic API `openAlert(options)` для динамического создания без `<template>`-разметки.

Stability: `stable` — 58 кейсов, coverage `Alert.vue` 100% / `openAlert.ts` 94.52%.

Source: [Source](../../lib/alert/Alert.vue), [Alert.d.ts](../../lib/alert/Alert.d.ts), [openAlert.ts](../../lib/alert/openAlert.ts), [Alert.test.ts](../../lib/alert/Alert.test.ts).

## 2. How it's organized

```
lib/alert/
├── Alert.vue
├── Alert.d.ts          # 198 строк
├── openAlert.ts        # programmatic API
├── Alert.test.ts       # 58 кейсов
└── package.json
```

Зависимости: `@heroicons/vue/20/solid` (`CheckCircle`, `ExclamationTriangle`, `InformationCircle`, `XCircle`, `ChatBubbleOvalLeft`), [Button](./button.md). [domHandler.isClient](../utilities/domHandler.md), [functionHandler.generateUUID](../utilities/functionHandler.md).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили (через `onServerPrefetch + vueOnMounted`); собственного `onMounted` SFC не использует — см. [Alert.vue:217–218](../../lib/alert/Alert.vue#L217-L218). Watcher на `props.modelValue` ставит `setTimeout` для `displayTime`.
- **Поток данных:** `modelValue` ↔ `isVisible`. По истечении `displayTime` или клика на close — `update:modelValue(false)`.
- **`openAlert(options)`** ([openAlert.ts](../../lib/alert/openAlert.ts)) — programmatic API (audit 2026-05-11 — Issue 2):
  1. `isClient()` guard ([openAlert.ts:37](../../lib/alert/openAlert.ts#L37)) — SSR no-op.
  2. Резолвит / создаёт shared контейнер `.alert-{position}` (стэкинг нескольких alerts по одной позиции).
  3. Создаёт per-alert child `<div id="alert-{uuid}">` и монтирует Alert через `createApp(Alert, { ...options, "onUpdate:modelValue": destroy })` ([openAlert.ts:106](../../lib/alert/openAlert.ts#L106)).
  4. Cleanup полностью Vue-bound: Alert emits `update:modelValue(false)` (на timer или клике close-кнопки) → `destroy()` → `app.unmount() + DOM cleanup` после leave-transition. Никаких manual `addEventListener`.
- **Стили:** через `Alert.setStyle()`. `classesStyle` — switch по `type` для разных цветовых схем.
- **Конфиг:** `componentsOptions.Alert` — см. §10.
- **Локализация:** `Alert.t("alert.close")` → `aria-label` close-кнопки (en: `"Close"`, ru: `"Закрыть"`).
- **SSR:** Alert template SSR-safe; `openAlert` — только клиент (returns без падения, если `document` отсутствует).
- **Animation:** Vue `<transition>` с динамическими классами (translate + opacity), `motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500` — уважает `prefers-reduced-motion: reduce`. При `notAnimate: true` — без transition.

## 4. Quick Start

### Template-based

```vue
<script setup lang="ts">
import { ref } from "vue"
import Alert from "fishtvue/alert"

const visible = ref(true)
</script>

<template>
  <Alert v-model="visible" type="success" title="Saved" subtitle="Your changes were saved." />
</template>
```

### Programmatic

```ts
import { openAlert } from "fishtvue/alert"

openAlert({
  type: "info",
  title: "Hello",
  subtitle: "Welcome!",
  position: "top",
  displayTime: 3000,
  closeButton: true
})
```

## 5. Props

`AlertProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | v-model видимость. |
| `type` | `"success" \| "warning" \| "info" \| "error" \| "neutral"` | `"info"` (или из global) | Тип. |
| `position` | `"top" \| "bottom" \| "left" \| "right" \| "center"` | — | Позиция (для programmatic-API). |
| `size` | `Size` (`xs..7xl`) | — | Размер. |
| `title` | `string` | — | Заголовок (text-bound, без `v-html`). |
| `subtitle` | `string` | — | Описание; рендерится как text-node (XSS-safe). Для кастомной HTML-разметки — slot `#subtitle`. |
| `toTeleport` | `string` | — | Селектор Teleport (для openAlert). |
| `class` | `StyleClass` | — | Класс. |
| `style` | `CSSProperties` | — | Inline стиль. |
| `displayTime` | `1000 \| 2000 \| 3000 \| 4000 \| 5000 \| number` | — | Auto-close (ms). 0/undefined — не закрывать. |
| `notAnimate` | `boolean` | — | Отключить animation. |
| `closeButton` | `boolean` | — | Показать `×`-кнопку. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `boolean` | На close (timeout, кнопка). |

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Кастомный контент рядом с subtitle. |
| `subtitle` | — | Кастомный рендер subtitle (вместо text-node). Fallback — text-binding `subtitle` prop. Использовать, если нужен HTML; при простой строке slot можно не задавать. См. [Alert.vue:263–264](../../lib/alert/Alert.vue#L263-L264). |

## 8. Exposed methods

`AlertExpose`:

| Name | Type | Description |
|---|---|---|
| `isVisible` | `boolean` | Текущее состояние. |
| `type`, `title`, `subtitle`, `displayTime`, `isCloseButton`, `position` | derived | Computed. |
| `classesStyle` | `Record<"body" \| "icon" \| "title" \| "subtitle" \| "button" \| "buttonIcon", StyleClass>` | Цветовая схема по `type`. |
| `size`, `classBase` | derived | CSS computed. |
| `close()` | function | Программное закрытие. |

## 9. Examples

### 9.1 Template-based все типы

```vue
<Alert v-model="v1" type="success" title="Success" />
<Alert v-model="v2" type="warning" title="Warning" />
<Alert v-model="v3" type="error" title="Error" subtitle="Something went wrong" />
```

### 9.2 Auto-dismiss

```vue
<Alert v-model="visible" type="info" title="Saved" :display-time="3000" />
```

### 9.3 Programmatic toast

```ts
import { openAlert } from "fishtvue/alert"

function showToast(message: string) {
  openAlert({
    type: "info",
    title: message,
    position: "top",
    displayTime: 3000,
    closeButton: true
  })
}

showToast("Done")
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Alert: { type: "info", position: "top", displayTime: 3000, closeButton: true }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

`AlertOption = Pick<AlertProps & { toTeleport? }, "type" | "position" | "size" | "class" | "style" | "displayTime" | "notAnimate" | "toTeleport" | "closeButton">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвета `classesStyle` определяются по `type`: success → green, warning → yellow, info → blue, error → red, neutral → gray. Override через `class` + custom CSS.

### 10.4 CSS layer override

Root класс — `fv fishtvue-alert`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- **ARIA** (audit 2026-05-11 — Issue 3, [Alert.vue:255](../../lib/alert/Alert.vue#L255)):
  - `type="error"` / `"warning"` → корень имеет `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"`.
  - `type="success"` / `"info"` / `"neutral"` → `role="status"` + `aria-live="polite"` + `aria-atomic="true"`.
- **Close button** имеет локализованный `aria-label` через `Alert.t("alert.close")` ([Alert.vue:275](../../lib/alert/Alert.vue#L275)) — en `"Close"`, ru `"Закрыть"`.
- **Keyboard:** Escape для close — не реализован (toast не блокирует focus, как Dialog). При необходимости добавь обработчик в обёртке.
- **`prefers-reduced-motion`** учтён через Tailwind `motion-safe:` prefix на всех transition-классах ([Alert.vue:177, 249, 252](../../lib/alert/Alert.vue#L177)). Пользователи с настройкой OS «Reduce motion» видят alert без анимации.
- **Focus management** для programmatic alert умышленно **не реализован** — toast pattern не должен забирать focus у текущего interactive element (см. WCAG 2.1 SC 2.4.3 рекомендации для status-сообщений). Для Confirm/Cancel-сценариев используй [Dialog](./dialog.md).

### Security

- **`title`** рендерится как text-node (interpolation `{{ title }}`).
- **`subtitle`** рендерится как text-node (audit 2026-05-11 — Issue 1, [Alert.vue:263–264](../../lib/alert/Alert.vue#L263-L264)). Для HTML — используй slot `#subtitle` (родитель отвечает за санитизацию).
- **Нет `v-html`** ни в одном сайте — XSS payload в `subtitle` (включая server error messages) не исполняется.

## 13. TypeScript

```ts
import type { AlertProps, AlertEmits, AlertExpose, BaseAlert } from "fishtvue/alert"
import Alert, { openAlert } from "fishtvue/alert"
import { useTemplateRef } from "vue"

const a = useTemplateRef<InstanceType<typeof Alert>>("a")
a.value?.close()

openAlert({ type: "success", title: "Done" } satisfies BaseAlert)
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 58 кейсов, coverage Alert.vue 100% / openAlert.ts 94.52%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Alert from "fishtvue/alert/Alert.vue"

describe("Alert", () => {
  it("auto-closes via displayTime", async () => {
    const wrapper = mount(Alert, {
      props: { modelValue: true, displayTime: 1000 },
      global: { plugins: [[FishtVue, {}]] }
    })
    // Test использует setTimeout — реальные тесты ждут 1000ms (см. Alert.test.ts).
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Alert.test.ts](../../lib/alert/Alert.test.ts) (58 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `openAlert` не появляется | SSR (`isClient()` блокирует). | Вызывай только на клиенте (Vue setup или `onMounted`). |
| Несколько Alert'ов перекрывают друг друга | `.alert-{position}` контейнер — один на позицию. | По дизайну — Alert'ы стэкаются вертикально. |
| `displayTime: 0` не работает | 0 интерпретируется как «не закрывать». | Используй явное `undefined` для отсутствия timer'а. |
| Custom `toTeleport` теряется | Селектор не существует в DOM. | Создай `<div id="my-alerts">` в App.vue. |
| Alert не закрывается на кнопку | `closeButton: false`. | Установи `:close-button="true"`. |

## 17. Related

- [Button](./button.md), [Icons](./icons.md).
- [Dialog](./dialog.md) — для блокирующих модалов.
- [FixWindow](./fix-window.md), [Menu](./menu.md), [Accordion](./accordion.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Alert.vue](../../lib/alert/Alert.vue), [Alert.d.ts](../../lib/alert/Alert.d.ts) и [openAlert.ts](../../lib/alert/openAlert.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage Alert.vue 100% / openAlert.ts ≥94%; после refactor Vue-bound cleanup-логика стала проще, dead branches убраны.

### Skipped tests

Нет.

### API inconsistencies

- `BaseAlert` и `AlertProps.style` — `any` / `CSSProperties`.
- `displayTime` open union с numeric.
- `classesStyle` switch без default-case — при неизвестном `type` `undefined` (TypeScript ловит, runtime — нет; type guard в каноне).

### Behavioral caveats

- Programmatic `openAlert` создаёт mini-app через `createApp(Alert, rootProps)` — каждый Alert это отдельный Vue-app instance. Состояние не shared.
- При SSR `openAlert` — no-op (`isClient()` guard); планируй UI на клиенте.
- `position: "center"` — full-overlay; не путай с Dialog.
- При множественных вызовах `openAlert` подряд они стэкаются в одном `.alert-{position}` контейнере вертикально (preserved после refactor).
- **RTL (cross-cutting):** `position: "top-left"`/`"bottom-right"` буквально привязаны к ltr-axis — в RTL-документе зеркалирование вручную через CSS logical properties. См. [issues/alert.md Issue 7](../issues/alert.md).
- **`unstyled: true` cross-cutting:** не поддерживается (см. [issues/README.md cross-cutting](../issues/README.md)).
- **Focus auto-move** не реализован умышленно — toast-pattern; для Confirm/Cancel-сценариев используй [Dialog](./dialog.md).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
