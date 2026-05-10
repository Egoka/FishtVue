---
title: Issues — Label
summary: Аудит Label — отсутствие связки for-id с input, SSR-стили, Tailwind hardcode, неподдержка unstyled.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/label/
related-doc: ../components/label.md
---

# Issues — Label

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 4 | A2, A4-5, C17, E29.1 |
| medium | 3 | F31, L53, B11 |
| low | 2 | E29.7, G37 |

## Issue 1: Нет атрибута `for` — Label не связан с input через DOM

- **Категория:** E29.1 (ARIA)
- **Severity:** high
- **Где:** [Label.vue:60-65](../../lib/label/Label.vue#L60-L65)

### Что найдено

```vue
<div data-label :class="classBase" :style="...">
  <span :class="classContent" :style="`max-width: ${maxWidth - 38}px`">
    {{ props.title }}
  </span>
</div>
```

Label рендерится как `<div>`, а не `<label>`. Нет атрибута `for`/`htmlFor`. Связь с input существует только через `peer-focus` Tailwind-селектор и визуальное позиционирование.

### Почему это проблема

- Screen reader не объявит "Email — input" связкой; пользователь услышит "Email" и отдельно "input field" без ассоциации.
- Click на label не фокусирует input (нативное поведение `<label for>` сломано).
- WCAG 2.1 SC 1.3.1 (Info and Relationships) — нарушение.

### Что нужно сделать

1. Поменять корень `<div>` на `<label :for="forId">`.
2. Добавить prop `forId?: string` в [Label.d.ts](../../lib/label/Label.d.ts).
3. В [InputLayout.vue](../../lib/inputlayout/InputLayout.vue) пробрасывать input id наружу как `for`-target. Поскольку Label обычно используется внутри InputLayout — InputLayout автоматически прокидывает id.
4. Тест: click на label → focus на input.

### Acceptance criteria

- [ ] `<Label for-id="email-input">` рендерит `<label for="email-input">`.
- [ ] Click на label фокусирует target input.
- [ ] axe-core a11y-тест проходит.

## Issue 2: Стили инжектятся в onMounted — flash unstyled при SSR

- **Категория:** C17
- **Severity:** high
- **Где:** [Label.vue:57](../../lib/label/Label.vue#L57)

См. [button.md Issue 1](./button.md) — идентичный fix-план.

## Issue 3: Нет sideEffects, нет ESM/CJS, нет exports map

- **Категория:** A2, A4, A5
- **Severity:** high
- **Где:** [lib/package.json](../../lib/package.json), [lib/label/package.json](../../lib/label/package.json)

См. [button.md Issue 8 и Issue 9](./button.md) — cross-cutting fix.

## Issue 4: `translateX`/`maxWidth` принимаются только числом, не CSS unit'ами

- **Категория:** D25 (консистентность props)
- **Severity:** medium
- **Где:** [Label.vue:19-24](../../lib/label/Label.vue#L19-L24), [Label.vue:62](../../lib/label/Label.vue#L62)

### Что найдено

```ts
const translateX = computed(() => props?.translateX ?? options?.translateX ?? 0)
const maxWidth = computed(() => props?.maxWidth ?? options?.maxWidth ?? 0)
...
<span :style="`max-width: ${maxWidth - 38}px`">
```

`maxWidth - 38` — магическое число. `translateX` — без единиц. Пользователь не может задать `maxWidth: "100%"` или `translateX: "1rem"`.

### Почему это проблема

- Responsive layout с `max-width: 100%` невозможен.
- Hard-coded `38px` — внутреннее значение (отступ from icon?), не задокументировано.

### Что нужно сделать

1. Принять `translateX?: number | string` (`number` → `${val}px`, string → as-is).
2. То же для `maxWidth`.
3. Документировать `38px` magic как `LABEL_INNER_PADDING` константу с пояснением.

### Acceptance criteria

- [ ] `<Label :max-width="'100%'">` корректно рендерит `max-width: calc(100% - 38px)` или эквивалент.

## Issue 5: type="static"/"dynamic"/"vanishing" — буквальные translate в px, не работает на разных font-size

- **Категория:** B11 (theming)
- **Severity:** medium
- **Где:** [Label.vue:28-33](../../lib/label/Label.vue#L28-L33)

### Что найдено

```ts
type.value === 'dynamic' ? `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` : "",
type.value === 'offsetDynamic' ? `peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7` : "",
```

Числа `60px`, `48px`, `28px` хардкодны в Tailwind arbitrary values. Если пользователь увеличит font-size через `componentsOptions.Label.classBody = "text-base"`, label вылезет за input.

### Почему это проблема

- Theming через CSS-переменные обещан в [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) — но эти px-смещения не учтут.

### Что нужно сделать

1. Перевести на CSS custom properties: `--fv-label-translate-y` через [theme/Aurora.ts](../../lib/theme/themes/Aurora.ts) component-tokens.
2. В [Label.vue:28](../../lib/label/Label.vue#L28) использовать `peer-focus:-translate-y-[var(--fv-label-translate-y)]`.

### Acceptance criteria

- [ ] Изменение `--fv-label-translate-y` через CSS перепозиционирует label без правки JS.

## Issue 6: Не реагирует на componentsStyle (частично) — есть `Label.componentsStyle()` но не для всех режимов

- **Категория:** L53
- **Severity:** medium
- **Где:** [Label.vue:13-15](../../lib/label/Label.vue#L13-L15)

### Что найдено

```ts
const mode = computed(() => props?.mode ?? options?.mode ?? Label.componentsStyle() ?? "outlined")
```

Label корректно подбирает global `componentsStyle` ✅. Но `type` (dynamic/static/vanishing/none) — конфигурируется только локально, без global fallback. Это inkonsistent — некоторые поведенческие настройки доступны глобально, некоторые нет.

### Что нужно сделать

1. В [Label.d.ts](../../lib/label/Label.d.ts) `LabelOption`-тип расширить чтобы принимал `type` тоже.
2. В [Label.vue](../../lib/label/Label.vue) добавить `?? options?.type` chain.

### Acceptance criteria

- [ ] `app.use(FishtVue, { componentsOptions: { Label: { type: "static" } } })` — все Label по умолчанию static.

## Issue 7: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high
- **Где:** [Label.vue:25-47](../../lib/label/Label.vue#L25-L47)

См. [button.md Issue 14](./button.md) — cross-cutting fix.

## Issue 8: prefers-reduced-motion не учитывается

- **Категория:** E29.7
- **Severity:** low
- **Где:** [Label.vue:27](../../lib/label/Label.vue#L27)

`transition-all duration-200` без `motion-safe:` guard. См. [button.md Issue 10](./button.md).

## Issue 9: RTL — `translate-x-4` и `after:ml-0.5` буквальны

- **Категория:** F31
- **Severity:** medium
- **Где:** [Label.vue:28-33](../../lib/label/Label.vue#L28-L33), [Label.vue:36](../../lib/label/Label.vue#L36)

### Что найдено

`translate-x-4` всегда смещает вправо. `after:ml-0.5` — margin-left для красной звёздочки `*`. В RTL красная звёздочка должна быть слева.

### Что нужно сделать

1. `translate-x-4` → `ms-4` или `rtl:-translate-x-4` (Tailwind RTL plugin или logical properties).
2. `ml-0.5` → `ms-0.5`.
3. Проверить, что после смены направления `peer-focus:translate-x-4` тоже корректно зеркалится.

## Issue 10: Нет `default` slot — title только через prop

- **Категория:** G37 (композиция)
- **Severity:** low
- **Где:** [Label.vue:62-64](../../lib/label/Label.vue#L62-L64)

### Что найдено

```vue
<span :class="classContent">{{ props.title }}</span>
```

Title рендерится как text node из prop. Невозможно вставить `<strong>`, иконку, бейдж, другую разметку.

### Что нужно сделать

1. Добавить `<slot name="default">{{ props.title }}</slot>` — fallback к prop сохраняется.
2. В [Label.d.ts](../../lib/label/Label.d.ts) `LabelSlots`:
   ```ts
   export declare type LabelSlots = {
     default?(): VNode[]
   }
   ```

### Acceptance criteria

- [ ] `<Label title="Email"><strong>Email</strong> *</Label>` рендерит strong-стилизованный текст.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Label` | ✅ | через `Label.getOptions()` (mode/type/translateX/maxWidth/class/classBody) |
| `componentsStyle` global | ✅ | через `Label.componentsStyle()` fallback на mode |
| `unstyled: true` | ❌ | Issue 7 |
| Theme tokens vs hardcode | ⚠️ | px-смещения хардкодны (Issue 5); `text-red-500` для required-маркера хардкоден |
| Runtime theme switch | ⚠️ | через Tailwind, OK для color-токенов |
| `t()` для текста | N/A | title — пользовательский текст |
| Runtime locale switch | N/A | — |

## Dual-API gap

Не применимо.
