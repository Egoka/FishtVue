---
title: Nuxt module + plugin
summary: fishtvue/module — defineNuxtModule с auto-import; fishtvue/plugins/nuxt — SSR-инжекция CSS.
updated: 2026-06-19
stability: stable
since: 0.2.11
---

# Nuxt module + plugin

## 1. Overview

Два пакета внутри `fishtvue/`, обеспечивающие интеграцию с Nuxt:

- `fishtvue/module` — Nuxt module: добавляет 22 компонента в auto-import, регистрирует SSR-plugin, генерирует runtime-plugin, который вызывает `nuxtApp.vueApp.use(FishtVue, options)`.
- `fishtvue/plugins/nuxt` — Server plugin: на хуке `app:rendered` пушит накопленный в `cssComponents` CSS в `ssrContext.head`.

Stability: `stable` (Nuxt 3); Nuxt 4 — экспериментально (детект `isNuxt4()` существует, но реальное поведение требует проверки в production).

Source: [lib/module/nuxt.ts](../../lib/module/nuxt.ts), [lib/module/index.d.ts](../../lib/module/index.d.ts), [lib/module/package.json](../../lib/module/package.json), [lib/plugins/nuxt.ts](../../lib/plugins/nuxt.ts), [lib/plugins/Plugins.ts](../../lib/plugins/Plugins.ts), [lib/plugins/Plugins.d.ts](../../lib/plugins/Plugins.d.ts).

## 2. How it's organized

```
lib/module/
├── nuxt.ts             # defineNuxtModule({ name: "fishtvue", ... })
├── index.d.ts          # ModuleOptions, FishtVueOptions = FishtVueConfiguration & ModuleOptions
└── package.json        # entry для "fishtvue/module"

lib/plugins/
├── nuxt.ts             # server-side defineNuxtPlugin — ssrContext head injection
├── nuxt.d.ts
├── Plugins.ts          # default export { nuxtInitPlugin }
├── Plugins.d.ts
└── package.json
```

Внутренние зависимости:

- `fishtvue/component` — `cssComponents: Map<NamesComponents, string>` ([component/index.ts:26](../../lib/component/index.ts#L26)).
- `fishtvue/utils/stringHandler.toFlatCase` — нормализация имён компонентов в kebab-имена путей.
- `fishtvue/utils/objectHandler.fieldsOmit` — фильтрация module-only-полей перед передачей в plugin.
- `fishtvue/config` — собственно plugin, который запускается из generated runtime-plugin.

Внешние peer-зависимости (optional, [lib/package.json:41–72](../../lib/package.json#L41-L72)):

| Пакет | Версия |
|---|---|
| `@nuxt/kit` | `>=3.0.0` |
| `@nuxt/schema` | `>=3.0.0` |
| `nuxt` | `>=3.0.0` |

В Vite-only проекте эти peer-deps опциональны и не подключаются.

> **Wave 2.1 (Issue 4):** `@nuxt/kit`/`@nuxt/schema` peer-range расширен `^4.1.2` → `>=3.0.0` — раньше major-pin `^4.1.2` ломал Nuxt 3 (хотя `nuxt` допускал `>=3.0.0`). Теперь модуль корректно ставится и в Nuxt 3 (`@nuxt/kit ^3.x`), и в Nuxt 4. Tested with Nuxt 3.x and 4.x.

Bundle: `dist/module/module.mjs`, `dist/plugins/Plugins.mjs`.

## 3. How it works

**Module pipeline** ([module/nuxt.ts:23–76](../../lib/module/nuxt.ts#L23-L76)):

1. `defineNuxtModule<FishtVueOptions>({ meta: { name: "fishtvue", configKey: "fishtvue", compatibility: { nuxt: ">=3.0.0" } } })` — регистрация.
2. `defaults: { prefix: "", autoImport: true, disableGlobalStyles: false }` — module-only поля.
3. `setup(options, nuxt)`:
   - `parentDir = join(dirname(__filename), "..")` — выходим в корень `lib/`.
   - `runtimeDir` добавляется в `nuxt.options.build.transpile` (для корректной обработки SFC) и алиас `#fishtvue` ([module/nuxt.ts:42–43](../../lib/module/nuxt.ts#L42-L43)).
   - При `autoImport: true` все 22 имени из `FISHT_VUE_COMPONENTS` ([module/nuxt.ts:79–102](../../lib/module/nuxt.ts#L79-L102)) регистрируются через `addComponent({ name: prefix + componentName, filePath: join(runtimeDir, toFlatCase(componentName)), global, mode })`.
   - `addPlugin({ src: "./plugins/nuxt.mjs", mode: "server" })` — server plugin.
   - `addPluginTemplate({ filename: "fishtvue.all.mjs", mode: "all", getContents })` — generated plugin, который импортирует `FishtVue` из `fishtvue/config` и вызывает `nuxtApp.vueApp.use(FishtVue, JSON.parse(<options>))`.
4. `MODULE_OPTIONS = ["global", "mode", "prefix", "autoImport", "disableGlobalStyles"]` — список ключей, отсекаемых при передаче в plugin (через `fieldsOmit`).

**Server plugin** ([plugins/nuxt.ts](../../lib/plugins/nuxt.ts)):

```ts
defineNuxtPlugin((nuxtApp: NuxtApp) => {
  if ((process as any).server && nuxtApp.ssrContext) {
    nuxtApp.hook("app:rendered", () => {
      cssComponents.forEach((style, component) => {
        nuxtApp.ssrContext?.head.push({
          style: { type: "text/css", "data-fishtvue-style-id": component, innerHTML: style }
        })
      })
    })
  }
})
```

— на сервере добавляет CSS-теги в head после рендера. На клиенте plugin no-op.

**SSR / hydration:**

- На сервере: компоненты при рендере вызывают `Component.setStyle()` → накапливают CSS в `cssComponents`. После рендера server plugin пушит CSS в head. Клиент получает HTML с inline `<style>`-тегами.
- На клиенте после hydration: `Component.__hooks()` снова вызывает `initStyle()` → `useStyle` создаёт ещё один `<style>`-тег. Получается дубль (но браузер дедупит идентичные правила).
- Hydration mismatch не возникает — DOM-разметка компонентов от стилей не зависит.

**Animation:** не применимо.

## 4. Quick Start

```bash
pnpm dlx nuxi@latest init my-app
cd my-app
pnpm add fishtvue
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"]
})
```

После этого:

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <Button mode="primary">Hello</Button>
  </div>
</template>
```

— `<Button>` доступен без import благодаря auto-import.

## 5. Props

Не применимо. Поля `ModuleOptions` ([module/index.d.ts:9–37](../../lib/module/index.d.ts#L9-L37)):

| Field | Type | Default | Description |
|---|---|---|---|
| `global` | `AddComponentOptions["global"]` | — | Передаётся в `addComponent` — компонент глобален (доступен в layouts и т.д.). |
| `mode` | `AddComponentOptions["mode"]` | — | `"all" \| "client" \| "server"`. Контролирует, где компонент рендерится. |
| `prefix` | `string` | `""` | Префикс для auto-import: `<MyButton>` вместо `<Button>` при `prefix: "My"`. |
| `autoImport` | `boolean` | `true` | Включает регистрацию 22 компонентов в auto-import. |
| `disableGlobalStyles` | `boolean` | `false` | Объявлен в типе, но реальная обработка распределена по компонентам. |

Все поля `FishtVueConfiguration` (см. [Config §5](./config.md#5-props)) тоже принимаются и пробрасываются в plugin.

`FishtVueOptions = FishtVueConfiguration & ModuleOptions` ([module/index.d.ts:43](../../lib/module/index.d.ts#L43)).

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

Из `fishtvue/module`:

| Name | Type | Description |
|---|---|---|
| `default export` | `NuxtModule<FishtVueOptions>` | Модуль для `modules: ["fishtvue/module"]`. |

Из `fishtvue/plugins/nuxt`:

| Name | Type | Description |
|---|---|---|
| `default export` | `Plugin` | Server-side Nuxt plugin. Регистрируется автоматически модулем — вручную подключать не нужно. |

Из `fishtvue/plugins`:

| Name | Type | Description |
|---|---|---|
| `nuxtInitPlugin` | namespace re-export of `fishtvue/plugins/nuxt` | Доступен для прямого импорта (например, для unit-тестов плагина). |

## 9. Examples

### 9.1 Минимальная установка

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"]
})
```

### 9.2 С опциями FishtVue

```ts
// nuxt.config.ts
import type { FishtVueOptions } from "fishtvue/module"

export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: {
    autoImport: true,
    optionsTheme: { nameTheme: "Sapphire", darkModeSelector: ".dark" },
    componentsOptions: {
      Button: { mode: "primary" }
    }
  } satisfies FishtVueOptions
})
```

### 9.3 Custom prefix

```ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: {
    prefix: "Fv"
    // <FvButton>, <FvInput>, ...
  }
})
```

### 9.4 Без auto-import

```ts
export default defineNuxtConfig({
  modules: ["fishtvue/module"],
  fishtvue: { autoImport: false }
})
```

В шаблоне — точечный импорт:

```vue
<script setup lang="ts">
import Button from "fishtvue/button"
</script>

<template><Button>Manual</Button></template>
```

## 10. Configuration & Customization

### 10.1 Global

Через `nuxt.config.ts#fishtvue`. См. §5.

### 10.2 Per-instance

Не применимо для module/plugin'а. Per-component override — через props.

### 10.3 Theming

Передаётся через `FishtVueOptions.theme` / `optionsTheme` — пробрасывается в plugin как есть. См. [Theme](./theme.md).

### 10.4 CSS layer override

`optionsTheme.layers` обрабатывается plugin'ом — модуль их не модифицирует. См. [Config §10.4](./config.md#104-css-layer-override).

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

Не применимо для module-уровня. Каждый компонент — на стороне SFC.

### Security

- Generated plugin сериализует `options` через `JSON.stringify(options)` ([module/nuxt.ts:68](../../lib/module/nuxt.ts#L68)). Строки в опциях не должны содержать `</script>` или подобных escape-патернов — рендерятся как литерал в `.mjs`.
- Server plugin пушит CSS в head через `innerHTML` ([plugins/nuxt.ts:14](../../lib/plugins/nuxt.ts#L14)) — содержимое `cssComponents` собирается изнутри библиотеки, не от пользовательского input. Risk surface ограничен.
- `runtimeDir` добавляется в `transpile` — Nuxt прогонит SFC через свой компилятор. Корректность зависит от Nuxt версии.

## 13. TypeScript

```ts
import type { FishtVueOptions } from "fishtvue/module"

const fishtvue: FishtVueOptions = {
  autoImport: true,
  prefix: "",
  optionsTheme: { nameTheme: "Aurora" }
}
```

Module расширяет `NuxtConfig`/`NuxtOptions` через augmentation ([module/index.d.ts:44–51](../../lib/module/index.d.ts#L44-L51)) — поле `fishtvue` типизировано в `defineNuxtConfig` автоматически после установки.

## 14. Compatibility & Stability

- **Nuxt:** `>=3.0.0` декларировано через `compatibility.nuxt`. Реально протестировано — Nuxt 3.x. Nuxt 4 — экспериментально (детект `isNuxt4()` присутствует, но используется только для `importPath`-выбора, и текущая ветка возвращает `"#app"` в обоих случаях).
- **`@nuxt/kit` / `@nuxt/schema`:** `>=3.0.0` optional peer (Wave 2.1 — раньше `^4.1.2`, ломал Nuxt 3). Tested with Nuxt 3.x and 4.x.
- **Stability flag:** `stable` (для Nuxt 3); Nuxt 4 — `beta`.
- **Breaking changes:** не зафиксировано в публичном API между 0.2.x.
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

В пакетах `lib/module/` и `lib/plugins/` собственных тестов нет (coverage 0%). Проверка — интеграционно через `sandbox-nuxt`:

```bash
pnpm --filter sandbox-nuxt dev
```

Для unit-тестирования компонентов в Nuxt-окружении используй `@nuxt/test-utils`:

```ts
import { setup, useTestContext } from "@nuxt/test-utils/e2e"

await setup({
  rootDir: "path/to/nuxt-app",
  server: true
})
```

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Auto-import не работает | `autoImport: false` или `prefix` конфликтует с другим модулем. | Проверь `nuxt.config.ts#fishtvue.autoImport`. |
| `Cannot find module "fishtvue/module"` | Pre-install: модуль перечислен в `nuxt.config.ts`, но `fishtvue` ещё не в `node_modules`. | `pnpm add fishtvue` затем перезапусти `nuxi`. |
| CSS не появляется в HTML на сервере | Server plugin не запустился — возможно, проблема `(process as any).server` детекта в Nuxt 4 (у Nuxt 4 рекомендуется `import.meta.server`). | Проверь head-вывод: `view-source:`; см. Known issues. |
| Опции не применяются | Передаются через `fishtvue:` ключ, но не доходят до plugin'а. | Проверь, что `MODULE_OPTIONS` ([module/nuxt.ts:78](../../lib/module/nuxt.ts#L78)) не содержит твой ключ — иначе он отфильтруется. |
| Конфликт двух SSR-инжекций | Server plugin + клиентский `useStyle` дают два `<style>`-блока. | Браузер дедупит идентичные правила; визуально разницы нет. |
| Nuxt v3 vs v4 — поведение auto-import | В Nuxt 4 поведение `addComponent` слегка отличается, особенно для layered проектов. | Тестируй в reference-app. См. Known issues. |

## 17. Related

- [01-getting-started.md](../01-getting-started.md) — общий обзор.
- [02-installation.md](../02-installation.md) — установка для Vite/Nuxt.
- [architecture/config.md](./config.md) — `FishtVueConfiguration`, который module пробрасывает в plugin.
- [architecture/component-class.md](./component-class.md) — `cssComponents: Map`, из которого server plugin читает CSS.
- [playgrounds.md](../playgrounds.md) — `sandbox-nuxt` для интеграционной проверки.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [module/nuxt.ts](../../lib/module/nuxt.ts), [plugins/nuxt.ts](../../lib/plugins/nuxt.ts), [plugins/Plugins.ts](../../lib/plugins/Plugins.ts) не зафиксировано. Имеются 2 `// @ts-ignore` ([plugins/Plugins.d.ts:4](../../lib/plugins/Plugins.d.ts#L4), [plugins/nuxt.ts:12](../../lib/plugins/nuxt.ts#L12)) — обходы типовых проблем.

### Incomplete or stubbed behavior

- `getNuxtVersion()` ([module/nuxt.ts:10–17](../../lib/module/nuxt.ts#L10-L17)) при отсутствии `nuxt/package.json` возвращает захардкоженное `"4.0.0"`. В окружении без Nuxt вызов модуля даёт ложное «Nuxt 4 detected».
- В [module/nuxt.ts:62](../../lib/module/nuxt.ts#L62) `importPath` всегда `"#app"` независимо от `isV4`. Условный код есть, поведение — единственное.
- `disableGlobalStyles` объявлен в `ModuleOptions` ([module/index.d.ts:36](../../lib/module/index.d.ts#L36)), но в `setup` не обрабатывается — флаг dead для модуля.
- `lib/plugins/Plugins.ts` ([plugins/Plugins.ts](../../lib/plugins/Plugins.ts)) — re-export `nuxtInitPlugin` через `import` namespace + default `{ nuxtInitPlugin }`. Использование `Plugins.ts` снаружи библиотеки сомнительно — реальный entry для Nuxt — server plugin через addPlugin.

### Skipped tests

В пакете нет собственных тест-файлов.

### API inconsistencies

- `MODULE_OPTIONS = ["global", "mode", "prefix", "autoImport", "disableGlobalStyles"]` — захардкоженный массив. При добавлении нового поля в `ModuleOptions` нужно обновлять вручную.
- `(process as any).server` в [plugins/nuxt.ts:6](../../lib/plugins/nuxt.ts#L6) — устаревший подход. Канон Nuxt 3.10+: `import.meta.server`. В Nuxt 4 `process` тоже работает, но не гарантировано.
- `@ts-ignore` в [plugins/Plugins.d.ts:4](../../lib/plugins/Plugins.d.ts#L4) и [plugins/nuxt.ts:12](../../lib/plugins/nuxt.ts#L12) скрывают типовые расхождения с `@nuxt/schema`.
- `prefix: ""` (пустая строка) — техника для отсутствия префикса; type не запрещает `undefined`. Defaults считают, что `prefix` всегда присутствует.

### Behavioral caveats

- `prefix` применяется только к auto-import (`addComponent`). При точечном импорте `fishtvue/{name}` — игнорируется.
- При `autoImport: false` server plugin всё равно подключается. Если нужно полностью отключить — придётся форкать модуль.
- `addPluginTemplate` сериализует `options` через `JSON.stringify` — функции и Symbol'ы потеряются. Передавай только plain-data.
- В Nuxt 4 `addComponent` поведение для layered/extends-проектов может отличаться — проверяй в production.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
