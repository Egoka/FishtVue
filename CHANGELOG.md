# CHANGELOG

## [1.0.1](https://github.com/Egoka/FishtVue/compare/v0.2.11...v1.0.1) (2026-09-14)

> **How to read this release.** The auto-generated `v1.0.0...v1.0.1` diff shows two fixes — that is an artifact of a bookkeeping tag, not the scope of the work. Version `1.0.0` was unpublished from npm long ago and the registry reserves that number forever, so the 1.x line opens at `1.0.1`.
>
> The real baseline is **`0.2.11`**, the last version available in the registry. Between it and this release: **149 commits, 464 changed files, 14 breaking changes**.

**Upgrading from 0.2.x will break your code.** The library ships one global major and changes the props contract across all 23 components at once — but only once, with a migration recipe for every step.

📖 **[Migration guide](https://github.com/Egoka/FishtVue/blob/v1.0.1/Documentation/migration-guide.md)** — 15 sections, each with a "removed → replacement → what happens if you keep the old one" table and a ready-to-run `rg`/`sed` recipe. (The guide is written in Russian.)

---

### ⚠️ Start here: the breaks your compiler will not catch

Most breaking changes are loud — the first `vue-tsc` run will point at them. Six of them are **silent**: the code compiles, the types line up, the behaviour is different. Check these by hand before anything else.

| What | Before | After | What silently happens |
|---|---|---|---|
| **`class` changed target** | inner node | component root | Your styling moves to the wrapper or positioner. The prop is valid, the type is valid, grep will not help. The inner node is now `classes.content` (or `classes.base` on form controls) |
| **Renamed events** | `@update:sizePage`, `@onClick`, `@switch-size-page`, `@getCalendar`, `@isActive`, `@update:isInvalid` | `@update:page-size`, `@item-click`, `@switch-page-size`, `@ready`, `@active`, `@update:invalid` | The old handler simply stops firing. No error |
| **Accordion `toggle` payload** | array of sections | object `{ key, open, items }` | Same event name — your handler now receives an object instead of an array |
| **Inverted booleans** | `isHiddenNavigationButtons`, `notAnimate`, `withoutMargin`, `notCloseBackground`, `separatorNotHoverOpacity` | `navigationButtons`, `animated`, `margin`, `closeOnBackdrop`, `separatorFade` | A mechanical rename **without flipping the value** gives you the opposite behaviour |
| **`Alert.position`** | physical `top-right`, `left`… | logical `top-end`, `start`… | A physical value fails the allow-list and silently falls back to `top` |
| **`Badge` `delete` event** | `@delete` | `@close` | An event cannot fall back to a default — it simply stopped being emitted |

---

### One class system

The headline of this major. There used to be three ways to reach an inner node — the `styles` bag, flat hooks like `classInput`/`classBody`/`classLine`/`classMaskQuery`, and `class` itself, which meant something different in every component. There is now a single rule, identical across all 23 components:

```vue
<!-- before: class targeted something inside; styling went through a styles bag or flat hooks -->
<Table class="p-0" :styles="{ class: { body: 'rounded-xl', cellText: 'text-sm' }, border: { radius: 8 } }" />

<!-- after: class is always the root, internals go through the classes map, sizing is top-level -->
<Table class="p-0" :classes="{ root: 'rounded-xl', td: 'text-sm' }" :border-radius="8" />
```

- `class` is **always** the component root, with no exceptions.
- `classes` is a map of inner elements whose key names are consistent library-wide (`root`, `content`, `base`, `icon`, `line`…).
- The `styles` bag is dissolved in Table, Menu and Split: classes moved into `classes`, sizes and flags became top-level props.
- Aspect keys (`animation`, `itemActive`, `rowHover`) no longer accept `boolean` — write `itemActive: ""` instead of `activeRows: false`.
- Under `unstyled: true` your own classes are no longer wiped: the root emits `fv` plus whatever you passed.

Boolean props moved to a **positive form** — `edit` → `editable`, `search` → `searchable`, `isFilter` → `filterable`, `isValue` → `hasValue`, `clear` → `clearable`, `isInvalid` → `invalid`.

---

### What's new

**VirtualScroller** — a new windowing primitive plus the `useVirtualScroll` composable. Table row virtualization (on by default, with opt-out) and Select option virtualization both run on the same core.

**Compound API** in seven components — declarative markup instead of config arrays: `<Column>/<ColumnGroup>` for Table, `<SelectItem>/<SelectGroup>`, `<MenuItem>/<MenuGroup>`, `<AccordionItem>`, `<FormField>/<FormSection>`.

**Runtime theme API** — themes switch on the fly through CSS-variable indirection, no rebuild required. A `surface` semantic token was added and 19 components were migrated off hardcoded neutrals onto it; semantic intent slots landed; the built-in Aurora / Harmony / Sapphire themes now actually differ from one another. Default styles are wrapped in `@layer fishtvue`, so your cascade no longer fights the library's.

**The uno engine reached parity with Tailwind v4** — arbitrary properties, `space-*`, v4 variants and names, modern transform properties, negative values. The engine is now fail-closed: an unrecognised class is reported in dev instead of being swallowed.

**i18n** — interpolation in `t()`, CLDR pluralization, locale metadata and an automatic `<html dir>` for RTL.

**Polymorphic `as`** on Button, `registerFieldType` on Form, native form submit in Switch, TextEditor and Form.

---

### Accessibility

A sweep across the whole library rather than spot fixes:

- WAI-ARIA patterns: disclosure in Accordion, `aria-modal` plus focus trap in Dialog and FixWindow, `role="separator"` in Separator, `aria-live` in Select, InputLayout and Table.
- Keyboard: navigation in Menu, `Home`/`End`/typeahead in Select, keyboard resize in Split, sortable headers in Table.
- `label ↔ control` association wired across every form control.
- `prefers-reduced-motion`, `forced-colors` (high contrast) and print styles in every animated component.
- RTL through logical properties: `left`/`right` → `start`/`end` in Button, Separator, Alert, Menu, Table and Icons.
- Root refs exposed for programmatic focus.

---

### Security

XSS gates closed everywhere user-supplied HTML was rendered: Accordion (subtitle), Alert, Select, Menu (slot), Form (marker), InputLayout, Switch and Table. `sanitizeHtml` was tightened. Switch's `help` prop now renders as text — use the `#help` slot for markup.

Memory leaks fixed: ResizeObservers in Pagination, observers in InputLayout, timers and listeners in Calendar, Dialog, Select, Table and Split.

---

### Performance

- Table rows and Select options virtualize on a shared core.
- Heroicons load through per-icon dynamic imports instead of a namespace import.
- Button lazy-loads Loading and FixWindow.
- FixWindow moved to its own positioning engine — `@floating-ui/vue` and `@vueuse/core` are no longer needed.

---

### Packaging

| | 0.2.11 | 1.0.1 |
|---|---|---|
| `vue` | in `dependencies` | in `peerDependencies` |
| `v-calendar`, `quill`, `@vueup/vue-quill`, `gsap` | in `dependencies` | optional peers, lazily loaded |
| Size | 2.02 MB / 424 files | 2.47 MB / 432 files (sourcemaps included) |

Shipping `vue` as a direct dependency meant two copies of Vue on one page — `provide`/`inject` could not see across them, and the `Config` plugin quietly fell back to the window global. It is a peer now.

Heavy integrations became **optional**: if you do not use Calendar or TextEditor, you do not install `v-calendar` or `quill`. Plus sourcemaps in the tarball, an honest `sideEffects` field for tree-shaking, a `files` whitelist, and an exports map generated from the build output.

Nuxt module: compound children are auto-imported, and `disableGlobalStyles` was added.

---

<details>
<summary><b>Full breaking-change list by component</b> (14 commits)</summary>

**Renamed component**
- `Aria` → `Textarea`: import `fishtvue/aria` → `fishtvue/textarea`, types `AriaProps` → `TextareaProps`, option key `componentsOptions.Aria` → `Textarea`, `typeComponent: "Aria"` → `"Textarea"`. No alias, deliberately.

**Removed deprecated aliases** (carried over from 0.2.x)
- `Icons.stileIcon` → `variant`; `Button.iconPosition` `left`/`right` → `start`/`end`; `Separator.contentPosition` `left`/`right` → `start`/`end`; `Alert.position` physical → logical; `Badge` `delete` event → `close`; `IDataItem.marker` → the `#marker` scoped slot; locale keys `select.resultsCountOne`/`resultsCountNone` → `select.resultsCount` with CLDR forms.

**Table** — `styles` removed entirely: `styles.class.body` → `classes.root`, `bodyTable` → `viewport`, `slotHeader`/`slotFooter` → `header`/`footer`, `cellText` → `td`, `maskQuery` → `mark`, `activeRow` → `rowActive`, `hoverRows` → `rowHover`, `border.*` → `border*`. Sizes and flags are top-level: `isStripedRows` → `stripedRows`, `heightCell` → `cellHeight`, `borderRadiusPx` → `borderRadius`, `defaultWidthColumn` → `defaultColumnWidth`. Booleans: `edit` → `editable`, `search` → `searchable`, `resizedColumns` → `resizableColumns`, Column `isFilter`/`isSort`/`isResized` → `filterable`/`sortable`/`resizable`. Names: `totalCount` → `total`, `countVisibleRows` → `visibleRows`, `sizeLoadingRows` → `loadingRows`, `countDataOnLoading` → `loadingThreshold`, `noData`/`noColumn` → `emptyText`/`emptyColumnsText`. Column `class` → `classes`, `paramsFilter` → `filterProps`, `editorOptions` → `editorProps`. Event `switch-size-page` → `switch-page-size`. Types `I*` → `Table*`. Selectors `data-table-component` → `data-table`, `data-table-scroll` → `data-table-viewport`.

**Menu** — `styles` removed (`styles.class.body` → `classes.root`, `itemRightIcon` → `itemEndIcon`), `horizontal: boolean` → `orientation`, `useFirstLetter` → `firstLetter`, `paramsWindowMenu` → `fixWindowProps`, `MenuSeparator.isVisible` → `visible`. Events `onActive`/`onInactive`/`onClick` → `item-active`/`item-inactive`/`item-click`. Types `ItemMenu` → `MenuItemData`, `GroupMenu` → `MenuGroupData`, `MenuItem` → `MenuData`.

**Form** — `structureClass`/`structureClassGrid` → `classes.section`/`classes.grid`, `classCol` → `classes.field`, `modeStyle` → `mode`, `modeLabel` → `labelMode`, `isHidden` → `hidden`, `isValue` → `hasValue`. The `type` prop on `<FormField>` is gone — `typeComponent` is the only discriminator. Type `FieldAria` → `FieldTextarea`.

**Split** — `styles` → `classes`, `direction` → `orientation` (and the `data-direction` attribute → `data-orientation`), `separatorNotHoverOpacity` → `separatorFade` (inverted), type `Size` → `PanelSize`.

**Dialog** — `classBody` → `class`, the former `class` → `classes.content`; `notAnimate` → `animated`, `withoutMargin` → `margin`, `notCloseBackground` → `closeOnBackdrop` (all three inverted); `toTeleport` → `teleport`.

**Alert** — `class` is the `[data-alert]` root, the card is `classes.body`; `notAnimate` → `animated`; `toTeleport` → `teleport`.

**FixWindow** — `classBody` → `class`, the former `class` → `classes.content`; `typePosition` → `strategy`; `delay` → `openDelay`; type `FixWindowTeleport` → `TeleportTarget`.

**Pagination** — `sizePage` → `pageSize`, `sizesSelector` → `pageSizes`, `visibleNumberPages` → `visiblePages`, `isInfoText` → `infoText`, `isPageSizeSelector` → `pageSizeSelector`, `isHiddenNavigationButtons` → `navigationButtons` (inverted), event `update:sizePage` → `update:pageSize`.

**VirtualScroller** — `classContent` → `classes.content`, `delay` → `throttle`, `showLoader` → `loader`.

**Button / Badge** — `mode` → `variant`; `classIcon` → `classes.icon`, `classContent` → `classes.content`.

**Separator** — flat class hooks → `classes.{segment,segmentStart,segmentEnd,line,lineStart,lineEnd,content}`; the `vertical` boolean → `orientation`; `data-separator-left/right` → `data-separator-start/end`.

**Switch** — the `updateModelValue` alias is gone (use `@update:model-value`); `switchingType` and `mode` are now closed unions; `help` renders as text; `data-input-switch` → `data-switch-button`.

**Accordion** — `dataSource` → `items`, type `AccordionItem` → `AccordionItemData`, `toggle` payload is now an object.

**Form controls** (InputLayout, Input, Textarea, Select, Calendar, TextEditor) — `class` targets the root, its former content moved to `classes.base`, `classBody` is gone. Flat hooks became `classes` keys. Booleans: `isValue` → `hasValue`, `isInvalid` → `invalid`, `clear` → `clearable`, `noQuery: true` → `searchable: false`, `isNotCloseOnDateChange: true` → `closeOnSelect: false`. Bags: `paramsFixWindow` → `fixWindowProps`, `paramsDatePicker` → `datePickerProps`, `paramsDialog` → `dialogProps`, `paramsTextEditor` → `editorProps`. Select: `dataSelect` → `options`, `noData` → `emptyText`, component `SelectOption` → `SelectItem`, `SelectGroup.label` → `title`. Emits `isActive` → `active`, `getCalendar` → `ready`, `update:isInvalid` → `update:invalid`. DOM: controls are marked with `-control`.

**Icons / Label / Loading** — Icons: `class`/`style` now land on the `<i data-icon>` root, svg classes are `classes.icon`. Label: `title` → `label`, `isRequired` → `required`, `type` → `labelMode`, `animate` → `animated`, `classBody` → `class`. Loading: type `"4-dots-goeey"` → `"4-dots-gooey"`.

**Types** — `namesColors` → `ColorName`, the `_key` alias is removed (use `ItemKey`). The `_key` field in Table row data is unchanged.

**Component** — under `unstyled: true`, `setStyle` returns `"fv"` plus consumer classes instead of an empty string; type `setStyleOptions` → `SetStyleOptions`.

</details>

<details>
<summary><b>Fixes</b> (41 commits)</summary>

- **Calendar** — `visibleDate` stayed empty forever due to a stale-sync race with the lazily loaded `v-calendar`; memory leak; duplicate `initStyle`.
- **Pagination** — `undefined` leaking into v-model channels; channel payloads are now `number`; ResizeObservers disconnect on unmount.
- **Select** — guarded the `ms-[width]` class body against an `undefined beforeWidth`; XSS, leak, `aria-live`, intl.
- **Split** — drag ends on `pointerup`/`pointercancel` outside the component; wrong pixel default; the non-existent `ring-ring` token replaced with the theme focus ring.
- **Input** — transition flashes on focus and mount; phone mask; 11 audit items.
- **Menu** — `MenuItem`/`MenuGroup` were missing from the npm tarball.
- **Table** — filter popovers now float via `FixWindow scrollableEl`.
- **Config** — built-in presets and locales are no longer mutated during `install()`.
- **Utils** — AM/PM casing in `formatDate`.
- **Theme** — fail-closed engine with dev warnings, negative transforms, v4 scale corrections.
- **Button** — respects the global `componentsStyle` config.
- **Loading** — `sr-only` routed through the `setStyle` factory, removing a Tailwind dependency for consumers.
- Plus closed audits against the 60-point checklist for Alert, Dialog, FixWindow, InputLayout, Label, Textarea, Switch, Accordion, Form and Loading.

</details>

---

### Compatibility

- **Vue** `^3.5.0` (peer).
- **Nuxt** 3 and 4 — optional.
- Optional peers: `v-calendar` (Calendar), `quill` + `@vueup/vue-quill` (TextEditor), `gsap` (animations).
- SSR-ready, evergreen-only, no runtime Tailwind dependency for consumers.

Coverage: 6477 tests across 77 files, gated at 91% statements / 80% branches / 93% functions / 94% lines.

```bash
npm i fishtvue@1.0.1
```

**[Full diff against 0.2.11](https://github.com/Egoka/FishtVue/compare/v0.2.11...v1.0.1)** · **[Documentation](https://github.com/Egoka/FishtVue/blob/v1.0.1/Documentation/README.md)** · **[fisht.org](https://www.fisht.org)**

## [0.2.12](https://github.com/Egoka/FishtVue/compare/v0.2.11...v0.2.12) (2026-05-10)


### Bug Fixes

* **table:** repair asyncData tests and behavior ([7393c9a](https://github.com/Egoka/FishtVue/commit/7393c9af6f2a7a6efa61401055f763f76dcfa355))
* **utils:** resolve audit findings from _utilities.md ([d34511f](https://github.com/Egoka/FishtVue/commit/d34511f6649d72fea6ca9c4c5af8a5a1b2c1940d))
* **select:** stabilize handles user interaction test on CI ([caad6c4](https://github.com/Egoka/FishtVue/commit/caad6c4920dbc13e97cf34d6ca2b6b03f64361fe))

## [0.2.11](https://github.com/Egoka/FishtVue/compare/v0.2.10...v0.2.11) (2025-11-28)


### Bug Fixes

* **bugs:** fixed bugs ([c32e0c3](https://github.com/Egoka/FishtVue/commit/c32e0c36f6dd9ef5ed4a09f837fe55e46d6c1e4d))
* **bugs:** fixed bugs ([d4848ba](https://github.com/Egoka/FishtVue/commit/d4848ba906453b412558b629fdc0732eaf612942))
* **typecheck:** improved typing ([8d63583](https://github.com/Egoka/FishtVue/commit/8d63583f9854739a9f676d901a03bc1ce985752c))
* **accordion:** unnecessary code has been removed ([922a48e](https://github.com/Egoka/FishtVue/commit/922a48eaaafc5db4b32ae75d5a7ce41e645c37df))

## [0.2.10](https://github.com/Egoka/FishtVue/compare/v0.2.9...v0.2.10) (2025-11-14)


### Bug Fixes

* **style:** fixed table styles ([2506a29](https://github.com/Egoka/FishtVue/commit/2506a298bd574f1df0b3f3f0b9c431c28812d0c0))

## [0.2.9](https://github.com/Egoka/FishtVue/compare/v0.2.8...v0.2.9) (2025-11-08)


### Bug Fixes

* **split:** the panel calculation logic has been changed ([c48bf9d](https://github.com/Egoka/FishtVue/commit/c48bf9d8e143cf1bec719106a988514ca6707471))

## [0.2.8](https://github.com/Egoka/FishtVue/compare/v0.2.7...v0.2.8) (2025-11-08)


### Bug Fixes

* **form:** form synchronicity has been fixed ([21f1c01](https://github.com/Egoka/FishtVue/commit/21f1c0148841f945ba891a5b191d7ca8470cd5fd))

## [0.2.7](https://github.com/Egoka/FishtVue/compare/v0.2.6...v0.2.7) (2025-10-26)


### Bug Fixes

* **table:** added an active row in the table ([1181116](https://github.com/Egoka/FishtVue/commit/1181116fd776a9055d50e73c4c71eeecc6822a66))

## [0.2.6](https://github.com/Egoka/FishtVue/compare/v0.2.5...v0.2.6) (2025-10-26)


### Bug Fixes

* **label:** updated visual Label ([3254a20](https://github.com/Egoka/FishtVue/commit/3254a201c15f260738f27a649bd611a80e4d4701))

## [0.2.5](https://github.com/Egoka/FishtVue/compare/v0.2.4...v0.2.5) (2025-10-18)


### Bug Fixes

* **styles:** fixed styles and fixed bugs ([073add4](https://github.com/Egoka/FishtVue/commit/073add42dfc4061e5b45b820a1df05b82e4d3038))

## [0.2.4](https://github.com/Egoka/FishtVue/compare/v0.2.3...v0.2.4) (2025-10-05)

## [0.2.3](https://github.com/Egoka/FishtVue/compare/v0.2.2...v0.2.3) (2025-10-05)


### Bug Fixes

* **types:** fixed types ([bc4faac](https://github.com/Egoka/FishtVue/commit/bc4faaca85a2591f4159a4bdf1cd5e06fb2e57ee))
* **theme:** updated rules in styles ([a777c40](https://github.com/Egoka/FishtVue/commit/a777c4052adf6e347726dd5d813977aea90e3bdf))
* **theme:** updated rules in styles ([5101d2e](https://github.com/Egoka/FishtVue/commit/5101d2e266f86c7c2f3a8da744a93cfdefbc1226))

## [0.2.2](https://github.com/Egoka/FishtVue/compare/v0.2.1...v0.2.2) (2025-10-01)


### Bug Fixes

* **components:** enhance components with improved typing, touch support, and styling ([ed8e642](https://github.com/Egoka/FishtVue/commit/ed8e642e60c019b91b4ee6665e105b636c85ac00))

## [0.2.1](https://github.com/Egoka/FishtVue/compare/v0.2.0...v0.2.1) (2025-08-05)


### Bug Fixes

* **plugin:** fixed NuxtPlugin ([622a9a1](https://github.com/Egoka/FishtVue/commit/622a9a10335331285abf55fe81587813359df7e6))

# [0.2.0](https://github.com/Egoka/FishtVue/compare/v0.1.1...v0.2.0) (2025-08-04)


### Features

* **nuxt:** updated support to nuxt 4.0.0 ([db3d1d7](https://github.com/Egoka/FishtVue/commit/db3d1d760aaed399e9772bfa48b48f64cd9c0603))

## [0.1.1](https://github.com/Egoka/FishtVue/compare/v0.1.0...v0.1.1) (2025-05-14)


### Bug Fixes

* update styles and improve component functionality ([afe7a6e](https://github.com/Egoka/FishtVue/commit/afe7a6eafc5c6520e2f157bd999f109770d4d744))

# [0.1.0](https://github.com/Egoka/FishtVue/compare/v0.0.8...v0.1.0) (2025-04-30)


### Features

* components ([db0027a](https://github.com/Egoka/FishtVue/commit/db0027a044b3168d906ee3f399913c4a02c72b3f))

## [0.0.8](https://github.com/Egoka/FishtVue/compare/v0.0.7...v0.0.8) (2025-02-09)

## [0.0.7](https://github.com/Egoka/FishtVue/compare/v0.0.6...v0.0.7) (2025-02-07)


### Bug Fixes

* **module:** added a module for nuxt ([5fa78ba](https://github.com/Egoka/FishtVue/commit/5fa78badccb2116acdbccf3c9ce0621e03edcb11))

## [0.0.6](https://github.com/Egoka/FishtVue/compare/v0.0.5...v0.0.6) (2025-01-26)


### Bug Fixes

* **components:** fixed components for ssr ([d120e4e](https://github.com/Egoka/FishtVue/commit/d120e4ee76c4192d9da94492f10426ac440eae6b))
* **tailwind:** switching from --tw to --fv ([8009480](https://github.com/Egoka/FishtVue/commit/8009480bf7a52a829ab97eff1862b914801c24c1))
* **components:** the components have been adapted to ssr and rendering errors have been fixed ([9abf0bf](https://github.com/Egoka/FishtVue/commit/9abf0bf3a15319110127e113d2951123c1a572f9))
* **instance:** the correct definition of instance has been made and a window check has been added ([7ea5e90](https://github.com/Egoka/FishtVue/commit/7ea5e90cf0f0a2a5d792321148102082b47cc161))
* **ssr:** the nuxtInitPlugin function has been written ([e47d5b7](https://github.com/Egoka/FishtVue/commit/e47d5b713d70a5b2115669b3bb785707feb89b6d))

## [0.0.5](https://github.com/Egoka/FishtVue/compare/v0.0.4...v0.0.5) (2024-12-07)


### Bug Fixes

* **components_style:** added a global component style type ([7cfc619](https://github.com/Egoka/FishtVue/commit/7cfc619d368979791bd7feaedf76310d247b7a85))
* **locale:** added functionality with setting and managing locales ([1c958b0](https://github.com/Egoka/FishtVue/commit/1c958b07ec78b0f5c5fad5a809ebd06e41d12cf4))
* **options:** added global settings properties in missing places options ([774106f](https://github.com/Egoka/FishtVue/commit/774106fa523b18370d2fe9c2df0a26fa9e84680f))
* **components:** added the data argument for selection and testing ([ec7199a](https://github.com/Egoka/FishtVue/commit/ec7199a8d544cb6711f885084c52d32269e4fdbd))
* **split:** added the SplitExpose interface ([9255d0a](https://github.com/Egoka/FishtVue/commit/9255d0a25de8769c3692be8a11a91fce771facab))
* **test:** fixed tests ([965f40f](https://github.com/Egoka/FishtVue/commit/965f40f828b5f5ddeeeb1d4ba8d28f067d71a5d1))
* **utils:** utilities, locales, and theme have been fixed and updated ([daf00d3](https://github.com/Egoka/FishtVue/commit/daf00d3a029db25570d1129185c4e4332c132041))

## [0.0.4](https://github.com/Egoka/FishtVue/compare/v0.0.3...v0.0.4) (2024-11-12)


### Bug Fixes

* **package:** update package repository ([ffed5d4](https://github.com/Egoka/FishtVue/commit/ffed5d43f8a0167f5fa4eb33c4963603c44c8bcd))

## [0.0.2](https://github.com/Fisht-Org/FishtVue/compare/v0.0.1...v0.0.2) (2024-11-12)


### Bug Fixes

* **ci:** added automatic version update via semantic-release ([acfee7b](https://github.com/Fisht-Org/FishtVue/commit/acfee7bdcc61ae7da2f45907707b21e3beca3ca4))
