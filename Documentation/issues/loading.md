---
title: Issues — Loading
summary: Аудит Loading. Закрыто 2026-06-03 — coverage loadingTypes 3% → 100% (Issue 1), ARIA role="status"+aria-live+sr-only+локализованный aria-label (Issue 3), LoadingOption.type (Issue 4), снят dup initStyle + sideEffects (Issue 5), reduced-motion static fallback (Issue 6), print:hidden (Issue 8); lazy import (Issue 2) уже был. Открыто — hardcoded HEX в Epic/SVG (Issue 7, deferred Wave 9) + root exports map (Wave 2.1).
updated: 2026-06-03
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
| high | 1 | A4-5 (root exports map — deferred Wave 2.1) |
| medium | 0 | — |
| low | 1 | B10 (hardcoded HEX — deferred Wave 9) |

> Закрыто 2026-06-03: Issue 1 (J46), Issue 2 (I44), Issue 3 (E29.1/E29.5/F30), Issue 4 (L53), Issue 5 частично — A2 (sideEffects) + C17 (dup initStyle) + #14 unstyled (cross-cutting), Issue 6 (E29.7), Issue 8 (N59). Остаётся Issue 7 (B10) и root-level exports map (A4-5).

## ~~Issue 1: loadingTypes.ts coverage 3% — большинство EpicLoading вариаций нигде не tested~~ ✅ resolved 2026-06-03

- **Категория:** J46 (тесты)
- **Severity:** ~~high~~
- **Где:** [loadingTypes.ts](../../lib/loading/loadingTypes.ts)
- **Resolution:** добавлен [Loading.test.ts](../../lib/loading/Loading.test.ts) (145 кейсов). `it.each(Object.entries(componentsMapEpic))` + `componentsMapSvg` рендерят каждую из 126 вариаций; `loadingTypes.ts` coverage **3.12% → 100%**, `Loading.vue` → 100% lines.

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

## ~~Issue 2: Epic-вариации в bundle — тяжёлые без lazy import~~ ✅ resolved (уже реализовано; sideEffects добавлен 2026-06-03)

- **Категория:** I44
- **Severity:** ~~medium~~
- **Где:** [loadingTypes.ts](../../lib/loading/loadingTypes.ts), [Loading.vue](../../lib/loading/Loading.vue)
- **Resolution:** `componentsMapEpic`/`componentsMapSvg` уже были `() => import("./...")` (lazy), а `Loading.vue` использует `defineAsyncComponent` — каждая вариация догружается по требованию. Оставшийся пункт (`sideEffects`) закрыт в рамках Issue 5: `lib/loading/package.json` получил `"sideEffects": ["**/*.css", "**/*.vue"]` (массив, а не `false` — анимации Epic/SVG живут в SFC `<style>`, их нельзя tree-shake'ить).

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

## ~~Issue 3: ARIA role="status" + aria-live отсутствуют~~ ✅ resolved 2026-06-03

- **Категория:** E29.1, E29.5, F30
- **Severity:** ~~medium~~
- **Где:** [Loading.vue](../../lib/loading/Loading.vue)
- **Resolution:** корень `<div data-loading role="status" aria-live="polite" :aria-label="ariaLabel">` + visually-hidden `<span class="sr-only">{{ ariaLabel }}</span>`. `ariaLabel = Loading.t("loading.label")` — новый locale-ключ `loading.label` в [en.ts](../../lib/locale/locales/en.ts)/[ru.ts](../../lib/locale/locales/ru.ts) + `DefaultMessages` ([TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts)). Runtime locale-switch работает через `t()` fallback chain.

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

## ~~Issue 4: LoadingOption не включает `type` — невозможно глобально задать дефолт~~ ✅ resolved 2026-06-03

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [Loading.d.ts](../../lib/loading/Loading.d.ts) (`LoadingOption`)
- **Resolution:** `LoadingOption = Pick<LoadingProps, "type" | "animationDuration" | "size" | "color" | "class">`. `Loading.vue` резолвит тип через computed `resolvedType = props.type ?? options?.type ?? "simple"` (использован в `defineAsyncComponent` loader, `watch` и `defineExpose`). `componentsOptions.Loading.type = "spinner"` теперь задаёт дефолт глобально.

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

## ~~Issue 5: SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-06-03 (exports map — deferred Wave 2.1)

См. [button.md Issue 1, 8, 9, 14](./button.md).

- **C17 (SSR / dup initStyle, button #1):** ✅ снят `onMounted(() => Loading.initStyle())` — базовый `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`. Comment-marker по канону Wave 2.3. Прогресс Wave 2.3: 10/22 → **11/22**.
- **A2 (sideEffects, button #8):** ✅ `lib/loading/package.json` → `"sideEffects": ["**/*.css", "**/*.vue"]` (см. Issue 2).
- **L14 (unstyled, button #14):** ✅ уже закрыт cross-cutting — `Component.setStyle()` guard. Добавлен regression-тест (`unstyled: true` → `classLoading` без utility-классов).
- **A4-5 (ESM/exports map, button #9):** ⏳ root-level задача ([lib/package.json](../../lib/package.json), Wave 2.1) — **не** per-component, остаётся открытой.

## ~~Issue 6: prefers-reduced-motion — для loader особенно важен~~ ✅ resolved 2026-06-03

- **Категория:** E29.7
- **Severity:** ~~medium~~
- **Где:** [Loading.vue](../../lib/loading/Loading.vue) (CSS animations)
- **Resolution:** static fallback (вариант из «Что нужно сделать» п.2). `Loading.vue` через `window.matchMedia("(prefers-reduced-motion: reduce)")` (`isClient()`-guard + `change`-listener + `onBeforeUnmount` cleanup) держит `prefersReducedMotion`; при `reduce` рендерит статичный `SimpleLoading` (`:animation-duration="0"`) вместо анимированной вариации. Один guard в обёртке покрывает все 126 Epic/SVG вариаций — без правок per-file и без SFC `<style>` (канон §4).

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

## Issue 7: Hardcoded HEX colors в SVG paths? — ⏳ deferred Wave 9

- **Категория:** B10
- **Severity:** low

Проверить [loadingTypes.ts](../../lib/loading/loadingTypes.ts) на hardcoded fill/stroke цвета в SVG. Заменить на `currentColor` или CSS переменные.

**Статус (2026-06-03):** подтверждено — hardcoded HEX (`#ff1d5e`, `#fff` и т.п.) присутствует в 20 из 20 `epic/*.vue` (props defaults + `<style>`) и 2 из 106 `svg/*.vue`. Inline `:style` уже перебивает CSS-цвет для элементов, получающих resolved `color`, но CSS-fallback'и остаются. **Отложено в Wave 9** (semantic tokens / colors→CSS-vars, cross-cutting) — не входит в текущий проход во избежание visual-regression на 22 файлах. До закрытия Issue 7 стабильность Loading остаётся `beta`.

## ~~Issue 8: Print styles — Loading скрыть при print~~ ✅ resolved 2026-06-03

См. [button.md Issue 15](./button.md).

- **Resolution:** `classLoading` теперь включает `print:hidden` (`Loading.setStyle(["inline-block", "print:hidden", …])`) — спиннер скрывается на печати. Tailwind `print:` транспилируется в `@media print`. Паттерн зафиксирован Wave 10.2.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Loading` | ✅ | Issue 4 закрыт — `type` включён в `LoadingOption` |
| `componentsStyle` global | N/A | Loading не имеет mode-enum |
| `unstyled: true` | ✅ | cross-cutting через `Component.setStyle()` guard |
| Theme tokens vs hardcode | ⚠️ | через `color` prop с CSS-vars OK; hardcoded HEX в Epic/SVG — Issue 7 (Wave 9) |
| `t()` для текста | ✅ | aria-label через `Loading.t("loading.label")` (Issue 3) |
| Runtime locale switch | ✅ | `t()` fallback chain active→default→key (Issue 3) |

## Dual-API gap

Не применимо.
