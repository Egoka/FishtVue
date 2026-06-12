---
title: Issues — Pagination
summary: Аудит Pagination. Все numbered issues (2–8) закрыты 2026-06-13 — SSR dup-initStyle снят (Wave 2.3), unstyled regression, ARIA nav landmark + per-page aria-label + aria-current + aria-live, RTL (rtl:-scale-x-100 + logical ms), expose paginationRef + focus(), print + forced-colors. Остаётся cross-cutting theme-token hardcode (Wave 9) — файл active.
updated: 2026-06-13
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/pagination/
related-doc: ../components/pagination.md
---

# Issues — Pagination

## Сводка

| Severity | Count | Categories                                            |
| -------- | ----- | ----------------------------------------------------- |
| critical | 0     | ~~H41 (anonymous ResizeObserver leak)~~ ✅ resolved   |
| high     | 0     | ~~A2~~ ✅, ~~A4-5~~ ✅, ~~C17~~ ✅, ~~L53~~ ✅         |
| medium   | 0     | ~~E29.1~~ ✅, ~~E29.5~~ ✅, ~~F31~~ ✅, ~~G34~~ ✅     |
| low      | 0     | ~~E29.7~~ N/A, ~~B10~~ ✅, ~~N59~~ ✅                  |

**Закрыто 2026-06-13:** Issues 2 (C17/A2/A4-5 — наследует cross-cutting SSR + packaging; снят дубль `initStyle`, Wave 2.3 → 14/22), 3 (L53 — unstyled regression к `Component.setStyle` guard), 4 (E29.1 — `<nav>` landmark + localized aria-label + per-page aria-label + aria-current), 5 (E29.5 — sr-only `aria-live="polite"` region), 6 (F31 — RTL `rtl:-scale-x-100` + logical `ms-3`), 7 (G34 — expose `paginationRef` + `focus()`), 8 (N59 print + B10 forced-colors; E29.7 motion N/A — собственных transitions нет). +12 тестов (`Pagination.test.ts`). Зачёркнуты ниже с `✅ resolved`-маркерами.

> **Файл остаётся active:** открыт cross-cutting «Theme tokens vs hardcode» (gray-_ в Button-инстансах, [Wave 9](./README.md)) — не numbered issue, но по конвенции README блокирует перенос в `./done/`.

## ~~Issue 1: CRITICAL — Анонимный ResizeObserver без cleanup~~ ✅ resolved (2026-06-06)

- **Категория:** H41 (memory leaks)
- **Severity:** ~~critical~~ → resolved
- **Где:** [Pagination.vue:259-268](../../lib/pagination/Pagination.vue#L259-L268)

> **Resolved (2026-06-06):** observer'ы теперь сохраняются в локальный массив `navigationObservers` ([Pagination.vue:33](../../lib/pagination/Pagination.vue#L33)) и отключаются в `onBeforeUnmount` ([Pagination.vue:222-225](../../lib/pagination/Pagination.vue#L222-L225)). Массив — обычный (не `ref`): reactive-proxy ломал внутренний WeakMap-lookup полифилла при `disconnect()`. Regression-тесты — `Pagination.test.ts` describe «ResizeObserver cleanup (memory leak guard)».

### Что найдено

```ts
function setShortNavigation(link: HTMLElement, limit: number, refButton: Ref) {
  if (link)
    new ResizeObserver((entries) => {
      for (const entry of entries) refButton.value = (entry as any)?.target["offsetWidth"] < limit
    }).observe(link)
}
```

`new ResizeObserver(...)` — instance не сохраняется (anonymous expression), вызывается на каждое присваивание ref. **Невозможно disconnect**. Нет `onBeforeUnmount` / `onUnmounted` хука вообще.

### Почему это проблема

- Каждый `setShortNavigation` вызов → новый observer на link. Если `link` перерендерится — старый observer остаётся.
- Pagination — компонент часто внутри Table footer; при унgmount Table → Pagination unmount → observers leaked.
- В long-lived dashboard'ах с десятками таблиц — десятки наблюдателей.

### Что нужно сделать

1. Сохранить observer в ref:
   ```ts
   const navigationObserver = ref<ResizeObserver>()
   function setShortNavigation(link, limit, refButton) {
     navigationObserver.value?.disconnect()
     if (link) {
       navigationObserver.value = new ResizeObserver(...)
       navigationObserver.value.observe(link)
     }
   }
   onBeforeUnmount(() => navigationObserver.value?.disconnect())
   ```
2. Альтернатива — VueUse `useResizeObserver(target, callback)`.
3. Тест: профилирование mount/unmount × 100 — heap stable.

### Acceptance criteria

- [x] `onBeforeUnmount` вызывает disconnect. ✅ ([Pagination.vue:222-225](../../lib/pagination/Pagination.vue#L222-L225))
- [x] Профилирование DevTools heap не растёт. ✅ (proxy через тест: disconnect-count масштабируется по mount/unmount циклам)

## ~~Issue 2: SSR styles + sideEffects/exports map~~ ✅ resolved 2026-06-13

- **Категория:** C17, A2, A4, A5
- **Severity:** ~~high~~ → resolved

> **Resolution (2026-06-13).** Cross-cutting — Pagination наследует уже закрытые root-уровневые фиксы:
>
> - **SSR (C17):** `Component.__hooks()` в конструкторе ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) регистрирует `onServerPrefetch + vueOnMounted → initStyle()` — критический CSS попадает в SSR-HTML без правок SFC (см. [button.md Issue 1](./button.md)). Дополнительно снят **дубль** `Pagination.initStyle()` из `onMounted` (был нарушением канона [dev-patterns §2](../dev-patterns.md); Pagination пропустили в Wave 2.3 sweep) — теперь SFC полагается только на base-class hook ([Pagination.vue:226–236](../../lib/pagination/Pagination.vue#L226-L236)). Wave 2.3 → 14/22. Static-source regression-тест (`Pagination.test.ts` describe «Initialization (no duplicate initStyle)»).
> - **sideEffects (A2) + exports map (A4-5):** закрыты на root-уровне — `"sideEffects": false` инжектится в `dist/pagination/package.json` через `copyDependencies()`, а `fishtvue/pagination` присутствует в корневой `exports`-карте (`buildRootExports()`). См. [button.md Issue 8, 9](./button.md).

См. [button.md Issue 1, 8, 9](./button.md).

## ~~Issue 3: Нет `unstyled: true` обработки~~ ✅ resolved 2026-06-13

- **Категория:** L53
- **Severity:** ~~high~~ → resolved

> **Resolution (2026-06-13, cross-cutting).** Guard `if (config.unstyled) return ""` в `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138)) коллапсит корневой `classBase` ([Pagination.vue:134–140](../../lib/pagination/Pagination.vue#L134-L140)) и все `class*`-словари Pagination в `""` при `unstyled: true`. Добавлен regression-тест (`Pagination.test.ts` describe «Configuration support (unstyled)»): root `class` пуст при `unstyled: true`, содержит `fishtvue-pagination` при `unstyled: false`; `afterEach` чистит `window.FishtVue` (singleton-leak guard). См. [button.md Issue 14](./button.md), [component-class.md Issue 6](./component-class.md).

См. [button.md Issue 14](./button.md).

## ~~Issue 4: ARIA — нет `role="navigation"` и `aria-label`~~ ✅ resolved 2026-06-13

- **Категория:** E29.1
- **Severity:** ~~medium~~ → resolved
- **Где:** [Pagination.vue:292–297](../../lib/pagination/Pagination.vue#L292-L297)

> **Resolution (2026-06-13).** Корневой `<div>` заменён на `<nav role="navigation" :aria-label="Pagination.t('pagination.label')">` ([Pagination.vue:292–297](../../lib/pagination/Pagination.vue#L292-L297)) — единственный navigation landmark, покрывает и mobile-prev/next, и desktop-навигацию. Внутренний `<nav data-pagination-nav aria-label="Pagination">` понижен до `<div>` ([Pagination.vue:349](../../lib/pagination/Pagination.vue#L349)) — больше нет дубля landmark. Каждой page-кнопке добавлен `:aria-label="${t('pagination.page')} ${page}"` ([Pagination.vue:372](../../lib/pagination/Pagination.vue#L372)) — пробрасывается через `ButtonProps.ariaLabel`; `aria-current="page"` на активной ([Pagination.vue:371](../../lib/pagination/Pagination.vue#L371)). Ключи `pagination.label` / `pagination.page` локализованы (`en`/`ru` + `TypesLocale.d.ts`). Покрыто тестами (`Pagination.test.ts` describe «Accessibility (ARIA)»): nav-tag + role + localized aria-label, отсутствие второго landmark, per-page aria-label + aria-current.

### Что найдено

```vue
<div data-pagination :class="classBase">
```

Корневой `<div>` без семантической роли. Стандарт WAI-ARIA: pagination — это `<nav aria-label="Pagination">`.

### Что нужно сделать

1. Поменять корень на `<nav role="navigation" :aria-label="t('pagination.label') ?? 'Pagination'">`.
2. На каждой странице кнопке: `:aria-label="`Page ${pageNumber}`"`.
3. На активной странице: `aria-current="page"`.
4. Локализовать `pagination.label`, `pagination.pageN` ключи.

### Acceptance criteria

- [x] axe-core: единственный navigation landmark, page-кнопки имеют accessible name (`aria-label`), active помечена `aria-current="page"`. ✅
- [x] Screen reader озвучивает «Pagination, navigation» при focus (root `<nav>` + localized `aria-label`). ✅

## ~~Issue 5: aria-live для смены страницы отсутствует~~ ✅ resolved 2026-06-13

- **Категория:** E29.5
- **Severity:** ~~medium~~ → resolved
- **Где:** [Pagination.vue:298–307](../../lib/pagination/Pagination.vue#L298-L307)

> **Resolution (2026-06-13).** Добавлен sr-only `role="status"` `aria-live="polite"` `aria-atomic="true"` region ([Pagination.vue:298–307](../../lib/pagination/Pagination.vue#L298-L307)) с текстом «{page} {activePage} {of} {lastPage}» (локализовано через `pagination.page` + `of`). При смене `modelValue` текст обновляется → screen reader объявляет «Page 3 of 10». Класс — `classAriaLive = Pagination.setStyle("sr-only")` (зеркало Table `[data-table-aria-live]`). Покрыто тестом (`Pagination.test.ts` → «renders a polite live region announcing the active page»).

После клика на «Next page» screen reader не объявляет «Page 3 of 10». Добавить `aria-live="polite"` region.

## ~~Issue 6: RTL — кнопки prev/next не зеркалятся~~ ✅ resolved 2026-06-13

- **Категория:** F31
- **Severity:** ~~medium~~ → resolved
- **Где:** [Pagination.vue:182–183](../../lib/pagination/Pagination.vue#L182-L183) (icon-классы)

> **Resolution (2026-06-13).** Канон [dev-patterns §2](../dev-patterns.md) (RTL через variant-классы, без правок theme-движка):
>
> 1. **Порядок prev/next** зеркалится нативно — `classNav` уже `inline-flex` ([Pagination.vue:162](../../lib/pagination/Pagination.vue#L162)), main-axis следует `direction` документа (`dir="rtl"` → previous визуально справа, next слева). Дополнительный `flex-row-reverse` НЕ нужен (он бы повторно реверснул).
> 2. **Directional иконки** (Chevron/ArrowLong prev+next) получили `rtl:-scale-x-100` — горизонтальный флип в RTL ([Pagination.vue:182–183](../../lib/pagination/Pagination.vue#L182-L183)).
> 3. **Физический `ml-3`** в `classIconContent` заменён на logical `ms-3` (margin-inline-start, auto-флип).
>
> Покрыто тестами (`Pagination.test.ts` describe «RTL (direction-aware icons)»): chevron содержит `rtl:-scale-x-100`; long-arrow содержит `ms-3`, не содержит `ml-3`.

## ~~Issue 7: `paginationRef` не exposed~~ ✅ resolved 2026-06-13

- **Категория:** G34
- **Severity:** ~~medium~~ → resolved
- **Где:** [Pagination.vue:203–224](../../lib/pagination/Pagination.vue#L203-L224) (`defineExpose`), [Pagination.d.ts:108–214](../../lib/pagination/Pagination.d.ts#L108-L214)

> **Resolution (2026-06-13).** В `defineExpose` добавлены `paginationRef` (ref на корневой `<nav>`) и `focus(options?: FocusOptions)` ([Pagination.vue:205,223,274–277](../../lib/pagination/Pagination.vue#L274-L277)); `PaginationExpose` расширен с JSDoc ([Pagination.d.ts:110–115, 209–213](../../lib/pagination/Pagination.d.ts#L209-L213)) — паритет с [Button](../components/button.md) `buttonRef`/`focus`. Пользователь делает `useTemplateRef<typeof Pagination>("p").value?.focus()` без DOM-селекторов. Покрыто тестом (`Pagination.test.ts` → «exposes paginationRef pointing to the root nav and a focus() method»).

## ~~Issue 8: prefers-reduced-motion / print / colors~~ ✅ resolved 2026-06-13

- **Категория:** E29.7, N59, B10
- **Severity:** ~~low~~ → resolved

> **Resolution (2026-06-13, канон Table Issue 12).**
>
> - **prefers-reduced-motion (E29.7):** N/A — собственные `setStyle`-классы Pagination не содержат `transition`/`duration`/animation; интерактивные transitions живут в дочерних `<Button>`/`<Select>` (уже `motion-safe:` через их Issue 10).
> - **print (N59):** style-for-print (не `display:none`) — `print:border-black` на `classBase` ([Pagination.vue:136](../../lib/pagination/Pagination.vue#L136)), `print:text-black` на active-индикаторе ([Pagination.vue:150](../../lib/pagination/Pagination.vue#L150)) и `print:font-bold print:text-black` на active page ([Pagination.vue:199–201](../../lib/pagination/Pagination.vue#L199-L201)); дочерние `<Button>` уже печатаются монохромно (button.md Issue 15).
> - **forced-colors / high-contrast (B10):** `forced-colors:outline forced-colors:outline-offset-2` на active page-кнопке ([Pagination.vue:199–201](../../lib/pagination/Pagination.vue#L199-L201)) — текущая страница остаётся различимой, когда системные цвета перекрывают `bg-theme-*`.
>
> Покрыто тестами (`Pagination.test.ts` describe «Print & forced-colors»). Hardcoded `gray-_`/`stone-_` токены — отдельный cross-cutting [Wave 9](./README.md), не входит в этот issue.

См. [button.md Issue 10](./button.md) (motion-safe pattern), [button.md Issue 15](./button.md) (print), [table.md Issue 12](./table.md) (motion/print/forced-colors).

## Cross-cutting: Configuration support

| Настройка                      | Поддержано? | Комментарий                                                                                                              |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `componentsOptions.Pagination` | ✅          | mode, sizePage, и др.                                                                                                    |
| `componentsStyle` global       | ✅          | через `Pagination.componentsStyle()`                                                                                     |
| `unstyled: true`               | ✅          | Issue 3 ✅ — cross-cutting `Component.setStyle()` guard                                                                  |
| Theme tokens vs hardcode       | ⚠️          | gray-_ hardcode в Button-инстансах; theme-_ — OK ([Wave 9](./README.md))                                                |
| Runtime theme switch           | ✅          | через CSS-переменные                                                                                                     |
| `t()` для текста               | ✅          | `Pagination.t("previous")`, `Pagination.t("next")`, `Pagination.t("pagination.label")` ([Pagination.vue:314, 328](../../lib/pagination/Pagination.vue#L314)) |
| Runtime locale switch          | ✅          | реагирует, т. к. использует `t()`                                                                                        |

## Dual-API gap

Не применимо в strong форме — Pagination не collection с per-item customization. Слабая опция — `<Pagination><PaginationButton type="prev"><PaginationItem :page=1>...</Pagination>` для composition, но это over-engineering для простого UI.
