---
title: Issues — InputLayout
summary: Аудит InputLayout — Issues 1/2/3/5/6/7 ✅ resolved 2026-05-11 (XSS slot, ResizeObserver cleanup, clipboard feature-detect, offsetTop prop, aria-live, i18n copied). Остаются cross-cutting Issues 4 / 8.
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/inputlayout/
related-doc: ../components/input-layout.md
---

# Issues — InputLayout

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | (2 closed: ~~C13 v-html × 2~~, ~~H41 ResizeObservers leak~~) |
| high | 4 | A2, A4-5, C17, L53 (cross-cutting → button.md) |
| medium | 0 | (4 closed: ~~C14 clipboard SSR~~, ~~E29.5 aria-live~~, ~~F30 i18n copied~~, ~~G34 querySelector coupling~~) |
| low | 3 | E29.7, B10, N59 |

## Issue 1: ~~CRITICAL — XSS через `help` и `messageInvalid` (v-html)~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где (was):** ~~[InputLayout.vue:294, 313]~~ → [InputLayout.vue:359-364](../../lib/inputlayout/InputLayout.vue#L359-L364) и [InputLayout.vue:382-388](../../lib/inputlayout/InputLayout.vue#L382-L388) — теперь slot-fallback на text-node.
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```vue
<div v-html="help" :class="classIconContent" />
<div v-html="messageInvalid" :class="classIconContent" />
```

`help: string` и `messageInvalid: string` — пользовательские props (приходят из Input/Aria/Select/Calendar/TextEditor через `inputLayout` computed-объект).

### Почему это проблема

- Самое критичное: `messageInvalid` часто формируется из server-validation messages (`response.errors[0].message`). Если backend возвращает HTML/escapes плохо — XSS payload в DOM.
- Cross-cutting: ВСЕ form-controls (Input, Aria, Select, Calendar, TextEditor) пробрасывают эти props в InputLayout — фикс здесь устраняет XSS во всех 5 компонентах разом.

### Что нужно сделать

1. Заменить v-html на slot:
   ```vue
   <slot name="help">{{ help }}</slot>
   <slot name="messageInvalid">{{ messageInvalid }}</slot>
   ```
2. `help`/`messageInvalid` остаются props как fallback — рендерятся как text-node.
3. Если HTML-форматирование требуется — пользователь явно использует slot.
4. Cross-cutting эффект: устраняет XSS в Input, Aria, Select, Calendar, TextEditor.
5. Тест с payload `<img src=x onerror=alert(1)>` для `messageInvalid` — НЕ исполняется.

### Acceptance criteria

- [x] `<InputLayout :message-invalid="<script>alert(1)</script>">` НЕ исполняет — рендер как text-node (тест `Security / XSS guard` в `InputLayout.test.ts`).
- [x] `<InputLayout><template #messageInvalid><strong>Error</strong></template></InputLayout>` рендерит strong-text (тест `renders user-provided messageInvalid slot`).
- [x] `help` идентично: `<template #help>` overrides text-node fallback; XSS payload не выполняется.
- [ ] Cross-cutting forwarding в Input/Aria/Select/Calendar/TextEditor (`<template #help><slot name="help" /></template>`) — отдельный follow-up PR; на уровне самого InputLayout XSS невозможен — fallback всегда text.

## Issue 2: ~~CRITICAL — Memory leak: 2 anonymous ResizeObservers без disconnect~~ ✅ resolved 2026-05-11

- **Категория:** H41
- **Severity:** **critical**
- **Где (was):** ~~[InputLayout.vue:177, 181]~~ → теперь [InputLayout.vue:196-208](../../lib/inputlayout/InputLayout.vue#L196-L208) (сохранены в `let beforeObserver` / `let afterObserver`) + [InputLayout.vue:232-237](../../lib/inputlayout/InputLayout.vue#L232-L237) (`onUnmounted` disconnect всех трёх).
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
onMounted(() => {
  InputLayout.initStyle()
  if (beforeInput.value)
    new ResizeObserver(...).observe(beforeInput.value)  // anonymous, не cleanup'ится
  if (afterInput.value)
    new ResizeObserver(...).observe(afterInput.value)  // anonymous, не cleanup'ится
  ...
})
...
onUnmounted(() => {
  if (isClient() && layoutObserver) layoutObserver.disconnect()
})
```

`onUnmounted` cleans только один observer (`layoutObserver`). Два других (для `beforeInput` / `afterInput`) — anonymous, references потеряны → утечка.

### Почему это проблема

- ВСЕ form-controls используют InputLayout как обёртку. На странице с 10 inputs → 30 неубранных observers.
- При SPA-навигации каждая mount/unmount-цикл оставляет 2 observer на DOM-узлы которые garbage-collect'ятся, но callback-замыкания держат ref на DOM → утечка памяти.

### Что нужно сделать

1. Сохранить observers в refs:
   ```ts
   const beforeObserver = ref<ResizeObserver>()
   const afterObserver = ref<ResizeObserver>()
   onMounted(() => {
     ...
     if (beforeInput.value) {
       beforeObserver.value = new ResizeObserver(...)
       beforeObserver.value.observe(beforeInput.value)
     }
     if (afterInput.value) {
       afterObserver.value = new ResizeObserver(...)
       afterObserver.value.observe(afterInput.value)
     }
   })
   onUnmounted(() => {
     beforeObserver.value?.disconnect()
     afterObserver.value?.disconnect()
     layoutObserver?.disconnect()
   })
   ```
2. Альтернатива — VueUse `useResizeObserver`.

### Acceptance criteria

- [x] Observers сохраняются в `let`-переменные, `onUnmounted` дисконнектит каждый (тест `ResizeObserver lifecycle > disconnects beforeInput / afterInput / layout observers on unmount`).
- [ ] Long-running heap-profiler test (mount/unmount × 100) — не выполнен в CI (out of scope для unit-теста; покрыт unit-проверкой `disconnect.mock.calls`).

## Issue 3: ~~clipboard.writeText без feature-detect — падает в небезопасных контекстах~~ ✅ resolved 2026-05-11

- **Категория:** C14 (SSR + non-secure context)
- **Severity:** medium
- **Где (was):** ~~[InputLayout.vue:226]~~ → теперь [InputLayout.vue:274-298](../../lib/inputlayout/InputLayout.vue#L274-L298) (feature-detect) + [InputLayout.vue:253-271](../../lib/inputlayout/InputLayout.vue#L253-L271) (`legacyCopy` execCommand fallback).
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
async function copy() {
  if (value.value) {
    await navigator.clipboard.writeText(String(value.value))
    isCopy.value = true
    setTimeout(() => (isCopy.value = false), 3000)
  }
}
```

`navigator.clipboard.writeText`:
- Throws TypeError в HTTP context (требует HTTPS).
- Throws в iframe sandbox без `clipboard-write` permission.
- `navigator` undefined на SSR.

### Что нужно сделать

1. Feature-detect:
   ```ts
   if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
     try {
       await navigator.clipboard.writeText(String(value.value))
       isCopy.value = true
     } catch (err) {
       // Fallback: legacy execCommand
       const el = document.createElement("textarea")
       el.value = String(value.value)
       document.body.appendChild(el)
       el.select()
       document.execCommand("copy")
       document.body.removeChild(el)
       isCopy.value = true
     }
   }
   ```
2. Или использовать VueUse `useClipboard` — handles fallback automatically.

### Acceptance criteria

- [x] `navigator.clipboard === undefined` → `copy()` не бросает; fallback на `execCommand` (тест `Clipboard copy — SSR / non-secure context > does not throw when navigator.clipboard is undefined`).
- [x] `clipboard.writeText` бросает → fallback на `execCommand` (тест `falls back to execCommand when clipboard.writeText throws`).
- [x] SSR-render не падает (`isClient()` guard в начале `copy()` и `legacyCopy()`).

## Issue 4: SSR styles + sideEffects/exports map / unstyled

- **Категория:** C17, A2, A4, A5, L53

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 5: ~~`document.querySelector("header")` — coupling с конкретным DOM в потребителе~~ ✅ resolved 2026-05-11

- **Категория:** C13 (утечка структуры)
- **Severity:** medium
- **Где (was):** ~~[InputLayout.vue:184]~~ — удалено. Заменено на `offsetTop` prop ([InputLayout.vue:177-191](../../lib/inputlayout/InputLayout.vue#L177-L191) — `resolveOffsetTop()`). Тип: `number | string | (() => number)`. По умолчанию `0`.
- **Status:** ✅ resolved 2026-05-11

### Что найдено (исторически)

```ts
if (isClient()) headerHeight.value = <number>document.querySelector("header")?.offsetHeight
```

Хардкоден поиск `<header>`-тега в потребительском приложении. Если у пользователя нет `<header>` или он не на верхнем уровне — `headerHeight` = undefined.

### Почему это проблема

- Coupling с потребительской разметкой — anti-pattern.
- Если пользователь использует `<NuxtPageHeader>` или `<v-app-bar>` — поиск не работает.

### Что нужно сделать

1. Добавить prop `offsetTop?: number | string | (() => number)`:
   ```ts
   const offsetTop = computed(() => {
     if (typeof props.offsetTop === "number") return props.offsetTop
     if (typeof props.offsetTop === "function") return props.offsetTop()
     return 0
   })
   ```
2. Удалить hardcoded `querySelector("header")` или сделать opt-in через prop.

## Issue 6: ~~aria-live для error messages отсутствует~~ ✅ resolved 2026-05-11

- **Категория:** E29.5
- **Severity:** medium
- **Где:** [InputLayout.vue:432-440](../../lib/inputlayout/InputLayout.vue#L432-L440) — `<p data-input-layout-message-invalid aria-live="assertive" aria-atomic="true">`.
- **Status:** ✅ resolved 2026-05-11

`messageInvalid` появляется при validation error. Screen reader озвучивает изменения сразу. Тест: `Accessibility — aria-live on error region` в `InputLayout.test.ts`.

## Issue 7: ~~Hardcoded text "copied!" / "копировано!" для clipboard feedback~~ ✅ resolved 2026-05-11

- **Категория:** F30 (i18n)
- **Severity:** medium
- **Где:** Локализованный ключ `inputLayout.copied` ([locale/locales/en.ts:16-18](../../lib/locale/locales/en.ts#L16-L18), [ru.ts:16-18](../../lib/locale/locales/ru.ts#L16-L18)). Тип в [TypesLocale.d.ts:34-36](../../lib/locale/TypesLocale.d.ts#L34-L36). Использование — [InputLayout.vue:420-428](../../lib/inputlayout/InputLayout.vue#L420-L428) (FixWindow tooltip + `aria-label` на Check-иконке).
- **Status:** ✅ resolved 2026-05-11

Confirm-feedback после успешного copy теперь рендерит FixWindow с локализованным текстом + `aria-label`. Тесты: `Locale — inputLayout.copied` (EN / RU dictionary).

## Issue 8: prefers-reduced-motion / colors / print

См. cross-cutting [button.md](./button.md), [switch.md](./switch.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.InputLayout` | ✅ | mode, animation, `offsetTop` и др. |
| `componentsStyle` global | ✅ | `InputLayout.componentsStyle()` ([InputLayout.vue:40](../../lib/inputlayout/InputLayout.vue#L40)) |
| `unstyled: true` | ❌ | Issue 4 |
| Theme tokens vs hardcode | ⚠️ | через theme-* частично |
| Runtime theme switch | ✅ | через CSS-variables |
| `t()` для текста | ✅ | clear, copy, `inputLayout.copied` confirm — все локализованы (Issue 7 ✅) |
| Runtime locale switch | ✅ | если использует t() — реагирует |

## Dual-API gap

Не применимо — InputLayout — wrapper, не collection.
