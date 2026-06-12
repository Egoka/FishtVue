---
title: Issues — Icons
summary: Аудит Icons — heroicons переведены на точечный dynamic import, но измерение (2026-06-13) показало, что подход ломается в prod-Vite (bare specifier, no code-split, no SSR) → Issue 1 re-opened как regression; Iconify CSP-неблагонадёжен (CDN-загрузка). API-уровень — variant prop, label prop, narrow IconType union — закрыт в 0.2.x.
updated: 2026-06-13
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/icons/
related-doc: ../components/icons.md
---

# Issues — Icons

## Сводка

| Severity | Count | Categories                                                                                                                            |
| -------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| critical | 0     | —                                                                                                                                     |
| high     | 4     | A2, A4-5, C17, I45 (heroicons bundle — **regression**, см. Issue 1); ~~C13/security (Iconify CSP)~~ ⚠️ docs portion resolved, full mitigation requires offline-prop |
| medium   | 1     | L53 (`unstyled` cross-cutting)                                                                                                        |
| low      | 2     | E29.7 (N/A — static SVG), B10 (hardcode class — cross-cutting Wave 9)                                                                 |

**Closed (2026-05-10):** Issue 3 (ARIA), Issue 4 (variant deprecation), Issue 5 (type narrowing), Issue 2 docs portion, Issue 8 docs portion.
**Re-opened (2026-06-13):** Issue 1 (I45) — build-замер показал, что точечный dynamic import не работает в prod-Vite (bare specifier `@heroicons/vue/...` не глобится плагином `dynamic-import-vars` → no code-split, иконка не резолвится в браузере без import map). Ранее ошибочно помечен resolved 2026-06-12 (regression была не видна в `vite dev` / Vitest, где bare-спецификаторы резолвятся).

## Issue 1: Heroicons — точечный dynamic import не работает в prod-Vite (regression)

- **Категория:** I45 (иконки точечно)
- **Severity:** high (re-opened 2026-06-13)
- **Где:** [Icons.vue `resolveHeroIcon`](../../lib/icons/Icons.vue#L72)

> **История.** 2026-06-12 namespace-импорты `import * as HeroIconsOutline/Solid from "@heroicons/vue/24/{outline,solid}"` (тянули весь набор через runtime-lookup) заменены на точечный dynamic import конкретной иконки: `import(\`@heroicons/vue/24/{outline|solid}/${Name}.js\`)` ([Icons.vue:72](../../lib/icons/Icons.vue#L72)), на miss — Iconify-fallback. Помечено resolved.
>
> **Measurement (2026-06-13) — regression.** Реальный build-замер (минимальный Vite-consumer + `sandbox:build`; heroicons 2.2.0, vite 7) показал: **подход не работает в production-сборке Vite.**
>
> - Плагин `dynamic-import-vars` (Vite/Rollup) глобит только пути на `./`/`../`; **bare-спецификатор `@heroicons/vue/...` игнорируется** (`dynamicImportToGlob → shouldIgnore → return null`, поэтому даже warning нет) → **per-icon code-split НЕ происходит.**
> - В выходном chunk остаётся буквальный `import(\`@heroicons/vue/24/{solid,outline}/${name}.js\`)` (подтверждено в main-chunk `sandbox:build`, 2 шт.); в `dist/index.html` **нет import map** → в браузере `import("@heroicons/vue/24/outline/CheckIcon.js")` бросает `TypeError: Failed to resolve module specifier` → **иконка не рендерится в prod.**
> - Измерено (одна `<Icons type="check" />`, gzip): **before** (namespace, оба variant) — 440 KB raw / **94.0 KB gzip**, все 648 иконок inlined; **after** (текущий) — 60 KB raw / **23.9 KB gzip**, но **0 heroicon-chunks и 0 иконок в bundle** (битый bare-import). «Экономия» иллюзорна — иконки просто отсутствуют, а не tree-shake'нуты.
> - Regression не видна в `vite dev` (dev-сервер резолвит bare-спецификаторы) и в Vitest/Node (резолв через node_modules) → +8 cross-component тестов проходят, маскируя проблему.
>
> **Fix path.** Sync `const`-реестр named-импортов (`import { CheckIcon } from "@heroicons/vue/24/outline"`) — tree-shakeable, рендерится в SSR, работает в prod-Vite; либо `unplugin-icons` (compile-time inline SVG). Dynamic/Iconify fallback — для произвольных имён. См. [components/icons.md §12](../components/icons.md#bundle-heroicons-tree-shaking).

### Что найдено

`@heroicons/vue` помечен external в rollup — но в потребительском Vite-билде heroicons map (~2k экспортов) попадает целиком из-за runtime lookup `componentsMap[type]`. Каждый импорт `<Icons type="check">` тянет ~200kb minified heroicons.

### Что нужно сделать

См. [button.md Issue 7](../button.md) — fix через `defineAsyncComponent`. **Cross-cutting [Wave 2.2](../README.md#22-lazy-import-тяжёлых-deps)** — затрагивает Button/Loading/Switch/Alert. Отложено в отдельный PR из-за высокого риска регрессий sync → async render.

```ts
const HeroIcon = defineAsyncComponent({
  loader: () => import(`@heroicons/vue/24/${variant}/${pascalCase(type)}.vue`),
  errorComponent: FallbackIcon
})
```

С dynamic import bundler tree-shake'ает только используемые.

### Acceptance criteria

- [ ] `<Icons type="check" />` в одиночку — в рантайме грузится только CheckIcon (отдельный chunk), не весь namespace. **НЕ выполнено (2026-06-13):** build-замер показал, что `dynamic-import-vars` не глобит bare-спецификатор `@heroicons/vue/...` → 0 per-icon chunks, bare `import()` не резолвится в prod-браузере (нет import map) → иконка ломается. Требуется fix (sync `const`-реестр named-импортов или `unplugin-icons`).

## Issue 2: Iconify-загрузка через CDN — CSP risk

- **Категория:** C13 / security (CSP)
- **Severity:** high
- **Где:** [Icons.vue](../../lib/icons/Icons.vue) (через `@iconify/vue`)

### Что найдено

`@iconify/vue` lazy-загружает SVG-data с CDN `api.iconify.design` при первом render'е. Если у потребителя CSP `connect-src 'self'` — иконки не загружаются (тихая ошибка).

### Почему это проблема

- Multi-tenant SaaS / enterprise apps часто имеют strict CSP.
- Documentation [components/icons.md](../components/icons.md) §12 уже флагает, но без фикса.
- Зависимость от внешнего CDN — supply-chain risk (если api.iconify.design компрометирован).

### Что нужно сделать

1. ~~Документировать в [components/icons.md](../components/icons.md) §12 как обязательный параграф.~~ ✅ **resolved 2026-05-10** — §12 Security содержит полный mitigation-блок с CSP-impact, supply-chain risk, offline failure и кодом `addCollection(<json>)`.
2. ~~Предложить bundling через `@iconify/tools`~~ ✅ **resolved 2026-05-10** — рекомендация документирована.
3. Добавить prop `:offline?: boolean` или env-detection — если CDN недоступен, fallback на placeholder. **deferred** — отдельный PR, рассматривается как future enhancement в Wave 8 i18n / RTL polish.

### Acceptance criteria

- [x] Documentation §12 Security содержит CSP-risk блок и offline mitigation через `addCollection`.
- [ ] `:offline?: boolean` prop — отложен (future PR).

## ~~Issue 3: ARIA — нет aria-label для семантических иконок~~ ✅ resolved 2026-05-10

- **Категория:** E29.1
- **Severity:** ~~medium~~ → resolved
- **Где:** [Icons.vue](../../lib/icons/Icons.vue)

### Что найдено

~~SVG рендерится без `aria-label` или `aria-hidden`. Screen reader озвучивает имя иконки сырым (например, «check icon») или путается.~~

### Что сделано

1. ✅ Default `aria-hidden="true"` — heroicons имеют hardcoded; для Iconify добавлен явно ([Icons.vue:95](../../lib/icons/Icons.vue#L95)).
2. ✅ Prop `:label?: string` — если задан, wrapper `<i data-icon>` получает `role="img"` + `aria-label="<label>"` ([Icons.vue:93](../../lib/icons/Icons.vue#L93)).
3. ✅ Документировано в [components/icons.md §12](../components/icons.md#12-accessibility--security) с wrapper-pattern rationale (heroicons render-функции хардкодят aria-hidden и не пробрасывают $attrs — wrapper-based pattern эквивалентен по семантике).

### Реализованная семантика

```vue
<!-- декоративная: -->
<i data-icon>
  <svg aria-hidden="true">…</svg>
</i>

<!-- семантическая: -->
<i data-icon role="img" aria-label="Delete row">
  <svg aria-hidden="true">…</svg>
</i>
```

### Acceptance criteria

- [x] Default режим: wrapper прозрачен, SVG aria-hidden="true".
- [x] `label` prop: wrapper role=img + aria-label, SVG остаётся aria-hidden.
- [x] 4 теста в [Icons.test.ts](../../lib/icons/Icons.test.ts) (ARIA describe-блок).

## ~~Issue 4: `stileIcon` — опечатка от "styleIcon"~~ ✅ deprecation added 2026-05-10

- **Категория:** D25 (консистентность naming)
- **Severity:** ~~medium~~ → low (soft-deprecated, runtime warn)
- **Где:** [Icons.d.ts:102–107](../../lib/icons/Icons.d.ts#L102-L107)

### Что найдено

~~`stileIcon?: "outline" | "solid"` — «Stile» — опечатка / транслит. Должно быть `"styleIcon"` или `"variant"`.~~

### Что сделано

1. ✅ Добавлен prop `variant?: "outline" | "solid"` ([Icons.d.ts:84](../../lib/icons/Icons.d.ts#L84)).
2. ✅ `stileIcon` soft-deprecated с JSDoc `@deprecated` и runtime dev `console.warn` при использовании без `variant` ([Icons.vue:19–21](../../lib/icons/Icons.vue#L19-L21)).
3. ⏳ В `1.0` удалить — **deferred** (separate breaking-change PR).
4. ⏳ Codemod для замены — **deferred** ([Wave 12](../README.md#-wave-12--migration--dx)).

### Resolution chain (текущая семантика)

```ts
variant = props.variant ?? props.stileIcon ?? options?.variant ?? "outline"
```

### Acceptance criteria

- [x] `variant` prop работает (4 теста).
- [x] `stileIcon` без `variant` эмитит dev `console.warn` (1 тест).
- [x] `variant` overrides `stileIcon` без warn (1 тест).
- [x] `componentsOptions.Icons.variant` подхватывается (1 тест).
- [ ] Codemod `stileIcon` → `variant` — Wave 12.
- [ ] Hard removal в `1.0` — Wave 12.

## ~~Issue 5: `type: string` — open union, нет narrowing~~ ✅ resolved 2026-05-10 (intermediate)

- **Категория:** D21 (Generic / type narrowing)
- **Severity:** ~~medium~~ → resolved
- **Где:** [Icons.d.ts:18–61](../../lib/icons/Icons.d.ts#L18-L61)

### Что найдено

~~`type: string` принимает любую строку. Опечатка `<Icons type="chek" />` пройдёт компиляцию.~~

### Что сделано

Intermediate approach — без build-script, для maintenance simplicity:

1. ✅ `HeroIconName` — hand-curated union из 30 наиболее частых имён ([Icons.d.ts:18–48](../../lib/icons/Icons.d.ts#L18-L48)).
2. ✅ `IconifyIconName = \`${string}:${string}\`` — template literal для Iconify-паттерна ([Icons.d.ts:53](../../lib/icons/Icons.d.ts#L53)).
3. ✅ `IconType = HeroIconName | IconifyIconName | (string & {})` — публичный union, `(string & {})` сохраняет open-string fallback для всех остальных heroicons / arbitrary имён ([Icons.d.ts:61](../../lib/icons/Icons.d.ts#L61)).
4. ✅ `type: IconType` в `IconsProps` ([Icons.d.ts:77](../../lib/icons/Icons.d.ts#L77)).

Volar даёт autocomplete для:

- 30 популярных heroicons (`"check"`, `"chevron-up"`, …).
- Iconify-паттерна (`"mdi:..."` подсказывает `mdi:` префикс).

Не блокирует произвольные строки — runtime look-up в Heroicons / Iconify map'ах не изменился.

### Trade-off

Полный union всех ~280 heroicons имён потребовал бы build-script (`scripts/genHeroIconNames.ts` → `lib/icons/heroicon-names.d.ts`), который пересобирается при каждом bump `@heroicons/vue`. **Deferred to roadmap** — упоминается в [Wave 10.4 API consistency](../README.md#-wave-10--polish--dx).

### Acceptance criteria

- [x] `<Icons type="che">` → Volar предлагает `"check"`.
- [x] `<Icons type="mdi:home">` — type accepted без warning.
- [x] `<Icons type="totally-unknown-icon-name">` — compile OK через `(string & {})`.
- [x] `pnpm typecheck` clean.
- [ ] Build-script для полного heroicon union — Wave 10.4.

## Issue 6: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](../button.md). **Cross-cutting** Wave 2.1 / 2.3 / 3.1 — не входит в scope icons-уровня.

## Issue 7: prefers-reduced-motion — нет (если иконка animated)

- **Категория:** E29.7
- **Severity:** low → **N/A**

Static SVG — OK. Если animated icons (например, через CSS) — добавить guard. На текущей реализации не применимо.

## ~~Issue 8: RTL — иконки направления (arrow-left/right)~~ ✅ docs resolved 2026-05-10

- **Категория:** F31
- **Severity:** ~~low~~ → docs resolved

Иконки `arrow-left`, `arrow-right`, `chevron-*` — буквально направлены. В RTL должны зеркалиться.

✅ **Документировано** в [components/icons.md](../components/icons.md):

- §12 A11y — упоминание RTL caveat.
- §16 FAQ — практический рецепт с CSS `[dir="rtl"] [data-rtl-mirror] { transform: scaleX(-1); }` + per-instance `:style` вариант.

Прямой код-фикс (`useDirectionality()` composable, `dir`-aware Tailwind logical classes) — Wave 8.1 cross-cutting RTL effort.

## Issue 9: Hardcoded default class

- **Категория:** B10
- **Severity:** low
- **Где:** [Icons.d.ts:113](../../lib/icons/Icons.d.ts#L113), [Icons.vue:35](../../lib/icons/Icons.vue#L35)

### Что найдено

```
class: "h-5 w-5 text-gray-900 dark:text-gray-100" | StyleClass
```

`text-gray-900` хардкоден как литерал. Должно быть semantic token (`text-foreground`).

### Что нужно сделать

См. [switch.md Issue 12](../switch.md). **Cross-cutting [Wave 9](../README.md#-wave-9--theming-polish)** — требует расширения [theme/uno.ts](../../lib/theme/uno.ts) с semantic-token mappings; затрагивает большинство компонентов.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                             |
| ------------------------- | ----------- | ----------------------------------------------------------------------- |
| `componentsOptions.Icons` | ✅          | `class` + `variant` ([Icons.d.ts:158](../../lib/icons/Icons.d.ts#L158)) |
| `componentsStyle` global  | N/A         | Icons не имеет mode-enum, использует `variant` локально                 |
| `unstyled: true`          | ❌          | default class всегда применяется — Wave 3.1 cross-cutting               |
| Theme tokens vs hardcode  | ⚠️          | `text-gray-900 dark:text-gray-100` хардкоден (Issue 9) — Wave 9         |
| Runtime theme switch      | ⚠️          | через class только                                                      |
| `t()` для текста          | N/A         | label передаётся пользователем — он отвечает за локализацию             |
| Runtime locale switch     | N/A         | —                                                                       |

## Dual-API gap

Не применимо.
