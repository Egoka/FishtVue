---
title: Issues — Badge
summary: Аудит Badge — все issues закрыты (matrix 0/0/0/0). Packaging (A2/A4-5) + unstyled (L53) наследуют cross-cutting Wave 2.1/3.1; F31 (RTL logical padding) + B10 (forced-colors) сделаны в SFC 2026-06-13; E29.7 — N/A. Файл остаётся active как Wave 9 трекер (semantic-token neutral-*).
updated: 2026-06-13
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/badge/
related-doc: ../components/badge.md
---

# Issues — Badge

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 0     | —          |
| medium   | 0     | —          |
| low      | 0     | —          |

> 2026-06-13: **all Badge issues closed → matrix `0/0/0/0`.** Packaging A2/A4-5 (Issue 1) + unstyled L53 (Issue 3) наследуют cross-cutting Wave 2.1/3.1 (landed в каноне), per-component правок не потребовали — закрыты doc-sync + Badge-scoped unstyled regression-тестом. F31 (RTL `pl-1`/`pr-1` → `ps-1`/`pe-1`) + B10 (`forced-colors:outline`) сделаны в [Badge.vue](../../lib/badge/Badge.vue) (Issue 6); E29.7 — N/A (нет собственных transitions). +7 тестов (`Badge.test.ts` 21 → 28). Файл остаётся в `active/` как трекер [Wave 9](../README.md) (полная semantic-token миграция `neutral-*`), зеркало Switch/Input/Split.

> 2026-05-10: **all Badge-SFC-specific work done.** Issues 2, 4, 5 resolved полностью; Issue 1 — C17 (per-SFC `onMounted` dup) удалён, packaging A2/A4-5 = cross-cutting в [lib/package.json](../../lib/package.json) под [Wave 2.1](../README.md#21-packaging-one-time-fix-в-libpackagejson); Issues 3 (unstyled) и 6 (reduced-motion/RTL/colors) — cross-cutting.

## ~~Issue 1: SSR styles + sideEffects/exports map~~ ✅ resolved (Badge-part 2026-05-10 / packaging 2026-06-13 doc-sync)

- **Категория:** C17, A2, A4, A5
- **Severity:** high
- **Status:** resolved — Badge-specific закрыт 2026-05-10; packaging наследует Wave 2.1 (landed в каноне), per-component правок нет.

См. [button.md Issue 1, 8, 9](../button.md). Идентичный fix для всех 22 компонентов.

- ~~C17 — `onMounted(() => Badge.initStyle())` дублирующий init в Badge.vue~~ ✅ resolved 2026-05-10: удалён, авто-init идёт через [Component.\_\_hooks()](../../lib/component/index.ts#L79-L84).
- ~~A2 (`sideEffects`), A4-A5 (ESM-only + root `exports` map)~~ ✅ resolved 2026-06-13 (doc-sync): корневой `"sideEffects": false` (✅2026-06-07) + `buildRootExports()` (✅2026-06-11) покрывают `fishtvue/badge` strict-superset'ом из авторитетных rollup-выходов ([Wave 2.1](../README.md#21-packaging-one-time-fix-в-libpackagejson)). Badge наследует, правок в [lib/package.json](../../lib/package.json) не требуется.

## ~~Issue 2: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-10

- **Категория:** L53
- **Severity:** high
- **Где:** [Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23)
- **Status:** resolved 2026-05-10

~~`mode` не учитывал global `componentsStyle`.~~ Добавлен `componentsStyleMode` helper и расширен fallback chain:

```ts
const componentsStyleMode = computed<NonNullable<BadgeProps["mode"]> | undefined>(() => {
  const cs = Badge.componentsStyle()
  return cs === "filled" ? "primary" : cs === "outlined" ? "outline" : cs === "underlined" ? "neutral" : undefined
})
const mode = computed<NonNullable<BadgeProps["mode"]>>(
  () => props.mode ?? options?.mode ?? componentsStyleMode.value ?? "primary"
)
```

Маппинг по аналогии с Button (Wave 3.2: `underlined→ghost`): для Badge `underlined→neutral` — ближайший минимально-визуальный mode.

См. [button.md Issue 13](../button.md) — параллельный fix.

## ~~Issue 3: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-06-13

- **Категория:** L53
- **Severity:** high
- **Status:** resolved — канонический guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) landed 2026-05-11 во всех 22 компонентах ([Wave 3.1](../README.md#31-unstyled-true-enforcement-один-фикс--22-компонента)); Badge-SFC исходник не меняет. Закрыт Badge-scoped regression-тестом (`describe("Configuration support — unstyled")`: `classBase === ""` при `unstyled:true` + базовые классы при `false`; `afterEach` чистит `window.FishtVue` singleton-leak).

См. [button.md Issue 14](../button.md), [switch.md Issue 10](../switch.md).

## ~~Issue 4: Outline-mode + neutral — низкий contrast в light mode~~ ✅ resolved 2026-05-10

- **Категория:** E29.6 (WCAG contrast)
- **Severity:** medium
- **Где:** [Badge.vue:38](../../lib/badge/Badge.vue#L38)
- **Status:** resolved 2026-05-10

### Что найдено

~~`ring-neutral-500/30` (30% opacity) — едва видна граница.~~ Заменено на полную непрозрачность с парным dark-mode вариантом:

```ts
mode.value === "outline" ?
  ... : "ring-1 ring-inset text-neutral-600 dark:text-neutral-200 ring-neutral-300 dark:ring-neutral-700"
```

Light: `ring-neutral-300` (#d4d4d4) на белом — 3:1 non-text contrast WCAG AA. Dark: `ring-neutral-700` (#404040) — 3:1.

### Что нужно сделать

1. ~~`ring-neutral-500/30` → `ring-neutral-300` (full opacity).~~ ✅
2. axe-core test для всех mode комбинаций — отложено в Wave 4 (cross-cutting a11y).

## ~~Issue 5: Emit `delete` — лучше `close` или `update:show`~~ ✅ resolved 2026-05-10 (soft deprecation)

- **Категория:** D26
- **Severity:** medium
- **Где:** [Badge.vue:80–83](../../lib/badge/Badge.vue#L80-L83), [Badge.d.ts:53–64](../../lib/badge/Badge.d.ts#L53-L64)
- **Status:** soft deprecation — резолв 2026-05-10. Жёсткое удаление — Wave 12 codemod при major bump.

### Что найдено

~~«Delete» подразумевает destructive backend-операцию.~~ Добавлен event `close` (Vue UI-action convention), эмитится одновременно с `delete` для обратной совместимости:

```ts
function deleteBadge() {
  emit("delete")
  emit("close")
}
```

`delete` помечен `@deprecated` в [Badge.d.ts:57](../../lib/badge/Badge.d.ts#L57) — IDE/Volar показывают предупреждение.

### Что нужно сделать

1. ~~Добавить новый event `close` или `update:show` рядом с `delete` (deprecation soft).~~ ✅ `close` добавлен.
2. ~~Console.warn при использовании `delete` в minor.~~ Отложено: без чистого способа детектировать конкретный listener это пустой шум. JSDoc `@deprecated` даёт IDE-warning; codemod в Wave 12 — путь миграции.
3. ~~В major (1.0) — убрать `delete`.~~ Запланировано: [Wave 12](../README.md#-wave-12--migration--dx) codemod.

## ~~Issue 6: prefers-reduced-motion / RTL / colors hardcode~~ ✅ resolved 2026-06-13

- **Категория:** E29.7, F31, B10
- **Severity:** low
- **Где:** [Badge.vue classBase](../../lib/badge/Badge.vue#L48-L66)
- **Status:** resolved 2026-06-13.

### Что найдено и сделано

- **F31 (RTL).** ~~Аудит считал, что «Badge left-right-классов не имеет» — неверно:~~ `classBase` использовал физические `pl-1` (point-only) / `pr-1` (close-only). Заменены на логические `ps-1` / `pe-1` (`padding-inline-start/end`) — авто-флип в RTL без `dir`-атрибута (движок понимает `ps`/`pe`, [dev-patterns §2](../dev-patterns.md)). Симметричный `px-1` (point + close) не трогался. Зеркало [table.md Issue 11](./table.md) / [pagination.md Issue 6](./pagination.md).
- **B10 (colors / forced-colors).** Добавлен `forced-colors:outline` на базовый класс — badge остаётся видимым в Windows high-contrast, где `bg-*` сбрасывается (зеркало [switch.md Issue 12](../switch.md) / [split.md B10](./split.md)). Accents `bg-theme-*`/`text-theme-*`/`ring-theme-*` уже preset-aware (`var(--theme)`). Структурные `neutral-*` в outline-ветке — намеренный WCAG-contrast (Issue 4), не трогались; полная semantic-token миграция (`surface`/`border`) → [Wave 9](../README.md) (extension движка) — файл остаётся active.
- **E29.7 (reduced-motion).** N/A — Badge сам transition/animate-классов не имеет; close-кнопка рендерится через `<Button mode="ghost">`, чьи transitions уже `motion-safe:` (button-side). Зеркало [pagination.md Issue 8](./pagination.md) (motion N/A).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                                                                                           |
| ------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.Badge` | ✅          | mode, point, closeButton, class, classContent                                                                                                         |
| `componentsStyle` global  | ✅          | через mapping `filled→primary`, `outlined→outline`, `underlined→neutral` ([Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23)) — resolved 2026-05-10 |
| `unstyled: true`          | ✅          | Issue 3 ✅ resolved 2026-06-13 — canonical `Component.setStyle` guard + Badge regression-тест                                                         |
| Theme tokens vs hardcode  | ⚠️          | `theme-*` preset-aware; `forced-colors:outline` для high-contrast (Issue 6); структурные `neutral-*` (outline contrast) → Wave 9                      |
| Runtime theme switch      | ✅          | через CSS-переменные theme-\*                                                                                                                         |
| `t()` для текста          | N/A         | контент через slot                                                                                                                                    |
| Runtime locale switch     | N/A         | —                                                                                                                                                     |

## Dual-API gap

Не применимо — Badge не collection.
