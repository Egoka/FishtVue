---
title: Config (FishtVue plugin)
summary: Vue plugin, FishtVueConfiguration, useFishtVue, getOptions, setActiveLocale, extensibility API (use/registerComponent/extendTheme). Install инжектит tokens-тег FishtVueTokens для runtime theme API (Wave 3.3).
updated: 2026-07-02
stability: stable
since: 0.2.11
---

# Config (FishtVue plugin)

## 1. Overview

`fishtvue/config` — Vue plugin (`ObjectPlugin`). Через `app.use(FishtVue, options)` устанавливается активный `FishtVue` instance: единый reactive-контейнер с темой, локалью и опциями всех 22 компонентов. Этот же модуль экспортирует глобальные функции `useFishtVue`, `getOptions`, `setActiveLocale`, `getActiveLocale`, `getDefaultLocale` и symbol `FishtVueSymbol`.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/config/index.ts](../../lib/config/index.ts), [lib/config/FishtVue.d.ts](../../lib/config/FishtVue.d.ts), [lib/config/baseStyle.ts](../../lib/config/baseStyle.ts), [lib/config/FishtVue.test.ts](../../lib/config/FishtVue.test.ts).

## 2. How it's organized

```
lib/config/
├── index.ts          # plugin install + 5 глобальных функций
├── FishtVue.d.ts     # FishtVue, FishtVueConfiguration, OptionsTheme, ComponentsOptions
├── baseStyle.ts      # default base CSS-snippet для @layer fishtvue
├── FishtVue.test.ts  # 16 кейсов (Vitest)
└── package.json
```

Внутренние зависимости:

- [theme.linksTheme](../../lib/theme/helpers/themeHandler.ts), `NamesTheme` — резолв темы.
- [theme/themes/{Aurora,Harmony,Sapphire}.ts](../../lib/theme/themes) — встроенные темы.
- [locale](../../lib/locale/index.ts) — встроенные сообщения.
- [component](../../lib/component/index.ts) — служебный экземпляр `Component("BaseComponent")` для инжекции `@layer fishtvue`.
- [utils/objectHandler](../../lib/utils/objectHandler.ts) — `deepCopyObject`, `deepFreeze`, `deepMerge`.
- [utils/domHandler.isClient](../../lib/utils/domHandler.ts) — SSR guard для `window.FishtVue`.

Внешние зависимости — только `vue` (`reactive`, `inject`, `hasInjectionContext`, `ObjectPlugin`).

## 3. How it works

`install(app, options)` ([config/index.ts:125–166](../../lib/config/index.ts#L125-L166)):

1. **Middleware queue** — последовательно прогоняются все `FishtVue.use((cfg) => ...)`-зарегистрированные функции; каждая может мутировать `cfg` in-place или вернуть новый объект (см. §10.5).
2. `getDefaultOptions(options?.optionsTheme?.nameTheme)` — выбирает встроенную тему по имени или custom-зарегистрированную через `extendTheme`; default — `Aurora`.
3. `deepMerge(defaultOptions, options)` — мерж пользовательских опций поверх дефолтов. Реактивизуется через `reactive(...)`.
4. `linksTheme(FishtVue.config.theme)` — резолв ссылок между primitive- и semantic-уровнями темы.
5. `FishtVue.config.locale.activeLocale ??= defaultLocale` — авто-выставление активной локали.
6. На клиенте: `(window as any).FishtVue = FishtVue`. На сервере шаг пропускается.
7. `app.provide(FishtVueSymbol, FishtVue)` + `app.config.globalProperties.$fishtVue = FishtVue`. `FishtVueSymbol` — **стабильный `const InjectionKey<FishtVue>`** ([config/index.ts:18](../../lib/config/index.ts#L18)); никогда не пере-присваивается. Multi-app safe: `createApp().use(FishtVue, A)` × 2 с разными configs дают изолированные инстансы (каждый app имеет свой `provide`).
8. **Custom components** — все компоненты, зарегистрированные через `FishtVue.registerComponent(name, ctor)`, регистрируются на app через `app.component(name, ctor)`.
9. Создаётся `BaseStylesComponent = new Component("BaseComponent" as any)`, через `initStyle(...)` инжектится базовый layer:

```css
:root {
  --theme: <hue>;
  --theme-contrast: <saturation>;
}
{ baseStyle.ts content }
```

обёрнутый в `@layer fishtvue { ... }` и опционально с `@layer <user-layers>;` если задан `optionsTheme.layers`.

10. **Tokens-тег (Wave 3.3):** `injectTokens(FishtVue)` ([config/index.ts:169-172](../../lib/config/index.ts#L169-L172)) инжектит `:root`-блок дизайн-токенов live-темы (`--fv-{color}-{tone}` rgb-триплеты, `--fv-theme-*`, `--fv-surface-*`) тегом `style[data-fishtvue-style-id="FishtVueTokens"]` + пишет строку в `cssComponents` (SSR). Runtime theme API (`usePreset`/`updatePreset`/…, см. [Theme §8](./theme.md#8-exposed-methods)) переписывает этот же тег.

**SSR / hydration:**

- `isClient()` ([config/index.ts:73, 125](../../lib/config/index.ts#L73)) — guard для `window.FishtVue`.
- `provide` через `app.provide` доступен и на сервере.
- `BaseStylesComponent.initStyle` сработает через `onServerPrefetch` (см. [Component class §3](./component-class.md#3-how-it-works)) — CSS попадёт в SSR-pipeline.

**Animation:** не применимо.

## 4. Quick Start

```ts
// main.ts (Vite)
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

createApp(App).use(FishtVue, {}).mount("#app")
```

С опциями:

```ts
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Sapphire", darkModeSelector: ".dark" },
  componentsOptions: {
    Button: { mode: "primary", color: "theme" }
  }
}
app.use<FishtVueConfiguration>(FishtVue, config)
```

## 5. Props

Не применимо — это plugin, не компонент. Параметры `install`:

| Param | Type | Default | Description |
|---|---|---|---|
| `options` | `FishtVueConfiguration` | `{}` | Конфигурация — мержится с defaults через `deepMerge`. |

Поля `FishtVueConfiguration` ([FishtVue.d.ts:126–139](../../lib/config/FishtVue.d.ts#L126-L139)):

| Field | Type | Default | Description |
|---|---|---|---|
| `componentsStyle` | `"filled" \| "outlined" \| "underlined"` | — | Глобальный визуальный режим для form-controls. |
| `unstyled` | `boolean` | `false` | Отключает инжекцию `@layer fishtvue`. |
| `locale` | `Locales` | `{ defaultLocale: "en", messages: { en, ru } }` | См. [Locale](./locale.md). |
| `theme` | `Theme` | Aurora | См. [Theme](./theme.md). |
| `optionsTheme` | `Partial<OptionsTheme>` | `{}` | Theme-meta — см. ниже. |
| `componentsOptions` | `Partial<ComponentsOptions>` | — | Per-component опции. |

`OptionsTheme` ([FishtVue.d.ts:145–158](../../lib/config/FishtVue.d.ts#L145-L158)):

| Field | Type | Default | Description |
|---|---|---|---|
| `nameTheme` | `"Aurora" \| "Harmony" \| "Sapphire"` | `"Aurora"` | Встроенная тема. Если не из перечня — fallback на `Aurora`. |
| `prefix` | `string` | `"fishtvue"` | Префикс CSS-класса (`fv {prefix}-{kebab-name}`). |
| `lightModeSelector` | `string` | — | CSS selector для light mode. |
| `darkModeSelector` | `string` | — | CSS selector для dark mode (например, `".dark"`, `'[data-theme="dark"]'`). |
| `layers` | `string \| "fishtvue"` | — | Список дополнительных `@layer` через запятую. Применяется ДО `@layer fishtvue` — поздние layers побеждают. |
| `isNotMinifyCSS` | `boolean` | `false` | Отключает `minifyCSS` для удобства отладки. |

`ComponentsOptions` ([FishtVue.d.ts:166–189](../../lib/config/FishtVue.d.ts#L166-L189)) — `Partial<{ Form, Input, Aria, Switch, Select, Calendar, TextEditor, Label, InputLayout, Button, Icons, Loading, FixWindow, Dialog, Badge, Accordion, Alert, Separator, Menu, Pagination, Split, Table }>`. Тип каждого ключа — `XOption`, экспортируемый из соответствующего компонента (`fishtvue/{name}`).

## 6. Events / Emits + v-model contract

Не применимо — plugin не эмитит.

## 7. Slots

Не применимо.

## 8. Exposed methods

Глобальные функции из `fishtvue/config`:

| Name | Type | Description |
|---|---|---|
| `default export` | `ObjectPlugin` | Сам plugin. Используется в `app.use(FishtVue, options)`. |
| `useFishtVue<T>()` | `() => Readonly<T> \| undefined` | Frozen-копия активного `FishtVue` instance. Возвращает `undefined`, если plugin не установлен. |
| `getOptions<T>(component?)` | См. [FishtVue.d.ts:84–86](../../lib/config/FishtVue.d.ts#L84-L86) | Frozen-копия конкретной секции `componentsOptions` или всех опций. |
| `setActiveLocale(name)` | `(name: NameLocale) => string \| boolean \| undefined` | Меняет `locale.activeLocale`. Возвращает новое значение, `false` при отсутствии `activeLocale` в config или `undefined` если plugin не установлен. |
| `getActiveLocale()` | `() => string \| undefined` | Текущая активная локаль. |
| `getDefaultLocale()` | `() => string \| undefined` | Локаль по умолчанию. |
| `FishtVueSymbol` | `InjectionKey<FishtVue>` | Стабильный `const` symbol для `inject()`. **Никогда** не пере-присваивается — multi-app safe. |
| `FishtVue.use(mw)` | `(middleware: FishtVueMiddleware) => void` | Регистрирует middleware, мутирующий config до merge. Запускается на каждый `install`. См. §10.5. |
| `FishtVue.registerComponent(name, ctor)` | `(string, VueComponent) => void` | Регистрирует custom-компонент глобально для всех будущих `install` — эквивалент `app.component(name, ctor)` без необходимости держать ссылку на app. |
| `FishtVue.extendTheme(name, theme)` | `(string, Theme) => void` | Регистрирует custom theme. После — `optionsTheme.nameTheme: name` резолвится на переданный theme. Override built-in допустим. |

Все getter-функции guard'ятся через `isExistFishtVue()` ([config/index.ts:81–92](../../lib/config/index.ts#L81-L92)) — она читает instance через `inject(FishtVueSymbol)` (primary path, требует Vue setup context), затем fallback на `(window as any).FishtVue` для client-side imperative API (например, `openAlert`).

## 9. Examples

### 9.1 Минимальная установка

```ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

createApp(App).use(FishtVue, {}).mount("#app")
```

### 9.2 С темой Harmony + dark mode

```ts
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"

const config: FishtVueConfiguration = {
  optionsTheme: {
    nameTheme: "Harmony",
    darkModeSelector: ".dark"
  },
  theme: {
    semantic: {
      customThemeColor: "200deg",
      customThemeColorContrast: "60%"
    }
  }
}

app.use<FishtVueConfiguration>(FishtVue, config)
```

### 9.3 Programmatic API

```ts
import { useFishtVue, getOptions, setActiveLocale } from "fishtvue/config"

const fv = useFishtVue()
console.log(fv?.config.theme)

const buttonOpts = getOptions("Button") // Readonly<ButtonOption>
setActiveLocale("ru")
```

### 9.4 Custom layers + кастомные опции компонентов

```ts
app.use<FishtVueConfiguration>(FishtVue, {
  optionsTheme: {
    layers: "reset, base, fishtvue, app",
    prefix: "myui"
  },
  componentsOptions: {
    Button: { mode: "primary", size: "lg" },
    Input: { mode: "outlined", clear: true },
    Table: { stripped: true }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

См. §5 — все опции доступны через `app.use(FishtVue, options)` или `nuxt.config.ts#fishtvue` (см. [Nuxt module](./nuxt-module.md)).

### 10.2 Per-instance

Не применимо для plugin'а. Per-component override — через props компонента.

### 10.3 Theming

Plugin читает `theme` и `optionsTheme.nameTheme`. Подробности — [Theme](./theme.md).

### 10.4 CSS layer override

Plugin задаёт базовый layer:

```css
@layer fishtvue {
  :root { --theme: ...; --theme-contrast: ...; }
  /* baseStyle.ts content */
}
```

Через `optionsTheme.layers = "a, b"` префиксируется:

```css
@layer a, b;
@layer fishtvue { ... }
```

Поздние layers побеждают. Для override стилей в приложении объяви `@layer fishtvue, app;` и пиши свои стили в `@layer app { ... }`.

### 10.5 Extensibility

Plugin поддерживает 3 extension-метода поверх стандартного `app.use(...)`. Вызываются ДО `app.use(FishtVue, options)`; module-level registries shared между installs.

#### `FishtVue.use(middleware)`

Регистрирует middleware-функцию, которая мутирует `FishtVueConfiguration` до merge с defaults. Запускается на каждый install, в порядке регистрации. Middleware может:

- Мутировать переданный объект in-place (возвращать `void`).
- Возвращать новый объект (становится `options` для следующих middleware и финального merge).

```ts
import FishtVue from "fishtvue/config"

FishtVue.use((cfg) => {
  cfg.unstyled = process.env.NODE_ENV === "test"
})

FishtVue.use((cfg) => {
  cfg.componentsOptions = { ...(cfg.componentsOptions ?? {}), Button: { mode: "outline" } }
})

app.use(FishtVue, { optionsTheme: { nameTheme: "Aurora" } })
// Финальный config: { unstyled: ..., optionsTheme: ..., componentsOptions: { Button: { mode: "outline" } } }
```

#### `FishtVue.registerComponent(name, component)`

Регистрирует custom Vue component, который автоматически становится глобальным (`app.component(name, ctor)`) при каждом install. Полезно для plugin-ов поверх FishtVue, которые хотят добавить свои компоненты без явного `app.component()`.

```ts
import FishtVue from "fishtvue/config"
import MyButton from "./MyButton.vue"

FishtVue.registerComponent("MyButton", MyButton)
app.use(FishtVue, {})
// Теперь <MyButton /> доступен в любом template без impotr.
```

#### `FishtVue.extendTheme(name, theme)`

Регистрирует custom theme. После регистрации `optionsTheme.nameTheme: <name>` резолвится на переданный theme. Override built-in (`Aurora`/`Harmony`/`Sapphire`) допустим — custom побеждает.

```ts
import FishtVue from "fishtvue/config"
import sunset from "./themes/sunset"

FishtVue.extendTheme("Sunset", sunset)
app.use(FishtVue, { optionsTheme: { nameTheme: "Sunset" } })
```

#### Limitations

- Module-level state — все registries shared между install'ами в текущем worker'е. Для multi-tenant SSR это может быть нежелательно; в таком случае используй stateful approach (передавай custom theme прямо в `options.theme`).
- `__resetForTests()` — test-only utility для очистки registries между Vitest-тестами; не использовать в production-коде.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

Plugin a11y не вносит. Семантика — на стороне компонентов.

### Security

- На клиенте экземпляр зеркалится в `window.FishtVue` ([config/index.ts:125](../../lib/config/index.ts#L125)). Это присваивание property глобального `window` — потенциальный конфликт с другим кодом, использующим `window.FishtVue`.
- `console.warn("FishtVue is not installed!")` закомментирован ([config/index.ts:77](../../lib/config/index.ts#L77)) — диагностика отсутствует.
- `BaseStylesComponent.initStyle(...)` инжектит inline `<style>` — нужен CSP `style-src 'unsafe-inline'` или nonce.
- `deepFreeze` ([utils/objectHandler.ts](../../lib/utils/objectHandler.ts)) применяется к копиям, возвращаемым `useFishtVue`/`getOptions`. Источник остаётся reactive — мутация через `app.provide` instance работает.

## 13. TypeScript

```ts
import FishtVue, { type FishtVueConfiguration, useFishtVue } from "fishtvue/config"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Aurora" },
  componentsOptions: {
    Button: { mode: "primary" }
  }
}

app.use<FishtVueConfiguration>(FishtVue, config)
```

`$fishtVue` в template:

```vue
<template>
  <span>{{ $fishtVue.getActiveLocale() }}</span>
</template>
```

— тип добавляется через augmentation `ComponentCustomProperties` ([FishtVue.d.ts:116–120](../../lib/config/FishtVue.d.ts#L116-L120)).

## 14. Compatibility & Stability

- **Vue:** `^3.5.x` (использует `reactive`, `inject`, `hasInjectionContext`, `Plugin`).
- **TypeScript:** `5.x`.
- **Stability flag:** `stable`.
- **Breaking changes:** не зафиксировано в публичном API между 0.2.x.
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue, { useFishtVue } from "fishtvue/config"
import { defineComponent } from "vue"

describe("FishtVue plugin", () => {
  it("provides instance after install", () => {
    const Test = defineComponent({
      setup() {
        return { fv: useFishtVue() }
      },
      template: "<div></div>"
    })

    const wrapper = mount(Test, {
      global: {
        plugins: [[FishtVue, { componentsOptions: { Button: { mode: "primary" } } }]]
      }
    })

    expect((wrapper.vm as any).fv).toBeTruthy()
  })
})
```

Реальные тесты — [FishtVue.test.ts](../../lib/config/FishtVue.test.ts) (16 кейсов, 2 skipped).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `useFishtVue()` возвращает `undefined` | Plugin не установлен или вызван вне Vue setup context без window fallback. | Убедись, что `app.use(FishtVue, ...)` вызывается ДО `app.mount(...)`. Для вызова `useFishtVue` вне setup — на клиенте сработает fallback на `window.FishtVue`, на сервере — нет. |
| `getOptions("Button")` возвращает `undefined` | В `componentsOptions` нет ключа `Button` либо передано `undefined` для секции. | Передай объект (`{}` минимум) либо проверь имя ключа (PascalCase). |
| `setActiveLocale("xx")` возвращает `false` | `locale.activeLocale` не выставлено в конфиге. | Передай `locale: { defaultLocale: "en" }` — на install `activeLocale ??= defaultLocale` срабатывает. |
| Stylesheet `@layer fishtvue` не появляется | `unstyled: true` или `BaseStylesComponent.initStyle` не отработал на сервере. | Сними `unstyled` или проверь, что `onServerPrefetch` пайплайн запущен. |
| Конфигурация не реактивна | `useFishtVue()` возвращает frozen-копию через `deepFreeze`. | Для реактивности используй `inject(FishtVueSymbol)` напрямую — оригинальный объект `reactive`. |

## 17. Related

- [01-getting-started.md](../01-getting-started.md) — обзор пакета и инициализации.
- [02-installation.md](../02-installation.md) — установка для Vite/Nuxt.
- [architecture/component-class.md](./component-class.md) — как `Component<T>` читает config через `getOptions`.
- [architecture/theme.md](./theme.md) — структура `Theme` и `OptionsTheme`.
- [architecture/locale.md](./locale.md) — `Locales`, `messages`, `setActiveLocale`.
- [architecture/nuxt-module.md](./nuxt-module.md) — как Nuxt-module передаёт конфиг в plugin.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [config/index.ts](../../lib/config/index.ts) и [FishtVue.d.ts](../../lib/config/FishtVue.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- `unstyled: boolean` объявлен в `FishtVueConfiguration` ([FishtVue.d.ts:130](../../lib/config/FishtVue.d.ts#L130)), enforce'ится через `Component.setStyle()` guard ([component/index.ts:138](../../lib/component/index.ts#L138)) — cross-cutting, применяется ко всем компонентам.
- `componentsStyle` ([FishtVue.d.ts:128](../../lib/config/FishtVue.d.ts#L128)) — читается компонентами через `Component.componentsStyle()`, не enforced на уровне install.

### Skipped tests

На момент ревизии (2026-05-20) skipped тестов в [FishtVue.test.ts](../../lib/config/FishtVue.test.ts) нет. Раньше было 2 skipped — оба unblocked в рамках Issue 6 audit close-out.

### API inconsistencies

- ~~`FishtVueSymbol` в `FishtVue.d.ts` объявлен как `InjectionKey<string>`~~ — ✅ resolved 2026-05-20: теперь `const FishtVueSymbol: InjectionKey<FishtVue>` в обоих местах.
- `getOptions` в `index.ts` приводит результат к жёсткому типу через `as`-cast — обход TS, который не идеален при добавлении новых ключей `ComponentsOptions`.

### Behavioral caveats

- ~~`FishtVueSymbol` пере-присваивается при каждом `install`~~ — ✅ resolved 2026-05-20: symbol теперь `const`, безопасен для multi-app.
- На клиенте записывается `window.FishtVue` — global pollution. Используется как fallback для imperative API (`openAlert`) вне Vue setup context.
- `deepMerge` ([utils/objectHandler.ts](../../lib/utils/objectHandler.ts)) производит глубокий мерж массивов и объектов; для пользовательских массивов (`locale.locales`) это значит конкатенацию, а не замену — учти при override.
- Extensibility registries (`use`/`registerComponent`/`extendTheme`) — module-level state, shared между install'ами. См. §10.5 Limitations.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
