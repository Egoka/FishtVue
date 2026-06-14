---
title: Menu
summary: Структурированное меню с группами, подменю через FixWindow, separators, иконками. Два API (schema-driven `groups` + compound `<MenuItem>`/`<MenuGroup>`), полная keyboard navigation и WAI-ARIA menu.
updated: 2026-06-06
stability: stable
since: 0.2.11
---

# Menu

## 1. Overview

`Menu` — навигационное меню с поддержкой групп, вложенных подменю (через [FixWindow](./fix-window.md)), separators, иконок, режима только-иконок (`onlyIcons`), горизонтальной/вертикальной ориентации, selection.

Два параллельных API:

- **Schema-driven** — `:groups="GroupMenu[]"` (основной, см. §4–§9).
- **Compound** — декларативные `<MenuItem>` / `<MenuGroup>` внутри `<Menu>` (см. §9.5). При наличии `:groups` schema выигрывает (backward compat).

Accessibility: роль `menu` / `menuitem` / `group` / `separator`, `aria-orientation` / `aria-haspopup` / `aria-expanded`, полная keyboard navigation (стрелки, Home/End, Enter/Space, typeahead, roving tabindex), focus trap для submenu, `prefers-reduced-motion`-safe анимации (см. §12).

Stability: `stable`.

Source: [Source](../../lib/menu/Menu.vue), [Menu.d.ts](../../lib/menu/Menu.d.ts), [Menu.test.ts](../../lib/menu/Menu.test.ts).

## 2. How it's organized

```
lib/menu/
├── Menu.vue           # основной компонент (schema + compound API, keyboard nav, ARIA)
├── Menu.d.ts
├── Menu.test.ts       # 45 кейсов
├── MenuItem.vue       # renderless descriptor для compound API
├── MenuItem.d.ts
├── MenuItem.test.ts
├── MenuGroup.vue      # renderless descriptor для compound API
├── MenuGroup.d.ts
├── MenuGroup.test.ts
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
| `item` | `{ data: ItemMenu & { isActive, isSelected } }` | Кастомный rendering item (полностью заменяет содержимое пункта, включая `item-info`). |
| `item-info` | `{ item: ItemMenu (public), info: string \| undefined }` | Кастомный rendering `item.info`. По умолчанию `info` рендерится как **text** (без `v-html`). Используй этот slot для собственного (в т.ч. HTML) рендеринга — безопасность контента на стороне потребителя. |
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

### 9.5 Compound API (`<MenuItem>` / `<MenuGroup>`)

Альтернатива schema-driven `:groups`. `MenuItem` и `MenuGroup` — renderless descriptor-компоненты: собственного DOM не рендерят, родительский `<Menu>` читает их через VNode-walk и рендерит пункты сам. Submenu задаётся вложением `<MenuItem>` в `<MenuItem>`.

```vue
<script setup lang="ts">
import Menu, { MenuItem, MenuGroup } from "fishtvue/menu"
</script>

<template>
  <Menu :selected="true">
    <MenuGroup title="File">
      <MenuItem icon="document" @click="open">Open</MenuItem>
      <MenuItem icon="bookmark" @click="save">Save</MenuItem>
    </MenuGroup>
    <MenuItem icon="pencil-square">
      Edit
      <!-- вложенные MenuItem становятся submenu -->
      <MenuItem @click="undo">Undo</MenuItem>
      <MenuItem @click="redo">Redo</MenuItem>
    </MenuItem>
  </Menu>
</template>
```

Правила резолва:

- `title` берётся из prop `title`, иначе — из текстового содержимого default slot (`<MenuItem>Open</MenuItem>` → `title: "Open"`).
- Top-level `<MenuItem>` без обёртки `<MenuGroup>` собираются в одну неявную группу.
- При одновременном указании `:groups` и compound-детей — **`:groups` выигрывает** (backward compat).
- `@click` / `@active` / `@inactive` на `<MenuItem>` мапятся в `onClick` / `onActive` / `onInactive` item'а.

### 9.6 Безопасный `item.info` через `#item-info`

`item.info` по умолчанию рендерится как text (никакого `v-html` — защита от XSS). Для кастомного (в т.ч. HTML) рендеринга — scoped slot `#item-info` (ответственность за безопасность контента на потребителе):

```vue
<Menu :groups="groups">
  <template #item-info="{ info }">
    <kbd class="rounded border px-1 text-xs">{{ info }}</kbd>
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

- **ARIA roles:** root — `role="menu"` + `:aria-orientation` (`vertical` / `horizontal`); группы — `role="group"`; пункты — `role="menuitem"` + `:aria-disabled`; пункты с submenu — `:aria-haspopup="menu"` + `:aria-expanded` (синхронизируется с open/close FixWindow); separators — `role="separator"` + `:aria-orientation`.
- **Keyboard navigation** (WAI-ARIA menu pattern):
  - `ArrowDown`/`ArrowUp` (vertical) или `ArrowRight`/`ArrowLeft` (horizontal) — переход между пунктами (disabled пропускаются).
  - `ArrowRight` (vertical) / `ArrowDown` (horizontal) — открыть submenu сфокусированного пункта; `ArrowLeft` / `ArrowUp` или `Escape` — закрыть.
  - `Home` / `End` — первый / последний пункт.
  - `Enter` / `Space` — активировать пункт (эмитит `onClick`).
  - typeahead — буква фокусирует следующий пункт, чей `title` начинается с неё.
  - **Roving tabindex:** только один пункт имеет `tabindex=0`, остальные `-1`; Tab входит в меню на активный пункт.
- **Focus trap для submenu:** дочернее submenu через [FixWindow](./fix-window.md) получает `:focus-trap`, когда меню используется с клавиатуры (`usingKeyboard`). При hover focus не крадётся; при keyboard-открытии фокус уходит внутрь submenu и возвращается на trigger при закрытии (focus return — на стороне FixWindow).
- **`prefers-reduced-motion`:** анимация по умолчанию использует `motion-safe:`-префиксы (`styles.animation = "motion-safe:transition-all motion-safe:duration-500"`).

### Security

- **`item.info` рендерится как text** (через scoped slot `#item-info` с text-node fallback, **без `v-html`**) — защита от XSS, т.к. menu items часто формируются из server data. Для кастомного HTML — `#item-info` slot (безопасность на стороне потребителя).
- Custom slot `item` — родитель отвечает за безопасный rendering.

### i18n

- `item.title` / `item.info` — пользовательский текст; компонент рендерит его как есть и **не** резолвит i18n-ключи. Рекомендация: передавай уже локализованный текст (`item.title = t("menu.file")` на стороне потребителя), а не ключ.

## 13. TypeScript

```ts
import type {
  MenuProps, MenuEmits, MenuSlots, MenuExpose,
  ItemMenu, GroupMenu, MenuStyles, MenuSeparator, MenuFixWindow
} from "fishtvue/menu"
import Menu from "fishtvue/menu"

// Compound API descriptor компоненты + их типы:
import { MenuItem, MenuGroup } from "fishtvue"
import type { MenuItemProps, MenuItemEmits, MenuGroupProps } from "fishtvue/menu/MenuItem"
// либо точечно: import MenuItem from "fishtvue/menu/MenuItem.vue"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 45 кейсов (`Menu.test.ts`) + descriptor-тесты `MenuItem.test.ts` / `MenuGroup.test.ts`.
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

Реальные тесты — [Menu.test.ts](../../lib/menu/Menu.test.ts) (45 кейсов), [MenuItem.test.ts](../../lib/menu/MenuItem.test.ts), [MenuGroup.test.ts](../../lib/menu/MenuGroup.test.ts).

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

На момент ревизии (2026-06-06) комментариев `TODO/FIXME/HACK/XXX` в [Menu.vue](../../lib/menu/Menu.vue) и [Menu.d.ts](../../lib/menu/Menu.d.ts) не зафиксировано.

### Skipped tests

Нет.

### API inconsistencies

- `ItemMenu` и `GroupMenu` имеют `[key: string]: any` — открытые расширения.
- `_key` — convention для уникального id; type не enforce'ит уникальность.
- `paramsWindowMenu` — Partial конфиг FixWindow с дополнительными menu-специфичными полями.
- Внутренние computed для `classGroup`/`classMenuItem` — функции, не computed (на стороне реализации).

### Behavioral caveats

- **Compound API:** `MenuItem` / `MenuGroup` — renderless descriptors; их сопоставление в VNode-walk идёт по имени компонента (`name === "MenuItem"`/`"MenuGroup"`), импорт самих SFC в `Menu.vue` не выполняется (он ломал бы type-resolver `@vue/compiler-sfc`). Богатый (нетекстовый) label у `<MenuItem>` не поддержан — для произвольного содержимого используй prop `title` или slot `#item`; текстовое содержимое default slot мапится только в `title`.
- Compound-структура считывается из default slot и подаётся в тот же `setItems`-конвейер; `_key` генерируются в `onMounted` (client-only) — на SSR меню рендерится пустым (наследуется от текущей архитектуры + FixWindow).
- Вложенные menu рендерятся через FixWindow — наследуют его поведение (собственный dependency-free движок позиционирования с auto-flip/shift, focus trap, SSR).
- При горизонтальном layout с большим количеством items overflow не управляется автоматически — добавь scroll или collapse.
- `useFirstLetter: true` берёт `title[0]` без учёта Unicode-нормализации — для эмодзи или сложных символов может быть некорректно.
- Keyboard-активация (`Enter`/`Space`) эмитит `onClick` с `KeyboardEvent` (приводится к типу `MouseEvent` в payload — поля, специфичные для мыши, будут `undefined`).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
