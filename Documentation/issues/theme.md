---
title: Issues — Theme system
summary: Аудит theme. Issue 1 (runtime theme API usePreset/updatePreset/updatePrimaryPalette/updateSurfacePalette/$dt/palette) ✅ resolved 2026-07-02 через CSS-variable indirection — close Wave 3.3. B10 (surface-токен как 23-й именованный цвет + первый батч из 11 компонентов) ✅ resolved 2026-07-04 — theme-часть Wave 9 закрыта, residual (8 компонентов + Alert-эпик) трекается в issues/README.md. Остаются coverage themes/ (J46), tree-shaking primitive (K52), RTL tokens (F31).
updated: 2026-09-06
audit-checklist: 60-point + Configuration support
source: lib/theme/
related-doc: ../architecture/theme.md
---

# Issues — Theme

## Сводка

| Severity | Count | Categories                                                                                |
| -------- | ----- | ----------------------------------------------------------------------------------------- |
| critical | 0     | —                                                                                         |
| high     | 0     | ~~J46 (themes coverage — Issue 2)~~ ✅ 2026-09-05, ~~A2, A4-5 (Issue 6)~~ ✅ закрыты волной 2 |
| medium   | 0     | ~~F31 (Issue 8)~~ ✅ фантом 2026-09-06, ~~D21 (поле `name` в пресетах)~~ ✅ 2026-09-06, ~~K46 (uno.ts / semantic.ts — Issue 3)~~ ✅ 2026-09-05 |
| low      | 0     | ~~N59 (print)~~ ✅ 2026-09-06 — единый `@media print` в `baseStyle`, ~~E29 (motion)~~ ✅ 2026-09-05 — cross-cutting guard `motionSafe.test.ts` |

~~B10~~ ✅ resolved 2026-07-04 — см. ниже, theme-часть Wave 9 закрыта (residual в issues/README.md).

## ~~Issue 1: Публичный API `usePreset`/`updatePreset`/`$dt`/`palette` НЕ существует — а заявлен в Documentation~~ ✅ resolved 2026-07-02 (Wave 3.3)

- **Категория:** L53 (Configuration support gap)
- **Severity:** ~~high~~
- **Где:** [theme/index.ts](../../lib/theme/index.ts), [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md)

> **Status (2026-07-02): ✅ resolved — close Wave 3.3.** Все 6 функций реализованы и экспортируются из `fishtvue/theme`. **Механизм — CSS-variable indirection, НЕ event-bus/watcher-reinject** (ратифицировано владельцем после анализа: движок — process-wide singleton, live-чтение config в правилах дало бы утечку тем между apps/tenants в SSR и потребовало invalidation-механики):
>
> - Движок эмитит именованные цвета через `rgb(var(--fv-{name}-{tone}, R G B) / α)` ([unoStyle/helpers.ts `resolveColor`](../../lib/theme/unoStyle/helpers.ts), 18 emission-sites в [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts)); слот `theme` — `var(--fv-theme-{tone}, hsla(…))` + `color-mix` для alpha (заодно починен silent-баг: alpha для theme-слота игнорировался, и битый градиентный хвост `hsla(…)00`). Fallback внутри `var()` — запечённое значение: без установленного plugin'а рендер прежний.
> - Install инжектит `:root`-блок токенов live-темы тегом `FishtVueTokens` ([helpers/tokensCss.ts](../../lib/theme/helpers/tokensCss.ts), [config/index.ts:169-172](../../lib/config/index.ts#L169-L172)); runtime-функции переписывают этот ОДИН тег → все смонтированные компоненты перекрашиваются без regen. Пункт «style invalidation mechanism» из roadmap закрыт by design — invalidation не нужен.
> - [usePreset.ts](../../lib/theme/usePreset.ts) (полная замена + `linksTheme`), [updatePreset.ts](../../lib/theme/updatePreset.ts) (`deepMerge` поверх копии), [updatePrimaryPalette.ts](../../lib/theme/updatePrimaryPalette.ts) (брендовый слот = цвет `theme`; пишет `semantic.primary` → `--fv-theme-*`; вход: палитра/`'{indigo.500}'`-refs/одиночный hex), [updateSurfacePalette.ts](../../lib/theme/updateSurfacePalette.ts) (`semantic.surface` → `--fv-surface-*`, light/dark scoping; потребление компонентами — 11/19 закрыто 2026-07-04, см. B10 ниже), [$dt.ts](../../lib/theme/$dt.ts) (metadata lookup), `palette("{blue}")` — копия primitive-шкалы.
> - `semantic.primary` — теперь optional user-слот без дефолта (прежние формулы никем не потреблялись и после `linksTheme` лгали статикой `hsl(0 0 …)`).
> - Тесты: [themeApi.test.ts](../../lib/theme/themeApi.test.ts) (16), [unoStyle/colorVars.test.ts](../../lib/theme/unoStyle/colorVars.test.ts) (18 — спецификация эмиссии), Uno-сюиты перекалиброваны на var-формат. Browser-verified в sandbox: `updatePrimaryPalette({600:"#b91c1c"})` перекрасил смонтированный элемент в rgb(185,28,28), `usePreset(hue 200/70%)` — в rgb(30,124,171).
> - **Residual:** public docs [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) импортируют из `'@fishtvue/themes'` — реальный entry `fishtvue/theme`; `$dt`-пример показывает PrimeVue-формат путей (`'primary.color'`) — реальный формат dot-path от корня темы (`'primitive.emerald.500'`). Public docs (fisht.org) ведутся отдельно и в /tz-канон не входят.

### Что найдено

Публичная Configuration документация [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает:

- `usePreset(MyPreset)` — полная замена пресета.
- `updatePreset({...})` — merge.
- `updatePrimaryPalette({50: ..., 950: ...})`.
- `updateSurfacePalette({...})`.
- `$dt('path.to.token')` — метаданные токена.
- `palette('#color')` — генерация палитры.

В коде lib/theme/:

- index.ts (22 lines) — только linksTheme + NamesTheme exports.
- helpers/themeHandler.ts (41 lines) — internal.
- helpers/palette.ts (65 lines) — есть функция, но не exported в публичный API.
- Нет файлов `usePreset.ts`, `updatePreset.ts`, `$dt.ts`.

### Почему это проблема

- **Documentation lies** — публичные docs обещают API, которого нет в lib.
- Пользователь, доверяющий 2.Theming.md, попытается `import { usePreset } from "fishtvue/theme"` → не найдёт.
- Runtime theme switch (key feature) — не работает как обещано.

### Что нужно сделать

1. Реализовать публичные функции в [lib/theme/](../../lib/theme/):
   - `lib/theme/usePreset.ts`:
     ```ts
     export function usePreset(preset: Theme) {
       const fv = useFishtVue()
       if (!fv) return
       fv.config.theme = linksTheme(preset)
       reinjectStyles()
     }
     ```
   - `lib/theme/updatePreset.ts` — deepMerge с current theme + reinject.
   - `lib/theme/updatePrimaryPalette.ts` — shortcut на updatePreset.
   - `lib/theme/$dt.ts` — token metadata lookup.
   - `lib/theme/palette.ts` — переэкспортировать существующий helper.
2. Экспортировать в [lib/theme/index.ts](../../lib/theme/index.ts).
3. Реinject styles при theme change — каждый Component.initStyle() должен переинжектиться. Сейчас `setStyle` дедуплицирует, нужен mechanism для invalidation.
4. Тесты для каждой функции.
5. Документировать в [Documentation/architecture/theme.md](../architecture/theme.md).

### Acceptance criteria

- [ ] `import { usePreset, updatePreset, $dt, palette } from "fishtvue/theme"` работает.
- [ ] Runtime `usePreset(SapphireTheme)` — все компоненты перерисуются с новой палитрой.
- [ ] Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) и [Documentation/architecture/theme.md](../architecture/theme.md) согласованы.

## ~~Issue 2: themes/{Aurora,Harmony,Sapphire}.ts coverage 0%~~ ✅ resolved 2026-09-05

> **Закрыто тестами** — [themes.test.ts](../../lib/theme/themes/themes.test.ts), 14 кейсов: структура пресета, применение через plugin по `nameTheme`, откат на Aurora при неизвестном имени, состав `NamesTheme`, дефолты `semantic`.
>
> **Главное, что вскрыл тест:** все три пресета **идентичны по содержимому** и различаются только полем `name` — `primitive` и `semantic` во всех трёх это один и тот же импортированный объект. Зафиксировано отдельным кейсом: если пресеты начнут расходиться, он упадёт и заставит обновить документацию, где сейчас написано «три встроенные темы».
>
> Оттуда же вырос [config.md-баг с мутацией дефолтов](./done/config.md) — общий `defaultSemantic` означал, что порча Aurora протекает в Harmony и Sapphire.
>
> **Важно про саму метрику.** Поднять её тестами **нельзя**: у модуля 0 исполняемых инструкций после трансформа (`export default <литерал>` / чистый ре-экспорт), v8 рапортует `0/0 statements`, а репортер рисует это как «0%». Проверено по `coverage-final.json`. На агрегат такие файлы не влияют — они не добавляют ни в числитель, ни в знаменатель. Это тот же класс, что уже описанные «ложные нули — renderless-дети». Issue закрыт по существу: поведение теперь проверяется тестами, а цифра в отчёте останется нулём навсегда.

- **Категория:** J46
- **Severity:** high
- **Где:** [theme/themes/](../../lib/theme/themes/), coverage 0%

### Что найдено

Три preset-файла (Aurora, Harmony, Sapphire) имеют coverage 0%. Тесты не загружают их.

### Почему это проблема

- Изменение в preset (опечатка в token-имени) пройдёт без CI-fail.
- При implementation Issue 1 — runtime preset switch требует unit-тестов.

### Что нужно сделать

1. Тест: импортировать каждый theme, проверять структуру (наличие primitive/semantic/component-tokens).
2. После Issue 1 — тест `usePreset(Aurora)` → проверка применения.
3. Visual-regression: рендер 22 компонентов с каждой темой → snapshot.

## ~~Issue 3: `theme/uno.ts` (3 lines) и `theme/semantic.ts` (19 lines) coverage 0%~~ ✅ resolved 2026-09-05

> Оба покрыты поведенчески: `semantic.ts` — кейсами «не задаёт `primary`» и «держит нулевые дефолты» в [themes.test.ts](../../lib/theme/themes/themes.test.ts); `uno.ts` — это трёхстрочный ре-экспорт `tailwind`, который прогоняется всей сюитой движка ([unoStyle/*.test.ts](../../lib/theme/unoStyle/)).
>
> **Важно про саму метрику.** Поднять её тестами **нельзя**: у модуля 0 исполняемых инструкций после трансформа (`export default <литерал>` / чистый ре-экспорт), v8 рапортует `0/0 statements`, а репортер рисует это как «0%». Проверено по `coverage-final.json`. На агрегат такие файлы не влияют — они не добавляют ни в числитель, ни в знаменатель. Это тот же класс, что уже описанные «ложные нули — renderless-дети». Issue закрыт по существу: поведение теперь проверяется тестами, а цифра в отчёте останется нулём навсегда.

- **Категория:** J46, K46
- **Severity:** medium

### Что найдено

uno.ts всего 3 строки — re-export. semantic.ts 19 строк — токены.

### Что нужно сделать

Audit: что именно re-exported. Если просто public surface — coverage не критичен (test потребителя покрывает). Если содержит логику — добавить unit-test.

## ~~Issue 4: CSS Layers (`@layer fishtvue`) — реализация частична~~ ✅ resolved 2026-06-21

- **Категория:** C17 (CSS layers / @layer)
- **Severity:** ~~high~~
- **Где:** [component/index.ts:159-169](../../lib/component/index.ts#L159-L169) (`__stylesBase`), [config/index.ts:160-167](../../lib/config/index.ts#L160-L167) (base-style)

> **Status (2026-06-21): ✅ resolved (Wave 2).** Component-стили теперь оборачиваются в `@layer fishtvue` по умолчанию. Фикс — в `Component.__stylesBase` else-ветке ([component/index.ts:159-169](../../lib/component/index.ts#L159-L169)), **НЕ** в `useStyle.ts` (как предполагал исходный аудит ниже): `useStyle` — generic injection-helper, и обёртка там дала бы двойной wrap base-style и прямых вызовов (`Theme.test.ts`). `__stylesBase` — единственная точка, где (a) уже была conditional-обёртка для `optionsTheme.layers`, (b) base-style не задет (передаёт собственный `stylesComp`). Канон [dev-patterns.md §3](../dev-patterns.md). Контракт: [Component.test.ts](../../lib/component/Component.test.ts) `default __stylesBase wraps component CSS in @layer fishtvue`.

### Что найдено

```ts
BaseStylesComponent.initStyle(() =>
  FishtVue.config.optionsTheme?.layers
    ? `@layer ${FishtVue.config.optionsTheme?.layers};
       @layer fishtvue {${baseLayer}}`
    : `@layer fishtvue {${baseLayer}}`
)
```

Только base-style использует `@layer`. Component-уровневые стили (через `Component.setStyle` → `useStyle.ts`) — НЕ обёрнуты в layer. Documentation 2.Theming.md обещает «Управление приоритетом стилей через CSS @layer», но компоненты этим не пользуются.

### Что сделано (2026-06-21)

1. [component/index.ts:159-169](../../lib/component/index.ts#L159-L169) — else-ветка `__stylesBase` (когда `optionsTheme.layers` не задан) теперь оборачивает css в `@layer fishtvue {${css}}`, зеркаля base-style ([config/index.ts:166](../../lib/config/index.ts#L166)). Раньше возвращала сырой css вне слоя → все 22 component-стиля были вне cascade-layer (base-style — внутри, рассинхрон).
2. `optionsTheme.layers` (truthy-ветка) — без изменений: `@layer ${layers}; @layer fishtvue {${css}}` (order-декларация + слой).
3. Тест: [Component.test.ts](../../lib/component/Component.test.ts) `default __stylesBase wraps component CSS in @layer fishtvue (Wave 2 — theme Issue 4)` — дефолтный component-стиль содержит `@layer fishtvue` + зарегистрированное правило внутри слоя. Консумерский CSS вне layer теперь предсказуемо перебивает FishtVue (cascade-4).

## ~~Issue 5: `darkModeSelector` — partially honored~~ ✅ resolved 2026-06-12

- **Категория:** B11
- **Severity:** high
- **Где:** [theme/unoStyle/tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95), [component/index.ts:150](../../lib/component/index.ts#L150)

> **Status (2026-06-12): ✅ resolved.** Движок **уже** транслировал `darkModeSelector` — фикс приземлился ещё в `d120e4e` (Jan 2025), но не был ни покрыт тестом, ни сверен с аудитом (этот файл утверждал ❌, тогда как [architecture/theme.md](../architecture/theme.md) описывал фичу как работающую — внутреннее противоречие). Контракт теперь зафиксирован тестами; правок движка не потребовалось.

### Что найдено (исходный аудит)

Documentation [2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает: `optionsTheme.darkModeSelector: "html.dark"` — настраиваемый dark-mode selector. Аудит считал, что `dark:*` хардкоден на media-query и не реагирует на config.

**По факту:** `Component.setStyle` прокидывает `darkSelector: this.__globalOptionsTheme?.darkModeSelector ?? ""` ([component/index.ts:150](../../lib/component/index.ts#L150)), а движок `tailwind()` подменяет дефолтный `@media (prefers-color-scheme: dark)` ([unoStatic.ts:561](../../lib/theme/unoStyle/unoStatic.ts#L561)) на этот селектор, когда он непустой ([tailwind.ts:95](../../lib/theme/unoStyle/tailwind.ts#L95)). Это в точности канон [dev-patterns.md](../dev-patterns.md) («движок `tailwind()` уже знает media/variant-фичи; не патчим theme-движок»).

### Что сделано

1. ~~UnoCSS preset должен генерировать `dark:*` варианты на основе `darkModeSelector` config.~~ ✅ уже реализовано (`tailwind.ts:95` + `setStyle:150`), теперь покрыто тестом.
2. **Reactive** — при смене `darkModeSelector` в рантайме через `usePreset` варианты НЕ регенерируются (дедуп `listOfStyledComponents` не инвалидируется). Это часть **Issue 1** (runtime theme switch / invalidation, выше в этом файле), не B11. Остаётся открытым там.
3. ~~Тест: `<html data-theme="dark">` + `darkModeSelector: "[data-theme='dark']"` — компонент рендерится в dark mode.~~ ✅ [lib/theme/darkModeSelector.test.ts](../../lib/theme/darkModeSelector.test.ts) (probe-компонент через plugin-config) + engine-кейсы в [Uno.test.ts](../../lib/theme/unoStyle/Uno.test.ts) (`describe("Dark mode selector …")`).

> **Примечание:** `lightModeSelector` (типизирован в [OptionsTheme](../../lib/config/FishtVue.d.ts#L179)) пока НЕ транслируется — light это дефолт, dark — override; отдельная фича, вне B11.

## ~~Issue 6: SSR styles + sideEffects + unstyled~~ ✅ resolved (наследуется от волн 2 и 3.1)

Все четыре корневых issue закрыты: [button.md Issue 1](./button.md) (SSR-инжекция) ✅ 2026-06-07, [Issue 8](./button.md) (`sideEffects`) ✅ 2026-06-07, [Issue 9](./button.md) (exports map) ✅ 2026-06-11, [Issue 14](./button.md) (`unstyled`) ✅ 2026-05-11.

## ~~Issue 7: theme/primitive.ts 761 lines — gigantic palette monolith~~ ❌ wontfix 2026-09-06

- **Категория:** K52, A1 (tree-shaking)
- **Severity:** ~~medium~~ → wontfix (решение R10)

### Что найдено

[theme/primitive.ts](../../lib/theme/primitive.ts) — 761 строка с palette definitions для всех цветов (50-950 × 20+ цветов). Импорт тянет всё.

### Что предлагалось

1. Разбить на per-color файлы: `lib/theme/primitives/blue.ts`, `red.ts`, etc.
2. Re-export через index.ts с `sideEffects: false` (после fix [button.md Issue 8](./button.md)).
3. Tree-shaker сможет удалить неиспользуемые палитры.

### Почему wontfix (решение R10, 2026-09-06)

Предпосылка «tree-shaker удалит неиспользуемые палитры» **не выполняется** в этой архитектуре. Движок собирает цветовые regex динамически — `Object.keys(colors).join("|")` в [unoRules.ts](../../lib/theme/unoStyle/unoRules.ts). То есть объект `colors` целиком нужен в рантайме независимо от того, какие классы использует потребитель: имя цвета появляется в regex, а не в импорте. Разбиение на файлы дало бы 22 модуля, которые всё равно импортируются все до одного — потребовалось бы переделывать сам механизм резолва.

Выигрыш при этом съедается сжатием: палитра — однородный текст из hex-литералов, gzip жмёт её в разы. Цена — 22 файла вместо одного и переписанный механизм ради килобайтов.

Файл с тех пор ещё вырос: 2026-09-06 в него добавлены четыре semantic-слота интентов ([alert.md Issue 9](./alert.md)). Это подтверждает выбор с другой стороны — при per-color-разбиении каждый новый слот стоил бы отдельного файла и правки индекса, а сейчас это добавление ключа.

## ~~Issue 8: RTL не учитывается в theme-tokens~~ ✅ фантом, снят 2026-09-06

- **Категория:** F31
- **Severity:** ~~medium~~

Формулировка: «Theme-токены типа `border-left-radius` хардкоден. Должны быть logical (`border-inline-start-radius`)».

**Проверка показала, что таких токенов нет.** В [primitive.ts](../../lib/theme/primitive.ts) `rounded` — это направление-нейтральная шкала скаляров (`xs: "2px"`, `lg: "8px"`), а не набор `border-*-radius`. Ключи `ml`/`mr`/`pl`/`pr` в шкалах `m`/`p` — имена словаря длин, а не CSS-свойства; при этом сами шкалы движком **не потребляются**: [tokensCss.ts](../../lib/theme/helpers/tokensCss.ts) эмитит в tokens-тег только палитру, а margin/padding резолвятся правилами `unoRules.ts` из `specialValues`.

Направление живёт не в токенах, а в **именах утилит** движка (`rounded-ss-`, `border-s-`, `ps-`/`pe-`, `ms-`/`me-`), и логические формы там поддержаны — зафиксировано в [uno-engine.md](./uno-engine.md) (раздел «что работает корректно»). Гейтить в теме нечего.

Тот же класс, что три фантомные позиции, снятые в T11 (Button, Table, `E29.7` у Calendar/TextEditor): счётчик считал категорию, за которой не стоит секции.

## ~~Issue 9: prefers-reduced-motion / print~~ ✅ resolved

- **Категория:** E29, N59
- **Severity:** ~~low~~

Обе половины закрыты cross-cutting-заходами, а не правками темы:

- **E29 (motion)** — 2026-09-05 построчный аудит нашёл два негейтнутых перехода (InputLayout, Switch) и закрыл их, а guard [motionSafe.test.ts](../../lib/motionSafe.test.ts) валит сборку на любом новом. Ручная сверка больше не нужна.
- **N59 (print)** — 2026-09-06 заведён единый `@media print` в [baseStyle.ts](../../lib/config/baseStyle.ts) (решение R21) вместо покомпонентных `print:`-классов. Подробности — в [nuxt-module.md](./nuxt-module.md) не входят; разбор причины см. [printStyles.test.ts](../../lib/config/printStyles.test.ts).

## ~~D21: поле `name` в пресетах не объявлено в типе темы~~ ✅ resolved 2026-09-06

- **Категория:** D21 (типы расходятся с рантаймом)
- **Severity:** ~~medium~~
- **Где (was):** [themes/Aurora.ts](../../lib/theme/themes/Aurora.ts), Harmony, Sapphire

Все три пресета несли поле `name`, которого нет в типе темы (`FishtVueConfiguration["theme"]` = `DeepPartial<{ primitive, semantic }>`), и проносили его через type assertion. Тип врал про содержимое объекта, а тесты, чтобы прочитать имя активной темы, лезли в `config.theme.name` — поле, которого по типам не существует.

**Resolution (решение R28).** Поле снято с пресетов. Идентичность активной темы живёт в `config.optionsTheme.nameTheme`, где она типизирована как `keyof typeof NamesTheme`. `install()` **нормализует** это значение до фактически применённой темы: опечатка в `nameTheme` больше не остаётся в конфиге как «активная тема» при том, что подставилась Aurora. Резолв имени вынесен в отдельную функцию `resolveThemeName()`.

Заодно закрыт второй, более заметный дефект: **все три темы выглядели одинаково**. Они делили один `defaultSemantic` с `customThemeColor: 0`, то есть брендовый слот у всех был серым — «три темы» различались строкой `name` и ничем больше. Теперь каждая задаёт собственный оттенок (Aurora `25deg`, Harmony `152deg`, Sapphire `217deg`), а вся остальная палитра остаётся общей по ссылке. Контракт «различаются ТОЛЬКО брендовым слотом, и оттенки не повторяются» зафиксирован в [themes.test.ts](../../lib/theme/themes/themes.test.ts).

## ~~Issue 10: B10 — компоненты не потребляют surface-токен~~ ✅ resolved 2026-07-04

- **Категория:** B10
- **Severity:** ~~medium~~
- **Где:** [primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317), [Theme.d.ts:163-187](../../lib/theme/Theme.d.ts#L163-L187)

> **Status (2026-07-04): ✅ resolved (theme-часть Wave 9).** `updateSurfacePalette` (Issue 1, ✅ 2026-07-02) писал `semantic.surface`/`--fv-surface-{tone}`, но ни один компонент не ссылался на `bg-surface-*`/`text-surface-*`/etc. — `surface` не был именем в `primitive.ts.colors`, поэтому такие классы были бы fail-closed-дропнуты движком. Фикс — добавлен `surface` как 23-й именованный цвет (дефолт — точная копия `gray`), **без правок** `unoStyle/unoRules.ts` (цветовые regex собираются динамически через `Object.keys(colors).join("|")` — новое имя подхватывается автоматически). Тест: [unoStyle/colorVars.test.ts](../../lib/theme/unoStyle/colorVars.test.ts) `describe("surface slot — structural token, same mechanism as named colors (Wave 9)")`.
>
> Первый батч из 11 компонентов (Menu, Accordion, Icons, Select, TextEditor, Separator, Calendar, Input, Form, Label, Aria) мигрирован на `surface-*` вместо хардкода `gray-*`/`stone-*`/`neutral-*`/`slate-*`/`zinc-*` — см. соответствующие `Documentation/issues/<name>.md`.
>
> **Residual (не входит в этот резолв):** 8 компонентов, ранее закрывших свой номерной B10 через `forced-colors`+theme-accent, но осознанно оставивших структурные нейтрали (Badge, Switch, Split, Pagination, Table, InputLayout, FixWindow, Dialog) — отдельное подтверждение; цвета-интенты Alert (success/warning/info/error) — отдельный epic, нужны новые semantic-слоты + runtime API. Обе темы трекаются в [issues/README.md](./README.md), не здесь.

## Cross-cutting: Configuration support

| Настройка                        | Поддержано? | Комментарий                                                                 |
| -------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `optionsTheme.nameTheme`         | ✅          | Aurora/Harmony/Sapphire choice                                              |
| `optionsTheme.prefix`            | ⚠️          | через UnoCSS preset — проверить                                             |
| `optionsTheme.lightModeSelector` | ❌          | типизирован, но НЕ транслируется в движок (light — дефолт; не входит в B11) |
| `optionsTheme.darkModeSelector`  | ✅          | Issue 5 — `setStyle:150` → `tailwind.ts:95`, test-locked                    |
| `optionsTheme.layers`            | ✅          | base + component styles (Issue 4 ✅ 2026-06-21)                                                 |
| `optionsTheme.isNotMinifyCSS`    | ⚠️          | проверить применение                                                        |
| `usePreset` runtime              | ✅          | Issue 1 ✅ 2026-07-02 — CSS-variable indirection, tokens-тег `FishtVueTokens` |
| `updatePreset` runtime           | ✅          | Issue 1 ✅ 2026-07-02                                                        |
| `updatePrimaryPalette` runtime   | ✅          | Issue 1 ✅ 2026-07-02 — брендовый слот = цвет `theme`                        |
| `updateSurfacePalette` runtime   | ✅          | Issue 1 ✅ 2026-07-02 — vars+config; потребление компонентами — B10 ✅ 2026-07-04 (11/19), residual в issues/README.md |
| `$dt`                            | ✅          | Issue 1 ✅ 2026-07-02                                                        |
| `palette`                        | ✅          | экспортирован + `'{blue}'`-форма (Issue 1 ✅ 2026-07-02)                     |

## Dual-API gap

Не применимо.
