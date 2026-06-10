---
title: Development patterns & documentation regulations
summary: Конституция разработки внутри lib/ и регламенты внутренней документации.
updated: 2026-05-16
stability: stable
since: 0.2.11
---

# Development patterns & documentation regulations

## 1. Goal

Цель документа — зафиксировать единый шаблон для каждого компонента в `lib/` и регламенты для документов в `Documentation/`. Канон извлекается **только** из `lib/`. `sandbox/`, `sandbox-nuxt/` и `docs/` в анализе не участвуют. Документ — основа для code review и для добавления новых компонентов.

## 2. Decisions

Реальные расхождения внутри `lib/` (на момент 2026-05-09), приоритеты выбора канона: TS-first → production-версии фреймворков → покрытие тестами → меньше boilerplate.

| Расхождение | Найдено | Решение | Обоснование | Action item |
|---|---|---|---|---|
| `onMounted` vs `Component.onMounted` для инициализации стилей | Ранее [Button.vue:346](../lib/button/Button.vue#L346), [Label.vue:57](../lib/label/Label.vue#L57) — raw `onMounted(() => X.initStyle())`. При этом `Component.__hooks()` ([component/index.ts:79–84](../lib/component/index.ts#L79-L84)) уже регистрирует `vueOnMounted(() => this.initStyle())` в конструкторе. | Канон — **полагаться только на авто-хук** в конструкторе `Component`. Не вызывать `initStyle()` повторно из SFC. | Двойной вызов `initStyle()` — лишняя работа, риск race-conditions при будущих расширениях lifecycle. | ✅ Wave 2.3 done (2026-05-16) — sweep по 13 SFC (Alert, Aria, Calendar, Input, Label, Select, Switch + Button, Icons, InputLayout, Menu, Separator, Table); 8 SFC не используют initStyle. См. §12. |
| Импорт SFC: `from "./Button"` или `from "fishtvue/button"` | `Button.vue` использует относительные `./Button`, `./Icons.vue`. Внешние компоненты — через `fishtvue/{name}`. | Канон — **внутренние типы из `./{Name}` (относительный)**, **сторонние компоненты — через `fishtvue/{name}`** (alias-импорт). | Относительные внутри собственного каталога — короче и устойчивы к refactor каталога. Через alias — для cross-component импортов, чтобы tree-shaking видел публичный entry. | Аудит на конфликты при переименовании. |
| `defineEmits` отсутствует в части компонентов | [Button.d.ts:109](../lib/button/Button.d.ts#L109) — `ButtonEmits = null`. У form-controls (Input, Select) — полноценный type. | Канон — **`{Name}Emits = null` явно**, если компонент не эмитит ничего. Никаких пустых `defineEmits()`. | Сигнал в `.d.ts`: «компонент намеренно не эмитит». | Везде, где emits нет — type объявить как `null`, не пропускать. |
| Класс-обёртка `class X extends ClassComponent<...>` в `.d.ts` | [Button.d.ts:11](../lib/button/Button.d.ts#L11), [Input.d.ts:12](../lib/input/Input.d.ts#L12) — везде объявлен. | Канон — **обязательная декларация** + `declare module "vue" { interface GlobalComponents { X: GlobalComponentConstructor<X> } }`. | Даёт IntelliSense в template'ах + правильную типизацию template-ref'ов. | Проверка в чек-листе нового компонента. |
| Хранение Tailwind-подобных классов в `ref({...})` vs `const` | `Button.vue` — `ref({...})` для словарей классов, не реактивных. | Канон — **`const` для словарей классов** (нет реактивности — нет нужды в `ref`). | `ref({})` создаёт reactive proxy; для словаря классов это ненужный оверхед. | Refactor PR — переход на `const`. |
| Pattern для resolve опций: `props ?? options ?? default` | Везде встречается в варианте `(props?.x as T) ?? options?.x ?? <default>`. | Канон — **fallback chain `props → componentsOptions → defaults`** через `??`, default — литерал, не вычисляемое выражение. | Предсказуемый порядок, работает с `undefined` без сюрпризов. | Сохранить. |
| Compound child API (`<Menu><MenuItem>`, `<Table><Column>`) | [Menu.vue:199–284](../lib/menu/Menu.vue#L199) (MenuItem/MenuGroup), [Table.vue](../lib/table/Table.vue) (Column/ColumnGroup) — дети renderless. | Канон — **VNode-walk `slots.default()`**, НЕ provide/inject. Дети: renderless SFC (`<slot v-if="false"/>`, `defineOptions({ name, inheritAttrs: false })`, без `new Component()`); родитель сопоставляет по `vn.type.name`/`__name` (Fragment-flatten для `v-for`/`v-if`) и **НЕ импортирует child `.vue` в свой SFC** — это ломает type-resolver `@vue/compiler-sfc` на re-export `declare class extends ClassComponent`. Schema-driven prop (`:groups`/`:columns`) при наличии **выигрывает** (backward compat). Subcomponent — named-экспорт родительского модуля (entry = `index.ts`, бандлит детей в `{name}.mjs`) + Nuxt `addComponent({ filePath, export })`. | Меньше boilerplate чем provide/inject; нет registration-lifecycle и ordering-проблем; реактивность — через ре-рендер родителя. raw `.vue`-экспорт детей (как ранний MenuItem) **не** публикуется в npm — поэтому бандлить в `.mjs`. | Зеркалить Menu/Table при добавлении compound к новым collection-компонентам. |

## 3. File structure of a component

Эталон:

```
lib/<name>/
├── <Name>.vue          # SFC, <script setup lang="ts">
├── <Name>.d.ts         # NameProps, NameSlots, NameEmits, NameExpose, NameOption
├── <Name>.test.ts      # Vitest 4 + @vue/test-utils
└── package.json        # main, types, exports — для tree-shaking
```

`<name>` (директория) — kebab-case, `<Name>` (файлы) — PascalCase. Подробнее по `package.json` каждого компонента — см. [02-installation.md §2](./02-installation.md#2-how-its-organized).

## 4. SFC pattern

Обязательные элементы каждого `.vue`:

```vue
<script setup lang="ts">
import { computed } from "vue"
import type { XProps } from "./X"
import Component from "fishtvue/component"

// ---BASE-COMPONENT----------------------
const X = new Component<"X">()
const options = X.getOptions()

// ---PROPS-EMITS-SLOTS-------------------
const props = withDefaults(defineProps<XProps>(), {
  // только те, чьи defaults не зависят от global config
})
const emit = defineEmits<XEmits>() // если есть emits

// ---STATE-------------------------------
// const ... = ref(...)

// ---PROPS-------------------------------
const mode = computed<NonNullable<XProps["mode"]>>(
  () => (props?.mode as XProps["mode"]) ?? options?.mode ?? "primary"
)
const classBase = computed(() => X.setStyle([/* tw-классы */]))

// ---EXPOSE------------------------------
defineExpose({
  // mode, ...
})
</script>

<template>
  <div data-x :class="classBase">
    <slot />
  </div>
</template>
```

Правила:

- `<script setup lang="ts">` обязательно.
- `<style>` блока в SFC **нет** — стили идут через `X.setStyle(...)` и инжектятся в `@layer fishtvue`.
- Lifecycle для инициализации стилей не нужен — `Component.__hooks()` в конструкторе сам регистрирует `vueOnMounted` и `onServerPrefetch` для `initStyle()`. Не дублируй вручную (см. §12).
- Резолв опций — fallback chain `props → componentsOptions → default`.
- Корневой DOM-узел — `data-{kebab-name}` для тестов и `:class="classBase"` для setStyle-вывода.
- Локализация — `X.t("path.to.key")`. Без явных строк "ru/en" внутри SFC.
- `defineExpose` — публичные computed (`mode`, `size`, `classBase`, …) и методы. Никаких internal `ref`s наружу.
- Comment-разделители (`// ---SECTION----`) — устоявшийся стиль проекта; сохраняй их в новых компонентах ради единообразия.

## 5. Type pattern (.d.ts)

Обязательные экспорты:

```ts
import { ClassComponent, GlobalComponentConstructor } from "../types"
import { VNode } from "vue"

declare class X extends ClassComponent<XProps, XSlots, XEmits, XExpose> {}

export interface XProps { /* JSDoc на каждое поле */ }
export declare type XSlots = { default(): VNode[] }
export declare type XEmits = null | {
  /* "update:modelValue": [value: T]; */
}
export declare type XExpose = { /* видимые наружу computed/refs */ }
export declare type XOption = Pick<XProps, "mode" | "size" | /* ... */>

declare module "vue" {
  export interface GlobalComponents {
    X: GlobalComponentConstructor<X>
  }
}

export default X
```

Правила:

- JSDoc у каждого props-поля. Описание + `@type`.
- `XEmits = null` для компонентов без emits — не пропускай поле.
- `XOption` — всегда `Pick<XProps, ...>` подмножества полей, доступных через `componentsOptions.X`.
- `declare module "vue" { GlobalComponents }` — обязательная augmentation для template-IntelliSense.
- `default export` — класс-обёртка, не SFC.

## 6. Testing pattern

Файл `{Name}.test.ts`. Структура:

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import X from "fishtvue/x/X.vue"
import type { XExpose } from "fishtvue/x/X"

describe("X Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(X)
      expect(wrapper.exists()).toBe(true)
    })
    // ... ещё тесты на props/slots/expose
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, { componentsOptions: { X: options } })
      }
    })

    it("applies global options correctly", () => {
      const app = createAppWithFishtVue({ /* ... */ })
      const wrapper = mount(X, { global: { plugins: [app as any] } })
      expect((wrapper.vm as unknown as XExpose).mode).toBe(/* ... */)
    })

    it("overrides global options with local props", () => {
      // ...
    })
  })
})
```

Правила:

- Минимум 5 кейсов: render по дефолту, проверка props, проверка slots, проверка `defineExpose`, наследование global options, override props над options.
- Импорт компонента — `from "fishtvue/x/X.vue"` (полный путь до `.vue`), типы — `from "fishtvue/x/X"`.
- Helper `createAppWithFishtVue(options)` — стандартный, не отступать от формы.
- Запуск: `pnpm test` (Vitest 4, ровно один прогон), `pnpm test:watch` для интерактива, `pnpm coverage` для отчёта.
- Skipped тесты (`it.skip`, `it.todo`) — фиксируются в Known issues документации компонента.

## 7. Naming

| Сущность | Стиль | Пример |
|---|---|---|
| Каталог компонента | kebab-case | `lib/text-editor/`*, `lib/inputlayout/` |
| `.vue` файл | PascalCase | `Button.vue`, `InputLayout.vue` |
| `.ts` файл | camelCase | `arrayHandler.ts`, `domHandler.ts` |
| `.d.ts` (по компоненту) | PascalCase | `Button.d.ts`, `Input.d.ts` |
| `.test.ts` | PascalCase | `Button.test.ts` |
| Props | camelCase | `iconPosition`, `modelValue` |
| Events | kebab-case | `update:modelValue`, `change:modelValue` |
| CSS root class | `fv {prefix}-{kebab-name}` | `fv fishtvue-button` |
| Markdown файл документации | kebab-case | `text-editor.md`, `input-layout.md` |
| Type alias / interface | PascalCase | `ButtonProps`, `XExpose` |

\* Реальный каталог — `lib/texteditor/` (без дефиса). Это историческое отклонение, см. §12.

## 8. Adding a new component (checklist)

1. Создать `lib/<name>/` с файлами `<Name>.vue`, `<Name>.d.ts`, `<Name>.test.ts`, `package.json` (main/types/exports — копия с соседнего компонента).
2. Заполнить `<Name>.vue` по §4.
3. Заполнить `<Name>.d.ts` по §5.
4. Написать тесты (минимум 5 кейсов) по §6.
5. Добавить экспорт в [lib/index.ts](../lib/index.ts) и [lib/index.d.ts](../lib/index.d.ts).
6. Зарегистрировать в [lib/rollup.config.js](../lib/rollup.config.js) (entries + `EXTERNAL_CORE_DEPENDENCIES`).
7. Добавить опции в [lib/config/FishtVue.d.ts](../lib/config/FishtVue.d.ts) (`ComponentsOptions`).
8. При наличии локализации — ключи в [lib/locale/locales/en.ts](../lib/locale/locales/en.ts) и [ru.ts](../lib/locale/locales/ru.ts).
9. Зарегистрировать в Nuxt module — массив `FISHT_VUE_COMPONENTS` в [lib/module/nuxt.ts:79](../lib/module/nuxt.ts#L79).
10. Внутренняя документация: `Documentation/components/<kebab-name>.md` по Шаблону A (см. `.claude/prompts/documentation.md`).
11. Обновить [Documentation/README.md](./README.md) — добавить ссылку в секцию Components.
12. Публичная документация (страница на fisht.org) — отдельной задачей в `/docs/`.
13. `pnpm format && pnpm lint && pnpm typecheck && pnpm test`.
14. Conventional commit: `feat(<name>): add <Name> component` или `feat(<name>): ...`.

## 9. Tooling

| Команда | Что делает | Скрипт в [package.json](../package.json) |
|---|---|---|
| `pnpm lint` | ESLint 9 + auto-fix всему репо. | `eslint --fix .` |
| `pnpm format` | Prettier 3 для `js,ts,vue,d.ts` с кэшем. | `prettier --write "**/*.{js,ts,vue,d.ts}" --cache` |
| `pnpm format:check` | Prettier dry-run. | `prettier --check ...` |
| `pnpm typecheck` | `vue-tsc --noEmit --skipLibCheck`. | См. `package.json#scripts.typecheck`. |
| `pnpm test` | Vitest 4, single run. | `vitest run` |
| `pnpm coverage` | Vitest + v8 coverage. | `vitest run --coverage` |
| `pnpm lib:build` | Production-сборка через Rollup 4. | `cd lib && NODE_ENV=production rollup -c` |

Husky + commitlint ([commitlint.config.js](../commitlint.config.js)) форсят conventional commits в `commit-msg` hook. ESLint flat config — [eslint.config.js](../eslint.config.js). Prettier — [.prettierrc](../.prettierrc).

## 10. Out of scope

- `sandbox/` и `sandbox-nuxt/` НЕ обязаны следовать паттернам §3-§7. Если эксперимент готов к продакшену — переносится в `lib/` с приведением к канону.
- `/docs/` (публичный сайт) — отдельный workspace со своими правилами; этот документ не регламентирует его.

## 11. Documentation regulations

### 11.1 Где живёт что

- **Внутренняя техническая документация** (для контрибьюторов и глубоких справок) — в [Documentation/](./).
- **Публичное руководство пользователя** — в `docs/content/{en,ru}/` (Nuxt Content сайт fisht.org); регламентируется отдельно.
- **README в корне репозитория** — короткий маркетинговый/installation overview.
- **README в `lib/<name>/`** — не используется. Вся документация компонента — в [Documentation/components/<kebab-name>.md](./components).

### 11.2 Язык

- Документация — только на русском.
- Технические термины (props, slot, emit, computed, ref, watch, reactive, store, hook, lifecycle, hydration, SSR, CSP, plugin, layer, type alias, interface, payload, sanitization, focus trap, screen reader, evergreen, breaking change, deprecation, polyfill, bundle, tree-shaking, hot reload) — на английском, без перевода.
- API-имена не переводить: пиши «props», не «пропсы». «v-model contract», не «контракт v-model».

### 11.3 Тон и стиль

- Активный залог, короткие предложения.
- Без маркетинговых эпитетов («powerful», «elegant», «красивый», «удобный», «интуитивный»).
- Без воды: каждое предложение — факт или инструкция.
- Не упоминай текущую задачу или PR в тексте документации — это живёт в commit message и описании PR.
- Комментарии в коде в документ не копируются дословно — пересказывай по смыслу.

### 11.4 Front matter

Обязательные поля: `title`, `summary`, `updated`, плюс `stability` и `since` для документов компонентов и инфра-модулей. Формат:

```yaml
---
title: <Название>
summary: <одно предложение>
updated: <YYYY-MM-DD>
stability: stable | beta | experimental
since: <версия fishtvue>
---
```

Поле `stability`:
- `stable` — есть тесты (≥5 кейсов), нет TODO/FIXME с тэгом BREAKING, публичный API типизирован без `any`.
- `beta` — есть тесты, но в коде есть TODO/FIXME или пропущенные тесты.
- `experimental` — нет тестов, или большая часть API типизирована как `any`, или явные пометки в коде.

### 11.5 Обязательные разделы для компонента и инфра-модуля

18 разделов из Шаблона A в [`.claude/prompts/documentation.md`](../.claude/prompts/documentation.md). Опускать раздел можно только если он явно неприменим, и в этом случае — фраза «Не применимо для этого компонента» с короткой причиной.

### 11.6 Раздел Known issues

Обязателен в каждом документе компонента/инфра-модуля. Если ничего не найдено — явная фраза «На момент ревизии (YYYY-MM-DD) известных проблем нет.» Никаких пустых заголовков и эллипсисов.

### 11.7 Code blocks и примеры

- Только fenced code blocks с указанием языка (` ```vue `, ` ```ts `, ` ```bash `).
- `::preview`, `::callout` и другие Nuxt Content-конструкции запрещены — `Documentation/` это plain markdown.
- Vue SFC всегда `<script setup lang="ts">`.
- Каждый пример должен компилироваться против реального публичного API из `.d.ts`.
- Импорты в примерах — точно как реальные пути: `import Button from "fishtvue/button"`.

### 11.8 Ссылки

- Между документами в `Documentation/` — relative links: `[Input](./components/input.md)`, `[Component class](./architecture/component-class.md)`.
- На исходный код — relative links с `../`: `[Source](../lib/button/Button.vue)`.
- На строку — формат `file:line`: `[Button.vue:42](../lib/button/Button.vue#L42)`.
- Никаких голых URL `fisht.org` внутри `Documentation/` — это внутренний документ.

### 11.9 Таблицы

- Стандартные GFM-таблицы.
- Длинные описания — выноси в текст под таблицей.
- Type-колонка в таблице props — точно как в `.d.ts`, включая union/literal.

### 11.10 Картинки и диаграммы

- Картинки — в `Documentation/_assets/<topic>/<name>.png`, ссылка через relative path.
- Диаграммы — Mermaid в fenced block ` ```mermaid `, не SVG-файлы.

### 11.11 Версионирование документации

- Документация версионируется вместе с кодом — изменилось API, должен измениться соответствующий `.md`.
- Поле `updated` в front matter обновляется при каждом материальном изменении.
- Поле `since` НЕ меняется после создания.
- Поле `stability` пересчитывается при ревизии (перевод beta → stable требует прохождения чек-листа из §11.5 + Known issues пуст).

### 11.12 Чек-лист для review документа

Перед merge документ проверяется по списку:

- [ ] Front matter валиден, все обязательные поля заполнены.
- [ ] Все разделы шаблона на месте (или явная пометка «Не применимо»).
- [ ] Все props/emits/slots/expose из `.d.ts` отражены.
- [ ] Каждый code block компилируется (typecheck).
- [ ] Известные проблемы перечислены или явно «не найдено».
- [ ] Ссылки `file:line` существуют.
- [ ] Язык: русский с английскими техническими терминами, без переведённых API.
- [ ] Никаких `::preview`, никаких упоминаний `/sandbox/*` как примера, никаких ссылок на `/docs/content/*`.

## 12. Known deviations from this pattern

Список мест, где канон не соблюдается на 2026-05-09. Это входной материал для cleanup PR'ов.

### ~~Дублирование `initStyle()`~~ ✅ resolved 2026-05-16 (Wave 2.3)

`Component.__hooks()` ([component/index.ts:79–84](../lib/component/index.ts#L79-L84)) регистрирует `vueOnMounted(() => this.initStyle())` и `onServerPrefetch(() => this.initStyle())`. Раньше 6 SFC дублировали ручной `onMounted(() => X.initStyle())` (7 occurrences): Button, Icons, InputLayout (×2), Menu, Separator, Table. Wave 2.3 (2026-05-16) убрал все дубликаты и поставил comment-marker в каждом затронутом SFC. После sweep'а 21 of 21 core SFC соблюдают канон. Подробности — [Documentation/issues/component-class.md Issue 1](./issues/component-class.md).

### Каталог `texteditor` без дефиса

Все остальные многословные имена записаны kebab-case (`input-layout` → `inputlayout`, `fix-window` → `fixwindow`). Каталог `lib/texteditor/` хранит составное имя без разделителя — историческое отклонение. Решение зафиксировано: оставить как есть, чтобы не ломать публичный entry `fishtvue/texteditor`. Markdown-файл документации именуется `text-editor.md`.

### Опции компонентов в `componentsOptions`

`FishtVueConfiguration.componentsOptions` ([config/FishtVue.d.ts:166–189](../lib/config/FishtVue.d.ts#L166-L189)) перечисляет 22 ключа. Aria, Loading, Icons, FixWindow, Form, Switch, Calendar, TextEditor — присутствуют как ключи, но реальная глубина опций каждого компонента варьируется. Полный аудит — в документах компонентов (раздел Known issues).

### Реактивные словари TW-классов

`Button.vue` хранит словари классов в `ref({...})` ([Button.vue:28–294](../lib/button/Button.vue#L28-L294)) — без надобности в реактивности. `Label.vue` — обходится литералами в массиве. Канон: `const` для словарей. Refactor — отдельный PR.

### `componentsStyle` flag

`StyleMode` ("filled" | "outlined" | "underlined") объявлен в `FishtVueConfiguration` ([FishtVue.d.ts:128](../lib/config/FishtVue.d.ts#L128)), но обработка распределена между компонентами через `Component.componentsStyle()` ([component/index.ts:194–196](../lib/component/index.ts#L194-L196)). Использование разрозненное (Label применяет, Button — нет). Канон: либо все form-controls читают, либо удаляем глобальный флаг.

### Diff на уровне отдельных компонентов

Отдельные расхождения, специфичные для конкретного компонента, фиксируются в разделе Known issues соответствующего файла `Documentation/components/<kebab-name>.md`. Этот документ — каталог системных, повторяющихся расхождений.
