---
title: Issues — Index
summary: Сводный индекс аудит-документов компонентов и инфра-модулей FishtVue по 60-пунктовому чек-листу + Configuration support + Dual-API gap. Cross-cutting findings, fix roadmap с чекбоксами.
updated: 2026-05-10
last-changes: button — Issues 2, 4, 10, 11, 12 закрыты (a11y, ref forwarding, motion-safe, typed click, start/end slots), часть перемещена в [done/button.md](./done/button.md); active button.md содержит 11 открытых (нумерация с gaps). icons — Issues 3 (ARIA), 4 (variant deprecation), 5 (type narrowing), 2/8 docs portion закрыты; файл перемещён в `./done/`. badge — Issues 2, 4, 5 закрыты, файл перемещён в `./done/`. utilities — 9 issues ранее закрыты. severity matrix пересчитана 17/138/101/70 (326 issues); roadmap Wave 4.2 + Wave 10.3/10.4 чекбоксы отмечены; cross-references в label/split/input/alert/pagination/menu/fixwindow/select/dialog/separator/switch на «button.md Issue 10» перенаправлены на done/button.md (motion-safe pattern); switch на «button.md Issue 4» аналогично.
---

# Issues — Index

Внутренний аудит библиотеки `fishtvue` против 60-пунктового чек-листа индустриальных требований к UI-кит библиотекам, плюс проверка соответствия публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) и анализ dual-API gap для коллекционных компонентов.

> **Принцип:** файл `{component}.md` создаётся ТОЛЬКО при наличии хотя бы одной проблемы. Файл, у которого все issues закрыты, перемещается в [`./done/`](./done/). Чекбоксы в roadmap'е — single-source-of-truth прогресса.

## Сводка по компонентам

| Target          | File                                       | Critical | High    | Medium  | Low    |
| --------------- | ------------------------------------------ | -------- | ------- | ------- | ------ |
| Button          | [button.md](./button.md)                   | 0        | 5       | 5       | 1      |
| Label           | [label.md](./label.md)                     | 0        | 4       | 3       | 2      |
| Switch          | [switch.md](./switch.md)                   | 1        | 5       | 4       | 3      |
| Input           | [input.md](./input.md)                     | 0        | 4       | 5       | 3      |
| Aria            | [aria.md](./aria.md)                       | 0        | 4       | 4       | 3      |
| Select          | [select.md](./select.md)                   | 2        | 6       | 4       | 3      |
| Calendar        | [calendar.md](./calendar.md)               | 1        | 6       | 4       | 3      |
| TextEditor      | [texteditor.md](./texteditor.md)           | 0        | 7       | 5       | 3      |
| Table           | [table.md](./table.md)                     | 2        | 8       | 5       | 4      |
| Pagination      | [pagination.md](./pagination.md)           | 1        | 4       | 4       | 3      |
| Badge           | [badge.md](./done/badge.md)                | 0        | 3       | 0       | 3      |
| Form            | [form.md](./form.md)                       | 1        | 6       | 4       | 3      |
| InputLayout     | [inputlayout.md](./inputlayout.md)         | 2        | 4       | 4       | 3      |
| Separator       | [separator.md](./separator.md)             | 0        | 3       | 2       | 2      |
| Split           | [split.md](./split.md)                     | 0        | 5       | 5       | 3      |
| FixWindow       | [fixwindow.md](./fixwindow.md)             | 0        | 7       | 5       | 3      |
| Accordion       | [accordion.md](./accordion.md)             | 1        | 5       | 3       | 3      |
| Dialog          | [dialog.md](./dialog.md)                   | 2        | 5       | 4       | 3      |
| Menu            | [menu.md](./menu.md)                       | 1        | 6       | 4       | 3      |
| Alert           | [alert.md](./alert.md)                     | 2        | 5       | 4       | 3      |
| Loading         | [loading.md](./loading.md)                 | 0        | 5       | 4       | 3      |
| Icons           | [icons.md](./done/icons.md)                | 0        | 4       | 1       | 2      |
| Component class | [component-class.md](./component-class.md) | 0        | 4       | 4       | 2      |
| Config          | [config.md](./config.md)                   | 1        | 5       | 4       | 2      |
| Theme           | [theme.md](./theme.md)                     | 0        | 6       | 4       | 2      |
| Locale          | [locale.md](./locale.md)                   | 0        | 5       | 4       | 2      |
| Nuxt module     | [nuxt-module.md](./nuxt-module.md)         | 0        | 6       | 4       | 2      |
| Utilities       | [\_utilities.md](./done/_utilities.md)     | 0        | 1       | 0       | 1      |
| **TOTAL**       | **28 files**                               | **17**   | **138** | **101** | **70** |

Всего **326 issues** распределены по 28 documentов аудита. Закрыты:

- [\_utilities.md](./done/_utilities.md) 2026-05-10 — Issues 1, 2, 3, 5, 6, 7, 8, 10, 11.
- [badge.md](./done/badge.md) 2026-05-10 — Issues 2, 4, 5; файл перемещён в `./done/`, остальные пункты Badge — cross-cutting.
- [icons.md](./done/icons.md) 2026-05-10 — Issues 3 (ARIA), 4 (variant deprecation), 5 (type narrowing); Issues 2/8 — docs portion. Файл перемещён в `done/` (cross-cutting Issue 1/6/9 трекаются через roadmap waves).
- [button.md](./done/button.md) 2026-05-10 — Issues 2 (a11y aria-label), 4 (buttonRef expose), 10 (motion-safe), 11 (typed click emit), 12 (start/end slots). Активный [button.md](./button.md) содержит 11 открытых issues (нумерация с gaps — cross-references из соседних файлов сохранены).

## Fix roadmap (live tracker)

Карта исправлений по волнам. Каждая волна — самодостаточная единица доставки (1-3 sprint'а). Внутри волны задачи сгруппированы по unified fix-pattern: один patch закрывает множество issues одновременно. Чекбоксы — единственный source-of-truth прогресса.

**Соглашения по чекбоксам:**

- `[ ]` — не сделано
- `[~]` — в работе (укажи assignee/PR в комментарии справа от чекбокса)
- `[x]` — сделано + PR смёрджен + acceptance criteria закрыты в issue файле

**Workflow закрытия issue:**

1. Чекни `[x]` в roadmap'е.
2. В соответствующем `<issue>.md` помечай `~~текст~~` зачёркнутым + `✅ resolved YYYY-MM-DD (PR #N)` рядом.
3. Если ВСЕ issues файла закрыты — переместить файл в [`./done/`](./done/) и обновить ссылку в таблице сводки выше.
4. Пересчитать severity matrix в таблице сводки.

---

### 🔴 Wave 1 — Critical security & stability

**Цель:** убрать все CVE-кандидаты и memory leaks. Без этой волны библиотека не должна публиковаться в production.
**Estimated:** 2-3 sprint'а.
**Зависимости:** нет.
**Параллельно с:** ничем (блокирует публикацию).

#### 1.1 XSS через `v-html` → slot pattern (14 sites, 9 компонентов)

Унифицированный fix: заменить `v-html="X"` на `<slot name="X"><span>{{ X }}</span></slot>`. Сохраняет custom HTML только при явном использовании slot потребителем.

- [ ] [Switch.vue:244](../../lib/switch/Switch.vue#L244) — `help` prop → `#help` slot · [switch.md Issue 1](./switch.md)
- [ ] [InputLayout.vue:294](../../lib/inputlayout/InputLayout.vue#L294) — `help` prop → `#help` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает help-XSS во ВСЕХ form-controls** (Input/Aria/Select/Calendar/TextEditor наследуют InputLayout)
- [ ] [InputLayout.vue:313](../../lib/inputlayout/InputLayout.vue#L313) — `messageInvalid` prop → `#messageInvalid` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает validation-XSS во ВСЕХ form-controls**
- [ ] [Select.vue:553](../../lib/select/Select.vue#L553) — `item.marker` → `#item-marker` scoped slot + safe `<mark>` VNode-builder · [select.md Issue 1](./select.md)
- [ ] [Select.vue:562](../../lib/select/Select.vue#L562) — `noData` → `#empty` slot · [select.md Issue 1](./select.md)
- [ ] [Select.vue:564](../../lib/select/Select.vue#L564) — `noData` (второй сайт) → переиспользует `#empty` slot · [select.md Issue 1](./select.md)
- [ ] [Form.vue:380](../../lib/form/Form.vue#L380) — select-marker copy → переиспользовать Select после fix Select XSS · [form.md Issue 1](./form.md)
- [ ] [Table.vue:1842](../../lib/table/Table.vue#L1842) — cell `setMarker(...)` → `#cell-${dataField}` scoped slot + `<CellWithMarker>` VNode-renderer · [table.md Issue 1](./table.md) · **самый опасный: cell content приходит из server data**
- [ ] [Table.vue:1939](../../lib/table/Table.vue#L1939) — summary → `#summary-${dataField}` scoped slot · [table.md Issue 1](./table.md)
- [ ] [Table.vue:1999](../../lib/table/Table.vue#L1999) — `noData` → `#empty` slot · [table.md Issue 1](./table.md)
- [ ] [Table.vue:2011](../../lib/table/Table.vue#L2011) — `noColumn` → `#empty-columns` slot · [table.md Issue 1](./table.md)
- [ ] [Table.vue:2026](../../lib/table/Table.vue#L2026) — `noFilter` → `#empty-filter` slot · [table.md Issue 1](./table.md)
- [ ] [Menu.vue:388](../../lib/menu/Menu.vue#L388) — `item.info` → `#item-info` scoped slot · [menu.md Issue 1](./menu.md)
- [ ] [Menu.vue:392](../../lib/menu/Menu.vue#L392) — `item.info` (FixWindow ветка) → переиспользует `#item-info` · [menu.md Issue 1](./menu.md)
- [ ] [Accordion.vue:149](../../lib/accordion/Accordion.vue#L149) — `item.subtitle` → `#item-subtitle` scoped slot · [accordion.md Issue 1](./accordion.md)
- [ ] [Alert.vue:253](../../lib/alert/Alert.vue#L253) — `subtitle` → `#subtitle` slot · [alert.md Issue 1](./alert.md)

**Acceptance:** payload `<img src=x onerror=alert(1)>` не исполняется ни в одном из 14 сайтов (CI-test). Документация компонентов §12 Security обновлена с примером кастомизации через slot.

#### 1.2 Memory leaks → onBeforeUnmount cleanup (6 компонентов)

Унифицированный fix: сохранять Observer / DOM listener в `ref`, в `onBeforeUnmount` вызывать `disconnect()` / `removeEventListener()`. Альтернатива — VueUse composables (`useResizeObserver`, `useEventListener`, `useIntersectionObserver`) для auto-cleanup.

- [ ] [Select.vue:279-281](../../lib/select/Select.vue#L279) — `ResizeObserver` сохранить в ref + disconnect · [select.md Issue 2](./select.md)
- [ ] [Select.vue:286,291](../../lib/select/Select.vue#L286) — keydown listeners (`openSelectOnEnter`, `keydownSelect`) cleanup при unmount-while-open · [select.md Issue 2](./select.md)
- [ ] [Calendar.vue:322-327](../../lib/calendar/Calendar.vue#L322) — `MutationObserver` на documentElement сохранить + disconnect · [calendar.md Issue 1](./calendar.md) · **рекомендация: вынести в singleton `useDarkMode()` composable** (один observer на весь app)
- [ ] [Calendar.vue:254,261](../../lib/calendar/Calendar.vue#L254) — keydown listeners cleanup · [calendar.md Issue 1](./calendar.md)
- [ ] [Pagination.vue:255](../../lib/pagination/Pagination.vue#L255) — anonymous `new ResizeObserver(...)` → сохранить в ref + disconnect · [pagination.md Issue 1](./pagination.md)
- [ ] [InputLayout.vue:177-179](../../lib/inputlayout/InputLayout.vue#L177) — anonymous ResizeObserver на `beforeInput` сохранить + disconnect · [inputlayout.md Issue 2](./inputlayout.md)
- [ ] [InputLayout.vue:181-183](../../lib/inputlayout/InputLayout.vue#L181) — anonymous ResizeObserver на `afterInput` сохранить + disconnect · [inputlayout.md Issue 2](./inputlayout.md)
- [ ] [Table.vue:1519-1527](../../lib/table/Table.vue#L1519) — `lastRowVisibleObserver` (IntersectionObserver) добавить в `onUnmounted` disconnect · [table.md Issue 2](./table.md)
- [ ] [Table.vue:1553-1554](../../lib/table/Table.vue#L1553) — `window.mousemove`/`mouseup` cleanup при unmount-while-resize · [table.md Issue 2](./table.md)
- [ ] [Dialog.vue:155](../../lib/dialog/Dialog.vue#L155) — `escapeListener` cleanup при unmount-while-open + восстановление `body.style.overflow` · [dialog.md Issue 2](./dialog.md)

**Acceptance:** mount/unmount × 100 в Chrome Memory profiler — heap не растёт (для каждого из 6 компонентов отдельный test). DevTools Performance не показывает retained DOM-узлов с listeners.

#### 1.3 Architecture blockers (2 issues)

- [ ] [config/index.ts:16,71,124](../../lib/config/index.ts#L16) — `FishtVueSymbol` стабилизировать: `const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")`, убрать reassign в install, заменить `Symbol.toString()` сравнение на reference check · [config.md Issue 1](./config.md) · **highest leverage: исправляет inject во ВСЕХ компонентах**
- [ ] [openAlert.ts:35-98](../../lib/alert/openAlert.ts#L35) — переписать на `createApp(h(Alert, ...))` programmatic API вместо `document.createElement` + manual listeners · [alert.md Issue 2](./alert.md)

**Acceptance:** multi-app сценарий (`createApp().use(FishtVue,A)` × 2 с разными configs) — оба работают изолированно. `openAlert` SSR-safe (returns no-op без падения).

---

### 🟠 Wave 2 — Distribution & SSR foundation

**Цель:** убрать ~70% bundle bloat у потребителя; устранить flash-of-unstyled-content при SSR; превратить library в правильный ESM/CJS dual package.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1 (стабильный FishtVueSymbol — для inject в onServerPrefetch path).
**Параллельно с:** Wave 3 (configuration), но порядок: сначала distribution.

#### 2.1 Packaging (one-time fix в [lib/package.json](../../lib/package.json))

- [ ] [lib/package.json:17-18](../../lib/package.json#L17) — добавить `exports` map с условиями `types`/`import`/`require`/`default` для всех subpath: `./button`, `./input`, `./theme`, `./config`, `./component`, `./locale`, `./module`, `./plugins/nuxt`, `./utils/*`, `./types` · [button.md Issue 9](./button.md)
- [ ] [lib/package.json](../../lib/package.json) — добавить `"sideEffects": ["**/*.css", "**/*.vue"]` (Vue SFC `<style>` имеют side-effects) · [button.md Issue 8](./button.md)
- [ ] [lib/package.json:56](../../lib/package.json#L56) — `vue` из `dependencies` → `peerDependencies: "^3.5.0"` · [calendar.md Issue 3](./calendar.md)
- [ ] [lib/package.json:44-57](../../lib/package.json#L44) — `lodash-es`, `date-fns`, `gsap`, `quill`, `@vueup/vue-quill`, `v-calendar`, `tailwind-merge`, `clsx` → optional `peerDependencies` + `peerDependenciesMeta.optional: true` · [calendar.md Issue 2](./calendar.md), [texteditor.md Issue 3](./texteditor.md)
- [ ] [lib/rollup.config.js:409](../../lib/rollup.config.js#L409) — раскомментировать `get_CJS_ESM()` или явно решить ESM-only + добавить `engines: { node: ">=18" }` · [button.md Issue 9](./button.md)
- [ ] [lib/package.json](../../lib/package.json) — добавить `"files": ["**/*.mjs", "**/*.d.ts", "**/*.map", "**/package.json", "*.css", "README.md", "LICENSE.md"]` для контроля содержимого npm-tarball · [table.md Issue 13, 14](./table.md)
- [ ] [lib/package.json:28-32](../../lib/package.json#L28) — расширить `@nuxt/kit` peer range до `>=3.0.0` (сейчас `^4.1.2` ломает Nuxt 3) · [nuxt-module.md Issue 4](./nuxt-module.md)

#### 2.2 Lazy import тяжёлых deps

- [ ] [lib/icons/Icons.vue](../../lib/icons/Icons.vue) — heroicons через `defineAsyncComponent(() => import("@heroicons/vue/24/${stileIcon}/${pascalCase(type)}.vue"))` · [icons.md Issue 1](./done/icons.md), [button.md Issue 7](./button.md)
- [ ] [lib/texteditor/TextEditor.vue:3-5](../../lib/texteditor/TextEditor.vue#L3) — Quill через `defineAsyncComponent`, CSS импорты в `onMounted` · [texteditor.md Issue 3](./texteditor.md)
- [ ] [lib/calendar/Calendar.vue](../../lib/calendar/Calendar.vue) — v-calendar `DatePicker` через `defineAsyncComponent` · [calendar.md Issue 2](./calendar.md)
- [ ] [lib/loading/Loading.vue](../../lib/loading/Loading.vue) — Epic-вариации lazy через `defineAsyncComponent` · [loading.md Issue 2](./loading.md)
- [ ] [lib/button/Button.vue:5-6](../../lib/button/Button.vue#L5) — `Loading` и `FixWindow` lazy-import (только при `loading: true` или `type: "icon"`) · [button.md Issue 6](./button.md)

#### 2.3 SSR style injection

- [ ] **Удалить `onMounted(() => X.initStyle())`** из 22 SFC — base class уже вызывает через `onServerPrefetch + vueOnMounted` · [component-class.md Issue 1](./component-class.md). Затрагивает: Button, Label, Switch, Input, Aria, Select, Calendar, TextEditor, Table, Pagination, Badge, Form, InputLayout, Separator, Split, FixWindow, Accordion, Dialog, Menu, Alert, Loading, Icons.
- [ ] [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts) — оборачивать каждый component-style в `@layer fishtvue { ... }` (или настраиваемый layer name из `optionsTheme.layers`) · [theme.md Issue 4](./theme.md)
- [ ] [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts) — HMR teardown: replace content existing `<style>` element, не append new · [component-class.md Issue 3](./component-class.md)

#### 2.4 Body scroll lock — reference counted

- [ ] [Dialog.vue:147-148, 157-159](../../lib/dialog/Dialog.vue#L147) — заменить string-concat `body.style.overflow` на reference-counted `useScrollLock` (VueUse) или собственный singleton с counter · [dialog.md Issue 3](./dialog.md)
- [ ] [Split.vue:525, 534, 558-559](../../lib/split/Split.vue#L525) — `document.body.classList.add(cursorClass)` → локальный overlay div `<div class="split-drag-overlay">` (без global state мутации) · [split.md Issue 1](./split.md)

**Acceptance:** `pnpm sandbox:build` + analyzer показывает ~70% bundle reduction для consumer не использующего Calendar/TextEditor/много heroicons. SSR-render через `renderToString` содержит inline `<style>` с правилами компонентов (snapshot test). DevTools Memory: HMR-обновление компонента 50× → один `<style>` в head, не 50.

---

### 🟠 Wave 3 — Configuration support (документация → реальность)

**Цель:** закрыть documentation lies — публичная Configuration-док обещает API которого нет.
**Estimated:** 2-3 sprint'а.
**Зависимости:** Wave 1.3 (стабильный FishtVueSymbol).
**Параллельно с:** Wave 4 (a11y) — независимо.

#### 3.1 `unstyled: true` enforcement (один фикс → 22 компонента)

- [ ] [component/index.ts](../../lib/component/index.ts) — в `Component.setStyle()` добавить guard `if (this.config?.unstyled) return ""` · [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md)
- [ ] Тест: `app.use(FishtVue, { unstyled: true })` + mount каждого из 22 компонентов → assert `class` пустой / отсутствует.

#### 3.2 `componentsStyle` global fallback consistency

Унификация: все form-controls с `mode` prop должны учитывать `Component.componentsStyle()` в fallback chain.

- [ ] [Button.vue:301-303](../../lib/button/Button.vue#L301) — добавить `Button.componentsStyle()` mapping (`filled→primary`, `outlined→outline`, `underlined→ghost`) · [button.md Issue 13](./button.md)
- [ ] [Input.vue:42](../../lib/input/Input.vue#L42) — добавить `?? Input.componentsStyle()` в fallback · [input.md Issue 2](./input.md)
- [ ] [Aria.vue:49](../../lib/aria/Aria.vue#L49) — добавить `?? Aria.componentsStyle()` · [aria.md Issue 4](./aria.md)
- [ ] [Select.vue](../../lib/select/Select.vue) — добавить `?? Select.componentsStyle()` · [select.md Issue 5](./select.md)
- [ ] [Calendar.vue](../../lib/calendar/Calendar.vue) — добавить `?? Calendar.componentsStyle()` · [calendar.md Issue 6](./calendar.md)
- [ ] [TextEditor.vue:54](../../lib/texteditor/TextEditor.vue#L54) — добавить `?? TextEditor.componentsStyle()` · [texteditor.md Issue 7](./texteditor.md)
- [x] [Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23) — добавить mapping (`filled→primary`, `outlined→outline`, `underlined→neutral`) · [badge.md Issue 2](./done/badge.md) ✅ 2026-05-10

#### 3.3 Theme runtime API (новый файл per function)

Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает функции — реализовать.

- [ ] `lib/theme/usePreset.ts` — полная замена пресета + reinject styles · [theme.md Issue 1](./theme.md)
- [ ] `lib/theme/updatePreset.ts` — deepMerge + reinject · [theme.md Issue 1](./theme.md)
- [ ] `lib/theme/updatePrimaryPalette.ts` — shortcut на updatePreset · [theme.md Issue 1](./theme.md)
- [ ] `lib/theme/updateSurfacePalette.ts` — с поддержкой `light`/`dark` подразделов · [theme.md Issue 1](./theme.md)
- [ ] `lib/theme/$dt.ts` — token metadata lookup · [theme.md Issue 1](./theme.md)
- [ ] `lib/theme/palette.ts` — экспортировать существующий helper в публичный API · [theme.md Issue 1](./theme.md)
- [ ] [lib/theme/index.ts](../../lib/theme/index.ts) — re-export всех 6 публичных функций · [theme.md Issue 1](./theme.md)
- [ ] Style invalidation mechanism: при theme change все Component.initStyle() реinject (через event-bus или watcher на `FishtVue.config.theme`) · [theme.md Issue 1](./theme.md)
- [ ] [Documentation/architecture/theme.md](../architecture/theme.md) — обновить с описанием реальных API.

#### 3.4 `darkModeSelector` через UnoCSS preset

- [ ] [theme/uno.ts](../../lib/theme/uno.ts) — генерировать `dark:*` варианты на основе `optionsTheme.darkModeSelector` config · [theme.md Issue 5](./theme.md)
- [ ] Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` → Button рендерится в dark mode.

#### 3.5 Locale fallback chain + interpolation

- [ ] [component/index.ts `t(key)`](../../lib/component/index.ts) — fallback chain: `messages[active] → messages[default] → key` · [config.md Issue 3](./config.md), [locale.md Issue 2](./locale.md)
- [ ] Параметризованный `t(key, params)` с interpolation `{name}` · [locale.md Issue 3](./locale.md)
- [ ] Pluralization rules per-locale (Russian имеет 4 формы) · [locale.md Issue 3](./locale.md)

**Acceptance:** все обещания публичной [docs/content/ru/3.Configuration/](../../docs/content/ru/3.Configuration/) проверяемы тестами. `import { usePreset } from "fishtvue/theme"` работает. `unstyled: true` отключает стили во всех 22 компонентах.

---

### 🟠 Wave 4 — A11y baseline (WCAG 2.1 AA conformance)

**Цель:** library проходит axe-core / Lighthouse для базовых интерактивных компонентов.
**Estimated:** 2-3 sprint'а.
**Зависимости:** Wave 1.2 (memory leaks Dialog/Menu) — focus trap зависит от чистого unmount.
**Параллельно с:** Wave 3, Wave 5.

#### 4.1 Focus management (Dialog + popover)

- [ ] [Dialog.vue](../../lib/dialog/Dialog.vue) — focus trap через `useFocusTrap` (VueUse) · [dialog.md Issue 1](./dialog.md)
- [ ] [Dialog.vue](../../lib/dialog/Dialog.vue) — focus return на trigger при close (сохранять `document.activeElement` при open) · [dialog.md Issue 5](./dialog.md)
- [ ] [Dialog.vue:185](../../lib/dialog/Dialog.vue#L185) — `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby` · [dialog.md Issue 4](./dialog.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — prop `:focusTrap?: boolean` для popover-mode · [fixwindow.md Issue 4](./fixwindow.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — focus return при close · [fixwindow.md Issue 5](./fixwindow.md)

#### 4.2 ARIA roles + attributes

- [x] [Button.vue:382–390](../../lib/button/Button.vue#L382-L390) — `aria-label` для icon-кнопок (с dev-warning если type="icon" без label) · [done/button.md Issue 2](./done/button.md) · resolved 2026-05-10
- [ ] [Label.vue:60](../../lib/label/Label.vue#L60) — корень `<div>` → `<label :for="forId">` + новый prop `forId` · [label.md Issue 1](./label.md)
- [ ] [Pagination.vue:262](../../lib/pagination/Pagination.vue#L262) — `<nav role="navigation" aria-label>` + `aria-current="page"` · [pagination.md Issue 4](./pagination.md)
- [ ] [Loading.vue](../../lib/loading/Loading.vue) — `role="status"` + `aria-live="polite"` + `aria-label="Loading"` (с локализацией) · [loading.md Issue 3](./loading.md)
- [ ] [Alert.vue](../../lib/alert/Alert.vue) — `role="alert"`/`role="status"` based on severity + `aria-live` · [alert.md Issue 3](./alert.md)
- [ ] [Menu.vue](../../lib/menu/Menu.vue) — `role="menu"` + `role="menuitem"` + `aria-haspopup` + `aria-expanded` · [menu.md Issue 4](./menu.md)
- [ ] [Accordion.vue](../../lib/accordion/Accordion.vue) — disclosure pattern: header `<button aria-expanded aria-controls>` + content `role="region"` · [accordion.md Issue 3](./accordion.md)
- [ ] [Split.vue](../../lib/split/Split.vue) — resize handle `role="separator"` + `aria-orientation` + `aria-valuenow/min/max` · [split.md Issue 4](./split.md)
- [ ] [Table.vue](../../lib/table/Table.vue) — `<caption>` slot + `<th scope="col">` · [table.md Issue 8](./table.md)
- [x] [Icons.vue](../../lib/icons/Icons.vue) — default `aria-hidden="true"` + prop `:label` для семантических (wrapper-based pattern) · [icons.md Issue 3](./done/icons.md) ✅ 2026-05-10
- [ ] [Separator.vue](../../lib/separator/Separator.vue) — корень `<hr>` или `<div role="separator" aria-orientation>` · [separator.md Issue 2](./separator.md)

#### 4.3 Keyboard navigation

- [ ] [Menu.vue](../../lib/menu/Menu.vue) — ArrowUp/Down между items, ArrowRight/Left для submenu, Home/End, typeahead, roving tabindex · [menu.md Issue 3](./menu.md)
- [ ] [Accordion.vue](../../lib/accordion/Accordion.vue) — ArrowUp/Down между header items · [accordion.md Issue 4](./accordion.md)
- [ ] [Split.vue](../../lib/split/Split.vue) — стрелки на focused resize handle (с Shift для крупного шага) · [split.md Issue 5](./split.md)
- [ ] [Select.vue:341-352](../../lib/select/Select.vue#L341) — audit existing keyboard logic (ArrowUp/Down уже есть) + добавить Home/End/typeahead.

#### 4.4 aria-live announcements

- [ ] [Select.vue](../../lib/select/Select.vue) — `<div aria-live="polite">{{ resultsCount }}</div>` для search results · [select.md Issue 8](./select.md)
- [ ] [Pagination.vue](../../lib/pagination/Pagination.vue) — announce «Page N of M» при switchPage · [pagination.md Issue 5](./pagination.md)
- [ ] [Table.vue](../../lib/table/Table.vue) — announce filter/sort/search results count · [table.md Issue 9](./table.md)
- [ ] [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) — `aria-live="assertive"` на error region · [inputlayout.md Issue 6](./inputlayout.md)

**Acceptance:** axe-core CI passes для каждого компонента. Lighthouse a11y score = 100 для sandbox-pages со всеми компонентами. Manual screen-reader test (NVDA/VoiceOver) — каждый интерактивный компонент озвучивается корректно.

---

### 🟠 Wave 5 — Floating UI integration

**Цель:** все popover/tooltip/dropdown позиционируются корректно при scroll/resize/viewport-overflow. Click-outside работает через Teleport.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1.2 (FixWindow listeners cleanup).
**Параллельно с:** Wave 4 (a11y) — независимо.

- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — переписать manual position calc на `@floating-ui/vue` (`useFloating`, `autoUpdate`, `offset`, `flip`, `shift`) · [fixwindow.md Issue 2](./fixwindow.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — Teleport через prop `:teleport?: string | HTMLElement | false` (default `'body'` для popover-mode) · [fixwindow.md Issue 1](./fixwindow.md)
- [ ] [FixWindow.vue:230](../../lib/fixwindow/FixWindow.vue#L230) — click-outside через `useClickOutside([reference, floating])` (VueUse) — handles teleport · [fixwindow.md Issue 3](./fixwindow.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — `aria-role` computed (tooltip / dialog / menu) на основе `eventOpen` + содержимого · [fixwindow.md Issue 8](./fixwindow.md)
- [ ] **Verify Calendar/Select/Menu** наследуют новый FixWindow без regression — все имеют integration tests.

**Acceptance:** popover не обрезается при overflow:hidden родителя; auto-flip при near viewport edge; scroll body — позиция обновляется. Calendar/Select/Menu pop-ups работают через Teleport.

---

### 🟡 Wave 6 — Dual-API parallel (compound + schema)

**Цель:** competitive parity с AG Grid / Element Plus / Naive UI / PrimeVue. Параллельный compound API без breaking change для schema-driven.
**Estimated:** 4-6 sprint'ов (один компонент на sprint).
**Зависимости:** Wave 1 (XSS slot pattern — base для composition), Wave 4 (a11y patterns).
**Порядок внутри волны:** Table → Form → Select → Menu → Accordion (по приоритету ROI).

Унифицированный fix-pattern: `provide(CONTEXT, { register, unregister })` в parent + child компоненты регистрируют себя при mount. Schema-driven prop (`:dataColumns`, `:structure`, `:dataSelect`, `:items`) выигрывает при конфликте — backward compat.

#### 6.1 Table → `<Table><Column>`

- [ ] `lib/table/Column.vue` — child компонент с inject `TABLE_CONTEXT` + register · [table.md Issue 3](./table.md)
- [ ] `lib/table/TableContext.ts` — `InjectionKey<TableContext>` с `registerColumn` / `unregisterColumn` · [table.md Issue 3](./table.md)
- [ ] [Table.vue](../../lib/table/Table.vue) — provide context, resolve `dataColumns` (props или children), children walk через useSlots() + Fragment-flatten.
- [ ] Per-column scoped slots `cell`, `header`, `filter`, `summary` — пробрасываются через registered descriptor.
- [ ] [Documentation/components/table.md](../components/table.md) §10.5 «Compound API».
- [ ] Тесты: schema, compound, mixed (schema выигрывает).

#### 6.2 Form → `<Form><FormField>` + `<FormSection>`

- [ ] `lib/form/FormField.vue` + `lib/form/FormSection.vue` · [form.md Issue 2](./form.md)
- [ ] `Form.registerFieldType("MyDatePicker", ...)` — расширение typeField · [form.md Issue 3](./form.md)
- [ ] Native `<form @submit>` integration + FormData · [form.md Issue 4](./form.md)
- [ ] [Documentation/components/form.md](../components/form.md) §10 + §M.

#### 6.3 Select → `<Select><SelectOption>` + `<SelectGroup>`

- [ ] `lib/select/SelectOption.vue` + `lib/select/SelectGroup.vue` · [select.md Issue 3](./select.md)
- [ ] Children walk + Fragment-flatten.
- [ ] [Documentation/components/select.md](../components/select.md) §10.5.

#### 6.4 Menu → `<Menu><MenuItem>` + `<MenuGroup>`

- [ ] `lib/menu/MenuItem.vue` (recursive — submenu) + `lib/menu/MenuGroup.vue` · [menu.md Issue 2](./menu.md)
- [ ] Submenu через recursive `<MenuItem><MenuItem></MenuItem></MenuItem>`.

#### 6.5 Accordion → `<Accordion><AccordionItem>`

- [ ] `lib/accordion/AccordionItem.vue` · [accordion.md Issue 2](./accordion.md)

**Acceptance:** для каждого из 5 компонентов schema-driven и compound API работают одновременно (test). Volar autocomplete для child-компонентов работает. Documentation обновлена с примерами обоих API.

---

### 🟡 Wave 7 — Performance & virtualization

**Цель:** library работает с 10k+ rows без deg.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 6.1 Table compound (для добавления virtual в API).
**Параллельно с:** Wave 8.

- [ ] [Table.vue](../../lib/table/Table.vue) — `:virtual?: boolean` + `:virtualThreshold?: number`, виртуализация через `@tanstack/vue-virtual` · [table.md Issue 4](./table.md)
- [ ] [Select.vue](../../lib/select/Select.vue) — то же для dropdown list · [select.md Issue 7](./select.md)
- [ ] [Menu.vue](../../lib/menu/Menu.vue) — то же для длинных menu (опционально) · [menu.md](./menu.md)
- [ ] [TextEditor.vue:97](../../lib/texteditor/TextEditor.vue#L97) — Quill image-button → custom handler с emit `image-upload-request` (вместо base64-инжекции) · [texteditor.md Issue 6](./texteditor.md)

**Acceptance:** 10k rows Table initial render <100ms, scroll 60fps. 5k options Select dropdown — same. Quill image-handler не инжектит multi-megabyte data-URLs.

---

### 🟡 Wave 8 — Localization & i18n

**Цель:** library reaches RTL + non-English markets.
**Estimated:** 2 sprint'а.
**Зависимости:** Wave 3.5 (locale fallback + interpolation).

#### 8.1 RTL support

- [ ] Глобальная замена `left/right` Tailwind classes на `start/end` (logical) во всех компонентах · cross-cutting issue.
- [ ] [Button.d.ts](../../lib/button/Button.d.ts) — `iconPosition: "start" | "end"` (deprecation `"left"|"right"`) · [button.md Issue 3](./button.md)
- [ ] [Separator.d.ts](../../lib/separator/Separator.d.ts) — `contentPosition: "start" | "end"` · [separator.md Issue 3](./separator.md)
- [ ] Auto-detect `<html dir="rtl">` через `useDirectionality()` composable + соответствующий API в Locale (Issue 4 в [locale.md](./locale.md))
- [ ] Тесты с `dir="rtl"` для каждого компонента (snapshot-based).

#### 8.2 i18n текстов

- [ ] [rulesHandler.ts / rulesMethods.ts](../../lib/utils/rulesHandler.ts) — validation messages через `t("validation.required")` keys + добавить ключи в [locales/{en,ru}.ts](../../lib/locale/locales/) · [form.md Issue 6](./form.md)
- [ ] [Calendar.vue](../../lib/calendar/Calendar.vue) — пробросить FishtVue locale в v-calendar · [calendar.md Issue 8](./calendar.md)
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — Quill toolbar tooltips через i18n · [texteditor.md Issue 8, 9](./texteditor.md)
- [ ] [numberHandler.convertToPhone](../../lib/utils/numberHandler.ts) — параметризовать по locale · [input.md Issue 7](./input.md)
- [ ] [Select.vue search](../../lib/select/Select.vue) — фильтрация через `Intl.Collator(locale, { sensitivity: 'base' })` · [select.md Issue 10](./select.md)
- [ ] Локализация UI-текстов (Pagination prev/next уже есть): Loading aria-label, Alert Confirm/Cancel, Dialog title, и т.д.

**Acceptance:** library работает в RTL (`<html dir="rtl">`) — visual snapshots проходят. `setActiveLocale("ru")` — все тексты включая validation messages переключаются.

---

### 🟡 Wave 9 — Theming polish

**Цель:** все цвета через design tokens — `usePreset(MyTheme)` действительно меняет всё.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 3.3 (theme runtime API), Wave 3.4 (darkModeSelector).

- [ ] Замена `gray-*` / `stone-*` / `neutral-*` / `red-*` / `green-*` Tailwind primitives на semantic tokens (`bg-surface`, `text-muted-foreground`, `border-border`) во всех компонентах · cross-cutting [switch.md Issue 12](./switch.md)
- [ ] [theme/uno.ts](../../lib/theme/uno.ts) — определить semantic mappings · [theme.md](./theme.md)
- [ ] [theme/primitive.ts](../../lib/theme/primitive.ts) (761 lines) — разбить на per-color файлы для tree-shake · [theme.md Issue 7](./theme.md)
- [ ] [TextEditor.vue:368-383](../../lib/texteditor/TextEditor.vue#L368) — HEX hardcode → CSS-переменные · [texteditor.md Issue 2](./texteditor.md)
- [ ] [Label.vue](../../lib/label/Label.vue) — translate-y px hardcode → CSS custom properties · [label.md Issue 5](./label.md)

**Acceptance:** `usePreset(SapphireTheme)` визуально меняет ВСЕ компоненты в любом sandbox-page (visual regression test).

---

### 🟢 Wave 10 — Polish & DX

**Цель:** UX deltas, не блокирующие production но важные для DX.
**Estimated:** 1-2 sprint'а.

#### 10.1 prefers-reduced-motion

- [ ] Все `transition-*` Tailwind classes → `motion-safe:transition-*` (или `@media (prefers-reduced-motion)` CSS) · cross-cutting · Button уже сделан ([done/button.md Issue 10](./done/button.md)) — pattern готов к применению на остальных 21 компонента
- [ ] [Loading.vue](../../lib/loading/Loading.vue) — статичный fallback (loader-circle outline) в reduced-motion mode · [loading.md Issue 6](./loading.md)

#### 10.2 Print styles

- [ ] Глобальный `@media print` блок: интерактивные компоненты (Button, Select, Loading) скрываются или упрощаются · [button.md Issue 15](./button.md)

#### 10.3 Polymorphic & composition

- [ ] [Button.vue](../../lib/button/Button.vue) — `as?: string | Component` (default `"button"`, поддержка `<NuxtLink>`) · [button.md Issue 5](./button.md)
- [x] [Button.vue:400–407](../../lib/button/Button.vue#L400-L407) — slots `start` + `end` · [done/button.md Issue 12](./done/button.md) · resolved 2026-05-10 (slot names `start`/`end` выбраны для logical-writing-order)
- [x] [Button.vue:344–366](../../lib/button/Button.vue#L344-L366) — expose `buttonRef` + `focus()` / `blur()` методы · [done/button.md Issue 4](./done/button.md) · resolved 2026-05-10
- [ ] [Switch.vue](../../lib/switch/Switch.vue) — expose `inputRef` · [switch.md Issue 11](./switch.md)
- [ ] [Pagination.vue](../../lib/pagination/Pagination.vue) — expose root ref · [pagination.md Issue 7](./pagination.md)

#### 10.4 API consistency

- [ ] [Switch.vue:168-169](../../lib/switch/Switch.vue#L168) — удалить дубль emit `updateModelValue` · [switch.md Issue 2](./switch.md)
- [ ] [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48) — закрыть union `switchingType: "checkbox" | "switch"` (убрать `| string`) · [switch.md Issue 9](./switch.md)
- [ ] [Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97) — `change:modelValue(payload: string)` (was boolean type bug) · [aria.md Issue 1](./aria.md)
- [ ] [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts) — то же `change:modelValue` type bug fix · [texteditor.md Issue 5](./texteditor.md)
- [x] [Icons.d.ts:84](../../lib/icons/Icons.d.ts#L84) — `variant?: "outline"|"solid"` (было `stileIcon` опечатка), deprecation soft через runtime `console.warn` · [icons.md Issue 4](./done/icons.md) ✅ 2026-05-10 (hard removal + codemod — Wave 12)
- [x] [Icons.d.ts:61](../../lib/icons/Icons.d.ts#L61) — `IconType = HeroIconName | IconifyIconName | (string & {})` template literal union (hand-curated 30 heroicons + Iconify pattern + open fallback) · [icons.md Issue 5](./done/icons.md) ✅ 2026-05-10 (full ~280 union via build-script — future)
- [x] [Badge.vue:78–81](../../lib/badge/Badge.vue#L78-L81) — `delete` emit → `close` (soft deprecation, both emit) · [badge.md Issue 5](./done/badge.md) ✅ 2026-05-10
- [ ] [Switch.vue:244](../../lib/switch/Switch.vue#L244) — `<input type="hidden">` рядом с `<button role="switch">` для native form integration · [switch.md Issue 3](./switch.md)
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — hidden `<input>` для native form submit · [texteditor.md Issue 10](./texteditor.md)
- [ ] [Form.vue](../../lib/form/Form.vue) — корень `<form>` (после Wave 6.2) · [form.md Issue 4](./form.md)
- [ ] [Input.vue:31](../../lib/input/Input.vue#L31) — расширить `arrayInputType` ["text","number","email","password","tel","url","search"] · [input.md Issue 6](./input.md)
- [ ] [Loading.d.ts](../../lib/loading/Loading.d.ts) — `LoadingOption` включить `type` · [loading.md Issue 4](./loading.md)

#### 10.5 Window.FishtVue coupling cleanup

- [ ] [component/index.ts:68](../../lib/component/index.ts#L68) — primary path `inject(FishtVueSymbol)`, `(window as any).FishtVue` только fallback · [component-class.md Issue 2](./component-class.md)

#### 10.6 Other architecture

- [ ] [Animation transitions](../../lib/accordion/Accordion.vue) — `<Transition>` с `@after-leave` для unmount-safe collapse · [accordion.md Issue 6](./accordion.md)
- [ ] [Input.vue:175](../../lib/input/Input.vue#L175) — `focus(event?: FocusEvent)` argless вариант · [input.md Issue 10](./input.md)
- [ ] [Input.vue:213](../../lib/input/Input.vue#L213) — eye-icon class через computed (option `passwordToggleClass`) · [input.md Issue 5](./input.md)
- [ ] [InputLayout.vue:184](../../lib/inputlayout/InputLayout.vue#L184) — убрать `document.querySelector("header")` hardcode → prop `:offsetTop` · [inputlayout.md Issue 5](./inputlayout.md)
- [ ] [InputLayout.vue:226](../../lib/inputlayout/InputLayout.vue#L226) — `clipboard.writeText` feature-detect + execCommand fallback · [inputlayout.md Issue 3](./inputlayout.md)
- [ ] [Switch.vue:232-234](../../lib/switch/Switch.vue#L232) — help-icon contrast (`text-gray-400` → `text-gray-500` light) · [switch.md Issue 6](./switch.md)
- [x] [Badge.vue:38](../../lib/badge/Badge.vue#L38) — `ring-neutral-500/30` → `ring-neutral-300 dark:ring-neutral-700` · [badge.md Issue 4](./done/badge.md) ✅ 2026-05-10
- [ ] [calendar.md Issue 9 — Floating UI](./calendar.md) (закрывается через Wave 5).
- [ ] [\_utilities.md Issue 9 — arrayHandler.sort стабильность документировать](./done/_utilities.md) — низкий приоритет.

**Acceptance:** axe-core CI без contrast violations. Codemods для deprecated aliases (Aria→Textarea, stileIcon→variant, iconPosition left→start, delete→close emit).

---

### 🟢 Wave 11 — Tests & coverage gaps

**Цель:** все компоненты ≥80% statement coverage, ≥70% branch coverage, infrastructure modules покрыты.
**Estimated:** 2-3 sprint'а (параллельно с другими волнами).

- [ ] [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) — разблокировать 17 skipped tests (`vi.mock("@vueup/vue-quill")`) · [texteditor.md Issue 1](./texteditor.md). **Цель: coverage 0% → ≥70%**
- [ ] [Loading.test.ts](../../lib/loading/Loading.test.ts) — тест каждой Epic/Svg вариации · [loading.md Issue 1](./loading.md). **Цель: loadingTypes 3% → ≥70%**
- [ ] [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) — coverage gap (377-396 + 219-340 untested) · [calendar.md](./calendar.md). **Цель: 63% → ≥80%**
- [ ] [Split.test.ts](../../lib/split/Split.test.ts) — 7 тестов недостаточно; добавить resize, persist, panels · [split.md Issue 2](./split.md). **Цель: 60%/39% → ≥80%/70%**
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
  - [ ] `iconPosition: "left"|"right"` → `"start"|"end"` · [button.md Issue 3](./button.md)
  - [ ] `stileIcon` → `variant` · [icons.md Issue 4](./done/icons.md)
  - [ ] `delete` emit → `close` for Badge · [badge.md Issue 5](./done/badge.md) (codemod still TODO; soft deprecation already landed)
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

- [Switch.vue:244](../../lib/switch/Switch.vue#L244) (help) — [switch.md Issue 1](./switch.md)
- [InputLayout.vue:294, 313](../../lib/inputlayout/InputLayout.vue#L294) (help, messageInvalid) — affects ALL form-controls — [inputlayout.md Issue 1](./inputlayout.md)
- [Select.vue:553, 562, 564](../../lib/select/Select.vue#L553) (marker, noData ×2) — [select.md Issue 1](./select.md)
- [Form.vue:380](../../lib/form/Form.vue#L380) (select-marker copy) — [form.md Issue 1](./form.md)
- [Table.vue:1842, 1939, 1999, 2011, 2026](../../lib/table/Table.vue#L1842) (cell, summary, noData/Column/Filter ×3) — [table.md Issue 1](./table.md)
- [Menu.vue:388, 392](../../lib/menu/Menu.vue#L388) (item.info ×2) — [menu.md Issue 1](./menu.md)
- [Accordion.vue:149](../../lib/accordion/Accordion.vue#L149) (item.subtitle) — [accordion.md Issue 1](./accordion.md)
- [Alert.vue:253](../../lib/alert/Alert.vue#L253) (subtitle) — [alert.md Issue 1](./alert.md)

**Memory leaks (observers/listeners без cleanup):**

- Select ResizeObserver + keydown listeners ([select.md Issue 2](./select.md))
- Calendar MutationObserver на documentElement ([calendar.md Issue 1](./calendar.md))
- Pagination anonymous ResizeObserver ([pagination.md Issue 1](./pagination.md))
- InputLayout 2× anonymous ResizeObservers ([inputlayout.md Issue 2](./inputlayout.md))
- Table IntersectionObserver + window mousemove/up partial cleanup ([table.md Issue 2](./table.md))
- Dialog escapeListener при unmount-while-open ([dialog.md Issue 2](./dialog.md))

**FishtVueSymbol race-condition:** [config.md Issue 1](./config.md).
**Alert imperative DOM bypass Vue:** [alert.md Issue 2](./alert.md).

### 🟠 High cross-cutting

**Distribution/packaging** (sideEffects, exports map, peer-deps): затрагивает все 22 компонента — [button.md Issue 8 и 9](./button.md), [calendar.md Issue 2, 3](./calendar.md).
**SSR style injection (C17):** дубль `Component.initStyle()` в каждом из 22 SFC — [component-class.md Issue 1](./component-class.md).
**`unstyled: true` не реализован (L53):** [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md).
**`componentsStyle` global fallback inconsistent (L53):** Button/Input/Aria/Select/Calendar/TextEditor/Badge не имеют — см. [button.md Issue 13](./button.md), [input.md Issue 2](./input.md).
**Theme runtime API не реализован (L53):** [theme.md Issue 1](./theme.md).
**A11y (focus trap, ARIA roles, keyboard navigation):** см. список в Wave 4.
**FixWindow Floating UI integration:** [fixwindow.md Issue 1, 2, 3](./fixwindow.md).

### 🟡 Medium cross-cutting

**RTL не поддерживается:** буквальные `left/right` во всех компонентах — Wave 8.1.
**`prefers-reduced-motion` не учитывается:** Wave 10.1.
**Locale fallback chain отсутствует:** Wave 3.5.
**Hardcoded colors через Tailwind primitives:** Wave 9.
**Dual-API gap для Table/Form/Select/Menu/Accordion:** Wave 6.

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
