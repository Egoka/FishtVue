---
title: Issues — Button
summary: Аудит критических и потенциальных проблем компонента Button — SSR-style инжекция, отсутствие aria-label для icon-кнопок, RTL, focus ref forwarding, неконсистентность с Configuration.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/button/
related-doc: ../components/button.md
---

# Issues — Button

> Аудит против 60-пунктового чек-листа + публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) + dual-API анализ.

## Сводка

| Severity | Count | Categories              |
| -------- | ----- | ----------------------- |
| critical | 0     | —                       |
| high     | 5     | A2, A4, A5, C17, L53    |
| medium   | 5     | F31, G36, I44, I45, N59 |
| low      | 1     | B11                     |

**Закрыто 2026-05-10:** Issues 2 (E29.1 — aria-label), 4 (G34 — buttonRef expose + focus/blur), 10 (E29.7 — motion-safe), 11 (D26 — typed click emit), 12 (G37 — start/end slots) — вынесены в [done/button.md](./done/button.md). Здесь оставлены только открытые issues; нумерация исходная (с gaps), чтобы cross-references из соседних issue-доков не ломались.

## Issue 1: Стили инжектятся только после client mount — пустой first paint при SSR

- **Категория:** C17 (`<style>` в `<head>` SSR)
- **Severity:** high
- **Где:** [Button.vue:346-348](../../lib/button/Button.vue#L346-L348)

### Что найдено

```ts
onMounted(() => {
  Button.initStyle()
})
```

`Component.initStyle()` вызывает `useStyle()` → `head.appendChild(<style>)` через [lib/theme/helpers/useStyle.ts](../../lib/theme/helpers/useStyle.ts). Внутри `onMounted` выполняется только в браузере. На SSR (Nuxt SSR, vite-ssg) initial HTML отрендерится без CSS, что вызовет flash-of-unstyled-content и hydration-mismatch при первом frame.

### Почему это проблема

- Видимый flash без стилей при загрузке Nuxt-страницы.
- Пользователи на медленном соединении видят кнопку без размеров/цветов несколько сотен миллисекунд.
- При SSR-snapshotting (например, Lighthouse, RSS-парсеры) seed HTML не содержит критического CSS — снижает scoring.
- Нарушает заявленную в `Documentation/architecture/nuxt-module.md` SSR-инжекцию через server plugin.

### Что нужно сделать

1. В [Component.setStyle](../../lib/component/index.ts) добавить SSR-ветку: на server вызвать `useSSRContext()` и накопить CSS в `ssrContext.modules` (Vue API) либо через [lib/plugins/nuxt.ts](../../lib/plugins/nuxt.ts) серверный коллектор.
2. На клиенте оставить отложенную инжекцию через `onMounted` для не-SSR случаев.
3. Альтернатива минимальной правки: вызывать `Button.initStyle()` **синхронно** во время setup() (как [Component.\_\_hooks](../../lib/component/index.ts) делает для других компонентов) — на server это попадёт в SSR string через `<style>` в DOM до hydration.
4. Проверить, что в Nuxt server plugin ([lib/plugins/nuxt.ts](../../lib/plugins/nuxt.ts)) собранный CSS попадает в `<head>` SSR-ответа.
5. Проверить, что компоненты, импортирующие Button (FixWindow inside icon-button, Loading), также наследуют корректную SSR-инжекцию — иначе вложенный layout не получит стилей.

### Acceptance criteria

- [ ] При `nuxt build && nuxt generate` сгенерированный HTML содержит inline `<style>` с правилами Button.
- [ ] Lighthouse `unused-css` не показывает Button-CSS как «not yet loaded».
- [ ] В тесте `lib/button/Button.test.ts` добавить case `renderToString(Button)` — assert что вывод включает классы из `baseClasses`.

## Issue 3: iconPosition использует left/right вместо logical start/end — RTL ломается

- **Категория:** F31 (RTL поддержка)
- **Severity:** medium
- **Где:** [Button.d.ts:65-67](../../lib/button/Button.d.ts#L65-L67), [Button.vue:298](../../lib/button/Button.vue#L298), [Button.vue:372-374](../../lib/button/Button.vue#L372-L374)

### Что найдено

```ts
iconPosition?: "left" | "right"
```

```vue
<Icons v-if="icon && iconPosition === 'left'" :type="icon" :class="classIcon" />
<slot name="default" />
<Icons v-if="icon && iconPosition === 'right'" :type="icon" :class="classIcon" />
```

«Left»/«right» — буквальные направления. При `dir="rtl"` иконка, заявленная как «right», окажется визуально слева, что противоположно намерению дизайнера.

### Почему это проблема

- Арабские/ивритские локали получают зеркальный layout автоматом, а буквальные `left/right` ломают визуальный язык — иконка действия (например, «next →») оказывается «before label», что меняет UX-смысл.
- Tailwind CSS поддерживает logical properties (`ms-*`, `me-*`) с Tailwind 3.4+.

### Что нужно сделать

1. Поменять API на `iconPosition?: "start" | "end"` в [Button.d.ts](../../lib/button/Button.d.ts), сохранить `"left" | "right"` как deprecated alias через type union с runtime-warning.
2. В [Button.vue:298](../../lib/button/Button.vue#L298) маппить старые значения: `left → start`, `right → end`.
3. Добавить `dir`-aware логику: если документ `dir="rtl"`, swap отображение (либо через CSS `[dir="rtl"]` selector, либо через `useDirectionality()` composable).
4. В [Documentation/components/button.md](../components/button.md) §12 RTL добавить примечание про migration.
5. Тест: `mount(Button, { props: { iconPosition: "left", icon: "x" }, attrs: { dir: "rtl" } })` — assert визуальный порядок (или просто `iconPosition` маппинг).

### Acceptance criteria

- [ ] Существующие тесты с `iconPosition: "left"|"right"` продолжают работать (deprecation soft).
- [ ] Новый тест: `iconPosition: "start"` в `dir="rtl"` показывает иконку справа от текста.
- [ ] Console warning при использовании deprecated значения.

## Issue 5: Нет polymorphic `as` prop — Button нельзя превратить в `<a>`

- **Категория:** G36 (asChild / polymorphic)
- **Severity:** medium
- **Где:** [Button.vue:351](../../lib/button/Button.vue#L351), [Button.d.ts](../../lib/button/Button.d.ts)

### Что найдено

Корневой тег жёстко `<button>`. Распространённый use-case — link-button: внешне выглядит как кнопка, но семантически `<a href="…">` с `role="button"`.

### Почему это проблема

- Nuxt-приложения с `<NuxtLink>` навигацией вынуждены wrap'ить Button в `<NuxtLink>` или дублировать стили.
- Browser-native поведение `<a>` (open in new tab, copy link, prefetch) теряется.
- Radix, Reka UI, ArkUI, shadcn-vue — все поддерживают `as`/`asChild`.

### Что нужно сделать

1. Добавить prop `as?: string | Component` в [Button.d.ts](../../lib/button/Button.d.ts) (default: `"button"`).
2. В [Button.vue:351](../../lib/button/Button.vue#L351) использовать `<component :is="as ?? 'button'" ...>` с conditional type/href атрибутами.
3. Type-safe: `<Button as="a" href="...">` — `href` validate'ится через `InstanceType<typeof Button>` если возможно (Vue ограничение). Либо `as="a"` + явный `linkProps?: { href, target }`.
4. Если `as !== "button"` — `type` атрибут не выставляем (нерелевантен), но `role="button"` для не-`<a>` тегов.
5. Документация: в [Documentation/components/button.md](../components/button.md) §10 добавить раздел «As link / NuxtLink».

### Acceptance criteria

- [ ] `<Button as="a" href="/x">Go</Button>` рендерит `<a href="/x" class="...">Go</a>`.
- [ ] `<Button as={NuxtLink} to="/x">` работает в Nuxt.
- [ ] Tab-keyboard navigation работает на не-button корне (через `tabindex="0"` если `as` не link/button).

## Issue 6: Loading и FixWindow всегда тянутся в bundle — для текстовой Button это перерасход

- **Категория:** I44 (peer-зависимости / bundle size)
- **Severity:** medium
- **Где:** [Button.vue:5](../../lib/button/Button.vue#L5), [Button.vue:6](../../lib/button/Button.vue#L6)

### Что найдено

```ts
import Loading from "fishtvue/loading/Loading.vue"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
```

Эти импорты статичны. Если пользователь не использует `loading` prop и не использует Button с `type="icon"` + tooltip — Loading и FixWindow всё равно попадают в client-бандл потому что:

- Корневой `lib/package.json` без `sideEffects: false` — tree-shaker не уверен в чистоте импортов.
- Loading тянет `loadingTypes.ts` (~131 строка с компонентами Epic/SVG).
- FixWindow тянет позиционирование, click-outside, gsap (через transitive — да-да, gsap из root deps).

### Почему это проблема

- Простой `<Button>Save</Button>` тянет ~10–20kb лишнего кода.
- Cross-cutting issue видно во всех 22 компонентах через `lib/package.json`.

### Что нужно сделать

1. Добавить `"sideEffects": false` в корневой [lib/package.json](../../lib/package.json) (это позволит tree-shaker удалять неиспользуемые статические импорты).
2. Если есть CSS-side-effects (`Component.initStyle` injects styles) — указать массив:
   ```json
   "sideEffects": ["**/*.css", "**/*.vue"]
   ```
   `*.vue` нужно потому что SFC `<style>` блоки имеют side-effects (CSS injection).
3. Альтернатива — динамически импортировать Loading/FixWindow только при наличии `loading || (type === 'icon' && hasDefaultSlot)`:
   ```ts
   const Loading = defineAsyncComponent(() => import("fishtvue/loading/Loading.vue"))
   const FixWindow = defineAsyncComponent(() => import("fishtvue/fixwindow/FixWindow.vue"))
   ```
4. После добавления `sideEffects` — проверить, что DEV сборка sandbox показывает Loading-стили (никакая регрессия).
5. Замерить: `pnpm sandbox:build` → анализ bundle через `rollup-plugin-visualizer` до/после.

### Acceptance criteria

- [ ] `sideEffects` определён в `lib/package.json` (явно).
- [ ] `import Button from "fishtvue/button"` без других — bundle size <15kb gzipped.
- [ ] Все existing тесты Button проходят.

## Issue 7: Иконки из @heroicons/vue тянутся целиком

- **Категория:** I45 (иконки точечно)
- **Severity:** medium
- **Где:** через [lib/icons/Icons.vue](../../lib/icons/Icons.vue), используется в [Button.vue:359](../../lib/button/Button.vue#L359), [Button.vue:372-374](../../lib/button/Button.vue#L372-L374)

### Что найдено

`<Icons :type="icon" />` — Icons компонент тянет heroicons map целиком ([lib/icons/Icons.vue](../../lib/icons/Icons.vue)). Хотя rollup отмечает `@heroicons/vue/24/outline` как external, в Vite-сборке потребителя heroicons map (~2k экспортов) попадает целиком из-за runtime lookup `componentsMapHeroIcons[type]`.

### Почему это проблема

- Полный набор Heroicons ≈ 200kb minified — нагружает потребителя ради 1-2 кнопок с иконкой.

### Что нужно сделать

1. Перевести Icons на dynamic import: `defineAsyncComponent(() => import(`@heroicons/vue/24/${stileIcon}/${pascalCase(type)}.vue`))`.
2. Документировать tree-shake-friendly паттерн в [Documentation/components/icons.md](../components/icons.md).
3. Альтернатива: предложить compile-time replacement через unplugin-icons с локально bundlit'ом collection.

### Acceptance criteria

- [ ] Сборка sandbox с одной `<Icons type="check" />` — bundle содержит только `CheckIcon`, не весь heroicons map.
- [ ] Iconify по-прежнему lazy.

## Issue 8: Нет `sideEffects` в корневом lib/package.json — cross-cutting

- **Категория:** A2 (sideEffects разметка)
- **Severity:** high
- **Где:** [lib/package.json:1-58](../../lib/package.json), [lib/button/package.json:1-5](../../lib/button/package.json)

### Что найдено

`lib/package.json` и [lib/button/package.json](../../lib/button/package.json) не содержат поле `sideEffects`. Без этой разметки tree-shaker (Rollup, Webpack 5, esbuild) предполагает любой импорт может иметь side-effects и сохраняет его в финальном бандле.

### Почему это проблема

См. Issue 6 — это одна из его причин. Cross-cutting для всех 22 компонентов.

### Что нужно сделать

См. Issue 6, шаги 1-2.

### Acceptance criteria

- [ ] `sideEffects` явно определён в `lib/package.json`.
- [ ] (Опционально) то же — для каждого `lib/{component}/package.json`.

## Issue 9: ESM-only — нет CJS, нет exports map

- **Категория:** A4 (ESM/CJS dual-package), A5 (exports map)
- **Severity:** high
- **Где:** [lib/package.json:17-18](../../lib/package.json#L17-L18), [lib/button/package.json](../../lib/button/package.json), [lib/rollup.config.js:374-390](../../lib/rollup.config.js#L374-L390)

### Что найдено

```json
{
  "main": "./index.mjs",
  "types": "./index.d.ts"
}
```

Нет `exports` map с условиями `import`/`require`/`types`/`default`. Нет `module` поля. CJS вариант собран в [lib/rollup.config.js:374-390](../../lib/rollup.config.js#L374-L390) через `get_CJS_ESM`, но **закомментирован** на line 409. Subpath imports `fishtvue/button` работают только через filesystem resolution.

### Почему это проблема

- Старые CJS-приложения (`require("fishtvue")`) не работают.
- Без `exports` map TypeScript потребитель не получает корректную type-resolution для subpath imports в `moduleResolution: "node16"|"bundler"`.
- Inkonsistent с современным publishing (Vue 3 Vue, Pinia, Vue Router — все имеют exports map).

### Что нужно сделать

1. В [lib/package.json](../../lib/package.json) добавить:
   ```json
   "exports": {
     ".": {
       "types": "./index.d.ts",
       "import": "./index.mjs",
       "default": "./index.mjs"
     },
     "./button": {
       "types": "./button/Button.d.ts",
       "import": "./button/button.mjs",
       "default": "./button/button.mjs"
     },
     "./button/*": "./button/*",
     "./button/Button.vue": "./button/Button.vue",
     "./component": { ... },
     "./config": { ... },
     "./theme": { ... },
     "./locale": { ... },
     "./types": "./types.d.ts",
     "./utils/*": { "types": "./utils/*.d.ts", "import": "./utils/*.mjs" },
     "./module": "./module/index.mjs",
     "./plugins/nuxt": "./plugins/nuxt.mjs"
   }
   ```
2. Раскомментировать `get_CJS_ESM()` в [rollup.config.js:409](../../lib/rollup.config.js#L409) или явно решить «ESM-only» и опубликовать через npm с `"type": "module"`.
3. Если ESM-only — добавить engines `"engines": { "node": ">=18" }` и явно задокументировать в README.

### Acceptance criteria

- [ ] `pnpm pack` → tarball содержит exports map.
- [ ] `import Button from "fishtvue/button"` работает в Nuxt 3 + Vite + TS strict.
- [ ] Если CJS — `require("fishtvue/button")` тоже работает.

## Issue 13: Не реагирует на componentsStyle ("filled"|"outlined"|"underlined") из global config

- **Категория:** L53 (Configuration support)
- **Severity:** high
- **Где:** [Button.vue:301-309](../../lib/button/Button.vue#L301-L309)

### Что найдено

```ts
const mode = computed(() => (props?.mode as ButtonProps["mode"]) ?? options?.mode ?? "primary")
```

Button имеет собственный enum `mode: "primary" | "outline" | "ghost"` — не пересекается с глобальным [`componentsStyle: "filled" | "outlined" | "underlined"`](../../docs/content/ru/3.Configuration/1.Options.md). Switch и Label вызывают `Switch.componentsStyle()` для fallback к глобальному. Button — нет.

### Почему это проблема

- Documentation [docs/content/ru/3.Configuration/1.Options.md](../../docs/content/ru/3.Configuration/1.Options.md) обещает `componentsStyle` управляет ВСЕМИ компонентами. По факту Button игнорирует.
- Inкосистенция: Switch/Label/Input реагируют, Button — нет.

### Что нужно сделать

1. Решить: либо unify `mode` Button с `componentsStyle` (mapping `"primary"→"filled"`, `"outline"→"outlined"`, `"ghost"→"underlined"`), либо добавить `Button.componentsStyle()` fallback (как Label делает).
2. Минимальный фикс — fallback chain:
   ```ts
   const mode = computed(
     () =>
       (props?.mode as ButtonProps["mode"]) ??
       options?.mode ??
       mapComponentsStyleToButtonMode(Button.componentsStyle()) ??
       "primary"
   )
   ```
   с явным mapping helper.
3. Документировать в [Documentation/components/button.md](../components/button.md) §10 связь Button.mode ↔ componentsStyle.

### Acceptance criteria

- [ ] `app.use(FishtVue, { componentsStyle: "outlined" })` — `<Button>X</Button>` рендерится с `mode="outline"`.
- [ ] Per-instance `<Button mode="primary">` перебивает глобальное.

## Issue 14: `unstyled: true` не обрабатывается

- **Категория:** L53 (Configuration support)
- **Severity:** high
- **Где:** [Button.vue:313-323](../../lib/button/Button.vue#L313-L323)

### Что найдено

`baseClasses`, `modeClasses` всегда применяются — нет логики `if (unstyled) return ""`. Глобальный `unstyled: true` из [docs/content/ru/3.Configuration/1.Options.md](../../docs/content/ru/3.Configuration/1.Options.md) не учитывается ни в одном компоненте.

### Почему это проблема

- Documentation обещает «полное отключение встроенных стилей для использования CSS-фреймворков». Не работает.
- Пользователь, желающий использовать FishtVue + Bootstrap, получает дублирующиеся стили.

### Что нужно сделать

1. В [Component.setStyle](../../lib/component/index.ts) добавить guard:
   ```ts
   setStyle(classes: any) {
     if (this.config?.unstyled) return ""
     return cn(...classes)
   }
   ```
2. Cross-cutting — все 22 компонента наследуют поведение через `Component.setStyle`.
3. Тест: `app.use(FishtVue, { unstyled: true })` + `<Button>X</Button>` — рендерит `<button>X</button>` без `class`.

### Acceptance criteria

- [ ] `unstyled: true` приводит к `class=""` (или отсутствию атрибута) на корне.
- [ ] Реактивно: переключение в runtime → стили исчезают.

## Issue 15: Нет print styles

- **Категория:** N59 (print styles)
- **Severity:** low
- **Где:** [Button.vue](../../lib/button/Button.vue)

### Что найдено

При `window.print()` Button рендерится с интерактивными цветами/тенями/hover. Стандарт UX — кнопки в печатной версии должны быть скрыты или показаны как plain text.

### Почему это проблема

- Печатные документы (отчёты с UI-снимками) показывают кнопки, которые в принципе бесполезны на бумаге.

### Что нужно сделать

1. В `Component.initStyle` или global stylesheet добавить:
   ```css
   @media print {
     [data-button] {
       display: none;
     }
     /* или: */
     [data-button] {
       background: white !important;
       color: black !important;
       box-shadow: none !important;
     }
   }
   ```
2. Добавить prop `printable?: boolean` (default false) — если true, не скрывать.

### Acceptance criteria

- [ ] DevTools → Rendering → Emulate CSS print — Button скрыт по умолчанию.

## Issue 16: Dark mode зависит от `.dark` класса родителя без учёта `darkModeSelector`

- **Категория:** B11 (dark mode + runtime theme switch)
- **Severity:** low
- **Где:** [Button.vue:31-49](../../lib/button/Button.vue) (все `dark:*` классы)

### Что найдено

Tailwind dark variant — `darkMode: "class"` — реагирует на `.dark` класс на любом ancestor. Но публичная Configuration [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает `darkModeSelector` опцию (например, `"html.dark"` или `"[data-theme=dark]"`). Button игнорирует.

### Почему это проблема

- Если пользователь конфигурирует `darkModeSelector: "[data-theme='dark']"`, Button.dark классы продолжают слушать `.dark`.
- Может работать через UnoCSS engine, но coupling неявный.

### Что нужно сделать

1. Проверить через [lib/theme/uno.ts](../../lib/theme/uno.ts), что `darkModeSelector` транслируется в правильный CSS-селектор для `dark:*` вариантов.
2. Если не транслируется — добавить runtime hook в Component.initStyle для замены `.dark` на конфигурируемый селектор.
3. Документировать связь в [Documentation/architecture/theme.md](../architecture/theme.md).

### Acceptance criteria

- [ ] `optionsTheme: { darkModeSelector: "[data-theme='dark']" }` — `<Button>` реагирует на `<html data-theme='dark'>`.

## Cross-cutting: Configuration support

| Настройка                  | Поддержано? | Комментарий                                                                                                                                                                                     |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.Button` | ✅          | через `Button.getOptions()` (mode/size/rounded/color/class/classIcon — `ariaLabel`/`icon`/`type` не входят)                                                                                     |
| `componentsStyle` global   | ❌          | см. Issue 13 — нет fallback к global enum                                                                                                                                                       |
| `unstyled: true`           | ❌          | см. Issue 14 — игнорируется                                                                                                                                                                     |
| Theme tokens vs hardcode   | ⚠️          | через Tailwind `theme-*`/`neutral-*`/`green-*`/`red-*` классы; design tokens из [theme/themes/Aurora.ts](../../lib/theme/themes/Aurora.ts) НЕ применяются напрямую — только через UnoCSS preset |
| Runtime theme switch       | ⚠️          | работает через CSS-переменные `theme-*`, но смена палитры через `updatePrimaryPalette()` требует регенерации CSS — проверить корректность invalidation                                          |
| `t()` для текста           | N/A         | у Button нет UI-текста (slot-based)                                                                                                                                                             |
| Runtime locale switch      | N/A         | —                                                                                                                                                                                               |
| Fallback на defaultLocale  | N/A         | —                                                                                                                                                                                               |

## Dual-API gap

Не применимо — Button не collection-component.
