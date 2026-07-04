---
title: Issues — Form
summary: Аудит Form. Все numbered issues закрыты — XSS (1), validation i18n (6), branch coverage (8) 2026-06-03; compound `<Form><FormField>`/`<FormSection>` API (2), open typeField + registerFieldType (3), native submit + FormData (4), SSR/sideEffects/exports/unstyled (5), date locale via Calendar (7), motion/RTL/print + G34 expose (9) 2026-06-13; B10 color-часть (structural `gray-*` → `surface-*`) 2026-07-04. Severity matrix 0/0/0/0; файл остаётся active — историческая B10-заметка ниже уточнена (Form-инстанс мигрирован, библиотечная Wave 9 в целом — нет).
updated: 2026-07-04
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/form/
related-doc: ../components/form.md
---

# Issues — Form

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | ~~C13 (v-html в select-marker)~~ ✅ resolved 2026-06-03 |
| high | 0 | ~~A2~~, ~~A4-5~~, ~~C17~~, ~~L53~~ ✅ (Issue 5), ~~P (dual-API)~~ ✅ (Issue 2), ~~M55 (FormData)~~ ✅ (Issue 4) |
| medium | 0 | ~~D21 (typeField generic)~~ ✅ (Issue 3), ~~F30~~ ✅ 2026-06-03, ~~F32~~ ✅ (Issue 7), ~~G34~~ ✅ (formElement expose, Issue 9) |
| low | 0 | ~~E29.7~~ + ~~N59~~ ✅ (Issue 9), ~~B10~~ (structural `gray-*` → `surface-*`) ✅ resolved 2026-07-04, ~~K46~~ ✅ 2026-06-03 |

> **Файл остаётся в `active/`** (не перемещён в `./done/`): numbered-issue matrix `0/0/0/0`. B10 для **Form-инстанса** закрыт 2026-07-04 (см. [scope note](#scope-notes) ниже) — это не значит, что библиотечная **Wave 9** завершена целиком: миграция — первый batch из 11 компонентов, ещё 8 компонентов + отдельный Alert-эпик (severity-цвета) остаются, трекинг — централизованно в [issues/README.md](./README.md).

## ~~Issue 1: CRITICAL — XSS через select-marker (наследуется через Form-rendered Select)~~ ✅ resolved 2026-06-03

- **Категория:** C13 + security
- **Severity:** ~~critical~~ ✅ resolved (Wave 1 закрыта 2026-06-19 — matrix Critical 0)
- **Где:** ~~[Form.vue:380]~~ (template `#item` override удалён)

### Что найдено

```vue
<div v-if="!isQuery" v-html="item?.marker ?? item[key]" :class="classSelectItemIsQuery" />
```

Form переопределял Select `#item` slot через `v-html` для marker rendering — копия [select.md Issue 1](./select.md). Этот override **заменял** безопасный default Select (`#marker` slot + `markerParts()` `<mark>` highlight), воскрешая XSS и теряя подсветку.

### Что сделано ✅

Удалён `#item`-override в [Form.vue](../../lib/form/Form.vue) полностью — теперь Form переиспользует встроенный безопасный render Select (`#marker` slot + `markerParts()`, text-interpolation для значения). Удалены ставшие dead-кодом refs `classSelectItemIsQuery` / `classSelectItemNotQuery`. Никакого `v-html` в Form не осталось.

### Acceptance criteria

- [x] Form-rendered select option с XSS payload (`<img src=x onerror=…>`) не исполняется — рендерится как escaped-текст ([Form.test.ts](../../lib/form/Form.test.ts) → "does not execute an XSS payload from a Select option value"). ✅
- [x] Form переиспользует Select-component вместо дублирования render-логики. ✅

## ~~Issue 2: Dual-API gap — нет compound `<Form><FormField>` API~~ ✅ resolved 2026-06-13

- **Категория:** P (Dual-API)
- **Severity:** ~~high~~ → resolved
- **Где:** [Form.d.ts](../../lib/form/Form.d.ts) (FormFieldProps/FormSectionProps), [Form.vue:84–166](../../lib/form/Form.vue#L84-L166)

### Что найдено

API был только schema-driven через `structure: FormStructure[]` — без compound `<Form><FormSection><FormField>` варианта (industry-стандарт: VueForm, FormKit, Element Plus).

### Что сделано ✅

Реализован параллельный **compound API** по канону FishtVue — **VNode-walk `slots.default()`** (НЕ provide/inject; зеркало Table/Menu, [dev-patterns.md §2](../dev-patterns.md)):

1. NEW renderless-дети [FormField.vue](../../lib/form/FormField.vue) + [FormSection.vue](../../lib/form/FormSection.vue) (`defineOptions({ name, inheritAttrs: false })`, `Emits = null`; собственного DOM не рендерят).
2. [Form.vue:84–166](../../lib/form/Form.vue#L84-L166) — `compoundParsed` walk (Fragment-flatten, matching по имени `"FormField"`/`"FormSection"`) синтезирует `FormStructure[]`; default-slot `<FormField>` рендерится как custom-контрол через `RenderFieldSlot` (с value-bridge). Form **не импортирует** child `.vue` (ломает type-resolver).
3. [Form.vue:190–194](../../lib/form/Form.vue#L190-L194) — `structure` computed: schema `:structure` при наличии **выигрывает** (backward compat); иначе — compound-дети. `FormProps.structure` стал optional.
4. Регистрация: NEW [lib/form/index.ts](../../lib/form/index.ts) (rollup entry → `form.mjs` с named `FormField`/`FormSection`), [rollup.config.js](../../lib/rollup.config.js) `addEntry("form", "index.ts", "form")` + skip-guard, Nuxt `FISHT_VUE_SUBCOMPONENTS`, root barrel `export * from "fishtvue/form"`. Типы `FormFieldProps`/`FormFieldSlots`/`FormSectionProps`/`FormSectionSlots` + `declare class FormField`/`FormSection` + `GlobalComponents` в [Form.d.ts](../../lib/form/Form.d.ts).

### Acceptance criteria

- [x] Schema-driven продолжает работать (regression-тест "schema structure wins over compound children"). ✅
- [x] `<Form><FormField name="email" type="Input" /></Form>` рендерит Input с auto-binding на `formFields.email`. ✅
- [x] `<FormSection title>` группирует поля; custom typeField через slot: `<FormField name="x"><MyComp /></FormField>`. ✅

## ~~Issue 3: typeField string union — нельзя расширить custom компонентами~~ ✅ resolved 2026-06-13

- **Категория:** D21 (Generic типов)
- **Severity:** ~~medium~~ → resolved
- **Где:** [Form.d.ts](../../lib/form/Form.d.ts) (`FieldComponentType`), [fieldRegistry.ts](../../lib/form/fieldRegistry.ts), [Form.vue:80–82](../../lib/form/Form.vue#L80-L82)

### Что найдено

`typeComponent` — closed union (`"Input" | "Select" | …`). Нельзя добавить custom typeField без регистрации в Form internals.

### Что сделано ✅

1. NEW [lib/form/fieldRegistry.ts](../../lib/form/fieldRegistry.ts) — module-level реестр: `registerFieldType(name, component)` / `getFieldType` / `hasFieldType` (экспорт через `index.ts`).
2. `FieldComponentType` → открытый union `… | (string & {})`; `FieldType<T>` fallback `: any` → `: FieldRegistered` (concrete loose type — не коллапсит известные типы в `any`).
3. [Form.vue:80–82](../../lib/form/Form.vue#L80-L82) — `resolveFieldComponent`: встроенный тип > зарегистрированный custom-тип > Custom-slot. Валидация ([Form.vue validateField](../../lib/form/Form.vue)) расширена: custom/registered поля валидируются при наличии `rules`.

### Acceptance criteria

- [x] `registerFieldType("MyField", Comp)` + поле `typeComponent: "MyField"` рендерит `Comp` с auto-binding. ✅
- [x] Неизвестный тип по-прежнему падает в Custom-slot. ✅
- [x] Composes с compound API: `<FormField name="x" type="MyField" />`. ✅

## ~~Issue 4: FormData/native submit не интегрируется~~ ✅ resolved 2026-06-13

- **Категория:** M55 (FormData)
- **Severity:** ~~high~~ → resolved
- **Где:** [Form.vue:467–474](../../lib/form/Form.vue#L467-L474), [Form.d.ts](../../lib/form/Form.d.ts) (`action`/`method`/`enctype`/`nativeSubmit`)

### Что найдено

Корень формы уже был native `<form>`, но `@submit.prevent` всегда блокировал native-отправку; не было `action`/`method`/`nativeSubmit`. (Native `name` на инпутах уже присутствовал: Form биндит `id=field.name`, Input мапит `:name="id"`.)

### Что сделано ✅

1. Новые props `action` / `method` / `enctype` / `nativeSubmit` ([Form.d.ts](../../lib/form/Form.d.ts), computeds [Form.vue:180–184](../../lib/form/Form.vue#L180-L184)), проброшены на корневой `<form>`.
2. `@submit.prevent="submit"` → `@submit="onSubmit"` ([Form.vue:467–474](../../lib/form/Form.vue#L467-L474)): невалидная форма **всегда** блокирует submit (`preventDefault`); валидная — эмитит `submit`; реальную browser-отправку (перезагрузка / POST на `action`) разрешает только при `nativeSubmit`/`action` (иначе SPA-режим).
3. `new FormData(formElement)` собирает значения Input-полей по `name` (тест "exposes field name attributes and collects values via native FormData").

### Acceptance criteria

- [x] `new FormData(formEl)` → собирает values Input-полей. ✅
- [x] `<Form action="/api/submit" method="post" :nativeSubmit="true">` — при валидной форме native submit не отменяется (атрибуты `action`/`method`/`enctype` на `<form>`). ✅

### Known limitation

FormData собирает только поля с native `name`-инпутом — сейчас это **Input** (Aria). Switch/Select/Calendar/TextEditor не рендерят hidden native input (их собственные issues — напр. [switch.md Issue 3](./switch.md), [texteditor.md Issue 10](./texteditor.md)); для них значения берутся через `v-model:form-fields`/`submit`-event, не через FormData. Form не правит другие компоненты.

## Issue 5: SSR styles + sideEffects/exports map + unstyled ✅ resolved 2026-06-13

См. [button.md Issue 1, 8, 9, 14](./button.md) — все четыре cross-cutting подпункта (C17 SSR-стили, A2 sideEffects, A4-5 exports map, L53 unstyled) **уже реализованы на уровне инфраструктуры** (`Component.__hooks()` → `onServerPrefetch`; root+per-component `sideEffects:false`; `buildRootExports()`; `Component.setStyle` unstyled-guard). Form наследует автоматически; дубль `Form.initStyle()` снят ещё 2026-06-03 (Wave 2.3). Закрыто Form-scoped regression-тестом unstyled ([Form.test.ts](../../lib/form/Form.test.ts) → "renders the form root without classes under unstyled: true").

### Acceptance criteria

- [x] `app.use(FishtVue, { unstyled: true })` → корневой `<form>` без `class` (regression-тест). ✅
- [x] SSR/sideEffects/exports — наследуются от cross-cutting инфраструктуры (см. button.md). ✅

## ~~Issue 6: `t()` для validation error messages~~ ✅ resolved 2026-06-03

- **Категория:** F30
- **Severity:** medium
- **Где:** [Form.vue:249–263](../../lib/form/Form.vue#L249-L263), [lib/utils/rulesHandler.ts](../../lib/utils/rulesHandler.ts)

### Что найдено

Validation rules возвращали хардкоден английские defaults в [rulesHandler.ts](../../lib/utils/rulesHandler.ts).

### Что сделано ✅

1. Form вызывает `setDefaultRuleMessages()` через `applyLocaleToRules()` ([Form.vue:249–263](../../lib/form/Form.vue#L249-L263)), мапя 10 rule-типов на `Form.t(<localeKey>)`. Ключи присутствуют в [en.ts](../../lib/locale/locales/en.ts) / [ru.ts](../../lib/locale/locales/ru.ts).
2. Wiring guarded через `useFishtVue()`; `watch(() => getActiveLocale(), …, { immediate: true })` переприменяет messages при runtime смене локали.
3. Тест: [Form.test.ts](../../lib/form/Form.test.ts) → "localizes default validation messages to ru when active locale is ru" / "keeps en messages under the default locale".

### Known limitation

`setDefaultRuleMessages` — global module state (shared между Form/Input/Select). Custom validator с `{ key, params }` interpolation не поддержан (Wave 3.5). Per-rule `message` имеет высший приоритет.

## ~~Issue 7: Date fields не уважают locale~~ ✅ resolved 2026-06-13

- **Категория:** F32
- **Severity:** ~~medium~~ → resolved

### Что найдено

См. [calendar.md Issue 8](./calendar.md). Form использует Calendar для date fields → наследует проблему.

### Что сделано ✅

[calendar.md Issue 8](./calendar.md) закрыт 2026-05-11: Calendar сам прокидывает `getActiveLocale()` в `<DatePicker :locale>` (priority `props > options > active > "en"`, [Calendar.vue:101–104](../../lib/calendar/Calendar.vue#L101-L104)). Form **не инжектит** `locale`/`paramsDatePicker.locale` — поэтому Calendar-поля внутри Form наследуют активную локаль автоматически. Закрыто Form-scoped тестом ([Form.test.ts](../../lib/form/Form.test.ts) → "leaves date-field locale to Calendar self-localization under active locale").

### Acceptance criteria

- [x] Calendar-поле в Form под `activeLocale: "ru"` резолвит локаль "ru" (Form не блокирует). ✅

## ~~Issue 8: Тестов 32, но branch coverage 78.91%~~ ✅ resolved 2026-06-03

- **Категория:** K46
- **Severity:** low

Branch coverage `Form.vue` поднят **78.91% → 80.6%** (statements 95.73%, functions 94.44%) добавлением тестов async-valid / `compare` / `FieldCustom` slot / multi-section / Select-branch. (Текущий suite расширен ещё на 22 кейса при закрытии Issues 2–9.)

## ~~Issue 9: prefers-reduced-motion / RTL / colors / print~~ ✅ resolved 2026-06-13 (motion/RTL/print/G34), ✅ 2026-07-04 (B10 colors — structural part)

- **Категория:** E29.7 (motion) / F31 (RTL) / N59 (print) / B10 (colors) + G34 (root ref expose)
- **Где:** [Form.vue:199](../../lib/form/Form.vue#L199), [Form.vue:203](../../lib/form/Form.vue#L203), [Form.vue:215](../../lib/form/Form.vue#L215), [Form.vue:218](../../lib/form/Form.vue#L218), [Form.vue:223](../../lib/form/Form.vue#L223)

### Что сделано ✅

Канон FishtVue (variant-классы, без правок theme-движка — [dev-patterns.md §2](../dev-patterns.md)):

1. **E29.7 (motion-safe):** все `transition`/`duration` → `motion-safe:*` — registered style [Form.vue:199](../../lib/form/Form.vue#L199) (+ inline `<transition>` enter/leave классы), `classItemGrid` [Form.vue:215](../../lib/form/Form.vue#L215) (`grid motion-safe:transition`).
2. **F31 (RTL):** физические `ml-1 mr-3` → логические `ms-1 me-3` (`classAfterSlot` [Form.vue:218](../../lib/form/Form.vue#L218)); inline `<Icons class="mr-2 …">` → `me-2`. Авто-флип при `dir="rtl"`.
3. **N59 (print):** `print:border-black` на section-divider ([Form.vue:203](../../lib/form/Form.vue#L203)); submit-Button печатается через собственные print-стили Button.
4. **G34 (root ref expose):** NEW `formElement: ref<HTMLFormElement>` на корневом `<form>`, наружу через `defineExpose` ([Form.vue:223](../../lib/form/Form.vue#L223)) — для native `requestSubmit()`/scroll/focus. Тест "exposes the root form element (G34)".

### ~~B10 (colors)~~ ✅ resolved 2026-07-04 (structural part)

Все hardcoded `gray-*` structural-классы Form мигрированы на именованный semantic-цвет `surface` (23-й named color в [primitive.ts](../../lib/theme/primitive.ts), по умолчанию — точная копия `gray`-шкалы; включён в `namesColors` union, [Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187)) с сохранением тех же числовых tone и opacity-суффиксов — family rename, не value change:

- Section-divider border: `border-gray-900/10 dark:border-gray-100/10` → `border-surface-900/10 dark:border-surface-100/10` ([Form.vue:203](../../lib/form/Form.vue#L203)).
- `insert.beforeText` slot prefix: `text-gray-500` → `text-surface-500` (`classBeforeSlot`, [Form.vue:216](../../lib/form/Form.vue#L216)).
- `insert.afterText` slot suffix: `text-gray-400 dark:text-gray-600` → `text-surface-400 dark:text-surface-600` (`classAfterSlot`, [Form.vue:218](../../lib/form/Form.vue#L218)).
- `insert.beforeIcon`/`insert.afterIcon`: `text-gray-400 dark:text-gray-600` → `text-surface-400 dark:text-surface-600` (два идентичных inline-места, [Form.vue:521](../../lib/form/Form.vue#L521), [Form.vue:533](../../lib/form/Form.vue#L533)).

Regression-тесты — [Form.test.ts](../../lib/form/Form.test.ts) describe "Form Component - B10 semantic surface tokens" (4 кейса): section divider, before/after-text slot, before/after-icon — проверяют наличие `surface-*` и отсутствие `gray-*`/`stone-*`/`neutral-*`/`slate-*`/`zinc-*` в рендере.

**Не входит в этот заход:** это Form-инстанс миграции; библиотечная **Wave 9** в целом не завершена — см. [scope note](#scope-notes). `forced-colors:` для собственного DOM Form — N/A (нет own active/selected-state; child-контролы Input/Select/Button уважают forced-colors сами).

### Acceptance criteria

- [x] Field-grid / inline-transitions используют `motion-safe:transition` (тест). ✅
- [x] Inserted slot content использует логические `me-*` (тест). ✅
- [x] Section-divider печатается читаемо (`print:border-black`). ✅
- [x] `formElement` exposed (G34). ✅
- [x] B10 — structural `gray-*` → `surface-*` для Form-инстанса, тот же numeric tone (тест). ✅ 2026-07-04

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Form` | ✅ | через Form.getOptions() |
| `componentsStyle` global | ⚠️ | пробрасывается в child fields через their own logic |
| `unstyled: true` | ✅ | Issue 5 ✅ — `Component.setStyle` guard; корневой `<form>` без class |
| Theme tokens vs hardcode | ✅ | структурные `gray-*` → semantic-токен `surface-*` (B10, resolved 2026-07-04 для Form-инстанса) |
| `t()` для текста | ✅ | Issue 6 ✅ — validation messages локализованы |
| Runtime locale switch | ✅ | Issue 6 ✅ — `watch(getActiveLocale)` |
| Native submit / FormData | ✅ | Issue 4 ✅ — `action`/`method`/`nativeSubmit` + FormData (Input-поля) |
| Compound API | ✅ | Issue 2 ✅ — `<Form><FormSection><FormField>` |
| Custom field types | ✅ | Issue 3 ✅ — `registerFieldType` |

## Scope notes

1. **B10 (colors) — Form-инстанс ✅ resolved 2026-07-04, библиотечная Wave 9 — не завершена.** Ранее здесь утверждалось, что «B10 (миграция `gray-*`/`red-*` Tailwind-примитивов на semantic tokens) — библиотечная Wave 9, ещё не сделана ни для одного компонента» — эта посылка устарела. Actual state: структурные `gray-*` классы Form (section-divider border, `insert.beforeText`/`afterText` slot-цвет, `insert.beforeIcon`/`afterIcon`) мигрированы на именованный semantic-цвет `surface` тем же numeric tone — детали см. в блоке «B10 (colors) ✅ resolved 2026-07-04» внутри Issue 9 выше. Это часть **первого batch** из 11 компонентов, мигрируемых в рамках Wave 9 (не Form-specific ad-hoc фикс). Библиотечная Wave 9 **в целом не завершена**: остаются ещё 8 компонентов из этого batch + отдельный **Alert-эпик** (severity-цвета `bg-green-50`/`text-red-400` и т.п. — другая природа, не structural-neutral) — см. централизованный трекинг в [issues/README.md](./README.md). Файл остаётся в `active/` — numbered-issue matrix `0/0/0/0`, но исторически удерживался как cross-cutting-трекер (зеркало `pagination.md`/`table.md`/`select.md`/`menu.md`/`accordion.md`/`separator.md` — все прошли ту же миграцию 2026-07-04 и также остались active).
2. **FormData для non-Input полей.** Только Input несёт native `name`-инпут. Switch/Select/Calendar/TextEditor — отдельные issues (их hidden-input работа вне scope Form). Значения этих полей доступны через `v-model:form-fields`/`submit`-event.

## Dual-API gap

✅ resolved (Issue 2) — Form стал **вторым** dual-API компонентом после Table: schema-driven `:structure` и compound `<Form><FormSection><FormField>` работают одновременно.
