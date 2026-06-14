---
title: Issues — Icons
summary: Аудит Icons — heroicons вернулись на eager namespace import + sync lookup (2026-06-14): prod-Vite/SSR-регрессия точечного dynamic import закрыта, иконки рендерятся; остаётся bundle-weight (весь набор в bundle, tree-shaking — future). Iconify CSP-неблагонадёжен (CDN-загрузка). API-уровень — variant prop, label prop, narrow IconType union — закрыт в 0.2.x.
updated: 2026-06-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/icons/
related-doc: ../components/icons.md
---

# Issues — Icons

## Сводка

| Severity | Count | Categories                                                                                                                                                                                                                                                  |
| -------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| critical | 0     | —                                                                                                                                                                                                                                                           |
| high     | 4     | A2, A4-5, C17, I45 (heroicons **bundle-weight** — eager namespace, tree-shaking deferred; ~~prod-Vite/SSR regression~~ ✅ resolved 2026-06-14, см. Issue 1); ~~C13/security (Iconify CSP)~~ ⚠️ docs portion resolved, full mitigation requires offline-prop |
| medium   | 1     | L53 (`unstyled` cross-cutting)                                                                                                                                                                                                                              |
| low      | 2     | E29.7 (N/A — static SVG), B10 (hardcode class — cross-cutting Wave 9)                                                                                                                                                                                       |

**Closed (2026-05-10):** Issue 3 (ARIA), Issue 4 (variant deprecation), Issue 5 (type narrowing), Issue 2 docs portion, Issue 8 docs portion.
**Re-opened (2026-06-13):** Issue 1 (I45) — build-замер показал, что точечный dynamic import не работает в prod-Vite (bare specifier `@heroicons/vue/...` не глобится плагином `dynamic-import-vars` → no code-split, иконка не резолвится в браузере без import map).
**Resolved-facet (2026-06-14):** prod-Vite/SSR-**регрессия** Issue 1 закрыта — heroicons возвращены на eager namespace import + sync lookup ([Icons.vue:15-16](../../lib/icons/Icons.vue#L15-L16)); иконки снова рендерятся в prod/SSR/любом bundler (browser-verified: close-button `XMark` + все демо-иконки). Остаётся **bundle-weight** (весь набор в bundle) — tree-shaking отложен (см. ниже).

## Issue 1: Heroicons — bundle-weight (eager namespace; regression resolved, tree-shaking deferred)

- **Категория:** I45 (иконки), A2/A4-5/C17 (bundle/SSR facets)
- **Severity:** ~~high (prod-Vite/SSR regression)~~ ✅ regression resolved 2026-06-14 → остаётся **high (bundle-weight)**
- **Где:** [Icons.vue `resolveHeroIcon`](../../lib/icons/Icons.vue#L80), [eager namespace import](../../lib/icons/Icons.vue#L15-L16)

> **Resolution (2026-06-14) — regression closed.** Точечный dynamic import откатан на **eager namespace import** `import * as HeroIconsOutline/Solid from "@heroicons/vue/24/{outline,solid}"` + **синхронный** lookup `set[convertToCamelCase(type) + "Icon"]` ([Icons.vue:77-89](../../lib/icons/Icons.vue#L77-L89)). Корректно в prod-Vite, SSR (sync — heroIcon резолвится до первого `await` в immediate-watcher, попадает в SSR-HTML) и любом bundler. Симптом, из-за которого пере-открыли: close-button Alert (`icon="XMark"`) рендерил `<i data-icon><!--v-if--></i>` — теперь рендерит SVG (browser-verified, 0 console-errors). +4 регрессионных теста (`Heroicons — eager sync resolution`), проверяют sync-рендер без flush.
>
> **Остаётся (bundle-weight).** `set[name]` — dynamic property access, поэтому bundler **не** tree-shake'ит: в bundle попадает весь heroicons-набор (замер 2026-06-13: **94.0 KB gzip**, 648 иконок outline+solid). Это осознанный trade-off (по запросу владельца 2026-06-14): для published-либы с open `IconType` union потребитель передаёт произвольные имена, которые нельзя предугадать в lib-build, поэтому namespace «работает для любого имени offline». Цена — bundle-вес.
>
> **История.** 2026-06-12 namespace-импорты заменены на точечный dynamic import (`import("@heroicons/vue/24/{outline|solid}/${Name}.js")`), на miss — Iconify-fallback; помечено resolved. **Measurement (2026-06-13) — regression:** build-замер (минимальный Vite-consumer + `sandbox:build`; heroicons 2.2.0, vite 7) показал, что `dynamic-import-vars` глобит только `./`/`../`, а bare `@heroicons/vue/...` игнорирует → 0 per-icon chunks, в выходном chunk остаётся буквальный `import()`, в `dist/index.html` нет import map → `TypeError: Failed to resolve module specifier` → иконка не рендерится в prod. Не видно в `vite dev` / Vitest (там bare-спецификаторы резолвятся), что маскировало проблему.
>
> **Future (tree-shaking).** Для уменьшения bundle без потери prod-корректности: sync `const`-реестр named-импортов (`import { CheckIcon } from "@heroicons/vue/24/outline"` — tree-shakeable, но покрывает только curated-набор; произвольные имена → Iconify) либо compile-time [`unplugin-icons`](https://github.com/unplugin/unplugin-icons) (inline SVG, требует build-плагина у потребителя). См. [components/icons.md §12](../components/icons.md#bundle-heroicons-tree-shaking).

### Что найдено

Runtime lookup по имени (`set[name]`) не позволяет bundler'у tree-shake'ить — heroicons-набор попадает в bundle целиком (~94 KB gzip). Регрессия точечного dynamic import (bare specifier не резолвится в prod-Vite) закрыта откатом на namespace.

### Что нужно сделать

- [x] **Регрессия:** вернуть корректный prod/SSR-рендер heroicons — ✅ eager namespace + sync lookup (2026-06-14).
- [ ] **Bundle-weight:** tree-shakeable резолв (const-реестр named-импортов / `unplugin-icons`) — deferred, см. Future выше. **Cross-cutting [Wave 2.2](../README.md#22-lazy-import-тяжёлых-deps)**.

### Acceptance criteria

- [x] `<Icons type="check" />` (и `"XMark"`, `"x-mark"`) рендерит SVG в prod-Vite / SSR (sync namespace lookup, не dynamic import) — browser-verified + 4 теста `Heroicons — eager sync resolution`.
- [ ] `<Icons type="check" />` в одиночку — в bundle попадает только CheckIcon (tree-shaking), не весь namespace. **Deferred** — текущий namespace-подход тянет весь набор; tree-shaking через const-реестр / `unplugin-icons` отложен (Wave 2.2).

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

1. ✅ Default `aria-hidden="true"` — heroicons имеют hardcoded; для Iconify добавлен явно ([Icons.vue:117](../../lib/icons/Icons.vue#L117)).
2. ✅ Prop `:label?: string` — если задан, wrapper `<i data-icon>` получает `role="img"` + `aria-label="<label>"` ([Icons.vue:115](../../lib/icons/Icons.vue#L115)).
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
2. ✅ `stileIcon` soft-deprecated с JSDoc `@deprecated` и runtime dev `console.warn` при использовании без `variant` ([Icons.vue:28–30](../../lib/icons/Icons.vue#L28-L30)).
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
- **Где:** [Icons.d.ts:113](../../lib/icons/Icons.d.ts#L113), [Icons.vue:40](../../lib/icons/Icons.vue#L40)

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
