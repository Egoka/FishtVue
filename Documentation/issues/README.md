---
title: Issues — Index
summary: Сводный индекс аудит-документов компонентов и инфра-модулей FishtVue по 60-пунктовому чек-листу + Configuration support + Dual-API gap. Cross-cutting findings, fix roadmap с чекбоксами.
updated: 2026-06-14
last-changes: 2026-06-14 — accordion: закрыты Issue 2 (P, dual-API compound `<Accordion><AccordionItem>` через VNode-walk — renderless [AccordionItem.vue](../../lib/accordion/AccordionItem.vue) + [index.ts](../../lib/accordion/index.ts) barrel + compound-entry в [rollup.config.js](../../lib/rollup.config.js); `:data-source` выигрывает, open-state сохраняется по индексу при re-render), Issue 5 (C17/A2/L53 — SSR-стили через `__hooks`, `unstyled`-guard наследуется, `sideEffects` явно в [package.json](../../lib/accordion/package.json)), Issue 7 частично (E29.7 motion-safe: `motion-safe:transition*` + reduce-motion мгновенный `@leave`; F31 RTL: `text-start`/`ms-8`; F30 i18n → N/A), G34 (root-ref `rootRef` expose). Accordion.test.ts 26 → 38 + NEW AccordionItem.test.ts (3) = 41; typecheck + accordion suite + `lib:build` (accordion.mjs named-экспорт AccordionItem) зелёные. Severity matrix: Accordion 0/3/2/3 → 0/0/0/1 (остаётся только B10 semantic-tokens/high-contrast → Wave 9), TOTAL 119 → 112. Docs: [components/accordion.md](../components/accordion.md) (compound §5.1/§9.4, motion/RTL §3/§12, rootRef §8), issues/accordion.md. Ранее 2026-06-14 — split: fix **залипшего курсора-resize** при release указателя вне компонента (regression от overlay-подхода Issue 1). overlay (`fixed inset-0` + `cursor-*-resize`) гасится только когда `isStartResize → false` (это делает `stopResizePanel`), а тот висел исключительно на separator `@pointerup`/`@pointercancel` → если кнопку отпускали за пределами компонента/viewport, событие не приходило (pointer capture не всегда доставляет `pointerup` обратно на handle), overlay залипал и блокировал весь сайт. Fix: на `startResizePanel` ставятся window-листенеры `pointerup`/`pointercancel` (safety-net, завершают drag из любой точки), снимаются на stop + `onUnmounted` ([Split.vue:636-685](../../lib/split/Split.vue#L636-L685), teardown — [Split.vue:182-189](../../lib/split/Split.vue#L182-L189)); `stopResizePanel` идемпотентен (`if (!isStartResize.value) return` — двойной вызов separator+window при release внутри не дублирует `emit`/`persistSizes`); `$event?.pointerId` → `!= null` (pointerId 0 валиден для touch/pen). +3 теста (`Split.test.ts` 38 → 41, describe «drag teardown on pointerup outside the component»); typecheck + Split suite + eslint + prettier зелёные; browser-verified в sandbox (window `pointerup`/`pointercancel` вне separator гасит overlay, `bodyCursor:auto`, нет повторного `stop-resize-panel`). Docs: [components/split.md](../components/split.md) (§3 Resize + troubleshooting), issues/split.md follow-up к Issue 1. Severity matrix **не меняется** (regression найден+закрыт в одной сессии; Split row 0/0/0/0): TOTAL 2/47/41/29 = 119 без изменений. Ранее 2026-06-14 — fixwindow: **отказ от сторонних библиотек позиционирования** (по запросу пользователя; цель проекта — минимум рантайм-зависимостей). `@floating-ui/vue` (`useFloating`/`offset`/`flip`/`shift`/`autoUpdate`) + `@vueuse/core` (`onClickOutside`) — **оба единственный консьюмер — FixWindow** — ЗАМЕНЕНЫ собственными dependency-free композаблами. NEW [useFloating.ts](../../lib/fixwindow/useFloating.ts): чистое ядро `computePosition(rects, {placement,strategy,offset,padding,rtl,boundary,offsetParent})` (placement 12+`center→top` → offset=`translatePx` → flip least-overflow → shift clamp → вычитание `offsetParent` для absolute) — DOM/Vue-free, тестируется детерминированно **без моков**; + реактивная обёртка (rects через `getBoundingClientRect`, RTL `getComputedStyle().direction`, boundary `innerWidth/Height` (fixed)/scroll-контейнер (absolute), autoUpdate = scroll-parents+resize+`ResizeObserver` пока `open`, teardown `onScopeDispose`). NEW [useClickOutside.ts](../../lib/fixwindow/useClickOutside.ts): Teleport-aware (`composedPath`) close-on-outside, слушает `eventClose`-событие (`events:[eventClose]`) — устранило discrepancy с консьюмерами (Select default `eventClose:"hover"`). SFC изменён минимально (форма `{x,y,placement,strategy,update}` совместима; `offset: translatePx`, `padding: paddingWindow`, `scrollableEl`, `open: isOpen`). Полный паритет flip/shift/autoUpdate/RTL/byCursor/absolute (Table cell-редакторы). **Поглощена** offset/marginPx-регрессия этой сессии (двойной зазор `2×marginPx` + dead-zone hover-bridge): offset=`translatePx` встроен в движок ([FixWindow.vue:212](../../lib/fixwindow/FixWindow.vue#L212)), `marginPx` — только прозрачный `border` ([FixWindow.vue:104](../../lib/fixwindow/FixWindow.vue#L104)) → окно вплотную к триггеру. Deps удалены из `lib/package.json` + root `package.json` + `pnpm-lock.yaml`; контракт-тест [package.test.ts](../../lib/package.test.ts) **инвертирован** (deps НЕ содержат `@floating-ui`/`@vueuse`). +46 NEW тестов (useFloating 39 [ядро 33 + обёртка 6] + useClickOutside 7); FixWindow/Select переписаны на детерминированный движок (удалён хрупкий `vi.mock("@floating-ui/vue")` + offset-spy). `pnpm typecheck` + вся сюита (5084) + `pnpm lib:build` (**0×** `@floating-ui`/`@vueuse` в `dist/`) зелёные; browser-verified в sandbox (окно вплотную gap 0.4px + auto-flip вверх у нижнего края viewport). eslint flat-config globals: +`Window`/`EventTarget`/`EventListenerOptions`. Docs: [02-installation.md](../02-installation.md) (deps-таблица + bare-import note), [components/fix-window.md](../components/fix-window.md) (positioning-flow + click-outside), done/fixwindow.md Issue 2/3 Migration follow-up, menu/table component+issues docs. Severity matrix **не меняется** (паритет поведения, не закрытие issue; offset-регрессия найдена+закрыта в одной сессии): TOTAL 2/47/41/29 = 119 без изменений. commit: `refactor(fixwindow): replace @floating-ui/vue + @vueuse/core with dependency-free engine`. Ранее 2026-06-14 — inputlayout/label: закрыт **InputLayout Issue 9** (low, visual/motion) — floating-label `[data-label]` на mount «переезжал» из нижнего-левого угла в финальную точку. Причина: `classBase` дочернего Label нёс негейтнутый `motion-safe:transition-all` (свой transition InputLayout гейтит через `isTick`, у Label гейта не было) → на mount смена позиции (инжект стилей в `onMounted` + устаканивание `beforeWidth`/`labelType`) анимировалась один кадр. Fix: NEW опциональный prop `Label.animate?: boolean` (default `true` — standalone Label не изменился) гейтит transition в `classBase`; InputLayout передаёт `:animate="isTick"` ([InputLayout.vue:338](../../lib/inputlayout/InputLayout.vue#L338), [Label.vue:40](../../lib/label/Label.vue#L40)) — на первом кадре false (лейбл сразу в нужной позиции), после mount-tick true (focus / value-float анимируется как раньше). E29.7 сохранён (transition остаётся motion-safe). +3 теста (Label ×2: default keeps transition / `animate:false` drops it; InputLayout ×1 fake-timer gate); class-order в `classBase` сохранён через split → exact-string Label-тесты не тронуты; typecheck + Label/InputLayout suites зелёные (79). Docs: [components/label.md](../components/label.md) (новый prop), issues/inputlayout.md Issue 9. Severity matrix **не меняется** (Issue найден и закрыт в одной сессии → open-counts не затрагивает): InputLayout row 0/0/0/0, TOTAL 2/47/41/29 = 119 без изменений. Dev-server gotcha: после правки типа в `Label.d.ts` Vite не перекомпилировал SFC с `defineProps<LabelProps>` (кэш type-резолва) → для browser-верификации потребовался рестарт preview. Ранее 2026-06-13 — input: закрыт **Issue 14** (low, visual/motion) — на `input[data-input]` один кадр мелькала граница/outline и при фокусе, и при mount/перезагрузке. Причина: широкий `motion-safe:transition-all` на инпуте анимировал geometry/outline (обёртка InputLayout гейтит свой transition через `isTick`+`setTimeout 100ms` — [InputLayout.vue:67-73](../../lib/inputlayout/InputLayout.vue#L67-L73), у инпута гейта не было): на mount стили инжектятся в `onMounted` → переход из UA-дефолта; на фокусе `outline-width` → `focus:outline-0`. Fix: широкий `transition-all` → узкий `motion-safe:transition-colors` ([Input.vue:89](../../lib/input/Input.vue#L89)) — `transition-colors` не покрывает `outline`/geometry → анимировать на mount/фокусе нечего; `outline` возвращён к `focus:outline-0`; переход остаётся motion-safe (**E29.7 сохранён**). Пересмотрен acceptance **Issue 9** (тест `Issue 9 — motion-safe transitions` теперь требует `motion-safe:transition-colors` и запрещает `transition-all`; netто −1 тест, `Input.test.ts` 44 → 43). Browser-verified (`transitionProperty` = color-список, не `all`); typecheck + Input suite зелёные. Severity matrix **не меняется** (Issue найден и закрыт в одной сессии → open-counts не затрагивает): Input row 0/0/0/0, TOTAL 2/47/41/29 = 119 без изменений; input.md остаётся active. Ранее 2026-06-13 — virtualscroller: НОВЫЙ dependency-free компонент **VirtualScroller** + headless composable `useVirtualScroll` ([lib/virtualscroller/](../../lib/virtualscroller/useVirtualScroll.ts)) — windowing (variable-height prefix-sum + binary search, grid `orientation:"both"`, `lazy`/`appendOnly`) + enhanced-native **macOS-скроллбар** (два режима `macos`/`thin`, raw-CSS через `useStyle()`, precedent baseStyle.ts). Полная регистрация: `ComponentsOptions` + barrel + rollup (3 спота) + Nuxt `FISHT_VUE_COMPONENTS` + locale `virtualScroller.loading` (en/ru). +43 теста (useVirtualScroll 20 + VirtualScroller 23); `pnpm typecheck` + whole suite зелёные (5032). Docs: NEW [components/virtualscroller.md](../components/virtualscroller.md) (Шаблон A, stable). **Select Issue 7** (виртуализация >500) переведён ⏸️ deferred → 🔓 **unblocked (integration pending)**: блокер (runtime-dep вопреки no-deps) снят примитивом; осталась интеграция в Select отдельным ТЗ. Severity matrix **не меняется** (Issue 7 — реклассификация, не closure; остаётся открытым high): Select row 0/1/0/1, TOTAL 2/47/41/29 = 119 без изменений. Ранее 2026-06-13 — inputlayout: закрыты последние 2 issue (matrix InputLayout 0/4/0/3 → **0/0/0/0**). **Issue 4** (A2/A4-5/C17 — packaging/SSR + L53 unstyled) — inherited cross-cutting (root `"sideEffects": false` ✅2026-06-07 + `buildRootExports()` ✅2026-06-11 + SSR `Component.__hooks()`), правок исходника нет; L53 — guard `Component.setStyle()` (`config.unstyled → ""`, [component/index.ts:138](../../lib/component/index.ts#L138), landed 2026-05-11), добавлен regression-тест (`describe("Configuration support — unstyled (L53)")`, `afterEach` чистит `window.FishtVue` singleton-leak). **Issue 8** (E29.7/N59/B10, canon-safe **без правок theme-движка**, зеркало Switch/Badge) — E29.7 motion-safe: root `animation` → `motion-safe:transition-all motion-safe:duration-550`, оба `<transition>`-блока + hover-иконки (help/invalid/clear/copy) → `motion-safe:*` (inline-классы шаблона движок не регистрирует → их `motion-safe:`-варианты зарегистрированы явно module-scope `InputLayout.setStyle`); N59 print style-for-print (`print:border print:border-black print:bg-white print:text-black print:shadow-none` на `classBody`); B10 `forced-colors:outline` на `classBase` (high-contrast видимость поля), структурные нейтрали `gray-*`/`neutral-*`/`stone-*` → Wave 9. +6 тестов (`InputLayout.test.ts` → 47 кейсов); typecheck + whole suite зелёные (4989). Severity matrix InputLayout row 0/4/0/3 → 0/0/0/0. TOTAL 2/51/41/32 = 126 → 2/47/41/29 = 119. Wave 10.1 motion-safe +InputLayout; Wave 10.2 print +InputLayout. inputlayout.md **остаётся active** как трекер Wave 9 (semantic-token `neutral-*`). Ранее 2026-06-13 — badge: закрыты последние 6 issue (matrix Badge 0/3/0/3 → **0/0/0/0**). **Issue 1** (A2/A4-5 — packaging) — doc-sync: корневой `"sideEffects": false` (✅2026-06-07) + `buildRootExports()` (✅2026-06-11) покрывают `fishtvue/badge` strict-superset'ом, per-component правок нет. **Issue 3** (L53 — unstyled) — cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) landed 2026-05-11, исходник не тронут, добавлен Badge-scoped regression-тест (`describe("Configuration support — unstyled")`, `afterEach` чистит `window.FishtVue` singleton-leak). **Issue 6** (E29.7/F31/B10) — F31: физические `pl-1`/`pr-1` → логические `ps-1`/`pe-1` (`padding-inline-*`, авто-флип RTL; аудит ошибочно считал, что Badge не имеет left/right-классов); B10: `forced-colors:outline` на базовый класс (high-contrast видимость, зеркало Switch/Split/Pagination; `theme-*` уже preset-aware; структурные `neutral-*` outline-contrast Issue 4 → Wave 9); E29.7 N/A (нет собственных transitions, close-Button уже motion-safe). +7 тестов (`Badge.test.ts` 21 → 28); typecheck + whole suite зелёные (4983). Severity matrix Badge row 0/3/0/3 → 0/0/0/0. TOTAL 2/54/41/35 = 132 → 2/51/41/32 = 126. Wave 8.1 RTL +Badge; badge.md **остаётся active** как трекер Wave 9 (semantic-token `neutral-*`). Ранее 2026-06-13 — select: закрыты Issue 3 (P/dual-API), Issue 9 (F31/RTL), Issue 4 (C17/A2/A4-5 — inherited); Issue 7 (H43/virtualization) + B10 → **deferred roadmap**. **Issue 3** (compound `<Select><SelectOption>`/`<SelectGroup>`) — VNode-walk `slots.default()` в computed `compoundParsed` (канон, НЕ provide/inject; зеркало Form/Table): NEW renderless `SelectOption.vue` (`value`/`label?`/`disabled?`) + `SelectGroup.vue` (`label`/`title?`); `sourceData` подменяет `props.dataSelect` в `keySelect`/`valueSelect`/`dataSelect` пайплайне, **schema выигрывает** (`schemaActive`); `renderRows` вставляет non-selectable group-headers (`[data-select-group]`/`role=presentation`), keyboard-nav таргетит `li[data-select-list-item]`; `disabled` → `aria-disabled` + guard в `select()`. NEW `lib/select/index.ts` (rollup entry → `select.mjs` named-экспорты) + `addEntry("select","index.ts","select")` + skip-guard + Nuxt `FISHT_VUE_SUBCOMPONENTS`. Naming: value-`SelectOption` сосуществует с options-типом `SelectOption` (разные namespace TS, companion pattern; eslint-disable no-redeclare). Build-verified: `dist/select/select.mjs` отдаёт `default`/`SelectOption`/`SelectGroup`. **Issue 9** (RTL) — физические `left-0`/`pl-8 pr-4`/`pl-2`/`mr-1`/`ml-[..]` → логические `start-0`/`ps-8 pe-4`/`ps-2`/`me-1`/`ms-[..]` + `rtl:text-right` (movok `unoRules.ts` margin/padding axis `s`/`e` + arbitrary). **Issue 4** — inherited (SSR `Component.__hooks()`, `sideEffects:false` build-inject, `buildRootExports()`), кода Select не требует. **Issue 7** + **B10** — deferred (runtime-deps vs no-deps цель; semantic-токенов в `lib/theme/` НЕ существует → нужен lib-wide Wave 9). +13 тестов (`Select.test.ts`); typecheck + whole suite зелёные (4976). Severity matrix Select row 0/4/2/2 → 0/1/0/1. TOTAL 2/57/43/36 = 138 → 2/54/41/35 = 132. select.md **остаётся active** как трекер Issue 7 (virtualization) + B10 (Wave 9). Ранее 2026-06-13 — switch: закрыты последние 5 issue (matrix Switch 0/2/0/3 → **0/0/0/0**). **Issue 5** (A2/A4-5) — doc-sync: наследует cross-cutting Wave 2.1 (root `sideEffects:false` ✅2026-06-07, `buildRootExports()` ✅2026-06-11), per-component правок нет. **Issue 7** (E29.7) — motion-safe: root `classBaseSwitch` + switch-track + checkbox-track + thumb `transition*`/`duration-*` → `motion-safe:`-варианты; inline `<Icons>`-thumb (ветка `iconActive/iconInactive`) вынесен в NEW computed `classSwitchIconImg` через `Switch.setStyle` (inline-классы не регистрируются движком → их `motion-safe:`-варианты не попали бы в CSS; зеркало [table.md Issue 12](./table.md)). **Issue 10** (L53) — unstyled: cross-cutting `Component.setStyle` guard (landed 2026-05-11), правок исходника нет, добавлен Switch-scoped regression-тест (`afterEach` чистит `window.FishtVue`). **Issue 12** (B10, canon-safe **без правок theme-движка**, зеркало Split/Pagination/Table) — NEW `forced-colors:outline` на switch-track (видим в Windows high-contrast, on/off по позиции thumb) + accents уже preset-aware `theme-*`; структурные нейтрали (`gray-*`/`stone-*`) → Wave 9. **Issue 14** (N59) — print style-for-print (`print:border print:border-black print:bg-white print:text-black print:shadow-none` на обе ветки `classBaseSwitch`). +9 тестов (`Switch.test.ts` 30 → 39; coverage 96.36%); typecheck + whole suite зелёные. Severity matrix Switch row 0/2/0/3 → 0/0/0/0. TOTAL 2/59/43/39 = 143 → 2/57/43/36 = 138. Wave 10.1 motion-safe 8/22 → 9/22 (Switch); Wave 10.2 print +Switch; Wave 8.1 RTL +Switch (partial — `end-0`/`me-2`, thumb `translate-x` оставлен). switch.md **остаётся active** как трекер Wave 9 (полная semantic-token миграция). Ранее 2026-06-13 — input: закрыты последние 2 issue (matrix Input 0/2/0/0 → **0/0/0/0**). **Issue 3** (A2/A4-5 — packaging) — doc-sync: фиксы уже в каноне (root `"sideEffects": false` ✅ 2026-06-07, корневая `exports` map через `buildRootExports()` ✅ 2026-06-11, `engines.node >=18`), Input наследует Wave 2.1 strict-superset, per-component правок нет; формулировка устаревшего предложения `["**/*.css","**/*.vue"]` уточнена до `false` (нет `.vue`/`.css` в опубликованном пакете — обоснование button.md Issue 8). **Issue 4** (L53 — `unstyled`) — cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) landed 2026-05-11 во всех 22 компонентах; добавлен Input-scoped regression-тест (`Input.test.ts` 41 → 43 теста, describe `Issue 4 — unstyled`: `classBaseInput === ""` при `unstyled:true` + контраст `caret-theme-500` при `false`; `resetGlobalFishtVue()` чистит `window.FishtVue` singleton-leak). Правок исходников Input.vue/Input.d.ts не потребовалось. Файл input.md **остаётся active** (зеркало Pagination/Form/Split: deferred cross-cutting — runtime theme switch Wave 3.3, locale auto-binding phoneFormats). Severity matrix Input row 0/2/0/0 → 0/0/0/0. TOTAL 2/61/43/39 = 145 → 2/59/43/39 = 143. Whole suite 4953 → 4955 green; typecheck зелёный. Ранее 2026-06-13 — split: закрыты последние 4 issue (matrix Split 0/1/2/1 → **0/0/0/0**). **A4-5** — inherited root `exports` map (Wave 2.1, ✅ 2026-06-11): `fishtvue/split` входит в `buildRootExports()` strict-superset, per-component задачи нет (doc-sync). **F31** (RTL) — NEW `isRtlHorizontal()` (`getComputedStyle(resizableGroup).direction === "rtl"`, client-only, зеркало [table.md Issue 11](./table.md)) флипает pointer-`addedDistance` (считается от **левого** края панели: `panel.x - clientX`) и keyboard-стрелки (`ArrowLeft` растит ведущую панель в RTL); у Split нет физических `left/right`/`pl/pr`/`ml/mr` offset'ов (центрирование `left-1/2 -translate-x-1/2` симметрично) → логические-классы не понадобились. **G34** — корневой `<div data-split>` уже экспонировался как `resizableGroup`; добавлен `focus()` (→ первый `[data-split-separator]`), типизирован в `SplitExpose` (зеркало Button/Pagination `focus()` / Form `formElement`). **B10** (canon-safe, **без правок theme-движка**) — `forced-colors:outline` на базовом классе разделителя (видим в Windows high-contrast; зеркало Table/Pagination) + грип-акцент `bg-neutral-300 dark:bg-neutral-600` / `text-gray-500` → preset-aware `bg-theme-300 dark:bg-theme-700` / `text-theme-500` (`theme` = единственный динамический цвет через `var(--theme)`); структурная 1px-линия осталась нейтральной. Полная shadcn-style semantic-token миграция (`bg-surface`/`border-border` — extension движка + runtime `usePreset`) остаётся cross-cutting [theme.md Issue 1](./theme.md) / Wave 9 → split.md **остаётся active**, как pagination/form/table. +6 тестов (`Split.test.ts` 32 → 38; whole suite 4947 → 4953 green); typecheck зелёный; theme-движок не тронут (3175 uno-кейсов зелёные). Severity matrix Split row 0/1/2/1 → 0/0/0/0. TOTAL 2/62/45/40 = 149 → 2/61/43/39 = 145. Wave 8.1 RTL +Split; Wave 10.3 expose +Split. Ранее 2026-06-13 — form: закрыты ВСЕ numbered issues (2,3,4,5,7,9) + matrix-категория G34. **Issue 2** (P/dual-API) — compound `<Form><FormSection><FormField>` через **VNode-walk `slots.default()`** (канон, НЕ provide/inject; зеркало Table/Menu): NEW renderless `FormField.vue`/`FormSection.vue`, `compoundParsed` walk + `RenderFieldSlot`, schema `:structure` выигрывает (backward compat), `FormProps.structure` стал optional; регистрация через NEW `lib/form/index.ts` (rollup entry → `form.mjs`) + skip-guard + `addEntry("form","index.ts","form")` + Nuxt `FISHT_VUE_SUBCOMPONENTS` + root barrel. **Issue 3** (D21) — NEW `lib/form/fieldRegistry.ts` (`registerFieldType`/`getFieldType`/`hasFieldType`), `FieldComponentType` → open union `| (string & {})`, `FieldType<T>` fallback `any`→`FieldRegistered`, `resolveFieldComponent` (builtin > registered > Custom-slot). **Issue 4** (M55) — props `action`/`method`/`enctype`/`nativeSubmit` + `onSubmit` (invalid→preventDefault; valid→emit; native-submit только при opt-in); FormData собирает Input-поля (Input уже несёт `:name=id`). **Issue 5** (A2/A4-5/C17/L53) — cross-cutting инфра уже была (наследуется), закрыт unstyled regression-тестом. **Issue 7** (F32) — Calendar self-localizes (calendar.md Issue 8 ✅); Form не блокирует. **Issue 9** (E29.7/F31/N59) — motion-safe transitions + logical `ms/me` + `print:border-black`; B10 (semantic tokens) → Wave 9 (deferred, файл остаётся active). **G34** — NEW `formElement` root-ref expose. +23 теста (`Form.test.ts`); typecheck + suite зелёные (4947). Severity matrix Form row 0/6/3/2 → 0/0/0/0. TOTAL 2/68/48/42 = 160 → 2/62/45/40 = 149. Wave 6.2 Form compound ✅. Ранее 2026-06-13 — icons/button (regression re-open, docs-only): re-opened **icons.md Issue 1** (I45) = **button.md Issue 7**. Build-замер (минимальный Vite-consumer + `sandbox:build`; heroicons 2.2.0, vite 7) показал: точечный dynamic import heroicons (commit `7740c50`) **не работает в prod-Vite** — плагин `dynamic-import-vars` не глобит bare-спецификатор `@heroicons/vue/...` (`dynamicImportToGlob → shouldIgnore → return null`, без warning) → 0 per-icon chunks, bare `import()` остаётся в main-chunk (2×), не резолвится в браузере без import map → иконки ломаются в production (видны только в `vite dev` / Vitest, где bare-спецификаторы резолвятся). Измерено (single `<Icons type="check" />`, gzip): namespace `import *` 94.0 KB (648 иконок inlined) → текущий 23.9 KB но **0 иконок** в bundle (битый bare-import; «экономия» иллюзорна). Код НЕ менялся (решение пользователя — только документирование regression); fix path: sync `const`-реестр named-импортов (tree-shakeable + SSR + prod) или `unplugin-icons`. Severity matrix Icons row 0/3/1/2 → 0/4/1/2, Button row 0/0/1/3 → 0/0/2/3. TOTAL 2/67/47/42 = 158 → 2/68/48/42 = 160. Ранее 2026-06-13 — pagination: закрыты ВСЕ numbered Issues 2–8 (matrix Pagination row 0/4/4/3 → 0/0/0/0). **Issue 2** (C17/A2/A4-5) — наследует cross-cutting SSR (`Component.__hooks()` конструктора → `onServerPrefetch + vueOnMounted`) + packaging (root `sideEffects`/`exports`); дополнительно снят **дубль** `Pagination.initStyle()` из `onMounted` (Pagination был пропущен в Wave 2.3 sweep). **Issue 3** (L53) — unstyled regression-тест к cross-cutting `Component.setStyle` guard. **Issue 4** (E29.1) — корневой `<div>` → `<nav role="navigation" :aria-label>` (единственный landmark; внутренний `<nav data-pagination-nav>` понижен до `<div>`), per-page `:aria-label="Page N"`, `aria-current` (был), NEW locale-ключи `pagination.label`/`pagination.page` (en+ru+TypesLocale). **Issue 5** (E29.5) — sr-only `aria-live="polite"` region «Page X of Y». **Issue 6** (F31) — RTL: directional иконки `rtl:-scale-x-100` + физический `ml-3` → logical `ms-3` (порядок prev/next зеркалит `inline-flex` нативно, без `flex-row-reverse`). **Issue 7** (G34) — expose `paginationRef` + `focus()` (зеркало Button). **Issue 8** (N59/B10) — print (`print:*` style-for-print) + forced-colors (`forced-colors:outline` на active page); E29.7 motion N/A (нет собственных transitions). +12 тестов (`Pagination.test.ts`). Severity matrix Pagination row 0/4/4/3 → 0/0/0/0. TOTAL 2/71/51/45 = 169 → 2/67/47/42 = 158. Wave 2.3 13/22 → 14/22 (Pagination); Wave 8.1 RTL +Pagination; Wave 10.2 print +Pagination. Файл остаётся active — cross-cutting theme-token hardcode (Wave 9). Ранее 2026-06-12 — theme/button: закрыт **B11** (`darkModeSelector`) = **theme.md Issue 5** (high) + **button.md Issue 16** (low, deferred). Аудит считал опцию неподдержанной (❌), но движок её **уже** транслировал (landed `d120e4e`, Jan 2025): `Component.setStyle` прокидывает `darkSelector: this.__globalOptionsTheme?.darkModeSelector ?? ""` ([component/index.ts:150](../../lib/component/index.ts#L150)) → `tailwind()` подменяет дефолтный `@media (prefers-color-scheme: dark)` ([unoStatic.ts:561](../../lib/theme/unoStyle/unoStatic.ts#L561)) на config-селектор, когда он непустой ([unoStyle/tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95)). `architecture/theme.md` уже документировал фичу как рабочую — внутреннее противоречие доков, теперь устранено. **Правок движка не потребовалось** (канон [dev-patterns.md](../dev-patterns.md): «движок `tailwind()` уже знает media/variant-фичи; не патчим theme-движок») — закрыто regression-тестами: NEW [darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) (plugin-config через уникально-именованный probe-компонент — обходит cross-file дедуп module-private `listOfStyledComponents`/`listOfCssComponents`, ключ дедупа без селектора) + 4 engine-кейса в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts) (`describe("Dark mode selector …")`: `[data-theme='dark']`/`html.dark`/`.dark` + fallback). `lightModeSelector` (типизирован, но не транслируется) помечен ❌ в cross-cutting-таблице theme.md — вне B11. Severity matrix Button row 0/0/1/4 → 0/0/1/3, Theme row 0/6/4/2 → 0/5/4/2. TOTAL 2/72/51/46 = 171 → 2/71/51/45 = 169. Wave 3.4 darkModeSelector ✅. Ранее 2026-06-12 — button/icons: закрыт **Issue 7** (I45 — heroicons bundle) = **icons.md Issue 1**. Namespace-импорты `@heroicons/vue/24/{outline,solid}` → точечный `import(`…/${Name}.js`)` + Iconify-fallback (статический префикс на ветку — иначе Vite не глобит «Missing specifier»). **Trade-off:** heroicon резолвится async → нет в SSR-HTML; +8 cross-component тестов (Menu/Input/InputLayout) адаптированы под async-резолв. Bundle-замер не прогонялся (`unplugin-icons` рекомендован для гарантии tree-shaking+SSR). Severity matrix Button row 0/0/2/4 → 0/0/1/4, Icons row 0/4/1/2 → 0/3/1/2. TOTAL 2/73/52/46 = 173 → 2/72/51/46 = 171. Ранее 2026-06-12 — button: закрыт **Issue 5** (G36 — polymorphic `as`): prop `as?: string | Component` (default `"button"`) + корень `<component :is="asTag">` (`<a>`/`<NuxtLink>`; авто `role`/`tabindex`/`aria-disabled` для не-button/не-`<a>`; native `type` только на `<button>`); `buttonRef` → `HTMLElement`. `defineAsyncComponent`-дети (Issue 6) перенесены в module-scope `<script>` (под dynamic root per-instance не резолвились), тесты ждут резолва через macrotask-helper. +9 тестов (`Button.test.ts` 43 → 52). Severity matrix Button row 0/0/3/4 → 0/0/2/4. TOTAL 2/74/52/46 = 174 → 2/73/52/46 = 173. Ранее 2026-06-12 — button: закрыт **Issue 6** (I44 — bundle): `Loading`/`FixWindow` → `defineAsyncComponent` (async-chunks; текстовая кнопка их не тянет); тесты адаптированы под async-резолв (`flushPromises`). Severity matrix Button row 0/0/4/4 → 0/0/3/4. TOTAL 2/75/52/46 = 175 → 2/74/52/46 = 174. Ранее 2026-06-12 — button: закрыт **Issue 15** (N59 — print): `baseClasses` получил `print:border print:bg-white print:text-black print:shadow-none` (style-for-print, канон Input/Loading/Table; `printable`-prop не вводился); +1 тест (`Button.test.ts` 42 → 43). Severity matrix Button row 0/0/5/4 → 0/0/4/4. TOTAL 2/76/52/46 = 176 → 2/75/52/46 = 175. Ранее 2026-06-12 — button: закрыт **Issue 13** (L53 — global `componentsStyle`): добавлен computed `componentsStyleMode` (`filled→primary`/`outlined→outline`/`underlined→ghost`) в fallback chain `mode` (зеркало Badge/Input/Select/Calendar); +6 тестов (`Button.test.ts` 36 → 42). Severity matrix Button row 0/1/5/4 → 0/0/5/4. TOTAL 2/77/52/46 = 177 → 2/76/52/46 = 176. Ранее 2026-06-12 — button: закрыт **Issue 14** (L53 — `unstyled`). Cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`) landed 2026-05-11 во всех 22 компонентах; добавлен Button-scoped regression-тест (`Button.test.ts` 34 → 36 тестов, describe `Configuration support`; `afterEach` чистит `window.FishtVue` singleton-leak). Severity matrix Button row 0/2/5/4 → 0/1/5/4. TOTAL 2/78/52/46 = 178 → 2/77/52/46 = 177. Ранее 2026-06-12 — button (doc-sync, без правок кода): `button.md` приведён к live-roadmap. **Issue 9** (A4/A5) помечен ✅ resolved — root `exports` map (`buildRootExports()`, 5c-b) уже landed 2026-06-11, текст был «partial». **Issue 3** (F31 — logical `iconPosition` start/end) уже закрыт 2026-06-07, но не вычтен из матрицы. **Issue 16** (B11 — `darkModeSelector`) аннотирован **deferred** (делегирован [theme.md Issue 5](./theme.md), Wave 3.4). Severity matrix Button row 0/4/6/4 → 0/2/5/4 (вычтены A4/A5/F31 из счёта). TOTAL 2/80/53/46 = 181 → 2/78/52/46 = 178. Ранее 2026-06-11 — packaging: закрыт **Issue 5c** (root `exports` map — A4-5, high; последний high-severity Table) + пререкизит **5c-a** (Menu publish-gap). **5c-a (`fix(menu)`):** `dist/index.mjs` ре-экспортил MenuItem/MenuGroup из raw `MenuItem.vue`/`MenuGroup.vue`, которых нет в `files`-whitelist → `import { MenuItem } from "fishtvue"` ломался в опубликованном пакете. Зеркало Table (Issue 3): новый `lib/menu/index.ts` (default Menu + named MenuItem/MenuGroup), rollup собирает menu из `index.ts`, `lib/index.ts` убирает `.vue`-импорты. **5c-b (`build(packaging)`):** корневая `exports`-карта генерируется build-step'ом ([`buildRootExports()`](../../lib/rollup.config.js)) из авторитетных rollup-выходов + вложенных package.json/.d.ts — ЯВНЫЕ entry на каждый `.mjs` (identity `*.mjs` + extensionless) + bare-dir из вложенного package.json + `./*/package.json`; ноль wildcard-неоднозначности, strict superset, обходит lowercase-`.mjs`/PascalCase-`.d.ts` обструкцию (`./table` → import `table.mjs`, types `Table.d.ts`). Мотивация (smoke-доказана): БЕЗ карты пакет резолвится только в бандлерах — в pure Node ESM `fishtvue/menu`/`fishtvue/config`/`fishtvue/utils/domHandler` падали «directory import not supported». **Verified:** `npm pack` → install → `import.meta.resolve` 19/19 субпутей OK; CSS-free субпуты исполняются (self-ref через карту); `tsc --moduleResolution bundler` И `nodenext` exit 0. +3 контракт-теста ([package.test.ts](../../lib/package.test.ts), guarded по `dist/`). Severity matrix Table row 0/1/1/1 → 0/0/1/1 (закрыт A4-5 — последний high). TOTAL 2/81/53/46 = 182 → 2/80/53/46 = 181. Wave 2.1 root `exports` ✅. Все аудит-issue Table 1–14 закрыты (остаются cross-cutting G34/D26). Ранее 2026-06-11 — table: закрыт **Issue 10** (Floating UI для filter/edit popovers — H39, medium). Без новых зависимостей: FixWindow уже обёртка над `@floating-ui/vue` ([FixWindow.vue](../../lib/fixwindow/FixWindow.vue#L5)), cell-**редакторы** Select/Calendar уже плавали с `paramsFixWindow.scrollableEl: tableBody`. Gap был у **filter**-Select/Calendar (спредили `column.paramsFilter` без `scrollableEl`) → их dropdown не трекал скролл. Fix: filter-`<Select>`/`<Calendar>` мёржат `paramsFixWindow: { scrollableEl: tableBody, ...(column.paramsFilter?.paramsFixWindow) }` (зеркало редакторов); per-column override (`position`/`teleport`) выигрывает; teleport остаётся opt-in (как у редакторов). +3 теста (`Table.test.ts` 119 → 122; suite зелёный). Severity matrix Table row 0/1/2/1 → 0/1/1/1 (закрыт H39). TOTAL 2/81/54/46 = 183 → 2/81/53/46 = 182. Wave 5 Floating UI: Table filter/editor ✅. Ранее 2026-06-11 — table: закрыт **Issue 11** (RTL — F31, medium). Без новых зависимостей — движок уже понимает `rtl:`/`ltr:` (`specialStates`) + логические `start`/`end`/`pe`/`ps` (`inset-inline-*`/`padding-inline-*`, [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts#L1550)): resize-handle `pr-2`→`pe-2` (авто-флип) + inset `-right-3`/`right-3` физический default + `rtl:`-override (negative-логический inset движок не поддерживает); [`resizeColumn`](../../lib/table/Table.vue) детектит `getComputedStyle(columnEl).direction === "rtl"` → ширина от правого края (`rect.right - pageX`) в RTL / от левого в LTR; group-label `left-*`→`start-*`, `pr-3 pl-*`→`pe-3 ps-*`. Scroll-shadow в Table нет (`overflow-x-auto` уважает dir нативно). +4 теста (`Table.test.ts` 115 → 119; suite зелёный). Severity matrix Table row 0/1/3/1 → 0/1/2/1 (закрыт F31). TOTAL 2/81/55/46 = 184 → 2/81/54/46 = 183. Wave 8.1 RTL +Table. Ранее 2026-06-11 — table: закрыт **Issue 12** (prefers-reduced-motion + print + forced-colors, low E29.7/N59/B10). Применён канон FishtVue **motion-safe** (как Button/Menu/Select — БЕЗ правок theme-движка: `unoStatic.ts` media уже содержит `motion-safe`/`print`/`forced-colors`): все `transition`/`transition-opacity`/`transition-colors` + `duration-*` в [Table.vue](../../lib/table/Table.vue) → `motion-safe:`-варианты (`animation`-токен `styles.animation`, `classIsSort`/`classResizedColumns`/`classTr` hover + 5 inline `<transition>`-обёрток clear-filter/loading/no-data/no-column/no-filter + search-Input; inline-классы шаблона не идут через computed → их `motion-safe:`-варианты зарегистрированы явно через `Table.setStyle`); `print:hidden` на loading-overlay (`classIsLoading`) + resize-handle (`classResizedColumns`); `forced-colors:outline` на active-row (`classTr`) — выделение видимо в high-contrast. +5 тестов (`Table.test.ts` 110 → 115; suite зелёный). Severity matrix Table row 0/1/3/4 → 0/1/3/1 (закрыты E29.7/N59/B10). TOTAL 2/81/55/49 = 187 → 2/81/55/46 = 184. Wave 10.1 motion-safe 7/22 → 8/22 (Table); Wave 10.2 print +Table. Ранее 2026-06-07 — table: закрыт **Issue 3** (флагман dual-API — compound `<Table><Column>` API). Механизм — **VNode-walk `slots.default()`** (канон, зеркало Menu, НЕ provide/inject; `TableContext.ts` не понадобился). Новые renderless `lib/table/Column.vue` + `ColumnGroup.vue`; `Table.vue` `compoundParsed` walk (Fragment-flatten, matching по имени) → `columns` computed fallback к compound (schema `:columns` ВЫИГРЫВАЕТ — backward compat); per-column `#cell`/`#header`/`#filter` scoped-slots через стабильный `RenderColumnSlot`; `<ColumnGroup>` multi-level headers (`<th colspan scope=colgroup>` ряд, `headerGroups` группирует видимые колонки по `_groupKey`); `<Pagination>`/`<Loading>`-дети override встроенных конфигов (явный `:pagination` бьёт child). Регистрация: `import { Column, ColumnGroup } from "fishtvue/table"` (named-экспорты в `table.mjs` — rollup entry изменён `Table.vue`→`index.ts`, бандлит compound-детей) + root barrel `export *` + Nuxt `FISHT_VUE_SUBCOMPONENTS` (addComponent с `export`) → глобальны в Nuxt как Table. Типы `ColumnProps`/`ColumnSlots`/`ColumnGroupProps`/`ColumnGroupSlots` + классы + `GlobalComponents` в Table.d.ts; `IColumnPrivate` расширен `_cellSlot`/`_headerSlot`/`_filterSlot`/`_groupKey`. +14 тестов (`Column.test.ts`; whole suite 4856 → 4870 green; backward-compat 110 Table-кейсов без регрессий). Build-verified: `dist/table/table.mjs` отдаёт named `Column`/`ColumnGroup`/`default`, 0 raw `.vue` в tarball. Severity matrix Table row 0/2/3/4 → 0/1/3/4 (закрыт P/dual-API). TOTAL 2/82/55/49 = 188 → 2/81/55/49 = 187. Wave 6.1 Table compound ✅ (сделано через VNode-walk, не provide/inject). Docs: components/table.md §10.5 Compound API; dev-patterns compound-pattern note. Ранее 2026-06-07 — packaging/SSR (Wave 2.1, cross-cutting, по запросу пользователя через Table Issues 5/13/14): закрыты **table Issue 13** (K51 — `files`-whitelist шлёт sourcemaps; `npm pack --dry-run` из `dist/`: 174 `.mjs` + 174 `.mjs.map` 1:1) + **14** (K52 — whitelist + `copyDependencies()` skip `*.test.*`; 0× junk в tarball, 427 файлов / 2.14 MB) + **5 partial** (SSR C17 ✅ + sideEffects A2 ✅; exports A4-5 отложен); **button Issue 1** (C17 — SSR-стили оказались уже реализованы через `Component.__hooks()` → `onServerPrefetch` + `cssComponents` Map без `isClient`-guard + Nuxt server plugin; текст аудита устарел; добавлен регресс-тест `lib/component/ssrStyles.test.ts`) + **8** (A2 — `"sideEffects": false` root + инъекция в каждый `dist/{name}/package.json` через `copyDependencies()`; выбран `false` т.к. CSS инжектится в рантайме, не на import) + **9 partial** (ESM-only ратифицирован `engines.node >=18`; root `exports` map отложен на build-verified заход — отключает folder-main nested-резолв + требует enumerate self-referential `.mjs`). +6 тестов (`ssrStyles.test.ts` ×2 + `package.test.ts` ×4; whole suite 4850 → 4856 green). Контракт манифеста зафиксирован `lib/package.test.ts`. Behavior не менялся (SSR уже работал) — tests + packaging-поля. Severity matrix: Button row 0/6/6/4 → 0/4/6/4 (−A2/−C17), Table row 0/5/3/4 → 0/2/3/4 (−A2/−C17/−K51). TOTAL 2/87/55/49 = 193 → 2/82/55/49 = 188. Wave 2.1: `files` ✅, root+per-component `sideEffects` ✅, ESM-only+engines ✅; остаётся root `exports` map + dep→peer миграции. Docs: 02-installation.md §2.5 packaging contract. Ранее 2026-06-07 — table: закрыт Issue 7 (branch coverage) — `Table.test.ts` 91 → 110 кейсов; branch `Table.vue` 67.74% → 80.01% (statements 92.57%). Покрыты edit-cell editors (Input/Select/Calendar open/save/cancel), setCell masks + setCellValue, isEqualsValue select/number/date, setSummary string/date/count/sum, loading-timeout, clearFilter, column.onClick, object-form configs + style-варианты. Tests-only, багов нет. Severity matrix Table row 0/6/3/4 → 0/5/3/4. TOTAL 2/88/55/49 = 194 → 2/87/55/49 = 193. Ранее 2026-06-07 — table: закрыт Issue 4 (virtualization) — dependency-free windowing (по решению пользователя, без новых deps): `virtual?: boolean | {rowHeight?,overscan?,threshold?}` prop + TableOption; `isVirtual`/`virtualWindow` рендерят окно `<tbody>` + spacer-`<tr>` (`[data-table-virtual-spacer-top/bottom]`), fixed rowHeight, passive scroll-listener на `[data-table-scroll]` (reuse tableBody viewport) + cleanup; auto по умолчанию (client flat, lengthData>threshold=100; off при grouping/pagination/asyncData:true|function) + opt-out `:virtual=false`; absolute index (`absIndex`) для click/edit/active; ARIA `aria-rowcount`/`aria-rowindex`. +7 тестов (whole suite 4831 green). Severity matrix Table row 0/7/3/4 → 0/6/3/4. TOTAL 2/89/55/49 = 195 → 2/88/55/49 = 194. Wave 7 Table virtualization ✅ (сделано dependency-free, без Wave 6.1). Ранее 2026-06-07 — table: закрыты Issue 1, 2, 6, 8, 9 (Critical + a11y bundle). Issue 1 (CRITICAL XSS) — все 5 v-html устранены: cell → `markerParts()` + `<mark>` через `<template v-for>` (escapeRegExp; `setMarker` оставлен для `valueWithMarker` payload), summary → text, noData/noColumn/noFilter → `#empty`/`#empty-columns`/`#empty-filter` slots (text default), кастомный HTML — через explicit slots + `#caption`. Issue 2 (CRITICAL leak) — `onUnmounted` disconnect `lastRowVisibleObserver` + remove window mousemove/mouseup. Issue 6 (L53 unstyled) — regression-тест к cross-cutting `setStyle` guard. Issue 8 (E29.1) — `<caption>` prop+slot (sr-only); `scope="col"` уже был. Issue 9 (E29.5) — sr-only `[data-table-aria-live]` polite + `table.resultsCount/One/None` (en+ru+TypesLocale, литеральный fallback). +19 тестов (whole suite 4824 green). Severity matrix Table row 2/8/5/4 → 0/7/3/4. TOTAL 4/90/57/49 = 200 → 2/89/55/49 = 195. Wave 1.1 XSS sites: Table ✅ (все 14/14 закрыты). Wave 1.2 Table ✅. Wave 4.2 Table caption ✅. Wave 4.4 Table announce ✅. Ранее 2026-06-07 — split (fix): регрессия `units="pixels"` — синхронный `updatePanels()` в setup (resizableGroup ещё undefined → `getDefaultSize` с `offsetWidth=0` давал отрицательный размер панели без явного `size`) убран; seed только на SSR + в `onMounted`; `aria-valuenow` с fallback `?? panel.size ?? 0`. +1 regression-тест (31 → 32), coverage 85.19% / 71.77% branch. Ранее 2026-06-06 — split: закрыты Issue 1 (CRITICAL global side-effect — `document.body.classList` cursor-мутация → локальный `data-split-drag-overlay` div + удалён `watch(activeCursorPanel)`), 2 (coverage 60→85.43% / 39→70.35% branch, 7→31 тест; geometry-зависимые ветви через mock `getBoundingClientRect`/`offsetWidth`/`ResizeObserver`), 3 partial (✅ dup initStyle снят Wave 2.3 13/22, ✅ per-component `sideEffects:false`, ✅ unstyled regression; ❌ root exports map A4-5 → Wave 2.1), 4 (✅ добавлены `aria-orientation` + `aria-controls` + panel `id` через `useId`; role/tabindex/aria-valuenow уже были; disabled-separator `aria-disabled`), 5 (keyboard resize: стрелки direction-aware + Shift + Home/End, перенос между смежными панелями), 6 (persistence была documentation lie — `localStorage` не существовал; реализована isClient-guarded save на resize end + restore на mount с клампом и валидацией), 8 (✅ N57 touch уже через Pointer Events — спека «только mouse» неверна; ✅ E29.7 motion-safe). Остаются cross-cutting: A4-5 (Wave 2.1), F31 RTL (Wave 8), G34, B10 colors (Wave 9) — файл остаётся active. Severity matrix Split row 0/5/5/3 → 0/1/2/1. TOTAL 4/94/60/51 = 209 → 4/90/57/49 = 200. Split поднят beta → stable. Wave 4.2 + 4.3 Split ✅. Wave 2.3 progress 12/22 → 13/22 (Split). Wave 10.1 motion-safe 6/22 → 7/22 (Split). Wave 2.1 per-component sideEffects +Split. Ранее 2026-06-06 — separator: закрыты Issue 2 (E29.1 — корень рендерит role="separator" + :aria-orientation, unconditional/без нового prop; slot-контент = accessible name; line-сегменты aria-hidden), Issue 1 частично (A2 — per-component "sideEffects": false; L53 unstyled — regression-тест к Component.setStyle guard; C17 dup initStyle уже снят Wave 2.3 + удалён dead onMounted import; A4-5 exports map → root Wave 2.1). Issue 4: motion E29.7 N/A (нет анимаций), colors B10 → Wave 9. +6 a11y/unstyled тестов (25 → 31). Severity matrix Separator row 0/3/2/2 → 0/2/1/1. TOTAL 4/95/61/52 = 212 → 4/94/60/51 = 209. Wave 4.2 Separator ✅. Wave 2.1 per-component sideEffects +Separator. Ранее 2026-06-06 — pagination: Issue 1 (CRITICAL anonymous ResizeObserver leak) закрыт — observers сохранены в массив `navigationObservers` + disconnect в `onBeforeUnmount`; regression-тесты `Pagination.test.ts`. Severity matrix Pagination row 1/4/4/3 → 0/4/4/3. TOTAL 5/95/61/52 = 213 → 4/95/61/52 = 212. Wave 1.2 Pagination ✅. Ранее 2026-06-06 — menu: закрыты Issue 1 (CRITICAL XSS — оба `v-html="item.info"` → `#item-info` scoped slot с text-fallback; последние XSS-сайты кроме Table), Issue 2 (compound API — NEW MenuItem.vue/MenuGroup.vue renderless descriptors + VNode-walk → setItems; `:groups` выигрывает; экспорт через root barrel), Issue 3 (keyboard navigation: стрелки по ориентации, Home/End, Enter/Space, typeahead, ArrowRight/Left submenu, roving tabindex, исправлен баг tabindex=-2), Issue 4 (ARIA: aria-orientation/haspopup/expanded + role="separator"), Issue 6 (submenu focus trap через FixWindow `:focus-trap="usingKeyboard"`), Issue 7 (i18n docs-рекомендация), Issue 8 (Floating UI — наследуется от done/FixWindow). Частично: Issue 5 (✅ dup initStyle/Wave 2.3 12/22, ✅ per-component sideEffects, ✅ unstyled; ❌ root exports map A4-5 → Wave 2.1), Issue 9 (✅ prefers-reduced-motion motion-safe; ❌ RTL → Wave 8.1, ❌ colors → Wave 9). Severity matrix Menu row 1/6/4/3 → 0/1/1/2 (остаются cross-cutting A4-5/G34/B10/F31; файл остаётся active). TOTAL 6/100/64/53 = 223 → 5/95/61/52 = 213. Wave 2.3 progress 11/22 → 12/22 (Menu). Wave 10.1 motion-safe 5/22 → 6/22 (Menu). Wave 1.1 XSS sites: Menu ✅ (остаётся Table ×5). Ранее 2026-06-03 — loading: закрыты Issue 1 (coverage loadingTypes 3% → 100%, +Loading.test.ts 145 кейсов), Issue 2 (lazy import — уже был; +sideEffects ["**/*.css","**/*.vue"]), Issue 3 (ARIA role="status"+aria-live+sr-only+локализованный aria-label через loading.label en/ru), Issue 4 (LoadingOption.type + resolvedType), Issue 5 частично (снят dup Loading.initStyle → Wave 2.3 10/22 → 11/22; sideEffects; unstyled уже cross-cutting; exports map A4-5 → root Wave 2.1), Issue 6 (prefers-reduced-motion static fallback в обёртке, без правок 126 файлов), Issue 8 (print:hidden). Открыто: Issue 7 (hardcoded HEX 20 epic + 2 svg → Wave 9). Severity matrix Loading row 0/5/4/3 → 0/1/0/1. TOTAL 6/104/68/55 = 233 → 6/100/64/53 = 223. Ранее 2026-06-03 — form: закрыты Issue 1 (CRITICAL XSS — удалён `#item` v-html override, Form переиспользует безопасный `#marker`/`markerParts` default Select), Issue 6 (validation messages локализованы через `setDefaultRuleMessages` + `applyLocaleToRules`, guarded `useFishtVue()`, runtime locale-switch через `watch(getActiveLocale)`), Issue 8 (branch coverage Form.vue 78.91% → 80.6%, +8 тестов). Bonus: снят dup `Form.initStyle()` (Wave 2.3 → 10/22). Severity matrix Form row 1/6/4/3 → 0/6/3/2. TOTAL 7/104/69/56 = 236 → 6/104/68/55 = 233. Wave 1.1 XSS sites: Form ✅ (остаются Table ×5, Menu ×2). Раньше 2026-05-20 — config: закрыты все 6 audit issues (FishtVueSymbol стабилизирован как const InjectionKey<FishtVue>, baseStyle покрыт тестами через cssComponents Map assertion, Component.t() с fallback chain active→default→key и сужением сигнатуры до `string`, extensibility API `use`/`registerComponent`/`extendTheme` добавлен, 2 skipped теста разблокированы + getDefaultOptions per-theme coverage). Severity matrix Config row 1/5/4/2 → 0/0/0/0 = 12 issues resolved. Component class Issue 2 (window.FishtVue coupling) ✅ resolved через config Issue 1 inject-first path; component-class row 0/3/3/2 → 0/2/3/2. Файл config.md перенесён в ./done/. TOTAL 8/110/70/58 = 246 → 7/104/69/56 = 236. Wave 1.3 architecture blocker (FishtVueSymbol stabilization) ✅. Раньше 2026-05-16 — fixwindow: закрыты все 10 issues (Teleport через @floating-ui/vue + опциональный Teleport prop, native focus trap mirror Dialog, focus return через triggerEl, dynamic ARIA role, RTL via logical placement, motion-safe transitions, touchstart fallback, sideEffects: false, удалён duplicate FixWindow.initStyle()). Coverage 77.27%/65.36% → 88.44%/83.77%. Файл перенесён в ./done/fixwindow.md. Severity matrix FixWindow row 0/7/5/3 → 0/0/0/0. TOTAL 8/117/75/61 = 261 → 8/110/70/58 = 246. Wave 2.3 progress 8/22 → 9/22 (FixWindow). Wave 2.1 per-component sideEffects progress 1/22 → 2/22 (Dialog + FixWindow). Раньше 2026-05-16 — component-class: закрыты Issue 1 (Wave 2.3 — dup initStyle sweep по 6 SFC × 7 occurrences: Button:369, Icons:70, InputLayout:197+229, Menu:235, Separator:128, Table:937) и Issue 5 partial (Component.test.ts расширен 4 it-блоками: SSR-coverage, idempotence, window.FishtVue fallback, graceful no-config; HMR test переехал в Issue 3; pre-existing flaky test getOptions — out of scope). Severity matrix Component class row 0/4/3/2 → 0/3/3/2. TOTAL 8/118/75/61 = 262 → 8/117/75/61 = 261. После sweep'а: 13/21 core SFC с comment-marker'ом канона + 8/21 не используют initStyle = 21/21 чистых. Раньше 2026-05-12 — dialog: закрыто 9 of 9 issues (focus trap native, escapeListener leak, reference-counted scroll lock via NEW lib/utils/scrollLockHandler.ts, role="dialog"/aria-modal/labelledby/describedby, focus return, motion-safe transitions, RTL close button (end-2), aria-live polite region, sideEffects:false). Файл перенесён в ./done/dialog.md. Severity matrix Dialog row 2/5/4/3 → 0/0/0/0. TOTAL 10/123/79/64 = 276 → 8/118/75/61 = 262. Wave 1.2 Dialog ✓. Wave 2.3 progress 7/22 → 8/22 (dup initStyle removed). Wave 2.4 scroll-lock Dialog ✓ (Split — оставшийся пункт). Раньше 2026-05-11: label: закрыто 7 of 10 issues (1 for-id + `<label>` root, 2 drop dup initStyle, 4 translateX/maxWidth `number | string` typing, 6 type-via-componentsOptions de facto, 7 unstyled cross-cutting regression test, 8 motion-safe, 10 default slot). Defer-обоснованы: Issue 3 (Wave 2.1 packaging), Issue 5 (Wave 3.3 CSS vars / Theme runtime API), Issue 9 (dedicated RTL wave). Label row пересчитан 0/4/3/2 → 0/1/2/0. Wave 2.3 progress 5/22 → 6/22 (Input + Switch + Select + Calendar + Aria + Label). Wave 10.1 motion-safe progress 4/22 → 5/22 (Button + Input + Select + Aria + Label). Severity matrix: 10/126/80/66 → 10/123/79/64 = 282 → 276 issues. Раньше 2026-05-11: aria: 8/11; select: 7 of 11 (XSS via #marker/#empty + safe highlight, observer/listener cleanup, dup initStyle, componentsStyle, unstyled cross-cutting Component.setStyle → закрывает Issue 6 во всех 22 + component-class.md Issue 6, aria-live with locale, Intl.Collator filtering, motion-safe + print); switch: 9 of 14; input: 11/13; inputlayout: 6/7; accordion: 4/9; button: 5/16; icons/badge: 5/6 (2026-05-10); utilities: 9 ранее. Roadmap чекбоксы — single-source-of-truth прогресса.
---

# Issues — Index

Внутренний аудит библиотеки `fishtvue` против 60-пунктового чек-листа индустриальных требований к UI-кит библиотекам, плюс проверка соответствия публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) и анализ dual-API gap для коллекционных компонентов.

> **Принцип:** файл `{component}.md` создаётся ТОЛЬКО при наличии хотя бы одной проблемы. Файл, у которого ВСЕ issues закрыты (включая cross-cutting, не только component-localized), перемещается в `./done/`. Чекбоксы в roadmap'е — single-source-of-truth прогресса.

## Сводка по компонентам

### Активные — есть открытые issues

| Target          | File                                       | Critical | High   | Medium | Low    |
| --------------- | ------------------------------------------ | -------- | ------ | ------ | ------ |
| Button          | [button.md](./button.md)                   | 0        | 0      | 2      | 3      |
| Label           | [label.md](./label.md)                     | 0        | 1      | 2      | 0      |
| Aria            | [aria.md](./aria.md)                       | 0        | 1      | 1      | 1      |
| Select          | [select.md](./select.md)                   | 0        | 1      | 0      | 1      |
| Calendar        | [calendar.md](./calendar.md)               | 0        | 5      | 3      | 3      |
| TextEditor      | [texteditor.md](./texteditor.md)           | 0        | 7      | 4      | 3      |
| Table           | [table.md](./table.md)                     | 0        | 0      | 1      | 1      |
| Separator       | [separator.md](./separator.md)             | 0        | 2      | 1      | 1      |
| Accordion       | [accordion.md](./accordion.md)             | 0        | 0      | 0      | 1      |
| Menu            | [menu.md](./menu.md)                       | 0        | 1      | 1      | 2      |
| Alert           | [alert.md](./alert.md)                     | 0        | 1      | 1      | 2      |
| Loading         | [loading.md](./loading.md)                 | 0        | 1      | 0      | 1      |
| Icons           | [icons.md](./icons.md)                     | 0        | 4      | 1      | 2      |
| Component class | [component-class.md](./component-class.md) | 0        | 2      | 3      | 2      |
| Theme           | [theme.md](./theme.md)                     | 0        | 5      | 4      | 2      |
| Locale          | [locale.md](./locale.md)                   | 0        | 5      | 4      | 2      |
| Nuxt module     | [nuxt-module.md](./nuxt-module.md)         | 0        | 6      | 4      | 2      |
| Utilities       | [\_utilities.md](./_utilities.md)          | 0        | 1      | 0      | 1      |
| **TOTAL**       | **27 active + 3 done**                     | **2**    | **44** | **39** | **27** |

### Завершённые — matrix `0/0/0/0`

| Target     | File                                     | Critical | High | Medium | Low | Папка     |
| ---------- | ---------------------------------------- | -------- | ---- | ------ | --- | --------- |
| Input      | [input.md](./input.md)                   | 0        | 0    | 0      | 0   | active/ ¹ |
| Pagination | [pagination.md](./pagination.md)         | 0        | 0    | 0      | 0   | active/ ¹ |
| Form       | [form.md](./form.md)                     | 0        | 0    | 0      | 0   | active/ ¹ |
| Split      | [split.md](./split.md)                   | 0        | 0    | 0      | 0   | active/ ¹ |
| Switch     | [switch.md](./switch.md)                 | 0        | 0    | 0      | 0   | active/ ¹ |
| Badge      | [badge.md](./badge.md)                   | 0        | 0    | 0      | 0   | active/ ¹ |
| InputLayout | [inputlayout.md](./inputlayout.md)      | 0        | 0    | 0      | 0   | active/ ¹ |
| FixWindow  | [done/fixwindow.md](./done/fixwindow.md) | 0        | 0    | 0      | 0   | done/     |
| Dialog     | [done/dialog.md](./done/dialog.md)       | 0        | 0    | 0      | 0   | done/     |
| Config     | [done/config.md](./done/config.md)       | 0        | 0    | 0      | 0   | done/     |

> ¹ Numbered-матрица `0/0/0/0`, но файл остаётся в `active/` как трекер cross-cutting волн (semantic-token Wave 9 и т.п.); полностью закрытые файлы перемещены в `./done/`.

Всего **112 active issues** распределены по 27 активным документам аудита (Dialog ✅ 2026-05-11 + FixWindow ✅ 2026-05-16 + Config ✅ 2026-05-20 → перенесены в `./done/`). Прогресс закрытия отслеживается через чекбоксы в Fix roadmap ниже и зачёркнутые блоки внутри каждого `<component>.md`.

## Fix roadmap (live tracker)

Карта исправлений по волнам. Каждая волна — самодостаточная единица доставки (1-3 sprint'а). Внутри волны задачи сгруппированы по unified fix-pattern: один patch закрывает множество issues одновременно. Чекбоксы — единственный source-of-truth прогресса.

**Соглашения по чекбоксам:**

- `[ ]` — не сделано
- `[~]` — в работе (укажи assignee/PR в комментарии справа от чекбокса)
- `[x]` — сделано + PR смёрджен + acceptance criteria закрыты в issue файле

**Workflow закрытия issue:**

1. Чекни `[x]` в roadmap'е.
2. В соответствующем `<issue>.md` помечай `~~текст~~` зачёркнутым + `✅ resolved YYYY-MM-DD (PR #N)` рядом.
3. Если ВСЕ issues файла закрыты (включая cross-cutting) — переместить файл в `./done/` и обновить ссылку в таблице сводки выше.
4. Пересчитать severity matrix в таблице сводки.

---

### 🔴 Wave 1 — Critical security & stability

**Цель:** убрать все CVE-кандидаты и memory leaks. Без этой волны библиотека не должна публиковаться в production.
**Estimated:** 2-3 sprint'а.
**Зависимости:** нет.
**Параллельно с:** ничем (блокирует публикацию).

#### 1.1 XSS через `v-html` → slot pattern (14 sites, 9 компонентов)

Унифицированный fix: заменить `v-html="X"` на `<slot name="X"><span>{{ X }}</span></slot>`. Сохраняет custom HTML только при явном использовании slot потребителем.

- [x] [Switch.vue:268–270](../../lib/switch/Switch.vue#L268-L270) — `help` prop → `#help` slot · [switch.md Issue 1](./switch.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:372-375](../../lib/inputlayout/InputLayout.vue#L372-L375) — `help` prop → `#help` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает help-XSS во ВСЕХ form-controls** (Input/Aria/Select/Calendar/TextEditor наследуют InputLayout) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:394-398](../../lib/inputlayout/InputLayout.vue#L394-L398) — `messageInvalid` prop → `#messageInvalid` slot · [inputlayout.md Issue 1](./inputlayout.md) · **закрывает validation-XSS во ВСЕХ form-controls** · ✅ resolved 2026-05-11
- [x] [Select.vue marker site](../../lib/select/Select.vue) — `item.marker` → `#marker` scoped slot + safe substring helper (`splitByQuery` + `markerParts` + `<mark>` через `<template v-for>` без `v-html`) · [select.md Issue 1](./select.md) · ✅ resolved 2026-05-11
- [x] [Select.vue noData (×2)](../../lib/select/Select.vue) — `noData` оба сайта → unified `#empty` scoped slot · [select.md Issue 1](./select.md) · ✅ resolved 2026-05-11
- [x] [Form.vue](../../lib/form/Form.vue) — удалён `#item`-override (select-marker copy) → Form переиспользует безопасный default Select (`#marker`/`markerParts`) · [form.md Issue 1](./form.md) · ✅ resolved 2026-06-03
- [x] [Table.vue cell](../../lib/table/Table.vue) — cell `setMarker(...)` v-html → безопасный `markerParts()` + `<mark>` через `<template v-for>` (без v-html); кастомный HTML — через per-column slot · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07 · **был самый опасный: cell content из server data**
- [x] [Table.vue summary](../../lib/table/Table.vue) — summary → text-render `{{ summaryColumns[dataField] }}` · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noData](../../lib/table/Table.vue) — `noData` → `#empty` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noColumn](../../lib/table/Table.vue) — `noColumn` → `#empty-columns` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue noFilter](../../lib/table/Table.vue) — `noFilter` → `#empty-filter` slot (text default) · [table.md Issue 1](./table.md) · ✅ resolved 2026-06-07
- [x] [Menu.vue:629](../../lib/menu/Menu.vue#L629) — `item.info` → `#item-info` scoped slot · [menu.md Issue 1](./menu.md) · ✅ resolved 2026-06-06
- [x] [Menu.vue:637](../../lib/menu/Menu.vue#L637) — `item.info` (FixWindow ветка) → переиспользует `#item-info` · [menu.md Issue 1](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — `item.subtitle` → `#item-subtitle` scoped slot · [accordion.md Issue 1](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Alert.vue:263](../../lib/alert/Alert.vue#L263) — `subtitle` → `#subtitle` slot · [alert.md Issue 1](./alert.md) · ✅ resolved 2026-05-11

**Acceptance:** payload `<img src=x onerror=alert(1)>` не исполняется ни в одном из 14 сайтов (CI-test). Документация компонентов §12 Security обновлена с примером кастомизации через slot.

#### 1.2 Memory leaks → onBeforeUnmount cleanup (6 компонентов)

Унифицированный fix: сохранять Observer / DOM listener в `ref`, в `onBeforeUnmount` вызывать `disconnect()` / `removeEventListener()`. Альтернатива — VueUse composables (`useResizeObserver`, `useEventListener`, `useIntersectionObserver`) для auto-cleanup.

- [x] [Select.vue ResizeObserver](../../lib/select/Select.vue) — сохранён в `let resizeObserver` closure + `onBeforeUnmount` disconnect (зеркалит InputLayout pattern) · [select.md Issue 2](./select.md) · ✅ resolved 2026-05-11
- [x] [Select.vue keydown listeners](../../lib/select/Select.vue) — `openSelectOnEnter` и `keydownSelect` cleanup в `onBeforeUnmount` (с `isClient()` SSR-guard) · [select.md Issue 2](./select.md) · ✅ resolved 2026-05-11
- [x] [Calendar.vue:99,338](../../lib/calendar/Calendar.vue#L99) — `MutationObserver` сохранён в setup-scoped `let darkObserver` + disconnect в `onBeforeUnmount` ([Calendar.vue:258-265](../../lib/calendar/Calendar.vue#L258-L265)) · [calendar.md Issue 1](./calendar.md) · ✅ resolved 2026-05-11 · (singleton `useDarkMode()` composable — future direction, не входит в этот fix)
- [x] [Calendar.vue:258-265](../../lib/calendar/Calendar.vue#L258-L265) — keydown listeners cleanup в `onBeforeUnmount` · [calendar.md Issue 1](./calendar.md) · ✅ resolved 2026-05-11
- [x] [Pagination.vue:259-268](../../lib/pagination/Pagination.vue#L259-L268) — anonymous `new ResizeObserver(...)` → сохранён в массив `navigationObservers` + disconnect в `onBeforeUnmount` · [pagination.md Issue 1](./pagination.md) · ✅ resolved 2026-06-06
- [x] [InputLayout.vue:210-214](../../lib/inputlayout/InputLayout.vue#L210-L214) — anonymous ResizeObserver на `beforeInput` сохранить (`let beforeObserver`) + disconnect ([InputLayout.vue:243-248](../../lib/inputlayout/InputLayout.vue#L243-L248)) · [inputlayout.md Issue 2](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:216-220](../../lib/inputlayout/InputLayout.vue#L216-L220) — anonymous ResizeObserver на `afterInput` сохранить (`let afterObserver`) + disconnect ([InputLayout.vue:243-248](../../lib/inputlayout/InputLayout.vue#L243-L248)) · [inputlayout.md Issue 2](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [Table.vue onUnmounted](../../lib/table/Table.vue#L983) — `lastRowVisibleObserver` (IntersectionObserver) добавлен в `onUnmounted` disconnect · [table.md Issue 2](./table.md) · ✅ resolved 2026-06-07
- [x] [Table.vue onUnmounted](../../lib/table/Table.vue#L983) — `window.mousemove`/`mouseup` cleanup при unmount-while-resize · [table.md Issue 2](./table.md) · ✅ resolved 2026-06-07
- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — `escapeListener` cleanup в `onBeforeUnmount` + reference-counted scroll lock release; `body.style.overflow` восстановление через [lib/utils/scrollLockHandler.ts](../../lib/utils/scrollLockHandler.ts) · [done/dialog.md Issue 2](./done/dialog.md) · ✅ resolved 2026-05-12

**Acceptance:** mount/unmount × 100 в Chrome Memory profiler — heap не растёт (для каждого из 6 компонентов отдельный test). DevTools Performance не показывает retained DOM-узлов с listeners.

#### 1.3 Architecture blockers (2 issues)

- [x] [config/index.ts:18,82,124](../../lib/config/index.ts#L18) — `FishtVueSymbol` стабилизировано: `const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")`, reassign в install удалён, `Symbol.toString()` сравнение заменено на inject-first/window-fallback. · [done/config.md Issue 1](./done/config.md) · ✅ resolved 2026-05-20 · **highest leverage: исправлен inject во ВСЕХ компонентах + component-class Issue 2 (window.FishtVue coupling)**
- [x] [openAlert.ts:106](../../lib/alert/openAlert.ts#L106) — переписан на `createApp(Alert, { ...options, "onUpdate:modelValue": destroy })` — нет manual `addEventListener`, cleanup через Vue emit chain · [alert.md Issue 2](./alert.md) · ✅ resolved 2026-05-11

**Acceptance:** multi-app сценарий (`createApp().use(FishtVue,A)` × 2 с разными configs) — оба работают изолированно. `openAlert` SSR-safe (returns no-op без падения).

---

### 🟠 Wave 2 — Distribution & SSR foundation

**Цель:** убрать ~70% bundle bloat у потребителя; устранить flash-of-unstyled-content при SSR; превратить library в правильный ESM/CJS dual package.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1 (стабильный FishtVueSymbol — для inject в onServerPrefetch path).
**Параллельно с:** Wave 3 (configuration), но порядок: сначала distribution.

#### 2.1 Packaging (one-time fix в [lib/package.json](../../lib/package.json))

- [x] root `exports` map ✅ 2026-06-11 (Issue 5c-b) — генерируется build-step'ом ([`buildRootExports()` в rollup.config.js](../../lib/rollup.config.js)) из rollup-выходов + вложенных package.json/.d.ts: явные entry на каждый `.mjs` (identity + extensionless) + bare-dir (PascalCase `types`, lowercase `import`) + `./*/package.json`. Strict superset, ноль wildcard-неоднозначности. **Verified:** `npm pack` → install → `import.meta.resolve` 19/19 субпутей в pure Node ESM (раньше падали), исполнение CSS-free субпутей, `tsc` bundler+nodenext типы. Пререкизит **5c-a** (Menu publish-gap: `MenuItem.vue`/`MenuGroup.vue` не публиковались → переведены на `index.ts`-bundle, зеркало Table). Контракт — [lib/package.test.ts](../../lib/package.test.ts). · [button.md Issue 9](./button.md), [table.md Issue 5](./table.md). ESM-only ратифицирован ✅ 2026-06-07.
- [x] [lib/package.json](../../lib/package.json) — `"sideEffects": false` на root ✅ 2026-06-07 (выбран `false`, не массив: в dist нет `.vue`/`.css` — SFC → `.mjs`, CSS инжектится в рантайме через lifecycle, не на import) · контракт в [lib/package.test.ts](../../lib/package.test.ts) · [button.md Issue 8](./button.md) · **per-component:** теперь инъектится в КАЖДЫЙ `dist/{name}/package.json` через `copyDependencies()` на build-step (раньше вручную: Dialog 2026-05-12, FixWindow 2026-05-16, Loading/Menu/Separator/Split 2026-06).
- [ ] [lib/package.json:56](../../lib/package.json#L56) — `vue` из `dependencies` → `peerDependencies: "^3.5.0"` · [calendar.md Issue 3](./calendar.md)
- [ ] [lib/package.json:44-57](../../lib/package.json#L44) — `lodash-es`, `date-fns`, `gsap`, `quill`, `@vueup/vue-quill`, `v-calendar`, `tailwind-merge`, `clsx` → optional `peerDependencies` + `peerDependenciesMeta.optional: true` · [calendar.md Issue 2](./calendar.md), [texteditor.md Issue 3](./texteditor.md)
- [x] [lib/rollup.config.js:409](../../lib/rollup.config.js#L409) — решено **ESM-only** + добавлен `"engines": { "node": ">=18" }` ✅ 2026-06-07. `get_CJS_ESM()` остаётся выключенным (аудитория — bundler-based Vue/Nuxt, ESM нативен) · [button.md Issue 9](./button.md)
- [x] [lib/package.json](../../lib/package.json) — `"files": ["**/*.mjs","**/*.map","**/*.d.ts","**/package.json","README.md","LICENSE.md","CHANGELOG.md"]` ✅ 2026-06-07. Проброс в `dist/package.json` через `addPackageJson()`; `npm pack --dry-run` из `dist/`: 174 `.mjs` + 174 `.mjs.map` (sourcemaps ✅), 0× `*.test.*`/`.vue`/non-`.d.ts`-`.ts`. `copyDependencies()` дополнительно пропускает `*.test.*` · [table.md Issue 13, 14](./table.md)
- [ ] [lib/package.json:28-32](../../lib/package.json#L28) — расширить `@nuxt/kit` peer range до `>=3.0.0` (сейчас `^4.1.2` ломает Nuxt 3) · [nuxt-module.md Issue 4](./nuxt-module.md)

#### 2.2 Lazy import тяжёлых deps

- [x] [lib/icons/Icons.vue](../../lib/icons/Icons.vue) — heroicons точечный `import(`@heroicons/vue/24/{outline\|solid}/${Name}.js`)` + Iconify-fallback (trade-off: async/SSR; `unplugin-icons` для гарантированного tree-shaking) · [icons.md Issue 1](./icons.md), [button.md Issue 7](./button.md) · ✅ resolved 2026-06-12
- [ ] [lib/texteditor/TextEditor.vue:3-5](../../lib/texteditor/TextEditor.vue#L3) — Quill через `defineAsyncComponent`, CSS импорты в `onMounted` · [texteditor.md Issue 3](./texteditor.md)
- [ ] [lib/calendar/Calendar.vue](../../lib/calendar/Calendar.vue) — v-calendar `DatePicker` через `defineAsyncComponent` · [calendar.md Issue 2](./calendar.md)
- [x] [lib/loading/Loading.vue](../../lib/loading/Loading.vue) — Epic-вариации lazy через `defineAsyncComponent` · [loading.md Issue 2](./loading.md) · ✅ 2026-06-03 (уже реализовано: `componentsMapEpic`/`componentsMapSvg` = `() => import(...)`)
- [x] [Button.vue](../../lib/button/Button.vue) — `Loading`/`FixWindow` через `defineAsyncComponent` (async-chunks, грузятся при `loading`/icon-tooltip) · [button.md Issue 6](./button.md) · ✅ resolved 2026-06-12

#### 2.3 SSR style injection

- [~] **Удалить `onMounted(() => X.initStyle())`** из 22 SFC — base class уже вызывает через `onServerPrefetch + vueOnMounted` · [component-class.md Issue 1](./component-class.md). Затрагивает: Button, ~~Label~~ ✅ 2026-05-11, ~~Switch~~ ✅ 2026-05-11, ~~Input~~ ✅ 2026-05-11, ~~Aria~~ ✅ 2026-05-11, ~~Select~~ ✅ 2026-05-11, ~~Calendar~~ ✅ 2026-05-11, ~~Alert~~ ✅ 2026-05-11, ~~Dialog~~ ✅ 2026-05-12, ~~FixWindow~~ ✅ 2026-05-16, ~~Form~~ ✅ 2026-06-03 (initStyle bundled с field-init — снят при правке form.md), TextEditor, Table, Pagination, Badge, InputLayout, Separator, ~~Split~~ ✅ 2026-06-06, Accordion, ~~Menu~~ ✅ 2026-06-06, ~~Loading~~ ✅ 2026-06-03, ~~Pagination~~ ✅ 2026-06-13, Icons. **Прогресс:** 14 / 22.
- [ ] [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts) — оборачивать каждый component-style в `@layer fishtvue { ... }` (или настраиваемый layer name из `optionsTheme.layers`) · [theme.md Issue 4](./theme.md)
- [ ] [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts) — HMR teardown: replace content existing `<style>` element, не append new · [component-class.md Issue 3](./component-class.md)

#### 2.4 Body scroll lock — reference counted

- [x] [Dialog.vue](../../lib/dialog/Dialog.vue) — заменено на reference-counted singleton [lib/utils/scrollLockHandler.ts](../../lib/utils/scrollLockHandler.ts) (`lockBodyScroll` / `unlockBodyScroll` + counter + сохранение оригинальных `body.style.overflow` / `paddingRight`) · [done/dialog.md Issue 3](./done/dialog.md) · ✅ resolved 2026-05-12 · готов к переиспользованию Split
- [x] [Split.vue:103-105](../../lib/split/Split.vue#L103-L105), [Split.vue:717](../../lib/split/Split.vue#L717) — `document.body.classList.add(cursorClass)` → локальный overlay div `<div data-split-drag-overlay>` (без global state мутации, `watch(activeCursorPanel)` удалён) · [split.md Issue 1](./split.md) · ✅ resolved 2026-06-06

**Acceptance:** `pnpm sandbox:build` + analyzer показывает ~70% bundle reduction для consumer не использующего Calendar/TextEditor/много heroicons. SSR-render через `renderToString` содержит inline `<style>` с правилами компонентов (snapshot test). DevTools Memory: HMR-обновление компонента 50× → один `<style>` в head, не 50.

---

### 🟠 Wave 3 — Configuration support (документация → реальность)

**Цель:** закрыть documentation lies — публичная Configuration-док обещает API которого нет.
**Estimated:** 2-3 sprint'а.
**Зависимости:** Wave 1.3 (стабильный FishtVueSymbol).
**Параллельно с:** Wave 4 (a11y) — независимо.

#### 3.1 `unstyled: true` enforcement (один фикс → 22 компонента)

- [x] [component/index.ts:138](../../lib/component/index.ts#L138) — в `Component.setStyle()` (134-157) добавлен guard `if (this.__globalConfig?.config?.unstyled) return ""` · [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md) · ✅ resolved 2026-05-11 (cross-cutting — закрывает Issue 6 во всех 22 компонентах одной правкой)
- [x] Тест: Select.test.ts > `respects unstyled: true via Component.setStyle guard` — `class` корня пустой при `unstyled: true`. Демонстрирует cross-cutting эффект (применимо ко всем компонентам — same setStyle entry point).

#### 3.2 `componentsStyle` global fallback consistency

Унификация: все form-controls с `mode` prop должны учитывать `Component.componentsStyle()` в fallback chain.

- [x] [Button.vue](../../lib/button/Button.vue) — computed `componentsStyleMode` mapping (`filled→primary`, `outlined→outline`, `underlined→ghost`) в fallback chain `mode` · [button.md Issue 13](./button.md) · ✅ resolved 2026-06-12
- [x] [Input.vue:62-64](../../lib/input/Input.vue#L62-L64) — добавить `?? Input.componentsStyle()` в fallback · [input.md Issue 2](./input.md) ✅ 2026-05-11
- [x] [Aria.vue:49-51](../../lib/aria/Aria.vue#L49-L51) — добавить `?? Aria.componentsStyle()` · [aria.md Issue 4](./aria.md) ✅ 2026-05-11
- [x] [Select.vue](../../lib/select/Select.vue) — добавлено `?? options?.mode ?? Select.componentsStyle()` в fallback chain (`mode` computed) · [select.md Issue 5](./select.md) · ✅ resolved 2026-05-11
- [x] [Calendar.vue:106-108](../../lib/calendar/Calendar.vue#L106-L108) — добавлено `?? Calendar.componentsStyle()` · [calendar.md Issue 6](./calendar.md) · ✅ resolved 2026-05-11
- [ ] [TextEditor.vue:54](../../lib/texteditor/TextEditor.vue#L54) — добавить `?? TextEditor.componentsStyle()` · [texteditor.md Issue 7](./texteditor.md)
- [x] [Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23) — добавить mapping (`filled→primary`, `outlined→outline`, `underlined→neutral`) · [badge.md Issue 2](./badge.md) ✅ 2026-05-10

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

- [x] `dark:*` варианты генерируются на основе `optionsTheme.darkModeSelector` config · ✅ 2026-06-12 — оказалось **уже реализовано**: `Component.setStyle` прокидывает `darkSelector` ([component/index.ts:150](../../lib/component/index.ts#L150)) → `tailwind()` подменяет media-query на селектор ([unoStyle/tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95)). Правок движка не потребовалось · [theme.md Issue 5](./theme.md), [button.md Issue 16](./button.md)
- [x] Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` → компонент рендерит dark-стили на настроенный селектор · ✅ 2026-06-12 — [lib/theme/darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) (plugin-config через probe) + engine-кейсы в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts).

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

- [x] [Button.vue:382–390](../../lib/button/Button.vue#L382-L390) — `aria-label` для icon-кнопок (с dev-warning если type="icon" без label) · [done/button.md Issue 2](./button.md) · resolved 2026-05-10
- [ ] [Label.vue:60](../../lib/label/Label.vue#L60) — корень `<div>` → `<label :for="forId">` + новый prop `forId` · [label.md Issue 1](./label.md)
- [ ] [Pagination.vue:262](../../lib/pagination/Pagination.vue#L262) — `<nav role="navigation" aria-label>` + `aria-current="page"` · [pagination.md Issue 4](./pagination.md)
- [x] [Loading.vue](../../lib/loading/Loading.vue) — `role="status"` + `aria-live="polite"` + `aria-label` (локализован через `loading.label`) + `sr-only` span · [loading.md Issue 3](./loading.md) · ✅ resolved 2026-06-03
- [x] [Alert.vue:255](../../lib/alert/Alert.vue#L255) — `role="alert"`/`role="status"` + `aria-live` + `aria-atomic` mapped per `type` · [alert.md Issue 3](./alert.md) · ✅ resolved 2026-05-11
- [x] [Menu.vue](../../lib/menu/Menu.vue) — `role="menu"`/`menuitem`/`group`/`separator` + `aria-orientation` + `aria-haspopup` + `aria-expanded` · [menu.md Issue 4](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — disclosure pattern: header `<button aria-expanded aria-controls>` + content `role="region" aria-labelledby` · [accordion.md Issue 3](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Split.vue:674-685](../../lib/split/Split.vue#L674-L685) — resize handle `role="separator"` + `aria-orientation` + `aria-valuenow/min/max` + `aria-controls` (role/valuenow уже были; добавлены orientation/controls + panel `id` через `useId`) · [split.md Issue 4](./split.md) · ✅ resolved 2026-06-06
- [x] [Table.vue](../../lib/table/Table.vue) — `<caption>` prop+slot (sr-only); `<th scope="col">` уже был (thead/colgroup/tfoot) · [table.md Issue 8](./table.md) · ✅ resolved 2026-06-07
- [x] [Icons.vue](../../lib/icons/Icons.vue) — default `aria-hidden="true"` + prop `:label` для семантических (wrapper-based pattern) · [icons.md Issue 3](./icons.md) ✅ 2026-05-10
- [x] [Separator.vue](../../lib/separator/Separator.vue) — корень `<div role="separator" :aria-orientation>` (unconditional, без нового prop) · [separator.md Issue 2](./separator.md) · ✅ resolved 2026-06-06

#### 4.3 Keyboard navigation

- [x] [Menu.vue](../../lib/menu/Menu.vue) — ArrowUp/Down между items, ArrowRight/Left для submenu, Home/End, typeahead, roving tabindex · [menu.md Issue 3](./menu.md) · ✅ resolved 2026-06-06
- [x] [Accordion.vue](../../lib/accordion/Accordion.vue) — ArrowUp/Down/Home/End между header items + roving tabindex · [accordion.md Issue 4](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Split.vue:453](../../lib/split/Split.vue#L453) — стрелки на focused resize handle (Shift — крупный шаг, Home/End — экстремумы; direction-aware) · [split.md Issue 5](./split.md) · ✅ resolved 2026-06-06
- [ ] [Select.vue:341-352](../../lib/select/Select.vue#L341) — audit existing keyboard logic (ArrowUp/Down уже есть) + добавить Home/End/typeahead.

#### 4.4 aria-live announcements

- [x] [Select.vue](../../lib/select/Select.vue) — `<div data-select-aria-live class="sr-only" aria-live="polite" aria-atomic="true">{{ ariaResultsLabel }}</div>` для search results + новые locale-ключи `select.resultsCount` / `select.resultsCountOne` / `select.resultsCountNone` (en + ru + TypesLocale) · [select.md Issue 8](./select.md) · ✅ resolved 2026-05-11
- [ ] [Pagination.vue](../../lib/pagination/Pagination.vue) — announce «Page N of M» при switchPage · [pagination.md Issue 5](./pagination.md)
- [x] [Table.vue](../../lib/table/Table.vue) — announce filter/sort/search results count (sr-only `[data-table-aria-live]` polite + `table.resultsCount*`) · [table.md Issue 9](./table.md) · ✅ resolved 2026-06-07
- [x] [InputLayout.vue:443-451](../../lib/inputlayout/InputLayout.vue#L443-L451) — `aria-live="assertive"` + `aria-atomic="true"` на error region · [inputlayout.md Issue 6](./inputlayout.md) · ✅ resolved 2026-05-11

**Acceptance:** axe-core CI passes для каждого компонента. Lighthouse a11y score = 100 для sandbox-pages со всеми компонентами. Manual screen-reader test (NVDA/VoiceOver) — каждый интерактивный компонент озвучивается корректно.

---

### 🟠 Wave 5 — Floating UI integration

**Цель:** все popover/tooltip/dropdown позиционируются корректно при scroll/resize/viewport-overflow. Click-outside работает через Teleport.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 1.2 (FixWindow listeners cleanup).
**Параллельно с:** Wave 4 (a11y) — независимо.

- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — переписать manual position calc на `@floating-ui/vue` (`useFloating`, `autoUpdate`, `offset`, `flip`, `shift`) · [fixwindow.md Issue 2](./fixwindow.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — Teleport через prop `:teleport?: string | HTMLElement | false` (default `'body'` для popover-mode) · [fixwindow.md Issue 1](./fixwindow.md)
- [x] [FixWindow.vue:495](../../lib/fixwindow/FixWindow.vue#L495) — click-outside через собственный `useClickOutside` (dependency-free, Teleport-aware via `composedPath`) — handles teleport · [fixwindow.md Issue 3](./done/fixwindow.md)
- [ ] [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) — `aria-role` computed (tooltip / dialog / menu) на основе `eventOpen` + содержимого · [fixwindow.md Issue 8](./fixwindow.md)
- [~] **Verify Calendar/Select/Menu** наследуют новый FixWindow без regression — все имеют integration tests. **Menu ✅ 2026-06-06** (submenu через FixWindow с Floating UI + focus trap; nested `<Menu>` рендерится корректно — `Menu.test.ts`); **Table ✅ 2026-06-11** (filter + cell-editor Select/Calendar плавают через FixWindow с `scrollableEl: tableBody` — [table.md Issue 10](./table.md)); Calendar/Select — open.

**Acceptance:** popover не обрезается при overflow:hidden родителя; auto-flip при near viewport edge; scroll body — позиция обновляется. Calendar/Select/Menu pop-ups работают через Teleport.

---

### 🟡 Wave 6 — Dual-API parallel (compound + schema)

**Цель:** competitive parity с AG Grid / Element Plus / Naive UI / PrimeVue. Параллельный compound API без breaking change для schema-driven.
**Estimated:** 4-6 sprint'ов (один компонент на sprint).
**Зависимости:** Wave 1 (XSS slot pattern — base для composition), Wave 4 (a11y patterns).
**Порядок внутри волны:** Table → Form → Select → Menu → Accordion (по приоритету ROI).

Унифицированный fix-pattern: `provide(CONTEXT, { register, unregister })` в parent + child компоненты регистрируют себя при mount. Schema-driven prop (`:dataColumns`, `:structure`, `:dataSelect`, `:items`) выигрывает при конфликте — backward compat.

#### 6.1 Table → `<Table><Column>` — ✅ resolved 2026-06-07

> Реализовано через **VNode-walk `slots.default()`** (канон FishtVue, зеркало Menu), а НЕ provide/inject — `TableContext.ts` не понадобился (renderless-дети читаются по имени из default-slot).

- [x] `lib/table/Column.vue` + `lib/table/ColumnGroup.vue` — renderless descriptors (VNode-walk, не inject) · [table.md Issue 3](./table.md) · ✅ 2026-06-07
- [x] ~~`lib/table/TableContext.ts`~~ — не нужен: VNode-walk вместо provide/inject (canon — зеркало Menu) · ✅ 2026-06-07
- [x] [Table.vue](../../lib/table/Table.vue) — `compoundParsed` walk (Fragment-flatten, по имени), `columns` computed fallback к compound, schema `:columns` выигрывает · ✅ 2026-06-07
- [x] Per-column scoped slots `cell`/`header`/`filter` — захватываются с vnode и рендерятся через `RenderColumnSlot` · ✅ 2026-06-07 (`summary` — через существующий tfoot, отдельный slot не вводился)
- [x] `<ColumnGroup>` multi-level headers + `<Pagination>`/`<Loading>` overrides (сверх исходного ТЗ) · ✅ 2026-06-07
- [x] Регистрация: `fishtvue/table` named-экспорты (rollup entry → index.ts) + root barrel + Nuxt `FISHT_VUE_SUBCOMPONENTS` · ✅ 2026-06-07
- [x] [Documentation/components/table.md](../components/table.md) §10.5 «Compound API» · ✅ 2026-06-07
- [x] Тесты: `Column.test.ts` 14 кейсов (schema/compound/precedence/slots/group/override/reactivity) · ✅ 2026-06-07

#### 6.2 Form → `<Form><FormField>` + `<FormSection>` — ✅ resolved 2026-06-13

> Реализовано через **VNode-walk `slots.default()`** (канон FishtVue, зеркало Table/Menu), а НЕ provide/inject.

- [x] `lib/form/FormField.vue` + `lib/form/FormSection.vue` — renderless descriptors (VNode-walk) · [form.md Issue 2](./form.md) · ✅ 2026-06-13
- [x] `registerFieldType("MyField", ...)` — open typeField union + [lib/form/fieldRegistry.ts](../../lib/form/fieldRegistry.ts) · [form.md Issue 3](./form.md) · ✅ 2026-06-13
- [x] Native `<form @submit>` + FormData (`action`/`method`/`enctype`/`nativeSubmit`) · [form.md Issue 4](./form.md) · ✅ 2026-06-13
- [x] Регистрация: `fishtvue/form` named-экспорты (rollup entry → index.ts) + root barrel + Nuxt `FISHT_VUE_SUBCOMPONENTS` · ✅ 2026-06-13
- [x] [Documentation/components/form.md](../components/form.md) §10.5 Compound API + §M native submit + custom field types · ✅ 2026-06-13

#### 6.3 Select → `<Select><SelectOption>` + `<SelectGroup>`

- [ ] `lib/select/SelectOption.vue` + `lib/select/SelectGroup.vue` · [select.md Issue 3](./select.md)
- [ ] Children walk + Fragment-flatten.
- [ ] [Documentation/components/select.md](../components/select.md) §10.5.

#### 6.4 Menu → `<Menu><MenuItem>` + `<MenuGroup>`

- [x] `lib/menu/MenuItem.vue` + `lib/menu/MenuGroup.vue` (renderless descriptors; VNode-walk вместо provide/inject) · [menu.md Issue 2](./menu.md) · ✅ resolved 2026-06-06
- [x] Submenu через recursive `<MenuItem><MenuItem></MenuItem></MenuItem>`. · ✅ resolved 2026-06-06 (экспорт через root barrel; `:groups` выигрывает; [menu.md §9.5](../components/menu.md))

#### 6.5 Accordion → `<Accordion><AccordionItem>`

- [x] `lib/accordion/AccordionItem.vue` · [accordion.md Issue 2](./accordion.md) · ✅ resolved 2026-06-14 (renderless descriptor + VNode-walk; compound-entry в `lib/rollup.config.js`; `:data-source` выигрывает; [accordion.md §9.4](../components/accordion.md))

**Acceptance:** для каждого из 5 компонентов schema-driven и compound API работают одновременно (test). Volar autocomplete для child-компонентов работает. Documentation обновлена с примерами обоих API.

---

### 🟡 Wave 7 — Performance & virtualization

**Цель:** library работает с 10k+ rows без deg.
**Estimated:** 1-2 sprint'а.
**Зависимости:** нет (Table virtual сделан dependency-free, без Wave 6.1).
**Параллельно с:** Wave 8.

- [x] [Table.vue](../../lib/table/Table.vue) — `virtual?: boolean | { rowHeight?, overscan?, threshold? }`, **dependency-free** windowing (fixed rowHeight, spacer-`<tr>`, absolute index, `aria-rowcount`/`aria-rowindex`); auto + opt-out · [table.md Issue 4](./table.md) · ✅ resolved 2026-06-07
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

- [~] Глобальная замена `left/right` Tailwind classes на `start/end` (logical) во всех компонентах · cross-cutting issue. **Прогресс 2026-06-11:** Table ([Table.vue](../../lib/table/Table.vue) — resize-handle `pe-2` + `rtl:`-override inset + dir-aware `resizeColumn` width-math; group-label `start-*`/`ps-*`) ✅ [table.md Issue 11](./table.md). **2026-06-13:** Pagination ([Pagination.vue:182–183](../../lib/pagination/Pagination.vue#L182-L183) — directional иконки `rtl:-scale-x-100` + физический `ml-3` → logical `ms-3`; порядок prev/next зеркалит `inline-flex` нативно, без `flex-row-reverse`) ✅ [pagination.md Issue 6](./pagination.md). **2026-06-13:** Split ([isRtlHorizontal — Split.vue:408](../../lib/split/Split.vue#L408) — dir-aware pointer-resize-математика + keyboard-инверсия; физических `left/right` offset'ов у Split нет → логические-классы не нужны) ✅ [split.md Issue 7](./split.md). **2026-06-13:** Switch ([Switch.vue:126–127](../../lib/switch/Switch.vue#L126-L127) — `classAfterInput` `end-0` + `classIconBody` `me-2`; thumb `translate-x` оставлен как позиционирование внутри controlled-track) ✅ partial [switch.md Issue 8](./switch.md). **2026-06-13:** Badge ([Badge.vue:53–60](../../lib/badge/Badge.vue#L53-L60) — физические `pl-1`/`pr-1` → логические `ps-1`/`pe-1` для point/close-padding; `inline-flex` зеркалит порядок point/close нативно) ✅ [badge.md Issue 6](./badge.md). **2026-06-14:** Accordion ([Accordion.vue](../../lib/accordion/Accordion.vue) — заголовок `text-left` → `text-start`, иконки `ml-8` → `ms-8`; вертикальная Arrow Up/Down-навигация направление-нейтральна) ✅ [accordion.md Issue 7 · F31](./accordion.md). Движок поддерживает `rtl:`/`ltr:` + логические `start`/`end`/`pe`/`ps` — pattern готов к применению на остальных компонентах.
- [x] [Button.d.ts](../../lib/button/Button.d.ts) — `iconPosition: "start" | "end"` (deprecation `"left"|"right"`) · [button.md Issue 3](./button.md) · RTL делегирован `inline-flex` main-axis (без отдельного CSS) · ✅ resolved 2026-06-07
- [ ] [Separator.d.ts](../../lib/separator/Separator.d.ts) — `contentPosition: "start" | "end"` · [separator.md Issue 3](./separator.md)
- [ ] Auto-detect `<html dir="rtl">` через `useDirectionality()` composable + соответствующий API в Locale (Issue 4 в [locale.md](./locale.md))
- [ ] Тесты с `dir="rtl"` для каждого компонента (snapshot-based).

#### 8.2 i18n текстов

- [~] [rulesHandler.ts / rulesMethods.ts](../../lib/utils/rulesHandler.ts) — validation messages локализуются. **Прогресс 2026-06-03:** `setDefaultRuleMessages()` + locale-ключи (`invalidEmail` и др.) уже в [locales/{en,ru}.ts](../../lib/locale/locales/); ~~Form~~ ✅ авто-применяет их через `applyLocaleToRules()` (guarded `useFishtVue()` + `watch(getActiveLocale)`) · [form.md Issue 6](./form.md). Остаётся: авто-wiring для standalone Input/Select без Form.
- [x] [Calendar.vue:102-105, 378, 391](../../lib/calendar/Calendar.vue#L102-L105) — `getActiveLocale()` пробрасывается в `<DatePicker :locale>`, priority `props > options > active > "en"` · [calendar.md Issue 8](./calendar.md) · ✅ resolved 2026-05-11
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — Quill toolbar tooltips через i18n · [texteditor.md Issue 8, 9](./texteditor.md)
- [~] [numberHandler.convertToPhone](../../lib/utils/numberHandler.ts) — параметризовать по locale · [input.md Issue 7](./input.md). **Прогресс 2026-05-11:** `phoneFormats` пробрасывается через `InputProps.phoneFormats` + `InputOption.phoneFormats`; `toPhone(e, options)` расширен. Auto-bind к активной локали — оставлен на следующую итерацию (требует расширения `lib/locale/` + либо `libphonenumber-js` peer-dep, либо встроенной таблицы locale → PhoneFormat[]).
- [x] [Select.vue search](../../lib/select/Select.vue) — фильтрация через `Intl.Collator(getActiveLocale() ?? "en", { sensitivity: "base", usage: "search" })` (diacritic + case insensitive). Сcollator также используется в `splitByQuery` для подсветки — match-логика согласована · [select.md Issue 10](./select.md) · ✅ resolved 2026-05-11
- [ ] Локализация UI-текстов (Pagination prev/next уже есть): ~~Loading aria-label~~ ✅ 2026-06-03 (`loading.label`), Alert Confirm/Cancel, Dialog title, и т.д.

**Acceptance:** library работает в RTL (`<html dir="rtl">`) — visual snapshots проходят. `setActiveLocale("ru")` — все тексты включая validation messages переключаются.

---

### 🟡 Wave 9 — Theming polish

**Цель:** все цвета через design tokens — `usePreset(MyTheme)` действительно меняет всё.
**Estimated:** 1-2 sprint'а.
**Зависимости:** Wave 3.3 (theme runtime API), Wave 3.4 (darkModeSelector).

- [ ] Замена `gray-*` / `stone-*` / `neutral-*` / `red-*` / `green-*` Tailwind primitives на semantic tokens (`bg-surface`, `text-muted-foreground`, `border-border`) во всех компонентах · cross-cutting [switch.md Issue 12](./switch.md). **Прогресс:** canon-safe partial (forced-colors + preset-aware `theme-*` accents, нейтрали остаются) применён к Split/Pagination/Table/Form/**Switch**/**Badge** (✅ 2026-06-13; Badge — `forced-colors:outline`, `neutral-*` outline-contrast Issue 4 остаётся, [badge.md Issue 6](./badge.md)); полная `bg-surface`/`border-border` миграция ждёт theme-движок + runtime `usePreset`.
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

- [~] Все `transition-*` Tailwind classes → `motion-safe:transition-*` (или `@media (prefers-reduced-motion)` CSS) · cross-cutting · Button уже сделан ([button.md Issue 10](./button.md)) — pattern готов к применению на остальных 21 компонента. **Прогресс 2026-05-11:** Input ([Input.vue:87, 89, 98](../../lib/input/Input.vue#L87-L98)) ✅; Select ([Select.vue](../../lib/select/Select.vue) — root transition + classSelectList + classLiItem + TransitionGroup leave/enter classes + Badge inline + print: prefixes) ✅; Aria ([Aria.vue:65](../../lib/aria/Aria.vue#L65) — `motion-safe:placeholder:transition-all` + `print:*`) ✅; Label ([Label.vue:36](../../lib/label/Label.vue#L36) — `motion-safe:transition-all motion-safe:duration-200`) ✅; Menu ([Menu.vue](../../lib/menu/Menu.vue) — default `styles.animation = "motion-safe:transition-all motion-safe:duration-500"` в `classMenu`/`classMenuItem`) ✅ 2026-06-06; Split ([Split.vue:89, 95](../../lib/split/Split.vue#L89-L95) — root `motion-safe:transition-all` + separator-icon `motion-safe:transition-opacity`) ✅ 2026-06-06; Table ([Table.vue](../../lib/table/Table.vue) — `animation`-токен + `classIsSort`/`classResizedColumns`/`classTr` + 5 inline `<transition>`-обёрток + search-Input → `motion-safe:`) ✅ 2026-06-11. **2026-06-13:** Switch ([Switch.vue:64, 98, 106, 136](../../lib/switch/Switch.vue#L64) — root `classBaseSwitch` + switch/checkbox-track + thumb `motion-safe:`; inline `<Icons>`-thumb вынесен в NEW computed `classSwitchIconImg` через `setStyle`) ✅ [switch.md Issue 7](./switch.md); InputLayout ([InputLayout.vue:67-72, 149-154](../../lib/inputlayout/InputLayout.vue#L67-L72) — root `animation` `motion-safe:transition-all motion-safe:duration-550` + оба `<transition>`-блока + hover-иконки `motion-safe:*`; inline-классы зарегистрированы явно module-scope `InputLayout.setStyle`) ✅ [inputlayout.md Issue 8](./inputlayout.md). **2026-06-14:** Accordion ([Accordion.vue](../../lib/accordion/Accordion.vue) — `classSubtitle`/`styleIcon`/`classRect` → `motion-safe:transition*` + `onRootLeave` мгновенный unmount под `prefers-reduced-motion: reduce`) ✅ [accordion.md Issue 7 · E29.7](./accordion.md). 11 / 22.
- [x] [Loading.vue](../../lib/loading/Loading.vue) — статичный fallback (`simple`-loader, `animation-duration=0`) в reduced-motion mode через `matchMedia` guard в обёртке · [loading.md Issue 6](./loading.md) · ✅ resolved 2026-06-03

#### 10.2 Print styles

- [~] Глобальный `@media print` блок: интерактивные компоненты (Button, Select, Loading) скрываются или упрощаются · [button.md Issue 15](./button.md). **Прогресс 2026-05-11:** Input ([Input.vue:90](../../lib/input/Input.vue#L90)) получил `print:border print:border-black print:bg-white print:text-black print:shadow-none`. **2026-06-03:** Loading ([Loading.vue](../../lib/loading/Loading.vue)) → `print:hidden` в `classLoading` ([loading.md Issue 8](./loading.md)). **2026-06-11:** Table ([Table.vue](../../lib/table/Table.vue)) → `print:hidden` на loading-overlay + resize-handle ([table.md Issue 12](./table.md)). **2026-06-12:** Button ([Button.vue](../../lib/button/Button.vue)) → `print:border print:bg-white print:text-black print:shadow-none` в `baseClasses` (style-for-print) ([button.md Issue 15](./button.md)). **2026-06-13:** Pagination ([Pagination.vue](../../lib/pagination/Pagination.vue)) → `print:border-black` (classBase) + `print:text-black` (active indicator) + `forced-colors:outline` (active page, B10) ([pagination.md Issue 8](./pagination.md)). **2026-06-13:** Switch ([Switch.vue:66, 84](../../lib/switch/Switch.vue#L66)) → `print:border print:border-black print:bg-white print:text-black print:shadow-none` на обе ветки `classBaseSwitch` (style-for-print) ([switch.md Issue 14](./switch.md)). **2026-06-13:** InputLayout ([InputLayout.vue:92](../../lib/inputlayout/InputLayout.vue#L92)) → `print:border print:border-black print:bg-white print:text-black print:shadow-none` на `classBody` (style-for-print) + `forced-colors:outline` на `classBase` (B10) ([inputlayout.md Issue 8](./inputlayout.md)). Pattern зафиксирован, но цельного `@media print` блока ещё нет.

#### 10.3 Polymorphic & composition

- [x] [Button.vue](../../lib/button/Button.vue) — `as?: string | Component` через `<component :is>` (`<a>`/`<NuxtLink>`, авто role/tabindex/aria-disabled) · [button.md Issue 5](./button.md) · ✅ resolved 2026-06-12
- [x] [Button.vue:400–407](../../lib/button/Button.vue#L400-L407) — slots `start` + `end` · [done/button.md Issue 12](./button.md) · resolved 2026-05-10 (slot names `start`/`end` выбраны для logical-writing-order)
- [x] [Button.vue:344–366](../../lib/button/Button.vue#L344-L366) — expose `buttonRef` + `focus()` / `blur()` методы · [done/button.md Issue 4](./button.md) · resolved 2026-05-10
- [x] [Switch.vue](../../lib/switch/Switch.vue) — expose `inputRef` + `focus`/`blur` · [switch.md Issue 11](./switch.md) · ✅ resolved 2026-05-11
- [x] [Pagination.vue:203–224](../../lib/pagination/Pagination.vue#L203-L224) — expose `paginationRef` + `focus()` · [pagination.md Issue 7](./pagination.md) · ✅ resolved 2026-06-13
- [x] [Split.vue:139–142](../../lib/split/Split.vue#L139-L142) — expose `focus()` (→ первый separator; root уже был `resizableGroup`) · [split.md Issue 9](./split.md) · ✅ resolved 2026-06-13

#### 10.4 API consistency

- [x] [Switch.vue](../../lib/switch/Switch.vue) — удалить дубль emit `updateModelValue` · [switch.md Issue 2](./switch.md) · ✅ resolved 2026-05-11
- [x] [Switch.d.ts:48](../../lib/switch/Switch.d.ts#L48) — закрыть union `switchingType: "checkbox" | "switch"` (убрать `| string`) · [switch.md Issue 9](./switch.md) · ✅ resolved 2026-05-11
- [ ] [Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97) — `change:modelValue(payload: string)` (was boolean type bug) · [aria.md Issue 1](./aria.md)
- [ ] [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts) — то же `change:modelValue` type bug fix · [texteditor.md Issue 5](./texteditor.md)
- [x] [Icons.d.ts:84](../../lib/icons/Icons.d.ts#L84) — `variant?: "outline"|"solid"` (было `stileIcon` опечатка), deprecation soft через runtime `console.warn` · [icons.md Issue 4](./icons.md) ✅ 2026-05-10 (hard removal + codemod — Wave 12)
- [x] [Icons.d.ts:61](../../lib/icons/Icons.d.ts#L61) — `IconType = HeroIconName | IconifyIconName | (string & {})` template literal union (hand-curated 30 heroicons + Iconify pattern + open fallback) · [icons.md Issue 5](./icons.md) ✅ 2026-05-10 (full ~280 union via build-script — future)
- [x] [Badge.vue:80–83](../../lib/badge/Badge.vue#L80-L83) — `delete` emit → `close` (soft deprecation, both emit) · [badge.md Issue 5](./badge.md) ✅ 2026-05-10
- [x] [Switch.vue:218–227](../../lib/switch/Switch.vue#L218-L227) — скрытый `<input type="checkbox" hidden>` form-bridge рядом с `<button role="switch">` для native form integration · [switch.md Issue 3](./switch.md) · ✅ resolved 2026-05-11
- [ ] [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — hidden `<input>` для native form submit · [texteditor.md Issue 10](./texteditor.md)
- [ ] [Form.vue](../../lib/form/Form.vue) — корень `<form>` (после Wave 6.2) · [form.md Issue 4](./form.md)
- [x] [Input.vue:31-39](../../lib/input/Input.vue#L31-L39) — расширить `arrayInputType` ["text","number","email","password","tel","url","search"] · [input.md Issue 6](./input.md) ✅ 2026-05-11
- [x] [Loading.d.ts](../../lib/loading/Loading.d.ts) — `LoadingOption` включить `type` · [loading.md Issue 4](./loading.md) · ✅ resolved 2026-06-03 (+ `resolvedType` в Loading.vue)

#### 10.5 Window.FishtVue coupling cleanup

- [ ] [component/index.ts:68](../../lib/component/index.ts#L68) — primary path `inject(FishtVueSymbol)`, `(window as any).FishtVue` только fallback · [component-class.md Issue 2](./component-class.md)

#### 10.6 Other architecture

- [x] [Animation transitions](../../lib/accordion/Accordion.vue) — `<Transition :css="false">` с JS `@leave` hook для unmount-safe collapse · [accordion.md Issue 6](./accordion.md) · ✅ resolved 2026-05-11
- [x] [Input.vue:212-220](../../lib/input/Input.vue#L212-L220) — `focus(eventOrOptions?: FocusEvent | FocusOptions)` argless + FocusOptions вариант · [input.md Issue 10](./input.md) ✅ 2026-05-11
- [x] [Input.vue:96-102](../../lib/input/Input.vue#L96-L102), [Input.vue:255-266](../../lib/input/Input.vue#L255-L266) — eye-icon class через computed (option `passwordToggleClass`, theme-токены) · [input.md Issue 5](./input.md) ✅ 2026-05-11
- [x] [InputLayout.vue:188-223](../../lib/inputlayout/InputLayout.vue#L188-L223) — убрать `document.querySelector("header")` hardcode → prop `:offsetTop` (number / string / `() => number`) + `resolveOffsetTop()` · [inputlayout.md Issue 5](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [InputLayout.vue:264-309](../../lib/inputlayout/InputLayout.vue#L264-L309) — `clipboard.writeText` feature-detect + `legacyCopy()` execCommand fallback + SSR guard · [inputlayout.md Issue 3](./inputlayout.md) · ✅ resolved 2026-05-11
- [x] [Switch.vue:277](../../lib/switch/Switch.vue#L277) — help-icon contrast (`text-gray-400` → `text-gray-500` light) · [switch.md Issue 6](./switch.md) · ✅ resolved 2026-05-11
- [x] [Badge.vue:38](../../lib/badge/Badge.vue#L38) — `ring-neutral-500/30` → `ring-neutral-300 dark:ring-neutral-700` · [badge.md Issue 4](./badge.md) ✅ 2026-05-10
- [ ] [calendar.md Issue 9 — Floating UI](./calendar.md) (закрывается через Wave 5).
- [ ] [\_utilities.md Issue 9 — arrayHandler.sort стабильность документировать](./_utilities.md) — низкий приоритет.

**Acceptance:** axe-core CI без contrast violations. Codemods для deprecated aliases (Aria→Textarea, stileIcon→variant, iconPosition left→start, delete→close emit).

---

### 🟢 Wave 11 — Tests & coverage gaps

**Цель:** все компоненты ≥80% statement coverage, ≥70% branch coverage, infrastructure modules покрыты.
**Estimated:** 2-3 sprint'а (параллельно с другими волнами).

- [ ] [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) — разблокировать 17 skipped tests (`vi.mock("@vueup/vue-quill")`) · [texteditor.md Issue 1](./texteditor.md). **Цель: coverage 0% → ≥70%**
- [x] [Loading.test.ts](../../lib/loading/Loading.test.ts) — тест каждой Epic/Svg вариации · [loading.md Issue 1](./loading.md). **Цель: loadingTypes 3% → ≥70%** · ✅ resolved 2026-06-03 (достигнуто 100%, 145 кейсов). Подъём beta → stable ждёт Issue 7 (Wave 9).
- [ ] [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) — coverage gap (377-396 + 219-340 untested) · [calendar.md](./calendar.md). **Цель: 63% → ≥80%**
- [x] [Split.test.ts](../../lib/split/Split.test.ts) — 7 → 32 теста (resize, persist, keyboard, ARIA, overlay, pixel default-size + recalc через mock geometry) · [split.md Issue 2](./split.md). **Цель: 60%/39% → ≥80%/70%** · ✅ resolved 2026-06-06 (достигнуто 85.19% / 71.77%; Split поднят beta → stable)
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
  - [ ] `iconPosition: "left"|"right"` → `"start"|"end"` · [button.md Issue 3](./button.md) (codemod still TODO; soft deprecation already landed)
  - [ ] `stileIcon` → `variant` · [icons.md Issue 4](./icons.md)
  - [ ] `delete` emit → `close` for Badge · [badge.md Issue 5](./badge.md) (codemod still TODO; soft deprecation already landed)
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

- ~~[Switch.vue] (help)~~ ✅ resolved 2026-05-11 — `help` prop → `#help` slot с text-fallback (без `v-html`) — see [switch.md Issue 1](./switch.md)
- ~~[InputLayout.vue:294, 313]~~ (help, messageInvalid) — affects ALL form-controls — ✅ resolved 2026-05-11 — see [inputlayout.md Issue 1](./inputlayout.md). Slots `#help` / `#messageInvalid` с text-node fallback. Cross-cutting forwarding в 5 form-controls — follow-up PR.
- ~~[Select.vue:553, 562, 564]~~ (marker, noData ×2) ✅ resolved 2026-05-11 — see [select.md Issue 1](./select.md). `#marker` scoped slot + `#empty` slot + safe substring helper `splitByQuery`/`markerParts` — никакого `v-html`.
- ~~[Form.vue:380] (select-marker copy)~~ ✅ resolved 2026-06-03 — `#item`-override удалён, Form переиспользует безопасный default Select — [form.md Issue 1](./form.md)
- [Table.vue:1842, 1939, 1999, 2011, 2026](../../lib/table/Table.vue#L1842) (cell, summary, noData/Column/Filter ×3) — [table.md Issue 1](./table.md)
- ~~[Menu.vue:388, 392] (item.info ×2)~~ ✅ resolved 2026-06-06 — оба `v-html` → `#item-info` scoped slot с text-fallback — see [menu.md Issue 1](./menu.md)
- ~~[Accordion.vue:149](../../lib/accordion/Accordion.vue#L149) (item.subtitle)~~ ✅ resolved 2026-05-11 — see [accordion.md Issue 1](./accordion.md)
- ~~[Alert.vue:263](../../lib/alert/Alert.vue#L263) (subtitle)~~ ✅ resolved 2026-05-11 — see [alert.md Issue 1](./alert.md)

**Memory leaks (observers/listeners без cleanup):**

- ~~Select ResizeObserver + keydown listeners~~ ✅ resolved 2026-05-11 ([select.md Issue 2](./select.md)) — `let resizeObserver` + `onBeforeUnmount` disconnect + removeEventListener для обоих keydown handlers.
- ~~Calendar MutationObserver на documentElement~~ ([calendar.md Issue 1](./calendar.md)) ✅ resolved 2026-05-11
- ~~Pagination anonymous ResizeObserver~~ ✅ resolved 2026-06-06 ([pagination.md Issue 1](./pagination.md))
- ~~InputLayout 2× anonymous ResizeObservers~~ ✅ resolved 2026-05-11 ([inputlayout.md Issue 2](./inputlayout.md))
- Table IntersectionObserver + window mousemove/up partial cleanup ([table.md Issue 2](./table.md))
- Dialog escapeListener при unmount-while-open ([dialog.md Issue 2](./dialog.md))

**FishtVueSymbol race-condition:** [config.md Issue 1](./config.md).
~~**Alert imperative DOM bypass Vue:**~~ ✅ resolved 2026-05-11 — `openAlert` переписан на `createApp(Alert, rootProps)` + Vue emit chain ([alert.md Issue 2](./alert.md)).

### 🟠 High cross-cutting

**Distribution/packaging** (sideEffects, exports map, peer-deps): затрагивает все 22 компонента — [button.md Issue 8 и 9](./button.md), [calendar.md Issue 2, 3](./calendar.md).
**SSR style injection (C17):** дубль `Component.initStyle()` в каждом из 22 SFC — [component-class.md Issue 1](./component-class.md).
~~**`unstyled: true` не реализован (L53):**~~ ✅ resolved 2026-05-11 — `Component.setStyle()` guard в [lib/component/index.ts:138](../../lib/component/index.ts#L138). Cross-cutting fix — все 22 компонента, использующие базовый класс, теперь респектят `unstyled: true` config. См. [component-class.md Issue 6](./component-class.md).
**`componentsStyle` global fallback inconsistent (L53):** Button/Aria/TextEditor не имеют (resolved: ~~Input~~ 2026-05-11, ~~Select~~ 2026-05-11, ~~Badge~~ 2026-05-10, ~~Calendar~~ 2026-05-11) — см. [button.md Issue 13](./button.md), [input.md Issue 2](./input.md).
**Theme runtime API не реализован (L53):** [theme.md Issue 1](./theme.md).
**A11y (focus trap, ARIA roles, keyboard navigation):** см. список в Wave 4.
**FixWindow Floating UI integration:** [fixwindow.md Issue 1, 2, 3](./fixwindow.md).

### 🟡 Medium cross-cutting

**RTL не поддерживается:** буквальные `left/right` во всех компонентах — Wave 8.1.
**`prefers-reduced-motion` не учитывается:** Wave 10.1.
**Locale fallback chain отсутствует:** Wave 3.5.
**Hardcoded colors через Tailwind primitives:** Wave 9.
**Dual-API gap для Table/Form/Select/~~Menu~~/~~Accordion~~:** Wave 6 (Menu ✅ 2026-06-06 — `<MenuItem>`/`<MenuGroup>`; Accordion ✅ 2026-06-14 — `<AccordionItem>`).

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
