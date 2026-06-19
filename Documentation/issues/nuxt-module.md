---
title: Issues — Nuxt module + plugins
summary: Аудит lib/module + lib/plugins — coverage 0%, hardcoded version detection через require (Nuxt 3 vs 4), нет тестов SSR injection, FISHT_VUE_COMPONENTS list требует ручной поддержки. Issue 4 (peer range @nuxt/kit ^4.1.2 → >=3.0.0) закрыт 2026-06-19 (Wave 2.1).
updated: 2026-06-19
audit-checklist: 60-point + Configuration support
source: lib/module/, lib/plugins/
related-doc: ../architecture/nuxt-module.md
---

# Issues — Nuxt module + plugins

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 5 | A2, A4-5, C18 (Nuxt module), J46 (0% coverage), L53 (disableGlobalStyles нет тестов) |
| medium | 4 | D21, K52 (require dynamic), F30, K46 |
| low | 2 | E29, B10 |

## Issue 1: lib/module/nuxt.ts coverage 0% — нет тестов

- **Категория:** J46
- **Severity:** high
- **Где:** [lib/module/nuxt.ts](../../lib/module/nuxt.ts), coverage 0%

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

## Issue 2: `getNuxtVersion()` через `require("nuxt/package.json")` — fragile в pure ESM

- **Категория:** K52, A4 (ESM/CJS dual hazard)
- **Severity:** medium
- **Где:** [module/nuxt.ts:10-15](../../lib/module/nuxt.ts#L10-L15)

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

### Что нужно сделать

1. Auto-derive из [lib/index.ts](../../lib/index.ts) или из filesystem (`fs.readdirSync('./lib').filter(...)`).
2. Тест: `FISHT_VUE_COMPONENTS` соответствует реальным экспортам.

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

## Issue 5: `disableGlobalStyles: false` default — но что именно отключается?

- **Категория:** L53
- **Severity:** high
- **Где:** [module/nuxt.ts](../../lib/module/nuxt.ts) defaults

### Что найдено

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
2. Тест: `disableGlobalStyles` skip server plugin loading.

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
