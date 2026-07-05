---
title: Issues — Index
summary: Сводный индекс аудит-документов компонентов и инфра-модулей FishtVue по 60-пунктовому чек-листу + Configuration support + Dual-API gap. Cross-cutting findings, fix roadmap с чекбоксами.
updated: 2026-07-05
last-changes: 2026-07-05 — Wave 9 (B10), residual-батч: оставшиеся 8 компонентов (Split, Pagination, Table, Switch, Badge, InputLayout, FixWindow, Dialog — все уже закрыли номерной B10 через forced-colors + theme-accent, но осознанно оставляли структурные нейтрали) мигрированы с `gray-*`/`stone-*`/`neutral-*`/`slate-*` на `surface-*`, зеркалируя вчерашний батч. Семантик-интент цвета сохранены нетронутыми: `text-red-500` (required-asterisk, Switch), `group-hover:text-red-*` (delete-column hover, Table), `hover:text-red-*` (clear-button hover, InputLayout), `hover:text-yellow-500` (help-icon hover). FixWindow/Dialog — доки в `issues/done/`, остались там (matrix не менялась). **Итог: структурная surface-миграция закрыта для всех 19/22 компонентов библиотеки** (11 вчера + 8 сегодня) — вне scope остаются только Alert (`green`/`yellow`/`blue`/`red` severity-цвета — semantic-intent, отдельный будущий эпик с новыми semantic-слотами) и Loading (20 epic-spinner'ов с hardcoded hex — отдельное прошлое решение не трогать во избежание visual-regression на 22 файлах) и Button (`neutral`-mode — не хардкод, легитимный named color). Полный suite 55/55 файлов, 5614 passed, typecheck 0 errors. Предыдущая запись (2026-07-04, Wave 9 первый батч) — см. историю коммитов.
---

# Issues — Index

Внутренний аудит библиотеки `fishtvue` против 60-пунктового чек-листа индустриальных требований к UI-кит библиотекам, плюс проверка соответствия публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) и анализ dual-API gap для коллекционных компонентов.

> **Принцип:** файл `{component}.md` создаётся ТОЛЬКО при наличии хотя бы одной проблемы. Файл, у которого ВСЕ issues закрыты (включая cross-cutting, не только component-localized), перемещается в `./done/`. Чекбоксы в roadmap'е — single-source-of-truth прогресса.

## Сводка по компонентам

### Активные — есть открытые issues

| Target      | File                               | Critical | High   | Medium | Low    |
| ----------- | ---------------------------------- | -------- | ------ | ------ | ------ |
| Button      | [button.md](./button.md)           | 0        | 0      | 1      | 3      |
| Label       | [label.md](./label.md)             | 0        | 1      | 2      | 0      |
| Aria        | [aria.md](./aria.md)               | 0        | 1      | 1      | 1      |
| Select      | [select.md](./select.md)           | 0        | 1      | 0      | 0      |
| Calendar    | [calendar.md](./calendar.md)       | 0        | 3      | 2      | 2      |
| TextEditor  | [texteditor.md](./texteditor.md)   | 0        | 4      | 4      | 3      |
| Table       | [table.md](./table.md)             | 0        | 0      | 1      | 1      |
| Accordion   | [accordion.md](./accordion.md)     | 0        | 0      | 0      | 1      |
| Alert       | [alert.md](./alert.md)             | 0        | 0      | 0      | 1      |
| Loading     | [loading.md](./loading.md)         | 0        | 0      | 0      | 1      |
| Theme       | [theme.md](./theme.md)             | 0        | 3      | 3      | 2      |
| Uno engine  | [uno-engine.md](./uno-engine.md)   | 0        | 0      | 2      | 0      |
| Locale      | [locale.md](./locale.md)           | 0        | 3      | 4      | 2      |
| Nuxt module | [nuxt-module.md](./nuxt-module.md) | 0        | 5      | 4      | 2      |
| Utilities   | [\_utilities.md](./_utilities.md)  | 0        | 1      | 0      | 1      |
| **TOTAL**   | **25 active + 6 done**             | **0**    | **23** | **31** | **17** |

> **2026-07-04 — Wave 9 (B10), первый батч:** Menu, Icons, Separator закрыли последний открытый пункт (B10 — semantic surface token) и переехали в таблицу «Завершённые» ниже. Select/Calendar/TextEditor/Theme закрыли свою B10-часть, но остаются active — другие открытые issues не связаны с этим заходом. Accordion закрыл color-часть B10, но остаётся active — отдельный, не связанный с этим изменением gap (`forced-colors:outline` отсутствует). См. [theme.md Issue 10](./theme.md) и раздел «Wave 9 — Theming polish» ниже.
>
> **2026-07-05 — Wave 9 (B10), residual-батч:** Split/Pagination/Table/Switch/Badge/InputLayout/FixWindow/Dialog — все уже отображённые в таблице «Завершённые» (`active/ ¹`) или active с другими открытыми issues (Table: G34/D26, не тронуты) — закрыли последний structural-neutral residual тем же rename на `surface-*`. Их числовые счётчики в таблице выше **не менялись** (B10 уже засчитывался resolved в их собственных severity-матрицах до этого захода). Структурная surface-миграция закрыта для всех 19/22 компонентов библиотеки — вне scope: Alert (semantic-intent, отдельный эпик), Loading (epic-spinners, отдельное прошлое решение), Button (`neutral`-mode — легитимный, не хардкод).

### Завершённые — matrix `0/0/0/0`

| Target          | File                                       | Critical | High | Medium | Low | Папка     |
| --------------- | ------------------------------------------ | -------- | ---- | ------ | --- | --------- |
| Input           | [input.md](./input.md)                     | 0        | 0    | 0      | 0   | active/ ¹ |
| Pagination      | [pagination.md](./pagination.md)           | 0        | 0    | 0      | 0   | active/ ¹ |
| Form            | [form.md](./form.md)                       | 0        | 0    | 0      | 0   | active/ ¹ |
| Split           | [split.md](./split.md)                     | 0        | 0    | 0      | 0   | active/ ¹ |
| Switch          | [switch.md](./switch.md)                   | 0        | 0    | 0      | 0   | active/ ¹ |
| Badge           | [badge.md](./badge.md)                     | 0        | 0    | 0      | 0   | active/ ¹ |
| InputLayout     | [inputlayout.md](./inputlayout.md)         | 0        | 0    | 0      | 0   | active/ ¹ |
| Component class | [component-class.md](./component-class.md) | 0        | 0    | 0      | 0   | active/ ¹ |
| Menu            | [menu.md](./menu.md)                       | 0        | 0    | 0      | 0   | active/ ¹ |
| Icons           | [icons.md](./icons.md)                     | 0        | 0    | 0      | 0   | active/ ¹ |
| Separator       | [separator.md](./separator.md)             | 0        | 0    | 0      | 0   | active/ ¹ |
| FixWindow       | [done/fixwindow.md](./done/fixwindow.md)   | 0        | 0    | 0      | 0   | done/     |
| Dialog          | [done/dialog.md](./done/dialog.md)         | 0        | 0    | 0      | 0   | done/     |
| Config          | [done/config.md](./done/config.md)         | 0        | 0    | 0      | 0   | done/     |

> ¹ Numbered-матрица `0/0/0/0`, но файл остаётся в `active/` как трекер cross-cutting волн (semantic-token Wave 9 и т.п.); полностью закрытые файлы перемещены в `./done/`.

Всего **115 numbered issues** заведены по 28 активным документам аудита (Dialog ✅ 2026-05-11 + FixWindow ✅ 2026-05-16 + Config ✅ 2026-05-20 → перенесены в `./done/`); из них открыто 78 (см. TOTAL матрицы), решённые остаются в файлах зачёркнутыми. Прогресс закрытия отслеживается через чекбоксы в Fix roadmap ниже и зачёркнутые блоки внутри каждого `<component>.md`.

## Fix roadmap (live tracker)

Карта исправлений по волнам. Каждая волна — самодостаточная единица доставки (1-3 sprint'а). Внутри волны задачи сгруппированы по unified fix-pattern: один patch закрывает множество issues одновременно. Чекбоксы — единственный source-of-truth прогресса.

**Соглашения по чекбоксам:**

- `[ ]` — не сделано
- `[~]` — в работе (укажи assignee/PR в комментарии справа от чекбокса)
- `[x]` — сделано + PR смёрджен + acceptance criteria закрыты в issue файле

**Workflow закрытия issue:**

1. Чекни `[x]` в roadmap'е.
2. В соответствующем `<issue>.md` помечай `~~текст~~` зачёркнутым + `✅ resolved YYYY-MM-DD (PR #N)` рядом.
3. Если ВСЕ issues файла закрыты (включая cross-cutting) — переместить файл в `./done/` и обновить ссылку в таблице сводки выше.
4. Пересчитать severity matrix в таблице сводки.

---

### 🔴 Wave 1 — Critical security & stability ✅ closed 2026-06-19

> ✅ **Волна закрыта.** Все 14 XSS-сайтов (§1.1), 6+ memory-leak cleanup'ов (§1.2) и оба architecture-blocker'а (§1.3) — `[x]`. Открытого Critical-**кода** в `lib/` не осталось. Остаточные `**Severity:** **critical**`-метки в [menu.md](./menu.md)/[form.md](./form.md) относятся к уже зачёркнутым (resolved) issue-заголовкам и зачёркнуты для консистентности; severity matrix TOTAL Critical = **0**.

**Цель:** убрать все CVE-кандидаты и memory leaks. Без этой волны библиотека не должна публиковаться в production.
**Estimated:** 2-3 sprint'а.
**Зависимости:** нет.
**Параллельно с:** ничем (блокирует публикацию).

#### 1.1 XSS через `v-html` → slot pattern (14 sites, 9 компонентов)

Унифицированный fix: заменить `v-html="X"` на `<slot name="X"><span>{{ X }}</span></slot>`. Сохраняет custom HTML только при явном использовании slot потребителем.

- [x] [Switch.vue:268–270](../../lib/switch/Switch.vue#L268-L270) — `help` prop → `#help` slot · [switch.md Issue 1](./switch.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:372-375](../../lib/inputlayout/InputLayout.vue#L372-L375) — `help` prop → `#help` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает help-XSS во ВСЕХ form-controls** (Input/Aria/Select/Calendar/TextEditor наследуют InputLayout) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:394-398](../../lib/inputlayout/InputLayout.vue#L394-L398) — `messageInvalid` prop → `#messageInvalid` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает validation-XSS во ВСЕХ form-controls** · ✅ resolved 2026-05-11
- [x] [Select.vue marker site](../../lib/select/Select.vue) — `item.marker` → `#marker` scoped slot + safe substring helper (`splitByQuery` + `markerParts` + `<mark>` через `<template v-for>` без `v-html`) · [select.md Issue 1](./select.md) · ✅ resolved 2026-05-11
- [x] [Select.vue noData (×2)](../../lib/select/Select.vue) — `noData` оба сайта → unified `#empty` scoped slot · [select.md Issue 1](./select.md) · ✅ resolved 2026-05-11
- [x] [Form.vue](../../lib/form/Form.vue) — удалён `#item`-override (select-marker copy) → Form переиспользует безопасный default Select (`#marker`/`markerParts`) · [form.md Issue 1](./form.md) · ✅ resolved 2026-06-03
- [x] [Table.vue cell](../../lib/table/Table.vue) — cell `setMarker(...)` v-html → безопасный `markerParts()` + `<mark>` через `<template v-for>` (без v-html); кастомный HTML — через per-column slot · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07 · **был самый опасный: cell content из server data**
- [x] [Table.vue summary](../../lib/table/Table.vue) — summary → text-render `{{ summaryColumns[dataField] }}` · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noData](../../lib/table/Table.vue) — `noData` → `#empty` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noColumn](../../lib/table/Table.vue) — `noColumn` → `#empty-columns` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noFilter](../../lib/table/Table.vue) — `noFilter` → `#empty-filter` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Menu.vue:629](../../lib/menu/Menu.vue#L629) — `item.info` → `#item-info` scoped slot · [menu.md Issue 1](./menu.md) · ✅ resolved 2026-06-06
- [x] [Menu.vue:637](../../lib/menu/Menu.vue#L637) — `item.info` (FixWindow ветка) → переиспользует `#item-info` · [menu.md Issue 1](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — `item.subtitle` → `#item-subtitle` scoped slot · [accordion.md Issue 1](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Alert.vue:263](../../lib/alert/Alert.vue#L263) — `subtitle` → `#subtitle` slot · [alert.md Issue 1](./alert.md) · ✅ resolved 2026-05-11

**Acceptance:** payload `<img src=x onerror=alert(1)>` не исполняется ни в одном из 14 сайтов (CI-test). Документация компонентов §12 Security обновлена с примером кастомизации через slot.

#### 1.2 Memory leaks → onBeforeUnmount cleanup (6 компонентов)

Унифицированный fix: сохранять Observer / DOM listener в `ref`, в `onBeforeUnmount` вызывать `disconnect()` / `removeEventListener()`. Альтернатива — VueUse composables (`useResizeObserver`, `useEventListener`, `useIntersectionObserver`) для auto-cleanup.

- [x] [Select.vue ResizeObserver](../../lib/select/Select.vue) — сохранён в `let resizeObserver` closure + `onBeforeUnmount` disconnect (зеркалит InputLayout pattern) · [select.md Issue 2](./select.md) · ✅ resolved 2026-05-11
- [x] [Select.vue keydown listeners](../../lib/select/Select.vue) — `openSelectOnEnter` и `keydownSelect` cleanup в `onBeforeUnmount` (с `isClient()` SSR-guard) · [select.md Issue 2](./select.md) · ✅ resolved 2026-05-11
- [x] [Calendar.vue:99,338](../../lib/calendar/Calendar.vue#L99) — `MutationObserver` сохранён в setup-scoped `let darkObserver` + disconnect в `onBeforeUnmount` ([Calendar.vue:258-265](../../lib/calendar/Calendar.vue#L258-L265)) · [calendar.md Issue 1](./calendar.md) · ✅ resolved 2026-05-11 · (singleton `useDarkMode()` composable — future direction, не входит в этот fix)
- [x] [Calendar.vue:258-265](../../lib/calendar/Calendar.vue#L258-L265) — keydown listeners cleanup в `onBeforeUnmount` · [calendar.md Issue 1](./calendar.md) · ✅ resolved 2026-05-11
- [x] [Pagination.vue:259-268](../../lib/pagination/Pagination.vue#L259-L268) — anonymous `new ResizeObserver(...)` → сохранён в массив `navigationObservers` + disconnect в `onBeforeUnmount` · [pagination.md Issue 1](./pagination.md) · ✅ resolved 2026-06-06
- [x] [InputLayout.vue:210-214](../../lib/inputlayout/InputLayout.vue#L210-L214) — anonymous ResizeObserver на `beforeInput` сохранить (`let beforeObserver`) + disconnect ([InputLayout.vue:243-248](../../lib/inputlayout/InputLayout.vue#L243-L248)) · [inputlayout.md Issue 2](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:216-220](../../lib/inputlayout/InputLayout.vue#L216-L220) — anonymous ResizeObserver на `afterInput` сохранить (`let afterObserver`) + disconnect ([InputLayout.vue:243-248](../../lib/inputlayout/InputLayout.vue#L243-L248)) · [inputlayout.md Issue 2](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [Table.vue onUnmounted](../../lib/table/Table.vue#L983) — `lastRowVisibleObserver` (IntersectionObserver) добавлен в `onUnmounted` disconnect · [table.md Issue 2](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue onUnmounted](../../lib/table/Table.vue#L983) — `window.mousemove`/`mouseup` cleanup при unmount-while-resize · [table.md Issue 2](./table.md) · ✅ resolved 2026-06-07
- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — `escapeListener` cleanup в `onBeforeUnmount` + reference-counted scroll lock release; `body.style.overflow` восстановление через [lib/utils/scrollLockHandler.ts](../../lib/utils/scrollLockHandler.ts) · [done/dialog.md Issue 2](./done/dialog.md) · ✅ resolved 2026-05-12

**Acceptance:** mount/unmount × 100 в Chrome Memory profiler — heap не растёт (для каждого из 6 компонентов отдельный test). DevTools Performance не показывает retained DOM-узлов с listeners.

#### 1.3 Architecture blockers (2 issues)

- [x] [config/index.ts:18,82,124](../../lib/config/index.ts#L18) — `FishtVueSymbol` стабилизировано: `const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")`, reassign в install удалён, `Symbol.toString()` сравнение заменено на inject-first/window-fallback. · [done/config.md Issue 1](./done/config.md) · ✅ resolved 2026-05-20 · **highest leverage: исправлен inject во ВСЕХ компонентах + component-class Issue 2 (window.FishtVue coupling)**
- [x] [openAlert.ts:106](../../lib/alert/openAlert.ts#L106) — переписан на `createApp(Alert, { ...options, "onUpdate:modelValue": destroy })` — нет manual `addEventListener`, cleanup через Vue emit chain · [alert.md Issue 2](./alert.md) · ✅ resolved 2026-05-11

**Acceptance:** multi-app сценарий (`createApp().use(FishtVue,A)` × 2 с разными configs) — оба работают изолированно. `openAlert` SSR-safe (returns no-op без падения).

---

### 🟠 Wave 2 — Distribution & SSR foundation ✅ closed 2026-06-21

**Цель:** убрать ~70% bundle bloat у потребителя; устранить flash-of-unstyled-content при SSR; превратить library в правильный ESM/CJS dual package.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1 (стабильный FishtVueSymbol — для inject в onServerPrefetch path).
**Параллельно с:** Wave 3 (configuration), но порядок: сначала distribution.

#### 2.1 Packaging (one-time fix в [lib/package.json](../../lib/package.json))

- [x] root `exports` map ✅ 2026-06-11 (Issue 5c-b) — генерируется build-step'ом ([`buildRootExports()` в rollup.config.js](../../lib/rollup.config.js)) из rollup-выходов + вложенных package.json/.d.ts: явные entry на каждый `.mjs` (identity + extensionless) + bare-dir (PascalCase `types`, lowercase `import`) + `./*/package.json`. Strict superset, ноль wildcard-неоднозначности. **Verified:** `npm pack` → install → `import.meta.resolve` 19/19 субпутей в pure Node ESM (раньше падали), исполнение CSS-free субпутей, `tsc` bundler+nodenext типы. Пререкизит **5c-a** (Menu publish-gap: `MenuItem.vue`/`MenuGroup.vue` не публиковались → переведены на `index.ts`-bundle, зеркало Table). Контракт — [lib/package.test.ts](../../lib/package.test.ts). · [button.md Issue 9](./button.md), [table.md Issue 5](./table.md). ESM-only ратифицирован ✅ 2026-06-07.
- [x] [lib/package.json](../../lib/package.json) — `"sideEffects": false` на root ✅ 2026-06-07 (выбран `false`, не массив: в dist нет `.vue`/`.css` — SFC → `.mjs`, CSS инжектится в рантайме через lifecycle, не на import) · контракт в [lib/package.test.ts](../../lib/package.test.ts) · [button.md Issue 8](./button.md) · **per-component:** теперь инъектится в КАЖДЫЙ `dist/{name}/package.json` через `copyDependencies()` на build-step (раньше вручную: Dialog 2026-05-12, FixWindow 2026-05-16, Loading/Menu/Separator/Split 2026-06).
- [x] [lib/package.json](../../lib/package.json) — `vue` из `dependencies` → required `peerDependencies: "^3.5.0"` · [calendar.md Issue 3](./calendar.md) · ✅ resolved 2026-06-19 (Wave 2.1) · контракт в [lib/package.test.ts](../../lib/package.test.ts)
- [x] [lib/package.json](../../lib/package.json) — тяжёлые single-purpose deps `gsap`, `quill`, `@vueup/vue-quill`, `v-calendar` → optional `peerDependencies` + `peerDependenciesMeta.optional: true` · [calendar.md Issue 2](./calendar.md), [texteditor.md Issue 3](./texteditor.md) · ✅ resolved 2026-06-19 (Wave 2.1). **Note:** `lodash-es`/`date-fns`/`tailwind-merge`/`clsx` сознательно ОСТАВЛЕНЫ в `dependencies` — они в core-утилитах (`cn()`/dateHandler) и Select/Table (always-imported); optional ухудшил бы DX без выигрыша. Контракт lock'ает обе границы в [lib/package.test.ts](../../lib/package.test.ts).
- [x] [lib/rollup.config.js:409](../../lib/rollup.config.js#L409) — решено **ESM-only** + добавлен `"engines": { "node": ">=18" }` ✅ 2026-06-07. `get_CJS_ESM()` остаётся выключенным (аудитория — bundler-based Vue/Nuxt, ESM нативен) · [button.md Issue 9](./button.md)
- [x] [lib/package.json](../../lib/package.json) — `"files": ["**/*.mjs","**/*.map","**/*.d.ts","**/package.json","README.md","LICENSE.md","CHANGELOG.md"]` ✅ 2026-06-07. Проброс в `dist/package.json` через `addPackageJson()`; `npm pack --dry-run` из `dist/`: 174 `.mjs` + 174 `.mjs.map` (sourcemaps ✅), 0× `*.test.*`/`.vue`/non-`.d.ts`-`.ts`. `copyDependencies()` дополнительно пропускает `*.test.*` · [table.md Issue 13, 14](./table.md)
- [x] [lib/package.json](../../lib/package.json) — `@nuxt/kit`/`@nuxt/schema` peer range `^4.1.2` → `>=3.0.0` (раньше `^4.1.2` ломал Nuxt 3) · [nuxt-module.md Issue 4](./nuxt-module.md) · ✅ resolved 2026-06-19 (Wave 2.1)

#### 2.2 Lazy import тяжёлых deps

- [x] [lib/icons/Icons.vue](../../lib/icons/Icons.vue) — heroicons точечный `import(`@heroicons/vue/24/{outline\|solid}/${Name}.js`)` + Iconify-fallback (trade-off: async/SSR; `unplugin-icons` для гарантированного tree-shaking) · [icons.md Issue 1](./icons.md), [button.md Issue 7](./button.md) · ✅ resolved 2026-06-12
- [x] [lib/texteditor/TextEditor.vue](../../lib/texteditor/TextEditor.vue) — Quill уже lazy (`await import("@vueup/vue-quill")`); CSS-импорты перенесены в `onMounted` (dynamic `import()`) · [texteditor.md Issue 3](./texteditor.md) · ✅ resolved 2026-06-19 (Wave 2.1)
- [x] [lib/calendar/Calendar.vue](../../lib/calendar/Calendar.vue) — v-calendar `DatePicker` lazy в `onMounted` (ref-based `(await import("v-calendar")).DatePicker` + `<component :is>` — ref→реальный инстанс; CSS lazy) · [calendar.md Issue 2](./calendar.md) · ✅ resolved 2026-06-19 (Wave 2.1)
- [x] [lib/loading/Loading.vue](../../lib/loading/Loading.vue) — Epic-вариации lazy через `defineAsyncComponent` · [loading.md Issue 2](./loading.md) · ✅ 2026-06-03 (уже реализовано: `componentsMapEpic`/`componentsMapSvg` = `() => import(...)`)
- [x] [Button.vue](../../lib/button/Button.vue) — `Loading`/`FixWindow` через `defineAsyncComponent` (async-chunks, грузятся при `loading`/icon-tooltip) · [button.md Issue 6](./button.md) · ✅ resolved 2026-06-12

#### 2.3 SSR style injection

- [x] **Удалить `onMounted(() => X.initStyle())`** из 22 SFC — base class уже вызывает через `onServerPrefetch + vueOnMounted` · [component-class.md Issue 1](./component-class.md). Затрагивает: Button, ~~Label~~ ✅ 2026-05-11, ~~Switch~~ ✅ 2026-05-11, ~~Input~~ ✅ 2026-05-11, ~~Aria~~ ✅ 2026-05-11, ~~Select~~ ✅ 2026-05-11, ~~Calendar~~ ✅ 2026-05-11, ~~Alert~~ ✅ 2026-05-11, ~~Dialog~~ ✅ 2026-05-12, ~~FixWindow~~ ✅ 2026-05-16, ~~Form~~ ✅ 2026-06-03 (initStyle bundled с field-init — снят при правке form.md), ~~TextEditor~~ ✅ 2026-06-19 (Wave 2.1 — был последним реальным дублем), Table, Pagination, Badge, InputLayout, Separator, ~~Split~~ ✅ 2026-06-06, Accordion, ~~Menu~~ ✅ 2026-06-06, ~~Loading~~ ✅ 2026-06-03, ~~Pagination~~ ✅ 2026-06-13, Icons. **Прогресс:** ✅ фактически завершено. Source-scan `lib/**/*.vue` (2026-06-19): **0 SFC с прямым `initStyle()`-вызовом** (TextEditor был последним); остальные unstruck-имена (Button/Table/Pagination/Badge/InputLayout/Separator/Accordion/Icons) несут канонический комментарий «`initStyle()` НЕ вызывается тут» либо вовсе не вызывают его — дубля нет.
- [x] [component/index.ts:159-169](../../lib/component/index.ts#L159-L169) — `Component.__stylesBase` else-ветка оборачивает component-style в `@layer fishtvue` и без `optionsTheme.layers` (зеркало base-style; canon-correction: seam **НЕ** в `useStyle.ts` — там был бы двойной wrap base-style) · [theme.md Issue 4](./theme.md) · ✅ resolved 2026-06-21 (Wave 2)
- [x] [theme/helpers/useStyle.ts:43-45](../../lib/theme/helpers/useStyle.ts#L43-L45) — HMR teardown: `load()` реюзает `style[data-fishtvue-style-id]` (replace content, не append new) · [component-class.md Issue 3](./component-class.md) · ✅ resolved 2026-06-14 (stale roadmap-checkbox синхронизирован 2026-06-21)

#### 2.4 Body scroll lock — reference counted

- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — заменено на reference-counted singleton [lib/utils/scrollLockHandler.ts](../../lib/utils/scrollLockHandler.ts) (`lockBodyScroll` / `unlockBodyScroll` + counter + сохранение оригинальных `body.style.overflow` / `paddingRight`) · [done/dialog.md Issue 3](./done/dialog.md) · ✅ resolved 2026-05-12 · готов к переиспользованию Split
- [x] [Split.vue:103-105](../../lib/split/Split.vue#L103-L105), [Split.vue:717](../../lib/split/Split.vue#L717) — `document.body.classList.add(cursorClass)` → локальный overlay div `<div data-split-drag-overlay>` (без global state мутации, `watch(activeCursorPanel)` удалён) · [split.md Issue 1](./split.md) · ✅ resolved 2026-06-06

**Acceptance:** `pnpm sandbox:build` + analyzer показывает ~70% bundle reduction для consumer не использующего Calendar/TextEditor/много heroicons. SSR-render через `renderToString` содержит inline `<style>` с правилами компонентов (snapshot test). DevTools Memory: HMR-обновление компонента 50× → один `<style>` в head, не 50.

---

### 🟠 Wave 3 — Configuration support (документация → реальность) ✅ closed 2026-07-02

**Цель:** закрыть documentation lies — публичная Configuration-док обещает API которого нет.
**Estimated:** 2-3 sprint'а.
**Зависимости:** Wave 1.3 (стабильный FishtVueSymbol).
**Параллельно с:** Wave 4 (a11y) — независимо.

> **Canon-заметка (2026-07-02, закрытие волны).** Пункт 3.3 «Style invalidation mechanism (event-bus или watcher → все `Component.initStyle()` реinject)» реализован **НЕ буквально**: по решению владельца (после анализа эффективности собственного uno-движка) выбрана **CSS-variable indirection** — движок эмитит палитру через `rgb(var(--fv-{name}-{tone}, fallback))`, а runtime API переписывает один `:root`-tokens-тег (`FishtVueTokens`). Acceptance «usePreset → все компоненты перерисуются» выполняется без invalidation и без live-чтения config в правилах (движок — process-wide singleton; live-binding дал бы утечку тем между apps/tenants в SSR). Runtime-смена `darkModeSelector` остаётся known limitation ([architecture/theme.md §18](../architecture/theme.md#18-known-issues--limitations)).

#### 3.1 `unstyled: true` enforcement (один фикс → 22 компонента)

- [x] [component/index.ts:138](../../lib/component/index.ts#L138) — в `Component.setStyle()` (134-157) добавлен guard `if (this.__globalConfig?.config?.unstyled) return ""` · [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md) · ✅ resolved 2026-05-11 (cross-cutting — закрывает Issue 6 во всех 22 компонентах одной правкой)
- [x] Тест: Select.test.ts > `respects unstyled: true via Component.setStyle guard` — `class` корня пустой при `unstyled: true`. Демонстрирует cross-cutting эффект (применимо ко всем компонентам — same setStyle entry point).

#### 3.2 `componentsStyle` global fallback consistency

Унификация: все form-controls с `mode` prop должны учитывать `Component.componentsStyle()` в fallback chain.

- [x] [Button.vue](../../lib/button/Button.vue) — computed `componentsStyleMode` mapping (`filled→primary`, `outlined→outline`, `underlined→ghost`) в fallback chain `mode` · [button.md Issue 13](./button.md) · ✅ resolved 2026-06-12
- [x] [Input.vue:62-64](../../lib/input/Input.vue#L62-L64) — добавить `?? Input.componentsStyle()` в fallback · [input.md Issue 2](./input.md) ✅ 2026-05-11
- [x] [Aria.vue:49-51](../../lib/aria/Aria.vue#L49-L51) — добавить `?? Aria.componentsStyle()` · [aria.md Issue 4](./aria.md) ✅ 2026-05-11
- [x] [Select.vue](../../lib/select/Select.vue) — добавлено `?? options?.mode ?? Select.componentsStyle()` в fallback chain (`mode` computed) · [select.md Issue 5](./select.md) · ✅ resolved 2026-05-11
- [x] [Calendar.vue:106-108](../../lib/calendar/Calendar.vue#L106-L108) — добавлено `?? Calendar.componentsStyle()` · [calendar.md Issue 6](./calendar.md) · ✅ resolved 2026-05-11
- [x] [TextEditor.vue:52-55](../../lib/texteditor/TextEditor.vue#L52-L55) — добавлено `?? TextEditor.componentsStyle()` в mode-цепочку (зеркало Input) · [texteditor.md Issue 7](./texteditor.md) · ✅ resolved 2026-07-02 (+ source-scan тест)
- [x] [Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23) — добавить mapping (`filled→primary`, `outlined→outline`, `underlined→neutral`) · [badge.md Issue 2](./badge.md) ✅ 2026-05-10

#### 3.3 Theme runtime API (новый файл per function) ✅ closed 2026-07-02

Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает функции — реализованы через CSS-variable indirection (см. canon-заметку выше + [theme.md Issue 1](./theme.md)).

- [x] [lib/theme/usePreset.ts](../../lib/theme/usePreset.ts) — полная замена пресета (`linksTheme`) + перезапись tokens-тега · ✅ 2026-07-02
- [x] [lib/theme/updatePreset.ts](../../lib/theme/updatePreset.ts) — deepMerge поверх копии текущей темы + перезапись · ✅ 2026-07-02
- [x] [lib/theme/updatePrimaryPalette.ts](../../lib/theme/updatePrimaryPalette.ts) — брендовый слот = цвет `theme` (`semantic.primary` → `--fv-theme-*` override; hex-палитра / `'{indigo.500}'`-refs / одиночный hex → `palette()`) · ✅ 2026-07-02
- [x] [lib/theme/updateSurfacePalette.ts](../../lib/theme/updateSurfacePalette.ts) — `semantic.surface` → `--fv-surface-*` с `light`/`dark` scoping (dark → `darkModeSelector`/`prefers-color-scheme`); потребление компонентами — 19/19 структурных ✅ 2026-07-05 (11/19 2026-07-04 + residual 8/19 2026-07-05), Alert epic — см. Wave 9 ниже · ✅ 2026-07-02
- [x] [lib/theme/$dt.ts](../../lib/theme/$dt.ts) — token metadata lookup (`{ name?, variable?, value }` по dot-path) · ✅ 2026-07-02
- [x] `palette` — уже экспортировался из [lib/theme/index.ts](../../lib/theme/index.ts) (stale-пункт); добавлена `'{blue}'`-форма из публичного контракта · ✅ 2026-07-02
- [x] [lib/theme/index.ts](../../lib/theme/index.ts) — re-export всех функций (+ типовые декларации в [Theme.d.ts](../../lib/theme/Theme.d.ts)) · ✅ 2026-07-02
- [x] ~~Style invalidation mechanism (event-bus/watcher)~~ → **закрыт by design** CSS-variable indirection: движок эмитит `rgb(var(--fv-…, fallback))` ([unoStyle/helpers.ts `resolveColor`](../../lib/theme/unoStyle/helpers.ts)), install инжектит tokens-тег ([helpers/tokensCss.ts](../../lib/theme/helpers/tokensCss.ts), [config/index.ts:169-172](../../lib/config/index.ts#L169-L172)), runtime API переписывает его — reinject/invalidation не нужны · ✅ 2026-07-02
- [x] [Documentation/architecture/theme.md](../architecture/theme.md) — §2/§3/§8/§10.2.1/§10.3/§18 обновлены · ✅ 2026-07-02

#### 3.4 `darkModeSelector` через UnoCSS preset

- [x] `dark:*` варианты генерируются на основе `optionsTheme.darkModeSelector` config · ✅ 2026-06-12 — оказалось **уже реализовано**: `Component.setStyle` прокидывает `darkSelector` ([component/index.ts:150](../../lib/component/index.ts#L150)) → `tailwind()` подменяет media-query на селектор ([unoStyle/tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95)). Правок движка не потребовалось · [theme.md Issue 5](./theme.md), [button.md Issue 16](./button.md)
- [x] Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` → компонент рендерит dark-стили на настроенный селектор · ✅ 2026-06-12 — [lib/theme/darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) (plugin-config через probe) + engine-кейсы в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts).

#### 3.5 Locale fallback chain + interpolation

- [x] [component/index.ts `t(key)`](../../lib/component/index.ts#L191) — fallback chain: `messages[active] → messages[default] → key` · [config.md Issue 3](./config.md), [locale.md Issue 2](./locale.md) · ✅ resolved 2026-05-20
- [x] Параметризованный `t(key, params)` с interpolation `{name}` ([component/index.ts:191](../../lib/component/index.ts#L191) + [stringHandler.interpolate](../../lib/utils/stringHandler.ts)) · [locale.md Issue 3](./locale.md) · ✅ resolved 2026-06-19
- [x] Pluralization rules per-locale (Russian имеет 4 формы) — CLDR через `Intl.PluralRules` ([stringHandler.selectPlural](../../lib/utils/stringHandler.ts); `<selector> <text>`-формы `=N`/CLDR через `|`) · [locale.md Issue 3](./locale.md) · ✅ resolved 2026-06-19

**Acceptance:** все обещания публичной [docs/content/ru/3.Configuration/](../../docs/content/ru/3.Configuration/) проверяемы тестами ✅ ([themeApi.test.ts](../../lib/theme/themeApi.test.ts) 16 + [colorVars.test.ts](../../lib/theme/unoStyle/colorVars.test.ts) 18). `import { usePreset } from "fishtvue/theme"` работает ✅ (+ dist-смоук в pure Node ESM). `unstyled: true` отключает стили во всех 22 компонентах ✅ (3.1, 2026-05-11). Browser-verified: runtime-перекрашивание живых компонентов в sandbox.

---

### 🟠 Wave 4 — A11y baseline (WCAG 2.1 AA conformance) ✅ closed 2026-06-20

**Цель:** library проходит axe-core / Lighthouse для базовых интерактивных компонентов.
**Estimated:** 2-3 sprint'а.
**Зависимости:** Wave 1.2 (memory leaks Dialog/Menu) — focus trap зависит от чистого unmount.
**Параллельно с:** Wave 3, Wave 5.

#### 4.1 Focus management (Dialog + popover)

- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — focus trap **dependency-free** (собственный `FOCUSABLE_SELECTOR` + Tab/Shift+Tab cycle; НЕ VueUse `useFocusTrap` — `@vueuse/core` удалён из deps при FixWindow-рефакторе) · [done/dialog.md](./done/dialog.md) · ✅ resolved (тесты Dialog.test.ts «focus trap»)
- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — focus return на trigger при close (`triggerEl = document.activeElement` при open, restore при close; prop `returnFocus` default `true`) · [done/dialog.md](./done/dialog.md) · ✅ resolved
- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby` + `tabindex="-1"` · [done/dialog.md](./done/dialog.md) · ✅ resolved
- [x] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — prop `focusTrap?: boolean` (popover-mode, default `false`) + computed `role` (tooltip/dialog/menu) + aria-props + `initialFocus`/`returnFocus` · [done/fixwindow.md](./done/fixwindow.md) · ✅ resolved
- [x] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — focus return при close (когда `focusTrap` + `returnFocus`) · [done/fixwindow.md](./done/fixwindow.md) · ✅ resolved

#### 4.2 ARIA roles + attributes

- [x] [Button.vue:382–390](../../lib/button/Button.vue#L382-L390) — `aria-label` для icon-кнопок (с dev-warning если type="icon" без label) · [done/button.md Issue 2](./button.md) · resolved 2026-05-10
- [x] [Label.vue:76](../../lib/label/Label.vue#L76) — корень `<label data-label :for="forId">` + prop `forId` · [label.md Issue 1](./label.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) — **label↔control association** (Wave 4, 2026-06-19): `useId()` → `fieldId`/`labelId`, `<Label :id :for-id>`, scoped `<slot :id :labelledby>`; потребители (Input/Aria — `for`; Select/Calendar/TextEditor — `aria-labelledby`; Select +`role="combobox"`/`aria-expanded`) забиндили scope · [inputlayout.md Issue 10](./inputlayout.md) · ✅ resolved
- [x] [Pagination.vue:292-297](../../lib/pagination/Pagination.vue#L292) — `<nav role="navigation" aria-label>` + `aria-current="page"` (per-page `aria-label`) · [pagination.md Issue 4](./pagination.md) · ✅ resolved 2026-06-13 (код+тесты «Accessibility (ARIA)»; stale roadmap-checkbox синхронизирован 2026-06-20)
- [x] [Loading.vue](../../lib/loading/Loading.vue) — `role="status"` + `aria-live="polite"` + `aria-label` (локализован через `loading.label`) + `sr-only` span · [loading.md Issue 3](./loading.md) · ✅ resolved 2026-06-03
- [x] [Alert.vue:255](../../lib/alert/Alert.vue#L255) — `role="alert"`/`role="status"` + `aria-live` + `aria-atomic` mapped per `type` · [alert.md Issue 3](./alert.md) · ✅ resolved 2026-05-11
- [x] [Menu.vue](../../lib/menu/Menu.vue) — `role="menu"`/`menuitem`/`group`/`separator` + `aria-orientation` + `aria-haspopup` + `aria-expanded` · [menu.md Issue 4](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — disclosure pattern: header `<button aria-expanded aria-controls>` + content `role="region" aria-labelledby` · [accordion.md Issue 3](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Split.vue:674-685](../../lib/split/Split.vue#L674-L685) — resize handle `role="separator"` + `aria-orientation` + `aria-valuenow/min/max` + `aria-controls` (role/valuenow уже были; добавлены orientation/controls + panel `id` через `useId`) · [split.md Issue 4](./split.md) · ✅ resolved 2026-06-06
- [x] [Table.vue](../../lib/table/Table.vue) — `<caption>` prop+slot (sr-only); `<th scope="col">` уже был (thead/colgroup/tfoot) · [table.md Issue 8](./table.md) · ✅ resolved 2026-06-07
- [x] [Icons.vue](../../lib/icons/Icons.vue) — default `aria-hidden="true"` + prop `:label` для семантических (wrapper-based pattern) · [icons.md Issue 3](./icons.md) ✅ 2026-05-10
- [x] [Separator.vue](../../lib/separator/Separator.vue) — корень `<div role="separator" :aria-orientation>` (unconditional, без нового prop) · [separator.md Issue 2](./separator.md) · ✅ resolved 2026-06-06

#### 4.3 Keyboard navigation

- [x] [Menu.vue](../../lib/menu/Menu.vue) — ArrowUp/Down между items, ArrowRight/Left для submenu, Home/End, typeahead, roving tabindex · [menu.md Issue 3](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — ArrowUp/Down/Home/End между header items + roving tabindex · [accordion.md Issue 4](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Split.vue:453](../../lib/split/Split.vue#L453) — стрелки на focused resize handle (Shift — крупный шаг, Home/End — экстремумы; direction-aware) · [split.md Issue 5](./split.md) · ✅ resolved 2026-06-06
- [x] [Select.vue keydownSelect](../../lib/select/Select.vue#L586) — ArrowUp/Down (roving tabindex, уже было) + **Home/End** (`focusItemAt`, прыжки к первому/последнему) + **first-char typeahead** для `noQuery`-listbox (`typeaheadFocus`, матч по textContent + APG-циклирование на повторе символа; в default-режиме печать фокусит search-input → фильтрация = de-facto typeahead) · ✅ resolved 2026-06-20

#### 4.4 aria-live announcements

- [x] [Select.vue](../../lib/select/Select.vue) — `<div data-select-aria-live class="sr-only" aria-live="polite" aria-atomic="true">{{ ariaResultsLabel }}</div>` для search results + новые locale-ключи `select.resultsCount` / `select.resultsCountOne` / `select.resultsCountNone` (en + ru + TypesLocale) · [select.md Issue 8](./select.md) · ✅ resolved 2026-05-11
- [x] [Pagination.vue:298-307](../../lib/pagination/Pagination.vue#L298) — announce «Page N of M» при switchPage (sr-only `role="status"` `aria-live="polite"` `aria-atomic="true"`) · [pagination.md Issue 5](./pagination.md) · ✅ resolved 2026-06-13 (код+тест «renders a polite live region»; stale roadmap-checkbox синхронизирован 2026-06-20)
- [x] [Table.vue](../../lib/table/Table.vue) — announce filter/sort/search results count (sr-only `[data-table-aria-live]` polite + `table.resultsCount*`) · [table.md Issue 9](./table.md) · ✅ resolved 2026-06-07
- [x] [InputLayout.vue:443-451](../../lib/inputlayout/InputLayout.vue#L443-L451) — `aria-live="assertive"` + `aria-atomic="true"` на error region · [inputlayout.md Issue 6](./inputlayout.md) · ✅ resolved 2026-05-11

**Acceptance:** axe-core CI passes для каждого компонента. Lighthouse a11y score = 100 для sandbox-pages со всеми компонентами. Manual screen-reader test (NVDA/VoiceOver) — каждый интерактивный компонент озвучивается корректно.

---

### 🟠 Wave 5 — Floating UI integration ✅ closed 2026-07-02

**Цель:** все popover/tooltip/dropdown позиционируются корректно при scroll/resize/viewport-overflow. Click-outside работает через Teleport.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1.2 (FixWindow listeners cleanup).
**Параллельно с:** Wave 4 (a11y) — независимо.

- [x] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — canon-correction: пункт устарел вдвойне — `@floating-ui/vue`-интеграция была сделана 2026-05-16, а **затем намеренно удалена** 2026-06-14 (по запросу пользователя: минимум рантайм-зависимостей) в пользу собственного dependency-free `useFloating.ts`/`useClickOutside.ts` (auto-flip/auto-shift/scroll-tracking — полный паритет). Буквальная реализация этого пункта означала бы отмену ратифицированного решения — НЕ выполняется · [done/fixwindow.md Issue 2 Migration follow-up](./done/fixwindow.md) · ✅ resolved 2026-07-02 (roadmap sync)
- [x] [FixWindow.vue:75,662](../../lib/fixwindow/FixWindow.vue#L75) — `teleport?: string | HTMLElement | false` computed (default `false`, backward-compat) + `<Teleport :to :disabled>` в template · [done/fixwindow.md Issue 1](./done/fixwindow.md) · ✅ resolved 2026-05-16 (stale roadmap-checkbox синхронизирован 2026-07-02)
- [x] [FixWindow.vue:503](../../lib/fixwindow/FixWindow.vue#L503) — click-outside через собственный `useClickOutside` (dependency-free, Teleport-aware via `composedPath`) — handles teleport · [done/fixwindow.md Issue 3](./done/fixwindow.md)
- [x] [FixWindow.vue:77-81](../../lib/fixwindow/FixWindow.vue#L77-L81) — `role` computed (`tooltip` при `eventOpen==='hover'`, иначе `dialog`, explicit override через prop) — уже задвоено в закрытой Wave 4 §4.1 (тот же `done/fixwindow.md` кредит) · [done/fixwindow.md Issue 8](./done/fixwindow.md) · ✅ resolved 2026-05-16 (stale + duplicate-credit синхронизирован 2026-07-02)
- [x] **Verify Calendar/Select/Menu** наследуют новый FixWindow без regression — все имеют integration tests. **Menu ✅ 2026-06-06** (submenu через FixWindow с Floating UI + focus trap; nested `<Menu>` рендерится корректно — `Menu.test.ts`); **Table ✅ 2026-06-11** (filter + cell-editor Select/Calendar плавают через FixWindow с `scrollableEl: tableBody` — [table.md Issue 10](./table.md)); **Calendar ✅** (dropdown через `<FixWindow v-bind="paramsFixWindow">`, покрыт Mode/Date-selection тестами); **Select ✅** (явный integration-тест `wrapper.findComponent({name:"FixWindow"})` + `paramsFixWindow`-passthrough в `describe("Select Component - custom strategies")`). Регрессии нет и после dependency-free-миграции 2026-06-14 — весь suite зелёный · ✅ resolved 2026-07-02

**Acceptance:** popover не обрезается при overflow:hidden родителя; auto-flip при near viewport edge; scroll body — позиция обновляется. Calendar/Select/Menu pop-ups работают через Teleport.

---

### 🟡 Wave 6 — Dual-API parallel (compound + schema)

**Цель:** competitive parity с AG Grid / Element Plus / Naive UI / PrimeVue. Параллельный compound API без breaking change для schema-driven.
**Estimated:** 4-6 sprint'ов (один компонент на sprint).
**Зависимости:** Wave 1 (XSS slot pattern — base для composition), Wave 4 (a11y patterns).
**Порядок внутри волны:** Table → Form → Select → Menu → Accordion (по приоритету ROI).

Унифицированный fix-pattern: `provide(CONTEXT, { register, unregister })` в parent + child компоненты регистрируют себя при mount. Schema-driven prop (`:dataColumns`, `:structure`, `:dataSelect`, `:items`) выигрывает при конфликте — backward compat.

#### 6.1 Table → `<Table><Column>` — ✅ resolved 2026-06-07

> Реализовано через **VNode-walk `slots.default()`** (канон FishtVue, зеркало Menu), а НЕ provide/inject — `TableContext.ts` не понадобился (renderless-дети читаются по имени из default-slot).

- [x] `lib/table/Column.vue` + `lib/table/ColumnGroup.vue` — renderless descriptors (VNode-walk, не inject) · [table.md Issue 3](./table.md) · ✅ 2026-06-07
- [x] ~~`lib/table/TableContext.ts`~~ — не нужен: VNode-walk вместо provide/inject (canon — зеркало Menu) · ✅ 2026-06-07
- [x] [Table.vue](../../lib/table/Table.vue) — `compoundParsed` walk (Fragment-flatten, по имени), `columns` computed fallback к compound, schema `:columns` выигрывает · ✅ 2026-06-07
- [x] Per-column scoped slots `cell`/`header`/`filter` — захватываются с vnode и рендерятся через `RenderColumnSlot` · ✅ 2026-06-07 (`summary` — через существующий tfoot, отдельный slot не вводился)
- [x] `<ColumnGroup>` multi-level headers + `<Pagination>`/`<Loading>` overrides (сверх исходного ТЗ) · ✅ 2026-06-07
- [x] Регистрация: `fishtvue/table` named-экспорты (rollup entry → index.ts) + root barrel + Nuxt `FISHT_VUE_SUBCOMPONENTS` · ✅ 2026-06-07
- [x] [Documentation/components/table.md](../components/table.md) §10.5 «Compound API» · ✅ 2026-06-07
- [x] Тесты: `Column.test.ts` 14 кейсов (schema/compound/precedence/slots/group/override/reactivity) · ✅ 2026-06-07

#### 6.2 Form → `<Form><FormField>` + `<FormSection>` — ✅ resolved 2026-06-13

> Реализовано через **VNode-walk `slots.default()`** (канон FishtVue, зеркало Table/Menu), а НЕ provide/inject.

- [x] `lib/form/FormField.vue` + `lib/form/FormSection.vue` — renderless descriptors (VNode-walk) · [form.md Issue 2](./form.md) · ✅ 2026-06-13
- [x] `registerFieldType("MyField", ...)` — open typeField union + [lib/form/fieldRegistry.ts](../../lib/form/fieldRegistry.ts) · [form.md Issue 3](./form.md) · ✅ 2026-06-13
- [x] Native `<form @submit>` + FormData (`action`/`method`/`enctype`/`nativeSubmit`) · [form.md Issue 4](./form.md) · ✅ 2026-06-13
- [x] Регистрация: `fishtvue/form` named-экспорты (rollup entry → index.ts) + root barrel + Nuxt `FISHT_VUE_SUBCOMPONENTS` · ✅ 2026-06-13
- [x] [Documentation/components/form.md](../components/form.md) §10.5 Compound API + §M native submit + custom field types · ✅ 2026-06-13

#### 6.3 Select → `<Select><SelectOption>` + `<SelectGroup>`

- [ ] `lib/select/SelectOption.vue` + `lib/select/SelectGroup.vue` · [select.md Issue 3](./select.md)
- [ ] Children walk + Fragment-flatten.
- [ ] [Documentation/components/select.md](../components/select.md) §10.5.

#### 6.4 Menu → `<Menu><MenuItem>` + `<MenuGroup>`

- [x] `lib/menu/MenuItem.vue` + `lib/menu/MenuGroup.vue` (renderless descriptors; VNode-walk вместо provide/inject) · [menu.md Issue 2](./menu.md) · ✅ resolved 2026-06-06
- [x] Submenu через recursive `<MenuItem><MenuItem></MenuItem></MenuItem>`. · ✅ resolved 2026-06-06 (экспорт через root barrel; `:groups` выигрывает; [menu.md §9.5](../components/menu.md))

#### 6.5 Accordion → `<Accordion><AccordionItem>`

- [x] `lib/accordion/AccordionItem.vue` · [accordion.md Issue 2](./accordion.md) · ✅ resolved 2026-06-14 (renderless descriptor + VNode-walk; compound-entry в `lib/rollup.config.js`; `:data-source` выигрывает; [accordion.md §9.4](../components/accordion.md))

**Acceptance:** для каждого из 5 компонентов schema-driven и compound API работают одновременно (test). Volar autocomplete для child-компонентов работает. Documentation обновлена с примерами обоих API.

---

### 🟡 Wave 7 — Performance & virtualization

**Цель:** library работает с 10k+ rows без deg.
**Estimated:** 1-2 sprint'а.
**Зависимости:** нет (Table virtual сделан dependency-free, без Wave 6.1).
**Параллельно с:** Wave 8.

- [x] [Table.vue](../../lib/table/Table.vue) — `virtual?: boolean | { rowHeight?, overscan?, threshold? }`, **dependency-free** windowing (fixed rowHeight, spacer-`<tr>`, absolute index, `aria-rowcount`/`aria-rowindex`); auto + opt-out · [table.md Issue 4](./table.md) · ✅ resolved 2026-06-07
- [ ] [Select.vue](../../lib/select/Select.vue) — то же для dropdown list · [select.md Issue 7](./select.md)
- [ ] [Menu.vue](../../lib/menu/Menu.vue) — то же для длинных menu (опционально) · [menu.md](./menu.md)
- [ ] [TextEditor.vue:98](../../lib/texteditor/TextEditor.vue#L98) — Quill image-button → custom handler с emit `image-upload-request` (вместо base64-инжекции) · [texteditor.md Issue 6](./texteditor.md)

**Acceptance:** 10k rows Table initial render <100ms, scroll 60fps. 5k options Select dropdown — same. Quill image-handler не инжектит multi-megabyte data-URLs.

---

### 🟡 Wave 8 — Localization & i18n

**Цель:** library reaches RTL + non-English markets.
**Estimated:** 2 sprint'а.
**Зависимости:** Wave 3.5 (locale fallback + interpolation).

#### 8.1 RTL support

- [~] Глобальная замена `left/right` Tailwind classes на `start/end` (logical) во всех компонентах · cross-cutting issue. **Прогресс 2026-06-11:** Table ([Table.vue](../../lib/table/Table.vue) — resize-handle `pe-2` + `rtl:`-override inset + dir-aware `resizeColumn` width-math; group-label `start-*`/`ps-*`) ✅ [table.md Issue 11](./table.md). **2026-06-13:** Pagination ([Pagination.vue:182–183](../../lib/pagination/Pagination.vue#L182-L183) — directional иконки `rtl:-scale-x-100` + физический `ml-3` → logical `ms-3`; порядок prev/next зеркалит `inline-flex` нативно, без `flex-row-reverse`) ✅ [pagination.md Issue 6](./pagination.md). **2026-06-13:** Split ([isRtlHorizontal — Split.vue:408](../../lib/split/Split.vue#L408) — dir-aware pointer-resize-математика + keyboard-инверсия; физических `left/right` offset'ов у Split нет → логические-классы не нужны) ✅ [split.md Issue 7](./split.md). **2026-06-13:** Switch ([Switch.vue:126–127](../../lib/switch/Switch.vue#L126-L127) — `classAfterInput` `end-0` + `classIconBody` `me-2`; thumb `translate-x` оставлен как позиционирование внутри controlled-track) ✅ partial [switch.md Issue 8](./switch.md). **2026-06-13:** Badge ([Badge.vue:53–60](../../lib/badge/Badge.vue#L53-L60) — физические `pl-1`/`pr-1` → логические `ps-1`/`pe-1` для point/close-padding; `inline-flex` зеркалит порядок point/close нативно) ✅ [badge.md Issue 6](./badge.md). **2026-06-14:** Accordion ([Accordion.vue](../../lib/accordion/Accordion.vue) — заголовок `text-left` → `text-start`, иконки `ml-8` → `ms-8`; вертикальная Arrow Up/Down-навигация направление-нейтральна) ✅ [accordion.md Issue 7 · F31](./accordion.md). **2026-06-14:** Separator ([Separator.d.ts](../../lib/separator/Separator.d.ts) + [Separator.vue:20](../../lib/separator/Separator.vue#L20) — `contentPosition` logical `start`/`end` (+ deprecated `left`/`right` алиасы + dev-warn); порядок line-сегментов зеркалит flex main-axis нативно, направление градиента — `rtl:bg-gradient-to-*`; `useDirectionality()` не нужен) ✅ [separator.md Issue 3](./separator.md). **2026-06-14:** Alert (NEW локальный `AlertPosition` — logical `start`/`end`/`top-start`/`bottom-end` (+ deprecated физ. `left`/`right`/`top-left`/… с dev-warn); `Alert.vue` `positionLogical` + slide-in `rtl:`-флип translate + `ms-3`/`ms-auto ps-3`; `openAlert` `toLogicalPosition()` нормализация + `start-0`/`end-0`/`ps-*`/`pe-*` + физ./лог. дедуп контейнера; `PositionShort` shared с Dialog не тронут) ✅ [alert.md Issue 7](./alert.md). Движок поддерживает `rtl:`/`ltr:` + логические `start`/`end`/`pe`/`ps` — pattern готов к применению на остальных компонентах.
- [x] [Button.d.ts](../../lib/button/Button.d.ts) — `iconPosition: "start" | "end"` (deprecation `"left"|"right"`) · [button.md Issue 3](./button.md) · RTL делегирован `inline-flex` main-axis (без отдельного CSS) · ✅ resolved 2026-06-07
- [x] [Separator.d.ts](../../lib/separator/Separator.d.ts) — `contentPosition: "start" | "end"` (deprecated `"left"|"right"` + dev-warn) · RTL-порядок сегментов делегирован flex main-axis, градиент — `rtl:bg-gradient-to-*` · [separator.md Issue 3](./separator.md) · ✅ resolved 2026-06-14
- [ ] Auto-detect `<html dir="rtl">` через `useDirectionality()` composable + соответствующий API в Locale (Issue 4 в [locale.md](./locale.md))
- [ ] Тесты с `dir="rtl"` для каждого компонента (snapshot-based).

#### 8.2 i18n текстов

- [~] [rulesHandler.ts / rulesMethods.ts](../../lib/utils/rulesHandler.ts) — validation messages локализуются. **Прогресс 2026-06-03:** `setDefaultRuleMessages()` + locale-ключи (`invalidEmail` и др.) уже в [locales/{en,ru}.ts](../../lib/locale/locales/); ~~Form~~ ✅ авто-применяет их через `applyLocaleToRules()` (guarded `useFishtVue()` + `watch(getActiveLocale)`) · [form.md Issue 6](./form.md). Остаётся: авто-wiring для standalone Input/Select без Form.
- [x] [Calendar.vue:102-105, 378, 391](../../lib/calendar/Calendar.vue#L102-L105) — `getActiveLocale()` пробрасывается в `<DatePicker :locale>`, priority `props > options > active > "en"` · [calendar.md Issue 8](./calendar.md) · ✅ resolved 2026-05-11
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — Quill toolbar tooltips через i18n · [texteditor.md Issue 8, 9](./texteditor.md)
- [~] [numberHandler.convertToPhone](../../lib/utils/numberHandler.ts) — параметризовать по locale · [input.md Issue 7](./input.md). **Прогресс 2026-05-11:** `phoneFormats` пробрасывается через `InputProps.phoneFormats` + `InputOption.phoneFormats`; `toPhone(e, options)` расширен. Auto-bind к активной локали — оставлен на следующую итерацию (требует расширения `lib/locale/` + либо `libphonenumber-js` peer-dep, либо встроенной таблицы locale → PhoneFormat[]).
- [x] [Select.vue search](../../lib/select/Select.vue) — фильтрация через `Intl.Collator(getActiveLocale() ?? "en", { sensitivity: "base", usage: "search" })` (diacritic + case insensitive). Сcollator также используется в `splitByQuery` для подсветки — match-логика согласована · [select.md Issue 10](./select.md) · ✅ resolved 2026-05-11
- [ ] Локализация UI-текстов (Pagination prev/next уже есть): ~~Loading aria-label~~ ✅ 2026-06-03 (`loading.label`), Alert Confirm/Cancel, Dialog title, и т.д.

**Acceptance:** library работает в RTL (`<html dir="rtl">`) — visual snapshots проходят. `setActiveLocale("ru")` — все тексты включая validation messages переключаются.

---

### 🟡 Wave 9 — Theming polish

**Цель:** все цвета через design tokens — `usePreset(MyTheme)` действительно меняет всё.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 3.3 (theme runtime API), Wave 3.4 (darkModeSelector).

- [x] Замена `gray-*` / `stone-*` / `neutral-*` / `slate-*` / `zinc-*` Tailwind primitives на semantic `surface` token во всех компонентах · cross-cutting [theme.md Issue 10](./theme.md). **2026-07-04 — движок:** `surface` добавлен как 23-й именованный цвет в [primitive.ts](../../lib/theme/primitive.ts) (дефолт — копия `gray`) + `namesColors` union в [Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187); `bg-surface-*`/`text-surface-*`/etc. работают через тот же `resolveColor()`, что и любой другой именованный цвет — правок `unoRules.ts` не потребовалось (regex строятся динамически из `Object.keys(colors)`). **Первый батч (11/19), 2026-07-04:** Menu, Accordion, Icons, Select, TextEditor (+ HEX-in-style-block → `var(--fv-surface-*)`), Separator, Calendar, Input, Form, Label, Aria. **Residual-батч (8/19), 2026-07-05:** Split, Pagination, Table, Switch, Badge, InputLayout, FixWindow, Dialog — все уже закрыли номерной B10 через `forced-colors`+preset-aware `theme-*` accent ранее, теперь дозакрыли оставшиеся структурные нейтрали тем же rename; semantic-intent цвета в тех же class-строках (required-asterisk `text-red-500` в Switch, delete-hover `text-red-*` в Table, clear-hover `text-red-*` в InputLayout, help-hover `text-yellow-500`) сохранены нетронутыми. **Итог: 19/19 (100%) структурная миграция закрыта.** См. соответствующие `issues/<name>.md` (FixWindow/Dialog — в `issues/done/`). **Alert (`green`/`yellow`/`blue`/`red` severity-цвета) — отдельный будущий эпик**, вне scope этой волны: это semantic-intent цвета (success/warning/info/error), не структурный chrome — нужны собственные новые semantic-слоты + runtime update-функции, а не rename на `surface`. **Button `neutral`-mode** — проверено, не хардкод: легитимный именованный color-mode кнопки, аналог `theme`/`success`, вне scope.
- [ ] [theme/uno.ts](../../lib/theme/uno.ts) — определить semantic mappings · [theme.md](./theme.md) (не проверялось в рамках 2026-07-04 захода — не путать с `surface`-токеном выше, объём неясен)
- [ ] [theme/primitive.ts](../../lib/theme/primitive.ts) (776 lines) — разбить на per-color файлы для tree-shake · [theme.md Issue 7](./theme.md)
- [x] [TextEditor.vue:384-398](../../lib/texteditor/TextEditor.vue#L384) — HEX hardcode → `var(--fv-surface-*)` · [texteditor.md Issue 2](./texteditor.md) ✅ 2026-07-04
- [ ] [Label.vue](../../lib/label/Label.vue) — translate-y px hardcode → CSS custom properties · [label.md Issue 5](./label.md)

**Acceptance:** `usePreset(SapphireTheme)` визуально меняет ВСЕ компоненты в любом sandbox-page (visual regression test).

---

### 🟢 Wave 10 — Polish & DX

**Цель:** UX deltas, не блокирующие production но важные для DX.
**Estimated:** 1-2 sprint'а.

#### 10.1 prefers-reduced-motion

- [~] Все `transition-*` Tailwind classes → `motion-safe:transition-*` (или `@media (prefers-reduced-motion)` CSS) · cross-cutting · Button уже сделан ([button.md Issue 10](./button.md)) — pattern готов к применению на остальных 21 компонента. **Прогресс 2026-05-11:** Input ([Input.vue:87, 89, 98](../../lib/input/Input.vue#L87-L98)) ✅; Select ([Select.vue](../../lib/select/Select.vue) — root transition + classSelectList + classLiItem + TransitionGroup leave/enter classes + Badge inline + print: prefixes) ✅; Aria ([Aria.vue:65](../../lib/aria/Aria.vue#L65) — `motion-safe:placeholder:transition-all` + `print:*`) ✅; Label ([Label.vue:36](../../lib/label/Label.vue#L36) — `motion-safe:transition-all motion-safe:duration-200`) ✅; Menu ([Menu.vue](../../lib/menu/Menu.vue) — default `styles.animation = "motion-safe:transition-all motion-safe:duration-500"` в `classMenu`/`classMenuItem`) ✅ 2026-06-06; Split ([Split.vue:89, 95](../../lib/split/Split.vue#L89-L95) — root `motion-safe:transition-all` + separator-icon `motion-safe:transition-opacity`) ✅ 2026-06-06; Table ([Table.vue](../../lib/table/Table.vue) — `animation`-токен + `classIsSort`/`classResizedColumns`/`classTr` + 5 inline `<transition>`-обёрток + search-Input → `motion-safe:`) ✅ 2026-06-11. **2026-06-13:** Switch ([Switch.vue:64, 98, 106, 136](../../lib/switch/Switch.vue#L64) — root `classBaseSwitch` + switch/checkbox-track + thumb `motion-safe:`; inline `<Icons>`-thumb вынесен в NEW computed `classSwitchIconImg` через `setStyle`) ✅ [switch.md Issue 7](./switch.md); InputLayout ([InputLayout.vue:67-72, 149-154](../../lib/inputlayout/InputLayout.vue#L67-L72) — root `animation` `motion-safe:transition-all motion-safe:duration-550` + оба `<transition>`-блока + hover-иконки `motion-safe:*`; inline-классы зарегистрированы явно module-scope `InputLayout.setStyle`) ✅ [inputlayout.md Issue 8](./inputlayout.md). **2026-06-14:** Accordion ([Accordion.vue](../../lib/accordion/Accordion.vue) — `classSubtitle`/`styleIcon`/`classRect` → `motion-safe:transition*` + `onRootLeave` мгновенный unmount под `prefers-reduced-motion: reduce`) ✅ [accordion.md Issue 7 · E29.7](./accordion.md). 11 / 22.
- [x] [Loading.vue](../../lib/loading/Loading.vue) — статичный fallback (`simple`-loader, `animation-duration=0`) в reduced-motion mode через `matchMedia` guard в обёртке · [loading.md Issue 6](./loading.md) · ✅ resolved 2026-06-03

#### 10.2 Print styles

- [~] Глобальный `@media print` блок: интерактивные компоненты (Button, Select, Loading) скрываются или упрощаются · [button.md Issue 15](./button.md). **Прогресс 2026-05-11:** Input ([Input.vue:90](../../lib/input/Input.vue#L90)) получил `print:border print:border-black print:bg-white print:text-black print:shadow-none`. **2026-06-03:** Loading ([Loading.vue](../../lib/loading/Loading.vue)) → `print:hidden` в `classLoading` ([loading.md Issue 8](./loading.md)). **2026-06-11:** Table ([Table.vue](../../lib/table/Table.vue)) → `print:hidden` на loading-overlay + resize-handle ([table.md Issue 12](./table.md)). **2026-06-12:** Button ([Button.vue](../../lib/button/Button.vue)) → `print:border print:bg-white print:text-black print:shadow-none` в `baseClasses` (style-for-print) ([button.md Issue 15](./button.md)). **2026-06-13:** Pagination ([Pagination.vue](../../lib/pagination/Pagination.vue)) → `print:border-black` (classBase) + `print:text-black` (active indicator) + `forced-colors:outline` (active page, B10) ([pagination.md Issue 8](./pagination.md)). **2026-06-13:** Switch ([Switch.vue:66, 84](../../lib/switch/Switch.vue#L66)) → `print:border print:border-black print:bg-white print:text-black print:shadow-none` на обе ветки `classBaseSwitch` (style-for-print) ([switch.md Issue 14](./switch.md)). **2026-06-13:** InputLayout ([InputLayout.vue:92](../../lib/inputlayout/InputLayout.vue#L92)) → `print:border print:border-black print:bg-white print:text-black print:shadow-none` на `classBody` (style-for-print) + `forced-colors:outline` на `classBase` (B10) ([inputlayout.md Issue 8](./inputlayout.md)). Pattern зафиксирован, но цельного `@media print` блока ещё нет.

#### 10.3 Polymorphic & composition

- [x] [Button.vue](../../lib/button/Button.vue) — `as?: string | Component` через `<component :is>` (`<a>`/`<NuxtLink>`, авто role/tabindex/aria-disabled) · [button.md Issue 5](./button.md) · ✅ resolved 2026-06-12
- [x] [Button.vue:400–407](../../lib/button/Button.vue#L400-L407) — slots `start` + `end` · [done/button.md Issue 12](./button.md) · resolved 2026-05-10 (slot names `start`/`end` выбраны для logical-writing-order)
- [x] [Button.vue:344–366](../../lib/button/Button.vue#L344-L366) — expose `buttonRef` + `focus()` / `blur()` методы · [done/button.md Issue 4](./button.md) · resolved 2026-05-10
- [x] [Switch.vue](../../lib/switch/Switch.vue) — expose `inputRef` + `focus`/`blur` · [switch.md Issue 11](./switch.md) · ✅ resolved 2026-05-11
- [x] [Pagination.vue:203–224](../../lib/pagination/Pagination.vue#L203-L224) — expose `paginationRef` + `focus()` · [pagination.md Issue 7](./pagination.md) · ✅ resolved 2026-06-13
- [x] [Split.vue:139–142](../../lib/split/Split.vue#L139-L142) — expose `focus()` (→ первый separator; root уже был `resizableGroup`) · [split.md Issue 9](./split.md) · ✅ resolved 2026-06-13

#### 10.4 API consistency

- [x] [Switch.vue](../../lib/switch/Switch.vue) — удалить дубль emit `updateModelValue` · [switch.md Issue 2](./switch.md) · ✅ resolved 2026-05-11
- [x] [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48) — закрыть union `switchingType: "checkbox" | "switch"` (убрать `| string`) · [switch.md Issue 9](./switch.md) · ✅ resolved 2026-05-11
- [ ] [Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97) — `change:modelValue(payload: string)` (was boolean type bug) · [aria.md Issue 1](./aria.md)
- [ ] [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts) — то же `change:modelValue` type bug fix · [texteditor.md Issue 5](./texteditor.md)
- [x] [Icons.d.ts:84](../../lib/icons/Icons.d.ts#L84) — `variant?: "outline"|"solid"` (было `stileIcon` опечатка), deprecation soft через runtime `console.warn` · [icons.md Issue 4](./icons.md) ✅ 2026-05-10 (hard removal + codemod — Wave 12)
- [x] [Icons.d.ts:61](../../lib/icons/Icons.d.ts#L61) — `IconType = HeroIconName | IconifyIconName | (string & {})` template literal union (hand-curated 30 heroicons + Iconify pattern + open fallback) · [icons.md Issue 5](./icons.md) ✅ 2026-05-10 (full ~280 union via build-script — future)
- [x] [Badge.vue:80–83](../../lib/badge/Badge.vue#L80-L83) — `delete` emit → `close` (soft deprecation, both emit) · [badge.md Issue 5](./badge.md) ✅ 2026-05-10
- [x] [Switch.vue:218–227](../../lib/switch/Switch.vue#L218-L227) — скрытый `<input type="checkbox" hidden>` form-bridge рядом с `<button role="switch">` для native form integration · [switch.md Issue 3](./switch.md) · ✅ resolved 2026-05-11
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — hidden `<input>` для native form submit · [texteditor.md Issue 10](./texteditor.md)
- [ ] [Form.vue](../../lib/form/Form.vue) — корень `<form>` (после Wave 6.2) · [form.md Issue 4](./form.md)
- [x] [Input.vue:31-39](../../lib/input/Input.vue#L31-L39) — расширить `arrayInputType` ["text","number","email","password","tel","url","search"] · [input.md Issue 6](./input.md) ✅ 2026-05-11
- [x] [Loading.d.ts](../../lib/loading/Loading.d.ts) — `LoadingOption` включить `type` · [loading.md Issue 4](./loading.md) · ✅ resolved 2026-06-03 (+ `resolvedType` в Loading.vue)

#### 10.5 Window.FishtVue coupling cleanup

- [ ] [component/index.ts:68](../../lib/component/index.ts#L68) — primary path `inject(FishtVueSymbol)`, `(window as any).FishtVue` только fallback · [component-class.md Issue 2](./component-class.md)

#### 10.6 Other architecture

- [x] [Animation transitions](../../lib/accordion/Accordion.vue) — `<Transition :css="false">` с JS `@leave` hook для unmount-safe collapse · [accordion.md Issue 6](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Input.vue:212-220](../../lib/input/Input.vue#L212-L220) — `focus(eventOrOptions?: FocusEvent | FocusOptions)` argless + FocusOptions вариант · [input.md Issue 10](./input.md) ✅ 2026-05-11
- [x] [Input.vue:96-102](../../lib/input/Input.vue#L96-L102), [Input.vue:255-266](../../lib/input/Input.vue#L255-L266) — eye-icon class через computed (option `passwordToggleClass`, theme-токены) · [input.md Issue 5](./input.md) ✅ 2026-05-11
- [x] [InputLayout.vue:188-223](../../lib/inputlayout/InputLayout.vue#L188-L223) — убрать `document.querySelector("header")` hardcode → prop `:offsetTop` (number / string / `() => number`) + `resolveOffsetTop()` · [inputlayout.md Issue 5](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:264-309](../../lib/inputlayout/InputLayout.vue#L264-L309) — `clipboard.writeText` feature-detect + `legacyCopy()` execCommand fallback + SSR guard · [inputlayout.md Issue 3](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [Switch.vue:277](../../lib/switch/Switch.vue#L277) — help-icon contrast (`text-gray-400` → `text-gray-500` light) · [switch.md Issue 6](./switch.md) · ✅ resolved 2026-05-11
- [x] [Badge.vue:38](../../lib/badge/Badge.vue#L38) — `ring-neutral-500/30` → `ring-neutral-300 dark:ring-neutral-700` · [badge.md Issue 4](./badge.md) ✅ 2026-05-10
- [ ] [calendar.md Issue 9 — Floating UI](./calendar.md) (закрывается через Wave 5).
- [ ] [\_utilities.md Issue 9 — arrayHandler.sort стабильность документировать](./_utilities.md) — низкий приоритет.

**Acceptance:** axe-core CI без contrast violations. Codemods для deprecated aliases (Aria→Textarea, stileIcon→variant, iconPosition left→start, delete→close emit).

---

### 🟢 Wave 11 — Tests & coverage gaps

**Цель:** все компоненты ≥80% statement coverage, ≥70% branch coverage, infrastructure modules покрыты.
**Estimated:** 2-3 sprint'а (параллельно с другими волнами).

- [ ] [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) — разблокировать 17 skipped tests (`vi.mock("@vueup/vue-quill")`) · [texteditor.md Issue 1](./texteditor.md). **Цель: coverage 0% → ≥70%**
- [x] [Loading.test.ts](../../lib/loading/Loading.test.ts) — тест каждой Epic/Svg вариации · [loading.md Issue 1](./loading.md). **Цель: loadingTypes 3% → ≥70%** · ✅ resolved 2026-06-03 (достигнуто 100%, 145 кейсов). Подъём beta → stable ждёт Issue 7 (Wave 9).
- [ ] [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) — coverage gap (377-396 + 219-340 untested) · [calendar.md](./calendar.md). **Цель: 63% → ≥80%**
- [x] [Split.test.ts](../../lib/split/Split.test.ts) — 7 → 32 теста (resize, persist, keyboard, ARIA, overlay, pixel default-size + recalc через mock geometry) · [split.md Issue 2](./split.md). **Цель: 60%/39% → ≥80%/70%** · ✅ resolved 2026-06-06 (достигнуто 85.19% / 71.77%; Split поднят beta → stable)
- [ ] [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts) — uncovered 568-661 · [fixwindow.md Issue 7](./fixwindow.md). **Цель: 77% → ≥90%**
- [ ] [Table.test.ts](../../lib/table/Table.test.ts) — branch coverage 67% → 80% (edit-cells + asyncData ветви) · [table.md Issue 7](./table.md)
- [ ] [Form.test.ts](../../lib/form/Form.test.ts) — async validators, conditional rules, nested structure · [form.md Issue 8](./form.md)
- [ ] **Infrastructure tests:**
  - [ ] [config/baseStyle.ts](../../lib/config/baseStyle.ts) — coverage 0% → mount-test что styles в head · [config.md Issue 2](./config.md)
  - [ ] [theme/themes/{Aurora,Harmony,Sapphire}.ts](../../lib/theme/themes/) — coverage 0% → preset structure tests + apply test · [theme.md Issue 2](./theme.md)
  - [ ] [theme/uno.ts](../../lib/theme/uno.ts) + [semantic.ts](../../lib/theme/semantic.ts) — coverage 0% → tests · [theme.md Issue 3](./theme.md)
  - [ ] [locale/locales/{en,ru}.ts](../../lib/locale/locales/) — coverage 0% → completeness test (все ключи DefaultMessages) · [locale.md Issue 1](./locale.md)
  - [ ] [module/nuxt.ts](../../lib/module/nuxt.ts) + [plugins/{nuxt,Plugins}.ts](../../lib/plugins/) — coverage 0% → integration test через `@nuxt/test-utils` · [nuxt-module.md Issue 1, 7](./nuxt-module.md)

**Acceptance:** project-wide coverage ≥85% statements / ≥75% branch. CI badge обновлён. TextEditor поднят с `experimental` до `beta`. Loading / Split поднят с `beta` до `stable`.

---

### 🟢 Wave 12 — Migration & DX

**Цель:** miграция на новые API без user pain.
**Estimated:** 1 sprint.
**Зависимости:** Wave 6, 10 (deprecated aliases).

- [ ] **Codemods для breaking changes:**
  - [ ] `Aria` → `Textarea` (rename + import-update) · [aria.md Issue 6](./aria.md)
  - [ ] `iconPosition: "left"|"right"` → `"start"|"end"` · [button.md Issue 3](./button.md) (codemod still TODO; soft deprecation already landed)
  - [ ] `stileIcon` → `variant` · [icons.md Issue 4](./icons.md)
  - [ ] `delete` emit → `close` for Badge · [badge.md Issue 5](./badge.md) (codemod still TODO; soft deprecation already landed)
  - [ ] `change:modelValue` type для Aria/TextEditor · [aria.md Issue 1](./aria.md)
- [ ] [CHANGELOG.md](../../CHANGELOG.md) (auto-gen) — documentation для каждого breaking change.
- [ ] [Documentation/issues/migration-guide.md](./migration-guide.md) — пошаговый guide для major-bumps.
- [ ] [Documentation/02-installation.md](../02-installation.md) — обновить с новыми peer-deps optional flags.

**Acceptance:** `npx fishtvue-codemod` в потребительском проекте — все deprecated APIs автозаменены.

---

## Cross-cutting findings (top priority)

> Сжатый референс для тех, кто работает не по волнам, а point-fix'ами. Каждый пункт ссылается на детали в issue files. Полный actionable план — выше в **Fix roadmap**.

### 🔴 Critical cross-cutting

**XSS через v-html (всего 14 sites в 9 компонентах):**

- ~~[Switch.vue] (help)~~ ✅ resolved 2026-05-11 — `help` prop → `#help` slot с text-fallback (без `v-html`) — see [switch.md Issue 1](./switch.md)
- ~~[InputLayout.vue:294, 313]~~ (help, messageInvalid) — affects ALL form-controls — ✅ resolved 2026-05-11 — see [inputlayout.md Issue 1](./inputlayout.md). Slots `#help` / `#messageInvalid` с text-node fallback. Cross-cutting forwarding в 5 form-controls — follow-up PR.
- ~~[Select.vue:553, 562, 564]~~ (marker, noData ×2) ✅ resolved 2026-05-11 — see [select.md Issue 1](./select.md). `#marker` scoped slot + `#empty` slot + safe substring helper `splitByQuery`/`markerParts` — никакого `v-html`.
- ~~[Form.vue:380] (select-marker copy)~~ ✅ resolved 2026-06-03 — `#item`-override удалён, Form переиспользует безопасный default Select — [form.md Issue 1](./form.md)
- [Table.vue:1842, 1939, 1999, 2011, 2026](../../lib/table/Table.vue#L1842) (cell, summary, noData/Column/Filter ×3) — [table.md Issue 1](./table.md)
- ~~[Menu.vue:388, 392] (item.info ×2)~~ ✅ resolved 2026-06-06 — оба `v-html` → `#item-info` scoped slot с text-fallback — see [menu.md Issue 1](./menu.md)
- ~~[Accordion.vue:149](../../lib/accordion/Accordion.vue#L149) (item.subtitle)~~ ✅ resolved 2026-05-11 — see [accordion.md Issue 1](./accordion.md)
- ~~[Alert.vue:263](../../lib/alert/Alert.vue#L263) (subtitle)~~ ✅ resolved 2026-05-11 — see [alert.md Issue 1](./alert.md)

**Memory leaks (observers/listeners без cleanup):**

- ~~Select ResizeObserver + keydown listeners~~ ✅ resolved 2026-05-11 ([select.md Issue 2](./select.md)) — `let resizeObserver` + `onBeforeUnmount` disconnect + removeEventListener для обоих keydown handlers.
- ~~Calendar MutationObserver на documentElement~~ ([calendar.md Issue 1](./calendar.md)) ✅ resolved 2026-05-11
- ~~Pagination anonymous ResizeObserver~~ ✅ resolved 2026-06-06 ([pagination.md Issue 1](./pagination.md))
- ~~InputLayout 2× anonymous ResizeObservers~~ ✅ resolved 2026-05-11 ([inputlayout.md Issue 2](./inputlayout.md))
- Table IntersectionObserver + window mousemove/up partial cleanup ([table.md Issue 2](./table.md))
- Dialog escapeListener при unmount-while-open ([dialog.md Issue 2](./dialog.md))

**FishtVueSymbol race-condition:** [config.md Issue 1](./config.md).
~~**Alert imperative DOM bypass Vue:**~~ ✅ resolved 2026-05-11 — `openAlert` переписан на `createApp(Alert, rootProps)` + Vue emit chain ([alert.md Issue 2](./alert.md)).

### 🟠 High cross-cutting

**Distribution/packaging** (sideEffects, exports map, peer-deps): затрагивает все 22 компонента — [button.md Issue 8 и 9](./button.md), [calendar.md Issue 2, 3](./calendar.md).
**SSR style injection (C17):** дубль `Component.initStyle()` в каждом из 22 SFC — [component-class.md Issue 1](./component-class.md).
~~**`unstyled: true` не реализован (L53):**~~ ✅ resolved 2026-05-11 — `Component.setStyle()` guard в [lib/component/index.ts:138](../../lib/component/index.ts#L138). Cross-cutting fix — все 22 компонента, использующие базовый класс, теперь респектят `unstyled: true` config. См. [component-class.md Issue 6](./component-class.md).
~~**`componentsStyle` global fallback inconsistent (L53)**~~ ✅ closed 2026-07-02 — все form-controls с `mode` учитывают fallback: ~~Input~~/~~Aria~~/~~Select~~/~~Calendar~~ 2026-05-11, ~~Badge~~ 2026-05-10, ~~Button~~ 2026-06-12, ~~TextEditor~~ 2026-07-02 (Wave 3.2 закрыта) — см. [texteditor.md Issue 7](./texteditor.md).
~~**Theme runtime API не реализован (L53)**~~ ✅ resolved 2026-07-02 — usePreset/updatePreset/updatePrimaryPalette/updateSurfacePalette/$dt/palette через CSS-variable indirection (Wave 3.3 закрыта) — [theme.md Issue 1](./theme.md).
**A11y (focus trap, ARIA roles, keyboard navigation):** см. список в Wave 4.
**FixWindow Floating UI integration:** [fixwindow.md Issue 1, 2, 3](./fixwindow.md).

### 🟡 Medium cross-cutting

**RTL не поддерживается:** буквальные `left/right` во всех компонентах — Wave 8.1.
**`prefers-reduced-motion` не учитывается:** Wave 10.1.
~~**Locale fallback chain отсутствует:**~~ ✅ resolved (fallback chain 2026-05-20 + interpolation/pluralization 2026-06-19 — Wave 3.5 закрыта; `Component.t(key, params?)`).
**Hardcoded colors через Tailwind primitives:** Wave 9 — движок + структурная миграция всех 19/19 компонентов ✅ 2026-07-05 (11/19 2026-07-04 + 8/19 residual 2026-07-05). Остаётся только Alert semantic-intent epic (отдельная задача, новые semantic-слоты) и Loading epic-spinners (отдельное прошлое решение).
**Dual-API gap для Table/Form/Select/~~Menu~~/~~Accordion~~:** Wave 6 (Menu ✅ 2026-06-06 — `<MenuItem>`/`<MenuGroup>`; Accordion ✅ 2026-06-14 — `<AccordionItem>`).

## 60-point audit checklist

(Полный 60-пунктовый чек-лист с группами A–P для cross-references из issue-доков. Каждый issue в отдельном файле помечен категорией из этой таблицы.)

### A. Distribution & build (1–7)

1. Tree-shaking — точечный импорт `fishtvue/{component}` тянет только нужное.
2. `sideEffects` в `package.json` — корректно размечены (false или массив).
3. Дубли библиотеки в бандле потребителя (Vue, dayjs, heroicons).
4. ESM/CJS dual package hazard.
5. `exports` в `package.json` (условия `types`/`import`/`require`/`default`).
6. Стили: автоматическая инжекция vs always-on.
7. CSS-конфликты: scoped / CSS Modules / префиксы.

### B. Styles & theming (8–12)

8. Низкая специфичность — пользовательские стили могут перебить.
9. CSS Layers (`@layer fishtvue`) — предсказуемое переопределение.
10. Хардкод цветов вместо CSS-переменных / design-tokens.
11. Dark mode + runtime theme switch.
12. Совместимость с Tailwind / UnoCSS.

### C. SSR & DOM (13–18)

13. Утечка внутренних классов в публичный API (ломается при минификации).
14. SSR-несовместимость: `window`/`document`/`navigator` на верхнем уровне.
15. Hydration mismatch (random IDs, `Date.now()`, `Teleport` без guard).
16. Portal/Teleport ломается в SSR/Nuxt.
17. `<style>` в `<head>` не попадает при SSR.
18. Поддержка Nuxt-модуля / auto-import.

### D. DX & TypeScript (19–28)

19. HMR в dev-режиме потребителя.
20. TypeScript-типы экспортируются.
21. Generic-компоненты не теряют типы.
22. Slot props типизированы.
23. `defineModel` / `v-model` модификаторы.
24. `defineExpose` для нужных методов.
25. Консистентность имён props (`size` vs `sizing`).
26. Консистентность имён событий (`update:modelValue` vs `change`).
27. Breaking changes — semver / changelog.
28. Codemods для миграции мажоров.

### E. A11y (29 — 7 подпунктов)

29.1. ARIA-роли и атрибуты.
29.2. Keyboard navigation (Tab, Esc, стрелки, Enter/Space).
29.3. Focus trap в модалках/диалогах.
29.4. Focus return на триггер.
29.5. `aria-live` announcements.
29.6. WCAG contrast.
29.7. `prefers-reduced-motion`.

### F. Localization & RTL (30–32)

30. Хардкод строк («Cancel», «OK») без i18n.
31. RTL не поддерживается (нет `dir="rtl"`, `inline-start/end`).
32. Date/number formatting не уважает локаль.

### G. Composition & API (33–37)

33. Controlled vs uncontrolled mode.
34. Ref на корневой элемент.
35. Проброс `$attrs`.
36. `asChild` / polymorphic паттерн.
37. Слабая композиция через slots.

### H. Layout & runtime UX (38–43)

38. Z-index hell.
39. Floating-UI / позиционирование при scroll/resize.
40. Click-outside ломается при Teleport/iframe/Shadow DOM.
41. Memory leaks: незакрытые `resize`/`scroll`/`MutationObserver`.
42. Анимации блокируют unmount.
43. Виртуализация в списках/таблицах/селектах.

### I. Bundle & deps (44–45)

44. Большие peer-зависимости (lodash/dayjs/date-fns).
45. Иконки тянутся целиком вместо точечно.

### J. Testing & docs (46–48)

46. Unit + a11y + visual regression тесты.
47. Документация с живыми примерами / playground.
48. Storybook/VitePress конфигурация.

### K. Compatibility & publish (49–52)

49. Vue/Nuxt peer ranges адекватны.
50. Volar / vue-tsc — IDE-подсказки props.
51. Source maps в опубликованном пакете.
52. Лишние файлы в npm-пакете (`src/`, тесты, `*.md`).

### L. Configuration support (53)

`provide/inject` API через `FishtVueSymbol`. Подпроверки cross-cutting:

- `componentsOptions.[Name]` принимается через `getOptions()`/`useFishtVue()`.
- `componentsStyle: "filled" | "outlined" | "underlined"` глобальный — реагирует ли компонент.
- `unstyled: true` — корректное поведение без стилей.
- Theme tokens (`primitive`, `semantic`, component-specific) вместо хардкода.
- Runtime theme switch (`usePreset`, `updatePreset`, `updatePrimaryPalette`, `updateSurfacePalette`).
- Runtime locale switch (`setActiveLocale`).
- `t('key')` для текста UI.
- Fallback на defaultLocale при отсутствии ключа.

### M. Forms (54–56)

54. Native `<form>` integration (`name`, `form`, native validation).
55. `FormData` / submit handlers.
56. Browser autocomplete / password manager совместимость.

### N. Mobile & touch (57–59)

57. Touch events, виртуальная клавиатура.
58. Drag&drop на touch.
59. Print styles.

### O. Web Components (60)

60. Shadow DOM / Web Components compat.

### P. Dual-API gap (только для коллекционных)

Применимо: **Table, Form, Menu, Select, Accordion** (опционально Calendar, TextEditor). Для каждого описать gap «schema-driven сейчас → нужен compound параллельно».

## Methodology

- **Источник истины — `lib/`**, без правок исходников.
- **Конфиг-референс — [docs/content/ru/3.Configuration/](../../docs/content/ru/3.Configuration/)**, без правок (это публичная декларация поддерживаемых настроек).
- **Документация компонента уже существует** в [Documentation/components/](../components/) — issue-документ ссылается на неё через front-matter `related-doc`.
- **22 компонента + 6 инфра-модулей + сводный utilities** = 29 targets / 28 файлов аудита (utilities one consolidated).
- **Severity** — субъективная оценка приоритета фикса:
  - `critical` — runtime-крэш / security / data loss / production blocker.
  - `high` — серьёзный UX/DX gap, фикс в ближайший минор.
  - `medium` — допустимый недостаток, фикс при следующем рефакторинге раздела.
  - `low` — nice-to-have / polish.

## Шаблон файла аудита

```markdown
---
title: Issues — {ComponentName}
summary: Аудит критических и потенциальных проблем компонента {ComponentName}.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/{name}/
related-doc: ../components/{name}.md
---

# Issues — {ComponentName}

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | N     | C14        |
| high     | N     | A2, E29.3  |
| medium   | N     | …          |
| low      | N     | …          |

## Issue 1: <название>

- **Категория чек-листа:** A2 (sideEffects)
- **Severity:** high
- **Где:** [{File}:{line}](../../lib/{name}/{File}#L{line})

### Что найдено

…

### Почему это проблема

…

### Что нужно сделать

…

### Acceptance criteria

- [ ] …

## Cross-cutting: Configuration support

| Настройка                  | Поддержано? | Комментарий |
| -------------------------- | ----------- | ----------- |
| `componentsOptions.{Name}` | ✅ / ❌     | …           |
| ...                        | ...         | ...         |

## Dual-API gap (если применимо)

…
```
