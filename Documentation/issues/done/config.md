---
title: Issues — Config (FishtVue plugin) [resolved]
summary: Все 6 audit issues закрыты 2026-05-20 — FishtVueSymbol стабилизирован (const InjectionKey<FishtVue>), baseStyle покрыт тестами, locale fallback chain в t(), extensibility API (use/registerComponent/extendTheme), 2 skipped теста разблокированы.
updated: 2026-05-20
audit-checklist: 60-point + Configuration support
source: lib/config/
related-doc: ../../architecture/config.md
---

# Issues — Config (resolved)

Файл перенесён в `./done/` после закрытия всех 6 audit issues. Severity matrix: 1/5/4/2 → 0/0/0/0.

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 0 | — |
| medium | 0 | — |
| low | 0 | — |

## ~~Issue 1: CRITICAL — `FishtVueSymbol` через `let` + сравнение по `Symbol.toString()` — race condition~~ ✅ resolved 2026-05-20

- **Категория:** C13 (architecture leak)
- **Severity:** ~~critical~~
- **Где:** [config/index.ts:18](../../../lib/config/index.ts#L18), [config/index.ts:81](../../../lib/config/index.ts#L82)
- **Resolution:** symbol теперь `export const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")`; reassign в install удалён; `isExistFishtVue` использует `inject(FishtVueSymbol)` primary path + `window.FishtVue` fallback вне setup; type-cast `InjectionKey<string>` → `InjectionKey<FishtVue>` в FishtVue.d.ts:73.

### Acceptance criteria

- [x] `inject(FishtVueSymbol)` всегда работает после `install` (verified by FishtVue.test.ts > "plugin provides instance under FishtVueSymbol").
- [x] Multi-app scenario: configs не пересекаются (verified by FishtVue.test.ts > "multi-app isolation").
- [x] Тип `FishtVueSymbol` — `InjectionKey<FishtVue>` (type-safe inject).

## ~~Issue 2: `baseStyle.ts` 703 строки coverage 0%~~ ✅ resolved 2026-05-20

- **Категория:** J46
- **Severity:** ~~high~~
- **Где:** [config/baseStyle.ts](../../../lib/config/baseStyle.ts)
- **Resolution:** 2 теста в [FishtVue.test.ts](../../../lib/config/FishtVue.test.ts) > "baseStyle injection (Issue 2)" покрывают: (a) дефолтная инжекция содержит `@layer fishtvue` + `--fv-translate-x` CSS-переменную из baseStyle.ts; (b) `optionsTheme.layers: "reset, base"` оборачивает baseStyle в кастомные `@layer reset, base; @layer fishtvue { ... }`. Проверка через `cssComponents` Map устойчивее к DOM-cleanup между тестами в shared-worker сценарии.

## ~~Issue 3: Нет fallback locale — если ключ отсутствует, возвращается undefined~~ ✅ resolved 2026-05-20

- **Категория:** L53 / F30
- **Severity:** ~~medium~~
- **Где:** [component/index.ts:184–199](../../../lib/component/index.ts#L184-L199)
- **Resolution:** `Component.t(key)` теперь возвращает `string` (не nullable) с fallback chain: `messages[active][key] → messages[default][key] → String(key)`. Сигнатура обновлена в TypeComponent.d.ts:85.
- **Breaking change:** SFC-сайты с pattern `X.t("k") ?? "fallback"` — `??` теперь dead code, но не ломается (всегда truthy non-nullish). Подробности в [locale.md §3 + §18](../../architecture/locale.md).

### Acceptance criteria

- [x] 6 тестов в Component.test.ts > "t() — locale fallback chain (Issue 3)" покрывают: active, default fallback, key as last resort, empty key, dot-path, string return type.
- [x] Документация обновлена: [locale.md](../../architecture/locale.md), [component-class.md](../../architecture/component-class.md).

## ~~Issue 4: Нет middleware / extensibility для install~~ ✅ resolved 2026-05-20

- **Категория:** L53 (extensibility)
- **Severity:** ~~high~~
- **Где:** [config/index.ts:180–212](../../../lib/config/index.ts#L180-L212)
- **Resolution:** добавлены 3 extensibility-метода на default export plugin'а:
  - `FishtVue.use(middleware)` — pre-install config mutator (queue of fns).
  - `FishtVue.registerComponent(name, component)` — global component registry, регистрируется в `app.component()` при каждом install.
  - `FishtVue.extendTheme(name, theme)` — custom theme registry, доступен через `optionsTheme.nameTheme`.
- **Tests:** 3 теста в FishtVue.test.ts > "Extensibility API (Issue 4)".
- **Docs:** [architecture/config.md §10.5](../../architecture/config.md#105-extensibility).

## ~~Issue 5: SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-05-20 (pointer-only)

- **Resolution:** Pointer cross-ref на:
  - [component-class.md Issue 6](../component-class.md) — ✅ resolved 2026-05-11 (`unstyled` enforcement via `Component.setStyle` guard).
  - [button.md Issues 1, 8, 9, 14](../button.md) — Wave 2.1 packaging work (root-level `sideEffects`, `exports` map, ESM-only). Не config/-localized; отслеживается в Wave 2.1 [issues/README.md](../README.md).

## ~~Issue 6: 16 tests, branch coverage 74% — async + edge cases пропущены~~ ✅ resolved 2026-05-20

- **Категория:** K46
- **Severity:** ~~medium~~
- **Где:** [config/FishtVue.test.ts](../../../lib/config/FishtVue.test.ts)
- **Resolution:**
  - 2 skipped tests unblocked: "should return undefined when accessing getDefaultLocale without plugin", "should warn and return false when locale configuration is undefined in setActiveLocale".
  - Новый coverage: per-theme resolve (Aurora/Harmony/Sapphire + invalid → Aurora fallback), `setActiveLocale` для non-existent locale.
  - 16 → 29 тестов в FishtVue.test.ts.

## ~~Issue 7: `install()` мутирует встроенные пресеты тем и локали — утечка конфига между запросами~~ ✅ resolved 2026-09-05

- **Категория:** C18 (SSR), D22 (контракт мутации)
- **Severity:** ~~high~~
- **Где:** [config/index.ts](../../../lib/config/index.ts) — `getDefaultOptions()`

> Заведён и закрыт в один заход. Обнаружен косвенно: четыре новых coverage-теста проходили по отдельности и падали в полной сюите — классический признак утечки состояния между файлами. Причина оказалась не в тестах.
>
> **Что было.** `install()` собирает конфиг как `deepMerge(defaults, userOptions)`, а `deepMerge` по канону библиотеки **мутирует первый аргумент** — это зафиксировано в [utilities/objectHandler.md](../../utilities/objectHandler.md) (Issue 8) вместе с безопасным паттерном `deepMerge(deepCopy(defaults), overrides)`. Но `getDefaultOptions()` возвращал модульные синглтоны **по ссылке**: `resolveTheme()` отдавал сам импортированный пресет, а `locale.messages` — сами объекты `Locales.en` / `Locales.ru`.
>
> Итог: любой `app.use(FishtVue, { theme, locale })` **навсегда портил** встроенные пресеты и локали для всего процесса. Проверено экспериментально:
>
> ```
> Aurora.semantic  до  {"customThemeColor":0,"customThemeColorContrast":0}
> Aurora.semantic  после {"customThemeColor":210,"customThemeColorContrast":0,"injected":"boom"}
> Harmony.semantic после {"customThemeColor":210,"customThemeColorContrast":0,"injected":"boom"}
> en.save          до "Save"  после "MUTATED"
> ```
>
> Обратите внимание на Harmony: все три пресета разделяют один `defaultSemantic`/`defaultPrimitive` ([themes.test.ts](../../../lib/theme/themes/themes.test.ts) фиксирует это отдельным кейсом), поэтому правка «только Aurora» протекала во все темы сразу.
>
> **Где это било по-настоящему — SSR.** Один Node-процесс обслуживает много запросов; конфиг первого запроса становился дефолтом для всех последующих. Рядом: несколько Vue-приложений на странице (микрофронтенды) — второе наследовало настройки первого; и `usePreset(Aurora)` после кастомной установки применял уже испорченный пресет.
>
> **Фикс** — ровно тот паттерн, который библиотека сама документирует: `getDefaultOptions()` отдаёт `deepCopyObject()` пресета и локалей. `deepCopyObject` уже был импортирован в файле, просто не применялся к дефолтам.
>
> **Регрессия** — [defaultsIsolation.test.ts](../../../lib/config/defaultsIsolation.test.ts), 8 кейсов: непорченность Aurora, непротекание в Harmony/Sapphire и общий `defaultSemantic`, отсутствие чужих ключей в пресете, чистые дефолты у второго app, целостность `en` и `ru`, и текст по умолчанию у второго app после переопределения первым.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions` | ✅ | через getOptions() |
| `componentsStyle` global | ✅ | в config |
| `unstyled: true` | ✅ | enforced через Component.setStyle ([component-class.md Issue 6](../component-class.md) ✅ 2026-05-11) |
| Theme tokens | ✅ | through linksTheme() |
| Runtime theme switch (`usePreset`) | ❌ | Wave 3.3 — отдельная design-задача (theme runtime API) |
| Custom theme registration | ✅ | через `FishtVue.extendTheme(name, theme)` (Issue 4) |
| Locale switch | ✅ | через setActiveLocale |
| Locale fallback | ✅ | Issue 3 |
| Middleware / pre-install hooks | ✅ | через `FishtVue.use(mw)` (Issue 4) |
| Global custom components | ✅ | через `FishtVue.registerComponent(name, ctor)` (Issue 4) |

## Dual-API gap

Не применимо.
