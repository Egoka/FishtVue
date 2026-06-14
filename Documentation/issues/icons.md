---
title: Issues — Icons
summary: Аудит Icons — heroicons переведены на tree-shakeable const-реестр explicit named-импортов (2026-06-14, Issue 1): bundler оставляет только curated-набор (37 имён ≈ 11 KB gzip) вместо всех 648 (~94 KB); sync lookup сохранён → prod-Vite/SSR-корректность не теряется; имена вне набора → Iconify-fallback. Iconify CSP — docs-only (offline-prop declined, addCollection-mitigation в §12). API-уровень (variant, label, narrow IconType) закрыт в 0.2.x. Остаётся только B10 (semantic-token hardcode → Wave 9).
updated: 2026-06-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/icons/
related-doc: ../components/icons.md
---

# Issues — Icons

## Сводка

| Severity | Count | Categories                                              |
| -------- | ----- | ------------------------------------------------------- |
| critical | 0     | —                                                       |
| high     | 0     | —                                                       |
| medium   | 0     | —                                                       |
| low      | 1     | B10 (hardcode class → semantic token — cross-cutting Wave 9) |

**Closed (2026-05-10):** Issue 3 (ARIA), Issue 4 (variant deprecation), Issue 5 (type narrowing), Issue 2 docs portion, Issue 8 docs portion.
**Re-opened (2026-06-13):** Issue 1 (I45) — build-замер показал, что точечный dynamic import не работает в prod-Vite (bare specifier `@heroicons/vue/...` не глобится плагином `dynamic-import-vars` → no code-split, иконка не резолвится в браузере без import map).
**Resolved-facet (2026-06-14):** prod-Vite/SSR-**регрессия** Issue 1 закрыта переходом на eager namespace import + sync lookup (промежуточно); иконки снова рендерились в prod/SSR.
**Resolved (2026-06-14, tree-shaking):** Issue 1 закрыт полностью — namespace `import *` заменён на **tree-shakeable const-реестр explicit named-импортов** ([Icons.vue module-scope `<script>`](../../lib/icons/Icons.vue#L1)); bundler оставляет только curated-набор. Issue 2 — `:offline` prop declined (docs-only). Issue 6 — A2/A4-5/C17 inherited + L53 unstyled regression-тест. Issue 7 — N/A (static SVG). **Остаётся только B10** (semantic-token hardcode → Wave 9, cross-cutting) → Icons `0/0/0/1`, файл active как Wave 9-трекер.

## ~~Issue 1: Heroicons — bundle-weight~~ ✅ resolved 2026-06-14 (tree-shakeable const-реестр)

- **Категория:** I45 (иконки), A2/A4-5/C17 (bundle/SSR facets)
- **Severity:** ~~high (prod-Vite/SSR regression → bundle-weight)~~ → ✅ resolved
- **Где:** [Icons.vue const-реестр `HERO_OUTLINE`/`HERO_SOLID`](../../lib/icons/Icons.vue#L97-L175), [`resolveHeroIcon`](../../lib/icons/Icons.vue#L245)

> **Resolution (2026-06-14) — tree-shaking.** namespace `import * as HeroIconsOutline/Solid` + dynamic `set[name]` lookup заменён на **const-реестр explicit named-импортов** ([Icons.vue module-scope `<script>`](../../lib/icons/Icons.vue#L1)): `import { CheckIcon, XMarkIcon, … } from "@heroicons/vue/24/{outline,solid}"` → `HERO_OUTLINE`/`HERO_SOLID` ([Icons.vue:97](../../lib/icons/Icons.vue#L97), [:136](../../lib/icons/Icons.vue#L136)). `resolveHeroIcon` lookup'ит в реестре синхронно (тело почти не изменилось, ключ = `convertToCamelCase(type) + "Icon"`, [Icons.vue:245](../../lib/icons/Icons.vue#L245)). Explicit named-импорты статичны → bundler tree-shake'ит heroicons до curated-набора. Sync lookup сохранён → prod-Vite/SSR-корректность не теряется.
>
> **Trade-off (подтверждён владельцем 2026-06-14).** Реестр покрывает 37 имён (30 публичных `HeroIconName` + 7 internal, см. ниже). Имя heroicon **вне** реестра (например `"camera"`, `"beaker"`) больше не резолвится как heroicon → уходит в Iconify-fallback (offline недоступно без `addCollection`). Это осознанная цена tree-shaking: bundler не может предугадать произвольное runtime-имя, поэтому offline-набор ограничен curated-списком.
>
> **Реестр = 30 публичных + 7 internal.** 7 internal-имён хардкодят `lib/`-компоненты через `<Icons type=...>` и обязаны рендериться: `arrow-long-right` (Calendar), `arrows-pointing-in`/`-out` (Split fullscreen), `ellipsis-vertical` (Calendar/Table), `exclamation-circle` (InputLayout), `funnel` (Table filter), `square-2-stack` (Table copy). Компоненты с прямыми named-импортами heroicons (Pagination/Accordion/Menu `@heroicons/vue/20/solid`, Alert `/24`) tree-shaken независимо и реестр не используют.
>
> **Замер (build).** `dist/icons/icons.mjs` эмитит named-импорты ровно 37 иконок из outline + 37 из solid, **0** namespace-импортов (`import * as @heroicons`). До: 648 иконок (~94 KB gzip). После: 74 named heroicon-импорта ≈ **~11 KB gzip** (≈ −88%; точный consumer-замер — best-effort). `HeroIconName` union ([Icons.d.ts:18](../../lib/icons/Icons.d.ts#L18)) расширен 30 → 37 и теперь === runtime-реестр.
>
> **История.** 2026-06-12 namespace → точечный dynamic import (помечено resolved). 2026-06-13 build-замер: regression — `dynamic-import-vars` не глобит bare `@heroicons/vue/...` → `TypeError: Failed to resolve module specifier` в prod, иконка не рендерится (видно только в `vite dev`/Vitest). 2026-06-14 откат на eager namespace (regression closed, но весь набор в bundle) → затем **tree-shakeable const-реестр** (текущее, regression + bundle-weight закрыты вместе).

### Что найдено

~~Runtime lookup по имени (`set[name]`) на namespace-импорте не позволял bundler'у tree-shake'ить — heroicons-набор попадал в bundle целиком (~94 KB gzip).~~ ✅ закрыто переходом на const-реестр explicit named-импортов.

### Что сделано

- [x] **Регрессия:** корректный prod/SSR-рендер heroicons (sync lookup — heroIcon до первого `await` в immediate-watcher → в SSR-HTML и на первый paint).
- [x] **Bundle-weight:** tree-shakeable const-реестр named-импортов ([Icons.vue:97](../../lib/icons/Icons.vue#L97)) — bundler оставляет только curated-набор (37 имён). Имена вне набора → Iconify-fallback.

### Acceptance criteria

- [x] `<Icons type="check" />` (и `"XMark"`, `"x-mark"`, все 37 curated × outline/solid) рендерит SVG синхронно в prod-Vite / SSR — `it.each(CURATED_HERO_NAMES)` (×74) + spot-check outline/solid.
- [x] `<Icons type="check" />` тянет в bundle только curated-набор (37 named-импортов), не весь namespace — build-замер `dist/icons.mjs` (named-импорты, 0× `import *`) + contract-тесты `'camera'`/`'beaker'` не рендерят heroicon-SVG (tree-shaking boundary).

## ~~Issue 2: Iconify-загрузка через CDN — CSP risk~~ ✅ resolved 2026-06-14 (docs-only; `:offline` declined)

- **Категория:** C13 / security (CSP)
- **Severity:** ~~high~~ → ✅ resolved (docs-only)
- **Где:** [Icons.vue](../../lib/icons/Icons.vue) (через `@iconify/vue`)

> **Resolution (2026-06-14).** Mitigation через `addCollection(<json>)` полностью задокументирован ([components/icons.md §12 Security](../components/icons.md#12-accessibility--security)). Prop `:offline?: boolean` **declined** (по запросу владельца): `addCollection` уже даёт offline-резолв `"mdi:*"`/любой коллекции без сети и без CSP-конфликта, а сам prop добавил бы публичную API-поверхность без выигрыша поверх рекомендованного паттерна. CDN-fallback остаётся default-поведением для потребителей без strict-CSP.

### Что найдено

`@iconify/vue` lazy-загружает SVG-data с CDN `api.iconify.design` при первом render'е. Если у потребителя CSP `connect-src 'self'` — иконки не загружаются (тихая ошибка).

### Почему это проблема

- Multi-tenant SaaS / enterprise apps часто имеют strict CSP.
- Documentation [components/icons.md](../components/icons.md) §12 уже флагает, но без фикса.
- Зависимость от внешнего CDN — supply-chain risk (если api.iconify.design компрометирован).

### Что нужно сделать

1. ~~Документировать в [components/icons.md](../components/icons.md) §12 как обязательный параграф.~~ ✅ **resolved 2026-05-10** — §12 Security содержит полный mitigation-блок с CSP-impact, supply-chain risk, offline failure и кодом `addCollection(<json>)`.
2. ~~Предложить bundling через `@iconify/tools`~~ ✅ **resolved 2026-05-10** — рекомендация документирована.
3. ~~Добавить prop `:offline?: boolean` или env-detection~~ ✅ **declined 2026-06-14** — `addCollection` уже покрывает offline/CSP-сценарий без новой API-поверхности (по запросу владельца).

### Acceptance criteria

- [x] Documentation §12 Security содержит CSP-risk блок и offline mitigation через `addCollection`.
- [x] `:offline?: boolean` prop — declined (docs-only достаточно; `addCollection`-mitigation).

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

## ~~Issue 6: SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-06-14

- **Категория:** A2/A4-5/C17 (packaging/SSR), L53 (unstyled)
- **Severity:** ~~high (A2/A4-5/C17), medium (L53)~~ → ✅ resolved

> **A2/A4-5/C17 (packaging/SSR) — inherited doc-sync.** Закрыто глобально (зеркало separator/menu/loading): root `"sideEffects": false` (✅2026-06-07), корневая `exports`-карта `buildRootExports()` (✅2026-06-11, контракт — [package.test.ts](../../lib/package.test.ts)) покрывает `fishtvue/icons` strict-superset'ом, SSR-инжекция стилей через `Component.__hooks()` → `onServerPrefetch`. Per-component правок не требуется.
>
> **L53 (unstyled) — regression-тест.** Cross-cutting guard `Component.setStyle()` (`if (config.unstyled) return ""`, [component/index.ts:138](../../lib/component/index.ts#L138)) уже покрывает Icons (весь `classIcon` идёт через `setStyle`). Добавлен Icons-scoped regression-тест (`describe("Configuration support — unstyled (L53)")`: `classIcon === ""` при `unstyled:true`, непустой при `false`; `afterEach` чистит `window.FishtVue` singleton-leak).

## ~~Issue 7: prefers-reduced-motion — нет (если иконка animated)~~ ✅ resolved (N/A by design)

- **Категория:** E29.7
- **Severity:** ~~low~~ → **N/A**

Static SVG — компонент не рендерит transitions/animations, гейтить нечего. Если в будущем появятся animated-иконки (например, через CSS) — добавить `motion-safe:` guard. На текущей реализации не применимо → закрыто as N/A by design.

## ~~Issue 8: RTL — иконки направления (arrow-left/right)~~ ✅ docs resolved 2026-05-10

- **Категория:** F31
- **Severity:** ~~low~~ → docs resolved

Иконки `arrow-left`, `arrow-right`, `chevron-*` — буквально направлены. В RTL должны зеркалиться.

✅ **Документировано** в [components/icons.md](../components/icons.md):

- §12 A11y — упоминание RTL caveat.
- §16 FAQ — практический рецепт с CSS `[dir="rtl"] [data-rtl-mirror] { transform: scaleX(-1); }` + per-instance `:style` вариант.

Кода для фикса на icons-уровне **нет**: `Icons.vue` не имеет физических `left`/`right`-классов (зеркалить нужно конкретную direction-иконку, что решает потребитель через CSS-рецепт из §16). Поэтому на уровне Icons issue закрыт полностью (docs = резолюция); зеркаление — consumer-side concern, не cross-cutting код-долг библиотеки.

## Issue 9: Hardcoded default class

- **Категория:** B10
- **Severity:** low
- **Статус:** open — **единственный оставшийся issue** (Icons `0/0/0/1`); cross-cutting Wave 9, файл active как трекер.
- **Где:** [Icons.d.ts:127](../../lib/icons/Icons.d.ts#L127), [Icons.vue:204](../../lib/icons/Icons.vue#L204)

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
| `componentsOptions.Icons` | ✅          | `class` + `variant` ([Icons.d.ts:172](../../lib/icons/Icons.d.ts#L172)) |
| `componentsStyle` global  | N/A         | Icons не имеет mode-enum, использует `variant` локально                 |
| `unstyled: true`          | ✅          | `Component.setStyle` guard → `classIcon === ""` (Issue 6 / L53, regression-тест)        |
| Theme tokens vs hardcode  | ⚠️          | `text-gray-900 dark:text-gray-100` хардкоден (Issue 9) — Wave 9         |
| Runtime theme switch      | ⚠️          | через class только                                                      |
| `t()` для текста          | N/A         | label передаётся пользователем — он отвечает за локализацию             |
| Runtime locale switch     | N/A         | —                                                                       |

## Dual-API gap

Не применимо.
