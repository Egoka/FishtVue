---
title: Locale
summary: Структура Locales/Messages, встроенные en/ru, setActiveLocale, расширение. Optional validation keys для интеграции с rulesHandler.
updated: 2026-05-10
stability: stable
since: 0.2.11
---

# Locale

## 1. Overview

`fishtvue/locale` — встроенные сообщения (en, ru) и тип-инфраструктура для локализации компонентов. Активная локаль читается через `Component.t(key)` или глобально через `getActiveLocale()`/`setActiveLocale()`. Локаль — часть `FishtVue.config`, мерджится с пользовательской при `app.use(FishtVue, ...)`.

Stability: `stable`. Описание соответствует версии 0.2.11.

Source: [lib/locale/index.ts](../../lib/locale/index.ts), [lib/locale/TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts), [lib/locale/locales/en.ts](../../lib/locale/locales/en.ts), [lib/locale/locales/ru.ts](../../lib/locale/locales/ru.ts).

## 2. How it's organized

```
lib/locale/
├── index.ts              # default export { en, ru }
├── TypesLocale.d.ts      # NameLocale, Locale, Locales, Messages, DefaultMessages
├── locales/
│   ├── en.ts             # английские сообщения
│   └── ru.ts             # русские сообщения
└── package.json          # main "./locale.mjs", types "./TypesLocale.d.ts"
```

Внутренние зависимости — нет (только `fishtvue/types.DeepPartial`).
Внешние зависимости — нет.

Bundle: `dist/locale/locale.mjs`. Размер минимальный — текстовые объекты.

## 3. How it works

`FishtVue.config.locale: Locales` ([TypesLocale.d.ts:30–35](../../lib/locale/TypesLocale.d.ts#L30-L35)):

```ts
type Locales = Partial<{
  defaultLocale: NameLocale
  activeLocale: NameLocale
  locales: Array<Locale>
  messages: Messages
}>
```

`Messages = DeepPartial<Record<NameLocale, DefaultMessages>>` ([TypesLocale.d.ts:28](../../lib/locale/TypesLocale.d.ts#L28)).

**Установка:**

1. На `app.use(FishtVue, { locale: { ... } })` пользовательский `locale` мерджится с дефолтным:

```ts
{
  defaultLocale: "en",
  messages: { en: enMessages, ru: ruMessages }
}
```

2. После мержа `activeLocale ??= defaultLocale` ([config/index.ts:120–122](../../lib/config/index.ts#L120-L122)).

**Чтение:**

- `Component.t(key)` ([component/index.ts:183–192](../../lib/component/index.ts#L183-L192)):
  1. `getActiveLocale()` — текущая локаль.
  2. `messages[activeLocale]` — подмножество сообщений.
  3. `get(messages, key)` ([utils/objectHandler.get](../../lib/utils/objectHandler.ts)) — поддержка dot-path: `"button.label"`.
  4. Возвращает `string | undefined`. Не-строки фильтруются.

**Переключение:**

- `setActiveLocale(name)` мутирует `FishtVue.config.locale.activeLocale`. Все computed/watchers, опирающиеся на `t()`, отреагируют — `config` обёрнут в `reactive()`.

**SSR / hydration:**

- Локаль на сервере и клиенте должна быть одинаковой во избежание hydration mismatch текстов. Если приложение детектирует язык по `Accept-Language`, передавай `defaultLocale` в опции plugin'а до mount.
- На клиенте `setActiveLocale` после mount триггерит реактивный re-render — это после-hydration изменение, не конфликт.

**Animation:** не применимо.

## 4. Quick Start

```ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"

createApp(App)
  .use(FishtVue, {
    locale: {
      defaultLocale: "ru"
    }
  })
  .mount("#app")
```

```vue
<script setup lang="ts">
import { setActiveLocale, getActiveLocale } from "fishtvue/config"

function toggle() {
  setActiveLocale(getActiveLocale() === "ru" ? "en" : "ru")
}
</script>
```

## 5. Props

Не применимо. Поля `Locales`:

| Field | Type | Default | Description |
|---|---|---|---|
| `defaultLocale` | `NameLocale` | `"en"` | Локаль по умолчанию. |
| `activeLocale` | `NameLocale` | `defaultLocale` | Активная локаль (мутируется через `setActiveLocale`). |
| `locales` | `Array<Locale>` | — | Список с meta (name, code) — справочный. |
| `messages` | `Messages` | `{ en, ru }` (default) | Объект сообщений по ключу локали. |

`Locale` ([TypesLocale.d.ts:4–7](../../lib/locale/TypesLocale.d.ts#L4-L7)): `Partial<{ name: string, code: NameLocale }>`.

`NameLocale = string | "en" | "ru"` ([TypesLocale.d.ts:3](../../lib/locale/TypesLocale.d.ts#L3)) — открытый union: можно использовать любую строку, но `"en"` и `"ru"` гарантированно встроены.

`DefaultMessages` ([TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts)) — набор ключей UI и валидации:

| Key | Required | Use case |
|---|---|---|
| `of` | required | Pagination: «10 of 100» |
| `items` | required | Pagination, Table |
| `lines` | required | Table |
| `previous` / `next` | required | Pagination |
| `save` | required | Form submit |
| `increase` | required | Counter |
| `show` | required | «Show: 10» selector |
| `find` | required | Search inputs |
| `copy` | required | Copy-button tooltip |
| `requiredField` | required | Validation: required rule |
| `noData` | required | Table empty state |
| `noColumn` | required | Table no columns |
| `noDataForQuery` | required | Table search empty |
| `clearAllFilters` | required | Table filter reset |
| `invalidEmail` | optional | Validation: email rule |
| `invalidPhone` | optional | Validation: phone rule |
| `invalidNumeric` | optional | Validation: numeric rule |
| `regexMismatch` | optional | Validation: regular rule |
| `valueOutOfRange` | optional | Validation: range rule |
| `invalidLength` | optional | Validation: length rule |
| `invalidField` | optional | Validation: async / custom rule |
| `compareMismatch` | optional | Validation: compare rule |

Optional ключи добавлены 2026-05-10 в связке с `setDefaultRuleMessages` ([utilities/rulesHandler.md §10](../utilities/rulesHandler.md#10-configuration--customization)) — можно мапить эти ключи на `t()` для локализации валидации.

`DefaultMessages extends DeepPartial<TypeLocale>` — допустимы вложенные строки/массивы строк.

## 6. Events / Emits + v-model contract

Не применимо.

## 7. Slots

Не применимо.

## 8. Exposed methods

Из `fishtvue/config`:

| Name | Type | Description |
|---|---|---|
| `setActiveLocale(name)` | `(NameLocale) => string \| boolean \| undefined` | Меняет `activeLocale`. |
| `getActiveLocale()` | `() => string \| undefined` | Текущая активная локаль. |
| `getDefaultLocale()` | `() => string \| undefined` | Локаль по умолчанию. |

Из `fishtvue/component`:

| Name | Type | Description |
|---|---|---|
| `Component.t(key)` | `(key: keyof DefaultMessages \| string) => string \| undefined` | Возвращает строку для текущей локали. Поддерживает dot-path. |

Из `fishtvue/locale` (default export):

| Name | Type | Description |
|---|---|---|
| `Locales` | `{ en: DefaultMessages, ru: DefaultMessages }` | Default messages. Можно импортировать для расширения. |

## 9. Examples

### 9.1 Использование в компоненте

```vue
<script setup lang="ts">
import Component from "fishtvue/component"

const X = new Component<"Pagination">()
const labelOf = X.t("of")
const labelItems = X.t("items")
</script>

<template>
  <span>{{ currentPage }} {{ labelOf }} {{ totalPages }} {{ labelItems }}</span>
</template>
```

### 9.2 Расширение существующей локали

```ts
import FishtVue from "fishtvue/config"
import Locales from "fishtvue/locale"

app.use(FishtVue, {
  locale: {
    defaultLocale: "ru",
    messages: {
      en: {
        ...Locales.en,
        custom: { greeting: "Hello" }
      },
      ru: {
        ...Locales.ru,
        custom: { greeting: "Привет" }
      }
    }
  }
})
```

В компоненте:

```ts
const X = new Component<"Form">()
const greeting = X.t("custom.greeting")
```

### 9.3 Добавление новой локали

```ts
import FishtVue from "fishtvue/config"
import Locales from "fishtvue/locale"

const fr = {
  ...Locales.en,
  of: "de",
  items: "éléments",
  previous: "Précédent",
  next: "Suivant"
}

app.use(FishtVue, {
  locale: {
    defaultLocale: "fr",
    messages: {
      en: Locales.en,
      ru: Locales.ru,
      fr
    }
  }
})
```

### 9.4 Runtime-переключение

```vue
<script setup lang="ts">
import { setActiveLocale, getActiveLocale } from "fishtvue/config"
import { ref } from "vue"

const current = ref(getActiveLocale())

function pick(name: "en" | "ru") {
  setActiveLocale(name)
  current.value = getActiveLocale()
}
</script>

<template>
  <button @click="pick('en')">EN</button>
  <button @click="pick('ru')">RU</button>
  <p>Active: {{ current }}</p>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

Через `FishtVueConfiguration.locale`. См. §5.

### 10.2 Per-instance

Не применимо — локаль одна на приложение.

### 10.3 Theming

Не применимо.

### 10.4 CSS layer override

Не применимо.

## 11. Form integration & validation

Сообщения валидации (`requiredField` и т.д.) читаются через `t()` из соответствующего компонента. Подробнее — [components/form.md](../components/form.md) и [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 12. Accessibility & Security

### A11y

- Поддержка `lang`-атрибута на корневом элементе приложения — на стороне консумера. FishtVue не выставляет `<html lang>` автоматически.
- Для screen-reader-friendly текста ARIA-меток — используй `t()` ключи.

### Security

- Сообщения — статические строки, мутации через `setActiveLocale` ограничены типом `NameLocale` (открытый union — но в `messages` ключ должен присутствовать).
- Нет HTML-рендеринга — `t()` возвращает чистую строку. Для HTML-сообщений потребуется отдельное решение на стороне консумера (с собственной sanitization-логикой через `sanitize-html`/DOMPurify).

## 13. TypeScript

```ts
import type { NameLocale, Locales, Messages, DefaultMessages } from "fishtvue/locale/TypesLocale"
import Locales_default from "fishtvue/locale"

const locale: Locales = {
  defaultLocale: "en",
  messages: {
    en: Locales_default.en,
    ru: Locales_default.ru
  }
}
```

`DefaultMessages` — структурный тип; для строгой проверки своих ключей используй `interface` extension:

```ts
interface MyMessages extends DefaultMessages {
  custom: { greeting: string }
}
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x` (используется `reactive()` из Vue для локали).
- **Stability flag:** `stable`.
- **Breaking changes:** не зафиксировано в публичном типе `DefaultMessages` между 0.2.x.
- **Deprecations:** на момент ревизии (2026-05-09) `@deprecated`-меток нет.

## 15. Testing recipes

В пакете `lib/locale/` отдельных тестов нет. Поведение проверяется через тесты компонентов, использующих `t()`.

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue, { setActiveLocale } from "fishtvue/config"
import Pagination from "fishtvue/pagination/Pagination.vue"

describe("Pagination locale", () => {
  it("renders Russian labels when activeLocale = ru", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [[FishtVue, { locale: { defaultLocale: "ru" } }]]
      }
    })
    expect(wrapper.text()).toContain("Предыдущая") // или "Назад" — точный текст из ru.ts
  })
})
```

(Точные строки — [locale/locales/ru.ts](../../lib/locale/locales/ru.ts).)

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `t()` возвращает `undefined` | Ключа нет в `messages[activeLocale]`. | Добавь ключ в локаль или fallback в SFC: `X.t("key") ?? "fallback"`. |
| После `setActiveLocale("xx")` ничего не изменилось | `messages.xx` не определён. | Передай `messages: { xx: {...} }` в plugin. |
| Hydration mismatch для текстов | Сервер и клиент разрешили разные `activeLocale`. | Установи `defaultLocale` детерминированно (например, из cookie/header) до `app.mount()`. |
| Ключи `rows` / `clear` есть в en.ts, но нет в `DefaultMessages` | Локали содержат расширения сверх `DefaultMessages` без обновления типа. | См. Known issues — это API inconsistency. |
| `getActiveLocale()` возвращает `undefined` | Plugin не установлен. | Установи через `app.use(FishtVue, ...)`. |

## 17. Related

- [architecture/component-class.md](./component-class.md) — `Component.t(key)`.
- [architecture/config.md](./config.md) — `FishtVueConfiguration.locale`.
- [components/pagination.md](../components/pagination.md), [components/table.md](../components/table.md) — основные потребители ключей `DefaultMessages`.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в `lib/locale/` не зафиксировано.

### Incomplete or stubbed behavior

- В [locale/index.ts](../../lib/locale/index.ts) только default export. Нет именованных экспортов — потребитель не может сделать `import { en } from "fishtvue/locale"`. Используется `import Locales from "fishtvue/locale"; Locales.en`.
- Coverage `lib/locale/` — 0%; тестируется только косвенно.

### Skipped tests

В пакете нет собственных тест-файлов — нет skip'ов.

### API inconsistencies

- `en.ts` содержит ключи `rows`, `clear` ([locale/locales/en.ts:10, 15](../../lib/locale/locales/en.ts)), которые **не объявлены** в `DefaultMessages` ([TypesLocale.d.ts:10–26](../../lib/locale/TypesLocale.d.ts#L10-L26)). TypeScript принимает это, потому что `DefaultMessages extends DeepPartial<TypeLocale>` допускает дополнительные ключи. Но контракт типа неполный — потребитель не получит autocomplete для `t("rows")`.
- `Locale` тип ([TypesLocale.d.ts:4–7](../../lib/locale/TypesLocale.d.ts#L4-L7)) объявлен, но `Locales.locales: Array<Locale>` нигде в реальном коде не заполняется — поле dead-ish.
- `NameLocale = string | "en" | "ru"` — open union превращается в `string`. Заявленный narrow на `"en" | "ru"` не работает на уровне типов. Если нужна строгая проверка локалей — оборачивай в свой union.

### Behavioral caveats

- `Component.t()` возвращает `undefined` при отсутствии ключа, а не fallback на `defaultLocale`. Если хочешь fallback — реализуй на стороне SFC или через wrapper.
- При `setActiveLocale(name)` если `messages[name]` не существует, реактивность сработает, но `t()` начнёт возвращать `undefined`. Нет встроенной валидации существования локали.
- Default messages импортируются из `lib/locale/locales/{en,ru}.ts` напрямую; если bundler не корректно tree-shake'ит, ru может попасть в bundle даже при использовании только en.

### Bug report format

См. [01-getting-started.md §18](../01-getting-started.md#18-known-issues--limitations).
