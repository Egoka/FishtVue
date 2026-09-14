---
title: Issues — Loading
summary: Аудит Loading. Закрыто 2026-06-03 — coverage loadingTypes 3% → 100% (Issue 1), ARIA role="status"+aria-live+sr-only+локализованный aria-label (Issue 3), LoadingOption.type (Issue 4), снят dup initStyle + sideEffects (Issue 5), reduced-motion static fallback (Issue 6), print:hidden (Issue 8); lazy import (Issue 2) уже был. Закрыто 2026-06-14 — root exports map A4-5 (Issue 5, doc-sync inherited из buildRootExports()). Открыто — hardcoded HEX в Epic/SVG (Issue 7, deferred Wave 9). 2026-08-02 — DX-полировка вне numbered-issue: open-union типы props, снят редундантный `"simple"`, dev-warn для неизвестного color-токена и гейт существующего warn.
updated: 2026-09-06
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
| high | 0 | — |
| medium | 0 | — |
| low | 0 | ~~B10 (hardcoded HEX)~~ ✅ resolved 2026-09-06 — все спиннеры на `currentColor` |

> Закрыто 2026-06-03: Issue 1 (J46), Issue 2 (I44), Issue 3 (E29.1/E29.5/F30), Issue 4 (L53), Issue 5 частично — A2 (sideEffects) + C17 (dup initStyle) + #14 unstyled (cross-cutting), Issue 6 (E29.7), Issue 8 (N59). Закрыто 2026-06-14: Issue 5 финально — A4-5 (root exports map, doc-sync inherited). Остаётся только Issue 7 (B10).

> **2026-08-02 — DX-полировка, матрица не менялась.** Вне numbered-issue: (1) `animationDuration` переведён на open-union по канону `Icons.d.ts` (`… | (number & {})`) — литералы дают autocomplete, любое число по-прежнему допустимо; `size` сведён к `number` (прежние литералы не были осмысленной шкалой — runtime-default 20 в неё даже не входил); из `type` убран редундантный `| "simple"` (это ключ `componentsMapSvg`, то есть уже член `SvgLoading`) — набор допустимых значений не изменился. (2) Неизвестный токен палитры в `color` больше не проглатывается молча — добавлен dev-only warn по канону `Button.vue`; существующий warn в `loadComponent` загейчен `NODE_ENV` и отпрефиксен `[FishtVue Loading]`. **Issue 7 (hardcoded HEX в `epic/*.vue` и `svg/*.vue`) не трогали** — `epic/*` остаются на Options API, что отдельно конфликтует с каноном `<script setup lang="ts">`; промоушен `beta → stable` по-прежнему заблокирован Issue 7, поле `stability` не меняли.

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

## ~~Issue 5: SSR styles + sideEffects + unstyled + exports map~~ ✅ resolved 2026-06-03 (exports map ✅ 2026-06-14)

См. [button.md Issue 1, 8, 9, 14](./button.md).

- **C17 (SSR / dup initStyle, button #1):** ✅ снят `onMounted(() => Loading.initStyle())` — базовый `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`. Comment-marker по канону Wave 2.3. Прогресс Wave 2.3: 10/22 → **11/22**.
- **A2 (sideEffects, button #8):** ✅ `lib/loading/package.json` → `"sideEffects": ["**/*.css", "**/*.vue"]` (см. Issue 2).
- **L14 (unstyled, button #14):** ✅ уже закрыт cross-cutting — `Component.setStyle()` guard. Добавлен regression-тест (`unstyled: true` → `classLoading` без utility-классов).
- **A4-5 (ESM/exports map, button #9):** ✅ resolved 2026-06-14 (doc-sync inherited). Корневая `exports`-карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) (Issue 5c-b, landed ✅ 2026-06-11) из авторитетных rollup-выходов — ЯВНЫЙ identity (`*.mjs`) + extensionless entry на каждый emitted `.mjs` + bare-dir из вложенного `package.json`. Per-component правок Loading **не требует** (зеркало accordion/separator/switch/badge/menu). `fishtvue/loading` резолвится через [lib/loading/package.json](../../lib/loading/package.json) (`module`/`main` → `loading.mjs`, `types` → `Loading.d.ts`). **Loading-specific значимость:** Loading — единственный компонент, чей runtime делает глубокий динамический `import("./epic/*.mjs")` / `import("./svg/*.mjs")` (126 lazy-вариаций: [`addLoadingVariants()`](../../lib/rollup.config.js) собирает каждую отдельным `.mjs`, rewrite `.vue → .mjs` ретаргетит сам `import()`). В pure Node ESM эти чанки резолвятся ТОЛЬКО через identity-entry карты → добавлен Loading-specific контракт-guard в [lib/package.test.ts](../../lib/package.test.ts) (`covers fishtvue/loading bare subpath + its lazy epic/svg chunks (A4-5)`).

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

## ~~Issue 7: Hardcoded HEX colors в SVG paths~~ ✅ resolved 2026-09-06

- **Категория:** B10
- **Severity:** low

Проверить [loadingTypes.ts](../../lib/loading/loadingTypes.ts) на hardcoded fill/stroke цвета в SVG. Заменить на `currentColor` или CSS переменные.

**Статус (2026-06-03):** подтверждено — hardcoded HEX (`#ff1d5e`, `#fff` и т.п.) присутствует в 20 из 20 `epic/*.vue` (props defaults + `<style>`) и 2 из 106 `svg/*.vue`.

**Resolution (2026-09-06, решение R12).** Все 22 файла переведены на `currentColor`: дефолт prop'а `color` и CSS-фолбэки внутри спиннеров. Визуально ничего не изменилось на штатном пути — `Loading` резолвит цвет из палитры и прокидывает его инлайн-стилем, перебивая CSS. Изменилось поведение там, где инлайн-стиль не доезжает (SSR-снимок до гидратации; потребитель, рендерящий спиннер напрямую из `fishtvue/loading/epic/*`): раньше показывался розовый `#ff1d5e` или белый, теперь спиннер наследует цвет текста.

Заведён guard [noHardcodedColors.test.ts](../../lib/loading/noHardcodedColors.test.ts): 22 файла легко разъезжаются обратно, а глазами такой дрейф не ловится. Он же проверяет, что дефолт prop'а `color` у каждого epic-спиннера остаётся `currentColor`.

Стабильность Loading поднята до **`stable`** — Issue 7 был последним, что удерживало `beta`.

## ~~Issue 8: Print styles — Loading скрыть при print~~ ✅ resolved 2026-06-03

См. [button.md Issue 15](./button.md).

- **Resolution:** `classLoading` теперь включает `print:hidden` (`Loading.setStyle(["inline-block", "print:hidden", …])`) — спиннер скрывается на печати. Tailwind `print:` транспилируется в `@media print`. Паттерн зафиксирован Wave 10.2.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Loading` | ✅ | Issue 4 закрыт — `type` включён в `LoadingOption` |
| `componentsStyle` global | N/A | Loading не имеет mode-enum |
| `unstyled: true` | ✅ | cross-cutting через `Component.setStyle()` guard |
| Theme tokens vs hardcode | ✅ | через `color` prop с CSS-vars; Epic/SVG — `currentColor` (Issue 7 ✅ 2026-09-06) |
| `t()` для текста | ✅ | aria-label через `Loading.t("loading.label")` (Issue 3) |
| Runtime locale switch | ✅ | `t()` fallback chain active→default→key (Issue 3) |

## Dual-API gap

Не применимо.
