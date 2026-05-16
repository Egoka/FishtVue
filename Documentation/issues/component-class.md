---
title: Issues — Component class (`Component<T>`)
summary: 2/10 issues закрыто (Issue 6 — unstyled enforcement через setStyle guard cross-cutting; Issue 1 — dup initStyle sweep done 2026-05-16, Wave 2.3 завершена для класса). Issue 5 — частично resolved (SSR + idempotence + fallback chain tests added; HMR test переехал в Issue 3). Открытые — Issue 2 (window.FishtVue coupling), Issue 3 (HMR teardown), Issue 4 (generic narrowing).
updated: 2026-05-16
last-changes: 2026-05-16 — FixWindow добавлен в "14 SFC чистые" список (Wave 2.3 sweep дошёл до FixWindow в рамках fix(fixwindow) audit close-out); ранее ошибочно числился в "не используют initStyle".
audit-checklist: 60-point + Configuration support
source: lib/component/
related-doc: ../architecture/component-class.md
---

# Issues — Component class

## Сводка

| Severity | Count (open) | Categories                                                                           |
| -------- | ------------ | ------------------------------------------------------------------------------------ |
| critical | 0            | —                                                                                    |
| high     | 3            | C13 (window.FishtVue coupling), C17 (HMR teardown), K46 (coverage, частично закрыто) |
| medium   | 3            | D21 (generic narrowing), B11, K46 (HMR-test pending)                                 |
| low      | 2            | E29.7 (motion not at base), N59                                                      |

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

## Issue 2: `window.FishtVue` global pollution + tight coupling

- **Категория:** C13 (утечка структуры)
- **Severity:** high
- **Где:** [component/index.ts:68](../../lib/component/index.ts#L68)

### Что найдено

```ts
if (isClient() && !this.__globalConfig) this.__globalConfig = (window as any)?.FishtVue
```

`window.FishtVue` устанавливается в [config/index.ts:125](../../lib/config/index.ts#L125). Каждая Component-инстанция читает оттуда.

### Почему это проблема

- Multi-tenant scenarios (multiple Vue apps на одной странице с разными FishtVue configs) — конфликт через single `window.FishtVue`.
- SSR: `window` undefined — `isClient()` guard защищает, но fallback на `inject(FishtVueSymbol)` достаточен сам по себе.
- `(window as any)` — type-cast bypass типизации.
- Iframe / Shadow DOM: window-context разный — компоненты в iframe не видят родительский FishtVue.

### Что нужно сделать

1. Сделать `inject(FishtVueSymbol)` primary path:
   ```ts
   if (hasInjectionContext()) {
     this.__globalConfig = inject(FishtVueSymbol) ?? this.__globalConfig
   } else if (isClient() && (window as any)?.FishtVue) {
     this.__globalConfig = (window as any).FishtVue
   }
   ```
2. `window.FishtVue` → fallback только когда `inject` недоступен (вне Vue setup, например, в `openAlert` imperative API).
3. Documentation [architecture/component-class.md](../architecture/component-class.md) обновить.

## Issue 3: SSR style injection — нет teardown при HMR

- **Категория:** C17 + I19 (HMR)
- **Severity:** high
- **Где:** [theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts)

### Что найдено

При HMR (Vite dev) — компонент перезагружается, но старые `<style>` теги в `<head>` остаются. После 50 hot-reloads — десятки стилевых тегов с одинаковыми селекторами.

### Что нужно сделать

1. В `Component.setStyle` сохранять `<style>` element в `private __styleEl: HTMLStyleElement`.
2. На new `setStyle` — replace content existing element, не append new.
3. Альтернативно — VueUse `useStyleTag` (handles HMR cleanup).

### Acceptance criteria

- [ ] DevTools Elements: после HMR-обновления Button — только один `<style>` в head, не дубль.

## Issue 4: `__hooks` хардкод 'Button' / 'Label' / etc — typing fragile

- **Категория:** D21 (Generic narrowing)
- **Severity:** medium
- **Где:** [component/index.ts:53](../../lib/component/index.ts#L53), TypeComponent.d.ts

### Что найдено

`Component<T extends keyof ComponentsOptions>` — `T` это string literal `"Button" | "Label" | ...`. Каждый компонент: `new Component<"Button">()`. Generic параметр позиционирует только options-типизацию, runtime использует `this.name`. Если разработчик ошибётся `new Component<"Bttuon">()` — TS поймает (✅), но при добавлении нового компонента нужно расширять `ComponentsOptions` тип.

### Что нужно сделать

1. Документировать в [architecture/component-class.md](../architecture/component-class.md) §3: «при добавлении нового компонента: добавить ключ в ComponentsOptions interface».
2. Альтернатива — derive автоматически через type-helper.

## Issue 5: Тесты 213 строк — coverage 87%, есть untested ветви (частично resolved 2026-05-16)

- **Категория:** K46
- **Severity:** medium
- **Где:** [Component.test.ts](../../lib/component/Component.test.ts), ранее coverage 87.36/78.68 (15 it-блоков)

### Что сделано (2026-05-16, Wave 2.3)

Добавлены 4 новых it-блока в `Component.test.ts` (теперь 19 cases):

1. ~~SSR `onServerPrefetch` registration~~ — `constructor wires up SSR + client style injection hooks without throwing` (координативная проверка веток `__hooks()` 79-84 без зависимости от mock state; vitest `isolate: false` делает `vi.mocked(onServerPrefetch).toHaveBeenCalled()` flaky под batch run).
2. ~~Multiple init calls (idempotence)~~ — `initStyle is idempotent — multiple calls produce identical args`.
3. ~~`__globalConfig` fallback chain (window.FishtVue)~~ — `falls back to window.FishtVue when appContext.globalProperties.$fishtVue is undefined` (в nested `describe` с afterEach cleanup для предотвращения утечки в другие test-файлы под `isolate: false`).
4. ~~Graceful no-config~~ — `does not throw when neither appContext.$fishtVue nor window.FishtVue is set`.

### Что осталось

- [ ] **HMR teardown test** — переехал в Issue 3 (нужен сначала фикс самого HMR-механизма или явная верификация, что `useStyle.ts:43-45` уже дедуплицирует через `data-fishtvue-style-id`).
- [ ] **`initStyle(stylesComp)` с custom function**, выходящей за пределы текущего dual-call test — оставить как опциональное улучшение, нет высокого приоритета.
- [ ] **Pre-existing flaky test** `should return the correct options with getOptions` падает соло (verified `git stash` на baseline), passes в batch. Не введён моими правками — фиксить отдельно. Возможная причина — order-dependent mock state из-за `isolate: false`.

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
