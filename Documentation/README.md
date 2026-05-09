# FishtVue — внутренняя техническая документация

Этот каталог содержит **внутреннюю** техническую документацию пакета `fishtvue` для контрибьюторов и глубокого технического справочника. Канон извлекается только из [lib/](../lib). Публичное руководство пользователя живёт отдельно — [fisht.org](https://fisht.org) (исходники в [docs/](../docs)).

Документация ведётся на русском; технические термины (props, slot, emit, computed, ref, watch, hook, lifecycle, hydration, SSR, CSP, plugin, layer, type alias, payload, focus trap, evergreen, breaking change, deprecation, polyfill, bundle, tree-shaking, hot reload и т. д.) сохраняются на английском без перевода.

Перед правкой любого документа прочти [dev-patterns.md](./dev-patterns.md) — там зафиксированы паттерны разработки и регламенты документирования (§11).

## Getting started

- [01-getting-started.md](./01-getting-started.md) — что такое FishtVue, как устроен пакет, минимальный запуск.
- [02-installation.md](./02-installation.md) — установка для Vite (Vue 3) и Nuxt 3/4.

## Architecture

*Заполняется по мере написания (commits C3, C4).*

## Utilities

*Заполняется по мере написания (commit C5).*

## Components

*Заполняется по мере написания (commits C6–C11).*

## Misc

*Заполняется по мере написания (commits C2, C12).*

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
