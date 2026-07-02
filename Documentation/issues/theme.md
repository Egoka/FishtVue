---
title: Issues — Theme system
summary: Аудит theme — coverage themes/ и uno.ts 0%, нет публичного API usePreset/updatePreset/$dt/palette (заявлены в публичной доке но не экспортируются), no documented runtime theme switch path.
updated: 2026-06-21
audit-checklist: 60-point + Configuration support
source: lib/theme/
related-doc: ../architecture/theme.md
---

# Issues — Theme

## Сводка

| Severity | Count | Categories                                                                                |
| -------- | ----- | ----------------------------------------------------------------------------------------- |
| critical | 0     | —                                                                                         |
| high     | 4     | A2, A4-5, J46 (themes 0% coverage), L53 (no usePreset/updatePreset API)                    |
| medium   | 4     | D21, F31, B10, K46 (uno.ts 0%)                                                            |
| low      | 2     | E29, N59                                                                                  |

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

## ~~Issue 4: CSS Layers (`@layer fishtvue`) — реализация частична~~ ✅ resolved 2026-06-21

- **Категория:** C17 (CSS layers / @layer)
- **Severity:** ~~high~~
- **Где:** [component/index.ts:159-169](../../lib/component/index.ts#L159-L169) (`__stylesBase`), [config/index.ts:160-167](../../lib/config/index.ts#L160-L167) (base-style)

> **Status (2026-06-21): ✅ resolved (Wave 2).** Component-стили теперь оборачиваются в `@layer fishtvue` по умолчанию. Фикс — в `Component.__stylesBase` else-ветке ([component/index.ts:159-169](../../lib/component/index.ts#L159-L169)), **НЕ** в `useStyle.ts` (как предполагал исходный аудит ниже): `useStyle` — generic injection-helper, и обёртка там дала бы двойной wrap base-style и прямых вызовов (`Theme.test.ts`). `__stylesBase` — единственная точка, где (a) уже была conditional-обёртка для `optionsTheme.layers`, (b) base-style не задет (передаёт собственный `stylesComp`). Канон [dev-patterns.md §3](../dev-patterns.md). Контракт: [Component.test.ts](../../lib/component/Component.test.ts) `default __stylesBase wraps component CSS in @layer fishtvue`.

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

### Что сделано (2026-06-21)

1. [component/index.ts:159-169](../../lib/component/index.ts#L159-L169) — else-ветка `__stylesBase` (когда `optionsTheme.layers` не задан) теперь оборачивает css в `@layer fishtvue {${css}}`, зеркаля base-style ([config/index.ts:166](../../lib/config/index.ts#L166)). Раньше возвращала сырой css вне слоя → все 22 component-стиля были вне cascade-layer (base-style — внутри, рассинхрон).
2. `optionsTheme.layers` (truthy-ветка) — без изменений: `@layer ${layers}; @layer fishtvue {${css}}` (order-декларация + слой).
3. Тест: [Component.test.ts](../../lib/component/Component.test.ts) `default __stylesBase wraps component CSS in @layer fishtvue (Wave 2 — theme Issue 4)` — дефолтный component-стиль содержит `@layer fishtvue` + зарегистрированное правило внутри слоя. Консумерский CSS вне layer теперь предсказуемо перебивает FishtVue (cascade-4).

## ~~Issue 5: `darkModeSelector` — partially honored~~ ✅ resolved 2026-06-12

- **Категория:** B11
- **Severity:** high
- **Где:** [theme/unoStyle/tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95), [component/index.ts:150](../../lib/component/index.ts#L150)

> **Status (2026-06-12): ✅ resolved.** Движок **уже** транслировал `darkModeSelector` — фикс приземлился ещё в `d120e4e` (Jan 2025), но не был ни покрыт тестом, ни сверен с аудитом (этот файл утверждал ❌, тогда как [architecture/theme.md](../architecture/theme.md) описывал фичу как работающую — внутреннее противоречие). Контракт теперь зафиксирован тестами; правок движка не потребовалось.

### Что найдено (исходный аудит)

Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает: `optionsTheme.darkModeSelector: "html.dark"` — настраиваемый dark-mode selector. Аудит считал, что `dark:*` хардкоден на media-query и не реагирует на config.

**По факту:** `Component.setStyle` прокидывает `darkSelector: this.__globalOptionsTheme?.darkModeSelector ?? ""` ([component/index.ts:150](../../lib/component/index.ts#L150)), а движок `tailwind()` подменяет дефолтный `@media (prefers-color-scheme: dark)` ([unoStatic.ts:561](../../lib/theme/unoStyle/unoStatic.ts#L561)) на этот селектор, когда он непустой ([tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95)). Это в точности канон [dev-patterns.md](../dev-patterns.md) («движок `tailwind()` уже знает media/variant-фичи; не патчим theme-движок»).

### Что сделано

1. ~~UnoCSS preset должен генерировать `dark:*` варианты на основе `darkModeSelector` config.~~ ✅ уже реализовано (`tailwind.ts:95` + `setStyle:150`), теперь покрыто тестом.
2. **Reactive** — при смене `darkModeSelector` в рантайме через `usePreset` варианты НЕ регенерируются (дедуп `listOfStyledComponents` не инвалидируется). Это часть **Issue 1** (runtime theme switch / invalidation, выше в этом файле), не B11. Остаётся открытым там.
3. ~~Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` — компонент рендерится в dark mode.~~ ✅ [lib/theme/darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) (probe-компонент через plugin-config) + engine-кейсы в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts) (`describe("Dark mode selector …")`).

> **Примечание:** `lightModeSelector` (типизирован в [OptionsTheme](../../lib/config/FishtVue.d.ts#L179)) пока НЕ транслируется — light это дефолт, dark — override; отдельная фича, вне B11.

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

| Настройка                        | Поддержано? | Комментарий                                                                 |
| -------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `optionsTheme.nameTheme`         | ✅          | Aurora/Harmony/Sapphire choice                                              |
| `optionsTheme.prefix`            | ⚠️          | через UnoCSS preset — проверить                                             |
| `optionsTheme.lightModeSelector` | ❌          | типизирован, но НЕ транслируется в движок (light — дефолт; не входит в B11) |
| `optionsTheme.darkModeSelector`  | ✅          | Issue 5 — `setStyle:150` → `tailwind.ts:95`, test-locked                    |
| `optionsTheme.layers`            | ✅          | base + component styles (Issue 4 ✅ 2026-06-21)                                                 |
| `optionsTheme.isNotMinifyCSS`    | ⚠️          | проверить применение                                                        |
| `usePreset` runtime              | ❌          | Issue 1                                                                     |
| `updatePreset` runtime           | ❌          | Issue 1                                                                     |
| `$dt`                            | ❌          | Issue 1                                                                     |
| `palette`                        | ⚠️          | helper существует, не exported (Issue 1)                                    |

## Dual-API gap

Не применимо.
