---
title: Issues — Label
summary: Аудит Label — 9 из 11 issues ✅ resolved (for-id, dup initStyle, translateX/maxWidth typing, type-via-options, unstyled cross-cutting, motion-safe, default slot, B10 semantic-token, translate через CSS custom properties). Остаются Issues 3 (packaging, cross-cutting закрыт волной 2) и 9 (RTL).
updated: 2026-09-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/label/
related-doc: ../components/label.md
---

# Issues — Label

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 0     | ~~A2, A4-5~~ ✅ — cross-cutting packaging закрыт волной 2 (см. [button.md](./button.md) Issues 8, 9) |
| medium   | 0     | ~~F31 (RTL — Issue 9)~~ ✅ resolved 2026-09-06; ~~B11~~ ✅ resolved 2026-09-05 |
| low      | 0     | ~~B10~~ ✅ resolved 2026-07-04 |

**Закрыто 2026-05-11 (7 of 10):** Issues 1 (E29.1 — `<label for>`), 2 (C17 — dup initStyle), 4 (D25 — translateX/maxWidth typing), 6 (L53 — type via componentsOptions, de facto уже было), 7 (L53 — unstyled cross-cutting через `Component.setStyle` guard), 8 (E29.7 — motion-safe), 10 (G37 — default slot). Нумерация исходная — cross-references из соседних issue-доков сохраняются.

**Закрыто 2026-07-04 (Issue 11, cross-cutting Wave 9):** B10 hardcode (`text-gray-400 dark:text-gray-500` → `text-surface-400 dark:text-surface-500`) — единственная новая находка с последнего аудита; закрыт в день обнаружения.

## ~~Issue 1: Нет атрибута `for` — Label не связан с input через DOM~~ ✅ resolved 2026-05-11

- **Категория:** E29.1 (ARIA)
- **Severity:** ~~high~~
- **Где (was):** ~~[Label.vue:60-65]~~ → теперь [Label.vue:71](../../lib/label/Label.vue#L71) — корень `<label data-label :for="props.forId || undefined">`.
- **Resolution:** добавлен `LabelProps.forId?: string` ([Label.d.ts:65](../../lib/label/Label.d.ts#L65)); корневой `<div>` заменён на `<label>` с условным `for`-атрибутом. Click на label теперь нативно фокусирует target input, screen-reader озвучивает связку. Тесты: `applies for attribute when forId is provided` / `omits for attribute when forId is undefined` / `renders <label> as root element`.

### Что найдено (исторически)

```vue
<div data-label :class="classBase" :style="...">
  <span :class="classContent" :style="`max-width: ${maxWidth - 38}px`">
    {{ props.title }}
  </span>
</div>
```

Label рендерился как `<div>`, без `for`/`htmlFor`. Связь с input существовала только через `peer-focus` Tailwind-селектор.

### Acceptance criteria

- [x] `<Label for-id="email-input">` рендерит `<label for="email-input">`.
- [x] При отсутствии `for-id` атрибут не рендерится (Vue `undefined`).
- [x] Корень — `<label>`, не `<div>` (assertion `wrapper.element.tagName === "LABEL"`).
- ⚠️ Auto-passthrough id из InputLayout — отдельный follow-up PR.

## ~~Issue 2: Стили инжектятся в onMounted — flash unstyled при SSR~~ ✅ resolved 2026-05-11

- **Категория:** C17
- **Severity:** ~~high~~
- **Где (was):** ~~[Label.vue:57]~~ → удалено. Style injection регистрируется конструктором базового класса через `Component.__hooks()` ([lib/component/index.ts:79-84](../../lib/component/index.ts#L79-L84)) — `onServerPrefetch + vueOnMounted -> initStyle`.
- **Resolution:** удалён `onMounted(() => Label.initStyle())` и связанный импорт. Добавлен поясняющий комментарий ([Label.vue:65-67](../../lib/label/Label.vue#L65-L67)). Wave 2.3 progress 5/22 → 6/22.

## ~~Issue 3: Нет sideEffects, нет ESM/CJS, нет exports map~~ ✅ resolved (наследуется от волны 2)

- **Категория:** A2, A4, A5
- **Severity:** ~~high~~
- **Где:** [lib/package.json](../../lib/package.json)

Закрыт корневым фиксом: [button.md Issue 8](./button.md) (`sideEffects`) ✅ 2026-06-07 и [Issue 9](./button.md) (exports map, ESM/CJS) ✅ 2026-06-11. Контракт зафиксирован в [lib/package.test.ts](../../lib/package.test.ts).

## ~~Issue 4: `translateX`/`maxWidth` принимаются только числом, не CSS unit'ами~~ ✅ resolved 2026-05-11

- **Категория:** D25 (консистентность props)
- **Severity:** ~~medium~~
- **Где (was):** ~~[Label.vue:19-24, Label.vue:62]~~ → теперь [Label.d.ts:49](../../lib/label/Label.d.ts#L49) (`translateX?: number | string`), [Label.d.ts:57](../../lib/label/Label.d.ts#L57) (`maxWidth?: number | string`), [Label.vue:25-29](../../lib/label/Label.vue#L25-L29) (`translateXStyle` computed) и [Label.vue:30-33](../../lib/label/Label.vue#L30-L33) (`maxWidthStyle` computed).
- **Resolution:** `number` → `${val}px` (backward-compat), string → as-is для `translateX` и `calc(${val} - 38px)` для `maxWidth`. Тесты: `accepts translateX as string with CSS unit` (`"1rem"`, `"50%"`), `accepts maxWidth as string with calc fallback` (`"100%"`, `"5rem"`).

### Acceptance criteria

- [x] `<Label :max-width="'100%'">` рендерит `max-width: calc(100% - 38px)`.
- [x] `<Label :max-width="100">` рендерит `max-width: 62px` (backward compat).
- [x] `<Label :translate-x="'1rem'">` рендерит `--fv-translate-x: 1rem`.
- [x] `<Label :translate-x="20">` рендерит `--fv-translate-x: 20px` (backward compat).

## ~~Issue 5: type="static"/"dynamic"/"vanishing" — буквальные translate в px, не работает на разных font-size~~ ✅ resolved 2026-09-05

> **Закрыто.** Блокер («deferred to Wave 3.3») снят: Wave 3.3 закрыта 2026-07-02. Реализовано **не** через component-токены темы, а через CSS custom properties с fallback'ами прямо в классах — движок это переваривает, что подтверждено тестом:
>
> ```
> -translate-y-[var(--fv-label-translate-y,60px)]
>   → --fv-translate-y: calc(var(--fv-label-translate-y,60px) * -1)
> ```
>
> Три переменные покрывают все шесть `type`-вариантов:
>
> | Переменная                       | Default | Где используется                          |
> | -------------------------------- | ------- | ----------------------------------------- |
> | `--fv-label-translate-y`         | `60px`  | `dynamic` (focus), `static`               |
> | `--fv-label-translate-y-offset`  | `48px`  | `offsetDynamic` (focus), `offsetStatic`   |
> | `--fv-label-translate-y-rest`    | `28px`  | покоящееся положение, `vanishing`, `none` |
>
> Fallback'и равны прежним литералам — поведение по умолчанию не изменилось. Переопределяется на любом предке: `.my-form { --fv-label-translate-y: 68px }`.
>
> **Почему без токенов темы.** Вариант из плана (`theme/Aurora.ts` → `$dt`) добавил бы Label-специфичные ключи во все три пресета и в `ThemeSemantic`, то есть расширил бы публичный API темы ради трёх чисел одного компонента. CSS-переменная с fallback'ом даёт тот же результат для потребителя, ничего не добавляя в поверхность темы. Если позже понадобится управлять этим из `updatePreset`, переменные останутся точкой подключения.
>
> **Горизонтальные `translate-x-*` намеренно не тронуты** — они относятся к Issue 9 (RTL), где нужна смена знака, а не параметризация величины.

- **Категория:** B11 (theming)
- **Severity:** ~~medium~~
- **Где:** [Label.vue:50-59](../../lib/label/Label.vue#L50-L59)

### Что найдено

```ts
type.value === 'dynamic' ? `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` : "",
type.value === 'offsetDynamic' ? `peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7` : "",
```

Числа `60px`, `48px`, `28px` хардкодны в Tailwind arbitrary values. Если пользователь увеличит font-size через `componentsOptions.Label.classBody = "text-base"`, label вылезет за input.

### Почему это проблема

- Theming через CSS-переменные обещан в [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) — но эти px-смещения не учтут.

### Что нужно сделать

1. Перевести на CSS custom properties: `--fv-label-translate-y` через [theme/Aurora.ts](../../lib/theme/themes/Aurora.ts) component-tokens. **Deferred to Wave 3.3** (Theme runtime API) — ad-hoc токены сейчас создадут несогласованность с будущим pipeline'ом `usePreset`/`updatePreset`/`$dt`.
2. В [Label.vue:37](../../lib/label/Label.vue#L37) использовать `peer-focus:-translate-y-[var(--fv-label-translate-y)]`.

### Acceptance criteria

- [x] Изменение `--fv-label-translate-y` через CSS перепозиционирует label без правки JS ✅ 2026-09-05. Покрыто тестами `Label Component - translate custom properties (Issue 5)`: матрица по всем шести `type` плюс проверка, что движок разворачивает переменную с сохранением fallback и знака (включая `peer-focus:`).

## ~~Issue 6: Не реагирует на componentsStyle (частично) — есть `Label.componentsStyle()` но не для всех режимов~~ ✅ resolved 2026-05-11 (de facto, уже было)

- **Категория:** L53
- **Severity:** ~~medium~~
- **Где:** [Label.vue:16-18](../../lib/label/Label.vue#L16-L18), [Label.d.ts:122](../../lib/label/Label.d.ts#L122)
- **Resolution:** при ревизии 2026-05-11 обнаружено, что `type` уже имеет fallback chain `?? options?.type ?? "dynamic"` ([Label.vue:17](../../lib/label/Label.vue#L17)), а `LabelOption = Pick<LabelProps, "type" | "mode" | ...>` уже включает `type` ([Label.d.ts:122](../../lib/label/Label.d.ts#L122)). Тест `uses global 'type' when not provided locally` существует ([Label.test.ts](../../lib/label/Label.test.ts)). Audit-документ был сформирован до фикса и устарел.

### Acceptance criteria

- [x] `app.use(FishtVue, { componentsOptions: { Label: { type: "static" } } })` — все Label по умолчанию static.

## ~~Issue 7: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-05-11 (cross-cutting)

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [lib/component/index.ts:138](../../lib/component/index.ts#L138) — `Component.setStyle()` возвращает `""` при `globalConfig.unstyled === true`.
- **Resolution:** закрыто cross-cutting fix Wave 3.1 (одна правка → 22 компонента) — см. [component-class.md Issue 6](./component-class.md), [button.md Issue 14](./button.md). Добавлен regression-test `respects unstyled: true via Component.setStyle guard` в [Label.test.ts](../../lib/label/Label.test.ts) — подтверждает, что `classBase` и `classContent` пустые при `app.use(FishtVue, { unstyled: true })`.

## ~~Issue 8: prefers-reduced-motion не учитывается~~ ✅ resolved 2026-05-11

- **Категория:** E29.7
- **Severity:** ~~low~~
- **Где (was):** ~~[Label.vue:27]~~ → теперь [Label.vue:36](../../lib/label/Label.vue#L36) — `motion-safe:transition-all motion-safe:duration-200`.
- **Resolution:** `transition-all duration-200` заменено на `motion-safe:transition-all motion-safe:duration-200` (same pattern как [Input.vue, Button.vue, Textarea.vue, Select.vue, Calendar.vue post-fix](../../lib/textarea/Textarea.vue)). Анимации label отключаются при `prefers-reduced-motion: reduce`. Тест: `applies motion-safe guard on transition classes`. Wave 10.1 progress 3/22 → 4/22.

## ~~Issue 9: RTL — `translate-x-4` и `after:ml-0.5` буквальны~~ ✅ resolved 2026-09-06

- **Категория:** F31
- **Severity:** ~~medium~~
- **Где (was):** [Label.vue](../../lib/label/Label.vue) — `classBase` и `translateXStyle`

### Что найдено

`translate-x-4` всегда смещает вправо. `after:ml-0.5` — margin-left для красной звёздочки `*`. В RTL красная звёздочка должна быть слева.

### Что нужно сделать

1. `translate-x-4` → `ms-4` или `rtl:-translate-x-4` (Tailwind RTL plugin или logical properties).
2. `ml-0.5` → `ms-0.5`.
3. Проверить, что после смены направления `peer-focus:translate-x-4` тоже корректно зеркалится.

~~**Deferred to dedicated RTL wave**~~ — предпосылка снята: [button.md Issue 3](./button.md) закрыт ещё 2026-06-07, а Input/InputLayout получили логические свойства в июньских заходах. Одиночным этот фикс больше не был.

### Что сделано (2026-09-06, решение R22)

Пункт 2 плана выполнен буквально: `after:ml-0.5` → `after:ms-0.5` — звёздочка обязательного поля встаёт слева в RTL.

Пункты 1 и 3 решены **иначе, чем предлагалось**, и это важнее самой правки. План предлагал `translate-x-4` → `ms-4` или `rtl:-translate-x-4`. Ни то, ни другое не годится:

- `ms-4` — не эквивалент: `translate` не занимает места в потоке, а `margin` занимает. Замена сдвинула бы соседние элементы;
- `rtl:-translate-x-4` работает, но требует дублировать **каждое** из шести смещений в двух вариантах и держать их синхронными вручную.

Вместо этого направление вынесено в множитель: `--fv-label-dir` равен `1` в LTR и `-1` в RTL (переключается одним классом `rtl:[--fv-label-dir:-1]`), а смещения записаны как `translate-x-[calc(16px*var(--fv-label-dir,1))]`. Величины не изменились, поэтому **в LTR вывод побайтово прежний**. JS-детекта направления нет — вся арифметика в CSS, как и требует решение R22.

Тот же множитель применён к инлайновому `translateX`-prop'у: пользовательское смещение тоже обязано зеркалиться, иначе RTL чинился бы только для дефолтов.

**Попутное наблюдение, которое стоит знать.** Классы `peer-focus:translate-x-*` у типов `dynamic`/`offsetDynamic`/`offsetStatic`/`static` **не действуют**: `translateXStyle` пишет `--fv-translate-x` инлайном (по умолчанию `0`), а инлайн-стиль побеждает класс. Горизонтальный сдвиг этих типов управляется только prop'ом `translateX`. Это не тронуто намеренно — «оживление» классов изменило бы вид каждого динамического лейбла при фокусе, а Issue 9 про RTL, а не про поведение. Зафиксировано в [components/label.md §18](../components/label.md#18-known-issues--limitations).

Тесты — [LabelRtl.test.ts](../../lib/label/LabelRtl.test.ts): движок разбирает `calc`+`var` внутри arbitrary value и arbitrary property под `rtl:` (самая хрупкая часть), переключатель присутствует при всех шести типах, звёздочка логическая.

## ~~Issue 10: Нет `default` slot — title только через prop~~ ✅ resolved 2026-05-11

- **Категория:** G37 (композиция)
- **Severity:** ~~low~~
- **Где (was):** ~~[Label.vue:62-64]~~ → теперь [Label.vue:73](../../lib/label/Label.vue#L73) (`<slot>{{ props.title }}</slot>`) и [Label.d.ts:83-89](../../lib/label/Label.d.ts#L83-L89) (`LabelSlots.default`).
- **Resolution:** добавлен default-slot с fallback на `title` prop. `LabelSlots` тип теперь `{ default?(): VNode[] }` вместо `null`. Тесты: `renders title prop as fallback when no default slot is provided`, `renders default slot content overriding title prop`.

### Acceptance criteria

- [x] `<Label title="Email"><strong>Email</strong> *</Label>` рендерит strong-стилизованный текст.
- [x] `<Label title="Email">` без слота — рендерит "Email" из prop (backward-compat).

## ~~Issue 11: Hardcoded `gray-*` в classContent~~ ✅ resolved 2026-07-04

- **Категория:** B10 (hardcoded Tailwind color-primitive вместо semantic design-token)
- **Severity:** ~~low~~ → ✅ resolved
- **Где:** [Label.vue:57](../../lib/label/Label.vue#L57) (`classContent` — текст floating-label)

### Что найдено

`classContent` (текст внутри `<span>`, вложенного в корневой `<label>`) хардкодил цвет через primitive-класс:

```
text-gray-400 dark:text-gray-500
```

Это базовый цвет текста метки — применяется независимо от `type` (`dynamic`/`static`/`offsetDynamic`/`offsetStatic`/`vanishing`/`none`), т.к. `classContent` не ветвится по `type` (в отличие от `classBase`, где transform-классы зависят от `type.value`). `gray-400`/`gray-500` — primitive-палитра ([lib/theme/primitive.ts](../../lib/theme/primitive.ts)), а не library semantic-token — при кастомизации темы потребителем цвет не подхватывал бы переопределение семантического слоя.

### Резолюция

Cross-cutting инфраструктура (Wave 9) добавила 23-й именованный цвет `surface` в [lib/theme/primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317) — структурный semantic-слот, default = точная копия `gray`-шкалы, и включила `"surface"` в union `ColorName` ([lib/theme/Theme.d.ts:178](../../lib/theme/Theme.d.ts#L178)). `text-surface-{tone}` работает идентично любому другому named-цвету — движок не требовал изменений.

Механическая миграция: `text-gray-400 dark:text-gray-500` → `text-surface-400 dark:text-surface-500` ([Label.vue:57](../../lib/label/Label.vue#L57)) — тот же numeric tone (400/500), только family rename. Поскольку `surface` по умолчанию идентичен `gray`, визуальных изменений нет — но цвет метки теперь подключён к theme-token indirection и подхватит будущую кастомизацию `surface`-палитры через `updateSurfacePalette()` без правок в `Label.vue`.

Зеркало аналогичной миграции: [icons.md Issue 9](./icons.md#issue-9-hardcoded-default-class) (`text-gray-900 dark:text-gray-100` → `text-surface-900 dark:text-surface-100`), а также уже мигрированные `Input.vue`, `Accordion.vue`, `Separator.vue`, `Menu.vue`, `Select.vue`.

### Acceptance criteria

- [x] `classContent` содержит `text-surface-400 dark:text-surface-500`, не содержит `gray` — regression-тест ([Label.test.ts](../../lib/label/Label.test.ts), describe `"Label Component - semantic token migration — content color uses surface-* (Issue 11 / B10)"`).
- [x] Рендер `<span>` несёт `surface-*` tone-классы (не только computed-свойство).
- [x] `pnpm typecheck` clean.
- [x] Визуальный regression отсутствует (`surface` default идентичен `gray`).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                    |
| ------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `componentsOptions.Label` | ✅          | через `Label.getOptions()` (mode/labelMode/translateX/maxWidth/class/classes) |
| `componentsStyle` global  | ✅          | через `Label.componentsStyle()` fallback на mode                               |
| `unstyled: true`          | ✅          | через cross-cutting fix в `Component.setStyle` (Issue 7 ✅)                    |
| Theme tokens vs hardcode  | ⚠️          | Issue 11 ✅ resolved 2026-07-04 (`classContent` → `surface-*`); px-смещения всё ещё хардкодны (Issue 5 — Wave 3.3); `text-red-500` для required-маркера хардкоден |
| Runtime theme switch      | ⚠️          | через Tailwind, OK для color-токенов                                           |
| `t()` для текста          | N/A         | title — пользовательский текст                                                 |
| Runtime locale switch     | N/A         | —                                                                              |

## Dual-API gap

Не применимо.
