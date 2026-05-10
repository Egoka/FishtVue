---
title: Issues — Menu
summary: Аудит Menu — XSS через item.info v-html (×2), schema-driven only (нет compound), без keyboard navigation между items, без ARIA menu role.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/menu/
related-doc: ../components/menu.md
---

# Issues — Menu

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | C13 (v-html × 2 in item.info) |
| high | 6 | A2, A4-5, C17, E29.1, E29.2, P (dual-API) |
| medium | 4 | E29.3, F30, G34, H39 |
| low | 3 | E29.7, B10, F31 |

## Issue 1: CRITICAL — XSS через `item.info` v-html

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Menu.vue:388](../../lib/menu/Menu.vue#L388), [Menu.vue:392](../../lib/menu/Menu.vue#L392)

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

## Issue 2: Dual-API gap — нет compound `<Menu><MenuItem>` API

- **Категория:** P
- **Severity:** high
- **Где:** [Menu.d.ts](../../lib/menu/Menu.d.ts) (items array)

### Что найдено

API только schema-driven через `items: MenuItem[]` с nested `subItems`. Custom rendering — только через единый `item` slot для всего меню.

```vue
<Menu :items="[
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

## Issue 3: Keyboard navigation отсутствует

- **Категория:** E29.2
- **Severity:** high
- **Где:** [Menu.vue](../../lib/menu/Menu.vue)

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

## Issue 4: ARIA — нет `role="menu"`, `role="menuitem"`, `aria-haspopup`

- **Категория:** E29.1
- **Severity:** high
- **Где:** [Menu.vue](../../lib/menu/Menu.vue)

### Что нужно сделать

1. Root: `<ul role="menu" :aria-orientation="orientation ?? 'vertical'">`.
2. Items: `<li role="menuitem" :aria-haspopup="!!item.subItems" :aria-expanded="isOpen">`.
3. Group separators: `<li role="separator">`.
4. Submenu trigger: `aria-controls`, `aria-expanded`.

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 6: Focus trap для дочернего FixWindow submenu

- **Категория:** E29.3
- **Severity:** medium

Submenu открывается через FixWindow. Focus trap нужен внутри submenu. См. [fixwindow.md Issue 4](./fixwindow.md).

## Issue 7: `t()` для labels item.name?

- **Категория:** F30
- **Severity:** medium

Если `item.name` — i18n key (`"menu.file"`) или строка? Сейчас рендерится как text — пользователь сам резолвит. Документировать в [components/menu.md](../components/menu.md) — рекомендация передавать локализованный text.

## Issue 8: Floating UI для submenu positioning

- **Категория:** H39

Submenu позиционируется через FixWindow. См. [fixwindow.md Issue 2](./fixwindow.md).

## Issue 9: prefers-reduced-motion / RTL / colors

Cross-cutting. См. [button.md Issue 10](./button.md), [switch.md](./switch.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Menu` | ✅ | mode, items, и др. |
| `componentsStyle` global | ✅ | через `MenuComponent.componentsStyle()` |
| `unstyled: true` | ❌ | cross-cutting |
| Theme tokens vs hardcode | ⚠️ | частично |
| `t()` для текста | N/A | item.name — пользовательский |

## Dual-API gap

См. [Issue 2](#issue-2-dual-api-gap-—-нет-compound-menumenuitem-api). Один из ключевых dual-API кандидатов наряду с Table, Form, Select, Accordion.
