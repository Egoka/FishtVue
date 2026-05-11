---
title: Issues — Alert
summary: 6/9 issues закрыты 2026-05-11 (XSS subtitle slot, openAlert createApp + Vue-bound cleanup, role/aria-live, motion-safe, sideEffects, dup initStyle). 3 помечены N/A (toast-pattern не имеет Confirm/Cancel/form). Открытые — Issue 7 (RTL cross-cutting), unstyled-support, theme tokens/mobile.
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/alert/
related-doc: ../components/alert.md
---

# Issues — Alert

## Сводка

| Severity | Count (open) | Categories                                  |
| -------- | ------------ | ------------------------------------------- |
| critical | 0            | —                                           |
| high     | 1            | unstyled-support cross-cutting              |
| medium   | 1            | F31 (RTL)                                   |
| low      | 2            | theme tokens hardcode, mobile               |

Closed 2026-05-11: Issues 1 (XSS), 2 (openAlert refactor), 3 (ARIA), 4 partial (sideEffects + dup initStyle), 9 partial (motion-safe). N/A 2026-05-11: Issues 5, 6 (toast pattern не имеет Confirm/Cancel UI), 8 (нет form).

## ~~Issue 1: CRITICAL — XSS через `subtitle` v-html~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~
- **Где (was):** ~~[Alert.vue:253]~~ — `v-html` удалён.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- `<div v-if="subtitle" v-html="subtitle" />` → `<div v-if="subtitle || slots?.subtitle"><slot name="subtitle">{{ subtitle }}</slot></div>` ([Alert.vue:263–264](../../lib/alert/Alert.vue#L263-L264)). Default — text-interpolation; кастомный HTML — через slot.
- `AlertSlots` расширен `subtitle: () => VNode[]` ([Alert.d.ts](../../lib/alert/Alert.d.ts)).
- Соответствует cross-cutting паттерну (Select / Switch / Aria / Label fixes 2026-05-11).

**Acceptance criteria:**

- [x] `subtitle="<script>window.__xssTriggered=true</script>"` — НЕ исполняется ни в template, ни в `openAlert`. Тесты: `Alert.test.ts` > `Security — XSS guard in subtitle prop`.
- [x] `subtitle="<img src=x onerror=...>"` — DOM не содержит `<img>`.
- [x] Slot `#subtitle` позволяет custom override без потери безопасности.

### Историческая запись (что было)

```vue
<div v-if="subtitle" data-alert-subtitle :class="classSubtitle" v-html="subtitle" />
```

`subtitle: string` — пользовательский prop / option в `openAlert({ subtitle })`. v-html без санитизации.

См. [select.md Issue 1](./select.md) — унифицированный fix-паттерн.

## ~~Issue 2: CRITICAL — Imperative DOM manipulation в `openAlert.ts` обходит Vue reactivity~~ ✅ resolved 2026-05-11

- **Категория:** C13 + architecture
- **Severity:** ~~**critical**~~
- **Где (was):** ~~[openAlert.ts:35-98]~~ — manual `addEventListener` + duplicate timer удалены.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- `openAlert` переписан на Vue-bound cleanup ([openAlert.ts:106–112](../../lib/alert/openAlert.ts#L106-L112)):
  - `createApp(Alert, { ...options, "onUpdate:modelValue": (v) => !v && destroy() })` — listener живёт внутри Vue props.
  - Удалено `alertButton.addEventListener("click", destroy)` — close-кнопка вызывает Alert.close → emit `update:modelValue(false)` → openAlert handler → destroy. Один путь, нет orphan listeners.
  - Удалён duplicate `setTimeout(destroy, displayTime)` в openAlert — Alert watcher уже emits на timer expiry.
  - `destroy()` идемпотентен (`destroyed` guard) — даже если timer и click race, cleanup один раз.
- Stacking `.alert-{position}` контейнера сохранён.
- `isClient()` guard остался в начале функции ([openAlert.ts:37](../../lib/alert/openAlert.ts#L37)) — SSR no-op.

**Acceptance criteria:**

- [x] `openAlert()` не вызывает `addEventListener` вручную; cleanup через Vue emit.
- [x] Alert close через timer — Vue unmount cleanly. Тест: `Alert.test.ts` > `cleans up cleanly after displayTime expiration`.
- [x] Alert close через button — DOM очищен. Тест: `cleanly unmounts via Vue when close button is clicked`.
- [x] SSR-safe (returns без падения, если `isClient()` === false).
- [x] Stacking preserved. Тест: `preserves stacking when multiple alerts share a position container`.

### Историческая запись (что было)

```ts
const alertBody = document.querySelector(`.alert-${options.position}`)
const divAlert = document.createElement("div")
const toMount = document.querySelector(optionsAlert?.toTeleport ?? "body")
...
alertButton.addEventListener("click", destroy)
```

Memory leak — `alertButton.addEventListener("click", destroy)`: listener жил на DOM-узле, который потом удалялся; при close via timer (до click) → listener утекал. Аутентичности Vue lifecycle не было.

## ~~Issue 3: ARIA — нет `role="alert"` / `role="status"`~~ ✅ resolved 2026-05-11

- **Категория:** E29.1, E29.5
- **Severity:** ~~high~~
- **Где (was):** ~~Alert root~~ — `role`/`aria-live`/`aria-atomic` добавлены.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- Корневой `<div data-alert>` теперь имеет `:role` / `:aria-live` / `aria-atomic="true"` ([Alert.vue:255](../../lib/alert/Alert.vue#L255)) c computed mapping по `type`:
  - `error` / `warning` → `role="alert"` + `aria-live="assertive"`.
  - `success` / `info` / `neutral` → `role="status"` + `aria-live="polite"`.
- WCAG 2.1 SC 4.1.3 (Status Messages) — соответствует.

**Acceptance criteria:**

- [x] Screen reader озвучивает появление error/warning alerts assertively. Тест: `Accessibility — ARIA role/aria-live`.
- [x] Success/info/neutral озвучиваются politely.
- [x] `aria-atomic="true"` — изменение subtitle при том же модулю anchor не теряется.

### Историческая запись (что было)

Корень — `<div data-alert>` без `role`. Screen reader игнорировал появление, кроме случая когда фокус оказывался внутри. Пользователи скрин-ридера не узнавали о success / error / warning.

## Issue 4: SSR styles + sideEffects + unstyled — ⚠️ partial (2026-05-11)

Composite — см. [button.md Issue 1, 8, 9, 14](./button.md).

**Что сделано (2026-05-11):**

- ✅ **sideEffects** — [lib/alert/package.json](../../lib/alert/package.json) теперь содержит `"sideEffects": false`. Bundler корректно tree-shake'ит при отсутствии импорта.
- ✅ **Dup `initStyle()`** — удалён explicit `onMounted(() => Alert.initStyle())` из SFC ([Alert.vue:217–218](../../lib/alert/Alert.vue#L217-L218)). Базовый `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`. Соответствует cross-cutting fix-плану (Documentation/issues/README.md, прогресс 7/22).
- ⚠️ **`unstyled: true`** — cross-cutting, остаётся открытым. См. [issues/README.md](./README.md) общий план поддержки.

## ~~Issue 5: Focus management для programmatic alert (модалки)~~ ✅ N/A 2026-05-11

- **Категория:** E29.4
- **Severity:** ~~medium~~
- **Status:** ✅ N/A 2026-05-11 — toast pattern, не применимо.

**Обоснование:**

Alert — toast-notification, не Dialog. У текущего Alert API нет Confirm/Cancel-кнопок (только опциональная close-`×`). Auto-move фокуса на toast противоречит WCAG 2.1 SC 2.4.3 (Focus Order) для status-сообщений — фокус остаётся у текущего interactive element. Для Confirm/Cancel-сценариев используй [Dialog](../components/dialog.md) (отдельный компонент с focus trap).

Соответствующие "Known issues & limitations" обновлены в [components/alert.md §18](../components/alert.md#18-known-issues--limitations).

## ~~Issue 6: Locale для button labels (Confirm/Cancel)~~ ✅ N/A 2026-05-11 (close button partially closed)

- **Категория:** F30
- **Severity:** ~~medium~~
- **Status:** ✅ N/A 2026-05-11 для Confirm/Cancel (toast не имеет таких кнопок); ✅ partially closed для close-button.

**Что сделано (2026-05-11):**

- Confirm/Cancel labels — N/A: Alert не содержит Confirm/Cancel UI (см. Issue 5 обоснование).
- ✅ **Close-button `aria-label`** локализован через `Alert.t("alert.close")` ([Alert.vue:275](../../lib/alert/Alert.vue#L275)) с fallback `"Close"`. Локаль-ключ добавлен в [locales/en.ts](../../lib/locale/locales/en.ts) (`alert.close: "Close"`), [ru.ts](../../lib/locale/locales/ru.ts) (`alert.close: "Закрыть"`), и `TypesLocale.d.ts` `DefaultMessages` interface.
- Тесты `Alert.test.ts` > `Close button — localized aria-label` подтверждают runtime switch локали.

## Issue 7: RTL — `position: top-right`/`top-left` буквальное

- **Категория:** F31

См. [calendar.md](./calendar.md). Position-strings должны support `start/end` или auto-mirror.

## ~~Issue 8: Native form submit отсутствует (если Alert содержит form)~~ ✅ N/A 2026-05-11

- **Категория:** M55
- **Severity:** ~~medium~~
- **Status:** ✅ N/A 2026-05-11 — toast pattern, не применимо.

**Обоснование:**

Alert не содержит form-control. Для form-сценариев (confirmation-dialog с input) используй [Dialog](../components/dialog.md) + native `<form @submit>`.

## Issue 9: prefers-reduced-motion / colors / mobile — ⚠️ partial (2026-05-11)

**Что сделано (2026-05-11):**

- ✅ **`prefers-reduced-motion`** — все transition-классы префиксованы `motion-safe:` ([Alert.vue:177, 249, 252](../../lib/alert/Alert.vue#L177); [openAlert.ts:62](../../lib/alert/openAlert.ts#L62)). Пользователи с OS-настройкой «Reduce motion» видят alert без анимации. Тест: `Alert.test.ts` > `Motion — prefers-reduced-motion`.
- ⚠️ **Theme tokens** — severity colors (`bg-green-50`, `text-red-400` и т.д.) пока хардкодены. Миграция на theme-tokens отложена (отдельный pass для `lib/theme/`).
- ⚠️ **Mobile** — отдельных media-query правил нет; полагается на Tailwind `sm:` breakpoints в `size`. Cross-cutting.

См. [done/button.md Issue 10](./done/button.md) — каноничный motion-safe pattern.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                     |
| ------------------------- | ----------- | --------------------------------------------------------------- |
| `componentsOptions.Alert` | ✅          | через options                                                   |
| `componentsStyle` global  | ❌          | Alert не использует mode (outlined/filled) — не пересекается    |
| `unstyled: true`          | ❌          | cross-cutting (open)                                            |
| Theme tokens vs hardcode  | ⚠️          | severity colors частично хардкоден (Issue 9 partial)            |
| `t()` для текста          | ✅          | close-button `aria-label` через `Alert.t("alert.close")`        |
| Runtime locale switch     | ✅          | подтверждено тестом `Close button — localized aria-label`       |

## Dual-API gap

Не применимо — Alert single-instance message.
