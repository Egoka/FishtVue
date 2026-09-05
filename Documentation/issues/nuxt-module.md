---
title: Issues — Nuxt module + plugins
summary: Аудит lib/module + lib/plugins. Issue 4 (peer range @nuxt/kit) закрыт 2026-06-19 (Wave 2.1); Issues 1 (частично), 2, 5 закрыты 2026-09-05 — заведён nuxt.test.ts (lib/module 0% → 100% stmts), удалено мёртвое version-detection через require, реализован disableGlobalStyles. Остаются hardcoded FISHT_VUE_COMPONENTS, lib/plugins 0%, prefer-component-naming.
updated: 2026-09-05
audit-checklist: 60-point + Configuration support
source: lib/module/, lib/plugins/
related-doc: ../architecture/nuxt-module.md
---

# Issues — Nuxt module + plugins

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 2 | A2, A4-5 — cross-cutting packaging (см. [button.md](./button.md) Issues 8, 9); ~~C18~~ ✅, ~~J46 (module 0%)~~ ✅, ~~L53 (disableGlobalStyles)~~ ✅ 2026-09-05 |
| medium | 3 | D21, F30, K46 (lib/plugins 0%); ~~K52 (require dynamic)~~ ✅ 2026-09-05 |
| low | 2 | E29, B10 |

## ~~Issue 1: lib/module/nuxt.ts coverage 0% — нет тестов~~ ✅ resolved 2026-09-05 (частично — `lib/plugins` остаётся, см. Issue 7)

> **Закрыто 2026-09-05.** Заведён [lib/module/nuxt.test.ts](../../lib/module/nuxt.test.ts) — 11 тестов, `lib/module` **0% → 100% stmts / 75% branch**. `defineNuxtModule` мокается в тождественную функцию, `setup(options, nuxt)` вызывается напрямую с подставленными `defaults` — проверяется логика регистрации без поднятия Nuxt-приложения. Покрыты все четыре пункта плана ниже: список компонентов (включая `VirtualScroller`), `prefix`, `disableGlobalStyles` (обе ветки), `autoImport: false`. Сверх плана — инвариант «каждый named-экспорт compound-барреля зарегистрирован» (он и вскрыл пропажу `MenuItem`/`MenuGroup`/`AccordionItem`, см. Issue 3) и контракт `fieldsOmit` для `MODULE_OPTIONS`. Integration-тест через `@nuxt/test-utils` (п. 3 плана) **не** делался — остаётся вместе с Issue 7.

- **Категория:** J46
- **Severity:** ~~high~~
- **Где:** [lib/module/nuxt.ts](../../lib/module/nuxt.ts)

### Что найдено

```
lib/module/nuxt.ts: 0/0/0/0
```

102 строки Nuxt-module кода — нет ни одного теста. Auto-import 22 компонентов, plugin registration, version detection — всё untested.

### Что нужно сделать

1. Тестировать через `@nuxt/kit` test utilities или mock'ать setup-context.
2. Тесты:
   - Verify все 22 компонента registered (compare против lib/index.ts exports).
   - `prefix` option — переименование component names.
   - `disableGlobalStyles` — проверить, что server plugin не подключается.
   - `autoImport: false` — компоненты не registered.
3. Integration test через `@nuxt/test-utils` — сделать sandbox-test.

## ~~Issue 2: `getNuxtVersion()` через `require("nuxt/package.json")` — fragile в pure ESM~~ ✅ resolved 2026-09-05

> **Закрыто удалением, а не переписыванием.** Единственным потребителем `getNuxtVersion()` был `isNuxt4()`, а тот — строка `const importPath = isV4 ? "#app" : "#app"`: **обе ветки одинаковы**. Весь блок version-detection (`createRequire` + `require("nuxt/package.json")` + `isNuxt4`) существовал ради мёртвого выбора и вырезан целиком; в шаблоне плагина `'#app'` подставляется литералом. Pure-ESM-совместимость (Bun/Deno) достигнута без асинхронного `import ... with { type: "json" }` из плана ниже.
>
> В том же заходе исправлен связанный импорт: `from "path"` → `from "node:path"`. Голый спецификатор перехватывался legacy-пакетом `path@0.12.7` из devDependencies монорепозитория, который на современном Node падает с `util.isString is not a function`. Обнаружено сразу, как только модуль впервые попал под тест — в проде это выстрелило бы при любой резолюции, отдающей приоритет пакету перед builtin.

- **Категория:** K52, A4 (ESM/CJS dual hazard)
- **Severity:** ~~medium~~
- **Где:** [module/nuxt.ts](../../lib/module/nuxt.ts) — блок удалён

### Что найдено

```ts
const require = createRequire(import.meta.url)
const getNuxtVersion = () => {
  try {
    const nuxtPackage = require("nuxt/package.json")
    return nuxtPackage.version
  } catch {
    return "4.0.0"
  }
}
```

Использует `createRequire` (Node-only). Не работает в pure ESM окружении (Bun, Deno). Catch fallback на "4.0.0" — silent failure скрывает проблему.

### Что нужно сделать

1. Использовать pure ESM:
   ```ts
   async function getNuxtVersion() {
     try {
       const pkg = await import("nuxt/package.json", { with: { type: "json" } })
       return pkg.version
     } catch { return undefined }
   }
   ```
2. Или через `@nuxt/kit` API — если доступно.
3. Тест: Bun + Vite — модуль загружается без require-shim.

## Issue 3: Hardcoded `FISHT_VUE_COMPONENTS` list — ручная поддержка

- **Категория:** D21
- **Severity:** medium
- **Где:** [module/nuxt.ts](../../lib/module/nuxt.ts) (FISHT_VUE_COMPONENTS массив)

### Что найдено

Список 22 компонентов прописан явно. При добавлении нового компонента — нужно вручную дополнить массив. Ошибки: новый компонент не auto-imported, или удалённый — registers fail.

> **Риск подтверждён на практике (2026-09-05).** Ровно этот механизм и выстрелил, только на параллельном массиве `FISHT_VUE_SUBCOMPONENTS`: в нём были заведены `Column`/`ColumnGroup`/`FormField`/`FormSection`/`SelectOption`/`SelectGroup`, но **не** `MenuItem`/`MenuGroup`/`AccordionItem` — хотя [menu/index.ts](../../lib/menu/index.ts) и [accordion/index.ts](../../lib/accordion/index.ts) их экспортируют, а [02-installation.md](../02-installation.md) обещает «В Nuxt — глобальны». В Nuxt-приложении `<MenuItem>` без ручного импорта оставался unresolved.
>
> **Частично закрыто:** три записи добавлены, и заведён инвариант-тест — «каждый named-экспорт барреля `table`/`form`/`select`/`menu`/`accordion` присутствует в `FISHT_VUE_SUBCOMPONENTS`» ([nuxt.test.ts](../../lib/module/nuxt.test.ts), парсит `export { default as X }` из barrel-исходников). Повторить рассинхрон на compound-детях больше нельзя — тест упадёт.
>
> **Остаётся открытым** сам Issue: `FISHT_VUE_COMPONENTS` (top-level, 23 имени) по-прежнему заполняется руками, инвариант против [lib/index.ts](../../lib/index.ts) не заведён — тест проверяет только наличие `Table` и `VirtualScroller` точечно. Auto-derive (п. 1 ниже) не делался.

### Что нужно сделать

1. Auto-derive из [lib/index.ts](../../lib/index.ts) или из filesystem (`fs.readdirSync('./lib').filter(...)`).
2. ~~Тест: `FISHT_VUE_SUBCOMPONENTS` соответствует реальным экспортам compound-баррелей~~ ✅ 2026-09-05.
3. Тест: `FISHT_VUE_COMPONENTS` соответствует экспортам корневого barrel — **открыто**.

## ~~Issue 4: peer Nuxt range — `nuxt: ">=3.0.0"` и `@nuxt/kit ^4.1.2` несогласованы~~ ✅ resolved 2026-06-19 (Wave 2.1)

> **Status:** ✅ resolved 2026-06-19 (Wave 2.1). `@nuxt/kit`/`@nuxt/schema` peer-range расширен `^4.1.2` → `>=3.0.0` — согласован с `nuxt: ">=3.0.0"`. Nuxt 3 больше не получает несовместимый `@nuxt/kit` major 4.

**Что сделано (2026-06-19):**

- [lib/package.json](../../lib/package.json) — `@nuxt/kit`/`@nuxt/schema` peer = `>=3.0.0` (были `^4.1.2`); оба остаются optional. Сам monorepo собирается на Nuxt 3 (`@nuxt/kit ^3.17.3` в root) — старый `^4.1.2` противоречил реальности.
- Контракт — [lib/package.test.ts](../../lib/package.test.ts) (`@nuxt/kit`/`@nuxt/schema` peer === `>=3.0.0`, optional).
- Runtime detection `isNuxt4()` уже есть для разных API paths.

### Что найдено (was)

```json
"peerDependencies": { "@nuxt/kit": "^4.1.2", "@nuxt/schema": "^4.1.2", "nuxt": ">=3.0.0" }
```

`nuxt: ">=3.0.0"` допускал Nuxt 3+, но `@nuxt/kit: ^4.1.2` — только Nuxt 4. Пользователь Nuxt 3 получал `@nuxt/kit ^4.1.2` (новый major) → runtime-ошибки.

- **Категория:** ~~K49 (Vue/Nuxt peer ranges)~~ — закрыто
- **Severity:** ~~high~~
- **Где (was):** [lib/package.json:28-32](../../lib/package.json#L28-L32)

### Acceptance criteria

- [x] Установка fishtvue в Nuxt 3 проект — peer-range допускает `@nuxt/kit ^3.x` (нет принудительного major 4).
- [x] Аналогично для Nuxt 4 (`>=3.0.0` покрывает обе major).

## ~~Issue 5: `disableGlobalStyles: false` default — но что именно отключается?~~ ✅ resolved 2026-09-05

> **Ответ на вопрос заголовка: до 2026-09-05 — ничего.** Опция объявлялась в `defaults`, вычиталась из plugin-конфига через `MODULE_OPTIONS`/`fieldsOmit` и **нигде не читалась** — полный no-op. Значение `true` не отключало ничего.
>
> **Реализовано** по документированной здесь же семантике: при `disableGlobalStyles: true` не вызывается `addPlugin` для server-плагина [plugins/nuxt.ts](../../lib/plugins/nuxt.ts) (он пушит собранный `cssComponents` в `ssrContext.head` на хуке `app:rendered`) — то есть отключается SSR-инжект CSS. Client-плагин конфигурации (`addPluginTemplate` → `app.use(FishtVue, options)`) при этом **остаётся**: иначе компоненты потеряли бы config, локали и тему, а не только стили.
>
> Обе ветки покрыты тестами ([nuxt.test.ts](../../lib/module/nuxt.test.ts), describe «disableGlobalStyles»), включая отдельную проверку, что client-плагин не задет.

- **Категория:** L53
- **Severity:** ~~high~~
- **Где:** [module/nuxt.ts](../../lib/module/nuxt.ts) — `if (!options.disableGlobalStyles)` перед `addPlugin`

### Что найдено (was)

`disableGlobalStyles: false` — default. Если `true` — server plugin не должен инжектить CSS. Behavior не задокументировано в [Documentation/architecture/nuxt-module.md](../architecture/nuxt-module.md), не тестируется.

### Что нужно сделать

1. Тест: `disableGlobalStyles: true` — server plugin не подключается.
2. Документировать use-cases (например, для Tailwind potlight без global CSS).

## Issue 6: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md). Server plugin должен корректно инжектить styles в SSR.

## Issue 7: `lib/plugins/{Plugins,nuxt}` coverage 0%

- **Категория:** J46
- **Где:** [lib/plugins/](../../lib/plugins/), coverage 0%

### Что найдено

Plugins.ts 6 lines, nuxt.ts 22 lines — coverage 0%. Server plugin критичен для SSR-инжекции styles, но не тестируется.

### Что нужно сделать

1. Тест: server plugin собирает styles из всех Component-инстанций при SSR-render.
2. ~~Тест: `disableGlobalStyles` skip server plugin loading~~ ✅ 2026-09-05 — покрыт со стороны модуля ([nuxt.test.ts](../../lib/module/nuxt.test.ts)); сам `lib/plugins/nuxt.ts` по-прежнему 0%, п. 1 открыт.

## Issue 8: prefer-component-naming не задокументирован

- **Категория:** D25

`prefix: ""` default — компоненты regist'ятся как `<Button>`. С prefix `"Fv"` — `<FvButton>`. Документировать чётко.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `prefix` | ⚠️ | реализовано, но не тестировано |
| `autoImport` | ⚠️ | реализовано, но не тестировано |
| `disableGlobalStyles` | ⚠️ | Issue 5 |
| `mode` (server/client) | ⚠️ | через addComponent |
| `global` | ⚠️ | непонятная семантика — auto-import как global components? |

## Dual-API gap

Не применимо.
