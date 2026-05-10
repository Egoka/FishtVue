---
title: Issues — Index
summary: Сводный индекс аудит-документов компонентов и инфра-модулей FishtVue по 60-пунктовому чек-листу + Configuration support + Dual-API gap. Cross-cutting findings и priority list.
updated: 2026-05-10
---

# Issues — Index

Внутренний аудит библиотеки `fishtvue` против 60-пунктового чек-листа индустриальных требований к UI-кит библиотекам, плюс проверка соответствия публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) и анализ dual-API gap для коллекционных компонентов.

> **Принцип:** файл `{component}.md` создаётся ТОЛЬКО при наличии хотя бы одной проблемы. Если у компонента 0 проблем — он помечен как «✅ no issues found». В текущем аудите ВСЕ targets имеют ≥1 проблем (минимум через cross-cutting корневой `lib/package.json`).

## Сводка по компонентам

| Target | File | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Button | [button.md](./button.md) | 0 | 6 | 6 | 4 |
| Label | [label.md](./label.md) | 0 | 4 | 3 | 2 |
| Switch | [switch.md](./switch.md) | 1 | 5 | 4 | 3 |
| Input | [input.md](./input.md) | 0 | 4 | 5 | 3 |
| Aria | [aria.md](./aria.md) | 0 | 4 | 4 | 3 |
| Select | [select.md](./select.md) | 2 | 6 | 4 | 3 |
| Calendar | [calendar.md](./calendar.md) | 1 | 6 | 4 | 3 |
| TextEditor | [texteditor.md](./texteditor.md) | 0 | 7 | 5 | 3 |
| Table | [table.md](./table.md) | 2 | 8 | 5 | 4 |
| Pagination | [pagination.md](./pagination.md) | 1 | 4 | 4 | 3 |
| Badge | [badge.md](./badge.md) | 0 | 4 | 2 | 3 |
| Form | [form.md](./form.md) | 1 | 6 | 4 | 3 |
| InputLayout | [inputlayout.md](./inputlayout.md) | 2 | 4 | 4 | 3 |
| Separator | [separator.md](./separator.md) | 0 | 3 | 2 | 2 |
| Split | [split.md](./split.md) | 0 | 5 | 5 | 3 |
| FixWindow | [fixwindow.md](./fixwindow.md) | 0 | 7 | 5 | 3 |
| Accordion | [accordion.md](./accordion.md) | 1 | 5 | 3 | 3 |
| Dialog | [dialog.md](./dialog.md) | 2 | 5 | 4 | 3 |
| Menu | [menu.md](./menu.md) | 1 | 6 | 4 | 3 |
| Alert | [alert.md](./alert.md) | 2 | 5 | 4 | 3 |
| Loading | [loading.md](./loading.md) | 0 | 5 | 4 | 3 |
| Icons | [icons.md](./icons.md) | 0 | 5 | 4 | 3 |
| Component class | [component-class.md](./component-class.md) | 0 | 4 | 4 | 2 |
| Config | [config.md](./config.md) | 1 | 5 | 4 | 2 |
| Theme | [theme.md](./theme.md) | 0 | 6 | 4 | 2 |
| Locale | [locale.md](./locale.md) | 0 | 5 | 4 | 2 |
| Nuxt module | [nuxt-module.md](./nuxt-module.md) | 0 | 6 | 4 | 2 |
| Utilities | [_utilities.md](./_utilities.md) | 0 | 4 | 4 | 3 |
| **TOTAL** | **28 files** | **17** | **144** | **111** | **76** |

Всего **348 issues** распределены по 28 documentов аудита.

## Cross-cutting findings (top priority)

Эти проблемы затрагивают **множество компонентов одновременно** — фикс в одном месте устраняет их везде.

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

**Унифицированный fix-pattern:** заменить v-html на slot (`<slot name="X">{{ rawString }}</slot>`) во всех сайтах. Сохраняет custom HTML только для случаев, где пользователь явно его рендерит через slot.

**Memory leaks (observers/listeners без cleanup):**
- Select ResizeObserver + keydown listeners ([select.md Issue 2](./select.md))
- Calendar MutationObserver на documentElement ([calendar.md Issue 1](./calendar.md))
- Pagination anonymous ResizeObserver ([pagination.md Issue 1](./pagination.md))
- InputLayout 2× anonymous ResizeObservers ([inputlayout.md Issue 2](./inputlayout.md))
- Table IntersectionObserver + window mousemove/up partial cleanup ([table.md Issue 2](./table.md))
- Dialog escapeListener при unmount-while-open ([dialog.md Issue 2](./dialog.md))

**Унифицированный fix-pattern:** все Observers / DOM listeners сохранять в reactive ref, в `onBeforeUnmount`/`onUnmounted` вызывать `disconnect()` / `removeEventListener()`. Альтернатива — использовать VueUse composables (`useResizeObserver`, `useEventListener`) — auto-cleanup.

**FishtVueSymbol race-condition:** [config.md Issue 1](./config.md) — затрагивает корректность `inject` во всех компонентах. Highest leverage fix.

**Alert imperative DOM bypass Vue:** [alert.md Issue 2](./alert.md) — критичен для SSR / Shadow DOM / Vue DevTools видимости.

### 🟠 High cross-cutting

**Distribution / packaging (затрагивает все 22 компонента):**
- A2 — `sideEffects` не размечены в [lib/package.json](../../lib/package.json) и [lib/{component}/package.json](../../lib/) (×22).
- A4-5 — нет `exports` map, нет CJS-варианта, ESM-only без условий.
- A3 — `vue` в `dependencies` (должно быть peer); `lodash-es`, `dayjs`, `date-fns`, `gsap`, `quill`, `vue-quill`, `v-calendar` в `dependencies` (должны быть optional peer).

**Унифицированный fix-pattern:** см. [button.md Issue 8 и Issue 9](./button.md).

**SSR style injection (C17):** Каждый компонент в `onMounted` дублирует `Component.initStyle()`, хотя base class уже вызывает через `onServerPrefetch` + `vueOnMounted`. Удалить дубли. См. [component-class.md Issue 1](./component-class.md).

**`unstyled: true` не реализован (L53):** documentation [docs/content/ru/3.Configuration/1.Options.md](../../docs/content/ru/3.Configuration/1.Options.md) обещает, но `Component.setStyle` не учитывает. Точка фикса — `Component.setStyle`. См. [button.md Issue 14](./button.md), [component-class.md Issue 6](./component-class.md).

**`componentsStyle` global fallback (L53):** Switch / Label / InputLayout / Table / Pagination / Menu / FixWindow реагируют через `Component.componentsStyle()`. Button / Input / Aria / Select / Calendar / TextEditor / Badge — нет. Inconsistent. См. [button.md Issue 13](./button.md), [input.md Issue 2](./input.md).

**Theme runtime API не реализован (L53):** documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает `usePreset`, `updatePreset`, `updatePrimaryPalette`, `updateSurfacePalette`, `$dt`, `palette` — НЕ exported в [lib/theme/](../../lib/theme/). Documentation lies. См. [theme.md Issue 1](./theme.md).

**A11y — focus trap, focus return, ARIA roles:**
- Dialog нет focus trap, focus return, role="dialog" ([dialog.md Issue 1, 4, 5](./dialog.md)).
- Menu нет keyboard navigation, role="menu" ([menu.md Issue 3, 4](./menu.md)).
- Accordion нет disclosure pattern, keyboard ([accordion.md Issue 3, 4](./accordion.md)).
- Pagination нет navigation role ([pagination.md Issue 4](./pagination.md)).
- Loading нет role="status"+aria-live ([loading.md Issue 3](./loading.md)).
- Alert нет role="alert"/"status" ([alert.md Issue 3](./alert.md)).
- Button — нет aria-label для icon-кнопок ([button.md Issue 2](./button.md)).
- Label — нет for-id связки ([label.md Issue 1](./label.md)).
- Split, Table — нет navigation/separator semantics ([split.md Issue 4](./split.md), [table.md Issue 8](./table.md)).

**FixWindow — Floating UI integration (затрагивает Calendar, Select, Menu, Tooltip-uses):** manual position calculation без auto-flip / auto-shift; click-outside ломается с Teleport. См. [fixwindow.md Issue 1, 2, 3](./fixwindow.md).

### 🟡 Medium cross-cutting

**RTL не поддерживается:** буквальные `left/right` классы в Button, Switch, Calendar, Select, Pagination, InputLayout, Dialog, Menu, FixWindow. См. [switch.md Issue 8](./switch.md), [dialog.md Issue 8](./dialog.md), и др.

**`prefers-reduced-motion` не учитывается:** все `transition-*` без `motion-safe:` guard. См. [button.md Issue 10](./button.md).

**Locale fallback chain отсутствует:** при отсутствии ключа `t()` возвращает undefined, не fallback на defaultLocale. См. [config.md Issue 3](./config.md), [locale.md Issue 2](./locale.md).

**Hardcoded цвета через Tailwind primitives** (gray-_, neutral-_, red-_, green-_) вместо semantic tokens из FishtVue theme. Cross-cutting во всех 22 компонентах.

**Dual-API gap для коллекционных компонентов:**
- [Table](./table.md) — нет `<Table><Column>` (industry standard для table — AG Grid, Element Plus, Naive UI, PrimeVue).
- [Form](./form.md) — нет `<Form><FormField>`.
- [Select](./select.md) — нет `<Select><SelectOption>`.
- [Menu](./menu.md) — нет `<Menu><MenuItem>`.
- [Accordion](./accordion.md) — нет `<Accordion><AccordionItem>`.

**Унифицированный fix-pattern:** parallel API через `provide(CONTEXT, { register, unregister })` + child компоненты регистрируют себя при mount. Schema-driven (existing `:items`/`:dataColumns` props) выигрывает при конфликте — backward compat.

## Priority list (рекомендуемая последовательность фиксов)

1. **🔴 Critical XSS (v-html × 14 sites)** — 1-2 sprint'а; security-blocker.
2. **🔴 Memory leaks** (Observer/Listener cleanup) — 1 sprint; production-stability.
3. **🔴 FishtVueSymbol race + Alert imperative DOM** — 1 sprint; architectural blockers.
4. **🟠 sideEffects + exports map + peer-deps** — 1 sprint; one-time packaging fix; устраняет ~70% bundle bloat для потребителя.
5. **🟠 SSR style injection (remove duplicate initStyle, fix теме @layer)** — 1 sprint; affects every consumer's first paint.
6. **🟠 `unstyled` + `componentsStyle` consistency + theme runtime API** — 2 sprints; устраняет documentation lies.
7. **🟠 A11y baseline (focus trap Dialog, keyboard Menu/Accordion, ARIA roles)** — 2-3 sprints; WCAG conformance.
8. **🟠 Floating UI integration** — 1 sprint; FixWindow / Calendar / Select / Menu все упрощаются.
9. **🟡 Dual-API параллельно для Table → Form → Select → Menu → Accordion** — 4-6 sprints; competitive parity с AG Grid / Element Plus.
10. **🟡 RTL + prefers-reduced-motion + locale fallback + i18n validation messages** — 2 sprints; markets expansion (RTL, accessibility).
11. **🟡 Hardcoded colors → semantic tokens** — 1-2 sprints; theming consistency.
12. **🟢 Tests + coverage gaps** (TextEditor 0%, Loading 22%, Calendar 63%, Split 60%, infra modules 0%) — параллельно с fixes выше.

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
|---|---|---|
| critical | N | C14 |
| high | N | A2, E29.3 |
| medium | N | … |
| low | N | … |

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

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.{Name}` | ✅ / ❌ | … |
| ... | ... | ... |

## Dual-API gap (если применимо)

…
```
