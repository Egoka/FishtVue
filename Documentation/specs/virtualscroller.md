---
title: "ТЗ: VirtualScroller"
status: approved-draft
updated: 2026-06-13
kind: spec
note: >
  Это ТЗ (планирование) на ещё не реализованный компонент. Источник канона — `lib/`;
  данный файл живёт в `Documentation/specs/` и НЕ является canon-документацией компонента.
  После реализации заменяется/дополняется обычным `Documentation/components/virtualscroller.md`.
---

# ТЗ: `VirtualScroller` — переиспользуемый примитив виртуализации списков

**Закрывает:** отложенный Select **Issue 7** (виртуализация списков >500 элементов).
**Аналог:** [PrimeVue VirtualScroller](https://primevue.org/virtualscroller/), адаптирован под канон FishtVue.

## 0. Принятые решения (зафиксированы с заказчиком)

1. **Архитектура** — headless composable `useVirtualScroll` + презентационный SFC `VirtualScroller.vue`.
2. **Variable height** — переменная высота элементов входит в ядро v1 (не только fixed).
3. **Объём** — полный сразу: `orientation` `vertical`/`horizontal`/`both` (grid), `appendOnly`, `lazy`/infinite-scroll.
4. **Интеграция** в `Table`/`Select`/`Menu` — **отдельным этапом ПОСЛЕ** готовности и стабилизации компонента.
5. **Скроллбар** — **enhanced-native**, **два режима** (различаются только в неактивном состоянии; активное идентично): `"macos"` (default, overlay — idle скрыт, появляется/утолщается на `:hover`/scroll, гаснет по таймауту) и `"thin"` (тонкий всегда виден, утолщается на `:hover`/scroll, возвращается в тонкий). Плюс `"native"`/`"hidden"`. WebKit/Blink — полный эффект; Firefox — упрощённо (`scrollbar-width: thin`, auto-hide невозможен). Без новых зависимостей.

## 1. Цель и не-цели

**Цель.** Низкоуровневый компонент + composable, рендерящий только видимое подмножество большого списка внутри скролл-контейнера, с переменной высотой элементов, опциональным infinite-scroll (догрузка через emit) и аккуратным macOS-скроллбаром. Единый источник виртуализации для будущей интеграции в `Table`, `Select`, `Menu`.

**Не-цели.**
- Не пагинатор и не data-grid с сортировкой/фильтрами — только windowing + lazy-load + скроллбар.
- Не подключает рантайм-зависимость у потребителя на Tailwind/CSS-in-JS (канон-запрет).
- Не интегрируется в другие компоненты в рамках этого ТЗ (это следующий этап, §10).

## 2. Архитектура

Каталог `lib/virtualscroller/`. Имя компонента — `VirtualScroller`, point-import `fishtvue/virtualscroller` (конкатенация в нижнем регистре — как `texteditor`/`fixwindow`/`inputlayout`).

| Артефакт | Роль | Потребитель |
|---|---|---|
| `useVirtualScroll.ts` | **headless ядро**: offset-модель (prefix-sum), расчёт `range`/`topPad`/`bottomPad`, `onScroll`+throttle, `scrollToIndex`, измерение через `ResizeObserver`, реактив на `items`/`itemSize`/`viewport` | `Table`/`Select`/`Menu` (свои семантические обёртки), SFC |
| `VirtualScroller.vue` | **презентация**: overflow-контейнер + spacer-разметка + слоты `#item`/`#content`/`#loader`/`#header`/`#footer`, lazy-load, loader, macOS-скроллбар, a11y-passthrough | standalone + любой потребитель, кому не нужна спец-семантика |

**Обоснование разделения.** `Table` рендерит строки внутри `<table><tbody>` — `<div>`-окно SFC туда не вложить (невалидный HTML). Поднимая математику окна в composable, переиспользуем ядро без насилия над семантикой потребителя и чиним throttle в одном месте. Текущая математика виртуализации в `Table` ([Table.vue:445](../../lib/table/Table.vue#L445)) **корректна** — она переезжает в покрытый тестами composable как референс.

## 3. Публичный API SFC `VirtualScroller`

### 3.1 Props

| Prop | Тип | Default | Назначение |
|---|---|---|---|
| `items` | `T[]` | `[]` | исходный массив данных |
| `itemSize` | `number \| ((index:number, item:T) => number) \| "auto"` | — (**required**) | высота (для `horizontal` — ширина) элемента: фикс. число, функция от индекса, или `"auto"` (замер через `ResizeObserver`) |
| `estimatedItemSize` | `number` | `40` | оценка размера незамеренных элементов (стабилизирует total/скроллбар в `"auto"`/variable режиме) |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | ось виртуализации; `"both"` — grid (виртуализация по двум осям) |
| `scrollHeight` | `string \| number` | — | высота viewport (если не задаёт родитель) |
| `scrollWidth` | `string \| number` | — | ширина viewport (для `horizontal`/`both`) |
| `overscan` | `number` | `6` | буфер элементов вне viewport с каждой стороны (PrimeVue: `numToleratedItems`) |
| `threshold` | `number` | `100` | порог авто-включения; при `items.length <= threshold` рендерятся все элементы (виртуализации нет) |
| `delay` | `number` | `0` | throttle scroll-обработчика, мс (0 = throttle по `requestAnimationFrame`) |
| `lazy` | `boolean` | `false` | infinite-scroll: данные догружает родитель по `lazy-load` |
| `appendOnly` | `boolean` | `false` | для `lazy`: лента только растёт, `start` не отпускает уже отрендеренный хвост |
| `loading` | `boolean` | `false` | внешний флаг загрузки |
| `showLoader` | `boolean` | `false` | показывать встроенный loader/skeleton |
| `scrollbar` | `"macos" \| "thin" \| "native" \| "hidden"` | `"macos"` | стиль полосы прокрутки (см. §6) |
| `class` | `StyleClass` | `undefined` | классы корневого контейнера |
| `classContent` | `StyleClass` | `undefined` | классы окна с элементами |

Резолв по канону: `props ?? options ?? defaults` через `??`, default — литерал. `T` (тип элемента) — generic по возможности; иначе `any` с JSDoc.

### 3.2 Emits (`VirtualScrollerEmits` — типизированы, **не** `null`)

| Event | Payload | Когда |
|---|---|---|
| `scroll` | `{ scrollTop:number; scrollLeft:number; direction:"up"\|"down"\|"left"\|"right" }` | каждый (throttled) scroll |
| `scroll-index-change` | `{ first:number; last:number }` | смена видимого диапазона |
| `lazy-load` | `{ first:number; last:number }` | хвост достигнут и `lazy=true` (не повторяется, пока `loading=true`) |

### 3.3 Slots

| Slot | Scoped props | Назначение |
|---|---|---|
| `item` | `{ item:T; index:number; active:boolean }` | основной шаблон одного элемента |
| `content` | `{ items:T[]; first:number; styleContent:StyleValue; getItemOptions:(i:number)=>{index:number;active:boolean} }` | полный контроль над разметкой окна (advanced) |
| `loader` | `{ index:number }` | кастомный skeleton (иначе встроенный) |
| `header` / `footer` | — | вне области виртуализации |

### 3.4 Expose (`VirtualScrollerExpose`, для template-ref)

`scrollTo(opts: ScrollToOptions)`, `scrollToIndex(index:number, behavior?:ScrollBehavior)`, `scrollInView(index:number, to:"to-start"|"to-end"|"auto")`, `getRenderedRange(): {first:number; last:number}`, `refresh()` (сброс кэша размеров — после смены `itemSize`).

### 3.5 Типы (`VirtualScroller.d.ts`)

- `declare class VirtualScroller extends ClassComponent<VirtualScrollerProps, VirtualScrollerSlots, VirtualScrollerEmits, VirtualScrollerExpose> {}`
- `declare module "vue" { interface GlobalComponents { VirtualScroller: GlobalComponentConstructor<VirtualScroller> } }` — обязательно (IntelliSense + template-ref).
- `export default VirtualScroller`.

## 4. Алгоритм виртуализации (с переменной высотой)

Ядро — **offset-модель на prefix-sum** (обобщение fixed-варианта Table).

```
sizes[i]    = известный размер элемента i (number | itemSize(i,item) | замер | estimatedItemSize)
offsets[i]  = Σ sizes[0..i-1]    // префиксные суммы; offsets[0]=0, offsets[n]=total
total       = offsets[n]

start = binarySearch(offsets, scrollPos) - overscan      // O(log n) вместо floor(scrollPos/size)
end   = binarySearch(offsets, scrollPos + viewport) + overscan
start = clamp(start, 0, n);  end = clamp(end, start, n)

topPad    = offsets[start]
bottomPad = total - offsets[end]
visible   = items.slice(start, end)
```

**Режимы `itemSize`:**
- `number` — fixed: `offsets` вычисляется аналитически, `binarySearch` сводится к делению (быстрый путь).
- `(index,item)=>number` — известные переменные размеры: `offsets` строится один раз / при смене `items`.
- `"auto"` — замер: `offsets` инициализируется из `estimatedItemSize`; после mount каждый видимый элемент измеряется `ResizeObserver`, реальный размер пишется в `sizes[i]`, prefix-sum инвалидируется **с изменённого индекса**.

**Anti-jump (anchor preservation).** При коррекции замеров элементов *выше* viewport `total`/`offsets` сдвигаются → визуальный скачок. Митигировать: при изменении суммарной высоты над `start` корректировать `scrollTop` на дельту, чтобы текущий верхний видимый элемент остался на месте.

**Доработки относительно текущего Table:**
- **throttle/`delay`** через `requestAnimationFrame` (сейчас пересчёт на каждый scroll-event — [Table.vue:469](../../lib/table/Table.vue#L469));
- `ResizeObserver` на контейнер → реактивный `viewport` (вместо разовой записи в `onMounted`);
- **lazy:** при `end >= n - overscan` и `!loading` → `emit("lazy-load", {first,last})`; в `appendOnly` `start` фиксируется на 0 (лента не «срезается» сверху);
- guard `Number(size) || estimatedItemSize` на каждый размер (как в Select GSAP-фиксе `Number(...) || 0`).

## 5. SSR / hydration

В SSR `viewport` неизвестен → первый кадр рендерит `items.slice(0, min(n, threshold))` без window-обрезки и без spacer'ов; реальное окно и замеры считаются после mount (`ResizeObserver`). Стиль инициализируется через `Component.__hooks()` (`onServerPrefetch` + `onMounted`, [component/index.ts:79](../../lib/component/index.ts#L79)) — **без** ручного `onMounted(() => initStyle())` в SFC.

## 6. Скроллбар «macOS» (enhanced-native)

**Подход.** Нативный scroll на контейнере `[data-vs-viewport]` + spacer'ы дают `scrollHeight === total` (виртуальная высота) → **нативная полоса уже корректно отражает виртуальный контент** (drag/click работают штатно, без собственной thumb-логики). Стилизуем только её вид.

**Два режима (различаются ТОЛЬКО в неактивном состоянии; активное идентично):**

| Состояние | `"macos"` (default, overlay) | `"thin"` (persistent) |
|---|---|---|
| idle / неактивно | полностью **скрыт** (thumb opacity 0) | **тонкий, всегда виден** (opacity ~.4, визуально ~4px) |
| активно (`:hover` ИЛИ `[data-scrolling]`) | **появляется + утолщается** (opacity ~.6, ~8px) | **утолщается** до того же вида — ИДЕНТИЧНО macos |
| после деактивации (~600мс) | fade-out обратно в скрытый | возврат в исходный тонкий |

**No-reflow техника:** `::-webkit-scrollbar { width:10px }` — постоянная ширина трека (нет layout-shift при смене толщины); «толщина» меняется визуально на thumb через `border:Npx solid transparent` + `background-clip:padding-box` (active = меньше border → толще thumb) + `opacity`.

**Реализация по браузерам:**
- **WebKit/Blink** (Safari/Chrome = целевой «macOS-вид»): `::-webkit-scrollbar { width:10px; height:10px }` (постоянный трек), `::-webkit-scrollbar-thumb { background-color: var(--vs-thumb); background-clip:padding-box; border:3px solid transparent; border-radius:9999px; opacity:0 }`. Idle: `macos` → `opacity:0`, `thin` → `opacity:.4`. Active (`:hover`/`[data-scrolling]`, общий для обоих) → `opacity:.6; border-width:1px`. Transition — внутри `@media (prefers-reduced-motion: no-preference)`.
- **Firefox**: `scrollbar-width: thin; scrollbar-color: var(--vs-thumb) transparent` — auto-hide невозможен → `"macos"` деградирует до thin-always, `"thin"` — нативно thin (graceful degradation).
- **JS**: scroll-обработчик ставит `[data-scrolling]` на контейнер и сбрасывает по `setTimeout` (~600мс). Hover — чистый CSS `:hover`. Режим — атрибут `[data-vs-scrollbar="macos|thin"]`.
- `scrollbar="native"` — никаких стилей (системная полоса); `scrollbar="hidden"` — `scrollbar-width:none` + `::-webkit-scrollbar{display:none}`.

**✅ Implementation-risk resolved.** `::-webkit-scrollbar` — псевдоэлемент, **не выразим** Tailwind-утилитами через `Component.setStyle()`. Решение: raw-CSS блок инжектится **напрямую через `useStyle()`** (`fishtvue/theme`, precedent — [config/baseStyle.ts](../../lib/config/baseStyle.ts) с `::-webkit-*`), guard `isClient()`, дедуп по `name`, scoped на `[data-vs-viewport]`. **НЕ** через `setStyle()` (Tailwind-only) и **НЕ** через `initStyle(customFn)` (auto-hook `__hooks()` вызывает `initStyle()` без аргументов на mount и затёр бы кастомный `stylesComp`). Цвета — CSS-переменная `--vs-thumb` (override через `class`). CSP: `useStyle` не пробрасывает `nonce` (library-wide, см. Known issues).

## 7. Доступность

VirtualScroller — низкоуровневый примитив; роль списка (`listbox`/`menu`/`grid`) задаёт потребитель. Скроллер обязан:
- отдавать `index` в scoped-slot `item`, чтобы потребитель проставил `aria-setsize` (= `items.length`) и `aria-posinset` (= `index+1`);
- помечать spacer'ы `aria-hidden="true"` (как Table — [Table.vue:2084](../../lib/table/Table.vue#L2084));
- `role="presentation"` на технических обёртках;
- не ломать `tabindex`/`focus` потребителя (фокус-менеджмент — на стороне Select/Menu).

## 8. Инфраструктура (по канону)

- Файлы: `lib/virtualscroller/{VirtualScroller.vue, VirtualScroller.d.ts, VirtualScroller.test.ts, useVirtualScroll.ts, package.json}`.
- `package.json`: `{ "main":"./virtualscroller.mjs", "module":"./virtualscroller.mjs", "types":"./VirtualScroller.d.ts" }`.
- Регистрация имени: `VirtualScroller: VirtualScrollerOption` в `ComponentsOptions` ([FishtVue.d.ts:194](../../lib/config/FishtVue.d.ts#L194)) **и** в `NamesComponents` (иначе `new Component<"VirtualScroller">()` не пройдёт типизацию).
- `lib/index.ts` — добавить в barrel.
- Rollup — обычный auto-SFC (compound-entry/`index.ts` **не** нужен, дочерних компонентов нет).
- Nuxt module — авто-импорт через стандартный список компонентов ([module/nuxt.ts](../../lib/module/nuxt.ts)).
- Locale — ключ дефолтного текста loader'а (en/ru) в `lib/locale`.
- Theme — `VirtualScrollerOption` + дефолтные стили (по образцу Table/Menu); CSS-переменная `--vs-thumb`.
- Tailwind-словари классов — `const`, не `ref`.

## 9. Тесты (canon-минимум + специфика)

`lib/virtualscroller/VirtualScroller.test.ts` (+ юнит-тесты `useVirtualScroll`):
- window-slice корректность (fixed) · prefix-sum + binarySearch (variable) · `topPad`/`bottomPad`;
- `overscan` буфер · scroll меняет `range` и эмитит `scroll-index-change`;
- `items.length <= threshold` → виртуализации нет (рендер всех);
- `"auto"`: замер через мок `ResizeObserver` патчит `sizes`, anti-jump корректирует `scrollTop`;
- `lazy-load` эмитится на хвосте и **не дублируется** при `loading=true`; `appendOnly` не срезает верх;
- `scrollToIndex`/`scrollInView` математика; `refresh()` сбрасывает кэш;
- слоты `#item`/`#content`/`#loader`/`#header`/`#footer`; emits; reactivity при смене `items`/`itemSize`;
- a11y: spacer'ы `aria-hidden`, `index` в slot;
- scrollbar: `data-scrolling` ставится/сбрасывается; `scrollbar="hidden"` прячет полосу;
- option-resolution (`props → componentsOptions → defaults`);
- boundary: `items=[]`, 1 элемент, `itemSize=0`/отрицательный → guard на `estimatedItemSize`, `orientation` все три.

## 10. Этап интеграции (ПОСЛЕ готовности компонента — отдельным ТЗ/коммитами)

| Компонент | План | Риск-зона |
|---|---|---|
| **Table** | заменить bespoke-математику ([Table.vue:351-473](../../lib/table/Table.vue#L351)) на `useVirtualScroll`, сохранив `<tr>`-спейсеры и условия отключения (grouping/pagination/async). Бонус — throttle, variable-height. | column-resize, sticky-header, colspan-спейсеры → regression-тесты обязательны |
| **Select** | при `count > threshold` рендерить опции через `useVirtualScroll`; **переписать keyboard-nav** с DOM-scan (`querySelectorAll("li[data-select-list-item]")`) на index-математику + `scrollToIndex`; **отключить GSAP-stagger** в virtual-режиме. Закрывает Issue 7. | группы (variable-height заголовки) — проверить отдельно; анимации |
| **Menu** | опц. `virtual` для длинных меню; проще Select. | — |
| **Loading** | низкий приоритет: skeleton-строки через `#loader`. | — |
| Прочие 18 | **нет** (нет длинных списков / фикс. размер). | — |

## 11. Известные ограничения v1

- `"auto"`-режим: до первого замера total — оценка по `estimatedItemSize`; нативная полоса может слегка «дрожать» при коррекции (митигируется anti-jump, но не устраняется на 100%).
- Firefox: скроллбар без анимации толщины (`scrollbar-width: thin` только).
- Смена `itemSize` на лету требует `refresh()`.
- `orientation:"both"` (grid): только сеточные (равные по строке) раскладки; masonry — вне scope.
- Стилизация скроллбара завязана на `::-webkit-scrollbar`/`scrollbar-*` — иные движки игнорируют.

## 12. Definition of Done

`pnpm typecheck` + `pnpm test -- virtualscroller` зелёные · покрытие §9 · `Documentation/components/virtualscroller.md` создан (canon, Russian, раздел Known issues) · `Documentation/issues/select.md` Issue 7 переведён из `⏸️ deferred` в ссылку на этот компонент (intergration pending) · матрицы пересчитаны · Conventional Commits.
