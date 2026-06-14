---
title: Issues — Alert
summary: Все numbered issues закрыты, кроме B10 (theme tokens hardcode → Wave 9). 2026-06-14 закрыты Issue 7 (RTL/F31 — logical start/end + deprecated физ. алиасы), unstyled-support (L53, regression-тест к глобальному guard), mobile (mobile-first gutters). Ранее (2026-05-11): XSS subtitle slot, openAlert createApp + Vue-bound cleanup, role/aria-live, motion-safe, sideEffects, dup initStyle; 3 N/A (toast-pattern).
updated: 2026-06-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/alert/
related-doc: ../components/alert.md
---

# Issues — Alert

## Сводка

| Severity | Count (open) | Categories                                  |
| -------- | ------------ | ------------------------------------------- |
| critical | 0            | —                                           |
| high     | 0            | —                                           |
| medium   | 0            | —                                           |
| low      | 1            | theme tokens hardcode (B10 → Wave 9)        |

Closed 2026-06-14: Issue 7 (F31/RTL — logical `start`/`end` + deprecated физ. алиасы), Issue 4 unstyled-часть (L53 — regression-тест к глобальному `Component.setStyle` guard), Issue 9 mobile-часть (mobile-first gutters). Closed 2026-05-11: Issues 1 (XSS), 2 (openAlert refactor), 3 (ARIA), 4 partial (sideEffects + dup initStyle), 9 partial (motion-safe). N/A 2026-05-11: Issues 5, 6 (toast pattern не имеет Confirm/Cancel UI), 8 (нет form). Остаётся открытым только Issue 9 theme-tokens-часть (B10).

## ~~Issue 1: CRITICAL — XSS через `subtitle` v-html~~ ✅ resolved 2026-05-11 · ⚠️ amended 2026-06-14 (sanitized v-html restored)

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~ → mitigated (sanitized)
- **Где (was):** ~~[Alert.vue:253]~~ — raw `v-html` удалён 2026-05-11; 2026-06-14 возвращён как **sanitized** `v-html`.
- **Status:** ✅ resolved 2026-05-11 (raw v-html → text); ⚠️ amended 2026-06-14 (по запросу владельца HTML-поддержка возвращена через best-effort sanitizer).

**Что сделано (2026-05-11):**

- `<div v-if="subtitle" v-html="subtitle" />` → text-interpolation + slot `#subtitle` (raw `v-html` устранён). Соответствовало cross-cutting паттерну (Select / Switch / Aria / Label).
- `AlertSlots` расширен `subtitle: () => VNode[]` ([Alert.d.ts](../../lib/alert/Alert.d.ts)).

**Amendment 2026-06-14 — sanitized v-html (HTML-поддержка возвращена):**

- По запросу владельца `subtitle` снова рендерит HTML, но **безопасно**: `<slot name="subtitle"><span v-html="sanitizedSubtitle" /></slot>` ([Alert.vue:291](../../lib/alert/Alert.vue#L291)), где `sanitizedSubtitle = sanitizeHtml(subtitle)` ([Alert.vue:209](../../lib/alert/Alert.vue#L209)).
- NEW [sanitizeHtml.ts](../../lib/alert/sanitizeHtml.ts) — best-effort dependency-free sanitizer (**чисто строковый → SSR-safe**): итеративно вырезает опасные элементы (`<script>`/`<style>`/`<iframe>`/`<object>`/`<embed>`/`<svg>`/`<form>`/… с содержимым), inline `on*`-обработчики, протоколы `javascript:`/`vbscript:`/`data:text/html` в URL-атрибутах. Безопасные теги (`<span class>`, `<b>`, `<img src="https://…">`) рендерятся.
- `openAlert({ subtitle })` наследует санитизацию (subtitle проходит через тот же computed в Alert).
- ⚠️ **Residual risk:** best-effort sanitizer **не** заменяет DOMPurify (строковая санитизация не ловит все обфускации). Для недоверенного ввода — slot `#subtitle` + проверенный sanitizer. Зафиксировано в [components/alert.md §12, §18](../components/alert.md#12-accessibility--security).

**Acceptance criteria (amended 2026-06-14):**

- [x] `subtitle="<script>…</script>"` — `<script>` вырезан, не исполняется (template + `openAlert`). Тесты: `Alert.test.ts` > `Security — XSS guard in subtitle prop (Issue 1, sanitized v-html)`.
- [x] `subtitle="<img src=x onerror=…>"` — `on*`-обработчик вырезан (img может рендериться, но без handler → нет исполнения).
- [x] `subtitle="<a href='javascript:…'>"` — `javascript:` протокол вырезан (атрибут удалён).
- [x] Безопасная разметка (`<span class>`, `<b>`, `<img src=https…>`) рендерится. Тесты: `Subtitle — sanitized HTML support` + `sanitizeHtml() — unit`.
- [x] Slot `#subtitle` — для полного контроля / недоверенного ввода.

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

- `openAlert` переписан на Vue-bound cleanup ([openAlert.ts:120–125](../../lib/alert/openAlert.ts#L120-L125)):
  - `createApp(Alert, { ...options, "onUpdate:modelValue": (v) => !v && destroy() })` — listener живёт внутри Vue props.
  - Удалено `alertButton.addEventListener("click", destroy)` — close-кнопка вызывает Alert.close → emit `update:modelValue(false)` → openAlert handler → destroy. Один путь, нет orphan listeners.
  - Удалён duplicate `setTimeout(destroy, displayTime)` в openAlert — Alert watcher уже emits на timer expiry.
  - `destroy()` идемпотентен (`destroyed` guard) — даже если timer и click race, cleanup один раз.
- Stacking `.alert-{position}` контейнера сохранён.
- `isClient()` guard остался в начале функции ([openAlert.ts:51](../../lib/alert/openAlert.ts#L51)) — SSR no-op.

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

- Корневой `<div data-alert>` теперь имеет `:role` / `:aria-live` / `aria-atomic="true"` ([Alert.vue:282](../../lib/alert/Alert.vue#L282)) c computed mapping по `type`:
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
- ✅ **Dup `initStyle()`** — удалён explicit `onMounted(() => Alert.initStyle())` из SFC ([Alert.vue:234–236](../../lib/alert/Alert.vue#L234-L236)). Базовый `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`. Соответствует cross-cutting fix-плану (Documentation/issues/README.md, прогресс 7/22).
- ✅ **`unstyled: true`** — resolved 2026-06-14. Cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) уже покрывает Alert: все классы идут через `Alert.setStyle()` → styled-root (`[data-alert] > div`) пуст при `unstyled: true`. Добавлен Alert-scoped regression-тест (`Alert.test.ts` > `Configuration support — unstyled (L53)`, `afterEach` чистит `window.FishtVue` singleton-leak). Caveat: `<transition>` active-классы (литералы шаблона) и positioning-классы `openAlert`-контейнера через движок не идут → при unstyled остаются (behavioral, не decorative; см. [components/alert.md §10.5](../components/alert.md#105-unstyled)).

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
- ✅ **Close-button `aria-label`** локализован через `Alert.t("alert.close")` ([Alert.vue:302](../../lib/alert/Alert.vue#L302)) с fallback `"Close"`. Локаль-ключ добавлен в [locales/en.ts](../../lib/locale/locales/en.ts) (`alert.close: "Close"`), [ru.ts](../../lib/locale/locales/ru.ts) (`alert.close: "Закрыть"`), и `TypesLocale.d.ts` `DefaultMessages` interface.
- Тесты `Alert.test.ts` > `Close button — localized aria-label` подтверждают runtime switch локали.

## ~~Issue 7: RTL — `position: top-right`/`top-left` буквальное~~ ✅ resolved 2026-06-14

- **Категория:** F31
- **Severity:** ~~medium~~
- **Status:** ✅ resolved 2026-06-14

**Что сделано (2026-06-14):**

- NEW `AlertPosition` (локальный тип в [Alert.d.ts](../../lib/alert/Alert.d.ts), `PositionShort` shared с Dialog **не** тронут): logical `top`/`bottom`/`center`/`start`/`end` + `top-start`/`top-end`/`bottom-start`/`bottom-end` + `@deprecated` физические `left`/`right`/`top-left`/… `AlertProps.position` расширен logical `start`/`end` (+ deprecated `left`/`right`).
- **Alert.vue** — computed `positionLogical` ([Alert.vue:42](../../lib/alert/Alert.vue#L42)) нормализует `left → start`/`right → end`; анимация slide-in для `start`/`end` использует `rtl:`-флип translate (`-translate-x-[200%] rtl:translate-x-[200%]` / `translate-x-[200%] rtl:-translate-x-[200%]`, [Alert.vue:55–67](../../lib/alert/Alert.vue#L55-L67)); физические margins → logical (`ml-3 → ms-3` [Alert.vue:201](../../lib/alert/Alert.vue#L201); close-button `ml-auto pl-3 → ms-auto ps-3` [Alert.vue:213](../../lib/alert/Alert.vue#L213)); `onMounted` dev-warn при deprecated `left`/`right` ([Alert.vue:238–246](../../lib/alert/Alert.vue#L238-L246)).
- **openAlert.ts** — `toLogicalPosition()` ([openAlert.ts:29](../../lib/alert/openAlert.ts#L29)) нормализует + валидирует; контейнер `.alert-{logical}` (физ./лог. дедуп); `alertClassPosition` → logical (`left-0 pl-5 → start-0 ps-3 sm:ps-5`, `right-0 pr-5 → end-0 pe-3 sm:pe-5`, [openAlert.ts:37–46](../../lib/alert/openAlert.ts#L37-L46)); `items-start`/`items-end` выбор по `start`/`end`; dev-warn при deprecated физ. позиции ([openAlert.ts:57–63](../../lib/alert/openAlert.ts#L57-L63)).
- Logical-utilities (`ms`/`ps`/`start`/`end`) авто-зеркалятся при `dir="rtl"` — `useDirectionality()` не нужен (канон Separator/Table/Select; движок понимает `rtl:` + logical utilities).

**Acceptance criteria:**

- [x] `position="start"`/`"end"` зеркалятся при `dir="rtl"`. Тесты: `Alert.test.ts` > `RTL & logical position (Issue 7 / F31)`.
- [x] Deprecated `left`/`right`/`top-left`/… маппятся на logical + эмитят dev-warn (Alert + openAlert).
- [x] Content/close-button используют logical margins (`ms-*`/`ps-*`), не физические `ml-*`/`pl-*`.
- [x] `openAlert` контейнер: logical `start-0`/`end-0`/`ps-*`/`pe-*`, дедуп физ./лог. позиций.

## ~~Issue 8: Native form submit отсутствует (если Alert содержит form)~~ ✅ N/A 2026-05-11

- **Категория:** M55
- **Severity:** ~~medium~~
- **Status:** ✅ N/A 2026-05-11 — toast pattern, не применимо.

**Обоснование:**

Alert не содержит form-control. Для form-сценариев (confirmation-dialog с input) используй [Dialog](../components/dialog.md) + native `<form @submit>`.

## Issue 9: prefers-reduced-motion / colors / mobile — ⚠️ partial (motion + mobile ✅; theme tokens → Wave 9)

**Что сделано:**

- ✅ **`prefers-reduced-motion`** (2026-05-11) — все transition-классы префиксованы `motion-safe:` ([Alert.vue:186, 276, 279](../../lib/alert/Alert.vue#L186); [openAlert.ts:80](../../lib/alert/openAlert.ts#L80)). Пользователи с OS-настройкой «Reduce motion» видят alert без анимации. Тест: `Alert.test.ts` > `Motion — prefers-reduced-motion`.
- ✅ **Mobile** (2026-06-14) — добавлены явные mobile-first gutters: body `p-3 sm:p-4` ([Alert.vue:190](../../lib/alert/Alert.vue#L190)); `openAlert`-контейнер `gap-3 sm:gap-4` ([openAlert.ts:80](../../lib/alert/openAlert.ts#L80)) + offsets `pt-3 sm:pt-5`/`pb-3 sm:pb-5`/`ps-3 sm:ps-5`/`pe-3 sm:pe-5` ([openAlert.ts:37–46](../../lib/alert/openAlert.ts#L37-L46)). На мобиле компактнее, на desktop — прежние отступы; ширина ограничена `max-w-[89vw]`. Тесты: `Alert.test.ts` > `Mobile-first responsive gutters`. Канон mobile-first (без JS `innerWidth`).
- ⚠️ **Theme tokens (B10)** — severity colors (`bg-green-50`, `text-red-400` и т.д.) пока хардкодены Tailwind-примитивами. Миграция на semantic theme-tokens отложена (cross-cutting Wave 9, отдельный pass для `lib/theme/`). **Остаётся открытым** — единственный open low.

См. [done/button.md Issue 10](./done/button.md) — каноничный motion-safe pattern.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                     |
| ------------------------- | ----------- | --------------------------------------------------------------- |
| `componentsOptions.Alert` | ✅          | через options                                                   |
| `componentsStyle` global  | ❌          | Alert не использует mode (outlined/filled) — не пересекается    |
| `unstyled: true`          | ✅          | `Component.setStyle()` guard (resolved 2026-06-14, см. Issue 4) |
| Theme tokens vs hardcode  | ⚠️          | severity colors частично хардкоден (Issue 9 partial)            |
| `t()` для текста          | ✅          | close-button `aria-label` через `Alert.t("alert.close")`        |
| Runtime locale switch     | ✅          | подтверждено тестом `Close button — localized aria-label`       |

## Dual-API gap

Не применимо — Alert single-instance message.
