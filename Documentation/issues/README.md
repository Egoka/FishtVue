---
title: Issues — Index
summary: Сводный индекс аудит-документов компонентов и инфра-модулей FishtVue по 60-пунктовому чек-листу + Configuration support + Dual-API gap.
updated: 2026-05-10
---

# Issues — Index

Внутренний аудит библиотеки `fishtvue` против 60-пунктового чек-листа индустриальных требований к UI-кит библиотекам, плюс проверка соответствия публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) и анализ dual-API gap для коллекционных компонентов.

> **Принцип:** файл `{component}.md` создаётся ТОЛЬКО при наличии хотя бы одной проблемы. Если у компонента 0 проблем — он помечен как «✅ no issues found». Это значит «пройден аудит», а не «не проверен».

## Сводка по компонентам

Таблица заполняется по мере прохождения коммитов C2–C9 и финализируется в C10.

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
| Loading | _pending audit_ | — | — | — | — |
| Icons | _pending audit_ | — | — | — | — |
| Component class | _pending audit_ | — | — | — | — |
| Config | _pending audit_ | — | — | — | — |
| Theme | _pending audit_ | — | — | — | — |
| Locale | _pending audit_ | — | — | — | — |
| Nuxt module | _pending audit_ | — | — | — | — |
| Utilities (consolidated) | _pending audit_ | — | — | — | — |

## 60-point audit checklist

Каждый issue в отдельном файле помечен категорией из этой таблицы (`A2`, `E29.3` и т. д.), что позволяет делать cross-component сравнения.

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
- **22 компонента + 6 инфра-модулей + опционально утилиты** = до 29 targets / до 28 файлов аудита.
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
| `componentsStyle` global | ✅ / ❌ | … |
| `unstyled: true` | ✅ / ❌ | … |
| theme tokens | ✅ / ❌ | … |
| runtime theme switch | ✅ / ❌ | … |
| `t()` для текста | ✅ / ❌ | … |
| runtime locale switch | ✅ / ❌ | … |

## Dual-API gap (если применимо)

…
```
