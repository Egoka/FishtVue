---
title: Calendar
summary: Date picker на v-calendar — single/range, date/time/dateTime, кастомные шаблоны.
updated: 2026-05-09
stability: beta
since: 0.2.11
---

# Calendar

## 1. Overview

`Calendar` — обёртка над [v-calendar](https://vcalendar.io/) с интеграцией FishtVue: layout, theming, локализация (через `paramsDatePicker.locale`), валидация. Поддерживает три режима — `date`, `dateTime`, `time` — и диапазон через `isRange`. Реализует v-model contract FishtVue.

Stability: `beta` — coverage `Calendar.vue` 63.12% (часть веток не покрыта тестами); `paramsDatePicker.IParamsDatePicker` содержит ~30 опций v-calendar с `Partial`-типами без чётких границ.

Source: [Source](../../lib/calendar/Calendar.vue), [Calendar.d.ts](../../lib/calendar/Calendar.d.ts), [Calendar.test.ts](../../lib/calendar/Calendar.test.ts).

## 2. How it's organized

```
lib/calendar/
├── Calendar.vue
├── Calendar.d.ts        # 618 строк (включая IParamsDatePicker)
├── Calendar.test.ts     # 14 кейсов, 2 skipped
└── package.json
```

Зависимости:
- [v-calendar](../../lib/package.json) `^3.1.2` — core engine.
- [InputLayout](./input-layout.md), [FixWindow](./fix-window.md).
- [Component class](../architecture/component-class.md).
- `date-fns` для форматирования через [dateHandler](../utilities/dateHandler.md).
- Css импортируется явно: `v-calendar/style.css` ([rollup.config.js:65](../../lib/rollup.config.js#L65)).

Лицензия v-calendar — MIT (не копилефт).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили + явный `onMounted(() => initDarkModeObserver())` для трекинга dark-mode на body/html.
- **Поток данных:** `modelValue` (string/Date/range) → внутренний state → emit'ы.
- **v-model contract:** standard.
- **Стили:** `Calendar.setStyle()` для обёртки. Внутренние стили v-calendar — через `v-calendar/style.css`.
- **Конфиг:** `componentsOptions.Calendar` — см. §10. Помимо этого, `paramsDatePicker.locale` принимает `date-fns/locale` объект.
- **Локализация:** через `paramsDatePicker.locale` или `optionsTheme.locale`.
- **SSR:** `isClient()` guard перед инициализацией observer'а. v-calendar SSR-friendly до версии 3.1.x.
- **Animation:** v-calendar использует свои анимации; FixWindow — для popover.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Calendar from "fishtvue/calendar"

const date = ref<Date | null>(null)
</script>

<template>
  <Calendar v-model="date" label="Birthday" />
</template>
```

## 5. Props

`CalendarProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseCalendarProps>`.

`BaseCalendarProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `paramsDatePicker` | `Partial<IParamsDatePicker>` | — | Большой объект v-calendar опций. |
| `autoFocus` | `boolean` | — | Фокус на mount. |
| `isNotCloseOnDateChange` | `boolean` | `false` | Не закрывать popover после выбора. |
| `classDataPicker` | `StyleClass` | — | Класс root picker. |
| `classPicker` | `StyleClass` | — | Класс собственно календаря. |
| `classDateText` | `StyleClass` | — | Класс текстового представления даты. |
| `paramsFixWindow` | `FixWindowProps` | — | Конфиг позиционирования popover. |

Свои:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id корня. |
| `modelValue` | `DatePickerModel \| undefined` | — | v-model. См. ниже. |

`IParamsDatePicker` ([Calendar.d.ts](../../lib/calendar/Calendar.d.ts)) включает (фрагмент):

- Calendar: `borderless`, `transparent`, `color: ColorCalendarPicker`, `isDark`, `expanded`, `titlePosition`, `view`, `showWeeknumbers`, `trimWeeks`, `rows`, `columns`, `step`, `minDate`, `maxDate`, `popover`, `attributes`.
- DatePicker: `mode: "date" \| "dateTime" \| "time"`, `isRange`, `isRequired`, `is24hr`, `mask: CalendarMask`, `masks: IMasksDate`, `disabledDates`, `selectAttribute`, `rules`, `locale`, `timezone`, `placeholder`, `separator`.

`DatePickerModel` — union из `Date | string | number | { start, end } | null` (см. [Calendar.d.ts](../../lib/calendar/Calendar.d.ts)).

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `DatePickerModel` | На каждый pick. |
| `change:modelValue` | `DatePickerModel` | После flush. |
| `update:isInvalid` | `boolean` | При смене статуса валидации. |
| `getCalendar` | `ICalendarPicker` | После init — даёт ссылку на v-calendar API. |
| `isActive` | `boolean` | Открытие/закрытие popover. |

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива default rendering. |
| `before` | — | Контент слева. |
| `after` | — | Контент справа. |
| `footerPicker` | — | Произвольный footer внутри popover календаря (например, кнопки «Сегодня»/«Очистить»). |

## 8. Exposed methods

`CalendarExpose`:

| Name | Description |
|---|---|
| `layout`, `inputLayout`, `datePickerLink`, `picker`, `calendarPicker`, `isFocus`, `isOpenPicker`, `datePickerOptions`, `value`, `visibleDate` | Reactive state. |
| `id`, `isValue`, `autoFocus`, `isNotCloseOnDateChange`, `mode`, `placeholder`, `isLoading`, `isDisabled`, `isInvalid`, `messageInvalid`, `separator`, `valueLayout`, `paramsFixWindow`, `classLayout`, `classDataPicker`, `classDateText`, `classPicker` | Derived. |
| `openCalendar()` / `closeCalendar(event?)` | Open/close. |
| `changeDate(date)` | Программный set. |
| `focus(focus)` | Программный focus. |
| `clearDataPicker()` | Очистка значения. |

## 9. Examples

### 9.1 Single date

```vue
<Calendar v-model="date" label="Date" />
```

### 9.2 Range

```vue
<Calendar
  v-model="range"
  :params-date-picker="{ isRange: true }"
  label="Booking" />
```

### 9.3 DateTime + русская локаль

```vue
<script setup lang="ts">
import { ref } from "vue"
import { ru } from "date-fns/locale"
import Calendar from "fishtvue/calendar"

const dt = ref<Date | null>(null)
</script>

<template>
  <Calendar
    v-model="dt"
    :params-date-picker="{ mode: 'dateTime', is24hr: true, locale: ru }"
    label="Дата и время" />
</template>
```

### 9.4 Custom footer (Today/Clear)

```vue
<Calendar v-model="date" label="Date">
  <template #footerPicker>
    <div class="flex gap-2 p-2">
      <button @click="date = new Date()">Today</button>
      <button @click="date = null">Clear</button>
    </div>
  </template>
</Calendar>
```

## 10. Configuration & Customization

### 10.1 Global

`CalendarOption = Pick<CalendarProps, "paramsDatePicker" | "autoFocus" | "isNotCloseOnDateChange" | "classDataPicker" | "classPicker" | "classDateText" | "paramsFixWindow" | keyof InputLayoutOption>`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

- `paramsDatePicker.color: ColorCalendarPicker` — задаёт цветовую тему v-calendar.
- `paramsDatePicker.isDark: true` — принудительный dark mode (или auto через `optionsTheme.darkModeSelector` + observer).
- Кастомные стили v-calendar — через `:deep(.vc-...)` в parent SFC.

### 10.4 CSS layer override

Calendar инжектит часть стилей через `Calendar.setStyle()`, часть — через импорт CSS v-calendar (вне `@layer fishtvue`). Override v-calendar стилей делай вне layer'ов или с увеличенной специфичностью.

## 11. Form integration & validation

- Полностью поддерживается в [Form](./form.md).
- Валидация через rules — но `paramsDatePicker.rules` (v-calendar) — отдельный механизм min/max date validation:

```vue
<Calendar
  v-model="date"
  :params-date-picker="{
    rules: { hours: { min: 9, max: 18 } }
  }" />
```

- Reset: установи `modelValue: null` извне.

## 12. Accessibility & Security

### A11y

- v-calendar содержит a11y-семантику для grid и кнопок навигации. Проверь актуальность по версии.
- Keyboard: ArrowKeys для навигации по сетке, Enter для выбора, Escape — close popover.
- Focus management: open → focus на picker, close → return.
- `prefers-reduced-motion` — на стороне v-calendar.

### Security

- Не использует `v-html` для пользовательского ввода.
- v-calendar — open-source MIT, проверяй CVE при обновлении.

## 13. TypeScript

```ts
import type {
  CalendarProps, CalendarEmits, CalendarExpose,
  DatePickerModel, IParamsDatePicker, ICalendarPicker
} from "fishtvue/calendar"
import Calendar from "fishtvue/calendar"
import { useTemplateRef } from "vue"

const cal = useTemplateRef<InstanceType<typeof Calendar>>("cal")
cal.value?.openCalendar()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **v-calendar:** `^3.1.2` — major-bump может ломать API `IParamsDatePicker`.
- **Stability flag:** `beta` — coverage ниже `stable`-порога; типы содержат `Partial<...>` с широкими полями.
- **Breaking changes:** при апгрейде v-calendar до 4.x — ожидаются.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Calendar from "fishtvue/calendar/Calendar.vue"

describe("Calendar", () => {
  it("mounts", () => {
    const wrapper = mount(Calendar, {
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Calendar.test.ts](../../lib/calendar/Calendar.test.ts) (14 кейсов, 2 skipped).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Стили v-calendar не загрузились | Не подключён CSS-импорт. | В `main.ts` добавь `import "v-calendar/style.css"` (если bundler не подхватывает автоматически). |
| Dark mode не активируется | `initDarkModeObserver` не дождался mount или `darkModeSelector` пустой. | Установи `optionsTheme.darkModeSelector` и проверь корневой DOM. |
| `mode: "dateTime"` не показывает время | `v-calendar` версия не поддерживает или `is24hr` не задан. | Установи `is24hr: true` явно. |
| Range возвращает `{ start, end }`, а ожидался array | `isRange: true` всегда возвращает объект. | Адаптируй на стороне родителя. |
| `paramsDatePicker.locale` не применяется | Прокинут не date-fns Locale, а строка. | Передай объект из `import { ru } from "date-fns/locale"`. |
| `getCalendar` event не срабатывает | v-calendar mount с задержкой. | Используй `onMounted` + `nextTick`, либо expose `datePickerLink`. |

## 17. Related

- [InputLayout](./input-layout.md), [FixWindow](./fix-window.md).
- [Input](./input.md), [Select](./select.md), [TextEditor](./text-editor.md), [Switch](./switch.md).
- [utilities/dateHandler.md](../utilities/dateHandler.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).
- [Form](./form.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Calendar.vue](../../lib/calendar/Calendar.vue) и [Calendar.d.ts](../../lib/calendar/Calendar.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 63.12% — большая часть веток ([Calendar.vue:319–340, 377–396](../../lib/calendar/Calendar.vue#L319-L340)) не покрыта тестами.
- 2 skipped тестов в [Calendar.test.ts](../../lib/calendar/Calendar.test.ts).
- `initDarkModeObserver()` — внутренний; не expose'ится; на cleanup'е компонента observer disconnect'ится (надо проверить).

### Skipped tests

2 случая. Подробности — в самом файле тестов.

### API inconsistencies

- `IParamsDatePicker` ([Calendar.d.ts](../../lib/calendar/Calendar.d.ts)) содержит ~30 полей через `Partial`, многие из которых — re-export типов v-calendar (`v-calendar/dist/types`, `v-calendar/src/utils`). При апгрейде v-calendar пути могут сменить — fragile.
- `DatePickerModel` — широкий union; narrow для `isRange: true` vs single — на стороне потребителя.
- `ICalendarPicker` (expose v-calendar API) — содержит `any` поля.

### Behavioral caveats

- При `paramsDatePicker.timezone` v-calendar парсит `Date` относительно зоны — `modelValue` приходит в UTC. Для рендеринга в локальной зоне — преобразуй явно.
- `isNotCloseOnDateChange: true` оставляет popover открытым после выбора — для UI-паттерна «выбрал-нажал-OK» используй custom `footerPicker`.
- На server-side render в Nuxt 4 — есть риск инициализации в неправильное время. Проверяй интеграционно.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
