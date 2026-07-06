---
title: Issues — Uno engine (tailwind())
summary: Аудит покрытия Tailwind v4 собственным движком tailwind() (lib/theme/unoStyle). Эмпирический прогон ~360 классов (2026-07-02). Волна 1 — Issues 1, 3, 7 (fail-closed + dev-warn) ✅. Волна 2 (2026-07-02) — Issue 5 (диалект-контракт + v4-имена) и Issue 6 (modern transform properties) ✅; в Issues 2/4 закрыты дешёвые пункты (arbitrary properties, space-*, font smoothing, v4-варианты словарей). Открыты остаточные пробелы Issue 2 (функциональные варианты, container queries) и Issue 4 (P2/P3-семейства).
updated: 2026-07-02
audit-checklist: покрытие Tailwind v4 (utilities + variants) — целевой аудит вне 60-пунктового чек-листа
source: lib/theme/unoStyle/
related-doc: ../architecture/theme.md
---

# Issues — Uno engine (`tailwind()`)

Целевой аудит собственного движка [tailwind.ts](../../lib/theme/unoStyle/tailwind.ts) против словаря **Tailwind v4.1**. Методика: эмпирический прогон ~360 репрезентативных классов через `tailwind(cls, { selector: ".fishtvue-probe" })` с инспекцией фактического CSS-вывода (не только «вернулась ли строка»). Канон-решение «остаёмся на собственном движке» (ратифицировано 2026-07-02) этот аудит **не пересматривает** — он фиксирует пробелы диалекта, которые нужно закрыть или явно задокументировать.

## Сводка

| Severity | Count | Categories                                                                                                              |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| critical | 0     | —                                                                                                                       |
| high     | 0     | ~~silent degradation, false positives~~ — Issues 1, 3 ✅ resolved 2026-07-02                                            |
| medium   | 2     | Issue 2 (остаток: функциональные варианты, container queries), Issue 4 (остаток: P2/P3-семейства); Issues 5, 6 ✅ волна 2 |
| low      | 0     | ~~stale TODO~~ — Issue 7 ✅ resolved 2026-07-02                                                                         |

Что при этом **работает корректно** (проверено выводом): все базовые interaction/form/structural states (`hover:`…`autofill:`), pseudo-elements (`before:`/`after:` через `--fv-content`, `placeholder:`, `file:`, `marker:`, `selection:`, `backdrop:`…), `group`/`peer` включая именованные (`group-hover/edit:`) и arbitrary-формы (`group-[.is-published]:`, `peer-[.is-dirty]:`, `group-has-[a]:`), `has-[...]:`, `aria-*` (статические и `aria-[sort=ascending]:`), `data-[state=open]:`, `dark:` (media + selector-режим), breakpoints `sm:`…`2xl:` + `max-*:` + `min-[600px]:`, `motion-safe/reduce:`, `print:`, `rtl:/ltr:` (через ":where([dir])"), `*:`, stacked-варианты (`dark:md:hover:`), arbitrary variants — в т.ч. `[&>[data-active]+span]:text-blue-600`, `[&_p]:mt-4`, `[&::-webkit-inner-spin-button]:`, opacity-модификаторы (`bg-red-500/75`, `bg-black/[.06]`), v4 var-shorthand (`w-(--w)`, `p-(--sp)`, `top-(--my-top)`), `text-sm/6`, fractions/negatives для spacing/inset, `subgrid`, `dvh/svh/lvh` (в `w-`/`h-`), `content-['...']`, `animate-*` (keyframes — [baseStyle.ts:671-699](../../lib/config/baseStyle.ts#L671)), `divide-*` + `divide-x-reverse`, logical properties (`ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`rounded-ss-`/`border-s-`). **С волны 2 (2026-07-02) также:** arbitrary properties `[prop:value]`/`[--var:value]`, `space-x/y-*` (+negative/reverse/arbitrary), `antialiased`/`subpixel-antialiased`, boolean `data-<name>:`, именованные `has-<state>:`/`group-has-<state>:`, `optional:`/`user-valid:`/`user-invalid:`/`inert:`/`details-content:`, media `pointer-*`/`any-pointer-*`/`inverted-colors:`/`noscript:`, v4-имена `shadow-2xs`/`shadow-xs`/`drop-shadow-xs`/`outline-hidden`; transforms — modern properties (`translate:`/`rotate:`/`scale:`, skew — в `transform:`).

## Issue 1: Silent degradation — три режима тихого отказа без диагностики ✅ resolved 2026-07-02

- **Категория:** DX / correctness (механизм)
- **Severity:** ~~high~~ → resolved
- **Где:** [tailwind.ts:104](../../lib/theme/unoStyle/tailwind.ts#L104), [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts), потребление — [component/index.ts `setStyle`](../../lib/component/index.ts#L134)

**Резолюция (2026-07-02):** движок переведён на fail-closed контракт — все три режима устранены:

- **Режим 3** — variant-токены разбираются depth-aware split'ом по `:` на глубине 0 ([splitTopLevelSegments, tailwind.ts:73](../../lib/theme/unoStyle/tailwind.ts#L73)) и каждый валидируется якорным `^…$`-матчем того же паттерна, которым парсит `getModifier` ([variantValidationReg, tailwind.ts:51](../../lib/theme/unoStyle/tailwind.ts#L51)) — parser и validator не расходятся. Нераспознанный вариант (`not-hover:`, `@sm:`, `group-aria-*:`, `**:`, `[@media(…)]:`) → правило НЕ генерируется. Попутно закрыты ловушки Issue 2: `@sm:` больше не эмитит viewport-`@media`, `**:` — не эмитит `> *`.
- **Режим 2** — guard значения ([invalidValueReg, tailwind.ts:61](../../lib/theme/unoStyle/tailwind.ts#L61)): пустое значение, литерал `undefined` (включая вклейку без границ слова — `ms-[undefinedpx]`), пустая функция `()`, пустая декларация стандартного свойства `prop: ;` → правило дропается. Пустой reset custom property (`--fv-blur: ;` у `blur-none`) — легитимен и пропускается.
- **Режим 1 + все дропы** — dev-only `console.warn` `[FishtVue tailwind] class "…" was dropped: <reason>` под `process.env.NODE_ENV !== "production"` с дедупом по имени класса ([warnUnsupported, tailwind.ts:64](../../lib/theme/unoStyle/tailwind.ts#L64)).
- Бонус: устранено crash-семейство `TypeError` в правилах transforms — `rotate-x-45`, `translate-z-4`, `scale-3d` (v4 3D-формы) роняли `getValue` на `groups.axis`/`groups.special`; теперь `if (!groups) return` → fail-closed + warn.
- Тесты: [failClosed.test.ts](../../lib/theme/unoStyle/failClosed.test.ts) (92 кейса: 3 режима + regression-блок байт-в-байт по baseline движка до фикса).
- Сандбокс-верификация: из head исчез мусор `.font-asap { undefined }` (FixWindow), `.focus-visible\:ring-ring { undefined }` (Split), `margin-inline-start: undefinedpx` (Select→FixWindow); остальные style-теги — байт-в-байт (SHA-256 сверка 24 тегов). Вскрытые компонентные баги Select/Split вынесены в отдельную задачу (chip).

### Что найдено

Движок никогда не сообщает о нераспознанном классе. Отказ проявляется одним из трёх режимов, и все три молчаливые:

1. **Класс не генерируется вовсе** — `tailwind()` возвращает `undefined`, `setStyle` пропускает. Пример из канона: `[appearance:textfield]` в [Input.vue:88](../../lib/input/Input.vue#L88) — правило отсутствует в head, никто не заметил (задача на arbitrary properties уже создана отдельно).
2. **Генерируется правило с литералом "undefined" или пустым значением** — `getValue()` вернул `undefined`/пустую строку, но шаблон всё равно интерполирует: `.x.clear-both { undefined }`, `.x.shadow-xs { undefined }`, `.x.transition-discrete { transition-property: ; }`, `.x.blur-xs { --fv-blur: blur(); … }`, `.x.min-h-dvh { min-height: ; }`. Мусор попадает в `<style>`-тег.
3. **Вариант не распознан — правило генерируется БЕЗ условия варианта**: `not-hover:opacity-75` эмитится как безусловный `opacity: 0.75` (класс, который должен применяться «только вне hover», применяется всегда). Это хуже отсутствия CSS: поведение визуально ломается непредсказуемо. Полный список таких вариантов — Issue 2.

### Почему это проблема

- Пробелы покрытия невозможно обнаружить иначе как визуальной регрессией: ни warn, ни ошибки, ни маркера в CSS.
- Режим 3 генерирует **активный неверный CSS** — классы потребителя из `props.class`/`options.class` могут молча изменить вид компонента.
- Режим 2 замусоривает style-теги невалидными декларациями.

### Что нужно сделать

1. ~~Dev-mode `console.warn` (`process.env.NODE_ENV !== "production"`) в двух точках: (а) `tailwind()` вернул `undefined`; (б) `getValue()` вернул `undefined`/`""` — с именем класса и компонента.~~ ✅ (без имени компонента — warn живёт в движке, дедуп по классу)
2. ~~Guard в обеих return-ветках: `value` falsy → return `undefined` (устраняет режим 2 как класс багов).~~ ✅
3. ~~Для режима 3 — валидация: если в классе остался нераспознанный `<something>:`-префикс после разбора, не генерировать правило вовсе (fail-closed вместо fail-open) + warn.~~ ✅
4. ~~Тесты: по одному кейсу на каждый режим (RED сейчас — GREEN после фикса).~~ ✅ [failClosed.test.ts](../../lib/theme/unoStyle/failClosed.test.ts)

## Issue 2: Пробелы в вариантах Tailwind v4 (states, relational, container queries)

- **Категория:** coverage (variants)
- **Severity:** ~~high~~ → **medium** (2026-07-02: вредная часть — режим 3 Issue 1 — устранена fail-closed'ом; остался чистый coverage gap)
- **Где:** [unoStatic.ts](../../lib/theme/unoStyle/unoStatic.ts) (словари модификаторов), [tailwind.ts `getModifier`](../../lib/theme/unoStyle/tailwind.ts#L218)

> **Примечание (2026-07-02, после закрытия Issue 1):** все перечисленные ниже варианты теперь **дропаются с dev-warn**, а не генерируют правило без условия. `@sm:` больше не эмитит viewport-`@media` (ловушка закрыта fail-closed), `**:` не эмитит `> *`, `[@media(…)]:` не эмитит мусорный селектор. Открытым остаётся именно покрытие: реализовать варианты либо явно объявить их вне диалекта (Issue 5, док диалекта).
>
> **Волна 2 (2026-07-02):** дешёвые словарные пункты закрыты (зачёркнуто ниже): `optional:`/`user-valid:`/`user-invalid:` ([unoStatic.ts:568](../../lib/theme/unoStyle/unoStatic.ts#L568)), `inert:` ([unoStatic.ts:601](../../lib/theme/unoStyle/unoStatic.ts#L601)), `details-content:` ([unoStatic.ts:596](../../lib/theme/unoStyle/unoStatic.ts#L596)), `pointer-*`/`any-pointer-*`/`inverted-colors:`/`noscript:` ([unoStatic.ts:626](../../lib/theme/unoStyle/unoStatic.ts#L626)), boolean `data-<name>:` и именованные `has-<state>:`/`group-has-<state>:`/`peer-has-<state>:` — расширение `modifierTokenSource` ([tailwind.ts:47-53](../../lib/theme/unoStyle/tailwind.ts#L47-L53)); неизвестное имя `has-*` дропается fail-closed. Тесты — [v4Extensions.test.ts](../../lib/theme/unoStyle/v4Extensions.test.ts). Диалект-границы остального зафиксированы в [architecture/theme.md](../architecture/theme.md) (Issue 5).

### Что найдено

Все перечисленные ниже варианты деградировали по режиму 3 Issue 1 (правило без условия; с 2026-07-02 — fail-closed drop + warn), кроме помеченных иначе:

**Pseudo-classes (не в словарях):**

- ~~`optional:` → нет `:optional`~~ ✅ волна 2
- ~~`user-valid:` / `user-invalid:` (v4)~~ ✅ волна 2
- `nth-3:`, `nth-last-2:`, `nth-of-type-2:`, `nth-[3n+1]:` (v4 functional nth)
- ~~`details-content:` (v4.1, `::details-content`)~~ ✅ волна 2
- ~~`inert:` (v4, `[inert]`-селектор)~~ ✅ волна 2
- `starting:` (v4, `@starting-style` — нужна поддержка вложенного at-rule)

**Relational / negation (v4):**

- вся семья `not-*:` — `not-hover:`, `not-first:`, `not-dark:`, `not-supports-[...]:` (CSS `:not()` / `@media not`)
- `in-*:` (v4 implicit group: `in-focus:` = `:where(*:focus) &`)
- ~~именованные has-формы: `has-checked:`, `has-hover:` (bracket-форма `has-[...]:` работает)~~ ✅ волна 2 (резолв по pseudo-словарям, неизвестное имя — fail-closed)
- ~~`peer-has-*:`, `group-has-<name>:` (bracket-форма `group-has-[a]:` работает)~~ ✅ волна 2 (has-ветка внутри optional state-префикса)
- композиции `group-aria-*:` и `group-data-[...]:` — генерируются без group-условия

**Attribute shorthand (v4):**

- ~~boolean `data-active:` → должен давать `[data-active]` (форма `data-[k=v]:` работает)~~ ✅ волна 2

**Media-варианты (не в `media`-словаре):**

- ~~`pointer-fine:` / `pointer-coarse:` / `pointer-none:`, `any-pointer-*:` (v4.1)~~ ✅ волна 2
- ~~`inverted-colors:` (v4.1)~~ ✅ волна 2
- ~~`noscript:` (v4.1)~~ ✅ волна 2
- именованный `supports-<feature>:` (напр. `supports-backdrop-filter:`; bracket-форма `supports-[display:grid]:` работает)

**Container queries (v4 core):**

- утилита `@container` не генерируется вовсе (режим 1)
- `@sm:` / `@max-md:` / `@min-[475px]:` генерируют **viewport** `@media (min-width…)` вместо `@container (min-width…)` — символ `@` не участвует в разборе, `sm` матчится обычным breakpoint'ом. Это false positive: CSS валиден, но семантика другая
- именованные контейнеры `@sm/main:` — правило без условия

**Прочее:**

- `**:` (v4 descendants) генерирует `> *` — то же, что `*:` (прямые дети), а должен быть ` *` (все потомки)
- important-модификатор игнорируется в обеих формах: `!text-red-500` (v3) и `text-red-500!` (v4) — класс экранируется в селектор, `!important` не добавляется
- arbitrary at-rule variant `[@media(hover:hover)]:underline` → мусорный селектор `…underline@media(hover:hover)` (невалидный CSS)

### Почему это проблема

- Потребитель, приходящий из Tailwind v4, ожидает этот синтаксис в `props.class`/`options.class` — и получает молча неверное поведение (не отсутствие стиля, а стиль без условия).
- Container queries — одна из главных фич v4; текущий `@sm:` — ловушка (работает «почти как надо» на full-width контейнерах и ломается на остальных).

### Что нужно сделать

1. ~~Дешёвые словарные дополнения (в `unoStatic.ts`): `optional`, `user-valid`, `user-invalid`, `inert`, `details-content`, `pointer-*`/`any-pointer-*`, `inverted-colors`, `noscript` — по образцу существующих записей.~~ ✅ волна 2
2. Функциональные варианты: `nth-*` (динамический паттерн как `aria`/`data` в `selectorsDynamic`); ~~boolean `data-<name>` fallback → `[data-name]`~~ ✅ волна 2 (aria-boolean не входит — в v4 его нет).
3. `not-*:` — рекурсивная обёртка над существующими словарями (`:not(<resolved>)` / `@media not <resolved>`).
4. Композиции `group-/peer- × aria-/data-` — расширить state-ветку `getModifier`; ~~× has-<name>~~ ✅ волна 2.
5. Container queries: `@container`-утилита + разбор `@<bp>:` в `@container`-media (+именованные контейнеры) — ~~либо осознанно объявить «не поддерживается» в доке диалекта и закрыть fail-closed (Issue 1.3)~~ fail-closed достигнут 2026-07-02; полноценная реализация — открыта.
6. `**:` → ` *`; important-суффикс/префикс → `!important` в декларации; ~~`starting:`/`[@media(…)]:`-at-rule формы — fail-closed до реализации~~ ✅ fail-closed 2026-07-02.

## Issue 3: False positives — валидный на вид, но неверный CSS ✅ resolved 2026-07-02

- **Категория:** correctness
- **Severity:** ~~high~~ → resolved (residual: v4-семантика bare var-shorthand — остаётся в Issue 5)
- **Где:** [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts) (regex-матчинг), [unoStatic.ts](../../lib/theme/unoStyle/unoStatic.ts)

**Резолюция (2026-07-02):**

- `mask-*`/`perspective-*` — блоклист «чужих» семейств ([unsupportedFamilyReg, tailwind.ts:55](../../lib/theme/unoStyle/tailwind.ts#L55)) → fail-closed + warn; gradient stops больше не портятся.
- `scale-3d` — `\b` после `\d+` в reg правила `scale` → не матчится как `0.03` (fail-closed).
- Минус у `-rotate-*` / `-scale-*` / `-hue-rotate-*` / `-order-*` — `(?<negative>-)?` в reg + обёртка `negative()` (зеркало `sizing()`) → `calc(<value> * -1)`. **Side effect — багфикс живого канона:** `rtl:-scale-x-100` в [Menu.vue:212](../../lib/menu/Menu.vue#L212) и [Pagination.vue:182-183](../../lib/pagination/Pagination.vue#L182) генерировал `--fv-scale-x: 1` (RTL-зеркалирование иконок не работало), теперь `calc(1 * -1)`.
- Шкалы дозаполнены: `rounded-xs`/`rounded-4xl` (borderSize: 0.125rem/2rem), `blur-xs`/`blur-2xs`/`backdrop-blur-xs` (4px/2px), `object-top-left`-семейство и `bg-top-left`-семейство (двухсловные позиции), `items-baseline-last` → `last baseline`, container scale для `basis-`/`min-w-` (зеркало `w`), viewport-юниты для `min-h`/`max-h`, `min-h-screen` (singleStyles, зеркало `max-h-screen`), `clear-both`.
- `text-(--brand)`/`bg-(--brand)` (v4-семантика color) — **не менялось**: breaking-решение диалекта, трекается в Issue 5.
- Тесты: [failClosed.test.ts](../../lib/theme/unoStyle/failClosed.test.ts) («Issue 3 — false positives» + regression-блок).

### Что найдено

Классы, которые матчились **не тем правилом** и эмитили активный неверный CSS (все строки таблицы, кроме двух последних, закрыты 2026-07-02; последние две — Issue 5):

| Класс                                                      | Сгенерировано                                                                                      | Должно быть (v4)                                                                                                                |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mask-t-from-50%`, `mask-b-to-90%`, `mask-radial-from-75%` | `--fv-gradient-from-position: 50%` (матч правила `from`/`to` — **ломает gradient stops** элемента) | mask-image градиенты                                                                                                            |
| `scale-3d`                                                 | `--fv-scale-x: 0.03`                                                                               | `scale: … … …` (3D)                                                                                                             |
| `perspective-origin-top`                                   | `transform-origin: top` (матч `origin`)                                                            | `perspective-origin: top`                                                                                                       |
| `-rotate-45`, `-scale-100`, `-hue-rotate-15`, `-order-1`   | минус теряется → положительное значение                                                            | негативное значение (для `-m-4`/`-top-4`/`-translate-y-1/2` минус работает — обработка негатива есть только в `sizing()`-ветке) |
| `rounded-xs` (v4), `rounded-4xl` (v4)                      | fallback `0.25rem`                                                                                 | `0.125rem` / `2rem`                                                                                                             |
| `object-top-left`, `bg-top-left` (v4.1)                    | `…-position: top` (второе слово теряется)                                                          | `top left` (v3-форма `bg-left-top` работает)                                                                                    |
| `items-baseline-last` (v4.1)                               | `align-items: baseline`                                                                            | `align-items: last baseline`                                                                                                    |
| `blur-xs`/`blur-2xs`/`backdrop-blur-xs` (v4)               | `blur()` — пустой аргумент, декларация невалидна                                                   | `blur(4px)` / `blur(2px)`                                                                                                       |
| `basis-3xs` (v4 container scale)                           | `flex-basis: ;`                                                                                    | `16rem`-шкала (в `w-` шкала `xs…7xl` есть, в `basis-`/`min-h-` — нет)                                                           |
| `min-h-dvh`, `min-h-svh/lvh`                               | `min-height: ;`                                                                                    | `100dvh` (regex `min-h`/`max-h` не включает viewport-юниты, в `h-`/`w-` включает)                                               |
| `clear-both`                                               | `{ undefined }`                                                                                    | `clear: both` (при этом `clear-start`/`clear-left` работают)                                                                    |
| `text-(--brand)`                                           | `font-size: var(--brand)`                                                                          | в v4 bare var-shorthand у `text-` = **color**                                                                                   |
| `bg-(--brand)`                                             | `background-position: var(--brand)`                                                                | в v4 = **background-color**                                                                                                     |

### Почему это проблема

- Строка вида `mask-*` в пользовательском классе портит gradient-переменные соседних утилит того же элемента — трудноотлаживаемая связь.
- Потеря минуса у transforms инвертирует направление анимаций/сдвигов.
- Всё это не ловится Issue-1-диагностикой «вернулся undefined» — нужен контроль значений.

### Что нужно сделать

1. ~~Fail-closed по префиксу: завести список известных «чужих» префиксов (`mask-`, `perspective-`, …) и не отдавать их соседним правилам, пока семейство не реализовано.~~ ✅
2. ~~Пробросить обработку `negative` в правила `rotate`/`scale`/`hue-rotate`/`order` (зеркало `sizing()`).~~ ✅
3. ~~Дозаполнить шкалы: `rounded` (xs, 4xl), `blur` (xs, 2xs), container-scale для `basis-`/`min-w-`, viewport-юниты для `min-h`/`max-h`, двухсловные позиции `top-left`-семейства, `items-baseline-last`.~~ ✅
4. Решить семантику bare var-shorthand для color-утилит (`text-(--x)`/`bg-(--x)`/`border-(--x)` → color, как в v4) — это breaking для текущего поведения, зафиксировать в доке диалекта → **перенесено в Issue 5** (там уже трекается той же строкой).

## Issue 4: Недостающие utility-семейства (Tailwind v4.1)

- **Категория:** coverage (utilities)
- **Severity:** medium (P1 закрыт волной 2, открыты P2/P3)
- **Где:** [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts), [unoStatic.ts `singleStyles`](../../lib/theme/unoStyle/unoStatic.ts)

> **Волна 2 (2026-07-02) — приоритет 1 закрыт:** arbitrary properties `[prop:value]`/`[--var:value]` — новая ветка в `tailwind()` ([arbitraryPropertyReg, tailwind.ts:70](../../lib/theme/unoStyle/tailwind.ts#L70), ветка — [tailwind.ts:203](../../lib/theme/unoStyle/tailwind.ts#L203); value с `{`/`}`/`;` дропается fail-closed — инъекция за пределы декларации невозможна; `_`→пробел как в arbitrary values); канон-баг `[appearance:textfield]` ([Input.vue:88](../../lib/input/Input.vue#L88), [Aria.vue:66](../../lib/aria/Aria.vue#L66)) закрыт — правило появилось в head. `space-x/y-*` (+negative, +reverse, +arbitrary) — правило `space` ([unoRules.ts:672](../../lib/theme/unoStyle/unoRules.ts#L672)) + [spaceBetween, unoStatic.ts:465](../../lib/theme/unoStyle/unoStatic.ts#L465), селектор — зеркало `divide`. `antialiased`/`subpixel-antialiased` — singleStyles ([unoStatic.ts:23](../../lib/theme/unoStyle/unoStatic.ts#L23)). Тесты — [v4Extensions.test.ts](../../lib/theme/unoStyle/v4Extensions.test.ts).

### Что найдено

Не генерируются вовсе (режим 1 Issue 1), по категориям:

- ~~**Spacing:** `space-x-*` / `space-y-*` / `-space-*` / `space-*-reverse`~~ ✅ волна 2
- **Typography:** ~~`antialiased` / `subpixel-antialiased` (TODO «Font Smoothing»)~~ ✅ волна 2; `wrap-anywhere` / `wrap-break-word` / `wrap-normal` (v4.1), `font-stretch-*` (v4.1)
- **Backgrounds — v4 gradient API:** `bg-linear-to-*` / `bg-linear-<angle>` / interpolation-модификаторы (`bg-linear-to-r/oklch`), `bg-radial(-[...])`, `bg-conic(-<angle>)`; также `bg-size-[...]` (v3-форма `bg-gradient-to-*` работает)
- **Effects:** вся семья `mask-*` (v4.1: `mask-image`/`mask-clip`/`mask-origin`/`mask-position`/`mask-repeat`/`mask-size`/`mask-type` + linear/radial/conic от-до), `text-shadow-*` (v4.1), `inset-shadow-*` / `inset-ring-*` (v4), ~~`shadow-xs`/`shadow-2xs` (v4-шкала)~~ ✅ волна 2 (Issue 5)
- **Filters:** `filter-none` / `backdrop-filter-none`, цветной `drop-shadow-<color>` (v4.1), ~~`drop-shadow-xs`~~ ✅ волна 2 (Issue 5)
- **Borders:** ~~`outline-hidden` (v4)~~ ✅ волна 2 (Issue 5)
- **Transforms — v4 3D:** `rotate-x/y/z-*`, `translate-z-*`, `scale-z-*`, unified `skew-<n>`, `perspective-*`, `perspective-origin-*`, `transform-3d` / `transform-flat` / `transform-gpu` / `transform-none`, `backface-visible/hidden`
- **Interactivity:** `scheme-*` (color-scheme, v4), `field-sizing-*` (v4)
- **Accessibility:** `forced-color-adjust-auto/none`
- **Transitions:** `transition-discrete` / `transition-normal` (v4; сейчас режим 2 — `transition-property: ;`)
- ~~**Special syntax:** arbitrary properties `[prop:value]` (в т.ч. `[appearance:textfield]` из канона Input — отдельная задача уже создана), установка custom property `[--var:value]`~~ ✅ волна 2

### Почему это проблема

- Компонентный канон уже наступил на один из пробелов (Input); словари компонентов растут — вероятность повторения растёт.
- Для потребителя `options.class` — это «Tailwind, который местами не работает», без документации границ.

### Что нужно сделать

1. ~~Приоритет 1 (используется/близко к канону): arbitrary properties, `space-*`, `antialiased`, `transition-discrete`-заглушка (fail-closed).~~ ✅ волна 2
2. Приоритет 2 (v4-паритет по запросу потребителей): 3D transforms, v4 gradient API, `text-shadow`, `inset-shadow`/`inset-ring`, `field-sizing`, `scheme`. Modern transform properties (Issue 6 ✅) — готовая база для 3D-форм.
3. Приоритет 3 (осознанно объявить вне диалекта): `mask-*` — большая семья; fail-closed уже стоит (Issue 3 ✅), границы зафиксированы в доке диалекта (Issue 5 ✅).
4. Каждый пункт — tests-first в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts)-стиле.

## Issue 5: Semantic drift — v4 renames и сдвиг шкал ✅ resolved 2026-07-02 (волна 2)

- **Категория:** compat / documentation
- **Severity:** ~~medium~~ → resolved
- **Где:** [unoStatic.ts](../../lib/theme/unoStyle/unoStatic.ts) (шкалы), док диалекта — [architecture/theme.md](../architecture/theme.md)

**Резолюция (2026-07-02, решение владельца — «дозаполнить v4-имена, без миграции шкал»):**

- Контракт диалекта зафиксирован разделом «Диалект Tailwind» в [architecture/theme.md](../architecture/theme.md): база — словарь v3.4, общие имена (`shadow-sm`, `blur-sm`, `rounded`, `ring`, `outline-none`, bare var-shorthand) сохраняют v3-семантику; поддержанные v4-расширения и границы «вне диалекта» перечислены таблицами.
- Добавлены только отсутствующие v4-имена с v4-значениями: `shadow-2xs`/`shadow-xs` ([boxShadow, unoStatic.ts:244](../../lib/theme/unoStyle/unoStatic.ts#L244)), `drop-shadow-xs`, `outline-hidden` ([unoStatic.ts:51](../../lib/theme/unoStyle/unoStatic.ts#L51)) — ноль breaking changes для словарей 22 компонентов.
- Семантика bare var-shorthand (`text-(--x)` → font-size) сознательно оставлена как есть и записана в таблицу расхождений диалекта.
- Тесты — [v4Extensions.test.ts](../../lib/theme/unoStyle/v4Extensions.test.ts) (v4-имена + regression общих имён байт-в-байт).

### Что найдено

Словарь движка — Tailwind **v3.4**. v4 переименовал/сдвинул шкалы, и общие имена теперь означают разное:

| Класс                            | Движок (v3-семантика)                           | Tailwind v4                                                                       |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `shadow-sm` / `shadow`           | old sm / old base                               | v4: `shadow-xs` / `shadow-sm` (сдвиг шкалы; `shadow-xs` сейчас → `{ undefined }`) |
| `blur-sm` / `blur`               | 4px / 8px                                       | v4: `blur-xs` = 4px, `blur-sm` = 8px                                              |
| `rounded-sm` / `rounded`         | 0.125rem / 0.25rem                              | v4: `rounded-xs` = 0.125rem, `rounded-sm` = 0.25rem                               |
| `outline-none`                   | `outline: 2px solid transparent`                | v4: `outline-style: none`; «невидимый outline» переехал в `outline-hidden`        |
| `ring`                           | 3px (v3 default)                                | v4 default 1px, `ring-3` = 3px (сама `ring-3` работает)                           |
| `drop-shadow-sm` / `drop-shadow` | old-шкала                                       | v4 сдвиг аналогично shadow                                                        |
| bare var-shorthand color-утилит  | `text-(--x)` → font-size, `bg-(--x)` → position | v4: color (см. Issue 3)                                                           |

### Почему это проблема

Класс, скопированный из v4-доки или сгенерированный v4-инструментом, тихо даёт другое значение. Это не баг реализации, а **непроявленный контракт**: нигде не записано, какой диалект поддержан.

### Что нужно сделать

1. ~~Зафиксировать контракт в `Documentation/architecture/`: «движок реализует словарь Tailwind v3.4 + перечисленные v4-расширения; шкалы shadow/blur/rounded/ring — v3-семантика». Раздел с этой таблицей.~~ ✅
2. ~~Решить (после п.1) — мигрировать ли шкалы на v4 (breaking change для существующих словарей компонентов) или добавить только отсутствующие v4-имена (`shadow-xs`, `blur-xs`, `rounded-4xl`, `outline-hidden`) с v4-значениями, не трогая общие.~~ ✅ решение: только дозаполнение (blur-xs/rounded-4xl были закрыты Issue 3, shadow-xs/2xs, drop-shadow-xs, outline-hidden — волной 2).

## Issue 6: Двойной translate при комбинации `translate-*` с `rotate-*`/`scale-*`/`skew-*` ✅ resolved 2026-07-02 (волна 2)

- **Категория:** correctness (composition)
- **Severity:** ~~medium~~ → resolved
- **Где:** [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts) (`translate` vs legacy `transform`-цепочка), [baseStyle.ts:17-23](../../lib/config/baseStyle.ts#L17)

**Резолюция (2026-07-02, решение владельца — modern properties, v4-подход):**

- `rotate-*` эмитит независимое свойство `rotate:` напрямую ([unoRules.ts:1102](../../lib/theme/unoStyle/unoRules.ts#L1102)); `scale-*` — `--fv-scale-x/y` + `scale: var(…)` ([baseScale, unoStatic.ts:9](../../lib/theme/unoStyle/unoStatic.ts#L9)); `translate-*` — без изменений (уже был modern). В `transform:`-цепочке остался только `skew` ([baseSkew, unoStatic.ts:10](../../lib/theme/unoStyle/unoStatic.ts#L10)); константа `baseTransform` удалена. Порядок применения — спецификация CSS: translate → rotate → scale → transform, как в Tailwind v4.
- `transition-transform` и bare `transition` расширены до `transform, translate, scale, rotate` ([transitionProperty, unoStatic.ts:302](../../lib/theme/unoStyle/unoStatic.ts#L302)) — анимации rotate/scale (иконки Accordion) продолжают работать после переезда на properties.
- **Намеренное изменение байтов CSS** (визуальное поведение идентично, комбинаций transforms в каноне нет): sandbox-diff — Accordion −757 (rotate без цепочки), Pagination −148 (`rtl:-scale-x-100`), Select/Form/Icons +23 (transition-список). Поведенческая верификация в sandbox: computed `rotate: 90deg` при `transform: none`; `scale: -1 1` при `dir=rtl`.
- Тесты — [v4Extensions.test.ts](../../lib/theme/unoStyle/v4Extensions.test.ts) (новые точные строки + тест независимости translate/rotate), re-baseline transform-ожиданий в Uno.test.ts / Uno.improved.test.ts / failClosed.test.ts.

### Что найдено

`translate-x-4` эмитит **современное** property: `--fv-translate-x: 1rem; translate: var(--fv-translate-x) var(--fv-translate-y);`. А `rotate-45`/`scale-*`/`skew-*` эмитят **legacy-цепочку**: `transform: translate(var(--fv-translate-x), var(--fv-translate-y)) rotate(var(--fv-rotate)) …`. При комбинации `translate-x-4 rotate-45` на одном элементе сдвиг применяется дважды: через `translate:` (1rem) и через `translate()` внутри `transform:` (тот же `--fv-translate-x` = 1rem) → фактически 2rem.

### Почему это проблема

Классическая Tailwind-комбинация «сдвинуть и повернуть» (`-translate-y-1/2 rotate-45` у tooltip-стрелок и т.п.) даёт удвоенный сдвиг. В канонных словарях компонентов комбинация пока не встречается — но доступна потребителю через `props.class`.

### Что нужно сделать

~~Выбрать один механизм: либо `translate` тоже эмитит legacy `transform:`-цепочку (минимальный дифф), либо вся четвёрка переезжает на независимые modern properties `translate:`/`rotate:`/`scale:` (v4-подход, чище, но требует пересмотра `--fv-*`-дефолтов в baseStyle и regression-прогона словарей). Тест на комбинацию — обязателен.~~ ✅ выбран v4-подход; `--fv-*`-дефолты в baseStyle не менялись (не требуется: `--fv-scale-x/y: 1` и `--fv-skew-x/y: 0` продолжают обслуживать `baseScale`/`baseSkew`; `--fv-rotate` больше не читается — осталась мёртвой переменной, вычищать её — значит менять байты BaseComponent-тега, отложено до ближайшей правки baseStyle).

## Issue 7: Stale TODO — «Animation» давно реализован ✅ resolved 2026-07-02

- **Категория:** code hygiene
- **Severity:** ~~low~~ → resolved
- **Где:** [tailwind.ts:234](../../lib/theme/unoStyle/tailwind.ts#L234)

### Что найдено

Хвостовой комментарий `// TODO Space Between / Font Smoothing / Animation`. Первые два актуальны (см. Issue 4), но `animate-*` полностью работает: правило `animate` в unoRules (включая arbitrary `animate-[wiggle_1s_…]`) + `@keyframes spin/ping/pulse/bounce` в [baseStyle.ts:671-699](../../lib/config/baseStyle.ts#L671).

### Что нужно сделать

~~Удалить `Animation` из TODO (или заменить комментарий ссылкой на этот файл, чтобы список пробелов жил в одном месте).~~ ✅ TODO-хвост заменён ссылкой на этот файл — список пробелов живёт в одном месте (Issues 2, 4).

## Known issues & limitations

- Аудит эмпирический: прогон ~360 репрезентативных классов, по одному-два на семейство. Внутри поддержанных семейств возможны точечные пробелы значений, не пойманные пробами.
- Проверялась генерация CSS-строки, не визуальный рендер: корректность значений сверялась с v4-документацией, не с эталонным выводом Tailwind CLI.
- Оценка «работает» для цветов относится к var-indirection формату `rgb(var(--fv-…, R G B))` — канон Wave 3.3, а не к v4 oklch-палитре (осознанное расхождение, вне скоупа).
