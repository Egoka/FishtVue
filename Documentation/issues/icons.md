---
title: Issues — Icons
summary: Аудит Icons — heroicons тянутся целиком (~200kb), Iconify CSP-неблагонадёжен (CDN-загрузка), нет ARIA aria-label, опечатка stileIcon, type union без narrowing.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/icons/
related-doc: ../components/icons.md
---

# Issues — Icons

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 5 | A2, A4-5, C17, I45 (heroicons bundle), C13/security (Iconify CSP) |
| medium | 4 | E29.1, D25 (stileIcon typo), D21 (open string type), L53 |
| low | 3 | E29.7, B10, F31 |

## Issue 1: Heroicons тянутся целиком в bundle потребителя

- **Категория:** I45 (иконки точечно)
- **Severity:** high
- **Где:** [Icons.vue](../../lib/icons/Icons.vue), [rollup.config.js:54-57](../../lib/rollup.config.js#L54-L57)

### Что найдено

`@heroicons/vue` помечен external в rollup — но в потребительском Vite-билде heroicons map (~2k экспортов) попадает целиком из-за runtime lookup `componentsMap[type]`. Каждый импорт `<Icons type="check">` тянет ~200kb minified heroicons.

### Что нужно сделать

См. [button.md Issue 7](./button.md) — fix через `defineAsyncComponent`.

```ts
const HeroIcon = defineAsyncComponent({
  loader: () => import(`@heroicons/vue/24/${stileIcon}/${pascalCase(type)}.vue`),
  errorComponent: FallbackIcon
})
```

С dynamic import bundler tree-shake'ает только используемые.

### Acceptance criteria

- [ ] `<Icons type="check" />` в одиночку — bundle ~5kb (только CheckIcon), не ~200kb.

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

1. Документировать в [components/icons.md](../components/icons.md) §12 как обязательный параграф.
2. Предложить bundling через `@iconify/tools`:
   ```ts
   import { addCollection } from "@iconify/vue"
   import mdi from "@iconify-json/mdi/icons.json"
   addCollection(mdi)
   ```
3. Добавить prop `:offline?: boolean` или env-detection — если CDN недоступен, fallback на placeholder.

## Issue 3: ARIA — нет aria-label для семантических иконок

- **Категория:** E29.1
- **Severity:** medium
- **Где:** [Icons.vue](../../lib/icons/Icons.vue)

### Что найдено

SVG рендерится без `aria-label` или `aria-hidden`. Screen reader озвучивает имя иконки сырым (например, «check icon») или путается.

### Что нужно сделать

1. Default `aria-hidden="true"` для декоративных иконок (большинство случаев).
2. Prop `:label?: string` — если задан, override `aria-hidden` на `role="img" aria-label="..."`.
3. Документировать в [components/icons.md](../components/icons.md) §12 best practice.

```vue
<svg role="img" :aria-label="label" v-if="label">...</svg>
<svg aria-hidden="true" v-else>...</svg>
```

## Issue 4: `stileIcon` — опечатка от "styleIcon"

- **Категория:** D25 (консистентность naming)
- **Severity:** medium
- **Где:** [Icons.d.ts:21](../../lib/icons/Icons.d.ts#L21)

### Что найдено

```ts
stileIcon?: "outline" | "solid"
```

«Stile» — опечатка / транслит. Должно быть `"styleIcon"` или `"variant"`.

### Что нужно сделать

1. Добавить новый prop `variant?: "outline" | "solid"` (или `style?` — но `style` reserved Vue для CSS object).
2. `stileIcon` deprecated soft (console.warn если использован).
3. В major (1.0) убрать.
4. Codemod для замены.

## Issue 5: `type: string` — open union, нет narrowing

- **Категория:** D21 (Generic / type narrowing)
- **Severity:** medium
- **Где:** [Icons.d.ts:17](../../lib/icons/Icons.d.ts) (`type: string`)

### Что найдено

`type: string` принимает любую строку. Опечатка `<Icons type="chek" />` пройдёт компиляцию.

### Что нужно сделать

1. Использовать template literal type для autocomplete:
   ```ts
   type HeroIconName = "check" | "x-mark" | "user" | ... // generated from heroicons
   type IconifyName = `${string}:${string}`  // e.g., "mdi:home"
   type IconType = HeroIconName | IconifyName
   ```
2. Generate union из `@heroicons/vue` через build-script.
3. Volar autocomplete для `<Icons type="che">` подскажет «check».

## Issue 6: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 7: prefers-reduced-motion — нет (если иконка animated)

- **Категория:** E29.7

Static SVG — OK. Если animated icons (например, через CSS) — добавить guard.

## Issue 8: RTL — иконки направления (arrow-left/right)

- **Категория:** F31

Иконки `arrow-left`, `arrow-right`, `chevron-*` — буквально направлены. В RTL должны зеркалиться. Документировать в [components/icons.md](../components/icons.md) §12.

## Issue 9: Hardcoded default class

- **Категория:** B10
- **Где:** [Icons.d.ts:25](../../lib/icons/Icons.d.ts), [Icons.vue](../../lib/icons/Icons.vue)

### Что найдено

```
class: "h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass
```

`text-gray-400` хардкоден как литерал. Должно быть semantic token (`text-foreground-muted`).

### Что нужно сделать

См. [switch.md Issue 12](./switch.md). Заменить на semantic.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Icons` | ✅ | class default |
| `componentsStyle` global | N/A | Icons не имеет mode-enum |
| `unstyled: true` | ❌ | default class всегда применяется |
| Theme tokens vs hardcode | ⚠️ | text-gray-400 хардкоден (Issue 9) |
| Runtime theme switch | ⚠️ | через class только |
| `t()` для текста | N/A | нет UI-текста |
| Runtime locale switch | N/A | — |

## Dual-API gap

Не применимо.
