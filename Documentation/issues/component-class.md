---
title: Issues — Component class (`Component<T>`)
summary: 1/10 issues закрыт 2026-05-11 (Issue 6 — unstyled enforcement через setStyle guard, cross-cutting fix → 22 компонента). Открытые — Issue 1 (dup initStyle, 3/22 progress), Issue 2 (window.FishtVue coupling), Issue 3 (HMR teardown), Issue 4 (generic narrowing).
updated: 2026-05-11
audit-checklist: 60-point + Configuration support
source: lib/component/
related-doc: ../architecture/component-class.md
---

# Issues — Component class

## Сводка

| Severity | Count (open) | Categories |
|---|---|---|
| critical | 0 | — |
| high | 4 | C13 (window.FishtVue coupling), C17 (style injection paths), D24, K46 (87% coverage) |
| medium | 3 | D21 (generic narrowing), B11, K46 |
| low | 2 | E29.7 (motion not at base), N59 |

## Issue 1: Double initStyle — onServerPrefetch + onMounted + manual call в каждом компоненте

- **Категория:** C17 (SSR style injection)
- **Severity:** high
- **Где:** [component/index.ts:81-82](../../lib/component/index.ts#L81-L82) + каждый component (`onMounted(() => Component.initStyle())`)

### Что найдено

Constructor `Component<T>` уже вызывает:
```ts
onServerPrefetch(() => this.initStyle())
vueOnMounted(() => this.initStyle())
```

Но КАЖДЫЙ компонент в lib/ дублирует:
```ts
onMounted(() => { Button.initStyle() })  // Button.vue:347
onMounted(() => Label.initStyle())        // Label.vue:57
onMounted(() => { Switch.initStyle() })   // Switch.vue:159
// и так далее во всех 22
```

Это:
- Двойная инжекция стилей при mount (хотя `__setStyle` дедуплицирует — runtime-cost остаётся).
- Излишний код в каждом компоненте.
- Конфликт паттернов: одни компоненты полагаются на base-class-hook, другие добавляют ручной — inconsistent.

### Почему это проблема

- Documentation [components/label.md](../components/label.md) §18 уже отмечает: «raw `onMounted(() => Label.initStyle())` is duplicate».
- Cross-cutting baroque pattern в 22 компонентах.

### Что нужно сделать

1. Проверить, что `Component.__hooks()` действительно вызывает `initStyle()` корректно (line 81-82 — да).
2. Удалить `onMounted(() => X.initStyle())` из всех 22 SFC.
3. Альтернатива: убрать auto-hook из `Component<T>` constructor и оставить explicit вызов в каждом SFC (но тогда SSR-safety теряется).

**Рекомендация — оставить auto-hook, удалить дубликаты.**

### Acceptance criteria

- [ ] Все 22 SFC не вызывают `Component.initStyle()` явно.
- [ ] Стили инжектятся при SSR + mount (сохраняется текущее behavior).

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

## Issue 5: Тесты 213 строк — coverage 87%, есть untested ветви

- **Категория:** K46
- **Severity:** medium
- **Где:** [Component.test.ts](../../lib/component/Component.test.ts), coverage 87.36/78.68

### Что нужно сделать

Добавить тесты для: SSR `onServerPrefetch`, HMR teardown (после Issue 3), multiple init calls (idempotence), `initStyle(stylesComp)` с custom function.

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

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions` | ✅ | через `Component.getOptions()` |
| `componentsStyle` global | ✅ | через `Component.componentsStyle()` (доступен), но не у всех компонентов используется (см. component-issues docs) |
| `unstyled: true` | ✅ | (2026-05-11) `Component.setStyle()` возвращает `""` при `config.unstyled === true` — cross-cutting fix для 22 компонентов |
| Theme tokens | ✅ | через `Component.initStyle(stylesComp)` callback |
| `t(key)` для текста | ✅ | через `Component.t(key)` |
| Runtime locale switch | ✅ | если использует `t()` — реактивен через computed |
| Provide/inject через FishtVueSymbol | ✅ | основной механизм + window fallback (Issue 2) |

## Dual-API gap

Не применимо.
