---
title: Issues — Component class (`Component<T>`)
summary: Issues 1-6 закрыты + B11 doc-sync. Issue 3 (HMR teardown) ✅ — механизм дедупа `<style>` через `data-fishtvue-style-id` уже в `useStyle.ts`, verified regression-тестом. Issue 4 (generic narrowing D21) ✅ — контракт `keyof ComponentsOptions` задокументирован в architecture §3/§13. Issue 5 (coverage K46) ✅ — добавлены HMR-dedup + default-`__stylesBase` тесты, стабилизирован flaky `getOptions`. E29.7/N59 (motion/print) закрыты как N/A by design (базовый класс не рендерит DOM, motion/print = per-SFC concern) — **matrix 0/0/0/0**.
updated: 2026-06-14
last-changes: 2026-06-14 — Issues 3/4/5 закрыты (test+doc only, без правок source). **Issue 3** (C17/HMR) — рекомендация fix #2 («replace content existing element») уже реализована в [useStyle.ts:43-45](../../lib/theme/helpers/useStyle.ts#L43-L45) через переиспользование `style[data-fishtvue-style-id="${name}"]`; добавлен regression-кейс в [Theme.test.ts](../../lib/theme/Theme.test.ts) `describe("useStyle")` (3× инжекция с одним name → один `<style>`, контент заменён). **Issue 4** (D21) — generic уже `keyof ComponentsOptions` (auto-derive не нужен); контракт «новый компонент → ключ в ComponentsOptions» задокументирован в [architecture/component-class.md](../architecture/component-class.md) §3/§13. **Issue 5** (K46) — HMR-test ✅ (Theme.test.ts), default-`__stylesBase` тест ✅ + flaky `should return the correct options with getOptions` стабилизирован (явный name вместо order-dependent undefined-резолва под isolate:false); Component.test.ts 25 → 26. **B11** (darkModeSelector) — doc-sync: закрыт глобально 2026-06-12 ([component/index.ts:150](../../lib/component/index.ts#L150)), снят из open-счёта. **E29.7/N59** (motion/print, low) закрыты как N/A by design — базовый класс не рендерит DOM (architecture §3/§12), motion/print = per-SFC concern. Severity matrix 0/2/3/2 → **0/0/0/0**; файл переведён в «Завершённые», остаётся в `active/` как трекер watcher-leak limitation (Issue 3).
audit-checklist: 60-point + Configuration support
source: lib/component/
related-doc: ../architecture/component-class.md
---

# Issues — Component class

## Сводка

| Severity | Count (open) | Categories                                                                           |
| -------- | ------------ | ------------------------------------------------------------------------------------ |
| critical | 0            | —                                                                                    |
| high     | 0            | —                                                                                    |
| medium   | 0            | —                                                                                    |
| low      | 0            | —                                                                                    |

## ~~Issue 1: Double initStyle — onServerPrefetch + onMounted + manual call в каждом компоненте~~ ✅ resolved 2026-05-16

- **Категория:** C17 (SSR style injection)
- **Severity:** high
- **Где:** [component/index.ts:79-84](../../lib/component/index.ts#L79-L84) + ранее — каждый component (`onMounted(() => X.initStyle())`)

### Что было найдено

Constructor `Component<T>` уже вызывал:

```ts
onServerPrefetch(() => this.initStyle())
vueOnMounted(() => this.initStyle())
```

Но 6 SFC дублировали ручной `onMounted(() => X.initStyle())` (7 occurrences):

- Button.vue:369, Icons.vue:70, InputLayout.vue:197 + InputLayout.vue:229, Menu.vue:235, Separator.vue:128, Table.vue:937.

Это давало двойную инжекцию стилей при mount (хотя `__setStyle` дедуплицирует — runtime-cost оставался), излишний код в каждом компоненте, inconsistent pattern: одни полагались на base-class-hook, другие добавляли ручной вызов.

### Что сделано (Wave 2.3, 2026-05-16)

Sweep по 6 SFC × 7 occurrences:

- ~~Button.vue:369~~ — `Button.initStyle()` удалён, добавлен comment-marker выше `onMounted` (блок сохранён — внутри dev-warning по a11y).
- ~~Icons.vue:69-71~~ — весь `onMounted(async () => { Icons.initStyle() })` удалён (после удаления тело пустое), заменён comment-marker'ом.
- ~~InputLayout.vue:197 + 229~~ — два `InputLayout.initStyle()` удалены, comment-marker над первым блоком; обе `onMounted` сохранены (внутри ResizeObserver setup и layoutObserver setup).
- ~~Menu.vue:235~~ — `MenuComponent.initStyle()` удалён, comment-marker над `onMounted`; блок сохранён (setItems setup).
- ~~Separator.vue:127-129~~ — весь `onMounted(() => { Separator.initStyle() })` удалён, заменён comment-marker'ом.
- ~~Table.vue:937~~ — `Table.initStyle()` удалён, comment-marker над `onMounted`; блок сохранён (tableObserver + sortColumns setup).

После sweep'а: **14 SFC чистые** (Alert, Aria, Calendar, Input, Label, Select, Switch + Button, Icons, InputLayout, Menu, Separator, Table, FixWindow — последний sweep'нут 2026-05-16 в рамках fix(fixwindow) audit close-out), **7 SFC не используют initStyle** (Accordion, Badge, Dialog, Form, Pagination, Split, TextEditor), Dialog ✅ переведён в `./done/` ранее. Итого 21/21 чистых core SFC. _Correction (2026-05-16): FixWindow ошибочно числился в списке "не используют initStyle" — на самом деле использовал ручной `FixWindow.initStyle()` в `onMounted` SFC line 132; убран в рамках Wave 2.3._

Acceptance criteria:

- [x] Все touched SFC не вызывают `Component.initStyle()` явно.
- [x] Стили инжектятся при SSR + mount через `Component.__hooks()` ([component/index.ts:79-84](../../lib/component/index.ts#L79-L84)) — сохранено.
- [x] Регрессионные тесты проходят: `Button.test.ts` 27✓, `Icons.test.ts` 18✓, `InputLayout.test.ts` 41✓, `Menu.test.ts` 21✓, `Separator.test.ts` 25✓, `Table.test.ts` 66✓.
- [x] Полный suite зелёный (38 test files passed).

## ~~Issue 2: `window.FishtVue` global pollution + tight coupling~~ ✅ resolved 2026-05-20

- **Категория:** C13 (утечка структуры)
- **Severity:** ~~high~~
- **Где:** [component/index.ts:68](../../lib/component/index.ts#L68), [config/index.ts:82](../../lib/config/index.ts#L82)
- **Resolution:** через config Issue 1 fix. `isExistFishtVue` ([config/index.ts:82–92](../../lib/config/index.ts#L82-L92)) теперь использует `inject(FishtVueSymbol)` primary path (через `hasInjectionContext`), fallback на `window.FishtVue` — только когда нет inject context (imperative API, например `openAlert`). `FishtVueSymbol` стабилизирован как `const InjectionKey<FishtVue>` — multi-app safe.
- Component class ([component/index.ts:68](../../lib/component/index.ts#L68)) сохраняет window fallback для backward compat, но теперь это исключительный путь, не primary.

## ~~Issue 3: SSR style injection — нет teardown при HMR~~ ✅ resolved 2026-06-14

- **Категория:** C17 + I19 (HMR)
- **Severity:** ~~high~~
- **Где:** [theme/helpers/useStyle.ts:43-45](../../lib/theme/helpers/useStyle.ts#L43-L45)

### Что найдено (аудит)

Опасение: при HMR (Vite dev) компонент перезагружается, старые `<style>` теги в `<head>` остаются, после N hot-reloads копятся десятки тегов с одинаковыми селекторами.

### Что найдено при верификации

Рекомендованный fix #2 («replace content existing element, не append new») **уже реализован** в `useStyle.ts`. `load()` сначала ищет существующий тег по стабильному ключу и переиспользует его:

```ts
styleRef.value = (document.querySelector(`style[data-fishtvue-style-id="${_name}"]`) ??
  (_id ? document.getElementById(_id) : undefined) ??
  document.createElement("style")) as HTMLElement
```

`Component.__setStyle()` вызывает `useStyle(css, { name: this.name })` ([component/index.ts:180](../../lib/component/index.ts#L180)) — `name` стабилен между HMR-re-mount'ами, поэтому каждый новый closure находит тот же `<style>` и заменяет его `textContent` через watch (`appendChild` существующего узла его лишь перемещает, дубля не создаёт). Утверждение аудита про «десятки тегов» было спекулятивным — дедуп через `data-fishtvue-style-id` уже работает.

### Acceptance criteria

- [x] DevTools Elements / jsdom: после повторной инжекции с тем же `name` — только один `<style>` в head, контент заменён, не дубль. Verified: [Theme.test.ts](../../lib/theme/Theme.test.ts) `describe("useStyle")` → `does not duplicate <style> across re-instantiation with the same name (HMR — Issue 3)` (3× инжекция → `querySelectorAll(...).length === 1`).

### Не сделано (осознанно)

Каждый вызов `useStyle()` создаёт новый незакрытый `watch(cssRef, …)` (прошлый closure не вызывает `unload()`). Это minor dev-only leak (старый watch инертен — его `cssRef` больше не мутируется; элемент один). Полноценный teardown потребовал бы cross-cutting трекинга handle'ов в `Component.__setStyle` → отложено как known-limitation (канон: минимальная дельта, не патчим без нужды). См. [architecture/component-class.md §18](../architecture/component-class.md#18-known-issues--limitations).

## ~~Issue 4: `__hooks` хардкод 'Button' / 'Label' / etc — typing fragile~~ ✅ resolved 2026-06-14

- **Категория:** D21 (Generic narrowing)
- **Severity:** ~~medium~~
- **Где:** [component/index.ts:53](../../lib/component/index.ts#L53), TypeComponent.d.ts

### Что найдено

`Component<T extends keyof ComponentsOptions>` — `T` это string literal `"Button" | "Label" | ...`. Каждый компонент: `new Component<"Button">()`. Generic параметр позиционирует только options-типизацию, runtime использует `this.name`. Если разработчик ошибётся `new Component<"Bttuon">()` — TS поймает (✅), но при добавлении нового компонента нужно расширять `ComponentsOptions` тип.

### Что сделано (2026-06-14)

Generic уже выводится из `ComponentsOptions` (`T extends keyof ComponentsOptions`) — auto-derive type-helper не нужен (рекомендация #2 отклонена как избыточная: тип уже derived). Закрыто документированием контракта (рекомендация #1):

1. [architecture/component-class.md §13](../architecture/component-class.md#13-typescript) — абзац про D21-контракт: `T` только для options-typing, runtime — `this.name`; добавление нового компонента требует ключа в `ComponentsOptions`; typo в `Component<"Bttuon">()` ловится compile-time.
2. [architecture/component-class.md §3](../architecture/component-class.md#3-how-it-works) — заметка-связка к контракту + cross-ref [dev-patterns.md §8 step 7](../dev-patterns.md#8-adding-a-new-component-checklist) (шаг «Добавить опции в `lib/config/FishtVue.d.ts` (`ComponentsOptions`)»).

Код `lib/` не менялся.

## ~~Issue 5: Тесты — coverage 87%, есть untested ветви~~ ✅ resolved 2026-06-14

- **Категория:** K46
- **Severity:** ~~medium~~
- **Где:** [Component.test.ts](../../lib/component/Component.test.ts) (26 it-блоков), [Theme.test.ts](../../lib/theme/Theme.test.ts) `describe("useStyle")` (21 it-блок)

### Что сделано (2026-05-16, Wave 2.3)

Добавлены 4 новых it-блока в `Component.test.ts` (теперь 19 cases):

1. ~~SSR `onServerPrefetch` registration~~ — `constructor wires up SSR + client style injection hooks without throwing` (координативная проверка веток `__hooks()` 79-84 без зависимости от mock state; vitest `isolate: false` делает `vi.mocked(onServerPrefetch).toHaveBeenCalled()` flaky под batch run).
2. ~~Multiple init calls (idempotence)~~ — `initStyle is idempotent — multiple calls produce identical args`.
3. ~~`__globalConfig` fallback chain (window.FishtVue)~~ — `falls back to window.FishtVue when appContext.globalProperties.$fishtVue is undefined` (в nested `describe` с afterEach cleanup для предотвращения утечки в другие test-файлы под `isolate: false`).
4. ~~Graceful no-config~~ — `does not throw when neither appContext.$fishtVue nor window.FishtVue is set`.

### Что сделано (2026-06-14)

- [x] **HMR teardown test** — добавлен в [Theme.test.ts](../../lib/theme/Theme.test.ts) `describe("useStyle")` (он `vi.unmock("fishtvue/theme")` → реальный `useStyle`, в отличие от глобального no-op мока). Кейс `does not duplicate <style> across re-instantiation with the same name (HMR — Issue 3)` верифицировал дедуп `useStyle.ts:43-45`. См. Issue 3.
- [x] **`initStyle()` без custom function** — кейс `initStyle() without a custom function uses the default __stylesBase` покрыл ветку `stylesComp ?? this.__stylesBase` ([component/index.ts:130](../../lib/component/index.ts#L130)) + `__stylesBase` else-ветку: в тестах `onMounted`/`onServerPrefetch` замоканы → авто-вызов из `__hooks()` не срабатывает, ветка иначе не покрыта. Явный `name` → детерминированная запись в `cssComponents`.
- [x] **Flaky `should return the correct options with getOptions`** — стабилизирован. Root cause: тест ждал shape всего map'а (`{ FixWindow: {...} }`), который `getOptions()` возвращает только когда `this.name` резолвится в `undefined`; под `isolate: false` file-wide `vi.mock("vue")` применяется не всегда → соло `name="FixWindow"` → `getOptions("FixWindow")` → `{ closeButton: true }` → падал. Fix: явный `new Component<"FixWindow">("FixWindow")` + assert `{ closeButton: true }` — детерминированно и под mock-, и под real-config-путём. Verified: 3× solo + whole suite зелёные.

## ~~Issue 6: SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-05-11 (unstyled part)

См. [button.md Issue 1, 8, 9, 14](./button.md) для остальных частей (SSR/sideEffects/exports — Wave 2.1, open).

**Что сделано (2026-05-11):**

`Component.setStyle()` ([component/index.ts:134-157](../../lib/component/index.ts#L134-L157)) теперь проверяет `this.__globalConfig?.config?.unstyled` первой строкой (line 138) и возвращает `""` если флаг включен — это отключает рендер Tailwind-классов **во всех 22 компонентах**, использующих базовый класс. Cross-cutting fix через одну точку (Wave 3.1 → done).

```ts
public setStyle = (...) => {
  if (this.__globalConfig?.config?.unstyled) return ""
  // ... existing logic (registers classes via tailwind() + listOfStyledComponents,
  //     returns `fv ${specialClass} ${styles}`)
}
```

Тест: `Select.test.ts` > `respects unstyled: true via Component.setStyle guard` (демонстрирует cross-cutting эффект на Select, но применимо ко всем компонентам).

**Что осталось открытым:**

- Issue 1 (Double initStyle) — Wave 2.3, progress 3/22 после Select.
- SSR styles + sideEffects + exports map в lib/package.json — `button.md` Issues 1, 8, 9 (Wave 2.1).

## ~~Cross-cutting low: E29.7 (motion) / N59 (print)~~ ✅ resolved 2026-06-14 (N/A by design)

- **Категория:** E29.7 (prefers-reduced-motion), N59 (print)
- **Severity:** ~~low~~
- **Где:** [component/index.ts](../../lib/component/index.ts) — базовый класс

### Что найдено / resolution

Эти cross-cutting low-пункты жили только в severity-матрице, без тела issue. Для **базового класса** они **N/A by design**: `Component<T>` не рендерит DOM и не задаёт собственных стилей/анимаций — он лишь резолвит options, локаль и инжектит CSS-классы в `@layer fishtvue`. Подтверждено каноном:

- [architecture/component-class.md §3](../architecture/component-class.md#3-how-it-works) — «**Animation / transitions:** базовый класс анимаций не предоставляет. Анимации — на стороне SFC».
- [architecture/component-class.md §12](../architecture/component-class.md#12-accessibility--security) — «Класс не вносит a11y-атрибутов. Наследуется semantics корневого DOM-узла SFC».

Поэтому `prefers-reduced-motion` (E29.7) и print-стили (N59) — это **per-SFC concerns**, а не базового класса. Они трекаются и закрываются в issue-файлах конкретных компонентов (motion-safe canon — Button/Menu/Select/Table/Switch/InputLayout; print — Button/Input/Table/Switch/Pagination/InputLayout; см. Wave 10.1/10.2 в [README](./README.md)). На уровне `Component<T>` правок не требуется.

Severity matrix Component class: low 2 → 0 → **row 0/0/0/0**.

## Cross-cutting: Configuration support

| Настройка                           | Поддержано? | Комментарий                                                                                                               |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions`                 | ✅          | через `Component.getOptions()`                                                                                            |
| `componentsStyle` global            | ✅          | через `Component.componentsStyle()` (доступен), но не у всех компонентов используется (см. component-issues docs)         |
| `unstyled: true`                    | ✅          | (2026-05-11) `Component.setStyle()` возвращает `""` при `config.unstyled === true` — cross-cutting fix для 22 компонентов |
| Theme tokens                        | ✅          | через `Component.initStyle(stylesComp)` callback                                                                          |
| `t(key)` для текста                 | ✅          | через `Component.t(key)`                                                                                                  |
| Runtime locale switch               | ✅          | если использует `t()` — реактивен через computed                                                                          |
| Provide/inject через FishtVueSymbol | ✅          | основной механизм + window fallback (Issue 2)                                                                             |

## Dual-API gap

Не применимо.
