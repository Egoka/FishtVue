---
title: Issues — Alert
summary: Аудит Alert — XSS через subtitle v-html, imperative DOM manipulation в openAlert (createElement, querySelector — обходит Vue), нет ARIA role="alert"/role="status", нет focus management для programmatic alerts.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/alert/
related-doc: ../components/alert.md
---

# Issues — Alert

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 2 | C13 (v-html subtitle), C13/C14 (imperative DOM bypass Vue) |
| high | 5 | A2, A4-5, C17, E29.1, E29.5 |
| medium | 4 | E29.4 (focus alert), F30, F31, M55 |
| low | 3 | E29.7, B10, N57 |

## Issue 1: CRITICAL — XSS через `subtitle` v-html

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Alert.vue:253](../../lib/alert/Alert.vue#L253)

### Что найдено

```vue
<div v-if="subtitle" data-alert-subtitle :class="classSubtitle" v-html="subtitle" />
```

`subtitle: string` — пользовательский prop / option в `openAlert({ subtitle })`. v-html без санитизации.

### Что нужно сделать

См. [select.md Issue 1](./select.md). Заменить на text-node или slot. **Важно:** Alerts часто формируются из server error messages → высокая вероятность XSS payload.

## Issue 2: CRITICAL — Imperative DOM manipulation в `openAlert.ts` обходит Vue reactivity

- **Категория:** C13 + architecture
- **Severity:** **critical**
- **Где:** [openAlert.ts:35-98](../../lib/alert/openAlert.ts#L35-L98)

### Что найдено

```ts
const alertBody = document.querySelector(`.alert-${options.position}`)
const divAlert = document.createElement("div")
const toMount = document.querySelector(optionsAlert?.toTeleport ?? "body")
const div = document.createElement("div")
...
alertButton.addEventListener("click", destroy)
...
const divAlert = document.querySelector(`#${alertId}`)
```

Вместо Vue `<Teleport>` + reactive state, `openAlert` создаёт DOM-узлы императивно через `document.createElement` и монтирует их вручную.

### Почему это проблема

- **Не работает в SSR** — `document` undefined.
- **Не работает в Shadow DOM** — querySelector ищет в light DOM.
- **Не работает с Vue DevTools** — компонент не виден в hierarchy.
- **Конфликт с Teleport** — если пользователь меняет `toTeleport`, ручное создание не учитывает.
- **Memory leak** — alertButton.addEventListener("click", destroy) (line 79) — listener сохраняется на DOM-узле, который потом removed; если alert closed via timer (setTimeout) до click → listener утекает.
- **Нет аутентичности Vue lifecycle** — onUnmounted не вызывается, watch'еры не сбрасываются.

### Что нужно сделать

1. Переписать `openAlert` через Vue programmatic API:
   ```ts
   import { createApp, h } from "vue"
   import Alert from "./Alert.vue"

   export function openAlert(options: AlertOptions) {
     const container = document.createElement("div")
     document.querySelector(options.toTeleport ?? "body")?.appendChild(container)
     const app = createApp({
       render: () => h(Alert, { ...options, onClose: () => {
         app.unmount()
         container.remove()
       } })
     })
     app.mount(container)
     if (options.displayTime) setTimeout(() => app.unmount(), options.displayTime)
   }
   ```
2. Или использовать существующий FishtVue plugin context (если установлен app.provide):
   ```ts
   const fishtVue = inject(FishtVueSymbol)
   fishtVue.alertManager.show({ ... })
   ```
3. Documentation [components/alert.md](../components/alert.md) §M.
4. Тест: `openAlert` в SSR-контексте не падает (returns no-op).

### Acceptance criteria

- [ ] `openAlert()` использует createApp / Teleport — нет manual createElement.
- [ ] Alert close через timer — Vue unmount cleanly, без leaked listeners.
- [ ] SSR-safe.

## Issue 3: ARIA — нет `role="alert"` / `role="status"`

- **Категория:** E29.1, E29.5
- **Severity:** high
- **Где:** [Alert.vue](../../lib/alert/Alert.vue)

### Что найдено

Alert корень — без `role`. Screen reader не объявит появление alert.

### Почему это проблема

- WCAG 2.1 SC 4.1.3 (Status Messages) — нарушение.
- Пользователи скрин-ридера не узнают о success / error / warning.

### Что нужно сделать

1. На корне Alert:
   ```vue
   <div :role="severity === 'error' || severity === 'warning' ? 'alert' : 'status'"
        :aria-live="severity === 'error' || severity === 'warning' ? 'assertive' : 'polite'"
        :aria-atomic="true">
   ```
2. `severity`-prop maps на role:
   - error/warning → role="alert" + assertive
   - success/info → role="status" + polite

## Issue 4: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 5: Focus management для programmatic alert (модалки)

- **Категория:** E29.4
- **Severity:** medium

Если Alert содержит interactive content (Confirm Cancel buttons), focus должен быть установлен на first button. После close — return на trigger.

См. [dialog.md Issue 1, 5](./dialog.md).

## Issue 6: Locale для button labels (Confirm/Cancel)

- **Категория:** F30
- **Severity:** medium
- **Где:** [openAlert.ts](../../lib/alert/openAlert.ts) (если есть Confirm/Cancel buttons)

### Что нужно сделать

Локализация через `Alert.t("confirm")`, `Alert.t("cancel")`. Добавить ключи в [locales/en.ts](../../lib/locale/locales/en.ts), [ru.ts](../../lib/locale/locales/ru.ts).

## Issue 7: RTL — `position: top-right`/`top-left` буквальное

- **Категория:** F31

См. [calendar.md](./calendar.md). Position-strings должны support `start/end` или auto-mirror.

## Issue 8: Native form submit отсутствует (если Alert содержит form)

- **Категория:** M55
- **Severity:** medium

Если Alert используется как confirmation-dialog с form — нет integration с native form submit.

## Issue 9: prefers-reduced-motion / colors / mobile

Cross-cutting. См. [button.md Issue 10](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Alert` | ✅ | через options |
| `componentsStyle` global | ❌ | Alert не пересекается |
| `unstyled: true` | ❌ | cross-cutting |
| Theme tokens vs hardcode | ⚠️ | severity colors частично хардкоден |
| `t()` для текста | ⚠️ | проверить Confirm/Cancel labels |
| Runtime locale switch | ⚠️ | если использует t() |

## Dual-API gap

Не применимо — Alert single-instance message.
