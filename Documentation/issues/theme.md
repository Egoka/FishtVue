---
title: Issues — Theme system
summary: Аудит theme — coverage themes/ и uno.ts 0%, нет публичного API usePreset/updatePreset/$dt/palette (заявлены в публичной доке но не экспортируются), no documented runtime theme switch path.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support
source: lib/theme/
related-doc: ../architecture/theme.md
---

# Issues — Theme

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 6 | A2, A4-5, J46 (themes 0% coverage), L53 (no usePreset/updatePreset API), C17 (CSS layers), B11 (darkModeSelector inconsistent) |
| medium | 4 | D21, F31, B10, K46 (uno.ts 0%) |
| low | 2 | E29, N59 |

## Issue 1: Публичный API `usePreset`/`updatePreset`/`$dt`/`palette` НЕ существует — а заявлен в Documentation

- **Категория:** L53 (Configuration support gap)
- **Severity:** high
- **Где:** [theme/index.ts](../../lib/theme/index.ts) (22 lines re-export), [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md)

### Что найдено

Публичная Configuration документация [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает:
- `usePreset(MyPreset)` — полная замена пресета.
- `updatePreset({...})` — merge.
- `updatePrimaryPalette({50: ..., 950: ...})`.
- `updateSurfacePalette({...})`.
- `$dt('path.to.token')` — метаданные токена.
- `palette('#color')` — генерация палитры.

В коде lib/theme/:
- index.ts (22 lines) — только linksTheme + NamesTheme exports.
- helpers/themeHandler.ts (41 lines) — internal.
- helpers/palette.ts (65 lines) — есть функция, но не exported в публичный API.
- Нет файлов `usePreset.ts`, `updatePreset.ts`, `$dt.ts`.

### Почему это проблема

- **Documentation lies** — публичные docs обещают API, которого нет в lib.
- Пользователь, доверяющий 2.Theming.md, попытается `import { usePreset } from "fishtvue/theme"` → не найдёт.
- Runtime theme switch (key feature) — не работает как обещано.

### Что нужно сделать

1. Реализовать публичные функции в [lib/theme/](../../lib/theme/):
   - `lib/theme/usePreset.ts`:
     ```ts
     export function usePreset(preset: Theme) {
       const fv = useFishtVue()
       if (!fv) return
       fv.config.theme = linksTheme(preset)
       reinjectStyles()
     }
     ```
   - `lib/theme/updatePreset.ts` — deepMerge с current theme + reinject.
   - `lib/theme/updatePrimaryPalette.ts` — shortcut на updatePreset.
   - `lib/theme/$dt.ts` — token metadata lookup.
   - `lib/theme/palette.ts` — переэкспортировать существующий helper.
2. Экспортировать в [lib/theme/index.ts](../../lib/theme/index.ts).
3. Реinject styles при theme change — каждый Component.initStyle() должен переинжектиться. Сейчас `setStyle` дедуплицирует, нужен mechanism для invalidation.
4. Тесты для каждой функции.
5. Документировать в [Documentation/architecture/theme.md](../architecture/theme.md).

### Acceptance criteria

- [ ] `import { usePreset, updatePreset, $dt, palette } from "fishtvue/theme"` работает.
- [ ] Runtime `usePreset(SapphireTheme)` — все компоненты перерисуются с новой палитрой.
- [ ] Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) и [Documentation/architecture/theme.md](../architecture/theme.md) согласованы.

## Issue 2: themes/{Aurora,Harmony,Sapphire}.ts coverage 0%

- **Категория:** J46
- **Severity:** high
- **Где:** [theme/themes/](../../lib/theme/themes/), coverage 0%

### Что найдено

Три preset-файла (Aurora, Harmony, Sapphire) имеют coverage 0%. Тесты не загружают их.

### Почему это проблема

- Изменение в preset (опечатка в token-имени) пройдёт без CI-fail.
- При implementation Issue 1 — runtime preset switch требует unit-тестов.

### Что нужно сделать

1. Тест: импортировать каждый theme, проверять структуру (наличие primitive/semantic/component-tokens).
2. После Issue 1 — тест `usePreset(Aurora)` → проверка применения.
3. Visual-regression: рендер 22 компонентов с каждой темой → snapshot.

## Issue 3: `theme/uno.ts` (3 lines) и `theme/semantic.ts` (19 lines) coverage 0%

- **Категория:** J46, K46
- **Severity:** medium

### Что найдено

uno.ts всего 3 строки — re-export. semantic.ts 19 строк — токены.

### Что нужно сделать

Audit: что именно re-exported. Если просто public surface — coverage не критичен (test потребителя покрывает). Если содержит логику — добавить unit-test.

## Issue 4: CSS Layers (`@layer fishtvue`) — реализация частична

- **Категория:** C17 (CSS layers / @layer)
- **Severity:** high
- **Где:** [config/index.ts:135-141](../../lib/config/index.ts#L135-L141), [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md)

### Что найдено

```ts
BaseStylesComponent.initStyle(() =>
  FishtVue.config.optionsTheme?.layers
    ? `@layer ${FishtVue.config.optionsTheme?.layers};
       @layer fishtvue {${baseLayer}}`
    : `@layer fishtvue {${baseLayer}}`
)
```

Только base-style использует `@layer`. Component-уровневые стили (через `Component.setStyle` → `useStyle.ts`) — НЕ обёрнуты в layer. Documentation 2.Theming.md обещает «Управление приоритетом стилей через CSS @layer», но компоненты этим не пользуются.

### Что нужно сделать

1. В [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts) — оборачивать каждый component-style в `@layer fishtvue`:
   ```ts
   const wrappedCss = `@layer fishtvue { ${css} }`
   ```
2. Если `optionsTheme.layers` указан — использовать настраиваемый layer name.
3. Тест: пользовательский CSS вне layer перебивает FishtVue (предсказуемая cascade).

## Issue 5: `darkModeSelector` — partially honored

- **Категория:** B11
- **Severity:** high
- **Где:** [theme/uno.ts](../../lib/theme/uno.ts), various components

### Что найдено

Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает: `optionsTheme.darkModeSelector: "html.dark"` — настраиваемый dark-mode selector. Но Tailwind classes `dark:*` хардкоден на `.dark` (или `[data-theme=dark]` через UnoCSS preset). Component-level dark не реагирует на change `darkModeSelector`.

См. [calendar.md Issue 1](./calendar.md) — Calendar пытается через MutationObserver, но утекает observer.

### Что нужно сделать

1. UnoCSS preset должен генерировать `dark:*` варианты на основе `darkModeSelector` config.
2. Reactive — при смене `darkModeSelector` через `usePreset` — variants регенерируются.
3. Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` — Button рендерится в dark mode.

## Issue 6: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md). Theme — корень проблемы для всех.

## Issue 7: theme/primitive.ts 761 lines — gigantic palette monolith

- **Категория:** K52, A1 (tree-shaking)
- **Severity:** medium

### Что найдено

[theme/primitive.ts](../../lib/theme/primitive.ts) — 761 строка с palette definitions для всех цветов (50-950 × 20+ цветов). Импорт тянет всё.

### Что нужно сделать

1. Разбить на per-color файлы: `lib/theme/primitives/blue.ts`, `red.ts`, etc.
2. Re-export через index.ts с `sideEffects: false` (после fix [button.md Issue 8](./button.md)).
3. Tree-shaker сможет удалить неиспользуемые палитры.

## Issue 8: RTL не учитывается в theme-tokens

- **Категория:** F31

Theme-токены типа `border-left-radius` хардкоден. Должны быть logical (`border-inline-start-radius`).

## Issue 9: prefers-reduced-motion / print

См. cross-cutting.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `optionsTheme.nameTheme` | ✅ | Aurora/Harmony/Sapphire choice |
| `optionsTheme.prefix` | ⚠️ | через UnoCSS preset — проверить |
| `optionsTheme.lightModeSelector` | ⚠️ | проверить применение |
| `optionsTheme.darkModeSelector` | ❌ | Issue 5 |
| `optionsTheme.layers` | ⚠️ | только base-style (Issue 4) |
| `optionsTheme.isNotMinifyCSS` | ⚠️ | проверить применение |
| `usePreset` runtime | ❌ | Issue 1 |
| `updatePreset` runtime | ❌ | Issue 1 |
| `$dt` | ❌ | Issue 1 |
| `palette` | ⚠️ | helper существует, не exported (Issue 1) |

## Dual-API gap

Не применимо.
