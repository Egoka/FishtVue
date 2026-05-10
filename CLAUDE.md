# FishtVue — agent-orientation guide

## What this project is

**FishtVue** — Vue 3 component library, публикуемая в npm одним пакетом `fishtvue`. Содержит 22 компонента (form-controls, data-display, layout, disclosure, feedback, a11y), инфраструктуру (`Component<T>` класс, Vue plugin `Config`, темы Aurora/Harmony/Sapphire, локали `en`/`ru`, Nuxt module) и 11 utility handlers. Каждый компонент имеет собственный `package.json` и точечный импорт `fishtvue/{name}` для tree-shaking.

Цель — стабильный, типизированный, SSR-совместимый, evergreen-only ui-кит без рантайм-зависимости от Tailwind у потребителя.

Цель работы агента в этом репо — расширять и чинить **`lib/`** так, чтобы канон (см. ниже) оставался единым, а внутренняя документация (`Documentation/`) отражала реальность.

## Источник истины (canon)

- **Канон извлекается ТОЛЬКО из `lib/`.** Если в `sandbox/`, `sandbox-nuxt/` или `docs/` (публичный сайт) что-то расходится с `lib/` — побеждает `lib/`. Эти три каталога **не** являются источником канона.
- **Внутренняя документация** живёт в [Documentation/](./Documentation/README.md) и описывает то, что есть в `lib/`. **Публичный** user-guide — `docs/` → fisht.org, ведётся отдельно, в задачи `/tz` и большинство фич не входит.
- Перед любым нетривиальным изменением читай:
  - [Documentation/dev-patterns.md](./Documentation/dev-patterns.md) — конституция разработки (SFC pattern, `Component<T>` hooks, импорт-стиль, `Emits = null`, options resolution, регламенты документирования §11).
  - [Documentation/issues/README.md](./Documentation/issues/README.md) — индекс аудита по 60-пунктовому чек-листу + cross-cutting findings (XSS via `v-html`, missing aria, и т.д.).
  - Файл документа конкретного компонента/модуля из [Documentation/](./Documentation/README.md).

## Структура `lib/`

Краткая навигация (полный обзор — [01-getting-started.md §2](./Documentation/01-getting-started.md)):

- `lib/{component}/{Name}.{vue,d.ts,test.ts}` + `package.json` — один каталог на компонент.
- `lib/component/` — базовый класс `Component<T>` (lifecycle, `initStyle`, options).
- `lib/config/` — Vue plugin, `useFishtVue`, `getOptions`, locale-helpers.
- `lib/theme/`, `lib/locale/`, `lib/utils/`, `lib/module/` (Nuxt), `lib/plugins/`.
- `lib/index.ts` — публичный barrel.

## Скрипты (pnpm-monorepo)

| Назначение | Команда |
|---|---|
| Запуск тестов (Vitest 4) | `pnpm test` / `pnpm test:watch` / `pnpm coverage` |
| Type check (vue-tsc) | `pnpm typecheck` |
| Lint + auto-fix (ESLint) | `pnpm lint:fix` |
| Format (Prettier) | `pnpm format` / `pnpm format:check` |
| Production build (Rollup 4) | `pnpm lib:build` |
| Sandbox dev | `pnpm sandbox:dev` |
| Public docs site | `pnpm doc:dev` / `pnpm doc:build` |

После любых правок в `lib/` запускай минимум `pnpm typecheck` + `pnpm test --` с фильтром на трогаемый файл.

## Соглашения по коду

Полный набор паттернов — в [dev-patterns.md](./Documentation/dev-patterns.md). На уровне «не забыть»:

- Vue SFC всегда `<script setup lang="ts">`. JS-only компоненты не принимаются.
- Имена: каталог — kebab-case (`text-editor/`), файлы — PascalCase (`TextEditor.vue`).
- Cross-component импорт — через alias `fishtvue/{name}`. Внутри собственного каталога — относительные `./{Name}`.
- Стиль инициализируется через `Component.__hooks()`. **Не** добавляй `onMounted(() => X.initStyle())` в SFC — это двойной вызов.
- Резолв опций — `props ?? options ?? defaults` через `??`, default — литерал.
- `{Name}Emits = null` явно, если эмитов нет. Пустые `defineEmits()` — нельзя.
- Объявление `class X extends ClassComponent<...>` + `declare module "vue"` в `.d.ts` — обязательны для IntelliSense и template-ref'ов.
- Словари Tailwind-классов — `const`, не `ref` (нет реактивности — нет смысла в proxy).

## Соглашения по документации

- Plain markdown, **никаких** `::preview` / `::callout` и других Nuxt Content директив (они валидны только для публичного `docs/`, не для `Documentation/`).
- Ссылки на исходники — relative path с номером строки: `[Button.vue:42](../lib/button/Button.vue#L42)`. После правок в `lib/` обновляй якори вручную (нет авто-валидатора).
- Ссылки между документами — relative path: `[Input](./components/input.md)`.
- Раздел **Known issues & limitations** обязателен в каждом документе компонента/инфра-модуля.
- Frontmatter `updated:` — ISO date (например `2026-05-10`); обновляй при любом редактировании.
- Файл `Documentation/issues/{name}.md` создаётся **только** при наличии хотя бы одной проблемы. Решённые пункты — `~~зачёркивать~~` и помечать `✅ resolved`, не удалять. Матрицу в `Documentation/issues/README.md` пересчитывай.

## Язык и стиль текста

- Документация и комментарии в коде — **на русском**.
- Технические термины оставляй на английском без перевода: `props`, `slot`, `emit`, `computed`, `ref`, `watch`, `hook`, `lifecycle`, `hydration`, `SSR`, `CSP`, `plugin`, `layer`, `type alias`, `payload`, `focus trap`, `evergreen`, `breaking change`, `deprecation`, `polyfill`, `bundle`, `tree-shaking`, `hot reload`.

## Тесты

- Тесты лежат рядом с исходником: `lib/{component}/{Name}.test.ts`. Vitest 4 + `@vue/test-utils`.
- Минимальное покрытие нового кода: happy path + option-resolution layers (`props → options → defaults`) + slots + emits + reactivity + a11y (`role`, `aria-*`) + XSS-guard для `v-html`-точек + boundary cases (`null`/`undefined`, max).
- Для нетривиальных задач используй `/tz` — он ведёт по tests-first пайплайну.

## Коммиты и релизы

- Husky enforces `pre-commit` (lint/format) и `commit-msg` (`@commitlint/config-conventional`).
- Commit messages — **строго Conventional Commits** (`feat(button): …`, `fix(select): …`, `refactor(component-class): …`, `docs(architecture): …`).
- `CHANGELOG.md` (root) — **auto-generated** by `@semantic-release/changelog` из истории Conventional Commits. **Никогда** не редактируй его руками.
- **Никогда** не используй `--no-verify` / `--no-gpg-sign` для обхода husky. Если хук падает — чини root cause.
- Не коммить от имени пользователя без явного запроса.

## Hard don'ts

- Не считать каноном `sandbox/`, `sandbox-nuxt/`, `docs/`. Только `lib/`.
- Не редактировать `CHANGELOG.md` руками.
- Не использовать `--no-verify`.
- Не вводить рантайм-зависимости у потребителя на Tailwind или CSS-in-JS.
- Не дублировать `initStyle()` в SFC поверх `Component.__hooks()`.
- Не использовать пустой `defineEmits()` — `Emits = null` явно.
- Не оставлять doc-anchor (`#L<N>` или `:N`) на сдвинувшуюся строку — авто-валидатора нет.
- Не добавлять Nuxt Content директивы в `Documentation/`.
- Не создавать файл `Documentation/issues/{name}.md`, если у компонента нет реальных проблем.
- Не подключать новые dependencies в `lib/` без явного approve пользователя.

## Slash-команды

- [`/tz`](./.claude/commands/tz.md) — ТЗ-driven workflow (plan-mode → docs read → canon validation → tests-first → docs sync → report). Используй для любого нетривиального ТЗ.

## Trace-mcp routing

Для навигации по коду используй `trace-mcp` (`get_outline`, `get_symbol`, `find_usages`, `get_feature_context`, `get_change_impact`) — это дешевле и точнее, чем `Read`/`Grep`/`Glob` по `lib/`. Полная таблица соответствий — в глобальном `~/.claude/CLAUDE.md`. `Read`/`Grep` оставь для `.md`/`.json`/`.yaml` и подготовки `Edit`.
