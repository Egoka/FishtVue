---
title: Issues — Menu
summary: Аудит Menu — закрыты XSS (#item-info slot), keyboard navigation, ARIA menu, compound API, focus trap, motion-safe. Остаются только cross-cutting (root exports map, root ref, colors, RTL).
updated: 2026-06-06
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/menu/
related-doc: ../components/menu.md
---

# Issues — Menu

## Сводка

| Severity | Count | Categories       |
| -------- | ----- | ---------------- |
| critical | 0     | —                |
| high     | 1     | A4-5 (exports)   |
| medium   | 1     | G34 (root ref)   |
| low      | 2     | B10, F31         |

> **2026-06-06 — закрыто 5 of 9 numbered issues + части ещё 2.** ✅ Issue 1 (XSS → `#item-info` slot ×2),
> Issue 2 (compound `<MenuItem>`/`<MenuGroup>` API), Issue 3 (keyboard navigation + roving tabindex),
> Issue 4 (ARIA `menu`/`menuitem`/`separator` + `aria-orientation`/`haspopup`/`expanded`),
> Issue 6 (submenu focus trap), Issue 7 (i18n рекомендация — docs), Issue 8 (Floating UI — наследуется от
> done/FixWindow). Частично: Issue 5 (✅ dup `initStyle`, ✅ per-component `sideEffects`, ✅ `unstyled`;
> ❌ root `exports` map — Wave 2.1), Issue 9 (✅ `prefers-reduced-motion`; ❌ RTL — Wave 8.1, ❌ colors — Wave 9).
> Остаются **cross-cutting** категории, закрываемые глобальными волнами для всех 22 компонентов:
> A4-5 (root `exports` map), G34 (root element ref), B10 (hardcoded colors), F31 (RTL). Файл остаётся active.

## ~~Issue 1: CRITICAL — XSS через `item.info` v-html~~ ✅ resolved 2026-06-06

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Menu.vue:629](../../lib/menu/Menu.vue#L629), [Menu.vue:637](../../lib/menu/Menu.vue#L637) (бывшие v-html сайты)

> ✅ **resolved 2026-06-06** — оба `v-html="item?.info"` заменены на scoped slot
> `<slot name="item-info" :item :info>{{ item?.info }}</slot>` с text-node fallback (как в Select `#marker`).
> `item.info` теперь рендерится как text; HTML — только через явный `#item-info` slot потребителя.
> Тесты: `Menu.test.ts > XSS guard (item.info)` (payload `<img onerror>` не создаёт `<img>`).

### Что найдено

```vue
<span :data-info="!!item?.info" :class="classItemInfoOnlyIcons" v-html="item?.info" />
<span :data-info="!!item?.info" :class="classItemInfoFixWindow" v-html="item?.info" />
```

`item.info` приходит из `:items` prop пользователя. v-html без санитизации.

### Почему это проблема

- Menu items часто формируются из server data (permissions, role-based menus). Любая инъекция в name/info — XSS.
- ×2 sites — двойная поверхность атаки.

### Что нужно сделать

См. [select.md Issue 1](./select.md) — fix-план через slot `<template #item-info="{ item }">{{ item.info }}</template>` или VNode-render.

## ~~Issue 2: Dual-API gap — нет compound `<Menu><MenuItem>` API~~ ✅ resolved 2026-06-06

- **Категория:** P
- **Severity:** high
- **Где:** [Menu.d.ts](../../lib/menu/Menu.d.ts) (items array)

> ✅ **resolved 2026-06-06** — добавлены renderless descriptor-компоненты
> [MenuItem.vue](../../lib/menu/MenuItem.vue) + [MenuGroup.vue](../../lib/menu/MenuGroup.vue) (+ `.d.ts`).
> `<Menu>` читает их из default slot через VNode-walk (`extractGroupsFromVNodes`) и подаёт в существующий
> `setItems`-конвейер; submenu — рекурсивным вложением `<MenuItem><MenuItem/></MenuItem>`. `:groups` prop
> выигрывает при конфликте (backward compat). Экспорт через `fishtvue` root barrel (`MenuItem`/`MenuGroup`).
> Документация — [menu.md §9.5](../components/menu.md). Тесты: `Menu.test.ts > compound API`.

### Что найдено

API только schema-driven через `items: MenuItem[]` с nested `subItems`. Custom rendering — только через единый `item` slot для всего меню.

```vue
<Menu
  :items="[
    { name: 'File', subItems: [{ name: 'Open' }, { name: 'Save' }] },
    { name: 'Edit', icon: 'edit' }
  ]" />
```

vs compound:

```vue
<Menu>
  <MenuGroup label="File">
    <MenuItem icon="open" @click="open">Open</MenuItem>
    <MenuItem icon="save" @click="save">Save</MenuItem>
  </MenuGroup>
  <MenuItem icon="edit" @click="edit">Edit</MenuItem>
</Menu>
```

### Что нужно сделать

См. [table.md Issue 3](./table.md) и [select.md Issue 3](./select.md). Параллельный fix-план через `provide(MENU_CONTEXT, ...)` + child registration. Особенно полезен для submenus — `<MenuItem><MenuItem>` рекурсивно.

## ~~Issue 3: Keyboard navigation отсутствует~~ ✅ resolved 2026-06-06

- **Категория:** E29.2
- **Severity:** high
- **Где:** [Menu.vue](../../lib/menu/Menu.vue) (`onKeydown`, roving tabindex)

> ✅ **resolved 2026-06-06** — `@keydown` на root `[data-menu]` + `onKeydown`: стрелки (по ориентации),
> `Home`/`End`, `Enter`/`Space` (активация → `onClick`), `ArrowRight`/`ArrowLeft` open/close submenu, typeahead,
> `Escape`. Roving tabindex: только сфокусированный пункт `tabindex=0`, остальные `-1` (исправлен баг `-2`);
> disabled пропускаются. Тесты: `Menu.test.ts > keyboard navigation`. Документация — [menu.md §12](../components/menu.md).

### Что найдено

Нет обработчиков ArrowUp/ArrowDown для навигации между items, ArrowRight для open submenu, ArrowLeft для close, Home/End для перехода в начало/конец.

### Почему это проблема

- WCAG 2.1 SC 2.1.1 (Keyboard) — все функции доступны через клавиатуру.
- Industry: стандарт для Menu — стрелочные клавиши.

### Что нужно сделать

1. Добавить keydown handlers на root menu:
   ```ts
   function onKeydown(e: KeyboardEvent) {
     if (e.key === "ArrowDown") focusNext()
     if (e.key === "ArrowUp") focusPrev()
     if (e.key === "ArrowRight") openSubmenu()
     if (e.key === "ArrowLeft") closeSubmenu()
     if (e.key === "Home") focusFirst()
     if (e.key === "End") focusLast()
     if (e.key === "Enter" || e.key === " ") activate()
     if (/^[a-z]$/i.test(e.key)) typeahead(e.key)
   }
   ```
2. Roving tabindex pattern: только один item имеет `tabindex=0`, остальные `tabindex=-1`.
3. Документировать в [components/menu.md](../components/menu.md) §12 A11y.

### Acceptance criteria

- [ ] Tab → focus входит в menu, ArrowDown переключает items.
- [ ] axe-core проходит.

## ~~Issue 4: ARIA — нет `role="menu"`, `role="menuitem"`, `aria-haspopup`~~ ✅ resolved 2026-06-06

- **Категория:** E29.1
- **Severity:** high
- **Где:** [Menu.vue](../../lib/menu/Menu.vue)

> ✅ **resolved 2026-06-06** — root: `role="menu"` + `:aria-orientation`; группы: `role="group"`; пункты:
> `role="menuitem"` + `:aria-disabled` + `:aria-haspopup="menu"` (для submenu) + `:aria-expanded`
> (синхронизируется с `@open`/`@close` submenu FixWindow); separators: `role="separator"` + `:aria-orientation`.
> Тесты: `Menu.test.ts > ARIA`.

### Что нужно сделать

1. Root: `<ul role="menu" :aria-orientation="orientation ?? 'vertical'">`.
2. Items: `<li role="menuitem" :aria-haspopup="!!item.subItems" :aria-expanded="isOpen">`.
3. Group separators: `<li role="separator">`.
4. Submenu trigger: `aria-controls`, `aria-expanded`.

## Issue 5: SSR styles + sideEffects + unstyled — ⚠️ partially resolved 2026-06-06

См. [button.md Issue 1, 8, 9, 14](./button.md).

> ⚠️ **partially resolved 2026-06-06:**
> - ✅ C17 (dup `initStyle` в SFC) — снят ещё в Wave 2.3 (canon comment в [Menu.vue](../../lib/menu/Menu.vue)).
> - ✅ A2 (sideEffects) — добавлен `"sideEffects": ["**/*.css","**/*.vue"]` в [lib/menu/package.json](../../lib/menu/package.json).
> - ✅ unstyled — cross-cutting через `Component.setStyle()` guard.
> - ❌ A4-5 (root `exports` map / ESM-CJS) — root-level packaging, остаётся в **Wave 2.1** (общий фикс для всех 22).

## ~~Issue 6: Focus trap для дочернего FixWindow submenu~~ ✅ resolved 2026-06-06

- **Категория:** E29.3
- **Severity:** medium

Submenu открывается через FixWindow. Focus trap нужен внутри submenu. См. [done/fixwindow.md Issue 4](./done/fixwindow.md).

> ✅ **resolved 2026-06-06** — submenu FixWindow получает `:focus-trap="usingKeyboard"` (FixWindow уже умеет
> focus trap + focus return — done/FixWindow). Trap включается только при keyboard-взаимодействии, чтобы hover
> не крал фокус (`usingKeyboard` сбрасывается на `pointerenter`). Тесты: `Menu.test.ts > submenu focus trap`.

## ~~Issue 7: `t()` для labels item.name?~~ ✅ resolved 2026-06-06 (docs)

- **Категория:** F30
- **Severity:** medium

Если `item.name` — i18n key (`"menu.file"`) или строка? Сейчас рендерится как text — пользователь сам резолвит. Документировать в [components/menu.md](../components/menu.md) — рекомендация передавать локализованный text.

> ✅ **resolved 2026-06-06** — задокументировано в [menu.md §12 → i18n](../components/menu.md): `item.title`/`item.info`
> — пользовательский текст, компонент не резолвит i18n-ключи; рекомендация передавать уже локализованный текст
> (`item.title = t("menu.file")` на стороне потребителя).

## ~~Issue 8: Floating UI для submenu positioning~~ ✅ resolved 2026-06-06 (inherited)

- **Категория:** H39

Submenu позиционируется через FixWindow. См. [done/fixwindow.md Issue 2](./done/fixwindow.md).

> ✅ **resolved 2026-06-06** — наследуется от done/FixWindow: submenu рендерится через FixWindow, который
> уже переписан на `@floating-ui/vue` (`useFloating` + `autoUpdate` + `flip`/`shift`). Отдельного кода в Menu
> не требуется. Проверено: nested `<Menu>` в submenu FixWindow рендерится корректно (`Menu.test.ts`).

## Issue 9: prefers-reduced-motion / RTL / colors — ⚠️ partially resolved 2026-06-06

Cross-cutting. См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern, плюс [switch.md](./switch.md).

> ⚠️ **partially resolved 2026-06-06:**
> - ✅ E29.7 (`prefers-reduced-motion`) — default `styles.animation` = `"motion-safe:transition-all motion-safe:duration-500"`
>   (применяется в `classMenu`/`classMenuItem`). Тест: `Menu.test.ts > reduced motion`.
> - ❌ F31 (RTL) — буквальные `left/right` в классах Menu остаются; закрывается глобально в **Wave 8.1** (logical properties).
> - ❌ B10 (hardcoded colors) — `bg-neutral-*`/`bg-stone-*` остаются; закрывается глобально в **Wave 9** (semantic tokens).

## Cross-cutting: Configuration support

| Настройка                | Поддержано? | Комментарий                             |
| ------------------------ | ----------- | --------------------------------------- |
| `componentsOptions.Menu` | ✅          | mode, items, и др.                      |
| `componentsStyle` global | ✅          | через `MenuComponent.componentsStyle()` |
| `unstyled: true`         | ✅          | cross-cutting `Component.setStyle()` guard |
| Theme tokens vs hardcode | ⚠️          | частично (B10/Wave 9)                    |
| `t()` для текста         | N/A         | item.title/info — пользовательский (см. Issue 7) |

## Dual-API gap

~~См. [Issue 2](#issue-2-dual-api-gap-—-нет-compound-menumenuitem-api).~~ ✅ **resolved 2026-06-06** — compound
`<Menu><MenuItem>/<MenuGroup>` API реализован (Issue 2). Dual-API parity с Table/Form/Select/Accordion (Wave 6.4).
