---
title: Issues — Label
summary: Аудит Label — 7 из 10 issues ✅ resolved 2026-05-11 (for-id, dup initStyle, translateX/maxWidth typing, type-via-options, unstyled cross-cutting, motion-safe, default slot). Остаются Issues 3 (packaging), 5 (CSS vars), 9 (RTL) — все cross-cutting волны.
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/label/
related-doc: ../components/label.md
---

# Issues — Label

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 1     | A2, A4-5   |
| medium   | 2     | B11, F31   |
| low      | 0     | —          |

**Закрыто 2026-05-11 (7 of 10):** Issues 1 (E29.1 — `<label for>`), 2 (C17 — dup initStyle), 4 (D25 — translateX/maxWidth typing), 6 (L53 — type via componentsOptions, de facto уже было), 7 (L53 — unstyled cross-cutting через `Component.setStyle` guard), 8 (E29.7 — motion-safe), 10 (G37 — default slot). Нумерация исходная — cross-references из соседних issue-доков сохраняются.

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

## Issue 3: Нет sideEffects, нет ESM/CJS, нет exports map

- **Категория:** A2, A4, A5
- **Severity:** high
- **Где:** [lib/package.json](../../lib/package.json), [lib/label/package.json](../../lib/label/package.json)

См. [button.md Issue 8 и Issue 9](./button.md) — cross-cutting fix Wave 2.1 (root-level packaging).

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

## Issue 5: type="static"/"dynamic"/"vanishing" — буквальные translate в px, не работает на разных font-size

- **Категория:** B11 (theming)
- **Severity:** medium
- **Где:** [Label.vue:37-42](../../lib/label/Label.vue#L37-L42)

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

- [ ] Изменение `--fv-label-translate-y` через CSS перепозиционирует label без правки JS.

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
- **Resolution:** `transition-all duration-200` заменено на `motion-safe:transition-all motion-safe:duration-200` (same pattern как [Input.vue, Button.vue, Aria.vue, Select.vue, Calendar.vue post-fix](../../lib/aria/Aria.vue)). Анимации label отключаются при `prefers-reduced-motion: reduce`. Тест: `applies motion-safe guard on transition classes`. Wave 10.1 progress 3/22 → 4/22.

## Issue 9: RTL — `translate-x-4` и `after:ml-0.5` буквальны

- **Категория:** F31
- **Severity:** medium
- **Где:** [Label.vue:37-42](../../lib/label/Label.vue#L37-L42), [Label.vue:44](../../lib/label/Label.vue#L44)

### Что найдено

`translate-x-4` всегда смещает вправо. `after:ml-0.5` — margin-left для красной звёздочки `*`. В RTL красная звёздочка должна быть слева.

### Что нужно сделать

1. `translate-x-4` → `ms-4` или `rtl:-translate-x-4` (Tailwind RTL plugin или logical properties).
2. `ml-0.5` → `ms-0.5`.
3. Проверить, что после смены направления `peer-focus:translate-x-4` тоже корректно зеркалится.

**Deferred to dedicated RTL wave** — cross-cutting (Button Issue 3 тоже не закрыт). Одиночный label-fix без InputLayout/Input создаст несогласованность.

## ~~Issue 10: Нет `default` slot — title только через prop~~ ✅ resolved 2026-05-11

- **Категория:** G37 (композиция)
- **Severity:** ~~low~~
- **Где (was):** ~~[Label.vue:62-64]~~ → теперь [Label.vue:73](../../lib/label/Label.vue#L73) (`<slot>{{ props.title }}</slot>`) и [Label.d.ts:83-89](../../lib/label/Label.d.ts#L83-L89) (`LabelSlots.default`).
- **Resolution:** добавлен default-slot с fallback на `title` prop. `LabelSlots` тип теперь `{ default?(): VNode[] }` вместо `null`. Тесты: `renders title prop as fallback when no default slot is provided`, `renders default slot content overriding title prop`.

### Acceptance criteria

- [x] `<Label title="Email"><strong>Email</strong> *</Label>` рендерит strong-стилизованный текст.
- [x] `<Label title="Email">` без слота — рендерит "Email" из prop (backward-compat).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                    |
| ------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `componentsOptions.Label` | ✅          | через `Label.getOptions()` (mode/type/translateX/maxWidth/class/classBody)     |
| `componentsStyle` global  | ✅          | через `Label.componentsStyle()` fallback на mode                               |
| `unstyled: true`          | ✅          | через cross-cutting fix в `Component.setStyle` (Issue 7 ✅)                    |
| Theme tokens vs hardcode  | ⚠️          | px-смещения хардкодны (Issue 5 — Wave 3.3); `text-red-500` для required-маркера хардкоден |
| Runtime theme switch      | ⚠️          | через Tailwind, OK для color-токенов                                           |
| `t()` для текста          | N/A         | title — пользовательский текст                                                 |
| Runtime locale switch     | N/A         | —                                                                              |

## Dual-API gap

Не применимо.
