---
title: Issues — Config (FishtVue plugin)
summary: Аудит config — нестабильный FishtVueSymbol (let + Symbol.toString comparison), window.FishtVue global, нет middleware/extensibility, baseStyle.ts coverage 0%, locale fallback не реализован.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support
source: lib/config/
related-doc: ../architecture/config.md
---

# Issues — Config

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 1 | C13 (FishtVueSymbol re-assigned + Symbol.toString comparison anti-pattern) |
| high | 5 | A2, A4-5, J46 (baseStyle 0% coverage), L53 (no fallback locale), L53 (no plugin extensibility) |
| medium | 4 | D21, F30 (locale fallback), G34, K46 (74% branch) |
| low | 2 | E29, B11 |

## Issue 1: CRITICAL — `FishtVueSymbol` через `let` + сравнение по `Symbol.toString()` — race condition

- **Категория:** C13 (architecture leak)
- **Severity:** **critical**
- **Где:** [config/index.ts:16](../../lib/config/index.ts#L16), [config/index.ts:71](../../lib/config/index.ts#L71), [config/index.ts:124](../../lib/config/index.ts#L124)

### Что найдено

```ts
export let FishtVueSymbol = Symbol()  // Initial: empty Symbol()
...
function isExistFishtVue<T>(func: (FishtVue: FishtVue) => T): T | undefined {
  if (FishtVueSymbol.toString() === Symbol("FishtVue").toString()) {  // Compare strings???
    ...
  }
}
...
install: (app, options) => {
  ...
  FishtVueSymbol = Symbol("FishtVue")  // Re-assign exported let!
}
```

Issues:
1. `Symbol("FishtVue").toString()` создаёт новый Symbol с description "FishtVue" каждый раз — `.toString()` всегда возвращает `"Symbol(FishtVue)"`. Логика "if symbol description matches" — анти-паттерн. Symbol identity должна сравниваться по reference (`===`), не по description.
2. `let FishtVueSymbol` экспортируется — другие модули видят old reference. После `install` reassigns — внешние импортёры получают застарелый Symbol → `inject(FishtVueSymbol)` возвращает `undefined`.
3. Multi-app scenario (`createApp` × 2 with different configs): второй `install` перезапишет global `FishtVueSymbol` — первый app сломается.

### Почему это проблема

- `inject(FishtVueSymbol)` после второго `install` ищет new Symbol, но провайдер первого app зарегистрирован под старой reference.
- Tests могут проходить только потому что в test-env single app.
- Production: SSR streaming с multi-tenant — race-condition.

### Что нужно сделать

1. Сделать Symbol const + stable:
   ```ts
   export const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")
   ```
2. Убрать reassign в install. Provider:
   ```ts
   app.provide(FishtVueSymbol, FishtVue)
   ```
3. Убрать `Symbol.toString()` сравнение. Использовать reference check:
   ```ts
   function isExistFishtVue<T>(func): T | undefined {
     let FishtVue = inject(FishtVueSymbol, undefined)
     if (!FishtVue && isClient()) FishtVue = (window as any).FishtVue
     if (FishtVue) return func(FishtVue)
   }
   ```
4. Тест: multi-app сценарий — два `createApp().use(FishtVue, ...)` — оба работают изолированно.

### Acceptance criteria

- [ ] `inject(FishtVueSymbol)` всегда работает после `install`.
- [ ] Multi-app scenario: configs не пересекаются.
- [ ] Тип `FishtVueSymbol` — `InjectionKey<FishtVue>` (type-safe inject).

## Issue 2: `baseStyle.ts` 703 строки coverage 0%

- **Категория:** J46
- **Severity:** high
- **Где:** [config/baseStyle.ts](../../lib/config/baseStyle.ts), coverage 0%

### Что найдено

`baseStyle.ts` 703 строки CSS — никакого теста не вызывает. Содержит global stylesheet, инжектируется через `BaseStylesComponent.initStyle(...)` ([config/index.ts:128](../../lib/config/index.ts#L128)).

### Почему это проблема

- Изменение в baseStyle (например, неправильный CSS-selector) пройдёт без CI-fail.
- Долгосрочно — мёртвый код может накопиться.

### Что нужно сделать

1. Тест: `mount(FishtVue plugin)` → assert что `<style>` инжектирован в head с ожидаемыми селекторами.
2. CSS-lint (stylelint) для baseStyle.ts.

## Issue 3: Нет fallback locale — если ключ отсутствует, возвращается undefined

- **Категория:** L53 / F30
- **Severity:** medium
- **Где:** [config/index.ts](../../lib/config/index.ts), [Component.t()](../../lib/component/index.ts) (через FishtVue.config.locale.messages)

### Что найдено

При `setActiveLocale("uk")` без `messages.uk` — `t("button.save")` возвращает undefined. Documentation [docs/content/ru/3.Configuration/3.Internationalization.md](../../docs/content/ru/3.Configuration/3.Internationalization.md) **не описывает** fallback chain.

### Что нужно сделать

1. В `t(key)` (предположительно в Component class):
   ```ts
   public t(key: string): string {
     const messages = this.__globalConfig?.config?.locale?.messages
     const active = this.__globalConfig?.config?.locale?.activeLocale
     const def = this.__globalConfig?.config?.locale?.defaultLocale ?? "en"
     return get(messages?.[active], key)
       ?? get(messages?.[def], key)
       ?? key  // Last resort: return key itself
   }
   ```
2. Документировать поведение в [Documentation/architecture/locale.md](../architecture/locale.md).

## Issue 4: Нет middleware / extensibility для install

- **Категория:** L53 (extensibility)
- **Severity:** high
- **Где:** [config/index.ts:110](../../lib/config/index.ts#L110)

### Что найдено

```ts
install: (app, options) => { ... }
```

Hardcoded install logic. Невозможно:
- Перехватить config до merge.
- Добавить custom plugins/components.
- Custom theme registration через app.use.

### Что нужно сделать

1. Расширить FishtVue API:
   ```ts
   FishtVue.use((config) => { /* mutate config */ })  // before install
   FishtVue.registerComponent(name, component)         // custom добавить
   FishtVue.extendTheme(theme)                          // custom theme
   ```
2. Documentation в [Documentation/architecture/config.md](../architecture/config.md) §10 Extensibility.

## Issue 5: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md), [component-class.md Issue 6](./component-class.md).

## Issue 6: 16 tests, branch coverage 74% — async + edge cases пропущены

- **Категория:** K46
- **Severity:** medium
- **Где:** [config/FishtVue.test.ts](../../lib/config/FishtVue.test.ts) (16 tests, 2 skipped)

### Что нужно сделать

Добавить тесты для:
- 2 skipped tests — разблокировать или удалить.
- `getDefaultOptions` для каждого theme name + invalid name.
- `setActiveLocale` для несуществующей locale.
- HMR scenario.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions` | ✅ | через getOptions() |
| `componentsStyle` global | ✅ | в config |
| `unstyled: true` | ⚠️ | хранится, но не enforced (см. Issue 6 в component-class.md) |
| Theme tokens | ✅ | through linksTheme() |
| Runtime theme switch (`usePreset`) | ❌ | Не упомянуто в config — Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает, но не реализовано |
| Locale switch | ✅ | через setActiveLocale |
| Locale fallback | ❌ | Issue 3 |

## Dual-API gap

Не применимо.
