---
title: Issues — Button
summary: Аудит критических и потенциальных проблем компонента Button — SSR-style инжекция, polymorphic `as`, packaging, `componentsStyle`, `unstyled`, print, dark-mode. Resolved 2026-05-10: aria-label (Issue 2), buttonRef expose (4), motion-safe (10), typed click emit (11), start/end slots (12). Resolved 2026-06-07: logical iconPosition start/end + RTL (Issue 3); cross-cutting — SSR-стили C17 (Issue 1 — через `onServerPrefetch`, поведение общее для 22 компонентов), sideEffects A2 (Issue 8 — root + per-component); Issue 9 ✅ (ESM-only `engines` + root `exports` map через `buildRootExports()`, 2026-06-11). Doc-sync 2026-06-12: матрица severity пересчитана к фактически открытым (Issues 5/6/7/13/14/15/16), Issue 16 (darkModeSelector) делегирован cross-cutting [theme.md Issue 5](./theme.md). Зачёркнуты ниже с `✅ resolved`-маркерами.
updated: 2026-06-12
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/button/
related-doc: ../components/button.md
---

# Issues — Button

> Аудит против 60-пунктового чек-листа + публичной [Configuration-документации](../../docs/content/ru/3.Configuration/) + dual-API анализ.

## Сводка

| Severity | Count | Categories                       |
| -------- | ----- | -------------------------------- |
| critical | 0     | —                                |
| high     | 0     | ~~A2~~ ✅, ~~A4~~ ✅, ~~A5~~ ✅, ~~C17~~ ✅, ~~E29.1~~ ✅, ~~L53~~ ✅ (Issues 13, 14) |
| medium   | 5     | ~~F31~~ ✅, G34, G36, I44, I45, N59 |
| low      | 4     | B11, D26, E29.7, G37             |

Счёт следует методологии [README.md](./README.md) (по unstruck-категориям, cross-cutting остаются до закрытия глобальной волны). Фактически открытые Button-секции: 5, 6, 7, 15, 16.

**Закрыто 2026-05-10:** Issues 2 (E29.1 — aria-label), 4 (G34 — buttonRef expose + focus/blur), 10 (E29.7 — motion-safe), 11 (D26 — typed click emit), 12 (G37 — start/end slots).
**Закрыто 2026-06-07:** Issues 1 (C17 — SSR-стили), 3 (F31 — logical `iconPosition` start/end + deprecated left/right + RTL через `inline-flex`), 8 (A2 — root + per-component `sideEffects`).
**Закрыто 2026-06-11 (doc-sync 2026-06-12):** Issue 9 (A4/A5 — ESM-only `engines` + root `exports` map через `buildRootExports()`).
**Закрыто 2026-05-11 (cross-cutting; отмечено 2026-06-12):** Issue 14 (L53 — `unstyled` через `Component.setStyle` guard + Button regression-тест).
**Закрыто 2026-06-12:** Issue 13 (L53 — global `componentsStyle` fallback mapping в `mode`).
**Deferred:** Issue 16 (B11 — `darkModeSelector`) делегирован cross-cutting [theme.md Issue 5](./theme.md) (Wave 3.4) — счётчик остаётся открытым (low).
Все закрытые — зачёркнуты ниже с `✅ resolved`-маркерами. Нумерация исходная — cross-references из соседних issue-доков сохраняются.

## ~~Issue 1: Стили инжектятся только после client mount — пустой first paint при SSR~~ ✅ resolved 2026-06-07

- **Категория:** C17 (`<style>` в `<head>` SSR)
- **Severity:** ~~high~~ → resolved
- **Где:** [Button.vue:346-348](../../lib/button/Button.vue#L346-L348)

> **Resolution (2026-06-07, cross-cutting).** Текст аудита устарел: канон давно перешёл с `onMounted(() => X.initStyle())` в SFC на базовый класс. `Component.__hooks()` ([component/index.ts:79-84](../../lib/component/index.ts#L79-L84)) регистрирует **`onServerPrefetch(() => initStyle())`** (server) **и** `vueOnMounted(() => initStyle())` (client). `__setStyle()` пишет CSS в `cssComponents` Map БЕЗ guard `isClient()` ([component/index.ts:179](../../lib/component/index.ts#L179)) — client-gated только сам `useStyle()`-DOM-append. Nuxt server plugin ([plugins/nuxt.ts](../../lib/plugins/nuxt.ts)) на хуке `app:rendered` сливает `cssComponents` в `ssrContext.head` → критический CSS в SSR-HTML до hydration, без flash-of-unstyled-content. Это поведение общее для ВСЕХ 22 компонентов (не только Button). Регрессионный тест [lib/component/ssrStyles.test.ts](../../lib/component/ssrStyles.test.ts): `renderToString` НЕ вызывает `onMounted`, поэтому заполнение `cssComponents` после server-render доказывает, что сработал именно `onServerPrefetch`-путь; ловит регрессию, если кто-то обернёт `cssComponents.set` в `isClient()` или снимет `onServerPrefetch`.

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

## ~~Issue 2: Icon-кнопки без aria-label — screen reader озвучивает «button» без назначения~~ ✅ resolved 2026-05-10

- **Категория:** E29.1 (ARIA-роли и атрибуты)
- **Severity:** ~~high~~
- **Где:** [Button.vue:382–390](../../lib/button/Button.vue#L382-L390)
- **Resolution:** добавлен `ariaLabel?: string` в `BaseButtonProps`; computed `resolvedAriaLabel` делает fallback на имя иконки для `type="icon"`; `onMounted` dev-warning при unlabeled icon-кнопке без default-slot.

### Что найдено

```vue
<button ref="buttonRef" data-button :type="type === 'icon' ? 'button' : type" ...>
  <template v-if="type === 'icon'">
    <Icons v-if="icon" :type="icon" :class="classIcon" />
    ...
  </template>
```

Когда `type="icon"`, у `<button>` нет текстового slot, нет `aria-label`, `aria-labelledby`, и `<Icons>` рендерит SVG без `aria-label`. Screen reader озвучивает кнопку как «button» без указания назначения.

### Почему это проблема

- WCAG 2.1 SC 4.1.2 (Name, Role, Value) — нарушение.
- Пользователи скрин-ридеров не могут идентифицировать кнопку.
- Documentation [components/button.md](../components/button.md) §12.1 это уже отметил, но не было фикса.

### Acceptance criteria

- [x] Тест: `mount(Button, { props: { type: "icon", icon: "trash", ariaLabel: "Delete user" } })` — assert `wrapper.attributes('aria-label')` is `"Delete user"`.
- [x] Тест dev-warning: без ariaLabel и без default slot — emitted `console.warn` с префиксом `[FishtVue Button]`.
- [ ] axe-core lint в `Button.test.ts` (если будет добавлен) проходит для icon-кнопки.

## ~~Issue 3: iconPosition использует left/right вместо logical start/end — RTL ломается~~ ✅ resolved 2026-06-07

- **Категория:** F31 (RTL поддержка)
- **Severity:** ~~medium~~
- **Где:** [Button.d.ts:63-74](../../lib/button/Button.d.ts#L63-L74), [Button.vue:299-308](../../lib/button/Button.vue#L299-L308), [Button.vue:407-411](../../lib/button/Button.vue#L407-L411)
- **Resolution:** `iconPosition` принимает logical-значения `"start" | "end"` (default `end`); `"left" | "right"` сохранены как deprecated алиасы (`left → start`, `right → end`) через type-union + computed-нормализацию. RTL-корректность обеспечивается тем, что корневой `<button>` — `inline-flex`, и его main-axis следует document direction (`dir="rtl"` → start визуально справа), поэтому дополнительный CSS/`useDirectionality()` не нужен. `onMounted` dev-warning при использовании deprecated значений.

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

### Что было сделано

1. ✅ API изменён на `iconPosition?: "start" | "end" | "left" | "right"` в [Button.d.ts](../../lib/button/Button.d.ts); `"left" | "right"` — deprecated алиасы.
2. ✅ В [Button.vue](../../lib/button/Button.vue) computed `iconPosition` нормализует значения: `left → start`, `right → end`, default `end`.
3. ✅ `dir`-aware поведение получено бесплатно через `inline-flex` main-axis (DOM-first `start` визуально справа при RTL) — отдельный CSS не понадобился.
4. ✅ `onMounted` dev-warning при `iconPosition="left"|"right"`.
5. ✅ Negative-margin loading-индикатора переведён на logical `-me-2` (было физическое `-mr-2`) — корректно зеркалится при RTL.

### Acceptance criteria

- [x] Существующие тесты с `iconPosition: "left"|"right"` продолжают работать (deprecation soft).
- [x] `iconPosition: "start"` рендерит иконку перед контентом, `"end"` — после (RTL-зеркалирование делегировано flex-направлению).
- [x] Console warning при использовании deprecated значения.

## ~~Issue 4: buttonRef не exposed — пользователь не может programmatically focus/blur~~ ✅ resolved 2026-05-10

- **Категория:** G34 (Ref на корневой элемент)
- **Severity:** ~~medium~~
- **Где:** [Button.vue:344–366](../../lib/button/Button.vue#L344-L366)
- **Resolution:** `buttonRef`, `focus(options?)`, `blur()` добавлены в `defineExpose`; `ButtonExpose` расширен с JSDoc; `focus()` принимает опциональный native `FocusOptions` (`{ preventScroll }`). Паритет с [Aria](../components/aria.md) и [Input](../components/input.md).

### Что найдено

```ts
const buttonRef = ref<HTMLButtonElement>()
...
defineExpose({
  mode, size, rounded, color, classBase, classIcon  // нет buttonRef
})
```

Reactive ref `buttonRef` определён, но не возвращён через `defineExpose`. Пользователь не может через `useTemplateRef<typeof Button>` дотянуться до DOM-узла для `.focus()`, `.click()`, `.scrollIntoView()`.

### Почему это проблема

- Form-флоу с auto-focus on error: «после submit-валидации сфокусироваться на первой невалидной кнопке/поле» — невозможно без хака `document.querySelector`.
- Nuxt Auto-focus плагины не работают.
- Сейчас вынуждены делать `document.querySelector("[data-button]")` — fragile + collide при множественных кнопках.

### Acceptance criteria

- [x] `useTemplateRef<typeof Button>("btn").value?.focus()` фокусирует кнопку.
- [x] Тест: `wrapper.vm.focus()` → `expect(document.activeElement).toBe(wrapper.find('button').element)`.

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

## ~~Issue 8: Нет `sideEffects` в корневом lib/package.json — cross-cutting~~ ✅ resolved 2026-06-07

- **Категория:** A2 (sideEffects разметка)
- **Severity:** ~~high~~ → resolved
- **Где:** [lib/package.json:1-58](../../lib/package.json), [lib/button/package.json:1-5](../../lib/button/package.json)

> **Resolution (2026-06-07, cross-cutting).** `"sideEffects": false` добавлен в корневой [lib/package.json](../../lib/package.json) (пробрасывается в `dist/package.json` через `addPackageJson()`). Выбран `false`, а не `["**/*.css","**/*.vue"]`: в опубликованном пакете нет `.vue`/`.css` (SFC скомпилированы в `.mjs`, CSS инжектится в рантайме через lifecycle — `onServerPrefetch`/`onMounted`, не на import-time), поэтому модули чисты на import и `false` безопасен. Дополнительно `copyDependencies()` ([rollup.config.js](../../lib/rollup.config.js)) инъектит `sideEffects:false` в КАЖДЫЙ под-пакет `dist/{name}/package.json` — это включает tree-shaking точечных импортов `fishtvue/{name}` (раньше per-component флаги ставились вручную; теперь единообразно на build-step). Проверено в `dist/button/package.json`. Контракт root-флага зафиксирован [lib/package.test.ts](../../lib/package.test.ts).

### Что найдено

`lib/package.json` и [lib/button/package.json](../../lib/button/package.json) не содержат поле `sideEffects`. Без этой разметки tree-shaker (Rollup, Webpack 5, esbuild) предполагает любой импорт может иметь side-effects и сохраняет его в финальном бандле.

### Почему это проблема

См. Issue 6 — это одна из его причин. Cross-cutting для всех 22 компонентов.

### Что нужно сделать

См. Issue 6, шаги 1-2.

### Acceptance criteria

- [ ] `sideEffects` явно определён в `lib/package.json`.
- [ ] (Опционально) то же — для каждого `lib/{component}/package.json`.

## ~~Issue 9: ESM-only — нет CJS, нет exports map~~ ✅ resolved 2026-06-11

- **Категория:** A4 (ESM/CJS dual-package), A5 (exports map)
- **Severity:** ~~high~~ → resolved
- **Где:** [lib/package.json](../../lib/package.json), [lib/rollup.config.js `buildRootExports()`](../../lib/rollup.config.js), [lib/package.test.ts](../../lib/package.test.ts)

> **Resolution (ESM-only 2026-06-07, exports map 2026-06-11; Issue 5c-b).**
> - **ESM-only ратифицирован ✅** — добавлен `"engines": { "node": ">=18" }` в [lib/package.json](../../lib/package.json); осознанное решение оставаться ESM-only (`.mjs`), `get_CJS_ESM()` выключен. CJS НЕ включаем: аудитория — bundler-based Vue/Nuxt, для которых ESM нативен.
> - **`exports` map (A5) ✅** — корневая карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) из авторитетных rollup-выходов + вложенных `package.json`/`.d.ts`: явный entry на каждый `.mjs` (identity `*.mjs` + extensionless) + bare-dir из вложенного `package.json` (`./button` → import `button.mjs`, types `Button.d.ts` — обходит lowercase-`.mjs`/PascalCase-`.d.ts` асимметрию) + `./*/package.json`. Strict superset, ноль wildcard-неоднозначности. Пререкизит **5c-a** (Menu publish-gap: `MenuItem.vue`/`MenuGroup.vue` не публиковались → переведены на `index.ts`-bundle, зеркало Table). **Verified:** `npm pack` → install → `import.meta.resolve` 19/19 субпутей в pure Node ESM (раньше падали «directory import not supported»); CSS-free субпуты исполняются (self-ref через карту); `tsc --moduleResolution bundler` И `nodenext` exit 0. Контракт — [lib/package.test.ts](../../lib/package.test.ts) (см. [README.md §2.1](./README.md)).

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

- [x] `pnpm pack` → tarball содержит `exports` map (`buildRootExports()`; контракт в `package.test.ts`).
- [x] `import Button from "fishtvue/button"` работает в Nuxt 3 + Vite + TS strict (`import.meta.resolve` 19/19; `tsc` bundler + nodenext).
- [x] ~~Если CJS — `require("fishtvue/button")` тоже работает.~~ — **N/A**: ESM-only ратифицирован, CJS вне scope (`engines.node >=18`).

## ~~Issue 10: Анимации без `prefers-reduced-motion` guard~~ ✅ resolved 2026-05-10

- **Категория:** E29.7 (prefers-reduced-motion)
- **Severity:** ~~low~~
- **Где:** [Button.vue:26](../../lib/button/Button.vue#L26)
- **Resolution:** `transition-colors duration-200` → `motion-safe:transition-colors motion-safe:duration-200`. Tailwind transpилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`, что эквивалентно требуемому поведению.
- **Scope note:** cross-cutting motion-safe для остальных 21 компонента — открытый Wave 10.1 в [README.md](./README.md). Этот fix покрывает только Button; референсы из других issue-доков (label/split/input/alert/pagination/menu/fixwindow/select) на «button.md Issue 10» теперь указывают сюда — паттерн зафиксирован.

### Что найдено

```ts
"transition-colors duration-200"
```

`transition-colors` всегда применяется. Пользователи с `@media (prefers-reduced-motion: reduce)` ожидают мгновенные переходы.

### Почему это проблема

- Пользователи с вестибулярными расстройствами / эпилепсией могут испытывать дискомфорт.
- WCAG 2.3.3 (Animation from Interactions) — требование уровня AAA.

### Acceptance criteria

- [x] Класс `baseClasses` использует `motion-safe:transition-colors motion-safe:duration-200`.
- [x] Тест: `wrapper.find('[data-button]').attributes('class')` содержит `motion-safe:transition-colors`, не содержит unconditional `transition-colors`.
- [ ] DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce` — Button hover не показывает transition (manual).

## ~~Issue 11: ButtonEmits = null — нет нативного click эмита~~ ✅ resolved 2026-05-10

- **Категория:** D26 (консистентность событий)
- **Severity:** ~~low~~
- **Где:** [Button.d.ts:137–144](../../lib/button/Button.d.ts#L137-L144), [Button.vue:390](../../lib/button/Button.vue#L390)
- **Resolution:** `ButtonEmits = { (event: "click", payload: MouseEvent): void }`; `defineEmits<ButtonEmits>()` в SFC; `<button @click="(e) => emit('click', e)">` явно пробрасывает native event через emit-channel — Volar получает корректный type-hint для `@click="handler"`. Additive change: предыдущие подписчики продолжают работать.

### Что найдено

```ts
export declare type ButtonEmits = null
```

Нативный click event пробрасывался через `$attrs` (default Vue behavior), но это не задокументировано в типах. Пользователь не получал type-hint про `@click`.

### Почему это проблема

- Volar/vue-tsc предупреждает «could not declare event 'click'» в редких сценариях.
- Документация [components/button.md](../components/button.md) §6 Events ранее указывала «нет emits» — но `@click` всё-таки доступен.

### Acceptance criteria

- [x] `<Button @click="handler" />` — `handler` получает корректно типизированный `MouseEvent` в Volar.
- [x] Тест: `wrapper.emitted('click')?.[0]?.[0]` это `MouseEvent`.

## ~~Issue 12: Нет именованных слотов `before`/`after`/`start`/`end`~~ ✅ resolved 2026-05-10

- **Категория:** G37 (композиция через slots)
- **Severity:** ~~low~~
- **Где:** [Button.vue:400–407](../../lib/button/Button.vue#L400-L407), [Button.d.ts:118–136](../../lib/button/Button.d.ts#L118-L136)
- **Resolution:** добавлены slots `start` и `end` в не-icon ветке template; `ButtonSlots` расширен с JSDoc; имена `start`/`end` выбраны вместо `before`/`after` для logical-writing-order совместимости с будущим RTL fix (см. Issue 3 выше).

### Что найдено

Шаблон поддерживал только `<slot name="default" />`. Все индикаторы (icon, loading) встроены через props, нет возможности кастомизировать левый/правый блок (например, badge counter, status dot).

### Почему это проблема

- Use-case: «Save (12 unsaved)» — кнопка с badge — невозможно без обёртки.
- Element Plus, Naive UI, PrimeVue — поддерживают `prepend`/`append` слоты.

### Acceptance criteria

- [x] `<Button><template #start><Icons type="Check" /></template>D<template #end>E</template></Button>` рендерит content в порядке S → D → E (text-ordering tests в `Button.test.ts`).

## ~~Issue 13: Не реагирует на componentsStyle ("filled"|"outlined"|"underlined") из global config~~ ✅ resolved 2026-06-12

- **Категория:** L53 (Configuration support)
- **Severity:** ~~high~~ → resolved
- **Где:** [Button.vue](../../lib/button/Button.vue) (computed `componentsStyleMode` + `mode`)

> **Resolution (2026-06-12).** Добавлен computed `componentsStyleMode` ([Button.vue](../../lib/button/Button.vue)): `Button.componentsStyle()` маппится `filled → primary`, `outlined → outline`, `underlined → ghost`. Вставлен в fallback chain `mode`: `props.mode ?? options.mode ?? componentsStyleMode ?? "primary"` — ниже props/componentsOptions, выше литерального default (зеркало Badge/Input/Select/Calendar, см. [README.md §3.2](./README.md)). +6 тестов в `Button.test.ts` (describe `Configuration support`): filled/outlined/underlined mapping, props-override, componentsOptions-override, default.

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

- [x] `app.use(FishtVue, { componentsStyle: "outlined" })` — `<Button>X</Button>` рендерится с `mode="outline"`.
- [x] Per-instance `<Button mode="primary">` перебивает глобальное.

## ~~Issue 14: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-05-11 (cross-cutting)

- **Категория:** L53 (Configuration support)
- **Severity:** ~~high~~ → resolved
- **Где:** [component/index.ts:138](../../lib/component/index.ts#L138) (`Component.setStyle()` guard)

> **Resolution (cross-cutting 2026-05-11; Button regression-test 2026-06-12).** Guard `if (this.__globalConfig?.config?.unstyled) return ""` в `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138)) — одна правка закрывает `unstyled` во ВСЕХ 22 компонентах (см. [component-class.md Issue 6](./component-class.md)). Button наследует автоматически: `classBase` = `Button.setStyle([...])` ([Button.vue:330-341](../../lib/button/Button.vue#L330-L341)) → `""` при `unstyled: true`, корневой `<button>` рендерится без `class`. Добавлен Button-scoped regression-тест ([Button.test.ts](../../lib/button/Button.test.ts) → describe `Configuration support`): `app.use(FishtVue, { unstyled: true })` → root `class` пуст; контраст с `unstyled: false` → `inline-flex` присутствует; `afterEach` чистит `window.FishtVue` (singleton-leak guard).

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

- [x] `unstyled: true` приводит к пустому `class` на корне (regression-тест `Button.test.ts`).
- [ ] ~~Реактивно: переключение в runtime~~ — out of scope: `config.unstyled` задаётся на install; reactive runtime-toggle относится к theme runtime API ([theme.md Issue 1](./theme.md)).

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

> **Status (2026-06-12): deferred.** Фикс не Button-локальный — `darkModeSelector` транслируется в CSS на уровне theme-движка ([theme/uno.ts](../../lib/theme/uno.ts)), это cross-cutting Wave 3.4, отслеживаемая в [theme.md Issue 5](./theme.md). Button наследует поведение автоматически после её закрытия; отдельной правки в `lib/button/` не требуется. Счётчик остаётся открытым (low) до закрытия theme-wave.

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
| `componentsStyle` global   | ✅          | Issue 13 — computed `componentsStyleMode` mapping (`filled→primary` / `outlined→outline` / `underlined→ghost`) в fallback chain `mode`                                                            |
| `unstyled: true`           | ❌          | см. Issue 14 — игнорируется                                                                                                                                                                     |
| Theme tokens vs hardcode   | ⚠️          | через Tailwind `theme-*`/`neutral-*`/`green-*`/`red-*` классы; design tokens из [theme/themes/Aurora.ts](../../lib/theme/themes/Aurora.ts) НЕ применяются напрямую — только через UnoCSS preset |
| Runtime theme switch       | ⚠️          | работает через CSS-переменные `theme-*`, но смена палитры через `updatePrimaryPalette()` требует регенерации CSS — проверить корректность invalidation                                          |
| `t()` для текста           | N/A         | у Button нет UI-текста (slot-based)                                                                                                                                                             |
| Runtime locale switch      | N/A         | —                                                                                                                                                                                               |
| Fallback на defaultLocale  | N/A         | —                                                                                                                                                                                               |

## Dual-API gap

Не применимо — Button не collection-component.
