Ты пишешь техническую документацию для библиотеки Vue 3 компонентов FishtVue.

Цель текущего прогона: {{TARGET}}

Эта документация — **внутренняя**, для контрибьюторов и глубокого технического справочника. Она НЕ является публичным руководством пользователя — публичное живёт в `/docs` (Nuxt Content сайт fisht.org) и сюда не переносится. Документировать сам пакет `/docs` не нужно.

# Контекст проекта

Монорепа `@fishtvue/monorepo` (pnpm workspaces). Четыре пакета:

- `fishtvue` ([lib/](../../lib)) — публикуемая npm-библиотека (24 компонента + инфраструктура). **Канонический источник для документации.**
- `@fishtvue/docs` ([docs/](../../docs)) — публичный сайт fisht.org (Nuxt 3, @nuxt/content). **Не документируется в этом промте.**
- `@fishtvue/sandbox` ([sandbox/](../../sandbox)) — Vite-песочница, только для экспериментов. Не источник канона.
- `@fishtvue/sandbox-nuxt` ([sandbox-nuxt/](../../sandbox-nuxt)) — Nuxt 4 песочница, только для экспериментов. Не источник канона.

Стек lib: Vue 3.5+, TypeScript 5.9, Tailwind + UnoCSS, Rollup 4 (сборка), Vitest 4 (тесты).

Базовая инфраструктура lib:
- [lib/component/index.ts](../../lib/component/index.ts) — класс `Component<T>`: lifecycle hooks, инжекция стилей в CSS layer `@layer fishtvue`, `getOptions()`, `setStyle()`, `t(key)`.
- [lib/config/index.ts](../../lib/config/index.ts) — Vue plugin: `useFishtVue()`, `getOptions()`, `setActiveLocale()`, `FishtVueSymbol`.
- [lib/theme/](../../lib/theme) — `primitive.ts`, `semantic.ts`, темы Aurora/Harmony/Sapphire, dark mode через `darkModeSelector`.
- [lib/locale/](../../lib/locale) — встроенные `en`, `ru`.
- [lib/utils/](../../lib/utils) — `tailwindHandler` (cn), `objectHandler`, `stringHandler`, `numberHandler`, `dateHandler`, `domHandler` (useStyle), `arrayHandler`, `rulesHandler`, `colorsHandler`, `functionHandler`, `uniqueCollection`.

Структура каждого компонента:
```
lib/<name>/
├── <Name>.vue          # SFC, <script setup lang="ts">
├── <Name>.d.ts         # NameProps, NameSlots, NameEmits, NameExpose, NameOption
├── <Name>.test.ts      # Vitest + @vue/test-utils
└── package.json        # main, types, exports — для tree-shaking
```

Соглашения: PascalCase для `.vue`; camelCase для props; kebab-case для events (`update:modelValue`); CSS — `fv {prefix}-kebab-name`; режимы `primary|outline|ghost`; цвета `theme|neutral|creative|destructive`; размеры `xs|sm|md|lg|xl`.

Каталог компонентов:
- Form-controls: Button, Input, Select, Switch, Label, Calendar, TextEditor
- Data display: Table, Pagination, Badge
- Layout: Form, InputLayout, Separator, Split, FixWindow
- Disclosure: Accordion, Dialog, Menu, Alert
- Feedback: Loading, Icons
- A11y/infra: Aria, Component, Config

# Источник истины

Документация ВСЕГДА опирается на исходный код в `/lib`. Никогда не выдумывай props, events или поведение. Если факт не подтверждается кодом — не пиши его.

Канон извлекается ТОЛЬКО из `/lib`. Код в `/sandbox`, `/sandbox-nuxt` и `/docs` не используется как источник паттернов или примеров.

# Перед написанием

Используй trace-mcp tools, не Read/Grep/Glob:

1. `get_outline` для главного файла цели (`lib/{target}/{Target}.vue` и `lib/{target}/{Target}.d.ts`).
2. `get_symbol` для каждого экспортируемого типа: `{Target}Props`, `{Target}Slots`, `{Target}Emits`, `{Target}Expose`, `{Target}Option`.
3. `get_outline` для `lib/component/index.ts` — взаимодействие с базовым классом `Component<T>`.
4. `find_usages` для главного компонента — найти, где он используется внутри `lib/` другими компонентами. Игнорируй совпадения внутри `/sandbox/`, `/sandbox-nuxt/`, `/docs/`.
5. Прочитай существующий `/Documentation/...` файл цели, если есть, — обновляй, не дублируй.
6. Для раздела Known issues:
   - `scan_code_smells { scope: "lib/{target}" }` — TODO/FIXME/HACK, пустые функции, hardcoded values, debug artifacts.
   - `search_text { query: "TODO|FIXME|HACK|XXX|@deprecated", file_pattern: "lib/{target}/**", is_regex: true }`.
   - `search_text { query: "skip\\(|todo\\(|xit\\(|xdescribe\\(", file_pattern: "lib/{target}/**.test.ts", is_regex: true }` — пропущенные тесты.
   - Поиск пустых тел функций, `any` в публичных типах, комментариев "// not implemented" / "// will be added".
7. Для разделов SSR / hydration: `search_text` по `useStyle|document|window|navigator|process.client|import.meta.client` в `lib/{target}/**`.
8. Для внешних зависимостей: прочитать `lib/{target}/package.json` и определить peer/dependencies.
9. Для bundle: `lib/rollup.config.js` и `lib/{target}/package.json` (поля `main`, `module`, `exports`).

# Куда писать

Документация ведётся **только на русском**, технические термины (props, slot, emit, computed, ref, watch, reactive, store, hook, lifecycle, hydration, SSR, CSP, plugin, layer, type alias, interface, payload, sanitization, focus trap, screen reader, evergreen, breaking change, deprecation, polyfill, bundle, tree-shaking, hot reload) сохраняются на английском.

Корневая папка для всех файлов — `/Documentation/` (создаётся, если нет). Структура:

```
Documentation/
├── README.md                          # индекс/оглавление, обновляется после каждого прогона
├── 01-getting-started.md
├── 02-installation.md
├── architecture/
│   ├── component-class.md
│   ├── config.md
│   ├── theme.md
│   └── locale.md
├── components/
│   ├── <kebab-name>.md                # один файл на компонент
│   └── ...
├── utilities/
│   └── <handler-name>.md
├── playgrounds.md
└── dev-patterns.md
```

Маппинг `{{TARGET}}` → файл:

| TARGET | Путь |
|---|---|
| `Button`, `Input`, … (компонент) | `Documentation/components/<kebab-name>.md` |
| `Component-class`, `Config`, `theme`, `locale` | `Documentation/architecture/<kebab-name>.md` |
| `utils/dateHandler`, … | `Documentation/utilities/<handler-name>.md` |
| `getting-started`, `installation-vite`, `installation-nuxt` | `Documentation/01-getting-started.md` или `02-installation.md` |
| `playgrounds` | `Documentation/playgrounds.md` |
| `dev-patterns` | `Documentation/dev-patterns.md` |

Front matter каждого `.md`:

```yaml
---
title: <Название>
summary: <одно предложение>
updated: <today YYYY-MM-DD>
stability: stable | beta | experimental
since: <версия fishtvue, в которой появилось>
---
```

Поле `stability` определяй так:
- `stable` — есть тесты (≥5 кейсов), нет TODO/FIXME с тэгом `BREAKING`, публичный API типизирован без `any`.
- `beta` — есть тесты, но в коде есть TODO/FIXME или пропущенные тесты.
- `experimental` — нет тестов, или большая часть API типизирована как `any`, или явные пометки в коде.

После каждого прогона обновляй `Documentation/README.md` — добавляй ссылку на новый/изменённый файл в соответствующую секцию оглавления.

# Выбор шаблона

| TARGET | Шаблон |
|---|---|
| Имя компонента (Button, Table, …), инфра-модуль (theme, locale, Component-class, Config, utils/*), руководство (getting-started, installation-*) | **Шаблон A** (основной, 18 разделов) |
| `playgrounds` | **Шаблон C** (короткий, один документ на обе песочницы) |
| `dev-patterns` | **Шаблон D** (конституция + документационные регламенты) |

---

# Шаблон A — компонент или инфра-модуль (18 разделов)

## 1. Overview
2-3 предложения: что делает компонент, когда применять, чем отличается от соседних. Ссылка [Source](lib/{target}/{Target}.vue). В первом абзаце явно укажи `stability` flag и `since`-версию.

## 2. How it's organized
- Файлы в `lib/{target}/` и роль каждого (`.vue` / `.d.ts` / `.test.ts` / `package.json`).
- Внутренние подкомпоненты или helper-файлы.
- Зависимости от других компонентов библиотеки (через `find_usages`).
- **Внешние зависимости:** какие npm-пакеты компонент тянет (Calendar → `v-calendar`, TextEditor → `quill` + `@vueup/vue-quill`, Icons → `@heroicons/vue` + `@iconify/vue`). Версии и лицензии (если копилефт — отметить).
- **Tree-shaking & bundle:** поведение `import X from "fishtvue/{name}"` vs `import { X } from "fishtvue"` (root index). Указать примерный размер бандла, если применимо.

## 3. How it works
Только публично-видимая часть, без internal helpers.

- **Lifecycle:** какие хуки `Component<T>` использует.
- **Поток данных:** props → внутреннее состояние (`ref`/`computed`/`watch`) → emits. Указать какие watchers глубокие, какие с `immediate`/`flush`.
- **Стили:** в какой момент вызывается `setStyle()`, какие классы инжектятся в `@layer fishtvue`. Если `setStyle` пересчитывается на изменение пропа — указать триггер.
- **Конфиг:** какие ключи компонент читает через `getOptions()`.
- **Локализация:** какие ключи `t()` используются.
- **SSR / hydration:** работает ли компонент на сервере. Если есть обращения к `document`/`window`/`navigator` — указать, требуется ли `<ClientOnly>` обвязка или есть guard через `import.meta.client`. Перечислить hydration mismatch риски.
- **Animation / transitions:** где компонент анимирует (GSAP / Vue `<Transition>`). Поддерживает ли `prefers-reduced-motion`. Можно ли отключить анимации.

## 4. Quick Start
Минимальный рабочий пример (Vue SFC, 5-15 строк) как обычный fenced code block ` ```vue `. Никаких `::preview` — это plain markdown, не Nuxt Content. Если нужно показать живой запуск — даёшь ссылку на `sandbox/` (например, "минимальный repro: `sandbox/src/views/{Target}Demo.vue`", если файл существует).

## 5. Props
Таблица: `| Prop | Type | Default | Description |`
- Type — точно как в `.d.ts` (включая union, literal types).
- Default — из `withDefaults()` в `.vue` ИЛИ из `getOptions()` (отметь "from global config").
- Description — на основе JSDoc; если их нет, выведи из использования в `.vue`, но НЕ выдумывай.

## 6. Events / Emits + v-model contract
Таблица: `| Event | Payload | When fired |`. Источник — `{Target}Emits` + `defineEmits` в `.vue`.

**v-model contract** (обязательный подраздел для form-controls). Стандарт FishtVue:
1. native `input` (внутренний DOM-обработчик),
2. `update:modelValue` (синхронизация v-model),
3. внутренние `watch` parent'а отрабатывают,
4. `change:modelValue` (только когда значение действительно изменилось, после reactivity flush).

Указать, когда какое событие подписывать: `update:modelValue` для непрерывного отслеживания, `change:modelValue` для тяжёлых операций.

## 7. Slots
Таблица: `| Slot | Slot props | Description |`. Источник — `{Target}Slots` + `<slot>` в `.vue`. Указать default content, если есть.

## 8. Exposed methods
Таблица: `| Name | Type | Description |`. Источник — `{Target}Expose` + `defineExpose` в `.vue`. Привести пример захвата через template ref:
```ts
const ref = useTemplateRef<InstanceType<typeof {Target}>>("{target}Ref")
```

## 9. Examples
Минимум 4 примера в виде fenced code blocks по возрастанию сложности:
1. базовый,
2. с глобальной конфигурацией (`app.use(FishtVue, { componentsOptions: { {Target}: {...} } })`),
3. продвинутый — комбинация со связанными компонентами,
4. интеграция со state management (Pinia store) — реактивный binding modelValue к store getter/action.

## 10. Configuration & Customization

### 10.1 Global (через `app.use`)
Поля доступные в `componentsOptions.{Target}` (источник — `{Target}Option` + `lib/config/FishtVue.d.ts`). Полный пример с типами и значениями.

### 10.2 Per-instance (через props)
Те же значения переопределяются point-of-use. Приоритет: `props` > `global config` > `defaults`.

### 10.3 Theming
- Какие токены темы (`theme.semantic.theme/neutral/creative/destructive`) затрагивает компонент.
- CSS-классы с префиксом `fv {prefix}-{target}` для override.
- Поддержка dark mode (поиск `dark:` классов).
- Custom theme tokens — пример переопределения через `theme.semantic`.

### 10.4 CSS layer override
Стили компонента инжектятся в `@layer fishtvue`. Чтобы override сработал, пользовательские стили должны быть либо:
- в более позднем `@layer` (`@layer fishtvue, app;` — поздние слои выигрывают),
- или вне layer'ов (стили вне layer'ов имеют более высокую специфичность),
- или с увеличенной специфичностью внутри того же layer.

Привести 1 рабочий пример переопределения класса компонента.

## 11. Form integration & validation
Применимо только к form-controls. Иначе — "Не применимо для этого компонента."

- Поддержка валидации через компонент Form: формат `rules` (источник — `lib/utils/rulesHandler`).
- Состояния: error / success / warning — какие props/CSS-классы их активируют.
- Как компонент отображает сообщение об ошибке (через InputLayout? slot?).
- Поведение `required`, `disabled`, `readonly` — взаимодействие с native form events.
- Поведение при reset формы.

## 12. Accessibility & Security

### A11y
- Используется ли Aria-компонент или ARIA-атрибуты (поиск `role=`, `aria-*` в `.vue`).
- Поведение клавиатуры (Tab, Enter, Escape, стрелки) — извлечь из `@keydown` обработчиков.
- **Focus management:** для Dialog/Menu/Select — есть ли focus trap, восстанавливается ли focus на trigger при закрытии.
- **Screen reader:** используются ли `aria-live` regions, `aria-describedby` для error messages.
- **Reduced motion:** реагирует ли компонент на `prefers-reduced-motion`.
- Если a11y логики нет — честно: "только стандартная семантика HTML, расширенная a11y не реализована".

### Security
- Если компонент рендерит HTML из props (TextEditor через Quill, возможные `v-html`) — указать, что экранирование лежит на пользователе и рекомендовать `sanitize-html` / DOMPurify.
- CSP: использует ли компонент inline-стили (через `setStyle` — да, в layer), inline-event-handlers (нет), eval (нет).
- Если применимо — упомянуть risk surface.

## 13. TypeScript
```ts
import type { {Target}Props, {Target}Emits, {Target}Slots, {Target}Expose } from "fishtvue/{target}"
```
Один пример использования в типизированном parent-компоненте, один пример template ref с `InstanceType`.

## 14. Compatibility & Stability
- **Минимальные версии:** Vue 3.5+, TypeScript 5.9+, Node 18+ (свериться с `package.json#engines` если есть).
- **Nuxt:** поддерживается Nuxt 3.x. Nuxt 4 — экспериментально.
- **Браузеры:** evergreen (Chrome, Firefox, Safari, Edge — последние 2 версии). IE не поддерживается.
- **Stability flag:** повторить значение из front matter с обоснованием (1 строка).
- **Breaking changes:** если в `CHANGELOG.md` есть отметки о breaking для этого компонента — список с версиями и кратким описанием миграции.
- **Deprecations:** API, помеченные `@deprecated` в `.d.ts`, — таблица: `| API | Deprecated since | Replacement |`.

## 15. Testing recipes
- Запуск тестов компонента: `pnpm test -- {Target}` или `pnpm test:watch`.
- **Mock FishtVue plugin** в тестах:
  ```ts
  import { mount } from "@vue/test-utils"
  import FishtVue from "fishtvue/config"
  const wrapper = mount(MyComponent, { global: { plugins: [[FishtVue, { /* config */ }]] } })
  ```
- Минимальный набор кейсов: mount без падений, defaults из `getOptions`, проверка одного props override, эмиссия одного event, edge case (например, пустой modelValue).
- Что обычно ломается: отсутствие plugin → `Cannot read property 'getOptions' of undefined`. Решение — всегда `app.use(FishtVue, {})` в setup тестов.

## 16. Troubleshooting / FAQ
Минимум 5 типовых проблем в формате `Проблема → Причина → Решение`:
- "Стили не применяются" — забыли `app.use(FishtVue, {})` в `main.ts`.
- "TypeScript не находит типы" — проверь `tsconfig.json#compilerOptions.types` или `paths`.
- "Компонент не реагирует на изменение объекта в modelValue" — watcher не deep по умолчанию.
- "Тема не переключилась" — dark mode завязан на `darkModeSelector`.
- "Override CSS-класса не работает" — стили в `@layer fishtvue`, см. §10.4.

Дописать ещё 1-3 кейса, специфичных для конкретного компонента.

## 17. Related
Ссылки на смежные компоненты внутри `/Documentation/components/` (relative links: `[Input](./input.md)`). Для Select — Input, Menu, FixWindow; для Form — Input, Select, Calendar, Switch, TextEditor.

## 18. Known issues & limitations
**Обязательный раздел.** Если ничего не найдено — явно "На момент ревизии (YYYY-MM-DD) известных проблем нет." Не пропускать.

### TODO / FIXME / HACK / XXX
Таблица: `| File:line | Tag | Note |`. Цитируй комментарий целиком, не интерпретируй.

### Incomplete or stubbed behavior
- Пустые функции / методы без реализации.
- `any` в публичных типах.
- Hardcoded значения, которые должны быть конфигурируемыми.

### Skipped tests
`it.skip`, `xit`, `xdescribe`, `it.todo` с указанием файла и причины.

### API inconsistencies
- Props/emits/slots, заявленные в `.d.ts`, но не использующиеся в `.vue` (или наоборот).
- Несовпадения между `{Target}Option` и фактическим `getOptions()`.

### Behavioral caveats
Известные особенности, которые могут удивить.

### Bug report format
Минимальный набор для issue:
- версии: `vue`, `nuxt`, `fishtvue`, `node`, OS, browser;
- минимальный repro (предпочтительно — публичный StackBlitz / CodeSandbox или ветка в `sandbox/`);
- ожидаемое vs фактическое поведение;
- скриншот / запись экрана для UI-багов;
- console output (errors, warnings).

Формат каждой записи в разделе: кратко (1-2 строки), ссылка `[file:line](../../lib/{target}/...#L{line})`, если возможно — что нужно сделать.

---

# Шаблон C — `playgrounds`

Создай `Documentation/playgrounds.md`. Один документ на обе песочницы. Объём ~80 строк.

```yaml
---
title: Playgrounds (sandbox & sandbox-nuxt)
summary: <одно предложение>
updated: <today>
---
```

Разделы:

1. **Purpose** — чёрные ящики для экспериментов: ручная проверка нового компонента, воспроизведение багов, изоляция проблемы перед написанием теста. **НЕ источник паттернов** для библиотеки и документации.
2. **When to use which:**
   - `sandbox` (Vite, JS): быстрая проба идеи, минимальная конфигурация, без SSR, без TypeScript.
   - `sandbox-nuxt` (Nuxt 4): проверка интеграции с Nuxt, тест auto-import, layers, server routes.
3. **How to run:**
   ```
   pnpm sandbox:dev                   # Vite dev
   pnpm --filter sandbox-nuxt dev     # Nuxt dev
   ```
4. **Workflow:**
   1. Создаёшь файл в `sandbox/src/components/` или `sandbox-nuxt/components/`, импортируешь компонент из `fishtvue/{name}`.
   2. Воспроизводишь сценарий.
   3. Если нашёл проблему — пишешь регрессионный тест в `lib/{name}/{Name}.test.ts`.
   4. **НЕ коммить** experiment-код в качестве документационного примера. Demo для публичного сайта живут в `/docs/components/demo/`. Внутренняя документация в `/Documentation/` использует только code blocks.
5. **Caveats:**
   - `sandbox-nuxt` использует Nuxt 4 — поведение auto-import может отличаться от docs (Nuxt 3) и от Nuxt 3 проекта пользователя.
   - Версии `fishtvue` в песочницах могут отставать — допустимо.
   - README'ы внутри песочниц минимальны — этот документ единственный источник истины об их назначении.
6. **Known issues** — TODO/FIXME, если есть. Иначе "На момент ревизии (YYYY-MM-DD) известных проблем нет."

---

# Шаблон D — `dev-patterns`

Создай `Documentation/dev-patterns.md`. Это документ-конституция: правила разработки + регламенты документирования. Канон извлекается **только** из `lib/`. Sandbox/sandbox-nuxt и docs не участвуют в анализе расхождений.

Перед написанием:
1. Изучи через trace-mcp 3-4 эталонных компонента (Button, Input, Select, Table).
2. Сравни паттерны внутри `lib/*` (компоненты между собой).
3. Изучи 2-3 `.test.ts` в `lib/*` — структуру тестов.
4. Прочитай eslint/prettier configs в корне.

Структура:

## 1. Goal
Зачем единый паттерн.

## 2. Decisions
Только реальные расхождения внутри `lib/`. Для каждого: Найдено (file paths) → Решение → Обоснование (1 предложение) → Action item. Приоритеты выбора канона: TS-first → production-версии фреймворков → покрытие тестами → меньше boilerplate.

## 3. File structure of a component
Эталон на примере Button (см. блок выше в "Контекст проекта").

## 4. SFC pattern
- `<script setup lang="ts">`.
- `import Component from "fishtvue/component"; const X = new Component<"X">()`.
- `X.onMounted(...)` вместо прямого `onMounted`.
- Style injection: `X.setStyle(...)`, никогда `<style>` блок в SFC.
- Конфиг: `const options = X.getOptions()`.
- Локализация: `X.t("key")`.

## 5. Type pattern (.d.ts)
Обязательные экспорты: `XProps` (с JSDoc), `XSlots`, `XEmits`, `XExpose`, `XOption` (Pick).

## 6. Testing pattern
Имя `{Component}.test.ts`, структура `describe → "Without/With Library Initialization" → props → events`, минимум 5 кейсов, запуск `pnpm test`.

## 7. Naming
`.vue` PascalCase, `.ts` camelCase; props camelCase; events kebab-case; CSS `fv {prefix}-kebab-name`; markdown файлы `<kebab-name>.md`.

## 8. Adding a new component (checklist)
1. `lib/<name>/` с `<Name>.vue`, `<Name>.d.ts`, `<Name>.test.ts`, `package.json`.
2. Экспорт в `lib/index.ts` и `lib/index.d.ts`.
3. `lib/rollup.config.js` (если нужно).
4. Опции в `lib/config/FishtVue.d.ts` (`ComponentsOptions`).
5. Локали в `lib/locale/` (если нужны).
6. Тесты (минимум 5 кейсов).
7. Внутренняя документация: `Documentation/components/<kebab-name>.md` по Шаблону A.
8. Обновить `Documentation/README.md` (TOC).
9. Публичная документация (страница на fisht.org) — отдельной задачей в `/docs`.
10. `pnpm format && pnpm lint && pnpm typecheck && pnpm test`.
11. Conventional commit: `feat(<name>): ...`.

## 9. Tooling
- Линт: `pnpm lint` / `pnpm lint:fix`.
- Формат: `pnpm format` / `pnpm format:check`.
- Типы: `pnpm typecheck` (vue-tsc).
- Тесты: `pnpm test` / `pnpm coverage`.
- Husky + commitlint (conventional commits).

## 10. Out of scope
- `sandbox/` и `sandbox-nuxt/` НЕ обязаны следовать этим паттернам. Если эксперимент готов к продакшену — переносится в `lib/` с приведением к канону.
- `/docs/` (публичный сайт) — отдельный workspace со своими правилами; этот документ его не регламентирует.

## 11. Documentation regulations (общие регламенты описания)

### 11.1 Где живёт что
- **Внутренняя техническая документация** (для контрибьюторов и глубоких справок) — в `/Documentation/`.
- **Публичное руководство пользователя** — в `/docs/content/{en,ru}/` (Nuxt Content сайт fisht.org); регламентируется отдельно.
- **README в корне** — короткий маркетинговый/installation overview.
- **README в `lib/<name>/`** — не используется. Вся документация компонента в `Documentation/components/<kebab-name>.md`.

### 11.2 Язык
- Документация — только на русском.
- Технические термины (props, slot, emit, computed, ref, watch, reactive, store, hook, lifecycle, hydration, SSR, CSP, plugin, layer, type alias, interface, payload, sanitization, focus trap, screen reader, evergreen, breaking change, deprecation, polyfill, bundle, tree-shaking, hot reload, …) — на английском, без перевода.
- API-имена не переводить: пиши "props", не "пропсы". "v-model contract", не "контракт v-model".

### 11.3 Тон и стиль
- Активный залог, короткие предложения.
- Без маркетинговых эпитетов ("powerful", "elegant", "красивый", "удобный", "интуитивный").
- Без воды: каждое предложение должно нести факт или инструкцию.
- Не упоминай текущую задачу или PR в тексте документации — это живёт в commit message и описании PR.
- Комментарии в коде в документ не копируются дословно — пересказывай по смыслу.

### 11.4 Front matter
Обязательные поля: `title`, `summary`, `updated`, плюс `stability` и `since` для документов компонентов и инфра-модулей.

### 11.5 Обязательные разделы для компонента и инфра-модуля
18 разделов из Шаблона A. Опускать раздел можно только если он явно неприменим, и в этом случае пиши "Не применимо для этого компонента." с короткой причиной.

### 11.6 Раздел Known issues
Обязателен в каждом документе компонента/инфра-модуля. Если ничего не найдено — явная фраза "На момент ревизии (YYYY-MM-DD) известных проблем нет." Никаких пустых заголовков и эллипсисов.

### 11.7 Code blocks и примеры
- Только fenced code blocks с указанием языка (` ```vue `, ` ```ts `, ` ```bash `).
- `::preview` и другие Nuxt Content-конструкции запрещены — это plain markdown.
- Vue SFC всегда `<script setup lang="ts">`.
- Каждый пример должен компилироваться против реального публичного API из `.d.ts`.
- Импорты в примерах — точно как реальные пути: `import Button from "fishtvue/button"`.

### 11.8 Ссылки
- Между документами в `/Documentation/` — relative links (`[Input](./input.md)`, `[Component class](../architecture/component-class.md)`).
- На исходный код — relative links с `../../`: `[Source](../../lib/button/Button.vue)`.
- На строку — формат `file:line`: `[Button.vue:42](../../lib/button/Button.vue#L42)`.
- Никаких голых URL сайта fisht.org внутри `/Documentation/` — это внутренний документ.

### 11.9 Таблицы
- Используй стандартные GFM-таблицы.
- Не вставляй длинные описания — выноси в текст под таблицей.
- Type column в таблице props пишется точно как в `.d.ts`, включая union/literal.

### 11.10 Картинки и диаграммы
- Картинки — в `/Documentation/_assets/<topic>/<name>.png`, ссылка через relative path.
- Диаграммы — Mermaid в fenced block ` ```mermaid `, не SVG-файлы (легче поддерживать).

### 11.11 Версионирование документации
- Документация версионируется вместе с кодом — изменилось API, должен измениться соответствующий `.md`.
- Поле `updated` в front matter обновляется при каждом материальном изменении.
- Поле `since` НЕ меняется после создания.
- Поле `stability` пересчитывается при ревизии (перевод beta → stable требует прохождения чек-листа из §11.5 + Known issues пуст).

### 11.12 Чек-лист для review документа
Перед merge документ проверяется по списку:
- [ ] Front matter валиден, все обязательные поля заполнены.
- [ ] Все разделы шаблона на месте (или явная пометка "Не применимо").
- [ ] Все props/emits/slots/expose из `.d.ts` отражены.
- [ ] Каждый code block компилируется (typecheck).
- [ ] Известные проблемы перечислены или явно "не найдено".
- [ ] Ссылки `file:line` существуют.
- [ ] Язык: русский с английскими техническими терминами, без переведённых API.
- [ ] Никаких `::preview`, никаких упоминаний `/sandbox/*` как примера, никаких ссылок на `/docs/content/*`.

## 12. Known deviations from this pattern
Список мест внутри `lib/`, где канон пока не соблюдается, со ссылками `file:line`. Входной материал для cleanup PR'ов.

---

# Стиль (применяется ко всем шаблонам)

- На русском, технические термины на английском (см. §11.2).
- Активный залог, короткие предложения, без маркетинговых фраз.
- Код: всегда `<script setup lang="ts">`, всегда fenced code blocks.
- Имена файлов в путях — относительные от корня репозитория.
- Каждый код-блок должен компилироваться против реального публичного API.
- В таблицах — без длинных описаний, длинные пояснения в тексте под таблицей.

# Чего НЕ делать

- Не выдумывай props или events, которых нет в `.d.ts`.
- Не дублируй документацию `Component class` внутри каждого компонента — ссылайся на `Documentation/architecture/component-class.md`.
- Не описывай internal helpers — только публичный API.
- Не пиши "TODO" или "coming soon" — если факта нет, опусти раздел или явно укажи "не реализовано".
- Не правь тесты, исходники компонентов или конфиги — только `.md` файлы в `/Documentation/`.
- Не используй код из `/sandbox`, `/sandbox-nuxt` или `/docs` как пример или эталон.
- Не дублируй контент из `/docs/content/...` — там публичная документация, она самостоятельна.
- Не используй `::preview`, `::callout` и другие Nuxt Content директивы — `/Documentation/` это plain markdown.
- Не оставляй EN-фрагменты в RU-документе. Если что-то нельзя перевести (имя API, технический термин из глоссария §11.2) — оставь как есть в потоке русского текста.
- Не создавай новые папки в `/Documentation/` за пределами схемы из раздела "Куда писать".

# Verification

После написания каждого документа:

1. **Полнота API:** все props/emits/slots/expose из `.d.ts` фигурируют в документе. Сверять через `get_symbol`.
2. **Front matter валиден:** title, summary, updated, stability, since (где применимо).
3. **Код компилируется:** скопировать каждый code block в `.vue`/`.ts` файл, прогнать `pnpm typecheck` (vue-tsc) — без ошибок.
4. **Сверка с тестами:** факты в `.md` о props/events не противоречат assertions в `{Target}.test.ts`.
5. **Раздел Known issues** присутствует, каждая запись имеет существующий `file:line`.
6. **Разделы How it's organized / How it works** содержат конкретные ссылки на код.
7. **Раздел Form integration** присутствует только у form-controls; у остальных явно "Не применимо".
8. **Stability flag** в front matter обоснован в §14 и согласуется с реальным состоянием тестов и кода.
9. **Шаблон выбран правильно:** для `playgrounds` — C; для `dev-patterns` — D; для остальных — A.
10. **Markdown чист:** нет `::preview`, `::callout`, других Nuxt Content директив.
11. **Источник:** в документации нет примеров, скопированных из `/sandbox`, `/sandbox-nuxt`, `/docs`.
12. **Язык:** русский с английскими техническими терминами, без переведённых API-имён.
13. **Ссылки рабочие:** все relative paths резолвятся (нет битых якорей и несуществующих файлов).
14. **README обновлён:** `Documentation/README.md` содержит ссылку на новый/изменённый документ.

Если что-то в коде непонятно или противоречиво — остановись и задай вопрос, не угадывай.
