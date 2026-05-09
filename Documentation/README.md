# FishtVue — внутренняя техническая документация

Этот каталог содержит **внутреннюю** техническую документацию пакета `fishtvue` для контрибьюторов и глубокого технического справочника. Канон извлекается только из [lib/](../lib). Публичное руководство пользователя живёт отдельно — [fisht.org](https://fisht.org) (исходники в [docs/](../docs)).

Документация ведётся на русском; технические термины (props, slot, emit, computed, ref, watch, hook, lifecycle, hydration, SSR, CSP, plugin, layer, type alias, payload, focus trap, evergreen, breaking change, deprecation, polyfill, bundle, tree-shaking, hot reload и т. д.) сохраняются на английском без перевода.

Перед правкой любого документа прочти [dev-patterns.md](./dev-patterns.md) — там зафиксированы паттерны разработки и регламенты документирования (§11).

## Getting started

- [01-getting-started.md](./01-getting-started.md) — что такое FishtVue, как устроен пакет, минимальный запуск.
- [02-installation.md](./02-installation.md) — установка для Vite (Vue 3) и Nuxt 3/4.

## Architecture

- [architecture/component-class.md](./architecture/component-class.md) — базовый класс `Component<T>`, lifecycle, инжекция стилей.
- [architecture/config.md](./architecture/config.md) — Vue plugin, `FishtVueConfiguration`, `useFishtVue`/`getOptions`.
- [architecture/theme.md](./architecture/theme.md) — токены, темы Aurora/Harmony/Sapphire, uno-engine.
- [architecture/locale.md](./architecture/locale.md) — встроенные `en`/`ru`, `setActiveLocale`, расширение.
- [architecture/nuxt-module.md](./architecture/nuxt-module.md) — Nuxt module (auto-import, generated plugin) + server plugin для SSR-инжекции CSS.

## Utilities

- [utilities/arrayHandler.md](./utilities/arrayHandler.md) — `isArray`, `contains`, `sort`/`filter`, `reorderArray`, `findLast*`, `deepCopyArray`, `nestedKeys`.
- [utilities/colorsHandler.md](./utilities/colorsHandler.md) — `hslToHex`.
- [utilities/dateHandler.md](./utilities/dateHandler.md) — `isDate`, `formatDate`, `convertMask` (dayjs → date-fns).
- [utilities/domHandler.md](./utilities/domHandler.md) — `isClient`, `isElement`, `getParentNode`, `setAttribute(s)`, `minifyCSS`.
- [utilities/functionHandler.md](./utilities/functionHandler.md) — `isFunction`, `generateUUID`.
- [utilities/numberHandler.md](./utilities/numberHandler.md) — `convertToPhone`/`convertToNumber`, input-handlers.
- [utilities/objectHandler.md](./utilities/objectHandler.md) — `get`, `fieldsOmit`/`Pick`, `deepMerge`/`Equals`/`Copy`, `freeze`.
- [utilities/rulesHandler.md](./utilities/rulesHandler.md) — `Rules`, `getValidate`, `getAsyncValidate`.
- [utilities/stringHandler.md](./utilities/stringHandler.md) — `isString`, `toFlatCase`/`toKebabCase`/`toCapitalCase`, `stringify`.
- [utilities/tailwindHandler.md](./utilities/tailwindHandler.md) — `cn` (clsx + tailwind-merge).
- [utilities/uniqueCollection.md](./utilities/uniqueCollection.md) — `UniqueKeySetCollection<K, V>`.

## Components

### Form-controls

- [components/button.md](./components/button.md) — Button (modes, color, size, rounded, icon, loading).
- [components/label.md](./components/label.md) — Label с пятью режимами поведения.
- [components/switch.md](./components/switch.md) — Switch / checkbox с v-model.
- [components/input.md](./components/input.md) — Input с masks, focus/blur/clear, валидацией.
- [components/select.md](./components/select.md) — Select single/multiple с фильтрацией и кастомными slot'ами.
- [components/calendar.md](./components/calendar.md) — Calendar (v-calendar) — date/dateTime/time, range. **beta**.
- [components/text-editor.md](./components/text-editor.md) — Quill-редактор внутри Dialog. **experimental**.

### Data display

- [components/table.md](./components/table.md) — Table с sort/filter/group/search/pagination/edit, asyncData (4 режима), summary.
- [components/pagination.md](./components/pagination.md) — Pagination с size-selector и info-text.
- [components/badge.md](./components/badge.md) — Badge с modes/point/closeButton.

### Layout

- [components/form.md](./components/form.md) — Form с FormStructure, валидацией, custom slots.
- [components/input-layout.md](./components/input-layout.md) — обёртка для form-controls, label/help/error/clear/copy.
- [components/separator.md](./components/separator.md) — Separator с gradient/depth/contentPosition.
- [components/split.md](./components/split.md) — Split resizable panels с persistence. **beta**.
- [components/fix-window.md](./components/fix-window.md) — FixWindow popover/tooltip с 12 позициями.

### Disclosure

- [components/accordion.md](./components/accordion.md) — Accordion с multiple, custom иконками, animationDuration.
- [components/dialog.md](./components/dialog.md) — модальный Dialog с Teleport, 11 размерами, позиционированием.
- [components/menu.md](./components/menu.md) — Menu с группами, подменю через FixWindow, separators.
- [components/alert.md](./components/alert.md) — Alert (5 типов) + programmatic `openAlert()`.

### Feedback

- [components/loading.md](./components/loading.md) — Loading с EpicLoading/SvgLoading/simple типами. **beta**.
- [components/icons.md](./components/icons.md) — Icons (Heroicons + Iconify).

### A11y

- [components/aria.md](./components/aria.md) — Aria (textarea-аналог) с InputLayout-обёрткой.

## Misc

- [dev-patterns.md](./dev-patterns.md) — конституция разработки + регламенты документирования (§11). Прочти перед правкой любого `.md` или нового компонента.
- [playgrounds.md](./playgrounds.md) — назначение `sandbox` и `sandbox-nuxt`, workflow для регрессионного репро.

## Соглашения

- Все документы — plain markdown, без `::preview`/`::callout` и других Nuxt Content директив.
- Vue SFC всегда `<script setup lang="ts">`.
- Ссылки на исходный код: relative path с указанием строки — `[Button.vue:42](../lib/button/Button.vue#L42)`.
- Ссылки между документами: relative path — `[Input](./components/input.md)`.
- Раздел Known issues обязателен в каждом документе компонента/инфра-модуля.

## Структура каталога

```
Documentation/
├── README.md                  # этот файл (индекс)
├── 01-getting-started.md
├── 02-installation.md
├── dev-patterns.md            # конституция разработки и регламенты документирования
├── playgrounds.md             # справка по sandbox + sandbox-nuxt
├── architecture/
│   ├── component-class.md
│   ├── config.md
│   ├── theme.md
│   ├── locale.md
│   └── nuxt-module.md
├── components/
│   └── <kebab-name>.md        # один файл на компонент
└── utilities/
    └── <handler-name>.md
```
