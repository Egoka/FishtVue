---
title: Menu
summary: Структурированное меню с группами, подменю через FixWindow, separators, иконками. Два API (schema-driven `groups` + compound `<MenuItem>`/`<MenuGroup>`), полная keyboard navigation, WAI-ARIA menu, RTL-aware (logical classes + флип стороны submenu).
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Menu

## 1. Overview

`Menu` — навигационное меню с поддержкой групп, вложенных подменю (через [FixWindow](./fix-window.md)), separators, иконок, режима только-иконок (`onlyIcons`), горизонтальной/вертикальной ориентации, selection.

Два параллельных API:

- **Schema-driven** — `:groups="MenuGroupData[]"` (основной, см. §4–§9).
- **Compound** — декларативные `<MenuItem>` / `<MenuGroup>` внутри `<Menu>` (см. §9.5). При наличии `:groups` schema выигрывает (backward compat).

Accessibility: роль `menu` / `menuitem` / `group` / `separator`, `aria-orientation` / `aria-haspopup` / `aria-expanded`, полная keyboard navigation (стрелки, Home/End, Enter/Space, typeahead, roving tabindex), focus trap для submenu, `prefers-reduced-motion`-safe анимации (см. §12).

Stability: `stable` — 101 кейс.

Source: [Source](../../lib/menu/Menu.vue), [Menu.d.ts](../../lib/menu/Menu.d.ts), [Menu.test.ts](../../lib/menu/Menu.test.ts).

## 2. How it's organized

```
lib/menu/
├── Menu.vue           # основной компонент (schema + compound API, keyboard nav, ARIA)
├── Menu.d.ts
├── Menu.test.ts       # 101 кейс
├── MenuItem.vue       # renderless descriptor для compound API
├── MenuItem.d.ts
├── MenuItem.test.ts
├── MenuGroup.vue      # renderless descriptor для compound API
├── MenuGroup.d.ts
├── MenuGroup.test.ts
└── package.json
```

Зависимости: `@heroicons/vue/20/solid` (`ChevronRightIcon`), [FixWindow](./fix-window.md), [Separator](./separator.md), [Icons](./icons.md). Утилиты: `objectHandler` (fieldsOmit, fieldsPick), [functionHandler.generateUUID](../utilities/functionHandler.md), [arrayHandler.isArray](../utilities/arrayHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для дополнительных init.
- **Поток данных:** структура menu → деревообработка через `setItems` → reactive списки `groups`/`items` → emits на active/inactive/click.
- **Классы:** карта `classes` резолвится через `MenuComponent.resolveClasses<MenuClassKey>(props)`
  ([Menu.vue:105](../../lib/menu/Menu.vue#L105)). Порядок склейки фиксирован helper'ом —
  `база → state → options.classes[k] → props.classes[k] → (root) options.class → props.class`;
  у группы и пункта самый частный сегмент — их собственные `group.class`/`item.class`, они идут
  последними. Ключи делятся на **element** (аддитивные, twMerge) и **aspect** (`animation`,
  `itemActive`, `itemSelected` — заменяющие, `""` отключает) — см. §5.1.
- **Конфиг:** `componentsOptions.Menu` — см. §10.
- **Локализация:** не использует.
- **SSR:** нет прямых обращений к DOM (через [FixWindow](./fix-window.md), который SSR-несовместим).
- **Animation:** через aspect-ключ `classes.animation`
  (`"motion-safe:transition-all motion-safe:duration-500"` по умолчанию).

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
| `mode` | `StyleMode` | `componentsStyle()` ?? `"outlined"` | Визуальный режим. |
| `selected` | `boolean` | `false` | Разрешить выбор item. |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Ориентация раскладки. Бывший булев `horizontal`. |
| `firstLetter` | `boolean` | `false` | Показывать первую букву `title`, если у пункта нет `icon`. Бывший `useFirstLetter`. |
| `onlyIcons` | `boolean` | `false` | Только иконки + popover на остальные данные. |
| `width` | `TWidth` | — | Ширина меню; число трактуется как `px`. Бывший `styles.width`. |
| `height` | `THeight` | — | Высота меню; число трактуется как `px`. Бывший `styles.height`. |
| `class` | `StyleClass` | — | Классы **корня** `<div data-menu>` (dev-patterns §2 A). На подменю не наследуется. |
| `classes` | `ClassesMap<MenuClassKey>` | — | Карта классов внутренних элементов — см. §5.1. Наследуется подменю. |
| `title` | `string` | `""` | Заголовок меню. |
| `separator` | `MenuSeparator` | — | Конфиг разделителей (`visible`, `icon` + props [Separator](./separator.md)). |
| `fixWindowProps` | `MenuFixWindowProps` | — | Props подменю-окна [FixWindow](./fix-window.md). Бывший `paramsWindowMenu`. |
| `groups` | `MaybeRef<Array<MenuGroupData>>` | — | Группы и items. |

`MenuItemData` (фрагмент): `{ title?, icon?, info?, disabled?, class?, menu?, [key]: any }`.
`MenuGroupData` (фрагмент): `{ title?, items?: MenuItemData[], class?, separator? }`.

### 5.1 Classes keys

`MenuClassKey` ([Menu.d.ts:215](../../lib/menu/Menu.d.ts#L215)):

| Key | Element (`data-*`) | Kind | Default |
|---|---|---|---|
| `root` | `[data-menu]` (≡ prop `class`, но наследуется подменю) | element | `p-1 w-min max-w-4xl shadow-md border …` + `mode` + `overflow-auto` |
| `title` | `[data-menu-title]` | element | `min-w-max px-2 py-1.5 text-sm font-semibold` + `mode` |
| `separator` | корень `<Separator>` — `[data-separator]` | element | — (база живёт в `separator.class`) |
| `separatorIcon` | `[data-separator] [data-icon]` | element | `h-4 w-4 text-surface-200 dark:text-surface-800` |
| `group` | `[data-menu-group]` | element | `flex flex-col rounded` (+`flex flex-row` при `orientation="horizontal"`) |
| `groupTitle` | `[data-menu-group-title]` | element | `mt-[10px] ms-4 me-2 … uppercase text-[10px] font-bold` |
| `item` | `[data-menu-item]` | element | `items-center rounded mt-0.5 px-2 py-1.5 text-sm … min-h-[44px]` |
| `itemIcon` | `[data-menu-item-icon]` | element | `h-5 w-4 opacity-60` (+ `flex justify-center items-center … font-extralight` в режиме `firstLetter`) |
| `itemTitle` | `[data-menu-item-title]` | element | `w-max` (+`data-[title=true]:mx-2` вне `onlyIcons`) |
| `itemInfo` | `[data-menu-item-info]` | element | `ms-auto text-xs tracking-widest opacity-50 data-[info=true]:ps-2` |
| `itemEndIcon` | `[data-menu-item-end-icon]` (обёртка chevron'а) | element | `inline-block h-4 w-4 opacity-60 rtl:-scale-x-100` |
| `animation` | корень и пункт | aspect | `motion-safe:transition-all motion-safe:duration-500` |
| `itemActive` | `[data-menu-item]` под курсором | aspect | `bg-surface-200/50 dark:bg-surface-700/50` |
| `itemSelected` | выбранный `[data-menu-item]` | aspect | `bg-surface-200 dark:bg-surface-700` |

Собственные `group.class` и `item.class` остаются и добавляются **после** `classes.group`/`classes.item`.

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `item-active` | `(event: MouseEvent \| TouchEvent, item: MenuItemDataPrivate)` | Hover/touch in. Бывший `onActive`. |
| `item-inactive` | то же | Hover/touch out. Бывший `onInactive`. |
| `item-click` | то же | Click on item. Бывший `onClick`. |

Поля-колбэки `MenuItemData.onClick`/`onActive`/`onInactive` **не** переименованы — это listener-props,
которыми `<MenuItem @click>` передаёт обработчик в схему; собственные emits `<MenuItem>`
(`click`/`active`/`inactive`) тоже без изменений.

v-model contract — не применимо.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `title` | `{ title: string }` | Кастомный заголовок меню. |
| `item` | `{ data: MenuItemData & { isActive, isSelected } }` | Кастомный rendering item (полностью заменяет содержимое пункта, включая `item-info`). |
| `item-info` | `{ item: MenuItemData (public), info: string \| undefined }` | Кастомный rendering `item.info`. По умолчанию `info` рендерится как **text** (без `v-html`). Используй этот slot для собственного (в т.ч. HTML) рендеринга — безопасность контента на стороне потребителя. |
| `footer` | — | Контент после меню. |

## 8. Exposed methods

`MenuExpose`:

| Name | Type | Description |
|---|---|---|
| `selectedItemIndex`, `activeItemIndex` | `_key \| undefined` | State selection и active. |
| `mode`, `selected`, `orientation`, `firstLetter`, `onlyIcons`, `title`, `width`, `height` | derived | Computed props. |
| `iconSeparator`, `isSeparator`, `listGroups`, `fixWindowProps`, `baseSeparator`, `modeStyle`, `classBase`, `classSeparator`, `classSeparatorIcon`, `classGroupTitle`, `classTitle`, `classItemIcon`, `classItemTitleOnlyIcons`, `classItemInfoOnlyIcons`, `classItemTitleFixWindow`, `classItemInfoFixWindow`, `classItemEndIcon` | derived | CSS computed. `styles` снят, `classMenu` → `classBase`, `classItemRightIcon` → `classItemEndIcon`. |
| `rootRef` | `Ref<HTMLElement \| null>` | Ref на корневой `[data-menu]` (G34). `null`, пока групп нет (root под `v-if`). Для скролла/измерений/интеграций. |
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
  orientation="horizontal"
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

### 9.5 Карта классов

```vue
<Menu
  class="rounded-xl"
  :width="240"
  :classes="{
    root: 'shadow-lg',
    title: 'text-theme-600',
    item: 'px-3',
    itemIcon: 'text-theme-500',
    itemInfo: 'font-mono',
    itemActive: 'bg-theme-100 dark:bg-theme-900',
    itemSelected: 'bg-theme-200 dark:bg-theme-800',
    animation: ''
  }"
  :groups="groups" />
```

`class` садится только на корень верхнего меню; `classes` наследуется подменю целиком.
Aspect-ключи (`animation`, `itemActive`, `itemSelected`) **заменяют** default, а `""` его отключает.

### 9.6 Compound API (`<MenuItem>` / `<MenuGroup>`)

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
- `@click` / `@active` / `@inactive` на `<MenuItem>` мапятся в `onClick` / `onActive` / `onInactive` item'а
  (это listener-props схемы, а не события `<Menu>` — те называются `item-click`/`item-active`/`item-inactive`).

### 9.7 Безопасный `item.info` через `#item-info`

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

`MenuOption = Pick<MenuProps, "mode" | "selected" | "orientation" | "firstLetter" | "onlyIcons" | "width" | "height" | "class" | "classes" | "title" | "separator" | "fixWindowProps">`
([Menu.d.ts:537](../../lib/menu/Menu.d.ts#L537)). Слияние global + local — **по ключу** карты:
`options.classes[k]` идёт до `props.classes[k]`, конфликт решает twMerge.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет active/selected — через aspect-ключи `classes.itemActive` / `classes.itemSelected`;
transition — `classes.animation`. Остальные элементы — element-ключи из §5.1.

### 10.4 CSS layer override

Root класс — `fv fishtvue-menu`. Селекторы внутренних элементов — `[data-menu-title]`,
`[data-menu-group]`, `[data-menu-group-title]`, `[data-menu-item]`, `[data-menu-item-icon]`,
`[data-menu-item-title]`, `[data-menu-item-info]`, `[data-menu-item-end-icon]`;
ориентация читается с корня через `[data-orientation]`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- **ARIA roles:** root — `role="menu"` + `:aria-orientation` (`vertical` / `horizontal`); группы — `role="group"`; пункты — `role="menuitem"` + `:aria-disabled`; пункты с submenu — `:aria-haspopup="menu"` + `:aria-expanded` (синхронизируется с open/close FixWindow); separators — `role="separator"` + `:aria-orientation`.
- **Keyboard navigation** (WAI-ARIA menu pattern):
  - `ArrowDown`/`ArrowUp` (vertical) или `ArrowRight`/`ArrowLeft` (horizontal) — переход между пунктами (disabled пропускаются).
  - `ArrowRight` (vertical) / `ArrowDown` (horizontal) — открыть submenu сфокусированного пункта; `ArrowLeft` / `ArrowUp` или `Escape` — закрыть.
  - `Home` / `End` — первый / последний пункт.
  - `Enter` / `Space` — активировать пункт (эмитит `item-click`).
  - typeahead — буква фокусирует следующий пункт, чей `title` начинается с неё.
  - **Roving tabindex:** только один пункт имеет `tabindex=0`, остальные `-1`; Tab входит в меню на активный пункт.
- **Focus trap для submenu:** дочернее submenu через [FixWindow](./fix-window.md) получает `:focus-trap`, когда меню используется с клавиатуры (`usingKeyboard`). При hover focus не крадётся; при keyboard-открытии фокус уходит внутрь submenu и возвращается на trigger при закрытии (focus return — на стороне FixWindow).
- **`prefers-reduced-motion`:** анимация по умолчанию использует `motion-safe:`-префиксы (`classes.animation` по умолчанию — `"motion-safe:transition-all motion-safe:duration-500"`).
- **RTL (logical, F31):** направленные классы — логические (`ms`/`me`/`ps`/`text-start`), submenu-chevron зеркалится через `rtl:-scale-x-100` — авто-флип при `dir="rtl"` без атрибута на компоненте. Submenu и tooltip ([FixWindow](./fix-window.md)) раскрываются на логической стороне: FixWindow зеркалит только alignment, поэтому Menu сам флипает физическую сторону `position` (`right`↔`left`) по `getComputedStyle(rootRef).direction` (детект после mount). Если потребитель оборачивает меню в `dir="rtl"` — подменю уходит влево, а не вправо.

### Security

- **`item.info` рендерится как text** (через scoped slot `#item-info` с text-node fallback, **без `v-html`**) — защита от XSS, т.к. menu items часто формируются из server data. Для кастомного HTML — `#item-info` slot (безопасность на стороне потребителя).
- Custom slot `item` — родитель отвечает за безопасный rendering.

### i18n

- `item.title` / `item.info` — пользовательский текст; компонент рендерит его как есть и **не** резолвит i18n-ключи. Рекомендация: передавай уже локализованный текст (`item.title = t("menu.file")` на стороне потребителя), а не ключ.

## 13. TypeScript

```ts
import type {
  MenuProps, MenuEmits, MenuSlots, MenuExpose,
  MenuClassKey, MenuItemData, MenuGroupData, MenuData, MenuSeparator, MenuFixWindowProps
} from "fishtvue/menu"
import Menu from "fishtvue/menu"

// Compound API descriptor компоненты + их типы:
import { MenuItem, MenuGroup } from "fishtvue"
import type { MenuItemProps, MenuItemEmits, MenuGroupProps } from "fishtvue/menu/MenuItem"
// либо точечно: import MenuItem from "fishtvue/menu/MenuItem.vue"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 101 кейс (`Menu.test.ts`) + descriptor-тесты `MenuItem.test.ts` / `MenuGroup.test.ts`.
- **Breaking changes (1.0.0):**
  - `styles: MaybeRef<MenuStyles>` снят целиком. Карта классов переехала в `classes`
    (`styles.class.body` → `classes.root`, `styles.class.itemRightIcon` → `classes.itemEndIcon`,
    остальные ключи — один в один), три aspect-значения — в `classes.animation` /
    `classes.itemActive` / `classes.itemSelected`, размеры — в top-level `width` / `height`.
    Типы `MenuStyles` и `MenuStylesPrivate` удалены.
  - Aspect-ключи больше не принимают `boolean`: вместо `activeRows: false` — `itemActive: ""`.
  - `class` больше не общий класс контейнера, а строго корень `[data-menu]` верхнего меню
    (ключ карты — `root`, и только он наследуется подменю).
  - `horizontal: boolean` → `orientation: "horizontal" | "vertical"` (default `"vertical"`);
    корень получил `data-orientation`.
  - `useFirstLetter` → `firstLetter`, `paramsWindowMenu` → `fixWindowProps`,
    `MenuSeparator.isVisible` → `visible`.
  - События `onActive` / `onInactive` / `onClick` → `item-active` / `item-inactive` / `item-click`.
    Это **silent break**: старые `@on-click` и т.п. просто перестанут вызываться.
  - Типы: `ItemMenu` → `MenuItemData`, `ItemMenuPrivate` → `MenuItemDataPrivate`,
    `GroupMenu` → `MenuGroupData`, `GroupMenuPrivate` → `MenuGroupDataPrivate`,
    тип `MenuItem` → `MenuData` (снимает коллизию с компонентом `<MenuItem>`),
    `MenuItemPrivate` → `MenuDataPrivate`, `MenuFixWindow` → `MenuFixWindowProps`.
    Мёртвые `MenuItemOption` / `MenuGroupOption` удалены.
  - Expose: `styles` снят, `classMenu` → `classBase`, `classItemRightIcon` → `classItemEndIcon`,
    `horizontal` → `orientation`, `useFirstLetter` → `firstLetter`,
    `paramsWindowMenu` → `fixWindowProps`; добавлены `width` / `height`.
  - Алиасов нет: снятые props уедут fallthrough-атрибутами на корень.
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

Реальные тесты — [Menu.test.ts](../../lib/menu/Menu.test.ts) (101 кейс), [MenuItem.test.ts](../../lib/menu/MenuItem.test.ts), [MenuGroup.test.ts](../../lib/menu/MenuGroup.test.ts).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Подменю не открывается | `items` пустые на parent или FixWindow не смонтирован. | Проверь структуру + см. [FixWindow](./fix-window.md). |
| Selection не сохраняется | `selected: false`. | Установи `:selected="true"`. |
| `_key` не уникален → glitches | Соглашение требует уникальный `_key` на item. | Используй [generateUUID](../utilities/functionHandler.md). |
| Custom item не показывает badge | Условие render'а в slot. | Проверь логику в template. |
| Horizontal mode dropdowns ниже | FixWindow позиция автоматическая, может конфликтовать. | Установи `fixWindowProps.position` явно. |

## 17. Related

- [FixWindow](./fix-window.md), [Separator](./separator.md), [Icons](./icons.md).
- [Dialog](./dialog.md), [Accordion](./accordion.md), [Alert](./alert.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-06-06) комментариев `TODO/FIXME/HACK/XXX` в [Menu.vue](../../lib/menu/Menu.vue) и [Menu.d.ts](../../lib/menu/Menu.d.ts) не зафиксировано.

### Skipped tests

Нет.

### API inconsistencies

- `MenuItemData` и `MenuGroupData` имеют `[key: string]: any` — открытые расширения.
- `_key` — convention для уникального id; type не enforce'ит уникальность.
- `fixWindowProps` — Partial конфиг FixWindow с дополнительными menu-специфичными полями.
- `classGroup`/`classMenuItem` — функции, а не computed: им нужен аргумент (`group.class`/`item`).

### Behavioral caveats

- **Compound API:** `MenuItem` / `MenuGroup` — renderless descriptors; их сопоставление в VNode-walk идёт по имени компонента (`name === "MenuItem"`/`"MenuGroup"`), импорт самих SFC в `Menu.vue` не выполняется (он ломал бы type-resolver `@vue/compiler-sfc`). Богатый (нетекстовый) label у `<MenuItem>` не поддержан — для произвольного содержимого используй prop `title` или slot `#item`; текстовое содержимое default slot мапится только в `title`.
- Compound-структура считывается из default slot и подаётся в тот же `setItems`-конвейер; `_key` генерируются в `onMounted` (client-only) — на SSR меню рендерится пустым (наследуется от текущей архитектуры + FixWindow).
- Вложенные menu рендерятся через FixWindow — наследуют его поведение (собственный dependency-free движок позиционирования с auto-flip/shift, focus trap, SSR).
- При горизонтальном layout с большим количеством items overflow не управляется автоматически — добавь scroll или collapse.
- `firstLetter: true` берёт `title[0]` без учёта Unicode-нормализации — для эмодзи или сложных символов может быть некорректно.
- Keyboard-активация (`Enter`/`Space`) эмитит `onClick` с `KeyboardEvent` (приводится к типу `MouseEvent` в payload — поля, специфичные для мыши, будут `undefined`).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
