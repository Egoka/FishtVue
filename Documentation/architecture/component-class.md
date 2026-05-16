---
title: Component class
summary: Базовый класс Component<T>, lifecycle, инжекция стилей, getOptions/t/setStyle.
updated: 2026-05-16
stability: stable
since: 0.2.11
---

# Component class

## 1. Overview

`Component<T>` — внутренний базовый класс, инстанцируемый каждым SFC из `lib/`. Он связывает компонент с активным `FishtVue` instance: резолвит `componentsOptions[T]`, читает локаль, инжектит стили в `@layer fishtvue`. Без `Component<T>` компонент не получит global config, локализацию и не интегрируется в общую CSS-инфраструктуру.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/component/index.ts](../../lib/component/index.ts), [lib/component/TypeComponent.d.ts](../../lib/component/TypeComponent.d.ts), [lib/component/Component.test.ts](../../lib/component/Component.test.ts).

## 2. How it's organized

```
lib/component/
├── index.ts            # реализация Component<T>
├── TypeComponent.d.ts  # внешние типы: Component, NamesComponents, PublicFields, StylesComponent, setStyleOptions
├── Component.test.ts   # 19 кейсов (Vitest)
└── package.json        # main "./component.mjs", types "./TypeComponent.d.ts"
```

Внутренние зависимости:

- [theme.tailwind](../../lib/theme/uno.ts), [theme.useStyle](../../lib/theme/helpers/useStyle.ts) — инжекция стилей.
- [utils/tailwindHandler.cn](../../lib/utils/tailwindHandler.ts) — слияние классов через `clsx + tailwind-merge`.
- [utils/stringHandler.toKebabCase](../../lib/utils/stringHandler.ts) — нормализация имени компонента в селектор.
- [utils/objectHandler.fieldsPick](../../lib/utils/objectHandler.ts), `get` — публичные хелперы.
- [utils/domHandler.isClient](../../lib/utils/domHandler.ts), `minifyCSS` — SSR guard и компрессия CSS.
- [utils/uniqueCollection.UniqueKeySetCollection](../../lib/utils/uniqueCollection.ts) — внутренние реестры стилей.
- [config](../../lib/config/index.ts) — `FishtVue` instance.
- [locale](../../lib/locale/index.ts) — `Locales`, `DefaultMessages`.

Внешние зависимости отсутствуют (всё через `vue` и `fishtvue/*`). Bundle: компилируется в `dist/component/component.mjs`.

## 3. How it works

При `new Component<T>(name?)` ([component/index.ts:65–77](../../lib/component/index.ts#L65-L77)):

1. Через `getCurrentInstance()` сохраняется `__instance: ComponentInternalInstance | null`.
2. Из `__instance.appContext.config.globalProperties.$fishtVue` достаётся global config. Fallback на `(window as any).FishtVue` — для случаев, когда нет inject-контекста.
3. Кэшируются `__globalLocale`, `__globalOptionsTheme`, `__componentsStyle`.
4. `name` берётся из аргумента; если опущен — из `__instance?.type.__name` (имя SFC).
5. `prefix` — из `optionsTheme.prefix` или `"fishtvue"` по умолчанию.
6. `__options = $fishtVue.getOptions(name)` — frozen-копия `componentsOptions[name]`.
7. `__hooks()` регистрирует `onServerPrefetch(() => initStyle())` и `vueOnMounted(() => initStyle())` — стили инициализируются автоматически. **Это единственный источник вызова `initStyle()` на mount/SSR-prefetch.** Дополнительный ручной `onMounted(() => X.initStyle())` в SFC — антипаттерн (двойная инициализация), см. [dev-patterns.md §2 row 1](../dev-patterns.md#2-decisions). Wave 2.3 sweep (2026-05-16) убрал все ручные дубликаты из 6 SFC; в чистых SFC стоит comment-marker, фиксирующий канон.

Шаги стилизации:

1. Внутри computed/SFC: `Button.setStyle([tw-классы])`.
2. `cn(stylesComp)` (из `tailwindHandler`) сливает массив через `clsx + tailwind-merge`.
3. Каждый класс конвертится в CSS через `tailwind(item, { selector: ".fv-{name}", darkSelector })`.
4. Уникальный CSS добавляется в `listOfCssComponents` (per-component реестр).
5. `__setStyle()` собирает массив CSS, сортирует @media в конец, минифицирует через `minifyCSS` (если не выставлен `isNotMinifyCSS`), и вызывает `useStyle(css, { name })` для инжекции.
6. `useStyle` создаёт/обновляет `<style>`-элемент в `<head>`. SSR guard через `isClient()`.

**SSR / hydration:**

- На сервере вызывается `onServerPrefetch(() => initStyle())` — собирает CSS строки в `cssComponents: Map<NamesComponents, string>`.
- На клиенте `useStyle()` инжектит `<style>` через `domHandler`. Hydration mismatch не возникает, так как контент компонента не зависит от `Component`-инстанса (только классы).

**Animation / transitions:** базовый класс анимаций не предоставляет. Анимации — на стороне SFC (CSS `transition`, GSAP, Vue `<Transition>`).

## 4. Quick Start

```vue
<script setup lang="ts">
import { computed } from "vue"
import Component from "fishtvue/component"

const MyComponent = new Component<"Button">()
const options = MyComponent.getOptions()

const classBase = computed(() =>
  MyComponent.setStyle([
    "rounded inline-flex items-center px-4 py-2",
    options?.class ?? ""
  ])
)
</script>

<template>
  <button :class="classBase"><slot /></button>
</template>
```

Note: тип-параметр `T extends keyof ComponentsOptions` — обязан совпадать с одним из ключей `ComponentsOptions`. Для базовых служебных нужд используется `Component<"BaseComponent">` ([component/TypeComponent.d.ts:5](../../lib/component/TypeComponent.d.ts#L5)).

## 5. Props

Не применимо — это класс, не компонент. Параметры конструктора:

| Param | Type | Description |
|---|---|---|
| `name` | `T extends keyof ComponentsOptions \| undefined` | Имя компонента из `ComponentsOptions`. Если не передано — берётся из `__instance.type.__name`. |

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `name` | `T \| undefined` | readonly. Имя компонента. |
| `prefix` | `string \| undefined` | readonly. Префикс CSS-класса. По умолчанию `"fishtvue"`. |
| `onBeforeMount(hook)` | `(hook: (instance: Pick<this, PublicFields>) => any) => void` | Lifecycle hook. Получает self с публичными полями. |
| `onMounted(hook)` | то же | |
| `onBeforeUpdate(hook)` | то же | |
| `onUpdated(hook)` | то же | |
| `onBeforeUnmount(hook)` | то же | |
| `onUnmounted(hook)` | то же | |
| `getOptions()` | `() => ComponentsOptions[T] \| undefined` | Frozen-копия `componentsOptions[name]`. |
| `getPrefix()` | `() => string \| undefined` | Возвращает `prefix`. |
| `initStyle(stylesComp?)` | `(stylesComp?: StylesComponent) => void` | Применяет накопленный CSS через `useStyle`. Авто-вызывается из `__hooks()` на mount/SSR-prefetch. |
| `setStyle<T>(stylesComp, options?)` | `(stylesComp: T \| T[], options?: setStyleOptions) => string` | Главный API: преобразует tw-классы в CSS, добавляет в реестр и возвращает `"fv {prefix}-{kebab-name} {merged-classes}"` для `:class=`. |
| `t(key)` | `(key: keyof DefaultMessages \| string) => string \| undefined` | Локализация через `getActiveLocale()` + `messages[locale][key]`. Поддерживает dot-path (`"button.label"`). |
| `componentsStyle()` | `() => StyleMode \| undefined` | Возвращает `componentsStyle` из global config: `"filled" \| "outlined" \| "underlined"`. |

`PublicFields` ([TypeComponent.d.ts:89–100](../../lib/component/TypeComponent.d.ts#L89-L100)) — список ключей, доступных в lifecycle-хуке: `name`, `prefix`, `onBefore*`, `on*`, `getOptions`, `getPrefix`, `initStyle`. `setStyle` и `t` через хук не пробрасываются.

## 9. Examples

### 9.1 Простой компонент

```vue
<script setup lang="ts">
import Component from "fishtvue/component"
const X = new Component<"Badge">()
const options = X.getOptions()
</script>
```

### 9.2 С setStyle

```vue
<script setup lang="ts">
import { computed } from "vue"
import Component from "fishtvue/component"

const X = new Component<"Button">()
const options = X.getOptions()

const cls = computed(() => X.setStyle(["px-4 py-2 rounded", options?.class ?? ""]))
</script>

<template>
  <button :class="cls">click</button>
</template>
```

### 9.3 Локализация

```vue
<script setup lang="ts">
import Component from "fishtvue/component"

const X = new Component<"Pagination">()
const labelOf = X.t("of")
const labelItems = X.t("items")
</script>

<template>
  <span>{{ labelOf }} 100 {{ labelItems }}</span>
</template>
```

### 9.4 Lifecycle hooks через класс

```vue
<script setup lang="ts">
import Component from "fishtvue/component"

const X = new Component<"Dialog">()
X.onMounted((instance) => {
  console.log("Dialog mounted, name:", instance.name)
})
X.onBeforeUnmount(() => {
  // cleanup
})
</script>
```

## 10. Configuration & Customization

### 10.1 Global

`Component` читает три объекта из `FishtVue`:

- `componentsOptions[name]` — через `getOptions()`.
- `optionsTheme.prefix` — для CSS-класса.
- `optionsTheme.darkModeSelector` — для генерации dark-классов.
- `optionsTheme.layers` — дополнительные `@layer`.
- `optionsTheme.isNotMinifyCSS` — отключение `minifyCSS`.
- `componentsStyle` — глобальный `StyleMode`.
- `locale.activeLocale` + `locale.messages` — для `t()`.

### 10.2 Per-instance

Параметр конструктора `name?: T` явно задаёт имя. По дефолту имя берётся из `__instance.type.__name` — поэтому SFC-имя должно совпадать с ключом `ComponentsOptions`.

### 10.3 Theming

Класс не задаёт темы; темизация приходит через token-инфраструктуру [Theme](./theme.md).

### 10.4 CSS layer override

Переданный `layers` обрабатывается в `__stylesBase`:

```ts
layers && layers.length
  ? `@layer ${layers}; @layer fishtvue { ${css} }`
  : css
```

См. [Theme §10.4](./theme.md#104-css-layer-override).

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

Класс не вносит a11y-атрибутов. Наследуется semantics корневого DOM-узла SFC.

### Security

- Инжекция через `useStyle` создаёт `<style>` element. Требует `style-src 'unsafe-inline'` или nonce в CSP. Опциональный `nonce` поддерживается через `StyleOptions.nonce` ([Theme.d.ts:182](../../lib/theme/Theme.d.ts#L182)) — но `Component.__setStyle()` его не пробрасывает (см. Known issues).
- Нет `eval`, `new Function`, динамических импортов.
- `cssComponents: Map<NamesComponents, string>` — глобальная мапа без TTL, может расти (за счёт уникальных tw-комбинаций).

## 13. TypeScript

```ts
import Component from "fishtvue/component"
import type { PublicFields, StylesComponent, setStyleOptions } from "fishtvue/component"

// Типизированный класс
const X = new Component<"Button">()

// Lifecycle hook
X.onMounted((instance) => {
  // instance: Pick<Component<"Button">, PublicFields>
  instance.getOptions()
})

// setStyle с options
X.setStyle(["px-2", "py-1"], { selector: ".my-scope ", isBaseClasses: true })
```

`NamesComponents = keyof ComponentsOptions | "BaseComponent"` ([TypeComponent.d.ts:5](../../lib/component/TypeComponent.d.ts#L5)).

## 14. Compatibility & Stability

- **Vue:** `^3.5.x` (использует `getCurrentInstance`, `onServerPrefetch`, lifecycle hooks Composition API).
- **TypeScript:** строгий generic вывод требует `T extends keyof ComponentsOptions`.
- **Stability flag:** `stable`.
- **Breaking changes:** не зафиксировано в публичном API класса между 0.2.x.
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

Тесты — [Component.test.ts](../../lib/component/Component.test.ts) (19 кейсов). Wave 2.3 (2026-05-16) добавил 4 it-блока: SSR/client hook registration coverage, idempotence `initStyle()`, fallback chain на `window.FishtVue`, graceful no-config.

Минимальный кейс:

```ts
import { mount } from "@vue/test-utils"
import { defineComponent } from "vue"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Component from "fishtvue/component"

describe("Component class", () => {
  it("resolves options through plugin", () => {
    const Test = defineComponent({
      name: "Button",
      setup() {
        const X = new Component<"Button">()
        return { options: X.getOptions() }
      },
      template: "<div></div>"
    })

    const wrapper = mount(Test, {
      global: {
        plugins: [[FishtVue, { componentsOptions: { Button: { mode: "primary" } } }]]
      }
    })

    expect((wrapper.vm as any).options).toEqual({ mode: "primary" })
  })
})
```

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `getOptions()` возвращает `undefined` | Plugin не установлен или name не совпадает с ключом `ComponentsOptions`. | `app.use(FishtVue, {})` + проверь, что `name` в `new Component<"X">()` есть в `ComponentsOptions`. |
| `setStyle` возвращает класс, но стили не применяются | `useStyle` не нашёл `<head>` (SSR). | Стили инжектятся только на клиенте — на сервере класс возвращается, но `<style>` не создаётся. На клиенте после hydration стиль появится. |
| `name` отображается как `undefined` | SFC без `defineOptions({ name: "X" })` или без аргумента в `new Component<"X">()`. | Передай явно: `new Component<"X">("X")`. |
| `t()` всегда возвращает `undefined` | Нет ключа в `locale.messages[activeLocale]` или активная локаль не соответствует messages. | Проверь конфиг плагина и `getActiveLocale()`. |
| Custom layers не применяются | `optionsTheme.layers` не передан. | Передай: `app.use(FishtVue, { optionsTheme: { layers: "reset, base" } })`. |

## 17. Related

- [architecture/config.md](./config.md) — Vue plugin, который создаёт глобальный `FishtVue` instance.
- [architecture/theme.md](./theme.md) — `useStyle`, `tailwind`, `linksTheme`.
- [architecture/locale.md](./locale.md) — структура `messages` для `t()`.
- [dev-patterns.md](../dev-patterns.md) — §4 SFC pattern, §5 Type pattern.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [component/index.ts](../../lib/component/index.ts) и [TypeComponent.d.ts](../../lib/component/TypeComponent.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- `__setStyle` не пробрасывает `nonce` в `useStyle`, хотя `StyleOptions.nonce` поддерживается ([Theme.d.ts:182](../../lib/theme/Theme.d.ts#L182)). При жёстком CSP без `'unsafe-inline'` это блокер.

### Skipped tests

В [Component.test.ts](../../lib/component/Component.test.ts) на момент ревизии (2026-05-09) `it.skip`/`xit`/`xdescribe` не зафиксировано.

### API inconsistencies

- `setStyle` и `t` не входят в `PublicFields` ([TypeComponent.d.ts:89–100](../../lib/component/TypeComponent.d.ts#L89-L100)) — внутри lifecycle-хука их вызвать через `instance` нельзя. Это может удивить, если консумер ожидает доступ к `setStyle` из `onMounted(hook)`-callback'а.
- `name` в `TypeComponent.d.ts` — `T extends keyof ComponentsOptions`, но реализация принимает `name?: T` опционально и резолвит из `__instance.type.__name`. Если SFC имеет `defineOptions({ name: "Custom" })` с именем вне `ComponentsOptions`, тип `name` будет `undefined`.

### Behavioral caveats

- `Component.__hooks()` вызывает `initStyle()` и на `onServerPrefetch`, и на `onMounted` — на клиенте после SSR это двойная инициализация. Ручной `onMounted(() => X.initStyle())` в SFC давал бы **третий** вызов; Wave 2.3 (2026-05-16) убрал все такие дубликаты из 6 SFC (Button, Icons, InputLayout × 2, Menu, Separator, Table). См. [dev-patterns.md §2 row 1](../dev-patterns.md#2-decisions).
- `cssComponents: Map` — растёт по мере уникальных классов. Без TTL и cleanup. На long-running приложениях с тысячами разных динамических классов память будет расти.
- `FishtVueSymbol` пере-инициализируется при каждом `app.use(FishtVue, ...)` — `Component`-инстанс, созданный между установками, может ссылаться на старый instance.
- Fallback на `window.FishtVue` ([component/index.ts:68](../../lib/component/index.ts#L68)) ломается в multi-instance/multi-app сценариях и в SSR.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
