---
title: Getting started
summary: Знакомство с пакетом fishtvue, инициализация плагина, минимальный запуск.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Getting started

## 1. Overview

`fishtvue` — Vue 3 component library, публикуемая в npm как один пакет. Содержит 22 компонента, инфраструктуру (Component class, Config plugin, theme, locale) и набор utility handlers. Цель документа — провести контрибьютора от установки до первого работающего компонента и описать, что происходит при инициализации.

Stability: `stable`. Описанный поток инициализации соответствует версии 0.2.11 (см. [lib/package.json:2](../lib/package.json#L2)).

Source: [lib/index.ts](../lib/index.ts) (re-exports всех компонентов), [lib/config/index.ts](../lib/config/index.ts) (Vue plugin).

## 2. How it's organized

```
lib/
├── index.ts            # публичный barrel — re-export всех компонентов
├── index.d.ts          # типы публичного API
├── package.json        # name "fishtvue", peer/deps, exports map
├── rollup.config.js    # сборка на Rollup 4
├── tsconfig.rollup.json
├── component/          # базовый класс Component<T>
├── config/             # Vue plugin, useFishtVue, getOptions
├── theme/              # primitive/semantic токены, Aurora/Harmony/Sapphire
├── locale/             # встроенные локали en, ru
├── utils/              # 11 handlers (array, object, string, number, date, dom, color, function, rules, tailwind, uniqueCollection)
├── module/             # Nuxt module
├── plugins/            # Nuxt plugin (внутренний)
├── <component>/        # каталог на каждый из 22 компонентов
└── ...
```

Каждый компонент имеет свой `package.json` с полями `main`, `types`, `exports` — это даёт точечный импорт `fishtvue/{name}` для tree-shaking.

Подробнее по модулям инфраструктуры см. [Component class](./architecture/component-class.md), [Config](./architecture/config.md), [Theme](./architecture/theme.md), [Locale](./architecture/locale.md), [Nuxt module](./architecture/nuxt-module.md).

## 3. How it works

При инициализации происходит следующее (см. [config/index.ts:109–143](../lib/config/index.ts#L109-L143)):

1. `app.use(FishtVue, options)` запускает `install`.
2. Опции пользователя сливаются с defaults через `deepMerge` (default theme — Aurora, default locale — `en` + `ru`).
3. Создаётся reactive `FishtVue.config` с полями `theme`, `locale`, `componentsOptions`, `optionsTheme`, `componentsStyle`, `unstyled`.
4. `linksTheme` дочерне применяет цветовые ссылки между primitive- и semantic-уровнями темы.
5. Создаётся уникальный `FishtVueSymbol` (re-assign после install — нужно, чтобы `useFishtVue()` не возвращал данные до завершения установки).
6. Объект `FishtVue` провайдится через `app.provide(FishtVueSymbol, FishtVue)` и записывается в `app.config.globalProperties.$fishtVue`. На клиенте дополнительно — в `window.FishtVue` (для случаев, когда `inject` недоступен — отдельные песочницы).
7. Базовый layer `@layer fishtvue` инициализируется через служебный экземпляр `Component("BaseComponent")` и `BaseStylesComponent.initStyle(...)`. Layer'ы можно переопределить через `optionsTheme.layers`.

Каждый компонент при `setup` делает `const X = new Component<"X">()`, читает `X.getOptions()` (резолвится в `componentsOptions.X` из плагина), вызывает `X.setStyle(...)` для инжекции стилей в `@layer fishtvue` и `X.t("key")` для локализации.

**SSR:** проверка контекста — через `isClient()` ([utils/domHandler.ts](../lib/utils/domHandler.ts)). Запись в `window` пропускается на сервере. Обращения к DOM в компонентах guard'ятся индивидуально (см. соответствующие component-доки).

## 4. Quick Start

```bash
pnpm add fishtvue
```

```ts
// main.ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

const app = createApp(App)
app.use(FishtVue, {})
app.mount("#app")
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import Button from "fishtvue/button"
</script>

<template>
  <Button mode="primary" type="theme">Привет, FishtVue</Button>
</template>
```

Без вызова `app.use(FishtVue, ...)` компоненты отрендерятся, но `getOptions()` вернёт `undefined`, локализация и стили из `@layer fishtvue` не подключатся. Подробнее — см. §16.

## 5. Props

Не применимо для этого документа: getting-started не описывает props компонента. Опции плагина — раздел §10. Per-component props — в [components/](./components/).

## 6. Events / Emits + v-model contract

Не применимо для этого документа.

## 7. Slots

Не применимо для этого документа.

## 8. Exposed methods

Не применимо для этого документа в контексте компонента. На уровне плагина доступны глобальные функции из `fishtvue/config`:

| Name | Type | Description |
|---|---|---|
| `useFishtVue<T>()` | `() => Readonly<T> \| undefined` | Возвращает frozen-копию активного `FishtVue` instance. |
| `getOptions<T>(component?)` | `(component?: keyof ComponentsOptions) => Readonly<...>` | Frozen-копия конкретной секции `componentsOptions` или всех опций. |
| `setActiveLocale(name)` | `(name: NameLocale) => string \| boolean \| undefined` | Меняет активную локаль. Возвращает новое значение или `false`. |
| `getActiveLocale()` | `() => string \| undefined` | Текущая активная локаль. |
| `getDefaultLocale()` | `() => string \| undefined` | Локаль по умолчанию из конфига. |

Источник — [config/FishtVue.d.ts:33–67](../lib/config/FishtVue.d.ts#L33-L67), реализация — [config/index.ts:18–68](../lib/config/index.ts#L18-L68).

## 9. Examples

### 9.1 Минимальная установка

```ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

createApp(App).use(FishtVue, {}).mount("#app")
```

### 9.2 С глобальной конфигурацией компонентов

```ts
import { createApp } from "vue"
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"
import App from "./App.vue"

createApp(App)
  .use<FishtVueConfiguration>(FishtVue, {
    componentsOptions: {
      Button: { mode: "primary", type: "theme", rounded: "md" },
      Input: { mode: "outlined", clear: true }
    }
  })
  .mount("#app")
```

### 9.3 Переключение темы и локали в рантайме

```vue
<script setup lang="ts">
import { setActiveLocale, useFishtVue } from "fishtvue/config"

const fv = useFishtVue()
function toRu() {
  setActiveLocale("ru")
}
function toEn() {
  setActiveLocale("en")
}
</script>

<template>
  <button type="button" @click="toRu">RU</button>
  <button type="button" @click="toEn">EN</button>
  <p>Active: {{ fv?.getActiveLocale() }}</p>
</template>
```

### 9.4 Биндинг к Pinia store

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Input from "fishtvue/input"
import { useUserStore } from "@/stores/user"

const store = useUserStore()
const { name } = storeToRefs(store)
</script>

<template>
  <Input v-model="name" />
</template>
```

`Input` внутренне использует контракт `update:modelValue` / `change:modelValue` — store-action триггерится через writable computed внутри store или через явный `@change:modelValue`. Подробнее в [components/input.md](./components/input.md).

## 10. Configuration & Customization

### 10.1 Global

Опции `app.use(FishtVue, options)` соответствуют типу `FishtVueConfiguration` ([FishtVue.d.ts:126–139](../lib/config/FishtVue.d.ts#L126-L139)):

| Field | Type | Default | Description |
|---|---|---|---|
| `componentsStyle` | `StyleMode` (`"filled" \| "outlined" \| "underlined"`) | — | Глобальный визуальный режим. Per-component override через props. |
| `unstyled` | `boolean` | — | Отключает инжекцию `@layer fishtvue`. |
| `locale` | `Locales` | `{ defaultLocale: "en", messages: { en, ru } }` | См. [Locale](./architecture/locale.md). |
| `theme` | `Theme` | Aurora preset | См. [Theme](./architecture/theme.md). |
| `optionsTheme` | `OptionsTheme` (Partial) | `{}` | `{ nameTheme, prefix, lightModeSelector, darkModeSelector, layers, isNotMinifyCSS }`. |
| `componentsOptions` | `Partial<ComponentsOptions>` | — | Per-component опции — ключ совпадает с PascalCase именем компонента. |

Полный пример — раздел [9.2](#92-с-глобальной-конфигурацией-компонентов) и документ [Config](./architecture/config.md).

### 10.2 Per-instance

Все ключи `componentsOptions.X` могут быть переопределены props у конкретного `<X>`. Приоритет: `props` > `componentsOptions.X` > глобальные defaults компонента.

### 10.3 Theming

Тема выбирается через `optionsTheme.nameTheme: "Aurora" | "Harmony" | "Sapphire"` (см. [theme/themes/](../lib/theme/themes)). Custom-токены — поле `theme.semantic`. Dark mode — атрибут/класс из `optionsTheme.darkModeSelector`. Подробности — [Theme](./architecture/theme.md).

### 10.4 CSS layer override

Стили инжектятся в `@layer fishtvue`. Чтобы override сработал:
- Объяви свой layer позже: `@layer fishtvue, app;` — слой `app` выигрывает.
- Или поднимай специфичность внутри `@layer fishtvue` — например через `:where()` Selectors-Level-4.
- Или объяви override-стили вне layers — стили вне layers побеждают любые внутри layers.

Дополнительные layers задаются через `optionsTheme.layers`.

## 11. Form integration & validation

Не применимо для этого документа. Form-валидация описана у [Form](./components/form.md), [Input](./components/input.md), [Select](./components/select.md) и в [utilities/rulesHandler.md](./utilities/rulesHandler.md).

## 12. Accessibility & Security

### A11y

На уровне плагина a11y-логики нет — только базовые стили. Каждый компонент сам решает свои a11y-задачи; для шаблонов screen-reader-семантики см. компонент [Aria](./components/aria.md).

### Security

- `@layer fishtvue` инжектится через `<style>`-элемент — это inline-стиль, требует `style-src 'unsafe-inline'` в CSP, либо `style-src 'nonce-*'` (FishtVue не задаёт nonce; предусмотри patch на стороне приложения).
- Плагин не использует `eval`, `new Function`, динамическую загрузку.
- На клиенте записывается `window.FishtVue` — теоретически конфликтует с глобальными неймспейсами того же имени.

## 13. TypeScript

Базовая типизация:

```ts
import FishtVue, { type FishtVueConfiguration, useFishtVue } from "fishtvue/config"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Harmony" }
}

// app.use<FishtVueConfiguration>(FishtVue, config)

const fv = useFishtVue()
fv?.getOptions("Button")?.mode
```

Для `$fishtVue` в template используется `ComponentCustomProperties` из `@vue/runtime-core` — типы добавляются автоматически после импорта `fishtvue/config` в TS-проекте (см. [FishtVue.d.ts:116–120](../lib/config/FishtVue.d.ts#L116-L120)).

## 14. Compatibility & Stability

- **Vue:** `^3.5.25` (см. [package.json](../package.json)).
- **TypeScript:** `5.9.3` для разработки. На стороне приложения — `5.x`.
- **Node:** не зафиксировано в `engines`. Тестируется на актуальных LTS.
- **Nuxt:** через `lib/module/nuxt.ts` поддерживается Nuxt `>=3.0.0`. Nuxt 4 — поддерживается, ветка кода с детектом `isNuxt4()` существует ([module/nuxt.ts:18](../lib/module/nuxt.ts#L18)).
- **Браузеры:** evergreen (Chrome, Firefox, Safari, Edge — последние 2 версии). IE не поддерживается.
- **Stability flag:** `stable`. Текущий публичный API стабилен в рамках 0.2.x; breaking changes — см. [CHANGELOG.md](../CHANGELOG.md).
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток в публичных типах getting-started flow не зафиксировано.

## 15. Testing recipes

Для unit-тестов компонентов, использующих FishtVue:

```ts
import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Button from "fishtvue/button"
import MyComponent from "@/components/MyComponent.vue"

describe("MyComponent", () => {
  it("renders with FishtVue plugin", () => {
    const wrapper = mount(MyComponent, {
      global: {
        plugins: [[FishtVue, { /* test config */ }]],
        components: { Button }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Без plugin — `getOptions()` вернёт `undefined`, и компонент отработает с собственными defaults. Для тестов локали — устанавливай `locale.defaultLocale` в конфиге plugin'а.

Запуск тестов библиотеки: `pnpm test` (Vitest 4) или `pnpm test:watch`.

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Компонент рендерится, но без стилей | Не вызван `app.use(FishtVue, {})` либо `unstyled: true`. | Добавь `app.use(FishtVue, {})` в `main.ts`. |
| `useFishtVue()` возвращает `undefined` в setup | Компонент рендерится до завершения `install` (редкий случай при ручной инициализации) или вне Vue context. | Используй внутри `setup()` либо передавай instance явно. |
| Темная тема не переключилась | `optionsTheme.darkModeSelector` не совпадает с фактическим селектором (`html.dark`, `[data-theme="dark"]`). | Согласуй селектор с DOM-разметкой. |
| Override CSS-класса не работает | Стиль внутри `@layer fishtvue` имеет более низкий приоритет, чем не-layer стили — но равный другим layers. | См. §10.4: дополнительный layer позже либо вне layers. |
| TypeScript не находит `$fishtVue` в template | `tsconfig` не подхватил augmentation из `fishtvue/config`. | Добавь `"types": ["fishtvue/config"]` или импортни модуль в любом `.ts`. |
| Плагин ругается на peer-deps `@nuxt/kit`/`@nuxt/schema` | Nuxt-зависимости — peer dependencies (см. [lib/package.json:30–47](../lib/package.json#L30-L47)). В Vite-проекте можно игнорировать предупреждение. | Для Vite-only проектов — игнорируй; для Nuxt-проекта добавь `nuxt`. |

## 17. Related

- [02-installation.md](./02-installation.md) — детали установки для Vite и Nuxt.
- [architecture/config.md](./architecture/config.md) — полная справка по плагину.
- [architecture/component-class.md](./architecture/component-class.md) — внутренний контракт всех компонентов.
- [architecture/theme.md](./architecture/theme.md) — токены и темы.
- [architecture/locale.md](./architecture/locale.md) — встроенные локали и их расширение.
- [dev-patterns.md](./dev-patterns.md) — паттерны разработки.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [config/index.ts](../lib/config/index.ts) и [config/FishtVue.d.ts](../lib/config/FishtVue.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- В [config/index.ts:77](../lib/config/index.ts#L77) закомментирован `console.warn("FishtVue is not installed!")` — диагностика отсутствия плагина выключена. При отладке возникает «тихое» возвращение `undefined` из `useFishtVue()`/`getOptions()` без сигнала. Не блокирует работу.

### Skipped tests

`it.skip`/`xit`/`xdescribe` в [config/FishtVue.test.ts](../lib/config/FishtVue.test.ts) — требует прицельного аудита в рамках самого Config; здесь упоминается как отсылка.

### API inconsistencies

- `componentsStyle` в `FishtVueConfiguration` ([FishtVue.d.ts:128](../lib/config/FishtVue.d.ts#L128)) не имеет публичной обработки на уровне плагина — её читают компоненты через `getOptions()`.
- `unstyled` ([FishtVue.d.ts:130](../lib/config/FishtVue.d.ts#L130)) описан как флаг в типе, но в [config/index.ts](../lib/config/index.ts) явная ветка обработки `unstyled === true` отсутствует — компоненты сами проверяют этот флаг.

### Behavioral caveats

- `FishtVueSymbol` пере-инициализируется при каждом `install`. Если приложение вызывает `app.use(FishtVue, ...)` дважды (повторный install), активным останется последний symbol — старые `inject(FishtVueSymbol)`-обращения, сделанные между установками, могут не получить ожидаемый instance.
- На клиенте экземпляр зеркалится в `window.FishtVue` — потенциальный конфликт с внешним global того же имени.

### Bug report format

Минимальный набор для issue в [github.com/Egoka/FishtVue/issues](https://github.com/Egoka/FishtVue/issues):
- Версии: `vue`, `nuxt` (если есть), `fishtvue`, `node`, OS, browser.
- Минимальный repro (StackBlitz/CodeSandbox или ветка в `sandbox/`).
- Ожидаемое vs фактическое поведение.
- Скриншот / запись экрана для UI-багов.
- `console` errors/warnings.
