---
title: Theme
summary: Token-инфраструктура, primitive/semantic, темы Aurora/Harmony/Sapphire, uno-engine. Runtime theme API (usePreset/updatePreset/updatePrimaryPalette/updateSurfacePalette/$dt) через CSS-variable indirection — Wave 3.3 (2026-07-02). Диалект-контракт uno-engine (§3.1) — v3.4 + v4-расширения (arbitrary properties, space-*, modern transform properties) — волна 2 (2026-07-02).
updated: 2026-07-02
stability: stable
since: 0.2.11
---

# Theme

## 1. Overview

`fishtvue/theme` — пакет токенов и хелперов для генерации CSS. Включает `Theme = { primitive, semantic }`, три встроенные темы (Aurora, Harmony, Sapphire), helpers (`linksTheme`, `useStyle`, `tailwind`, `palette`, `toVarsCss`), и uno-engine — модуль преобразования Tailwind-подобных классов в CSS, который вызывается изнутри `Component.setStyle()`.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/theme/index.ts](../../lib/theme/index.ts), [lib/theme/Theme.d.ts](../../lib/theme/Theme.d.ts), [lib/theme/primitive.ts](../../lib/theme/primitive.ts), [lib/theme/semantic.ts](../../lib/theme/semantic.ts), [lib/theme/uno.ts](../../lib/theme/uno.ts), [lib/theme/themes/](../../lib/theme/themes), [lib/theme/helpers/](../../lib/theme/helpers), [lib/theme/unoStyle/](../../lib/theme/unoStyle).

## 2. How it's organized

```
lib/theme/
├── index.ts               # public re-exports: tailwind, palette, toVarsCss, linksTheme, useStyle, NamesTheme
│                          #   + runtime API: usePreset, updatePreset, updatePrimaryPalette,
│                          #     updateSurfacePalette, $dt (+ internal buildTokensCss/injectTokens)
├── Theme.d.ts             # типы: Theme, NamesTheme enum, ThemePrimitive, ThemeSemantic, DesignToken
├── primitive.ts           # default ThemePrimitive — colors, spacing, opacity, duration, rounded, shadow
├── semantic.ts            # default ThemeSemantic — customThemeColor* (primary/surface — опциональные user-слоты)
├── uno.ts                 # re-export tailwind() из unoStyle/tailwind
├── usePreset.ts           # runtime: полная замена темы + перезапись tokens-тега
├── updatePreset.ts        # runtime: deepMerge поверх текущей темы
├── updatePrimaryPalette.ts# runtime: override брендового слота theme (--fv-theme-*)
├── updateSurfacePalette.ts# runtime: слот surface (--fv-surface-*, light/dark scoping)
├── $dt.ts                 # metadata lookup дизайн-токена по dot-path
├── themes/
│   ├── Aurora.ts          # default theme: primitive + semantic дефолты
│   ├── Harmony.ts
│   └── Sapphire.ts
├── helpers/
│   ├── themeHandler.ts    # linksTheme — резолв ссылок между primitive и semantic
│   ├── useStyle.ts        # инжекция <style> в DOM
│   ├── palette.ts         # генерация color-scale из HEX + '{blue}'-форма (копия primitive-шкалы)
│   ├── tokensCss.ts       # buildTokensCss/injectTokens — :root-блок токенов (FishtVueTokens-тег)
│   └── toVarsCss.ts       # объект → CSS variables
├── unoStyle/
│   ├── tailwind.ts        # главный конвертер: tailwind(class, options) → CSS
│   ├── unoRules.ts        # правила преобразования (цвета — через resolveColor)
│   ├── unoStatic.ts       # списки pseudo-classes, media, selectors
│   ├── helpers.ts         # + resolveColor: эмиссия цвета через rgb(var(--fv-…, fallback))
│   ├── UnoTypes.d.ts
│   ├── Uno.test.ts        # engine-кейсы (вкл. darkModeSelector)
│   ├── Uno.improved.test.ts
│   └── colorVars.test.ts  # спецификация CSS-variable indirection (Wave 3.3)
├── Theme.test.ts
├── themeApi.test.ts       # runtime theme API (usePreset/updatePreset/…/$dt/palette refs)
└── package.json           # exports: index, themes/*, helpers/*, uno
```

Внутренние зависимости — `fishtvue/utils` (`colorsHandler`, `domHandler`, `objectHandler`).
Внешние зависимости — нет (свой uno-engine, не подтягивает Tailwind/UnoCSS).

Bundle: компилируется как часть `dist/theme/...`. Helpers и unoStyle доступны через `fishtvue/theme` и `fishtvue/theme/themes/{Aurora,Harmony,Sapphire}`.

## 3. How it works

**Объект `Theme` = `DeepPartial<{ primitive, semantic }>`**:

- `ThemePrimitive` ([Theme.d.ts:74](../../lib/theme/Theme.d.ts#L74)) = `Margin & Padding & Colors & ColorsConst & Border & Rounded & Shadow & Opacity & Duration` — фундаментальные токены: цветовая palette на 22 имени (theme, emerald, green, lime, red, orange, …), числовые шкалы для margin/padding (0–40), keysOpacity (0–100), duration (0/75/100/.../1000), border (1/2/4/6/8), rounded (Size + none/full).
- `ThemeSemantic` ([Theme.d.ts:75](../../lib/theme/Theme.d.ts#L75)) = `{ primary?: Partial<ThemeColor>, surface?: …, customThemeColor: number | string, customThemeColorContrast: number | string }` — параметры брендового слота (`--theme`, `--theme-contrast` CSS-переменные) + опциональные user-слоты Wave 3.3: `primary` (override брендовой палитры, пишется `updatePrimaryPalette`) и `surface` (пишется `updateSurfacePalette`). Дефолтов у `primary`/`surface` нет.

**Поток инициализации:**

1. На `app.use(FishtVue, options)` ([config/index.ts:93–108](../../lib/config/index.ts#L93-L108)) выбирается тема: `optionsTheme.nameTheme` ∈ {`Aurora`, `Harmony`, `Sapphire`}; default — Aurora.
2. `deepMerge(default, user)` сливает пользовательскую `options.theme` поверх preset'а.
3. `linksTheme(theme)` ([helpers/themeHandler.ts](../../lib/theme/helpers/themeHandler.ts)) проходит по `primitive`/`semantic` и резолвит `{path}`-ссылки.
4. CSS-переменные `--theme`, `--theme-contrast` берутся из `semantic.customThemeColor*` и пишутся в `:root` через `BaseStylesComponent.initStyle(...)` ([config/index.ts:154-167](../../lib/config/index.ts#L154-L167)).
5. **Tokens-тег (Wave 3.3):** `injectTokens(FishtVue)` ([config/index.ts:169-172](../../lib/config/index.ts#L169-L172) → [helpers/tokensCss.ts](../../lib/theme/helpers/tokensCss.ts)) строит из live-темы `:root`-блок дизайн-токенов и инжектит его тегом `style[data-fishtvue-style-id="FishtVueTokens"]` (+ запись в `cssComponents` для SSR): `--fv-{name}-{tone}` — rgb-триплеты статических цветов, `--fv-theme-{tone}` — полные цвета брендового слота, `--fv-surface-{tone}` — слот surface.

**Эмиссия цвета (CSS-variable indirection, Wave 3.3):** именованные цвета палитры движок эмитит не литеральным hex, а `rgb(var(--fv-{name}-{tone}, R G B) / α)` ([unoStyle/helpers.ts `resolveColor`](../../lib/theme/unoStyle/helpers.ts)); слот `theme` — `var(--fv-theme-{tone}, hsla(var(--theme) …))`, alpha для него — `color-mix(in srgb, … α%, transparent)`. Fallback внутри `var()` — запечённое дефолтное значение: компонент, смонтированный без `app.use(FishtVue)`, рендерится как раньше. Благодаря этому runtime theme API (см. §8) перекрашивает все смонтированные компоненты перезаписью ОДНОГО tokens-тега — без regen CSS и без invalidation дедуп-реестров. specialColor (white/black/…) и arbitrary-хексы (`text-[#50d71e]`) эмитятся литерально (не палитровые токены).

**Поток стилизации компонента:**

1. SFC: `Button.setStyle(["text-theme-500", "px-4"])` ([component/index.ts:134–156](../../lib/component/index.ts#L134-L156)).
2. `cn(stylesComp)` сливает классы через `clsx + tailwind-merge`.
3. Для каждого нового класса вызывается `tailwind(class, { selector: ".fv-button", darkSelector })` ([theme/unoStyle/tailwind.ts](../../lib/theme/unoStyle/tailwind.ts)) — генерируется CSS-сниппет.
4. Результат добавляется в `listOfCssComponents` (per-component), затем `useStyle()` инжектит итог в `<head>`.

**SSR / hydration:**

- `useStyle` ([helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts)) проверяет `isClient()` — на сервере не создаёт DOM-узел, но возвращает API-объект.
- Компилированный CSS аккумулируется в `cssComponents: Map<NamesComponents, string>` ([component/index.ts:26](../../lib/component/index.ts#L26)) — доступен из SSR-handler'а для inline-вставки в head.

**Animation / transitions:** `ThemeDuration` ([Theme.d.ts:129](../../lib/theme/Theme.d.ts#L129)) задаёт duration-токены `0/75/100/150/200/300/500/700/1000`, используемые компонентами через `transition-duration` Tailwind-классы.

### 3.1 Диалект Tailwind (контракт покрытия)

`tailwind()` реализует **словарь Tailwind v3.4 + перечисленные v4-расширения**. Это контракт, а не побочный эффект: класс вне диалекта не эмитится вовсе (fail-closed) и в dev сопровождается `console.warn "[FishtVue tailwind] class … was dropped: <reason>"`. Полный аудит покрытия — [issues/uno-engine.md](../issues/uno-engine.md).

**Поддержанные v4/v4.1-расширения (сверх v3.4):**

- arbitrary properties `[prop:value]` / `[--var:value]` (value с `{`/`}`/`;` дропается — инъекция за пределы декларации невозможна);
- `space-x/y-*` (+negative/reverse/arbitrary), `antialiased`/`subpixel-antialiased`;
- варианты: boolean `data-<name>:`, именованные `has-<state>:`/`group-has-<state>:`/`peer-has-<state>:` (по pseudo-словарям), `optional:`, `user-valid:`/`user-invalid:`, `inert:`, `details-content:`, media `pointer-*`/`any-pointer-*`/`inverted-colors:`/`noscript:`;
- v4-имена шкал: `shadow-2xs`/`shadow-xs`, `drop-shadow-xs`, `outline-hidden`, `blur-2xs`/`blur-xs`, `rounded-4xl`, двухсловные позиции (`bg-top-left`, `object-top-left`), `items-baseline-last`, viewport-юниты в `min-h`/`max-h`, container scale в `basis-`/`min-w-`;
- **transforms — modern CSS properties** (v4-подход, с 2026-07-02): `translate-*`/`rotate-*`/`scale-*` эмитят независимые свойства `translate:`/`rotate:`/`scale:`; только `skew-*` живёт в `transform:`; `transition`/`transition-transform` покрывают `transform, translate, scale, rotate`. Комбинации вида `-translate-y-1/2 rotate-45` компонуются без двойного сдвига.

**Общие имена — v3-семантика** (класс из v4-доки может дать другое значение):

| Класс                           | Диалект FishtVue (v3)                 | Tailwind v4                                     |
| ------------------------------- | ------------------------------------- | ------------------------------------------------ |
| `shadow-sm` / `shadow`          | old sm / old base                     | сдвиг шкалы (v4 `shadow-sm` = old base)         |
| `blur-sm` / `blur`              | 4px / 8px                             | v4 `blur-sm` = 8px                              |
| `rounded-sm` / `rounded`        | 0.125rem / 0.25rem                    | v4 `rounded-sm` = 0.25rem                       |
| `outline-none`                  | `outline: 2px solid transparent`      | v4: `outline-style: none` (наш аналог невидимого — `outline-hidden`) |
| `ring`                          | 3px                                   | v4 default 1px                                  |
| `text-(--x)` / `bg-(--x)`       | font-size / background-position       | v4: color                                       |

**Вне диалекта** (fail-closed + dev-warn): `mask-*`, `perspective-*`, 3D transforms (`rotate-x-*`, `translate-z-*`), v4 gradient API (`bg-linear-*`), `text-shadow-*`, `inset-shadow/ring-*`, container queries (`@container`, `@sm:`), `not-*:`, `nth-*:`, `starting:`, important-модификатор, именованный `supports-<feature>:`, композиции `group-aria/data-*:`, `**:`. Актуальный список — [issues/uno-engine.md Issues 2, 4](../issues/uno-engine.md).

## 4. Quick Start

```ts
import FishtVue from "fishtvue/config"
import Sapphire from "fishtvue/theme/themes/Sapphire"

app.use(FishtVue, {
  optionsTheme: { nameTheme: "Sapphire" },
  theme: Sapphire
})
```

Через имя темы достаточно одного поля:

```ts
app.use(FishtVue, {
  optionsTheme: { nameTheme: "Sapphire" }
})
```

Plugin сам подгрузит preset.

## 5. Props

Не применимо — это набор токенов и helpers. Параметры `Theme`:

| Field       | Type                      | Default         | Description                                 |
| ----------- | ------------------------- | --------------- | ------------------------------------------- |
| `primitive` | `Partial<ThemePrimitive>` | preset (Aurora) | Базовые токены.                             |
| `semantic`  | `Partial<ThemeSemantic>`  | preset (Aurora) | Семантические алиасы и custom color params. |

`OptionsTheme` (через `FishtVueConfiguration.optionsTheme`) — см. [Config §5](./config.md#5-props).

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

Публичный API из `fishtvue/theme`:

| Name                         | Type                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `linksTheme<T>(theme)`       | `(theme?: Theme) => T \| undefined`                                 | Резолвит ссылки в `semantic` на ключи `primitive`. Вызывается plugin'ом.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tailwind(class, options?)`  | `(class: string, options?: { selector?, darkSelector? }) => string` | Конвертирует один Tailwind-подобный класс в CSS-сниппет. **Fail-closed** (2026-07-02): нераспознанный variant-префикс, «чужое» семейство (`mask-*`/`perspective-*`) или пустое/`undefined`-значение → `undefined` + dev-only `console.warn` `[FishtVue tailwind] class "…" was dropped` (гейт `NODE_ENV !== "production"`, дедуп по классу). Невалидный CSS в `<style>`-теги не попадает; контракт — [unoStyle/failClosed.test.ts](../../lib/theme/unoStyle/failClosed.test.ts), [issues/uno-engine.md](../issues/uno-engine.md) Issue 1/3. Границы диалекта (v3.4 + v4-расширения, вкл. arbitrary properties и modern transforms) — §3.1. |
| `palette(color)`             | `(color: HEX) => ThemeColor`                                        | Из одного HEX генерирует scale 50…950; `palette("{blue}")` — копия готовой primitive-шкалы (Wave 3.3).                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `toVarsCss<T>(obj, prefix?)` | `(obj, prefix?) => string`                                          | Сериализует объект в `--{prefix}-{key}: {value};` лист.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `useStyle(css, options?)`    | `(css: string, options?: StyleOptions) => Style`                    | Инжектит `<style>` в `document.head` (clientside). Возвращает `{ id, name, el, css, unload, load, isLoaded }`.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `NamesTheme`                 | `(keyof typeof NamesTheme)[]`                                       | Массив поддерживаемых имён тем: `["Aurora", "Harmony", "Sapphire"]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Runtime theme API (Wave 3.3 — [usePreset.ts](../../lib/theme/usePreset.ts), [updatePreset.ts](../../lib/theme/updatePreset.ts), [updatePrimaryPalette.ts](../../lib/theme/updatePrimaryPalette.ts), [updateSurfacePalette.ts](../../lib/theme/updateSurfacePalette.ts), [$dt.ts](../../lib/theme/$dt.ts)). Все функции мутируют live `config.theme` (inject-first, `window.FishtVue`-fallback вне setup) и переписывают tokens-тег; без установленного plugin'а — no-op с возвратом `undefined`:

| Name                          | Type                                                                      | Description                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `usePreset(preset)`           | `(preset: Theme) => Theme \| undefined`                                   | Полная замена темы (`linksTheme(preset)`). Не заданные пресетом цвета возвращаются к запечённым fallback'ам движка.                                                                  |
| `updatePreset(partial)`       | `(partialPreset: Theme) => Theme \| undefined`                            | `deepMerge` частичной темы поверх копии текущей + `linksTheme`.                                                                                                                      |
| `updatePrimaryPalette(input)` | `(input: string \| Partial<ThemeColor>) => Theme \| undefined`            | Брендовый слот = цвет `theme`: пишет `semantic.primary` и `--fv-theme-{tone}`-override'ы. Вход: палитра (hex/`'{indigo.500}'`-refs), `'{indigo}'` или одиночный hex (→ `palette()`). |
| `updateSurfacePalette(input)` | `(input: Partial<ThemeColor> \| { light?, dark? }) => Theme \| undefined` | Пишет `semantic.surface` и `--fv-surface-{tone}`; dark-подмножество скоупится на `darkModeSelector`/`prefers-color-scheme`. Потребление компонентами — Wave 9.                       |
| `$dt(path)`                   | `(path: string) => DesignToken \| undefined`                              | Метаданные токена по dot-path: `{ name?, variable?, value }`; `name`/`variable` — только у путей, представленных CSS-переменной.                                                     |

`StyleOptions` ([Theme.d.ts:220–233](../../lib/theme/Theme.d.ts#L220-L233)): `document`, `immediate`, `manual`, `name`, `id`, `media`, `nonce`, `props`, `first`, `onMounted`, `onUpdated`, `onLoad`.

## 9. Examples

### 9.1 Кастомная тема через override

```ts
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"
import Aurora from "fishtvue/theme/themes/Aurora"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Aurora" },
  theme: {
    ...Aurora,
    semantic: {
      ...Aurora.semantic,
      customThemeColor: "180deg",
      customThemeColorContrast: "70%"
    }
  }
}

app.use<FishtVueConfiguration>(FishtVue, config)
```

### 9.2 Programmatic palette

```ts
import { palette } from "fishtvue/theme"

const scale = palette("#3b82f6")
// scale = { 50: "...", 100: "...", ..., 950: "..." }
```

### 9.3 toVarsCss

```ts
import { toVarsCss } from "fishtvue/theme"

const css = toVarsCss({ primary: "#000", radius: "8px" }, "fv")
// "--fv-primary: #000; --fv-radius: 8px;"
```

### 9.4 useStyle вне компонента

```ts
import { useStyle } from "fishtvue/theme"

const { unload } = useStyle(":root { --custom: red; }", { name: "my-overrides" })
// позже:
unload()
```

## 10. Configuration & Customization

### 10.1 Global

Через `FishtVueConfiguration.theme` и `optionsTheme.nameTheme`. См. [Config §5](./config.md#5-props).

### 10.2 Per-instance

Не применимо — `Theme` един на приложение.

### 10.2.1 Runtime theme switch (Wave 3.3)

```ts
import { usePreset, updatePreset, updatePrimaryPalette } from "fishtvue/theme"
import Sapphire from "fishtvue/theme/themes/Sapphire"

usePreset(Sapphire) // полная замена — все смонтированные компоненты перекрашиваются
updatePreset({ semantic: { customThemeColor: 200, customThemeColorContrast: "70%" } }) // hue брендового слота
updatePrimaryPalette("#6366f1") // брендовая палитра из одного hex (11 тонов через palette())
```

Механика: перезаписывается один `:root`-блок токенов (тег `FishtVueTokens`), на который ссылается весь сгенерированный CSS — regen правил не происходит. SSR-safe: движок остаётся process-wide singleton'ом без чтения live config; per-app темы разводятся содержимым tokens-тега.

### 10.3 Theming

- **Имена цветов** ([Theme.d.ts:163–186](../../lib/theme/Theme.d.ts#L163-L186)): `theme | emerald | green | lime | red | orange | amber | yellow | teal | cyan | sky | blue | indigo | violet | purple | fuchsia | pink | rose | slate | gray | zinc | neutral | stone`. Шкала каждого цвета — 11 ступеней (50…950).
- **`theme` colorslot** — динамический, через CSS-переменные `--theme` (hue) и `--theme-contrast` (saturation). Переопределяется через `semantic.customThemeColor` и `semantic.customThemeColorContrast`.
- **Размеры** (`ThemeRounded`, `ThemeShadow`): `Size` (xs/sm/md/lg/xl) + `none/full` или `inner/none`.
- **Dark mode** — через `optionsTheme.darkModeSelector` (например, `".dark"`, `"html.dark"` или `"[data-theme='dark']"`). Все uno-классы с `dark:` префиксом генерируются на этот селектор: `Component.setStyle` прокидывает его как `darkSelector` ([component/index.ts:150](../../lib/component/index.ts#L150)) → `tailwind()` подставляет вместо дефолтного `@media (prefers-color-scheme: dark)` ([unoStyle/tailwind.ts:187](../../lib/theme/unoStyle/tailwind.ts#L187)). Без config (`darkModeSelector` не задан) `dark:*` остаётся OS-pref media-query. Контракт зафиксирован тестами: [lib/theme/darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) + [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts). **`lightModeSelector`** пока НЕ транслируется (light — дефолт, dark — override).

### 10.4 CSS layer override

Базовый layer `@layer fishtvue { ... }` инжектится при install; **каждый component-стиль** (через `Component.__stylesBase`) тоже оборачивается в `@layer fishtvue` по умолчанию — Issue 4 ✅ 2026-06-21, поэтому unlayered consumer-CSS предсказуемо перебивает FishtVue. Дополнительные layers задаются через `optionsTheme.layers` — см. [Config §10.4](./config.md#104-css-layer-override) и [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override).

Для override токена цвета `theme`:

```css
:root {
  --theme: 220deg;
  --theme-contrast: 50%;
}
```

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

Тема влияет на контраст. Кастомные `customThemeColor`/`customThemeColorContrast` — сверяй с WCAG 2.1 AA (contrast ratio ≥ 4.5:1 для текста). Встроенные темы Aurora/Harmony/Sapphire рассчитаны на разумный контраст по умолчанию, но для production-проекта проверь свои overrides.

### Security

- `useStyle` создаёт inline `<style>` — требует CSP `style-src 'unsafe-inline'` или nonce. `StyleOptions.nonce` ([Theme.d.ts:227](../../lib/theme/Theme.d.ts#L227)) поддерживается, но `Component.__setStyle()` его не пробрасывает — см. [Component class §18](./component-class.md#18-known-issues--limitations).
- `palette()` — чисто вычислительная функция, без внешних обращений.
- Uno-engine генерирует CSS из строк — не использует `eval`. Безопасен.

## 13. TypeScript

```ts
import type { Theme, NamesTheme } from "fishtvue/theme"
import { tailwind, palette, useStyle } from "fishtvue/theme"

const css: string = tailwind("text-blue-500", { selector: ".my-component" })
const scale = palette("#3b82f6")
const { unload } = useStyle(":root { --foo: bar }")
```

`NamesTheme` — enum: `Aurora`, `Harmony`, `Sapphire` (значения 0/1/2). Для строковой проверки использовать `Object.values(NamesTheme).includes(name)`.

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Browser:** evergreen. CSS `@layer` поддерживается во всех современных браузерах (Chrome 99+, Firefox 97+, Safari 15.4+).
- **Stability flag:** `stable`.
- **Breaking changes:** `NamesTheme` enum может расширяться (закомментированы Larimar, Nimbus, Celestia, Velvet, Serenity, Eclipse, Iris в [Theme.d.ts:6–14](../../lib/theme/Theme.d.ts#L6-L14)) — но добавление имён не breaking.
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

`Theme.test.ts` — 21 кейс на helpers (`linksTheme`, `palette`, `toVarsCss`, `useStyle`). Блок `describe("useStyle")` делает `vi.unmock("fishtvue/theme")` (глобальный setup мокает `useStyle` в no-op) и проверяет реальную инжекцию: атрибуты, media, `unload`, replace-on-load и HMR-дедуп (повторная инжекция с одним `name` → один `<style>`, см. [Issues — Component class Issue 3](../issues/component-class.md)).
`unoStyle/Uno.test.ts` — 1587 кейсов (4 skipped) на uno-engine.
`unoStyle/Uno.improved.test.ts` — 1584 кейсa.
`unoStyle/failClosed.test.ts` — 92 кейса на fail-closed контракт (uno-engine.md Issues 1/3: три режима silent degradation, негативные transforms, дозаполненные шкалы + байт-в-байт regression по baseline движка до фикса).

`unoStyle/v4Extensions.test.ts` — 65 кейсов на расширения диалекта волны 2 (uno-engine.md Issues 2/4/5/6): arbitrary properties, space-*, font smoothing, v4-варианты словарей, v4-имена шкал, modern transform properties (+regression общих имён).

Запуск: `pnpm test` или прицельно `pnpm test -- theme`.

```ts
import { describe, expect, it } from "vitest"
import { palette, tailwind } from "fishtvue/theme"

describe("Theme helpers", () => {
  it("palette returns 11-step scale", () => {
    const scale = palette("#3b82f6")
    expect(Object.keys(scale)).toEqual(["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"])
  })

  it("tailwind generates CSS", () => {
    const css = tailwind("text-blue-500", { selector: ".x" })
    expect(css).toContain(".x")
  })
})
```

## 16. Troubleshooting / FAQ

| Проблема                                                          | Причина                                                             | Решение                                                                                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--theme` всегда `0deg`                                           | Не передан `semantic.customThemeColor`.                             | Установить число градусов или строку (`"180deg"`).                                                                                                 |
| Цвета `theme-50` … `theme-950` не реагируют на `customThemeColor` | Используется не CSS-переменная, а статический HEX в primitive.      | Цвета `theme.*` в primitive используют `var(--theme)` — проверь, не переопределил ли пользовательский `theme.primitive.colors.theme` HEX-палитрой. |
| `darkModeSelector` не применяет dark-классы                       | Селектор не совпадает с DOM (`html.dark` vs `[data-theme="dark"]`). | Согласуй селектор.                                                                                                                                 |
| `palette("#zzz")` падает                                          | Невалидный HEX.                                                     | Передавай `"#rrggbb"` (6 hex digits).                                                                                                              |
| Layer overrides не работают                                       | Стили вне `@layer` побеждают, см. CSS Cascade-4.                    | Используй дополнительный layer после `fishtvue`: `optionsTheme.layers = "fishtvue, app"`.                                                          |

## 17. Related

- [architecture/component-class.md](./component-class.md) — как `Component.setStyle()` использует `tailwind()` и `useStyle`.
- [architecture/config.md](./config.md) — `OptionsTheme` поля.
- [architecture/locale.md](./locale.md) — локали отделены от темы.
- [02-installation.md §3](../02-installation.md#3-how-it-works) — Tailwind на стороне приложения.
- [dev-patterns.md §4](../dev-patterns.md#4-sfc-pattern) — как компоненты применяют стили.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

В [Theme.d.ts:6–14](../../lib/theme/Theme.d.ts#L6-L14) закомментированы 7 будущих имён тем (Larimar, Nimbus, Celestia, Velvet, Serenity, Eclipse, Iris) — стабильный roadmap-маркер.

### Incomplete or stubbed behavior

- `theme.primitive.colors.theme` ([primitive.ts:4–16](../../lib/theme/primitive.ts#L4-L16)) — единственный цвет, использующий `var(--theme)`. Остальные 21 имя цвета — статические HEX. Если консумер хочет иметь второй динамический цвет (например, secondary), приходится дублировать механизм самостоятельно.
- `unoStyle/test-helpers-advanced.ts` ([unoStyle/test-helpers-advanced.ts](../../lib/theme/unoStyle/test-helpers-advanced.ts)) — coverage 0% (не подключён в тестах).
- `lib/theme/themes/{Aurora,Harmony,Sapphire}.ts` — coverage 0%, тестируется косвенно через config.
- `optionsTheme.lightModeSelector` ([OptionsTheme](../../lib/config/FishtVue.d.ts#L179)) — типизирован, но НЕ транслируется в движок (в отличие от `darkModeSelector`). Light — дефолтное состояние, dark — override через `darkModeSelector`; отдельный `light:`-вариант не реализован.
- Runtime-смена `darkModeSelector` НЕ регенерирует уже сгенерированные `dark:*` — дедуп `listOfStyledComponents` не инвалидируется. Палитры это больше не касается (Wave 3.3: цвета идут через `var(--fv-…)` и перекрашиваются перезаписью tokens-тега), ограничение осталось только для самого dark-СЕЛЕКТОРА — задавайте `darkModeSelector` на install.
- `updateSurfacePalette` пишет `semantic.surface` и эмитит `--fv-surface-{tone}`, но компоненты пока НЕ потребляют surface-токены (структурные нейтрали `gray-*`/`neutral-*` захардкожены) — миграция на них: Wave 9.

### Skipped tests

- `Uno.test.ts` — 4 skipped.
- `Uno.improved.test.ts` — 0 skipped.

### API inconsistencies

- `tailwind()` экспортируется из двух модулей — `fishtvue/theme` и `fishtvue/theme/uno`, что избыточно.
- `NamesTheme` объявлен в `Theme.d.ts` как enum, в `index.ts` собирается как массив строк — сорсы не идеально согласованы.

### Behavioral caveats

- **Wave 3.3 — поведенческие изменения (2026-07-02):**
  - Alpha для слота `theme` теперь применяется (`ring-theme-600/20` реально полупрозрачен через `color-mix`); раньше `addAlphaToHex` молча игнорировал alpha для hsl-строк (ранний return), и `ring-theme-*/N`-классы (Select chips, Badge) рендерились непрозрачными. Контракт — [unoStyle/colorVars.test.ts](../../lib/theme/unoStyle/colorVars.test.ts).
  - `semantic.primary` больше не имеет дефолта (тип — optional): слот стал user-override'ом брендовой палитры для `updatePrimaryPalette`. Прежние дефолтные формулы никем не потреблялись и после `linksTheme` давали статические `hsl(0 0 …)`-строки.
  - Градиентный transparent-хвост для theme-слота (`from-theme-500`) починен: раньше эмитился битый `hsla(…)00`, теперь `color-mix(… 0%, transparent)`.
- `useStyle` без `manual: true` инжектит сразу. Для отложенной инжекции — `manual: true` + ручной `load()`.
- `useStyle` дедуплицирует `<style>` по `data-fishtvue-style-id` (= `name`): `load()` переиспользует существующий тег вместо append нового ([useStyle.ts:43-45](../../lib/theme/helpers/useStyle.ts#L43-L45)) — поэтому при HMR-re-mount компонента дубли не копятся. Caveat: каждый вызов `useStyle()` создаёт новый незакрытый `watch` (minor dev-only leak; элемент при этом один). Подробнее — [Component class §18](./component-class.md#18-known-issues--limitations).
- `palette` использует HSL-конверсию — результат может отличаться от visual-tools (Coolors, Tailwind palette generator) на 2–3% по светлоте.
- `tailwind-merge` дополнительно нормализует классы перед передачей в `tailwind()` — нестандартные пользовательские классы могут быть отфильтрованы.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
