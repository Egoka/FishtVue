---
title: Issues — Button (resolved)
summary: Закрытые issues компонента Button. Активные — в ../button.md. Этот документ — архив с описанием resolution для cross-reference из других issue-доков (особенно motion-safe и ref-forwarding patterns).
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/button/
related-doc: ../../components/button.md
---

# Issues — Button (resolved)

Архив 5 закрытых Button-issues. Активные (11 штук — SSR styles, RTL, polymorphic, packaging, `componentsStyle`, `unstyled`, print, dark-mode) находятся в [../button.md](../button.md).

Issue-номера сохраняют первоначальную нумерацию (gaps), чтобы cross-references из соседних issue-файлов не ломались — это `done/button.md Issue 4`, не `done/button.md Issue 1`.

## Сводка (resolved)

| Severity | Count | Categories      |
| -------- | ----- | --------------- |
| high     | 1     | E29.1           |
| medium   | 1     | G34             |
| low      | 3     | D26, E29.7, G37 |

## ~~Issue 2: Icon-кнопки без aria-label — screen reader озвучивает «button» без назначения~~ ✅ resolved 2026-05-10

- **Категория:** E29.1 (ARIA-роли и атрибуты)
- **Severity:** ~~high~~
- **Где:** [Button.vue:382–390](../../../lib/button/Button.vue#L382-L390)
- **Resolution:** добавлен `ariaLabel?: string` в `BaseButtonProps`; computed `resolvedAriaLabel` делает fallback на имя иконки для `type="icon"`; `onMounted` dev-warning при unlabeled icon-кнопке без default-slot.

### Что найдено

```vue
<button ref="buttonRef" data-button :type="type === 'icon' ? 'button' : type" ...>
  <template v-if="type === 'icon'">
    <Icons v-if="icon" :type="icon" :class="classIcon" />
    ...
  </template>
```

Когда `type="icon"`, у `<button>` нет текстового slot, нет `aria-label`, `aria-labelledby`, и `<Icons>` рендерит SVG без `aria-label`. Screen reader озвучивает кнопку как «button» без указания назначения.

### Почему это проблема

- WCAG 2.1 SC 4.1.2 (Name, Role, Value) — нарушение.
- Пользователи скрин-ридеров не могут идентифицировать кнопку.
- Documentation [components/button.md](../../components/button.md) §12.1 это уже отметил, но не было фикса.

### Acceptance criteria

- [x] Тест: `mount(Button, { props: { type: "icon", icon: "trash", ariaLabel: "Delete user" } })` — assert `wrapper.attributes('aria-label')` is `"Delete user"`.
- [x] Тест dev-warning: без ariaLabel и без default slot — emitted `console.warn` с префиксом `[FishtVue Button]`.
- [ ] axe-core lint в `Button.test.ts` (если будет добавлен) проходит для icon-кнопки.

## ~~Issue 4: buttonRef не exposed — пользователь не может programmatically focus/blur~~ ✅ resolved 2026-05-10

- **Категория:** G34 (Ref на корневой элемент)
- **Severity:** ~~medium~~
- **Где:** [Button.vue:344–366](../../../lib/button/Button.vue#L344-L366)
- **Resolution:** `buttonRef`, `focus(options?)`, `blur()` добавлены в `defineExpose`; `ButtonExpose` расширен с JSDoc; `focus()` принимает опциональный native `FocusOptions` (`{ preventScroll }`). Паритет с [Aria](../../components/aria.md) и [Input](../../components/input.md).

### Что найдено

```ts
const buttonRef = ref<HTMLButtonElement>()
...
defineExpose({
  mode, size, rounded, color, classBase, classIcon  // нет buttonRef
})
```

Reactive ref `buttonRef` определён, но не возвращён через `defineExpose`. Пользователь не может через `useTemplateRef<typeof Button>` дотянуться до DOM-узла для `.focus()`, `.click()`, `.scrollIntoView()`.

### Почему это проблема

- Form-флоу с auto-focus on error: «после submit-валидации сфокусироваться на первой невалидной кнопке/поле» — невозможно без хака `document.querySelector`.
- Nuxt Auto-focus плагины не работают.
- Сейчас вынуждены делать `document.querySelector("[data-button]")` — fragile + collide при множественных кнопках.

### Acceptance criteria

- [x] `useTemplateRef<typeof Button>("btn").value?.focus()` фокусирует кнопку.
- [x] Тест: `wrapper.vm.focus()` → `expect(document.activeElement).toBe(wrapper.find('button').element)`.

## ~~Issue 10: Анимации без `prefers-reduced-motion` guard~~ ✅ resolved 2026-05-10

- **Категория:** E29.7 (prefers-reduced-motion)
- **Severity:** ~~low~~
- **Где:** [Button.vue:26](../../../lib/button/Button.vue#L26)
- **Resolution:** `transition-colors duration-200` → `motion-safe:transition-colors motion-safe:duration-200`. Tailwind transpилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`, что эквивалентно требуемому поведению.
- **Scope note:** cross-cutting motion-safe для остальных 21 компонента — открытый Wave 10.1 в [issues/README.md](../README.md). Этот fix покрывает только Button; референсы из других issue-доков (label/split/input/alert/pagination/menu/fixwindow/select) на «button.md Issue 10» теперь указывают сюда — паттерн зафиксирован.

### Что найдено

```ts
"transition-colors duration-200"
```

`transition-colors` всегда применяется. Пользователи с `@media (prefers-reduced-motion: reduce)` ожидают мгновенные переходы.

### Почему это проблема

- Пользователи с вестибулярными расстройствами / эпилепсией могут испытывать дискомфорт.
- WCAG 2.3.3 (Animation from Interactions) — требование уровня AAA.

### Acceptance criteria

- [x] Класс `baseClasses` использует `motion-safe:transition-colors motion-safe:duration-200`.
- [x] Тест: `wrapper.find('[data-button]').attributes('class')` содержит `motion-safe:transition-colors`, не содержит unconditional `transition-colors`.
- [ ] DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce` — Button hover не показывает transition (manual).

## ~~Issue 11: ButtonEmits = null — нет нативного click эмита~~ ✅ resolved 2026-05-10

- **Категория:** D26 (консистентность событий)
- **Severity:** ~~low~~
- **Где:** [Button.d.ts:137–144](../../../lib/button/Button.d.ts#L137-L144), [Button.vue:390](../../../lib/button/Button.vue#L390)
- **Resolution:** `ButtonEmits = { (event: "click", payload: MouseEvent): void }`; `defineEmits<ButtonEmits>()` в SFC; `<button @click="(e) => emit('click', e)">` явно пробрасывает native event через emit-channel — Volar получает корректный type-hint для `@click="handler"`. Additive change: предыдущие подписчики продолжают работать.

### Что найдено

```ts
export declare type ButtonEmits = null
```

Нативный click event пробрасывался через `$attrs` (default Vue behavior), но это не задокументировано в типах. Пользователь не получал type-hint про `@click`.

### Почему это проблема

- Volar/vue-tsc предупреждает «could not declare event 'click'» в редких сценариях.
- Документация [components/button.md](../../components/button.md) §6 Events ранее указывала «нет emits» — но `@click` всё-таки доступен.

### Acceptance criteria

- [x] `<Button @click="handler" />` — `handler` получает корректно типизированный `MouseEvent` в Volar.
- [x] Тест: `wrapper.emitted('click')?.[0]?.[0]` это `MouseEvent`.

## ~~Issue 12: Нет именованных слотов `before`/`after`/`start`/`end`~~ ✅ resolved 2026-05-10

- **Категория:** G37 (композиция через slots)
- **Severity:** ~~low~~
- **Где:** [Button.vue:400–407](../../../lib/button/Button.vue#L400-L407), [Button.d.ts:118–136](../../../lib/button/Button.d.ts#L118-L136)
- **Resolution:** добавлены slots `start` и `end` в не-icon ветке template; `ButtonSlots` расширен с JSDoc; имена `start`/`end` выбраны вместо `before`/`after` для logical-writing-order совместимости с будущим RTL fix (см. [../button.md Issue 3](../button.md)).

### Что найдено

Шаблон поддерживал только `<slot name="default" />`. Все индикаторы (icon, loading) встроены через props, нет возможности кастомизировать левый/правый блок (например, badge counter, status dot).

### Почему это проблема

- Use-case: «Save (12 unsaved)» — кнопка с badge — невозможно без обёртки.
- Element Plus, Naive UI, PrimeVue — поддерживают `prepend`/`append` слоты.

### Acceptance criteria

- [x] `<Button><template #start><Icons type="Check" /></template>D<template #end>E</template></Button>` рендерит content в порядке S → D → E (text-ordering tests в `Button.test.ts`).
