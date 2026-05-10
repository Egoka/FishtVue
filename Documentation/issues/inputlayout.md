---
title: Issues — InputLayout
summary: Аудит InputLayout — CRITICAL XSS через v-html (help, messageInvalid), memory leak (2× anonymous ResizeObservers без cleanup), navigator.clipboard без feature-detect.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/inputlayout/
related-doc: ../components/input-layout.md
---

# Issues — InputLayout

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 2 | C13 (v-html × 2), H41 (anonymous ResizeObservers leak) |
| high | 4 | A2, A4-5, C17, L53 |
| medium | 4 | C14 (clipboard SSR), E29.5, F30, G34 |
| low | 3 | E29.7, B10, N59 |

## Issue 1: CRITICAL — XSS через `help` и `messageInvalid` (v-html)

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [InputLayout.vue:294](../../lib/inputlayout/InputLayout.vue#L294), [InputLayout.vue:313](../../lib/inputlayout/InputLayout.vue#L313)

### Что найдено

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

- [ ] `<Input message-invalid="<script>alert(1)</script>">` НЕ исполняет.
- [ ] `<Input><template #messageInvalid><strong>Error</strong></template></Input>` рендерит strong-text.
- [ ] Тесты для Aria, Select, Calendar, TextEditor — XSS payload не выполняется.

## Issue 2: CRITICAL — Memory leak: 2 anonymous ResizeObservers без disconnect

- **Категория:** H41
- **Severity:** **critical**
- **Где:** [InputLayout.vue:177](../../lib/inputlayout/InputLayout.vue#L177), [InputLayout.vue:181](../../lib/inputlayout/InputLayout.vue#L181)

### Что найдено

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

- [ ] Mount/unmount × 100 в memory profiler — heap stable.

## Issue 3: clipboard.writeText без feature-detect — падает в небезопасных контекстах

- **Категория:** C14 (SSR + non-secure context)
- **Severity:** medium
- **Где:** [InputLayout.vue:226](../../lib/inputlayout/InputLayout.vue#L226)

### Что найдено

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

- [ ] HTTP context (тест в Lighthouse-mode HTTP) — copy не падает.
- [ ] SSR-render не падает.

## Issue 4: SSR styles + sideEffects/exports map / unstyled

- **Категория:** C17, A2, A4, A5, L53

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 5: `document.querySelector("header")` — coupling с конкретным DOM в потребителе

- **Категория:** C13 (утечка структуры)
- **Severity:** medium
- **Где:** [InputLayout.vue:184](../../lib/inputlayout/InputLayout.vue#L184)

### Что найдено

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

## Issue 6: aria-live для error messages отсутствует

- **Категория:** E29.5
- **Severity:** medium

`messageInvalid` появляется при validation error. Screen reader не объявит. Добавить `aria-live="assertive"` на error-region.

## Issue 7: Hardcoded text "copied!" / "копировано!" для clipboard feedback

- **Категория:** F30 (i18n)
- **Severity:** medium

Если в шаблоне есть «Copied»/«Скопировано» — должно через `t()`. Проверить и фикс.

## Issue 8: prefers-reduced-motion / colors / print

См. cross-cutting [button.md](./button.md), [switch.md](./switch.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.InputLayout` | ✅ | mode, animation и др. |
| `componentsStyle` global | ✅ | `InputLayout.componentsStyle()` ([InputLayout.vue:40](../../lib/inputlayout/InputLayout.vue#L40)) |
| `unstyled: true` | ❌ | Issue 4 |
| Theme tokens vs hardcode | ⚠️ | через theme-* частично |
| Runtime theme switch | ✅ | через CSS-variables |
| `t()` для текста | ⚠️ | clipboard feedback — проверить |
| Runtime locale switch | ✅ | если использует t() — реагирует |

## Dual-API gap

Не применимо — InputLayout — wrapper, не collection.
