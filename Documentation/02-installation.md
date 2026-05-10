---
title: Installation
summary: Установка fishtvue в Vite (Vue 3) и Nuxt 3/4 проектах.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Installation

## 1. Overview

`fishtvue` поставляется как один npm-пакет с подкаталогами на каждый компонент (`fishtvue/button`, `fishtvue/input`, …) — это даёт точечный импорт без барреля для tree-shaking. Документ описывает три сценария: Vite (Vue 3 SPA), Nuxt 3, Nuxt 4 (экспериментально через тот же модуль).

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/package.json](../lib/package.json), [lib/rollup.config.js](../lib/rollup.config.js), [lib/module/nuxt.ts](../lib/module/nuxt.ts), [lib/plugins/nuxt.ts](../lib/plugins/nuxt.ts).

## 2. How it's organized

Пакет публикует следующие entry points (см. подпапки `lib/<name>/package.json`):

- `fishtvue` — barrel из [lib/index.ts](../lib/index.ts) — все 22 компонента + `Config`.
- `fishtvue/{name}` — точечный импорт компонента (например, `fishtvue/button`).
- `fishtvue/config` — Vue plugin + глобальные функции `useFishtVue`, `getOptions`, `setActiveLocale`.
- `fishtvue/component` — базовый класс `Component<T>` (для разработки внутри библиотеки).
- `fishtvue/theme` — `tailwind`, `palette`, `toVarsCss`, `linksTheme`, `useStyle`, `NamesTheme`.
- `fishtvue/locale` — встроенные локали `en`, `ru` + `NameLocale`.
- `fishtvue/utils/{handler}` — утилиты (`objectHandler`, `domHandler`, …).
- `fishtvue/module` — Nuxt module (`defineNuxtModule`).
- `fishtvue/plugins/nuxt` — Nuxt plugin (`nuxtInitPlugin`).

**Внешние зависимости** ([lib/package.json:44–57](../lib/package.json#L44-L57)):

| Пакет | Версия | Зачем |
|---|---|---|
| `@heroicons/vue` | `^2.1.5` | Icons компонент. |
| `@iconify/vue` | `^4.1.2` | Icons компонент (Iconify backend). |
| `@vueup/vue-quill` + `quill` | `^1.2.0` / `^2.0.2` | TextEditor. |
| `v-calendar` | `^3.1.2` | Calendar. |
| `date-fns` | `^4.1.0` | Calendar и `dateHandler`. |
| `gsap` | `^3.12.5` | Анимации некоторых компонентов. |
| `clsx` + `tailwind-merge` | `^2.1.x` / `^3.4.0` | `tailwindHandler.cn`. |
| `lodash-es` | `^4.18.1` | Локальные утилиты. |
| `csstype` | `^3.1.3` | Типы CSS-проперти. |
| `vue` | `^3.5.11` | Runtime. |

**Peer dependencies (optional)** ([lib/package.json:30–43](../lib/package.json#L30-L43)):
`@nuxt/kit ^4.1.2`, `@nuxt/schema ^4.1.2`, `nuxt >=3.0.0`. В Vite-проекте предупреждения о peer-deps игнорируются.

## 3. How it works

После `app.use(FishtVue, options)`:

1. Конфигурация мержится с дефолтами (см. [01-getting-started.md §3](./01-getting-started.md#3-how-it-works)).
2. Создаётся базовый layer `@layer fishtvue` через служебный экземпляр `Component("BaseComponent")` — инжектится `<style>`-элемент в `<head>`.
3. Каждый компонент при mount регистрирует свой layer.

В Nuxt-проекте [module/nuxt.ts](../lib/module/nuxt.ts) дополнительно:
- Регистрирует все 22 компонента в auto-import (если `autoImport: true` — default).
- Добавляет server plugin из [plugins/nuxt.ts](../lib/plugins/nuxt.ts).
- Создаёт generated plugin, который вызывает `nuxtApp.vueApp.use(FishtVue, options)` на уровне `mode: "all"`.

**Tailwind/UnoCSS на стороне приложения не обязателен** — компоненты используют собственный конвертер Tailwind-подобных классов (`fishtvue/theme/uno`) и инжектят результат в `@layer fishtvue` при `setStyle()`. Для override стилей пользовательскими Tailwind-классами Tailwind в проекте полезен, но не требуется.

## 4. Quick Start

### 4.1 Vite (Vue 3 SPA)

```bash
pnpm create vite@latest my-app -- --template vue-ts
cd my-app
pnpm add fishtvue
```

```ts
// src/main.ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

createApp(App).use(FishtVue, {}).mount("#app")
```

### 4.2 Nuxt 3

```bash
pnpm dlx nuxi@latest init my-nuxt-app
cd my-nuxt-app
pnpm add fishtvue
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: {
    autoImport: true,
    prefix: "",
    componentsOptions: {
      Button: { mode: "primary", type: "theme" }
    }
  }
})
```

После этого все компоненты доступны без импорта: `<Button>`, `<Input>` и т. д.

### 4.3 Nuxt 4 (экспериментально)

То же самое — модуль определяет Nuxt 4 через `nuxt/package.json` ([module/nuxt.ts:18](../lib/module/nuxt.ts#L18)) и работает корректно. Однако auto-import-поведение Nuxt 4 отличается от Nuxt 3 — рекомендуется явная проверка после установки.

## 5. Props

Не применимо: документ описывает установку, а не компонент.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

Не применимо. Программный API плагина — см. [01-getting-started §8](./01-getting-started.md#8-exposed-methods).

## 9. Examples

### 9.1 Минимальный Vite + theme override

```ts
import { createApp } from "vue"
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"
import App from "./App.vue"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Sapphire" },
  theme: {
    semantic: {
      customThemeColor: "200deg",
      customThemeColorContrast: "60%"
    }
  }
}

createApp(App).use<FishtVueConfiguration>(FishtVue, config).mount("#app")
```

### 9.2 Nuxt 3 + локализация

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: {
    locale: {
      defaultLocale: "ru",
      messages: {
        ru: { /* кастомные ключи */ }
      }
    }
  }
})
```

Передача всего, кроме module-only-полей (`global`, `mode`, `prefix`, `autoImport`, `disableGlobalStyles`), пробрасывается в `app.use(FishtVue, …)` через generated plugin ([module/nuxt.ts:73](../lib/module/nuxt.ts#L73)).

### 9.3 Точечный импорт без auto-import (Nuxt)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: { autoImport: false }
})
```

```vue
<script setup lang="ts">
import Button from "fishtvue/button"
</script>

<template>
  <Button>Manual import</Button>
</template>
```

Полезно при гибридных проектах, где нужен tree-shaking и контроль над импортами.

### 9.4 Vite + точечный импорт (без barrel)

```ts
// src/main.ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"
import App from "./App.vue"

const app = createApp(App)
app.use(FishtVue, {})
app.mount("#app")
```

```vue
<script setup lang="ts">
import Button from "fishtvue/button"
import Input from "fishtvue/input"
</script>
```

Импорт `fishtvue/{name}` всегда предпочтительнее `import { Button } from "fishtvue"` — Rollup пакета настроен так, что barrel re-exports не блокируют tree-shaking, но точечный импорт надёжнее.

## 10. Configuration & Customization

### 10.1 Global

Опции передаются в `app.use(FishtVue, options)` или `nuxt.config.ts#fishtvue`. Полная схема — см. [Config](./architecture/config.md). Для Nuxt дополнительно доступны module-only поля (см. [Nuxt module](./architecture/nuxt-module.md)).

### 10.2 Per-instance

Опции каждого компонента переопределяются props у конкретного `<X>`. Приоритет: `props` > `componentsOptions.X` > defaults.

### 10.3 Theming

Тема выбирается через `optionsTheme.nameTheme: "Aurora" | "Harmony" | "Sapphire"`. Custom темы — переопределение `theme.semantic` / `theme.primitive`. Полная справка — [Theme](./architecture/theme.md).

### 10.4 CSS layer override

Стили инжектятся в `@layer fishtvue`. См. [01-getting-started §10.4](./01-getting-started.md#104-css-layer-override) и [Theme](./architecture/theme.md).

## 11. Form integration & validation

Не применимо для документа об установке. Form-валидация — [Form](./components/form.md).

## 12. Accessibility & Security

### A11y

Установка не вносит a11y-логики. Ответственность каждого компонента; компонент [Aria](./components/aria.md) предоставляет общие abstractions.

### Security

- На клиенте экземпляр зеркалится в `window.FishtVue` — учти при CSP-конфигурации `script-src` (это присваивание, не eval; не требует `'unsafe-eval'`).
- Стили `@layer fishtvue` инжектятся как inline `<style>` — нужен `style-src 'unsafe-inline'` или подмена nonce на стороне приложения.
- При `autoImport: true` (Nuxt) все 22 компонента регистрируются в auto-import, но реально подключаются только при использовании в шаблонах — risk surface минимален.

## 13. TypeScript

```ts
// Vite
import FishtVue, { type FishtVueConfiguration } from "fishtvue/config"

const config: FishtVueConfiguration = {
  optionsTheme: { nameTheme: "Aurora" }
}
```

```ts
// Nuxt — типизация nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config"
import type { FishtVueOptions } from "fishtvue/module"

export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: {
    autoImport: true,
    optionsTheme: { nameTheme: "Harmony" }
  } satisfies FishtVueOptions
})
```

`FishtVueOptions = FishtVueConfiguration & ModuleOptions` ([module/index.d.ts:43](../lib/module/index.d.ts#L43)).

## 14. Compatibility & Stability

- **Vue:** `^3.5.11` (зафиксирована как dependency, но фактически peer-зависимость от Vue приложения).
- **Nuxt:** `>=3.0.0` (включая Nuxt 4).
- **Node:** актуальные LTS (18+, 20+).
- **Браузеры:** evergreen (Chrome, Firefox, Safari, Edge — последние 2 версии). IE не поддерживается.
- **Stability flag:** `stable`.
- **Breaking changes:** см. [CHANGELOG.md](../CHANGELOG.md).
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток в installation flow не зафиксировано.

## 15. Testing recipes

В Vitest (Vite-проект):

```ts
import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Button from "fishtvue/button"

describe("Button after install", () => {
  it("mounts inside FishtVue plugin", () => {
    const wrapper = mount(Button, {
      props: { mode: "primary" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Для Nuxt-проекта тестирование — через `@nuxt/test-utils`. Plugin регистрируется автоматически при `setup({ rootDir: "...", server: true })`.

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `Cannot resolve "fishtvue/config"` в Vite | Не установлен пакет `fishtvue`. | `pnpm add fishtvue`. |
| `Cannot find module 'fishtvue/module'` в Nuxt | `nuxt.config.ts` подключает модуль до установки пакета. | Сначала `pnpm add fishtvue`, потом перезапусти `nuxi`. |
| Auto-import не работает в Nuxt | `autoImport: false` или конфликт `prefix` с другим модулем. | Проверь `nuxt.config.ts#fishtvue.autoImport`. |
| Компонент рендерится без стилей | Не подключён `app.use(FishtVue, {})` (Vite) или `disableGlobalStyles: true` (Nuxt). | Подключи плагин или сними флаг. |
| Tailwind override не побеждает стили компонента | Стили в `@layer fishtvue` имеют тот же приоритет, что и другие layers, но проигрывают стилям вне layers. | См. §10.4 / [01-getting-started §10.4](./01-getting-started.md#104-css-layer-override). |
| Конфликт версии `vue` | В пакете `vue ^3.5.11` зафиксирован как dependency. При другой major-версии в приложении возможен дубликат runtime'a. | Согласуй версию Vue (`^3.5`). |
| `@vueup/vue-quill` тянет CSS, который ломает styles в Vite | TextEditor импортирует CSS quill, который не layered. | Импортируй TextEditor только там, где он нужен; либо оборачивай в свой layer. |
| Build падает с `gsap` warning | GSAP — ESM-only в новых версиях. | Убедись, что bundler поддерживает ESM (Vite ≥ 4). |

## 17. Related

- [01-getting-started.md](./01-getting-started.md) — что происходит при инициализации.
- [architecture/config.md](./architecture/config.md) — структура `FishtVueConfiguration`.
- [architecture/nuxt-module.md](./architecture/nuxt-module.md) — детали Nuxt module и plugin.
- [architecture/theme.md](./architecture/theme.md) — тема и `@layer fishtvue`.
- [components/calendar.md](./components/calendar.md), [components/text-editor.md](./components/text-editor.md), [components/icons.md](./components/icons.md) — компоненты с тяжёлыми внешними зависимостями.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [module/nuxt.ts](../lib/module/nuxt.ts) и [plugins/Plugins.ts](../lib/plugins/Plugins.ts) не зафиксировано.

### Incomplete or stubbed behavior

- `getNuxtVersion()` ([module/nuxt.ts:10–17](../lib/module/nuxt.ts#L10-L17)) при отсутствии `nuxt/package.json` возвращает hardcoded `"4.0.0"`, что обманчиво в окружениях, где Nuxt не установлен. Это не блокирующая проблема — модуль регистрируется только при включенном Nuxt.
- В [module/nuxt.ts:62](../lib/module/nuxt.ts#L62) переменная `importPath` всегда равна `"#app"` независимо от `isV4`. Текущая логика рабочая, но детект v3/v4 не используется по назначению.

### Skipped tests

В пакете `lib/module/` и `lib/plugins/` тестов нет — установка проверяется интеграционно через `sandbox-nuxt`.

### API inconsistencies

- `FishtVueOptions` (Nuxt) расширяет `FishtVueConfiguration`, но поле `componentsStyle` не используется на уровне модуля — оно прокидывается в плагин и читается уже компонентами.
- `MODULE_OPTIONS` ([module/nuxt.ts:78](../lib/module/nuxt.ts#L78)) перечисляет поля для отсечения от plugin-конфига: `["global", "mode", "prefix", "autoImport", "disableGlobalStyles"]`. Если в `ModuleOptions` ([module/index.d.ts:9–37](../lib/module/index.d.ts#L9-L37)) появятся новые поля — список нужно обновить вручную.

### Behavioral caveats

- `disableGlobalStyles` объявлен как опция модуля, но обработка флага распределена по компонентам — поведение в Nuxt не централизовано.
- `prefix` из `ModuleOptions` применяется только к auto-import (`addComponent`); если консумер использует точечный импорт `import Button from "fishtvue/button"`, prefix игнорируется.

### Bug report format

См. [01-getting-started §18](./01-getting-started.md#18-known-issues--limitations).
