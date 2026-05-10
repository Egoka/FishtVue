---
title: Issues — Loading
summary: Аудит Loading — beta stability (loadingTypes coverage 3%), Epic-вариации тяжёлые в bundle, нет ARIA role="status", LoadingOption не включает type.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/loading/
related-doc: ../components/loading.md
stability: beta
---

# Issues — Loading

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 5 | A2, A4-5, C17, J46 (loadingTypes 3% coverage), L53 |
| medium | 4 | E29.1, E29.5, F30, I44 (Epic bundle size) |
| low | 3 | E29.7, B10, N59 |

## Issue 1: loadingTypes.ts coverage 3% — большинство EpicLoading вариаций нigde не tested

- **Категория:** J46 (тесты)
- **Severity:** high
- **Где:** [loadingTypes.ts](../../lib/loading/loadingTypes.ts), coverage 3.12% lines

### Что найдено

```
lib/loading/loadingTypes.ts: 3.12 / 100 / 1.58 / 3.12
```

Большая часть named animations (componentsMapEpic, componentsMapSvg) никогда не вызывается в тестах. Невозможно гарантировать, что Epic-вариации не сломаны.

### Что нужно сделать

1. Добавить test для каждой Epic-вариации:
   ```ts
   for (const type of Object.keys(componentsMapEpic)) {
     it(`renders Epic ${type}`, () => {
       const wrapper = mount(Loading, { props: { type } })
       expect(wrapper.exists()).toBe(true)
     })
   }
   ```
2. Аналогично для componentsMapSvg.
3. Целевой coverage > 70% для перехода beta → stable.

## Issue 2: Epic-вариации в bundle — тяжёлые без lazy import

- **Категория:** I44
- **Severity:** medium
- **Где:** [loadingTypes.ts](../../lib/loading/loadingTypes.ts), [Loading.vue](../../lib/loading/Loading.vue)

### Что найдено

`componentsMapEpic` and `componentsMapSvg` — статические импорты всех вариаций, даже если пользователь использует только `type="simple"`. Каждая Epic-вариация — несколько SVG nodes + animations.

### Что нужно сделать

1. Lazy-load каждую вариацию:
   ```ts
   const epicComponents = {
     spinner: defineAsyncComponent(() => import("./epic/Spinner.vue")),
     pulse: defineAsyncComponent(() => import("./epic/Pulse.vue")),
     // ...
   }
   ```
2. Простой `"simple"` оставить static (всегда загружается, малый).
3. Tree-shake-friendly: `sideEffects: false` в lib/loading/package.json.

## Issue 3: ARIA role="status" + aria-live отсутствуют

- **Категория:** E29.1, E29.5
- **Severity:** medium
- **Где:** [Loading.vue](../../lib/loading/Loading.vue)

### Что найдено

Loading рендерит SVG/div, но без `role="status"` и `aria-live="polite"`. Screen reader не объявит «Loading...».

### Что нужно сделать

```vue
<div role="status" aria-live="polite" :aria-label="t('loading.label') ?? 'Loading'">
  ...visual loader...
  <span class="sr-only">{{ t("loading.label") }}</span>
</div>
```

Локализовать `loading.label` в [locales/en.ts](../../lib/locale/locales/en.ts), [ru.ts](../../lib/locale/locales/ru.ts).

## Issue 4: LoadingOption не включает `type` — невозможно глобально задать дефолт

- **Категория:** L53
- **Severity:** high
- **Где:** [Loading.d.ts](../../lib/loading/Loading.d.ts) (`LoadingOption`)

### Что найдено

Уже отмечено в [Documentation/components/loading.md](../components/loading.md) §18:
```ts
LoadingOption = Pick<LoadingProps, "animationDuration" | "size" | "color" | "class">
```
`type` не включён → нельзя через `componentsOptions.Loading.type = "spinner"` задать default.

### Что нужно сделать

1. Расширить `LoadingOption`:
   ```ts
   LoadingOption = Pick<LoadingProps, "type" | "animationDuration" | "size" | "color" | "class">
   ```
2. В [Loading.vue](../../lib/loading/Loading.vue) подбирать `type` через `options?.type ?? "simple"`.

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 6: prefers-reduced-motion — для loader особенно важен

- **Категория:** E29.7
- **Severity:** medium
- **Где:** [Loading.vue](../../lib/loading/Loading.vue) (CSS animations)

### Что найдено

Loading — animation-driven (vibrating, pulsing, rotating). Для пользователей с `prefers-reduced-motion` все вариации могут вызывать дискомфорт.

### Что нужно сделать

1. Все CSS keyframes-анимации обернуть в:
   ```css
   @media (prefers-reduced-motion: no-preference) {
     /* keyframes */
   }
   @media (prefers-reduced-motion: reduce) {
     /* статичный fallback — например, opacity: 0.6 */
   }
   ```
2. Альтернатива — render статичный icon (loader-circle outline) в reduced-motion mode.

## Issue 7: Hardcoded HEX colors в SVG paths?

- **Категория:** B10
- **Severity:** low

Проверить [loadingTypes.ts](../../lib/loading/loadingTypes.ts) на hardcoded fill/stroke цвета в SVG. Заменить на `currentColor` или CSS переменные.

## Issue 8: Print styles — Loading скрыть при print

См. [button.md Issue 15](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Loading` | ⚠️ | Issue 4 — type не включён в Option |
| `componentsStyle` global | N/A | Loading не имеет mode-enum |
| `unstyled: true` | ❌ | cross-cutting |
| Theme tokens vs hardcode | ⚠️ | через `color` prop с CSS-vars OK |
| `t()` для текста | ❌ | нет aria-label через t() (Issue 3) |
| Runtime locale switch | ❌ | если фикс Issue 3 — будет |

## Dual-API gap

Не применимо.
