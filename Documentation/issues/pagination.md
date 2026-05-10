---
title: Issues — Pagination
summary: Аудит Pagination — memory leak (anonymous ResizeObserver без cleanup), нет ARIA navigation роли, RTL, виртуализация для много-страничной нумерации.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/pagination/
related-doc: ../components/pagination.md
---

# Issues — Pagination

## Сводка

| Severity | Count | Categories                          |
| -------- | ----- | ----------------------------------- |
| critical | 1     | H41 (anonymous ResizeObserver leak) |
| high     | 4     | A2, A4-5, C17, L53                  |
| medium   | 4     | E29.1, E29.5, F31, G34              |
| low      | 3     | E29.7, B10, N59                     |

## Issue 1: CRITICAL — Анонимный ResizeObserver без cleanup

- **Категория:** H41 (memory leaks)
- **Severity:** **critical**
- **Где:** [Pagination.vue:253-258](../../lib/pagination/Pagination.vue#L253-L258)

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

- [ ] `onBeforeUnmount` вызывает disconnect.
- [ ] Профилирование DevTools heap не растёт.

## Issue 2: SSR styles + sideEffects/exports map

- **Категория:** C17, A2, A4, A5
- **Severity:** high

См. [button.md Issue 1, 8, 9](./button.md).

## Issue 3: Нет `unstyled: true` обработки

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 4: ARIA — нет `role="navigation"` и `aria-label`

- **Категория:** E29.1
- **Severity:** medium
- **Где:** [Pagination.vue:262](../../lib/pagination/Pagination.vue#L262)

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

- [ ] axe-core проходит для Pagination.
- [ ] Screen reader озвучивает «Pagination, navigation» при focus.

## Issue 5: aria-live для смены страницы отсутствует

- **Категория:** E29.5
- **Severity:** medium

После клика на «Next page» screen reader не объявляет «Page 3 of 10». Добавить `aria-live="polite"` region.

## Issue 6: RTL — кнопки prev/next не зеркалятся

- **Категория:** F31
- **Severity:** medium
- **Где:** [Pagination.vue:266-284](../../lib/pagination/Pagination.vue#L266-L284) (Previous/Next кнопки)

### Что найдено

В RTL «next» должен быть слева, «previous» справа. Текущий layout — fixed left-to-right.

### Что нужно сделать

1. Использовать `flex-row` (default) для LTR и `rtl:flex-row-reverse` для RTL.
2. Иконки стрелок swap'ить через CSS `[dir="rtl"] [data-pagination-prev]`.

## Issue 7: `inputRef` не exposed

- **Категория:** G34
- **Severity:** medium

Pagination не expose'д ref на корневой `<nav>`. Пользователь не может programmatically focus.

## Issue 8: prefers-reduced-motion / print / colors

См. [done/button.md Issue 10](./done/button.md) (motion-safe pattern, resolved), [button.md Issue 15](./button.md) (print — open), [switch.md Issue 12](./switch.md).

## Cross-cutting: Configuration support

| Настройка                      | Поддержано? | Комментарий                                                                                                              |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `componentsOptions.Pagination` | ✅          | mode, sizePage, и др.                                                                                                    |
| `componentsStyle` global       | ✅          | через `Pagination.componentsStyle()`                                                                                     |
| `unstyled: true`               | ❌          | Issue 3                                                                                                                  |
| Theme tokens vs hardcode       | ⚠️          | gray-_ hardcode в Button-инстансах; theme-_ — OK                                                                         |
| Runtime theme switch           | ✅          | через CSS-переменные                                                                                                     |
| `t()` для текста               | ✅          | `Pagination.t("previous")`, `Pagination.t("next")` ([Pagination.vue:269, 283](../../lib/pagination/Pagination.vue#L269)) |
| Runtime locale switch          | ✅          | реагирует, т. к. использует `t()`                                                                                        |

## Dual-API gap

Не применимо в strong форме — Pagination не collection с per-item customization. Слабая опция — `<Pagination><PaginationButton type="prev"><PaginationItem :page=1>...</Pagination>` для composition, но это over-engineering для простого UI.
