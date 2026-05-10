---
title: Menu
summary: Структурированное меню с группами, подменю через FixWindow, separators, иконками.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Menu

## 1. Overview

`Menu` — навигационное меню с поддержкой групп, вложенных подменю (через [FixWindow](./fix-window.md)), separators, иконок, режима только-иконок (`onlyIcons`), горизонтальной/вертикальной ориентации, selection.

Stability: `stable` — 21 кейс, coverage 91.66%.

Source: [Source](../../lib/menu/Menu.vue), [Menu.d.ts](../../lib/menu/Menu.d.ts), [Menu.test.ts](../../lib/menu/Menu.test.ts).

## 2. How it's organized

```
lib/menu/
├── Menu.vue
├── Menu.d.ts          # 599 строк
├── Menu.test.ts       # 21 кейс
└── package.json
```

Зависимости: `@heroicons/vue/20/solid` (`ChevronRightIcon`), [FixWindow](./fix-window.md), [Separator](./separator.md), [Icons](./icons.md). Утилиты: `objectHandler` (deepCopyObject, deepMergeSoft, fieldsOmit, fieldsPick), [functionHandler.generateUUID](../utilities/functionHandler.md), [arrayHandler.isArray](../utilities/arrayHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для дополнительных init.
- **Поток данных:** структура menu → деревообработка через `setItems` → reactive списки `groups`/`items` → emits на active/inactive/click.
- **Стили:** `MenuComponent.setStyle()` (~12 вызовов в computed). `animation` prop задаёт CSS transition.
- **Конфиг:** `componentsOptions.Menu` — см. §10.
- **Локализация:** не использует.
- **SSR:** нет прямых обращений к DOM (через [FixWindow](./fix-window.md), который SSR-несовместим).
- **Animation:** через `styles.animation` (`"transition-all duration-500"` по умолчанию).

## 4. Quick Start

```vue
<script setup lang="ts">
import Menu from "fishtvue/menu"

const groups = [
  {
    title: "Main",
    items: [
      { _key: "home", title: "Home", icon: "home" },
      { _key: "users", title: "Users", icon: "users" }
    ]
  }
]
</script>

<template>
  <Menu :groups="groups" @on-click="(_, item) => router.push(item._key)" />
</template>
```

## 5. Props

`MenuProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `StyleMode` | — | Визуальный режим. |
| `selected` | `boolean` | — | Разрешить выбор item. |
| `horizontal` | `boolean` | — | Горизонтальный layout. |
| `useFirstLetter` | `boolean` | — | Использовать первую букву title как иконку. |
| `onlyIcons` | `boolean` | — | Только иконки + popover на остальные данные. |
| `styles` | `MaybeRef<MenuStyles>` | — | Объект `{ class?, width?, height?, animation?, activeRows?, selectedRows? }`. |
| `class` | `StyleClass` | — | Контейнер. |
| `title` | `string` | — | Заголовок меню. |
| `separator` | `MenuSeparator` | — | Конфиг разделителей. |
| `paramsWindowMenu` | `MenuFixWindow` | — | Конфиг подменю через FixWindow. |
| `groups` | `Array<GroupMenu>` | — | Группы и items. |

`ItemMenu` (фрагмент): `{ _key, title, subtitle?, icon?, items?, [key]: any }`.
`GroupMenu` (фрагмент): `{ title?, items: ItemMenu[], [key]: any }`.

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `onActive` | `(event: MouseEvent \| TouchEvent, item: ItemMenuPrivate)` | Hover/touch in. |
| `onInactive` | то же | Hover/touch out. |
| `onClick` | то же | Click on item. |

v-model contract — не применимо.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `title` | `{ title: string }` | Кастомный заголовок меню. |
| `item` | `{ data: ItemMenu & { isActive, isSelected } }` | Кастомный rendering item. |
| `footer` | — | Контент после меню. |

## 8. Exposed methods

`MenuExpose`:

| Name | Type | Description |
|---|---|---|
| `selectedItemIndex`, `activeItemIndex` | `_key \| undefined` | State selection и active. |
| `mode`, `selected`, `horizontal`, `useFirstLetter`, `onlyIcons`, `title` | derived | Computed props. |
| `iconSeparator`, `isSeparator`, `listGroups`, `paramsWindowMenu`, `baseSeparator`, `styles`, `modeStyle`, `classMenu`, `classSeparator`, `classSeparatorIcon`, `classGroupTitle`, `classTitle`, `classItemIcon`, `classItemTitleOnlyIcons`, `classItemInfoOnlyIcons`, `classItemTitleFixWindow`, `classItemInfoFixWindow`, `classItemRightIcon` | derived | CSS computed. |
| `setSelectedItem(itemKey)` | function | Программный выбор. |
| `setActiveItem(itemKey)` | function | Программное «hover». |
| `setItems(menu, depth)` | function | Перестроить tree (для динамических меню). |

## 9. Examples

### 9.1 Группы + selection

```vue
<Menu
  :selected="true"
  :groups="[
    { title: 'Account', items: [{ _key: 'profile', title: 'Profile' }] },
    { title: 'App', items: [{ _key: 'settings', title: 'Settings' }] }
  ]" />
```

### 9.2 Horizontal с onlyIcons

```vue
<Menu
  :horizontal="true"
  :only-icons="true"
  :groups="[{ items: [
    { _key: 'home', title: 'Home', icon: 'home' },
    { _key: 'help', title: 'Help', icon: 'help' }
  ]}]" />
```

### 9.3 Вложенные подменю

```vue
<Menu :groups="[{
  items: [
    { _key: 'docs', title: 'Docs', items: [
      { _key: 'guide', title: 'Guide' },
      { _key: 'api', title: 'API' }
    ]}
  ]
}]" />
```

Подменю автоматически рендерится через [FixWindow](./fix-window.md).

### 9.4 Custom item slot

```vue
<Menu :groups="groups">
  <template #item="{ data }">
    <span :class="data.isActive ? 'font-bold' : ''">{{ data.title }}</span>
    <Badge v-if="data.count" :point="true">{{ data.count }}</Badge>
  </template>
</Menu>
```

## 10. Configuration & Customization

### 10.1 Global

`MenuOption = Pick<MenuProps, "mode" | "selected" | "horizontal" | "useFirstLetter" | "onlyIcons" | "styles" | "class" | "title" | "separator" | "paramsWindowMenu">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет active/selected — через `styles.activeRows` / `styles.selectedRows`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-menu`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- ARIA `role="menu"`/`role="menuitem"` — проверь по DOM.
- Keyboard: ArrowKeys (up/down/left/right) для навигации — НЕ реализованы по полноценному WAI-ARIA. Tab работает.
- Focus management для подменю — на стороне [FixWindow](./fix-window.md) (без focus trap).
- `prefers-reduced-motion` не учтён.

### Security

- Custom slot `item` — родитель отвечает за безопасный rendering.

## 13. TypeScript

```ts
import type {
  MenuProps, MenuEmits, MenuSlots, MenuExpose,
  ItemMenu, GroupMenu, MenuStyles, MenuSeparator, MenuFixWindow
} from "fishtvue/menu"
import Menu from "fishtvue/menu"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 21 кейс, coverage 91.66%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Menu from "fishtvue/menu/Menu.vue"

describe("Menu", () => {
  it("rendering", () => {
    const wrapper = mount(Menu, {
      props: { groups: [{ items: [{ _key: 1, title: "A" }] }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Menu.test.ts](../../lib/menu/Menu.test.ts) (21 кейс).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Подменю не открывается | `items` пустые на parent или FixWindow не смонтирован. | Проверь структуру + см. [FixWindow](./fix-window.md). |
| Selection не сохраняется | `selected: false`. | Установи `:selected="true"`. |
| `_key` не уникален → glitches | Соглашение требует уникальный `_key` на item. | Используй [generateUUID](../utilities/functionHandler.md). |
| Custom item не показывает badge | Условие render'а в slot. | Проверь логику в template. |
| Horizontal mode dropdowns ниже | FixWindow позиция автоматическая, может конфликтовать. | Установи `paramsWindowMenu.position` явно. |

## 17. Related

- [FixWindow](./fix-window.md), [Separator](./separator.md), [Icons](./icons.md).
- [Dialog](./dialog.md), [Accordion](./accordion.md), [Alert](./alert.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Menu.vue](../../lib/menu/Menu.vue) и [Menu.d.ts](../../lib/menu/Menu.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 91.66% statements / 83.24% branch — несколько ветвей ([Menu.vue:243–244, 367–406](../../lib/menu/Menu.vue#L243-L244)) не покрыты.

### Skipped tests

Нет.

### API inconsistencies

- `ItemMenu` и `GroupMenu` имеют `[key: string]: any` — открытые расширения.
- `_key` — convention для уникального id; type не enforce'ит уникальность.
- `paramsWindowMenu` — Partial конфиг FixWindow с дополнительными menu-специфичными полями.
- Внутренние computed для `classGroup`/`classMenuItem` — функции, не computed (на стороне реализации).

### Behavioral caveats

- Вложенные menu рендерятся через FixWindow — наследуют его SSR-проблемы.
- ARIA-keyboard-навигация (ArrowKeys) не реализована полноценно.
- При горизонтальном layout с большим количеством items overflow не управляется автоматически — добавь scroll или collapse.
- `useFirstLetter: true` берёт `title[0]` без учёта Unicode-нормализации — для эмодзи или сложных символов может быть некорректно.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
